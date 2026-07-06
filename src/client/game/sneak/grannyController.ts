import Phaser from 'phaser';
import { applyGrannyTextureFilters, playGrannyWalk } from '../grannyAnimator.js';
import {
  PATROL_MIN_STEP,
  PATROL_PAUSE_MAX_MS,
  PATROL_PAUSE_MIN_MS,
  PATROL_SPEED,
} from './constants.js';
import type { GrannyObject } from './types.js';

export class GrannyController {
  private dir = 1;
  private minX = 120;
  private maxX = 840;

  /** True if granny actually moved this frame (drives walk vs idle animation). */
  moved = false;

  /** Per-room difficulty multiplier applied to the lazy patrol amble speed. */
  patrolSpeedMul = 1;

  private patrolTargetX: number | null = null;
  private pauseUntil = 0;

  granny!: GrannyObject;

  constructor(private scene: Phaser.Scene) {}

  get facing(): number {
    return this.dir;
  }

  get x(): number {
    return this.granny?.x ?? 0;
  }

  setup(editorGranny: GrannyObject | undefined, groundTop: number, roomLeft: number, roomRight: number): void {
    if (editorGranny) {
      this.granny = editorGranny;
      this.granny.setName('granny');
      this.granny.setDepth(12);
      applyGrannyTextureFilters(this.scene);

      if (!this.granny.body) this.scene.physics.add.existing(this.granny);
      const body = this.granny.body as Phaser.Physics.Arcade.Body;
      body.moves = true;
      body.setAllowGravity(false);
      body.setImmovable(true);

      this.pinToFloor(groundTop);
      this.syncBody();
      this.initPatrolDirection();
      return;
    }

    const x = (roomLeft + roomRight) / 2;
    const placeholder = this.scene.add
      .rectangle(x, groundTop - 55, 56, 110, 0xc987b0)
      .setStrokeStyle(3, 0x7a3f63)
      .setDepth(9);
    this.scene.physics.add.existing(placeholder);
    this.granny = placeholder as unknown as Phaser.Physics.Arcade.Image;
    const phBody = this.granny.body as Phaser.Physics.Arcade.Body;
    phBody.moves = true;
    phBody.setAllowGravity(false);
    phBody.setImmovable(true);
    this.initPatrolDirection();
  }

  setPatrolFromFloor(floors: Phaser.GameObjects.Rectangle[], roomLeft: number, roomRight: number): void {
    if (floors.length > 0) {
      let left = Infinity;
      let right = -Infinity;
      for (const floor of floors) {
        const b = floor.getBounds();
        left = Math.min(left, b.left);
        right = Math.max(right, b.right);
      }
      const pad = Math.max(60, (right - left) * 0.04);
      // Keep granny inside the visible room even if the floor collider is wider.
      this.minX = Math.max(left + pad, roomLeft + pad);
      this.maxX = Math.min(right - pad, roomRight - pad);
      if (this.minX >= this.maxX) {
        this.minX = roomLeft + pad;
        this.maxX = roomRight - pad;
      }
      return;
    }

    const pad = 80;
    this.minX = roomLeft + pad;
    this.maxX = roomRight - pad;
  }

  /** Hold position and face away from the cat while the entry grace period runs. */
  beginEntryGrace(until: number, groundTop: number, faceAwayFromX: number): void {
    this.pauseUntil = until;
    this.patrolTargetX = null;
    this.moved = false;
    this.pinToFloor(groundTop);
    this.syncBody();
    this.dir = this.granny.x <= faceAwayFromX ? -1 : 1;
    this.setFlip(this.dir < 0);
    this.stopWalk();
  }

  /** Slow, lazy wandering: amble to a random spot, pause and look, repeat. */
  patrol(delta: number, groundTop: number): void {
    if (!this.granny?.body) return;

    const now = this.scene.time.now;

    if (this.pauseUntil > now) {
      this.moved = false;
      this.settle(groundTop);
      return;
    }

    if (this.patrolTargetX === null || this.reached(this.patrolTargetX, 6)) {
      this.pauseUntil = now + Phaser.Math.Between(PATROL_PAUSE_MIN_MS, PATROL_PAUSE_MAX_MS);
      this.patrolTargetX = this.pickWanderTarget();
      this.moved = false;
      this.settle(groundTop);
      return;
    }

    this.pursue(delta, groundTop, this.patrolTargetX, PATROL_SPEED * this.patrolSpeedMul);
  }

  private pickWanderTarget(): number {
    const current = this.granny?.x ?? (this.minX + this.maxX) / 2;
    for (let i = 0; i < 6; i++) {
      const candidate = Phaser.Math.Between(this.minX, this.maxX);
      if (Math.abs(candidate - current) >= PATROL_MIN_STEP) return candidate;
    }
    return Phaser.Math.Clamp(
      current + (Math.random() < 0.5 ? -1 : 1) * PATROL_MIN_STEP,
      this.minX,
      this.maxX,
    );
  }

  /** Walk toward a target x at the given speed (stays within floor bounds). */
  pursue(delta: number, groundTop: number, targetX: number, speed: number): void {
    if (!this.granny?.body) return;

    const gap = targetX - this.granny.x;
    if (Math.abs(gap) > 6) {
      const dir = Math.sign(gap);
      this.dir = dir;
      const nextX = this.granny.x + dir * speed * (delta / 1000);
      this.granny.x = Phaser.Math.Clamp(nextX, this.minX, this.maxX);
      this.moved = true;
    } else {
      // Face the target while standing next to it.
      this.dir = Math.sign(gap) || this.dir;
      this.moved = false;
    }

    this.settle(groundTop);
  }

  /** True once granny is essentially on top of the target x. */
  reached(targetX: number, tolerance = 10): boolean {
    return Math.abs((this.granny?.x ?? 0) - targetX) <= tolerance;
  }

  private settle(groundTop: number): void {
    this.pinToFloor(groundTop);
    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.syncBody();
    this.setFlip(this.dir < 0);
  }

  animateWalk(): void {
    playGrannyWalk(this.scene, this.granny);
  }

  /** Freeze on the current frame while standing still (idle look). */
  stopWalk(): void {
    const g = this.granny;
    if (g instanceof Phaser.Physics.Arcade.Sprite) g.anims?.pause();
  }

  private initPatrolDirection(): void {
    if (this.granny.x > this.maxX) {
      this.granny.x = this.maxX;
      this.dir = -1;
    } else if (this.granny.x < this.minX) {
      this.granny.x = this.minX;
      this.dir = 1;
    } else {
      const mid = (this.minX + this.maxX) / 2;
      this.dir = this.granny.x <= mid ? 1 : -1;
    }
  }

  private pinToFloor(groundTop: number): void {
    const b = this.granny.getBounds();
    this.granny.y += groundTop - b.bottom;
  }

  private syncBody(): void {
    const body = this.granny.body as Phaser.Physics.Arcade.Body & { refreshBody?: () => void };
    if (typeof body.refreshBody === 'function') body.refreshBody();
    else body.updateFromGameObject();
  }

  private setFlip(facingLeft: boolean): void {
    if (typeof (this.granny as Phaser.GameObjects.Sprite).setFlipX === 'function') {
      (this.granny as Phaser.GameObjects.Sprite).setFlipX(facingLeft);
      return;
    }
    const sx = Math.abs(this.granny.scaleX) || 1;
    this.granny.scaleX = facingLeft ? -sx : sx;
  }
}

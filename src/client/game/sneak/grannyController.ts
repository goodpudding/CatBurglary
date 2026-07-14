import Phaser from 'phaser';
import { applyGrannyTextureFilters, playGrannyWalk } from '../grannyAnimator.js';
import {
  PATROL_MIN_STEP,
  PATROL_PAUSE_MAX_MS,
  PATROL_PAUSE_MIN_MS,
  PATROL_SPEED,
} from './constants.js';
import type { GrannyObject } from './types.js';

const MOVE_STOP_DIST = 8;
/** Ignore tiny left/right wobble so granny does not flip every frame when close. */
const FACE_DEADZONE = 18;

export class GrannyController {
  private dir = 1;
  private facingLeft = false;
  private minX = 120;
  private maxX = 840;

  /** True if granny actually moved this frame (drives walk vs idle animation). */
  moved = false;

  /** Per-room difficulty multiplier applied to the lazy patrol amble speed. */
  patrolSpeedMul = 1;

  /** Base patrol amble speed (px/s). Set from the granny prefab's tuning. */
  patrolSpeedBase = PATROL_SPEED;

  private patrolTargetX: number | null = null;
  private pauseUntil = 0;
  private entryTargetX: number | null = null;
  private enteringRoom = false;
  private entryMinX = 0;

  granny!: GrannyObject;

  constructor(private scene: Phaser.Scene) {}

  get facing(): number {
    return this.dir;
  }

  get x(): number {
    return this.granny?.x ?? 0;
  }

  /** Leftmost x granny can walk to (pursue/patrol clamp). */
  get patrolMinX(): number {
    return this.minX;
  }

  /** Rightmost x granny can walk to (pursue/patrol clamp). */
  get patrolMaxX(): number {
    return this.maxX;
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
      this.syncHitbox();
      this.initPatrolDirection();
      this.applyFacing(this.dir < 0);
      // Settle the walk sheet (and any equipped granny skin) NOW, before she
      // moves — rebuilding the walk anim mid-run pops her texture/size.
      playGrannyWalk(this.scene, this.granny);
      this.syncHitbox();
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

  /** Hold off-screen left, then walk to the editor spawn once the delay ends. */
  stageOffscreenEntry(
    roomLeft: number,
    groundTop: number,
    editorX: number,
    offscreenPad: number,
  ): void {
    this.entryTargetX = editorX;
    this.enteringRoom = true;
    this.entryMinX = roomLeft - offscreenPad;
    this.patrolTargetX = null;
    this.pauseUntil = 0;
    this.granny.x = this.entryMinX;
    this.dir = 1;
    this.pinToFloor(groundTop);
    this.syncHitbox();
    this.applyFacing(false);
    this.stopWalk();
    this.moved = false;
  }

  isEnteringRoom(): boolean {
    return this.enteringRoom;
  }

  /** Walk from off-screen to the editor spawn; returns true once she has arrived. */
  enterRoom(delta: number, groundTop: number, speed: number): boolean {
    if (!this.enteringRoom || this.entryTargetX === null) return true;

    const targetX = this.entryTargetX;
    const gap = targetX - this.granny.x;
    if (Math.abs(gap) > MOVE_STOP_DIST) {
      this.dir = Math.sign(gap);
      const nextX = this.granny.x + this.dir * speed * (delta / 1000);
      this.granny.x = Phaser.Math.Clamp(nextX, this.entryMinX, this.maxX);
      this.moved = true;
    } else {
      if (Math.abs(gap) > FACE_DEADZONE) this.dir = Math.sign(gap);
      this.moved = false;
      this.enteringRoom = false;
      this.entryTargetX = null;
    }

    this.settle(groundTop);
    return !this.enteringRoom;
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

    this.pursue(delta, groundTop, this.patrolTargetX, this.patrolSpeedBase * this.patrolSpeedMul);
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
    const dt = delta / 1000;

    if (Math.abs(gap) > MOVE_STOP_DIST) {
      this.dir = Math.sign(gap);
      const nextX = this.granny.x + this.dir * speed * dt;
      this.granny.x = Phaser.Math.Clamp(nextX, this.minX, this.maxX);
      this.moved = true;
    } else if (Math.abs(gap) > 1) {
      // Creep the last few pixels instead of snapping idle/walk every frame.
      this.dir = Math.sign(gap);
      this.granny.x += this.dir * Math.min(speed * dt, Math.abs(gap));
      this.moved = true;
    } else if (Math.abs(gap) > FACE_DEADZONE) {
      this.dir = Math.sign(gap);
      this.moved = false;
    } else {
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
    if (g instanceof Phaser.Physics.Arcade.Sprite && g.anims?.isPlaying) g.anims.pause();
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
    const body = this.granny.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    // Use the physics feet, not getBounds() — walk frames change visual height each tick.
    const delta = groundTop - body.bottom;
    if (Math.abs(delta) < 0.5) return;
    this.granny.y += delta;
    body.updateFromGameObject();
  }

  /** Feet-aligned collider tuned to match Granny_Walking-Sheet across all granny sheets. */
  private syncHitbox(): void {
    if (!(this.granny instanceof Phaser.Physics.Arcade.Sprite)) {
      this.syncBody();
      return;
    }

    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    const frameW = this.granny.width;
    const frameH = this.granny.height;
    if (frameW <= 0 || frameH <= 0) return;

    const bodyW = Math.max(8, (frameW * 11) / 24);
    const bodyH = Math.max(10, (frameH * 28) / 29);
    body.setSize(bodyW, bodyH, false);
    body.setOffset((frameW * 5) / 24, 0);
    this.syncBody();
  }

  private syncBody(): void {
    const body = this.granny.body as Phaser.Physics.Arcade.Body & { refreshBody?: () => void };
    if (typeof body.refreshBody === 'function') body.refreshBody();
    else body.updateFromGameObject();
  }

  private applyFacing(facingLeft: boolean): void {
    // Prime opposite so the first facing always applies (facingLeft defaults to false).
    this.facingLeft = !facingLeft;
    this.setFlip(facingLeft);
  }

  private setFlip(facingLeft: boolean): void {
    if (facingLeft === this.facingLeft) return;
    this.facingLeft = facingLeft;

    // The pink granny sheets (granny-2-sheet) face RIGHT at flipX=false, so
    // mirror only when walking left. (The old wizard sheet faced left, which
    // is why this used to be inverted — that made her moonwalk.)
    if (typeof (this.granny as Phaser.GameObjects.Sprite).setFlipX === 'function') {
      (this.granny as Phaser.GameObjects.Sprite).setFlipX(facingLeft);
      this.syncBody();
      return;
    }
    const sx = Math.abs(this.granny.scaleX) || 1;
    this.granny.scaleX = facingLeft ? -sx : sx;
    this.syncBody();
  }
}

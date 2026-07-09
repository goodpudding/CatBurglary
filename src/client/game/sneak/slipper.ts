import Phaser from 'phaser';
import {
  SLIPPER_THROW_COOLDOWN_MS,
  SLIPPER_THROW_RANGE,
  SLIPPER_THROW_SPEED,
} from './constants.js';
import type { GrannyTuning } from './grannyTuning.js';

type ArcadeImage = Phaser.Physics.Arcade.Image;

/**
 * Granny's single slipper: she can throw it in an arc while alert, then must
 * walk over to the fallen slipper and pick it up before she can throw again.
 */
export class SlipperSystem {
  hasSlipper = true;

  private projectile: ArcadeImage | undefined;
  private dropped: ArcadeImage | undefined;
  private throwReadyAt = 0;

  constructor(
    private scene: Phaser.Scene,
    private onHitCat: () => void,
    private worldScale = 1,
    private throwRangeMul = 1,
    private tuning?: GrannyTuning,
    /**
     * Granny's walkable x range. The slipper's rest position is clamped into
     * it so she can always reach what she threw (a slipper at the wall used
     * to strand her in retrieve mode forever).
     */
    private getReach?: () => { min: number; max: number },
  ) {}

  /** x the retrieving granny should walk to, or null if nothing to fetch. */
  get retrieveTargetX(): number | null {
    return this.dropped ? this.dropped.x : null;
  }

  /** Granny has no slipper and one is lying on the ground to fetch. */
  get needsRetrieve(): boolean {
    return !this.hasSlipper && !!this.dropped;
  }

  private get inFlight(): boolean {
    return !!this.projectile;
  }

  tryThrow(
    granny: { x: number; y: number; displayHeight: number },
    facing: number,
    cat: Phaser.GameObjects.Sprite,
  ): void {
    if (!this.hasSlipper || this.inFlight) return;
    if (this.scene.time.now < this.throwReadyAt) return;
    const throwRange = this.tuning?.throwRange ?? SLIPPER_THROW_RANGE;
    if (Math.abs(cat.x - granny.x) > throwRange * this.worldScale * this.throwRangeMul) return;

    const startX = granny.x;
    const startY = granny.y - granny.displayHeight * 0.2;
    const dirSign = Math.sign(cat.x - startX) || Math.sign(facing) || 1;

    const proj = this.makeSlipper(startX, startY);
    const body = proj.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);

    const gravity = this.scene.physics.world.gravity.y || 1400;
    const throwSpeed = this.tuning?.throwSpeed ?? SLIPPER_THROW_SPEED;
    const vx = dirSign * throwSpeed * this.worldScale;
    const dx = cat.x - startX;
    const dy = cat.y - startY;
    const t = Phaser.Math.Clamp(Math.abs(dx / (vx || 1)), 0.25, 1.4);
    const vy = Phaser.Math.Clamp((dy - 0.5 * gravity * t * t) / t, -900, 200);

    body.setVelocity(vx, vy);
    // Spin end-over-end in the direction of travel.
    if (typeof body.setAngularVelocity === 'function') body.setAngularVelocity(dirSign * 520);
    this.projectile = proj;
    this.hasSlipper = false;
  }

  update(groundTop: number, cat: Phaser.GameObjects.Sprite): void {
    const proj = this.projectile;
    if (!proj) return;

    if (Phaser.Geom.Intersects.RectangleToRectangle(proj.getBounds(), cat.getBounds())) {
      this.onHitCat();
      this.land(proj, groundTop);
      return;
    }

    const bounds = this.scene.physics.world.bounds;
    if (proj.y >= groundTop - 4 || proj.x <= bounds.x + 2 || proj.x >= bounds.right - 2) {
      this.land(proj, groundTop);
    }
  }

  /** Called when granny (in retrieve mode) reaches the dropped slipper. */
  pickUpIfNear(grannyX: number): void {
    if (this.hasSlipper || !this.dropped) return;
    if (Math.abs(grannyX - this.dropped.x) > 22) return;

    this.dropped.destroy();
    this.dropped = undefined;
    this.hasSlipper = true;
    this.throwReadyAt =
      this.scene.time.now + (this.tuning?.throwCooldownMs ?? SLIPPER_THROW_COOLDOWN_MS);
  }

  private land(proj: ArcadeImage, groundTop: number): void {
    let x = Phaser.Math.Clamp(
      proj.x,
      this.scene.physics.world.bounds.x + 10,
      this.scene.physics.world.bounds.right - 10,
    );

    // Keep the slipper inside granny's walkable band so she can pick it up.
    const reach = this.getReach?.();
    if (reach) x = Phaser.Math.Clamp(x, reach.min + 4, reach.max - 4);
    proj.destroy();
    this.projectile = undefined;

    const dropped = this.makeSlipper(x, groundTop - 6);
    const body = dropped.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    if (typeof body.setAngularVelocity === 'function') body.setAngularVelocity(0);
    body.moves = false;
    dropped.setAngle(0);
    dropped.setAlpha(0.95);
    this.dropped = dropped;
  }

  private makeSlipper(x: number, y: number): ArcadeImage {
    if (this.scene.textures.exists('slipper')) {
      const img = this.scene.physics.add.image(x, y, 'slipper');
      img.setDepth(11);
      img.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      // The 'slipper' spritesheet framing is broken (loads as one wide base image),
      // so crop to a single ~16px cell instead of showing the whole strip.
      const cell = Math.min(16, img.height);
      img.setCrop(0, 0, cell, img.height);
      img.setOrigin(0.5, 0.5);
      const target = 22 * this.worldScale + 10;
      img.setScale(target / cell);
      // Shrink the physics body to the visible cell so hits feel fair.
      const body = img.body as Phaser.Physics.Arcade.Body;
      body.setSize(cell, img.height, true);
      return img;
    }

    // Fallback: a little pink slipper blob if the texture failed to load.
    const g = this.scene.add.rectangle(x, y, 22, 10, 0xd98cc0).setStrokeStyle(2, 0x7a3f63);
    g.setDepth(11);
    this.scene.physics.add.existing(g);
    return g as unknown as ArcadeImage;
  }

  destroy(): void {
    this.projectile?.destroy();
    this.dropped?.destroy();
  }
}

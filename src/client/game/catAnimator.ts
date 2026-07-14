import Phaser from 'phaser';
import { getCatVisualId, type CatVisualId } from '../assets/catCatalog.js';

/** Drives cat anims from `cats/cat-animations.json` (loaded via asset pack). */
export class CatAnimator {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private visualId: CatVisualId;
  private state: 'idle' | 'walk' = 'idle';

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite, catId: string) {
    this.scene = scene;
    this.sprite = sprite;
    this.visualId = getCatVisualId(catId);
    sprite.on(Phaser.Animations.Events.ANIMATION_START, this.keepCrisp, this);
    this.play('idle');
  }

  private keepCrisp = (): void => {
    this.sprite.texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
  };

  update(moving: boolean, onGround: boolean): void {
    if (!onGround) {
      if (this.state !== 'walk') {
        this.state = 'walk';
        this.play('walk');
      }
      return;
    }

    const next: 'idle' | 'walk' = moving ? 'walk' : 'idle';
    if (this.state === next) return;

    this.state = next;
    this.play(next);
  }

  setFlip(facingLeft: boolean): void {
    this.sprite.setFlipX(!facingLeft);
  }

  private play(kind: 'idle' | 'walk'): void {
    // The Player prefab's cats are CatVisual instances carrying editor-assigned
    // animation keys (idleAnim/walkAnim in Phaser Editor) — those win, so each
    // cat plays exactly what was picked in the Inspector. Fall back to the
    // conventional `<visual>-<kind>` keys for sprites without assignments.
    const assigned = (this.sprite as Partial<Record<'idleAnim' | 'walkAnim', string>>)[
      kind === 'idle' ? 'idleAnim' : 'walkAnim'
    ];
    const key = assigned && this.scene.anims.exists(assigned) ? assigned : `${this.visualId}-${kind}`;
    if (!this.scene.anims.exists(key)) return;
    this.sprite.play(key, true);
  }
}

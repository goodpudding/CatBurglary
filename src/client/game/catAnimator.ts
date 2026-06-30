import Phaser from 'phaser';

export type CatAnimState = 'idle' | 'walk' | 'sit-down' | 'stand-up' | 'air';

const ORANGE_CAT_TEXTURE_KEYS = [
  'orange-cat-sitting-sheet',
  'orange-cat-walking-sheet',
  'orange-cat-stand-to-sit-sheet',
] as const;

export function isOrangeCat(sprite: Phaser.Physics.Arcade.Sprite): boolean {
  const key = sprite.texture?.key?.toLowerCase() ?? '';
  return key.includes('orange-cat');
}

/** Idle looks crisp because setup only filtered the sitting sheet; walk swaps to the walking sheet. */
export function applyOrangeCatTextureFilters(scene: Phaser.Scene): void {
  for (const key of ORANGE_CAT_TEXTURE_KEYS) {
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}

/** Stand ↔ sit transition clips (stand-to-sit sheet). */
export function ensureOrangeTransitionAnims(scene: Phaser.Scene): void {
  if (!scene.textures.exists('orange-cat-stand-to-sit-sheet')) return;

  if (!scene.anims.exists('orange-sit-down')) {
    scene.anims.create({
      key: 'orange-sit-down',
      frames: scene.anims.generateFrameNumbers('orange-cat-stand-to-sit-sheet', { start: 0, end: 4 }),
      frameRate: 12,
      repeat: 0,
    });
  }

  if (!scene.anims.exists('orange-stand-up')) {
    scene.anims.create({
      key: 'orange-stand-up',
      frames: scene.anims.generateFrameNumbers('orange-cat-stand-to-sit-sheet', { start: 4, end: 0 }),
      frameRate: 12,
      repeat: 0,
    });
  }
}

export class OrangeCatAnimator {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private state: CatAnimState = 'idle';
  private transitioning = false;

  constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.sprite = sprite;
    applyOrangeCatTextureFilters(scene);
    ensureOrangeTransitionAnims(scene);

    sprite.on(Phaser.Animations.Events.ANIMATION_START, this.keepTextureCrisp, this);

    if (scene.anims.exists('orange-idle') && !sprite.anims.isPlaying) {
      sprite.play('orange-idle');
      this.state = 'idle';
    }
  }

  private keepTextureCrisp = (): void => {
    this.sprite.texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
  };

  update(moving: boolean, onGround: boolean): void {
    if (!isOrangeCat(this.sprite)) return;

    if (!onGround) {
      if (this.state !== 'air' && !this.transitioning) {
        this.sprite.play('orange-walk', true);
        this.state = 'air';
      }
      return;
    }

    if (this.transitioning) return;

    if (moving) {
      if (this.state === 'idle') {
        this.beginStandUp();
      } else if (this.state === 'walk' || this.state === 'air') {
        this.sprite.play('orange-walk', true);
        this.state = 'walk';
      }
      return;
    }

    if (this.state === 'walk' || this.state === 'air') {
      this.beginSitDown();
    } else if (this.state !== 'idle' && this.state !== 'sit-down') {
      this.sprite.play('orange-idle', true);
      this.state = 'idle';
    }
  }

  setFlip(facingLeft: boolean): void {
    // Orange cat sheets face left by default; flip when walking right.
    this.sprite.setFlipX(!facingLeft);
  }

  private beginStandUp(): void {
    if (!this.scene.anims.exists('orange-stand-up')) {
      this.sprite.play('orange-walk', true);
      this.state = 'walk';
      return;
    }
    this.transitioning = true;
    this.state = 'stand-up';
    this.sprite.play('orange-stand-up');
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.onStandUpDone, this);
  }

  private onStandUpDone = (): void => {
    this.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.onStandUpDone, this);
    this.transitioning = false;
    if (this.state !== 'stand-up') return;
    this.sprite.play('orange-walk', true);
    this.state = 'walk';
  };

  private beginSitDown(): void {
    if (!this.scene.anims.exists('orange-sit-down')) {
      this.sprite.play('orange-idle', true);
      this.state = 'idle';
      return;
    }
    this.transitioning = true;
    this.state = 'sit-down';
    this.sprite.play('orange-sit-down');
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.onSitDownDone, this);
  }

  private onSitDownDone = (): void => {
    this.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, this.onSitDownDone, this);
    this.transitioning = false;
    if (this.state !== 'sit-down') return;
    this.sprite.play('orange-idle', true);
    this.state = 'idle';
  };
}

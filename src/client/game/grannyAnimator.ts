import Phaser from 'phaser';

const GRANNY_TEXTURE_KEYS = ['granny-1-sheet', 'granny-2-sheet', 'Wizard_Walking-Sheet'] as const;

export function isGrannyTextureKey(key: string | undefined): boolean {
  const k = key?.toLowerCase() ?? '';
  return k.includes('granny') || k.includes('wizard');
}

export function applyGrannyTextureFilters(scene: Phaser.Scene): void {
  for (const key of GRANNY_TEXTURE_KEYS) {
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}

/** 4-frame walk on the pink granny sheet only (granny-1 is purple — kept for later). */
export function ensureGrannyWalkAnim(scene: Phaser.Scene): void {
  if (scene.anims.exists('granny-walk')) return;

  if (scene.textures.exists('granny-2-sheet')) {
    scene.anims.create({
      key: 'granny-walk',
      frames: scene.anims.generateFrameNumbers('granny-2-sheet', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    return;
  }

  if (scene.textures.exists('granny-1-sheet')) {
    scene.anims.create({
      key: 'granny-walk',
      frames: scene.anims.generateFrameNumbers('granny-1-sheet', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    return;
  }

  if (scene.textures.exists('Wizard_Walking-Sheet')) {
    const total = scene.textures.get('Wizard_Walking-Sheet').frameTotal;
    if (total > 1) {
      scene.anims.create({
        key: 'granny-walk',
        frames: scene.anims.generateFrameNumbers('Wizard_Walking-Sheet', { start: 0, end: total - 1 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}

export function playGrannyWalk(
  scene: Phaser.Scene,
  granny: Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image,
): void {
  if (!isGrannyTextureKey(granny.texture?.key)) return;

  applyGrannyTextureFilters(scene);
  ensureGrannyWalkAnim(scene);

  if (granny instanceof Phaser.Physics.Arcade.Sprite && scene.anims.exists('granny-walk')) {
    granny.anims.play('granny-walk', true);
  }
}

import Phaser from 'phaser';

const GRANNY_TEXTURE_KEYS = [
  'Granny_Walking-Sheet',
  'granny-1-sheet',
  'granny-2-sheet',
  'Wizard_Walking-Sheet',
] as const;

/**
 * The pink 24x29 walking sheet — the SAME texture the Granny prefab spawns
 * with, so starting the walk anim never changes her look or size.
 * (Sheet colors, verified against the art: granny-1 = pink 48x48,
 * granny-2 = PURPLE 48x48. The purple-skin experiment is retired; building
 * 'newgrannywalk' on granny-2 was the old "granny turns purple and bugs out
 * when she starts walking" bug.)
 */
const DEFAULT_GRANNY_SHEET = 'Granny_Walking-Sheet';

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

function resolveGrannySheet(scene: Phaser.Scene): string | undefined {
  if (scene.textures.exists(DEFAULT_GRANNY_SHEET)) return DEFAULT_GRANNY_SHEET;
  if (scene.textures.exists('granny-1-sheet')) return 'granny-1-sheet';
  if (scene.textures.exists('Wizard_Walking-Sheet')) return 'Wizard_Walking-Sheet';
  return undefined;
}

/** 4-frame walk on the pink sheet granny already wears. */
export function ensureGrannyWalkAnim(scene: Phaser.Scene): void {
  if (scene.anims.exists('newgrannywalk')) return;

  const sheet = resolveGrannySheet(scene);
  if (!sheet) return;

  if (sheet === 'Wizard_Walking-Sheet') {
    const total = scene.textures.get(sheet).frameTotal;
    if (total > 1) {
      scene.anims.create({
        key: 'newgrannywalk',
        frames: scene.anims.generateFrameNumbers(sheet, { start: 0, end: total - 1 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    return;
  }

  scene.anims.create({
    key: 'newgrannywalk',
    frames: scene.anims.generateFrameNumbers(sheet, { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
}

export function playGrannyWalk(
  scene: Phaser.Scene,
  granny: Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image,
): void {
  if (!isGrannyTextureKey(granny.texture?.key)) return;

  applyGrannyTextureFilters(scene);
  ensureGrannyWalkAnim(scene);

  if (granny instanceof Phaser.Physics.Arcade.Sprite && scene.anims.exists('newgrannywalk')) {
    granny.anims.play('newgrannywalk', true);
  }
}

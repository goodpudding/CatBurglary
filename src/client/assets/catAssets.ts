import Phaser from 'phaser';
import {
  CAT_SHEET_SETS,
  getCatVisualId,
  type CatSheetSet,
  type CatVisualId,
} from './catCatalog';

const ANIM_SUFFIXES = ['walk', 'idle', 'jump'] as const;

function preloadSheet(scene: Phaser.Scene, sheet: CatSheetSet[typeof ANIM_SUFFIXES[number]]): void {
  if (scene.textures.exists(sheet.key)) return;
  scene.load.spritesheet(sheet.key, sheet.url, {
    frameWidth: sheet.frameWidth,
    frameHeight: sheet.frameHeight,
  });
}

export function preloadCatAssets(scene: Phaser.Scene): void {
  for (const sheets of Object.values(CAT_SHEET_SETS)) {
    for (const suffix of ANIM_SUFFIXES) {
      preloadSheet(scene, sheets[suffix]);
    }
  }
}

function registerAnimation(
  scene: Phaser.Scene,
  visualId: CatVisualId,
  suffix: (typeof ANIM_SUFFIXES)[number],
  sheet: CatSheetSet[typeof ANIM_SUFFIXES[number]],
  frameRate: number,
): void {
  const animKey = `${visualId}-${suffix}`;
  if (scene.anims.exists(animKey)) return;

  scene.anims.create({
    key: animKey,
    frames: scene.anims.generateFrameNumbers(sheet.key, {
      start: 0,
      end: sheet.frameCount - 1,
    }),
    frameRate,
    repeat: suffix === 'jump' ? 0 : -1,
  });
}

export function applyCatTextureFilters(scene: Phaser.Scene): void {
  for (const sheets of Object.values(CAT_SHEET_SETS)) {
    for (const suffix of ANIM_SUFFIXES) {
      const key = sheets[suffix].key;
      if (scene.textures.exists(key)) {
        scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }
}

export function registerCatAnimations(scene: Phaser.Scene): void {
  applyCatTextureFilters(scene);

  for (const [visualId, sheets] of Object.entries(CAT_SHEET_SETS) as [CatVisualId, CatSheetSet][]) {
    registerAnimation(scene, visualId, 'walk', sheets.walk, 10);
    registerAnimation(scene, visualId, 'idle', sheets.idle, 5);
    registerAnimation(scene, visualId, 'jump', sheets.jump, 10);
  }
}

export function catAnimKey(catId: string, suffix: (typeof ANIM_SUFFIXES)[number]): string {
  return `${getCatVisualId(catId)}-${suffix}`;
}

export { getCatVisualId };

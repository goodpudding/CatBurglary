import Phaser from 'phaser';
import { CatAnimator } from '../catAnimator.js';
import { getCatDefinition } from '../../../shared/CatDefinition.js';
import { CAT_SPEED_SCALE, JUMP_HEIGHT_SCALE } from './constants.js';

export interface CatStats {
  moveSpeed: number;
  jumpVelocity: number;
  knockbackMultiplier: number;
  scoreMultiplier: number;
}

export function setupCat(
  scene: Phaser.Scene,
  cat: Phaser.Physics.Arcade.Sprite,
  catId: string,
  worldScale: number,
  groundTop: number,
  pinFeet: (cat: Phaser.Physics.Arcade.Sprite, groundTop: number) => void,
): { animator: CatAnimator; stats: CatStats } {
  const catDef = getCatDefinition(catId);

  const stats: CatStats = {
    moveSpeed: catDef.stats.moveSpeed * CAT_SPEED_SCALE,
    jumpVelocity:
      catDef.stats.jumpVelocity * Math.sqrt(JUMP_HEIGHT_SCALE) * Math.sqrt(worldScale),
    knockbackMultiplier: catDef.stats.knockbackMultiplier,
    scoreMultiplier: catDef.stats.scoreMultiplier,
  };

  const body = cat.body as Phaser.Physics.Arcade.Body;
  body.setAllowGravity(true);

  // Feet-aligned box body (source-frame units; Arcade scales it by the sprite scale)
  // so the physics bottom matches the cat's visible feet and it seats flush on shelves.
  const frameW = cat.width;
  const frameH = cat.height;
  const bodyW = Math.max(6, frameW * 0.55);
  const bodyH = Math.max(6, frameH * 0.45);
  body.setSize(bodyW, bodyH, false);
  body.setOffset((frameW - bodyW) / 2, frameH - bodyH);
  // Horizontal speed is managed manually (accel/drag) in SneakGame; keep the cap
  // high so a granny knockback isn't clamped down to walking speed.
  body.setMaxVelocity(600, 560);
  body.updateFromGameObject();

  cat.setCollideWorldBounds(true);
  cat.setDepth(10);
  pinFeet(cat, groundTop);

  return { animator: new CatAnimator(scene, cat, catId), stats };
}

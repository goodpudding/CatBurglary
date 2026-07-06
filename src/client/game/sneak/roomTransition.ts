import Phaser from 'phaser';

import type { GrannyObject } from './types.js';

export interface RoomExit {
  zone: Phaser.GameObjects.Zone;
  hint: Phaser.GameObjects.Text;
}

/**
 * Builds the forward exit for a room. Prefers an editor-authored rectangle
 * labeled "exit"; otherwise falls back to a tall strip at the room's right edge.
 * The exit is one-way — crossing it banks carried treats and advances the run.
 */
export function setupRoomExit(
  scene: Phaser.Scene,
  editorExit: Phaser.GameObjects.Rectangle | undefined,
  roomRight: number,
  roomTop: number,
  roomHeight: number,
  groundTop: number,
): RoomExit {
  let cx: number;
  let cy: number;
  let w: number;
  let h: number;

  if (editorExit) {
    const b = editorExit.getBounds();
    cx = b.centerX;
    cy = b.centerY;
    w = Math.max(20, b.width);
    h = Math.max(80, b.height);
    // Editor exit rect is just a trigger marker — hide any fill.
    editorExit.setFillStyle(0x000000, 0);
    editorExit.setStrokeStyle(0, 0);
  } else {
    w = 48;
    h = roomHeight;
    cx = roomRight - w / 2;
    cy = roomTop + roomHeight / 2;
  }

  const zone = scene.add.zone(cx, cy, w, h);
  scene.physics.add.existing(zone, true);

  const hint = scene.add
    .text(cx, Math.min(cy, groundTop - 70), 'Go →', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#cdeaff',
      align: 'center',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    })
    .setOrigin(0.5, 1)
    .setDepth(30)
    .setAlpha(0);

  return { zone, hint };
}

export function isCatAtExit(exit: RoomExit | undefined, cat: Phaser.Physics.Arcade.Sprite): boolean {
  if (!exit) return false;
  return Phaser.Geom.Rectangle.Overlaps(exit.zone.getBounds(), cat.getBounds());
}

/**
 * If the editor placed granny too close to the left-side entrance, park her on
 * the far side so she is not on top of the cat when the room loads.
 */
export function ensureGrannySeparationFromCat(
  granny: GrannyObject,
  cat: Phaser.Physics.Arcade.Sprite,
  roomLeft: number,
  roomRight: number,
  groundTop: number,
  minGap: number,
): void {
  if (Math.abs(granny.x - cat.x) >= minGap) return;

  const pad = 90;
  granny.x = Phaser.Math.Clamp(roomRight - pad, roomLeft + pad, roomRight - pad);

  const b = granny.getBounds();
  granny.y += groundTop - b.bottom;
  const body = granny.body as Phaser.Physics.Arcade.Body;
  body.setVelocity(0, 0);
  body.updateFromGameObject();
}

/**
 * Places the cat at the room's left entrance, as if it just walked in from the
 * previous room on the left. Feet rest on the ground line.
 */
export function enterFromLeft(
  scene: Phaser.Scene,
  cat: Phaser.Physics.Arcade.Sprite,
  roomLeft: number,
  groundTop: number,
): void {
  const margin = 70;
  cat.x = roomLeft + margin;
  const body = cat.body as Phaser.Physics.Arcade.Body;
  cat.y += groundTop - body.bottom;
  body.setVelocity(0, 0);
  body.updateFromGameObject();
  void scene;
}

/** Slide-in flourish: the room briefly scrolls in from the right. */
export function playEntryFlourish(scene: Phaser.Scene): void {
  scene.cameras.main.fadeIn(280, 0, 0, 0);
}

/** Fade to black, then run the transition (scene.start / win). */
export function playExitTransition(scene: Phaser.Scene, onComplete: () => void): void {
  const cam = scene.cameras.main;
  cam.fadeOut(260, 0, 0, 0);
  cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, onComplete);
}

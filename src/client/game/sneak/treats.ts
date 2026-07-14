import Phaser from 'phaser';
import { parseTreatPoints } from './editorObjects.js';
import type { TreatTarget } from './types.js';

const TREAT_TEXTURE = 'fish-treat';
const TREAT_ANIM = 'treat';

function ensureTreatAnim(scene: Phaser.Scene): void {
  if (scene.anims.exists(TREAT_ANIM)) return;
  if (!scene.textures.exists(TREAT_TEXTURE)) return;

  scene.textures.get(TREAT_TEXTURE).setFilter(Phaser.Textures.FilterMode.NEAREST);
  scene.anims.create({
    key: TREAT_ANIM,
    frames: scene.anims.generateFrameNumbers(TREAT_TEXTURE, { start: 0, end: 3 }),
    frameRate: 6,
    repeat: -1,
  });
}

/** Matches the treatMarker prefab's pointSound/pointSoundVolume defaults. */
const DEFAULT_POINT_SOUND = 'get-coin';
const DEFAULT_POINT_SOUND_VOLUME = 0.5;

function spawnTreat(
  scene: Phaser.Scene,
  x: number,
  y: number,
  points: number,
  displayScale: number,
  pointSound: string = DEFAULT_POINT_SOUND,
  pointSoundVolume: number = DEFAULT_POINT_SOUND_VOLUME,
): TreatTarget {
  ensureTreatAnim(scene);

  const treat = scene.add.sprite(x, y, TREAT_TEXTURE, 0).setDepth(5);
  treat.setScale(displayScale);
  if (scene.anims.exists(TREAT_ANIM)) {
    treat.play(TREAT_ANIM);
  }

  scene.physics.add.existing(treat, true);
  const body = treat.body as Phaser.Physics.Arcade.StaticBody & { refreshBody?: () => void };
  body.setCircle(Math.max(8, 10 * displayScale));
  if (typeof body.refreshBody === 'function') {
    body.refreshBody();
  } else {
    body.updateFromGameObject();
  }

  treat.setData('points', points);
  treat.setData('pointSound', pointSound);
  treat.setData('pointSoundVolume', Phaser.Math.Clamp(pointSoundVolume, 0, 1));
  return treat;
}

export function placeTreats(
  scene: Phaser.Scene,
  furniture: Phaser.GameObjects.Image[],
  markers: Phaser.GameObjects.GameObject[],
  groundTop: number,
): TreatTarget[] {
  const treats: TreatTarget[] = [];

  if (markers.length > 0) {
    for (const marker of markers) {
      // Prefer the marker prefab's points property (set per-instance in the
      // editor Inspector); fall back to parsing a treat_N name.
      const own = (marker as { points?: number }).points;
      const points = typeof own === 'number' ? own : parseTreatPoints(marker.name);
      // Sound props from the treatMarker prefab (per-instance editable in the
      // editor Inspector, like points).
      const soundProps = marker as { pointSound?: string; pointSoundVolume?: number };
      const pointSound =
        typeof soundProps.pointSound === 'string' && soundProps.pointSound.length > 0
          ? soundProps.pointSound
          : DEFAULT_POINT_SOUND;
      const pointSoundVolume =
        typeof soundProps.pointSoundVolume === 'number'
          ? soundProps.pointSoundVolume
          : DEFAULT_POINT_SOUND_VOLUME;
      const go = marker as Phaser.GameObjects.GameObject & { getBounds?: () => Phaser.Geom.Rectangle };
      const b = go.getBounds?.();
      if (!b) continue;

      const displayScale = Math.max(1.8, Math.max(b.width, b.height) / 16);
      treats.push(
        spawnTreat(scene, b.centerX, b.centerY, points, displayScale, pointSound, pointSoundVolume),
      );
      marker.destroy();
    }
    return treats;
  }

  for (const img of furniture) {
    const b = img.getBounds();
    const x = b.centerX;
    const y = b.top - 16;
    const points = Phaser.Math.Clamp(Math.round((groundTop - y) / 40) * 5 + 5, 5, 30);
    treats.push(spawnTreat(scene, x, y, points, 2.2));
  }

  return treats;
}

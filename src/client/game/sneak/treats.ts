import Phaser from 'phaser';
import { parseTreatPoints } from './editorObjects.js';
import type { TreatTarget } from './types.js';

export function placeTreats(
  scene: Phaser.Scene,
  furniture: Phaser.GameObjects.Image[],
  markers: Phaser.GameObjects.GameObject[],
  groundTop: number,
): TreatTarget[] {
  const treats: TreatTarget[] = [];

  if (markers.length > 0) {
    for (const marker of markers) {
      const points = parseTreatPoints(marker.name);
      const go = marker as Phaser.GameObjects.GameObject & { getBounds?: () => Phaser.Geom.Rectangle };
      const b = go.getBounds?.();
      if (!b) continue;

      const color = points >= 20 ? 0xff7043 : 0xffd54a;
      const treat = scene.add
        .circle(b.centerX, b.centerY, 11, color)
        .setStrokeStyle(2, 0x7a5200)
        .setDepth(5);
      scene.physics.add.existing(treat, true);
      treat.setData('points', points);
      treats.push(treat);
      marker.destroy();
    }
    return treats;
  }

  for (const img of furniture) {
    const b = img.getBounds();
    const x = b.centerX;
    const y = b.top - 16;
    const points = Phaser.Math.Clamp(Math.round((groundTop - y) / 40) * 5 + 5, 5, 30);
    const color = points >= 20 ? 0xff7043 : 0xffd54a;
    const treat = scene.add.circle(x, y, 11, color).setStrokeStyle(2, 0x7a5200).setDepth(5);
    scene.physics.add.existing(treat, true);
    treat.setData('points', points);
    treats.push(treat);
  }

  return treats;
}

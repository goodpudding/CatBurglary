import Phaser from 'phaser';
import { COSMETIC_CATALOG } from '../../shared/cosmeticCatalog.js';

function drawTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
  scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function ensureCosmeticTextures(scene: Phaser.Scene): void {
  drawTexture(scene, 'cosmetic-bowtie', 14, 8, (g) => {
    g.fillStyle(0xe53935, 1);
    g.fillTriangle(7, 2, 2, 7, 7, 7);
    g.fillTriangle(7, 2, 12, 7, 7, 7);
    g.fillStyle(0xffcdd2, 1);
    g.fillCircle(7, 4, 2);
  });

  drawTexture(scene, 'cosmetic-mustache-handlebar', 18, 6, (g) => {
    g.fillStyle(0x4e342e, 1);
    g.fillRect(1, 2, 4, 2);
    g.fillRect(13, 2, 4, 2);
    g.fillRect(6, 3, 6, 2);
    g.fillRect(0, 1, 3, 1);
    g.fillRect(15, 1, 3, 1);
  });

  drawTexture(scene, 'cosmetic-glasses-round', 18, 8, (g) => {
    g.lineStyle(1, 0x212121, 1);
    g.strokeCircle(5, 4, 3);
    g.strokeCircle(13, 4, 3);
    g.beginPath();
    g.moveTo(8, 4);
    g.lineTo(10, 4);
    g.strokePath();
    g.fillStyle(0x90caf9, 0.35);
    g.fillCircle(5, 4, 2);
    g.fillCircle(13, 4, 2);
  });

  drawTexture(scene, 'cosmetic-hat-top', 20, 14, (g) => {
    g.fillStyle(0x212121, 1);
    g.fillRect(0, 10, 20, 3);
    g.fillRect(5, 2, 10, 9);
    g.fillStyle(0xb71c1c, 1);
    g.fillRect(5, 9, 10, 2);
    g.fillStyle(0x424242, 1);
    g.fillRect(7, 0, 6, 2);
  });
}

export const COSMETIC_TEXTURE_KEYS = COSMETIC_CATALOG.map((item) => item.textureKey);

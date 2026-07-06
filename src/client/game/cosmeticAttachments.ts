import Phaser from 'phaser';
import { getCosmeticDefinition } from '../../shared/cosmeticCatalog.js';
import type { CosmeticSlot, EquippedCosmetics } from '../../shared/playerProfile.js';
import { ensureCosmeticTextures } from './cosmeticTextures.js';

export class CosmeticAttachmentManager {
  private layers = new Map<CosmeticSlot, Phaser.GameObjects.Image>();

  constructor(
    private scene: Phaser.Scene,
    private cat: Phaser.Physics.Arcade.Sprite,
    equipped: EquippedCosmetics,
  ) {
    ensureCosmeticTextures(scene);
    this.applyLoadout(equipped);
  }

  applyLoadout(equipped: EquippedCosmetics): void {
    this.destroyLayers();

    for (const slot of ['head', 'face', 'neck'] as CosmeticSlot[]) {
      const cosmeticId = equipped[slot];
      if (!cosmeticId) continue;

      const def = getCosmeticDefinition(cosmeticId);
      if (!def || !this.scene.textures.exists(def.textureKey)) continue;

      const image = this.scene.add
        .image(this.cat.x, this.cat.y, def.textureKey)
        .setDepth(this.cat.depth + 1)
        .setData('cosmeticId', cosmeticId)
        .setData('offsetX', def.offsetX)
        .setData('offsetY', def.offsetY);

      const scale = Math.max(this.cat.scaleX, 1);
      image.setScale(scale);
      this.layers.set(slot, image);
    }
  }

  update(): void {
    const flip = this.cat.flipX ? -1 : 1;
    const scale = Math.max(this.cat.scaleX, 1);

    for (const image of this.layers.values()) {
      const offsetX = (image.getData('offsetX') as number) * scale * flip;
      const offsetY = (image.getData('offsetY') as number) * scale;
      image.setPosition(this.cat.x + offsetX, this.cat.y + offsetY);
      image.setFlipX(this.cat.flipX);
      image.setDepth(this.cat.depth + 1);
      image.setAlpha(this.cat.alpha);
    }
  }

  destroy(): void {
    this.destroyLayers();
  }

  private destroyLayers(): void {
    for (const image of this.layers.values()) {
      image.destroy();
    }
    this.layers.clear();
  }
}

import Phaser from 'phaser';
import { COSMETIC_CATALOG } from '../../shared/cosmeticCatalog.js';

/**
 * Cosmetic art is real pixel art now (assets/outfits/*.aseprite exported to
 * src/client/assets/outfits/, loaded via outfit-asset-pack.json in
 * preloadHouseAssets). This just keeps the textures crisp; missing textures
 * are skipped by CosmeticAttachmentManager, so nothing here needs to draw.
 */
export function ensureCosmeticTextures(scene: Phaser.Scene): void {
  for (const item of COSMETIC_CATALOG) {
    if (scene.textures.exists(item.textureKey)) {
      scene.textures.get(item.textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}

export const COSMETIC_TEXTURE_KEYS = COSMETIC_CATALOG.map((item) => item.textureKey);

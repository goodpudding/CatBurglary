import Phaser from 'phaser';
import {
  getCosmeticDefinition,
  getCosmeticByEditorTextureKey,
} from '../../shared/cosmeticCatalog.js';
import type { CosmeticSlot, EquippedCosmetics } from '../../shared/playerProfile.js';
import { ensureCosmeticTextures } from './cosmeticTextures.js';

/**
 * An outfit image authored inside the Player prefab in Phaser Editor.
 * Each cat group in the prefab carries its own outfit set, so offsets are
 * per-cat: exactly where the artist dragged the image relative to THAT cat
 * (authored at cat scale 1, facing LEFT — offsetX mirrors when the cat flips).
 */
export type OutfitLayer = {
  image: Phaser.GameObjects.Image;
  cosmeticId: string;
  /**
   * Anchored to the cat frame's TOP and FACE-SIDE (left when unflipped) edges
   * of the frame the outfit was authored against in the editor. Cat sheets
   * draw the head in the top/face corner, but frame sizes change between
   * idle and walk sheets (orange sit 20px wide vs walk 25px) — center-relative
   * offsets would make accessories hop sideways every time the animation
   * switches. Re-derived against the current frame each update.
   */
  offsetFromFace: number;
  offsetFromTop: number;
  scaleX: number;
  scaleY: number;
};

/**
 * Build an OutfitLayer from an editor-placed image, mapping its texture back
 * to a shop item. Swaps to the gameplay texture when it differs (the editor
 * shows the full-size glasses art; the game uses the baked small variant so
 * the lens rings survive) while preserving the size the artist chose.
 */
export function buildOutfitLayer(
  image: Phaser.GameObjects.Image,
  offsetX: number,
  offsetY: number,
  catFrameWidth: number,
  catFrameHeight: number,
): OutfitLayer | undefined {
  const def = getCosmeticByEditorTextureKey(image.texture?.key ?? '');
  if (!def) return undefined;

  let scaleX = image.scaleX;
  let scaleY = image.scaleY;

  if (image.texture.key !== def.textureKey && image.scene.textures.exists(def.textureKey)) {
    const oldW = image.width;
    const oldH = image.height;
    image.setTexture(def.textureKey);
    if (image.width > 0 && image.height > 0) {
      scaleX *= oldW / image.width;
      scaleY *= oldH / image.height;
    }
  }

  return {
    image,
    cosmeticId: def.id,
    // Editor offsets are center-relative to the frame the artist saw;
    // re-anchor to the head corner so pose/frame-size changes don't shift them.
    offsetFromFace: catFrameWidth / 2 + offsetX,
    offsetFromTop: catFrameHeight / 2 + offsetY,
    scaleX,
    scaleY,
  };
}

export class CosmeticAttachmentManager {
  /** Editor-authored layers (preferred: positions come from the Player prefab). */
  private editorLayers: OutfitLayer[] = [];
  /** Fallback layers generated from catalog offsets (no prefab outfits found). */
  private layers = new Map<CosmeticSlot, Phaser.GameObjects.Image>();

  constructor(
    private scene: Phaser.Scene,
    private cat: Phaser.Physics.Arcade.Sprite,
    equipped: EquippedCosmetics,
    editorLayers?: OutfitLayer[],
  ) {
    ensureCosmeticTextures(scene);
    if (editorLayers && editorLayers.length > 0) {
      this.editorLayers = editorLayers;
    }
    this.applyLoadout(equipped);

    // Arcade physics writes the body's new position back to the sprite AFTER
    // the scene's update() runs — repositioning during update() leaves the
    // outfits one frame behind (a visible trail while the cat walks). Follow
    // the cat on POST_UPDATE instead, once the sprite is in its final spot.
    this.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
  }

  applyLoadout(equipped: EquippedCosmetics): void {
    if (this.editorLayers.length > 0) {
      for (const layer of this.editorLayers) {
        const def = getCosmeticDefinition(layer.cosmeticId);
        const worn = def ? equipped[def.slot] === layer.cosmeticId : false;
        layer.image.setVisible(worn);
      }
      this.update();
      return;
    }

    this.destroyGeneratedLayers();

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
      image.setScale(scale * def.attachScale);
      this.layers.set(slot, image);
    }
  }

  update(): void {
    const flip = this.cat.flipX ? -1 : 1;

    for (const layer of this.editorLayers) {
      if (!layer.image.visible) continue;
      // Re-derive center offsets against the cat's CURRENT frame from the
      // head-corner anchors (frame size changes between idle/walk sheets).
      const offsetX = layer.offsetFromFace - this.cat.width / 2;
      const offsetY = layer.offsetFromTop - this.cat.height / 2;
      layer.image.setPosition(
        this.cat.x + offsetX * this.cat.scaleX * flip,
        this.cat.y + offsetY * this.cat.scaleY,
      );
      layer.image.setScale(layer.scaleX * this.cat.scaleX, layer.scaleY * this.cat.scaleY);
      layer.image.setFlipX(this.cat.flipX);
      layer.image.setDepth(this.cat.depth + 1);
      layer.image.setAlpha(this.cat.alpha);
    }

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
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
    for (const layer of this.editorLayers) {
      layer.image.destroy();
    }
    this.editorLayers = [];
    this.destroyGeneratedLayers();
  }

  private destroyGeneratedLayers(): void {
    for (const image of this.layers.values()) {
      image.destroy();
    }
    this.layers.clear();
  }
}

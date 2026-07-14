export type CosmeticSlot = 'head' | 'face' | 'neck';

export type CosmeticDefinition = {
  id: string;
  name: string;
  slot: CosmeticSlot;
  price: number;
  description: string;
  /** Emoji fallback shown in the splash shop when sprite art is unavailable. */
  icon: string;
  /** Texture key loaded from the outfit/granny asset packs. */
  textureKey: string;
  /**
   * Attachment offset from the cat origin in source-frame pixels, authored for
   * the UNFLIPPED sprite (cats face LEFT natively). offsetX is mirrored when
   * the cat flips. Fallback only — editor-authored prefab outfits win.
   */
  offsetX: number;
  offsetY: number;
  /** Extra scale applied on top of the cat's scale (1 = native pixel size). */
  attachScale: number;
  /**
   * Texture keys the Phaser-Editor-placed outfit images may use in the Player
   * prefab. Lets the game map an editor image back to its shop item even when
   * the placed art differs from the gameplay texture (e.g. full-size glasses
   * in the editor, baked small texture in-game).
   */
  editorTextureKeys?: string[];
  /** Sprite art for the shop card (path relative to the asset root). */
  sprite?: {
    path: string;
    /** Frame size shown on the card (crops sheets to their first frame). */
    frameWidth: number;
    frameHeight: number;
    /** Full image width when the file is a multi-frame sheet. */
    sheetWidth?: number;
  };
};

export const COSMETIC_CATALOG: CosmeticDefinition[] = [
  {
    id: 'bowtie',
    name: 'Bow Tie',
    slot: 'neck',
    price: 40,
    description: 'Fancy neck flair for formal heists.',
    icon: '🎀',
    textureKey: 'outfit-bow',
    editorTextureKeys: ['outfit-bow'],
    offsetX: -5,
    offsetY: 3,
    attachScale: 0.75,
    sprite: { path: 'outfits/bow-w11h9.png', frameWidth: 11, frameHeight: 9 },
  },
  {
    id: 'mustache-handlebar',
    name: 'Handlebar Stache',
    slot: 'face',
    price: 50,
    description: 'A distinguished burglar look.',
    icon: '🥸',
    textureKey: 'outfit-mustache',
    editorTextureKeys: ['outfit-mustache'],
    offsetX: -6,
    offsetY: 0,
    attachScale: 0.6,
    sprite: { path: 'outfits/mustache-w-30-h-9.png', frameWidth: 30, frameHeight: 9 },
  },
  {
    id: 'glasses-round',
    name: 'Round Glasses',
    slot: 'face',
    price: 75,
    description: 'Scholarly sneak, sharper instincts.',
    icon: '👓',
    // Pre-baked small variant: naive downscaling erases the 1px lens rings.
    textureKey: 'outfit-glasses-small',
    editorTextureKeys: ['outfit-glasses', 'outfit-glasses-small'],
    offsetX: -5,
    offsetY: -2,
    attachScale: 1,
    sprite: { path: 'outfits/glasses-w24h10.png', frameWidth: 24, frameHeight: 10 },
  },
  {
    id: 'hat-top',
    name: 'Top Hat',
    slot: 'head',
    price: 100,
    description: 'Peak class for the classy cat.',
    icon: '🎩',
    textureKey: 'outfit-top-hat',
    editorTextureKeys: ['outfit-top-hat'],
    offsetX: -6,
    offsetY: -10,
    attachScale: 1,
    sprite: { path: 'outfits/top-hat-w13h9.png', frameWidth: 13, frameHeight: 9 },
  },
];

const cosmeticsById = new Map(COSMETIC_CATALOG.map((item) => [item.id, item]));

export function getCosmeticDefinition(cosmeticId: string): CosmeticDefinition | undefined {
  return cosmeticsById.get(cosmeticId);
}

export function isValidCosmeticId(cosmeticId: string): boolean {
  return cosmeticsById.has(cosmeticId);
}

/** Map a Phaser-Editor outfit image (by texture key) to its shop item. */
export function getCosmeticByEditorTextureKey(textureKey: string): CosmeticDefinition | undefined {
  return COSMETIC_CATALOG.find(
    (item) => item.textureKey === textureKey || item.editorTextureKeys?.includes(textureKey),
  );
}

export function formatCosmeticSlot(slot: CosmeticSlot): string {
  switch (slot) {
    case 'head':
      return 'Head';
    case 'face':
      return 'Face';
    case 'neck':
      return 'Neck';
  }
}

export type ShopItemState = CosmeticDefinition & {
  owned: boolean;
  equipped: boolean;
};

export function buildShopItems(profile: {
  ownedCosmetics: string[];
  equipped: Partial<Record<CosmeticSlot, string>>;
}): ShopItemState[] {
  return COSMETIC_CATALOG.map((item) => ({
    ...item,
    owned: profile.ownedCosmetics.includes(item.id),
    equipped: profile.equipped[item.slot] === item.id,
  }));
}

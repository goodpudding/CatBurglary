export type CosmeticSlot = 'head' | 'face' | 'neck';

export type CosmeticDefinition = {
  id: string;
  name: string;
  slot: CosmeticSlot;
  price: number;
  description: string;
  /** Emoji shown in the splash shop. */
  icon: string;
  /** Pixel-art texture key generated at runtime in Phaser. */
  textureKey: string;
  /** Attachment offset from cat origin (unscaled pixels). */
  offsetX: number;
  offsetY: number;
};

export const COSMETIC_CATALOG: CosmeticDefinition[] = [
  {
    id: 'bowtie',
    name: 'Bow Tie',
    slot: 'neck',
    price: 40,
    description: 'Fancy neck flair for formal heists.',
    icon: '🎀',
    textureKey: 'cosmetic-bowtie',
    offsetX: 0,
    offsetY: 6,
  },
  {
    id: 'mustache-handlebar',
    name: 'Handlebar Stache',
    slot: 'face',
    price: 50,
    description: 'A distinguished burglar look.',
    icon: '🥸',
    textureKey: 'cosmetic-mustache-handlebar',
    offsetX: 1,
    offsetY: -4,
  },
  {
    id: 'glasses-round',
    name: 'Round Glasses',
    slot: 'face',
    price: 75,
    description: 'Scholarly sneak, sharper instincts.',
    icon: '👓',
    textureKey: 'cosmetic-glasses-round',
    offsetX: 0,
    offsetY: -10,
  },
  {
    id: 'hat-top',
    name: 'Top Hat',
    slot: 'head',
    price: 100,
    description: 'Peak class for the classy cat.',
    icon: '🎩',
    textureKey: 'cosmetic-hat-top',
    offsetX: 0,
    offsetY: -22,
  },
];

const cosmeticsById = new Map(COSMETIC_CATALOG.map((item) => [item.id, item]));

export function getCosmeticDefinition(cosmeticId: string): CosmeticDefinition | undefined {
  return cosmeticsById.get(cosmeticId);
}

export function isValidCosmeticId(cosmeticId: string): boolean {
  return cosmeticsById.has(cosmeticId);
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

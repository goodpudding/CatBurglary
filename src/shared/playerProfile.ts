import { CAT_ROSTER, DEFAULT_CAT_ID } from './CatDefinition.js';
import { isValidCosmeticId, type CosmeticSlot } from './cosmeticCatalog.js';
import { STARTER_CAT_IDS } from './catUnlocks.js';

export type { CosmeticSlot } from './cosmeticCatalog.js';

export type EquippedCosmetics = Partial<Record<CosmeticSlot, string>>;

export type PlayerProfile = {
  coins: number;
  ownedCosmetics: string[];
  equipped: EquippedCosmetics;
  ownedCats: string[];
  selectedCatId: string;
};

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  coins: 0,
  ownedCosmetics: [],
  equipped: {},
  ownedCats: [...STARTER_CAT_IDS],
  selectedCatId: DEFAULT_CAT_ID,
};

const VALID_CAT_IDS = new Set(CAT_ROSTER.map((cat) => cat.id));

function normalizeEquipped(equipped: EquippedCosmetics | undefined): EquippedCosmetics {
  if (!equipped || typeof equipped !== 'object') return {};

  const result: EquippedCosmetics = {};
  for (const slot of ['head', 'face', 'neck'] as CosmeticSlot[]) {
    const cosmeticId = equipped[slot];
    if (typeof cosmeticId === 'string' && isValidCosmeticId(cosmeticId)) {
      result[slot] = cosmeticId;
    }
  }
  return result;
}

export function normalizePlayerProfile(parsed: Partial<PlayerProfile> | undefined): PlayerProfile {
  const ownedCats =
    Array.isArray(parsed?.ownedCats) && parsed.ownedCats.length > 0
      ? parsed.ownedCats.filter((id) => VALID_CAT_IDS.has(id))
      : [...STARTER_CAT_IDS];

  let selectedCatId =
    typeof parsed?.selectedCatId === 'string' && VALID_CAT_IDS.has(parsed.selectedCatId)
      ? parsed.selectedCatId
      : DEFAULT_CAT_ID;

  if (!ownedCats.includes(selectedCatId)) {
    selectedCatId = ownedCats[0] ?? DEFAULT_CAT_ID;
  }

  return {
    coins: typeof parsed?.coins === 'number' && parsed.coins >= 0 ? parsed.coins : 0,
    ownedCosmetics: Array.isArray(parsed?.ownedCosmetics)
      ? parsed.ownedCosmetics.filter((id) => isValidCosmeticId(id))
      : [],
    equipped: normalizeEquipped(parsed?.equipped),
    ownedCats,
    selectedCatId,
  };
}
/** Max banked points accepted per run (basic anti-cheat guard). */
export const MAX_BANKED_PER_RUN = 10_000;

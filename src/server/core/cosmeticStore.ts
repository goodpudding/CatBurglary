import { buildShopItems, getCosmeticDefinition } from '../../shared/cosmeticCatalog.js';
import type { CosmeticSlot, PlayerProfile } from '../../shared/playerProfile.js';
import { getPlayerProfile, savePlayerProfile } from './playerStore.js';

export async function buyCosmetic(userId: string, cosmeticId: string): Promise<PlayerProfile> {
  const cosmetic = getCosmeticDefinition(cosmeticId);
  if (!cosmetic) {
    throw new Error('Unknown cosmetic');
  }

  const profile = await getPlayerProfile(userId);
  if (profile.ownedCosmetics.includes(cosmeticId)) {
    return profile;
  }

  if (profile.coins < cosmetic.price) {
    throw new Error('Not enough coins');
  }

  profile.coins -= cosmetic.price;
  profile.ownedCosmetics = [...profile.ownedCosmetics, cosmeticId];
  profile.equipped = { ...profile.equipped, [cosmetic.slot]: cosmeticId };
  await savePlayerProfile(userId, profile);
  return profile;
}

export async function equipCosmetic(
  userId: string,
  slot: CosmeticSlot,
  cosmeticId: string | null,
): Promise<PlayerProfile> {
  const profile = await getPlayerProfile(userId);

  if (cosmeticId === null) {
    const next = { ...profile.equipped };
    delete next[slot];
    profile.equipped = next;
    await savePlayerProfile(userId, profile);
    return profile;
  }

  const cosmetic = getCosmeticDefinition(cosmeticId);
  if (!cosmetic) {
    throw new Error('Unknown cosmetic');
  }

  if (cosmetic.slot !== slot) {
    throw new Error('Cosmetic slot mismatch');
  }

  if (!profile.ownedCosmetics.includes(cosmeticId)) {
    throw new Error('Cosmetic not owned');
  }

  profile.equipped = { ...profile.equipped, [slot]: cosmeticId };
  await savePlayerProfile(userId, profile);
  return profile;
}

export function buildShopView(profile: PlayerProfile) {
  return buildShopItems(profile);
}

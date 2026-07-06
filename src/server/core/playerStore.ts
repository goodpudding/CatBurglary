import { context, redis } from '@devvit/web/server';
import { getCatUnlockPrice } from '../../shared/catUnlocks.js';
import { getCatDefinition } from '../../shared/CatDefinition.js';
import {
  DEFAULT_PLAYER_PROFILE,
  MAX_BANKED_PER_RUN,
  normalizePlayerProfile,
  type PlayerProfile,
} from '../../shared/playerProfile.js';

function profileKey(userId: string): string {
  return `profile:${userId}`;
}

function parseProfile(raw: string | undefined): PlayerProfile {
  if (!raw) return { ...DEFAULT_PLAYER_PROFILE };

  try {
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    return normalizePlayerProfile(parsed);
  } catch {
    return { ...DEFAULT_PLAYER_PROFILE };
  }
}

export function resolveUserId(): string | undefined {
  return context.userId;
}

export async function getPlayerProfile(userId: string): Promise<PlayerProfile> {
  const raw = await redis.get(profileKey(userId));
  return parseProfile(raw);
}

export async function savePlayerProfile(userId: string, profile: PlayerProfile): Promise<void> {
  await redis.set(profileKey(userId), JSON.stringify(profile));
}

export function clampBankedAmount(amount: unknown): number {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(Math.floor(n), MAX_BANKED_PER_RUN));
}

export async function addBankedCoins(userId: string, bankedThisRun: number): Promise<PlayerProfile> {
  const amount = clampBankedAmount(bankedThisRun);
  if (amount <= 0) return getPlayerProfile(userId);

  const profile = await getPlayerProfile(userId);
  profile.coins += amount;
  await savePlayerProfile(userId, profile);
  return profile;
}

export async function selectCat(userId: string, catId: string): Promise<PlayerProfile> {
  getCatDefinition(catId);

  const profile = await getPlayerProfile(userId);
  if (!profile.ownedCats.includes(catId)) {
    throw new Error('Cat not owned');
  }

  profile.selectedCatId = catId;
  await savePlayerProfile(userId, profile);
  return profile;
}

export async function unlockCat(userId: string, catId: string): Promise<PlayerProfile> {
  getCatDefinition(catId);

  const price = getCatUnlockPrice(catId);
  if (price === null) {
    throw new Error('Cat is not unlockable');
  }

  const profile = await getPlayerProfile(userId);
  if (profile.ownedCats.includes(catId)) {
    return profile;
  }

  if (profile.coins < price) {
    throw new Error('Not enough coins');
  }

  profile.coins -= price;
  profile.ownedCats = [...profile.ownedCats, catId];
  profile.selectedCatId = catId;
  await savePlayerProfile(userId, profile);
  return profile;
}

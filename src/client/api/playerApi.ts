import type {
  ApiErrorResponse,
  ProfileResponse,
  RunCompleteRequest,
  RunCompleteResponse,
  SelectCatRequest,
  SelectCatResponse,
  UnlockCatRequest,
  UnlockCatResponse,
  BuyCosmeticRequest,
  BuyCosmeticResponse,
  EquipCosmeticRequest,
  EquipCosmeticResponse,
} from '../../shared/api.js';
import { getCosmeticDefinition } from '../../shared/cosmeticCatalog.js';
import {
  DEFAULT_PLAYER_PROFILE,
  normalizePlayerProfile,
  type CosmeticSlot,
  type PlayerProfile,
} from '../../shared/playerProfile.js';
import { getCatUnlockPrice } from '../../shared/catUnlocks.js';
import { setEquippedCosmetics, setSelectedCatId } from '../game/runConfig.js';

const LOCAL_PROFILE_KEY = 'cat-burglary-profile';

function readLocalProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_PROFILE };
    return normalizePlayerProfile(JSON.parse(raw) as Partial<PlayerProfile>);
  } catch {
    return { ...DEFAULT_PLAYER_PROFILE };
  }
}

function writeLocalProfile(profile: PlayerProfile): void {
  const normalized = normalizePlayerProfile(profile);
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(normalized));
  setSelectedCatId(normalized.selectedCatId);
  setEquippedCosmetics(normalized.equipped);
}

async function parseJson<T>(response: Response): Promise<T | ApiErrorResponse> {
  return (await response.json()) as T | ApiErrorResponse;
}

function isErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    (value as ApiErrorResponse).status === 'error'
  );
}

export async function fetchProfile(): Promise<PlayerProfile> {
  try {
    const response = await fetch('/api/profile');
    if (!response.ok) return readLocalProfile();

    const data = await parseJson<ProfileResponse>(response);
    if (isErrorResponse(data)) return readLocalProfile();

    writeLocalProfile(data.profile);
    return data.profile;
  } catch {
    return readLocalProfile();
  }
}

export async function completeRun(bankedThisRun: number): Promise<PlayerProfile> {
  const body: RunCompleteRequest = { bankedThisRun };

  try {
    const response = await fetch('/api/run-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return completeRunLocal(bankedThisRun);

    const data = await parseJson<RunCompleteResponse>(response);
    if (isErrorResponse(data)) return completeRunLocal(bankedThisRun);

    writeLocalProfile(data.profile);
    return data.profile;
  } catch {
    return completeRunLocal(bankedThisRun);
  }
}

export async function selectCat(catId: string): Promise<PlayerProfile> {
  const body: SelectCatRequest = { catId };

  try {
    const response = await fetch('/api/select-cat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return selectCatLocal(catId);

    const data = await parseJson<SelectCatResponse>(response);
    if (isErrorResponse(data)) return selectCatLocal(catId);

    writeLocalProfile(data.profile);
    return data.profile;
  } catch {
    return selectCatLocal(catId);
  }
}

export async function unlockCat(catId: string): Promise<PlayerProfile> {
  const body: UnlockCatRequest = { catId };

  try {
    const response = await fetch('/api/unlock-cat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await parseJson<ApiErrorResponse>(response);
      if (isErrorResponse(data)) throw new Error(data.message);
      return unlockCatLocal(catId);
    }

    const data = await parseJson<UnlockCatResponse>(response);
    if (isErrorResponse(data)) throw new Error(data.message);

    writeLocalProfile(data.profile);
    return data.profile;
  } catch (error) {
    if (error instanceof Error && error.message === 'Not enough coins') {
      throw error;
    }
    return unlockCatLocal(catId);
  }
}

function completeRunLocal(bankedThisRun: number): PlayerProfile {
  const profile = readLocalProfile();
  const earned = Math.max(0, Math.floor(bankedThisRun));
  if (earned > 0) {
    profile.coins += earned;
    writeLocalProfile(profile);
  }
  return profile;
}

function selectCatLocal(catId: string): PlayerProfile {
  const profile = readLocalProfile();
  if (!profile.ownedCats.includes(catId)) return profile;
  profile.selectedCatId = catId;
  writeLocalProfile(profile);
  return profile;
}

function unlockCatLocal(catId: string): PlayerProfile {
  const profile = readLocalProfile();
  const price = getCatUnlockPrice(catId);
  if (price === null) throw new Error('Cat is not unlockable');
  if (profile.ownedCats.includes(catId)) return profile;
  if (profile.coins < price) throw new Error('Not enough coins');

  profile.coins -= price;
  profile.ownedCats = [...profile.ownedCats, catId];
  profile.selectedCatId = catId;
  writeLocalProfile(profile);
  return profile;
}

export async function buyCosmetic(cosmeticId: string): Promise<PlayerProfile> {
  const body: BuyCosmeticRequest = { cosmeticId };

  try {
    const response = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await parseJson<ApiErrorResponse>(response);
      if (isErrorResponse(data)) throw new Error(data.message);
      return buyCosmeticLocal(cosmeticId);
    }

    const data = await parseJson<BuyCosmeticResponse>(response);
    if (isErrorResponse(data)) throw new Error(data.message);

    writeLocalProfile(data.profile);
    return data.profile;
  } catch (error) {
    if (error instanceof Error && error.message === 'Not enough coins') {
      throw error;
    }
    return buyCosmeticLocal(cosmeticId);
  }
}

export async function equipCosmetic(
  slot: CosmeticSlot,
  cosmeticId: string | null,
): Promise<PlayerProfile> {
  const body: EquipCosmeticRequest = { slot, cosmeticId };

  try {
    const response = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return equipCosmeticLocal(slot, cosmeticId);

    const data = await parseJson<EquipCosmeticResponse>(response);
    if (isErrorResponse(data)) return equipCosmeticLocal(slot, cosmeticId);

    writeLocalProfile(data.profile);
    return data.profile;
  } catch {
    return equipCosmeticLocal(slot, cosmeticId);
  }
}

function buyCosmeticLocal(cosmeticId: string): PlayerProfile {
  const cosmetic = getCosmeticDefinition(cosmeticId);
  if (!cosmetic) throw new Error('Unknown cosmetic');

  const profile = readLocalProfile();
  if (profile.ownedCosmetics.includes(cosmeticId)) return profile;
  if (profile.coins < cosmetic.price) throw new Error('Not enough coins');

  profile.coins -= cosmetic.price;
  profile.ownedCosmetics = [...profile.ownedCosmetics, cosmeticId];
  profile.equipped = { ...profile.equipped, [cosmetic.slot]: cosmeticId };
  writeLocalProfile(profile);
  return profile;
}

function equipCosmeticLocal(slot: CosmeticSlot, cosmeticId: string | null): PlayerProfile {
  const profile = readLocalProfile();

  if (cosmeticId === null) {
    const next = { ...profile.equipped };
    delete next[slot];
    profile.equipped = next;
    writeLocalProfile(profile);
    return profile;
  }

  const cosmetic = getCosmeticDefinition(cosmeticId);
  if (!cosmetic || cosmetic.slot !== slot || !profile.ownedCosmetics.includes(cosmeticId)) {
    return profile;
  }

  profile.equipped = { ...profile.equipped, [slot]: cosmeticId };
  writeLocalProfile(profile);
  return profile;
}

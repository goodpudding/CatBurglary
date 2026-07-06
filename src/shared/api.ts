import type { PlayerProfile } from './playerProfile.js';
import type { CosmeticDefinition } from './cosmeticCatalog.js';
import type { CosmeticSlot } from './playerProfile.js';

export type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
};

export type ProfileResponse = {
  type: 'profile';
  profile: PlayerProfile;
};

export type RunCompleteRequest = {
  bankedThisRun: number;
};

export type RunCompleteResponse = {
  type: 'run-complete';
  bankedThisRun: number;
  profile: PlayerProfile;
};

export type SelectCatRequest = {
  catId: string;
};

export type SelectCatResponse = {
  type: 'select-cat';
  profile: PlayerProfile;
};

export type UnlockCatRequest = {
  catId: string;
};

export type UnlockCatResponse = {
  type: 'unlock-cat';
  profile: PlayerProfile;
};

export type ShopItemView = CosmeticDefinition & {
  owned: boolean;
  equipped: boolean;
};

export type ShopResponse = {
  type: 'shop';
  coins: number;
  items: ShopItemView[];
};

export type BuyCosmeticRequest = {
  cosmeticId: string;
};

export type BuyCosmeticResponse = {
  type: 'buy-cosmetic';
  profile: PlayerProfile;
};

export type EquipCosmeticRequest = {
  slot: CosmeticSlot;
  cosmeticId: string | null;
};

export type EquipCosmeticResponse = {
  type: 'equip-cosmetic';
  profile: PlayerProfile;
};

export type ApiErrorResponse = {
  status: 'error';
  message: string;
};

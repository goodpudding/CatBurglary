import { DEFAULT_CAT_ID } from '../../shared/CatDefinition.js';
import type { EquippedCosmetics } from '../../shared/playerProfile.js';

const SELECTED_CAT_KEY = 'cat-burglary-selected-cat';
const EQUIPPED_KEY = 'cat-burglary-equipped';

export function getSelectedCatId(): string {
  return localStorage.getItem(SELECTED_CAT_KEY) ?? DEFAULT_CAT_ID;
}

export function setSelectedCatId(catId: string): void {
  localStorage.setItem(SELECTED_CAT_KEY, catId);
}

export function getEquippedCosmetics(): EquippedCosmetics {
  try {
    const raw = localStorage.getItem(EQUIPPED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as EquippedCosmetics;
  } catch {
    return {};
  }
}

export function setEquippedCosmetics(equipped: EquippedCosmetics): void {
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(equipped));
}

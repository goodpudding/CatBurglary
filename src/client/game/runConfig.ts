import { DEFAULT_CAT_ID } from '../../shared/CatDefinition.js';
import {
  DEFAULT_GAME_MODE,
  isValidGameModeId,
  type GameModeId,
} from '../../shared/gameModes.js';
import type { EquippedCosmetics } from '../../shared/playerProfile.js';

const SELECTED_CAT_KEY = 'cat-burglary-selected-cat';
const EQUIPPED_KEY = 'cat-burglary-equipped';
const GAME_MODE_KEY = 'treat-dash-game-mode';
/** Shared with the in-game VolumeSlider prefab and the splash slider. */
export const VOLUME_STORAGE_KEY = 'treat-dash-volume';
export const DEFAULT_VOLUME = 0.5;

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

export function getGameMode(): GameModeId {
  try {
    const raw = localStorage.getItem(GAME_MODE_KEY);
    if (raw && isValidGameModeId(raw)) return raw;
  } catch {
    // localStorage unavailable — use the default.
  }
  return DEFAULT_GAME_MODE;
}

export function setGameMode(mode: GameModeId): void {
  try {
    localStorage.setItem(GAME_MODE_KEY, mode);
  } catch {
    // Best effort only.
  }
}

/** Master volume shared between the splash slider and the in-game slider. */
export function getSavedVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw !== null && !Number.isNaN(Number(raw))) {
      return Math.min(1, Math.max(0, Number(raw)));
    }
  } catch {
    // localStorage unavailable — use the default.
  }
  return DEFAULT_VOLUME;
}

export function setSavedVolume(volume: number): void {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(Math.min(1, Math.max(0, volume))));
  } catch {
    // Best effort only.
  }
}

import { getSavedVolume } from './runConfig.js';

const MENU_TRACK = 'sound/music-for-game-fun-kid-game.mp3';
/** Track's own level; the player's master volume scales on top of this. */
const MENU_BASE_VOLUME = 0.32;

let menuMusic: HTMLAudioElement | null = null;
let unlockListenerAttached = false;

function attachUnlockListener(): void {
  if (unlockListenerAttached) return;
  unlockListenerAttached = true;

  const unlock = (): void => {
    void startMenuMusic();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  };

  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
}

/** Looping music for the splash / cat-picker screen. */
export function startMenuMusic(): void {
  if (menuMusic && !menuMusic.paused) return;

  if (!menuMusic) {
    menuMusic = new Audio(MENU_TRACK);
    menuMusic.loop = true;
  }
  menuMusic.volume = MENU_BASE_VOLUME * getSavedVolume();

  void menuMusic.play().catch(() => {
    attachUnlockListener();
  });
}

/** Live-update from the splash volume slider (master volume, 0-1). */
export function setMenuMusicMasterVolume(master: number): void {
  if (!menuMusic) return;
  menuMusic.volume = MENU_BASE_VOLUME * Math.min(1, Math.max(0, master));
}

export function stopMenuMusic(): void {
  if (!menuMusic) return;
  menuMusic.pause();
  menuMusic.currentTime = 0;
}

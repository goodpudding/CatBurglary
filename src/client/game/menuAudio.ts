const MENU_TRACK = 'sound/music-for-game-fun-kid-game.mp3';

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
    menuMusic.volume = 0.32;
  }

  void menuMusic.play().catch(() => {
    attachUnlockListener();
  });
}

export function stopMenuMusic(): void {
  if (!menuMusic) return;
  menuMusic.pause();
  menuMusic.currentTime = 0;
}

/** Shared splash → expanded game handoff (same palette as splash + Phaser). */
const LAUNCH_BG = '#1a1a2e';

/** Warm the game entry in the background while the player picks a cat. */
export function prefetchGameEntry(): void {
  const href = new URL('./game.html', window.location.href).href;
  if (document.querySelector(`link[data-prefetch-game="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'document';
  link.href = href;
  link.setAttribute('data-prefetch-game', href);
  document.head.appendChild(link);
}

/** Immediate feedback on splash before Reddit opens the expanded modal. */
export function beginSplashLaunch(): void {
  const overlay = document.getElementById('launch-overlay');
  const button = document.getElementById('sneak-in-button') as HTMLButtonElement | null;
  overlay?.classList.add('is-active');
  overlay?.setAttribute('aria-hidden', 'false');
  if (button) {
    button.disabled = true;
    button.textContent = 'Sneaking in…';
  }
}

export function setGameLaunchProgress(ratio: number): void {
  const bar = document.getElementById('launch-progress-bar') as HTMLProgressElement | null;
  if (!bar) return;
  const clamped = Math.max(0, Math.min(1, ratio));
  bar.value = clamped;
  const label = document.getElementById('launch-status');
  if (label) label.textContent = clamped >= 1 ? 'Almost there…' : 'Sneaking in…';
}

/** Fade out the game.html boot screen once BootScene has finished loading. */
export function hideGameLaunchScreen(): void {
  const screen = document.getElementById('launch-screen');
  if (!screen || screen.classList.contains('is-hidden')) return;
  screen.classList.add('is-hidden');
  window.setTimeout(() => screen.remove(), 480);
}

export const launchScreenBackground = LAUNCH_BG;

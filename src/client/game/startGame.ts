import { requestExpandedMode } from '@devvit/web/client';
import { stopMenuMusic } from './menuAudio.js';

type DevvitRuntime = {
  entrypoints?: Record<string, string>;
};

function hasDevvitRuntime(): boolean {
  const devvit = (globalThis as { devvit?: DevvitRuntime }).devvit;
  return Boolean(devvit?.entrypoints?.game);
}

/** Launch the Phaser game — expanded mode on Reddit, plain navigation when developing locally. */
export function startGame(event: MouseEvent): void {
  stopMenuMusic();

  if (hasDevvitRuntime()) {
    try {
      requestExpandedMode(event, 'game');
      return;
    } catch (error) {
      console.warn('Could not enter expanded mode:', error);
    }
  }

  window.location.assign(new URL('./game.html', window.location.href).href);
}

import { getWebViewMode, requestExpandedMode } from '@devvit/web/client';
import { beginSplashLaunch } from './launchTransition.js';
import { stopMenuMusic } from './menuAudio.js';

type DevvitRuntime = {
  entrypoints?: Record<string, string>;
};

function hasDevvitRuntime(): boolean {
  const devvit = (globalThis as { devvit?: DevvitRuntime }).devvit;
  return Boolean(devvit?.entrypoints?.game);
}

function isExpanded(): boolean {
  try {
    return getWebViewMode() === 'expanded';
  } catch {
    return false;
  }
}

/** Launch the Phaser game — expanded mode on Reddit, plain navigation when developing locally. */
export function startGame(event: MouseEvent): void {
  stopMenuMusic();
  beginSplashLaunch();

  if (hasDevvitRuntime()) {
    try {
      if (isExpanded()) {
        window.location.assign(new URL('./game.html', window.location.href).href);
        return;
      }
      requestExpandedMode(event, 'game');
      return;
    } catch (error) {
      console.warn('Could not enter expanded mode:', error);
    }
  }

  window.location.assign(new URL('./game.html', window.location.href).href);
}

/** Expand the splash entry (same page) so suit-up menus can scroll safely. */
export function expandSplash(event: MouseEvent): boolean {
  if (!hasDevvitRuntime() || isExpanded()) return false;
  try {
    requestExpandedMode(event, 'default');
    return true;
  } catch (error) {
    console.warn('Could not expand splash:', error);
    return false;
  }
}

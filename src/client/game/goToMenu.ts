import { exitExpandedMode, getWebViewMode } from '@devvit/web/client';
import { setReturnPanel } from '../splashNavigation.js';

type DevvitRuntime = {
  entrypoints?: Record<string, string>;
};

function hasDevvitRuntime(): boolean {
  const devvit = (globalThis as { devvit?: DevvitRuntime }).devvit;
  return Boolean(devvit?.entrypoints?.default);
}

/** Return to splash (shop + cat picker). Collapses expanded Reddit view when applicable. */
export function goToMenu(event: Event, panel: 'cats' | 'shop' = 'shop'): void {
  setReturnPanel(panel);

  if (hasDevvitRuntime()) {
    try {
      if (getWebViewMode() === 'expanded') {
        exitExpandedMode(event as MouseEvent);
        return;
      }
    } catch (error) {
      console.warn('Could not exit expanded mode:', error);
    }
  }

  window.location.assign(new URL(`./splash.html#${panel}`, window.location.href).href);
}

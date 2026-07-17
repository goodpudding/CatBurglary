import { getWebViewMode } from '@devvit/web/client';

const PENDING_SETUP_KEY = 'splash-pending-setup';

export type PendingSetupPanel = 'cats' | 'shop' | 'mode';

export function hasPendingSetupPanel(): boolean {
  return sessionStorage.getItem(PENDING_SETUP_KEY) != null;
}

export function setPendingSetupPanel(panel: PendingSetupPanel): void {
  sessionStorage.setItem(PENDING_SETUP_KEY, panel);
}

export function consumePendingSetupPanel(): PendingSetupPanel | null {
  const panel = sessionStorage.getItem(PENDING_SETUP_KEY);
  sessionStorage.removeItem(PENDING_SETUP_KEY);
  if (panel === 'cats' || panel === 'shop' || panel === 'mode') return panel;
  return null;
}

export function isInlineWebView(): boolean {
  return readWebViewMode() === 'inline';
}

export function isExpandedWebView(): boolean {
  return readWebViewMode() === 'expanded';
}

function readWebViewMode(): 'inline' | 'expanded' {
  try {
    return getWebViewMode();
  } catch {
    // Local dev / no Devvit shell — treat as expanded so menus stay scrollable.
    return 'expanded';
  }
}

/** Reddit inline posts must not scroll inside the webview (feed scroll trap). */
export function syncWebViewScrollLock(): void {
  const expanded = isExpandedWebView();
  const app = document.querySelector('.app');
  app?.classList.toggle('is-expanded', expanded);
  app?.classList.toggle('is-inline', !expanded);
  document.documentElement.classList.toggle('webview-expanded', expanded);
  document.documentElement.classList.toggle('webview-inline', !expanded);
}

export function initWebViewScrollLock(): void {
  syncWebViewScrollLock();

  window.addEventListener('message', (ev) => {
    if (ev.data?.type === 'devvit-message' && ev.data?.data?.immersiveModeEvent) {
      syncWebViewScrollLock();
    }
  });
  window.addEventListener('focus', syncWebViewScrollLock);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncWebViewScrollLock();
  });
}

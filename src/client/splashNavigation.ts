export type SplashPanel = 'cats' | 'shop';

const STORAGE_KEY = 'splash-panel';

export function setReturnPanel(panel: SplashPanel): void {
  sessionStorage.setItem(STORAGE_KEY, panel);
}

export function consumeReturnPanel(): SplashPanel | null {
  const panel = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (panel === 'cats' || panel === 'shop') return panel;
  return null;
}

export function showPanel(panel: SplashPanel): void {
  document.querySelectorAll<HTMLElement>('.splash-panel').forEach((el) => {
    el.hidden = el.dataset.panel !== panel;
  });
  document.querySelectorAll<HTMLButtonElement>('.splash-tab').forEach((tab) => {
    const active = tab.dataset.panel === panel;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function panelFromHash(): SplashPanel | null {
  const hash = location.hash.replace('#', '');
  if (hash === 'shop' || hash === 'cats') return hash;
  return null;
}

export function initSplashNavigation(): void {
  const initial = consumeReturnPanel() ?? panelFromHash() ?? 'cats';
  showPanel(initial);

  document.querySelectorAll<HTMLButtonElement>('.splash-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const panel = tab.dataset.panel as SplashPanel;
      showPanel(panel);
      history.replaceState(null, '', `#${panel}`);
    });
  });

  const applyPending = (): void => {
    const pending = consumeReturnPanel();
    if (pending) showPanel(pending);
  };

  window.addEventListener('focus', applyPending);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applyPending();
  });
}

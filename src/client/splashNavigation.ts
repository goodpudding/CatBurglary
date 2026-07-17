import { isInlineWebView } from './game/webViewScrollLock.js';

export type SplashStep = 'home' | 'setup';
export type SplashPanel = 'cats' | 'shop' | 'mode';

const PANEL_KEY = 'splash-panel';
const STEP_KEY = 'splash-step';

export function setReturnSplashState(step: SplashStep, panel: SplashPanel = 'shop'): void {
  sessionStorage.setItem(STEP_KEY, step);
  sessionStorage.setItem(PANEL_KEY, panel);
}

export function setReturnPanel(panel: SplashPanel): void {
  setReturnSplashState('setup', panel);
}

export function consumeReturnSplashState(): { step: SplashStep; panel: SplashPanel } | null {
  const step = sessionStorage.getItem(STEP_KEY);
  const panel = sessionStorage.getItem(PANEL_KEY);
  sessionStorage.removeItem(STEP_KEY);
  sessionStorage.removeItem(PANEL_KEY);
  if (step !== 'home' && step !== 'setup') return null;
  const resolvedPanel =
    panel === 'shop' || panel === 'cats' || panel === 'mode' ? panel : 'cats';
  return { step, panel: resolvedPanel };
}

/** @deprecated Use consumeReturnSplashState */
export function consumeReturnPanel(): SplashPanel | null {
  const state = consumeReturnSplashState();
  return state?.step === 'setup' ? state.panel : null;
}

export function showStep(step: SplashStep): void {
  document.querySelectorAll<HTMLElement>('.splash-step').forEach((el) => {
    const active = el.dataset.step === step;
    el.hidden = !active;
    el.classList.toggle('is-active', active);
  });
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
  if (hash === 'shop' || hash === 'setup-shop') return 'shop';
  if (hash === 'mode' || hash === 'setup-mode') return 'mode';
  if (hash === 'cats' || hash === 'setup' || hash === 'setup-cats') return 'cats';
  return null;
}

function stepFromHash(): SplashStep | null {
  const hash = location.hash.replace('#', '');
  if (
    hash === 'shop' ||
    hash === 'cats' ||
    hash === 'mode' ||
    hash === 'setup' ||
    hash === 'setup-shop' ||
    hash === 'setup-cats' ||
    hash === 'setup-mode'
  ) {
    return 'setup';
  }
  if (hash === 'home') return 'home';
  return null;
}

export function initSplashNavigation(onEnterSetup?: () => void): void {
  const returned = consumeReturnSplashState();
  const hashPanel = panelFromHash();
  const hashStep = stepFromHash();

  const step: SplashStep =
    returned?.step ?? hashStep ?? 'home';
  const panel: SplashPanel = returned?.panel ?? hashPanel ?? 'cats';

  showStep(step);
  if (step === 'setup' && !isInlineWebView()) {
    showPanel(panel);
    onEnterSetup?.();
  }

  document.querySelectorAll<HTMLButtonElement>('.splash-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextPanel = tab.dataset.panel as SplashPanel;
      showPanel(nextPanel);
      history.replaceState(null, '', `#setup-${nextPanel}`);
    });
  });

  const applyPending = (): void => {
    const pending = consumeReturnSplashState();
    if (!pending) return;
    showStep(pending.step);
    if (pending.step === 'setup' && !isInlineWebView()) {
      showPanel(pending.panel);
      onEnterSetup?.();
    }
  };

  window.addEventListener('focus', applyPending);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applyPending();
  });
}

export function navigateToSetup(panel: SplashPanel = 'cats'): void {
  showStep('setup');
  showPanel(panel);
  history.replaceState(null, '', `#setup-${panel}`);
}

export function navigateToHome(): void {
  showStep('home');
  history.replaceState(null, '', location.pathname + location.search);
}

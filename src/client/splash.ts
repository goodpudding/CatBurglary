import { context, navigateTo } from '@devvit/web/client';
import { GAME_MODES, type GameModeId } from '../shared/gameModes.js';
import type { PlayerProfile } from '../shared/playerProfile.js';
import { fetchProfile } from './api/playerApi.js';
import { stopCatPickerPreviews } from './catPickerPreview.js';
import { setMenuMusicMasterVolume, startMenuMusic } from './game/menuAudio.js';
import { prefetchGameEntry } from './game/launchTransition.js';
import { getGameMode, getSavedVolume, setGameMode, setSavedVolume } from './game/runConfig.js';
import { expandSplash, startGame } from './game/startGame.js';
import {
  consumePendingSetupPanel,
  hasPendingSetupPanel,
  initWebViewScrollLock,
  isExpandedWebView,
  setPendingSetupPanel,
} from './game/webViewScrollLock.js';
import { renderCatPicker, updateCoinsDisplayFromProfile } from './splashCatPicker.js';
import {
  initSplashNavigation,
  navigateToHome,
  navigateToSetup,
  type SplashPanel,
} from './splashNavigation.js';
import { renderShop } from './splashShop.js';

const enterSetupButton = document.getElementById('enter-setup-button') as HTMLButtonElement;
const sneakInButton = document.getElementById('sneak-in-button') as HTMLButtonElement;
const backHomeButton = document.getElementById('back-home-button') as HTMLButtonElement;
const titleElement = document.getElementById('title') as HTMLHeadingElement;
const catPickerElement = document.getElementById('cat-picker') as HTMLElement;
const shopElement = document.getElementById('shop') as HTMLElement;
const docsLink = document.getElementById('docs-link') as HTMLSpanElement;
const discordLink = document.getElementById('discord-link') as HTMLSpanElement;

let cachedProfile: PlayerProfile | null = null;

function applyProfileToSetup(profile: PlayerProfile): void {
  updateCoinsDisplayFromProfile(profile);
  renderCatPicker(catPickerElement, profile);
  renderShop(shopElement, profile);
}

function finishEnterSetup(panel: SplashPanel = 'cats'): void {
  navigateToSetup(panel);
  prefetchGameEntry();
  renderModePicker();
  if (cachedProfile) {
    applyProfileToSetup(cachedProfile);
  } else {
    void loadProfile();
  }
}

initWebViewScrollLock();

const pendingPanel = consumePendingSetupPanel();
if (pendingPanel && isExpandedWebView()) {
  finishEnterSetup(pendingPanel);
} else {
  initSplashNavigation(() => finishEnterSetup('cats'));
}

enterSetupButton.addEventListener('click', (e) => {
  if (expandSplash(e)) {
    if (!hasPendingSetupPanel()) {
      setPendingSetupPanel('cats');
    }
    return;
  }
  finishEnterSetup('cats');
});

backHomeButton.addEventListener('click', () => {
  stopCatPickerPreviews();
  navigateToHome();
});

sneakInButton.addEventListener('click', (e) => {
  startGame(e);
});

docsLink.addEventListener('click', () => {
  navigateTo('https://developers.reddit.com/docs');
});

discordLink.addEventListener('click', () => {
  navigateTo('https://discord.com/invite/Cd43ExtEFS');
});

titleElement.textContent = context.username
  ? `Hey ${context.username} — ready to sneak?`
  : 'Treat Dash';

initVolumeSlider();
startMenuMusic();
void loadProfile();

function initVolumeSlider(): void {
  const slider = document.getElementById('volume-slider') as HTMLInputElement | null;
  if (!slider) return;

  slider.value = String(Math.round(getSavedVolume() * 100));
  slider.addEventListener('input', () => {
    const volume = Number(slider.value) / 100;
    setSavedVolume(volume);
    setMenuMusicMasterVolume(volume);
  });
}

function renderModePicker(): void {
  const container = document.getElementById('mode-picker');
  if (!container) return;

  const selected = getGameMode();
  container.innerHTML = `
    <h2 class="mode-title">Pick a mode</h2>
    <p class="mode-subtitle">How tough should this heist be?</p>
    <div class="mode-row mode-row-stack">
      ${GAME_MODES.map(
        (mode) => `
        <button type="button" class="mode-card${mode.id === selected ? ' is-selected' : ''}" data-mode="${mode.id}">
          <span class="mode-icon" aria-hidden="true">${mode.icon}</span>
          <span class="mode-name">${mode.name}</span>
          <span class="mode-desc">${mode.description}</span>
        </button>`,
      ).join('')}
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>('.mode-card').forEach((button) => {
    button.addEventListener('click', () => {
      setGameMode(button.dataset.mode as GameModeId);
      container.querySelectorAll('.mode-card').forEach((card) => {
        card.classList.toggle('is-selected', card === button);
      });
    });
  });
}

async function loadProfile(): Promise<void> {
  cachedProfile = await fetchProfile();
  const setup = document.getElementById('splash-setup');
  if (setup && !setup.hidden) {
    applyProfileToSetup(cachedProfile);
  }
}

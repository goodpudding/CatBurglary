import { context, navigateTo } from '@devvit/web/client';
import { GAME_MODES, type GameModeId } from '../shared/gameModes.js';
import { fetchProfile } from './api/playerApi.js';
import { setMenuMusicMasterVolume, startMenuMusic } from './game/menuAudio.js';
import { getGameMode, getSavedVolume, setGameMode, setSavedVolume } from './game/runConfig.js';
import { startGame } from './game/startGame.js';
import { renderCatPicker, updateCoinsDisplayFromProfile } from './splashCatPicker.js';
import { initSplashNavigation } from './splashNavigation.js';
import { renderShop } from './splashShop.js';

const startButton = document.getElementById('start-button') as HTMLButtonElement;
const titleElement = document.getElementById('title') as HTMLHeadingElement;
const catPickerElement = document.getElementById('cat-picker') as HTMLElement;
const shopElement = document.getElementById('shop') as HTMLElement;
const docsLink = document.getElementById('docs-link') as HTMLSpanElement;
const discordLink = document.getElementById('discord-link') as HTMLSpanElement;

initSplashNavigation();

startButton.addEventListener('click', (e) => {
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
renderModePicker();
startMenuMusic();
void loadProfile();

/** Splash-side master volume — same saved value the in-game slider uses. */
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
    <h2 class="mode-title">Game Mode</h2>
    <div class="mode-row">
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
  const profile = await fetchProfile();
  updateCoinsDisplayFromProfile(profile);
  renderCatPicker(catPickerElement, profile);
  renderShop(shopElement, profile);
}

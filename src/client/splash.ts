import { context, navigateTo } from '@devvit/web/client';
import { fetchProfile } from './api/playerApi.js';
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
  : 'Cat Burglary';

void loadProfile();

async function loadProfile(): Promise<void> {
  const profile = await fetchProfile();
  updateCoinsDisplayFromProfile(profile);
  renderCatPicker(catPickerElement, profile);
  renderShop(shopElement, profile);
}

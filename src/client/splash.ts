import { context, navigateTo, requestExpandedMode } from '@devvit/web/client';

const startButton = document.getElementById('start-button') as HTMLButtonElement;
const titleElement = document.getElementById('title') as HTMLHeadingElement;
const docsLink = document.getElementById('docs-link') as HTMLSpanElement;
const discordLink = document.getElementById('discord-link') as HTMLSpanElement;

startButton.addEventListener('click', (e) => {
  requestExpandedMode(e, 'game');
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

import { CAT_ROSTER, getCatDefinition, type CatDefinition } from '../shared/CatDefinition.js';
import { getCatUnlockPrice } from '../shared/catUnlocks.js';
import type { PlayerProfile } from '../shared/playerProfile.js';
import { selectCat, unlockCat } from './api/playerApi.js';
import { mountCatPickerPreviews, stopCatPickerPreviews } from './catPickerPreview.js';

function renderCatCard(cat: CatDefinition, profile: PlayerProfile): string {
  const owned = profile.ownedCats.includes(cat.id);
  const selected = profile.selectedCatId === cat.id;
  const price = getCatUnlockPrice(cat.id);
  const locked = !owned && price !== null;

  const actionLabel = locked
    ? `Unlock · ${price} coins`
    : selected
      ? 'Selected'
      : 'Select';

  const actionClass = locked ? 'cat-action unlock' : selected ? 'cat-action selected' : 'cat-action';

  return `
    <article class="cat-card${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}" data-cat-id="${cat.id}">
      <div class="cat-preview-wrap">
        <canvas class="cat-preview" data-cat-id="${cat.id}" aria-hidden="true"></canvas>
      </div>
      <h3 class="cat-name">${cat.name}</h3>
      <p class="cat-tagline">${cat.tagline}</p>
      <button type="button" class="${actionClass}" data-cat-id="${cat.id}" ${selected && !locked ? 'disabled' : ''}>
        ${actionLabel}
      </button>
    </article>`;
}

export function renderCatPicker(container: HTMLElement, profile: PlayerProfile): void {
  stopCatPickerPreviews();

  container.innerHTML = `
    <h2 class="cat-picker-title">Choose your cat</h2>
    <div class="cat-picker-row">
      ${CAT_ROSTER.map((cat) => renderCatCard(cat, profile)).join('')}
    </div>
    <p class="cat-picker-hint" id="cat-picker-hint"></p>
  `;

  const hint = container.querySelector('#cat-picker-hint') as HTMLParagraphElement;

  container.querySelectorAll<HTMLButtonElement>('.cat-action').forEach((button) => {
    button.addEventListener('click', () => {
      void handleCatAction(button.dataset.catId!, profile, container, hint);
    });
  });

  void mountCatPickerPreviews(container);
}

async function handleCatAction(
  catId: string,
  profile: PlayerProfile,
  container: HTMLElement,
  hint: HTMLParagraphElement,
): Promise<void> {
  const owned = profile.ownedCats.includes(catId);
  const price = getCatUnlockPrice(catId);

  try {
    hint.textContent = '';
    const updated = owned ? await selectCat(catId) : await unlockCat(catId);
    renderCatPicker(container, updated);
    updateCoinsDisplay(updated.coins);
  } catch (error) {
    hint.textContent =
      error instanceof Error && error.message === 'Not enough coins'
        ? `Need ${price} coins to unlock ${getCatDefinition(catId).name}.`
        : 'Could not update your cat. Try again.';
  }
}

function updateCoinsDisplay(coins: number): void {
  const coinsElement = document.getElementById('coins');
  if (coinsElement) {
    coinsElement.textContent = `${coins.toLocaleString()} coins saved`;
    coinsElement.hidden = false;
  }
}

export function updateCoinsDisplayFromProfile(profile: PlayerProfile): void {
  updateCoinsDisplay(profile.coins);
}

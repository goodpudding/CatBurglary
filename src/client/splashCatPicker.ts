import {
  CAT_ROSTER,
  formatStatLabel,
  getCatDefinition,
  statRating,
  type CatDefinition,
  type CatStats,
} from '../shared/CatDefinition.js';
import { getCatUnlockPrice } from '../shared/catUnlocks.js';
import type { PlayerProfile } from '../shared/playerProfile.js';
import { selectCat, unlockCat } from './api/playerApi.js';
import { mountSingleCatPreview, stopCatPickerPreviews } from './catPickerPreview.js';

const STAT_KEYS: (keyof CatStats)[] = ['moveSpeed', 'jumpVelocity', 'knockbackMultiplier', 'scoreMultiplier'];

function renderStatRows(cat: CatDefinition): string {
  return STAT_KEYS.map((stat) => {
    const rating = statRating(stat, cat.stats[stat]);
    return `
      <div class="stat-row">
        <span class="stat-label">${formatStatLabel(stat)}</span>
        <span class="stat-bar"><span class="stat-fill" style="width:${Math.round(rating * 100)}%"></span></span>
      </div>`;
  }).join('');
}

function renderNameButton(cat: CatDefinition, profile: PlayerProfile, previewId: string): string {
  const owned = profile.ownedCats.includes(cat.id);
  const selected = profile.selectedCatId === cat.id;
  const locked = !owned && getCatUnlockPrice(cat.id) !== null;

  return `
    <button
      type="button"
      class="cat-name-btn${cat.id === previewId ? ' is-preview' : ''}${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}"
      data-cat-id="${cat.id}"
      aria-pressed="${cat.id === previewId ? 'true' : 'false'}"
    >
      ${cat.name}${locked ? ' 🔒' : ''}
    </button>`;
}

function actionLabel(catId: string, profile: PlayerProfile): { label: string; className: string; disabled: boolean } {
  const owned = profile.ownedCats.includes(catId);
  const selected = profile.selectedCatId === catId;
  const price = getCatUnlockPrice(catId);

  if (!owned && price !== null) {
    return { label: `Unlock · ${price} coins`, className: 'cat-action unlock', disabled: false };
  }
  if (selected) {
    return { label: 'Selected', className: 'cat-action selected', disabled: true };
  }
  return { label: 'Select', className: 'cat-action', disabled: false };
}

function updatePreviewPanel(container: HTMLElement, catId: string, profile: PlayerProfile): void {
  const cat = getCatDefinition(catId);
  const action = actionLabel(catId, profile);

  const tagline = container.querySelector('.cat-preview-tagline');
  const stats = container.querySelector('.cat-preview-stats');
  const button = container.querySelector<HTMLButtonElement>('.cat-action');
  const name = container.querySelector('.cat-preview-name');

  if (name) name.textContent = cat.name;
  if (tagline) tagline.textContent = cat.tagline;
  if (stats) stats.innerHTML = renderStatRows(cat);
  if (button) {
    button.textContent = action.label;
    button.className = action.className;
    button.disabled = action.disabled;
    button.dataset.catId = catId;
  }

  container.querySelectorAll<HTMLButtonElement>('.cat-name-btn').forEach((btn) => {
    const active = btn.dataset.catId === catId;
    btn.classList.toggle('is-preview', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const canvas = container.querySelector<HTMLCanvasElement>('.cat-preview-main');
  if (canvas) void mountSingleCatPreview(canvas, catId);
}

export function renderCatPicker(container: HTMLElement, profile: PlayerProfile): void {
  stopCatPickerPreviews();

  const previewId = profile.selectedCatId;
  const previewCat = getCatDefinition(previewId);
  const action = actionLabel(previewId, profile);

  container.innerHTML = `
    <h2 class="cat-picker-title">Choose your cat</h2>
    <div class="cat-picker-layout">
      <div class="cat-preview-stage">
        <canvas class="cat-preview-main" aria-hidden="true"></canvas>
        <h3 class="cat-preview-name">${previewCat.name}</h3>
        <p class="cat-preview-tagline">${previewCat.tagline}</p>
        <div class="cat-preview-stats">${renderStatRows(previewCat)}</div>
        <button type="button" class="${action.className}" data-cat-id="${previewId}" ${action.disabled ? 'disabled' : ''}>
          ${action.label}
        </button>
      </div>
      <div class="cat-name-list" role="listbox" aria-label="Cat roster">
        ${CAT_ROSTER.map((cat) => renderNameButton(cat, profile, previewId)).join('')}
      </div>
    </div>
    <p class="cat-picker-hint" id="cat-picker-hint"></p>
  `;

  const hint = container.querySelector('#cat-picker-hint') as HTMLParagraphElement;
  const canvas = container.querySelector<HTMLCanvasElement>('.cat-preview-main')!;
  void mountSingleCatPreview(canvas, previewId);

  container.querySelectorAll<HTMLButtonElement>('.cat-name-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const catId = button.dataset.catId!;
      updatePreviewPanel(container, catId, profile);
    });
  });

  container.querySelector<HTMLButtonElement>('.cat-action')?.addEventListener('click', () => {
    const catId = container.querySelector<HTMLButtonElement>('.cat-action')?.dataset.catId;
    if (catId) void handleCatAction(catId, profile, container, hint);
  });
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

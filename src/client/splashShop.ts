import {
  buildShopItems,
  formatCosmeticSlot,
  type ShopItemState,
} from '../shared/cosmeticCatalog.js';
import type { CosmeticSlot, PlayerProfile } from '../shared/playerProfile.js';
import { buyCosmetic, equipCosmetic } from './api/playerApi.js';
import { renderCatPicker, updateCoinsDisplayFromProfile } from './splashCatPicker.js';

function renderShopItem(item: ShopItemState): string {
  let actionLabel: string;
  let actionClass: string;

  if (!item.owned) {
    actionLabel = `Buy · ${item.price}`;
    actionClass = 'shop-action buy';
  } else if (item.equipped) {
    actionLabel = 'Equipped';
    actionClass = 'shop-action equipped';
  } else {
    actionLabel = 'Equip';
    actionClass = 'shop-action equip';
  }

  return `
    <article class="shop-card${item.equipped ? ' is-equipped' : ''}${!item.owned ? ' is-locked' : ''}" data-cosmetic-id="${item.id}" data-slot="${item.slot}">
      <div class="shop-icon" aria-hidden="true">${item.icon}</div>
      <h3 class="shop-name">${item.name}</h3>
      <p class="shop-slot">${formatCosmeticSlot(item.slot)}</p>
      <p class="shop-desc">${item.description}</p>
      <button type="button" class="${actionClass}" data-cosmetic-id="${item.id}" data-slot="${item.slot}" data-owned="${item.owned}" data-equipped="${item.equipped}">
        ${actionLabel}
      </button>
    </article>`;
}

export function renderShop(container: HTMLElement, profile: PlayerProfile): void {
  const items = buildShopItems(profile);

  container.innerHTML = `
    <h2 class="shop-title">Burglar Boutique</h2>
    <p class="shop-subtitle">Spend banked coins on classy cat accessories.</p>
    <div class="shop-row">
      ${items.map((item) => renderShopItem(item)).join('')}
    </div>
    <p class="shop-hint" id="shop-hint"></p>
  `;

  const hint = container.querySelector('#shop-hint') as HTMLParagraphElement;

  container.querySelectorAll<HTMLButtonElement>('.shop-action').forEach((button) => {
    button.addEventListener('click', () => {
      void handleShopAction(button, container, hint);
    });
  });
}

async function handleShopAction(
  button: HTMLButtonElement,
  container: HTMLElement,
  hint: HTMLParagraphElement,
): Promise<void> {
  const cosmeticId = button.dataset.cosmeticId!;
  const slot = button.dataset.slot as CosmeticSlot;
  const owned = button.dataset.owned === 'true';
  const equipped = button.dataset.equipped === 'true';

  try {
    hint.textContent = '';

    let updated: PlayerProfile;
    if (!owned) {
      updated = await buyCosmetic(cosmeticId);
    } else if (equipped) {
      updated = await equipCosmetic(slot, null);
    } else {
      updated = await equipCosmetic(slot, cosmeticId);
    }

    renderShop(container, updated);
    updateCoinsDisplayFromProfile(updated);
    refreshCatPicker(updated);
  } catch (error) {
    hint.textContent =
      error instanceof Error && error.message === 'Not enough coins'
        ? 'Not enough coins for that item.'
        : 'Shop update failed. Try again.';
  }
}

function refreshCatPicker(profile: PlayerProfile): void {
  const catPicker = document.getElementById('cat-picker');
  if (!catPicker) return;
  renderCatPicker(catPicker, profile);
}

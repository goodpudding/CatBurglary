/** Cats available from the start without spending coins. */
export const STARTER_CAT_IDS = ['tabby'] as const;

/**
 * Coin price to unlock the rest of the roster. Existing profiles keep any
 * cats they already own — prices only gate cats not yet in ownedCats.
 */
export const CAT_UNLOCK_PRICES: Readonly<Record<string, number>> = {
  bolt: 100,
  muffin: 150,
  bandit: 250,
  chonk: 400,
};

export function getCatUnlockPrice(catId: string): number | null {
  return CAT_UNLOCK_PRICES[catId] ?? null;
}

export function isStarterCat(catId: string): boolean {
  return (STARTER_CAT_IDS as readonly string[]).includes(catId);
}

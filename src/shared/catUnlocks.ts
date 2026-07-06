/** Cats available from the start without spending coins. */
export const STARTER_CAT_IDS = ['tabby', 'bolt', 'muffin', 'chonk'] as const;

/** Coin price to unlock premium cats. Omitted ids are free once listed in STARTER_CAT_IDS. */
export const CAT_UNLOCK_PRICES: Readonly<Record<string, number>> = {
  bandit: 150,
};

export function getCatUnlockPrice(catId: string): number | null {
  return CAT_UNLOCK_PRICES[catId] ?? null;
}

export function isStarterCat(catId: string): boolean {
  return (STARTER_CAT_IDS as readonly string[]).includes(catId);
}

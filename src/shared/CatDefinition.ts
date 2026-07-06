export interface CatStats {
  moveSpeed: number;
  jumpVelocity: number;
  knockbackMultiplier: number;
  scoreMultiplier: number;
}

export interface CatDefinition {
  id: string;
  name: string;
  tagline: string;
  color: number;
  strokeColor: number;
  stats: CatStats;
}

export const DEFAULT_CAT_ID = 'tabby';

export const CAT_ROSTER: CatDefinition[] = [
  {
    id: 'tabby',
    name: 'Tabby',
    tagline: 'Balanced all-rounder',
    color: 0xff6b35,
    strokeColor: 0xcc4400,
    stats: {
      moveSpeed: 280,
      jumpVelocity: -720,
      knockbackMultiplier: 1,
      scoreMultiplier: 1,
    },
  },
  {
    id: 'bolt',
    name: 'Bolt',
    tagline: 'Blazing speed, shorter hops',
    color: 0x42a5f5,
    strokeColor: 0x1565c0,
    stats: {
      moveSpeed: 350,
      jumpVelocity: -620,
      knockbackMultiplier: 1.25,
      scoreMultiplier: 1,
    },
  },
  {
    id: 'muffin',
    name: 'Muffin',
    tagline: 'Floaty jumps, leisurely pace',
    color: 0xce93d8,
    strokeColor: 0x8e24aa,
    stats: {
      moveSpeed: 245,
      jumpVelocity: -850,
      knockbackMultiplier: 1.1,
      scoreMultiplier: 1,
    },
  },
  {
    id: 'chonk',
    name: 'Chonk',
    tagline: 'Hard to budge, steady climber',
    color: 0x78909c,
    strokeColor: 0x455a64,
    stats: {
      moveSpeed: 255,
      jumpVelocity: -690,
      knockbackMultiplier: 0.5,
      scoreMultiplier: 1,
    },
  },
  {
    id: 'bandit',
    name: 'Bandit',
    tagline: 'Snack thief — bonus points',
    color: 0xffca28,
    strokeColor: 0xf57f17,
    stats: {
      moveSpeed: 265,
      jumpVelocity: -700,
      knockbackMultiplier: 0.95,
      scoreMultiplier: 1.5,
    },
  },
];

const catsById = new Map(CAT_ROSTER.map((cat) => [cat.id, cat]));

export function getCatDefinition(catId: string): CatDefinition {
  return catsById.get(catId) ?? catsById.get(DEFAULT_CAT_ID)!;
}

/** 0–1 rating for UI stat bars, relative to roster extremes. */
export function statRating(stat: keyof CatStats, value: number): number {
  const values = CAT_ROSTER.map((cat) => cat.stats[stat]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (stat === 'knockbackMultiplier') {
    return max === min ? 0.5 : (max - value) / (max - min);
  }

  return max === min ? 0.5 : (value - min) / (max - min);
}

export function formatStatLabel(stat: keyof CatStats): string {
  switch (stat) {
    case 'moveSpeed':
      return 'Speed';
    case 'jumpVelocity':
      return 'Jump';
    case 'knockbackMultiplier':
      return 'Toughness';
    case 'scoreMultiplier':
      return 'Score bonus';
  }
}

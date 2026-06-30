import manifest from './cats/manifest.json';
import { CAT_TEXTURE_URLS } from './catTextures';

export type CatVisualId = 'orange' | 'gray' | 'marshmellow';

export interface CatSheetSpec {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
}

export interface CatSheetSet {
  walk: CatSheetSpec;
  idle: CatSheetSpec;
  jump: CatSheetSpec;
}

type ManifestEntry = (typeof manifest)[number];

const manifestById = new Map<string, ManifestEntry>(manifest.map((entry) => [entry.id, entry]));

function sheet(assetId: string): CatSheetSpec {
  const entry = manifestById.get(assetId);
  if (!entry) {
    throw new Error(`Missing cat asset: ${assetId}`);
  }

  return {
    key: entry.key,
    url: CAT_TEXTURE_URLS[entry.key] ?? entry.path,
    frameWidth: entry.frameWidth,
    frameHeight: entry.frameHeight,
    frameCount: entry.frameCount,
  };
}

export const CAT_VISUAL_BY_ROSTER_ID: Record<string, CatVisualId> = {
  tabby: 'orange',
  bandit: 'orange',
  bolt: 'gray',
  chonk: 'gray',
  muffin: 'marshmellow',
};

export const CAT_SHEET_SETS: Record<CatVisualId, CatSheetSet> = {
  orange: {
    walk: sheet('orange-cat-walking-sheet'),
    idle: sheet('orange-cat-sitting-sheet'),
    jump: sheet('orange-cat-stand-to-sit-sheet'),
  },
  gray: {
    walk: sheet('gray-cat-walking-sheet'),
    idle: sheet('gray-cat-sitting'),
    jump: sheet('gray-cat-stand-to-sit-sheet'),
  },
  marshmellow: {
    walk: sheet('marshmellow-sitting-sheet'),
    idle: sheet('marshmellow-sitting-sheet'),
    jump: sheet('marshmellow-sitting-sheet'),
  },
};

export function getCatVisualId(catId: string): CatVisualId {
  return CAT_VISUAL_BY_ROSTER_ID[catId] ?? 'orange';
}

export function getCatSheetSet(catId: string): CatSheetSet {
  return CAT_SHEET_SETS[getCatVisualId(catId)];
}

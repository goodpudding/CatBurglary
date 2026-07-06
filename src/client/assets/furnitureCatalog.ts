import manifest from './furniture/manifest.json';
import { FURNITURE_TEXTURE_URLS } from './furnitureTextures';

export interface FurnitureSpec {
  id: string;
  key: string;
  path: string;
  width: number;
  height: number;
  /** Y offset from sprite top to walkable surface. */
  surfaceTop?: number;
  surfaceWidth?: number;
  /** Extra shelf surfaces for bookshelves etc. */
  extraSurfaces?: Array<{ top: number; width: number; xOffset?: number }>;
  decorOnly?: boolean;
}

const SURFACE_DEFAULTS: Record<string, Partial<FurnitureSpec>> = {
  'sofa-couch': { surfaceTop: 34, surfaceWidth: 72 },
  'sofa-matching-chair': { surfaceTop: 18, surfaceWidth: 18 },
  'kitchen-table': { surfaceTop: 26, surfaceWidth: 88 },
  'side-table': { surfaceTop: 8, surfaceWidth: 24 },
  'tv-stand-table': { surfaceTop: 10, surfaceWidth: 48 },
  'fish-bowl-table': { surfaceTop: 12, surfaceWidth: 22 },
  'livingroom-bookshelf': {
    extraSurfaces: [
      { top: 38, width: 72, xOffset: 8 },
      { top: 58, width: 72, xOffset: 8 },
    ],
  },
  cabinets: { surfaceTop: 52, surfaceWidth: 112 },
  clock: { decorOnly: true },
  'standing-livingroom-lamp': { decorOnly: true },
  tv: { decorOnly: true },
  'kitchen-chair': { decorOnly: true },
  'kitchen-trash-can': { decorOnly: true },
};

export const FURNITURE_CATALOG: FurnitureSpec[] = manifest.map((entry) => ({
  ...entry,
  path: FURNITURE_TEXTURE_URLS[entry.key] ?? entry.path,
  ...SURFACE_DEFAULTS[entry.id],
}));

export const FURNITURE_BY_ID = new Map(FURNITURE_CATALOG.map((item) => [item.id, item]));

export function getFurnitureSpec(assetId: string): FurnitureSpec | undefined {
  return FURNITURE_BY_ID.get(assetId);
}

export function getTextureKey(assetId: string): string {
  return getFurnitureSpec(assetId)?.key ?? `furniture-${assetId}`;
}

export function getTextureUrl(assetId: string): string | undefined {
  const key = getTextureKey(assetId);
  return FURNITURE_TEXTURE_URLS[key];
}

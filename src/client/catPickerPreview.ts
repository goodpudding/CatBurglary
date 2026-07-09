import { getCatSheetSet, type CatSheetSpec } from './assets/catCatalog.js';

const IDLE_FPS = 5;

const imageCache = new Map<string, Promise<HTMLImageElement>>();

interface PreviewEntry {
  canvas: HTMLCanvasElement;
  sheet: CatSheetSpec;
  img: HTMLImageElement;
  frame: number;
  acc: number;
}

let rafId = 0;
let active: PreviewEntry[] = [];

function assetUrl(url: string): string {
  return url.startsWith('/') ? url : `/${url}`;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const resolved = assetUrl(url);
  let pending = imageCache.get(resolved);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load cat sheet: ${resolved}`));
      img.src = resolved;
    });
    imageCache.set(resolved, pending);
  }
  return pending;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frame: number,
  sheet: CatSheetSpec,
  canvas: HTMLCanvasElement,
): void {
  const scale = Math.min(canvas.width / sheet.frameWidth, canvas.height / sheet.frameHeight);
  const dw = sheet.frameWidth * scale;
  const dh = sheet.frameHeight * scale;
  const dx = (canvas.width - dw) / 2;
  const dy = canvas.height - dh;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    img,
    frame * sheet.frameWidth,
    0,
    sheet.frameWidth,
    sheet.frameHeight,
    dx,
    dy,
    dw,
    dh,
  );
}

/** Stop all picker preview animation loops (call before re-rendering the picker). */
export function stopCatPickerPreviews(): void {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  active = [];
}

/** Start idle animations on every `.cat-preview` canvas inside the picker container. */
export async function mountCatPickerPreviews(container: HTMLElement): Promise<void> {
  stopCatPickerPreviews();

  const canvases = container.querySelectorAll<HTMLCanvasElement>('.cat-preview');
  if (canvases.length === 0) return;

  const entries: PreviewEntry[] = [];

  for (const canvas of Array.from(canvases)) {
    const catId = canvas.dataset.catId;
    if (!catId) continue;

    const sheet = getCatSheetSet(catId).idle;
    const scale = 3;
    canvas.width = sheet.frameWidth * scale;
    canvas.height = sheet.frameHeight * scale;

    try {
      const img = await loadImage(sheet.url);
      drawFrame(canvas.getContext('2d')!, img, 0, sheet, canvas);
      entries.push({ canvas, sheet, img, frame: 0, acc: 0 });
    } catch {
      // Leave canvas blank; the card still shows name/stats if art fails to load.
    }
  }

  if (entries.length === 0) return;

  active = entries;
  let last = performance.now();

  const tick = (now: number): void => {
    const dt = now - last;
    last = now;
    const frameMs = 1000 / IDLE_FPS;

    for (const entry of active) {
      entry.acc += dt;
      while (entry.acc >= frameMs) {
        entry.acc -= frameMs;
        entry.frame = (entry.frame + 1) % entry.sheet.frameCount;
      }

      const ctx = entry.canvas.getContext('2d');
      if (ctx) drawFrame(ctx, entry.img, entry.frame, entry.sheet, entry.canvas);
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
}

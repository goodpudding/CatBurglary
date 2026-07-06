import Phaser from 'phaser';
import { FALLBACK_HEIGHT, HUD_BOTTOM_PADDING, HUD_TOP_PADDING } from './constants.js';

/**
 * One room fills the screen. We find the room's background art (a `cat-chaser-*`
 * image), scale every object uniformly so the whole room fits inside the
 * viewport, then re-center it. There is no intra-room scrolling — the camera is
 * fixed and the entire room is always visible.
 */
export class WorldLayout {
  worldScale = 1;
  groundTop = 433;
  roomLeft = 0;
  roomRight = 960;
  roomTop = 0;
  roomBottom = FALLBACK_HEIGHT;
  roomHeight = FALLBACK_HEIGHT;

  constructor(private scene: Phaser.Scene) {}

  get roomWidth(): number {
    return this.roomRight - this.roomLeft;
  }

  get roomCenterX(): number {
    return (this.roomLeft + this.roomRight) / 2;
  }

  get roomCenterY(): number {
    return (this.roomTop + this.roomBottom) / 2;
  }

  /** Scale + center the whole room so it fits the viewport. */
  fitRoom(): void {
    const bg = this.backgroundBounds();
    const view = this.scene.scale;

    const bgW = bg ? Math.max(1, bg.right - bg.left) : view.width;
    const bgH = bg ? Math.max(1, bg.bottom - bg.top) : view.height;
    const cx = bg ? (bg.left + bg.right) / 2 : view.width / 2;
    const cy = bg ? (bg.top + bg.bottom) / 2 : view.height / 2;

    // Contain-fit inside the play area below the HUD strip.
    const availW = view.width;
    const availH = view.height - HUD_TOP_PADDING - HUD_BOTTOM_PADDING;
    const scale = Math.min(availW / bgW, availH / bgH);

    // Scale around the room center, then place that center in the padded play area.
    const playCenterY = HUD_TOP_PADDING + availH / 2;
    const tx = view.width / 2 - cx;
    const ty = playCenterY - cy;
    for (const child of [...this.scene.children.list]) {
      this.transformChild(child, cx, cy, scale, tx, ty);
    }

    this.worldScale = scale;

    const scaledW = bgW * scale;
    const scaledH = bgH * scale;
    this.roomLeft = view.width / 2 - scaledW / 2;
    this.roomRight = view.width / 2 + scaledW / 2;
    this.roomTop = playCenterY - scaledH / 2;
    this.roomBottom = playCenterY + scaledH / 2;
    this.roomHeight = scaledH;
    this.groundTop = this.roomBottom - 60;
  }

  private backgroundBounds(): { left: number; right: number; top: number; bottom: number } | null {
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    let found = false;

    for (const child of this.scene.children.list) {
      if (!(child instanceof Phaser.GameObjects.Image)) continue;
      const key = child.texture?.key ?? '';
      if (!key.includes('cat-chaser')) continue;
      const b = child.getBounds();
      left = Math.min(left, b.left);
      right = Math.max(right, b.right);
      top = Math.min(top, b.top);
      bottom = Math.max(bottom, b.bottom);
      found = true;
    }

    return found ? { left, right, top, bottom } : null;
  }

  private transformChild(
    obj: Phaser.GameObjects.GameObject,
    anchorX: number,
    anchorY: number,
    scale: number,
    tx: number,
    ty: number,
  ): void {
    const go = obj as Phaser.GameObjects.GameObject & {
      x: number;
      y: number;
      scaleX?: number;
      scaleY?: number;
    };
    if (typeof go.x !== 'number' || typeof go.y !== 'number') return;

    go.x = anchorX + (go.x - anchorX) * scale + tx;
    go.y = anchorY + (go.y - anchorY) * scale + ty;

    if ('scaleX' in go && typeof go.scaleX === 'number') {
      go.scaleX *= scale;
      go.scaleY = (go.scaleY ?? 1) * scale;
    }

    syncPhysicsBody(obj);
  }
}

/** Re-sync every Arcade body after layout moves/scales scene objects. */
export function syncAllPhysicsBodies(scene: Phaser.Scene): void {
  for (const child of scene.children.list) {
    syncPhysicsBody(child);
  }
}

function syncPhysicsBody(obj: Phaser.GameObjects.GameObject): void {
  const body = (obj as {
    body?: Phaser.Physics.Arcade.Body & { refreshBody?: () => void };
  }).body;
  if (!body) return;

  if (typeof body.refreshBody === 'function') {
    body.refreshBody();
    return;
  }

  body.updateFromGameObject();
}

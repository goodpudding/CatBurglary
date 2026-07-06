import Phaser from 'phaser';
import { FALLBACK_HEIGHT } from './constants.js';

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

    // Contain-fit: the entire room is visible (letterboxed on the long axis).
    const scale = Math.min(view.width / bgW, view.height / bgH);

    // Scale every object around the room center, then translate the room center
    // to the viewport center so the fixed camera shows the whole room.
    const tx = view.width / 2 - cx;
    const ty = view.height / 2 - cy;
    for (const child of [...this.scene.children.list]) {
      this.transformChild(child, cx, cy, scale, tx, ty);
    }

    this.worldScale = scale;

    const scaledW = bgW * scale;
    const scaledH = bgH * scale;
    this.roomLeft = view.width / 2 - scaledW / 2;
    this.roomRight = view.width / 2 + scaledW / 2;
    this.roomTop = view.height / 2 - scaledH / 2;
    this.roomBottom = view.height / 2 + scaledH / 2;
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

    const body = (obj as { body?: { updateFromGameObject?: () => void } }).body;
    body?.updateFromGameObject?.();
  }
}

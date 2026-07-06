import Phaser from 'phaser';
import {
  ALERT_THRESHOLD,
  CROUCH_VISION_SCALE,
  DETECT_DECAY_RATE,
  DETECT_FILL_RATE,
  SEARCH_COOLDOWN_MS,
  SUSPICION_THRESHOLD,
  VISION_HALF_ANGLE,
  VISION_RANGE,
} from './constants.js';

export type StealthState = 'patrol' | 'suspicious' | 'searching' | 'alert';

export interface CatSightState {
  moving: boolean;
  running: boolean;
  crouching: boolean;
}

type Occluder = Phaser.GameObjects.GameObject & { getBounds(): Phaser.Geom.Rectangle };

/**
 * MGS-style awareness. Fills a detection meter while the cat is inside granny's
 * vision cone with clear line of sight; drains otherwise. Drives granny's state.
 */
export class StealthSystem {
  state: StealthState = 'patrol';
  meter = 0;
  visible = false;
  lastSeen: { x: number; y: number } | null = null;

  private alertUntil = 0;
  private coneGfx: Phaser.GameObjects.Graphics;
  private alertIcon: Phaser.GameObjects.Text;

  constructor(
    private scene: Phaser.Scene,
    private getOccluders: () => Occluder[],
    private worldScale = 1,
    private visionMul = 1,
    private fillMul = 1,
  ) {
    this.coneGfx = scene.add.graphics().setDepth(8);
    this.alertIcon = scene.add
      .text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '28px', color: '#ffffff' })
      .setOrigin(0.5, 1)
      .setDepth(13)
      .setAlpha(0);
  }

  update(
    delta: number,
    granny: Phaser.GameObjects.GameObject & { x: number; y: number; displayHeight: number },
    facing: number,
    cat: Phaser.GameObjects.Sprite,
    catState: CatSightState,
  ): void {
    const dt = delta / 1000;
    this.visible = this.canSee(granny, facing, cat, catState.crouching);

    if (this.visible) {
      this.lastSeen = { x: cat.x, y: cat.y };
      const range = this.baseRange() * (catState.crouching ? CROUCH_VISION_SCALE : 1);
      const dist = Phaser.Math.Distance.Between(granny.x, this.eyeY(granny), cat.x, cat.y);
      const closeness = Phaser.Math.Clamp(1 - dist / range, 0, 1);

      let stateFactor: number;
      if (catState.running) stateFactor = 1.5;
      else if (catState.moving) stateFactor = catState.crouching ? 0.5 : 1.0;
      else stateFactor = 0.6;

      this.meter += DETECT_FILL_RATE * this.fillMul * (0.35 + 0.65 * closeness) * stateFactor * dt;
    } else {
      this.meter -= DETECT_DECAY_RATE * dt;
    }
    this.meter = Phaser.Math.Clamp(this.meter, 0, 1);

    const now = this.scene.time.now;
    if (this.meter >= ALERT_THRESHOLD) {
      this.state = 'alert';
      this.alertUntil = now + SEARCH_COOLDOWN_MS;
    } else if (this.alertUntil > now) {
      this.state = 'searching';
    } else if (this.meter >= SUSPICION_THRESHOLD) {
      this.state = 'suspicious';
    } else {
      this.state = 'patrol';
    }

    // Draw the cone at its effective range so the visual matches detection:
    // crouching visibly shrinks how far granny can spot the cat.
    const drawRange = this.baseRange() * (catState.crouching ? CROUCH_VISION_SCALE : 1);
    this.draw(granny, facing, drawRange);
  }

  private canSee(
    granny: { x: number; y: number; displayHeight: number },
    facing: number,
    cat: Phaser.GameObjects.Sprite,
    crouching: boolean,
  ): boolean {
    const eyeX = granny.x;
    const eyeY = this.eyeY(granny);
    const dx = cat.x - eyeX;
    const dy = cat.y - eyeY;

    const forward = dx * Math.sign(facing || 1);
    if (forward <= 0) return false;

    const range = this.baseRange() * (crouching ? CROUCH_VISION_SCALE : 1);
    if (Math.hypot(dx, dy) > range) return false;

    if (Math.atan2(Math.abs(dy), forward) > VISION_HALF_ANGLE) return false;

    return this.hasLineOfSight(eyeX, eyeY, cat.x, cat.y);
  }

  private hasLineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
    const line = new Phaser.Geom.Line(x1, y1, x2, y2);
    for (const occ of this.getOccluders()) {
      const b = occ.getBounds();
      if (Phaser.Geom.Intersects.LineToRectangle(line, b)) return false;
    }
    return true;
  }

  private eyeY(granny: { y: number; displayHeight: number }): number {
    return granny.y - granny.displayHeight * 0.2;
  }

  private baseRange(): number {
    return VISION_RANGE * this.worldScale * this.visionMul;
  }

  private draw(
    granny: { x: number; y: number; displayHeight: number },
    facing: number,
    range: number,
  ): void {
    const g = this.coneGfx;
    g.clear();

    const color = this.state === 'alert' ? 0xff5252 : this.state === 'patrol' ? 0xffffff : 0xffe066;
    const alpha = this.state === 'patrol' ? 0.1 : this.state === 'alert' ? 0.28 : 0.2;

    const x = granny.x;
    const y = this.eyeY(granny);
    const r = range;
    const base = Math.sign(facing || 1) > 0 ? 0 : Math.PI;
    const p1 = { x: x + Math.cos(base - VISION_HALF_ANGLE) * r, y: y + Math.sin(base - VISION_HALF_ANGLE) * r };
    const p2 = { x: x + Math.cos(base + VISION_HALF_ANGLE) * r, y: y + Math.sin(base + VISION_HALF_ANGLE) * r };

    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.closePath();
    g.fillPath();

    const icon = this.state === 'alert' ? '!' : this.state === 'patrol' ? '' : '?';
    if (icon) {
      this.alertIcon
        .setText(icon)
        .setColor(this.state === 'alert' ? '#ff5252' : '#ffe066')
        .setPosition(granny.x, granny.y - granny.displayHeight * 0.55)
        .setAlpha(1);
    } else {
      this.alertIcon.setAlpha(0);
    }
  }

  destroy(): void {
    this.coneGfx.destroy();
    this.alertIcon.destroy();
  }
}

import Phaser from 'phaser';
import {
  ALERT_THRESHOLD,
  CROUCH_VISION_SCALE,
  DETECT_DECAY_RATE,
  DETECT_FILL_RATE,
  SEARCH_COOLDOWN_MS,
  SEARCH_SWEEP_EXTRA_DEG,
  SUSPICION_THRESHOLD,
  VISION_HALF_ANGLE,
  VISION_RANGE,
} from './constants.js';
import type { GrannyTuning } from './grannyTuning.js';

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

  /** While locked on, granny keeps chasing even if the cat briefly breaks sight. */
  private lockedUntil = 0;
  private searchUntil = 0;
  /** Vertical tilt (radians) of the cone: sweeps up/down, or aims when locked. */
  private pitch = 0;
  private sweepDir = 1;
  private coneGfx: Phaser.GameObjects.Graphics;
  private alertIcon: Phaser.GameObjects.Text;

  constructor(
    private scene: Phaser.Scene,
    private getOccluders: () => Occluder[],
    private worldScale = 1,
    private visionMul = 1,
    private fillMul = 1,
    private tuning?: GrannyTuning,
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
    this.updatePitch(dt, granny, facing);
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

      const fillRate = this.tuning?.detectFillRate ?? DETECT_FILL_RATE;
      this.meter += fillRate * this.fillMul * (0.35 + 0.65 * closeness) * stateFactor * dt;
    } else {
      this.meter -= DETECT_DECAY_RATE * dt;
    }
    this.meter = Phaser.Math.Clamp(this.meter, 0, 1);

    const now = this.scene.time.now;
    const lostSightMs = this.tuning?.lostSightMs ?? SEARCH_COOLDOWN_MS;
    if (this.meter >= ALERT_THRESHOLD) {
      // Locked on. The lock (and the search window after it) refresh for as
      // long as the meter stays pegged; escaping sight starts the countdown.
      this.state = 'alert';
      this.lockedUntil = now + lostSightMs;
      this.searchUntil = this.lockedUntil + SEARCH_COOLDOWN_MS;
    } else if (this.lockedUntil > now) {
      // Cat slipped out of the cone but not for long enough — keep chasing.
      this.state = 'alert';
    } else if (this.searchUntil > now) {
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

  /**
   * Sweep the cone up/down while patrolling; aim it at the cat (or the last
   * place she saw it) while locked on or searching.
   */
  private updatePitch(
    dt: number,
    granny: { x: number; y: number; displayHeight: number },
    _facing: number,
  ): void {
    const sweepHalf = this.tuning?.sweepHalfAngle ?? Phaser.Math.DegToRad(22);
    const sweepSpeed = this.tuning?.sweepSpeed ?? Phaser.Math.DegToRad(28);

    if (this.state === 'alert' && this.lastSeen) {
      // Locked on: aim straight at the target. pitch is the vertical angle
      // toward lastSeen, relative to granny's forward direction (positive =
      // downward). Track quickly but smoothly toward the target angle.
      const dx = this.lastSeen.x - granny.x;
      const dy = this.lastSeen.y - this.eyeY(granny);
      const target = Math.atan2(dy, Math.max(Math.abs(dx), 1));
      this.pitch = Phaser.Math.Linear(this.pitch, target, Math.min(1, dt * 8));
      return;
    }

    if (this.state === 'searching' && this.lastSeen) {
      // Actively search the area instead of staring at the stale point where
      // she lost the cat: sweep a widened arc centered on that last-seen
      // angle, so a cat that has since moved isn't a permanent blind spot.
      const dx = this.lastSeen.x - granny.x;
      const dy = this.lastSeen.y - this.eyeY(granny);
      const center = Math.atan2(dy, Math.max(Math.abs(dx), 1));
      const searchHalf = sweepHalf + Phaser.Math.DegToRad(SEARCH_SWEEP_EXTRA_DEG);

      this.pitch += this.sweepDir * sweepSpeed * dt;
      const rel = this.pitch - center;
      if (rel > searchHalf) {
        this.pitch = center + searchHalf;
        this.sweepDir = -1;
      } else if (rel < -searchHalf) {
        this.pitch = center - searchHalf;
        this.sweepDir = 1;
      }
      return;
    }

    // Idle scan: bounce the cone between -sweepHalf (up) and +sweepHalf (down).
    this.pitch += this.sweepDir * sweepSpeed * dt;
    if (this.pitch > sweepHalf) {
      this.pitch = sweepHalf;
      this.sweepDir = -1;
    } else if (this.pitch < -sweepHalf) {
      this.pitch = -sweepHalf;
      this.sweepDir = 1;
    }
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

    // Angle to the cat relative to the cone's current up/down tilt.
    if (Math.abs(Math.atan2(dy, forward) - this.pitch) > this.halfAngle) return false;

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
    return (this.tuning?.visionRange ?? VISION_RANGE) * this.worldScale * this.visionMul;
  }

  private get halfAngle(): number {
    return this.tuning?.visionHalfAngle ?? VISION_HALF_ANGLE;
  }

  private draw(
    granny: { x: number; y: number; displayHeight: number },
    facing: number,
    range: number,
  ): void {
    const g = this.coneGfx;
    g.clear();

    // Warm flashlight beam; goes amber when suspicious and red when alert.
    const color = this.state === 'alert' ? 0xff5252 : this.state === 'patrol' ? 0xffedbe : 0xffe066;
    const alpha = this.state === 'patrol' ? 0.2 : this.state === 'alert' ? 0.3 : 0.25;

    const x = granny.x;
    const y = this.eyeY(granny);
    const r = range;
    // Center the cone on the current up/down tilt (mirrored when facing left
    // so "down" stays down on screen).
    const base = Math.sign(facing || 1) > 0 ? this.pitch : Math.PI - this.pitch;
    const half = this.halfAngle;
    const p1 = { x: x + Math.cos(base - half) * r, y: y + Math.sin(base - half) * r };
    const p2 = { x: x + Math.cos(base + half) * r, y: y + Math.sin(base + half) * r };

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

  /** The cone graphics — doubles as the flashlight beam shape for NightMode. */
  get lightShape(): Phaser.GameObjects.Graphics {
    return this.coneGfx;
  }

  destroy(): void {
    this.coneGfx.destroy();
    this.alertIcon.destroy();
  }
}

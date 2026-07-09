import Phaser from 'phaser';
import { CAT_GLOW_RADIUS, NIGHT_ALPHA } from './constants.js';

const GLOW_TEXTURE_KEY = 'night-glow-radial';

/**
 * Night lighting: a darkness overlay covers the room, with light "cut out"
 * in two places — a soft radial glow around the cat (so the player can read
 * nearby ledges) and granny's vision cone, which now reads as her flashlight
 * beam sweeping the dark. Purely visual; detection math is unchanged.
 *
 * Tuning lives in constants.ts: NIGHT_ALPHA (how dark) and CAT_GLOW_RADIUS.
 */
export class NightMode {
  private rt: Phaser.GameObjects.RenderTexture;
  private glow: Phaser.GameObjects.Image;

  constructor(
    private scene: Phaser.Scene,
    private darkness = NIGHT_ALPHA,
  ) {
    ensureGlowTexture(scene);
    this.rt = scene.add
      .renderTexture(0, 0, scene.scale.width, scene.scale.height)
      .setOrigin(0, 0)
      .setDepth(40)
      .setScrollFactor(0);
    this.glow = scene.make.image({ key: GLOW_TEXTURE_KEY, add: false }).setOrigin(0.5);
  }

  /** Call once per frame with the cat position and any light-casting shapes. */
  update(
    catX: number,
    catY: number,
    lights: Phaser.GameObjects.GameObject[],
    glowRadius = CAT_GLOW_RADIUS,
  ): void {
    const rt = this.rt;
    rt.clear();
    rt.fill(0x040614, this.darkness);

    this.glow.setDisplaySize(glowRadius * 2, glowRadius * 2);
    rt.erase(this.glow, catX, catY);

    for (const light of lights) rt.erase(light);
  }

  destroy(): void {
    this.rt.destroy();
    this.glow.destroy();
  }
}

/** One-time soft radial gradient used to punch the cat's glow out of the dark. */
function ensureGlowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(GLOW_TEXTURE_KEY)) return;

  const size = 256;
  const canvas = scene.textures.createCanvas(GLOW_TEXTURE_KEY, size, size);
  if (!canvas) return;

  const ctx = canvas.getContext();
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  canvas.refresh();
}

import Phaser from 'phaser';
import { syncAllPhysicsBodies } from './worldLayout.js';

/**
 * Accurate hitbox overlay — Arcade's built-in debug can drift from sprites after
 * layout scaling / camera changes, so we redraw from live body bounds each frame.
 */
export class PhysicsDebugOverlay {
  private gfx: Phaser.GameObjects.Graphics;

  constructor(
    private scene: Phaser.Scene,
    private showSpriteBounds = false,
  ) {
    this.gfx = scene.add.graphics().setDepth(200).setScrollFactor(1);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.draw, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    scene.events.once(Phaser.Scenes.Events.DESTROY, this.destroy, this);
  }

  private draw(): void {
    syncAllPhysicsBodies(this.scene);
    this.gfx.clear();

    const world = this.scene.physics.world;
    for (const entry of world.bodies.entries) {
      const body = entry as Phaser.Physics.Arcade.Body;
      if (!body.enable) continue;

      const isStatic = body.immovable && !body.moves;
      const color = isStatic ? 0x00ffff : 0xff00ff;
      this.gfx.lineStyle(1, color, 0.95);

      if (body.isCircle) {
        this.gfx.strokeCircle(body.center.x, body.center.y, body.halfWidth);
      } else {
        this.gfx.strokeRect(body.x, body.y, body.width, body.height);
      }

      if (this.showSpriteBounds && body.gameObject) {
        const go = body.gameObject as Phaser.GameObjects.GameObject & {
          getBounds: () => Phaser.Geom.Rectangle;
        };
        const b = go.getBounds();
        this.gfx.lineStyle(1, 0xffff00, 0.7);
        this.gfx.strokeRect(b.x, b.y, b.width, b.height);
      }
    }
  }

  destroy(): void {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.draw, this);
    this.gfx.destroy();
  }
}

import Phaser from 'phaser';
import { ChihuahuaBehavior, type DogUpdateContext } from './chihuahuaBehavior.js';

/**
 * Thin driver for all guard dogs in the current room.
 *
 * The actual behavior lives in ChihuahuaBehavior and attaches per-sprite —
 * normally via a ChihuahuaScript node placed on the prefab in Phaser Editor.
 * This controller just discovers attached dogs (auto-attaching any collected
 * dog that somehow has no behavior yet, e.g. plain name-matched sprites),
 * initializes them for the room, and feeds them one shared context per frame.
 */
export class ChihuahuaController {
  private behaviors: ChihuahuaBehavior[] = [];

  constructor(private scene: Phaser.Scene) {}

  get sprites(): Phaser.Physics.Arcade.Sprite[] {
    return this.behaviors.filter((b) => b.alive).map((b) => b.sprite);
  }

  isCharging(sprite: Phaser.GameObjects.GameObject): boolean {
    return ChihuahuaBehavior.of(sprite)?.isCharging ?? false;
  }

  setup(
    dogs: Phaser.Physics.Arcade.Sprite[],
    groundTop: number,
    roomIndex: number,
    _worldScale: number,
  ): void {
    const found = new Set<Phaser.Physics.Arcade.Sprite>();

    // Dogs whose behavior was attached by a ChihuahuaScript editor node.
    for (const behavior of ChihuahuaBehavior.allIn(this.scene)) {
      if (behavior.alive) found.add(behavior.sprite);
    }

    // Dogs collected by editorObjects (fallback: auto-attach if needed).
    for (const dog of dogs) {
      ChihuahuaBehavior.attach(dog);
      found.add(dog);
    }

    const now = this.scene.time.now;
    this.behaviors = [...found].map((dog) => ChihuahuaBehavior.attach(dog));
    for (const behavior of this.behaviors) behavior.init(groundTop, roomIndex, now);
  }

  update(
    delta: number,
    cat: Phaser.Physics.Arcade.Sprite,
    groundTop: number,
    isCatOnFloor: () => boolean,
  ): void {
    if (this.behaviors.length === 0) return;

    const ctx: DogUpdateContext = {
      now: this.scene.time.now,
      dt: delta / 1000,
      catX: (cat.body as Phaser.Physics.Arcade.Body).center.x,
      catOnFloor: isCatOnFloor(),
      groundTop,
    };

    for (const behavior of this.behaviors) behavior.update(ctx);
  }
}

import Phaser from 'phaser';
import { FURNITURE_LAND_TOLERANCE } from './constants.js';
import type { Bodied } from './types.js';

export class PlatformSystem {
  /** Editor floor rects: used for ground-height reference + art, NOT collision. */
  readonly floorPlatforms: Phaser.GameObjects.GameObject[] = [];
  /** The single invisible collider the cat actually walks on (avoids stacked-collider jitter). */
  readonly walkableFloors: Phaser.GameObjects.GameObject[] = [];
  readonly furniturePlatforms: Phaser.GameObjects.GameObject[] = [];
  private gameplayFloor?: Phaser.GameObjects.Rectangle;

  constructor(private scene: Phaser.Scene) {}

  setup(
    furniture: Phaser.GameObjects.Image[],
    floors: Phaser.GameObjects.Rectangle[],
    surfaces: Phaser.GameObjects.Rectangle[],
    roomLeft: number,
    roomRight: number,
    roomBottom: number,
  ): number {
    // Fallback stand line for scenes with no editor floor rect. roomBottom is a
    // y-coordinate (bottom edge of the room), NOT a height — passing a height
    // here once hoisted the ground far above the art and floated everyone.
    const fallbackGroundTop = roomBottom - 60;
    let groundTop: number;

    if (floors.length > 0) {
      for (const floor of floors) {
        this.makeStatic(floor, this.floorPlatforms);
      }
      // Trust the editor floor rect: the ground line is its (highest) top.
      // Only fall back if the floor bodies somehow failed to materialize.
      groundTop = this.readGroundTop(Number.POSITIVE_INFINITY);
      if (!Number.isFinite(groundTop)) groundTop = fallbackGroundTop;
    } else {
      const ground = this.scene.add.rectangle(
        (roomLeft + roomRight) / 2,
        fallbackGroundTop + 30,
        roomRight - roomLeft,
        60,
        0x6e4a2a,
      );
      this.makeStatic(ground, this.floorPlatforms);
      groundTop = this.readGroundTop(fallbackGroundTop);
    }

    for (const surf of surfaces) {
      this.makeStatic(surf, this.furniturePlatforms);
    }

    for (const img of furniture) {
      img.texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.makeStatic(img, this.furniturePlatforms);
    }

    return groundTop;
  }

  refreshBodies(): void {
    for (const platform of [...this.floorPlatforms, ...this.walkableFloors, ...this.furniturePlatforms]) {
      this.syncStaticBody(platform);
    }
  }

  readGroundTop(fallback: number): number {
    let top = fallback;
    for (const platform of [...this.floorPlatforms, ...this.walkableFloors]) {
      const platBody = (platform as Bodied).body as Phaser.Physics.Arcade.StaticBody | null;
      if (platBody) top = Math.min(top, platBody.top);
    }
    return top;
  }

  addGameplayFloor(groundTop: number, roomLeft: number, roomRight: number): number {
    this.gameplayFloor?.destroy();
    const w = Math.max(800, roomRight - roomLeft);
    const h = 32;
    const cx = (roomLeft + roomRight) / 2;
    this.gameplayFloor = this.scene.add.rectangle(cx, groundTop + h * 0.5, w, h, 0x000000, 0);
    this.gameplayFloor.setDepth(1);
    this.makeStatic(this.gameplayFloor, this.walkableFloors);
    return this.readGroundTop(groundTop);
  }

  createLandFilter(
    getDropThroughBody: () => Phaser.Physics.Arcade.StaticBody | null,
  ): Phaser.Types.Physics.Arcade.ArcadePhysicsCallback {
    return (cat, furniture) => {
      const catBody = (cat as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
      const platBody = (furniture as Bodied).body as Phaser.Physics.Arcade.StaticBody;
      if (!catBody || !platBody) return false;
      if (getDropThroughBody() === platBody) return false;
      if (catBody.velocity.y < 0) return false;

      const platTop = platBody.top;
      const feetX = catBody.center.x;
      if (feetX < platBody.left || feetX > platBody.right) return false;

      if (catBody.velocity.y > 0) {
        return catBody.bottom <= platTop + FURNITURE_LAND_TOLERANCE;
      }

      return (
        catBody.bottom >= platTop - 2 &&
        catBody.bottom <= platTop + FURNITURE_LAND_TOLERANCE
      );
    };
  }

  pinCatFeet(cat: Phaser.Physics.Arcade.Sprite, standTop: number): void {
    const body = cat.body as Phaser.Physics.Arcade.Body;
    const delta = standTop - body.bottom;
    if (Math.abs(delta) < 0.5) return;

    cat.y += delta;
    body.setVelocity(body.velocity.x, 0);
    body.updateFromGameObject();
  }

  /** Match the editor spawn to the highest shelf/counter supporting the cat. */
  findStandTopNear(cat: Phaser.Physics.Arcade.Sprite, fallback: number): number {
    const body = cat.body as Phaser.Physics.Arcade.Body;
    const feetX = body.center.x;
    const feetY = body.bottom;
    let bestTop = fallback;
    let bestSupport = -Infinity;

    for (const platform of this.furniturePlatforms) {
      const platBody = (platform as Bodied).body as Phaser.Physics.Arcade.StaticBody | null;
      if (!platBody) continue;
      if (feetX < platBody.left - 6 || feetX > platBody.right + 6) continue;

      const supportGap = feetY - platBody.top;
      if (supportGap < -12 || supportGap > 72) continue;

      if (platBody.top > bestSupport) {
        bestSupport = platBody.top;
        bestTop = platBody.top;
      }
    }

    return bestTop;
  }

  /** Platform the cat is currently standing on (highest match under the feet). */
  getPlatformUnderCat(cat: Phaser.Physics.Arcade.Sprite): Phaser.Physics.Arcade.StaticBody | null {
    const catBody = cat.body as Phaser.Physics.Arcade.Body;
    const feetX = catBody.center.x;
    const feetY = catBody.bottom;
    let best: Phaser.Physics.Arcade.StaticBody | null = null;
    let bestTop = -Infinity;

    for (const platform of this.furniturePlatforms) {
      const platBody = (platform as Bodied).body as Phaser.Physics.Arcade.StaticBody | null;
      if (!platBody) continue;
      if (feetX < platBody.left - 4 || feetX > platBody.right + 4) continue;
      if (feetY < platBody.top - FURNITURE_LAND_TOLERANCE || feetY > platBody.top + FURNITURE_LAND_TOLERANCE) {
        continue;
      }

      if (platBody.top > bestTop) {
        bestTop = platBody.top;
        best = platBody;
      }
    }

    return best;
  }

  clampCatAboveFloor(cat: Phaser.Physics.Arcade.Sprite, groundTop: number): void {
    const body = cat.body as Phaser.Physics.Arcade.Body;
    if (body.bottom <= groundTop + 6) return;

    cat.y -= body.bottom - groundTop;
    if (body.velocity.y > 0) body.setVelocityY(0);
    body.updateFromGameObject();
  }

  private makeStatic(obj: Phaser.GameObjects.GameObject, list: Phaser.GameObjects.GameObject[]): void {
    const bodied = obj as Bodied;
    if (!bodied.body) {
      this.scene.physics.add.existing(obj, true);
    } else {
      const body = bodied.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setAllowGravity(false);
    }
    this.syncStaticBody(obj);
    list.push(obj);
  }

  private syncStaticBody(obj: Phaser.GameObjects.GameObject): void {
    const body = (obj as Bodied).body;
    if (!body || !('updateFromGameObject' in body)) return;

    if (obj instanceof Phaser.GameObjects.Rectangle) {
      const rect = obj;
      body.setSize(
        Math.max(4, rect.displayWidth),
        Math.max(4, rect.displayHeight),
        true,
      );
    } else if (obj instanceof Phaser.GameObjects.Arc || obj instanceof Phaser.GameObjects.Ellipse) {
      const shape = obj as Phaser.GameObjects.Arc;
      const radius = Math.max(4, shape.displayWidth * 0.5);
      if ('setCircle' in body && typeof body.setCircle === 'function') {
        body.setCircle(radius, 0, 0);
      } else {
        body.setSize(radius * 2, radius * 2, true);
      }
    }

    body.updateFromGameObject();
  }
}

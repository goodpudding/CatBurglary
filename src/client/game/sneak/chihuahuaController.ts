import Phaser from 'phaser';
import type Chihuahua from '../../scenes/Chihuahua.js';
import {
  CHIHUAHUA_BARK_PAUSE_MS,
  CHIHUAHUA_CHARGE_RECOVER_SPEED,
  CHIHUAHUA_REACH_DISTANCE,
  CHIHUAHUA_RECHARGE_DELAY_MS,
} from './constants.js';

type DogState = 'idle' | 'charging' | 'barking' | 'returning';

interface DogEntry {
  sprite: Chihuahua;
  homeX: number;
  state: DogState;
  chargeAt: number;
  chargeSpeed: number;
  armed: boolean;
  /** Locked left/right for the duration of a single charge. */
  chargeDir?: number;
  /** Scene time when the bark pause ends. */
  barkUntil?: number;
  /** Floor line the dog stays pinned to (never jumps onto furniture). */
  feetLine: number;
}

const WALK_KEY = 'chihuahua-walkingchihuahua-walking';
const BARK_KEY = 'chihuahua-barkingchihuahua-barking';

export class ChihuahuaController {
  private entries: DogEntry[] = [];

  constructor(private scene: Phaser.Scene) {}

  get sprites(): Chihuahua[] {
    return this.entries.map((e) => e.sprite);
  }

  isCharging(sprite: Chihuahua): boolean {
    return this.entries.find((e) => e.sprite === sprite)?.state === 'charging';
  }

  setup(dogs: Chihuahua[], groundTop: number, roomIndex: number, _worldScale: number): void {
    this.entries = [];
    const now = this.scene.time.now;

    for (const dog of dogs) {
      dog.setDepth(11);
      const body = dog.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setAllowGravity(false);
      this.syncHitbox(dog);
      this.pinFeetToLine(dog, groundTop);

      const armed = dog.chargeOnEntry && roomIndex === dog.chargeOnRoomIndex;

      this.entries.push({
        sprite: dog,
        homeX: dog.x,
        state: 'idle',
        chargeAt: armed ? now + dog.chargeDelayMs : Number.POSITIVE_INFINITY,
        chargeSpeed: dog.chargeSpeed,
        armed,
        feetLine: groundTop,
      });

      if (armed) this.playBark(dog);
    }
  }

  update(
    delta: number,
    cat: Phaser.Physics.Arcade.Sprite,
    groundTop: number,
    isCatOnFloor: () => boolean,
  ): void {
    const now = this.scene.time.now;
    const dt = delta / 1000;
    const catOnFloor = isCatOnFloor();

    for (const entry of this.entries) {
      const dog = entry.sprite;
      entry.feetLine = groundTop;

      switch (entry.state) {
        case 'idle':
          this.syncDogPose(dog, entry);
          if (!catOnFloor) {
            this.playBark(dog);
            break;
          }
          if (now >= entry.chargeAt) {
            this.beginCharge(entry, cat, now);
          }
          break;

        case 'charging': {
          if (!catOnFloor) {
            this.beginReturn(entry);
            break;
          }

          const catX = this.catX(cat);
          const dir = entry.chargeDir ?? 1;
          const signedGap = catX - dog.x;
          const absGap = Math.abs(signedGap);

          if (absGap <= CHIHUAHUA_REACH_DISTANCE) {
            this.beginBarking(entry, cat, now);
            break;
          }

          const step = dir * entry.chargeSpeed * dt;
          const travel = absGap - CHIHUAHUA_REACH_DISTANCE;

          if (Math.abs(step) >= travel) {
            dog.x = catX - Math.sign(signedGap) * CHIHUAHUA_REACH_DISTANCE;
            this.syncDogPose(dog, entry);
            this.beginBarking(entry, cat, now);
            break;
          }

          dog.x += step;
          dog.setFlipX(dir < 0);
          this.syncDogPose(dog, entry);
          break;
        }

        case 'barking': {
          this.syncDogPose(dog, entry);

          if (!catOnFloor) {
            this.beginReturn(entry);
            break;
          }

          if (now < (entry.barkUntil ?? 0)) break;

          const catX = this.catX(cat);
          if (Math.abs(catX - dog.x) <= CHIHUAHUA_REACH_DISTANCE) {
            entry.barkUntil = now + CHIHUAHUA_BARK_PAUSE_MS;
            break;
          }

          this.beginCharge(entry, cat, now);
          break;
        }

        case 'returning': {
          const gap = entry.homeX - dog.x;
          if (Math.abs(gap) <= 6) {
            dog.x = entry.homeX;
            entry.state = 'idle';
            entry.chargeAt = now + CHIHUAHUA_RECHARGE_DELAY_MS;
            this.syncDogPose(dog, entry);
            this.playBark(dog);
            break;
          }

          const dir = Math.sign(gap);
          dog.x += dir * CHIHUAHUA_CHARGE_RECOVER_SPEED * dt;
          dog.setFlipX(dir < 0);
          this.syncDogPose(dog, entry);
          this.playWalk(dog);
          break;
        }
      }
    }
  }

  private beginCharge(entry: DogEntry, cat: Phaser.Physics.Arcade.Sprite, now: number): void {
    const dog = entry.sprite;
    const catX = this.catX(cat);
    const signedGap = catX - dog.x;

    if (Math.abs(signedGap) <= CHIHUAHUA_REACH_DISTANCE) {
      this.beginBarking(entry, cat, now);
      return;
    }

    entry.chargeDir = Math.sign(signedGap) || 1;
    entry.state = 'charging';
    dog.setFlipX(entry.chargeDir < 0);
    this.playWalk(dog);
  }

  private beginBarking(entry: DogEntry, cat: Phaser.Physics.Arcade.Sprite, now: number): void {
    entry.state = 'barking';
    delete entry.chargeDir;
    entry.barkUntil = now + CHIHUAHUA_BARK_PAUSE_MS;
    this.faceCat(entry.sprite, cat);
    this.playBark(entry.sprite);
  }

  private beginReturn(entry: DogEntry): void {
    entry.state = 'returning';
    delete entry.chargeDir;
    delete entry.barkUntil;
    this.playWalk(entry.sprite);
  }

  private catX(cat: Phaser.Physics.Arcade.Sprite): number {
    return (cat.body as Phaser.Physics.Arcade.Body).center.x;
  }

  private faceCat(dog: Chihuahua, cat: Phaser.Physics.Arcade.Sprite): void {
    const delta = this.catX(cat) - dog.x;
    if (Math.abs(delta) < 8) return;
    dog.setFlipX(delta < 0);
  }

  private syncDogPose(dog: Chihuahua, entry: DogEntry): void {
    this.pinFeetToLine(dog, entry.feetLine);
    this.syncBody(dog);
  }

  private pinFeetToLine(dog: Chihuahua, feetLine: number): void {
    const delta = feetLine - dog.getBounds().bottom;
    if (Math.abs(delta) < 0.5) return;
    dog.y += delta;
  }

  /** Scale the circle body to match the sprite after room layout. */
  private syncHitbox(dog: Chihuahua): void {
    const body = dog.body as Phaser.Physics.Arcade.Body;
    const w = dog.width;
    const h = dog.height;
    const radius = Math.max(5, w * 0.34);
    body.setCircle(radius, w * 0.5 - radius, h - radius * 1.35);
    body.updateFromGameObject();
  }

  private syncBody(dog: Chihuahua): void {
    (dog.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  private playWalk(dog: Chihuahua): void {
    if (this.scene.anims.exists(WALK_KEY)) dog.play(WALK_KEY, true);
  }

  private playBark(dog: Chihuahua): void {
    if (this.scene.anims.exists(BARK_KEY)) dog.play(BARK_KEY, true);
    else if (this.scene.anims.exists(WALK_KEY)) dog.anims?.pause();
  }
}

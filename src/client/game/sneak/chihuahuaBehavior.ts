import Phaser from 'phaser';
import { playBark as playBarkSfx } from '../gameAudio.js';
import {
  CHIHUAHUA_BARK_PAUSE_MS,
  CHIHUAHUA_CHARGE_DELAY_MS,
  CHIHUAHUA_CHARGE_RECOVER_SPEED,
  CHIHUAHUA_CHARGE_SPEED,
  CHIHUAHUA_FOLLOW_SPEED,
  CHIHUAHUA_REACH_DISTANCE,
  CHIHUAHUA_RECHARGE_DELAY_MS,
  CHIHUAHUA_SEARCH_RANGE,
} from './constants.js';

/** Sentinel for chargeOnRoomIndex meaning "arm in whatever room I'm placed in". */
export const CHIHUAHUA_ANY_ROOM = -1;

const DEFAULT_WALK_KEY = 'chihuahua-walkingchihuahua-walking';
const DEFAULT_BARK_KEY = 'chihuahua-barkingchihuahua-barking';
const DEFAULT_DEPTH = 11;
const DATA_KEY = 'chihuahua-behavior';
/**
 * Optional per-sprite tuning. The Chihuahua prefab declares these as class
 * fields, but any Arcade sprite may set any subset of them — everything falls
 * back to the CHIHUAHUA_* constants / defaults above.
 */
export interface ChihuahuaTuning {
  chargeOnEntry?: boolean;
  /** Only arm in this room index; CHIHUAHUA_ANY_ROOM (-1) arms anywhere. */
  chargeOnRoomIndex?: number;
  chargeDelayMs?: number;
  chargeSpeed?: number;
  /** Speed used to keep chasing the cat after the dog's first contact. */
  followSpeed?: number;
  /** Horizontal range (px) at which the dog notices the cat and gives chase. */
  searchRange?: number;
  walkAnimKey?: string;
  barkAnimKey?: string;
}

export type DogSprite = Phaser.Physics.Arcade.Sprite & ChihuahuaTuning;

/** Everything the state machine needs from the outside world, per frame. */
export interface DogUpdateContext {
  now: number;
  dt: number;
  /** Cat body's center X in world space. */
  catX: number;
  /** Floor line the dog stays pinned to. */
  groundTop: number;
  /** True while granny is alert — the dogs join her hunt. */
  packChase?: boolean;
}

type DogState = 'idle' | 'charging' | 'barking' | 'returning' | 'following';

/**
 * Attachable guard-dog behavior. Attach to any Arcade sprite via
 * `ChihuahuaBehavior.attach(sprite)` (idempotent) — in the editor this is
 * done by giving the sprite a script node of type `ChihuahuaScript`. Detach
 * with `ChihuahuaBehavior.detach(sprite)`. The behavior is inert until
 * `init()` is called (by ChihuahuaController, once room layout is final) and
 * is then driven each frame through `update(ctx)`.
 */
export class ChihuahuaBehavior {
  /** Live behaviors per scene, so the controller can find script-attached dogs. */
  private static registry = new Map<Phaser.Scene, Set<ChihuahuaBehavior>>();

  /**
   * Idempotent. `tuning` (e.g. the ChihuahuaScript node with its prefab
   * properties) is read lazily and wins over fields set on the sprite itself.
   */
  static attach(
    dog: Phaser.Physics.Arcade.Sprite,
    tuning?: ChihuahuaTuning,
  ): ChihuahuaBehavior {
    const existing = ChihuahuaBehavior.of(dog);
    if (existing) {
      if (tuning) existing.tuning = tuning;
      return existing;
    }
    return new ChihuahuaBehavior(dog as DogSprite, tuning);
  }

  static detach(dog: Phaser.GameObjects.GameObject): void {
    ChihuahuaBehavior.of(dog)?.destroy();
  }

  static of(obj: Phaser.GameObjects.GameObject): ChihuahuaBehavior | undefined {
    return (obj.getData?.(DATA_KEY) as ChihuahuaBehavior | undefined) ?? undefined;
  }

  static allIn(scene: Phaser.Scene): ChihuahuaBehavior[] {
    return [...(ChihuahuaBehavior.registry.get(scene) ?? [])];
  }

  private state: DogState = 'idle';
  private homeX = 0;
  private chargeAt = Number.POSITIVE_INFINITY;
  private armed = false;
  /** Locked left/right for the duration of a single charge. */
  private chargeDir = 1;
  /** Scene time when the bark pause ends. */
  private barkUntil = 0;
  /** Floor line the dog stays pinned to (never jumps onto furniture). */
  private feetLine = 0;
  /** True once the dog has reached the cat at least once — then it keeps chasing. */
  private hasContacted = false;
  private dead = false;

  private tuning: ChihuahuaTuning | undefined = undefined;

  private constructor(readonly sprite: DogSprite, tuning?: ChihuahuaTuning) {
    this.tuning = tuning;
    if (!sprite.body) sprite.scene.physics.add.existing(sprite, false);
    sprite.setData(DATA_KEY, this);

    const bucket = ChihuahuaBehavior.registry.get(sprite.scene) ?? new Set();
    bucket.add(this);
    ChihuahuaBehavior.registry.set(sprite.scene, bucket);

    sprite.once(Phaser.GameObjects.Events.DESTROY, () => this.destroy());
  }

  get alive(): boolean {
    return !this.dead && this.sprite.active;
  }

  get isCharging(): boolean {
    return this.alive && this.state === 'charging';
  }

  /** Charging OR chasing-after-contact — either counts as a dangerous touch. */
  get isThreat(): boolean {
    return this.alive && (this.state === 'charging' || this.state === 'following');
  }

  destroy(): void {
    if (this.dead) return;
    this.dead = true;
    this.sprite.data?.remove(DATA_KEY);
    ChihuahuaBehavior.registry.get(this.sprite.scene)?.delete(this);
  }

  /** Configure for the current room. Call after WorldLayout has scaled everything. */
  init(groundTop: number, roomIndex: number, now: number): void {
    const dog = this.sprite;
    if (dog.depth === 0) dog.setDepth(DEFAULT_DEPTH);

    const body = dog.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    this.syncHitbox();

    this.feetLine = groundTop;
    this.pinFeet();
    this.syncBody();

    this.homeX = dog.x;
    this.state = 'idle';
    this.hasContacted = false;

    const wantRoom =
      this.tuning?.chargeOnRoomIndex ?? dog.chargeOnRoomIndex ?? CHIHUAHUA_ANY_ROOM;
    this.armed =
      (this.tuning?.chargeOnEntry ?? dog.chargeOnEntry ?? true) &&
      (wantRoom === CHIHUAHUA_ANY_ROOM || wantRoom === roomIndex);
    this.chargeAt = this.armed
      ? now +
        (this.tuning?.chargeDelayMs ?? dog.chargeDelayMs ?? CHIHUAHUA_CHARGE_DELAY_MS)
      : Number.POSITIVE_INFINITY;

    if (this.armed) this.playBark();
  }

  update(ctx: DogUpdateContext): void {
    if (!this.alive || !this.armed) return;

    const dog = this.sprite;
    this.feetLine = ctx.groundTop;

    switch (this.state) {
      case 'idle':
        this.syncPose();
        // Granny is on the hunt — the pack joins in immediately.
        if (ctx.packChase) {
          this.beginFollow();
          break;
        }
        // Horizontal-only "search": no vision cone, no line of sight, no
        // floor requirement — just proximity, so the player never sees the
        // dog notice them, and it isn't inert while the cat stays on furniture.
        if (ctx.now >= this.chargeAt && Math.abs(ctx.catX - dog.x) <= this.searchRange) {
          this.beginCharge(ctx);
        }
        break;

      case 'charging': {
        const dir = this.chargeDir;
        const signedGap = ctx.catX - dog.x;
        const absGap = Math.abs(signedGap);

        if (absGap > this.searchRange && !this.hasContacted && !ctx.packChase) {
          // Cat moved out of search range before first contact — give up the ambush.
          this.beginReturn();
          break;
        }

        if (absGap <= CHIHUAHUA_REACH_DISTANCE) {
          this.beginBarking(ctx);
          break;
        }

        const step = dir * this.chargeSpeed * ctx.dt;
        const travel = absGap - CHIHUAHUA_REACH_DISTANCE;

        if (Math.abs(step) >= travel) {
          dog.x = ctx.catX - Math.sign(signedGap) * CHIHUAHUA_REACH_DISTANCE;
          this.syncPose();
          this.beginBarking(ctx);
          break;
        }

        dog.x += step;
        this.setFacingRight(this.chargeDir > 0);
        this.syncPose();
        break;
      }

      case 'barking': {
        this.syncPose();

        // A short bark-in-place beat on reaching the cat, then commit to the
        // relentless follow (which re-barks whenever it's close again).
        if (ctx.now < this.barkUntil) break;
        this.beginFollow();
        break;
      }

      case 'following': {
        // A dog that only joined for granny's pack chase (never touched the
        // cat itself) goes home once she calms down.
        if (!this.hasContacted && !ctx.packChase) {
          this.beginReturn();
          break;
        }

        const signedGap = ctx.catX - dog.x;
        const absGap = Math.abs(signedGap);

        if (absGap <= CHIHUAHUA_REACH_DISTANCE) {
          // Within reach: hold position and bark on a cadence.
          if (ctx.now >= this.barkUntil) {
            this.barkUntil = ctx.now + CHIHUAHUA_BARK_PAUSE_MS;
            this.faceX(ctx.catX);
            this.playBark();
          }
          this.syncPose();
          break;
        }

        // Chase the cat's x without overshooting the reach boundary.
        const dir = Math.sign(signedGap) || 1;
        const step = this.followSpeed * ctx.dt;
        const travel = absGap - CHIHUAHUA_REACH_DISTANCE;
        dog.x += dir * Math.min(step, travel);
        this.setFacingRight(dir > 0);
        this.playWalk();
        this.syncPose();
        break;
      }

      case 'returning': {
        if (ctx.packChase) {
          this.beginFollow();
          break;
        }

        const gap = this.homeX - dog.x;
        if (Math.abs(gap) <= 6) {
          dog.x = this.homeX;
          this.state = 'idle';
          this.chargeAt = ctx.now + CHIHUAHUA_RECHARGE_DELAY_MS;
          this.syncPose();
          this.playBark();
          break;
        }

        const dir = Math.sign(gap);
        dog.x += dir * CHIHUAHUA_CHARGE_RECOVER_SPEED * ctx.dt;
        this.setFacingRight(dir > 0);
        this.syncPose();
        this.playWalk();
        break;
      }
    }
  }

  // --- tuning (per-sprite override -> constant default) ---------------------

  private get chargeSpeed(): number {
    return this.tuning?.chargeSpeed ?? this.sprite.chargeSpeed ?? CHIHUAHUA_CHARGE_SPEED;
  }

  private get followSpeed(): number {
    return this.tuning?.followSpeed ?? this.sprite.followSpeed ?? CHIHUAHUA_FOLLOW_SPEED;
  }

  private get searchRange(): number {
    return this.tuning?.searchRange ?? this.sprite.searchRange ?? CHIHUAHUA_SEARCH_RANGE;
  }

  private get walkKey(): string {
    return this.tuning?.walkAnimKey ?? this.sprite.walkAnimKey ?? DEFAULT_WALK_KEY;
  }

  private get barkKey(): string {
    return this.tuning?.barkAnimKey ?? this.sprite.barkAnimKey ?? DEFAULT_BARK_KEY;
  }

  // --- state transitions -----------------------------------------------------

  private beginCharge(ctx: DogUpdateContext): void {
    const dog = this.sprite;
    const signedGap = ctx.catX - dog.x;

    if (Math.abs(signedGap) <= CHIHUAHUA_REACH_DISTANCE) {
      this.beginBarking(ctx);
      return;
    }

    this.chargeDir = Math.sign(signedGap) || 1;
    this.state = 'charging';
    this.setFacingRight(this.chargeDir > 0);
    this.playWalk();
  }

  private beginBarking(ctx: DogUpdateContext): void {
    this.state = 'barking';
    this.hasContacted = true;
    this.barkUntil = ctx.now + CHIHUAHUA_BARK_PAUSE_MS;
    this.faceX(ctx.catX);
    this.playBark();
  }

  private beginFollow(): void {
    this.state = 'following';
    this.playWalk();
  }

  private beginReturn(): void {
    this.state = 'returning';
    this.playWalk();
  }

  // --- pose / body helpers ----------------------------------------------------

  private faceX(x: number): void {
    const delta = x - this.sprite.x;
    if (Math.abs(delta) < 8) return;
    this.setFacingRight(delta > 0);
  }

  /** Sprites face left in the sheet; flipX when moving/facing right (matches CatAnimator). */
  private setFacingRight(facingRight: boolean): void {
    this.sprite.setFlipX(facingRight);
  }

  private syncPose(): void {
    // The bark (32x32) and walk (27x16) sheets have different frame sizes, so
    // the circle body computed for one sheet misaligns the moment the other
    // plays — which used to bounce the dog on every state change. Recompute
    // the hitbox whenever the active frame size changes, then re-pin.
    const dog = this.sprite;
    if (dog.width !== this.hitboxFrameW || dog.height !== this.hitboxFrameH) {
      this.syncHitbox();
    }
    this.pinFeet();
    this.syncBody();
  }

  private pinFeet(): void {
    // Pin the VISUAL feet to the floor. The circle body extends slightly
    // below the sprite art, so pinning body.bottom made the dog float. Both
    // anims now share one uniform 21x14 sheet, so bounds are frame-stable.
    const dog = this.sprite;
    const delta = this.feetLine - dog.getBounds().bottom;
    if (Math.abs(delta) < 0.5) return;
    dog.y += delta;
    this.syncBody();
  }

  /** Frame size the hitbox was last computed for (bark/walk sheets differ). */
  private hitboxFrameW = 0;
  private hitboxFrameH = 0;

  /** Scale the circle body to match the sprite after room layout. */
  private syncHitbox(): void {
    const dog = this.sprite;
    const body = dog.body as Phaser.Physics.Arcade.Body;
    const w = dog.width;
    const h = dog.height;
    const radius = Math.max(5, w * 0.34);
    body.setCircle(radius, w * 0.5 - radius, h - radius * 1.35);
    body.updateFromGameObject();
    this.hitboxFrameW = w;
    this.hitboxFrameH = h;
  }

  private syncBody(): void {
    (this.sprite.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  // --- presentation ------------------------------------------------------------

  private playWalk(): void {
    const dog = this.sprite;
    if (dog.scene.anims.exists(this.walkKey)) dog.play(this.walkKey, true);
  }

  private playBark(): void {
    if (!this.armed) return;

    const dog = this.sprite;
    if (dog.scene.anims.exists(this.barkKey)) dog.play(this.barkKey, true);
    else if (dog.scene.anims.exists(this.walkKey)) dog.anims?.pause();
    playBarkSfx(dog.scene);
  }
}

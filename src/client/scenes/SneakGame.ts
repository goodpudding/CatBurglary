import Phaser from 'phaser';
import { CatAnimator } from '../game/catAnimator.js';
import { CosmeticAttachmentManager } from '../game/cosmeticAttachments.js';
import { getEquippedCosmetics, getSelectedCatId } from '../game/runConfig.js';
import { collectEditorObjects } from '../game/sneak/editorObjects.js';
import { setupCat } from '../game/sneak/catSetup.js';
import { GrannyController } from '../game/sneak/grannyController.js';
import { ChihuahuaController } from '../game/sneak/chihuahuaController.js';
import { PlatformSystem } from '../game/sneak/platforms.js';
import { RunEndScreen } from '../game/sneak/runEnd.js';
import { SneakHud } from '../game/sneak/sneakHud.js';
import { SneakInput } from '../game/sneak/sneakInput.js';
import { placeTreats } from '../game/sneak/treats.js';
import {
  CAT_ACCEL,
  CAT_DRAG,
  CHASE_SPEED,
  CROUCH_SPEED_SCALE,
  DEBUG_PHYSICS,
  FURNITURE_LAND_TOLERANCE,
  GRANNY_SPEED,
  GRANNY_ENTRY_DELAY_MS,
  GRANNY_ENTRY_OFFSCREEN_PAD,
  INVULN_MS,
  PATROL_SPEED,
  RETRIEVE_SPEED,
} from '../game/sneak/constants.js';
import { StealthSystem } from '../game/sneak/stealth.js';
import { SlipperSystem } from '../game/sneak/slipper.js';
import { playGameOver, playGameStart, playThud, startLevelMusic } from '../game/gameAudio.js';
import { playIntroReveal } from '../game/sneak/introCutscene.js';
import { PhysicsDebugOverlay } from '../game/sneak/physicsDebug.js';
import { runState, bankCarriedAndAdvance, resetRun } from '../game/sneak/runState.js';
import { FIRST_ROOM_KEY, getNextRoom, ROOM_ORDER, type RoomConfig } from '../game/sneak/roomConfig.js';
import {
  enterFromLeft,
  isCatAtExit,
  playEntryFlourish,
  playExitTransition,
  setupRoomExit,
  type RoomExit,
} from '../game/sneak/roomTransition.js';
import type { TreatTarget } from '../game/sneak/types.js';
import type Chihuahua from './Chihuahua.js';
import { WorldLayout, syncAllPhysicsBodies } from '../game/sneak/worldLayout.js';

/**
 * SneakGame — the shared per-room gameplay driver. Each room scene builds its
 * objects in Phaser Editor, then hands control here with its RoomConfig.
 *
 * Progression is strictly one-way: grab treats, then cross the forward exit to
 * bank them and slide into the next (harder) room. The run ends when the cat is
 * caught (out of lives) or clears the final room. Both call completeRun(score).
 *
 * Editor object labels (set the object Name in the Inspector):
 *   floor   — Rectangle with Arcade static body (walkable ground)
 *   surface — thin Rectangle with Arcade body (shelf you can jump on / drop through)
 *   exit    — tall Rectangle with NO physics body (forward doorway trigger)
 *   player  — ArcadeSprite (the cat), placed near the left entrance
 *   granny  — ArcadeSprite (granny walk sheets)
 *   treat_N — optional treat markers, e.g. treat_15 for 15 base points
 */
export class SneakGame {
  private cat!: Phaser.Physics.Arcade.Sprite;
  private catAnimator!: CatAnimator;
  private cosmeticAttachments?: CosmeticAttachmentManager;

  private world!: WorldLayout;
  private platforms!: PlatformSystem;
  private grannyCtrl!: GrannyController;
  private chihuahuaCtrl!: ChihuahuaController;
  private hud!: SneakHud;
  private input!: SneakInput;
  private runEnd!: RunEndScreen;
  private exit?: RoomExit;
  private stealth!: StealthSystem;
  private slipper!: SlipperSystem;
  private physicsDebug?: PhysicsDebugOverlay;

  private treats: TreatTarget[] = [];
  private moveSpeed = 280;
  private jumpVelocity = -720;
  private knockbackMultiplier = 1;
  private scoreMultiplier = 1;
  private catBaseScaleX = 1;
  private catBaseScaleY = 1;

  private invulnUntil = 0;
  private runOver = false;
  private reachedExit = false;
  private started = false;
  private introLock = false;
  private grannyEntryDelayUntil = 0;

  constructor(
    private scene: Phaser.Scene,
    private room: RoomConfig,
  ) {}

  start(): void {
    if (this.started) return;
    this.started = true;

    // Keep the shared run-state's room pointer in sync with the scene we loaded.
    runState.roomIndex = this.room.index;

    const collected = collectEditorObjects(this.scene);
    if (!collected.player) {
      console.warn('SneakGame: add an ArcadeSprite labeled "player" in Phaser Editor.');
      return;
    }
    this.cat = collected.player;

    this.world = new WorldLayout(this.scene);
    this.platforms = new PlatformSystem(this.scene);
    this.grannyCtrl = new GrannyController(this.scene);
    this.chihuahuaCtrl = new ChihuahuaController(this.scene);
    this.hud = new SneakHud(this.scene);
    this.runEnd = new RunEndScreen(this.scene);

    this.world.fitRoom();
    this.world.groundTop = this.platforms.setup(
      collected.furniture,
      collected.floors,
      collected.surfaces,
      this.world.roomLeft,
      this.world.roomRight,
      this.world.roomBottom,
    );
    this.platforms.refreshBodies();
    this.world.groundTop = this.platforms.readGroundTop(this.world.groundTop);
    this.world.groundTop = this.platforms.addGameplayFloor(
      this.world.groundTop,
      this.world.roomLeft,
      this.world.roomRight,
    );

    this.grannyCtrl.setPatrolFromFloor(collected.floors, this.world.roomLeft, this.world.roomRight);
    this.grannyCtrl.patrolSpeedMul = this.room.difficulty.grannySpeedMul;

    const { animator, stats } = setupCat(
      this.scene,
      this.cat,
      getSelectedCatId(),
      this.world.worldScale,
      (c, top) => this.platforms.pinCatFeet(c, top),
      () =>
        this.room.index === 0
          ? this.platforms.findStandTopNear(this.cat, this.world.groundTop)
          : this.world.groundTop,
    );
    this.catAnimator = animator;
    this.moveSpeed = stats.moveSpeed;
    this.jumpVelocity = stats.jumpVelocity;
    this.knockbackMultiplier = stats.knockbackMultiplier;
    this.scoreMultiplier = stats.scoreMultiplier;

    this.cosmeticAttachments = new CosmeticAttachmentManager(
      this.scene,
      this.cat,
      getEquippedCosmetics(),
    );

    this.treats = placeTreats(
      this.scene,
      collected.furniture,
      collected.treatMarkers,
      this.world.groundTop,
    );

    this.exit = setupRoomExit(
      this.scene,
      collected.exit,
      this.world.roomRight,
      this.world.roomTop,
      this.world.roomHeight,
      this.world.groundTop,
    );

    // The old escape window (if still present as art) is inert now.
    collected.window?.setVisible(false);

    this.grannyCtrl.setup(collected.granny, this.world.groundTop, this.world.roomLeft, this.world.roomRight);
    this.chihuahuaCtrl.setup(
      collected.chihuahuas,
      this.world.groundTop,
      this.room.index,
      this.world.worldScale,
    );
    this.catBaseScaleX = this.cat.scaleX;
    this.catBaseScaleY = this.cat.scaleY;

    // Fresh run / first room: keep the editor-authored spawn. Later rooms: enter
    // from the left as if walking in from the previous room.
    if (this.room.index > 0) {
      const grannySpawnX = this.grannyCtrl.x;
      enterFromLeft(this.scene, this.cat, this.world.roomLeft, this.world.groundTop);
      this.grannyCtrl.stageOffscreenEntry(
        this.world.roomLeft,
        this.world.groundTop,
        grannySpawnX,
        GRANNY_ENTRY_OFFSCREEN_PAD,
      );
      this.grannyEntryDelayUntil = this.scene.time.now + GRANNY_ENTRY_DELAY_MS;
      this.invulnUntil = Math.max(this.invulnUntil, this.grannyEntryDelayUntil);
    }

    const occluders = [...collected.furniture, ...collected.surfaces];
    this.stealth = new StealthSystem(
      this.scene,
      () => occluders,
      this.world.worldScale,
      this.room.difficulty.visionMul,
      this.room.difficulty.fillMul,
    );
    this.slipper = new SlipperSystem(
      this.scene,
      () => this.hitCat(),
      this.world.worldScale,
      this.room.difficulty.throwRangeMul,
    );

    this.hud.create();
    this.input = new SneakInput(this.scene, (...els) => this.hud.track(...els));
    this.hud.setRoom(this.room.label, this.room.index + 1, ROOM_ORDER.length);
    this.hud.update(runState.score, runState.carried, runState.lives);
    this.hud.updateDetection(0, 'patrol');

    this.scene.physics.world.OVERLAP_BIAS = 12;
    this.scene.physics.add.collider(this.cat, this.platforms.walkableFloors);
    this.scene.physics.add.collider(
      this.cat,
      this.platforms.furniturePlatforms,
      undefined,
      this.platforms.createLandFilter(() => this.input.dropThroughBody),
      this,
    );
    this.scene.physics.add.overlap(this.cat, this.treats, this.onCollectTreat, undefined, this);
    this.scene.physics.add.overlap(this.cat, this.grannyCtrl.granny, this.onHitByGranny, undefined, this);
    for (const dog of this.chihuahuaCtrl.sprites) {
      this.scene.physics.add.overlap(this.cat, dog, this.onHitByChihuahua, undefined, this);
    }

    const w = this.world.roomWidth;
    const viewW = this.scene.scale.width;
    const viewH = this.scene.scale.height;
    this.scene.physics.world.setBounds(this.world.roomLeft, this.world.roomTop - 200, w, this.world.roomHeight + 260);
    const cam = this.scene.cameras.main;
    // Room objects already live in viewport space — keep scroll at origin so
    // sprites and Arcade debug hitboxes stay aligned.
    cam.setBounds(0, 0, viewW, viewH);
    cam.setScroll(0, 0);
    cam.setBackgroundColor('#241c2b');
    cam.setZoom(1);
    this.hud.applyScale(1);
    syncAllPhysicsBodies(this.scene);

    if (this.room.index === 0) {
      playGameStart(this.scene);
      // First room of the run: play the pop-in + zoom-out intro before handing
      // control to the player. Freeze the world so nothing moves mid-cutscene.
      this.introLock = true;
      this.scene.physics.world.pause();
      playIntroReveal(this.scene, cam, {
        cat: this.cat,
        catScaleX: this.catBaseScaleX,
        catScaleY: this.catBaseScaleY,
        focusX: this.cat.x,
        focusY: this.cat.y,
        roomCenterX: this.world.roomCenterX,
        roomCenterY: this.world.roomCenterY,
        startZoom: 2.4,
        onComplete: () => {
          cam.setScroll(0, 0);
          cam.setZoom(1);
          this.hud.applyScale(1);
          this.platforms.refreshBodies();
          this.platforms.pinCatFeet(
            this.cat,
            this.platforms.findStandTopNear(this.cat, this.world.groundTop),
          );
          syncAllPhysicsBodies(this.scene);
          this.introLock = false;
          this.scene.physics.world.resume();
        },
      });
    } else {
      playEntryFlourish(this.scene);
    }

    if (DEBUG_PHYSICS) {
      this.physicsDebug = new PhysicsDebugOverlay(this.scene);
    }

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this);
  }

  /** Cross the forward exit: bank carried treats, advance (or win the run). */
  private tryExit(): void {
    if (this.runOver || this.reachedExit) return;
    this.reachedExit = true;

    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    const earned = runState.carried;

    if (this.room.isFinal) {
      runState.score += runState.carried;
      runState.carried = 0;
      this.hud.update(runState.score, runState.carried, runState.lives);
      this.runOver = true;
      playExitTransition(this.scene, () => this.winRun());
      return;
    }

    bankCarriedAndAdvance();
    const next = getNextRoom(this.room);
    this.hud.update(runState.score, runState.carried, runState.lives);
    if (earned > 0) this.hud.showBankFlash(`+${earned} banked!`);
    this.runOver = true;
    playExitTransition(this.scene, () => {
      if (next) this.scene.scene.start(next.sceneKey);
      else this.winRun();
    });
  }

  private onCollectTreat: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_cat, treatObj) => {
    const treat = treatObj as TreatTarget;
    const base = (treat.getData('points') as number) ?? 5;
    const points = Math.round(base * this.scoreMultiplier * this.room.difficulty.treatValueMul);
    runState.carried += points;
    treat.destroy();
    this.treats = this.treats.filter((t) => t !== treat);
    this.hud.update(runState.score, runState.carried, runState.lives);
  };

  /** Overlap with granny only hurts once she is fully alert and chasing. */
  private onHitByGranny: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (this.scene.time.now < this.grannyEntryDelayUntil) return;
    if (this.stealth?.state !== 'alert') return;
    this.hitCat();
  };

  private onHitByChihuahua: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_cat, dogObj) => {
    if (!this.chihuahuaCtrl.isCharging(dogObj as Chihuahua)) return;
    if (!this.isCatOnFloor()) return;
    this.hitCat();
  };

  /** True when the cat is standing on the room floor, not a shelf/sofa/counter. */
  private isCatOnFloor(): boolean {
    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down && !body.touching.down) return false;
    if (this.platforms.getPlatformUnderCat(this.cat)) return false;
    return body.bottom <= this.world.groundTop + FURNITURE_LAND_TOLERANCE + 8;
  }

  /** Shared damage from a chase touch or a slipper hit: lose a life + drop carried treats. */
  private hitCat(): void {
    if (this.runOver || this.scene.time.now < this.invulnUntil) return;
    if (this.scene.time.now < this.grannyEntryDelayUntil) return;
    runState.lives -= 1;
    this.invulnUntil = this.scene.time.now + INVULN_MS;
    playThud(this.scene);
    this.input.dropThroughBody = null;

    if (runState.carried > 0) {
      this.hud.showBankFlash(`Dropped ${runState.carried} treats!`);
      runState.carried = 0;
    }

    const knockDir = this.cat.x < this.grannyCtrl.x ? -1 : 1;
    const kbScale = Math.sqrt(this.world.worldScale) * this.knockbackMultiplier;
    this.cat.setVelocity(knockDir * 220 * kbScale, -180 * kbScale);
    this.scene.cameras.main.shake(180, 0.01);
    this.hud.update(runState.score, runState.carried, runState.lives);
    this.scene.time.delayedCall(80, () =>
      this.platforms.clampCatAboveFloor(this.cat, this.world.groundTop),
    );
    this.scene.time.delayedCall(250, () =>
      this.platforms.clampCatAboveFloor(this.cat, this.world.groundTop),
    );
    if (runState.lives <= 0) this.endRunCaught();
  }

  private winRun(): void {
    this.runOver = true;
    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.runEnd.showWin(runState.score, () => this.playAgain());
  }

  private endRunCaught(): void {
    this.runOver = true;
    playGameOver(this.scene);
    const lost = runState.carried;
    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;
    this.runEnd.showCaught(runState.score, lost, () => this.playAgain());
  }

  private playAgain(): void {
    resetRun();
    const audioScene = this.scene.scene.get('Audio');
    if (audioScene?.scene.isActive()) startLevelMusic(audioScene);
    this.scene.scene.start(FIRST_ROOM_KEY);
  }

  private onUpdate(time: number, delta: number): void {
    if (this.runOver || this.introLock || !this.cat) return;

    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    const left = this.input.cursors.left.isDown || this.input.touchLeft;
    const right = this.input.cursors.right.isDown || this.input.touchRight;
    const jump = this.input.consumeJumpPressed();
    const onGround = body.blocked.down || body.touching.down;
    const crouching = this.input.crouching && onGround && !jump;

    this.input.applyDropThrough(this.cat, onGround, () => this.platforms.getPlatformUnderCat(this.cat));
    this.applyCrouchSquash(crouching);

    // Acceleration-based movement: light taps ease in slowly (little speed),
    // holding ramps up to the (calmer) top speed; releasing drags back to a stop.
    const maxSpeed = this.moveSpeed * (crouching ? CROUCH_SPEED_SCALE : 1);
    const dir = left && !right ? -1 : right && !left ? 1 : 0;
    const dt = delta / 1000;
    let vx = body.velocity.x;
    if (dir !== 0) {
      vx = this.approach(vx, dir * maxSpeed, CAT_ACCEL * dt);
      this.catAnimator.setFlip(dir < 0);
    } else {
      vx = this.approach(vx, 0, CAT_DRAG * dt);
    }
    body.setVelocityX(vx);

    if (jump && onGround) {
      this.cat.setVelocityY(this.jumpVelocity);
    }

    const dropping = this.input.dropThroughBody !== null;
    if (onGround && !jump && !dropping) {
      body.setVelocityY(0);
    }

    if (this.input.dropThroughBody && body.bottom > this.input.dropThroughBody.top + 10) {
      this.input.dropThroughBody = null;
    }

    const moving = Math.abs(body.velocity.x) > 8;
    this.catAnimator.update(moving, onGround);

    // Safety net: only if the cat clearly slips well below the floor line
    // (genuine tunneling), snap it back up. The margin avoids touching normal
    // landings or shelf drop-throughs.
    if (body.bottom > this.world.groundTop + 24 && !this.input.dropThroughBody) {
      this.platforms.clampCatAboveFloor(this.cat, this.world.groundTop);
    }

    this.updateGranny(delta);
    this.chihuahuaCtrl.update(delta, this.cat, this.world.groundTop, () => this.isCatOnFloor());

    if (isCatAtExit(this.exit, this.cat)) this.tryExit();
    const nearExit = this.cat.x > this.world.roomRight - 170;
    this.exit?.hint.setAlpha(nearExit ? 1 : 0);

    this.cat.setAlpha(time < this.invulnUntil ? 0.5 : 1);
    this.cosmeticAttachments?.update();
  }

  /** Drives granny's awareness, throwing, and movement mode each frame. */
  private updateGranny(delta: number): void {
    if (this.scene.time.now < this.grannyEntryDelayUntil) {
      this.grannyCtrl.moved = false;
      this.grannyCtrl.stopWalk();
      this.hud.updateDetection(0, 'patrol');
      return;
    }

    const groundTop = this.world.groundTop;
    const chaseMul = this.room.difficulty.chaseMul;

    if (this.grannyCtrl.isEnteringRoom()) {
      this.grannyCtrl.enterRoom(delta, groundTop, PATROL_SPEED * this.grannyCtrl.patrolSpeedMul);
      if (this.grannyCtrl.moved) this.grannyCtrl.animateWalk();
      else this.grannyCtrl.stopWalk();
      this.hud.updateDetection(0, 'patrol');
      return;
    }

    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    const moving = Math.abs(body.velocity.x) > 4;
    const crouching = this.input.crouching && (body.blocked.down || body.touching.down);
    const catState = { moving, running: moving && !crouching, crouching };

    this.stealth.update(delta, this.grannyCtrl.granny, this.grannyCtrl.facing, this.cat, catState);

    if (this.stealth.state === 'alert' && this.stealth.visible) {
      this.slipper.tryThrow(this.grannyCtrl.granny, this.grannyCtrl.facing, this.cat);
    }
    this.slipper.update(this.world.groundTop, this.cat);

    if (this.slipper.needsRetrieve) {
      const target = this.slipper.retrieveTargetX ?? this.grannyCtrl.x;
      this.grannyCtrl.pursue(delta, groundTop, target, RETRIEVE_SPEED * chaseMul);
      this.slipper.pickUpIfNear(this.grannyCtrl.x);
    } else if (this.stealth.state === 'alert') {
      this.grannyCtrl.pursue(delta, groundTop, this.cat.x, CHASE_SPEED * chaseMul);
    } else if (this.stealth.state === 'suspicious' || this.stealth.state === 'searching') {
      const target = this.stealth.lastSeen?.x ?? this.cat.x;
      this.grannyCtrl.pursue(delta, groundTop, target, GRANNY_SPEED * chaseMul);
    } else {
      this.grannyCtrl.patrol(delta, groundTop);
    }

    if (this.grannyCtrl.moved) this.grannyCtrl.animateWalk();
    else this.grannyCtrl.stopWalk();

    this.hud.updateDetection(this.stealth.meter, this.stealth.state);
  }

  /** Move `current` toward `target` by at most `maxDelta`. */
  private approach(current: number, target: number, maxDelta: number): number {
    if (current < target) return Math.min(current + maxDelta, target);
    if (current > target) return Math.max(current - maxDelta, target);
    return target;
  }

  /** Gentle vertical squash while crouching; keeps the cat's feet planted. */
  private applyCrouchSquash(crouching: boolean): void {
    const target = this.catBaseScaleY * (crouching ? 0.8 : 1);
    if (Math.abs(this.cat.scaleY - target) < 0.001) return;

    const oldBottom = this.cat.getBounds().bottom;
    this.cat.scaleY = target;
    const newBottom = this.cat.getBounds().bottom;
    this.cat.y += oldBottom - newBottom;
    (this.cat.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
  }

  private teardown(): void {
    this.physicsDebug?.destroy();
    this.cosmeticAttachments?.destroy();
    this.stealth?.destroy();
    this.slipper?.destroy();
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
  }
}

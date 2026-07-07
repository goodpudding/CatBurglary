import Phaser from 'phaser';

export interface IntroRevealOptions {
  cat: Phaser.Physics.Arcade.Sprite;
  catScaleX: number;
  catScaleY: number;
  focusX: number;
  focusY: number;
  roomCenterX: number;
  roomCenterY: number;
  startZoom: number;
  onComplete: () => void;
}

export const INTRO_DIALOGUE =
  'Stop your silly antics! I hate cats sneaking around my house — no treats for you!';

const GRANNY_HEAD_TEXTURE = 'grandma-talking';
const HEAD_DISPLAY_SCALE = 3.6;
const HEAD_MARGIN_X = 56;
const HEAD_MARGIN_Y = 28;
const DIALOGUE_HOLD_MS = 3400;
const DIALOGUE_FADE_MS = 320;
const DIALOGUE_SHOW_AT_MS = 620;
const REVEAL_MS = 1100;
const SKIP_DELAY_MS = 2000;
const INTRO_PAN_BIAS_X = -52;
const INTRO_PAN_BIAS_Y = 22;

const OVERLAY_SCENE_KEY = 'IntroDialogueOverlay';

function focusPointForCat(cat: Phaser.Physics.Arcade.Sprite): number {
  return cat.getBounds().centerX;
}

function tweenCameraToGameplayView(
  scene: Phaser.Scene,
  cam: Phaser.Cameras.Scene2D.Camera,
  duration: number,
  onDone: () => void,
): void {
  const fromZoom = cam.zoom;
  const fromScrollX = cam.scrollX;
  const fromScrollY = cam.scrollY;

  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration,
    ease: 'Cubic.easeInOut',
    onUpdate: (tween) => {
      const t = tween.getValue() ?? 0;
      cam.setZoom(Phaser.Math.Linear(fromZoom, 1, t));
      cam.setScroll(
        Phaser.Math.Linear(fromScrollX, 0, t),
        Phaser.Math.Linear(fromScrollY, 0, t),
      );
    },
    onComplete: () => {
      cam.setScroll(0, 0);
      cam.setZoom(1);
      onDone();
    },
  });
}

function ensureGrandmaTalkingAnim(scene: Phaser.Scene): void {
  if (scene.anims.exists('grandma-talking')) return;
  if (!scene.textures.exists(GRANNY_HEAD_TEXTURE)) return;

  scene.textures.get(GRANNY_HEAD_TEXTURE).setFilter(Phaser.Textures.FilterMode.NEAREST);
  scene.anims.create({
    key: 'grandma-talking',
    frames: scene.anims.generateFrameNumbers(GRANNY_HEAD_TEXTURE, { start: 0, end: 7 }),
    frameRate: 8,
    repeat: -1,
  });
}

function frameCameraOn(
  cam: Phaser.Cameras.Scene2D.Camera,
  focusX: number,
  zoom: number,
): void {
  const viewW = cam.width;
  const viewH = cam.height;
  const maxScrollX = Math.max(0, viewW - viewW / zoom);
  const maxScrollY = Math.max(0, viewH - viewH / zoom);

  cam.setZoom(zoom);
  cam.setScroll(
    Phaser.Math.Clamp(focusX - viewW / (2 * zoom) + INTRO_PAN_BIAS_X, 0, maxScrollX),
    Phaser.Math.Clamp(INTRO_PAN_BIAS_Y, 0, maxScrollY),
  );
}

interface OverlayLaunchData {
  onDone: () => void;
}

/**
 * Dedicated overlay scene for the intro dialogue. Running the talking head +
 * dialogue box in their own scene means they render with their own camera at
 * zoom 1 and scroll (0, 0), completely independent of whatever the gameplay
 * camera is doing during the punch-in. This avoids both prior failure modes:
 *   - world-space UI pinned with cam.scrollX/Y going off-screen while zoomed
 *     (Phaser's visible worldView is centered on scroll + view/2 at zoom != 1)
 *   - adding/removing a second camera on the gameplay scene, which broke
 *     input hit-testing and Camera.preRender (black screen)
 * The overlay owns its whole lifecycle: show instantly on create, hold, skip
 * via Space/Enter (after a delay), fade out, then report back via onDone.
 */
class IntroDialogueOverlay extends Phaser.Scene {
  private onDone: (() => void) | null = null;
  private dismissed = false;
  private holdTimer: Phaser.Time.TimerEvent | null = null;
  private pieces: (Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];

  constructor() {
    super(OVERLAY_SCENE_KEY);
  }

  init(data: OverlayLaunchData): void {
    this.onDone = data?.onDone ?? null;
    this.dismissed = false;
    this.holdTimer = null;
    this.pieces = [];
  }

  create(): void {
    ensureGrandmaTalkingAnim(this);

    const viewW = this.scale.width;
    const viewH = this.scale.height;

    if (this.textures.exists(GRANNY_HEAD_TEXTURE)) {
      const head = this.add
        .sprite(HEAD_MARGIN_X, viewH - HEAD_MARGIN_Y, GRANNY_HEAD_TEXTURE, 0)
        .setOrigin(0.5, 1)
        .setScale(HEAD_DISPLAY_SCALE)
        .setDepth(5000);
      if (this.anims.exists('grandma-talking')) head.play('grandma-talking');
      this.pieces.push(head);
    } else {
      console.warn(`Intro cutscene: texture "${GRANNY_HEAD_TEXTURE}" is missing from the cache.`);
    }

    const boxLeft = HEAD_MARGIN_X + 34;
    const boxRightPad = 24;
    const boxBottom = viewH - 18;
    const boxWidth = viewW - boxLeft - boxRightPad;
    const boxHeight = 96;
    const boxTop = boxBottom - boxHeight;

    const panel = this.add
      .rectangle(boxLeft + boxWidth / 2, boxTop + boxHeight / 2, boxWidth, boxHeight, 0x241c2b, 0.94)
      .setStrokeStyle(3, 0xffe9b0, 1)
      .setDepth(5000);

    const speaker = this.add
      .text(boxLeft + 14, boxTop + 10, 'Granny', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ff8a80',
      })
      .setDepth(5001);

    const line = this.add
      .text(boxLeft + 14, boxTop + 32, INTRO_DIALOGUE, {
        fontFamily: 'sans-serif',
        fontSize: '17px',
        color: '#ffffff',
        wordWrap: { width: boxWidth - 28 },
        lineSpacing: 4,
      })
      .setDepth(5001);

    this.pieces.push(panel, speaker, line);

    this.holdTimer = this.time.delayedCall(DIALOGUE_HOLD_MS, () => this.dismiss());

    // Skip only via Space/Enter, and only after a grace period, so a stray
    // keypress can't instantly blow past the dialogue.
    this.time.delayedCall(SKIP_DELAY_MS, () => {
      this.input.keyboard?.once('keydown-SPACE', () => this.dismiss());
      this.input.keyboard?.once('keydown-ENTER', () => this.dismiss());
    });
  }

  private dismiss(): void {
    if (this.dismissed) return;
    this.dismissed = true;
    this.holdTimer?.remove(false);

    this.tweens.add({
      targets: this.pieces,
      alpha: 0,
      duration: DIALOGUE_FADE_MS,
      ease: 'Sine.easeIn',
      onComplete: () => {
        const cb = this.onDone;
        this.onDone = null;
        cb?.();
      },
    });
  }
}

function ensureOverlayRegistered(scene: Phaser.Scene): void {
  if (!scene.scene.get(OVERLAY_SCENE_KEY)) {
    scene.scene.add(OVERLAY_SCENE_KEY, IntroDialogueOverlay, false);
  }
}

export function playIntroReveal(
  scene: Phaser.Scene,
  cam: Phaser.Cameras.Scene2D.Camera,
  opts: IntroRevealOptions,
): void {
  const { cat, catScaleX, catScaleY, startZoom, onComplete } = opts;

  ensureGrandmaTalkingAnim(scene);
  ensureOverlayRegistered(scene);

  cat.setScale(catScaleX * 0.2, catScaleY * 0.2);
  cat.setAlpha(0);

  frameCameraOn(cam, focusPointForCat(cat), startZoom);

  scene.tweens.add({
    targets: cat,
    scaleX: catScaleX,
    scaleY: catScaleY,
    alpha: 1,
    duration: 520,
    ease: 'Back.easeOut',
    onUpdate: () => {
      (cat.body as Phaser.Physics.Arcade.Body)?.updateFromGameObject();
    },
  });

  let finished = false;

  const stopOverlay = (): void => {
    if (scene.scene.isActive(OVERLAY_SCENE_KEY) || scene.scene.isPaused(OVERLAY_SCENE_KEY)) {
      scene.scene.stop(OVERLAY_SCENE_KEY);
    }
  };

  // If the gameplay scene shuts down mid-intro (restart, room change), make
  // sure the overlay doesn't linger and the sequence never resumes.
  const onShutdown = (): void => {
    finished = true;
    stopOverlay();
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, onShutdown);

  const finish = (): void => {
    if (finished) return;
    finished = true;
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, onShutdown);
    onComplete();
  };

  const onDialogueDone = (): void => {
    if (finished) return;
    stopOverlay();

    // Defensive: guarantee the cat ended its pop-in at full scale/alpha.
    cat.setScale(catScaleX, catScaleY).setAlpha(1);
    (cat.body as Phaser.Physics.Arcade.Body)?.updateFromGameObject();

    tweenCameraToGameplayView(scene, cam, REVEAL_MS, finish);
  };

  scene.time.delayedCall(DIALOGUE_SHOW_AT_MS, () => {
    if (finished) return;
    scene.scene.launch(OVERLAY_SCENE_KEY, { onDone: onDialogueDone } satisfies OverlayLaunchData);
    scene.scene.bringToTop(OVERLAY_SCENE_KEY);
  });

  scene.cameras.main.fadeIn(280, 0, 0, 0);
}

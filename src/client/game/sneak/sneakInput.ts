import Phaser from 'phaser';
import { DOUBLE_TAP_MS } from './constants.js';

export class SneakInput {
  readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  readonly spaceKey: Phaser.Input.Keyboard.Key;
  readonly bankKey: Phaser.Input.Keyboard.Key;
  readonly downKey: Phaser.Input.Keyboard.Key;
  readonly crouchKey: Phaser.Input.Keyboard.Key;
  readonly leftKey: Phaser.Input.Keyboard.Key;
  readonly rightKey: Phaser.Input.Keyboard.Key;
  readonly upKey: Phaser.Input.Keyboard.Key;

  touchLeft = false;
  touchRight = false;
  touchJump = false;
  touchCrouch = false;

  /** One-shot flag set on touch-jump pointerdown, consumed by consumeJumpPressed(). */
  private touchJumpQueued = false;

  private lastDownTapAt = 0;
  dropThroughBody: Phaser.Physics.Arcade.StaticBody | null = null;

  constructor(
    private scene: Phaser.Scene,
    trackHud: (...objects: Phaser.GameObjects.GameObject[]) => void,
  ) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bankKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.downKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.crouchKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    // WASD mirrors the arrow keys (S doubles as drop-through, handled below).
    this.leftKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.upKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    if (!scene.sys.game.device.input.touch) return;

    scene.input.addPointer(2);
    const h = scene.scale.height;

    const jumpZone = scene.add
      .zone(scene.scale.width / 2, h / 2, scene.scale.width, h)
      .setScrollFactor(0)
      .setInteractive();
    trackHud(jumpZone);
    jumpZone.on('pointerdown', () => { this.touchJump = true; this.touchJumpQueued = true; });
    jumpZone.on('pointerup', () => { this.touchJump = false; });
    jumpZone.on('pointerupoutside', () => { this.touchJump = false; });

    const makeButton = (cx: number, label: string, onDown: () => void, onUp: () => void): void => {
      const pad = scene.add
        .rectangle(cx, h - 70, 104, 104, 0x000000, 0.32)
        .setScrollFactor(0)
        .setDepth(91)
        .setStrokeStyle(3, 0xffffff, 0.5)
        .setInteractive();
      const labelText = scene.add
        .text(cx, h - 70, label, { fontFamily: 'sans-serif', fontSize: '46px', color: '#ffffff' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(92);
      trackHud(pad, labelText);
      const press = (): void => { pad.setFillStyle(0xffffff, 0.28); onDown(); };
      const release = (): void => { pad.setFillStyle(0x000000, 0.32); onUp(); };
      pad.on('pointerdown', press);
      pad.on('pointerup', release);
      pad.on('pointerout', release);
      pad.on('pointerupoutside', release);
    };

    makeButton(74, '◀', () => (this.touchLeft = true), () => (this.touchLeft = false));
    makeButton(196, '▶', () => (this.touchRight = true), () => (this.touchRight = false));
    makeButton(318, '⤓', () => (this.touchCrouch = true), () => (this.touchCrouch = false));
  }

  get crouching(): boolean {
    return this.crouchKey.isDown || this.touchCrouch;
  }

  /** Left held via arrow key, A, or the touch pad. */
  get leftHeld(): boolean {
    return this.cursors.left.isDown || this.leftKey.isDown || this.touchLeft;
  }

  /** Right held via arrow key, D, or the touch pad. */
  get rightHeld(): boolean {
    return this.cursors.right.isDown || this.rightKey.isDown || this.touchRight;
  }

  /**
   * True only on the frame jump was first pressed (keyboard or touch).
   * Edge-detected so holding the button doesn't auto-bounce the cat on every
   * landing. Call at most once per update — JustDown consumes the key event.
   */
  consumeJumpPressed(): boolean {
    const keyboard =
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.upKey);
    const touch = this.touchJumpQueued;
    this.touchJumpQueued = false;
    return keyboard || touch;
  }

  applyDropThrough(
    cat: Phaser.Physics.Arcade.Sprite,
    onGround: boolean,
    getStandingPlatform: () => Phaser.Physics.Arcade.StaticBody | null,
  ): void {
    const downJust =
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.downKey);
    if (!downJust) return;

    const now = this.scene.time.now;
    if (onGround && now - this.lastDownTapAt < DOUBLE_TAP_MS) {
      this.dropThroughBody = getStandingPlatform();
      if (this.dropThroughBody) {
        cat.y += 2;
        (cat.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
      }
    }
    this.lastDownTapAt = now;
  }
}

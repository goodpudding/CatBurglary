import Phaser from 'phaser';
import { DOUBLE_TAP_MS, DROP_THROUGH_MS } from './constants.js';

export class SneakInput {
  readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  readonly spaceKey: Phaser.Input.Keyboard.Key;
  readonly bankKey: Phaser.Input.Keyboard.Key;
  readonly downKey: Phaser.Input.Keyboard.Key;
  readonly crouchKey: Phaser.Input.Keyboard.Key;

  touchLeft = false;
  touchRight = false;
  touchJump = false;
  touchCrouch = false;

  private lastDownTapAt = 0;
  dropThroughUntil = 0;

  constructor(
    private scene: Phaser.Scene,
    trackHud: (...objects: Phaser.GameObjects.GameObject[]) => void,
  ) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bankKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.downKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.crouchKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    if (!scene.sys.game.device.input.touch) return;

    scene.input.addPointer(2);
    const h = scene.scale.height;

    const jumpZone = scene.add
      .zone(scene.scale.width / 2, h / 2, scene.scale.width, h)
      .setScrollFactor(0)
      .setInteractive();
    trackHud(jumpZone);
    jumpZone.on('pointerdown', () => { this.touchJump = true; });
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

  applyDropThrough(cat: Phaser.Physics.Arcade.Sprite, onGround: boolean): void {
    const downJust =
      Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      Phaser.Input.Keyboard.JustDown(this.downKey);
    if (!downJust) return;

    const now = this.scene.time.now;
    if (onGround && now - this.lastDownTapAt < DOUBLE_TAP_MS) {
      this.dropThroughUntil = now + DROP_THROUGH_MS;
      const body = cat.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(Math.max(body.velocity.y, 80));
    }
    this.lastDownTapAt = now;
  }
}

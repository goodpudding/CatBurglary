import Phaser from 'phaser';
import { MAX_LIVES } from './constants.js';

const DETECT_BAR_WIDTH = 132;

export class SneakHud {
  readonly elements: Phaser.GameObjects.GameObject[] = [];
  private hudText!: Phaser.GameObjects.Text;
  private roomText!: Phaser.GameObjects.Text;
  private bankFlash!: Phaser.GameObjects.Text;
  private detectBarFill!: Phaser.GameObjects.Rectangle;

  constructor(private scene: Phaser.Scene) {}

  create(): void {
    this.hudText = this.scene.add
      .text(12, 12, '', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.roomText = this.scene.add
      .text(this.scene.scale.width - 12, 12, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffe9b0',
        align: 'right',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    const hudInstruction = this.scene.add
      .text(
        this.scene.scale.width / 2,
        14,
        'WASD/Arrows to move & jump. Grab treats, then head right → to bank & go deeper. Shift to sneak. Double-tap Down/S to drop from a shelf.',
        {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#ffe9b0',
          backgroundColor: '#00000066',
          padding: { x: 8, y: 4 },
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);
    // Fade the how-to-play banner out after a few seconds so it doesn't clutter play.
    this.scene.tweens.add({
      targets: hudInstruction,
      alpha: 0,
      delay: 5000,
      duration: 900,
      onComplete: () => hudInstruction.setVisible(false),
    });

    this.bankFlash = this.scene.add
      .text(this.scene.scale.width / 2, 80, '', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#9be29b',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    // Slim, unobtrusive detection meter tucked under the score readout.
    const barX = 12;
    const barY = 104;
    const barH = 7;
    const detectBarBg = this.scene.add
      .rectangle(barX, barY, DETECT_BAR_WIDTH, barH, 0x000000, 0.4)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100);
    this.detectBarFill = this.scene.add
      .rectangle(barX + 1, barY + 1, 0, barH - 2, 0x6bd06b)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101);

    this.elements.push(
      this.hudText,
      this.roomText,
      hudInstruction,
      this.bankFlash,
      detectBarBg,
      this.detectBarFill,
    );
  }

  setRoom(label: string, roomNumber: number, totalRooms: number): void {
    this.roomText.setText(`${label}\nRoom ${roomNumber}/${totalRooms}`);
  }

  updateDetection(meter: number, state: string): void {
    const clamped = Phaser.Math.Clamp(meter, 0, 1);
    this.detectBarFill.width = (DETECT_BAR_WIDTH - 2) * clamped;

    const color = state === 'alert' ? 0xff5252 : clamped > 0.5 ? 0xffb300 : 0x6bd06b;
    this.detectBarFill.setFillStyle(color, 1);
  }

  track(...objects: Phaser.GameObjects.GameObject[]): void {
    this.elements.push(...objects);
  }

  applyScale(zoom: number): void {
    const scale = 1 / zoom;
    for (const el of this.elements) {
      (el as Phaser.GameObjects.Image).setScale(scale);
    }
  }

  update(score: number, carried: number, lives: number): void {
    const safeLives = Math.max(0, lives);
    const hearts = '♥'.repeat(safeLives) + '♡'.repeat(Math.max(0, MAX_LIVES - safeLives));
    this.hudText.setText(`Score: ${score}\nCarrying: ${carried}\nLives: ${hearts}`);
  }

  showBankFlash(text: string): void {
    this.bankFlash.setText(text).setAlpha(1);
  }
}

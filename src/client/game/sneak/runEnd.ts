import Phaser from 'phaser';
import { completeRun } from '../../api/playerApi.js';
import { goToMenu } from '../goToMenu.js';

export class RunEndScreen {
  private runSubmitted = false;

  constructor(private scene: Phaser.Scene) {}

  /** Cleared the final room — the whole house has been robbed. */
  showWin(score: number, onPlayAgain: () => void): void {
    const w = this.scene.scale.width;
    const hh = this.scene.scale.height;

    this.scene.add.rectangle(w / 2, hh / 2, w, hh, 0x000000, 0.65).setScrollFactor(0).setDepth(200);
    this.scene.add
      .text(w / 2, hh / 2 - 70, 'You cleaned out the whole house!', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#9be29b',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    const scoreLine = this.scene.add
      .text(w / 2, hh / 2 - 20, `Final score: ${score}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.scene.add
      .text(w / 2, hh / 2 + 16, 'Every room robbed, and not a single slipper to the face.', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#cccccc',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    void this.submitRun(score, scoreLine);
    this.addButtons(w / 2, hh / 2 + 64, onPlayAgain);
  }

  /** Ran out of lives — caught by granny. */
  showCaught(score: number, lost: number, onPlayAgain: () => void): void {
    const w = this.scene.scale.width;
    const hh = this.scene.scale.height;

    this.scene.add.rectangle(w / 2, hh / 2, w, hh, 0x000000, 0.6).setScrollFactor(0).setDepth(200);
    this.scene.add
      .text(w / 2, hh / 2 - 60, 'Caught by the old lady!', {
        fontFamily: 'sans-serif',
        fontSize: '30px',
        color: '#ff8a80',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    const scoreLine = this.scene.add
      .text(w / 2, hh / 2 - 8, `Lost ${lost} carried · Final score: ${score}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    void this.submitRun(score, scoreLine);
    this.addButtons(w / 2, hh / 2 + 60, onPlayAgain);
  }

  private async submitRun(score: number, scoreLine: Phaser.GameObjects.Text): Promise<void> {
    if (this.runSubmitted) return;
    this.runSubmitted = true;

    const profile = await completeRun(score);
    scoreLine.setText(`${scoreLine.text} · ${profile.coins.toLocaleString()} coins saved`);
  }

  private addButtons(x: number, y: number, onPlayAgain: () => void): void {
    this.addActionButton(x, y, 220, 50, 0x42a5f5, 'Play Again', onPlayAgain);
    this.addActionButton(x, y + 58, 220, 44, 0x8e24aa, 'Shop', (pointer) => {
      goToMenu(pointer.event, 'shop');
    });
  }

  private addActionButton(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    label: string,
    onClick: (pointer: Phaser.Input.Pointer) => void,
  ): void {
    const button = this.scene.add
      .rectangle(x, y, width, height, color)
      .setScrollFactor(0)
      .setDepth(201)
      .setInteractive({ useHandCursor: true });
    this.scene.add
      .text(x, y, label, { fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);
    button.on('pointerdown', onClick);
  }
}

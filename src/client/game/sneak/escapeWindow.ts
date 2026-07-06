import Phaser from 'phaser';

export interface EscapeWindow {
  rect?: Phaser.GameObjects.Rectangle;
  zone?: Phaser.GameObjects.Zone;
  hint?: Phaser.GameObjects.Text;
}

export function setupEscapeWindow(
  scene: Phaser.Scene,
  editorWindow: Phaser.GameObjects.Rectangle | undefined,
  onBank: () => void,
): EscapeWindow {
  if (!editorWindow) {
    console.warn('SneakGame: place a window rectangle in Phaser Editor (Arcade body disabled).');
    return {};
  }

  const rect = editorWindow;
  rect.setName('window');
  rect.setDepth(3);
  if (editorWindow.body) {
    scene.physics.world.disable(editorWindow);
  }
  rect.setFillStyle(0x000000, 0);
  rect.setStrokeStyle(0, 0);
  rect.setInteractive({ useHandCursor: true });
  rect.on('pointerdown', onBank);

  const b = rect.getBounds();
  const zone = scene.add.zone(b.centerX, b.centerY, b.width + 4, b.height + 4);
  scene.physics.add.existing(zone, true);

  const hint = scene.add
    .text(b.centerX, b.top - 6, 'Press E or tap window to escape & bank', {
      fontFamily: 'sans-serif',
      fontSize: '11px',
      color: '#cdeaff',
      align: 'center',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    })
    .setOrigin(0.5, 1)
    .setDepth(4)
    .setAlpha(0);

  return { rect, zone, hint };
}

export function isCatInWindow(
  windowZone: Phaser.GameObjects.Zone | undefined,
  cat: Phaser.Physics.Arcade.Sprite,
): boolean {
  if (!windowZone) return false;
  return Phaser.Geom.Rectangle.Overlaps(windowZone.getBounds(), cat.getBounds());
}

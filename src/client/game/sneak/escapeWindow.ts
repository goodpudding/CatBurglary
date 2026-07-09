import Phaser from 'phaser';

export interface EscapeWindow {
  frame: Phaser.GameObjects.Rectangle;
  zone: Phaser.GameObjects.Zone;
  hint: Phaser.GameObjects.Text;
}

export interface EscapeBounds {
  roomRight: number;
  groundTop: number;
}

/**
 * Builds the bathroom escape window — the win trigger for the final room. Uses
 * an editor-authored rectangle labeled "window" when present; otherwise it
 * synthesizes one on the right wall, reachable from the floor. A lit window
 * frame is drawn so the escape point reads clearly as a window (rather than the
 * cat simply walking off the side).
 */
export function setupEscapeWindow(
  scene: Phaser.Scene,
  editorWindow: Phaser.GameObjects.Rectangle | undefined,
  bounds: EscapeBounds,
  onEscape: () => void,
): EscapeWindow {
  let cx: number;
  let cy: number;
  let w: number;
  let h: number;

  if (editorWindow) {
    editorWindow.setName('window');
    if (editorWindow.body) scene.physics.world.disable(editorWindow);
    const b = editorWindow.getBounds();
    cx = b.centerX;
    cy = b.centerY;
    w = Math.max(28, b.width);
    h = Math.max(44, b.height);
    editorWindow.setVisible(false);
  } else {
    w = 60;
    h = 92;
    cx = bounds.roomRight - w * 0.9;
    cy = bounds.groundTop - h * 0.6;
  }

  // A simple lit window frame with a muntin cross, so the escape point is clear.
  const frame = scene.add
    .rectangle(cx, cy, w, h, 0x9fd8ff, 0.22)
    .setStrokeStyle(3, 0xd6efff, 0.95)
    .setDepth(4)
    .setInteractive({ useHandCursor: true });
  frame.on('pointerdown', onEscape);

  const mullions = scene.add.graphics().setDepth(5);
  mullions.lineStyle(2, 0xd6efff, 0.85);
  mullions.beginPath();
  mullions.moveTo(cx, cy - h / 2);
  mullions.lineTo(cx, cy + h / 2);
  mullions.moveTo(cx - w / 2, cy);
  mullions.lineTo(cx + w / 2, cy);
  mullions.strokePath();

  const zone = scene.add.zone(cx, cy, w + 8, h + 8);
  scene.physics.add.existing(zone, true);

  const hint = scene.add
    .text(cx, cy - h / 2 - 8, 'Escape! (jump in / press E)', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#cdeaff',
      align: 'center',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    })
    .setOrigin(0.5, 1)
    .setDepth(6)
    .setAlpha(0);

  return { frame, zone, hint };
}

export function isCatInWindow(
  windowZone: Phaser.GameObjects.Zone | undefined,
  cat: Phaser.Physics.Arcade.Sprite,
): boolean {
  if (!windowZone) return false;
  return Phaser.Geom.Rectangle.Overlaps(windowZone.getBounds(), cat.getBounds());
}

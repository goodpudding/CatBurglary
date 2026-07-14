
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { getSavedVolume, setSavedVolume } from '../game/runConfig.js';
/* END-USER-IMPORTS */

export default class VolumeSlider extends Phaser.GameObjects.Container {

  constructor(scene: Phaser.Scene, x?: number, y?: number) {
    super(scene, x ?? 856, y ?? 92);

    // vs_icon
    const vs_icon = scene.add.text(-78, 0, "🔊", {});
    vs_icon.setOrigin(0.5, 0.5);
    vs_icon.setStyle({ fontSize: "16px" });
    this.add(vs_icon);

    // vs_track
    const vs_track = scene.add.rectangle(0, 0, 120, 6);
    vs_track.isFilled = true;
    vs_track.fillColor = 2960712;
    this.add(vs_track);

    // vs_fill
    const vs_fill = scene.add.rectangle(-60, 0, 60, 6);
    vs_fill.setOrigin(0, 0.5);
    vs_fill.isFilled = true;
    vs_fill.fillColor = 16768324;
    this.add(vs_fill);

    // vs_knob
    const vs_knob = scene.add.ellipse(0, 0, 16, 16);
    vs_knob.isFilled = true;
    vs_knob.fillColor = 16777215;
    this.add(vs_knob);

    /* START-USER-CTR-CODE */
    this.setName('volume-slider');
    this.setScrollFactor(0);
    this.setDepth(1000);
    this.initSlider(vs_track, vs_fill, vs_knob);
    /* END-USER-CTR-CODE */
  }

  public startVolume: number = 0.5;

  /* START-USER-CODE */

  // Drag the knob (or click/drag anywhere on the track) to set the game's
  // master volume. The chosen level persists in localStorage (shared with the
  // splash screen's slider); startVolume (editable on the prefab in Phaser
  // Editor) is only the first-run default. Visuals — colors, sizes, position —
  // are all editable in VolumeSlider.scene.

  private track!: Phaser.GameObjects.Rectangle;
  private fill!: Phaser.GameObjects.Rectangle;
  private knob!: Phaser.GameObjects.Ellipse;

  private initSlider(
    track: Phaser.GameObjects.Rectangle,
    fill: Phaser.GameObjects.Rectangle,
    knob: Phaser.GameObjects.Ellipse,
  ): void {
    this.track = track;
    this.fill = fill;
    this.knob = knob;

    let volume = Phaser.Math.Clamp(this.startVolume, 0, 1);
    try {
      if (localStorage.getItem('treat-dash-volume') !== null) {
        volume = getSavedVolume();
      }
    } catch {
      // localStorage unavailable — fall back to startVolume.
    }
    this.applyVolume(volume, false);

    // A generous hit area (taller than the 6px track) for fingers.
    track.setInteractive(
      new Phaser.Geom.Rectangle(-12, -32, track.width + 24, 76),
      Phaser.Geom.Rectangle.Contains,
    );
    knob.setInteractive({ useHandCursor: true, draggable: true });

    track.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.applyVolume(this.pointerToVolume(pointer), true);
    });
    track.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) this.applyVolume(this.pointerToVolume(pointer), true);
    });
    knob.on('drag', (pointer: Phaser.Input.Pointer) => {
      this.applyVolume(this.pointerToVolume(pointer), true);
    });
  }

  private pointerToVolume(pointer: Phaser.Input.Pointer): number {
    const halfWidth = this.track.width / 2;
    const local = pointer.x - this.x - this.track.x;
    return Phaser.Math.Clamp((local + halfWidth) / this.track.width, 0, 1);
  }

  private applyVolume(volume: number, persist: boolean): void {
    const halfWidth = this.track.width / 2;
    this.scene.game.sound.volume = volume;
    this.fill.setSize(Math.max(1, this.track.width * volume), this.fill.height);
    this.knob.x = this.track.x - halfWidth + this.track.width * volume;

    if (persist) {
      setSavedVolume(volume);
    }
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

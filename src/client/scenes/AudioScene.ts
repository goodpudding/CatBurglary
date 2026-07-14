import Phaser from 'phaser';
import { startLevelMusic } from '../game/gameAudio.js';
import VolumeSlider from './VolumeSlider.js';

/**
 * Stays running in the background so level BGM survives room-to-room scene
 * changes. Also hosts the volume slider: living here (instead of in the room
 * scenes) keeps it on screen across rooms, outside the room-layout scaling,
 * and away from the editor-object collector. Position/visuals/start volume
 * are all editable in VolumeSlider.scene in Phaser Editor.
 */
export default class AudioScene extends Phaser.Scene {
  constructor() {
    super('Audio');
  }

  create(): void {
    startLevelMusic(this);
    this.add.existing(new VolumeSlider(this));
    // Rooms launch after this scene — stay above them so the slider renders
    // and receives input on top of the game.
    this.scene.bringToTop();
  }
}

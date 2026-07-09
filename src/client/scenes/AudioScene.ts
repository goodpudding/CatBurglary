import Phaser from 'phaser';
import { startLevelMusic } from '../game/gameAudio.js';

/**
 * Stays running in the background so level BGM survives room-to-room scene changes.
 */
export default class AudioScene extends Phaser.Scene {
  constructor() {
    super('Audio');
  }

  create(): void {
    startLevelMusic(this);
  }
}

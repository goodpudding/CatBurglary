import Phaser from 'phaser';
import { preloadHouseAssets } from '../assets/preloadHouseAssets.js';
import { FIRST_ROOM_KEY } from '../game/sneak/roomConfig.js';
import { resetRun } from '../game/sneak/runState.js';

/**
 * Loads every asset pack once, then starts a fresh run in the first room.
 * Individual room scenes no longer preload — they rely on the cache warmed here.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    preloadHouseAssets(this);
  }

  create(): void {
    resetRun();
    this.scene.launch('Audio');
    this.input.once('pointerdown', () => this.sound.unlock());
    this.input.keyboard?.once('keydown', () => this.sound.unlock());
    this.scene.start(FIRST_ROOM_KEY);
  }
}

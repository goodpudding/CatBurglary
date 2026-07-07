import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import AudioScene from './scenes/AudioScene.js';
import KitchenRoom from './scenes/KitchenRoom.js';
import LivingRoomRoom from './scenes/LivingRoomRoom.js';
import HallwayRoom from './scenes/HallwayRoom.js';
import BathroomRoom from './scenes/BathroomRoom.js';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1400 },
      debug: false,
    },
  },
  scene: [BootScene, AudioScene, KitchenRoom, LivingRoomRoom, HallwayRoom, BathroomRoom],
};

document.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});

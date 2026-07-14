import Phaser from 'phaser';
import { AUDIO } from '../game/audioKeys.js';

/** Asset packs live at the Vite public root (`src/client/assets` → `/`). */
export function preloadHouseAssets(scene: Phaser.Scene): void {
  scene.load.pack('cats', 'cats/cat-asset-pack.json');
  scene.load.pack('furniture', 'asset-pack.json');
  scene.load.pack('granny', 'granny/granny-asset-pack.json');
  scene.load.pack('outfits', 'outfits/outfit-asset-pack.json');
  scene.load.animation('chihuahua-anims', 'chihuahua-animations.json');

  scene.load.audio(AUDIO.BGM_LEVEL, 'sound/stop-your-silly-antics.mp3');
  scene.load.audio(AUDIO.SFX_BARK, 'sound/dog-small-barking-angrily.mp3');
  scene.load.audio(AUDIO.SFX_THUD, 'sound/thud-impact.mp3');
  scene.load.audio(AUDIO.SFX_GAME_START, 'sound/game-start.mp3');
  scene.load.audio(AUDIO.SFX_GAME_OVER, 'sound/game-over.mp3');
}

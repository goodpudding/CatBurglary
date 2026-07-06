import Phaser from 'phaser';

/** Asset packs live at the Vite public root (`src/client/assets` → `/`). */
export function preloadHouseAssets(scene: Phaser.Scene): void {
  scene.load.pack('cats', 'cats/cat-asset-pack.json');
  scene.load.pack('furniture', 'asset-pack.json');
  scene.load.pack('granny', 'granny/granny-asset-pack.json');
}

import Phaser from 'phaser';

export interface IntroRevealOptions {
  cat: Phaser.Physics.Arcade.Sprite;
  catScaleX: number;
  catScaleY: number;
  focusX: number;
  focusY: number;
  roomCenterX: number;
  roomCenterY: number;
  startZoom: number;
  onComplete: () => void;
}

/** Pop-in on the cat, then zoom out to the full room. */
export function playIntroReveal(
  scene: Phaser.Scene,
  cam: Phaser.Cameras.Scene2D.Camera,
  opts: IntroRevealOptions,
): void {
  const { cat, catScaleX, catScaleY, focusX, focusY, startZoom, onComplete } = opts;

  cat.setScale(catScaleX * 0.2, catScaleY * 0.2);
  cat.setAlpha(0);

  cam.setZoom(startZoom);
  cam.centerOn(focusX, focusY);

  scene.tweens.add({
    targets: cat,
    scaleX: catScaleX,
    scaleY: catScaleY,
    alpha: 1,
    duration: 520,
    ease: 'Back.easeOut',
    onUpdate: () => {
      (cat.body as Phaser.Physics.Arcade.Body)?.updateFromGameObject();
    },
  });

  scene.tweens.add({
    targets: cam,
    zoom: 1,
    duration: 1100,
    delay: 380,
    ease: 'Cubic.easeInOut',
    onUpdate: () => cam.centerOn(focusX, focusY),
    onComplete: () => {
      cam.setScroll(0, 0);
      cam.setZoom(1);
      (cat.body as Phaser.Physics.Arcade.Body)?.updateFromGameObject();
      onComplete();
    },
  });

  scene.cameras.main.fadeIn(280, 0, 0, 0);
}

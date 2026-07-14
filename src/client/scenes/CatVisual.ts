
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default interface CatVisual {

   body: Phaser.Physics.Arcade.Body;
}

export default class CatVisual extends Phaser.Physics.Arcade.Sprite {

  constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
    super(scene, x ?? 0, y ?? 0, texture || "orange-cat-sitting-sheet", frame ?? 0);

    scene.physics.add.existing(this, false);
    this.body.setOffset(1, 4);
    this.body.setCircle(8);

    /* START-USER-CTR-CODE */
    /* END-USER-CTR-CODE */
  }

  public idleAnim: string = "orange-idle";
  public walkAnim: string = "orange-walk";
  public jumpAnim: string = "orange-jump";

  /* START-USER-CODE */

  // The sneak game's CatAnimator reads idleAnim/walkAnim/jumpAnim from this
  // prefab, so whatever animation keys are assigned per cat in Phaser Editor
  // (in the Player prefab's cat groups) are what play in-game.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here


// You can write more code here

/* START OF COMPILED CODE */

import ChihuahuaScript from "./ChihuahuaScript.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default interface Chihuahua {

   body: Phaser.Physics.Arcade.Body;
}

export default class Chihuahua extends Phaser.Physics.Arcade.Sprite {

  constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
    super(scene, x ?? 0, y ?? 0, texture || "chihuahua-barking", frame ?? 0);

    scene.physics.add.existing(this, false);
    this.body.setOffset(6, 2);
    this.body.setCircle(7);
    this.play("chihuahua-walkingchihuahua-walking");

    // chihuahuaScript
    new ChihuahuaScript(this);

    /* START-USER-CTR-CODE */
    this.setName('chihuahua');
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    /* END-USER-CTR-CODE */
  }

  public chargeSpeed: number = 195;
  public chargeDelayMs: number = 900;
  public chargeOnRoomIndex: number = -1;
  public chargeOnEntry: boolean = true;

  /* START-USER-CODE */

  // Dog tuning lives in the prefab properties above (editable per-dog in the
  // Phaser Editor Inspector). ChihuahuaBehavior reads them off the sprite.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

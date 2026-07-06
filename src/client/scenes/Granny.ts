
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default interface Granny {

   body: Phaser.Physics.Arcade.Body;
}

export default class Granny extends Phaser.Physics.Arcade.Sprite {

  constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
    super(scene, x ?? 0, y ?? 0, texture || "Granny_Walking-Sheet", frame ?? 0);

    this.scaleX = 1.5;
    this.scaleY = 1.5;
    this.flipX = true;
    scene.physics.add.existing(this, false);
    this.body.pushable = false;
    this.body.setOffset(7, 0);
    this.body.setSize(11, 28, false);
    this.play("newgrannywalk");

    /* START-USER-CTR-CODE */
    this.setName('granny');
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

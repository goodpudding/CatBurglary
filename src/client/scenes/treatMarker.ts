
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default interface treatMarker {

   body: Phaser.Physics.Arcade.Body;
}

/** Editor-only placement marker; SneakGame spawns animated treats from its position. */
export default class treatMarker extends Phaser.GameObjects.Ellipse {

  constructor(scene: Phaser.Scene, x?: number, y?: number) {
    super(scene, x ?? 0, y ?? 0, 14, 14, 0xffd54a, 0.45);
    this.setStrokeStyle(1, 0x7a5200, 0.8);

    /* START-USER-CTR-CODE */
    this.setName(`treat_${this.points}`);
    /* END-USER-CTR-CODE */
  }

  public points: number = 10;

  /* START-USER-CODE */

  // Label in editor controls point value: treat_15 = 15 points, treat_25 = 25, etc.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

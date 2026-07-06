
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class treatMarker extends Phaser.GameObjects.Ellipse {

  constructor(scene: Phaser.Scene, x?: number, y?: number, width?: number, height?: number) {
    super(scene, x ?? 0, y ?? 0, width ?? 22, height ?? 22);
    this.isFilled = true;
    this.fillColor = 16766794;
    this.isStroked = true;
    this.strokeColor = 8069120;
    this.lineWidth = 2;

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Label in editor controls point value: treat_15 = 15 points, treat_25 = 25, etc.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

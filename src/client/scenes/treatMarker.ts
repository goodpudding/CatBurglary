
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default interface treatMarker {

   body: Phaser.Physics.Arcade.Body;
}

export default class treatMarker extends Phaser.Physics.Arcade.Sprite {

  constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
    super(scene, x ?? 569, y ?? 251, texture || "fish-treat", frame ?? 0);

    scene.physics.add.existing(this, false);
    this.body.setSize(16, 16, false);

    /* START-USER-CTR-CODE */
    this.setName(`treat_${this.points}`);
    /* END-USER-CTR-CODE */
  }

  public points: number = 2;
  public pointSound: string = "get-coin";
  public pointSoundVolume: number = 0.3;

  /* START-USER-CODE */

  // Editor placement marker only — treats.ts replaces it with the animated
  // runtime treat sprite. The points prefab property sets the treat's value.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

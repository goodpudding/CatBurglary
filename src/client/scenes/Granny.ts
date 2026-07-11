
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

  public patrolSpeed: number = 42;
  public chaseSpeed: number = 120;
  public retrieveSpeed: number = 130;
  public visionRange: number = 200;
  public visionAngleDeg: number = 20;
  public detectFillRate: number = 3;
  public throwRange: number = 300;
  public throwCooldownMs: number = 900;
  public throwSpeed: number = 360;
  public touchDamage: boolean = true;
  public sweepDeg: number = 22;
  public sweepSpeedDeg: number = 28;
  public lostSightMs: number = 1600;
  public entryDelayMs: number = 1000;
  public entrySpeed: number = 120;

  /* START-USER-CODE */

  // Granny tuning lives in the prefab properties above (editable per-instance in
  // the Phaser Editor Inspector). GrannyController / StealthSystem / SlipperSystem
  // read them via resolveGrannyTuning(), falling back to the sneak constants.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

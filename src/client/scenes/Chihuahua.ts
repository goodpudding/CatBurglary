
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import {
  CHIHUAHUA_CHARGE_DELAY_MS,
  CHIHUAHUA_CHARGE_ROOM_INDEX,
  CHIHUAHUA_CHARGE_SPEED,
} from '../game/sneak/constants.js';
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

    /* START-USER-CTR-CODE */
    this.setName('chihuahua');
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  chargeOnRoomIndex = CHIHUAHUA_CHARGE_ROOM_INDEX;
  chargeDelayMs = CHIHUAHUA_CHARGE_DELAY_MS;
  chargeSpeed = CHIHUAHUA_CHARGE_SPEED;
  chargeOnEntry = true;

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

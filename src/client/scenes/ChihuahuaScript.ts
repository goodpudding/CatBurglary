
// You can write more code here

/* START OF COMPILED CODE */

import ScriptNode from "./ScriptNode.js";
/* START-USER-IMPORTS */
import Phaser from 'phaser';
import { ChihuahuaBehavior } from '../game/sneak/chihuahuaBehavior.js';
/* END-USER-IMPORTS */

export default class ChihuahuaScript extends ScriptNode {

  constructor(parent: ScriptNode | Phaser.GameObjects.GameObject | Phaser.Scene) {
    super(parent);

    /* START-USER-CTR-CODE */
    // Attach the guard-dog behavior to whatever sprite this script node is
    // placed on in the editor. Delete the node to detach the behavior.
    // Tuning (chargeSpeed etc.) is read lazily from the sprite's own prefab
    // properties, so per-instance overrides from the editor are respected.
    const go = this.gameObject;
    if (go instanceof Phaser.GameObjects.Sprite) {
      ChihuahuaBehavior.attach(go as Phaser.Physics.Arcade.Sprite);
    } else {
      console.warn('ChihuahuaScript: attach me to a sprite (ArcadeSprite in the editor).');
    }
    /* END-USER-CTR-CODE */
  }

  /* START-USER-CODE */

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

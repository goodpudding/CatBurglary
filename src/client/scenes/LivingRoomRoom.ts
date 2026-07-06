
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { SneakGame } from './SneakGame.js';
import { assignEditorNames } from '../game/sneak/editorObjects.js';
import { getRoomByKey } from '../game/sneak/roomConfig.js';
/* END-USER-IMPORTS */

/**
 * Living Room — MINIMAL scaffold. Background + floor + left-entrance player +
 * granny + a forward exit (right edge / toward the stairs up to the hallway).
 * Place shelves (name "surface") and treats (name "treat_N") in Phaser Editor.
 */
export default class LivingRoomRoom extends Phaser.Scene {

  constructor() {
    super("LivingRoomRoom");
  }

  editorCreate(): void {
    // Room background (swap for real living-room art in the editor)
    this.add.image(0, -6, "cat-chaser-livingroom");

    // Floor (invisible ground reference; the art draws the visible floor)
    const floor = this.add.rectangle(0, 44, 480, 24, 0x000000, 0);
    floor.name = 'floor';

    // player (left entrance)
    const player = this.physics.add.sprite(-150, -14, "orange-cat-sitting-sheet", 0);
    player.name = 'player';
    player.play("orange-idle");

    // granny
    const granny = this.physics.add.sprite(60, 5, "granny-2-sheet", 0);
    granny.name = 'granny';
    granny.scaleX = 1.5;
    granny.scaleY = 1.5;
    granny.body.setOffset(13, 9);
    granny.body.setSize(12, 33, false);

    // exit → up the stairs to the Hallway (tall trigger strip, no physics body)
    const exit = this.add.rectangle(165, -14, 22, 120, 0x3a6ea5, 0);
    exit.name = 'exit';

    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

  create() {
    this.editorCreate();
    assignEditorNames(this);
    new SneakGame(this, getRoomByKey('LivingRoomRoom')).start();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */


// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { SneakGame } from './SneakGame.js';
import { assignEditorNames } from '../game/sneak/editorObjects.js';
import { getRoomByKey } from '../game/sneak/roomConfig.js';
/* END-USER-IMPORTS */

export default class BathroomRoom extends Phaser.Scene {

  constructor() {
    super("BathroomRoom");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  preload(): void {

    this.load.pack("cat-asset-pack", "client/assets/cats/cat-asset-pack.json");
    this.load.pack("asset-pack", "client/assets/asset-pack.json");
    this.load.pack("granny-asset-pack", "client/assets/granny/granny-asset-pack.json");
  }

  editorCreate(): void {

    // cat_chaser_bathroom_1
    const cat_chaser_bathroom_1 = this.add.image(0, -6, "cat-chaser-bathroom");
    cat_chaser_bathroom_1.flipX = true;

    // floor
    const floor = this.add.rectangle(-1, 30, 128, 128);
    floor.scaleX = 3.75;
    floor.scaleY = 0.1875;

    // player
    const player = this.physics.add.sprite(-177, 7, "orange-cat-sitting-sheet", 0);
    player.body.setOffset(1, 4);
    player.body.setCircle(8);
    player.play("orange-idle");

    // granny
    const granny = this.physics.add.sprite(-201, -10, "granny-2-sheet", 0);
    granny.scaleX = 1.5;
    granny.scaleY = 1.5;
    granny.body.setOffset(13, 9);
    granny.body.setSize(12, 33, false);

    // exit
    const exit = this.add.rectangle(165, -14, 128, 128);
    exit.scaleX = 0.171875;
    exit.scaleY = 0.9375;

    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

  create() {
    this.editorCreate();
    assignEditorNames(this);
    new SneakGame(this, getRoomByKey('BathroomRoom')).start();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

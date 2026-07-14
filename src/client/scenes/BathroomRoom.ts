
// You can write more code here

/* START OF COMPILED CODE */

import Player from "./Player.js";
import Granny from "./Granny.js";
import treatMarker from "./treatMarker.js";
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
    const player = new Player(this, -177, 7);
    this.add.existing(player);

    // granny
    const granny = new Granny(this, -201, -10);
    this.add.existing(granny);

    // exit
    const exit = this.add.rectangle(165, -14, 128, 128);
    exit.scaleX = 0.171875;
    exit.scaleY = 0.9375;

    // sinkcounter
    const sinkcounter = this.add.rectangle(-104, -13, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    sinkcounter.scaleX = 0.5487964135494053;
    sinkcounter.scaleY = 0.039523357112656726;
    this.physics.add.existing(sinkcounter, false);
    sinkcounter.body.moves = false;
    sinkcounter.body.allowGravity = false;
    sinkcounter.body.allowDrag = false;
    sinkcounter.body.allowRotation = false;
    sinkcounter.body.pushable = false;
    sinkcounter.body.immovable = true;
    sinkcounter.body.setSize(128, 128, false);

    // showercurtainrod
    const showercurtainrod = this.add.rectangle(57, -33, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    showercurtainrod.scaleX = 0.39879255567094024;
    showercurtainrod.scaleY = 0.01871796600186704;
    this.physics.add.existing(showercurtainrod, false);
    showercurtainrod.body.moves = false;
    showercurtainrod.body.allowGravity = false;
    showercurtainrod.body.allowDrag = false;
    showercurtainrod.body.allowRotation = false;
    showercurtainrod.body.pushable = false;
    showercurtainrod.body.immovable = true;
    showercurtainrod.body.setSize(128, 128, false);

    // laundry
    const laundry = this.add.rectangle(9, -3, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    laundry.scaleX = 0.22749477410368465;
    laundry.scaleY = 0.014214760966194909;
    this.physics.add.existing(laundry, false);
    laundry.body.moves = false;
    laundry.body.allowGravity = false;
    laundry.body.allowDrag = false;
    laundry.body.allowRotation = false;
    laundry.body.pushable = false;
    laundry.body.immovable = true;
    laundry.body.setSize(128, 128, false);

    // shelf1
    const shelf1 = this.add.rectangle(112, -21, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf1.scaleX = 0.24496751181854476;
    shelf1.scaleY = 0.013742346156655372;
    this.physics.add.existing(shelf1, false);
    shelf1.body.moves = false;
    shelf1.body.allowGravity = false;
    shelf1.body.allowDrag = false;
    shelf1.body.allowRotation = false;
    shelf1.body.pushable = false;
    shelf1.body.immovable = true;
    shelf1.body.setSize(128, 128, false);

    // shelf
    const shelf = this.add.rectangle(112, -30, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf.scaleX = 0.260839197477906;
    shelf.scaleY = 0.011522178852405526;
    this.physics.add.existing(shelf, false);
    shelf.body.moves = false;
    shelf.body.allowGravity = false;
    shelf.body.allowDrag = false;
    shelf.body.allowRotation = false;
    shelf.body.pushable = false;
    shelf.body.immovable = true;
    shelf.body.setSize(128, 128, false);

    // window
    const window = this.add.rectangle(151, -25, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    window.scaleX = 0.30562382995857473;
    window.scaleY = 0.1917200469289748;
    this.physics.add.existing(window, false);
    window.body.enable = false;
    window.body.moves = false;
    window.body.allowGravity = false;
    window.body.allowDrag = false;
    window.body.allowRotation = false;
    window.body.pushable = false;
    window.body.immovable = true;
    window.body.setSize(128, 128, false);

    // treatMarker_0
    const treatMarker_0 = new treatMarker(this, -151, 10);
    this.add.existing(treatMarker_0);

    // treatMarker_1
    const treatMarker_1 = new treatMarker(this, -67, 10);
    this.add.existing(treatMarker_1);

    // treatMarker_2
    const treatMarker_2 = new treatMarker(this, -105, -44);
    this.add.existing(treatMarker_2);

    // treatMarker_3
    const treatMarker_3 = new treatMarker(this, 8, 13);
    this.add.existing(treatMarker_3);

    // treatMarker_4
    const treatMarker_4 = new treatMarker(this, 62, -45);
    this.add.existing(treatMarker_4);

    // treatMarker_5
    const treatMarker_5 = new treatMarker(this, 110, 2);
    this.add.existing(treatMarker_5);

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

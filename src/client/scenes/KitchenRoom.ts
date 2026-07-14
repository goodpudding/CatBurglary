
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

export default class KitchenRoom extends Phaser.Scene {

  constructor() {
    super("KitchenRoom");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {

    // floor
    const floor = this.add.rectangle(129, 93, 128, 128);
    floor.scaleX = 3.75;
    floor.scaleY = 0.1875;

    // cat_chaser_kitchen_1
    this.add.image(129, 43, "cat-chaser-kitchen");

    // surface_8
    const surface_8 = this.add.rectangle(204, 45, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_8.scaleX = 0.2862228728530286;
    surface_8.scaleY = 0.013473241110491752;
    this.physics.add.existing(surface_8, false);
    surface_8.body.moves = false;
    surface_8.body.allowGravity = false;
    surface_8.body.immovable = true;

    // shelf3
    const shelf3 = this.add.rectangle(10, 10, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf3.scaleX = 0.2362395551002121;
    shelf3.scaleY = 0.011659727796318171;
    this.physics.add.existing(shelf3, false);
    shelf3.body.moves = false;
    shelf3.body.allowGravity = false;
    shelf3.body.pushable = false;
    shelf3.body.immovable = true;
    shelf3.body.setOffset(0, -18);
    shelf3.body.setSize(129, 154, false);

    // shelf2
    const shelf2 = this.add.rectangle(32, 17, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf2.scaleX = 0.21724038641538912;
    shelf2.scaleY = 0.024917583143671318;
    this.physics.add.existing(shelf2, false);
    shelf2.body.moves = false;
    shelf2.body.allowGravity = false;
    shelf2.body.immovable = true;

    // shelf1
    const shelf1 = this.add.rectangle(13, 22, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf1.scaleX = 0.15792978834706733;
    shelf1.scaleY = 0.01579184111122222;
    this.physics.add.existing(shelf1, false);
    shelf1.body.moves = false;
    shelf1.body.allowGravity = false;
    shelf1.body.immovable = true;

    // chair
    const chair = this.add.rectangle(44, 71, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    chair.scaleX = 0.1880526678127426;
    chair.scaleY = 0.02320556776551649;
    this.physics.add.existing(chair, false);
    chair.body.moves = false;
    chair.body.allowGravity = false;
    chair.body.immovable = true;

    // player
    const player = new Player(this, 202, 35);
    this.add.existing(player);

    // granny
    const granny = new Granny(this, -12, 60);
    this.add.existing(granny);

    // exit
    const exit = this.add.rectangle(314, 36, 128, 128);
    exit.scaleX = 0.171875;
    exit.scaleY = 0.9375;

    // fridgeTop
    const fridgeTop = this.add.rectangle(273, 24, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    fridgeTop.scaleX = 0.22706365640457488;
    fridgeTop.scaleY = 0.016695929436148248;
    this.physics.add.existing(fridgeTop, false);
    fridgeTop.body.moves = false;
    fridgeTop.body.allowGravity = false;
    fridgeTop.body.allowDrag = false;
    fridgeTop.body.pushable = false;
    fridgeTop.body.immovable = true;
    fridgeTop.body.setSize(128, 128, false);

    // table
    const table = this.add.rectangle(-9, 60, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    table.scaleX = 0.47898560961635495;
    table.scaleY = 0.026383428530120715;
    this.physics.add.existing(table, false);
    table.body.moves = false;
    table.body.allowGravity = false;
    table.body.allowDrag = false;
    table.body.allowRotation = false;
    table.body.pushable = false;
    table.body.immovable = true;
    table.body.setSize(117, 127, false);

    // upperCabinets
    const upperCabinets = this.add.rectangle(161, 12, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    upperCabinets.scaleX = 0.7486299499060819;
    upperCabinets.scaleY = -0.0050595380867452956;
    this.physics.add.existing(upperCabinets, false);
    upperCabinets.body.moves = false;
    upperCabinets.body.allowGravity = false;
    upperCabinets.body.allowDrag = false;
    upperCabinets.body.allowRotation = false;
    upperCabinets.body.pushable = false;
    upperCabinets.body.immovable = true;
    upperCabinets.body.setSize(117, 127, false);

    // upperCabinets_1
    const upperCabinets_1 = this.add.rectangle(161, 53, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    upperCabinets_1.scaleX = 0.7486299499060819;
    upperCabinets_1.scaleY = -0.0050595380867452956;
    this.physics.add.existing(upperCabinets_1, false);
    upperCabinets_1.body.moves = false;
    upperCabinets_1.body.allowGravity = false;
    upperCabinets_1.body.allowDrag = false;
    upperCabinets_1.body.allowRotation = false;
    upperCabinets_1.body.pushable = false;
    upperCabinets_1.body.immovable = true;
    upperCabinets_1.body.setSize(117, 127, false);

    // kitchenTreat
    const kitchenTreat = new treatMarker(this, 15, 16);
    this.add.existing(kitchenTreat);

    // kitchenTreat2
    const kitchenTreat2 = new treatMarker(this, 177, 6);
    this.add.existing(kitchenTreat2);

    // treatMarker_0
    const treatMarker_0 = new treatMarker(this, -42, 75);
    this.add.existing(treatMarker_0);

    // treatMarker_1
    const treatMarker_1 = new treatMarker(this, -30, -2);
    this.add.existing(treatMarker_1);

    // treatMarker_2
    const treatMarker_2 = new treatMarker(this, 56, -12);
    this.add.existing(treatMarker_2);

    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

  create() {
    this.editorCreate();
    assignEditorNames(this);
    new SneakGame(this, getRoomByKey('KitchenRoom')).start();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

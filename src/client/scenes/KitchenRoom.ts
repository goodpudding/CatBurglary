
// You can write more code here

/* START OF COMPILED CODE */

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

  preload(): void {

    this.load.pack("cat-asset-pack", "client/assets/cats/cat-asset-pack.json");
    this.load.pack("asset-pack", "client/assets/asset-pack.json");
    this.load.pack("granny-asset-pack", "client/assets/granny/granny-asset-pack.json");
  }

  editorCreate(): void {

    // floor
    const floor = this.add.rectangle(109, 80, 128, 128);
    floor.scaleX = 3.75;
    floor.scaleY = 0.1875;

    // cat_chaser_kitchen_1
    this.add.image(109, 30, "cat-chaser-kitchen");

    // surface_8
    const surface_8 = this.add.rectangle(184, 32, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_8.scaleX = 0.2862228728530286;
    surface_8.scaleY = 0.013473241110491752;
    this.physics.add.existing(surface_8, false);
    surface_8.body.moves = false;
    surface_8.body.allowGravity = false;
    surface_8.body.immovable = true;

    // surface_9
    const surface_9 = this.add.rectangle(141, 40, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_9.scaleX = 1.4940574686703414;
    surface_9.scaleY = 0.02082740716172833;
    this.physics.add.existing(surface_9, false);
    surface_9.body.moves = false;
    surface_9.body.allowGravity = false;
    surface_9.body.immovable = true;

    // surface_10
    const surface_10 = this.add.rectangle(142, -2, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_10.scaleX = 1.4922865630373612;
    surface_10.scaleY = 0.02306023131587632;
    this.physics.add.existing(surface_10, false);
    surface_10.body.moves = false;
    surface_10.body.allowGravity = false;
    surface_10.body.immovable = true;

    // surface_11
    const surface_11 = this.add.rectangle(-10, -3, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_11.scaleX = 0.2362395551002121;
    surface_11.scaleY = 0.011659727796318171;
    this.physics.add.existing(surface_11, false);
    surface_11.body.moves = false;
    surface_11.body.allowGravity = false;
    surface_11.body.immovable = true;

    // surface_12
    const surface_12 = this.add.rectangle(13, 4, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_12.scaleX = 0.15792978834706733;
    surface_12.scaleY = 0.01579184111122222;
    this.physics.add.existing(surface_12, false);
    surface_12.body.moves = false;
    surface_12.body.allowGravity = false;
    surface_12.body.immovable = true;

    // surface_13
    const surface_13 = this.add.rectangle(-7, 11, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_13.scaleX = 0.15792978834706733;
    surface_13.scaleY = 0.01579184111122222;
    this.physics.add.existing(surface_13, false);
    surface_13.body.moves = false;
    surface_13.body.allowGravity = false;
    surface_13.body.immovable = true;

    // surface_14
    const surface_14 = this.add.rectangle(-28, 48, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_14.scaleX = 0.6346308464282343;
    surface_14.scaleY = 0.020144721226014163;
    this.physics.add.existing(surface_14, false);
    surface_14.body.moves = false;
    surface_14.body.allowGravity = false;
    surface_14.body.immovable = true;

    // surface_15
    const surface_15 = this.add.rectangle(24, 58, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    surface_15.scaleX = 0.1061476040379177;
    surface_15.scaleY = 0.02005233753803979;
    this.physics.add.existing(surface_15, false);
    surface_15.body.moves = false;
    surface_15.body.allowGravity = false;
    surface_15.body.immovable = true;

    // treat_10
    const treat_10 = this.add.ellipse(141, 24, 14, 14);
    treat_10.isFilled = true;
    treat_10.fillColor = 16766282;

    // treat_15
    const treat_15 = this.add.ellipse(13, -12, 14, 14);
    treat_15.isFilled = true;
    treat_15.fillColor = 16766282;

    // treat_10_1
    const treat_10_1 = this.add.ellipse(24, 42, 14, 14);
    treat_10_1.isFilled = true;
    treat_10_1.fillColor = 16766282;

    // treat_20
    const treat_20 = this.add.ellipse(236, 14, 14, 14);
    treat_20.isFilled = true;
    treat_20.fillColor = 16740419;

    // player
    const player = this.physics.add.sprite(86, 22, "orange-cat-sitting-sheet", 0);
    player.body.setOffset(1, 4);
    player.body.setCircle(8);
    player.play("orange-idle");

    // granny
    const granny = this.physics.add.sprite(236, 41, "granny-2-sheet", 0);
    granny.scaleX = 1.5;
    granny.scaleY = 1.5;
    granny.body.setOffset(13, 9);
    granny.body.setSize(12, 33, false);

    // exit
    const exit = this.add.rectangle(274, 22, 128, 128);
    exit.scaleX = 0.171875;
    exit.scaleY = 0.9375;

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

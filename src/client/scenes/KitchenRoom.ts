
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

  editorCreate(): void {

    // Floor (invisible ground reference; the art draws the visible floor)
    const floor = this.add.rectangle(-4597, 44, 480, 24, 0x000000, 0);
    floor.name = 'floor';

    // cat_chaser_kitchen_1 (room background)
    this.add.image(-4597, -6, "cat-chaser-kitchen");

    // Kitchen shelves (ported from the original House level)
    this.makeShelf(-4522, -4, 0.2862228728530286, 0.013473241110491752);
    this.makeShelf(-4565, 4, 1.4940574686703414, 0.02082740716172833);
    this.makeShelf(-4564, -38, 1.4922865630373612, 0.02306023131587632);
    this.makeShelf(-4716, -39, 0.2362395551002121, 0.011659727796318171);
    this.makeShelf(-4693, -32, 0.15792978834706733, 0.01579184111122222);
    this.makeShelf(-4713, -25, 0.15792978834706733, 0.01579184111122222);
    this.makeShelf(-4734, 12, 0.6346308464282343, 0.020144721226014163);
    this.makeShelf(-4682, 22, 0.1061476040379177, 0.02005233753803979);

    // Treats to grab (name treat_N drives the point value)
    this.makeTreat(-4565, -12, 'treat_10');
    this.makeTreat(-4693, -48, 'treat_15');
    this.makeTreat(-4682, 6, 'treat_10');
    this.makeTreat(-4470, -22, 'treat_20');

    // player (near the left entrance)
    const player = this.physics.add.sprite(-4620, -14, "orange-cat-sitting-sheet", 0);
    player.name = 'player';
    player.play("orange-idle");

    // granny
    const granny = this.physics.add.sprite(-4470, 5, "granny-2-sheet", 0);
    granny.name = 'granny';
    granny.scaleX = 1.5;
    granny.scaleY = 1.5;
    granny.body.setOffset(13, 9);
    granny.body.setSize(12, 33, false);

    // exit (forward doorway on the right — no physics body, tall trigger strip)
    const exit = this.add.rectangle(-4432, -14, 22, 120, 0x3a6ea5, 0);
    exit.name = 'exit';

    this.events.emit("scene-awake");
  }

  /** Thin shelf rectangle with a static Arcade body added later by PlatformSystem. */
  private makeShelf(x: number, y: number, scaleX: number, scaleY: number): void {
    const shelf = this.add.rectangle(x, y, 128, 128, 0x000000, 0);
    shelf.scaleX = scaleX;
    shelf.scaleY = scaleY;
    shelf.name = 'surface';
    this.physics.add.existing(shelf, true);
  }

  private makeTreat(x: number, y: number, name: string): void {
    const treat = this.add.ellipse(x, y, 14, 14, 0xffd54a);
    treat.name = name;
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


// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { SneakGame } from './SneakGame.js';
import { preloadHouseAssets } from '../assets/preloadHouseAssets.js';
/* END-USER-IMPORTS */

export default class HouseLevel extends Phaser.Scene {

  constructor() {
    super("HouseLevel");

    /* START-USER-CTR-CODE */
    // Write your code here.
    /* END-USER-CTR-CODE */
  }

  editorCreate(): void {

    // Floor
    const floor = this.add.rectangle(-557, 549, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    floor.scaleX = 50;
    this.physics.add.existing(floor, false);
    floor.body.moves = false;
    floor.body.allowGravity = false;
    floor.body.allowDrag = false;
    floor.body.allowRotation = false;
    floor.body.pushable = false;
    floor.body.immovable = true;
    floor.body.setSize(128, 128, false);
    floor.isFilled = true;
    floor.fillColor = 8211743;
    floor.isStroked = true;
    floor.strokeColor = 12680993;

    // furniture_sofa_couch
    const furniture_sofa_couch = this.add.image(-2681, 361, "furniture-sofa-couch") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_sofa_couch.scaleX = 8;
    furniture_sofa_couch.scaleY = 8;
    this.physics.add.existing(furniture_sofa_couch, false);
    furniture_sofa_couch.body.setOffset(15, 48);
    furniture_sofa_couch.body.setSize(57, 2, false);

    // furniture_livingroom_bookshelf
    const furniture_livingroom_bookshelf = this.add.image(-1901, 181, "furniture-livingroom-bookshelf") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_livingroom_bookshelf.setInteractive(new Phaser.Geom.Rectangle(0, 0, 90, 90), Phaser.Geom.Rectangle.Contains);
    furniture_livingroom_bookshelf.scaleX = 8;
    furniture_livingroom_bookshelf.scaleY = 8;
    this.physics.add.existing(furniture_livingroom_bookshelf, false);
    furniture_livingroom_bookshelf.body.setOffset(25, 57);
    furniture_livingroom_bookshelf.body.setSize(36, 5, false);

    // furniture_tv_stand_table
    const furniture_tv_stand_table = this.add.image(-1106, 410, "furniture-tv-stand-table") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_tv_stand_table.scaleX = 8;
    furniture_tv_stand_table.scaleY = 8;
    this.physics.add.existing(furniture_tv_stand_table, false);
    furniture_tv_stand_table.body.setOffset(4, 10);
    furniture_tv_stand_table.body.setSize(43, 3, false);

    // furniture_tv
    const furniture_tv = this.add.image(-1080, 269, "furniture-tv") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_tv.setInteractive(new Phaser.Geom.Rectangle(0, 0, 64, 64), Phaser.Geom.Rectangle.Contains);
    furniture_tv.scaleX = 8;
    furniture_tv.scaleY = 8;
    this.physics.add.existing(furniture_tv, false);
    furniture_tv.body.setOffset(14, 27);
    furniture_tv.body.setSize(27, 5, false);

    // furniture_standing_livingroom_lamp
    const furniture_standing_livingroom_lamp = this.add.image(-3169, 299, "furniture-standing-livingroom-lamp");
    furniture_standing_livingroom_lamp.scaleX = 8;
    furniture_standing_livingroom_lamp.scaleY = 8;

    // furniture_side_table
    const furniture_side_table = this.add.image(-1445, 400, "furniture-side-table") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_side_table.setInteractive(new Phaser.Geom.Rectangle(4, 6, 19.757695976644463, 2.8168992701231197), Phaser.Geom.Rectangle.Contains);
    furniture_side_table.scaleX = 8;
    furniture_side_table.scaleY = 8;
    this.physics.add.existing(furniture_side_table, false);
    furniture_side_table.body.setOffset(0, 6);
    furniture_side_table.body.setSize(28, 6, false);

    // furniture_dining_chair_2
    const furniture_dining_chair_2 = this.add.image(-578, 386, "furniture-kitchen-chair") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_dining_chair_2.setInteractive(new Phaser.Geom.Rectangle(8, 16, 15.40562448896971, 5.082555181211728), Phaser.Geom.Rectangle.Contains);
    furniture_dining_chair_2.scaleX = 8;
    furniture_dining_chair_2.scaleY = 8;
    this.physics.add.existing(furniture_dining_chair_2, false);
    furniture_dining_chair_2.body.setOffset(9, 17);
    furniture_dining_chair_2.body.setSize(13, 4, false);

    // furniture_cabinets
    const furniture_cabinets = this.add.image(1018, 360, "furniture-cabinets") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_cabinets.setInteractive(new Phaser.Geom.Rectangle(10, 62, 117.95475780688665, 32.02103197348853), Phaser.Geom.Rectangle.Contains);
    furniture_cabinets.scaleX = 5;
    furniture_cabinets.scaleY = 5;
    this.physics.add.existing(furniture_cabinets, false);
    furniture_cabinets.body.setOffset(11, 61);
    furniture_cabinets.body.setSize(118, 5, false);

    // furniture_kitchen_trash_can
    const furniture_kitchen_trash_can = this.add.image(674, 424, "furniture-kitchen-trash-can") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_kitchen_trash_can.setInteractive(new Phaser.Geom.Rectangle(10, 3, 13.020502084326466, 6.99054230194486), Phaser.Geom.Rectangle.Contains);
    furniture_kitchen_trash_can.scaleX = 5;
    furniture_kitchen_trash_can.scaleY = 5;
    this.physics.add.existing(furniture_kitchen_trash_can, false);
    furniture_kitchen_trash_can.body.setSize(32, 32, false);

    // window
    const window = this.add.rectangle(585, 247, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    window.scaleY = 1.6;
    this.physics.add.existing(window, false);
    window.body.moves = false;
    window.body.allowGravity = false;
    window.body.setOffset(1, 123);
    window.body.setSize(131, 10, false);
    window.isFilled = true;
    window.fillColor = 11855856;
    window.isStroked = true;
    window.strokeColor = 8079890;
    window.lineWidth = 7;

    // player
    const player = this.physics.add.sprite(585, 292, "orange-cat-sitting-sheet", 0);
    player.setInteractive(new Phaser.Geom.Ellipse(10, 11, 12.671048389056036, 15.230906090318125), Phaser.Geom.Ellipse.Contains);
    player.scaleX = 4;
    player.scaleY = 4;
    player.body.setOffset(3, 4);
    player.body.setCircle(7);
    player.play("orange-idle");

    // granny
    const granny = this.physics.add.sprite(1492, 351, "granny-2-sheet", 0);
    granny.setInteractive(new Phaser.Geom.Ellipse(19, 26, 11.509894774127485, 33.450921619052785), Phaser.Geom.Ellipse.Contains);
    granny.scaleX = 8;
    granny.scaleY = 8;
    granny.body.setOffset(13, 9);
    granny.body.setSize(12, 33, false);

    // furniture_dining_chair
    const furniture_dining_chair = this.add.image(268, 391, "furniture-kitchen-chair") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_dining_chair.setInteractive(new Phaser.Geom.Rectangle(8, 16, 15.40562448896971, 5.082555181211728), Phaser.Geom.Rectangle.Contains);
    furniture_dining_chair.scaleX = 8;
    furniture_dining_chair.scaleY = 8;
    this.physics.add.existing(furniture_dining_chair, false);
    furniture_dining_chair.body.setOffset(9, 17);
    furniture_dining_chair.body.setSize(13, 4, false);

    // furniture_kitchen_table
    const furniture_kitchen_table = this.add.image(-148, 384, "furniture-kitchen-table") as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.Body };
    furniture_kitchen_table.setInteractive(new Phaser.Geom.Rectangle(0, 0, 98, 64), Phaser.Geom.Rectangle.Contains);
    furniture_kitchen_table.scaleX = 8;
    furniture_kitchen_table.scaleY = 8;
    this.physics.add.existing(furniture_kitchen_table, false);
    furniture_kitchen_table.body.setOffset(8, 21);
    furniture_kitchen_table.body.setSize(81, 6, false);

    // lists
    const furniture = [furniture_sofa_couch, furniture_livingroom_bookshelf, furniture_tv_stand_table, furniture_tv, furniture_standing_livingroom_lamp, furniture_side_table, furniture_dining_chair_2, furniture_cabinets, furniture_kitchen_trash_can, window, furniture_dining_chair, furniture_kitchen_table];

    this.furniture = furniture;

    this.events.emit("scene-awake");
  }

  private furniture!: Array<Phaser.GameObjects.Image|Phaser.GameObjects.Rectangle>;

  /* START-USER-CODE */

  preload(): void {
    preloadHouseAssets(this);
  }

  create() {
    void this.furniture;
    this.editorCreate();
    for (const child of this.children.list) {
      if (child instanceof Phaser.GameObjects.Rectangle) {
        const rect = child as Phaser.GameObjects.Rectangle;
        if (rect.displayWidth > 800) rect.setName('floor');
        else rect.setName('window');
      } else if (child instanceof Phaser.Physics.Arcade.Sprite) {
        const key = child.texture?.key?.toLowerCase() ?? '';
        if (key.includes('granny') || key.includes('wizard')) child.setName('granny');
        else if (key.includes('orange-cat')) child.setName('player');
      } else if (child instanceof Phaser.GameObjects.Image) {
        const key = child.texture?.key?.toLowerCase() ?? '';
        if (key.includes('granny') || key.includes('wizard')) child.setName('granny');
      }
    }
    new SneakGame(this).start();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

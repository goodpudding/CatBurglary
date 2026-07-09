
// You can write more code here

/* START OF COMPILED CODE */

import Chihuahua from "./Chihuahua.js";
import treatMarker from "./treatMarker.js";
import Granny from "./Granny.js";
/* START-USER-IMPORTS */
import { SneakGame } from './SneakGame.js';
import { assignEditorNames } from '../game/sneak/editorObjects.js';
import { getRoomByKey } from '../game/sneak/roomConfig.js';
/* END-USER-IMPORTS */

export default class LivingRoomRoom extends Phaser.Scene {

  constructor() {
    super("LivingRoomRoom");

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

    // cat_chaser_livingroom_1
    this.add.image(136, 42, "cat-chaser-livingroom");

    // floor
    const floor = this.add.rectangle(136, 92, 128, 128);
    floor.scaleX = 3.75;
    floor.scaleY = 0.1875;

    // player
    const player = this.physics.add.sprite(-37, 71, "orange-cat-sitting-sheet", 0);
    player.body.setOffset(1, 4);
    player.body.setCircle(8);
    player.play("orange-idle");

    // granny
    const granny = new Granny(this, -46, 59);
    this.add.existing(granny);

    // exit
    const exit = this.add.rectangle(305, 33, 128, 128);
    exit.scaleX = 0.19303263008284394;
    exit.scaleY = 0.7396473973216114;

    // chairSeat
    const chairSeat = this.add.rectangle(-14, 72, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    chairSeat.scaleX = 0.13639484769901022;
    chairSeat.scaleY = 0.03635253630518463;
    this.physics.add.existing(chairSeat, false);
    chairSeat.body.moves = false;
    chairSeat.body.allowGravity = false;
    chairSeat.body.allowDrag = false;
    chairSeat.body.allowRotation = false;
    chairSeat.body.pushable = false;
    chairSeat.body.immovable = true;
    chairSeat.body.setSize(128, 128, false);

    // tvStand
    const tvStand = this.add.rectangle(26, 70, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    tvStand.scaleX = 0.34051626123162715;
    tvStand.scaleY = 0.017293580830998065;
    this.physics.add.existing(tvStand, false);
    tvStand.body.moves = false;
    tvStand.body.allowGravity = false;
    tvStand.body.allowDrag = false;
    tvStand.body.allowRotation = false;
    tvStand.body.pushable = false;
    tvStand.body.immovable = true;
    tvStand.body.setSize(128, 128, false);

    // tvTop
    const tvTop = this.add.rectangle(25, 49, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    tvTop.scaleX = 0.20493352890319508;
    tvTop.scaleY = 0.014204021469748637;
    this.physics.add.existing(tvTop, false);
    tvTop.body.moves = false;
    tvTop.body.allowGravity = false;
    tvTop.body.allowDrag = false;
    tvTop.body.allowRotation = false;
    tvTop.body.pushable = false;
    tvTop.body.immovable = true;
    tvTop.body.setSize(128, 128, false);

    // shelf1
    const shelf1 = this.add.rectangle(40, 11, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf1.scaleX = 0.11560052847628377;
    shelf1.scaleY = 0.008867510416294662;
    this.physics.add.existing(shelf1, false);
    shelf1.body.moves = false;
    shelf1.body.allowGravity = false;
    shelf1.body.allowDrag = false;
    shelf1.body.allowRotation = false;
    shelf1.body.pushable = false;
    shelf1.body.immovable = true;
    shelf1.body.setSize(128, 128, false);

    // shelf2
    const shelf2 = this.add.rectangle(60, 21, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf2.scaleX = 0.1901932268467354;
    shelf2.scaleY = 0.010737301151627809;
    this.physics.add.existing(shelf2, false);
    shelf2.body.moves = false;
    shelf2.body.allowGravity = false;
    shelf2.body.allowDrag = false;
    shelf2.body.allowRotation = false;
    shelf2.body.pushable = false;
    shelf2.body.immovable = true;
    shelf2.body.setSize(128, 128, false);

    // shelf4
    const shelf4 = this.add.rectangle(104, 39, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf4.scaleX = 0.20810576870941247;
    shelf4.scaleY = 0.013841271557914914;
    this.physics.add.existing(shelf4, false);
    shelf4.body.moves = false;
    shelf4.body.allowGravity = false;
    shelf4.body.allowDrag = false;
    shelf4.body.allowRotation = false;
    shelf4.body.pushable = false;
    shelf4.body.immovable = true;
    shelf4.body.setSize(128, 128, false);

    // shelf3
    const shelf3 = this.add.rectangle(101, 26, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf3.scaleX = 0.2500096479077242;
    shelf3.scaleY = 0.010974028293181833;
    this.physics.add.existing(shelf3, false);
    shelf3.body.moves = false;
    shelf3.body.allowGravity = false;
    shelf3.body.allowDrag = false;
    shelf3.body.allowRotation = false;
    shelf3.body.pushable = false;
    shelf3.body.immovable = true;
    shelf3.body.setSize(128, 128, false);

    // shelf5
    const shelf5 = this.add.rectangle(122, 33, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf5.scaleX = 0.2475966925535486;
    shelf5.scaleY = 0.014673561803109674;
    this.physics.add.existing(shelf5, false);
    shelf5.body.moves = false;
    shelf5.body.allowGravity = false;
    shelf5.body.allowDrag = false;
    shelf5.body.allowRotation = false;
    shelf5.body.pushable = false;
    shelf5.body.immovable = true;
    shelf5.body.setSize(128, 128, false);

    // endTable
    const endTable = this.add.rectangle(82, 66, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    endTable.scaleX = 0.2508937824159418;
    endTable.scaleY = 0.026473900248207928;
    this.physics.add.existing(endTable, false);
    endTable.body.moves = false;
    endTable.body.allowGravity = false;
    endTable.body.allowDrag = false;
    endTable.body.allowRotation = false;
    endTable.body.pushable = false;
    endTable.body.immovable = true;
    endTable.body.setSize(128, 128, false);

    // couchTop
    const couchTop = this.add.rectangle(130, 53, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    couchTop.scaleX = 0.4151705436687662;
    couchTop.scaleY = 0.02737810757995794;
    this.physics.add.existing(couchTop, false);
    couchTop.body.moves = false;
    couchTop.body.allowGravity = false;
    couchTop.body.allowDrag = false;
    couchTop.body.allowRotation = false;
    couchTop.body.pushable = false;
    couchTop.body.immovable = true;
    couchTop.body.setSize(128, 128, false);

    // couchSeat
    const couchSeat = this.add.rectangle(129, 69, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    couchSeat.scaleX = 0.44656098782266507;
    couchSeat.scaleY = 0.02331888568057807;
    this.physics.add.existing(couchSeat, false);
    couchSeat.body.moves = false;
    couchSeat.body.allowGravity = false;
    couchSeat.body.allowDrag = false;
    couchSeat.body.allowRotation = false;
    couchSeat.body.pushable = false;
    couchSeat.body.immovable = true;
    couchSeat.body.setSize(128, 128, false);

    // couchArmrest
    const couchArmrest = this.add.rectangle(97, 64, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    couchArmrest.scaleX = 0.1545207605176045;
    couchArmrest.scaleY = 0.016687910054798808;
    this.physics.add.existing(couchArmrest, false);
    couchArmrest.body.moves = false;
    couchArmrest.body.allowGravity = false;
    couchArmrest.body.allowDrag = false;
    couchArmrest.body.allowRotation = false;
    couchArmrest.body.pushable = false;
    couchArmrest.body.immovable = true;
    couchArmrest.body.setSize(128, 128, false);

    // couchArmrest_1
    const couchArmrest_1 = this.add.rectangle(163, 64, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    couchArmrest_1.scaleX = 0.12700532471448878;
    couchArmrest_1.scaleY = 0.012132382336998229;
    this.physics.add.existing(couchArmrest_1, false);
    couchArmrest_1.body.moves = false;
    couchArmrest_1.body.allowGravity = false;
    couchArmrest_1.body.allowDrag = false;
    couchArmrest_1.body.allowRotation = false;
    couchArmrest_1.body.pushable = false;
    couchArmrest_1.body.immovable = true;
    couchArmrest_1.body.setSize(128, 128, false);

    // shelf7
    const shelf7 = this.add.rectangle(201, 27, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf7.scaleX = 0.2500096479077242;
    shelf7.scaleY = 0.010974028293181833;
    this.physics.add.existing(shelf7, false);
    shelf7.body.moves = false;
    shelf7.body.allowGravity = false;
    shelf7.body.allowDrag = false;
    shelf7.body.allowRotation = false;
    shelf7.body.pushable = false;
    shelf7.body.immovable = true;
    shelf7.body.setSize(128, 128, false);

    // shelf8
    const shelf8 = this.add.rectangle(205, 41, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf8.scaleX = 0.17308080234810996;
    shelf8.scaleY = 0.015789977801745864;
    this.physics.add.existing(shelf8, false);
    shelf8.body.moves = false;
    shelf8.body.allowGravity = false;
    shelf8.body.allowDrag = false;
    shelf8.body.allowRotation = false;
    shelf8.body.pushable = false;
    shelf8.body.immovable = true;
    shelf8.body.setSize(128, 128, false);

    // shelf9
    const shelf9 = this.add.rectangle(222, 34, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf9.scaleX = 0.17125938070385924;
    shelf9.scaleY = 0.015110156673315774;
    this.physics.add.existing(shelf9, false);
    shelf9.body.moves = false;
    shelf9.body.allowGravity = false;
    shelf9.body.allowDrag = false;
    shelf9.body.allowRotation = false;
    shelf9.body.pushable = false;
    shelf9.body.immovable = true;
    shelf9.body.setSize(128, 128, false);

    // chairSeat_1
    const chairSeat_1 = this.add.rectangle(209, 72, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    chairSeat_1.scaleX = 0.22293377671404707;
    chairSeat_1.scaleY = 0.0247104767049283;
    this.physics.add.existing(chairSeat_1, false);
    chairSeat_1.body.moves = false;
    chairSeat_1.body.allowGravity = false;
    chairSeat_1.body.allowDrag = false;
    chairSeat_1.body.allowRotation = false;
    chairSeat_1.body.pushable = false;
    chairSeat_1.body.immovable = true;
    chairSeat_1.body.setSize(128, 128, false);

    // bookshelf1
    const bookshelf1 = this.add.rectangle(264, 5, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf1.scaleX = 0.31559330039357175;
    bookshelf1.scaleY = 0.014494846553710807;
    this.physics.add.existing(bookshelf1, false);
    bookshelf1.body.moves = false;
    bookshelf1.body.allowGravity = false;
    bookshelf1.body.allowDrag = false;
    bookshelf1.body.allowRotation = false;
    bookshelf1.body.pushable = false;
    bookshelf1.body.immovable = true;
    bookshelf1.body.setSize(128, 128, false);

    // bookshelf2
    const bookshelf2 = this.add.rectangle(264, 18, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf2.scaleX = 0.31559330039357175;
    bookshelf2.scaleY = 0.014494846553710807;
    this.physics.add.existing(bookshelf2, false);
    bookshelf2.body.moves = false;
    bookshelf2.body.allowGravity = false;
    bookshelf2.body.allowDrag = false;
    bookshelf2.body.allowRotation = false;
    bookshelf2.body.pushable = false;
    bookshelf2.body.immovable = true;
    bookshelf2.body.setSize(128, 128, false);

    // bookshelf3
    const bookshelf3 = this.add.rectangle(264, 31, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf3.scaleX = 0.31559330039357175;
    bookshelf3.scaleY = 0.014494846553710807;
    this.physics.add.existing(bookshelf3, false);
    bookshelf3.body.moves = false;
    bookshelf3.body.allowGravity = false;
    bookshelf3.body.allowDrag = false;
    bookshelf3.body.allowRotation = false;
    bookshelf3.body.pushable = false;
    bookshelf3.body.immovable = true;
    bookshelf3.body.setSize(128, 128, false);

    // bookshelf4
    const bookshelf4 = this.add.rectangle(264, 44, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf4.scaleX = 0.31559330039357175;
    bookshelf4.scaleY = 0.014494846553710807;
    this.physics.add.existing(bookshelf4, false);
    bookshelf4.body.moves = false;
    bookshelf4.body.allowGravity = false;
    bookshelf4.body.allowDrag = false;
    bookshelf4.body.allowRotation = false;
    bookshelf4.body.pushable = false;
    bookshelf4.body.immovable = true;
    bookshelf4.body.setSize(128, 128, false);

    // bookshelf5
    const bookshelf5 = this.add.rectangle(264, 56, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf5.scaleX = 0.31559330039357175;
    bookshelf5.scaleY = 0.014494846553710807;
    this.physics.add.existing(bookshelf5, false);
    bookshelf5.body.moves = false;
    bookshelf5.body.allowGravity = false;
    bookshelf5.body.allowDrag = false;
    bookshelf5.body.allowRotation = false;
    bookshelf5.body.pushable = false;
    bookshelf5.body.immovable = true;
    bookshelf5.body.setSize(128, 128, false);

    // doggy1
    const doggy1 = new Chihuahua(this, 101, 74);
    this.add.existing(doggy1);

    // livingroomTreat1
    const livingroomTreat1 = new treatMarker(this, 25, 42);
    this.add.existing(livingroomTreat1);

    // livingroomTreat2
    const livingroomTreat2 = new treatMarker(this, 101, 20);
    this.add.existing(livingroomTreat2);

    // livingroomTreat3
    const livingroomTreat3 = new treatMarker(this, 200, 20);
    this.add.existing(livingroomTreat3);

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

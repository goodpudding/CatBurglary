
// You can write more code here

/* START OF COMPILED CODE */

import Chihuahua from "./Chihuahua.js";
import treatMarker from "./treatMarker.js";
/* START-USER-IMPORTS */
import { SneakGame } from './SneakGame.js';
import { assignEditorNames } from '../game/sneak/editorObjects.js';
import { getRoomByKey } from '../game/sneak/roomConfig.js';
/* END-USER-IMPORTS */

export default class HallwayRoom extends Phaser.Scene {

  constructor() {
    super("HallwayRoom");

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

    // cat_chaser_hallway_1
    this.add.image(0, -6, "cat-chaser-hallway");

    // floor
    const floor = this.add.rectangle(-1, 38, 128, 128);
    floor.scaleX = 3.75;
    floor.scaleY = 0.1875;

    // player
    const player = this.physics.add.sprite(-168, 16, "orange-cat-sitting-sheet", 0);
    player.body.setOffset(1, 4);
    player.body.setCircle(8);
    player.play("orange-idle");

    // granny
    const granny = this.physics.add.sprite(-175, 4, "Granny_Walking-Sheet", 0);
    granny.scaleX = 1.5;
    granny.scaleY = 1.5;
    granny.body.setOffset(5, 0);
    granny.body.setSize(11, 28, false);
    granny.play("newgrannywalk");

    // exit
    const exit = this.add.rectangle(165, -14, 128, 128);
    exit.scaleX = 0.171875;
    exit.scaleY = 0.9375;

    // shelf1
    const shelf1 = this.add.rectangle(-140, -26, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf1.scaleX = 0.32096482355587536;
    shelf1.scaleY = 0.01498286062396614;
    this.physics.add.existing(shelf1, false);
    shelf1.body.moves = false;
    shelf1.body.allowGravity = false;
    shelf1.body.allowDrag = false;
    shelf1.body.allowRotation = false;
    shelf1.body.pushable = false;
    shelf1.body.immovable = true;
    shelf1.body.setSize(128, 128, false);

    // shelf2 
    const shelf2_ = this.add.rectangle(-133, -44, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    shelf2_.scaleX = 0.33414262237663944;
    shelf2_.scaleY = 0.016268592549986378;
    this.physics.add.existing(shelf2_, false);
    shelf2_.body.moves = false;
    shelf2_.body.allowGravity = false;
    shelf2_.body.allowDrag = false;
    shelf2_.body.allowRotation = false;
    shelf2_.body.pushable = false;
    shelf2_.body.immovable = true;
    shelf2_.body.setSize(128, 128, false);

    // bookshelf1
    const bookshelf1 = this.add.rectangle(137, 0, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf1.scaleX = 0.32096482355587536;
    bookshelf1.scaleY = 0.01498286062396614;
    this.physics.add.existing(bookshelf1, false);
    bookshelf1.body.moves = false;
    bookshelf1.body.allowGravity = false;
    bookshelf1.body.allowDrag = false;
    bookshelf1.body.allowRotation = false;
    bookshelf1.body.pushable = false;
    bookshelf1.body.immovable = true;
    bookshelf1.body.setSize(128, 128, false);

    // bookshelf2
    const bookshelf2 = this.add.rectangle(137, -10, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf2.scaleX = 0.32096482355587536;
    bookshelf2.scaleY = 0.01498286062396614;
    this.physics.add.existing(bookshelf2, false);
    bookshelf2.body.moves = false;
    bookshelf2.body.allowGravity = false;
    bookshelf2.body.allowDrag = false;
    bookshelf2.body.allowRotation = false;
    bookshelf2.body.pushable = false;
    bookshelf2.body.immovable = true;
    bookshelf2.body.setSize(128, 128, false);

    // bookshelf3
    const bookshelf3 = this.add.rectangle(138, -23, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf3.scaleX = 0.32096482355587536;
    bookshelf3.scaleY = 0.01498286062396614;
    this.physics.add.existing(bookshelf3, false);
    bookshelf3.body.moves = false;
    bookshelf3.body.allowGravity = false;
    bookshelf3.body.allowDrag = false;
    bookshelf3.body.allowRotation = false;
    bookshelf3.body.pushable = false;
    bookshelf3.body.immovable = true;
    bookshelf3.body.setSize(128, 128, false);

    // bookshelf4
    const bookshelf4 = this.add.rectangle(138, -37, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf4.scaleX = 0.32096482355587536;
    bookshelf4.scaleY = 0.01498286062396614;
    this.physics.add.existing(bookshelf4, false);
    bookshelf4.body.moves = false;
    bookshelf4.body.allowGravity = false;
    bookshelf4.body.allowDrag = false;
    bookshelf4.body.allowRotation = false;
    bookshelf4.body.pushable = false;
    bookshelf4.body.immovable = true;
    bookshelf4.body.setSize(128, 128, false);

    // bookshelf5
    const bookshelf5 = this.add.rectangle(137, -49, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bookshelf5.scaleX = 0.32096482355587536;
    bookshelf5.scaleY = 0.01498286062396614;
    this.physics.add.existing(bookshelf5, false);
    bookshelf5.body.moves = false;
    bookshelf5.body.allowGravity = false;
    bookshelf5.body.allowDrag = false;
    bookshelf5.body.allowRotation = false;
    bookshelf5.body.pushable = false;
    bookshelf5.body.immovable = true;
    bookshelf5.body.setSize(128, 128, false);

    // endtable2
    const endtable2 = this.add.rectangle(37, 10, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    endtable2.scaleX = 0.21446269142314373;
    endtable2.scaleY = 0.012757428438920929;
    this.physics.add.existing(endtable2, false);
    endtable2.body.moves = false;
    endtable2.body.allowGravity = false;
    endtable2.body.allowDrag = false;
    endtable2.body.allowRotation = false;
    endtable2.body.pushable = false;
    endtable2.body.immovable = true;
    endtable2.body.setSize(128, 128, false);

    // endtable1
    const endtable1 = this.add.rectangle(-135, 11, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    endtable1.scaleX = 0.2130196492108523;
    endtable1.scaleY = 0.01353090973788237;
    this.physics.add.existing(endtable1, false);
    endtable1.body.moves = false;
    endtable1.body.allowGravity = false;
    endtable1.body.allowDrag = false;
    endtable1.body.allowRotation = false;
    endtable1.body.pushable = false;
    endtable1.body.immovable = true;
    endtable1.body.setSize(128, 128, false);

    // table
    const table = this.add.rectangle(-25, 17, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    table.scaleX = 0.3946839920514225;
    table.scaleY = 0.023019618727775987;
    this.physics.add.existing(table, false);
    table.body.moves = false;
    table.body.allowGravity = false;
    table.body.allowDrag = false;
    table.body.allowRotation = false;
    table.body.pushable = false;
    table.body.immovable = true;
    table.body.setSize(128, 128, false);

    // clock
    const clock = this.add.rectangle(-93, -35, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    clock.scaleX = 0.14247334156438987;
    clock.scaleY = 0.0236101804284672;
    this.physics.add.existing(clock, false);
    clock.body.moves = false;
    clock.body.allowGravity = false;
    clock.body.allowDrag = false;
    clock.body.allowRotation = false;
    clock.body.pushable = false;
    clock.body.immovable = true;
    clock.body.setSize(128, 128, false);

    // doggy2
    const doggy2 = new Chihuahua(this, 19, 15);
    this.add.existing(doggy2);

    // bigpicture
    const bigpicture = this.add.rectangle(-5, -17, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    bigpicture.scaleX = 0.44795100558186285;
    bigpicture.scaleY = 0.027724313492087635;
    this.physics.add.existing(bigpicture, false);
    bigpicture.body.moves = false;
    bigpicture.body.allowGravity = false;
    bigpicture.body.allowDrag = false;
    bigpicture.body.allowRotation = false;
    bigpicture.body.pushable = false;
    bigpicture.body.immovable = true;
    bigpicture.body.setSize(128, 128, false);

    // picture1
    const picture1 = this.add.rectangle(-67, -43, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    picture1.scaleX = 0.1926050298894074;
    picture1.scaleY = 0.026467832540131533;
    this.physics.add.existing(picture1, false);
    picture1.body.moves = false;
    picture1.body.allowGravity = false;
    picture1.body.allowDrag = false;
    picture1.body.allowRotation = false;
    picture1.body.pushable = false;
    picture1.body.immovable = true;
    picture1.body.setSize(128, 128, false);

    // picture2
    const picture2 = this.add.rectangle(66, -48, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    picture2.scaleX = 0.1926050298894074;
    picture2.scaleY = 0.026467832540131533;
    this.physics.add.existing(picture2, false);
    picture2.body.moves = false;
    picture2.body.allowGravity = false;
    picture2.body.allowDrag = false;
    picture2.body.allowRotation = false;
    picture2.body.pushable = false;
    picture2.body.immovable = true;
    picture2.body.setSize(128, 128, false);

    // picture3
    const picture3 = this.add.rectangle(102, -32, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    picture3.scaleX = 0.1926050298894074;
    picture3.scaleY = 0.026467832540131533;
    this.physics.add.existing(picture3, false);
    picture3.body.moves = false;
    picture3.body.allowGravity = false;
    picture3.body.allowDrag = false;
    picture3.body.allowRotation = false;
    picture3.body.pushable = false;
    picture3.body.immovable = true;
    picture3.body.setSize(128, 128, false);

    // picture
    const picture = this.add.rectangle(71, -11, 128, 128) as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    picture.scaleX = 0.15768350227973998;
    picture.scaleY = 0.024002294029821174;
    this.physics.add.existing(picture, false);
    picture.body.moves = false;
    picture.body.allowGravity = false;
    picture.body.allowDrag = false;
    picture.body.allowRotation = false;
    picture.body.pushable = false;
    picture.body.immovable = true;
    picture.body.setSize(128, 128, false);

    // treatMarker1
    const treatMarker1 = new treatMarker(this, -135, 4);
    this.add.existing(treatMarker1);

    // treatMarker2
    const treatMarker2 = new treatMarker(this, -126, -32);
    this.add.existing(treatMarker2);

    // treatMarker3
    const treatMarker3 = new treatMarker(this, -8, -22);
    this.add.existing(treatMarker3);

    // treatMarker4
    const treatMarker4 = new treatMarker(this, 62, 20);
    this.add.existing(treatMarker4);

    this.events.emit("scene-awake");
  }

  /* START-USER-CODE */

  create() {
    this.editorCreate();
    assignEditorNames(this);
    new SneakGame(this, getRoomByKey('HallwayRoom')).start();
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */


// You can write more code here

/* START OF COMPILED CODE */

import CatVisual from "./CatVisual.js";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Player extends Phaser.GameObjects.Container {

  constructor(scene: Phaser.Scene, x?: number, y?: number) {
    super(scene, x ?? 0, y ?? 0);

    // cat_orange
    const cat_orange = scene.add.container(0, 0);
    this.add(cat_orange);

    // orange_cat
    const orange_cat = new CatVisual(scene, 0, 0, "orange-cat-sitting-sheet", 0);
    cat_orange.add(orange_cat);

    // orange_bow
    const orange_bow = scene.add.image(-1, 2, "outfit-bow");
    orange_bow.scaleX = 0.6643498989536183;
    orange_bow.scaleY = 0.5267272438895287;
    cat_orange.add(orange_bow);

    // orange_glasses
    const orange_glasses = scene.add.image(-2, -3, "outfit-glasses");
    orange_glasses.scaleX = 0.4095898087034895;
    orange_glasses.scaleY = 0.5689405558737793;
    cat_orange.add(orange_glasses);

    // orange_mustache
    const orange_mustache = scene.add.image(-1.6, 0, "outfit-mustache");
    orange_mustache.scaleX = 0.3799025279030767;
    orange_mustache.scaleY = 0.47788207129734755;
    cat_orange.add(orange_mustache);

    // orange_top_hat
    const orange_top_hat = scene.add.image(-1.6, -9, "outfit-top-hat");
    orange_top_hat.scaleX = 0.8835616985829016;
    orange_top_hat.scaleY = 0.9109621278531284;
    cat_orange.add(orange_top_hat);

    // cat_gray
    const cat_gray = scene.add.container(44, 0);
    this.add(cat_gray);

    // gray_cat
    const gray_cat = new CatVisual(scene, 0, 0, "gray-cat-sitting", 0);
    cat_gray.add(gray_cat);

    // gray_bow
    const gray_bow = scene.add.image(-1, 2, "outfit-bow");
    gray_bow.scaleX = 0.6643498989536183;
    gray_bow.scaleY = 0.5267272438895287;
    cat_gray.add(gray_bow);

    // gray_glasses
    const gray_glasses = scene.add.image(-2, -3, "outfit-glasses");
    gray_glasses.scaleX = 0.4095898087034895;
    gray_glasses.scaleY = 0.5689405558737793;
    cat_gray.add(gray_glasses);

    // gray_mustache
    const gray_mustache = scene.add.image(-1.6, 0, "outfit-mustache");
    gray_mustache.scaleX = 0.3799025279030767;
    gray_mustache.scaleY = 0.47788207129734755;
    cat_gray.add(gray_mustache);

    // gray_top_hat
    const gray_top_hat = scene.add.image(-1.6, -9, "outfit-top-hat");
    gray_top_hat.scaleX = 0.8835616985829016;
    gray_top_hat.scaleY = 0.9109621278531284;
    cat_gray.add(gray_top_hat);

    // cat_black
    const cat_black = scene.add.container(88, 0);
    this.add(cat_black);

    // black_cat
    const black_cat = new CatVisual(scene, 0, 0, "black-cat-sitting-w-13-h-17", 0);
    cat_black.add(black_cat);

    // black_bow
    const black_bow = scene.add.image(-2.5, 2, "outfit-bow");
    black_bow.scaleX = 0.6643498989536183;
    black_bow.scaleY = 0.5267272438895287;
    cat_black.add(black_bow);

    // black_glasses
    const black_glasses = scene.add.image(-2.5, -3, "outfit-glasses");
    black_glasses.scaleX = 0.4095898087034895;
    black_glasses.scaleY = 0.5689405558737793;
    cat_black.add(black_glasses);

    // black_mustache
    const black_mustache = scene.add.image(-2.5, 0, "outfit-mustache");
    black_mustache.scaleX = 0.3799025279030767;
    black_mustache.scaleY = 0.47788207129734755;
    cat_black.add(black_mustache);

    // black_top_hat
    const black_top_hat = scene.add.image(-2, -9, "outfit-top-hat");
    black_top_hat.scaleX = 0.8835616985829016;
    black_top_hat.scaleY = 0.9109621278531284;
    cat_black.add(black_top_hat);

    // cat_chonky
    const cat_chonky = scene.add.container(132, 0);
    this.add(cat_chonky);

    // chonky_cat
    const chonky_cat = new CatVisual(scene, 0, 0, "chonky-calico-cat-sitting-17x17", 0);
    cat_chonky.add(chonky_cat);

    // chonky_bow
    const chonky_bow = scene.add.image(-4, 2, "outfit-bow");
    chonky_bow.scaleX = 0.6643498989536183;
    chonky_bow.scaleY = 0.5267272438895287;
    cat_chonky.add(chonky_bow);

    // chonky_glasses
    const chonky_glasses = scene.add.image(-4, -3, "outfit-glasses");
    chonky_glasses.scaleX = 0.4095898087034895;
    chonky_glasses.scaleY = 0.5689405558737793;
    cat_chonky.add(chonky_glasses);

    // chonky_mustache
    const chonky_mustache = scene.add.image(-4, 0, "outfit-mustache");
    chonky_mustache.scaleX = 0.3799025279030767;
    chonky_mustache.scaleY = 0.47788207129734755;
    cat_chonky.add(chonky_mustache);

    // chonky_top_hat
    const chonky_top_hat = scene.add.image(-4, -10, "outfit-top-hat");
    chonky_top_hat.scaleX = 0.8835616985829016;
    chonky_top_hat.scaleY = 0.9109621278531284;
    cat_chonky.add(chonky_top_hat);

    // cat_marshmellow
    const cat_marshmellow = scene.add.container(176, 0);
    this.add(cat_marshmellow);

    // marshmellow_cat
    const marshmellow_cat = new CatVisual(scene, 0, 0, "marshmello-sitting2", 0);
    cat_marshmellow.add(marshmellow_cat);

    // marshmellow_bow
    const marshmellow_bow = scene.add.image(-3, 2, "outfit-bow");
    marshmellow_bow.scaleX = 0.6643498989536183;
    marshmellow_bow.scaleY = 0.5267272438895287;
    cat_marshmellow.add(marshmellow_bow);

    // marshmellow_glasses
    const marshmellow_glasses = scene.add.image(-3, -3, "outfit-glasses");
    marshmellow_glasses.scaleX = 0.4095898087034895;
    marshmellow_glasses.scaleY = 0.5689405558737793;
    cat_marshmellow.add(marshmellow_glasses);

    // marshmellow_mustache
    const marshmellow_mustache = scene.add.image(-3, 0, "outfit-mustache");
    marshmellow_mustache.scaleX = 0.3799025279030767;
    marshmellow_mustache.scaleY = 0.47788207129734755;
    cat_marshmellow.add(marshmellow_mustache);

    // marshmellow_top_hat
    const marshmellow_top_hat = scene.add.image(-3, -10, "outfit-top-hat");
    marshmellow_top_hat.scaleX = 0.8835616985829016;
    marshmellow_top_hat.scaleY = 0.9109621278531284;
    cat_marshmellow.add(marshmellow_top_hat);

    // gray_cat (prefab fields)
    gray_cat.idleAnim = "gray-idle";
    gray_cat.walkAnim = "gray-walk";

    // black_cat (prefab fields)
    black_cat.idleAnim = "black-idle";
    black_cat.walkAnim = "black-walk";

    // chonky_cat (prefab fields)
    chonky_cat.idleAnim = "chonky-idle";
    chonky_cat.walkAnim = "chonky-walk";

    // marshmellow_cat (prefab fields)
    marshmellow_cat.idleAnim = "marshmellow-idle";
    marshmellow_cat.walkAnim = "marshmellow-walk";
    marshmellow_cat.jumpAnim = "orange-jump";

    /* START-USER-CTR-CODE */
    this.setName('player');
    /* END-USER-CTR-CODE */
  }

  public hitSounds: string[] = ["cat-meow-1", "cat-meow-2", "cat-meow-3"];
  public hitSoundVolume: number = 0.4;

  /* START-USER-CODE */

  // Write your code here.

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

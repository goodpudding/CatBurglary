import Phaser from 'phaser';
import { applyOrangeCatTextureFilters, OrangeCatAnimator } from '../game/catAnimator.js';
import { applyGrannyTextureFilters, isGrannyTextureKey, playGrannyWalk } from '../game/grannyAnimator.js';

/**
 * SneakGame — push-your-luck loop driven by a Phaser Editor scene.
 *
 * Editor object labels (set in Outline / Inspector):
 *   floor   — Rectangle with Arcade static body (walkable ground)
 *   window  — Rectangle without physics (escape zone art)
 *   player  — ArcadeSprite (the cat)
 *   granny  — Image or ArcadeSprite (granny walk sheets or legacy wizard)
 *   treat_* — optional treat markers, e.g. treat_15 for 15 points (see treatMarker prefab)
 *
 * Furniture images (furniture-*) get one-way collision: walk underneath, jump up through,
 * land on the editor-placed surface hitbox.
 */

const MOVE_SPEED = 240;
const JUMP_VELOCITY = -680;
const MAX_LIVES = 3;
const INVULN_MS = 1200;
const GRANNY_SPEED = 90;
const TARGET_GROUND_Y = 470;
const FALLBACK_HEIGHT = 540;
/** How far below a furniture surface the cat feet can be and still register a landing. */
const FURNITURE_LAND_TOLERANCE = 14;

type Bodied = Phaser.GameObjects.GameObject & {
  body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null;
};

type TreatTarget = Phaser.GameObjects.GameObject & {
  getData(key: string): unknown;
  setData(key: string, value: unknown): void;
  destroy(): void;
};

type GrannyObject = Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image;

export class SneakGame {
  private scene: Phaser.Scene;
  private cat!: Phaser.Physics.Arcade.Sprite;
  private granny!: GrannyObject;
  private catAnimator!: OrangeCatAnimator;
  private windowRect!: Phaser.GameObjects.Rectangle;
  private windowZone!: Phaser.GameObjects.Zone;
  private floorPlatforms: Phaser.GameObjects.GameObject[] = [];
  private furniturePlatforms: Phaser.GameObjects.GameObject[] = [];
  private treats: TreatTarget[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private bankKey!: Phaser.Input.Keyboard.Key;
  private touchLeft = false;
  private touchRight = false;
  private touchJump = false;

  private carried = 0;
  private banked = 0;
  private lives = MAX_LIVES;
  private invulnUntil = 0;
  private grannyDir = 1;
  private runOver = false;
  private started = false;

  private roomLeft = -400;
  private roomRight = 960;
  private roomHeight = FALLBACK_HEIGHT;
  private groundTop = 433;
  private grannyMinX = 120;
  private grannyMaxX = 840;

  private hudText!: Phaser.GameObjects.Text;
  private bankFlash!: Phaser.GameObjects.Text;
  private windowHint!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    const collected = this.collectObjects();
    if (!collected.player) {
      console.warn('SneakGame: add an ArcadeSprite labeled "player" in Phaser Editor.');
      return;
    }
    this.cat = collected.player;

    this.setupPlatforms(collected.furniture, collected.floors);
    this.alignWorldVertically();
    this.computeWorldBounds(collected.furniture, collected.floors, collected.window, collected.granny);
    this.setGrannyPatrolFromFloor(collected.floors);
    this.setupCat();
    this.placeTreats(collected.furniture, collected.treatMarkers);
    this.setupWindow(collected.window);
    this.setupGranny(collected.granny);
    this.createHud();
    this.createInput();

    this.scene.physics.add.collider(this.cat, this.floorPlatforms);
    this.scene.physics.add.collider(
      this.cat,
      this.furniturePlatforms,
      undefined,
      this.canLandOnFurniture,
      this,
    );
    this.scene.physics.add.overlap(this.cat, this.treats, this.onCollectTreat, undefined, this);
    this.scene.physics.add.overlap(this.cat, this.granny, this.onHitByGranny, undefined, this);

    const w = this.roomRight - this.roomLeft;
    this.scene.physics.world.setBounds(this.roomLeft, 0, w, this.roomHeight);
    this.scene.cameras.main.setBounds(this.roomLeft, 0, w, this.roomHeight);
    this.scene.cameras.main.setBackgroundColor('#241c2b');
    // Offset keeps the action in the lower part of the viewport (not shoved to the top).
    this.scene.cameras.main.startFollow(this.cat, true, 0.08, 0.08, 0, 120);

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this);
  }

  // --- Read editor objects ---------------------------------------------

  private isFloorRect(rect: Phaser.GameObjects.Rectangle): boolean {
    const name = rect.name.toLowerCase();
    if (name === 'window') return false;
    if (name === 'floor') return true;
    return rect.displayWidth > 800;
  }

  private isWindowRect(rect: Phaser.GameObjects.Rectangle): boolean {
    const name = rect.name.toLowerCase();
    return name === 'window' || name.includes('window');
  }

  private isGrannyObject(obj: Phaser.GameObjects.GameObject): boolean {
    const name = obj.name.toLowerCase();
    const key =
      (obj as Phaser.GameObjects.Image).texture?.key?.toLowerCase() ??
      (obj as Phaser.Physics.Arcade.Sprite).texture?.key?.toLowerCase() ??
      '';
    return name === 'granny' || isGrannyTextureKey(key);
  }

  private isTreatMarker(obj: Phaser.GameObjects.GameObject): boolean {
    return obj.name.toLowerCase().startsWith('treat');
  }

  private parseTreatPoints(name: string): number {
    const match = name.match(/treat[_-]?(\d+)/i);
    if (match) return Number.parseInt(match[1]!, 10);
    return 10;
  }

  private collectObjects(): {
    player: Phaser.Physics.Arcade.Sprite | undefined;
    furniture: Phaser.GameObjects.Image[];
    floors: Phaser.GameObjects.Rectangle[];
    window: Phaser.GameObjects.Rectangle | undefined;
    granny: GrannyObject | undefined;
    treatMarkers: Phaser.GameObjects.GameObject[];
  } {
    let player: Phaser.Physics.Arcade.Sprite | undefined;
    const furniture: Phaser.GameObjects.Image[] = [];
    const floors: Phaser.GameObjects.Rectangle[] = [];
    const treatMarkers: Phaser.GameObjects.GameObject[] = [];
    let window: Phaser.GameObjects.Rectangle | undefined;
    let granny: GrannyObject | undefined;

    const visit = (obj: Phaser.GameObjects.GameObject): void => {
      const bodied = obj as Bodied;
      if (obj instanceof Phaser.GameObjects.Sprite && bodied.body) {
        const sprite = obj as Phaser.Physics.Arcade.Sprite;
        if (this.isGrannyObject(sprite)) granny = sprite;
        else if (sprite.name === 'player' || sprite.texture?.key?.includes('orange-cat')) player = sprite;
        else if (!player) player = sprite;
      } else if (obj instanceof Phaser.GameObjects.Rectangle) {
        const rect = obj;
        if (this.isWindowRect(rect)) window = rect;
        else if (this.isFloorRect(rect)) floors.push(rect);
        else if (!window && !rect.body) window = rect;
        else if (rect.body && rect.displayWidth > 800) floors.push(rect);
      } else if (obj instanceof Phaser.GameObjects.Image) {
        if (this.isGrannyObject(obj)) granny = obj as Phaser.Physics.Arcade.Image;
        else if (this.isTreatMarker(obj)) treatMarkers.push(obj);
        else if (obj.texture?.key?.indexOf('furniture') === 0) furniture.push(obj);
      } else if (obj instanceof Phaser.GameObjects.Arc && this.isTreatMarker(obj)) {
        treatMarkers.push(obj);
      } else if (obj instanceof Phaser.GameObjects.Ellipse && this.isTreatMarker(obj)) {
        treatMarkers.push(obj);
      } else if (obj instanceof Phaser.GameObjects.Container) {
        for (const nested of obj.list) visit(nested as Phaser.GameObjects.GameObject);
      }
    };

    for (const child of this.scene.children.list) visit(child);

    if (!granny) {
      const found = this.scene.children.list.find(
        (child) => this.isGrannyObject(child) && Boolean((child as Bodied).body),
      );
      if (found) granny = found as GrannyObject;
    }

    return { player, furniture, floors, window, granny, treatMarkers };
  }

  /** Shift the whole level down so the floor sits near the bottom of the 960×540 game. */
  private alignWorldVertically(): void {
    const deltaY = TARGET_GROUND_Y - this.groundTop;
    if (Math.abs(deltaY) < 8) return;

    for (const child of [...this.scene.children.list]) {
      (child as Phaser.GameObjects.GameObject & { y: number }).y += deltaY;
    }
    this.groundTop += deltaY;

    for (const platform of [...this.floorPlatforms, ...this.furniturePlatforms]) {
      const body = (platform as Bodied).body;
      if (body && 'updateFromGameObject' in body) body.updateFromGameObject();
    }
  }

  private computeWorldBounds(
    furniture: Phaser.GameObjects.Image[],
    floors: Phaser.GameObjects.Rectangle[],
    window: Phaser.GameObjects.Rectangle | undefined,
    granny: GrannyObject | undefined,
  ): void {
    let minX = this.cat.x;
    let maxX = this.cat.x;

    const scan = (obj: Phaser.GameObjects.GameObject): void => {
      const go = obj as Phaser.GameObjects.GameObject & { getBounds?: () => Phaser.Geom.Rectangle };
      const b = go.getBounds?.();
      if (!b) return;
      minX = Math.min(minX, b.left);
      maxX = Math.max(maxX, b.right);
    };

    for (const obj of [...furniture, ...floors, ...(window ? [window] : []), ...(granny ? [granny] : [])]) {
      scan(obj);
    }
    scan(this.cat);

    this.roomLeft = minX - 160;
    this.roomRight = maxX + 160;
    this.roomHeight = Math.max(FALLBACK_HEIGHT, this.scene.scale.height);
  }

  /** Granny patrols the full floor strip and turns around before the edges. */
  private setGrannyPatrolFromFloor(floors: Phaser.GameObjects.Rectangle[]): void {
    if (floors.length > 0) {
      let left = Infinity;
      let right = -Infinity;
      for (const floor of floors) {
        const b = floor.getBounds();
        left = Math.min(left, b.left);
        right = Math.max(right, b.right);
      }

      const pad = Math.max(60, (right - left) * 0.04);
      this.grannyMinX = left + pad;
      this.grannyMaxX = right - pad;
      return;
    }

    const pad = 80;
    this.grannyMinX = this.roomLeft + pad;
    this.grannyMaxX = this.roomRight - pad;
  }

  private initGrannyPatrolDirection(): void {
    if (this.granny.x > this.grannyMaxX) {
      this.granny.x = this.grannyMaxX;
      this.grannyDir = -1;
    } else if (this.granny.x < this.grannyMinX) {
      this.granny.x = this.grannyMinX;
      this.grannyDir = 1;
    } else {
      const mid = (this.grannyMinX + this.grannyMaxX) / 2;
      this.grannyDir = this.granny.x <= mid ? 1 : -1;
    }
  }

  private updateGrannyPatrol(delta: number): void {
    if (!this.granny?.body) return;

    const dt = delta / 1000;
    let nextX = this.granny.x + this.grannyDir * GRANNY_SPEED * dt;

    if (nextX >= this.grannyMaxX) {
      nextX = this.grannyMaxX;
      this.grannyDir = -1;
    } else if (nextX <= this.grannyMinX) {
      nextX = this.grannyMinX;
      this.grannyDir = 1;
    }

    this.granny.x = nextX;
    this.pinGrannyToFloor();

    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.updateFromGameObject();
    this.granny.setFlipX(this.grannyDir < 0);
  }

  private makeStatic(obj: Phaser.GameObjects.GameObject, list: Phaser.GameObjects.GameObject[]): void {
    const bodied = obj as Bodied;
    if (!bodied.body) {
      this.scene.physics.add.existing(obj, true);
    } else {
      const body = bodied.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setAllowGravity(false);
    }
    const body = (obj as Bodied).body;
    if (body && 'updateFromGameObject' in body) body.updateFromGameObject();
    list.push(obj);
  }

  private canLandOnFurniture: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    cat,
    furniture,
  ): boolean => {
    const catSprite = cat as Phaser.Physics.Arcade.Sprite;
    const catBody = catSprite.body as Phaser.Physics.Arcade.Body;
    const platBody = (furniture as Bodied).body as Phaser.Physics.Arcade.StaticBody;
    if (!catBody || !platBody) return false;

    if (catBody.velocity.y < 0) return false;

    const platTop = platBody.top;
    const platBottom = platBody.bottom;

    if (catBody.velocity.y > 0) {
      return catBody.bottom <= platTop + FURNITURE_LAND_TOLERANCE;
    }

    const feetOnSurface =
      catBody.bottom >= platTop && catBody.bottom <= platBottom + FURNITURE_LAND_TOLERANCE;
    const overlapsFromAbove = catBody.top < platBottom && catBody.bottom > platTop;

    return feetOnSurface && overlapsFromAbove;
  };

  private setupPlatforms(
    furniture: Phaser.GameObjects.Image[],
    floors: Phaser.GameObjects.Rectangle[],
  ): void {
    if (floors.length > 0) {
      let top = this.roomHeight - 60;
      for (const floor of floors) {
        this.makeStatic(floor, this.floorPlatforms);
        top = Math.min(top, floor.getBounds().top);
      }
      this.groundTop = top;
    } else {
      this.groundTop = this.roomHeight - 60;
      const ground = this.scene.add.rectangle(
        (this.roomLeft + this.roomRight) / 2,
        this.groundTop + 30,
        this.roomRight - this.roomLeft,
        60,
        0x6e4a2a,
      );
      this.makeStatic(ground, this.floorPlatforms);
    }

    for (const img of furniture) {
      img.texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.makeStatic(img, this.furniturePlatforms);
    }
  }

  private setupCat(): void {
    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    // Respect editor-tuned hitboxes when the cat is scaled up in Phaser Editor.
    if (this.cat.scaleX < 2) {
      body.setSize(13, 16);
      body.setOffset(3, 4);
    }
    this.cat.setCollideWorldBounds(true);
    this.cat.setDepth(10);
    applyOrangeCatTextureFilters(this.scene);
    this.catAnimator = new OrangeCatAnimator(this.scene, this.cat);
  }

  private placeTreats(furniture: Phaser.GameObjects.Image[], markers: Phaser.GameObjects.GameObject[]): void {
    if (markers.length > 0) {
      for (const marker of markers) {
        const points = this.parseTreatPoints(marker.name);
        const go = marker as Phaser.GameObjects.GameObject & { getBounds?: () => Phaser.Geom.Rectangle };
        const b = go.getBounds?.();
        if (!b) continue;

        const color = points >= 20 ? 0xff7043 : 0xffd54a;
        const treat = this.scene.add.circle(b.centerX, b.centerY, 11, color).setStrokeStyle(2, 0x7a5200).setDepth(5);
        this.scene.physics.add.existing(treat, true);
        treat.setData('points', points);
        this.treats.push(treat);
        marker.destroy();
      }
      return;
    }

    for (const img of furniture) {
      const b = img.getBounds();
      const x = b.centerX;
      const y = b.top - 16;
      const points = Phaser.Math.Clamp(Math.round((this.groundTop - y) / 40) * 5 + 5, 5, 30);
      const color = points >= 20 ? 0xff7043 : 0xffd54a;
      const treat = this.scene.add.circle(x, y, 11, color).setStrokeStyle(2, 0x7a5200).setDepth(5);
      this.scene.physics.add.existing(treat, true);
      treat.setData('points', points);
      this.treats.push(treat);
    }
  }

  private setupWindow(editorWindow: Phaser.GameObjects.Rectangle | undefined): void {
    if (editorWindow) {
      this.windowRect = editorWindow;
      this.windowRect.setName('window');
      this.windowRect.setDepth(3);
      this.windowRect.setInteractive({ useHandCursor: true });
      this.windowRect.on('pointerdown', () => this.tryBank());
    } else {
      const x = this.cat.x;
      const y = this.cat.y - 30;
      this.windowRect = this.scene.add
        .rectangle(x, y, 90, 120, 0x9fd6ff, 0.22)
        .setStrokeStyle(3, 0x9fd6ff, 0.8)
        .setDepth(3);
      this.windowRect.setInteractive({ useHandCursor: true });
      this.windowRect.on('pointerdown', () => this.tryBank());
    }

    const b = this.windowRect.getBounds();
    this.windowZone = this.scene.add.zone(b.centerX, b.centerY, b.width + 20, b.height + 20);
    this.scene.physics.add.existing(this.windowZone, true);

    this.windowHint = this.scene.add
      .text(b.centerX, b.top - 6, 'Press E or tap window to escape & bank', {
        fontFamily: 'sans-serif',
        fontSize: '11px',
        color: '#cdeaff',
        align: 'center',
        backgroundColor: '#00000088',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(4)
      .setAlpha(0);
  }

  private setupGranny(editorGranny: GrannyObject | undefined): void {
    if (editorGranny) {
      this.granny = editorGranny;
      this.granny.setName('granny');
      this.granny.setDepth(12);
      applyGrannyTextureFilters(this.scene);

      if (!this.granny.body) this.scene.physics.add.existing(this.granny);
      const body = this.granny.body as Phaser.Physics.Arcade.Body;
      body.moves = true;
      body.setAllowGravity(false);
      body.setImmovable(true);
      // No collider with furniture — granny only overlaps the cat for slipper hits.

      this.pinGrannyToFloor();
      this.initGrannyPatrolDirection();
      return;
    }

    // Fallback placeholder if no editor granny placed yet.
    const x = (this.roomLeft + this.roomRight) / 2;
    const feetY = this.groundTop;
    const placeholder = this.scene.add
      .rectangle(x, feetY - 55, 56, 110, 0xc987b0)
      .setStrokeStyle(3, 0x7a3f63)
      .setDepth(9);
    this.scene.physics.add.existing(placeholder);
    this.granny = placeholder as unknown as Phaser.Physics.Arcade.Image;
    const phBody = this.granny.body as Phaser.Physics.Arcade.Body;
    phBody.moves = true;
    phBody.setAllowGravity(false);
    phBody.setImmovable(true);
    this.initGrannyPatrolDirection();
  }

  private animateGrannyWalk(_delta: number): void {
    playGrannyWalk(this.scene, this.granny);
  }

  private pinGrannyToFloor(): void {
    const b = this.granny.getBounds();
    this.granny.y += this.groundTop - b.bottom;
    const body = this.granny.body as Phaser.Physics.Arcade.Body;
    body.updateFromGameObject();
  }

  // --- HUD --------------------------------------------------------------

  private createHud(): void {
    this.hudText = this.scene.add
      .text(12, 12, '', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.scene.add
      .text(
        this.scene.scale.width / 2,
        14,
        'Grab treats → go deeper for more points → escape at the window (E / tap) to bank & leave.',
        {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#ffe9b0',
          backgroundColor: '#00000066',
          padding: { x: 8, y: 4 },
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    this.bankFlash = this.scene.add
      .text(this.scene.scale.width / 2, 80, '', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#9be29b',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.updateHud();
  }

  private updateHud(): void {
    const hearts = '♥'.repeat(this.lives) + '♡'.repeat(MAX_LIVES - this.lives);
    this.hudText.setText(`Banked: ${this.banked}\nCarrying: ${this.carried}\nLives: ${hearts}`);
  }

  // --- Input ------------------------------------------------------------

  private createInput(): void {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bankKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    if (!this.scene.sys.game.device.input.touch) return;

    this.scene.input.addPointer(2);
    const h = this.scene.scale.height;

    const jumpZone = this.scene.add
      .zone(this.scene.scale.width / 2, h / 2, this.scene.scale.width, h)
      .setScrollFactor(0)
      .setInteractive();
    jumpZone.on('pointerdown', () => { this.touchJump = true; });
    jumpZone.on('pointerup', () => { this.touchJump = false; });
    jumpZone.on('pointerupoutside', () => { this.touchJump = false; });

    const makeButton = (cx: number, label: string, onDown: () => void, onUp: () => void): void => {
      const pad = this.scene.add
        .rectangle(cx, h - 70, 104, 104, 0x000000, 0.32)
        .setScrollFactor(0)
        .setDepth(91)
        .setStrokeStyle(3, 0xffffff, 0.5)
        .setInteractive();
      this.scene.add
        .text(cx, h - 70, label, { fontFamily: 'sans-serif', fontSize: '46px', color: '#ffffff' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(92);
      const press = (): void => { pad.setFillStyle(0xffffff, 0.28); onDown(); };
      const release = (): void => { pad.setFillStyle(0x000000, 0.32); onUp(); };
      pad.on('pointerdown', press);
      pad.on('pointerup', release);
      pad.on('pointerout', release);
      pad.on('pointerupoutside', release);
    };

    makeButton(74, '◀', () => (this.touchLeft = true), () => (this.touchLeft = false));
    makeButton(196, '▶', () => (this.touchRight = true), () => (this.touchRight = false));
  }

  // --- Actions ----------------------------------------------------------

  private isCatInWindow(): boolean {
    return Phaser.Geom.Rectangle.Overlaps(this.windowZone.getBounds(), this.cat.getBounds());
  }

  private tryBank(): void {
    if (this.runOver || this.carried <= 0 || !this.isCatInWindow()) return;

    const earned = this.carried;
    this.banked += earned;
    this.carried = 0;
    this.updateHud();

    this.bankFlash.setText(`+${earned} banked — slipping out!`).setAlpha(1);
    this.scene.time.delayedCall(700, () => this.endRunEscaped(earned));
  }

  private onCollectTreat: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_cat, treatObj) => {
    const treat = treatObj as TreatTarget;
    const points = (treat.getData('points') as number) ?? 5;
    this.carried += points;
    treat.destroy();
    this.treats = this.treats.filter((t) => t !== treat);
    this.updateHud();
  };

  private onHitByGranny: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (this.runOver || this.scene.time.now < this.invulnUntil) return;
    this.lives -= 1;
    this.invulnUntil = this.scene.time.now + INVULN_MS;
    const knockDir = this.cat.x < this.granny.x ? -1 : 1;
    this.cat.setVelocity(knockDir * 280, -260);
    this.scene.cameras.main.shake(180, 0.01);
    this.updateHud();
    if (this.lives <= 0) this.endRunCaught();
  };

  // --- Run end ----------------------------------------------------------

  private endRunEscaped(lastBank: number): void {
    this.runOver = true;
    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;

    const w = this.scene.scale.width;
    const hh = this.scene.scale.height;

    this.scene.add.rectangle(w / 2, hh / 2, w, hh, 0x000000, 0.65).setScrollFactor(0).setDepth(200);
    this.scene.add
      .text(w / 2, hh / 2 - 70, 'Escaped through the window!', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#9be29b',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.scene.add
      .text(w / 2, hh / 2 - 20, `+${lastBank} banked · Total: ${this.banked}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.scene.add
      .text(w / 2, hh / 2 + 16, 'Play it safe, or sneak in again for more?', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#cccccc',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    this.addRetryButton(w / 2, hh / 2 + 64);
  }

  private endRunCaught(): void {
    this.runOver = true;
    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.enable = false;

    const lost = this.carried;
    const w = this.scene.scale.width;
    const hh = this.scene.scale.height;

    this.scene.add.rectangle(w / 2, hh / 2, w, hh, 0x000000, 0.6).setScrollFactor(0).setDepth(200);
    this.scene.add
      .text(w / 2, hh / 2 - 60, 'Caught by the old lady!', {
        fontFamily: 'sans-serif',
        fontSize: '30px',
        color: '#ff8a80',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.scene.add
      .text(w / 2, hh / 2 - 8, `Lost ${lost} carried · Banked: ${this.banked}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    this.addRetryButton(w / 2, hh / 2 + 60);
  }

  private addRetryButton(x: number, y: number): void {
    const retry = this.scene.add
      .rectangle(x, y, 220, 50, 0x42a5f5)
      .setScrollFactor(0)
      .setDepth(201)
      .setInteractive({ useHandCursor: true });
    this.scene.add
      .text(x, y, 'Sneak In Again', { fontFamily: 'sans-serif', fontSize: '20px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(202);
    retry.on('pointerdown', () => this.scene.scene.restart());
  }

  // --- Loop -------------------------------------------------------------

  private onUpdate(time: number, delta: number): void {
    if (this.runOver || !this.cat) return;

    const body = this.cat.body as Phaser.Physics.Arcade.Body;
    const left = this.cursors.left.isDown || this.touchLeft;
    const right = this.cursors.right.isDown || this.touchRight;
    const jump = this.spaceKey.isDown || this.cursors.up.isDown || this.touchJump;

    const moving = left || right;
    const onGround = body.blocked.down || body.touching.down;

    if (left && !right) {
      this.cat.setVelocityX(-MOVE_SPEED);
      this.catAnimator.setFlip(true);
    } else if (right && !left) {
      this.cat.setVelocityX(MOVE_SPEED);
      this.catAnimator.setFlip(false);
    } else {
      this.cat.setVelocityX(0);
    }

    if (jump && onGround) {
      this.cat.setVelocityY(JUMP_VELOCITY);
    }

    this.catAnimator.update(moving, onGround);

    this.animateGrannyWalk(delta);
    this.updateGrannyPatrol(delta);

    const nearWindow = this.isCatInWindow() && this.carried > 0;
    this.windowHint.setAlpha(nearWindow ? 1 : 0);

    if (Phaser.Input.Keyboard.JustDown(this.bankKey)) this.tryBank();

    this.cat.setAlpha(time < this.invulnUntil ? 0.5 : 1);
  }

  private teardown(): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate, this);
  }
}

import Phaser from 'phaser';
import { isGrannyTextureKey } from '../grannyAnimator.js';
import { buildOutfitLayer, type OutfitLayer } from '../cosmeticAttachments.js';
import { CAT_GAME_TEXTURE_KEYS, getCatVisualId } from '../../assets/catCatalog.js';
import { getSelectedCatId } from '../runConfig.js';
import Player from '../../scenes/Player.js';
import Granny from '../../scenes/Granny.js';
import Chihuahua from '../../scenes/Chihuahua.js';
import treatMarker from '../../scenes/treatMarker.js';
import type { Bodied, CollectedObjects, GrannyObject } from './types.js';

export function isExitRect(rect: Phaser.GameObjects.Rectangle): boolean {
  const name = rect.name.toLowerCase();
  if (name === 'exit' || name.startsWith('exit')) return true;
  // Fallback for editor-authored exits that lost their name: a body-less,
  // clearly tall rectangle (a doorway strip) that isn't the escape window.
  if (name === 'window' || name.includes('window')) return false;
  const body = rect.body as Phaser.Physics.Arcade.Body | null;
  return !body && rect.displayHeight > rect.displayWidth * 1.5 && rect.displayHeight > 60;
}

export function isFloorRect(rect: Phaser.GameObjects.Rectangle): boolean {
  const name = rect.name.toLowerCase();
  if (name === 'window' || name === 'exit' || isSurfaceRect(rect) || isExitRect(rect)) return false;
  if (name === 'floor') return true;
  return rect.displayWidth > 800 && rect.displayHeight < 120;
}

export function isWindowRect(rect: Phaser.GameObjects.Rectangle): boolean {
  const name = rect.name.toLowerCase();
  if (name === 'exit' || name.startsWith('exit')) return false;
  if (name === 'window' || name.includes('window')) return true;
  const body = rect.body as Phaser.Physics.Arcade.Body | null;
  return Boolean(body && body.enable === false);
}

export function isSurfaceRect(rect: Phaser.GameObjects.Rectangle): boolean {
  if (isWindowRect(rect) || isExitRect(rect)) return false;
  const name = rect.name.toLowerCase();
  return name === 'surface' || name.startsWith('surface_');
}

export function isChihuahuaObject(obj: Phaser.GameObjects.GameObject): boolean {
  if (obj instanceof Chihuahua) return true;
  const name = obj.name.toLowerCase();
  const key =
    (obj as Phaser.Physics.Arcade.Sprite).texture?.key?.toLowerCase() ?? '';
  return name === 'chihuahua' || key.includes('chihuahua');
}

export function isGrannyObject(obj: Phaser.GameObjects.GameObject): boolean {
  const name = obj.name.toLowerCase();
  const key =
    (obj as Phaser.GameObjects.Image).texture?.key?.toLowerCase() ??
    (obj as Phaser.Physics.Arcade.Sprite).texture?.key?.toLowerCase() ??
    '';
  return name === 'granny' || isGrannyTextureKey(key);
}

export function isTreatMarker(obj: Phaser.GameObjects.GameObject): boolean {
  if (obj instanceof treatMarker) return true;
  return obj.name.toLowerCase().startsWith('treat');
}

export function parseTreatPoints(name: string): number {
  const match = name.match(/treat[_-]?(\d+)/i);
  if (match) return Number.parseInt(match[1]!, 10);
  return 10;
}

function findArcadeSprite(
  children: Phaser.GameObjects.GameObject[],
): Phaser.Physics.Arcade.Sprite | undefined {
  for (const child of children) {
    if (child instanceof Phaser.GameObjects.Sprite && (child as Bodied).body) {
      return child as Phaser.Physics.Arcade.Sprite;
    }
  }
  return undefined;
}

/**
 * The Player prefab is a Container holding one group per cat visual — each
 * group is a nested Container with that cat's ArcadeSprite plus its outfit
 * images, positioned per-cat in Phaser Editor (side by side so every cat is
 * editable). At runtime only the group matching the player's selected cat
 * survives: its sprite becomes THE gameplay cat (re-parented to the scene at
 * the prefab's position — Arcade bodies don't track container-local
 * coordinates), its outfit images become OutfitLayers whose offsets are
 * exactly the editor-authored distance from that cat, and every other group
 * is destroyed. Also supports the older flat layout (sprite + images directly
 * in the root) as a fallback.
 */
function unpackPlayerContainer(container: Phaser.GameObjects.Container): {
  sprite: Phaser.Physics.Arcade.Sprite | undefined;
  outfits: OutfitLayer[];
} {
  const scene = container.scene;
  const children = [...container.list] as Phaser.GameObjects.GameObject[];

  // Which group do we want? Match each group's sprite texture against the
  // selected cat's idle sheet.
  const selectedIdleKey = CAT_GAME_TEXTURE_KEYS[getCatVisualId(getSelectedCatId())].idle;

  let groupParent: Phaser.GameObjects.Container = container;
  let groupChildren = children;
  let sprite: Phaser.Physics.Arcade.Sprite | undefined = findArcadeSprite(children);

  if (!sprite) {
    // Per-cat layout: pick the matching group (fall back to the first one
    // that has a sprite, so an unknown cat id still yields a player).
    const groups = children.filter(
      (c): c is Phaser.GameObjects.Container => c instanceof Phaser.GameObjects.Container,
    );
    let chosen: Phaser.GameObjects.Container | undefined;
    let chosenSprite: Phaser.Physics.Arcade.Sprite | undefined;

    for (const group of groups) {
      const groupSprite = findArcadeSprite(group.list as Phaser.GameObjects.GameObject[]);
      if (!groupSprite) continue;
      if (!chosen) {
        chosen = group;
        chosenSprite = groupSprite;
      }
      if (groupSprite.texture?.key === selectedIdleKey) {
        chosen = group;
        chosenSprite = groupSprite;
        break;
      }
    }

    if (!chosen || !chosenSprite) return { sprite: undefined, outfits: [] };

    // Destroy every non-selected group (their sprites, bodies and outfits).
    for (const group of groups) {
      if (group !== chosen) group.destroy();
    }

    groupParent = chosen;
    groupChildren = [...chosen.list] as Phaser.GameObjects.GameObject[];
    sprite = chosenSprite;
  }

  const images = groupChildren.filter(
    (c): c is Phaser.GameObjects.Image =>
      c instanceof Phaser.GameObjects.Image && c !== (sprite as unknown),
  );

  const spriteLocalX = sprite.x;
  const spriteLocalY = sprite.y;

  // Capture each outfit's editor-authored offset from its cat BEFORE moving
  // anything (both are still in the same group-local space here).
  const editorOffsets = new Map<Phaser.GameObjects.Image, { x: number; y: number }>();
  for (const image of images) {
    editorOffsets.set(image, { x: image.x - spriteLocalX, y: image.y - spriteLocalY });
  }

  // Re-parent the survivors to the scene. The cat lands exactly on the prefab
  // instance's position (what the room author placed); outfit images are
  // driven every frame by the attachment manager, so their spawn spot is moot.
  for (const child of [sprite as Phaser.GameObjects.GameObject, ...images]) {
    const positioned = child as Phaser.GameObjects.GameObject & { x: number; y: number };
    groupParent.remove(child);
    scene.add.existing(child);
    positioned.x = container.x;
    positioned.y = container.y;
  }

  sprite.setName('player');
  (sprite.body as Phaser.Physics.Arcade.Body | null)?.updateFromGameObject();

  const outfits: OutfitLayer[] = [];
  for (const image of images) {
    // Offsets = editor-authored distance from THIS cat's origin (its group in
    // the prefab). Drag in the editor, done — no cross-cat conversion.
    const off = editorOffsets.get(image) ?? { x: 0, y: 0 };
    // Anchor against the frame the artist authored on (the group sprite's
    // current frame — whatever preview animation was saved in the editor).
    const layer = buildOutfitLayer(image, off.x, off.y, sprite.width, sprite.height);
    if (layer) {
      layer.image.setVisible(false);
      outfits.push(layer);
    } else {
      // Not a known outfit (stray art in the prefab) — hide it.
      image.setVisible(false);
    }
  }

  container.destroy();
  return { sprite, outfits };
}

export function collectEditorObjects(scene: Phaser.Scene): CollectedObjects {
  let player: Phaser.Physics.Arcade.Sprite | undefined;
  const outfitLayers: OutfitLayer[] = [];
  // Fallback if the Player prefab's hitSounds list comes through empty —
  // Phaser Editor's array-default codegen is unreliable (it can emit [] even
  // when the .scene file holds entries). A non-empty editor list overrides
  // these; to silence hits entirely, set hitSoundVolume to 0 instead.
  let hitSounds: string[] = ['cat-meow-1', 'cat-meow-2', 'cat-meow-3'];
  let hitSoundVolume = 0.4;
  const furniture: Phaser.GameObjects.Image[] = [];
  const floors: Phaser.GameObjects.Rectangle[] = [];
  const surfaces: Phaser.GameObjects.Rectangle[] = [];
  const treatMarkers: Phaser.GameObjects.GameObject[] = [];
  let window: Phaser.GameObjects.Rectangle | undefined;
  let exit: Phaser.GameObjects.Rectangle | undefined;
  let granny: GrannyObject | undefined;
  const chihuahuas: Chihuahua[] = [];

  const visit = (obj: Phaser.GameObjects.GameObject): void => {
    const bodied = obj as Bodied;
    if (obj instanceof treatMarker) {
      // Must come before the generic sprite branch: the marker prefab is an
      // ArcadeSprite with a body and would otherwise be misrouted.
      treatMarkers.push(obj);
    } else if (obj instanceof Chihuahua) {
      chihuahuas.push(obj);
    } else if (obj instanceof Player) {
      // Capture the prefab's sound properties before the container is
      // flattened/destroyed by the unpack.
      const soundProps = obj as Partial<{ hitSounds: string[]; hitSoundVolume: number }>;
      if (Array.isArray(soundProps.hitSounds) && soundProps.hitSounds.length > 0) {
        hitSounds = [...soundProps.hitSounds];
      }
      if (typeof soundProps.hitSoundVolume === 'number') {
        hitSoundVolume = Phaser.Math.Clamp(soundProps.hitSoundVolume, 0, 1);
      }
      const unpacked = unpackPlayerContainer(obj);
      if (unpacked.sprite) player = unpacked.sprite;
      outfitLayers.push(...unpacked.outfits);
    } else if (obj instanceof Granny) {
      granny = obj;
    } else if (obj instanceof Phaser.GameObjects.Sprite && bodied.body) {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (isChihuahuaObject(sprite)) chihuahuas.push(sprite as unknown as Chihuahua);
      else if (isGrannyObject(sprite)) granny = sprite;
      else if (sprite.name === 'player' || sprite.texture?.key?.includes('orange-cat')) player = sprite;
      else if (!player) player = sprite;
    } else if (obj instanceof Phaser.GameObjects.Rectangle) {
      const rect = obj;
      if (isExitRect(rect)) exit = rect;
      else if (isWindowRect(rect)) window = rect;
      else if (isFloorRect(rect)) floors.push(rect);
      else if (isSurfaceRect(rect) && (rect.body as Phaser.Physics.Arcade.Body | null)?.enable !== false)
        surfaces.push(rect);
    } else if (obj instanceof Phaser.GameObjects.Image) {
      if (isGrannyObject(obj)) granny = obj as GrannyObject;
      else if (isTreatMarker(obj)) treatMarkers.push(obj);
      else if (obj.texture?.key?.indexOf('furniture') === 0) furniture.push(obj);
    } else if (obj instanceof Phaser.GameObjects.Arc && isTreatMarker(obj)) {
      treatMarkers.push(obj);
    } else if (obj instanceof Phaser.GameObjects.Ellipse && isTreatMarker(obj)) {
      treatMarkers.push(obj);
    } else if (obj instanceof Phaser.GameObjects.Container) {
      for (const nested of obj.list) visit(nested as Phaser.GameObjects.GameObject);
    }
  };

  for (const child of scene.children.list) visit(child);

  if (!granny) {
    const found = scene.children.list.find(
      (child) => isGrannyObject(child) && Boolean((child as Bodied).body),
    );
    if (found) granny = found as GrannyObject;
  }

  return {
    player,
    furniture,
    floors,
    surfaces,
    window,
    exit,
    granny,
    treatMarkers,
    chihuahuas,
    outfitLayers,
    hitSounds,
    hitSoundVolume,
  };
}

/**
 * Phaser Editor does not copy an object's label into its runtime `.name`, so
 * every room scene calls this after `editorCreate()` to tag objects the sneak
 * systems look for. Objects already given a name (e.g. hand-written scaffolds)
 * are left untouched.
 */
export function assignEditorNames(scene: Phaser.Scene): void {
  let floorNamed = false;
  for (const child of [...scene.children.list]) {
    const go = child as Phaser.GameObjects.GameObject & { x?: number; y?: number };
    if (Number.isNaN(go.x) || Number.isNaN(go.y)) {
      child.destroy();
      continue;
    }
    if (child instanceof treatMarker) {
      if (!child.name) child.setName(`treat_${child.points}`);
      continue;
    }

    if (child.name) continue;

    if (child instanceof Player || child instanceof Granny || child instanceof Chihuahua) {
      continue;
    }

    if (child instanceof Phaser.GameObjects.Rectangle) {
      const rect = child;
      const body = rect.body as Phaser.Physics.Arcade.Body | null;
      if (!body && rect.displayHeight > rect.displayWidth * 1.5 && rect.displayHeight > 60) {
        rect.setName('exit');
      } else if (!floorNamed && rect.displayWidth > 400 && rect.displayHeight < 120) {
        rect.setName('floor');
        floorNamed = true;
      } else if (body && !body.enable) {
        rect.setName('window');
      } else if (rect.displayWidth <= 400 && rect.displayHeight < 120) {
        rect.setName('surface');
      }
    } else if (child instanceof Phaser.Physics.Arcade.Sprite) {
      const key = child.texture?.key?.toLowerCase() ?? '';
      if (key.includes('chihuahua')) child.setName('chihuahua');
      else if (key.includes('granny') || key.includes('wizard')) child.setName('granny');
      else if (key.includes('orange-cat') || key.includes('cat')) child.setName('player');
    } else if (
      child instanceof Phaser.GameObjects.Ellipse ||
      child instanceof Phaser.GameObjects.Arc
    ) {
      // Editor-placed treat blobs that lost their name default to 10 points.
      child.setName('treat_10');
    } else if (child instanceof Phaser.GameObjects.Image) {
      const key = child.texture?.key?.toLowerCase() ?? '';
      if (key.includes('granny') || key.includes('wizard')) child.setName('granny');
    }
  }
}

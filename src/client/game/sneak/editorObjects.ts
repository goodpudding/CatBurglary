import Phaser from 'phaser';
import { isGrannyTextureKey } from '../grannyAnimator.js';
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

export function isGrannyObject(obj: Phaser.GameObjects.GameObject): boolean {
  const name = obj.name.toLowerCase();
  const key =
    (obj as Phaser.GameObjects.Image).texture?.key?.toLowerCase() ??
    (obj as Phaser.Physics.Arcade.Sprite).texture?.key?.toLowerCase() ??
    '';
  return name === 'granny' || isGrannyTextureKey(key);
}

export function isTreatMarker(obj: Phaser.GameObjects.GameObject): boolean {
  return obj.name.toLowerCase().startsWith('treat');
}

export function parseTreatPoints(name: string): number {
  const match = name.match(/treat[_-]?(\d+)/i);
  if (match) return Number.parseInt(match[1]!, 10);
  return 10;
}

export function collectEditorObjects(scene: Phaser.Scene): CollectedObjects {
  let player: Phaser.Physics.Arcade.Sprite | undefined;
  const furniture: Phaser.GameObjects.Image[] = [];
  const floors: Phaser.GameObjects.Rectangle[] = [];
  const surfaces: Phaser.GameObjects.Rectangle[] = [];
  const treatMarkers: Phaser.GameObjects.GameObject[] = [];
  let window: Phaser.GameObjects.Rectangle | undefined;
  let exit: Phaser.GameObjects.Rectangle | undefined;
  let granny: GrannyObject | undefined;

  const visit = (obj: Phaser.GameObjects.GameObject): void => {
    const bodied = obj as Bodied;
    if (obj instanceof Phaser.GameObjects.Sprite && bodied.body) {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (isGrannyObject(sprite)) granny = sprite;
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

  return { player, furniture, floors, surfaces, window, exit, granny, treatMarkers };
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
    if (child.name) continue;

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
      if (key.includes('granny') || key.includes('wizard')) child.setName('granny');
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

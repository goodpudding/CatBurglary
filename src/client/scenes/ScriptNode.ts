import Phaser from 'phaser';

/**
 * Minimal Phaser Editor-style script node base class.
 *
 * A script node is a plain (non-rendering) object that hangs off a game
 * object, a scene, or another script node in the editor's display tree.
 * Custom behaviors extend this class and are selected in the editor by
 * setting the script node's "Type" field to the subclass name.
 */
export default class ScriptNode {
  private readonly parent: ScriptNode | Phaser.GameObjects.GameObject | Phaser.Scene;

  constructor(parent: ScriptNode | Phaser.GameObjects.GameObject | Phaser.Scene) {
    this.parent = parent;
  }

  get scene(): Phaser.Scene {
    if (this.parent instanceof ScriptNode) return this.parent.scene;
    if (this.parent instanceof Phaser.Scene) return this.parent;
    return this.parent.scene;
  }

  /** The game object this script is attached to, if any. */
  get gameObject(): Phaser.GameObjects.GameObject | undefined {
    if (this.parent instanceof ScriptNode) return this.parent.gameObject;
    if (this.parent instanceof Phaser.Scene) return undefined;
    return this.parent;
  }
}

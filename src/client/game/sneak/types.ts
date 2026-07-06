import type Phaser from 'phaser';

export type Bodied = Phaser.GameObjects.GameObject & {
  body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null;
};

export type TreatTarget = Phaser.GameObjects.GameObject & {
  getData(key: string): unknown;
  setData(key: string, value: unknown): void;
  destroy(): void;
};

export type GrannyObject = Phaser.Physics.Arcade.Sprite | Phaser.Physics.Arcade.Image;

export interface CollectedObjects {
  player: Phaser.Physics.Arcade.Sprite | undefined;
  furniture: Phaser.GameObjects.Image[];
  floors: Phaser.GameObjects.Rectangle[];
  surfaces: Phaser.GameObjects.Rectangle[];
  window: Phaser.GameObjects.Rectangle | undefined;
  exit: Phaser.GameObjects.Rectangle | undefined;
  granny: GrannyObject | undefined;
  treatMarkers: Phaser.GameObjects.GameObject[];
}

export interface WorldBounds {
  roomLeft: number;
  roomRight: number;
  roomHeight: number;
  groundTop: number;
  worldScale: number;
}

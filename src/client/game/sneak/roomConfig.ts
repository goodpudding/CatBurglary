/**
 * Per-room configuration for the one-way, escalating-difficulty house run.
 *
 * Rooms are played strictly in ROOM_ORDER. Each room's forward exit banks the
 * carried treats and advances to the next room; clearing the final room wins.
 * Difficulty multipliers ramp up room by room and are wired into the granny
 * controller, stealth (vision) system, slipper throwing, and treat scoring.
 */
export interface RoomDifficulty {
  /** Multiplier on granny's lazy patrol amble speed. */
  grannySpeedMul: number;
  /** Multiplier on granny's chase / investigate / retrieve speeds. */
  chaseMul: number;
  /** Multiplier on granny's vision cone range. */
  visionMul: number;
  /** Multiplier on how fast the detection meter fills. */
  fillMul: number;
  /** Multiplier on treat point values (deeper rooms are worth more). */
  treatValueMul: number;
  /** Multiplier on the slipper throw range. */
  throwRangeMul: number;
}

export interface RoomConfig {
  id: string;
  /** Phaser scene key registered in game.ts. */
  sceneKey: string;
  /** Human-friendly room name for the HUD. */
  label: string;
  /** Position in the run (0-based); filled in from ROOM_ORDER. */
  index: number;
  /** True for the deepest room — clearing it wins the run. */
  isFinal: boolean;
  difficulty: RoomDifficulty;
}

type RoomSpec = Omit<RoomConfig, 'index' | 'isFinal'>;

const SPECS: RoomSpec[] = [
  {
    id: 'kitchen',
    sceneKey: 'KitchenRoom',
    label: 'Kitchen',
    difficulty: {
      grannySpeedMul: 1,
      chaseMul: 1,
      visionMul: 1,
      fillMul: 1,
      treatValueMul: 1,
      throwRangeMul: 1,
    },
  },
  {
    id: 'livingroom',
    sceneKey: 'LivingRoomRoom',
    label: 'Living Room',
    difficulty: {
      grannySpeedMul: 1.15,
      chaseMul: 1.1,
      visionMul: 1.1,
      fillMul: 1.1,
      treatValueMul: 1.2,
      throwRangeMul: 1.1,
    },
  },
  {
    id: 'hallway',
    sceneKey: 'HallwayRoom',
    label: 'Hallway',
    difficulty: {
      grannySpeedMul: 1.3,
      chaseMul: 1.2,
      visionMul: 1.25,
      fillMul: 1.2,
      treatValueMul: 1.4,
      throwRangeMul: 1.2,
    },
  },
  {
    id: 'bathroom',
    sceneKey: 'BathroomRoom',
    label: 'Bathroom',
    difficulty: {
      grannySpeedMul: 1.5,
      chaseMul: 1.35,
      visionMul: 1.4,
      fillMul: 1.35,
      treatValueMul: 1.6,
      throwRangeMul: 1.3,
    },
  },
];

export const ROOM_ORDER: RoomConfig[] = SPECS.map((spec, index) => ({
  ...spec,
  index,
  isFinal: index === SPECS.length - 1,
}));

/** Scene key of the very first room (used by Boot + Play Again). */
export const FIRST_ROOM_KEY = ROOM_ORDER[0]!.sceneKey;

export function getRoomByKey(sceneKey: string): RoomConfig {
  return ROOM_ORDER.find((room) => room.sceneKey === sceneKey) ?? ROOM_ORDER[0]!;
}

export function getRoomByIndex(index: number): RoomConfig {
  return ROOM_ORDER[Phaser_clamp(index, 0, ROOM_ORDER.length - 1)]!;
}

/** The next room in the run, or null if the given room is the final one. */
export function getNextRoom(room: RoomConfig): RoomConfig | null {
  return room.isFinal ? null : (ROOM_ORDER[room.index + 1] ?? null);
}

// Local clamp so this config module stays engine-free (no Phaser import needed
// just for Phaser.Math.Clamp) — keeps it cheap to import from anywhere.
function Phaser_clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

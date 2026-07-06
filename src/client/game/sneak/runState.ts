import { MAX_LIVES } from './constants.js';

/**
 * Shared run-state that survives `scene.start()` between rooms.
 *
 * Progression is strictly one-way: the player moves forward through rooms,
 * banking whatever they carry as they cross each forward exit. `score` only
 * ever grows; `carried` is at risk (dropped if caught) until the next exit.
 */
export interface RunState {
  /** Lives remaining across the whole run. */
  lives: number;
  /** Forward-only banked score (survives room transitions). */
  score: number;
  /** Treats grabbed in the CURRENT room, banked on the next forward exit. */
  carried: number;
  /** Index into ROOM_ORDER of the room currently being played. */
  roomIndex: number;
}

export const runState: RunState = {
  lives: MAX_LIVES,
  score: 0,
  carried: 0,
  roomIndex: 0,
};

/** Reset to a fresh run (called on Boot and on "Play Again"). */
export function resetRun(): void {
  runState.lives = MAX_LIVES;
  runState.score = 0;
  runState.carried = 0;
  runState.roomIndex = 0;
}

/** Bank whatever is carried and advance to the next room index. */
export function bankCarriedAndAdvance(): void {
  runState.score += runState.carried;
  runState.carried = 0;
  runState.roomIndex += 1;
}

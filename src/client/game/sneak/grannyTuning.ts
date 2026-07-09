import Phaser from 'phaser';
import {
  CHASE_SPEED,
  DETECT_FILL_RATE,
  GRANNY_ENTRY_DELAY_MS,
  GRANNY_ENTRY_SPEED,
  LOCK_LOST_SIGHT_MS,
  PATROL_SPEED,
  RETRIEVE_SPEED,
  SLIPPER_THROW_COOLDOWN_MS,
  SLIPPER_THROW_RANGE,
  SLIPPER_THROW_SPEED,
  VISION_HALF_ANGLE,
  VISION_RANGE,
  VISION_SWEEP_DEG,
  VISION_SWEEP_SPEED_DEG,
} from './constants.js';

/**
 * Resolved per-instance granny tuning. Every value has a sensible default (the
 * global constant); the Granny prefab exposes matching properties in the Phaser
 * Editor Inspector so individual grannies can be tuned without touching code.
 */
export interface GrannyTuning {
  /** Lazy patrol amble speed (px/s). */
  patrolSpeed: number;
  /** Speed while actively chasing the cat (px/s). */
  chaseSpeed: number;
  /** Speed while walking to retrieve a thrown slipper (px/s). */
  retrieveSpeed: number;
  /** How far granny can see straight ahead (world px, before world scale). */
  visionRange: number;
  /** Half-angle of the vision cone, in radians. */
  visionHalfAngle: number;
  /** Detection-meter fill per second at point-blank range. */
  detectFillRate: number;
  /** Cat must be within this range for granny to throw her slipper. */
  throwRange: number;
  /** Minimum gap (ms) between throws. */
  throwCooldownMs: number;
  /** Initial horizontal speed of a thrown slipper (px/s). */
  throwSpeed: number;
  /** Touching granny always hurts (not just while she is alert). */
  touchDamage: boolean;
  /** Max up/down tilt of the sweeping vision cone, in radians. */
  sweepHalfAngle: number;
  /** Up/down sweep speed in radians per second. */
  sweepSpeed: number;
  /** Ms granny stays locked on (chasing) after losing sight of the cat. */
  lostSightMs: number;
  /** Ms granny waits off-screen before walking into a new room (rooms 2+). */
  entryDelayMs: number;
  /** Walk speed (px/s) during her entrance into a new room. */
  entrySpeed: number;
}

/**
 * The raw fields the Granny prefab may set (all optional). `visionAngleDeg` is
 * authored in degrees for editor friendliness and converted to radians here.
 */
export interface GrannyTuningFields {
  patrolSpeed?: number;
  chaseSpeed?: number;
  retrieveSpeed?: number;
  visionRange?: number;
  visionAngleDeg?: number;
  detectFillRate?: number;
  throwRange?: number;
  throwCooldownMs?: number;
  throwSpeed?: number;
  touchDamage?: boolean;
  sweepDeg?: number;
  sweepSpeedDeg?: number;
  lostSightMs?: number;
  entryDelayMs?: number;
  entrySpeed?: number;
}

/** Read a granny object's prefab properties, falling back to the constants. */
export function resolveGrannyTuning(
  granny: Phaser.GameObjects.GameObject | undefined,
): GrannyTuning {
  const g = (granny ?? {}) as GrannyTuningFields;
  return {
    patrolSpeed: g.patrolSpeed ?? PATROL_SPEED,
    chaseSpeed: g.chaseSpeed ?? CHASE_SPEED,
    retrieveSpeed: g.retrieveSpeed ?? RETRIEVE_SPEED,
    visionRange: g.visionRange ?? VISION_RANGE,
    visionHalfAngle:
      g.visionAngleDeg !== undefined
        ? Phaser.Math.DegToRad(g.visionAngleDeg)
        : VISION_HALF_ANGLE,
    detectFillRate: g.detectFillRate ?? DETECT_FILL_RATE,
    throwRange: g.throwRange ?? SLIPPER_THROW_RANGE,
    throwCooldownMs: g.throwCooldownMs ?? SLIPPER_THROW_COOLDOWN_MS,
    throwSpeed: g.throwSpeed ?? SLIPPER_THROW_SPEED,
    touchDamage: g.touchDamage ?? true,
    sweepHalfAngle: Phaser.Math.DegToRad(g.sweepDeg ?? VISION_SWEEP_DEG),
    sweepSpeed: Phaser.Math.DegToRad(g.sweepSpeedDeg ?? VISION_SWEEP_SPEED_DEG),
    lostSightMs: g.lostSightMs ?? LOCK_LOST_SIGHT_MS,
    entryDelayMs: g.entryDelayMs ?? GRANNY_ENTRY_DELAY_MS,
    entrySpeed: g.entrySpeed ?? GRANNY_ENTRY_SPEED,
  };
}

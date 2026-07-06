import Phaser from 'phaser';

export const MAX_LIVES = 3;
/** Draw accurate hitbox overlays (custom renderer; Arcade's built-in debug drifts after layout). */
export const DEBUG_PHYSICS = true;
/** Space reserved above the room so HUD text sits over empty padding, not the art. */
export const HUD_TOP_PADDING = 96;
export const HUD_BOTTOM_PADDING = 8;
export const INVULN_MS = 1200;
export const GRANNY_SPEED = 90;
export const FALLBACK_HEIGHT = 540;
export const GROUND_VIEWPORT_RATIO = 0.88;
export const ROOM_VIEWPORT_HEIGHT_RATIO = 0.48;
export const ROOM_VIEWPORT_WIDTH_RATIO = 0.5;
export const JUMP_HEIGHT_SCALE = 1 / 3;
export const FURNITURE_LAND_TOLERANCE = 14;
export const DOUBLE_TAP_MS = 320;

/** How long granny idles after the cat enters a new room (rooms 2+). */
export const GRANNY_ENTRY_DELAY_MS = 4000;
/** Minimum horizontal gap between cat entrance and granny on room entry. */
export const GRANNY_ENTRY_MIN_GAP = 300;

// --- Stealth / detection ---------------------------------------------------
/** How far (world px) granny can see straight ahead. */
export const VISION_RANGE = 340;
/** Half-angle of the vision cone in radians (total cone = 2x this). */
export const VISION_HALF_ANGLE = Phaser.Math.DegToRad(32);
/** Detection meter fill per second at point-blank range while fully visible. */
export const DETECT_FILL_RATE = 1.6;
/** Detection meter drain per second when the cat is not visible. */
export const DETECT_DECAY_RATE = 0.5;
/** Meter value (0..1) at which granny goes fully alert. */
export const ALERT_THRESHOLD = 1;
/** Meter value (0..1) above which granny grows suspicious and investigates. */
export const SUSPICION_THRESHOLD = 0.35;
/** How long (ms) granny keeps searching after losing sight before giving up. */
export const SEARCH_COOLDOWN_MS = 2600;

// --- Cat sneaking ----------------------------------------------------------
/** Move-speed multiplier while crouch-sneaking. */
export const CROUCH_SPEED_SCALE = 0.5;
/** Vision-range multiplier applied when the cat is crouching (harder to spot). */
export const CROUCH_VISION_SCALE = 0.55;

// --- Granny patrol wandering ----------------------------------------------
/** Slow amble speed while patrolling / wandering (px/s). */
export const PATROL_SPEED = 42;
/** Random pause range (ms) when granny reaches a wander target. */
export const PATROL_PAUSE_MIN_MS = 800;
export const PATROL_PAUSE_MAX_MS = 2400;
/** Minimum distance (px) between successive random wander targets. */
export const PATROL_MIN_STEP = 90;

// --- Cat movement feel -----------------------------------------------------
/** Global multiplier on the cat's top speed (lower = calmer). */
export const CAT_SPEED_SCALE = 0.72;
/** Horizontal acceleration (px/s^2) — soft taps ramp slowly, holds reach top speed. */
export const CAT_ACCEL = 1500;
/** Horizontal drag (px/s^2) that eases the cat back to a stop. */
export const CAT_DRAG = 1600;

// --- Granny chase / slipper ------------------------------------------------
/** Chase speed while alert (px/s). */
export const CHASE_SPEED = 150;
/** Speed while walking to retrieve a thrown slipper (px/s). */
export const RETRIEVE_SPEED = 130;
/** Cat must be within this range for granny to throw her slipper. */
export const SLIPPER_THROW_RANGE = 300;
/** Initial horizontal speed of a thrown slipper (px/s); arc adds gravity. */
export const SLIPPER_THROW_SPEED = 360;
/** Minimum gap (ms) between deciding to throw again after picking the slipper up. */
export const SLIPPER_THROW_COOLDOWN_MS = 900;

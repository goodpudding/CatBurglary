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

/** How long granny waits off-screen before walking into a new room (rooms 2+). */
export const GRANNY_ENTRY_DELAY_MS = 1500;
/** Walk speed (px/s) granny uses for her off-screen -> spawn entry stride.
 *  Faster than her lazy patrol amble so she arrives in the room promptly. */
export const GRANNY_ENTRY_SPEED = 170;
/** How far left of the room edge granny stands before her entrance walk. */
export const GRANNY_ENTRY_OFFSCREEN_PAD = 110;

/** Room index (0-based) where the chihuahua ambush runs — Living Room = 1. */
export const CHIHUAHUA_CHARGE_ROOM_INDEX = 1;
/** Ms after room load before the dog charges (room 2 entry). */
export const CHIHUAHUA_CHARGE_DELAY_MS = 900;
export const CHIHUAHUA_CHARGE_SPEED = 195;
export const CHIHUAHUA_CHARGE_OVERSHOOT = 56;
export const CHIHUAHUA_CHARGE_RECOVER_SPEED = 70;
/** Speed (px/s) a dog uses to keep chasing the cat after its first contact. */
export const CHIHUAHUA_FOLLOW_SPEED = 130;
/** Horizontal gap (px) between dog and cat that counts as "reached" the player. */
export const CHIHUAHUA_REACH_DISTANCE = 34;
/** Ms the dog barks in place before charging again. */
export const CHIHUAHUA_BARK_PAUSE_MS = 1000;
/** Ms after trotting home before the dog may charge again. */
export const CHIHUAHUA_RECHARGE_DELAY_MS = 700;

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
/** Max up/down tilt (degrees) of the vision cone while sweeping on patrol. */
export const VISION_SWEEP_DEG = 22;
/** Sweep speed (degrees per second) of the up/down scan. */
export const VISION_SWEEP_SPEED_DEG = 28;
/** Ms granny stays locked on (still chasing) after losing sight of the cat. */
export const LOCK_LOST_SIGHT_MS = 1600;
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

// --- Night lighting ----------------------------------------------------------
/** How dark the room gets (0 = day, 1 = pitch black). */
export const NIGHT_ALPHA = 0.72;
/** Radius (px) of the soft light around the cat. */
export const CAT_GLOW_RADIUS = 160;

// --- Cat movement feel -----------------------------------------------------
/** Ms a jump press stays buffered so pressing just before landing still jumps. */
export const JUMP_BUFFER_MS = 120;
/** Ms after walking off a ledge during which a jump still works (coyote time). */
export const COYOTE_MS = 90;
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

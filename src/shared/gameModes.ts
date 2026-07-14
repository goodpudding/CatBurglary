export type GameModeId = 'regular' | 'easy' | 'dark';

export type GameModeDefinition = {
  id: GameModeId;
  name: string;
  description: string;
  icon: string;
  /** Multiplies granny's patrol/chase/retrieve speeds. */
  grannySpeedMul: number;
  /** Multiplies how fast granny's suspicion meter fills. */
  detectMul: number;
  /** Multiplies the pause between slipper throws (higher = fewer throws). */
  throwCooldownMul: number;
  /** Multiplies slipper flight speed. */
  throwSpeedMul: number;
  /** Multiplies the knockback the cat takes when hit. */
  knockbackMul: number;
  /** Lights out: granny's vision cone becomes a flashlight, a glow follows the cat. */
  night: boolean;
};

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: 'regular',
    name: 'Regular',
    description: 'The classic heist. Granny at full grump.',
    icon: '🐱',
    grannySpeedMul: 1,
    detectMul: 1,
    throwCooldownMul: 1,
    throwSpeedMul: 1,
    knockbackMul: 1,
    night: false,
  },
  {
    id: 'easy',
    name: 'Easy',
    description: 'Granny takes it slower and throws softer.',
    icon: '🍼',
    grannySpeedMul: 0.7,
    detectMul: 0.65,
    throwCooldownMul: 1.6,
    throwSpeedMul: 0.75,
    knockbackMul: 0.6,
    night: false,
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Lights out — dodge the beam of her flashlight.',
    icon: '🔦',
    grannySpeedMul: 1,
    detectMul: 1,
    throwCooldownMul: 1,
    throwSpeedMul: 1,
    knockbackMul: 1,
    night: true,
  },
];

export const DEFAULT_GAME_MODE: GameModeId = 'regular';

const modesById = new Map(GAME_MODES.map((mode) => [mode.id, mode]));

export function isValidGameModeId(id: string): id is GameModeId {
  return modesById.has(id as GameModeId);
}

export function getGameModeDefinition(id: string): GameModeDefinition {
  return modesById.get(id as GameModeId) ?? modesById.get(DEFAULT_GAME_MODE)!;
}

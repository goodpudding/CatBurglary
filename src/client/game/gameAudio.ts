import Phaser from 'phaser';
import { AUDIO } from './audioKeys.js';

const BGM_VOLUME = 0.28;
const SFX_VOLUME = 0.55;
const BARK_VOLUME = 0.32;
/** Keep barks short so they do not get annoying during repeated charges. */
const BARK_MAX_MS = 650;

let levelBgm: Phaser.Sound.BaseSound | null = null;
let lastBarkAt = 0;

function playOneShot(
  scene: Phaser.Scene,
  key: string,
  opts: { volume?: number; maxMs?: number; minGapMs?: number } = {},
): void {
  if (!scene.cache.audio.exists(key)) return;

  const now = scene.time.now;
  if (opts.minGapMs && now - lastBarkAt < opts.minGapMs) return;
  if (opts.minGapMs) lastBarkAt = now;

  const sound = scene.sound.add(key, { volume: opts.volume ?? SFX_VOLUME });
  sound.play();

  if (opts.maxMs) {
    scene.time.delayedCall(opts.maxMs, () => {
      if (sound.isPlaying) sound.stop();
      sound.destroy();
    });
  } else {
    sound.once('complete', () => sound.destroy());
  }
}

/** Persistent level music — call from the dedicated Audio scene. */
export function startLevelMusic(scene: Phaser.Scene): void {
  if (levelBgm?.isPlaying) return;
  if (!scene.cache.audio.exists(AUDIO.BGM_LEVEL)) return;

  levelBgm?.destroy();
  levelBgm = scene.sound.add(AUDIO.BGM_LEVEL, { loop: true, volume: BGM_VOLUME });
  levelBgm.play();
}

export function stopLevelMusic(): void {
  levelBgm?.stop();
  levelBgm?.destroy();
  levelBgm = null;
}

export function playGameStart(scene: Phaser.Scene): void {
  playOneShot(scene, AUDIO.SFX_GAME_START, { volume: 0.5 });
}

export function playGameOver(scene: Phaser.Scene): void {
  stopLevelMusic();
  playOneShot(scene, AUDIO.SFX_GAME_OVER, { volume: 0.6 });
}

export function playThud(scene: Phaser.Scene): void {
  playOneShot(scene, AUDIO.SFX_THUD, { volume: 0.45 });
}

export function playBark(scene: Phaser.Scene): void {
  playOneShot(scene, AUDIO.SFX_BARK, {
    volume: BARK_VOLUME,
    maxMs: BARK_MAX_MS,
    minGapMs: 400,
  });
}

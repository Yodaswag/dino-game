import { INITIAL_SKILL } from './constants.js';

export function createInitialGameState() {
  return {
    npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
    platforms: [{ x: 0, w: 800, y: 160, type: 'platform' }],
    floatingTexts: [],
    splashes: [],
    clouds: [
      { x: 100, y: 30, speed: 0.2, scale: 1 },
      { x: 400, y: 50, speed: 0.15, scale: 0.8 },
      { x: 700, y: 20, speed: 0.25, scale: 1.2 }
    ],
    frame: 0,
    flowFrames: 0,
    badFrames: 0,
    skill: INITIAL_SKILL,
    status: 'onboarding',
    falls: [],
    lastAdjustmentTime: 0,
    stableSuccessSeconds: 0,
    framesOutsideFlow: 0,
    forceSafePlatform: false,
  };
}

import { describe, it, expect } from 'vitest';
import { updateGameState } from './updateGameState.js';

describe('Autopilot Mechanics', () => {
  it('does not jump automatically when autopilot is disabled', () => {
    const game = {
      npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
      platforms: [{ x: 0, w: 200, y: 160, type: 'platform' }],
      floatingTexts: [],
      splashes: [],
      clouds: [],
      frame: 0,
      flowFrames: 0,
      badFrames: 0,
      falls: [],
      isAutopilotEnabled: false
    };

    updateGameState({ game, gaps: 2, speed: 2, emotion: 'flow', challenge: 20, canvasWidth: 800 });
    expect(game.npc.isJumping).toBe(false);
    expect(game.npc.vy).toBe(0); // Clamped back to 0 because NPC is resting on the platform
  });

  it('does not jump when autopilot is enabled but platform end is far away', () => {
    const game = {
      npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
      platforms: [{ x: 0, w: 400, y: 160, type: 'platform' }],
      floatingTexts: [],
      splashes: [],
      clouds: [],
      frame: 0,
      flowFrames: 0,
      badFrames: 0,
      falls: [],
      isAutopilotEnabled: true
    };

    updateGameState({ game, gaps: 2, speed: 2, emotion: 'flow', challenge: 20, canvasWidth: 800 });
    expect(game.npc.isJumping).toBe(false);
  });

  it('jumps automatically when autopilot is enabled and platform end is close', () => {
    const game = {
      npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
      platforms: [{ x: 0, w: 175, y: 160, type: 'platform' }], // End is 175, distance is 25px (<= 30px threshold)
      floatingTexts: [],
      splashes: [],
      clouds: [],
      frame: 0,
      flowFrames: 0,
      badFrames: 0,
      falls: [],
      isAutopilotEnabled: true
    };

    updateGameState({ game, gaps: 2, speed: 2, emotion: 'flow', challenge: 20, canvasWidth: 800 });
    expect(game.npc.isJumping).toBe(true);
    expect(game.npc.vy).toBe(-11.4); // Upward jump velocity (-12) + gravity (0.6)
  });
});

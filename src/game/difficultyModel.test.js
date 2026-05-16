import { describe, it, expect } from 'vitest';
import { classifyEmotion, shouldHoldPreviousEmotion } from './difficultyModel.js';

describe('difficultyModel', () => {
  describe('classifyEmotion', () => {
    it('frustrated after repeated falls under high challenge', () => {
      expect(classifyEmotion({ delta: 18, recentFalls: 2, stableSuccessSeconds: 0 })).toBe('frustrated');
    });

    it('bored after sustained easy success', () => {
      expect(classifyEmotion({ delta: -18, recentFalls: 0, stableSuccessSeconds: 5 })).toBe('bored');
    });

    it('flow near the learner skill zone', () => {
      expect(classifyEmotion({ delta: 4, recentFalls: 0, stableSuccessSeconds: 3 })).toBe('flow');
    });

    it('frustrated when somewhat hard and falling', () => {
      expect(classifyEmotion({ delta: 10, recentFalls: 2, stableSuccessSeconds: 0 })).toBe('frustrated');
    });
  });

  describe('shouldHoldPreviousEmotion', () => {
    it('holds for 600ms', () => {
      expect(shouldHoldPreviousEmotion({ msSinceAdjustment: 500 })).toBe(true);
      expect(shouldHoldPreviousEmotion({ msSinceAdjustment: 700 })).toBe(false);
    });
  });
});

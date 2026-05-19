import { describe, it, expect } from 'vitest';
import { classifyEmotion, shouldHoldPreviousEmotion, calculateSkillGrowthRate } from './difficultyModel.js';
import { BASE_GROWTH_RATE } from './constants.js';

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

  describe('calculateSkillGrowthRate', () => {
    it('returns BASE_GROWTH_RATE when framesOutsideFlow is 0', () => {
      expect(calculateSkillGrowthRate({ framesOutsideFlow: 0 })).toBeCloseTo(BASE_GROWTH_RATE);
    });

    it('returns BASE_GROWTH_RATE when framesOutsideFlow is less than one interval', () => {
      expect(calculateSkillGrowthRate({ framesOutsideFlow: 17 })).toBeCloseTo(BASE_GROWTH_RATE);
    });

    it('decreases rate by 0.005 at exactly one interval (0.3s = 18 frames)', () => {
      expect(calculateSkillGrowthRate({ framesOutsideFlow: 18 })).toBeCloseTo(BASE_GROWTH_RATE - 0.005);
    });

    it('decreases rate by 0.01 at exactly two intervals (0.6s = 36 frames)', () => {
      expect(calculateSkillGrowthRate({ framesOutsideFlow: 36 })).toBeCloseTo(BASE_GROWTH_RATE - 0.01);
    });

    it('clamps the growth rate to 0 at or beyond 6 intervals (1.8s = 108 frames)', () => {
      expect(calculateSkillGrowthRate({ framesOutsideFlow: 108 })).toBeCloseTo(0);
      expect(calculateSkillGrowthRate({ framesOutsideFlow: 200 })).toBeCloseTo(0);
    });
  });
});

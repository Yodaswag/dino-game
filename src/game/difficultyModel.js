import { BASE_GROWTH_RATE, DECREMENT_INTERVAL_SECONDS, RATE_DECREMENT } from './constants.js';

export function calculateChallenge({ gaps, speed }) {
  return (gaps * 5) + (speed * 5);
}

export function calculateSkillGrowthRate({ framesOutsideFlow, framesSinceLastJump = 0 }) {
  // No passive growth without recent player input — idling can't progress.
  if (framesSinceLastJump > 180) return 0;
  const intervalFrames = DECREMENT_INTERVAL_SECONDS * 60;
  const intervals = Math.floor(framesOutsideFlow / intervalFrames);
  const growthRate = BASE_GROWTH_RATE - (intervals * RATE_DECREMENT);
  return Math.max(0, growthRate);
}

// Will be expanded in Task 4
export function classifyEmotion({ delta, recentFalls = 0, stableSuccessSeconds = 0, framesSinceLastJump = 0 }) {
  if (delta >= 15 || (delta >= 8 && recentFalls >= 2)) return 'frustrated';
  if (framesSinceLastJump > 240) return 'bored';
  if (delta <= -15 && stableSuccessSeconds >= 3) return 'bored';
  return 'flow';
}

export function shouldHoldPreviousEmotion({ msSinceAdjustment }) {
  return msSinceAdjustment < 600;
}

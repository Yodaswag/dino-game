export function calculateChallenge({ gaps, speed }) {
  return (gaps * 5) + (speed * 5);
}

// Will be expanded in Task 4
export function classifyEmotion({ delta, recentFalls = 0, stableSuccessSeconds = 0 }) {
  if (delta >= 15 || (delta >= 8 && recentFalls >= 2)) return 'frustrated';
  if (delta <= -15 && stableSuccessSeconds >= 3) return 'bored';
  return 'flow';
}

export function shouldHoldPreviousEmotion({ msSinceAdjustment }) {
  return msSinceAdjustment < 600;
}

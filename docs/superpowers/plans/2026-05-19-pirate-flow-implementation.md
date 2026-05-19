# Pirate's Journey: Flow Designer Balancing and Delta-Time Independence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a machine-independent 60 FPS physics loop, dynamic recovery scaffolding (slower speed, safe landing platform, blinking invulnerability), and a mathematically sound learning rate decay model based on Flow Theory.

**Architecture:** We decouple physics and rendering using a delta-time accumulator inside the game loop, track non-flow frames to progressively decay skill growth rate, spawn guaranteed platforms during fall catapult recovery, and toggle rendering opacity for visual feedback.

**Tech Stack:** React, TailwindCSS, HTML5 Canvas, Vitest

---

### Task 1: Setup Tuning Constants & Initial State Variables

**Files:**
- Modify: [constants.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet%20/Semester%20Bet/GameBasedLearning/dino-game/src/game/constants.js)
- Modify: [createInitialGameState.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet%20/Semester%20Bet/GameBasedLearning/dino-game/src/game/createInitialGameState.js)

- [ ] **Step 1: Add new parameters to constants.js**
  Add configuration parameters for the stagnation model and failure learning bonus.
  ```javascript
  export const FLOW_WIN_SECONDS = 20;
  export const BAD_FAIL_SECONDS = 7;
  export const INITIAL_SKILL = 20;

  // Flow designer balancing variables
  export const BASE_GROWTH_RATE = 0.03;
  export const DECREMENT_INTERVAL_SECONDS = 0.3;
  export const RATE_DECREMENT = 0.005;
  export const LEARNING_BONUS = 0.5;
  ```

- [ ] **Step 2: Add trackers to createInitialGameState.js**
  Initialize `framesOutsideFlow` and the `forceSafePlatform` flag in the initial state object.
  ```javascript
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
  ```

- [ ] **Step 3: Commit changes**
  Run:
  ```bash
  git add src/game/constants.js src/game/createInitialGameState.js
  git commit -m "feat: add flow balancing constants and initial state trackers"
  ```

---

### Task 2: Dynamic Skill Growth Calculation & Unit Tests

**Files:**
- Modify: [difficultyModel.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/difficultyModel.js)
- Modify: [difficultyModel.test.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/difficultyModel.test.js)

- [ ] **Step 1: Implement calculateSkillGrowthRate in difficultyModel.js**
  Add the dynamic decay formula based on intervals of 18 frames (0.3 seconds at 60 FPS).
  ```javascript
  import { BASE_GROWTH_RATE, RATE_DECREMENT } from './constants.js';

  export function calculateChallenge({ gaps, speed }) {
    return (gaps * 5) + (speed * 5);
  }

  export function classifyEmotion({ delta, recentFalls = 0, stableSuccessSeconds = 0 }) {
    if (delta >= 15 || (delta >= 8 && recentFalls >= 2)) return 'frustrated';
    if (delta <= -15 && stableSuccessSeconds >= 3) return 'bored';
    return 'flow';
  }

  export function shouldHoldPreviousEmotion({ msSinceAdjustment }) {
    return msSinceAdjustment < 600;
  }

  export function calculateSkillGrowthRate({ framesOutsideFlow }) {
    const DECREMENT_INTERVAL_FRAMES = 18; // 0.3 seconds at 60 FPS
    const intervals = Math.floor(framesOutsideFlow / DECREMENT_INTERVAL_FRAMES);
    return Math.max(0, BASE_GROWTH_RATE - (intervals * RATE_DECREMENT));
  }
  ```

- [ ] **Step 2: Add test cases to difficultyModel.test.js**
  Add tests validating correct growth decay and boundary limits.
  ```javascript
  import { describe, it, expect } from 'vitest';
  import { classifyEmotion, shouldHoldPreviousEmotion, calculateSkillGrowthRate } from './difficultyModel.js';

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
        expect(calculateSkillGrowthRate({ framesOutsideFlow: 0 })).toBe(0.03);
      });

      it('decreases growth rate by 0.005 after 18 frames', () => {
        expect(calculateSkillGrowthRate({ framesOutsideFlow: 18 })).toBe(0.025);
      });

      it('decreases growth rate by 0.010 after 36 frames', () => {
        expect(calculateSkillGrowthRate({ framesOutsideFlow: 36 })).toBe(0.02);
      });

      it('clamps growth rate to 0.000 after 108 frames or more', () => {
        expect(calculateSkillGrowthRate({ framesOutsideFlow: 108 })).toBe(0.00);
        expect(calculateSkillGrowthRate({ framesOutsideFlow: 200 })).toBe(0.00);
      });
    });
  });
  ```

- [ ] **Step 3: Run Vitest and verify test execution**
  Run:
  ```powershell
  npx vitest run src
  ```
  Expected: All 21 tests pass successfully.

- [ ] **Step 4: Commit changes**
  Run:
  ```bash
  git add src/game/difficultyModel.js src/game/difficultyModel.test.js
  git commit -m "feat: implement dynamic skill growth rate and add unit tests"
  ```

---

### Task 3: Core Physics - Safety Scaffolding & Recovery Slow-Down

**Files:**
- Modify: [updateGameState.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/updateGameState.js)

- [ ] **Step 1: Update falling physics and platform generation in updateGameState.js**
  Remove the direct `-8` skill reduction penalty, apply `LEARNING_BONUS`, slower water speed on recovery, and force a safety landing platform.
  ```javascript
  import { FLOW_WIN_SECONDS, BAD_FAIL_SECONDS, LEARNING_BONUS } from './constants.js';

  export function updateGameState({ game, gaps, speed, emotion, challenge, canvasWidth }) {
    game.frame++;

    // Slow down game speed during recovery (force speed = 1)
    const activeSpeed = game.npc.recoveryTimer > 0 ? 1 : speed;
    const currentSpeed = 3 + (activeSpeed * 0.6);

    // Update clouds
    for (let c of game.clouds) {
      c.x -= c.speed * (currentSpeed * 0.5);
      if (c.x < -100) c.x = canvasWidth + 100;
    }

    // Update platforms
    let lastPlatform = game.platforms[game.platforms.length - 1];
    if (lastPlatform.x + lastPlatform.w < canvasWidth + 100) {
      const framesToHitWater = 12;
      const framesInAir = 38;
      const minGap = (currentSpeed * framesToHitWater) + 30;
      const maxGap = (currentSpeed * framesInAir) - 20;
      const gapMultiplier = (gaps - 1) / 9;
      
      let gapSize = minGap + (gapMultiplier * (maxGap - minGap)) + (Math.random() * 20);
      let platformWidth = 80 + Math.random() * (200 - (gaps * 10));

      // Safety Platform Scaffolding Trigger
      if (game.forceSafePlatform) {
        gapSize = 120; // Safe distance
        platformWidth = 350; // Extra long landing platform
        game.forceSafePlatform = false;
      }

      game.platforms.push({ x: lastPlatform.x + lastPlatform.w + gapSize, w: platformWidth, y: 160, type: 'crate' });
    }

    for (let i = game.platforms.length - 1; i >= 0; i--) {
      let p = game.platforms[i];
      p.x -= currentSpeed;
      if (p.x + p.w < -100) {
        game.platforms.splice(i, 1);
      }
    }

    // Update splashes
    for (let i = game.splashes.length - 1; i >= 0; i--) {
      let s = game.splashes[i];
      s.radius += 2.5;
      s.alpha -= 0.05;
      if (s.alpha <= 0) game.splashes.splice(i, 1);
    }

    // Update NPC
    let onPlatform = false;
    for (let p of game.platforms) {
      if (game.npc.x + 15 > p.x && game.npc.x - 15 < p.x + p.w) {
        onPlatform = true;
        break;
      }
    }

    game.npc.y += game.npc.vy;
    game.npc.vy += 0.6;

    if (onPlatform && game.npc.vy >= 0 && game.npc.y >= 160 && game.npc.y < 180) {
      game.npc.y = 160;
      game.npc.vy = 0;
      game.npc.isJumping = false;
    } else if (game.npc.y > 190) {
      game.npc.y = 190;
      game.npc.vy = -14;
      game.npc.isJumping = true;
      game.npc.recoveryTimer = 40;

      game.falls.push(Date.now());
      game.splashes.push({ x: game.npc.x, y: 190, radius: 5, alpha: 1 });

      // Apply learning bonus instead of penalty
      game.skill = Math.min(100, game.skill + LEARNING_BONUS);
      game.flowFrames = Math.max(0, game.flowFrames - 60);
      game.forceSafePlatform = true; // Request safety scaffolding

      const motivationalTexts = ["נפלת? קמים!", "זה חלק מהלמידה!", "לא נורא, נסה שוב!", "בים קורים דברים!", "ממשיכים קדימה!"];
      game.floatingTexts.push({
        text: motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)],
        x: game.npc.x,
        y: game.npc.y - 40,
        life: 90,
        alpha: 1
      });
    }

    if (game.npc.recoveryTimer > 0) {
      game.npc.recoveryTimer--;
    }

    // Update floating texts
    for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
      let ft = game.floatingTexts[i];
      ft.y -= 0.5;
      ft.life--;
      ft.alpha = ft.life / 60;
      if (ft.life <= 0) {
        game.floatingTexts.splice(i, 1);
      }
    }

    if (game.frame % 10 === 0) {
      const flowTimeInSeconds = game.flowFrames / 60;
      const badTimeInSeconds = game.badFrames / 60;

      if (flowTimeInSeconds >= FLOW_WIN_SECONDS) {
        game.status = 'won';
      } else if (badTimeInSeconds >= BAD_FAIL_SECONDS) {
        game.status = 'failed';
      }
    }
  }
  ```

- [ ] **Step 2: Commit changes**
  Run:
  ```bash
  git add src/game/updateGameState.js
  git commit -m "feat: implement safety platform and recovery speed overrides"
  ```

---

### Task 4: Clamped 60 FPS Game Loop & Dynamic Growth Integration

**Files:**
- Modify: [useGameLoop.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/hooks/useGameLoop.js)

- [ ] **Step 1: Restructure useGameLoop.js for 60 FPS frame clamping and rate tracking**
  Implement fixed physics step calculation using `performance.now()` accumulator.
  ```javascript
  import { useEffect, useRef } from 'react';
  import { updateGameState } from '../game/updateGameState.js';
  import { renderScene } from '../rendering/renderScene.js';
  import { calculateChallenge, classifyEmotion, shouldHoldPreviousEmotion, calculateSkillGrowthRate } from '../game/difficultyModel.js';

  export function useGameLoop({ canvasRef, isPlaying, gaps, speed, game, setUiState, uiState, assets, gameplayWidth = 800 }) {
    const prevControls = useRef({ gaps, speed });
    const lastFrameTime = useRef(0);
    const accumulator = useRef(0);

    useEffect(() => {
      if (prevControls.current.gaps !== gaps || prevControls.current.speed !== speed) {
        game.current.lastAdjustmentTime = Date.now();
        prevControls.current = { gaps, speed };
      }
    }, [gaps, speed, game]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let animationId;

      const render = (timestamp) => {
        if (!isPlaying || game.current.status !== 'playing') return;

        if (!lastFrameTime.current) {
          lastFrameTime.current = timestamp;
        }

        let delta = timestamp - lastFrameTime.current;
        lastFrameTime.current = timestamp;

        // Anti-spike clamp (e.g. background tab reactivation)
        if (delta > 100) delta = 16.67;

        accumulator.current += delta;
        const step = 16.67; // Fixed step at 60 FPS
        const g = game.current;

        // Perform fixed steps
        while (accumulator.current >= step) {
          const now = Date.now();
          const challenge = calculateChallenge({ gaps, speed });
          const diff = challenge - g.skill;

          g.falls = g.falls.filter(t => now - t < 10000);
          const recentFalls = g.falls.length;
          const stableSuccessSeconds = (now - (g.falls[g.falls.length - 1] || 0)) / 1000;

          const newEmotion = classifyEmotion({ delta: diff, recentFalls, stableSuccessSeconds });
          const hold = shouldHoldPreviousEmotion({ msSinceAdjustment: now - g.lastAdjustmentTime });
          
          if (!g.currentEmotion) g.currentEmotion = 'flow';
          if (!hold) {
            g.currentEmotion = newEmotion;
          }

          const emotion = g.currentEmotion;

          if (emotion === 'flow') {
            g.flowFrames++;
            g.badFrames = Math.max(0, g.badFrames - 1);
            g.framesOutsideFlow = 0; // Reset stagnation tracking
          } else {
            g.badFrames++;
            g.flowFrames = Math.max(0, g.flowFrames - 0.5);
            g.framesOutsideFlow++; // Accumulate outside of flow frames
          }

          // Dynamic growth decay rate based on flow theory
          const currentGrowthRate = calculateSkillGrowthRate({ framesOutsideFlow: g.framesOutsideFlow });
          g.skill = Math.min(100, g.skill + currentGrowthRate);

          updateGameState({ game: g, gaps, speed, emotion, challenge, canvasWidth: gameplayWidth });

          if (g.frame % 10 === 0) {
            setUiState(prev => ({
              ...prev,
              skill: g.skill,
              challenge: challenge,
              emotion: emotion,
              flowTime: g.flowFrames / 60,
              badTime: g.badFrames / 60,
              status: g.status
            }));
          }

          accumulator.current -= step;
        }

        const emotion = g.currentEmotion || 'flow';
        renderScene({ ctx, canvas, gameState: g, uiState: { ...uiState, emotion, flowTime: g.flowFrames / 60 }, assets });

        animationId = requestAnimationFrame(render);
      };

      if (isPlaying) {
        lastFrameTime.current = 0;
        accumulator.current = 0;
        animationId = requestAnimationFrame(render);
      }

      return () => cancelAnimationFrame(animationId);
    }, [isPlaying, gaps, speed, game, setUiState, uiState, assets, gameplayWidth]);
  }
  ```

- [ ] **Step 2: Commit changes**
  Run:
  ```bash
  git add src/hooks/useGameLoop.js
  git commit -m "feat: implement 60 FPS fixed physics accumulator and skill growth rate integration"
  ```

---

### Task 5: Flashing Invulnerability Render Effect

**Files:**
- Modify: [renderScene.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/rendering/renderScene.js)

- [ ] **Step 1: Implement blinking opacity effect in renderScene.js**
  Alternate pirate's alpha opacity using alternating frames when recovery timer is active.
  ```javascript
  // Change inside renderScene (around lines 140-150):
  if (pirateAsset) {
    ctx.save();
    ctx.translate(pirateCenterX, pirateCenterY);

    // Flashing invulnerability blink pattern (every 4 frames)
    if (npc.recoveryTimer > 0) {
      if (Math.floor(frame / 4) % 2 === 0) {
        ctx.globalAlpha = 0.25;
      } else {
        ctx.globalAlpha = 0.90;
      }
    }

    if (npc.isJumping) {
      ctx.rotate((npc.vy * 2 * Math.PI) / 180);
    }

    ctx.drawImage(
      pirateAsset,
      -pirateRect.width / 2,
      -pirateRect.height / 2,
      pirateRect.width,
      pirateRect.height,
    );
    ctx.restore();
  }
  ```

- [ ] **Step 2: Commit changes**
  Run:
  ```bash
  git add src/rendering/renderScene.js
  git commit -m "feat: add flashing invulnerability blinking render effect"
  ```

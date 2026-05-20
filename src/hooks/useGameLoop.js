import { useEffect, useRef } from 'react';
import { updateGameState } from '../game/updateGameState.js';
import { renderScene } from '../rendering/renderScene.js';
import { calculateChallenge, classifyEmotion, shouldHoldPreviousEmotion, calculateSkillGrowthRate } from '../game/difficultyModel.js';

export function useGameLoop({ canvasRef, isPlaying, gaps, speed, game, setUiState, uiState, assets, gameplayWidth = 800 }) {
  const prevControls = useRef({ gaps, speed });

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
    let lastTime = performance.now();
    let accumulator = 0;
    const timestep = 1000 / 60; // Fixed 16.67ms timestep for 60 FPS clamping

    const render = (time = performance.now()) => {
      if (!isPlaying || game.current.status !== 'playing') {
        lastTime = performance.now();
        accumulator = 0;
        return;
      }

      const dt = time - lastTime;
      lastTime = time;

      // Prevent spiral of death by capping maximum frame processing time
      accumulator += Math.min(dt, 250);

      const g = game.current;
      const challenge = calculateChallenge({ gaps, speed });
      let stateChanged = false;

      while (accumulator >= timestep) {
        const now = Date.now();
        const diff = challenge - g.skill;

        g.falls = g.falls.filter(t => now - t < 10000);
        const recentFalls = g.falls.length;
        const stableSuccessSeconds = (now - (g.falls[g.falls.length - 1] || 0)) / 1000;

        const newEmotion = classifyEmotion({ delta: diff, recentFalls, stableSuccessSeconds, framesSinceLastJump: g.framesSinceLastJump });
        const hold = shouldHoldPreviousEmotion({ msSinceAdjustment: now - g.lastAdjustmentTime });

        if (!g.currentEmotion) g.currentEmotion = 'flow';
        if (!hold) {
          g.currentEmotion = newEmotion;
        }

        const emotion = g.currentEmotion;

        if (emotion === 'flow') {
          g.flowFrames++;
          g.badFrames = Math.max(0, g.badFrames - 1);
          g.framesOutsideFlow = 0; // Reset outside flow frame tracker
        } else {
          g.badFrames++;
          g.flowFrames = Math.max(0, g.flowFrames - 0.5);
          g.framesOutsideFlow++; // Increment stagnation tracker
        }

        // Apply dynamic skill growth rate based on time spent outside flow
        const currentGrowthRate = calculateSkillGrowthRate({ framesOutsideFlow: g.framesOutsideFlow, framesSinceLastJump: g.framesSinceLastJump });
        g.skill = Math.min(100, g.skill + currentGrowthRate);

        updateGameState({ game: g, gaps, speed, emotion, challenge, canvasWidth: gameplayWidth });

        if (g.frame % 10 === 0) {
          stateChanged = true;
        }

        accumulator -= timestep;
      }

      if (stateChanged) {
        setUiState({
          skill: g.skill,
          challenge: challenge,
          emotion: g.currentEmotion,
          flowTime: g.flowFrames / 60,
          badTime: g.badFrames / 60,
          status: g.status
        });
      }

      renderScene({
        ctx,
        canvas,
        gameState: g,
        uiState: { ...uiState, emotion: g.currentEmotion, flowTime: g.flowFrames / 60 },
        assets
      });

      animationId = requestAnimationFrame(render);
    };

    if (isPlaying) {
      lastTime = performance.now();
      accumulator = 0;
      animationId = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, gaps, speed, game, setUiState, uiState, assets, gameplayWidth]);
}


import { useEffect, useRef } from 'react';
import { updateGameState } from '../game/updateGameState.js';
import { renderScene } from '../rendering/renderScene.js';
import { calculateChallenge, classifyEmotion, shouldHoldPreviousEmotion } from '../game/difficultyModel.js';

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

    const render = () => {
      if (!isPlaying || game.current.status !== 'playing') return;

      const g = game.current;
      const now = Date.now();

      const challenge = calculateChallenge({ gaps, speed });
      const diff = challenge - g.skill;

      g.falls = g.falls.filter(t => now - t < 10000);
      const recentFalls = g.falls.length;
      const stableSuccessSeconds = (now - (g.falls[g.falls.length - 1] || 0)) / 1000;

      const newEmotion = classifyEmotion({ delta: diff, recentFalls, stableSuccessSeconds });
      const hold = shouldHoldPreviousEmotion({ msSinceAdjustment: now - g.lastAdjustmentTime });
      
      // Store current visual emotion in game state to persist it across frames without relying on React state closure
      if (!g.currentEmotion) g.currentEmotion = 'flow';
      
      if (!hold) {
        g.currentEmotion = newEmotion;
      }

      const emotion = g.currentEmotion;

      if (emotion === 'flow') {
        g.flowFrames++;
        g.badFrames = Math.max(0, g.badFrames - 1);
      } else {
        g.badFrames++;
        g.flowFrames = Math.max(0, g.flowFrames - 0.5);
      }
      g.skill = Math.min(100, g.skill + 0.03);

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

      renderScene({ ctx, canvas, gameState: g, uiState: { ...uiState, emotion, flowTime: g.flowFrames / 60 }, assets });

      animationId = requestAnimationFrame(render);
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, gaps, speed, game, setUiState, uiState, assets, gameplayWidth]);
}

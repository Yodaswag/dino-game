import { FLOW_WIN_SECONDS, BAD_FAIL_SECONDS, LEARNING_BONUS } from './constants.js';

export function updateGameState({ game, gaps, speed, emotion, challenge, canvasWidth }) {
  game.frame++;

  let effectiveSpeed = speed;
  if (game.npc && game.npc.recoveryTimer > 0) {
    effectiveSpeed = 1;
  }
  const currentSpeed = 3 + (effectiveSpeed * 0.6);

  // Update clouds
  for (let c of game.clouds) {
    c.x -= c.speed * (currentSpeed * 0.5);
    if (c.x < -100) c.x = canvasWidth + 100;
  }

  // Update platforms
  let lastPlatform = game.platforms[game.platforms.length - 1];
  if (lastPlatform.x + lastPlatform.w < canvasWidth + 100) {
    let gapSize;
    let platformWidth;
    if (game.forceSafePlatform) {
      gapSize = 120;
      platformWidth = 350;
      game.forceSafePlatform = false;
    } else {
      const framesToHitWater = 12;
      const framesInAir = 38;
      const minGap = (currentSpeed * framesToHitWater) + 30;
      const maxGap = (currentSpeed * framesInAir) - 20;
      const gapMultiplier = (gaps - 1) / 9;
      gapSize = minGap + (gapMultiplier * (maxGap - minGap)) + (Math.random() * 20);
      platformWidth = 80 + Math.random() * (200 - (gaps * 10));
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

    // Positive reinforcement instead of penalty, and trigger safety scaffolding.
    game.skill = Math.min(100, game.skill + LEARNING_BONUS);
    game.forceSafePlatform = true;
    game.flowFrames = Math.max(0, game.flowFrames - 60);

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

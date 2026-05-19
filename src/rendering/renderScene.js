import {
  SCENE_SIZE,
  getIndicatorAssetKey,
  getSceneLayout,
  getScenePalette,
} from './sceneLayout.js';

const GAMEPLAY_SIZE = { width: 800 };
const GAMEPLAY_PLATFORM_Y = 160;
const GAMEPLAY_WAVE_Y = 188;

export function getSceneViewport(canvas) {
  const scale = Math.min(canvas.width / SCENE_SIZE.width, canvas.height / SCENE_SIZE.height);
  const width = SCENE_SIZE.width * scale;
  const height = SCENE_SIZE.height * scale;

  return {
    scale,
    width,
    height,
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2,
  };
}

export function getPirateSceneCenterX(gameplayX) {
  return (gameplayX / GAMEPLAY_SIZE.width) * SCENE_SIZE.width;
}

export function clipToSceneBounds(ctx) {
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_SIZE.width, SCENE_SIZE.height);
  ctx.clip();
}

function getPirateVariant(emotion, flowTime) {
  if (emotion === 'frustrated') return 'frustrated';
  if (emotion === 'bored') return 'bored';
  if (emotion === 'flow' && flowTime >= 15) return 'inFlow';
  return 'normal';
}

export function renderScene({ ctx, canvas, gameState, uiState, assets }) {
  const { emotion, flowTime } = uiState;
  const { frame, platforms, npc, splashes, floatingTexts } = gameState;
  const layout = getSceneLayout(assets);
  const palette = getScenePalette(emotion);
  const indicatorAsset = assets[getIndicatorAssetKey(emotion)];
  const xScale = SCENE_SIZE.width / GAMEPLAY_SIZE.width;
  const yScale =
    (layout.waveBand.y - layout.platformBand.y) / (GAMEPLAY_WAVE_Y - GAMEPLAY_PLATFORM_Y);
  const toSceneX = (x) => x * xScale;
  const toSceneY = (y) => layout.platformBand.y + (y - GAMEPLAY_PLATFORM_Y) * yScale;
  const viewport = getSceneViewport(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.scale, viewport.scale);
  clipToSceneBounds(ctx);

  // Base scene mood layers.
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, SCENE_SIZE.width, SCENE_SIZE.height);

  if (assets.backgroundTexture) {
    ctx.globalAlpha = 0.22;
    ctx.drawImage(assets.backgroundTexture, 0, 0, SCENE_SIZE.width, SCENE_SIZE.height);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = palette.wash;
  ctx.fillRect(0, 0, SCENE_SIZE.width, SCENE_SIZE.height);

  if (indicatorAsset) {
    ctx.drawImage(
      indicatorAsset,
      layout.indicatorBand.x,
      layout.indicatorBand.y,
      layout.indicatorBand.width,
      layout.indicatorBand.height,
    );
  }

  if (assets.skyDetails) {
    ctx.drawImage(
      assets.skyDetails,
      layout.skyDetails.x,
      layout.skyDetails.y,
      layout.skyDetails.width,
      layout.skyDetails.height,
    );
  }

  const shipRect = flowTime >= 15 ? layout.ship.large : layout.ship.small;
  if (flowTime >= 10 && assets.ship) {
    const shipProgress = Math.min(1, Math.max(0, (flowTime - 10) / 10));
    const shipX = SCENE_SIZE.width - shipProgress * (SCENE_SIZE.width - shipRect.x);

    ctx.drawImage(
      assets.ship,
      shipX,
      shipRect.y + Math.sin(frame / 20) * 4,
      shipRect.width,
      shipRect.height,
    );
  }

  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];
    const platformX = toSceneX(platform.x);
    const platformWidth = toSceneX(platform.w);

    if (assets.platform) {
      ctx.drawImage(
        assets.platform,
        platformX,
        layout.platformBand.y,
        platformWidth,
        layout.platformBand.height,
      );
    } else {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(platformX, layout.platformBand.y, platformWidth, layout.platformBand.height);
    }
  }

  const pirateVariant = getPirateVariant(emotion, flowTime);
  const pirateAsset = {
    normal: assets.pirateNormal,
    frustrated: assets.pirateFrustrated ?? assets.pirateNormal,
    bored: assets.pirateBored ?? assets.pirateNormal,
    inFlow: assets.pirateInFlow ?? assets.pirateNormal,
  }[pirateVariant];
  const pirateRect = layout.pirate[pirateVariant];
  const pirateY = pirateRect.y + (toSceneY(npc.y) - layout.platformBand.y);
  const pirateCenterX = getPirateSceneCenterX(npc.x);
  const pirateCenterY = pirateY + pirateRect.height / 2;

  if (pirateAsset) {
    ctx.save();
    ctx.translate(pirateCenterX, pirateCenterY);

    if (npc.recoveryTimer > 0 && Math.floor(frame / 4) % 2 === 0) {
      ctx.globalAlpha = 0.3;
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

  if (assets.waves) {
    const waveSpeed = emotion === 'frustrated' ? 10 : emotion === 'bored' ? 30 : 20;
    const waveOffset = -((frame * (20 / waveSpeed)) % SCENE_SIZE.width);
    const waveY = layout.waveBand.y + Math.sin(frame / 10) * 5;
    const tileWidth = SCENE_SIZE.width + 2;

    ctx.drawImage(assets.waves, waveOffset, waveY, tileWidth, layout.waveBand.height);
    ctx.drawImage(
      assets.waves,
      waveOffset + SCENE_SIZE.width - 2,
      waveY,
      tileWidth,
      layout.waveBand.height,
    );
  } else {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(
      layout.waveBand.x,
      layout.waveBand.y,
      layout.waveBand.width,
      layout.waveBand.height,
    );
  }

  for (let i = splashes.length - 1; i >= 0; i--) {
    const splash = splashes[i];
    ctx.beginPath();
    ctx.arc(toSceneX(splash.x), toSceneY(splash.y), splash.radius * xScale, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, splash.alpha)})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const floatingText = floatingTexts[i];
    ctx.fillStyle = `rgba(30, 64, 175, ${Math.min(1, floatingText.alpha)})`;
    ctx.font = 'bold 26px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(floatingText.text, toSceneX(floatingText.x), toSceneY(floatingText.y));
  }

  ctx.restore();
}

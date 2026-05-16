export function renderScene({ ctx, canvas, gameState, uiState, assets }) {
  const { emotion, flowTime } = uiState;
  const { frame, platforms, npc, splashes, floatingTexts } = gameState;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  if (assets.backgroundTexture) {
    ctx.drawImage(assets.backgroundTexture, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Sky Details
  if (assets.skyDetails) {
    // Parallax scrolling for sky details
    const skyX = -(frame * 0.5) % canvas.width;
    ctx.drawImage(assets.skyDetails, skyX, 0, canvas.width, 100);
    ctx.drawImage(assets.skyDetails, skyX + canvas.width, 0, canvas.width, 100);
  }

  // Ship
  if (flowTime >= 10 && assets.ship) {
    const shipProgress = Math.min(1, Math.max(0, (flowTime - 10) / 10));
    const shipX = canvas.width - (shipProgress * 250);
    const shipY = 120 + Math.sin(frame / 20) * 3;
    ctx.drawImage(assets.ship, shipX, shipY, 120, 100);
  }

  // Platforms
  for (let i = platforms.length - 1; i >= 0; i--) {
    let p = platforms[i];
    if (assets.platform) {
      // Tile or stretch platform image
      ctx.drawImage(assets.platform, p.x, p.y, p.w, 60);
    } else {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(p.x, p.y, p.w, 40);
    }
  }

  // Waves
  if (assets.waves) {
    // Parallax and wavy movement
    let waveSpeed = emotion === 'frustrated' ? 10 : emotion === 'bored' ? 30 : 20;
    const waveX = -(frame * (20 / waveSpeed)) % canvas.width;
    const waveY = 170 + Math.sin(frame / 10) * 5;
    ctx.drawImage(assets.waves, waveX, waveY, canvas.width, 60);
    ctx.drawImage(assets.waves, waveX + canvas.width, waveY, canvas.width, 60);
  } else {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 185, canvas.width, 100);
  }

  // Splashes
  for (let i = splashes.length - 1; i >= 0; i--) {
    let s = splashes[i];
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, s.alpha)})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // NPC
  ctx.save();
  ctx.translate(npc.x, npc.y);

  if (npc.recoveryTimer > 0) {
    if (npc.recoveryTimer % 10 < 5) {
      ctx.globalAlpha = 0.5;
    }
  }

  if (npc.isJumping) {
    ctx.rotate((npc.vy * 2 * Math.PI) / 180);
  }

  let pirateImg = assets.pirateNormal;
  if (emotion === 'frustrated') pirateImg = assets.pirateFrustrated;
  else if (emotion === 'bored') pirateImg = assets.pirateBored;
  else if (emotion === 'flow' && flowTime >= 15) pirateImg = assets.pirateInFlow;

  if (pirateImg) {
    ctx.drawImage(pirateImg, -20, -30, 40, 40);
  }

  ctx.restore();

  // Floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ctx.fillStyle = `rgba(30, 64, 175, ${Math.min(1, ft.alpha)})`;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
}

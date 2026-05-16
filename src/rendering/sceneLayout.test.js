import { describe, expect, it } from 'vitest';
import {
  SCENE_SIZE,
  fitByHeight,
  getIndicatorAssetKey,
  getSceneLayout,
  getScenePalette,
} from './sceneLayout.js';
import {
  clipToSceneBounds,
  getPirateSceneCenterX,
  getSceneViewport,
  renderScene,
} from './renderScene.js';

describe('sceneLayout', () => {
  it('uses a 16:9 authored stage', () => {
    expect(SCENE_SIZE).toEqual({ width: 1280, height: 720 });
  });

  it('maps emotions to concept palettes and indicator assets', () => {
    expect(getScenePalette('normal')).toEqual({
      sky: '#FEFCF8',
      wash: 'rgba(222, 228, 228, 0.18)',
    });
    expect(getScenePalette('flow')).toEqual({
      sky: '#ECFFF2',
      wash: 'rgba(186, 255, 202, 0.24)',
    });
    expect(getScenePalette('frustrated')).toEqual({
      sky: '#FCE9E6',
      wash: 'rgba(242, 202, 153, 0.2)',
    });
    expect(getScenePalette('bored')).toEqual(getScenePalette('frustrated'));
    expect(getScenePalette('unknown')).toEqual(getScenePalette('normal'));

    expect(getIndicatorAssetKey('flow')).toBe('indicatorGood');
    expect(getIndicatorAssetKey('frustrated')).toBe('indicatorBad');
    expect(getIndicatorAssetKey('bored')).toBe('indicatorBad');
    expect(getIndicatorAssetKey('normal')).toBe('indicatorNormal');
  });

  it('uses neutral indicator art outside active emotional states', () => {
    expect(getIndicatorAssetKey('normal')).toBe('indicatorNormal');
    expect(getIndicatorAssetKey(undefined)).toBe('indicatorNormal');
  });

  it('fits assets by height while preserving natural aspect ratio', () => {
    expect(fitByHeight({ width: 1253, height: 648 }, 162)).toEqual({
      width: 313.25,
      height: 162,
    });
  });

  it('places key layers in concept-like bands', () => {
    const layout = getSceneLayout({
      skyDetails: { width: 1253, height: 648 },
      pirateNormal: { width: 780, height: 742 },
      pirateFrustrated: { width: 680, height: 742 },
      pirateBored: { width: 580, height: 742 },
      pirateInFlow: { width: 480, height: 742 },
      ship: { width: 929, height: 890 },
    });

    expect(layout.skyDetails).toEqual({ x: 42, y: 38, width: 313.25, height: 162 });
    expect(layout.indicatorBand).toEqual({ x: 0, y: 260, width: SCENE_SIZE.width, height: 330 });
    expect(layout.platformBand).toEqual({ y: 610, height: 110 });
    expect(layout.pirate.normal).toEqual({
      x: 52,
      y: 470,
      width: (780 / 742) * 190,
      height: 190,
    });
    expect(layout.ship.small).toEqual({
      x: 900,
      y: 430,
      width: (929 / 890) * 170,
      height: 170,
    });
    expect(layout.ship.large).toEqual({
      x: 760,
      y: 320,
      width: (929 / 890) * 330,
      height: 330,
    });
    expect(layout.waveBand).toEqual({ x: 0, y: 648, width: SCENE_SIZE.width, height: 88 });
  });

  it('supports the minimal required asset contract', () => {
    const layout = getSceneLayout({
      skyDetails: { width: 1253, height: 648 },
      pirateNormal: { width: 780, height: 742 },
      ship: { width: 929, height: 890 },
    });

    expect(layout.pirate).toEqual({
      normal: { x: 52, y: 470, width: (780 / 742) * 190, height: 190 },
      frustrated: { x: 52, y: 470, width: (780 / 742) * 190, height: 190 },
      bored: { x: 52, y: 470, width: (780 / 742) * 190, height: 190 },
      inFlow: { x: 52, y: 470, width: (780 / 742) * 190, height: 190 },
    });
  });

  it('fits each pirate variant from its own natural aspect ratio', () => {
    const layout = getSceneLayout({
      skyDetails: { width: 1253, height: 648 },
      pirateNormal: { width: 780, height: 742 },
      pirateFrustrated: { width: 640, height: 800 },
      pirateBored: { width: 900, height: 600 },
      pirateInFlow: { width: 500, height: 1000 },
      ship: { width: 929, height: 890 },
    });

    expect(layout.pirate).toEqual({
      normal: { x: 52, y: 470, width: (780 / 742) * 190, height: 190 },
      frustrated: { x: 52, y: 470, width: (640 / 800) * 190, height: 190 },
      bored: { x: 52, y: 470, width: (900 / 600) * 190, height: 190 },
      inFlow: { x: 52, y: 470, width: (500 / 1000) * 190, height: 190 },
    });
  });

  it('contains the authored scene inside non-16:9 canvases without distortion', () => {
    const viewport = getSceneViewport({ width: 800, height: 220 });

    expect(viewport.scale).toBeCloseTo(220 / SCENE_SIZE.height);
    expect(viewport.width).toBeCloseTo((220 / SCENE_SIZE.height) * SCENE_SIZE.width);
    expect(viewport.height).toBeCloseTo(220);
    expect(viewport.x).toBeCloseTo((800 - viewport.width) / 2);
    expect(viewport.y).toBeCloseTo(0);
  });

  it('maps pirate center x from gameplay coordinates into scene space', () => {
    expect(getPirateSceneCenterX(0)).toBe(0);
    expect(getPirateSceneCenterX(150)).toBe(240);
    expect(getPirateSceneCenterX(800)).toBe(SCENE_SIZE.width);
  });

  it('clips drawing to the authored scene bounds', () => {
    const calls = [];
    const ctx = {
      beginPath: () => calls.push(['beginPath']),
      rect: (...args) => calls.push(['rect', ...args]),
      clip: () => calls.push(['clip']),
    };

    clipToSceneBounds(ctx);

    expect(calls).toEqual([
      ['beginPath'],
      ['rect', 0, 0, SCENE_SIZE.width, SCENE_SIZE.height],
      ['clip'],
    ]);
  });

  it('clips the authored scene during render after applying the viewport transform', () => {
    const calls = [];
    const ctx = {
      clearRect: (...args) => calls.push(['clearRect', ...args]),
      save: () => calls.push(['save']),
      translate: (...args) => calls.push(['translate', ...args]),
      scale: (...args) => calls.push(['scale', ...args]),
      beginPath: () => calls.push(['beginPath']),
      rect: (...args) => calls.push(['rect', ...args]),
      clip: () => calls.push(['clip']),
      fillRect: (...args) => calls.push(['fillRect', ...args]),
      drawImage: (...args) => calls.push(['drawImage', ...args]),
      restore: () => calls.push(['restore']),
    };

    renderScene({
      ctx,
      canvas: { width: 800, height: 220 },
      gameState: {
        frame: 0,
        platforms: [],
        npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
        splashes: [],
        floatingTexts: [],
      },
      uiState: { emotion: 'normal', flowTime: 0 },
      assets: {
        skyDetails: { width: 1253, height: 648 },
        pirateNormal: { width: 780, height: 742 },
        ship: { width: 929, height: 890 },
      },
    });

    expect(calls.slice(1, 7).map(([name]) => name)).toEqual([
      'save',
      'translate',
      'scale',
      'beginPath',
      'rect',
      'clip',
    ]);
    expect(calls[2][1]).toBeCloseTo((800 - (220 / SCENE_SIZE.height) * SCENE_SIZE.width) / 2);
    expect(calls[2][2]).toBeCloseTo(0);
    expect(calls[3].slice(1)).toEqual([220 / SCENE_SIZE.height, 220 / SCENE_SIZE.height]);
    expect(calls[5]).toEqual(['rect', 0, 0, SCENE_SIZE.width, SCENE_SIZE.height]);
    expect(calls[6]).toEqual(['clip']);
  });
});

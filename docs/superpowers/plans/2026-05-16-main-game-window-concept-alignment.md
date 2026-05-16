# Main Game Window Concept Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the main game window fill its allotted width and render the supplied `flow-game` artwork with the same composition, proportions, and state-driven color language shown in the concept art.

**Architecture:** Keep gameplay mechanics in existing coordinates, but enlarge the authored stage to a 16:9 scene and scale it responsively through CSS instead of shrinking art into the old shallow strip. Move visual composition rules into focused renderer helpers so asset rectangles, state colors, and render order stay explicit and testable. Keep React responsible for sizing/layout, while canvas code owns scene layering.

**Tech Stack:** React, Vite, JavaScript ES modules, HTML canvas, CSS, Vitest.

---

## Concept Interpretation

- `flow-indicator-*.png` is not a tiny status icon. It is the large background landform layer that changes with state: blue/neutral, red-bad, green-good.
- Scene mood changes through two synchronized layers:
  - paper-texture sky base tinted by emotion
  - matching `flow-indicator` background art
- `sun-clouds-birds.png` stays in the upper-left at one stable scale, preserving the artwork's original proportions and transparent negative space.
- `sand-pile-platforms.png` forms the playable dunes above the waterline.
- `waves.png` is the foreground strip, spanning the full width and masking the dune bottoms.
- Pirate and ship must read as illustrations, not icons:
  - pirate visibly large on the left-side dune
  - ship grows from distant reward to dominant flow reward on the right
- Palette source of truth from `FlowGameAssets/Color Pallete.png`:
  - red `#BF3F4A`
  - deep blue `#1462A6`
  - light blue `#368ABF`
  - pale yellow `#F2DC99`
  - peach `#F2CA99`
  - dark brown `#241B19`
  - sand `#E6B981`
  - ivory `#FDFCF8`
  - mist `#DEE4E4`
  - off-white `#FEFCF8`

## Target File Structure

```text
src/
|-- App.jsx
|-- rendering/
|   |-- renderScene.js
|   |-- sceneLayout.js
|   +-- sceneLayout.test.js
|-- styles/
|   +-- layout.css
```

## Render Contract

```text
paper texture sky
-> emotional sky wash
-> state-specific flow-indicator background layer
-> sun/clouds/birds
-> ship
-> dune platforms
-> pirate
-> foreground waves
-> splash/text effects
```

## Acceptance Criteria

- Main game window consumes `100%` of available card width.
- Stage displays at `16:9`, not the current compressed panorama ratio.
- `flow-indicator-normal/good/bad.png` spans the scene as the background landform layer.
- Scene sky wash and flow-indicator art change together for `normal`, `frustrated`/`bored`, and `flow`.
- `sun-clouds-birds.png` appears top-left with stable aspect ratio, no giant stretching, no tiling.
- Pirate, ship, dunes, and waves use authored proportions close to concept art, not tiny placeholder sizing.
- Existing gameplay remains playable after visual changes.
- Unit tests cover scene geometry and asset-fit helpers.

## File Responsibilities

- `src/rendering/sceneLayout.js`: pure constants/helpers for stage size, state palette, and proportional asset rectangles.
- `src/rendering/sceneLayout.test.js`: regression tests for geometry, aspect-ratio fitting, and state-art selection.
- `src/rendering/renderScene.js`: draw concept-faithful layers using helper output.
- `src/App.jsx`: make canvas responsive full-width, import layout styles.
- `src/styles/layout.css`: stage wrapper and responsive canvas rules.

## Task 1: Add Testable Scene Geometry Helpers

**Files:**
- Create: `src/rendering/sceneLayout.js`
- Create: `src/rendering/sceneLayout.test.js`

- [x] **Step 1: Write failing tests for stage sizing, state selection, and aspect-ratio fitting**

```js
import { describe, expect, it } from 'vitest';
import {
  SCENE_SIZE,
  getScenePalette,
  getIndicatorAssetKey,
  fitByHeight,
  getSceneLayout,
} from './sceneLayout.js';

describe('sceneLayout', () => {
  it('uses a 16:9 authored stage', () => {
    expect(SCENE_SIZE).toEqual({ width: 1280, height: 720 });
  });

  it('maps emotion to matching palette and indicator asset', () => {
    expect(getScenePalette('flow').sky).toBe('#ECFFF2');
    expect(getScenePalette('frustrated').sky).toBe('#FCE9E6');
    expect(getIndicatorAssetKey('bored')).toBe('indicatorBad');
    expect(getIndicatorAssetKey('flow')).toBe('indicatorGood');
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
      ship: { width: 929, height: 890 },
    });

    expect(layout.skyDetails).toMatchObject({ x: 42, y: 38, height: 162 });
    expect(layout.pirate.height).toBe(190);
    expect(layout.ship.large.height).toBe(330);
    expect(layout.waveBand.y).toBe(648);
  });
});
```

- [x] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- src/rendering/sceneLayout.test.js`

Expected: FAIL because `sceneLayout.js` does not exist.

- [x] **Step 3: Implement the helper module**

```js
export const SCENE_SIZE = { width: 1280, height: 720 };

const PALETTES = {
  normal: { sky: '#FEFCF8', wash: 'rgba(222, 228, 228, 0.18)' },
  flow: { sky: '#ECFFF2', wash: 'rgba(186, 255, 202, 0.24)' },
  bad: { sky: '#FCE9E6', wash: 'rgba(242, 202, 153, 0.2)' },
};

export function getScenePalette(emotion) {
  if (emotion === 'flow') return PALETTES.flow;
  if (emotion === 'frustrated' || emotion === 'bored') return PALETTES.bad;
  return PALETTES.normal;
}

export function getIndicatorAssetKey(emotion) {
  if (emotion === 'flow') return 'indicatorGood';
  if (emotion === 'frustrated' || emotion === 'bored') return 'indicatorBad';
  return 'indicatorNormal';
}

export function fitByHeight(asset, height) {
  return {
    width: (asset.width / asset.height) * height,
    height,
  };
}

export function getSceneLayout(assets) {
  const skyDetailsSize = fitByHeight(assets.skyDetails, 162);
  const pirateSize = fitByHeight(assets.pirateNormal, 190);
  const largeShipSize = fitByHeight(assets.ship, 330);
  const smallShipSize = fitByHeight(assets.ship, 170);

  return {
    skyDetails: { x: 42, y: 38, ...skyDetailsSize },
    indicatorBand: { x: 0, y: 260, width: 1280, height: 330 },
    platformBand: { y: 610, height: 110 },
    pirate: { x: 52, y: 470, ...pirateSize },
    ship: {
      small: { x: 900, y: 430, ...smallShipSize },
      large: { x: 760, y: 320, ...largeShipSize },
    },
    waveBand: { x: 0, y: 648, width: 1280, height: 88 },
  };
}
```

- [x] **Step 4: Re-run focused test**

Run: `npm test -- src/rendering/sceneLayout.test.js`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/rendering/sceneLayout.js src/rendering/sceneLayout.test.js
git commit -m "test: define concept scene layout contract"
```

## Task 2: Render Concept-Faithful Scene Layers

**Files:**
- Modify: `src/rendering/renderScene.js`
- Test: `src/rendering/sceneLayout.test.js`

- [x] **Step 1: Extend helper test with explicit asset-state intent**

```js
it('uses neutral indicator art outside active emotional states', () => {
  expect(getIndicatorAssetKey('normal')).toBe('indicatorNormal');
  expect(getIndicatorAssetKey(undefined)).toBe('indicatorNormal');
});
```

- [x] **Step 2: Run the focused test**

Run: `npm test -- src/rendering/sceneLayout.test.js`

Expected: PASS before renderer change, proving helper contract stable.

- [x] **Step 3: Replace compressed draw logic with concept layer order**

```js
import {
  SCENE_SIZE,
  getIndicatorAssetKey,
  getSceneLayout,
  getScenePalette,
} from './sceneLayout.js';

export function renderScene({ ctx, canvas, gameState, uiState, assets }) {
  const { emotion, flowTime } = uiState;
  const { frame, platforms, npc, splashes, floatingTexts } = gameState;
  const layout = getSceneLayout(assets);
  const palette = getScenePalette(emotion);
  const indicatorAsset = assets[getIndicatorAssetKey(emotion)];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / SCENE_SIZE.width, canvas.height / SCENE_SIZE.height);

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
```

Continue same function with:

```js
  const shipRect = flowTime >= 15 ? layout.ship.large : layout.ship.small;
  if (flowTime >= 10 && assets.ship) {
    ctx.drawImage(assets.ship, shipRect.x, shipRect.y + Math.sin(frame / 20) * 4, shipRect.width, shipRect.height);
  }

  for (const platform of platforms) {
    if (assets.platform) {
      ctx.drawImage(assets.platform, platform.x, layout.platformBand.y, platform.w, layout.platformBand.height);
    }
  }

  const pirateAsset =
    emotion === 'frustrated'
      ? assets.pirateFrustrated
      : emotion === 'bored'
        ? assets.pirateBored
        : emotion === 'flow' && flowTime >= 15
          ? assets.pirateInFlow
          : assets.pirateNormal;

  if (pirateAsset) {
    ctx.drawImage(pirateAsset, layout.pirate.x, layout.pirate.y, layout.pirate.width, layout.pirate.height);
  }

  if (assets.waves) {
    const waveOffset = -((frame * 2) % SCENE_SIZE.width);
    ctx.drawImage(assets.waves, waveOffset, layout.waveBand.y, SCENE_SIZE.width + 2, layout.waveBand.height);
    ctx.drawImage(assets.waves, waveOffset + SCENE_SIZE.width - 2, layout.waveBand.y, SCENE_SIZE.width + 2, layout.waveBand.height);
  }

  ctx.restore();
}
```

- [x] **Step 4: Preserve existing splash/text loops after restoring scene coordinates**

Keep current effects, but scale their coordinates through the same scene transform before restore or convert them to scene-space positions so effects stay aligned after resize.

- [x] **Step 5: Run renderer-adjacent tests**

Run: `npm test -- src/rendering/sceneLayout.test.js`

Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add src/rendering/renderScene.js src/rendering/sceneLayout.test.js
git commit -m "feat: render concept-aligned flow scene"
```

## Task 3: Make The Game Window Fill Its Width

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles/layout.css`

- [x] **Step 1: Add a real layout stylesheet import**

```js
import './styles/layout.css';
```

- [x] **Step 2: Wrap canvas in a responsive stage shell**

```jsx
<div className="game-stage-shell">
  <canvas ref={canvasRef} width={1280} height={720} className="game-stage-canvas" />
  {uiState.status === 'onboarding' && <OnboardingModal ... />}
</div>
```

- [x] **Step 3: Replace width-constraining canvas classes**

```css
.game-stage-shell {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #FEFCF8;
}

.game-stage-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

- [x] **Step 4: Keep reset clear logic aligned with new stage size**

```js
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

Do not repaint old hard-coded shallow bands during reset; next render frame should redraw the full scene.

- [x] **Step 5: Manual verify the scene now spans the card**

Run: `npm run dev`

Expected:

```text
- no side gutters inside the scene frame
- stage remains 16:9 at desktop and narrow widths
- onboarding overlay still covers full scene bounds
```

- [x] **Step 6: Commit**

```bash
git add src/App.jsx src/styles/layout.css
git commit -m "feat: expand game stage to full width"
```

## Task 4: Verify Visual States Against Concept Art

**Files:**
- Test: `src/rendering/sceneLayout.test.js`
- Manual verify: browser

- [x] **Step 1: Run full automated verification**

Run: `npm test`

Expected: PASS.

- [x] **Step 2: Run production build**

Run: `npm run build`

Expected: exit code `0`.

- [x] **Step 3: Manual visual pass**

Check:

```text
- normal: ivory sky, blue indicator landform, normal pirate, left-top sky cluster
- frustrated: blush sky, red indicator landform, frustrated pirate
- bored: blush sky, red indicator landform, bored pirate
- flow: mint sky, green indicator landform, in-flow pirate, enlarged ship
- dunes read above waves, waves fill foreground edge-to-edge
- ship/pirate stay in concept-like proportions
```

- [x] **Step 4: Responsive pass**

Check:

```text
- wide desktop: scene fills allotted card width
- narrow viewport: canvas scales without cropping or distortion
- overlays remain aligned to scene bounds
```

- [x] **Step 5: Commit any verification fixes**

```bash
git add src
git commit -m "fix: align flow scene states with concept art"
```

## Risks / Notes

- Current gameplay coordinates were authored for the old `800x220` strip. Rendering into a `1280x720` authored stage avoids rewriting mechanics, but platform/pirate placements must be intentionally remapped during draw.
- Existing assets include large transparent regions. Use natural aspect ratios, but size by visual role, not by raw pixel dimensions.
- The attached current screenshot shows an oversized sun because `sun-clouds-birds.png` is being drawn at natural pixel size; the fix is scale control, not cropping.
- `flow-indicator-*.png` must be treated as a scene layer. Reusing it as a `50x50` badge would preserve the current conceptual mismatch.

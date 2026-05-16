# Flow Game Unpacking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current monolithic `index.html` React canvas game into a maintainable multi-file project, integrate the full `FlowGameAssets` visual set, and improve player feedback so the learning goal is clearer and more accurate.

**Architecture:** Preserve the existing React implementation and move it into a Vite-based source tree. Split responsibilities by concern: app shell, game state/model, renderer, asset registry, onboarding, and UI panels. Keep canvas for animated gameplay; move explanatory feedback and onboarding text into HTML overlays so text stays readable and never gets clipped by canvas bounds.

**Tech Stack:** React, Vite, JavaScript ES modules, HTML canvas, CSS, local PNG assets.

---

## Game Purpose

This game teaches **Flow theory** through play:

- Learner skill rises gradually over time and is analysed to make the learner skill variable somewhat accurate to the real person playing the game.
- Designer/player controls challenge through two inputs: gap frequency and water speed.
- If challenge is much higher than skill, pirate becomes **frustrated**.
- If challenge is much lower than skill, pirate becomes **bored**.
- If challenge matches skill, pirate enters **flow**.
- Sustained flow reveals the ship and leads to victory; prolonged mismatch leads to failure.

The educational point: good learning design keeps challenge slightly ahead of, but still matched to, learner capability. The game should make that relationship visible, legible, and memorable.

## Desired Player Experience

1. First seconds: player understands the mission before touching controls.
2. During play: every control change produces understandable state feedback.
3. During mismatch: the game explains *why* pirate state changed and what adjustment can help.
4. During flow: visuals become calmer, greener, and more rewarding.
5. At threshold moments: the player understands that maintaining flow unlocks progress toward the ship.

## Current Problems To Solve

### 1. Monolithic structure

`index.html` currently contains the full React component, rendering logic, state updates, controls, and game rules in one large file. This makes iteration risky and asset replacement harder than necessary.

### 2. Temporary placeholder art

Current canvas art is mostly procedural shapes. The provided `FlowGameAssets` folder already contains stage-specific pirate art, waves, ship, sky details, and platform imagery that should become the real visual language of the game.

### 3. Feedback can get cut off

Motivational floating text is rendered inside the canvas and can be clipped by canvas boundaries. Educational feedback also competes with the game scene.

### 4. State indication is close, not exact enough

The current emotion calculation uses a simple threshold on `challenge - skill` only. That likely explains the "~90% accurate" feeling: it ignores player action timing, recent difficulty changes, and whether the pirate is currently succeeding or repeatedly falling.

### 5. Skill level placement is semantically confusing

The skill meter sits alongside real sliders, so it can read as another input instead of a passive measure.

### 6. First threshold lacks onboarding

The ship appears only after sustained flow, but the player is not explicitly taught that the first goal is to reach and hold the flow threshold.

## Recommended Product Direction

### Recommendation: keep gameplay, redesign presentation around it

Use the existing mechanics as the foundation. Refactor the codebase and improve legibility rather than redesigning the game from scratch.

**Why this direction:**

- Lowest risk to the current playable prototype.
- Best fit for the supplied concept art.
- Lets visuals and feedback carry more of the learning objective without changing the core loop.

### Alternatives considered

1. **Minimal split only** " extract files, keep mechanics and visuals mostly unchanged. Fastest, but wastes the concept art and leaves the learning UX weak.
2. **Full redesign** " rebuild rules, interface, and scene composition together. Strongest possible outcome, but unnecessary scope and higher regression risk.
3. **Recommended middle path** " modularize, integrate real art, then tune guidance/feedback around the current mechanic. Best value/risk balance.

## Target File Structure

```text
project/
|-- index.html
|-- package.json
|-- vite.config.js
|-- src/
|   |-- main.jsx
|   |-- App.jsx
|   |-- styles/
|   |   |-- base.css
|   |   |-- layout.css
|   |   +-- components.css
|   |-- config/
|   |   +-- assets.js
|   |-- game/
|   |   |-- createInitialGameState.js
|   |   |-- difficultyModel.js
|   |   |-- updateGameState.js
|   |   +-- constants.js
|   |-- rendering/
|   |   |-- loadAssets.js
|   |   +-- renderScene.js
|   |-- ui/
|   |   |-- ControlPanel.jsx
|   |   |-- FeedbackPanel.jsx
|   |   |-- OnboardingPanel.jsx
|   |   +-- StatusOverlays.jsx
|   +-- hooks/
|       +-- useGameLoop.js
|-- public/
|   +-- assets/
|       +-- images/
|           +-- flow-game/
|               |-- background-texture.png
|               |-- flow-indicator-bad.png
|               |-- flow-indicator-good.png
|               |-- flow-indicator-normal.png
|               |-- flow-signify-ship.png
|               |-- pirate-bored.png
|               |-- pirate-frustrated.png
|               |-- pirate-in-flow.png
|               |-- pirate-normal.png
|               |-- sand-pile-platforms.png
|               |-- sun-clouds-birds.png
|               +-- waves.png
+-- docs/
    +-- superpowers/
        +-- plans/
```

## Asset Integration Map

| Supplied asset | Target use |
|---|---|
| `background texture.png` | paper texture layer for page/game shell |
| `Sun clouds and birds.png` | reusable upper-background scene layer |
| `Waves.png` | foreground ocean strip, horizontally tiled |
| `Sand pile (platforms to jump on).png` | jumpable platform visual |
| `Pirate-Normal.png` | neutral/default learner state |
| `Pirate-Frustrated.png` | high-challenge learner state |
| `Pirate-Bored.png` | low-challenge learner state |
| `Pirate-InFlow.png` | sustained-flow learner state |
| `FlowSignifyShip.png` | ship reveal/progress reward |
| `FlowIndicator-normal.png` | neutral status strip / meter state |
| `FlowIndicator-Bad.png` | mismatch state strip |
| `FlowIndicator-Good.png` | flow state strip |
| `Color Pallete.png` | reference only; do not ship in runtime unless needed |

## Visual State Rules

| State | Scene mood | Pirate art | Ship | Indicator |
|---|---|---|---|---|
| Normal | pale neutral sky | `Pirate-Normal.png` | hidden | `FlowIndicator-normal.png` |
| Frustrated | warm red tint | `Pirate-Frustrated.png` | hidden | `FlowIndicator-Bad.png` |
| Bored | muted pink tint | `Pirate-Bored.png` | hidden | `FlowIndicator-Bad.png` |
| Flow | mint green tint | `Pirate-InFlow.png` | visible / moving closer | `FlowIndicator-Good.png` |

## UX Improvements

### Feedback not clipped

Move educational feedback out of the canvas into a dedicated `FeedbackPanel` overlay/card below or beside the canvas.

Keep brief in-world reactions optional, but make the actual teaching message HTML-based:

- no canvas clipping
- can wrap naturally
- easier responsive behavior
- easier accessibility and translation

### More accurate indication model

Replace the single raw threshold with a small state model:

```js
rawDifficulty = gapsWeight * gaps + speedWeight * speed
challengeDelta = rawDifficulty - skill
recentFalls = rolling count over last N seconds
recentAdjustment = delta from last control change
```

Then classify using both **challenge-skill fit** and **observed performance**:

- `frustrated` when challenge is too high *or* repeated falls follow a recent increase in difficulty
- `bored` when challenge is too low and player succeeds effortlessly for a sustained period
- `flow` when challenge is close to skill and performance is stable
- optional short `transition` grace period after slider changes so UI does not flicker instantly

This better matches what the user actually did, not just current slider math.

### Skill meter separation

Move skill into a clearly passive `Learner Skill` card, visually separate from the two interactive controls.

Recommended layout:

```text
[ Challenge Controls ]        [ Learner Skill ]
[ gap slider ]                [ passive meter ]
[ speed slider ]              [ short explanation ]
```

Copy should explicitly say: `Skill grows automatically while the learner practices.`

### Onboarding tied to first threshold

Before play, show a compact 3-step intro:

1. `Match challenge to skill.`
2. `Keep the pirate in Flow long enough to call the ship.`
3. `First goal: reach the Flow zone and hold it for 10 seconds.`

During first play session, show a milestone hint when the player first enters flow:

- `Good match. Hold Flow to bring the ship closer.`

This directly links the first threshold condition to a visible goal.

## Implementation Tasks

### Task 1: Create maintainable project structure

**Files:**
- Modify: `index.html`
- Create: `package.json`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`

- [ ] **Step 1: Create the directories**

```powershell
New-Item -ItemType Directory -Force src/styles, src/config, src/game, src/rendering, src/ui, src/hooks, public/assets/images/flow-game
```

- [ ] **Step 2: Move document styles into CSS files**

Create `src/styles/base.css`, `src/styles/layout.css`, and `src/styles/components.css` so typography, shell layout, and reusable UI pieces no longer live inside `index.html`.

- [ ] **Step 3: Replace inline app bootstrapping with module entry**

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

- [ ] **Step 4: Move the current root React component into `src/App.jsx`**

```js
import React from 'react';

export default function App() {
  return null;
}
```

Replace the placeholder body with the extracted current component during implementation.

- [ ] **Step 5: Verify local loading through a dev server**

```powershell
npm install
npm run dev
```

Expected: Vite serves the game locally and the React app mounts without JSX/module errors.

### Task 2: Localize and register visual assets

**Files:**
- Create: `src/config/assets.js`
- Create: `src/rendering/loadAssets.js`
- Create: `public/assets/images/flow-game/*`

- [ ] **Step 1: Copy and normalize asset filenames**

```text
FlowGameAssets/Pirate-InFlow.png -> public/assets/images/flow-game/pirate-in-flow.png
FlowGameAssets/Sand pile (platforms to jump on).png -> public/assets/images/flow-game/sand-pile-platforms.png
```

- [ ] **Step 2: Define a single asset registry**

```js
export const ASSETS = {
  backgroundTexture: '/assets/images/flow-game/background-texture.png',
  skyDetails: '/assets/images/flow-game/sun-clouds-birds.png',
  waves: '/assets/images/flow-game/waves.png',
  platform: '/assets/images/flow-game/sand-pile-platforms.png',
  pirateNormal: '/assets/images/flow-game/pirate-normal.png',
  pirateFrustrated: '/assets/images/flow-game/pirate-frustrated.png',
  pirateBored: '/assets/images/flow-game/pirate-bored.png',
  pirateInFlow: '/assets/images/flow-game/pirate-in-flow.png',
  ship: '/assets/images/flow-game/flow-signify-ship.png',
  indicatorNormal: '/assets/images/flow-game/flow-indicator-normal.png',
  indicatorBad: '/assets/images/flow-game/flow-indicator-bad.png',
  indicatorGood: '/assets/images/flow-game/flow-indicator-good.png',
};
```

- [ ] **Step 3: Add asset preload helper**

```js
export function loadAssets(assetMap) {
  return Promise.all(
    Object.entries(assetMap).map(([key, src]) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve([key, image]);
      image.onerror = reject;
      image.src = src;
    }))
  ).then(Object.fromEntries);
}
```

- [ ] **Step 4: Verify every runtime image path resolves**

Expected: no missing-image network requests in browser devtools.

### Task 3: Split game model from rendering

**Files:**
- Create: `src/game/constants.js`
- Create: `src/game/createInitialGameState.js`
- Create: `src/game/difficultyModel.js`
- Create: `src/game/updateGameState.js`
- Create: `src/hooks/useGameLoop.js`
- Create: `src/rendering/renderScene.js`

- [ ] **Step 1: Extract constants**

```js
export const FLOW_WIN_SECONDS = 20;
export const BAD_FAIL_SECONDS = 7;
export const INITIAL_SKILL = 20;
```

- [ ] **Step 2: Extract initial state factory**

```js
export function createInitialGameState() {
  return {
    npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
    platforms: [{ x: 0, w: 800, y: 160, type: 'platform' }],
    flowFrames: 0,
    badFrames: 0,
    skill: 20,
    status: 'playing',
  };
}
```

- [ ] **Step 3: Move difficulty calculation into a dedicated model**

```js
export function calculateChallenge({ gaps, speed }) {
  return (gaps * 5) + (speed * 5);
}
```

- [ ] **Step 4: Move all canvas drawing into `renderScene.js`**

`renderScene` should receive explicit inputs only:

```js
renderScene({ ctx, canvas, gameState, uiState, assets });
```

- [ ] **Step 5: Keep the React component focused on composition**

`src/App.jsx` should own UI state and delegate simulation/render work to imported modules.

### Task 4: Improve state accuracy

**Files:**
- Modify: `src/game/difficultyModel.js`
- Test: `src/game/difficultyModel.test.js`

- [ ] **Step 1: Write failing tests for edge cases**

```js
import { classifyEmotion } from './difficultyModel.js';

test('frustrated after repeated falls under high challenge', () => {
  expect(classifyEmotion({ delta: 18, recentFalls: 2, stableSuccessSeconds: 0 })).toBe('frustrated');
});

test('bored after sustained easy success', () => {
  expect(classifyEmotion({ delta: -18, recentFalls: 0, stableSuccessSeconds: 5 })).toBe('bored');
});

test('flow near the learner skill zone', () => {
  expect(classifyEmotion({ delta: 4, recentFalls: 0, stableSuccessSeconds: 3 })).toBe('flow');
});
```

- [ ] **Step 2: Implement explicit classification rules**

```js
export function classifyEmotion({ delta, recentFalls, stableSuccessSeconds }) {
  if (delta >= 15 || (delta >= 8 && recentFalls >= 2)) return 'frustrated';
  if (delta <= -15 && stableSuccessSeconds >= 3) return 'bored';
  return 'flow';
}
```

- [ ] **Step 3: Add a brief grace period after slider changes**

```js
export function shouldHoldPreviousEmotion({ msSinceAdjustment }) {
  return msSinceAdjustment < 600;
}
```

- [ ] **Step 4: Verify UI state changes align with control changes and outcomes**

Expected: no immediate misleading flip when player nudges one slider; repeated failures under hard settings register as frustration reliably.

### Task 5: Replace clipped feedback with readable teaching UI

**Files:**
- Create: `src/ui/FeedbackPanel.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles/components.css`

- [ ] **Step 1: Create HTML feedback component**

```jsx
export function FeedbackPanel({ emotion, message }) {
  return (
    <section className={`feedback-panel feedback-panel--${emotion}`} aria-live="polite">
      <h2>{emotion}</h2>
      <p>{message}</p>
    </section>
  );
}
```

- [ ] **Step 2: Route educational messages into the panel**

```js
const feedbackByEmotion = {
  frustrated: 'Challenge is too high. Reduce gap frequency or water speed.',
  bored: 'Challenge is too low. Increase difficulty to re-engage the learner.',
  flow: 'Challenge matches skill. Hold this balance to progress.',
};
```

- [ ] **Step 3: Keep only short decorative reactions inside canvas**

Example: splash, icon, tiny reaction text. No core teaching copy inside the clipping region.

- [ ] **Step 4: Verify long text wraps on narrow widths**

Expected: feedback remains fully visible on desktop and mobile widths.

### Task 6: Separate passive skill from active controls

**Files:**
- Create: `src/ui/ControlPanel.jsx`
- Modify: `src/styles/layout.css`

- [ ] **Step 1: Split control and metric regions**

```jsx
<section className="challenge-controls">...</section>
<aside className="learner-skill-card">...</aside>
```

- [ ] **Step 2: Add explicit passive wording**

```jsx
<p>Skill grows automatically while the learner practices.</p>
```

- [ ] **Step 3: Verify visual hierarchy**

Expected: sliders read as inputs; skill card reads as display-only state.

### Task 7: Add onboarding tied to threshold goals

**Files:**
- Create: `src/ui/OnboardingPanel.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add first-run onboarding copy**

```jsx
const onboardingSteps = [
  'Match challenge to skill.',
  'Keep the pirate in Flow long enough to call the ship.',
  'First goal: reach the Flow zone and hold it for 10 seconds.',
];
```

- [ ] **Step 2: Add milestone hint on first flow entry**

```js
if (!hasReachedFlowBefore && emotion === 'flow') {
  setMilestoneMessage('Good match. Hold Flow to bring the ship closer.');
}
```

- [ ] **Step 3: Connect milestone logic to ship reveal**

Expected: player understands why the ship appears after sustained flow instead of treating it as decoration.

### Task 8: Render the supplied art set inside the scene

**Files:**
- Modify: `src/rendering/renderScene.js`

- [ ] **Step 1: Draw layered background**

```js
ctx.drawImage(assets.skyDetails, 0, 0, canvas.width, canvas.height);
```

- [ ] **Step 2: Replace procedural ocean and platforms with supplied imagery**

```js
ctx.drawImage(assets.waves, 0, waveY, canvas.width, waveHeight);
ctx.drawImage(assets.platform, platform.x, platform.y, platform.w, platform.h);
```

- [ ] **Step 3: Swap pirate sprite by emotion**

```js
const pirateAsset = {
  normal: assets.pirateNormal,
  frustrated: assets.pirateFrustrated,
  bored: assets.pirateBored,
  flow: assets.pirateInFlow,
}[visualState];
```

- [ ] **Step 4: Use ship art as reward progression element**

```js
if (flowSeconds >= 10) {
  ctx.drawImage(assets.ship, shipX, shipY, shipWidth, shipHeight);
}
```

- [ ] **Step 5: Match concept-art states**

Expected: scene resembles supplied Normal / Frustrated / Bored / Flow concept images without the top-right labels.

### Task 9: Verify behavior and regressions

**Files:**
- Test: `src/game/difficultyModel.test.js`
- Manual verify: browser

- [ ] **Step 1: Run unit tests**

```powershell
npm test
```

Expected: model tests pass.

- [ ] **Step 2: Manual game-state pass**

Check:

```text
- normal start
- frustration after excessive challenge
- boredom after insufficient challenge
- flow after balanced settings
- ship appears after threshold
- win after sustained flow
- failure after sustained mismatch
```

- [ ] **Step 3: Responsive pass**

Expected:

```text
- no feedback clipping
- no overlapping skill/control semantics
- onboarding readable at narrow width
```

- [ ] **Step 4: Visual pass against concept art**

Expected: visual identity clearly uses provided assets across all four states.

## Acceptance Criteria

- Monolithic app split into focused files with explicit responsibilities.
- Every runtime visual from `FlowGameAssets` is integrated or intentionally documented as reference-only.
- Pirate state visuals match supplied concept art states.
- Core educational feedback is never clipped inside canvas.
- Emotion/state indication better reflects both challenge-skill balance and recent player outcomes.
- Skill reads as passive display, not another slider.
- Onboarding explicitly connects the first flow threshold to the ship/progress goal.
- Game still teaches the same flow principle, but more clearly than current version.

## Risks / Notes

- Current `index.html` contains React/JSX source rather than a browser-ready static page, so this plan standardizes on a Vite + React project instead of converting the game to vanilla JavaScript.
- Asset dimensions vary widely; renderer must preserve aspect ratios and scale intentionally.
- PNG art may need cropping/transparent-bound checks before final placement.
- `Color Pallete.png` should stay a design reference unless runtime use is explicitly desired.

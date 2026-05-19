# Pirate's Journey: Flow Designer Balancing and Delta-Time Independence Spec

This design document outlines the technical improvements to fix the game's high difficulty, lack of recovery scaffolding, and frame-rate dependence. 

## Goal Description
Currently, the game is unwinnable and extremely frustrating because:
1. **Death Loops:** Falling into the water instantly penalizes player skill (-8) and catapults them back up. However, platforms move so fast and gaps are generated so widely that the player often lands straight into another gap, leading to an inescapable cascade of falls.
2. **Double-Controls cognitive overload:** Players are forced to focus on manual platforming (pressing Space to jump) while simultaneously using the mouse to slide a difficulty slider.
3. **Frame-Rate Dependency:** Physics and speed are tied directly to rendering frames. On high refresh rate monitors (e.g., 144Hz, 240Hz), the game runs at ultra-speed and is completely unplayable.
4. **Incorrect Flow Metaphor:** Flow theory suggests that staying outside of flow (in frustration/boredom) leads to skill growth stagnation. Direct penalties for falling contradict the idea that failure is a learning opportunity.

To resolve these issues, we will introduce dynamic recovery aids (invulnerability, automatic slow-downs, safety platform generation), a mathematically sound learning rate decay model, and frame-rate clamping to exactly 60 FPS.

## User Review Required
The new dynamic stagnation model calculates the rate of skill growth by decreasing it progressively every 0.3 seconds spent outside of flow.

> [!IMPORTANT]
> The parameters for this stagnation behavior are fully customizable inside `src/game/constants.js`:
> - `BASE_GROWTH_RATE`: `0.03` points per frame.
> - `DECREMENT_INTERVAL_SECONDS`: `0.3` seconds.
> - `RATE_DECREMENT`: `0.005` rate drop per interval.
> - `LEARNING_BONUS`: `0.5` instant skill point boost on fall.

Please review these default tuning variables and let me know if you would like to adjust their initial values.

## Proposed Changes

---

### Component: Game Constants & State Model

#### [MODIFY] [constants.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/constants.js)
Define the new constants for the adaptive learning rates, learning bonus, and stagnation intervals.
- Add `BASE_GROWTH_RATE = 0.03;`
- Add `DECREMENT_INTERVAL_SECONDS = 0.3;`
- Add `RATE_DECREMENT = 0.005;`
- Add `LEARNING_BONUS = 0.5;`

#### [MODIFY] [createInitialGameState.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/createInitialGameState.js)
Initialize new trackers in the game state structure:
- `framesOutsideFlow: 0` to track how long the player has been frustrated or bored.
- `forceSafePlatform: false` flag to trigger a guaranteed safety platform spawn on the next generation cycle.

---

### Component: Difficulty & Emotion Modeling

#### [MODIFY] [difficultyModel.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/difficultyModel.js)
Export a new utility function `calculateSkillGrowthRate({ framesOutsideFlow })` to dynamically compute the rate decay:
- Subtracts `RATE_DECREMENT` for every full `DECREMENT_INTERVAL_SECONDS` (at 60 FPS) spent outside of flow.
- Clamps the growth rate at a minimum of `0` (no negative skill growth).

---

### Component: Core Game Physics & Scaffolding

#### [MODIFY] [updateGameState.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/updateGameState.js)
- **Eliminate direct penalty:** Remove `game.skill = Math.max(0, game.skill - 8);` upon falling.
- **Add Learning Bonus:** Add `game.skill = Math.min(100, game.skill + LEARNING_BONUS);` on fall.
- **Safety Platform Generation:**
  - When a fall occurs, set `game.forceSafePlatform = true`.
  - When spawning a new platform: if `game.forceSafePlatform` is true, override `gapSize` to a safe landing distance (e.g., `120` units) and set the `platformWidth` to an extra-long safe zone (e.g., `350` units). Then reset `game.forceSafePlatform = false`.
- **Slower Speed during Recovery:**
  - If `game.npc.recoveryTimer > 0`, override `currentSpeed` to a slow speed (forcing the scroll speed equivalent to slider setting 1) to allow recovery.

---

### Component: Game Loop & Blinking Render

#### [MODIFY] [useGameLoop.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/hooks/useGameLoop.js)
- **60 FPS Clamping:** Introduce delta-time accumulation. Instead of running updates on every `requestAnimationFrame` trigger (which varies based on monitor refresh rate), accumulate delta time and execute `updateGameState` and skill updates in discrete `16.67ms` chunks.
- **Boredom/Frustration Tracking:**
  - If `emotion !== 'flow'`, increment `game.framesOutsideFlow`.
  - If `emotion === 'flow'`, reset `game.framesOutsideFlow = 0`.
- **Dynamic Skill Accumulation:** Use the calculated growth rate to increment `game.skill` each step.

#### [MODIFY] [renderScene.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/rendering/renderScene.js)
- **Blinking Invulnerability Effect:** During `npc.recoveryTimer > 0`, check if the frame counter is even/odd and toggle rendering `ctx.globalAlpha = 0.3` or `1.0` to produce a flashing invulnerability animation.

---

## Verification Plan

### Automated Tests
- Create comprehensive tests in `src/game/difficultyModel.test.js` to assert:
  - Skill growth decay math works perfectly given various `framesOutsideFlow` values.
  - Clamp at 0 is properly enforced.
- Run tests via vitest:
  ```powershell
  npx vitest run src
  ```

### Manual Verification (done by agent using antigravity browser tools)
1. Run the local development server:
   ```powershell
   npm run dev
   ```
2. Open [http://localhost:5173/dino-game/](http://localhost:5173/dino-game/) in the browser.
3. Intentionally fall into the water:
   - Verify that the pirate enters a flashing invulnerable state.
   - Verify that the game speed slows down significantly during recovery.
   - Verify that an extra-wide platform appears perfectly positioned below the pirate's catapult trajectory, making landing 100% safe.
   - Verify that your skill level *increases* slightly by `+0.5` instead of decreasing.
4. Keep the slider too high (frustrated) or too low (bored):
   - Open the skill indicator panel and verify that the skill progress rate slows down every 0.3 seconds.
   - Drag the slider to balance the skill/challenge (returning to Flow) and verify that the skill progress bar resumes full-speed growth immediately.


   ### Final step
   Commit and push to github, wait 3 minutes and check that https://yodaswag.github.io/dino-game/ updated properly. Ensure the user they can roll back and make further edits if needed.

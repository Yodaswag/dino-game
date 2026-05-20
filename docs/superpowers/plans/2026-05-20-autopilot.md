# Autopilot Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a beautifully integrated, Hebrew-localized Autopilot mode with adaptive onboarding confirmation and reactive failure offers to help players focus on difficulty tuning.

**Architecture:** We store player failure history in `localStorage`, track `isAutopilotEnabled` in React state and sync it to the game physics ref, automate jumps in the physics step when the NPC approaches platform edges, and display contextual confirmation or educational modals in Hebrew.

**Tech Stack:** React, TailwindCSS, HTML5 Canvas, Vitest, Lucide-React

---

### Task 1: Initialize Autopilot State and Failure Tracking

**Files:**
- Create: [localStorageUtils.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/localStorageUtils.js)
- Modify: [createInitialGameState.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/createInitialGameState.js)
- Modify: [App.jsx](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/App.jsx)

- [ ] **Step 1: Create local storage utility**
  Create `src/game/localStorageUtils.js` to manage persistence of user failure history.
  ```javascript
  const FAILURE_KEY = 'pirate_flow_failed_before';

  export function getHasFailedBefore() {
    try {
      return localStorage.getItem(FAILURE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  export function setHasFailedBefore() {
    try {
      localStorage.setItem(FAILURE_KEY, 'true');
    } catch (e) {
      // Ignore storage errors
    }
  }
  ```

- [ ] **Step 2: Add autopilot flag to initial state in createInitialGameState.js**
  Initialize `isAutopilotEnabled` inside the game state object so the game loop and physics can access it.
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
      isAutopilotEnabled: false,
    };
  }
  ```

- [ ] **Step 3: Update App.jsx with state hooks and localStorage integration**
  Initialize state hooks in the `FlowDesignerGame` component, and update storage on failure.
  ```javascript
  // Add imports at top of App.jsx:
  import { getHasFailedBefore, setHasFailedBefore } from './game/localStorageUtils.js';

  // Inside FlowDesignerGame:
  const [hasFailedBefore, setLocalHasFailedBefore] = useState(getHasFailedBefore());
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const [showFirstTimeConfirm, setShowFirstTimeConfirm] = useState(false);
  const [showFailedSuggest, setShowFailedSuggest] = useState(false);

  // Sync game.current with React state inside a useEffect:
  useEffect(() => {
    game.current.isAutopilotEnabled = isAutopilotEnabled;
  }, [isAutopilotEnabled]);
  ```

- [ ] **Step 4: Record failure in App.jsx when status transitions to 'failed'**
  Modify the status tracking to flag that the user has failed.
  ```javascript
  useEffect(() => {
    if (uiState.status === 'failed') {
      setHasFailedBefore();
      setLocalHasFailedBefore(true);
    }
  }, [uiState.status]);
  ```

- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add src/game/localStorageUtils.js src/game/createInitialGameState.js src/App.jsx
  git commit -m "feat: add autopilot state trackers and failure history persistence"
  ```

---

### Task 2: Implement Autopilot Jumping Physics

**Files:**
- Modify: [updateGameState.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/updateGameState.js)

- [ ] **Step 1: Implement lookahead jumping logic in updateGameState.js**
  Inject automated jumping when `game.isAutopilotEnabled` is active and the current platform ends within a speed-dependent threshold.
  ```javascript
  // In updateGameState.js, right after calculate currentSpeed:
  if (game.isAutopilotEnabled && !game.npc.isJumping && game.npc.recoveryTimer === 0) {
    const currentPlatform = game.platforms.find(p => 
      game.npc.x + 15 > p.x && game.npc.x - 15 < p.x + p.w
    );
    if (currentPlatform) {
      const platformEnd = currentPlatform.x + currentPlatform.w;
      const distanceToEnd = platformEnd - game.npc.x;
      const jumpThreshold = Math.max(30, currentSpeed * 3);

      if (distanceToEnd <= jumpThreshold) {
        game.npc.vy = -12;
        game.npc.isJumping = true;
      }
    }
  }
  ```

- [ ] **Step 2: Commit changes**
  Run:
  ```bash
  git add src/game/updateGameState.js
  git commit -m "feat: implement predictive autopilot jumping physics in updateGameState"
  ```

---

### Task 3: Add Autopilot Unit Tests

**Files:**
- Create: [autopilot.test.js](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/game/autopilot.test.js)

- [ ] **Step 1: Create unit tests validating autopilot jump behavior**
  Ensure the bot triggers jumps at the appropriate thresholds and ignores jumps when disabled or far from the edge.
  ```javascript
  import { describe, it, expect } from 'vitest';
  import { updateGameState } from './updateGameState.js';

  describe('Autopilot Mechanics', () => {
    it('does not jump automatically when autopilot is disabled', () => {
      const game = {
        npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
        platforms: [{ x: 0, w: 200, y: 160, type: 'platform' }],
        floatingTexts: [],
        splashes: [],
        clouds: [],
        frame: 0,
        flowFrames: 0,
        badFrames: 0,
        falls: [],
        isAutopilotEnabled: false
      };

      updateGameState({ game, gaps: 2, speed: 2, emotion: 'flow', challenge: 20, canvasWidth: 800 });
      expect(game.npc.isJumping).toBe(false);
      expect(game.npc.vy).toBe(0.6);
    });

    it('does not jump when autopilot is enabled but platform end is far away', () => {
      const game = {
        npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
        platforms: [{ x: 0, w: 400, y: 160, type: 'platform' }],
        floatingTexts: [],
        splashes: [],
        clouds: [],
        frame: 0,
        flowFrames: 0,
        badFrames: 0,
        falls: [],
        isAutopilotEnabled: true
      };

      updateGameState({ game, gaps: 2, speed: 2, emotion: 'flow', challenge: 20, canvasWidth: 800 });
      expect(game.npc.isJumping).toBe(false);
    });

    it('jumps automatically when autopilot is enabled and platform end is close', () => {
      const game = {
        npc: { x: 150, y: 160, vy: 0, isJumping: false, recoveryTimer: 0 },
        platforms: [{ x: 0, w: 175, y: 160, type: 'platform' }],
        floatingTexts: [],
        splashes: [],
        clouds: [],
        frame: 0,
        flowFrames: 0,
        badFrames: 0,
        falls: [],
        isAutopilotEnabled: true
      };

      updateGameState({ game, gaps: 2, speed: 2, emotion: 'flow', challenge: 20, canvasWidth: 800 });
      expect(game.npc.isJumping).toBe(true);
      expect(game.npc.vy).toBe(-12);
    });
  });
  ```

- [ ] **Step 2: Run tests with Vitest**
  Run:
  ```powershell
  npx vitest run src/game/autopilot.test.js
  ```
  Expected: All 3 autopilot tests pass successfully.

- [ ] **Step 3: Commit changes**
  Run:
  ```bash
  git add src/game/autopilot.test.js
  git commit -m "test: add comprehensive autopilot unit tests"
  ```

---

### Task 4: Design Autopilot UI Controls & Confirms

**Files:**
- Modify: [App.jsx](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/App.jsx)

- [ ] **Step 1: Implement Autopilot Button and modals in App.jsx**
  Add `Bot` import from `lucide-react`. Add the Autopilot button in the controls section. Show custom dialogs depending on `hasFailedBefore`.
  ```javascript
  // App.jsx toggler handler:
  const handleAutopilotToggle = () => {
    if (isAutopilotEnabled) {
      setIsAutopilotEnabled(false);
    } else {
      if (hasFailedBefore) {
        setShowFailedSuggest(true);
      } else {
        setShowFirstTimeConfirm(true);
      }
    }
  };
  ```

- [ ] **Step 2: Add HTML Markup for Autopilot Button in App.jsx**
  Insert the Hebrew-localized button into the UI layout.
  ```javascript
  <button
    onClick={handleAutopilotToggle}
    className={`flex items-center justify-center gap-2 py-3 px-5 rounded-lg font-bold transition-all border-2 shadow-[0_5px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1 ${
      isAutopilotEnabled
        ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white border-emerald-700 shadow-[0_4px_0_#0f766e]'
        : 'bg-gradient-to-b from-[#4a2815] to-[#30180a] text-[#f5ebd9] border-[#1a0c05] hover:from-[#5d3a21] hover:to-[#3e1f0f]'
    }`}
    title={isAutopilotEnabled ? 'כבה טייס אוטומטי' : 'הפעל טייס אוטומטי'}
  >
    <Bot size={18} className={isAutopilotEnabled ? 'animate-bounce text-emerald-200' : 'text-amber-400'} />
    <span className="text-base">{isAutopilotEnabled ? 'טייס אוטומטי פעיל' : 'הפעל טייס אוטומטי'}</span>
  </button>
  ```

- [ ] **Step 3: Add Hebrew Confirmation & Educational Modals to App.jsx render**
  ```javascript
  {/* First-time Confirmation Modal */}
  {showFirstTimeConfirm && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-[#f4e4c1] border-4 border-[#bca07c] rounded-xl p-6 max-w-md w-full text-center shadow-2xl" style={{ background: 'radial-gradient(circle at center, #f3e5ab 0%, #dfc38f 100%)' }}>
        <h3 className="text-2xl font-black text-[#264f73] mb-3 flex justify-center items-center gap-2">
          <Bot size={28} /> הפעלת טייס אוטומטי?
        </h3>
        <p className="text-[#5c3a21] font-bold text-sm mb-5 leading-relaxed">
          האם אתה בטוח שברצונך להשתמש בטייס האוטומטי? שימוש בו עלול לפגוע בחוויית המשחק ובאתגר האישי של למידת האיזון בעצמך.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setIsAutopilotEnabled(true);
              setShowFirstTimeConfirm(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg border-2 border-emerald-800 transition-all text-sm"
          >
            כן, הפעל טייס אוטומטי
          </button>
          <button
            onClick={() => setShowFirstTimeConfirm(false)}
            className="bg-stone-500 hover:bg-stone-600 text-white font-bold py-2 px-5 rounded-lg border-2 border-stone-700 transition-all text-sm"
          >
            לא, אשחק בעצמי
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Failed-Before Educational Suggestion Modal */}
  {showFailedSuggest && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-[#f4e4c1] border-4 border-[#bca07c] rounded-xl p-6 max-w-lg w-full text-center shadow-2xl" style={{ background: 'radial-gradient(circle at center, #f3e5ab 0%, #dfc38f 100%)' }}>
        <h3 className="text-2xl font-black text-emerald-800 mb-3 flex justify-center items-center gap-2">
          <Bot size={28} className="text-emerald-700" /> המלצה מנצחת לטייס האוטומטי! 💡
        </h3>
        <p className="text-[#5c3a21] font-bold text-sm mb-5 leading-relaxed">
          טייס אוטומטי מופעל כעת! 
          <br />
          במצב זה הפיראט יבצע את הקפיצות בעצמו, מה שיאפשר לך <b>להתרכז במאה אחוז בשינוי סליידר המהירות</b> (מד זרימת המים) על מנת ללמוד כיצד להתאים את רמת הקושי בדיוק לרמת התלמידים שלך או לרמה האישית שלך!
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setIsAutopilotEnabled(true);
              setShowFailedSuggest(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-8 rounded-lg border-2 border-emerald-800 transition-all text-base shadow-md"
          >
            הבנתי, הפעל טייס אוטומטי ונתחיל! 🚀
          </button>
        </div>
      </div>
    </div>
  )}
  ```

- [ ] **Step 4: Commit changes**
  Run:
  ```bash
  git add src/App.jsx
  git commit -m "feat: design and implement Hebrew autopilot toggle buttons and configuration modals"
  ```

---

### Task 5: Integrate Autopilot Offer into Failure Screen

**Files:**
- Modify: [App.jsx](file:///c:/Users/user/Documents/HIT%20Coding/Year%20Bet/Semester%20Bet/GameBasedLearning/dino-game/src/App.jsx)

- [ ] **Step 1: Insert reactive Autopilot offer in the Failure screen layout**
  Update the failure screen overlay to proactively offer autopilot for quick calibration recovery.
  ```javascript
  {/* Inside uiState.status === 'failed' overlay: */}
  <div className="mt-4 bg-[#3e1f0f] border-2 border-amber-600/50 p-4 rounded-lg shadow-inner max-w-xl text-center flex flex-col items-center gap-2">
    <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
      <Bot size={22} className="animate-pulse" />
      <span>צריכים עזרה במסע? סיוע בטייס אוטומטי! 🤖</span>
    </div>
    <p className="text-xs text-[#eaddcf] leading-relaxed max-w-md">
      כדי להקל על ההתנסות ולמנוע תסכול או שעמום, אנו מציעים להפעיל את הטייס האוטומטי. הדבר יאפשר לכם להתרכז בכיוונון הסליידר (מהירות זרימת המים) כדי להתאים את רמת הקושי בדיוק לרמה שלכם או של התלמידים שלכם.
    </p>
    <button
      onClick={() => {
        setIsAutopilotEnabled(true);
        resetGame();
        setTimeout(() => {
          setIsPlaying(true);
          game.current.status = 'playing';
          setUiState(prev => ({ ...prev, status: 'playing' }));
        }, 100);
      }}
      className="mt-2 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-black py-2 px-6 rounded-lg border-2 border-emerald-800 shadow-md active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
    >
      <Bot size={16} /> הפעל טייס אוטומטי ונסה שוב! ✨
    </button>
  </div>
  ```

- [ ] **Step 2: Commit changes**
  Run:
  ```bash
  git add src/App.jsx
  git commit -m "feat: embed proactive autopilot offer into the Hebrew failure screen"
  ```

---

## Verification Plan

### Automated Tests
- Run the full suite using:
  `npx vitest run src`
  Expected output: All unit tests, including the 3 new autopilot tests, pass successfully.

### Manual Verification
- Deploy local dev server via `npm run dev`.
- Test first-time click on autopilot toggle and verify warning modal appears.
- Decline, then check that autopilot remains disabled.
- Accept, and verify autopilot turns on and the pirate jumps perfectly.
- Let the game fail with autopilot disabled.
- Verify that on the failure screen, a special offer card appears in Hebrew prompting the user to activate autopilot.
- Click the failure screen's button. Verify it resets the game, turns autopilot on, starts playing immediately, and displays the suggestion modal.

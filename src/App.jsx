import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { createInitialGameState } from './game/createInitialGameState.js';
import { useGameLoop } from './hooks/useGameLoop.js';
import { ASSETS } from './config/assets.js';
import { loadAssets } from './rendering/loadAssets.js';
import { Controls } from './ui/Controls.jsx';
import { SkillProgress } from './ui/SkillProgress.jsx';
import { OnboardingModal } from './ui/OnboardingModal.jsx';

export default function FlowDesignerGame() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [assets, setAssets] = useState(null);

  const [uiState, setUiState] = useState({
    skill: 20,
    challenge: 20,
    emotion: 'flow',
    flowTime: 0,
    badTime: 0,
    status: 'onboarding'
  });

  const game = useRef(createInitialGameState());
  const gaps = speed;

  useEffect(() => {
    loadAssets(ASSETS).then((loaded) => {
      setAssets(loaded);
      setAssetsLoaded(true);
    });
  }, []);

  useGameLoop({ canvasRef, isPlaying, gaps, speed, game, setUiState, uiState, assets, gameplayWidth: 800 });

  const handleJump = () => {
    if (!isPlaying || game.current.status !== 'playing') return;

    if (!game.current.npc.isJumping || (game.current.npc.vy >= 0 && game.current.npc.y >= 150 && game.current.npc.y < 170)) {
      game.current.npc.vy = -12;
      game.current.npc.isJumping = true;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const resetGame = () => {
    setIsPlaying(false);
    game.current = createInitialGameState();
    setSpeed(2);
    setUiState({ skill: 20, challenge: 20, emotion: 'flow', flowTime: 0, badTime: 0, status: 'onboarding' });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const flowProgress = Math.min(100, (uiState.flowTime / 20) * 100);
  const badProgress = Math.min(100, (uiState.badTime / 7) * 100);

  if (!assetsLoaded) {
    return <div className="min-h-full flex items-center justify-center text-stone-100 bg-[#1c120c]">טוען משאבים...</div>;
  }

  return (
    <div className="min-h-full p-3 font-sans text-stone-100 bg-[#1c120c]" dir="rtl">
      <div className="max-w-[780px] mx-auto">
        <div className="rounded-xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.8)] border-[6px] border-[#30180a] overflow-hidden mb-4 relative" style={{ background: 'linear-gradient(to bottom, #5d3a21, #4a2815)' }}>
          <div className="p-3 border-b-[4px] border-[#30180a] flex flex-col gap-2 bg-[#2a160a]/80">
            <div className="w-full">
              <div className="flex justify-between text-xs font-bold mb-2 px-1 tracking-wider">
                <span className="text-emerald-300 font-black bg-[#f4e4c1]/60 border border-[#bca07c] px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">זרימה (20 שנ')</span>
                <span className="text-[#f5ebd9] font-black bg-[#f4e4c1]/60 border border-[#bca07c] px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">נקודת התחלה</span>
                <span className="text-red-400 font-black bg-[#f4e4c1]/60 border border-[#bca07c] px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">נטישה (7 שנ')</span>
              </div>
              <div className="relative w-full bg-[#110804] rounded-full h-5 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] border border-[#4a2815] p-0.5" dir="ltr">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#8b5a2b] z-10 -ml-0.5 shadow-sm"></div>
                <div className="absolute left-1/2 top-1 bottom-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-r-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]" style={{ width: `calc(${flowProgress / 2}% - 2px)` }}></div>
                <div className="absolute right-1/2 top-1 bottom-1 bg-gradient-to-l from-red-600 to-red-500 rounded-l-full transition-all duration-300 shadow-[0_0_10px_rgba(248,113,113,0.3)]" style={{ width: `calc(${badProgress / 2}% - 2px)` }}></div>
              </div>
            </div>
          </div>

          <div className="game-stage-shell border-y-4 border-[#1a0c05] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <canvas ref={canvasRef} width={1280} height={720} className="game-stage-canvas" />
            {uiState.status === 'onboarding' && (
              <OnboardingModal
                onStart={() => {
                  setIsPlaying(true);
                  game.current.status = 'playing';
                  setUiState((prev) => ({ ...prev, status: 'playing' }));
                }}
              />
            )}
            {uiState.status === 'won' && (
              <div className="absolute inset-0 bg-[#f3e5ab]/95 flex items-center justify-center flex-col z-30 border-4 border-[#bca07c] p-4">
                <div className="text-6xl mb-3 drop-shadow-md">⛵</div>
                <h2 className="text-4xl font-black text-emerald-700 mb-2 drop-shadow-sm">ניצחון!</h2>
                <p className="text-[#5c3a21] font-bold text-lg max-w-lg text-center">
                  הצלחת לשמור על איזון מושלם בין האתגר למיומנות לאורך זמן.
                  <br />
                  <b>זהו בדיוק מצב ה-Flow!</b>
                </p>
              </div>
            )}
            {uiState.status === 'failed' && (
              <div className="absolute inset-0 bg-[#2a160a]/95 flex flex-col items-center justify-center p-4 text-center z-30 border-t-4 border-red-900">
                <div className="text-6xl mb-3 drop-shadow-lg opacity-80">⚓</div>
                <h2 className="text-3xl font-black text-red-500 mb-2 drop-shadow-md">הפיראט נטש את המסע</h2>
                <p className="text-[#d4a373] font-medium mb-4 text-base">השחקן שהה יותר מדי זמן בתחושת אי-נוחות.</p>
                <div className="bg-[#1a0c05] p-4 rounded-md shadow-[0_5px_15px_rgba(0,0,0,0.5)] max-w-xl text-right border-r-4 border-red-600">
                  <h3 className="font-bold text-red-400 mb-2 text-lg">תובנה למורים:</h3>
                  <p className="text-sm text-[#eaddcf] leading-relaxed">
                    כאשר הלומד מתוסכל או משועמם לאורך זמן, הוא ינטוש את הלמידה. תפקידנו הוא לספק <b>תמיכה (Scaffolding)</b> או <b>העשרה</b> בהתאם.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#2a160a]/90 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch bg-[#2a160a] p-3 rounded-xl border border-[#4a2815] shadow-inner">
              <div className="w-full md:w-2/3">
                <Controls speed={speed} onSpeedChange={setSpeed} disabled={uiState.status !== 'playing'} />
              </div>
              <div className="w-full md:w-1/3 flex border-t md:border-t-0 md:border-r border-[#4a2815]/50 pt-3 md:pt-0 md:pr-4">
                <SkillProgress skill={uiState.skill} />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-3 border-t border-[#4a2815]/50">
              <button onClick={() => setIsPlaying(!isPlaying)} disabled={uiState.status !== 'playing'} className={`flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-bold text-white transition-all outline-none ${isPlaying ? 'bg-gradient-to-b from-[#b45309] to-[#78350f] border-2 border-[#451a03] shadow-[0_4px_0_#451a03] active:shadow-none active:translate-y-1' : 'bg-gradient-to-b from-[#f59e0b] to-[#d97706] border-2 border-[#78350f] shadow-[0_5px_0_#78350f] active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:translate-y-1 disabled:shadow-none'}`}>
                {isPlaying ? <Pause size={18} className="drop-shadow-md" /> : <Play size={18} className="drop-shadow-md" />}
                <span className="drop-shadow-md text-base">{isPlaying ? 'השהה' : 'התחל מסע'}</span>
              </button>
              <button onClick={resetGame} className="flex items-center justify-center py-3 px-4 rounded-lg font-bold text-[#f5ebd9] bg-gradient-to-b from-[#4a2815] to-[#30180a] border-2 border-[#1a0c05] hover:from-[#5d3a21] hover:to-[#3e1f0f] transition-all shadow-[0_5px_0_#1a0c05] active:shadow-none active:translate-y-1" title="איפוס המשחק">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

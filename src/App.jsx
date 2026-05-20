import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bot } from 'lucide-react';
import { createInitialGameState } from './game/createInitialGameState.js';
import { useGameLoop } from './hooks/useGameLoop.js';
import { ASSETS } from './config/assets.js';
import { loadAssets } from './rendering/loadAssets.js';
import { Controls } from './ui/Controls.jsx';
import { SkillProgress } from './ui/SkillProgress.jsx';
import { OnboardingModal } from './ui/OnboardingModal.jsx';
import { getHasFailedBefore, setHasFailedBefore } from './game/localStorageUtils.js';

export default function FlowDesignerGame() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [assets, setAssets] = useState(null);

  const [hasFailedBefore, setLocalHasFailedBefore] = useState(() => getHasFailedBefore());
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const [showFirstTimeConfirm, setShowFirstTimeConfirm] = useState(false);
  const [showFailedSuggest, setShowFailedSuggest] = useState(false);

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
    game.current.isAutopilotEnabled = isAutopilotEnabled;
  }, [isAutopilotEnabled]);

  useEffect(() => {
    if (uiState.status === 'failed') {
      setHasFailedBefore();
      setLocalHasFailedBefore(true);
    }
  }, [uiState.status]);

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
      game.current.framesSinceLastJump = 0;
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
    const newState = createInitialGameState();
    newState.isAutopilotEnabled = isAutopilotEnabled; // preserve autopilot on reset
    game.current = newState;
    setSpeed(2);
    setUiState({ skill: 20, challenge: 20, emotion: 'flow', flowTime: 0, badTime: 0, status: 'onboarding' });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

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

  const flowProgress = Math.min(100, (uiState.flowTime / 20) * 100);
  const badProgress = Math.min(100, (uiState.badTime / 7) * 100);

  if (!assetsLoaded) {
    return <div className="min-h-full flex items-center justify-center text-stone-100 bg-[#1c120c]">טוען משאבים...</div>;
  }

  return (
    <div
      className="min-h-full p-3 font-sans text-[#241819] transition-colors duration-300"
      dir="rtl"
      style={{
        backgroundColor: '#241819',
        backgroundImage: "url('/dino-game/assets/images/flow-game/texture.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      <div className="max-w-[780px] mx-auto">
        <div className="rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-[6px] border-[#1462A6] overflow-hidden mb-4 relative bg-[#241819] transition-all">
          <div
            className="p-4 border-b-[4px] border-[#1462A6] flex flex-col gap-2 bg-[#FEFCF8]"
          >
            <div className="w-full">
              <div className="flex flex-row-reverse justify-between text-xs font-black mb-3 px-1 tracking-wide text-right">
                <span className="text-[#FEFCF8] bg-[#1462A6] border border-[#1462A6] px-3 py-1.5 rounded-lg shadow-sm font-sans tracking-wide">זרימה (20 שנ')</span>
                <span className="text-[#241819] bg-[#F2DC99] border border-[#e0c482] px-3 py-1.5 rounded-lg shadow-sm font-sans tracking-wide">נקודת התחלה</span>
                <span className="text-[#FEFCF8] bg-[#BF3F4A] border border-[#BF3F4A] px-3 py-1.5 rounded-lg shadow-sm font-sans tracking-wide">נטישה (7 שנ')</span>
              </div>
              <div className="relative w-full bg-[#DEE4E4] rounded-full h-5 border border-[#368ABF]/30 p-0.5 shadow-inner" dir="ltr">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#1462A6] z-10 -ml-0.5 shadow-sm"></div>
                <div className="absolute left-1/2 top-1 bottom-1 bg-gradient-to-r from-[#1462A6] to-[#368ABF] rounded-r-full transition-all duration-300 shadow-[0_0_10px_rgba(20,98,166,0.3)]" style={{ width: `calc(${flowProgress / 2}% - 2px)` }}></div>
                <div className="absolute right-1/2 top-1 bottom-1 bg-gradient-to-l from-[#E69881] to-[#BF3F4A] rounded-l-full transition-all duration-300 shadow-[0_0_10px_rgba(191,63,74,0.3)]" style={{ width: `calc(${badProgress / 2}% - 2px)` }}></div>
              </div>
            </div>
          </div>

          <div className="game-stage-shell border-y-[4px] border-[#1462A6] shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] bg-[#FEFCF8]">
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
              <div
                className="absolute inset-0 flex items-center justify-center flex-col z-30 border-4 border-[#1462A6] p-6 text-center animate-fade-in animate-duration-500 bg-[#FEFCF8]"
              >
                <div className="text-7xl mb-4 animate-bounce drop-shadow-md">⛵</div>
                <h2 className="text-5xl font-black text-[#1462A6] mb-3 drop-shadow-sm font-aloja">ניצחון מוחלט!</h2>
                <p className="text-[#241819] font-black text-xl max-w-lg leading-relaxed bg-[#FEFCF8]/40 p-5 rounded-xl border border-[#368ABF]/20 backdrop-blur-sm shadow-inner text-right">
                  הצלחת לשמור על איזון מושלם בין האתגר למיומנות לאורך זמן.
                  <br />
                  <span className="text-[#1462A6] font-extrabold text-2xl mt-2 block text-center">זהו בדיוק מצב ה-Flow!</span>
                </p>
              </div>
            )}
            {uiState.status === 'failed' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-30 border-t-[6px] border-[#BF3F4A] animate-fade-in bg-[#FEFCF8]"
              >
                <h2 className="text-2xl font-black text-[#BF3F4A] mb-1 drop-shadow-sm font-aloja flex items-center justify-center gap-2">
                  <span className="animate-pulse">⚓</span> הפיראט נטש את המסע
                </h2>
                <p className="text-[#241819] font-black mb-3 text-xs md:text-sm text-right">השחקן שהה יותר מדי זמן בתחושת אי-נוחות (שעמום או תסכול).</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[700px] text-right">
                  {/* Teacher Insight Column */}
                  <div className="bg-[#BF3F4A]/5 p-3 rounded-xl border border-[#BF3F4A]/20 flex flex-col justify-between backdrop-blur-sm">
                    <div>
                      <h3 className="font-black text-[#BF3F4A] mb-1 text-xs md:text-sm">💡 תובנה פדגוגית למורים:</h3>
                      <p className="text-[11px] md:text-xs text-[#241819] font-bold leading-relaxed text-right">
                        כאשר הלומד מתוסכל או משועמם לאורך זמן, הוא ינטוש את הלמידה. תפקידנו כמורים הוא לזהות זאת ולספק <b className="text-[#1462A6]">פיגומים ותמיכה (Scaffolding)</b> או <b className="text-[#BF3F4A]">העשרה</b> בהתאם לרמתו האישית.
                      </p>
                    </div>
                    <button
                      onClick={resetGame}
                      className="mt-2.5 w-full bg-gradient-to-b from-[#FEFCF8] to-[#DEE4E4] hover:from-[#fff] hover:to-[#cfd7d7] text-[#241819] font-black py-2 rounded-lg border border-[#b5bebe] shadow-sm text-xs cursor-pointer transition-all active:translate-y-0.5"
                    >
                      נסה שוב בעצמך 🏃‍♂️
                    </button>
                  </div>

                  {/* Autopilot Column */}
                  <div className="bg-[#1462A6]/5 p-3 rounded-xl border border-[#1462A6]/20 flex flex-col justify-between items-center backdrop-blur-sm">
                    <div>
                      <h3 className="font-black text-[#1462A6] mb-1 text-xs md:text-sm flex flex-row-reverse items-center gap-1.5 justify-center">
                        <Bot size={16} className="animate-pulse" /> סיוע בטייס אוטומטי
                      </h3>
                      <p className="text-[11px] md:text-xs text-[#241819]/90 font-bold leading-relaxed text-right">
                        כדי למנוע תסכול או שעמום, אנו מציעים להפעיל את הטייס האוטומטי. הדבר יאפשר לכם להתרכז <b>במאה אחוז</b> בכיוונון הסליידר (מהירות זרימת המים) והתאמת הקושי בדיוק לרמה שלכם או של תלמידיכם.
                      </p>
                    </div>
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
                      className="mt-2.5 w-full bg-gradient-to-b from-[#368ABF] to-[#1462A6] hover:from-[#4aa1d5] hover:to-[#0f4f85] text-white font-black py-2 rounded-lg border border-[#0d4273] shadow-sm text-xs cursor-pointer transition-all active:translate-y-0.5 flex flex-row-reverse items-center gap-1.5 justify-center"
                    >
                      <Bot size={12} /> הפעל טייס אוטומטי ונסה שוב!
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="p-5 flex flex-col gap-4 border-t-[4px] border-[#1462A6] bg-[#FEFCF8]"
          >
            <div className="flex flex-col md:flex-row gap-4 items-stretch bg-[#FDFCF8]/50 p-3 rounded-xl border border-[#368ABF]/20 shadow-inner backdrop-blur-sm">
              <div className="w-full md:w-2/3">
                <Controls speed={speed} onSpeedChange={setSpeed} disabled={uiState.status !== 'playing'} />
              </div>
              <div className="w-full md:w-1/3 flex border-t md:border-t-0 md:border-r border-[#368ABF]/20 pt-3 md:pt-0 md:pr-4">
                <SkillProgress skill={uiState.skill} />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-3 border-t border-[#1462A6]/20">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={uiState.status !== 'playing'}
                className={`flex flex-row-reverse items-center justify-center gap-2 py-3 px-8 rounded-xl font-black text-white transition-all outline-none active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPlaying
                    ? 'bg-gradient-to-b from-[#E69881] to-[#BF3F4A] border-2 border-[#751d24] shadow-[0_4px_0_#751d24] active:shadow-none'
                    : 'bg-gradient-to-b from-[#368ABF] to-[#1462A6] border-2 border-[#0d4273] shadow-[0_4px_0_#0d4273] active:shadow-none'
                }`}
              >
                {isPlaying ? <Pause size={18} className="drop-shadow-sm" /> : <Play size={18} className="drop-shadow-sm" />}
                <span className="drop-shadow-sm text-base">{isPlaying ? 'השהה' : 'התחל מסע'}</span>
              </button>
              <button
                onClick={resetGame}
                className="flex items-center justify-center py-3 px-5 rounded-xl font-black text-[#1462A6] bg-gradient-to-b from-[#FEFCF8] to-[#DEE4E4] border-2 border-[#b5bebe] hover:from-[#fff] hover:to-[#cfd7d7] transition-all shadow-[0_4px_0_#b5bebe] active:shadow-none active:translate-y-0.5 cursor-pointer"
                title="איפוס המשחק"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={handleAutopilotToggle}
                className={`flex flex-row-reverse items-center justify-center gap-2 py-3 px-6 rounded-xl font-black transition-all border-2 active:translate-y-0.5 cursor-pointer ${
                  isAutopilotEnabled
                    ? 'bg-gradient-to-b from-[#368ABF] to-[#1462A6] text-white border-[#0d4273] shadow-[0_4px_0_#0d4273] active:shadow-none'
                    : 'bg-gradient-to-b from-[#F2DC99] to-[#F2CA99] text-[#241819] border-[#c4a868] hover:from-[#faeac1] hover:to-[#fadbb5] shadow-[0_4px_0_#c4a868] active:shadow-none'
                }`}
                title={isAutopilotEnabled ? 'כבה טייס אוטומטי' : 'הפעל טייס אוטומטי'}
              >
                <Bot size={18} className={isAutopilotEnabled ? 'animate-bounce text-[#FEFCF8]' : 'text-[#1462A6]'} />
                <span className="text-base">{isAutopilotEnabled ? 'טייס אוטומטי פעיל' : 'הפעל טייס אוטומטי'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* First-time Confirmation Modal */}
      {showFirstTimeConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir="rtl">
          <div
            className="border-[6px] border-[#1462A6] rounded-2xl p-6 max-w-md w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-fade-in relative overflow-hidden bg-[#FEFCF8]"
          >
            <div className="absolute inset-0 bg-[#FDFCF8]/10 pointer-events-none" />
            <div className="relative z-10 w-full">
              <h3 className="text-2xl font-black text-[#1462A6] mb-3 flex justify-center items-center gap-2 font-aloja">
                <Bot size={28} className="animate-bounce" /> הפעלת טייס אוטומטי?
              </h3>
              <p className="text-[#241819] font-black text-sm mb-5 leading-relaxed bg-[#FDFCF8]/40 p-3 rounded-lg border border-[#368ABF]/10 text-right">
                האם אתה בטוח שברצונך להשתמש בטייס האוטומטי? שימוש בו עלול לפגוע בחוויית המשחק ובאתגר האישי של למידת האיזון בעצמך.
              </p>
              <div className="flex flex-row-reverse gap-3 justify-center">
                <button
                  onClick={() => {
                    setIsAutopilotEnabled(true);
                    setShowFirstTimeConfirm(false);
                  }}
                  className="bg-gradient-to-b from-[#368ABF] to-[#1462A6] hover:from-[#4aa1d5] hover:to-[#0f4f85] text-white font-black py-2 px-5 rounded-lg border border-[#0d4273] transition-all text-sm cursor-pointer shadow-sm"
                >
                  כן, הפעל טייס אוטומטי
                </button>
                <button
                  onClick={() => setShowFirstTimeConfirm(false)}
                  className="bg-gradient-to-b from-[#FEFCF8] to-[#DEE4E4] hover:from-[#fff] hover:to-[#cfd7d7] text-[#241819] font-black py-2 px-5 rounded-lg border border-[#b5bebe] transition-all text-sm cursor-pointer shadow-sm"
                >
                  לא, אשחק בעצמי
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failed-Before Educational Suggestion Modal */}
      {showFailedSuggest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir="rtl">
          <div
            className="border-[6px] border-[#1462A6] rounded-2xl p-6 max-w-lg w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-fade-in relative overflow-hidden bg-[#FEFCF8]"
          >
            <div className="absolute inset-0 bg-[#FDFCF8]/10 pointer-events-none" />
            <div className="relative z-10 w-full">
              <h3 className="text-2xl font-black text-[#1462A6] mb-3 flex justify-center items-center gap-2 font-aloja">
                <Bot size={28} className="text-[#1462A6] animate-bounce" /> המלצה מנצחת לטייס האוטומטי! 💡
              </h3>
              <p className="text-[#241819] font-black text-sm mb-5 leading-relaxed bg-[#FDFCF8]/40 p-4 rounded-lg border border-[#368ABF]/10 text-right">
                טייס אוטומטי מופעל כעת!
                <br />
                במצב זה הפיראט יבצע את הקפיצות בעצמו, מה שיאפשר לך <b className="text-[#1462A6]">להתרכז במאה אחוז בשינוי סליידר המהירות</b> (מד זרימת המים) על מנת ללמוד כיצד להתאים את רמת הקושי בדיוק לרמת התלמידים שלך או לרמה האישית שלך!
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setIsAutopilotEnabled(true);
                    setShowFailedSuggest(false);
                  }}
                  className="bg-gradient-to-b from-[#368ABF] to-[#1462A6] hover:from-[#4aa1d5] hover:to-[#0f4f85] text-white font-black py-2.5 px-8 rounded-xl border border-[#0d4273] transition-all text-base shadow-md cursor-pointer"
                >
                  הבנתי, הפעל טייס אוטומטי ונתחיל! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

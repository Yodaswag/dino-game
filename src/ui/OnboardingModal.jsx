import React from 'react';
import { Anchor } from 'lucide-react';

export function OnboardingModal({ onStart }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3" dir="rtl">
      <div className="bg-[#f4e4c1] border-4 border-[#bca07c] rounded-xl p-5 max-w-xl w-full text-center shadow-2xl relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, #f3e5ab 0%, #dfc38f 100%)', boxShadow: 'inset 0 0 20px rgba(139,69,19,0.3), 0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        <div className="relative z-10 text-center w-full">
          <h1 className="text-4xl font-black flex justify-center items-center gap-3 drop-shadow-sm mb-4" style={{ fontFamily: 'Aloja, Rubik, sans-serif', color: '#264f73' }}>
            <Anchor className="text-[#264f73] drop-shadow-sm" size={30} /> THE FLOWING TIDE
          </h1>

          <div className="text-[#5c3a21] mb-5 text-base font-bold flex flex-col items-center gap-3 bg-white/30 p-4 rounded-lg border border-[#bca07c]/50">
            <p className="leading-relaxed">
              המטרה שלכם היא לעזור לפיראט לשמור על מצב <b>"זרימה" (Flow)</b> למשך 20 שניות.
            </p>
            <p className="text-sm leading-relaxed">
              עליכם לאזן בין <b>רמת הקושי</b> לבין <b>רמת המיומנות</b> של הפיראט.
              אם יהיה קשה מדי - הוא יתוסכל. אם יהיה קל מדי - הוא ישתעמם!
            </p>

            <div className="flex items-center gap-1.5 justify-center flex-wrap">
              שמרו על איזון בין האתגר לבין
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#a16207] border border-[#713f12] shadow-[0_0_5px_rgba(234,179,8,0.6)] flex items-center justify-center relative mx-0.5">
                <div className="absolute w-3 h-3 rounded-full border border-[#ca8a04] opacity-70"></div>
              </div>
              רמת המיומנות של הפיראט!
            </div>

            <div className="flex items-center gap-3 justify-center flex-wrap bg-[#4a2e1b]/10 px-4 py-2 rounded-lg border border-[#bca07c]/50 mt-1">
              <span className="bg-[#8b5a2b] text-[#f5ebd9] px-3 py-1 rounded-md text-sm font-black shadow-sm tracking-wider">מטרה</span>
              <span className="text-xl">💰</span>
              <span className="font-black text-[#4a2e1b] text-lg">20 שניות של FLOW!</span>
              <span className="text-[#bca07c] mx-2 font-bold">|</span>
              <span className="text-sm font-medium">איך? הקישו על</span>
              <kbd className="bg-[#fdfbf7] border-2 border-[#bca07c] border-b-[4px] rounded-md px-3 py-1 text-sm font-black text-[#5c3a21] shadow-sm flex items-center justify-center mx-1 font-sans">Space</kbd>
              <span className="text-sm font-medium">לקפיצה</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-white font-bold py-3 px-8 rounded-xl shadow-[0_6px_0_#78350f] border-2 border-[#78350f] transition-all transform active:translate-y-1 active:shadow-none text-xl"
          >
            התחל לשחק
          </button>
        </div>
      </div>
    </div>
  );
}

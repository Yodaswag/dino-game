import React from 'react';
import { Anchor } from 'lucide-react';

export function OnboardingModal({ onStart }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 animate-fade-in" dir="rtl">
      <div
        className="border-[6px] border-[#1462A6] rounded-2xl p-6 max-w-xl w-full text-center relative overflow-hidden"
        style={{
          backgroundColor: '#FEFCF8'
        }}
      >
        {/* Subtle decorative inner overlay */}
        <div className="absolute inset-0 bg-[#FDFCF8]/10 pointer-events-none" />

        <div className="relative z-10 text-center w-full">
          <h1
            className="text-4xl font-black flex justify-center items-center gap-3 mb-5 tracking-wide drop-shadow-sm font-aloja"
            style={{ color: '#264f73' }}
          >
            <Anchor className="animate-bounce" size={32} style={{ color: '#264f73' }} /> JUMP TO THE SHIP
          </h1>

          <div className="text-[#241819] mb-6 text-base font-black flex flex-col items-stretch text-right gap-4 bg-[#FDFCF8]/60 p-5 rounded-xl border border-[#368ABF]/30 backdrop-blur-sm shadow-inner">
            <p className="leading-relaxed text-lg text-right">
              המטרה שלכם היא לעזור לפיראט לשמור על מצב <b className="text-[#1462A6] font-extrabold">"זרימה" (Flow)</b> למשך 20 שניות.
            </p>
            <p className="text-sm leading-relaxed font-bold text-[#241819]/90 text-right">
              עליכם לאזן בין <b>רמת הקושי</b> לבין <b>רמת המיומנות</b> של הפיראט.
              אם יהיה קשה מדי - הוא יתוסכל. אם יהיה קל מדי - הוא ישתעמם!
            </p>

            <div className="flex flex-row-reverse items-center gap-1.5 justify-end flex-wrap font-bold text-sm w-full text-right">
              <span>שמרו על איזון בין האתגר לבין</span>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FEFCF8] via-[#F2DC99] to-[#F2CA99] border border-[#1462A6] shadow-sm flex items-center justify-center relative mx-0.5">
                <div className="absolute w-3 h-3 rounded-full border border-[#368ABF] opacity-70"></div>
              </div>
              <span>רמת המיומנות של הפיראט!</span>
            </div>

            <div className="flex flex-row-reverse items-center gap-3 justify-end flex-wrap bg-[#DEE4E4]/40 px-4 py-2.5 rounded-lg border border-[#368ABF]/30 mt-1 shadow-sm w-full text-right">
              <span className="bg-[#BF3F4A] text-[#FEFCF8] px-3 py-1 rounded-md text-xs font-black shadow-sm tracking-wider">מטרה</span>
              <span className="text-xl">💰</span>
              <span className="font-black text-[#1462A6] text-lg">20 שניות של FLOW!</span>
              <span className="text-[#368ABF]/50 mx-1 font-bold">|</span>
              <span className="text-sm font-bold">איך? הקישו על</span>
              <kbd className="bg-[#FEFCF8] border-2 border-[#1462A6] border-b-[4px] rounded-md px-3 py-0.5 text-sm font-black text-[#1462A6] shadow-sm flex items-center justify-center mx-1 font-sans" dir="ltr">Space</kbd>
              <span className="text-sm font-bold">לקפיצה</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="bg-gradient-to-b from-[#E69881] to-[#BF3F4A] hover:from-[#f5aba2] hover:to-[#d0404b] text-[#FEFCF8] font-black py-3.5 px-10 rounded-xl shadow-[0_6px_0_#751d24] border-2 border-[#751d24] transition-all transform active:translate-y-1 active:shadow-none text-xl cursor-pointer"
          >
            התחל לשחק
          </button>
        </div>
      </div>
    </div>
  );
}

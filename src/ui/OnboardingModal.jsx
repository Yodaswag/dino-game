import React from 'react';

export function OnboardingModal({ onStart }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f4e4c1] border-4 border-[#bca07c] rounded-xl p-6 max-w-lg w-full text-center shadow-2xl">
        <h2 className="text-3xl font-black text-[#4a2e1b] mb-4 font-serif">ברוכים הבאים למסע!</h2>
        <p className="text-[#5c3a21] text-lg mb-6 leading-relaxed">
          המטרה שלכם היא לעזור לפיראט לשמור על מצב <b>"זרימה" (Flow)</b> למשך 20 שניות.
          <br /><br />
          עליכם לאזן בין <b>רמת הקושי</b> (מרחק ומהירות) לבין <b>רמת המיומנות</b> של הפיראט. 
          אם יהיה קשה מדי - הוא יתסוכל. אם יהיה קל מדי - הוא ישתעמם!
        </p>
        <button 
          onClick={onStart}
          className="bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-white font-bold py-3 px-8 rounded-lg shadow-md border-2 border-[#78350f] transition-all transform active:scale-95 text-xl"
        >
          התחל לשחק
        </button>
      </div>
    </div>
  );
}

import React from 'react';

export function SkillProgress({ skill }) {
  return (
    <div
      className="flex flex-col w-full h-full px-5 py-5 gap-4 rounded-lg border border-[#1462A6]/20 text-right justify-between"
      dir="rtl"
      style={{
        backgroundImage: "url('/dino-game/assets/images/flow-game/texture.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      <label className="flex flex-row-reverse items-center justify-between gap-3 text-base font-bold font-serif text-[#241819] text-right">
        <span className="font-black leading-tight">רמת מיומנות הפיראט</span>
        <span className="text-[#FEFCF8] bg-[#1462A6] px-3 py-1 rounded-md border border-[#1462A6] font-bold shadow-sm shrink-0">{Math.floor(skill)}%</span>
      </label>
      <div className="w-full h-4 bg-[#DEE4E4] rounded-full appearance-none border border-[#368ABF]/30 shadow-inner overflow-hidden" dir="ltr">
        <div className="bg-gradient-to-r from-[#1462A6] to-[#368ABF] h-full transition-all duration-300 shadow-sm" style={{ width: `${skill}%` }}></div>
      </div>
      <p className="text-xs text-[#241819]/80 font-medium text-right leading-relaxed">המיומנות עולה ככל שהמשחק נמשך, ויורדת כאשר נכשלים.</p>
    </div>
  );
}

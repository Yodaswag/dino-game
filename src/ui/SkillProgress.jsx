import React from 'react';

export function SkillProgress({ skill }) {
  return (
    <div className="flex flex-col w-full">
      <label className="flex justify-between text-base font-bold mb-3 font-serif text-[#f5ebd9]">
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#a16207] border border-[#713f12] shadow-[0_0_5px_rgba(234,179,8,0.6)] flex items-center justify-center relative">
            <div className="absolute w-2.5 h-2.5 rounded-full border border-[#ca8a04] opacity-70"></div>
          </div>
          רמת מיומנות הפיראט
        </span>
        <span className="text-amber-400 bg-[#1a0c05] px-2 py-0.5 rounded border border-[#3e1f0f]">{Math.floor(skill)}%</span>
      </label>
      <div className="w-full h-4 bg-[#110804] rounded-full appearance-none border border-[#4a2815] shadow-inner overflow-hidden" dir="ltr">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(252,211,77,0.5)]" style={{ width: `${skill}%` }}></div>
      </div>
      <p className="text-xs text-[#d4a373] mt-2 font-medium">המיומנות עולה ככל שהמשחק נמשך, ויורדת כאשר נכשלים.</p>
    </div>
  );
}

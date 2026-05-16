import React from 'react';
import { Waves, Wind } from 'lucide-react';

export function Controls({ gaps, speed, onGapsChange, onSpeedChange, disabled }) {
  return (
    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-8 bg-[#3e1f0f]/40 p-4 rounded-lg border border-[#4a2815]">
      <div>
        <label className="flex justify-between text-base font-bold mb-3 font-serif text-[#f5ebd9]">
          <span className="flex items-center gap-2"><Waves className="text-sky-400" size={20} /> מרחק בין התיבות</span>
          <span className="text-amber-400 bg-[#1a0c05] px-2 py-0.5 rounded border border-[#3e1f0f]">{gaps}</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={gaps} 
          onChange={(e) => onGapsChange(Number(e.target.value))} 
          disabled={disabled} 
          className="w-full h-4 bg-[#110804] rounded-full appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 border border-[#4a2815] shadow-inner" 
        />
        <p className="text-xs text-[#bca07c] mt-2">רמת הקושי של המסלול</p>
      </div>
      <div>
        <label className="flex justify-between text-base font-bold mb-3 font-serif text-[#f5ebd9]">
          <span className="flex items-center gap-2"><Wind className="text-sky-400" size={20} /> מהירות זרימת המים</span>
          <span className="text-amber-400 bg-[#1a0c05] px-2 py-0.5 rounded border border-[#3e1f0f]">{speed}</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={speed} 
          onChange={(e) => onSpeedChange(Number(e.target.value))} 
          disabled={disabled} 
          className="w-full h-4 bg-[#110804] rounded-full appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 border border-[#4a2815] shadow-inner" 
        />
        <p className="text-xs text-[#bca07c] mt-2">קצב ההתקדמות</p>
      </div>
    </div>
  );
}

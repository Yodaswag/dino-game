import React from 'react';
import { Wind } from 'lucide-react';

export function Controls({ speed, onSpeedChange, disabled }) {
  return (
    <div className="flex-1 w-full bg-[#241819]/10 p-4 rounded-lg border border-[#1462A6]/20 shadow-sm text-right" dir="rtl">
      <div>
        <label className="flex flex-row-reverse justify-between text-base font-bold mb-3 font-serif text-[#241819] text-right">
          <span className="flex items-center gap-2 font-black"><Wind className="text-[#1462A6]" size={20} /> מהירות זרימת המים</span>
          <span className="text-[#FEFCF8] bg-[#1462A6] px-2.5 py-0.5 rounded border border-[#1462A6] font-bold shadow-sm">{speed}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-4 bg-[#DEE4E4] rounded-full appearance-none cursor-pointer accent-[#1462A6] disabled:opacity-50 border border-[#368ABF]/30 shadow-inner"
        />
        <p className="text-xs text-[#241819]/80 mt-2 font-medium text-right">הסרגל משנה גם את קצב ההתקדמות וגם את צפיפות האתגר במסלול.</p>
      </div>
    </div>
  );
}

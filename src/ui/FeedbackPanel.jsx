import React from 'react';
import { AlertTriangle, Coffee, Zap } from 'lucide-react';

export function FeedbackPanel({ emotion }) {
  const getEmotionConfig = () => {
    switch (emotion) {
      case 'frustrated': return { icon: <AlertTriangle className="w-8 h-8 text-red-500" />, text: 'מתוסכל', color: 'text-red-400', msg: 'קשה מדי! הורד מהירות או תדירות פערים.' };
      case 'bored': return { icon: <Coffee className="w-8 h-8 text-sky-400" />, text: 'משועמם', color: 'text-sky-300', msg: 'קל מדי! העלה את האתגר.' };
      case 'flow': return { icon: <Zap className="w-8 h-8 text-emerald-400" />, text: 'זרימה (Flow)', color: 'text-emerald-400', msg: 'איזון מושלם! שמור על זה.' };
      default: return { icon: <Zap className="w-8 h-8 text-emerald-400" />, text: '', color: '', msg: '' };
    }
  };

  const config = getEmotionConfig();
  
  return (
    <div className="flex flex-row-reverse items-center gap-4 w-fit min-w-[280px] bg-[#f4e4c1]/60 border border-[#bca07c] rounded-lg p-3 shadow-md backdrop-blur-md text-right" dir="rtl">
      <div className="bg-[#1a0c05] p-2 rounded-lg border border-[#4a2815] shadow-inner">{config.icon}</div>
      <div>
        <span className={`font-black text-2xl block ${config.color} font-serif [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]`}>{config.text}</span>
        <span className="text-base text-[#f5ebd9] font-black [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]">{config.msg}</span>
      </div>
    </div>
  );
}

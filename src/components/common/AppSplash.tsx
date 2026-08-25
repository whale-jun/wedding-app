import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface AppSplashProps {
  onFinish: () => void;
}

export const AppSplash: React.FC<AppSplashProps> = ({ onFinish }) => {
  // Ultra-optimized 0.75s total opening (0.35s text -> 0.65s ring -> 0.75s enter app)
  const [stage, setStage] = useState<'text' | 'ring' | 'fadeout'>('text');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('ring'), 320);
    const t2 = setTimeout(() => setStage('fadeout'), 620);
    const t3 = setTimeout(() => onFinish(), 750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-rose-500 via-pink-500 to-rose-600 text-white transition-opacity duration-150 ${
      stage === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Ambient background soft glow */}
      <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-rose-900/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xs">
        {/* Stage 1: Typography ("Will you marry me?") */}
        {stage === 'text' && (
          <div className="space-y-1.5 animate-fadeIn">
            <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-rose-200 block">
              Wedding Planner
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif italic font-extrabold tracking-tight drop-shadow-md text-white">
              Will you marry me?
            </h1>
            <div className="w-8 h-0.5 bg-rose-200/60 mx-auto mt-1.5 rounded-full" />
          </div>
        )}

        {/* Stage 2: Ring Shine Animation */}
        {(stage === 'ring' || stage === 'fadeout') && (
          <div className="flex flex-col items-center space-y-2 animate-scaleUp">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-3xl shadow-lg shadow-rose-950/20">
                💍
              </div>
              <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '2s' }} />
            </div>
            <h2 className="text-base font-black tracking-tight text-white drop-shadow">
              으ㅔ딩어픙
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

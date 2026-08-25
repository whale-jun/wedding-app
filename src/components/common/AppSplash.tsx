import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface AppSplashProps {
  onFinish: () => void;
}

export const AppSplash: React.FC<AppSplashProps> = ({ onFinish }) => {
  // Ultra-fast 0.5s total opening sequence (0.2s text -> 0.4s ring -> 0.5s finish)
  const [stage, setStage] = useState<'text' | 'ring' | 'fadeout'>('text');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('ring'), 200);
    const t2 = setTimeout(() => setStage('fadeout'), 400);
    const t3 = setTimeout(() => onFinish(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] w-screen h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-rose-500 via-pink-500 to-rose-600 text-white transition-opacity duration-100 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
      stage === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Notch & Ambient soft background glow */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-rose-900/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xs">
        {/* Stage 1: Typography ("Will you marry me?") */}
        {stage === 'text' && (
          <div className="space-y-1.5 animate-fadeIn">
            <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-rose-200 block">
              Romantic Wedding Planner
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif italic font-extrabold tracking-tight drop-shadow-md text-white">
              Will you marry me?
            </h1>
            <div className="w-8 h-0.5 bg-rose-200/60 mx-auto mt-1.5 rounded-full" />
          </div>
        )}

        {/* Stage 2: Fast Ring Shine */}
        {(stage === 'ring' || stage === 'fadeout') && (
          <div className="flex flex-col items-center space-y-2 animate-scaleUp">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-3xl shadow-lg shadow-rose-950/20">
                💍
              </div>
              <Sparkles className="absolute -top-1.5 -right-1.5 w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '1.5s' }} />
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

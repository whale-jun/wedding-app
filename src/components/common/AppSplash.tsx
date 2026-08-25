import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface AppSplashProps {
  onFinish: () => void;
}

export const AppSplash: React.FC<AppSplashProps> = ({ onFinish }) => {
  // Lightning-fast 1.0s total splash (0.5s text -> 0.8s ring -> 1.0s finish)
  const [stage, setStage] = useState<'text' | 'ring' | 'fadeout'>('text');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('ring'), 450);
    const t2 = setTimeout(() => setStage('fadeout'), 850);
    const t3 = setTimeout(() => onFinish(), 1050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-rose-500 via-pink-500 to-rose-600 text-white transition-opacity duration-200 ${
      stage === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Decorative ambient blurred lights */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-rose-900/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Stage 1: Typography ("Will you marry me?") */}
        {stage === 'text' && (
          <div className="space-y-2 animate-fadeIn">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-rose-200 block">
              Romantic Wedding Planner
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif italic font-extrabold tracking-tight drop-shadow-md text-white">
              Will you marry me?
            </h1>
            <div className="w-10 h-0.5 bg-rose-200/60 mx-auto mt-2 rounded-full" />
          </div>
        )}

        {/* Stage 2: Fast Ring Shine */}
        {(stage === 'ring' || stage === 'fadeout') && (
          <div className="flex flex-col items-center space-y-3 animate-scaleUp">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-4xl shadow-xl shadow-rose-950/30">
                💍
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white drop-shadow">
              으ㅔ딩어픙
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

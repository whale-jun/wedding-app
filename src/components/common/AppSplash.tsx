import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface AppSplashProps {
  onFinish: () => void;
}

export const AppSplash: React.FC<AppSplashProps> = ({ onFinish }) => {
  // Animation stages:
  // 1: 'text' ("Will you marry me?") (0 ~ 1.0s)
  // 2: 'ring' (Ring bounces with shine) (1.0s ~ 1.8s)
  // 3: 'logo' (Wedding App title and subtitle) (1.8s ~ 2.4s)
  // 4: 'fadeout' -> onFinish (2.4s ~ 2.7s)
  const [stage, setStage] = useState<'text' | 'ring' | 'logo' | 'fadeout'>('text');

  useEffect(() => {
    const t1 = setTimeout(() => setStage('ring'), 900);
    const t2 = setTimeout(() => setStage('logo'), 1700);
    const t3 = setTimeout(() => setStage('fadeout'), 2400);
    const t4 = setTimeout(() => onFinish(), 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-rose-500 via-pink-500 to-rose-600 text-white transition-opacity duration-300 ${
      stage === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Decorative ambient blurred lights */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-rose-900/20 blur-3xl pointer-events-none animate-pulse" />

      {/* Floating subtle hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-1/4 left-1/5 w-6 h-6 text-white/20 animate-bounce" style={{ animationDuration: '3s' }} />
        <Heart className="absolute top-1/3 right-1/4 w-4 h-4 text-white/25 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <Heart className="absolute bottom-1/4 left-1/3 w-5 h-5 text-white/20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Stage 1: Typography ("Will you marry me?") */}
        {stage === 'text' && (
          <div className="space-y-3 animate-fadeIn">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-rose-200 block">
              Romantic Wedding Planner
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif italic font-extrabold tracking-tight drop-shadow-md text-white">
              Will you marry me?
            </h1>
            <div className="w-12 h-0.5 bg-rose-200/60 mx-auto mt-3 rounded-full" />
          </div>
        )}

        {/* Stage 2: Ring Shine Animation */}
        {stage === 'ring' && (
          <div className="flex flex-col items-center space-y-4 animate-scaleUp">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-5xl shadow-2xl shadow-rose-950/30 transform hover:rotate-6 transition">
                💍
              </div>
              <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 rounded-3xl bg-white/30 animate-ping pointer-events-none" style={{ animationDuration: '1.5s' }} />
            </div>
            <h2 className="text-xl font-bold text-rose-100 italic font-serif">
              Our Special Wedding Story
            </h2>
          </div>
        )}

        {/* Stage 3: App Brand & Logo */}
        {(stage === 'logo' || stage === 'fadeout') && (
          <div className="flex flex-col items-center space-y-3 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-white text-rose-500 shadow-2xl flex items-center justify-center text-4xl mb-1 border-2 border-white/60">
              💍
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
              으ㅔ딩어픙
            </h1>
            <p className="text-xs font-semibold text-rose-100 bg-white/20 px-3.5 py-1 rounded-full backdrop-blur-sm">
              ✨ 두 사람의 완벽한 AI 웨딩 플래너
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

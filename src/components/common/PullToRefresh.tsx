import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Heart } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, className = '' }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  
  const startY = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 65; // px to trigger refresh

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
      setHasTriggeredHaptic(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop <= 0) {
      // Apply rubber band resistance
      const distance = Math.min(diff * 0.45, 90);
      setPullDistance(distance);

      // Haptic feedback when threshold crossed
      if (distance >= THRESHOLD && !hasTriggeredHaptic) {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(15);
          } catch (err) {}
        }
        setHasTriggeredHaptic(true);
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(55); // Hold at refreshing height

      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 450);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`flex-1 w-full overflow-y-auto relative overscroll-y-contain flex flex-col ${className}`}
    >
      {/* Pull Indicator Banner */}
      <div
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-200 pointer-events-none"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0
        }}
      >
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur shadow-md border border-rose-200 text-rose-600 animate-fadeIn">
          <div className="relative flex items-center justify-center">
            <span className="text-sm">💍</span>
            <RefreshCw
              className={`w-3.5 h-3.5 text-rose-500 absolute ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: !isRefreshing ? `rotate(${pullDistance * 4}deg)` : undefined
              }}
            />
          </div>
          <span className="text-xs font-black tracking-tight text-slate-700">
            {isRefreshing
              ? '최신 커플 데이터 동기화 중...'
              : pullDistance >= THRESHOLD
              ? '손을 놓으면 새로고침 💕'
              : '당겨서 실시간 새로고침'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
};

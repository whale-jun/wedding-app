import React, { useEffect, useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Heart, Bell, CheckCircle2, Calendar, DollarSign, X } from 'lucide-react';

export interface PartnerActivity {
  id: string;
  senderName: string;
  senderRole: 'groom' | 'bride';
  category: 'checklist' | 'calendar' | 'budget' | 'profile' | 'general';
  title: string;
  detail?: string;
  timestamp: number;
}

export const PartnerActivityToast: React.FC = () => {
  const { setActiveTab } = useWedding();
  const [currentActivity, setCurrentActivity] = useState<PartnerActivity | null>(null);

  useEffect(() => {
    const handleActivityEvent = (e: CustomEvent<PartnerActivity>) => {
      if (e.detail) {
        setCurrentActivity(e.detail);
      }
    };

    window.addEventListener('partner_activity_notification' as any, handleActivityEvent);
    return () => {
      window.removeEventListener('partner_activity_notification' as any, handleActivityEvent);
    };
  }, []);

  useEffect(() => {
    if (!currentActivity) return;
    const timer = setTimeout(() => {
      setCurrentActivity(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentActivity]);

  if (!currentActivity) return null;

  const roleEmoji = currentActivity.senderRole === 'groom' ? '🤵' : '👰';
  const roleName = currentActivity.senderRole === 'groom' ? '신랑' : '신부';

  const handleClickToast = () => {
    if (currentActivity.category === 'checklist') setActiveTab('checklist');
    else if (currentActivity.category === 'calendar') setActiveTab('calendar');
    else if (currentActivity.category === 'budget') setActiveTab('budget');
    setCurrentActivity(null);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[130] w-full max-w-sm px-4 animate-slideDown pointer-events-auto">
      <div 
        onClick={handleClickToast}
        className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-rose-400/40 flex items-start space-x-3 cursor-pointer hover:bg-black transition active:scale-98"
      >
        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl flex-shrink-0 mt-0.5 border border-rose-500/30">
          {currentActivity.category === 'checklist' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {currentActivity.category === 'calendar' && <Calendar className="w-5 h-5 text-pink-400" />}
          {currentActivity.category === 'budget' && <DollarSign className="w-5 h-5 text-amber-400" />}
          {currentActivity.category !== 'checklist' && currentActivity.category !== 'calendar' && currentActivity.category !== 'budget' && (
            <Bell className="w-5 h-5 text-rose-400 animate-bounce" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-300">
            <span>{roleEmoji} {currentActivity.senderName || roleName}님의 실시간 소식</span>
            <span className="text-[10px] bg-rose-500/30 px-1.5 py-0.2 rounded-full text-rose-200">방금</span>
          </div>
          <p className="text-xs font-black text-white mt-0.5 truncate">
            {currentActivity.title}
          </p>
          {currentActivity.detail && (
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              {currentActivity.detail}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentActivity(null);
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export function triggerPartnerToast(activity: PartnerActivity) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('partner_activity_notification', { detail: activity });
    window.dispatchEvent(event);
  }
}

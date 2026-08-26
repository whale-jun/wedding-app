import React from 'react';
import { Sparkles, Bell, CheckCircle2, Calendar, DollarSign, Heart } from 'lucide-react';

export interface ActivityNotification {
  id: string;
  senderRole: 'groom' | 'bride';
  senderName: string;
  title: string;
  description: string;
  category: 'checklist' | 'calendar' | 'budget' | 'couple' | 'general';
  timestamp: number;
}

interface ActivityToastProps {
  notification: ActivityNotification | null;
  onClose: () => void;
}

export const ActivityToast: React.FC<ActivityToastProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const roleEmoji = notification.senderRole === 'groom' ? '🤵' : '👰';
  const roleName = notification.senderRole === 'groom' ? '신랑님' : '신부님';
  const displayName = notification.senderName || roleName;

  const getCategoryIcon = () => {
    switch (notification.category) {
      case 'checklist':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'budget':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'couple':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-3 pointer-events-none animate-slideDown">
      <div 
        onClick={onClose}
        className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-rose-200/90 flex items-center space-x-3 cursor-pointer hover:bg-rose-50/50 transition transform active:scale-98"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-lg flex-shrink-0 text-white shadow-md">
          {roleEmoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100 flex items-center gap-1">
              {getCategoryIcon()}
              <span>실시간 커플 알림</span>
            </span>
            <span className="text-[10px] text-slate-400">방금 전</span>
          </div>

          <h4 className="text-xs font-black text-slate-800 tracking-tight mt-0.5 truncate">
            {displayName}님이 {notification.title}
          </h4>
          <p className="text-[11px] text-slate-500 truncate">
            {notification.description}
          </p>
        </div>
      </div>
    </div>
  );
};

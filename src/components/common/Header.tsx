import React, { useState, useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Heart, 
  Calendar, 
  Settings, 
  Bell, 
  BellOff, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles,
  ShieldCheck,
  Lock,
  User,
  Users,
  UserPlus,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { requestNotificationPermission } from '../../utils/notifications';
import { userAuth } from '../../utils/userAuth';

export const Header: React.FC = () => {
  const { 
    profile, 
    dDay, 
    exportAllDataJSON, 
    importAllDataJSON, 
    resetToSampleData,
    resetOnboarding,
    openProfileModal,
    openAccountModal,
    loggedInUser,
    refreshAllData,
    isSyncing,
    lastSyncedAt
  } = useWedding();
  
  const [hasNotification, setHasNotification] = useState(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNotificationToggle = async () => {
    const granted = await requestNotificationPermission();
    setHasNotification(granted);
    if (granted) {
      alert('🔔 결혼 일정 및 결제일 알림이 활성화되었습니다!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllDataJSON(content);
        if (success) {
          alert('데이터를 성공적으로 복원했습니다!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-rose-100/80 shadow-soft pt-[max(env(safe-area-inset-top),16px)] transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo & Couple Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 p-0.5 shadow-md flex items-center justify-center flex-shrink-0 cursor-pointer transform hover:scale-105 transition" 
              onClick={() => openProfileModal('info')}
            >
              <div className="w-full h-full bg-white/95 rounded-[13px] flex items-center justify-center">
                <span className="text-base sm:text-lg">💍</span>
              </div>
            </div>

            <div className="truncate">
              <div className="flex items-center space-x-1.5 truncate">
                <h1 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight truncate">
                  으ㅔ딩어픙
                </h1>
                
                {/* Couple Pairing Badge */}
                <button
                  onClick={() => openProfileModal('invite')}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                    profile.isPartnerConnected
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200 animate-pulse'
                  }`}
                  title="커플 연결 상태 확인 및 초대"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.isPartnerConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{profile.isPartnerConnected ? '연결됨' : '상대초대+'}</span>
                </button>

                {/* Cloud Sync Status */}
                <div 
                  className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md border font-medium ${
                    isSyncing 
                      ? 'text-sky-600 bg-sky-50 border-sky-100' 
                      : 'text-slate-400 bg-slate-50 border-slate-100'
                  }`}
                  title={lastSyncedAt ? `마지막 동기화: ${new Date(lastSyncedAt).toLocaleTimeString()}` : '서버 연결 중...'}
                >
                  {isSyncing ? (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  ) : lastSyncedAt ? (
                    <Cloud className="w-2.5 h-2.5" />
                  ) : (
                    <CloudOff className="w-2.5 h-2.5" />
                  )}
                  <span className="hidden xs:inline">
                    {isSyncing ? '동기화 중' : '동기화됨'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-medium truncate">
                <span className="text-rose-600 font-bold truncate">
                  {profile.myRole === 'groom' ? '🤵 신랑' : '👰 신부'} {profile.myRole === 'groom' ? (profile.groomName || '신랑님') : (profile.brideName || '신부님')}
                </span>
                <span className="text-slate-300">❤️</span>
                <span className="text-slate-600 font-semibold truncate">
                  {profile.myRole === 'groom' ? (profile.brideName || '신부님') : (profile.groomName || '신랑님')}
                </span>
              </div>
            </div>
          </div>

          {/* D-Day badge only */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* D-Day Banner */}
            <div 
              onClick={() => openProfileModal('info')}
              className="cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 sm:px-4 py-1.5 rounded-2xl shadow-sm hover:shadow-md transition transform hover:scale-102 flex items-center space-x-1.5 border border-rose-400/30"
              title="예식일 및 프로필 설정"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="text-xs sm:text-sm font-black tracking-wider drop-shadow-xs">
                {dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-DAY' : `D+${Math.abs(dDay)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

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
  Users,
  UserPlus,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { requestNotificationPermission } from '../../utils/notifications';

export const Header: React.FC = () => {
  const { 
    profile, 
    dDay, 
    exportAllDataJSON, 
    importAllDataJSON, 
    resetToSampleData,
    resetOnboarding,
    openProfileModal,
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

          {/* D-Day badge & Quick Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* D-Day Banner */}
            <div 
              onClick={() => openProfileModal('info')}
              className="cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md transition transform hover:scale-102 flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span className="text-xs sm:text-sm font-black tracking-wide">
                {dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-DAY' : `D+${Math.abs(dDay)}`}
              </span>
            </div>

            {/* Notification Permission Button */}
            <button
              onClick={handleNotificationToggle}
              title={hasNotification ? '일정 알림 활성화됨' : '일정 브라우저 알림 켜기'}
              className={`p-1.5 sm:p-2 rounded-xl border transition text-xs flex items-center ${
                hasNotification
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
            >
              {hasNotification ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            </button>

            {/* Data Actions Dropdown / Tools */}
            <div className="relative group">
              <button
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center"
                title="데이터 백업 & 관리"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 hidden group-hover:block hover:block z-50 animate-fadeIn">
                <button
                  onClick={exportAllDataJSON}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-rose-500" />
                  전체 데이터 백업 (JSON)
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-500" />
                  백업 파일 불러오기
                </button>
                <button
                  onClick={resetToSampleData}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  초기 샘플 데이터로 복원
                </button>
                <button
                  onClick={() => {
                    if (confirm('초기 인트로 화면을 다시 보시겠습니까?')) {
                      resetOnboarding();
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  초기 인트로 화면 다시보기
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Profile Settings */}
            <button
              onClick={() => openProfileModal('info')}
              className="p-1.5 sm:p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center"
              title="설정 (커플 정보 & 초대)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

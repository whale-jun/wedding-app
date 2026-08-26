import React, { useState, useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  UserPlus, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Layers
} from 'lucide-react';

export const QuickActionSheet: React.FC = () => {
  const {
    openAccountModal,
    loggedInUser,
    refreshAllData,
    isSyncing,
    openProfileModal,
    exportAllDataJSON,
    importAllDataJSON,
    resetToSampleData,
    resetOnboarding
  } = useWedding();

  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importAllDataJSON(content);
        setIsOpen(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      {/* 1. STANDALONE FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-22 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-13 h-13 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 border-2 border-white/80 animate-bounce"
          style={{ animationDuration: '3s' }}
          title="퀵 액션 & 도구 메뉴"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1 rounded-full bg-rose-400/40 blur-md group-hover:bg-rose-500/60 transition pointer-events-none" />
          
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
        </button>
      </div>

      {/* 2. SLIDE-UP BOTTOM SHEET MODAL */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-[32px] p-5 pb-8 shadow-2xl border-t border-rose-100 flex flex-col space-y-4 animate-slideUp max-h-[85vh] overflow-y-auto"
          >
            {/* Sheet Handle & Header */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      웨딩 퀵 메뉴 & 도구
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      계정 보존, 실시간 동기화, 커플 초대 및 데이터 관리
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Action 1: Account Login / Backup */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openAccountModal();
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 group active:scale-98 ${
                  loggedInUser 
                    ? 'bg-indigo-50/80 border-indigo-200 hover:bg-indigo-100' 
                    : 'bg-rose-50/80 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl text-white ${loggedInUser ? 'bg-indigo-600' : 'bg-rose-500'}`}>
                    {loggedInUser ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {loggedInUser ? '보존 중' : '영구 보관'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-rose-600 transition truncate">
                    {loggedInUser ? `@${loggedInUser}` : '계정 보존 / 로그인'}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {loggedInUser ? '클라우드 자동 백업 활성' : '기기 변경 시에도 100% 복원'}
                  </p>
                </div>
              </button>

              {/* Action 2: Realtime Sync Refresh */}
              <button
                onClick={async () => {
                  await refreshAllData();
                  setIsOpen(false);
                }}
                className="p-3.5 rounded-2xl border border-sky-100 bg-sky-50/80 hover:bg-sky-100 text-left transition flex flex-col justify-between space-y-2 group active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-sky-500 text-white">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold text-sky-600">
                    {isSyncing ? '동기화 중' : '즉시 갱신'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-sky-700 transition">
                    실시간 동기화 새로고침
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    상대방 최신 데이터 즉시 재조회
                  </p>
                </div>
              </button>

              {/* Action 3: Partner Invite */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openProfileModal('invite');
                }}
                className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/80 hover:bg-amber-100 text-left transition flex flex-col justify-between space-y-2 group active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500 text-white">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700">카톡/문자</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-amber-700 transition">
                    커플 초대 링크 보내기
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    상대방과 0.1초 원클릭 연동
                  </p>
                </div>
              </button>

              {/* Action 4: Profile & Date Settings */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  openProfileModal('info');
                }}
                className="p-3.5 rounded-2xl border border-pink-100 bg-pink-50/80 hover:bg-pink-100 text-left transition flex flex-col justify-between space-y-2 group active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-pink-500 text-white">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-pink-700">프로필</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-pink-700 transition">
                    웨딩 정보 & 예식일 설정
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    예식 날짜, 장소, 예산 목표 수정
                  </p>
                </div>
              </button>

              {/* Action 5: JSON Export */}
              <button
                onClick={() => {
                  exportAllDataJSON();
                  setIsOpen(false);
                }}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition flex flex-col justify-between space-y-2 group active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-700 text-white">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">JSON</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-slate-900 transition">
                    전체 데이터 백업 (JSON)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    내 파일로 안전하게 저장하기
                  </p>
                </div>
              </button>

              {/* Action 6: JSON Import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition flex flex-col justify-between space-y-2 group active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-700 text-white">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">불러오기</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 group-hover:text-slate-900 transition">
                    백업 파일 복원 (JSON)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    저장해둔 JSON 파일 불러오기
                  </p>
                </div>
              </button>
            </div>

            {/* Extra Tools: Sample Reset & Intro Replay */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
              <button
                onClick={() => {
                  if (confirm('초기 인트로 화면을 다시 보시겠습니까?')) {
                    setIsOpen(false);
                    resetOnboarding();
                  }
                }}
                className="flex items-center gap-1 hover:text-rose-600 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>인트로 다시보기</span>
              </button>

              <button
                onClick={() => {
                  resetToSampleData();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>샘플 데이터로 초기화</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      )}
    </>
  );
};

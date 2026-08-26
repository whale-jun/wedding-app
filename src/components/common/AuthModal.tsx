import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { userAuth } from '../../utils/userAuth';
import { X, Lock, KeyRound, ShieldCheck, User, CheckCircle2, ArrowRight, CloudUpload, LogIn, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { 
    isAuthModalOpen,
    closeAuthModal,
    profile, 
    budget, 
    checklist, 
    events, 
    compareSections, 
    guests, 
    gatherings, 
    honeymoon, 
    aiMilestones,
    importAllDataJSON,
    triggerConfetti
  } = useWedding();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen;
  const onClose = propOnClose || closeAuthModal;

  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState<string | null>(() => userAuth.getCurrentUsername());

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }
    if (password.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      alert('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const fullData = {
        profile,
        budget,
        checklist,
        events,
        compareSections,
        guests,
        gatherings,
        honeymoon,
        aiMilestones
      };

      const result = await userAuth.registerAccount(username, password, fullData);
      if (result.success) {
        setCurrentLoggedInUser(username.trim().toLowerCase());
        triggerConfetti();
        alert(`🎉 [${username}] 계정으로 내 모든 웨딩 정보가 클라우드에 안전하게 백업되었습니다!\n앞으로 브라우저를 닫거나 다른 기기로 접속해도 이 아이디로 로그인하면 그대로 복원됩니다.`);
        onClose();
      } else {
        alert(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await userAuth.loginAccount(username, password);
      if (result.success && result.data) {
        // Restore all wedding data
        importAllDataJSON(JSON.stringify(result.data));
        setCurrentLoggedInUser(username.trim().toLowerCase());
        triggerConfetti();
        alert(`🎉 ${result.message}`);
        onClose();
      } else {
        alert(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까? (현재 기기의 데이터는 유지됩니다)')) {
      userAuth.logout();
      setCurrentLoggedInUser(null);
      alert('로그아웃되었습니다.');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[28px] shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-rose-100 animate-scaleUp z-[111]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black">내 정보 클라우드 보존 & 로그인</h2>
              <p className="text-[11px] text-rose-100">아이디/비밀번호로 기기 변경 시에도 100% 안전 보관</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab switcher */}
        {currentLoggedInUser ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                [{currentLoggedInUser}] 계정으로 보호 중
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                현재 모든 웨딩 일정이 클라우드에 실시간으로 안전하게 자동 보관되고 있습니다.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  await userAuth.autoSave({ profile, budget, checklist, events, compareSections, guests, gatherings, honeymoon, aiMilestones });
                  setIsLoading(false);
                  triggerConfetti();
                  alert('클라우드에 최신 데이터가 즉시 백업되었습니다!');
                }}
                disabled={isLoading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <CloudUpload className="w-4 h-4" />
                <span>지금 최신 데이터 즉시 백업하기</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>다른 아이디로 로그인 / 로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  tab === 'register' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400'
                }`}
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>1. 내 정보 백업 등록 (가입)</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  tab === 'login' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>2. 기존 아이디로 불러오기</span>
              </button>
            </div>

            <div className="p-6">
              {tab === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 text-xs text-rose-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      아이디/비밀번호만 정해두시면 데이터가 영구 보존됩니다!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      휴대폰을 변경하거나 카톡 링크로 다시 접속해도 언제든 완벽하게 복원할 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">사용할 아이디</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="예: minjun2026"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-rose-400 outline-none bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">비밀번호</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="4자리 이상 입력"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-rose-400 outline-none bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">비밀번호 확인</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={passwordConfirm}
                        onChange={e => setPasswordConfirm(e.target.value)}
                        placeholder="비밀번호 다시 입력"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-rose-400 outline-none bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLoading ? '안전하게 백업 중...' : '내 웨딩 정보 영구 보존 등록하기 💕'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold">기존에 등록한 아이디로 로그인</p>
                    <p className="text-[11px] text-slate-400">
                      등록했던 아이디와 비밀번호를 입력하면 이전에 작성한 일정, 예산, 체크리스트가 즉시 복원됩니다.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">아이디</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="등록한 아이디"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-rose-400 outline-none bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">비밀번호</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-rose-400 outline-none bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:bg-black text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>{isLoading ? '데이터 불러오는 중...' : '내 정보 불러오기 & 로그인'}</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Lock, User, ShieldCheck, Download, Upload, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { 
    registerCloudAccount, 
    loginCloudAccount, 
    logoutCloudAccount,
    loggedInUser,
    triggerConfetti 
  } = useWedding();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      if (mode === 'register') {
        const res = await registerCloudAccount(username, password);
        if (res.success) {
          triggerConfetti();
          setStatusMsg({ type: 'success', text: res.message });
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setStatusMsg({ type: 'error', text: res.message });
        }
      } else {
        const res = await loginCloudAccount(username, password);
        if (res.success) {
          triggerConfetti();
          setStatusMsg({ type: 'success', text: res.message });
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setStatusMsg({ type: 'error', text: res.message });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp max-h-[88vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                {loggedInUser ? '계정 연동 관리' : '클라우드 계정 영구 보존'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {loggedInUser ? `로그인됨: @${loggedInUser}` : '기기 변경이나 캐시 삭제에도 100% 안전 보관'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loggedInUser ? (
          /* Logged In Status Card */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-900">
                  @{loggedInUser} 계정으로 안전하게 보호 중
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  데이터 수정 시 클라우드 계정에 자동 백업(Auto-Save)됩니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logoutCloudAccount();
                onClose();
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
            >
              로그아웃 (현재 기기에서만 해제)
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 rounded-lg transition ${
                  mode === 'register' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                계정 등록 (데이터 백업)
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 rounded-lg transition ${
                  mode === 'login' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                로그인 (데이터 복원)
              </button>
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">아이디 (3자 이상)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="예: minsu_love"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">비밀번호 (4자 이상)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>처리 중...</span>
                ) : mode === 'register' ? (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>내 모든 웨딩 데이터 영구 백업하기 💕</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>내 웨딩 데이터 불러와 복원하기 📦</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

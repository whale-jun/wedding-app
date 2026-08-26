import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Send,
  Link,
  Check,
  CheckCircle2,
  Lock,
  User,
  Phone,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { generateCoupleInviteCode } from '../../utils/codeGenerator';
import { buildInviteUrl } from '../../utils/realtimePairing';
import { cloudSync } from '../../utils/cloudSyncEngine';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { 
    profile, 
    updateProfile, 
    checkPairingStatusNow,
    loginCloudAccount,
    triggerConfetti 
  } = useWedding();

  // Onboarding View Modes:
  // 'start' (Choice: Start New vs Login) -> 'login' (ID/PW Login) -> 'form' (Step 1 info) -> 'invite' (Step 2 invite)
  const [viewMode, setViewMode] = useState<'start' | 'login' | 'form' | 'invite'>('start');

  // Login form states
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Step 1 Profile states
  const [name, setName] = useState('');
  const [role, setRole] = useState<'groom' | 'bride'>(profile.myRole || 'groom');
  const [phone, setPhone] = useState('');
  const [weddingDate, setWeddingDate] = useState(profile.weddingDate || '2026-11-21');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Safe active invite code & Dynamic Real URL for GitHub Pages / PWA
  const currentInviteCode = profile.inviteCode || 'WD-7729-LOVE';
  const inviteLink = buildInviteUrl({
    code: currentInviteCode,
    myRole: role,
    groomName: role === 'groom' ? name : profile.groomName,
    brideName: role === 'bride' ? name : profile.brideName,
    weddingDate: weddingDate,
    weddingVenue: profile.weddingVenue,
    budgetGoal: profile.budgetGoal
  });

  // AUTO ADVANCE: When partner accepts invite and connects, automatically enter main screen!
  useEffect(() => {
    if (profile.isPartnerConnected) {
      triggerConfetti();
      onComplete();
    }
  }, [profile.isPartnerConnected, onComplete, triggerConfetti]);

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await loginCloudAccount(loginId, loginPw);
      if (res.success) {
        triggerConfetti();
        alert('🎉 환영합니다! 기존 결혼 준비 데이터를 성공적으로 복원했습니다. 💕');
        onComplete();
      } else {
        setLoginError(res.message || '아이디 또는 비밀번호를 다시 확인해주세요.');
      }
    } catch (err) {
      setLoginError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Step 1 (Info Input) Submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    const codeToUse = profile.inviteCode || generateCoupleInviteCode();
    
    // Save to global context & local storage
    updateProfile({
      myRole: role,
      groomName: role === 'groom' ? name.trim() : profile.groomName,
      brideName: role === 'bride' ? name.trim() : profile.brideName,
      weddingDate: weddingDate,
      inviteCode: codeToUse
    });

    // Register initial waiting state in Cloud Sync Room
    cloudSync.connectRoom(codeToUse);
    cloudSync.pushState({
      roomCode: codeToUse,
      status: 'WAITING',
      groomName: role === 'groom' ? name.trim() : undefined,
      brideName: role === 'bride' ? name.trim() : undefined,
      myRole: role,
      weddingDate: weddingDate
    });

    setViewMode('invite');
  };

  // Handle Copy Link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2500);
    } catch (err) {
      prompt("아래 초대 링크를 복사하여 상대방에게 전달해주세요:", inviteLink);
    }
  };

  // Handle Kakao / SMS Share
  const handleShare = async () => {
    const shareText = `💍 [으ㅔ딩어픙] ${name || (role === 'groom' ? '신랑' : '신부')}님이 당신을 결혼 준비 메이트로 초대했습니다!\n\n아래 링크를 누르면 두 분의 폰이 실시간으로 연결되어 함께 예산, 체크리스트, 일정을 관리할 수 있습니다 💕\n${inviteLink}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '으ㅔ딩어픙 - 커플 결혼 준비 초대장',
          text: shareText,
          url: inviteLink,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
      alert('초대 링크가 복사되었습니다! 카카오톡이나 문자로 상대방에게 전달해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#ffe4e6] via-[#fff1f2] to-[#faf7f5] flex flex-col justify-center items-center p-4 sm:p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto select-none">
      {/* Background Floating Soft Glows */}
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-rose-300/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-pink-300/25 blur-3xl pointer-events-none animate-pulse" />

      {/* ─────────────────────────────────────────────────────────────
          1. START SCREEN (Choice: Start New vs Login)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'start' && (
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-6 animate-scaleUp text-center">
          {/* Logo & Ring */}
          <div className="space-y-3">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 p-0.5 shadow-lg shadow-rose-200/80 mx-auto flex items-center justify-center transform hover:scale-105 transition">
              <div className="w-full h-full bg-white/95 rounded-[22px] flex items-center justify-center text-3xl">
                💍
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-rose-500 block">
                AI Couple Wedding Planner
              </span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
                으ㅔ딩어픙
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                가장 완벽하고 설레는 둘만의 결혼 준비 메이트
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Start New */}
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className="w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-rose-200 active:scale-98 transition flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>새로 시작하기 (정보 입력)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            {/* Login Existing Account */}
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black shadow-md active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span>기존 계정으로 로그인 (데이터 복원)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>기기 변경 시에도 아이디로 언제든 100% 복원 가능</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. LOGIN SCREEN (ID/PW Restore)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'login' && (
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-5 animate-scaleUp">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setViewMode('start')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center flex-1 pr-6">
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                계정 로그인
              </h3>
              <p className="text-[11px] text-slate-400">
                기존에 저장해둔 결혼 준비 데이터를 복원합니다
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">아이디</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="등록했던 아이디 입력"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={loginPw}
                  onChange={e => setLoginPw(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              {loginLoading ? <span>불러오는 중...</span> : <span>로그인 & 내 데이터 복원하기 📦</span>}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold"
            >
              처음이신가요? 새로 시작하기 ➔
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. STEP 1: INFO INPUT FORM
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'form' && (
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-5 animate-scaleUp max-h-[88vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setViewMode('start')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center flex-1 pr-6">
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500">Step 1 of 2</span>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                나의 정보 입력
              </h3>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">당신의 역할은 무엇인가요?</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('groom')}
                  className={`py-3 px-3 rounded-2xl border-2 flex items-center justify-center space-x-2 text-xs font-bold transition ${
                    role === 'groom'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">🤵</span>
                  <span>신랑 (Groom)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('bride')}
                  className={`py-3 px-3 rounded-2xl border-2 flex items-center justify-center space-x-2 text-xs font-bold transition ${
                    role === 'bride'
                      ? 'border-rose-500 bg-rose-50/80 text-rose-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">👰</span>
                  <span>신부 (Bride)</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">이름 (성함)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={role === 'groom' ? "예: 이준선 (신랑)" : "예: 김민서 (신부)"}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                  required
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">예정된 결혼식 날짜</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={weddingDate}
                  onChange={e => setWeddingDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Submit Step 1 */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 mt-2"
            >
              <span>다음: 상대방 초대 링크 생성 ➔</span>
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setViewMode('login')}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              이미 계정이 있으신가요? <span className="text-rose-500 font-bold underline">로그인하기</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. STEP 2: COUPLE INVITE LINK & WAITING
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'invite' && (
        <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-rose-100 p-6 sm:p-7 space-y-5 animate-scaleUp max-h-[88vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-slate-100 pb-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500">Step 2 of 2</span>
            <h3 className="text-base font-black text-slate-800 tracking-tight">
              {name}님, 환영합니다! 🎉
            </h3>
            <p className="text-xs text-slate-500">
              상대방에게 초대 링크를 보내면 실시간 커플 연동이 시작됩니다.
            </p>
          </div>

          {/* Action Card */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-3 text-center">
            <div className="text-xs font-bold text-rose-900 flex items-center justify-between">
              <span>💌 커플 초대 링크 보내기</span>
              <span className="text-[10px] text-rose-500 font-normal">원클릭 실시간 연동</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-left">
              카카오톡이나 문자로 초대장을 보내면, 상대방이 링크를 누르는 즉시 두 분의 폰이 실시간으로 연결됩니다!
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShare}
                className="py-3 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>카톡/문자 초대장</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 px-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition"
              >
                {isLinkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link className="w-4 h-4" />}
                <span>{isLinkCopied ? '링크 복사됨' : '초대링크 복사'}</span>
              </button>
            </div>

            {/* Live Waiting Status */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-rose-200 space-y-2.5 shadow-xs text-left mt-2">
              <div className="flex items-start space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0 animate-ping" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-rose-700 block">
                    상대방의 초대 수락을 실시간 대기 중입니다 💕
                  </span>
                  상대방이 링크를 열고 성함을 입력하면 즉시 자동으로 연동되어 메인 화면으로 이동합니다.
                </div>
              </div>

              {/* Manual Refresh Status Button */}
              <button
                type="button"
                onClick={async () => {
                  const connected = await checkPairingStatusNow();
                  if (connected) {
                    alert('🎉 상대방과 연동이 확인되었습니다! 메인 화면으로 이동합니다. 💕');
                    onComplete();
                  } else {
                    alert('아직 상대방이 초대를 수락하지 않았습니다.\n상대방에게 링크를 전송한 후 다시 확인해주세요.');
                  }
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>상대방 초대 수락 상태 새로고침 🔄</span>
              </button>
            </div>
          </div>

          {/* Start Directly Button */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5"
            >
              <span>결혼 준비 시작하기 (메인으로 이동)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

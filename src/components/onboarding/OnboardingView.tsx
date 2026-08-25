import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Send,
  Link,
  Smartphone,
  CheckCircle2,
  Lock,
  User,
  Phone,
  RotateCcw
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
    generateNewInviteCode,
    connectPartnerWithCode, 
    checkPairingStatusNow,
    triggerConfetti 
  } = useWedding();

  // Animation sequence states: 'form' (AppSplash handles app opening)
  const [animStage, setAnimStage] = useState<'text' | 'ring-center' | 'ring-top' | 'form'>('form');
  
  // Step in form: 1 (profile input: name, role, phone) -> 2 (couple invite / enter code)
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<'groom' | 'bride'>(profile.myRole || 'groom');
  const [phone, setPhone] = useState('');
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Safe active invite code & Dynamic Real URL for GitHub Pages / PWA
  const currentInviteCode = profile.inviteCode || 'WD-7729-LOVE';
  const inviteLink = buildInviteUrl({
    code: currentInviteCode,
    myRole: role,
    groomName: role === 'groom' ? name : profile.groomName,
    brideName: role === 'bride' ? name : profile.brideName,
    weddingDate: profile.weddingDate,
    weddingVenue: profile.weddingVenue,
    budgetGoal: profile.budgetGoal
  });

  // Auto-fill pending invite code from URL parameter
  useEffect(() => {
    const pending = localStorage.getItem('wedding_pending_invite_code');
    if (pending) {
      setPartnerCodeInput(pending);
    }
  }, []);

  // AUTO ADVANCE: When partner accepts invite and connects, automatically enter main screen!
  useEffect(() => {
    if (profile.isPartnerConnected) {
      triggerConfetti();
      onComplete();
    }
  }, [profile.isPartnerConnected, onComplete, triggerConfetti]);

  // Handle Step 1 Submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }

    const codeToUse = profile.inviteCode || generateCoupleInviteCode();

    if (role === 'groom') {
      updateProfile({
        groomName: name.trim(),
        myRole: 'groom',
        inviteCode: codeToUse
      });
      cloudSync.connectRoom(codeToUse);
      cloudSync.pushState({
        roomCode: codeToUse,
        status: 'WAITING',
        groomName: name.trim(),
        myRole: 'groom'
      });
    } else {
      updateProfile({
        brideName: name.trim(),
        myRole: 'bride',
        inviteCode: codeToUse
      });
      cloudSync.connectRoom(codeToUse);
      cloudSync.pushState({
        roomCode: codeToUse,
        status: 'WAITING',
        brideName: name.trim(),
        myRole: 'bride'
      });
    }

    triggerConfetti();
    setStep(2);
  };

  // Handle Step 2: Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentInviteCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Step 2: Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  // Handle Step 2: Share via Kakao / SMS
  const handleShare = async () => {
    const text = `[으ㅔ딩어픙] ${name}님이 결혼 준비에 초대했습니다! 💕\n초대코드: ${currentInviteCode}\n아래 링크를 눌러 실시간으로 함께 결혼을 준비해보세요:\n${inviteLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '으ㅔ딩어픙 커플 초대장',
          text,
          url: inviteLink,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
      alert('초대 링크가 복사되었습니다! 카카오톡이나 문자로 상대방에게 전달해주세요. 💌');
    }
  };

  // Handle Partner Code Entry & Connect
  const handleConnectPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCodeInput.trim()) {
      alert('상대방의 초대 코드를 입력해주세요.');
      return;
    }

    const success = await connectPartnerWithCode(partnerCodeInput.trim());
    if (success) {
      triggerConfetti();
      alert('✨ 축하합니다! 상대방과 커플 연결이 완료되었습니다. 메인 화면으로 이동합니다!');
      onComplete();
    } else {
      alert('유효하지 않은 초대 코드이거나 연결에 실패했습니다. 코드를 다시 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#ffe4e6] via-[#fff1f2] to-[#faf7f5] flex flex-col justify-center items-center p-4 sm:p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto select-none">
      
      {/* BACKGROUND FLOATING DECORATIONS */}
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-rose-300/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-pink-300/25 blur-3xl pointer-events-none animate-pulse" />

      {/* STAGE 1: "Will you marry me?" text */}
      {animStage === 'text' && (
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-xs text-xs font-semibold text-rose-500 border border-rose-100">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
            <span>A New Beginning</span>
          </div>

          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight text-slate-800 drop-shadow-xs"
            style={{ fontFamily: "'Playfair Display', 'Nanum Myeongjo', serif", fontStyle: 'italic' }}
          >
            Will you marry me?
          </h1>

          <p className="text-sm text-slate-500 font-light tracking-wide">
            두 사람의 가장 빛나는 순간을 함께합니다
          </p>
        </div>
      )}

      {/* STAGE 2: Ring in Center */}
      {animStage === 'ring-center' && (
        <div className="text-center space-y-4 animate-scaleUp">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-tr from-rose-400 via-pink-400 to-rose-300 p-1 shadow-2xl flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner">
              <span className="text-5xl sm:text-6xl filter drop-shadow-md">💍</span>
            </div>
          </div>

          <div className="space-y-1 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              으ㅔ딩어픙
            </h2>
            <p className="text-xs text-rose-500 font-semibold tracking-wider">
              AI 스마트 커플 결혼 준비 메이트
            </p>
          </div>
        </div>
      )}

      {/* STAGE 3 & 4: Form View with Ring Anchored at Top */}
      {(animStage === 'ring-top' || animStage === 'form') && (
        <div className="w-full max-w-md my-auto space-y-4 animate-fadeIn">
          
          {/* Top Logo Badge (Ring at Top) */}
          <div className="text-center space-y-1.5 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-2xl">💍</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                으ㅔ딩어픙
              </h2>
              <p className="text-[11px] text-rose-500 font-semibold">
                {step === 1 ? 'Step 1. 내 정보 입력하기' : 'Step 2. 사랑하는 상대방 초대하기'}
              </p>
            </div>
          </div>

          {/* STEP 1: MY PROFILE FORM */}
          {step === 1 && (
            <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-7 shadow-2xl border border-rose-100/80 space-y-5">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800">
                  반가워요! 당신의 정보를 알려주세요 💕
                </h3>
                <p className="text-xs text-slate-500">
                  결혼 준비를 함께할 프로필을 설정합니다.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {/* 1. Role Selection: Groom vs Bride */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    본인의 역할을 선택해주세요
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole('groom')}
                      className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-1 border-2 transition-all ${
                        role === 'groom'
                          ? 'border-rose-500 bg-rose-50/70 text-rose-700 shadow-sm ring-2 ring-rose-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">🤵</span>
                      <span>저는 신랑입니다</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('bride')}
                      className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center space-y-1 border-2 transition-all ${
                        role === 'bride'
                          ? 'border-rose-500 bg-rose-50/70 text-rose-700 shadow-sm ring-2 ring-rose-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">👰</span>
                      <span>저는 신부입니다</span>
                    </button>
                  </div>
                </div>

                {/* 2. Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>이름</span>
                    <span className="text-[11px] text-rose-500 font-normal">
                      {role === 'groom' ? '신랑님 성함' : '신부님 성함'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="성함을 작성해주세요"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-sm font-semibold bg-slate-50/50"
                    required
                  />
                </div>

                {/* 3. Phone Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="010-1234-5678 (- 없이 입력 가능)"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-sm font-medium bg-slate-50/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-sm font-extrabold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 mt-2"
                >
                  <span>다음: 상대방 초대하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: COUPLE INVITE & PAIRING CODE */}
          {step === 2 && (
            <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-6 sm:p-7 shadow-2xl border border-rose-100/80 space-y-5 animate-fadeIn">
              <div className="space-y-1 border-b border-slate-100 pb-3 text-center">
                <div className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full mb-1">
                  <span>{name} {role === 'groom' ? '신랑님' : '신부님'} 환영해요! 🎉</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {role === 'groom' ? '신부님을 초대해보세요 💕' : '신랑님을 초대해보세요 💕'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  초대 링크를 보내 함께 결혼 일정을 실시간으로 관리하세요!
                </p>
              </div>

              {/* 1. MY INVITE CODE CARD */}
              <div className="p-4 bg-gradient-to-br from-rose-50/80 to-pink-50/80 rounded-2xl border border-rose-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                  <span>나의 커플 초대 코드</span>
                  <button
                    type="button"
                    onClick={generateNewInviteCode}
                    className="text-[10px] bg-white text-slate-600 hover:text-rose-600 px-2 py-0.5 rounded-full border border-slate-200 font-bold flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>코드 재발급</span>
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-200/80 flex items-center justify-between shadow-xs">
                  <span className="text-base font-mono font-black text-rose-600 tracking-wider">
                    {currentInviteCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? '복사됨' : '코드 복사'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>카톡/문자 초대</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    {isLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
                    <span>{isLinkCopied ? '링크 복사됨' : '초대링크 복사'}</span>
                  </button>
                </div>

                {/* Live Waiting Status */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-rose-200 space-y-2.5">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0 animate-ping" />
                    <div className="text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-rose-700 block">
                        상대방의 초대 동의를 실시간으로 기다리고 있어요 💕
                      </span>
                      상대방이 링크를 열고 성함을 입력하면, **자동으로 연동이 완료되어 메인 화면으로 이동**합니다.
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
                        alert('아직 상대방이 초대를 수락하지 않았습니다.\n상대방이 링크를 누르고 성함을 입력한 뒤 다시 확인해주세요.');
                      }
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>상대방 초대 수락 상태 새로고침 확인 🔄</span>
                  </button>
                </div>
              </div>

              {/* 2. OR ENTER PARTNER'S CODE */}
              <form onSubmit={handleConnectPartner} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-700">
                  이미 상대방에게 초대 코드를 받으셨나요?
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={partnerCodeInput}
                    onChange={e => setPartnerCodeInput(e.target.value)}
                    placeholder="예: WD-7729-LOVE"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase bg-white outline-none focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition whitespace-nowrap"
                  >
                    연결하고 시작
                  </button>
                </div>
              </form>

              {/* Skip / Direct Entry button */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={onComplete}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <span>초대 나중에 하고 메인 화면으로 이동하기</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

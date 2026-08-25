import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { parseInviteFromUrl, realtimePairing } from '../../utils/realtimePairing';
import { Heart, Sparkles, Check, ArrowRight, UserCheck, Calendar, MapPin, X } from 'lucide-react';

export const PartnerInviteModal: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    connectPartnerWithCode, 
    completeOnboarding,
    triggerConfetti 
  } = useWedding();

  const [inviteData, setInviteData] = useState<ReturnType<typeof parseInviteFromUrl>>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [myName, setMyName] = useState('');
  const [myRole, setMyRole] = useState<'groom' | 'bride'>('bride');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if there is an invite code in URL
    const parsed = parseInviteFromUrl();
    if (parsed && parsed.code) {
      setInviteData(parsed);
      // Determine default role (opposite of sender)
      if (parsed.role) {
        setMyRole(parsed.role === 'groom' ? 'bride' : 'groom');
      } else {
        setMyRole('bride');
      }
      setIsOpen(true);
    }
  }, []);

  if (!isOpen || !inviteData || !inviteData.code) return null;

  const senderRoleName = inviteData.role === 'groom' ? '신랑' : inviteData.role === 'bride' ? '신부' : '배우자';
  const senderDisplayName = inviteData.role === 'groom' 
    ? (inviteData.groomName || '신랑') 
    : (inviteData.brideName || '신부');

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myName.trim()) {
      alert('본인의 성함을 입력해주세요.');
      return;
    }

    setIsConnecting(true);

    try {
      // 1. Update our profile with the invited partner's info
      const updatePayload: any = {
        isPartnerConnected: true,
        partnerConnectedAt: new Date().toISOString(),
        myRole: myRole,
      };

      if (myRole === 'groom') {
        updatePayload.groomName = myName.trim();
        if (inviteData.brideName) updatePayload.brideName = inviteData.brideName;
      } else {
        updatePayload.brideName = myName.trim();
        if (inviteData.groomName) updatePayload.groomName = inviteData.groomName;
      }

      if (inviteData.weddingDate) updatePayload.weddingDate = inviteData.weddingDate;
      if (inviteData.weddingVenue) updatePayload.weddingVenue = inviteData.weddingVenue;
      if (inviteData.budgetGoal) updatePayload.budgetGoal = inviteData.budgetGoal;

      updateProfile(updatePayload);

      // 2. Perform connection & handshake over realtime relay
      await connectPartnerWithCode(inviteData.code);

      // 3. Mark onboarding complete so user sees the shared dashboard
      completeOnboarding();

      // 4. Remove code query param from URL without page reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('role');
        url.searchParams.delete('groom');
        url.searchParams.delete('bride');
        url.searchParams.delete('date');
        url.searchParams.delete('venue');
        url.searchParams.delete('budget');
        window.history.replaceState({}, document.title, url.pathname);
      }

      triggerConfetti();
      setIsOpen(false);
      alert(`🎉 축하합니다! ${senderDisplayName}님과 성공적으로 연결되었습니다!\n지금부터 모든 일정과 예산이 실시간으로 공유됩니다.`);
    } catch (err) {
      console.error(err);
      alert('연결 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border-2 border-rose-200 animate-scaleUp">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-6 text-white text-center relative">
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3 shadow-inner ring-4 ring-white/30 animate-bounce">
            <span className="text-3xl">💍</span>
          </div>

          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-rose-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>커플 초대장 도착</span>
          </div>

          <h2 className="text-xl font-black text-white">
            {senderDisplayName}님의 결혼 준비 초대 💕
          </h2>
          <p className="text-xs text-rose-100 mt-1">
            소중한 결혼 준비를 함께 시작해보세요!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Invitation Details Summary Card */}
          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-2.5">
            <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-400" />
              <span>초대 정보</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="p-2.5 bg-white rounded-xl border border-rose-100/80">
                <span className="text-[11px] text-slate-400 block">초대한 분</span>
                <span className="font-bold text-slate-800">{senderDisplayName} ({senderRoleName})</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-rose-100/80 font-mono">
                <span className="text-[11px] text-slate-400 block">초대 코드</span>
                <span className="font-bold text-rose-600">{inviteData.code}</span>
              </div>
            </div>

            {inviteData.weddingDate && (
              <div className="p-2.5 bg-white rounded-xl border border-rose-100/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  예식 예정일
                </span>
                <span className="font-bold text-slate-800">{inviteData.weddingDate}</span>
              </div>
            )}
          </div>

          {/* Form: Confirm My Name & Role */}
          <form onSubmit={handleAcceptInvite} className="space-y-4">
            {/* My Role Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                본인의 역할을 선택해주세요
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMyRole('bride')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                    myRole === 'bride'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>👰 저는 신부입니다</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMyRole('groom')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                    myRole === 'groom'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>🤵 저는 신랑입니다</span>
                </button>
              </div>
            </div>

            {/* My Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                본인의 이름을 입력해주세요
              </label>
              <input
                type="text"
                value={myName}
                onChange={e => setMyName(e.target.value)}
                placeholder="성함을 입력하세요 (예: 김서연)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs font-bold bg-slate-50"
                required
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-xl active:scale-98 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isConnecting ? (
                <span>실시간 연동 중... ⏳</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>초대 수락 및 실시간 연동 시작하기 💕</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

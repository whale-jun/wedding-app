import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { parseInviteFromUrl, realtimePairing } from '../../utils/realtimePairing';
import { cloudSync } from '../../utils/cloudSyncEngine';
import { Heart, Sparkles, Check, ArrowRight, Calendar, MapPin, DollarSign, UserCheck } from 'lucide-react';

export const PartnerInviteModal: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
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
        inviteCode: inviteData.code || profile.inviteCode
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

      // 2. Push CONNECTED state to cloud room
      const groom = myRole === 'groom' ? myName.trim() : (inviteData.groomName || profile.groomName || '신랑');
      const bride = myRole === 'bride' ? myName.trim() : (inviteData.brideName || profile.brideName || '신부');

      await cloudSync.pushState({
        roomCode: inviteData.code,
        status: 'CONNECTED',
        groomName: groom,
        brideName: bride,
        myRole: myRole,
        weddingDate: inviteData.weddingDate || profile.weddingDate,
        weddingVenue: inviteData.weddingVenue || profile.weddingVenue,
        budgetGoal: inviteData.budgetGoal || profile.budgetGoal
      });

      triggerConfetti();
      completeOnboarding();
      setIsOpen(false);

      // Clean URL params without reloading
      if (window.history.replaceState) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }

      alert(`🎉 축하합니다! ${senderDisplayName}님과의 커플 연결이 완료되었습니다! 💕\n두 분의 행복한 결혼 준비를 함께 시작합니다.`);
    } catch (err) {
      console.error(err);
      alert('연결 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-100 animate-scaleUp">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-3xl shadow-inner mb-3">
            💍
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/25 text-white inline-block mb-1">
            Couple Connection
          </span>
          <h3 className="text-lg font-black tracking-tight">
            {senderDisplayName}님의 결혼 준비 초대
          </h3>
          <p className="text-xs text-rose-100 mt-1">
            소중한 결혼 준비를 함께할 파트너로 초대되었습니다! 💕
          </p>
        </div>

        {/* Invited Wedding Summary Card */}
        <div className="p-5 space-y-4">
          <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-slate-500">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                초대하신 분
              </span>
              <span className="font-bold text-slate-800">
                {senderRoleName} {senderDisplayName}님
              </span>
            </div>
            {inviteData.weddingDate && (
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  예식 예정일
                </span>
                <span className="font-bold text-slate-800">
                  {inviteData.weddingDate}
                </span>
              </div>
            )}
            {inviteData.weddingVenue && (
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  예식 장소
                </span>
                <span className="font-bold text-slate-800">
                  {inviteData.weddingVenue}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleAcceptInvite} className="space-y-3.5">
            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">본인의 역할</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMyRole('groom')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                    myRole === 'groom'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span>🤵 저는 신랑입니다</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMyRole('bride')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                    myRole === 'bride'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span>👰 저는 신부입니다</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                {myRole === 'groom' ? '신랑님 성함' : '신부님 성함'}
              </label>
              <input
                type="text"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="성함을 작성해주세요"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none text-xs font-semibold bg-slate-50/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-black shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isConnecting ? (
                <span>연동 처리 중...</span>
              ) : (
                <>
                  <span>💕 초대 수락하고 함께 시작하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

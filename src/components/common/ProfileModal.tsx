import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  X, 
  Heart, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Percent, 
  Sparkles,
  User,
  Users,
  Copy,
  Check,
  Share2,
  Link,
  ShieldCheck,
  QrCode,
  Send,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

import { buildInviteUrl } from '../../utils/realtimePairing';

export const ProfileModal: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    generateNewInviteCode,
    connectPartnerWithCode, 
    disconnectPartner,
    checkPairingStatusNow,
    triggerConfetti,
    isProfileModalOpen,
    profileModalTab,
    closeProfileModal
  } = useWedding();

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'invite'>(profileModalTab);
  const [formData, setFormData] = useState({ ...profile });
  const [inputPartnerCode, setInputPartnerCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Sync formData and activeSubTab whenever modal opens
  useEffect(() => {
    if (isProfileModalOpen) {
      setFormData({ ...profile });
      setActiveSubTab(profileModalTab);
      // Ensure invite code exists
      if (!profile.inviteCode) {
        generateNewInviteCode();
      }
    }
  }, [isProfileModalOpen, profileModalTab, profile, generateNewInviteCode]);

  useEffect(() => {
    if (isProfileModalOpen) {
      const pending = localStorage.getItem('wedding_pending_invite_code');
      if (pending && !inputPartnerCode) {
        setInputPartnerCode(pending);
      }
    }
  }, [isProfileModalOpen, inputPartnerCode]);

  if (!isProfileModalOpen) return null;

  const currentInviteCode = profile.inviteCode || 'WD-7729-LOVE';
  const inviteLink = buildInviteUrl({
    code: currentInviteCode,
    myRole: profile.myRole,
    groomName: profile.groomName,
    brideName: profile.brideName,
    weddingDate: profile.weddingDate,
    weddingVenue: profile.weddingVenue,
    budgetGoal: profile.budgetGoal
  });

  const handleSaveAndClose = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateProfile(formData);
    triggerConfetti();
    closeProfileModal();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentInviteCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const handleShare = async () => {
    const senderName = profile.myRole === 'groom' ? (profile.groomName || '신랑') : (profile.brideName || '신부');
    const shareText = `[으ㅔ딩어픙] ${senderName}님이 결혼 준비에 초대했습니다! 💕\n초대코드: ${currentInviteCode}\n아래 링크를 눌러 실시간으로 함께 결혼을 준비해보세요:\n${inviteLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '으ㅔ딩어픙 커플 초대장',
          text: shareText,
          url: inviteLink,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
      alert('초대 링크가 클립보드에 복사되었습니다! 카카오톡이나 문자로 상대방에게 전달해주세요. 💌');
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPartnerCode.trim()) {
      alert('상대방의 초대 코드를 입력해주세요.');
      return;
    }
    setIsConnecting(true);
    try {
      const success = await connectPartnerWithCode(inputPartnerCode);
      if (success) {
        alert('✨ 축하합니다! 상대방과 성공적으로 커플 연결되었습니다!\n지금부터 모든 데이터가 실시간으로 동기화됩니다.');
        setInputPartnerCode('');
      } else {
        alert('유효하지 않은 초대 코드이거나 연결에 실패했습니다. 코드를 다시 확인해주세요.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={closeProfileModal}
    >
      {/* Centered Modal Card */}
      <div 
        className="relative bg-white rounded-[28px] shadow-2xl max-w-md w-full max-h-[88vh] overflow-hidden flex flex-col border border-rose-100 animate-scaleUp z-[101]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Top Header with Clear iOS [저장/완료] & [닫기] buttons */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-rose-100 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-100 text-rose-500 rounded-2xl">
              <Heart className="w-4 h-4 fill-rose-400" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800">우리의 웨딩 프로필 설정</h2>
              <p className="text-[11px] text-slate-400">신랑·신부 정보 및 실시간 커플 연결</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Top [저장 / 완료] Button */}
            <button
              type="button"
              onClick={() => handleSaveAndClose()}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>완료</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeProfileModal}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-5 pt-2 bg-slate-50/50 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('info')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'info'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>신랑·신부 정보 설정</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('invite')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 relative ${
              activeSubTab === 'invite'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>커플 초대 & 연결</span>
            {profile.isPartnerConnected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                초대대기
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4 overscroll-contain">
          {activeSubTab === 'info' ? (
            /* TAB 1: PROFILE INFO FORM */
            <form id="profile-form" onSubmit={handleSaveAndClose} className="space-y-4">
              {/* 내 역할 선택 */}
              <div className="space-y-1.5 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100">
                <label className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  현재 로그인(작성자) 본인의 역할
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, myRole: 'groom' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      formData.myRole === 'groom'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>🤵 저는 신랑입니다</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, myRole: 'bride' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                      formData.myRole === 'bride'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>👰 저는 신부입니다</span>
                  </button>
                </div>
              </div>

              {/* 신랑 정보 */}
              <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>🤵 신랑 정보</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">신랑 이름</label>
                    <input
                      type="text"
                      value={formData.groomName}
                      onChange={e => setFormData({ ...formData, groomName: e.target.value })}
                      placeholder="성함을 작성해주세요"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-xs font-semibold bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">신랑 애칭</label>
                    <input
                      type="text"
                      value={formData.groomNickname}
                      onChange={e => setFormData({ ...formData, groomNickname: e.target.value })}
                      placeholder="애칭 입력 (선택)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 신부 정보 */}
              <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>👰 신부 정보</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">신부 이름</label>
                    <input
                      type="text"
                      value={formData.brideName}
                      onChange={e => setFormData({ ...formData, brideName: e.target.value })}
                      placeholder="성함을 작성해주세요"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-xs font-semibold bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500">신부 애칭</label>
                    <input
                      type="text"
                      value={formData.brideNickname}
                      onChange={e => setFormData({ ...formData, brideNickname: e.target.value })}
                      placeholder="애칭 입력 (선택)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 예식 일시 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-500" />
                    예식 일자
                  </label>
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={e => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-xs font-semibold bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">예식 시간</label>
                  <input
                    type="time"
                    value={formData.weddingTime}
                    onChange={e => setFormData({ ...formData, weddingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 outline-none text-xs bg-white"
                  />
                </div>
              </div>

              {/* 예식장 & 총 예산 */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.weddingVenue}
                    onChange={e => setFormData({ ...formData, weddingVenue: e.target.value })}
                    placeholder="웨딩홀명 (예: 아펠가모 공덕)"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  />
                  <input
                    type="text"
                    value={formData.weddingHallName}
                    onChange={e => setFormData({ ...formData, weddingHallName: e.target.value })}
                    placeholder="홀 이름 (예: 마리에홀)"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                    <span>총 목표 예산</span>
                    <span className="text-rose-600 font-bold">{(formData.budgetGoal / 10000).toLocaleString()}만원</span>
                  </label>
                  <input
                    type="number"
                    value={formData.budgetGoal}
                    onChange={e => setFormData({ ...formData, budgetGoal: Number(e.target.value) })}
                    step={1000000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none font-bold"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: COUPLE PAIRING & INVITE */
            <div className="space-y-4">
              {/* Partner Status Card */}
              <div className={`p-4 rounded-2xl border transition ${
                profile.isPartnerConnected 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`p-2 rounded-xl text-lg ${
                      profile.isPartnerConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {profile.isPartnerConnected ? '💍' : '💌'}
                    </span>
                    <div>
                      <div className="text-xs font-black">
                        {profile.isPartnerConnected ? '커플 연결 완료 (실시간 동기화)' : '상대방 초대 대기 중'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {profile.isPartnerConnected 
                          ? `${profile.groomName} 🤵 ❤️ 👰 ${profile.brideName}`
                          : '상대방에게 초대 코드를 보내 함께 준비해보세요!'}
                      </div>
                    </div>
                  </div>

                  {profile.isPartnerConnected && (
                    <button
                      onClick={() => {
                        if (confirm('커플 연결을 해제하시겠습니까?')) {
                          disconnectPartner();
                        }
                      }}
                      className="text-[10px] text-rose-500 font-bold hover:underline px-2 py-1 bg-white rounded-lg border border-rose-200"
                    >
                      연결 해제
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Share My Invite Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>1. 내 커플 초대 코드 보내기</span>
                  <button
                    type="button"
                    onClick={generateNewInviteCode}
                    className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
                    title="새로운 초대 코드 생성"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>코드 재발급</span>
                  </button>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between font-mono">
                  <span className="text-sm font-black text-rose-600 tracking-wider">
                    {currentInviteCode}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? '복사됨' : '코드 복사'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                    <span>{isLinkCopied ? '링크 복사완료' : '초대링크 복사'}</span>
                  </button>
                </div>

                {/* Real-time Waiting for Partner Indicator */}
                {!profile.isPartnerConnected && (
                  <div className="p-3.5 rounded-xl bg-pink-50/80 border border-pink-200 space-y-2.5">
                    <div className="flex items-start space-x-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0 animate-ping" />
                      <div className="text-[11px] text-slate-600 leading-relaxed">
                        <span className="font-bold text-rose-700 block">
                          상대방의 초대 동의를 실시간으로 기다리고 있어요 💕
                        </span>
                        상대방이 전달받은 링크를 누르고 성함을 입력하면, 별도 조작 없이 **양쪽 기기 모두 자동으로 연결 완료**되며 정보가 동기화됩니다.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const connected = await checkPairingStatusNow();
                        if (connected) {
                          alert('🎉 상대방과 연동이 확인되었습니다! 💕');
                        } else {
                          alert('아직 상대방이 초대를 수락하지 않았습니다.\n상대방이 링크를 누르고 성함을 입력한 뒤 다시 확인해주세요.');
                        }
                      }}
                      className="w-full py-2 bg-white hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 shadow-xs transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>연동 상태 새로고침 확인 🔄</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Enter Partner's Code */}
              {!profile.isPartnerConnected && (
                <form onSubmit={handleConnect} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>2. 상대방의 초대 코드 입력하기</span>
                    <span className="text-[10px] text-slate-400">전달받은 코드가 있다면 입력</span>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputPartnerCode}
                      onChange={e => setInputPartnerCode(e.target.value)}
                      placeholder="예: WD-7729-LOVE"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase bg-white outline-none focus:border-rose-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition whitespace-nowrap"
                    >
                      연결하기
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ALWAYS VISIBLE STICKY BOTTOM ACTION BAR */}
        {activeSubTab === 'info' && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-5 py-3 border-t border-rose-100 z-10 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSaveAndClose()}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>수정 완료 및 저장하기 💕</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

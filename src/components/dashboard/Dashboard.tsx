import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import {
  Heart,
  Calendar,
  Wallet,
  CheckSquare,
  Users,
  PlaneTakeoff,
  Scale,
  Mail,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Gift,
  CheckCircle2,
  ChevronRight,
  Share2
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    profile,
    dDay,
    budgetStats,
    checklistStats,
    guestStats,
    packingStats,
    events,
    checklist,
    setActiveTab,
    triggerConfetti,
    openProfileModal
  } = useWedding();

  // D-Day live countdown timer (seconds)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(`${profile.weddingDate}T${profile.weddingTime || '12:00'}:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [profile.weddingDate, profile.weddingTime]);

  // Upcoming 3 events
  const upcomingEvents = [...events]
    .filter(ev => new Date(ev.startDate) >= new Date(new Date().toISOString().slice(0, 10)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Top high priority pending checklist
  const urgentTasks = checklist.filter(c => !c.completed && c.priority === 'high').slice(0, 4);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Hero D-Day & Wedding Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white p-6 sm:p-8 shadow-xl">
        {/* Background decorative circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-rose-900/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>우리의 소중한 결혼 준비 여정</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{profile.groomName || '신랑'}</span>
              <span className="text-rose-200">❤️</span>
              <span>{profile.brideName || '신부'}</span>
              <span className="text-rose-200 font-light text-xl sm:text-2xl">의 웨딩</span>
            </h2>

            <p className="text-rose-100 text-sm max-w-lg font-normal leading-relaxed">
              {profile.memo || '인생의 가장 빛나는 순간, 차근차근 서로 배려하며 즐겁게 준비하기 💕'}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-white/90">
              <span className="px-2.5 py-1 bg-black/15 rounded-lg">
                📍 {profile.weddingVenue} {profile.weddingHallName}
              </span>
              <span className="px-2.5 py-1 bg-black/15 rounded-lg">
                📅 {profile.weddingDate} {profile.weddingTime}
              </span>
            </div>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/25 flex flex-col items-center justify-center flex-shrink-0 min-w-[280px]">
            <div className="text-xs font-semibold text-rose-100 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>본식까지 남은 시간</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center w-full">
              <div className="bg-white/20 rounded-xl p-2">
                <div className="text-xl sm:text-2xl font-black">{timeLeft.days}</div>
                <div className="text-[10px] text-rose-100 font-medium">DAYS</div>
              </div>
              <div className="bg-white/20 rounded-xl p-2">
                <div className="text-xl sm:text-2xl font-black">{timeLeft.hours}</div>
                <div className="text-[10px] text-rose-100 font-medium">HOURS</div>
              </div>
              <div className="bg-white/20 rounded-xl p-2">
                <div className="text-xl sm:text-2xl font-black">{timeLeft.minutes}</div>
                <div className="text-[10px] text-rose-100 font-medium">MINS</div>
              </div>
              <div className="bg-white/20 rounded-xl p-2">
                <div className="text-xl sm:text-2xl font-black">{timeLeft.seconds}</div>
                <div className="text-[10px] text-rose-100 font-medium">SECS</div>
              </div>
            </div>

            <button
              onClick={triggerConfetti}
              className="mt-3 w-full py-1.5 text-xs font-semibold bg-white text-rose-600 rounded-xl hover:bg-rose-50 transition shadow-sm flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              오늘도 축하하기!
            </button>
          </div>
        </div>
      </div>

      {/* Couple Pairing Invite Banner (If Not Connected) */}
      {!profile.isPartnerConnected && (
        <div 
          onClick={() => openProfileModal('invite')}
          className="glass-card glass-card-hover rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border-2 border-rose-200/80 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl text-lg flex-shrink-0 shadow-md">
              💌
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  Couple Connect
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-800">
                  {profile.myRole === 'groom' ? '신부님을 초대하여 함께 결혼을 준비하세요!' : '신랑님을 초대하여 함께 결혼을 준비하세요!'}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                초대 코드 <strong className="text-rose-600 font-mono font-bold">[{profile.inviteCode || 'WD-7729-LOVE'}]</strong> 또는 카카오톡 링크를 보내 실시간으로 일정과 예산을 함께 관리할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openProfileModal('invite');
            }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <span>상대방 초대하기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Smart Planner Callout Box */}
      <div 
        onClick={() => setActiveTab('aiPlanner')}
        className="glass-card glass-card-hover rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950/90 text-white cursor-pointer group border border-purple-400/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-start space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/15 text-amber-300 backdrop-blur border border-white/20 flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wide uppercase">
                AI Planner Autopilot
              </span>
              <span className="text-xs text-purple-200 font-semibold">
                예식일 기준 D-Day 역산 타임라인
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition">
              🤖 30년차 AI 웨딩 플래너가 맞춤 3가지 후보 일정을 준비했습니다!
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              상견례부터 스드메, 촬영, 가봉, 청첩장 모임까지 번거롭게 고민하지 마세요. 각 마일스톤별 최적의 3가지 후보 날짜 중 마음에 드는 날짜를 콕 찍으면 캘린더에 자동 등록됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab('aiPlanner');
          }}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg transition flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>AI 일정 후보 고르기</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Major Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Budget Card */}
        <div 
          onClick={() => setActiveTab('budget')}
          className="glass-card glass-card-hover p-5 rounded-3xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {budgetStats.progressPercentage}% 집행
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">실제 지출 / 총 예산</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {(budgetStats.totalSpent / 10000).toLocaleString()}만
              <span className="text-xs font-normal text-slate-400"> / {(budgetStats.totalGoal / 10000).toLocaleString()}만원</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, budgetStats.progressPercentage)}%` }}
              />
            </div>

            <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
              <span>남은 잔금</span>
              <span className="font-semibold text-rose-500">{(budgetStats.totalBalanceDue / 10000).toLocaleString()}만원</span>
            </div>
          </div>
        </div>

        {/* 2. Checklist Card */}
        <div 
          onClick={() => setActiveTab('checklist')}
          className="glass-card glass-card-hover p-5 rounded-3xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {checklistStats.percentage}% 완료
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">체리리스트 할 일</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {checklistStats.completed}개
              <span className="text-xs font-normal text-slate-400"> / 총 {checklistStats.total}개 준비완료</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${checklistStats.percentage}%` }}
              />
            </div>

            <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
              <span>남은 할 일</span>
              <span className="font-semibold text-rose-600">{checklistStats.total - checklistStats.completed}개</span>
            </div>
          </div>
        </div>

        {/* 3. Guests Card */}
        <div 
          onClick={() => setActiveTab('guest')}
          className="glass-card glass-card-hover p-5 rounded-3xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {guestStats.confirmedGuests}명 참석 확정
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">예상 식권 및 하객</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              식권 {guestStats.totalMeals}장
              <span className="text-xs font-normal text-slate-400"> (총 {guestStats.totalGuests}명 관리)</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden flex">
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${guestStats.totalGuests ? (guestStats.groomGuests / guestStats.totalGuests) * 100 : 50}%` }} 
                title="신랑측"
              />
              <div 
                className="bg-pink-400 h-full" 
                style={{ width: `${guestStats.totalGuests ? (guestStats.brideGuests / guestStats.totalGuests) * 100 : 50}%` }} 
                title="신부측"
              />
            </div>

            <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
              <span>축의금 집계</span>
              <span className="font-semibold text-blue-600">{(guestStats.totalGiftAmount / 10000).toLocaleString()}만원</span>
            </div>
          </div>
        </div>

        {/* 4. Honeymoon Card */}
        <div 
          onClick={() => setActiveTab('honeymoon')}
          className="glass-card glass-card-hover p-5 rounded-3xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {packingStats.percentage}% 짐싸기 완료
            </span>
          </div>

          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">신혼여행지</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5 truncate">
              {useWedding().honeymoon.destination}
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${packingStats.percentage}%` }}
              />
            </div>

            <div className="mt-2.5 flex justify-between text-[11px] text-slate-500">
              <span>패킹 현황</span>
              <span className="font-semibold text-amber-600">{packingStats.packed} / {packingStats.total} 품목</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Upcoming Schedules & Urgent Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Box */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">다가오는 주요 웨딩 일정</h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              전체 달력 보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                다가오는 일정이 없습니다. 달력에서 일정을 추가해보세요!
              </div>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => setActiveTab('calendar')}
                  className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50/80 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color || '#f43f5e' }} />
                      {event.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>📅 {event.startDate} {event.startTime || ''}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-600 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-rose-100">
                    {(() => {
                      const today = new Date().toISOString().slice(0, 10);
                      if (event.startDate === today) return '오늘';
                      const diff = Math.ceil((new Date(event.startDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                      return `D-${diff}`;
                    })()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Urgent Tasks Box */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-pink-100 text-pink-600 rounded-xl">
                <CheckSquare className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">우선순위 높은 할 일</h3>
            </div>
            <button
              onClick={() => setActiveTab('checklist')}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              체리리스트 전체 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                급한 할 일이 모두 완료되었습니다! 🎉
              </div>
            ) : (
              urgentTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setActiveTab('checklist')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/70 hover:border-rose-200 hover:bg-rose-50/20 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5 max-w-[75%]">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded text-[10px] font-medium">
                        {task.category}
                      </span>
                      <span>담당: {task.assignee === 'groom' ? '신랑' : task.assignee === 'bride' ? '신부' : '공동'}</span>
                      {task.dueDate && <span>마감: {task.dueDate}</span>}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-200">
                    중요 🔥
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 8 Quick Entry Action Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 px-1">웨딩 준비 8대 핵심 존 바로가기</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { id: 'aiPlanner', title: '✨ AI 플래너', desc: '3가지 후보 일정', icon: Sparkles, color: 'text-purple-700 bg-purple-100' },
            { id: 'budget', title: '1. 예산 관리', desc: '지출/분담/잔금', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'checklist', title: '2. 체리리스트', desc: 'D-Day별 할일', icon: CheckSquare, color: 'text-rose-600 bg-rose-50' },
            { id: 'calendar', title: '3. 달력/알람', desc: '일정 & 푸시알람', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
            { id: 'comparison', title: '4. 스마트 비교존', desc: '식장/스드메/예복', icon: Scale, color: 'text-indigo-600 bg-indigo-50' },
            { id: 'guest', title: '5. 하객 관리', desc: 'RSVP/식권/축의금', icon: Users, color: 'text-blue-600 bg-blue-50' },
            { id: 'invitation', title: '6. 청첩장 모임', desc: '약속/정산/장소', icon: Mail, color: 'text-pink-600 bg-pink-50' },
            { id: 'honeymoon', title: '7. 신혼여행', desc: '일정/짐싸기/환율', icon: PlaneTakeoff, color: 'text-amber-600 bg-amber-50' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="glass-card glass-card-hover p-4 rounded-2xl text-left flex flex-col justify-between group"
              >
                <div className={`p-2.5 rounded-xl w-fit ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="mt-3">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

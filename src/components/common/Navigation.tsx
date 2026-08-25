import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import {
  LayoutDashboard,
  Bot,
  Wallet,
  CheckSquare,
  CalendarDays,
  Scale,
  Users,
  Mail,
  PlaneTakeoff,
  Menu,
  X,
  Settings,
  Sparkles,
  ChevronRight,
  MessageSquareHeart
} from 'lucide-react';

interface TabItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  isAi?: boolean;
}

export const Navigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    checklistStats, 
    guestStats, 
    aiMilestones, 
    openProfileModal,
    openFeedbackModal
  } = useWedding();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const confirmedAiCount = aiMilestones.filter(m => m.isAppliedToCalendar).length;

  const allTabs: TabItem[] = [
    { id: 'dashboard', name: '홈 대시보드', shortName: '홈', icon: LayoutDashboard },
    { 
      id: 'aiPlanner', 
      name: '✨ AI 플래너', 
      shortName: 'AI플래너', 
      icon: Bot, 
      isAi: true,
      badge: `${confirmedAiCount}/${aiMilestones.length}`
    },
    { id: 'budget', name: '1. 예산 관리', shortName: '예산', icon: Wallet },
    { 
      id: 'checklist', 
      name: '2. 체리리스트', 
      shortName: '체크리스트', 
      icon: CheckSquare,
      badge: (checklistStats.total - checklistStats.completed) > 0 ? (checklistStats.total - checklistStats.completed) : undefined
    },
    { id: 'calendar', name: '3. 달력 & 알람', shortName: '달력', icon: CalendarDays },
    { id: 'comparison', name: '4. 스마트 비교존', shortName: '비교존', icon: Scale },
    { 
      id: 'guest', 
      name: '5. 하객 관리', 
      shortName: '하객', 
      icon: Users,
      badge: guestStats.confirmedGuests
    },
    { id: 'invitation', name: '6. 청첩장 모임', shortName: '청첩모임', icon: Mail },
    { id: 'honeymoon', name: '7. 신혼여행', shortName: '신혼여행', icon: PlaneTakeoff },
  ];

  // Top Sliding Tabs (Excludes AI Planner since it's prominently on bottom bar)
  const topSlidingTabs = allTabs.filter(t => t.id !== 'aiPlanner');

  // Mobile Bottom Main 4 items (Includes AI Planner) + More Menu
  const mobilePrimaryTabs = allTabs.slice(0, 4);
  const isExtraTabActive = allTabs.slice(4).some(t => t.id === activeTab);

  return (
    <>
      {/* 1. TOP HORIZONTAL SLIDING TABS (Swipeable menus below header, without AI Planner) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-rose-100/70 relative z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-none items-center scroll-smooth">
            {topSlidingTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 active:scale-95 shadow-xs ${
                    isActive
                      ? tab.isAi 
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-purple-200 ring-2 ring-purple-300' 
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-200 ring-2 ring-rose-300'
                      : tab.isAi
                        ? 'text-purple-700 bg-purple-50/90 hover:bg-purple-100 border border-purple-200'
                        : 'text-slate-600 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.isAi ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span>{tab.name}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive 
                          ? 'bg-white/30 text-white' 
                          : tab.isAi 
                          ? 'bg-purple-200 text-purple-800' 
                          : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. NATIVE MOBILE FIXED BOTTOM TAB BAR (Always fixed at bottom of screen) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100/80 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.6rem)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:hidden">
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {mobilePrimaryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
                  isActive 
                    ? 'text-rose-600 font-extrabold scale-105' 
                    : tab.isAi 
                    ? 'text-purple-600 font-bold' 
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-xl relative transition ${
                  isActive 
                    ? (tab.isAi ? 'bg-purple-100 shadow-xs' : 'bg-rose-50 shadow-xs') 
                    : ''
                }`}>
                  <Icon className="w-5 h-5" />
                  {tab.badge !== undefined && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{tab.shortName}</span>
              </button>
            );
          })}

          {/* 5th Tab: MORE (전체메뉴 바텀시트) */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all ${
              isExtraTabActive || isMoreMenuOpen 
                ? 'text-rose-600 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${isExtraTabActive || isMoreMenuOpen ? 'bg-rose-50 shadow-xs' : ''}`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">전체메뉴</span>
          </button>
        </div>
      </nav>

      {/* 3. MOBILE 'MORE' BOTTOM SHEET MODAL */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-[32px] w-full max-w-lg p-6 space-y-4 shadow-2xl border-t border-rose-100 max-h-[85vh] overflow-y-auto animate-slideUp pb-[max(env(safe-area-inset-bottom),1.5rem)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">웨딩 준비 전체 메뉴</h3>
                  <p className="text-xs text-slate-400">모든 준비 카테고리를 한눈에</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {allTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition border ${
                      isActive
                        ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                        : 'hover:bg-slate-50 border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${
                        isActive ? 'bg-rose-500 text-white' : tab.isAi ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold truncate">{tab.name}</div>
                        {tab.badge && (
                          <div className="text-[10px] text-slate-400 font-normal">{tab.badge}</div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  openFeedbackModal();
                }}
                className="w-full p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow transition hover:opacity-95"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>지인 사용 의견 & 피드백 보내기 💬</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  openProfileModal('info');
                }}
                className="w-full p-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow"
              >
                <Settings className="w-4 h-4 text-rose-400" />
                <span>커플 정보 & 예식 프로필 수정하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

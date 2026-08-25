import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import {
  Sparkles,
  Bot,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Zap,
  Check,
  Building,
  Camera,
  Shirt,
  Mail,
  Plane,
  Heart
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  hall: { icon: '🏰', bg: 'bg-rose-100', color: 'text-rose-700' },
  sdm: { icon: '📸', bg: 'bg-purple-100', color: 'text-purple-700' },
  honeymoon: { icon: '✈️', bg: 'bg-amber-100', color: 'text-amber-700' },
  fitting: { icon: '👗', bg: 'bg-pink-100', color: 'text-pink-700' },
  invitation: { icon: '💌', bg: 'bg-blue-100', color: 'text-blue-700' },
  final: { icon: '📋', bg: 'bg-emerald-100', color: 'text-emerald-700' },
  ceremony: { icon: '💍', bg: 'bg-red-100', color: 'text-red-700' }
};

export const AiPlannerView: React.FC = () => {
  const {
    profile,
    dDay,
    aiMilestones,
    generateAiSchedule,
    selectMilestoneOption,
    applyMilestoneToCalendar,
    applyAllMilestonesToCalendar,
    setActiveTab,
    triggerConfetti
  } = useWedding();

  const [inputWeddingDate, setInputWeddingDate] = useState(profile.weddingDate);
  const appliedCount = aiMilestones.filter(m => m.isAppliedToCalendar).length;
  const progressPercent = Math.round((appliedCount / aiMilestones.length) * 100) || 0;

  const handleRegenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateAiSchedule(inputWeddingDate);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Hero AI Planner Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-200">
            <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>30년차 베테랑 AI 스마트 웨딩 플래너</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              결혼식 날짜만 넣으세요, 완벽한 웨딩 타임라인을 짜드립니다.
            </h2>
            <p className="text-sm text-purple-200 max-w-2xl leading-relaxed">
              일일이 검색하고 스트레스받지 마세요. 본식 D-Day를 기준으로 역산하여 <strong>가장 이상적인 3가지 후보 일자</strong>를 추천해 드립니다. 마음에 드는 날짜를 콕 찍으면 캘린더 및 알람에 자동 등록됩니다!
            </p>
          </div>

          {/* Quick Date Selector & Auto Generator */}
          <form onSubmit={handleRegenerate} className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
              <Calendar className="w-4 h-4 text-rose-300" />
              <span className="text-xs text-purple-200 font-medium">본식 예정일:</span>
              <input
                type="date"
                value={inputWeddingDate}
                onChange={e => setInputWeddingDate(e.target.value)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              AI 3가지 후보 일정 재계산
            </button>

            <button
              type="button"
              onClick={applyAllMilestonesToCalendar}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg hover:shadow-xl transition flex items-center gap-1.5 ml-auto"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              추천 1순위 후보로 전체 1초 일괄 등록!
            </button>
          </form>
        </div>
      </div>

      {/* Progress & Sync Status Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">AI 플래너 일정 캘린더 동기화 진행률</h3>
          </div>
          <span className="text-sm font-black text-indigo-600">
            {appliedCount} / {aiMilestones.length} 마일스톤 확정 ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
          <span>각 마일스톤별로 우리 커플에게 가장 편한 후보 일자(1, 2, 3)를 선택해주세요.</span>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            내 캘린더 보러가기 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Milestones List with 3 Candidate Options Each */}
      <div className="space-y-6">
        {aiMilestones.map((milestone, mIndex) => {
          const categoryMeta = CATEGORY_ICONS[milestone.category] || CATEGORY_ICONS.hall;

          return (
            <div
              key={milestone.id}
              className={`glass-card rounded-3xl p-5 sm:p-6 space-y-4 border-2 transition ${
                milestone.isAppliedToCalendar
                  ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/20 via-white to-white'
                  : 'border-slate-200/80 hover:border-purple-200'
              }`}
            >
              {/* Milestone Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-2xl text-lg ${categoryMeta.bg} ${categoryMeta.color} flex items-center justify-center flex-shrink-0`}>
                    {categoryMeta.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Step {mIndex + 1} · {milestone.stageName}
                      </span>
                      {milestone.isAppliedToCalendar && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> 캘린더 등록 완료
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800 mt-1">
                      {milestone.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => applyMilestoneToCalendar(milestone.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto ${
                    milestone.isAppliedToCalendar
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-900 hover:bg-black text-white'
                  }`}
                >
                  {milestone.isAppliedToCalendar ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      선택 날짜로 캘린더 갱신
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      선택 날짜로 캘린더 확정 등록
                    </>
                  )}
                </button>
              </div>

              {/* Milestone Description & AI Advice */}
              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {milestone.description}
                </p>

                {milestone.aiAdvice && (
                  <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/80 text-xs text-purple-950 flex items-start gap-2 leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>{milestone.aiAdvice}</div>
                  </div>
                )}
              </div>

              {/* 3 Candidate Option Cards */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI 추천 3가지 후보 일자 중 선택:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {milestone.options.map((opt, optIdx) => {
                    const isSelected = milestone.selectedOptionIndex === optIdx;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => selectMilestoneOption(milestone.id, optIdx)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-200'
                            : 'border-slate-200/80 bg-white hover:border-purple-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              optIdx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : optIdx === 1
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {opt.label}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="text-base font-black text-slate-800">
                              {opt.date}
                            </div>
                            <div className="text-xs font-bold text-purple-600">
                              {opt.tag}
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-normal pt-1 border-t border-slate-100">
                          💡 {opt.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

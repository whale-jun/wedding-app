import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { HoneymoonPackingItem } from '../../types';
import {
  PlaneTakeoff,
  Plus,
  Sparkles,
  Luggage,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  X,
  Hotel,
  DollarSign,
  Calculator,
  Compass,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

const PACKING_CATEGORIES: Record<string, { label: string; icon: string }> = {
  document: { label: '필수 서류 & 머니', icon: '📄' },
  electronics: { label: '전자기기 & 통신', icon: '📱' },
  clothes: { label: '의류 & 수영복', icon: '👗' },
  beauty_medicine: { label: '뷰티 & 상비약', icon: '💊' },
  special: { label: '스페셜 & 물놀이', icon: '🤿' },
  other: { label: '기타 비상용품', icon: '🎒' }
};

export const HoneymoonView: React.FC = () => {
  const {
    honeymoon,
    packingStats,
    updateHoneymoon,
    togglePackingItem,
    addPackingItem,
    deletePackingItem,
    addItineraryActivity,
    deleteItineraryActivity,
    triggerConfetti
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'itinerary' | 'packing' | 'booking' | 'calc'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState<boolean>(false);

  // Form states
  const [activityForm, setActivityForm] = useState({
    time: '10:00',
    description: '',
    location: '',
    cost: 0
  });

  const [packingForm, setPackingForm] = useState<Omit<HoneymoonPackingItem, 'id'>>({
    category: 'document',
    name: '',
    packed: false,
    assignedTo: 'joint',
    memo: ''
  });

  // Currency calculation state
  const [foreignAmount, setForeignAmount] = useState<number>(100);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    addItineraryActivity(selectedDay, activityForm);
    setActivityForm({ time: '10:00', description: '', location: '', cost: 0 });
    setIsActivityModalOpen(false);
    triggerConfetti();
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    addPackingItem(packingForm);
    setPackingForm({
      category: 'clothes',
      name: '',
      packed: false,
      assignedTo: 'joint',
      memo: ''
    });
    setIsPackingModalOpen(false);
    triggerConfetti();
  };

  const currentDayPlan = honeymoon.itinerary.find(d => d.dayNumber === selectedDay) || honeymoon.itinerary[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-100 text-amber-600 rounded-2xl">
              <PlaneTakeoff className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">7. 신혼여행 (허니문) 플래너</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {honeymoon.destination} · {honeymoon.startDate} ~ {honeymoon.endDate} 꿈같은 허니문 준비
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {activeTab === 'itinerary' && (
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" /> Day {selectedDay} 일정 추가
            </button>
          )}
          {activeTab === 'packing' && (
            <button
              onClick={() => setIsPackingModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" /> 짐싸기 품목 추가
            </button>
          )}
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex space-x-2 border-b border-slate-200/80 pb-2">
        {[
          { id: 'itinerary', label: '🌴 일자별 여행 일정표', icon: Compass },
          { id: 'packing', label: `🧳 짐싸기 패킹 리스트 (${packingStats.percentage}%)`, icon: Luggage },
          { id: 'booking', label: '✈️ 항공 & 호텔 바우처', icon: Hotel },
          { id: 'calc', label: '💵 환율 & 여행 가계부', icon: Calculator },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ITINERARY VIEW */}
      {activeTab === 'itinerary' && (
        <div className="space-y-5">
          {/* Day selection pills */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {honeymoon.itinerary.map(day => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex flex-col items-center min-w-[90px] ${
                  selectedDay === day.dayNumber
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className="text-[10px] font-normal opacity-80">{day.date.slice(5)}</span>
              </button>
            ))}
          </div>

          {/* Current Day Schedule Details */}
          {currentDayPlan && (
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-amber-600">Day {currentDayPlan.dayNumber} · {currentDayPlan.date}</span>
                  <h3 className="text-lg font-black text-slate-800">{currentDayPlan.title}</h3>
                </div>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1 self-start sm:self-auto transition"
                >
                  <Plus className="w-3.5 h-3.5" /> 새 코스 추가
                </button>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-amber-200">
                {currentDayPlan.activities.map((act, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle bullet */}
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />

                    <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            {act.time}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{act.description}</span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1">
                          {act.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {act.location}
                            </span>
                          )}
                          {act.cost ? (
                            <span className="text-amber-700 font-semibold">
                              예상 경비: {act.cost.toLocaleString()}원
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteItineraryActivity(selectedDay, idx)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PACKING LIST VIEW */}
      {activeTab === 'packing' && (
        <div className="space-y-5">
          {/* Packing Progress Bar */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Luggage className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-bold text-slate-800">신혼여행 짐싸기 패킹 현황</span>
              </div>
              <span className="text-sm font-black text-amber-600">
                {packingStats.packed} / {packingStats.total} 개 ({packingStats.percentage}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${packingStats.percentage}%` }}
              />
            </div>
          </div>

          {/* Grouped by Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(PACKING_CATEGORIES).map(([catKey, catMeta]) => {
              const items = honeymoon.packingList.filter(p => p.category === catKey);
              const packedCount = items.filter(p => p.packed).length;

              return (
                <div key={catKey} className="glass-card rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{catMeta.icon}</span>
                      <h4 className="text-sm font-bold text-slate-800">{catMeta.label}</h4>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {packedCount} / {items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">등록된 항목이 없습니다.</p>
                    ) : (
                      items.map(item => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                            item.packed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200 hover:border-amber-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <button
                              onClick={() => togglePackingItem(item.id)}
                              className="text-slate-400 hover:text-emerald-600 transition"
                            >
                              {item.packed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-4 h-4 hover:text-amber-500" />
                              )}
                            </button>

                            <div>
                              <div className={`text-xs font-semibold ${item.packed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {item.name}
                              </div>
                              {item.memo && (
                                <div className="text-[10px] text-slate-400">{item.memo}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                              {item.assignedTo === 'groom' ? '신랑' : item.assignedTo === 'bride' ? '신부' : '공동'}
                            </span>
                            <button
                              onClick={() => deletePackingItem(item.id)}
                              className="p-1 text-slate-300 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BOOKING & VOUCHERS VIEW */}
      {activeTab === 'booking' && (
        <div className="space-y-6">
          {/* Flight Box */}
          <div className="glass-card rounded-3xl p-6 space-y-4 border border-blue-100">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <PlaneTakeoff className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-800">항공권 E-Ticket 정보</h3>
                <p className="text-xs text-slate-500">{honeymoon.flightInfo.airline}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <span className="font-bold text-blue-800">🛫 출국편 (Departure)</span>
                <div className="text-sm font-black text-slate-800">{honeymoon.flightInfo.departureFlight}</div>
                <div className="text-slate-600">출발 일시: {honeymoon.flightInfo.departureTime}</div>
                <div className="text-[11px] text-slate-400">예약 번호: {honeymoon.flightInfo.bookingRef}</div>
              </div>

              <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                <span className="font-bold text-pink-800">🛬 귀국편 (Return)</span>
                <div className="text-sm font-black text-slate-800">{honeymoon.flightInfo.returnFlight}</div>
                <div className="text-slate-600">출발 일시: {honeymoon.flightInfo.returnTime}</div>
                <div className="text-[11px] text-slate-400">예약 번호: {honeymoon.flightInfo.bookingRef}</div>
              </div>
            </div>
          </div>

          {/* Accommodations Box */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Hotel className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-800">숙소 & 리조트 예약 바우처</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {honeymoon.accommodations.map(acc => (
                <div key={acc.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-slate-800">{acc.name}</h4>
                    {acc.cost && (
                      <span className="font-bold text-amber-600">{acc.cost.toLocaleString()}원</span>
                    )}
                  </div>
                  <div className="text-slate-500">
                    체크인: <strong>{acc.checkIn}</strong> ~ 체크아웃: <strong>{acc.checkOut}</strong>
                  </div>
                  <div className="text-slate-500">📍 {acc.address}</div>
                  {acc.contact && <div className="text-slate-500">📞 {acc.contact}</div>}
                  {acc.bookingRef && (
                    <div className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                      예약번호: {acc.bookingRef}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CURRENCY & BUDGET CALC */}
      {activeTab === 'calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency Calculator */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Calculator className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-800">실시간 환율 변환 계산기</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">적용 환율 설정 (1 {honeymoon.currency.code} 당 원화)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={honeymoon.currency.rate}
                    onChange={e => updateHoneymoon({
                      currency: { ...honeymoon.currency, rate: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                  <span className="font-semibold text-slate-600">KRW</span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-slate-500 font-semibold">현지 외화 금액 ({honeymoon.currency.code})</label>
                <input
                  type="number"
                  value={foreignAmount}
                  onChange={e => setForeignAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-800"
                />
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-1 mt-3">
                <div className="text-xs text-emerald-800 font-medium">원화 환산 예상 금액</div>
                <div className="text-2xl font-black text-emerald-700">
                  {Math.round(foreignAmount * honeymoon.currency.rate).toLocaleString()} 원
                </div>
              </div>
            </div>
          </div>

          {/* Honeymoon Travel Budget Status */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-800">신혼여행 현지 경비 현황</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">외화 목표 예산</span>
                <span className="font-bold text-slate-800">{honeymoon.currency.budgetForeign} {honeymoon.currency.code} (약 {(Math.round(honeymoon.currency.budgetForeign * honeymoon.currency.rate) / 10000).toLocaleString()}만원)</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">현재까지 사용/환전액</span>
                <span className="font-bold text-amber-600">{honeymoon.currency.spentForeign} {honeymoon.currency.code}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl font-bold text-emerald-800">
                <span>남은 외화 잔여액</span>
                <span>{honeymoon.currency.budgetForeign - honeymoon.currency.spentForeign} {honeymoon.currency.code}</span>
              </div>

              {honeymoon.memo && (
                <div className="p-3 bg-amber-50/60 rounded-xl text-amber-900 leading-relaxed text-[11px]">
                  💡 {honeymoon.memo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Itinerary Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-amber-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Day {selectedDay} 새 일정 추가</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">시간 *</label>
                <input
                  type="time"
                  value={activityForm.time}
                  onChange={e => setActivityForm({ ...activityForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">활동 내용 *</label>
                <input
                  type="text"
                  placeholder="예: 락바(Rock Bar) 선셋 칵테일"
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">장소</label>
                <input
                  type="text"
                  placeholder="예: 아야나 리조트 절벽"
                  value={activityForm.location}
                  onChange={e => setActivityForm({ ...activityForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">예상 경비 (원)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={activityForm.cost || 0}
                  onChange={e => setActivityForm({ ...activityForm, cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold"
                >
                  일정 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Packing Item Modal */}
      {isPackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-amber-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">새 짐싸기 품목 추가</h3>
              <button onClick={() => setIsPackingModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPackingItem} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">카테고리</label>
                <select
                  value={packingForm.category}
                  onChange={e => setPackingForm({ ...packingForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                >
                  {Object.entries(PACKING_CATEGORIES).map(([k, meta]) => (
                    <option key={k} value={k}>{meta.icon} {meta.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">품목 이름 *</label>
                <input
                  type="text"
                  placeholder="예: 트래블월렛 카드, 선크림"
                  value={packingForm.name}
                  onChange={e => setPackingForm({ ...packingForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">담당 챙기기</label>
                <select
                  value={packingForm.assignedTo}
                  onChange={e => setPackingForm({ ...packingForm, assignedTo: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                >
                  <option value="joint">🤝 공동</option>
                  <option value="groom">🤵 신랑</option>
                  <option value="bride">👰 신부</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">메모</label>
                <input
                  type="text"
                  placeholder="예: 기내 수하물로 챙길 것"
                  value={packingForm.memo || ''}
                  onChange={e => setPackingForm({ ...packingForm, memo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPackingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold"
                >
                  품목 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

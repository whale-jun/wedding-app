import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { CalendarEvent } from '../../types';
import {
  CalendarDays,
  Plus,
  Bell,
  BellOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  FileText,
  Trash2,
  Edit3,
  X,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { exportToICS } from '../../utils/exportUtils';
import { requestNotificationPermission, sendLocalNotification, playWeddingChime } from '../../utils/notifications';

const EVENT_CATEGORIES: Record<string, { label: string; color: string }> = {
  wedding: { label: '본식 / 결혼식', color: '#e11d48' },
  fitting: { label: '드레스 / 예복 가봉', color: '#ec4899' },
  studio: { label: '스튜디오 / 리허설 촬영', color: '#8b5cf6' },
  dress_tour: { label: '드레스 투어', color: '#d946ef' },
  meeting: { label: '청첩장 모임 / 약속', color: '#6366f1' },
  payment: { label: '잔금 / 결제 예정일', color: '#f59e0b' },
  honeymoon: { label: '신혼여행', color: '#06b6d4' },
  other: { label: '기타 일정', color: '#64748b' }
};

export const CalendarView: React.FC = () => {
  const { events, profile, addEvent, updateEvent, deleteEvent, triggerConfetti } = useWedding();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [formData, setFormData] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '14:00',
    endDate: '',
    endTime: '',
    category: 'wedding',
    location: '',
    notes: '',
    alarmEnabled: true,
    alarmOffsetMinutes: 1440, // 1일 전 기본
    color: '#e11d48'
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0(Sun) ~ 6(Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  const openAddModal = (dateStr?: string) => {
    setEditingEvent(null);
    setFormData({
      title: '',
      startDate: dateStr || selectedDateStr,
      startTime: '14:00',
      endDate: '',
      endTime: '',
      category: 'wedding',
      location: '',
      notes: '',
      alarmEnabled: true,
      alarmOffsetMinutes: 1440,
      color: '#e11d48'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormData({ ...ev });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.alarmEnabled) {
      await requestNotificationPermission();
    }
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
    triggerConfetti();
    setIsModalOpen(false);
  };

  // Test Alarm trigger
  const handleTestAlarm = (ev: CalendarEvent) => {
    sendLocalNotification(`🔔 [웨딩 알람] ${ev.title}`, {
      body: `일시: ${ev.startDate} ${ev.startTime || ''}\n장소: ${ev.location || '미지정'}\n${ev.notes || ''}`
    });
    playWeddingChime();
    alert(`'${ev.title}' 알람 테스트 알림을 브라우저로 전송했습니다!`);
  };

  // Events of selected date
  const selectedDateEvents = events.filter(e => e.startDate === selectedDateStr);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-purple-100 text-purple-600 rounded-2xl">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">3. 웨딩 달력 & 스마트 알람</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            드레스 투어, 스튜디오 촬영, 잔금일 등 D-Day 알람과 스마트폰/구글 캘린더 내보내기
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => exportToICS(events, `${profile.groomName}❤️${profile.brideName} 웨딩 일정`)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            캘린더 파일 (.ics) 저장
          </button>
          <button
            onClick={() => openAddModal(selectedDateStr)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            새 일정 등록
          </button>
        </div>
      </div>

      {/* Main Calendar Section & Selected Date Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Box (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 sm:p-6 space-y-4">
          {/* Calendar Header / Month Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg sm:text-xl font-black text-slate-800">
                {year}년 {month + 1}월
              </h3>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
              >
                오늘
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-100">
            <span className="text-rose-500">일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span className="text-blue-500">토</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Prev month fill */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
              const dayNum = prevMonthDays - firstDayOfMonth + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl bg-slate-50/40 text-slate-300 text-xs flex flex-col justify-start pointer-events-none"
                >
                  <span className="font-medium">{dayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.startDate === dateString);
              const isSelected = selectedDateStr === dateString;
              const isToday = new Date().toISOString().slice(0, 10) === dateString;
              const dayOfWeek = (firstDayOfMonth + idx) % 7;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDateStr(dateString)}
                  className={`min-h-[70px] sm:min-h-[85px] p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                      : isToday
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center'
                          : dayOfWeek === 0
                          ? 'text-rose-500'
                          : dayOfWeek === 6
                          ? 'text-blue-500'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    )}
                  </div>

                  {/* Day Events preview pills */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[9px] sm:text-[10px] font-semibold px-1 py-0.2 rounded truncate text-white"
                        style={{ backgroundColor: ev.color || '#8b5cf6' }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-slate-400 font-bold text-center">
                        +{dayEvents.length - 2}개 더보기
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-purple-600">선택된 날짜</span>
                <h4 className="text-base font-black text-slate-800">{selectedDateStr}</h4>
              </div>
              <button
                onClick={() => openAddModal(selectedDateStr)}
                className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl transition text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 일정 추가
              </button>
            </div>

            <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-400">등록된 일정이 없습니다.</p>
                  <button
                    onClick={() => openAddModal(selectedDateStr)}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    이 날짜에 새 일정 등록하기 +
                  </button>
                </div>
              ) : (
                selectedDateEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: ev.color || '#8b5cf6' }}
                        >
                          {EVENT_CATEGORIES[ev.category]?.label || '일정'}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 mt-1">{ev.title}</h5>
                      </div>

                      <div className="flex items-center space-x-1">
                        {ev.alarmEnabled && (
                          <button
                            onClick={() => handleTestAlarm(ev)}
                            className="p-1 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                            title="알람 미리 울려보기"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(ev)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`'${ev.title}' 일정을 삭제하시겠습니까?`)) {
                              deleteEvent(ev.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-500">
                      {ev.startTime && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{ev.startTime} {ev.endTime ? `~ ${ev.endTime}` : ''}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                      {ev.notes && (
                        <p className="text-slate-600 bg-slate-50 p-2 rounded-xl text-[11px]">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category Color Legends */}
          <div className="glass-card rounded-2xl p-4 space-y-2">
            <h5 className="text-xs font-bold text-slate-700">일정 카테고리 안내</h5>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              {Object.entries(EVENT_CATEGORIES).map(([key, item]) => (
                <div key={key} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-purple-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-purple-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                {editingEvent ? '웨딩 일정 수정' : '새 웨딩 일정 등록'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">일정 제목 *</label>
                <input
                  type="text"
                  placeholder="예: 본식 드레스 최종 가봉"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={e => {
                      const cat = e.target.value;
                      setFormData({ 
                        ...formData, 
                        category: cat as any,
                        color: EVENT_CATEGORIES[cat]?.color || '#8b5cf6'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-xs font-medium"
                  >
                    {Object.entries(EVENT_CATEGORIES).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">대표 색상</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">시작 날짜 *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">시작 시간</label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">장소 / 위치</label>
                <input
                  type="text"
                  placeholder="예: 로브드K 청담 쇼룸"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-xs"
                />
              </div>

              {/* Alarm Settings Box */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.alarmEnabled}
                      onChange={e => setFormData({ ...formData, alarmEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-purple-600" />
                      스마트 브라우저 & D-Day 알람 받기
                    </span>
                  </label>
                </div>

                {formData.alarmEnabled && (
                  <div className="pt-1 flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500">알람 시점:</span>
                    <select
                      value={formData.alarmOffsetMinutes}
                      onChange={e => setFormData({ ...formData, alarmOffsetMinutes: Number(e.target.value) })}
                      className="px-2.5 py-1 rounded-lg border border-purple-200 text-xs bg-white text-slate-700 outline-none"
                    >
                      <option value={0}>정시 알림</option>
                      <option value={60}>1시간 전</option>
                      <option value={1440}>1일 전</option>
                      <option value={4320}>3일 전</option>
                      <option value={10080}>1주일 전</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">준비사항 & 메모</label>
                <textarea
                  rows={2}
                  placeholder="예: 웨딩슈즈 지참, 계약금 봉투 챙기기"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow transition"
                >
                  {editingEvent ? '수정 완료' : '일정 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

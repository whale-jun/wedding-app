import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { GatheringItem, PayerType } from '../../types';
import {
  Mail,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  X,
  Sparkles,
  Coffee
} from 'lucide-react';

export const InvitationView: React.FC = () => {
  const {
    gatherings,
    guests,
    addGathering,
    updateGathering,
    deleteGathering,
    triggerConfetti
  } = useWedding();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGathering, setEditingGathering] = useState<GatheringItem | null>(null);

  const [formData, setFormData] = useState<Omit<GatheringItem, 'id'>>({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '18:30',
    location: '',
    locationUrl: '',
    guestIds: [],
    totalCost: 0,
    payer: 'groom',
    isCompleted: false,
    memo: ''
  });

  const totalGatheringCost = gatherings.reduce((sum, g) => sum + (g.totalCost || 0), 0);
  const completedGatheringsCount = gatherings.filter(g => g.isCompleted).length;
  const totalGuestsInvited = new Set(gatherings.flatMap(g => g.guestIds)).size;

  const openAddModal = () => {
    setEditingGathering(null);
    setFormData({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      time: '18:30',
      location: '',
      locationUrl: '',
      guestIds: [],
      totalCost: 0,
      payer: 'groom',
      isCompleted: false,
      memo: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g: GatheringItem) => {
    setEditingGathering(g);
    setFormData({ ...g });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGathering) {
      updateGathering(editingGathering.id, formData);
    } else {
      addGathering(formData);
    }
    triggerConfetti();
    setIsModalOpen(false);
  };

  const toggleGuestSelection = (guestId: string) => {
    setFormData(prev => {
      const exists = prev.guestIds.includes(guestId);
      return {
        ...prev,
        guestIds: exists ? prev.guestIds.filter(id => id !== guestId) : [...prev.guestIds, guestId]
      };
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-pink-100 text-pink-600 rounded-2xl">
              <Mail className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">6. 청첩장 모임 플래너</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            소중한 지인들과의 식사 약속 일정, 참석자, 밥값 지출 및 청첩장 전달 여부를 꼼꼼하게 관리하세요.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          새 청첩장 모임 등록
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">청첩장 모임 진행 현황</div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {completedGatheringsCount} / {gatherings.length} 회 완료
          </div>
          <div className="text-[10px] text-pink-600 font-semibold">
            {gatherings.length > 0 ? Math.round((completedGatheringsCount / gatherings.length) * 100) : 0}% 진행률
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-pink-600">모임 참석 대상 지인</div>
          <div className="text-xl sm:text-2xl font-black text-pink-600">
            총 {totalGuestsInvited}명
          </div>
          <div className="text-[10px] text-slate-400">하객 명단과 연동된 지인 수</div>
        </div>

        <div className="glass-card p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-emerald-600">청첩장 모임 식비 총액</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {totalGatheringCost.toLocaleString()}원
          </div>
          <div className="text-[10px] text-slate-400">식사 및 대접 비용 합계</div>
        </div>
      </div>

      {/* Gatherings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gatherings.length === 0 ? (
          <div className="col-span-full glass-card rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mx-auto text-pink-400">
              <Coffee className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-600">등록된 청첩장 모임이 없습니다.</div>
            <p className="text-xs text-slate-400">친구들, 직장 동료들과의 식사 약속을 등록해보세요!</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow hover:bg-pink-700 transition inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 첫 모임 등록하기
            </button>
          </div>
        ) : (
          gatherings.map(g => {
            const mappedGuests = guests.filter(guest => g.guestIds.includes(guest.id));

            return (
              <div
                key={g.id}
                className={`glass-card rounded-3xl p-5 transition flex flex-col justify-between border ${
                  g.isCompleted
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : 'border-slate-200/80 hover:border-pink-200'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Header & Status Toggle */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      <button
                        onClick={() => updateGathering(g.id, { isCompleted: !g.isCompleted })}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition flex-shrink-0"
                        title={g.isCompleted ? '모임 완료됨' : '모임 완료로 체크'}
                      >
                        {g.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 hover:text-pink-500" />
                        )}
                      </button>

                      <div>
                        <h4 className={`text-base font-bold ${
                          g.isCompleted ? 'text-slate-500' : 'text-slate-800'
                        }`}>
                          {g.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-pink-500" />
                            {g.date} {g.time || ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(g)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${g.title}' 모임을 삭제하시겠습니까?`)) {
                            deleteGathering(g.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-pink-500" />
                        장소: {g.location || '미지정'}
                      </span>
                      {g.location && (
                        <a
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(g.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-0.5"
                        >
                          지도 <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Attendees Chips */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> 참석 예정자 ({mappedGuests.length}명)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mappedGuests.length === 0 ? (
                        <span className="text-xs text-slate-400">참석자가 등록되지 않았습니다.</span>
                      ) : (
                        mappedGuests.map(guest => (
                          <span
                            key={guest.id}
                            className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100"
                          >
                            {guest.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Memo */}
                  {g.memo && (
                    <div className="p-2.5 bg-amber-50/50 rounded-xl text-xs text-slate-600 border border-amber-100/60">
                      💬 {g.memo}
                    </div>
                  )}
                </div>

                {/* Footer Cost & Payer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    결제: <strong className="text-slate-700">{g.payer === 'groom' ? '🤵 신랑' : g.payer === 'bride' ? '👰 신부' : '🤝 공동'}</strong>
                  </span>
                  <div className="text-sm font-extrabold text-slate-800">
                    {g.totalCost ? `${g.totalCost.toLocaleString()}원` : '비용 미정'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Gathering Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-pink-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-pink-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-pink-600" />
                {editingGathering ? '청첩장 모임 수정' : '새 청첩장 모임 등록'}
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
                <label className="text-xs font-semibold text-slate-600">모임명 *</label>
                <input
                  type="text"
                  placeholder="예: 고등학교 동창 청첩장 모임"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">모임 날짜 *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">모임 시간</label>
                  <input
                    type="time"
                    value={formData.time || ''}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">모임 장소 / 식당명</label>
                <input
                  type="text"
                  placeholder="예: 강남역 루프탑 르메르"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                />
              </div>

              {/* Guest Tagging Multi-Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>참석 하객 선택 (하객 관리와 연동)</span>
                  <span className="text-pink-600 font-bold">{formData.guestIds.length}명 선택됨</span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-1.5">
                  {guests.length === 0 ? (
                    <div className="col-span-2 text-center text-xs text-slate-400 py-2">
                      먼저 5. 하객 관리 탭에서 하객을 등록해주세요.
                    </div>
                  ) : (
                    guests.map(guest => {
                      const isChecked = formData.guestIds.includes(guest.id);
                      return (
                        <label
                          key={guest.id}
                          className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs cursor-pointer transition ${
                            isChecked ? 'bg-pink-100/70 text-pink-900 font-semibold' : 'hover:bg-white text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGuestSelection(guest.id)}
                            className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500"
                          />
                          <span className="truncate">{guest.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">식사/모임 비용 (원)</label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="예: 250000"
                    value={formData.totalCost || 0}
                    onChange={e => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">결제 주체</label>
                  <select
                    value={formData.payer}
                    onChange={e => setFormData({ ...formData, payer: e.target.value as PayerType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs"
                  >
                    <option value="groom">🤵 신랑 부담</option>
                    <option value="bride">👰 신부 부담</option>
                    <option value="joint">🤝 공동 (5:5)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">메모 및 전달사항</label>
                <textarea
                  rows={2}
                  placeholder="예: 선물용 핸드크림 전달, 룸 예약 보증금 5만원"
                  value={formData.memo || ''}
                  onChange={e => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-xs resize-none"
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
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow transition"
                >
                  {editingGathering ? '수정 완료' : '모임 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

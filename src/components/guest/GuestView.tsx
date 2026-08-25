import React, { useState, useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { GuestItem, GuestSide, GuestGroup, AttendanceStatus } from '../../types';
import {
  Users,
  Plus,
  Download,
  Upload,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Phone,
  Gift,
  Utensils,
  Mail,
  Edit3,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import { exportGuestsCSV } from '../../utils/exportUtils';

const SIDE_NAMES: Record<GuestSide, string> = {
  groom: '신랑측',
  bride: '신부측',
  joint: '공동'
};

const GROUP_NAMES: Record<GuestGroup, string> = {
  family: '가족',
  relatives: '친인척',
  work: '직장/동료',
  friends: '친구',
  school: '초중고/대학',
  other: '기타 지인'
};

const ATTENDANCE_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: '참석 확정', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  declined: { label: '불참', color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
  pending: { label: '미정', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  online: { label: '온라인 축하', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' }
};

export const GuestView: React.FC = () => {
  const {
    guests,
    guestStats,
    addGuest,
    updateGuest,
    deleteGuest,
    toggleAttendance,
    importGuestsFromCSV,
    triggerConfetti
  } = useWedding();

  const [selectedSide, setSelectedSide] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedAttendance, setSelectedAttendance] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<GuestItem, 'id'>>({
    side: 'groom',
    group: 'friends',
    name: '',
    phone: '',
    attendance: 'confirmed',
    companionCount: 0,
    mealCount: 1,
    invitationSent: 'mobile',
    giftAmount: 0,
    hasReturnedGift: false,
    memo: ''
  });

  const openAddModal = () => {
    setEditingGuest(null);
    setFormData({
      side: selectedSide !== 'all' ? (selectedSide as GuestSide) : 'groom',
      group: 'friends',
      name: '',
      phone: '',
      attendance: 'confirmed',
      companionCount: 0,
      mealCount: 1,
      invitationSent: 'mobile',
      giftAmount: 0,
      hasReturnedGift: false,
      memo: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (g: GuestItem) => {
    setEditingGuest(g);
    setFormData({ ...g });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuest) {
      updateGuest(editingGuest.id, formData);
    } else {
      addGuest(formData);
    }
    triggerConfetti();
    setIsModalOpen(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importGuestsFromCSV(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Guests
  const filteredGuests = guests.filter(g => {
    if (selectedSide !== 'all' && g.side !== selectedSide) return false;
    if (selectedGroup !== 'all' && g.group !== selectedGroup) return false;
    if (selectedAttendance !== 'all' && g.attendance !== selectedAttendance) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchPhone = g.phone?.includes(q);
      const matchMemo = g.memo?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMemo) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">5. 하객 관리 & 축의금 장부</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            참석 여부(RSVP), 동행인 수, 식권 발급 수량 및 축의금 장부를 실시간 집계합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="본식 당일 축의대용 인쇄"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            명단 인쇄
          </button>
          <button
            onClick={() => exportGuestsCSV(guests)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            엑셀 다운로드
          </button>
          <button
            onClick={() => csvFileRef.current?.click()}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            CSV 불러오기
          </button>
          <input
            type="file"
            ref={csvFileRef}
            onChange={handleCSVUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            하객 추가
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">총 관리 하객</div>
          <div className="text-lg sm:text-2xl font-black text-slate-800">
            {guestStats.totalGuests}명
          </div>
          <div className="text-[10px] text-slate-400">
            신랑측 {guestStats.groomGuests}명 / 신부측 {guestStats.brideGuests}명
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-emerald-600">참석 확정 하객</div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600">
            {guestStats.confirmedGuests}명
          </div>
          <div className="text-[10px] text-slate-400">
            {guestStats.totalGuests > 0 ? Math.round((guestStats.confirmedGuests / guestStats.totalGuests) * 100) : 0}% 확정율
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-blue-600">예상 식권 소요량</div>
          <div className="text-lg sm:text-2xl font-black text-blue-600">
            총 {guestStats.totalMeals}장
          </div>
          <div className="text-[10px] text-slate-400">동행인 포함 총 식수인원</div>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-purple-600">축의금 총액</div>
          <div className="text-lg sm:text-2xl font-black text-purple-600">
            {(guestStats.totalGiftAmount / 10000).toLocaleString()}만원
          </div>
          <div className="text-[10px] text-slate-400">수령 완료된 축의금 합계</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-2xl space-y-3 no-print">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="하객 이름, 연락처, 메모 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-400 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Side Tabs */}
          <div className="flex space-x-1 w-full sm:w-auto overflow-x-auto">
            {['all', 'groom', 'bride', 'joint'].map(sideKey => (
              <button
                key={sideKey}
                onClick={() => setSelectedSide(sideKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedSide === sideKey
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sideKey === 'all' ? '전체 구분' : SIDE_NAMES[sideKey as GuestSide]}
              </button>
            ))}
          </div>
        </div>

        {/* Group & Attendance Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <span className="text-slate-400 font-medium">그룹:</span>
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                selectedGroup === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              전체
            </button>
            {Object.entries(GROUP_NAMES).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSelectedGroup(k)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                  selectedGroup === k ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">참석:</span>
            {['all', 'confirmed', 'declined', 'pending', 'online'].map(att => (
              <button
                key={att}
                onClick={() => setSelectedAttendance(att)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                  selectedAttendance === att ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {att === 'all' ? '전체' : ATTENDANCE_CONFIG[att as AttendanceStatus]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/60 uppercase">
              <tr>
                <th className="px-4 py-3.5">구분/그룹</th>
                <th className="px-4 py-3.5">이름</th>
                <th className="px-4 py-3.5">연락처</th>
                <th className="px-4 py-3.5 text-center">참석 여부</th>
                <th className="px-4 py-3.5 text-center">동행/총인원</th>
                <th className="px-4 py-3.5 text-center">식권 수</th>
                <th className="px-4 py-3.5">청첩장</th>
                <th className="px-4 py-3.5 text-right">축의금</th>
                <th className="px-4 py-3.5 text-center">답례품</th>
                <th className="px-4 py-3.5 no-print text-center">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    등록된 하객이 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(g => {
                  const attConfig = ATTENDANCE_CONFIG[g.attendance];

                  return (
                    <tr key={g.id} className="hover:bg-blue-50/20 transition group">
                      {/* 구분 & 그룹 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            g.side === 'groom' ? 'bg-blue-100 text-blue-700' : g.side === 'bride' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {SIDE_NAMES[g.side]}
                          </span>
                          <span className="text-slate-500 font-medium">{GROUP_NAMES[g.group]}</span>
                        </div>
                      </td>

                      {/* 이름 & 메모 */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{g.name}</div>
                        {g.memo && <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{g.memo}</div>}
                      </td>

                      {/* 연락처 */}
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {g.phone ? (
                          <a href={`tel:${g.phone}`} className="hover:text-blue-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 inline" />
                            {g.phone}
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* 참석 여부 토글 버튼 */}
                      <td className="px-4 py-3 text-center">
                        <select
                          value={g.attendance}
                          onChange={e => toggleAttendance(g.id, e.target.value as AttendanceStatus)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${attConfig.bg} ${attConfig.color}`}
                        >
                          <option value="confirmed">참석 확정</option>
                          <option value="pending">미정</option>
                          <option value="declined">불참</option>
                          <option value="online">온라인 축하</option>
                        </select>
                      </td>

                      {/* 동행/총인원 */}
                      <td className="px-4 py-3 text-center text-slate-600">
                        {g.companionCount > 0 ? (
                          <span>+ {g.companionCount}명 <strong className="text-slate-800 font-bold">({1 + g.companionCount}명)</strong></span>
                        ) : (
                          <span>1명</span>
                        )}
                      </td>

                      {/* 식권 수 */}
                      <td className="px-4 py-3 text-center font-bold text-blue-600">
                        <span className="px-2 py-0.5 bg-blue-50 rounded-lg">
                          {g.mealCount}장
                        </span>
                      </td>

                      {/* 청첩장 */}
                      <td className="px-4 py-3 text-slate-600">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {g.invitationSent === 'both' ? '모바일+종이' : g.invitationSent === 'paper' ? '종이' : g.invitationSent === 'mobile' ? '모바일' : '미전달'}
                        </span>
                      </td>

                      {/* 축의금 */}
                      <td className="px-4 py-3 text-right font-extrabold text-slate-800">
                        {g.giftAmount ? `${g.giftAmount.toLocaleString()}원` : '-'}
                      </td>

                      {/* 답례품 */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateGuest(g.id, { hasReturnedGift: !g.hasReturnedGift })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            g.hasReturnedGift
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {g.hasReturnedGift ? '전달완료' : '미전달'}
                        </button>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center no-print">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => openEditModal(g)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`'${g.name}' 하객을 삭제하시겠습니까?`)) {
                                deleteGuest(g.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-blue-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-blue-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingGuest ? '하객 정보 수정' : '새 하객 등록'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">구분 *</label>
                  <select
                    value={formData.side}
                    onChange={e => setFormData({ ...formData, side: e.target.value as GuestSide })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium"
                  >
                    <option value="groom">🤵 신랑측</option>
                    <option value="bride">👰 신부측</option>
                    <option value="joint">🤝 공동 지인</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">그룹/관계 *</label>
                  <select
                    value={formData.group}
                    onChange={e => setFormData({ ...formData, group: e.target.value as GuestGroup })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium"
                  >
                    {Object.entries(GROUP_NAMES).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">이름 *</label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">연락처</label>
                  <input
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">참석 여부</label>
                  <select
                    value={formData.attendance}
                    onChange={e => {
                      const att = e.target.value as AttendanceStatus;
                      setFormData({
                        ...formData,
                        attendance: att,
                        mealCount: att === 'confirmed' ? 1 + formData.companionCount : 0
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                  >
                    <option value="confirmed">참석 확정</option>
                    <option value="pending">미정</option>
                    <option value="declined">불참</option>
                    <option value="online">온라인 축하</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">동행 인원수</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.companionCount}
                    onChange={e => {
                      const comp = Number(e.target.value);
                      setFormData({
                        ...formData,
                        companionCount: comp,
                        mealCount: formData.attendance === 'confirmed' ? 1 + comp : 0
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">식권 수량</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mealCount}
                    onChange={e => setFormData({ ...formData, mealCount: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-center font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">청첩장 전달 상태</label>
                  <select
                    value={formData.invitationSent}
                    onChange={e => setFormData({ ...formData, invitationSent: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs"
                  >
                    <option value="mobile">모바일 청첩장</option>
                    <option value="paper">종이 청첩장</option>
                    <option value="both">모바일+종이 둘다</option>
                    <option value="none">미전달</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">축의금 수령액 (원)</label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="예: 100000"
                    value={formData.giftAmount || 0}
                    onChange={e => setFormData({ ...formData, giftAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">메모 (역할, 좌석배치 등)</label>
                <textarea
                  rows={2}
                  placeholder="예: 대학 동아리 회장, 당일 가방순이"
                  value={formData.memo || ''}
                  onChange={e => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-xs resize-none"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
                >
                  {editingGuest ? '수정 완료' : '하객 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

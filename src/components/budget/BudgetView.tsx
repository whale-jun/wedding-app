import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { BudgetItem, BudgetCategory, PayerType } from '../../types';
import { 
  Wallet, 
  Plus, 
  Download, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  X, 
  Filter,
  PieChart,
  ArrowRightLeft,
  Coins
} from 'lucide-react';
import { exportBudgetCSV } from '../../utils/exportUtils';

const CATEGORY_NAMES: Record<BudgetCategory, string> = {
  wedding_hall: '웨딩홀/식장',
  sdm: '스드메 (스튜디오/드레스/메이크업)',
  attire_jewelry: '예복/한복/예물',
  home_appliance: '혼수/가전/가구',
  honeymoon: '신혼여행',
  ceremony_snap: '본식스냅/DVD/사회/축가',
  invitation_gifts: '청첩장/답례품/이바지',
  other: '기타 비상금'
};

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  wedding_hall: '#e11d48',
  sdm: '#ec4899',
  attire_jewelry: '#8b5cf6',
  home_appliance: '#3b82f6',
  honeymoon: '#06b6d4',
  ceremony_snap: '#10b981',
  invitation_gifts: '#f59e0b',
  other: '#64748b'
};

export const BudgetView: React.FC = () => {
  const { 
    budget, 
    profile, 
    budgetStats, 
    addBudgetItem, 
    updateBudgetItem, 
    deleteBudgetItem, 
    loadBudgetPreset, 
    triggerConfetti 
  } = useWedding();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Modal Form State
  const [formData, setFormData] = useState<Omit<BudgetItem, 'id'>>({
    category: 'wedding_hall',
    title: '',
    vendorName: '',
    estimatedCost: 0,
    contractCost: 0,
    depositPaid: 0,
    interimPaid: 0,
    balanceDue: 0,
    balanceDueDate: '',
    payer: 'joint',
    paymentMethod: 'card',
    isPaid: false,
    memo: ''
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      category: 'wedding_hall',
      title: '',
      vendorName: '',
      estimatedCost: 0,
      contractCost: 0,
      depositPaid: 0,
      interimPaid: 0,
      balanceDue: 0,
      balanceDueDate: '',
      payer: 'joint',
      paymentMethod: 'card',
      isPaid: false,
      memo: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateBudgetItem(editingItem.id, formData);
    } else {
      addBudgetItem(formData);
    }
    triggerConfetti();
    setIsModalOpen(false);
  };

  const filteredBudget = selectedCategory === 'all' 
    ? budget 
    : budget.filter(b => b.category === selectedCategory);

  // Calculate settlement between groom & bride
  // Groom should pay: budgetStats.groomShareTarget
  // Groom already paid: budgetStats.groomActualPaid + (budgetStats.jointActualPaid * (profile.groomBudgetShareRatio / 100))
  const groomTotalContributed = budgetStats.groomActualPaid + (budgetStats.jointActualPaid * (profile.groomBudgetShareRatio / 100));
  const groomDiff = groomTotalContributed - budgetStats.groomShareTarget;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">1. 스마트 예산 & 지출 관리</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            계약금, 중도금, 잔금 결제 예정일과 신랑·신부 정산까지 똑똑하게 관리하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="relative group">
            <button className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              예산 템플릿 프리셋
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 hidden group-hover:block z-20 animate-fadeIn">
              <button
                onClick={() => loadBudgetPreset('economy')}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
              >
                🌱 알뜰 실속형 (2,800만원)
              </button>
              <button
                onClick={() => loadBudgetPreset('standard')}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
              >
                ✨ 인기 표준형 (4,500만원)
              </button>
              <button
                onClick={() => loadBudgetPreset('luxury')}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
              >
                👑 럭셔리 프리미엄 (7,500만원)
              </button>
            </div>
          </div>

          <button
            onClick={() => exportBudgetCSV(budget)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            엑셀 다운로드
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            지출 항목 등록
          </button>
        </div>
      </div>

      {/* 4 Key Budget Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Goal */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">총 목표 예산</div>
          <div className="text-lg sm:text-2xl font-black text-slate-800">
            {(budgetStats.totalGoal / 10000).toLocaleString()}만원
          </div>
          <div className="text-[10px] text-slate-400">설정된 전체 결혼 예산</div>
        </div>

        {/* Contract Total */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-indigo-500">계약/확정 금액</div>
          <div className="text-lg sm:text-2xl font-black text-indigo-600">
            {(budgetStats.totalContract / 10000).toLocaleString()}만원
          </div>
          <div className="text-[10px] text-slate-400">현재까지 계약 완료액</div>
        </div>

        {/* Total Spent */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-emerald-500">실지출 완료액 (계약금+중도금)</div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600">
            {(budgetStats.totalSpent / 10000).toLocaleString()}만원
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold">{budgetStats.progressPercentage}% 지출 완료</div>
        </div>

        {/* Balance Due */}
        <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-1">
          <div className="text-[11px] font-semibold text-rose-500">앞으로 지불할 잔금</div>
          <div className="text-lg sm:text-2xl font-black text-rose-600">
            {(budgetStats.totalBalanceDue / 10000).toLocaleString()}만원
          </div>
          <div className="text-[10px] text-rose-400">예식 전/당일 지불 예정</div>
        </div>
      </div>

      {/* Couple Settlement & Split Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-100/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-100 text-rose-600 rounded-xl">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              신랑·신부 지출 분담 및 정산기
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
            분담 기준: 신랑 {profile.groomBudgetShareRatio}% : 신부 {100 - profile.groomBudgetShareRatio}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Groom Card */}
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-2">
            <div className="font-bold text-blue-700 flex justify-between">
              <span>🤵 신랑 ({profile.groomName})</span>
              <span>목표: {(budgetStats.groomShareTarget / 10000).toLocaleString()}만</span>
            </div>
            <div className="text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>신랑 단독 지출:</span>
                <span className="font-semibold">{(budgetStats.groomActualPaid / 10000).toLocaleString()}만원</span>
              </div>
            </div>
          </div>

          {/* Bride Card */}
          <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-2">
            <div className="font-bold text-pink-700 flex justify-between">
              <span>👰 신부 ({profile.brideName})</span>
              <span>목표: {(budgetStats.brideShareTarget / 10000).toLocaleString()}만</span>
            </div>
            <div className="text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>신부 단독 지출:</span>
                <span className="font-semibold">{(budgetStats.brideActualPaid / 10000).toLocaleString()}만원</span>
              </div>
            </div>
          </div>

          {/* Joint & Settlement Diff */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2">
            <div className="font-bold text-amber-700 flex justify-between">
              <span>🤝 공동 결제액</span>
              <span>{(budgetStats.jointActualPaid / 10000).toLocaleString()}만원</span>
            </div>
            <div className="text-slate-700 font-medium">
              {groomDiff > 0 ? (
                <div className="text-blue-600 font-bold">
                  💡 신부가 신랑에게 {(groomDiff / 10000).toLocaleString()}만원 송금 시 5:5 정산 완료!
                </div>
              ) : groomDiff < 0 ? (
                <div className="text-rose-600 font-bold">
                  💡 신랑이 신부에게 {(Math.abs(groomDiff) / 10000).toLocaleString()}만원 송금 시 5:5 정산 완료!
                </div>
              ) : (
                <div className="text-emerald-600 font-bold">
                  🎉 신랑과 신부의 지출 비율이 정확히 일치합니다!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          전체 보기 ({budget.length})
        </button>
        {(Object.keys(CATEGORY_NAMES) as BudgetCategory[]).map(catKey => {
          const count = budget.filter(b => b.category === catKey).length;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {CATEGORY_NAMES[catKey]} ({count})
            </button>
          );
        })}
      </div>

      {/* Budget Item Cards List */}
      <div className="space-y-3">
        {filteredBudget.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-600">등록된 지출 항목이 없습니다.</div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700 transition inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 항목 추가하기
            </button>
          </div>
        ) : (
          filteredBudget.map(item => {
            const contract = item.contractCost || item.estimatedCost || 0;
            const spent = (item.depositPaid || 0) + (item.interimPaid || 0) + (item.isPaid ? (item.balanceDue || 0) : 0);
            const balance = item.isPaid ? 0 : item.balanceDue;

            return (
              <div
                key={item.id}
                className={`glass-card rounded-2xl p-4 sm:p-5 transition border ${
                  item.isPaid ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-200/80 hover:border-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => updateBudgetItem(item.id, { isPaid: !item.isPaid })}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                      title={item.isPaid ? '완납 완료됨' : '완납으로 변경'}
                    >
                      {item.isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748b' }}
                        >
                          {CATEGORY_NAMES[item.category]}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-800">
                          {item.title}
                        </h4>
                        {item.vendorName && (
                          <span className="text-xs text-slate-500 font-medium">
                            · {item.vendorName}
                          </span>
                        )}
                        {item.isPaid && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                            완납
                          </span>
                        )}
                      </div>

                      {item.memo && (
                        <p className="text-xs text-slate-500">
                          {item.memo}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        <span>결제: {item.payer === 'groom' ? '🤵 신랑' : item.payer === 'bride' ? '👰 신부' : '🤝 공동'}</span>
                        <span>수단: {item.paymentMethod === 'card' ? '💳 카드' : item.paymentMethod === 'transfer' ? '🏦 계좌이체' : '🧾 현금영수증'}</span>
                        {item.balanceDueDate && !item.isPaid && (
                          <span className="text-rose-500 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> 잔금 예정일: {item.balanceDueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown & Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-1">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-extrabold text-slate-800">
                        {contract.toLocaleString()}원
                      </div>
                      <div className="text-[11px] text-slate-400">
                        기지불: <span className="text-emerald-600 font-semibold">{spent.toLocaleString()}원</span>
                        {balance > 0 && (
                          <span className="ml-1 text-rose-500 font-semibold">/ 잔금 {balance.toLocaleString()}원</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 mt-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${item.title}' 항목을 삭제하시겠습니까?`)) {
                            deleteBudgetItem(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Budget Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-emerald-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-emerald-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                {editingItem ? '예산 지출 항목 수정' : '새 예산 지출 항목 추가'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">카테고리</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs font-medium"
                >
                  {(Object.keys(CATEGORY_NAMES) as BudgetCategory[]).map(key => (
                    <option key={key} value={key}>{CATEGORY_NAMES[key]}</option>
                  ))}
                </select>
              </div>

              {/* Title & Vendor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">항목명 *</label>
                  <input
                    type="text"
                    placeholder="예: 웨딩홀 대관료"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">업체명</label>
                  <input
                    type="text"
                    placeholder="예: 아펠가모"
                    value={formData.vendorName || ''}
                    onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Money Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">계약/총 금액 (원) *</label>
                  <input
                    type="number"
                    step="10000"
                    value={formData.contractCost}
                    onChange={e => {
                      const cost = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        contractCost: cost,
                        balanceDue: Math.max(0, cost - formData.depositPaid - formData.interimPaid)
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">계약금(기지불) (원)</label>
                  <input
                    type="number"
                    step="10000"
                    value={formData.depositPaid}
                    onChange={e => {
                      const deposit = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        depositPaid: deposit,
                        balanceDue: Math.max(0, formData.contractCost - deposit - formData.interimPaid)
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">중도금 (원)</label>
                  <input
                    type="number"
                    step="10000"
                    value={formData.interimPaid}
                    onChange={e => {
                      const interim = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        interimPaid: interim,
                        balanceDue: Math.max(0, formData.contractCost - formData.depositPaid - interim)
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">잔금 (지불예정) (원)</label>
                  <input
                    type="number"
                    step="10000"
                    value={formData.balanceDue}
                    onChange={e => setFormData({ ...formData, balanceDue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs font-semibold text-rose-600"
                  />
                </div>
              </div>

              {/* Balance Due Date & Payment Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">잔금 결제 예정일</label>
                  <input
                    type="date"
                    value={formData.balanceDueDate || ''}
                    onChange={e => setFormData({ ...formData, balanceDueDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">결제 주체</label>
                  <select
                    value={formData.payer}
                    onChange={e => setFormData({ ...formData, payer: e.target.value as PayerType })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs"
                  >
                    <option value="joint">🤝 공동 (5:5)</option>
                    <option value="groom">🤵 신랑 부담</option>
                    <option value="bride">👰 신부 부담</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">결제 수단</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs"
                  >
                    <option value="card">💳 신용/체크카드</option>
                    <option value="transfer">🏦 계좌이체</option>
                    <option value="cash_receipt">🧾 현금영수증</option>
                    <option value="cash">💵 현금</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={e => setFormData({ ...formData, isPaid: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">전액 완납 완료됨</span>
                  </label>
                </div>
              </div>

              {/* Memo */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">메모 및 세부 계약 조건</label>
                <textarea
                  rows={2}
                  placeholder="예: 카드 무이자 6개월 적용, 현장 헬퍼비 별도"
                  value={formData.memo || ''}
                  onChange={e => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-xs resize-none"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
                >
                  {editingItem ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

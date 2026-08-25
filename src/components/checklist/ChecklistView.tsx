import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { ChecklistItem, ChecklistCategory } from '../../types';
import {
  CheckSquare,
  Plus,
  Sparkles,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  X,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

const STAGE_LABELS: Record<ChecklistCategory, { title: string; subtitle: string; icon: string }> = {
  d_300: { title: 'D-300 ~ D-180', subtitle: '상견례 & 웨딩홀 & 스드메 계약', icon: '🏰' },
  d_180: { title: 'D-180 ~ D-100', subtitle: '신혼여행 & 리허설 스튜디오 촬영 & 예복', icon: '📸' },
  d_100: { title: 'D-100 ~ D-30', subtitle: '청첩장 모임 & 혼수 가전 & 본식 가봉', icon: '💌' },
  d_30: { title: 'D-30 ~ D-7', subtitle: '사회자/축가/식순 & 최종 인원 확정', icon: '🎤' },
  d_7: { title: 'D-7 ~ D-DAY', subtitle: '잔금/사례비 준비 & 당일 체크리스트', icon: '💍' },
  d_plus: { title: 'D+ (본식 후)', subtitle: '감사 연락 & 혼인신고 & 앨범 수령', icon: '🎉' },
};

const WEDDING_TIPS = [
  {
    title: '💡 상견례 자리배치 & 선물 팁',
    content: '상견례는 창가 쪽 상석에 양가 아버님, 어머님 순으로 앉으시고 예비 신랑신부가 문 쪽 자리에 앉아 서빙을 돕습니다. 첫 만남의 어색함을 풀기 위해 앙금 플라워 떡케이크나 도라지정과 선물을 양가에 동일하게 준비하면 분위기가 매우 훈훈해집니다.'
  },
  {
    title: '💡 웨딩홀 시식 및 최종 계약 체크포인트',
    content: '첫 타임 예식은 꽃장식이 가장 신선하고 주차가 편리합니다. 시식은 예식 2달 전 양가 부모님을 모시고 첫 타임에 진행하여 주차 혼잡도와 음식 온도를 체크하세요. 당일 혼주 주차권 대수와 락커룸 제공 여부도 꼭 확인하세요.'
  },
  {
    title: '💡 스튜디오 촬영 당일 필수 준비물',
    content: '신랑님은 검정 장목 양말과 갈색 양말 2켤레를 준비하세요. 신부님은 누브라와 심리스 스킨톤 속옷을 착용하고, 벗기 편한 셔츠나 지퍼형 옷을 입고 가셔야 메이크업이 망가지지 않습니다. 헬퍼 이모님 사례비는 현금으로 깨끗한 봉투에 미리 준비해 두세요.'
  }
];

export const ChecklistView: React.FC = () => {
  const {
    checklist,
    checklistStats,
    addChecklistItem,
    updateChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem
  } = useWedding();

  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showTips, setShowTips] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const [formData, setFormData] = useState<Omit<ChecklistItem, 'id'>>({
    stage: 'd_300',
    category: '웨딩홀',
    title: '',
    description: '',
    completed: false,
    dueDate: '',
    assignee: 'joint',
    priority: 'high'
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      stage: selectedStage !== 'all' ? (selectedStage as ChecklistCategory) : 'd_300',
      category: '웨딩 준비',
      title: '',
      description: '',
      completed: false,
      dueDate: '',
      assignee: 'joint',
      priority: 'high'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateChecklistItem(editingItem.id, formData);
    } else {
      addChecklistItem(formData);
    }
    setIsModalOpen(false);
  };

  // Filtering
  const filteredList = checklist.filter(item => {
    if (selectedStage !== 'all' && item.stage !== selectedStage) return false;
    if (selectedAssignee !== 'all' && item.assignee !== selectedAssignee) return false;
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">2. 체리리스트 (웨딩 체크리스트)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            D-300부터 본식 당일까지 빼놓지 않고 챙기는 30년차 플래너 추천 체크리스트
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          새 할 일 추가
        </button>
      </div>

      {/* Progress Overview Card */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-800">웨딩 준비 완료율</span>
          </div>
          <span className="text-sm font-extrabold text-rose-600">
            {checklistStats.completed} / {checklistStats.total} 개 ({checklistStats.percentage}%)
          </span>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${checklistStats.percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 pt-1">
          <span>남은 체크 항목: {checklistStats.total - checklistStats.completed}개</span>
          <span>{checklistStats.percentage === 100 ? '🎉 모든 준비 완료!' : '차근차근 하나씩 채워가요 ✨'}</span>
        </div>
      </div>

      {/* Wedding Tips Accordion */}
      <div className="glass-card rounded-2xl p-4 border border-amber-100 bg-amber-50/20">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between text-xs font-bold text-amber-800"
        >
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            30년차 베테랑 웨딩 플래너의 핵심 시크릿 꿀팁
          </span>
          {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTips && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-amber-200/50">
            {WEDDING_TIPS.map((tip, idx) => (
              <div key={idx} className="bg-white/80 p-3 rounded-xl border border-amber-100 space-y-1">
                <div className="text-xs font-bold text-slate-800">{tip.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{tip.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            selectedStage === 'all'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          전체 보기
        </button>
        {(Object.keys(STAGE_LABELS) as ChecklistCategory[]).map(stageKey => {
          const count = checklist.filter(c => c.stage === stageKey).length;
          const completedCount = checklist.filter(c => c.stage === stageKey && c.completed).length;
          return (
            <button
              key={stageKey}
              onClick={() => setSelectedStage(stageKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedStage === stageKey
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{STAGE_LABELS[stageKey].icon}</span>
              <span>{STAGE_LABELS[stageKey].title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedStage === stageKey ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
              }`}>
                {completedCount}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Filters: Assignee & Priority */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">담당자:</span>
          {['all', 'joint', 'groom', 'bride'].map(asg => (
            <button
              key={asg}
              onClick={() => setSelectedAssignee(asg)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedAssignee === asg
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {asg === 'all' ? '전체' : asg === 'joint' ? '공동' : asg === 'groom' ? '신랑' : '신부'}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">중요도:</span>
          {['all', 'high', 'medium', 'low'].map(pri => (
            <button
              key={pri}
              onClick={() => setSelectedPriority(pri)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedPriority === pri
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {pri === 'all' ? '전체' : pri === 'high' ? '높음 🔥' : pri === 'medium' ? '보통' : '낮음'}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items Container */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-600">해당 조건의 할 일이 없습니다.</div>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow hover:bg-rose-600 transition inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 새 할 일 추가
            </button>
          </div>
        ) : (
          filteredList.map(item => (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-4 sm:p-5 transition border ${
                item.completed ? 'border-emerald-200/80 bg-emerald-50/20' : 'border-slate-200/80 hover:border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5 flex-1">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-rose-500" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                        {item.category}
                      </span>
                      <h4 className={`text-sm sm:text-base font-bold ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}>
                        {item.title}
                      </h4>
                      {item.priority === 'high' && (
                        <span className="px-1.5 py-0.2 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold rounded">
                          중요 🔥
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className={`text-xs ${item.completed ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        담당: <strong className="text-slate-600">{item.assignee === 'groom' ? '신랑' : item.assignee === 'bride' ? '신부' : '공동'}</strong>
                      </span>
                      {item.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          목표일: {item.dueDate}
                        </span>
                      )}
                      {item.completedAt && (
                        <span className="text-emerald-600 font-semibold">
                          ✓ {item.completedAt} 완료
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`'${item.title}' 할 일을 삭제하시겠습니까?`)) {
                        deleteChecklistItem(item.id);
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
          ))
        )}
      </div>

      {/* Add / Edit Checklist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-rose-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-rose-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-rose-500" />
                {editingItem ? '체크리스트 할 일 수정' : '새 웨딩 할 일 추가'}
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
                  <label className="text-xs font-semibold text-slate-600">시기 구분 (Stage)</label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value as ChecklistCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs font-medium"
                  >
                    {(Object.keys(STAGE_LABELS) as ChecklistCategory[]).map(key => (
                      <option key={key} value={key}>{STAGE_LABELS[key].title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">분류/카테고리</label>
                  <input
                    type="text"
                    placeholder="예: 웨딩홀, 스드메, 청첩장"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">할 일 제목 *</label>
                <input
                  type="text"
                  placeholder="예: 본식 당일 헬퍼비 현금 봉투 준비"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">상세 설명 및 체크 메모</label>
                <textarea
                  rows={3}
                  placeholder="주의사항이나 세부 팁을 적어주세요."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">담당자</label>
                  <select
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs"
                  >
                    <option value="joint">🤝 공동</option>
                    <option value="groom">🤵 신랑</option>
                    <option value="bride">👰 신부</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">중요도</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs"
                  >
                    <option value="high">🔥 높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">목표 마감일</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-xs"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow transition"
                >
                  {editingItem ? '수정 완료' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

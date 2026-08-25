import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { CompareOption, CompareCategory } from '../../types';
import {
  Scale,
  Plus,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  MapPin,
  Crown,
  Compass,
  CheckCircle2,
  Building2,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import {
  SEOUL_REGIONS,
  SEOUL_RECOMMENDED_VENUES
} from '../../utils/seoulWeddingVenues';

const CATEGORY_TABS: { key: CompareCategory; label: string; icon: string }[] = [
  { key: 'hall', label: '웨딩홀 / 식장', icon: '🏰' },
  { key: 'dress', label: '드레스샵', icon: '👗' },
  { key: 'studio', label: '스튜디오 촬영', icon: '📸' },
  { key: 'makeup', label: '메이크업샵', icon: '💄' },
  { key: 'suit', label: '맞춤 예복 / 한복', icon: '🤵' },
  { key: 'snap_dvd', label: '본식 스냅 / DVD', icon: '🎥' },
  { key: 'appliances', label: '혼수 가전 / 가구', icon: '🛋️' },
];

export const ComparisonView: React.FC = () => {
  const {
    compareSections,
    addCompareSection,
    addCompareOption,
    updateCompareOption,
    deleteCompareOption,
    pickCompareOption,
    triggerConfetti
  } = useWedding();

  const [activeCategory, setActiveCategory] = useState<CompareCategory>('hall');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체 서울');

  // Modals
  const [isOptionModalOpen, setIsOptionModalOpen] = useState<boolean>(false);
  const [editingOption, setEditingOption] = useState<{ sectionId: string; option: CompareOption } | null>(null);
  const [isSeoulCurateModalOpen, setIsSeoulCurateModalOpen] = useState<boolean>(false);

  // Form State for Option
  const [optionForm, setOptionForm] = useState<Omit<CompareOption, 'id'>>({
    name: '',
    price: 0,
    rating: 5,
    region: '강남/청담/논현',
    pros: [''],
    cons: [''],
    features: { '식대/단가': '', '보증인원/조건': '', '주차/위치': '', '당일계약 혜택': '' },
    contact: '',
    location: '',
    isPicked: false,
    tagList: [],
    memo: ''
  });

  // Current active section
  let currentSection = compareSections.find(s => s.category === activeCategory);
  if (!currentSection && compareSections.length > 0) {
    currentSection = compareSections[0];
  }

  const openAddOptionModal = () => {
    if (!currentSection) {
      addCompareSection(`${CATEGORY_TABS.find(t => t.key === activeCategory)?.label || ''} 비교`, activeCategory);
    }
    setEditingOption(null);
    setOptionForm({
      name: '',
      price: 0,
      rating: 5,
      region: selectedRegion !== '전체 서울' ? selectedRegion : '강남/청담/논현',
      pros: [''],
      cons: [''],
      features: { '주요 스펙 1': '', '주요 스펙 2': '', '당일계약 혜택': '' },
      contact: '',
      location: '',
      isPicked: false,
      tagList: [],
      memo: ''
    });
    setIsOptionModalOpen(true);
  };

  const openEditOptionModal = (sectionId: string, opt: CompareOption) => {
    setEditingOption({ sectionId, option: opt });
    setOptionForm({ ...opt });
    setIsOptionModalOpen(true);
  };

  const handleOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionId = currentSection?.id || `comp-${Date.now()}`;
    if (!currentSection) {
      addCompareSection(`${CATEGORY_TABS.find(t => t.key === activeCategory)?.label || ''} 비교`, activeCategory);
    }

    const cleanedPros = optionForm.pros.filter(p => p.trim() !== '');
    const cleanedCons = optionForm.cons.filter(c => c.trim() !== '');

    const finalOption = {
      ...optionForm,
      pros: cleanedPros,
      cons: cleanedCons
    };

    if (editingOption) {
      updateCompareOption(editingOption.sectionId, editingOption.option.id, finalOption);
    } else {
      addCompareOption(sectionId, finalOption);
    }
    setIsOptionModalOpen(false);
  };

  // Import single Seoul recommendation into current section
  const handleImportSeoulVenue = (venue: CompareOption) => {
    const sectionId = currentSection?.id || `comp-${Date.now()}`;
    if (!currentSection) {
      addCompareSection(`${CATEGORY_TABS.find(t => t.key === activeCategory)?.label || ''} 비교`, activeCategory);
    }

    // Check duplicate
    const exists = currentSection?.options.some(o => o.name === venue.name);
    if (exists) {
      alert(`'${venue.name}' 업체는 이미 비교존에 추가되어 있습니다.`);
      return;
    }

    const { id, ...rest } = venue;
    addCompareOption(sectionId, rest);
    triggerConfetti();
  };

  // Bulk Import all Seoul venues for active category
  const handleImportAllCategoryVenues = () => {
    const recommended = SEOUL_RECOMMENDED_VENUES[activeCategory] || [];
    if (recommended.length === 0) {
      alert('추천 업체 데이터가 없습니다.');
      return;
    }

    const sectionId = currentSection?.id || `comp-${Date.now()}`;
    if (!currentSection) {
      addCompareSection(`${CATEGORY_TABS.find(t => t.key === activeCategory)?.label || ''} 비교`, activeCategory);
    }

    let addedCount = 0;
    recommended.forEach(venue => {
      const exists = currentSection?.options.some(o => o.name === venue.name);
      if (!exists) {
        const { id, ...rest } = venue;
        addCompareOption(sectionId, rest);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      triggerConfetti();
      alert(`서울 추천 업체 ${addedCount}곳을 비교존에 성공적으로 불러왔습니다!`);
    } else {
      alert('모든 추천 업체가 이미 비교존에 등록되어 있습니다.');
    }
    setIsSeoulCurateModalOpen(false);
  };

  // Filter options by selected region
  const filteredOptions = currentSection?.options.filter(opt => {
    if (selectedRegion === '전체 서울') return true;
    return opt.region === selectedRegion;
  }) || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">4. 스마트 웨딩 비교존 (서울 지역 특화)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            강남/청담, 마포/공덕, 서초/반포 등 서울 핵심 권역별 인기 웨딩 업체의 견적과 스펙을 한눈에 비교하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Seoul Curated Recommendations Modal Button */}
          <button
            onClick={() => setIsSeoulCurateModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" />
            🏛️ 서울 추천 리스트업 보기
          </button>

          <button
            onClick={openAddOptionModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            직접 후보 등록
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map(tab => {
          const isActive = activeCategory === tab.key;
          const section = compareSections.find(s => s.category === tab.key);
          const optionCount = section?.options.length || 0;

          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveCategory(tab.key);
                setSelectedRegion('전체 서울');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {optionCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Seoul Region Filter Chips */}
      <div className="glass-card p-3.5 rounded-2xl flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 flex-shrink-0 mr-1">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>서울 권역 필터:</span>
        </div>
        {SEOUL_REGIONS.map(reg => {
          const isSelected = selectedRegion === reg;
          return (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg}
            </button>
          );
        })}
      </div>

      {/* Comparison Grid */}
      {!currentSection || filteredOptions.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              선택한 권역({selectedRegion})에 등록된 {CATEGORY_TABS.find(t => t.key === activeCategory)?.label} 후보가 없습니다.
            </h3>
            <p className="text-xs text-slate-400">
              서울의 검증된 인기 추천 업체를 불러오거나 직접 방문 견적을 등록해보세요!
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsSeoulCurateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold rounded-xl shadow hover:from-amber-600 hover:to-rose-600 transition inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              서울 추천 리스트업에서 담기
            </button>
            <button
              onClick={openAddOptionModal}
              className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow hover:bg-indigo-700 transition inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> 직접 후보 등록하기
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOptions.map(opt => (
            <div
              key={opt.id}
              className={`glass-card rounded-3xl p-6 transition flex flex-col justify-between relative border-2 ${
                opt.isPicked
                  ? 'border-rose-500 bg-gradient-to-b from-rose-50/60 via-white to-white shadow-xl shadow-rose-100/50'
                  : 'border-slate-100 hover:border-indigo-200'
              }`}
            >
              {/* Picked Crown Badge */}
              {opt.isPicked && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-full shadow-md flex items-center gap-1 animate-bounce z-10">
                  <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>우리의 최종 PICK! 💍</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header, Region & Rating */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {/* Region Pill */}
                    {opt.region && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <MapPin className="w-2.5 h-2.5" />
                        {opt.region}
                      </span>
                    )}

                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5 mt-1">
                      {opt.name}
                    </h3>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < opt.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-100 text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-600 ml-1">
                        {opt.rating}점
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditOptionModal(currentSection!.id, opt)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`'${opt.name}' 업체를 삭제하시겠습니까?`)) {
                          deleteCompareOption(currentSection!.id, opt.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {opt.tagList && opt.tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opt.tagList.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.2 bg-rose-50 text-rose-600 rounded font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price Display */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">예상 / 계약 견적</span>
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    {opt.price ? `${opt.price.toLocaleString()}원` : '견적 협의'}
                  </span>
                </div>

                {/* Features key-value list */}
                {opt.features && Object.keys(opt.features).length > 0 && (
                  <div className="space-y-1.5 text-xs bg-indigo-50/30 p-3 rounded-2xl border border-indigo-50">
                    <div className="font-bold text-indigo-900 mb-1 flex items-center justify-between">
                      <span>📋 세부 견적 스펙</span>
                      {opt.location && (
                        <a
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(opt.name + ' ' + opt.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                        >
                          네이버 지도 <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {Object.entries(opt.features).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-slate-600">
                        <span className="text-slate-400">{k}</span>
                        <span className="font-medium text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pros list */}
                {opt.pros && opt.pros.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      장점 (Pros)
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 pl-1">
                      {opt.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cons list */}
                {opt.cons && opt.cons.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                      단점 & 아쉬운 점 (Cons)
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 pl-1">
                      {opt.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">✕</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Memo */}
                {opt.memo && (
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                    💬 {opt.memo}
                  </div>
                )}
              </div>

              {/* Pick Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => pickCompareOption(currentSection!.id, opt.id)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    opt.isPicked
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Crown className={`w-4 h-4 ${opt.isPicked ? 'fill-white' : ''}`} />
                  {opt.isPicked ? '이 업체로 최종 선택됨' : '최종 업체로 선택하기 (Pick!)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seoul Curated Recommendations Modal */}
      {isSeoulCurateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-amber-100 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    🏛️ 서울 대표 추천 업체 큐레이션
                  </h3>
                  <p className="text-xs text-slate-500">
                    {CATEGORY_TABS.find(t => t.key === activeCategory)?.label} 인기 검증 리스트
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSeoulCurateModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Batch Import Button */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">이 카테고리 서울 추천 전체 불러오기</div>
                  <div className="text-[11px] text-slate-500">
                    {SEOUL_RECOMMENDED_VENUES[activeCategory]?.length || 0}개 업체를 한 번에 내 비교존으로 담습니다.
                  </div>
                </div>
                <button
                  onClick={handleImportAllCategoryVenues}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> 전체 담기
                </button>
              </div>

              {/* Curated List Cards */}
              <div className="space-y-3">
                {(!SEOUL_RECOMMENDED_VENUES[activeCategory] || SEOUL_RECOMMENDED_VENUES[activeCategory].length === 0) ? (
                  <p className="text-xs text-slate-400 py-8 text-center">추천 업체 데이터가 준비 중입니다.</p>
                ) : (
                  SEOUL_RECOMMENDED_VENUES[activeCategory].map(venue => {
                    const isAlreadyAdded = currentSection?.options.some(o => o.name === venue.name);

                    return (
                      <div
                        key={venue.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 bg-white space-y-2.5 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                                {venue.region}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800">{venue.name}</h4>
                            </div>
                            <div className="text-xs font-semibold text-slate-600 mt-1">
                              예상 견적: <span className="text-rose-600">{venue.price ? `${venue.price.toLocaleString()}원` : '협의'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleImportSeoulVenue(venue)}
                            disabled={isAlreadyAdded}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              isAlreadyAdded
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            }`}
                          >
                            {isAlreadyAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> 담김
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> 비교존에 담기
                              </>
                            )}
                          </button>
                        </div>

                        {/* Pros summary */}
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          {venue.pros.slice(0, 2).map((p, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span className="truncate">{p}</span>
                            </div>
                          ))}
                        </div>

                        {/* Memo */}
                        {venue.memo && (
                          <div className="text-[10px] text-amber-800 bg-amber-50/70 p-2 rounded-lg">
                            💡 {venue.memo}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Option Modal */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-indigo-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-indigo-100 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                {editingOption ? '후보 업체 정보 수정' : '새 비교 후보 업체 등록'}
              </h3>
              <button
                onClick={() => setIsOptionModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOptionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">업체명 *</label>
                  <input
                    type="text"
                    placeholder="예: 아펠가모 공덕"
                    value={optionForm.name}
                    onChange={e => setOptionForm({ ...optionForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">서울 권역</label>
                  <select
                    value={optionForm.region || '강남/청담/논현'}
                    onChange={e => setOptionForm({ ...optionForm, region: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  >
                    {SEOUL_REGIONS.filter(r => r !== '전체 서울').map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">예상/계약 견적 (원)</label>
                  <input
                    type="number"
                    step="10000"
                    placeholder="예: 17800000"
                    value={optionForm.price}
                    onChange={e => setOptionForm({ ...optionForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">상세 위치 / 주소</label>
                  <input
                    type="text"
                    placeholder="예: 서울 마포구 마포대로 92"
                    value={optionForm.location || ''}
                    onChange={e => setOptionForm({ ...optionForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">우리의 평점 (1~5점)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setOptionForm({ ...optionForm, rating: score })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          score <= optionForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{optionForm.rating}점</span>
                </div>
              </div>

              {/* Pros */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> 장점 (줄바꿈으로 구분)
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 밥이 맛있음&#10;단독홀이라 쾌적함"
                  value={optionForm.pros.join('\n')}
                  onChange={e => setOptionForm({ ...optionForm, pros: e.target.value.split('\n') })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs resize-none"
                />
              </div>

              {/* Cons */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5" /> 단점 / 우려사항
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 주차가 다소 협소함&#10;당일 엘리베이터 혼잡"
                  value={optionForm.cons.join('\n')}
                  onChange={e => setOptionForm({ ...optionForm, cons: e.target.value.split('\n') })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs resize-none"
                />
              </div>

              {/* Memo */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">상담 코멘트 및 비고</label>
                <textarea
                  rows={2}
                  placeholder="예: 매니저님이 친절하시고 당일 계약 시 혼주 메이크업 서비스 제공"
                  value={optionForm.memo || ''}
                  onChange={e => setOptionForm({ ...optionForm, memo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOptionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition"
                >
                  {editingOption ? '수정 완료' : '후보 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

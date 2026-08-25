import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  X, 
  MessageSquareHeart, 
  Star, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  Bug, 
  Lightbulb, 
  Heart,
  CheckCircle2,
  Download
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackEntry {
  id: string;
  rating: number;
  category: 'compliment' | 'idea' | 'bug' | 'other';
  content: string;
  userRole: string;
  userName: string;
  contact?: string;
  createdAt: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { profile, triggerConfetti } = useWedding();
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'compliment' | 'idea' | 'bug' | 'other'>('compliment');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('소중한 의견을 작성해주세요!');
      return;
    }

    const newFeedback: FeedbackEntry = {
      id: 'fb-' + Date.now(),
      rating,
      category,
      content: content.trim(),
      userRole: profile.myRole === 'groom' ? '신랑' : '신부',
      userName: profile.myRole === 'groom' ? profile.groomName : profile.brideName,
      contact: contact.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const saved = localStorage.getItem('wedding_app_feedbacks_v1');
    const list: FeedbackEntry[] = saved ? JSON.parse(saved) : [];
    list.unshift(newFeedback);
    localStorage.setItem('wedding_app_feedbacks_v1', JSON.stringify(list));

    triggerConfetti();
    setIsSubmitted(true);
  };

  const handleExportFeedbacks = () => {
    const saved = localStorage.getItem('wedding_app_feedbacks_v1');
    const list = saved ? JSON.parse(saved) : [];
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `으ㅔ딩어픙_사용자의견_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[28px] shadow-2xl max-w-lg w-full max-h-[82vh] overflow-hidden flex flex-col border border-rose-100 animate-scaleUp z-[111]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-rose-100 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-pink-100 text-pink-600 rounded-2xl">
              <MessageSquareHeart className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800">사용자 의견 및 피드백</h2>
              <p className="text-[11px] text-slate-400">직접 써보신 솔직한 평가를 들려주세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-3 animate-scaleUp">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-3xl shadow-inner">
                💕
              </div>
              <h3 className="text-lg font-black text-slate-800">
                소중한 의견 감사합니다!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                보내주신 피드백은 으ㅔ딩어픙 앱을 더 편리하고 완벽하게 발전시키는 데 큰 힘이 됩니다.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setContent('');
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-600 transition"
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="text-center space-y-1.5 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                <label className="text-xs font-black text-slate-700">
                  앱 사용 만족도는 어떠셨나요?
                </label>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition transform"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= rating 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs' 
                            : 'text-slate-200 fill-slate-100'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-bold text-rose-600">
                  {rating === 5 && '🌟 완벽해요! 최고입니다'}
                  {rating === 4 && '😊 유용하고 마음에 들어요'}
                  {rating === 3 && '🙂 괜찮지만 개선이 필요해요'}
                  {rating === 2 && '😕 아쉬운 점이 있어요'}
                  {rating === 1 && '😢 많이 불편했어요'}
                </div>
              </div>

              {/* Feedback Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">피드백 유형</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compliment', label: '칭찬/좋은점', icon: ThumbsUp },
                    { id: 'idea', label: '기능 제안', icon: Lightbulb },
                    { id: 'bug', label: '버그/불편', icon: Bug },
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  자유로운 의견을 적어주세요
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="예: AI 플래너가 역산해주는 기능이 너무 편했어요! / 하객 식권 계산할 때 메모 기능이 더 다양했으면 좋겠어요."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-rose-400 outline-none text-xs leading-relaxed bg-slate-50/50 resize-none font-medium"
                  required
                />
              </div>

              {/* Contact (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                  <span>답변 받으실 이메일 또는 연락처 (선택)</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="예: wedding@love.com 또는 010-1234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>소중한 피드백 전송하기 💌</span>
              </button>
            </form>
          )}

          {/* Admin Export Feedbacks Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>수집된 피드백 데이터 관리</span>
            <button
              type="button"
              onClick={handleExportFeedbacks}
              className="text-rose-600 font-bold hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>피드백 목록 다운로드 (JSON)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

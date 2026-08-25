export type PayerType = 'groom' | 'bride' | 'joint' | 'custom';
export type BudgetCategory = 
  | 'wedding_hall' 
  | 'sdm' // 스튜디오, 드레스, 메이크업
  | 'attire_jewelry' // 예복, 한복, 예물
  | 'home_appliance' // 혼수, 가전, 가구, 인테리어
  | 'honeymoon' // 신혼여행
  | 'ceremony_snap' // 본식스냅, DVD, 사회자, 축가
  | 'invitation_gifts' // 청첩장, 답례품, 이바지
  | 'other'; // 기타 비상금

export interface CoupleProfile {
  groomName: string;
  brideName: string;
  groomNickname: string;
  brideNickname: string;
  myRole: 'groom' | 'bride'; // 본인의 역할
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // HH:mm
  weddingVenue: string;
  weddingHallName: string;
  budgetGoal: number; // 총 예산 목표액 (원)
  groomBudgetShareRatio: number; // 신랑 분담 비율 (%) 기본 50
  memo: string;
  inviteCode: string; // 커플 초대 코드 (예: "WD-LOVE-8821")
  isPartnerConnected: boolean; // 상대방 연결 여부
  partnerConnectedAt?: string;
}

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  title: string;
  vendorName?: string;
  estimatedCost: number; // 예상 금액
  contractCost: number; // 계약/확정 금액
  depositPaid: number; // 계약금 (이미 지불)
  interimPaid: number; // 중도금
  balanceDue: number; // 잔금 (지불 예정)
  balanceDueDate?: string; // 잔금 결제 예정일
  payer: PayerType; // 결제 주체
  paymentMethod: 'card' | 'transfer' | 'cash_receipt' | 'cash';
  isPaid: boolean; // 전액 완납 여부
  memo?: string;
  receiptUrl?: string;
}

export type ChecklistCategory = 
  | 'd_300' // D-300~D-180 상견례, 웨딩홀, 플래너
  | 'd_180' // D-180~D-100 신행, 스튜디오, 예복/예물
  | 'd_100' // D-100~D-30 청첩장, 본식드레스, 가전가구
  | 'd_30'  // D-30~D-7 사회/축가, 식권, 최종체크
  | 'd_7'   // D-7~D-Day 짐싸기, 잔금, 당일체크
  | 'd_plus'; // 본식 후 혼인신고, 답례

export interface ChecklistItem {
  id: string;
  stage: ChecklistCategory;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  assignee: 'groom' | 'bride' | 'joint';
  priority: 'high' | 'medium' | 'low';
  category: string;
  hasAlarm?: boolean;
  alarmTime?: string;
  linkedBudgetId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string;
  endTime?: string;
  category: 'wedding' | 'dress_tour' | 'studio' | 'fitting' | 'meeting' | 'payment' | 'honeymoon' | 'other';
  location?: string;
  notes?: string;
  alarmEnabled: boolean;
  alarmOffsetMinutes?: number; // 0: 정시, 60: 1시간 전, 1440: 1일 전, 4320: 3일 전, 10080: 1주 전
  color?: string;
}

export type CompareCategory = 'hall' | 'studio' | 'dress' | 'makeup' | 'suit' | 'snap_dvd' | 'honeymoon' | 'appliances';

export interface CompareOption {
  id: string;
  name: string;
  price: number;
  rating: number; // 1-5
  region?: string; // e.g. "강남/청담", "마포/여의도", "서초/반포", "중구/종로", "송파/잠실"
  pros: string[];
  cons: string[];
  features: Record<string, string>; // e.g. { "식대": "65,000원", "보증인원": "250명", "주차": "500대" }
  contact?: string;
  location?: string;
  isPicked: boolean; // 최종 선택 여부
  memo?: string;
  linkUrl?: string;
  tagList?: string[];
}

export interface CompareSection {
  id: string;
  category: CompareCategory;
  title: string;
  targetDate?: string;
  options: CompareOption[];
}

export type GuestSide = 'groom' | 'bride' | 'joint';
export type GuestGroup = 'family' | 'relatives' | 'work' | 'friends' | 'school' | 'other';
export type AttendanceStatus = 'confirmed' | 'declined' | 'pending' | 'online';

export interface GuestItem {
  id: string;
  side: GuestSide;
  group: GuestGroup;
  name: string;
  phone?: string;
  attendance: AttendanceStatus;
  companionCount: number; // 본인 제외 동행인 수 (총 인원 = 1 + companionCount)
  mealCount: number; // 예상 식권 수
  invitationSent: 'paper' | 'mobile' | 'both' | 'none';
  giftAmount?: number; // 축의금 수령액
  hasReturnedGift?: boolean; // 답례품/답례비 전달 여부
  gatheringId?: string; // 연결된 청첩장 모임 ID
  memo?: string;
}

export interface GatheringItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: string;
  locationUrl?: string;
  guestIds: string[]; // 참석 하객 ID 목록
  totalCost: number;
  payer: PayerType;
  isCompleted: boolean;
  memo?: string;
}

export interface HoneymoonDayPlan {
  dayNumber: number;
  date: string;
  title: string;
  activities: {
    time: string;
    description: string;
    location?: string;
    cost?: number;
    completed?: boolean;
  }[];
}

export interface HoneymoonPackingItem {
  id: string;
  category: 'document' | 'electronics' | 'clothes' | 'beauty_medicine' | 'special' | 'other';
  name: string;
  packed: boolean;
  assignedTo: 'groom' | 'bride' | 'joint';
  memo?: string;
}

export interface HoneymoonData {
  destination: string;
  startDate: string;
  endDate: string;
  flightInfo: {
    departureFlight: string;
    departureTime: string;
    returnFlight: string;
    returnTime: string;
    airline: string;
    bookingRef: string;
  };
  accommodations: {
    id: string;
    name: string;
    checkIn: string;
    checkOut: string;
    address: string;
    contact?: string;
    bookingRef?: string;
    cost?: number;
  }[];
  itinerary: HoneymoonDayPlan[];
  packingList: HoneymoonPackingItem[];
  currency: {
    code: string; // USD, EUR, JPY 등
    symbol: string;
    rate: number; // 1외화당 원화
    budgetForeign: number;
    spentForeign: number;
  };
  memo?: string;
}

export interface AiScheduleOption {
  id: string;
  label: string; // e.g. "후보 1 (가장 추천 - 토요일 점심)"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tag: string; // e.g. "D-180 (주말)", "골든타임", "여유 일정"
  reason: string; // 추천 이유
}

export interface AiScheduleMilestone {
  id: string;
  stageName: string; // e.g. "D-240 ~ D-180 단계"
  category: 'hall' | 'sdm' | 'honeymoon' | 'fitting' | 'invitation' | 'final' | 'ceremony';
  title: string;
  description: string;
  aiAdvice: string; // 30년차 AI 플래너의 조언
  options: AiScheduleOption[]; // 3가지 후보 일자
  selectedOptionIndex: number; // 선택된 후보 인덱스 (0, 1, 2)
  isAppliedToCalendar: boolean; // 캘린더 등록 완료 여부
}


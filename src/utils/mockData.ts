import { 
  CoupleProfile, 
  BudgetItem, 
  ChecklistItem, 
  CalendarEvent, 
  CompareSection, 
  GuestItem, 
  GatheringItem, 
  HoneymoonData 
} from '../types';

export const initialProfile: CoupleProfile = {
  groomName: '',
  brideName: '',
  groomNickname: '',
  brideNickname: '',
  myRole: 'groom',
  weddingDate: '2026-11-21',
  weddingTime: '13:00',
  weddingVenue: '아펠가모 공덕',
  weddingHallName: '마리에 홀 (단독홀)',
  budgetGoal: 45000000, // 4,500만원
  groomBudgetShareRatio: 50,
  memo: '인생의 가장 빛나는 순간, 차근차근 서로 배려하며 즐겁게 준비하기 💕',
  inviteCode: 'WD-7729-LOVE',
  isPartnerConnected: false
};

export const initialBudget: BudgetItem[] = [
  {
    id: 'b-1',
    category: 'wedding_hall',
    title: '웨딩홀 대관료 & 식대 (보증 250명)',
    vendorName: '아펠가모 공덕',
    estimatedCost: 18500000,
    contractCost: 17800000,
    depositPaid: 2000000,
    interimPaid: 0,
    balanceDue: 15800000,
    balanceDueDate: '2026-11-21',
    payer: 'joint',
    paymentMethod: 'card',
    isPaid: false,
    memo: '대관료 350만 + 식대 58,000원(음주류 포함) 250명'
  },
  {
    id: 'b-2',
    category: 'sdm',
    title: '스드메 토탈 패키지',
    vendorName: '베리굿웨딩 (클로드유 + 로브드K + 꼼나나)',
    estimatedCost: 4200000,
    contractCost: 3900000,
    depositPaid: 1000000,
    interimPaid: 1500000,
    balanceDue: 1400000,
    balanceDueDate: '2026-10-15',
    payer: 'bride',
    paymentMethod: 'transfer',
    isPaid: false,
    memo: '헬퍼비 및 원본CD 별도 (각 25만/44만 현장결제)'
  },
  {
    id: 'b-3',
    category: 'attire_jewelry',
    title: '신랑 맞춤 수트 & 수제화 패키지',
    vendorName: '스플렌디노 청담점',
    estimatedCost: 1800000,
    contractCost: 1650000,
    depositPaid: 1650000,
    interimPaid: 0,
    balanceDue: 0,
    payer: 'groom',
    paymentMethod: 'card',
    isPaid: true,
    memo: '이태리 로로피아나 원단, 턱시도 대여 2벌 + 수제화 포함'
  },
  {
    id: 'b-4',
    category: 'attire_jewelry',
    title: '웨딩밴드 & 다이아 반지',
    vendorName: '쇼파드 (아이스큐브) & 종로 귀금속',
    estimatedCost: 5500000,
    contractCost: 5200000,
    depositPaid: 5200000,
    interimPaid: 0,
    balanceDue: 0,
    payer: 'joint',
    paymentMethod: 'card',
    isPaid: true,
    memo: '백화점 상품권 결제로 3.5% 할인 혜택'
  },
  {
    id: 'b-5',
    category: 'ceremony_snap',
    title: '본식 스냅 + 4K 3인칭 DVD',
    vendorName: '소울페이지 & 필름헤이즈',
    estimatedCost: 2400000,
    contractCost: 2200000,
    depositPaid: 500000,
    interimPaid: 0,
    balanceDue: 1700000,
    balanceDueDate: '2026-11-20',
    payer: 'joint',
    paymentMethod: 'transfer',
    isPaid: false,
    memo: '대표 지정 + 앨범 3권(양가 부모님 포함) + 하이라이트 영상'
  },
  {
    id: 'b-6',
    category: 'honeymoon',
    title: '발리 6박 8일 항공권 & 풀빌라 리조트',
    vendorName: '대한항공 & 아야나 리조트 / 물리아',
    estimatedCost: 7500000,
    contractCost: 7100000,
    depositPaid: 3500000,
    interimPaid: 0,
    balanceDue: 3600000,
    balanceDueDate: '2026-10-30',
    payer: 'joint',
    paymentMethod: 'card',
    isPaid: false,
    memo: '직항 비즈니스/이코노미 조합 + 풀빌라 4박 + 클리프오션뷰 2박'
  },
  {
    id: 'b-7',
    category: 'home_appliance',
    title: '신혼 가전 패키지 (TV/냉장고/세탁건조기/에어로타워)',
    vendorName: 'LG베스트샵 강남본점',
    estimatedCost: 12000000,
    contractCost: 10800000,
    depositPaid: 10800000,
    interimPaid: 0,
    balanceDue: 0,
    payer: 'groom',
    paymentMethod: 'card',
    isPaid: true,
    memo: '오브제컬렉션 다품목 캐시백 180만원 적용 후 체감가'
  },
  {
    id: 'b-8',
    category: 'invitation_gifts',
    title: '종이 청첩장 & 모바일 청첩장',
    vendorName: '바른손카드 & 디어마이어스',
    estimatedCost: 450000,
    contractCost: 380000,
    depositPaid: 380000,
    interimPaid: 0,
    balanceDue: 0,
    payer: 'bride',
    paymentMethod: 'card',
    isPaid: true,
    memo: '종이 청첩장 300장 + 실링스티커 + 모바일 청첩장 무료쿠폰'
  }
];

export const initialChecklist: ChecklistItem[] = [
  // D-300 단계
  {
    id: 'c-1',
    stage: 'd_300',
    category: '상견례',
    title: '양가 부모님 상견례 날짜 및 장소 예약',
    description: '조용하고 룸이 있는 한정식이나 일식 코스 요리 전문점 예약 (선물용 도라지정과/꽃바구니 준비)',
    completed: true,
    completedAt: '2026-02-15',
    dueDate: '2026-02-20',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-2',
    stage: 'd_300',
    category: '웨딩홀',
    title: '웨딩홀 투어 및 최종 계약 (골든타임 선점)',
    description: '희망 일자(토요일 점심), 보증인원, 주차, 뷔페/한상차림 시식 여부 체크',
    completed: true,
    completedAt: '2026-03-02',
    dueDate: '2026-03-10',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-3',
    stage: 'd_300',
    category: '스드메',
    title: '웨딩 플래너 상담 및 스드메 업체 계약',
    description: '동행/비동행 플래너 비교 후 원하는 스튜디오 화보 무드 결정',
    completed: true,
    completedAt: '2026-03-20',
    dueDate: '2026-03-25',
    assignee: 'bride',
    priority: 'high'
  },
  // D-180 단계
  {
    id: 'c-4',
    stage: 'd_180',
    category: '신혼여행',
    title: '신혼여행지 결정 및 항공권/숙소 예약',
    description: '여권 만료일자 확인(최소 6개월 이상), 여행자 보험 가입',
    completed: true,
    completedAt: '2026-05-10',
    dueDate: '2026-05-15',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-5',
    stage: 'd_180',
    category: '예복/예물',
    title: '신랑 맞춤 예복 가봉 및 웨딩밴드 맞춤',
    description: '스튜디오 촬영 때 입을 대여복 사이즈 체크 및 반지 제작기간(2~3달) 고려',
    completed: true,
    completedAt: '2026-06-01',
    dueDate: '2026-06-10',
    assignee: 'groom',
    priority: 'medium'
  },
  {
    id: 'c-6',
    stage: 'd_180',
    category: '스냅/촬영',
    title: '스튜디오 웨딩 리허설 촬영',
    description: '촬영 간식 준비, 캐주얼/한복 씬 의상 챙기기, 헬퍼비 현금 봉투 준비',
    completed: true,
    completedAt: '2026-07-15',
    dueDate: '2026-07-15',
    assignee: 'joint',
    priority: 'high'
  },
  // D-100 단계
  {
    id: 'c-7',
    stage: 'd_100',
    category: '청첩장',
    title: '종이 청첩장 샘플 신청 및 문구 작성 후 인쇄',
    description: '양가 부모님 성함 표기법 확인, 계좌번호 입력 여부 상의, 주문 수량 책정',
    completed: true,
    completedAt: '2026-08-10',
    dueDate: '2026-08-15',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-8',
    stage: 'd_100',
    category: '청첩장',
    title: '모바일 청첩장 제작 및 식전 영상 사진 셀렉',
    description: '스튜디오 보정본 수령 후 계좌번호, 오시는 길 지도, 갤러리 구성',
    completed: false,
    dueDate: '2026-09-15',
    assignee: 'bride',
    priority: 'high'
  },
  {
    id: 'c-9',
    stage: 'd_100',
    category: '청첩장',
    title: '청첩장 모임 일정 잡기 및 지인 약속 진행',
    description: '친한 친구들, 직장 동료, 지인 대상 식사 자리 마련',
    completed: false,
    dueDate: '2026-10-20',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-10',
    stage: 'd_100',
    category: '혼수',
    title: '신혼집 가전/가구 배송일자 지정',
    description: '입주 청소 완료 후 가전 가구 들어오는 날짜 조율',
    completed: false,
    dueDate: '2026-10-10',
    assignee: 'groom',
    priority: 'medium'
  },
  // D-30 단계
  {
    id: 'c-11',
    stage: 'd_30',
    category: '본식 준비',
    title: '본식 드레스 최종 셀렉 및 가봉',
    description: '신부 2부 드레스 또는 피로연 한복/원피스 결정',
    completed: false,
    dueDate: '2026-10-25',
    assignee: 'bride',
    priority: 'high'
  },
  {
    id: 'c-12',
    stage: 'd_30',
    category: '본식 준비',
    title: '사회자, 축가자, 축도/주례 섭외 및 대본 확인',
    description: '식순 구성(개식사, 화촉점화, 입장곡, 서약서, 성혼선언문, 부모님 감사편지)',
    completed: false,
    dueDate: '2026-11-01',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-13',
    stage: 'd_30',
    category: '본식 준비',
    title: '웨딩홀 최종 점검 (보증인원 확정, 음향/영상 테스트)',
    description: '식권 도장 날인, 포토테이블 액자 전달 방법, 주차 안내문 확인',
    completed: false,
    dueDate: '2026-11-10',
    assignee: 'joint',
    priority: 'high'
  },
  // D-7 단계
  {
    id: 'c-14',
    stage: 'd_7',
    category: '최종 점검',
    title: '사례비 및 헬퍼비 현금 봉투 준비',
    description: '사회자비, 축가비, 도우미 헬퍼비, 가방순이 감사비 등 봉투에 명칭 기재',
    completed: false,
    dueDate: '2026-11-18',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-15',
    stage: 'd_7',
    category: '최종 점검',
    title: '본식 당일 짐 챙기기 & 신혼여행 짐 패킹',
    description: '웨딩슈즈, 누브라, 보정속옷, 링필로우, 예물반지, 여권, 바우처 등',
    completed: false,
    dueDate: '2026-11-20',
    assignee: 'joint',
    priority: 'high'
  },
  // D+ 단계
  {
    id: 'c-16',
    stage: 'd_plus',
    category: '사후 정리',
    title: '양가 부모님 및 하객 감사 인사 문자 발송',
    description: '축의금 정산 및 찾아와주신 분들께 따뜻한 감사 연락 드리기',
    completed: false,
    dueDate: '2026-11-23',
    assignee: 'joint',
    priority: 'high'
  },
  {
    id: 'c-17',
    stage: 'd_plus',
    category: '사후 정리',
    title: '구청 혼인신고 및 전입신고',
    description: '신분증, 가족관계증명서, 증인 2인 서명 날인 지참',
    completed: false,
    dueDate: '2026-12-05',
    assignee: 'joint',
    priority: 'medium'
  }
];

export const initialEvents: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: '🌸 아펠가모 공덕 웨딩 뷔페 시식 (양가 6인)',
    startDate: '2026-09-05',
    startTime: '10:30',
    category: 'wedding',
    location: '아펠가모 공덕 마리에홀 연회장',
    notes: '첫 타임 시식, 주차 및 동선 부모님과 함께 사전 점검',
    alarmEnabled: true,
    alarmOffsetMinutes: 1440,
    color: '#f43f5e'
  },
  {
    id: 'ev-2',
    title: '👗 본식 드레스 최종 가봉 & 베일 셀렉',
    startDate: '2026-10-24',
    startTime: '14:00',
    category: 'fitting',
    location: '로브드K 청담 쇼룸',
    notes: '본식 날 신을 웨딩슈즈 지참, 속옷 착용 확인',
    alarmEnabled: true,
    alarmOffsetMinutes: 1440,
    color: '#ec4899'
  },
  {
    id: 'ev-3',
    title: '🍻 고등학교 친구들 청첩장 모임',
    startDate: '2026-10-10',
    startTime: '18:30',
    category: 'meeting',
    location: '강남역 루프탑 와인바 르메르',
    notes: '청첩장 6장 지참, 룸 예약 완료',
    alarmEnabled: true,
    alarmOffsetMinutes: 60,
    color: '#8b5cf6'
  },
  {
    id: 'ev-4',
    title: '💳 스드메 잔금 결제일',
    startDate: '2026-10-15',
    startTime: '11:00',
    category: 'payment',
    location: '베리굿웨딩 계좌',
    notes: '잔금 140만원 계좌이체 및 현금영수증 발행 요청',
    alarmEnabled: true,
    alarmOffsetMinutes: 1440,
    color: '#eab308'
  },
  {
    id: 'ev-5',
    title: '💍 D-DAY 대망의 결혼식 본식!',
    startDate: '2026-11-21',
    startTime: '13:00',
    endDate: '2026-11-21',
    endTime: '16:00',
    category: 'wedding',
    location: '아펠가모 공덕 6층 마리에홀',
    notes: '오전 6시 30분 꼼나나 메이크업샵 샵인, 오전 10시 웨딩홀 도착',
    alarmEnabled: true,
    alarmOffsetMinutes: 4320,
    color: '#e11d48'
  },
  {
    id: 'ev-6',
    title: '✈️ 발리 신혼여행 출발 (인천공항 T2)',
    startDate: '2026-11-22',
    startTime: '17:40',
    category: 'honeymoon',
    location: '인천국제공항 제2여객터미널',
    notes: '대한항공 KE629편, 여권/환전/바우처 필수',
    alarmEnabled: true,
    alarmOffsetMinutes: 1440,
    color: '#06b6d4'
  }
];

export const initialCompareSections: CompareSection[] = [
  {
    id: 'comp-1',
    category: 'hall',
    title: '웨딩홀 후보 비교 분석',
    options: [
      {
        id: 'opt-1',
        name: '아펠가모 공덕 (마리에홀)',
        price: 17800000,
        rating: 5,
        region: '마포/공덕/상암',
        pros: ['단독홀로 프라이빗', '밥펠가모라 불릴 만큼 뷔페 퀄리티 최상', '공덕역 4개 노선 환승역 초역세권', '채플 느낌의 따뜻한 원목 인테리어'],
        cons: ['엘리베이터가 다소 혼잡할 수 있음', '당일 주차 200대 제한'],
        features: {
          '대관료': '350만원',
          '식대': '58,000원 (음주류 포함)',
          '보증인원': '250명',
          '식사형태': '프리미엄 뷔페',
          '주차': '건물 내 250대 (하객 2시간 무료)',
          '위치': '공덕역 도보 1분 (지하연결)'
        },
        contact: '02-2197-0230',
        location: '서울 마포구 마포대로 92',
        isPicked: true,
        tagList: ['채플홀', '밥맛집', '초역세권', '단독홀'],
        memo: '양가 부모님 모두 만족하셨고 시식평이 압도적으로 좋아서 최종 Pick!'
      },
      {
        id: 'opt-2',
        name: '더채플앳논현 (라포레홀)',
        price: 21500000,
        rating: 4.5,
        region: '강남/청담/논현',
        pros: ['천고가 높고 숲속 온실 같은 독보적 그리너리 인테리어', '자연광 채광 예쁨'],
        cons: ['견적이 다소 높음', '언주역 언덕길 위치로 대중교통 접근성 아쉬움', '주차 타워식'],
        features: {
          '대관료': '550만원',
          '식대': '64,000원',
          '보증인원': '300명',
          '식사형태': '뷔페',
          '주차': '외부 연계 주차장 이용',
          '위치': '언주역 도보 5분 (언덕길)'
        },
        contact: '02-562-1121',
        location: '서울 강남구 논현로',
        isPicked: false,
        tagList: ['숲속온실', '자연광', '강남'],
        memo: '홀은 정말 화려하고 예뻤으나 견적과 언덕길 주차가 걸려서 패스'
      },
      {
        id: 'opt-3',
        name: '빌라드지디 수서',
        price: 23000000,
        rating: 4.5,
        region: '강남/청담/논현',
        pros: ['하우스웨딩의 끝판왕', '꽃장식 커스텀 풍성함', '3시간 여유로운 단독 대관'],
        cons: ['식대 및 꽃장식 추가비가 비쌈', '수서역에서 셔틀 타야 함'],
        features: {
          '대관료': '700만원 (꽃장식 포함)',
          '식대': '72,000원',
          '보증인원': '200명',
          '식사형태': '코스 요리 또는 뷔페',
          '주차': '셔틀 연계',
          '위치': '수서역 셔틀 10분'
        },
        contact: '02-543-2555',
        location: '서울 강남구 밤고개로',
        isPicked: false,
        tagList: ['하우스웨딩', '커스텀플라워', '단독대관'],
        memo: '하우스웨딩 감성은 최고였으나 예산 초과로 패스'
      }
    ]
  },
  {
    id: 'comp-2',
    category: 'dress',
    title: '본식 드레스샵 투어 후보',
    options: [
      {
        id: 'opt-d1',
        name: '로브드K (Robe de K)',
        price: 1800000,
        rating: 5,
        region: '강남/청담/논현',
        pros: ['단아하고 고급스러운 실크 드레스 맛집', '디테일과 비즈감 과하지 않고 우아함', '원장님 피팅 센스 우수'],
        cons: ['화려한 비즈를 선호할 경우 선택폭이 좁음'],
        features: {
          '투어 피팅비': '50,000원',
          '대표 라인': '미카도 실크, 오간자 실크, 잔잔 비즈',
          '당일혜택': '블랙라벨 업그레이드 무료 & 본식 2부 드레스 무료'
        },
        isPicked: true,
        tagList: ['실크명가', '단아우아', '청담'],
        memo: '채플홀인 아펠가모에 찰떡인 미카도 실크 드레스가 너무 예뻐서 당일 지정!'
      },
      {
        id: 'opt-d2',
        name: '엔조최재훈',
        price: 2600000,
        rating: 4.5,
        region: '강남/청담/논현',
        pros: ['화려한 비즈감의 정점', '어두운 호텔 예식에 웅장한 아우라'],
        cons: ['채플홀에는 다소 과할 수 있음', '추가금 라인이 많음'],
        features: {
          '투어 피팅비': '50,000원',
          '대표 라인': '시그니처 비즈, 골드라벨',
          '당일혜택': '블랙라벨 30% 할인'
        },
        isPicked: false,
        tagList: ['비즈끝판왕', '호텔예식', '화려함'],
        memo: '비즈는 정말 화려했으나 채플홀 무드와 견적 고려하여 로브드K로 결정'
      },
      {
        id: 'opt-d3',
        name: '셀레브 브라이덜',
        price: 2100000,
        rating: 4.0,
        region: '강남/청담/논현',
        pros: ['트렌디하고 유니크한 수입 드레스', '다양한 패턴감'],
        cons: ['체형에 따라 호불호가 갈릴 수 있음'],
        features: {
          '투어 피팅비': '50,000원',
          '대표 라인': '수입 수제 드레스',
          '당일혜택': '볼레로 4종 서비스 연출'
        },
        isPicked: false,
        tagList: ['수입드레스', '유니크', '트렌디'],
        memo: '유니크하고 예뻤으나 클래식한 느낌이 덜했음'
      }
    ]
  },
  {
    id: 'comp-3',
    category: 'studio',
    title: '웨딩 스튜디오 비교',
    options: [
      {
        id: 'opt-s1',
        name: '클로드 유 (Claude You)',
        price: 1850000,
        rating: 5,
        region: '강남/청담/논현',
        pros: ['10년 뒤에 봐도 촌스럽지 않은 심플하고 인물 중심 클래식', '자연스러운 보정과 감성'],
        cons: ['예약 마감이 빨라 최소 8개월 전 예약 필수'],
        features: {
          '촬영 시간': '오전/오후 4~5시간',
          '원본/수정본': '440,000원 포함 여부 확인',
          '의상 벌수': '드레스 3벌 + 캐주얼 1벌'
        },
        isPicked: true,
        tagList: ['인물중심', '심플클래식', '깔끔'],
        memo: '깔끔한 무채색 배경과 인물 중심 컷이 가장 마음에 들어 최종 선택'
      },
      {
        id: 'opt-s2',
        name: '그가 사랑하는 순간 (그사순)',
        price: 1950000,
        rating: 4.5,
        region: '강남/청담/논현',
        pros: ['영화 속 한 장면 같은 스토리텔링과 로맨틱한 색감'],
        cons: ['포즈와 표정 연기 난이도가 약간 있음'],
        features: {
          '촬영 시간': '5시간',
          '원본/수정본': '440,000원',
          '의상 벌수': '드레스 4벌'
        },
        isPicked: false,
        tagList: ['로맨틱색감', '영화무드'],
        memo: '색감이 정말 예뻤으나 깔끔한 클로드유가 더 우리 취향'
      }
    ]
  }
];

export const initialGuests: GuestItem[] = [
  {
    id: 'g-1',
    side: 'groom',
    group: 'friends',
    name: '박준형',
    phone: '010-3849-1029',
    attendance: 'confirmed',
    companionCount: 1,
    mealCount: 2,
    invitationSent: 'both',
    giftAmount: 150000,
    hasReturnedGift: true,
    gatheringId: 'gat-1',
    memo: '고교 절친 / 여자친구 동행 예정'
  },
  {
    id: 'g-2',
    side: 'groom',
    group: 'work',
    name: '최동원 팀장님',
    phone: '010-9281-4412',
    attendance: 'confirmed',
    companionCount: 0,
    mealCount: 1,
    invitationSent: 'paper',
    giftAmount: 200000,
    hasReturnedGift: true,
    gatheringId: 'gat-2',
    memo: '직장 부서장님 / 종이 청첩장 직접 전달 완료'
  },
  {
    id: 'g-3',
    side: 'groom',
    group: 'school',
    name: '정현우',
    phone: '010-5512-8874',
    attendance: 'confirmed',
    companionCount: 0,
    mealCount: 1,
    invitationSent: 'mobile',
    giftAmount: 100000,
    hasReturnedGift: false,
    memo: '대학교 룸메이트'
  },
  {
    id: 'g-4',
    side: 'groom',
    group: 'relatives',
    name: '김영철 큰외삼촌',
    phone: '010-1234-5678',
    attendance: 'confirmed',
    companionCount: 3,
    mealCount: 4,
    invitationSent: 'paper',
    giftAmount: 500000,
    hasReturnedGift: true,
    memo: '부산에서 버스타고 올라오심 (외가 4인)'
  },
  {
    id: 'g-5',
    side: 'groom',
    group: 'friends',
    name: '이승우',
    phone: '010-7711-9922',
    attendance: 'declined',
    companionCount: 0,
    mealCount: 0,
    invitationSent: 'mobile',
    giftAmount: 50000,
    hasReturnedGift: false,
    memo: '해외 출장 일정으로 불참 (모바일 축의금 송금)'
  },
  {
    id: 'g-6',
    side: 'bride',
    group: 'friends',
    name: '강수진 (가방순이)',
    phone: '010-8812-3341',
    attendance: 'confirmed',
    companionCount: 0,
    mealCount: 1,
    invitationSent: 'both',
    giftAmount: 300000,
    hasReturnedGift: true,
    gatheringId: 'gat-3',
    memo: '신부 15년 지기 베프, 당일 가방순이 및 축의대 서포트'
  },
  {
    id: 'g-7',
    side: 'bride',
    group: 'friends',
    name: '윤하은 (축가)',
    phone: '010-4491-0021',
    attendance: 'confirmed',
    companionCount: 0,
    mealCount: 1,
    invitationSent: 'both',
    giftAmount: 200000,
    hasReturnedGift: true,
    gatheringId: 'gat-3',
    memo: '대학 음악동아리 / 축가 예정곡: 폴킴 - 너를 만나'
  },
  {
    id: 'g-8',
    side: 'bride',
    group: 'work',
    name: '송미경 과장님',
    phone: '010-6677-1122',
    attendance: 'confirmed',
    companionCount: 1,
    mealCount: 2,
    invitationSent: 'paper',
    giftAmount: 100000,
    hasReturnedGift: false,
    memo: '남편과 함께 참석'
  },
  {
    id: 'g-9',
    side: 'bride',
    group: 'relatives',
    name: '이진호 당숙',
    phone: '010-3333-2211',
    attendance: 'pending',
    companionCount: 1,
    mealCount: 2,
    invitationSent: 'paper',
    giftAmount: 0,
    hasReturnedGift: false,
    memo: '일정 확인 후 10월 말 확답 주시기로 함'
  },
  {
    id: 'g-10',
    side: 'joint',
    group: 'friends',
    name: '오세훈 & 한유라 부부',
    phone: '010-9988-7766',
    attendance: 'confirmed',
    companionCount: 1,
    mealCount: 2,
    invitationSent: 'both',
    giftAmount: 200000,
    hasReturnedGift: true,
    memo: '커플 모임 멤버'
  }
];

export const initialGatherings: GatheringItem[] = [
  {
    id: 'gat-1',
    title: '신랑 고등학교 동창 청첩장 모임',
    date: '2026-10-10',
    time: '18:30',
    location: '강남역 루프탑 와인바 르메르',
    locationUrl: 'https://map.naver.com',
    guestIds: ['g-1', 'g-5'],
    totalCost: 280000,
    payer: 'groom',
    isCompleted: false,
    memo: '총 6명 참석 예정, 룸차지 5만원 포함'
  },
  {
    id: 'gat-2',
    title: '신랑 직장 부서 청첩장 점심 식사',
    date: '2026-10-14',
    time: '12:00',
    location: '광화문 몽중헌 (중식 코스)',
    locationUrl: 'https://map.naver.com',
    guestIds: ['g-2'],
    totalCost: 350000,
    payer: 'groom',
    isCompleted: false,
    memo: '팀원 7명 점심 딤섬 코스 요리 대접'
  },
  {
    id: 'gat-3',
    title: '신부 베프 4인방 브런치 청첩장 파티',
    date: '2026-10-17',
    time: '13:00',
    location: '한남동 오아시스 브런치',
    locationUrl: 'https://map.naver.com',
    guestIds: ['g-6', 'g-7'],
    totalCost: 190000,
    payer: 'bride',
    isCompleted: false,
    memo: '선물로 준비한 록시땅 핸드크림 세트 전달하기'
  }
];

export const initialHoneymoon: HoneymoonData = {
  destination: '인도네시아 발리 (Bali)',
  startDate: '2026-11-22',
  endDate: '2026-11-29',
  flightInfo: {
    airline: '대한항공 (KE629 / KE630 직항)',
    departureFlight: 'KE629 (인천 17:40 -> 덴파사르 23:55)',
    departureTime: '2026-11-22 17:40',
    returnFlight: 'KE630 (덴파사르 01:10 -> 인천 09:20)',
    returnTime: '2026-11-29 01:10',
    bookingRef: 'KAL-7782-9901'
  },
  accommodations: [
    {
      id: 'acc-1',
      name: '아야나 리조트 발리 (림바 짐바란 풀빌라)',
      checkIn: '2026-11-22',
      checkOut: '2026-11-26',
      address: 'Jl. Karang Mas Sejahtera, Jimbaran, Bali',
      contact: '+62 361 702222',
      bookingRef: 'AYANA-9921',
      cost: 3200000
    },
    {
      id: 'acc-2',
      name: '더 물리아 발리 (누사두아 오션뷰 스위트)',
      checkIn: '2026-11-26',
      checkOut: '2026-11-28',
      address: 'Jl. Raya Nusa Dua Selatan, Bali',
      contact: '+62 361 3017777',
      bookingRef: 'MULIA-4402',
      cost: 2100000
    }
  ],
  itinerary: [
    {
      dayNumber: 1,
      date: '2026-11-22',
      title: '출국 & 발리 공항 도착 및 리조트 체크인',
      activities: [
        { time: '14:30', description: '인천공항 제2여객터미널 도착 및 면세품 수령', location: '인천공항 T2', completed: false },
        { time: '17:40', description: '대한항공 KE629편 탑승 및 비행 (약 7시간 소요)', completed: false },
        { time: '23:55', description: '발리 덴파사르 공항 도착 및 프라이빗 픽업 기사 미팅', location: '응우라라이 공항', completed: false },
        { time: '00:40', description: '아야나 림바 풀빌라 체크인 & 허니문 웰컴 와인 한잔', completed: false }
      ]
    },
    {
      dayNumber: 2,
      date: '2026-11-23',
      title: '아야나 리조트 휴식 & 락바(Rock Bar) 선셋',
      activities: [
        { time: '09:00', description: '리조트 조식 뷔페 & 프라이빗 풀 물놀이', completed: false },
        { time: '13:00', description: '아쿠아토닉 테라피 스파 & 전신 아로마 마사지 (2시간)', completed: false },
        { time: '17:00', description: '절벽 위 세계적인 락바(Rock Bar)에서 칵테일 & 인도양 노을 감상', location: '락바', cost: 150000, completed: false },
        { time: '19:30', description: '짐바란 씨푸드 해변 디너 바베큐', cost: 120000, completed: false }
      ]
    },
    {
      dayNumber: 3,
      date: '2026-11-24',
      title: '우붓(Ubud) 원데이 투어 (정글 스윙 & 뜨갈랄랑 계단식 논)',
      activities: [
        { time: '08:30', description: '가이드 차량 미팅 후 우붓으로 이동 (약 1시간 30분)', completed: false },
        { time: '10:30', description: '알로하 발리 스윙 & 포토존 인생샷 촬영 (커플 드레스 대여)', cost: 80000, completed: false },
        { time: '12:30', description: '우붓 시내 로컬 맛집 너티 누리스 와룽 (폭립)', cost: 60000, completed: false },
        { time: '14:30', description: '우붓 왕궁 및 몽키 포레스트 산책, 우붓 전통시장 쇼핑', completed: false },
        { time: '18:00', description: '정글 뷰 파인다이닝 디너', completed: false }
      ]
    },
    {
      dayNumber: 4,
      date: '2026-11-25',
      title: '누사 페니다 섬 스노클링 투어',
      activities: [
        { time: '07:30', description: '사누르 항구로 이동 후 스피드보트 탑승', completed: false },
        { time: '09:30', description: '클링킹 비치(티라노사우루스 바위) & 브로큰 비치 관광', completed: false },
        { time: '12:00', description: '만타베이 만타가오리 & 바다거북이 스노클링', cost: 140000, completed: false },
        { time: '16:00', description: '본섬 귀환 및 리조트 복귀 후 휴식', completed: false }
      ]
    },
    {
      dayNumber: 5,
      date: '2026-11-26',
      title: '물리아 리조트 이동 & 비치 프론트 카바나 릴랙스',
      activities: [
        { time: '11:00', description: '아야나 체크아웃 및 더 물리아 누사두아로 이동', completed: false },
        { time: '13:00', description: '물리아 오션뷰 스위트 체크인 & 애프터눈 티 서비스', completed: false },
        { time: '15:00', description: '물리아 시그니처 오아시스 풀 카바나 휴식', completed: false },
        { time: '18:30', description: '더 카페 럭셔리 디너 뷔페', cost: 180000, completed: false }
      ]
    },
    {
      dayNumber: 6,
      date: '2026-11-27',
      title: '누사두아 해변 요가 & 마지막 쇼핑 & 공항 이동',
      activities: [
        { time: '07:00', description: '선라이즈 해변 커플 요가 클래스', completed: false },
        { time: '12:00', description: '레이트 체크아웃 후 비치워크 쇼핑몰 (선물용 루왁커피/발리 기념품)', completed: false },
        { time: '17:00', description: '마지막 럭셔리 스파 3시간 (샤워 포함)', cost: 200000, completed: false },
        { time: '21:30', description: '덴파사르 공항 도착 및 출국 수속', completed: false }
      ]
    }
  ],
  packingList: [
    // 필수 서류
    { id: 'p-1', category: 'document', name: '여권 (유효기간 6개월 이상 확인)', packed: true, assignedTo: 'joint', memo: '여권 사본 2부 추가 인쇄' },
    { id: 'p-2', category: 'document', name: 'e-VOA(전자도착비자) & 세관신고서 QR', packed: false, assignedTo: 'groom', memo: '출국 3일 전 온라인 신청' },
    { id: 'p-3', category: 'document', name: '항공권 E-티켓 & 호텔 예약 바우처 출력본', packed: true, assignedTo: 'bride' },
    { id: 'p-4', category: 'document', name: '해외결제 신용카드(트래블로그/트래블월렛) & 달러 비상금', packed: true, assignedTo: 'joint' },
    { id: 'p-5', category: 'document', name: '국제운전면허증 (스쿠터/렌터카 대비)', packed: false, assignedTo: 'groom' },
    // 전자기기
    { id: 'p-6', category: 'electronics', name: 'eSIM 또는 포켓와이파이 신청', packed: true, assignedTo: 'bride', memo: '현지 무제한 데이터' },
    { id: 'p-7', category: 'electronics', name: '고프로 / 방수 액션캠 및 방수팩', packed: true, assignedTo: 'groom', memo: '스노클링 촬영용' },
    { id: 'p-8', category: 'electronics', name: '멀티 어댑터 및 보조배터리 (기내 수하물)', packed: false, assignedTo: 'joint' },
    { id: 'p-9', category: 'electronics', name: '애플워치/휴대폰 충전기 & 삼각대 셀카봉', packed: false, assignedTo: 'groom' },
    // 의류 및 수영복
    { id: 'p-10', category: 'clothes', name: '수영복/비키니/래시가드 3세트', packed: false, assignedTo: 'bride' },
    { id: 'p-11', category: 'clothes', name: '리조트룩 원피스 및 셔츠 커플룩', packed: false, assignedTo: 'joint' },
    { id: 'p-12', category: 'clothes', name: '아쿠아슈즈 & 편한 샌들/슬리퍼', packed: false, assignedTo: 'joint' },
    { id: 'p-13', category: 'clothes', name: '선글라스 2개 & 모자', packed: false, assignedTo: 'joint' },
    { id: 'p-14', category: 'clothes', name: '얇은 가디건/바람막이 (기내 및 냉방 대비)', packed: false, assignedTo: 'joint' },
    // 뷰티 & 비상약
    { id: 'p-15', category: 'beauty_medicine', name: '워터프루프 선크림 (SPF 50+ PA++++) & 알로에 수딩젤', packed: true, assignedTo: 'bride' },
    { id: 'p-16', category: 'beauty_medicine', name: '종합 비상약 (지사제, 소화제, 타이레놀, 모기기피제, 방수밴드)', packed: false, assignedTo: 'joint', memo: '발리밸리 대비 지사제 필수' },
    { id: 'p-17', category: 'beauty_medicine', name: '스킨케어 트래블 키트 & 마스크팩', packed: false, assignedTo: 'bride' },
    { id: 'p-18', category: 'beauty_medicine', name: '샤워기 필터 헤드 & 리필 필터 (동남아 필수)', packed: true, assignedTo: 'groom', memo: '숙소 2곳용 리필 4개' },
    // 특별 용품
    { id: 'p-19', category: 'special', name: '대형 하트 튜브 & 미니 에어펌프', packed: false, assignedTo: 'groom' },
    { id: 'p-20', category: 'special', name: '지퍼백 & 빨래 분리용 백팩', packed: false, assignedTo: 'joint' }
  ],
  currency: {
    code: 'USD',
    symbol: '$',
    rate: 1380,
    budgetForeign: 2500, // 2,500 USD (약 345만원)
    spentForeign: 650
  },
  memo: '발리는 팁 문화가 발달해 있으니 1~2달러 소액 지폐 및 10,000~20,000 루피아를 넉넉히 환전해 둘 것!'
};

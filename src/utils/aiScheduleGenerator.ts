import { AiScheduleMilestone, AiScheduleOption } from '../types';

// Helper to add days to date string
function addDaysToDate(baseDateStr: string, daysToAdd: number): string {
  const date = new Date(baseDateStr);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

// Helper to format day of week in Korean
function getKoreanDayOfWeek(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

// AI Reverse-Scheduling Generator based on Wedding Date
export function generateAiWeddingMilestones(weddingDateStr: string): AiScheduleMilestone[] {
  const base = weddingDateStr || new Date().toISOString().slice(0, 10);

  const milestonesRaw = [
    {
      id: 'ai-mile-1',
      stageName: 'D-300 ~ D-250 준비기',
      category: 'hall' as const,
      title: '양가 부모님 상견례 및 예식 일자 최종 확정',
      description: '양가 부모님이 처음 정식으로 인사 나누시는 소중한 자리입니다. 조용한 룸이 있는 한정식이나 일식 코스를 예약하세요.',
      aiAdvice: '⭐ 30년차 플래너 팁: 양가 어르신들이 장거리 이동 시 피로하지 않도록 토요일 점심 12:30 또는 13:00 첫 타임 예약을 가장 추천합니다. 센스 있는 도라지정과나 곶감단자 선물 세트를 준비하면 분위기가 한결 부드러워집니다.',
      offsetDaysList: [-270, -263, -256],
      defaultTimes: ['12:30', '13:00', '18:00'],
      optionTags: ['골든타임 추천 (토)', '여유로운 일요일', '디너 코스 (토)'],
      reasons: [
        '양가 부모님 이동 및 식사 후 차담 나누기에 가장 이상적인 주말 점심',
        '토요일보다 식당이 한산하여 프라이빗하게 대화 나누기 좋은 시간',
        '식사 후 여유롭게 야경을 즐기며 도란도란 이야기 나눌 수 있는 저녁'
      ]
    },
    {
      id: 'ai-mile-2',
      stageName: 'D-250 ~ D-200 예약기',
      category: 'hall' as const,
      title: '웨딩홀 투어 및 골든타임 본식 계약',
      description: '인기 웨딩홀의 황금 시간대(토요일 12~14시)는 1년 전부터 마감됩니다. 3~4곳을 하루에 몰아서 투어하세요.',
      aiAdvice: '⭐ 30년차 플래너 팁: 실제 예식이 진행되는 토요일 오전 11시경에 방문하면 첫 타임 꽃장식 상태, 하객 주차 혼잡도, 뷔페 음식 온도를 실시간으로 직접 검증할 수 있습니다.',
      offsetDaysList: [-240, -233, -226],
      defaultTimes: ['11:00', '14:00', '15:30'],
      optionTags: ['실제 예식 점검 추천', '오후 여유 투어', '피크타임 체감 투어'],
      reasons: [
        '첫 타임 시작 전 쾌적한 상태와 주차장 진입 난이도를 직접 확인할 수 있음',
        '당일 계약 프로모션 혜택을 여유롭게 조율하고 시식 일정을 잡기 좋음',
        '하객이 가장 붐비는 시간대의 엘리베이터 및 로비 혼잡도를 객관적으로 체크'
      ]
    },
    {
      id: 'ai-mile-3',
      stageName: 'D-220 ~ D-180 스드메기',
      category: 'sdm' as const,
      title: '웨딩 플래너 상담 & 스드메 패키지 확정',
      description: '동행/비동행 플래너 상담을 통해 신부님의 이미지에 맞는 스튜디오 화보 무드와 드레스 라인을 결정합니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 인기 스튜디오(클로드, 그사순, 무이 등)는 촬영 6~8개월 전 마감되므로 스드메 중 스튜디오 슬롯부터 최우선으로 선점해야 합니다.',
      offsetDaysList: [-210, -203, -196],
      defaultTimes: ['14:00', '18:30', '11:00'],
      optionTags: ['주말 커플 동행 추천', '평일 퇴근 후 집중상담', '주말 오전 쾌적상담'],
      reasons: [
        '주말 오후 두 사람이 함께 플래너 화보 앨범을 실물로 보며 취향 일치',
        '주말보다 웨딩박람회/플래너 샵이 한산하여 2시간 이상 깊이 있는 1:1 상담',
        '주말 첫 타임 상담으로 원하는 인기 스튜디오 잔여 날짜 즉시 선점'
      ]
    },
    {
      id: 'ai-mile-4',
      stageName: 'D-180 신행기',
      category: 'honeymoon' as const,
      title: '신혼여행 항공권 발권 & 풀빌라 리조트 예약',
      description: '허니문 인기 휴양지(발리, 하와이, 몰디브, 유럽)는 6개월 전 예약 시 얼리버드 특가 및 오션뷰 룸 업그레이드 혜택이 큽니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 여권 만료일(최소 6개월 이상)을 지금 즉시 확인하세요! 비즈니스 좌석이나 프라이빗 풀빌라는 본식 180일 전 발권이 가장 저렴합니다.',
      offsetDaysList: [-180, -173, -166],
      defaultTimes: ['11:00', '15:00', '20:00'],
      optionTags: ['얼리버드 특가 선점', '주말 여유 비교', '주중 야간 발권'],
      reasons: [
        '항공사 얼리버드 좌석 및 인기 풀빌라 프로모션이 살아있는 골든 타임',
        '여행사 패키지 견적과 자유여행 항공/호텔 직구 가격을 꼼꼼히 비교',
        '퇴근 후 둘만의 오붓한 여행 루트 및 액티비티 계획 확정'
      ]
    },
    {
      id: 'ai-mile-5',
      stageName: 'D-150 예복예물기',
      category: 'fitting' as const,
      title: '신랑 맞춤 예복 1차 가봉 & 웨딩밴드 맞춤',
      description: '수제 비스포크 수트는 제작에 최소 1.5~2개월이 걸립니다. 스튜디오 촬영 때 입을 대여복도 함께 셀렉하세요.',
      aiAdvice: '⭐ 30년차 플래너 팁: 웨딩밴드(반지)는 백화점 브랜드든 종로든 각인 및 제작에 2~3달이 소요되므로 리허설 촬영 때 끼고 찍으려면 지금 맞춰야 합니다.',
      offsetDaysList: [-150, -143, -136],
      defaultTimes: ['13:00', '15:30', '18:00'],
      optionTags: ['촬영 대여복 동시 셀렉', '주말 여유 가봉', '평일 맞춤 피팅'],
      reasons: [
        '신랑 체형 맞춤 가봉과 함께 스튜디오 촬영용 턱시도 2~3벌을 직접 피팅',
        '신랑 신부 함께 반지를 착용해보고 자연광/조명 아래 실물 색감 비교',
        '테일러 마스터와 단독 1:1로 원단(영국/이태리) 심층 상담'
      ]
    },
    {
      id: 'ai-mile-6',
      stageName: 'D-110 스튜디오 촬영기',
      category: 'sdm' as const,
      title: '스튜디오 웨딩 리허설 촬영 (웨딩 화보)',
      description: '평생 남을 웨딩 앨범을 촬영하는 날입니다. 헬퍼 이모님 사례비 봉투와 간단한 핑거푸드 간식을 준비하세요.',
      aiAdvice: '⭐ 30년차 플래너 팁: 무조건 평일(수/목) 낮 촬영을 추천합니다! 주말에는 앞뒤 타임 신랑신부가 겹쳐 딜레이되지만, 평일에는 작가님과 헬퍼 이모님이 오롯이 우리 커플에게만 집중해 주십니다.',
      offsetDaysList: [-115, -112, -105],
      defaultTimes: ['10:00', '11:00', '13:00'],
      optionTags: ['⭐ 평일 낮 최우선 추천', '주말 슬롯 (휴가불필요)', '오후 노을/야간씬 연출'],
      reasons: [
        '스튜디오가 한산하여 여유로운 컷 수 확보 & 프라이빗한 집중 촬영 가능',
        '연차를 쓰기 어려운 직장인 커플을 위한 주말 황금 촬영 슬롯',
        '자연광 주간 씬부터 분위기 있는 전구/노을 로드 씬까지 모두 섭렵'
      ]
    },
    {
      id: 'ai-mile-7',
      stageName: 'D-80 청첩장 제작기',
      category: 'invitation' as const,
      title: '종이 청첩장 인쇄 & 모바일 청첩장/식전영상 제작',
      description: '스튜디오 원본/수정본 사진을 수령하여 모바일 청첩장을 제작하고 종이 청첩장을 주문합니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 종이 청첩장은 예상 하객 수의 10~15% 여유 있게 주문하세요. 양가 부모님께 계좌번호 표기 방식(기재형/미기재형)을 반드시 사전 컨펌받으셔야 재인쇄를 방지합니다.',
      offsetDaysList: [-80, -73, -66],
      defaultTimes: ['14:00', '11:00', '16:00'],
      optionTags: ['사진 수령 직후 발주', '양가 문구 컨펌 후 인쇄', '청첩장 수령 및 접기'],
      reasons: [
        '스튜디오 보정본 나오자마자 모바일 청첩장 링크 완성 및 발주',
        '양가 부모님 성함 및 인사말 오탈자 최종 검수 후 인쇄 착수',
        '도착한 청첩장에 봉투 스티커 및 향수/실링 작업 완료'
      ]
    },
    {
      id: 'ai-mile-8',
      stageName: 'D-60 청첩장 모임 집중기',
      category: 'invitation' as const,
      title: '청첩장 모임 집중 약속 (베프/직장/지인)',
      description: '친한 지인들에게 맛있는 식사를 대접하며 결혼 소식을 알리고 종이 청첩장을 전달합니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 본식 1~2달 전에 청첩장 모임을 집중적으로 끝내야 본식 3주 전부터는 다이어트와 피부 관리에 집중할 수 있습니다.',
      offsetDaysList: [-60, -53, -46],
      defaultTimes: ['18:30', '18:30', '19:00'],
      optionTags: ['1차 베프 모임 주말', '2차 동창/동기 모임', '3차 직장/동호회 모임'],
      reasons: [
        '가장 가까운 절친들과 편안한 룸 레스토랑에서 1차 청첩장 파티',
        '초중고/대학 동창들과의 단체 모임 및 모바일 청첩장 전달',
        '직장 선후배 및 팀원들과의 식사 대접'
      ]
    },
    {
      id: 'ai-mile-9',
      stageName: 'D-30 본식 가봉기',
      category: 'fitting' as const,
      title: '본식 드레스 최종 셀렉 & 미세 사이즈 가봉',
      description: '본식 날 입을 단 한 벌의 드레스를 확정하고, 베일, 티아라, 웨딩슈즈를 최종 매칭합니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 본식 3~4주 전 피팅이 가장 이상적입니다. 다이어트가 가장 많이 반영된 시점이며, 본식 2부 드레스와 피로연 원피스도 이날 함께 확정합니다.',
      offsetDaysList: [-28, -25, -21],
      defaultTimes: ['14:00', '18:00', '15:30'],
      optionTags: ['본식 4주전 황금피팅', '평일 저녁 집중가봉', '본식 3주전 최종체크'],
      reasons: [
        '신부님의 최종 다이어트 체형에 딱 맞춘 퍼펙트 라인 미세 가봉',
        '조용한 평일 저녁 신상 베일과 악세서리를 1:1로 여유롭게 매칭',
        '신랑 턱시도와 신부 드레스의 전체적인 밸런스 최종 점검'
      ]
    },
    {
      id: 'ai-mile-10',
      stageName: 'D-14 식순 총점검기',
      category: 'final' as const,
      title: '사회자/축가 섭외 대본 & 식순 음원 최종 제출',
      description: '화촉점화, 입장곡, 서약서, 성혼선언문, 부모님 감사편지 대본을 웨딩홀에 제출합니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 식순 BGM 음원 파일(MR)과 식전 영상 USB는 본식 1주일 전까지 웨딩홀 음향실에 전달하여 사전 재생 테스트를 마쳐야 당일 방송 사고가 없습니다.',
      offsetDaysList: [-14, -10, -7],
      defaultTimes: ['15:00', '20:00', '14:00'],
      optionTags: ['대본 완성 추천일', '사회자 사전미팅', '웨딩홀 파일 제출'],
      reasons: [
        '혼인서약서 문구 및 부모님 감사 편지 최종 인쇄',
        '전문 사회자와 식순 타이밍 및 축가 동선 큐시트 조율',
        '웨딩홀 PD에게 식전영상, 식순 BGM, 식권 도장 샘플 전달'
      ]
    },
    {
      id: 'ai-mile-11',
      stageName: 'D-5 최종 마감기',
      category: 'final' as const,
      title: '보증인원 최종 확정, 잔금 확인, 사례비 현금 준비',
      description: '웨딩홀에 최종 보증인원을 통보하고, 헬퍼 이모님, 사회자, 축가자 사례비를 깨끗한 신권 봉투에 담아 준비합니다.',
      aiAdvice: '⭐ 30년차 플래너 팁: 가방순이(신부 절친)에게 전달할 감사비와 비상용 식권, 신부 립스틱/인공눈물을 챙길 미니 파우치를 미리 패킹해두세요.',
      offsetDaysList: [-5, -3, -1],
      defaultTimes: ['11:00', '14:00', '17:00'],
      optionTags: ['식권/인원 마감 (월)', '사례비 봉투 준비', '웨딩카 짐 트렁크 적재'],
      reasons: [
        '참석 여부 하객 최종 취합 후 웨딩홀 최종 보증인원 확정 통보',
        '은행에서 빳빳한 신권 인출 후 명칭 적힌 감사 봉투 패킹',
        '웨딩슈즈, 예물반지, 누브라, 신혼여행 짐 트렁크에 싣고 휴식'
      ]
    },
    {
      id: 'ai-mile-12',
      stageName: 'D-DAY 대망의 본식',
      category: 'ceremony' as const,
      title: '💍 D-DAY 대망의 결혼식 본식!',
      description: '인생에서 가장 아름답고 눈부신 날입니다. 아침 식사는 가볍게 챙겨 드시고 메이크업샵으로 이동하세요.',
      aiAdvice: '⭐ 30년차 플래너 팁: 당일 메이크업 샵에는 단추나 지퍼가 달린 옷을 입고 가셔야 메이크업 후 드레스로 갈아입을 때 번지지 않습니다. 긴장하지 마시고 활짝 웃으세요!',
      offsetDaysList: [0, 0, 0],
      defaultTimes: ['13:00', '12:00', '14:00'],
      optionTags: ['D-DAY 본식 타임테이블', '오전 예식', '오후 예식'],
      reasons: [
        '06:30 메이크업샵 샵인 ➔ 10:00 웨딩홀 도착 및 원판 선촬영 ➔ 13:00 본식 개식',
        '오전 첫 타임 예식 스케줄',
        '오후 피크 타임 예식 스케줄'
      ]
    }
  ];

  return milestonesRaw.map(m => {
    const options: AiScheduleOption[] = m.offsetDaysList.map((offset, idx) => {
      const calcDate = addDaysToDate(base, offset);
      const dayOfWeek = getKoreanDayOfWeek(calcDate);
      const diffDays = Math.abs(offset);
      const dDayLabel = offset === 0 ? 'D-DAY' : `D-${diffDays}`;

      return {
        id: `${m.id}-opt-${idx}`,
        label: `후보 ${idx + 1} (${m.optionTags[idx]})`,
        date: calcDate,
        time: m.defaultTimes[idx],
        tag: `${dDayLabel} (${dayOfWeek}) · ${m.defaultTimes[idx]}`,
        reason: m.reasons[idx]
      };
    });

    return {
      id: m.id,
      stageName: m.stageName,
      category: m.category,
      title: m.title,
      description: m.description,
      aiAdvice: m.aiAdvice,
      options,
      selectedOptionIndex: 0, // 기본값: 1순위 가장 추천 후보
      isAppliedToCalendar: false
    };
  });
}

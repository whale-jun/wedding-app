import { GuestItem, BudgetItem, CalendarEvent } from '../types';

// Convert array of objects to CSV with UTF-8 BOM for Excel in Korean
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: string | number | undefined | null) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = '\uFEFF' + [
    headers.map(processCell).join(','),
    ...rows.map(row => row.map(processCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Guests to Excel-friendly CSV
export function exportGuestsCSV(guests: GuestItem[]) {
  const headers = [
    '구분', '그룹', '이름', '연락처', '참석여부', '동행인수', '총인원', '예상식권', '청첩장', '축의금(원)', '답례품전달', '메모'
  ];

  const sideLabel = { groom: '신랑측', bride: '신부측', joint: '공동' };
  const groupLabel = { family: '가족', relatives: '친인척', work: '직장', friends: '친구', school: '동문', other: '기타' };
  const attendanceLabel = { confirmed: '참석확정', declined: '불참', pending: '미정', online: '온라인축하' };
  const inviteLabel = { paper: '종이청첩장', mobile: '모바일', both: '둘다', none: '미전달' };

  const rows = guests.map(g => [
    sideLabel[g.side] || g.side,
    groupLabel[g.group] || g.group,
    g.name,
    g.phone || '',
    attendanceLabel[g.attendance] || g.attendance,
    g.companionCount || 0,
    1 + (g.companionCount || 0),
    g.mealCount || 0,
    inviteLabel[g.invitationSent] || g.invitationSent,
    g.giftAmount || 0,
    g.hasReturnedGift ? '완료' : '미전달',
    g.memo || ''
  ]);

  exportToCSV(`으ㅔ딩어픙_하객명단_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

// Export Budget to CSV
export function exportBudgetCSV(items: BudgetItem[]) {
  const headers = [
    '카테고리', '항목명', '업체명', '예상금액(원)', '계약금액(원)', '계약금/기지불(원)', '중도금(원)', '잔금(원)', '잔금예정일', '결제자', '결제방식', '완납여부', '메모'
  ];

  const categoryLabel: Record<string, string> = {
    wedding_hall: '웨딩홀/식장',
    sdm: '스드메',
    attire_jewelry: '예복/예물',
    home_appliance: '혼수/가전/가구',
    honeymoon: '신혼여행',
    ceremony_snap: '본식스냅/DVD/사회',
    invitation_gifts: '청첩장/답례품',
    other: '기타'
  };

  const payerLabel: Record<string, string> = {
    groom: '신랑',
    bride: '신부',
    joint: '공동(5:5)',
    custom: '별도비율'
  };

  const paymentLabel: Record<string, string> = {
    card: '카드',
    transfer: '계좌이체',
    cash_receipt: '현금영수증',
    cash: '현금'
  };

  const rows = items.map(b => [
    categoryLabel[b.category] || b.category,
    b.title,
    b.vendorName || '',
    b.estimatedCost || 0,
    b.contractCost || 0,
    b.depositPaid || 0,
    b.interimPaid || 0,
    b.balanceDue || 0,
    b.balanceDueDate || '',
    payerLabel[b.payer] || b.payer,
    paymentLabel[b.paymentMethod] || b.paymentMethod,
    b.isPaid ? '완납' : '미완납',
    b.memo || ''
  ]);

  exportToCSV(`으ㅔ딩어픙_예산지출부_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

// Export Calendar Events to iCalendar (.ics)
export function exportToICS(events: CalendarEvent[], coupleTitle: string = '으ㅔ딩어픙 결혼 일정') {
  const formatDate = (dateStr: string, timeStr?: string) => {
    const cleanedDate = dateStr.replace(/-/g, '');
    if (!timeStr) return `${cleanedDate}`;
    const cleanedTime = timeStr.replace(/:/g, '') + '00';
    return `${cleanedDate}T${cleanedTime}`;
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//으ㅔ딩어픙//Wedding Planner App//KO',
    `X-WR-CALNAME:${coupleTitle}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n') + '\r\n';

  events.forEach(ev => {
    const start = formatDate(ev.startDate, ev.startTime);
    const end = ev.endDate ? formatDate(ev.endDate, ev.endTime) : start;
    const isAllDay = !ev.startTime;

    icsContent += [
      'BEGIN:VEVENT',
      `UID:${ev.id}@weddingapp.internal`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      isAllDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
      isAllDay ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
      `SUMMARY:${ev.title}`,
      ev.location ? `LOCATION:${ev.location}` : '',
      ev.notes ? `DESCRIPTION:${ev.notes.replace(/\n/g, '\\n')}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].filter(Boolean).join('\r\n') + '\r\n';
  });

  icsContent += 'END:VCALENDAR';

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `으ㅔ딩어픙_웨딩일정_${new Date().toISOString().slice(0, 10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

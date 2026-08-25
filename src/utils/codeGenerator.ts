// Generate unique couple invite code
export function generateCoupleInviteCode(prefix: string = 'WD'): string {
  const words = ['LOVE', 'MATE', 'PINK', 'RING', 'DEAR', 'SWEET', 'HONEY', 'FOREVER'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}-${randomWord}`;
}

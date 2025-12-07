import crypto from 'crypto';

/**
 * Generate a unique referral code
 */
export function generateReferralCode(username: string): string {
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  const baseCode = username.slice(0, 4).toUpperCase();
  return `${baseCode}${randomString}`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if user is 18 or older
 */
export function isAdult(dob: Date): boolean {
  return calculateAge(dob) >= 18;
}

/**
 * Get the start and end of a week (Monday to Sunday in UTC)
 */
export function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);

  // Get to Monday
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, otherwise go to Monday
  d.setUTCDate(d.getUTCDate() + diff);

  const start = new Date(d);

  // Sunday end
  const end = new Date(d);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get week label (e.g., "2025-12-01" for the Monday of that week)
 */
export function getWeekLabel(date: Date = new Date()): string {
  const { start } = getWeekBounds(date);
  return start.toISOString().split('T')[0];
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

/**
 * Calculate jackpot from revenue
 */
export function calculateJackpot(totalRevenue: number): number {
  const jackpotPercentage = parseFloat(process.env.JACKPOT_PERCENTAGE || '0.5');
  return totalRevenue * jackpotPercentage;
}

/**
 * Calculate prize per winner
 */
export function calculatePrizePerWinner(jackpot: number, winnerCount: number = 4): number {
  if (winnerCount === 0) return 0;
  return jackpot / winnerCount;
}

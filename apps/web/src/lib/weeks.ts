/**
 * Week utilities using M.W format (Month.Week)
 * Week assignment rule: A week belongs to the month that has the majority of its days.
 * This results in exactly 52 weeks per year.
 */

export interface WeekInfo {
  week: string; // "M.W" format, e.g., "3.1"
  month: number;
  weekInMonth: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Get the ISO week number (1-52) for a given date
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the start date (Monday) of a given ISO week number
 */
function getWeekStartDate(year: number, weekNum: number): Date {
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay() || 7; // Convert Sunday (0) to 7

  // Find the Monday of week 1
  const week1Monday = new Date(year, 0, 1 + (8 - jan1Day) % 7);
  if (jan1Day <= 4) {
    week1Monday.setDate(week1Monday.getDate() - 7);
  }

  // Add weeks
  const startDate = new Date(week1Monday);
  startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
  return startDate;
}

/**
 * Determine which month a week belongs to based on majority days.
 * Returns the month (1-12) that has the most days in the week.
 */
function getWeekMonth(startDate: Date): number {
  // Week is Monday to Sunday (7 days)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  if (startMonth === endMonth) {
    return startMonth;
  }

  // Count days in each month
  const daysInStartMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate() - startDate.getDate() + 1;
  const daysInEndMonth = 7 - daysInStartMonth;

  // Return month with majority of days
  return daysInStartMonth >= daysInEndMonth ? startMonth : endMonth;
}

/**
 * Generate all 52 weeks for a year with M.W format
 */
export function generateWeeksForYear(year: number): WeekInfo[] {
  const weeks: WeekInfo[] = [];
  const monthWeekCounts: Record<number, number> = {};

  for (let weekNum = 1; weekNum <= 52; weekNum++) {
    const startDate = getWeekStartDate(year, weekNum);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const month = getWeekMonth(startDate);

    // Track week number within month
    if (!monthWeekCounts[month]) {
      monthWeekCounts[month] = 0;
    }
    monthWeekCounts[month]++;
    const weekInMonth = monthWeekCounts[month];

    weeks.push({
      week: `${month}.${weekInMonth}`,
      month,
      weekInMonth,
      startDate,
      endDate,
    });
  }

  return weeks;
}

/**
 * Get weeks for a specific month
 */
export function getWeeksForMonth(year: number, month: number): WeekInfo[] {
  const allWeeks = generateWeeksForYear(year);
  return allWeeks.filter(w => w.month === month);
}

/**
 * Get the current week in M.W format
 */
export function getCurrentWeek(): { year: number; week: string } {
  const now = new Date();
  const year = now.getFullYear();
  const allWeeks = generateWeeksForYear(year);

  for (const weekInfo of allWeeks) {
    if (now >= weekInfo.startDate && now <= weekInfo.endDate) {
      return { year, week: weekInfo.week };
    }
  }

  // Default to first week if not found
  return { year, week: "1.1" };
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[month - 1];
}

/**
 * Get short month name
 */
export function getShortMonthName(month: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return months[month - 1];
}

/**
 * Parse period string to get year, month, and optional week
 * "2026-3" -> { year: 2026, month: 3 }
 * "2026-3.2" -> { year: 2026, month: 3, week: 2 }
 */
export function parsePeriod(period: string): { year: number; month: number; week?: number } {
  const parts = period.split("-");
  const year = parseInt(parts[0]);
  const monthPart = parts[1];

  if (monthPart.includes(".")) {
    const [month, week] = monthPart.split(".").map(Number);
    return { year, month, week };
  }

  return { year, month: parseInt(monthPart) };
}

/**
 * Create period string
 */
export function createPeriod(year: number, month: number, week?: number): string {
  if (week !== undefined) {
    return `${year}-${month}.${week}`;
  }
  return `${year}-${month}`;
}

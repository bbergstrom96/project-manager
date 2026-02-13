import { format, subHours } from "date-fns";

/**
 * Get the current "routine date" (day resets at 4am)
 * If it's before 4am, return yesterday's date
 */
export function getCurrentRoutineDate(): string {
  const now = new Date();
  // Subtract 4 hours - if it's 3am Feb 13, this becomes 11pm Feb 12
  const adjusted = subHours(now, 4);
  return format(adjusted, "yyyy-MM-dd");
}

/**
 * Check if a given date string matches the current routine date
 */
export function isCurrentRoutineDate(dateStr: string): boolean {
  return dateStr === getCurrentRoutineDate();
}

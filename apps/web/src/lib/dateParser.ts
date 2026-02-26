import {
  addDays,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  startOfWeek,
  getISOWeek,
  getISOWeekYear,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  addWeeks,
} from "date-fns";

export interface ParsedDate {
  date?: Date;
  scheduledWeek?: string;
  matchedText: string;
}

function getISOWeekString(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

// Get the next occurrence of a weekday (if today is that day, return next week's)
function getNextWeekday(dayName: string, today: Date): Date | null {
  const dayChecks: Record<string, { check: (d: Date) => boolean; next: (d: Date) => Date }> = {
    monday: { check: isMonday, next: nextMonday },
    tuesday: { check: isTuesday, next: nextTuesday },
    wednesday: { check: isWednesday, next: nextWednesday },
    thursday: { check: isThursday, next: nextThursday },
    friday: { check: isFriday, next: nextFriday },
    saturday: { check: isSaturday, next: nextSaturday },
    sunday: { check: isSunday, next: nextSunday },
  };

  const day = dayChecks[dayName.toLowerCase()];
  if (!day) return null;

  // If today is that day, get next week's occurrence
  if (day.check(today)) {
    return addDays(today, 7);
  }
  return day.next(today);
}

// Patterns ordered by specificity (most specific first)
const datePatterns: {
  pattern: RegExp;
  parse: (match: RegExpMatchArray, today: Date) => ParsedDate | null;
}[] = [
  // "in X days/weeks"
  {
    pattern: /\bin\s+(\d+)\s+days?\b/i,
    parse: (match, today) => ({
      date: addDays(today, parseInt(match[1], 10)),
      matchedText: match[0],
    }),
  },
  {
    pattern: /\bin\s+(\d+)\s+weeks?\b/i,
    parse: (match, today) => ({
      date: addDays(today, parseInt(match[1], 10) * 7),
      matchedText: match[0],
    }),
  },
  // "next monday", "next tuesday", etc.
  {
    pattern: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    parse: (match, today) => {
      const date = getNextWeekday(match[1], today);
      return date ? { date, matchedText: match[0] } : null;
    },
  },
  // "next week" - sets scheduledWeek
  {
    pattern: /\bnext\s+week\b/i,
    parse: (match, today) => {
      const nextWeekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
      return {
        scheduledWeek: getISOWeekString(nextWeekStart),
        matchedText: match[0],
      };
    },
  },
  // "this week" - sets scheduledWeek
  {
    pattern: /\bthis\s+week\b/i,
    parse: (match, today) => {
      const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
      return {
        scheduledWeek: getISOWeekString(thisWeekStart),
        matchedText: match[0],
      };
    },
  },
  // Standalone weekday names (monday, tuesday, etc.)
  {
    pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    parse: (match, today) => {
      const date = getNextWeekday(match[1], today);
      return date ? { date, matchedText: match[0] } : null;
    },
  },
  // "tomorrow"
  {
    pattern: /\btomorrow\b/i,
    parse: (match, today) => ({
      date: addDays(today, 1),
      matchedText: match[0],
    }),
  },
  // "today"
  {
    pattern: /\btoday\b/i,
    parse: (match, today) => ({
      date: today,
      matchedText: match[0],
    }),
  },
];

export function parseDateFromText(text: string): ParsedDate | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const { pattern, parse } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const result = parse(match, today);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

export function removeDateFromText(text: string, matchedText: string): string {
  // Remove the matched text and clean up extra spaces
  return text
    .replace(matchedText, "")
    .replace(/\s+/g, " ")
    .trim();
}

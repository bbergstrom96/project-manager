"use client";

import * as React from "react";
import { format, addDays, nextSaturday, nextMonday, isToday, isTomorrow, isSaturday, isSunday } from "date-fns";
import { Sun, Calendar as CalendarIcon, Sofa, ArrowRight, Circle, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onClose?: () => void;
  className?: string;
}

interface QuickOption {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  getDate: () => Date;
  iconColor?: string;
}

export function DatePicker({ date, onSelect, onClose, className }: DatePickerProps) {
  const today = new Date();

  // Calculate quick option dates
  const tomorrow = addDays(today, 1);

  // "Later this week" = Friday (if today is Mon-Wed), otherwise skip
  const getLaterThisWeek = (): Date | null => {
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeek >= 0 && dayOfWeek <= 3) {
      // Sunday through Wednesday - show Friday
      const daysUntilFriday = 5 - dayOfWeek;
      return addDays(today, daysUntilFriday);
    }
    return null;
  };

  // "This weekend" = Saturday
  const getThisWeekend = (): Date => {
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 6) return today; // Already Saturday
    if (dayOfWeek === 0) return addDays(today, 6); // Sunday -> next Saturday
    return nextSaturday(today);
  };

  // "Next week" = Next Monday
  const getNextWeek = (): Date => {
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 1) return addDays(today, 7); // Monday -> next Monday
    return nextMonday(today);
  };

  const laterThisWeek = getLaterThisWeek();
  const thisWeekend = getThisWeekend();
  const nextWeek = getNextWeek();

  const quickOptions: (QuickOption | null)[] = [
    // Only show Today option if not already set to today
    (!date || !isToday(date)) ? {
      icon: <CalendarCheck className="h-4 w-4" />,
      label: "Today",
      sublabel: format(today, "EEE"),
      getDate: () => today,
      iconColor: "text-green-500",
    } : null,
    {
      icon: <Sun className="h-4 w-4" />,
      label: "Tomorrow",
      sublabel: format(tomorrow, "EEE"),
      getDate: () => tomorrow,
      iconColor: "text-yellow-500",
    },
    laterThisWeek ? {
      icon: <CalendarIcon className="h-4 w-4" />,
      label: "Later this week",
      sublabel: format(laterThisWeek, "EEE"),
      getDate: () => laterThisWeek,
      iconColor: "text-blue-500",
    } : null,
    {
      icon: <Sofa className="h-4 w-4" />,
      label: "This weekend",
      sublabel: format(thisWeekend, "EEE"),
      getDate: () => thisWeekend,
      iconColor: "text-blue-400",
    },
    {
      icon: <ArrowRight className="h-4 w-4" />,
      label: "Next week",
      sublabel: format(nextWeek, "EEE MMM d"),
      getDate: () => nextWeek,
      iconColor: "text-purple-500",
    },
  ];

  const handleQuickSelect = (option: QuickOption) => {
    onSelect(option.getDate());
    onClose?.();
  };

  const handleNoDate = () => {
    onSelect(undefined);
    onClose?.();
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate);
    if (selectedDate) {
      onClose?.();
    }
  };

  return (
    <div className={cn("w-64", className)}>
      {/* Current selection */}
      {date && (
        <div className="px-3 py-2 border-b border-[#3d3d3d]">
          <span className="text-sm font-medium text-blue-400">
            {isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d")}
          </span>
        </div>
      )}

      {/* Quick options */}
      <div className="py-1 border-b border-[#3d3d3d]">
        {quickOptions.filter(Boolean).map((option) => (
          <button
            key={option!.label}
            onClick={() => handleQuickSelect(option!)}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-[#2d2d2d] transition-colors"
          >
            <span className={option!.iconColor}>{option!.icon}</span>
            <span className="flex-1 text-left text-zinc-200">{option!.label}</span>
            <span className="text-zinc-500 text-xs">{option!.sublabel}</span>
          </button>
        ))}

        {/* No Date option */}
        <button
          onClick={handleNoDate}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-[#2d2d2d] transition-colors"
        >
          <Circle className="h-4 w-4 text-zinc-500" />
          <span className="flex-1 text-left text-zinc-200">No Date</span>
        </button>
      </div>

      {/* Calendar */}
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleCalendarSelect}
        className="p-2"
        classNames={{
          months: "flex flex-col",
          month: "space-y-2",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-[#2d2d2d]",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
          row: "flex w-full mt-1",
          cell: "h-8 w-8 text-center text-sm p-0 relative",
          day: "h-8 w-8 p-0 font-normal hover:bg-[#2d2d2d] rounded-full inline-flex items-center justify-center",
          day_selected: "bg-red-500 text-white hover:bg-red-500 hover:text-white rounded-full",
          day_today: "border border-zinc-500 rounded-full",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}

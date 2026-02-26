"use client";

import * as React from "react";
import { format, addDays, isToday, isTomorrow, startOfWeek, getISOWeek, getISOWeekYear } from "date-fns";
import { Sun, CalendarDays, ArrowRight, Circle, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";

function getISOWeekString(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

interface DatePickerProps {
  date: Date | undefined;
  scheduledWeek?: string | null;
  onSelect: (date: Date | undefined) => void;
  onSelectWeek?: (week: string | null) => void;
  onClose?: () => void;
  className?: string;
}

interface QuickOption {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  action: () => void;
  iconColor?: string;
}

export function DatePicker({ date, scheduledWeek, onSelect, onSelectWeek, onClose, className }: DatePickerProps) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Calculate week strings
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const nextWeekStart = addDays(currentWeekStart, 7);
  const currentWeekString = getISOWeekString(currentWeekStart);
  const nextWeekString = getISOWeekString(nextWeekStart);

  const quickOptions: (QuickOption | null)[] = [
    // Only show Today option if not already set to today
    (!date || !isToday(date)) ? {
      icon: <CalendarCheck className="h-4 w-4" />,
      label: "Today",
      sublabel: format(today, "EEE"),
      action: () => {
        onSelect(today);
        onSelectWeek?.(null);
        onClose?.();
      },
      iconColor: "text-green-500",
    } : null,
    {
      icon: <Sun className="h-4 w-4" />,
      label: "Tomorrow",
      sublabel: format(tomorrow, "EEE"),
      action: () => {
        onSelect(tomorrow);
        onSelectWeek?.(null);
        onClose?.();
      },
      iconColor: "text-yellow-500",
    },
    {
      icon: <CalendarDays className="h-4 w-4" />,
      label: "This Week",
      sublabel: currentWeekString,
      action: () => {
        onSelect(undefined);
        onSelectWeek?.(currentWeekString);
        onClose?.();
      },
      iconColor: "text-blue-500",
    },
    {
      icon: <ArrowRight className="h-4 w-4" />,
      label: "Next Week",
      sublabel: nextWeekString,
      action: () => {
        onSelect(undefined);
        onSelectWeek?.(nextWeekString);
        onClose?.();
      },
      iconColor: "text-purple-500",
    },
  ];

  const handleNoDate = () => {
    onSelect(undefined);
    onSelectWeek?.(null);
    onClose?.();
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate);
    if (selectedDate) {
      onSelectWeek?.(null);
      onClose?.();
    }
  };

  // Display current selection
  const getCurrentSelectionLabel = () => {
    if (date) {
      return isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d");
    }
    if (scheduledWeek) {
      if (scheduledWeek === currentWeekString) return "This Week";
      if (scheduledWeek === nextWeekString) return "Next Week";
      return scheduledWeek;
    }
    return null;
  };

  const selectionLabel = getCurrentSelectionLabel();

  return (
    <div className={cn("w-64", className)}>
      {/* Current selection */}
      {selectionLabel && (
        <div className="px-3 py-2 border-b border-[#3d3d3d]">
          <span className="text-sm font-medium text-blue-400">
            {selectionLabel}
          </span>
        </div>
      )}

      {/* Quick options */}
      <div className="py-1 border-b border-[#3d3d3d]">
        {quickOptions.filter(Boolean).map((option) => (
          <button
            key={option!.label}
            onClick={option!.action}
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

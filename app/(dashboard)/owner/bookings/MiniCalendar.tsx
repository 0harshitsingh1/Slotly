"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  bookedDates: string[];
  timezone: string;
}

export function MiniCalendar({
  selectedDate,
  onSelectDate,
  bookedDates,
  timezone,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const onDateClick = (day: Date) => {
    onSelectDate(day);
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(startOfMonth(day));
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800 transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-center font-semibold text-[10px] text-slate-500 uppercase tracking-wider py-2"
        >
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;

        const cloneDayStr = format(cloneDay, "yyyy-MM-dd");
        const hasBooking = bookedDates.includes(cloneDayStr);

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);

        days.push(
          <div
            key={day.toString()}
            className="flex flex-col items-center justify-center p-1"
          >
            <button
              onClick={() => onDateClick(cloneDay)}
              className={`
                relative h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all font-medium
                ${!isCurrentMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-300"}
                ${isSelected ? "bg-brand-600 text-white font-bold shadow-md shadow-brand-500/30" : ""}
                ${!isSelected && isTodayDate ? "bg-slate-100 text-brand-600 dark:bg-slate-800 dark:text-brand-400 font-bold" : ""}
                ${!isSelected && !isTodayDate ? "hover:bg-slate-100 dark:hover:bg-slate-800" : ""}
              `}
            >
              <span>{formattedDate}</span>
              {/* Booking Indicator Dot */}
              {hasBooking && (
                <div
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-brand-500"
                  }`}
                />
              )}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}

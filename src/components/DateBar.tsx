import React from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { formatHebrewDate, addDaysToDateString, getTodayDateString } from '../utils/dateUtils';
import { DailyPlan } from '../types/nutrition';

interface DateBarProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  dailyPlan: DailyPlan;
}

export const DateBar: React.FC<DateBarProps> = ({
  currentDate,
  onDateChange,
  dailyPlan,
}) => {
  const today = getTodayDateString();
  const isToday = currentDate === today;
  const { full: formattedDate, dayName, shortDate } = formatHebrewDate(currentDate);

  const completedCount = dailyPlan.meals.filter(m => m.isCompleted).length;
  const totalCount = dailyPlan.meals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Mini week strip around currentDate
  const weekDays = [-2, -1, 0, 1, 2].map(offset => {
    const dStr = addDaysToDateString(currentDate, offset);
    const info = formatHebrewDate(dStr);
    return {
      dateStr: dStr,
      dayShort: info.dayName.replace('יום ', ''),
      dayNum: dStr.split('-')[2],
      isCurrent: dStr === currentDate,
      isRealToday: dStr === today,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm mb-4">
      {/* Top row: Date navigation & Today button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous Day (In RTL, ChevronRight moves to previous in time) */}
          <button
            onClick={() => onDateChange(addDaysToDateString(currentDate, -1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="יום קודם"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Next Day */}
          <button
            onClick={() => onDateChange(addDaysToDateString(currentDate, 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="יום הבא"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Jump to Today */}
          {!isToday && (
            <button
              onClick={() => onDateChange(today)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>היום</span>
            </button>
          )}
        </div>

        {/* Date Title */}
        <div className="text-center flex-1 mx-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-base sm:text-lg font-bold text-white tracking-wide">
              {formattedDate}
            </span>
            {isToday && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                היום
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            הושלמו {completedCount} מתוך {totalCount} ארוחות ({progressPercent}%)
          </p>
        </div>

        {/* Calendar Picker input */}
        <label className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center justify-center">
          <CalendarIcon className="w-5 h-5" />
          <input
            type="date"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) onDateChange(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </label>
      </div>

      {/* Mini day strip */}
      <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-800/80">
        {weekDays.map(item => (
          <button
            key={item.dateStr}
            onClick={() => onDateChange(item.dateStr)}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
              item.isCurrent
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-102'
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider opacity-80">
              {item.dayShort}
            </div>
            <div className="text-sm font-black mt-0.5 flex items-center justify-center gap-1">
              {item.dayNum}
              {item.isRealToday && !item.isCurrent && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

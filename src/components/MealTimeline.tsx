import React from 'react';
import { Plus, Download, Clock } from 'lucide-react';
import { Meal, FoodItem } from '../types/nutrition';
import { MealCard } from './MealCard';
import { downloadCalendarIcs } from '../utils/notifications';

interface MealTimelineProps {
  meals: Meal[];
  dateStr: string;
  isToday: boolean;
  onToggleComplete: (mealId: string) => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
  onUpdateTime: (mealId: string, newTime: string) => void;
  onOpenSwap: (mealId: string, item: FoodItem) => void;
  onAddNewMeal: () => void;
  onOpenExportIcs: () => void;
  onOpenQuickMacros: (meal: Meal) => void;
  whatsappPhone?: string;
}

export const MealTimeline: React.FC<MealTimelineProps> = ({
  meals,
  dateStr,
  isToday,
  onToggleComplete,
  onEditMeal,
  onDeleteMeal,
  onUpdateTime,
  onOpenSwap,
  onAddNewMeal,
  onOpenExportIcs,
  onOpenQuickMacros,
  whatsappPhone,
}) => {
  // Sort chronologically by scheduledTime
  const sortedMeals = [...meals].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return (
    <div className="space-y-2">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between gap-2 px-1 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-extrabold text-white tracking-wide">
            סדר הארוחות היומי ({sortedMeals.length} ארוחות)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Calendar Export button */}
          <button
            onClick={onOpenExportIcs}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="ייצוא ליומן הטלפון (.ics) עם בחירת כמות ימים"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ייצוא ליומן (.ics)</span>
            <span className="sm:hidden">יומן</span>
          </button>

          {/* Add Meal button */}
          <button
            onClick={onAddNewMeal}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הוסף ארוחה</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sortedMeals.length === 0 && (
        <div className="text-center p-8 rounded-2xl bg-slate-900 border border-dashed border-slate-800 text-slate-400">
          <p className="text-sm mb-3">אין עדיין ארוחות מוגדרות ליום זה.</p>
          <button
            onClick={onAddNewMeal}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer"
          >
            הוסף ארוחה ראשונה
          </button>
        </div>
      )}

      {/* Chronological List of Meals */}
      {sortedMeals.map((meal, index) => (
        <MealCard
          key={meal.id}
          meal={meal}
          index={index}
          dateStr={dateStr}
          isToday={isToday}
          onToggleComplete={onToggleComplete}
          onEditMeal={onEditMeal}
          onDeleteMeal={onDeleteMeal}
          onUpdateTime={onUpdateTime}
          onOpenSwap={onOpenSwap}
          onOpenQuickMacros={onOpenQuickMacros}
          whatsappPhone={whatsappPhone}
        />
      ))}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Check,
  Clock,
  Edit2,
  Trash2,
  Plus,
  Repeat,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Flame
} from 'lucide-react';
import { Meal, FoodItem, getMealTotals } from '../types/nutrition';
import { getMinutesDifference, formatMinutesUntil } from '../utils/dateUtils';
import { getMealWhatsAppShareUrl, playMealNotificationSound } from '../utils/notifications';

interface MealCardProps {
  meal: Meal;
  index: number;
  dateStr: string;
  isToday: boolean;
  onToggleComplete: (mealId: string) => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
  onUpdateTime: (mealId: string, newTime: string) => void;
  onOpenSwap: (mealId: string, item: FoodItem) => void;
  onOpenQuickMacros?: (meal: Meal) => void;
  whatsappPhone?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  index,
  dateStr,
  isToday,
  onToggleComplete,
  onEditMeal,
  onDeleteMeal,
  onUpdateTime,
  onOpenSwap,
  onOpenQuickMacros,
  whatsappPhone,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState(meal.scheduledTime);

  const {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat
  } = getMealTotals(meal);

  const diffMinutes = isToday ? getMinutesDifference(meal.scheduledTime, dateStr) : 0;
  const { text: timeUntilText, isNow, isPast } = isToday ? formatMinutesUntil(diffMinutes) : { text: '', isNow: false, isPast: false };

  const handleTimeSave = () => {
    if (tempTime && tempTime !== meal.scheduledTime) {
      onUpdateTime(meal.id, tempTime);
    }
    setIsEditingTime(false);
  };

  const shiftTimeMinutes = (minutesDelta: number) => {
    const [h, m] = meal.scheduledTime.split(':').map(Number);
    let totalMins = h * 60 + m + minutesDelta;
    if (totalMins < 0) totalMins += 24 * 60;
    totalMins = totalMins % (24 * 60);

    const newH = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const newM = String(totalMins % 60).padStart(2, '0');
    onUpdateTime(meal.id, `${newH}:${newM}`);
  };

  const whatsappUrl = getMealWhatsAppShareUrl(meal, whatsappPhone);

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden mb-3 ${
        meal.isCompleted
          ? 'bg-slate-900/60 border-slate-800 opacity-80'
          : isNow
          ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header Row */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        {/* Left: Checkmark + Time badge + Meal Name */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Eaten Checkbox Toggle */}
          <button
            onClick={() => {
              if (!meal.isCompleted) {
                playMealNotificationSound();
              }
              onToggleComplete(meal.id);
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              meal.isCompleted
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                : 'bg-slate-800 border border-slate-700 text-transparent hover:text-slate-400 hover:border-emerald-500/50'
            }`}
            title={meal.isCompleted ? 'סמן כלא נאכל' : 'סמן כנאכל'}
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>

          {/* Time Badge (Editable) */}
          <div className="shrink-0">
            {isEditingTime ? (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-emerald-500">
                <input
                  type="time"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleTimeSave}
                  className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold"
                >
                  שמור
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditingTime(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    meal.isCompleted
                      ? 'bg-slate-800/80 text-slate-400'
                      : isNow
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title="לחץ לשינוי שעת הארוחה"
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{meal.scheduledTime}</span>
                </button>

                {/* Quick -15 and +15 min buttons */}
                <div className="hidden sm:flex items-center gap-0.5">
                  <button
                    onClick={() => shiftTimeMinutes(-15)}
                    className="px-1 text-[10px] text-slate-400 hover:text-white bg-slate-800/60 rounded"
                    title="הקדמת הארוחה ב-15 דקות"
                  >
                    -15
                  </button>
                  <button
                    onClick={() => shiftTimeMinutes(15)}
                    className="px-1 text-[10px] text-slate-400 hover:text-white bg-slate-800/60 rounded"
                    title="דחיית הארוחה ב-15 דקות"
                  >
                    +15
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Meal Title & Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm sm:text-base truncate ${meal.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                {meal.name}
              </h3>
              {isToday && !meal.isCompleted && isNow && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full animate-pulse">
                  עכשיו!
                </span>
              )}
            </div>

            {/* Quick Macro Summary (Clickable to edit directly) */}
            <button
              type="button"
              onClick={() => onOpenQuickMacros?.(meal)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 flex-wrap px-2 py-0.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group text-right"
              title="לחץ לשינוי ישיר של הערך הקלורי, חלבון, פחמימה ושומן"
            >
              <span className="font-semibold text-emerald-400 group-hover:underline">{totalProtein}ג׳ חלבון</span>
              <span>•</span>
              <span className="text-amber-400/90">{totalCarbs}ג׳ פחמ׳</span>
              <span>•</span>
              <span className="text-rose-400/90">{totalFat}ג׳ שומן</span>
              <span>•</span>
              <span className="font-medium text-slate-300">{totalCalories} קק״ל</span>
              {meal.customTotals ? (
                <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1 rounded font-bold">
                  מותאם
                </span>
              ) : (
                <Flame className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Macros Edit Button */}
          <button
            onClick={() => onOpenQuickMacros?.(meal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="עריכת ערך קלורי ומאקרו לארוחה זו"
          >
            <Flame className="w-4 h-4" />
          </button>

          {/* WhatsApp Reminder Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            title="שלח תזכורת זו ל-WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          {/* Edit Meal Details Button */}
          <button
            onClick={() => onEditMeal(meal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="ערוך ארוחה ומאכלים"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Meal */}
          <button
            onClick={() => onDeleteMeal(meal.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="מחק ארוחה זו"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content: Food Items List */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 border-t border-slate-800/80 pt-3">
          {/* Food items table/list */}
          <div className="space-y-1.5">
            {meal.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition-colors group"
              >
                {/* Food Name & Amount */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">
                      ({item.amount} {item.unit})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{item.protein}ג׳ חלבון</span>
                    <span>•</span>
                    <span className="text-amber-400/80">{item.carbs}ג׳ פחמימה</span>
                    <span>•</span>
                    <span className="text-rose-400/80">{item.fat}ג׳ שומן</span>
                    <span>•</span>
                    <span>{item.calories} קק״ל</span>
                  </div>
                </div>

                {/* Quick Swap button */}
                <button
                  onClick={() => onOpenSwap(meal.id, item)}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  title="החלף במאכל שווה ערך לחיטוב"
                >
                  <Repeat className="w-3 h-3" />
                  <span className="hidden sm:inline">החלף מאכל</span>
                </button>
              </div>
            ))}
          </div>

          {/* Meal Notes / Advice */}
          {meal.notes && (
            <div className="mt-2.5 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2 text-xs text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{meal.notes}</span>
            </div>
          )}

          {/* Quick Footer: Add food item button */}
          <div className="mt-2.5 flex items-center justify-between">
            <button
              onClick={() => onEditMeal(meal)}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף או ערוך מאכלים בארוחה זו</span>
            </button>

            {isToday && !meal.isCompleted && (
              <span className="text-[11px] text-slate-400">
                {timeUntilText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

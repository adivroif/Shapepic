import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, ChevronRight, MessageSquare, Plus, BellRing } from 'lucide-react';
import { Meal, getMealTotals } from '../types/nutrition';
import { getMinutesDifference, formatMinutesUntil } from '../utils/dateUtils';
import { getMealWhatsAppShareUrl, playMealNotificationSound } from '../utils/notifications';

interface NextMealBannerProps {
  meals: Meal[];
  dateStr: string;
  isToday: boolean;
  onToggleComplete: (mealId: string) => void;
  onPostponeMeal: (mealId: string, minutes: number) => void;
  whatsappPhone?: string;
}

export const NextMealBanner: React.FC<NextMealBannerProps> = ({
  meals,
  dateStr,
  isToday,
  onToggleComplete,
  onPostponeMeal,
  whatsappPhone,
}) => {
  const [, setTick] = useState(0);

  // Update countdown every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isToday || meals.length === 0) return null;

  // Find next uncompleted meal
  // Sort meals by scheduledTime
  const sorted = [...meals].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  const uncompleted = sorted.filter(m => !m.isCompleted);

  if (uncompleted.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            🏆
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              כל הכבוד! כל ארוחות היום הושלמו בהצלחה
            </h3>
            <p className="text-xs text-emerald-300">
              עמדת ביעדי החיטוב והחלבון היומיים. שמור על התמדה למחר!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find the closest upcoming or overdue meal
  const nextMeal = uncompleted[0];
  const diffMinutes = getMinutesDifference(nextMeal.scheduledTime, dateStr);
  const { text: timeUntilText, isNow, isPast } = formatMinutesUntil(diffMinutes);

  const mealTotals = getMealTotals(nextMeal);
  const totalCals = mealTotals.calories;
  const totalProtein = mealTotals.protein;
  const whatsappUrl = getMealWhatsAppShareUrl(nextMeal, whatsappPhone);

  return (
    <div className={`rounded-2xl p-4 mb-4 border transition-all shadow-lg ${
      isNow
        ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-500 shadow-emerald-500/10 animate-pulse'
        : isPast
        ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40'
        : 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border-slate-700/80'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left side: Meal info & time badge */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
            isNow
              ? 'bg-emerald-500 text-slate-950 font-black ring-4 ring-emerald-500/30'
              : isPast
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-800 text-emerald-400 border border-slate-700'
          }`}>
            <Clock className="w-4 h-4 mb-0.5" />
            <span className="text-[11px] leading-tight font-extrabold">{nextMeal.scheduledTime}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {isNow ? '🔥 הארוחה הבאה (עכשיו)' : isPast ? '⚠️ שעת הארוחה חלפה' : '⏳ הארוחה הבאה'}
              </span>
              <span className={`text-xs font-bold ${isNow ? 'text-emerald-400' : isPast ? 'text-amber-400' : 'text-cyan-400'}`}>
                {timeUntilText}
              </span>
            </div>

            <h3 className="font-extrabold text-base sm:text-lg text-white mt-0.5">
              {nextMeal.name}
            </h3>

            <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap mt-0.5">
              <span>{nextMeal.items.map(i => i.name).slice(0, 3).join(', ')}{nextMeal.items.length > 3 ? '...' : ''}</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-300 font-semibold">{totalProtein}ג׳ חלבון</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">{totalCals} קק״ל</span>
            </div>
          </div>
        </div>

        {/* Right side: Quick Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {/* Postpone +15 min */}
          <button
            onClick={() => onPostponeMeal(nextMeal.id, 15)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
            title="דחה את שעת הארוחה ב-15 דקות"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>+15 דק׳</span>
          </button>

          {/* WhatsApp Reminder */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
            title="שלח תזכורת זו ל-WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </a>

          {/* Mark as Eaten Button */}
          <button
            onClick={() => {
              playMealNotificationSound();
              onToggleComplete(nextMeal.id);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>אכלתי עכשיו!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

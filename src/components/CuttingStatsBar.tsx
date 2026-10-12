import React from 'react';
import { Flame, Dumbbell, Wheat, Droplets, Plus, Minus } from 'lucide-react';
import { DailyPlan, getMealTotals } from '../types/nutrition';

interface CuttingStatsBarProps {
  plan: DailyPlan;
  onUpdateWater: (ml: number) => void;
}

export const CuttingStatsBar: React.FC<CuttingStatsBarProps> = ({
  plan,
  onUpdateWater,
}) => {
  // Calculate consumed totals from completed meals
  const completedMeals = plan.meals.filter(m => m.isCompleted);
  
  const consumedCalories = completedMeals.reduce((sum, m) => sum + getMealTotals(m).calories, 0);
  const consumedProtein = completedMeals.reduce((sum, m) => sum + getMealTotals(m).protein, 0);
  const consumedCarbs = completedMeals.reduce((sum, m) => sum + getMealTotals(m).carbs, 0);
  const consumedFat = completedMeals.reduce((sum, m) => sum + getMealTotals(m).fat, 0);

  // Planned totals (if all meals are eaten)
  const totalPlannedCalories = plan.meals.reduce((sum, m) => sum + getMealTotals(m).calories, 0);
  const totalPlannedProtein = plan.meals.reduce((sum, m) => sum + getMealTotals(m).protein, 0);

  const calProgress = plan.targetCalories > 0 ? Math.min(100, Math.round((consumedCalories / plan.targetCalories) * 100)) : 0;
  const proteinProgress = plan.targetProtein > 0 ? Math.min(100, Math.round((consumedProtein / plan.targetProtein) * 100)) : 0;
  const calsRemaining = Math.max(0, plan.targetCalories - consumedCalories);

  const waterProgress = Math.min(100, Math.round((plan.waterIntakeMl / (plan.targetWaterMl || 3000)) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm mb-4">
      {/* Top row: Calories & Deficit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              יעד קלורי לחיטוב
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">
              {consumedCalories.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">
              מתוך {plan.targetCalories.toLocaleString()} קק״ל
            </span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              נותרו {calsRemaining} קק״ל
            </span>
          </div>
        </div>

        {/* Planned vs Target indicator */}
        <div className="text-left sm:text-right text-xs text-slate-400">
          <div>תכנון כולל להיום: <span className="font-semibold text-slate-200">{totalPlannedCalories} קק״ל</span></div>
          <div>יעד חלבון כולל: <span className="font-semibold text-emerald-300">{totalPlannedProtein}ג׳ חלבון</span></div>
        </div>
      </div>

      {/* Calories Progress Bar */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${calProgress}%` }}
        />
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-2">
        {/* Protein Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Dumbbell className="w-3.5 h-3.5" />
              חלבון
            </span>
            <span className="text-[10px] text-slate-400">{proteinProgress}%</span>
          </div>
          <div className="text-base font-bold text-white">
            {Math.round(consumedProtein)} <span className="text-xs font-normal text-slate-400">/ {plan.targetProtein}ג׳</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${proteinProgress}%` }}
            />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Wheat className="w-3.5 h-3.5" />
              פחמימות
            </span>
          </div>
          <div className="text-base font-bold text-white">
            {Math.round(consumedCarbs)} <span className="text-xs font-normal text-slate-400">/ {plan.targetCarbs}ג׳</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${Math.min(100, (consumedCarbs / (plan.targetCarbs || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fats Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-rose-400">
              🥑 שומנים
            </span>
          </div>
          <div className="text-base font-bold text-white">
            {Math.round(consumedFat)} <span className="text-xs font-normal text-slate-400">/ {plan.targetFat}ג׳</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full"
              style={{ width: `${Math.min(100, (consumedFat / (plan.targetFat || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Water Hydration Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-cyan-400">
              <Droplets className="w-3.5 h-3.5" />
              שתיית מים
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateWater(Math.max(0, plan.waterIntakeMl - 250))}
                className="w-4 h-4 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 text-[10px] cursor-pointer"
                title="הפחת 250 מ״ל"
              >
                -
              </button>
              <button
                onClick={() => onUpdateWater(plan.waterIntakeMl + 250)}
                className="w-4 h-4 rounded bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center text-white text-[10px] cursor-pointer font-bold"
                title="הוסף כוס מים (250 מ״ל)"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-base font-bold text-white">
            {(plan.waterIntakeMl / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">/ {((plan.targetWaterMl || 3000) / 1000).toFixed(1)} ליטר</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${waterProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

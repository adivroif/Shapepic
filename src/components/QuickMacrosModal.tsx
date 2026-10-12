import React, { useState, useEffect } from 'react';
import { X, Flame, Dumbbell, Wheat, Check, RotateCcw } from 'lucide-react';
import { Meal, MealTotals, getMealTotals } from '../types/nutrition';

interface QuickMacrosModalProps {
  isOpen: boolean;
  meal: Meal | null;
  onClose: () => void;
  onSaveTotals: (mealId: string, totals: MealTotals | undefined) => void;
}

export const QuickMacrosModal: React.FC<QuickMacrosModalProps> = ({
  isOpen,
  meal,
  onClose,
  onSaveTotals,
}) => {
  if (!isOpen || !meal) return null;

  const currentTotals = getMealTotals(meal);
  const calculatedFromItems: MealTotals = {
    calories: meal.items.reduce((s, i) => s + (Number(i.calories) || 0), 0),
    protein: meal.items.reduce((s, i) => s + (Number(i.protein) || 0), 0),
    carbs: meal.items.reduce((s, i) => s + (Number(i.carbs) || 0), 0),
    fat: meal.items.reduce((s, i) => s + (Number(i.fat) || 0), 0),
  };

  const [calories, setCalories] = useState<number>(currentTotals.calories);
  const [protein, setProtein] = useState<number>(currentTotals.protein);
  const [carbs, setCarbs] = useState<number>(currentTotals.carbs);
  const [fat, setFat] = useState<number>(currentTotals.fat);

  useEffect(() => {
    if (meal) {
      const tot = getMealTotals(meal);
      setCalories(tot.calories);
      setProtein(tot.protein);
      setCarbs(tot.carbs);
      setFat(tot.fat);
    }
  }, [meal]);

  const handleSave = () => {
    onSaveTotals(meal.id, {
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    onClose();
  };

  const handleResetToCalculated = () => {
    setCalories(calculatedFromItems.calories);
    setProtein(calculatedFromItems.protein);
    setCarbs(calculatedFromItems.carbs);
    setFat(calculatedFromItems.fat);
    onSaveTotals(meal.id, undefined); // Clears customTotals override
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                שינוי ערכי הארוחה ({meal.name})
              </h2>
              <p className="text-[11px] text-slate-400">
                הגדר ישירות את הקלוריות והמאקרו לארוחה זו
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Calories input */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4" />
                ערך קלורי (קק״ל):
              </span>
              <span className="text-[10px] text-slate-500">
                מחושב ממאכלים: {calculatedFromItems.calories}
              </span>
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-lg font-black text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Protein input */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Dumbbell className="w-4 h-4" />
                חלבון (גרם):
              </span>
              <span className="text-[10px] text-slate-500">
                מחושב: {calculatedFromItems.protein}ג׳
              </span>
            </label>
            <input
              type="number"
              step="0.5"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Carbs and Fats row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                פחמימות (ג׳):
              </label>
              <input
                type="number"
                step="0.5"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-amber-300 font-mono focus:outline-none focus:border-amber-400 text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1">
                מחושב: {calculatedFromItems.carbs}ג׳
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                שומן (ג׳):
              </label>
              <input
                type="number"
                step="0.5"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm font-bold text-rose-300 font-mono focus:outline-none focus:border-rose-400 text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1">
                מחושב: {calculatedFromItems.fat}ג׳
              </span>
            </div>
          </div>

          {/* Reset button if custom */}
          {meal.customTotals && (
            <button
              type="button"
              onClick={handleResetToCalculated}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>אפס לחישוב אוטומטי מפריטי המזון</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>שמור ערכים</span>
          </button>
        </div>
      </div>
    </div>
  );
};

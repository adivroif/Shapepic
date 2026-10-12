import React, { useState } from 'react';
import { X, Repeat, Sparkles, Loader2, Check } from 'lucide-react';
import { FoodItem, SwapOption } from '../types/nutrition';
import { COMMON_SWAP_DATABASE } from '../data/defaultTemplates';

interface SwapFoodModalProps {
  isOpen: boolean;
  mealId: string;
  foodItem: FoodItem | null;
  onClose: () => void;
  onApplySwap: (mealId: string, oldItemId: string, newFood: Partial<FoodItem>) => void;
}

export const SwapFoodModal: React.FC<SwapFoodModalProps> = ({
  isOpen,
  mealId,
  foodItem,
  onClose,
  onApplySwap,
}) => {
  if (!isOpen || !foodItem) return null;

  const [isLoading, setIsLoading] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [options, setOptions] = useState<SwapOption[]>(() => {
    // Find matching preset in local DB
    for (const key of Object.keys(COMMON_SWAP_DATABASE)) {
      if (foodItem.name.includes(key)) {
        return COMMON_SWAP_DATABASE[key];
      }
    }
    // Default smart alternatives if no direct key matched
    return [
      {
        name: 'דג אמנון / דניס בתנור',
        amount: Math.round(foodItem.amount * 1.1),
        unit: foodItem.unit,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: 0,
        fat: Math.max(1, Math.round(foodItem.fat * 0.9)),
        reason: 'חלופה קלה לעיכול, עשירה באומגה 3 ודלת קלוריות',
      },
      {
        name: 'סינטה בקר רזה צרובה',
        amount: Math.round(foodItem.amount * 0.9),
        unit: foodItem.unit,
        calories: Math.round(foodItem.calories * 1.05),
        protein: foodItem.protein,
        carbs: 0,
        fat: Math.round(foodItem.fat * 1.2),
        reason: 'עשירה בברזל ובקריאטין לשמירה על כוח בחיטוב',
      },
      {
        name: 'טופו במרקם קשה צרוב',
        amount: Math.round(foodItem.amount * 1.2),
        unit: foodItem.unit,
        calories: foodItem.calories,
        protein: Math.round(foodItem.protein * 0.85),
        carbs: 3,
        fat: foodItem.fat,
        reason: 'חלופה צמחית/טבעונית עשירה בסידן ללא שומן רווי',
      },
    ];
  });

  const handleFetchAiSwaps = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/suggest-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodItem, reason: customReason }),
      });
      const data = await res.json();
      if (data.success && data.data?.options) {
        setOptions(data.data.options);
      }
    } catch (err) {
      console.warn('AI swap failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (opt: SwapOption) => {
    onApplySwap(mealId, foodItem.id, {
      name: opt.name,
      amount: opt.amount,
      unit: opt.unit,
      calories: opt.calories,
      protein: opt.protein,
      carbs: opt.carbs,
      fat: opt.fat,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                החלפת מאכל שוות-ערך
              </h2>
              <p className="text-xs text-slate-400">
                שומרים על אותם ערכים תזונתיים של חלבון וקלוריות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Food Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block mb-1">
            המאכל הנוכחי שתרצה להחליף:
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white">
              {foodItem.name} ({foodItem.amount} {foodItem.unit})
            </span>
            <div className="text-xs font-semibold flex items-center gap-2">
              <span className="text-emerald-400">{foodItem.protein}ג׳ חלבון</span>
              <span className="text-slate-400">{foodItem.calories} קק״ל</span>
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              חלופות מומלצות לחיטוב:
            </span>
            <button
              onClick={handleFetchAiSwaps}
              disabled={isLoading}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>מחפש חלופות AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>בקש רעיונות נוספים (AI)</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-white text-sm">
                    <span>{opt.name}</span>
                    <span className="text-xs font-mono text-slate-300">
                      {opt.amount} {opt.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {opt.reason}
                  </p>
                  <div className="flex items-center gap-2.5 mt-2 text-xs">
                    <span className="text-emerald-400 font-bold">{opt.protein}ג׳ חלבון</span>
                    <span className="text-amber-400">{opt.carbs}ג׳ פחמימה</span>
                    <span className="text-rose-400">{opt.fat}ג׳ שומן</span>
                    <span className="text-slate-400">{opt.calories} קק״ל</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleSelectOption(opt)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>בחר חלופה זו</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

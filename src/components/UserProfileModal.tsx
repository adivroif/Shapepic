import React, { useState } from 'react';
import { X, User, Flame, Dumbbell, Target, Check } from 'lucide-react';
import { CuttingProfile } from '../types/nutrition';

interface UserProfileModalProps {
  isOpen: boolean;
  profile: CuttingProfile;
  onClose: () => void;
  onSave: (updated: CuttingProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name || 'מתחטב');
  const [currentWeightKg, setCurrentWeightKg] = useState(profile.currentWeightKg || 80);
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg || 75);
  const [targetCalories, setTargetCalories] = useState(profile.targetCalories || 1800);
  const [targetProtein, setTargetProtein] = useState(profile.targetProtein || 180);
  const [targetCarbs, setTargetCarbs] = useState(profile.targetCarbs || 150);
  const [targetFat, setTargetFat] = useState(profile.targetFat || 48);

  const handleSave = () => {
    onSave({
      ...profile,
      name,
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg),
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein),
      targetCarbs: Number(targetCarbs),
      targetFat: Number(targetFat),
    });
    onClose();
  };

  const weightToLose = Math.max(0, currentWeightKg - targetWeightKg);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                יעדי חיטוב ומאקרו
              </h2>
              <p className="text-xs text-slate-400">
                הגדרת קלוריות, חלבון ויעד ירידה במשקל
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

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              שם:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Weight Goals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                משקל נוכחי (ק״ג):
              </label>
              <input
                type="number"
                step="0.5"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                יעד משקל לחיטוב (ק״ג):
              </label>
              <input
                type="number"
                step="0.5"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {weightToLose > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <span>יעד ירידה עד לסיום החיטוב:</span>
              <span className="font-bold">{weightToLose.toFixed(1)} ק״ג</span>
            </div>
          )}

          {/* Daily Calorie Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>יעד קלורי יומי (קק״ל):</span>
            </label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          {/* Target Macros (Protein, Carbs, Fat) */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                חלבון (ג׳)
              </label>
              <input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-emerald-300 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                פחמימה (ג׳)
              </label>
              <input
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-amber-300 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                שומן (ג׳)
              </label>
              <input
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-rose-300 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>שמור יעדים</span>
          </button>
        </div>
      </div>
    </div>
  );
};

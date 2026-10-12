import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Check, UtensilsCrossed } from 'lucide-react';
import { Meal, FoodItem, FoodCategory } from '../types/nutrition';

interface EditMealModalProps {
  isOpen: boolean;
  meal: Meal | null;
  onClose: () => void;
  onSave: (updatedMeal: Meal) => void;
}

export const EditMealModal: React.FC<EditMealModalProps> = ({
  isOpen,
  meal,
  onClose,
  onSave,
}) => {
  if (!isOpen || !meal) return null;

  const [name, setName] = useState(meal.name);
  const [scheduledTime, setScheduledTime] = useState(meal.scheduledTime);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState(meal.reminderOffsetMinutes || 10);
  const [notes, setNotes] = useState(meal.notes || '');
  const [items, setItems] = useState<FoodItem[]>(meal.items);

  const calculatedCals = items.reduce((s, i) => s + (Number(i.calories) || 0), 0);
  const calculatedProt = items.reduce((s, i) => s + (Number(i.protein) || 0), 0);
  const calculatedCarb = items.reduce((s, i) => s + (Number(i.carbs) || 0), 0);
  const calculatedFat = items.reduce((s, i) => s + (Number(i.fat) || 0), 0);

  const [isCustomTotals, setIsCustomTotals] = useState<boolean>(!!meal.customTotals);
  const [customCals, setCustomCals] = useState<number>(meal.customTotals?.calories ?? calculatedCals);
  const [customProt, setCustomProt] = useState<number>(meal.customTotals?.protein ?? calculatedProt);
  const [customCarb, setCustomCarb] = useState<number>(meal.customTotals?.carbs ?? calculatedCarb);
  const [customFat, setCustomFat] = useState<number>(meal.customTotals?.fat ?? calculatedFat);

  // New item inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(100);
  const [newItemUnit, setNewItemUnit] = useState('גרם');
  const [newItemCalories, setNewItemCalories] = useState<number>(150);
  const [newItemProtein, setNewItemProtein] = useState<number>(20);
  const [newItemCarbs, setNewItemCarbs] = useState<number>(10);
  const [newItemFat, setNewItemFat] = useState<number>(3);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdateItem = (index: number, updates: Partial<FoodItem>) => {
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, ...updates } : item));
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: FoodItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newItemName.trim(),
      amount: Number(newItemAmount) || 100,
      unit: newItemUnit,
      calories: Number(newItemCalories) || 0,
      protein: Number(newItemProtein) || 0,
      carbs: Number(newItemCarbs) || 0,
      fat: Number(newItemFat) || 0,
      category: 'protein',
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setShowAddForm(false);
  };

  const handleSave = () => {
    const updated: Meal = {
      ...meal,
      name,
      scheduledTime,
      reminderOffsetMinutes,
      notes,
      items,
      customTotals: isCustomTotals ? {
        calories: Number(customCals) || 0,
        protein: Number(customProt) || 0,
        carbs: Number(customCarb) || 0,
        fat: Number(customFat) || 0,
      } : undefined,
    };
    onSave(updated);
    onClose();
  };

  const effectiveCals = isCustomTotals ? customCals : calculatedCals;
  const effectiveProt = isCustomTotals ? customProt : calculatedProt;
  const effectiveCarb = isCustomTotals ? customCarb : calculatedCarb;
  const effectiveFat = isCustomTotals ? customFat : calculatedFat;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                עריכת ארוחה ומאכלים
              </h2>
              <p className="text-xs text-slate-400">
                שינוי שעת הארוחה, כמויות וערכים תזונתיים
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
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Meal Name & Scheduled Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם הארוחה:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>שעת הארוחה:</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Food Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">
                מאכלים בארוחה זו ({items.length}):
              </label>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף מאכל</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, { name: e.target.value })}
                      placeholder="שם המאכל"
                      className="bg-transparent font-medium text-xs sm:text-sm text-white focus:outline-none focus:border-b border-emerald-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      title="הסר מאכל"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">כמות</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleUpdateItem(idx, { amount: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">יחידה</span>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block">חלבון</span>
                      <input
                        type="number"
                        value={item.protein}
                        onChange={(e) => handleUpdateItem(idx, { protein: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-emerald-300 text-center font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400 block">פחמימה</span>
                      <input
                        type="number"
                        value={item.carbs}
                        onChange={(e) => handleUpdateItem(idx, { carbs: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-amber-300 text-center font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-400 block">קלוריות</span>
                      <input
                        type="number"
                        value={item.calories}
                        onChange={(e) => handleUpdateItem(idx, { calories: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline add form */}
            {showAddForm && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">
                  הוספת מאכל חדש:
                </span>
                <input
                  type="text"
                  placeholder="שם המאכל (למשל: חזה עוף / טונה)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">כמות</span>
                    <input
                      type="number"
                      value={newItemAmount}
                      onChange={(e) => setNewItemAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">יחידה</span>
                    <input
                      type="text"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block">חלבון (ג׳)</span>
                    <input
                      type="number"
                      value={newItemProtein}
                      onChange={(e) => setNewItemProtein(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-emerald-300 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 block">פחמימה (ג׳)</span>
                    <input
                      type="number"
                      value={newItemCarbs}
                      onChange={(e) => setNewItemCarbs(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-amber-300 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 block">קלוריות</span>
                    <input
                      type="number"
                      value={newItemCalories}
                      onChange={(e) => setNewItemCalories(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-white text-center"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-400 px-2 py-1 cursor-pointer"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewItem}
                    className="text-xs font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg cursor-pointer"
                  >
                    הוסף למאכלים
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Meal Macro / Calorie Editing Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  ערך קלורי ומאקרו כולל לארוחה זו
                </span>
                <span className="text-[11px] text-slate-400">
                  באפשרותך לקבוע ערכים ישירות או לחשב אוטומטית מהמאכלים
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomTotals(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !isCustomTotals
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  אוטומטי
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomTotals(true);
                    setCustomCals(customCals || calculatedCals);
                    setCustomProt(customProt || calculatedProt);
                    setCustomCarb(customCarb || calculatedCarb);
                    setCustomFat(customFat || calculatedFat);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCustomTotals
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  הגדרה ידנית
                </button>
              </div>
            </div>

            {isCustomTotals ? (
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <span className="text-[11px] text-amber-400 block mb-1 font-bold text-center">
                    קלוריות (קק״ל)
                  </span>
                  <input
                    type="number"
                    value={customCals}
                    onChange={(e) => setCustomCals(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-2 py-1.5 text-sm text-center font-bold font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-emerald-400 block mb-1 font-bold text-center">
                    חלבון (ג׳)
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={customProt}
                    onChange={(e) => setCustomProt(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-2 py-1.5 text-sm text-center font-bold font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-amber-300 block mb-1 font-bold text-center">
                    פחמימה (ג׳)
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={customCarb}
                    onChange={(e) => setCustomCarb(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-sm text-center font-bold font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-rose-300 block mb-1 font-bold text-center">
                    שומן (ג׳)
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-sm text-center font-bold font-mono text-rose-300 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                <span>מחושב מ-{items.length} מאכלים:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{calculatedProt}ג׳ חלבון</span>
                  <span>•</span>
                  <span className="text-amber-400">{calculatedCarb}ג׳ פחמ׳</span>
                  <span>•</span>
                  <span className="text-rose-400">{calculatedFat}ג׳ שומן</span>
                  <span>•</span>
                  <span className="text-white font-bold">{calculatedCals} קק״ל</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              הערה / הנחיית חיטוב (אופציונלי):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="לדוגמה: לשתות 2 כוסות מים, 60 דק׳ לפני אימון"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Meal summary totals */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">סה״כ בתוקף לארוחה:</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">{effectiveProt}ג׳ חלבון</span>
              <span className="text-amber-400">{effectiveCarb}ג׳ פחמ׳</span>
              <span className="text-rose-400">{effectiveFat}ג׳ שומן</span>
              <span className="text-white font-bold">{effectiveCals} קק״ל</span>
              {isCustomTotals && (
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  הגדרה ידנית
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 cursor-pointer"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>שמור שינויים</span>
          </button>
        </div>
      </div>
    </div>
  );
};

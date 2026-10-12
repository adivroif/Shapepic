import React, { useState } from 'react';
import { X, Calendar, Download, CheckCircle, Clock, Smartphone } from 'lucide-react';
import { formatHebrewDate, addDaysToDateString, getTodayDateString } from '../utils/dateUtils';
import { downloadCalendarIcsMultiDay, DayEventsForIcs } from '../utils/notifications';
import { DailyPlan, Meal } from '../types/nutrition';
import { getOrCreateDailyPlan } from '../utils/storage';

interface IcsExportModalProps {
  isOpen: boolean;
  startDate: string;
  onClose: () => void;
}

export const IcsExportModal: React.FC<IcsExportModalProps> = ({
  isOpen,
  startDate,
  onClose,
}) => {
  if (!isOpen) return null;

  const [selectedDaysCount, setSelectedDaysCount] = useState<number>(7);
  const [customDays, setCustomDays] = useState<number>(7);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [currentStart, setCurrentStart] = useState<string>(startDate || getTodayDateString());
  const [isExported, setIsExported] = useState<boolean>(false);

  const daysCount = isCustom ? Math.max(1, customDays) : selectedDaysCount;
  const endDate = addDaysToDateString(currentStart, daysCount - 1);

  const startInfo = formatHebrewDate(currentStart);
  const endInfo = formatHebrewDate(endDate);

  // Quick preset buttons
  const presets = [
    { label: 'יום 1 (בלבד)', count: 1 },
    { label: '3 ימים', count: 3 },
    { label: '7 ימים (שבוע)', count: 7 },
    { label: '14 יום (שבועיים)', count: 14 },
    { label: '30 יום (חודש)', count: 30 },
  ];

  const handleExport = () => {
    // Gather days data
    const daysData: DayEventsForIcs[] = [];
    let totalMealsCount = 0;

    for (let i = 0; i < daysCount; i++) {
      const dStr = addDaysToDateString(currentStart, i);
      const plan = getOrCreateDailyPlan(dStr);
      daysData.push({
        dateStr: dStr,
        meals: plan.meals,
      });
      totalMealsCount += plan.meals.length;
    }

    downloadCalendarIcsMultiDay(
      daysData,
      `ארוחות חיטוב (${daysCount} ימים) - ${currentStart}`
    );

    setIsExported(true);
    setTimeout(() => setIsExported(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                ייצוא ארוחות ליומן הטלפון (.ics)
              </h2>
              <p className="text-xs text-slate-400">
                בחר את כמות הימים שתרצה לסנכרן עם שעון מעורר מובנה
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
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              תאריך התחלה לסנכרון:
            </label>
            <input
              type="date"
              value={currentStart}
              onChange={(e) => setCurrentStart(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              כמות ימים לייצוא:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => {
                const isActive = !isCustom && selectedDaysCount === p.count;
                return (
                  <button
                    key={p.count}
                    onClick={() => {
                      setSelectedDaysCount(p.count);
                      setIsCustom(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}

              <button
                onClick={() => setIsCustom(true)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                  isCustom
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                מותאם אישית...
              </button>
            </div>
          </div>

          {/* Custom Days Input */}
          {isCustom && (
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                הזן מספר ימים מותאם:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-mono text-cyan-400 text-center focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400">ימים</span>
              </div>
            </div>
          )}

          {/* Export Range Summary Card */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>טווח תאריכים:</span>
              <span className="font-bold text-white">
                {startInfo.shortDate} עד {endInfo.shortDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>סה״כ ימים שייוצאו:</span>
              <span className="font-bold text-cyan-400">{daysCount} ימים</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-cyan-500/20 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>שעון מעורר מובנה:</span>
              </span>
              <span>10 דקות לפני כל ארוחה</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">
                איך להפעיל בטלפון?
              </span>
              <span>
                לאחר ההורדה, לחץ על הקובץ והטלפון יפתח אותו ישירות ביומן של Apple או Google. לחץ ״הוסף הכל ליומן״ והשעונים המעוררים יופעלו אוטומטית!
              </span>
            </div>
          </div>

          {isExported && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>הקובץ נוצר והורד למכשירך בהצלחה!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 cursor-pointer"
          >
            סגור
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>הורד קובץ יומן ({daysCount} ימים)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

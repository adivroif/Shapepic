import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PREBUILT_CUTTING_PLANS, PrebuiltPlan } from '../data/defaultTemplates';
import { Meal, ParsedMenuResult, ParsedDay, ParsedDayMeal, FoodItem } from '../types/nutrition';
import { cloneMeals } from '../utils/storage';
import { getTodayDateString, addDaysToDateString, formatHebrewDate } from '../utils/dateUtils';

export interface PlanToApply {
  date: string;
  meals: Meal[];
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

interface ImportMenuModalProps {
  isOpen: boolean;
  currentDate: string;
  onClose: () => void;
  onApplyPlans: (plans: PlanToApply[]) => void;
}

export const ImportMenuModal: React.FC<ImportMenuModalProps> = ({
  isOpen,
  currentDate,
  onClose,
  onApplyPlans,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'templates'>('paste');
  const [startDate, setStartDate] = useState<string>(currentDate || getTodayDateString());
  const [applyScope, setApplyScope] = useState<'selected_day' | 'week_7_days' | 'two_weeks' | 'month'>('week_7_days');
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedMenuResult | null>(null);
  const [selectedPreviewDayIdx, setSelectedPreviewDayIdx] = useState<number>(0);

  if (!isOpen) return null;

  // Hebrew Day name mapping
  const HEBREW_DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];

  // Smart heuristic parser capable of splitting days
  const fallbackParseText = (text: string): ParsedMenuResult => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const dayRegex = /(יום\s+(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)|ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\s*[:\-–]/i;
    const hasMultipleDays = lines.filter(l => dayRegex.test(l)).length >= 2;

    const defaultTimes = ['08:00', '11:30', '14:00', '17:30', '20:30', '22:30'];

    if (hasMultipleDays) {
      // Parse by days
      const days: ParsedDay[] = [];
      let currentDay: ParsedDay | null = null;
      let currentMeal: ParsedDayMeal | null = null;
      let timeIndex = 0;

      for (const line of lines) {
        if (dayRegex.test(line)) {
          if (currentMeal && currentDay) {
            currentDay.meals.push(currentMeal);
            currentMeal = null;
          }
          if (currentDay && currentDay.meals.length > 0) {
            days.push(currentDay);
          }

          const dayClean = line.replace(/[:\-–].*/, '').trim();
          currentDay = {
            dayName: dayClean.includes('יום') ? dayClean : `יום ${dayClean}`,
            meals: [],
          };
          timeIndex = 0;
          continue;
        }

        const mealMatch = line.match(/(ארוחה\s*\d*|בוקר|צהריים|ערב|ביניים|לילה|קדם אימון)/i);
        const timeMatch = line.match(/(\d{1,2}:\d{2})/);

        if (mealMatch || line.includes(':')) {
          if (currentMeal && currentDay) {
            currentDay.meals.push(currentMeal);
          }
          const time = timeMatch ? timeMatch[1].padStart(5, '0') : (defaultTimes[timeIndex++] || '12:00');
          currentMeal = {
            name: line.replace(/[:\-–]/g, '').trim() || `ארוחה ${(currentDay?.meals.length || 0) + 1}`,
            scheduledTime: time,
            items: [],
          };
        } else if (currentMeal) {
          const amountMatch = line.match(/(\d+)\s*(גרם|גר׳|ג׳|יח׳|כפות|כפיות|פרוסות|קופסה|סקופ)/);
          const amount = amountMatch ? parseInt(amountMatch[1], 10) : 100;
          const unit = amountMatch ? amountMatch[2] : 'גרם';

          currentMeal.items.push({
            name: line.replace(/^[•\-\*]\s*/, ''),
            amount,
            unit,
            calories: 130,
            protein: 16,
            carbs: 10,
            fat: 3,
            category: 'protein',
          });
        }
      }

      if (currentMeal && currentDay) {
        currentDay.meals.push(currentMeal);
      }
      if (currentDay && currentDay.meals.length > 0) {
        days.push(currentDay);
      }

      return {
        isWeekly: true,
        title: 'תפריט חיטוב שבועי מחולק לפי ימים',
        summary: `התפריט זוהה כתפריט שבועי עם ${days.length} ימים שונים.`,
        estimatedTotals: { calories: 1800, protein: 180, carbs: 150, fat: 50 },
        days,
      };
    }

    // Single Day Parsing
    const meals: ParsedDayMeal[] = [];
    let currentMeal: ParsedDayMeal | null = null;
    let timeIndex = 0;

    for (const line of lines) {
      const mealMatch = line.match(/(ארוחה\s*\d*|בוקר|צהריים|ערב|ביניים|לילה|קדם אימון|פוסט אימון)/i);
      const timeMatch = line.match(/(\d{1,2}:\d{2})/);

      if (mealMatch || line.includes(':')) {
        if (currentMeal && currentMeal.items.length > 0) {
          meals.push(currentMeal);
        }
        const time = timeMatch ? timeMatch[1].padStart(5, '0') : (defaultTimes[timeIndex++] || '12:00');
        const name = line.replace(/[:\-–]/g, '').trim();
        currentMeal = {
          name: name || `ארוחה ${meals.length + 1}`,
          scheduledTime: time,
          reminderOffsetMinutes: 10,
          items: [],
        };
      } else {
        if (!currentMeal) {
          currentMeal = {
            name: `ארוחה 1`,
            scheduledTime: defaultTimes[timeIndex++] || '08:00',
            reminderOffsetMinutes: 10,
            items: [],
          };
        }
        const amountMatch = line.match(/(\d+)\s*(גרם|גר׳|ג׳|יח׳|כפות|כפיות|פרוסות|קופסה|סקופ)/);
        const amount = amountMatch ? parseInt(amountMatch[1], 10) : 100;
        const unit = amountMatch ? amountMatch[2] : 'גרם';

        currentMeal.items.push({
          name: line.replace(/^[•\-\*]\s*/, ''),
          amount,
          unit,
          calories: 120,
          protein: 15,
          carbs: 10,
          fat: 3,
          category: 'protein',
        });
      }
    }

    if (currentMeal && currentMeal.items.length > 0) {
      meals.push(currentMeal);
    }

    if (meals.length === 0) {
      meals.push({
        name: 'ארוחת בוקר',
        scheduledTime: '08:00',
        items: [{ name: text.slice(0, 50), amount: 100, unit: 'גרם', calories: 200, protein: 20, carbs: 15, fat: 5, category: 'protein' }]
      });
    }

    const totalCals = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0), 0);
    const totalProt = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0), 0);
    const totalCarb = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0), 0);

    return {
      isWeekly: false,
      title: 'תפריט חיטוב מותאם אישית',
      summary: 'התפריט שלך פוענח בהצלחה ומחולק לשעות מסודרות.',
      estimatedTotals: {
        calories: totalCals,
        protein: totalProt,
        carbs: totalCarb,
        fat: totalFat,
      },
      meals,
    };
  };

  const handleAiParse = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('נא להדביק את טקסט התפריט כדי שנוכל לפענח אותו');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/parse-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuText: pastedText, startDate }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setParsedPreview(json.data);
      } else {
        const fallback = fallbackParseText(pastedText);
        setParsedPreview(fallback);
      }
    } catch (err: any) {
      console.warn('Network error calling AI, using local smart parser:', err);
      const fallback = fallbackParseText(pastedText);
      setParsedPreview(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Build final PlanToApply array to assign each day its own date
  const handleConfirmApply = () => {
    if (!parsedPreview) return;

    const plansToApply: PlanToApply[] = [];

    // Helper to format raw items into Meal objects
    const formatMeals = (dayMeals: ParsedDayMeal[]): Meal[] => {
      return dayMeals.map((m, idx) => ({
        id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${idx}`,
        name: m.name,
        scheduledTime: m.scheduledTime || '08:00',
        reminderOffsetMinutes: m.reminderOffsetMinutes || 10,
        isCompleted: false,
        notes: m.notes,
        items: m.items.map((i, iIdx) => ({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${idx}_${iIdx}`,
          name: i.name,
          amount: i.amount || 100,
          unit: i.unit || 'גרם',
          calories: i.calories || 0,
          protein: i.protein || 0,
          carbs: i.carbs || 0,
          fat: i.fat || 0,
          category: i.category || 'protein',
        })),
      }));
    };

    // Case 1: Parsed multi-day weekly menu
    if (parsedPreview.days && parsedPreview.days.length > 0) {
      parsedPreview.days.forEach((dayObj, index) => {
        const dateForDay = addDaysToDateString(startDate, index);
        const dayMeals = formatMeals(dayObj.meals);
        const dayCals = dayMeals.reduce((s, m) => s + m.items.reduce((is, i) => is + i.calories, 0), 0);
        const dayProt = dayMeals.reduce((s, m) => s + m.items.reduce((is, i) => is + i.protein, 0), 0);

        plansToApply.push({
          date: dateForDay,
          meals: dayMeals,
          targetCalories: dayCals || parsedPreview.estimatedTotals.calories,
          targetProtein: dayProt || parsedPreview.estimatedTotals.protein,
          targetCarbs: parsedPreview.estimatedTotals.carbs,
          targetFat: parsedPreview.estimatedTotals.fat,
        });
      });
    } else if (parsedPreview.meals && parsedPreview.meals.length > 0) {
      // Case 2: Single-day menu, apply according to scope
      const daysCountMap = {
        selected_day: 1,
        week_7_days: 7,
        two_weeks: 14,
        month: 30,
      };
      const daysCount = daysCountMap[applyScope] || 7;

      for (let i = 0; i < daysCount; i++) {
        const targetDate = addDaysToDateString(startDate, i);
        // Deep clone meals for each distinct day
        const dayMeals = formatMeals(parsedPreview.meals);

        plansToApply.push({
          date: targetDate,
          meals: dayMeals,
          targetCalories: parsedPreview.estimatedTotals.calories,
          targetProtein: parsedPreview.estimatedTotals.protein,
          targetCarbs: parsedPreview.estimatedTotals.carbs,
          targetFat: parsedPreview.estimatedTotals.fat,
        });
      }
    }

    onApplyPlans(plansToApply);
    onClose();
  };

  const handleSelectTemplate = (template: PrebuiltPlan) => {
    const daysCountMap = {
      selected_day: 1,
      week_7_days: 7,
      two_weeks: 14,
      month: 30,
    };
    const daysCount = daysCountMap[applyScope] || 7;
    const plansToApply: PlanToApply[] = [];

    for (let i = 0; i < daysCount; i++) {
      const targetDate = addDaysToDateString(startDate, i);
      const cloned = cloneMeals(template.meals);
      plansToApply.push({
        date: targetDate,
        meals: cloned,
        targetCalories: template.targetCalories,
        targetProtein: template.targetProtein,
        targetCarbs: template.targetCarbs,
        targetFat: template.targetFat,
      });
    }

    onApplyPlans(plansToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                הזנת תפריט שבועי ויומי
              </h2>
              <p className="text-xs text-slate-400">
                הזן תפריט שבועי והמערכת תשבץ כל יום עם תאריך וסדר ארוחות משלו
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

        {/* Start Date & Distribution Options Strip */}
        <div className="bg-slate-950/80 border-b border-slate-800 p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300">תאריך התחלה:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-300">שכפול לוח:</span>
            <select
              value={applyScope}
              onChange={(e) => setApplyScope(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="week_7_days">שבוע שלם (7 ימים עוקבים)</option>
              <option value="two_weeks">שבועיים (14 ימים)</option>
              <option value="month">חודש מלא (30 ימים)</option>
              <option value="selected_day">יום נבחר בלבד</option>
            </select>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>הדבקת תפריט שבועי / יומי (AI)</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>תפריטי חיטוב מוכנים</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {activeTab === 'paste' && (
            <div>
              {!parsedPreview ? (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      הדבק כאן תפריט שבועי (מחולק לפי ימים או כללי לכל השבוע):
                    </label>
                  </div>

                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`הדבק תפריט שבועי, לדוגמה:
יום ראשון:
08:00 - 3 ביצים, 2 פרוסות לחם מלא, חצי אבוקדו וסלט
11:30 - יוגורט פרו 20 גרם חלבון + תפוח + 10 שקדים
14:00 - 200 גרם חזה עוף צלוי, 150 גרם אורז בסמטי, שעועית ירוקה
17:30 - סקופ חלבון + בננה
20:30 - קופסת טונה במים, 2 פרוסות לחם קל, כף טחינה וסלט

יום שני:
08:00 - שיבולת שועל עם סקופ חלבון ופירות יער
14:00 - פילה דג דניס בתנור, בטטה אפויה וברוקולי
...`}
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono resize-none"
                  />

                  {errorMessage && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setPastedText(`יום ראשון:
08:00 - 3 ביצים (1 שלמה + 2 חלבונים), 2 פרוסות לחם מלא, חצי אבוקדו וירקות
11:30 - יוגורט פרו 20 גרם חלבון, תפוח ירוק, 12 שקדים
14:00 - 200 גרם חזה עוף צלוי, 150 גרם אורז בסמטי, שעועית ירוקה
17:30 - סקופ חלבון מי גבינה + בננה בינונית + 2 פריכיות
20:30 - קופסת טונה במים, 100 גרם גבינה לבנה 5%, כף טחינה גולמית וסלט

יום שני:
08:30 - שיבולת שועל 40 גרם מבושלת עם סקופ חלבון, כפית חמאת בוטנים ופירות יער
11:30 - גביע קוטג׳ 5% עם 2 פריכיות אורז ומלפפון
14:00 - 220 גרם פילה דג דניס אפוי, 180 גרם בטטה בתנור וסלט ירוק
17:30 - שייק חלבון ותמר מג׳הול
20:30 - חביתת 3 ביצים, חצי קופסת טונה, לחם שיפון וסלט

יום שלישי:
08:00 - 3 ביצים קשות, 2 פרוסות לחם קל, 40 גרם אבוקדו
11:30 - יוגורט יווני פרו 20g חלבון + 10 אגוזי מלך
14:00 - 200 גרם סינטה בקר רזה צרובה, 150 גרם קינואה וירקות מוקפצים
17:30 - סקופ חלבון + תפוח עץ
20:30 - פילה סלמון 150 גרם, שעועית ירוקה וטחינה`)}
                      className="text-xs text-slate-400 hover:text-emerald-400 underline cursor-pointer"
                    >
                      הזן דוגמה שבועית מוכנה
                    </button>

                    <button
                      onClick={handleAiParse}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>מפענח ומסדר לפי ימים...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>פענח עם AI ושבץ בלוח</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Parsed Preview with Day breakdown */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>{parsedPreview.title}</span>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        {parsedPreview.days && parsedPreview.days.length > 0
                          ? `${parsedPreview.days.length} ימים בתפריט`
                          : `ישובץ ל-${applyScope === 'week_7_days' ? '7 ימים' : applyScope === 'two_weeks' ? '14 ימים' : applyScope === 'month' ? '30 ימים' : 'יום 1'}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {parsedPreview.summary}
                    </p>
                  </div>

                  {/* Multi-Day Navigation Tabs if multiple days detected */}
                  {parsedPreview.days && parsedPreview.days.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-300 block mb-2">
                        בחר יום לתצוגה מקדימה של הארוחות והתאריך:
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                        {parsedPreview.days.map((dayItem, idx) => {
                          const targetDate = addDaysToDateString(startDate, idx);
                          const { shortDate } = formatHebrewDate(targetDate);
                          const isSelected = selectedPreviewDayIdx === idx;

                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedPreviewDayIdx(idx)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer text-right ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div>{dayItem.dayName}</div>
                              <div className="text-[10px] opacity-80">{shortDate}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Display Selected Day Meals */}
                      {(() => {
                        const dayItem = parsedPreview.days[selectedPreviewDayIdx];
                        const targetDate = addDaysToDateString(startDate, selectedPreviewDayIdx);
                        const { full: dateFull } = formatHebrewDate(targetDate);

                        return (
                          <div className="mt-2 space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                              <span className="text-emerald-400">{dayItem.dayName} - {dateFull}</span>
                              <span className="text-slate-400">{dayItem.meals.length} ארוחות</span>
                            </div>
                            {dayItem.meals.map((m, mIdx) => (
                              <div key={mIdx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                                <div className="flex items-center justify-between font-bold text-white mb-0.5">
                                  <span>{m.name}</span>
                                  <span className="font-mono text-emerald-400">{m.scheduledTime}</span>
                                </div>
                                <div className="text-slate-400">
                                  {m.items.map(i => `${i.name} (${i.amount} ${i.unit})`).join(' • ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Single Day Plan Preview (if not multi-day) */}
                  {(!parsedPreview.days || parsedPreview.days.length === 0) && parsedPreview.meals && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>סדר הארוחות לשכפול בכל יום ({parsedPreview.meals.length} ארוחות):</span>
                        <span className="text-emerald-400">
                          מתאריך {formatHebrewDate(startDate).shortDate}
                        </span>
                      </div>
                      {parsedPreview.meals.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                            <span>{m.name}</span>
                            <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {m.scheduledTime}
                            </span>
                          </div>
                          <div className="text-slate-400">
                            {m.items.map(i => `${i.name} (${i.amount} ${i.unit})`).join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Confirmation actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setParsedPreview(null)}
                      className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 cursor-pointer"
                    >
                      חזור לעריכת הטקסט
                    </button>
                    <button
                      onClick={handleConfirmApply}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 cursor-pointer"
                    >
                      שבץ בלוח לכל הימים עכשיו
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                בחר אחד מתפריטי החיטוב. התפריט ישובץ לכל יום עם תאריך משלו החל מתאריך ההתחלה שנבחר:
              </p>
              {PREBUILT_CUTTING_PLANS.map((template) => (
                <div
                  key={template.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-bold text-white">{template.targetCalories} קק״ל</span>
                        <span className="text-emerald-400 font-semibold">{template.targetProtein}ג׳ חלבון</span>
                        <span className="text-amber-400">{template.targetCarbs}ג׳ פחמ׳</span>
                        <span className="text-rose-400">{template.targetFat}ג׳ שומן</span>
                        <span className="text-slate-500">• {template.meals.length} ארוחות</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-200 font-bold text-xs transition-all shrink-0 cursor-pointer"
                    >
                      שבץ בלוח השבועי
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

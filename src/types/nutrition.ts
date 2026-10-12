export type FoodCategory = 'protein' | 'carbs' | 'fat' | 'veggies' | 'other';

export interface FoodItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: FoodCategory;
}

export interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  scheduledTime: string; // "HH:MM" e.g. "08:00"
  reminderOffsetMinutes: number; // e.g. 10
  items: FoodItem[];
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  customTotals?: MealTotals;
}

export function getMealTotals(meal: Meal): MealTotals {
  if (meal.customTotals) {
    return meal.customTotals;
  }
  return {
    calories: meal.items.reduce((s, i) => s + (Number(i.calories) || 0), 0),
    protein: meal.items.reduce((s, i) => s + (Number(i.protein) || 0), 0),
    carbs: meal.items.reduce((s, i) => s + (Number(i.carbs) || 0), 0),
    fat: meal.items.reduce((s, i) => s + (Number(i.fat) || 0), 0),
  };
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: Meal[];
  waterIntakeMl: number;
  targetWaterMl: number;
  weightLogKg?: number;
}

export interface CuttingProfile {
  name: string;
  currentWeightKg: number;
  targetWeightKg: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  reminderMinutesBefore: number;
  soundEnabled: boolean;
  whatsappPhone?: string;
  callmebotApiKey?: string;
  autoOpenWhatsApp?: boolean;
  autoNotifications: boolean;
}

export interface SwapOption {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
}

export interface ParsedDayMeal {
  name: string;
  scheduledTime: string;
  reminderOffsetMinutes?: number;
  items: Omit<FoodItem, 'id'>[];
  notes?: string;
}

export interface ParsedDay {
  dayName: string; // e.g. "יום ראשון"
  dayIndex?: number; // 0 for Sunday
  meals: ParsedDayMeal[];
}

export interface ParsedMenuResult {
  isWeekly?: boolean;
  title: string;
  summary: string;
  estimatedTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  days?: ParsedDay[];
  meals?: ParsedDayMeal[];
}

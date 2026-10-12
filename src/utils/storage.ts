import { DailyPlan, CuttingProfile, Meal } from '../types/nutrition';
import { PREBUILT_CUTTING_PLANS } from '../data/defaultTemplates';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEYS = {
  DAILY_PLANS: 'shapepeak_daily_plans_v1',
  PROFILE: 'shapepeak_cutting_profile_v1',
  ACTIVE_TEMPLATE_ID: 'shapepeak_active_template_v1',
  NOTIFIED_MEALS: 'shapepeak_notified_meals_v1',
};

export const DEFAULT_PROFILE: CuttingProfile = {
  name: 'מתחטב',
  currentWeightKg: 82,
  targetWeightKg: 76,
  targetCalories: 1800,
  targetProtein: 180,
  targetCarbs: 155,
  targetFat: 48,
  reminderMinutesBefore: 10,
  soundEnabled: true,
  whatsappPhone: '',
  autoNotifications: true,
};

// Deep clone meals helper
export function cloneMeals(meals: Meal[]): Meal[] {
  return meals.map(m => ({
    ...m,
    id: 'meal_' + Math.random().toString(36).substring(2, 9),
    isCompleted: false,
    items: m.items.map(i => ({ ...i, id: 'item_' + Math.random().toString(36).substring(2, 9) }))
  }));
}

// Get user profile
export function loadProfile(): CuttingProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  return DEFAULT_PROFILE;
}

// Save profile
export function saveProfile(profile: CuttingProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

// Load all daily plans
export function loadAllDailyPlans(): Record<string, DailyPlan> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_PLANS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading daily plans:', e);
  }
  return {};
}

// Save all daily plans
export function saveAllDailyPlans(plans: Record<string, DailyPlan>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Error saving daily plans:', e);
  }
}

// Get or initialize a daily plan for a specific date
export function getOrCreateDailyPlan(dateStr: string): DailyPlan {
  const all = loadAllDailyPlans();
  if (all[dateStr]) {
    return all[dateStr];
  }

  // If previous day exists, we can base it on previous day's menu (resetting completion status)
  // or fall back to the classic default template
  const today = getTodayDateString();
  const defaultTemplate = PREBUILT_CUTTING_PLANS[0];

  // Try to find the most recent plan's meals structure
  const dates = Object.keys(all).sort().reverse();
  const recentMeals = dates.length > 0 && all[dates[0]].meals.length > 0
    ? cloneMeals(all[dates[0]].meals)
    : cloneMeals(defaultTemplate.meals);

  const profile = loadProfile();

  const newPlan: DailyPlan = {
    date: dateStr,
    targetCalories: profile.targetCalories,
    targetProtein: profile.targetProtein,
    targetCarbs: profile.targetCarbs,
    targetFat: profile.targetFat,
    meals: recentMeals,
    waterIntakeMl: 0,
    targetWaterMl: 3000,
  };

  all[dateStr] = newPlan;
  saveAllDailyPlans(all);
  return newPlan;
}

// Save single day plan
export function saveDailyPlan(plan: DailyPlan): void {
  const all = loadAllDailyPlans();
  all[plan.date] = plan;
  saveAllDailyPlans(all);
}

// Has notification been sent for meal today
export function hasNotifiedMeal(dateStr: string, mealId: string): boolean {
  try {
    const key = `${dateStr}_${mealId}`;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_MEALS);
    const set = raw ? JSON.parse(raw) : {};
    return !!set[key];
  } catch {
    return false;
  }
}

// Mark notification as sent for meal today
export function markNotifiedMeal(dateStr: string, mealId: string): void {
  try {
    const key = `${dateStr}_${mealId}`;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFIED_MEALS);
    const set = raw ? JSON.parse(raw) : {};
    set[key] = Date.now();
    localStorage.setItem(STORAGE_KEYS.NOTIFIED_MEALS, JSON.stringify(set));
  } catch (e) {
    console.error(e);
  }
}

export interface ServerSyncPayload {
  profile: CuttingProfile;
  dailyPlans: Record<string, DailyPlan>;
  lastUpdated: number;
}

// Fetch shared data from server across all devices
export async function fetchServerSyncData(): Promise<ServerSyncPayload | null> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.exists && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Could not fetch server sync data:', err);
  }
  return null;
}

// Push shared data to server so all other devices receive it
export async function pushServerSyncData(
  profile: CuttingProfile,
  dailyPlans: Record<string, DailyPlan>
): Promise<boolean> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        dailyPlans,
        lastUpdated: Date.now(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not push server sync data:', err);
    return false;
  }
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  loadProfile,
  saveProfile,
  getOrCreateDailyPlan,
  saveDailyPlan,
  loadAllDailyPlans,
  saveAllDailyPlans,
  hasNotifiedMeal,
  markNotifiedMeal,
  fetchServerSyncData,
  pushServerSyncData
} from './utils/storage';
import { getTodayDateString, getMinutesDifference } from './utils/dateUtils';
import {
  sendMealNotification,
  playMealNotificationSound,
  requestNotificationPermission,
  getMealWhatsAppShareUrl,
  sendAutomatedWhatsAppMessage
} from './utils/notifications';
import { DailyPlan, CuttingProfile, Meal, FoodItem, MealTotals } from './types/nutrition';
import { Header } from './components/Header';
import { DateBar } from './components/DateBar';
import { CuttingStatsBar } from './components/CuttingStatsBar';
import { NextMealBanner } from './components/NextMealBanner';
import { MealTimeline } from './components/MealTimeline';
import { ImportMenuModal, PlanToApply } from './components/ImportMenuModal';
import { EditMealModal } from './components/EditMealModal';
import { SwapFoodModal } from './components/SwapFoodModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { IcsExportModal } from './components/IcsExportModal';
import { QuickMacrosModal } from './components/QuickMacrosModal';
import { CloudSyncModal } from './components/CloudSyncModal';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [profile, setProfile] = useState<CuttingProfile>(() => loadProfile());
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(() => getOrCreateDailyPlan(getTodayDateString()));

  // Cloud Sync state across all devices
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [lastServerSyncTime, setLastServerSyncTime] = useState<Date | null>(null);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isIcsExportOpen, setIsIcsExportOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [quickMacrosMeal, setQuickMacrosMeal] = useState<Meal | null>(null);
  const [swapData, setSwapData] = useState<{ mealId: string; item: FoodItem } | null>(null);

  // Notification permission
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';
  });

  const todayStr = getTodayDateString();
  const isToday = currentDate === todayStr;

  // Initial cross-device sync from server on app load
  useEffect(() => {
    async function initSync() {
      try {
        const serverData = await fetchServerSyncData();
        if (serverData && serverData.dailyPlans && Object.keys(serverData.dailyPlans).length > 0) {
          // Server is the authoritative single source of truth for all devices
          const serverPlans = serverData.dailyPlans;
          saveAllDailyPlans(serverPlans);

          const planForDate = serverPlans[currentDate] || getOrCreateDailyPlan(currentDate);
          setDailyPlan(planForDate);

          if (serverData.profile) {
            setProfile(serverData.profile);
            saveProfile(serverData.profile);
          }
          setLastServerSyncTime(new Date(serverData.lastUpdated || Date.now()));
        } else {
          // If server is empty, push local master plan
          const localPlans = loadAllDailyPlans();
          const localProfile = loadProfile();
          await pushServerSyncData(localProfile, localPlans);
          setLastServerSyncTime(new Date());
        }
      } catch (err) {
        console.warn('Initial server sync error:', err);
      } finally {
        setIsInitialSyncDone(true);
      }
    }
    initSync();
  }, []);

  // Periodic poll & focus sync so any change on one device instantly updates all others
  useEffect(() => {
    const pollServer = async () => {
      try {
        const serverData = await fetchServerSyncData();
        if (serverData && serverData.dailyPlans && Object.keys(serverData.dailyPlans).length > 0) {
          saveAllDailyPlans(serverData.dailyPlans);
          if (serverData.dailyPlans[currentDate]) {
            setDailyPlan(serverData.dailyPlans[currentDate]);
          }
          if (serverData.profile) {
            setProfile(serverData.profile);
            saveProfile(serverData.profile);
          }
          if (serverData.lastUpdated) {
            setLastServerSyncTime(new Date(serverData.lastUpdated));
          }
        }
      } catch (e) {
        // silent background poll
      }
    };

    // Poll every 8 seconds
    const interval = setInterval(pollServer, 8000);

    // Refresh immediately when user returns to tab/phone screen
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        pollServer();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', pollServer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', pollServer);
    };
  }, [currentDate]);

  // Refresh plan when date changes
  useEffect(() => {
    const loaded = getOrCreateDailyPlan(currentDate);
    setDailyPlan(loaded);
  }, [currentDate]);

  // Auto-sync debounced changes to server so any other device gets updates
  useEffect(() => {
    if (!isInitialSyncDone) return;
    const timer = setTimeout(async () => {
      try {
        const allPlans = loadAllDailyPlans();
        await pushServerSyncData(profile, allPlans);
        setLastServerSyncTime(new Date());
      } catch (e) {
        console.warn('Auto-sync to server error:', e);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [dailyPlan, profile, isInitialSyncDone]);

  // Manual force sync handler
  const handleManualSync = async () => {
    const serverData = await fetchServerSyncData();
    if (serverData && serverData.dailyPlans) {
      saveAllDailyPlans(serverData.dailyPlans);
      if (serverData.dailyPlans[currentDate]) {
        setDailyPlan(serverData.dailyPlans[currentDate]);
      } else {
        const plan = getOrCreateDailyPlan(currentDate);
        setDailyPlan(plan);
      }
      if (serverData.profile) {
        setProfile(serverData.profile);
        saveProfile(serverData.profile);
      }
    } else {
      const allPlans = loadAllDailyPlans();
      await pushServerSyncData(profile, allPlans);
    }
    setLastServerSyncTime(new Date());
  };

  // Periodic meal reminder check (runs every 30 seconds)
  useEffect(() => {
    const checkMealReminders = () => {
      if (!isToday || !profile.autoNotifications) return;

      const currentPlan = getOrCreateDailyPlan(todayStr);
      currentPlan.meals.forEach((meal) => {
        if (meal.isCompleted) return;

        const diffMinutes = getMinutesDifference(meal.scheduledTime, todayStr);
        const lead = profile.reminderMinutesBefore ?? 10;

        // Trigger notification if within window (e.g. between 0 and lead minutes before scheduled time)
        if (diffMinutes <= lead && diffMinutes >= -15) {
          if (!hasNotifiedMeal(todayStr, meal.id)) {
            const waUrl = getMealWhatsAppShareUrl(meal, profile.whatsappPhone);

            // 1. Native Web Notification (tapping on phone opens WhatsApp directly!)
            if (notificationPermission === 'granted') {
              sendMealNotification(meal, false, waUrl);
            }
            if (profile.soundEnabled) {
              playMealNotificationSound();
            }

            // 2. Automated background WhatsApp sending or prompt
            if (profile.whatsappPhone) {
              if (profile.callmebotApiKey) {
                sendAutomatedWhatsAppMessage(meal, profile.whatsappPhone, profile.callmebotApiKey);
              } else if (profile.autoOpenWhatsApp) {
                window.open(waUrl, '_blank');
              }
            }

            markNotifiedMeal(todayStr, meal.id);
          }
        }
      });
    };

    // Run once on mount/date change and every 30 seconds
    checkMealReminders();
    const interval = setInterval(checkMealReminders, 30000);
    return () => clearInterval(interval);
  }, [isToday, todayStr, profile, notificationPermission]);

  // Helper to persist plan updates
  const updatePlan = useCallback((updater: (prev: DailyPlan) => DailyPlan) => {
    setDailyPlan(prev => {
      const next = updater(prev);
      saveDailyPlan(next);
      return next;
    });
  }, []);

  // Meal Completion Toggle
  const handleToggleComplete = (mealId: string) => {
    updatePlan(prev => ({
      ...prev,
      meals: prev.meals.map(m =>
        m.id === mealId
          ? { ...m, isCompleted: !m.isCompleted, completedAt: !m.isCompleted ? new Date().toISOString() : undefined }
          : m
      ),
    }));
  };

  // Postpone Meal by X minutes
  const handlePostponeMeal = (mealId: string, minutes: number) => {
    updatePlan(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        const [h, min] = m.scheduledTime.split(':').map(Number);
        let total = (h * 60 + min + minutes) % (24 * 60);
        const newH = String(Math.floor(total / 60)).padStart(2, '0');
        const newM = String(total % 60).padStart(2, '0');
        return { ...m, scheduledTime: `${newH}:${newM}` };
      }),
    }));
  };

  // Update Meal Time
  const handleUpdateTime = (mealId: string, newTime: string) => {
    updatePlan(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === mealId ? { ...m, scheduledTime: newTime } : m),
    }));
  };

  // Delete Meal
  const handleDeleteMeal = (mealId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק ארוחה זו מהתפריט להיום?')) {
      updatePlan(prev => ({
        ...prev,
        meals: prev.meals.filter(m => m.id !== mealId),
      }));
    }
  };

  // Add New Meal
  const handleAddNewMeal = () => {
    const newMeal: Meal = {
      id: `meal_${Date.now()}`,
      name: `ארוחה ${dailyPlan.meals.length + 1}`,
      scheduledTime: '16:00',
      reminderOffsetMinutes: 10,
      isCompleted: false,
      items: [
        { id: `item_${Date.now()}`, name: 'חזה עוף / טונה', amount: 150, unit: 'גרם', calories: 200, protein: 35, carbs: 0, fat: 3, category: 'protein' }
      ]
    };

    updatePlan(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
    }));

    setEditingMeal(newMeal);
  };

  // Save edited meal
  const handleSaveEditedMeal = (updatedMeal: Meal) => {
    updatePlan(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === updatedMeal.id ? updatedMeal : m),
    }));
  };

  // Apply swapped food item
  const handleApplySwap = (mealId: string, oldItemId: string, newFood: Partial<FoodItem>) => {
    updatePlan(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          items: m.items.map(item => item.id === oldItemId ? { ...item, ...newFood } : item)
        };
      })
    }));
  };

  // Apply imported/custom diet plans across days with individual dates
  const handleApplyImportedPlans = (plansToApply: PlanToApply[]) => {
    const all = loadAllDailyPlans();
    plansToApply.forEach(p => {
      const existing = all[p.date];
      all[p.date] = {
        date: p.date,
        targetCalories: p.targetCalories || profile.targetCalories,
        targetProtein: p.targetProtein || profile.targetProtein,
        targetCarbs: p.targetCarbs || profile.targetCarbs,
        targetFat: p.targetFat || profile.targetFat,
        meals: p.meals,
        waterIntakeMl: existing?.waterIntakeMl || 0,
        targetWaterMl: existing?.targetWaterMl || 3000,
      };
    });
    saveAllDailyPlans(all);

    // If currentDate was updated, set it in state
    if (all[currentDate]) {
      setDailyPlan(all[currentDate]);
    } else if (plansToApply.length > 0) {
      setCurrentDate(plansToApply[0].date);
      setDailyPlan(all[plansToApply[0].date]);
    }

    // Update user profile targets from first plan
    if (plansToApply.length > 0 && plansToApply[0].targetCalories) {
      const p0 = plansToApply[0];
      const updatedProfile: CuttingProfile = {
        ...profile,
        targetCalories: p0.targetCalories || profile.targetCalories,
        targetProtein: p0.targetProtein || profile.targetProtein,
        targetCarbs: p0.targetCarbs || profile.targetCarbs,
        targetFat: p0.targetFat || profile.targetFat,
      };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  // Update custom totals for a meal
  const handleSaveMealTotals = (mealId: string, totals: MealTotals | undefined) => {
    updatePlan(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === mealId ? { ...m, customTotals: totals } : m)
    }));
  };

  // Water intake
  const handleUpdateWater = (ml: number) => {
    updatePlan(prev => ({ ...prev, waterIntakeMl: ml }));
  };

  // Update profile
  const handleUpdateProfile = (updates: Partial<CuttingProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    saveProfile(updated);
  };

  const refreshNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Heebo',sans-serif]">
      {/* Top Navigation */}
      <Header
        profile={profile}
        notificationPermission={notificationPermission}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {/* Date Selector and Week Strip */}
        <DateBar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          dailyPlan={dailyPlan}
        />

        {/* Cutting Daily Macros & Deficit Bar */}
        <CuttingStatsBar
          plan={dailyPlan}
          onUpdateWater={handleUpdateWater}
        />

        {/* Live Next Meal Countdown Banner */}
        <NextMealBanner
          meals={dailyPlan.meals}
          dateStr={currentDate}
          isToday={isToday}
          onToggleComplete={handleToggleComplete}
          onPostponeMeal={handlePostponeMeal}
          whatsappPhone={profile.whatsappPhone}
        />

        {/* Chronological Meal Timeline & Cards */}
        <MealTimeline
          meals={dailyPlan.meals}
          dateStr={currentDate}
          isToday={isToday}
          onToggleComplete={handleToggleComplete}
          onEditMeal={(meal) => setEditingMeal(meal)}
          onDeleteMeal={handleDeleteMeal}
          onUpdateTime={handleUpdateTime}
          onOpenSwap={(mealId, item) => setSwapData({ mealId, item })}
          onAddNewMeal={handleAddNewMeal}
          onOpenExportIcs={() => setIsIcsExportOpen(true)}
          onOpenQuickMacros={(meal) => setQuickMacrosMeal(meal)}
          whatsappPhone={profile.whatsappPhone}
        />
      </main>

      {/* Modals */}
      <ImportMenuModal
        isOpen={isImportOpen}
        currentDate={currentDate}
        onClose={() => setIsImportOpen(false)}
        onApplyPlans={handleApplyImportedPlans}
      />

      <EditMealModal
        isOpen={!!editingMeal}
        meal={editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={handleSaveEditedMeal}
      />

      <QuickMacrosModal
        isOpen={!!quickMacrosMeal}
        meal={quickMacrosMeal}
        onClose={() => setQuickMacrosMeal(null)}
        onSaveTotals={handleSaveMealTotals}
      />

      <SwapFoodModal
        isOpen={!!swapData}
        mealId={swapData?.mealId || ''}
        foodItem={swapData?.item || null}
        onClose={() => setSwapData(null)}
        onApplySwap={handleApplySwap}
      />

      <NotificationSettingsModal
        isOpen={isNotificationsOpen}
        profile={profile}
        todayMeals={dailyPlan.meals}
        currentDate={currentDate}
        notificationPermission={notificationPermission}
        onClose={() => setIsNotificationsOpen(false)}
        onUpdateProfile={handleUpdateProfile}
        onRequestPermission={refreshNotificationPermission}
        onOpenExportIcs={() => setIsIcsExportOpen(true)}
      />

      <IcsExportModal
        isOpen={isIcsExportOpen}
        startDate={currentDate}
        onClose={() => setIsIcsExportOpen(false)}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onManualSync={handleManualSync}
        lastSyncTime={lastServerSyncTime}
        whatsappPhone={profile.whatsappPhone}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        profile={profile}
        onClose={() => setIsProfileOpen(false)}
        onSave={(updated) => {
          setProfile(updated);
          saveProfile(updated);
          // Sync with today's plan targets
          updatePlan(prev => ({
            ...prev,
            targetCalories: updated.targetCalories,
            targetProtein: updated.targetProtein,
            targetCarbs: updated.targetCarbs,
            targetFat: updated.targetFat,
          }));
        }}
      />
    </div>
  );
}

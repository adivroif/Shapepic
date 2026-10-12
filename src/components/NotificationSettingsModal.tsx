import React, { useState } from 'react';
import {
  X,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info
} from 'lucide-react';
import { CuttingProfile, Meal } from '../types/nutrition';
import {
  requestNotificationPermission,
  sendMealNotification,
  playMealNotificationSound,
  downloadCalendarIcs,
  sendAutomatedWhatsAppMessage,
  getMealWhatsAppShareUrl
} from '../utils/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  profile: CuttingProfile;
  todayMeals: Meal[];
  currentDate: string;
  notificationPermission: NotificationPermission;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<CuttingProfile>) => void;
  onRequestPermission: () => void;
  onOpenExportIcs: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  profile,
  todayMeals,
  currentDate,
  notificationPermission,
  onClose,
  onUpdateProfile,
  onRequestPermission,
  onOpenExportIcs,
}) => {
  if (!isOpen) return null;

  const [testSent, setTestSent] = useState(false);
  const [waTestStatus, setWaTestStatus] = useState<string | null>(null);

  const handleTestWhatsApp = async () => {
    if (!profile.whatsappPhone) {
      setWaTestStatus('נא להזין מספר טלפון תחילה');
      return;
    }
    const sampleMeal: Meal = todayMeals[0] || {
      id: 'test',
      name: 'ארוחת צהריים (בדיקה)',
      scheduledTime: '14:00',
      reminderOffsetMinutes: 10,
      isCompleted: false,
      items: [
        { id: '1', name: '200 גרם חזה עוף צלוי', amount: 200, unit: 'גרם', calories: 280, protein: 58, carbs: 0, fat: 4 },
        { id: '2', name: '150 גרם אורז בסמטי', amount: 150, unit: 'גרם', calories: 195, protein: 4, carbs: 43, fat: 0.5 },
      ]
    };

    setWaTestStatus('שולח...');
    if (profile.callmebotApiKey) {
      const res = await sendAutomatedWhatsAppMessage(sampleMeal, profile.whatsappPhone, profile.callmebotApiKey);
      if (res.success) {
        setWaTestStatus('הודעת WhatsApp נשלחה אוטומטית לטלפון בהצלחה!');
      } else {
        window.open(getMealWhatsAppShareUrl(sampleMeal, profile.whatsappPhone), '_blank');
        setWaTestStatus('נפתח קישור וואטסאפ עם ההודעה!');
      }
    } else {
      window.open(getMealWhatsAppShareUrl(sampleMeal, profile.whatsappPhone), '_blank');
      setWaTestStatus('נפתח קישור וואטסאפ מוכן לשליחה!');
    }
    setTimeout(() => setWaTestStatus(null), 5000);
  };

  const handleTestNotification = async () => {
    let perm = notificationPermission;
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
      onRequestPermission();
    }

    if (profile.soundEnabled) {
      playMealNotificationSound();
    }

    const sampleMeal: Meal = todayMeals[0] || {
      id: 'test',
      name: 'ארוחת צהריים (בדיקה)',
      scheduledTime: '14:00',
      reminderOffsetMinutes: 10,
      isCompleted: false,
      items: [
        { id: '1', name: '200 גרם חזה עוף', amount: 200, unit: 'גרם', calories: 280, protein: 58, carbs: 0, fat: 4 },
        { id: '2', name: '150 גרם אורז בסמטי', amount: 150, unit: 'גרם', calories: 195, protein: 4, carbs: 43, fat: 0.5 },
      ]
    };

    const sent = sendMealNotification(sampleMeal, true);
    if (sent) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                הגדרות תזכורות והתראות לטלפון
              </h2>
              <p className="text-xs text-slate-400">
                קבלת התראות בזמן הארוחה למניעת דילוגים בחיטוב
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
          {/* Main Push Notification Status & Activation */}
          <div className={`p-4 rounded-2xl border transition-all ${
            notificationPermission === 'granted'
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    התראות פוש בדפדפן / בטלפון
                  </span>
                  {notificationPermission === 'granted' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      מאושר ופעיל
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      דרוש אישור
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  הודעה תקפוץ ישירות במסך הטלפון עם שעת הארוחה, המאכלים וכמות החלבון.
                </p>
              </div>

              {notificationPermission !== 'granted' ? (
                <button
                  onClick={async () => {
                    await requestNotificationPermission();
                    onRequestPermission();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  הפעל התראות
                </button>
              ) : (
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-emerald-500/30 shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>בדוק התראה עכשיו</span>
                </button>
              )}
            </div>

            {testSent && (
              <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>הודעת בדיקה נשלחה לטלפון בהצלחה!</span>
              </div>
            )}
          </div>

          {/* Reminder Timing & Sound */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300">
              תזמון וצליל
            </h3>

            {/* Reminder Offset */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white block">
                  זמן התראה מקדים:
                </span>
                <span className="text-[11px] text-slate-400">
                  מתי להתריע לפני שעת הארוחה
                </span>
              </div>
              <select
                value={profile.reminderMinutesBefore}
                onChange={(e) => onUpdateProfile({ reminderMinutesBefore: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={15}>15 דקות לפני</option>
                <option value={10}>10 דקות לפני</option>
                <option value={5}>5 דקות לפני</option>
                <option value={0}>בדיוק בשעת הארוחה</option>
              </select>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                {profile.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <span className="text-xs font-medium text-white block">
                    צליל התראה
                  </span>
                  <span className="text-[11px] text-slate-400">
                    צליל נעים שמודיע שהגיע זמן הארוחה
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !profile.soundEnabled;
                  onUpdateProfile({ soundEnabled: next });
                  if (next) playMealNotificationSound();
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  profile.soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  profile.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* WhatsApp Reminders (10 minutes before) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    הודעות תזכורת ב-WhatsApp (10 דקות לפני הארוחה)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    קבלת הודעה מפורטת עם כל המאכלים, גרמים וחלבון ישירות לוואטסאפ
                  </span>
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                מספר הטלפון שלך לקבלת הודעות וואטסאפ:
              </label>
              <input
                type="tel"
                placeholder="לדוגמה: 0501234567 או 052-9876543"
                value={profile.whatsappPhone || ''}
                onChange={(e) => onUpdateProfile({ whatsappPhone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Auto Open WhatsApp Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-xs font-medium text-white block">
                  פתיחה מהירה בוואטסאפ בהתראת 10 דקות
                </span>
                <span className="text-[11px] text-slate-400">
                  בלחיצה על התראת הפוש, הוואטסאפ ייפתח ישירות עם ההודעה המוכנה
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateProfile({ autoOpenWhatsApp: !profile.autoOpenWhatsApp })}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  profile.autoOpenWhatsApp ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  profile.autoOpenWhatsApp ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Fully Automated Background WhatsApp (CallMeBot free API) */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">
                  רוצה שההודעה תישלח אלייך אוטומטית ברקע מבלי שתצטרך ללחוץ?
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                  חינם
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ניתן לחבר את בוט הוואטסאפ החינמי של CallMeBot:
                <br />
                1. שלח הודעת וואטסאפ עם הטקסט <code className="text-emerald-400 font-mono bg-slate-950 px-1 py-0.5 rounded">I allow callmebot to send me messages</code> למספר <a href="https://api.whatsapp.com/send?phone=34644442453&text=I%20allow%20callmebot%20to%20send%20me%20messages" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">הבוט ב-WhatsApp (לחץ כאן)</a>.
                <br />
                2. הבוט יחזיר לך קוד API אישי. הדבק אותו כאן למטה:
              </p>
              <div>
                <input
                  type="text"
                  placeholder="הדבק כאן את מפתח ה-API (לדוגמה: 123456)"
                  value={profile.callmebotApiKey || ''}
                  onChange={(e) => onUpdateProfile({ callmebotApiKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Test WhatsApp Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>בדוק שליחת וואטסאפ עכשיו</span>
              </button>

              {waTestStatus && (
                <span className="text-[11px] text-emerald-300 font-medium">
                  {waTestStatus}
                </span>
              )}
            </div>
          </div>

          {/* Phone Calendar Sync (.ics export) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">
                סנכרון מלא ליומן הטלפון (iPhone / Google Calendar)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              הורד קובץ יומן המוסיף את כל שעות הארוחות להיום עם שעון מעורר מובנה 10 דקות לפני כל ארוחה.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenExportIcs();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>פתח ייצוא ליומן (.ics) עם בחירת כמות ימים</span>
            </button>
          </div>

          {/* iPhone / Android PWA tip */}
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                טיפ לשימוש מושלם בנייד:
              </span>
              <span>
                לחץ בדפדפן הנייד על ״שתף״ (Share) ובחר ״הוסף למסך הבית״ (Add to Home Screen). האפליקציה תפעל כאפליקציה מלאה עם התראות שקטות וברורות!
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-all cursor-pointer"
          >
            סגור ואישור
          </button>
        </div>
      </div>
    </div>
  );
};

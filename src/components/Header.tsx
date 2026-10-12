import React from 'react';
import { Bell, Flame, Sparkles, User, CalendarDays, Cloud } from 'lucide-react';
import { CuttingProfile } from '../types/nutrition';

interface HeaderProps {
  profile: CuttingProfile;
  notificationPermission: NotificationPermission;
  onOpenNotifications: () => void;
  onOpenImport: () => void;
  onOpenProfile: () => void;
  onOpenCloudSync: () => void;
  isCloudSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  notificationPermission,
  onOpenNotifications,
  onOpenImport,
  onOpenProfile,
  onOpenCloudSync,
  isCloudSynced = true,
}) => {
  const isNotifActive = notificationPermission === 'granted' && profile.autoNotifications;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Cutting Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                שייפ-פיק
                <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  חיטוב & זמנים
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              מעקב ארוחות לפי שעות, עריכת תפריט ותזכורות לטלפון
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync Button */}
          <button
            onClick={onOpenCloudSync}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-800/80 border border-cyan-500/30 text-cyan-400 hover:bg-slate-800 hover:border-cyan-400 transition-all cursor-pointer"
            title="סנכרון ענן בין כל המכשירים"
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">סנכרון מכשירים</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          {/* Import Menu Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            title="הזנת תפריט שבנו לי"
          >
            <Sparkles className="w-4 h-4" />
            <span>הזנת תפריט</span>
          </button>

          {/* Notifications Status Button */}
          <button
            onClick={onOpenNotifications}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              isNotifActive
                ? 'bg-slate-800/80 border-emerald-500/50 text-emerald-400 hover:border-emerald-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title="הגדרות תזכורות והתראות לטלפון"
          >
            <Bell className="w-5 h-5" />
            {isNotifActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {!isNotifActive && notificationPermission !== 'granted' && (
              <span className="absolute -top-1 -right-1 px-1 text-[9px] font-bold bg-amber-500 text-slate-950 rounded-full">
                כבוי
              </span>
            )}
          </button>

          {/* User Profile / Targets Button */}
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
            title="יעדי חיטוב ומשקל"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { X, Cloud, Smartphone, Check, Copy, RefreshCw, MessageSquare, ShieldCheck } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualSync: () => Promise<void>;
  lastSyncTime: Date | null;
  whatsappPhone?: string;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onManualSync,
  lastSyncTime,
  whatsappPhone,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await onManualSync();
    setIsSyncing(false);
  };

  const shareText = `🥗 קישור לתפריט החיטוב המסונכרן שלי:\n${currentUrl}`;
  const cleanPhone = whatsappPhone ? whatsappPhone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}`
    : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                סנכרון ענן בין כל המכשירים
              </h2>
              <p className="text-xs text-slate-400">
                אותו תפריט, שעות וערכים בכל טלפון ומחשב
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
        <div className="p-4 sm:p-5 space-y-3.5 text-xs">
          {/* Active Status Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>הסנכרון פעיל ומחובר לשרת</span>
            </div>
            <p className="text-xs text-slate-300">
              כל שינוי בתפריט, בשעות הארוחה, במאכלים ובקלוריות נשמר אוטומטית בענן ומופיע בכל מכשיר שנכנס לאפליקציה זו.
            </p>
            {lastSyncTime && (
              <div className="text-[11px] text-emerald-400/80 pt-1">
                סנכרון אחרון: {lastSyncTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
          </div>

          {/* Device Link section */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>פתיחת התפריט במכשיר נוסף (טלפון / מחשב)</span>
            </div>
            <p className="text-slate-400">
              היכנס לקישור הזה מכל מכשיר והתפריט שלך יופיע במלואו באופן מיידי:
            </p>

            <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
              <span className="truncate flex-1">{currentUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'הועתק!' : 'העתק'}</span>
              </button>
            </div>

            {/* Direct WhatsApp Share button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 font-bold transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>שלח קישור ישיר ל-WhatsApp (לפתיחה בטלפון)</span>
            </a>
          </div>

          {/* Manual Force Sync Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isSyncing ? 'מסנכרן כעת...' : 'בצע סנכרון עכשיו'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

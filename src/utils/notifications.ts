import { Meal, getMealTotals } from '../types/nutrition';

// Play a pleasant chime tone using Web Audio API (works without external audio files)
export function playMealNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Melody: 3 pleasant ascending tones (E5, G5, C6)
    const notes = [
      { freq: 659.25, time: 0.0, dur: 0.25 },
      { freq: 783.99, time: 0.2, dur: 0.25 },
      { freq: 1046.50, time: 0.4, dur: 0.5 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.2, now + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

// Request Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

// Trigger native Web Notification with direct WhatsApp click action
export function sendMealNotification(meal: Meal, isTest = false, whatsappUrl?: string): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const itemsSummary = meal.items.map(i => `${i.name} (${i.amount} ${i.unit})`).join(', ');
  const totals = getMealTotals(meal);

  const title = isTest
    ? `🔔 בדיקת תזכורת חיטוב (10 דקות לפני): ${meal.name}`
    : `⏰ תזכורת 10 דקות לארוחה: ${meal.name} (${meal.scheduledTime})`;

  const body = `🍽️ בתפריט: ${itemsSummary}\n💪 ${totals.calories} קק״ל | ${totals.protein}ג׳ חלבון\nלחץ לפתיחה ישירה ב-WhatsApp!`;

  try {
    const notification = new Notification(title, {
      body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2310b981"/><text x="50" y="62" font-size="40" text-anchor="middle" fill="white">🥗</text></svg>',
      tag: `meal-${meal.id}-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      }
    };

    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
}

// Format the WhatsApp message text
export function formatWhatsAppMealMessage(meal: Meal): string {
  const itemsText = meal.items
    .map(i => `• ${i.name} (${i.amount} ${i.unit}) - ${i.protein}ג׳ חלבון`)
    .join('\n');

  const totals = getMealTotals(meal);

  return `🔔 *תזכורת חיטוב (10 דקות לפני)* 🥗
הגיע הזמן לאכול: *${meal.name}* (שעה: ${meal.scheduledTime})

🍽️ *מה בתפריט:*
${itemsText}

📊 *ערכים לארוחה זו:*
• קלוריות: ${totals.calories} קק״ל
• חלבון: ${totals.protein} גרם
• פחמימה: ${totals.carbs} גרם
• שומן: ${totals.fat} גרם

${meal.notes ? `💡 *טיפ:* ${meal.notes}\n` : ''}💪 קדימה, שמור על הגרעון והשריר!`;
}

// Generate formatted WhatsApp message URL for sending reminder to user or partner
export function getMealWhatsAppShareUrl(meal: Meal, phone?: string): string {
  const message = formatWhatsAppMealMessage(meal);
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : `https://wa.me/`;
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

// Automatically send WhatsApp message via backend (supports CallMeBot automated API or URL)
export async function sendAutomatedWhatsAppMessage(
  meal: Meal,
  phone: string,
  apiKey?: string
): Promise<{ success: boolean; method: string; waUrl?: string }> {
  try {
    const message = formatWhatsAppMealMessage(meal);
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, apiKey }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Failed to call /api/send-whatsapp:', err);
    const fallbackUrl = getMealWhatsAppShareUrl(meal, phone);
    return { success: false, method: 'fallback', waUrl: fallbackUrl };
  }
}

export interface DayEventsForIcs {
  dateStr: string;
  meals: Meal[];
}

// Generate and trigger download of iCalendar (.ics) file with all meal alarms across multiple days
export function downloadCalendarIcsMultiDay(
  daysData: DayEventsForIcs[],
  calendarTitle = 'ארוחות חיטוב - שייפ-פיק'
) {
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ShapePeak//Cutting Meal Tracker//HE
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${calendarTitle}
`;

  daysData.forEach(({ dateStr, meals }) => {
    const [year, month, day] = dateStr.split('-');

    meals.forEach((meal) => {
      const [hours, minutes] = (meal.scheduledTime || '12:00').split(':');
      const startHour = hours.padStart(2, '0');
      const startMinute = minutes.padStart(2, '0');

      // duration 30 min
      const startDt = `${year}${month}${day}T${startHour}${startMinute}00`;
      
      // end dt +30m
      const endMinutes = parseInt(startMinute, 10) + 30;
      const endHours = parseInt(startHour, 10) + Math.floor(endMinutes / 60);
      const endM = (endMinutes % 60).toString().padStart(2, '0');
      const endH = endHours.toString().padStart(2, '0');
      const endDt = `${year}${month}${day}T${endH}${endM}00`;

      const summary = `🥗 ${meal.name} (${meal.scheduledTime})`;
      const desc = meal.items.map(i => `${i.name}: ${i.amount} ${i.unit}`).join('\\n');

      icsContent += `BEGIN:VEVENT
UID:meal-${meal.id}-${dateStr}@shapepeak
DTSTAMP:${year}${month}${day}T000000Z
DTSTART:${startDt}
DTEND:${endDt}
SUMMARY:${summary}
DESCRIPTION:${desc}
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:תזכורת: הגיע זמן ${meal.name}!
END:VALARM
END:VEVENT
`;
    });
  });

  icsContent += `END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = daysData.length === 1
    ? `meals-${daysData[0].dateStr}.ics`
    : `meals-plan-${daysData.length}-days.ics`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate and trigger download of iCalendar (.ics) file with all meal alarms (single day helper)
export function downloadCalendarIcs(meals: Meal[], dateStr: string) {
  downloadCalendarIcsMultiDay([{ dateStr, meals }], `ארוחות חיטוב - ${dateStr}`);
}

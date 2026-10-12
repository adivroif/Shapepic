// Format YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format Hebrew date display
export function formatHebrewDate(dateStr: string): { full: string; dayName: string; shortDate: string } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const dayNames = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const monthNames = [
      'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
      'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'
    ];

    const dayName = dayNames[date.getDay()];
    const shortDate = `${day} ${monthNames[date.getMonth()]}`;
    const full = `${dayName}, ${day} ${monthNames[date.getMonth()]} ${year}`;

    return { full, dayName, shortDate };
  } catch {
    return { full: dateStr, dayName: '', shortDate: dateStr };
  }
}

// Calculate offset date string
export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Check difference in minutes from now to meal time "HH:MM"
export function getMinutesDifference(timeStr: string, dateStr: string): number {
  try {
    const now = new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const mealDate = new Date(year, month - 1, day, hours, minutes, 0);
    const diffMs = mealDate.getTime() - now.getTime();
    return Math.round(diffMs / (1000 * 60));
  } catch {
    return 0;
  }
}

// Format human friendly countdown
export function formatMinutesUntil(diffMinutes: number): { text: string; isPast: boolean; isNow: boolean } {
  if (diffMinutes > -15 && diffMinutes <= 15) {
    return { text: 'עכשיו!', isPast: false, isNow: true };
  }
  if (diffMinutes > 15) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours > 0) {
      return { text: `בעוד ${hours} שעות ו-${mins} דק'`, isPast: false, isNow: false };
    }
    return { text: `בעוד ${mins} דקות`, isPast: false, isNow: false };
  }
  const abs = Math.abs(diffMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours > 0) {
    return { text: `לפני ${hours} שעות ו-${mins} דק'`, isPast: true, isNow: false };
  }
  return { text: `לפני ${mins} דקות`, isPast: true, isNow: false };
}

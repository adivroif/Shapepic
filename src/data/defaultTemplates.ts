import { Meal, SwapOption } from '../types/nutrition';

export interface PrebuiltPlan {
  id: string;
  name: string;
  description: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: Meal[];
}

export const PREBUILT_CUTTING_PLANS: PrebuiltPlan[] = [
  {
    id: 'classic-1800',
    name: 'תפריט חיטוב קלאסי מומלץ (1,800 קק״ל)',
    description: 'חלוקה מאוזנת ל-5 ארוחות עם דגש על שימור מסת שריר גבוהה (180 גרם חלבון).',
    targetCalories: 1800,
    targetProtein: 180,
    targetCarbs: 155,
    targetFat: 48,
    meals: [
      {
        id: 'm1',
        name: 'ארוחת בוקר - אנרגיה מבוקרת',
        scheduledTime: '08:00',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        notes: 'לשתות 2 כוסות מים עם הקימה',
        items: [
          { id: 'f1', name: 'ביצים קשות/חביתה (1 שלמה + 2 חלבונים)', amount: 3, unit: 'יח׳', calories: 150, protein: 18, carbs: 1, fat: 8, category: 'protein' },
          { id: 'f2', name: 'לחם שיפון/מלא קל', amount: 2, unit: 'פרוסות', calories: 90, protein: 5, carbs: 16, fat: 1, category: 'carbs' },
          { id: 'f3', name: 'אבוקדו בינוני', amount: 40, unit: 'גרם', calories: 65, protein: 1, carbs: 3, fat: 6, category: 'fat' },
          { id: 'f4', name: 'מלפפון ועגבניה חתוכים', amount: 150, unit: 'גרם', calories: 30, protein: 1.5, carbs: 5, fat: 0.2, category: 'veggies' }
        ]
      },
      {
        id: 'm2',
        name: 'ארוחת ביניים 1 - חלבון ורעננות',
        scheduledTime: '11:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        notes: 'מצוין לפני פגישות או בנסיעה',
        items: [
          { id: 'f5', name: 'יוגורט פרו PRO דל שומן 20g חלבון', amount: 1, unit: 'גביע (200 גרם)', calories: 120, protein: 20, carbs: 7, fat: 1, category: 'protein' },
          { id: 'f6', name: 'תפוח עץ ירוק גרני סמית', amount: 1, unit: 'יח׳ בינוני', calories: 75, protein: 0.4, carbs: 19, fat: 0.3, category: 'carbs' },
          { id: 'f7', name: 'שקדים טבעיים לא קלויים', amount: 12, unit: 'גרם (כ-10 יח׳)', calories: 70, protein: 2.5, carbs: 2.5, fat: 6, category: 'fat' }
        ]
      },
      {
        id: 'm3',
        name: 'ארוחת צהריים - עיקרית',
        scheduledTime: '14:00',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        notes: 'ארוחה משביעה ועשירה במינרלים',
        items: [
          { id: 'f8', name: 'חזה עוף צלוי במחבת פסים/גריל', amount: 200, unit: 'גרם מוכן', calories: 280, protein: 58, carbs: 0, fat: 4.5, category: 'protein' },
          { id: 'f9', name: 'אורז בסמטי / יסמין מבושל', amount: 150, unit: 'גרם שקול מבושל', calories: 195, protein: 4, carbs: 43, fat: 0.5, category: 'carbs' },
          { id: 'f10', name: 'שעועית ירוקה / ברוקולי מאודה', amount: 150, unit: 'גרם', calories: 45, protein: 3, carbs: 8, fat: 0.4, category: 'veggies' },
          { id: 'f11', name: 'כפית שמן זית כתית מעולה', amount: 5, unit: 'גרם', calories: 45, protein: 0, carbs: 0, fat: 5, category: 'fat' }
        ]
      },
      {
        id: 'm4',
        name: 'ארוחת קדם-אימון / ביניים 2',
        scheduledTime: '17:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        notes: 'כ-60 דקות לפני האימון לטעינת אנרגיה',
        items: [
          { id: 'f12', name: 'אבקת חלבון מי גבינה (Whey)', amount: 1, unit: 'סקופ (30 גרם)', calories: 120, protein: 24, carbs: 2.5, fat: 1.5, category: 'protein' },
          { id: 'f13', name: 'בננה בינונית בשלה', amount: 1, unit: 'יח׳', calories: 95, protein: 1.2, carbs: 24, fat: 0.3, category: 'carbs' },
          { id: 'f14', name: 'פריכיות אורז מלא', amount: 2, unit: 'יח׳', calories: 60, protein: 1.5, carbs: 13, fat: 0.5, category: 'carbs' }
        ]
      },
      {
        id: 'm5',
        name: 'ארוחת ערב - התאוששות',
        scheduledTime: '20:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        notes: 'משביעה וקלה לעיכול לפני השינה',
        items: [
          { id: 'f15', name: 'טונה במים מסוננת היטב', amount: 1, unit: 'קופסה (112 גרם)', calories: 120, protein: 27, carbs: 0, fat: 0.8, category: 'protein' },
          { id: 'f16', name: 'גבינה לבנה 5% או קוטג׳ 5%', amount: 100, unit: 'גרם (חצי גביע)', calories: 95, protein: 11, carbs: 3.5, fat: 5, category: 'protein' },
          { id: 'f17', name: 'סלט ירקות ישראלי עשיר', amount: 250, unit: 'גרם', calories: 50, protein: 2, carbs: 10, fat: 0.5, category: 'veggies' },
          { id: 'f18', name: 'טחינה גולמית משומשום מלא', amount: 15, unit: 'גרם (כף שטוחה)', calories: 95, protein: 3, carbs: 2.5, fat: 8.5, category: 'fat' }
        ]
      }
    ]
  },
  {
    id: 'aggressive-1550',
    name: 'תפריט חיטוב חזק / גרעון עמוק (1,550 קק״ל)',
    description: 'מיועד לשבועות סיום חיטוב, פחמימה נמוכה יחסית ושמירה קפדנית על חלבון.',
    targetCalories: 1550,
    targetProtein: 175,
    targetCarbs: 110,
    targetFat: 42,
    meals: [
      {
        id: 'm21',
        name: 'ארוחת בוקר - חלבון נקי',
        scheduledTime: '08:00',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        notes: 'קפה שחור ללא סוכר מותר',
        items: [
          { id: 'fa1', name: 'חביתת 4 חלבונים + ביצה שלמה', amount: 1, unit: 'מנה', calories: 140, protein: 22, carbs: 1, fat: 5, category: 'protein' },
          { id: 'fa2', name: 'לחם קל', amount: 2, unit: 'פרוסות', calories: 80, protein: 5, carbs: 14, fat: 0.8, category: 'carbs' },
          { id: 'fa3', name: 'ירקות ירוקים חופשי', amount: 150, unit: 'גרם', calories: 25, protein: 1.5, carbs: 4, fat: 0.2, category: 'veggies' }
        ]
      },
      {
        id: 'm22',
        name: 'ארוחת ביניים 1',
        scheduledTime: '11:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'fa4', name: 'יוגורט חלבון 25g ללא סוכר', amount: 1, unit: 'גביע', calories: 130, protein: 25, carbs: 6, fat: 0.5, category: 'protein' },
          { id: 'fa5', name: 'גרגרי פירות יער / תותים קפואים', amount: 80, unit: 'גרם', calories: 40, protein: 0.8, carbs: 8, fat: 0.3, category: 'carbs' }
        ]
      },
      {
        id: 'm23',
        name: 'ארוחת צהריים - דלת פחמימה',
        scheduledTime: '14:00',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'fa6', name: 'סינטה בקר דלת שומן צרובה / חזה עוף', amount: 220, unit: 'גרם', calories: 300, protein: 55, carbs: 0, fat: 8, category: 'protein' },
          { id: 'fa7', name: 'בטטה בתנור', amount: 120, unit: 'גרם', calories: 110, protein: 2, carbs: 25, fat: 0.2, category: 'carbs' },
          { id: 'fa8', name: 'סלט כרוב, חסה ומלפפון', amount: 200, unit: 'גרם', calories: 40, protein: 2, carbs: 7, fat: 0.3, category: 'veggies' },
          { id: 'fa9', name: 'שמן זית', amount: 5, unit: 'גרם', calories: 45, protein: 0, carbs: 0, fat: 5, category: 'fat' }
        ]
      },
      {
        id: 'm24',
        name: 'קדם אימון',
        scheduledTime: '17:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'fa10', name: 'שייק חלבון איזולט', amount: 1, unit: 'מנה', calories: 110, protein: 25, carbs: 1.5, fat: 0.5, category: 'protein' },
          { id: 'fa11', name: 'תמר מג׳הול גדול', amount: 1, unit: 'יח׳ (25 גרם)', calories: 70, protein: 0.6, carbs: 18, fat: 0.1, category: 'carbs' }
        ]
      },
      {
        id: 'm25',
        name: 'ארוחת ערב - קלילה',
        scheduledTime: '20:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'fa12', name: 'פילה דג אמנון / דניס אפוי', amount: 200, unit: 'גרם', calories: 230, protein: 42, carbs: 0, fat: 6, category: 'protein' },
          { id: 'fa13', name: 'ירקות אפויים (קישוא, פטריות, כרובית)', amount: 250, unit: 'גרם', calories: 65, protein: 4, carbs: 10, fat: 1, category: 'veggies' },
          { id: 'fa14', name: 'טחינה משומשום מלא', amount: 15, unit: 'גרם', calories: 95, protein: 3, carbs: 2.5, fat: 8.5, category: 'fat' }
        ]
      }
    ]
  },
  {
    id: 'women-1400',
    name: 'תפריט חיטוב נשים (1,400 קק״ל)',
    description: 'מתוכנן במיוחד לגוף נשי - שובע גבוה, 125 גרם חלבון ויחס שומן איכותי.',
    targetCalories: 1400,
    targetProtein: 125,
    targetCarbs: 120,
    targetFat: 44,
    meals: [
      {
        id: 'w1',
        name: 'ארוחת בוקר - שיבולת שועל וחלבון',
        scheduledTime: '08:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'wf1', name: 'שיבולת שועל דקה', amount: 35, unit: 'גרם', calories: 130, protein: 4.5, carbs: 23, fat: 2.5, category: 'carbs' },
          { id: 'wf2', name: 'חצי סקופ אבקת חלבון או יוגורט פרו', amount: 15, unit: 'גרם', calories: 60, protein: 12, carbs: 1, fat: 0.8, category: 'protein' },
          { id: 'wf3', name: 'חמאת בוטנים טבעית', amount: 10, unit: 'גרם (כפית)', calories: 60, protein: 2.5, carbs: 2, fat: 5, category: 'fat' },
          { id: 'wf4', name: 'פירות יער טריים', amount: 50, unit: 'גרם', calories: 25, protein: 0.5, carbs: 5, fat: 0.2, category: 'carbs' }
        ]
      },
      {
        id: 'w2',
        name: 'ארוחת צהריים - סלט עשיר בחלבון',
        scheduledTime: '13:30',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'wf5', name: 'חזה עוף צלוי פרוס', amount: 160, unit: 'גרם', calories: 220, protein: 46, carbs: 0, fat: 3.5, category: 'protein' },
          { id: 'wf6', name: 'קינואה מבושלת / בטטה', amount: 100, unit: 'גרם', calories: 120, protein: 4, carbs: 21, fat: 1.8, category: 'carbs' },
          { id: 'wf7', name: 'סלט ירקות גדול', amount: 200, unit: 'גרם', calories: 40, protein: 1.5, carbs: 8, fat: 0.3, category: 'veggies' },
          { id: 'wf8', name: 'כפית שמן זית + לימון', amount: 5, unit: 'גרם', calories: 45, protein: 0, carbs: 0, fat: 5, category: 'fat' }
        ]
      },
      {
        id: 'w3',
        name: 'ארוחת ביניים / אחה״צ',
        scheduledTime: '17:00',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'wf9', name: 'גבינת קוטג׳ 3%-5%', amount: 125, unit: 'גרם (חצי גביע)', calories: 105, protein: 14, carbs: 3.5, fat: 4, category: 'protein' },
          { id: 'wf10', name: 'פריכיות אורז דקות', amount: 3, unit: 'יח׳', calories: 60, protein: 1.2, carbs: 13, fat: 0.4, category: 'carbs' }
        ]
      },
      {
        id: 'w4',
        name: 'ארוחת ערב',
        scheduledTime: '20:00',
        reminderOffsetMinutes: 10,
        isCompleted: false,
        items: [
          { id: 'wf11', name: 'פילה סלמון / טונה במים', amount: 140, unit: 'גרם', calories: 230, protein: 32, carbs: 0, fat: 11, category: 'protein' },
          { id: 'wf12', name: 'ברוקולי ושעועית ירוקה מוקפצים', amount: 200, unit: 'גרם', calories: 60, protein: 4, carbs: 9, fat: 0.8, category: 'veggies' },
          { id: 'wf13', name: 'חצי פרוסת לחם מלא', amount: 1, unit: 'פרוסה (30 גרם)', calories: 70, protein: 3.5, carbs: 13, fat: 0.8, category: 'carbs' }
        ]
      }
    ]
  }
];

// Offline instant swap database for common foods
export const COMMON_SWAP_DATABASE: Record<string, SwapOption[]> = {
  'חזה עוף': [
    { name: 'דג דניס / אמנון בתנור', amount: 220, unit: 'גרם', calories: 240, protein: 45, carbs: 0, fat: 5, reason: 'מקור חלבון קל לעיכול, עשיר באומגה 3' },
    { name: 'סינטה בקר רזה (משויש דל)', amount: 180, unit: 'גרם', calories: 250, protein: 46, carbs: 0, fat: 7, reason: 'עשיר בברזל, אבץ וקריאטין טבעי' },
    { name: 'טופו במרקם קשה צרוב', amount: 250, unit: 'גרם', calories: 230, protein: 38, carbs: 5, fat: 8, reason: 'חלופה טבעונית עשירה בסידן ללא שומן רווי' }
  ],
  'אורז': [
    { name: 'בטטה אפויה', amount: 180, unit: 'גרם', calories: 160, protein: 3, carbs: 37, fat: 0.2, reason: 'אינדקס גליקמי נמוך, עשירה בוויטמין A ומשביעה במיוחד' },
    { name: 'קינואה מבושלת', amount: 140, unit: 'גרם', calories: 170, protein: 6, carbs: 30, fat: 2.5, reason: 'מכילה את כל חומצות האמינו החיוניות וסיבים' },
    { name: 'תפוח אדמה מבושל/אפוי', amount: 200, unit: 'גרם', calories: 170, protein: 4, carbs: 38, fat: 0.2, reason: 'מדד השובע הגבוה ביותר בעולם התזונה!' }
  ],
  'ביצים': [
    { name: 'גבינת קוטג׳ 5%', amount: 150, unit: 'גרם', calories: 145, protein: 17, carbs: 4.5, fat: 6, reason: 'חלבון קזאין הנספג באיטיות' },
    { name: 'יוגורט יווני פרו 0%-2%', amount: 200, unit: 'גרם', calories: 130, protein: 20, carbs: 6, fat: 2, reason: 'קל ומרענן עם פרוביוטיקה' }
  ],
  'שיבולת שועל': [
    { name: 'לחם שיפון מלא איכותי', amount: 2, unit: 'פרוסות (60 גרם)', calories: 140, protein: 5, carbs: 26, fat: 1.2, reason: 'סיבים תזונתיים לשמירה על רמת סוכר יציבה' },
    { name: 'פריכיות כוסמין מלא', amount: 4, unit: 'יח׳', calories: 120, protein: 3.5, carbs: 25, fat: 0.8, reason: 'נפח גבוה ותחושת שובע מהירה' }
  ]
};

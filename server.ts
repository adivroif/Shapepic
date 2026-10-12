import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI safely
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Endpoint to parse raw text meal plan into structured meals
app.post('/api/parse-menu', async (req, res) => {
  try {
    const { menuText, targetCalories, startDate } = req.body;
    if (!menuText || typeof menuText !== 'string' || !menuText.trim()) {
      return res.status(400).json({ error: 'menuText is required' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured',
        fallback: true
      });
    }

    const prompt = `אתה מומחה תזונה ודיאטן ספורט ברמה הגבוהה ביותר, המתמחה בתפריטי חיטוב (Cutting) ושמירה על מסת שריר.
המשתמש סיפק את התפריט שבנו לו. שים לב: התפריט יכול להיות:
1. תפריט שבועי מפורט המחולק לפי ימים (למשל: יום ראשון, יום שני, יום שלישי וכו' או א-ה, ו, שבת).
2. או תפריט יומי יחיד שמיועד לשכפול לכל ימות השבוע.

עליך לנתח את הטקסט:
- אם הטקסט מחולק לפי ימים בשבוע (לפחות 2 ימים או ימי השבוע), זהה אותו כ-"isWeekly": true ופרק כל יום לרשימת ארוחות משלו עם שעות מדויקות ומאכלים מפורטים.
- אם הטקסט הוא תפריט יומי כללי, החזר "isWeekly": false עם רשימת הארוחות ב-"meals".

עבור כל ארוחה, קבע שעות מדויקות (לדוגמה: 08:00 בוקר, 11:30 ביניים, 14:00 צהריים, 17:30 קדם-אימון, 20:30 ערב, 22:30 לילה).
חשב עבור כל מאכל את הגרם/יחידות, קלוריות, חלבון, פחמימה ושומן.

טקסט התפריט של המשתמש:
"""
${menuText}
"""

${targetCalories ? `יעד קלורי משוער: ${targetCalories} קלוריות.` : ''}

החזר אך ורק תשובת JSON תקינה במבנה הבא (ללא markdown וללא טקסט נוסף):
{
  "isWeekly": true/false,
  "title": "כותרת קצרה לתפריט",
  "summary": "הסבר תמציתי בעברית על התפריט והתאמתו לחיטוב",
  "estimatedTotals": {
    "calories": 1800,
    "protein": 180,
    "carbs": 150,
    "fat": 50
  },
  "days": [
    {
      "dayName": "יום ראשון",
      "dayIndex": 0,
      "meals": [
        {
          "name": "ארוחת בוקר",
          "scheduledTime": "08:00",
          "reminderOffsetMinutes": 10,
          "items": [
            {
              "name": "ביצים קשות",
              "amount": 2,
              "unit": "יח'",
              "calories": 140,
              "protein": 12,
              "carbs": 1,
              "fat": 10,
              "category": "protein"
            }
          ],
          "notes": "הערה או טיפ"
        }
      ]
    }
  ],
  "meals": [
    {
      "name": "שם הארוחה",
      "scheduledTime": "08:00",
      "reminderOffsetMinutes": 10,
      "items": [
        {
          "name": "ביצים קשות",
          "amount": 2,
          "unit": "יח'",
          "calories": 140,
          "protein": 12,
          "carbs": 1,
          "fat": 10,
          "category": "protein"
        }
      ],
      "notes": "הערה תזונתית"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error parsing menu with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to parse menu with AI',
      fallback: true
    });
  }
});

// Endpoint to suggest macro-equivalent swaps
app.post('/api/suggest-swap', async (req, res) => {
  try {
    const { foodItem, reason } = req.body;
    if (!foodItem) {
      return res.status(400).json({ error: 'foodItem is required' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured',
        fallback: true
      });
    }

    const prompt = `אתה מומחה תזונת חיטוב. המשתמש מעוניין להחליף את המאכל הבא בתפריט החיטוב שלו במאכל שווה ערך מבחינת מקרו (קלוריות, חלבון, פחמימה, שומן):
מאכל נוכחי: ${foodItem.name} (${foodItem.amount} ${foodItem.unit})
ערכים נוכחיים: ${foodItem.calories} קלוריות, ${foodItem.protein} גרם חלבון, ${foodItem.carbs} גרם פחמימה, ${foodItem.fat} גרם שומן.
סיבה להחלפה / העדפה: ${reason || 'גיוון / חוסר במצרך'}

החזר אך ורק תשובת JSON עם 3 חלופות מצוינות לחיטוב:
{
  "options": [
    {
      "name": "שם המאכל החלופי",
      "amount": 150,
      "unit": "גרם",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "reason": "למה זו חלופה מצוינת ואיך היא מתאימה לחיטוב"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in suggest-swap:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to suggest swap',
      fallback: true
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server-side persistent storage for cross-device sync
import fs from 'fs';

const DATA_DIR = path.resolve(__dirname, 'data');
const SYNC_FILE = path.resolve(DATA_DIR, 'cutting_shared_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Master cutting menu template
const MASTER_MEALS = [
  {
    id: "meal_master_1",
    name: "0900  קפה הפוך",
    scheduledTime: "09:00",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: [],
    customTotals: { calories: 120, protein: 6, carbs: 0, fat: 0 }
  },
  {
    id: "meal_master_2",
    name: "1000  גביע קוטג׳ 3% 250 גרם + 2 פרוסות לחם מלא + מלפפון, עגבנייה ופלפל",
    scheduledTime: "10:00",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: [],
    customTotals: { calories: 450, protein: 30, carbs: 0, fat: 0 }
  },
  {
    id: "meal_master_3",
    name: "1300  מעדן חלבון 20 גרם חלבון + תפוח Pink Lady",
    scheduledTime: "11:30",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: [],
    customTotals: { calories: 140, protein: 20, carbs: 0, fat: 0 }
  },
  {
    id: "meal_master_4",
    name: "1500  200 גרם חזה עוף במרינדה + 150 גרם בורגול + 150 גרם עדשים ירוקות + סלט",
    scheduledTime: "13:30",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: [],
    customTotals: { calories: 750, protein: 75, carbs: 0, fat: 0 }
  },
  {
    id: "meal_master_5",
    name: "1730  Müller Protein 25 גרם חלבון",
    scheduledTime: "18:30",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: [],
    customTotals: { calories: 140, protein: 25, carbs: 0, fat: 0 }
  },
  {
    id: "meal_master_6",
    name: "2030  2 ביצים + סלט/ירקות",
    scheduledTime: "20:00",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: [],
    customTotals: { calories: 400, protein: 15, carbs: 0, fat: 0 }
  },
  {
    id: "meal_master_7",
    name: "2130  קפה הפוך",
    scheduledTime: "21:00",
    reminderOffsetMinutes: 10,
    isCompleted: false,
    items: []
  }
];

function ensureMasterData(data: any): any {
  if (!data) data = {};
  if (!data.profile) {
    data.profile = {
      name: "מתחטב",
      currentWeightKg: 82,
      targetWeightKg: 76,
      targetCalories: 1800,
      targetProtein: 180,
      targetCarbs: 150,
      targetFat: 50,
      reminderMinutesBefore: 10,
      soundEnabled: true,
      whatsappPhone: "0545250413",
      autoNotifications: true
    };
  }
  if (!data.dailyPlans) {
    data.dailyPlans = {};
  }

  const existingDates = Object.keys(data.dailyPlans).sort().reverse();
  const baseMeals = existingDates.length > 0 && data.dailyPlans[existingDates[0]].meals?.length > 0
    ? data.dailyPlans[existingDates[0]].meals.map((m: any) => ({ ...m, isCompleted: false }))
    : MASTER_MEALS;

  const todayStr = new Date().toISOString().split('T')[0];
  if (!data.dailyPlans[todayStr]) {
    data.dailyPlans[todayStr] = {
      date: todayStr,
      targetCalories: 1800,
      targetProtein: 180,
      targetCarbs: 150,
      targetFat: 50,
      meals: baseMeals,
      waterIntakeMl: 0,
      targetWaterMl: 3000
    };
  }

  return data;
}

// GET /api/sync - Retrieve shared data across all devices
app.get('/api/sync', (req, res) => {
  try {
    let data: any = null;
    if (fs.existsSync(SYNC_FILE)) {
      const content = fs.readFileSync(SYNC_FILE, 'utf-8');
      data = JSON.parse(content);
    }
    
    data = ensureMasterData(data);
    fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return res.json({ exists: true, data });
  } catch (err: any) {
    console.error('Error reading sync file:', err);
    return res.status(500).json({ error: 'Failed to read sync data' });
  }
});

// POST /api/sync - Save shared data from any device
app.post('/api/sync', (req, res) => {
  try {
    const { profile, dailyPlans, lastUpdated } = req.body;
    if (!profile && !dailyPlans) {
      return res.status(400).json({ error: 'profile or dailyPlans required' });
    }

    let existingData: any = {};
    if (fs.existsSync(SYNC_FILE)) {
      try {
        existingData = JSON.parse(fs.readFileSync(SYNC_FILE, 'utf-8'));
      } catch (e) {}
    }

    const payload = {
      profile: profile || existingData.profile || null,
      dailyPlans: {
        ...(existingData.dailyPlans || {}),
        ...(dailyPlans || {}),
      },
      lastUpdated: lastUpdated || Date.now(),
      savedAt: new Date().toISOString(),
    };

    const finalPayload = ensureMasterData(payload);
    fs.writeFileSync(SYNC_FILE, JSON.stringify(finalPayload, null, 2), 'utf-8');
    return res.json({ success: true, lastUpdated: finalPayload.lastUpdated });
  } catch (err: any) {
    console.error('Error writing sync file:', err);
    return res.status(500).json({ error: 'Failed to write sync data' });
  }
});

// Endpoint to automatically send WhatsApp message 10 minutes before
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { phone, message, apiKey } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message are required' });
    }

    // Format phone to international (e.g. 0501234567 -> 972501234567)
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.slice(1);
    }

    // If CallMeBot API key is configured, send directly to WhatsApp in the background
    if (apiKey) {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
      const botRes = await fetch(url);
      const text = await botRes.text();
      return res.json({ success: true, method: 'callmebot', response: text });
    }

    // Return the universal WhatsApp direct URL
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    return res.json({ success: true, method: 'url', waUrl });
  } catch (err: any) {
    console.error('Error in send-whatsapp:', err);
    return res.status(500).json({ error: err?.message || 'Failed to send WhatsApp message' });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cutting Meal Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

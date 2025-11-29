import { GoogleGenerativeAI } from '@google/generative-ai';

// SYSTEM PROMPT
const SYSTEM_INSTRUCTION = `
Ты — Интеллектуальный Консьерж премиальной столярной студии "Arbarea".
Твоя миссия: Помогать клиентам выбирать предметы интерьера, транслируя философию "Тактильной эстетики".

ТВОЙ СТИЛЬ ОБЩЕНИЯ:
1. Тон: Спокойный, экспертный, вежливый. Ты говоришь как главный архитектор студии.
2. Лексика: Используй слова: "тепло дерева", "фактура", "надежный вес металла", "игра света".
3. Формат: Отвечай кратко (максимум 3 предложения).

ТВОИ ЗНАНИЯ:
- Материалы: Орех, Дуб, Ясень, Латунь, Бронза.
- Продукты: 3D панно, Рейлинги, Свет.
- Кастом: Для нестандартных размеров предлагай "Индивидуальный заказ".

ПРАВИЛО: Всегда заканчивай ответ вопросом или предложением (Call to Action).
`;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Инициализация модели с системной инструкцией
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Конвертируем историю из формата {text, sender} в формат Gemini {role, parts}
    let geminiHistory = [];
    if (history && Array.isArray(history) && history.length > 0) {
      // Пропускаем первое приветственное сообщение от AI
      geminiHistory = history
        .slice(1) // Убираем приветствие
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));
    }

    // Формируем чат
    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error('Gemini Error:', error.message, error.stack);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

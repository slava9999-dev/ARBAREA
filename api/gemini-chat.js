const { GoogleGenerativeAI } = require('@google/generative-ai');

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

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message, history } = req.body; // history - массив предыдущих сообщений (если есть)

    if (!process.env.GEMINI_API_KEY) throw new Error('No API Key');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Инициализация модели с системной инструкцией
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Из списка доступных моделей
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Формируем чат
    const chat = model.startChat({
      history: history || [], // Поддержка контекста диалога
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error('Gemini Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

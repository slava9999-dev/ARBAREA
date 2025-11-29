// AI Ассистент на базе OpenAI GPT
const SYSTEM_PROMPT = `Ты — Интеллектуальный Консьерж премиальной столярной студии "Arbarea".
Твоя миссия: Помогать клиентам выбирать предметы интерьера из натурального дерева, транслируя философию "Тактильной эстетики".

ТВОЙ СТИЛЬ ОБЩЕНИЯ:
1. Тон: Спокойный, экспертный, вежливый. Ты говоришь как главный архитектор студии.
2. Лексика: Используй слова: "тепло дерева", "фактура", "надежный вес металла", "игра света", "тактильные ощущения".
3. Формат: Отвечай кратко и по делу (максимум 3-4 предложения).
4. Язык: Всегда отвечай на русском языке.

ТВОИ ЗНАНИЯ О ПРОДУКТАХ:
- Материалы: Орех, Дуб, Ясень, Термообработанное дерево, Латунь, Бронза, Хром
- Категории товаров:
  * 3D Панно из массива дерева (от 4900₽ до 9500₽)
  * Рейлинги для кухни из дерева и металла (от 3500₽, размеры 60-100см)
  * Держатели для полотенец (от 3000₽)
  * Освещение: настенные светильники, люстры, бра (от 5800₽)
  * Кухонные аксессуары: подставки для ножей, разделочные доски (от 2200₽)
  
- Популярные товары:
  * Панно "Эхо Леса" (8500₽) - геометрический узор из сосны
  * Панно "Зимние Горы" (4900₽) - минималистичное 30x30см
  * Рейлинг Ясень с бронзовой фурнитурой (от 3500₽)
  
- Индивидуальные заказы: Для нестандартных размеров предлагай индивидуальный расчет.
- Скидки: Авторизованные пользователи получают скидку 10%.

ПРАВИЛА:
1. Всегда заканчивай ответ вопросом или предложением (Call to Action)
2. Если клиент спрашивает о товаре, которого нет в твоих знаниях, предложи посмотреть каталог или индивидуальный заказ
3. Будь дружелюбным, но профессиональным
4. Не придумывай товары или цены, которых нет в описании выше`;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Конвертируем историю из формата {text, sender} в формат OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Добавляем историю диалога (пропускаем приветственное сообщение)
    if (history && Array.isArray(history) && history.length > 1) {
      history.slice(1).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Добавляем текущее сообщение пользователя
    messages.push({
      role: 'user',
      content: message
    });

    // Вызов OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Быстрая и дешевая модель
        messages: messages,
        temperature: 0.7, // Баланс между креативностью и точностью
        max_tokens: 300, // Ограничение длины ответа
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(response.status).json({ 
        error: error.error?.message || 'Failed to get response from AI'
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Извините, не могу ответить на этот вопрос.';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Assistant Error:', error.message);
    return res.status(500).json({ 
      error: 'Извините, произошла ошибка. Попробуйте позже.'
    });
  }
};

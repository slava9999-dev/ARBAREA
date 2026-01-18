// AI Ассистент на базе OpenAI GPT
import { applyCors } from './_cors.js';
import { verifyToken, supabaseAdmin } from './_supabase.js';

const SYSTEM_PROMPT = `Ты — Интеллектуальный Консьерж премиальной столярной студии "Arbarea".
Твоя миссия: Помогать клиентам выбирать предметы интерьера из натурального дерева, транслируя философию "Тактильной эстетики".

ТВОЙ СТИЛЬ ОБЩЕНИЯ:
1. Тон: Спокойный, экспертный, вежливый. Ты говоришь как главный архитектор студии.
2. Лексика: Используй слова: "тепло дерева", "фактура", "надежный вес металла", "игра света", "тактильные ощущения".
3. Формат: Отвечай кратко и по делу (максимум 3-4 предложения).
4. Язык: Всегда отвечай на русском языке.

ТВОИ ЗНАНИЯ (ДИНАМИЧЕСКИЙ КАТАЛОГ):
{{PRODUCT_CATALOG}}

ДОПОЛНИТЕЛЬНО:
- Индивидуальные заказы: Для нестандартных размеров предлагай индивидуальный расчет.
- Скидки: Авторизованные пользователи получают скидку 10%.

ПРАВИЛА:
1. Всегда заканчивай ответ вопросом или предложением (Call to Action)
2. Если клиент спрашивает о товаре, которого нет в твоих знаниях, предложи посмотреть каталог или индивидуальный заказ
3. Будь дружелюбным, но профессиональным
4. Не придумывай товары или цены, которых нет в списке выше`;

export default async function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return; // Handle preflight

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ SECURITY: Optional Authentication for AI usage
  let isUserAuthenticated = false;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);
    if (user) {
      isUserAuthenticated = true;
    }
  }

  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing');
      return res.status(500).json({ error: 'AI service configuration error' });
    }

    // 4. GET DYNAMIC DATA
    let productCatalogStr = 'Каталог временно недоступен. Предлагай индивидуальные консультации.';
    try {
      const { data: products, error: dbError } = await supabaseAdmin
        .from('products')
        .select('name, price, category, description, in_stock')
        .eq('in_stock', true)
        .limit(15);
      
      if (!dbError && products && products.length > 0) {
        productCatalogStr = products.map(p => 
          `- ${p.name} (${p.category}): ${p.price}₽. ${p.description ? p.description.slice(0, 100) : ''}`
        ).join('\n');
      }
    } catch (e) {
      console.error('DB Error for AI:', e);
    }

    const finalPrompt = SYSTEM_PROMPT.replace('{{PRODUCT_CATALOG}}', productCatalogStr);

    // Initial message as system prompt with dynamic data
    const messages = [{ role: 'system', content: finalPrompt }];

    // Добавляем историю диалога (пропускаем приветственное сообщение)
    if (history && Array.isArray(history) && history.length > 1) {
      for (const msg of history.slice(1)) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }
    }


    // Добавляем текущее сообщение пользователя
    messages.push({
      role: 'user',
      content: isUserAuthenticated 
        ? `${message} (Примечание для AI: Пользователь авторизован и имеет право на скидку 10%)`
        : message,
    });

    // Вызов Groq API (OpenAI compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(response.status).json({
        error: error.error?.message || 'Failed to get response from AI',
      });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      'Извините, не могу ответить на этот вопрос.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Assistant Error:', error.message);
    return res.status(500).json({
      error: 'Извините, произошла ошибка. Попробуйте позже.',
    });
  }
}

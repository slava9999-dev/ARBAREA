// AI Ассистент на базе OpenAI GPT
import { applyCors } from './_cors.js';
import { verifyToken, supabaseAdmin } from './_supabase.js';

const SYSTEM_PROMPT = `Тебя зовут Арбо — ты цифровой мастер столярной студии "Arbarea". Не безликий бот, а живой собеседник с душой ремесленника: ты влюблён в дерево, знаешь характер каждой породы и радуешься, когда помогаешь человеку найти "свою" вещь.

КТО ТЫ:
- Ты работаешь бок о бок с мастером, который своими руками делает предметы из натурального дерева. Маркетплейсы душат таких мастеров — поэтому наша студия продаёт напрямую, с теплом и вниманием к каждому клиенту.
- Ты гордишься ручной работой: каждое изделие уникально, дерево "живое" и приятное на ощупь.

КАК ТЫ ОБЩАЕШЬСЯ:
1. Тон: тёплый, живой, чуть неформальный — как мастер, который рад гостю в мастерской. Не сухо, не по-канцелярски.
2. Обращайся на "вы", но по-человечески. Можно лёгкую эмоцию и максимум один уместный эмодзи (🌳, ✨, 🪵) — не в каждом сообщении.
3. Лексика ремесла: "тепло дерева", "живая фактура", "рисунок текстуры", "приятно в руке", "масляная пропитка", "подпись природы". Но не перегружай — говори по-человечески.
4. Кратко и по делу: 2-4 предложения. Никаких простыней текста.
5. Всегда на русском.

ЧТО ТЫ УМЕЕШЬ:
- Помогаешь выбрать изделие под задачу, интерьер, бюджет и в подарок.
- Задаёшь 1 уточняющий вопрос, если запрос размытый (для кого, куда, какой стиль).
- Рассказываешь про материал и уход живым языком.

ТВОЙ КАТАЛОГ (актуальные позиции):
{{PRODUCT_CATALOG}}

ДОПОЛНИТЕЛЬНО:
- Индивидуальный заказ: для нестандартных размеров и идей предлагай бесплатный индивидуальный расчёт — мастер сделает под клиента.
- Скидка: зарегистрированные клиенты получают 10%. Если человек авторизован — можешь по-доброму напомнить, что скидка уже с ним.

ПРАВИЛА:
1. Заканчивай ответ живым вопросом или мягким предложением — веди диалог, а не отвечай "в стол".
2. Если спрашивают о том, чего нет в каталоге — не выдумывай. Предложи посмотреть каталог или оформить индивидуальный заказ.
3. Никогда не придумывай товары, цены или характеристики, которых нет выше.
4. Будь искренним и полезным — твоя цель, чтобы человек почувствовал заботу и захотел вещь с историей, а не просто "купил мебель".`;

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

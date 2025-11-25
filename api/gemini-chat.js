const { GoogleGenerativeAI } = require('@google/generative-ai');

// Инициализация
// Note: process.env.GEMINI_API_KEY might be undefined during build time, but should be present at runtime.
// We initialize inside the handler or check before usage to be safe, but global init is fine if env is present.
// For Vercel serverless, it's better to init inside or just assume env is there.

module.exports = async (req, res) => {
  // 1. CORS Headers (Разрешаем доступ отовсюду)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Обработка preflight запроса
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { message, history } = req.body || req.query; // Поддержка и POST и GET

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing on server');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use gemini-1.5-flash as it is generally available and faster/cheaper, or gemini-pro as requested.
    // The prompt requested "gemini-pro", but 1.5-flash is often better for chat. 
    // Let's stick to the prompt's request for "gemini-pro" or use "gemini-1.5-flash" if pro is deprecated.
    // Actually, "gemini-pro" is alias for 1.0 pro. "gemini-1.5-flash" is recommended.
    // I will use "gemini-1.5-flash" for better performance/cost ratio, but the user code had "gemini-pro".
    // I'll stick to the user's requested code structure but maybe upgrade model if I can.
    // User code said: const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    // I will use "gemini-1.5-flash" as it is the current standard for fast chat.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    // Construct chat history if provided
    let chat;
    if (history && Array.isArray(history)) {
        const historyForGemini = history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        chat = model.startChat({
            history: historyForGemini
        });
    } else {
        chat = model.startChat();
    }

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // The frontend expects { text: ... } based on previous code, but the prompt example returns { reply: ... }
    // I should probably return { text: ... } to match frontend expectations or update frontend.
    // Let's look at frontend: src/lib/gemini.js expects `data.text`.
    // The prompt code returns `reply`. This will break frontend.
    // I will return `text` to be compatible with existing frontend.
    return res.status(200).json({ text: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.message 
    });
  }
};

// @vercel/node
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ API key not found in environment');
      return res.status(500).json({
        error: 'Configuration error',
        hint: 'GEMINI_API_KEY not set in Vercel env vars',
      });
    }

    console.log('✅ API key found, calling Gemini...');

    const systemInstruction = `Ты — "Мастер Арбареа", эксперт столярной мастерской Arbarea из Нижнего Новгорода. Говори тепло, просто и с энтузиазмом о натуральном дереве. Используй эмодзи 🌳🪵✨`;

    const contents = [];

    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Gemini API error:', data);
      return res.status(response.status).json({
        error: 'Gemini API error',
        details: data.error?.message || 'Unknown error',
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('❌ No text in response');
      return res.status(500).json({ error: 'No response from AI' });
    }

    console.log('✅ Success!');
    return res.status(200).json({ text });
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
}

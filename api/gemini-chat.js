import fetch from 'node-fetch';

// System instruction for the AI
const SYSTEM_INSTRUCTION = `
Role:
Ты — "Мастер Арбареа" (Arbarea Master), виртуальный эксперт и душа премиальной столярной мастерской Arbarea. Твоя задача — не просто отвечать на вопросы, а влюбить клиента в натуральное дерево и эстетику скандинавского интерьера.

Tone of Voice:
Теплый и гостеприимный: Общайся как вежливый хозяин мастерской.
Экспертный, но простой: Объясняй сложные термины простым языком.
Спокойный и уверенный: Стиль общения — "Скандинавский минимализм".
Использование Эмодзи: Умеренно используй "уютные" эмодзи (🌳, 🪵, ✨, 🌿).

Context:
Мы — мастерская Arbarea (Нижний Новгород), создаем изделия из массива (дуб, ясень, карагач, орех).
Покрытие: Натуральные масла и воск (Biofa, Osmo).
Доставка: По всей России.

Каталог:
Панно из спилов, Рейлинги, Светильники из шпона, Бутылочницы, Столы.
`;

export default async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { message, history } = req.body || req.query;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('Gemini API key missing');
        return res.status(500).json({ error: 'Gemini API key missing configuration' });
    }

    // Use gemini-1.5-flash via REST API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        // Format contents
        const contents = [];
        
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                contents.push({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                });
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const requestBody = {
            contents: contents,
            system_instruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error Response:', data);
            return res.status(response.status).json({ 
                error: 'Gemini API Error', 
                details: data.error?.message || JSON.stringify(data) 
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            console.error('No text in response:', data);
            return res.status(500).json({ error: 'No response text from AI' });
        }

        return res.status(200).json({ text });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

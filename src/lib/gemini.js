import { SYSTEM_INSTRUCTION } from '../data/systemInstruction';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const sendMessageToGemini = async (history, newMessage) => {
    if (!API_KEY) {
        console.error("Gemini API Key is missing!");
        return "Ошибка: API ключ не найден. Пожалуйста, добавьте VITE_GEMINI_API_KEY в .env файл.";
    }

    // Format history for Gemini API
    // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // Add the new message
    contents.push({
        role: 'user',
        parts: [{ text: newMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: contents,
                system_instruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return "Простите, сейчас я не могу ответить. Попробуйте позже.";
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || "Хм, я задумался. Спросите еще раз?";

    } catch (error) {
        console.error("Network Error:", error);
        return "Ошибка соединения. Проверьте интернет.";
    }
};

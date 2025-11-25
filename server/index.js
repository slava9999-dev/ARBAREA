// server/index.js
// Express server to handle:
// 1. Tinkoff payment initialization
// 2. Telegram notifications for individual orders

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true })); // Allow all origins for dev; tighten in prod.
app.use(express.json());

const TERMINAL_KEY = process.env.TINKOFF_TERMINAL_KEY || process.env.VITE_TINKOFF_TERMINAL_KEY;
const SECRET = process.env.TINKOFF_SECRET || process.env.TINKOFF_PASSWORD || process.env.VITE_TINKOFF_SECRET || process.env.VITE_TINKOFF_PASSWORD;
const API_URL = 'https://securepay.tinkoff.ru/v2';

// Helper to generate token string (concatenated values)
function generateToken(params) {
    const data = { ...params, Password: SECRET };
    const keys = Object.keys(data).sort();
    const concatenated = keys.reduce((acc, key) => {
        if (key !== 'Token' && key !== 'Shops' && key !== 'Receipt' && key !== 'Data') {
            return acc + data[key];
        }
        return acc;
    }, '');
    return concatenated;
}

function sha256(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
}

// Tinkoff payment initialization endpoint
app.post('/api/create-payment', async (req, res) => {
    try {
        const { orderId, amount, description, customerData } = req.body;
        if (!TERMINAL_KEY || !SECRET) {
            console.error('Tinkoff keys missing');
            return res.status(500).json({ success: false, message: 'Payment configuration missing' });
        }

        const params = {
            TerminalKey: TERMINAL_KEY,
            Amount: amount * 100, // kopecks
            OrderId: orderId,
            Description: description,
            PayType: 'O',
            Language: 'ru',
        };

        // Optional receipt for 54-FZ compliance
        if (customerData?.email || customerData?.phone) {
            params.Receipt = {
                Email: customerData.email,
                Phone: customerData.phone,
                Taxation: 'osn',
                Items: [
                    {
                        Name: description,
                        Price: amount * 100,
                        Quantity: 1,
                        Amount: amount * 100,
                        Tax: 'none',
                    },
                ],
            };
        }

        const tokenString = generateToken(params);
        const token = sha256(tokenString);
        const requestBody = { ...params, Token: token };

        const response = await fetch(`${API_URL}/Init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (!data.Success) {
            return res.status(400).json({ success: false, message: data.Message || 'Payment initialization failed' });
        }
        return res.json({ success: true, paymentUrl: data.PaymentURL });
    } catch (err) {
        console.error('Payment server error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Telegram notification endpoint
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { message } = req.body;
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('Telegram configuration missing');
            return res.status(500).json({ success: false, message: 'Telegram configuration missing' });
        }

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(400).json({ success: false, message: 'Failed to send Telegram message' });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('Telegram server error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Gemini Chat endpoint for local development
import { GoogleGenerativeAI } from '@google/generative-ai';

app.post('/api/gemini-chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API key missing' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let chat;
        if (history && Array.isArray(history)) {
            const historyForGemini = history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            chat = model.startChat({ history: historyForGemini });
        } else {
            chat = model.startChat();
        }

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return res.json({ text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`⚡️ Server listening on http://localhost:${PORT}`);
    console.log(`📱 Telegram notifications: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured'}`);
    console.log(`💳 Tinkoff payments: ${TERMINAL_KEY ? 'Configured' : 'Not configured'}`);
});

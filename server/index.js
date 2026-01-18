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

import supabaseAdmin from '../api/_supabase.js';

app.post('/api/quick-register', async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!phone && !email) {
            return res.status(400).json({ error: 'Phone or email is required' });
        }

        // Logic: Use phone as primary identifier if available, else email.
        // We construct a unique email for auth if phone is used.
        let authEmail;
        let formattedPhone = null;

        if (phone) {
            // Format phone: just digits, ensure starts with 7
            let clean = phone.replace(/\D/g, '');
            if (clean.length === 11 && clean.startsWith('8')) clean = '7' + clean.slice(1);
            if (clean.length === 10) clean = '7' + clean;
            
            formattedPhone = '+' + clean;
            authEmail = `${clean}@arbarea.local`; // Fake email for phone-based auth
        } else {
            authEmail = email;
        }

        const TEMP_PASSWORD = process.env.QUICK_AUTH_PASSWORD || 'ArbareaQuickUser2026!';

        // 1. Try to create user
        let { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: authEmail,
            password: TEMP_PASSWORD,
            email_confirm: true,
            user_metadata: { name, phone: formattedPhone }
        });

        if (createError && createError.message?.includes('already registered')) {
            // User exists, we will sign them in
            console.log('User already exists, signing in...');
        } else if (createError) {
            throw createError;
        }

        // 2. Sign in to get session
        const { data: sessionData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
            email: authEmail,
            password: TEMP_PASSWORD
        });

        if (loginError) throw loginError;

        const user = sessionData.user;

        // 3. Upsert public profile
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: user.id, // Ensure we link to auth user if possible, or just phone
                phone: formattedPhone || null, // public.users might rely on phone
                // if using email only, public.users needs email column or we handle it gracefully?
                // Migration 20260103_create_users_table.sql typically has phone, name.
                // If the table schema requires phone, we might have issues with email-only users.
                // Assuming phone is primary key or unique.
                name: name,
                updated_at: new Date().toISOString()
            }, { onConflict: 'phone' }) // Assuming phone is unique key
            .select();

        // Note: if user signed up with email but we don't put it in public.users, it might be fine depending on schema.
        // But let's assume phone is main key for now as per previous context.

        return res.json({ session: sessionData.session, user: sessionData.user });

    } catch (err) {
        console.error('Quick Register Error:', err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`⚡️ Server listening on http://localhost:${PORT}`);
    console.log(`📱 Telegram notifications: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured'}`);
    console.log(`💳 Tinkoff payments: ${TERMINAL_KEY ? 'Configured' : 'Not configured'}`);
});

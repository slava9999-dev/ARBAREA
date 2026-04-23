import fetch from 'node-fetch';
import { applyCors } from './_cors.js';
import { verifyToken } from './_supabase.js';

export default async function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId)
    return res.status(500).json({ error: 'Server config missing' });

  // Removed JWT requirement as auth is now phone-based and contact forms can be used by guests
  // Rate limiting could be implemented here via Upstash Redis if needed in the future

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      },
    );
    const data = await response.json();
    
    // Log success for auditing
    console.log('Telegram message sent');
    
    return res.status(200).json(data);
  } catch (err) {
    console.error('Telegram API Exception:', err.message);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}

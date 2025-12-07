import fetch from 'node-fetch';
import { applyCors } from './_cors.js';

export default async function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId)
    return res.status(500).json({ error: 'Server config missing' });

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
    
    // Log for debugging
    if (!data.ok) {
      console.error('Telegram API Error:', data);
    } else {
      console.log('Telegram message sent successfully');
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Telegram API Exception:', error);
    return res.status(500).json({ error: error.message });
  }
}

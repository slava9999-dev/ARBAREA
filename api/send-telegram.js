import fetch from 'node-fetch';
import { applyCors } from './_cors.js';
import admin from './_firebase-admin.js';

export default async function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId)
    return res.status(500).json({ error: 'Server config missing' });

  // ✅ SECURITY: Verify Authentication Token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    await admin.auth().verifyIdToken(idToken);
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

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

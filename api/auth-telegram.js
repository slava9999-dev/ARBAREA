import crypto from 'crypto';
import admin from './_firebase-admin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ error: 'Telegram Bot Token not configured' });
  }

  // 1. Verify Data Integrity
  const dataCheckString = Object.keys(req.body)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${req.body[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (hmac !== hash) {
    return res.status(403).json({ error: 'Invalid hash' });
  }

  // 2. Check auth_date (prevent replay attacks, e.g., 5 minutes expiration)
  const now = Math.floor(Date.now() / 1000);
  if (now - auth_date > 300) {
    return res.status(403).json({ error: 'Data is outdated' });
  }

  try {
    // 3. Create/Get Firebase User
    const uid = `telegram:${id}`;
    const displayName = [first_name, last_name].filter(Boolean).join(' ');
    
    // Check if user exists, otherwise create
    try {
      await admin.auth().getUser(uid);
      // Update info if needed
      await admin.auth().updateUser(uid, {
        displayName,
        photoURL: photo_url,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid,
          displayName,
          photoURL: photo_url,
        });
      } else {
        throw error;
      }
    }

    // 4. Generate Custom Token
    const customToken = await admin.auth().createCustomToken(uid, {
        telegramId: id,
        username,
    });

    return res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Telegram Auth Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

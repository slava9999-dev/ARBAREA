import crypto from 'crypto';
import admin from './_firebase-admin.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const telegramData = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ error: 'Telegram bot token not configured' });
    }

    // Verify Telegram data authenticity
    const { hash, ...dataToCheck } = telegramData;

    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map((key) => `${key}=${dataToCheck[key]}`)
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      return res.status(403).json({ error: 'Invalid Telegram data' });
    }

    // Check if data is not too old (5 minutes)
    const authDate = parseInt(telegramData.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 300) {
      return res.status(403).json({ error: 'Telegram data is too old' });
    }

    // Create or get Firebase user
    const uid = `telegram_${telegramData.id}`;
    const displayName =
      telegramData.first_name +
      (telegramData.last_name ? ` ${telegramData.last_name}` : '');
    const photoURL = telegramData.photo_url || null;
    const username = telegramData.username || null;

    try {
      await admin.auth().getUser(uid);
      // Update user info if needed
      await admin.auth().updateUser(uid, {
        displayName,
        photoURL,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid,
          displayName,
          photoURL,
          providerData: [
            {
              providerId: 'telegram',
              uid: telegramData.id.toString(),
              displayName,
              photoURL,
            },
          ],
        });
      } else {
        throw error;
      }
    }

    // Create custom token
    const customToken = await admin.auth().createCustomToken(uid, {
      telegram_id: telegramData.id,
      username,
    });

    return res.status(200).json({
      customToken,
      user: {
        uid,
        displayName,
        photoURL,
        username,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}

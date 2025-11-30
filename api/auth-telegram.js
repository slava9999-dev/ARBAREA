import crypto from 'crypto';
import admin from './_firebase-admin.js';

export default async function handler(req, res) {
  console.log('🔵 Telegram auth API called');
  
  if (req.method !== 'POST') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;
  console.log('🔵 Received data:', { id, first_name, username, auth_date });
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.log('❌ TELEGRAM_BOT_TOKEN not configured');
    return res.status(500).json({ error: 'Telegram Bot Token not configured' });
  }

  console.log('🔵 Bot token found, verifying hash...');
  
  // 1. Verify Data Integrity
  const dataCheckString = Object.keys(req.body)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${req.body[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (hmac !== hash) {
    console.log('❌ Invalid hash');
    return res.status(403).json({ error: 'Invalid hash' });
  }

  console.log('✅ Hash verified');

  // 2. Check auth_date (prevent replay attacks, e.g., 5 minutes expiration)
  const now = Math.floor(Date.now() / 1000);
  if (now - auth_date > 300) {
    console.log('❌ Data is outdated');
    return res.status(403).json({ error: 'Data is outdated' });
  }

  console.log('✅ Auth date valid');

  try {
    // 3. Create/Get Firebase User
    const uid = `telegram:${id}`;
    const displayName = [first_name, last_name].filter(Boolean).join(' ');
    
    console.log('🔵 Creating/updating Firebase user:', uid);
    
    // Check if user exists, otherwise create
    try {
      await admin.auth().getUser(uid);
      console.log('🔵 User exists, updating...');
      // Update info if needed
      await admin.auth().updateUser(uid, {
        displayName,
        photoURL: photo_url,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('🔵 User not found, creating new...');
        await admin.auth().createUser({
          uid,
          displayName,
          photoURL: photo_url,
        });
      } else {
        throw error;
      }
    }

    console.log('🔵 Generating custom token...');
    // 4. Generate Custom Token
    const customToken = await admin.auth().createCustomToken(uid, {
        telegramId: id,
        username,
    });

    console.log('✅ Telegram auth successful for user:', uid);
    return res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('❌ Telegram Auth Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

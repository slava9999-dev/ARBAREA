/**
 * Tinkoff Payment Webhook Handler
 * Receives payment status notifications and updates order status in Firestore
 */

import crypto from 'crypto';
import admin from './_firebase-admin.js';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      TerminalKey,
      OrderId,
      Success,
      Status,
      PaymentId,
      ErrorCode,
      Amount,
      Token,
    } = req.body;

    console.log('📩 Payment webhook received:', { OrderId, Status, Success });

    // Verify the notification token
    const password = process.env.TINKOFF_PASSWORD;
    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;

    if (!password || !terminalKey) {
      console.error('❌ Missing Tinkoff credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify terminal key
    if (TerminalKey !== terminalKey) {
      console.error('❌ Invalid TerminalKey');
      return res.status(403).json({ error: 'Invalid terminal key' });
    }

    // Verify token signature
    const params = { ...req.body };
    delete params.Token;
    params.Password = password;

    const sortedKeys = Object.keys(params).sort();
    const concatenatedString = sortedKeys.map(key => params[key]).join('');
    const expectedToken = crypto.createHash('sha256').update(concatenatedString).digest('hex');

    if (Token !== expectedToken) {
      console.error('❌ Invalid token signature');
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Determine new order status based on payment status
    let newStatus = 'pending_payment';
    let shouldUpdate = false;

    switch (Status) {
      case 'AUTHORIZED':
        newStatus = 'authorized';
        shouldUpdate = true;
        break;
      case 'CONFIRMED':
        newStatus = 'paid';
        shouldUpdate = true;
        break;
      case 'REVERSED':
      case 'REFUNDED':
        newStatus = 'refunded';
        shouldUpdate = true;
        break;
      case 'REJECTED':
        newStatus = 'payment_failed';
        shouldUpdate = true;
        break;
      case 'CANCELED':
      case 'DEADLINE_EXPIRED':
        newStatus = 'cancelled';
        shouldUpdate = true;
        break;
      default:
        console.log(`ℹ️ Unhandled status: ${Status}`);
    }

    // Update order in Firestore
    if (shouldUpdate && OrderId) {
      const db = admin.firestore();
      
      // Find order by orderId
      const ordersRef = db.collection('orders');
      const snapshot = await ordersRef.where('orderId', '==', OrderId).limit(1).get();

      if (!snapshot.empty) {
        const orderDoc = snapshot.docs[0];
        
        await orderDoc.ref.update({
          status: newStatus,
          paymentId: PaymentId,
          paymentStatus: Status,
          paymentAmount: Amount / 100, // Convert from kopecks
          paymentErrorCode: ErrorCode || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Order ${OrderId} updated to status: ${newStatus}`);

        // Send Telegram notification for successful payments
        if (newStatus === 'paid') {
          await sendPaymentSuccessNotification(orderDoc.data(), OrderId);
        }
      } else {
        console.warn(`⚠️ Order not found: ${OrderId}`);
      }
    }

    // Tinkoff expects "OK" response
    return res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Send Telegram notification for successful payment
 */
async function sendPaymentSuccessNotification(orderData, orderId) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram credentials not configured');
      return;
    }

    const message = `
✅ <b>Оплата подтверждена!</b>

<b>Заказ:</b> ${orderId}
<b>Сумма:</b> ${orderData.total?.toLocaleString()} ₽
<b>Клиент:</b> ${orderData.userName || 'Не указано'}
<b>Телефон:</b> ${orderData.userPhone || 'Не указано'}
<b>Доставка:</b> ${orderData.deliveryMethod || 'Не выбрана'}
<b>Адрес:</b> ${orderData.deliveryAddress || 'Не указан'}

🎉 Можно начинать обработку!
`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram notification');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

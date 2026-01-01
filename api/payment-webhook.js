/**
 * Tinkoff Payment Webhook Handler
 * Receives payment status updates and updates orders in Supabase
 */

import crypto from 'node:crypto';
import { supabaseAdmin } from './_supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
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

    console.log(`📥 Webhook received: Order ${OrderId}, Status: ${Status}`);

    // Verify terminal key
    const expectedTerminalKey = process.env.TINKOFF_TERMINAL_KEY;
    if (TerminalKey !== expectedTerminalKey) {
      console.error('❌ Invalid TerminalKey');
      return res.status(403).json({ error: 'Invalid terminal key' });
    }

    // Verify token signature
    const password = process.env.TINKOFF_PASSWORD;
    if (password && Token) {
      // Create token data without Token field using destructuring
      const { Token: _, ...tokenData } = req.body;
      tokenData.Password = password;

      const sortedKeys = Object.keys(tokenData).sort();
      const concatenated = sortedKeys.map(key => tokenData[key]).join('');
      const expectedToken = crypto.createHash('sha256').update(concatenated).digest('hex');

      if (Token.toLowerCase() !== expectedToken.toLowerCase()) {
        console.error('❌ Invalid signature');
        return res.status(403).json({ error: 'Invalid signature' });
      }
    }

    // Map Tinkoff status to our status
    let orderStatus;
    switch (Status) {
      case 'AUTHORIZED':
      case 'CONFIRMED':
        orderStatus = 'paid';
        break;
      case 'REJECTED':
      case 'AUTH_FAIL':
        orderStatus = 'payment_failed';
        break;
      case 'CANCELED':
      case 'REVERSED':
        orderStatus = 'cancelled';
        break;
      case 'REFUNDED':
      case 'PARTIAL_REFUNDED':
        orderStatus = 'refunded';
        break;
      default:
        orderStatus = 'pending_payment';
    }

    // Update order in Supabase
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', OrderId)
      .single();

    if (fetchError || !order) {
      console.error('❌ Order not found:', OrderId);
      // Still return OK to Tinkoff
      return res.status(200).send('OK');
    }

    // Idempotency check: Don't process if already paid/final
    if (order.status === 'paid' && orderStatus === 'paid') {
      console.log(`ℹ️ Order ${OrderId} is already paid. Skipping update.`);
      return res.status(200).send('OK');
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: orderStatus,
        payment_id: PaymentId?.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', OrderId);

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
    } else {
      console.log(`✅ Order ${OrderId} updated to status: ${orderStatus}`);
      
      // Send Telegram notification ONLY if this is a fresh payment confirmation
      if (Status === 'CONFIRMED' && Success && order.status !== 'paid') {
        await sendPaymentSuccessNotification(order, Amount);
      }
    }

    // Tinkoff expects "OK" response
    return res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Return 500 for server errors so Tinkoff retries the request
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendPaymentSuccessNotification(order, amount) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('⚠️ Telegram credentials not configured');
    return;
  }

  const itemsList = order.items?.map(item => 
    `• ${item.name} x${item.quantity}`
  ).join('\n') || 'Нет данных';

  const message = `
💰 <b>ОПЛАТА ПОЛУЧЕНА!</b>

<b>Заказ:</b> ${order.order_id}
<b>Сумма:</b> ${(amount / 100).toLocaleString()} ₽

<b>Клиент:</b>
📱 ${order.user_phone || 'Не указан'}
📧 ${order.user_email || 'Не указан'}
👤 ${order.user_name || 'Не указано'}

<b>Доставка:</b>
🚚 ${order.delivery_method || 'Не выбрано'}
📍 ${order.delivery_address || 'Не указан'}

<b>Товары:</b>
${itemsList}

✅ Можно начинать сборку!
`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram notification error:', error);
  }
}

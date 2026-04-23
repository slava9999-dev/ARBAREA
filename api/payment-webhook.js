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

    // Verify token signature (MANDATORY)
    const password = process.env.TINKOFF_PASSWORD;
    if (!password) {
      console.error('❌ TINKOFF_PASSWORD not configured');
      return res.status(500).json({ error: 'Server misconfigured' });
    }
    if (!Token) {
      console.error('❌ Missing signature token');
      return res.status(403).json({ error: 'Missing signature' });
    }

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

    if (fetchError) {
      console.error('❌ Database error fetching order:', fetchError);
      // Return 500 for DB errors so Tinkoff retries
      return res.status(500).json({ error: 'Database error' });
    }

    if (!order) {
      console.error('❌ Order not found:', OrderId);
      // Return 200 OK because retrying won't fix "Order not found"
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
      // Return 500 for update errors so Tinkoff retries
      return res.status(500).json({ error: 'Failed to update order' });
    }
    
    console.log(`✅ Order ${OrderId} updated to status: ${orderStatus}`);
      
    // Handle business logic on successful payment
    if (orderStatus === 'paid' && order.status !== 'paid') {
      // 1. Mark products as sold
      await handleInventoryUpdate(order.items);
      
      // 2. Send Telegram notification
      if (Status === 'CONFIRMED' && Success) {
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
      console.error('❌ Telegram API error:', await response.text());
    } else {
      console.log('✅ Telegram notification sent');
    }
  } catch (error) {
    console.error('❌ Telegram notification error:', error);
  }
}

/**
 * Marks products in the order as sold (in_stock = false)
 */
async function handleInventoryUpdate(items) {
  if (!items || !Array.isArray(items)) return;

  console.log(`📦 Updating inventory for ${items.length} items`);

  for (const item of items) {
    const productId = item.productId || item.id;
    
    if (!productId) continue;

    // Use productId if it was split from composite (handled in create-payment and extractProductId)
    // But since we are server side, we should be careful with composite IDs too if productId is missing
    let actualId = productId;
    if (typeof productId === 'string' && productId.includes('::')) {
      actualId = productId.split('::')[0];
    }

    try {
      const { error } = await supabaseAdmin
        .from('products')
        .update({ in_stock: false })
        .eq('id', actualId);

      if (error) {
        console.error(`❌ Failed to mark product ${actualId} as sold:`, error);
      } else {
        console.log(`✅ Product ${actualId} marked as sold`);
      }
    } catch (err) {
      console.error(`❌ Inventory error for product ${actualId}:`, err);
    }
  }
}

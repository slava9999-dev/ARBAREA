/**
 * Email Notification API
 * Sends transactional emails for order confirmations
 * 
 * Uses Resend API (requires RESEND_API_KEY env variable)
 */

import { supabaseAdmin } from './_supabase.js';
import { applyCors } from './_cors.js';

export default async function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, orderId, email, name } = req.body;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email');
      return res.status(200).json({ success: true, skipped: true });
    }

    if (!email || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch order data from Supabase instead of Firestore
    const { data: orderData, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError) {
      console.error('Error fetching order for email:', fetchError);
      // We continue even if fetch fails to at least try sending generic email
    }

    // Generate email content based on type
    let subject, htmlContent;

    switch (type) {
      case 'order_created':
        subject = `Заказ ${orderId} принят! 🎉`;
        htmlContent = generateOrderCreatedEmail(orderId, name, orderData);
        break;
      case 'payment_confirmed':
        subject = `Оплата подтверждена! Заказ ${orderId} ✅`;
        htmlContent = generatePaymentConfirmedEmail(orderId, name, orderData);
        break;
      case 'order_shipped':
        subject = `Ваш заказ ${orderId} отправлен! 🚚`;
        htmlContent = generateShippedEmail(orderId, name, orderData);
        break;
      case 'order_delivered':
        subject = `Заказ ${orderId} доставлен! 📦`;
        htmlContent = generateDeliveredEmail(orderId, name, orderData);
        break;
      default:
        return res.status(400).json({ error: 'Unknown email type' });
    }

    // Send via Resend API
    // Note: Using Resend's default domain. To use custom domain (e.g., arbarea.ru),
    // you need to verify the domain in Resend dashboard with DNS records.
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Arbarea <onboarding@resend.dev>';
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log(`✅ Email sent: ${type} to ${email}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Email Templates
function generateOrderCreatedEmail(orderId, name, order) {
  const itemsHtml = order?.items?.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        ${item.name}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
        ${(item.price * item.quantity).toLocaleString()} ₽
      </td>
    </tr>
  `).join('') || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f4; }
    .container { max-width: 600px; margin: 0 auto; background: #1c1917; }
    .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; color: #e7e5e4; }
    .order-id { background: #292524; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .order-id span { font-size: 20px; font-weight: bold; color: #fbbf24; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #292524; color: #a8a29e; padding: 12px; text-align: left; }
    .total { background: #292524; padding: 20px; border-radius: 12px; text-align: right; }
    .total span { font-size: 24px; font-weight: bold; color: #fbbf24; }
    .footer { background: #0c0a09; padding: 20px; text-align: center; color: #78716c; font-size: 12px; }
    .btn { display: inline-block; background: #d97706; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌲 Arbarea</h1>
    </div>
    <div class="content">
      <h2 style="color: white;">Привет, ${name || 'Друг'}! 👋</h2>
      <p>Спасибо за заказ! Мы получили вашу заявку и уже начинаем её обработку.</p>
      
      <div class="order-id">
        <p style="margin: 0 0 5px; color: #a8a29e; font-size: 12px;">НОМЕР ЗАКАЗА</p>
        <span>${orderId}</span>
      </div>
      
      <h3 style="color: white;">Что вы заказали:</h3>
      <table>
        <thead>
          <tr>
            <th>Товар</th>
            <th style="text-align: center;">Кол-во</th>
            <th style="text-align: right;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="total">
        <p style="margin: 0 0 5px; color: #a8a29e;">Итого к оплате:</p>
        <span>${order?.total?.toLocaleString() || '—'} ₽</span>
      </div>
      
      <p style="margin-top: 30px;">
        <strong>Доставка:</strong> ${order?.delivery_method || 'Уточняется'}<br>
        <strong>Адрес:</strong> ${order?.delivery_address || 'Будет уточнен'}
      </p>
      
      <center>
        <a href="https://arbarea.ru/profile" class="btn">Отслеживать заказ</a>
      </center>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Arbarea — Мастерская деревянных изделий</p>
      <p>Это письмо сформировано автоматически, отвечать на него не нужно.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePaymentConfirmedEmail(orderId, name, order) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background: #f5f5f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1c1917; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">✅ Оплата подтверждена!</h1>
    </div>
    <div style="padding: 30px; color: #e7e5e4;">
      <h2 style="color: white;">Отличные новости, ${name || 'Друг'}!</h2>
      <p>Оплата вашего заказа <strong style="color: #fbbf24;">${orderId}</strong> успешно прошла.</p>
      <p>Сейчас мы начинаем готовить ваш заказ. Каждое изделие создаётся вручную с любовью и заботой о деталях.</p>
      <p style="background: #292524; padding: 15px; border-radius: 12px;">
        💰 <strong>Сумма:</strong> ${order?.total?.toLocaleString() || '—'} ₽<br>
        📦 <strong>Доставка:</strong> ${order?.delivery_method || 'Уточняется'}
      </p>
      <p>Мы сообщим вам, когда заказ будет готов к отправке!</p>
    </div>
    <div style="background: #0c0a09; padding: 20px; text-align: center; color: #78716c; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Arbarea — Мастерская деревянных изделий</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateShippedEmail(orderId, name, order) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background: #f5f5f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1c1917; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">🚚 Заказ отправлен!</h1>
    </div>
    <div style="padding: 30px; color: #e7e5e4;">
      <h2 style="color: white;">${name || 'Друг'}, ваш заказ в пути!</h2>
      <p>Заказ <strong style="color: #fbbf24;">${orderId}</strong> покинул нашу мастерскую и направляется к вам.</p>
      
      <div style="background: #292524; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0 0 10px; color: #a8a29e; font-size: 12px;">СПОСОБ ДОСТАВКИ</p>
        <p style="margin: 0; color: white; font-size: 18px; font-weight: bold;">${order?.delivery_method || 'Курьерская служба'}</p>
        <p style="margin: 10px 0 0; color: #a8a29e;">${order?.delivery_address || ''}</p>
        ${order?.tracking_number ? `
        <p style="margin: 15px 0 0;">
          <strong>Трек-номер:</strong> <span style="color: #fbbf24;">${order.tracking_number}</span>
        </p>
        ` : ''}
      </div>
      
      <p>Следите за статусом доставки в личном кабинете или по трек-номеру на сайте службы доставки.</p>
      
      <center>
        <a href="https://arbarea.ru/profile" style="display: inline-block; background: #d97706; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0;">
          Отслеживать заказ
        </a>
      </center>
    </div>
    <div style="background: #0c0a09; padding: 20px; text-align: center; color: #78716c; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Arbarea</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateDeliveredEmail(orderId, name, order) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background: #f5f5f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1c1917; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0;">🎉 Заказ доставлен!</h1>
    </div>
    <div style="padding: 30px; color: #e7e5e4; text-align: center;">
      <h2 style="color: white;">Ура, ${name || 'Друг'}!</h2>
      <p style="font-size: 18px;">Ваш заказ <strong style="color: #fbbf24;">${orderId}</strong> успешно доставлен!</p>
      
      <p style="font-size: 48px; margin: 30px 0;">🌲📦✨</p>
      
      <p>Надеемся, вам понравится! Каждое изделие Arbarea создано с душой из натурального дерева.</p>
      
      <div style="background: #292524; padding: 20px; border-radius: 12px; margin: 30px 0;">
        <p style="margin: 0; color: #a8a29e;">Нам важно ваше мнение!</p>
        <p style="margin: 10px 0 0; color: white;">Поделитесь впечатлениями в нашем <a href="https://t.me/arbarea" style="color: #fbbf24;">Telegram-канале</a></p>
      </div>
      
      <p style="color: #a8a29e;">Спасибо, что выбираете Arbarea! 🧡</p>
    </div>
    <div style="background: #0c0a09; padding: 20px; text-align: center; color: #78716c; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Arbarea — Мастерская деревянных изделий</p>
    </div>
  </div>
</body>
</html>
  `;
}

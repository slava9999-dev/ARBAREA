import crypto from 'node:crypto';
import fetch from 'node-fetch';
import { applyCors } from './_cors.js';

export default async function handler(req, res) {
  // Apply secure CORS
  if (applyCors(req, res)) return; // Handle preflight

  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      items,
      orderId,
      description,
      customerEmail,
      customerPhone,
      receipt,
    } = req.body;

    // ✅ SECURITY: Get credentials ONLY from server-side env vars
    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    const password = process.env.TINKOFF_PASSWORD || process.env.TINKOFF_SECRET;

    if (!terminalKey || !password) {
      // ❌ DO NOT log credentials
      return res
        .status(500)
        .json({ success: false, error: 'Server configuration error' });
    }

    // ✅ CRITICAL: Calculate total amount on SERVER (not trusting client)
    // Base product prices (without variants)
    const BASE_PRODUCT_PRICES = {
      // Products with variants (base price)
      101: 2500, // Рейлинг Ясень (60см base)
      102: 2000, // Держатель Ясень (60см base)

      // Fixed price products
      103: 8500, // Панно Эхо Леса
      104: 4900, // Панно Зимние Горы
      105: 600, // Подставка Малый Дом

      // Donation fallback
      'donate-100': 100,
    };

    // Variant price modifiers
    const VARIANT_MODIFIERS = {
      101: {
        // Рейлинг Ясень
        size: { 600: 0, 800: 500, 1000: 1000 },
      },
      102: {
        // Держатель Ясень
        size: { 600: 0, 800: 500, 1000: 1000 },
      },
      'railing-premium-01': {
        size: { 60: 0, 80: 1200, 100: 2500 },
      },
    };

    function calculateProductPrice(itemId) {
      // Check if it's a donation (format: "donate-500")
      if (String(itemId).startsWith('donate-')) {
        const amount = parseInt(String(itemId).split('-')[1], 10);
        if (amount && amount >= 10 && amount <= 100000) {
          return amount;
        }
        return null; // Invalid donation amount
      }

      // Check if it's a variant ID (format: "101-bronze-600")
      const itemIdStr = String(itemId);
      const parts = itemIdStr.split('-');
      const baseId = parts[0];

      // Get base price
      let price = BASE_PRODUCT_PRICES[itemId] || BASE_PRODUCT_PRICES[baseId];

      if (!price) {
        return null; // Invalid product
      }

      // Add variant modifiers if applicable
      if (parts.length > 1 && VARIANT_MODIFIERS[baseId]) {
        const sizeValue = parseInt(parts[parts.length - 1], 10); // Last part is size
        const sizeModifier = VARIANT_MODIFIERS[baseId].size?.[sizeValue] || 0;
        price += sizeModifier;
      }

      return price;
    }

    let calculatedAmount = 0;
    const receiptItems = [];

    if (items && Array.isArray(items)) {
      let hasDonation = false;
      for (const item of items) {
        const serverPrice = calculateProductPrice(item.id);
        if (!serverPrice) {
          return res.status(400).json({
            success: false,
            error: `Invalid product ID: ${item.id}`,
          });
        }

        if (String(item.id).startsWith('donate-')) {
          hasDonation = true;
        }

        const itemTotal = serverPrice * (item.quantity || 1);
        calculatedAmount += itemTotal;

        receiptItems.push({
          Name: item.name || 'Товар',
          Price: serverPrice * 100, // Копейки
          Quantity: item.quantity || 1,
          Amount: itemTotal * 100,
          Tax: 'none',
        });
      }

      // Add shipping cost for non-authorized users (if not a donation)
      const SHIPPING_COST = 500;
      if (!req.body.isAuth && !hasDonation) {
        calculatedAmount += SHIPPING_COST;
        
        // Add shipping as a separate receipt item
        receiptItems.push({
          Name: 'Доставка',
          Price: SHIPPING_COST * 100, // Копейки
          Quantity: 1,
          Amount: SHIPPING_COST * 100,
          Tax: 'none',
        });
      }
    } else {
      // Fallback: если items не передан, возвращаем ошибку
      return res.status(400).json({
        success: false,
        error: 'No items provided for payment',
      });
    }

    const amountInKopecks = calculatedAmount * 100; // Т-Банк требует копейки

    // Prepare data for token generation
    const params = {
      TerminalKey: terminalKey,
      Amount: amountInKopecks,
      OrderId: orderId,
      Description: description,
      Password: password,
    };

    // Generate Token
    const sortedKeys = Object.keys(params).sort();
    const concatenatedValues = sortedKeys.map((key) => params[key]).join('');
    const token = crypto
      .createHash('sha256')
      .update(concatenatedValues)
      .digest('hex');

    // Prepare request body
    const requestBody = {
      TerminalKey: terminalKey,
      Amount: amountInKopecks,
      OrderId: orderId,
      Description: description,
      Token: token,
    };

    // Construct Receipt
    if (receipt) {
      requestBody.Receipt = receipt;
    } else if (customerEmail || customerPhone) {
      requestBody.Receipt = {
        Email: customerEmail,
        Phone: customerPhone,
        Taxation: 'osn',
        Items: receiptItems,
      };
    }

    const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.Success) {
      // ❌ DO NOT log full response (may contain sensitive data)
      return res.status(400).json({
        success: false,
        error: data.Message || 'Payment initialization failed',
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl: data.PaymentURL,
      paymentId: data.PaymentId,
    });
  } catch (error) {
    console.error('Payment API Error:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`,
    });
  }
}

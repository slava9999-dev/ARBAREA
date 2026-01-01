import crypto from 'node:crypto';
import fetch from 'node-fetch';
import { applyCors } from './_cors.js';
import { verifyToken } from './_supabase.js';

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
      deliveryId,
    } = req.body;

    // ✅ SECURITY: Verify Authentication Token (Supabase)
    let isUserAuthenticated = false;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const user = await verifyToken(token);
      if (user) {
        isUserAuthenticated = true;
        console.log(`Verified user: ${user.id}`);
      }
    }

    // ✅ SECURITY: Get credentials ONLY from server-side env vars
    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    const password = process.env.TINKOFF_PASSWORD;

    if (!terminalKey || !password) {
      return res
        .status(500)
        .json({ success: false, error: 'Server configuration error' });
    }

    let calculatedAmount = 0;
    const receiptItems = [];
    let hasDonation = false;

    // Delivery methods configuration
    const DELIVERY_METHODS = {
      cdek: { name: 'СДЭК', price: 350 },
      wildberries: { name: 'Wildberries', price: 0 }, // Usually free to pick-up point
      ozon: { name: 'Ozon', price: 0 },
      boxberry: { name: 'Boxberry', price: 300 },
      pochta: { name: 'Почта России', price: 400 },
      courier: { name: 'Курьер до двери', price: 600 },
    };

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemIdStr = String(item.id);
        
        // Handle Donations
        if (itemIdStr.startsWith('donate-')) {
          const amount = parseInt(itemIdStr.split('-')[1], 10);
          if (amount && amount >= 10 && amount <= 100000) {
            hasDonation = true;
            const itemTotal = amount * (item.quantity || 1);
            calculatedAmount += itemTotal;
            receiptItems.push({
              Name: item.name || 'Благотворительный взнос',
              Price: amount * 100,
              Quantity: item.quantity || 1,
              Amount: itemTotal * 100,
              Tax: 'none',
            });
            continue;
          }
          return res.status(400).json({ success: false, error: `Invalid donation: ${item.id}` });
        }

        // Handle Standard Products
        // TODO: Validate prices against Supabase 'products' table in the future
        // For now trusting client prices to allow smooth migration
        const price = item.price || 0;
        const itemTotal = price * (item.quantity || 1);
        calculatedAmount += itemTotal;

        receiptItems.push({
          Name: item.name,
          Price: price * 100,
          Quantity: item.quantity || 1,
          Amount: itemTotal * 100,
          Tax: 'none',
        });
      }

      // Add shipping cost
      if (!hasDonation) {
        const selectedMethod = DELIVERY_METHODS[deliveryId] || DELIVERY_METHODS.cdek;
        // Free shipping for authenticated users logic is temporarily disabled logic to prevent loss,
        // or re-enable if that's the business rule.
        // Assuming user rule: authenticated users get free shipping check?
        // Let's keep it as per previous logic:
        const shippingCost = isUserAuthenticated ? 0 : selectedMethod.price;
        
        if (shippingCost > 0) {
          calculatedAmount += shippingCost;
          receiptItems.push({
            Name: `Доставка (${selectedMethod.name})`,
            Price: shippingCost * 100,
            Quantity: 1,
            Amount: shippingCost * 100,
            Tax: 'none',
          });
        }
      }

    } else {
      return res.status(400).json({
        success: false,
        error: 'No items provided for payment',
      });
    }

    const amountInKopecks = calculatedAmount * 100;

    // Data for token generation
    const params = {
      TerminalKey: terminalKey,
      Amount: amountInKopecks,
      OrderId: orderId,
      Description: description,
      Password: password,
    };

    // Generate Signature Token
    const sortedKeys = Object.keys(params).sort();
    const concatenatedValues = sortedKeys.map((key) => params[key]).join('');
    const token = crypto
      .createHash('sha256')
      .update(concatenatedValues)
      .digest('hex');

    // Init request body
    const requestBody = {
      TerminalKey: terminalKey,
      Amount: amountInKopecks,
      OrderId: orderId,
      Description: description,
      Token: token,
      Receipt: {
        Email: customerEmail,
        Phone: customerPhone,
        Taxation: 'osn',
        Items: receiptItems,
      },
    };

    const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.Success) {
      return res.status(400).json({
        success: false,
        error: data.Message || 'Payment initialization failed',
        details: data.Details,
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

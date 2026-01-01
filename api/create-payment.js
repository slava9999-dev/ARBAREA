import crypto from 'node:crypto';
import fetch from 'node-fetch';
import { applyCors } from './_cors.js';
import admin from './_firebase-admin.js';

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

    // ✅ SECURITY: Verify Authentication Token
    let isUserAuthenticated = false;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken) {
          isUserAuthenticated = true;
          console.log(`Verified user: ${decodedToken.uid}`);
        }
      } catch (error) {
        console.warn('Invalid auth token provided:', error.message);
        // Fallback to non-authenticated
      }
    }

    // ✅ SECURITY: Get credentials ONLY from server-side env vars
    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    const password = process.env.TINKOFF_PASSWORD || process.env.TINKOFF_SECRET;

    if (!terminalKey || !password) {
      // ❌ DO NOT log credentials
      return res
        .status(500)
        .json({ success: false, error: 'Server configuration error' });
    }

    // ✅ SECURE PRICING: Fetch actual prices from Firestore
    const db = admin.firestore();
    const productRefs = items.map(item => db.collection('products').doc(String(item.id).split('-')[0]));
    
    let calculatedAmount = 0;
    const receiptItems = [];
    let hasDonation = false;

    // Fetch all products in parallel for performance
    const productSnapshots = await db.getAll(...productRefs);
    const productDataMap = {};
    productSnapshots.forEach(snap => {
      if (snap.exists) {
        productDataMap[snap.id] = snap.data();
      }
    });

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
        const baseId = itemIdStr.split('-')[0];
        const productData = productDataMap[baseId];

        if (!productData) {
          return res.status(400).json({ success: false, error: `Product not found: ${baseId}` });
        }

        let price = productData.basePrice || productData.price;
        
        // Add variant modifiers from DB if applicable
        const parts = itemIdStr.split('-');
        if (parts.length > 1 && productData.variants?.sizes) {
           const requestedSize = parseInt(parts[parts.length - 1], 10);
           const sizeOption = productData.variants.sizes.find(s => s.value === requestedSize);
           if (sizeOption) {
             price += (sizeOption.priceMod || 0);
           }
        }

        const itemTotal = price * (item.quantity || 1);
        calculatedAmount += itemTotal;

        receiptItems.push({
          Name: item.name || productData.name,
          Price: price * 100,
          Quantity: item.quantity || 1,
          Amount: itemTotal * 100,
          Tax: 'none',
        });
      }

      // Add shipping cost for non-authorized users (if not a donation)
      const SHIPPING_COST = 500;
      if (!isUserAuthenticated && !hasDonation) {
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

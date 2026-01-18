import crypto from 'node:crypto';
import fetch from 'node-fetch';
import { applyCors } from './_cors.js';
import { verifyToken, supabaseAdmin } from './_supabase.js';

// Delivery methods configuration (Server Side Truth)
// All deliveries FREE for customer
// Keep in sync with src/components/features/DeliverySelectorWithMap.jsx
const DELIVERY_METHODS = {
  // Транспортные компании
  cdek: { name: 'СДЭК', price: 0 },
  boxberry: { name: 'Boxberry', price: 0 },
  '5post': { name: '5Post', price: 0 },
  // Почта России
  pochta: { name: 'Почта России', price: 0 },
  // Авито
  avito: { name: 'Авито Доставка', price: 0 },
  // Курьерская доставка
  courier: { name: 'Курьер до двери', price: 0 },
};

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      items,
      orderId: clientOrderId,
      description,
      customerEmail,
      customerPhone,
      customerName,
      deliveryId,
      deliveryAddress,
    } = req.body;

    // 1. Authenticate user
    let userId = null;
    let isUserAuthenticated = false;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const user = await verifyToken(token);
      if (user) {
        userId = user.id;
        // isUserAuthenticated = true; // Unused
      }
    }

    // 2. Configuration check
    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    const password = process.env.TINKOFF_PASSWORD;
    if (!terminalKey || !password) {
      return res.status(500).json({ success: false, error: 'Server configuration missing' });
    }

    // 3. SECURE PRICE CALCULATION
    let calculatedSubtotal = 0;
    const validatedItems = [];
    const receiptItems = [];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Empty cart' });
    }

    // List of static products for fallback (during migration/empty DB)
    const STATIC_PRODUCTS = [
      { id: 101, name: 'Рейлинг Ясень   METAL AND GRAIN', price: 2500 },
      { id: 102, name: 'Держатель Ясень  WOOD AND STEEL', price: 2000 },
      { id: 103, name: 'Панно "Эхо Леса"', price: 8500 },
      { id: 104, name: 'Панно "Зимние Горы"', price: 4900 },
      { id: 105, name: 'Подставка «Малый Дом» из термоясеня', price: 600 },
      { id: 106, name: 'Панно "Горные Вершины"', price: 6500 },
      { id: 107, name: 'Панно «Гортензия»', price: 5000 },
    ];

    // Helper function to extract original product ID from cart item
    // Cart items may have composite IDs like "uuid::color::size" for variants
    const extractProductId = (item) => {
      if (item.productId) return item.productId;
      const idStr = String(item.id);
      if (idStr.startsWith('donate-')) return null;
      if (idStr.includes('::')) return idStr.split('::')[0];
      const parts = idStr.split('-');
      if (parts.length > 1 && /^\d+$/.test(parts[0])) return parts[0];
      
      // UUID regex check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(idStr)) return idStr;
      if (parts.length > 5) {
        const uuidCandidate = parts.slice(0, 5).join('-');
        if (uuidRegex.test(uuidCandidate)) return uuidCandidate;
      }
      return item.id;
    };

    // Fetch all products from DB for validation
    const rawIds = items
      .filter(item => !String(item.id).startsWith('donate-'))
      .map(item => extractProductId(item))
      .filter(id => id !== null);
    
    // Separating UUIDs from legacy IDs to avoid DB errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidProductIds = rawIds.filter(id => uuidRegex.test(String(id)));
    
    let dbProducts = [];
    if (uuidProductIds.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', uuidProductIds);
      
      if (error) {
        console.error('Supabase fetch error:', error);
        // We don't throw yet, we'll try static fallback
      } else if (data) {
        dbProducts = data;
      }
    }

    for (const item of items) {
      const itemIdStr = String(item.id);
      let price = 0;
      let name = item.name;

      if (itemIdStr.startsWith('donate-')) {
        price = Number.parseInt(itemIdStr.split('-')[1], 10);
        if (Number.isNaN(price) || price < 10 || price > 100000) {
          return res.status(400).json({ success: false, error: `Invalid donation amount` });
        }
      } else {
        const productId = extractProductId(item);
        // 1. Try DB products
        let foundProduct = dbProducts.find(p => p.id === productId);
        
        // 2. Try static products if not in DB
        if (!foundProduct) {
          foundProduct = STATIC_PRODUCTS.find(p => String(p.id) === String(productId));
        }

        if (!foundProduct) {
          console.error(`Product not found: ${productId} (Item ID: ${item.id})`);
          return res.status(400).json({ success: false, error: `Product not found: ${item.id}` });
        }

        price = Number(foundProduct.price);
        name = foundProduct.name;
        
        // Handle variants price modifications if present in the item
        if (item.selectedSize && item.selectedSize.priceMod) {
          price += Number(item.selectedSize.priceMod);
        }
      }

      const quantity = Math.max(1, Number.parseInt(item.quantity) || 1);
      const itemTotal = price * quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        ...item,
        name,
        price,
        quantity,
        total: itemTotal
      });

      receiptItems.push({
        Name: name.substring(0, 128),
        Price: price * 100,
        Quantity: quantity,
        Amount: itemTotal * 100,
        Tax: 'none',
      });
    }

    // 4. Delivery Calculation
    const selectedMethod = DELIVERY_METHODS[deliveryId] || DELIVERY_METHODS.cdek;
    // Rule: Delivery is free for everyone
    const shippingCost = 0; // selectedMethod.price check removed as all are 0
    const totalAmount = calculatedSubtotal + shippingCost;

    if (shippingCost > 0) {
      receiptItems.push({
        Name: `Доставка: ${selectedMethod.name}`,
        Price: shippingCost * 100,
        Quantity: 1,
        Amount: shippingCost * 100,
        Tax: 'none',
      });
    }

    // 5. SERVER-SIDE ORDER ID GENERATION
    // Priority: Client ID (if exists) -> New Secure ID
    const orderId = clientOrderId || `ARB-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 6. CREATE ORDER RECORD (SERVER-SIDE)
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        order_id: orderId,
        user_id: userId,
        user_email: customerEmail,
        user_phone: customerPhone,
        user_name: customerName,
        items: validatedItems,
        subtotal: calculatedSubtotal,
        shipping: shippingCost,
        total: totalAmount,
        delivery_method: selectedMethod.name,
        delivery_address: deliveryAddress,
        delivery_price: shippingCost,
        status: 'pending_payment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

    if (orderError) {
      console.error('Database Error:', orderError);
      return res.status(500).json({ success: false, error: 'Failed to create order' });
    }

    // 6. TINKOFF INITIALIZATION
    const amountInKopecks = totalAmount * 100;
    const params = {
      TerminalKey: terminalKey,
      Amount: amountInKopecks,
      OrderId: orderId,
      Description: description || `Заказ ${orderId}`,
      Password: password,
    };

    const sortedKeys = Object.keys(params).sort();
    const concatenatedValues = sortedKeys.map((key) => params[key]).join('');
    const token = crypto.createHash('sha256').update(concatenatedValues).digest('hex');

    const requestBody = {
      TerminalKey: terminalKey,
      Amount: amountInKopecks,
      OrderId: orderId,
      Description: params.Description,
      Token: token,
      Receipt: {
        Email: customerEmail,
        Phone: customerPhone,
        Taxation: 'osn',
        Items: receiptItems,
      },
    };

    const tinkoffResponse = await fetch('https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await tinkoffResponse.json();

    if (!data.Success) {
      return res.status(400).json({
        success: false,
        error: data.Message || 'Payment initialization failed',
      });
    }

    // Update order with payment details
    await supabaseAdmin
      .from('orders')
      .update({ 
        payment_id: data.PaymentId?.toString(),
        payment_url: data.PaymentURL 
      })
      .eq('order_id', orderId);

    return res.status(200).json({
      success: true,
      paymentUrl: data.PaymentURL,
      paymentId: data.PaymentId,
      orderId: orderId
    });

  } catch (error) {
    console.error('Critical Payment Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

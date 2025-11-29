import crypto from 'crypto';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { items, orderId, description, customerEmail, customerPhone, receipt } = req.body;
        
        // ✅ SECURITY: Get credentials ONLY from server-side env vars
        const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
        const password = process.env.TINKOFF_PASSWORD || process.env.TINKOFF_SECRET;

        if (!terminalKey || !password) {
            // ❌ DO NOT log credentials
            return res.status(500).json({ success: false, error: 'Server configuration error' });
        }

        // ✅ CRITICAL: Calculate total amount on SERVER (not trusting client)
        // Base product prices (without variants)
        const BASE_PRODUCT_PRICES = {
            // Products with variants (base price)
            '101': 3500, // Рейлинг Ясень (60см base)
            '102': 3000, // Держатель Ясень (60см base)
            'railing-premium-01': 4500,
            
            // Fixed price products
            '103': 8500, // Панно Эхо Леса
            '104': 4900, // Панно Зимние Горы
            '105': 100,  // Подставка Малый Дом
            
            // Donation fallback
            'donate-100': 100, 
        };

        // Variant price modifiers
        const VARIANT_MODIFIERS = {
            '101': { // Рейлинг Ясень
                size: { 600: 0, 800: 1000, 1000: 2000 }
            },
            '102': { // Держатель Ясень
                size: { 600: 0, 800: 800, 1000: 1600 }
            },
            'railing-premium-01': {
                size: { 60: 0, 80: 1200, 100: 2500 }
            }
        };

        function calculateProductPrice(itemId) {
            // Check if it's a donation (format: "donate-500")
            if (itemId.startsWith('donate-')) {
                const amount = parseInt(itemId.split('-')[1]);
                if (amount && amount >= 10 && amount <= 100000) {
                    return amount;
                }
                return null; // Invalid donation amount
            }

            // Check if it's a variant ID (format: "101-bronze-600")
            const parts = itemId.split('-');
            const baseId = parts[0];
            
            // Get base price
            let price = BASE_PRODUCT_PRICES[itemId] || BASE_PRODUCT_PRICES[baseId];
            
            if (!price) {
                return null; // Invalid product
            }

            // Add variant modifiers if applicable
            if (parts.length > 1 && VARIANT_MODIFIERS[baseId]) {
                const sizeValue = parseInt(parts[parts.length - 1]); // Last part is size
                const sizeModifier = VARIANT_MODIFIERS[baseId].size?.[sizeValue] || 0;
                price += sizeModifier;
            }

            return price;
        }

        let calculatedAmount = 0;
        const receiptItems = [];

        if (items && Array.isArray(items)) {
            for (const item of items) {
                const serverPrice = calculateProductPrice(item.id);
                if (!serverPrice) {
                    return res.status(400).json({ 
                        success: false, 
                        error: `Invalid product ID: ${item.id}` 
                    });
                }
                const itemTotal = serverPrice * (item.quantity || 1);
                calculatedAmount += itemTotal;

                receiptItems.push({
                    Name: item.name || 'Товар',
                    Price: serverPrice * 100, // Копейки
                    Quantity: item.quantity || 1,
                    Amount: itemTotal * 100,
                    Tax: 'none'
                });
            }
        } else {
            // Fallback: если items не передан, используем description (НЕ РЕКОМЕНДУЕТСЯ для продакшна)
            // TODO: REMOVE THIS FALLBACK IN PRODUCTION
            calculatedAmount = 1000; // Минимальная сумма для теста
            receiptItems.push({
                Name: description || 'Заказ',
                Price: calculatedAmount * 100,
                Quantity: 1,
                Amount: calculatedAmount * 100,
                Tax: 'none'
            });
        }

        const amountInKopecks = calculatedAmount * 100; // Т-Банк требует копейки

        // Prepare data for token generation
        const params = {
            TerminalKey: terminalKey,
            Amount: amountInKopecks,
            OrderId: orderId,
            Description: description,
            Password: password
        };

        // Generate Token
        const sortedKeys = Object.keys(params).sort();
        const concatenatedValues = sortedKeys.map(key => params[key]).join('');
        const token = crypto.createHash('sha256').update(concatenatedValues).digest('hex');

        // Prepare request body
        const requestBody = {
            TerminalKey: terminalKey,
            Amount: amountInKopecks,
            OrderId: orderId,
            Description: description,
            Token: token
        };

        // Construct Receipt
        if (receipt) {
            requestBody.Receipt = receipt;
        } else if (customerEmail || customerPhone) {
            requestBody.Receipt = {
                Email: customerEmail,
                Phone: customerPhone,
                Taxation: 'osn',
                Items: receiptItems
            };
        }

        const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!data.Success) {
            // ❌ DO NOT log full response (may contain sensitive data)
            return res.status(400).json({
                success: false,
                error: data.Message || 'Payment initialization failed'
            });
        }

        return res.status(200).json({
            success: true,
            paymentUrl: data.PaymentURL,
            paymentId: data.PaymentId
        });

    } catch {
        // ❌ DO NOT log error details (may contain secrets)
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

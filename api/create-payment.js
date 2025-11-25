const crypto = require('crypto');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
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
        const { amount, orderId, description, customerEmail, customerPhone, receipt } = req.body;
        const terminalKey = process.env.TINKOFF_TERMINAL_KEY || process.env.VITE_TINKOFF_TERMINAL_KEY;
        const password = process.env.TINKOFF_PASSWORD || process.env.TINKOFF_SECRET || process.env.VITE_TINKOFF_PASSWORD || process.env.VITE_TINKOFF_SECRET;

        if (!terminalKey || !password) {
            console.error('Missing Tinkoff credentials');
            return res.status(500).json({ success: false, error: 'Server configuration error' });
        }

        // Prepare data for token generation
        const params = {
            TerminalKey: terminalKey,
            Amount: amount,
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
            Amount: amount,
            OrderId: orderId,
            Description: description,
            Token: token
        };

        // Construct Receipt if not provided but email/phone exists
        if (receipt) {
            requestBody.Receipt = receipt;
        } else if (customerEmail || customerPhone) {
            requestBody.Receipt = {
                Email: customerEmail,
                Phone: customerPhone,
                Taxation: 'osn', // Default taxation system
                Items: [
                    {
                        Name: description,
                        Price: amount,
                        Quantity: 1,
                        Amount: amount,
                        Tax: 'none'
                    }
                ]
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
            console.error('Tinkoff API Error:', data);
            return res.status(400).json({
                success: false,
                error: data.Message || 'Payment initialization failed',
                details: data.Details
            });
        }

        return res.status(200).json({
            success: true,
            paymentUrl: data.PaymentURL,
            paymentId: data.PaymentId
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};

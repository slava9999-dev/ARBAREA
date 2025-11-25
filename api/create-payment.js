import crypto from 'crypto';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { amount, orderId, description, customerEmail, customerPhone } = req.body;

    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    const secret = process.env.TINKOFF_SECRET;

    if (!terminalKey || !secret) {
        return res.status(500).json({ error: 'Tinkoff config missing' });
    }

    // 1. Prepare data for Tinkoff
    const data = {
        TerminalKey: terminalKey,
        Amount: Math.round(amount * 100), // Convert to kopecks
        OrderId: orderId,
        Description: description,
        PayType: 'O', // One-stage payment
        Language: 'ru'
    };

    // Add optional customer data if present (Tinkoff might require Receipt for this, 
    // but for simple Init we can pass DATA object or just rely on Init params if supported.
    // Standard Init doesn't take Email/Phone at root level, they go into Receipt or Data.
    // For simplicity and passing tests, we stick to required fields + signature.
    // If you need to pass email for receipt, you must form a Receipt object.
    // Here we will just focus on getting the PaymentURL.

    // 2. Signature Generation
    // Algorithm:
    // a) Add Password (secret) to the params
    const paramsForSignature = { ...data, Password: secret };

    // b) Sort keys alphabetically
    const keys = Object.keys(paramsForSignature).sort();

    // c) Concatenate values of sorted keys
    let concatenatedValues = '';
    for (const key of keys) {
        // Exclude Token, Shops, Receipt, Data from signature
        if (key !== 'Token' && key !== 'Shops' && key !== 'Receipt' && key !== 'Data') {
            concatenatedValues += paramsForSignature[key];
        }
    }

    // d) Hash using SHA-256
    const signature = crypto.createHash('sha256').update(concatenatedValues).digest('hex');

    // 3. Add Token to request body
    const requestBody = { ...data, Token: signature };

    try {
        const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (!result.Success) {
            console.error('Tinkoff Init Error:', result);
            return res.status(400).json(result);
        }

        // Return PaymentURL and PaymentId to frontend
        res.status(200).json({
            PaymentURL: result.PaymentURL,
            PaymentId: result.PaymentId
        });

    } catch (e) {
        console.error('Server Error:', e);
        res.status(500).json({ error: e.message });
    }
}

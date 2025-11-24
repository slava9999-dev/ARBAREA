import crypto from 'crypto';
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { amount, orderId, description } = req.body;

    const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
    const secret = process.env.TINKOFF_SECRET;

    if (!terminalKey || !secret) {
        return res.status(500).json({ error: 'Tinkoff config missing' });
    }

    const data = {
        TerminalKey: terminalKey,
        Amount: Math.round(amount * 100), // Ensure integer kopecks
        OrderId: orderId,
        Description: description,
        PayType: 'O', // One-stage
        Language: 'ru'
    };

    // Signature generation
    // 1. Add Password to params
    const paramsForSignature = { ...data, Password: secret };

    // 2. Sort keys
    const keys = Object.keys(paramsForSignature).sort();

    // 3. Concatenate values
    let concatenated = '';
    for (const key of keys) {
        // Exclude specific keys from signature as per documentation (though usually only Token is excluded, 
        // but Shops, Receipt, Data might be excluded depending on implementation, 
        // sticking to standard: exclude Token. Password IS included in concatenation but not sent in body)
        if (key !== 'Token' && key !== 'Shops' && key !== 'Receipt' && key !== 'Data') {
            concatenated += paramsForSignature[key];
        }
    }

    // 4. Hash
    const signature = crypto.createHash('sha256').update(concatenated).digest('hex');

    try {
        const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, Token: signature })
        });
        const result = await response.json();

        if (!result.Success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

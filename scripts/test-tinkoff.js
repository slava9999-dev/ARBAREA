import fetch from 'node-fetch';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

const terminalKey = process.env.TINKOFF_TERMINAL_KEY;
const password = process.env.TINKOFF_PASSWORD;

async function testTinkoff() {
  console.log('--- Tinkoff Connection Test ---');
  console.log('Terminal Key:', terminalKey ? 'OK' : 'MISSING');
  console.log('Password:', password ? 'OK' : 'MISSING');

  if (!terminalKey || !password) {
    console.error('Error: TINKOFF_TERMINAL_KEY or TINKOFF_PASSWORD not found in .env');
    process.exit(1);
  }

  const orderId = `TEST-${Date.now()}`;
  const amount = 1000; // 10.00 RUB
  const description = 'Test Connection';

  const params = {
    TerminalKey: terminalKey,
    Amount: amount,
    OrderId: orderId,
    Description: description,
    Password: password,
  };

  // Generate Token (v2 standard: sort keys, concat values, sha256)
  const sortedKeys = Object.keys(params).sort();
  const concatenatedValues = sortedKeys.map(key => params[key]).join('');
  const token = crypto.createHash('sha256').update(concatenatedValues).digest('hex');

  const requestBody = {
    TerminalKey: terminalKey,
    Amount: amount,
    OrderId: orderId,
    Description: description,
    Token: token,
  };

  try {
    console.log('Sending Init request to Tinkoff...');
    const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.Success) {
      console.log('✅ Tinkoff connection successful!');
      console.log('Payment URL:', data.PaymentURL);
    } else {
      console.error('❌ Tinkoff error:', data.Message || data.Details || 'Unknown error');
      if (data.ErrorCode === '204') {
        console.error('Hint: Invalid token. This usually means the SecretKey (Password) or TerminalKey is incorrect.');
      }
    }
  } catch (error) {
    console.error('Critical Error:', error.message);
  }
}

testTinkoff();

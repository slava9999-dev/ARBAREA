export async function initPayment(orderId, amount, description, customerData) {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount,
        description,
        customerEmail: customerData?.email || '',
        customerPhone: customerData?.phone || '',
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || data.Message || 'Payment initialization failed',
      );
    }
    // API returns { Success: true, PaymentURL: '...' }
    return data.PaymentURL || data.paymentUrl;
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
}

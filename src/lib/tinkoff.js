export async function initPayment(orderId, items, description, customerData) {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        items, // ✅ Send items for server-side price calculation
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
    return data.paymentURL || data.paymentUrl;
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
}

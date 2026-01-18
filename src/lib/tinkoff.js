export async function initPayment(
  orderId,
  items,
  description,
  customerData,
  token,
  deliveryId,
  deliveryAddress,
) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        orderId,
        items, // ✅ Send items for server-side price calculation
        description,
        customerEmail: customerData?.email || '',
        customerPhone: customerData?.phone || '',
        customerName: customerData?.name || '',
        deliveryId,
        deliveryAddress,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || data.Message || 'Payment initialization failed',
      );
    }
    // API returns { success: true, paymentUrl: '...', orderId: '...' }
    return {
      paymentUrl: data.paymentURL || data.paymentUrl,
      orderId: data.orderId,
    };
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
}

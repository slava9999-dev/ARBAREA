export async function initPayment(orderId, amount, description, customerData) {
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                amount,
                description,
                customerData
            })
        });

        const data = await response.json();

        if (!data.Success && !data.paymentUrl) {
            // The new API returns Tinkoff response directly (Success: true/false) OR { error: ... }
            // My implementation returns { Success: true, PaymentURL: ... } or { Success: false, ... }
            // Let's adjust the check.
            throw new Error(data.Message || data.error || 'Payment initialization failed');
        }

        return data.PaymentURL || data.paymentUrl;
    } catch (error) {
        console.error('Payment initialization error:', error);
        throw error;
    }
}


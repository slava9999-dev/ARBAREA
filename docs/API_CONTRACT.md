# API Contract

## 1. /api/create-payment
**Method:** POST
**Description:** Initializes a payment session with Tinkoff (T-Bank).

### Request Body
```json
{
  "amount": 1000, // Number, required. Amount in RUB.
  "orderId": "ORDER-1234567890", // String, required. Unique order ID.
  "description": "Payment for Order #123", // String, required.
  "customerEmail": "user@example.com", // String, optional.
  "customerPhone": "+79990000000" // String, optional.
}
```

### Response
**Success (200 OK):**
```json
{
  "success": true,
  "paymentUrl": "https://securepay.tinkoff.ru/..." // Redirect URL
}
```

**Error (400/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 2. /api/send-telegram
**Method:** POST
**Description:** Sends a notification message to the admin Telegram chat.

### Request Body
```json
{
  "message": "<b>New Order!</b>\nDetails..." // String, required. HTML supported.
}
```

### Response
**Success (200 OK):**
```json
{
  "success": true
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error description"
}
```

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

## 2. /api/payment-webhook

**Method:** POST
**Description:** Receives status updates from Tinkoff. Not intended for client-side use.

### Request Body

Standard Tinkoff V2 Webhook notification.

---

## 3. /api/cdek

**Method:** GET
**Description:** Wrapper for CDEK services.

### Actions

- `?action=cities&query=Москва`: Search cities by name.
- `?action=points&city=44`: Get pickup points by city code (44 for Moscow).
- `?action=calculate&from=44&to=137&weight=1000`: Calculate delivery cost.

---

## 4. /api/ai-chat

**Method:** POST
**Description:** Chat with AI consultant about products.

### Request Body

```json
{
  "message": "Какие у вас есть изделия из дуба?",
  "history": []
}
```

---

## 5. /api/send-telegram

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

---

## 6. /api/health

**Method:** GET
**Description:** Basic health check.

### Response

```json
{
  "status": "ok",
  "timestamp": "2026-01-18T..."
}
```

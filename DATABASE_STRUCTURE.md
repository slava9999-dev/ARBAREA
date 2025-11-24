# 🗄️ Структура базы данных Firestore

## Коллекции

### 1. `orders` - Обычные заказы из корзины

Каждый документ представляет собой заказ клиента.

```javascript
{
  orderId: "ORDER-1700000000000",           // Уникальный ID заказа
  userId: "user_uid_from_firebase_auth",    // UID пользователя или "guest"
  userEmail: "user@example.com",            // Email клиента
  userPhone: "+79991234567",                // Телефон клиента
  userName: "Иван Иванов",                  // Имя клиента
  deliveryAddress: "г. Москва, ул. ...",    // Адрес доставки
  
  items: [                                  // Массив товаров в заказе
    {
      id: "product-123",
      name: "Деревянная полка",
      price: 5000,
      quantity: 2,
      selectedSize: "100x30",
      selectedColor: "темный дуб"
    }
  ],
  
  subtotal: 10000,                          // Сумма без скидки
  discount: 1000,                           // Скидка (10% для зарегистрированных)
  total: 9000,                              // Итоговая сумма
  
  status: "pending_payment",                // Статус заказа
  paymentUrl: "https://...",                // Ссылка на оплату Тинькофф
  
  createdAt: Timestamp,                     // Дата создания
  updatedAt: Timestamp                      // Дата последнего обновления
}
```

#### Возможные статусы заказа:
- `pending_payment` - Ожидает оплаты
- `paid` - Оплачен
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `completed` - Завершён
- `cancelled` - Отменён

---

### 2. `individual-orders` - Индивидуальные заказы

Заявки на индивидуальные изделия с прикреплёнными файлами.

```javascript
{
  orderId: "ORDER-1700000000000",           // Уникальный ID заявки
  userId: "user_uid_from_firebase_auth",    // UID пользователя
  userEmail: "user@example.com",            // Email клиента
  userPhone: "+79991234567",                // Телефон клиента
  
  description: "Деревянная полка для кухни", // Описание заказа
  dimensions: {                             // Размеры
    length: "120",
    width: "40"
  },
  details: "Массив дуба, темная морилка",   // Дополнительные детали
  
  fileUrl: "https://storage.../file.jpg",   // URL файла в Firebase Storage
  fileName: "sketch_kitchen.jpg",           // Имя файла
  
  status: "pending",                        // Статус заявки
  createdAt: Timestamp                      // Дата создания
}
```

#### Возможные статусы индивидуального заказа:
- `pending` - Ожидает рассмотрения
- `in_discussion` - Обсуждается с клиентом
- `approved` - Одобрено
- `in_production` - В производстве
- `completed` - Завершён
- `cancelled` - Отменён

---

### 3. `users/{userId}/cart` - Корзины пользователей

Подколлекция для каждого зарегистрированного пользователя.

```javascript
{
  id: "product-123-size-color",            // Уникальный ID товара в корзине
  name: "Деревянная полка",
  price: 5000,
  quantity: 2,
  selectedSize: "100x30",
  selectedColor: "темный дуб",
  updatedAt: Timestamp
}
```

---

## Правила безопасности Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Заказы
    match /orders/{orderId} {
      // Создание: любой аутентифицированный пользователь
      allow create: if request.auth != null;
      
      // Чтение: только свои заказы или гостевые
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || resource.data.userId == 'guest');
      
      // Обновление: только администраторы (добавьте проверку роли)
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Индивидуальные заказы
    match /individual-orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Корзины пользователей
    match /users/{userId}/cart/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Индексы Firestore

Для оптимальной производительности создайте следующие индексы:

### Индекс для orders
- Коллекция: `orders`
- Поля:
  - `userId` (Ascending)
  - `createdAt` (Descending)

### Индекс для individual-orders
- Коллекция: `individual-orders`
- Поля:
  - `userId` (Ascending)
  - `createdAt` (Descending)

---

## Firebase Storage структура

```
/individual-orders/{userId}/{timestamp}-{filename}
```

Пример:
```
/individual-orders/abc123def456/1700000000000-sketch_kitchen.jpg
```

### Правила безопасности Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /individual-orders/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Как обновлять статусы заказов

### Через Firebase Console
1. Откройте Firestore Database
2. Найдите коллекцию `orders`
3. Выберите нужный документ
4. Измените поле `status`
5. Обновите `updatedAt` на текущую дату

### Программно (для админ-панели)
```javascript
import { doc, updateDoc } from 'firebase/firestore';

const updateOrderStatus = async (orderId, newStatus) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: new Date()
  });
};
```

---

## Мониторинг заказов

Все заказы автоматически:
1. ✅ Сохраняются в Firestore
2. ✅ Отображаются в истории заказов пользователя
3. ✅ Обновляются в реальном времени (onSnapshot)
4. ✅ Индивидуальные заказы отправляются в Telegram

**Готово!** База данных полностью настроена и готова к использованию 🎉

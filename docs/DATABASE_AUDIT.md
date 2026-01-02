# 📊 Аудит базы данных Arbarea

**Дата аудита:** 2026-01-02  
**Версия схемы:** 1.0.0

---

## ✅ Структура таблиц

### 1. `profiles` (Пользователи)

| Колонка      | Тип         | Nullable | Default | Описание            |
| ------------ | ----------- | -------- | ------- | ------------------- |
| `id`         | uuid        | ✗        | -       | PK, FK → auth.users |
| `email`      | text        | ✓        | -       | Email пользователя  |
| `name`       | text        | ✓        | -       | Имя                 |
| `phone`      | text        | ✓        | -       | Телефон             |
| `role`       | text        | ✓        | 'user'  | Роль (user/admin)   |
| `avatar_url` | text        | ✓        | -       | URL аватара         |
| `is_public`  | boolean     | ✓        | false   | Публичный профиль   |
| `created_at` | timestamptz | ✗        | now()   | Дата создания       |
| `updated_at` | timestamptz | ✗        | now()   | Дата обновления     |

**RLS Policies:**

- `profiles_select` — пользователь видит свой профиль или публичные
- `profiles_insert` — только свой профиль
- `profiles_update` — только свой профиль
- `profiles_delete` — только свой профиль

**Индексы:**

- `idx_profiles_is_public`
- `idx_profiles_email`
- `idx_profiles_phone`

---

### 2. `products` (Каталог)

| Колонка       | Тип         | Nullable | Default           | Описание               |
| ------------- | ----------- | -------- | ----------------- | ---------------------- |
| `id`          | uuid        | ✗        | gen_random_uuid() | PK                     |
| `name`        | text        | ✗        | -                 | Название товара        |
| `slug`        | text        | ✗        | -                 | URL-slug (unique)      |
| `description` | text        | ✓        | -                 | Описание               |
| `price`       | numeric     | ✗        | -                 | Цена                   |
| `old_price`   | numeric     | ✓        | -                 | Старая цена            |
| `category`    | text        | ✓        | -                 | Категория              |
| `subcategory` | text        | ✓        | -                 | Подкатегория           |
| `images`      | jsonb       | ✓        | -                 | Массив URL изображений |
| `colors`      | jsonb       | ✓        | -                 | Доступные цвета        |
| `sizes`       | jsonb       | ✓        | -                 | Доступные размеры      |
| `in_stock`    | boolean     | ✓        | true              | В наличии              |
| `featured`    | boolean     | ✓        | false             | Рекомендуемый          |
| `created_at`  | timestamptz | ✗        | now()             | Дата создания          |
| `updated_at`  | timestamptz | ✗        | now()             | Дата обновления        |

**RLS Policies:**

- `products_select_public` — чтение для всех (anon + authenticated)
- `products_admin_mod` — CRUD только для админов

**Индексы:**

- `idx_products_slug`
- `idx_products_category`
- `idx_products_in_stock`
- `idx_products_featured`

---

### 3. `orders` (Заказы)

| Колонка            | Тип         | Nullable | Default           | Описание            |
| ------------------ | ----------- | -------- | ----------------- | ------------------- |
| `id`               | uuid        | ✗        | gen_random_uuid() | PK                  |
| `order_id`         | text        | ✗        | -                 | Публичный ID заказа |
| `user_id`          | uuid        | ✓        | -                 | FK → auth.users     |
| `user_email`       | text        | ✓        | -                 | Email покупателя    |
| `user_phone`       | text        | ✓        | -                 | Телефон             |
| `user_name`        | text        | ✓        | -                 | Имя                 |
| `items`            | jsonb       | ✗        | -                 | Товары в заказе     |
| `subtotal`         | numeric     | ✗        | -                 | Сумма товаров       |
| `shipping`         | numeric     | ✓        | 0                 | Стоимость доставки  |
| `total`            | numeric     | ✗        | -                 | Итого               |
| `delivery_method`  | text        | ✓        | -                 | Способ доставки     |
| `delivery_address` | text        | ✓        | -                 | Адрес доставки      |
| `delivery_price`   | numeric     | ✓        | -                 | Цена доставки       |
| `payment_url`      | text        | ✓        | -                 | URL оплаты          |
| `payment_id`       | text        | ✓        | -                 | ID платежа          |
| `status`           | text        | ✓        | 'pending_payment' | Статус заказа       |
| `tracking_number`  | text        | ✓        | -                 | Трек-номер          |
| `notes`            | text        | ✓        | -                 | Примечания          |
| `created_at`       | timestamptz | ✗        | now()             | Дата создания       |
| `updated_at`       | timestamptz | ✗        | now()             | Дата обновления     |

**RLS Policies:**

- `orders_select` — пользователь видит свои, админ — все
- `orders_insert` — только свои заказы
- `orders_update` — свои или админ
- `orders_delete_admin` — только админ

**Индексы:**

- `idx_orders_user_id`
- `idx_orders_order_id`
- `idx_orders_status`
- `idx_orders_user_email`
- `idx_orders_created_at`

---

### 4. `individual_orders` (Индивидуальные заказы)

| Колонка       | Тип         | Nullable | Default           | Описание                |
| ------------- | ----------- | -------- | ----------------- | ----------------------- |
| `id`          | uuid        | ✗        | gen_random_uuid() | PK                      |
| `order_id`    | text        | ✗        | -                 | Публичный ID заявки     |
| `user_id`     | uuid        | ✓        | -                 | FK → auth.users         |
| `user_email`  | text        | ✓        | -                 | Email                   |
| `user_name`   | text        | ✓        | -                 | Имя                     |
| `user_phone`  | text        | ✓        | -                 | Телефон                 |
| `description` | text        | ✗        | -                 | Описание заказа         |
| `dimensions`  | jsonb       | ✓        | -                 | Размеры {length, width} |
| `details`     | text        | ✓        | -                 | Детали и пожелания      |
| `file_url`    | text        | ✓        | -                 | URL файла/эскиза        |
| `file_name`   | text        | ✓        | -                 | Имя файла               |
| `status`      | text        | ✓        | 'pending'         | Статус заявки           |
| `notes`       | text        | ✓        | -                 | Примечания              |
| `created_at`  | timestamptz | ✗        | now()             | Дата создания           |
| `updated_at`  | timestamptz | ✗        | now()             | Дата обновления         |

**RLS Policies:**

- `ind_orders_select` — пользователь видит свои, админ — все
- `ind_orders_insert` — только свои заявки
- `ind_orders_update_admin` — только админ
- `ind_orders_delete_admin` — только админ

**Индексы:**

- `idx_ind_orders_order_id`
- `idx_ind_orders_user_id`
- `idx_ind_orders_status`
- `idx_ind_orders_created_at`

---

## ✅ Триггеры

| Триггер                 | Таблица           | Событие       | Функция               |
| ----------------------- | ----------------- | ------------- | --------------------- |
| `on_profiles_updated`   | profiles          | BEFORE UPDATE | `handle_updated_at()` |
| `on_products_updated`   | products          | BEFORE UPDATE | `handle_updated_at()` |
| `on_orders_updated`     | orders            | BEFORE UPDATE | `handle_updated_at()` |
| `on_ind_orders_updated` | individual_orders | BEFORE UPDATE | `handle_updated_at()` |
| `on_auth_user_created`  | auth.users        | AFTER INSERT  | `handle_new_user()`   |

---

## ✅ Функции

| Функция               | Назначение                  | Security           |
| --------------------- | --------------------------- | ------------------ |
| `handle_updated_at()` | Автообновление `updated_at` | REVOKE from public |
| `handle_new_user()`   | Автосоздание профиля        | SECURITY DEFINER   |

---

## ✅ Синхронизация с TypeScript

| Таблица             | supabase.ts | index.ts           | Статус           |
| ------------------- | ----------- | ------------------ | ---------------- |
| `profiles`          | ✅          | ✅ Profile         | Синхронизировано |
| `products`          | ✅          | ✅ Product         | Синхронизировано |
| `orders`            | ✅          | ✅ Order           | Синхронизировано |
| `individual_orders` | ✅          | ✅ IndividualOrder | Синхронизировано |

---

## 📁 Файлы миграций

| Файл                                         | Описание                    |
| -------------------------------------------- | --------------------------- |
| `supabase/schema.sql`                        | Полная схема (для новых БД) |
| `supabase/migrations/001_initial_schema.sql` | Начальная миграция          |
| `supabase/migrations/002_audit_log.sql`      | Аудит-логи                  |
| `supabase/migration_individual_orders.sql`   | Индивидуальные заказы       |
| `supabase/migration_storage_performance.sql` | Storage и индексы           |

---

## 🔐 Безопасность

- ✅ RLS включён на всех таблицах
- ✅ service_role обходит RLS
- ✅ Функции защищены от прямого вызова
- ✅ Индексы для оптимизации RLS-запросов
- ✅ Права выданы только authenticated

---

## 🚀 Применение миграций

```bash
# В Supabase Dashboard → SQL Editor:
# 1. Выполните supabase/migrations/001_initial_schema.sql
# 2. Или используйте CLI:
supabase db push
```

---

**Аудит завершён. Схема синхронизирована.** ✅

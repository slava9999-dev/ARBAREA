# 🔌 Интеграция API и Настройка Supabase

**URL приложения:** https://arbarea-bice.vercel.app/

---

## 📋 Список переменных окружения (Vercel)

Перейдите в **Vercel → Settings → Environment Variables** и настройте следующие переменные:

### 1️⃣ Supabase (База данных и Аутентификация) — **ОБЯЗАТЕЛЬНО**

Эти данные можно найти в Supabase Dashboard → Project Settings → API.

| Переменная                      | Описание                                    | Обязательно |
| :------------------------------ | :------------------------------------------ | :---------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL вашего проекта (Project URL)            | ✅ Да       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный ключ (anon public)                | ✅ Да       |
| `SUPABASE_URL`                  | То же самое, что и выше (для серверных API) | ✅ Да       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Секретный ключ (service_role secret)        | ✅ Да       |

> ⚠️ **ВНИМАНИЕ:** `SUPABASE_SERVICE_ROLE_KEY` дает полный доступ к БД. Никогда не используйте его на клиенте (с префиксом `NEXT_PUBLIC_`)!

### 2️⃣ Resend (Email-уведомления)

| Переменная       | Где получить                                |
| :--------------- | :------------------------------------------ |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |

### 3️⃣ Telegram Bot (Уведомления)

| Переменная           | Где получить                         |
| :------------------- | :----------------------------------- |
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID`   | ID чата администратора               |

### 4️⃣ Tinkoff (Платежи)

| Переменная             | Описание         |
| :--------------------- | :--------------- |
| `TINKOFF_TERMINAL_KEY` | ID терминала     |
| `TINKOFF_PASSWORD`     | Пароль терминала |

---

## 🛠 Настройка базы данных Supabase

Для работы магазина необходимо создать таблицы в Supabase.

1. Перейдите в **Supabase Dashboard** → **SQL Editor**.
2. Вставьте и выполните следующий SQL-скрипт:

```sql
-- 1. Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_phone TEXT,
  user_name TEXT,
  delivery_address TEXT,
  delivery_method TEXT,
  items JSONB DEFAULT '[]',
  total DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending_payment',
  payment_url TEXT,
  payment_id TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Service role full access" ON orders FOR ALL USING (auth.role() = 'service_role');

-- Включаем Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Таблица профилей (автоматически создается при регистрации)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Триггер для создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. **Настройка Storage (для загрузки файлов):**
   - Перейдите в **Storage** → **Buckets**.
   - Создайте новый публичный бакет с именем `orders` (Public bucket: Yes).

---

## 🔄 Как очистить кеш Vercel после миграции

Если после обновления возникают ошибки, попробуйте:

1. Открыть Vercel Deployment.
2. Перейти в **Settings** → **Data Cache**.
3. Нажать **Purge Everything**.
4. Сделать **Redeploy** (Redeploy with existing build cache выключен).

---

## ✅ Тестирование API

### Проверка Email

```bash
curl -X POST https://arbarea-bice.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"type":"order_created","orderId":"TEST-SUPABASE","email":"ваш@email.com","name":"Тест"}'
```

### Проверка Webhook (Supabase)

```bash
curl -X POST https://arbarea-bice.vercel.app/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{"OrderId":"TEST-123","Status":"CONFIRMED","TerminalKey":"ВАШ_KEY","Token":"INVALID_TOKEN_FOR_TEST"}'
```

_(Ожидается ответ OK, но в логах ошибка подписи, если токен не верный)_

---

**Дата обновления:** 2026-01-01 (Миграция на Supabase завершена)

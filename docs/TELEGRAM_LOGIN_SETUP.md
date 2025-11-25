# Telegram Login Integration - Setup Guide

## Шаг 1: Настройка бота в BotFather

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду: `/setdomain`
3. Выберите вашего бота из списка
4. Введите домен: `arbarea-mobile-app.vercel.app`

Это разрешит боту работать с Login Widget на вашем сайте.

## Шаг 2: Обновите компонент TelegramLoginButton

Откройте файл `src/components/features/TelegramLoginButton.jsx` и замените:
```javascript
script.setAttribute('data-telegram-login', 'YOUR_BOT_USERNAME');
```

На:
```javascript
script.setAttribute('data-telegram-login', 'ваш_бот_username'); // Например: arbarea_bot
```

## Шаг 3: Добавьте переменные окружения

Убедитесь, что в `.env` есть:
```env
TELEGRAM_BOT_TOKEN=ваш_bot_token
```

И добавьте этот же ключ в **Vercel** -> Settings -> Environment Variables:
- Key: `TELEGRAM_BOT_TOKEN`
- Value: ваш токен

## Шаг 4: Деплой

```bash
git add .
git commit -m "feat: add telegram login integration"
git push
```

## Как это работает:

1. Пользователь нажимает кнопку "Login with Telegram" (виджет от Telegram)
2. Telegram открывает окно авторизации
3. После подтверждения Telegram отправляет данные пользователя в приложение
4. Приложение отправляет эти данные на `/api/telegram-auth` для проверки
5. Сервер проверяет подпись данных (защита от подделки)
6. Сервер создает Firebase Custom Token
7. Пользователь входит в Firebase с этим токеном

## Безопасность:

- Данные от Telegram проверяются криптографической подписью (HMAC-SHA256)
- Проверяется время создания данных (не старше 5 минут)
- Firebase Custom Token создается только после успешной проверки

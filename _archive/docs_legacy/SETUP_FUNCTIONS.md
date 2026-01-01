# 🔧 Настройка Firebase Functions

## Проблема

При попытке деплоя функций возникает ошибка: `missing required API cloudfunctions.googleapis.com`

## Решение

### Шаг 1: Включить Cloud Functions API

Перейдите по ссылке и включите API:
**https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=arbarea-app**

Или выполните команду:

```bash
gcloud services enable cloudfunctions.googleapis.com --project=arbarea-app
```

### Шаг 2: Включить Cloud Build API (тоже необходим)

**https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=arbarea-app**

Или:

```bash
gcloud services enable cloudbuild.googleapis.com --project=arbarea-app
```

### Шаг 3: Задеплоить функции

После включения API выполните:

```bash
firebase deploy --only functions
```

## Что уже настроено

✅ Telegram ключи установлены:

- `telegram.bot_token` = `7816394327:AAH5_iBoIoD7iRFnPhJkw26Ec15169ad57`
- `telegram.chat_id` = `1018895991`

✅ Функции готовы к работе:

- `/api/send-telegram` - отправка уведомлений в Telegram
- `/api/init-payment` - инициализация оплаты через Тинькофф (когда подключите ключи)

## Проверка работы

После деплоя функций проверьте:

```bash
curl https://us-central1-arbarea-app.cloudfunctions.net/api/health
```

Должен вернуть:

```json
{
  "status": "ok",
  "telegram": "configured",
  "tinkoff": "not configured"
}
```

## Что делать дальше

1. Включите API (шаги 1-2)
2. Задеплойте функции (шаг 3)
3. Проверьте работу через health endpoint
4. Попробуйте сделать тестовый заказ в приложении

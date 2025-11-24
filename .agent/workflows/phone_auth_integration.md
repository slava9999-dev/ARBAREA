---
description: Интеграция аутентификации по телефону в приложение arbarea-app
---

# Цель
Добавить возможность регистрации и входа пользователей в веб‑приложение **arbarea‑app** с использованием номера телефона и SMS‑кода, используя **Firebase Authentication** (Identity Platform).

# Предпосылки
- Проект Firebase **arbarea‑app** уже создан и развернут.
- В консоли Firebase включён провайдер **Phone** (Sign‑in method → Phone = enabled).
- В проекте уже есть инициализация Firebase (файл `src/lib/firebase.js` или аналогичный).
- Приложение построено на **React + Vite** (JavaScript/TypeScript).

# Шаги для выполнения

## 1. Проверка включения метода входа по телефону
1. Открыть консоль Firebase → **Authentication → Sign‑in method**.
2. Убедиться, что провайдер **Phone** включён (`Phone Sign‑in Enabled: true`).
3. При необходимости включить и сохранить.

## 2. Интеграция reCAPTCHA‑верификатора
1. **HTML** – добавить контейнер для reCAPTCHA, например в `index.html` или в корневой компонент:
   ```html
   <div id="recaptcha-container"></div>
   ```
2. **React‑компонент** (например `PhoneAuth.jsx`):
   ```js
   import { getAuth, RecaptchaVerifier } from "firebase/auth";
   const auth = getAuth();
   const appVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
     size: "invisible", // скрытый reCAPTCHA
     callback: (response) => {
       // reCAPTCHA решён, можно отправлять SMS
     },
     "expired-callback": () => {
       // reCAPTCHA истёк, нужно пересоздать
     },
   });
   ```
3. Убедиться, что `appVerifier.render()` вызывается один раз (например в `useEffect`).

## 3. Отправка кода верификации (SMS)
1. Пользователь вводит номер телефона (в формате `+7XXXXXXXXXX`).
2. При нажатии **«Отправить код»** вызываем:
   ```js
   import { signInWithPhoneNumber } from "firebase/auth";
   let confirmationResult = null;
   const sendVerificationCode = async (phoneNumber) => {
     try {
       confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
       // показать UI для ввода кода
     } catch (error) {
       // обработка ошибок (некорректный номер, лимит SMS, reCAPTCHA и т.д.)
       console.error(error);
     }
   };
   ```
3. Сохранить `confirmationResult` (например в `useRef` или `useState`).

## 4. Подтверждение кода и вход пользователя
1. Пользователь вводит полученный SMS‑код.
2. При нажатии **«Подтвердить»** вызываем:
   ```js
   const verifyCodeAndSignIn = async (code) => {
     if (!confirmationResult) {
       console.error("Сначала отправьте код");
       return;
     }
     try {
       const userCredential = await confirmationResult.confirm(code);
       const user = userCredential.user;
       // пользователь успешно аутентифицирован
       console.log("User signed in", user);
       // перенаправить или обновить UI
     } catch (error) {
       console.error("Неверный код", error);
       // показать сообщение об ошибке
     }
   };
   ```

## 5. UI‑компонент
Создать React‑компонент `PhoneAuth.jsx` со следующей структурой:
- Поле ввода номера телефона.
- Кнопка **«Отправить код»** (вызывает `sendVerificationCode`).
- После отправки – поле ввода кода и кнопка **«Подтвердить»**.
- Индикация статуса (loading, ошибки, таймер повторной отправки).
- Использовать уже созданные UI‑компоненты `Input` и `Button` из `src/components/ui/`.

## 6. Тестирование
| Сценарий | Ожидаемый результат |
|----------|----------------------|
| Ввод корректного номера → отправка SMS | Пользователь получает SMS, UI переходит к вводу кода |
| Ввод некорректного номера | Показать ошибку формата номера |
| reCAPTCHA не решён/истёк | Показать сообщение и повторно инициализировать verifier |
| Ввод неверного кода | Показать ошибку «Неверный код» |
| Повторная отправка кода (по таймеру) | Снова отправляется SMS, `confirmationResult` обновляется |

## 7. Деплой и проверка продакшн‑версии
1. Убедиться, что в `firebase.json` включён `authDomain` и `public`‑директория.
2. Выполнить `npm run build` и разместить сборку на хостинге (Firebase Hosting, Vercel, Netlify).
3. Протестировать телефонную аутентификацию в продакшн‑окружении (SMS‑сообщения могут отличаться от тест‑режима).

# Дополнительные рекомендации
- При разработке использовать **Firebase Auth test phone numbers** (например `+1 555‑555‑5555`) чтобы не тратить реальные SMS.
- Ограничить количество запросов к `signInWithPhoneNumber` (добавить таймер/кулдаун).
- Хранить токен пользователя в контексте (например `AuthContext`) и использовать `onAuthStateChanged` для синхронизации UI.
- При необходимости добавить **логирование** в консоль/сервис аналитики.

---

*Этот документ можно разместить в `.agent/workflows/phone_auth_integration.md` и использовать как задачу для автоматизированного агента.*

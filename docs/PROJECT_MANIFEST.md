# PROJECT MANIFEST: Arbarea Mobile App (PWA)

## 1. Tech Stack Lock
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS (Vanilla CSS for custom animations)
- **Backend (API):** Vercel Serverless Functions (Node.js) located in `/api`
- **Database & Auth:** Firebase (Client SDK only in `src/`)
- **Payments:** Tinkoff (T-Bank) Integration
- **Notifications:** Telegram Bot API

## 2. Critical Rules
### Architecture & Structure
- **DO NOT DELETE OR RENAME** the `/api` directory. It maps directly to Vercel Serverless Functions.
- **DO NOT USE** Firebase Admin SDK inside `src/`. It is for server-side use only.
- **DO NOT MODIFY** `vercel.json` rewrites without understanding the SPA routing implications.

### Environment Variables
- **Client-side (Vite):** Must start with `VITE_` and be accessed via `import.meta.env.VITE_VARIABLE_NAME`.
- **Server-side (Node.js/Vercel):** Accessed via `process.env.VARIABLE_NAME`.
- **Security:** NEVER expose server secrets (Telegram Token, Tinkoff Secret) in client-side code.

## 3. Style Guide
- **Framework:** Tailwind CSS.
- **Aesthetics:** Glassmorphism (`backdrop-blur-md`, `bg-white/90`, `dark:bg-stone-900/90`).
- **Colors:** Natural tones (Stone, Amber, Green).
- **Typography:** Serif for headings, Sans-serif for UI text.

## 4. File Map & Responsibilities
### Critical Configuration
- `vercel.json`: Routing configuration for SPA and API rewrites.
- `vite.config.js`: Build configuration, proxy setup for local dev (`/api` -> `localhost:4000`).
- `package.json`: Dependencies and scripts.

### Backend (Vercel Functions)
- `api/create-payment.js`: Handles Tinkoff payment initialization.
- `api/telegram-notify.js`: Sends notifications to Telegram.
- `api/gemini-chat.js`: AI Assistant backend.

### Frontend Core
- `src/main.jsx`: Entry point.
- `src/App.jsx`: Main routing and layout.
- `src/lib/firebase.js`: Firebase initialization.
- `src/context/AuthContext.jsx`: Auth state.
- `src/context/CartContext.jsx`: Cart state.

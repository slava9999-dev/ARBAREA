import os

# Название папки проекта
PROJECT_NAME = "arbarea-mobile-app"

# Структура файлов и их содержимое
files = {
    "package.json": """{
  "name": "arbarea-mobile-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0",
    "framer-motion": "^11.0.8"
  },
  "devDependencies": {
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.4"
  }
}""",

    "vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  }
})""",

    "index.html": """<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#F5F5F4" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Arbarea | Столярная мастерская</title>
    <link rel="manifest" href="/manifest.json">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>""",

    "public/manifest.json": """{
  "name": "Arbarea Workshop",
  "short_name": "Arbarea",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F5F4",
  "theme_color": "#292524",
  "orientation": "portrait",
  "icons": [
    {
      "src": "https://via.placeholder.com/192/292524/FFFFFF?text=A", 
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://via.placeholder.com/512/292524/FFFFFF?text=Arbarea", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}""",

    "src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)""",

    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d6d3d1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a29e;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}

@keyframes scale-up {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-up {
  animation: scale-up 0.3s ease-out;
}

@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); }
}
.animate-bounce-short {
  animation: bounce-short 0.5s ease-in-out;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}""",

    "postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}""",

    "tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}""",

    "src/App.jsx": """import React from 'react';

function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-stone-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Arbarea Mobile App</h1>
        <p className="text-stone-600">Проект успешно создан!</p>
      </div>
    </div>
  );
}

export default App;"""
}

def create_project():
    # 1. Создаем главную папку
    if not os.path.exists(PROJECT_NAME):
        os.makedirs(PROJECT_NAME)
        print(f"Создана папка проекта: {PROJECT_NAME}")

    # 2. Создаем структуру и файлы
    for filepath, content in files.items():
        full_path = os.path.join(PROJECT_NAME, filepath)
        
        # Создаем подпапки, если нужно (например, src/ или public/)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Создан файл: {filepath}")

    print("\n" + "="*50)
    print(f"Готово! Проект создан в папке '{PROJECT_NAME}'")
    print("="*50)
    print("ИНСТРУКЦИЯ ПО ЗАПУСКУ:")
    print(f"1. Зайдите в папку: cd {PROJECT_NAME}")
    print("2. Установите зависимости: npm install")
    print("3. Запустите проект: npm run dev")

if __name__ == "__main__":
    create_project()

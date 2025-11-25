import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

console.log('\n🔍 ЗАПУСК КОМПЛЕКСНОЙ ДИАГНОСТИКИ ARBAREA...\n');

const checks = {
    env: {},
    files: {},
    firebase: {}
};

// 1. CHECK ENVIRONMENT VARIABLES
console.log('1️⃣  ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ (.env):');
const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'GEMINI_API_KEY',
    'TINKOFF_TERMINAL_KEY',
    'TINKOFF_PASSWORD'
];

let envErrors = 0;
requiredKeys.forEach(key => {
    const value = process.env[key];
    const exists = !!value;
    const length = value ? value.length : 0;

    if (exists) {
        console.log(`   ✅ ${key}: Установлен (${length} симв.)`);
    } else {
        console.log(`   ❌ ${key}: ОТСУТСТВУЕТ`);
        envErrors++;
    }
});

if (envErrors > 0) {
    console.log(`\n   ⚠️  КРИТИЧЕСКАЯ ОШИБКА: Не хватает ${envErrors} ключей. Функции работать не будут.\n`);
} else {
    console.log('\n   ✅ Все ключи на месте.\n');
}

// 2. CHECK CRITICAL FILES
console.log('2️⃣  ПРОВЕРКА ФАЙЛОВ ПРОЕКТА:');
const criticalFiles = [
    'src/lib/firebase.js',
    'src/context/AuthContext.jsx',
    'src/context/CartContext.jsx',
    'api/create-payment.js',
    'api/gemini-chat.js',
    'service-account.json' // Optional but good for tests
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}: Найден`);
    } else {
        console.log(`   ❌ ${file}: НЕ НАЙДЕН`);
    }
});

// 3. CHECK API CONFIG
console.log('\n3️⃣  ПРОВЕРКА API ENDPOINTS:');
// Check if api/gemini-chat.js has the fix
const geminiContent = fs.readFileSync('api/gemini-chat.js', 'utf8');
if (geminiContent.includes('node-fetch') && !geminiContent.includes('// import fetch')) {
    console.log('   ⚠️  api/gemini-chat.js: Использует node-fetch (может вызвать ошибку на Vercel)');
} else {
    console.log('   ✅ api/gemini-chat.js: Исправлен (использует нативный fetch)');
}

// Check server path
const serverContent = fs.readFileSync('server/index.js', 'utf8');
if (serverContent.includes('/api/create-payment')) {
    console.log('   ✅ server/index.js: Путь синхронизирован (/api/create-payment)');
} else {
    console.log('   ❌ server/index.js: Неверный путь (нужен /api/create-payment)');
}

console.log('\n🏁 ДИАГНОСТИКА ЗАВЕРШЕНА.');

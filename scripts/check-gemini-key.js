import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env vars explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const key = process.env.GEMINI_API_KEY;

console.log('--- ПРОВЕРКА КЛЮЧЕЙ ---');

if (key) {
    console.log(`✅ GEMINI_API_KEY найден! Начало: ${key.substring(0, 4)}...`);
} else {
    console.log('❌ GEMINI_API_KEY не найден в process.env');

    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            console.log('📄 Файл .env существует.');
            const envContent = fs.readFileSync(envPath, 'utf8');
            console.log('🔑 Ключи в файле:');
            envContent.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [k] = trimmed.split('=');
                    if (k) console.log(`   - ${k.trim()}`);
                }
            });
        } else {
            console.log('❌ Файл .env НЕ НАЙДЕН в корне проекта.');
        }
    } catch (e) {
        console.log('❌ Ошибка чтения .env:', e.message);
    }
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(process.cwd(), '.env');

console.log('🔍 Validating Environment Variables...');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file NOT FOUND at ' + envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
    }
});

const REQUIRED_KEYS = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'TINKOFF_TERMINAL_KEY',
    'TINKOFF_PASSWORD',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'GEMINI_API_KEY'
];

let hasError = false;

REQUIRED_KEYS.forEach(key => {
    if (!envVars[key]) {
        console.error(`❌ MISSING: ${key}`);
        hasError = true;
    } else if (envVars[key].length < 2) { // Basic check for empty/short values
        console.error(`⚠️  WARNING: ${key} seems too short or empty.`);
        hasError = true;
    } else {
        console.log(`✅ FOUND: ${key}`);
    }
});

if (hasError) {
    console.log('\n❌ Environment validation FAILED. Please update your .env file.');
    process.exit(1);
} else {
    console.log('\n✅ Environment validation PASSED. All keys are present.');
    process.exit(0);
}

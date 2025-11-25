import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CRITICAL_FILES = [
    '.env',
    'vercel.json',
    'src/lib/firebase.js',
    'api/create-payment.js'
];

console.log('🔍 Starting Integrity Check...');

let hasError = false;

// 1. Existence Check
console.log('\n📂 Checking Critical Files...');
CRITICAL_FILES.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ MISSING FILE: ${file}`);
        hasError = true;
    } else {
        console.log(`✅ Found: ${file}`);
    }
});

// 2. Content Sanity Check
console.log('\n🧠 Performing Sanity Checks...');

// Check vite.config.js for alias
try {
    const viteConfig = fs.readFileSync(path.join(process.cwd(), 'vite.config.js'), 'utf8');
    if (!viteConfig.includes("alias:") || !viteConfig.includes("'@':")) {
        console.error('❌ vite.config.js: Missing alias configuration for "@".');
        hasError = true;
    } else {
        console.log('✅ vite.config.js: Alias configuration found.');
    }
} catch (e) {
    console.error('❌ vite.config.js: Read error.');
    hasError = true;
}

// Check src/lib/firebase.js exports
try {
    const firebaseContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/firebase.js'), 'utf8');
    if (!firebaseContent.includes('export const db') || !firebaseContent.includes('export const auth')) {
        console.error('❌ src/lib/firebase.js: Must export "db" and "auth".');
        hasError = true;
    } else {
        console.log('✅ src/lib/firebase.js: Exports verified.');
    }
} catch (e) {
    console.error('❌ src/lib/firebase.js: Read error.');
    hasError = true;
}

console.log('\n-----------------------------------');
if (hasError) {
    console.error('❌ CRITICAL ERROR: Integrity Check Failed. Fix the issues above.');
    process.exit(1);
} else {
    console.log('✅ INTEGRITY PASSED: Project structure is stable.');
    process.exit(0);
}

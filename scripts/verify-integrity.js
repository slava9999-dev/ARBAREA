import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

const CRITICAL_FILES = [
    '.env',
    'vercel.json',
    'src/lib/supabase.js',
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
        // Checking for different quote styles commonly used in vite configs
        if (!viteConfig.includes("'@':") && !viteConfig.includes('"@":') && !viteConfig.includes("@:")) {
           console.error('❌ vite.config.js: Missing alias configuration for "@".');
           hasError = true;
        } else {
           console.log('✅ vite.config.js: Alias configuration found.');
        }
    } else {
        console.log('✅ vite.config.js: Alias configuration found.');
    }
} catch (e) {
    console.error('❌ vite.config.js: Read error.');
    hasError = true;
}

// Check src/lib/supabase.js exports
try {
    const supabaseContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/supabase.js'), 'utf8');
    if (!supabaseContent.includes('export const supabase')) {
        console.error('❌ src/lib/supabase.js: Must export "supabase".');
        hasError = true;
    } else {
        console.log('✅ src/lib/supabase.js: Exports verified.');
    }
} catch (e) {
    console.error('❌ src/lib/supabase.js: Read error.');
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

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Load .env manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

console.log('🔍 Checking Environment Configuration...');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file NOT FOUND at ' + envPath);
  console.error('👉 Please copy .env.example to .env and fill in your Supabase credentials.');
  process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
const warnings = [];
const errors = [];

// Check URL
const url = envConfig.VITE_SUPABASE_URL;
if (!url) {
  errors.push('❌ VITE_SUPABASE_URL is missing');
} else if (!url.startsWith('https://')) {
  errors.push(`❌ VITE_SUPABASE_URL does not start with https:// (${url})`);
} else {
  console.log('✅ VITE_SUPABASE_URL looks valid');
}

// Check Key
const key = envConfig.VITE_SUPABASE_ANON_KEY;
if (!key) {
  errors.push('❌ VITE_SUPABASE_ANON_KEY is missing');
} else if (key.length < 20) {
  errors.push('⚠️ VITE_SUPABASE_ANON_KEY seems too short');
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY found');
}

// Check Service Role (Optional but good for API)
const serviceRole = envConfig.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRole && envConfig.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('⚠️ Found VITE_SUPABASE_SERVICE_ROLE_KEY but usually server needs SUPABASE_SERVICE_ROLE_KEY');
} else if (serviceRole) {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY found');
} else {
    warnings.push('⚠️ SUPABASE_SERVICE_ROLE_KEY missing (Payments/Admin API might fail in dev)');
}

console.log('\n--- REPORT ---');
if (errors.length > 0) {
  errors.forEach(e => console.error(e));
  console.log('\n🔴 CRITICAL: App will NOT work. Please fix .env');
} else {
  console.log('🟢 Client Configuration looks good.');
}

if (warnings.length > 0) {
    warnings.forEach(w => console.warn(w));
}

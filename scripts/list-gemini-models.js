import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ API Key not found in .env (checked GEMINI_API_KEY and VITE_GEMINI_API_KEY)');
    process.exit(1);
}

console.log(`🔑 Using API Key: ${apiKey.substring(0, 4)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('📡 Querying Google API...');

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error('❌ API Error:', JSON.stringify(data.error, null, 2));
            if (data.error.code === 404) {
                console.log('\n💡 Совет: Возможно, API не включен в Google Cloud Console.');
            }
        } else if (data.models) {
            console.log('\n✅ Available Models:');
            data.models.forEach(model => {
                if (model.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`   - ${model.name} (${model.displayName})`);
                }
            });
        } else {
            console.log('❓ Unexpected response:', data);
        }
    })
    .catch(err => {
        console.error('❌ Network Error:', err.message);
    });

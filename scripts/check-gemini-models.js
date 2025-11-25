import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY or VITE_GEMINI_API_KEY not found in .env');
  process.exit(1);
}

console.log(`🔑 Checking models for API Key: ${apiKey.substring(0, 5)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

try {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    console.error('❌ API Error:', data);
    process.exit(1);
  }

  console.log('✅ Available Models:');
  if (data.models) {
    data.models.forEach(model => {
      // Filter for Gemini models to keep output clean, but show all if needed
      if (model.name.includes('gemini')) {
         console.log(`\n📦 ${model.name}`);
         console.log(`   Display Name: ${model.displayName}`);
         console.log(`   Description: ${model.description.substring(0, 100)}...`);
      }
    });
  } else {
    console.log('No models found.');
  }

} catch (error) {
  console.error('❌ Network Error:', error.message);
}

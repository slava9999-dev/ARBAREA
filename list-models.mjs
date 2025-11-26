// Проверка доступных моделей
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

console.log('📋 Получаю список доступных моделей Gemini...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

try {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Ошибка:', data);
    process.exit(1);
  }

  console.log('✅ Доступные модели для generateContent:\n');
  
  data.models?.forEach(model => {
    if (model.supportedGenerationMethods?.includes('generateContent')) {
      console.log(`  ✓ ${model.name}`);
      console.log(`    Описание: ${model.displayName}`);
      console.log('');
    }
  });

} catch (error) {
  console.error('❌ Ошибка:', error.message);
}

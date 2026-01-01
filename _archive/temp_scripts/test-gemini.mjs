// Простой тест Gemini API ключа
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

console.log('🔍 Проверка API ключа Gemini...\n');

if (!apiKey) {
  console.error('❌ API ключ не найден в .env файле!');
  console.log('Проверьте наличие GEMINI_API_KEY или VITE_GEMINI_API_KEY');
  process.exit(1);
}

console.log(`✅ Ключ найден: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('📡 Отправляю тестовый запрос к Gemini API...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: 'Привет! Ответь одним словом: работает?' }]
      }]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Ошибка API:');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (text) {
    console.log('✅ УСПЕХ! Gemini ответил:');
    console.log(`📝 "${text}"`);
    console.log('\n✨ API ключ работает отлично!\n');
  } else {
    console.error('❌ Ответ пришел, но без текста:', data);
  }

} catch (error) {
  console.error('❌ Ошибка сети:', error.message);
  process.exit(1);
}

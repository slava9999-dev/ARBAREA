/**
 * Генерация скриншота для PWA манифеста
 * В реальном проекте используйте реальный скриншот приложения
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

async function generatePlaceholderScreenshot() {
  console.log('📸 Генерация placeholder скриншота...\n');

  // Создаем папку если нет
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Создаем placeholder скриншот 390x844 (iPhone 14 размер)
  const width = 390;
  const height = 844;

  // Создаем SVG для скриншота
  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1c1917;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#292524;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Logo -->
      <text x="50%" y="35%" font-family="Georgia, serif" font-size="72" fill="#d97706" text-anchor="middle" font-weight="bold">
        Arbarea
      </text>
      
      <!-- Tagline -->
      <text x="50%" y="42%" font-family="Arial, sans-serif" font-size="16" fill="#a8a29e" text-anchor="middle">
        Эстетика, к которой хочется прикоснуться
      </text>
      
      <!-- Product cards placeholder -->
      <rect x="20" y="400" width="165" height="200" rx="12" fill="#292524" stroke="#3f3f46" stroke-width="1"/>
      <rect x="205" y="400" width="165" height="200" rx="12" fill="#292524" stroke="#3f3f46" stroke-width="1"/>
      
      <!-- Bottom nav -->
      <rect x="0" y="764" width="${width}" height="80" fill="#1c1917"/>
      <circle cx="78" cy="804" r="20" fill="#292524"/>
      <circle cx="156" cy="804" r="20" fill="#292524"/>
      <circle cx="234" cy="804" r="20" fill="#d97706"/>
      <circle cx="312" cy="804" r="20" fill="#292524"/>
    </svg>
  `;

  try {
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(path.join(SCREENSHOTS_DIR, 'screenshot-mobile.png'));
    
    console.log('✅ screenshot-mobile.png создан');
    console.log('\n💡 Совет: замените этот placeholder на реальный скриншот приложения!');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

generatePlaceholderScreenshot().catch(console.error);

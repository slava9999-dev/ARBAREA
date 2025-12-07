/**
 * Генерация PWA иконок из Master PNG (Premium Design)
 * Запуск: node scripts/generate-pwa-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Используем новый премиум-исходник
const MASTER_SOURCE = path.join(__dirname, '../public/icon-master.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Размеры иконок для PWA
const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' }, // iOS Main
  { size: 192, name: 'icon-192x192.png' },             // Android Home
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },             // Play Store / Splash
];

// Apple Touch Icons (дополнительные)
const APPLE_ICONS = [
  { size: 152, name: 'apple-touch-icon-152x152.png' }, // iPad
];

async function generateIcons() {
  console.log('🎨 Генерация PWA иконок из Premium Source...\n');

  if (!fs.existsSync(MASTER_SOURCE)) {
    console.error('❌ Исходный файл не найден:', MASTER_SOURCE);
    process.exit(1);
  }

  // Создаем папку icons
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const masterBuffer = fs.readFileSync(MASTER_SOURCE);

  // 1. Генерируем стандартные квадратные иконки (для iOS и Android)
  // Sharp по умолчанию использует lanczos3 для качественного ресайза
  for (const { size, name } of [...ICON_SIZES, ...APPLE_ICONS]) {
    try {
      await sharp(masterBuffer)
        .resize(size, size, {
          fit: 'cover', // Заполнить квадрат
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(path.join(ICONS_DIR, name));
      
      console.log(`✅ ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Ошибка создания ${name}:`, error.message);
    }
  }

  // 2. Генерируем Maskable Icon (специально для Android Adaptive Icons)
  // Нам нужно убедиться, что важная часть (лого) в центре и есть "поля" (padding)
  // DALL-E обычно генерирует "полную" картинку.
  // Для maskable мы добавим бордюр (padding) того же цвета или просто заресайзим, если лого по центру.
  // Самый безопасный способ для maskable из готовой квадратной иконки - добавить 10% padding цвета фона.
  // Но так как у нас текстурный фон, padding одним цветом будет виден.
  // Поэтому лучше просто использовать ту же иконку 512x512 как maskable.
  // Android сам обрежет края. Если логотип в центре, все будет ОК.
  
  try {
    const maskableName = 'maskable-icon-512x512.png';
    await sharp(masterBuffer)
      .resize(512, 512, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(path.join(ICONS_DIR, maskableName));

    console.log(`✅ ${maskableName} (Android Adaptive)`);
  } catch (error) {
    console.error('❌ Ошибка maskable:', error.message);
  }

  // 3. Обновляем favicon.svg или .ico (опционально, но полезно)
  // Для веба лучше оставить SVG если он есть, но для единообразия можно сделать 32x32 png
  // await sharp(masterBuffer).resize(32, 32).toFile(path.join(__dirname, '../public/favicon.ico'));

  console.log('\n🎉 Новые премиум-иконки готовы!');
}

generateIcons().catch(console.error);

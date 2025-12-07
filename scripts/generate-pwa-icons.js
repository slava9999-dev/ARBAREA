/**
 * Генерация PWA иконок из SVG
 * Запуск: node scripts/generate-pwa-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_SOURCE = path.join(__dirname, '../public/icon.svg');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Размеры иконок для PWA
const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Apple Touch Icons
const APPLE_ICONS = [
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
];

async function generateIcons() {
  console.log('🎨 Генерация PWA иконок...\n');

  // Проверяем существование SVG
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error('❌ SVG файл не найден:', SVG_SOURCE);
    process.exit(1);
  }

  // Читаем SVG
  const svgBuffer = fs.readFileSync(SVG_SOURCE);

  // Создаем папку icons если её нет
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Генерируем стандартные иконки
  for (const { size, name } of ICON_SIZES) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(ICONS_DIR, name));
      console.log(`✅ ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Ошибка создания ${name}:`, error.message);
    }
  }

  // Генерируем Apple Touch Icons
  for (const { size, name } of APPLE_ICONS) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(ICONS_DIR, name));
      console.log(`✅ ${name} (Apple Touch)`);
    } catch (error) {
      console.error(`❌ Ошибка создания ${name}:`, error.message);
    }
  }

  // Генерируем Maskable иконку (с отступами для safe area)
  try {
    // Для maskable иконки нужен отступ ~20% по краям
    const maskableSize = 512;
    const iconSize = Math.floor(maskableSize * 0.8); // 80% от размера
    const offset = Math.floor((maskableSize - iconSize) / 2);

    // Создаем фоновый слой
    const background = await sharp({
      create: {
        width: maskableSize,
        height: maskableSize,
        channels: 4,
        background: { r: 28, g: 25, b: 23, alpha: 1 } // #1c1917
      }
    }).png().toBuffer();

    // Ресайзим иконку
    const iconBuffer = await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    // Комбинируем
    await sharp(background)
      .composite([{
        input: iconBuffer,
        top: offset,
        left: offset
      }])
      .png()
      .toFile(path.join(ICONS_DIR, 'maskable-icon-512x512.png'));
    
    console.log(`✅ maskable-icon-512x512.png (для Android)`);
  } catch (error) {
    console.error('❌ Ошибка создания maskable иконки:', error.message);
  }

  console.log('\n🎉 Все иконки сгенерированы!');
  console.log(`📁 Папка: ${ICONS_DIR}`);
}

generateIcons().catch(console.error);

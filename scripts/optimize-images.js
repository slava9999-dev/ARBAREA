import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const INPUT_DIR = path.join(__dirname, '../raw_images');
const OUTPUT_DIR = path.join(__dirname, '../public/images/products');
const MAX_WIDTH = 1200; // Оптимально для мобильных и десктопов
const QUALITY = 80; // Баланс качества и размера

// Создаем папки, если их нет
if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR);
    console.log(`📁 Создана папка для исходников: ${INPUT_DIR}`);
    console.log('👉 Положите ваши фото (JPG, PNG) в эту папку!');
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Создана папка для готовых фото: ${OUTPUT_DIR}`);
}

async function processImages() {
    try {
        const files = fs.readdirSync(INPUT_DIR);
        const images = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

        if (images.length === 0) {
            console.log('⚠️ В папке raw_images нет изображений.');
            return;
        }

        console.log(`🚀 Найдено изображений: ${images.length}. Начинаем оптимизацию...`);

        for (const file of images) {
            const inputPath = path.join(INPUT_DIR, file);
            const fileName = path.parse(file).name;
            const outputPath = path.join(OUTPUT_DIR, `${fileName}.webp`);

            await sharp(inputPath)
                .resize(MAX_WIDTH, null, { // Сохраняем пропорции
                    withoutEnlargement: true // Не увеличиваем, если исходник меньше
                })
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            console.log(`✅ Готово: ${file} -> ${fileName}.webp`);
        }

        console.log('🎉 Все изображения оптимизированы!');
    } catch (error) {
        console.error('❌ Ошибка при обработке:', error);
    }
}

processImages();

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация
const INPUT_DIR = path.join(__dirname, '../raw_images/ГАЛЕРЕЯ'); 
const OUTPUT_DIR = path.join(__dirname, '../public/images/gallery');
const MAX_WIDTH = 1600; // Для галереи можно чуть больше качество
const QUALITY = 85;

// Создаем папки, если их нет
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Создана папка для готовых фото: ${OUTPUT_DIR}`);
}

async function processImages() {
    // Проверяем, есть ли папка
    let inputDir = INPUT_DIR;
    if (!fs.existsSync(INPUT_DIR)) {
         console.log(`⚠️ Не найдена папка с фото: ${INPUT_DIR}`);
         // Попробуем альтернативные пути, если вдруг кодировка подвела или папка в корне
         const altPath = path.join(__dirname, '../ГАЛЕРЕЯ');
         if (fs.existsSync(altPath)) {
             inputDir = altPath;
             console.log(`👍 Нашли папку в корне: ${altPath}`);
         } else {
             return;
         }
    }

    try {
        const files = fs.readdirSync(inputDir);
        const images = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

        if (images.length === 0) {
            console.log('⚠️ В папке нет изображений.');
            return;
        }

        console.log(`🚀 Найдено изображений: ${images.length}. Начинаем оптимизацию для галереи...`);

        const optimizedImages = [];

        for (const file of images) {
            const inputPath = path.join(inputDir, file);
            const fileName = path.parse(file).name;
            const outputPath = path.join(OUTPUT_DIR, `${fileName}.webp`);

            await sharp(inputPath)
                .resize(MAX_WIDTH, null, { 
                    withoutEnlargement: true 
                })
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            console.log(`✅ Готово: ${file} -> ${fileName}.webp`);
            optimizedImages.push(`/images/gallery/${fileName}.webp`);
        }

        console.log('🎉 Все изображения галереи оптимизированы!');
        console.log('📋 Список путей для вставки в код:');
        console.log(JSON.stringify(optimizedImages, null, 2));

    } catch (error) {
        console.error('❌ Ошибка при обработке:', error);
    }
}

processImages();

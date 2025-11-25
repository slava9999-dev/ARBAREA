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

// Рекурсивная функция для поиска файлов
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

async function processImages() {
    try {
        const allFiles = getAllFiles(INPUT_DIR);
        const images = allFiles.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

        if (images.length === 0) {
            console.log('⚠️ В папке raw_images и её подпапках нет изображений.');
            return;
        }

        console.log(`🚀 Найдено изображений: ${images.length}. Начинаем оптимизацию...`);

        for (const inputPath of images) {
            const fileName = path.parse(inputPath).name;
            // Сохраняем все в одну плоскую папку public/images/products, 
            // так как у нас в products.js пути прописаны плоско.
            // Если нужно сохранять структуру папок, логику нужно усложнить.
            // Но пока для простоты и совместимости с products.js - плоская структура.
            const outputPath = path.join(OUTPUT_DIR, `${fileName}.webp`);

            await sharp(inputPath)
                .resize(MAX_WIDTH, null, { // Сохраняем пропорции
                    withoutEnlargement: true // Не увеличиваем, если исходник меньше
                })
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            console.log(`✅ Готово: ${path.basename(inputPath)} -> ${fileName}.webp`);
        }

        console.log('🎉 Все изображения оптимизированы!');
    } catch (error) {
        console.error('❌ Ошибка при обработке:', error);
    }
}

processImages();

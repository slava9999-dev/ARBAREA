import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../raw_images/ЗУБОЧИСТКИ');
const OUTPUT_DIR = path.join(__dirname, '../public/images/products');

async function optimizeHouseStandImages() {
  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Read files from input directory
    const files = await fs.readdir(INPUT_DIR);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    console.log(`🚀 Найдено изображений в папке ЗУБОЧИСТКИ: ${imageFiles.length}`);

    for (const file of imageFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputFilename = path.parse(file).name + '.webp';
      const outputPath = path.join(OUTPUT_DIR, outputFilename);

      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`✅ Готово: ${file} -> ${outputFilename}`);
    }

    console.log('🎉 Все изображения подставки оптимизированы!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

optimizeHouseStandImages();

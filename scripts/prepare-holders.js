import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../raw_images/ДЕРЖАТЕЛИ');
const RAW_IMAGES_ROOT = path.join(__dirname, '../raw_images');

// Файлы для обработки
if (fs.existsSync(SOURCE_DIR)) {
    const files = fs.readdirSync(SOURCE_DIR);
    let photoCounter = 1;

    files.forEach(file => {
        const srcPath = path.join(SOURCE_DIR, file);
        const ext = path.extname(file).toLowerCase();

        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const newName = `holder_ash_${photoCounter}${ext}`;
            const destPath = path.join(RAW_IMAGES_ROOT, newName);
            fs.copyFileSync(srcPath, destPath);
            console.log(`📸 Фото: ${file} -> ${newName}`);
            photoCounter++;
        }
    });
    console.log('✅ Файлы держателей подготовлены!');
} else {
    console.log('❌ Папка ДЕРЖАТЕЛИ не найдена');
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../raw_images/панно зимние горы');
const RAW_IMAGES_ROOT = path.join(__dirname, '../raw_images');

// Проверяем, существует ли папка источника
if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Папка ${SOURCE_DIR} не найдена!`);
    process.exit(1);
}

// Файлы для обработки
const files = fs.readdirSync(SOURCE_DIR);

let photoCounter = 1;

files.forEach(file => {
    const srcPath = path.join(SOURCE_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        // Это фото - перемещаем в raw_images с новым именем
        const newName = `panno_winter_mountains_${photoCounter}${ext}`;
        const destPath = path.join(RAW_IMAGES_ROOT, newName);

        fs.copyFileSync(srcPath, destPath);
        console.log(`📸 Фото: ${file} -> ${newName}`);
        photoCounter++;
    }
});

console.log('✅ Файлы "Панно Зимние Горы" подготовлены! Теперь запустите npm run optimize');

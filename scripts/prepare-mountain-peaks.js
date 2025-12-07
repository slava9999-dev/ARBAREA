import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../raw_images/ПАННО ГОРНЫЕ ВЕРШИНЫ');
const RAW_IMAGES_ROOT = path.join(__dirname, '../raw_images');
const VIDEOS_DIR = path.join(__dirname, '../public/videos');

// Создаем папку для видео
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Проверяем, существует ли папка источника
if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Папка ${SOURCE_DIR} не найдена!`);
    process.exit(1);
}

// Файлы для обработки
const files = fs.readdirSync(SOURCE_DIR);

let photoCounter = 1;
let videoCounter = 1;

files.forEach(file => {
    const srcPath = path.join(SOURCE_DIR, file);
    const ext = path.extname(file).toLowerCase();

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        // Это фото - перемещаем в raw_images с новым именем
        const newName = `panno_mountain_peaks_${photoCounter}${ext}`;
        const destPath = path.join(RAW_IMAGES_ROOT, newName);
        // Используем copyFileSync, чтобы не удалять исходники (на всякий случай)
        fs.copyFileSync(srcPath, destPath);
        console.log(`📸 Фото: ${file} -> ${newName}`);
        photoCounter++;
    } else if (['.mp4', '.mov'].includes(ext)) {
        // Это видео - перемещаем в public/videos
        const newName = `panno_mountain_peaks_${videoCounter}${ext}`;
        const destPath = path.join(VIDEOS_DIR, newName);
        fs.copyFileSync(srcPath, destPath);
        console.log(`🎥 Видео: ${file} -> ${newName}`);
        videoCounter++;
    }
});

console.log('✅ Файлы панно "Горные Вершины" подготовлены!');
console.log(`📸 Обработано фото: ${photoCounter - 1}`);
console.log(`🎥 Обработано видео: ${videoCounter - 1}`);
console.log('\n🔄 Теперь запустите: npm run optimize');

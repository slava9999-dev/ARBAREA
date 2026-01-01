import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = path.join(__dirname, '../public/images/products');
const SIZE_THRESHOLD = 100 * 1024; // 100KB

async function crushImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      await crushImages(filePath);
      continue;
    }

    if (file.endsWith('.webp') && stats.size > SIZE_THRESHOLD) {
      console.log(`📉 Crushing ${file} (${(stats.size / 1024).toFixed(2)} KB)...`);
      
      const buffer = fs.readFileSync(filePath);
      const tempPath = filePath + '.tmp';
      
      try {
        await sharp(buffer)
          .webp({ quality: 65, effort: 6 }) // Aggressive compression
          .toFile(tempPath);
        
        const newStats = fs.statSync(tempPath);
        if (newStats.size < stats.size) {
          fs.renameSync(tempPath, filePath);
          console.log(`✅ Reduced to ${(newStats.size / 1024).toFixed(2)} KB`);
        } else {
          fs.unlinkSync(tempPath);
          console.log(`⏩ No reduction possible, skipping.`);
        }
      } catch (err) {
        console.error(`❌ Failed to crush ${file}:`, err);
      }
    }
  }
}

console.log('🚀 Starting aggressive image crush...');
crushImages(TARGET_DIR).then(() => console.log('🎉 Done crushing images!'));

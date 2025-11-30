import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_DIR = path.join(__dirname, '../public/images/products');
const THUMBNAILS_DIR = path.join(PRODUCTS_DIR, 'thumbnails');

// Create thumbnails directory if it doesn't exist
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

async function generateThumbnails() {
  console.log('Starting thumbnail generation...');
  
  try {
    const files = fs.readdirSync(PRODUCTS_DIR);
    
    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
        const inputPath = path.join(PRODUCTS_DIR, file);
        const filename = path.parse(file).name;
        const outputPath = path.join(THUMBNAILS_DIR, `${filename}_thumb.webp`);
        
        if (fs.existsSync(outputPath)) {
          console.log(`Skipping ${file}, thumbnail already exists.`);
          continue;
        }

        console.log(`Processing ${file}...`);
        
        await sharp(inputPath)
          .resize(400, null, { withoutEnlargement: true }) // Resize to width 400px, maintain aspect ratio
          .webp({ quality: 80 })
          .toFile(outputPath);
          
        console.log(`Generated thumbnail for ${file}`);
      }
    }
    console.log('Thumbnail generation complete!');
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
}

generateThumbnails();

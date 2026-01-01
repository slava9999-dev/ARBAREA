
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_PRODUCT_DIR = path.join(__dirname, '..', '_new_product');
const PRODUCTS_FILE = path.join(__dirname, '..', 'src', 'data', 'products.js');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'products');

// Transliteration helper
const transliterate = (text) => {
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 
    'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 
    'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '_'
  };

  return text.toLowerCase().split('').map(char => ru[char] || char).join('').replace(/[^a-z0-9_]/g, '');
};

const parseInfoFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');
  const data = {};

  // Default values
  data.category = 'Декор';
  data.price = 5000; // Default price if not found

  // 1. Try rigid Key: Value format
  let isStructured = false;
  lines.forEach(line => {
    if (line.toLowerCase().startsWith('название:')) {
      isStructured = true;
      data.name = line.split(':')[1].trim();
    }
    else if (line.toLowerCase().startsWith('цена:')) {
      data.price = parseInt(line.replace(/\D/g, ''), 10);
    }
    else if (line.toLowerCase().startsWith('категория:')) {
      data.category = line.split(':')[1].trim();
    }
  });

  // 2. If not structured, use smart heuristics
  if (!data.name) {
    // Assume first line is Name
    if (lines.length > 0) {
      data.name = lines[0];
    } else {
      data.name = 'Новый товар';
    }

    // Try to find Price in other lines
    for (const line of lines) {
      if (line.match(/(цена|руб|rub|\d{3,})/i)) {
          const numbers = line.match(/\d+/g);
          if (numbers) {
             const possiblePrice = parseInt(numbers.join(''), 10);
             if (possiblePrice > 100) data.price = possiblePrice;
          }
      }
    }

    // Description is everything else
    data.description = lines.slice(1).join('\n');
  } else {
      // Logic for structured format description (if any)
      const descLineIndex = lines.findIndex(l => l.toLowerCase().startsWith('описание:'));
      if (descLineIndex !== -1) {
          const firstDescLine = lines[descLineIndex].split(':').slice(1).join(':').trim();
          const otherLines = lines.slice(descLineIndex + 1).filter(l => !l.includes(':'));
          data.description = [firstDescLine, ...otherLines].join('\n').trim();
      }
  }
  
  return data;
};

const getLastId = (content) => {
  const matches = content.match(/id:\s*(\d+)/g);
  if (!matches) return 100;
  const ids = matches.map(m => parseInt(m.match(/\d+/)[0], 10));
  return Math.max(...ids);
};

async function main() {
  console.log('🚀 Начинаю добавление товара...');

  // 1. Check if info.txt exists
  const infoPath = path.join(NEW_PRODUCT_DIR, 'info.txt');
  if (!fs.existsSync(infoPath)) {
    console.error('❌ Ошибка: Файл _new_product/info.txt не найден!');
    process.exit(1);
  }

  // 2. Parse info
  const productData = parseInfoFile(infoPath);
  console.log(`📦 Товар: ${productData.name}, Цена: ${productData.price}`);

  // 3. Process Images
  const files = fs.readdirSync(NEW_PRODUCT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  
  if (imageFiles.length === 0) {
    console.error('❌ Ошибка: Изображения не найдены в папке _new_product!');
    process.exit(1);
  }

  const slug = transliterate(productData.name);
  const gallery = [];

  console.log(`🖼 Обработка ${imageFiles.length} изображений...`);

  for (let i = 0; i < imageFiles.length; i++) {
    const fileName = imageFiles[i];
    const newFileName = `${slug}_${i + 1}.webp`;
    const outputPath = path.join(IMAGES_DIR, newFileName);

    await sharp(path.join(NEW_PRODUCT_DIR, fileName))
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    gallery.push(`/images/products/${newFileName}`);
    console.log(`  ✅ Сохранено: ${newFileName}`);
  }

  // 4. Update products.js
  let productsContent = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  const newId = getLastId(productsContent) + 1;

  const newProductObj = {
    id: newId,
    name: productData.name,
    category: productData.category || 'Декор',
    price: productData.price,
    basePrice: productData.price,
    image: gallery[0], // First image is main
    gallery: gallery,
    rating: 5.0,
    hasOptions: false,
    description: productData.description || '',
    vendor: productData.brand || 'Arbarea',
    param: {
      "Материал": productData.material || 'Дерево',
      "Стиль": productData.style || 'Минимализм',
      "Ручная работа": "Да"
    }
  };

  // Convert object to string but keeping JS format (not JSON)
  // We need to construct it manually to match the file style or use JSON.stringify and fix quotes
  
  const jsObjectString = `
  {
    id: ${newProductObj.id},
    name: '${newProductObj.name.replace(/'/g, "\\'")}',
    category: '${newProductObj.category}',
    price: ${newProductObj.price},
    basePrice: ${newProductObj.basePrice},
    image: '${newProductObj.image}',
    gallery: ${JSON.stringify(newProductObj.gallery).replace(/"/g, "'")},
    rating: 5.0,
    hasOptions: false,
    description: '${newProductObj.description.replace(/'/g, "\\'").replace(/\n/g, "\\n")}',
    vendor: 'Arbarea',
    param: {
      "Материал": "${newProductObj.param['Материал']}",
      "Стиль": "${newProductObj.param['Стиль']}",
      "Ручная работа": "Да"
    },
    variants: {
      colors: [],
      sizes: []
    }
  },`;

  // Insert before the last closing bracket of the array
  // Assuming the file ends with "];" or similar. We look for the last "]"
  
  const lastBracketIndex = productsContent.lastIndexOf(']');
  if (lastBracketIndex === -1) {
    console.error('❌ Ошибка: Не могу найти закрывающую скобку массива в products.js');
    process.exit(1);
  }

  const updatedContent = 
    productsContent.slice(0, lastBracketIndex) + 
    jsObjectString + '\n' + 
    productsContent.slice(lastBracketIndex);

  fs.writeFileSync(PRODUCTS_FILE, updatedContent, 'utf-8');
  console.log(`✅ Товар добавлен в базу (ID: ${newId})`);

  // 5. Clean up (Optional - rename folder to _processed_timestamp)
  // fs.renameSync(NEW_PRODUCT_DIR, `${NEW_PRODUCT_DIR}_processed_${Date.now()}`);
  // console.log('🧹 Папка _new_product переименована (архивирована)');
  
  console.log(`\n🎉 Готово! Товар "${productData.name}" успешно добавлен.`);
}

main().catch(console.error);

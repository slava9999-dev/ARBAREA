import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUFFER_DIR = path.join(__dirname, '../_new_products_buffer');
const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.js');
const PUBLIC_IMAGES_DIR = path.join(__dirname, '../public/images/products');

// Ensure directories exist
if (!fs.existsSync(BUFFER_DIR)) {
  fs.mkdirSync(BUFFER_DIR);
  console.log(`📂 Created buffer directory: ${BUFFER_DIR}`);
  console.log('👉 Place info.json and images there to add a product.');
  process.exit(0);
}

const addProduct = async () => {
  try {
    // 1. Read info.json
    const infoPath = path.join(BUFFER_DIR, 'info.json');
    if (!fs.existsSync(infoPath)) {
      console.error('❌ info.json not found in _new_products_buffer');
      return;
    }

    const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    
    // Validate required fields
    if (!info.name || !info.price || !info.category) {
      console.error('❌ info.json missing required fields (name, price, category)');
      return;
    }

    const productId = `prod_${Date.now()}`;
    const productDirName = productId;
    const targetDir = path.join(PUBLIC_IMAGES_DIR, productDirName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 2. Process Images
    const files = fs.readdirSync(BUFFER_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const gallery = [];
    let mainImage = '';

    console.log(`🖼 Processing ${files.length} images...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const inputPath = path.join(BUFFER_DIR, file);
      const outputFileName = `${i === 0 ? 'main' : `gallery_${i}`}.webp`;
      const outputPath = path.join(targetDir, outputFileName);

      await sharp(inputPath)
        .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true }) // High Res limit
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      const webPath = `/images/products/${productDirName}/${outputFileName}`;
      
      if (i === 0) {
        mainImage = webPath;
      } else {
        gallery.push(webPath);
      }
    }

    // 3. Create Product Object
    const newProduct = {
      id: productId,
      name: info.name,
      price: Number(info.price),
      category: info.category,
      description: info.description || '',
      image: mainImage,
      gallery: gallery,
      options: info.options || [],
      isNew: true,
      createdAt: new Date().toISOString()
    };

    // 4. Inject into products.js
    let productsContent = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    
    // Find the end of the array to inject (assuming export const products = [...]; format)
    // This is a simple regex replacement. For complex files, AST parsing is safer.
    // We look for the last closing bracket of the array.
    
    // Backup first
    fs.copyFileSync(PRODUCTS_FILE, `${PRODUCTS_FILE}.bak`);

    // Read current products to ensure we append correctly (using eval is dangerous, so we use a safer approach if possible, 
    // but for this script we will try to parse the file content string)
    
    // Simplified injection: find the last '];' and replace with ', newObject ];'
    const insertionPoint = productsContent.lastIndexOf('];');
    
    if (insertionPoint === -1) {
        console.error("❌ Could not find the end of products array in products.js");
        return;
    }

    const objectString = JSON.stringify(newProduct, null, 2);
    // Remove the outer braces of the JSON string to fit into the code if needed, but here we insert the whole object
    
    const newContent = productsContent.slice(0, insertionPoint) + 
                       `,\n  ${objectString}\n];`;

    fs.writeFileSync(PRODUCTS_FILE, newContent, 'utf-8');

    console.log(`✅ Product [${info.name}] added successfully!`);
    console.log(`🆔 ID: ${productId}`);
    console.log(`💰 Price: ${newProduct.price}`);
    
    // Cleanup buffer (optional, maybe move to _processed folder)
    // fs.rmSync(BUFFER_DIR, { recursive: true, force: true }); 
    // fs.mkdirSync(BUFFER_DIR); 

  } catch (error) {
    console.error('❌ Error adding product:', error);
  }
};

addProduct();

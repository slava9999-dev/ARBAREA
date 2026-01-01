import admin from 'firebase-admin';
import { PRODUCTS } from '../src/data/products.js';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found. Please follow the instructions in README.md');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedProducts() {
  console.log('🚀 Seeding products to Firestore...');
  
  const batch = db.batch();
  const productsCol = db.collection('products');

  for (const product of PRODUCTS) {
    const docRef = productsCol.doc(String(product.id));
    
    // We only need the pricing and variant data for the payment API, 
    // but seeding the whole object is better for consistency.
    batch.set(docRef, {
      ...product,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`📦 Prepared product: ${product.name} (ID: ${product.id})`);
  }

  await batch.commit();
  console.log('✅ Successfully seeded all products to Firestore!');
}

seedProducts().catch(console.error);

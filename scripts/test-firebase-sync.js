import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Firebase Admin Sync Test Starting...\n');

// 1. Try to find service account key
let serviceAccountPath = path.join(process.cwd(), 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    // Try to find any file matching the pattern
    const files = fs.readdirSync(process.cwd());
    const keyFile = files.find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));

    if (keyFile) {
        serviceAccountPath = path.join(process.cwd(), keyFile);
        console.log(`🔑 Found service account key: ${keyFile}`);
    } else {
        console.log('⚠️  Service account key not found at:', serviceAccountPath);
        console.log('ℹ️  To run this server-side test, you need to:');
        console.log('   1. Go to Firebase Console -> Project Settings -> Service accounts');
        console.log('   2. Generate new private key');
        console.log('   3. Save it as "service-account.json" in the project root');
        console.log('\n🚀 HOWEVER: Since you enabled Anonymous Auth, your CLIENT app should already be working!');
        console.log('   Please test the app in the browser directly.');
        process.exit(0);
    }
}

// 2. Initialize Admin SDK
try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK initialized');

    const db = admin.firestore();

    // Test Write
    const docRef = await db.collection('admin-test').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: 'Hello from Firebase Admin SDK'
    });
    console.log(`✅ Successfully wrote document ID: ${docRef.id}`);

    // Test Read
    const snapshot = await db.collection('admin-test').get();
    console.log(`✅ Successfully read ${snapshot.size} documents from admin-test`);

    // Cleanup
    await db.collection('admin-test').doc(docRef.id).delete();
    console.log('✅ Cleanup successful');

    console.log('\n🎉 DATABASE CONNECTION VERIFIED (ADMIN ACCESS)');

} catch (error) {
    console.error('❌ Error initializing or using Admin SDK:', error);
}

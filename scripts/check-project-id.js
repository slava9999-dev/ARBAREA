import * as dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 CHECKING FIREBASE CONFIGURATION...');
console.log('----------------------------------------');
console.log(`🆔 PROJECT ID in .env:  ${process.env.VITE_FIREBASE_PROJECT_ID}`);
console.log(`🔑 API KEY in .env:     ${process.env.VITE_FIREBASE_API_KEY ? 'Present (Starts with ' + process.env.VITE_FIREBASE_API_KEY.substring(0, 4) + '...)' : 'MISSING'}`);
console.log('----------------------------------------');
console.log('👉 Please verify that this PROJECT ID matches the one open in your Firebase Console.');
console.log('👉 Sometimes we edit one project but the code points to another.');
console.log('\n');

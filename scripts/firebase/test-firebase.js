#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');

const FIREBASE_CONFIG_PATH = path.join(__dirname, 'backend-api', 'firebase-service-account.json');

console.log('Testing Firebase Admin SDK...');
console.log(`Firebase config path: ${FIREBASE_CONFIG_PATH}`);

try {
  const serviceAccount = require(FIREBASE_CONFIG_PATH);
  console.log('✅ Service account loaded');
  console.log(`Keys in service account: ${Object.keys(serviceAccount).join(', ')}`);
  
  console.log(`\nadmin module:`, typeof admin);
  console.log(`admin.credential:`, admin.credential);
  console.log(`admin.credential type:`, typeof admin.credential);
  
  if (admin.credential) {
    console.log(`admin.credential methods:`, Object.keys(admin.credential));
  }
  
  // Tentar inicializar
  console.log('\nTentando inicializar...');
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Inicializado com sucesso!');
  
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
}

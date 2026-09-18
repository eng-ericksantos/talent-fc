/**
 * Script para definir custom claim 'admin: true' no Firebase para um usuário
 * 
 * Uso: node set-admin-claim.js <email-do-usuario>
 * Exemplo: node set-admin-claim.js eng.erickalessandro@gmail.com
 */

const admin = require('firebase-admin');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(__dirname, 'backend-api', 'firebase-service-account.json'));

initializeApp({
  credential: cert(serviceAccount),
});

const email = process.argv[2];

if (!email) {
  console.error('❌ Erro: Forneça o email do usuário como argumento.');
  console.error('Uso: node set-admin-claim.js <email>');
  console.error('Exemplo: node set-admin-claim.js eng.erickalessandro@gmail.com');
  process.exit(1);
}

async function setAdminClaim() {
  try {
    console.log(`🔍 Procurando usuário com email: ${email}`);
    
    // Buscar usuário pelo email
    const auth = getAuth();
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`✅ Usuário encontrado: ${userRecord.email} (UID: ${uid})`);
    
    // Definir custom claim
    console.log('⏳ Definindo custom claim admin=true...');
    await auth.setCustomUserClaims(uid, { admin: true });
    
    console.log('✅ Custom claim definido com sucesso!');
    console.log(`✅ O usuário ${email} agora pode acessar endpoints de admin.`);
    
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro ao definir custom claim:');
    console.error(erro.message);
    process.exit(1);
  }
}

setAdminClaim();

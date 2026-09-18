#!/usr/bin/env node

/**
 * Script de Migração: Re-importa jogadores com a nova lógica de normalização de atributos
 * Usa o endpoint de upload de CSV do admin para garantir consistência
 */

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Configuração
const CSV_PATH = path.join(__dirname, 'data-worker', 'data', 'ea_fc26_players.csv');
const ADMIN_API = process.env.ADMIN_API_URL || 'http://localhost:3000/api/v1/admin/upload-csv';
const FIREBASE_CONFIG_PATH = path.join(__dirname, 'backend-api', 'firebase-service-account.json');

/**
 * Re-importa os dados do CSV com a nova lógica
 */
async function migraçãoDados() {
  console.log('🔄 Iniciando Migração de Dados...\n');
  console.log('📋 Novo Fluxo:');
  console.log('  ✓ Atributos expandidos (longShots, sprintSpeed, etc)');
  console.log('  ✓ Normalização com Levenshtein distance (fuzzy matching)');
  console.log('  ✓ Suporte a múltiplos formatos de CSV\n');

  // Validar arquivo
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ Erro: Arquivo não encontrado: ${CSV_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(FIREBASE_CONFIG_PATH)) {
    console.error(`❌ Erro: Arquivo de configuração Firebase não encontrado: ${FIREBASE_CONFIG_PATH}`);
    process.exit(1);
  }

  const stats = fs.statSync(CSV_PATH);
  console.log(`📊 Arquivo: ${CSV_PATH}`);
  console.log(`📏 Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);

  try {
    // Inicializar Firebase Admin
    console.log('🔐 Inicializando Firebase Admin...');
    console.log(`📄 Carregando: ${FIREBASE_CONFIG_PATH}`);
    
    const serviceAccount = require(FIREBASE_CONFIG_PATH);
    console.log('✅ Firebase config carregado');
    
    try {
      // Limpar apps anteriores
      admin.getApps().forEach(app => admin.deleteApp(app));
      
      // Inicializar
      admin.initializeApp({
        credential: admin.cert(serviceAccount),
      });
      console.log('✅ Firebase app inicializado');
    } catch (initError) {
      console.error('❌ Erro ao inicializar Firebase:', initError.message);
      throw initError;
    }

    // Encontrar usuário admin
    console.log('🔍 Procurando usuário admin...');
    let adminUser = null;
    let pageToken = undefined;

    try {
      do {
        const listResult = await getAuth().listUsers(1000, pageToken);
        console.log(`📌 Verificando ${listResult.users.length} usuários...`);
        
        for (const user of listResult.users) {
          if (user.customClaims && user.customClaims.admin) {
            adminUser = user;
            break;
          }
        }
        pageToken = listResult.pageToken;
      } while (!adminUser && pageToken);
    } catch (firebaseError) {
      console.error('❌ Erro ao listar usuários Firebase:', firebaseError.message);
      throw firebaseError;
    }

    if (!adminUser) {
      console.error('❌ Erro: Nenhum usuário admin encontrado no Firebase.');
      console.error('Execute primeiro: node set-admin-claim.js <email>');
      process.exit(1);
    }

    console.log(`✅ Admin encontrado: ${adminUser.email}\n`);

    // Criar token custom
    console.log('🔐 Gerando token de autenticação...');
    const customToken = await getAuth().createCustomToken(adminUser.uid);
    console.log('✅ Token custom gerado');
    
    // Trocar token custom por ID token via REST API do Firebase
    console.log('🔄 Trocando por ID token...');
    
    const firebaseApiKey = 'AIzaSyCdpVhwOiW_bUYlOKaFSs3la0UvtEVPfQo';
    
    try {
      const loginResponse = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseApiKey}`,
        { token: customToken, returnSecureToken: true }
      );
      
      const idToken = loginResponse.data.idToken;
      console.log('✅ ID token obtido\n');
      
      var token = idToken;
    } catch (loginError) {
      console.error('❌ Erro ao trocar token:', loginError.message);
      if (loginError.response?.data) {
        console.error('Detalhes:', JSON.stringify(loginError.response.data, null, 2));
      }
      throw loginError;
    }

    // Upload do CSV
    console.log(`⏳ Enviando arquivo para ${ADMIN_API}...`);
    
    const fileContent = fs.readFileSync(CSV_PATH);
    
    // Criar FormData (Node.js)
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fileContent, {
      filename: 'ea_fc26_players.csv',
      contentType: 'text/csv',
    });

    const response = await axios.post(ADMIN_API, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      timeout: 300000,  // 5 minutos para upload de 3.87 MB
    });

    console.log('\n✅ Upload concluído com sucesso!\n');
    console.log('📊 Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      console.log('\n📊 Resultado da Migração:');
      console.log(`  Total de linhas CSV: ${response.data.totalLinhasCSV || 'N/A'}`);
      console.log(`  Jogadores válidos: ${response.data.totalJogadoresValidos || 'N/A'}`);
      console.log(`  Insersções: ${response.data.operacoes?.insercoes || response.data.insercoes || 0}`);
      console.log(`  Atualizações: ${response.data.operacoes?.atualizacoes || response.data.atualizacoes || 0}`);
      console.log(`\n✅ Mensagem: ${response.data.mensagem || 'Sucesso'}`);
    }

    console.log('\n🎉 Migração Concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('  1. Aguarde 30 segundos para índices serem criados');
    console.log('  2. Teste a busca de lendas: curl "http://localhost:3000/api/v1/players?search=kaka"');
    console.log('  3. Verifique o Modo Herdeiro de Lendas no app\n');

    process.exit(0);
  } catch (erro) {
    console.error('\n❌ Erro durante a migração:');
    console.error(erro.message);
    
    if (erro.response?.data) {
      console.error('\n📋 Detalhes do servidor:');
      console.error(JSON.stringify(erro.response.data, null, 2));
    }

    if (erro.response?.status) {
      console.error(`\nStatus HTTP: ${erro.response.status}`);
    }

    process.exit(1);
  }
}

migraçãoDados();

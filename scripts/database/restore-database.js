#!/usr/bin/env node

/**
 * Script para restaurar dados de jogadores via upload de CSV
 * Usa o arquivo ea_fc26_players.csv
 * 
 * Usa credenciais do Firebase Admin para contornar autenticação
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(__dirname, 'backend-api', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const csvPath = path.join(__dirname, 'data-worker', 'data', 'ea_fc26_players.csv');
const apiUrl = 'http://localhost:3000/api/v1/admin/upload-csv';

async function restoreDatabase() {
  try {
    // Verificar se arquivo existe
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${csvPath}`);
      process.exit(1);
    }

    console.log('📂 Arquivo encontrado:', csvPath);
    const stats = fs.statSync(csvPath);
    console.log(`📊 Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Obter usuário admin do Firebase (primeiro admin que encontrar)
    console.log('🔍 Procurando usuário admin no Firebase...');
    
    // Listar todos os usuários e encontrar um com custom claim admin
    let adminUser = null;
    let pageToken = undefined;
    
    do {
      const listResult = await admin.auth().listUsers(1000, pageToken);
      
      for (const user of listResult.users) {
        // Tenta verificar se tem claim admin
        try {
          if (user.customClaims && user.customClaims.admin) {
            adminUser = user;
            break;
          }
        } catch (e) {
          // Ignorar erros ao checar claims
        }
      }
      
      pageToken = listResult.pageToken;
    } while (!adminUser && pageToken);

    if (!adminUser) {
      console.error('❌ Erro: Nenhum usuário admin encontrado no Firebase.');
      console.error('Execute primeiro: node set-admin-claim.js <email>');
      process.exit(1);
    }

    console.log(`✅ Usuário admin encontrado: ${adminUser.email}`);

    // Gerar ID token para o admin
    console.log('🔐 Gerando token de autenticação...');
    const token = await admin.auth().createCustomToken(adminUser.uid);

    // Fazer upload do CSV
    console.log('⏳ Enviando arquivo para API...');
    
    const fileContent = fs.readFileSync(csvPath);
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: 'text/csv' }), 'ea_fc26_players.csv');

    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });

    console.log('✅ Upload realizado com sucesso!');
    console.log('📈 Resposta do servidor:');
    console.log(response.data);
    
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:');
    console.error(erro.message);
    if (erro.response?.data) {
      console.error('Detalhes:', erro.response.data);
    }
    process.exit(1);
  }
}

restoreDatabase();

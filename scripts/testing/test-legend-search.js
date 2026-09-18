#!/usr/bin/env node

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const axios = require('axios');
const path = require('path');

async function testarBuscaLendas() {
  console.log('🧪 Teste: Busca de Lendas - Kaká\n');

  try {
    // Inicializar Firebase
    const serviceAccount = require(path.join(__dirname, 'backend-api', 'firebase-service-account.json'));
    
    // Limpar apps anteriores
    admin.getApps().forEach(app => admin.deleteApp(app));
    
    admin.initializeApp({
      credential: admin.cert(serviceAccount),
    });

    // Encontrar usuário admin
    console.log('🔐 Autenticando...');
    let adminUser = null;
    let pageToken = undefined;

    do {
      const listResult = await getAuth().listUsers(1000, pageToken);
      for (const user of listResult.users) {
        if (user.customClaims && user.customClaims.admin) {
          adminUser = user;
          break;
        }
      }
      pageToken = listResult.pageToken;
    } while (!adminUser && pageToken);

    if (!adminUser) {
      console.error('❌ Nenhum usuário admin encontrado.');
      process.exit(1);
    }

    // Criar token custom
    const customToken = await getAuth().createCustomToken(adminUser.uid);
    
    // Trocar por ID token
    const firebaseApiKey = 'AIzaSyCdpVhwOiW_bUYlOKaFSs3la0UvtEVPfQo';
    const loginResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseApiKey}`,
      { token: customToken, returnSecureToken: true }
    );
    
    const idToken = loginResponse.data.idToken;
    console.log('✅ Token obtido\n');

    // Teste 1: Buscar "kaka"
    console.log('📝 Teste 1: Buscar "kaka" (Modo Herdeiro de Lendas)\n');
    
    try {
      const searchResponse = await axios.get(
        'http://localhost:3000/api/v1/players?search=kaka&page=1&limit=10',
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          }
        }
      );

      const data = searchResponse.data;
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ SUCESSO! Encontrado ${data.data.length} jogadores!\n`);
        console.log(`📊 Legenda Ativada: ${data.legendMatched || 'N/A'}\n`);
        
        console.log('🏆 Top 5 resultados:');
        data.data.slice(0, 5).forEach((jogador, idx) => {
          console.log(`  ${idx + 1}. ${jogador.nome.padEnd(25)} - Match: ${(jogador.matchPercentage || 0).toFixed(1)}%`);
        });
        
        console.log(`\n📊 Total de resultados: ${data.total || data.data.length}`);
        console.log('\n✅ Modo Herdeiro de Lendas está funcionando corretamente!');
      } else {
        console.log('❌ Nenhum resultado encontrado.');
        console.log('Response:', JSON.stringify(data, null, 2));
      }
    } catch (searchError) {
      console.error('❌ Erro na busca:');
      if (searchError.response?.data) {
        console.error(JSON.stringify(searchError.response.data, null, 2));
      } else {
        console.error(searchError.message);
      }
    }

    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    if (erro.response?.data) {
      console.error('Detalhes:', JSON.stringify(erro.response.data, null, 2));
    }
    process.exit(1);
  }
}

testarBuscaLendas();

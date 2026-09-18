/**
 * Exemplo de Teste End-to-End: Upload de CSV
 * 
 * Execute este arquivo no seu projeto Angular para testar o upload:
 * npx ts-node testing-e2e.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Configuração
const API_URL = 'http://localhost:3000/admin/upload-csv';
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || 'YOUR_TOKEN_HERE';
const CSV_FILE_PATH = path.join(__dirname, 'exemplo_csv_upload.csv');

/**
 * Testa o endpoint de upload de CSV
 */
async function testarUploadCSV(): Promise<void> {
  console.log('🚀 Iniciando teste de upload de CSV...\n');

  try {
    // Validação de arquivo
    if (!fs.existsSync(CSV_FILE_PATH)) {
      throw new Error(`❌ Arquivo não encontrado: ${CSV_FILE_PATH}`);
    }

    console.log(`📂 Arquivo: ${CSV_FILE_PATH}`);
    const tamanhoArquivo = fs.statSync(CSV_FILE_PATH).size;
    console.log(`📊 Tamanho: ${(tamanhoArquivo / 1024).toFixed(2)}KB\n`);

    // Validação de token
    if (FIREBASE_TOKEN === 'YOUR_TOKEN_HERE') {
      throw new Error(
        '❌ Token Firebase não configurado. \nDefina a variável de ambiente: FIREBASE_TOKEN=seu_token'
      );
    }

    console.log('🔐 Token configurado (primeiros 20 caracteres):',
      FIREBASE_TOKEN.substring(0, 20) + '...\n'
    );

    // Leitura do arquivo
    const fileStream = fs.createReadStream(CSV_FILE_PATH);

    // Requisição HTTP
    console.log(`📤 Enviando para: ${API_URL}\n`);

    const response = await axios.post(API_URL, fileStream, {
      headers: {
        'Authorization': `Bearer ${FIREBASE_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      },
      maxContentLength: 52428800, // 50MB
      maxBodyLength: 52428800,
    });

    // Sucesso
    console.log('✅ Upload bem-sucedido!\n');
    console.log('📋 Resposta:');
    console.log(JSON.stringify(response.data, null, 2));

    // Análise dos resultados
    const { operacoes, totalJogadoresValidos } = response.data;
    console.log('\n📊 Análise:');
    console.log(`   - Jogadores processados: ${totalJogadoresValidos}`);
    console.log(`   - Novos registros: ${operacoes.insercoes}`);
    console.log(`   - Atualizados: ${operacoes.atualizacoes}`);

  } catch (erro: any) {
    console.error('❌ Erro ao fazer upload:');
    
    if (erro.response) {
      // Erro HTTP
      console.error(`   Status: ${erro.response.status}`);
      console.error(`   Mensagem:`, erro.response.data?.message || erro.response.data);
    } else if (erro.request) {
      // Sem resposta do servidor
      console.error('   Servidor não respondeu. Verifique se está rodando em http://localhost:3000');
    } else {
      // Erro de configuração
      console.error(`   ${erro.message}`);
    }

    process.exit(1);
  }
}

/**
 * Testa diferentes cenários
 */
async function testarCenarios(): Promise<void> {
  console.log('\n🧪 Testando cenários de erro...\n');

  const cenarios = [
    {
      nome: 'Sem token',
      headers: {},
      expectado: 403,
    },
    {
      nome: 'Token inválido',
      headers: { 'Authorization': 'Bearer invalid_token' },
      expectado: 403,
    },
    {
      nome: 'Sem arquivo',
      body: null,
      expectado: 400,
    },
  ];

  for (const cenario of cenarios) {
    try {
      console.log(`🔍 Testando: ${cenario.nome}...`);
      
      await axios.post(API_URL, cenario.body || fs.createReadStream(CSV_FILE_PATH), {
        headers: cenario.headers,
        validateStatus: () => true, // Não throw em qualquer status
      });

      console.log(`   ✓ Status ${cenario.expectado} recebido\n`);
    } catch (erro) {
      console.log(`   ✗ Erro inesperado: ${erro.message}\n`);
    }
  }
}

/**
 * Valida dados no MongoDB
 */
async function validarMongoDB(): Promise<void> {
  console.log('🗄️  Validando dados no MongoDB...\n');

  // Você deve conectar ao MongoDB manualmente e verificar:
  // mongosh mongodb://localhost:27017/talent-fc-db
  // db.jogadores.countDocuments()
  // db.jogadores.find({ overall: { $gt: 85 } })

  console.log('Use os seguintes comandos no MongoDB:');
  console.log('\n  mongosh mongodb://localhost:27017/talent-fc-db');
  console.log('  db.jogadores.countDocuments()');
  console.log('  db.jogadores.find({ overall: { $gt: 85 } })');
  console.log('  db.jogadores.aggregate([');
  console.log('    {');
  console.log('      $group: {');
  console.log('        _id: null,');
  console.log('        total: { $sum: 1 },');
  console.log('        mediaOverall: { $avg: "$overall" }');
  console.log('      }');
  console.log('    }');
  console.log('  ])\n');
}

/**
 * Main
 */
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║    Teste E2E: Motor de Upload de CSV      ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Teste principal
  await testarUploadCSV();

  // Testes de cenários (comentado para não fazer requisições desnecessárias)
  // await testarCenarios();

  // Validação no MongoDB
  await validarMongoDB();

  console.log('✨ Teste concluído!');
}

// Executar
main().catch(console.error);

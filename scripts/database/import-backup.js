#!/usr/bin/env node

/**
 * Script para importar backup de jogadores diretamente no MongoDB
 * Reusa a lógica de categorização do backend
 * Com suporte a múltiplos formatos de CSV e normalização inteligente de atributos
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { parse } = require('csv-parse/sync');

// Configuração
const CSV_PATH = path.join(__dirname, 'data-worker', 'data', 'ea_fc26_players.csv');
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentfc';

// Mapeamento de múltiplos nomes de atributos para chave canônica
const ATTRIBUTE_ALIASES = {
  acceleration: new Set(['acceleration', 'acceleracao', 'acc', 'accel']),
  sprintSpeed: new Set(['sprintspeed', 'sprint_speed', 'sprint speed', 'velocidade sprint', 'velocidade_sprint']),
  finishing: new Set(['finishing', 'finalizacao', 'fini', 'fin']),
  shotPower: new Set(['shotpower', 'shot_power', 'shot power', 'potencia disparo']),
  longShots: new Set(['longshots', 'long_shots', 'long shots', 'chutes distancia']),
  volleys: new Set(['volleys', 'voleio', 'voleios']),
  penalties: new Set(['penalties', 'penalty', 'penaltis', 'penal']),
  positioning: new Set(['positioning', 'posicionamento', 'posic']),
  shortPassing: new Set(['shortpassing', 'short_passing', 'short passing', 'passe curto']),
  longPassing: new Set(['longpassing', 'long_passing', 'long passing', 'passe longo']),
  vision: new Set(['vision', 'visao', 'visão']),
  crossing: new Set(['crossing', 'cruzamento']),
  freeKickAccuracy: new Set(['freekickaccuracy', 'free_kick_accuracy', 'free kick accuracy']),
  curve: new Set(['curve', 'curva']),
  dribbling: new Set(['dribbling', 'drible', 'dribles']),
  ballControl: new Set(['ballcontrol', 'ball_control', 'ball control', 'controle bola']),
  agility: new Set(['agility', 'agilidade']),
  balance: new Set(['balance', 'equilibrio', 'equilíbrio']),
  reactions: new Set(['reactions', 'reacoes', 'reações']),
  composure: new Set(['composure', 'compostura']),
  defensiveAwareness: new Set(['defensiveawareness', 'defensive_awareness', 'defensive awareness', 'def awareness']),
  standingTackle: new Set(['standingtackle', 'standing_tackle', 'standing tackle']),
  slidingTackle: new Set(['slidingtackle', 'sliding_tackle', 'sliding tackle']),
  headingAccuracy: new Set(['headingaccuracy', 'heading_accuracy', 'heading accuracy', 'precisao cabeca']),
  interceptions: new Set(['interceptions', 'interceptacoes', 'intercept']),
  aggression: new Set(['aggression', 'agressividade', 'agress']),
  jumping: new Set(['jumping', 'salto', 'pulo']),
  stamina: new Set(['stamina', 'resistencia', 'resisti']),
  strength: new Set(['strength', 'forca', 'força']),
  gkDiving: new Set(['gkdiving', 'gk_diving', 'gk diving']),
  gkHandling: new Set(['gkhandling', 'gk_handling', 'gk handling']),
  gkKicking: new Set(['gkkicking', 'gk_kicking', 'gk kicking']),
  gkPositioning: new Set(['gkpositioning', 'gk_positioning', 'gk positioning']),
  gkReflexes: new Set(['gkreflexes', 'gk_reflexes', 'gk reflexes']),
  skillMoves: new Set(['skillmoves', 'skill_moves', 'skill moves', 'skill']),
};

// Mapeamento de colunas (replicado do backend)
const COLUNAS_MAPEAMENTO = {
  eaPlayerId: ['id', 'ID', 'player_id', 'playerId', 'eaPlayerId'],
  nome: ['commonName', 'name', 'Nome', 'player_name', 'playerName'],
  idade: ['age', 'Age', 'idade'],
  overall: ['overallRating', 'OVR', 'overall', 'Overall'],
  potencial: ['potential', 'POT', 'potencial'],
  posicao: ['position', 'Position', 'pos', 'posicao'],
  nacionalidade: ['nationality', 'Nationality', 'nacionalidade', 'nation'],
  valorMercado: ['marketValue', 'market_value', 'valor', 'valorMercado'],
  resistencia: ['stamina', 'Stamina', 'resistencia'],
  interceptacoes: ['interceptions', 'Interceptions', 'interceptacoes'],
  ritmo: ['pace', 'Pace', 'ritmo'],
  finalizacao: ['shooting', 'Shooting', 'finalizacao'],
  habilidades: ['dribbling', 'Dribbling', 'habilidades', 'skill'],
};

/**
 * Distância de Levenshtein entre duas strings
 */
function levenshteinDistance(a, b) {
  const aLen = a.length;
  const bLen = b.length;
  const matriz = Array.from({ length: aLen + 1 }, () => Array(bLen + 1).fill(0));

  for (let i = 0; i <= aLen; i++) matriz[i][0] = i;
  for (let j = 0; j <= bLen; j++) matriz[0][j] = j;

  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,
        matriz[i][j - 1] + 1,
        matriz[i - 1][j - 1] + custo,
      );
    }
  }

  return matriz[aLen][bLen];
}

/**
 * Normaliza um nome de coluna do CSV para camelCase canônico
 * Com fallback fuzzy matching
 */
function normalizarNomeAtributo(nomeOriginal) {
  if (!nomeOriginal) return null;

  let normalizado = nomeOriginal.trim().toLowerCase().replace(/[\s_]/g, '');

  // Busca direta
  for (const [chaveCanonica, aliases] of Object.entries(ATTRIBUTE_ALIASES)) {
    for (const alias of aliases) {
      if (alias.replace(/[\s_]/g, '') === normalizado) {
        return chaveCanonica;
      }
    }
  }

  // Fuzzy matching com Levenshtein
  const distancias = Object.entries(ATTRIBUTE_ALIASES).map(([chave, aliases]) => ({
    chave,
    distancia: Math.min(
      levenshteinDistance(normalizado, chave.replace(/[\s_]/g, '')),
      ...Array.from(aliases).map((alias) => levenshteinDistance(normalizado, alias)),
    ),
  }));

  distancias.sort((a, b) => a.distancia - b.distancia);
  const melhor = distancias[0];

  if (melhor && melhor.distancia <= 3) {
    return melhor.chave;
  }

  return null;
}

/**
 * Calcula idade a partir da data de nascimento
 */
function calcularIdade(birthdate) {
  if (!birthdate) return null;
  
  try {
    // Tenta parse em vários formatos
    let ano, mes, dia;
    
    // Formato: "6/15/1992 12:00:00 AM"
    if (birthdate.includes('/')) {
      const partes = birthdate.split(' ')[0].split('/');
      [mes, dia, ano] = partes.map(Number);
    } else if (birthdate.includes('-')) {
      // Formato: YYYY-MM-DD ou DD-MM-YYYY
      const partes = birthdate.split('-').map(Number);
      if (partes[0] > 31) {
        [ano, mes, dia] = partes;
      } else {
        [dia, mes, ano] = partes;
      }
    } else {
      return null;
    }
    
    if (!ano || !mes || !dia || ano < 1900 || ano > 2024 || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return null;
    }
    
    const today = new Date();
    let idade = today.getFullYear() - ano;
    
    if (today.getMonth() + 1 < mes || (today.getMonth() + 1 === mes && today.getDate() < dia)) {
      idade--;
    }
    
    return idade >= 0 && idade <= 100 ? idade : null;
  } catch {
    return null;
  }
}

/**
 * Estima o potencial baseado na idade
 */
function estimarPotencial(idade, overall) {
  const margem = Math.max(0, 23 - idade) * 2;
  return Math.min(99, overall + margem);
}

/**
 * Estima o valor de mercado baseado no overall e potencial
 * Lógica replicada exatamente do data-worker (Python)
 */
function estimarValorMercado(overall, potencial) {
  const base = Math.max(1, (overall - 60) * 3);
  const bonusJuventude = (potencial - overall) * 2;
  return `€${base + bonusJuventude}M`;
}

/**
 * Determina a categoria do jogador
 */
function inferirCategoria(idade, overall, potencial) {
  if (idade <= 21 && potencial >= 80) return 'wonderkid';
  if (idade <= 27 && overall < potencial - 5) return 'gem';
  if (idade >= 32 && overall >= 80) return 'veteran';
  return 'gem';
}

/**
 * Encontra a chave normalizada da coluna
 */
function encontrarColunaOriginal(nomeCSV, chaveNormalizada) {
  const aliases = COLUNAS_MAPEAMENTO[chaveNormalizada] || [];
  return aliases.some(alias => alias.toLowerCase() === nomeCSV.toLowerCase());
}

/**
 * Normaliza o cabeçalho do CSV
 */
function normalizarCabecalho(cabecalhoCSV) {
  return cabecalhoCSV.map(coluna => {
    for (const [chaveNormalizada, aliases] of Object.entries(COLUNAS_MAPEAMENTO)) {
      if (encontrarColunaOriginal(coluna, chaveNormalizada)) {
        return chaveNormalizada;
      }
    }
    return coluna;
  });
}

/**
 * Importa o backup
 */
async function importarBackup() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ Arquivo não encontrado: ${CSV_PATH}`);
    process.exit(1);
  }

  console.log('📂 Lendo arquivo CSV...');
  const conteudo = fs.readFileSync(CSV_PATH, 'utf-8');
  
  // Parse CSV com library csv-parse
  const dados = parse(conteudo, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  });

  console.log(`✅ ${dados.length} linhas parseadas`);

  // Conectar ao MongoDB
  console.log('\n🔗 Conectando ao MongoDB...');
  const client = new MongoClient(MONGO_URI);

  // Atributos estendidos que devem ser capturados
  const atributosEstendidosChaves = new Set([
    'acceleration', 'sprintSpeed', 'finishing', 'shotPower', 'longShots', 'volleys',
    'penalties', 'positioning', 'shortPassing', 'longPassing', 'curve', 'freeKickAccuracy',
    'crossing', 'vision', 'dribbling', 'ballControl', 'agility', 'balance', 'reactions',
    'composure', 'defensiveAwareness', 'standingTackle', 'slidingTackle', 'headingAccuracy',
    'aggression', 'jumping', 'strength', 'gkDiving', 'gkHandling', 'gkKicking',
    'gkPositioning', 'gkReflexes', 'skillMoves',
  ]);

  try {
    await client.connect();
    const db = client.db();
    const colecao = db.collection('jogadores');

    // Limpar coleção anterior
    console.log('🗑️  Limpando coleção anterior...');
    await colecao.deleteMany({});

    // Processar e inserir jogadores
    console.log('⏳ Processando jogadores...');
    const operacoes = [];
    let validos = 0;

    for (const linha of dados) {
      const jogador = {};
      const atributosEstendidos = {};
      let idade, overall;

      // Normalizar dados (encontrar colunas originais e normalizar)
      const cabecalhoOriginal = Object.keys(linha);
      const cabecalhoNorm = normalizarCabecalho(cabecalhoOriginal);

      // Debug: mostrar primeira linha
      if (validos === 0) {
        console.log('🔍 Cabeçalhos originais da primeira linha:', cabecalhoOriginal.slice(0, 10));
        console.log('🔍 Cabeçalhos normalizados:', cabecalhoNorm.slice(0, 10));
        console.log('🔍 Primeiros valores:', {
          id: linha.id,
          overallRating: linha.overallRating,
          birthdate: linha.birthdate,
          commonName: linha.commonName,
          position: linha.position,
          nationality: linha.nationality,
        });
      }

      cabecalhoOriginal.forEach((colOrig, idx) => {
        const colNorm = cabecalhoNorm[idx];
        const valor = linha[colOrig];

        if (valor && valor !== '') {
          // Mapeamento especial para campos não encontrados na normalização
          if (colOrig === 'overallRating' && !jogador.overall) {
            const num = parseInt(valor, 10);
            if (!isNaN(num)) {
              jogador.overall = num;
              overall = num;
            }
          } else if (colOrig === 'birthdate' && !jogador.idade) {
            const idadeCalc = calcularIdade(valor);
            if (idadeCalc) {
              jogador.idade = idadeCalc;
              idade = idadeCalc;
            }
          } else if (colOrig === 'commonName' && !jogador.nome && valor.trim()) {
            jogador.nome = String(valor);
          } else if (colOrig === 'firstName' && !jogador.nome) {
            const firstName = String(linha.firstName || '');
            const lastName = String(linha.lastName || '');
            const nome = (firstName + ' ' + lastName).trim();
            if (nome) jogador.nome = nome;
          } else if (colOrig === 'id' && !jogador.eaPlayerId) {
            const num = parseInt(valor, 10);
            if (!isNaN(num)) {
              jogador.eaPlayerId = num;
            }
          } else if (colOrig === 'position' && !jogador.posicao) {
            jogador.posicao = String(valor);
          } else if (colOrig === 'nationality' && !jogador.nacionalidade) {
            jogador.nacionalidade = String(valor);
          } else {
            // Tenta normalizar como atributo estendido (com fallback fuzzy matching)
            const chaveCanonica = normalizarNomeAtributo(colOrig);
            if (chaveCanonica) {
              const num = parseInt(valor, 10);
              if (!isNaN(num) && num > 0) {
                atributosEstendidos[chaveCanonica] = num;
              }
            } else if (colNorm && colNorm !== colOrig) {
              // Fallback: tenta pelo mapeamento normalizado
              const numeros = ['eaPlayerId', 'idade', 'overall', 'potencial', 'resistencia', 'interceptacoes', 'ritmo', 'finalizacao', 'habilidades'];
              if (numeros.includes(colNorm)) {
                const num = parseInt(valor, 10);
                if (!isNaN(num)) {
                  jogador[colNorm] = num;
                  if (colNorm === 'idade') idade = num;
                  if (colNorm === 'overall') overall = num;
                }
              } else {
                jogador[colNorm] = String(valor);
              }
            }
          }
        }
      });

      // Validar jogador
      if (!jogador.eaPlayerId || jogador.eaPlayerId <= 0) continue;

      // Salvar atributosEstendidos se houver dados
      if (Object.keys(atributosEstendidos).length > 0) {
        jogador.atributosEstendidos = atributosEstendidos;
      }

      // Calcular potencial, valor de mercado e categoria
      if (idade !== undefined && overall !== undefined) {
        const potencial = estimarPotencial(idade, overall);
        const valorMercado = estimarValorMercado(overall, potencial);
        
        jogador.potencial = potencial;
        jogador.valorMercado = valorMercado;
        jogador.categoria = inferirCategoria(idade, overall, potencial);
      }

      operacoes.push({
        updateOne: {
          filter: { eaPlayerId: jogador.eaPlayerId },
          update: { $set: jogador },
          upsert: true
        }
      });
      validos++;

      // Inserir em lotes de 1000
      if (operacoes.length >= 1000) {
        await colecao.bulkWrite(operacoes);
        operacoes.length = 0;
      }
    }

    // Inserir restantes
    if (operacoes.length > 0) {
      await colecao.bulkWrite(operacoes);
    }

    // Estatísticas finais
    const total = await colecao.countDocuments();
    const porCategoria = await colecao.aggregate([
      { $group: { _id: '$categoria', total: { $sum: 1 } } }
    ]).toArray();

    console.log(`\n✅ Importação concluída!`);
    console.log(`📊 Total de jogadores: ${total}`);
    console.log(`📊 Processados: ${validos}`);
    console.log('\n📋 Distribuição por categoria:');
    porCategoria.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.total}`);
    });

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

importarBackup();

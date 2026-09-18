#!/usr/bin/env node

/**
 * Verificar se atributos foram salvos corretamente no MongoDB
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend-api', '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talent-fc';

async function verificarAtributos() {
  console.log('🔍 Verificando atributos no MongoDB...\n');
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB\n');

    // Criar schema simples
    const jogadorSchema = new mongoose.Schema({}, { strict: false });
    const Jogador = mongoose.model('Jogador', jogadorSchema, 'jogadores');

    // Buscar um jogador que deveria ter longShots
    console.log('📝 Procurando por um jogador com "Bellingham" no nome...\n');
    
    const jogador = await Jogador.findOne({
      nome: { $regex: 'Bellingham', $options: 'i' }
    });

    if (jogador) {
      console.log(`✅ Encontrado: ${jogador.nome}\n`);
      
      console.log('📊 Estrutura do documento:');
      console.log(`  posicao: ${jogador.posicao}`);
      console.log(`  overall: ${jogador.overall}`);
      
      if (jogador.atributos) {
        console.log('\n📋 atributos:');
        console.log(`  drible: ${jogador.atributos.drible}`);
        console.log(`  ritmo: ${jogador.atributos.ritmo || 'N/A'}`);
      }
      
      if (jogador.atributosEstendidos) {
        console.log('\n📋 atributosEstendidos (extensões):');
        const chaves = Object.keys(jogador.atributosEstendidos);
        console.log(`  Total de atributos: ${chaves.length}`);
        console.log(`  Primeiras 10 chaves: ${chaves.slice(0, 10).join(', ')}`);
        
        // Procurar pelos atributos específicos do Kaká
        console.log('\n🎯 Atributos críticos para Kaká:');
        console.log(`  longShots: ${jogador.atributosEstendidos.longShots || 'NÃO ENCONTRADO'}`);
        console.log(`  sprintSpeed: ${jogador.atributosEstendidos.sprintSpeed || 'NÃO ENCONTRADO'}`);
        console.log(`  dribbling: ${jogador.atributosEstendidos.dribbling || 'NÃO ENCONTRADO'}`);
        console.log(`  defensiveAwareness: ${jogador.atributosEstendidos.defensiveAwareness || 'NÃO ENCONTRADO'}`);
      } else {
        console.log('\n❌ Nenhum atributosEstendidos encontrado!');
      }
      
      console.log('\n📄 Documento completo:');
      console.log(JSON.stringify(jogador, null, 2));
      
    } else {
      console.log('❌ Nenhum Bellingham encontrado no banco.');
      
      // Listar primeiros 3 jogadores
      console.log('\n📝 Procurando 3 primeiros jogadores...\n');
      const primeiros = await Jogador.find().limit(3);
      
      primeiros.forEach(j => {
        console.log(`- ${j.nome} (${j.posicao})`);
        if (j.atributosEstendidos) {
          const chaves = Object.keys(j.atributosEstendidos);
          console.log(`  atributosEstendidos: ${chaves.length} atributos`);
        } else {
          console.log(`  atributosEstendidos: NÃO ENCONTRADO`);
        }
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  }
}

verificarAtributos();

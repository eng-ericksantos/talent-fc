#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend-api', '.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talent-fc';

async function verificarBanco() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB\n');

    const jogadorSchema = new mongoose.Schema({}, { strict: false });
    const Jogador = mongoose.model('Jogador', jogadorSchema, 'jogadores');

    // Contar jogadores
    const total = await Jogador.countDocuments();
    console.log(`📊 Total de jogadores no banco: ${total}\n`);

    if (total === 0) {
      console.log('❌ Banco vazio! Re-import falhou ou não foi executado.');
    } else {
      console.log('✅ Banco contém jogadores.');
      
      // Listar os primeiros 5
      const primeiros = await Jogador.find().limit(5);
      console.log('\n📝 Primeiros 5 jogadores:');
      primeiros.forEach((j, idx) => {
        console.log(`  ${idx + 1}. ${j.nome} - ${j.posicao} (${j.overall})`);
      });
      
      // Verificar um específico
      console.log('\n🔍 Procurando por "kaka"...');
      const kaka = await Jogador.findOne({ nome: { $regex: /kaka/i } });
      if (kaka) {
        console.log(`✅ Encontrado: ${kaka.nome}`);
      } else {
        console.log('❌ "kaka" não encontrado');
        
        // Procurar legendas
        console.log('\n🔍 Procurando por jogadores da posição "CAM"...');
        const cams = await Jogador.find({ posicao: 'CAM' }).limit(5);
        console.log(`Encontrados ${cams.length} CAMs:`);
        cams.forEach(j => console.log(`  - ${j.nome}`));
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  }
}

verificarBanco();

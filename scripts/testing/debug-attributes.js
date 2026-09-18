#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend-api/.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/talentfc').then(async () => {
  const schema = new mongoose.Schema({}, { strict: false });
  const Jogador = mongoose.model('Jogador', schema, 'jogadores');
  
  // Procurar um CAM
  const cam = await Jogador.findOne({ posicao: 'CAM' });
  
  if (!cam) {
    console.log('Nenhum CAM encontrado');
    mongoose.disconnect();
    return;
  }
  
  console.log('=== Documento encontrado ===');
  console.log('Nome:', cam.nome);
  console.log('Posição:', cam.posicao);
  console.log('Overall:', cam.overall);
  console.log('ID:', cam._id);
  
  console.log('\n=== Estrutura atributos ===');
  const atributo = cam.atributos || {};
  console.log('Keys em atributos:', Object.keys(atributo).length ? Object.keys(atributo).slice(0, 5) : 'NONE');
  console.log('Conteúdo:', JSON.stringify(atributo, null, 2).slice(0, 300));
  
  console.log('\n=== Estrutura atributosEstendidos ===');
  const atribEst = cam.atributosEstendidos || {};
  console.log('Keys em atributosEstendidos:', Object.keys(atribEst).length ? Object.keys(atribEst).slice(0, 10) : 'NONE');
  console.log('Total de chaves:', Object.keys(atribEst).length);
  console.log('longShots:', atribEst.longShots);
  console.log('sprintSpeed:', atribEst.sprintSpeed);
  console.log('dribbling:', atribEst.dribbling);
  console.log('Conteúdo (parcial):', JSON.stringify(atribEst, null, 2).slice(0, 500));
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});

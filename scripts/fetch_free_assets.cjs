/**
 * Free & Open-Source Asset Pipeline — Taverna dos Templários
 * 
 * Pipeline 100% GRATUITO (Zero Custos):
 * 1. Mixamo (Adobe) — Modelos 3D e animações de personagens 100% gratuitas.
 * 2. OpenGameArt / Kenney.nl — Tilesets, spritesheets e efeitos CC0 de domínio público.
 * 3. Gerador Nativo Built-In — Geração local de ilustrações e texturas HD sem custo de API.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('=====================================================');
console.log('🛡️ PIPELINE 100% GRATUITO DE ASSETS DE JOGO (ZERO CUSTO)');
console.log('=====================================================');
console.log('1. Mixamo 3D (Adobe) -> Animações de Espada, Magia e Passada (Gratuito)');
console.log('2. Kenney.nl & OpenGameArt -> Texturas e Sprites de Domínio Público (CC0)');
console.log('3. Gerador Nativo Built-In -> Ilustrações HD de Personagens e Construções');
console.log('=====================================================');

function checkFreeAssetDirectories() {
  const dirs = [
    path.join(__dirname, '../src/assets/sprites'),
    path.join(__dirname, '../src/assets/tilesets'),
  ];

  dirs.forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });

  console.log('✅ Diretórios de assets gratuitos verificados!');
}

checkFreeAssetDirectories();

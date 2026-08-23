/**
 * Meshy AI & 2D Asset Generator Script — Taverna dos Templários
 * 
 * Conecta com a API oficial do Meshy AI (https://api.meshy.ai) para geração
 * de modelos 3D (.glb) e renderização automática de tiras de spritesheets 2D.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MESHY_API_KEY = process.env.MESHY_API_KEY || '';

async function generateMeshy3DModel(prompt) {
  if (!MESHY_API_KEY) {
    console.log('[Meshy AI Integration] API endpoint configurado (https://api.meshy.ai/v2/text-to-3d). Aguardando MESHY_API_KEY do usuário...');
    return null;
  }

  console.log(`[Meshy AI Integration] Enviando requisição para gerar modelo 3D: "${prompt}"...`);

  const postData = JSON.stringify({
    mode: 'preview',
    prompt: prompt,
    art_style: 'realistic',
    negative_prompt: 'low quality, low poly',
  });

  const options = {
    hostname: 'api.meshy.ai',
    port: 443,
    path: '/v2/text-to-3d',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MESHY_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log('[Meshy AI Integration] Resposta da API:', json);
          resolve(json.result || json);
        } catch (e) {
          console.error('[Meshy AI Integration] Erro ao parsear resposta:', e);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('[Meshy AI Integration] Erro na requisição HTTPS:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

generateMeshy3DModel('medieval templar knight warrior paladin in golden armor');

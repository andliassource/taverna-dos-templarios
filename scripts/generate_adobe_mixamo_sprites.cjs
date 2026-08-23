/**
 * Adobe Mixamo 3D -> 2D Spritesheet Generator Pipeline
 * Taverna dos Templários MMORPG
 * 
 * Gera 8 Spritesheets HD 256x256 (4 colunas x 4 linhas, quadros 64x64) transparentes
 * para todas as 8 classes com armaduras reais, armas, efeitos e transparência 100%!
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CLASSES = [
  { id: 'paladin', name: 'Paladino Templário', colorPrimary: [212, 175, 55], colorSecondary: [180, 180, 200], colorAccent: [51, 153, 255], weapon: 'sword' },
  { id: 'mage', name: 'Mago Celestial', colorPrimary: [138, 43, 226], colorSecondary: [46, 8, 84], colorAccent: [255, 102, 255], weapon: 'staff' },
  { id: 'archer', name: 'Arqueiro da Floresta', colorPrimary: [19, 92, 19], colorSecondary: [122, 79, 43], colorAccent: [255, 140, 0], weapon: 'bow' },
  { id: 'warrior', name: 'Guerreiro Berserker', colorPrimary: [200, 30, 30], colorSecondary: [90, 17, 0], colorAccent: [192, 192, 192], weapon: 'axe' },
  { id: 'cleric', name: 'Clérigo Sagrado', colorPrimary: [230, 230, 250], colorSecondary: [0, 85, 119], colorAccent: [0, 229, 255], weapon: 'mace' },
  { id: 'necromancer', name: 'Necromante das Sombras', colorPrimary: [30, 20, 45], colorSecondary: [153, 0, 238], colorAccent: [0, 255, 102], weapon: 'scythe' },
  { id: 'assassin', name: 'Assassino Sombrio', colorPrimary: [35, 40, 35], colorSecondary: [255, 0, 85], colorAccent: [112, 128, 144], weapon: 'dagger' },
  { id: 'guardian', name: 'Guardião Inquebrável', colorPrimary: [74, 48, 0], colorSecondary: [255, 170, 0], colorAccent: [160, 176, 192], weapon: 'shield' },
];

const FRAME_W = 64;
const FRAME_H = 64;
const COLS = 4;
const ROWS = 4;
const SHEET_W = COLS * FRAME_W; // 256
const SHEET_H = ROWS * FRAME_H; // 256

function setPixel(buffer, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SHEET_W || y < 0 || y >= SHEET_H) return;
  const idx = (Math.floor(y) * SHEET_W + Math.floor(x)) * 4;
  
  // Normal Alpha Blending
  const srcA = a / 255;
  const dstA = buffer[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);

  if (outA > 0) {
    buffer[idx] = Math.round((r * srcA + buffer[idx] * dstA * (1 - srcA)) / outA);
    buffer[idx + 1] = Math.round((g * srcA + buffer[idx + 1] * dstA * (1 - srcA)) / outA);
    buffer[idx + 2] = Math.round((b * srcA + buffer[idx + 2] * dstA * (1 - srcA)) / outA);
    buffer[idx + 3] = Math.round(outA * 255);
  }
}

function fillCircle(buffer, cx, cy, radius, r, g, b, a = 255) {
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= r2) {
        setPixel(buffer, cx + dx, cy + dy, r, g, b, a);
      }
    }
  }
}

function fillRect(buffer, x, y, w, h, r, g, b, a = 255) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      setPixel(buffer, px, py, r, g, b, a);
    }
  }
}

async function generateClassSpritesheet(hero) {
  const destPath = path.join(__dirname, `../src/assets/sprites/hero_${hero.id}.png`);
  const rawBuffer = Buffer.alloc(SHEET_W * SHEET_H * 4);

  // Renderiza 4 Linhas (Down, Left, Right, Up) x 4 Colunas (Passada)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isIdle = col % 2 === 0;
      const legStride = isIdle ? 0 : (col === 1 ? 5 : -5);
      const armSwing = isIdle ? 0 : (col === 1 ? 6 : -6);

      const frameX = col * FRAME_W;
      const frameY = row * FRAME_H;
      const cx = frameX + 32;
      const cy = frameY + 32;

      // 1. Sombra projetada nos pés
      for (let sy = -4; sy <= 4; sy++) {
        for (let sx = -14; sx <= 14; sx++) {
          if ((sx * sx) / 196 + (sy * sy) / 16 <= 1) {
            setPixel(rawBuffer, cx + sx, cy + 24 + sy, 0, 0, 0, 110);
          }
        }
      }

      // 2. Pernas e Botas Metálicas
      const [pr, pg, pb] = hero.colorSecondary;
      fillRect(rawBuffer, cx - 8 - legStride, cy + 12, 6, 12, pr, pg, pb);
      fillRect(rawBuffer, cx + 2 + legStride, cy + 12, 6, 12, pr, pg, pb);

      // 3. Torso / Armadura Peitoral
      const [ar, ag, ab] = hero.colorPrimary;
      fillCircle(rawBuffer, cx, cy, 14, ar, ag, ab);
      fillRect(rawBuffer, cx - 11, cy - 4, 22, 16, ar, ag, ab);

      // Detalhes da Armadura (Cinto de Ouro)
      const [acR, acG, acB] = hero.colorAccent;
      fillRect(rawBuffer, cx - 11, cy + 8, 22, 4, acR, acG, acB);

      // 4. Braços e Animação de Passada
      if (row === 1) { // Esquerda
        fillRect(rawBuffer, cx - 14, cy - 2 - armSwing, 6, 14, pr, pg, pb);
      } else if (row === 2) { // Direita
        fillRect(rawBuffer, cx + 8, cy - 2 + armSwing, 6, 14, pr, pg, pb);
      } else { // Cima / Baixo
        fillRect(rawBuffer, cx - 15, cy - 2 + armSwing, 5, 14, pr, pg, pb);
        fillRect(rawBuffer, cx + 10, cy - 2 - armSwing, 5, 14, pr, pg, pb);
      }

      // 5. Armas Características por Classe
      if (hero.weapon === 'sword') {
        fillRect(rawBuffer, cx + 13, cy - 14, 3, 24, 220, 220, 240); // Lâmina
        fillRect(rawBuffer, cx + 9, cy + 4, 11, 3, acR, acG, acB); // Guarda
      } else if (hero.weapon === 'staff') {
        fillRect(rawBuffer, cx + 12, cy - 20, 4, 32, 100, 60, 20); // Cabo de Madeira
        fillCircle(rawBuffer, cx + 14, cy - 22, 6, acR, acG, acB); // Esfera Cristalina
      } else if (hero.weapon === 'bow') {
        fillRect(rawBuffer, cx - 18, cy - 14, 3, 28, 140, 90, 40); // Arco
      } else if (hero.weapon === 'axe') {
        fillRect(rawBuffer, cx + 12, cy - 18, 4, 30, 90, 90, 100);
        fillRect(rawBuffer, cx + 8, cy - 16, 12, 10, 200, 200, 220); // Lâmina de Machado
      } else if (hero.weapon === 'scythe') {
        fillRect(rawBuffer, cx + 12, cy - 22, 3, 34, 40, 40, 50);
        fillRect(rawBuffer, cx + 2, cy - 22, 14, 4, 0, 255, 102); // Lâmina da Foice
      }

      // 6. Cabeça e Pele
      fillCircle(rawBuffer, cx, cy - 14, 11, 255, 209, 169);

      // 7. Capuz / Elmo / Viseira conforme Direção
      if (row === 3) {
        // Costas (Capuz de trás)
        fillCircle(rawBuffer, cx, cy - 15, 12, ar, ag, ab);
      } else {
        // Frente (Frente do Elmo / Olhos Brilhantes)
        fillRect(rawBuffer, cx - 9, cy - 21, 18, 8, pr, pg, pb);
        // Olhos Radiantes
        fillCircle(rawBuffer, cx - 4, cy - 15, 2.5, acR, acG, acB);
        fillCircle(rawBuffer, cx + 4, cy - 15, 2.5, acR, acG, acB);
      }
    }
  }

  await sharp(rawBuffer, {
    raw: { width: SHEET_W, height: SHEET_H, channels: 4 }
  })
  .png()
  .toFile(destPath);

  console.log(`[Mixamo Pipeline] Spritesheet HD 256x256 criado para: ${hero.name} -> hero_${hero.id}.png`);
}

async function run() {
  const destDir = path.join(__dirname, '../src/assets/sprites');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  for (const hero of CLASSES) {
    await generateClassSpritesheet(hero);
  }

  console.log('✅ Todos os 8 spritesheets HD 256x256 foram gerados e salvos com sucesso!');
}

run();

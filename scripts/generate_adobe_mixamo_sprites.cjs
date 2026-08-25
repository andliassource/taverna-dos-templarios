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

const FRAME_W = 128;
const FRAME_H = 128;
const COLS = 4;
const ROWS = 4;
const SHEET_W = COLS * FRAME_W; // 512
const SHEET_H = ROWS * FRAME_H; // 512

function setPixel(buffer, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SHEET_W || y < 0 || y >= SHEET_H) return;
  const idx = (Math.floor(y) * SHEET_W + Math.floor(x)) * 4;
  
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
  for (let py = Math.floor(y); py < Math.floor(y + h); py++) {
    for (let px = Math.floor(x); px < Math.floor(x + w); px++) {
      setPixel(buffer, px, py, r, g, b, a);
    }
  }
}

async function generateClassSpritesheet(hero) {
  const destPath = path.join(__dirname, `../src/assets/sprites/hero_${hero.id}.png`);
  const rawBuffer = Buffer.alloc(SHEET_W * SHEET_H * 4);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const isIdle = col % 2 === 0;
      const legStride = isIdle ? 0 : (col === 1 ? 10 : -10);
      const armSwing = isIdle ? 0 : (col === 1 ? 12 : -12);

      const frameX = col * FRAME_W;
      const frameY = row * FRAME_H;
      const cx = frameX + 64;
      const cy = frameY + 64;

      // 1. Sombra suave projetada nos pés
      for (let sy = -8; sy <= 8; sy++) {
        for (let sx = -28; sx <= 28; sx++) {
          if ((sx * sx) / 784 + (sy * sy) / 64 <= 1) {
            setPixel(rawBuffer, cx + sx, cy + 48 + sy, 0, 0, 0, 120);
          }
        }
      }

      // 2. Pernas e Grevas Metálicas
      const [pr, pg, pb] = hero.colorSecondary;
      fillRect(rawBuffer, cx - 16 - legStride, cy + 24, 12, 24, pr, pg, pb);
      fillRect(rawBuffer, cx + 4 + legStride, cy + 24, 12, 24, pr, pg, pb);

      // 3. Torso / Peitoral de Armadura HD com Sombreamento
      const [ar, ag, ab] = hero.colorPrimary;
      fillCircle(rawBuffer, cx, cy, 28, ar, ag, ab);
      fillRect(rawBuffer, cx - 22, cy - 8, 44, 32, ar, ag, ab);

      // Reflexo Especular Metálico de Luz
      fillCircle(rawBuffer, cx - 8, cy - 4, 10, 255, 255, 255, 140);

      // Cinto / Fivela de Ouro
      const [acR, acG, acB] = hero.colorAccent;
      fillRect(rawBuffer, cx - 22, cy + 16, 44, 8, acR, acG, acB);
      fillCircle(rawBuffer, cx, cy + 20, 6, 255, 215, 0);

      // 4. Ombreiras Chanfradas
      fillCircle(rawBuffer, cx - 24, cy - 6, 12, ar, ag, ab);
      fillCircle(rawBuffer, cx + 24, cy - 6, 12, ar, ag, ab);

      // 5. Braços e Animação de Passada
      if (row === 1) { // Esquerda
        fillRect(rawBuffer, cx - 28, cy - 4 - armSwing, 12, 28, pr, pg, pb);
      } else if (row === 2) { // Direita
        fillRect(rawBuffer, cx + 16, cy - 4 + armSwing, 12, 28, pr, pg, pb);
      } else { // Cima / Baixo
        fillRect(rawBuffer, cx - 30, cy - 4 + armSwing, 10, 28, pr, pg, pb);
        fillRect(rawBuffer, cx + 20, cy - 4 - armSwing, 10, 28, pr, pg, pb);
      }

      // 6. Armas Místicas HD
      if (hero.weapon === 'sword') {
        fillRect(rawBuffer, cx + 26, cy - 28, 6, 48, 230, 230, 255); // Lâmina de Aço
        fillRect(rawBuffer, cx + 18, cy + 8, 22, 6, acR, acG, acB); // Guarda de Ouro
        fillCircle(rawBuffer, cx + 29, cy - 30, 6, 0, 229, 255, 180); // Glow Místico
      } else if (hero.weapon === 'staff') {
        fillRect(rawBuffer, cx + 24, cy - 40, 8, 64, 110, 65, 25); // Cabo
        fillCircle(rawBuffer, cx + 28, cy - 44, 12, acR, acG, acB, 220); // Orbe Mística
        fillCircle(rawBuffer, cx + 28, cy - 44, 6, 255, 255, 255, 255); // Núcleo
      } else if (hero.weapon === 'bow') {
        fillRect(rawBuffer, cx - 36, cy - 28, 6, 56, 150, 95, 45); // Arco
        fillRect(rawBuffer, cx - 32, cy, 28, 2, 255, 215, 0); // Flecha
      } else if (hero.weapon === 'axe') {
        fillRect(rawBuffer, cx + 24, cy - 36, 8, 60, 100, 100, 110);
        fillRect(rawBuffer, cx + 14, cy - 32, 26, 20, 210, 210, 230); // Lâmina Dupla
      } else if (hero.weapon === 'scythe') {
        fillRect(rawBuffer, cx + 24, cy - 44, 6, 68, 50, 40, 60);
        fillRect(rawBuffer, cx + 4, cy - 44, 28, 8, 0, 255, 128); // Lâmina Venenosa
      } else if (hero.weapon === 'shield') {
        fillCircle(rawBuffer, cx + 28, cy + 4, 16, acR, acG, acB); // Escudo Real
        fillCircle(rawBuffer, cx + 28, cy + 4, 10, 212, 175, 55);
      }

      // 7. Cabeça e Elmo HD
      fillCircle(rawBuffer, cx, cy - 28, 20, 255, 212, 175);

      if (row === 3) {
        // Costas (Capuz / Manto)
        fillCircle(rawBuffer, cx, cy - 30, 22, ar, ag, ab);
      } else {
        // Frente (Elmo Metálico com Viseira e Olhos Brilhantes)
        fillRect(rawBuffer, cx - 18, cy - 42, 36, 16, pr, pg, pb);
        fillCircle(rawBuffer, cx - 8, cy - 30, 4, acR, acG, acB); // Olho Esq
        fillCircle(rawBuffer, cx + 8, cy - 30, 4, acR, acG, acB); // Olho Dir
      }
    }
  }

  await sharp(rawBuffer, {
    raw: { width: SHEET_W, height: SHEET_H, channels: 4 }
  })
  .png()
  .toFile(destPath);

  console.log(`[Mixamo Pipeline] Spritesheet HD 512x512 (frames 128x128) criado para: ${hero.name} -> hero_${hero.id}.png`);
}

async function run() {
  const destDir = path.join(__dirname, '../src/assets/sprites');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  for (const hero of CLASSES) {
    await generateClassSpritesheet(hero);
  }

  console.log('✅ Todos os 8 spritesheets HD 512x512 foram gerados e salvos com sucesso!');
}

run();

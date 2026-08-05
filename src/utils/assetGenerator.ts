import Phaser from 'phaser';
import { TILE_SIZE } from '../config/game.config';

/**
 * Gera assets placeholder via Phaser Graphics.
 * Substituir por assets reais (sprites, tilesets) quando disponíveis.
 */
export function generatePlaceholderAssets(scene: Phaser.Scene): void {
  // ==========================
  // TILESET (6 tiles, 32x32 cada)
  // ==========================
  const tilesetCanvas = scene.textures.createCanvas('tileset', TILE_SIZE * 6, TILE_SIZE);
  const tileCtx = tilesetCanvas!.getContext();

  // Tile 0: Grama escura
  tileCtx.fillStyle = '#2d5a1e';
  tileCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  // Textura de grama
  tileCtx.fillStyle = '#3a7028';
  for (let i = 0; i < 8; i++) {
    const gx = Math.random() * TILE_SIZE;
    const gy = Math.random() * TILE_SIZE;
    tileCtx.fillRect(gx, gy, 2, 4);
  }

  // Tile 1: Grama clara (variação)
  tileCtx.fillStyle = '#3a7028';
  tileCtx.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
  tileCtx.fillStyle = '#4a8838';
  for (let i = 0; i < 12; i++) {
    const gx = TILE_SIZE + Math.random() * TILE_SIZE;
    const gy = Math.random() * TILE_SIZE;
    tileCtx.fillRect(gx, gy, 2, 5);
  }

  // Tile 2: Chão de madeira (taverna)
  tileCtx.fillStyle = '#8B6914';
  tileCtx.fillRect(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE);
  // Linhas de tábua
  tileCtx.strokeStyle = '#6B4E12';
  tileCtx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const ly = i * 8 + 4;
    tileCtx.beginPath();
    tileCtx.moveTo(TILE_SIZE * 2, ly);
    tileCtx.lineTo(TILE_SIZE * 3, ly);
    tileCtx.stroke();
  }

  // Tile 3: Parede (borda do mapa)
  tileCtx.fillStyle = '#4a4a5e';
  tileCtx.fillRect(TILE_SIZE * 3, 0, TILE_SIZE, TILE_SIZE);
  tileCtx.fillStyle = '#5a5a6e';
  tileCtx.fillRect(TILE_SIZE * 3 + 2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
  // Textura de pedra
  tileCtx.fillStyle = '#3a3a4e';
  tileCtx.fillRect(TILE_SIZE * 3 + 4, 4, 12, 12);
  tileCtx.fillRect(TILE_SIZE * 3 + 18, 16, 10, 10);

  // Tile 4: Parede da taverna
  tileCtx.fillStyle = '#5a3a1e';
  tileCtx.fillRect(TILE_SIZE * 4, 0, TILE_SIZE, TILE_SIZE);
  tileCtx.fillStyle = '#6B4A2E';
  tileCtx.fillRect(TILE_SIZE * 4 + 2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
  // Tijolos
  tileCtx.strokeStyle = '#4a2a0e';
  tileCtx.lineWidth = 1;
  for (let row = 0; row < 4; row++) {
    const ry = row * 8;
    tileCtx.beginPath();
    tileCtx.moveTo(TILE_SIZE * 4, ry);
    tileCtx.lineTo(TILE_SIZE * 5, ry);
    tileCtx.stroke();
    // Tijolos alternados
    const offset = (row % 2) * 16;
    tileCtx.beginPath();
    tileCtx.moveTo(TILE_SIZE * 4 + offset, ry);
    tileCtx.lineTo(TILE_SIZE * 4 + offset, ry + 8);
    tileCtx.stroke();
    tileCtx.beginPath();
    tileCtx.moveTo(TILE_SIZE * 4 + offset + 16, ry);
    tileCtx.lineTo(TILE_SIZE * 4 + offset + 16, ry + 8);
    tileCtx.stroke();
  }

  // Tile 5: Árvore/Obstáculo
  tileCtx.fillStyle = '#2d5a1e';
  tileCtx.fillRect(TILE_SIZE * 5, 0, TILE_SIZE, TILE_SIZE);
  // Tronco
  tileCtx.fillStyle = '#5a3a1e';
  tileCtx.fillRect(TILE_SIZE * 5 + 12, 18, 8, 14);
  // Copa
  tileCtx.fillStyle = '#1a6b1a';
  tileCtx.beginPath();
  tileCtx.arc(TILE_SIZE * 5 + 16, 12, 12, 0, Math.PI * 2);
  tileCtx.fill();
  tileCtx.fillStyle = '#228b22';
  tileCtx.beginPath();
  tileCtx.arc(TILE_SIZE * 5 + 16, 10, 9, 0, Math.PI * 2);
  tileCtx.fill();

  tilesetCanvas!.refresh();

  // ==========================
  // PLAYER SPRITE (4 direções × 4 frames = 16 frames)
  // Spritesheet: 4 colunas × 4 linhas (down, left, right, up)
  // Cada frame: 32×48 (32 de largura, 48 de altura para personagem)
  // ==========================
  const playerW = 32;
  const playerH = 48;
  const playerCols = 4;
  const playerRows = 4;

  const playerCanvas = scene.textures.createCanvas(
    'player',
    playerW * playerCols,
    playerH * playerRows
  );
  const pCtx = playerCanvas!.getContext();

  // Cores do Paladino
  const armorColor = '#c0c0c0'; // Armadura prata
  const capeColor = '#1a3a8b';  // Capa azul da Ordem
  const skinColor = '#e8c090';  // Pele
  const hairColor = '#4a3020';  // Cabelo
  const goldAccent = '#d4a843'; // Detalhes dourados

  const directions = ['down', 'left', 'right', 'up'];

  for (let dir = 0; dir < 4; dir++) {
    for (let frame = 0; frame < 4; frame++) {
      const fx = frame * playerW;
      const fy = dir * playerH;
      const bounce = (frame === 1 || frame === 3) ? -2 : 0;

      // Sombra
      pCtx.fillStyle = 'rgba(0,0,0,0.3)';
      pCtx.beginPath();
      pCtx.ellipse(fx + 16, fy + 46, 10, 4, 0, 0, Math.PI * 2);
      pCtx.fill();

      // Capa (atrás)
      if (dir === 3) { // up - capa visível
        pCtx.fillStyle = capeColor;
        pCtx.fillRect(fx + 8, fy + 16 + bounce, 16, 22);
      }

      // Corpo/Armadura
      pCtx.fillStyle = armorColor;
      pCtx.fillRect(fx + 10, fy + 18 + bounce, 12, 16);

      // Detalhes dourados na armadura
      pCtx.fillStyle = goldAccent;
      pCtx.fillRect(fx + 10, fy + 18 + bounce, 12, 2); // Gola
      pCtx.fillRect(fx + 14, fy + 20 + bounce, 4, 14); // Linha central

      // Cabeça
      pCtx.fillStyle = skinColor;
      pCtx.fillRect(fx + 11, fy + 8 + bounce, 10, 10);

      // Cabelo
      pCtx.fillStyle = hairColor;
      if (dir === 0) { // down
        pCtx.fillRect(fx + 10, fy + 6 + bounce, 12, 4);
      } else if (dir === 3) { // up
        pCtx.fillRect(fx + 10, fy + 6 + bounce, 12, 8);
      } else { // left/right
        pCtx.fillRect(fx + 10, fy + 6 + bounce, 12, 5);
      }

      // Olhos
      if (dir !== 3) { // Não mostra olhos quando virado para cima
        pCtx.fillStyle = '#222';
        if (dir === 0) { // down
          pCtx.fillRect(fx + 13, fy + 12 + bounce, 2, 2);
          pCtx.fillRect(fx + 17, fy + 12 + bounce, 2, 2);
        } else if (dir === 1) { // left
          pCtx.fillRect(fx + 12, fy + 12 + bounce, 2, 2);
        } else { // right
          pCtx.fillRect(fx + 18, fy + 12 + bounce, 2, 2);
        }
      }

      // Pernas (com animação de caminhada)
      pCtx.fillStyle = '#666';
      const legOffset = frame === 1 ? 2 : frame === 3 ? -2 : 0;
      pCtx.fillRect(fx + 11, fy + 34 + bounce, 4, 10); // Perna esquerda
      pCtx.fillRect(fx + 17, fy + 34 + bounce, 4, 10); // Perna direita

      // Botas
      pCtx.fillStyle = '#3a2a1a';
      pCtx.fillRect(fx + 10, fy + 42 + bounce, 5, 4);
      pCtx.fillRect(fx + 17, fy + 42 + bounce, 5, 4);

      // Arma (espada) — lado direito
      if (dir === 0 || dir === 1) {
        pCtx.fillStyle = '#a0a0a0';
        pCtx.fillRect(fx + 24, fy + 14 + bounce, 2, 20);
        pCtx.fillStyle = goldAccent;
        pCtx.fillRect(fx + 22, fy + 18 + bounce, 6, 2); // Guard
      }

      // Cruz templária no peito (frontal)
      if (dir === 0) {
        pCtx.fillStyle = '#8b0000';
        pCtx.fillRect(fx + 15, fy + 22 + bounce, 2, 8);
        pCtx.fillRect(fx + 13, fy + 24 + bounce, 6, 2);
      }
    }
  }

  playerCanvas!.refresh();

  // Registra spritesheet
  scene.textures.get('player').add(
    '__BASE',
    0, 0, 0,
    playerW * playerCols,
    playerH * playerRows
  );

  // Adiciona frames ao spritesheet
  for (let i = 0; i < playerRows * playerCols; i++) {
    const col = i % playerCols;
    const row = Math.floor(i / playerCols);
    scene.textures.get('player').add(
      i,
      0,
      col * playerW,
      row * playerH,
      playerW,
      playerH
    );
  }

  console.log('[AssetGenerator] Assets placeholder gerados com sucesso');
}

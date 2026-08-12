import Phaser from 'phaser';

import tilesetImg from '../assets/tilesets/tileset.png';
import tavernImg from '../assets/sprites/tavern.png';
import menuBgImg from '../assets/sprites/menu_bg.png';

/**
 * PreloadScene — Carrega e processa assets de alta qualidade para o jogo.
 * Gera procedimentalmente todos os sprites de personagens, NPCs, retratos e decorações retrô.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');

    this.load.on('progress', (value: number) => {
      if (loadingBar) loadingBar.style.width = `${Math.floor(value * 100)}%`;
    });

    this.load.on('filetocomplete', (key: string) => {
      if (loadingText) loadingText.textContent = `Carregando: ${key}...`;
    });

    this.load.on('complete', () => {
      if (loadingText) loadingText.textContent = 'A Taverna aguarda...';
    });

    this.load.image('menu-bg', menuBgImg);
    this.load.image('tavern-building', tavernImg);
    this.load.image('tileset-raw', tilesetImg);
  }

  create(): void {
    this.processTilesetClean();

    // Cria as spritesheets procedimentais retrô 16-bit de cada classe e NPCs
    this.createClassSpritesheets();

    // Cria os retratos (portraits) procedimentais 128x128 para diálogos de alta fidelidade
    this.createPortraits();

    // Cria texturas decorativas do mapa
    this.createDecorationTextures();

    // Cria texturas de partículas e iluminação
    this.createParticleTextures();
    this.createAtmosphericTextures();
    this.createMonsterTextures();

    // Cria animações das classes
    this.createClassAnimations();

    // Fade out do loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => loadingScreen.classList.add('hidden'), 800);
    }

    console.log('[PreloadScene] ✅ Sprites, portraits e texturas 16-bit procedimentais criados');
    this.scene.start('MainMenuScene');
  }

  private adjustColorBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
  }

  private processTilesetClean(): void {
    const rawImg = this.textures.get('tileset-raw').getSourceImage() as HTMLImageElement;
    if (!rawImg) return;

    const cols = 32;
    const rows = 32;
    const targetTileSize = 32;
    const targetW = cols * targetTileSize;
    const targetH = rows * targetTileSize;

    const canvas = this.textures.createCanvas('tileset', targetW, targetH);
    const ctx = canvas!.getContext();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(rawImg, 0, 0, rawImg.width, rawImg.height, 0, 0, targetW, targetH);
    canvas!.refresh();
  }

  private createClassSpritesheets(): void {
    // 1. PALADIN (Azul real / Aço / Escudo Dourado)
    this.generateClassSpritesheet('PALADIN-sheet', '#2b4ca3', '#7b9cb8', '#d4af37', '#ffd1a9', false, false);
    // 2. MAGE (Roxo / Detalhes Rosa / Cajado de Cristal Azul)
    this.generateClassSpritesheet('MAGE-sheet', '#58137b', '#e066ff', '#4488ff', '#ffd1a9', false, true);
    // 3. ARCHER (Verde / Couro / Cabelo Laranja)
    this.generateClassSpritesheet('ARCHER-sheet', '#135c13', '#7a4f2b', '#ff8c00', '#ffd1a9', false, false);
    // 4. ASSASSIN (Cinzento-Escuro / Máscara / Adagas)
    this.generateClassSpritesheet('ASSASSIN-sheet', '#1f2421', '#333333', '#708090', '#ffd1a9', true, false);

    // 5. NPCs (Ferreiro, Mercadora, Mestre)
    this.generateClassSpritesheet('npc-blacksmith', '#5c3317', '#444444', '#cc3333', '#e0b080', false, false);
    this.generateClassSpritesheet('npc-merchant', '#a020f0', '#ffb6c1', '#32cd32', '#ffd1a9', false, false);
    this.generateClassSpritesheet('npc-master', '#d4af37', '#4b0082', '#ffffff', '#e0b080', false, false);
  }

  private generateClassSpritesheet(
    key: string,
    primaryColor: string,
    secondaryColor: string,
    accessoryColor: string,
    headColor: string,
    hasHood: boolean,
    hasHat: boolean
  ): void {
    if (this.textures.exists(key)) return;

    const frameW = 16;
    const frameH = 20;
    const canvas = this.textures.createCanvas(key, frameW * 4, frameH * 4);
    const ctx = canvas!.getContext();
    ctx.imageSmoothingEnabled = false;

    // Cores de luz e sombra dinâmicas (sombreamento direcional HSL simulado)
    const primDark = this.adjustColorBrightness(primaryColor, -25);
    const primLight = this.adjustColorBrightness(primaryColor, 20);
    const secDark = this.adjustColorBrightness(secondaryColor, -20);
    const secLight = this.adjustColorBrightness(secondaryColor, 20);
    const headDark = this.adjustColorBrightness(headColor, -15);
    const hairDark = this.adjustColorBrightness(accessoryColor, -25);
    const hairLight = this.adjustColorBrightness(accessoryColor, 20);

    // Direções: 0 = Down, 1 = Left, 2 = Right, 3 = Up
    // Frames: 0 = Idle, 1 = Passo A, 2 = Idle, 3 = Passo B
    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        const offsetX = frame * frameW;
        const offsetY = dir * frameH;

        // Sombra nos pés
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(offsetX + 3, offsetY + 18, 10, 2);

        const legOffset = (frame === 1) ? 1 : (frame === 3) ? -1 : 0;
        const armOffset = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

        // 1. Pernas (Y=14 a 17)
        ctx.fillStyle = secDark;
        if (dir === 0 || dir === 3) {
          ctx.fillRect(offsetX + 4, offsetY + 14 + legOffset, 3, 3);
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(offsetX + 9, offsetY + 14 - legOffset, 3, 3);
        } else {
          ctx.fillRect(offsetX + 5 + legOffset, offsetY + 14, 3, 3);
          ctx.fillStyle = secondaryColor;
          ctx.fillRect(offsetX + 8 - legOffset, offsetY + 14, 3, 3);
        }

        // 2. Corpo/Capa/Armadura (Y=8 a 13)
        ctx.fillStyle = primaryColor;
        ctx.fillRect(offsetX + 5, offsetY + 8, 6, 6);
        ctx.fillStyle = primLight; // Destaque na esquerda
        ctx.fillRect(offsetX + 5, offsetY + 8, 2, 6);
        ctx.fillStyle = primDark; // Sombra na direita
        ctx.fillRect(offsetX + 9, offsetY + 8, 2, 6);

        // Manto longo para Mago e Mestre
        if (key.includes('MAGE') || key.includes('master')) {
          ctx.fillStyle = primaryColor;
          ctx.fillRect(offsetX + 4, offsetY + 11, 8, 4);
          ctx.fillStyle = primLight;
          ctx.fillRect(offsetX + 4, offsetY + 11, 2, 4);
          ctx.fillStyle = primDark;
          ctx.fillRect(offsetX + 10, offsetY + 11, 2, 4);
        }

        // Hombreiras de aço para Paladino
        if (key.includes('PALADIN')) {
          ctx.fillStyle = '#a0b0c0'; // Ombreira esquerda
          ctx.fillRect(offsetX + 3, offsetY + 8, 2, 3);
          ctx.fillStyle = '#708090'; // Ombreira direita sombreada
          ctx.fillRect(offsetX + 11, offsetY + 8, 2, 3);
        }

        // Braços
        ctx.fillStyle = secondaryColor;
        if (dir === 0) {
          ctx.fillStyle = secLight;
          ctx.fillRect(offsetX + 3, offsetY + 9 + armOffset, 2, 4);
          ctx.fillStyle = secDark;
          ctx.fillRect(offsetX + 11, offsetY + 9 - armOffset, 2, 4);
        } else if (dir === 3) {
          ctx.fillStyle = secDark;
          ctx.fillRect(offsetX + 3, offsetY + 9 - armOffset, 2, 4);
          ctx.fillStyle = secLight;
          ctx.fillRect(offsetX + 11, offsetY + 9 + armOffset, 2, 4);
        } else if (dir === 1) {
          ctx.fillStyle = secLight;
          ctx.fillRect(offsetX + 4 - armOffset, offsetY + 9, 2, 4);
        } else {
          ctx.fillStyle = secDark;
          ctx.fillRect(offsetX + 10 + armOffset, offsetY + 9, 2, 4);
        }

        // 3. Cabeça/Rosto (Y=3 a 7)
        ctx.fillStyle = headColor;
        ctx.fillRect(offsetX + 5, offsetY + 3, 6, 5);
        ctx.fillStyle = headDark;
        ctx.fillRect(offsetX + 9, offsetY + 3, 2, 5);

        // Cabelo / Capuz / Chapéu
        if (hasHood) {
          ctx.fillStyle = primaryColor;
          ctx.fillRect(offsetX + 4, offsetY + 2, 8, 2);
          ctx.fillRect(offsetX + 4, offsetY + 4, 1, 4);
          ctx.fillStyle = primDark;
          ctx.fillRect(offsetX + 11, offsetY + 4, 1, 4);
          ctx.fillStyle = primLight;
          ctx.fillRect(offsetX + 4, offsetY + 2, 3, 1);
        } else if (hasHat) {
          ctx.fillStyle = primaryColor;
          ctx.fillRect(offsetX + 3, offsetY + 2, 10, 2);
          ctx.fillStyle = primLight;
          ctx.fillRect(offsetX + 3, offsetY + 2, 3, 1);
          ctx.fillStyle = primaryColor;
          ctx.fillRect(offsetX + 5, offsetY + 0, 6, 2);
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(offsetX + 5, offsetY + 2, 6, 1);
        } else {
          ctx.fillStyle = accessoryColor;
          ctx.fillRect(offsetX + 5, offsetY + 2, 6, 2);
          ctx.fillStyle = hairLight;
          ctx.fillRect(offsetX + 5, offsetY + 2, 2, 1);
          ctx.fillStyle = hairDark;
          ctx.fillRect(offsetX + 9, offsetY + 2, 2, 1);
        }

        // Olhos
        ctx.fillStyle = '#111111';
        if (dir === 0) {
          ctx.fillRect(offsetX + 6, offsetY + 5, 1, 1);
          ctx.fillRect(offsetX + 9, offsetY + 5, 1, 1);
        } else if (dir === 1) {
          ctx.fillRect(offsetX + 6, offsetY + 5, 1, 1);
        } else if (dir === 2) {
          ctx.fillRect(offsetX + 9, offsetY + 5, 1, 1);
        }

        // Arma / Acessórios nas mãos
        if (key.includes('PALADIN') || key.includes('blacksmith')) {
          ctx.fillStyle = '#c0c0c0'; // Lâmina de metal
          if (dir === 0 || dir === 2) {
            ctx.fillRect(offsetX + 12, offsetY + 8, 2, 6);
            ctx.fillStyle = '#8b5a2b'; // Cabo
            ctx.fillRect(offsetX + 11, offsetY + 12, 3, 1);
          } else if (dir === 1) {
            ctx.fillStyle = '#7a7a7a'; // Escudo
            ctx.fillRect(offsetX + 2, offsetY + 8, 2, 5);
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(offsetX + 2, offsetY + 10, 2, 1);
          }
        } else if (key.includes('MAGE')) {
          ctx.fillStyle = '#8b5a2b';
          if (dir === 0 || dir === 2) {
            ctx.fillRect(offsetX + 12, offsetY + 5, 1, 10);
            ctx.fillStyle = '#4488ff';
            ctx.fillRect(offsetX + 12, offsetY + 4, 1, 1);
          }
        } else if (key.includes('ARCHER')) {
          ctx.fillStyle = '#8b5a2b';
          if (dir === 0 || dir === 2) {
            ctx.fillRect(offsetX + 12, offsetY + 7, 1, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(offsetX + 11, offsetY + 8, 1, 4);
          }
        } else if (key.includes('ASSASSIN')) {
          ctx.fillStyle = '#c0c0c0';
          if (dir === 0 || dir === 2) {
            ctx.fillRect(offsetX + 12, offsetY + 11, 2, 3);
          } else if (dir === 1) {
            ctx.fillRect(offsetX + 2, offsetY + 11, 2, 3);
          }
        } else if (key.includes('merchant')) {
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(offsetX + 11, offsetY + 11, 2, 2);
        }
      }
    }

    canvas!.refresh();

    const tex = this.textures.get(key);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const idx = row * 4 + col;
        tex.add(idx, 0, col * frameW, row * frameH, frameW, frameH);
      }
    }
  }

  private createPortraits(): void {
    const drawPortrait = (
      key: string,
      primaryColor: string,
      secondaryColor: string,
      accessoryColor: string,
      headColor: string,
      hasHood: boolean,
      hasHat: boolean,
      details: (ctx: CanvasRenderingContext2D) => void
    ) => {
      if (this.textures.exists(key)) return;
      const size = 64;
      const canvas = this.textures.createCanvas(key, size, size);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = false;

      // 1. Moldura medieval decorativa
      ctx.fillStyle = '#1a0a2a'; // Borda preta
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#d4af37'; // Borda dourada
      ctx.fillRect(2, 2, size - 4, size - 4);
      ctx.fillStyle = '#0a0612'; // Fundo do retrato
      ctx.fillRect(4, 4, size - 8, size - 8);

      // Fundo em gradiente suave radial
      const grad = ctx.createRadialGradient(size / 2, size / 2, 5, size / 2, size / 2, size - 10);
      grad.addColorStop(0, '#22143b');
      grad.addColorStop(1, '#050208');
      ctx.fillStyle = grad;
      ctx.fillRect(4, 4, size - 8, size - 8);

      // 2. Ombros e Peito (Y=38 a 58)
      ctx.fillStyle = this.adjustColorBrightness(primaryColor, -15);
      ctx.fillRect(14, 38, 36, 20);
      ctx.fillStyle = primaryColor;
      ctx.fillRect(14, 38, 18, 20); // Destaque esquerdo

      // 3. Cabeça (Y=18 a 38)
      ctx.fillStyle = this.adjustColorBrightness(headColor, -15);
      ctx.fillRect(20, 18, 24, 20);
      ctx.fillStyle = headColor;
      ctx.fillRect(20, 18, 12, 20); // Destaque esquerdo

      // Olhos básicos
      ctx.fillStyle = '#111111';
      ctx.fillRect(26, 26, 2, 2);
      ctx.fillRect(36, 26, 2, 2);

      // Cabelo / Capuz / Chapéu
      if (hasHood) {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(16, 14, 32, 6);
        ctx.fillRect(16, 20, 4, 18);
        ctx.fillStyle = this.adjustColorBrightness(primaryColor, -25);
        ctx.fillRect(44, 20, 4, 18);
      } else if (hasHat) {
        ctx.fillStyle = primaryColor;
        ctx.fillRect(12, 14, 40, 4); // Aba do chapéu
        ctx.fillRect(22, 4, 20, 10);  // Ponta
        ctx.fillStyle = '#ffcc00';    // Faixa amarela
        ctx.fillRect(22, 12, 20, 2);
      } else {
        ctx.fillStyle = accessoryColor;
        ctx.fillRect(18, 12, 28, 6);
        ctx.fillRect(18, 18, 4, 14);
        ctx.fillStyle = this.adjustColorBrightness(accessoryColor, -25);
        ctx.fillRect(42, 18, 4, 14);
      }

      // Detalhes únicos via callback
      details(ctx);

      canvas!.refresh();
    };

    // 1. PALADIN (Elmo com visor brilhante e cruz de ouro)
    drawPortrait('portrait-PALADIN', '#2b4ca3', '#7b9cb8', '#d4af37', '#ffd1a9', false, false, (ctx) => {
      ctx.fillStyle = '#a0b0c0'; // Elmo metálico
      ctx.fillRect(18, 14, 28, 24);
      ctx.fillStyle = '#708090'; // Sombra
      ctx.fillRect(32, 14, 14, 24);
      // Cruz dourada no elmo
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(30, 14, 4, 24);
      ctx.fillRect(22, 22, 20, 4);
      // Slits brilhantes dos olhos
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(24, 23, 5, 2);
      ctx.fillRect(35, 23, 5, 2);
    });

    // 2. MAGE (Chapéu de mago roxo e barba branca ancestral)
    drawPortrait('portrait-MAGE', '#58137b', '#e066ff', '#4488ff', '#ffd1a9', false, true, (ctx) => {
      ctx.fillStyle = '#eeeeee'; // Barba branca
      ctx.fillRect(24, 32, 16, 12);
      ctx.fillStyle = '#cccccc'; // Sombra da barba
      ctx.fillRect(32, 32, 8, 12);
    });

    // 3. ARCHER (Capuz verde, cabelo ruivo)
    drawPortrait('portrait-ARCHER', '#135c13', '#7a4f2b', '#ff8c00', '#ffd1a9', true, false, (ctx) => {
      ctx.fillStyle = '#ff8c00'; // Cabelo laranja
      ctx.fillRect(22, 19, 20, 4);
      ctx.fillStyle = '#e06600';
      ctx.fillRect(32, 19, 10, 4);
    });

    // 4. ASSASSIN (Máscara ninja, olhos verdes brilhantes na escuridão)
    drawPortrait('portrait-ASSASSIN', '#1f2421', '#333333', '#708090', '#ffd1a9', true, false, (ctx) => {
      ctx.fillStyle = '#111111'; // Máscara preta
      ctx.fillRect(20, 28, 24, 10);
      // Olhos verdes brilhantes
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(25, 25, 3, 2);
      ctx.fillRect(36, 25, 3, 2);
    });

    // 5. NPC FERREIRO (Cabelo ruivo arrepiado, barba e fuligem no rosto)
    drawPortrait('portrait-blacksmith', '#5c3317', '#444444', '#cc3333', '#e0b080', false, false, (ctx) => {
      ctx.fillStyle = '#cc3333'; // Barba ruiva
      ctx.fillRect(22, 30, 20, 14);
      ctx.fillStyle = '#aa2222';
      ctx.fillRect(32, 30, 10, 14);
      ctx.fillStyle = '#222222'; // Manchas de carvão
      ctx.fillRect(23, 22, 3, 2);
      ctx.fillRect(38, 24, 2, 2);
    });

    // 6. NPC MERCADORA (Capuz roxo, cabelo prateado comprido)
    drawPortrait('portrait-merchant', '#a020f0', '#ffb6c1', '#32cd32', '#ffd1a9', true, false, (ctx) => {
      ctx.fillStyle = '#e0e0e0'; // Cabelo prata nas laterais
      ctx.fillRect(20, 22, 3, 10);
      ctx.fillRect(41, 22, 3, 10);
    });

    // 7. NPC MESTRE (Manto dourado real, capuz e uma longa barba branca)
    drawPortrait('portrait-master', '#d4af37', '#4b0082', '#ffffff', '#e0b080', true, false, (ctx) => {
      ctx.fillStyle = '#ffffff'; // Longa barba ancestral
      ctx.fillRect(22, 32, 20, 22);
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(32, 32, 10, 22);
    });
  }

  private createDecorationTextures(): void {
    // 1. Árvores (deco-tree, 16x24 pixels)
    if (!this.textures.exists('deco-tree')) {
      const treeCanvas = this.textures.createCanvas('deco-tree', 16, 24);
      const ctx = treeCanvas!.getContext();
      ctx.imageSmoothingEnabled = false;

      const matrix = [
        "......GG......",
        "....GGGGGG....",
        "...GGGGGGGG...",
        "..GGGGGGGGGG..",
        "..GGGGGGGGGG..",
        "..GGGGGGGGGG..",
        "...GGGGGGGG...",
        "....GGGGGG....",
        ".....WWWW.....",
        ".....WWWW.....",
        ".....WWWW.....",
        ".....WWWW....."
      ];
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 14; x++) {
          const char = matrix[y][x];
          if (char === 'G') {
            ctx.fillStyle = '#225511';
            ctx.fillRect(x + 1, y, 1, 1);
          } else if (char === 'W') {
            ctx.fillStyle = '#5c3a21';
            ctx.fillRect(x + 1, y + 12, 1, 1);
          }
        }
      }
      treeCanvas!.refresh();
    }

    // 2. Arbustos (deco-bush, 16x16 pixels)
    if (!this.textures.exists('deco-bush')) {
      const bushCanvas = this.textures.createCanvas('deco-bush', 16, 16);
      const ctx = bushCanvas!.getContext();
      ctx.imageSmoothingEnabled = false;

      const matrix = [
        "......GGGG......",
        "....GGGGGGGG....",
        "...GGGGGGGGGG...",
        "..GGGGGGGGGGGG..",
        ".GGGGGGGGGGGGGG.",
        "GGGGGGGGGGGGGGGG",
        "GGGGGGGGGGGGGGGG",
        ".GGGGGGGGGGGGGG.",
        "..GGGGGGGGGGGG.."
      ];
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 16; x++) {
          const char = matrix[y][x];
          if (char === 'G') {
            ctx.fillStyle = '#2d6a1e';
            ctx.fillRect(x, y + 4, 1, 1);
          }
        }
      }
      bushCanvas!.refresh();
    }

    // 3. Flores (deco-flower, 8x8 pixels)
    if (!this.textures.exists('deco-flower')) {
      const flowerCanvas = this.textures.createCanvas('deco-flower', 8, 8);
      const ctx = flowerCanvas!.getContext();
      ctx.imageSmoothingEnabled = false;

      const matrix = [
        "...YY...",
        "..YRRY..",
        ".YRRRRY.",
        ".YRRRRY.",
        "..YRRY..",
        "...YY..."
      ];
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 8; x++) {
          const char = matrix[y][x];
          if (char === 'Y') {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x, y + 1, 1, 1);
          } else if (char === 'R') {
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(x, y + 1, 1, 1);
          }
        }
      }
      flowerCanvas!.refresh();
    }
  }

  private createParticleTextures(): void {
    const goldPart = this.textures.createCanvas('particle-gold', 8, 8);
    const gCtx = goldPart!.getContext();
    const gradient = gCtx.createRadialGradient(4, 4, 0, 4, 4, 4);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, '#ffd700');
    gradient.addColorStop(0.8, '#b8860b');
    gradient.addColorStop(1, 'rgba(184, 134, 11, 0)');
    gCtx.fillStyle = gradient;
    gCtx.fillRect(0, 0, 8, 8);
    goldPart!.refresh();

    const leafPart = this.textures.createCanvas('particle-leaf', 8, 8);
    const lCtx = leafPart!.getContext();
    lCtx.fillStyle = '#4a9a32';
    lCtx.beginPath();
    lCtx.ellipse(4, 4, 3, 2, 0.4, 0, Math.PI * 2);
    lCtx.fill();
    lCtx.fillStyle = '#2d6a1e';
    lCtx.fillRect(4, 3, 1, 3);
    leafPart!.refresh();

    const ffPart = this.textures.createCanvas('particle-firefly', 10, 10);
    const ffCtx = ffPart!.getContext();
    const ffGrad = ffCtx.createRadialGradient(5, 5, 0, 5, 5, 5);
    ffGrad.addColorStop(0, '#ffffff');
    ffGrad.addColorStop(0.3, '#adff2f');
    ffGrad.addColorStop(0.7, 'rgba(173, 255, 47, 0.4)');
    ffGrad.addColorStop(1, 'rgba(173, 255, 47, 0)');
    ffCtx.fillStyle = ffGrad;
    ffCtx.fillRect(0, 0, 10, 10);
    ffPart!.refresh();
  }

  private createAtmosphericTextures(): void {
    const vw = 960;
    const vh = 640;
    const vignette = this.textures.createCanvas('vignette', vw, vh);
    const vCtx = vignette!.getContext();
    const vGrad = vCtx.createRadialGradient(vw / 2, vh / 2, vw * 0.25, vw / 2, vh / 2, vw * 0.65);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, 'rgba(5,2,10,0.65)');
    vCtx.fillStyle = vGrad;
    vCtx.fillRect(0, 0, vw, vh);
    vignette!.refresh();

    const light = this.textures.createCanvas('light-warm', 256, 256);
    const liCtx = light!.getContext();
    const liGrad = liCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    liGrad.addColorStop(0, 'rgba(255, 220, 130, 0.7)');
    liGrad.addColorStop(0.3, 'rgba(255, 170, 60, 0.35)');
    liGrad.addColorStop(0.7, 'rgba(255, 120, 20, 0.1)');
    liGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    liCtx.fillStyle = liGrad;
    liCtx.fillRect(0, 0, 256, 256);
    light!.refresh();
  }

  private createMonsterTextures(): void {
    const makeTexture = (key: string, matrix: string[], colors: Record<string, string>) => {
      if (this.textures.exists(key)) return;
      const canvas = this.textures.createCanvas(key, 16, 16);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = false;
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const char = matrix[y][x];
          if (char && char !== '.') {
            ctx.fillStyle = colors[char];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      canvas!.refresh();
    };

    // 1. GOBLIN
    makeTexture('monster-goblin', [
      "....GGGGGG......",
      "...GGGGGGGG.....",
      "..GGGGGGGGGG....",
      "..GGDGGGDGGG....",
      "..GDYGDYGDGG....",
      "..GGGGGGGGGG....",
      "...GGGGGGGG.....",
      "....BBBBBB......",
      "...BBBBBBBB.....",
      "..BBBBBBBBBB....",
      "..BBBBBBBBBB....",
      "..BBBBBBBBBB....",
      "...B......B.....",
      "...GG....GG.....",
      "...GG....GG.....",
      "................"
    ], {
      'G': '#44aa44',
      'D': '#225522',
      'Y': '#ffff44',
      'B': '#8b5a2b'
    });

    // 2. SKELETON
    makeTexture('monster-skeleton', [
      ".....WWWWWW.....",
      "....WWWWWWWW....",
      "...WWWWWWWWWW...",
      "...WWBRWWRBWW...",
      "...WWWWWWWWWW...",
      "....WWWWWWWW....",
      ".....W.WW.W.....",
      "....SSSSSSSS....",
      "...SSSSSSSSSS...",
      "..SSSSSSSSSSSS..",
      "..SSSWWWWWWSSS..",
      "..SSSWWWWWWSSS..",
      "....WW....WW....",
      "....WW....WW....",
      "....WW....WW....",
      "................"
    ], {
      'W': '#eeeeee',
      'S': '#888888',
      'B': '#222222',
      'R': '#ff0000'
    });

    // 3. SHADOW WOLF
    makeTexture('monster-wolf', [
      "................",
      "......AA........",
      ".....AAAA.......",
      "....AAAAAA......",
      "....AARAAW......",
      "...AAAAAAWW.....",
      "...AAAAAA.......",
      "..AAAAAAAA......",
      ".AAAAAAAAAA.....",
      "AAAAAAAAAAAA....",
      "AAAAAAAAAAAA....",
      "AAAAAAAAAAAA....",
      ".AA.AA..AA.AA...",
      ".AA.AA..AA.AA...",
      ".AA.AA..AA.AA...",
      "................"
    ], {
      'A': '#444455',
      'W': '#ffffff',
      'R': '#ff4444'
    });

    // 4. DEMON IMP
    makeTexture('monster-imp', [
      "....B......B....",
      "....BB....BB....",
      ".....RRRRRR.....",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "...RRDYYDYYDR...",
      "...RRRRRRRRRR...",
      "....RRRRRRRR....",
      ".....RRRRRR.....",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "..RRRRRRRRRRRR..",
      "..R.R.R..R.R.R..",
      "..R.R......R.R..",
      "..R.R......R.R..",
      "................"
    ], {
      'B': '#221111',
      'R': '#cc3333',
      'D': '#771111',
      'Y': '#ffdd00'
    });
  }

  private createClassAnimations(): void {
    const classes = ['PALADIN', 'MAGE', 'ARCHER', 'ASSASSIN'];
    const directions = ['down', 'left', 'right', 'up'];
    classes.forEach((cls) => {
      directions.forEach((dir, index) => {
        this.anims.create({
          key: `${cls}-idle-${dir}`,
          frames: this.anims.generateFrameNumbers(`${cls}-sheet`, {
            start: index * 4,
            end: index * 4,
          }),
          frameRate: 1,
          repeat: -1,
        });

        this.anims.create({
          key: `${cls}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers(`${cls}-sheet`, {
            start: index * 4,
            end: index * 4 + 3,
          }),
          frameRate: 7,
          repeat: -1,
        });
      });
    });
  }
}

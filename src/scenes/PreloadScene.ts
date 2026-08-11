import Phaser from 'phaser';

import tilesetImg from '../assets/tilesets/tileset.png';
import tavernImg from '../assets/sprites/tavern.png';
import menuBgImg from '../assets/sprites/menu_bg.png';

/**
 * PreloadScene — Carrega e processa assets de alta qualidade para o jogo.
 * Gera procedimentalmente todos os sprites de personagens, NPCs e decorações retrô.
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

    console.log('[PreloadScene] ✅ Sprites e texturas 16-bit procedimentais criados');
    this.scene.start('MainMenuScene');
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

    // Direções: 0 = Down, 1 = Left, 2 = Right, 3 = Up
    // Frames: 0 = Idle, 1 = Passo A, 2 = Idle, 3 = Passo B
    for (let dir = 0; dir < 4; dir++) {
      for (let frame = 0; frame < 4; frame++) {
        const offsetX = frame * frameW;
        const offsetY = dir * frameH;

        // Sombra nos pés
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(offsetX + 3, offsetY + 18, 10, 2);

        const legOffset = (frame === 1) ? 1 : (frame === 3) ? -1 : 0;
        const armOffset = (frame === 1) ? -1 : (frame === 3) ? 1 : 0;

        // 1. Pernas (Y=14 a 17)
        ctx.fillStyle = secondaryColor;
        if (dir === 0 || dir === 3) {
          ctx.fillRect(offsetX + 4, offsetY + 14 + legOffset, 3, 3);
          ctx.fillRect(offsetX + 9, offsetY + 14 - legOffset, 3, 3);
        } else if (dir === 1) {
          ctx.fillRect(offsetX + 5 + legOffset, offsetY + 14, 3, 3);
          ctx.fillRect(offsetX + 8 - legOffset, offsetY + 14, 3, 3);
        } else {
          ctx.fillRect(offsetX + 5 - legOffset, offsetY + 14, 3, 3);
          ctx.fillRect(offsetX + 8 + legOffset, offsetY + 14, 3, 3);
        }

        // 2. Corpo/Capa/Armadura (Y=8 a 13)
        ctx.fillStyle = primaryColor;
        ctx.fillRect(offsetX + 5, offsetY + 8, 6, 6);

        // Braços
        ctx.fillStyle = secondaryColor;
        if (dir === 0) {
          ctx.fillRect(offsetX + 3, offsetY + 9 + armOffset, 2, 4);
          ctx.fillRect(offsetX + 11, offsetY + 9 - armOffset, 2, 4);
        } else if (dir === 3) {
          ctx.fillRect(offsetX + 3, offsetY + 9 - armOffset, 2, 4);
          ctx.fillRect(offsetX + 11, offsetY + 9 + armOffset, 2, 4);
        } else if (dir === 1) {
          ctx.fillRect(offsetX + 4 - armOffset, offsetY + 9, 2, 4);
        } else {
          ctx.fillRect(offsetX + 10 + armOffset, offsetY + 9, 2, 4);
        }

        // 3. Cabeça/Rosto (Y=3 a 7)
        ctx.fillStyle = headColor;
        ctx.fillRect(offsetX + 5, offsetY + 3, 6, 5);

        // Cabelo / Capuz / Chapéu
        if (hasHood) {
          ctx.fillStyle = primaryColor;
          ctx.fillRect(offsetX + 4, offsetY + 2, 8, 2);
          ctx.fillRect(offsetX + 4, offsetY + 4, 1, 4);
          ctx.fillRect(offsetX + 11, offsetY + 4, 1, 4);
        } else if (hasHat) {
          ctx.fillStyle = primaryColor;
          ctx.fillRect(offsetX + 3, offsetY + 2, 10, 2);
          ctx.fillStyle = '#ff8800';
          ctx.fillRect(offsetX + 6, offsetY + 0, 4, 2);
        } else {
          ctx.fillStyle = accessoryColor; // Cabelo/Elmo
          ctx.fillRect(offsetX + 5, offsetY + 2, 6, 2);
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
        ctx.fillStyle = accessoryColor;
        if (key.includes('PALADIN') || key.includes('blacksmith')) {
          if (dir === 0 || dir === 2) {
            ctx.fillRect(offsetX + 12, offsetY + 8, 2, 6); // Espada/Martelo
          } else if (dir === 1) {
            ctx.fillRect(offsetX + 2, offsetY + 8, 2, 5);  // Escudo/Ferramenta
          }
        } else if (key.includes('MAGE')) {
          ctx.fillStyle = '#d4af37';
          if (dir === 0 || dir === 2) {
            ctx.fillRect(offsetX + 12, offsetY + 5, 1, 10); // Cajado
            ctx.fillStyle = '#4488ff';
            ctx.fillRect(offsetX + 12, offsetY + 4, 1, 1); // Cristal
          }
        } else if (key.includes('merchant')) {
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(offsetX + 11, offsetY + 11, 2, 2); // Poção
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

import Phaser from 'phaser';

import tilesetImg from '../assets/tilesets/tileset.png';
import paladinImg from '../assets/sprites/paladin.png';
import tavernImg from '../assets/sprites/tavern.png';
import npcsImg from '../assets/sprites/npcs.png';
import menuBgImg from '../assets/sprites/menu_bg.png';

/**
 * PreloadScene — Carrega e processa assets de alta qualidade para o jogo.
 * Aplica chroma key para transparência e remove bordas de grade do tileset.
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

    // Assets de imagem gerados por IA
    this.load.image('menu-bg', menuBgImg);
    this.load.image('tavern-building', tavernImg);
    this.load.image('npcs-raw', npcsImg);
    this.load.image('tileset-raw', tilesetImg);
    this.load.image('paladin-raw', paladinImg);
  }

  create(): void {
    // Processa os spritesheets e remove os fundos sólidos (Chroma Key)
    this.processPlayerSprite();
    this.processNPCSprites();
    this.processTilesetClean();

    // Cria texturas de partículas e iluminação
    this.createParticleTextures();
    this.createAtmosphericTextures();
    this.createMonsterTextures();

    // Cria animações do jogador
    this.createAnimations();

    // Fade out do loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => loadingScreen.classList.add('hidden'), 800);
    }

    console.log('[PreloadScene] ✅ Assets HD e animações carregadas com sucesso');
    this.scene.start('MainMenuScene');
  }

  /**
   * Processa o sprite do Paladino tirando a cor de fundo (Cyan / Blue key).
   */
  private processPlayerSprite(): void {
    const rawImg = this.textures.get('paladin-raw').getSourceImage() as HTMLImageElement;
    if (!rawImg) return;

    const w = rawImg.width;
    const h = rawImg.height;

    const canvas = this.textures.createCanvas('player-sheet', w, h);
    const ctx = canvas!.getContext();
    ctx.drawImage(rawImg, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Amostra a cor do fundo no pixel (0,0)
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    // Remove a cor de fundo com tolerância
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
      if (dist < 60) {
        data[i + 3] = 0; // Transparente
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvas!.refresh();

    // Registra como spritesheet de 4 colunas x 4 linhas no Phaser
    const frameW = w / 4;
    const frameH = h / 4;

    const playerTex = this.textures.get('player-sheet');
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const frameIdx = row * 4 + col;
        playerTex.add(frameIdx, 0, col * frameW, row * frameH, frameW, frameH);
      }
    }
  }

  /**
   * Processa a imagem dos NPCs e divide em 3 personagens com fundo transparente.
   */
  private processNPCSprites(): void {
    const rawImg = this.textures.get('npcs-raw').getSourceImage() as HTMLImageElement;
    if (!rawImg) return;

    const w = rawImg.width;
    const h = rawImg.height;

    const canvas = this.textures.createCanvas('npcs-clean', w, h);
    const ctx = canvas!.getContext();
    ctx.drawImage(rawImg, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
      if (dist < 45) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    canvas!.refresh();

    // Define recortes para cada NPC (3 colunas, usa a primeira fileira)
    const npcW = w / 3;
    const npcH = h / 2;

    const npcsTex = this.textures.get('npcs-clean');
    npcsTex.add('blacksmith', 0, 0, 0, npcW, npcH);
    npcsTex.add('merchant', 0, npcW, 0, npcW, npcH);
    npcsTex.add('master', 0, npcW * 2, 0, npcW, npcH);
  }

  /**
   * Processa o tileset seamless em pixel art HD sem linhas de grade (1024x1024, 32x32 tiles de 32px).
   */
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

  private createAnimations(): void {
    const directions = ['down', 'left', 'right', 'up'];
    directions.forEach((dir, index) => {
      this.anims.create({
        key: `player-idle-${dir}`,
        frames: this.anims.generateFrameNumbers('player-sheet', {
          start: index * 4,
          end: index * 4,
        }),
        frameRate: 1,
        repeat: -1,
      });

      this.anims.create({
        key: `player-walk-${dir}`,
        frames: this.anims.generateFrameNumbers('player-sheet', {
          start: index * 4,
          end: index * 4 + 3,
        }),
        frameRate: 7,
        repeat: -1,
      });
    });
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
}

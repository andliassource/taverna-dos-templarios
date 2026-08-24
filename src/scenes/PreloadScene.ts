import Phaser from 'phaser';

// Assets HD importados
import tilesetImg from '../assets/tilesets/tileset.png';
import treeImg from '../assets/sprites/tree.png';
import bushImg from '../assets/sprites/bush.png';
import tavernBuildingImg from '../assets/sprites/tavern_building.png';
import forgeBuildingImg from '../assets/sprites/forge_building.png';
import heroPaladinImg from '../assets/sprites/hero_paladin.png';
import heroMageImg from '../assets/sprites/hero_mage.png';
import heroArcherImg from '../assets/sprites/hero_archer.png';
import heroWarriorImg from '../assets/sprites/hero_warrior.png';
import heroClericImg from '../assets/sprites/hero_cleric.png';
import heroNecromancerImg from '../assets/sprites/hero_necromancer.png';
import heroAssassinImg from '../assets/sprites/hero_assassin.png';
import heroGuardianImg from '../assets/sprites/hero_guardian.png';
import menuBgHdImg from '../assets/sprites/menu_bg_hd.jpg';
import npcBlacksmithImg from '../assets/sprites/npc_blacksmith.png';
import npcMerchantImg from '../assets/sprites/npc_merchant.png';
import npcMasterImg from '../assets/sprites/npc_master.png';
import monsterGoblinImg from '../assets/sprites/monster_goblin.png';
import monsterImpImg from '../assets/sprites/monster_imp.png';
import monsterSkeletonImg from '../assets/sprites/monster_skeleton.png';
import monsterWolfImg from '../assets/sprites/monster_wolf.png';
import bossMalakorImg from '../assets/sprites/boss_malakor.png';
import petDragonImg from '../assets/sprites/pet_dragon.png';

// Novos Assets Kenney UI, Game-Icons e Adereços Importados
import uiFrameGoldImg from '../assets/ui/ui_frame_gold.png';
import uiBarHpImg from '../assets/ui/ui_bar_hp.png';
import uiBarMpImg from '../assets/ui/ui_bar_mp.png';
import iconSwordImg from '../assets/icons/items/sword.png';
import iconStaffImg from '../assets/icons/items/staff.png';
import iconBowImg from '../assets/icons/items/bow.png';
import iconAxeImg from '../assets/icons/items/axe.png';
import iconShieldImg from '../assets/icons/items/shield.png';
import iconPotionHpImg from '../assets/icons/items/potion_hp.png';
import iconPotionMpImg from '../assets/icons/items/potion_mp.png';
import iconGoldImg from '../assets/icons/items/gold.png';
import iconFireballImg from '../assets/icons/skills/fireball.png';
import iconHealImg from '../assets/icons/skills/heal.png';
import iconBarrierImg from '../assets/icons/skills/barrier.png';
import iconSlashImg from '../assets/icons/skills/slash.png';
import decoWellImg from '../assets/sprites/deco_well.png';
import decoTorchImg from '../assets/sprites/deco_torch.png';
import villageGroundHdImg from '../assets/sprites/village_ground_hd.png';
import arrowProjImg from '../assets/sprites/arrow_proj.png';

/**
 * PreloadScene — Carrega assets HD e gera sprites de alta resolução.
 * NENHUM pixel art de 16-bit. Tudo é renderizado com anti-aliasing e gradientes suaves.
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

    console.log('[PreloadScene] Initializing clean assets...');
    this.load.image('arrow-proj', arrowProjImg);
    this.load.image('procedural-village', villageGroundHdImg);
    this.load.image('tileset-raw', tilesetImg);
    this.load.image('deco-tree', treeImg);
    this.load.image('deco-bush', bushImg);
    this.load.image('tavern-building', tavernBuildingImg);
    this.load.image('forge-building', forgeBuildingImg);

    // Carrega Heróis HD como Spritesheets Nativos 64x64 (4 cols x 4 rows)
    this.load.spritesheet('PALADIN-sheet', heroPaladinImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('paladin-sheet', heroPaladinImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-paladin-img', heroPaladinImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('MAGE-sheet', heroMageImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('mage-sheet', heroMageImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-mage-img', heroMageImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('ARCHER-sheet', heroArcherImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('archer-sheet', heroArcherImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-archer-img', heroArcherImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('WARRIOR-sheet', heroWarriorImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('warrior-sheet', heroWarriorImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-warrior-img', heroWarriorImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('CLERIC-sheet', heroClericImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('cleric-sheet', heroClericImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-cleric-img', heroClericImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('NECROMANCER-sheet', heroNecromancerImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('necromancer-sheet', heroNecromancerImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-necromancer-img', heroNecromancerImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('ASSASSIN-sheet', heroAssassinImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('assassin-sheet', heroAssassinImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-assassin-img', heroAssassinImg, { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('GUARDIAN-sheet', heroGuardianImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('guardian-sheet', heroGuardianImg, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero-guardian-img', heroGuardianImg, { frameWidth: 64, frameHeight: 64 });

    this.load.image('menu-bg-hd', menuBgHdImg);
    this.load.image('npc-blacksmith-img', npcBlacksmithImg);
    this.load.image('npc-merchant-img', npcMerchantImg);
    this.load.image('npc-master-img', npcMasterImg);
    this.load.image('boss-malakor-img', bossMalakorImg);
    this.load.image('pet-dragon-img', petDragonImg);

    // Carrega imagens HD de monstros diretamente na pré-carga
    this.load.image('monster-goblin', monsterGoblinImg);
    this.load.image('monster-skeleton', monsterSkeletonImg);
    this.load.image('monster-wolf', monsterWolfImg);
    this.load.image('monster-shadow_wolf', monsterWolfImg);
    this.load.image('monster-demon_imp', monsterImpImg);
    this.load.image('monster-imp', monsterImpImg);

    // Pacote de UI Kenney & Ícones de Itens / Habilidades (Importados via Vite)
    this.load.image('ui-frame-gold', uiFrameGoldImg);
    this.load.image('ui-bar-hp', uiBarHpImg);
    this.load.image('ui-bar-mp', uiBarMpImg);
    this.load.image('icon-sword', iconSwordImg);
    this.load.image('icon-staff', iconStaffImg);
    this.load.image('icon-bow', iconBowImg);
    this.load.image('icon-axe', iconAxeImg);
    this.load.image('icon-shield', iconShieldImg);
    this.load.image('icon-potion_hp', iconPotionHpImg);
    this.load.image('icon-potion_mp', iconPotionMpImg);
    this.load.image('icon-gold', iconGoldImg);
    this.load.image('icon-fireball', iconFireballImg);
    this.load.image('icon-heal', iconHealImg);
    this.load.image('icon-barrier', iconBarrierImg);
    this.load.image('icon-slash', iconSlashImg);

    // Adereços de Cenário HD (Importados via Vite)
    this.load.image('deco-well', decoWellImg);
    this.load.spritesheet('deco-torch', decoTorchImg, { frameWidth: 32, frameHeight: 32 });
  }

  create(): void {
    // 1. Tileset para camadas de colisão (mínimo necessário)
    this.processTilesetClean();

    // 2. Sprites HD de personagens (64x64 com anti-aliasing e transparência real)
    this.createHDCharacterSprites();

    // 3. Retratos HD para diálogos (128x128 com gradientes e iluminação)
    this.createHDPortraits();

    // 4. Sprites HD de monstros (64x64 com anti-aliasing)
    this.createHDMonsterSprites();

    // 5. Decorações HD (árvores, arbustos em alta resolução)
    this.createHDDecorations();

    // 6. Sprites de edifícios extras procedimentais
    this.createBuildingSprites();

    // 7. Partículas e atmosfera
    this.createParticleTextures();
    this.createAtmosphericTextures();

    // 8. Solos Procedurais HD
    this.createProceduralGrounds();

    // 9. Animações
    this.createClassAnimations();

    // Fade out do loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => loadingScreen.classList.add('hidden'), 800);
    }

    console.log('[PreloadScene] ✅ Assets HD carregados e sprites de alta resolução gerados');
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(rawImg, 0, 0, rawImg.width, rawImg.height, 0, 0, targetW, targetH);
    canvas!.refresh();
  }

  // =====================================================
  // SPRITES HD DE PERSONAGENS — 64x64 com anti-aliasing e transparência real
  // =====================================================

  private createHDCharacterSprites(): void {
    const classes = [
      { key: 'PALADIN-sheet', primary: '#2b4ca3', secondary: '#7b9cb8', accent: '#d4af37', skin: '#ffd1a9', type: 'heavy' },
      { key: 'GUARDIAN-sheet', primary: '#2d4d2d', secondary: '#5a7a5a', accent: '#a0b0c0', skin: '#ffd1a9', type: 'heavy' },
      { key: 'WARRIOR-sheet', primary: '#7b1e1e', secondary: '#a33b3b', accent: '#c0c0c0', skin: '#ffd1a9', type: 'heavy' },
      { key: 'MAGE-sheet', primary: '#58137b', secondary: '#e066ff', accent: '#4488ff', skin: '#ffd1a9', type: 'robe' },
      { key: 'NECROMANCER-sheet', primary: '#11111a', secondary: '#332244', accent: '#9900ee', skin: '#e0b080', type: 'robe' },
      { key: 'ARCHER-sheet', primary: '#135c13', secondary: '#7a4f2b', accent: '#ff8c00', skin: '#ffd1a9', type: 'light' },
      { key: 'ASSASSIN-sheet', primary: '#1f2421', secondary: '#333333', accent: '#708090', skin: '#ffd1a9', type: 'light' },
      { key: 'CLERIC-sheet', primary: '#e6e6fa', secondary: '#ffd700', accent: '#00e5ff', skin: '#ffd1a9', type: 'robe' },
      { key: 'DARK_KNIGHT-sheet', primary: '#3b0000', secondary: '#5c1414', accent: '#cc0000', skin: '#e0b080', type: 'heavy' },
      { key: 'ELEMENTALIST-sheet', primary: '#004466', secondary: '#0099cc', accent: '#00ffff', skin: '#ffd1a9', type: 'robe' },
      { key: 'BARD-sheet', primary: '#996600', secondary: '#cc9900', accent: '#0099ff', skin: '#ffd1a9', type: 'light' },
      { key: 'DRUID-sheet', primary: '#1a3300', secondary: '#4d2600', accent: '#33cc33', skin: '#ffd1a9', type: 'robe' },
    ];

    classes.forEach(c => {
      // SÓ gera via código procedural se a textura da imagem real NÃO existir!
      if (!this.textures.exists(c.key)) {
        this.generateHDSpritesheet(c.key, c.primary, c.secondary, c.accent, c.skin, c.type);
      }
      
      const lowerKey = c.key.toLowerCase();
      const upperKey = c.key.toUpperCase();
      const baseKey = c.key.replace('-sheet', '').replace('-SHEET', '');
      
      [lowerKey, upperKey, baseKey, baseKey.toLowerCase(), baseKey.toUpperCase()].forEach(k => {
        if (!this.textures.exists(k)) {
          // Se já existe a textura real c.key, duplica para a chave alias k
          if (this.textures.exists(c.key)) {
            const realTex = this.textures.get(c.key);
            this.textures.addImage(k, realTex.getSourceImage() as HTMLImageElement);
          } else {
            this.generateHDSpritesheet(k, c.primary, c.secondary, c.accent, c.skin, c.type);
          }
        }
      });
    });

    // NPCs (Preserva imagens HD se existirem)
    [
      { key: 'npc-blacksmith', imgKey: 'npc-blacksmith-img', primary: '#5c3317', secondary: '#444444', accent: '#cc3333', skin: '#e0b080', type: 'heavy' },
      { key: 'npc-merchant', imgKey: 'npc-merchant-img', primary: '#a020f0', secondary: '#ffb6c1', accent: '#32cd32', skin: '#ffd1a9', type: 'robe' },
      { key: 'npc-master', imgKey: 'npc-master-img', primary: '#d4af37', secondary: '#4b0082', accent: '#ffffff', skin: '#e0b080', type: 'robe' },
    ].forEach(npc => {
      if (!this.textures.exists(npc.key)) {
        if (this.textures.exists(npc.imgKey)) {
          const imgTex = this.textures.get(npc.imgKey);
          this.textures.addImage(npc.key, imgTex.getSourceImage() as HTMLImageElement);
        } else {
          this.generateHDSpritesheet(npc.key, npc.primary, npc.secondary, npc.accent, npc.skin, npc.type as any);
        }
      }
    });

    // Registra animações Phaser para cada classe de herói
    classes.forEach((c) => {
      const clsName = c.key.replace('-sheet', '');
      const sheetKey = c.key;

      const clsNameUpper = clsName.toUpperCase();
      const clsNameLower = clsName.toLowerCase();

      [clsNameUpper, clsNameLower].forEach((nameKey) => {
        if (!this.anims.exists(`${nameKey}-walk-down`)) {
          this.anims.create({
            key: `${nameKey}-walk-down`,
            frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
          });
          this.anims.create({
            key: `${nameKey}-walk-left`,
            frames: this.anims.generateFrameNumbers(sheetKey, { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1,
          });
          this.anims.create({
            key: `${nameKey}-walk-right`,
            frames: this.anims.generateFrameNumbers(sheetKey, { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1,
          });
          this.anims.create({
            key: `${nameKey}-walk-up`,
            frames: this.anims.generateFrameNumbers(sheetKey, { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1,
          });

          this.anims.create({
            key: `${nameKey}-idle-down`,
            frames: [{ key: sheetKey, frame: 0 }],
            frameRate: 1,
          });
          this.anims.create({
            key: `${nameKey}-idle-left`,
            frames: [{ key: sheetKey, frame: 4 }],
            frameRate: 1,
          });
          this.anims.create({
            key: `${nameKey}-idle-right`,
            frames: [{ key: sheetKey, frame: 8 }],
            frameRate: 1,
          });
          this.anims.create({
            key: `${nameKey}-idle-up`,
            frames: [{ key: sheetKey, frame: 12 }],
            frameRate: 1,
          });

          // Animações HD de Ataque e Golpe Físico com balanço de lâmina
          this.anims.create({
            key: `${nameKey}-attack-down`,
            frames: [
              { key: sheetKey, frame: 0 },
              { key: sheetKey, frame: 1 },
              { key: sheetKey, frame: 2 },
              { key: sheetKey, frame: 0 }
            ],
            frameRate: 14,
            repeat: 0,
          });
          this.anims.create({
            key: `${nameKey}-attack-left`,
            frames: [
              { key: sheetKey, frame: 4 },
              { key: sheetKey, frame: 5 },
              { key: sheetKey, frame: 6 },
              { key: sheetKey, frame: 4 }
            ],
            frameRate: 14,
            repeat: 0,
          });
          this.anims.create({
            key: `${nameKey}-attack-right`,
            frames: [
              { key: sheetKey, frame: 8 },
              { key: sheetKey, frame: 9 },
              { key: sheetKey, frame: 10 },
              { key: sheetKey, frame: 8 }
            ],
            frameRate: 14,
            repeat: 0,
          });
          this.anims.create({
            key: `${nameKey}-attack-up`,
            frames: [
              { key: sheetKey, frame: 12 },
              { key: sheetKey, frame: 13 },
              { key: sheetKey, frame: 14 },
              { key: sheetKey, frame: 12 }
            ],
            frameRate: 14,
            repeat: 0,
          });

          // Animações HD de Conjuração Mágica e Feitiçaria
          this.anims.create({
            key: `${nameKey}-cast-down`,
            frames: [
              { key: sheetKey, frame: 1 },
              { key: sheetKey, frame: 3 },
              { key: sheetKey, frame: 1 }
            ],
            frameRate: 10,
            repeat: 0,
          });
          this.anims.create({
            key: `${nameKey}-cast-left`,
            frames: [
              { key: sheetKey, frame: 5 },
              { key: sheetKey, frame: 7 },
              { key: sheetKey, frame: 5 }
            ],
            frameRate: 10,
            repeat: 0,
          });
          this.anims.create({
            key: `${nameKey}-cast-right`,
            frames: [
              { key: sheetKey, frame: 9 },
              { key: sheetKey, frame: 11 },
              { key: sheetKey, frame: 9 }
            ],
            frameRate: 10,
            repeat: 0,
          });
          this.anims.create({
            key: `${nameKey}-cast-up`,
            frames: [
              { key: sheetKey, frame: 13 },
              { key: sheetKey, frame: 15 },
              { key: sheetKey, frame: 13 }
            ],
            frameRate: 10,
            repeat: 0,
          });

          // Animação HD de Morte e Colapso Templário
          this.anims.create({
            key: `${nameKey}-death`,
            frames: [
              { key: sheetKey, frame: 0 },
              { key: sheetKey, frame: 1 },
              { key: sheetKey, frame: 2 },
              { key: sheetKey, frame: 3 }
            ],
            frameRate: 6,
            repeat: 0,
          });
        }
      });
    });

    // Animação de Fogo para Tochas do Cenário
    if (!this.anims.exists('torch-flame')) {
      this.anims.create({
        key: 'torch-flame',
        frames: this.anims.generateFrameNumbers('deco-torch', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  private generateHDSpritesheet(
    key: string,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string,
    skinColor: string,
    armorType: string,
  ): void {
    if (this.textures.exists(key)) return;

    const frameW = 64;
    const frameH = 64;
    const canvas = this.textures.createCanvas(key, 256, 256);
    const ctx = canvas!.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Checa se existe imagem HD personalizada para este personagem/NPC
    const upperKey = key.toUpperCase();
    let customImgKey = '';
    if (upperKey.includes('PALADIN')) customImgKey = 'hero-paladin-img';
    else if (upperKey.includes('MAGE')) customImgKey = 'hero-mage-img';
    else if (upperKey.includes('ARCHER')) customImgKey = 'hero-archer-img';
    else if (upperKey.includes('WARRIOR')) customImgKey = 'hero-warrior-img';
    else if (upperKey.includes('CLERIC')) customImgKey = 'hero-cleric-img';
    else if (upperKey.includes('NECROMANCER')) customImgKey = 'hero-necromancer-img';
    else if (upperKey.includes('ASSASSIN')) customImgKey = 'hero-assassin-img';
    else if (upperKey.includes('GUARDIAN')) customImgKey = 'hero-guardian-img';
    else if (upperKey.includes('BLACKSMITH')) customImgKey = 'npc-blacksmith-img';
    else if (upperKey.includes('MERCHANT')) customImgKey = 'npc-merchant-img';
    else if (upperKey.includes('MASTER')) customImgKey = 'npc-master-img';

    if (customImgKey && this.textures.exists(customImgKey)) {
      const imgObj = this.textures.get(customImgKey).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      if (imgObj) {
        // 4 Rows: 0=Down, 1=Left, 2=Right, 3=Up
        // 4 Cols: 0=Idle1, 1=StepLeft, 2=Idle2, 3=StepRight
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            const isIdle = col % 2 === 0;
            // Deslocamento de pernas e corpo estilo JRPG (Square Enix 2D Walk Cycle)
            const yOffset = isIdle ? (col === 0 ? 0 : -3) : (col === 1 ? -6 : -4);
            const xStride = isIdle ? 0 : (col === 1 ? -5 : 5);
            const bodyTilt = isIdle ? 0 : (col === 1 ? -0.12 : 0.12);

            const cx = col * frameW + 32;
            const cy = row * frameH + 32 + yOffset;

            // 1. Sombra dinâmica sob os pés (encolhe no salto da passada)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            const shadowRadius = isIdle ? 16 : 12;
            ctx.ellipse(col * frameW + 32, row * frameH + 58, shadowRadius, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Desenha o sprite com passada expressiva, inclinação de tronco e balanço
            ctx.save();
            ctx.translate(cx + xStride, cy);

            // Perfil Esquerda (row 1)
            if (row === 1) {
              ctx.scale(-1, 1);
            }

            ctx.rotate(bodyTilt);
            // Renderiza o corpo com deslocamento anatômico cristalino sem overlays
            ctx.drawImage(imgObj, -22, -26 + (isIdle ? 0 : 2), 44, 52);
            ctx.restore();

            // 3. Efeito visual de rastro de passo / poeira sutil na base do frame ativo
            if (!isIdle) {
              ctx.fillStyle = 'rgba(200, 190, 160, 0.35)';
              ctx.beginPath();
              ctx.arc(cx - xStride * 1.2, row * frameH + 54, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        canvas!.refresh();
        const tex = this.textures.get(key);
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const idx = r * 4 + c;
            tex.add(idx, 0, c * frameW, r * frameH, frameW, frameH);
          }
        }
        return;
      }
    }

    const shadeColor = (hex: string, pct: number): string => {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
      const t = pct < 0 ? 0 : 255;
      const p = Math.abs(pct);
      return `rgb(${Math.round((t - r) * p + r)}, ${Math.round((t - g) * p + g)}, ${Math.round((t - b) * p + b)})`;
    };

    // 4 Rows: 0=Down, 1=Left, 2=Right, 3=Up
    // 4 Cols: Walk cycle (0=idle, 1=step1, 2=idle, 3=step2)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cx = col * frameW + 32;
        const cy = row * frameH + 32;

        const isIdle = col % 2 === 0;
        const legOffset = isIdle ? 0 : (col === 1 ? 3 : -3);
        const armSwing = isIdle ? 0 : (col === 1 ? 4 : -4);

        // 1. Sombra nos pés
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 24, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Pernas / Pés
        ctx.fillStyle = shadeColor(secondaryColor, -0.3);
        ctx.fillRect(cx - 7 - legOffset, cy + 14, 5, 10);
        ctx.fillRect(cx + 2 + legOffset, cy + 14, 5, 10);

        // Pés
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(cx - 8 - legOffset, cy + 22, 6, 3);
        ctx.fillRect(cx + 2 + legOffset, cy + 22, 6, 3);

        // 3. Torso / Armadura / Manto
        ctx.fillStyle = primaryColor;
        this.drawRoundedRect(ctx, cx - 10, cy - 2, 20, 18, 3);

        // Detalhes da armadura / cinto
        ctx.fillStyle = accentColor;
        ctx.fillRect(cx - 10, cy + 10, 20, 4); // Cinto

        if (armorType === 'heavy') {
          // Peitoral metálico
          ctx.fillStyle = secondaryColor;
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy);
          ctx.lineTo(cx, cy + 8);
          ctx.lineTo(cx + 8, cy);
          ctx.fill();
        } else if (armorType === 'robe') {
          // Aba do manto
          ctx.fillStyle = shadeColor(primaryColor, -0.2);
          ctx.fillRect(cx - 9, cy + 12, 18, 8);
        }

        // 4. Braços
        ctx.fillStyle = secondaryColor;
        if (row === 1) { // Left
          ctx.fillRect(cx - 12, cy + 2 - armSwing, 5, 12);
        } else if (row === 2) { // Right
          ctx.fillRect(cx + 7, cy + 2 + armSwing, 5, 12);
        } else { // Down / Up
          ctx.fillRect(cx - 13, cy + 2 + armSwing, 4, 11);
          ctx.fillRect(cx + 9, cy + 2 - armSwing, 4, 11);
        }

        // 5. Cabeça e Pele
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(cx, cy - 12, 10, 0, Math.PI * 2);
        ctx.fill();

        // 6. Rosto / Olhos / Elmo / Capuz conforme a direção
        if (row === 3) {
          // Facing UP (trás da cabeça)
          ctx.fillStyle = shadeColor(primaryColor, -0.1);
          ctx.beginPath();
          ctx.arc(cx, cy - 13, 11, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Facing Down (0), Left (1), Right (2)
          if (armorType === 'heavy') {
            // Elmo
            ctx.fillStyle = secondaryColor;
            ctx.beginPath();
            ctx.arc(cx, cy - 13, 11, Math.PI, 0);
            ctx.fill();
            // Viseira
            ctx.fillStyle = '#111';
            const eyeX = row === 1 ? cx - 6 : (row === 2 ? cx + 2 : cx - 5);
            ctx.fillRect(eyeX, cy - 14, 8, 3);
            // Olho brilhante
            ctx.fillStyle = accentColor;
            ctx.fillRect(eyeX + (row === 1 ? 1 : 4), cy - 14, 2, 2);
          } else if (armorType === 'robe') {
            // Capuz / Chapéu
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.arc(cx, cy - 14, 12, Math.PI * 0.8, Math.PI * 0.2);
            ctx.fill();
            // Olhos
            ctx.fillStyle = '#222';
            const ex1 = row === 1 ? cx - 6 : (row === 2 ? cx + 2 : cx - 5);
            const ex2 = row === 1 ? cx - 2 : (row === 2 ? cx + 6 : cx + 2);
            if (row !== 1) ctx.fillRect(ex1, cy - 12, 2, 3);
            if (row !== 2) ctx.fillRect(ex2, cy - 12, 2, 3);
          } else {
            // Cabelo / Bandana
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(cx, cy - 15, 11, Math.PI * 0.7, Math.PI * 0.3);
            ctx.fill();
            // Olhos
            ctx.fillStyle = '#222';
            const ex1 = row === 1 ? cx - 6 : (row === 2 ? cx + 2 : cx - 5);
            const ex2 = row === 1 ? cx - 2 : (row === 2 ? cx + 6 : cx + 2);
            if (row !== 1) ctx.fillRect(ex1, cy - 12, 2, 3);
            if (row !== 2) ctx.fillRect(ex2, cy - 12, 2, 3);
          }
        }
      }
    }

    canvas!.refresh();

    // Registrar frames (4x4, 64x64 frame size)
    const tex = this.textures.get(key);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c;
        tex.add(idx, 0, c * frameW, r * frameH, frameW, frameH);
      }
    }
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }

  // =====================================================
  // RETRATOS HD — 128x128 com gradientes e iluminação dramática
  // =====================================================

  private createHDPortraits(): void {
    this.drawHDPortrait('portrait-PALADIN', '#2b4ca3', '#d4af37', '#ffd1a9', 'knight', 'Elmo Templário com olhos brilhantes azuis');
    this.drawHDPortrait('portrait-GUARDIAN', '#2d4d2d', '#a0b0c0', '#ffd1a9', 'knight', '');
    this.drawHDPortrait('portrait-WARRIOR', '#7b1e1e', '#c0c0c0', '#ffd1a9', 'knight', '');
    this.drawHDPortrait('portrait-MAGE', '#58137b', '#4488ff', '#ffd1a9', 'wizard', '');
    this.drawHDPortrait('portrait-NECROMANCER', '#11111a', '#9900ee', '#e0b080', 'hood', '');
    this.drawHDPortrait('portrait-ARCHER', '#135c13', '#ff8c00', '#ffd1a9', 'hood', '');
    this.drawHDPortrait('portrait-ASSASSIN', '#1f2421', '#708090', '#ffd1a9', 'mask', '');
    this.drawHDPortrait('portrait-CLERIC', '#e6e6fa', '#00e5ff', '#ffd1a9', 'hood', '');
    this.drawHDPortrait('portrait-DARK_KNIGHT', '#3b0000', '#cc0000', '#e0b080', 'knight', '');
    this.drawHDPortrait('portrait-ELEMENTALIST', '#004466', '#00ffff', '#ffd1a9', 'wizard', '');
    this.drawHDPortrait('portrait-BARD', '#996600', '#0099ff', '#ffd1a9', 'hair', '');
    this.drawHDPortrait('portrait-DRUID', '#1a3300', '#33cc33', '#ffd1a9', 'hood', '');

    // NPCs
    this.drawHDPortrait('portrait-blacksmith', '#5c3317', '#cc3333', '#e0b080', 'hair', 'Barba ruiva');
    this.drawHDPortrait('portrait-merchant', '#a020f0', '#32cd32', '#ffd1a9', 'hood', 'Cabelo prateado');
    this.drawHDPortrait('portrait-master', '#d4af37', '#ffffff', '#e0b080', 'hood', 'Barba branca longa');
  }

  private drawHDPortrait(
    key: string,
    primaryColor: string,
    accentColor: string,
    skinColor: string,
    headType: string,
    _details: string,
  ): void {
    if (this.textures.exists(key)) return;
    const size = 128;
    const canvas = this.textures.createCanvas(key, size, size);
    const ctx = canvas!.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const shadeColor = (hex: string, pct: number): string => {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
      const t = pct < 0 ? 0 : 255;
      const p = Math.abs(pct);
      return `rgb(${Math.round((t - r) * p + r)}, ${Math.round((t - g) * p + g)}, ${Math.round((t - b) * p + b)})`;
    };

    // Moldura medieval ornamentada
    // Fundo escuro
    const bgGrad = ctx.createRadialGradient(64, 64, 10, 64, 64, 80);
    bgGrad.addColorStop(0, '#1a0e2e');
    bgGrad.addColorStop(1, '#05020a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Borda ornamentada dourada
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(4, 4, size - 8, size - 8, 8);
    ctx.stroke();
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(8, 8, size - 16, size - 16, 6);
    ctx.stroke();

    // Ombros e torso
    const torsoGrad = ctx.createLinearGradient(30, 80, 98, 120);
    torsoGrad.addColorStop(0, shadeColor(primaryColor, 0.15));
    torsoGrad.addColorStop(0.5, primaryColor);
    torsoGrad.addColorStop(1, shadeColor(primaryColor, -0.35));
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.ellipse(64, 110, 40, 30, 0, Math.PI, 0, true);
    ctx.fill();

    // Pescoço
    ctx.fillStyle = shadeColor(skinColor, -0.1);
    ctx.fillRect(56, 70, 16, 18);

    // Cabeça
    const headGrad = ctx.createRadialGradient(60, 44, 4, 64, 48, 28);
    headGrad.addColorStop(0, shadeColor(skinColor, 0.2));
    headGrad.addColorStop(0.6, skinColor);
    headGrad.addColorStop(1, shadeColor(skinColor, -0.25));
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(64, 48, 26, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    if (headType === 'knight') {
      // Elmo de cavaleiro com gradiente metálico
      const helmGrad = ctx.createLinearGradient(38, 16, 90, 68);
      helmGrad.addColorStop(0, '#d0d0d0');
      helmGrad.addColorStop(0.3, '#a0a0a0');
      helmGrad.addColorStop(0.7, '#707070');
      helmGrad.addColorStop(1, '#404040');
      ctx.fillStyle = helmGrad;
      ctx.beginPath();
      ctx.ellipse(64, 42, 28, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Viseira horizontal
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.roundRect(40, 40, 48, 8, 4);
      ctx.fill();

      // Olhos brilhantes na viseira
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(52, 44, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(76, 44, 3, 0, Math.PI * 2);
      ctx.fill();
      // Brilho
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(53, 43, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(77, 43, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rosto / Elmo base
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.ellipse(64, 32, 22, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Pluma
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.ellipse(64, 12, 6, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (headType === 'wizard') {
      // Chapéu de mago pontiagudo
      ctx.fillStyle = shadeColor(primaryColor, -0.1);
      ctx.beginPath();
      ctx.moveTo(64, 2);
      ctx.lineTo(38, 40);
      ctx.lineTo(90, 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Faixa
      ctx.fillStyle = accentColor;
      ctx.fillRect(36, 36, 56, 6);
      ctx.strokeRect(36, 36, 56, 6);

      // Olhos
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.ellipse(54, 48, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(74, 48, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(55, 47, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(75, 47, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Barba
      if (key.includes('MAGE') || key.includes('master')) {
        ctx.fillStyle = '#dddddd';
        ctx.beginPath();
        ctx.ellipse(64, 72, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else if (headType === 'hood') {
      // Capuz
      const hoodGrad = ctx.createLinearGradient(36, 14, 92, 56);
      hoodGrad.addColorStop(0, shadeColor(primaryColor, 0.1));
      hoodGrad.addColorStop(1, shadeColor(primaryColor, -0.35));
      ctx.fillStyle = hoodGrad;
      ctx.beginPath();
      ctx.ellipse(64, 38, 30, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rosto visível dentro do capuz
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.ellipse(64, 48, 20, 22, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Olhos
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.ellipse(54, 46, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(74, 46, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Barba do mestre
      if (key.includes('master')) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(64, 68, 12, 16, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      // Barba do ferreiro
      if (key.includes('blacksmith')) {
        ctx.fillStyle = '#cc3333';
        ctx.beginPath();
        ctx.ellipse(64, 66, 12, 14, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    } else if (headType === 'mask') {
      // Máscara de assassino
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.ellipse(64, 42, 28, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Apenas olhos brilhantes
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.ellipse(52, 42, 4, 3, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(76, 42, 4, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Cabelo natural
      const hairGrad = ctx.createLinearGradient(36, 14, 92, 48);
      hairGrad.addColorStop(0, shadeColor(accentColor, 0.2));
      hairGrad.addColorStop(1, shadeColor(accentColor, -0.3));
      ctx.fillStyle = hairGrad;
      ctx.beginPath();
      ctx.ellipse(64, 34, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Olhos
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.ellipse(54, 48, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(74, 48, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Detalhes na armadura do ombro
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(40, 90, 12, Math.PI * 0.8, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(88, 90, 12, Math.PI * 1.4, Math.PI * 0.2);
    ctx.stroke();

    canvas!.refresh();
  }

  // =====================================================
  // MONSTROS HD — 64x64 com anti-aliasing
  // =====================================================

  private createHDMonsterSprites(): void {
    this.drawHDMonster('monster-goblin', '#44aa44', '#225522', '#ffff44', 'goblin');
    this.drawHDMonster('monster-skeleton', '#eeeeee', '#888888', '#ff0000', 'skeleton');
    this.drawHDMonster('monster-shadow_wolf', '#444455', '#222233', '#ff4444', 'wolf');
    this.drawHDMonster('monster-wolf', '#555566', '#333344', '#ff4444', 'wolf');
    this.drawHDMonster('monster-demon_imp', '#cc2222', '#440000', '#ffff00', 'demon');
    this.drawHDMonster('monster-imp', '#cc3333', '#551111', '#ffdd00', 'demon');
  }

  private drawHDMonster(key: string, primaryColor: string, darkColor: string, eyeColor: string, type: string): void {
    if (this.textures.exists(key)) return;
    const size = 64;
    const canvas = this.textures.createCanvas(key, size, size);
    const ctx = canvas!.getContext();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const shadeColor = (hex: string, pct: number): string => {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
      const t = pct < 0 ? 0 : 255;
      const p = Math.abs(pct);
      return `rgb(${Math.round((t - r) * p + r)}, ${Math.round((t - g) * p + g)}, ${Math.round((t - b) * p + b)})`;
    };

    // Sombra
    const shadowGrad = ctx.createRadialGradient(32, 58, 2, 32, 58, 20);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(32, 58, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'goblin') {
      // Corpo redondo verde
      const bodyGrad = ctx.createRadialGradient(30, 30, 4, 32, 34, 20);
      bodyGrad.addColorStop(0, shadeColor(primaryColor, 0.2));
      bodyGrad.addColorStop(0.7, primaryColor);
      bodyGrad.addColorStop(1, darkColor);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(32, 34, 18, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeça grande
      ctx.fillStyle = shadeColor(primaryColor, 0.1);
      ctx.beginPath();
      ctx.ellipse(32, 18, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orelhas pontudas
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(18, 6);
      ctx.lineTo(22, 16);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, 14);
      ctx.lineTo(46, 6);
      ctx.lineTo(42, 16);
      ctx.fill();
      ctx.stroke();

      // Olhos amarelos malignos
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(26, 18, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(38, 18, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Pupilas
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(27, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(39, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Boca com dentes
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.ellipse(32, 26, 8, 4, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(28, 25, 3, 3);
      ctx.strokeRect(28, 25, 3, 3);
      ctx.fillRect(33, 25, 3, 3);
      ctx.strokeRect(33, 25, 3, 3);

      // Pernas
      ctx.fillStyle = darkColor;
      this.drawRoundedRect(ctx, 22, 48, 6, 12, 2);
      this.drawRoundedRect(ctx, 36, 48, 6, 12, 2);
    } else if (type === 'skeleton') {
      // Crânio
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.ellipse(32, 16, 14, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Mandíbula
      ctx.fillStyle = shadeColor(primaryColor, -0.15);
      ctx.beginPath();
      ctx.ellipse(32, 26, 10, 6, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Órbitas dos olhos
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.ellipse(26, 14, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(38, 14, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Olhos flamejantes
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(26, 14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(38, 14, 3, 0, Math.PI * 2);
      ctx.fill();

      // Nariz
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.moveTo(32, 18);
      ctx.lineTo(30, 22);
      ctx.lineTo(34, 22);
      ctx.fill();

      // Caixa torácica
      ctx.strokeStyle = darkColor;
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(32, 32 + i * 5, 12 - i, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Braços ósseos
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, 30);
      ctx.lineTo(10, 46);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(44, 30);
      ctx.lineTo(54, 46);
      ctx.stroke();

      // Pernas ósseas
      ctx.beginPath();
      ctx.moveTo(26, 48);
      ctx.lineTo(22, 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(38, 48);
      ctx.lineTo(42, 60);
      ctx.stroke();
    } else if (type === 'wolf') {
      // Corpo alongado de lobo
      const bodyGrad = ctx.createLinearGradient(10, 24, 54, 48);
      bodyGrad.addColorStop(0, shadeColor(primaryColor, 0.1));
      bodyGrad.addColorStop(0.5, primaryColor);
      bodyGrad.addColorStop(1, darkColor);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(32, 36, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça
      ctx.fillStyle = shadeColor(primaryColor, 0.1);
      ctx.beginPath();
      ctx.ellipse(50, 26, 12, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Focinho
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.ellipse(58, 28, 6, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Orelhas
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(44, 20);
      ctx.lineTo(46, 10);
      ctx.lineTo(50, 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(52, 18);
      ctx.lineTo(56, 10);
      ctx.lineTo(56, 20);
      ctx.fill();

      // Olhos vermelhos
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(52, 24, 3, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(52, 24, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Patas
      ctx.fillStyle = darkColor;
      this.drawRoundedRect(ctx, 16, 46, 6, 10, 2);
      this.drawRoundedRect(ctx, 24, 46, 6, 10, 2);
      this.drawRoundedRect(ctx, 36, 46, 6, 10, 2);
      this.drawRoundedRect(ctx, 44, 46, 6, 10, 2);

      // Cauda
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(10, 34);
      ctx.quadraticCurveTo(4, 20, 8, 16);
      ctx.stroke();
    } else if (type === 'demon') {
      // Corpo demoníaco
      const bodyGrad = ctx.createRadialGradient(30, 30, 4, 32, 34, 20);
      bodyGrad.addColorStop(0, shadeColor(primaryColor, 0.2));
      bodyGrad.addColorStop(0.7, primaryColor);
      bodyGrad.addColorStop(1, darkColor);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(32, 36, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça
      ctx.fillStyle = shadeColor(primaryColor, 0.1);
      ctx.beginPath();
      ctx.ellipse(32, 18, 14, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chifres
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.moveTo(20, 12);
      ctx.lineTo(16, 0);
      ctx.lineTo(24, 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(44, 12);
      ctx.lineTo(48, 0);
      ctx.lineTo(40, 10);
      ctx.fill();

      // Olhos ardentes
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.ellipse(26, 16, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(38, 16, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(27, 16, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(39, 16, 2, 0, Math.PI * 2);
      ctx.fill();

      // Boca maligna
      ctx.fillStyle = '#220000';
      ctx.beginPath();
      ctx.ellipse(32, 26, 8, 4, 0, 0, Math.PI);
      ctx.fill();

      // Asas pequenas
      ctx.fillStyle = shadeColor(primaryColor, -0.3);
      ctx.beginPath();
      ctx.moveTo(16, 28);
      ctx.quadraticCurveTo(4, 16, 8, 34);
      ctx.lineTo(16, 36);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(48, 28);
      ctx.quadraticCurveTo(60, 16, 56, 34);
      ctx.lineTo(48, 36);
      ctx.fill();

      // Pernas
      ctx.fillStyle = darkColor;
      this.drawRoundedRect(ctx, 22, 48, 6, 12, 2);
      this.drawRoundedRect(ctx, 36, 48, 6, 12, 2);

      // Cauda
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(32, 52);
      ctx.quadraticCurveTo(12, 56, 10, 48);
      ctx.stroke();
      // Ponta da cauda
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(10, 48);
      ctx.lineTo(6, 44);
      ctx.lineTo(14, 46);
      ctx.fill();
    }

    canvas!.refresh();
  }

  // =====================================================
  // DECORAÇÕES HD — Árvores e arbustos em alta resolução
  // =====================================================

  private createHDDecorations(): void {
    // 1. Árvore HD (64x80)
    if (!this.textures.exists('deco-tree')) {
      const canvas = this.textures.createCanvas('deco-tree', 64, 80);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;

      // Tronco
      ctx.fillStyle = '#4a2c11';
      this.drawRoundedRect(ctx, 26, 44, 12, 36, 4);
      ctx.fillStyle = '#321c08';
      ctx.fillRect(26, 44, 4, 36);

      // Copas da árvore
      const drawFoliageLayer = (cx: number, cy: number, rx: number, ry: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      };

      drawFoliageLayer(32, 45, 28, 22, '#1b4a1b');
      drawFoliageLayer(32, 32, 24, 18, '#266926');
      drawFoliageLayer(32, 20, 18, 15, '#358a35');

      ctx.fillStyle = '#4caf50';
      ctx.beginPath(); ctx.ellipse(26, 16, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(36, 26, 10, 7, 0, 0, Math.PI * 2); ctx.fill();

      canvas!.refresh();
    }

    // 2. Arbusto HD (48x40)
    if (!this.textures.exists('deco-bush')) {
      const canvas = this.textures.createCanvas('deco-bush', 48, 40);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;

      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(24, 34, 20, 6, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#1e4620';
      ctx.beginPath(); ctx.ellipse(24, 24, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2d6830';
      ctx.beginPath(); ctx.ellipse(18, 20, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(30, 20, 14, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3e8e42';
      ctx.beginPath(); ctx.ellipse(24, 14, 11, 8, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#ff4444';
      ctx.beginPath(); ctx.arc(16, 18, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(32, 16, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(24, 24, 2, 0, Math.PI * 2); ctx.fill();

      canvas!.refresh();
    }

    // 3. Balcão da Taverna (96x32)
    if (!this.textures.exists('tavern-counter')) {
      const canvas = this.textures.createCanvas('tavern-counter', 96, 32);
      const ctx = canvas!.getContext();
      ctx.fillStyle = '#3e2723';
      this.drawRoundedRect(ctx, 0, 0, 96, 32, 4);
      ctx.fillStyle = '#5d4037';
      this.drawRoundedRect(ctx, 2, 2, 92, 24, 3);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 88, 20);
      canvas!.refresh();
    }

    // 4. Mesa da Taverna (48x36)
    if (!this.textures.exists('tavern-table')) {
      const canvas = this.textures.createCanvas('tavern-table', 48, 36);
      const ctx = canvas!.getContext();
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.ellipse(24, 18, 22, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5d4037';
      ctx.beginPath(); ctx.ellipse(24, 18, 19, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      canvas!.refresh();
    }

    // 5. Flores HD (16x16)
    if (!this.textures.exists('deco-flower')) {
      const canvas = this.textures.createCanvas('deco-flower', 16, 16);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;

      const petalColors = ['#ff4466', '#ff6688', '#ff88aa'];
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        ctx.fillStyle = petalColors[i % petalColors.length];
        ctx.beginPath();
        ctx.ellipse(
          8 + Math.cos(angle) * 4,
          8 + Math.sin(angle) * 4,
          3, 2, angle, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
      ctx.fill();

      canvas!.refresh();
    }
  }

  // =====================================================
  // EDIFÍCIOS PROCEDIMENTAIS (Forja e Mercado)
  // =====================================================

  private createBuildingSprites(): void {
    // Taverna dos Templários (anime style) (192x144)
    if (!this.textures.exists('tavern-building')) {
      const canvas = this.textures.createCanvas('tavern-building', 192, 144);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;

      // Base da Taverna
      ctx.fillStyle = '#c1a68d';
      this.drawRoundedRect(ctx, 16, 40, 160, 96, 4);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Madeiras cruzadas (estilo enxaimel medieval anime)
      ctx.fillStyle = '#4a3525';
      ctx.fillRect(16, 40, 160, 8); // Viga superior
      ctx.fillRect(16, 128, 160, 8); // Viga inferior
      ctx.fillRect(16, 40, 8, 96); // Pilar esq
      ctx.fillRect(168, 40, 8, 96); // Pilar dir
      ctx.fillRect(92, 40, 8, 96); // Pilar central
      
      ctx.beginPath(); // Diagonal esq
      ctx.moveTo(16, 48); ctx.lineTo(92, 128);
      ctx.lineTo(100, 128); ctx.lineTo(24, 48);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      ctx.beginPath(); // Diagonal dir
      ctx.moveTo(168, 48); ctx.lineTo(92, 128);
      ctx.lineTo(84, 128); ctx.lineTo(160, 48);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Telhado gigante
      ctx.fillStyle = '#8b2500';
      ctx.beginPath();
      ctx.moveTo(8, 50);
      ctx.lineTo(96, 10);
      ctx.lineTo(184, 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Porta com contorno
      ctx.fillStyle = '#3e2723';
      this.drawRoundedRect(ctx, 76, 96, 40, 40, 8);
      ctx.fill();
      ctx.stroke();

      // Cruz templária iluminada
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(90, 60, 12, 30);
      ctx.fillRect(80, 70, 32, 10);
      // Brilho da cruz
      ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
      ctx.beginPath();
      ctx.ellipse(96, 75, 24, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chaminé com fumaça
      ctx.fillStyle = '#555555';
      ctx.fillRect(140, 10, 16, 30);
      ctx.strokeRect(140, 10, 16, 30);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      ctx.beginPath(); ctx.arc(148, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(156, -10, 12, 0, Math.PI * 2); ctx.fill();

      canvas!.refresh();
    }

    // Forja do Ferreiro (128x96)
    if (!this.textures.exists('forge-building')) {
      const canvas = this.textures.createCanvas('forge-building', 128, 96);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Base de pedra
      const wallGrad = ctx.createLinearGradient(0, 0, 128, 96);
      wallGrad.addColorStop(0, '#6b5b4a');
      wallGrad.addColorStop(0.5, '#5a4a3a');
      wallGrad.addColorStop(1, '#3a2a1a');
      ctx.fillStyle = wallGrad;
      this.drawRoundedRect(ctx, 8, 20, 112, 68, 6);

      // Telhado escuro
      const roofGrad = ctx.createLinearGradient(0, 0, 128, 24);
      roofGrad.addColorStop(0, '#4a3528');
      roofGrad.addColorStop(0.5, '#3a2518');
      roofGrad.addColorStop(1, '#2a1508');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(4, 24);
      ctx.lineTo(64, 2);
      ctx.lineTo(124, 24);
      ctx.closePath();
      ctx.fill();

      // Porta
      ctx.fillStyle = '#3a2010';
      this.drawRoundedRect(ctx, 50, 56, 28, 32, 6);

      // Bigorna à frente
      ctx.fillStyle = '#555555';
      this.drawRoundedRect(ctx, 94, 62, 20, 14, 3);
      ctx.fillStyle = '#777777';
      this.drawRoundedRect(ctx, 90, 60, 28, 6, 3);

      // Chaminé com fumaça (indicador visual)
      ctx.fillStyle = '#555555';
      this.drawRoundedRect(ctx, 100, 4, 14, 20, 3);

      // Janela com brilho de fogo
      const fireGlow = ctx.createRadialGradient(30, 46, 2, 30, 46, 12);
      fireGlow.addColorStop(0, 'rgba(255, 150, 50, 0.8)');
      fireGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(22, 38, 16, 16);

      canvas!.refresh();
    }

    // Barraca do Mercado (128x80)
    if (!this.textures.exists('shop-building')) {
      const canvas = this.textures.createCanvas('shop-building', 128, 80);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Toldo listrado (azul e branco)
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#0066cc' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(i * 16, 16);
        ctx.lineTo(i * 16 + 8, 0);
        ctx.lineTo(i * 16 + 16, 16);
        ctx.closePath();
        ctx.fill();
      }

      // Base de madeira do balcão
      const woodGrad = ctx.createLinearGradient(0, 16, 0, 80);
      woodGrad.addColorStop(0, '#8B6914');
      woodGrad.addColorStop(0.5, '#6b4914');
      woodGrad.addColorStop(1, '#4a3010');
      ctx.fillStyle = woodGrad;
      this.drawRoundedRect(ctx, 8, 16, 112, 56, 4);

      // Balcão frontal
      ctx.fillStyle = '#9a7934';
      this.drawRoundedRect(ctx, 12, 48, 104, 12, 3);
      
      // Itens na barraca
      // Poção vermelha
      ctx.fillStyle = '#cc0033';
      this.drawRoundedRect(ctx, 24, 24, 10, 16, 4);
      ctx.fillStyle = '#eeeeee';
      this.drawRoundedRect(ctx, 27, 20, 4, 6, 2);
      // Poção azul
      ctx.fillStyle = '#2266cc';
      this.drawRoundedRect(ctx, 42, 24, 10, 16, 4);
      ctx.fillStyle = '#eeeeee';
      this.drawRoundedRect(ctx, 45, 20, 4, 6, 2);
      // Poção verde
      ctx.fillStyle = '#22aa44';
      this.drawRoundedRect(ctx, 60, 24, 10, 16, 4);
      ctx.fillStyle = '#eeeeee';
      this.drawRoundedRect(ctx, 63, 20, 4, 6, 2);

      // Saco de moedas
      ctx.fillStyle = '#8B6914';
      ctx.beginPath();
      ctx.ellipse(90, 32, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(88, 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(93, 30, 3, 0, Math.PI * 2);
      ctx.fill();

      canvas!.refresh();
    }

    // Fundo Procedural Dark Fantasy + Hades (Pedras Escuras com Neon)
    if (!this.textures.exists('dark-stone-ground')) {
      const canvas = this.textures.createCanvas('dark-stone-ground', 256, 256);
      const ctx = canvas!.getContext();

      // Fundo Base (Pedra Obsidiana / Carvão)
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, 256, 256);

      // Desenhando blocos de pedra irregulares (estilo Dark Souls)
      for (let i = 0; i < 40; i++) {
        const px = Math.random() * 256;
        const py = Math.random() * 256;
        const w = 30 + Math.random() * 40;
        const h = 20 + Math.random() * 30;

        ctx.fillStyle = `rgba(${20 + Math.random()*15}, ${20 + Math.random()*15}, ${20 + Math.random()*20}, 0.8)`;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + w, py + Math.random() * 10);
        ctx.lineTo(px + w - Math.random() * 10, py + h);
        ctx.lineTo(px - Math.random() * 10, py + h - Math.random() * 10);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#050505'; // Contorno muito escuro
        ctx.stroke();
      }

      // Veios de energia brilhante (Estilo Hades - Neon Magenta / Ciano)
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        let sx = Math.random() * 256;
        let sy = Math.random() * 256;
        ctx.moveTo(sx, sy);
        
        for (let j = 0; j < 4; j++) {
          sx += (Math.random() - 0.5) * 60;
          sy += (Math.random() - 0.5) * 60;
          ctx.lineTo(sx, sy);
        }
        
        ctx.lineWidth = Math.random() * 3 + 1;
        // Cores vibrantes
        const neonColors = ['#ff0055', '#00ffcc', '#bf00ff'];
        ctx.strokeStyle = neonColors[Math.floor(Math.random() * neonColors.length)];
        // Efeito de brilho "Glow"
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      }
      ctx.globalCompositeOperation = 'source-over';

      canvas!.refresh();
    }
  }

  // =====================================================
  // PARTÍCULAS E ATMOSFERA
  // =====================================================

  private createParticleTextures(): void {
    const goldPart = this.textures.createCanvas('particle-gold', 12, 12);
    const gCtx = goldPart!.getContext();
    const gradient = gCtx.createRadialGradient(6, 6, 0, 6, 6, 6);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ffd700');
    gradient.addColorStop(0.7, '#b8860b');
    gradient.addColorStop(1, 'rgba(184, 134, 11, 0)');
    gCtx.fillStyle = gradient;
    gCtx.fillRect(0, 0, 12, 12);
    goldPart!.refresh();

    const leafPart = this.textures.createCanvas('particle-leaf', 12, 12);
    const lCtx = leafPart!.getContext();
    lCtx.fillStyle = '#4a9a32';
    lCtx.beginPath();
    lCtx.ellipse(6, 6, 5, 3, 0.4, 0, Math.PI * 2);
    lCtx.fill();
    lCtx.fillStyle = '#2d6a1e';
    lCtx.fillRect(6, 4, 1, 5);
    leafPart!.refresh();

    const ffPart = this.textures.createCanvas('particle-firefly', 14, 14);
    const ffCtx = ffPart!.getContext();
    const ffGrad = ffCtx.createRadialGradient(7, 7, 0, 7, 7, 7);
    ffGrad.addColorStop(0, '#ffffff');
    ffGrad.addColorStop(0.3, '#adff2f');
    ffGrad.addColorStop(0.7, 'rgba(173, 255, 47, 0.4)');
    ffGrad.addColorStop(1, 'rgba(173, 255, 47, 0)');
    ffCtx.fillStyle = ffGrad;
    ffCtx.fillRect(0, 0, 14, 14);
    ffPart!.refresh();
  }

  private createAtmosphericTextures(): void {
    const vw = 1280;
    const vh = 720;
    const vignette = this.textures.createCanvas('vignette', vw, vh);
    const vCtx = vignette!.getContext();
    const vGrad = vCtx.createRadialGradient(vw / 2, vh / 2, vw * 0.25, vw / 2, vh / 2, vw * 0.65);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, 'rgba(5,2,10,0.6)');
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

  // =====================================================
  // SOLOS PROCEDURAIS HD
  // =====================================================

  private createProceduralGrounds(): void {
    // 1. Chão do Vilarejo HD Gótico (Grama Escura, Paralelepípedos Templários e Ruínas) - 1024x1024 tilável
    if (!this.textures.exists('procedural-village')) {
      const canvas = this.textures.createCanvas('procedural-village', 512, 512);
      const ctx = canvas!.getContext();
      ctx.imageSmoothingEnabled = true;

      // 1. Fundo Base: Verde Gramado Prado Homogêneo (#21441e)
      ctx.fillStyle = '#21441e';
      ctx.fillRect(0, 0, 512, 512);

      // 2. Manchas Orgânicas de Grama Musgo (Com wrapping 100% Seamless)
      for (let i = 0; i < 1200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 14 + 4;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(46, 106, 38, 0.35)' : 'rgba(25, 60, 22, 0.35)';

        for (let dx of [0, -512, 512]) {
          for (let dy of [0, -512, 512]) {
            ctx.beginPath();
            ctx.ellipse(x + dx, y + dy, r * 1.3, r, 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Estradas de Terra Batida Suave
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rx = Math.random() * 50 + 20;
        const ry = Math.random() * 30 + 15;
        ctx.fillStyle = 'rgba(78, 56, 32, 0.18)';

        for (let dx of [0, -512, 512]) {
          for (let dy of [0, -512, 512]) {
            ctx.beginPath();
            ctx.ellipse(x + dx, y + dy, rx, ry, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Flores Silvestres
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.5 ? '#ffd700' : '#ff99bb';

        for (let dx of [0, -512, 512]) {
          for (let dy of [0, -512, 512]) {
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, Math.random() * 1.5 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      canvas!.refresh();
    }

    // 2. Chão da Taverna (Tábuas de Madeira) - 512x512 tilável
    if (!this.textures.exists('procedural-tavern')) {
      const canvas = this.textures.createCanvas('procedural-tavern', 512, 512);
      const ctx = canvas!.getContext();
      
      ctx.fillStyle = '#2b1b10';
      ctx.fillRect(0, 0, 512, 512);

      const boardHeight = 64;
      for (let y = 0; y < 512; y += boardHeight) {
        let x = 0;
        while (x < 512) {
          const boardWidth = 128 + Math.random() * 128; // tábuas de tamanhos diferentes
          
          // Gradiente da tábua
          const grad = ctx.createLinearGradient(x, y, x, y + boardHeight);
          grad.addColorStop(0, '#4a3018');
          grad.addColorStop(0.5, '#3a2412');
          grad.addColorStop(1, '#251508');
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, boardWidth, boardHeight - 2);

          // Ranhuras da madeira
          ctx.strokeStyle = 'rgba(20, 10, 5, 0.3)';
          ctx.lineWidth = 1;
          for (let l = 0; l < 5; l++) {
            ctx.beginPath();
            ctx.moveTo(x, y + Math.random() * boardHeight);
            ctx.lineTo(x + boardWidth, y + Math.random() * boardHeight);
            ctx.stroke();
          }

          // Pregos
          ctx.fillStyle = '#111';
          ctx.beginPath(); ctx.arc(x + 10, y + 10, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + 10, y + boardHeight - 12, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + boardWidth - 10, y + 10, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(x + boardWidth - 10, y + boardHeight - 12, 2, 0, Math.PI*2); ctx.fill();

          x += boardWidth + 2;
        }
      }
      canvas!.refresh();
    }

    // 3. Chão da Masmorra (Pedras Escuras e Lodo) - 512x512 tilável
    if (!this.textures.exists('procedural-dungeon')) {
      const canvas = this.textures.createCanvas('procedural-dungeon', 512, 512);
      const ctx = canvas!.getContext();
      
      ctx.fillStyle = '#111115';
      ctx.fillRect(0, 0, 512, 512);

      const blockSize = 64;
      for (let y = 0; y < 512; y += blockSize) {
        for (let x = 0; x < 512; x += blockSize) {
          const offsetX = (y / blockSize) % 2 === 0 ? 0 : blockSize / 2;
          const drawX = x - offsetX;

          const grad = ctx.createRadialGradient(drawX + 32, y + 32, 5, drawX + 32, y + 32, 40);
          grad.addColorStop(0, '#2a2a30');
          grad.addColorStop(1, '#1a1a20');
          ctx.fillStyle = grad;
          ctx.fillRect(drawX + 2, y + 2, blockSize - 4, blockSize - 4);

          // Detalhes da pedra (rachaduras)
          if (Math.random() > 0.7) {
            ctx.strokeStyle = '#0a0a0c';
            ctx.beginPath();
            ctx.moveTo(drawX + Math.random() * 64, y);
            ctx.lineTo(drawX + Math.random() * 64, y + 64);
            ctx.stroke();
          }

          // Lodo verde nos cantos
          if (Math.random() > 0.8) {
            ctx.fillStyle = 'rgba(20, 60, 20, 0.4)';
            ctx.beginPath();
            ctx.arc(drawX + 10, y + 10, Math.random() * 15 + 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      canvas!.refresh();
    }
  }

  // =====================================================
  // ANIMAÇÕES
  // =====================================================

  private createClassAnimations(): void {
    const classes = [
      'PALADIN', 'GUARDIAN', 'WARRIOR', 'MAGE', 'NECROMANCER',
      'ARCHER', 'ASSASSIN', 'CLERIC', 'DARK_KNIGHT', 'ELEMENTALIST',
      'BARD', 'DRUID', 'npc-blacksmith', 'npc-merchant', 'npc-master'
    ];
    const directions = ['down', 'left', 'right', 'up'];
    classes.forEach((cls) => {
      directions.forEach((dir, index) => {
        const sheetKey = cls.startsWith('npc-') ? cls : `${cls}-sheet`;
        if (!this.anims.exists(`${cls}-idle-${dir}`)) {
          this.anims.create({
            key: `${cls}-idle-${dir}`,
            frames: this.anims.generateFrameNumbers(sheetKey, {
              start: index * 4,
              end: index * 4,
            }),
            frameRate: 1,
            repeat: -1,
          });
        }

        if (!this.anims.exists(`${cls}-walk-${dir}`)) {
          this.anims.create({
            key: `${cls}-walk-${dir}`,
            frames: this.anims.generateFrameNumbers(sheetKey, {
              start: index * 4,
              end: index * 4 + 3,
            }),
            frameRate: 7,
            repeat: -1,
          });
        }
      });
    });
  }
}

import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { ArenaResult } from '../../shared/types/scene.types';
import { TILE_SIZE } from '../config/game.config';
import { Monster } from '../entities/Monster';
import { CombatSystem } from '../systems/CombatSystem';
import { FirebaseService } from '../network/FirebaseService';
import { SoundSynth } from '../utils/SoundSynth';
import { BaseGameScene } from './BaseGameScene';

import { PetEntity } from '../entities/PetEntity';
import { RaidBossEntity } from '../entities/RaidBossEntity';

/**
 * WorldScene — Cenário principal do vilarejo com gráficos HD.
 * Usa imagens de fundo HD em vez de tilemaps pixelados.
 */
export class WorldScene extends BaseGameScene {
  private raidBoss?: RaidBossEntity;
  private masterAldric!: Phaser.GameObjects.Container;
  private blacksmithBjorn!: Phaser.GameObjects.Container;
  private merchantElise!: Phaser.GameObjects.Container;
  private interactionText!: Phaser.GameObjects.Text;
  private isNearAldric = false;
  private isNearMerchant = false;
  private isNearBlacksmith = false;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private pet!: PetEntity;
  private worldMonsters: Monster[] = [];
  private guards: Phaser.GameObjects.Container[] = [];

  private gameHour = 12.0;
  private playerLight!: Phaser.GameObjects.Light;
  private streetLamps: Phaser.GameObjects.Light[] = [];
  // Colisão via zones (sem tilemap)
  private wallBodies: Phaser.Physics.Arcade.StaticGroup | null = null;

  constructor() {
    super({ key: 'WorldScene' });
  }

  private saveTimer = 0;
  private readonly AUTOSAVE_INTERVAL = 30_000;

  private isNearTavernDoor = false;

  private pendingArenaResult: ArenaResult | null = null;
  private customPlayerName = 'Templário';
  private isNewGame = false;

  init(data: { name?: string; isNewGame?: boolean; playerClass?: PlayerClass; fromSave?: boolean; fromTavern?: boolean; arenaResult?: ArenaResult }): void {
    if (data.name) this.customPlayerName = data.name;
    if (data.playerClass) this.playerClass = data.playerClass;
    this.isNewGame = !!data.isNewGame;
    this.fromTavern = !!data.fromTavern;
    if (data.arenaResult) {
      this.pendingArenaResult = data.arenaResult;
    }
  }

  private fromTavern = false;

  create(): void {
    SoundSynth.playBGM('village');
    
    // Explicitamente faz fade-in para evitar tela preta ao iniciar do MainMenu/Arena
    this.cameras.main.fadeIn(800, 0, 0, 0);

    this.combatSystem = new CombatSystem(this);

    // ==========================================
    // CENÁRIO HD — Fundo pintado + edifícios HD
    // ==========================================
    this.createHDWorld();

    const spawnX = this.fromTavern ? 25 * TILE_SIZE : 25 * TILE_SIZE;
    const spawnY = this.fromTavern ? 18 * TILE_SIZE : 28 * TILE_SIZE;
    this.createPlayerCharacter(spawnX, spawnY, true);

    this.createWorldNPCs();

    this.pet = new PetEntity(this, this.player.x - 24, this.player.y - 24, 'dragon');
    this.pet.setTarget(this.player);
    this.createHDDecorations();
    this.combatSystem.setPlayerClass(this.playerClass);
    this.applyClassVisuals();
    this.spawnMonsters();
    this.createDungeonPortal();
    this.createFishingSpot();
    this.createAtmosphere();

    const worldW = 160 * TILE_SIZE;
    const worldH = 120 * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(0.85); // um pouco mais de zoom out para ver melhor o mapa estendido
    this.cameras.main.setBackgroundColor('#0d1a0d');

    this.setupControls();

    if (this.input.keyboard) {
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    const { width, height } = this.scale;
    this.interactionText = this.add.text(width / 2, height - 24, '', {
      fontFamily: 'MedievalSharp',
      fontSize: '14px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: 'rgba(10, 6, 18, 0.85)',
      padding: { x: 10, y: 6 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.cameras.main.fadeIn(800);
    this.loadSave();

    if (this.pendingArenaResult) {
      const res = this.pendingArenaResult;
      this.pendingArenaResult = null;
      this.time.delayedCall(200, () => this.resumeFromArena(res));
    }

    this.events.on('request-save', () => this.persistSave());
  }

  // ==========================================
  // MUNDO HD — Imagem de fundo + edifícios como sprites
  // ==========================================

  private createHDWorld(): void {
    // Expandindo para um verdadeiro Overworld!
    const worldW = 160 * TILE_SIZE;
    const worldH = 120 * TILE_SIZE;

    // 1. Fundo do Vilarejo HD Procedural (1024x1024 tilável sem emendas)
    const ground = this.add.tileSprite(worldW / 2, worldH / 2, worldW, worldH, 'procedural-village');
    ground.setOrigin(0.5, 0.5);
    ground.setDepth(0);

    // Vignette Gótica Sombria Fixa na Câmera (Efeito Diablo Dark Fantasy)
    const { width: scrW, height: scrH } = this.scale;
    const vignette = this.add.graphics();
    vignette.setScrollFactor(0);
    vignette.setDepth(99);
    
    // Gradiente de vinheta nos cantos
    vignette.fillStyle(0x000000, 0.35);
    vignette.fillRect(0, 0, scrW, 30);
    vignette.fillRect(0, scrH - 30, scrW, 30);
    vignette.fillRect(0, 0, 30, scrH);
    vignette.fillRect(scrW - 30, 0, 30, scrH);

    // 3. Bordas do mundo (muros de pedra e colisões naturais)
    this.wallBodies = this.physics.add.staticGroup();

    // Muros invisíveis nas bordas
    const createWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.rectangle(x, y, w, h, 0x3a2a1a, 0);
      this.wallBodies!.add(wall);
    };

    // Bordas do mapa
    createWall(worldW / 2, 0, worldW, 32); // Topo
    createWall(worldW / 2, worldH, worldW, 32); // Baixo
    createWall(0, worldH / 2, 32, worldH); // Esquerda
    createWall(worldW, worldH / 2, 32, worldH); // Direita

    // Muros de pedra decorativos visíveis nas bordas
    const wallDeco = this.add.graphics();
    wallDeco.setDepth(2);
    wallDeco.fillStyle(0x3a2a1a, 0.8);
    wallDeco.fillRect(0, 0, worldW, TILE_SIZE);
    wallDeco.fillRect(0, worldH - TILE_SIZE, worldW, TILE_SIZE);
    wallDeco.fillRect(0, 0, TILE_SIZE, worldH);
    wallDeco.fillRect(worldW - TILE_SIZE, 0, TILE_SIZE, worldH);

    // 4. EDIFÍCIOS HD como sprites posicionados no cenário
    this.placeBuildings();

    // 5. Colisão do jogador com muros e árvores
    // (será conectada em createPlayerCharacter via wallBodies e treeBodies)
  }

  private placeBuildings(): void {
    // --- TAVERNA DOS TEMPLÁRIOS (edifício principal) ---
    const tavern = this.add.image(25 * TILE_SIZE, 12 * TILE_SIZE, 'tavern-building');
    tavern.setDisplaySize(9 * TILE_SIZE, 8 * TILE_SIZE);
    tavern.setDepth(15 * TILE_SIZE);
    tavern.setOrigin(0.5, 0.5);
    tavern.setPipeline('Light2D');

    // Placa da Taverna
    const signBg = this.add.graphics();
    signBg.setPosition(25 * TILE_SIZE, 7.5 * TILE_SIZE);
    signBg.fillStyle(0x0e0818, 0.92);
    signBg.fillRoundedRect(-70, -16, 140, 32, 8);
    signBg.lineStyle(2, 0xd4af37, 1);
    signBg.strokeRoundedRect(-70, -16, 140, 32, 8);
    signBg.setDepth(16);

    this.add.text(25 * TILE_SIZE, 7.5 * TILE_SIZE, '🍺 TAVERNA DOS TEMPLÁRIOS', {
      fontFamily: 'Cinzel', fontSize: '13px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(17);

    // Zona de colisão da taverna
    const tavernWall = this.add.rectangle(25 * TILE_SIZE, 12 * TILE_SIZE, 7 * TILE_SIZE, 4 * TILE_SIZE, 0, 0);
    this.wallBodies!.add(tavernWall);

    // --- FORJA DO FERREIRO BJORN ---
    const forge = this.add.image(34 * TILE_SIZE, 17 * TILE_SIZE, 'forge-building');
    forge.setDisplaySize(7 * TILE_SIZE, 6 * TILE_SIZE);
    forge.setDepth(19 * TILE_SIZE);
    forge.setOrigin(0.5, 0.5);

    this.add.text(34 * TILE_SIZE, 13.5 * TILE_SIZE, '🔨 FORJA DO FERREIRO', {
      fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ff8c00',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(17);

    const forgeWall = this.add.rectangle(34 * TILE_SIZE, 17 * TILE_SIZE, 5 * TILE_SIZE, 3 * TILE_SIZE, 0, 0);
    this.wallBodies!.add(forgeWall);

    // --- BARRACA DO MERCADO ---
    const shop = this.add.image(16 * TILE_SIZE, 17 * TILE_SIZE, 'tavern-building');
    shop.setDisplaySize(6.5 * TILE_SIZE, 5.5 * TILE_SIZE);
    shop.setDepth(18.5 * TILE_SIZE);
    shop.setOrigin(0.5, 0.5);

    this.add.text(16 * TILE_SIZE, 13.5 * TILE_SIZE, '🛒 MERCADO DE SUPRIMENTOS', {
      fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#00ffcc',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(17);

    const shopWall = this.add.rectangle(16 * TILE_SIZE, 17 * TILE_SIZE, 5 * TILE_SIZE, 2.5 * TILE_SIZE, 0, 0);
    this.wallBodies!.add(shopWall);
  }

  private createWorldNPCs(): void {
    this.blacksmithBjorn = this.createNPC(34 * TILE_SIZE, 20 * TILE_SIZE, 'blacksmith', 'Ferreiro Bjorn', '🔨', () => this.openBjornDialogue());
    this.merchantElise = this.createNPC(16 * TILE_SIZE, 20 * TILE_SIZE, 'merchant', 'Mercadora Elise', '🛒', () => this.openEliseDialogue());
    this.masterAldric = this.createNPC(25 * TILE_SIZE, 22 * TILE_SIZE, 'master', 'Mestre Aldric', '📜', () => this.openAldricDialogue());

    // Guardas Templários na Entrada da Cidade
    this.guards.push(this.createNPC(16 * TILE_SIZE, 26 * TILE_SIZE, 'master', 'Guarda Templário Cedric', '🛡️'));
    this.guards.push(this.createNPC(34 * TILE_SIZE, 26 * TILE_SIZE, 'master', 'Guarda Templário Gareth', '🛡️'));
  }

  private createNPC(x: number, y: number, frameKey: string, name: string, icon: string, onInteract?: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setDepth(y / TILE_SIZE + 2);

    const npcSprite = this.add.sprite(0, 0, `npc-${frameKey}`, 0);
    npcSprite.setScale(1.2).setOrigin(0.5, 0.85).setPipeline('Light2D');
    npcSprite.setDepth(y); // Dinâmico com Y para iso fake
    npcSprite.setInteractive({ useHandCursor: true });

    // Sombra suave
    const shadow = this.add.ellipse(0, 8, 28, 10, 0x000000, 0.35);

    const nameText = this.add.text(0, -48, name, {
      fontFamily: 'MedievalSharp', fontSize: '12px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    const iconText = this.add.text(0, -64, icon, { fontSize: '18px' }).setOrigin(0.5);

    // Balão flutuante de conversa
    const bubble = this.add.container(0, -82).setVisible(false);
    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0x0a0618, 0.92);
    bubbleBg.fillRoundedRect(-55, -14, 110, 28, 6);
    bubbleBg.lineStyle(1.5, 0xffd700, 1);
    bubbleBg.strokeRoundedRect(-55, -14, 110, 28, 6);
    const bubbleText = this.add.text(0, 0, '💬 Conversar [E]', {
      fontFamily: 'Cinzel', fontSize: '10px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    bubble.add([bubbleBg, bubbleText]);

    container.add([shadow, npcSprite, nameText, iconText, bubble]);

    this.tweens.add({ targets: iconText, y: -68, duration: 1200, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    this.tweens.add({ targets: npcSprite, scaleY: 1.25, duration: 1800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    this.tweens.add({ targets: bubble, y: -86, duration: 1000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    if (onInteract) {
      npcSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
        if (dist < 100) {
          onInteract();
        } else {
          this.combatSystem.showFloatingText(x, y - 40, 'Chegue mais perto!', '#ffbb00');
        }
      });
    }

    container.setData('bubble', bubble);
    return container;
  }

  private createHDDecorations(): void {
    const mapW = 160;
    const mapH = 120;

    for (let y = 3; y < mapH - 3; y++) {
      for (let x = 3; x < mapW - 3; x++) {
        // Evitar edifícios e praça central
        if (x >= 19 && x <= 31 && y >= 8 && y <= 24) continue;
        if (x >= 31 && x <= 37 && y >= 14 && y <= 21) continue;
        if (x >= 13 && x <= 19 && y >= 14 && y <= 21) continue;
        if (x >= 36 && x <= 44 && y >= 26 && y <= 36) continue;
        
        // Evitar bloqueio da Estrada Vertical Principal (x entre 20 e 30)
        if (x >= 20 && x <= 30 && y >= 8 && y <= 110) continue;
        
        // Evitar bloqueio da Estrada Horizontal (y entre 18 e 25)
        if (x >= 8 && x <= 140 && y >= 18 && y <= 25) continue;
        
        // Evitar zona do portal da Masmorra
        if (x >= 22 && x <= 28 && y >= 4 && y <= 8) continue;
        
        // Evitar a zona de pesca
        if (x >= 40 && x <= 46 && y >= 36 && y <= 42) continue;

        const rand = Phaser.Math.Between(0, 1000);
        if (rand < 25) { // 2.5% chance de árvore
          const tree = this.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'deco-tree');
          tree.setScale(0.12).setOrigin(0.5, 0.85).setDepth(y + 2);
          
          this.physics.add.existing(tree, true);
          (tree.body as Phaser.Physics.Arcade.StaticBody).setSize(30, 20).setOffset(30, 70);
          this.wallBodies!.add(tree);
          
        } else if (rand < 60) { // 3.5% chance
          this.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'deco-bush')
            .setScale(0.08).setDepth(y + 1);
        } else if (rand < 100) { // 4% chance
          this.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'deco-flower')
            .setScale(1.0).setDepth(y);
        }
      }
    }
  }

  private createAtmosphere(): void {
    const mapW = 80 * TILE_SIZE;
    const mapH = 60 * TILE_SIZE;

    this.lights.enable();
    this.lights.setAmbientColor(0xcbbba8);

    this.playerLight = this.lights.addLight(this.player.x, this.player.y, 150, 0xffe6a3, 1.3);

    const lampPositions = [
      { x: 18 * TILE_SIZE, y: 16 * TILE_SIZE },
      { x: 32 * TILE_SIZE, y: 16 * TILE_SIZE },
      { x: 25 * TILE_SIZE, y: 26 * TILE_SIZE },
      { x: 26 * TILE_SIZE, y: 18 * TILE_SIZE },
      { x: 20 * TILE_SIZE, y: 22 * TILE_SIZE },
      { x: 30 * TILE_SIZE, y: 22 * TILE_SIZE },
    ];

    lampPositions.forEach((pos) => {
      const lamp = this.lights.addLight(pos.x, pos.y, 120, 0xffbb55, 1.4);
      this.streetLamps.push(lamp);

      const glow = this.add.graphics();
      glow.fillStyle(0xffe6a3, 0.6);
      glow.fillCircle(pos.x, pos.y, 5);
      glow.fillStyle(0xffa500, 0.25);
      glow.fillCircle(pos.x, pos.y, 12);
      glow.setDepth(pos.y / TILE_SIZE + 3);
    });

    // Luz quente emanando da taverna
    const tavernLight = this.add.image(25 * TILE_SIZE, 14 * TILE_SIZE, 'light-warm');
    tavernLight.setScale(4.5).setAlpha(0.45).setBlendMode('ADD').setDepth(15);
    this.tweens.add({ targets: tavernLight, alpha: 0.3, scaleX: 4.2, scaleY: 4.2, duration: 2500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    // Sistema Dinâmico de Clima: Chuva ou Vento
    if (Math.random() > 0.5) {
      // Clima: Chuva
      this.add.particles(0, 0, 'particle-gold', { // reusando como pingo de chuva, mudando cor
        x: { min: 0, max: mapW },
        y: { min: 0, max: mapH },
        lifespan: 1000,
        speedY: { min: 400, max: 600 },
        speedX: { min: 50, max: 100 },
        scaleX: { start: 0.1, end: 0.1 },
        scaleY: { start: 1.5, end: 2.0 },
        alpha: { start: 0.5, end: 0.1 },
        tint: 0x88ccff,
        frequency: 10,
        blendMode: 'ADD'
      }).setDepth(500);
      
      // Escurecer o ambiente para chuva
      this.cameras.main.setBackgroundColor('#050a12');
    } else {
      // Clima: Folhas ao vento
      this.add.particles(0, 0, 'particle-leaf', {
        x: { min: 0, max: mapW },
        y: { min: 0, max: mapH },
        lifespan: { min: 3000, max: 6000 },
        speedX: { min: -100, max: -200 },
        speedY: { min: 20, max: 60 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.4, end: 0.1 },
        alpha: { start: 0.8, end: 0 },
        frequency: 50,
      }).setDepth(500);
    }

    // Fumaça da chaminé da taverna
    this.add.particles(26 * TILE_SIZE, 10 * TILE_SIZE, 'particle-gold', {
      speedY: { min: -30, max: -50 },
      speedX: { min: -10, max: 15 },
      scale: { start: 0.8, end: 0.1 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 2500,
      quantity: 1,
      frequency: 200,
      tint: [0xffa500, 0xffd700, 0xff4500],
      blendMode: 'ADD',
    }).setDepth(25);

    // Faíscas na forja
    this.add.particles(36 * TILE_SIZE, 18 * TILE_SIZE, 'particle-gold', {
      speed: { min: 20, max: 60 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.7, end: 0 },
      lifespan: 1400,
      quantity: 1,
      frequency: 250,
      tint: [0xff4500, 0xff8c00, 0xffd700],
      blendMode: 'ADD',
    }).setDepth(25);

    // Vinheta atmosférica
    const { width, height } = this.cameras.main;
    const vignette = this.add.image(
      this.cameras.main.scrollX + width / 2,
      this.cameras.main.scrollY + height / 2,
      'vignette',
    );
    vignette.setScrollFactor(0).setDisplaySize(width, height).setAlpha(0.35).setDepth(100);
  }

  private spawnMonsters(): void {
    // Zona Segura: x < 50 tiles, y < 40 tiles
    const isSafeZone = (x: number, y: number) => x < 50 * TILE_SIZE && y < 40 * TILE_SIZE;

    const numMonsters = 40; // Muitos monstros no Overworld!
    const types = ['GOBLIN', 'SHADOW_WOLF', 'SKELETON', 'DEMON_IMP'];

    let spawned = 0;
    while (spawned < numMonsters) {
      const rx = 10 + Math.random() * 140; // Tiles de X
      const ry = 10 + Math.random() * 100; // Tiles de Y
      const px = rx * TILE_SIZE;
      const py = ry * TILE_SIZE;

      if (!isSafeZone(px, py)) {
        const type = types[Math.floor(Math.random() * types.length)];
        const monster = new Monster(this, px, py, type);
        monster.setTarget(this.player); // Opcional, pode ser agro-range
        this.worldMonsters.push(monster);
        this.combatSystem.registerMonster(monster);
        spawned++;
      }
    }

    // Instanciação do World Boss na borda da zona segura
    this.raidBoss = new RaidBossEntity(this, 50 * TILE_SIZE, 30 * TILE_SIZE);
  }

  private createDungeonPortal(): void {
    const px = 25 * TILE_SIZE;
    const py = 6 * TILE_SIZE;

    const portal = this.add.graphics();
    portal.setPosition(px, py);

    // Portal com gradiente radial brilhante
    const portalGlow = this.add.image(px, py, 'light-warm');
    portalGlow.setScale(1.5).setAlpha(0.6).setBlendMode('ADD').setTint(0x8a2be2).setDepth(14);

    portal.fillStyle(0x8a2be2, 0.5);
    portal.fillCircle(0, 0, 36);
    portal.lineStyle(3, 0xff00ff, 0.9);
    portal.strokeCircle(0, 0, 36);
    portal.setDepth(15);

    this.tweens.add({
      targets: [portal, portalGlow],
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.5,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(px, py - 50, '🚪 MASMORRA DOS ESQUECIDOS\n[Entrar]', {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(20);

    const zone = this.add.zone(px, py, 60, 60);
    this.physics.add.existing(zone, true);

    this.physics.add.overlap(this.player, zone, () => {
      this.scene.start('DungeonScene', { playerClass: this.playerClass });
    });
  }

  private createFishingSpot(): void {
    const fx = 42 * TILE_SIZE;
    const fy = 32 * TILE_SIZE;

    // Lago com água
    const lake = this.add.graphics();
    lake.fillStyle(0x1a4a6b, 0.7);
    lake.fillEllipse(fx, fy, 6 * TILE_SIZE, 4 * TILE_SIZE);
    lake.fillStyle(0x2a6a8b, 0.4);
    lake.fillEllipse(fx - 16, fy - 10, 3 * TILE_SIZE, 2 * TILE_SIZE);
    lake.setDepth(1);
    lake.setPipeline('Light2D');

    // Pier de madeira
    const pier = this.add.graphics();
    pier.fillStyle(0x5c4033, 0.9);
    pier.fillRoundedRect(fx - 20, fy - 12, 40, 28, 4);
    pier.setDepth(14);

    this.add.text(fx, fy - 36, '🎣 PÍER DA LAGOA\n[Pressione ENTER para Pescar]', {
      fontFamily: 'Cinzel',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(20);

    const fishingZone = this.add.zone(fx, fy, 56, 56);
    this.physics.add.existing(fishingZone, true);

    this.physics.add.overlap(this.player, fishingZone, () => {
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        (this.scene.get('UIScene') as any)?.startFishingMinigame();
      }
    });
  }

  // ==========================================
  // INTERAÇÕES E NPC PROXIMITY
  // ==========================================

  private checkNPCProximity(
    npc: Phaser.GameObjects.Container,
    isNear: boolean,
    promptText: string,
    onInteract: () => void,
    setNear: (v: boolean) => void,
  ): boolean {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
    const bubble = npc.getData('bubble') as Phaser.GameObjects.Container;

    if (dist < 70) {
      if (!isNear) {
        setNear(true);
        if (bubble) bubble.setVisible(true);
      }
      const justPressed = (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) ||
                         (this.eKey && Phaser.Input.Keyboard.JustDown(this.eKey)) ||
                         Phaser.Input.Keyboard.JustDown(this.spaceKey);
      if (justPressed) {
        onInteract();
        return true;
      }
    } else if (isNear) {
      setNear(false);
      if (bubble) bubble.setVisible(false);
    }
    return false;
  }

  update(time: number): void {
    this.raidBoss?.updateBoss(time, this.player);

    // Colisão com muros (wallBodies)
    if (this.wallBodies && this.player) {
      this.physics.collide(this.player, this.wallBodies);
    }

    // Check Tavern Door Interaction
    const distDoor = Phaser.Math.Distance.Between(this.player.x, this.player.y, 25 * TILE_SIZE, 15.5 * TILE_SIZE);
    if (distDoor < 50) {
      if (!this.isNearTavernDoor) {
        this.isNearTavernDoor = true;
        this.interactionText.setText('🚪 Entrar na Taverna\n[Pressione ESPAÇO ou ENTER]').setVisible(true);
      }
      if ((this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.enterTavern();
        return;
      }
    } else if (this.isNearTavernDoor) {
      this.isNearTavernDoor = false;
      this.interactionText.setVisible(false);
    }

    const aldricInteracted = this.checkNPCProximity(
      this.masterAldric, this.isNearAldric,
      'Mestre Aldric: "Deseja entrar na Arena?"\n[Pressione ENTER para conversar]',
      () => this.openAldricDialogue(),
      (v) => { this.isNearAldric = v; },
    );
    if (aldricInteracted) return;

    const eliseInteracted = this.checkNPCProximity(
      this.merchantElise, this.isNearMerchant,
      'Mercadora Elise: "Deseja ver meus suprimentos?"\n[Pressione ENTER para conversar]',
      () => this.openEliseDialogue(),
      (v) => { this.isNearMerchant = v; },
    );
    if (eliseInteracted) return;

    this.checkNPCProximity(
      this.blacksmithBjorn, this.isNearBlacksmith,
      'Ferreiro Bjorn: "Deseja forjar?"\n[Pressione ENTER para conversar]',
      () => this.openBjornDialogue(),
      (v) => { this.isNearBlacksmith = v; },
    );

    this.handleMovementInput(time);
    // Lógica dos Guardas (Defendendo a Vila)
    if (time % 1000 < 20) { // Checa a cada ~1s
      this.guards.forEach(guard => {
        this.worldMonsters.forEach(m => {
          if (!m.isDead && Phaser.Math.Distance.Between(guard.x, guard.y, m.x, m.y) < 300) {
            // Guarda atira magia de luz no monstro
            const ang = Phaser.Math.Angle.Between(guard.x, guard.y, m.x, m.y);
            this.combatSystem.showFloatingText(guard.x, guard.y - 40, 'PELO TEMPLO!', '#ffaa00');
            m.takeDamage(250); // Instakill em monstros fracos
            
            this.add.particles(m.x, m.y, 'particle-gold', {
              speed: { min: 50, max: 100 }, angle: { min: 0, max: 360 },
              scale: { start: 1, end: 0 }, lifespan: 200, quantity: 10, tint: 0xffffff, blendMode: 'ADD'
            });
          }
        });
      });
    }

    if (this.pet) {
      this.pet.update();
      this.combatSystem.updateLootCollection(this.player.x, this.player.y, this.pet.x, this.pet.y);
    } else {
      this.combatSystem.updateLootCollection(this.player.x, this.player.y);
    }
    this.combatSystem.update(time);
    this.sortDepths();

    this.saveTimer += this.game.loop.delta;
    if (this.saveTimer >= this.AUTOSAVE_INTERVAL) {
      this.saveTimer = 0;
      this.persistSave();
    }

    const dt = this.game.loop.delta / 1000;
    this.updateEnvironmentLighting(dt);

    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y - 12);
    }
  }

  // ==========================================
  // TRANSIÇÕES E DIÁLOGOS
  // ==========================================

  private enterTavern(): void {
    this.isNearTavernDoor = false;
    this.interactionText.setVisible(false);
    this.physics.world.disable(this.player);

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TavernScene', { playerClass: this.playerClass });
    });
  }

  private startBattleArena(): void {
    this.isNearAldric = false;
    this.interactionText.setVisible(false);
    this.physics.world.disable(this.player);

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.pause('WorldScene');
      this.scene.start('BattleScene', {
        playerClass: this.playerClass,
        hp: this.combatSystem.getHP(),
        maxHp: this.combatSystem.getMaxHP(),
        mp: this.combatSystem.getMP(),
        maxMp: this.combatSystem.getMaxMP(),
        level: this.combatSystem.getLevel(),
        xp: this.combatSystem.getXP(),
        maxXp: this.combatSystem.getMaxXP(),
        gold: this.combatSystem.getGold(),
        gems: this.combatSystem.getGems(),
        inventory: this.combatSystem.getInventory(),
        equipped: this.combatSystem.getEquipped(),
      });
    });
  }

  public resumeFromArena(data: ArenaResult): void {
    this.cameras.main.fadeIn(800, 0, 0, 0);
    if (this.player && this.physics.world) {
      this.physics.world.enable(this.player);
    }

    if (data.won) {
      this.combatSystem.setGold(this.combatSystem.getGold() + data.goldGained);
      this.combatSystem.setGems(this.combatSystem.getGems() + data.gemsGained);
    }

    if (data.inventory) this.combatSystem.setInventory(data.inventory);
    if (data.equipped) this.combatSystem.setEquipped(data.equipped);

    if (!data.won) {
      this.combatSystem.setHP(this.combatSystem.getMaxHP());
      this.player.setPosition(25 * TILE_SIZE, 22 * TILE_SIZE);
    } else {
      this.combatSystem.setHP(Math.max(1, Math.floor(this.combatSystem.getMaxHP() * data.hpPercent)));
    }

    this.events.emit('scene-change', 'Taverna dos Templários');
    this.cameras.main.fadeIn(800);
    SoundSynth.playBGM('village');
    this.persistSave();
  }

  private openAldricDialogue(): void {
    this.isNearAldric = false;
    this.interactionText.setVisible(false);
    this.events.emit('show-dialogue', {
      portrait: 'portrait-master',
      title: 'Mestre Aldric',
      text: 'A Arena é um local de grande perigo, mas também de glórias incomparáveis. Você tem coragem de testar sua bravura contra as hordas?',
      hasConfirm: true,
      onConfirm: () => this.startBattleArena(),
    });
  }

  private openEliseDialogue(): void {
    this.isNearMerchant = false;
    this.interactionText.setVisible(false);
    this.events.emit('show-dialogue', {
      portrait: 'portrait-merchant',
      title: 'Mercadora Elise',
      text: 'Olá, bravo guerreiro! Deseja ver os meus suprimentos mágicos e poções curativas para a sua jornada?',
      hasConfirm: true,
      onConfirm: () => this.openMerchantShop(),
    });
  }

  private openBjornDialogue(): void {
    this.isNearBlacksmith = false;
    this.interactionText.setVisible(false);
    this.events.emit('show-dialogue', {
      portrait: 'portrait-blacksmith',
      title: 'Ferreiro Bjorn',
      text: 'Saudações! Minha forja está quente. Quer aprimorar suas armas e armaduras com o poder das gemas e moedas de ouro?',
      hasConfirm: true,
      onConfirm: () => this.openBlacksmithForge(),
    });
  }

  private openMerchantShop(): void {
    (this.scene.get('UIScene') as any)?.toggleMerchantShop(true);
  }

  private openBlacksmithForge(): void {
    (this.scene.get('UIScene') as any)?.toggleBlacksmithForge(true);
  }

  // ==========================================
  // SAVE/LOAD
  // ==========================================

  private async loadSave(): Promise<void> {
    if (this.isNewGame) return;
    const save = await FirebaseService.load();
    if (!save) return;

    if (save.name) this.customPlayerName = save.name;
    this.playerClass = save.playerClass;
    this.combatSystem.setPlayerClass(save.playerClass);
    this.combatSystem.setLevel(save.level);
    this.combatSystem.setXP(save.xp);
    this.combatSystem.setMaxXP(save.maxXp);
    this.combatSystem.setMaxHP(save.maxHp);
    this.combatSystem.setHP(save.hp);
    this.combatSystem.setMaxMP(save.maxMp);
    this.combatSystem.setMP(save.mp);
    this.combatSystem.setGold(save.gold);
    this.combatSystem.setGems(save.gems);
    this.combatSystem.setInventory(save.inventory ?? []);
    this.combatSystem.setEquipped(save.equipped ?? { WEAPON: null, ARMOR: null, HELMET: null, SHIELD: null });
    this.applyClassVisuals();
  }

  private async persistSave(): Promise<void> {
    await FirebaseService.save({
      name: this.customPlayerName,
      playerClass: this.playerClass,
      level: this.combatSystem.getLevel(),
      xp: this.combatSystem.getXP(),
      maxXp: this.combatSystem.getMaxXP(),
      hp: this.combatSystem.getHP(),
      maxHp: this.combatSystem.getMaxHP(),
      mp: this.combatSystem.getMP(),
      maxMp: this.combatSystem.getMaxMP(),
      gold: this.combatSystem.getGold(),
      gems: this.combatSystem.getGems(),
      inventory: this.combatSystem.getInventory(),
      equipped: this.combatSystem.getEquipped(),
    });
    const ui = this.scene.get('UIScene') as any;
    ui?.showSaveIndicator?.();
  }

  // ==========================================
  // ILUMINAÇÃO DINÂMICA (Ciclo Dia/Noite)
  // ==========================================

  private updateEnvironmentLighting(dt: number): void {
    this.gameHour = (this.gameHour + dt * 0.2) % 24;
    this.events.emit('update-game-time', { hour: this.gameHour });

    const h = this.gameHour;
    let r = 255, g = 255, b = 255, intensity = 0;

    if (h >= 6 && h < 11) {
      const t = (h - 6) / 5;
      r = Math.round(Phaser.Math.Linear(0x3b, 0xff, t));
      g = Math.round(Phaser.Math.Linear(0x2d, 0xfa, t));
      b = Math.round(Phaser.Math.Linear(0x54, 0xf0, t));
      intensity = Phaser.Math.Linear(1.0, 0.0, t);
    } else if (h >= 11 && h < 17) {
      intensity = 0;
    } else if (h >= 17 && h < 20) {
      const t = (h - 17) / 3;
      r = Math.round(Phaser.Math.Linear(0xff, 0xfd, t));
      g = Math.round(Phaser.Math.Linear(0xff, 0x5e, t));
      b = Math.round(Phaser.Math.Linear(0xff, 0x53, t));
      intensity = Phaser.Math.Linear(0.0, 1.0, t);
    } else if (h >= 20 || h < 4) {
      r = 0x12; g = 0x12; b = 0x2b; intensity = 1.0;
    } else {
      const t = (h - 4) / 2;
      r = Math.round(Phaser.Math.Linear(0x12, 0x3b, t));
      g = Math.round(Phaser.Math.Linear(0x12, 0x2d, t));
      b = Math.round(Phaser.Math.Linear(0x2b, 0x54, t));
      intensity = 1.0;
    }

    this.lights.setAmbientColor(Phaser.Display.Color.GetColor(r, g, b));
    this.playerLight?.setIntensity(intensity * 1.2);
    this.streetLamps.forEach((lamp) => lamp.setIntensity(intensity * 1.4));
  }
}

import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { CombatSystem } from '../systems/CombatSystem';
import { PetEntity } from '../entities/PetEntity';
import { BossEntity } from '../entities/BossEntity';
import { Monster } from '../entities/Monster';
import { SoundSynth } from '../utils/SoundSynth';

export class DungeonScene extends BaseGameScene {
  private boss!: BossEntity;
  private pet!: PetEntity;
  private dungeonMonsters: Monster[] = [];
  private ambientLight!: Phaser.GameObjects.Light;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  init(data: { playerClass?: PlayerClass, floor?: number }): void {
    if (data.playerClass) {
      this.playerClass = data.playerClass;
    }
    this.currentFloor = data.floor || 1;
  }

  create(): void {
    SoundSynth.playBGM('dungeon');

    this.combatSystem = new CombatSystem(this);
    this.createDungeonMap();
    this.createPlayerCharacter(12 * TILE_SIZE, 24 * TILE_SIZE, true);

    this.pet = new PetEntity(this, this.player.x - 20, this.player.y - 20, 'dragon');
    this.pet.setTarget(this.player);

    this.combatSystem.setPlayerClass(this.playerClass);
    this.applyClassVisuals();
    this.spawnDungeonMonsters();
    this.spawnDungeonBoss();
    this.spawnTreasureChests();
    this.createDungeonAtmosphere();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);

    if (this.cameras.main.postFX) {
      try {
        this.cameras.main.setPostPipeline('UnrealPostFX');
      } catch (err) {
        // Fallback
      }
    }

    this.scene.run('UIScene');
    this.setupBossEventListeners();

    console.log('[DungeonScene] Masmorra dos Templários Esquecidos inicializada');
  }

  private createDungeonMap(): void {
    const mapWidth = 30;
    const mapHeight = 30;

    this.cameras.main.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);
    this.physics.world.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);

    // Fundo HD procedural da masmorra (pedra antiga com lodo)
    const floor = this.add.tileSprite(mapWidth * TILE_SIZE / 2, mapHeight * TILE_SIZE / 2, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE, 'procedural-dungeon');
    floor.setDepth(0);
    floor.setPipeline('Light2D');

    // Bordas de pedra escura (muros da masmorra)
    const wallDeco = this.add.graphics();
    wallDeco.setDepth(2);
    wallDeco.fillStyle(0x0a0610, 0.9);
    wallDeco.fillRect(0, 0, mapWidth * TILE_SIZE, TILE_SIZE * 1.5);
    wallDeco.fillRect(0, (mapHeight - 1.5) * TILE_SIZE, mapWidth * TILE_SIZE, TILE_SIZE * 1.5);
    wallDeco.fillRect(0, 0, TILE_SIZE * 1.5, mapHeight * TILE_SIZE);
    wallDeco.fillRect((mapWidth - 1.5) * TILE_SIZE, 0, TILE_SIZE * 1.5, mapHeight * TILE_SIZE);
    wallDeco.setPipeline('Light2D');

    // Portal de Saída no Sul (visual melhorado)
    const exitGlow = this.add.image(12 * TILE_SIZE, 26 * TILE_SIZE, 'light-warm');
    exitGlow.setScale(1.5).setAlpha(0.5).setBlendMode('ADD').setTint(0x00ffff).setDepth(3);

    const exitPortal = this.add.graphics();
    exitPortal.setPosition(12 * TILE_SIZE, 26 * TILE_SIZE);
    exitPortal.fillStyle(0x00ffff, 0.35);
    exitPortal.fillCircle(0, 0, 28);
    exitPortal.lineStyle(2.5, 0x00ffff, 0.85);
    exitPortal.strokeCircle(0, 0, 28);
    exitPortal.setDepth(4);

    this.tweens.add({ targets: [exitPortal, exitGlow], scaleX: 1.12, scaleY: 1.12, alpha: 0.4, duration: 1200, yoyo: true, repeat: -1 });

    this.add.text(12 * TILE_SIZE, 26 * TILE_SIZE - 36, '🚪 SAÍDA', {
      fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#00ffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    const exitZone = this.add.zone(12 * TILE_SIZE, 26 * TILE_SIZE, 48, 48);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player, exitZone, () => {
      this.scene.start('WorldScene', { playerClass: this.playerClass });
    });
  }

  private currentFloor = 1;

  private spawnDungeonMonsters(): void {
    const numMonsters = 4 + Math.floor(this.currentFloor * 1.5);
    const types = ['SKELETON', 'DEMON_IMP', 'GOBLIN', 'SHADOW_WOLF'];

    for (let i = 0; i < numMonsters; i++) {
      const rx = 4 + Math.random() * 22;
      const ry = 4 + Math.random() * 18;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const m = new Monster(this, rx * TILE_SIZE, ry * TILE_SIZE, type);
      
      // Multiplicador de dificuldade
      m.config.maxHp = Math.floor(m.config.maxHp * (1 + this.currentFloor * 0.4));
      (m as any).hp = m.config.maxHp;
      m.config.damage = Math.floor(m.config.damage * (1 + this.currentFloor * 0.2));
      m.config.goldReward = Math.floor(m.config.goldReward * (1 + this.currentFloor * 0.5));

      m.setTarget(this.player);
      this.dungeonMonsters.push(m);
      this.combatSystem.registerMonster(m);
    }
  }

  private spawnDungeonBoss(): void {
    // Agora todo andar tem um boss para poder dropar a escada.
    const bossNames = ['LORD MALAKOR', ' REI ESQUELETO', 'ARQUEDEMÔNIO', 'TITÃ DAS SOMBRAS'];
    const name = bossNames[(this.currentFloor - 1) % bossNames.length];
    
    this.boss = new BossEntity(this, 12 * TILE_SIZE, 6 * TILE_SIZE);
    
    // Multiplicador de Boss
    this.boss.config.name = name;
    this.boss.config.maxHp = Math.floor(this.boss.config.maxHp * (1 + this.currentFloor * 0.6));
    (this.boss as any).hp = this.boss.config.maxHp;
    this.boss.config.damage = Math.floor(this.boss.config.damage * (1 + this.currentFloor * 0.3));
    
    this.boss.setTarget(this.player);
    this.combatSystem.registerMonster(this.boss as any);
  }

  private spawnTreasureChests(): void {
    const chestLocations = [
      { x: 6 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 18 * TILE_SIZE, y: 8 * TILE_SIZE },
    ];

    chestLocations.forEach((pos) => {
      const chestText = this.add.text(pos.x, pos.y, '🎁', { fontSize: '24px' }).setOrigin(0.5).setDepth(20);
      const zone = this.add.zone(pos.x, pos.y, 40, 40);
      this.physics.add.existing(zone, true);

      let opened = false;
      this.physics.add.overlap(this.player, zone, () => {
        if (opened) return;
        opened = true;

        SoundSynth.playUpgrade();
        chestText.setText('📦');

        this.combatSystem.setGold(this.combatSystem.getGold() + 350);
        this.combatSystem.setGems(this.combatSystem.getGems() + 10);

        this.add.particles(pos.x, pos.y, 'particle-gold', {
          speed: { min: 40, max: 120 },
          angle: { min: 0, max: 360 },
          scale: { start: 1.0, end: 0 },
          lifespan: 600,
          quantity: 20,
          tint: [0xffd700, 0x00ffcc, 0xffffff],
          blendMode: 'ADD',
        });

        (this.scene.get('UIScene') as any)?.showSaveIndicator?.();
        (this.scene.get('UIScene') as any)?.showDialogueBox({
          portrait: 'portrait-master',
          title: 'Tesouro da Cripta!',
          text: 'Você abriu o Baú Lendário dos Templarios! Recompensa: +350 Ouro e +10 Gemas!',
        });
      });
    });
  }

  private createDungeonAtmosphere(): void {
    this.lights.enable();
    this.lights.setAmbientColor(0x1a1528);

    // Tochas nas paredes
    const torchCoords = [
      { x: 6, y: 6 }, { x: 18, y: 6 },
      { x: 6, y: 16 }, { x: 18, y: 16 },
    ];

    torchCoords.forEach(t => {
      const light = this.lights.addLight(t.x * TILE_SIZE, t.y * TILE_SIZE, 140, 0xffaa44, 1.8);
      this.tweens.add({
        targets: light,
        intensity: { from: 1.6, to: 2.1 },
        radius: { from: 135, to: 145 },
        duration: 300 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
      });

      // Fagulhas e fumaça de cada tocha
      this.add.particles(t.x * TILE_SIZE, t.y * TILE_SIZE - 10, 'particle-gold', {
        speedY: { min: -10, max: -30 },
        speedX: { min: -5, max: 5 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 1500,
        frequency: 300,
        tint: [0xffa500, 0xff4500],
        blendMode: 'ADD',
      }).setDepth(15);
    });

    // Luz do jogador
    const playerLight = this.lights.addLight(this.player.x, this.player.y, 160, 0xffffff, 1.5);
    this.events.on('update', () => {
      playerLight.x = this.player.x;
      playerLight.y = this.player.y;
    });

    // Névoa / Partículas de poeira suspensas
    const mapW = this.physics.world.bounds.width;
    const mapH = this.physics.world.bounds.height;
    this.add.particles(0, 0, 'particle-firefly', {
      x: { min: 0, max: mapW }, y: { min: 0, max: mapH },
      lifespan: 6000, speed: { min: 2, max: 8 }, angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0.8 }, alpha: { start: 0.1, end: 0 }, frequency: 200,
      blendMode: 'ADD', tint: 0x44ffaa
    }).setDepth(20);

    // Escuridão pesada (Fog of War) - Vinheta que segue a câmera
    const { width, height } = this.cameras.main;
    const vignette = this.add.image(width / 2, height / 2, 'vignette');
    vignette.setScrollFactor(0).setDisplaySize(width, height).setAlpha(0.85).setDepth(100);
    vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  private setupBossEventListeners(): void {
    this.events.on('boss-damage-player', (damage: number) => {
      this.combatSystem.showFloatingText(this.player.x, this.player.y - 20, `-${Math.floor(damage)}`, '#ff0000');
    });

    this.events.on('boss-defeated', () => {
      SoundSynth.playUpgrade();
      this.combatSystem.showFloatingText(this.player.x, this.player.y - 40, `🏆 ${this.boss.config.name} DERROTADO!`, '#ffd700');
      
      // Dropa recompensas bônus baseadas no andar!
      const gemDrops = 2 + this.currentFloor;
      const compoundDrops = 1 + Math.floor(this.currentFloor / 2);
      this.combatSystem.setGems(this.combatSystem.getGems() + gemDrops);
      
      // Checa se o método setCompounds existe antes de chamar, pois adicionaremos ele depois
      if (typeof (this.combatSystem as any).setCompounds === 'function') {
        (this.combatSystem as any).setCompounds((this.combatSystem as any).getCompounds() + compoundDrops);
      }
      
      this.combatSystem.showFloatingText(this.player.x, this.player.y - 60, `+${gemDrops} Gemas / +${compoundDrops} Compostos!`, '#00ffff');

      // Gera a escada para o próximo andar
      const stairsText = this.add.text(12 * TILE_SIZE, 4 * TILE_SIZE, `🪜 Escada (Andar ${this.currentFloor + 1})`, {
        fontFamily: 'Cinzel', fontSize: '10px', color: '#ffd700', stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(20);

      const stairsZone = this.add.zone(12 * TILE_SIZE, 4 * TILE_SIZE, 40, 40);
      this.physics.add.existing(stairsZone, true);
      
      let transitioning = false;
      this.physics.add.overlap(this.player, stairsZone, () => {
        if (transitioning) return;
        transitioning = true;
        SoundSynth.playUpgrade();
        
        (this.scene.get('UIScene') as any)?.showDialogueBox({
          portrait: 'portrait-master',
          title: 'Masmorra Profunda',
          text: `Você desceu para o Andar ${this.currentFloor + 1}. Os monstros estão mais fortes.`,
        });

        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart({ playerClass: this.playerClass, floor: this.currentFloor + 1 });
        });
      });
    });
  }

  update(time: number): void {
    this.handleMovementInput(time);

    if (this.pet) {
      this.pet.update();
      this.combatSystem.updateLootCollection(this.player.x, this.player.y, this.pet.x, this.pet.y);
    } else {
      this.combatSystem.updateLootCollection(this.player.x, this.player.y);
    }

    if (this.boss && this.boss.active) {
      this.boss.update();
    }

    this.combatSystem.update(time);
    this.sortDepths();
  }
}

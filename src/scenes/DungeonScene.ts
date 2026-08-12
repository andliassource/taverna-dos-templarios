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

  init(data: { playerClass?: PlayerClass }): void {
    if (data.playerClass) {
      this.playerClass = data.playerClass;
    }
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
    this.createDungeonAtmosphere();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);

    this.scene.run('UIScene');
    this.setupBossEventListeners();

    console.log('[DungeonScene] Masmorra dos Templários Esquecidos inicializada');
  }

  private createDungeonMap(): void {
    const mapWidth = 30;
    const mapHeight = 30;

    this.cameras.main.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);
    this.physics.world.setBounds(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);

    // Chão de Pedra Escura
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x120c1f, 1);
    floorGraphics.fillRect(0, 0, mapWidth * TILE_SIZE, mapHeight * TILE_SIZE);
    floorGraphics.setPipeline('Light2D');

    // Grid de ladrilhos de masmorra
    floorGraphics.lineStyle(1, 0x2a1a3a, 0.3);
    for (let x = 0; x < mapWidth * TILE_SIZE; x += TILE_SIZE) {
      floorGraphics.lineBetween(x, 0, x, mapHeight * TILE_SIZE);
    }
    for (let y = 0; y < mapHeight * TILE_SIZE; y += TILE_SIZE) {
      floorGraphics.lineBetween(0, y, mapWidth * TILE_SIZE, y);
    }

    // Portal de Saída no Sul
    const exitPortal = this.add.graphics();
    exitPortal.setPosition(12 * TILE_SIZE, 26 * TILE_SIZE);
    exitPortal.fillStyle(0x00ffff, 0.3);
    exitPortal.fillCircle(0, 0, 24);
    exitPortal.lineStyle(2, 0x00ffff, 0.8);
    exitPortal.strokeCircle(0, 0, 24);

    const exitZone = this.add.zone(12 * TILE_SIZE, 26 * TILE_SIZE, 40, 40);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player, exitZone, () => {
      this.scene.start('WorldScene', { playerClass: this.playerClass });
    });
  }

  private spawnDungeonMonsters(): void {
    const coords = [
      { x: 8, y: 18, type: 'SKELETON' },
      { x: 16, y: 18, type: 'SKELETON' },
      { x: 10, y: 12, type: 'DEMON_IMP' },
      { x: 14, y: 12, type: 'DEMON_IMP' },
    ];

    coords.forEach(c => {
      const m = new Monster(this, c.x * TILE_SIZE, c.y * TILE_SIZE, c.type);
      m.setTarget(this.player);
      this.dungeonMonsters.push(m);
      this.combatSystem.registerMonster(m);
    });
  }

  private spawnDungeonBoss(): void {
    this.boss = new BossEntity(this, 12 * TILE_SIZE, 6 * TILE_SIZE);
    this.boss.setTarget(this.player);
    this.combatSystem.registerMonster(this.boss as any);
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
    });
  }

  private setupBossEventListeners(): void {
    this.events.on('boss-damage-player', (damage: number) => {
      this.combatSystem.showFloatingText(this.player.x, this.player.y - 20, `-${Math.floor(damage)}`, '#ff0000');
    });

    this.events.on('boss-defeated', () => {
      SoundSynth.playUpgrade();
      this.combatSystem.showFloatingText(this.player.x, this.player.y - 40, '🏆 LORD MALAKOR DERROTADO! LOOT LENDÁRIO DROPPADO!', '#ffd700');
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
  }
}

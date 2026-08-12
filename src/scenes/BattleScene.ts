import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { PlayerSceneData, ArenaResult } from '../../shared/types/scene.types';
import { TILE_SIZE } from '../config/game.config';
import { Monster } from '../entities/Monster';
import { CombatSystem } from '../systems/CombatSystem';
import { SoundSynth } from '../utils/SoundSynth';
import { BaseGameScene } from './BaseGameScene';

export class BattleScene extends BaseGameScene {
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private playerData!: PlayerSceneData;
  private currentWaveIndex = 0;
  private activeMonsters: Monster[] = [];

  private readonly waves = [
    [
      { x: 6 * TILE_SIZE, y: 5 * TILE_SIZE, type: 'GOBLIN' },
      { x: 18 * TILE_SIZE, y: 5 * TILE_SIZE, type: 'GOBLIN' },
      { x: 12 * TILE_SIZE, y: 13 * TILE_SIZE, type: 'GOBLIN' },
    ],
    [
      { x: 5 * TILE_SIZE, y: 6 * TILE_SIZE, type: 'SKELETON' },
      { x: 19 * TILE_SIZE, y: 6 * TILE_SIZE, type: 'SKELETON' },
      { x: 12 * TILE_SIZE, y: 4 * TILE_SIZE, type: 'SHADOW_WOLF' },
    ],
    [
      { x: 12 * TILE_SIZE, y: 4 * TILE_SIZE, type: 'DEMON_IMP' },
      { x: 6 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'GOBLIN' },
      { x: 18 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'GOBLIN' },
    ],
  ];

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: PlayerSceneData): void {
    this.playerData = data;
    this.playerClass = data.playerClass ?? PlayerClass.PALADIN;
    this.currentWaveIndex = 0;
    this.activeMonsters = [];
  }

  create(): void {
    SoundSynth.playBGM('arena');
    this.events.emit('scene-change', 'Arena de Combate');

    this.combatSystem = new CombatSystem(this);
    this.combatSystem.setPlayerClass(this.playerClass);
    this.combatSystem.setHP(this.playerData.hp);
    this.combatSystem.setMaxHP(this.playerData.maxHp);
    this.combatSystem.setMP(this.playerData.mp);
    this.combatSystem.setMaxMP(this.playerData.maxMp);
    this.combatSystem.setLevel(this.playerData.level);
    this.combatSystem.setXP(this.playerData.xp);
    this.combatSystem.setMaxXP(this.playerData.maxXp);
    this.combatSystem.setGold(this.playerData.gold);
    this.combatSystem.setGems(this.playerData.gems);

    if (this.playerData.inventory) this.combatSystem.setInventory(this.playerData.inventory);
    if (this.playerData.equipped) this.combatSystem.setEquipped(this.playerData.equipped);

    this.createArenaMap();
    this.createPlayerCharacter(12 * TILE_SIZE, 9 * TILE_SIZE);
    this.applyClassVisuals();
    this.createArenaAtmosphere();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(2.4);
    this.cameras.main.setBackgroundColor('#14051a');

    this.setupControls();

    this.events.on('player-died', () => this.handleDefeat());

    this.cameras.main.fadeIn(800);
    this.time.delayedCall(1000, () => this.startWave(0));
  }

  private createArenaMap(): void {
    const mapWidth = 24;
    const mapHeight = 18;

    const map = this.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: mapWidth, height: mapHeight });
    const tileset = map.addTilesetImage('tileset', 'tileset');
    if (!tileset) return;

    this.groundLayer = map.createBlankLayer('ground', tileset, 0, 0)!;
    this.wallLayer = map.createBlankLayer('walls', tileset, 0, 0)!;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
          this.groundLayer.putTileAt(754, x, y);
          this.wallLayer.putTileAt(115, x, y);
        } else {
          this.groundLayer.putTileAt(114 + ((x + y) % 3), x, y);
        }
      }
    }

    this.wallLayer.setCollisionByExclusion([-1]);
    this.groundLayer.setDepth(0);
    this.wallLayer.setDepth(1);
  }

  private createArenaAtmosphere(): void {
    const { width, height } = this.scale;

    const vignette = this.add.image(width / 2, height / 2, 'vignette');
    vignette.setScrollFactor(0).setDisplaySize(width, height).setAlpha(0.65).setTint(0x8b0000).setDepth(100);

    const corners = [
      { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE },
      { x: 21 * TILE_SIZE, y: 2 * TILE_SIZE },
      { x: 2 * TILE_SIZE, y: 15 * TILE_SIZE },
      { x: 21 * TILE_SIZE, y: 15 * TILE_SIZE },
    ];

    corners.forEach((corner) => {
      const torch = this.add.image(corner.x, corner.y, 'light-warm');
      torch.setScale(1.5).setAlpha(0.5).setBlendMode('ADD').setDepth(15);
      this.tweens.add({ targets: torch, alpha: 0.25, scale: 1.3, duration: 1200 + Math.random() * 400, yoyo: true, repeat: -1 });
    });
  }

  private startWave(index: number): void {
    if (this.combatSystem.getHP() <= 0) return;

    if (index >= this.waves.length) {
      this.handleVictory();
      return;
    }

    this.currentWaveIndex = index;
    this.events.emit('arena-wave-update', { wave: index + 1, maxWaves: this.waves.length });

    this.waves[index].forEach((spawn) => {
      const monster = new Monster(this, spawn.x, spawn.y, spawn.type);
      monster.setTarget(this.player);
      this.activeMonsters.push(monster);
      this.combatSystem.registerMonster(monster);
    });
  }

  private buildArenaResult(won: boolean): ArenaResult {
    return {
      won,
      goldGained: won ? 200 : 0,
      gemsGained: won ? 5 : 0,
      hpPercent: won ? this.combatSystem.getHP() / this.combatSystem.getMaxHP() : 0,
      inventory: this.combatSystem.getInventory(),
      equipped: this.combatSystem.getEquipped(),
    };
  }

  private exitToWorld(result: ArenaResult): void {
    this.scene.stop('BattleScene');
    const worldScene = this.scene.get('WorldScene') as any;
    this.scene.resume('WorldScene');
    worldScene.resumeFromArena(result);
  }

  private handleVictory(): void {
    this.physics.world.disable(this.player);
    this.showResultBanner(
      'DESAFIO CONCLUÍDO!\n\nVitória Absoluta!\n+200 Ouro, +5 Gemas',
      '#ffd700',
      () => this.exitToWorld(this.buildArenaResult(true)),
      3500,
    );
  }

  private handleDefeat(): void {
    this.physics.world.disable(this.player);
    this.showResultBanner(
      'DERROTA!\n\nVocê caiu no desafio...',
      '#ff4444',
      () => this.exitToWorld(this.buildArenaResult(false)),
      3000,
    );
  }

  update(time: number): void {
    this.handleMovementInput(time);
    this.combatSystem.updateLootCollection(this.player.x, this.player.y);
    this.combatSystem.update(time);

    if (this.activeMonsters.length > 0 && this.activeMonsters.every((m) => m.isDead)) {
      this.activeMonsters = [];
      this.time.delayedCall(3000, () => this.startWave(this.currentWaveIndex + 1));
    }
  }
}

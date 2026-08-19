import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { CombatSystem } from '../systems/CombatSystem';
import { PetEntity } from '../entities/PetEntity';
import { BossEntity } from '../entities/BossEntity';
import { Monster } from '../entities/Monster';
import { SoundSynth } from '../utils/SoundSynth';

export class DesertScene extends BaseGameScene {
  private boss!: BossEntity;
  private pet!: PetEntity;
  private desertMonsters: Monster[] = [];

  constructor() {
    super({ key: 'DesertScene' });
  }

  init(data: { playerClass?: PlayerClass }): void {
    if (data.playerClass) {
      this.playerClass = data.playerClass;
    }
  }

  create(): void {
    SoundSynth.playBGM('dungeon');

    this.combatSystem = new CombatSystem(this);
    this.createDesertMap();
    this.createPlayerCharacter(12 * TILE_SIZE, 24 * TILE_SIZE, true);

    this.pet = new PetEntity(this, this.player.x - 20, this.player.y - 20, 'dragon');
    this.pet.setTarget(this.player);

    this.combatSystem.setPlayerClass(this.playerClass);
    this.applyClassVisuals();
    this.spawnDesertMonsters();
    this.spawnMagmaBoss();
    this.createVolcanoAtmosphere();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setBackgroundColor('#2a1208');

    if (this.cameras.main.postFX) {
      try {
        this.cameras.main.setPostPipeline('UnrealPostFX');
      } catch (err) {
        // Fallback
      }
    }

    this.scene.run('UIScene');
    this.createReturnPortal();

    console.log('[DesertScene] Deserto de Fogo & Vulcão de Cristal inicializado');
  }

  private createDesertMap(): void {
    const mapW = 80 * TILE_SIZE;
    const mapH = 60 * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.physics.world.setBounds(0, 0, mapW, mapH);

    // Chão de areia vulcânica
    const ground = this.add.tileSprite(mapW / 2, mapH / 2, mapW, mapH, 'dark-stone-ground');
    ground.setTint(0xffaa66);
    ground.setDepth(0);

    // Ruínas e Cactos decorativos
    for (let i = 0; i < 45; i++) {
      const rx = Phaser.Math.Between(4 * TILE_SIZE, mapW - 4 * TILE_SIZE);
      const ry = Phaser.Math.Between(4 * TILE_SIZE, mapH - 4 * TILE_SIZE);

      const rock = this.add.image(rx, ry, 'bush');
      rock.setTint(0xff7733);
      rock.setScale(1.4);
      rock.setDepth(ry / TILE_SIZE + 1);
    }
  }

  private spawnDesertMonsters(): void {
    const spawnPoints = [
      { x: 18 * TILE_SIZE, y: 15 * TILE_SIZE, preset: 'DEMON_IMP' },
      { x: 30 * TILE_SIZE, y: 25 * TILE_SIZE, preset: 'SHADOW_WOLF' },
      { x: 45 * TILE_SIZE, y: 18 * TILE_SIZE, preset: 'DEMON_IMP' },
      { x: 55 * TILE_SIZE, y: 35 * TILE_SIZE, preset: 'SHADOW_WOLF' },
    ];

    spawnPoints.forEach((pt) => {
      const monster = new Monster(this, pt.x, pt.y, pt.preset);
      this.desertMonsters.push(monster);
      this.combatSystem.registerMonster(monster);
    });
  }

  private spawnMagmaBoss(): void {
    this.boss = new BossEntity(this, 40 * TILE_SIZE, 12 * TILE_SIZE);
    this.combatSystem.registerMonster(this.boss as any);
  }

  private createVolcanoAtmosphere(): void {
    this.lights.enable().setAmbientColor(0xaa5533);
    const lavaLight = this.lights.addLight(40 * TILE_SIZE, 12 * TILE_SIZE, 300, 0xff4400, 2.5);

    this.tweens.add({
      targets: lavaLight,
      intensity: 3.2,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });
  }

  private createReturnPortal(): void {
    const portal = this.add.circle(12 * TILE_SIZE, 24 * TILE_SIZE, 24, 0xff4400, 0.7);
    portal.setDepth(5);

    this.tweens.add({
      targets: portal,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    const portalZone = this.add.zone(12 * TILE_SIZE, 24 * TILE_SIZE, 40, 40);
    this.physics.add.existing(portalZone, true);

    let transitioning = false;
    this.physics.add.overlap(this.player, portalZone, () => {
      if (transitioning) return;
      transitioning = true;
      SoundSynth.playUpgrade();

      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('WorldScene', { playerClass: this.playerClass });
      });
    });
  }

  update(time: number): void {
    this.handleMovementInput(time);

    if (this.pet) {
      this.pet.update();
      this.combatSystem.updateLootCollection(this.player.x, this.player.y, this.pet.x, this.pet.y);
    }

    if (this.boss && this.boss.active) {
      this.boss.update();
    }

    this.combatSystem.update(time);
    this.sortDepths();
  }
}

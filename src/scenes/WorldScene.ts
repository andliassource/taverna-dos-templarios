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

export class WorldScene extends BaseGameScene {
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private masterAldric!: Phaser.GameObjects.Container;
  private blacksmithBjorn!: Phaser.GameObjects.Container;
  private merchantElise!: Phaser.GameObjects.Container;
  private interactionText!: Phaser.GameObjects.Text;
  private isNearAldric = false;
  private isNearMerchant = false;
  private isNearBlacksmith = false;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private pet!: PetEntity;

  private gameHour = 12.0;
  private playerLight!: Phaser.GameObjects.Light;
  private streetLamps: Phaser.GameObjects.Light[] = [];

  constructor() {
    super({ key: 'WorldScene' });
  }

  private saveTimer = 0;
  private readonly AUTOSAVE_INTERVAL = 30_000; // 30s

  init(data: { playerClass?: PlayerClass; fromSave?: boolean }): void {
    if (data.playerClass) this.playerClass = data.playerClass;
  }

  create(): void {
    SoundSynth.playBGM('village');

    this.combatSystem = new CombatSystem(this);
    this.createWorldMap();
    this.createTavernBuilding();
    this.createWorldNPCs();
    this.createPlayerCharacter(25 * TILE_SIZE, 24 * TILE_SIZE, true);
    this.pet = new PetEntity(this, this.player.x - 24, this.player.y - 24, 'dragon');
    this.pet.setTarget(this.player);
    this.createDecorations(50, 40);
    this.combatSystem.setPlayerClass(this.playerClass);
    this.applyClassVisuals();
    this.spawnMonsters();
    this.createDungeonPortal();
    this.createFishingSpot();
    this.createAtmosphere();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(2.4);
    this.cameras.main.setBackgroundColor('#0d1a0d');

    this.setupControls();

    if (this.input.keyboard) {
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    const { width, height } = this.scale;
    this.interactionText = this.add.text(width / 2, height - 120, '', {
      fontFamily: 'Cinzel',
      fontSize: '13px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: 'rgba(10, 6, 18, 0.85)',
      padding: { x: 12, y: 8 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.cameras.main.fadeIn(800);
    this.loadSave();

    this.events.on('request-save', () => this.persistSave());
  }

  private async loadSave(): Promise<void> {
    const save = await FirebaseService.load();
    if (!save) return;

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

  private createWorldMap(): void {
    const mapWidth = 50;
    const mapHeight = 40;

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
          continue;
        }
        if (x >= 23 && x <= 27) {
          this.groundLayer.putTileAt(114 + ((x + y) % 3), x, y);
          continue;
        }
        if (y >= 21 && y <= 23 && (x < 20 || x > 30)) {
          this.groundLayer.putTileAt(114 + ((x + y) % 3), x, y);
          continue;
        }
        if (x >= 36 && x <= 44 && y >= 27 && y <= 35) {
          const dx = x - 40, dy = y - 31;
          if (dx * dx + dy * dy < 20) { this.groundLayer.putTileAt(706, x, y); continue; }
        }
        if ((x >= 21 && x <= 29) || (y >= 19 && y <= 25)) {
          this.groundLayer.putTileAt(754 + ((x + y) % 3), x, y);
          continue;
        }
        this.groundLayer.putTileAt(66 + ((x * 3 + y * 7) % 4), x, y);
      }
    }

    this.wallLayer.setCollisionByExclusion([-1]);
    this.groundLayer.setDepth(0);
    this.wallLayer.setDepth(1);
    this.groundLayer.setPipeline('Light2D');
    this.wallLayer.setPipeline('Light2D');
  }

  private createTavernBuilding(): void {
    const tavernX = 25 * TILE_SIZE;
    const tavernY = 12 * TILE_SIZE;

    const tavern = this.add.image(tavernX, tavernY, 'tavern-building');
    tavern.setScale(0.45).setDepth(12 * TILE_SIZE / TILE_SIZE + 5).setPipeline('Light2D');

    const startTileX = 21, startTileY = 10;
    const buildingWidth = 8, buildingHeight = 6;

    for (let dy = 0; dy < buildingHeight; dy++) {
      for (let dx = 0; dx < buildingWidth; dx++) {
        if (dy === buildingHeight - 1 && (dx === 3 || dx === 4)) continue;
        this.wallLayer.putTileAt(10, startTileX + dx, startTileY + dy);
      }
    }
  }

  private createWorldNPCs(): void {
    this.blacksmithBjorn = this.createNPC(31 * TILE_SIZE, 16 * TILE_SIZE, 'blacksmith', 'Ferreiro Bjorn', '🔨');
    this.merchantElise = this.createNPC(19 * TILE_SIZE, 16 * TILE_SIZE, 'merchant', 'Mercadora Elise', '🛒');
    this.masterAldric = this.createNPC(25 * TILE_SIZE, 18 * TILE_SIZE, 'master', 'Mestre Aldric', '📜');
  }

  private createNPC(x: number, y: number, frameKey: string, name: string, icon: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setDepth(y / TILE_SIZE + 2);

    const npcSprite = this.add.sprite(0, 0, `npc-${frameKey}`, 0);
    npcSprite.setScale(2.0).setOrigin(0.5, 0.85).setPipeline('Light2D');

    const shadow = this.add.ellipse(0, 6, 20, 8, 0x000000, 0.35);
    const glow = this.add.graphics();
    glow.fillStyle(0xffd700, 0.08);
    glow.fillCircle(0, -10, 24);

    const nameText = this.add.text(0, 16, name, {
      fontFamily: 'MedievalSharp', fontSize: '10px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    const iconText = this.add.text(0, -38, icon, { fontSize: '14px' }).setOrigin(0.5);

    container.add([shadow, glow, npcSprite, nameText, iconText]);

    this.tweens.add({ targets: iconText, y: -44, duration: 1200, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    this.tweens.add({ targets: npcSprite, scaleY: 2.05, duration: 1800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    return container;
  }

  private createAtmosphere(): void {
    const mapW = 50 * TILE_SIZE;
    const mapH = 40 * TILE_SIZE;

    this.lights.enable();
    this.lights.setAmbientColor(0xffffff);

    this.playerLight = this.lights.addLight(this.player.x, this.player.y, 90, 0xffd700, 1.2);

    const lampPositions = [
      { x: 18 * TILE_SIZE, y: 16 * TILE_SIZE },
      { x: 32 * TILE_SIZE, y: 16 * TILE_SIZE },
      { x: 25 * TILE_SIZE, y: 26 * TILE_SIZE },
      { x: 26 * TILE_SIZE, y: 18 * TILE_SIZE },
    ];

    lampPositions.forEach((pos) => {
      const lamp = this.lights.addLight(pos.x, pos.y, 80, 0xffbb55, 1.4);
      this.streetLamps.push(lamp);

      const glow = this.add.graphics();
      glow.fillStyle(0xffe6a3, 0.7);
      glow.fillCircle(pos.x, pos.y, 3);
      glow.fillStyle(0xffa500, 0.3);
      glow.fillCircle(pos.x, pos.y, 8);
      glow.setDepth(pos.y / TILE_SIZE + 3);
    });

    const tavernLight = this.add.image(25 * TILE_SIZE, 14 * TILE_SIZE, 'light-warm');
    tavernLight.setScale(3.5).setAlpha(0.45).setBlendMode('ADD').setDepth(15);
    this.tweens.add({ targets: tavernLight, alpha: 0.3, scaleX: 3.3, scaleY: 3.3, duration: 2500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    this.add.particles(0, 0, 'particle-leaf', {
      x: { min: 0, max: mapW }, y: { min: 0, max: mapH },
      lifespan: 7000, speed: { min: 10, max: 30 }, angle: { min: 190, max: 250 },
      scale: { start: 0.8, end: 0.3 }, alpha: { start: 0.7, end: 0 }, frequency: 400,
    }).setDepth(30);

    this.add.particles(40 * TILE_SIZE, 31 * TILE_SIZE, 'particle-firefly', {
      x: { min: -150, max: 150 }, y: { min: -100, max: 100 },
      lifespan: 4000, speed: { min: 5, max: 20 }, angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 1.2, ease: 'Sine.easeInOut' },
      alpha: { start: 0, end: 0.9, ease: 'Sine.easeInOut' },
      frequency: 500, blendMode: 'ADD',
    }).setDepth(30);

    const { width, height } = this.cameras.main;
    const vignette = this.add.image(
      this.cameras.main.scrollX + width / 2,
      this.cameras.main.scrollY + height / 2,
      'vignette',
    );
    vignette.setScrollFactor(0).setDisplaySize(width, height).setAlpha(0.4).setDepth(100);
  }

  private spawnMonsters(): void {
    const spawns = [
      { x: 10 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'GOBLIN' },
      { x: 14 * TILE_SIZE, y: 15 * TILE_SIZE, type: 'GOBLIN' },
      { x: 8 * TILE_SIZE, y: 28 * TILE_SIZE, type: 'SKELETON' },
      { x: 12 * TILE_SIZE, y: 32 * TILE_SIZE, type: 'SKELETON' },
      { x: 38 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'SHADOW_WOLF' },
      { x: 42 * TILE_SIZE, y: 16 * TILE_SIZE, type: 'SHADOW_WOLF' },
      { x: 38 * TILE_SIZE, y: 34 * TILE_SIZE, type: 'DEMON_IMP' },
    ];

    spawns.forEach(({ x, y, type }) => {
      const monster = new Monster(this, x, y, type);
      monster.setTarget(this.player);
      this.combatSystem.registerMonster(monster);
    });
  }

  private createDungeonPortal(): void {
    const px = 25 * TILE_SIZE;
    const py = 8 * TILE_SIZE;

    // Efeito místico no mapa
    const portal = this.add.graphics();
    portal.setPosition(px, py);
    portal.fillStyle(0x8a2be2, 0.4);
    portal.fillCircle(0, 0, 32);
    portal.lineStyle(2.5, 0xff00ff, 0.9);
    portal.strokeCircle(0, 0, 32);
    portal.setDepth(15);

    this.tweens.add({
      targets: portal,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(px, py - 42, '🚪 MASMORRA DOS ESQUECIDOS\n[Entrar]', {
      fontFamily: 'Cinzel',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ff00ff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(20);

    const zone = this.add.zone(px, py, 50, 50);
    this.physics.add.existing(zone, true);

    this.physics.add.overlap(this.player, zone, () => {
      this.scene.start('DungeonScene', { playerClass: this.playerClass });
    });
  }

  private createFishingSpot(): void {
    const fx = 40 * TILE_SIZE;
    const fy = 31 * TILE_SIZE;

    const pier = this.add.graphics();
    pier.fillStyle(0x5c4033, 0.9);
    pier.fillRect(fx - 16, fy - 8, 32, 24);
    pier.setDepth(14);

    this.add.text(fx, fy - 24, '🎣 PÍER DA LAGOA\n[Pressione ENTER para Pescar]', {
      fontFamily: 'Cinzel',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(20);

    const fishingZone = this.add.zone(fx, fy, 48, 48);
    this.physics.add.existing(fishingZone, true);

    this.physics.add.overlap(this.player, fishingZone, () => {
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        (this.scene.get('UIScene') as any)?.startFishingMinigame();
      }
    });
  }

  private createDecorations(mapWidth: number, mapHeight: number): void {
    for (let y = 2; y < mapHeight - 2; y++) {
      for (let x = 2; x < mapWidth - 2; x++) {
        if (x >= 21 && x <= 29) continue;
        if (y >= 19 && y <= 25) continue;
        if (x >= 35 && x <= 45 && y >= 25 && y <= 36) continue;

        const rand = Phaser.Math.Between(0, 100);
        if (rand < 7) {
          const tree = this.physics.add.staticSprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'deco-tree');
          tree.setScale(2.0).setOrigin(0.5, 0.8).setDepth(y + 2).setPipeline('Light2D');
          (tree.body as Phaser.Physics.Arcade.StaticBody).setSize(14, 10).setOffset(1, 14);
          this.physics.add.collider(this.player, tree);
        } else if (rand < 14) {
          this.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'deco-bush')
            .setScale(2.0).setDepth(y + 1).setPipeline('Light2D');
        } else if (rand < 22) {
          this.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'deco-flower')
            .setScale(1.5).setDepth(y).setPipeline('Light2D');
        }
      }
    }
  }

  private checkNPCProximity(
    npc: Phaser.GameObjects.Container,
    isNear: boolean,
    promptText: string,
    onInteract: () => void,
    setNear: (v: boolean) => void,
  ): boolean {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
    if (dist < 48) {
      if (!isNear) {
        setNear(true);
        this.interactionText.setText(promptText).setVisible(true);
      }
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        onInteract();
        return true;
      }
    } else if (isNear) {
      setNear(false);
      this.interactionText.setVisible(false);
    }
    return false;
  }

  update(time: number): void {
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
    if (this.pet) {
      this.pet.update();
      this.combatSystem.updateLootCollection(this.player.x, this.player.y, this.pet.x, this.pet.y);
    } else {
      this.combatSystem.updateLootCollection(this.player.x, this.player.y);
    }
    this.combatSystem.update(time);

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
    this.physics.world.enable(this.player);

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

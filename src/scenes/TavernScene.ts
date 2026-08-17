import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { CombatSystem } from '../systems/CombatSystem';
import { SoundSynth } from '../utils/SoundSynth';
import { PetEntity } from '../entities/PetEntity';

export class TavernScene extends BaseGameScene {
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private masterAldric!: Phaser.GameObjects.Container;
  private tavernKeeper!: Phaser.GameObjects.Container;
  private questBoard!: Phaser.GameObjects.Container;
  private interactionText!: Phaser.GameObjects.Text;

  private isNearAldric = false;
  private isNearKeeper = false;
  private isNearQuestBoard = false;
  private isNearExit = false;

  private enterKey!: Phaser.Input.Keyboard.Key;
  private pet!: PetEntity;
  private fireLight!: Phaser.GameObjects.Light;

  constructor() {
    super({ key: 'TavernScene' });
  }

  init(data: { playerClass?: PlayerClass }): void {
    if (data.playerClass) this.playerClass = data.playerClass;
  }

  create(): void {
    SoundSynth.playBGM('village');

    this.combatSystem = new CombatSystem(this);
    this.combatSystem.setPlayerClass(this.playerClass);

    this.createTavernMap();
    
    // Player spawns at bottom center door
    this.createPlayerCharacter(8 * TILE_SIZE, 9.5 * TILE_SIZE, true);

    this.createDecorations();
    this.createNPCs();

    this.pet = new PetEntity(this, this.player.x - 20, this.player.y - 20, 'dragon');
    this.pet.setTarget(this.player);

    this.applyClassVisuals();
    this.setupAtmosphere();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1.8);
    this.cameras.main.setBackgroundColor('#05020a');
    this.cameras.main.setBounds(0, 0, 16 * TILE_SIZE, 12 * TILE_SIZE);

    this.setupControls();

    if (this.input.keyboard) {
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    const { width, height } = this.scale;
    this.interactionText = this.add.text(width / 2, height - 24, '', {
      fontFamily: 'MedievalSharp',
      fontSize: '11px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: 'rgba(10, 6, 18, 0.85)',
      padding: { x: 8, y: 4 },
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.cameras.main.fadeIn(400);
    this.events.emit('scene-change', 'Taverna dos Templários (Interior)');
  }

  private createTavernMap(): void {
    const mapW = 16;
    const mapH = 12;

    // Fundo HD da taverna (interior pintado)
    const interior = this.add.tileSprite(mapW * TILE_SIZE / 2, mapH * TILE_SIZE / 2, mapW * TILE_SIZE, mapH * TILE_SIZE, 'procedural-tavern');
    interior.setDepth(0);
    interior.setPipeline('Light2D');

    // Muros de colisão invisíveis nas bordas
    const wallGroup = this.physics.add.staticGroup();

    // Bordas (exceto porta)
    const createWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.rectangle(x, y, w, h, 0, 0);
      wallGroup.add(wall);
    };

    // Topo
    createWall(mapW * TILE_SIZE / 2, 0, mapW * TILE_SIZE, TILE_SIZE);
    // Esquerda
    createWall(0, mapH * TILE_SIZE / 2, TILE_SIZE, mapH * TILE_SIZE);
    // Direita
    createWall(mapW * TILE_SIZE, mapH * TILE_SIZE / 2, TILE_SIZE, mapH * TILE_SIZE);
    // Baixo (com abertura para a porta)
    createWall(3 * TILE_SIZE, mapH * TILE_SIZE, 6 * TILE_SIZE, TILE_SIZE);
    createWall(12 * TILE_SIZE, mapH * TILE_SIZE, 6 * TILE_SIZE, TILE_SIZE);

    // Borda decorativa nas paredes (graphics visíveis)
    const wallDeco = this.add.graphics();
    wallDeco.setDepth(1);
    wallDeco.fillStyle(0x2a1a0a, 0.7);
    wallDeco.fillRect(0, 0, mapW * TILE_SIZE, TILE_SIZE * 0.5);
    wallDeco.fillRect(0, 0, TILE_SIZE * 0.5, mapH * TILE_SIZE);
    wallDeco.fillRect(mapW * TILE_SIZE - TILE_SIZE * 0.5, 0, TILE_SIZE * 0.5, mapH * TILE_SIZE);
    wallDeco.setPipeline('Light2D');

    // Guardar referência para colisão do player
    this.wallLayer = null as any; // Sem tilemap
    // Usamos um grupo estático de colisão em vez do wallLayer
    this.events.once('player-created', () => {
      this.physics.add.collider(this.player, wallGroup);
    });
  }

  private createDecorations(): void {
    // Fireplace at top center
    const fireplace = this.add.graphics();
    fireplace.fillStyle(0x3a1e05, 1);
    fireplace.fillRect(7 * TILE_SIZE - 8, 1 * TILE_SIZE, 48, 24);
    fireplace.lineStyle(2, 0xd4a843, 0.8);
    fireplace.strokeRect(7 * TILE_SIZE - 8, 1 * TILE_SIZE, 48, 24);
    fireplace.setDepth(2);

    // Flame particles in fireplace
    this.add.particles(7 * TILE_SIZE + 16, 1 * TILE_SIZE + 16, 'particle-gold', {
      speedY: { min: -25, max: -45 },
      speedX: { min: -15, max: 15 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 3,
      frequency: 100,
      blendMode: 'ADD',
      tint: [0xff4400, 0xffbb00, 0xffff00],
    }).setDepth(5);
    
    // Fagulhas e cinzas esvoaçantes
    this.add.particles(7 * TILE_SIZE + 16, 1 * TILE_SIZE + 16, 'particle-firefly', {
      speedY: { min: -10, max: -40 },
      speedX: { min: -25, max: 25 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1200,
      quantity: 1,
      frequency: 300,
      blendMode: 'ADD',
      tint: [0xff3300, 0xff8800],
    }).setDepth(6);

    // Counter Bar
    const counter = this.physics.add.staticSprite(12 * TILE_SIZE, 4 * TILE_SIZE, 'tavern-counter');
    counter.setDisplaySize(96, 32).setDepth(4);
    (counter.body as Phaser.Physics.Arcade.StaticBody).setSize(96, 32);
    this.physics.add.collider(this.player, counter);

    // Tables and Benches
    const tablePositions = [
      { x: 4 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 4 * TILE_SIZE, y: 8 * TILE_SIZE },
      { x: 12 * TILE_SIZE, y: 8 * TILE_SIZE },
    ];

    tablePositions.forEach((pos) => {
      const table = this.physics.add.staticSprite(pos.x, pos.y, 'tavern-table');
      table.setDisplaySize(48, 36).setDepth(pos.y / TILE_SIZE + 2);
      (table.body as Phaser.Physics.Arcade.StaticBody).setSize(40, 24);
      this.physics.add.collider(this.player, table);

      // Vela Aconchegante na Mesa da Taverna
      const candle = this.add.text(pos.x, pos.y - 8, '🕯️', { fontSize: '12px' }).setOrigin(0.5).setDepth(pos.y / TILE_SIZE + 3);
      const candleGlow = this.add.graphics();
      candleGlow.fillStyle(0xffaa44, 0.25);
      candleGlow.fillCircle(pos.x, pos.y - 8, 16);
      candleGlow.setDepth(pos.y / TILE_SIZE + 2);

      this.tweens.add({
        targets: candleGlow,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: 0.15,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private createNPCs(): void {
    // Taverneiro behind counter
    this.tavernKeeper = this.createNPC(12 * TILE_SIZE, 3 * TILE_SIZE, 'merchant', 'Taverneiro Garin', '🍺');
    
    // Mestre Aldric near fireplace
    this.masterAldric = this.createNPC(5.5 * TILE_SIZE, 3 * TILE_SIZE, 'master', 'Mestre Aldric', '📜');

    // Quadro de Missões em Ferro Escurecido e Filigrana de Ouro
    this.questBoard = this.add.container(2 * TILE_SIZE, 2 * TILE_SIZE);
    this.questBoard.setDepth(3);
    const boardGfx = this.add.graphics();
    boardGfx.fillStyle(0x0e0818, 0.95);
    boardGfx.fillRoundedRect(-18, -22, 36, 44, 6);
    boardGfx.lineStyle(2, 0xd4af37, 0.95);
    boardGfx.strokeRoundedRect(-18, -22, 36, 44, 6);
    boardGfx.lineStyle(1, 0x5a3e10, 0.7);
    boardGfx.strokeRoundedRect(-16, -20, 32, 40, 4);

    const qbCorners = [
      [-15, -19], [15, -19], [-15, 19], [15, 19]
    ];
    qbCorners.forEach(([cx, cy]) => {
      boardGfx.fillStyle(0xffd700, 1);
      boardGfx.fillCircle(cx, cy, 1.5);
    });

    const boardIcon = this.add.text(0, -2, '📋', { fontSize: '18px' }).setOrigin(0.5);
    const boardTitle = this.add.text(0, -28, 'MISSÕES', {
      fontFamily: 'Cinzel', fontSize: '9px', fontStyle: 'bold', color: '#ffd700', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.questBoard.add([boardGfx, boardIcon, boardTitle]);
  }

  private createNPC(x: number, y: number, frameKey: string, name: string, icon: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setDepth(y / TILE_SIZE + 2);

    const npcSprite = this.add.sprite(0, 0, `npc-${frameKey}`, 0);
    npcSprite.setScale(1.2).setOrigin(0.5, 0.85).setPipeline('Light2D');

    const shadow = this.add.ellipse(0, 6, 24, 9, 0x000000, 0.4);

    const nameText = this.add.text(0, -44, name, {
      fontFamily: 'MedievalSharp', fontSize: '11px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.65)', padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    const iconText = this.add.text(0, -58, icon, { fontSize: '16px' }).setOrigin(0.5);

    container.add([shadow, npcSprite, nameText, iconText]);

    this.tweens.add({ targets: iconText, y: -62, duration: 1200, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    this.tweens.add({ targets: npcSprite, scaleY: 1.25, duration: 1600, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    return container;
  }

  private setupAtmosphere(): void {
    this.lights.enable();
    this.lights.setAmbientColor(0x3a2518);

    // Warm fireplace glow
    this.fireLight = this.lights.addLight(7.5 * TILE_SIZE, 2 * TILE_SIZE, 140, 0xff8822, 1.8);
    
    this.tweens.add({
      targets: this.fireLight,
      intensity: 2.1,
      radius: 155,
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Warm lamps around interior
    this.lights.addLight(3 * TILE_SIZE, 6 * TILE_SIZE, 90, 0xffbb44, 1.2);
    this.lights.addLight(13 * TILE_SIZE, 6 * TILE_SIZE, 90, 0xffbb44, 1.2);
  }

  update(time: number): void {
    this.handleMovementInput(time);

    if (this.pet) {
      this.pet.update();
    }

    // Check interaction proximities
    const distExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, 7.5 * TILE_SIZE, 11 * TILE_SIZE);
    if (distExit < 36) {
      if (!this.isNearExit) {
        this.isNearExit = true;
        this.interactionText.setText('🚪 Sair para a Vila\n[Pressione ESPAÇO ou ENTER]').setVisible(true);
      }
      if ((this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.exitTavern();
        return;
      }
    } else if (this.isNearExit) {
      this.isNearExit = false;
      this.interactionText.setVisible(false);
    }

    // Check Aldric
    const distAldric = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.masterAldric.x, this.masterAldric.y);
    if (distAldric < 44) {
      if (!this.isNearAldric) {
        this.isNearAldric = true;
        this.interactionText.setText('Mestre Aldric: "Pronto para a Arena?"\n[Pressione ENTER]').setVisible(true);
      }
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.openAldricDialogue();
        return;
      }
    } else if (this.isNearAldric) {
      this.isNearAldric = false;
      this.interactionText.setVisible(false);
    }

    // Check Taverneiro
    const distKeeper = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.tavernKeeper.x, this.tavernKeeper.y);
    if (distKeeper < 44) {
      if (!this.isNearKeeper) {
        this.isNearKeeper = true;
        this.interactionText.setText('Taverneiro Garin: "Descansar & Recuperar HP?"\n[Pressione ENTER]').setVisible(true);
      }
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.openKeeperDialogue();
        return;
      }
    } else if (this.isNearKeeper) {
      this.isNearKeeper = false;
      this.interactionText.setVisible(false);
    }

    // Check Quest Board
    const distBoard = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.questBoard.x, this.questBoard.y);
    if (distBoard < 44) {
      if (!this.isNearQuestBoard) {
        this.isNearQuestBoard = true;
        this.interactionText.setText('📜 Quadro de Missões\n[Pressione ENTER]').setVisible(true);
      }
      if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        (this.scene.get('UIScene') as any)?.toggleQuestBoard(true);
        return;
      }
    } else if (this.isNearQuestBoard) {
      this.isNearQuestBoard = false;
      this.interactionText.setVisible(false);
    }
  }

  private exitTavern(): void {
    this.interactionText.setVisible(false);
    this.physics.world.disable(this.player);

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { playerClass: this.playerClass, fromTavern: true });
    });
  }

  private openAldricDialogue(): void {
    this.events.emit('show-dialogue', {
      portrait: 'portrait-master',
      title: 'Mestre Aldric',
      text: 'Bem-vindo à Taverna dos Templários! A Arena de Batalha exige coragem. Deseja provar seu valor?',
      hasConfirm: true,
      onConfirm: () => {
        this.scene.start('BattleScene', { playerClass: this.playerClass });
      },
    });
  }

  private openKeeperDialogue(): void {
    this.events.emit('show-dialogue', {
      portrait: 'portrait-merchant',
      title: 'Taverneiro Garin',
      text: 'Um hidromel quentinho restaura a alma! Deseja descansar e recuperar 100% da sua Vida e Mana por 20 moedas?',
      hasConfirm: true,
      onConfirm: () => {
        if (this.combatSystem.getGold() >= 20) {
          this.combatSystem.setGold(this.combatSystem.getGold() - 20);
          this.combatSystem.setHP(this.combatSystem.getMaxHP());
          this.combatSystem.setMP(this.combatSystem.getMaxMP());
          SoundSynth.playLoot();
          this.combatSystem.showFloatingText(this.player.x, this.player.y - 20, 'HP & MP Restaurados!', '#00ffaa');
        } else {
          this.combatSystem.showFloatingText(this.player.x, this.player.y - 20, 'Ouro Insuficiente!', '#ff4444');
        }
      },
    });
  }
}

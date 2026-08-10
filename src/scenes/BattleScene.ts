import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { Monster } from '../entities/Monster';
import { CombatSystem } from '../systems/CombatSystem';

/**
 * BattleScene — Arena de combate instanciada (Desafio dos Templários).
 * Apresenta 3 ondas progressivas de monstros com recompensas reais de fim de desafio.
 */
export class BattleScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isMoving = false;
  private targetX = 0;
  private targetY = 0;
  private currentDirection = 'down';
  private map!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private wallLayer!: Phaser.Tilemaps.TilemapLayer;
  private playerClass: PlayerClass = PlayerClass.PALADIN;
  private combatSystem!: CombatSystem;

  private playerData: any;
  private currentWaveIndex = 0;
  private activeMonsters: Monster[] = [];

  // Configurações de ondas de spawn
  private waves = [
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
      { x: 12 * TILE_SIZE, y: 4 * TILE_SIZE, type: 'DEMON_IMP' }, // Boss
      { x: 6 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'GOBLIN' },
      { x: 18 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'GOBLIN' },
    ]
  ];

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: any): void {
    this.playerData = data;
    this.playerClass = data.playerClass || PlayerClass.PALADIN;
    this.currentWaveIndex = 0;
    this.activeMonsters = [];
  }

  create(): void {
    // Comunica alteração de mapa para a UIScene
    this.events.emit('scene-change', 'Arena de Combate');

    // Inicializa o sistema de combate
    this.combatSystem = new CombatSystem(this);

    // Carrega status importados do jogador
    this.combatSystem.setHP(this.playerData.hp);
    this.combatSystem.setMaxHP(this.playerData.maxHp);
    this.combatSystem.setMP(this.playerData.mp);
    this.combatSystem.setMaxMP(this.playerData.maxMp);
    this.combatSystem.setLevel(this.playerData.level);
    this.combatSystem.setXP(this.playerData.xp);
    this.combatSystem.setMaxXP(this.playerData.maxXp);
    this.combatSystem.setGold(this.playerData.gold);
    this.combatSystem.setGems(this.playerData.gems);

    // Constrói mapa da arena
    this.createArenaMap();

    // Instancia o jogador no centro
    this.createPlayerCharacter();

    // Configura os efeitos visuais e iluminação da arena
    this.createArenaAtmosphere();

    // Câmera do jogo
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1.8);
    this.cameras.main.setBackgroundColor('#14051a');

    // Controles WASD / Setas / Espaço
    this.setupControls();

    // Escuta evento de morte do jogador
    this.events.on('player-died', () => {
      this.handleDefeat();
    });

    // Inicia a transição de entrada e spawna a primeira onda
    this.cameras.main.fadeIn(800);
    this.time.delayedCall(1000, () => {
      this.startWave(0);
    });

    console.log('[BattleScene] Arena de combate carregada com sucesso');
  }

  private createArenaMap(): void {
    const mapWidth = 24;
    const mapHeight = 18;

    this.map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: mapWidth,
      height: mapHeight,
    });

    const tileset = this.map.addTilesetImage('tileset', 'tileset');
    if (!tileset) return;

    this.groundLayer = this.map.createBlankLayer('ground', tileset, 0, 0)!;
    this.wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0)!;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        // Limites externos da arena (paredes impenetráveis)
        if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
          this.groundLayer.putTileAt(754, x, y);
          this.wallLayer.putTileAt(115, x, y); // Parede de pedra
          continue;
        }

        // Chão de pedra decorado da arena
        const stoneTile = 114 + ((x + y) % 3);
        this.groundLayer.putTileAt(stoneTile, x, y);
      }
    }

    this.wallLayer.setCollisionByExclusion([-1]);
    this.groundLayer.setDepth(0);
    this.wallLayer.setDepth(1);
  }

  private createPlayerCharacter(): void {
    const startX = 12 * TILE_SIZE;
    const startY = 9 * TILE_SIZE;

    this.player = this.add.sprite(startX, startY, 'player-sheet', 0);
    this.player.setDepth(25);
    this.player.setScale(0.45);
    this.player.setOrigin(0.5, 0.85);

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(TILE_SIZE * 0.6, TILE_SIZE * 0.4);
    body.setOffset(TILE_SIZE * 0.2, TILE_SIZE * 0.6);
    body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.wallLayer);

    this.targetX = startX;
    this.targetY = startY;

    // Sombra do jogador
    const shadow = this.add.ellipse(0, 8, 22, 9, 0x000000, 0.4);
    shadow.setDepth(24);

    // Tag com nome flutuante
    const nameTag = this.add.text(0, -32, 'Templário', {
      fontFamily: 'MedievalSharp',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Sincroniza sombra e tag com a posição do jogador
    this.events.on('postupdate', () => {
      shadow.setPosition(this.player.x, this.player.y + 4);
      nameTag.setPosition(this.player.x, this.player.y - 34);
      nameTag.setDepth(this.player.depth + 1);
      this.player.setDepth(this.player.y / TILE_SIZE + 2);
    });
  }

  private createArenaAtmosphere(): void {
    const { width, height } = this.scale;

    // Vinheta vermelha de combate nas bordas
    const vignette = this.add.image(width / 2, height / 2, 'vignette');
    vignette.setScrollFactor(0);
    vignette.setDisplaySize(width, height);
    vignette.setAlpha(0.65);
    vignette.setTint(0x8b0000); // Vermelho escuro sangrento
    vignette.setDepth(100);

    // Efeito de fogo fraco vindo de tochas nos quatro cantos da arena
    const corners = [
      { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE },
      { x: 21 * TILE_SIZE, y: 2 * TILE_SIZE },
      { x: 2 * TILE_SIZE, y: 15 * TILE_SIZE },
      { x: 21 * TILE_SIZE, y: 15 * TILE_SIZE },
    ];

    corners.forEach((corner) => {
      const torch = this.add.image(corner.x, corner.y, 'light-warm');
      torch.setScale(1.5);
      torch.setAlpha(0.5);
      torch.setBlendMode('ADD');
      torch.setDepth(15);

      this.tweens.add({
        targets: torch,
        alpha: 0.25,
        scale: 1.3,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private setupControls(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.wasd = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Clique do mouse dispara ataque
    this.input.on('pointerdown', () => {
      if (this.combatSystem.getHP() > 0) {
        this.combatSystem.performMeleeAttack(this.player, this.currentDirection, this.time.now);
      }
    });
  }

  private startWave(index: number): void {
    if (this.combatSystem.getHP() <= 0) return;

    if (index >= this.waves.length) {
      this.handleVictory();
      return;
    }

    this.currentWaveIndex = index;
    // Emite atualização para o HUD mostrar a onda
    this.events.emit('arena-wave-update', { wave: index + 1, maxWaves: this.waves.length });

    const spawns = this.waves[index];
    spawns.forEach((spawn) => {
      const monster = new Monster(this, spawn.x, spawn.y, spawn.type);
      monster.setTarget(this.player);
      this.activeMonsters.push(monster);
      this.combatSystem.registerMonster(monster);
    });

    console.log(`[BattleScene] Spawned Wave ${index + 1}`);
  }

  private handleVictory(): void {
    this.physics.world.disable(this.player);
    this.isMoving = false;
    this.player.play(`player-idle-${this.currentDirection}`, true);

    const { width, height } = this.scale;
    const banner = this.add.text(width / 2, height / 2, 'DESAFIO CONCLUÍDO!\n\nVitória Absoluta!\n+200 Ouro, +5 Gemas', {
      fontFamily: 'Cinzel',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.tweens.add({
      targets: banner,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: 1,
    });

    this.time.delayedCall(3500, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('BattleScene');
        const worldScene = this.scene.get('WorldScene') as any;
        this.scene.resume('WorldScene');
        worldScene.resumeFromArena({
          won: true,
          goldGained: 200,
          gemsGained: 5,
          hpPercent: this.combatSystem.getHP() / this.combatSystem.getMaxHP(),
        });
      });
    });
  }

  private handleDefeat(): void {
    this.physics.world.disable(this.player);
    this.isMoving = false;
    this.player.play(`player-idle-${this.currentDirection}`, true);

    const { width, height } = this.scale;
    const banner = this.add.text(width / 2, height / 2, 'DERROTA!\n\nVocê caiu no desafio...', {
      fontFamily: 'Cinzel',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.tweens.add({
      targets: banner,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: 1,
    });

    this.time.delayedCall(3000, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('BattleScene');
        const worldScene = this.scene.get('WorldScene') as any;
        this.scene.resume('WorldScene');
        worldScene.resumeFromArena({
          won: false,
          goldGained: 0,
          gemsGained: 0,
          hpPercent: 0,
        });
      });
    });
  }

  update(time: number): void {
    if (!this.cursors || !this.player || this.combatSystem.getHP() <= 0) return;

    // Ataque com a barra de Espaço
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.combatSystem.performMeleeAttack(this.player, this.currentDirection, time);
    }

    // Coleta de moedas
    this.combatSystem.updateLootCollection(this.player.x, this.player.y);

    // Atualiza IA dos monstros ativos
    this.combatSystem.updateMonsters(time);

    // Verifica progressão de ondas
    if (this.activeMonsters.length > 0) {
      const allDead = this.activeMonsters.every((m) => m.isDead);
      if (allDead) {
        this.activeMonsters = [];
        this.time.delayedCall(3000, () => {
          this.startWave(this.currentWaveIndex + 1);
        });
      }
    }

    // Movimentação do jogador em grid
    if (!this.isMoving) {
      let moveX = 0;
      let moveY = 0;

      if (this.cursors.left.isDown || this.wasd.a?.isDown) {
        moveX = -1;
        this.currentDirection = 'left';
      } else if (this.cursors.right.isDown || this.wasd.d?.isDown) {
        moveX = 1;
        this.currentDirection = 'right';
      } else if (this.cursors.up.isDown || this.wasd.w?.isDown) {
        moveY = -1;
        this.currentDirection = 'up';
      } else if (this.cursors.down.isDown || this.wasd.s?.isDown) {
        moveY = 1;
        this.currentDirection = 'down';
      }

      if (moveX !== 0 || moveY !== 0) {
        this.targetX = this.player.x + moveX * TILE_SIZE;
        this.targetY = this.player.y + moveY * TILE_SIZE;

        const tileX = Math.floor(this.targetX / TILE_SIZE);
        const tileY = Math.floor(this.targetY / TILE_SIZE);
        const wallTile = this.wallLayer.getTileAt(tileX, tileY);

        if (!wallTile) {
          this.isMoving = true;
          this.player.play(`player-walk-${this.currentDirection}`, true);

          this.tweens.add({
            targets: this.player,
            x: this.targetX,
            y: this.targetY,
            duration: 180,
            ease: 'Linear',
            onComplete: () => {
              this.isMoving = false;
              if (!this.cursors.left.isDown && !this.cursors.right.isDown &&
                  !this.cursors.up.isDown && !this.cursors.down.isDown &&
                  !this.wasd.a?.isDown && !this.wasd.d?.isDown &&
                  !this.wasd.w?.isDown && !this.wasd.s?.isDown) {
                this.player.play(`player-idle-${this.currentDirection}`, true);
              }
            },
          });
        } else {
          this.player.play(`player-idle-${this.currentDirection}`, true);
        }
      } else {
        this.player.play(`player-idle-${this.currentDirection}`, true);
      }
    }
  }
}

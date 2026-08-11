import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { Monster } from '../entities/Monster';
import { CombatSystem } from '../systems/CombatSystem';
import { SoundSynth } from '../utils/SoundSynth';

/**
 * WorldScene — Mundo principal com sistema de combate em tempo real,
 * spawns de monstros nas áreas externas, efeitos visuais e iluminação.
 */
export class WorldScene extends Phaser.Scene {
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
  private masterAldric!: Phaser.GameObjects.Container;
  private blacksmithBjorn!: Phaser.GameObjects.Container;
  private merchantElise!: Phaser.GameObjects.Container;
  private interactionText!: Phaser.GameObjects.Text;
  private isNearAldric = false;
  private isNearMerchant = false;
  private isNearBlacksmith = false;
  private enterKey!: Phaser.Input.Keyboard.Key;

  // Sistema de Tempo e Iluminação
  private gameHour = 12.0; // Hora atual do jogo (0.0 a 24.0)
  private playerLight!: Phaser.GameObjects.Light;
  private streetLamps: Phaser.GameObjects.Light[] = [];

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: { isNewGame?: boolean; playerClass?: PlayerClass }): void {
    if (data.playerClass) this.playerClass = data.playerClass;
  }

  create(): void {
    SoundSynth.playBGM('village');
    // Inicializa o sistema de combate
    this.combatSystem = new CombatSystem(this);

    // Cria o mapa com o tileset de alta qualidade
    this.createWorldMap();

    // Adiciona a Taverna dos Templários (edifício em pixel art HD)
    this.createTavernBuilding();

    // Cria os NPCs com sprites detalhados
    this.createWorldNPCs();

    // Cria o Paladino (Jogador)
    this.createPlayerCharacter();
    
    // Configura a classe no sistema de combate e aplica efeitos visuais
    this.combatSystem.setPlayerClass(this.playerClass);
    this.applyClassVisuals();

    // Spawna monstros na floresta
    this.spawnMonsters();

    // Configura os efeitos visuais e iluminação
    this.createAtmosphere();

    // Câmera do jogo
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(2.4);
    this.cameras.main.setBackgroundColor('#0d1a0d');

    // Controles WASD / Setas / Espaço
    this.setupControls();

    // Texto de interação com NPCs
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

    // Transição de entrada
    this.cameras.main.fadeIn(800);

    console.log(`[WorldScene] Mundo RPG renderizado com sucesso — Classe: ${this.playerClass}`);
  }

  private createWorldMap(): void {
    const mapWidth = 50;
    const mapHeight = 40;

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
        // Bordas do mapa (muro/colisão)
        if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
          this.groundLayer.putTileAt(754, x, y);
          this.wallLayer.putTileAt(115, x, y);
          continue;
        }

        // Caminho central de pedra (Cobblestone) da vila
        if (x >= 23 && x <= 27) {
          const cobbleTile = 114 + ((x + y) % 3);
          this.groundLayer.putTileAt(cobbleTile, x, y);
          continue;
        }

        // Caminho horizontal (Leste-Oeste)
        if (y >= 21 && y <= 23 && (x < 20 || x > 30)) {
          const cobbleTile = 114 + ((x + y) % 3);
          this.groundLayer.putTileAt(cobbleTile, x, y);
          continue;
        }

        // Rio / Lago (Canto sudeste)
        if (x >= 36 && x <= 44 && y >= 27 && y <= 35) {
          const dx = x - 40;
          const dy = y - 31;
          if (dx * dx + dy * dy < 20) {
            this.groundLayer.putTileAt(706, x, y); // Água
            continue;
          }
        }

        // Terra ao redor do caminho principal
        if ((x >= 21 && x <= 29) || (y >= 19 && y <= 25)) {
          const soilTile = 754 + ((x + y) % 3);
          this.groundLayer.putTileAt(soilTile, x, y);
          continue;
        }

        // Grama variada (base principal com flores)
        const grassTile = 66 + ((x * 3 + y * 7) % 4);
        this.groundLayer.putTileAt(grassTile, x, y);
      }
    }

    // Colisão nas paredes e limites
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
    tavern.setScale(0.45);
    tavern.setDepth(12 * TILE_SIZE / TILE_SIZE + 5);
    tavern.setPipeline('Light2D');

    // Paredes de colisão invisíveis para a Taverna
    const buildingWidth = 8;
    const buildingHeight = 6;
    const startTileX = 21;
    const startTileY = 10;

    for (let dy = 0; dy < buildingHeight; dy++) {
      for (let dx = 0; dx < buildingWidth; dx++) {
        // Deixa a porta livre (centro inferior)
        if (dy === buildingHeight - 1 && (dx === 3 || dx === 4)) continue;
        this.wallLayer.putTileAt(10, startTileX + dx, startTileY + dy);
      }
    }
  }

  private createWorldNPCs(): void {
    // Ferreiro Bjorn (à direita da Taverna)
    this.blacksmithBjorn = this.createNPC(
      31 * TILE_SIZE, 16 * TILE_SIZE,
      'blacksmith', 'Ferreiro Bjorn', '🔨', 'Mestre Armeiro da Ordem'
    );

    // Mercadora Elise (à esquerda da Taverna)
    this.merchantElise = this.createNPC(
      19 * TILE_SIZE, 16 * TILE_SIZE,
      'merchant', 'Mercadora Elise', '🛒', 'Suprimentos Templários'
    );

    // Mestre Aldric (na entrada da Taverna)
    this.masterAldric = this.createNPC(
      25 * TILE_SIZE, 18 * TILE_SIZE,
      'master', 'Mestre Aldric', '📜', 'Grão-Mestre da Ordem'
    );
  }

  private createNPC(
    x: number, y: number,
    frameKey: string, name: string, icon: string, _title: string
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setDepth(y / TILE_SIZE + 2);

    // Sprite do NPC
    const npcSprite = this.add.sprite(0, 0, 'npcs-clean', frameKey);
    npcSprite.setScale(0.22);
    npcSprite.setOrigin(0.5, 0.85);
    npcSprite.setPipeline('Light2D');

    // Sombra suave sob o NPC
    const shadow = this.add.ellipse(0, 6, 20, 8, 0x000000, 0.35);

    // Glow mágico ao redor do NPC
    const glow = this.add.graphics();
    glow.fillStyle(0xffd700, 0.08);
    glow.fillCircle(0, -10, 24);

    // Nome flutuante em dourado medieval
    const nameText = this.add.text(0, 16, name, {
      fontFamily: 'MedievalSharp',
      fontSize: '10px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Ícone de missão/interação flutuante
    const iconText = this.add.text(0, -38, icon, {
      fontSize: '14px',
    }).setOrigin(0.5);

    container.add([shadow, glow, npcSprite, nameText, iconText]);

    // Animação flutuante do ícone
    this.tweens.add({
      targets: iconText,
      y: -44,
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Animação respiratória do NPC
    this.tweens.add({
      targets: npcSprite,
      scaleY: 0.23,
      duration: 180,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    return container;
  }

  private createPlayerCharacter(): void {
    const startX = 25 * TILE_SIZE;
    const startY = 24 * TILE_SIZE;

    // Sprite do Paladino com o spritesheet formatado
    this.player = this.add.sprite(startX, startY, 'player-sheet', 0);
    this.player.setDepth(25);
    this.player.setScale(0.26); // Ajuste fino de tamanho do Paladino HD para o grid de 32px
    this.player.setOrigin(0.5, 0.85);
    this.player.setPipeline('Light2D');

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(TILE_SIZE * 0.6, TILE_SIZE * 0.4);
    body.setOffset(TILE_SIZE * 0.2, TILE_SIZE * 0.6);
    body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.wallLayer);

    this.targetX = startX;
    this.targetY = startY;

    // Sombra do Paladino
    const shadow = this.add.ellipse(0, 8, 22, 9, 0x000000, 0.4);
    shadow.setDepth(24);

    // Nome flutuante acima do Paladino
    const nameTag = this.add.text(0, -32, 'Templário', {
      fontFamily: 'MedievalSharp',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Atualiza a posição do nome e da sombra junto com o jogador
    this.events.on('postupdate', () => {
      shadow.setPosition(this.player.x, this.player.y + 4);
      nameTag.setPosition(this.player.x, this.player.y - 34);
      nameTag.setDepth(this.player.depth + 1);
      this.player.setDepth(this.player.y / TILE_SIZE + 2);
    });
  }

  private createAtmosphere(): void {
    const { width, height } = this.cameras.main;
    const mapW = 50 * TILE_SIZE;
    const mapH = 40 * TILE_SIZE;

    // Habilita as luzes
    this.lights.enable();
    this.lights.setAmbientColor(0xffffff);

    // Luz da tocha do jogador
    this.playerLight = this.lights.addLight(this.player.x, this.player.y, 90, 0xffd700, 1.2);

    // Postes de iluminação pela vila
    const lampPositions = [
      { x: 18 * TILE_SIZE, y: 16 * TILE_SIZE },
      { x: 32 * TILE_SIZE, y: 16 * TILE_SIZE },
      { x: 25 * TILE_SIZE, y: 26 * TILE_SIZE },
      { x: 26 * TILE_SIZE, y: 18 * TILE_SIZE },
    ];
    lampPositions.forEach((pos) => {
      const lamp = this.lights.addLight(pos.x, pos.y, 80, 0xffbb55, 1.4);
      this.streetLamps.push(lamp);

      // Ponto de luz brilhante visível
      const glow = this.add.graphics();
      glow.fillStyle(0xffe6a3, 0.7);
      glow.fillCircle(pos.x, pos.y, 3);
      glow.fillStyle(0xffa500, 0.3);
      glow.fillCircle(pos.x, pos.y, 8);
      glow.setDepth(pos.y / TILE_SIZE + 3);
    });

    // Efeito de iluminação quente vindo das janelas e portas da Taverna
    const tavernLight = this.add.image(25 * TILE_SIZE, 14 * TILE_SIZE, 'light-warm');
    tavernLight.setScale(3.5);
    tavernLight.setAlpha(0.45);
    tavernLight.setBlendMode('ADD');
    tavernLight.setDepth(15);

    this.tweens.add({
      targets: tavernLight,
      alpha: 0.3,
      scaleX: 3.3,
      scaleY: 3.3,
      duration: 2500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Partículas de folhas flutuantes na floresta
    this.add.particles(0, 0, 'particle-leaf', {
      x: { min: 0, max: mapW },
      y: { min: 0, max: mapH },
      lifespan: 7000,
      speed: { min: 10, max: 30 },
      angle: { min: 190, max: 250 },
      scale: { start: 0.8, end: 0.3 },
      alpha: { start: 0.7, end: 0 },
      frequency: 400,
    }).setDepth(30);

    // Vaga-lumes luminosos perto do lago e árvores
    this.add.particles(40 * TILE_SIZE, 31 * TILE_SIZE, 'particle-firefly', {
      x: { min: -150, max: 150 },
      y: { min: -100, max: 100 },
      lifespan: 4000,
      speed: { min: 5, max: 20 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 1.2, ease: 'Sine.easeInOut' },
      alpha: { start: 0, end: 0.9, ease: 'Sine.easeInOut' },
      frequency: 500,
      blendMode: 'ADD',
    }).setDepth(30);

    // Efeito de vinheta cinematográfica nas bordas da tela
    const vignette = this.add.image(
      this.cameras.main.scrollX + width / 2,
      this.cameras.main.scrollY + height / 2,
      'vignette'
    );
    vignette.setScrollFactor(0);
    vignette.setDisplaySize(width, height);
    vignette.setAlpha(0.4);
    vignette.setDepth(100);
  }

  private spawnMonsters(): void {
    // Spawna monstros na floresta ao redor da vila
    const monsterSpawns = [
      { x: 10 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'GOBLIN' },
      { x: 14 * TILE_SIZE, y: 15 * TILE_SIZE, type: 'GOBLIN' },
      { x: 8 * TILE_SIZE, y: 28 * TILE_SIZE, type: 'SKELETON' },
      { x: 12 * TILE_SIZE, y: 32 * TILE_SIZE, type: 'SKELETON' },
      { x: 38 * TILE_SIZE, y: 12 * TILE_SIZE, type: 'SHADOW_WOLF' },
      { x: 42 * TILE_SIZE, y: 16 * TILE_SIZE, type: 'SHADOW_WOLF' },
      { x: 38 * TILE_SIZE, y: 34 * TILE_SIZE, type: 'DEMON_IMP' },
    ];

    monsterSpawns.forEach((spawn) => {
      const monster = new Monster(this, spawn.x, spawn.y, spawn.type);
      monster.setTarget(this.player);
      this.combatSystem.registerMonster(monster);
    });
  }

  private setupControls(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.wasd = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Clique do mouse dispara ataque
    this.input.on('pointerdown', () => {
      this.combatSystem.performMeleeAttack(this.player, this.currentDirection, this.time.now);
    });
  }

  update(time: number): void {
    if (!this.cursors || !this.player) return;

    // Proximidade com Mestre Aldric
    if (this.masterAldric) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.masterAldric.x, this.masterAldric.y);
      if (dist < 48) {
        if (!this.isNearAldric) {
          this.isNearAldric = true;
          this.interactionText.setText('Mestre Aldric: "Deseja entrar na Arena?"\n[Pressione ENTER para aceitar o desafio]');
          this.interactionText.setVisible(true);
        }

        if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.startBattleArena();
          return;
        }
      } else {
        if (this.isNearAldric) {
          this.isNearAldric = false;
          this.interactionText.setVisible(false);
        }
      }
    }

    // Proximidade com Mercadora Elise
    if (this.merchantElise) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.merchantElise.x, this.merchantElise.y);
      if (dist < 48) {
        if (!this.isNearMerchant) {
          this.isNearMerchant = true;
          this.interactionText.setText('Mercadora Elise: "Deseja ver meus suprimentos?"\n[Pressione ENTER para negociar]');
          this.interactionText.setVisible(true);
        }

        if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.openMerchantShop();
          return;
        }
      } else {
        if (this.isNearMerchant) {
          this.isNearMerchant = false;
          this.interactionText.setVisible(false);
        }
      }
    }

    // Proximidade com Ferreiro Bjorn
    if (this.blacksmithBjorn) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.blacksmithBjorn.x, this.blacksmithBjorn.y);
      if (dist < 48) {
        if (!this.isNearBlacksmith) {
          this.isNearBlacksmith = true;
          this.interactionText.setText('Ferreiro Bjorn: "Deseja aprimorar seus equipamentos?"\n[Pressione ENTER para forjar]');
          this.interactionText.setVisible(true);
        }

        if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
          this.openBlacksmithForge();
          return;
        }
      } else {
        if (this.isNearBlacksmith) {
          this.isNearBlacksmith = false;
          this.interactionText.setVisible(false);
        }
      }
    }

    // Ataque com a barra de Espaço
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.combatSystem.performMeleeAttack(this.player, this.currentDirection, time);
    }

    // Coleta de loot ao passar por cima
    this.combatSystem.updateLootCollection(this.player.x, this.player.y);

    // Atualiza o sistema de combate (IA e regeneração)
    this.combatSystem.update(time);

    // Atualiza o Ciclo de Iluminação e Tempo
    const dt = this.game.loop.delta / 1000;
    this.updateEnvironmentLighting(dt);

    if (this.playerLight && this.player) {
      this.playerLight.setPosition(this.player.x, this.player.y - 12);
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body) {
      let vx = 0;
      let vy = 0;

      if (this.cursors.left.isDown || this.wasd.a?.isDown) {
        vx = -1;
        this.currentDirection = 'left';
      } else if (this.cursors.right.isDown || this.wasd.d?.isDown) {
        vx = 1;
        this.currentDirection = 'right';
      }

      if (this.cursors.up.isDown || this.wasd.w?.isDown) {
        vy = -1;
        this.currentDirection = 'up';
      } else if (this.cursors.down.isDown || this.wasd.s?.isDown) {
        vy = 1;
        this.currentDirection = 'down';
      }

      if (vx !== 0 || vy !== 0) {
        const length = Math.hypot(vx, vy);
        const speed = 130;
        body.setVelocity((vx / length) * speed, (vy / length) * speed);
        this.player.play(`player-walk-${this.currentDirection}`, true);
      } else {
        body.setVelocity(0, 0);
        this.player.play(`player-idle-${this.currentDirection}`, true);
      }

      // Atualiza profundidade dinâmica (sorting Y)
      this.player.setDepth(this.player.y / 32 + 2);
    }
  }

  private startBattleArena(): void {
    if (this.isNearAldric) {
      this.isNearAldric = false;
      this.interactionText.setVisible(false);
    }

    // Desativa física do jogador
    this.physics.world.disable(this.player);
    this.isMoving = false;
    this.player.play(`player-idle-${this.currentDirection}`, true);

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

  public resumeFromArena(data: {
    won: boolean;
    goldGained: number;
    gemsGained: number;
    hpPercent: number;
    inventory?: any[];
    equipped?: any;
  }): void {
    // Reativa a física do jogador
    this.physics.world.enable(this.player);
    
    // Atualiza status do jogador baseados na arena
    if (data.won) {
      this.combatSystem.setGold(this.combatSystem.getGold() + data.goldGained);
      this.combatSystem.setGems(this.combatSystem.getGems() + data.gemsGained);
    }

    if (data.inventory) {
      this.combatSystem.setInventory(data.inventory);
    }
    if (data.equipped) {
      this.combatSystem.setEquipped(data.equipped);
    }
    
    // Se perdeu, restaura a vida inteira e spawna na entrada da taverna
    if (!data.won) {
      this.combatSystem.setHP(this.combatSystem.getMaxHP());
      this.player.setPosition(25 * 32, 22 * 32);
    } else {
      // Se venceu, define o HP proporcional
      const newHp = Math.max(1, Math.floor(this.combatSystem.getMaxHP() * data.hpPercent));
      this.combatSystem.setHP(newHp);
    }

    this.events.emit('scene-change', 'Taverna dos Templários');
    this.cameras.main.fadeIn(800);
    SoundSynth.playBGM('village');
  }

  private applyClassVisuals(): void {
    if (!this.player) return;

    switch (this.playerClass) {
      case PlayerClass.PALADIN:
        this.player.setTint(0xfff5cc);
        break;
      case PlayerClass.MAGE:
        this.player.setTint(0xcce6ff);
        this.add.particles(0, 0, 'particle-gold', {
          speed: { min: 5, max: 15 },
          scale: { start: 0.3, end: 0 },
          lifespan: 600,
          quantity: 1,
          frequency: 150,
          follow: this.player,
          followOffset: { x: 0, y: 10 },
          tint: 0x4488ff,
          blendMode: 'ADD',
        });
        break;
      case PlayerClass.ARCHER:
        this.player.setTint(0xccffcc);
        this.add.particles(0, 0, 'particle-gold', {
          speedY: { min: 5, max: 15 },
          speedX: { min: -5, max: 5 },
          scale: { start: 0.3, end: 0 },
          lifespan: 800,
          quantity: 1,
          frequency: 250,
          follow: this.player,
          followOffset: { x: 0, y: 10 },
          tint: 0x228b22,
          blendMode: 'ADD',
        });
        break;
      case PlayerClass.ASSASSIN:
        this.player.setTint(0x777777);
        break;
    }
  }

  private openMerchantShop(): void {
    if (this.isNearMerchant) {
      this.isNearMerchant = false;
      this.interactionText.setVisible(false);
    }
    this.physics.world.disable(this.player);
    this.isMoving = false;
    this.player.play(`player-idle-${this.currentDirection}`, true);

    const uiScene = this.scene.get('UIScene') as any;
    if (uiScene) {
      uiScene.toggleMerchantShop(true);
    }
  }

  private openBlacksmithForge(): void {
    if (this.isNearBlacksmith) {
      this.isNearBlacksmith = false;
      this.interactionText.setVisible(false);
    }
    this.physics.world.disable(this.player);
    this.isMoving = false;
    this.player.play(`player-idle-${this.currentDirection}`, true);

    const uiScene = this.scene.get('UIScene') as any;
    if (uiScene) {
      uiScene.toggleBlacksmithForge(true);
    }
  }

  private updateEnvironmentLighting(dt: number): void {
    this.gameHour = (this.gameHour + dt * 0.2) % 24;

    this.events.emit('update-game-time', { hour: this.gameHour });

    let ambientR = 255;
    let ambientG = 255;
    let ambientB = 255;
    let lightIntensity = 0.0;

    const h = this.gameHour;

    if (h >= 6 && h < 11) {
      const t = (h - 6) / 5;
      ambientR = Math.round(Phaser.Math.Linear(0x3b, 0xff, t));
      ambientG = Math.round(Phaser.Math.Linear(0x2d, 0xfa, t));
      ambientB = Math.round(Phaser.Math.Linear(0x54, 0xf0, t));
      lightIntensity = Phaser.Math.Linear(1.0, 0.0, t);
    } else if (h >= 11 && h < 17) {
      ambientR = 255;
      ambientG = 255;
      ambientB = 255;
      lightIntensity = 0.0;
    } else if (h >= 17 && h < 20) {
      const t = (h - 17) / 3;
      ambientR = Math.round(Phaser.Math.Linear(0xff, 0xfd, t));
      ambientG = Math.round(Phaser.Math.Linear(0xff, 0x5e, t));
      ambientB = Math.round(Phaser.Math.Linear(0xff, 0x53, t));
      lightIntensity = Phaser.Math.Linear(0.0, 1.0, t);
    } else if (h >= 20 || h < 4) {
      ambientR = 0x12;
      ambientG = 0x12;
      ambientB = 0x2b;
      lightIntensity = 1.0;
    } else {
      const t = (h - 4) / 2;
      ambientR = Math.round(Phaser.Math.Linear(0x12, 0x3b, t));
      ambientG = Math.round(Phaser.Math.Linear(0x12, 0x2d, t));
      ambientB = Math.round(Phaser.Math.Linear(0x2b, 0x54, t));
      lightIntensity = 1.0;
    }

    const colorInt = Phaser.Display.Color.GetColor(ambientR, ambientG, ambientB);
    this.lights.setAmbientColor(colorInt);

    if (this.playerLight) {
      this.playerLight.setIntensity(lightIntensity * 1.2);
    }
    this.streetLamps.forEach((lamp) => {
      lamp.setIntensity(lightIntensity * 1.4);
    });
  }
}

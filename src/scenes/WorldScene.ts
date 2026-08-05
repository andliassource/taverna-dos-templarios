import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE, PLAYER_SPEED } from '../config/game.config';

/**
 * WorldScene — Cena principal do mundo.
 * Movimentação tile-based (estilo Final Fantasy / Pokémon GBA).
 * Vista top-down com grid.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;
  private targetX = 0;
  private targetY = 0;
  private currentDirection = 'down';
  private map!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private wallLayer!: Phaser.Tilemaps.TilemapLayer;
  private decorLayer!: Phaser.Tilemaps.TilemapLayer;
  private playerClass: PlayerClass = PlayerClass.PALADIN;

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: { isNewGame?: boolean; playerClass?: PlayerClass }): void {
    if (data.playerClass) {
      this.playerClass = data.playerClass;
    }
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Cria mapa procedural (placeholder — será substituído por Tiled)
    this.createProceduralMap();

    // Cria jogador
    this.createPlayer();

    // Configura câmera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(2);

    // Configura controles
    this.setupControls();

    // Adiciona NPCs placeholder
    this.createNPCs();

    // Fade in
    this.cameras.main.fadeIn(500);

    console.log(`[WorldScene] Mundo criado — Classe: ${this.playerClass}`);
  }

  private createProceduralMap(): void {
    // Cria tilemap procedural (placeholder para Tiled)
    const mapWidth = 40;
    const mapHeight = 30;

    this.map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: mapWidth,
      height: mapHeight,
    });

    const tileset = this.map.addTilesetImage('tiles', 'tileset');

    if (!tileset) {
      console.error('[WorldScene] Falha ao carregar tileset');
      return;
    }

    // Layer de chão
    this.groundLayer = this.map.createBlankLayer('ground', tileset, 0, 0)!;
    // Layer de paredes/colisão
    this.wallLayer = this.map.createBlankLayer('walls', tileset, 0, 0)!;
    // Layer de decoração (acima do jogador)
    this.decorLayer = this.map.createBlankLayer('decor', tileset, 0, 0)!;

    // Preenche o chão com tile de grama (tile 0)
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        // Chão variado
        const grassTile = Math.random() > 0.85 ? 1 : 0;
        this.groundLayer.putTileAt(grassTile, x, y);

        // Bordas = paredes
        if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
          this.wallLayer.putTileAt(3, x, y);
        }
      }
    }

    // Adiciona estrutura da Taverna (centro do mapa)
    const tavernX = Math.floor(mapWidth / 2) - 3;
    const tavernY = Math.floor(mapHeight / 2) - 3;
    for (let dy = 0; dy < 6; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        // Chão da taverna (tile de madeira)
        this.groundLayer.putTileAt(2, tavernX + dx, tavernY + dy);
        // Paredes da taverna (exceto entrada)
        if (dy === 0 || dy === 5 || dx === 0 || dx === 6) {
          if (!(dy === 5 && dx === 3)) { // Entrada
            this.wallLayer.putTileAt(4, tavernX + dx, tavernY + dy);
          }
        }
      }
    }

    // Adiciona alguns obstáculos aleatórios (árvores, pedras)
    for (let i = 0; i < 30; i++) {
      const rx = Phaser.Math.Between(2, mapWidth - 3);
      const ry = Phaser.Math.Between(2, mapHeight - 3);
      // Não colocar na taverna
      if (rx >= tavernX - 1 && rx <= tavernX + 7 && ry >= tavernY - 1 && ry <= tavernY + 7) {
        continue;
      }
      this.wallLayer.putTileAt(5, rx, ry); // Árvore/pedra
    }

    // Configura colisão
    this.wallLayer.setCollisionByExclusion([-1]);

    // Profundidade das layers
    this.groundLayer.setDepth(0);
    this.wallLayer.setDepth(1);
    this.decorLayer.setDepth(10);
  }

  private createPlayer(): void {
    // Posição inicial (em frente à taverna)
    const startX = 20 * TILE_SIZE + TILE_SIZE / 2;
    const startY = 18 * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.add.sprite(startX, startY, 'player', 0);
    this.player.setDepth(5);
    this.player.setOrigin(0.5, 0.75); // Ponto de ancoragem nos pés

    // Physics body para colisão
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(TILE_SIZE * 0.6, TILE_SIZE * 0.4);
    body.setOffset(TILE_SIZE * 0.2, TILE_SIZE * 0.5);
    body.setCollideWorldBounds(true);

    // Colisão com paredes
    this.physics.add.collider(this.player, this.wallLayer);

    // Posição alvo inicial
    this.targetX = startX;
    this.targetY = startY;
  }

  private setupControls(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Touch/mobile controls (virtual D-pad) — TODO: UIScene
  }

  private createNPCs(): void {
    // NPC Ferreiro (perto da taverna)
    this.createNPC(22 * TILE_SIZE, 13 * TILE_SIZE, 'Ferreiro Bjorn', 0xff6600);
    // NPC Mercador
    this.createNPC(18 * TILE_SIZE, 13 * TILE_SIZE, 'Mercador Elise', 0x00cc66);
    // NPC Quest
    this.createNPC(20 * TILE_SIZE, 10 * TILE_SIZE, 'Mestre Aldric', 0xffcc00);
  }

  private createNPC(x: number, y: number, name: string, color: number): void {
    const npc = this.add.graphics();
    npc.fillStyle(color, 1);
    npc.fillCircle(0, 0, 12);
    npc.fillStyle(0xffffff, 1);
    npc.fillCircle(-3, -3, 3);
    npc.fillCircle(3, -3, 3);
    npc.setPosition(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    npc.setDepth(5);

    // Nome do NPC
    const nameText = this.add.text(x + TILE_SIZE / 2, y - 4, name, {
      fontFamily: 'MedievalSharp',
      fontSize: '10px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(6);

    // Indicador de interação
    const exclamation = this.add.text(x + TILE_SIZE / 2, y - 16, '!', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);

    // Animação do indicador
    this.tweens.add({
      targets: exclamation,
      y: y - 22,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  update(_time: number, _delta: number): void {
    if (!this.cursors || !this.player) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Movimento tile-based (grid movement)
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

        // Verifica colisão no tile alvo
        const tileX = Math.floor(this.targetX / TILE_SIZE);
        const tileY = Math.floor(this.targetY / TILE_SIZE);
        const wallTile = this.wallLayer.getTileAt(tileX, tileY);

        if (!wallTile) {
          this.isMoving = true;

          // Toca animação de caminhada
          this.player.play(`player-walk-${this.currentDirection}`, true);

          // Move suavemente para o tile alvo
          this.tweens.add({
            targets: this.player,
            x: this.targetX,
            y: this.targetY,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
              this.isMoving = false;
              // Se não está mais pressionando, volta para idle
              if (!this.cursors.left.isDown && !this.cursors.right.isDown &&
                  !this.cursors.up.isDown && !this.cursors.down.isDown &&
                  !this.wasd.a?.isDown && !this.wasd.d?.isDown &&
                  !this.wasd.w?.isDown && !this.wasd.s?.isDown) {
                this.player.play(`player-idle-${this.currentDirection}`, true);
              }
            },
          });
        } else {
          // Colisão — mostra idle na direção
          this.player.play(`player-idle-${this.currentDirection}`, true);
        }
      } else {
        // Parado — idle
        body.setVelocity(0, 0);
        this.player.play(`player-idle-${this.currentDirection}`, true);
      }
    }

    // Atualiza profundidade baseada na posição Y (sorting)
    this.player.setDepth(this.player.y);
  }
}

import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';

export interface RemotePlayerState {
  id: string;
  name: string;
  classType: PlayerClass;
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
  hp: number;
  maxHp: number;
  level: number;
  guildTag?: string;
}

export class NetworkSystem {
  private static instance: NetworkSystem;
  private scene: Phaser.Scene | null = null;
  private remotePlayers: Map<string, { sprite: Phaser.GameObjects.Sprite; nameText: Phaser.GameObjects.Text; hpBar: Phaser.GameObjects.Graphics }> = new Map();
  private simulatedOtherPlayers: RemotePlayerState[] = [];

  private constructor() {
    this.initSimulatedPlayers();
  }

  public static getInstance(): NetworkSystem {
    if (!NetworkSystem.instance) {
      NetworkSystem.instance = new NetworkSystem();
    }
    return NetworkSystem.instance;
  }

  private initSimulatedPlayers(): void {
    this.simulatedOtherPlayers = [];
  }

  public bindScene(scene: Phaser.Scene): void {
    this.scene = scene;
    this.spawnRemotePlayers();
  }

  private spawnRemotePlayers(): void {
    if (!this.scene) return;

    this.simulatedOtherPlayers.forEach((p) => {
      if (this.remotePlayers.has(p.id)) return;

      const skinKey = `${p.classType.toLowerCase()}-sheet`;
      const sprite = this.scene!.physics.add.sprite(p.x, p.y, skinKey);
      sprite.setScale(1.5);
      sprite.setDepth(p.y / 32 + 2);

      // Nome do Jogador + Tag de Guilda + Level sobre a cabeça
      const displayName = `[${p.guildTag ?? 'SOLO'}] ${p.name} (Lv.${p.level})`;
      const nameText = this.scene!.add.text(p.x, p.y - 42, displayName, {
        fontFamily: 'Cinzel',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2.5,
      }).setOrigin(0.5).setDepth(2000);

      // Barra de Vida Mini sobre a cabeça
      const hpBar = this.scene!.add.graphics().setDepth(2000);
      this.drawMiniHpBar(hpBar, p.x, p.y - 28, p.hp, p.maxHp);

      this.remotePlayers.set(p.id, { sprite, nameText, hpBar });
    });
  }

  private drawMiniHpBar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, hp: number, maxHp: number): void {
    graphics.clear();
    const w = 40;
    const h = 5;
    const px = x - w / 2;

    graphics.fillStyle(0x000000, 0.8);
    graphics.fillRoundedRect(px, y, w, h, 2);

    const pct = Math.max(0, hp / maxHp);
    graphics.fillStyle(0x22cc44, 1);
    graphics.fillRoundedRect(px, y, w * pct, h, 2);
  }

  public update(time: number): void {
    if (!this.scene) return;

    // Simula movimentação sutil de patrulha dos outros jogadores online
    this.simulatedOtherPlayers.forEach((p, idx) => {
      const entry = this.remotePlayers.get(p.id);
      if (!entry) return;

      const angle = time * 0.001 + idx * 2;
      const vx = Math.cos(angle) * 0.8;
      const vy = Math.sin(angle) * 0.8;

      p.x += vx;
      p.y += vy;

      entry.sprite.setPosition(p.x, p.y);
      entry.sprite.setDepth(p.y / 32 + 2);
      entry.nameText.setPosition(p.x, p.y - 42);
      this.drawMiniHpBar(entry.hpBar, p.x, p.y - 28, p.hp, p.maxHp);
    });
  }
}

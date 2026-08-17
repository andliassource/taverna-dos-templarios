import Phaser from 'phaser';

export class MapScene extends Phaser.Scene {
  private mapPoints = [
    { id: 'town_start', name: 'Taverna dos Templários (Norte)', x: 300, y: 150, locked: false },
    { id: 'town_east', name: 'Acampamento Leste', x: 500, y: 300, locked: false },
    { id: 'dungeon_entrance', name: 'Entrada da Masmorra', x: 150, y: 400, locked: false },
  ];

  constructor() {
    super({ key: 'MapScene' });
  }

  create(): void {
    // Fundo escuro
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);

    // Pergaminho Central
    const mapW = 600;
    const mapH = 450;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0xddccaa, 1);
    bg.fillRoundedRect(cx - mapW / 2, cy - mapH / 2, mapW, mapH, 16);
    bg.lineStyle(4, 0x8b4513, 1);
    bg.strokeRoundedRect(cx - mapW / 2, cy - mapH / 2, mapW, mapH, 16);

    this.add.text(cx, cy - mapH / 2 + 30, '🗺️ Mapa-Múndi de Eldoria', {
      fontFamily: 'Cinzel',
      fontSize: '28px',
      color: '#3e2723',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy - mapH / 2 + 60, 'Clique em um local descoberto para viajar', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#5d4037',
    }).setOrigin(0.5);

    // Desenhando os nós do mapa
    this.mapPoints.forEach((point) => {
      // Coordenadas relativas ao pergaminho
      const px = (cx - mapW / 2) + point.x;
      const py = (cx - mapH / 2) + point.y;

      const nodeBg = this.add.graphics();
      nodeBg.fillStyle(point.locked ? 0x888888 : 0xffaa00, 1);
      nodeBg.fillCircle(px, py, 12);
      nodeBg.lineStyle(2, 0x3e2723, 1);
      nodeBg.strokeCircle(px, py, 12);

      const labelBg = this.add.graphics();
      labelBg.fillStyle(0x3e2723, 0.8);
      labelBg.fillRoundedRect(px - 60, py + 15, 120, 20, 4);

      const label = this.add.text(px, py + 25, point.name, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#ffffff',
      }).setOrigin(0.5);

      const zone = this.add.zone(px, py, 40, 40).setInteractive({ useHandCursor: !point.locked });
      zone.on('pointerover', () => {
        if (!point.locked) {
          nodeBg.clear();
          nodeBg.fillStyle(0xffffff, 1);
          nodeBg.fillCircle(px, py, 14);
          nodeBg.lineStyle(2, 0xff0000, 1);
          nodeBg.strokeCircle(px, py, 14);
          this.tweens.add({ targets: label, scale: 1.1, duration: 100 });
        }
      });
      zone.on('pointerout', () => {
        if (!point.locked) {
          nodeBg.clear();
          nodeBg.fillStyle(0xffaa00, 1);
          nodeBg.fillCircle(px, py, 12);
          nodeBg.lineStyle(2, 0x3e2723, 1);
          nodeBg.strokeCircle(px, py, 12);
          this.tweens.add({ targets: label, scale: 1.0, duration: 100 });
        }
      });

      zone.on('pointerdown', () => {
        if (!point.locked) {
          this.teleportTo(point.id);
        }
      });
    });

    // Botão de fechar
    const closeBtn = this.add.text(cx + mapW / 2 - 20, cy - mapH / 2 + 20, '✖', {
      fontSize: '24px',
      color: '#3e2723',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
      this.scene.resume('DungeonScene');
    });

    // Tecla ESC para fechar
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
      this.scene.resume('DungeonScene');
    });
  }

  private teleportTo(id: string): void {
    // Lógica de teleporte baseada no ID
    this.scene.stop('MapScene');
    const worldScene = this.scene.get('WorldScene') as any;
    const dungeonScene = this.scene.get('DungeonScene') as any;
    
    if (id === 'dungeon_entrance') {
      if (worldScene) worldScene.scene.stop();
      if (dungeonScene) dungeonScene.scene.stop();
      this.scene.start('DungeonScene', { floor: 1 });
    } else if (id === 'town_start') {
      if (dungeonScene) dungeonScene.scene.stop();
      if (!worldScene.scene.isActive()) {
        this.scene.start('WorldScene');
      } else {
        this.scene.resume('WorldScene');
      }
      this.time.delayedCall(100, () => {
        const ws = this.scene.get('WorldScene') as any;
        if (ws && ws.player) {
          ws.player.setPosition(25 * 32, 22 * 32);
        }
      });
    } else if (id === 'town_east') {
      if (dungeonScene) dungeonScene.scene.stop();
      if (!worldScene.scene.isActive()) {
        this.scene.start('WorldScene');
      } else {
        this.scene.resume('WorldScene');
      }
      this.time.delayedCall(100, () => {
        const ws = this.scene.get('WorldScene') as any;
        if (ws && ws.player) {
          ws.player.setPosition(130 * 32, 20 * 32); // Rota Leste
        }
      });
    }
  }
}

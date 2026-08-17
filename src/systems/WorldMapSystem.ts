import Phaser from 'phaser';

export interface LocationWaypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  unlocked: boolean;
  type: 'CITY' | 'DUNGEON' | 'ARENA' | 'TAVERN';
}

export class WorldMapSystem {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isOpen = false;

  private waypoints: LocationWaypoint[] = [
    { id: 'tavern', name: '🍺 Taverna dos Templários', x: 25, y: 14, unlocked: true, type: 'TAVERN' },
    { id: 'village_square', name: '🏰 Praça de Aethelgard (Vilarejo)', x: 20, y: 20, unlocked: true, type: 'CITY' },
    { id: 'arena', name: '⚔️ Arena dos Cavaleiros', x: 12, y: 8, unlocked: true, type: 'ARENA' },
    { id: 'dungeon_crypt', name: '💀 Cripta das Sombras (Masmorra)', x: 25, y: 8, unlocked: true, type: 'DUNGEON' },
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createMapUI();
  }

  private createMapUI(): void {
    const { width, height } = this.scene.scale;
    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setScrollFactor(0).setDepth(300).setVisible(false);

    // Fundo do Mapa com Moldura de Ouro e Metal
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0e0818, 0.95);
    bg.fillRoundedRect(-180, -140, 360, 280, 10);
    bg.lineStyle(2.5, 0xd4af37, 1);
    bg.strokeRoundedRect(-180, -140, 360, 280, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(-176, -136, 352, 272, 8);

    const title = this.scene.add.text(0, -120, '🗺️ MAPA DO MUNDO TEMPLÁRIO', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.container.add([bg, title]);

    // Botões dos Pontos de Teleporte / Viagem Rápida
    let currentY = -70;
    this.waypoints.forEach((wp) => {
      const btnBg = this.scene.add.graphics();
      btnBg.fillStyle(wp.unlocked ? 0x221238 : 0x111111, 0.9);
      btnBg.fillRoundedRect(-150, currentY - 14, 300, 28, 6);
      btnBg.lineStyle(1.5, wp.unlocked ? 0xffd700 : 0x555555, 0.8);
      btnBg.strokeRoundedRect(-150, currentY - 14, 300, 28, 6);

      const btnText = this.scene.add.text(0, currentY, `${wp.name} ${wp.unlocked ? '(Teleportar)' : '🔒 (Bloqueado)'}`, {
        fontFamily: 'MedievalSharp',
        fontSize: '11px',
        color: wp.unlocked ? '#ffffff' : '#888888',
      }).setOrigin(0.5);

      const zone = this.scene.add.zone(0, currentY, 300, 28).setInteractive({ useHandCursor: wp.unlocked });
      zone.on('pointerdown', () => {
        if (wp.unlocked) {
          this.teleportTo(wp);
        }
      });

      this.container.add([btnBg, btnText, zone]);
      currentY += 36;
    });

    // Tecla de Fechar [M / ESC]
    const closeText = this.scene.add.text(0, 115, 'Pressione [M] ou Clique Fora para Fechar', {
      fontFamily: 'Cinzel',
      fontSize: '9px',
      color: '#d4af37',
    }).setOrigin(0.5);

    this.container.add(closeText);
  }

  public toggleMap(): void {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);
  }

  public isMapOpen(): boolean {
    return this.isOpen;
  }

  private teleportTo(wp: LocationWaypoint): void {
    this.toggleMap();
    this.scene.events.emit('teleport-player', { tileX: wp.x, tileY: wp.y, locationName: wp.name });
  }
}

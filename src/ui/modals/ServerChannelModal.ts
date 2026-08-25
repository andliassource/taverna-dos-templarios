import Phaser from 'phaser';
import { SoundSynth } from '../../utils/SoundSynth';

export class ServerChannelModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;
  private currentChannel = 'Canal 1 - Servidor Principal';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createChannelUI();
  }

  private createChannelUI(): void {
    const width = 420;
    const height = 280;
    const x = (this.scene.scale.width - width) / 2;
    const y = (this.scene.scale.height - height) / 2;

    this.container = this.scene.add.container(x, y).setDepth(2200).setScrollFactor(0).setVisible(false);

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.95);
    bg.fillRoundedRect(0, 0, width, height, 14);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(0, 0, width, height, 14);
    this.container.add(bg);

    // Título
    const title = this.scene.add.text(width / 2, 24, '🌐 SELETOR DE CANAIS DE SERVIDOR MMORPG', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.container.add(title);

    const channels = [
      { name: 'Canal 1 - Servidor Principal (PVE)', status: '🟢 Ativo (Você Conectado)' },
      { name: 'Canal 2 - Servidor PvP Liberto', status: '⚪ Disponível (0 Jogadores)' },
      { name: 'Canal 3 - Servidor de Raids & Instâncias', status: '⚪ Disponível (0 Jogadores)' },
    ];

    channels.forEach((ch, idx) => {
      const rowY = 58 + idx * 58;

      const rowBg = this.scene.add.graphics();
      rowBg.fillStyle(0x160c28, 0.8);
      rowBg.fillRoundedRect(20, rowY, width - 40, 50, 8);
      rowBg.lineStyle(1, 0x5a3e10, 0.6);
      rowBg.strokeRoundedRect(20, rowY, width - 40, 50, 8);
      this.container.add(rowBg);

      const chText = this.scene.add.text(32, rowY + 10, `${ch.name}`, {
        fontFamily: 'Cinzel', fontSize: '11.5px', fontStyle: 'bold', color: '#ffffff',
      });
      this.container.add(chText);

      const statusText = this.scene.add.text(32, rowY + 28, `${ch.status}`, {
        fontFamily: 'Inter', fontSize: '10.5px', color: '#cccccc',
      });
      this.container.add(statusText);

      // Botão Conectar
      const connBtn = this.scene.add.text(width - 110, rowY + 14, '⚡ CONECTAR', {
        fontFamily: 'Cinzel',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#1b5e20',
        padding: { x: 8, y: 4 },
      }).setInteractive({ useHandCursor: true });

      connBtn.on('pointerdown', () => {
        this.currentChannel = ch.name;
        SoundSynth.playUpgrade();
        this.scene.events.emit('show-notification', `🌐 Conectado ao ${ch.name}!`);
        this.toggle();
      });
      this.container.add(connBtn);
    });

    // Botão Fechar
    const closeBtn = this.scene.add.text(width / 2, height - 22, '✖️ FECHAR', {
      fontFamily: 'Cinzel', fontSize: '12px', fontStyle: 'bold', color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.toggle());
    this.container.add(closeBtn);
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }
}

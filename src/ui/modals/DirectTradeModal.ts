import Phaser from 'phaser';
import { SoundSynth } from '../../utils/SoundSynth';

export class DirectTradeModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createTradeUI();
  }

  private createTradeUI(): void {
    const width = 460;
    const height = 300;
    const x = (this.scene.scale.width - width) / 2;
    const y = (this.scene.scale.height - height) / 2;

    this.container = this.scene.add.container(x, y).setDepth(2000).setScrollFactor(0).setVisible(false);

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.95);
    bg.fillRoundedRect(0, 0, width, height, 14);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(0, 0, width, height, 14);
    this.container.add(bg);

    // Título da Negociação
    const title = this.scene.add.text(width / 2, 22, '🤝 TROCA DIRETA MMORPG', {
      fontFamily: 'Cinzel',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.container.add(title);

    // Coluna 1: Suas Ofertas
    const col1Title = this.scene.add.text(110, 50, 'SEUS ITENS & OURO', {
      fontFamily: 'Cinzel', fontSize: '11px', color: '#33ccff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(col1Title);

    const col1Box = this.scene.add.graphics();
    col1Box.lineStyle(1, 0x33ccff, 0.6);
    col1Box.strokeRoundedRect(20, 68, 180, 160, 8);
    this.container.add(col1Box);

    // Coluna 2: Oferta do Parceiro
    const col2Title = this.scene.add.text(350, 50, 'OFERTA DO PARCEIRO', {
      fontFamily: 'Cinzel', fontSize: '11px', color: '#ff9900', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(col2Title);

    const col2Box = this.scene.add.graphics();
    col2Box.lineStyle(1, 0xff9900, 0.6);
    col2Box.strokeRoundedRect(260, 68, 180, 160, 8);
    this.container.add(col2Box);

    // Botão de Aceitar Troca
    const acceptBtn = this.scene.add.text(width / 2 - 60, height - 35, '✅ ACEITAR TROCA', {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#1b5e20',
      padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    acceptBtn.on('pointerdown', () => {
      SoundSynth.playUpgrade();
      this.scene.events.emit('show-notification', '🤝 Troca concluída com sucesso entre os jogadores!');
      this.toggle();
    });
    this.container.add(acceptBtn);

    // Botão de Cancelar
    const cancelBtn = this.scene.add.text(width / 2 + 60, height - 35, '❌ CANCELAR', {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#b71c1c',
      padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    cancelBtn.on('pointerdown', () => this.toggle());
    this.container.add(cancelBtn);
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }
}

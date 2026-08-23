import Phaser from 'phaser';
import { SoundSynth } from '../../utils/SoundSynth';

export class PlayerInteractionModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;
  private targetPlayerName = 'Jogador';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createInteractionUI();
  }

  private createInteractionUI(): void {
    const width = 260;
    const height = 210;
    const x = (this.scene.scale.width - width) / 2;
    const y = (this.scene.scale.height - height) / 2;

    this.container = this.scene.add.container(x, y).setDepth(2300).setScrollFactor(0).setVisible(false);

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.95);
    bg.fillRoundedRect(0, 0, width, height, 12);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(0, 0, width, height, 12);
    this.container.add(bg);

    // Título do Jogador Alvo
    const title = this.scene.add.text(width / 2, 18, `⚔️ ${this.targetPlayerName}`, {
      fontFamily: 'Cinzel',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.container.add(title);

    const actions = [
      {
        label: '💬 Mensagem Privada',
        action: () => {
          SoundSynth.playUpgrade();
          this.scene.events.emit('show-notification', `💬 Canal de conversa direta iniciado com ${this.targetPlayerName}`);
        },
      },
      {
        label: '🤝 Convidar p/ Troca Direta',
        action: () => {
          SoundSynth.playUpgrade();
          this.scene.events.emit('show-notification', `🤝 Solicitado troca direta com ${this.targetPlayerName}`);
        },
      },
      {
        label: '⚔️ Convidar p/ Grupo',
        action: () => {
          SoundSynth.playUpgrade();
          this.scene.events.emit('show-notification', `⚔️ Convite de grupo enviado para ${this.targetPlayerName}`);
        },
      },
      {
        label: '🏆 Desafiar p/ Duelo PvP',
        action: () => {
          SoundSynth.playUpgrade();
          this.scene.events.emit('show-notification', `🏆 Desafio de Duelo enviado para ${this.targetPlayerName}`);
        },
      },
    ];

    actions.forEach((act, idx) => {
      const btnY = 46 + idx * 36;
      const btn = this.scene.add.text(width / 2, btnY, act.label, {
        fontFamily: 'Inter',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#1b0e30',
        padding: { x: 14, y: 6 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#331a5c' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#1b0e30' }));
      btn.on('pointerdown', () => {
        act.action();
        this.toggle();
      });

      this.container.add(btn);
    });

    // Botão Fechar
    const closeBtn = this.scene.add.text(width - 15, 12, '✖️', {
      fontSize: '12px', color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggle());
    this.container.add(closeBtn);
  }

  public openForPlayer(playerName: string): void {
    this.targetPlayerName = playerName;
    this.isVisible = true;
    this.container.setVisible(true);
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }
}

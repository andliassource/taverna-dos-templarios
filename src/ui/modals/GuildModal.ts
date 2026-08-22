import Phaser from 'phaser';
import { GuildSystem } from '../../systems/GuildSystem';

export class GuildModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createGuildUI();
  }

  private createGuildUI(): void {
    const width = 500;
    const height = 360;
    const x = (this.scene.scale.width - width) / 2;
    const y = (this.scene.scale.height - height) / 2;

    this.container = this.scene.add.container(x, y).setDepth(2100).setScrollFactor(0).setVisible(false);

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.95);
    bg.fillRoundedRect(0, 0, width, height, 14);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(0, 0, width, height, 14);
    this.container.add(bg);

    const system = GuildSystem.getInstance();
    const guild = system.getCurrentGuild();

    if (!guild) return;

    // Título do Clã
    const title = this.scene.add.text(width / 2, 24, `${guild.emblem} [${guild.tag}] ${guild.name} (Lv.${guild.level})`, {
      fontFamily: 'Cinzel',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.container.add(title);

    // Mensagem do Dia (MOTD) & Tesouro
    const infoText = this.scene.add.text(24, 50, `📢 MOTD: "${guild.motd}"\n💰 Tesouro do Clã: ${guild.goldTreasury} Ouro`, {
      fontFamily: 'Inter',
      fontSize: '11px',
      color: '#cccccc',
    });
    this.container.add(infoText);

    // Botão de Doação
    const donateBtn = this.scene.add.text(width - 140, 52, '💰 DOAR 500 OURO', {
      fontFamily: 'Cinzel',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#1b5e20',
      padding: { x: 8, y: 5 },
    }).setInteractive({ useHandCursor: true });

    donateBtn.on('pointerdown', () => {
      system.depositGold(500);
      alert('🎉 Você doou 500 Ouro para o Tesouro do Clã!');
      infoText.setText(`📢 MOTD: "${guild.motd}"\n💰 Tesouro do Clã: ${guild.goldTreasury} Ouro`);
    });
    this.container.add(donateBtn);

    // Linha Divisória
    const line = this.scene.add.graphics();
    line.lineStyle(1, 0xffd700, 0.5);
    line.lineBetween(20, 90, width - 20, 90);
    this.container.add(line);

    // Título da Lista de Membros
    const memTitle = this.scene.add.text(24, 98, 'MEMBROS DA GUILDA', {
      fontFamily: 'Cinzel', fontSize: '12px', fontStyle: 'bold', color: '#ffd700',
    });
    this.container.add(memTitle);

    // Lista de Membros
    guild.members.forEach((m, idx) => {
      const rowY = 120 + idx * 55;

      const rowBg = this.scene.add.graphics();
      rowBg.fillStyle(0x160c28, 0.8);
      rowBg.fillRoundedRect(20, rowY, width - 40, 48, 6);
      rowBg.lineStyle(1, 0x5a3e10, 0.5);
      rowBg.strokeRoundedRect(20, rowY, width - 40, 48, 6);
      this.container.add(rowBg);

      let roleColor = '#ffffff';
      if (m.role === 'MASTER') roleColor = '#ffd700';
      if (m.role === 'OFFICER') roleColor = '#33ccff';

      const memberTxt = this.scene.add.text(32, rowY + 14, `⚔️ ${m.name} (Lv.${m.level} ${m.classType}) — [${m.role}]`, {
        fontFamily: 'Inter', fontSize: '11.5px', fontStyle: 'bold', color: roleColor,
      });
      this.container.add(memberTxt);
    });

    // Botão Fechar
    const closeBtn = this.scene.add.text(width / 2, height - 25, '✖️ FECHAR', {
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

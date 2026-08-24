import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { GuildSystem } from '../../systems/GuildSystem';
import { SoundSynth } from '../../utils/SoundSynth';

export class GuildModal extends Phaser.GameObjects.Container {
  private onClose?: () => void;

  constructor(scene: Phaser.Scene, onClose?: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onClose = onClose;
    this.setDepth(210);
    this.setVisible(false);

    const pw = 560;
    const ph = 420;
    const px = -pw / 2;
    const py = -ph / 2;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0618, 0.95);
    bg.fillRoundedRect(px, py, pw, ph, 12);
    bg.lineStyle(2, 0xffd700, 0.9);
    bg.strokeRoundedRect(px, py, pw, ph, 12);
    this.add(bg);

    const title = scene.add.text(0, py + 24, '🏰 GUILDA & CLÃ TEMPLÁRIO', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 24, py + 20, '❌', { fontSize: '14px' })
      .setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      if (this.onClose) this.onClose();
      this.setVisible(false);
    });
    this.add(closeBtn);

    scene.add.existing(this);
    this.createGuildContent(px, py);
  }

  public toggle(): void {
    this.setVisible(!this.visible);
  }

  private createGuildContent(px: number, py: number): void {

    const guild = GuildSystem.getInstance().getGuild();

    if (!guild) {
      const text = this.scene.add.text(0, -30, 'Você não possui uma Guilda!', {
        fontFamily: UI_THEME.fonts.title, fontSize: '14px', color: '#ffffff'
      }).setOrigin(0.5);
      this.add(text);
      return;
    }

    // Header da Guilda
    const titleText = this.scene.add.text(px + 40, py + 55, `[${guild.tag}] ${guild.name}`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '15px', color: '#ffd700', fontStyle: 'bold'
    });

    const infoText = this.scene.add.text(px + 40, py + 78, `Nível ${guild.level}  |  Membros: ${guild.members.length}/${guild.maxMembers}  |  EXP: ${guild.exp}`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '11px', color: '#aaaaaa'
    });

    const motdText = this.scene.add.text(px + 40, py + 98, `💬 "${guild.motd}"`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '11px', color: '#87ceeb', fontStyle: 'italic'
    });

    this.add([titleText, infoText, motdText]);

    // Lista de Membros
    const memberY = py + 130;
    guild.members.forEach((m, idx) => {
      const yPos = memberY + idx * 36;
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x1a0d33, 0.85);
      bg.fillRoundedRect(px + 40, yPos, 480, 30, 4);
      bg.lineStyle(1, 0x4a2d6e, 0.6);
      bg.strokeRoundedRect(px + 40, yPos, 480, 30, 4);

      const name = this.scene.add.text(px + 55, yPos + 7, m.name, {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: m.role === 'Mestre' ? '#ffd700' : '#ffffff'
      });

      const role = this.scene.add.text(px + 280, yPos + 7, `[${m.role}]`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '11px', color: '#9b59b6'
      });

      const contrib = this.scene.add.text(px + 410, yPos + 7, `+${m.contribution} EXP`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '11px', color: '#2ecc71'
      });

      this.add([bg, name, role, contrib]);
    });

    // Botão Doar Ouro para a Guilda
    const btnY = py + 360;
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xd4a843, 1);
    btnBg.fillRoundedRect(-100, btnY, 200, 36, 6);
    btnBg.lineStyle(2, 0xffffd0, 1);
    btnBg.strokeRoundedRect(-100, btnY, 200, 36, 6);

    const btnText = this.scene.add.text(0, btnY + 18, '💰 DOAR 100 OURO', {
      fontFamily: UI_THEME.fonts.title, fontSize: '12px', color: '#0a0612', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btnZone = this.scene.add.zone(0, btnY + 18, 200, 36).setInteractive({ useHandCursor: true });
    btnZone.on('pointerdown', () => {
      GuildSystem.getInstance().contribute(100);
      SoundSynth.playBuy();
      this.destroy();
      new GuildModal(this.scene, this.onClose);
    });

    this.add([btnBg, btnText, btnZone]);
  }
}

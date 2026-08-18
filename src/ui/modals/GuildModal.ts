import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';

export class GuildModal extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, onClose: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.setDepth(210);

    const pw = 460;
    const ph = 360;
    const px = -pw / 2;
    const py = -ph / 2;

    this.setScale(0.85);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this, scaleX: 1, scaleY: 1, alpha: 1, duration: 200, ease: 'Back.out',
    });

    const bg = scene.add.graphics();
    bg.fillStyle(UI_THEME.colors.bgDark, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, UI_THEME.colors.borderGold, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, UI_THEME.colors.borderDarkGold, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);
    this.add(bg);

    const title = scene.add.text(0, py + 22, `🏰 GUILDA DOS TEMPLÁRIOS`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 26, py + 14, '✖', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: UI_THEME.colors.textRed
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', onClose);
    this.add(closeBtn);

    const info = scene.add.text(-180, py + 70,
      '🏰 NOME DA GUILDA: Ordem Suprema\n' +
      '⭐ NÍVEL DA GUILDA: Nível 5 (Máximo)\n' +
      '🛡️ BÔNUS DE GUILDA: +15% Defesa | +10% Experiência\n\n' +
      'MEMBROS ATIVOS DA ORDEM:\n' +
      ' • Sir Templário (Lorde Mestre - Nv. 100)\n' +
      ' • Mago Astral (Oficial - Nv. 85)\n' +
      ' • Caçador Silencioso (Membro - Nv. 72)',
      { fontFamily: UI_THEME.fonts.body, fontSize: '11px', color: '#ffffff', lineSpacing: 8 }
    );
    this.add(info);

    const raidBtn = scene.add.text(0, py + ph - 40, '⚔️ INICIAR RAIDE DE GUILDA', {
      fontFamily: UI_THEME.fonts.title, fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#880000', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    raidBtn.on('pointerdown', () => {
      alert('Raide de Guilda em andamento! Enfrente os guardiões no Plano Astral.');
    });
    this.add(raidBtn);

    scene.add.existing(this);
  }
}

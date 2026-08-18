import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { TalentSystem, TalentNode } from '../../systems/TalentSystem';
import { SoundSynth } from '../../utils/SoundSynth';

export class TalentModal extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, onClose: () => void, onRefresh: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.setDepth(210);

    const ts = TalentSystem.getInstance();
    const nodes = ts.getNodes();
    const availablePoints = ts.getAvailablePoints();

    const pw = 520;
    const ph = 390;
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

    const title = scene.add.text(0, py + 22, `✨ ÁRVORE DE TALENTOS DO TEMPLÁRIO`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(title);

    const subtitle = scene.add.text(0, py + 44, `PONTOS DE TALENTO DISPONÍVEIS: ${availablePoints}`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '11px', fontStyle: 'bold', color: UI_THEME.colors.textBlue,
    }).setOrigin(0.5);
    this.add(subtitle);

    const closeBtn = scene.add.text(px + pw - 26, py + 14, '✖', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: UI_THEME.colors.textRed
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', onClose);
    this.add(closeBtn);

    const listY = py + 68;
    const itemH = 60;

    nodes.forEach((t: TalentNode, index: number) => {
      const sy = listY + index * (itemH + 6);

      const itemBg = scene.add.graphics();
      itemBg.fillStyle(0x140d24, 0.9);
      itemBg.fillRoundedRect(px + 20, sy, pw - 40, itemH, 6);
      itemBg.lineStyle(1, t.points > 0 ? UI_THEME.colors.borderGold : 0x332244, 0.7);
      itemBg.strokeRoundedRect(px + 20, sy, pw - 40, itemH, 6);
      this.add(itemBg);

      const icon = scene.add.text(px + 45, sy + itemH / 2, t.icon, { fontSize: '22px' }).setOrigin(0.5);
      const tName = scene.add.text(px + 75, sy + 10, `${t.name} (${t.points}/${t.maxPoints})`, {
        fontFamily: UI_THEME.fonts.title, fontSize: '12px', fontStyle: 'bold',
        color: t.points > 0 ? UI_THEME.colors.textGold : '#ffffff',
      });
      const tDesc = scene.add.text(px + 75, sy + 28, t.description, {
        fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: '#aaaaaa',
      });

      this.add([icon, tName, tDesc]);

      const canUpgrade = availablePoints > 0 && t.points < t.maxPoints;
      const upgradeBtn = scene.add.text(px + pw - 90, sy + itemH / 2, 'MELHORAR ➕', {
        fontFamily: UI_THEME.fonts.title, fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
        backgroundColor: canUpgrade ? '#007733' : '#444444', padding: { x: 8, y: 6 }
      }).setOrigin(0.5);

      if (canUpgrade) {
        upgradeBtn.setInteractive({ useHandCursor: true });
        upgradeBtn.on('pointerdown', () => {
          ts.allocate(t.id);
          SoundSynth.playClick();
          onRefresh();
        });
      }

      this.add(upgradeBtn);
    });

    scene.add.existing(this);
  }
}

import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { QuestSystem } from '../../systems/QuestSystem';
import { SoundSynth } from '../../utils/SoundSynth';

export class QuestModal extends Phaser.GameObjects.Container {
  private onClose?: () => void;
  private onRefresh?: () => void;

  constructor(scene: Phaser.Scene, onClose?: () => void, onRefresh?: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onClose = onClose;
    this.onRefresh = onRefresh;
    this.setDepth(210);
    this.setVisible(false);

    const qs = QuestSystem.getInstance();
    const quests = qs.getQuests();

    const pw = 520;
    const ph = 400;
    const px = -pw / 2;
    const py = -ph / 2;

    const bg = scene.add.graphics();
    bg.fillStyle(UI_THEME.colors.bgDark, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, UI_THEME.colors.borderGold, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, UI_THEME.colors.borderDarkGold, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);
    this.add(bg);

    const title = scene.add.text(0, py + 22, `📜 QUADRO DE MISSÕES MEDIEVAIS`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 26, py + 14, '✖', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: UI_THEME.colors.textRed
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      if (this.onClose) this.onClose();
      this.setVisible(false);
    });
    this.add(closeBtn);

    const listY = py + 58;
    const itemH = 62;

    quests.forEach((q, index) => {
      const sy = listY + index * (itemH + 6);

      const itemBg = scene.add.graphics();
      itemBg.fillStyle(q.completed ? 0x18102a : 0x0c0714, 0.9);
      itemBg.fillRoundedRect(px + 20, sy, pw - 40, itemH, 6);
      itemBg.lineStyle(1, q.completed ? UI_THEME.colors.borderGold : 0x332244, 0.7);
      itemBg.strokeRoundedRect(px + 20, sy, pw - 40, itemH, 6);
      this.add(itemBg);

      let icon: Phaser.GameObjects.GameObject;
      const iconMap: Record<string, string> = {
        '🗡️': 'icon-sword', '🔮': 'icon-staff', '🏹': 'icon-bow', '🪓': 'icon-axe', '🛡️': 'icon-shield',
        '🧪': 'icon-potion_hp', '🔵': 'icon-potion_mp', '💰': 'icon-gold', '📜': 'icon-slash', '👑': 'icon-barrier'
      };
      const spriteKey = iconMap[q.icon || '📜'];
      if (spriteKey && scene.textures.exists(spriteKey)) {
        const spr = scene.add.sprite(px + 45, sy + itemH / 2, spriteKey);
        spr.setDisplaySize(30, 30);
        icon = spr;
      } else {
        icon = scene.add.text(px + 45, sy + itemH / 2, q.icon || '📜', { fontSize: '20px' }).setOrigin(0.5);
      }
      const qTitle = scene.add.text(px + 70, sy + 10, q.title, {
        fontFamily: UI_THEME.fonts.title, fontSize: '12px', fontStyle: 'bold',
        color: q.completed ? UI_THEME.colors.textGold : '#ffffff',
      });
      const qDesc = scene.add.text(px + 70, sy + 28, `${q.description} (${q.currentCount}/${q.targetCount})`, {
        fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: '#aaaaaa',
      });
      const qReward = scene.add.text(px + 70, sy + 44, `Recompensa: 🪙 ${q.goldReward}  |  💎 ${q.gemsReward}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '9px', color: UI_THEME.colors.textBlue,
      });

      this.add([icon, qTitle, qDesc, qReward]);

      if (q.completed && !q.claimed) {
        const claimBtn = scene.add.text(px + pw - 90, sy + itemH / 2, 'RESGATAR', {
          fontFamily: UI_THEME.fonts.title, fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
          backgroundColor: '#008844', padding: { x: 10, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        claimBtn.on('pointerdown', () => {
          (qs as any).claimReward ? (qs as any).claimReward(q.id) : (qs as any).completeQuest?.(q.id);
          SoundSynth.playClick();
          if (this.onRefresh) this.onRefresh();
        });
        this.add(claimBtn);
      } else if (q.claimed) {
        const statusTxt = scene.add.text(px + pw - 90, sy + itemH / 2, 'CONCLUÍDA ✅', {
          fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: '#00ffcc'
        }).setOrigin(0.5);
        this.add(statusTxt);
      } else {
        const statusTxt = scene.add.text(px + pw - 90, sy + itemH / 2, 'EM ANDAMENTO ⏳', {
          fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: '#ffaa00'
        }).setOrigin(0.5);
        this.add(statusTxt);
      }
    });

    scene.add.existing(this);
  }

  public toggle(): void {
    this.setVisible(!this.visible);
  }
}

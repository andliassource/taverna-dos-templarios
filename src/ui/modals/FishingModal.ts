import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { GatheringSystem } from '../../systems/GatheringSystem';
import { SoundManager } from '../../audio/SoundManager';

export class FishingModal extends Phaser.GameObjects.Container {
  private onClose: () => void;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onClose = onClose;
    this.setDepth(210);

    const pw = 540;
    const ph = 380;
    const px = -pw / 2;
    const py = -ph / 2;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0618, 0.95);
    bg.fillRoundedRect(px, py, pw, ph, 12);
    bg.lineStyle(2, 0x3498db, 0.9);
    bg.strokeRoundedRect(px, py, pw, ph, 12);
    this.add(bg);

    const title = scene.add.text(0, py + 24, '🎣 PESCA & COLETA DE RECURSOS', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: '#3498db', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 24, py + 20, '❌', { fontSize: '14px' })
      .setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      onClose();
      this.destroy();
    });
    this.add(closeBtn);

    scene.add.existing(this);
    this.createContent(px, py);
  }

  private createContent(px: number, py: number): void {
    const nodes = GatheringSystem.getInstance().getNodes();
    const startY = py + 65;

    nodes.forEach((node, idx) => {
      const yPos = startY + idx * 60;

      const bg = this.scene.add.graphics();
      bg.fillStyle(0x130a24, 0.9);
      bg.fillRoundedRect(px + 30, yPos, 480, 52, 6);
      bg.lineStyle(1.5, 0x2980b9, 0.8);
      bg.strokeRoundedRect(px + 30, yPos, 480, 52, 6);

      const icon = this.scene.add.text(px + 55, yPos + 26, node.resourceIcon, { fontSize: '22px' }).setOrigin(0.5);
      const name = this.scene.add.text(px + 85, yPos + 10, node.name, {
        fontFamily: UI_THEME.fonts.body, fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
      });
      const desc = this.scene.add.text(px + 85, yPos + 28, `Recurso: ${node.resourceName}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '11px', color: '#aaaaaa'
      });

      // Botão Coletar
      const btnBg = this.scene.add.graphics();
      btnBg.fillStyle(0x3498db, 1);
      btnBg.fillRoundedRect(px + 410, yPos + 12, 85, 28, 4);

      const btnText = this.scene.add.text(px + 452, yPos + 26, 'COLETAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      const btnZone = this.scene.add.zone(px + 452, yPos + 26, 85, 28).setInteractive({ useHandCursor: true });
      btnZone.on('pointerdown', () => {
        const res = GatheringSystem.getInstance().gatherResource(node.id);
        if (res.success) {
          SoundManager.getInstance().playCoinPickup();
          btnText.setText('COLETADO!');
        }
      });

      this.add([bg, icon, name, desc, btnBg, btnText, btnZone]);
    });
  }
}

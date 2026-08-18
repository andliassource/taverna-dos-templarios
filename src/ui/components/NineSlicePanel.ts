import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';

export class NineSlicePanel extends Phaser.GameObjects.Container {
  private panelBg!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    this.panelBg = scene.add.graphics();
    this.drawDecoratedPanel(width, height);
    this.add(this.panelBg);

    // Entrada animada suave (Pop-in com elástico)
    this.setScale(0.85);
    this.setAlpha(0);

    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.out',
    });

    scene.add.existing(this);
  }

  private drawDecoratedPanel(width: number, height: number): void {
    const px = -width / 2;
    const py = -height / 2;

    this.panelBg.clear();

    // Fundo glassmorphism Obsidian
    this.panelBg.fillStyle(UI_THEME.colors.bgDark, 0.96);
    this.panelBg.fillRoundedRect(px, py, width, height, 12);

    // Moldura de Ouro Dupla
    this.panelBg.lineStyle(2.5, UI_THEME.colors.borderGold, 0.95);
    this.panelBg.strokeRoundedRect(px, py, width, height, 12);

    this.panelBg.lineStyle(1, UI_THEME.colors.borderDarkGold, 0.75);
    this.panelBg.strokeRoundedRect(px + 4, py + 4, width - 8, height - 8, 9);

    // Rebites dourados nos 4 cantos
    const corners = [
      [px + 9, py + 9],
      [px + width - 9, py + 9],
      [px + 9, py + height - 9],
      [px + width - 9, py + height - 9],
    ];

    corners.forEach(([cx, cy]) => {
      this.panelBg.fillStyle(0xffd700, 1);
      this.panelBg.fillCircle(cx, cy, 3);
      this.panelBg.lineStyle(1, 0x000000, 0.8);
      this.panelBg.strokeCircle(cx, cy, 3);
    });
  }

  public animateClose(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.85,
      scaleY: 0.85,
      alpha: 0,
      duration: 160,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }
}

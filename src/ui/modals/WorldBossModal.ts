import Phaser from 'phaser';
import { WorldBossEventSystem } from '../../systems/WorldBossEventSystem';

export class WorldBossModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createBossUI();
  }

  private createBossUI(): void {
    const width = 480;
    const height = 300;
    const x = (this.scene.scale.width - width) / 2;
    const y = (this.scene.scale.height - height) / 2;

    this.container = this.scene.add.container(x, y).setDepth(2200).setScrollFactor(0).setVisible(false);

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.95);
    bg.fillRoundedRect(0, 0, width, height, 14);
    bg.lineStyle(2, 0xff3333, 1);
    bg.strokeRoundedRect(0, 0, width, height, 14);
    this.container.add(bg);

    // Título do Evento de Raid
    const title = this.scene.add.text(width / 2, 22, '🐲 PAINEL DE RAIDS & CHEFÕES MUNDIAIS', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ff4444',
    }).setOrigin(0.5);
    this.container.add(title);

    const system = WorldBossEventSystem.getInstance();
    const evt = system.getCurrentEvent();

    if (evt) {
      const box = this.scene.add.graphics();
      box.fillStyle(0x1a0808, 0.9);
      box.fillRoundedRect(20, 52, width - 40, 160, 10);
      box.lineStyle(1.5, 0xff4444, 0.8);
      box.strokeRoundedRect(20, 52, width - 40, 160, 10);
      this.container.add(box);

      const bossTitle = this.scene.add.text(32, 64, `${evt.name}`, {
        fontFamily: 'Cinzel', fontSize: '14px', fontStyle: 'bold', color: '#ffd700',
      });
      this.container.add(bossTitle);

      const bossLoc = this.scene.add.text(32, 88, `📍 Localização: ${evt.location}\n⏳ Tempo Restante: ${evt.timeRemainingMinutes} minutos\n👑 Maior Dano Causado: ${evt.topDamager}`, {
        fontFamily: 'Inter', fontSize: '11.5px', color: '#dddddd',
      });
      this.container.add(bossLoc);

      // Barra de Vida
      const hpBg = this.scene.add.graphics();
      hpBg.fillStyle(0x000000, 0.8);
      hpBg.fillRoundedRect(32, 160, width - 64, 16, 4);
      hpBg.fillStyle(0xcc0000, 1);
      hpBg.fillRoundedRect(32, 160, (width - 64) * (evt.hpPercent / 100), 16, 4);
      this.container.add(hpBg);

      const hpTxt = this.scene.add.text(width / 2, 168, `VIDA DO CHEFÃO: ${evt.hpPercent}%`, {
        fontFamily: 'Cinzel', fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      this.container.add(hpTxt);
    }

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

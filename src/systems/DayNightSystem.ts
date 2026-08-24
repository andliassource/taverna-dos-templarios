import Phaser from 'phaser';

/**
 * DayNightSystem — Gerenciador de Ciclo Dinâmico Dia/Noite e Iluminação
 */
export class DayNightSystem {
  private static instance: DayNightSystem;
  private timeOfDayRatio: number = 0.25; // 0.0 = Meio dia, 0.5 = Por do sol, 0.75 = Noite, 1.0 = Alvorada
  private overlay: Phaser.GameObjects.Graphics | null = null;

  private constructor() {}

  public static getInstance(): DayNightSystem {
    if (!DayNightSystem.instance) {
      DayNightSystem.instance = new DayNightSystem();
    }
    return DayNightSystem.instance;
  }

  public init(scene: Phaser.Scene, worldW: number, worldH: number): void {
    if (this.overlay) {
      this.overlay.destroy();
    }
    this.overlay = scene.add.graphics();
    this.overlay.setDepth(150);
    this.overlay.setScrollFactor(0);

    // Atualiza a cada 5 segundos no jogo
    scene.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.timeOfDayRatio = (this.timeOfDayRatio + 0.02) % 1.0;
        this.updateAmbientLighting(scene, worldW, worldH);
      }
    });

    this.updateAmbientLighting(scene, worldW, worldH);
  }

  private updateAmbientLighting(_scene: Phaser.Scene, _worldW: number, _worldH: number): void {
    if (!this.overlay) return;
    this.overlay.clear();

    // Calcula a opacidade da noite (0.0 no meio dia, até 0.60 na madrugada)
    const nightAlpha = Math.max(0, Math.sin(this.timeOfDayRatio * Math.PI * 2) * 0.55);

    if (nightAlpha > 0.05) {
      this.overlay.fillStyle(0x0a0520, nightAlpha);
      this.overlay.fillRect(0, 0, 1920, 1080);
    }
  }

  public isNight(): boolean {
    return this.timeOfDayRatio > 0.4 && this.timeOfDayRatio < 0.9;
  }
}

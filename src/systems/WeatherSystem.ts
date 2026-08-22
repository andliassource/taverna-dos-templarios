import Phaser from 'phaser';

export type WeatherType = 'SUNNY' | 'RAIN' | 'PETALS' | 'ASHES' | 'SNOW';

export class WeatherSystem {
  private static instance: WeatherSystem;
  private currentScene: Phaser.Scene | null = null;
  private activeEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  private constructor() {}

  public static getInstance(): WeatherSystem {
    if (!WeatherSystem.instance) {
      WeatherSystem.instance = new WeatherSystem();
    }
    return WeatherSystem.instance;
  }

  public setWeather(scene: Phaser.Scene, type: WeatherType): void {
    this.currentScene = scene;
    if (this.activeEmitter) {
      this.activeEmitter.destroy();
      this.activeEmitter = null;
    }

    if (!scene.textures.exists('particle-gold')) return;

    const { width, height } = scene.scale;

    switch (type) {
      case 'RAIN':
        this.activeEmitter = scene.add.particles(0, 0, 'particle-gold', {
          x: { min: 0, max: width * 2 },
          y: -20,
          speedY: { min: 300, max: 500 },
          speedX: { min: -40, max: -20 },
          scaleY: { start: 2.0, end: 0.5 },
          scaleX: { start: 0.2, end: 0.1 },
          alpha: { start: 0.6, end: 0.1 },
          tint: 0x88ccff,
          lifespan: 1200,
          quantity: 4,
          frequency: 30,
        });
        break;

      case 'PETALS':
        this.activeEmitter = scene.add.particles(0, 0, 'particle-gold', {
          x: { min: 0, max: width * 2 },
          y: -20,
          speedY: { min: 30, max: 70 },
          speedX: { min: -20, max: 30 },
          scale: { start: 0.7, end: 0.2 },
          alpha: { start: 0.8, end: 0.1 },
          tint: [0xffb7c5, 0xff69b4, 0xffc0cb],
          lifespan: 5000,
          quantity: 1,
          frequency: 180,
        });
        break;

      case 'ASHES':
        this.activeEmitter = scene.add.particles(0, 0, 'particle-gold', {
          x: { min: 0, max: width * 2 },
          y: height + 20,
          speedY: { min: -40, max: -90 },
          speedX: { min: -15, max: 25 },
          scale: { start: 0.6, end: 0 },
          alpha: { start: 0.8, end: 0 },
          tint: [0xff4400, 0xff8800, 0xffaa00],
          lifespan: 4000,
          quantity: 2,
          frequency: 150,
          blendMode: 'ADD',
        });
        break;
    }

    if (this.activeEmitter) {
      this.activeEmitter.setDepth(150);
      this.activeEmitter.setScrollFactor(0);
    }
  }
}

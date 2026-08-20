import Phaser from 'phaser';
import { SoundSynth } from '../utils/SoundSynth';

export class MountSystem {
  private static instance: MountSystem;
  private isMounted = false;
  private mountType: 'steed' | 'gryphon' = 'steed';
  private mountSpeedMultiplier = 1.6; // +60% velocidade
  private mountSprite: Phaser.GameObjects.Graphics | null = null;

  private constructor() {}

  public static getInstance(): MountSystem {
    if (!MountSystem.instance) {
      MountSystem.instance = new MountSystem();
    }
    return MountSystem.instance;
  }

  public toggleMount(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite): boolean {
    this.isMounted = !this.isMounted;

    if (this.isMounted) {
      SoundSynth.playUpgrade();

      // Criar aura/gráficos da montaria sob o personagem
      if (this.mountSprite) this.mountSprite.destroy();

      this.mountSprite = scene.add.graphics();
      this.mountSprite.fillStyle(0xffd700, 0.45);
      this.mountSprite.fillEllipse(0, 16, 36, 16);
      this.mountSprite.lineStyle(2, 0xffd700, 0.9);
      this.mountSprite.strokeEllipse(0, 16, 36, 16);

      scene.tweens.add({
        targets: this.mountSprite,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });

      player.setY(player.y - 8);
    } else {
      SoundSynth.playLoot();
      if (this.mountSprite) {
        this.mountSprite.destroy();
        this.mountSprite = null;
      }
      player.setY(player.y + 8);
    }

    return this.isMounted;
  }

  public getIsMounted(): boolean {
    return this.isMounted;
  }

  public getSpeedMultiplier(): number {
    return this.isMounted ? this.mountSpeedMultiplier : 1.0;
  }

  public updatePosition(x: number, y: number, depth: number): void {
    if (this.mountSprite) {
      this.mountSprite.setPosition(x, y);
      this.mountSprite.setDepth(depth - 1);
    }
  }
}

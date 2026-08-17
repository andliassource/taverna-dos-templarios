import Phaser from 'phaser';

export class PetEntity extends Phaser.GameObjects.Container {
  private targetPlayer: Phaser.GameObjects.Sprite | null = null;
  private followDistance = 40;
  private moveSpeed = 160;
  private vacuumRadius = 130;
  private petSprite?: Phaser.GameObjects.Text;
  private auraGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, petType: string = 'dragon') {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Sombra do Pet
    const shadow = scene.add.ellipse(0, 10, 16, 6, 0x000000, 0.3);

    // Aura mágica
    this.auraGraphics = scene.add.graphics();
    this.auraGraphics.fillStyle(0xffd700, 0.15);
    this.auraGraphics.fillCircle(0, 0, 18);

    // Ícone do Pet / Sprite HD
    let petVisual: Phaser.GameObjects.GameObject;
    if (petType === 'dragon' && scene.textures.exists('pet-dragon-img')) {
      const spr = scene.add.sprite(0, -4, 'pet-dragon-img');
      spr.setDisplaySize(36, 36);
      spr.setOrigin(0.5);
      petVisual = spr;
    } else {
      const petIcon = petType === 'dragon' ? '🐉' : petType === 'cat' ? '🐱' : petType === 'wolf' ? '🐺' : '🦅';
      this.petSprite = scene.add.text(0, -4, petIcon, { fontSize: '18px' }).setOrigin(0.5);
      petVisual = this.petSprite;
    }

    this.add([shadow, this.auraGraphics, petVisual]);

    // Animação de flutuação
    scene.tweens.add({
      targets: petVisual,
      y: -10,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.setDepth(50);
  }

  public setTarget(player: Phaser.GameObjects.Sprite): void {
    this.targetPlayer = player;
  }

  public update(): void {
    if (!this.targetPlayer) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPlayer.x, this.targetPlayer.y);

    if (dist > this.followDistance) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPlayer.x, this.targetPlayer.y);
      const speed = Math.min(this.moveSpeed, dist * 2);
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }
    } else {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(0, 0);
      }
    }

    if (this.petSprite) {
      if (this.targetPlayer.x < this.x) {
        this.petSprite.setFlipX(true);
      } else if (this.targetPlayer.x > this.x) {
        this.petSprite.setFlipX(false);
      }
    }

    this.setDepth(this.y / 32 + 5);
  }

  public getVacuumRadius(): number {
    return this.vacuumRadius;
  }
}

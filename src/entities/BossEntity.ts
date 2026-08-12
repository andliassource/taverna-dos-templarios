import Phaser from 'phaser';

export interface BossConfig {
  id: string;
  name: string;
  title: string;
  level: number;
  maxHp: number;
  damage: number;
  speed: number;
  xpReward: number;
  goldReward: number;
}

export class BossEntity extends Phaser.GameObjects.Container {
  public config: BossConfig;
  public hp: number;
  public isDead = false;
  public phase = 1; // 1 = Normal, 2 = Enfurecido

  private sprite!: Phaser.GameObjects.Sprite;
  private auraGraphics!: Phaser.GameObjects.Graphics;
  private target: Phaser.GameObjects.Sprite | null = null;
  private lastSkillTime = 0;
  private isCasting = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.config = {
      id: 'lord_malakor',
      name: 'Lord Malakor',
      title: 'O Guardião Caído',
      level: 15,
      maxHp: 2500,
      damage: 40,
      speed: 55,
      xpReward: 1200,
      goldReward: 800,
    };
    this.hp = this.config.maxHp;

    this.createBossVisuals();
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(24, -24, -24);
    body.setCollideWorldBounds(true);
    this.setDepth(100);
  }

  private createBossVisuals(): void {
    const shadow = this.scene.add.ellipse(0, 18, 45, 14, 0x000000, 0.5);

    this.auraGraphics = this.scene.add.graphics();
    this.updateAuraVisual();

    this.sprite = this.scene.add.sprite(0, 0, 'monster-demon_imp');
    this.sprite.setScale(3.5);
    this.sprite.setOrigin(0.5, 0.8);
    this.sprite.setTint(0x8b0000);

    const nameText = this.scene.add.text(0, -52, `👑 Lv.${this.config.level} ${this.config.name}`, {
      fontFamily: 'Cinzel',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ff3333',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const titleText = this.scene.add.text(0, -36, `<${this.config.title}>`, {
      fontFamily: 'MedievalSharp',
      fontSize: '10px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add([shadow, this.auraGraphics, this.sprite, nameText, titleText]);
  }

  private updateAuraVisual(): void {
    this.auraGraphics.clear();
    const color = this.phase === 2 ? 0xff0000 : 0x8a2be2;
    this.auraGraphics.lineStyle(2, color, 0.7);
    this.auraGraphics.fillStyle(color, 0.15);
    this.auraGraphics.strokeCircle(0, 0, 45);
    this.auraGraphics.fillCircle(0, 0, 45);
  }

  public setTarget(target: Phaser.GameObjects.Sprite | null): void {
    this.target = target;
  }

  public update(): void {
    if (this.isDead || !this.active) return;

    // Transição de Fase (Fase 2 aos 50% de HP)
    if (this.phase === 1 && this.hp <= this.config.maxHp * 0.5) {
      this.phase = 2;
      this.updateAuraVisual();
      this.sprite.setTint(0xff0000);
      this.config.speed = 75;

      // Anúncio de Enfurecimento
      this.scene.events.emit('show-boss-banner', '🔥 LORD MALAKOR ENFURECEU! (+50% DANO & VELOCIDADE) 🔥');
    }

    if (!this.target || !this.target.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Movimentação em direção ao jogador
    if (dist > 36 && !this.isCasting) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      body.setVelocity(Math.cos(angle) * this.config.speed, Math.sin(angle) * this.config.speed);
    } else {
      body.setVelocity(0, 0);
    }

    // Execução de Habilidades Especiais do Boss
    const now = this.scene.time.now;
    if (now > this.lastSkillTime + (this.phase === 2 ? 3000 : 5000) && dist < 180) {
      this.executeBossSkill(dist);
    }
  }

  private executeBossSkill(dist: number): void {
    this.lastSkillTime = this.scene.time.now;
    this.isCasting = true;

    const skillType = Math.random();

    if (skillType < 0.5 || this.phase === 2) {
      // Impacto Símico (Terremoto em Área)
      const ring = this.scene.add.graphics();
      ring.setPosition(this.x, this.y);
      ring.fillStyle(0xff3300, 0.4);
      ring.fillCircle(0, 0, 110);
      this.scene.tweens.add({
        targets: ring,
        alpha: 0,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 400,
        onComplete: () => {
          ring.destroy();
          this.isCasting = false;
        }
      });

      if (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 110) {
        this.scene.events.emit('boss-damage-player', this.config.damage * (this.phase === 2 ? 1.4 : 1.0));
      }
    } else {
      // Disparo de Orbes Sombrios em Estrela (8 direções)
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const vx = Math.cos(angle) * 220;
        const vy = Math.sin(angle) * 220;

        const proj = this.scene.physics.add.sprite(this.x, this.y, 'mage-proj');
        proj.setTint(0x8a2be2);
        proj.setDepth(50);
        proj.setVelocity(vx, vy);
        proj.setData('damage', this.config.damage * 0.8);
      }
      this.isCasting = false;
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead) return true;

    this.hp = Math.max(0, this.hp - amount);
    this.scene.events.emit('update-boss-hp', { hp: this.hp, maxHp: this.config.maxHp });

    // Efeito de flash vermelho ao sofrer dano
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active && !this.isDead) {
        this.sprite.setTint(this.phase === 2 ? 0xff0000 : 0x8b0000);
      }
    });

    if (this.hp <= 0) {
      this.isDead = true;
      this.onBossKilled();
      return true;
    }
    return false;
  }

  private onBossKilled(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // Efeito de explosão de luz sagrada
    this.scene.add.particles(this.x, this.y, 'particle-gold', {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 1200,
      quantity: 50,
      tint: 0xffd700,
    });

    this.scene.events.emit('boss-defeated', this.config);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => this.destroy(),
    });
  }
}

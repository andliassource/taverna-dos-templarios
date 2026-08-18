import Phaser from 'phaser';

export interface MonsterConfig {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  damage: number;
  speed: number;
  xpReward: number;
  goldReward: number;
  aggroRadius: number;
  attackRadius: number;
  attackCooldown: number; // ms
  color: number;
}

export const MONSTER_PRESETS: Record<string, MonsterConfig> = {
  GOBLIN: {
    id: 'goblin',
    name: 'Goblin Ladrão',
    level: 1,
    maxHp: 50,
    damage: 8,
    speed: 60,
    xpReward: 25,
    goldReward: 15,
    aggroRadius: 120,
    attackRadius: 28,
    attackCooldown: 1200,
    color: 0x44aa44,
  },
  SKELETON: {
    id: 'skeleton',
    name: 'Esqueleto Templário',
    level: 2,
    maxHp: 80,
    damage: 14,
    speed: 45,
    xpReward: 40,
    goldReward: 25,
    aggroRadius: 140,
    attackRadius: 30,
    attackCooldown: 1500,
    color: 0xcccccc,
  },
  SHADOW_WOLF: {
    id: 'shadow_wolf',
    name: 'Lobo das Sombras',
    level: 3,
    maxHp: 110,
    damage: 18,
    speed: 80,
    xpReward: 60,
    goldReward: 35,
    aggroRadius: 160,
    attackRadius: 32,
    attackCooldown: 1000,
    color: 0x334466,
  },
  DEMON_IMP: {
    id: 'demon_imp',
    name: 'Imp Infernal',
    level: 5,
    maxHp: 180,
    damage: 25,
    speed: 70,
    xpReward: 100,
    goldReward: 70,
    aggroRadius: 180,
    attackRadius: 36,
    attackCooldown: 1100,
    color: 0xcc3333,
  },
};

export class Monster extends Phaser.GameObjects.Container {
  public config: MonsterConfig;
  public hp: number;
  public isDead = false;
  private sprite!: Phaser.GameObjects.Sprite;
  private hpBarGraphics!: Phaser.GameObjects.Graphics;
  private nameText!: Phaser.GameObjects.Text;
  private targetReticle!: Phaser.GameObjects.Graphics;
  private target: Phaser.GameObjects.Sprite | null = null;
  private lastAttackTime = 0;
  private homeX: number;
  private homeY: number;

  public setTint(color: number): this {
    if (this.sprite) this.sprite.setTint(color);
    return this;
  }

  public clearTint(): this {
    if (this.sprite) this.sprite.clearTint();
    return this;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, presetKey: string) {
    super(scene, x, y);
    this.config = { ...MONSTER_PRESETS[presetKey] };
    this.hp = this.config.maxHp;
    this.homeX = x;
    this.homeY = y;

    this.createMonsterVisuals();
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(14, -14, -14);
    body.setCollideWorldBounds(true);

    this.setDepth(y / 32 + 2);
  }

  private createMonsterVisuals(): void {
    // Retículo de mira (oculto por padrão)
    this.targetReticle = this.scene.add.graphics();
    this.targetReticle.lineStyle(2, 0xff0000, 0.8);
    this.targetReticle.strokeCircle(0, 10, 22);
    this.targetReticle.setVisible(false);

    // Sombra sob o monstro
    const shadow = this.scene.add.ellipse(0, 10, 20, 8, 0x000000, 0.35);

    // Sprite Pixel Art (com fallback de segurança para prevenir caixa preta)
    let textureKey = `monster-${this.config.id}`;
    if (!this.scene.textures.exists(textureKey)) {
      const altKey = `monster-${this.config.id.replace('shadow_', '').replace('demon_', '')}`;
      textureKey = this.scene.textures.exists(altKey) ? altKey : 'monster-goblin';
    }

    this.sprite = this.scene.add.sprite(0, 0, textureKey);
    this.sprite.setDisplaySize(64, 70);
    this.sprite.setOrigin(0.5, 0.75);
    this.sprite.setPipeline('Light2D');

    // Nome e Nível acima do monstro
    this.nameText = this.scene.add.text(0, -32, `Lv.${this.config.level} ${this.config.name}`, {
      fontFamily: 'MedievalSharp',
      fontSize: '8px',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5);

    // Barra de Vida flutuante
    this.hpBarGraphics = this.scene.add.graphics();
    this.updateHpBar();

    this.add([this.targetReticle, shadow, this.sprite, this.nameText, this.hpBarGraphics]);
  }

  // Removido drawMonsterBody corporizado via Sprite procedimental

  public updateHpBar(): void {
    this.hpBarGraphics.clear();
    if (this.hp <= 0) return;

    const w = 26;
    const h = 4;
    const x = -w / 2;
    const y = -24;

    // Moldura de Metal Fundido Escuro
    this.hpBarGraphics.fillStyle(0x0e0818, 0.95);
    this.hpBarGraphics.fillRoundedRect(x - 1, y - 1, w + 2, h + 2, 2);

    // Contorno em Ouro Metálico
    this.hpBarGraphics.lineStyle(1, 0xd4af37, 0.9);
    this.hpBarGraphics.strokeRoundedRect(x - 1, y - 1, w + 2, h + 2, 2);

    // Preenchimento de Cristal Rubro proporcional ao HP
    const ratio = Math.max(0, this.hp / this.config.maxHp);
    if (ratio > 0) {
      const fillW = Math.max(1, w * ratio);
      const hpColor = ratio > 0.5 ? 0xdd2222 : ratio > 0.25 ? 0xff7700 : 0xff1111;
      this.hpBarGraphics.fillStyle(hpColor, 1);
      this.hpBarGraphics.fillRect(x, y, fillW, h);

      // Reflexo de cristal no topo da barra
      this.hpBarGraphics.fillStyle(0xffaab3, 0.6);
      this.hpBarGraphics.fillRect(x, y, fillW, 1);
    }
  }

  public setTargeted(isTargeted: boolean): void {
    if (this.targetReticle) {
      this.targetReticle.setVisible(isTargeted);
      if (isTargeted) {
        this.scene.tweens.add({
          targets: this.targetReticle,
          scaleX: 1.2, scaleY: 1.2, alpha: 0.5,
          duration: 500, yoyo: true, repeat: -1
        });
      } else {
        this.scene.tweens.killTweensOf(this.targetReticle);
        this.targetReticle.setScale(1).setAlpha(1);
      }
    }
  }

  public setTarget(player: Phaser.GameObjects.Sprite): void {
    this.target = player;
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead) return false;

    this.hp -= amount;
    this.updateHpBar();

    const isCrit = Math.random() > 0.72;
    if (isCrit) {
      this.scene.cameras.main.shake(100, 0.012);
    }

    // Feedback visual (Hit Flash vermelho ou branco crítico e escala elástica)
    this.sprite.setTint(isCrit ? 0xffffff : 0xff3333);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: isCrit ? 2.5 : 2.2,
      scaleY: isCrit ? 2.5 : 2.2,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        if (this.sprite) this.sprite.clearTint();
      }
    });

    // Knockback físico
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body && this.target) {
      const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
      body.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
      this.scene.time.delayedCall(120, () => {
        if (!this.isDead && body) {
          body.setVelocity(0, 0);
        }
      });
    }

    // Texto de Dano Flutuante
    this.showFloatingDamage(amount, isCrit);

    if (this.hp <= 0) {
      this.die();
      return true; // Morreu
    }
    return false;
  }

  private showFloatingDamage(amount: number, isCrit: boolean): void {
    const dmgText = this.scene.add.text(
      this.x + (Math.random() * 16 - 8),
      this.y - 30,
      `${isCrit ? '💥 ' : ''}${Math.round(amount)}`,
      {
        fontFamily: 'Cinzel',
        fontSize: isCrit ? '16px' : '12px',
        fontStyle: 'bold',
        color: isCrit ? '#ffff00' : '#ff3333',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 35,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => dmgText.destroy(),
    });
  }

  public applyPoisonTint(): void {
    if (this.sprite) {
      this.sprite.setTint(0x00ff00);
      this.scene.time.delayedCall(150, () => {
        if (this.sprite) this.sprite.clearTint();
      });
    }
  }

  private die(): void {
    this.isDead = true;

    // Desativa colisão
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = false;

    // Animação de explosão/desaparecimento do monstro
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 0.2,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  public update(time: number): void {
    if (this.isDead || !this.target) return;

    this.setDepth(this.y / 32 + 2);

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Persegue o jogador se estiver dentro do raio de aggro
    if (dist < this.config.aggroRadius && dist > this.config.attackRadius) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      body.setVelocity(
        Math.cos(angle) * this.config.speed,
        Math.sin(angle) * this.config.speed
      );
    } else if (dist <= this.config.attackRadius) {
      body.setVelocity(0, 0);

      // Ataque ao jogador se o cooldown expirou
      if (time > this.lastAttackTime + this.config.attackCooldown) {
        this.lastAttackTime = time;
        this.attackPlayer();
      }
    } else {
      // Retorna para a posição inicial se o jogador se afastar
      const distHome = Phaser.Math.Distance.Between(this.x, this.y, this.homeX, this.homeY);
      if (distHome > 10) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homeX, this.homeY);
        body.setVelocity(
          Math.cos(angle) * (this.config.speed * 0.5),
          Math.sin(angle) * (this.config.speed * 0.5)
        );
      } else {
        body.setVelocity(0, 0);
      }
    }
  }

  private attackPlayer(): void {
    // Efeito visual de investida de ataque
    this.scene.tweens.add({
      targets: this.sprite,
      x: (this.target!.x - this.x) * 0.3,
      y: (this.target!.y - this.y) * 0.3,
      duration: 100,
      yoyo: true,
    });

    // Emite evento de ataque para a cena tratar o dano no jogador
    this.scene.events.emit('monster-attack-player', {
      monsterName: this.config.name,
      damage: this.config.damage,
    });
  }
}

import Phaser from 'phaser';

export class EntityAnimator {
  /**
   * Adiciona animação contínua de respiração / pulsação idle em qualquer GameObject
   */
  public static addIdleBreathing(scene: Phaser.Scene, target: Phaser.GameObjects.Components.Transform): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleY: { from: 1, to: 1.05 },
      scaleX: { from: 1, to: 0.98 },
      duration: 1200 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Adiciona animação de passos / bobbing de caminhada ao se mover
   */
  public static animateWalkBobbing(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container, isMoving: boolean): void {
    if (isMoving) {
      if (!target.getData('isBobbing')) {
        target.setData('isBobbing', true);
        const baseAngle = target.angle;
        scene.tweens.add({
          targets: target,
          angle: { from: baseAngle - 3, to: baseAngle + 3 },
          duration: 180,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      if (target.getData('isBobbing')) {
        target.setData('isBobbing', false);
        scene.tweens.killTweensOf(target);
        target.setAngle(0);
        this.addIdleBreathing(scene, target);
      }
    }
  }

  /**
   * Cria uma sombra oval dinâmica sob os pés da entidade
   */
  public static createEntityShadow(scene: Phaser.Scene, x: number, y: number, width: number = 32): Phaser.GameObjects.Graphics {
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(0, 0, width, width * 0.4);
    shadow.setPosition(x, y + 16);
    shadow.setDepth(1);
    return shadow;
  }

  /**
   * Animação de acerto / dano com flash vermelho e balanço
   */
  public static animateDamageHit(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container): void {
    scene.tweens.add({
      targets: target,
      x: target.x + (Math.random() > 0.5 ? 6 : -6),
      duration: 60,
      yoyo: true,
      repeat: 3,
      ease: 'Bounce.easeInOut',
    });

    if ('setTint' in target && typeof target.setTint === 'function') {
      target.setTint(0xff3333);
      scene.time.delayedCall(250, () => {
        if (target.active && 'clearTint' in target && typeof target.clearTint === 'function') {
          target.clearTint();
        }
      });
    }
  }

  /**
   * Animação de ataque com investida e arco de corte
   */
  public static animateAttackSwing(scene: Phaser.Scene, attacker: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container, targetX: number, targetY: number, onImpact?: () => void): void {
    const startX = attacker.x;
    const startY = attacker.y;

    scene.tweens.add({
      targets: attacker,
      x: startX + (targetX - startX) * 0.3,
      y: startY + (targetY - startY) * 0.3,
      duration: 140,
      yoyo: true,
      ease: 'Power2.easeOut',
      onYoyo: () => {
        if (onImpact) onImpact();
      },
    });

    this.createWeaponSlashArc(scene, startX, startY, targetX, targetY);
  }

  /**
   * Efeito visual de arco de lâmina de 120° com rastro reluzente de corte
   */
  public static createWeaponSlashArc(scene: Phaser.Scene, x: number, y: number, tx: number, ty: number): void {
    const angle = Phaser.Math.Angle.Between(x, y, tx, ty);
    const distance = 42;

    const arcX = x + Math.cos(angle) * distance;
    const arcY = y + Math.sin(angle) * distance;

    const slashGraphics = scene.add.graphics();
    slashGraphics.setPosition(arcX, arcY);
    slashGraphics.setRotation(angle);
    slashGraphics.setDepth(y / 32 + 50);

    // Desenha lâmina semicircular de neon com gradiente de brilho
    slashGraphics.lineStyle(4, 0xffffff, 0.95);
    slashGraphics.beginPath();
    slashGraphics.arc(0, 0, 24, -Math.PI / 3, Math.PI / 3, false);
    slashGraphics.strokePath();

    slashGraphics.lineStyle(2, 0xffd700, 0.85);
    slashGraphics.beginPath();
    slashGraphics.arc(0, 0, 28, -Math.PI / 3, Math.PI / 3, false);
    slashGraphics.strokePath();

    scene.tweens.add({
      targets: slashGraphics,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      rotation: angle + Math.PI / 2,
      duration: 160,
      ease: 'Quad.easeOut',
      onComplete: () => slashGraphics.destroy(),
    });
  }
}

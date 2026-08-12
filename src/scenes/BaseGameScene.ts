import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { CombatSystem } from '../systems/CombatSystem';
import { SoundSynth } from '../utils/SoundSynth';

import { AchievementSystem } from '../systems/AchievementSystem';
import { PetSystem } from '../systems/PetSystem';

/**
 * BaseGameScene — Classe base compartilhada entre WorldScene e BattleScene.
 * Centraliza: criação do jogador, controles, movimento, dash e visuais de classe.
 */
export abstract class BaseGameScene extends Phaser.Scene {
  protected player!: Phaser.GameObjects.Sprite;
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  protected spaceKey!: Phaser.Input.Keyboard.Key;
  protected currentDirection = 'down';
  protected wallLayer!: Phaser.Tilemaps.TilemapLayer;
  protected playerClass: PlayerClass = PlayerClass.PALADIN;
  protected combatSystem!: CombatSystem;
  protected key1!: Phaser.Input.Keyboard.Key;
  protected key2!: Phaser.Input.Keyboard.Key;
  protected key3!: Phaser.Input.Keyboard.Key;
  protected key4!: Phaser.Input.Keyboard.Key;
  protected shiftKey!: Phaser.Input.Keyboard.Key;
  protected isDashing = false;
  protected lastDashTime = 0;

  private readonly PLAYER_SPEED = 130;
  private readonly DASH_SPEED = 350;
  private readonly DASH_DURATION = 180;
  private readonly DASH_COOLDOWN = 2000;

  protected createPlayerCharacter(startX: number, startY: number, useLightPipeline = false): void {
    this.player = this.add.sprite(startX, startY, `${this.playerClass}-sheet`, 0);
    this.player.setDepth(25);
    this.player.setScale(2.0);
    this.player.setOrigin(0.5, 0.85);

    if (useLightPipeline) {
      this.player.setPipeline('Light2D');
    }

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(TILE_SIZE * 0.6, TILE_SIZE * 0.4);
    body.setOffset(TILE_SIZE * 0.2, TILE_SIZE * 0.6);
    body.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.wallLayer);

    const shadow = this.add.ellipse(0, 8, 22, 9, 0x000000, 0.4);
    shadow.setDepth(24);

    const title = AchievementSystem.getInstance().getEquippedTitle();
    const tagLabel = title ? `[${title}] Templário` : 'Templário';

    const nameTag = this.add.text(0, -32, tagLabel, {
      fontFamily: 'MedievalSharp',
      fontSize: '11px',
      color: title ? '#ffd700' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.events.on('postupdate', () => {
      shadow.setPosition(this.player.x, this.player.y + 4);
      nameTag.setPosition(this.player.x, this.player.y - 34);
      nameTag.setDepth(this.player.depth + 1);

      const curTitle = AchievementSystem.getInstance().getEquippedTitle();
      const updatedTag = curTitle ? `[${curTitle}] Templário` : 'Templário';
      if (nameTag.text !== updatedTag) {
        nameTag.setText(updatedTag);
        nameTag.setColor(curTitle ? '#ffd700' : '#ffffff');
      }

      this.player.setDepth(this.player.y / TILE_SIZE + 2);
    });
  }

  protected setupControls(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
      this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
      this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.wasd = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    this.input.on('pointerdown', () => {
      if (this.combatSystem.getHP() > 0) {
        this.combatSystem.performMeleeAttack(this.player, this.currentDirection, this.time.now);
      }
    });
  }

  protected handleMovementInput(time: number): void {
    if (!this.cursors || !this.player || this.combatSystem.getHP() <= 0) return;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.combatSystem.performMeleeAttack(this.player, this.currentDirection, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      this.combatSystem.useSkill(this.player, 0, this.currentDirection, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      this.combatSystem.useSkill(this.player, 1, this.currentDirection, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      this.combatSystem.useSkill(this.player, 2, this.currentDirection, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key4)) {
      this.combatSystem.useSkill(this.player, 3, this.currentDirection, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
      this.triggerDash(time);
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body || this.isDashing) return;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.a?.isDown) {
      vx = -1; this.currentDirection = 'left';
    } else if (this.cursors.right.isDown || this.wasd.d?.isDown) {
      vx = 1; this.currentDirection = 'right';
    }

    if (this.cursors.up.isDown || this.wasd.w?.isDown) {
      vy = -1; this.currentDirection = 'up';
    } else if (this.cursors.down.isDown || this.wasd.s?.isDown) {
      vy = 1; this.currentDirection = 'down';
    }

    const uiScene = this.scene.get('UIScene') as any;
    if (uiScene?.joystickVector && (uiScene.joystickVector.x !== 0 || uiScene.joystickVector.y !== 0)) {
      vx = uiScene.joystickVector.x;
      vy = uiScene.joystickVector.y;
      this.currentDirection = Math.abs(vx) > Math.abs(vy)
        ? (vx > 0 ? 'right' : 'left')
        : (vy > 0 ? 'down' : 'up');
    }

    if (vx !== 0 || vy !== 0) {
      const length = Math.hypot(vx, vy);
      const speed = this.PLAYER_SPEED * PetSystem.getInstance().getSpeedMultiplier();
      body.setVelocity((vx / length) * speed, (vy / length) * speed);
      this.player.play(`${this.playerClass}-walk-${this.currentDirection}`, true);
    } else {
      body.setVelocity(0, 0);
      this.player.play(`${this.playerClass}-idle-${this.currentDirection}`, true);
    }
  }

  public triggerDash(time: number): void {
    if (time < this.lastDashTime + this.DASH_COOLDOWN) {
      this.combatSystem.showFloatingText(this.player.x, this.player.y - 20, 'Dash em Recarga!', '#ffcc00');
      return;
    }

    this.isDashing = true;
    this.lastDashTime = time;
    SoundSynth.playDash();

    const dirMap: Record<string, [number, number]> = {
      left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1],
    };
    const [dx, dy] = dirMap[this.currentDirection] ?? [0, 0];

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    body.setVelocity(dx * this.DASH_SPEED, dy * this.DASH_SPEED);

    this.add.particles(this.player.x, this.player.y, 'particle-gold', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 300,
      quantity: 8,
      tint: 0xd4af37,
    });

    this.time.addEvent({
      delay: 40,
      repeat: 3,
      callback: () => {
        if (this.player?.active) {
          const ghost = this.add.sprite(this.player.x, this.player.y, `${this.playerClass}-sheet`, this.player.frame.name);
          ghost.setScale(2.0).setOrigin(0.5, 0.85).setAlpha(0.4).setTint(0x3a2010);
          this.tweens.add({ targets: ghost, alpha: 0, duration: 200, onComplete: () => ghost.destroy() });
        }
      },
    });

    this.time.delayedCall(this.DASH_DURATION, () => {
      this.isDashing = false;
      body.setVelocity(0, 0);
    });
  }

  protected applyClassVisuals(): void {
    if (!this.player) return;

    const tintMap: Record<string, number> = {
      [PlayerClass.PALADIN]: 0xfff5cc,
      [PlayerClass.MAGE]: 0xcce6ff,
      [PlayerClass.ARCHER]: 0xccffcc,
      [PlayerClass.ASSASSIN]: 0x777777,
    };

    this.player.setTint(tintMap[this.playerClass] ?? 0xffffff);

    if (this.playerClass === PlayerClass.MAGE) {
      this.add.particles(0, 0, 'particle-gold', {
        speed: { min: 5, max: 15 }, scale: { start: 0.3, end: 0 },
        lifespan: 600, quantity: 1, frequency: 150,
        follow: this.player, followOffset: { x: 0, y: 10 },
        tint: 0x4488ff, blendMode: 'ADD',
      });
    } else if (this.playerClass === PlayerClass.ARCHER) {
      this.add.particles(0, 0, 'particle-gold', {
        speedY: { min: 5, max: 15 }, speedX: { min: -5, max: 5 },
        scale: { start: 0.3, end: 0 }, lifespan: 800, quantity: 1, frequency: 250,
        follow: this.player, followOffset: { x: 0, y: 10 },
        tint: 0x228b22, blendMode: 'ADD',
      });
    }
  }

  protected showResultBanner(text: string, color: string, onComplete: () => void, delay = 3500): void {
    const { width, height } = this.scale;
    const banner = this.add.text(width / 2, height / 2, text, {
      fontFamily: 'Cinzel',
      fontSize: '24px',
      fontStyle: 'bold',
      color,
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.tweens.add({ targets: banner, scaleX: 1.1, scaleY: 1.1, duration: 1000, yoyo: true, repeat: 1 });

    this.time.delayedCall(delay, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', onComplete);
    });
  }
}

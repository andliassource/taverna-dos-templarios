import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { TILE_SIZE } from '../config/game.config';
import { CombatSystem } from '../systems/CombatSystem';
import { SoundSynth } from '../utils/SoundSynth';

import { AchievementSystem } from '../systems/AchievementSystem';
import { EntityAnimator } from '../utils/EntityAnimator';
import { MountSystem } from '../systems/MountSystem';
import { NetworkSystem } from '../systems/NetworkSystem';

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
  protected targetDestination: { x: number; y: number } | null = null;

  private readonly PLAYER_SPEED = 240; // Aumentado para mais fluidez
  private readonly DASH_SPEED = 550;   // Aumentado proporcionalmente
  private readonly DASH_DURATION = 180;
  private readonly DASH_COOLDOWN = 2000;

  protected createPlayerCharacter(x: number, y: number, isHero = true): void {
    if (this.player) this.player.destroy();

    // Sempre usa a spritesheet gerada HD
    const skinKey = `${this.playerClass}-sheet`; 

    this.player = this.physics.add.sprite(x, y, skinKey);
    this.player.setDepth(y / TILE_SIZE + 2);
    
    // O frame real é 64x64 com transparência real — Escala marcante 1.6x estilo Action RPG HD
    this.player.setScale(1.6);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 32);
    body.setOffset(20, 24);
    body.setCollideWorldBounds(true);

    // Aura de Luz Sagrada sob os pés do Herói
    const auraRing = this.add.graphics();
    auraRing.fillStyle(0xffd700, 0.25);
    auraRing.fillCircle(0, 10, 16);
    auraRing.lineStyle(1.5, 0xffd700, 0.7);
    auraRing.strokeCircle(0, 10, 16);

    this.tweens.add({
      targets: auraRing,
      alpha: 0.15,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Colisão com wallLayer (se existir)
    if (this.wallLayer) {
      this.physics.add.collider(this.player, this.wallLayer);
    }

    // Sinaliza que o player foi criado
    this.events.emit('player-created');
    NetworkSystem.getInstance().bindScene(this);

    EntityAnimator.addIdleBreathing(this, this.player);

    const shadow = this.add.ellipse(0, 8, 26, 10, 0x000000, 0.45);
    shadow.setDepth(24);

    // Orbitas de Cristais Rúnicos Mágicos em torno da cabeça do Herói
    const runeOrbit1 = this.add.graphics();
    runeOrbit1.fillStyle(0xffd700, 0.9);
    runeOrbit1.fillCircle(0, 0, 3.5);
    runeOrbit1.lineStyle(1, 0xffffff, 1);
    runeOrbit1.strokeCircle(0, 0, 3.5);

    const runeOrbit2 = this.add.graphics();
    runeOrbit2.fillStyle(0x00ffff, 0.9);
    runeOrbit2.fillCircle(0, 0, 3);
    runeOrbit2.lineStyle(1, 0xffffff, 1);
    runeOrbit2.strokeCircle(0, 0, 3);

    this.events.on('postupdate', () => {
      const t = this.time.now * 0.003;
      const r = 22;
      const px = this.player.x;
      const py = this.player.y - 18;

      auraRing.setPosition(this.player.x, this.player.y);
      auraRing.setDepth(this.player.depth - 1);

      runeOrbit1.setPosition(px + Math.cos(t) * r, py + Math.sin(t) * (r * 0.4));
      runeOrbit1.setDepth(this.player.depth + (Math.sin(t) > 0 ? 2 : -1));

      runeOrbit2.setPosition(px + Math.cos(t + Math.PI) * r, py + Math.sin(t + Math.PI) * (r * 0.4));
      runeOrbit2.setDepth(this.player.depth + (Math.sin(t + Math.PI) > 0 ? 2 : -1));
    });

    const title = AchievementSystem.getInstance().getEquippedTitle();
    const pName = (this.scene.settings.data as any)?.name || (this as any).customPlayerName || 'Templário';
    const tagLabel = title ? `[${title}] ${pName}` : pName;

    const nameTag = this.add.text(0, -32, tagLabel, {
      fontFamily: 'Cinzel',
      fontSize: '11px',
      fontStyle: 'bold',
      color: title ? '#ffd700' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.events.on('postupdate', () => {
      shadow.setPosition(this.player.x, this.player.y + 4);
      nameTag.setPosition(this.player.x, this.player.y - 34);
      nameTag.setDepth(this.player.depth + 1);

      const curTitle = AchievementSystem.getInstance().getEquippedTitle();
      const updatedTag = curTitle ? `[${curTitle}] ${pName}` : pName;
      if (nameTag.text !== updatedTag) {
        nameTag.setText(updatedTag);
        nameTag.setColor(curTitle ? '#ffd700' : '#ffffff');
      }

      this.player.setDepth(this.player.y / TILE_SIZE + 2);
    });

    this.events.on('player-died', () => this.handlePlayerDeathRespawn());
  }

  protected handlePlayerDeathRespawn(): void {
    if ((this as any).isRespawning) return;
    (this as any).isRespawning = true;

    if (this.player) {
      this.player.setTint(0xff2222);
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    const { width, height } = this.scale;

    const deathContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.82);
    overlay.fillRect(0, 0, width, height);
    deathContainer.add(overlay);

    const modalW = 460;
    const modalH = 260;
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a0808, 0.95);
    panel.fillRoundedRect(modalX, modalY, modalW, modalH, 12);
    panel.lineStyle(3, 0xff2222, 1);
    panel.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);
    deathContainer.add(panel);

    const title = this.add.text(width / 2, modalY + 40, '☠️ VOCÊ CAIU EM COMBATE! ☠️', {
      fontFamily: 'Cinzel',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    deathContainer.add(title);

    const sub = this.add.text(width / 2, modalY + 95, 'Seu herói sucumbiu aos ferimentos.\nO poder templário o invocará de volta na Cidade!', {
      fontFamily: 'Inter',
      fontSize: '14px',
      color: '#dddddd',
      align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5);
    deathContainer.add(sub);

    const respawnBtn = this.add.text(width / 2, modalY + 185, '🏰 RENASCER NA TAVERNA DO VILAREJO', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#8b0000',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    respawnBtn.on('pointerover', () => respawnBtn.setStyle({ backgroundColor: '#ff2222' }));
    respawnBtn.on('pointerout', () => respawnBtn.setStyle({ backgroundColor: '#8b0000' }));

    const doRespawn = () => {
      if (!deathContainer.active) return;
      deathContainer.destroy();
      (this as any).isRespawning = false;

      this.combatSystem.setHP(this.combatSystem.getMaxHP());
      this.combatSystem.setMP(this.combatSystem.getMaxMP());

      if (this.player) {
        this.player.clearTint();
        this.physics.world.enable(this.player);
        if (this.player.body) {
          (this.player.body as Phaser.Physics.Arcade.Body).enable = true;
          (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        }
        this.player.setPosition(25 * TILE_SIZE, 28 * TILE_SIZE);
      }

      if (this.scene.key !== 'WorldScene') {
        this.scene.start('WorldScene', { playerClass: this.playerClass });
      }
    };

    respawnBtn.on('pointerdown', doRespawn);
    deathContainer.add(respawnBtn);

    // Timer de auto-renascimento em 5 segundos
    this.time.delayedCall(5000, () => {
      if ((this as any).isRespawning) {
        doRespawn();
      }
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
      const keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      keyM.on('down', () => {
        if (this.player) {
          MountSystem.getInstance().toggleMount(this, this.player);
        }
      });
      this.wasd = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Evita acionar clique ao clicar na Hotbar, HUD superior ou painéis da UI
      if (pointer.y > this.scale.height - 80 || pointer.y < 70) return;
      if (this.combatSystem.getHP() <= 0 || !this.player) return;

      const targetX = pointer.worldX;
      const targetY = pointer.worldY;

      // Define destino de caminhada pelo mouse
      this.targetDestination = { x: targetX, y: targetY };
      this.spawnClickMarker(targetX, targetY);

      // Se clicar próximo ao jogador (< 44px), desfere ataque físico
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
      if (dist < 44) {
        this.aimAtPointer(targetX, targetY);
        this.combatSystem.performMeleeAttack(this.player, this.currentDirection, this.time.now);
      }
    });
  }

  protected spawnClickMarker(x: number, y: number): void {
    const ring = this.add.graphics({ x, y });
    ring.lineStyle(2, 0x00ff88, 1);
    ring.strokeCircle(0, 0, 14);
    ring.fillStyle(0x00ff88, 0.35);
    ring.fillCircle(0, 0, 6);
    ring.setDepth(5);

    this.tweens.add({
      targets: ring,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 450,
      onComplete: () => ring.destroy(),
    });
  }

  protected aimAtPointer(worldX: number, worldY: number): void {
    if (!this.player) return;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldX, worldY);
    const deg = Phaser.Math.RadToDeg(angle);
    if (deg >= -45 && deg <= 45) this.currentDirection = 'right';
    else if (deg > 45 && deg < 135) this.currentDirection = 'down';
    else if (deg <= -45 && deg > -135) this.currentDirection = 'up';
    else this.currentDirection = 'left';
  }

  protected handleMovementInput(time: number): void {
    if (!this.cursors || !this.player || this.combatSystem.getHP() <= 0) return;

    const pointer = this.input.activePointer;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.input.mousePointer.locked || pointer.isDown || pointer.x > 0) this.aimAtPointer(pointer.worldX, pointer.worldY);
      EntityAnimator.playAttackLungeAndStretch(this, this.player, this.currentDirection);
      this.combatSystem.performMeleeAttack(this.player, this.currentDirection, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key1)) {
      if (pointer.x > 0 || pointer.y > 0) this.aimAtPointer(pointer.worldX, pointer.worldY);
      EntityAnimator.playAttackLungeAndStretch(this, this.player, this.currentDirection);
      EntityAnimator.playMagicalShockwaveEffect(this, this.player.x, this.player.y, 0x00ffff);
      this.combatSystem.castActiveSkill(0, this.player, pointer.worldX, pointer.worldY, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key2)) {
      if (pointer.x > 0 || pointer.y > 0) this.aimAtPointer(pointer.worldX, pointer.worldY);
      EntityAnimator.playAttackLungeAndStretch(this, this.player, this.currentDirection);
      EntityAnimator.playMagicalShockwaveEffect(this, this.player.x, this.player.y, 0xff8800);
      this.combatSystem.castActiveSkill(1, this.player, pointer.worldX, pointer.worldY, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key3)) {
      if (pointer.x > 0 || pointer.y > 0) this.aimAtPointer(pointer.worldX, pointer.worldY);
      EntityAnimator.playAttackLungeAndStretch(this, this.player, this.currentDirection);
      EntityAnimator.playMagicalShockwaveEffect(this, this.player.x, this.player.y, 0xaa00ff);
      this.combatSystem.castActiveSkill(2, this.player, pointer.worldX, pointer.worldY, time);
    }
    if (Phaser.Input.Keyboard.JustDown(this.key4)) {
      if (pointer.x > 0 || pointer.y > 0) this.aimAtPointer(pointer.worldX, pointer.worldY);
      EntityAnimator.playAttackLungeAndStretch(this, this.player, this.currentDirection);
      EntityAnimator.playMagicalShockwaveEffect(this, this.player.x, this.player.y, 0xffd700);
      this.combatSystem.castActiveSkill(3, this.player, pointer.worldX, pointer.worldY, time);
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

    const speedMult = MountSystem.getInstance().getSpeedMultiplier();
    const finalSpeed = this.PLAYER_SPEED * speedMult;

    if (vx !== 0 || vy !== 0) {
      this.targetDestination = null;
      const length = Math.hypot(vx, vy);
      vx /= length;
      vy /= length;

      body.setVelocity(vx * finalSpeed, vy * finalSpeed);
      this.player.play(`${this.playerClass}-walk-${this.currentDirection}`, true);
      MountSystem.getInstance().updatePosition(this.player.x, this.player.y, this.player.depth);
    } else if (this.targetDestination) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetDestination.x, this.targetDestination.y);
      if (dist > 8) {
        this.aimAtPointer(this.targetDestination.x, this.targetDestination.y);
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.targetDestination.x, this.targetDestination.y);
        body.setVelocity(Math.cos(angle) * finalSpeed, Math.sin(angle) * finalSpeed);
        this.player.play(`${this.playerClass}-walk-${this.currentDirection}`, true);
        MountSystem.getInstance().updatePosition(this.player.x, this.player.y, this.player.depth);
      } else {
        this.targetDestination = null;
        body.setVelocity(0, 0);
        this.player.play(`${this.playerClass}-idle-${this.currentDirection}`, true);
      }
    } else {
      body.setVelocity(0, 0);
      this.player.play(`${this.playerClass}-idle-${this.currentDirection}`, true);
    }

    NetworkSystem.getInstance().update(time);
  }

  protected spawnFootstepDust(): void {
    if (this.player && (this.player.body as Phaser.Physics.Arcade.Body).speed > 10) {
      if (Math.random() < 0.25) {
        const dust = this.add.circle(
          this.player.x + (Math.random() * 8 - 4),
          this.player.y + 12,
          Phaser.Math.Between(2, 5),
          0xd4af37, 0.45
        );
        dust.setDepth(this.player.depth - 1);
        this.tweens.add({
          targets: dust,
          scale: 1.8,
          alpha: 0,
          y: dust.y - 6,
          duration: 350,
          onComplete: () => dust.destroy(),
        });

        // Rastro de Fantasma Reluzente (Ghosting Speed Trail)
        const ghost = this.add.sprite(this.player.x, this.player.y, this.player.texture.key, this.player.frame.name);
        ghost.setScale(this.player.scaleX, this.player.scaleY);
        ghost.setFlipX(this.player.flipX);
        ghost.setDepth(this.player.depth - 1);
        ghost.setTint(0xffd700);
        ghost.setAlpha(0.3);

        this.tweens.add({
          targets: ghost,
          alpha: 0,
          scaleX: this.player.scaleX * 1.08,
          scaleY: this.player.scaleY * 1.08,
          duration: 220,
          onComplete: () => ghost.destroy(),
        });
      }
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

    const dashEmitter = this.add.particles(this.player.x, this.player.y, 'particle-gold', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 300,
      quantity: 8,
      tint: [0xffffff, 0xaaddff],
      blendMode: 'ADD'
    });
    this.time.delayedCall(400, () => dashEmitter.destroy());
    this.time.addEvent({
      delay: 40,
      repeat: 3,
      callback: () => {
        if (this.player?.active) {
          const ghost = this.add.sprite(this.player.x, this.player.y, `${this.playerClass}-sheet`, this.player.frame.name);
          ghost.setScale(1.2).setOrigin(0.5, 0.85).setAlpha(0.4).setTint(0x3a2010);
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

    // Garante que o sprite do jogador exiba suas cores originais vibrantes sem tintas escuras
    this.player.clearTint();

    // Aura Dourada Mística dos Templários sob os pés do Herói
    const auraGraphics = this.add.graphics();
    auraGraphics.lineStyle(1.5, 0xffd700, 0.6);
    auraGraphics.strokeCircle(0, 0, 16);
    auraGraphics.lineStyle(1, 0xffaa00, 0.4);
    auraGraphics.strokeCircle(0, 0, 12);
    auraGraphics.fillStyle(0xffd700, 0.08);
    auraGraphics.fillCircle(0, 0, 16);

    const auraContainer = this.add.container(this.player.x, this.player.y + 12, [auraGraphics]);
    auraContainer.setDepth(this.player.depth - 1);

    this.tweens.add({
      targets: auraContainer,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.4,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.events.on('update', () => {
      if (this.player && auraContainer.active) {
        auraContainer.setPosition(this.player.x, this.player.y + 12);
        auraContainer.setDepth(this.player.depth - 1);
      }
    });

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

  protected sortDepths(): void {
    if (this.player) {
      this.player.setDepth(this.player.y);
    }
    const pet = (this as any).pet;
    if (pet && pet.sprite && pet.sprite.active) {
      pet.sprite.setDepth(pet.sprite.y);
    }
  }
}

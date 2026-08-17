import Phaser from 'phaser';
import { BaseGameScene } from '../scenes/BaseGameScene';
import { TILE_SIZE } from '../config/game.config';
import { SoundSynth } from '../utils/SoundSynth';

export class RaidBossEntity extends Phaser.GameObjects.Container {
  public scene!: BaseGameScene;
  private sprite: Phaser.GameObjects.Sprite;
  private hpBar: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;

  private hp = 2500;
  private maxHp = 2500;
  public isDead = false;
  private lastAttackTime = 0;

  constructor(scene: BaseGameScene, x: number, y: number) {
    super(scene, x, y);
    this.scene = scene;

    this.sprite = scene.add.sprite(0, 0, 'boss-malakor');
    this.sprite.setScale(1.2);
    this.add(this.sprite);

    this.nameText = scene.add.text(0, -52, '👑 OGRO DAS SOMBRAS (WORLD BOSS)', {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(this.nameText);

    this.hpBar = scene.add.graphics();
    this.add(this.hpBar);
    this.drawHPBar();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 48);
    body.setOffset(-24, -24);

    this.setDepth(y / TILE_SIZE + 5);
  }

  private drawHPBar(): void {
    this.hpBar.clear();
    const w = 120;
    const h = 8;
    const x = -w / 2;
    const y = -38;

    this.hpBar.fillStyle(0x0e0818, 0.9);
    this.hpBar.fillRoundedRect(x, y, w, h, 3);
    this.hpBar.lineStyle(1, 0xffd700, 0.8);
    this.hpBar.strokeRoundedRect(x, y, w, h, 3);

    const ratio = Math.max(0, this.hp / this.maxHp);
    if (ratio > 0) {
      this.hpBar.fillStyle(0xff2222, 1);
      this.hpBar.fillRoundedRect(x + 1, y + 1, (w - 2) * ratio, h - 2, 2);
    }
  }

  public takeDamage(dmg: number): void {
    if (this.isDead) return;
    this.hp -= dmg;
    this.drawHPBar();
    this.scene.combatSystem.showFloatingText(this.x, this.y - 30, `-${dmg}`, '#ff4444');

    if (this.hp <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;
    SoundSynth.playLoot();
    this.scene.combatSystem.showFloatingText(this.x, this.y - 40, '🏆 WORLD BOSS DERROTADO!', '#ffd700');
    this.scene.combatSystem.addGold(1000);
    this.scene.combatSystem.addGems(20);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 1000,
      onComplete: () => this.destroy(),
    });
  }

  public updateBoss(time: number, player: Phaser.GameObjects.Sprite): void {
    if (this.isDead || !player) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 300 && time - this.lastAttackTime > 4000) {
      this.lastAttackTime = time;
      this.performAOESwipe(player.x, player.y);
    }
  }

  private performAOESwipe(px: number, py: number): void {
    // Zona vermelha de perigo telegrafada
    const zone = this.scene.add.graphics();
    zone.fillStyle(0xff0000, 0.35);
    zone.fillCircle(px, py, 60);
    zone.lineStyle(2, 0xff0000, 0.9);
    zone.strokeCircle(px, py, 60);
    zone.setDepth(10);

    this.scene.time.delayedCall(1200, () => {
      zone.destroy();
      const strike = this.scene.add.graphics();
      strike.fillStyle(0xff4400, 0.7);
      strike.fillCircle(px, py, 60);
      strike.setDepth(12);

      const pDist = Phaser.Math.Distance.Between(this.scene.player.x, this.scene.player.y, px, py);
      if (pDist <= 60) {
        this.scene.combatSystem.takeDamage(45);
      }

      this.scene.tweens.add({
        targets: strike,
        alpha: 0,
        duration: 400,
        onComplete: () => strike.destroy(),
      });
    });
  }
}

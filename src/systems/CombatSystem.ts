import Phaser from 'phaser';
import { Monster } from '../entities/Monster';

export interface LootDrop {
  id: string;
  name: string;
  type: 'gold' | 'gem' | 'item';
  amount: number;
  sprite: Phaser.GameObjects.Container;
  x: number;
  y: number;
}

export class CombatSystem {
  private scene: Phaser.Scene;
  private monsters: Monster[] = [];
  private lootDrops: LootDrop[] = [];
  private playerHp = 100;
  private maxPlayerHp = 100;
  private playerMp = 50;
  private maxPlayerMp = 50;
  private playerLevel = 1;
  private playerXp = 0;
  private playerMaxXp = 100;
  private gold = 500;
  private gems = 10;
  private lastPlayerAttackTime = 0;
  private attackCooldown = 400; // ms

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupListeners();
  }

  private setupListeners(): void {
    // Evento de dano recebido do monstro
    this.scene.events.on('monster-attack-player', (data: { monsterName: string; damage: number }) => {
      this.takePlayerDamage(data.damage);
    });
  }

  public registerMonster(monster: Monster): void {
    this.monsters.push(monster);
  }

  public performMeleeAttack(
    player: Phaser.GameObjects.Sprite,
    direction: string,
    time: number
  ): void {
    if (time < this.lastPlayerAttackTime + this.attackCooldown) return;
    this.lastPlayerAttackTime = time;

    // Calcula offset e rotação do golpe baseado na direção
    let offsetX = 0;
    let offsetY = 0;
    let angle = 0;

    switch (direction) {
      case 'left':
        offsetX = -24;
        angle = Math.PI;
        break;
      case 'right':
        offsetX = 24;
        angle = 0;
        break;
      case 'up':
        offsetY = -24;
        angle = -Math.PI / 2;
        break;
      case 'down':
        offsetY = 24;
        angle = Math.PI / 2;
        break;
    }

    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;

    // Efeito de Corte Sagrado (Slash Arc Dourado do Paladino)
    this.createHolySlashEffect(attackX, attackY, angle);

    // Dano base do Paladino
    const baseDamage = 25 + Math.floor(Math.random() * 10);

    // Verifica colisões com os monstros próximos
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;

      const dist = Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y);
      if (dist < 32) {
        const died = monster.takeDamage(baseDamage);
        if (died) {
          this.onMonsterKilled(monster);
        }
      }
    });
  }

  private createHolySlashEffect(x: number, y: number, angle: number): void {
    const slash = this.scene.add.graphics();
    slash.setDepth(50);
    slash.setPosition(x, y);

    // Arco dourado
    slash.lineStyle(3, 0xffd700, 1);
    slash.fillStyle(0xffffff, 0.8);

    slash.beginPath();
    slash.arc(0, 0, 20, angle - 0.8, angle + 0.8, false);
    slash.strokePath();

    // Partículas de luz sagrada
    this.scene.add.particles(x, y, 'particle-gold', {
      speed: { min: 40, max: 100 },
      angle: { min: Phaser.Math.RadToDeg(angle) - 40, max: Phaser.Math.RadToDeg(angle) + 40 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 250,
      quantity: 8,
      blendMode: 'ADD',
    });

    // Fade out do arco
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      onComplete: () => slash.destroy(),
    });
  }

  private onMonsterKilled(monster: Monster): void {
    // Recompensa de XP
    this.playerXp += monster.config.xpReward;
    if (this.playerXp >= this.playerMaxXp) {
      this.levelUp();
    }

    // Drop de Loot no chão
    this.spawnLoot(monster.x, monster.y, monster.config.goldReward);

    // Atualiza o HUD
    this.emitStateUpdate();
  }

  private levelUp(): void {
    this.playerLevel++;
    this.playerXp -= this.playerMaxXp;
    this.playerMaxXp = Math.floor(this.playerMaxXp * 1.5);
    this.maxPlayerHp += 20;
    this.playerHp = this.maxPlayerHp;
    this.maxPlayerMp += 10;
    this.playerMp = this.maxPlayerMp;

    // Efeito visual de Level Up
    this.scene.events.emit('player-level-up', { level: this.playerLevel });
  }

  private spawnLoot(x: number, y: number, goldAmount: number): void {
    const container = this.scene.add.container(x, y);
    container.setDepth(y / 32 + 1);

    // Brilho sob o item
    const glow = this.scene.add.graphics();
    glow.fillStyle(0xffd700, 0.3);
    glow.fillCircle(0, 0, 10);

    // Ícone da moeda de ouro
    const coin = this.scene.add.text(0, 0, '🪙', { fontSize: '12px' }).setOrigin(0.5);

    container.add([glow, coin]);

    // Animação de flutuação
    this.scene.tweens.add({
      targets: container,
      y: y - 6,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const drop: LootDrop = {
      id: `loot_${Date.now()}_${Math.random()}`,
      name: 'Moedas de Ouro',
      type: 'gold',
      amount: goldAmount,
      sprite: container,
      x,
      y,
    };

    this.lootDrops.push(drop);
  }

  public updateLootCollection(playerX: number, playerY: number): void {
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const drop = this.lootDrops[i];
      const dist = Phaser.Math.Distance.Between(playerX, playerY, drop.x, drop.y);

      if (dist < 24) {
        // Coletou o item!
        this.gold += drop.amount;

        // Efeito de coleta (moeda voa em direção ao HUD)
        this.scene.tweens.add({
          targets: drop.sprite,
          y: drop.y - 20,
          scale: 1.5,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            drop.sprite.destroy();
          },
        });

        this.lootDrops.splice(i, 1);
        this.emitStateUpdate();
      }
    }
  }

  private takePlayerDamage(amount: number): void {
    this.playerHp = Math.max(0, this.playerHp - amount);
    this.emitStateUpdate();

    // Se o HP zerou
    if (this.playerHp <= 0) {
      this.scene.events.emit('player-died');
    }
  }

  private emitStateUpdate(): void {
    this.scene.events.emit('update-hud-state', {
      hp: this.playerHp,
      maxHp: this.maxPlayerHp,
      mp: this.playerMp,
      maxMp: this.maxPlayerMp,
      xp: this.playerXp,
      maxXp: this.playerMaxXp,
      level: this.playerLevel,
      gold: this.gold,
      gems: this.gems,
    });
  }

  public updateMonsters(time: number): void {
    this.monsters.forEach((monster) => {
      if (!monster.isDead) monster.update(time);
    });
  }

  // ==================== GETTERS & SETTERS ====================
  public getHP(): number { return this.playerHp; }
  public setHP(val: number): void { this.playerHp = val; this.emitStateUpdate(); }
  public getMaxHP(): number { return this.maxPlayerHp; }
  public setMaxHP(val: number): void { this.maxPlayerHp = val; this.emitStateUpdate(); }
  public getMP(): number { return this.playerMp; }
  public setMP(val: number): void { this.playerMp = val; this.emitStateUpdate(); }
  public getMaxMP(): number { return this.maxPlayerMp; }
  public setMaxMP(val: number): void { this.maxPlayerMp = val; this.emitStateUpdate(); }
  public getLevel(): number { return this.playerLevel; }
  public setLevel(val: number): void { this.playerLevel = val; this.emitStateUpdate(); }
  public getXP(): number { return this.playerXp; }
  public setXP(val: number): void { this.playerXp = val; this.emitStateUpdate(); }
  public getMaxXP(): number { return this.playerMaxXp; }
  public setMaxXP(val: number): void { this.playerMaxXp = val; this.emitStateUpdate(); }
  public getGold(): number { return this.gold; }
  public setGold(val: number): void { this.gold = val; this.emitStateUpdate(); }
  public getGems(): number { return this.gems; }
  public setGems(val: number): void { this.gems = val; this.emitStateUpdate(); }
}

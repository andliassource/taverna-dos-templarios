import Phaser from 'phaser';
import { Monster } from '../entities/Monster';
import { PlayerClass } from '../../shared/types';

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

  private playerClass: PlayerClass = PlayerClass.PALADIN;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private lastRegenTime = 0;
  private regenInterval = 1000; // 1s

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Inicializa grupo de projéteis com física
    this.projectiles = this.scene.physics.add.group();
    
    // Colisor entre projéteis e a camada de paredes
    const wallLayer = (this.scene as any).wallLayer;
    if (wallLayer) {
      this.scene.physics.add.collider(this.projectiles, wallLayer, (proj: any) => {
        this.destroyProjectile(proj);
      });
    }

    this.createProjectileTextures();
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
    
    // Registra overlap do projétil com o monstro
    this.scene.physics.add.overlap(this.projectiles, monster, (proj: any, m: any) => {
      this.handleProjectileHit(proj, monster);
    });
  }

  public performMeleeAttack(
    player: Phaser.GameObjects.Sprite,
    direction: string,
    time: number
  ): void {
    if (time < this.lastPlayerAttackTime + this.attackCooldown) return;

    if (this.playerClass === PlayerClass.PALADIN) {
      this.executePaladinAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.MAGE) {
      this.executeMageAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.ARCHER) {
      this.executeArcherAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.ASSASSIN) {
      this.executeAssassinAttack(player, direction, time);
    }
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

  public setPlayerClass(playerClass: PlayerClass): void {
    this.playerClass = playerClass;
    this.initializeClassStats();
  }

  private initializeClassStats(): void {
    switch (this.playerClass) {
      case PlayerClass.PALADIN:
        this.maxPlayerHp = 130;
        this.playerHp = 130;
        this.maxPlayerMp = 40;
        this.playerMp = 40;
        this.attackCooldown = 400; // Golpe rápido
        break;
      case PlayerClass.MAGE:
        this.maxPlayerHp = 70;
        this.playerHp = 70;
        this.maxPlayerMp = 100;
        this.playerMp = 100;
        this.attackCooldown = 600; // Tempo de cast
        break;
      case PlayerClass.ARCHER:
        this.maxPlayerHp = 90;
        this.playerHp = 90;
        this.maxPlayerMp = 50;
        this.playerMp = 50;
        this.attackCooldown = 300; // Disparos rápidos
        break;
      case PlayerClass.ASSASSIN:
        this.maxPlayerHp = 85;
        this.playerHp = 85;
        this.maxPlayerMp = 45;
        this.playerMp = 45;
        this.attackCooldown = 800; // Recarga alta por causa do dash
        break;
    }
    this.emitStateUpdate();
  }

  public update(time: number): void {
    // Regeneração de Mana e HP passiva
    if (time > this.lastRegenTime + this.regenInterval) {
      this.lastRegenTime = time;
      this.regenerateStats();
    }

    // Atualiza monstros
    this.updateMonsters(time);
  }

  private regenerateStats(): void {
    if (this.playerHp <= 0) return;

    let mpRegen = 1;
    let hpRegen = 0;

    if (this.playerClass === PlayerClass.MAGE) {
      mpRegen = 4; // Mago regenera muito mais mana
    } else if (this.playerClass === PlayerClass.PALADIN) {
      hpRegen = 1; // Paladino regenera vida passivamente
    }

    let changed = false;
    if (mpRegen > 0 && this.playerMp < this.maxPlayerMp) {
      this.playerMp = Math.min(this.maxPlayerMp, this.playerMp + mpRegen);
      changed = true;
    }
    if (hpRegen > 0 && this.playerHp < this.maxPlayerHp) {
      this.playerHp = Math.min(this.maxPlayerHp, this.playerHp + hpRegen);
      changed = true;
    }

    if (changed) {
      this.emitStateUpdate();
    }
  }

  public updateMonsters(time: number): void {
    this.monsters.forEach((monster) => {
      if (!monster.isDead) monster.update(time);
    });
  }

  private executePaladinAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    let offsetX = 0; let offsetY = 0; let angle = 0;
    switch (direction) {
      case 'left': offsetX = -24; angle = Math.PI; break;
      case 'right': offsetX = 24; angle = 0; break;
      case 'up': offsetY = -24; angle = -Math.PI / 2; break;
      case 'down': offsetY = 24; angle = Math.PI / 2; break;
    }
    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;
    this.createHolySlashEffect(attackX, attackY, angle);

    const baseDamage = 25 + Math.floor(Math.random() * 10);
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      const dist = Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y);
      if (dist < 32) {
        const died = monster.takeDamage(baseDamage);
        if (died) this.onMonsterKilled(monster);
      }
    });
  }

  private executeMageAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    if (this.playerMp < 10) {
      this.showFloatingText(player.x, player.y - 20, 'Mana Insuficiente!', '#4488ff');
      return;
    }
    this.playerMp -= 10;
    this.emitStateUpdate();
    this.lastPlayerAttackTime = time;

    let vx = 0; let vy = 0; let angle = 0;
    switch (direction) {
      case 'left': vx = -250; angle = Math.PI; break;
      case 'right': vx = 250; angle = 0; break;
      case 'up': vy = -250; angle = -Math.PI / 2; break;
      case 'down': vy = 250; angle = Math.PI / 2; break;
    }

    const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'mage-proj');
    proj.setDepth(40);
    proj.setVelocity(vx, vy);
    proj.setRotation(angle);
    proj.setData('damage', 35 + Math.floor(Math.random() * 10));
    proj.setData('type', 'mage');
    this.projectiles.add(proj);

    // Partículas ao atirar
    this.scene.add.particles(player.x, player.y - 8, 'particle-gold', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 200,
      quantity: 4,
      tint: 0x8a2be2,
      blendMode: 'ADD',
    });
  }

  private executeArcherAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;

    let vx = 0; let vy = 0; let angle = 0;
    switch (direction) {
      case 'left': vx = -380; angle = Math.PI; break;
      case 'right': vx = 380; angle = 0; break;
      case 'up': vy = -380; angle = -Math.PI / 2; break;
      case 'down': vy = 380; angle = Math.PI / 2; break;
    }

    const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'arrow-proj');
    proj.setDepth(40);
    proj.setVelocity(vx, vy);
    proj.setRotation(angle);
    proj.setData('damage', 20 + Math.floor(Math.random() * 6));
    proj.setData('type', 'archer');
    this.projectiles.add(proj);
  }

  private executeAssassinAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;

    let dx = 0; let dy = 0;
    switch (direction) {
      case 'left': dx = -80; break;
      case 'right': dx = 80; break;
      case 'up': dy = -80; break;
      case 'down': dy = 80; break;
    }

    const targetX = player.x + dx;
    const targetY = player.y + dy;

    const body = player.body as Phaser.Physics.Arcade.Body;
    if (body) body.checkCollision.none = true;

    // Rastro visual do dash
    for (let i = 1; i <= 3; i++) {
      const gx = player.x + (dx * i / 4);
      const gy = player.y + (dy * i / 4);
      const ghost = this.scene.add.sprite(gx, gy, 'player-sheet', player.frame.name);
      ghost.setScale(player.scaleX);
      ghost.setOrigin(player.originX, player.originY);
      ghost.setAlpha(0.4);
      ghost.setTint(0x333333);
      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 200,
        onComplete: () => ghost.destroy(),
      });
    }

    player.setPosition(targetX, targetY);

    // Efeito de fumaça preta/corte
    const slash = this.scene.add.graphics();
    slash.setDepth(50);
    slash.setPosition(targetX, targetY);
    slash.lineStyle(2, 0x555555, 1);
    slash.fillStyle(0x111111, 0.7);
    slash.strokeCircle(0, 0, 32);
    this.scene.tweens.add({
      targets: slash,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 150,
      onComplete: () => slash.destroy(),
    });

    const baseDamage = 40 + Math.floor(Math.random() * 15);
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      const dist = Phaser.Math.Distance.Between(targetX, targetY, monster.x, monster.y);
      if (dist < 40) {
        const died = monster.takeDamage(baseDamage);
        if (died) this.onMonsterKilled(monster);
      }
    });

    this.scene.time.delayedCall(100, () => {
      if (body) body.checkCollision.none = false;
    });
  }

  private handleProjectileHit(projectile: Phaser.Physics.Arcade.Sprite, monster: Monster): void {
    if (monster.isDead) return;
    
    const damage = projectile.getData('damage');
    const isMage = projectile.getData('type') === 'mage';
    
    this.destroyProjectile(projectile);
    
    if (isMage) {
      this.createMageExplosionEffect(projectile.x, projectile.y);
      this.monsters.forEach((m) => {
        if (m.isDead) return;
        const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, m.x, m.y);
        if (dist < 48) {
          const died = m.takeDamage(damage);
          if (died) this.onMonsterKilled(m);
        }
      });
    } else {
      const died = monster.takeDamage(damage);
      if (died) {
        this.onMonsterKilled(monster);
      }
    }
  }

  private destroyProjectile(projectile: Phaser.Physics.Arcade.Sprite): void {
    projectile.destroy();
  }

  private createMageExplosionEffect(x: number, y: number): void {
    const expl = this.scene.add.graphics();
    expl.setDepth(50);
    expl.setPosition(x, y);
    expl.fillStyle(0x8a2be2, 0.6);
    expl.fillCircle(0, 0, 24);

    this.scene.add.particles(x, y, 'particle-gold', {
      speed: { min: 30, max: 70 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 12,
      tint: 0x9400d3,
      blendMode: 'ADD',
    });

    this.scene.tweens.add({
      targets: expl,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => expl.destroy(),
    });
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const fText = this.scene.add.text(x, y, text, {
      fontFamily: 'Cinzel',
      fontSize: '10px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: fText,
      y: y - 24,
      alpha: 0,
      duration: 800,
      onComplete: () => fText.destroy(),
    });
  }

  private createProjectileTextures(): void {
    if (!this.scene.textures.exists('arrow-proj')) {
      const arrowCanvas = this.scene.textures.createCanvas('arrow-proj', 16, 4);
      if (arrowCanvas) {
        const ctx = arrowCanvas.getContext();
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(0, 1, 12, 2);
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(16, 2);
        ctx.lineTo(12, 4);
        ctx.fill();
        arrowCanvas.refresh();
      }
    }

    if (!this.scene.textures.exists('mage-proj')) {
      const mageCanvas = this.scene.textures.createCanvas('mage-proj', 12, 12);
      if (mageCanvas) {
        const ctx = mageCanvas.getContext();
        const grad = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#8a2be2');
        grad.addColorStop(1, 'rgba(138, 43, 226, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 12, 12);
        mageCanvas.refresh();
      }
    }
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

import Phaser from 'phaser';
import { Monster } from '../entities/Monster';
import { PlayerClass, ActiveSkill, SkillType } from '../../shared/types';
import { Item } from '../../shared/types/item.types';
import { SoundSynth } from '../utils/SoundSynth';
import { AchievementSystem } from './AchievementSystem';
import { QuestSystem } from './QuestSystem';
import { TalentSystem } from './TalentSystem';
import { PetSystem } from './PetSystem';
import { FactionSystem } from './FactionSystem';

export interface LootDrop {
  id: string;
  name: string;
  type: 'gold' | 'gem' | 'item';
  amount: number;
  sprite: Phaser.GameObjects.Container;
  x: number;
  y: number;
  item?: Item;
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
  private compounds = 0;
  private statPoints = 0;
  private baseStats = { str: 10, agi: 10, int: 10, vit: 10 };
  private lastPlayerAttackTime = 0;
  private attackCooldown = 400; // ms

  private playerClass: PlayerClass = PlayerClass.PALADIN;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private lastRegenTime = 0;
  private regenInterval = 1000; // 1s

  private inventory: Item[] = [];
  private lastSkillTimes: number[] = [0, 0, 0, 0];
  private awakeningTier = 0;
  private comboHits = 0;
  private lastHitTime = 0;
  private isInvulnerable = false;
  private isStealth = false;
  private equipped: Record<string, Item | null> = {
    WEAPON: null,
    ARMOR: null,
    HELMET: null,
    SHIELD: null,
  };

  private CLASS_SKILLS: Record<string, ActiveSkill[]> = {
    [PlayerClass.PALADIN]: [
      { id: 'pal_1', name: 'Golpe Sagrado', description: 'Um golpe imbudo de luz.', icon: '⚔️', costMp: 10, cooldownMs: 3000, damageMultiplier: 1.5, type: SkillType.PROJECTILE, range: 100, unlockedAtLevel: 1, color: 0xffffaa },
      { id: 'pal_2', name: 'Escudo Divino', description: 'Aumenta defesa temporariamente.', icon: '🛡️', costMp: 20, cooldownMs: 15000, damageMultiplier: 0, type: SkillType.BUFF, range: 0, unlockedAtLevel: 3, color: 0xffee55 },
      { id: 'pal_3', name: 'Julgamento', description: 'Causa dano em área ao redor.', icon: '⚖️', costMp: 25, cooldownMs: 8000, damageMultiplier: 2.0, type: SkillType.AOE, range: 150, unlockedAtLevel: 5, color: 0xffdd44 },
      { id: 'pal_4', name: 'Investida', description: 'Avança rapidamente contra o inimigo.', icon: '⚡', costMp: 15, cooldownMs: 6000, damageMultiplier: 1.2, type: SkillType.DASH, range: 200, unlockedAtLevel: 10, color: 0xffffff },
    ],
    [PlayerClass.MAGE]: [
      { id: 'mag_1', name: 'Bola de Fogo', description: 'Lança uma esfera flamejante.', icon: '🔥', costMp: 15, cooldownMs: 2500, damageMultiplier: 1.8, type: SkillType.PROJECTILE, range: 400, unlockedAtLevel: 1, color: 0xff4400 },
      { id: 'mag_2', name: 'Onda de Gelo', description: 'Congela os inimigos ao redor.', icon: '❄️', costMp: 25, cooldownMs: 8000, damageMultiplier: 1.2, type: SkillType.AOE, range: 200, unlockedAtLevel: 3, color: 0x44aaff },
      { id: 'mag_3', name: 'Blink', description: 'Teleporta uma curta distância.', icon: '✨', costMp: 20, cooldownMs: 5000, damageMultiplier: 0, type: SkillType.DASH, range: 300, unlockedAtLevel: 5, color: 0xaaffff },
      { id: 'mag_4', name: 'Meteoro', description: 'Evoca um meteoro devastador.', icon: '☄️', costMp: 50, cooldownMs: 15000, damageMultiplier: 3.5, type: SkillType.AOE, range: 300, unlockedAtLevel: 10, color: 0xff2200 },
    ],
    [PlayerClass.ARCHER]: [
      { id: 'arc_1', name: 'Flecha Perfurante', description: 'Atira uma flecha rápida.', icon: '🏹', costMp: 10, cooldownMs: 1500, damageMultiplier: 1.3, type: SkillType.PROJECTILE, range: 500, unlockedAtLevel: 1, color: 0xaaffaa },
      { id: 'arc_2', name: 'Chuva de Flechas', description: 'Flechas caem em uma área.', icon: '🌧️', costMp: 25, cooldownMs: 8000, damageMultiplier: 1.8, type: SkillType.AOE, range: 400, unlockedAtLevel: 3, color: 0x88ff88 },
      { id: 'arc_3', name: 'Recuo Tático', description: 'Pula para trás rapidamente.', icon: '💨', costMp: 15, cooldownMs: 5000, damageMultiplier: 0, type: SkillType.DASH, range: 250, unlockedAtLevel: 5, color: 0xdddddd },
      { id: 'arc_4', name: 'Tiro Mortal', description: 'Dano massivo em alvo único.', icon: '🎯', costMp: 40, cooldownMs: 12000, damageMultiplier: 3.0, type: SkillType.PROJECTILE, range: 600, unlockedAtLevel: 10, color: 0xff0000 },
    ],
    [PlayerClass.ASSASSIN]: [
      { id: 'ass_1', name: 'Arremesso de Adaga', description: 'Joga uma adaga.', icon: '🔪', costMp: 8, cooldownMs: 1000, damageMultiplier: 1.1, type: SkillType.PROJECTILE, range: 350, unlockedAtLevel: 1, color: 0xaaaaaa },
      { id: 'ass_2', name: 'Corte Sombrio', description: 'Dash através dos inimigos.', icon: '🦇', costMp: 20, cooldownMs: 6000, damageMultiplier: 1.6, type: SkillType.DASH, range: 300, unlockedAtLevel: 3, color: 0x444444 },
      { id: 'ass_3', name: 'Cortina de Fumaça', description: 'Fica furtivo.', icon: '🌫️', costMp: 30, cooldownMs: 15000, damageMultiplier: 0, type: SkillType.BUFF, range: 0, unlockedAtLevel: 5, color: 0x888888 },
      { id: 'ass_4', name: 'Lâmina Envenenada', description: 'Explosão de veneno.', icon: '☠️', costMp: 35, cooldownMs: 10000, damageMultiplier: 2.5, type: SkillType.AOE, range: 150, unlockedAtLevel: 10, color: 0x22ff22 },
    ]
  };

  private itemPool: Omit<Item, 'id'>[] = [
    // Armas
    { name: 'Espada de Ferro', type: 'WEAPON', stats: { atk: 12 }, icon: '🗡️', description: 'Uma espada comum de ferro batido.', rarity: 'COMMON' },
    { name: 'Cajado de Iniciante', type: 'WEAPON', stats: { atk: 8, mp: 20 }, icon: '🔮', description: 'Cajado de madeira canalizador de magias.', rarity: 'COMMON' },
    { name: 'Arco Curto', type: 'WEAPON', stats: { atk: 10 }, icon: '🏹', description: 'Arco simples de madeira flexível.', rarity: 'COMMON' },
    { name: 'Adaga de Cobre', type: 'WEAPON', stats: { atk: 14 }, icon: '🔪', description: 'Lâmina curta e leve para cortes ágeis.', rarity: 'COMMON' },
    
    { name: 'Lâmina do Trovão', type: 'WEAPON', stats: { atk: 28 }, icon: '⚡', description: 'Uma espada lendária que brilha com raios.', rarity: 'LEGENDARY' },
    { name: 'Cajado Arcano Primordial', type: 'WEAPON', stats: { atk: 20, mp: 60 }, icon: '🌟', description: 'Canalizador mágico com poder do infinito.', rarity: 'LEGENDARY' },
    { name: 'Arco do Vento Silencioso', type: 'WEAPON', stats: { atk: 24 }, icon: '💨', description: 'Dispara projéteis silenciosos e letais.', rarity: 'LEGENDARY' },
    { name: 'Presa das Sombras', type: 'WEAPON', stats: { atk: 32 }, icon: '💀', description: 'Adaga envenenada de um lorde assassino.', rarity: 'LEGENDARY' },

    // Armaduras
    { name: 'Túnica de Couro', type: 'ARMOR', stats: { def: 6, hp: 15 }, icon: '🧥', description: 'Proteção básica de couro batido.', rarity: 'COMMON' },
    { name: 'Cota de Malha', type: 'ARMOR', stats: { def: 12, hp: 30 }, icon: '🛡️', description: 'Armadura reforçada com anéis de metal.', rarity: 'RARE' },
    { name: 'Armadura da Ordem', type: 'ARMOR', stats: { def: 24, hp: 60 }, icon: '🥋', description: 'Peitoral sagrado dos cavaleiros templários.', rarity: 'EPIC' },
    { name: 'Égide Real Templária', type: 'ARMOR', stats: { def: 38, hp: 100 }, icon: '👑', description: 'Armadura banhada a ouro usada pelo Grão-Mestre.', rarity: 'LEGENDARY' },

    // Elmos
    { name: 'Capuz de Pano', type: 'HELMET', stats: { def: 2, mp: 10 }, icon: '👒', description: 'Capuz simples para aventureiros.', rarity: 'COMMON' },
    { name: 'Elmo de Ferro', type: 'HELMET', stats: { def: 5, hp: 15 }, icon: '🪖', description: 'Elmo militar padrão.', rarity: 'COMMON' },
    { name: 'Elmo do Sentinela', type: 'HELMET', stats: { def: 10, hp: 30 }, icon: '🎯', description: 'Oferece ótima visibilidade e proteção.', rarity: 'RARE' },
    { name: 'Elmo da Glória', type: 'HELMET', stats: { def: 20, hp: 50, mp: 25 }, icon: '🪐', description: 'Elmo sagrado com joias incrustadas.', rarity: 'LEGENDARY' },

    // Escudos
    { name: 'Escudo de Madeira', type: 'SHIELD', stats: { def: 4, hp: 10 }, icon: '🪵', description: 'Um pedaço redondo de carvalho reforçado.', rarity: 'COMMON' },
    { name: 'Escudo do Paladino', type: 'SHIELD', stats: { def: 15, hp: 40 }, icon: '🛡️', description: 'Escudo sagrado imbuído de proteção divina.', rarity: 'EPIC' },
  ];

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
    this.scene.physics.add.overlap(
      this.projectiles,
      monster,
      (proj) => this.handleProjectileHit(proj as Phaser.Physics.Arcade.Sprite, monster),
    );
  }

  public performMeleeAttack(
    player: Phaser.GameObjects.Sprite,
    direction: string,
    time: number
  ): void {
    if (time < this.lastPlayerAttackTime + this.attackCooldown) return;

    if (this.playerClass === PlayerClass.PALADIN) {
      this.executePaladinAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.GUARDIAN) {
      this.executeGuardianAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.WARRIOR) {
      this.executeWarriorAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.MAGE) {
      this.executeMageAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.NECROMANCER) {
      this.executeNecromancerAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.ARCHER) {
      this.executeArcherAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.ASSASSIN) {
      this.executeAssassinAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.CLERIC) {
      this.executeClericAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.DARK_KNIGHT) {
      this.executeDarkKnightAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.ELEMENTALIST) {
      this.executeElementalistAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.BARD) {
      this.executeBardAttack(player, direction, time);
    } else if (this.playerClass === PlayerClass.DRUID) {
      this.executeDruidAttack(player, direction, time);
    }
  }

  private createHolySlashEffect(x: number, y: number, angle: number): void {
    const slash = this.scene.add.graphics();
    slash.setDepth(60);
    slash.setPosition(x, y);
    slash.setRotation(angle);

    // Arco de Corte Dourado em HD com Gradiente Mágico
    slash.lineStyle(4, 0xffd700, 0.95);
    slash.beginPath();
    slash.arc(0, 0, 24, -Math.PI / 3, Math.PI / 3, false);
    slash.strokePath();

    slash.lineStyle(2, 0xffffff, 1);
    slash.beginPath();
    slash.arc(0, 0, 22, -Math.PI / 4, Math.PI / 4, false);
    slash.strokePath();

    // Faíscas de Impacto Douradas
    this.emitParticles(x, y, 'particle-gold', {
      speed: { min: 40, max: 110 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 250,
      quantity: 12,
      tint: [0xffd700, 0xffffff, 0xff8c00],
      blendMode: 'ADD',
    });

    this.scene.tweens.add({
      targets: slash,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 180,
      ease: 'Power2',
      onComplete: () => slash.destroy(),
    });
  }

  private onMonsterKilled(monster: Monster): void {
    // Desbloqueia conquista Primeiro Sangue
    AchievementSystem.getInstance().unlock('FIRST_BLOOD', this.scene);
    QuestSystem.getInstance().trackProgress('SKELETON_HUNT');
    FactionSystem.getInstance().addReputation('SILVER_GUARD', 15);

    if (monster.config.id === 'lord_malakor') {
      AchievementSystem.getInstance().unlock('BOSS_SLAYER', this.scene);
      QuestSystem.getInstance().trackProgress('BOSS_CHALLENGE');
      FactionSystem.getInstance().addReputation('CELESTIAL_MAGES', 150);
    }

    // Recompensa de XP
    this.playerXp += Math.floor(monster.config.xpReward * PetSystem.getInstance().getXpMultiplier());
    if (this.playerXp >= this.playerMaxXp) {
      this.levelUp();
    }

    // Drop de Loot no chão (Ouro)
    this.spawnLoot(monster.x, monster.y, monster.config.goldReward);

    // 30% de chance de dropar um item de equipamento físico
    if (Math.random() < 0.30) {
      this.spawnItemLoot(monster.x, monster.y);
    }

    // Atualiza o HUD
    this.emitStateUpdate();
  }

  private levelUp(): void {
    this.playerLevel++;
    this.statPoints += 5;
    TalentSystem.getInstance().addPoints(1);
    this.playerXp -= this.playerMaxXp;
    this.playerMaxXp = Math.floor(this.playerMaxXp * 1.5);
    this.maxPlayerHp += 15;
    this.maxPlayerMp += 10;
    this.playerHp = this.getMaxHP();
    this.playerMp = this.getMaxMP();

    if (this.playerLevel >= 10) {
      AchievementSystem.getInstance().unlock('LEVEL_MASTER', this.scene);
    }

    this.scene.events.emit('player-level-up', { level: this.playerLevel });
    this.scene.events.emit('request-save');
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

  private spawnItemLoot(x: number, y: number): void {
    const randomConfig = this.itemPool[Math.floor(Math.random() * this.itemPool.length)];
    const item: Item = {
      ...randomConfig,
      id: `item_${Date.now()}_${Math.random()}`,
    };

    const container = this.scene.add.container(x, y);
    container.setDepth(y / 32 + 1);

    // Cor do brilho da raridade
    let rarityColorHex = 0x999999;
    if (item.rarity === 'RARE') rarityColorHex = 0x0088ff;
    if (item.rarity === 'EPIC') rarityColorHex = 0x9900ee;
    if (item.rarity === 'LEGENDARY') rarityColorHex = 0xffd700;

    const glow = this.scene.add.graphics();
    glow.fillStyle(rarityColorHex, 0.45);
    glow.fillCircle(0, 0, 12);

    // Efeito extra de pulso para itens lendários
    if (item.rarity === 'LEGENDARY') {
      this.scene.tweens.add({
        targets: glow,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }

    const box = this.scene.add.text(0, 0, '🎁', { fontSize: '13px' }).setOrigin(0.5);
    container.add([glow, box]);

    // Animação flutuante
    this.scene.tweens.add({
      targets: container,
      y: y - 6,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const drop: LootDrop = {
      id: `loot_${Date.now()}_${Math.random()}`,
      name: item.name,
      type: 'item',
      amount: 0,
      sprite: container,
      x,
      y,
      item,
    };

    this.lootDrops.push(drop);
  }

  public updateLootCollection(playerX: number, playerY: number, petX?: number, petY?: number): void {
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const drop = this.lootDrops[i];
      
      // Se o Pet estiver por perto, o loot é atraído magneticamente
      if (petX !== undefined && petY !== undefined) {
        const petDist = Phaser.Math.Distance.Between(petX, petY, drop.x, drop.y);
        if (petDist < 140) {
          drop.x = Phaser.Math.Linear(drop.x, petX, 0.15);
          drop.y = Phaser.Math.Linear(drop.y, petY, 0.15);
          drop.sprite.setPosition(drop.x, drop.y);
        }
      }

      const dist = Phaser.Math.Distance.Between(playerX, playerY, drop.x, drop.y);
      const petDist = (petX !== undefined && petY !== undefined)
        ? Phaser.Math.Distance.Between(petX, petY, drop.x, drop.y)
        : 999;

      if (dist < 28 || petDist < 24) {
        if (drop.type === 'item') {
          // Verifica limite do inventário
          if (this.inventory.length >= 16) {
            // Mostra aviso de inventário cheio com cooldown para não spamar
            if (this.scene.time.now % 1000 < 50) {
              this.showFloatingText(drop.x, drop.y - 12, 'Inventário Cheio!', '#ff4444');
            }
            continue; // Não coleta o item
          }

          if (drop.item) {
            this.inventory.push(drop.item);
            let rarityColor = '#aaaaaa';
            if (drop.item.rarity === 'RARE') rarityColor = '#4488ff';
            if (drop.item.rarity === 'EPIC') rarityColor = '#8a2be2';
            if (drop.item.rarity === 'LEGENDARY') rarityColor = '#ffd700';

            this.showFloatingText(drop.x, drop.y - 16, `+ ${drop.item.name}`, rarityColor);
            this.scene.events.emit('update-inventory-ui');
          }
        } else {
          // Coletou ouro ou gema
          this.gold += drop.amount;
        }

        // Efeito de coleta (moeda/item voa e some)
        SoundSynth.playLoot();
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
    if (this.isInvulnerable || this.playerHp <= 0) return;

    const defense = this.getDefense();
    // Reduz o dano em 1% por ponto de defesa, com teto de 75%
    const reduction = Math.min(0.75, defense / 100);
    const finalDamage = Math.max(1, Math.round(amount * (1 - reduction)));

    this.playerHp = Math.max(0, this.playerHp - finalDamage);
    this.emitStateUpdate();
    SoundSynth.playHurt();

    // i-Frames (Invulnerabilidade de 0.8s) + Piscar do Sprite do Jogador
    this.isInvulnerable = true;
    const playerSprite = (this.scene as any).player;
    if (playerSprite) {
      this.scene.tweens.add({
        targets: playerSprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          if (playerSprite.active) playerSprite.setAlpha(1);
          this.isInvulnerable = false;
        }
      });
    } else {
      this.scene.time.delayedCall(800, () => {
        this.isInvulnerable = false;
      });
    }

    // Tremo de tela ao sofrer dano (game feel GBA)
    this.scene.cameras.main.shake(150, 0.02);

    // Se o HP zerou
    if (this.playerHp <= 0) {
      this.scene.events.emit('player-died');
    }
  }

  public gainXp(amount: number): void {
    this.playerXp += amount;
    if (this.playerXp >= this.playerMaxXp) {
      this.playerXp -= this.playerMaxXp;
      this.playerLevel++;
      this.playerMaxXp = Math.floor(this.playerMaxXp * 1.4);
      this.statPoints += 3;
      this.maxPlayerHp += 20;
      this.playerHp = this.maxPlayerHp;
      this.maxPlayerMp += 10;
      this.playerMp = this.maxPlayerMp;

      SoundSynth.playLevelUp();
      const playerSprite = (this.scene as any).player;
      if (playerSprite) {
        this.showFloatingText(playerSprite.x, playerSprite.y - 30, 'LEVEL UP! +3 Pontos', '#ffd700');
      }
    }
    this.emitStateUpdate();
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
      compounds: this.compounds,
      statPoints: this.statPoints,
      baseStats: { ...this.baseStats },
      playerClass: this.playerClass,
      skillCooldowns: this.lastSkillTimes.map((lastTime, idx) => {
        const cd = this.getSkillCooldown(idx);
        return Math.max(0, (lastTime + cd - this.scene.time.now) / cd);
      }),
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

    // Inicializa inventário e limpa equipamentos equipados
    this.equipped = { WEAPON: null, ARMOR: null, HELMET: null, SHIELD: null };
    this.inventory = [];

    // Adiciona arma inicial baseada na classe
    let startingWeapon: Omit<Item, 'id'> | null = null;
    switch (this.playerClass) {
      case PlayerClass.PALADIN:
        startingWeapon = { name: 'Espada de Ferro', type: 'WEAPON', stats: { atk: 12 }, icon: '🗡️', description: 'Uma espada comum de ferro batido.', rarity: 'COMMON' };
        break;
      case PlayerClass.MAGE:
        startingWeapon = { name: 'Cajado de Iniciante', type: 'WEAPON', stats: { atk: 8, mp: 20 }, icon: '🔮', description: 'Cajado de madeira canalizador de magias.', rarity: 'COMMON' };
        break;
      case PlayerClass.ARCHER:
        startingWeapon = { name: 'Arco Curto', type: 'WEAPON', stats: { atk: 10 }, icon: '🏹', description: 'Arco simples de madeira flexível.', rarity: 'COMMON' };
        break;
      case PlayerClass.ASSASSIN:
        startingWeapon = { name: 'Adaga de Cobre', type: 'WEAPON', stats: { atk: 14 }, icon: '🔪', description: 'Lâmina curta e leve para cortes ágeis.', rarity: 'COMMON' };
        break;
    }

    if (startingWeapon) {
      const weapon: Item = { ...startingWeapon, id: `starting_weapon_${Date.now()}` };
      this.equipped.WEAPON = weapon;
    }

    this.emitStateUpdate();
  }


  private emitParticles(x: number, y: number, key: string, config: any): void {
    const emitter = this.scene.add.particles(x, y, key, config);
    this.scene.time.delayedCall((config.lifespan || 400) + 100, () => {
      if (emitter && emitter.active) emitter.destroy();
    });
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
    this.monsters.forEach(monster => {
      if (!monster.isDead) {
        monster.update(time);
        monster.setDepth(monster.y);
      }
    });

    this.projectiles.getChildren().forEach((p: any) => {
      if (p.active) p.setDepth(p.y);
    });
  }

  public getActiveSkills(): (ActiveSkill & { unlocked: boolean })[] {
    const classSkills = this.CLASS_SKILLS[this.playerClass] || [];
    return classSkills.map(s => ({ ...s, unlocked: this.playerLevel >= s.unlockedAtLevel }));
  }

  public getSkillCooldownProgress(index: number, time: number): number {
    const skills = this.CLASS_SKILLS[this.playerClass];
    if (!skills || !skills[index]) return 0;
    const skill = skills[index];
    const lastTime = this.lastSkillTimes[index] || 0;
    const elapsed = time - lastTime;
    if (elapsed >= skill.cooldownMs) return 0;
    return 1 - (elapsed / skill.cooldownMs);
  }

  public castActiveSkill(index: number, player: Phaser.GameObjects.Sprite, targetX: number, targetY: number, time: number): void {
    const skills = this.CLASS_SKILLS[this.playerClass];
    if (!skills || !skills[index]) return;
    
    const skill = skills[index];
    if (this.playerLevel < skill.unlockedAtLevel) {
      this.showFloatingText(player.x, player.y - 20, 'Level Insuficiente!', '#ff4444');
      return;
    }

    const lastTime = this.lastSkillTimes[index] || 0;
    if (time - lastTime < skill.cooldownMs) {
      this.showFloatingText(player.x, player.y - 20, 'Em Recarga!', '#ffaa44');
      return;
    }

    if (this.playerMp < skill.costMp) {
      this.showFloatingText(player.x, player.y - 20, 'Mana Insuficiente!', '#4488ff');
      return;
    }

    // Gasta MP e Seta Cooldown
    this.playerMp -= skill.costMp;
    this.lastSkillTimes[index] = time;
    this.emitStateUpdate();

    // Calcula Dano e Executa
    const rawDamage = this.getAttackPower() * skill.damageMultiplier;
    const finalDamage = this.getModifiedDamage(rawDamage, player);

    if (skill.type === SkillType.PROJECTILE) {
      this.castProjectileSkill(skill, finalDamage, player, targetX, targetY);
    } else if (skill.type === SkillType.AOE) {
      this.castAoeSkill(skill, finalDamage, player);
    } else if (skill.type === SkillType.BUFF) {
      this.castBuffSkill(skill, player);
    } else if (skill.type === SkillType.DASH) {
      this.castDashSkill(skill, finalDamage, player, targetX, targetY);
    }
  }

  private castProjectileSkill(skill: ActiveSkill, damage: number, player: Phaser.GameObjects.Sprite, tx: number, ty: number): void {
    const angle = Phaser.Math.Angle.Between(player.x, player.y, tx, ty);
    const speed = 300;
    const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'mage-proj');
    proj.setTint(skill.color || 0xffffff);
    proj.setDepth(40);
    this.scene.physics.velocityFromRotation(angle, speed, (proj.body as Phaser.Physics.Arcade.Body).velocity);
    proj.setRotation(angle);
    proj.setData('damage', damage);
    proj.setData('type', 'skill_proj');
    this.projectiles.add(proj);
    SoundSynth.playFireball();
  }

  private castAoeSkill(skill: ActiveSkill, damage: number, player: Phaser.GameObjects.Sprite): void {
    SoundSynth.playExplosion();
    this.emitParticles(player.x, player.y, 'particle-gold', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 500,
      quantity: 30,
      tint: skill.color || 0xffffff,
      blendMode: 'ADD',
    });

    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, monster.x, monster.y);
      if (dist <= skill.range) {
        const died = monster.takeDamage(damage);
        if (died) this.onMonsterKilled(monster);
      }
    });
  }

  private castBuffSkill(skill: ActiveSkill, player: Phaser.GameObjects.Sprite): void {
    SoundSynth.playLevelUp();
    if (skill.name === 'Cortina de Fumaça') {
      this.isStealth = true;
      player.setAlpha(0.5);
      this.showFloatingText(player.x, player.y - 30, 'FURTIVO!', '#888888');
    } else {
      this.isInvulnerable = true;
      this.scene.time.delayedCall(4000, () => {
        this.isInvulnerable = false;
      });
      this.showFloatingText(player.x, player.y - 30, 'BUFF ATIVADO!', '#ffff44');
    }
    
    this.emitParticles(player.x, player.y, 'particle-gold', {
      speed: 0, scale: { start: 2, end: 2 }, alpha: { start: 0.5, end: 0 }, lifespan: 1000, tint: skill.color || 0xffff44, blendMode: 'ADD',
    });
  }

  private castDashSkill(skill: ActiveSkill, damage: number, player: Phaser.GameObjects.Sprite, tx: number, ty: number): void {
    SoundSynth.playDash();
    const angle = Phaser.Math.Angle.Between(player.x, player.y, tx, ty);
    const dist = Math.min(skill.range, Phaser.Math.Distance.Between(player.x, player.y, tx, ty));
    
    const targetMoveX = player.x + Math.cos(angle) * dist;
    const targetMoveY = player.y + Math.sin(angle) * dist;

    this.emitParticles(player.x, player.y, 'particle-gold', {
      speed: 0, scale: { start: 1, end: 0 }, lifespan: 200, tint: skill.color || 0xffffff
    });

    player.x = targetMoveX;
    player.y = targetMoveY;

    if (damage > 0) {
      this.monsters.forEach((monster) => {
        if (monster.isDead) return;
        const mDist = Phaser.Math.Distance.Between(player.x, player.y, monster.x, monster.y);
        if (mDist < 50) {
          const died = monster.takeDamage(damage);
          if (died) this.onMonsterKilled(monster);
        }
      });
    }
  }

  private getModifiedDamage(baseDamage: number, player: Phaser.GameObjects.Sprite): number {
    if (this.isStealth) {
      this.isStealth = false;
      player.setAlpha(1);
      this.showFloatingText(player.x, player.y - 28, 'MEGA CRÍTICO!', '#ff3333');
      return baseDamage * 3.0;
    }
    return baseDamage;
  }

  private executePaladinAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playSlash();
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

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 10);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
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
    SoundSynth.playFireball();

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
    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 10);
    proj.setData('damage', this.getModifiedDamage(rawDamage, player));
    proj.setData('type', 'mage');
    this.projectiles.add(proj);

    // Partículas ao atirar
    this.emitParticles(player.x, player.y - 8, 'particle-gold', {
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
    SoundSynth.playArrow();

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
    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 6);
    proj.setData('damage', this.getModifiedDamage(rawDamage, player));
    proj.setData('type', 'archer');
    this.projectiles.add(proj);
  }

  private executeAssassinAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playDash();

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
      const ghost = this.scene.add.sprite(gx, gy, `${this.playerClass}-sheet`, player.frame.name);
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

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 15);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
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

  private executeGuardianAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playSlash();
    let offsetX = 0; let offsetY = 0;
    switch (direction) {
      case 'left': offsetX = -24; break;
      case 'right': offsetX = 24; break;
      case 'up': offsetY = -24; break;
      case 'down': offsetY = 24; break;
    }
    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;
    this.createHolySlashEffect(attackX, attackY, 0);

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 8);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      if (Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y) < 36) {
        const died = monster.takeDamage(baseDamage);
        if (died) this.onMonsterKilled(monster);
      }
    });
  }

  private executeWarriorAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playSlash();
    let offsetX = 0; let offsetY = 0;
    switch (direction) {
      case 'left': offsetX = -28; break;
      case 'right': offsetX = 28; break;
      case 'up': offsetY = -28; break;
      case 'down': offsetY = 28; break;
    }
    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;
    this.createHolySlashEffect(attackX, attackY, 0);

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 14);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      if (Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y) < 38) {
        const died = monster.takeDamage(baseDamage);
        if (died) this.onMonsterKilled(monster);
      }
    });
  }

  private executeNecromancerAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    if (this.playerMp < 8) {
      this.showFloatingText(player.x, player.y - 20, 'Mana Insuficiente!', '#4488ff');
      return;
    }
    this.playerMp -= 8;
    this.emitStateUpdate();
    this.lastPlayerAttackTime = time;
    SoundSynth.playFireball();

    let vx = 0; let vy = 0;
    switch (direction) {
      case 'left': vx = -260; break;
      case 'right': vx = 260; break;
      case 'up': vy = -260; break;
      case 'down': vy = 260; break;
    }

    const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'mage-proj');
    proj.setTint(0x4b0082);
    proj.setDepth(40);
    proj.setVelocity(vx, vy);
    proj.setData('damage', this.getModifiedDamage(this.getAttackPower(), player));
    proj.setData('type', 'mage');
    this.projectiles.add(proj);
  }

  private executeClericAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playSlash();
    let offsetX = 0; let offsetY = 0;
    switch (direction) {
      case 'left': offsetX = -24; break;
      case 'right': offsetX = 24; break;
      case 'up': offsetY = -24; break;
      case 'down': offsetY = 24; break;
    }
    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;
    this.createHolySlashEffect(attackX, attackY, 0);

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 8);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      if (Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y) < 34) {
        const died = monster.takeDamage(baseDamage);
        if (died) this.onMonsterKilled(monster);
      }
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

    this.emitParticles(x, y, 'particle-gold', {
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



  public showFloatingText(x: number, y: number, text: string, color: string): void {
    const fText = this.scene.add.text(x, y, text, {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 1, offsetY: 2, color: '#000000', blur: 3, fill: true }
    }).setOrigin(0.5).setDepth(150);

    fText.setScale(1.5);

    this.scene.tweens.add({
      targets: fText,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: fText,
          y: y - 32,
          alpha: 0,
          duration: 700,
          ease: 'Power2.easeOut',
          onComplete: () => fText.destroy(),
        });
      }
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

    if (!this.scene.textures.exists('fire-proj')) {
      const fireCanvas = this.scene.textures.createCanvas('fire-proj', 12, 12);
      if (fireCanvas) {
        const ctx = fireCanvas.getContext();
        const grad = ctx.createRadialGradient(6, 6, 0, 6, 6, 6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#ffaa00');
        grad.addColorStop(0.7, '#ff3300');
        grad.addColorStop(1, 'rgba(255, 51, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 12, 12);
        fireCanvas.refresh();
      }
    }

    if (!this.scene.textures.exists('dagger-proj')) {
      const daggerCanvas = this.scene.textures.createCanvas('dagger-proj', 12, 4);
      if (daggerCanvas) {
        const ctx = daggerCanvas.getContext();
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(0, 1, 8, 2);
        ctx.fillStyle = '#708090';
        ctx.fillRect(8, 0, 4, 4);
        daggerCanvas.refresh();
      }
    }
  }

  // ==================== HABILIDADES ATIVAS DE CLASSE ====================

  public getSkillCooldown(index: number): number {
    const cds = [3000, 6000, 12000, 25000];
    return cds[index] ?? 5000;
  }

  public awakenClass(): boolean {
    if (this.playerLevel < 10) {
      this.showFloatingText(240, 160, 'Requer Nível 10 para Despertar!', '#ff4444');
      return false;
    }
    if (this.gold < 1000) {
      this.showFloatingText(240, 160, 'Requer 1.000 Ouro para Despertar!', '#ff4444');
      return false;
    }

    this.gold -= 1000;
    this.awakeningTier = 1;
    this.maxPlayerHp += 50;
    this.maxPlayerMp += 30;
    this.playerHp = this.maxPlayerHp;
    this.playerMp = this.maxPlayerMp;

    SoundSynth.playUpgrade();
    this.emitStateUpdate();
    return true;
  }

  public useSkill(
    player: Phaser.GameObjects.Sprite,
    skillIndex: number,
    direction: string,
    time: number
  ): void {
    if (this.playerHp <= 0) return;

    if (skillIndex === 3) {
      this.useUltimateSkill(player, direction, time);
      return;
    }

    const cooldown = this.getSkillCooldown(skillIndex);
    const lastTime = this.lastSkillTimes[skillIndex];
    if (time < lastTime + cooldown) {
      this.showFloatingText(player.x, player.y - 20, 'Em Recarga!', '#ffcc00');
      return;
    }

    const costs = [12, 20, 30];
    const cost = costs[skillIndex];
    if (this.playerMp < cost) {
      this.showFloatingText(player.x, player.y - 20, 'Mana Insuficiente!', '#4488ff');
      return;
    }

    let success = false;
    if (this.playerClass === PlayerClass.PALADIN) {
      success = this.usePaladinSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.GUARDIAN) {
      success = this.useGuardianSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.WARRIOR) {
      success = this.useWarriorSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.MAGE) {
      success = this.useMageSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.NECROMANCER) {
      success = this.useNecromancerSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.ARCHER) {
      success = this.useArcherSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.ASSASSIN) {
      success = this.useAssassinSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.CLERIC) {
      success = this.useClericSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.DARK_KNIGHT) {
      success = this.useDarkKnightSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.ELEMENTALIST) {
      success = this.useElementalistSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.BARD) {
      success = this.useBardSkill(player, skillIndex, direction, time);
    } else if (this.playerClass === PlayerClass.DRUID) {
      success = this.useDruidSkill(player, skillIndex, direction, time);
    }

    if (success) {
      this.playerMp -= cost;
      this.lastSkillTimes[skillIndex] = time;
      this.emitStateUpdate();
    }
  }

  private useUltimateSkill(player: Phaser.GameObjects.Sprite, _direction: string, time: number): void {
    const mpCost = 30;
    if (this.playerMp < mpCost) {
      this.showFloatingText(player.x, player.y - 20, 'MP Insuficiente!', '#00ffff');
      return;
    }

    const cooldown = this.getSkillCooldown(3);
    const lastTime = this.lastSkillTimes[3];
    if (time < lastTime + cooldown) {
      this.showFloatingText(player.x, player.y - 20, 'Suprema em Recarga!', '#ffcc00');
      return;
    }

    this.playerMp -= mpCost;
    this.lastSkillTimes[3] = time;
    this.scene.cameras.main.shake(300, 0.012);

    SoundSynth.playUpgrade();
    this.showFloatingText(player.x, player.y - 45, '🌟 HABILIDADE SUPREMA ATIVADA! 🌟', '#ffd700');

    const cx = player.x;
    const cy = player.y;

    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 120, () => {
        const rx = cx + (Math.random() * 160 - 80);
        const ry = cy + (Math.random() * 160 - 80);
        this.createMageExplosionEffect(rx, ry);
        this.monsters.forEach(m => {
          if (!m.isDead && Phaser.Math.Distance.Between(rx, ry, m.x, m.y) < 60) {
            const died = m.takeDamage(120);
            if (died) this.onMonsterKilled(m);
          }
        });
      });
    }

    this.emitStateUpdate();
  }

  private usePaladinSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Escudo Divino (Invulnerabilidade por 2s)
      this.isInvulnerable = true;
      SoundSynth.playLoot();
      this.showFloatingText(player.x, player.y - 24, 'ESCUDO DIVINO!', '#ffd700');

      const shield = this.scene.add.graphics();
      shield.setDepth(30);
      shield.lineStyle(2, 0xffd700, 0.8);
      shield.fillStyle(0xfff7c2, 0.25);
      shield.strokeCircle(0, 0, 20);
      shield.fillCircle(0, 0, 20);

      const updateShield = () => {
        if (shield.active && player.active) {
          shield.setPosition(player.x, player.y - 8);
        }
      };
      this.scene.events.on('update', updateShield);

      this.scene.time.delayedCall(2000, () => {
        this.isInvulnerable = false;
        this.scene.events.off('update', updateShield);
        shield.destroy();
      });
      return true;
    } else if (index === 1) {
      // 2. Luz Sagrada (Cura HP)
      this.playerHp = Math.min(this.getMaxHP(), this.playerHp + 45);
      SoundSynth.playLoot();
      this.showFloatingText(player.x, player.y - 24, '+45 HP', '#22ff22');

      this.emitParticles(player.x, player.y - 8, 'particle-gold', {
        speed: { min: 20, max: 50 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        lifespan: 400,
        quantity: 16,
        tint: 0x22ff22,
        blendMode: 'ADD',
      });
      return true;
    } else if (index === 2) {
      // 3. Impacto da Justiça (Golpe de Área + Knockback Forte)
      SoundSynth.playUpgrade();
      this.scene.cameras.main.shake(200, 0.025);
      this.showFloatingText(player.x, player.y - 24, 'IMPACTO DA JUSTIÇA!', '#ffaa00');

      const circle = this.scene.add.graphics();
      circle.setDepth(50);
      circle.setPosition(player.x, player.y);
      circle.lineStyle(3, 0xffaa00, 1);
      circle.fillStyle(0xffd700, 0.35);
      circle.strokeCircle(0, 0, 75);
      circle.fillCircle(0, 0, 75);

      this.scene.tweens.add({
        targets: circle,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0,
        duration: 300,
        onComplete: () => circle.destroy(),
      });

      const damage = this.getAttackPower() * 2.2;
      this.monsters.forEach((monster) => {
        if (monster.isDead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, monster.x, monster.y);
        if (dist < 85) {
          monster.takeDamage(damage);
          const body = monster.body as Phaser.Physics.Arcade.Body;
          if (body) {
            const angle = Phaser.Math.Angle.Between(player.x, player.y, monster.x, monster.y);
            body.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
            this.scene.time.delayedCall(200, () => { if (body && !monster.isDead) body.setVelocity(0); });
          }
        }
      });
      return true;
    }
    return false;
  }

  private useMageSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Bola de Fogo Arcana (Explosão pesada de área)
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'BOLA DE FOGO ARCANA!', '#ff4400');

      let vx = 0; let vy = 0; let angle = 0;
      switch (direction) {
        case 'left': vx = -300; angle = Math.PI; break;
        case 'right': vx = 300; angle = 0; break;
        case 'up': vy = -300; angle = -Math.PI / 2; break;
        case 'down': vy = 300; angle = Math.PI / 2; break;
      }

      const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'fire-proj');
      proj.setDepth(40);
      proj.setVelocity(vx, vy);
      proj.setRotation(angle);
      proj.setData('damage', this.getAttackPower() * 2.0);
      proj.setData('type', 'mage'); // Dispara a explosão de área ao atingir
      this.projectiles.add(proj);
      return true;
    } else if (index === 1) {
      // 2. Barreira de Gelo (Congela/Lentidão em área)
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'BARREIRA DE GELO!', '#00ffff');

      const ice = this.scene.add.graphics();
      ice.setDepth(30);
      ice.setPosition(player.x, player.y);
      ice.lineStyle(2, 0x00ffff, 0.85);
      ice.fillStyle(0xe0ffff, 0.25);
      ice.strokeCircle(0, 0, 60);
      ice.fillCircle(0, 0, 60);

      this.scene.tweens.add({
        targets: ice,
        alpha: 0,
        duration: 3000,
        onComplete: () => ice.destroy(),
      });

      this.monsters.forEach((monster) => {
        if (monster.isDead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, monster.x, monster.y);
        if (dist < 65) {
          monster.takeDamage(this.getAttackPower() * 0.5);
          // Efeito visual de gelo no monstro
          monster.setAlpha(0.65);
          const origSpeed = monster.config.speed;
          monster.config.speed = origSpeed * 0.4;
          this.scene.time.delayedCall(3000, () => {
            if (monster.active && !monster.isDead) {
              monster.setAlpha(1);
              monster.config.speed = origSpeed;
            }
          });
        }
      });
      return true;
    } else if (index === 2) {
      // 3. Teletransporte (Blink para frente)
      SoundSynth.playDash();
      this.showFloatingText(player.x, player.y - 24, 'TELETRANSPORTE!', '#8a2be2');

      let dx = 0; let dy = 0;
      switch (direction) {
        case 'left': dx = -110; break;
        case 'right': dx = 110; break;
        case 'up': dy = -110; break;
        case 'down': dy = 110; break;
      }

      // Poeira arcanas no início
      this.emitParticles(player.x, player.y - 8, 'particle-gold', {
        speed: { min: 20, max: 40 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        lifespan: 250,
        quantity: 12,
        tint: 0x8a2be2,
      });

      // Warp físico (reseta física para evitar ficar preso nas paredes)
      player.x += dx;
      player.y += dy;
      if (player.body) {
        (player.body as Phaser.Physics.Arcade.Body).reset(player.x, player.y);
      }

      // Poeira arcana no fim
      this.emitParticles(player.x, player.y - 8, 'particle-gold', {
        speed: { min: 20, max: 40 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        lifespan: 250,
        quantity: 12,
        tint: 0x8a2be2,
      });
      return true;
    }
    return false;
  }

  private useArcherSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Disparo Triplo
      SoundSynth.playArrow();
      this.showFloatingText(player.x, player.y - 24, 'DISPARO TRIPLO!', '#00ff00');

      let baseAngle = 0;
      switch (direction) {
        case 'left': baseAngle = Math.PI; break;
        case 'right': baseAngle = 0; break;
        case 'up': baseAngle = -Math.PI / 2; break;
        case 'down': baseAngle = Math.PI / 2; break;
      }

      const angles = [baseAngle - 0.25, baseAngle, baseAngle + 0.25];
      angles.forEach((ang) => {
        const vx = Math.cos(ang) * 380;
        const vy = Math.sin(ang) * 380;

        const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'arrow-proj');
        proj.setDepth(40);
        proj.setVelocity(vx, vy);
        proj.setRotation(ang);
        proj.setData('damage', this.getAttackPower() * 0.95);
        proj.setData('type', 'archer');
        this.projectiles.add(proj);
      });
      return true;
    } else if (index === 1) {
      // 2. Armadilha Explosiva
      SoundSynth.playSlash();
      this.showFloatingText(player.x, player.y - 24, 'ARMADILHA NO CHÃO!', '#a0522d');

      const trap = this.scene.physics.add.sprite(player.x, player.y, 'particle-gold');
      trap.setTint(0xffaa00);
      trap.setScale(2.0);
      trap.setDepth(15);

      const triggerTrap = () => {
        if (!trap.active) return;
        SoundSynth.playUpgrade();
        this.scene.cameras.main.shake(150, 0.02);
        
        const boom = this.scene.add.graphics();
        boom.setDepth(50);
        boom.setPosition(trap.x, trap.y);
        boom.fillStyle(0xff3300, 0.5);
        boom.fillCircle(0, 0, 50);
        this.scene.tweens.add({ targets: boom, alpha: 0, duration: 250, onComplete: () => boom.destroy() });

        this.emitParticles(trap.x, trap.y, 'particle-gold', {
          speed: { min: 40, max: 90 },
          angle: { min: 0, max: 360 },
          scale: { start: 1, end: 0 },
          lifespan: 300,
          quantity: 20,
          tint: 0xff3300,
        });

        const dmg = this.getAttackPower() * 2.5;
        this.monsters.forEach((m) => {
          if (m.isDead) return;
          const d = Phaser.Math.Distance.Between(trap.x, trap.y, m.x, m.y);
          if (d < 55) {
            m.takeDamage(dmg);
          }
        });

        trap.destroy();
      };

      // Fica verificando se há monstros por perto para explodir
      const checkInterval = this.scene.time.addEvent({
        delay: 200,
        callback: () => {
          if (!trap.active) {
            checkInterval.destroy();
            return;
          }
          this.monsters.forEach((m) => {
            if (!m.isDead && Phaser.Math.Distance.Between(trap.x, trap.y, m.x, m.y) < 26) {
              triggerTrap();
              checkInterval.destroy();
            }
          });
        },
        loop: true
      });
      return true;
    } else if (index === 2) {
      // 3. Chuva de Flechas
      SoundSynth.playArrow();
      this.showFloatingText(player.x, player.y - 24, 'CHUVA DE FLECHAS!', '#32cd32');

      let tx = player.x; let ty = player.y;
      switch (direction) {
        case 'left': tx -= 90; break;
        case 'right': tx += 90; break;
        case 'up': ty -= 90; break;
        case 'down': ty += 90; break;
      }

      const area = this.scene.add.graphics();
      area.setDepth(15);
      area.setPosition(tx, ty);
      area.lineStyle(1.5, 0x32cd32, 0.7);
      area.strokeCircle(0, 0, 50);

      this.scene.time.addEvent({
        delay: 150,
        repeat: 12,
        callback: () => {
          if (!area.active) return;
          // Spawn visual de flecha caindo
          const fx = tx + Phaser.Math.Between(-40, 40);
          const fy = ty + Phaser.Math.Between(-40, 40);

          const arrow = this.scene.add.text(fx, fy - 60, '⬇️', { fontSize: '10px' }).setDepth(45);
          this.scene.tweens.add({
            targets: arrow,
            y: fy,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              arrow.destroy();
              // Causa dano
              this.monsters.forEach((m) => {
                if (!m.isDead && Phaser.Math.Distance.Between(fx, fy, m.x, m.y) < 24) {
                  m.takeDamage(this.getAttackPower() * 0.35);
                }
              });
            }
          });
        },
        callbackScope: this
      });

      this.scene.time.delayedCall(150 * 13, () => {
        if (area.active) area.destroy();
      });
      return true;
    }
    return false;
  }

  private useAssassinSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Golpe Fantasma (Dash venenoso de área)
      SoundSynth.playDash();
      this.showFloatingText(player.x, player.y - 24, 'GOLPE FANTASMA!', '#4b0082');

      let dx = 0; let dy = 0;
      switch (direction) {
        case 'left': dx = -100; break;
        case 'right': dx = 100; break;
        case 'up': dy = -100; break;
        case 'down': dy = 100; break;
      }

      const body = player.body as Phaser.Physics.Arcade.Body;
      if (body) body.checkCollision.none = true;

      // Rastro
      for (let i = 1; i <= 4; i++) {
        const gx = player.x + (dx * i / 5);
        const gy = player.y + (dy * i / 5);
        const ghost = this.scene.add.sprite(gx, gy, `${this.playerClass}-sheet`, player.frame.name);
        ghost.setScale(player.scaleX);
        ghost.setOrigin(player.originX, player.originY);
        ghost.setAlpha(0.35);
        ghost.setTint(0x4b0082);
        this.scene.tweens.add({ targets: ghost, alpha: 0, duration: 250, onComplete: () => ghost.destroy() });
      }

      player.setPosition(player.x + dx, player.y + dy);
      if (body) {
        body.reset(player.x, player.y);
        this.scene.time.delayedCall(120, () => { body.checkCollision.none = false; });
      }

      // Dano + Envenenar
      const damage = this.getAttackPower() * 1.8;
      this.monsters.forEach((monster) => {
        if (monster.isDead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, monster.x, monster.y);
        if (dist < 45) {
          monster.takeDamage(damage);
          // Efeito de veneno (DOT): 5 de dano por segundo por 4s
          this.scene.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () => {
              if (monster.active && !monster.isDead) {
                monster.takeDamage(5);
                monster.applyPoisonTint();
              }
            }
          });
        }
      });
      return true;
    } else if (index === 1) {
      // 2. Adaga Envenenada (Projétil verde + lentidão)
      SoundSynth.playArrow();
      this.showFloatingText(player.x, player.y - 24, 'ADAGA VENENOSA!', '#00ff66');

      let vx = 0; let vy = 0; let angle = 0;
      switch (direction) {
        case 'left': vx = -340; angle = Math.PI; break;
        case 'right': vx = 340; angle = 0; break;
        case 'up': vy = -340; angle = -Math.PI / 2; break;
        case 'down': vy = 340; angle = Math.PI / 2; break;
      }

      const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'dagger-proj');
      proj.setDepth(40);
      proj.setVelocity(vx, vy);
      proj.setRotation(angle);
      proj.setData('damage', this.getAttackPower() * 1.1);
      proj.setData('type', 'assassin');
      this.projectiles.add(proj);
      return true;
    } else if (index === 2) {
      // 3. Furtividade / Invanescência (Fica transparente, próximo golpe é mega crit)
      SoundSynth.playDash();
      this.showFloatingText(player.x, player.y - 24, 'INVISIBILIDADE!', '#111111');

      this.isStealth = true;
      player.setAlpha(0.25);

      this.scene.time.delayedCall(5000, () => {
        if (this.isStealth && player.active) {
          this.isStealth = false;
          player.setAlpha(1);
          this.showFloatingText(player.x, player.y - 24, 'Furtividade Expirou!', '#888888');
        }
      });
      return true;
    }
    return false;
  }

  private useGuardianSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'MURALHA INABALÁVEL!', '#ffd700');
      this.isInvulnerable = true;
      player.setTint(0xffd700);
      this.scene.time.delayedCall(4000, () => {
        if (player.active) {
          this.isInvulnerable = false;
          player.clearTint();
        }
      });
      return true;
    } else if (index === 1) {
      SoundSynth.playSlash();
      this.showFloatingText(player.x, player.y - 24, 'PROVOCAR HORDAS!', '#ff4444');
      this.monsters.forEach((monster) => {
        if (!monster.isDead && Phaser.Math.Distance.Between(player.x, player.y, monster.x, monster.y) < 180) {
          monster.setTarget(player);
          monster.takeDamage(this.getAttackPower() * 0.4);
        }
      });
      return true;
    } else if (index === 2) {
      SoundSynth.playDash();
      this.showFloatingText(player.x, player.y - 24, 'INVESTIDA DE ESCUDO!', '#00a8ff');
      let dx = 0; let dy = 0;
      if (direction === 'left') dx = -90;
      if (direction === 'right') dx = 90;
      if (direction === 'up') dy = -90;
      if (direction === 'down') dy = 90;
      player.setPosition(player.x + dx, player.y + dy);
      const dmg = this.getAttackPower() * 2.2;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 50) {
          m.takeDamage(dmg);
        }
      });
      return true;
    }
    return false;
  }

  private useWarriorSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      SoundSynth.playSlash();
      this.showFloatingText(player.x, player.y - 24, 'CORTE GIRATÓRIO!', '#ff4400');
      const circle = this.scene.add.graphics();
      circle.setPosition(player.x, player.y);
      circle.fillStyle(0xff4400, 0.4);
      circle.fillCircle(0, 0, 70);
      this.scene.tweens.add({ targets: circle, alpha: 0, scaleX: 1.3, scaleY: 1.3, duration: 250, onComplete: () => circle.destroy() });
      const dmg = this.getAttackPower() * 2.0;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 70) {
          m.takeDamage(dmg);
        }
      });
      return true;
    } else if (index === 1) {
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'GRITO DE GUERRA (+ATK)!', '#ffbb00');
      player.setTint(0xff6600);
      this.scene.time.delayedCall(6000, () => { if (player.active) player.clearTint(); });
      return true;
    } else if (index === 2) {
      SoundSynth.playSlash();
      this.showFloatingText(player.x, player.y - 24, 'IMPACTO DEVASTADOR!', '#aa0000');
      this.scene.cameras.main.shake(200, 0.03);
      const dmg = this.getAttackPower() * 3.0;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 60) {
          m.takeDamage(dmg);
        }
      });
      return true;
    }
    return false;
  }

  private useNecromancerSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'ORBE SOMBRIO!', '#8a2be2');
      let vx = 0; let vy = 0;
      if (direction === 'left') vx = -280;
      if (direction === 'right') vx = 280;
      if (direction === 'up') vy = -280;
      if (direction === 'down') vy = 280;
      const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'mage-proj');
      proj.setTint(0x4b0082);
      proj.setDepth(40);
      proj.setVelocity(vx, vy);
      proj.setData('damage', this.getAttackPower() * 2.2);
      proj.setData('type', 'mage');
      this.projectiles.add(proj);
      return true;
    } else if (index === 1) {
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'SERVO ESQUELETO INVOCADO!', '#800080');
      const serv = this.scene.add.text(player.x + 20, player.y, '💀', { fontSize: '18px' }).setOrigin(0.5);
      this.scene.tweens.add({ targets: serv, y: player.y - 15, duration: 800, yoyo: true, repeat: 5, onComplete: () => serv.destroy() });
      return true;
    } else if (index === 2) {
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'EXPLOSÃO CADAVÉRICA!', '#990000');
      const dmg = this.getAttackPower() * 2.8;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 100) {
          m.takeDamage(dmg);
        }
      });
      return true;
    }
    return false;
  }

  private useClericSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      SoundSynth.playUpgrade();
      const healAmount = Math.floor(this.getMaxHP() * 0.35);
      this.playerHp = Math.min(this.getMaxHP(), this.playerHp + healAmount);
      this.showFloatingText(player.x, player.y - 24, `✨ LUZ SAGRADA +${healAmount} HP`, '#00ff7f');
      this.emitStateUpdate();
      return true;
    } else if (index === 1) {
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'PUNIÇÃO DIVINA!', '#ffd700');
      const dmg = this.getAttackPower() * 2.5;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 70) {
          m.takeDamage(dmg);
        }
      });
      return true;
    } else if (index === 2) {
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'AURA DE PROTEÇÃO!', '#00ffff');
      this.isInvulnerable = true;
      this.scene.time.delayedCall(3000, () => { this.isInvulnerable = false; });
      return true;
    }
    return false;
  }

  // ==================== GETTERS & SETTERS ====================
  public getHP(): number { return this.playerHp; }
  public setHP(val: number): void { this.playerHp = val; this.emitStateUpdate(); }
  
  public getMaxHP(): number {
    const baseMaxHp = this.maxPlayerHp + (this.baseStats.vit * 15);
    const armor = this.equipped.ARMOR;
    const helmet = this.equipped.HELMET;
    const shield = this.equipped.SHIELD;
    const bonus = (armor ? (armor.stats.hp || 0) : 0) +
                  (helmet ? (helmet.stats.hp || 0) : 0) +
                  (shield ? (shield.stats.hp || 0) : 0);
    return baseMaxHp + bonus;
  }
  public setMaxHP(val: number): void { this.maxPlayerHp = val; this.emitStateUpdate(); }

  public getMP(): number { return this.playerMp; }
  public setMP(val: number): void { this.playerMp = val; this.emitStateUpdate(); }
  
  public getMaxMP(): number {
    const baseMaxMp = this.maxPlayerMp + (this.baseStats.int * 8);
    const weapon = this.equipped.WEAPON;
    const helmet = this.equipped.HELMET;
    const bonus = (weapon ? (weapon.stats.mp || 0) : 0) +
                  (helmet ? (helmet.stats.mp || 0) : 0);
    return baseMaxMp + bonus;
  }
  public setMaxMP(val: number): void { this.maxPlayerMp = val; this.emitStateUpdate(); }

  public getStatPoints(): number { return this.statPoints; }
  public setStatPoints(val: number): void { this.statPoints = val; this.emitStateUpdate(); }
  public getBaseStats(): { str: number; agi: number; int: number; vit: number } { return this.baseStats; }
  public setBaseStats(stats: { str: number; agi: number; int: number; vit: number }): void {
    this.baseStats = stats;
    this.emitStateUpdate();
  }

  public allocateStatPoint(stat: 'str' | 'agi' | 'int' | 'vit'): boolean {
    if (this.statPoints <= 0) return false;
    this.statPoints--;
    this.baseStats[stat]++;
    this.playerHp = Math.min(this.playerHp, this.getMaxHP());
    this.playerMp = Math.min(this.playerMp, this.getMaxMP());
    this.emitStateUpdate();
    this.scene.events.emit('request-save');
    return true;
  }

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

  public getCompounds(): number { return this.compounds; }
  public setCompounds(val: number): void { this.compounds = val; this.emitStateUpdate(); }

  // ==================== INVENTÓRIO E EQUIPAMENTOS ====================
  public getInventory(): Item[] {
    return this.inventory;
  }

  public setInventory(inv: Item[]): void {
    this.inventory = inv;
    this.emitStateUpdate();
  }

  public getEquipped(): Record<string, Item | null> {
    return this.equipped;
  }

  public setEquipped(eq: Record<string, Item | null>): void {
    this.equipped = eq;
    this.emitStateUpdate();
  }

  public getAttackPower(): number {
    let baseAtk = 20;
    let statBonus = this.baseStats.str * 2;

    switch (this.playerClass) {
      case PlayerClass.PALADIN:
      case PlayerClass.GUARDIAN:
      case PlayerClass.WARRIOR:
        baseAtk = 25;
        statBonus = this.baseStats.str * 2.5;
        break;
      case PlayerClass.MAGE:
      case PlayerClass.NECROMANCER:
        baseAtk = 28;
        statBonus = this.baseStats.int * 2.5;
        break;
      case PlayerClass.ARCHER:
        baseAtk = 22;
        statBonus = this.baseStats.agi * 2.5;
        break;
      case PlayerClass.ASSASSIN:
        baseAtk = 32;
        statBonus = (this.baseStats.str * 1.5) + (this.baseStats.agi * 1.5);
        break;
      case PlayerClass.CLERIC:
        baseAtk = 20;
        statBonus = (this.baseStats.int * 1.5) + (this.baseStats.vit * 1.0);
        break;
    }

    const weapon = this.equipped.WEAPON;
    const bonus = weapon ? (weapon.stats.atk || 0) : 0;
    return Math.floor(baseAtk + statBonus + bonus);
  }

  public getDefense(): number {
    let def = 5;
    if (this.playerClass === PlayerClass.PALADIN) def = 15;
    
    const armor = this.equipped.ARMOR;
    const helmet = this.equipped.HELMET;
    const shield = this.equipped.SHIELD;

    const bonus = (armor ? (armor.stats.def || 0) : 0) +
                  (helmet ? (helmet.stats.def || 0) : 0) +
                  (shield ? (shield.stats.def || 0) : 0);

    return def + bonus;
  }

  public equipItem(itemId: string): void {
    const itemIndex = this.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const item = this.inventory[itemIndex];
    const slotType = item.type; // 'WEAPON' | 'ARMOR' | 'HELMET' | 'SHIELD'

    // Remove do inventário
    this.inventory.splice(itemIndex, 1);

    // Se já havia item equipado no slot, devolve pro inventário
    const previouslyEquipped = this.equipped[slotType];
    if (previouslyEquipped) {
      this.inventory.push(previouslyEquipped);
    }

    // Equipa o item
    this.equipped[slotType] = item;

    // Garante que o HP/MP atual não ultrapassa o novo máximo
    this.playerHp = Math.min(this.playerHp, this.getMaxHP());
    this.playerMp = Math.min(this.playerMp, this.getMaxMP());

    this.emitStateUpdate();
    this.scene.events.emit('update-inventory-ui');
  }

  public unequipItem(slotType: string): void {
    const item = this.equipped[slotType];
    if (!item) return;

    if (this.inventory.length >= 16) {
      const cx = this.scene.cameras.main.scrollX + 240;
      const cy = this.scene.cameras.main.scrollY + 160;
      this.showFloatingText(cx, cy, 'Inventário Cheio!', '#ff4444');
      return;
    }

    this.equipped[slotType] = null;
    this.inventory.push(item);

    this.playerHp = Math.min(this.playerHp, this.getMaxHP());
    this.playerMp = Math.min(this.playerMp, this.getMaxMP());

    this.emitStateUpdate();
    this.scene.events.emit('update-inventory-ui');
  }

  public deleteItem(itemId: string): void {
    const itemIndex = this.inventory.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      this.inventory.splice(itemIndex, 1);
      this.emitStateUpdate();
      this.scene.events.emit('update-inventory-ui');
    }
  }

  // ==================== LOJA, UPGRADES E CONSUMÍVEIS ====================
  public usePotion(itemId: string): boolean {
    const itemIndex = this.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.inventory[itemIndex];
    if (item.type !== 'POTION') return false;

    const isHp = item.name.includes('Vida') || item.name.includes('HP');
    const isMp = item.name.includes('Mana') || item.name.includes('MP');
    const maxHp = this.getMaxHP();
    const maxMp = this.getMaxMP();
    const cx = this.scene.cameras.main.scrollX + 240;
    const cy = this.scene.cameras.main.scrollY + 160;

    if (isHp && this.playerHp >= maxHp) {
      this.showFloatingText(cx, cy, 'Vida já está cheia!', '#ff4444');
      return false;
    }
    if (isMp && this.playerMp >= maxMp) {
      this.showFloatingText(cx, cy, 'Mana já está cheia!', '#ff4444');
      return false;
    }

    this.inventory.splice(itemIndex, 1);

    if (isHp) {
      this.playerHp = Math.min(maxHp, this.playerHp + 50);
      this.showFloatingText(cx, cy, '🧪 HP Recobrado +50!', '#00ff00');
    } else if (isMp) {
      this.playerMp = Math.min(maxMp, this.playerMp + 30);
      this.showFloatingText(cx, cy, '💧 MP Recobrado +30!', '#4488ff');
    }

    this.emitStateUpdate();
    this.scene.events.emit('update-inventory-ui');
    return true;
  }

  public buyItem(itemConfig: Omit<Item, 'id'>, cost: number): boolean {
    const cx = this.scene.cameras.main.scrollX + 240;
    const cy = this.scene.cameras.main.scrollY + 160;
    if (this.gold < cost) {
      this.showFloatingText(cx, cy, 'Ouro Insuficiente!', '#ff4444');
      return false;
    }
    if (this.inventory.length >= 16) {
      this.showFloatingText(cx, cy, 'Inventário Cheio!', '#ff4444');
      return false;
    }

    this.gold -= cost;
    SoundSynth.playBuy();
    const item: Item = {
      ...itemConfig,
      id: `item_${Date.now()}_${Math.random()}`,
    };
    this.inventory.push(item);
    
    this.emitStateUpdate();
    this.scene.events.emit('update-inventory-ui');
    return true;
  }

  public sellItem(itemId: string, value: number): void {
    const itemIndex = this.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    this.inventory.splice(itemIndex, 1);
    this.gold += value;
    SoundSynth.playBuy();

    this.emitStateUpdate();
    this.scene.events.emit('update-inventory-ui');
  }

  public upgradeItem(itemId: string): boolean {
    let item = this.inventory.find(i => i.id === itemId);
    let isEquipped = false;

    if (!item) {
      for (const slot in this.equipped) {
        if (this.equipped[slot]?.id === itemId) {
          item = this.equipped[slot]!;
          isEquipped = true;
          break;
        }
      }
    }

    if (!item || item.type === 'POTION') return false;

    const cx = this.scene.cameras.main.scrollX + 240;
    const cy = this.scene.cameras.main.scrollY + 160;

    if (this.gold < 100 || this.gems < 1) {
      this.showFloatingText(cx, cy, 'Ouro ou Gemas Insuficientes!', '#ff4444');
      return false;
    }

    this.gold -= 100;
    this.gems -= 1;

    const currentLevel = item.upgradeLevel || 0;
    const nextLevel = currentLevel + 1;
    item.upgradeLevel = nextLevel;

    item.name = item.name.replace(/\s\+\d+$/, '');
    item.name = `${item.name} +${nextLevel}`;

    if (item.stats.atk) item.stats.atk += 3;
    if (item.stats.def) item.stats.def += 3;
    if (item.stats.hp) item.stats.hp += 12;
    if (item.stats.mp) item.stats.mp += 8;

    SoundSynth.playUpgrade();
    this.showFloatingText(cx, cy, `Item Aprimorado para +${nextLevel}! ✨`, '#00ff7f');

    this.emitStateUpdate();
    this.scene.events.emit('update-inventory-ui');
    return true;
  }

  // ==================== ATAQUES BÁSICOS (4 NOVAS CLASSES) ====================

  private executeDarkKnightAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playSlash();
    let offsetX = 0; let offsetY = 0;
    switch (direction) {
      case 'left': offsetX = -26; break;
      case 'right': offsetX = 26; break;
      case 'up': offsetY = -26; break;
      case 'down': offsetY = 26; break;
    }
    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;
    this.createHolySlashEffect(attackX, attackY, 0);

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 16);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
    let totalDealt = 0;

    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      if (Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y) < 40) {
        const died = monster.takeDamage(baseDamage);
        totalDealt += baseDamage;
        if (died) this.onMonsterKilled(monster);
      }
    });

    // Dreno de vida passivo (5% do dano causado)
    if (totalDealt > 0) {
      const healAmount = Math.max(1, Math.floor(totalDealt * 0.05));
      this.playerHp = Math.min(this.getMaxHP(), this.playerHp + healAmount);
      this.showFloatingText(player.x, player.y - 14, `+${healAmount} HP`, '#7b68ee');
      this.emitStateUpdate();
    }
  }

  private executeElementalistAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    if (this.playerMp < 6) {
      this.showFloatingText(player.x, player.y - 20, 'Mana Insuficiente!', '#4488ff');
      return;
    }
    this.playerMp -= 6;
    this.emitStateUpdate();
    this.lastPlayerAttackTime = time;
    SoundSynth.playFireball();

    let vx = 0; let vy = 0;
    switch (direction) {
      case 'left': vx = -310; break;
      case 'right': vx = 310; break;
      case 'up': vy = -310; break;
      case 'down': vy = 310; break;
    }

    const proj = this.scene.physics.add.sprite(player.x, player.y - 8, 'mage-proj');
    const colors = [0xff0055, 0x00dfff, 0xffaa00];
    const color = colors[Math.floor(Math.random() * colors.length)];
    proj.setTint(color);
    proj.setDepth(40);
    proj.setVelocity(vx, vy);
    proj.setData('damage', this.getModifiedDamage(this.getAttackPower() * 1.1, player));
    proj.setData('type', 'mage');
    this.projectiles.add(proj);
  }

  private executeBardAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playUpgrade();

    let vx = 0; let vy = 0;
    switch (direction) {
      case 'left': vx = -280; break;
      case 'right': vx = 280; break;
      case 'up': vy = -280; break;
      case 'down': vy = 280; break;
    }

    const wave = this.scene.physics.add.sprite(player.x, player.y - 6, 'mage-proj');
    wave.setTint(0xffd700);
    wave.setDepth(40);
    wave.setScale(1.4);
    wave.setVelocity(vx, vy);
    wave.setData('damage', this.getModifiedDamage(this.getAttackPower(), player));
    wave.setData('type', 'mage');
    this.projectiles.add(wave);
  }

  private executeDruidAttack(player: Phaser.GameObjects.Sprite, direction: string, time: number): void {
    this.lastPlayerAttackTime = time;
    SoundSynth.playSlash();
    let offsetX = 0; let offsetY = 0;
    switch (direction) {
      case 'left': offsetX = -24; break;
      case 'right': offsetX = 24; break;
      case 'up': offsetY = -24; break;
      case 'down': offsetY = 24; break;
    }
    const attackX = player.x + offsetX;
    const attackY = player.y + offsetY;
    this.createHolySlashEffect(attackX, attackY, 0);

    const rawDamage = this.getAttackPower() + Math.floor(Math.random() * 10);
    const baseDamage = this.getModifiedDamage(rawDamage, player);
    this.monsters.forEach((monster) => {
      if (monster.isDead) return;
      if (Phaser.Math.Distance.Between(attackX, attackY, monster.x, monster.y) < 38) {
        const died = monster.takeDamage(baseDamage);
        if (died) this.onMonsterKilled(monster);
      }
    });
  }

  // ==================== HABILIDADES ATIVAS (4 NOVAS CLASSES) ====================

  private useDarkKnightSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Dreno de Vida Sombrio
      SoundSynth.playSlash();
      this.showFloatingText(player.x, player.y - 24, 'DRENO DE VIDA!', '#990033');
      const circle = this.scene.add.graphics();
      circle.setPosition(player.x, player.y);
      circle.fillStyle(0x800020, 0.5);
      circle.fillCircle(0, 0, 80);
      this.scene.tweens.add({ targets: circle, alpha: 0, scaleX: 1.2, scaleY: 1.2, duration: 300, onComplete: () => circle.destroy() });

      let drained = 0;
      const dmg = this.getAttackPower() * 1.8;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 80) {
          m.takeDamage(dmg);
          drained += dmg * 0.25;
        }
      });
      if (drained > 0) {
        this.playerHp = Math.min(this.getMaxHP(), this.playerHp + Math.floor(drained));
        this.showFloatingText(player.x, player.y - 12, `+${Math.floor(drained)} HP`, '#00ff7f');
      }
      return true;
    } else if (index === 1) {
      // 2. Marca Sombria (Amaldiçoa)
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'MARCA SOMBRIA!', '#4b0082');
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 160) {
          m.setTint(0x4b0082);
          m.takeDamage(this.getAttackPower() * 1.2);
        }
      });
      return true;
    } else if (index === 2) {
      // 3. Aura da Sombra
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'AURA DA SOMBRA!', '#220033');
      const auraTimer = this.scene.time.addEvent({
        delay: 500,
        repeat: 5,
        callback: () => {
          if (!player.active) return;
          this.monsters.forEach((m) => {
            if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 90) {
              m.takeDamage(this.getAttackPower() * 0.6);
            }
          });
        }
      });
      return true;
    }
    return false;
  }

  private useElementalistSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Chuva de Meteoros
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'CHUVA DE METEOROS!', '#ff3300');
      let tx = player.x; let ty = player.y;
      if (direction === 'left') tx -= 100;
      if (direction === 'right') tx += 100;
      if (direction === 'up') ty -= 100;
      if (direction === 'down') ty += 100;

      const met = this.scene.add.graphics();
      met.setPosition(tx, ty);
      met.fillStyle(0xff3300, 0.6);
      met.fillCircle(0, 0, 75);
      this.scene.tweens.add({ targets: met, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 400, onComplete: () => met.destroy() });

      const dmg = this.getAttackPower() * 3.0;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(tx, ty, m.x, m.y) < 75) {
          m.takeDamage(dmg);
        }
      });
      return true;
    } else if (index === 1) {
      // 2. Tempestade Elétrica
      SoundSynth.playArrow();
      this.showFloatingText(player.x, player.y - 24, 'TEMPESTADE ELÉTRICA!', '#ffff00');
      const dmg = this.getAttackPower() * 1.5;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 140) {
          m.setTint(0xffff00);
          m.takeDamage(dmg);
          this.scene.time.delayedCall(1500, () => { if (m.active) m.clearTint(); });
        }
      });
      return true;
    } else if (index === 2) {
      // 3. Onda de Gelo
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'ONDA DE GELO (CONGELAMENTO)!', '#00ffff');
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 120) {
          m.setTint(0x00ffff);
          const speed = m.config.speed;
          m.config.speed = 0;
          this.scene.time.delayedCall(3000, () => {
            if (m.active) {
              m.clearTint();
              m.config.speed = speed;
            }
          });
        }
      });
      return true;
    }
    return false;
  }

  private useBardSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Hino da Coragem
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'HINO DA CORAGEM (+30% ATK)!', '#ffd700');
      const ring = this.scene.add.graphics();
      ring.setPosition(player.x, player.y);
      ring.lineStyle(3, 0xffd700, 0.8);
      ring.strokeCircle(0, 0, 100);
      this.scene.tweens.add({ targets: ring, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 500, onComplete: () => ring.destroy() });
      return true;
    } else if (index === 1) {
      // 2. Balada da Regeneração
      SoundSynth.playLoot();
      this.showFloatingText(player.x, player.y - 24, 'BALADA REGENERATIVA!', '#00ff7f');
      const healTimer = this.scene.time.addEvent({
        delay: 1000,
        repeat: 5,
        callback: () => {
          if (!player.active) return;
          this.playerHp = Math.min(this.getMaxHP(), this.playerHp + 25);
          this.playerMp = Math.min(this.getMaxMP(), this.playerMp + 15);
          this.showFloatingText(player.x, player.y - 14, '+25 HP / +15 MP', '#00ff7f');
          this.emitStateUpdate();
        }
      });
      return true;
    } else if (index === 2) {
      // 3. Eco Dissonante
      SoundSynth.playFireball();
      this.showFloatingText(player.x, player.y - 24, 'ECO DISSONANTE!', '#ff00ff');
      const dmg = this.getAttackPower() * 2.2;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 110) {
          m.takeDamage(dmg);
        }
      });
      return true;
    }
    return false;
  }

  private useDruidSkill(player: Phaser.GameObjects.Sprite, index: number, direction: string, time: number): boolean {
    if (index === 0) {
      // 1. Forma de Urso
      SoundSynth.playUpgrade();
      this.showFloatingText(player.x, player.y - 24, 'FORMA DE URSO (+DEF)!', '#8b4513');
      player.setScale(1.4);
      player.setTint(0x8b4513);
      this.scene.time.delayedCall(8000, () => {
        if (player.active) {
          player.setScale(1);
          player.clearTint();
          this.showFloatingText(player.x, player.y - 24, 'Forma de Urso Expirou', '#888888');
        }
      });
      return true;
    } else if (index === 1) {
      // 2. Vinhas Asfixiantes
      SoundSynth.playSlash();
      this.showFloatingText(player.x, player.y - 24, 'VINHAS ASFIXIANTES!', '#228b22');
      const dmg = this.getAttackPower() * 1.6;
      this.monsters.forEach((m) => {
        if (!m.isDead && Phaser.Math.Distance.Between(player.x, player.y, m.x, m.y) < 100) {
          m.setTint(0x228b22);
          m.takeDamage(dmg);
          const origSpeed = m.config.speed;
          m.config.speed = 0;
          this.scene.time.delayedCall(2000, () => {
            if (m.active) {
              m.clearTint();
              m.config.speed = origSpeed;
            }
          });
        }
      });
      return true;
    } else if (index === 2) {
      // 3. Semente da Vida
      SoundSynth.playLoot();
      this.showFloatingText(player.x, player.y - 24, 'SEMENTE DA VIDA!', '#32cd32');
      const bloom = this.scene.add.graphics();
      bloom.setPosition(player.x, player.y);
      bloom.fillStyle(0x32cd32, 0.4);
      bloom.fillCircle(0, 0, 90);
      this.scene.tweens.add({ targets: bloom, alpha: 0, duration: 4000, onComplete: () => bloom.destroy() });

      this.playerHp = Math.min(this.getMaxHP(), this.playerHp + Math.floor(this.getMaxHP() * 0.4));
      this.emitStateUpdate();
      return true;
    }
    return false;
  }
}

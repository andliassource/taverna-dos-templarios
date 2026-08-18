export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardGold: number;
  rewardGems: number;
  rewardTitle?: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  claimed: boolean;
}

export class AchievementSystem {
  private static instance: AchievementSystem;
  private achievements: Record<string, Achievement> = {};
  private activeTitle: string = 'Iniciado';

  private constructor() {
    this.initDefaultAchievements();
    this.loadSaveData();
  }

  public static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem();
    }
    return AchievementSystem.instance;
  }

  private initDefaultAchievements(): void {
    this.achievements = {
      first_blood: {
        id: 'first_blood',
        title: 'Primeiro Sangue',
        description: 'Derrote 1 monstro em combate',
        icon: '⚔️',
        rewardGold: 100,
        rewardGems: 5,
        rewardTitle: 'Caçador Novato',
        progress: 0,
        maxProgress: 1,
        unlocked: false,
        claimed: false,
      },
      monster_slayer_10: {
        id: 'monster_slayer_10',
        title: 'Matador de Feras',
        description: 'Derrote 10 monstros no Plano Astral',
        icon: '🐺',
        rewardGold: 500,
        rewardGems: 15,
        rewardTitle: 'Destruidor de Bestas',
        progress: 0,
        maxProgress: 10,
        unlocked: false,
        claimed: false,
      },
      boss_slayer: {
        id: 'boss_slayer',
        title: 'Lorde Malakor Derrotado',
        description: 'Vença o Chefe Malakor no Evento de Chefe',
        icon: '👑',
        rewardGold: 2000,
        rewardGems: 50,
        rewardTitle: 'Carrasco de Lordes',
        progress: 0,
        maxProgress: 1,
        unlocked: false,
        claimed: false,
      },
      tower_floor_5: {
        id: 'tower_floor_5',
        title: 'Conquistador da Torre',
        description: 'Alcance o Andar 5 da Torre Astral',
        icon: '🏰',
        rewardGold: 1000,
        rewardGems: 30,
        rewardTitle: 'Guardião da Torre',
        progress: 0,
        maxProgress: 5,
        unlocked: false,
        claimed: false,
      },
      master_forge: {
        id: 'master_forge',
        title: 'Mestre da Forja',
        description: 'Aprimore um equipamento para Nível +5 na Forja',
        icon: '🔨',
        rewardGold: 1500,
        rewardGems: 25,
        rewardTitle: 'Ferreiro Lendário',
        progress: 0,
        maxProgress: 5,
        unlocked: false,
        claimed: false,
      },
    };
  }

  public addProgress(id: string, amount: number = 1): void {
    const ach = this.achievements[id];
    if (!ach || ach.unlocked) return;

    ach.progress = Math.min(ach.maxProgress, ach.progress + amount);
    if (ach.progress >= ach.maxProgress) {
      ach.unlocked = true;
    }
    this.saveData();
  }

  public unlock(id: string, _scene?: any): void {
    this.addProgress(id, 9999);
  }

  public getAchievements(): Achievement[] {
    return Object.values(this.achievements);
  }

  public getActiveTitle(): string {
    return this.activeTitle;
  }

  public getEquippedTitle(): string {
    return this.activeTitle;
  }

  public setActiveTitle(title: string): void {
    this.activeTitle = title;
    this.saveData();
  }

  public claimReward(id: string): { gold: number; gems: number } | null {
    const ach = this.achievements[id];
    if (!ach || !ach.unlocked || ach.claimed) return null;

    ach.claimed = true;
    if (ach.rewardTitle) {
      this.activeTitle = ach.rewardTitle;
    }
    this.saveData();
    return { gold: ach.rewardGold, gems: ach.rewardGems };
  }

  private saveData(): void {
    try {
      localStorage.setItem('taverna_achievements', JSON.stringify({
        achievements: this.achievements,
        activeTitle: this.activeTitle,
      }));
    } catch {
      // Ignore in strict mode
    }
  }

  private loadSaveData(): void {
    try {
      const raw = localStorage.getItem('taverna_achievements');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.achievements) {
          Object.assign(this.achievements, data.achievements);
        }
        if (data.activeTitle) {
          this.activeTitle = data.activeTitle;
        }
      }
    } catch {
      // Ignore in strict mode
    }
  }
}

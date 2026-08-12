export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  titleReward?: string;
  unlocked: boolean;
}

export class AchievementSystem {
  private static instance: AchievementSystem;
  private achievements: Record<string, Achievement> = {
    FIRST_BLOOD: {
      id: 'FIRST_BLOOD',
      name: 'Primeiro Sangue',
      description: 'Derrote o primeiro monstro na sua jornada.',
      icon: '⚔️',
      titleReward: 'Novato',
      unlocked: false,
    },
    BOSS_SLAYER: {
      id: 'BOSS_SLAYER',
      name: 'Matador de Reis',
      description: 'Derrote o terrível Lord Malakor na Masmorra.',
      icon: '👑',
      titleReward: 'Matador de Reis',
      unlocked: false,
    },
    GOLD_MAGNET: {
      id: 'GOLD_MAGNET',
      name: 'Rico & Poderoso',
      description: 'Acumule 2.500 moedas de ouro.',
      icon: '💰',
      titleReward: 'Magnata',
      unlocked: false,
    },
    LEVEL_MASTER: {
      id: 'LEVEL_MASTER',
      name: 'Grão-Mestre Templário',
      description: 'Alcançou o Nível 10 de Templário.',
      icon: '🌟',
      titleReward: 'Grão-Mestre',
      unlocked: false,
    },
  };

  private equippedTitle: string | null = null;

  public static getInstance(): AchievementSystem {
    if (!this.instance) {
      this.instance = new AchievementSystem();
    }
    return this.instance;
  }

  public unlock(id: string, scene?: any): void {
    const ach = this.achievements[id];
    if (ach && !ach.unlocked) {
      ach.unlocked = true;

      if (scene) {
        scene.events.emit('show-achievement-banner', ach);
      }
      console.log(`[AchievementSystem] Conquista desbloqueada: ${ach.name}`);
    }
  }

  public isUnlocked(id: string): boolean {
    return this.achievements[id]?.unlocked ?? false;
  }

  public getAchievements(): Achievement[] {
    return Object.values(this.achievements);
  }

  public setEquippedTitle(title: string | null): void {
    this.equippedTitle = title;
  }

  public getEquippedTitle(): string | null {
    return this.equippedTitle;
  }

  public loadSavedAchievements(unlockedIds: string[], title: string | null): void {
    unlockedIds.forEach(id => {
      if (this.achievements[id]) {
        this.achievements[id].unlocked = true;
      }
    });
    this.equippedTitle = title;
  }

  public getUnlockedIds(): string[] {
    return Object.values(this.achievements)
      .filter(a => a.unlocked)
      .map(a => a.id);
  }
}

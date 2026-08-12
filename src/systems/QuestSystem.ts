export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  goldReward: number;
  gemsReward: number;
  completed: boolean;
  claimed: boolean;
}

export class QuestSystem {
  private static instance: QuestSystem;
  private quests: Record<string, Quest> = {
    SKELETON_HUNT: {
      id: 'SKELETON_HUNT',
      title: 'Caçada aos Esqueletos',
      description: 'Elimine 5 Esqueletos para proteger os aldeões.',
      icon: '💀',
      targetCount: 5,
      currentCount: 0,
      goldReward: 150,
      gemsReward: 3,
      completed: false,
      claimed: false,
    },
    BOSS_CHALLENGE: {
      id: 'BOSS_CHALLENGE',
      title: 'O Fim de Lord Malakor',
      description: 'Derrote Lord Malakor nas profundezas da Masmorra.',
      icon: '👑',
      targetCount: 1,
      currentCount: 0,
      goldReward: 500,
      gemsReward: 10,
      completed: false,
      claimed: false,
    },
    ARENA_GLORY: {
      id: 'ARENA_GLORY',
      title: 'Campeão da Arena',
      description: 'Sobreviva a todas as ondas da Arena de Combate.',
      icon: '⚔️',
      targetCount: 1,
      currentCount: 0,
      goldReward: 300,
      gemsReward: 5,
      completed: false,
      claimed: false,
    },
  };

  public static getInstance(): QuestSystem {
    if (!this.instance) {
      this.instance = new QuestSystem();
    }
    return this.instance;
  }

  public trackProgress(questId: string, amount = 1): void {
    const q = this.quests[questId];
    if (q && !q.completed) {
      q.currentCount = Math.min(q.targetCount, q.currentCount + amount);
      if (q.currentCount >= q.targetCount) {
        q.completed = true;
      }
    }
  }

  public claim(questId: string, cs: any): boolean {
    const q = this.quests[questId];
    if (q && q.completed && !q.claimed) {
      q.claimed = true;
      cs.setGold(cs.getGold() + q.goldReward);
      cs.setGems(cs.getGems() + q.gemsReward);
      return true;
    }
    return false;
  }

  public getQuests(): Quest[] {
    return Object.values(this.quests);
  }
}

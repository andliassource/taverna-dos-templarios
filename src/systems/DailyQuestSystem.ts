import { SoundSynth } from '../utils/SoundSynth';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardGold: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
}

export class DailyQuestSystem {
  private static instance: DailyQuestSystem;
  private quests: DailyQuest[] = [];
  private lastResetDay: number = 0;

  private constructor() {
    this.checkDailyReset();
  }

  public static getInstance(): DailyQuestSystem {
    if (!DailyQuestSystem.instance) {
      DailyQuestSystem.instance = new DailyQuestSystem();
    }
    return DailyQuestSystem.instance;
  }

  public checkDailyReset(): void {
    const today = new Date().getDate();
    if (this.lastResetDay !== today || this.quests.length === 0) {
      this.lastResetDay = today;
      this.generateQuests();
    }
  }

  private generateQuests(): void {
    this.quests = [
      {
        id: 'kill_monsters',
        title: '⚔️ Caçador de Monstros',
        description: 'Derrote 10 monstros no mapa ou masmorra',
        targetCount: 10,
        currentCount: 0,
        rewardGold: 500,
        rewardGems: 15,
        completed: false,
        claimed: false,
      },
      {
        id: 'complete_arena',
        title: '🏆 Campeão da Arena',
        description: 'Vença 1 onda de combate na Arena de Batalha',
        targetCount: 1,
        currentCount: 0,
        rewardGold: 800,
        rewardGems: 25,
        completed: false,
        claimed: false,
      },
      {
        id: 'defeat_boss',
        title: '🐉 Algoz do Rei Magma',
        description: 'Derrote o chefe Lorde Malakor na Masmorra',
        targetCount: 1,
        currentCount: 0,
        rewardGold: 1500,
        rewardGems: 50,
        completed: false,
        claimed: false,
      },
    ];
  }

  public getQuests(): DailyQuest[] {
    this.checkDailyReset();
    return this.quests;
  }

  public trackProgress(questId: string, amount = 1): void {
    const q = this.quests.find((item) => item.id === questId);
    if (q && !q.completed) {
      q.currentCount = Math.min(q.targetCount, q.currentCount + amount);
      if (q.currentCount >= q.targetCount) {
        q.completed = true;
        SoundSynth.playUpgrade();
      }
    }
  }

  public claimReward(questId: string, combatSystem: any): boolean {
    const q = this.quests.find((item) => item.id === questId);
    if (q && q.completed && !q.claimed) {
      q.claimed = true;
      combatSystem.addGold(q.rewardGold);
      combatSystem.addGems(q.rewardGems);
      SoundSynth.playLoot();
      return true;
    }
    return false;
  }
}

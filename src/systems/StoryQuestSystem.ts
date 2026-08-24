/**
 * StoryQuestSystem — Campanha Principal com 5 Capítulos e Diálogos de NPCs
 */
export interface StoryChapter {
  id: number;
  title: string;
  npcName: string;
  dialogueText: string;
  objectiveText: string;
  rewardGold: number;
  rewardXp: number;
  isCompleted: boolean;
}

export class StoryQuestSystem {
  private static instance: StoryQuestSystem;

  private currentChapterIndex: number = 0;
  private chapters: StoryChapter[] = [
    {
      id: 1,
      title: 'Capítulo I: O Despertar da Luz',
      npcName: 'Mestre Aldric',
      dialogueText: 'Bem-vindo, Jovem Templário! As trevas de Malakor voltam a se erguer sobre nossas terras. Procure o Ferreiro Bjorn para forjar sua primeira lâmina sagrada.',
      objectiveText: 'Fale com o Ferreiro Bjorn na Forja',
      rewardGold: 200,
      rewardXp: 500,
      isCompleted: false,
    },
    {
      id: 2,
      title: 'Capítulo II: Suprimentos para o Combate',
      npcName: 'Ferreiro Bjorn',
      dialogueText: 'Ah, um enviado de Aldric! Tome estes suprimentos e visite a Mercadora Elise para garantir poções de vida antes de adentrar a masmorra.',
      objectiveText: 'Visite a Mercadora Elise no Mercado',
      rewardGold: 350,
      rewardXp: 800,
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Capítulo III: A Ameaça dos Esqueletos',
      npcName: 'Mercadora Elise',
      dialogueText: 'Os monstros no portão da vila estão atacando nossas caravanas! Derrote 5 Esqueletos para proteger a Taverna.',
      objectiveText: 'Derrote 5 Esqueletos nos arredores',
      rewardGold: 600,
      rewardXp: 1500,
      isCompleted: false,
    },
    {
      id: 4,
      title: 'Capítulo IV: O Companheiro Astral',
      npcName: 'Mestre Aldric',
      dialogueText: 'Sinto um grande poder em você. Reivindique o seu Pet Companheiro na Taverna para ajudá-lo na batalha final.',
      objectiveText: 'Equipe um Pet Companheiro',
      rewardGold: 1000,
      rewardXp: 3000,
      isCompleted: false,
    },
    {
      id: 5,
      title: 'Capítulo V: O Confronto com Malakor',
      npcName: 'Mestre Aldric',
      dialogueText: 'Chegou a hora! Desça até o fundo da Masmorra Profunda e enfrente o Lord Malakor para libertar o Reino dos Templários para sempre!',
      objectiveText: 'Derrote o Lord Malakor na Masmorra',
      rewardGold: 5000,
      rewardXp: 10000,
      isCompleted: false,
    },
  ];

  private constructor() {}

  public static getInstance(): StoryQuestSystem {
    if (!StoryQuestSystem.instance) {
      StoryQuestSystem.instance = new StoryQuestSystem();
    }
    return StoryQuestSystem.instance;
  }

  public getCurrentChapter(): StoryChapter {
    return this.chapters[this.currentChapterIndex] ?? this.chapters[this.chapters.length - 1];
  }

  public completeCurrentChapter(): { chapter: StoryChapter; hasNext: boolean } {
    const ch = this.getCurrentChapter();
    ch.isCompleted = true;
    let hasNext = false;
    if (this.currentChapterIndex < this.chapters.length - 1) {
      this.currentChapterIndex++;
      hasNext = true;
    }
    return { chapter: ch, hasNext };
  }
}

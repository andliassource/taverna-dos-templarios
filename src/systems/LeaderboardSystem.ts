export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  arenaWave: number;
  gold: number;
}

export class LeaderboardSystem {
  private static instance: LeaderboardSystem;

  private mockEntries: LeaderboardEntry[] = [
    { rank: 1, name: 'Sir Galahad', level: 25, arenaWave: 15, gold: 12500 },
    { rank: 2, name: 'Templário Solitário', level: 18, arenaWave: 11, gold: 8400 },
    { rank: 3, name: 'Cavaleiro de Prata', level: 15, arenaWave: 9, gold: 5200 },
    { rank: 4, name: 'Mago Celestial', level: 12, arenaWave: 7, gold: 3100 },
    { rank: 5, name: 'Lâmina Noturna', level: 10, arenaWave: 5, gold: 1900 },
  ];

  public static getInstance(): LeaderboardSystem {
    if (!this.instance) {
      this.instance = new LeaderboardSystem();
    }
    return this.instance;
  }

  public getEntries(): LeaderboardEntry[] {
    return this.mockEntries;
  }
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  arenaWave: number;
  gold: number;
}

export class LeaderboardSystem {
  private static instance: LeaderboardSystem;
  private STORAGE_KEY = 'taverna_leaderboard_v1';

  private entries: LeaderboardEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): LeaderboardSystem {
    if (!this.instance) {
      this.instance = new LeaderboardSystem();
    }
    return this.instance;
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.entries = parsed;
        }
      }
    } catch (e) {
      console.warn('[Leaderboard] Falha ao carregar ranking:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.warn('[Leaderboard] Falha ao salvar ranking:', e);
    }
  }

  public updatePlayerStats(playerName: string, level: number, arenaWave: number, gold: number): void {
    if (!playerName) return;

    let existing = this.entries.find(e => e.name === playerName);
    if (existing) {
      existing.level = Math.max(existing.level, level);
      existing.arenaWave = Math.max(existing.arenaWave, arenaWave);
      existing.gold = Math.max(existing.gold, gold);
    } else {
      this.entries.push({ rank: 0, name: playerName, level, arenaWave, gold });
    }

    this.recalculateRanks();
    this.saveToStorage();
  }

  private recalculateRanks(): void {
    this.entries.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      if (b.arenaWave !== a.arenaWave) return b.arenaWave - a.arenaWave;
      return b.gold - a.gold;
    });

    this.entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
  }

  public getEntries(activePlayerName?: string, activeLevel?: number, activeWave?: number, activeGold?: number): LeaderboardEntry[] {
    if (activePlayerName && activeLevel !== undefined && activeGold !== undefined) {
      this.updatePlayerStats(activePlayerName, activeLevel, activeWave ?? 0, activeGold);
    }
    return this.entries;
  }
}

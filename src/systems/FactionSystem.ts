export interface Faction {
  id: string;
  name: string;
  icon: string;
  reputation: number;
  description: string;
}

export class FactionSystem {
  private static instance: FactionSystem;

  private factions: Record<string, Faction> = {
    SILVER_GUARD: {
      id: 'SILVER_GUARD',
      name: 'Guarda de Prata',
      icon: '🛡️',
      reputation: 250,
      description: 'Protetores honrados da vila e dos templos antigos.',
    },
    SHADOW_BROTHERHOOD: {
      id: 'SHADOW_BROTHERHOOD',
      name: 'Irmandade das Sombras',
      icon: '🗡️',
      reputation: 150,
      description: 'Assassinos letais que dominam os combos de ataque.',
    },
    CELESTIAL_MAGES: {
      id: 'CELESTIAL_MAGES',
      name: 'Magos Celestiais',
      icon: '🔮',
      reputation: 100,
      description: 'Mestres do arcano e caçadores de demônios antigos.',
    },
  };

  public static getInstance(): FactionSystem {
    if (!this.instance) {
      this.instance = new FactionSystem();
    }
    return this.instance;
  }

  public addReputation(id: string, amount: number): void {
    if (this.factions[id]) {
      this.factions[id].reputation += amount;
    }
  }

  public getRank(id: string): string {
    const rep = this.factions[id]?.reputation || 0;
    if (rep >= 1500) return 'EXALTADO';
    if (rep >= 500) return 'RESPEITADO';
    return 'NEUTRO';
  }

  public getFactions(): Faction[] {
    return Object.values(this.factions);
  }
}

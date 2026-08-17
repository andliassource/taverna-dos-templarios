export interface Faction {
  id: string;
  name: string;
  icon: string;
  reputation: number;
  description: string;
}

export interface GuildMember {
  name: string;
  level: number;
  role: 'Líder' | 'Oficial' | 'Membro';
  online: boolean;
}

export interface Guild {
  name: string;
  tag: string;
  level: number;
  exp: number;
  maxExp: number;
  expBuff: number;
  goldBuff: number;
  members: GuildMember[];
}

export class FactionSystem {
  private static instance: FactionSystem;

  private userGuild: Guild | null = {
    name: 'Ordem dos Templários',
    tag: 'TEMPLAR',
    level: 3,
    exp: 4200,
    maxExp: 10000,
    expBuff: 10,
    goldBuff: 15,
    members: [
      { name: 'SirGalahad', level: 25, role: 'Líder', online: true },
      { name: 'Você', level: 12, role: 'Oficial', online: true },
      { name: 'MerlinArcano', level: 18, role: 'Membro', online: true },
      { name: 'SombraLethal', level: 20, role: 'Membro', online: false },
    ],
  };

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

  public getGuild(): Guild | null {
    return this.userGuild;
  }

  public createGuild(name: string, tag: string): Guild {
    this.userGuild = {
      name,
      tag: tag.toUpperCase(),
      level: 1,
      exp: 0,
      maxExp: 5000,
      expBuff: 5,
      goldBuff: 5,
      members: [
        { name: 'Você', level: 1, role: 'Líder', online: true }
      ]
    };
    return this.userGuild;
  }
}

export interface GuildMember {
  uid: string;
  name: string;
  classType: string;
  level: number;
  role: 'MASTER' | 'OFFICER' | 'MEMBER';
  joinedAt: string;
}

export interface GuildData {
  id: string;
  name: string;
  tag: string;
  emblem: string;
  level: number;
  goldTreasury: number;
  members: GuildMember[];
  motd: string; // Message of the Day
}

export class GuildSystem {
  private static instance: GuildSystem;
  private currentGuild: GuildData | null = null;

  private constructor() {
    this.initDefaultGuild();
  }

  public static getInstance(): GuildSystem {
    if (!GuildSystem.instance) {
      GuildSystem.instance = new GuildSystem();
    }
    return GuildSystem.instance;
  }

  private initDefaultGuild(): void {
    this.currentGuild = {
      id: 'guild_001',
      name: 'Ordem dos Templários',
      tag: 'TEMPLAR',
      emblem: '🛡️',
      level: 5,
      goldTreasury: 25000,
      motd: 'Unidos pela Luz Templária! Evento de Raid às 20h!',
      members: [
        { uid: 'm1', name: 'Mestre_SirLancelot', classType: 'PALADIN', level: 60, role: 'MASTER', joinedAt: '2026-01-01' },
        { uid: 'm2', name: 'Lady_Merlin', classType: 'MAGE', level: 58, role: 'OFFICER', joinedAt: '2026-01-05' },
        { uid: 'm3', name: 'Você (Templário)', classType: 'PALADIN', level: 12, role: 'MEMBER', joinedAt: '2026-08-20' },
      ],
    };
  }

  public getCurrentGuild(): GuildData | null {
    return this.currentGuild;
  }

  public depositGold(amount: number): boolean {
    if (this.currentGuild) {
      this.currentGuild.goldTreasury += amount;
      return true;
    }
    return false;
  }
}

/**
 * GuildSystem — Gerenciador de Guildas e Clãs do MMORPG
 */
export interface GuildMember {
  id: string;
  name: string;
  role: 'Mestre' | 'Oficial' | 'Membro';
  level: number;
  contribution: number;
}

export interface GuildData {
  id: string;
  name: string;
  tag: string;
  level: number;
  exp: number;
  maxMembers: number;
  motd: string;
  members: GuildMember[];
}

export class GuildSystem {
  private static instance: GuildSystem;
  private currentGuild: GuildData | null = {
    id: 'templars_order',
    name: 'Ordem dos Templários',
    tag: 'TPL',
    level: 5,
    exp: 4200,
    maxMembers: 30,
    motd: 'Unidos pela Luz Sagrada! Batalhas e Glória nos aguardam!',
    members: [
      { id: '1', name: 'Mestre Sir Arthur', role: 'Mestre', level: 85, contribution: 12500 },
      { id: '2', name: 'Lady Eleanor', role: 'Oficial', level: 78, contribution: 8400 },
      { id: '3', name: 'Templário (Você)', role: 'Membro', level: 42, contribution: 3200 },
    ],
  };

  private constructor() {}

  public static getInstance(): GuildSystem {
    if (!GuildSystem.instance) {
      GuildSystem.instance = new GuildSystem();
    }
    return GuildSystem.instance;
  }

  public getGuild(): GuildData | null {
    return this.currentGuild;
  }

  public createGuild(name: string, tag: string): boolean {
    if (this.currentGuild) return false;
    this.currentGuild = {
      id: `guild_${Date.now()}`,
      name,
      tag: tag.toUpperCase(),
      level: 1,
      exp: 0,
      maxMembers: 20,
      motd: 'Bem-vindos à nova guilda!',
      members: [
        { id: '3', name: 'Templário (Você)', role: 'Mestre', level: 42, contribution: 0 }
      ],
    };
    return true;
  }

  public contribute(gold: number): void {
    if (!this.currentGuild) return;
    this.currentGuild.exp += gold;
    const userMember = this.currentGuild.members.find(m => m.id === '3');
    if (userMember) userMember.contribution += gold;

    if (this.currentGuild.exp >= this.currentGuild.level * 2000) {
      this.currentGuild.level++;
      this.currentGuild.maxMembers += 5;
    }
  }
}

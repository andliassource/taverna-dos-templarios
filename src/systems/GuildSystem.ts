/**
 * GuildSystem — Gerenciador de Guildas com Conceitos Assertivos de MMORPG
 * Suporta: Criação por Ouro/Nível, Solicitação de Entrada, Validação de Nível Mínimo e Gestão de Pedidos pelo Mestre.
 */
export interface GuildMember {
  id: string;
  name: string;
  role: 'Mestre' | 'Oficial' | 'Membro';
  level: number;
  contribution: number;
}

export interface GuildJoinRequest {
  id: string;
  playerName: string;
  playerLevel: number;
  playerClass: string;
  requestedAt: string;
}

export interface PublicGuildInfo {
  id: string;
  name: string;
  tag: string;
  level: number;
  minLevelReq: number;
  memberCount: number;
  maxMembers: number;
  leaderName: string;
  motd: string;
}

export interface GuildData {
  id: string;
  name: string;
  tag: string;
  level: number;
  exp: number;
  minLevelReq: number;
  maxMembers: number;
  motd: string;
  members: GuildMember[];
  joinRequests: GuildJoinRequest[];
}

export class GuildSystem {
  private static instance: GuildSystem;

  private userGuild: GuildData | null = null;
  private pendingRequestGuildId: string | null = null;

  private publicGuildList: PublicGuildInfo[] = [
    {
      id: 'guild_templars',
      name: 'Ordem dos Templários',
      tag: 'TPL',
      level: 5,
      minLevelReq: 10,
      memberCount: 18,
      maxMembers: 30,
      leaderName: 'Sir_Arthur',
      motd: 'Pela Glória dos Templários e Defesa do Reino!',
    },
    {
      id: 'guild_arcanes',
      name: 'Guardiões Arcanos',
      tag: 'ARC',
      level: 3,
      minLevelReq: 15,
      memberCount: 12,
      maxMembers: 25,
      leaderName: 'Maga_Morgana',
      motd: 'Mestres do Fogo e dos Mistérios Antigos.',
    },
    {
      id: 'guild_shadows',
      name: 'Lâminas da Noite',
      tag: 'SLY',
      level: 4,
      minLevelReq: 20,
      memberCount: 22,
      maxMembers: 30,
      leaderName: 'Sombra_Kael',
      motd: 'Silenciosos nas sombras, letais no combate.',
    },
  ];

  private constructor() {}

  public static getInstance(): GuildSystem {
    if (!GuildSystem.instance) {
      GuildSystem.instance = new GuildSystem();
    }
    return GuildSystem.instance;
  }

  public getUserGuild(): GuildData | null {
    return this.userGuild;
  }

  public getPublicGuilds(): PublicGuildInfo[] {
    return this.publicGuildList;
  }

  public getPendingRequestGuildId(): string | null {
    return this.pendingRequestGuildId;
  }

  /**
   * Cria uma nova Guilda
   * Requisito: 1.000 Ouro e Nível Mínimo 10
   */
  public createGuild(name: string, tag: string, minLevel: number, motd: string, playerLevel: number, playerGold: number): { success: boolean; message: string } {
    if (this.userGuild) {
      return { success: false, message: 'Você já pertence a uma guilda!' };
    }
    if (playerLevel < 10) {
      return { success: false, message: 'Você precisa ser pelo menos Nível 10 para fundar uma guilda!' };
    }
    if (playerGold < 1000) {
      return { success: false, message: 'Você precisa de 1.000 Ouro para cobrir os custos de fundação!' };
    }
    if (!name.trim() || tag.length < 2 || tag.length > 4) {
      return { success: false, message: 'Nome inválido ou Tag deve ter entre 2 e 4 letras!' };
    }

    const cleanTag = tag.toUpperCase().trim();
    this.userGuild = {
      id: `guild_${Date.now()}`,
      name: name.trim(),
      tag: cleanTag,
      level: 1,
      exp: 0,
      minLevelReq: Math.max(1, minLevel),
      maxMembers: 20,
      motd: motd.trim() || 'Unidos na batalha!',
      members: [
        { id: 'usr_main', name: 'Templário (Você)', role: 'Mestre', level: playerLevel, contribution: 0 }
      ],
      joinRequests: [
        { id: 'req_1', playerName: 'Guerreiro_Bjorn', playerLevel: 14, playerClass: 'WARRIOR', requestedAt: '18:40' },
        { id: 'req_2', playerName: 'Arqueiro_Robin', playerLevel: 12, playerClass: 'ARCHER', requestedAt: '18:42' },
      ],
    };

    this.pendingRequestGuildId = null;
    return { success: true, message: `Guilda [${cleanTag}] ${name} criada com sucesso! Você é o Mestre.` };
  }

  /**
   * Envia pedido de participação em uma guilda pública
   */
  public requestJoinGuild(guildId: string, playerLevel: number): { success: boolean; message: string } {
    if (this.userGuild) {
      return { success: false, message: 'Você já possui uma guilda!' };
    }

    const target = this.publicGuildList.find(g => g.id === guildId);
    if (!target) return { success: false, message: 'Guilda não encontrada!' };

    if (playerLevel < target.minLevelReq) {
      return { success: false, message: `Nível insuficiente! Esta guilda exige Nível ${target.minLevelReq}+` };
    }

    if (target.memberCount >= target.maxMembers) {
      return { success: false, message: 'Esta guilda está lotada!' };
    }

    this.pendingRequestGuildId = guildId;
    return { success: true, message: `Pedido de admissão enviado para a guilda [${target.tag}] ${target.name}! Aguarde a aprovação do Mestre.` };
  }

  /**
   * Aceita pedido de admissão (Ação do Mestre)
   */
  public acceptRequest(requestId: string): void {
    if (!this.userGuild) return;
    const idx = this.userGuild.joinRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      const req = this.userGuild.joinRequests[idx];
      this.userGuild.members.push({
        id: `usr_${Date.now()}`,
        name: req.playerName,
        role: 'Membro',
        level: req.playerLevel,
        contribution: 0,
      });
      this.userGuild.joinRequests.splice(idx, 1);
    }
  }

  /**
   * Rejeita pedido de admissão (Ação do Mestre)
   */
  public rejectRequest(requestId: string): void {
    if (!this.userGuild) return;
    const idx = this.userGuild.joinRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      this.userGuild.joinRequests.splice(idx, 1);
    }
  }

  /**
   * Doação de Ouro para EXP da Guilda
   */
  public contribute(gold: number): void {
    if (!this.userGuild) return;
    this.userGuild.exp += gold;
    const userMember = this.userGuild.members.find(m => m.id === 'usr_main');
    if (userMember) userMember.contribution += gold;

    if (this.userGuild.exp >= this.userGuild.level * 2000) {
      this.userGuild.level++;
      this.userGuild.maxMembers += 5;
    }
  }

  /**
   * Sair da guilda
   */
  public leaveGuild(): void {
    this.userGuild = null;
    this.pendingRequestGuildId = null;
  }
}

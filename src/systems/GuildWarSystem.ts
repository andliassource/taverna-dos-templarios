export interface TerritoryInfo {
  id: string;
  name: string;
  controllingGuild: string;
  taxRate: number;
  dailyRevenue: number;
}

export class GuildWarSystem {
  private static instance: GuildWarSystem;
  private territories: TerritoryInfo[] = [];

  private constructor() {
    this.initDefaultTerritories();
  }

  public static getInstance(): GuildWarSystem {
    if (!GuildWarSystem.instance) {
      GuildWarSystem.instance = new GuildWarSystem();
    }
    return GuildWarSystem.instance;
  }

  private initDefaultTerritories(): void {
    this.territories = [
      { id: 'ter_1', name: 'Vilarejo Templário', controllingGuild: 'Ordem dos Templários', taxRate: 5, dailyRevenue: 12500 },
      { id: 'ter_2', name: 'Deserto de Cristal', controllingGuild: 'Caçadores do Sol', taxRate: 3, dailyRevenue: 8400 },
      { id: 'ter_3', name: 'Masmorra do Abismo', controllingGuild: 'Ordem dos Templários', taxRate: 8, dailyRevenue: 24000 },
    ];
  }

  public getTerritories(): TerritoryInfo[] {
    return this.territories;
  }
}

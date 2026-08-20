import { SoundSynth } from '../utils/SoundSynth';

export interface GuildInfo {
  name: string;
  faction: 'TEMPLARS' | 'DARK_KNIGHTS';
  territoriesControlled: number;
  membersCount: number;
}

export class GuildSystem {
  private static instance: GuildSystem;
  private currentGuild: GuildInfo = {
    name: 'Ordem dos Templários Sagrados',
    faction: 'TEMPLARS',
    territoriesControlled: 2,
    membersCount: 14,
  };

  private constructor() {}

  public static getInstance(): GuildSystem {
    if (!GuildSystem.instance) {
      GuildSystem.instance = new GuildSystem();
    }
    return GuildSystem.instance;
  }

  public getGuildInfo(): GuildInfo {
    return this.currentGuild;
  }

  public claimTerritory(locationName: string): void {
    this.currentGuild.territoriesControlled++;
    SoundSynth.playUpgrade();
  }
}

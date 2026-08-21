import { SoundSynth } from '../utils/SoundSynth';

export interface PvPOpponent {
  id: string;
  name: string;
  className: string;
  level: number;
  rating: number;
  rankTitle: string;
  icon: string;
}

export class PvPSystem {
  private static instance: PvPSystem;
  private playerRating = 1250;
  private currentRank = 'Gladiador de Bronze';

  private constructor() {}

  public static getInstance(): PvPSystem {
    if (!PvPSystem.instance) {
      PvPSystem.instance = new PvPSystem();
    }
    return PvPSystem.instance;
  }

  public getRating(): number {
    return this.playerRating;
  }

  public getRank(): string {
    return this.currentRank;
  }

  public getOpponents(): PvPOpponent[] {
    return [
      { id: 'pvp_1', name: 'Valerius, o Invicto', className: 'WARRIOR', level: 12, rating: 1300, rankTitle: 'Gladiador de Prata', icon: '⚔️' },
      { id: 'pvp_2', name: 'Lyra, a Sombra', className: 'ASSASSIN', level: 14, rating: 1420, rankTitle: 'Gladiador de Ouro', icon: '🗡️' },
      { id: 'pvp_3', name: 'Ignis, o Flamejante', className: 'MAGE', level: 16, rating: 1550, rankTitle: 'Mestre da Arena', icon: '🔥' },
    ];
  }

  public recordVictory(opponent: PvPOpponent): void {
    this.playerRating += 25;
    if (this.playerRating >= 1500) this.currentRank = 'Mestre da Arena';
    else if (this.playerRating >= 1350) this.currentRank = 'Gladiador de Ouro';
    else if (this.playerRating >= 1200) this.currentRank = 'Gladiador de Prata';
    SoundSynth.playUpgrade();
  }
}

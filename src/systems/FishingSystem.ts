import { SoundSynth } from '../utils/SoundSynth';

export interface FishCatch {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  valueGold: number;
  gemsReward: number;
  gold: number;
  gems: number;
  icon: string;
}

export class FishingSystem {
  private static instance: FishingSystem;
  private isFishing = false;
  private isHooked = false;

  private constructor() {}

  public static getInstance(): FishingSystem {
    if (!FishingSystem.instance) {
      FishingSystem.instance = new FishingSystem();
    }
    return FishingSystem.instance;
  }

  public getIsHooked(): boolean {
    return this.isHooked;
  }

  public startFishing(x?: number, y?: number, map?: string, level?: number): void {
    this.isFishing = true;
    this.isHooked = true;
    SoundSynth.playLoot();
  }

  public reelIn(success?: boolean): FishCatch {
    return this.castRod();
  }

  public castRod(): FishCatch {
    this.isFishing = true;
    this.isHooked = false;
    SoundSynth.playLoot();

    const roll = Math.random();
    if (roll > 0.85) {
      return { id: 'fish_dragon', name: 'Carpa Dourada das Marés', rarity: 'LEGENDARY', valueGold: 1200, gemsReward: 20, gold: 1200, gems: 20, icon: '🐠' };
    } else if (roll > 0.5) {
      return { id: 'fish_blue', name: 'Peixe-Sol Celestial', rarity: 'RARE', valueGold: 450, gemsReward: 5, gold: 450, gems: 5, icon: '🐟' };
    }
    return { id: 'fish_common', name: 'Truta do Lago Templário', rarity: 'COMMON', valueGold: 150, gemsReward: 0, gold: 150, gems: 0, icon: '🎣' };
  }
}

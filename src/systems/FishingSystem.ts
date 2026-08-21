import { SoundSynth } from '../utils/SoundSynth';

export interface FishCatch {
  id: string;
  name: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  valueGold: number;
  gemsReward: number;
  icon: string;
}

export class FishingSystem {
  private static instance: FishingSystem;
  private isFishing = false;

  private constructor() {}

  public static getInstance(): FishingSystem {
    if (!FishingSystem.instance) {
      FishingSystem.instance = new FishingSystem();
    }
    return FishingSystem.instance;
  }

  public castRod(): FishCatch {
    this.isFishing = true;
    SoundSynth.playLoot();

    const roll = Math.random();
    if (roll > 0.85) {
      return { id: 'fish_dragon', name: 'Carpa Dourada das Marés', rarity: 'LEGENDARY', valueGold: 1200, gemsReward: 20, icon: '🐠' };
    } else if (roll > 0.5) {
      return { id: 'fish_blue', name: 'Peixe-Sol Celestial', rarity: 'RARE', valueGold: 450, gemsReward: 5, icon: '🐟' };
    }
    return { id: 'fish_common', name: 'Truta do Lago Templário', rarity: 'COMMON', valueGold: 150, gemsReward: 0, icon: '🎣' };
  }
}

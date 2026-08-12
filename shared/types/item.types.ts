export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'HELMET' | 'SHIELD' | 'POTION';
  stats: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
  };
  icon: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  upgradeLevel?: number; // Ex: +1, +2, +3...
  rune?: 'FLAME' | 'TEMPEST' | 'VAMPIRISM' | 'SHADOW';
}

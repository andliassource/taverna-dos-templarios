export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'HELMET' | 'SHIELD';
  stats: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
  };
  icon: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

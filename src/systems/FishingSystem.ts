export interface FishCatch {
  name: string;
  icon: string;
  gold: number;
  gems: number;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
}

export class FishingSystem {
  private static instance: FishingSystem;
  private isFishing = false;
  private isHooked = false;

  private catches: FishCatch[] = [
    { name: 'Carpa prateada', icon: '🐟', gold: 35, gems: 0, rarity: 'COMMON' },
    { name: 'Peixe Místico Azul', icon: '🐠', gold: 90, gems: 1, rarity: 'RARE' },
    { name: 'Rei Dourado das Águas', icon: '👑', gold: 350, gems: 3, rarity: 'LEGENDARY' },
  ];

  public static getInstance(): FishingSystem {
    if (!this.instance) {
      this.instance = new FishingSystem();
    }
    return this.instance;
  }

  public startFishing(scene: any, cs: any, onHook: () => void, onSuccess: (catchItem: FishCatch) => void): void {
    if (this.isFishing) return;
    this.isFishing = true;
    this.isHooked = false;

    const delay = 1500 + Math.random() * 2000;
    scene.time.delayedCall(delay, () => {
      this.isHooked = true;
      onHook();

      // Janela de fisgada de 900ms
      scene.time.delayedCall(900, () => {
        if (this.isFishing && this.isHooked) {
          this.isFishing = false;
          this.isHooked = false;
        }
      });
    });
  }

  public reelIn(cs: any): FishCatch | null {
    if (this.isFishing && this.isHooked) {
      this.isFishing = false;
      this.isHooked = false;

      const rand = Math.random();
      const catchItem = rand < 0.15 ? this.catches[2] : rand < 0.45 ? this.catches[1] : this.catches[0];

      cs.setGold(cs.getGold() + catchItem.gold);
      cs.setGems(cs.getGems() + catchItem.gems);

      return catchItem;
    }
    return null;
  }

  public getIsFishing(): boolean {
    return this.isFishing;
  }

  public getIsHooked(): boolean {
    return this.isHooked;
  }
}

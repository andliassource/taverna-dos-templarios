/**
 * WorldBossRaidSystem — Eventos de Chefe Mundial (World Boss Raids)
 */
export interface WorldBossEvent {
  bossName: string;
  bossTitle: string;
  currentHp: number;
  maxHp: number;
  locationName: string;
  isActive: boolean;
  rewardPoolGold: number;
}

export class WorldBossRaidSystem {
  private static instance: WorldBossRaidSystem;

  private currentEvent: WorldBossEvent = {
    bossName: 'Lord Malakor — O Devorador de Almas',
    bossTitle: 'CHEFE MUNDIAL ATIVO',
    currentHp: 8500,
    maxHp: 10000,
    locationName: 'Praça da Vila Templária',
    isActive: true,
    rewardPoolGold: 50000,
  };

  private constructor() {}

  public static getInstance(): WorldBossRaidSystem {
    if (!WorldBossRaidSystem.instance) {
      WorldBossRaidSystem.instance = new WorldBossRaidSystem();
    }
    return WorldBossRaidSystem.instance;
  }

  public getEvent(): WorldBossEvent {
    return this.currentEvent;
  }

  public dealDamageToBoss(amount: number): boolean {
    if (!this.currentEvent.isActive) return false;
    this.currentEvent.currentHp = Math.max(0, this.currentEvent.currentHp - amount);
    if (this.currentEvent.currentHp === 0) {
      this.currentEvent.isActive = false;
      return true; // Boss derrotado!
    }
    return false;
  }
}

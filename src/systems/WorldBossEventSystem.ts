export interface WorldBossEvent {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  hpPercent: number;
  timeRemainingMinutes: number;
  topDamager: string;
}

export class WorldBossEventSystem {
  private static instance: WorldBossEventSystem;
  private currentEvent: WorldBossEvent | null = null;

  private constructor() {
    this.initDefaultEvent();
  }

  public static getInstance(): WorldBossEventSystem {
    if (!WorldBossEventSystem.instance) {
      WorldBossEventSystem.instance = new WorldBossEventSystem();
    }
    return WorldBossEventSystem.instance;
  }

  private initDefaultEvent(): void {
    this.currentEvent = {
      id: 'boss_evt_01',
      name: '🐲 Dragão Ancião de Magma',
      location: 'Deserto de Cristal (Canal 1)',
      isActive: false,
      hpPercent: 78,
      timeRemainingMinutes: 14,
      topDamager: 'Mestre_SirLancelot (48.500 Dano)',
    };
  }

  public getCurrentEvent(): WorldBossEvent | null {
    return this.currentEvent;
  }
}

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
      location: 'Masmorra dos Templários (Canal 1)',
      isActive: false,
      hpPercent: 100,
      timeRemainingMinutes: 0,
      topDamager: 'Nenhum Dano Registrado',
    };
  }

  public getCurrentEvent(): WorldBossEvent | null {
    return this.currentEvent;
  }

  public activateBossEvent(name = '🐲 Dragão Ancião de Magma'): void {
    if (this.currentEvent) {
      this.currentEvent.name = name;
      this.currentEvent.isActive = true;
      this.currentEvent.hpPercent = 100;
      this.currentEvent.timeRemainingMinutes = 30;
      this.currentEvent.topDamager = 'Nenhum Dano Registrado';
    }
  }

  public recordDamage(playerName: string, damage: number): void {
    if (this.currentEvent && this.currentEvent.isActive) {
      this.currentEvent.topDamager = `${playerName} (${damage.toLocaleString('pt-BR')} Dano)`;
    }
  }
}

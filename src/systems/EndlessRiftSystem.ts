import { SoundSynth } from '../utils/SoundSynth';

export class EndlessRiftSystem {
  private static instance: EndlessRiftSystem;
  private currentFloor = 1;
  private maxFloorReached = 1;

  private constructor() {}

  public static getInstance(): EndlessRiftSystem {
    if (!EndlessRiftSystem.instance) {
      EndlessRiftSystem.instance = new EndlessRiftSystem();
    }
    return EndlessRiftSystem.instance;
  }

  public getFloor(): number {
    return this.currentFloor;
  }

  public advanceFloor(): void {
    this.currentFloor++;
    if (this.currentFloor > this.maxFloorReached) {
      this.maxFloorReached = this.currentFloor;
      SoundSynth.playUpgrade();
    }
  }

  public getModifier(): string {
    const modifiers = [
      '🔥 Inimigos causam dano de fogo bônus',
      '⚡ Velocidade de ataque dos monstros +25%',
      '🛡️ Resistência a dano físico dos monstros +30%',
      '❄️ Magias consomem +50% de Mana',
    ];
    return modifiers[(this.currentFloor - 1) % modifiers.length];
  }
}

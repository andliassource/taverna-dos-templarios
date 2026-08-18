import { SoundSynth } from '../utils/SoundSynth';

export interface PetItem {
  id: string;
  name: string;
  type: 'PET' | 'MOUNT';
  icon: string;
  tier: 'RARO' | 'ÉPICO' | 'LENDÁRIO';
  description: string;
  buffText: string;
  damageBonus: number;
  speedBonus: number;
  unlocked: boolean;
}

export class PetSystem {
  private static instance: PetSystem;

  private items: PetItem[] = [
    {
      id: 'dragon',
      name: 'Dragão de Fogo',
      type: 'PET',
      icon: '🐉',
      tier: 'LENDÁRIO',
      description: 'Filhote de dragão ancestral. Concede +15% Dano Físico e Mágico.',
      buffText: '+15% Dano Físico & Mágico',
      damageBonus: 0.15,
      speedBonus: 0,
      unlocked: true,
    },
    {
      id: 'wolf',
      name: 'Lobo Astral',
      type: 'PET',
      icon: '🐺',
      tier: 'ÉPICO',
      description: 'Lobo guardião da noite. Concede +20% Velocidade de Movimento.',
      buffText: '+20% Velocidade de Movimento',
      damageBonus: 0,
      speedBonus: 0.20,
      unlocked: true,
    },
    {
      id: 'phoenix',
      name: 'Fênix Sagrada',
      type: 'PET',
      icon: '🦅',
      tier: 'LENDÁRIO',
      description: 'Ave mística ressuscitadora. Ressuscita o jogador a cada 3 minutos.',
      buffText: '+10% Vida Máxima & Ressurreição',
      damageBonus: 0.05,
      speedBonus: 0.05,
      unlocked: true,
    },
    {
      id: 'warhorse',
      name: 'Cavalo de Guerra Templário',
      type: 'MOUNT',
      icon: '🐎',
      tier: 'ÉPICO',
      description: 'Corcel blindado da Ordem. Aumenta a velocidade no mapa aberto em +50%.',
      buffText: '+50% Velocidade de Montaria',
      damageBonus: 0,
      speedBonus: 0.50,
      unlocked: true,
    },
  ];

  private activePetId: string | null = 'dragon';
  private activeMountId: string | null = 'warhorse';
  private lastPhoenixReviveTime = 0;

  private constructor() {}

  public static getInstance(): PetSystem {
    if (!PetSystem.instance) {
      PetSystem.instance = new PetSystem();
    }
    return PetSystem.instance;
  }

  public getItems(): PetItem[] {
    return this.items;
  }

  public getPets(): PetItem[] {
    return this.items.filter((i) => i.type === 'PET');
  }

  public getActivePet(): PetItem | null {
    if (!this.activePetId) return null;
    return this.items.find((p) => p.id === this.activePetId) ?? null;
  }

  public getActiveMount(): PetItem | null {
    if (!this.activeMountId) return null;
    return this.items.find((p) => p.id === this.activeMountId) ?? null;
  }

  public equip(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (!item || !item.unlocked) return;

    if (item.type === 'PET') {
      this.activePetId = this.activePetId === id ? null : id;
    } else {
      this.activeMountId = this.activeMountId === id ? null : id;
    }
    SoundSynth.playUpgrade();
  }

  public setActivePet(id: string): void {
    this.equip(id);
  }

  public canPhoenixRevive(now: number): boolean {
    if (this.activePetId !== 'phoenix') return false;
    return now - this.lastPhoenixReviveTime > 180_000;
  }

  public getXpMultiplier(): number {
    return 1.0;
  }

  public triggerPhoenixRevive(now: number): void {
    this.lastPhoenixReviveTime = now;
  }
}

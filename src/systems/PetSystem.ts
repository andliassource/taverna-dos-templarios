export interface PetItem {
  id: string;
  name: string;
  icon: string;
  type: 'PET' | 'MOUNT';
  description: string;
  unlocked: boolean;
}

export class PetSystem {
  private static instance: PetSystem;

  private items: Record<string, PetItem> = {
    CELESTIAL_WOLF: {
      id: 'CELESTIAL_WOLF',
      name: 'Lobo Celestial',
      icon: '🐺',
      type: 'PET',
      description: '+10% de Dano Físico e Mágico em todos os ataques.',
      unlocked: true,
    },
    PHOENIX: {
      id: 'PHOENIX',
      name: 'Fênix Flamejante',
      icon: '🔥',
      type: 'PET',
      description: 'Regenera +5 HP a cada 3 segundos em combate.',
      unlocked: true,
    },
    OWL: {
      id: 'OWL',
      name: 'Coruja Sabedora',
      icon: '🦉',
      type: 'PET',
      description: '+15% de Experiência (XP) ganha de monstros.',
      unlocked: true,
    },
    HORSE: {
      id: 'HORSE',
      name: 'Corcel Dourado',
      icon: '🐎',
      type: 'MOUNT',
      description: '+50% de Velocidade de Movimento no mapa.',
      unlocked: true,
    },
    DRAGON: {
      id: 'DRAGON',
      name: 'Dragão de Cristal',
      icon: '🐲',
      type: 'MOUNT',
      description: '+70% de Velocidade de Movimento no mapa.',
      unlocked: false,
    },
  };

  private activePetId: string | null = 'CELESTIAL_WOLF';
  private activeMountId: string | null = 'HORSE';

  public static getInstance(): PetSystem {
    if (!this.instance) {
      this.instance = new PetSystem();
    }
    return this.instance;
  }

  public getItems(): PetItem[] {
    return Object.values(this.items);
  }

  public getActivePet(): PetItem | null {
    return this.activePetId ? this.items[this.activePetId] : null;
  }

  public getActiveMount(): PetItem | null {
    return this.activeMountId ? this.items[this.activeMountId] : null;
  }

  public equip(id: string): void {
    const item = this.items[id];
    if (!item || !item.unlocked) return;

    if (item.type === 'PET') {
      this.activePetId = this.activePetId === id ? null : id;
    } else {
      this.activeMountId = this.activeMountId === id ? null : id;
    }
  }

  public getSpeedMultiplier(): number {
    if (this.activeMountId === 'HORSE') return 1.5;
    if (this.activeMountId === 'DRAGON') return 1.7;
    return 1.0;
  }

  public getDamageMultiplier(): number {
    return this.activePetId === 'CELESTIAL_WOLF' ? 1.10 : 1.0;
  }

  public getXpMultiplier(): number {
    return this.activePetId === 'OWL' ? 1.15 : 1.0;
  }
}

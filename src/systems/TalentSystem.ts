export interface TalentNode {
  id: string;
  name: string;
  branch: 'DEFENSE' | 'OFFENSE' | 'UTILITY';
  icon: string;
  description: string;
  points: number;
  maxPoints: number;
}

export class TalentSystem {
  private static instance: TalentSystem;
  private nodes: Record<string, TalentNode> = {
    STEEL_SKIN: {
      id: 'STEEL_SKIN',
      name: 'Pele de Aço',
      branch: 'DEFENSE',
      icon: '🛡️',
      description: '+5% de Defesa por ponto alocado.',
      points: 0,
      maxPoints: 5,
    },
    CRIT_PRECISION: {
      id: 'CRIT_PRECISION',
      name: 'Precisão Mortal',
      branch: 'OFFENSE',
      icon: '🎯',
      description: '+3% de Chance de Crítico por ponto alocado.',
      points: 0,
      maxPoints: 5,
    },
    FLUID_MIND: {
      id: 'FLUID_MIND',
      name: 'Mente Fluida',
      branch: 'UTILITY',
      icon: '⚡',
      description: '+5% de Redução de Recarga de habilidades.',
      points: 0,
      maxPoints: 5,
    },
    VAMPIRE_TOUCH: {
      id: 'VAMPIRE_TOUCH',
      name: 'Toque Vampírico',
      branch: 'OFFENSE',
      icon: '🩸',
      description: '+5% de Roubo de Vida permanente.',
      points: 0,
      maxPoints: 1,
    },
  };

  private availablePoints = 5;

  public static getInstance(): TalentSystem {
    if (!this.instance) {
      this.instance = new TalentSystem();
    }
    return this.instance;
  }

  public addPoints(amount = 1): void {
    this.availablePoints += amount;
  }

  public allocate(id: string): boolean {
    const node = this.nodes[id];
    if (node && this.availablePoints > 0 && node.points < node.maxPoints) {
      node.points++;
      this.availablePoints--;
      return true;
    }
    return false;
  }

  public reset(cs: any): boolean {
    if (cs.getGold() < 200) return false;
    cs.setGold(cs.getGold() - 200);

    let refunded = 0;
    Object.values(this.nodes).forEach(n => {
      refunded += n.points;
      n.points = 0;
    });

    this.availablePoints += refunded;
    return true;
  }

  public getNodes(): TalentNode[] {
    return Object.values(this.nodes);
  }

  public getAvailablePoints(): number {
    return this.availablePoints;
  }

  public getBonusDamageMultiplier(): number {
    return 1 + (this.nodes.CRIT_PRECISION.points * 0.04);
  }

  public getDefenseBonusMultiplier(): number {
    return 1 + (this.nodes.STEEL_SKIN.points * 0.05);
  }
}

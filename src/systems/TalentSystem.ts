import { SoundSynth } from '../utils/SoundSynth';

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  branch: 'light' | 'fire' | 'ice';
  icon: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
}

export class TalentSystem {
  private static instance: TalentSystem;
  private availablePoints = 5;
  private nodes: TalentNode[] = [];

  private constructor() {
    this.initTalentTree();
  }

  public static getInstance(): TalentSystem {
    if (!TalentSystem.instance) {
      TalentSystem.instance = new TalentSystem();
    }
    return TalentSystem.instance;
  }

  private initTalentTree(): void {
    this.nodes = [
      // Ramos de Luz Sagrada
      { id: 'light_hp', name: 'Bênção Divina', description: '+15% de HP Máximo', branch: 'light', icon: '✨', level: 0, maxLevel: 5, unlocked: true },
      { id: 'light_heal', name: 'Aura Regenerativa', description: 'Regenera 2% de HP por segundo', branch: 'light', icon: '💖', level: 0, maxLevel: 3, unlocked: false },

      // Ramos de Fogo Arcano
      { id: 'fire_atk', name: 'Lâmina Incandescente', description: '+20% de Dano Físico e Mágico', branch: 'fire', icon: '🔥', level: 0, maxLevel: 5, unlocked: true },
      { id: 'fire_crit', name: 'Golpe Devastador', description: '+10% de Taxa Crítica', branch: 'fire', icon: '💥', level: 0, maxLevel: 3, unlocked: false },

      // Ramos de Gelo Ancestral
      { id: 'ice_def', name: 'Escudo Gelado', description: '+25% de Armadura e Defesa', branch: 'ice', icon: '❄️', level: 0, maxLevel: 5, unlocked: true },
      { id: 'ice_dodge', name: 'Esquiva Glacial', description: '+12% de Esquiva em Combate', branch: 'ice', icon: '🛡️', level: 0, maxLevel: 3, unlocked: false },
    ];
  }

  public getNodes(): TalentNode[] {
    return this.nodes;
  }

  public getPoints(): number {
    return this.availablePoints;
  }

  public addPoint(): void {
    this.availablePoints++;
  }

  public upgradeTalent(nodeId: string): boolean {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node && node.unlocked && node.level < node.maxLevel && this.availablePoints > 0) {
      node.level++;
      this.availablePoints--;
      SoundSynth.playUpgrade();
      return true;
    }
    return false;
  }
}

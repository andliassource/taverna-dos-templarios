/**
 * GatheringSystem — Profissões de Pesca e Mineração de Recursos
 */
export interface GatheringNode {
  id: string;
  type: 'FISHING' | 'MINING';
  name: string;
  x: number;
  y: number;
  resourceName: string;
  resourceIcon: string;
}

export class GatheringSystem {
  private static instance: GatheringSystem;

  private nodes: GatheringNode[] = [
    { id: 'fish_1', type: 'FISHING', name: 'Lago Cristalino', x: 450, y: 1100, resourceName: 'Peixe Solar Mágico', resourceIcon: '🐟' },
    { id: 'fish_2', type: 'FISHING', name: 'Rio da Taverna', x: 1200, y: 1150, resourceName: 'Salmão Estelar Épico', resourceIcon: '🐠' },
    { id: 'mine_1', type: 'MINING', name: 'Veio de Titânio', x: 250, y: 350, resourceName: 'Minério de Titânio', resourceIcon: '⛏️' },
    { id: 'mine_2', type: 'MINING', name: 'Rocha Arcar', x: 1400, y: 400, resourceName: 'Gema Solar Lendária', resourceIcon: '💎' },
  ];

  private constructor() {}

  public static getInstance(): GatheringSystem {
    if (!GatheringSystem.instance) {
      GatheringSystem.instance = new GatheringSystem();
    }
    return GatheringSystem.instance;
  }

  public getNodes(): GatheringNode[] {
    return this.nodes;
  }

  public gatherResource(nodeId: string): { success: boolean; message: string; resourceName: string } {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return { success: false, message: 'Ponto não encontrado', resourceName: '' };

    return {
      success: true,
      message: `Você coletou ${node.resourceIcon} ${node.resourceName}!`,
      resourceName: node.resourceName,
    };
  }
}

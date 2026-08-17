export interface Recipe {
  id: string;
  name: string;
  icon: string;
  category: 'Armas' | 'Armaduras' | 'Acessórios';
  levelReq: number;
  materials: { item: string; amount: number }[];
  resultItem: {
    id: string;
    name: string;
    statBonus: string;
    rarity: 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  };
}

export class CraftingSystem {
  private static instance: CraftingSystem;

  private recipes: Recipe[] = [
    {
      id: 'templar_sword',
      name: 'Espada do Sol Templário',
      icon: '⚔️',
      category: 'Armas',
      levelReq: 5,
      materials: [
        { item: 'Minério de Ferro', amount: 5 },
        { item: 'Essência de Luz', amount: 2 },
      ],
      resultItem: {
        id: 'sword_templar_sun',
        name: 'Espada do Sol Templário',
        statBonus: '+25 Dano Físico, +5% Crítico',
        rarity: 'Raro',
      },
    },
    {
      id: 'dragon_plate',
      name: 'Armadura de Placas de Dragão',
      icon: '🛡️',
      category: 'Armaduras',
      levelReq: 10,
      materials: [
        { item: 'Escama de Dragão', amount: 3 },
        { item: 'Minério de Ferro', amount: 10 },
      ],
      resultItem: {
        id: 'armor_dragon_plate',
        name: 'Armadura de Placas de Dragão',
        statBonus: '+150 HP, +30 Defesa',
        rarity: 'Épico',
      },
    },
    {
      id: 'arcane_ring',
      name: 'Anel Arcano das Marés',
      icon: '💍',
      category: 'Acessórios',
      levelReq: 8,
      materials: [
        { item: 'Gema Azul', amount: 4 },
        { item: 'Essência de Luz', amount: 4 },
      ],
      resultItem: {
        id: 'ring_arcane_tides',
        name: 'Anel Arcano das Marés',
        statBonus: '+80 MP, +15 Dano Mágico',
        rarity: 'Raro',
      },
    },
  ];

  public static getInstance(): CraftingSystem {
    if (!CraftingSystem.instance) {
      CraftingSystem.instance = new CraftingSystem();
    }
    return CraftingSystem.instance;
  }

  public getRecipes(): Recipe[] {
    return this.recipes;
  }

  public craftItem(recipeId: string): { success: boolean; message: string } {
    const recipe = this.recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      return { success: false, message: 'Receita não encontrada.' };
    }
    return {
      success: true,
      message: `✨ ${recipe.resultItem.name} forjado com sucesso! (${recipe.resultItem.statBonus})`,
    };
  }
}

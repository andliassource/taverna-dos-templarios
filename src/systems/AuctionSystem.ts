/**
 * AuctionSystem — Casa de Leilões e Mercado Livre Entre Jogadores
 */
export interface AuctionListing {
  id: string;
  sellerName: string;
  itemName: string;
  itemIcon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  priceGold: number;
  timeLeftHours: number;
  statsText: string;
}

export class AuctionSystem {
  private static instance: AuctionSystem;

  private listings: AuctionListing[] = [
    {
      id: 'auc_1',
      sellerName: 'Sir Galahad',
      itemName: 'Lâmina do Sol Sagrado',
      itemIcon: '🗡️',
      rarity: 'LEGENDARY',
      priceGold: 2500,
      timeLeftHours: 18,
      statsText: '+45 ATK | +12% Crítico',
    },
    {
      id: 'auc_2',
      sellerName: 'Maga Morgana',
      itemName: 'Cajado de Cristal Arcano',
      itemIcon: '🔮',
      rarity: 'EPIC',
      priceGold: 1200,
      timeLeftHours: 12,
      statsText: '+38 ATK Mágico | +50 MP',
    },
    {
      id: 'auc_3',
      sellerName: 'Robin do Bosque',
      itemName: 'Arco do Vento Épico',
      itemIcon: '🏹',
      rarity: 'EPIC',
      priceGold: 950,
      timeLeftHours: 24,
      statsText: '+32 ATK | +15% Vel. Ataque',
    },
    {
      id: 'auc_4',
      sellerName: 'Ferreiro Bjorn',
      itemName: 'Escudo Maciço de Titânio',
      itemIcon: '🛡️',
      rarity: 'RARE',
      priceGold: 450,
      timeLeftHours: 8,
      statsText: '+28 DEF | +100 HP',
    },
  ];

  private constructor() {}

  public static getInstance(): AuctionSystem {
    if (!AuctionSystem.instance) {
      AuctionSystem.instance = new AuctionSystem();
    }
    return AuctionSystem.instance;
  }

  public getListings(): AuctionListing[] {
    return this.listings;
  }

  public buyItem(id: string): AuctionListing | null {
    const idx = this.listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      const item = this.listings[idx];
      this.listings.splice(idx, 1);
      return item;
    }
    return null;
  }

  public listItem(name: string, icon: string, rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY', price: number, stats: string): void {
    this.listings.unshift({
      id: `auc_${Date.now()}`,
      sellerName: 'Templário (Você)',
      itemName: name,
      itemIcon: icon,
      rarity,
      priceGold: price,
      timeLeftHours: 24,
      statsText: stats,
    });
  }
}

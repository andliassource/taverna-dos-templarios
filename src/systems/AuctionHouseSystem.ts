import { Item } from '../../shared/types/item.types';

export interface AuctionListing {
  id: string;
  sellerName: string;
  item: Item;
  priceGold: number;
  listedAt: string;
}

export class AuctionHouseSystem {
  private static instance: AuctionHouseSystem;
  private listings: AuctionListing[] = [];

  private constructor() {
    this.initDefaultListings();
  }

  public static getInstance(): AuctionHouseSystem {
    if (!AuctionHouseSystem.instance) {
      AuctionHouseSystem.instance = new AuctionHouseSystem();
    }
    return AuctionHouseSystem.instance;
  }

  private initDefaultListings(): void {
    this.listings = [
      {
        id: 'auc_1',
        sellerName: 'Mestre_SirLancelot',
        item: {
          id: 'item_sword_leg',
          name: 'Excalibur Templária',
          description: 'Lâmina abençoada pelos templários anciões.',
          type: 'WEAPON',
          rarity: 'LEGENDARY',
          icon: '⚔️',
          stats: { atk: 180 },
        },
        priceGold: 4500,
        listedAt: 'Hoje',
      },
      {
        id: 'auc_2',
        sellerName: 'Lady_Merlin',
        item: {
          id: 'item_ring_epic',
          name: 'Anel Arcano do Abismo',
          description: 'Aumenta imensamente o poder mágico e regeneração de Mana.',
          type: 'ARMOR',
          rarity: 'EPIC',
          icon: '💍',
          stats: { mp: 120 },
        },
        priceGold: 1800,
        listedAt: 'Hoje',
      },
      {
        id: 'auc_3',
        sellerName: 'Gavião_Arqueiro',
        item: {
          id: 'item_bow_rare',
          name: 'Arco de Prata Vulcânica',
          description: 'Dispara flechas incandescentes com grande velocidade.',
          type: 'WEAPON',
          rarity: 'RARE',
          icon: '🏹',
          stats: { atk: 95 },
        },
        priceGold: 950,
        listedAt: 'Hoje',
      },
    ];
  }

  public getListings(): AuctionListing[] {
    return this.listings;
  }

  public buyListing(id: string): AuctionListing | null {
    const idx = this.listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      const purchased = this.listings[idx];
      this.listings.splice(idx, 1);
      return purchased;
    }
    return null;
  }

  public addListing(sellerName: string, item: Item, priceGold: number): void {
    this.listings.push({
      id: `auc_${Date.now()}`,
      sellerName,
      item,
      priceGold,
      listedAt: 'Agora',
    });
  }
}

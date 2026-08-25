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
    this.listings = [];
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

import Phaser from 'phaser';
import { AuctionHouseSystem, AuctionListing } from '../../systems/AuctionHouseSystem';

export class AuctionHouseModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;
  private listingTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createAuctionUI();
  }

  private createAuctionUI(): void {
    const width = 520;
    const height = 340;
    const x = (this.scene.scale.width - width) / 2;
    const y = (this.scene.scale.height - height) / 2;

    this.container = this.scene.add.container(x, y).setDepth(2100).setScrollFactor(0).setVisible(false);

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.95);
    bg.fillRoundedRect(0, 0, width, height, 14);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(0, 0, width, height, 14);
    this.container.add(bg);

    // Título da Casa de Leilões
    const title = this.scene.add.text(width / 2, 24, '🏪 CASA DE LEILÕES MMORPG (MERCADO LIVRE)', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.container.add(title);

    // Linha Divisória de Ouro
    const line = this.scene.add.graphics();
    line.lineStyle(1, 0xffd700, 0.5);
    line.lineBetween(20, 48, width - 20, 48);
    this.container.add(line);

    // Lista de Itens no Mercado
    const system = AuctionHouseSystem.getInstance();
    const listings = system.getListings();

    listings.forEach((auc, idx) => {
      const rowY = 64 + idx * 75;

      const rowBg = this.scene.add.graphics();
      rowBg.fillStyle(0x160c28, 0.8);
      rowBg.fillRoundedRect(20, rowY, width - 40, 65, 8);
      rowBg.lineStyle(1, 0x5a3e10, 0.6);
      rowBg.strokeRoundedRect(20, rowY, width - 40, 65, 8);
      this.container.add(rowBg);

      let rarityColor = '#aaaaaa';
      if (auc.item.rarity === 'RARE') rarityColor = '#4488ff';
      if (auc.item.rarity === 'EPIC') rarityColor = '#8a2be2';
      if (auc.item.rarity === 'LEGENDARY') rarityColor = '#ffd700';

      const itemText = this.scene.add.text(32, rowY + 10, `${auc.item.name}`, {
        fontFamily: 'Cinzel', fontSize: '13px', fontStyle: 'bold', color: rarityColor,
      });
      this.container.add(itemText);

      const sellerText = this.scene.add.text(32, rowY + 32, `Vendedor: ${auc.sellerName} | Preço: 💰 ${auc.priceGold} Ouro`, {
        fontFamily: 'Inter', fontSize: '11px', color: '#cccccc',
      });
      this.container.add(sellerText);

      // Botão Comprar
      const buyBtn = this.scene.add.text(width - 120, rowY + 18, '💰 COMPRAR', {
        fontFamily: 'Cinzel',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#8b0000',
        padding: { x: 10, y: 6 },
      }).setInteractive({ useHandCursor: true });

      buyBtn.on('pointerdown', () => {
        const item = system.buyListing(auc.id);
        if (item) {
          alert(`🎉 Você comprou ${item.item.name} por ${item.priceGold} Ouro!`);
          this.toggle();
        }
      });
      this.container.add(buyBtn);
    });

    // Botão Fechar
    const closeBtn = this.scene.add.text(width / 2, height - 25, '✖️ FECHAR', {
      fontFamily: 'Cinzel', fontSize: '12px', fontStyle: 'bold', color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.toggle());
    this.container.add(closeBtn);
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }
}

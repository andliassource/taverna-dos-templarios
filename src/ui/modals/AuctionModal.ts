import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { AuctionSystem, AuctionListing } from '../../systems/AuctionSystem';
import { SoundManager } from '../../audio/SoundManager';
import { SoundSynth } from '../../utils/SoundSynth';

export class AuctionModal extends Phaser.GameObjects.Container {
  private onClose?: () => void;
  private activeTab: 'BUY' | 'SELL' = 'BUY';

  private sellItemsSample = [
    { name: 'Poção de HP Maior', icon: '🧪', rarity: 'RARE' as const, stats: 'Restaura 250 HP Instantâneo', defaultPrice: 150 },
    { name: 'Runa Sagrada do Sol', icon: '✨', rarity: 'EPIC' as const, stats: '+15 ATK Sagrado | +5% Sagrado', defaultPrice: 850 },
    { name: 'Anel do Guerreiro Antigo', icon: '💍', rarity: 'RARE' as const, stats: '+12 Força | +80 HP', defaultPrice: 420 },
    { name: 'Elmo de Aço Templário', icon: '🪖', rarity: 'EPIC' as const, stats: '+35 DEF | +5% Bloqueio', defaultPrice: 1200 },
  ];

  constructor(scene: Phaser.Scene, onClose?: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onClose = onClose;
    this.setDepth(2100);
    this.setVisible(false);

    scene.add.existing(this);
    this.renderModal();
  }

  public toggle(): void {
    this.setVisible(!this.visible);
    if (this.visible) {
      this.renderModal();
    }
  }

  private renderModal(): void {
    this.removeAll(true);

    const pw = 580;
    const ph = 430;
    const px = -pw / 2;
    const py = -ph / 2;

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0618, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 14);
    bg.lineStyle(2, 0xffd700, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 14);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 12);
    this.add(bg);

    // Título Central
    const title = this.scene.add.text(0, py + 22, '🏪 CASA DE LEILÕES & MERCADO LIVRE', {
      fontFamily: UI_THEME.fonts.title, fontSize: '15px', color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(title);

    // Botão Fechar [X]
    const closeBtn = this.scene.add.text(px + pw - 24, py + 20, '❌', { fontSize: '14px' })
      .setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      if (this.onClose) this.onClose();
      this.setVisible(false);
    });
    this.add(closeBtn);

    // Abas de Navegação
    const tabY = py + 52;
    const tabs: Array<{ key: 'BUY' | 'SELL'; label: string; x: number }> = [
      { key: 'BUY', label: '🛒 COMPRAR LEILÕES', x: px + 40 },
      { key: 'SELL', label: '🏷️ ANUNCIAR / VENDER ITEM', x: px + 220 },
    ];

    tabs.forEach(t => {
      const isSel = this.activeTab === t.key;
      const btn = this.scene.add.text(t.x, tabY, t.label, {
        fontFamily: UI_THEME.fonts.title,
        fontSize: '12px',
        fontStyle: 'bold',
        color: isSel ? '#ffd700' : '#888888',
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.activeTab = t.key;
        SoundManager.getInstance().playUIClick();
        this.renderModal();
      });
      this.add(btn);
    });

    // Linha Divisória
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0xd4af37, 0.4);
    div.lineBetween(px + 20, py + 74, px + 560, py + 74);
    this.add(div);

    if (this.activeTab === 'SELL') {
      this.renderSellView(px, py);
    } else {
      this.renderBuyView(px, py);
    }
  }

  private renderBuyView(px: number, py: number): void {
    const listings = AuctionSystem.getInstance().getListings();
    const startY = py + 85;

    if (listings.length === 0) {
      const emptyText = this.scene.add.text(0, startY + 60, 'Nenhum item anunciado no leilão no momento.', {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: '#aaaaaa'
      }).setOrigin(0.5);
      this.add(emptyText);
      return;
    }

    listings.forEach((item, idx) => {
      const yPos = startY + idx * 64;

      const cardBg = this.scene.add.graphics();
      cardBg.fillStyle(0x130a24, 0.9);
      cardBg.fillRoundedRect(px + 30, yPos, 520, 56, 6);
      cardBg.lineStyle(1.5, 0x5a3d8c, 0.8);
      cardBg.strokeRoundedRect(px + 30, yPos, 520, 56, 6);

      const iconText = this.scene.add.text(px + 54, yPos + 28, item.itemIcon, { fontSize: '20px' }).setOrigin(0.5);

      let rarityColor = '#ffffff';
      if (item.rarity === 'RARE') rarityColor = '#3498db';
      if (item.rarity === 'EPIC') rarityColor = '#9b59b6';
      if (item.rarity === 'LEGENDARY') rarityColor = '#ffd700';

      const name = this.scene.add.text(px + 80, yPos + 10, item.itemName, {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: rarityColor, fontStyle: 'bold'
      });

      const seller = this.scene.add.text(px + 80, yPos + 30, `Vendedor: ${item.sellerName}  |  ${item.statsText}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '10px', color: '#aaaaaa'
      });

      const price = this.scene.add.text(px + 365, yPos + 20, `💰 ${item.priceGold} Ouro`, {
        fontFamily: UI_THEME.fonts.title, fontSize: '12px', color: '#ffd700', fontStyle: 'bold'
      });

      // Botão Comprar
      const buyBg = this.scene.add.graphics();
      buyBg.fillStyle(0x2ecc71, 1);
      buyBg.fillRoundedRect(px + 450, yPos + 14, 85, 28, 4);

      const buyText = this.scene.add.text(px + 492, yPos + 28, 'COMPRAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '10px', color: '#0a0612', fontStyle: 'bold'
      }).setOrigin(0.5);

      const buyZone = this.scene.add.zone(px + 492, yPos + 28, 85, 28).setInteractive({ useHandCursor: true });
      buyZone.on('pointerdown', () => {
        const bought = AuctionSystem.getInstance().buyItem(item.id);
        if (bought) {
          SoundManager.getInstance().playCoinPickup();
          SoundSynth.playUpgrade();
          alert(`🎉 Parabéns! Você comprou "${item.itemName}" por ${item.priceGold} Ouro!`);
          this.renderModal();
        }
      });

      this.add([cardBg, iconText, name, seller, price, buyBg, buyText, buyZone]);
    });
  }

  private renderSellView(px: number, py: number): void {
    const startY = py + 85;

    const infoText = this.scene.add.text(0, startY, 'Selecione um item do seu inventário para colocar à venda no Mercado Livre:', {
      fontFamily: UI_THEME.fonts.body, fontSize: '11px', color: '#ffd700'
    }).setOrigin(0.5);
    this.add(infoText);

    this.sellItemsSample.forEach((item, idx) => {
      const yPos = startY + 20 + idx * 64;

      const cardBg = this.scene.add.graphics();
      cardBg.fillStyle(0x130a24, 0.9);
      cardBg.fillRoundedRect(px + 30, yPos, 520, 56, 6);
      cardBg.lineStyle(1.5, 0xd4af37, 0.6);
      cardBg.strokeRoundedRect(px + 30, yPos, 520, 56, 6);

      const iconObj = this.scene.add.text(px + 54, yPos + 28, item.icon, { fontSize: '20px' }).setOrigin(0.5);

      let rarityColor = '#ffffff';
      if (item.rarity === 'RARE') rarityColor = '#3498db';
      if (item.rarity === 'EPIC') rarityColor = '#9b59b6';

      const name = this.scene.add.text(px + 80, yPos + 10, item.name, {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: rarityColor, fontStyle: 'bold'
      });

      const stats = this.scene.add.text(px + 80, yPos + 30, `${item.stats}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '10px', color: '#aaaaaa'
      });

      const price = this.scene.add.text(px + 350, yPos + 20, `💰 ${item.defaultPrice} Ouro`, {
        fontFamily: UI_THEME.fonts.title, fontSize: '12px', color: '#ffd700', fontStyle: 'bold'
      });

      // Botão Anunciar
      const sellBg = this.scene.add.graphics();
      sellBg.fillStyle(0x3498db, 1);
      sellBg.fillRoundedRect(px + 440, yPos + 14, 95, 28, 4);

      const sellText = this.scene.add.text(px + 487, yPos + 28, 'ANUNCIAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      const sellZone = this.scene.add.zone(px + 487, yPos + 28, 95, 28).setInteractive({ useHandCursor: true });
      sellZone.on('pointerdown', () => {
        AuctionSystem.getInstance().listItem(item.name, item.icon, item.rarity, item.defaultPrice, item.stats);
        SoundManager.getInstance().playCoinPickup();
        alert(`📜 "${item.name}" foi publicado na Casa de Leilões por ${item.defaultPrice} Ouro!`);
        this.activeTab = 'BUY';
        this.renderModal();
      });

      this.add([cardBg, iconObj, name, stats, price, sellBg, sellText, sellZone]);
    });
  }
}

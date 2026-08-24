import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { AuctionSystem } from '../../systems/AuctionSystem';
import { SoundSynth } from '../../utils/SoundSynth';

export class AuctionModal extends Phaser.GameObjects.Container {
  private onClose?: () => void;

  constructor(scene: Phaser.Scene, onClose?: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onClose = onClose;
    this.setDepth(210);
    this.setVisible(false);

    const pw = 580;
    const ph = 420;
    const px = -pw / 2;
    const py = -ph / 2;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0618, 0.95);
    bg.fillRoundedRect(px, py, pw, ph, 12);
    bg.lineStyle(2, 0xffd700, 0.9);
    bg.strokeRoundedRect(px, py, pw, ph, 12);
    this.add(bg);

    const title = scene.add.text(0, py + 24, '🏪 CASA DE LEILÕES & MERCADO LIVRE', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 24, py + 20, '❌', { fontSize: '14px' })
      .setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      if (this.onClose) this.onClose();
      this.setVisible(false);
    });
    this.add(closeBtn);

    scene.add.existing(this);
    this.createAuctionContent(px, py);
  }

  public toggle(): void {
    this.setVisible(!this.visible);
  }

  private createAuctionContent(px: number, py: number): void {

    const listings = AuctionSystem.getInstance().getListings();

    const startY = py + 60;
    listings.forEach((item, idx) => {
      const yPos = startY + idx * 56;

      const bg = this.scene.add.graphics();
      bg.fillStyle(0x130a24, 0.9);
      bg.fillRoundedRect(px + 30, yPos, 500, 48, 6);
      bg.lineStyle(1.5, 0x5a3d8c, 0.8);
      bg.strokeRoundedRect(px + 30, yPos, 500, 48, 6);

      const iconMap: Record<string, string> = {
        '🗡️': 'icon-sword', '🔮': 'icon-staff', '🏹': 'icon-bow', '🪓': 'icon-axe', '🛡️': 'icon-shield'
      };
      const sKey = iconMap[item.itemIcon] ?? 'icon-sword';
      let iconObj: Phaser.GameObjects.GameObject;
      if (this.scene.textures.exists(sKey)) {
        const spr = this.scene.add.sprite(px + 54, yPos + 24, sKey);
        spr.setDisplaySize(28, 28);
        iconObj = spr;
      } else {
        iconObj = this.scene.add.text(px + 54, yPos + 24, item.itemIcon, { fontSize: '18px' }).setOrigin(0.5);
      }

      let rarityColor = '#ffffff';
      if (item.rarity === 'RARE') rarityColor = '#3498db';
      if (item.rarity === 'EPIC') rarityColor = '#9b59b6';
      if (item.rarity === 'LEGENDARY') rarityColor = '#ffd700';

      const name = this.scene.add.text(px + 80, yPos + 8, item.itemName, {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: rarityColor, fontStyle: 'bold'
      });

      const seller = this.scene.add.text(px + 80, yPos + 26, `Vendedor: ${item.sellerName}  |  ${item.statsText}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '10px', color: '#888888'
      });

      const price = this.scene.add.text(px + 360, yPos + 16, `💰 ${item.priceGold} Ouro`, {
        fontFamily: UI_THEME.fonts.title, fontSize: '12px', color: '#ffd700', fontStyle: 'bold'
      });

      // Botão Comprar
      const buyBg = this.scene.add.graphics();
      buyBg.fillStyle(0x2ecc71, 1);
      buyBg.fillRoundedRect(px + 450, yPos + 10, 68, 28, 4);

      const buyText = this.scene.add.text(px + 484, yPos + 24, 'COMPRAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '9px', color: '#0a0612', fontStyle: 'bold'
      }).setOrigin(0.5);

      const buyZone = this.scene.add.zone(px + 484, yPos + 24, 68, 28).setInteractive({ useHandCursor: true });
      buyZone.on('pointerdown', () => {
        const bought = AuctionSystem.getInstance().buyItem(item.id);
        if (bought) {
          SoundSynth.playBuy();
          this.destroy();
          new AuctionModal(this.scene, this.onClose);
        }
      });

      this.add([bg, iconObj, name, seller, price, buyBg, buyText, buyZone]);
    });
  }
}

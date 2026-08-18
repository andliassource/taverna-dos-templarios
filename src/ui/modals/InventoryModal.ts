import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { CombatSystem } from '../../systems/CombatSystem';

export class InventoryModal extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, cs: CombatSystem, onClose: () => void, onRefresh: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.setDepth(200);

    const pw = 480;
    const ph = 340;
    const px = -pw / 2;
    const py = -ph / 2;

    // Pop-in animado elástico
    this.setScale(0.85);
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 200, ease: 'Back.out',
    });

    const bg = scene.add.graphics();
    bg.fillStyle(UI_THEME.colors.bgDark, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, UI_THEME.colors.borderGold, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, UI_THEME.colors.borderDarkGold, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);
    this.add(bg);

    const title = scene.add.text(0, py + 22, 'INVENTÁRIO E EQUIPAMENTOS', {
      fontFamily: UI_THEME.fonts.title, fontSize: '15px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 26, py + 12, '✖', {
      fontSize: '18px', color: UI_THEME.colors.textGold,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', onClose);
    this.add(closeBtn);

    // === SEÇÃO ESQUERDA: SLOTS DE EQUIPAMENTO ===
    const eqX = px + 24;
    const eqY = py + 54;
    const eqSlotW = 180;
    const eqSlotH = 48;

    const slots = [
      { key: 'HELMET', label: '🪖 ELMO', iconPlaceholder: '🪖' },
      { key: 'ARMOR', label: '🧥 ARMADURA', iconPlaceholder: '🧥' },
      { key: 'WEAPON', label: '🗡️ ARMA', iconPlaceholder: '🗡️' },
      { key: 'SHIELD', label: '🛡️ ESCUDO', iconPlaceholder: '🛡️' },
    ];

    const equipped = cs.getEquipped();

    slots.forEach((slot, index) => {
      const sy = eqY + index * 58;

      const slotBg = scene.add.graphics();
      slotBg.fillStyle(0x130a24, 0.85);
      slotBg.fillRoundedRect(eqX, sy, eqSlotW, eqSlotH, 6);
      slotBg.lineStyle(1, 0x5a3d8c, 0.6);
      slotBg.strokeRoundedRect(eqX, sy, eqSlotW, eqSlotH, 6);
      this.add(slotBg);

      const item = equipped[slot.key];
      if (item) {
        const icon = scene.add.text(eqX + 20, sy + 24, item.icon, { fontSize: '18px' }).setOrigin(0.5);
        let rarityColor = UI_THEME.rarity.COMMON.hex;
        if (item.rarity === 'RARE') rarityColor = UI_THEME.rarity.RARE.hex;
        if (item.rarity === 'EPIC') rarityColor = UI_THEME.rarity.EPIC.hex;
        if (item.rarity === 'LEGENDARY') rarityColor = UI_THEME.rarity.LEGENDARY.hex;

        const name = scene.add.text(eqX + 44, sy + 10, item.name, {
          fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: rarityColor, fontStyle: 'bold',
        });

        let statText = '';
        if (item.stats.atk) statText += `+${item.stats.atk} ATK  `;
        if (item.stats.def) statText += `+${item.stats.def} DEF  `;
        if (item.stats.hp) statText += `+${item.stats.hp} HP  `;

        const statLabel = scene.add.text(eqX + 44, sy + 24, statText.trim(), {
          fontFamily: UI_THEME.fonts.hud, fontSize: '9px', color: '#8b8b8b',
        });

        this.add([icon, name, statLabel]);

        const zone = scene.add.zone(eqX + eqSlotW / 2, sy + eqSlotH / 2, eqSlotW, eqSlotH).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          cs.unequipItem(slot.key);
          onRefresh();
        });
        this.add(zone);
      } else {
        const placeholderIcon = scene.add.text(eqX + 20, sy + 24, slot.iconPlaceholder, { fontSize: '16px' }).setOrigin(0.5).setAlpha(0.25);
        const placeholderName = scene.add.text(eqX + 44, sy + 18, `[ Vazio ]`, {
          fontFamily: UI_THEME.fonts.title, fontSize: '10px', color: '#555555',
        });
        this.add([placeholderIcon, placeholderName]);
      }
    });

    // === SEÇÃO DIREITA: GRID DE ITENS (5X5 - 25 SLOTS) ===
    const gridX = px + 216;
    const gridY = py + 54;
    const slotSize = 44;
    const gridSpacing = 6;
    const inventory = cs.getInventory();

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const index = row * 5 + col;
        const sx = gridX + col * (slotSize + gridSpacing);
        const sy = gridY + row * (slotSize + gridSpacing);

        const slotBg = scene.add.graphics();
        slotBg.fillStyle(0x130a24, 0.85);
        slotBg.fillRoundedRect(sx, sy, slotSize, slotSize, 4);

        if (index < inventory.length) {
          const item = inventory[index];
          let strokeColor = 0x4a2d6e;
          if (item.rarity === 'RARE') strokeColor = UI_THEME.rarity.RARE.color;
          if (item.rarity === 'EPIC') strokeColor = UI_THEME.rarity.EPIC.color;
          if (item.rarity === 'LEGENDARY') strokeColor = UI_THEME.rarity.LEGENDARY.color;

          slotBg.lineStyle(1.5, strokeColor, 0.9);
          slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 4);
          this.add(slotBg);

          const itemIcon = scene.add.text(sx + slotSize / 2, sy + slotSize / 2, item.icon, {
            fontSize: '18px',
          }).setOrigin(0.5);
          this.add(itemIcon);

          if (item.quantity && item.quantity > 1) {
            const countTxt = scene.add.text(sx + slotSize - 4, sy + slotSize - 4, `${item.quantity}`, {
              fontFamily: UI_THEME.fonts.hud, fontSize: '9px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(1, 1);
            this.add(countTxt);
          }

          const zone = scene.add.zone(sx + slotSize / 2, sy + slotSize / 2, slotSize, slotSize).setInteractive({ useHandCursor: true });
          zone.on('pointerdown', (pointer: any) => {
            if (pointer.rightButtonDown()) {
              cs.deleteItem(item.id);
            } else {
              if (item.type === 'POTION') {
                cs.usePotion(item.id);
              } else {
                cs.equipItem(item.id);
              }
            }
            onRefresh();
          });
          this.add(zone);
        } else {
          slotBg.lineStyle(1, 0x332244, 0.4);
          slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 4);
          this.add(slotBg);
        }
      }
    }

    // FOOTER
    const footerY = py + ph - 34;
    const footerText = scene.add.text(px + 20, footerY, `⚡ ATK: ${cs.getAttackPower()}  |  🛡️ DEF: ${cs.getDefense()}  |  ❤️ HP: ${cs.getHP()}/${cs.getMaxHP()}`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '10.5px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
    });
    this.add(footerText);

    scene.add.existing(this);
  }
}

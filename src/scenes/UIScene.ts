import Phaser from 'phaser';
import { Item } from '../shared/types/item.types';

/**
 * UIScene — Cena de UI sobreposta ao jogo.
 * Sempre ativa enquanto o WorldScene está rodando.
 * Gerencia: HUD, inventário, menus, chat, etc.
 */
export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private gemsText!: Phaser.GameObjects.Text;
  private classText!: Phaser.GameObjects.Text;
  private mapNameText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;

  private inventoryKey!: Phaser.Input.Keyboard.Key;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private isInventoryOpen = false;
  private tooltipText!: Phaser.GameObjects.Text;
  private tooltipBg!: Phaser.GameObjects.Graphics;

  // Dados do jogador (placeholder — virá do servidor)
  private playerData = {
    name: 'Templário',
    class: 'Paladino',
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    exp: 0,
    expToNext: 100,
    gold: 500,
    gems: 10,
    map: 'Taverna dos Templários',
  };

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // HUD — Canto superior esquerdo
    this.createHUD(width, height);

    // Mini-mapa — Canto superior direito (placeholder)
    this.createMiniMap(width);

    // Hotbar — Parte inferior
    this.createHotbar(width, height);

    // Moedas — Abaixo do HUD
    this.createCurrencyDisplay();

    // Info do mapa — Topo central
    this.createMapInfo(width);

    // FPS counter (dev only)
    this.createFPSCounter(width);

    // Escuta atualizações de combate vindas do WorldScene
    this.setupCombatListeners();

    // Registra atalho de inventário (Tecla I)
    if (this.input.keyboard) {
      this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    }

    // Escuta redesenho do inventário
    this.events.on('update-inventory-ui', () => {
      if (this.isInventoryOpen) {
        this.createInventoryUI();
      }
    });

    console.log('[UIScene] Interface criada');
  }

  private arenaWaveText!: Phaser.GameObjects.Text;

  private setupCombatListeners(): void {
    const worldScene = this.scene.get('WorldScene');
    if (worldScene) {
      this.registerSceneListeners(worldScene);
    }

    const battleScene = this.scene.get('BattleScene');
    if (battleScene) {
      this.registerSceneListeners(battleScene);
    }
  }

  private registerSceneListeners(targetScene: Phaser.Scene): void {
    targetScene.events.on('update-hud-state', (data: {
      hp: number; maxHp: number;
      mp: number; maxMp: number;
      xp: number; maxXp: number;
      level: number;
      gold: number;
      gems: number;
    }) => {
      this.playerData.hp = data.hp;
      this.playerData.maxHp = data.maxHp;
      this.playerData.mp = data.mp;
      this.playerData.maxMp = data.maxMp;
      this.playerData.exp = data.xp;
      this.playerData.expToNext = data.maxXp;
      this.playerData.level = data.level;
      this.playerData.gold = data.gold;
      this.playerData.gems = data.gems;

      this.updateHUDVisuals();
    });

    targetScene.events.on('player-level-up', (data: { level: number }) => {
      this.showLevelUpBanner(data.level);
    });

    targetScene.events.on('scene-change', (mapName: string) => {
      this.playerData.map = mapName;
      if (this.mapNameText) this.mapNameText.setText(`📍 ${mapName}`);
      
      // Oculta o contador de ondas se saímos da Arena
      if (mapName !== 'Arena de Combate' && this.arenaWaveText) {
        this.arenaWaveText.setVisible(false);
      }
    });

    targetScene.events.on('arena-wave-update', (data: { wave: number; maxWaves: number }) => {
      this.showArenaWaveInfo(data.wave, data.maxWaves);
    });
  }

  private showArenaWaveInfo(wave: number, maxWaves: number): void {
    if (!this.arenaWaveText) {
      const { width } = this.cameras.main;
      this.arenaWaveText = this.add.text(width / 2, 45, '', {
        fontFamily: 'Cinzel',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ff4444',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5, 0).setDepth(200);
    }

    if (wave > 0) {
      this.arenaWaveText.setText(`⚔️ ONDA ${wave}/${maxWaves} ⚔️`);
      this.arenaWaveText.setVisible(true);

      this.tweens.add({
        targets: this.arenaWaveText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 200,
        ease: 'Sine.easeOut',
      });
    } else {
      this.arenaWaveText.setVisible(false);
    }
  }

  private updateHUDVisuals(): void {
    const barWidth = 180;
    const barHeight = 14;
    const x = 16;
    const hpY = 40;
    const mpY = 58;
    const expY = 76;

    // Atualiza Level
    if (this.levelText) this.levelText.setText(`Lv.${this.playerData.level}`);

    // Redesenha barra de HP
    this.hpBar.clear();
    this.drawBar(this.hpBar, x + 24, hpY, barWidth, barHeight,
      this.playerData.hp / this.playerData.maxHp, 0x8b0000, 0xdc143c);

    // Redesenha barra de MP
    this.mpBar.clear();
    this.drawBar(this.mpBar, x + 24, mpY, barWidth, barHeight,
      this.playerData.mp / this.playerData.maxMp, 0x00008b, 0x3498db);

    // Redesenha barra de EXP
    this.expBar.clear();
    this.drawBar(this.expBar, x + 24, expY, barWidth, barHeight - 4,
      this.playerData.exp / this.playerData.expToNext, 0x006400, 0x27ae60);

    // Atualiza textos de Moedas
    if (this.goldText) this.goldText.setText(`🪙 ${this.playerData.gold.toLocaleString()}`);
    if (this.gemsText) this.gemsText.setText(`💎 ${this.playerData.gems.toLocaleString()}`);
  }

  private showLevelUpBanner(level: number): void {
    const { width, height } = this.cameras.main;

    const banner = this.add.text(width / 2, height * 0.35, `🌟 LEVEL UP! Lv.${level} 🌟`, {
      fontFamily: 'Cinzel',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: banner,
      y: banner.y - 40,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => banner.destroy(),
    });
  }

  private createHUD(_width: number, _height: number): void {
    const x = 16;
    const y = 16;
    const barWidth = 180;
    const barHeight = 14;
    const spacing = 4;

    // Fundo do HUD
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x0a0612, 0.85);
    hudBg.fillRoundedRect(x - 8, y - 8, barWidth + 90, 110, 8);
    hudBg.lineStyle(1, 0xd4a843, 0.6);
    hudBg.strokeRoundedRect(x - 8, y - 8, barWidth + 90, 110, 8);

    // Nome + Classe
    this.classText = this.add.text(x, y, `⚔️ ${this.playerData.name}`, {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Level
    this.levelText = this.add.text(x + barWidth + 40, y, `Lv.${this.playerData.level}`, {
      fontFamily: 'Inter',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // HP Bar
    const hpY = y + 24;
    this.add.text(x, hpY, 'HP', {
      fontFamily: 'Inter', fontSize: '10px', fontStyle: 'bold',
      color: '#ff4444', stroke: '#000', strokeThickness: 2,
    });

    this.hpBar = this.add.graphics();
    this.drawBar(this.hpBar, x + 24, hpY, barWidth, barHeight,
      this.playerData.hp / this.playerData.maxHp, 0x8b0000, 0xdc143c);

    this.add.text(x + 24 + barWidth / 2, hpY + barHeight / 2,
      `${this.playerData.hp}/${this.playerData.maxHp}`, {
        fontFamily: 'Inter', fontSize: '9px', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

    // MP Bar
    const mpY = hpY + barHeight + spacing;
    this.add.text(x, mpY, 'MP', {
      fontFamily: 'Inter', fontSize: '10px', fontStyle: 'bold',
      color: '#4488ff', stroke: '#000', strokeThickness: 2,
    });

    this.mpBar = this.add.graphics();
    this.drawBar(this.mpBar, x + 24, mpY, barWidth, barHeight,
      this.playerData.mp / this.playerData.maxMp, 0x00008b, 0x3498db);

    this.add.text(x + 24 + barWidth / 2, mpY + barHeight / 2,
      `${this.playerData.mp}/${this.playerData.maxMp}`, {
        fontFamily: 'Inter', fontSize: '9px', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

    // EXP Bar
    const expY = mpY + barHeight + spacing;
    this.add.text(x, expY, 'XP', {
      fontFamily: 'Inter', fontSize: '10px', fontStyle: 'bold',
      color: '#44dd44', stroke: '#000', strokeThickness: 2,
    });

    this.expBar = this.add.graphics();
    this.drawBar(this.expBar, x + 24, expY, barWidth, barHeight - 4,
      this.playerData.exp / this.playerData.expToNext, 0x006400, 0x27ae60);

    this.add.text(x + 24 + barWidth / 2, expY + (barHeight - 4) / 2,
      `${this.playerData.exp}/${this.playerData.expToNext}`, {
        fontFamily: 'Inter', fontSize: '8px', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
  }

  private drawBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number, y: number,
    width: number, height: number,
    percent: number,
    darkColor: number, brightColor: number
  ): void {
    // Fundo
    graphics.fillStyle(0x111111, 0.8);
    graphics.fillRoundedRect(x, y, width, height, 3);

    // Barra preenchida
    if (percent > 0) {
      graphics.fillStyle(darkColor, 1);
      graphics.fillRoundedRect(x + 1, y + 1, (width - 2) * percent, height - 2, 2);
      graphics.fillStyle(brightColor, 0.5);
      graphics.fillRoundedRect(x + 1, y + 1, (width - 2) * percent, (height - 2) / 2, 2);
    }

    // Borda
    graphics.lineStyle(1, 0x666666, 0.5);
    graphics.strokeRoundedRect(x, y, width, height, 3);
  }

  private createMiniMap(width: number): void {
    const mapSize = 100;
    const x = width - mapSize - 16;
    const y = 16;

    // Fundo do mini-mapa
    const mmBg = this.add.graphics();
    mmBg.fillStyle(0x0a0612, 0.85);
    mmBg.fillRoundedRect(x - 4, y - 4, mapSize + 8, mapSize + 24, 8);
    mmBg.lineStyle(1, 0xd4a843, 0.6);
    mmBg.strokeRoundedRect(x - 4, y - 4, mapSize + 8, mapSize + 24, 8);

    // Placeholder do mini-mapa
    mmBg.fillStyle(0x1a3a1a, 0.6);
    mmBg.fillRect(x, y, mapSize, mapSize);
    mmBg.lineStyle(1, 0xd4a843, 0.3);
    mmBg.strokeRect(x, y, mapSize, mapSize);

    // Ponto do jogador
    mmBg.fillStyle(0xffd700, 1);
    mmBg.fillCircle(x + mapSize / 2, y + mapSize / 2, 3);

    // Label
    this.add.text(x + mapSize / 2, y + mapSize + 8, 'Mini-Mapa', {
      fontFamily: 'Inter', fontSize: '9px', color: '#888',
    }).setOrigin(0.5);
  }

  private createHotbar(width: number, height: number): void {
    const slotSize = 40;
    const slotCount = 8;
    const gap = 4;
    const totalWidth = slotCount * (slotSize + gap) - gap;
    const startX = (width - totalWidth) / 2;
    const y = height - slotSize - 16;

    // Fundo do hotbar
    const hotbarBg = this.add.graphics();
    hotbarBg.fillStyle(0x0a0612, 0.85);
    hotbarBg.fillRoundedRect(startX - 8, y - 8, totalWidth + 16, slotSize + 16, 8);
    hotbarBg.lineStyle(1, 0xd4a843, 0.6);
    hotbarBg.strokeRoundedRect(startX - 8, y - 8, totalWidth + 16, slotSize + 16, 8);

    // Slots
    const skillNames = ['Golpe', 'Escudo', 'Cura', 'Buff', '—', '—', '—', 'Poção'];
    const skillColors = [0xdc143c, 0x3498db, 0x27ae60, 0xf39c12, 0x333333, 0x333333, 0x333333, 0xff6699];

    for (let i = 0; i < slotCount; i++) {
      const sx = startX + i * (slotSize + gap);

      // Slot background
      hotbarBg.fillStyle(0x1a0a2e, 0.9);
      hotbarBg.fillRoundedRect(sx, y, slotSize, slotSize, 4);
      hotbarBg.lineStyle(1, 0x4a2d6e, 0.8);
      hotbarBg.strokeRoundedRect(sx, y, slotSize, slotSize, 4);

      // Ícone placeholder
      const iconBg = this.add.graphics();
      iconBg.fillStyle(skillColors[i], 0.3);
      iconBg.fillRoundedRect(sx + 4, y + 4, slotSize - 8, slotSize - 8, 3);

      // Nome da skill
      this.add.text(sx + slotSize / 2, y + slotSize / 2 - 2, skillNames[i], {
        fontFamily: 'Inter', fontSize: '8px', fontStyle: 'bold',
        color: '#e0d5c0', stroke: '#000', strokeThickness: 1,
      }).setOrigin(0.5);

      // Keybind
      this.add.text(sx + 3, y + 2, `${i + 1}`, {
        fontFamily: 'Inter', fontSize: '8px', fontStyle: 'bold',
        color: '#d4a843',
      });
    }
  }

  private createCurrencyDisplay(): void {
    const x = 16;
    const y = 132;

    this.goldText = this.add.text(x, y, `🪙 ${this.playerData.gold.toLocaleString()}`, {
      fontFamily: 'Inter', fontSize: '12px', fontStyle: 'bold',
      color: '#ffd700', stroke: '#000', strokeThickness: 2,
    });

    this.gemsText = this.add.text(x + 110, y, `💎 ${this.playerData.gems.toLocaleString()}`, {
      fontFamily: 'Inter', fontSize: '12px', fontStyle: 'bold',
      color: '#87ceeb', stroke: '#000', strokeThickness: 2,
    });
  }

  private createMapInfo(width: number): void {
    this.mapNameText = this.add.text(width / 2, 10, `📍 ${this.playerData.map}`, {
      fontFamily: 'MedievalSharp', fontSize: '14px',
      color: '#d4a843', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0);
  }

  private createFPSCounter(width: number): void {
    this.fpsText = this.add.text(width - 16, 140, 'FPS: 60', {
      fontFamily: 'Inter', fontSize: '10px', color: '#444',
    }).setOrigin(1, 0);
  }

  update(): void {
    // Atualiza FPS
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }

    // Atalho do inventário
    if (this.inventoryKey && Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      this.toggleInventory();
    }
  }

  private toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    
    // Comunica para as cenas ativas pausarem/despausarem a movimentação do jogador
    let activeSceneName = '';
    if (this.scene.isActive('WorldScene')) activeSceneName = 'WorldScene';
    else if (this.scene.isActive('BattleScene')) activeSceneName = 'BattleScene';

    if (activeSceneName) {
      const activeScene = this.scene.get(activeSceneName) as any;
      if (activeScene && activeScene.player) {
        if (this.isInventoryOpen) {
          activeScene.physics.world.disable(activeScene.player);
          activeScene.isMoving = false;
          activeScene.player.play(`player-idle-${activeScene.currentDirection || 'down'}`, true);
        } else {
          activeScene.physics.world.enable(activeScene.player);
        }
      }
    }

    if (this.isInventoryOpen) {
      this.createInventoryUI();
    } else {
      if (this.inventoryContainer) {
        this.inventoryContainer.destroy();
      }
    }
  }

  private getActiveCombatSystem(): any {
    if (this.scene.isActive('WorldScene')) {
      return (this.scene.get('WorldScene') as any).combatSystem;
    } else if (this.scene.isActive('BattleScene')) {
      return (this.scene.get('BattleScene') as any).combatSystem;
    }
    return null;
  }

  private createInventoryUI(): void {
    if (this.inventoryContainer) {
      this.inventoryContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.inventoryContainer = this.add.container(0, 0).setDepth(200);

    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    const px = width / 2 - 240;
    const py = height / 2 - 170;
    const pw = 480;
    const ph = 340;

    // Fundo do painel principal
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0618, 0.95);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4a843, 1);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    this.inventoryContainer.add(bg);

    // Título medieval
    const title = this.add.text(width / 2, py + 22, 'INVENTÁRIO E EQUIPAMENTOS', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.inventoryContainer.add(title);

    // Botão Fechar [X] no topo direito do painel
    const closeBtn = this.add.text(px + pw - 26, py + 12, '✖', {
      fontSize: '18px',
      color: '#ffd700',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleInventory());
    this.inventoryContainer.add(closeBtn);

    // === SEÇÃO ESQUERDA: SLOTS DE EQUIPAMENTO EQUIPADO ===
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

      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x130a24, 0.85);
      slotBg.fillRoundedRect(eqX, sy, eqSlotW, eqSlotH, 6);
      slotBg.lineStyle(1, 0x5a3d8c, 0.6);
      slotBg.strokeRoundedRect(eqX, sy, eqSlotW, eqSlotH, 6);
      this.inventoryContainer.add(slotBg);

      const item = equipped[slot.key];
      if (item) {
        const icon = this.add.text(eqX + 20, sy + 24, item.icon, { fontSize: '18px' }).setOrigin(0.5);
        
        let rarityColor = '#aaaaaa';
        if (item.rarity === 'RARE') rarityColor = '#4488ff';
        if (item.rarity === 'EPIC') rarityColor = '#8a2be2';
        if (item.rarity === 'LEGENDARY') rarityColor = '#ffd700';

        const name = this.add.text(eqX + 44, sy + 10, item.name, {
          fontFamily: 'MedievalSharp',
          fontSize: '10px',
          color: rarityColor,
          fontStyle: 'bold',
        });

        let statText = '';
        if (item.stats.atk) statText += `+${item.stats.atk} ATK  `;
        if (item.stats.def) statText += `+${item.stats.def} DEF  `;
        if (item.stats.hp) statText += `+${item.stats.hp} HP  `;
        if (item.stats.mp) statText += `+${item.stats.mp} MP  `;

        const statLabel = this.add.text(eqX + 44, sy + 24, statText.trim(), {
          fontFamily: 'Inter',
          fontSize: '9px',
          color: '#8b8b8b',
        });

        this.inventoryContainer.add([icon, name, statLabel]);

        const zone = this.add.zone(eqX + eqSlotW / 2, sy + eqSlotH / 2, eqSlotW, eqSlotH).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          cs.unequipItem(slot.key);
        });

        this.addTooltipListeners(zone, item);
        this.inventoryContainer.add(zone);

      } else {
        const placeholderIcon = this.add.text(eqX + 20, sy + 24, slot.iconPlaceholder, { fontSize: '16px' }).setOrigin(0.5).setAlpha(0.25);
        const placeholderName = this.add.text(eqX + 44, sy + 18, `[ Vazio ]`, {
          fontFamily: 'Cinzel',
          fontSize: '10px',
          color: '#555555',
        });
        this.inventoryContainer.add([placeholderIcon, placeholderName]);
      }
    });

    // === SEÇÃO DIREITA: GRID DE ITENS (4X4) ===
    const gridX = px + 236;
    const gridY = py + 54;
    const slotSize = 48;
    const gridSpacing = 8;
    const inventory = cs.getInventory();

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const index = row * 4 + col;
        const sx = gridX + col * (slotSize + gridSpacing);
        const sy = gridY + row * (slotSize + gridSpacing);

        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x130a24, 0.7);
        slotBg.fillRoundedRect(sx, sy, slotSize, slotSize, 4);
        slotBg.lineStyle(1, 0x4a2d6e, 0.5);
        slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 4);
        this.inventoryContainer.add(slotBg);

        if (index < inventory.length) {
          const item = inventory[index];

          const itemIcon = this.add.text(sx + slotSize / 2, sy + slotSize / 2, item.icon, {
            fontSize: '20px',
          }).setOrigin(0.5);
          this.inventoryContainer.add(itemIcon);

          const zone = this.add.zone(sx + slotSize / 2, sy + slotSize / 2, slotSize, slotSize).setInteractive({ useHandCursor: true });
          zone.on('pointerdown', (pointer: any) => {
            if (pointer.rightButtonDown()) {
              cs.deleteItem(item.id);
            } else {
              cs.equipItem(item.id);
            }
          });

          this.input.mouse?.disableContextMenu();
          this.addTooltipListeners(zone, item);
          this.inventoryContainer.add(zone);
        }
      }
    }

    // === FOOTER DO PAINEL: STATUS DO JOGADOR ===
    const footerY = py + ph - 36;
    const footerText = this.add.text(px + 24, footerY, `ATK: ${cs.getAttackPower()}  |  DEF: ${cs.getDefense()}  |  HP: ${cs.getHP()}/${cs.getMaxHP()}`, {
      fontFamily: 'Cinzel',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd700',
    });
    this.inventoryContainer.add(footerText);

    const instructionsText = this.add.text(px + pw - 24, footerY + 2, '[Click Esquerdo: Equipar/Desequipar  |  Clique Direito: Lixo]', {
      fontFamily: 'Inter',
      fontSize: '8px',
      color: '#8b8b8b',
    }).setOrigin(1, 0);
    this.inventoryContainer.add(instructionsText);

    // Inicializa tooltip
    this.tooltipText = this.add.text(0, 0, '', {
      fontFamily: 'Inter',
      fontSize: '9px',
      color: '#ffffff',
      backgroundColor: 'rgba(5, 2, 10, 0.95)',
      padding: { x: 8, y: 6 },
      wordWrap: { width: 160 },
      stroke: '#ffd700',
      strokeThickness: 1,
    }).setDepth(211).setVisible(false);
    this.inventoryContainer.add(this.tooltipText);
  }

  private addTooltipListeners(zone: Phaser.GameObjects.Zone, item: Item): void {
    zone.on('pointerover', (pointer: any) => {
      let statsText = '';
      if (item.stats.atk) statsText += `\n+${item.stats.atk} Ataque`;
      if (item.stats.def) statsText += `\n+${item.stats.def} Defesa`;
      if (item.stats.hp) statsText += `\n+${item.stats.hp} HP Máximo`;
      if (item.stats.mp) statsText += `\n+${item.stats.mp} MP Máximo`;

      const rarityLabel = item.rarity === 'COMMON' ? 'Comum' :
                          item.rarity === 'RARE' ? 'Raro' :
                          item.rarity === 'EPIC' ? 'Épico' : 'Lendário';

      this.tooltipText.setText(`[${rarityLabel.toUpperCase()}] ${item.name}\n${item.description}${statsText}`);
      this.tooltipText.setPosition(pointer.x + 12, pointer.y - 12);
      this.tooltipText.setVisible(true);
    });

    zone.on('pointermove', (pointer: any) => {
      this.tooltipText.setPosition(pointer.x + 12, pointer.y - 12);
    });

    zone.on('pointerout', () => {
      this.tooltipText.setVisible(false);
    });
  }
}

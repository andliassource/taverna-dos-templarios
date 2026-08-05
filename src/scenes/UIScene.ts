import Phaser from 'phaser';

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

    console.log('[UIScene] Interface criada');
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
  }
}

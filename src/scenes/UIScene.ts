import Phaser from 'phaser';
import { Item } from '../../shared/types/item.types';
import { CombatSystem } from '../systems/CombatSystem';
import { FirebaseService } from '../network/FirebaseService';
import { SoundSynth } from '../utils/SoundSynth';
import { QuestSystem } from '../systems/QuestSystem';
import { TalentSystem, TalentNode } from '../systems/TalentSystem';
import { FishingSystem } from '../systems/FishingSystem';
import { PetSystem, PetItem } from '../systems/PetSystem';
import { FactionSystem, Faction } from '../systems/FactionSystem';
import { LeaderboardSystem, LeaderboardEntry } from '../systems/LeaderboardSystem';
import { CraftingSystem } from '../systems/CraftingSystem';
import { SettingsModal } from '../ui/modals/SettingsModal';
import { InventoryModal } from '../ui/modals/InventoryModal';
import { AchievementModal } from '../ui/modals/AchievementModal';
import { BestiaryModal } from '../ui/modals/BestiaryModal';
import { QuestModal } from '../ui/modals/QuestModal';
import { CraftingModal } from '../ui/modals/CraftingModal';
import { PetModal } from '../ui/modals/PetModal';
import { GuildModal } from '../ui/modals/GuildModal';
import { TalentModal } from '../ui/modals/TalentModal';
import { GlobalChatModal } from '../ui/modals/GlobalChatModal';

/**
 * UIScene — Cena de UI sobreposta ao jogo.
 * Sempre ativa enquanto o WorldScene está rodando.
 * Gerencia: HUD, inventário, menus, chat, etc.
 */
export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private mpBar!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private gemsText!: Phaser.GameObjects.Text;
  private classText!: Phaser.GameObjects.Text;
  private mapNameText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;
  private heartsSprites: Phaser.GameObjects.Sprite[] = [];

  private skillSlots: {
    container: Phaser.GameObjects.Container;
    iconText: Phaser.GameObjects.Text;
    nameText: Phaser.GameObjects.Text;
    keyText: Phaser.GameObjects.Text;
    overlay: Phaser.GameObjects.Graphics;
    cooldownText: Phaser.GameObjects.Text;
  }[] = [];
  private lastSkillCooldowns: number[] = [0, 0, 0];
  private playerClassStr = 'PALADIN';

  private dialogueContainer!: Phaser.GameObjects.Container;
  private isDialogueOpen = false;
  private dialogueConfirmCallback: (() => void) | null = null;

  private mobileControlsContainer!: Phaser.GameObjects.Container;
  private isMobileControlsVisible = false;
  public joystickVector = { x: 0, y: 0 };

  private inventoryKey!: Phaser.Input.Keyboard.Key;
  private talentKey!: Phaser.Input.Keyboard.Key;
  private petKey!: Phaser.Input.Keyboard.Key;
  private mapKey!: Phaser.Input.Keyboard.Key;
  private leaderboardKey!: Phaser.Input.Keyboard.Key;
  private inventoryContainer!: Phaser.GameObjects.Container;
  private isInventoryOpen = false;

  private profileKey!: Phaser.Input.Keyboard.Key;
  private profileContainer!: Phaser.GameObjects.Container;
  private isProfileOpen = false;
  private statPoints = 0;
  private baseStats = { str: 10, agi: 10, int: 10, vit: 10 };
  
  private shopContainer!: Phaser.GameObjects.Container;
  private isShopOpen = false;

  private forgeContainer!: Phaser.GameObjects.Container;
  private isForgeOpen = false;
  private selectedForgeItemId: string | null = null;

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

  private settingsModal!: SettingsModal;
  private globalChatModal!: GlobalChatModal;

  create(): void {
    const { width, height } = this.cameras.main;

    // Instancia o Modal de Configurações e Chat MMORPG
    this.settingsModal = new SettingsModal(this);
    this.globalChatModal = new GlobalChatModal(this);

    // HUD — Canto superior esquerdo
    this.createHUD(width, height);

    // Mini-mapa — Canto superior direito
    this.createMiniMap(width);

    // Botão de Configurações no Topo Direito (⚙️ Configurações)
    const settingsBtn = this.add.text(width - 45, 12, '⚙️', {
      fontSize: '22px',
    }).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(300);

    settingsBtn.on('pointerdown', () => {
      this.settingsModal.toggle();
    });

    // Hotbar — Parte inferior
    this.createHotbar(width, height);

    // Controles Mobile Touch (Joystick + Botões)
    this.createMobileControlsToggle(width);
    this.createMobileControlsUI(width, height);

    // Moedas — Abaixo do HUD
    this.createCurrencyDisplay();

    // Barra de Atalhos Rápidos no Rodapé
    this.createShortcutBar(width, height);

    // Info do mapa — Topo central
    this.createMapInfo(width);

    // FPS counter (dev only)
    this.createFPSCounter(width);

    // Indicador de autosave
    this.createSaveIndicator(width, height);

    // Escuta atualizações de combate vindas do WorldScene
    this.setupCombatListeners();

    // Registra atalhos de teclado (ESC: Configurações, I: Inventário, C: Perfil, T: Talentos, M: Mascotes)
    if (this.input.keyboard) {
      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => {
        this.settingsModal.toggle();
      });
      this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
      this.profileKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
      this.talentKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
      this.petKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
      this.mapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      this.leaderboardKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    }

    // Escuta redesenho do inventário
    this.events.on('update-inventory-ui', () => {
      if (this.isInventoryOpen) {
        this.createInventoryUI();
      }
      if (this.isShopOpen) {
        this.createMerchantShopUI();
      }
      if (this.isForgeOpen) {
        this.createBlacksmithForgeUI();
      }
    });

    // Esconde controles mobile automaticamente ao usar o mouse
    this.input.on('pointerdown', () => {
      if (this.mobileControlsContainer && this.mobileControlsContainer.visible) {
        this.mobileControlsContainer.setVisible(false);
      }
    });

    console.log('[UIScene] Interface criada');
  }

  private arenaWaveText!: Phaser.GameObjects.Text;
  private saveIndicator!: Phaser.GameObjects.Text;

  private setupCombatListeners(): void {
    const worldScene = this.scene.get('WorldScene');
    if (worldScene) {
      this.registerSceneListeners(worldScene);
      worldScene.events.on('update-game-time', (data: { hour: number }) => {
        this.updateTimeHUD(data.hour);
      });
      // Listener de Diálogos
      worldScene.events.on('show-dialogue', (data: any) => {
        this.showDialogueBox(data);
      });
      worldScene.events.on('hide-dialogue', () => {
        this.hideDialogueBox();
      });
    }

    const battleScene = this.scene.get('BattleScene');
    if (battleScene) {
      this.registerSceneListeners(battleScene);
      battleScene.events.on('show-dialogue', (data: any) => {
        this.showDialogueBox(data);
      });
      battleScene.events.on('hide-dialogue', () => {
        this.hideDialogueBox();
      });
    }

    const dungeonScene = this.scene.get('DungeonScene');
    if (dungeonScene) {
      this.registerSceneListeners(dungeonScene);
    }

    this.events.on('show-achievement-banner', (ach: any) => this.showAchievementBanner(ach));
    this.events.on('update-boss-hp', (data: any) => this.updateBossHpUI(data));
  }

  private registerSceneListeners(targetScene: Phaser.Scene): void {
    targetScene.events.on('update-hud-state', (data: {
      hp: number; maxHp: number;
      mp: number; maxMp: number;
      xp: number; maxXp: number;
      level: number;
      gold: number;
      gems: number;
      statPoints?: number;
      baseStats?: { str: number; agi: number; int: number; vit: number };
      playerClass?: string;
      skillCooldowns?: number[];
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

      if (data.statPoints !== undefined) this.statPoints = data.statPoints;
      if (data.baseStats !== undefined) this.baseStats = data.baseStats;

      if (data.playerClass) {
        const classStr = data.playerClass.toString().toUpperCase();
        if (this.playerClassStr !== classStr) {
          this.playerClassStr = classStr;
          this.updateHotbarSkills();
        }
      }

      if (data.skillCooldowns) {
        this.lastSkillCooldowns = data.skillCooldowns;
      }

      if (this.isProfileOpen) {
        this.createProfileUI();
      }

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
    const x = 16;
    const hpY = 40;
    const mpY = 56;

    if (this.levelText && this.classText) {
      this.levelText.setText(`Lv.${this.playerData.level}`);
      this.levelText.setX(this.classText.x + this.classText.width + 10);
    }

    // Redesenha Barra de Vida Rubi
    if (this.hpBar) {
      this.hpBar.clear();
      this.drawBar(this.hpBar, x + 22, hpY, 130, 12,
        Math.max(0, this.playerData.hp / this.playerData.maxHp), 0x8b0000, 0xe74c3c);
    }
    if (this.hpText) {
      this.hpText.setText(`HP: ${this.playerData.hp}/${this.playerData.maxHp}`);
    }

    // Redesenha barra de MP
    if (this.mpBar) {
      this.mpBar.clear();
      this.drawBar(this.mpBar, x + 22, mpY, 130, 9,
        this.playerData.mp / this.playerData.maxMp, 0x00008b, 0x3498db);
    }

    // Atualiza textos de Moedas (Posicionamento Dinâmico sem sobreposição)
    if (this.goldText && this.gemsText) {
      this.goldText.setText(`🪙 ${this.playerData.gold.toLocaleString()}`);
      this.gemsText.setText(`💎 ${this.playerData.gems.toLocaleString()}`);

      const goldW = this.goldText.width;
      this.gemsText.setX(this.goldText.x + goldW + 20);
    }

    const activeScene = this.getActiveGameScene();
    const dashCooldownRatio = activeScene?.lastDashTime
      ? Math.max(0, (activeScene.lastDashTime + 2000 - this.time.now) / 2000)
      : 0;

    this.skillSlots.forEach((slot, idx) => {
      const overlay = slot.overlay;
      overlay.clear();

      const ratio = idx === 3 ? dashCooldownRatio : (this.lastSkillCooldowns[idx] || 0);
      if (ratio > 0) {
        overlay.fillStyle(0x000000, 0.65);
        overlay.slice(21, 21, 20, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * ratio), false);
        overlay.fillPath();

        const cdTime = idx === 3 ? 2000 : [3000, 6000, 12000][idx];
        const remaining = (ratio * cdTime / 1000).toFixed(1);
        slot.cooldownText.setText(`${remaining}s`).setVisible(true);
      } else {
        slot.cooldownText.setVisible(false);
      }
    });
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
    const x = 20;
    const y = 16;

    // Fundo do Painel do Herói em Vidro Obsidiana AAA
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a0614, 0.88);
    panelBg.fillRoundedRect(x, y, 250, 82, 14);

    panelBg.lineStyle(2, 0xffd700, 0.95);
    panelBg.strokeRoundedRect(x, y, 250, 82, 14);

    panelBg.lineStyle(1, 0xffea99, 0.4);
    panelBg.strokeRoundedRect(x + 2, y + 2, 246, 78, 12);

    // Brasão Circular de Avatar do Herói
    const badgeX = x + 30;
    const badgeY = y + 36;
    panelBg.fillStyle(0x1a0f2e, 1);
    panelBg.fillCircle(badgeX, badgeY, 22);
    panelBg.lineStyle(2, 0xffd700, 1);
    panelBg.strokeCircle(badgeX, badgeY, 22);

    this.add.text(badgeX, badgeY, '🛡️', { fontSize: '20px' }).setOrigin(0.5);

    // Nome e Nível do Jogador
    const displayName = FirebaseService.currentUser?.displayName ?? 'Templário';
    this.classText = this.add.text(x + 60, y + 10, `${displayName}`, {
      fontFamily: 'Cinzel',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });

    this.levelText = this.add.text(this.classText.x + this.classText.width + 8, y + 10, `Lv.${this.playerData.level}`, {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    });

    // === BARRA DE VIDA RUBI ÉPICO ===
    const hpY = y + 32;
    this.hpBar = this.add.graphics();
    this.drawBar(this.hpBar, x + 60, hpY, 175, 12,
      Math.max(0, this.playerData.hp / this.playerData.maxHp), 0x8b0000, 0xff3344);

    this.hpText = this.add.text(x + 60 + 87, hpY + 6,
      `HP: ${this.playerData.hp}/${this.playerData.maxHp}`, {
        fontFamily: 'Cinzel', fontSize: '8.5px', fontStyle: 'bold',
        color: '#ffffff', stroke: '#000000', strokeThickness: 2.5,
      }).setOrigin(0.5);

    // MP / Mana Bar (Safira)
    const mpY = hpY + 16;
    this.mpBar = this.add.graphics();
    this.drawBar(this.mpBar, x + 60, mpY, 175, 10,
      this.playerData.mp / this.playerData.maxMp, 0x00008b, 0x3399ff);

    // EXP Bar (Topázio Dourado)
    const expY = mpY + 14;
    this.expBar = this.add.graphics();
    this.drawBar(this.expBar, x + 60, expY, 175, 8,
      this.playerData.exp / this.playerData.expToNext, 0x5a3e10, 0xffd700);
  }

  private drawBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number, y: number,
    width: number, height: number,
    percent: number,
    darkColor: number, brightColor: number
  ): void {
    graphics.clear();

    // Fundo da barra em ferro escuro
    graphics.fillStyle(0x0c0714, 0.95);
    graphics.fillRoundedRect(x, y, width, height, 4);

    // Moldura chanfrada em ouro metálico
    graphics.lineStyle(1.5, 0xd4af37, 0.95);
    graphics.strokeRoundedRect(x, y, width, height, 4);

    if (percent > 0) {
      const fillW = Math.max(2, (width - 4) * percent);

      // Preenchimento de Cor Principal
      graphics.fillStyle(darkColor, 1);
      graphics.fillRoundedRect(x + 2, y + 2, fillW, height - 4, 3);

      // Reflexo de cristal no topo da barra
      graphics.fillStyle(brightColor, 0.85);
      graphics.fillRoundedRect(x + 2, y + 2, fillW, (height - 4) / 2, 2);
    }
  }

  private createMiniMap(width: number): void {
    const mapSize = 64;
    const x = width - mapSize - 20;
    const y = 44;

    // Fundo do mini-mapa em Placa de Ferro e Ouro Medieval
    const mmBg = this.add.graphics();
    mmBg.fillStyle(0x0e0818, 0.95);
    mmBg.fillRoundedRect(x - 6, y - 6, mapSize + 12, mapSize + 24, 8);
    mmBg.lineStyle(2, 0xd4af37, 0.95);
    mmBg.strokeRoundedRect(x - 6, y - 6, mapSize + 12, mapSize + 24, 8);
    mmBg.lineStyle(1, 0x5a3e10, 0.7);
    mmBg.strokeRoundedRect(x - 4, y - 4, mapSize + 8, mapSize + 20, 6);

    // Rebites de Ouro nos 4 cantos
    const mmCorners = [
      [x - 3, y - 3], [x + mapSize + 3, y - 3],
      [x - 3, y + mapSize + 16], [x + mapSize + 3, y + mapSize + 16]
    ];
    mmCorners.forEach(([cx, cy]) => {
      mmBg.fillStyle(0xffd700, 1);
      mmBg.fillCircle(cx, cy, 2);
    });

    // Mapa de Terreno com Borda Interna
    mmBg.fillStyle(0x1a3a1a, 0.75);
    mmBg.fillRoundedRect(x, y, mapSize, mapSize, 4);
    mmBg.lineStyle(1, 0xd4af37, 0.5);
    mmBg.strokeRoundedRect(x, y, mapSize, mapSize, 4);

    // Ponto do jogador reluzente
    mmBg.fillStyle(0xffd700, 1);
    mmBg.fillCircle(x + mapSize / 2, y + mapSize / 2, 3);

    // Rótulo Medieval do Minimapa
    this.add.text(x + mapSize / 2, y + mapSize + 6, 'MINIMAPA', {
      fontFamily: 'Cinzel', fontSize: '8px', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0.5);
  }

  private createHotbar(width: number, height: number): void {
    // Limpa slots se já existirem
    this.skillSlots.forEach((s) => s.container.destroy());
    this.skillSlots = [];

    const slotSize = 42;
    const slotCount = 5;
    const gap = 8;
    const totalWidth = slotCount * (slotSize + gap) - gap;
    const startX = (width - totalWidth) / 2;
    const y = height - slotSize - 16;

    // Fundo da Hotbar Medieval Esculpida em Metal e Ouro
    const hotbarBg = this.add.graphics();
    // Placa de ferro escuro com gradiente metálico
    hotbarBg.fillGradientStyle(0x3a3a4a, 0x1e1e28, 0x0a0612, 0x05020a, 0.95, 0.95, 0.95, 0.95);
    hotbarBg.fillRoundedRect(startX - 10, y - 10, totalWidth + 20, slotSize + 20, 10);
    
    // Sombra interna e externa projetada
    hotbarBg.lineStyle(3, 0x000000, 0.8);
    hotbarBg.strokeRoundedRect(startX - 9, y - 9, totalWidth + 18, slotSize + 18, 10);
    
    // Borda metálica dourada dupla reflexiva
    hotbarBg.lineStyle(2, 0xd4af37, 1);
    hotbarBg.strokeRoundedRect(startX - 10, y - 10, totalWidth + 20, slotSize + 20, 10);
    hotbarBg.lineStyle(1, 0x5a3e10, 0.9);
    hotbarBg.strokeRoundedRect(startX - 7, y - 7, totalWidth + 14, slotSize + 14, 8);

    // Rebites de ferro nos cantos da moldura
    const corners = [
      [startX - 6, y - 6], [startX + totalWidth + 6, y - 6],
      [startX - 6, y + slotSize + 6], [startX + totalWidth + 6, y + slotSize + 6]
    ];
    corners.forEach(([cx, cy]) => {
      hotbarBg.fillStyle(0xffd700, 1);
      hotbarBg.fillCircle(cx, cy, 2);
    });

    for (let i = 0; i < slotCount; i++) {
      const sx = startX + i * (slotSize + gap);
      const container = this.add.container(sx, y);

      // Moldura de slot metálica chanfrada com profundidade
      const slotBg = this.add.graphics();
      
      // Sombra projetada do botão
      slotBg.fillStyle(0x000000, 0.6);
      slotBg.fillRoundedRect(2, 2, slotSize, slotSize, 6);
      
      // Corpo do botão chanfrado
      slotBg.fillGradientStyle(0x332544, 0x221830, 0x110b1a, 0x08040d, 1, 1, 1, 1);
      slotBg.fillRoundedRect(0, 0, slotSize, slotSize, 6);
      
      // Borda dourada reflexiva
      slotBg.lineStyle(1.5, 0xd4af37, 1);
      slotBg.strokeRoundedRect(0, 0, slotSize, slotSize, 6);
      
      // Brilho forte no topo (reflexo especular)
      slotBg.fillGradientStyle(0xffffff, 0xffffff, 0xffd700, 0xffd700, 0.4, 0.4, 0, 0);
      slotBg.fillRoundedRect(2, 2, slotSize - 4, 6, 2);
      container.add(slotBg);

      // Icon Text (emoji)
      const iconText = this.add.text(slotSize / 2, slotSize / 2 - 4, '❓', {
        fontSize: '18px',
      }).setOrigin(0.5);
      container.add(iconText);

      // Skill Name Text (very small at the bottom of the slot)
      const nameText = this.add.text(slotSize / 2, slotSize - 6, 'Skill', {
        fontFamily: 'Inter',
        fontSize: '7px',
        fontStyle: 'bold',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      container.add(nameText);

      // Keybind text (top-left)
      const keyText = this.add.text(3, 2, `${i + 1}`, {
        fontFamily: 'Inter',
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#d4a843',
      });
      container.add(keyText);

      // Cooldown Overlay (Graphics)
      const overlay = this.add.graphics();
      container.add(overlay);

      // Cooldown Text remaining (center, bold)
      const cooldownText = this.add.text(slotSize / 2, slotSize / 2, '', {
        fontFamily: 'Cinzel',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setVisible(false);
      container.add(cooldownText);

      this.skillSlots.push({
        container,
        iconText,
        nameText,
        keyText,
        overlay,
        cooldownText,
      });
    }

    this.updateHotbarSkills();
  }

  private updateHotbarSkills(): void {
    const activeScene = this.getActiveGameScene();
    const cs = activeScene?.combatSystem;
    if (!cs) return;

    const activeSkills = cs.getActiveSkills();

    // Slot 0 (Ataque Básico) - Fixo por classe
    if (this.skillSlots[0]) {
      const basicIcons: Record<string, string> = {
        PALADIN: '⚔️', MAGE: '🔮', ARCHER: '🏹', ASSASSIN: '🗡️'
      };
      this.skillSlots[0].iconText.setText(basicIcons[this.playerClassStr] || '⚔️');
      this.skillSlots[0].nameText.setText('Ataque');
      this.skillSlots[0].keyText.setText('Esp');
    }

    // Slots 1 a 4
    for (let i = 0; i < 4; i++) {
      const slot = this.skillSlots[i + 1];
      if (!slot) continue;

      const skill = activeSkills[i];
      if (skill) {
        slot.iconText.setText(skill.icon);
        slot.nameText.setText(skill.name);
        slot.keyText.setText((i + 1).toString());
        if (!skill.unlocked) {
          slot.iconText.setAlpha(0.2);
          slot.overlay.clear();
          slot.overlay.fillStyle(0x000000, 0.8);
          slot.overlay.fillRect(-21, -21, 42, 42); // Assumindo tamanho 42 do slot
        } else {
          slot.iconText.setAlpha(1);
        }
      } else {
        slot.iconText.setText('');
        slot.nameText.setText('');
      }
    }
  }

  private showDialogueBox(data: { portrait: string; title: string; text: string; hasConfirm?: boolean; onConfirm?: () => void }): void {
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.isDialogueOpen = true;
    this.dialogueConfirmCallback = data.onConfirm || null;

    this.dialogueContainer = this.add.container(0, 0).setDepth(300);

    const boxW = 440;
    const boxH = 75;
    const px = (width - boxW) / 2;
    const py = height - boxH - 10;

    // Placa de Diálogo Medieval em Metal Escurrecido e Ouro
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, boxW, boxH, 8);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, boxW, boxH, 8);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, boxW - 6, boxH - 6, 6);

    // Rebites de Ouro nos cantos
    const dCorners = [
      [px + 6, py + 6], [px + boxW - 6, py + 6],
      [px + 6, py + boxH - 6], [px + boxW - 6, py + boxH - 6]
    ];
    dCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 2);
    });
    this.dialogueContainer.add(bg);

    // Moldura do portrait em metal trabalhado
    const portraitX = px + 10;
    const portraitY = py + 8;
    const portraitSize = 58;

    const portBg = this.add.graphics();
    portBg.fillStyle(0x1a102a, 0.95);
    portBg.fillRoundedRect(portraitX, portraitY, portraitSize, portraitSize, 4);
    portBg.lineStyle(1.5, 0xd4af37, 0.9);
    portBg.strokeRoundedRect(portraitX, portraitY, portraitSize, portraitSize, 4);
    this.dialogueContainer.add(portBg);

    // Portrait Sprite
    const portSprite = this.add.sprite(portraitX + portraitSize / 2, portraitY + portraitSize / 2, data.portrait);
    portSprite.setDisplaySize(portraitSize - 6, portraitSize - 6);
    this.dialogueContainer.add(portSprite);

    // Título do NPC
    const titleText = this.add.text(px + portraitSize + 24, py + 12, data.title, {
      fontFamily: 'Cinzel',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffd700',
    });
    this.dialogueContainer.add(titleText);

    // Conteúdo de texto
    const textObj = this.add.text(px + portraitSize + 24, py + 30, '', {
      fontFamily: 'Inter',
      fontSize: '10px',
      color: '#ffffff',
      wordWrap: { width: boxW - portraitSize - 40 },
    });
    this.dialogueContainer.add(textObj);

    // Efeito de digitação (typing effect GBA)
    let currentIdx = 0;
    this.time.addEvent({
      delay: 22,
      repeat: data.text.length - 1,
      callback: () => {
        if (textObj.active) {
          const char = data.text[currentIdx];
          textObj.text += char;
          if (currentIdx % 2 === 0 && char !== ' ') {
            SoundSynth.playTextBlip();
          }
          currentIdx++;
        }
      }
    });

    // Prompt de ação
    const promptText = this.add.text(px + boxW - 12, py + boxH - 14, data.hasConfirm ? '[ENTER] Confirmar  |  [ESC] Cancelar' : '[ENTER] Fechar', {
      fontFamily: 'Cinzel',
      fontSize: '8.5px',
      color: '#8aa6cc',
    }).setOrigin(1, 0.5);
    this.dialogueContainer.add(promptText);

    const activeScene = this.getActiveGameScene();
    if (activeScene?.player) {
      activeScene.physics.world.disable(activeScene.player);
      activeScene.player.body?.setVelocity(0, 0);
      activeScene.player.play(`${activeScene.playerClass}-idle-${activeScene.currentDirection || 'down'}`, true);
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.isDialogueOpen) return;
      if (event.key === 'Enter') {
        window.removeEventListener('keydown', onKeyDown);
        if (this.dialogueConfirmCallback) {
          this.dialogueConfirmCallback();
        }
        this.hideDialogueBox();
      } else if (event.key === 'Escape') {
        window.removeEventListener('keydown', onKeyDown);
        this.hideDialogueBox();
      }
    };
    window.addEventListener('keydown', onKeyDown);
  }

  private hideDialogueBox(): void {
    this.isDialogueOpen = false;
    this.dialogueContainer?.destroy();
    const activeScene = this.getActiveGameScene();
    if (activeScene?.player) {
      activeScene.physics.world.enable(activeScene.player);
    }
  }

  private createCurrencyDisplay(): void {
    const { width } = this.scale;
    const px = width - 260;
    const py = 16;

    // Fundo em pílula escura com borda metálica dourada para Moedas e Gemas
    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x0c0818, 0.92);
    pillBg.fillRoundedRect(px, py, 244, 28, 14);
    pillBg.lineStyle(1.5, 0xffd700, 0.8);
    pillBg.strokeRoundedRect(px, py, 244, 28, 14);

    this.goldText = this.add.text(px + 16, py + 14, `🪙 ${this.playerData.gold.toLocaleString()}`, {
      fontFamily: 'Inter', fontSize: '11px', fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0, 0.5);

    this.gemsText = this.add.text(px + 130, py + 14, `💎 ${this.playerData.gems.toLocaleString()}`, {
      fontFamily: 'Inter', fontSize: '11px', fontStyle: 'bold',
      color: '#87ceeb',
    }).setOrigin(0, 0.5);

    this.createGBAActionHints(width, this.scale.height);
  }

  private createGBAActionHints(width: number, height: number): void {
    const x = width - 16;
    const y = height - 24;

    const hintContainer = this.add.container(x, y).setDepth(200);

    const hints = [
      { key: 'Ⓐ', label: 'Interagir [E]', color: '#52b72c' },
      { key: 'Ⓑ', label: 'Atacar [Espaço]', color: '#ff3344' },
      { key: 'Ⓧ', label: 'Esquiva [Shift]', color: '#3b82f6' },
    ];

    let currentX = 0;
    hints.reverse().forEach((hint) => {
      const pBg = this.add.graphics();
      pBg.fillStyle(0x0c0818, 0.88);
      pBg.fillRoundedRect(currentX - 110, -12, 105, 24, 12);
      pBg.lineStyle(1, 0xffd700, 0.6);
      pBg.strokeRoundedRect(currentX - 110, -12, 105, 24, 12);

      const txt = this.add.text(currentX - 57, 0, `${hint.key} ${hint.label}`, {
        fontFamily: 'Inter', fontSize: '9px', fontStyle: 'bold', color: hint.color
      }).setOrigin(0.5);

      hintContainer.add([pBg, txt]);
      currentX -= 115;
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

  private createSaveIndicator(width: number, height: number): void {
    this.saveIndicator = this.add.text(width / 2, height - 8, '💾 Progresso salvo', {
      fontFamily: 'Inter',
      fontSize: '10px',
      color: '#aaffaa',
      stroke: '#000000',
      strokeThickness: 2,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setDepth(300).setAlpha(0).setScrollFactor(0);
  }

  public showSaveIndicator(): void {
    if (!this.saveIndicator) return;
    this.tweens.killTweensOf(this.saveIndicator);
    this.saveIndicator.setAlpha(1);
    this.tweens.add({
      targets: this.saveIndicator,
      alpha: 0,
      delay: 1500,
      duration: 800,
      ease: 'Power2',
    });
  }

  update(): void {
    // Atualiza FPS
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
    }

    // Atalhos do inventário (I), perfil (C) e talentos (T)
    if (this.inventoryKey && Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      this.toggleInventory();
    }
    if (this.profileKey && Phaser.Input.Keyboard.JustDown(this.profileKey)) {
      this.toggleProfileUI();
    }
    if (this.talentKey && Phaser.Input.Keyboard.JustDown(this.talentKey)) {
      this.toggleTalentTree();
    }
    if (this.petKey && Phaser.Input.Keyboard.JustDown(this.petKey)) {
      this.togglePetMountUI();
    }
    
    if (this.mapKey && Phaser.Input.Keyboard.JustDown(this.mapKey)) {
      if (!this.scene.isActive('MapScene')) {
        // Pausar cenas ativas
        if (this.scene.isActive('WorldScene')) this.scene.pause('WorldScene');
        if (this.scene.isActive('DungeonScene')) this.scene.pause('DungeonScene');
        this.scene.launch('MapScene');
      } else {
        this.scene.stop('MapScene');
        if (this.scene.isPaused('WorldScene')) this.scene.resume('WorldScene');
        if (this.scene.isPaused('DungeonScene')) this.scene.resume('DungeonScene');
      }
    }

    if (this.leaderboardKey && Phaser.Input.Keyboard.JustDown(this.leaderboardKey)) {
      this.toggleLeaderboardUI();
    }
  }

  public toggleProfileUI(forceState?: boolean): void {
    const newState = forceState !== undefined ? forceState : !this.isProfileOpen;
    this.isProfileOpen = newState;

    if (this.isProfileOpen) {
      this.createProfileUI();
    } else if (this.profileContainer) {
      this.profileContainer.destroy();
    }
  }

  private createProfileUI(): void {
    if (this.profileContainer) {
      this.profileContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.profileContainer = this.add.container(width / 2, height / 2).setDepth(400);

    const w = 380;
    const h = 470;

    // Fundo medieval em metal trabalhado com filigrana dourada
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 8);

    const corners = [
      [-w / 2 + 7, -h / 2 + 7], [w / 2 - 7, -h / 2 + 7],
      [-w / 2 + 7, h / 2 - 7], [w / 2 - 7, h / 2 - 7]
    ];
    corners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.profileContainer.add(bg);

    // Título
    const title = this.add.text(0, -h / 2 + 22, '📜 PERFIL DO TEMPLÁRIO', {
      fontFamily: 'Cinzel',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.profileContainer.add(title);

    // Botão Fechar (X)
    const closeBtn = this.add.text(w / 2 - 20, -h / 2 + 18, '✖', {
      fontFamily: 'Cinzel',
      fontSize: '16px',
      color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleProfileUI(false));
    this.profileContainer.add(closeBtn);

    // Info Geral
    const infoText = this.add.text(-w / 2 + 24, -h / 2 + 55,
      `Classe: ${this.playerData.class || this.playerClassStr}   |   Nível: ${this.playerData.level}\n` +
      `HP: ${this.playerData.hp}/${this.playerData.maxHp}   |   MP: ${this.playerData.mp}/${this.playerData.maxMp}`,
      {
        fontFamily: 'MedievalSharp',
        fontSize: '13px',
        color: '#e0d5c0',
        lineSpacing: 6,
      }
    );
    this.profileContainer.add(infoText);

    // Divisor
    const div = this.add.graphics();
    div.lineStyle(1, 0xd4a843, 0.5);
    div.lineBetween(-w / 2 + 20, -h / 2 + 105, w / 2 - 20, -h / 2 + 105);
    this.profileContainer.add(div);

    // Pontos de Atributo Disponíveis
    const statPointsText = this.add.text(0, -h / 2 + 120, `Pontos Disponíveis: ${this.statPoints}`, {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: this.statPoints > 0 ? '#ffd700' : '#888888',
    }).setOrigin(0.5);
    this.profileContainer.add(statPointsText);

    // Lista de Atributos (FOR, AGI, INT, VIT)
    const statConfigs = [
      { key: 'str', label: '🏋️ FORÇA (Dano Físico)', val: this.baseStats.str },
      { key: 'agi', label: '🎯 AGILIDADE (Velocidade & Crit)', val: this.baseStats.agi },
      { key: 'int', label: '🔮 INTELIGÊNCIA (Dano Mágico & MP)', val: this.baseStats.int },
      { key: 'vit', label: '❤️ VITALIDADE (HP & Defesa)', val: this.baseStats.vit },
    ];

    const startY = -h / 2 + 145;
    const rowHeight = 44;

    statConfigs.forEach((stat, idx) => {
      const ry = startY + idx * rowHeight;

      // Fundo da linha em madeira e ferro escuro
      const rowBg = this.add.graphics();
      rowBg.fillStyle(0x1a0d24, 0.85);
      rowBg.fillRoundedRect(-w / 2 + 20, ry, w - 40, 36, 6);
      rowBg.lineStyle(1, 0x5a3e10, 0.8);
      rowBg.strokeRoundedRect(-w / 2 + 20, ry, w - 40, 36, 6);
      this.profileContainer.add(rowBg);

      // Label + Valor
      const lbl = this.add.text(-w / 2 + 32, ry + 10, `${stat.label}: ${stat.val}`, {
        fontFamily: 'Cinzel',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
      });
      this.profileContainer.add(lbl);

      // Botão + Dourado Templário se houver pontos
      if (this.statPoints > 0) {
        const addBtnBg = this.add.graphics();
        addBtnBg.fillStyle(0x4a2c00, 0.95);
        addBtnBg.fillRoundedRect(w / 2 - 58, ry + 5, 26, 26, 4);
        addBtnBg.lineStyle(1.5, 0xffd700, 1);
        addBtnBg.strokeRoundedRect(w / 2 - 58, ry + 5, 26, 26, 4);
        this.profileContainer.add(addBtnBg);

        const addLabel = this.add.text(w / 2 - 45, ry + 17, '+', {
          fontFamily: 'Cinzel',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#ffd700',
        }).setOrigin(0.5);
        this.profileContainer.add(addLabel);

        const hit = this.add.zone(w / 2 - 45, ry + 18, 30, 30).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
          const sc = this.getActiveCombatSystem();
          if (sc) {
            sc.allocateStatPoint(stat.key as any);
            SoundSynth.playUpgrade();
            this.createProfileUI();
          }
        });
      }
    });

    // Seção de Reputação de Facções
    const facY = startY + 4 * rowHeight + 10;
    const facTitle = this.add.text(0, facY, '⚔️ FACÇÕES TEMPLÁRIAS', {
      fontFamily: 'Cinzel', fontSize: '12px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    this.profileContainer.add(facTitle);

    const factions = FactionSystem.getInstance().getFactions();
    factions.forEach((f: Faction, fIdx: number) => {
      const fy = facY + 18 + fIdx * 20;
      const rank = FactionSystem.getInstance().getRank(f.id);
      const fTxt = this.add.text(-w / 2 + 25, fy, `${f.icon} ${f.name}: ${f.reputation} REP [${rank}]`, {
        fontFamily: 'MedievalSharp', fontSize: '11px', color: rank === 'EXALTADO' ? '#00ffcc' : rank === 'RESPEITADO' ? '#ffd700' : '#cccccc'
      });
      this.profileContainer.add(fTxt);
    });

    // Tecla de Atalho Dica no Rodapé com Margem Adequada
    const hintText = this.add.text(0, h / 2 - 18, 'Pressione [C] ou [ESC] para Fechar', {
      fontFamily: 'Cinzel',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5);
    this.profileContainer.add(hintText);
  }

  private toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    const activeScene = this.getActiveGameScene();
    if (activeScene?.player) {
      if (this.isInventoryOpen) {
        activeScene.physics.world.disable(activeScene.player);
        activeScene.player.play(`player-idle-${activeScene.currentDirection || 'down'}`, true);
      } else {
        activeScene.physics.world.enable(activeScene.player);
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

  private getActiveSceneName(): 'WorldScene' | 'BattleScene' | null {
    if (this.scene.isActive('WorldScene')) return 'WorldScene';
    if (this.scene.isActive('BattleScene')) return 'BattleScene';
    return null;
  }

  private getActiveCombatSystem(): CombatSystem | null {
    const name = this.getActiveSceneName();
    return name ? (this.scene.get(name) as any).combatSystem ?? null : null;
  }

  private getActiveGameScene(): any {
    const name = this.getActiveSceneName();
    return name ? this.scene.get(name) : null;
  }

  private createInventoryUI(): void {
    if (this.inventoryContainer) {
      this.inventoryContainer.destroy();
    }

    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    this.inventoryContainer = new InventoryModal(
      this, cs,
      () => this.toggleInventory(),
      () => this.createInventoryUI()
    );
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

  // ==================== NPC INTERACTION SYSTEMS ====================
  public toggleMerchantShop(open: boolean): void {
    this.isShopOpen = open;
    if (!open) {
      this.shopContainer?.destroy();
      this.getActiveGameScene()?.player && this.getActiveGameScene().physics.world.enable(this.getActiveGameScene().player);
    } else {
      if (this.isInventoryOpen) this.toggleInventory();
      if (this.isForgeOpen) this.toggleBlacksmithForge(false);
      this.createMerchantShopUI();
    }
  }

  public toggleBlacksmithForge(open: boolean): void {
    this.isForgeOpen = open;
    if (!open) {
      this.forgeContainer?.destroy();
      this.selectedForgeItemId = null;
    } else {
      if (this.isInventoryOpen) this.toggleInventory();
      if (this.isShopOpen) this.toggleMerchantShop(false);

      this.forgeContainer?.destroy();
      this.forgeContainer = new CraftingModal(
        this,
        () => this.toggleBlacksmithForge(false),
        () => this.updateHUDVisuals()
      ) as any;
    }
  }

  private isQuestBoardOpen = false;
  private questBoardContainer: Phaser.GameObjects.Container | null = null;

  public toggleQuestBoard(open: boolean): void {
    this.isQuestBoardOpen = open;
    if (!open) {
      this.questBoardContainer?.destroy();
    } else {
      if (this.isInventoryOpen) this.toggleInventory();
      if (this.isShopOpen) this.toggleMerchantShop(false);
      if (this.isForgeOpen) this.toggleBlacksmithForge(false);

      this.questBoardContainer?.destroy();
      this.questBoardContainer = new QuestModal(
        this,
        () => this.toggleQuestBoard(false),
        () => this.updateHUDVisuals()
      ) as any;
    }
  }

  private createQuestBoardUI(): void {
    if (this.questBoardContainer) {
      this.questBoardContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.questBoardContainer = this.add.container(0, 0).setDepth(200);

    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    const px = width / 2 - 220;
    const py = height / 2 - 160;
    const pw = 440;
    const ph = 320;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);

    const qCorners = [
      [px + 7, py + 7], [px + pw - 7, py + 7],
      [px + 7, py + ph - 7], [px + pw - 7, py + ph - 7]
    ];
    qCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.questBoardContainer.add(bg);

    const title = this.add.text(width / 2, py + 20, '📜 QUADRO DE MISSÕES DIÁRIAS', {
      fontFamily: 'Cinzel', fontSize: '14px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    this.questBoardContainer.add(title);

    const closeBtn = this.add.text(px + pw - 24, py + 12, '✖', {
      fontSize: '18px', color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleQuestBoard(false));
    this.questBoardContainer.add(closeBtn);

    const quests = QuestSystem.getInstance().getQuests();
    quests.forEach((q, idx) => {
      const qy = py + 55 + idx * 75;

      const card = this.add.graphics();
      card.fillStyle(0x1a0f30, 0.8);
      card.fillRoundedRect(px + 20, qy, pw - 40, 65, 6);
      card.lineStyle(1, q.completed ? 0x00ffcc : 0x4a2d6e, 0.8);
      card.strokeRoundedRect(px + 20, qy, pw - 40, 65, 6);
      this.questBoardContainer!.add(card);

      const qIcon = this.add.text(px + 40, qy + 32, q.icon, { fontSize: '22px' }).setOrigin(0.5);
      const qTitle = this.add.text(px + 65, qy + 10, q.title, {
        fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
      });
      const qDesc = this.add.text(px + 65, qy + 26, `${q.description} (${q.currentCount}/${q.targetCount})`, {
        fontFamily: 'Inter', fontSize: '9px', color: '#cccccc'
      });
      const qReward = this.add.text(px + 65, qy + 42, `Recompensa: 🪙 ${q.goldReward} | 💎 ${q.gemsReward}`, {
        fontFamily: 'Inter', fontSize: '9px', color: '#ffd700', fontStyle: 'bold'
      });

      this.questBoardContainer!.add([qIcon, qTitle, qDesc, qReward]);

      if (q.completed && !q.claimed) {
        const claimBtnBg = this.add.graphics();
        claimBtnBg.fillStyle(0x00aa66, 1);
        claimBtnBg.fillRoundedRect(px + pw - 120, qy + 18, 90, 28, 4);
        this.questBoardContainer!.add(claimBtnBg);

        const claimTxt = this.add.text(px + pw - 75, qy + 32, 'RESGATAR', {
          fontFamily: 'Cinzel', fontSize: '9px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        this.questBoardContainer!.add(claimTxt);

        const claimZone = this.add.zone(px + pw - 75, qy + 32, 90, 28).setInteractive({ useHandCursor: true });
        claimZone.on('pointerdown', () => {
          if (QuestSystem.getInstance().claim(q.id, cs)) {
            SoundSynth.playUpgrade();
            this.createQuestBoardUI();
          }
        });
        this.questBoardContainer!.add(claimZone);
      } else if (q.claimed) {
        const doneTxt = this.add.text(px + pw - 75, qy + 32, '✓ CONCLUÍDO', {
          fontFamily: 'Cinzel', fontSize: '9px', fontStyle: 'bold', color: '#00ffaa'
        }).setOrigin(0.5);
        this.questBoardContainer!.add(doneTxt);
      }
    });
  }

  private isTalentTreeOpen = false;
  private talentTreeContainer: Phaser.GameObjects.Container | null = null;

  public toggleTalentTree(open?: boolean): void {
    const nextState = open !== undefined ? open : !this.isTalentTreeOpen;
    this.isTalentTreeOpen = nextState;

    if (!nextState) {
      this.talentTreeContainer?.destroy();
    } else {
      if (this.isInventoryOpen) this.toggleInventory();
      if (this.isShopOpen) this.toggleMerchantShop(false);
      if (this.isForgeOpen) this.toggleBlacksmithForge(false);
      if (this.isQuestBoardOpen) this.toggleQuestBoard(false);

      this.talentTreeContainer?.destroy();
      this.talentTreeContainer = new TalentModal(
        this,
        () => this.toggleTalentTree(false),
        () => this.updateHUDVisuals()
      ) as any;
    }
  }

  private createTalentTreeUI(): void {
    if (this.talentTreeContainer) {
      this.talentTreeContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.talentTreeContainer = this.add.container(0, 0).setDepth(200);

    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    const px = width / 2 - 230;
    const py = height / 2 - 165;
    const pw = 460;
    const ph = 330;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);

    const tCorners = [
      [px + 7, py + 7], [px + pw - 7, py + 7],
      [px + 7, py + ph - 7], [px + pw - 7, py + ph - 7]
    ];
    tCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.talentTreeContainer.add(bg);

    const title = this.add.text(width / 2, py + 20, '🌟 ÁRVORE DE TALENTOS', {
      fontFamily: 'Cinzel', fontSize: '15px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    this.talentTreeContainer.add(title);

    const closeBtn = this.add.text(px + pw - 24, py + 12, '✖', {
      fontSize: '18px', color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleTalentTree(false));
    this.talentTreeContainer.add(closeBtn);

    const pointsText = this.add.text(px + 24, py + 45, `PONTOS DISPONÍVEIS: ${TalentSystem.getInstance().getAvailablePoints()}`, {
      fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#00ffcc'
    });
    this.talentTreeContainer.add(pointsText);

    const resetBtnBg = this.add.graphics();
    resetBtnBg.fillStyle(0x8b0000, 1);
    resetBtnBg.fillRoundedRect(px + pw - 150, py + 42, 120, 24, 4);
    this.talentTreeContainer.add(resetBtnBg);

    const resetTxt = this.add.text(px + pw - 90, py + 54, 'RESETAR (🪙200)', {
      fontFamily: 'Cinzel', fontSize: '8px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    this.talentTreeContainer.add(resetTxt);

    const resetZone = this.add.zone(px + pw - 90, py + 54, 120, 24).setInteractive({ useHandCursor: true });
    resetZone.on('pointerdown', () => {
      if (TalentSystem.getInstance().reset(cs)) {
        SoundSynth.playUpgrade();
        this.createTalentTreeUI();
      }
    });
    this.talentTreeContainer.add(resetZone);

    const nodes = TalentSystem.getInstance().getNodes();
    nodes.forEach((n: TalentNode, idx: number) => {
      const ny = py + 80 + idx * 56;

      const card = this.add.graphics();
      card.fillStyle(0x150b28, 0.85);
      card.fillRoundedRect(px + 20, ny, pw - 40, 50, 6);
      card.lineStyle(1, 0x4a2d6e, 0.8);
      card.strokeRoundedRect(px + 20, ny, pw - 40, 50, 6);
      this.talentTreeContainer!.add(card);

      const nIcon = this.add.text(px + 40, ny + 25, n.icon, { fontSize: '20px' }).setOrigin(0.5);
      const nName = this.add.text(px + 62, ny + 8, n.name, {
        fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
      });
      const nDesc = this.add.text(px + 62, ny + 25, `${n.description} (${n.points}/${n.maxPoints})`, {
        fontFamily: 'Inter', fontSize: '9px', color: '#aaaaaa'
      });

      this.talentTreeContainer!.add([nIcon, nName, nDesc]);

      if (n.points < n.maxPoints) {
        const plusBg = this.add.graphics();
        plusBg.fillStyle(0x00aa66, 1);
        plusBg.fillRoundedRect(px + pw - 60, ny + 12, 32, 26, 4);
        this.talentTreeContainer!.add(plusBg);

        const plusTxt = this.add.text(px + pw - 44, ny + 25, '+', {
          fontSize: '16px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        this.talentTreeContainer!.add(plusTxt);

        const plusZone = this.add.zone(px + pw - 44, ny + 25, 32, 26).setInteractive({ useHandCursor: true });
        plusZone.on('pointerdown', () => {
          if (TalentSystem.getInstance().allocate(n.id)) {
            SoundSynth.playUpgrade();
            this.createTalentTreeUI();
          }
        });
        this.talentTreeContainer!.add(plusZone);
      }
    });
  }

  private isPetMountOpen = false;
  private petMountContainer: Phaser.GameObjects.Container | null = null;

  public togglePetMountUI(open?: boolean): void {
    const nextState = open !== undefined ? open : !this.isPetMountOpen;
    this.isPetMountOpen = nextState;

    if (!nextState) {
      this.petMountContainer?.destroy();
    } else {
      if (this.isInventoryOpen) this.toggleInventory();
      if (this.isShopOpen) this.toggleMerchantShop(false);
      if (this.isForgeOpen) this.toggleBlacksmithForge(false);
      if (this.isQuestBoardOpen) this.toggleQuestBoard(false);
      if (this.isTalentTreeOpen) this.toggleTalentTree(false);

      this.petMountContainer?.destroy();
      this.petMountContainer = new PetModal(
        this,
        () => this.togglePetMountUI(false),
        () => this.updateHUDVisuals()
      ) as any;
    }
  }

  private createPetMountUI(): void {
    if (this.petMountContainer) {
      this.petMountContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.petMountContainer = this.add.container(0, 0).setDepth(200);

    const px = width / 2 - 230;
    const py = height / 2 - 165;
    const pw = 460;
    const ph = 330;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);

    const pCorners = [
      [px + 7, py + 7], [px + pw - 7, py + 7],
      [px + 7, py + ph - 7], [px + pw - 7, py + ph - 7]
    ];
    pCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.petMountContainer.add(bg);

    const title = this.add.text(width / 2, py + 20, '🐾 MASCOTES & MONTARIAS TEMPLÁRIAS', {
      fontFamily: 'Cinzel', fontSize: '14px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    this.petMountContainer.add(title);

    const closeBtn = this.add.text(px + pw - 24, py + 12, '✖', {
      fontSize: '18px', color: '#00ffcc'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.togglePetMountUI(false));
    this.petMountContainer.add(closeBtn);

    const items = PetSystem.getInstance().getItems();
    const activePet = PetSystem.getInstance().getActivePet();
    const activeMount = PetSystem.getInstance().getActiveMount();

    items.forEach((item: PetItem, idx: number) => {
      const iy = py + 55 + idx * 52;

      const card = this.add.graphics();
      card.fillStyle(0x182440, 0.85);
      card.fillRoundedRect(px + 20, iy, pw - 40, 46, 6);

      const isEquipped = (item.type === 'PET' && activePet?.id === item.id) ||
                         (item.type === 'MOUNT' && activeMount?.id === item.id);

      card.lineStyle(1, isEquipped ? 0x00ffcc : 0x2e426e, 0.8);
      card.strokeRoundedRect(px + 20, iy, pw - 40, 46, 6);
      this.petMountContainer!.add(card);

      const icon = this.add.text(px + 40, iy + 23, item.icon, { fontSize: '20px' }).setOrigin(0.5);
      const name = this.add.text(px + 62, iy + 7, `${item.name} [${item.type}]`, {
        fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
      });
      const desc = this.add.text(px + 62, iy + 24, item.description, {
        fontFamily: 'Inter', fontSize: '9px', color: '#aaaaaa'
      });

      this.petMountContainer!.add([icon, name, desc]);

      if (item.unlocked) {
        const btnBg = this.add.graphics();
        btnBg.fillStyle(isEquipped ? 0x8b0000 : 0x00aa66, 1);
        btnBg.fillRoundedRect(px + pw - 100, iy + 10, 75, 26, 4);
        this.petMountContainer!.add(btnBg);

        const btnTxt = this.add.text(px + pw - 62, iy + 23, isEquipped ? 'REMOVER' : 'EQUIPAR', {
          fontFamily: 'Cinzel', fontSize: '8px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        this.petMountContainer!.add(btnTxt);

        const zone = this.add.zone(px + pw - 62, iy + 23, 75, 26).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          PetSystem.getInstance().equip(item.id);
          SoundSynth.playUpgrade();
          this.createPetMountUI();
        });
        this.petMountContainer!.add(zone);
      }
    });
  }

  private isLeaderboardOpen = false;
  private leaderboardContainer: Phaser.GameObjects.Container | null = null;

  public toggleLeaderboardUI(open?: boolean): void {
    const nextState = open !== undefined ? open : !this.isLeaderboardOpen;
    this.isLeaderboardOpen = nextState;

    if (!nextState) {
      this.leaderboardContainer?.destroy();
      this.getActiveGameScene()?.player && this.getActiveGameScene().physics.world.enable(this.getActiveGameScene().player);
    } else {
      if (this.isInventoryOpen) this.toggleInventory();
      if (this.isShopOpen) this.toggleMerchantShop(false);
      if (this.isForgeOpen) this.toggleBlacksmithForge(false);
      if (this.isQuestBoardOpen) this.toggleQuestBoard(false);
      if (this.isTalentTreeOpen) this.toggleTalentTree(false);
      if (this.isPetMountOpen) this.togglePetMountUI(false);
      this.createLeaderboardUI();
    }
  }

  private createLeaderboardUI(): void {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.leaderboardContainer = this.add.container(0, 0).setDepth(200);

    const px = width / 2 - 230;
    const py = height / 2 - 165;
    const pw = 460;
    const ph = 330;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);

    const lCorners = [
      [px + 7, py + 7], [px + pw - 7, py + 7],
      [px + 7, py + ph - 7], [px + pw - 7, py + ph - 7]
    ];
    lCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.leaderboardContainer.add(bg);

    const title = this.add.text(width / 2, py + 20, '🏆 RANKING GLOBAL DOS TEMPLÁRIOS', {
      fontFamily: 'Cinzel', fontSize: '14px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    this.leaderboardContainer.add(title);

    const closeBtn = this.add.text(px + pw - 24, py + 12, '✖', {
      fontSize: '18px', color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleLeaderboardUI(false));
    this.leaderboardContainer.add(closeBtn);

    const entries = LeaderboardSystem.getInstance().getEntries();
    entries.forEach((entry: LeaderboardEntry, idx: number) => {
      const iy = py + 55 + idx * 50;

      const card = this.add.graphics();
      card.fillStyle(0x221235, 0.85);
      card.fillRoundedRect(px + 20, iy, pw - 40, 44, 6);

      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
      card.lineStyle(1, entry.rank <= 3 ? 0xffd700 : 0x4a2d6e, 0.8);
      card.strokeRoundedRect(px + 20, iy, pw - 40, 44, 6);
      this.leaderboardContainer!.add(card);

      const rankTxt = this.add.text(px + 40, iy + 22, medal, { fontSize: '16px' }).setOrigin(0.5);
      const nameTxt = this.add.text(px + 65, iy + 7, `${entry.name} (Lv.${entry.level})`, {
        fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
      });
      const statsTxt = this.add.text(px + 65, iy + 24, `Arena: Onda ${entry.arenaWave} | Ouro: 🪙 ${entry.gold.toLocaleString()}`, {
        fontFamily: 'Inter', fontSize: '9px', color: '#ffd700'
      });

      this.leaderboardContainer!.add([rankTxt, nameTxt, statsTxt]);
    });
  }

  private createMerchantShopUI(): void {
    if (this.shopContainer) {
      this.shopContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.shopContainer = this.add.container(0, 0).setDepth(200);

    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    const px = width / 2 - 260;
    const py = height / 2 - 170;
    const pw = 520;
    const ph = 340;

    // Fundo do painel em metal trabalhado com filigrana dourada
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);

    const sCorners = [
      [px + 7, py + 7], [px + pw - 7, py + 7],
      [px + 7, py + ph - 7], [px + pw - 7, py + ph - 7]
    ];
    sCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.shopContainer.add(bg);

    // Título Loja
    const title = this.add.text(width / 2, py + 22, '🛒 ARMAZÉM DE ELISE', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.shopContainer.add(title);

    // Fechar
    const closeBtn = this.add.text(px + pw - 26, py + 12, '✖', {
      fontSize: '18px',
      color: '#ffd700',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleMerchantShop(false));
    this.shopContainer.add(closeBtn);

    // === SEÇÃO ESQUERDA: COMPRA (ITENS À VENDA) ===
    const shopX = px + 24;
    const shopY = py + 54;
    const itemCardW = 210;
    const itemCardH = 54;

    const itemsForSale: { cost: number; config: Omit<Item, 'id'> }[] = [
      {
        cost: 50,
        config: { name: 'Poção de Vida', type: 'POTION', stats: { hp: 50 }, icon: '🧪', description: 'Restaura 50 de HP.', rarity: 'COMMON' }
      },
      {
        cost: 50,
        config: { name: 'Poção de Mana', type: 'POTION', stats: { mp: 30 }, icon: '💧', description: 'Restaura 30 de MP.', rarity: 'COMMON' }
      },
      {
        cost: 120,
        config: { name: 'Elmo de Ferro', type: 'HELMET', stats: { def: 5 }, icon: '🪖', description: 'Proteção metálica básica.', rarity: 'COMMON' }
      },
      {
        cost: 100,
        config: { name: 'Escudo de Madeira', type: 'SHIELD', stats: { def: 4 }, icon: '🪵', description: 'Feito de carvalho reforçado.', rarity: 'COMMON' }
      }
    ];

    itemsForSale.forEach((shopItem, index) => {
      const sy = shopY + index * 60;

      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x19102b, 0.8);
      cardBg.fillRoundedRect(shopX, sy, itemCardW, itemCardH, 4);
      cardBg.lineStyle(1, 0x4e2e8a, 0.5);
      cardBg.strokeRoundedRect(shopX, sy, itemCardW, itemCardH, 4);
      this.shopContainer.add(cardBg);

      const icon = this.add.text(shopX + 18, sy + 27, shopItem.config.icon, { fontSize: '18px' }).setOrigin(0.5);
      const name = this.add.text(shopX + 38, sy + 10, shopItem.config.name, {
        fontFamily: 'MedievalSharp', fontSize: '10px', color: '#ffd700', fontStyle: 'bold'
      });
      const desc = this.add.text(shopX + 38, sy + 22, shopItem.config.description, {
        fontFamily: 'Inter', fontSize: '8px', color: '#9c9c9c'
      });
      const priceText = this.add.text(shopX + 38, sy + 34, `🪙 ${shopItem.cost}`, {
        fontFamily: 'Inter', fontSize: '9px', color: '#ffd700', fontStyle: 'bold'
      });

      this.shopContainer.add([icon, name, desc, priceText]);

      // Botão comprar
      const buyBtnBg = this.add.graphics();
      buyBtnBg.fillStyle(0x3a220a, 0.9);
      buyBtnBg.lineStyle(1, 0xd4a843, 0.6);
      buyBtnBg.fillRoundedRect(shopX + itemCardW - 54, sy + 15, 48, 24, 2);
      buyBtnBg.strokeRoundedRect(shopX + itemCardW - 54, sy + 15, 48, 24, 2);
      this.shopContainer.add(buyBtnBg);

      const buyLabel = this.add.text(shopX + itemCardW - 30, sy + 27, 'COMPRA', {
        fontFamily: 'Cinzel', fontSize: '9px', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(0.5);
      this.shopContainer.add(buyLabel);

      const hit = this.add.zone(shopX + itemCardW - 30, sy + 27, 48, 24).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        cs.buyItem(shopItem.config, shopItem.cost);
      });
      this.shopContainer.add(hit);
    });

    // === SEÇÃO DIREITA: VENDA (GRID DE ITENS) ===
    const gridX = px + 266;
    const gridY = py + 54;
    const slotSize = 48;
    const gridSpacing = 8;
    const inventory = cs.getInventory();

    // Título venda
    const sellTitle = this.add.text(gridX, py + 42, 'SEUS ITENS (CLIQUE PARA VENDER)', {
      fontFamily: 'Cinzel', fontSize: '10px', color: '#aaaaaa'
    });
    this.shopContainer.add(sellTitle);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const index = row * 4 + col;
        const sx = gridX + col * (slotSize + gridSpacing);
        const sy = gridY + 20 + row * (slotSize + gridSpacing);

        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x130a24, 0.7);
        slotBg.fillRoundedRect(sx, sy, slotSize, slotSize, 4);
        slotBg.lineStyle(1, 0x4a2d6e, 0.5);
        slotBg.strokeRoundedRect(sx, sy, slotSize, slotSize, 4);
        this.shopContainer.add(slotBg);

        if (index < inventory.length) {
          const item = inventory[index];

          const itemIcon = this.add.text(sx + slotSize / 2, sy + slotSize / 2, item.icon, {
            fontSize: '20px',
          }).setOrigin(0.5);
          this.shopContainer.add(itemIcon);

          // Determina preço de venda (50% do valor do item)
          let sellPrice = 25;
          if (item.type !== 'POTION') {
            sellPrice = item.rarity === 'COMMON' ? 50 :
                        item.rarity === 'RARE' ? 80 :
                        item.rarity === 'EPIC' ? 150 : 350;
          }

          // Preço na base do slot
          const priceLabel = this.add.text(sx + slotSize / 2, sy + slotSize - 6, `🪙${sellPrice}`, {
            fontFamily: 'Inter', fontSize: '8px', color: '#ffb300', fontStyle: 'bold'
          }).setOrigin(0.5);
          this.shopContainer.add(priceLabel);

          const zone = this.add.zone(sx + slotSize / 2, sy + slotSize / 2, slotSize, slotSize).setInteractive({ useHandCursor: true });
          zone.on('pointerdown', () => {
            cs.sellItem(item.id, sellPrice);
          });

          this.addTooltipListeners(zone, item);
          this.shopContainer.add(zone);
        }
      }
    }

    // Moedas do jogador no rodapé
    const footerY = py + ph - 30;
    const goldDisplay = this.add.text(px + 24, footerY, `SEU SALDO:  🪙 ${cs.getGold().toLocaleString()}`, {
      fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ffd700'
    });
    this.shopContainer.add(goldDisplay);

    // Inicializa tooltip
    this.tooltipText = this.add.text(0, 0, '', {
      fontFamily: 'Inter', fontSize: '9px', color: '#ffffff',
      backgroundColor: 'rgba(5, 2, 10, 0.95)', padding: { x: 8, y: 6 },
      wordWrap: { width: 160 }, stroke: '#ffd700', strokeThickness: 1
    }).setDepth(211).setVisible(false);
    this.shopContainer.add(this.tooltipText);
  }

  private createBlacksmithForgeUI(): void {
    if (this.forgeContainer) {
      this.forgeContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.forgeContainer = this.add.container(0, 0).setDepth(200);

    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    const px = width / 2 - 240;
    const py = height / 2 - 170;
    const pw = 480;
    const ph = 340;

    // Fundo do painel da forja em metal trabalhado
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xd4af37, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);

    const fCorners = [
      [px + 7, py + 7], [px + pw - 7, py + 7],
      [px + 7, py + ph - 7], [px + pw - 7, py + ph - 7]
    ];
    fCorners.forEach(([cx, cy]) => {
      bg.fillStyle(0xffd700, 1);
      bg.fillCircle(cx, cy, 3);
    });
    this.forgeContainer.add(bg);

    // Título
    const title = this.add.text(width / 2, py + 22, '🔨 FORJA DE BJORN', {
      fontFamily: 'Cinzel', fontSize: '15px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    this.forgeContainer.add(title);

    // Fechar
    const closeBtn = this.add.text(px + pw - 26, py + 12, '✖', {
      fontSize: '18px', color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleBlacksmithForge(false));
    this.forgeContainer.add(closeBtn);

    // === SEÇÃO SUPERIOR CENTRAL: SLOT DE APERFEIÇOAMENTO ===
    let selectedItem: Item | null = null;
    if (this.selectedForgeItemId) {
      // Procura no inventário
      selectedItem = cs.getInventory().find((it: any) => it.id === this.selectedForgeItemId) || null;
      if (!selectedItem) {
        // Procura nos equipados
        const equipped = cs.getEquipped();
        for (const slot in equipped) {
          if (equipped[slot]?.id === this.selectedForgeItemId) {
            selectedItem = equipped[slot]!;
            break;
          }
        }
      }
    }

    const forgeSlotX = width / 2;
    const forgeSlotY = py + 84;

    const forgeSlotBg = this.add.graphics();
    forgeSlotBg.fillStyle(0x1a0f30, 0.9);
    forgeSlotBg.fillCircle(forgeSlotX, forgeSlotY, 28);
    forgeSlotBg.lineStyle(1.5, 0xd4a843, 0.8);
    forgeSlotBg.strokeCircle(forgeSlotX, forgeSlotY, 28);
    this.forgeContainer.add(forgeSlotBg);

    if (selectedItem) {
      // Desenha o item na forja
      const itemIcon = this.add.text(forgeSlotX, forgeSlotY, selectedItem.icon, { fontSize: '26px' }).setOrigin(0.5);
      const itemName = this.add.text(forgeSlotX, forgeSlotY + 38, selectedItem.name, {
        fontFamily: 'MedievalSharp', fontSize: '11px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.forgeContainer.add([itemIcon, itemName]);

      // Mostra a transformação de status
      let currentVal = 0; let futureVal = 0; let statName = 'ATK';
      if (selectedItem.stats.atk) {
        currentVal = selectedItem.stats.atk;
        futureVal = currentVal + 3;
        statName = 'Ataque';
      } else if (selectedItem.stats.def) {
        currentVal = selectedItem.stats.def;
        futureVal = currentVal + 3;
        statName = 'Defesa';
      } else if (selectedItem.stats.hp) {
        currentVal = selectedItem.stats.hp;
        futureVal = currentVal + 12;
        statName = 'HP Bônus';
      }

      const statChangeText = this.add.text(forgeSlotX, forgeSlotY + 54, `${statName}: ${currentVal} ➔ ${futureVal}`, {
        fontFamily: 'Inter', fontSize: '10px', color: '#00ff00', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.forgeContainer.add(statChangeText);

      // Custo e botão
      const costText = this.add.text(forgeSlotX, forgeSlotY + 70, `REQUISITOS: 🪙 100  |  💎 1`, {
        fontFamily: 'Inter', fontSize: '9px', color: '#ffb300', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.forgeContainer.add(costText);

      const upgradeBtnBg = this.add.graphics();
      upgradeBtnBg.fillStyle(0x3a110a, 0.95);
      upgradeBtnBg.lineStyle(1.5, 0xff4400, 0.8);
      upgradeBtnBg.fillRoundedRect(forgeSlotX - 80, forgeSlotY + 84, 160, 26, 4);
      upgradeBtnBg.strokeRoundedRect(forgeSlotX - 80, forgeSlotY + 84, 160, 26, 4);
      this.forgeContainer.add(upgradeBtnBg);

      const upgradeLabel = this.add.text(forgeSlotX, forgeSlotY + 97, 'APRIMORAR EQUIPAMENTO', {
        fontFamily: 'Cinzel', fontSize: '10px', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(0.5);
      this.forgeContainer.add(upgradeLabel);

      const hit = this.add.zone(forgeSlotX, forgeSlotY + 97, 160, 26).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        if (selectedItem) cs.upgradeItem(selectedItem.id);
      });
      this.forgeContainer.add(hit);

    } else {
      const forgeIcon = this.add.text(forgeSlotX, forgeSlotY, '🔨', { fontSize: '24px' }).setOrigin(0.5).setAlpha(0.3);
      const forgeLabel = this.add.text(forgeSlotX, forgeSlotY + 38, 'SELECIONE UM ITEM ABAIXO', {
        fontFamily: 'Cinzel', fontSize: '9px', color: '#6b6b6b'
      }).setOrigin(0.5);
      this.forgeContainer.add([forgeIcon, forgeLabel]);
    }

    // === SEÇÃO INFERIOR: SELEÇÃO DE EQUIPAMENTOS DO INVENTÁRIO/EQUIPADO ===
    const listY = py + 224;
    const slotSize = 42;
    const spacing = 8;
    const listX = px + 24;

    const listLabel = this.add.text(listX, listY - 14, 'EQUIPAMENTOS DISPONÍVEIS PARA FORJA:', {
      fontFamily: 'Cinzel', fontSize: '9px', color: '#aaaaaa'
    });
    this.forgeContainer.add(listLabel);

    // Coleta todos os itens aprimoráveis do jogador (exclui POTIONS)
    const forgeableItems: { item: Item; isEquipped: boolean }[] = [];
    
    // Equipados
    const equipped = cs.getEquipped();
    for (const slot in equipped) {
      const it = equipped[slot];
      if (it && it.type !== 'POTION') {
        forgeableItems.push({ item: it, isEquipped: true });
      }
    }
    // Inventário
    cs.getInventory().forEach((it: any) => {
      if (it.type !== 'POTION') {
        forgeableItems.push({ item: it, isEquipped: false });
      }
    });

    for (let i = 0; i < 8; i++) {
      const sx = listX + i * (slotSize + spacing);

      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x130a24, 0.7);
      slotBg.fillRoundedRect(sx, listY, slotSize, slotSize, 4);
      slotBg.lineStyle(1, 0x4a2d6e, 0.5);
      slotBg.strokeRoundedRect(sx, listY, slotSize, slotSize, 4);
      this.forgeContainer.add(slotBg);

      if (i < forgeableItems.length) {
        const entry = forgeableItems[i];

        const itemIcon = this.add.text(sx + slotSize / 2, listY + slotSize / 2, entry.item.icon, {
          fontSize: '18px',
        }).setOrigin(0.5);
        this.forgeContainer.add(itemIcon);

        // Se equipado, põe bordinha verde ou marcador
        if (entry.isEquipped) {
          const eqMarker = this.add.text(sx + 4, listY + 4, 'E', {
            fontFamily: 'Inter', fontSize: '8px', fontStyle: 'bold', color: '#00ff00'
          });
          this.forgeContainer.add(eqMarker);
        }

        const zone = this.add.zone(sx + slotSize / 2, listY + slotSize / 2, slotSize, slotSize).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          this.selectedForgeItemId = entry.item.id;
          this.createBlacksmithForgeUI();
        });

        this.addTooltipListeners(zone, entry.item);
        this.forgeContainer.add(zone);
      }
    }

    // Saldo no rodapé
    const footerY = py + ph - 24;
    const balanceText = this.add.text(px + 24, footerY, `RECURSOS:  🪙 ${cs.getGold().toLocaleString()}  |  💎 ${cs.getGems()}`, {
      fontFamily: 'Cinzel', fontSize: '10px', fontStyle: 'bold', color: '#ffd700'
    });
    this.forgeContainer.add(balanceText);

    // Inicializa tooltip
    this.tooltipText = this.add.text(0, 0, '', {
      fontFamily: 'Inter', fontSize: '9px', color: '#ffffff',
      backgroundColor: 'rgba(5, 2, 10, 0.95)', padding: { x: 8, y: 6 },
      wordWrap: { width: 160 }, stroke: '#ffd700', strokeThickness: 1
    }).setDepth(211).setVisible(false);
    this.forgeContainer.add(this.tooltipText);
  }

  private updateTimeHUD(hour: number): void {
    if (!this.mapNameText) return;
    if (this.playerData.map === 'Arena de Combate') return;

    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    let icon = '☀️';
    if (hour >= 6 && hour < 11) icon = '🌅';
    else if (hour >= 11 && hour < 17) icon = '☀️';
    else if (hour >= 17 && hour < 20) icon = '🌇';
    else icon = '🌙';

    this.mapNameText.setText(`📍 ${this.playerData.map}  |  ${icon} ${timeStr}`);
  }

  private createMobileControlsToggle(width: number): void {
    const x = width - 335;
    const y = 16;

    const btn = this.add.text(x, y, '📱 Touch', {
      fontFamily: 'Inter',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffd700',
      backgroundColor: 'rgba(10, 6, 18, 0.9)',
      padding: { x: 6, y: 4 },
      stroke: '#ffd700',
      strokeThickness: 1,
    }).setOrigin(1, 0).setDepth(200).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      this.toggleMobileControls();
    });
  }

  private toggleMobileControls(): void {
    this.isMobileControlsVisible = !this.isMobileControlsVisible;
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.setVisible(this.isMobileControlsVisible);
    }
  }

  private createMobileControlsUI(width: number, height: number): void {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);
    this.isMobileControlsVisible = isTouch;
    this.mobileControlsContainer = this.add.container(0, 0).setVisible(this.isMobileControlsVisible).setDepth(250);

    // ==================== JOYSTICK (Canto Inferior Esquerdo) ====================
    const joyX = 80;
    const joyY = height - 80;
    const joyBaseRadius = 45;
    const joyThumbRadius = 20;

    const joyBase = this.add.graphics();
    joyBase.fillStyle(0xffffff, 0.15);
    joyBase.lineStyle(2, 0xffffff, 0.4);
    joyBase.fillCircle(joyX, joyY, joyBaseRadius);
    joyBase.strokeCircle(joyX, joyY, joyBaseRadius);
    this.mobileControlsContainer.add(joyBase);

    const joyThumb = this.add.graphics();
    joyThumb.fillStyle(0xffd700, 0.7);
    joyThumb.lineStyle(1.5, 0xffffff, 0.9);
    joyThumb.fillCircle(joyX, joyY, joyThumbRadius);
    joyThumb.strokeCircle(joyX, joyY, joyThumbRadius);
    this.mobileControlsContainer.add(joyThumb);

    const joyZone = this.add.zone(joyX, joyY, joyBaseRadius * 2.5, joyBaseRadius * 2.5).setInteractive();
    this.mobileControlsContainer.add(joyZone);
    this.input.setDraggable(joyZone);

    joyZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        const dist = Phaser.Math.Distance.Between(joyX, joyY, pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(joyX, joyY, pointer.x, pointer.y);

        const clampedDist = Math.min(dist, joyBaseRadius);
        const tx = joyX + Math.cos(angle) * clampedDist;
        const ty = joyY + Math.sin(angle) * clampedDist;

        joyThumb.clear();
        joyThumb.fillStyle(0xffd700, 0.7);
        joyThumb.lineStyle(1.5, 0xffffff, 0.9);
        joyThumb.fillCircle(tx, ty, joyThumbRadius);
        joyThumb.strokeCircle(tx, ty, joyThumbRadius);

        this.joystickVector.x = Math.cos(angle) * (clampedDist / joyBaseRadius);
        this.joystickVector.y = Math.sin(angle) * (clampedDist / joyBaseRadius);
      }
    });

    const resetJoystick = () => {
      joyThumb.clear();
      joyThumb.fillStyle(0xffd700, 0.7);
      joyThumb.lineStyle(1.5, 0xffffff, 0.9);
      joyThumb.fillCircle(joyX, joyY, joyThumbRadius);
      joyThumb.strokeCircle(joyX, joyY, joyThumbRadius);

      this.joystickVector.x = 0;
      this.joystickVector.y = 0;
    };

    joyZone.on('pointerout', resetJoystick);
    joyZone.on('pointerup', resetJoystick);

    // ==================== BOTÕES DE AÇÃO (Canto Inferior Direito) ====================
    const btnRadius = 20;
    const attackRadius = 28;

    const createBtn = (x: number, y: number, label: string, color: number, callback: () => void) => {
      const g = this.add.graphics();
      g.fillStyle(color, 0.65);
      g.lineStyle(2, 0xffffff, 0.85);
      g.fillCircle(x, y, btnRadius);
      g.strokeCircle(x, y, btnRadius);
      this.mobileControlsContainer.add(g);

      const t = this.add.text(x, y, label, {
        fontFamily: 'Inter',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5);
      this.mobileControlsContainer.add(t);

      const zone = this.add.zone(x, y, btnRadius * 2, btnRadius * 2).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        g.clear();
        g.fillStyle(color, 0.9);
        g.lineStyle(2, 0xffd700, 1);
        g.fillCircle(x, y, btnRadius);
        g.strokeCircle(x, y, btnRadius);
        callback();
      });
      zone.on('pointerup', () => {
        g.clear();
        g.fillStyle(color, 0.65);
        g.lineStyle(2, 0xffffff, 0.85);
        g.fillCircle(x, y, btnRadius);
        g.strokeCircle(x, y, btnRadius);
      });
      this.mobileControlsContainer.add(zone);
    };

    const getActiveScene = () => {
      const name = this.scene.isActive('WorldScene') ? 'WorldScene' : 'BattleScene';
      return this.scene.get(name) as any;
    };

    const triggerAttack = () => {
      const sc = getActiveScene();
      const cs = this.getActiveCombatSystem();
      if (sc && cs) {
        cs.performMeleeAttack(sc.player, sc.currentDirection, this.time.now);
      }
    };

    const triggerSkill = (idx: number) => {
      const sc = getActiveScene();
      const cs = this.getActiveCombatSystem();
      if (sc && cs) {
        cs.useSkill(sc.player, idx, sc.currentDirection, this.time.now);
      }
    };

    const triggerDashAction = () => {
      const sc = getActiveScene();
      if (sc && sc.triggerDash) {
        sc.triggerDash(this.time.now);
      }
    };

    // Botão de Ataque Básico (Espada)
    const atkX = width - 60;
    const atkY = height - 65;
    const atkBg = this.add.graphics();
    atkBg.fillStyle(0xdc143c, 0.65);
    atkBg.lineStyle(2.5, 0xffffff, 0.9);
    atkBg.fillCircle(atkX, atkY, attackRadius);
    atkBg.strokeCircle(atkX, atkY, attackRadius);
    this.mobileControlsContainer.add(atkBg);

    const atkText = this.add.text(atkX, atkY, '⚔️', { fontSize: '20px' }).setOrigin(0.5);
    this.mobileControlsContainer.add(atkText);

    const atkZone = this.add.zone(atkX, atkY, attackRadius * 2, attackRadius * 2).setInteractive({ useHandCursor: true });
    atkZone.on('pointerdown', () => {
      atkBg.clear();
      atkBg.fillStyle(0xdc143c, 0.95);
      atkBg.lineStyle(2.5, 0xffd700, 1);
      atkBg.fillCircle(atkX, atkY, attackRadius);
      atkBg.strokeCircle(atkX, atkY, attackRadius);
      triggerAttack();
    });
    atkZone.on('pointerup', () => {
      atkBg.clear();
      atkBg.fillStyle(0xdc143c, 0.65);
      atkBg.lineStyle(2.5, 0xffffff, 0.9);
      atkBg.fillCircle(atkX, atkY, attackRadius);
      atkBg.strokeCircle(atkX, atkY, attackRadius);
    });
    this.mobileControlsContainer.add(atkZone);

    // Botões de Habilidades em arco
    createBtn(width - 120, height - 42, '1', 0x58137b, () => triggerSkill(0));
    createBtn(width - 120, height - 96, '2', 0x228b22, () => triggerSkill(1));
    createBtn(width - 70, height - 126, '3', 0xd4af37, () => triggerSkill(2));
    createBtn(width - 170, height - 42, '💨', 0x708090, triggerDashAction);
  }

  private showAchievementBanner(ach: { name: string; description: string; icon: string; titleReward?: string }): void {
    SoundSynth.playUpgrade();
    const { width } = this.cameras.main;

    const bannerContainer = this.add.container(width / 2, -70).setDepth(300);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a0d2e, 0.95);
    bg.fillRoundedRect(-160, 0, 320, 56, 8);
    bg.lineStyle(2, 0xffd700, 1);
    bg.strokeRoundedRect(-160, 0, 320, 56, 8);

    const iconText = this.add.text(-140, 28, ach.icon, { fontSize: '24px' }).setOrigin(0.5);
    const titleText = this.add.text(-110, 14, `🏆 CONQUISTA: ${ach.name.toUpperCase()}`, {
      fontFamily: 'Cinzel',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd700',
    });

    const descText = this.add.text(-110, 32, ach.description, {
      fontFamily: 'Inter',
      fontSize: '9px',
      color: '#e0e0e0',
    });

    bannerContainer.add([bg, iconText, titleText, descText]);

    this.tweens.add({
      targets: bannerContainer,
      y: 20,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: bannerContainer,
            y: -70,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => bannerContainer.destroy(),
          });
        });
      },
    });
  }

  private bossHpContainer: Phaser.GameObjects.Container | null = null;
  private bossHpBar: Phaser.GameObjects.Graphics | null = null;

  private updateBossHpUI(data: { name: string; hp: number; maxHp: number; phase: number }): void {
    const { width } = this.cameras.main;

    if (!this.bossHpContainer) {
      this.bossHpContainer = this.add.container(width / 2, 45).setDepth(200);

      const bg = this.add.graphics();
      bg.fillStyle(0x0a0512, 0.9);
      bg.fillRoundedRect(-180, 0, 360, 32, 6);
      bg.lineStyle(1.5, 0xff2244, 1);
      bg.strokeRoundedRect(-180, 0, 360, 32, 6);

      const bossTitle = this.add.text(0, 8, `👑 ${data.name.toUpperCase()} (FASE ${data.phase})`, {
        fontFamily: 'Cinzel',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ff2244',
      }).setOrigin(0.5);

      this.bossHpBar = this.add.graphics();
      this.bossHpContainer.add([bg, bossTitle, this.bossHpBar]);
    }

    if (this.bossHpBar) {
      this.bossHpBar.clear();
      const pct = Math.max(0, Math.min(1, data.hp / data.maxHp));
      this.bossHpBar.fillStyle(data.phase === 2 ? 0xff0000 : 0xd42444, 1);
      this.bossHpBar.fillRoundedRect(-170, 20, 340 * pct, 6, 3);
    }

    if (data.hp <= 0 && this.bossHpContainer) {
      this.bossHpContainer.destroy();
      this.bossHpContainer = null;
    }
  }

  private fishingContainer: Phaser.GameObjects.Container | null = null;

  public startFishingMinigame(): void {
    const cs = this.getActiveCombatSystem();
    if (!cs) return;

    if (this.fishingContainer) this.fishingContainer.destroy();

    const { width, height } = this.cameras.main;
    this.fishingContainer = this.add.container(width / 2, height / 2).setDepth(300);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1020, 0.92);
    bg.fillRoundedRect(-140, -50, 280, 100, 8);
    bg.lineStyle(2, 0x00ffff, 1);
    bg.strokeRoundedRect(-140, -50, 280, 100, 8);

    const statusText = this.add.text(0, -20, '🎣 Aguardando a fisgada...', {
      fontFamily: 'Cinzel', fontSize: '11px', color: '#00ffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const subText = this.add.text(0, 10, 'Prepare-se para apertar ESPAÇO!', {
      fontFamily: 'Inter', fontSize: '9px', color: '#aaaaaa'
    }).setOrigin(0.5);

    this.fishingContainer.add([bg, statusText, subText]);

    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const spaceListener = () => {
      if (FishingSystem.getInstance().getIsHooked()) {
        const catchItem = FishingSystem.getInstance().reelIn(cs);
        if (catchItem) {
          SoundSynth.playUpgrade();
          statusText.setText(`✨ CAPTUROU: ${catchItem.name.toUpperCase()}!`);
          subText.setText(`+${catchItem.gold} Ouro | +${catchItem.gems} Gemas`);
          this.time.delayedCall(1600, () => {
            this.fishingContainer?.destroy();
            this.fishingContainer = null;
          });
        }
      }
    };

    if (spaceKey) {
      spaceKey.once('down', spaceListener);
    }

    FishingSystem.getInstance().startFishing(
      this, cs,
      () => {
        statusText.setText('❗ FISGOU! PRESSIONE ESPAÇO AGORA!');
        statusText.setColor('#00ff44');
        bg.lineStyle(2.5, 0x00ff44, 1);
        bg.strokeRoundedRect(-140, -50, 280, 100, 8);
      },
      () => {}
    );
  }

  private createShortcutBar(width: number, height: number): void {
    const shortcuts = [
      { key: 'I', label: '🎒 [I] Inventário', action: () => this.toggleInventory() },
      { key: 'C', label: '📜 [C] Perfil', action: () => this.toggleProfileUI() },
      { key: 'Q', label: '📜 [Q] Missões', action: () => this.toggleQuestUI() },
      { key: 'T', label: '🌟 [T] Talentos', action: () => this.toggleTalentTree() },
      { key: 'G', label: '🏰 [G] Guilda', action: () => this.toggleGuildUI() },
      { key: 'K', label: '🔨 [K] Forja', action: () => this.toggleCraftingUI() },
      { key: 'L', label: '🏆 [L] Ranking', action: () => this.toggleLeaderboardUI() },
    ];

    const barW = 580;
    const startX = width / 2 - barW / 2;
    const barY = height - 16;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0614, 0.85);
    bg.fillRoundedRect(startX, barY - 10, barW, 22, 6);
    bg.lineStyle(1, 0xd4a843, 0.6);
    bg.strokeRoundedRect(startX, barY - 10, barW, 22, 6);

    shortcuts.forEach((sc, idx) => {
      const btnX = startX + 8 + idx * 81;
      const txt = this.add.text(btnX, barY + 1, sc.label, {
        fontFamily: 'Cinzel', fontSize: '8.5px', fontStyle: 'bold', color: '#ffd700'
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

      txt.on('pointerdown', sc.action);
    });

    if (this.input.keyboard) {
      const gKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
      gKey.on('down', () => this.toggleGuildUI());

      const kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
      kKey.on('down', () => this.toggleCraftingUI());

      const qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      qKey.on('down', () => this.toggleQuestUI());

      const pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
      pKey.on('down', () => this.togglePetMountUI());

      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => this.closeAllModals());
    }
  }

  public closeAllModals(): void {
    if (this.questUIModal) { this.questUIModal.destroy(); this.questUIModal = null; }
    if (this.craftingUIModal) { this.craftingUIModal.destroy(); this.craftingUIModal = null; }
    if (this.guildUIModal) { this.guildUIModal.destroy(); this.guildUIModal = null; }
    if (this.isInventoryOpen) { this.toggleInventory(); }
    if (this.isProfileOpen) { this.toggleProfileUI(); }
  }

  private questUIModal: Phaser.GameObjects.Container | null = null;

  public toggleQuestUI(): void {
    if (this.questUIModal) {
      this.questUIModal.destroy();
      this.questUIModal = null;
      return;
    }

    const { width, height } = this.scale;
    const modal = this.add.container(width / 2, height / 2).setDepth(200);

    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.95);
    bg.fillRoundedRect(-240, -190, 480, 380, 10);
    bg.lineStyle(2, 0xd4a843, 1);
    bg.strokeRoundedRect(-240, -190, 480, 380, 10);
    modal.add(bg);

    const title = this.add.text(0, -165, '📜 DIÁRIO DE MISSÕES DIÁRIAS', {
      fontFamily: 'Cinzel', fontSize: '18px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const quests = QuestSystem.getInstance().getQuests();
    const cs = this.getActiveCombatSystem();

    quests.forEach((q, idx) => {
      const cardY = -110 + idx * 85;
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x1a1228, 0.9);
      cardBg.fillRoundedRect(-210, cardY, 420, 75, 6);
      cardBg.lineStyle(1, q.completed ? 0x00ff44 : 0xd4a843, 0.6);
      cardBg.strokeRoundedRect(-210, cardY, 420, 75, 6);
      modal.add(cardBg);

      const questTitle = this.add.text(-195, cardY + 10, `${q.icon} ${q.title} (${q.currentCount}/${q.targetCount})`, {
        fontFamily: 'Cinzel', fontSize: '13px', fontStyle: 'bold', color: q.completed ? '#00ff44' : '#ffd700'
      });
      modal.add(questTitle);

      const desc = this.add.text(-195, cardY + 32, `${q.description}\nRecompensa: +${q.goldReward} Ouro | +${q.gemsReward} Gemas`, {
        fontFamily: 'MedievalSharp', fontSize: '11px', color: '#ffffff'
      });
      modal.add(desc);

      const claimText = q.claimed ? '✅ RESGATADO' : (q.completed ? '🎁 RESGATAR' : '⏳ EM PROGRESSO');
      const claimBtn = this.add.text(145, cardY + 25, claimText, {
        fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold',
        color: q.claimed ? '#888888' : (q.completed ? '#00ff44' : '#aaaaaa'),
        backgroundColor: q.completed && !q.claimed ? '#004411' : '#222222',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: q.completed && !q.claimed });

      if (q.completed && !q.claimed) {
        claimBtn.on('pointerdown', () => {
          if (cs && QuestSystem.getInstance().claim(q.id, cs)) {
            SoundSynth.playLoot();
            this.events.emit('show-notification', `🎉 Missão Concluída! +${q.goldReward} Ouro e +${q.gemsReward} Gemas!`);
            this.toggleQuestUI();
            this.toggleQuestUI();
          }
        });
      }
      modal.add(claimBtn);
    });

    const closeBtn = this.add.text(215, -175, '✖', {
      fontFamily: 'Cinzel', fontSize: '16px', color: '#ff4444'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleQuestUI());
    modal.add(closeBtn);

    this.questUIModal = modal;
  }

  private craftingUIModal: Phaser.GameObjects.Container | null = null;

  public toggleCraftingUI(): void {
    if (this.craftingUIModal) {
      this.craftingUIModal.destroy();
      this.craftingUIModal = null;
      return;
    }

    const { width, height } = this.scale;
    const modal = this.add.container(width / 2, height / 2).setDepth(200);

    const bg = this.add.graphics();
    bg.fillStyle(0x0e0818, 0.95);
    bg.fillRoundedRect(-240, -190, 480, 380, 10);
    bg.lineStyle(2, 0xd4a843, 1);
    bg.strokeRoundedRect(-240, -190, 480, 380, 10);
    modal.add(bg);

    const title = this.add.text(0, -165, '🔨 FORJA & CRAFTING DO FERREIRO', {
      fontFamily: 'Cinzel', fontSize: '18px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    modal.add(title);

    const recipes = CraftingSystem.getInstance().getRecipes();
    recipes.forEach((r, idx) => {
      const cardY = -110 + idx * 85;
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x1a1228, 0.9);
      cardBg.fillRoundedRect(-210, cardY, 420, 75, 6);
      cardBg.lineStyle(1, 0x00ffcc, 0.6);
      cardBg.strokeRoundedRect(-210, cardY, 420, 75, 6);
      modal.add(cardBg);

      const itemText = this.add.text(-195, cardY + 10, `${r.icon} ${r.name} (${r.resultItem.rarity})`, {
        fontFamily: 'Cinzel', fontSize: '13px', fontStyle: 'bold', color: '#00ffcc'
      });
      modal.add(itemText);

      const statsText = this.add.text(-195, cardY + 30, `Bônus: ${r.resultItem.statBonus}\nMateriais: ${r.materials.map(m => `${m.item} x${m.amount}`).join(', ')}`, {
        fontFamily: 'MedievalSharp', fontSize: '11px', color: '#ffffff'
      });
      modal.add(statsText);

      const craftBtn = this.add.text(145, cardY + 25, '🔨 FORJAR', {
        fontFamily: 'Cinzel', fontSize: '11px', fontStyle: 'bold', color: '#ffd700',
        backgroundColor: '#4a2c00', padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      craftBtn.on('pointerdown', () => {
        const res = CraftingSystem.getInstance().craftItem(r.id);
        SoundSynth.playUpgrade();
        this.events.emit('show-notification', res.message);
      });
      modal.add(craftBtn);
    });

    const closeBtn = this.add.text(215, -175, '✖', {
      fontFamily: 'Cinzel', fontSize: '16px', color: '#ff4444'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleCraftingUI());
    modal.add(closeBtn);

    this.craftingUIModal = modal;
  }

  private guildUIModal: Phaser.GameObjects.Container | null = null;

  public toggleGuildUI(): void {
    if (this.guildUIModal) {
      this.guildUIModal.destroy();
      this.guildUIModal = null;
      return;
    }

    this.guildUIModal = new GuildModal(this, () => this.toggleGuildUI()) as any;
  }

  private settingsUIModal: SettingsModal | null = null;
  private achievementModal: AchievementModal | null = null;
  private bestiaryModal: BestiaryModal | null = null;

  public toggleSettingsUI(): void {
    if (!this.settingsUIModal) {
      this.settingsUIModal = new SettingsModal(this);
    }
    this.settingsUIModal.toggle();
  }

  public toggleAchievementUI(): void {
    if (this.achievementModal) {
      this.achievementModal.destroy();
      this.achievementModal = null;
      return;
    }
    this.achievementModal = new AchievementModal(
      this,
      () => this.toggleAchievementUI(),
      () => this.toggleAchievementUI()
    );
  }

  public toggleBestiaryUI(): void {
    if (this.bestiaryModal) {
      this.bestiaryModal.destroy();
      this.bestiaryModal = null;
      return;
    }
    this.bestiaryModal = new BestiaryModal(this, () => this.toggleBestiaryUI());
  }
}

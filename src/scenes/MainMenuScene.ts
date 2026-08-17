import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { SoundSynth } from '../utils/SoundSynth';
import { FirebaseService } from '../network/FirebaseService';
import { SaveManager } from '../systems/SaveManager';

/**
 * MainMenuScene — Menu principal 100% responsivo e adaptável.
 * Funciona perfeitamente em telas de PC (FullHD/4K) e Celulares.
 */
export class MainMenuScene extends Phaser.Scene {
  private selectedClass: PlayerClass = PlayerClass.PALADIN;

  private mainContainer!: Phaser.GameObjects.Container;
  private classSelectContainer!: Phaser.GameObjects.Container;

  private classButtons: Phaser.GameObjects.Container[] = [];
  private classDescText!: Phaser.GameObjects.Text;
  private classStatsText!: Phaser.GameObjects.Text;
  private classNameText!: Phaser.GameObjects.Text;
  private previewSprite!: Phaser.GameObjects.Sprite;
  private continueBtnContainer!: Phaser.GameObjects.Container;
  private playerName = 'Templário';
  private nameInputText!: Phaser.GameObjects.Text;

  private classData = {
    [PlayerClass.PALADIN]: {
      name: 'Paladino',
      icon: '🛡️',
      role: '🛡️ TANQUE SAGRADO',
      primaryStat: 'VITALIDADE & FORÇA',
      signatureSkill: '✨ Golpe Sagrado & Julgamento',
      desc: 'Guerreiro sagrado com alta defesa e HP. Ataca com golpes imbuídos de luz e protege aliados com proteção divina.',
      stats: 'HP:  ████████ (Alto)\nMP:  ████ (Baixo)\nATK: ██████ (Médio)\nDEF: ██████████ (Máximo)'
    },
    [PlayerClass.GUARDIAN]: {
      name: 'Guardião',
      icon: '🛡️',
      role: '🛡️ PAREDE DE FERRO',
      primaryStat: 'VITALIDADE & DEFESA',
      signatureSkill: '🛡️ Provocação & Barreira',
      desc: 'Baluarte defensivo inabalável. Capaz de absorver imensas quantidades de dano e proteger a linha de trás.',
      stats: 'HP:  ██████████ (Máximo)\nMP:  ████ (Baixo)\nATK: ████ (Baixo)\nDEF: ██████████ (Máximo)'
    },
    [PlayerClass.WARRIOR]: {
      name: 'Guerreiro',
      icon: '⚔️',
      role: '⚔️ DANO FÍSICO / MELEE',
      primaryStat: 'FORÇA',
      signatureSkill: '🌪️ Tormenta de Aço',
      desc: 'Mestre do combate pesado. Causa dano físico massivo em área e lidera o avanço contra as hordas.',
      stats: 'HP:  ████████ (Alto)\nMP:  ████ (Baixo)\nATK: ██████████ (Máximo)\nDEF: ██████ (Médio)'
    },
    [PlayerClass.MAGE]: {
      name: 'Mago',
      icon: '🔮',
      role: '🔮 DANO MÁGICO EM ÁREA',
      primaryStat: 'INTELIGÊNCIA',
      signatureSkill: '☄️ Meteoro Arcano',
      desc: 'Mestre das artes arcanas. Dispara projéteis de fogo e evoca tempestades mágicas de longo alcance.',
      stats: 'HP:  ████ (Baixo)\nMP:  ██████████ (Máximo)\nATK: ████████ (Alto)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.NECROMANCER]: {
      name: 'Necromante',
      icon: '💀',
      role: '💀 INVOCADOR SOMBRIO',
      primaryStat: 'INTELIGÊNCIA & MAGIA',
      signatureSkill: '☠️ Evocar Exército & Explosão',
      desc: 'Invocador das artes sombrias. Evoca esqueletos e consome a energia dos mortos para devastar o campo.',
      stats: 'HP:  ██████ (Médio)\nMP:  ██████████ (Máximo)\nATK: ████████ (Alto)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.ARCHER]: {
      name: 'Arqueiro',
      icon: '🏹',
      role: '🏹 DANO FÍSICO À DISTÂNCIA',
      primaryStat: 'AGILIDADE',
      signatureSkill: '🎯 Tiro Perfurante & Chuva',
      desc: 'Atirador ágil da floresta. Dispara flechas rápidas e precisas mantendo distância dos perigos.',
      stats: 'HP:  ██████ (Médio)\nMP:  ████ (Baixo)\nATK: ████████ (Alto)\nDEF: ██████ (Médio)'
    },
    [PlayerClass.ASSASSIN]: {
      name: 'Assassino',
      icon: '🗡️',
      role: '🗡️ DANO CRÍTICO RÁPIDO',
      primaryStat: 'AGILIDADE & FORÇA',
      signatureSkill: '⚡ Passos Sombrios & Dança de Lâminas',
      desc: 'Lutador furtivo de altíssima mobilidade. Avança rapidamente sobre os alvos para desferir acertos críticos letais.',
      stats: 'HP:  ██████ (Médio)\nMP:  ████ (Baixo)\nATK: ██████████ (Máximo)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.CLERIC]: {
      name: 'Clérigo',
      icon: '💚',
      role: '💚 CURA & SUPORTE DIVINO',
      primaryStat: 'INTELIGÊNCIA & VITALIDADE',
      signatureSkill: '✨ Luz Purificadora & Aura Sagrada',
      desc: 'Servo divino capaz de regenerar a vida do grupo, conceder escudos e purificar monstros com luz sagrada.',
      stats: 'HP:  ████████ (Alto)\nMP:  ████████ (Alto)\nATK: ██████ (Médio)\nDEF: ██████ (Médio)'
    },
  };

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    SoundSynth.playBGM('menu');
    const { width, height } = this.scale;

    // Background da taverna HD adaptável
    const bgKey = this.textures.exists('menu-bg-hd') ? 'menu-bg-hd' : 'menu-bg';
    const bg = this.add.image(width / 2, height / 2, bgKey);
    bg.setDisplaySize(width, height);

    // Overlay escuro
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0612, 0.5);
    overlay.fillRect(0, 0, width, height);

    // Vinheta
    const vignette = this.add.image(width / 2, height / 2, 'vignette');
    vignette.setDisplaySize(width, height).setAlpha(0.6);

    // Partículas douradas
    this.add.particles(0, 0, 'particle-gold', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 4500,
      speed: { min: 10, max: 25 },
      angle: { min: 250, max: 290 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.7, end: 0 },
      frequency: 180,
      blendMode: 'ADD',
    });

    // 1. TÍTULO FIXO NO TOPO DA TELA
    this.createHeaderTitle(width, height);

    // 2. CONTAINER DO MENU PRINCIPAL (ESTADO 1)
    this.mainContainer = this.add.container(width / 2, height * 0.42);
    this.createMainMenuButtons();

    // 3. CONTAINER DE SELEÇÃO DE CLASSE (ESTADO 2 - OCULTO INICIALMENTE)
    this.classSelectContainer = this.add.container(0, 0).setVisible(false);
    this.createClassSelectionContent(width, height);

    // Versão no rodapé
    this.add.text(width - 16, height - 16, 'v0.1.0-alpha (Edição Responsiva)', {
      fontFamily: 'Inter',
      fontSize: '12px',
      color: 'rgba(212, 168, 67, 0.6)',
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(500);
    this.refreshContinueButton();
    FirebaseService.onAuthChange(() => this.refreshContinueButton());
  }

  private createHeaderTitle(width: number, height: number): void {
    const titleY = height * 0.14;

    // Sombra
    const titleShadow = this.add.text(width / 2, titleY + 3, 'TAVERNA DOS TEMPLÁRIOS', {
      fontFamily: 'Cinzel',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0.7);

    // Título Principal
    const title = this.add.text(width / 2, titleY, 'TAVERNA DOS TEMPLÁRIOS', {
      fontFamily: 'Cinzel',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#4a2d10',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtítulo
    const subtitleY = height * 0.22;
    const subtitle = this.add.text(width / 2, subtitleY, 'A Ordem Aguarda Seu Retorno', {
      fontFamily: 'MedievalSharp',
      fontSize: '16px',
      color: '#d4a843',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Linha decorativa abaixo do título
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(2, 0xd4a843, 0.7);
    lineGfx.lineBetween(width / 2 - 160, subtitleY + 18, width / 2 + 160, subtitleY + 18);
    lineGfx.fillStyle(0xd4a843, 0.9);
    lineGfx.fillCircle(width / 2, subtitleY + 18, 3);

    this.tweens.add({
      targets: subtitle,
      alpha: 0.5,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createMainMenuButtons(): void {
    const hasSave = SaveManager.hasSave();
    const user = FirebaseService.currentUser;

    const buttonConfigs = [
      ...(hasSave ? [{ text: '▶️  CONTINUAR JOGO', callback: () => this.onContinue(), primary: true }] : []),
      { text: '⚔️  NOVA AVENTURA', callback: () => this.showClassSelection(), primary: !hasSave },
      {
        text: user ? `👤  ${user.displayName ?? 'Conta Google'}` : '🔑  ENTRAR COM GOOGLE',
        callback: () => user ? this.onLogout() : this.onGoogleLogin(),
        primary: false,
      },
    ];

    let currentY = 0;
    buttonConfigs.forEach((config) => {
      const btn = this.createButton(0, currentY, 300, 48, config.text, config.callback, config.primary);
      if (config.text.startsWith('▶️')) this.continueBtnContainer = btn;
      this.mainContainer.add(btn);
      currentY += 64;
    });
  }

  private showClassSelection(): void {
    SoundSynth.playLoot();
    this.mainContainer.setVisible(false);
    this.classSelectContainer.setVisible(true);
  }

  private hideClassSelection(): void {
    SoundSynth.playLoot();
    this.classSelectContainer.setVisible(false);
    this.mainContainer.setVisible(true);
  }

  private createClassSelectionContent(width: number, height: number): void {
    const startY = height * 0.28;
    const panelH = height * 0.65;
    const leftX = width * 0.08;
    const leftW = width * 0.38;

    // === PAINEL ESQUERDO: LISTA DE CLASSES ===
    const leftBg = this.add.graphics();
    leftBg.fillStyle(0x0a0614, 0.9);
    leftBg.fillRoundedRect(leftX, startY, leftW, panelH, 8);
    leftBg.lineStyle(1.5, 0xd4a843, 0.7);
    leftBg.strokeRoundedRect(leftX, startY, leftW, panelH, 8);
    this.classSelectContainer.add(leftBg);

    const leftTitle = this.add.text(leftX + leftW / 2, startY + 20, 'ESCOLHA SUA CLASSE', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.classSelectContainer.add(leftTitle);

    const classes = [
      PlayerClass.PALADIN,
      PlayerClass.GUARDIAN,
      PlayerClass.WARRIOR,
      PlayerClass.MAGE,
      PlayerClass.NECROMANCER,
      PlayerClass.ARCHER,
      PlayerClass.ASSASSIN,
      PlayerClass.CLERIC,
    ];

    const btnSpacing = 36;
    classes.forEach((pClass, idx) => {
      const cy = startY + 50 + idx * btnSpacing;
      const btn = this.createClassSelectButton(leftX + leftW / 2, cy, leftW - 24, 30, pClass);
      this.classButtons.push(btn);
      this.classSelectContainer.add(btn);
    });

    // === PAINEL DIREITO: DETALHES E PREVIEW DA CLASSE ===
    const rightX = leftX + leftW + width * 0.04;
    const rightW = width * 0.42;

    const rightBg = this.add.graphics();
    rightBg.fillStyle(0x0a0614, 0.9);
    rightBg.fillRoundedRect(rightX, startY, rightW, panelH, 8);
    rightBg.lineStyle(1.5, 0xd4a843, 0.7);
    rightBg.strokeRoundedRect(rightX, startY, rightW, panelH, 8);
    this.classSelectContainer.add(rightBg);

    // Botão Voltar [◀ VOLTAR]
    const backBtn = this.createButton(rightX + 60, startY + 24, 90, 28, '◀ VOLTAR', () => this.hideClassSelection(), false);
    this.classSelectContainer.add(backBtn);

    // Nome da Classe
    this.classNameText = this.add.text(rightX + rightW / 2 + 40, startY + 24, '', {
      fontFamily: 'Cinzel',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.classSelectContainer.add(this.classNameText);

    // Preview Sprite do Jogador
    const spriteBg = this.add.graphics();
    spriteBg.fillStyle(0x130a24, 0.9);
    spriteBg.fillRoundedRect(rightX + rightW / 2 - 45, startY + 54, 90, 90, 6);
    spriteBg.lineStyle(1.5, 0x5a3d8c, 0.8);
    spriteBg.strokeRoundedRect(rightX + rightW / 2 - 45, startY + 54, 90, 90, 6);
    this.classSelectContainer.add(spriteBg);

    this.previewSprite = this.add.sprite(rightX + rightW / 2, startY + 104, `${PlayerClass.PALADIN}-sheet`, 0);
    this.previewSprite.setScale(0.8).setOrigin(0.5, 0.8);
    this.classSelectContainer.add(this.previewSprite);

    // Descrição
    this.classDescText = this.add.text(rightX + 20, startY + 158, '', {
      fontFamily: 'Inter',
      fontSize: '12px',
      color: '#d0c5b0',
      wordWrap: { width: rightW - 40 },
      lineSpacing: 4,
    });
    this.classSelectContainer.add(this.classDescText);

    // Status (Barras)
    this.classStatsText = this.add.text(rightX + 20, startY + 295, '', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd700',
      lineSpacing: 4,
    });
    this.classSelectContainer.add(this.classStatsText);

    // Campo de Entrada do Nome do Jogador
    const nameLabel = this.add.text(rightX + 20, startY + panelH - 95, '⚔️ NOME DO SEU TEMPLÁRIO:', {
      fontFamily: 'Cinzel', fontSize: '10px', fontStyle: 'bold', color: '#ffd700'
    });
    this.classSelectContainer.add(nameLabel);

    const nameBg = this.add.graphics();
    nameBg.fillStyle(0x0e0818, 0.95);
    nameBg.fillRoundedRect(rightX + 20, startY + panelH - 80, rightW - 40, 28, 4);
    nameBg.lineStyle(1.5, 0xd4af37, 0.9);
    nameBg.strokeRoundedRect(rightX + 20, startY + panelH - 80, rightW - 40, 28, 4);
    this.classSelectContainer.add(nameBg);

    this.nameInputText = this.add.text(rightX + 30, startY + panelH - 66, 'Sir Lancelot', {
      fontFamily: 'MedievalSharp', fontSize: '13px', color: '#ffffff'
    }).setOrigin(0, 0.5);
    this.classSelectContainer.add(this.nameInputText);

    // Permite digitação interativa do nome
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.classSelectContainer.visible) return;
      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key.length === 1 && this.playerName.length < 16 && /[a-zA-Z0-9 Á-ú]/.test(event.key)) {
        this.playerName += event.key;
      }
      this.nameInputText.setText(this.playerName || 'Templário');
    });

    // Botão Iniciar Aventura [⚔️ COMEÇAR JOGO]
    const startBtn = this.createButton(
      rightX + rightW / 2,
      startY + panelH - 26,
      rightW - 36,
      38,
      '⚔️ COMEÇAR JOGO',
      () => this.onStartGame(),
      true
    );
    this.classSelectContainer.add(startBtn);

    this.selectClass(PlayerClass.PALADIN);
  }

  private createClassSelectButton(x: number, y: number, w: number, h: number, pClass: PlayerClass): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const info = (this.classData as any)[pClass];

    const bg = this.add.graphics();
    const label = this.add.text(0, 0, `${info.icon}  ${info.name.toUpperCase()}`, {
      fontFamily: 'Cinzel',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#d4a843',
    }).setOrigin(0.5);

    container.add([bg, label]);

    const hit = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    container.add(hit);

    const updateVisual = (isSelected: boolean) => {
      bg.clear();
      if (isSelected) {
        bg.fillStyle(0x3a2010, 0.95);
        bg.lineStyle(1.5, 0xffd700, 1);
        label.setColor('#ffffff');
      } else {
        bg.fillStyle(0x130822, 0.7);
        bg.lineStyle(1, 0x3a225e, 0.6);
        label.setColor('#d4a843');
      }
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    };

    hit.on('pointerdown', () => {
      SoundSynth.playLoot();
      this.selectClass(pClass);
    });

    container.setData('updateVisual', updateVisual);
    container.setData('pClass', pClass);

    return container;
  }

  private selectClass(pClass: PlayerClass): void {
    this.selectedClass = pClass;
    
    this.classButtons.forEach((btn) => {
      const updateFn = btn.getData('updateVisual');
      if (updateFn) {
        updateFn(btn.getData('pClass') === pClass);
      }
    });

    const info = (this.classData as any)[pClass];
    if (this.classNameText) this.classNameText.setText(`${info.icon} ${info.name.toUpperCase()}`);
    if (this.classDescText) {
      this.classDescText.setText(
        `Função: ${info.role}\n` +
        `Atributos: ${info.primaryStat}\n` +
        `Assinatura: ${info.signatureSkill}\n\n` +
        `${info.desc}`
      );
    }
    if (this.classStatsText) this.classStatsText.setText(info.stats);

    if (this.previewSprite) {
      const sheetKey = `${pClass}-sheet`;
      if (this.textures.exists(sheetKey)) {
        this.previewSprite.setTexture(sheetKey, 0);
        this.previewSprite.setScale(1.35);
        const animKey = `${pClass}-walk-down`;
        if (this.anims.exists(animKey)) {
          this.previewSprite.play(animKey, true);
        }
      }
    }
  }

  private createButton(
    x: number, y: number, btnWidth: number, btnHeight: number, text: string,
    callback: () => void, primary: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const drawNormal = () => {
      bg.clear();
      bg.fillStyle(primary ? 0x180d28 : 0x0e0818, 0.96);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, primary ? 0xffd700 : 0xd4af37, 0.95);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(1, 0x5a3e10, 0.7);
      bg.strokeRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, btnHeight - 6, 6);

      const bCorners = [
        [-btnWidth / 2 + 6, -btnHeight / 2 + 6], [btnWidth / 2 - 6, -btnHeight / 2 + 6],
        [-btnWidth / 2 + 6, btnHeight / 2 - 6], [btnWidth / 2 - 6, btnHeight / 2 - 6]
      ];
      bCorners.forEach(([cx, cy]) => {
        bg.fillStyle(0xffd700, 1);
        bg.fillCircle(cx, cy, 2);
      });
    };

    const drawHover = () => {
      bg.clear();
      bg.fillStyle(primary ? 0x2d1848 : 0x180c28, 0.98);
      bg.lineStyle(2.5, 0x00ffcc, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(1, 0x00ffcc, 0.5);
      bg.strokeRoundedRect(-btnWidth / 2 + 3, -btnHeight / 2 + 3, btnWidth - 6, btnHeight - 6, 6);
    };

    drawNormal();

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Cinzel',
      fontSize: primary ? '15px' : '13px',
      fontStyle: 'bold',
      color: primary ? '#ffd700' : '#d4a843',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    container.add([bg, label]);

    const hitZone = this.add.zone(0, 0, btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillGradientStyle(0x5a381a, 0x5a381a, 0x321a0a, 0x321a0a, 0.95);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      bg.lineStyle(2, 0xffd700, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      label.setColor('#ffffff');
      container.setScale(1.03);
    });

    hitZone.on('pointerout', () => {
      drawNormal();
      label.setColor(primary ? '#ffd700' : '#d4a843');
      container.setScale(1);
    });

    hitZone.on('pointerdown', () => container.setScale(0.97));
    hitZone.on('pointerup', () => {
      container.setScale(1.03);
      callback();
    });

    return container;
  }

  private refreshContinueButton(): void {
    const hasSave = SaveManager.hasSave();
    if (this.continueBtnContainer) {
      this.continueBtnContainer.setVisible(hasSave);
    }
  }

  private onContinue(): void {
    SoundSynth.playLoot();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const save = SaveManager.load();
      this.scene.start('WorldScene', {
        playerClass: save?.playerClass ?? PlayerClass.PALADIN,
        fromSave: true,
      });
      this.scene.launch('UIScene');
    });
  }

  private onStartGame(): void {
    SoundSynth.playLoot();
    SaveManager.clear();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { isNewGame: true, playerClass: this.selectedClass, name: this.playerName || 'Templário' });
      this.scene.launch('UIScene');
    });
  }

  private async onGoogleLogin(): Promise<void> {
    const user = await FirebaseService.loginWithGoogle();
    if (user) {
      this.refreshContinueButton();
    }
  }

  private async onLogout(): Promise<void> {
    await FirebaseService.logout();
    this.refreshContinueButton();
  }
}

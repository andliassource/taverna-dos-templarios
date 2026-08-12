import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { SoundSynth } from '../utils/SoundSynth';
import { FirebaseService } from '../network/FirebaseService';
import { SaveManager } from '../systems/SaveManager';

/**
 * MainMenuScene — Menu principal com visual premium.
 * Background atmosférico da taverna, partículas e animações.
 */
export class MainMenuScene extends Phaser.Scene {
  private selectedClass: PlayerClass = PlayerClass.PALADIN;
  private menuContainer!: Phaser.GameObjects.Container;

  private classButtons: Phaser.GameObjects.Container[] = [];
  private classDescText!: Phaser.GameObjects.Text;
  private classStatsText!: Phaser.GameObjects.Text;
  private classNameText!: Phaser.GameObjects.Text;
  private previewSprite!: Phaser.GameObjects.Sprite;

  private classData = {
    [PlayerClass.PALADIN]: {
      name: 'Paladino',
      icon: '🛡️',
      desc: 'Guerreiro sagrado com alta defesa e HP. Ataca com golpes corpo a corpo imbuídos de Fé.',
      stats: 'HP:  ████████ (Alto)\nMP:  ████ (Baixo)\nATK: ██████ (Médio)\nDEF: ██████████ (Máximo)'
    },
    [PlayerClass.GUARDIAN]: {
      name: 'Guardião',
      icon: '🛡️',
      desc: 'Baluarte defensivo inabalável. Capaz de absorver imensas quantidades de dano e provocar inimigos.',
      stats: 'HP:  ██████████ (Máximo)\nMP:  ████ (Baixo)\nATK: ████ (Baixo)\nDEF: ██████████ (Máximo)'
    },
    [PlayerClass.WARRIOR]: {
      name: 'Guerreiro',
      icon: '⚔️',
      desc: 'Mestre no combate de proximidade com armas pesadas. Causa dano físico massivo em área.',
      stats: 'HP:  ████████ (Alto)\nMP:  ████ (Baixo)\nATK: ██████████ (Máximo)\nDEF: ██████ (Médio)'
    },
    [PlayerClass.MAGE]: {
      name: 'Mago',
      icon: '🔮',
      desc: 'Mestre das artes arcanas. Dispara projéteis mágicos de longo alcance que consomem Mana.',
      stats: 'HP:  ████ (Baixo)\nMP:  ██████████ (Máximo)\nATK: ████████ (Alto)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.NECROMANCER]: {
      name: 'Necromante',
      icon: '💀',
      desc: 'Invocador das artes sombrias. Evoca esqueletos e explode cadáveres de monstros.',
      stats: 'HP:  ██████ (Médio)\nMP:  ██████████ (Máximo)\nATK: ████████ (Alto)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.ARCHER]: {
      name: 'Arqueiro',
      icon: '🏹',
      desc: 'Atirador ágil da floresta. Dispara flechas rápidas e precisas de longa distância.',
      stats: 'HP:  ██████ (Médio)\nMP:  ████ (Baixo)\nATK: ████████ (Alto)\nDEF: ██████ (Médio)'
    },
    [PlayerClass.ASSASSIN]: {
      name: 'Assassino',
      icon: '🗡️',
      desc: 'Lutador furtivo e mortal. Avança rapidamente sobre os inimigos causando dano crítico massivo.',
      stats: 'HP:  ██████ (Médio)\nMP:  ████ (Baixo)\nATK: ██████████ (Máximo)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.CLERIC]: {
      name: 'Clérigo',
      icon: '💚',
      desc: 'Servo divino capaz de regenerar vida e purificar hordas inimigas com luz sagrada.',
      stats: 'HP:  ████████ (Alto)\nMP:  ████████ (Alto)\nATK: ██████ (Médio)\nDEF: ██████ (Médio)'
    },
    [PlayerClass.DARK_KNIGHT]: {
      name: 'Cavaleiro Negro',
      icon: '🛡️',
      desc: 'Guerreiro das sombras que absorve a essência vital dos inimigos em cada golpe.',
      stats: 'HP:  ████████ (Alto)\nMP:  ██████ (Médio)\nATK: ████████ (Alto)\nDEF: ████████ (Alto)'
    },
    [PlayerClass.ELEMENTALIST]: {
      name: 'Elementalista',
      icon: '🔮',
      desc: 'Mestre da natureza e elementos. Invoca tempestades de fogo, raio e gelo congelante.',
      stats: 'HP:  ████ (Baixo)\nMP:  ██████████ (Máximo)\nATK: ██████████ (Máximo)\nDEF: ████ (Baixo)'
    },
    [PlayerClass.BARD]: {
      name: 'Bardo',
      icon: '💚',
      desc: 'Poeta de batalha cujos canções fornecem bônus de dano, velocidade e cura para o grupo.',
      stats: 'HP:  ██████ (Médio)\nMP:  ████████ (Alto)\nATK: ██████ (Médio)\nDEF: ██████ (Médio)'
    },
    [PlayerClass.DRUID]: {
      name: 'Druida',
      icon: '💚',
      desc: 'Guardião da floresta capaz de se transformar em urso gigante e invocar vinhas sagradas.',
      stats: 'HP:  ██████████ (Máximo)\nMP:  ██████ (Médio)\nATK: ██████ (Médio)\nDEF: ████████ (Alto)'
    }
  };

  private continueBtn!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    SoundSynth.playBGM('menu');
    const { width, height } = this.cameras.main;

    // Background da taverna (imagem gerada por IA)
    const bg = this.add.image(width / 2, height / 2, 'menu-bg');
    bg.setDisplaySize(width, height);

    // Overlay escuro para legibilidade
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0612, 0.45);
    overlay.fillRect(0, 0, width, height);

    // Vinheta
    const vignette = this.add.image(width / 2, height / 2, 'vignette');
    vignette.setDisplaySize(width, height);
    vignette.setAlpha(0.6);

    // Partículas douradas flutuantes (poeira no ar)
    this.add.particles(0, 0, 'particle-gold', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 5000,
      speed: { min: 5, max: 20 },
      angle: { min: 250, max: 290 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.7, end: 0 },
      frequency: 150,
      blendMode: 'ADD',
    });

    // Fireflies (vaga-lumes)
    this.add.particles(0, 0, 'particle-firefly', {
      x: { min: 0, max: width },
      y: { min: height * 0.3, max: height },
      lifespan: 3000,
      speed: { min: 10, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 1.5, ease: 'Sine.easeInOut' },
      alpha: { start: 0, end: 0.8, ease: 'Sine.easeInOut' },
      frequency: 800,
      blendMode: 'ADD',
    });

    // Container do menu
    this.menuContainer = this.add.container(width / 2, 0);

    // Título com efeito glow
    this.createTitle(height);

    // Subtítulo
    this.createSubtitle(height);

    // Botões do menu
    this.createMenuButtons(height);

    // Versão
    this.add.text(width - 10, height - 10, 'v0.1.0-alpha', {
      fontFamily: 'Inter',
      fontSize: '12px',
      color: 'rgba(212, 168, 67, 0.5)',
    }).setOrigin(1, 1);

    // Decoração: espadas cruzadas (em cima do título)
    this.createSwordDecoration(width, height);

    // Painel de seleção de classes
    this.createClassSelectionPanel(width, height);

    // Fade in
    this.cameras.main.fadeIn(800);

    // Verifica se há save para mostrar botão Continuar
    this.refreshContinueButton();

    // Escuta mudanças de auth para atualizar o botão de login
    FirebaseService.onAuthChange(() => this.refreshContinueButton());
  }

  private refreshContinueButton(): void {
    const hasSave = SaveManager.hasSave();
    if (this.continueBtn) {
      this.continueBtn.setVisible(hasSave);
    }
  }

  private createTitle(height: number): void {
    // Sombra do título
    const titleShadow = this.add.text(0, height * 0.16 + 3, 'Taverna dos Templários', {
      fontFamily: 'Cinzel',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0.5);
    this.menuContainer.add(titleShadow);

    // Título principal
    const title = this.add.text(0, height * 0.15, 'Taverna dos Templários', {
      fontFamily: 'Cinzel',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#8b6914',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ffd700',
        blur: 30,
        fill: true,
      },
    }).setOrigin(0.5);
    this.menuContainer.add(title);

    // Animação pulsante
    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Linha decorativa abaixo do título
    const lineY = height * 0.22;
    const lineGraphics = this.add.graphics();
    lineGraphics.lineStyle(2, 0xd4a843, 0.6);
    lineGraphics.lineBetween(-120, 0, 120, 0);
    lineGraphics.fillStyle(0xd4a843, 0.8);
    lineGraphics.fillCircle(0, 0, 3);
    lineGraphics.fillCircle(-120, 0, 2);
    lineGraphics.fillCircle(120, 0, 2);
    lineGraphics.setPosition(0, lineY);
    this.menuContainer.add(lineGraphics);
  }

  private createSubtitle(height: number): void {
    const subtitle = this.add.text(0, height * 0.26, 'A Ordem Aguarda Seu Retorno', {
      fontFamily: 'MedievalSharp',
      fontSize: '18px',
      color: '#d4a843',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.menuContainer.add(subtitle);

    this.tweens.add({
      targets: subtitle,
      alpha: 0.4,
      duration: 2500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createSwordDecoration(_width: number, height: number): void {
    const decor = this.add.graphics();
    const dy = height * 0.10;

    // Espada esquerda
    decor.fillStyle(0xb0b8c8, 1);
    decor.fillRect(-65, dy, 2, 25);
    decor.fillStyle(0xd4a843, 1);
    decor.fillRect(-69, dy + 20, 10, 3);
    decor.fillStyle(0x5a3a1e, 1);
    decor.fillRect(-65, dy + 23, 2, 8);

    // Espada direita (espelhada)
    decor.fillStyle(0xb0b8c8, 1);
    decor.fillRect(63, dy, 2, 25);
    decor.fillStyle(0xd4a843, 1);
    decor.fillRect(59, dy + 20, 10, 3);
    decor.fillStyle(0x5a3a1e, 1);
    decor.fillRect(63, dy + 23, 2, 8);

    this.menuContainer.add(decor);
  }

  private createMenuButtons(height: number): void {
    const hasSave = SaveManager.hasSave();
    const user = FirebaseService.currentUser;

    const buttonConfigs = [
      ...(hasSave ? [{ text: '▶️  CONTINUAR', callback: () => this.onContinue(), primary: true }] : []),
      { text: '⚔️  NOVA AVENTURA', callback: () => this.onNewGame(), primary: !hasSave },
      {
        text: user ? `👤  ${user.displayName ?? 'Conta Google'}` : '🔑  ENTRAR COM GOOGLE',
        callback: () => user ? this.onLogout() : this.onGoogleLogin(),
        primary: false,
      },
      { text: '⚙️  CONFIGURAÇÕES', callback: () => this.onSettings(), primary: false },
    ];

    const startY = height * 0.42;
    const spacing = 60;

    buttonConfigs.forEach((config, index) => {
      const btn = this.createMenuButton(
        0,
        startY + index * spacing,
        config.text,
        config.callback,
        config.primary,
      );
      if (config.text.startsWith('▶️')) this.continueBtn = btn;
      this.menuContainer.add(btn);
    });
  }

  private createMenuButton(
    x: number, y: number, text: string,
    callback: () => void, primary: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const btnWidth = 300;
    const btnHeight = 46;

    const bg = this.add.graphics();
    const drawNormal = () => {
      bg.clear();
      if (primary) {
        bg.fillGradientStyle(0x3a2010, 0x3a2010, 0x1a0a05, 0x1a0a05, 0.9);
      } else {
        bg.fillGradientStyle(0x1a0a2e, 0x1a0a2e, 0x0d0518, 0x0d0518, 0.85);
      }
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      bg.lineStyle(primary ? 2 : 1, primary ? 0xffd700 : 0xd4a843, primary ? 1 : 0.6);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    };

    drawNormal();

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Cinzel',
      fontSize: primary ? '17px' : '15px',
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
      bg.fillGradientStyle(0x4a3020, 0x4a3020, 0x2a1510, 0x2a1510, 0.95);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      bg.lineStyle(2, 0xffd700, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
      label.setColor('#ffffff');
      container.setScale(1.04);
    });

    hitZone.on('pointerout', () => {
      drawNormal();
      label.setColor(primary ? '#ffd700' : '#d4a843');
      container.setScale(1);
    });

    hitZone.on('pointerdown', () => container.setScale(0.96));
    hitZone.on('pointerup', () => {
      container.setScale(1.04);
      callback();
    });

    return container;
  }

  private onContinue(): void {
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const save = SaveManager.load();
      this.scene.start('WorldScene', {
        playerClass: save?.playerClass ?? PlayerClass.PALADIN,
        fromSave: true,
      });
      this.scene.launch('UIScene');
    });
  }

  private onNewGame(): void {
    SaveManager.clear();
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { isNewGame: true, playerClass: this.selectedClass });
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

  private createClassSelectionPanel(width: number, height: number): void {
    const startX = 60;
    const startY = height * 0.38;
    const panelWidth = 240;
    const panelHeight = 330;

    // Fundo do painel de seleção
    const selectBg = this.add.graphics();
    selectBg.fillStyle(0x0a0612, 0.75);
    selectBg.fillRoundedRect(startX, startY, panelWidth, panelHeight, 8);
    selectBg.lineStyle(1, 0xd4a843, 0.5);
    selectBg.strokeRoundedRect(startX, startY, panelWidth, panelHeight, 8);

    // Título do painel de seleção
    this.add.text(startX + panelWidth / 2, startY + 16, 'CLASSES DISPONÍVEIS', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

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
    const spacing = 34;

    classes.forEach((pClass, index) => {
      const cy = startY + 44 + index * spacing;
      const btn = this.createClassButton(startX + panelWidth / 2, cy, pClass);
      this.classButtons.push(btn);
    });

    // Fundo do painel de descrição (Lado Direito)
    const descX = width - panelWidth - startX;
    const descBg = this.add.graphics();
    descBg.fillStyle(0x0a0612, 0.75);
    descBg.fillRoundedRect(descX, startY, panelWidth, panelHeight, 8);
    descBg.lineStyle(1, 0xd4a843, 0.5);
    descBg.strokeRoundedRect(descX, startY, panelWidth, panelHeight, 8);

    // Componentes de texto da descrição
    this.classNameText = this.add.text(descX + panelWidth / 2, startY + 18, '', {
      fontFamily: 'Cinzel',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.classDescText = this.add.text(descX + 16, startY + 46, '', {
      fontFamily: 'Inter',
      fontSize: '11px',
      color: '#e0d5c0',
      wordWrap: { width: panelWidth - 32 },
      lineSpacing: 4,
    });

    this.classStatsText = this.add.text(descX + 16, startY + 180, '', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd700',
      lineSpacing: 6,
    });

    // Preview do sprite 16-bit animado no centro
    this.previewSprite = this.add.sprite(descX + panelWidth / 2, startY + 130, `${PlayerClass.PALADIN}-sheet`, 0);
    this.previewSprite.setScale(4.5);
    this.previewSprite.setDepth(20);

    this.selectClass(PlayerClass.PALADIN);
  }

  private createClassButton(x: number, y: number, pClass: PlayerClass): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 210;
    const h = 28;
    const info = (this.classData as any)[pClass];

    const bg = this.add.graphics();
    const label = this.add.text(0, 0, `${info.icon}  ${info.name.toUpperCase()}`, {
      fontFamily: 'Cinzel',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#d4a843',
    }).setOrigin(0.5);

    container.add([bg, label]);

    const hit = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    container.add(hit);

    const updateVisual = (isSelected: boolean) => {
      bg.clear();
      if (isSelected) {
        bg.fillStyle(0x3a2010, 0.85);
        bg.lineStyle(1.5, 0xffd700, 1);
        label.setColor('#ffffff');
      } else {
        bg.fillStyle(0x1a0a2e, 0.6);
        bg.lineStyle(1, 0x4a2d6e, 0.5);
        label.setColor('#d4a843');
      }
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    };

    hit.on('pointerdown', () => {
      this.selectClass(pClass);
    });

    container.setData('updateVisual', updateVisual);
    container.setData('pClass', pClass);

    return container;
  }

  private selectClass(pClass: PlayerClass): void {
    this.selectedClass = pClass;
    
    // Atualiza botões
    this.classButtons.forEach((btn) => {
      const updateFn = btn.getData('updateVisual');
      if (updateFn) {
        updateFn(btn.getData('pClass') === pClass);
      }
    });

    // Atualiza descrição
    const info = (this.classData as any)[pClass];
    if (this.classNameText) this.classNameText.setText(`${info.icon} ${info.name.toUpperCase()}`);
    if (this.classDescText) this.classDescText.setText(info.desc);
    if (this.classStatsText) this.classStatsText.setText(info.stats);

    if (this.previewSprite) {
      this.previewSprite.setTexture(`${pClass}-sheet`, 0);
      this.previewSprite.play(`${pClass}-idle-down`, true);
    }
  }

  private onSettings(): void {
    console.log('[MainMenuScene] Configurações');
  }
}

import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';

/**
 * MainMenuScene — Menu principal do jogo.
 * Exibe:
 * - Título animado
 * - Botão Jogar / Continuar
 * - Seleção de Classe (na primeira vez)
 * - Login via Google
 * - Configurações
 */
export class MainMenuScene extends Phaser.Scene {
  private selectedClass: PlayerClass = PlayerClass.PALADIN;
  private menuContainer!: Phaser.GameObjects.Container;
  private classSelectContainer!: Phaser.GameObjects.Container;
  private isShowingClassSelect = false;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background com gradiente
    this.createBackground(width, height);

    // Partículas ambientais (poeira mágica dourada)
    this.createParticles(width, height);

    // Container do menu
    this.menuContainer = this.add.container(width / 2, 0);

    // Título
    this.createTitle(height);

    // Subtítulo
    this.createSubtitle(height);

    // Botões do menu
    this.createMenuButtons(height);

    // Versão
    this.add.text(width - 10, height - 10, 'v0.1.0-alpha', {
      fontFamily: 'Inter',
      fontSize: '12px',
      color: '#666',
    }).setOrigin(1, 1);

    // Container de seleção de classe (inicialmente oculto)
    this.classSelectContainer = this.add.container(width / 2, height / 2);
    this.classSelectContainer.setVisible(false);

    // Fade in
    this.cameras.main.fadeIn(500);

    console.log('[MainMenuScene] Menu principal criado');
  }

  private createBackground(width: number, height: number): void {
    // Gradiente de fundo
    const bg = this.add.graphics();

    // Fundo escuro base
    bg.fillStyle(0x0a0612, 1);
    bg.fillRect(0, 0, width, height);

    // Vinheta
    bg.fillStyle(0x1a0a2e, 0.5);
    bg.fillRect(0, 0, width, height);

    // Efeito de pedra/textura (linhas sutis)
    bg.lineStyle(1, 0x2d1b4e, 0.3);
    for (let y = 0; y < height; y += 20) {
      bg.lineBetween(0, y, width, y);
    }
    for (let x = 0; x < width; x += 20) {
      bg.lineBetween(x, 0, x, height);
    }

    // Decoração: escudo templário central (gráfico simples)
    this.drawTemplarShield(width / 2, height / 2 - 30, 120);
  }

  private drawTemplarShield(x: number, y: number, size: number): void {
    const g = this.add.graphics();
    g.setAlpha(0.08);

    // Escudo (forma de escudo heráldico)
    g.fillStyle(0xd4a843);
    g.beginPath();
    g.moveTo(x, y - size);
    g.lineTo(x + size * 0.8, y - size * 0.4);
    g.lineTo(x + size * 0.8, y + size * 0.2);
    g.lineTo(x, y + size);
    g.lineTo(x - size * 0.8, y + size * 0.2);
    g.lineTo(x - size * 0.8, y - size * 0.4);
    g.closePath();
    g.fillPath();

    // Cruz templária
    g.fillStyle(0x8b0000);
    const crossW = size * 0.15;
    const crossH = size * 1.2;
    g.fillRect(x - crossW / 2, y - crossH / 2, crossW, crossH);
    g.fillRect(x - crossH * 0.35, y - crossW / 2, crossH * 0.7, crossW);
  }

  private createParticles(width: number, height: number): void {
    // Cria textura de partícula
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xd4a843, 1);
    particleGraphics.fillCircle(2, 2, 2);
    particleGraphics.generateTexture('particle-gold', 4, 4);
    particleGraphics.destroy();

    this.particles = this.add.particles(0, 0, 'particle-gold', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 4000,
      speed: { min: 10, max: 30 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 200,
      blendMode: 'ADD',
    });
  }

  private createTitle(height: number): void {
    const title = this.add.text(0, height * 0.15, '⚔️ Taverna dos Templários', {
      fontFamily: 'Cinzel',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: '#d4a843',
        blur: 20,
        fill: true,
        stroke: true,
      },
    }).setOrigin(0.5);

    this.menuContainer.add(title);

    // Animação pulsante sutil
    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createSubtitle(height: number): void {
    const subtitle = this.add.text(0, height * 0.24, 'A Ordem Aguarda Seu Retorno', {
      fontFamily: 'MedievalSharp',
      fontSize: '18px',
      color: '#b8860b',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.menuContainer.add(subtitle);

    // Fade in/out sutil
    this.tweens.add({
      targets: subtitle,
      alpha: 0.5,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createMenuButtons(height: number): void {
    const buttonConfigs = [
      { text: '⚔️  NOVA AVENTURA', callback: () => this.onNewGame() },
      { text: '🔑  ENTRAR COM GOOGLE', callback: () => this.onGoogleLogin() },
      { text: '⚙️  CONFIGURAÇÕES', callback: () => this.onSettings() },
    ];

    const startY = height * 0.45;
    const spacing = 65;

    buttonConfigs.forEach((config, index) => {
      const btn = this.createMenuButton(
        0,
        startY + index * spacing,
        config.text,
        config.callback
      );
      this.menuContainer.add(btn);
    });
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const btnWidth = 320;
    const btnHeight = 50;

    // Fundo do botão
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a2e, 0.9);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(2, 0xd4a843, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);

    // Texto
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Cinzel',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    container.add([bg, label]);

    // Zona interativa
    const hitZone = this.add.zone(0, 0, btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    container.add(hitZone);

    // Hover effects
    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2d1b4e, 0.95);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0xffd700, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      label.setColor('#ffffff');
      container.setScale(1.05);
    });

    hitZone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a0a2e, 0.9);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0xd4a843, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      label.setColor('#ffd700');
      container.setScale(1);
    });

    hitZone.on('pointerdown', () => {
      container.setScale(0.95);
    });

    hitZone.on('pointerup', () => {
      container.setScale(1.05);
      callback();
    });

    return container;
  }

  private onNewGame(): void {
    console.log('[MainMenuScene] Nova aventura iniciada');
    // Transição com fade
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { isNewGame: true, playerClass: this.selectedClass });
      this.scene.launch('UIScene');
    });
  }

  private onGoogleLogin(): void {
    console.log('[MainMenuScene] Google login solicitado');
    // TODO: Integrar Firebase Auth
    // Por enquanto, simula login
    const loginBtn = document.createElement('div');
    loginBtn.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(26, 10, 46, 0.95); border: 2px solid #d4a843;
      border-radius: 16px; padding: 32px; z-index: 200; text-align: center;
      font-family: 'Cinzel', serif; color: #ffd700;
    `;
    loginBtn.innerHTML = `
      <h2 style="margin-bottom: 16px;">🔑 Login com Google</h2>
      <p style="color: #b8860b; margin-bottom: 24px; font-family: Inter, sans-serif; font-size: 14px;">
        Firebase Auth será integrado na próxima fase
      </p>
      <button onclick="this.parentElement.remove()" style="
        padding: 10px 24px; font-family: Cinzel; font-weight: bold;
        background: linear-gradient(180deg, #d4a843 0%, #8b6914 100%);
        border: none; border-radius: 8px; color: #1a0a2e; cursor: pointer;
        font-size: 16px;
      ">Fechar</button>
    `;
    document.body.appendChild(loginBtn);
  }

  private onSettings(): void {
    console.log('[MainMenuScene] Configurações');
    // TODO: Implementar tela de configurações
  }
}

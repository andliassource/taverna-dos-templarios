import Phaser from 'phaser';

export class SettingsModal extends Phaser.GameObjects.Container {
  private isVisibleModal = false;

  private bgmVolume = 0.8;
  private sfxVolume = 1.0;
  private particleQuality = 'HIGH';

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.setDepth(1000);
    this.setScrollFactor(0);
    this.setVisible(false);
    scene.add.existing(this);

    this.createModal();
  }

  private createModal(): void {
    const { width: scrW, height: scrH } = this.scene.scale;
    const modalW = 480;
    const modalH = 420;
    const modalX = (scrW - modalW) / 2;
    const modalY = (scrH - modalH) / 2;

    // Overlay translúcido de fundo
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, scrW, scrH);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, scrW, scrH), Phaser.Geom.Rectangle.Contains);
    this.add(overlay);

    // Painel Principal em 9-Slice de Couro Gótico
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x120c1f, 0.95);
    panel.fillRoundedRect(modalX, modalY, modalW, modalH, 12);

    panel.lineStyle(3, 0xd4af37, 1);
    panel.strokeRoundedRect(modalX, modalY, modalW, modalH, 12);
    panel.lineStyle(1, 0xffe899, 0.6);
    panel.strokeRoundedRect(modalX + 3, modalY + 3, modalW - 6, modalH - 6, 10);
    this.add(panel);

    // Título do Modal
    const titleText = this.scene.add.text(scrW / 2, modalY + 28, '⚙️ CONFIGURAÇÕES DO JOGO', {
      fontFamily: 'Cinzel',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.add(titleText);

    // 1. Áudio: Música (BGM)
    const bgmLabel = this.scene.add.text(modalX + 40, modalY + 80, '🎵 Música de Fundo (BGM)', {
      fontFamily: 'MedievalSharp',
      fontSize: '15px',
      color: '#ffffff',
    });
    this.add(bgmLabel);

    const bgmBtn = this.scene.add.text(modalX + 360, modalY + 78, '80%', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#00ff88',
      backgroundColor: '#1a2638',
      padding: { x: 12, y: 4 },
    }).setInteractive({ useHandCursor: true });

    bgmBtn.on('pointerdown', () => {
      this.bgmVolume = this.bgmVolume >= 1.0 ? 0 : this.bgmVolume + 0.2;
      bgmBtn.setText(`${Math.round(this.bgmVolume * 100)}%`);
      this.scene.sound.volume = this.bgmVolume;
    });
    this.add(bgmBtn);

    // 2. Áudio: Efeitos Sonoros (SFX)
    const sfxLabel = this.scene.add.text(modalX + 40, modalY + 130, '🔊 Efeitos Sonoros (SFX)', {
      fontFamily: 'MedievalSharp',
      fontSize: '15px',
      color: '#ffffff',
    });
    this.add(sfxLabel);

    const sfxBtn = this.scene.add.text(modalX + 360, modalY + 128, '100%', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#00ff88',
      backgroundColor: '#1a2638',
      padding: { x: 12, y: 4 },
    }).setInteractive({ useHandCursor: true });

    sfxBtn.on('pointerdown', () => {
      this.sfxVolume = this.sfxVolume >= 1.0 ? 0 : this.sfxVolume + 0.25;
      sfxBtn.setText(`${Math.round(this.sfxVolume * 100)}%`);
    });
    this.add(sfxBtn);

    // 3. Gráficos: Partículas
    const gfxLabel = this.scene.add.text(modalX + 40, modalY + 180, '✨ Qualidade de Partículas', {
      fontFamily: 'MedievalSharp',
      fontSize: '15px',
      color: '#ffffff',
    });
    this.add(gfxLabel);

    const gfxBtn = this.scene.add.text(modalX + 340, modalY + 178, 'ALTA (60fps)', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd700',
      backgroundColor: '#2b1b10',
      padding: { x: 10, y: 4 },
    }).setInteractive({ useHandCursor: true });

    gfxBtn.on('pointerdown', () => {
      this.particleQuality = this.particleQuality === 'HIGH' ? 'LOW' : 'HIGH';
      gfxBtn.setText(this.particleQuality === 'HIGH' ? 'ALTA (60fps)' : 'ECONÔMICA');
    });
    this.add(gfxBtn);

    // 4. Tela Cheia (Fullscreen)
    const fsLabel = this.scene.add.text(modalX + 40, modalY + 230, '🖥️ Modo Tela Cheia', {
      fontFamily: 'MedievalSharp',
      fontSize: '15px',
      color: '#ffffff',
    });
    this.add(fsLabel);

    const fsBtn = this.scene.add.text(modalX + 340, modalY + 228, 'ATIVAR [F11]', {
      fontFamily: 'Cinzel',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#3a2010',
      padding: { x: 10, y: 4 },
    }).setInteractive({ useHandCursor: true });

    fsBtn.on('pointerdown', () => {
      if (this.scene.scale.isFullscreen) {
        this.scene.scale.stopFullscreen();
        fsBtn.setText('ATIVAR [F11]');
      } else {
        this.scene.scale.startFullscreen();
        fsBtn.setText('SAIR TELA CHEIA');
      }
    });
    this.add(fsBtn);

    // Dicas de Controles
    const helpBox = this.scene.add.text(
      scrW / 2,
      modalY + 295,
      '⌨️ WASD/Setas = Mover | Espaço = Atacar | Shift = Esquiva | 1-5 = Habilidades\nI = Inventário | Q = Missões | T = Talentos | K = Forja | ESC = Fechar',
      {
        fontFamily: 'MedievalSharp',
        fontSize: '11px',
        color: '#aaaaaa',
        align: 'center',
        lineSpacing: 4,
      }
    ).setOrigin(0.5);
    this.add(helpBox);

    // Botão Fechar
    const closeBtn = this.scene.add.text(modalX + modalW / 2, modalY + modalH - 35, 'FECHAR', {
      fontFamily: 'Cinzel',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#881111',
      padding: { x: 26, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#ffd700' }));
    closeBtn.on('pointerout', () => closeBtn.setStyle({ color: '#ffffff' }));
    closeBtn.on('pointerdown', () => this.toggle());
    this.add(closeBtn);
  }

  public toggle(): void {
    this.isVisibleModal = !this.isVisibleModal;
    this.setVisible(this.isVisibleModal);

    if (this.isVisibleModal) {
      this.setScale(0.85);
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut',
      });
    }
  }

  public isOpen(): boolean {
    return this.isVisibleModal;
  }
}

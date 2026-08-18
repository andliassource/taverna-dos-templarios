import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { SoundSynth } from '../../utils/SoundSynth';

export class SettingsModal extends Phaser.GameObjects.Container {
  private isBGMEnabled = true;
  private isSFXEnabled = true;
  private isShakeEnabled = true;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.setDepth(210);

    const bg = scene.add.graphics();
    bg.fillStyle(UI_THEME.colors.bgDark, 0.96);
    bg.fillRoundedRect(-250, -200, 500, 400, 10);
    bg.lineStyle(2, UI_THEME.colors.borderGold, 0.95);
    bg.strokeRoundedRect(-250, -200, 500, 400, 10);
    bg.lineStyle(1, UI_THEME.colors.borderDarkGold, 0.7);
    bg.strokeRoundedRect(-246, -196, 492, 392, 8);
    this.add(bg);

    const title = scene.add.text(0, -170, '⚙️ CONFIGURAÇÕES DO JOGO', {
      fontFamily: UI_THEME.fonts.title, fontSize: '18px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(title);

    // Seção Áudio
    const audioLabel = scene.add.text(-220, -130, '🔊 ÁUDIO & SOM', {
      fontFamily: UI_THEME.fonts.title, fontSize: '13px', fontStyle: 'bold', color: UI_THEME.colors.textBlue,
    });
    this.add(audioLabel);

    const bgmBtn = scene.add.text(-200, -100, `Música (BGM): ${this.isBGMEnabled ? '🔊 LIGADO' : '🔈 MUTE'}`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: UI_THEME.colors.textWhite,
      backgroundColor: '#2a1a3a', padding: { x: 10, y: 6 }
    }).setInteractive({ useHandCursor: true });
    bgmBtn.on('pointerdown', () => {
      this.isBGMEnabled = !this.isBGMEnabled;
      bgmBtn.setText(`Música (BGM): ${this.isBGMEnabled ? '🔊 LIGADO' : '🔈 MUTE'}`);
      SoundSynth.playClick();
    });
    this.add(bgmBtn);

    const sfxBtn = scene.add.text(20, -100, `Efeitos (SFX): ${this.isSFXEnabled ? '🔊 LIGADO' : '🔈 MUTE'}`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: UI_THEME.colors.textWhite,
      backgroundColor: '#2a1a3a', padding: { x: 10, y: 6 }
    }).setInteractive({ useHandCursor: true });
    sfxBtn.on('pointerdown', () => {
      this.isSFXEnabled = !this.isSFXEnabled;
      sfxBtn.setText(`Efeitos (SFX): ${this.isSFXEnabled ? '🔊 LIGADO' : '🔈 MUTE'}`);
      SoundSynth.playClick();
    });
    this.add(sfxBtn);

    // Seção Gráficos & Gameplay
    const gfxLabel = scene.add.text(-220, -50, '🎮 GRÁFICOS & GAMEPLAY', {
      fontFamily: UI_THEME.fonts.title, fontSize: '13px', fontStyle: 'bold', color: UI_THEME.colors.textBlue,
    });
    this.add(gfxLabel);

    const shakeBtn = scene.add.text(-200, -20, `Tremor de Tela: ${this.isShakeEnabled ? '✅ LIGADO' : '❌ OCULTO'}`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: UI_THEME.colors.textWhite,
      backgroundColor: '#2a1a3a', padding: { x: 10, y: 6 }
    }).setInteractive({ useHandCursor: true });
    shakeBtn.on('pointerdown', () => {
      this.isShakeEnabled = !this.isShakeEnabled;
      shakeBtn.setText(`Tremor de Tela: ${this.isShakeEnabled ? '✅ LIGADO' : '❌ OCULTO'}`);
      SoundSynth.playClick();
    });
    this.add(shakeBtn);

    // Seção Atalhos
    const keysLabel = scene.add.text(-220, 30, '⌨️ ATALHOS DO TECLADO', {
      fontFamily: UI_THEME.fonts.title, fontSize: '13px', fontStyle: 'bold', color: UI_THEME.colors.textBlue,
    });
    this.add(keysLabel);

    const hints = scene.add.text(-220, 55,
      ' [I] Inventário    | [C] Perfil    | [Q] Missões\n' +
      ' [T] Talentos      | [G] Guilda    | [K] Forja\n' +
      ' [P] Mascotes      | [L] Ranking   | [ESC] Fechar Modais',
      { fontFamily: UI_THEME.fonts.hud, fontSize: '11px', color: UI_THEME.colors.textGold, lineSpacing: 6 }
    );
    this.add(hints);

    // Reset de Dados
    const resetBtn = scene.add.text(0, 140, '🗑️ REINICIAR DADOS DE SALVAMENTO', {
      fontFamily: UI_THEME.fonts.title, fontSize: '11px', fontStyle: 'bold', color: UI_THEME.colors.textRed,
      backgroundColor: '#4a0000', padding: { x: 14, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      if (confirm('Tem certeza que deseja apagar os dados salvos e reiniciar?')) {
        localStorage.clear();
        window.location.reload();
      }
    });
    this.add(resetBtn);

    const closeBtn = scene.add.text(225, -175, '✖', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: UI_THEME.colors.textRed
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', onClose);
    this.add(closeBtn);

    scene.add.existing(this);
  }
}

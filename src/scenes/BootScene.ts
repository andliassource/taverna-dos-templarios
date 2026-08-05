import Phaser from 'phaser';

/**
 * BootScene — Primeira cena carregada.
 * Responsável por:
 * - Carregar assets mínimos para a tela de loading
 * - Configurar escalas e responsividade
 * - Iniciar a PreloadScene
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Carrega apenas o mínimo necessário para o loading screen
    // (logo, loading bar background, etc.)
    // Por enquanto, criamos placeholders via graphics
  }

  create(): void {
    // Configuração de input global
    if (this.input.keyboard) {
      this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // Escala para pixel art
    this.cameras.main.setRoundPixels(true);

    console.log('[BootScene] ⚔️ Taverna dos Templários — Boot complete');

    // Transição para PreloadScene
    this.scene.start('PreloadScene');
  }
}

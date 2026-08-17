import Phaser from 'phaser';
import { SoundSynth } from '../utils/SoundSynth';

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
  }

  create(): void {
    // Inicializa suporte a áudio no primeiro gesto do usuário
    SoundSynth.initAudioOnUserGesture();

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

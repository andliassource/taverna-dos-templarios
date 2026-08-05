import Phaser from 'phaser';
import { generatePlaceholderAssets } from '../utils/assetGenerator';

/**
 * PreloadScene — Carrega todos os assets do jogo.
 * Exibe barra de progresso na tela de loading HTML.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Referência aos elementos HTML de loading
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');

    // Atualiza barra de progresso
    this.load.on('progress', (value: number) => {
      if (loadingBar) {
        loadingBar.style.width = `${Math.floor(value * 100)}%`;
      }
    });

    // Atualiza texto de loading por arquivo
    this.load.on('filetocomplete', (key: string) => {
      if (loadingText) {
        loadingText.textContent = `Carregando: ${key}...`;
      }
    });

    // Quando terminar de carregar
    this.load.on('complete', () => {
      if (loadingText) {
        loadingText.textContent = 'A Taverna aguarda...';
      }
    });

    // Gera assets placeholder (substituir por assets reais depois)
    generatePlaceholderAssets(this);
  }

  create(): void {
    // Cria animações placeholder
    this.createAnimations();

    // Fade out do loading screen HTML
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 800);
    }

    console.log('[PreloadScene] Assets carregados com sucesso');

    // Inicia menu principal
    this.scene.start('MainMenuScene');
  }

  private createAnimations(): void {
    // Animações de movimento do jogador
    const directions = ['down', 'left', 'right', 'up'];
    directions.forEach((dir, index) => {
      // Idle
      this.anims.create({
        key: `player-idle-${dir}`,
        frames: this.anims.generateFrameNumbers('player', {
          start: index * 4,
          end: index * 4,
        }),
        frameRate: 1,
        repeat: -1,
      });

      // Walk
      this.anims.create({
        key: `player-walk-${dir}`,
        frames: this.anims.generateFrameNumbers('player', {
          start: index * 4,
          end: index * 4 + 3,
        }),
        frameRate: 8,
        repeat: -1,
      });
    });
  }
}

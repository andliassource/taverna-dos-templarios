import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { WorldScene } from '../scenes/WorldScene';
import { BattleScene } from '../scenes/BattleScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { UIScene } from '../scenes/UIScene';

/**
 * Configuração principal do Phaser 3
 * Resolução base: 960x640 (proporção 3:2, ideal para pixel art)
 * Scale Mode: FIT — se adapta a qualquer tela mantendo proporção
 */
export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 640,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  backgroundColor: '#0a0612',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 480,
      height: 320,
    },
    max: {
      width: 1920,
      height: 1280,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    WorldScene,
    BattleScene,
    DungeonScene,
    UIScene,
  ],
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
};

// Constantes de tile
export const TILE_SIZE = 32;
export const MAP_TILE_WIDTH = 30; // tiles visíveis horizontal
export const MAP_TILE_HEIGHT = 20; // tiles visíveis vertical

// Constantes de gameplay
export const PLAYER_SPEED = 160;
export const MAX_PARTY_SIZE = 5;
export const MAX_LEVEL = 100;
export const MAX_AWAKENING = 5;
export const MAX_PETS_ACTIVE = 3;
export const MAX_PETS_STABLE = 50;
export const INVENTORY_SIZE = 100;

// Constantes de economia (NUNCA expor ao cliente os valores reais do servidor)
export const AUCTION_HOUSE_TAX = 0.05; // 5% — placeholder, real value is server-side

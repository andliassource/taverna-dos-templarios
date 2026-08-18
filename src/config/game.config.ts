import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { WorldScene } from '../scenes/WorldScene';
import { TavernScene } from '../scenes/TavernScene';
import { BattleScene } from '../scenes/BattleScene';
import { DungeonScene } from '../scenes/DungeonScene';
import { UIScene } from '../scenes/UIScene';
import { MapScene } from '../scenes/MapScene';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

/**
 * Configuração principal do Phaser 3
 * Resolução HD: 1280x720 (720p) com anti-aliasing e suavização
 * Scale Mode: FIT — se adapta a qualquer tela mantendo proporção widescreen
 */
export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  pixelArt: false,
  roundPixels: false,
  antialias: true,
  backgroundColor: '#0a0612',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
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
    TavernScene,
    BattleScene,
    DungeonScene,
    UIScene,
    MapScene,
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
    pixelArt: false,
    antialias: true,
    roundPixels: false,
  },
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI',
      },
    ],
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

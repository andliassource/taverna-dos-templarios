import Phaser from 'phaser';
import { GAME_CONFIG } from './config/game.config';
import './styles/main.css';

/**
 * ⚔️ Taverna dos Templários
 * RPG Arcade Medieval — Cross-Platform (Web / Mobile / Steam)
 *
 * Ponto de entrada principal do jogo.
 * Inicializa o Phaser 3 com a configuração definida.
 */

// TODO: Descomentar quando o Firebase estiver configurado com chaves reais
// import { initFirebase } from './config/firebase.config';
// initFirebase();

// Inicializa o jogo Phaser
const game = new Phaser.Game(GAME_CONFIG);

// Hot Module Replacement (dev only)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}

// Expor para debug (dev only)
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__TAVERNA_GAME__ = game;
  console.log(
    '%c⚔️ Taverna dos Templários — Dev Mode ⚔️',
    'color: #ffd700; font-size: 16px; font-weight: bold; background: #1a0a2e; padding: 8px 16px; border-radius: 4px;'
  );
  console.log(
    '%cAcesse window.__TAVERNA_GAME__ para debug',
    'color: #d4a843; font-size: 12px;'
  );
}

export default game;

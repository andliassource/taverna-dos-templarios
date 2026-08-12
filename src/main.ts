import Phaser from 'phaser';
import { GAME_CONFIG } from './config/game.config';
import { FirebaseService } from './network/FirebaseService';
import './styles/main.css';

// Inicializa auth listener global (sem bloquear o boot)
FirebaseService.onAuthChange((user) => {
  if (user) {
    console.log(`[Firebase] Logado como: ${user.displayName ?? user.email}`);
  }
});

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

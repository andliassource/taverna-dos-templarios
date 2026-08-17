/**
 * ThemeConfig — Design System Temático Templário para Taverna dos Templários
 * Padronização de cores, fontes, bordas e estilos de raridade para todas as UIs do jogo.
 */

export const UI_THEME = {
  // Paleta de Cores Princiais
  colors: {
    bgDark: 0x0b0914,
    bgCard: 0x140e26,
    bgHover: 0x22173d,
    borderGold: 0xffd700,
    borderDarkGold: 0x5a3e10,
    borderSilver: 0xaabbcc,
    textGold: '#ffd700',
    textWhite: '#ffffff',
    textMuted: '#aaaaaa',
    textRed: '#ff4444',
    textGreen: '#00ff66',
    textBlue: '#00ccff',
  },

  // Raridades de Itens e Equipamentos
  rarity: {
    COMMON: { name: 'Comum', color: 0x8899aa, hex: '#8899aa' },
    RARE: { name: 'Raro', color: 0x00aaff, hex: '#00aaff' },
    EPIC: { name: 'Épico', color: 0xaa33ff, hex: '#aa33ff' },
    LEGENDARY: { name: 'Lendário', color: 0xff9900, hex: '#ff9900' },
    MYTHIC: { name: 'Mítico', color: 0xff2244, hex: '#ff2244' },
  },

  // Fontes do Jogo
  fonts: {
    title: 'Cinzel',
    body: 'MedievalSharp',
    hud: 'Inter',
  },
};

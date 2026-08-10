/**
 * Utilitários gerais do jogo.
 * O gerador de assets agora está integrado ao PreloadScene.
 */

/**
 * Converte coordenada de tile para pixel.
 */
export function tileToPixel(tileX: number, tileY: number, tileSize: number): { x: number; y: number } {
  return {
    x: tileX * tileSize + tileSize / 2,
    y: tileY * tileSize + tileSize / 2,
  };
}

/**
 * Converte coordenada de pixel para tile.
 */
export function pixelToTile(pixelX: number, pixelY: number, tileSize: number): { x: number; y: number } {
  return {
    x: Math.floor(pixelX / tileSize),
    y: Math.floor(pixelY / tileSize),
  };
}

/**
 * Formata número com separador de milhar.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

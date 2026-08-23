import Phaser from 'phaser';

export class UIThemeSystem {
  private static instance: UIThemeSystem;

  public static getInstance(): UIThemeSystem {
    if (!UIThemeSystem.instance) {
      UIThemeSystem.instance = new UIThemeSystem();
    }
    return UIThemeSystem.instance;
  }

  /**
   * Desenha um Painel Principal Padrão em Vidro Obsidiana AAA com Bordas de Ouro e Rebites
   */
  public drawObsidianPanel(
    graphics: Phaser.GameObjects.Graphics,
    x: number, y: number,
    width: number, height: number,
    title: string = ''
  ): void {
    graphics.clear();

    // 1. Sombra externa projetada
    graphics.fillStyle(0x000000, 0.65);
    graphics.fillRoundedRect(x + 4, y + 4, width, height, 12);

    // 2. Fundo Vidro Obsidiana Escuro (Gradiente Metálico)
    graphics.fillGradientStyle(0x1a0f2e, 0x120820, 0x0c0517, 0x06020a, 0.95, 0.95, 0.95, 0.95);
    graphics.fillRoundedRect(x, y, width, height, 12);

    // 3. Moldura Dupla em Ouro Real e Bronze Metálico
    graphics.lineStyle(2, 0xd4af37, 1);
    graphics.strokeRoundedRect(x, y, width, height, 12);
    graphics.lineStyle(1, 0xffea99, 0.4);
    graphics.strokeRoundedRect(x + 2, y + 2, width - 4, height - 4, 10);

    // 4. Rebites Metálicos de Ouro nos 4 Cantos
    const corners = [
      [x + 6, y + 6], [x + width - 6, y + 6],
      [x + 6, y + height - 6], [x + width - 6, y + height - 6]
    ];
    corners.forEach(([cx, cy]) => {
      graphics.fillStyle(0xffd700, 1);
      graphics.fillCircle(cx, cy, 2.5);
    });

    // 5. Divisor e Brilho do Cabeçalho se houver título
    if (title) {
      graphics.lineStyle(1, 0xd4af37, 0.5);
      graphics.lineBetween(x + 12, y + 38, x + width - 12, y + 38);
    }
  }

  /**
   * Retorna a cor da borda com base na raridade do item
   */
  public getRarityColor(rarity?: string): number {
    switch (rarity?.toUpperCase()) {
      case 'COMMON': return 0xaaaaaa;
      case 'RARE': return 0x3399ff;
      case 'EPIC': return 0xbf00ff;
      case 'LEGENDARY': return 0xffff00;
      default: return 0xd4af37;
    }
  }
}

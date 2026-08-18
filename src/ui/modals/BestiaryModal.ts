import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';

export interface BestiaryEntry {
  id: string;
  name: string;
  type: string;
  icon: string;
  level: number;
  hp: number;
  weakness: string;
  drops: string[];
  description: string;
}

export class BestiaryModal extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, onClose: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.setDepth(210);

    const pw = 540;
    const ph = 400;
    const px = -pw / 2;
    const py = -ph / 2;

    const bg = scene.add.graphics();
    bg.fillStyle(UI_THEME.colors.bgDark, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, UI_THEME.colors.borderGold, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(1, UI_THEME.colors.borderDarkGold, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 8);
    this.add(bg);

    const title = scene.add.text(0, py + 22, `📖 BESTIÁRIO & COMPÊNDIO DO REINO`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', fontStyle: 'bold', color: UI_THEME.colors.textGold,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(title);

    const closeBtn = scene.add.text(px + pw - 26, py + 14, '✖', {
      fontFamily: UI_THEME.fonts.title, fontSize: '16px', color: UI_THEME.colors.textRed
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', onClose);
    this.add(closeBtn);

    const entries: BestiaryEntry[] = [
      {
        id: 'goblin', name: 'Goblin das Sombras', type: 'Monstro Comum', icon: '👺', level: 3, hp: 120,
        weakness: 'Fogo 🔥', drops: ['Espada de Bronze', 'Poção P'],
        description: 'Criaturas traiçoeiras que habitam as florestas periféricas da Taverna.'
      },
      {
        id: 'imp', name: 'Demoninho Imp', type: 'Monstro Elemental', icon: '👿', level: 5, hp: 180,
        weakness: 'Gelo ❄️', drops: ['Cajado de Aprendiz', 'Elmo de Ferreiro'],
        description: 'Pequenos demônios invocados das fendas vulcânicas do Plano Astral.'
      },
      {
        id: 'skeleton', name: 'Guerreiro Esqueleto', type: 'Morto-Vivo', icon: '💀', level: 8, hp: 280,
        weakness: 'Sagrado ✝️', drops: ['Escudo de Aço', 'Gema da Força'],
        description: 'Antigos guardiões caídos cujas ossadas foram reanimadas por magia negra.'
      },
      {
        id: 'wolf', name: 'Lobo das Neves', type: 'Besta Selvagem', icon: '🐺', level: 10, hp: 350,
        weakness: 'Fogo 🔥', drops: ['Armadura de Couro', 'Dente de Lobo'],
        description: 'Predadores ágeis que atacam em alcateia nos picos congelados.'
      },
      {
        id: 'boss_malakor', name: 'Lorde Malakor', type: 'Chefe Supremo', icon: '👑', level: 25, hp: 5000,
        weakness: 'Sagrado ✝️ / Luz ✨', drops: ['Lâmina Templária Lendária', 'Asas Astral', '50 Gemas'],
        description: 'O terrível lorde sombrio do Plano Astral que ameaça destruir a Taverna.'
      },
    ];

    const listY = py + 58;
    const itemH = 60;

    entries.forEach((ent, index) => {
      const sy = listY + index * (itemH + 6);

      const itemBg = scene.add.graphics();
      itemBg.fillStyle(0x140d24, 0.9);
      itemBg.fillRoundedRect(px + 20, sy, pw - 40, itemH, 6);
      itemBg.lineStyle(1, ent.type.includes('Chefe') ? 0xff2244 : 0x4a2d6e, 0.8);
      itemBg.strokeRoundedRect(px + 20, sy, pw - 40, itemH, 6);
      this.add(itemBg);

      const icon = scene.add.text(px + 45, sy + itemH / 2, ent.icon, { fontSize: '22px' }).setOrigin(0.5);
      const name = scene.add.text(px + 75, sy + 8, `${ent.name}  (Nv. ${ent.level})`, {
        fontFamily: UI_THEME.fonts.title, fontSize: '11.5px', fontStyle: 'bold',
        color: ent.type.includes('Chefe') ? UI_THEME.colors.textRed : UI_THEME.colors.textGold,
      });
      const desc = scene.add.text(px + 75, sy + 24, `${ent.description}`, {
        fontFamily: UI_THEME.fonts.body, fontSize: '9.5px', color: '#bbbbbb',
      });
      const info = scene.add.text(px + 75, sy + 40, `Fraqueza: ${ent.weakness}  |  Drops: ${ent.drops.join(', ')}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '9px', color: UI_THEME.colors.textBlue,
      });

      this.add([icon, name, desc, info]);
    });

    scene.add.existing(this);
  }
}

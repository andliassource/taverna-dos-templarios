import Phaser from 'phaser';
import { PlayerClass } from '../../shared/types';
import { Item } from '../../shared/types/item.types';

export interface PartyMember {
  id: string;
  name: string;
  classType: PlayerClass;
  icon: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  equipped: Record<string, Item | null>;
  sprite?: Phaser.GameObjects.Container;
}

export class PartySystem {
  private scene: Phaser.Scene;
  private members: PartyMember[] = [];
  private activeIndex = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initDefaultParty();
  }

  private initDefaultParty(): void {
    this.members = [
      {
        id: 'hero_paladin',
        name: 'Paladino',
        classType: PlayerClass.PALADIN,
        icon: '🛡️',
        level: 1,
        hp: 120,
        maxHp: 120,
        mp: 50,
        maxMp: 50,
        equipped: {},
      },
      {
        id: 'hero_mage',
        name: 'Mago Arcana',
        classType: PlayerClass.MAGE,
        icon: '🔮',
        level: 1,
        hp: 80,
        maxHp: 80,
        mp: 150,
        maxMp: 150,
        equipped: {},
      },
      {
        id: 'hero_archer',
        name: 'Arqueiro',
        classType: PlayerClass.ARCHER,
        icon: '🏹',
        level: 1,
        hp: 95,
        maxHp: 95,
        mp: 70,
        maxMp: 70,
        equipped: {},
      },
      {
        id: 'hero_assassin',
        name: 'Assassino',
        classType: PlayerClass.ASSASSIN,
        icon: '🗡️',
        level: 1,
        hp: 90,
        maxHp: 90,
        mp: 60,
        maxMp: 60,
        equipped: {},
      },
      {
        id: 'hero_cleric',
        name: 'Clérigo Divine',
        classType: PlayerClass.CLERIC,
        icon: '💚',
        level: 1,
        hp: 100,
        maxHp: 100,
        mp: 120,
        maxMp: 120,
        equipped: {},
      },
    ];
  }

  public getMembers(): PartyMember[] {
    return this.members;
  }

  public getActiveMember(): PartyMember {
    return this.members[this.activeIndex];
  }

  public getActiveIndex(): number {
    return this.activeIndex;
  }

  public setActiveHero(index: number): PartyMember | null {
    if (index < 0 || index >= this.members.length) return null;
    this.activeIndex = index;
    return this.members[index];
  }

  public updatePartyAI(leaderPos: { x: number; y: number }): void {
    // Acompanhantes seguem o líder mantendo distância de formação
    this.members.forEach((member, i) => {
      if (i === this.activeIndex || !member.sprite) return;

      const angle = (i * Math.PI * 2) / 5;
      const targetX = leaderPos.x + Math.cos(angle) * 36;
      const targetY = leaderPos.y + Math.sin(angle) * 36;

      const dist = Phaser.Math.Distance.Between(member.sprite.x, member.sprite.y, targetX, targetY);
      if (dist > 15) {
        const speed = 110;
        const moveAngle = Phaser.Math.Angle.Between(member.sprite.x, member.sprite.y, targetX, targetY);
        const body = member.sprite.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(Math.cos(moveAngle) * speed, Math.sin(moveAngle) * speed);
        }
      } else {
        const body = member.sprite.body as Phaser.Physics.Arcade.Body;
        if (body) body.setVelocity(0, 0);
      }
    });
  }
}

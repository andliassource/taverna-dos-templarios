export interface PartyMember {
  id: string;
  name: string;
  classType: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  isLeader: boolean;
}

export class PartySystem {
  private static instance: PartySystem;
  private members: PartyMember[] = [];

  private constructor() {
    this.initDefaultParty();
  }

  public static getInstance(): PartySystem {
    if (!PartySystem.instance) {
      PartySystem.instance = new PartySystem();
    }
    return PartySystem.instance;
  }

  private initDefaultParty(): void {
    this.members = [
      { id: 'p1', name: 'Mestre_SirLancelot', classType: 'WARRIOR', level: 60, hp: 1200, maxHp: 1200, mp: 300, maxMp: 300, isLeader: true },
      { id: 'p2', name: 'Você (Templário)', classType: 'PALADIN', level: 12, hp: 100, maxHp: 100, mp: 50, maxMp: 50, isLeader: false },
      { id: 'p3', name: 'Lady_Merlin', classType: 'MAGE', level: 58, hp: 850, maxHp: 850, mp: 900, maxMp: 900, isLeader: false },
    ];
  }

  public getMembers(): PartyMember[] {
    return this.members;
  }

  public getXpBonusMultiplier(): number {
    return 1 + (this.members.length - 1) * 0.15; // +15% XP por membro no grupo
  }
}

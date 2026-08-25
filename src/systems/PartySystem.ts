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
    this.members = [];
  }

  public hasActiveParty(): boolean {
    return this.members.length > 0;
  }

  public syncActivePlayer(name: string, classType: string, level: number, hp: number, maxHp: number, mp: number, maxMp: number): void {
    let self = this.members.find(m => m.id === 'player_self' || m.name.includes('Você'));
    if (self) {
      self.name = name ? `Você (${name})` : self.name;
      self.classType = classType || self.classType;
      self.level = level;
      self.hp = hp;
      self.maxHp = maxHp;
      self.mp = mp;
      self.maxMp = maxMp;
    }
  }

  public addMember(member: PartyMember): void {
    if (!this.members.some(m => m.id === member.id)) {
      this.members.push(member);
    }
  }

  public removeMember(id: string): void {
    this.members = this.members.filter(m => m.id !== id);
  }

  public updateMemberHp(id: string, hp: number): void {
    const member = this.members.find(m => m.id === id);
    if (member) {
      member.hp = Math.max(0, Math.min(member.maxHp, hp));
    }
  }

  public getMembers(): PartyMember[] {
    return this.members;
  }

  public getXpBonusMultiplier(): number {
    return 1 + (this.members.length - 1) * 0.15; // +15% XP por membro no grupo
  }
}

export interface MountInfo {
  id: string;
  name: string;
  speedMultiplier: number;
  icon: string;
  unlocked: boolean;
}

export class MountSystem {
  private static instance: MountSystem;
  private activeMount: MountInfo | null = null;
  private isMounted: boolean = false;

  private availableMounts: MountInfo[] = [
    {
      id: 'warhorse',
      name: 'Cavalo de Guerra Templário',
      speedMultiplier: 1.8,
      icon: '🐎',
      unlocked: true,
    },
    {
      id: 'shadow_wolf',
      name: 'Lobo Sombrio das Neves',
      speedMultiplier: 2.0,
      icon: '🐺',
      unlocked: true,
    },
    {
      id: 'golden_dragon',
      name: 'Dragão Grifo Sagrado',
      speedMultiplier: 2.5,
      icon: '🦅',
      unlocked: true,
    },
  ];

  private constructor() {
    this.activeMount = this.availableMounts[0];
  }

  public static getInstance(): MountSystem {
    if (!MountSystem.instance) {
      MountSystem.instance = new MountSystem();
    }
    return MountSystem.instance;
  }

  public toggleMount(): { mounted: boolean; mount: MountInfo | null } {
    this.isMounted = !this.isMounted;
    return {
      mounted: this.isMounted,
      mount: this.isMounted ? this.activeMount : null,
    };
  }

  public getIsMounted(): boolean {
    return this.isMounted;
  }

  public getActiveMount(): MountInfo | null {
    return this.activeMount;
  }

  public selectMount(mountId: string): void {
    const found = this.availableMounts.find((m) => m.id === mountId);
    if (found && found.unlocked) {
      this.activeMount = found;
    }
  }

  public getAvailableMounts(): MountInfo[] {
    return this.availableMounts;
  }
}

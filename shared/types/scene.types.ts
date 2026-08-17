import { PlayerClass } from '../../shared/types';
import { Item } from './item.types';

export interface PlayerSceneData {
  name?: string;
  playerClass: PlayerClass;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
  gems: number;
  inventory?: Item[];
  equipped?: Record<string, Item | null>;
}

export interface ArenaResult {
  won: boolean;
  goldGained: number;
  gemsGained: number;
  hpPercent: number;
  inventory?: Item[];
  equipped?: Record<string, Item | null>;
}

import { PlayerClass } from '../../shared/types';
import { Item } from '../../shared/types/item.types';

export interface SaveData {
  version: number;
  name?: string;
  playerClass: PlayerClass;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  gems: number;
  inventory: Item[];
  equipped: Record<string, Item | null>;
  statPoints?: number;
  baseStats?: { str: number; agi: number; int: number; vit: number };
  achievements?: string[];
  equippedTitle?: string | null;
  savedAt: number;
  uid?: string;
  displayName?: string;
}

const SAVE_KEY = 'taverna_save_v2';
const SAVE_VERSION = 2;

export const SaveManager = {
  save(data: Omit<SaveData, 'version' | 'savedAt'>): void {
    try {
      const payload: SaveData = { ...data, version: SAVE_VERSION, savedAt: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('[SaveManager] Falha ao salvar localmente:', e);
    }
  },

  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== SAVE_VERSION) {
        console.warn('[SaveManager] Save desatualizado, ignorando.');
        return null;
      }
      return data;
    } catch (e) {
      console.warn('[SaveManager] Falha ao carregar save:', e);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  },

  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  },
};

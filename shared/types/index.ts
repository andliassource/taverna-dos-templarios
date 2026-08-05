/**
 * Taverna dos Templários — Tipos Compartilhados
 * Usados tanto no cliente quanto no servidor.
 */

// ==================== ENUMS ====================

/** Classes jogáveis */
export enum PlayerClass {
  // Tank/Melee
  PALADIN = 'PALADIN',
  GUARDIAN = 'GUARDIAN',
  DARK_KNIGHT = 'DARK_KNIGHT',
  // DPS
  WARRIOR = 'WARRIOR',
  ASSASSIN = 'ASSASSIN',
  ARCHER = 'ARCHER',
  // Magia/Utilidade
  MAGE = 'MAGE',
  NECROMANCER = 'NECROMANCER',
  ELEMENTALIST = 'ELEMENTALIST',
  // Suporte/Cura
  CLERIC = 'CLERIC',
  BARD = 'BARD',
  DRUID = 'DRUID',
}

/** Arquétipos de classe */
export enum ClassArchetype {
  TANK = 'TANK',
  DPS = 'DPS',
  MAGIC = 'MAGIC',
  SUPPORT = 'SUPPORT',
}

/** Tier de Despertar */
export enum AwakeningTier {
  NONE = 0,
  AWAKENED = 1,     // E-Rank
  ASCENDED = 2,     // D-Rank
  TRANSCENDENT = 3, // C-Rank
  DIVINE = 4,       // B-Rank → A-Rank
  CELESTIAL = 5,    // S-Rank
  PRIMORDIAL = 6,   // SS-Rank (secreto)
}

/** Raridade de equipamento */
export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC',
  DIVINE = 'DIVINE',
  PRIMORDIAL = 'PRIMORDIAL',
}

/** Slots de equipamento */
export enum EquipmentSlot {
  HELMET = 'HELMET',
  NECKLACE = 'NECKLACE',
  ARMOR = 'ARMOR',
  WEAPON = 'WEAPON',
  OFF_HAND = 'OFF_HAND',
  BRACELET = 'BRACELET',
  RING_1 = 'RING_1',
  RING_2 = 'RING_2',
  BOOTS = 'BOOTS',
}

/** Tipos de gema */
export enum GemType {
  RUBY = 'RUBY',           // +Ataque Físico
  SAPPHIRE = 'SAPPHIRE',   // +Ataque Mágico
  EMERALD = 'EMERALD',     // +Defesa
  TOPAZ = 'TOPAZ',         // +HP Máximo
  AMETHYST = 'AMETHYST',   // +Mana Máxima
  DIAMOND = 'DIAMOND',     // +Todos Atributos
  ONYX = 'ONYX',           // +Crítico/Sorte
}

/** Tier de gema */
export enum GemTier {
  CHIPPED = 1,
  POLISHED = 2,
  PERFECT = 3,
  RADIANT = 4,
  PRIMORDIAL = 5,
}

/** Tipos de runa */
export enum RuneType {
  FLAME = 'FLAME',
  ICE = 'ICE',
  LIGHTNING = 'LIGHTNING',
  EARTH = 'EARTH',
  HOLY = 'HOLY',
  SHADOW = 'SHADOW',
  TEMPORAL = 'TEMPORAL',
  PRIMORDIAL = 'PRIMORDIAL',
}

/** Tier de Pet */
export enum PetTier {
  COMMON = 1,
  UNCOMMON = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
  MYTHIC = 6,
  DIVINE = 7,
}

/** Tipo de moeda */
export enum CurrencyType {
  GOLD = 'GOLD',
  GEMS = 'GEMS',
  HONOR = 'HONOR',
  TEMPLAR_SEALS = 'TEMPLAR_SEALS',
}

/** Tipo de dungeon */
export enum DungeonType {
  OVERWORLD = 'OVERWORLD',
  INSTANCE = 'INSTANCE',
  RAID = 'RAID',
  GATE = 'GATE',
  TOWER = 'TOWER',
}

/** Gate Ranking (Solo Leveling style) */
export enum GateRank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S',
  SS = 'SS',
}

/** Direção de movimento */
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

// ==================== INTERFACES ====================

/** Atributos base do personagem */
export interface BaseStats {
  str: number; // Força
  agi: number; // Agilidade
  int: number; // Inteligência
  vit: number; // Vitalidade
  wis: number; // Sabedoria
  lck: number; // Sorte
}

/** Stats derivados (calculados no servidor) */
export interface DerivedStats {
  maxHp: number;
  maxMp: number;
  pAtk: number;   // Ataque Físico
  mAtk: number;   // Ataque Mágico
  pDef: number;   // Defesa Física
  mDef: number;   // Defesa Mágica
  speed: number;  // Velocidade
  critRate: number;
  critDmg: number;
  evasion: number;
  accuracy: number;
}

/** Dados do jogador (visão do cliente — dados não-sensíveis) */
export interface PlayerData {
  uid: string;
  displayName: string;
  class: PlayerClass;
  level: number;
  awakening: AwakeningTier;
  experience: number;
  experienceToNext: number;
  baseStats: BaseStats;
  derivedStats: DerivedStats;
  statPoints: number;
  currentHp: number;
  currentMp: number;
  position: { mapId: string; x: number; y: number };
  gold: number;
  gems: number;
  honorPoints: number;
  templarSeals: number;
}

/** Item genérico */
export interface GameItem {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
}

/** Equipamento */
export interface Equipment extends GameItem {
  slot: EquipmentSlot;
  requiredLevel: number;
  requiredClass?: PlayerClass[];
  bonusStats: Partial<BaseStats>;
  enhanceLevel: number;
  sockets: (GemSocket | null)[];
  rune: RuneType | null;
  setId?: string;
}

/** Socket de gema em equipamento */
export interface GemSocket {
  gemType: GemType;
  gemTier: GemTier;
}

/** Pet */
export interface Pet {
  id: string;
  name: string;
  species: string;
  tier: PetTier;
  stars: number;
  maxStars: number;
  level: number;
  awakening: number;
  stats: BaseStats;
  skills: string[];
  isMountable: boolean;
  mountSpeed: number;
}

/** Habilidade */
export interface Skill {
  id: string;
  name: string;
  description: string;
  class: PlayerClass;
  tree: number; // 1, 2, ou 3
  tier: number; // 1-6
  level: number;
  maxLevel: number;
  manaCost: number;
  cooldown: number;
  icon: string;
}

/** Mensagem de ação (cliente → servidor) */
export interface ActionIntent {
  type: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

/** Resposta do servidor */
export interface ServerResponse {
  success: boolean;
  type: string;
  data?: Record<string, unknown>;
  error?: string;
}

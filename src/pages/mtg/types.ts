export const INITIAL_LIFE = 40;
export const HOLD_DELAY_MS = 500;
export const HOLD_TICK_MS = 120;
export const HOLD_INCREMENT = 10;
export const CMD_LETHAL = 21;
export const POISON_LETHAL = 10;

export const QUAD_BG = ['#0c1b2e', '#0c2618', '#2e0c0c', '#1e1e08'] as const;
// Default accent per position — also used as the initial color palette choices
export const QUAD_ACCENT = ['#ff7acb', '#8fd8ff', '#b98cff', '#ffffff'] as const;

export const ACCENT_OPTIONS = [
  '#4a8fcc', // blue
  '#4acc70', // green
  '#cc4a4a', // red
  '#ccbc4a', // gold
  '#cc7a4a', // orange
  '#9b4acc', // purple
  '#4acccc', // teal
  '#cc4a9b', // pink
  '#aaaaaa', // silver
] as const;

export const PLAYER_MODAL_ROTATION = [0, 0, 180, 180] as const;

export function getPlayerModalRotation(pid: number): number {
  return PLAYER_MODAL_ROTATION[pid];
}

export interface CommanderEntry {
  name: string;
  artCrop: string;
}

// Per-attacker commander damage: [primaryCmdDmg, partnerCmdDmg]
export type CmdDmgPair = [number, number];

export interface Player {
  seat?: number;
  name: string;
  life: number;
  cmdDmg: [CmdDmgPair, CmdDmgPair, CmdDmgPair, CmdDmgPair];
  accentColor: string;
  poisonCounters: number;
  isDead: boolean;
  isAliveOverride: boolean;
  isMonarch: boolean;
  enableLifePayedCounter: boolean;
  lifePayed: number;
  enableLifeHealedCounter: boolean;
  lifeHealed: number;
  commander: string;
  commanderArtUrl: string;
  partnerCommander: string;
  partnerCommanderArtUrl: string;
}

export interface ModalState {
  victim: number;
  attacker: number;
  /** [primaryCmdDmg, partnerCmdDmg] */
  value: CmdDmgPair;
  original: CmdDmgPair;
}

export interface LifeHistoryEntry {
  id: string;
  timestamp: number;
  delta: number; // life change (positive = gain, negative = loss)
  source: 'manual' | 'commander' | 'paid' | 'gain';
  attackerPid?: number;
  attackerName?: string;
  attackerCommander?: string; // commander display name or empty
  attackerAccent?: string;
  cmdDmgAttacker?: number; // attacker index, needed for revert
  cmdDmgFrom?: CmdDmgPair; // original cmdDmg pair before this change
}

export function isEffectivelyDead(p: Player): boolean {
  if (p.isDead) return true;                    // manual KO always wins
  if (p.isAliveOverride) return false;          // override beats auto-conditions
  return p.life <= 0
    || p.poisonCounters >= POISON_LETHAL
    || p.cmdDmg.some(([d1, d2]) => d1 >= CMD_LETHAL || d2 >= CMD_LETHAL);
}

/** True when the player is overriding auto-death (alive despite bad stats). */
export function isOverridingDeath(p: Player): boolean {
  return p.isAliveOverride && !p.isDead
    && (p.life <= 0 || p.poisonCounters >= POISON_LETHAL || p.cmdDmg.some(([d1, d2]) => d1 >= CMD_LETHAL || d2 >= CMD_LETHAL));
}

/** Revive: clear dead flag, set alive override. Does NOT touch life/poison/damage. */
export function revivePlayer(p: Player): Player {
  return { ...p, isDead: false, isAliveOverride: true };
}

/** Derives a dark tinted background from an accent hex color. */
export function accentToBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return '#111';
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  // Background: same hue, reduced saturation, low lightness
  const bH = h * 360;
  const bS = Math.min(s * 60, 45);
  const bL = 10;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const bH1 = bH / 360, bS1 = bS / 100, bL1 = bL / 100;
  const q = bL1 < 0.5 ? bL1 * (1 + bS1) : bL1 + bS1 - bL1 * bS1;
  const pv = 2 * bL1 - q;
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(hue2rgb(pv, q, bH1 + 1/3))}${toHex(hue2rgb(pv, q, bH1))}${toHex(hue2rgb(pv, q, bH1 - 1/3))}`;
}

/** Clears isAliveOverride once the player is no longer in any auto-death condition. */
export function syncAliveOverride(p: Player): Player {
  if (!p.isAliveOverride) return p;
  const stillInDanger = p.life <= 0
    || p.poisonCounters >= POISON_LETHAL
    || p.cmdDmg.some(([d1, d2]) => d1 >= CMD_LETHAL || d2 >= CMD_LETHAL);
  return stillInDanger ? p : { ...p, isAliveOverride: false };
}

export const mkPlayers = (): Player[] =>
  Array.from({ length: 4 }, (_, i) => ({
    name: `Player ${i + 1}`,
    life: INITIAL_LIFE,
    cmdDmg: [[0, 0], [0, 0], [0, 0], [0, 0]] as Player['cmdDmg'],
    accentColor: QUAD_ACCENT[i],
    poisonCounters: 0,
    isDead: false,
    isAliveOverride: false,
    isMonarch: false,
    enableLifePayedCounter: false,
    lifePayed: 0,
    enableLifeHealedCounter: false,
    lifeHealed: 0,
    commander: '',
    commanderArtUrl: '',
    partnerCommander: '',
    partnerCommanderArtUrl: '',
  }));

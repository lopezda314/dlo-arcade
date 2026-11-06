import { GameCategory, GameId } from '../types/game';

export interface GameCatalogEntry {
  id: GameId;
  title: string;
  subtitle: string;
  category: GameCategory;
  categoryLabel: string;
  accentBg: string;
  accentText: string;
  accentPill: string;
  badgeCode: string;
  howToPlay: string;
  durationSec: number;
}

export const GAME_CATALOG: GameCatalogEntry[] = [
  {
    id: 'word-chain',
    title: 'LexiForge',
    subtitle: 'Craft high-value words containing the target pair while dodging the forbidden letter.',
    category: 'word',
    categoryLabel: 'WORD LAB',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-700',
    accentPill: 'bg-emerald-100 text-emerald-900 border-emerald-700',
    badgeCode: 'WRD-01',
    howToPlay: 'Type any English word (4+ letters) that includes the required 2-letter sequence and NEVER uses the forbidden letter. Longer words score exponential bonus points!',
    durationSec: 45,
  },
  {
    id: 'target-24',
    title: 'Numera',
    subtitle: 'Combine four tactile number tiles with +, −, ×, ÷ to hit the exact target number.',
    category: 'math',
    categoryLabel: 'MATH ENGINE',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-700',
    accentPill: 'bg-amber-100 text-amber-950 border-amber-700',
    badgeCode: 'MTH-02',
    howToPlay: 'Tap number tiles and operators to build an expression that equals the target number. Use each tile at most once—exact hits score big, close hits still earn partial credit!',
    durationSec: 45,
  },
  {
    id: 'color-radar',
    title: 'Proportion Eye',
    subtitle: 'Visual estimation showdown: eyeball the exact percentage of highlighted cells before locking in.',
    category: 'viz',
    categoryLabel: 'VISUALIZATION',
    accentBg: 'bg-sky-500',
    accentText: 'text-sky-700',
    accentPill: 'bg-sky-100 text-sky-950 border-sky-700',
    badgeCode: 'VIZ-03',
    howToPlay: 'Inspect the 10×10 data mosaic on screen and dial your slider to the exact percentage of highlighted cells. Bullseye guesses (+/- 1%) score 250 pts!',
    durationSec: 30,
  },
  {
    id: 'pattern-vault',
    title: 'Memory Matrix',
    subtitle: 'Memorize the glowing 4×4 constellation in 3.5 seconds, then reconstruct it from memory.',
    category: 'puzzle',
    categoryLabel: 'SPATIAL PUZZLE',
    accentBg: 'bg-violet-500',
    accentText: 'text-violet-700',
    accentPill: 'bg-violet-100 text-violet-950 border-violet-700',
    badgeCode: 'PZL-04',
    howToPlay: 'Watch the 4×4 vault grid closely while the target tiles flash. Once the vault locks, tap the exact tiles you saw and hit Lock Vault!',
    durationSec: 30,
  },
];

export const AVATAR_OPTIONS = ['🦊', '🐼', '🦁', '🐸', '🐙', '🦉', '🐯', '🦄', '🐝', '🦖', '🐧', '🦋'];

export const PLAYER_COLORS = [
  '#0F9F6E', // emerald
  '#E88B00', // amber
  '#0284C7', // sky
  '#7C3AED', // violet
  '#E11D48', // coral
  '#0D9488', // teal
];

import {
  ActivePuzzle,
  ColorRadarPuzzle,
  GameId,
  PatternVaultPuzzle,
  Player,
  RoomState,
  TargetMathPuzzle,
  WordChainPuzzle,
} from '../src/types/game';
import { AVATAR_OPTIONS, GAME_CATALOG, PLAYER_COLORS } from '../src/games/catalog';

const WORD_CHALLENGES: Array<{ pair: string; forbidden: string; sample: string[] }> = [
  { pair: 'ST', forbidden: 'E', sample: ['STARLIGHT', 'STORM', 'STAND', 'PLASTIC', 'GHOST', 'FROST'] },
  { pair: 'CH', forbidden: 'A', sample: ['CHRONIC', 'TORCH', 'SKETCH', 'ORCHID', 'LUNCH', 'BENCH'] },
  { pair: 'TR', forbidden: 'I', sample: ['CONTROL', 'STRONG', 'PATROL', 'TROPHY', 'TRACK', 'TRUST'] },
  { pair: 'GR', forbidden: 'O', sample: ['GRANITE', 'GREEDY', 'GRAPE', 'SPARKLING', 'GREEN', 'GRAND'] },
  { pair: 'PL', forbidden: 'A', sample: ['EXPLORE', 'SIMPLE', 'TEMPLE', 'PLUNGE', 'PURPLE', 'PUZZLE'] },
  { pair: 'BR', forbidden: 'I', sample: ['BRONZE', 'BRANCH', 'BROKEN', 'BRUSH', 'BREAD', 'COBRA'] },
];

const MATH_PUZZLES: Array<{ target: number; numbers: number[]; hint: string }> = [
  { target: 24, numbers: [3, 4, 6, 8], hint: '(8 - 4) * 6 = 24' },
  { target: 27, numbers: [2, 5, 7, 9], hint: '(7 - 2) * 5 + ... or 9 * (5 - 2) = 27' },
  { target: 32, numbers: [2, 4, 6, 10], hint: '(6 + 2) * 4 = 32' },
  { target: 18, numbers: [3, 5, 6, 9], hint: '9 + 6 + 3 = 18' },
  { target: 36, numbers: [3, 4, 7, 9], hint: '9 * 4 = 36' },
  { target: 40, numbers: [2, 5, 8, 12], hint: '8 * 5 = 40' },
];

const VIZ_PROMPTS: Array<{ title: string; palette: [string, string] }> = [
  { title: 'Emerald Canopy Density', palette: ['#0F9F6E', '#E6E1D6'] },
  { title: 'Solar Amber Saturation', palette: ['#E88B00', '#E6E1D6'] },
  { title: 'Deep Cobalt Signal Ratio', palette: ['#0284C7', '#E6E1D6'] },
  { title: 'Ultraviolet Cluster Index', palette: ['#7C3AED', '#E6E1D6'] },
];

export function generateRoomCode(existingCodes: Set<string>): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!existingCodes.has(code)) return code;
  }
  return 'DLOX';
}

export function generatePuzzle(gameId: GameId, round: number): ActivePuzzle {
  if (gameId === 'word-chain') {
    const item = WORD_CHALLENGES[(round - 1 + Math.floor(Math.random() * WORD_CHALLENGES.length)) % WORD_CHALLENGES.length];
    const puzzle: WordChainPuzzle = {
      kind: 'word-chain',
      pair: item.pair,
      forbidden: item.forbidden,
      usedWords: [],
      minLength: 4,
    };
    return puzzle;
  }

  if (gameId === 'target-24') {
    const item = MATH_PUZZLES[(round - 1 + Math.floor(Math.random() * MATH_PUZZLES.length)) % MATH_PUZZLES.length];
    const puzzle: TargetMathPuzzle = {
      kind: 'target-24',
      target: item.target,
      numbers: item.numbers,
      hintExpression: item.hint,
    };
    return puzzle;
  }

  if (gameId === 'color-radar') {
    const item = VIZ_PROMPTS[(round - 1) % VIZ_PROMPTS.length];
    const targetPct = Math.floor(Math.random() * 68) + 16; // 16% to 83%
    const puzzle: ColorRadarPuzzle = {
      kind: 'color-radar',
      promptTitle: item.title,
      targetPct,
      unit: '%',
      palette: item.palette,
      seed: Math.floor(Math.random() * 100000),
      guesses: {},
    };
    return puzzle;
  }

  // pattern-vault
  const count = Math.min(5 + Math.floor((round - 1) / 2), 7); // 5 to 7 active cells
  const indices = Array.from({ length: 16 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const activeCells = indices.slice(0, count).sort((a, b) => a - b);
  const puzzle: PatternVaultPuzzle = {
    kind: 'pattern-vault',
    gridSize: 16,
    activeCells,
    revealEndsAt: Date.now() + 3800,
    completedBy: [],
  };
  return puzzle;
}

function safeEvalMath(expr: string, allowedNumbers: number[]): { valid: boolean; value?: number; reason?: string } {
  const cleaned = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').trim();
  if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) {
    return { valid: false, reason: 'Only numbers and +, −, ×, ÷ are allowed.' };
  }

  const usedNumbers = (cleaned.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  if (usedNumbers.length < 2) {
    return { valid: false, reason: 'Combine at least 2 tiles!' };
  }

  const pool = [...allowedNumbers];
  for (const num of usedNumbers) {
    const idx = pool.indexOf(num);
    if (idx === -1) {
      return { valid: false, reason: `Tile ${num} isn't available (or used too many times).` };
    }
    pool.splice(idx, 1);
  }

  try {
    // Safe evaluation since we verified only digits and arithmetic symbols exist
    const fn = new Function(`return (${cleaned});`);
    const result = Number(fn());
    if (!Number.isFinite(result)) {
      return { valid: false, reason: 'Expression divided by zero!' };
    }
    return { valid: true, value: Math.round(result * 100) / 100 };
  } catch {
    return { valid: false, reason: 'Incomplete math expression.' };
  }
}

export function evaluateSubmission(
  room: RoomState,
  player: Player,
  rawAnswer: string
): { correct: boolean; points: number; detail: string } {
  const puzzle = room.puzzle;
  if (!puzzle) return { correct: false, points: 0, detail: 'No active puzzle.' };

  if (puzzle.kind === 'word-chain') {
    const word = rawAnswer.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length < puzzle.minLength) {
      return { correct: false, points: 0, detail: `Needs at least ${puzzle.minLength} letters` };
    }
    if (!word.includes(puzzle.pair)) {
      return { correct: false, points: 0, detail: `Missing required pair "${puzzle.pair}"` };
    }
    if (word.includes(puzzle.forbidden)) {
      return { correct: false, points: 0, detail: `Used forbidden letter "${puzzle.forbidden}"!` };
    }
    if (puzzle.usedWords.includes(word)) {
      return { correct: false, points: 0, detail: `"${word}" was already claimed!` };
    }
    puzzle.usedWords.push(word);
    const points = 80 + (word.length - 4) * 35;
    return {
      correct: true,
      points,
      detail: `"${word}" (${word.length} letters) • +${points} pts`,
    };
  }

  if (puzzle.kind === 'target-24') {
    const evalRes = safeEvalMath(rawAnswer, puzzle.numbers);
    if (!evalRes.valid || evalRes.value === undefined) {
      return { correct: false, points: 0, detail: evalRes.reason || 'Invalid math' };
    }
    const diff = Math.abs(evalRes.value - puzzle.target);
    if (diff === 0) {
      const alreadyExact = room.submissions.some(
        (s) => s.playerId === player.id && s.pointsAwarded >= 200
      );
      if (alreadyExact) {
        return { correct: false, points: 0, detail: 'Already hit exact target this round!' };
      }
      return {
        correct: true,
        points: 220,
        detail: `${rawAnswer} = ${evalRes.value} (EXACT HIT!)`,
      };
    }
    if (diff <= 3) {
      const points = Math.max(40, 130 - diff * 30);
      return {
        correct: true,
        points,
        detail: `${rawAnswer} = ${evalRes.value} (Off by ${diff} • +${points} pts)`,
      };
    }
    return {
      correct: false,
      points: 0,
      detail: `${rawAnswer} = ${evalRes.value} (Target is ${puzzle.target})`,
    };
  }

  if (puzzle.kind === 'color-radar') {
    const guess = Math.max(0, Math.min(100, Math.round(Number(rawAnswer))));
    if (Number.isNaN(guess)) {
      return { correct: false, points: 0, detail: 'Invalid percentage' };
    }
    if (puzzle.guesses[player.id] !== undefined) {
      return { correct: false, points: 0, detail: 'Guess already locked in!' };
    }
    puzzle.guesses[player.id] = guess;
    const diff = Math.abs(guess - puzzle.targetPct);
    const points = diff <= 1 ? 250 : diff <= 4 ? 180 : diff <= 8 ? 110 : diff <= 15 ? 50 : 10;
    const badge = diff === 0 ? 'DEADSEYE!' : diff <= 2 ? 'Laser sharp!' : `Off by ${diff}%`;
    return {
      correct: diff <= 12,
      points,
      detail: `Locked ${guess}% (${badge} • +${points} pts)`,
    };
  }

  if (puzzle.kind === 'pattern-vault') {
    if (puzzle.completedBy.includes(player.id)) {
      return { correct: false, points: 0, detail: 'Already unlocked the vault this round!' };
    }
    const chosen = rawAnswer
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);

    const targetSet = new Set(puzzle.activeCells);
    let hits = 0;
    let mistakes = 0;
    for (const c of chosen) {
      if (targetSet.has(c)) hits++;
      else mistakes++;
    }

    if (hits === puzzle.activeCells.length && mistakes === 0) {
      puzzle.completedBy.push(player.id);
      const speedBonus = Math.max(0, Math.floor((room.roundEndsAt - Date.now()) / 1000) * 4);
      const points = 200 + speedBonus;
      return {
        correct: true,
        points,
        detail: `Vault Cracked (${hits}/${puzzle.activeCells.length}) • +${points} pts!`,
      };
    }

    const partialPts = Math.max(0, hits * 25 - mistakes * 20);
    return {
      correct: partialPts > 0,
      points: partialPts,
      detail: `${hits}/${puzzle.activeCells.length} tiles matched (${mistakes} wrong)`,
    };
  }

  return { correct: false, points: 0, detail: 'Unknown game' };
}

export function createBotPlayer(existingPlayers: Player[]): Player {
  const botNames = ['Robo-DLO', 'Pixel', 'Biscuit', 'Waffles', 'gizmo.ai', 'Mochi'];
  const usedNames = new Set(existingPlayers.map((p) => p.name));
  const name = botNames.find((n) => !usedNames.has(n)) || `Bot-${existingPlayers.length + 1}`;
  const avatar = AVATAR_OPTIONS[(existingPlayers.length * 3 + 1) % AVATAR_OPTIONS.length];
  const color = PLAYER_COLORS[existingPlayers.length % PLAYER_COLORS.length];

  return {
    id: `bot-${Math.random().toString(36).slice(2, 8)}`,
    name,
    avatar,
    color,
    score: 0,
    streak: 0,
    isHost: false,
    isBot: true,
    lastAction: 'Ready to roll!',
  };
}

export function simulateBotTurn(room: RoomState, bot: Player): string | null {
  const puzzle = room.puzzle;
  if (!puzzle || room.status !== 'playing') return null;

  if (puzzle.kind === 'word-chain') {
    const match = WORD_CHALLENGES.find((w) => w.pair === puzzle.pair);
    if (!match) return null;
    const candidate = match.sample.find((w) => !puzzle.usedWords.includes(w));
    return candidate || null;
  }

  if (puzzle.kind === 'target-24') {
    const alreadyDone = room.submissions.some((s) => s.playerId === bot.id && s.correct);
    if (alreadyDone) return null;
    const [a, b, c] = puzzle.numbers;
    return `${c} * ${a} + ${b}`;
  }

  if (puzzle.kind === 'color-radar') {
    if (puzzle.guesses[bot.id] !== undefined) return null;
    const noise = Math.floor(Math.random() * 15) - 7;
    return String(Math.max(5, Math.min(95, puzzle.targetPct + noise)));
  }

  if (puzzle.kind === 'pattern-vault') {
    if (puzzle.completedBy.includes(bot.id)) return null;
    if (Date.now() < puzzle.revealEndsAt + 1500) return null;
    return puzzle.activeCells.join(',');
  }

  return null;
}

export function getRoundDurationMs(gameId: GameId): number {
  const entry = GAME_CATALOG.find((g) => g.id === gameId);
  return (entry?.durationSec || 40) * 1000;
}

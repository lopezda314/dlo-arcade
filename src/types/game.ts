export type GameCategory = 'word' | 'math' | 'viz' | 'puzzle';

export type GameId =
  | 'word-chain'
  | 'target-24'
  | 'color-radar'
  | 'pattern-vault';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  streak: number;
  isHost: boolean;
  isBot?: boolean;
  lastAction?: string;
  ready?: boolean;
}

export interface SubmissionRecord {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  value: string;
  correct: boolean;
  pointsAwarded: number;
  detail: string;
  timestamp: number;
}

export interface WordChainPuzzle {
  kind: 'word-chain';
  pair: string; // e.g. "ST"
  forbidden: string; // e.g. "E"
  usedWords: string[];
  minLength: number;
}

export interface TargetMathPuzzle {
  kind: 'target-24';
  target: number;
  numbers: number[];
  hintExpression?: string;
}

export interface ColorRadarPuzzle {
  kind: 'color-radar';
  promptTitle: string;
  targetPct: number;
  unit: string;
  palette: [string, string];
  seed: number;
  guesses: Record<string, number>; // playerId -> guessed percentage
}

export interface PatternVaultPuzzle {
  kind: 'pattern-vault';
  gridSize: number; // 4x4 = 16 tiles
  activeCells: number[]; // indices 0..15
  revealEndsAt: number; // timestamp when pattern hides
  completedBy: string[]; // playerIds who cracked it
}

export type ActivePuzzle =
  | WordChainPuzzle
  | TargetMathPuzzle
  | ColorRadarPuzzle
  | PatternVaultPuzzle;

export type RoomStatus = 'lobby' | 'playing' | 'round-summary';

export interface RoomState {
  code: string;
  status: RoomStatus;
  selectedGame: GameId;
  round: number;
  totalRounds: number;
  roundEndsAt: number;
  players: Player[];
  puzzle: ActivePuzzle | null;
  submissions: SubmissionRecord[];
  winnerBanner?: string;
}

export type ClientMessage =
  | { type: 'CREATE_ROOM'; player: Pick<Player, 'id' | 'name' | 'avatar' | 'color'>; preferredCode?: string }
  | { type: 'JOIN_ROOM'; code: string; player: Pick<Player, 'id' | 'name' | 'avatar' | 'color'> }
  | { type: 'ADD_BOT'; code: string }
  | { type: 'SELECT_GAME'; code: string; gameId: GameId }
  | { type: 'START_GAME'; code: string }
  | { type: 'NEXT_ROUND'; code: string }
  | { type: 'BACK_TO_LOBBY'; code: string }
  | { type: 'SUBMIT_ANSWER'; code: string; playerId: string; answer: string };

export type ServerMessage =
  | { type: 'ROOM_STATE'; room: RoomState; lanUrl?: string }
  | { type: 'ERROR'; message: string };

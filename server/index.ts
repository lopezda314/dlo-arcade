import os from 'os';
import { ClientMessage, RoomState, ServerMessage } from '../src/types/game';
import {
  createBotPlayer,
  evaluateSubmission,
  generatePuzzle,
  generateRoomCode,
  getRoundDurationMs,
  simulateBotTurn,
} from './gameEngine';

interface SocketData {
  roomCode?: string;
  playerId?: string;
}

const rooms = new Map<string, RoomState>();
const socketsByRoom = new Map<string, Set<any>>();

function getLanIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LAN_URL = `http://${getLanIp()}:5173`;

function broadcastRoom(code: string) {
  const room = rooms.get(code);
  const clients = socketsByRoom.get(code);
  if (!room || !clients) return;

  const payload: ServerMessage = {
    type: 'ROOM_STATE',
    room,
    lanUrl: LAN_URL,
  };
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch {
      // ignore closed socket
    }
  }
}

function attachSocketToRoom(ws: any, code: string, playerId: string) {
  ws.data.roomCode = code;
  ws.data.playerId = playerId;
  let set = socketsByRoom.get(code);
  if (!set) {
    set = new Set();
    socketsByRoom.set(code, set);
  }
  set.add(ws);
}

function handleSubmission(room: RoomState, playerId: string, answer: string) {
  if (room.status !== 'playing') return;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;

  const res = evaluateSubmission(room, player, answer);
  if (res.points > 0) {
    player.score += res.points;
    player.streak += 1;
  } else if (!res.correct) {
    player.streak = 0;
  }
  player.lastAction = res.detail;

  room.submissions.unshift({
    playerId: player.id,
    playerName: player.name,
    playerAvatar: player.avatar,
    value: answer,
    correct: res.correct,
    pointsAwarded: res.points,
    detail: res.detail,
    timestamp: Date.now(),
  });
  room.submissions = room.submissions.slice(0, 18);

  // If everyone finished in single-shot games (color-radar or pattern-vault), end round early
  if (room.puzzle?.kind === 'color-radar') {
    const guessedCount = Object.keys(room.puzzle.guesses).length;
    if (guessedCount >= room.players.length) {
      room.status = 'round-summary';
    }
  } else if (room.puzzle?.kind === 'pattern-vault') {
    if (room.puzzle.completedBy.length >= room.players.length) {
      room.status = 'round-summary';
    }
  }
}

// Tick loop for round timers & friendly bots
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (room.status !== 'playing') continue;

    if (now >= room.roundEndsAt) {
      room.status = 'round-summary';
      const sorted = [...room.players].sort((a, b) => b.score - a.score);
      if (sorted[0]) {
        room.winnerBanner = `${sorted[0].avatar} ${sorted[0].name} leads with ${sorted[0].score} pts!`;
      }
      broadcastRoom(code);
      continue;
    }

    // Occasional bot action
    for (const bot of room.players.filter((p) => p.isBot)) {
      if (Math.random() < 0.14) {
        const botAnswer = simulateBotTurn(room, bot);
        if (botAnswer) {
          handleSubmission(room, bot.id, botAnswer);
          broadcastRoom(code);
        }
      }
    }
  }
}, 1000);

const server = Bun.serve<SocketData>({
  port: 8787,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, { data: {} });
      if (upgraded) return undefined;
      return new Response('WebSocket upgrade failed', { status: 400 });
    }
    if (url.pathname === '/api/info') {
      return Response.json({
        lanUrl: LAN_URL,
        activeRooms: rooms.size,
      });
    }
    return new Response('dlo.games realtime server running', { status: 200 });
  },
  websocket: {
    open(_ws) {},
    message(ws, raw) {
      try {
        const msg = JSON.parse(String(raw)) as ClientMessage;

        if (msg.type === 'CREATE_ROOM') {
          const code =
            msg.preferredCode && !rooms.has(msg.preferredCode)
              ? msg.preferredCode
              : generateRoomCode(new Set(rooms.keys()));

          const newRoom: RoomState = {
            code,
            status: 'lobby',
            selectedGame: 'word-chain',
            round: 1,
            totalRounds: 3,
            roundEndsAt: 0,
            players: [
              {
                ...msg.player,
                score: 0,
                streak: 0,
                isHost: true,
                lastAction: 'Hosted the lobby',
              },
            ],
            puzzle: null,
            submissions: [],
          };
          rooms.set(code, newRoom);
          attachSocketToRoom(ws, code, msg.player.id);
          broadcastRoom(code);
          return;
        }

        if (msg.type === 'JOIN_ROOM') {
          const code = msg.code.trim().toUpperCase();
          let room = rooms.get(code);
          if (!room) {
            // Auto-create room if joining a fresh 4-letter code so friends never hit a dead end
            room = {
              code,
              status: 'lobby',
              selectedGame: 'word-chain',
              round: 1,
              totalRounds: 3,
              roundEndsAt: 0,
              players: [],
              puzzle: null,
              submissions: [],
            };
            rooms.set(code, room);
          }

          const existing = room.players.find((p) => p.id === msg.player.id);
          if (!existing) {
            room.players.push({
              ...msg.player,
              score: 0,
              streak: 0,
              isHost: room.players.length === 0,
              lastAction: 'Joined the table!',
            });
          } else {
            existing.name = msg.player.name;
            existing.avatar = msg.player.avatar;
            existing.color = msg.player.color;
          }

          attachSocketToRoom(ws, code, msg.player.id);
          broadcastRoom(code);
          return;
        }

        if (msg.type === 'ADD_BOT') {
          const room = rooms.get(msg.code);
          if (!room) return;
          room.players.push(createBotPlayer(room.players));
          broadcastRoom(msg.code);
          return;
        }

        if (msg.type === 'SELECT_GAME') {
          const room = rooms.get(msg.code);
          if (!room) return;
          room.selectedGame = msg.gameId;
          broadcastRoom(msg.code);
          return;
        }

        if (msg.type === 'START_GAME') {
          const room = rooms.get(msg.code);
          if (!room) return;
          room.status = 'playing';
          room.round = 1;
          room.submissions = [];
          room.puzzle = generatePuzzle(room.selectedGame, room.round);
          room.roundEndsAt = Date.now() + getRoundDurationMs(room.selectedGame);
          broadcastRoom(msg.code);
          return;
        }

        if (msg.type === 'NEXT_ROUND') {
          const room = rooms.get(msg.code);
          if (!room) return;
          room.round += 1;
          room.status = 'playing';
          room.submissions = [];
          room.puzzle = generatePuzzle(room.selectedGame, room.round);
          room.roundEndsAt = Date.now() + getRoundDurationMs(room.selectedGame);
          broadcastRoom(msg.code);
          return;
        }

        if (msg.type === 'BACK_TO_LOBBY') {
          const room = rooms.get(msg.code);
          if (!room) return;
          room.status = 'lobby';
          room.puzzle = null;
          room.submissions = [];
          broadcastRoom(msg.code);
          return;
        }

        if (msg.type === 'SUBMIT_ANSWER') {
          const room = rooms.get(msg.code);
          if (!room) return;
          handleSubmission(room, msg.playerId, msg.answer);
          broadcastRoom(msg.code);
          return;
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'ERROR', message: String(err) } satisfies ServerMessage));
      }
    },
    close(ws) {
      const code = ws.data?.roomCode;
      if (code) {
        socketsByRoom.get(code)?.delete(ws);
      }
    },
  },
});

console.log(`🎲 dlo.games realtime server listening on ws://localhost:${server.port}/ws (LAN: ${LAN_URL})`);

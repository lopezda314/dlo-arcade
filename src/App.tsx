import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Bot,
  Copy,
  Crown,
  ExternalLink,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { AVATAR_OPTIONS, GAME_CATALOG, PLAYER_COLORS } from './games/catalog';
import { ClientMessage, GameId, RoomState, ServerMessage } from './types/game';
import { CategoryPill, DloHeader } from './components/DloBranding';
import { WordChainStage } from './components/stages/WordChainStage';
import { TargetMathStage } from './components/stages/TargetMathStage';
import { ColorRadarStage } from './components/stages/ColorRadarStage';
import { PatternVaultStage } from './components/stages/PatternVaultStage';

function getInitialPlayerId(): string {
  const existing = sessionStorage.getItem('dlo_player_id');
  if (existing) return existing;
  const created = `p-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem('dlo_player_id', created);
  return created;
}

export function App() {
  const [playerId] = useState(getInitialPlayerId);
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('dlo_player_name') || 'David (dlo)'
  );
  const [playerAvatar, setPlayerAvatar] = useState(
    () => localStorage.getItem('dlo_player_avatar') || '🦊'
  );
  const [playerColor] = useState(
    () => PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)]
  );
  const [joinCodeInput, setJoinCodeInput] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || '').toUpperCase();
  });

  const [room, setRoom] = useState<RoomState | null>(null);
  const [lanUrl, setLanUrl] = useState<string>(window.location.origin);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [remainingSec, setRemainingSec] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = (msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${proto}://${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        ws.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            code: roomParam.toUpperCase(),
            player: {
              id: playerId,
              name: playerName,
              avatar: playerAvatar,
              color: playerColor,
            },
          } satisfies ClientMessage)
        );
      }
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as ServerMessage;
        if (data.type === 'ROOM_STATE') {
          setRoom(data.room);
          if (data.lanUrl) setLanUrl(data.lanUrl);
          setErrorMsg(null);
        } else if (data.type === 'ERROR') {
          setErrorMsg(data.message);
        }
      } catch {
        // ignore malformed message
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Countdown timer + celebratory confetti on round end
  useEffect(() => {
    if (!room) return;
    if (room.status === 'round-summary') {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.65 },
      });
    }
    const id = setInterval(() => {
      if (room.status === 'playing') {
        const sec = Math.max(0, Math.ceil((room.roundEndsAt - Date.now()) / 1000));
        setRemainingSec(sec);
      } else {
        setRemainingSec(0);
      }
    }, 200);
    return () => clearInterval(id);
  }, [room?.status, room?.roundEndsAt]);

  const saveIdentity = (name: string, avatar: string) => {
    localStorage.setItem('dlo_player_name', name);
    localStorage.setItem('dlo_player_avatar', avatar);
  };

  const handleCreateRoom = () => {
    const cleanName = playerName.trim() || 'Player';
    saveIdentity(cleanName, playerAvatar);
    sendMessage({
      type: 'CREATE_ROOM',
      player: {
        id: playerId,
        name: cleanName,
        avatar: playerAvatar,
        color: playerColor,
      },
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const cleanName = playerName.trim() || 'Player';
    saveIdentity(cleanName, playerAvatar);
    sendMessage({
      type: 'JOIN_ROOM',
      code: joinCodeInput.trim().toUpperCase(),
      player: {
        id: playerId,
        name: cleanName,
        avatar: playerAvatar,
        color: playerColor,
      },
    });
  };

  const inviteUrl = useMemo(() => {
    if (!room) return lanUrl;
    return `${lanUrl}/?room=${room.code}`;
  }, [lanUrl, room?.code]);

  const selectedGameInfo = useMemo(() => {
    const id = room?.selectedGame || 'word-chain';
    return GAME_CATALOG.find((g) => g.id === id) || GAME_CATALOG[0];
  }, [room?.selectedGame]);

  const sortedPlayers = useMemo(() => {
    if (!room) return [];
    return [...room.players].sort((a, b) => b.score - a.score);
  }, [room?.players]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const openFriendSimulatorTab = () => {
    if (!room) return;
    window.open(`${window.location.origin}/?room=${room.code}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DloHeader
        roomCode={room?.code}
        onLeaveRoom={
          room
            ? () => {
                window.history.replaceState({}, '', '/');
                setRoom(null);
              }
            : undefined
        }
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-100 border-2 border-paper-ink text-rose-950 font-bold text-sm">
            {errorMsg}
          </div>
        )}

        {/* LANDING SCREEN */}
        {!room && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border-2 border-paper-ink shadow-tactile-sm text-xs font-mono font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                CRAFTED BY DLO • MULTIPLAYER TABLETOP LAB
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-paper-ink">
                Pull up a chair.
              </h1>
              <p className="text-base sm:text-lg text-paper-muted">
                Host a live room on your MacBook and let friends join from their phones via 4-letter room code or QR scan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Identity + Host/Join Card */}
              <div className="lg:col-span-5 tactile-card p-6 bg-white space-y-6">
                <div>
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted mb-2">
                    YOUR TABLE BADGE
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your display name..."
                    className="tactile-input w-full text-lg"
                    maxLength={18}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted mb-2">
                    PICK YOUR AVATAR
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setPlayerAvatar(av)}
                        className={`p-2 text-2xl rounded-xl border-2 transition-all ${
                          playerAvatar === av
                            ? 'bg-amber-200 border-paper-ink shadow-tactile-sm scale-105'
                            : 'bg-paper-warm border-transparent hover:border-paper-ink/40'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-4 border-t-2 border-stone-100">
                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    className="w-full tactile-btn-lg bg-emerald-500 hover:bg-emerald-400 text-white py-4 text-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Host a New Game Room
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink mx-3 text-xs font-mono uppercase text-paper-muted">
                      OR JOIN BY 4-LETTER CODE
                    </span>
                    <div className="flex-grow border-t border-stone-200"></div>
                  </div>

                  <form onSubmit={handleJoinRoom} className="flex gap-2">
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="ABCD"
                      maxLength={4}
                      className="tactile-input w-36 text-center font-mono text-2xl uppercase tracking-widest"
                    />
                    <button
                      type="submit"
                      className="flex-1 tactile-btn bg-amber-400 hover:bg-amber-300 text-paper-ink py-3 text-base"
                    >
                      Join Table →
                    </button>
                  </form>
                </div>
              </div>

              {/* 4 Game Pillars Preview */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted">
                    INCLUDED IN THE DLO STARTER COLLECTION (4 GENRES)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GAME_CATALOG.map((g) => (
                    <div key={g.id} className="tactile-card p-5 bg-white flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <CategoryPill
                          category={g.category}
                          label={g.categoryLabel}
                          code={g.badgeCode}
                        />
                        <h3 className="font-serif text-2xl text-paper-ink">{g.title}</h3>
                        <p className="text-xs text-paper-muted leading-relaxed">{g.subtitle}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-paper-muted">
                        <span>⏱ {g.durationSec}s rounds</span>
                        <span>📱 Phone-ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE ROOM: LOBBY OR PLAYING */}
        {room && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / MAIN STAGE (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* LOBBY VIEW */}
              {room.status === 'lobby' && (
                <div className="space-y-6">
                  {/* Room Code + QR Banner */}
                  <div className="tactile-card p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-3 text-center sm:text-left">
                      <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted">
                        SCAN ON PHONE OR ENTER CODE
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="font-mono font-extrabold text-5xl tracking-widest px-4 py-2 rounded-2xl bg-amber-100 border-2 border-paper-ink shadow-tactile-sm">
                          {room.code}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-paper-muted break-all">
                        Join URL: <strong className="text-paper-ink">{inviteUrl}</strong>
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={copyInviteLink}
                          className="tactile-btn bg-paper-warm hover:bg-amber-100 px-3 py-2 text-xs flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedLink ? 'Copied Join URL!' : 'Copy Invite Link'}
                        </button>
                        <button
                          type="button"
                          onClick={openFriendSimulatorTab}
                          className="tactile-btn bg-sky-100 hover:bg-sky-200 px-3 py-2 text-xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open 2nd Player Tab
                        </button>
                        <button
                          type="button"
                          onClick={() => sendMessage({ type: 'ADD_BOT', code: room.code })}
                          className="tactile-btn bg-violet-100 hover:bg-violet-200 px-3 py-2 text-xs flex items-center gap-1.5"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          + Add Bot Friend
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border-2 border-paper-ink shadow-tactile-sm flex flex-col items-center">
                      <QRCodeSVG value={inviteUrl} size={124} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-paper-muted mt-2">
                        SAME WI-FI SCAN
                      </span>
                    </div>
                  </div>

                  {/* Game Cartridge Selector */}
                  <div className="tactile-card p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted">
                          SELECT GAME CARTRIDGE
                        </span>
                        <h2 className="font-serif text-3xl text-paper-ink">
                          What are we playing?
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => sendMessage({ type: 'START_GAME', code: room.code })}
                        className="tactile-btn-lg bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 flex items-center gap-2 text-base"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Start Match
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {GAME_CATALOG.map((game) => {
                        const active = room.selectedGame === game.id;
                        return (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() =>
                              sendMessage({
                                type: 'SELECT_GAME',
                                code: room.code,
                                gameId: game.id as GameId,
                              })
                            }
                            className={`text-left p-4 rounded-2xl border-2 transition-all ${
                              active
                                ? 'bg-amber-50 border-paper-ink shadow-tactile translate-y-[-2px]'
                                : 'bg-paper-warm/60 border-paper-ink/40 hover:border-paper-ink'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <CategoryPill
                                category={game.category}
                                label={game.categoryLabel}
                                code={game.badgeCode}
                              />
                              {active && (
                                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-paper-ink text-white">
                                  SELECTED
                                </span>
                              )}
                            </div>
                            <div className="font-serif text-2xl text-paper-ink">{game.title}</div>
                            <p className="text-xs text-paper-muted mt-1">{game.subtitle}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* How to Play Box */}
                    <div className="p-4 rounded-xl bg-paper-warm border-2 border-paper-ink/20 text-xs text-paper-ink space-y-1">
                      <div className="font-mono font-extrabold uppercase text-paper-muted">
                        HOW TO PLAY {selectedGameInfo.title.toUpperCase()}:
                      </div>
                      <p className="leading-relaxed">{selectedGameInfo.howToPlay}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PLAYING VIEW */}
              {room.status === 'playing' && room.puzzle && (
                <div className="space-y-6">
                  {/* Top Status Bar */}
                  <div className="tactile-card p-4 bg-white flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CategoryPill
                        category={selectedGameInfo.category}
                        label={selectedGameInfo.categoryLabel}
                        code={`ROUND ${room.round}`}
                      />
                      <h2 className="font-serif text-2xl text-paper-ink">
                        {selectedGameInfo.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-1.5 rounded-xl border-2 border-paper-ink font-mono font-extrabold text-xl flex items-center gap-2 shadow-tactile-sm ${
                          remainingSec <= 8 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-200 text-paper-ink'
                        }`}
                      >
                        <Timer className="w-5 h-5" />
                        {remainingSec}s
                      </div>
                      <button
                        type="button"
                        onClick={() => sendMessage({ type: 'BACK_TO_LOBBY', code: room.code })}
                        className="tactile-btn bg-paper-warm hover:bg-stone-200 px-3 py-2 text-xs"
                      >
                        Switch Game
                      </button>
                    </div>
                  </div>

                  {/* Game-Specific Stage */}
                  {room.puzzle.kind === 'word-chain' && (
                    <WordChainStage
                      puzzle={room.puzzle}
                      onSubmit={(ans) =>
                        sendMessage({
                          type: 'SUBMIT_ANSWER',
                          code: room.code,
                          playerId,
                          answer: ans,
                        })
                      }
                    />
                  )}
                  {room.puzzle.kind === 'target-24' && (
                    <TargetMathStage
                      puzzle={room.puzzle}
                      onSubmit={(ans) =>
                        sendMessage({
                          type: 'SUBMIT_ANSWER',
                          code: room.code,
                          playerId,
                          answer: ans,
                        })
                      }
                    />
                  )}
                  {room.puzzle.kind === 'color-radar' && (
                    <ColorRadarStage
                      puzzle={room.puzzle}
                      playerId={playerId}
                      onSubmit={(ans) =>
                        sendMessage({
                          type: 'SUBMIT_ANSWER',
                          code: room.code,
                          playerId,
                          answer: ans,
                        })
                      }
                    />
                  )}
                  {room.puzzle.kind === 'pattern-vault' && (
                    <PatternVaultStage
                      puzzle={room.puzzle}
                      playerId={playerId}
                      onSubmit={(ans) =>
                        sendMessage({
                          type: 'SUBMIT_ANSWER',
                          code: room.code,
                          playerId,
                          answer: ans,
                        })
                      }
                    />
                  )}
                </div>
              )}

              {/* ROUND SUMMARY VIEW */}
              {room.status === 'round-summary' && (
                <div className="tactile-card p-8 bg-white text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-200 border-2 border-paper-ink font-mono font-extrabold text-xs">
                    <Trophy className="w-4 h-4" />
                    ROUND {room.round} COMPLETE
                  </div>

                  <h2 className="font-serif text-4xl sm:text-5xl text-paper-ink">
                    {room.winnerBanner || 'Time is up!'}
                  </h2>

                  {room.puzzle?.kind === 'target-24' && room.puzzle.hintExpression && (
                    <p className="text-sm font-mono bg-amber-50 border border-amber-300 rounded-xl py-2 px-4 inline-block">
                      Sample Solution: <strong>{room.puzzle.hintExpression}</strong>
                    </p>
                  )}

                  {room.puzzle?.kind === 'color-radar' && (
                    <p className="text-sm font-mono bg-sky-50 border border-sky-300 rounded-xl py-2 px-4 inline-block">
                      Exact Grid Density: <strong>{room.puzzle.targetPct}%</strong>
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => sendMessage({ type: 'NEXT_ROUND', code: room.code })}
                      className="tactile-btn-lg bg-emerald-500 hover:bg-emerald-400 text-white px-7 py-4 text-lg flex items-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Deal Round {room.round + 1}
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage({ type: 'BACK_TO_LOBBY', code: room.code })}
                      className="tactile-btn-lg bg-paper-warm hover:bg-amber-100 text-paper-ink px-6 py-4 text-base flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Pick Different Game
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: PLAYERS & LIVE TELEMETRY FEED (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Leaderboard Card */}
              <div className="tactile-card p-5 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-paper-ink" />
                    PLAYERS AT TABLE ({room.players.length})
                  </span>
                  <span className="text-[11px] font-mono text-paper-muted">LIVE SCORE</span>
                </div>

                <div className="space-y-2.5">
                  {sortedPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border-2 border-paper-ink flex items-center justify-between ${
                        p.id === playerId ? 'bg-amber-50 shadow-tactile-sm' : 'bg-paper-warm/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">{p.avatar}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-paper-ink flex items-center gap-1.5 truncate">
                            <span className="truncate">{p.name}</span>
                            {idx === 0 && p.score > 0 && (
                              <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-400" />
                            )}
                            {p.isBot && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-violet-200 text-violet-950">
                                BOT
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-paper-muted truncate">
                            {p.lastAction || 'Ready'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div className="font-mono font-extrabold text-base text-paper-ink">
                          {p.score}
                        </div>
                        {p.streak > 1 && (
                          <div className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-700">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            {p.streak}x
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Action Feed */}
              <div className="tactile-card p-5 bg-white space-y-3">
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-paper-muted block">
                  LIVE TABLE FEED
                </span>
                {room.submissions.length === 0 ? (
                  <p className="text-xs text-paper-muted italic py-3">
                    Moves and answers will stream here in real time...
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {room.submissions.map((sub, i) => (
                      <div
                        key={`${sub.timestamp}-${i}`}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          sub.correct
                            ? 'bg-emerald-50 border-emerald-700 text-emerald-950'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="mr-1.5">{sub.playerAvatar}</span>
                          <strong>{sub.playerName}:</strong> {sub.detail}
                        </div>
                        {sub.pointsAwarded > 0 && (
                          <span className="font-mono font-extrabold text-emerald-800 shrink-0">
                            +{sub.pointsAwarded}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

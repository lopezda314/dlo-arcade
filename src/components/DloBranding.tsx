import React from 'react';
import { GameCategory } from '../types/game';

interface HeaderProps {
  roomCode?: string;
  onLeaveRoom?: () => void;
}

export const DloHeader: React.FC<HeaderProps> = ({ roomCode, onLeaveRoom }) => {
  return (
    <header className="w-full border-b-2 border-paper-ink bg-paper-warm/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            title="Return to dlo.games home"
          >
            <div className="w-10 h-10 rounded-xl bg-paper-ink text-paper flex items-center justify-center font-mono font-extrabold text-lg tracking-tighter border-2 border-paper-ink shadow-tactile-sm group-hover:bg-amber-500 group-hover:text-paper-ink transition-colors">
              dlo
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl leading-none tracking-tight text-paper-ink">
                  dlo.games
                </span>
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-200/80 border border-paper-ink">
                  STUDIO EDITION
                </span>
              </div>
              <p className="text-xs font-medium text-paper-muted">
                Tabletop Party Lab • Word · Math · Viz · Puzzle
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {roomCode && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-paper-ink shadow-tactile-sm flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-paper-muted">
                  ROOM
                </span>
                <span className="font-mono font-extrabold text-base tracking-widest text-paper-ink">
                  {roomCode}
                </span>
              </div>
              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="tactile-btn bg-white hover:bg-rose-50 px-3 py-1.5 text-xs"
                >
                  Leave
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const CategoryPill: React.FC<{ category: GameCategory; label: string; code: string }> = ({
  category,
  label,
  code,
}) => {
  const styles: Record<GameCategory, string> = {
    word: 'bg-emerald-100 text-emerald-950 border-emerald-800',
    math: 'bg-amber-100 text-amber-950 border-amber-800',
    viz: 'bg-sky-100 text-sky-950 border-sky-800',
    puzzle: 'bg-violet-100 text-violet-950 border-violet-800',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`text-[11px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${styles[category]}`}
      >
        {label}
      </span>
      <span className="text-[11px] font-mono font-bold text-paper-muted">{code}</span>
    </div>
  );
};

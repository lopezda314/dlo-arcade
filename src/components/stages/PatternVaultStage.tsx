import React, { useEffect, useState } from 'react';
import { Lock, Sparkles, Unlock } from 'lucide-react';
import { PatternVaultPuzzle } from '../../types/game';

interface Props {
  puzzle: PatternVaultPuzzle;
  playerId: string;
  onSubmit: (answer: string) => void;
}

export const PatternVaultStage: React.FC<Props> = ({ puzzle, playerId, onSubmit }) => {
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    setSelected([]);
  }, [puzzle.revealEndsAt]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 120);
    return () => clearInterval(id);
  }, []);

  const isRevealing = now < puzzle.revealEndsAt;
  const alreadyCracked = puzzle.completedBy.includes(playerId);
  const revealRemainingSec = Math.max(0, (puzzle.revealEndsAt - now) / 1000).toFixed(1);

  const toggleCell = (idx: number) => {
    if (isRevealing || alreadyCracked) return;
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-6">
      <div className="tactile-card p-6 bg-white flex flex-col md:flex-row items-center gap-8">
        {/* 4x4 Spatial Grid */}
        <div className="p-4 rounded-2xl bg-paper-warm border-2 border-paper-ink shadow-tactile">
          <div className="grid grid-cols-4 gap-3 w-64 h-64 sm:w-72 sm:h-72">
            {Array.from({ length: 16 }, (_, idx) => {
              const isTarget = puzzle.activeCells.includes(idx);
              const isPicked = selected.includes(idx);

              let cellStyle = 'bg-white hover:bg-violet-50 text-paper-muted';
              if (isRevealing && isTarget) {
                cellStyle = 'bg-violet-500 text-white scale-[1.03] shadow-tactile-sm';
              } else if (!isRevealing && isPicked) {
                cellStyle = 'bg-violet-500 text-white shadow-tactile-sm';
              } else if (alreadyCracked && isTarget) {
                cellStyle = 'bg-emerald-500 text-white';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isRevealing || alreadyCracked}
                  onClick={() => toggleCell(idx)}
                  className={`rounded-xl border-2 border-paper-ink font-mono font-bold text-sm transition-all flex items-center justify-center ${cellStyle}`}
                >
                  {isRevealing && isTarget ? (
                    <Sparkles className="w-6 h-6" />
                  ) : (
                    <span className="opacity-40">{idx + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions & Submit */}
        <div className="flex-1 w-full space-y-5">
          <div>
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-violet-800 flex items-center gap-1.5">
              {isRevealing ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              SPATIAL CONSTELLATION VAULT
            </span>
            <h3 className="font-serif text-3xl text-paper-ink mt-1">
              {isRevealing
                ? `Memorize the ${puzzle.activeCells.length} glowing tiles!`
                : `Reconstruct all ${puzzle.activeCells.length} tiles`}
            </h3>
            <p className="text-sm text-paper-muted mt-1">
              {isRevealing
                ? `Pattern locks in ${revealRemainingSec}s — keep your eyes on the grid!`
                : `Selected ${selected.length} of ${puzzle.activeCells.length} required tiles.`}
            </p>
          </div>

          {alreadyCracked ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-paper-ink shadow-tactile-sm">
              <p className="font-bold text-emerald-900 text-lg">
                ✓ Vault Cracked! Speed bonus awarded.
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                Hang tight while the rest of the room finishes reconstructing the matrix.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                disabled={isRevealing || selected.length === 0}
                onClick={() => onSubmit(selected.join(','))}
                className="w-full tactile-btn-lg bg-violet-600 hover:bg-violet-500 text-white py-3.5 text-lg"
              >
                {isRevealing
                  ? `Memorizing (${revealRemainingSec}s)...`
                  : `Check Vault Combination (${selected.length}/${puzzle.activeCells.length})`}
              </button>
              {!isRevealing && selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="w-full tactile-btn bg-paper-warm hover:bg-stone-200 py-2 text-xs"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

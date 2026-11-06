import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye } from 'lucide-react';
import { ColorRadarPuzzle } from '../../types/game';

interface Props {
  puzzle: ColorRadarPuzzle;
  playerId: string;
  onSubmit: (answer: string) => void;
}

export const ColorRadarStage: React.FC<Props> = ({ puzzle, playerId, onSubmit }) => {
  const [sliderVal, setSliderVal] = useState(50);
  const lockedGuess = puzzle.guesses[playerId];

  // Deterministically shuffle 100 cells based on puzzle.seed and puzzle.targetPct
  const cells = useMemo(() => {
    const arr = Array.from({ length: 100 }, (_, i) => i < puzzle.targetPct);
    let s = puzzle.seed || 1337;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [puzzle.seed, puzzle.targetPct]);

  return (
    <div className="space-y-6">
      <div className="tactile-card p-6 bg-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 10x10 Mosaic Grid */}
          <div className="p-3 rounded-2xl bg-paper-warm border-2 border-paper-ink shadow-tactile-sm">
            <div className="grid grid-cols-10 gap-1.5 w-64 h-64 sm:w-72 sm:h-72">
              {cells.map((active, idx) => (
                <div
                  key={idx}
                  className="rounded-[4px] border border-paper-ink/20 transition-transform"
                  style={{
                    backgroundColor: active ? puzzle.palette[0] : puzzle.palette[1],
                  }}
                />
              ))}
            </div>
          </div>

          {/* Estimation Controls */}
          <div className="flex-1 w-full space-y-5">
            <div>
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                VISUAL PROPORTION CHALLENGE
              </span>
              <h3 className="font-serif text-3xl text-paper-ink mt-1">{puzzle.promptTitle}</h3>
              <p className="text-sm text-paper-muted mt-1">
                Don't count every tile—trust your visual intuition! What percentage of the 10×10 grid is colored?
              </p>
            </div>

            {lockedGuess !== undefined ? (
              <div className="p-5 rounded-2xl bg-sky-50 border-2 border-paper-ink shadow-tactile-sm space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-sky-600" />
                  Locked in at <span className="font-mono text-xl">{lockedGuess}%</span>
                </div>
                <p className="text-xs text-paper-muted">
                  Actual density was <strong className="font-mono text-paper-ink">{puzzle.targetPct}%</strong> (Off by{' '}
                  {Math.abs(lockedGuess - puzzle.targetPct)}%). Waiting for remaining players...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-paper-muted">
                    YOUR ESTIMATE
                  </span>
                  <span className="px-4 py-1.5 rounded-xl bg-sky-100 border-2 border-paper-ink font-mono font-extrabold text-3xl text-paper-ink shadow-tactile-sm">
                    {sliderVal}%
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={95}
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full h-3 bg-paper-warm rounded-lg appearance-none cursor-pointer accent-sky-600 border border-paper-ink"
                />

                <div className="flex justify-between text-[11px] font-mono text-paper-muted">
                  <span>5% (Sparse)</span>
                  <span>50% (Half)</span>
                  <span>95% (Dense)</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSubmit(String(sliderVal))}
                  className="w-full tactile-btn-lg bg-sky-500 hover:bg-sky-400 text-white py-3.5 text-lg"
                >
                  Lock In {sliderVal}% Estimate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

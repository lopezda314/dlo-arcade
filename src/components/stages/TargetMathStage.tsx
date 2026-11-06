import React, { useState } from 'react';
import { Delete, RotateCcw, Send } from 'lucide-react';
import { TargetMathPuzzle } from '../../types/game';

interface Props {
  puzzle: TargetMathPuzzle;
  onSubmit: (answer: string) => void;
}

export const TargetMathStage: React.FC<Props> = ({ puzzle, onSubmit }) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  const expr = tokens.join(' ');

  const addNumberTile = (num: number, index: number) => {
    if (usedIndices.includes(index)) return;
    setTokens((prev) => [...prev, String(num)]);
    setUsedIndices((prev) => [...prev, index]);
  };

  const addOperator = (op: string) => {
    setTokens((prev) => [...prev, op]);
  };

  const clearAll = () => {
    setTokens([]);
    setUsedIndices([]);
  };

  const backspace = () => {
    if (tokens.length === 0) return;
    const last = tokens[tokens.length - 1];
    setTokens((prev) => prev.slice(0, -1));
    if (/^\d+$/.test(last)) {
      const numVal = parseInt(last, 10);
      const idxInUsed = [...usedIndices]
        .reverse()
        .find((idx) => puzzle.numbers[idx] === numVal);
      if (idxInUsed !== undefined) {
        setUsedIndices((prev) => prev.filter((i) => i !== idxInUsed));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expr.trim()) return;
    onSubmit(expr);
    clearAll();
  };

  return (
    <div className="space-y-6">
      {/* Target Display */}
      <div className="tactile-card p-6 bg-amber-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-amber-900">
            TARGET NUMBER
          </span>
          <h3 className="font-serif text-3xl text-paper-ink mt-0.5">
            Hit <span className="underline decoration-amber-500 decoration-4">{puzzle.target}</span> using the tiles below
          </h3>
          <p className="text-xs text-paper-muted mt-1">
            Exact match = <strong>+220 pts</strong> • Within ±3 = partial credit
          </p>
        </div>

        <div className="px-7 py-4 rounded-2xl bg-amber-500 text-paper-ink border-2 border-paper-ink shadow-tactile font-mono font-extrabold text-5xl">
          {puzzle.target}
        </div>
      </div>

      {/* Number Tiles */}
      <div className="tactile-card p-5 bg-white space-y-5">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-paper-muted mb-2.5">
            1. TAP NUMBER TILES (EACH TILE USED AT MOST ONCE)
          </div>
          <div className="grid grid-cols-4 gap-3">
            {puzzle.numbers.map((num, idx) => {
              const used = usedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={used}
                  onClick={() => addNumberTile(num, idx)}
                  className={`tactile-btn-lg py-5 font-mono text-3xl flex flex-col items-center justify-center ${
                    used
                      ? 'bg-stone-100 text-stone-400 border-stone-300'
                      : 'bg-amber-100 hover:bg-amber-200 text-paper-ink'
                  }`}
                >
                  <span>{num}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-paper-muted mt-1">
                    {used ? 'USED' : 'TILE'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operators */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-paper-muted mb-2.5">
            2. COMBINE WITH OPERATORS
          </div>
          <div className="grid grid-cols-6 gap-2.5">
            {['+', '−', '×', '÷', '(', ')'].map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => addOperator(op)}
                className="tactile-btn py-3 bg-paper-warm hover:bg-amber-200 font-mono text-xl font-extrabold"
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Expression Bar */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t-2 border-stone-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={expr}
              onChange={(e) => setTokens(e.target.value ? [e.target.value] : [])}
              placeholder="Tap tiles above or type (e.g. (8 - 4) * 6)"
              className="tactile-input flex-1 font-mono text-xl"
            />
            <button
              type="button"
              onClick={backspace}
              className="tactile-btn bg-stone-100 hover:bg-stone-200 p-3.5"
              title="Undo last token"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="tactile-btn bg-stone-100 hover:bg-stone-200 p-3.5"
              title="Clear expression"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!expr.trim()}
            className="w-full tactile-btn-lg bg-amber-500 hover:bg-amber-400 text-paper-ink py-3.5 flex items-center justify-center gap-2 text-lg"
          >
            <Send className="w-5 h-5" />
            Lock In Equation
          </button>
        </form>
      </div>
    </div>
  );
};

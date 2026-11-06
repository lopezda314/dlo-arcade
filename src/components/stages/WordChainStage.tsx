import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { WordChainPuzzle } from '../../types/game';

interface Props {
  puzzle: WordChainPuzzle;
  onSubmit: (answer: string) => void;
}

export const WordChainStage: React.FC<Props> = ({ puzzle, onSubmit }) => {
  const [word, setWord] = useState('');

  const cleaned = word.trim().toUpperCase().replace(/[^A-Z]/g, '');
  const hasPair = cleaned.includes(puzzle.pair);
  const hasForbidden = cleaned.includes(puzzle.forbidden);
  const longEnough = cleaned.length >= puzzle.minLength;
  const alreadyUsed = puzzle.usedWords.includes(cleaned);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleaned) return;
    onSubmit(cleaned);
    setWord('');
  };

  return (
    <div className="space-y-6">
      {/* Challenge Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="tactile-card p-5 bg-emerald-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-900">
              MUST CONTAIN SEQUENCE
            </span>
            <p className="text-sm text-emerald-800 mt-0.5">Anywhere inside your word</p>
          </div>
          <div className="flex gap-1.5">
            {puzzle.pair.split('').map((ch, idx) => (
              <div
                key={idx}
                className="w-12 h-14 rounded-xl bg-emerald-500 text-white border-2 border-paper-ink shadow-tactile-sm flex items-center justify-center font-mono font-extrabold text-2xl"
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        <div className="tactile-card p-5 bg-rose-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-900">
              FORBIDDEN LETTER
            </span>
            <p className="text-sm text-rose-800 mt-0.5">Cannot appear anywhere!</p>
          </div>
          <div className="w-12 h-14 rounded-xl bg-rose-500 text-white border-2 border-paper-ink shadow-tactile-sm flex items-center justify-center font-mono font-extrabold text-2xl relative">
            {puzzle.forbidden}
          </div>
        </div>
      </div>

      {/* Live Word Builder */}
      <form onSubmit={handleSubmit} className="tactile-card p-5 bg-white space-y-4">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-paper-muted">LIVE VALIDATOR ({puzzle.minLength}+ LETTERS)</span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded border ${
                hasPair
                  ? 'bg-emerald-100 border-emerald-700 text-emerald-900'
                  : 'bg-stone-100 border-stone-300 text-stone-500'
              }`}
            >
              {hasPair ? `✓ Has "${puzzle.pair}"` : `Needs "${puzzle.pair}"`}
            </span>
            <span
              className={`px-2 py-0.5 rounded border ${
                !hasForbidden
                  ? 'bg-emerald-100 border-emerald-700 text-emerald-900'
                  : 'bg-rose-200 border-rose-800 text-rose-950'
              }`}
            >
              {hasForbidden ? `✗ Uses "${puzzle.forbidden}"!` : `✓ No "${puzzle.forbidden}"`}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={`Type a word with "${puzzle.pair}" (no "${puzzle.forbidden}")...`}
            className="tactile-input flex-1 font-mono text-xl uppercase tracking-wider"
            autoFocus
          />
          <button
            type="submit"
            disabled={!cleaned || !longEnough || hasForbidden || alreadyUsed}
            className="tactile-btn bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 flex items-center gap-2 text-base"
          >
            <Send className="w-4 h-4" />
            Forge
          </button>
        </div>

        {alreadyUsed && (
          <p className="text-xs font-bold text-rose-600">
            "{cleaned}" was already forged by someone at the table!
          </p>
        )}
      </form>

      {/* Claimed Words Board */}
      <div className="tactile-card-sm p-4 bg-paper-warm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-paper-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Forged Words This Round ({puzzle.usedWords.length})
          </span>
          <span className="text-xs font-mono text-paper-muted">+35 bonus pts per extra letter</span>
        </div>
        {puzzle.usedWords.length === 0 ? (
          <p className="text-sm text-paper-muted italic">
            No words claimed yet — be the first on the board!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {puzzle.usedWords.map((w) => (
              <span
                key={w}
                className="px-3 py-1 rounded-lg bg-white border-2 border-paper-ink font-mono font-bold text-sm shadow-tactile-sm"
              >
                {w}{' '}
                <span className="text-emerald-700 text-xs">
                  +{80 + (w.length - 4) * 35}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

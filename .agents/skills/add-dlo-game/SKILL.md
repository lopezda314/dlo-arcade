---
name: add-dlo-game
description: >-
  Step-by-step workflow to create and register a new multiplayer game cartridge
  (Word, Math, Visualization, or Spatial Puzzle) in the dlo.games (dlo-arcade) codebase.
  Use this skill whenever the user wants to design or add a new game to dlo.games.
---

# Adding a New Game Cartridge to `dlo.games`

Follow these 5 steps so every new game plugs cleanly into the real-time room lobby, scoreboard, timer, and bot system:

1. **Define the Puzzle Type (`src/types/game.ts`)**:
   - Add the new slug to `GameId`.
   - Create a `<GameName>Puzzle` interface with `kind: '<game-slug>'` and add it to the `ActivePuzzle` union.

2. **Register in the Catalog (`src/games/catalog.ts`)**:
   - Add a `GameCatalogEntry` to `GAME_CATALOG` with its `category` (`'word' | 'math' | 'viz' | 'puzzle'`), `badgeCode` (e.g. `WRD-05`), `durationSec`, and `howToPlay`.

3. **Implement Server Logic (`server/gameEngine.ts`)**:
   - Add puzzle creation in `generatePuzzle(gameId, round)`.
   - Add answer evaluation and point calculation in `evaluateSubmission(room, player, rawAnswer)`.
   - Add a simple AI move in `simulateBotTurn(room, bot)` so solo testing with bots works out of the box.

4. **Build the Tactile Stage Component (`src/components/stages/<GameName>Stage.tsx`)**:
   - Use `.tactile-card`, `.tactile-btn`, `.tactile-btn-lg`, and `.tactile-input`.
   - Call `onSubmit(answerString)` when the player locks in a move.

5. **Mount in `src/App.tsx` & Verify Build**:
   - Render the stage inside the `room.status === 'playing'` block in `src/App.tsx`.
   - Run `bun run build` to verify zero TypeScript or Vite bundling errors.

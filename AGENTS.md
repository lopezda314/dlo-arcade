# `dlo.games` — Project Rules & Context (`dlo-arcade`)

**`dlo.games`** (`dlo-arcade`) is a multiplayer tabletop party game web app (and future Expo iOS/Android companion) designed to host word, math, visualization, and spatial puzzle games for friends.

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Starting the Dev Server**: Run `bun run dev` (starts both the Bun WebSocket room server on `:8787` and Vite frontend on `:5173` via `scripts/dev.ts`).

## 1. Signature `dlo` Aesthetic & Design System
Every game built in `dlo.games` must feel unmistakably cohesive—**Warm & Tactile Tabletop (NYT Games meets Jackbox)**:
- **Surfaces**: Warm cream dot-grid board (`bg-paper` `#FAF7F0`, `bg-paper-warm` `#F3EDE0`, crisp white cards `#FFFFFF`, deep ink borders `border-paper-ink` `#171614`).
- **Tactile Components**: Always use `.tactile-card`, `.tactile-card-sm`, `.tactile-btn`, `.tactile-btn-lg`, and `.tactile-input` from `src/index.css` (`2px` solid ink borders + hard offset shadows `shadow-tactile` that physically depress on click).
- **Typography**:
  - Headlines: `font-serif` (`Instrument Serif`)
  - UI & Body: `font-sans` (`Plus Jakarta Sans`)
  - Room Codes, Timers, Scores, Badges: `font-mono` (`JetBrains Mono`)
- **Genre Color Pillars**:
  - **Word (`word`)**: Emerald (`#0F9F6E` / `emerald-500`)
  - **Math (`math`)**: Amber (`#E88B00` / `amber-500`)
  - **Visualization (`viz`)**: Sky Blue (`#0284C7` / `sky-500`)
  - **Spatial Puzzle (`puzzle`)**: Violet (`#7C3AED` / `violet-500`)

## 2. Architecture & Multiplayer Protocol
- **`src/types/game.ts`**: Shared TypeScript discriminated unions for `GameId`, `ActivePuzzle`, `RoomState`, `ClientMessage`, and `ServerMessage`.
- **`src/games/catalog.ts`**: Metadata registry (`GAME_CATALOG`) defining each game's title, category, badge code (`WRD-01`, `MTH-02`, `VIZ-03`, `PZL-04`), round duration, and instructions.
- **`server/gameEngine.ts`**: Pure functions for puzzle generation (`generatePuzzle`), answer validation & scoring (`evaluateSubmission`), and AI bot behavior (`simulateBotTurn`).
- **`server/index.ts`**: Bun WebSocket server (`ws://localhost:8787/ws`) managing room state, 1-second round countdown ticks, bot turns, and LAN IP discovery so friends on the same Wi-Fi can scan the lobby QR code from their phones.
- **`src/components/stages/*`**: Dedicated interactive React stage component for each game cartridge.

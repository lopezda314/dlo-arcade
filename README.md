# dlo.games — Tabletop Party Arcade Starter Kit

A warm, tactile multiplayer party game engine built for **David Lopez (`dlo`)** featuring real-time 4-letter room codes, phone QR-code joining, friendly AI bots, and a modular "Game Cartridge" architecture spanning **Word, Math, Visualization, and Spatial Puzzle** genres.

## Quick Start

```bash
cd ~/Documents/dlo-arcade
bun run dev
```

- **Local Web App**: http://localhost:5173
- **Phone / Friends on Same Wi-Fi**: Scan the QR code shown in the lobby (or visit the displayed `http://<your-mac-ip>:5173/?room=XXXX` URL).
- **Solo Testing**: Click **Open 2nd Player Tab** or **+ Add Bot Friend** inside any lobby!

## Included Game Cartridges

| Code | Title | Genre | Color Pillar | Description |
| :--- | :--- | :--- | :--- | :--- |
| `WRD-01` | **LexiForge** | Word Lab | Emerald | Forge words containing the target 2-letter sequence while avoiding the forbidden letter. |
| `MTH-02` | **Numera** | Math Engine | Amber | Combine 4 number tiles with `+, −, ×, ÷` to hit the exact target number. |
| `VIZ-03` | **Proportion Eye** | Visualization | Sky Blue | Eyeball the exact percentage of highlighted cells in a 10×10 data mosaic. |
| `PZL-04` | **Memory Matrix** | Spatial Puzzle | Violet | Memorize a flashing 4×4 constellation in 3.8s and reconstruct it from memory. |

## How to Add a New `dlo` Game Cartridge

1. **Define your puzzle state** in [`src/types/game.ts`](src/types/game.ts) and add its ID to `GameId`.
2. **Register the cartridge metadata** (title, category pillar, round duration, rules) in [`src/games/catalog.ts`](src/games/catalog.ts).
3. **Add generator & scoring logic** inside [`server/gameEngine.ts`](server/gameEngine.ts) (`generatePuzzle` & `evaluateSubmission`).
4. **Create the interactive React stage** inside `src/components/stages/` using the shared `.tactile-card` and `.tactile-btn` design classes.

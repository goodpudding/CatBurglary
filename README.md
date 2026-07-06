# Cat Burglary

A push-your-luck sneak game for Reddit (Devvit Web) and local play. You are a stray cat who slips in through the kitchen window, grabs treats from furniture, and escapes back out to bank your score — but the old lady patrols with her slipper, and three hits ends the run.

Built with **Phaser 3**, **Phaser Editor 2D**, **TypeScript**, **Vite**, and **Devvit**.

## Requirements

- **Node.js 22.2+** (required by Devvit)
- A Reddit account linked at [developers.reddit.com](https://developers.reddit.com)

## Run on Reddit (recommended)

```bash
npm install
npm run login    # once — links Reddit developer account
npm run dev      # devvit playtest — opens a test subreddit
```

Follow the playtest URL in the terminal, click **Launch App** / **Play**, then expand into the full game.

Moderators can create posts via the subreddit menu: **Create Cat Burglary post**.

## Run locally (no Reddit)

```bash
npm install
npm run dev:local
```

Opens `game.html` in the browser and boots straight into the house level.

## Phaser Editor workflow

1. Run `npm run dev:local` (Vite on port 5173).
2. Open this project in **Phaser Editor 2D** (`phasereditor2d.config.json` points play URL to `http://localhost:5173/game.html`).
3. Edit [`src/client/scenes/HouseLevel.scene`](src/client/scenes/HouseLevel.scene) — place furniture, floor rectangles, and the `player` ArcadeSprite spawn.
4. Compile the scene in the editor (updates `HouseLevel.ts`).
5. Press **Play** in the editor to preview in the browser.

**Layout** lives in the editor scene; **gameplay** (treats, old lady, lives, banking at the window) lives in [`src/client/scenes/SneakGame.ts`](src/client/scenes/SneakGame.ts), started from `HouseLevel` user-code after `editorCreate()`.

## Build & deploy

```bash
npm run build      # builds client + server for Devvit
npm run deploy     # upload to Reddit
npm run launch     # submit for review
```

## Project structure

```
src/
├── client/          # Phaser webview (HouseLevel scene, SneakGame, splash)
├── server/          # Hono API — Reddit post creation
└── shared/          # Shared types (cat roster for future use)
devvit.json          # Reddit app configuration
```

### Key modules

| Module | Path | Role |
|--------|------|------|
| **HouseLevel** | `src/client/scenes/HouseLevel.scene` | Editor-driven room layout |
| **SneakGame** | `src/client/scenes/SneakGame.ts` | Treats, slipper lady, banking, HUD |
| **CatDefinition** | `src/shared/CatDefinition.ts` | Cat roster (for future cat selection) |

## Gameplay

```
Reddit splash (inline) → Play → expanded game → HouseLevel + SneakGame
```

**Goal:** Collect treats from furniture (higher = more points = more risk). Return to the **kitchen window** spawn to bank carried points. Three slipper hits from the old lady ends the run and you lose whatever you were still carrying.

**Controls:** ← → move, Space / ↑ jump. Touch controls on mobile.

**Rooms (current layout):** Kitchen (entry/window) → Dining → Living room (deepest, highest risk).

## API (server)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/init` | GET | Reddit username + post context |

## Assets

Furniture and cat sprites are exported from Aseprite sources in `assests/`. **Run this before your first playtest** (and after art changes):

```bash
npm run export-assets
```

This writes PNGs to `src/client/assets/furniture/` and `src/client/assets/cats/`.

Phaser Editor generates preload paths like `client/assets/...`, but the game loads packs from the Vite public root (`cats/cat-asset-pack.json`, `asset-pack.json`) via [`preloadHouseAssets.ts`](src/client/assets/preloadHouseAssets.ts). Local dev also rewrites `/client/assets/*` for editor compatibility.

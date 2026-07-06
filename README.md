# Cat Burglary

A push-your-luck sneak game for Reddit (Devvit Web) and local play. You are a stray cat working your way through a house room by room, grabbing treats from furniture — but granny patrols each room with her slipper. Crossing each room's forward exit banks whatever you're carrying; getting hit drops it. Three hits ends the run.

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

Opens `game.html` in the browser and boots straight into the first room.

## Phaser Editor workflow

1. Run `npm run dev:local` (Vite on port 5173).
2. Open this project in **Phaser Editor 2D** (`phasereditor2d.config.json` points play URL to `http://localhost:5173/game.html`).
3. Edit a room scene (`src/client/scenes/KitchenRoom.scene`, `LivingRoomRoom.scene`, `HallwayRoom.scene`, `BathroomRoom.scene`) — place furniture, floor rectangles, the `player` ArcadeSprite spawn, `granny`, an `exit` rectangle, and optional `treat_N` markers.
4. Compile the scene in the editor (updates the matching `*.ts`).
5. Press **Play** in the editor to preview in the browser.

**Layout** lives in the editor scenes; **gameplay** (treats, granny AI, lives, banking at the exit) lives in [`src/client/scenes/SneakGame.ts`](src/client/scenes/SneakGame.ts), which every room scene hands control to with its `RoomConfig`.

## Build & deploy

```bash
npm run build      # builds client + server for Devvit
npm run deploy     # upload to Reddit
npm run launch     # submit for review
```

## Project structure

```
src/
├── client/          # Phaser webview (room scenes, sneak systems, splash + shop)
├── server/          # Hono API — profiles, coins, shop, post creation
└── shared/          # Types + catalogs shared by client and server
devvit.json          # Reddit app configuration
```

### Key modules

| Module | Path | Role |
|--------|------|------|
| **Room scenes** | `src/client/scenes/*Room.scene` / `.ts` | Editor-driven per-room layout |
| **SneakGame** | `src/client/scenes/SneakGame.ts` | Per-room driver: treats, granny, banking, HUD |
| **Sneak systems** | `src/client/game/sneak/` | Stealth cone, slipper, granny AI, platforms, run state |
| **Room configs** | `src/client/game/sneak/roomConfig.ts` | Room order + difficulty multipliers |
| **Player API** | `src/client/api/playerApi.ts` | Server sync with localStorage fallback |
| **Profiles** | `src/shared/playerProfile.ts` | Coins, owned cats/cosmetics, validation |

## Gameplay

```
Reddit splash (inline) → Play → expanded game → BootScene → KitchenRoom → ... → BathroomRoom
```

**Goal:** Collect treats from furniture, then cross the room's forward exit to bank them and move into the next (harder) room. Getting hit — a chase touch or a thrown slipper — costs a life and drops everything you're carrying. Three hits ends the run; clearing the final room wins it. Banked score converts to coins for cats and cosmetics in the shop.

**Stealth:** Granny has a vision cone with line-of-sight (furniture blocks it). Being seen fills a detection meter — suspicious, then searching, then full alert (chase + slipper throws). Crouching makes you slower but much harder to spot.

**Controls:** ← → move, Space / ↑ jump, Shift crouch, double-tap ↓/S to drop through shelves. Touch controls on mobile.

**Rooms (current order):** Kitchen → Living Room → Hallway → Bathroom (deepest, highest risk).

## API (server)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/init` | GET | Reddit username + post context |
| `/api/profile` | GET | Player profile (coins, cats, cosmetics) |
| `/api/run-complete` | POST | Bank a finished run's score as coins |
| `/api/select-cat` | POST | Set the active cat |
| `/api/unlock-cat` | POST | Buy a cat with coins |
| `/api/shop` | GET | Shop view (items + coin balance) |
| `/api/shop/buy` | POST | Buy a cosmetic |
| `/api/shop/equip` | POST | Equip/unequip a cosmetic |

All state is per-user in Redis; the client falls back to localStorage when logged out or playing locally.

## Assets

Furniture and cat sprites are exported from Aseprite sources in `assets/`. **Run this before your first playtest** (and after art changes):

```bash
npm run export-assets
```

This writes PNGs to `src/client/assets/furniture/` and `src/client/assets/cats/`.

Phaser Editor generates preload paths like `client/assets/...`, but the game loads packs from the Vite public root (`cats/cat-asset-pack.json`, `asset-pack.json`) via [`preloadHouseAssets.ts`](src/client/assets/preloadHouseAssets.ts). Local dev also rewrites `/client/assets/*` for editor compatibility.

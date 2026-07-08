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

## Help out (for friends)

Want to pitch in? You do not need Reddit access to get started — most work happens locally in the browser or Phaser Editor.

### 1. Get the project running

```bash
git clone https://github.com/goodpudding/CatBurglary.git
cd CatBurglary
npm install
npm run dev:local
```

| URL | What it is |
|-----|------------|
| `http://localhost:5173/splash.html` | Cat picker, shop, **Play** button |
| `http://localhost:5173/game.html` | Jump straight into the first room |

After changing Aseprite sources in `assets/`, run `npm run export-assets` so PNGs land in `src/client/assets/cats/` and `src/client/assets/furniture/`.

### 2. Pick something to work on

| If you like… | Try this… |
|--------------|-----------|
| **Pixel art / animation** | Add or polish cat sheets in `assets/Cats/` or furniture in `assets/`, export with `npm run export-assets`, register frames in `src/client/assets/cats/manifest.json` and `cat-animations.json` |
| **Level design** | Open a `*Room.scene` file in Phaser Editor — place floor/surface rectangles, furniture, granny spawn, exit, treat markers, and optional `Chihuahua` prefabs. Compile to update the matching `.ts` |
| **Game feel** | Tune numbers in `src/client/game/sneak/constants.ts`, `roomConfig.ts`, or cat stats in `src/shared/CatDefinition.ts` |
| **UI / splash** | Edit `splash.html`, `splash.css`, `splashCatPicker.ts`, or `splashShop.ts` |
| **Bugs & balance** | Play a full run, note what felt wrong (room, granny, dog, controls), and fix or file an issue |

**Editor object names matter** — the sneak systems look for these labels on scene objects:

- `floor` — walkable ground (Rectangle + static body)
- `surface` — shelves you can jump on
- `exit` — forward doorway (Rectangle, no body)
- `player` — cat spawn
- `granny` — granny spawn
- `treat_10` / `treat_15` — optional treat value markers
- `chihuahua` — guard dog (uses the `Chihuahua` prefab + script)

Gameplay logic lives in `src/client/game/sneak/` and `SneakGame.ts`; room scenes should mostly be layout.

### 3. Test your changes

```bash
npm run type-check   # TypeScript must pass before deploy
npm run build        # production build smoke test
```

Play on splash (`/splash.html`) to check cat picker animations and shop, then run a full house on `/game.html`.

### 4. Share your work

1. Create a branch: `git checkout -b your-name/short-description`
2. Commit with a clear message (what changed and why)
3. Push and open a pull request on GitHub, or send James the branch name

Keep changes focused — one room, one cat, or one bug fix per PR is easiest to review.

### 5. Try it on Reddit (optional)

Only needed if you want to test inside Reddit’s webview:

```bash
npm run login        # once — Reddit developer account
npm run dev          # playtest on r/cat_burglary_dev
```

James runs `npm run deploy` to upload builds to the Devvit app. You do not need deploy access to contribute art, rooms, or code via pull request.

Questions? Open a GitHub issue or ping James with what you tried and a screenshot if something looks off.

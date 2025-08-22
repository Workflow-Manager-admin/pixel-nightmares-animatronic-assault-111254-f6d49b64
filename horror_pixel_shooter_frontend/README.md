# Pixel Nightmares: Animatronic Assault (Frontend)

A retro 2D pixelated horror shooter built with React (Create React App). Survive waves of animatronic enemies, unlock weapons, face a boss, and uncover hidden lore.

## Features

- 2D Canvas rendering with retro pixel style and CRT scanline effect
- Player controls: WASD/Arrows to move, Mouse to aim, Left click to shoot
- Weapons:
  - Taser (default, infinite ammo)
  - AK-47 (unlocks at 5 kills)
  - RPG (unlocks at 10 kills)
- Enemy AI: animatronics chase player; boss fights with projectiles and contact damage
- Jump scare triggers and ambient audio
- HUD overlay: health, ammo, weapon slots, score, time, boss health
- Main menu and game over screens
- Hidden lore overlay with cryptic story fragments
- Theme and audio toggles

## Getting Started

Install dependencies and run:

```bash
npm install
npm start
```

Open http://localhost:3000 in your browser.

## Controls

- Move: WASD / Arrow Keys
- Shoot: Left Mouse Button
- Switch Weapon: 1 (Taser), 2 (AK-47), 3 (RPG)
- Toggle Lore Overlay: 📜 button (top-right)
- Toggle Theme/Audio: controls at top-right

## Environment Variables (optional)

You can provide URLs for audio assets. Create a `.env` file in the project root with any of these:

```
REACT_APP_AMBIENT_URL=<url_to_ambient_loop_audio>
REACT_APP_JUMPSCARE_URL=<url_to_jumpscare_sfx>
REACT_APP_TASER_URL=<url_to_taser_sfx>
REACT_APP_AK_URL=<url_to_ak47_sfx>
REACT_APP_RPG_URL=<url_to_rpg_sfx>
REACT_APP_HIT_URL=<url_to_player_hit_sfx>
REACT_APP_ENEMY_DOWN_URL=<url_to_enemy_down_sfx>
REACT_APP_BOSS_ROAR_URL=<url_to_boss_roar_sfx>
```

If not provided, the game runs silently.

You may also inspect and tweak base parameters in `src/game/Game.js` (world size, speeds, damage values).

## Project Structure

- `src/game/` core engine logic: Game loop, rendering, weapons, input, utils
- `src/ui/` overlays: HUD, MainMenu, GameOver, LoreOverlay
- `src/audio/` audio context and playback
- `src/theme/` theme context
- `src/App.js` composition of providers and screens
- `src/App.css` styles and theme variables

## Notes

- This is a self-contained frontend; no backend required.
- Assets are procedural/minimalistic to keep dependencies low.
- This project uses no additional runtime libraries beyond React and CRA.

## License

MIT

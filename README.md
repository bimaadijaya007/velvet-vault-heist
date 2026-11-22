# velvet-vault-heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/bimaadijaya007/velvet-vault-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/bimaadijaya007/velvet-vault-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Velvet Vault** — a top-down stealth heist in a single museum room. Slip in through
the door at the bottom, steal the glowing **Star Sapphire** from the vault, grab
optional loot (paintings, coin stacks), and escape out the exit — all while three
patrolling guards sweep their vision cones across the floor, two security cameras
sweep red cones over the room, and every second you're seen pushes the alarm meter
toward 100% (BUSTED).

## How to play

- **WASD / arrow keys** — move. **SHIFT** — sneak (half speed, alarm rises half as fast).
- Stay out of the yellow guard cones and red camera cones. Pillars, display tables
  and the vault block line of sight — hide behind them.
- Guards who spot you up close give chase; lose them for 2 seconds and they go back
  to patrol.
- **P / Esc** pause, **M** mute, **R** restart, **Enter / click** to start.
- Score = loot value + time bonus (par 90 s) + quiet bonus (low alarm at escape).

## Run it

```sh
python3 -m http.server 8000 --directory game
# then open http://127.0.0.1:8000/index.html
```

Or build the submission dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

No libraries, no external assets, no network requests — pure Canvas 2D + WebAudio synth.

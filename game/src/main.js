// Velvet Vault — game loop + state machine (title / playing / win / busted / paused).
import { W, H, PLAYER_R, WALK_SPEED, SNEAK_SPEED, ALARM_MAX, ALARM_GUARD_RATE, ALARM_CAM_RATE, ALARM_CHASE_RATE, ALARM_DECAY, PAR_TIME, PICKUP_DIST, GUARD_CATCH_DIST } from './config.js';
import { createInput, takePressed } from './input.js';
import { createLoot, createGuards, createCameras, PLAYER_START, OBSTACLES, DOOR, moveCircle } from './world.js';
import { updateGuard, updateCamera, cameraSeesPlayer } from './guards.js';
import { createSfx } from './audio.js';
import { draw } from './render.js';
import { setupShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const input = createInput(canvas);
const sfx = createSfx();

function freshState() {
  return {
    mode: 'title',
    time: 0,
    elapsed: 0,
    alarm: 0,
    status: 'CALM',
    player: { x: PLAYER_START.x, y: PLAYER_START.y, dir: -Math.PI / 2, sneak: false, hasSapphire: false },
    guards: createGuards(),
    cameras: createCameras(),
    loot: createLoot(),
    winScore: { loot: 0, timeBonus: 0, quietBonus: 0, total: 0 },
    _alarmTick: 0,
  };
}

let state = freshState();

function startGame() {
  state = freshState();
  state.mode = 'playing';
  sfx.ensure();
}

function computeWinScore() {
  const lootScore = state.loot.reduce((s, l) => s + (l.taken ? l.value : 0), 0);
  const timeBonus = Math.max(0, Math.round((PAR_TIME - state.elapsed) * 5));
  const quietBonus = Math.round((ALARM_MAX - state.alarm) * 2);
  return { loot: lootScore, timeBonus, quietBonus, total: lootScore + timeBonus + quietBonus };
}

function update(dt) {
  state.time += dt;
  if (state.mode !== 'playing') return;
  state.elapsed += dt;

  // Player movement.
  const axis = input.axis();
  const sneak = input.sneak();
  const speed = sneak ? SNEAK_SPEED : WALK_SPEED;
  state.player.sneak = sneak && (axis.x !== 0 || axis.y !== 0);
  if (axis.x !== 0 || axis.y !== 0) {
    state.player.dir = Math.atan2(axis.y, axis.x);
    const next = moveCircle(state.player, axis.x * speed * dt, axis.y * speed * dt, PLAYER_R, OBSTACLES);
    // Keep the thief inside the room: without the sapphire the exit gap would
    // otherwise let the player walk off the bottom edge of the canvas.
    state.player.x = Math.max(PLAYER_R, Math.min(W - PLAYER_R, next.x));
    state.player.y = Math.max(PLAYER_R, Math.min(H - PLAYER_R, next.y));
  }

  // Loot pickup.
  for (const item of state.loot) {
    if (item.taken) continue;
    if (Math.hypot(item.x - state.player.x, item.y - state.player.y) < PICKUP_DIST) {
      item.taken = true;
      if (item.kind === 'sapphire') {
        state.player.hasSapphire = true;
        sfx.sapphire();
      } else {
        sfx.pickup();
      }
    }
  }

  // Win: sapphire in hand + reach the exit door.
  if (state.player.hasSapphire && state.player.y > H - 46 &&
      state.player.x > DOOR.x0 + 6 && state.player.x < DOOR.x1 - 6) {
    state.winScore = computeWinScore();
    state.mode = 'win';
    sfx.win();
    return;
  }

  // Guards + cameras.
  let chasing = false;
  let seen = false;
  for (const g of state.guards) {
    const s = updateGuard(g, state.player, dt);
    if (s === 'chase') chasing = true;
    if (g.seesPlayer) seen = true;
    if (Math.hypot(g.x - state.player.x, g.y - state.player.y) < GUARD_CATCH_DIST) {
      state.alarm = ALARM_MAX;
    }
  }
  let camSeen = false;
  for (const cam of state.cameras) {
    updateCamera(cam, state.time);
    cam.seesPlayer = cameraSeesPlayer(cam, state.player);
    if (cam.seesPlayer) camSeen = true;
  }

  // Alarm meter.
  let rate = 0;
  if (seen) rate += ALARM_GUARD_RATE;
  if (camSeen) rate += ALARM_CAM_RATE;
  if (chasing) rate += ALARM_CHASE_RATE;
  if (rate > 0) {
    if (sneak) rate *= 0.5;
    state.alarm = Math.min(ALARM_MAX, state.alarm + rate * dt);
    state._alarmTick += dt;
    if (state._alarmTick > 0.7) { state._alarmTick = 0; sfx.alarmTick(); }
  } else {
    state.alarm = Math.max(0, state.alarm - ALARM_DECAY * dt);
  }
  state.status = chasing ? 'CHASE' : (seen || camSeen) ? 'ALERT' : 'CALM';

  if (state.alarm >= ALARM_MAX) {
    state.mode = 'busted';
    sfx.busted();
  }
}

function handleKeys() {
  const k = takePressed(input);
  if (!k) return;
  if (k === 'm') { sfx.toggleMute(); return; }
  if (state.mode === 'title' && (k === 'enter' || k === ' ')) { startGame(); return; }
  if ((state.mode === 'win' || state.mode === 'busted') && (k === 'r' || k === 'enter' || k === ' ')) { startGame(); return; }
  if (state.mode === 'playing' && (k === 'p' || k === 'escape')) { state.mode = 'paused'; return; }
  if (state.mode === 'paused' && (k === 'p' || k === 'escape')) { state.mode = 'playing'; return; }
  if (state.mode === 'playing' && k === 'r') { startGame(); }
}

function handleClick() {
  if (!input.consumeClick()) return;
  sfx.ensure();
  if (state.mode === 'title' || state.mode === 'win' || state.mode === 'busted') startGame();
}

// ---- boot ----
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  // Staged deterministic screenshot mode: render one frozen frame, no loop.
  setupShot(state, shot);
  draw(ctx, state);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    handleKeys();
    handleClick();
    update(dt);
    draw(ctx, state);
    requestAnimationFrame(frame);
  }
  draw(ctx, state);
  requestAnimationFrame(frame);
}

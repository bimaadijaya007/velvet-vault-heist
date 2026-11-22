// Deterministic staged states for ?shot=<name>&seed=1.
// Each shot renders one frozen frame: fixed positions, fixed alarm, no randomness.
import { createGuards, createCameras, createLoot } from './world.js';

function baseState(state) {
  state.mode = 'playing';
  state.elapsed = 0;
  state.time = 1.0; // frozen animation clock so pulses are identical every run
  state.alarm = 0;
  state.status = 'CALM';
  state.guards = createGuards();
  state.cameras = createCameras();
  state.loot = createLoot();
  state.player = { x: 640, y: 655, dir: -Math.PI / 2, sneak: false, hasSapphire: false };
  state.winScore = { loot: 0, timeBonus: 0, quietBonus: 0, total: 0 };
}

export const SHOT_NAMES = ['start', 'play', 'chase', 'end'];

export function setupShot(state, name) {
  baseState(state);
  if (name === 'start') {
    state.mode = 'title';
    state.alarm = 0;
    // Guards at their patrol starts, cameras at base angles — the calm before.
    return;
  }
  if (name === 'play') {
    // Mid-heist: thief crouched behind a display table, a guard cone sweeping
    // close by, a camera cone cutting the room, sapphire glowing, alarm 35%.
    state.player = { x: 615, y: 452, dir: -Math.PI / 2, sneak: true, hasSapphire: false };
    state.alarm = 35;
    state.status = 'ALERT';
    state.elapsed = 41;
    state.guards[0].x = 700; state.guards[0].y = 250; state.guards[0].dir = 1.15; state.guards[0].seesPlayer = true;
    state.guards[1].x = 1080; state.guards[1].y = 330; state.guards[1].dir = Math.PI; state.guards[1].seesPlayer = false;
    state.guards[2].x = 520; state.guards[2].y = 610; state.guards[2].dir = 0; state.guards[2].seesPlayer = false;
    state.cameras[0].angle = 0.75; state.cameras[0].seesPlayer = false;
    state.cameras[1].angle = Math.PI - 0.9; state.cameras[1].seesPlayer = false;
    state.loot[4].taken = true; // one coin stack already pocketed
    return;
  }
  if (name === 'chase') {
    // Tense moment: guard closing in near the sapphire, alarm 78% and flashing.
    state.player = { x: 640, y: 205, dir: -Math.PI / 2, sneak: false, hasSapphire: false };
    state.alarm = 78;
    state.status = 'CHASE';
    state.elapsed = 63;
    state.guards[0].x = 640; state.guards[0].y = 285; state.guards[0].dir = -Math.PI / 2;
    state.guards[0].state = 'chase'; state.guards[0].seesPlayer = true;
    state.guards[1].x = 1080; state.guards[1].y = 240; state.guards[1].dir = Math.PI / 2; state.guards[1].seesPlayer = false;
    state.guards[2].x = 700; state.guards[2].y = 610; state.guards[2].dir = Math.PI; state.guards[2].seesPlayer = false;
    state.cameras[0].angle = 0.4; state.cameras[0].seesPlayer = false;
    state.cameras[1].angle = Math.PI - 0.6; state.cameras[1].seesPlayer = true;
    state.loot[1].taken = true;
    state.loot[4].taken = true;
    return;
  }
  if (name === 'end') {
    // Clean getaway: thief at the exit carrying the sapphire, win screen up.
    state.mode = 'win';
    state.player = { x: 640, y: 668, dir: Math.PI / 2, sneak: false, hasSapphire: true };
    state.alarm = 12;
    state.status = 'CALM';
    state.elapsed = 74;
    state.loot[0].taken = true;
    state.loot[1].taken = true;
    state.loot[4].taken = true;
    state.loot[5].taken = true;
    state.winScore = { loot: 950, timeBonus: 80, quietBonus: 176, total: 1206 };
    state.guards[0].x = 420; state.guards[0].y = 210; state.guards[0].dir = Math.PI;
    state.guards[1].x = 1080; state.guards[1].y = 420; state.guards[1].dir = -Math.PI / 2;
    state.guards[2].x = 860; state.guards[2].y = 610; state.guards[2].dir = 0;
    state.cameras[0].angle = 0.2;
    state.cameras[1].angle = Math.PI - 1.1;
    return;
  }
  // Unknown shot name: fall back to the mid-heist frame.
  setupShot(state, 'play');
}

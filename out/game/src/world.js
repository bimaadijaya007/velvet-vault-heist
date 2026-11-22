// Level data for the Velvet Vault: one room, 1280x720, no scrolling.
// Coordinates are pixels. Walls, pillars, tables and the vault block both
// movement and line-of-sight; the velvet rope blocks movement only.
import { W, H, WALL_T } from './config.js';

export const DOOR = { x0: 600, x1: 680, y: H - WALL_T };

export const VAULT = { x: 540, y: WALL_T, w: 200, h: 96 };

export const PILLARS = [
  { x: 330, y: 250, w: 46, h: 46 },
  { x: 904, y: 250, w: 46, h: 46 },
];

export const TABLES = [
  { x: 470, y: 360, w: 110, h: 56 },
  { x: 700, y: 360, w: 110, h: 56 },
  { x: 470, y: 520, w: 110, h: 56 },
  { x: 700, y: 520, w: 110, h: 56 },
];

export const ROPES = [
  { x: 300, y: 428, w: 240, h: 8 },
  { x: 740, y: 428, w: 240, h: 8 },
];

// Paintings are wall decor; three of them are loot (see LOOT below).
export const PAINTINGS = [
  { x: 34, y: 150, w: 14, h: 64, hue: '#c94f4f', loot: true },
  { x: 34, y: 520, w: 14, h: 64, hue: '#4f7ec9', loot: true },
  { x: 1232, y: 330, w: 14, h: 64, hue: '#c9a44f', loot: true },
  { x: 1232, y: 130, w: 14, h: 64, hue: '#6fbf6a', loot: false },
];

export const CARPET = { x: 596, y: 120, w: 88, h: H - WALL_T - 120 };

export const OBSTACLES = [
  { x: 0, y: 0, w: W, h: WALL_T }, // top wall
  { x: 0, y: 0, w: WALL_T, h: H }, // left wall
  { x: W - WALL_T, y: 0, w: WALL_T, h: H }, // right wall
  { x: 0, y: H - WALL_T, w: DOOR.x0, h: WALL_T }, // bottom wall, left of door
  { x: DOOR.x1, y: H - WALL_T, w: W - DOOR.x1, h: WALL_T }, // bottom wall, right of door
  VAULT,
  ...PILLARS,
  ...TABLES,
  ...ROPES,
];

// Rects that block line-of-sight (interior furniture + vault only).
export const LOS_BLOCKERS = [VAULT, ...PILLARS, ...TABLES];

export function createLoot() {
  return [
    { kind: 'sapphire', x: 640, y: 142, taken: false, value: 500 },
    { kind: 'painting', x: 52, y: 182, taken: false, value: 150 },
    { kind: 'painting', x: 52, y: 552, taken: false, value: 150 },
    { kind: 'painting', x: 1228, y: 362, taken: false, value: 150 },
    { kind: 'coins', x: 200, y: 480, taken: false, value: 100 },
    { kind: 'coins', x: 1080, y: 480, taken: false, value: 100 },
    { kind: 'coins', x: 640, y: 300, taken: false, value: 100 },
  ];
}

export function createGuards() {
  return [
    {
      id: 1, x: 380, y: 210, dir: 0, state: 'patrol', wait: 0, wp: 0,
      loseTimer: 0, seesPlayer: false,
      path: [{ x: 380, y: 210 }, { x: 900, y: 210 }],
    },
    {
      id: 2, x: 1080, y: 180, dir: Math.PI / 2, state: 'patrol', wait: 0, wp: 0,
      loseTimer: 0, seesPlayer: false,
      path: [{ x: 1080, y: 180 }, { x: 1080, y: 520 }],
    },
    {
      id: 3, x: 380, y: 610, dir: 0, state: 'patrol', wait: 0, wp: 0,
      loseTimer: 0, seesPlayer: false,
      path: [{ x: 380, y: 610 }, { x: 900, y: 610 }],
    },
  ];
}

export function createCameras() {
  return [
    { id: 'A', x: 30, y: 130, base: 0.45, angle: 0.45, seesPlayer: false },
    { id: 'B', x: 1250, y: 580, base: Math.PI - 0.45, angle: Math.PI - 0.45, seesPlayer: false },
  ];
}

export const PLAYER_START = { x: 640, y: 655 };

// Circle (px, py, radius) vs rect collision test.
export function circleHitsRect(px, py, r, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy < r * r;
}

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

// Move a circle with axis-separated collision so it slides along obstacles.
export function moveCircle(pos, dx, dy, r, obstacles) {
  let nx = pos.x + dx;
  for (const o of obstacles) {
    if (circleHitsRect(nx, pos.y, r, o)) { nx = pos.x; break; }
  }
  let ny = pos.y + dy;
  for (const o of obstacles) {
    if (circleHitsRect(nx, ny, r, o)) { ny = pos.y; break; }
  }
  return { x: nx, y: ny };
}

// Guard patrol, vision cones, line-of-sight and chase behaviour.
import {
  GUARD_RANGE, GUARD_HALF_ANGLE, GUARD_SPOT_DIST, GUARD_CATCH_DIST,
  GUARD_LOSE_TIME, GUARD_WAIT_TIME, GUARD_SPEED, CHASE_SPEED,
  CAM_RANGE, CAM_HALF_ANGLE, CAM_SWEEP, CAM_SWEEP_SPEED,
} from './config.js';
import { LOS_BLOCKERS, moveCircle, pointInRect } from './world.js';

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// Segment vs interior blockers, sampled. Returns true when the view is blocked.
export function losBlocked(x1, y1, x2, y2) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(2, Math.ceil(dist / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    for (const b of LOS_BLOCKERS) {
      if (pointInRect(px, py, b)) return true;
    }
  }
  return false;
}

export function inCone(ox, oy, dir, range, halfAngle, tx, ty) {
  const dx = tx - ox;
  const dy = ty - oy;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (d < 1) return true;
  return Math.abs(angleDiff(Math.atan2(dy, dx), dir)) <= halfAngle;
}

export function guardSeesPlayer(guard, player) {
  if (!inCone(guard.x, guard.y, guard.dir, GUARD_RANGE, GUARD_HALF_ANGLE, player.x, player.y)) return false;
  return !losBlocked(guard.x, guard.y, player.x, player.y);
}

export function cameraSeesPlayer(cam, player) {
  if (!inCone(cam.x, cam.y, cam.angle, CAM_RANGE, CAM_HALF_ANGLE, player.x, player.y)) return false;
  return !losBlocked(cam.x, cam.y, player.x, player.y);
}

function moveTowardGuard(guard, tx, ty, speed, dt) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return true;
  guard.dir = Math.atan2(dy, dx);
  const step = Math.min(d, speed * dt);
  const next = moveCircle(guard, (dx / d) * step, (dy / d) * step, 13, LOS_BLOCKERS);
  guard.x = next.x;
  guard.y = next.y;
  return d <= step + 0.5;
}

// Advance one guard. Returns 'chase' | 'patrol' for HUD status.
export function updateGuard(guard, player, dt) {
  const dist = Math.hypot(player.x - guard.x, player.y - guard.y);
  guard.seesPlayer = guardSeesPlayer(guard, player);

  if (guard.state === 'chase') {
    moveTowardGuard(guard, player.x, player.y, CHASE_SPEED, dt);
    if (guard.seesPlayer || dist < GUARD_SPOT_DIST) {
      guard.loseTimer = 0;
    } else {
      guard.loseTimer += dt;
      if (guard.loseTimer >= GUARD_LOSE_TIME) {
        guard.state = 'return';
        guard.loseTimer = 0;
      }
    }
    return guard.state;
  }

  if (dist < GUARD_SPOT_DIST) {
    guard.state = 'chase';
    guard.loseTimer = 0;
    return guard.state;
  }

  if (guard.state === 'return') {
    // Walk back to the nearest waypoint, then resume patrol.
    let best = 0;
    let bestD = Infinity;
    guard.path.forEach((p, i) => {
      const d = Math.hypot(p.x - guard.x, p.y - guard.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    guard.wp = best;
    if (moveTowardGuard(guard, guard.path[best].x, guard.path[best].y, GUARD_SPEED, dt)) {
      guard.state = 'patrol';
      guard.wait = GUARD_WAIT_TIME;
    }
    return guard.state;
  }

  // Patrol: walk the waypoint loop, pausing briefly at each point.
  if (guard.wait > 0) {
    guard.wait -= dt;
    if (guard.wait <= 0) guard.wp = (guard.wp + 1) % guard.path.length;
    return guard.state;
  }
  const target = guard.path[guard.wp];
  if (moveTowardGuard(guard, target.x, target.y, GUARD_SPEED, dt)) {
    guard.wait = GUARD_WAIT_TIME;
  }
  return guard.state;
}

export function updateCamera(cam, time) {
  cam.angle = cam.base + CAM_SWEEP * Math.sin(time * CAM_SWEEP_SPEED + (cam.id === 'B' ? 1.7 : 0));
}

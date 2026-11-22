// All Canvas 2D drawing: room, characters, vision cones, HUD and overlays.
import { W, H, WALL_T, ALARM_MAX, GUARD_RANGE, GUARD_HALF_ANGLE, CAM_RANGE, CAM_HALF_ANGLE } from './config.js';
import { VAULT, PILLARS, TABLES, ROPES, PAINTINGS, CARPET, DOOR } from './world.js';

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.font = `${weight} ${size}px Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function cone(ctx, x, y, dir, range, half, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - half, dir + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#10182e';
  ctx.fillRect(0, 0, W, H);
  // Marble checker.
  for (let gy = 0; gy < 9; gy++) {
    for (let gx = 0; gx < 16; gx++) {
      if ((gx + gy) % 2 === 0) {
        ctx.fillStyle = '#16213d';
        ctx.fillRect(gx * 80, gy * 80, 80, 80);
      }
    }
  }
  // Red carpet down the middle, from the vault to the door.
  ctx.fillStyle = '#7d1f2b';
  ctx.fillRect(CARPET.x, CARPET.y, CARPET.w, CARPET.h);
  ctx.fillStyle = '#932634';
  ctx.fillRect(CARPET.x + 6, CARPET.y, CARPET.w - 12, CARPET.h);
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2;
  ctx.strokeRect(CARPET.x + 2, CARPET.y, CARPET.w - 4, CARPET.h);
  // Walls with gold trim.
  ctx.fillStyle = '#0a0f22';
  ctx.fillRect(0, 0, W, WALL_T);
  ctx.fillRect(0, 0, WALL_T, H);
  ctx.fillRect(W - WALL_T, 0, WALL_T, H);
  ctx.fillRect(0, H - WALL_T, DOOR.x0, WALL_T);
  ctx.fillRect(DOOR.x1, H - WALL_T, W - DOOR.x1, WALL_T);
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);
  // Door opening, lit from outside.
  ctx.fillStyle = '#3d2c12';
  ctx.fillRect(DOOR.x0, H - WALL_T, DOOR.x1 - DOOR.x0, WALL_T);
  text(ctx, 'EXIT', (DOOR.x0 + DOOR.x1) / 2, H - WALL_T / 2 - 1, 13, '#ffd97a', 'center');
}

function drawVault(ctx, time, sapphireTaken) {
  ctx.fillStyle = '#8a6a1f';
  ctx.fillRect(VAULT.x, VAULT.y, VAULT.w, VAULT.h);
  ctx.fillStyle = '#c9a44f';
  ctx.fillRect(VAULT.x + 6, VAULT.y + 6, VAULT.w - 12, VAULT.h - 12);
  ctx.strokeStyle = '#5e4712';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(VAULT.x + VAULT.w / 2, VAULT.y + VAULT.h / 2, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#5e4712';
  ctx.beginPath();
  ctx.arc(VAULT.x + VAULT.w / 2, VAULT.y + VAULT.h / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'VAULT', VAULT.x + VAULT.w / 2, VAULT.y + VAULT.h - 12, 13, '#3d2c12', 'center');
  // Pedestal + Star Sapphire below the vault.
  ctx.fillStyle = '#e8e8f0';
  ctx.fillRect(622, 128, 36, 10);
  ctx.fillStyle = '#9aa0b5';
  ctx.fillRect(628, 138, 24, 8);
  if (!sapphireTaken) {
    const pulse = 0.7 + 0.3 * Math.sin(time * 3);
    const glow = ctx.createRadialGradient(640, 142, 2, 640, 142, 46 * pulse);
    glow.addColorStop(0, 'rgba(64,224,255,0.85)');
    glow.addColorStop(1, 'rgba(64,224,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(640, 142, 46 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40e0ff';
    ctx.beginPath();
    ctx.moveTo(640, 124);
    ctx.lineTo(656, 142);
    ctx.lineTo(640, 160);
    ctx.lineTo(624, 142);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d8fbff';
    ctx.beginPath();
    ctx.moveTo(640, 130);
    ctx.lineTo(650, 142);
    ctx.lineTo(640, 154);
    ctx.lineTo(630, 142);
    ctx.closePath();
    ctx.fill();
    text(ctx, 'STAR SAPPHIRE', 640, 176, 13, '#9beaff', 'center');
  }
}

function drawProps(ctx) {
  for (const p of PAINTINGS) {
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(p.x - 2, p.y - 2, p.w + 4, p.h + 4);
    ctx.fillStyle = p.hue;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x + 2, p.y + p.h - 6);
    ctx.lineTo(p.x + p.w - 2, p.y + 6);
    ctx.stroke();
  }
  for (const t of TABLES) {
    ctx.fillStyle = '#4a3220';
    ctx.fillRect(t.x, t.y, t.w, t.h);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(t.x + 4, t.y + 4, t.w - 8, t.h - 8);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(t.x + 6, t.y + 6, t.w - 12, 10);
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(t.x + t.w / 2, t.y + t.h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const p of PILLARS) {
    ctx.fillStyle = '#3d4a6b';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#5a6b94';
    ctx.fillRect(p.x + 5, p.y + 5, p.w - 10, p.h - 10);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }
  for (const r of ROPES) {
    ctx.strokeStyle = '#a31226';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + 4);
    ctx.quadraticCurveTo(r.x + r.w / 2, r.y + 16, r.x + r.w, r.y + 4);
    ctx.stroke();
    ctx.fillStyle = '#d9a441';
    for (const px of [r.x, r.x + r.w / 2, r.x + r.w]) {
      ctx.beginPath();
      ctx.arc(px, r.y + 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLoot(ctx, time, loot) {
  for (const item of loot) {
    if (item.taken || item.kind === 'sapphire') continue;
    const bob = Math.sin(time * 2 + item.x) * 2;
    if (item.kind === 'coins') {
      ctx.fillStyle = '#8a6a1f';
      ctx.beginPath();
      ctx.ellipse(item.x, item.y + 8, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd94a';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(item.x - 7 + i * 7, item.y + 2 - i * 3 + bob * 0.3, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#8a6a1f';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('$', item.x, item.y + 4);
    } else if (item.kind === 'painting') {
      const tw = 0.6 + 0.4 * Math.abs(Math.sin(time * 2 + item.y));
      ctx.fillStyle = `rgba(255,217,74,${0.35 + 0.45 * tw})`;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', item.x, item.y);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const cam of cameras) {
    cone(ctx, cam.x, cam.y, cam.angle, CAM_RANGE, CAM_HALF_ANGLE,
      cam.seesPlayer ? 'rgba(255,60,60,0.30)' : 'rgba(255,60,60,0.15)',
      cam.seesPlayer ? 'rgba(255,90,90,0.7)' : 'rgba(255,90,90,0.35)');
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cam.seesPlayer ? '#ff4040' : '#c03030';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'CAM ' + cam.id, cam.x + (cam.x < 640 ? 16 : -16), cam.y - 16, 11, '#ff8080', cam.x < 640 ? 'left' : 'right');
  }
}

function drawGuards(ctx, guards) {
  for (const g of guards) {
    const chasing = g.state === 'chase';
    const alert = g.seesPlayer || chasing;
    cone(ctx, g.x, g.y, g.dir, GUARD_RANGE, GUARD_HALF_ANGLE,
      chasing ? 'rgba(255,120,40,0.30)' : alert ? 'rgba(255,220,80,0.28)' : 'rgba(255,220,80,0.16)',
      chasing ? 'rgba(255,140,60,0.7)' : 'rgba(255,220,80,0.4)');
    // Shadow + body.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y + 12, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d2f5e';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16244a';
    ctx.fillRect(g.x - 10, g.y - 20, 20, 8);
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(g.x - 10, g.y - 13, 20, 2);
    // Facing tick.
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.dir) * 18, g.y + Math.sin(g.dir) * 18);
    ctx.stroke();
    if (chasing) text(ctx, '!', g.x, g.y - 28, 20, '#ff9040', 'center');
    else if (alert) text(ctx, '?', g.x, g.y - 28, 18, '#ffe050', 'center');
  }
}

function drawPlayer(ctx, player, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 12, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b0b12';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 2;
  ctx.stroke();
  // White mask stripe.
  ctx.strokeStyle = '#f2f2f2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(player.x - 8, player.y - 2);
  ctx.lineTo(player.x + 8, player.y - 2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(player.x - 5, player.y - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(player.x + 5, player.y - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  if (player.sneak) {
    text(ctx, 'SNEAK', player.x, player.y - 26, 10, '#9beaff', 'center');
  }
  if (player.hasSapphire) {
    const pulse = 0.7 + 0.3 * Math.sin(time * 4);
    ctx.fillStyle = `rgba(64,224,255,${0.5 * pulse})`;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#40e0ff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 22);
    ctx.lineTo(player.x + 6, player.y - 14);
    ctx.lineTo(player.x, player.y - 6);
    ctx.lineTo(player.x - 6, player.y - 14);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(4,6,16,0.82)';
  ctx.fillRect(0, 0, W, 46);
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(0, 46, W, 2);
  text(ctx, 'VELVET VAULT', 30, 24, 20, '#ffd97a');
  // Alarm bar.
  const bx = 470;
  const bw = 340;
  const frac = state.alarm / ALARM_MAX;
  const blink = state.alarm > 70 && Math.floor(state.time * 6) % 2 === 0;
  text(ctx, 'ALARM', bx - 8, 24, 14, blink ? '#ff5040' : '#fff', 'right');
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(bx, 12, bw, 22);
  const col = frac < 0.4 ? '#3fbf5a' : frac < 0.7 ? '#e8c832' : '#e8402f';
  ctx.fillStyle = blink ? '#ff5040' : col;
  ctx.fillRect(bx + 2, 14, Math.max(0, (bw - 4) * frac), 18);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, 12, bw, 22);
  text(ctx, Math.round(state.alarm) + '%', bx + bw / 2, 24, 13, '#fff', 'center');
  // Loot + timer + guard status.
  const taken = state.loot.filter((l) => l.taken).length;
  text(ctx, `LOOT ${taken}/7`, 848, 24, 15, '#ffd94a');
  const t = Math.floor(state.elapsed);
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  text(ctx, `TIME ${mm}:${ss}`, 942, 24, 15, '#fff');
  const status = state.status;
  const sc = status === 'CHASE' ? '#ff7040' : status === 'ALERT' ? '#ffe050' : '#7ddc8a';
  text(ctx, status, 1212, 24, 15, sc, 'center');
  text(ctx, 'GUARDS', 1108, 24, 12, '#9aa0b5', 'right');
}

function overlay(ctx, lines, title, titleColor) {
  ctx.fillStyle = 'rgba(4,6,16,0.80)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, title, W / 2, 210, 64, titleColor, 'center');
  let y = 300;
  for (const line of lines) {
    text(ctx, line.text, W / 2, y, line.size || 18, line.color || '#fff', 'center', line.weight || 'normal');
    y += line.gap || 34;
  }
}

export function draw(ctx, state) {
  drawFloor(ctx);
  drawVault(ctx, state.time, state.loot[0].taken);
  drawProps(ctx);
  drawLoot(ctx, state.time, state.loot);
  drawCameras(ctx, state.cameras);
  drawGuards(ctx, state.guards);
  drawPlayer(ctx, state.player, state.time);
  drawHud(ctx, state);

  if (state.mode === 'title') {
    overlay(ctx, [
      { text: 'Steal the Star Sapphire — then slip out the exit.', size: 22, color: '#ffd97a' },
      { text: 'WASD / arrows to move  •  SHIFT to sneak (slower, quieter)', size: 18 },
      { text: 'Avoid guard cones (yellow) and camera cones (red) — being seen raises the alarm.', size: 18 },
      { text: 'Grab the sapphire + optional loot. Alarm 100% = BUSTED.', size: 18 },
      { text: 'P / Esc pause  •  M mute  •  R restart', size: 16, color: '#9aa0b5' },
      { text: 'CLICK OR PRESS ENTER TO START', size: 22, color: '#7ddc8a', gap: 52 },
    ], 'VELVET VAULT', '#ffd97a');
  } else if (state.mode === 'win') {
    const s = state.winScore;
    overlay(ctx, [
      { text: 'You slipped out with the Star Sapphire.', size: 22, color: '#ffd97a' },
      { text: `Loot  ${s.loot}   •   Time bonus  ${s.timeBonus}   •   Quiet bonus  ${s.quietBonus}`, size: 19 },
      { text: `SCORE  ${s.total}`, size: 30, color: '#7ddc8a', gap: 48 },
      { text: 'Press R or click to play again', size: 17, color: '#9aa0b5' },
    ], 'CLEAN GETAWAY', '#7ddc8a');
  } else if (state.mode === 'busted') {
    overlay(ctx, [
      { text: 'The alarm hit 100% — the guards closed in.', size: 22, color: '#ff9a8a' },
      { text: `Loot grabbed: ${state.loot.filter((l) => l.taken).length} / 7`, size: 19 },
      { text: 'Press R or click to try again', size: 17, color: '#9aa0b5', gap: 48 },
    ], 'BUSTED!', '#ff5040');
  } else if (state.mode === 'paused') {
    overlay(ctx, [
      { text: 'Press P or Esc to resume', size: 19, color: '#9aa0b5' },
    ], 'PAUSED', '#fff');
  }
}

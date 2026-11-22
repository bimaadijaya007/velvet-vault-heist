// Keyboard + mouse input. No dependencies.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    keys,
    clicked: false,
    clickX: 0,
    clickY: 0,
    axis() {
      let x = 0;
      let y = 0;
      if (keys.has('arrowleft') || keys.has('a')) x -= 1;
      if (keys.has('arrowright') || keys.has('d')) x += 1;
      if (keys.has('arrowup') || keys.has('w')) y -= 1;
      if (keys.has('arrowdown') || keys.has('s')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.hypot(x, y);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    sneak() {
      return keys.has('shift');
    },
    consumeClick() {
      const c = input.clicked;
      input.clicked = false;
      return c;
    },
  };

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    keys.add(k);
    input._pressed = k;
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    input.clickX = ((e.clientX - r.left) / r.width) * canvas.width;
    input.clickY = ((e.clientY - r.top) / r.height) * canvas.height;
    input.clicked = true;
  });
  return input;
}

// Returns the key pressed since the last call (or null). Main loop polls this.
export function takePressed(input) {
  const k = input._pressed ?? null;
  input._pressed = null;
  return k;
}

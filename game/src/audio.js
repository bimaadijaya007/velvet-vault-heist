// Tiny WebAudio synth. No audio files; created only after a user gesture.
export function createSfx() {
  const sfx = {
    ctx: null,
    muted: false,
    ensure() {
      if (!sfx.ctx) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) sfx.ctx = new AC();
        } catch (e) { /* headless / no audio: stay silent */ }
      }
      if (sfx.ctx && sfx.ctx.state === 'suspended') sfx.ctx.resume().catch(() => {});
    },
    toggleMute() {
      sfx.muted = !sfx.muted;
      return sfx.muted;
    },
    tone(freq, dur, type, vol, when = 0) {
      if (sfx.muted || !sfx.ctx) return;
      try {
        const t0 = sfx.ctx.currentTime + when;
        const osc = sfx.ctx.createOscillator();
        const gain = sfx.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain).connect(sfx.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
      } catch (e) { /* ignore audio errors */ }
    },
    pickup() { sfx.tone(880, 0.12, 'sine', 0.12); sfx.tone(1318, 0.16, 'sine', 0.1, 0.07); },
    sapphire() {
      [523, 659, 784, 1046].forEach((f, i) => sfx.tone(f, 0.22, 'triangle', 0.12, i * 0.09));
    },
    alarmTick() { sfx.tone(220, 0.09, 'square', 0.05); },
    busted() {
      [392, 311, 233].forEach((f, i) => sfx.tone(f, 0.3, 'sawtooth', 0.09, i * 0.16));
    },
    win() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => sfx.tone(f, 0.28, 'triangle', 0.12, i * 0.11));
    },
  };
  return sfx;
}

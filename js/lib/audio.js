/**
 * Dźwięki (proste sygnały z Web Audio) i czytanie słów głosem przeglądarki.
 * `audio.enabled` włącza i wyłącza oba.
 */
export function createAudio(win) {
  let ac = null;
  const audio = { enabled: true };

  function tone(f, t0, d, type, g) {
    if (!audio.enabled) return;
    try {
      ac = ac || new (win.AudioContext || win.webkitAudioContext)();
      const o = ac.createOscillator();
      const gn = ac.createGain();
      o.type = type || 'sine';
      o.frequency.value = f;
      const t = ac.currentTime + t0;
      gn.gain.setValueAtTime(g || 0.14, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(gn);
      gn.connect(ac.destination);
      o.start(t);
      o.stop(t + d + 0.02);
    } catch { /* brak dźwięku nie może przerwać gry */ }
  }

  audio.sfx = {
    good() { tone(660, 0, 0.12); tone(880, 0.1, 0.18); },
    bad() { tone(200, 0, 0.22, 'triangle', 0.18); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.25)); }
  };

  audio.speak = function speak(text) {
    if (!audio.enabled || !text) return;
    try {
      if (!('speechSynthesis' in win)) return;
      win.speechSynthesis.cancel();
      const u = new win.SpeechSynthesisUtterance(text);
      u.lang = 'pl-PL';
      u.rate = 0.8;
      win.speechSynthesis.speak(u);
    } catch { /* brak głosu nie może przerwać gry */ }
  };

  return audio;
}

/**
 * Wspólny interfejs: przełączanie ekranów (sekcji) i okienko z nagrodą lub komunikatem.
 */
export function createUI(ctx) {
  const { doc, win, ri } = ctx;
  const stoppers = [];

  /** Rejestruje funkcję uruchamianą przy każdej zmianie ekranu (np. zatrzymanie zegarów gry). */
  function onLeave(fn) { stoppers.push(fn); }

  /** Pokazuje jeden ekran, resztę ukrywa i zatrzymuje to, co działa w tle. */
  function show(id) {
    for (const s of doc.querySelectorAll('#app > section')) s.hidden = (s.id !== id);
    stoppers.forEach((fn) => fn());
    try { if ('speechSynthesis' in win) win.speechSynthesis.cancel(); } catch { /* brak mowy */ }
    win.scrollTo(0, 0);
  }

  /** Okienko na całej scenie gry. Przycisk wywołuje `cb`; `confetti` dodaje konfetti. */
  function overlay(el, title, text, label, cb, confetti = false) {
    el.hidden = false;
    el.innerHTML = '<h2></h2><p></p><button type="button" class="big"></button>';
    el.querySelector('h2').textContent = title;
    el.querySelector('p').textContent = text;
    const btn = el.querySelector('button');
    btn.textContent = label;
    btn.addEventListener('click', () => { el.hidden = true; el.innerHTML = ''; cb(); });
    if (confetti) {
      const cols = ['#FF7A3D', '#4C9BF0', '#9B6BFF', '#2DB86B', '#FFC83D', '#E5484D'];
      const box = doc.createElement('div');
      box.className = 'confetti';
      for (let i = 0; i < 28; i++) {
        const c = doc.createElement('i');
        c.style.left = ri(2, 98) + '%';
        c.style.background = cols[i % cols.length];
        c.style.animationDelay = (Math.random() * 0.8) + 's';
        box.appendChild(c);
      }
      el.appendChild(box);
    }
    btn.focus();
  }

  return { show, overlay, onLeave };
}

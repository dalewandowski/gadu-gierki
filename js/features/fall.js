import { mathRound, sylRound, numMax } from '../lib/questions.js';

const DROP_COLORS = ['#FF7A3D', '#4C9BF0', '#9B6BFF', '#2DB86B'];
export const MAX_LEVEL = 20;
const DROP = 76; // średnica kulki w px, duża, żeby łatwo trafić palcem

/** Prędkość spadania w pikselach na sekundę. Bardzo wolna na starcie (dla 5-latka), rośnie z poziomem. */
export function fallSpeed(kind, level) {
  return kind === 'math' ? 19 + level * 3 : 17 + level * 2.5;
}

/** Poziom gry zależy od punktów: nowy poziom co 3 punkty, maksymalnie 20. */
export function levelFor(score) {
  return Math.min(MAX_LEVEL, 1 + Math.floor(score / 3));
}

/** Poziom trudności sylab (1-4) dla poziomu gry (1-20): co 3 poziomy trudniejsze sylaby. */
export function sylLevelFor(level) {
  return Math.min(4, 1 + Math.floor((level - 1) / 3));
}

/**
 * Gry „Łap cyfry" i „Łap sylabę": wspólny silnik. Cztery odpowiedzi spadają, a dziecko
 * łapie dobrą w koszyk albo ją klika.
 */
export function initFall(ctx) {
  const { $, doc, win, ri, state, store, audio, ui } = ctx;
  const { sfx, speak } = audio;
  const field = $('#field');
  const basket = $('#basket');
  const fall = { kind: 'math', running: false, lives: 5, score: 0, level: 1, items: [], q: null, bx: 0, raf: 0, last: 0, timer: 0 };

  const eqClass = (extra = '') => 'equation' + extra + (fall.kind === 'math' ? '' : ' syl');
  const fallCat = () => (fall.kind === 'syl' ? 'syl' : (fall.q.prompt.indexOf('+') >= 0 ? 'add' : 'sub'));

  function setBasket(x) {
    const w = field.clientWidth;
    fall.bx = Math.max(48, Math.min(w - 48, x));
    basket.style.transform = `translateX(${fall.bx - 48}px)`;
  }

  function renderFall() {
    let h = '';
    for (let i = 0; i < 5; i++) h += `<span class="${i < fall.lives ? '' : 'off'}">♥</span>`;
    $('#fallHearts').innerHTML = h;
    $('#fallScore').textContent = fall.score;
    fall.level = levelFor(fall.score);
    $('#fallLevel').textContent = `Poziom ${fall.level} z ${MAX_LEVEL}`;
  }

  function stopFall() {
    fall.running = false;
    win.cancelAnimationFrame(fall.raf);
    clearTimeout(fall.timer);
    fall.items.forEach((it) => it.el.remove());
    fall.items = [];
  }
  ui.onLeave(stopFall);

  function startFall(kind) {
    fall.kind = kind;
    ctx.show('fall');
    stopFall();
    fall.lives = 5;
    fall.score = 0;
    fall.level = 1;
    renderFall();
    setBasket(field.clientWidth / 2);
    const eq = $('#fallEq');
    const placeholder = state.op === 'sub' ? '? − ? = ?' : (state.op === 'mix' ? '? ± ? = ?' : '? + ? = ?');
    eq.textContent = kind === 'math' ? placeholder : 'Złap: ??';
    eq.className = eqClass();
    const title = kind === 'math' ? 'Łap cyfry!' : 'Łap sylaby!';
    const text = kind === 'math'
      ? 'Złap w koszyk cyfrę, która jest wynikiem. Przesuwaj koszyk palcem, myszką lub strzałkami. Możesz też kliknąć cyfrę.'
      : 'Złap w koszyk sylabę z polecenia. Przesuwaj koszyk palcem, myszką lub strzałkami. Możesz też kliknąć sylabę.';
    ctx.overlay($('#fallOverlay'), title, text, 'Graj', beginFall);
  }

  function beginFall() {
    fall.running = true;
    fall.last = win.performance.now();
    setBasket(field.clientWidth / 2);
    newRound();
    fall.raf = win.requestAnimationFrame(fallLoop);
  }

  function newRound() {
    if (!fall.running) return;
    const q = fall.kind === 'math' ? mathRound(state.op, numMax(fall.level)) : sylRound(sylLevelFor(fall.level));
    fall.q = q;
    const eq = $('#fallEq');
    eq.textContent = q.prompt;
    eq.className = eqClass();
    speak(q.say);
    const W = field.clientWidth;
    const slot = W / 4;
    q.opts.forEach((n, i) => {
      const el = doc.createElement('div');
      el.className = 'drop';
      el.textContent = n;
      el.style.borderColor = DROP_COLORS[i];
      const it = {
        el, n, correct: n === q.ans, done: false,
        x: Math.max(4, Math.min(W - DROP - 4, slot * i + slot / 2 - DROP / 2 + ri(-8, 8))),
        y: -DROP - 6 - ri(0, 70)
      };
      el.style.transform = `translate(${it.x}px,${it.y}px)`;
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (fall.running && !it.done) resolve(it);
      });
      field.appendChild(el);
      fall.items.push(it);
    });
  }

  function endRound() {
    fall.items.forEach((it) => { it.done = true; it.el.remove(); });
    fall.items = [];
    clearTimeout(fall.timer);
    fall.timer = setTimeout(newRound, 900);
  }

  function resolve(it) {
    it.done = true;
    ctx.rec(fallCat(), it.correct);
    const eq = $('#fallEq');
    if (it.correct) {
      fall.score++;
      renderFall();
      sfx.good();
      eq.textContent = fall.q.reveal;
      eq.className = eqClass(' good');
      endRound();
    } else {
      it.el.remove();
      loseLife();
    }
  }

  function loseLife() {
    fall.lives--;
    renderFall();
    sfx.bad();
    field.classList.remove('shake');
    void field.offsetWidth;
    field.classList.add('shake');
    if (fall.lives <= 0) gameOverFall();
  }

  /** Dobra odpowiedź spadła na ziemię. */
  function missed() {
    ctx.rec(fallCat(), false);
    const eq = $('#fallEq');
    eq.textContent = fall.q.reveal;
    eq.className = eqClass(' bad');
    loseLife();
    if (fall.running) endRound();
  }

  function gameOverFall() {
    const score = fall.score;
    const kind = fall.kind;
    const key = kind === 'math' ? 'bestFall' : 'bestSyl';
    stopFall();
    const best = store.get(key, 0);
    const isBest = score > best;
    if (isBest) store.set(key, score);
    ctx.overlay($('#fallOverlay'), isBest ? 'Nowy rekord!' : 'Koniec gry',
      `Zdobyte punkty: ${score}. Najlepszy wynik: ${Math.max(best, score)}.`,
      'Jeszcze raz', () => startFall(kind), isBest);
    if (isBest) sfx.win();
  }

  function fallLoop(ts) {
    if (!fall.running) return;
    const dt = Math.min(0.05, (ts - fall.last) / 1000 || 0);
    fall.last = ts;
    const H = field.clientHeight;
    const speed = fallSpeed(fall.kind, fall.level);
    const basketTop = H - 56;
    for (const it of fall.items.slice()) {
      if (it.done) continue;
      it.y += speed * dt;
      it.el.style.transform = `translate(${it.x}px,${it.y}px)`;
      if (it.y + DROP >= basketTop + 8 && it.y < H - 24 && Math.abs(it.x + DROP / 2 - fall.bx) < 66) {
        resolve(it);
      } else if (it.y > H) {
        it.done = true;
        it.el.remove();
        if (it.correct) missed();
      }
      if (!fall.running) return;
    }
    fall.raf = win.requestAnimationFrame(fallLoop);
  }

  const pointerToBasket = (e) => setBasket(e.clientX - field.getBoundingClientRect().left);
  field.addEventListener('pointermove', pointerToBasket);
  field.addEventListener('pointerdown', pointerToBasket);
  doc.addEventListener('keydown', (e) => {
    if ($('#fall').hidden || !fall.running) return;
    if (e.key === 'ArrowLeft') { setBasket(fall.bx - 52); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setBasket(fall.bx + 52); e.preventDefault(); }
  });
  win.addEventListener('resize', () => { if (!$('#fall').hidden) setBasket(fall.bx); });

  $('#goFall').addEventListener('click', () => startFall('math'));
  $('#goSyl').addEventListener('click', () => startFall('syl'));
}

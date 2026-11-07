import { GYM, SOUNDS } from '../data/words.js';
import { hl } from '../lib/util.js';

const FIND_QUESTIONS = 10;
const LG_VIEWS = ['lgHome', 'lgGym', 'lgPick', 'lgSay', 'lgFind'];

/**
 * Moduł „Buzia i język": gimnastyka buzi i języka, powtarzanie głosek (sylaby i słowa)
 * oraz gra w rozpoznawanie głoski. Aplikacja nie rozpoznaje mowy, ocenia dorosły.
 */
export function initLogopedia(ctx) {
  const { $, doc, win, shuffle, ri, animate, store, audio, ui } = ctx;
  const { sfx, speak } = audio;
  const fd = { i: 0, stars: 0, seq: [], cur: null, locked: false, miss: false, timer: 0 };

  ui.onLeave(() => clearTimeout(fd.timer));

  const addStar = () => store.set('logoStars', store.get('logoStars', 0) + 1);

  /** Pokazuje jeden z podekranów modułu. */
  function lgView(id) {
    LG_VIEWS.forEach((v) => { $('#' + v).hidden = v !== id; });
    clearTimeout(fd.timer);
    try { if ('speechSynthesis' in win) win.speechSynthesis.cancel(); } catch { /* brak mowy */ }
    if (id === 'lgHome') $('#lgStars').textContent = store.get('logoStars', 0);
    win.scrollTo(0, 0);
  }

  $('#goLogo').addEventListener('click', () => { ctx.show('logo'); lgView('lgHome'); });
  doc.querySelectorAll('[data-lg]').forEach((b) => {
    b.addEventListener('click', () => lgView(b.getAttribute('data-lg')));
  });

  const dots = (el, total, done) => {
    el.innerHTML = Array.from({ length: total }, (_, k) => `<i class="${k < done ? 'on' : ''}"></i>`).join('');
  };

  /* ---------- gimnastyka buzi ---------- */
  const gym = { i: 0, rep: 0 };

  function startGym() {
    lgView('lgGym');
    gym.i = 0;
    gym.rep = 0;
    $('#gymOverlay').hidden = true;
    $('#gymOverlay').innerHTML = '';
    renderGym(true);
  }

  function renderGym(say) {
    const g = GYM[gym.i];
    $('#gymNo').textContent = `Ćwiczenie ${gym.i + 1} z ${GYM.length}`;
    $('#gymPic').textContent = g.e;
    $('#gymTitle').textContent = g.t;
    $('#gymText').textContent = g.d;
    dots($('#gymDots'), g.n, gym.rep);
    if (say) speak(`${g.t}. ${g.d}`);
  }

  $('#gymDo').addEventListener('click', () => {
    const g = GYM[gym.i];
    gym.rep++;
    sfx.good();
    if (gym.rep < g.n) { dots($('#gymDots'), g.n, gym.rep); return; }
    gym.i++;
    gym.rep = 0;
    if (gym.i >= GYM.length) {
      addStar();
      ctx.statGym();
      sfx.win();
      ctx.overlay($('#gymOverlay'), 'Brawo!', 'Wszystkie ćwiczenia zrobione. Buzia i język są rozgrzane.', 'Jeszcze raz', startGym, true);
      return;
    }
    renderGym(true);
  });
  $('#gymListen').addEventListener('click', () => { const g = GYM[gym.i]; speak(`${g.t}. ${g.d}`); });
  $('#goGym').addEventListener('click', startGym);

  /* ---------- powtarzaj głoski ---------- */
  const say = { s: null, words: [], i: 0 };

  function openPick() {
    lgView('lgPick');
    const box = $('#lgSnds');
    box.innerHTML = SOUNDS.map((s) => `<button type="button" class="lvl" data-k="${s.k}">${s.k}</button>`).join('');
    box.querySelectorAll('.lvl').forEach((b) => {
      b.addEventListener('click', () => startSay(b.getAttribute('data-k')));
    });
  }

  function startSay(k) {
    say.s = SOUNDS.find((s) => s.k === k);
    say.words = shuffle(say.s.w.slice());
    say.i = 0;
    lgView('lgSay');
    $('#sayOverlay').hidden = true;
    $('#sayOverlay').innerHTML = '';
    $('#sayHead').textContent = say.s.k;
    const box = $('#saySyl');
    box.innerHTML = '';
    say.s.syl.forEach((sy) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'syl';
      b.textContent = sy;
      b.addEventListener('click', () => speak(sy.toLowerCase()));
      box.appendChild(b);
    });
    renderSay(false);
  }

  function renderSay(speakIt) {
    const w = say.words[say.i];
    $('#sayInfo').textContent = `Słowo ${say.i + 1} z ${say.words.length}`;
    $('#sayPic').textContent = w[1];
    $('#sayWord').innerHTML = hl(w[0], say.s.re);
    dots($('#sayDots'), say.words.length, say.i);
    if (speakIt) speak(w[0].toLowerCase());
  }

  $('#sayDo').addEventListener('click', () => {
    ctx.statSay(say.s.k);
    say.i++;
    sfx.good();
    if (say.i >= say.words.length) {
      addStar();
      sfx.win();
      dots($('#sayDots'), say.words.length, say.words.length);
      const k = say.s.k;
      ctx.overlay($('#sayOverlay'), 'Brawo!', `Wszystkie słowa z głoską ${k} powiedziane.`, 'Jeszcze raz', () => startSay(k), true);
      return;
    }
    renderSay(true);
  });
  $('#sayListen').addEventListener('click', () => { const w = say.words[say.i]; if (w) speak(w[0].toLowerCase()); });
  $('#goSounds').addEventListener('click', openPick);

  /* ---------- znajdź głoskę ---------- */

  function startFind() {
    lgView('lgFind');
    fd.i = 0;
    fd.stars = 0;
    fd.seq = shuffle(SOUNDS.slice()).concat(shuffle(SOUNDS.slice())).slice(0, FIND_QUESTIONS);
    $('#fdOverlay').hidden = true;
    $('#fdOverlay').innerHTML = '';
    nextFind();
  }

  function nextFind() {
    if (fd.i >= FIND_QUESTIONS) { findDone(); return; }
    const s = fd.seq[fd.i];
    fd.locked = false;
    fd.miss = false;
    const correct = s.w[ri(0, s.w.length - 1)];
    const test = new RegExp(s.re);
    const pool = [];
    SOUNDS.forEach((o) => {
      if (o.k === s.k || o.k === s.fam) return;
      o.w.forEach((w) => { if (!test.test(w[0])) pool.push(w); });
    });
    fd.cur = { s, correct };
    $('#fdNo').textContent = fd.i + 1;
    $('#fdStars').textContent = fd.stars;
    $('#fdSound').textContent = s.k;
    $('#fdNote').textContent = '';
    const box = $('#fdChoices');
    box.innerHTML = '';
    shuffle([correct, ...shuffle(pool).slice(0, 2)]).forEach((w) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'ans pw';
      b.innerHTML = `<span class="pe">${w[1]}</span><span class="pt">${w[0]}</span>`;
      b.addEventListener('click', () => findAnswer(w, b));
      box.appendChild(b);
    });
  }

  function findAnswer(w, btn) {
    if (fd.locked) return;
    const c = fd.cur;
    const ok = w[0] === c.correct[0];
    ctx.rec('find', ok, c.s.k);
    if (ok) {
      fd.locked = true;
      btn.classList.add('ok');
      sfx.good();
      if (!fd.miss) { fd.stars++; $('#fdStars').textContent = fd.stars; }
      $('#fdNote').innerHTML = `Brawo! ${hl(c.correct[0], c.s.re)} ma głoskę ${c.s.k}.`;
      speak(c.correct[0].toLowerCase());
      fd.i++;
      fd.timer = setTimeout(nextFind, 1700);
    } else {
      fd.miss = true;
      sfx.bad();
      animate(btn, 'no');
      $('#fdNote').textContent = 'Tu nie ma tej głoski. Spróbuj jeszcze raz.';
    }
  }

  function findDone() {
    addStar();
    sfx.win();
    ctx.overlay($('#fdOverlay'), 'Brawo!', `Gwiazdki: ${fd.stars} z ${FIND_QUESTIONS}. Gwiazdka jest za odpowiedź bez pomyłki.`, 'Jeszcze raz', startFind, true);
  }

  $('#goFind').addEventListener('click', startFind);
}

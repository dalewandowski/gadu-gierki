import { makeQ, others, numMax } from '../lib/questions.js';
import { frogSVG } from '../lib/frog-svg.js';

export const MAX_LEVEL = 20;

/** Liczba kamieni na poziomie: 3 na poziomach 1-4, potem co cztery poziomy o jeden więcej (do 7). */
export function stonesFor(level) {
  return 3 + Math.floor((Math.max(level, 1) - 1) / 4);
}

/**
 * Gra „Żaba do rodziny": dobra odpowiedź to skok na następny kamień, zła cofa żabę.
 * Poziomów jest 20.
 */
export function initFrog(ctx) {
  const { $, $$, shuffle, animate, state, store, audio, ui } = ctx;
  const { sfx } = audio;
  const scene = $('#scene');
  const frog = { level: 1, n: 3, pos: 0, q: null, locked: false, sp: 30, fs: 30, timer: 0 };

  $('#frogIco').innerHTML = frogSVG('#B6F08C', '#7ED35A', 'frogsvg', 'width:56px');
  ui.onLeave(() => clearTimeout(frog.timer));

  function startFrog(level) {
    ctx.show('frog');
    clearTimeout(frog.timer);
    frog.level = level;
    frog.n = stonesFor(level);
    frog.pos = 0;
    frog.locked = false;
    $('#frogOverlay').hidden = true;
    $('#frogOverlay').innerHTML = '';
    buildScene();
    renderHud();
    newQuestion();
    $('#frogNote').textContent = 'Wybierz wynik. Dobra odpowiedź to skok do przodu.';
  }

  function buildScene() {
    const n = frog.n;
    const width = scene.clientWidth || 320;
    const sp = width / (n + 3);
    frog.sp = sp;
    frog.fs = Math.max(28, Math.min(64, sp * 1.1));
    const fs = frog.fs;
    let h = '<div class="water"></div>';
    h += `<div class="bank" style="left:0;width:${sp}px"></div>`;
    for (let i = 1; i <= n; i++) {
      h += `<div class="stone" id="st${i}" style="left:${i * sp + sp * 0.06}px;width:${sp * 0.88}px"></div>`;
    }
    h += `<div class="bank" style="left:${(n + 1) * sp}px;width:${sp * 2}px"></div>`;
    h += frogSVG('#7FD65A', '#4FA83C', 'frogsvg fz', `width:${fs * 0.95}px;left:${(n + 2) * sp + sp * 0.5 - fs * 0.475}px;bottom:68px`);
    h += frogSVG('#B6F08C', '#7ED35A', 'frogsvg fz', `width:${fs * 0.55}px;left:${(n + 3) * sp - fs * 0.62}px;bottom:68px`);
    h += `<div class="hero" id="hero" style="width:${fs}px"><div class="hop" id="hop">${frogSVG('#52C85A', '#38A244', 'frogsvg', '')}</div></div>`;
    scene.innerHTML = h;
    placeHero();
  }

  function placeHero() {
    const hero = $('#hero');
    if (!hero) return;
    hero.style.left = ((frog.pos + 0.5) * frog.sp - frog.fs / 2) + 'px';
    const onBank = frog.pos === 0 || frog.pos === frog.n + 1;
    hero.style.bottom = (onBank ? 68 : 58) + 'px';
  }

  function renderHud() {
    $('#frogLevel').textContent = `Poziom ${frog.level} z ${MAX_LEVEL}`;
    $('#frogProg').textContent = `Kamienie: ${Math.min(frog.pos, frog.n)} z ${frog.n}`;
  }

  function newQuestion() {
    const max = numMax(frog.level);
    const q = makeQ(state.op, max);
    frog.q = q;
    const eq = $('#frogEq');
    eq.textContent = q.text + ' = ?';
    eq.className = 'equation';
    const box = $('#answers');
    box.innerHTML = '';
    shuffle([q.ans, ...others(q.ans, 2, max)]).forEach((v) => {
      const b = ctx.doc.createElement('button');
      b.type = 'button';
      b.className = 'ans';
      b.textContent = v;
      b.addEventListener('click', () => answer(v));
      box.appendChild(b);
    });
    frog.locked = false;
  }

  function answer(v) {
    if (frog.locked) return;
    frog.locked = true;
    $$('#answers .ans').forEach((b) => { b.disabled = true; });
    const q = frog.q;
    const eq = $('#frogEq');
    const note = $('#frogNote');
    const hop = $('#hop');
    eq.textContent = `${q.text} = ${q.ans}`;
    ctx.rec(q.text.indexOf('+') >= 0 ? 'add' : 'sub', v === q.ans);
    if (v === q.ans) {
      eq.className = 'equation good';
      sfx.good();
      frog.pos++;
      note.textContent = 'Dobrze! Żaba skacze dalej.';
      animate(hop, 'jump');
      placeHero();
    } else {
      eq.className = 'equation bad';
      sfx.bad();
      const hadBack = frog.pos > 0;
      frog.pos = Math.max(0, frog.pos - 1);
      note.textContent = `To jest ${q.ans}. ` + (hadBack ? 'Żaba cofa się o kamień.' : 'Spróbuj jeszcze raz.');
      animate(hop, 'no');
      animate($('#st' + (frog.pos + 1)), 'wob');
      placeHero();
    }
    renderHud();
    frog.timer = setTimeout(() => {
      if (frog.pos === frog.n + 1) { levelDone(); return; }
      newQuestion();
    }, 1000);
  }

  function levelDone() {
    sfx.win();
    if (frog.level >= store.get('bestFrog', 1)) store.set('bestFrog', Math.min(frog.level + 1, MAX_LEVEL));
    if (frog.level >= MAX_LEVEL) {
      ctx.overlay($('#frogOverlay'), 'Wszystkie poziomy!',
        `Żaba przeszła wszystkie ${MAX_LEVEL} poziomów. Świetna robota!`,
        'Zagraj od początku', () => startFrog(1), true);
      return;
    }
    ctx.overlay($('#frogOverlay'), 'Brawo! Żaba jest w domu',
      `Poziom ${frog.level} ukończony. Na następnym poziomie jest kamieni: ${stonesFor(frog.level + 1)}.`,
      'Poziom ' + (frog.level + 1), () => startFrog(frog.level + 1), true);
  }

  $('#goFrog').addEventListener('click', () => startFrog(1));
  ctx.win.addEventListener('resize', () => { if (!$('#frog').hidden && scene.clientWidth) buildScene(); });
}

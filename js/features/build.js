import { BUILD_WORDS } from '../data/words.js';

export const LEVELS = 30;
export const WORDS_PER_LEVEL = 3;

/** Długość wyrazów na poziomie: 1-12 po 3 litery, 13-18 po 4, 19-24 po 5, 25-27 po 6, 28-30 po 7. */
export function buildLength(level) {
  if (level <= 12) return 3;
  if (level <= 18) return 4;
  if (level <= 24) return 5;
  return level <= 27 ? 6 : 7;
}

/** Ile dodatkowych (niepasujących) literek leży obok: początek bez, potem 1, 2 i 3. */
export function extraTiles(level) {
  if (level <= 3) return 0;
  if (level <= 12) return 1;
  return level <= 24 ? 2 : 3;
}

/** Podpis grupy poziomów na mapie. */
const GROUPS = [
  ['Wyrazy z 3 liter', 1, 12], ['Wyrazy z 4 liter', 13, 18], ['Wyrazy z 5 liter', 19, 24], ['Wyrazy z 6 i 7 liter', 25, 30]
];

/** Gra „Ułóż wyraz": dziecko stuka literki w dobrej kolejności. Poziom to kilka wyrazów. */
export function initBuild(ctx) {
  const { $, doc, shuffle, animate, store, audio, ui } = ctx;
  const { sfx, speak } = audio;
  const bd = { level: 1, n: 0, words: [], word: '', slot: 0, tiles: [], wrong: 0, timer: 0 };

  ui.onLeave(() => clearTimeout(bd.timer));

  const done = () => store.get('buildDone', 0);

  function renderMap() {
    const finished = done();
    const all = store.get('buildOpen', 0) === 1;
    let h = '';
    for (const [label, from, to] of GROUPS) {
      h += `<div class="map-group">${label}</div><div class="lvls">`;
      for (let L = from; L <= to; L++) {
        const open = all || L <= finished + 1;
        h += `<button type="button" class="lvl${L <= finished ? ' done' : ''}" data-l="${L}"${open ? '' : ' disabled'}>${L}</button>`;
      }
      h += '</div>';
    }
    const box = $('#bLevels');
    box.innerHTML = h;
    box.querySelectorAll('.lvl').forEach((b) => {
      b.addEventListener('click', () => startLevel(Number(b.getAttribute('data-l'))));
    });
  }

  function openBuild() {
    ctx.show('build');
    clearTimeout(bd.timer);
    $('#bMap').hidden = false;
    $('#bPlay').hidden = true;
    renderMap();
  }

  /** Losuje wyrazy na poziom: trzy różne o właściwej długości. */
  function levelWords(L) {
    return shuffle(BUILD_WORDS[buildLength(L)].slice()).slice(0, WORDS_PER_LEVEL);
  }

  function startLevel(L) {
    clearTimeout(bd.timer);
    bd.level = L;
    bd.n = 0;
    bd.words = levelWords(L);
    $('#bMap').hidden = true;
    $('#bPlay').hidden = false;
    $('#bOverlay').hidden = true;
    $('#bOverlay').innerHTML = '';
    nextWord();
  }

  function nextWord() {
    if (bd.n >= WORDS_PER_LEVEL) { levelDone(); return; }
    const w = bd.words[bd.n];
    bd.word = w[0];
    bd.slot = 0;
    bd.wrong = 0;
    $('#bLevel').textContent = `Poziom ${bd.level} z ${LEVELS}`;
    $('#bProg').textContent = `Wyrazy: ${bd.n} z ${WORDS_PER_LEVEL}`;
    $('#bPic').textContent = w[1];
    $('#bNote').textContent = 'Stuknij literkę, która jest następna.';
    $('#bSlots').innerHTML = '<div class="slot"></div>'.repeat(w[0].length);
    let letters = w[0].split('');
    const extraPool = 'AEIOUYKLMNPRSTWZBDGJ'.split('').filter((c) => !letters.includes(c));
    letters = shuffle(letters.concat(shuffle(extraPool).slice(0, extraTiles(bd.level))));
    const box = $('#bTiles');
    box.innerHTML = '';
    bd.tiles = [];
    letters.forEach((ch) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'tile';
      b.textContent = ch;
      const t = { ch, el: b, used: false };
      b.addEventListener('click', () => tapTile(t));
      box.appendChild(b);
      bd.tiles.push(t);
    });
    speak(w[0].toLowerCase());
  }

  function tapTile(t) {
    if (t.used || bd.slot >= bd.word.length) return;
    const expected = bd.word[bd.slot];
    ctx.rec('build', t.ch === expected);
    bd.tiles.forEach((x) => x.el.classList.remove('hint'));
    if (t.ch === expected) {
      t.used = true;
      t.el.classList.add('used');
      const slotEl = $('#bSlots').children[bd.slot];
      slotEl.textContent = t.ch;
      slotEl.classList.add('filled');
      bd.slot++;
      bd.wrong = 0;
      sfx.good();
      if (bd.slot === bd.word.length) {
        bd.n++;
        $('#bProg').textContent = `Wyrazy: ${bd.n} z ${WORDS_PER_LEVEL}`;
        $('#bNote').textContent = 'Brawo! ' + bd.word;
        speak(bd.word.toLowerCase());
        bd.timer = setTimeout(nextWord, 1600);
      } else {
        $('#bNote').textContent = 'Dobrze! Szukaj następnej literki.';
      }
    } else {
      bd.wrong++;
      sfx.bad();
      animate(t.el, 'no');
      $('#bNote').textContent = 'Spróbuj inną literkę.';
      if (bd.wrong >= 2) {
        const good = bd.tiles.find((x) => !x.used && x.ch === expected);
        if (good) good.el.classList.add('hint');
      }
    }
  }

  function levelDone() {
    const L = bd.level;
    if (L > done()) store.set('buildDone', L);
    sfx.win();
    if (L < LEVELS) {
      ctx.overlay($('#bOverlay'), 'Brawo!', `Poziom ${L} ukończony.`, 'Poziom ' + (L + 1), () => startLevel(L + 1), true);
    } else {
      ctx.overlay($('#bOverlay'), 'Wszystkie poziomy!', `Ukończyłeś wszystkie ${LEVELS} poziomów. Świetna robota!`, 'Do poziomów', openBuild, true);
    }
  }

  $('#bListen').addEventListener('click', () => { if (bd.word) speak(bd.word.toLowerCase()); });
  $('#goBuild').addEventListener('click', openBuild);
  $('#bToMap').addEventListener('click', openBuild);
  $('#bUnlock').addEventListener('click', () => { store.set('buildOpen', 1); renderMap(); });
}

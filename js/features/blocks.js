import { BLOCK_WORDS } from '../data/words.js';
import { sylPool } from '../lib/questions.js';

export const PER_SERIES = 20;
export const LEVELS = 3 * PER_SERIES;
const RECENT = 10; // tyle ostatnich słów z serii nie wraca od razu

/** Liczba klocków (sylab w wyrazie) na poziomie: 2 na 1-20, 3 na 21-40, 4 na 41-60. */
export function blocksFor(level) {
  return 2 + Math.floor((level - 1) / PER_SERIES);
}

/** Czy na poziomie jest dodatkowy klocek, który nie pasuje (druga połowa każdej serii). */
export function hasExtraBlock(level) {
  return (level - 1) % PER_SERIES >= PER_SERIES / 2;
}

/** Losuje słowo z serii, unikając ostatnio użytych (`recent` to lista, którą funkcja uzupełnia). */
export function pickWord(series, recent) {
  const fresh = series.filter((w) => !recent.includes(w[0]));
  const pool = fresh.length ? fresh : series;
  const w = pool[Math.floor(Math.random() * pool.length)];
  recent.push(w[0]);
  while (recent.length > Math.min(RECENT, series.length - 1)) recent.shift();
  return w;
}

/**
 * Gra „Klocki sylab": dziecko układa z klocków z sylabami cały wyraz.
 * W drugiej połowie każdej serii dochodzi jeden klocek, który nie pasuje.
 * Za każdym razem wyraz jest losowany z całej serii.
 */
export function initBlocks(ctx) {
  const { $, doc, shuffle, animate, store, audio, ui } = ctx;
  const { sfx, speak } = audio;
  const recent = [[], [], []];
  const bk = { level: 1, parts: [], word: '', N: 2, blocks: [], wrong: 0, locked: false, timer: 0 };

  ui.onLeave(() => clearTimeout(bk.timer));

  const done = () => store.get('blocksDone', 0);

  function renderMap() {
    const finished = done();
    const all = store.get('blocksOpen', 0) === 1;
    let h = '';
    for (let t = 0; t < 3; t++) {
      h += `<div class="map-group">Po ${t + 2} klocki</div><div class="lvls">`;
      for (let i = 1; i <= PER_SERIES; i++) {
        const L = t * PER_SERIES + i;
        const open = all || L <= finished + 1;
        h += `<button type="button" class="lvl${L <= finished ? ' done' : ''}" data-l="${L}"${open ? '' : ' disabled'}>${L}</button>`;
      }
      h += '</div>';
    }
    const box = $('#bkLevels');
    box.innerHTML = h;
    box.querySelectorAll('.lvl').forEach((b) => {
      b.addEventListener('click', () => startLevel(Number(b.getAttribute('data-l'))));
    });
  }

  function openBlocks() {
    ctx.show('blocks');
    clearTimeout(bk.timer);
    $('#bkMap').hidden = false;
    $('#bkPlay').hidden = true;
    renderMap();
  }

  function startLevel(L) {
    clearTimeout(bk.timer);
    const tier = Math.floor((L - 1) / PER_SERIES);
    const w = pickWord(BLOCK_WORDS[tier], recent[tier]);
    bk.level = L;
    bk.parts = w[0].split('-');
    bk.word = bk.parts.join('');
    bk.N = bk.parts.length;
    bk.wrong = 0;
    bk.locked = false;
    const blocks = bk.parts.map((s, i) => ({ id: i, syl: s, slot: -1 }));
    const hasExtra = hasExtraBlock(L);
    if (hasExtra) {
      const extra = shuffle(sylPool(4).filter((s) => !bk.parts.includes(s)))[0];
      blocks.push({ id: bk.N, syl: extra, slot: -1 });
    }
    bk.blocks = shuffle(blocks);
    $('#bkMap').hidden = true;
    $('#bkPlay').hidden = false;
    $('#bkOverlay').hidden = true;
    $('#bkOverlay').innerHTML = '';
    $('#bkSlots').className = 'bslots';
    $('#bkLevel').textContent = `Poziom ${L} z ${LEVELS}`;
    $('#bkInfo').textContent = 'Klocki: ' + bk.N;
    $('#bkPic').textContent = w[1];
    $('#bkNote').textContent = hasExtra ? 'Uwaga: jeden klocek jest dodatkowy.' : 'Stuknij klocki w dobrej kolejności.';
    renderBlocks();
    speak(bk.word.toLowerCase());
  }

  /** Po dwóch pomyłkach podpowiada sylabę, od której zacząć (gdy układ jest jeszcze poprawny). */
  function hintSyllable() {
    if (bk.wrong < 2) return '';
    let firstEmpty = -1;
    for (let i = 0; i < bk.N; i++) {
      if (!bk.blocks.some((b) => b.slot === i)) { firstEmpty = i; break; }
    }
    if (firstEmpty < 0) return '';
    for (const b of bk.blocks) {
      if (b.slot >= 0 && b.syl !== bk.parts[b.slot]) return '';
    }
    return bk.parts[firstEmpty];
  }

  function makeBlock(b, hint) {
    const el = doc.createElement('button');
    el.type = 'button';
    el.className = 'blk' + (hint ? ' hint' : '');
    el.textContent = b.syl;
    el.addEventListener('click', () => tapBlock(b));
    return el;
  }

  function renderBlocks() {
    const slotsEl = $('#bkSlots');
    const tray = $('#bkTray');
    slotsEl.innerHTML = '';
    tray.innerHTML = '';
    const hintSyl = hintSyllable();
    let hinted = false;
    for (let i = 0; i < bk.N; i++) {
      const slot = doc.createElement('div');
      slot.className = 'bslot';
      const placed = bk.blocks.find((x) => x.slot === i);
      if (placed) { slot.classList.add('filled'); slot.appendChild(makeBlock(placed, false)); }
      slotsEl.appendChild(slot);
    }
    bk.blocks.forEach((b) => {
      if (b.slot >= 0) return;
      const isHint = !hinted && hintSyl && b.syl === hintSyl;
      if (isHint) hinted = true;
      tray.appendChild(makeBlock(b, isHint));
    });
  }

  function tapBlock(b) {
    if (bk.locked) return;
    if (b.slot >= 0) { b.slot = -1; renderBlocks(); return; }
    for (let i = 0; i < bk.N; i++) {
      if (!bk.blocks.some((x) => x.slot === i)) { b.slot = i; break; }
    }
    renderBlocks();
    if (bk.blocks.filter((x) => x.slot >= 0).length === bk.N) checkWord();
  }

  function checkWord() {
    bk.locked = true;
    const built = bk.blocks.filter((x) => x.slot >= 0).sort((a, b) => a.slot - b.slot).map((x) => x.syl).join('');
    ctx.rec('blocks', built === bk.word);
    if (built === bk.word) {
      $('#bkSlots').classList.add('ok');
      $('#bkNote').textContent = 'Brawo! ' + bk.word;
      sfx.good();
      speak(bk.word.toLowerCase());
      bk.timer = setTimeout(levelDone, 1800);
    } else {
      bk.wrong++;
      sfx.bad();
      doc.querySelectorAll('#bkSlots .blk').forEach((el) => animate(el, 'no'));
      $('#bkNote').textContent = 'Prawie! Spróbuj ułożyć klocki inaczej.';
      bk.timer = setTimeout(() => {
        bk.blocks.forEach((x) => { x.slot = -1; });
        bk.locked = false;
        renderBlocks();
      }, 1000);
    }
  }

  function levelDone() {
    const L = bk.level;
    if (L > done()) store.set('blocksDone', L);
    sfx.win();
    if (L < LEVELS) {
      ctx.overlay($('#bkOverlay'), 'Brawo!', `Poziom ${L} ukończony. Następny poziom ma klocków: ${blocksFor(L + 1)}.`, 'Poziom ' + (L + 1), () => startLevel(L + 1), true);
    } else {
      ctx.overlay($('#bkOverlay'), 'Wszystkie poziomy!', `Ukończyłeś wszystkie ${LEVELS} poziomów. Świetna robota!`, 'Do poziomów', openBlocks, true);
    }
  }

  $('#goBlocks').addEventListener('click', openBlocks);
  $('#bkToMap').addEventListener('click', openBlocks);
  $('#bkListen').addEventListener('click', () => { if (bk.word) speak(bk.word.toLowerCase()); });
  $('#bkUnlock').addEventListener('click', () => { store.set('blocksOpen', 1); renderMap(); });
}

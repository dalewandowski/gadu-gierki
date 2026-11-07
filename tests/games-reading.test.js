import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './helpers/boot.js';
import { buildLength, extraTiles } from '../js/features/build.js';
import { WORDS, BUILD_WORDS, BLOCK_WORDS } from '../js/data/words.js';

test('jaka to litera: 10 pytań, dobra litera daje gwiazdkę', () => {
  const t = boot();
  t.addChild();
  t.click('#goAbc');
  for (let i = 1; i <= 10; i++) {
    assert.equal(t.text('#abcNo'), String(i));
    const word = t.text('#abcWord');
    const btns = t.$$('#abcChoices .ans');
    assert.equal(btns.length, 3);
    t.click(btns.find((b) => b.firstChild.textContent === word[0]));
    t.tick(1600);
  }
  assert.ok(!t.$('#abcOverlay').hidden);
  assert.match(t.text('#abcOverlay p'), /10 z 10/);
  t.back();
  t.assertClean(assert);
  t.close();
});

test('jaka to litera: pomyłka nie daje gwiazdki', () => {
  const t = boot();
  t.addChild();
  t.click('#goAbc');
  const word = t.text('#abcWord');
  const btns = t.$$('#abcChoices .ans');
  t.click(btns.find((b) => b.firstChild.textContent !== word[0]));
  t.click(btns.find((b) => b.firstChild.textContent === word[0]));
  assert.equal(t.text('#abcStars'), '0');
  t.back();
  t.close();
});

/** Układa wyrazy bieżącego poziomu w „Ułóż wyraz" (po obrazku znajduje słowo w danych). */
const playBuildLevel = (t, L) => {
  const len = buildLength(L);
  for (let n = 0; n < 3; n++) {
    assert.equal(t.$$('#bSlots .slot').length, len, `poziom ${L}: długość wyrazu`);
    const pic = t.text('#bPic');
    const word = BUILD_WORDS[len].find((w) => w[1] === pic)[0];
    assert.equal(t.$$('#bTiles .tile').length, len + extraTiles(L), `poziom ${L}: literki`);
    for (const ch of word) t.click(t.$$('#bTiles .tile').find((x) => x.textContent === ch && !x.classList.contains('used')));
    t.tick(1700);
  }
};

test('ułóż wyraz: poziom 1 to 3 wyrazy po 3 litery, kończy się odblokowaniem poziomu 2', () => {
  const t = boot();
  t.addChild();
  t.click('#goBuild');
  assert.equal(t.$$('#bLevels .lvl').length, 30);
  assert.equal(t.$$('#bLevels .lvl:not([disabled])').length, 1);
  t.click('#bLevels .lvl[data-l="1"]');
  playBuildLevel(t, 1);
  assert.ok(!t.$('#bOverlay').hidden);
  assert.equal(t.stored()[`p${t.ctx.prof.cur}:buildDone`], '1');
  t.click('#bOverlay button');
  assert.equal(t.text('#bLevel'), 'Poziom 2 z 30');
  t.assertClean(assert);
  t.close();
});

test('ułóż wyraz: wszystkie 30 poziomów da się przejść; krótkie wyrazy na początku, długie później', () => {
  const t = boot();
  t.addChild();
  t.click('#goBuild');
  t.click('#bUnlock');
  assert.equal(t.$$('#bLevels .lvl:not([disabled])').length, 30);
  for (let L = 1; L <= 30; L++) {
    if (t.$('#bPlay').hidden) t.click('#goBuild');
    t.click(`#bLevels .lvl[data-l="${L}"]`);
    playBuildLevel(t, L);
    assert.ok(!t.$('#bOverlay').hidden, 'poziom ' + L);
    if (L < 30) { t.click('#bOverlay button'); t.click('#bToMap'); } else t.click('#bOverlay button');
  }
  assert.equal(t.stored()[`p${t.ctx.prof.cur}:buildDone`], '30');
  t.assertClean(assert);
  t.close();
});

test('ułóż wyraz: wyrazy są losowane za każdym razem, w poziomie bez powtórzeń', () => {
  const t = boot();
  t.addChild();
  t.click('#goBuild');
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    t.click('#bLevels .lvl[data-l="1"]');
    const words = [];
    for (let n = 0; n < 3; n++) {
      const word = BUILD_WORDS[3].find((w) => w[1] === t.text('#bPic'))[0];
      words.push(word);
      seen.add(word);
      for (const ch of word) t.click(t.$$('#bTiles .tile').find((x) => x.textContent === ch && !x.classList.contains('used')));
      t.tick(1700);
    }
    assert.equal(new Set(words).size, 3, 'powtórka w poziomie: ' + words);
    t.click('#bOverlay button'); // następny poziom
    t.click('#bToMap');
  }
  assert.ok(seen.size >= 10, 'różnych wyrazów w 8 podejściach: ' + seen.size);
  t.close();
});

/** Znajduje w danych słowo wylosowane na poziomie (po obrazku; obrazki mogą się powtarzać, więc sprawdza też sylaby na klockach). */
const levelWord = (t, L) => {
  const tier = BLOCK_WORDS[Math.floor((L - 1) / 20)];
  const syl = t.$$('#bkTray .blk').map((b) => b.textContent);
  const w = tier.find((x) => x[1] === t.text('#bkPic') && x[0].split('-').every((s) => syl.includes(s)));
  assert.ok(w, 'poziom ' + L + ': nie znaleziono słowa');
  return w;
};

test('klocki sylab: poziom 1 do ułożenia, odblokowuje poziom 2', () => {
  const t = boot();
  t.addChild();
  t.click('#goBlocks');
  assert.equal(t.$$('#bkLevels .lvl').length, 60);
  assert.equal(t.$$('#bkLevels .lvl:not([disabled])').length, 1);
  t.click('#bkLevels .lvl[data-l="1"]');
  for (const s of levelWord(t, 1)[0].split('-')) t.click(t.$$('#bkTray .blk').find((b) => b.textContent === s));
  t.tick(2000);
  assert.ok(!t.$('#bkOverlay').hidden);
  assert.equal(t.stored()[`p${t.ctx.prof.cur}:blocksDone`], '1');
  t.click('#bkOverlay button');
  assert.equal(t.text('#bkLevel'), 'Poziom 2 z 60');
  t.assertClean(assert);
  t.close();
});

test('klocki sylab: wszystkie 60 poziomów da się przejść; liczba klocków i dodatkowy klocek zgadzają się z poziomem', () => {
  const t = boot();
  t.addChild();
  t.click('#goBlocks');
  t.click('#bkUnlock');
  assert.equal(t.$$('#bkLevels .lvl:not([disabled])').length, 60);
  for (let L = 1; L <= 60; L++) {
    if (t.$('#bkPlay').hidden) t.click('#goBlocks');
    t.click(`#bkLevels .lvl[data-l="${L}"]`);
    const parts = levelWord(t, L)[0].split('-');
    assert.equal(parts.length, 2 + Math.floor((L - 1) / 20));
    const extra = (L - 1) % 20 >= 10 ? 1 : 0;
    assert.equal(t.$$('#bkTray .blk').length, parts.length + extra, 'poziom ' + L);
    for (const s of parts) t.click(t.$$('#bkTray .blk').find((b) => b.textContent === s));
    t.tick(2000);
    assert.ok(!t.$('#bkOverlay').hidden, 'poziom ' + L);
    if (L < 60) { t.click('#bkOverlay button'); t.click('#bkToMap'); } else t.click('#bkOverlay button');
  }
  assert.equal(t.stored()[`p${t.ctx.prof.cur}:blocksDone`], '60');
  t.assertClean(assert);
  t.close();
});

test('klocki sylab: za każdym wejściem na poziom wyraz jest losowany, nie ciągle ten sam', () => {
  const t = boot();
  t.addChild();
  t.click('#goBlocks');
  const seen = new Set();
  const first = [];
  for (let i = 0; i < 12; i++) {
    t.click('#bkLevels .lvl[data-l="1"]');
    const w = levelWord(t, 1)[0];
    seen.add(w);
    first.push(w);
    t.click('#bkToMap');
  }
  assert.ok(seen.size >= 8, 'różnych słów w 12 podejściach do poziomu 1: ' + seen.size);
  for (let i = 1; i < first.length; i++) assert.notEqual(first[i], first[i - 1], 'to samo słowo dwa razy z rzędu');
  t.close();
});

test('klocki sylab: zły układ resetuje klocki, po 2 pomyłkach jest podpowiedź', () => {
  const t = boot();
  t.addChild();
  t.click('#goBlocks');
  t.click('#bkUnlock');
  let parts;
  do { // odwrócona kolejność musi być błędna, więc pomijamy słowa typu MA-MA
    t.click('#bkLevels .lvl[data-l="2"]');
    parts = levelWord(t, 2)[0].split('-');
    if (parts[0] === parts[1]) t.click('#bkToMap');
  } while (parts[0] === parts[1]);
  const wrongOrder = () => {
    for (const s of [...parts].reverse()) t.click(t.$$('#bkTray .blk').find((b) => b.textContent === s));
    t.tick(1100);
  };
  wrongOrder();
  assert.equal(t.$$('#bkTray .blk').length, 2);
  wrongOrder();
  assert.equal(t.$$('#bkTray .blk.hint').length, 1);
  t.close();
});

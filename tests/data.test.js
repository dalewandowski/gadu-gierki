import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, BUILD_WORDS, SYL_WORDS, BLOCK_WORDS, GYM, SOUNDS } from '../js/data/words.js';

test('słowa do gry w literki mają wyraz i obrazek', () => {
  assert.ok(WORDS.length >= 10);
  for (const w of WORDS) { assert.equal(typeof w[0], 'string'); assert.ok(w[0].length > 1); assert.ok(w[1]); }
});

test('klocki sylab: 3 serie, w każdej co najmniej 20 różnych słów z dobrą liczbą sylab', () => {
  assert.equal(BLOCK_WORDS.length, 3);
  BLOCK_WORDS.forEach((tier, t) => {
    assert.ok(tier.length >= 20, `seria ${t + 1}: ${tier.length}`);
    assert.equal(new Set(tier.map((w) => w[0])).size, tier.length, 'bez powtórzeń');
    for (const w of tier) { assert.equal(w[0].split('-').length, t + 2, w[0]); assert.ok(w[1], w[0]); }
  });
});

test('ułóż wyraz: słowa mają długość zgodną z grupą, bez powtórzeń', () => {
  for (const [len, list] of Object.entries(BUILD_WORDS)) {
    assert.ok(list.length >= 7, `grupa ${len}: ${list.length}`);
    assert.equal(new Set(list.map((w) => w[0])).size, list.length, 'powtórzenia w grupie ' + len);
    for (const w of list) { assert.equal([...w[0]].length, Number(len), w[0]); assert.ok(w[1], w[0]); }
  }
  assert.ok(BUILD_WORDS[3].length >= 20, 'dużo wyrazów 3-literowych');
});

test('sylaby do uzupełniania mają trzy pola', () => {
  for (const w of SYL_WORDS) assert.ok(w[0] && w[1] && w[2]);
});

test('gimnastyka buzi: 10 ćwiczeń z powtórzeniami', () => {
  assert.equal(GYM.length, 10);
  for (const g of GYM) { assert.ok(g.t && g.d && g.e); assert.ok(g.n >= 1); }
});

test('głoski: wzorzec pasuje do wszystkich swoich słów', () => {
  assert.equal(SOUNDS.length, 8);
  for (const s of SOUNDS) {
    const re = new RegExp(s.re);
    assert.ok(s.w.length >= 4, s.k);
    for (const w of s.w) assert.ok(re.test(w[0]), `${s.k}: ${w[0]}`);
  }
});

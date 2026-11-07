import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeQ, others, mathRound, sylPool, sylRound, numMax } from '../js/lib/questions.js';
import { fallSpeed, levelFor, sylLevelFor } from '../js/features/fall.js';
import { stonesFor } from '../js/features/frog.js';
import { blocksFor, hasExtraBlock, pickWord } from '../js/features/blocks.js';
import { buildLength, extraTiles } from '../js/features/build.js';

test('dodawanie i odejmowanie zostają w zakresie 1-10', () => {
  for (let i = 0; i < 500; i++) {
    for (const op of ['add', 'sub', 'mix']) {
      const q = makeQ(op);
      const m = q.text.match(/(\d+) ([+−]) (\d+)/);
      const r = m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
      assert.equal(r, q.ans);
      assert.ok(q.ans >= 1 && q.ans <= 10);
      if (op === 'add') assert.equal(m[2], '+');
      if (op === 'sub') assert.equal(m[2], '−');
    }
  }
});

test('others: różne liczby bez poprawnej', () => {
  for (let a = 1; a <= 10; a++) {
    const o = others(a, 3);
    assert.equal(new Set(o).size, 3);
    assert.ok(!o.includes(a));
  }
});

test('mathRound ma 4 różne opcje z poprawną', () => {
  for (let i = 0; i < 200; i++) {
    const r = mathRound('mix');
    assert.equal(r.opts.length, 4);
    assert.equal(new Set(r.opts).size, 4);
    assert.ok(r.opts.includes(r.ans));
  }
});

test('sylaby: opcje różne i zawierają odpowiedź na każdym poziomie', () => {
  for (let lvl = 1; lvl <= 4; lvl++) {
    assert.ok(sylPool(lvl).length > 0);
    for (let i = 0; i < 100; i++) {
      const r = sylRound(lvl);
      assert.equal(r.opts.length, 4);
      assert.equal(new Set(r.opts).size, 4);
      assert.ok(r.opts.includes(r.ans));
    }
  }
});

test('poziomy i prędkość spadania', () => {
  assert.equal(levelFor(0), 1);
  assert.equal(levelFor(2), 1);
  assert.equal(levelFor(3), 2);
  assert.equal(levelFor(999), 20);
  assert.equal(fallSpeed('math', 1), 22);
  assert.ok(fallSpeed('math', 20) < 90, 'nawet na końcu bez szaleństwa');
  assert.ok(fallSpeed('math', 10) > fallSpeed('math', 1));
  assert.ok(fallSpeed('syl', 10) > fallSpeed('syl', 1));
  assert.equal(sylLevelFor(1), 1);
  assert.equal(sylLevelFor(4), 2);
  assert.equal(sylLevelFor(10), 4);
  assert.equal(sylLevelFor(20), 4);
});

test('żaba: 3 kamienie na starcie, 7 na poziomie 20', () => {
  assert.deepEqual(Array.from({ length: 20 }, (_, i) => stonesFor(i + 1)), [3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7]);
});

test('zakres liczb rośnie z poziomem: od 5 do 10', () => {
  assert.equal(numMax(1), 5);
  assert.equal(numMax(20), 10);
  for (let lvl = 1; lvl <= 20; lvl++) {
    const max = numMax(lvl);
    for (let i = 0; i < 100; i++) {
      for (const op of ['add', 'sub', 'mix']) {
        const r = mathRound(op, max);
        assert.ok(r.ans >= 1 && r.ans <= max, `poziom ${lvl}: ${r.prompt}`);
        assert.ok(r.opts.every((o) => o >= 1 && o <= max));
        assert.equal(new Set(r.opts).size, 4);
      }
    }
  }
});

test('klocki i ułóż wyraz: poziomy', () => {
  assert.deepEqual([1, 20, 21, 40, 41, 60].map(blocksFor), [2, 2, 3, 3, 4, 4]);
  assert.deepEqual([1, 10, 11, 20, 21, 31].map(hasExtraBlock), [false, false, true, true, false, true]);
  const lengths = Array.from({ length: 30 }, (_, i) => buildLength(i + 1));
  assert.equal(lengths.filter((n) => n === 3).length, 12, 'najwięcej poziomów z 3 literami');
  assert.deepEqual([lengths[0], lengths[11], lengths[12], lengths[18], lengths[24], lengths[27], lengths[29]], [3, 3, 4, 5, 6, 7, 7]);
  assert.ok(lengths.every((n, i) => i === 0 || n >= lengths[i - 1]), 'długość nie maleje');
  assert.deepEqual([1, 3, 4, 12, 13, 25].map(extraTiles), [0, 0, 1, 1, 2, 3]);
});

test('losowanie słów z serii: nie powtarza ostatnich, nie wychodzi poza serię', () => {
  const series = Array.from({ length: 25 }, (_, i) => ['S' + i, 'e']);
  const recent = [];
  const seen = new Set();
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const w = pickWord(series, recent);
    assert.ok(series.includes(w));
    assert.notEqual(w[0], prev);
    assert.ok(!recent.slice(0, -1).includes(w[0]), 'powtórka w ostatnich 9');
    prev = w[0];
    seen.add(w[0]);
  }
  assert.ok(seen.size >= 24, 'losowanie obejmuje prawie całą serię: ' + seen.size);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './helpers/boot.js';
import { GYM, SOUNDS } from '../js/data/words.js';

const key = (t, k) => t.stored()[`p${t.ctx.prof.cur}:${k}`];

test('gimnastyka buzi: wszystkie ćwiczenia z powtórzeniami dają gwiazdkę', () => {
  const t = boot();
  t.addChild();
  t.click('#goLogo');
  assert.equal(t.text('#lgStars'), '0');
  t.click('#goGym');
  for (const g of GYM) {
    assert.equal(t.text('#gymTitle'), g.t);
    for (let i = 0; i < g.n; i++) t.click('#gymDo');
  }
  assert.ok(!t.$('#gymOverlay').hidden);
  assert.equal(key(t, 'logoStars'), '1');
  t.click('#gymOverlay button');
  t.click('[data-lg="lgHome"]');
  assert.equal(t.text('#lgStars'), '1');
  t.assertClean(assert);
  t.close();
});

test('powtarzaj głoski: każda z 8 głosek, słowa podświetlone', () => {
  const t = boot();
  t.addChild();
  t.click('#goLogo');
  t.click('#goSounds');
  assert.equal(t.$$('#lgSnds .lvl').length, SOUNDS.length);
  for (const s of SOUNDS) {
    t.click(`#lgSnds .lvl[data-k="${s.k}"]`);
    assert.equal(t.text('#sayHead'), s.k);
    assert.ok(t.$('#sayWord b'), 'podświetlenie ' + s.k);
    for (let i = 0; i < s.w.length; i++) t.click('#sayDo');
    assert.ok(!t.$('#sayOverlay').hidden, s.k);
    t.click('[data-lg="lgPick"]');
  }
  t.assertClean(assert);
  t.close();
});

test('znajdź głoskę: 10 poprawnych odpowiedzi', () => {
  const t = boot();
  t.addChild();
  t.click('#goLogo');
  t.click('#goFind');
  for (let i = 0; i < 10; i++) {
    const s = SOUNDS.find((x) => x.k === t.text('#fdSound'));
    const re = new RegExp(s.re);
    const good = t.$$('#fdChoices .ans').filter((b) => re.test(b.querySelector('.pt').textContent));
    assert.ok(good.length >= 1);
    t.click(good[0]);
    t.tick(1800);
  }
  assert.ok(!t.$('#fdOverlay').hidden);
  assert.match(t.text('#fdOverlay p'), /10 z 10/);
  t.assertClean(assert);
  t.close();
});

test('znajdź głoskę: błędne opcje nie zawierają szukanej głoski', () => {
  const t = boot();
  t.addChild();
  t.click('#goLogo');
  for (let round = 0; round < 20; round++) {
    t.click('#goFind');
    const s = SOUNDS.find((x) => x.k === t.text('#fdSound'));
    const re = new RegExp(s.re);
    const words = t.$$('#fdChoices .pt').map((e) => e.textContent);
    assert.equal(words.filter((w) => re.test(w)).length, 1, `${s.k}: ${words}`);
    t.click('[data-lg="lgHome"]');
  }
  t.close();
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, sleep } from './helpers/boot.js';

const setOp = (t, op) => t.click(`#opSeg button[data-op="${op}"]`);

test('łap cyfry: ekran startowy pokazuje znak wybranego działania', () => {
  const t = boot();
  t.addChild();
  for (const [op, sym] of [['add', '+'], ['sub', '−'], ['mix', '±']]) {
    setOp(t, op);
    t.click('#goFall');
    const eq = t.text('#fallEq');
    assert.ok(eq.includes(sym), `${op}: ${eq}`);
    if (op === 'sub') assert.ok(!eq.includes('+'));
    t.back();
  }
  t.assertClean(assert);
  t.close();
});

test('łap cyfry: kliknięcie dobrej cyfry daje punkt, poziom rośnie co 3 punkty', async () => {
  const t = boot();
  t.addChild();
  setOp(t, 'sub');
  t.click('#goFall');
  t.click('#fallOverlay button');
  for (let i = 0; i < 3; i++) {
    await sleep(60);
    const eq = t.text('#fallEq');
    assert.ok(eq.includes('−') && !eq.includes('+'), eq);
    const ans = t.solve(eq);
    t.pointerdown(t.$$('.drop').find((d) => Number(d.textContent) === ans));
    t.tick(1000);
  }
  assert.equal(t.text('#fallScore'), '3');
  assert.equal(t.text('#fallLevel'), 'Poziom 2 z 20');
  t.back();
  t.assertClean(assert);
  t.close();
});

test('łap cyfry: prędkość na poziomie 1 jest wolna (ok. 22 px/s)', async () => {
  const t = boot();
  t.addChild();
  t.click('#goFall');
  t.click('#fallOverlay button');
  await sleep(100);
  const y = () => parseFloat(t.$('.drop').style.transform.match(/,\s*(-?[\d.]+)px\)/)[1]);
  const a = y();
  await sleep(500);
  const speed = (y() - a) / 0.5;
  assert.ok(speed > 12 && speed < 35, 'prędkość: ' + speed);
  t.back();
  t.close();
});

test('łap cyfry: pięć złych kliknięć kończy grę, rekord się zapisuje', async () => {
  const t = boot();
  t.addChild();
  t.click('#goFall');
  t.click('#fallOverlay button');
  let lost = 0;
  while (lost < 5) {
    await sleep(40);
    const ans = t.solve(t.text('#fallEq'));
    const wrong = t.$$('.drop').find((d) => Number(d.textContent) !== ans);
    if (wrong) { t.pointerdown(wrong); lost++; continue; }
    t.pointerdown(t.$$('.drop').find((d) => Number(d.textContent) === ans)); // nowa runda
    t.tick(1000);
  }
  assert.ok(!t.$('#fallOverlay').hidden);
  assert.match(t.text('#fallOverlay h2'), /Koniec gry|Nowy rekord/);
  t.back();
  t.assertClean(assert);
  t.close();
});

test('łap sylabę: dobra sylaba daje punkt', async () => {
  const t = boot();
  t.addChild();
  t.click('#goSyl');
  t.click('#fallOverlay button');
  await sleep(60);
  const target = t.text('#fallEq').replace('Złap: ', '');
  t.pointerdown(t.$$('.drop').find((d) => d.textContent === target));
  assert.equal(t.text('#fallScore'), '1');
  t.back();
  t.assertClean(assert);
  t.close();
});

test('żaba: dobra odpowiedź przesuwa do przodu, zła cofa, koniec poziomu otwiera następny', () => {
  const t = boot();
  t.addChild();
  t.click('#goFrog');
  assert.match(t.text('#frogProg'), /0 z 3/);
  const answerWith = (good) => {
    const ans = t.solve(t.text('#frogEq'));
    const btn = t.$$('#answers .ans').find((b) => (Number(b.textContent) === ans) === good);
    t.click(btn);
    t.tick(1100);
  };
  answerWith(true);
  assert.match(t.text('#frogProg'), /1 z 3/);
  answerWith(false);
  assert.match(t.text('#frogProg'), /0 z 3/);
  for (let i = 0; i < 4; i++) answerWith(true); // 3 kamienie i brzeg
  assert.ok(!t.$('#frogOverlay').hidden);
  assert.equal(t.stored()[`p${t.ctx.prof.cur}:bestFrog`], '2');
  t.click('#frogOverlay button');
  assert.equal(t.text('#frogLevel'), 'Poziom 2 z 20');
  assert.match(t.text('#frogProg'), /0 z 3/);
  t.back();
  t.assertClean(assert);
  t.close();
});

test('żaba: poziom 20 jest ostatni, potem gra wraca na początek', () => {
  const t = boot();
  t.addChild();
  t.click('#goFrog');
  for (let L = 1; L <= 20; L++) {
    assert.equal(t.text('#frogLevel'), `Poziom ${L} z 20`);
    const stones = Number(t.text('#frogProg').match(/z (\d+)/)[1]);
    for (let i = 0; i < stones + 1; i++) {
      const ans = t.solve(t.text('#frogEq'));
      t.click(t.$$('#answers .ans').find((b) => Number(b.textContent) === ans));
      t.tick(1100);
    }
    assert.ok(!t.$('#frogOverlay').hidden, 'poziom ' + L);
    t.click('#frogOverlay button');
  }
  assert.equal(t.text('#frogLevel'), 'Poziom 1 z 20');
  assert.equal(t.stored()[`p${t.ctx.prof.cur}:bestFrog`], '20');
  t.assertClean(assert);
  t.close();
});

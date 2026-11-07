import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './helpers/boot.js';

const k = (t, key) => t.stored()[`p${t.ctx.prof.cur}:${key}`];

test('T1: pierwsze dziecko przejmuje wyniki sprzed profili', () => {
  const t = boot({ preset: { bestFall: '9', blocksDone: '4', logoStars: '2' } });
  assert.deepEqual(t.visible(), ['who']);
  t.addChild('Ala');
  assert.equal(k(t, 'bestFall'), '9');
  assert.equal(k(t, 'blocksDone'), '4');
  assert.equal(t.text('#bestFall'), '9');
  t.close();
});

test('T2: dwoje dzieci ma osobne wyniki', () => {
  const t = boot();
  t.addChild('Ala');
  t.click('#goAbc');
  const w = t.text('#abcWord');
  t.click(t.$$('#abcChoices .ans').find((b) => b.firstChild.textContent === w[0]));
  t.back();
  t.click('#whoBtn');
  t.addChild('Bartek');
  t.click('#goStats');
  assert.equal(t.text('#stName'), 'Bartek');
  assert.ok(!/Jaka to litera\?[\s\S]*1 z 1/.test(t.text('#stBody')), 'Bartek nie ma wyników Ali');
  t.back();
  assert.equal(t.text('#whoNm'), 'Bartek');
  t.close();
});

test('T3: wyniki zapisują się w statystykach i widać je na ekranie postępów', () => {
  const t = boot();
  t.addChild('Ala');
  t.click('#goAbc');
  const w = t.text('#abcWord');
  const btns = t.$$('#abcChoices .ans');
  t.click(btns.find((b) => b.firstChild.textContent !== w[0]));
  t.click(btns.find((b) => b.firstChild.textContent === w[0]));
  const stats = JSON.parse(k(t, 'stats'));
  assert.equal(stats.c.abc[0] + stats.c.abc[1], 2);
  t.back();
  t.click('#goStats');
  assert.match(t.text('#stBody'), /Jaka to litera/);
  t.assertClean(assert);
  t.close();
});

test('T4: imię z HTML nie wstrzykuje elementów', () => {
  const t = boot();
  t.addChild('<img src=x onerror=alert(1)>');
  assert.equal(t.$$('img').length, 0);
  t.click('#whoBtn');
  assert.equal(t.$$('#whoCards img').length, 0);
  t.click('#goStats') ;
  t.close();
});

test('T5: po przeładowaniu aplikacja pamięta dziecko i wynik', () => {
  const t = boot();
  t.addChild('Ala');
  t.click('#goFrog');
  const stored = t.stored();
  t.close();
  const t2 = boot({ preset: stored });
  assert.deepEqual(t2.visible(), ['menu']);
  assert.equal(t2.text('#whoNm'), 'Ala');
  t2.close();
});

test('T6: limit 6 dzieci, puste imię jest odrzucone', () => {
  const t = boot();
  t.click('#whoCreate');
  assert.match(t.text('#whoNote'), /imię/i);
  for (let i = 1; i <= 6; i++) { t.addChild('D' + i); t.click('#whoBtn'); }
  assert.equal(t.$$('#whoCards > *').length, 6);
  assert.ok(t.$('#whoAdd').hidden);
  t.close();
});

test('T7: zablokowany localStorage nie psuje gry', () => {
  const t = boot({ blockedStorage: true });
  t.addChild('Ala');
  assert.deepEqual(t.visible(), ['menu']);
  t.click('#goAbc');
  const w = t.text('#abcWord');
  t.click(t.$$('#abcChoices .ans').find((b) => b.firstChild.textContent === w[0]));
  t.back();
  t.click('#goStats');
  assert.deepEqual(t.visible(), ['stats']);
  t.assertClean(assert);
  t.close();
});

test('rekord łap cyfry zapisuje się dla dziecka', async () => {
  const t = boot();
  t.addChild('Ala');
  t.ctx.store.set('bestFall', 5);
  t.click('#whoBtn');
  t.click('#whoCards > *');
  assert.equal(t.text('#bestFall'), '5');
  t.close();
});

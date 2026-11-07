import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createStorage } from '../js/lib/storage.js';
import { esc, hl } from '../js/lib/util.js';

const win = () => new JSDOM('', { url: 'https://example.test/' }).window;

test('zapis i odczyt, klucze dziecka mają prefiks', () => {
  const w = win();
  const { ls, prof, store } = createStorage(w);
  store.set('bestFall', 7);
  assert.equal(w.localStorage.getItem('bestFall'), '7');
  prof.cur = 'abc';
  assert.equal(store.get('bestFall', 0), 0);
  store.set('bestFall', 3);
  assert.equal(w.localStorage.getItem('pabc:bestFall'), '3');
  store.setJ('stats', { a: 1 });
  assert.deepEqual(store.getJ('stats', null), { a: 1 });
  ls.del('pabc:bestFall');
  assert.equal(store.get('bestFall', 5), 5);
});

test('zablokowany localStorage: działa w pamięci', () => {
  const w = win();
  Object.defineProperty(w, 'localStorage', { get() { throw new Error('x'); } });
  const { store } = createStorage(w);
  store.set('k', 4);
  assert.equal(store.get('k', 0), 4);
});

test('uszkodzony JSON daje wartość domyślną', () => {
  const w = win();
  const { ls, store } = createStorage(w);
  ls.set('stats', '{nie json');
  assert.deepEqual(store.getJ('stats', { ok: true }), { ok: true });
});

test('esc zabezpiecza HTML, hl podświetla fragment', () => {
  assert.equal(esc('<b>"&'), '&lt;b&gt;&quot;&amp;');
  assert.equal(hl('szafa', 'sz'), '<b>sz</b>afa');
});

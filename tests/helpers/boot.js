import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { mock } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createApp } from '../../js/app.js';

const INDEX = fileURLToPath(new URL('../../index.html', import.meta.url));
const realSetTimeout = globalThis.setTimeout;

/** Prawdziwa pauza (np. dla animacji klatka po klatce w grach ze spadaniem). */
export const sleep = (ms) => new Promise((r) => realSetTimeout(r, ms));

/**
 * Uruchamia całą aplikację w jsdom na prawdziwym index.html (bez skryptów: moduły ładujemy sami).
 * Opcje: blockedStorage (localStorage rzuca wyjątek), realTimers (bez przyspieszania zegarów).
 */
export function boot({ blockedStorage = false, realTimers = false, preset = {} } = {}) {
  const html = readFileSync(INDEX, 'utf8');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(html, {
    url: 'https://example.test/',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(win) {
      win.scrollTo = () => {};
      if (blockedStorage) {
        Object.defineProperty(win, 'localStorage', {
          get() { throw new Error('zablokowany zapis'); }
        });
      } else {
        for (const [k, v] of Object.entries(preset)) win.localStorage.setItem(k, v);
      }
    }
  });
  const win = dom.window;
  const doc = win.document;
  Object.defineProperty(win.HTMLElement.prototype, 'clientWidth', { get() { return 340; } });
  Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { get() { return 480; } });
  win.addEventListener('error', (e) => errors.push(e.message));

  mock.timers.reset(); // po poprzednim teście, który mógł się nie zamknąć
  if (!realTimers) mock.timers.enable({ apis: ['setTimeout'] });

  const app = createApp({ window: win, document: doc });
  app.start();

  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];
  const api = {
    app, ctx: app.ctx, win, doc, $, $$, errors,
    click: (elOrSel) => {
      const el = typeof elOrSel === 'string' ? $(elOrSel) : elOrSel;
      if (!el) throw new Error('Brak elementu: ' + elOrSel);
      el.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
    },
    pointerdown: (el) => el.dispatchEvent(new win.Event('pointerdown', { bubbles: true })),
    /** Przesuwa przyspieszone zegary (setTimeout) o ms milisekund. */
    tick: (ms) => { if (!realTimers) mock.timers.tick(ms); },
    visible: () => $$('#app > section').filter((s) => !s.hidden).map((s) => s.id),
    text: (sel) => $(sel).textContent,
    /** Zawartość localStorage jako zwykły obiekt. */
    stored: () => {
      const o = {};
      for (let i = 0; i < win.localStorage.length; i++) {
        const k = win.localStorage.key(i);
        o[k] = win.localStorage.getItem(k);
      }
      return o;
    },
    addChild: (name = 'Ola') => {
      if ($('#whoNew').hidden) api.click('#whoAdd');
      $('#whoName').value = name;
      api.click('#whoCreate');
    },
    back: () => api.click(`#${api.visible()[0]} [data-back]`),
    /** Wynik działania z napisu typu „3 + 4 = ?" albo „7 − 2 = ?". */
    solve: (eq) => {
      const m = eq.match(/(\d+) ([+−]) (\d+)/);
      if (!m) throw new Error('To nie jest działanie: ' + eq);
      return m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
    },
    assertClean(assert) { assert.deepEqual(errors, [], 'błędy w oknie: ' + errors.join(' | ')); },
    close: () => { win.close(); if (!realTimers) mock.timers.reset(); }
  };
  return api;
}

import { ri, shuffle, pick, esc, animate } from './lib/util.js';
import { createStorage } from './lib/storage.js';
import { createAudio } from './lib/audio.js';
import { createUI } from './lib/ui.js';
import { initMenu } from './features/menu.js';
import { initProfiles } from './features/profiles.js';
import { initFall } from './features/fall.js';
import { initFrog } from './features/frog.js';
import { initLetters } from './features/letters.js';
import { initBuild } from './features/build.js';
import { initBlocks } from './features/blocks.js';
import { initLogopedia } from './features/logopedia.js';

/**
 * Składa aplikację: wspólny kontekst (`ctx`) i wszystkie funkcje. Okno i dokument są
 * przekazywane z zewnątrz, dzięki temu te same moduły działają w przeglądarce i w testach.
 */
export function createApp({ window: win, document: doc }) {
  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];
  const ctx = { win, doc, $, $$, ri, shuffle, pick, esc, animate, state: { op: 'add' } };

  Object.assign(ctx, createStorage(win)); // ls, prof, store, pkey

  ctx.audio = createAudio(win);
  const ui = createUI(ctx);
  ctx.ui = ui;
  ctx.show = ui.show;
  ctx.overlay = ui.overlay;

  const menu = initMenu(ctx);
  ctx.refreshBest = menu.refreshBest;

  const profiles = initProfiles(ctx);
  ctx.rec = profiles.rec;
  ctx.statSay = profiles.statSay;
  ctx.statGym = profiles.statGym;

  initFall(ctx);
  initFrog(ctx);
  initLetters(ctx);
  initBuild(ctx);
  initBlocks(ctx);
  initLogopedia(ctx);

  function start() {
    win.addEventListener('error', (e) => {
      const b = $('#err');
      b.hidden = false;
      b.textContent = 'Błąd w grze: ' + e.message;
    });
    menu.refreshBest();
    profiles.start();
  }

  return { ctx, start };
}

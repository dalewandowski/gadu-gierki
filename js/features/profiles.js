import { SOUNDS } from '../data/words.js';

const AVATARS = ['🐸', '🦁', '🐱', '🐶', '🦄', '🐼', '🐯', '🐰'];
const MAX_CHILDREN = 6;
/** Klucze sprzed wprowadzenia profili. Pierwsze dziecko przejmuje te wyniki. */
const LEGACY = ['bestFall', 'bestSyl', 'bestFrog', 'blocksDone', 'blocksOpen', 'logoStars'];
const DATA_KEYS = [...LEGACY, 'buildDone', 'buildOpen', 'stats'];
const CATS = [
  ['add', 'Dodawanie'], ['sub', 'Odejmowanie'], ['syl', 'Łap sylabę'], ['abc', 'Jaka to litera?'],
  ['build', 'Ułóż wyraz'], ['blocks', 'Klocki sylab'], ['find', 'Znajdź głoskę']
];
const DAYN = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];

/** Data lokalna w postaci RRRR-MM-DD. */
export function dayKey(dt) {
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  return `${dt.getFullYear()}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

const barClass = (pc) => (pc >= 80 ? '' : (pc >= 50 ? 'mid' : 'low'));

/**
 * Profile dzieci (imię + obrazek), zapis wyników i ekran postępów.
 * Zwraca funkcje zapisujące wyniki, z których korzystają gry.
 */
export function initProfiles(ctx) {
  const { $, doc, ri, esc, ls, prof, store } = ctx;
  const whoState = { adding: false, av: AVATARS[0] };
  let statsConfirm = '';

  /* ---------- profile ---------- */

  function loadProfiles() {
    try { prof.list = JSON.parse(ls.get('profiles') || '[]'); } catch { prof.list = []; }
    if (!Array.isArray(prof.list)) prof.list = [];
    prof.list = prof.list.filter((p) => p && p.id && p.name);
    const c = ls.get('curProfile');
    prof.cur = prof.list.some((p) => p.id === c) ? c : null;
  }

  function saveProfiles() {
    ls.set('profiles', JSON.stringify(prof.list));
    if (prof.cur) ls.set('curProfile', prof.cur); else ls.del('curProfile');
  }

  const curProfile = () => prof.list.find((p) => p.id === prof.cur) || null;

  function updateWhoBar() {
    const p = curProfile();
    $('#whoAv').textContent = p ? p.av : '';
    $('#whoNm').textContent = p ? p.name : '';
  }

  function chooseProfile(id) {
    prof.cur = id;
    saveProfiles();
    updateWhoBar();
    ctx.refreshBest();
    ctx.show('menu');
  }

  function openWho() {
    whoState.adding = false;
    ctx.show('who');
    renderWho();
  }

  function renderWho() {
    const n = prof.list.length;
    const adding = whoState.adding || n === 0;
    $('#whoLead').textContent = n ? 'Kto dziś gra?' : 'Dodaj dziecko, żeby zacząć. Każde dziecko ma własne wyniki.';
    const box = $('#whoCards');
    box.innerHTML = '';
    prof.list.forEach((p) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'card';
      b.innerHTML = `<div class="ico e">${esc(p.av)}</div><div><h2>${esc(p.name)}</h2><p>Stuknij, aby zacząć grać</p></div>`;
      b.addEventListener('click', () => chooseProfile(p.id));
      box.appendChild(b);
    });
    $('#whoNew').hidden = !adding;
    $('#whoAdd').hidden = adding || n >= MAX_CHILDREN;
    $('#whoCancel').hidden = n === 0;
    const av = $('#whoAvs');
    av.innerHTML = '';
    AVATARS.forEach((a) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'av';
      b.textContent = a;
      b.setAttribute('aria-pressed', String(a === whoState.av));
      b.setAttribute('aria-label', 'Obrazek ' + a);
      b.addEventListener('click', () => { whoState.av = a; renderWho(); });
      av.appendChild(b);
    });
  }

  function createProfile() {
    const name = $('#whoName').value.trim().slice(0, 12);
    if (!name) {
      $('#whoNote').textContent = 'Wpisz imię dziecka.';
      $('#whoName').focus();
      return;
    }
    const p = { id: Date.now().toString(36) + ri(10, 99), name, av: whoState.av };
    if (prof.list.length === 0) {
      LEGACY.forEach((k) => { const v = ls.get(k); if (v !== null) ls.set(`p${p.id}:${k}`, v); });
    }
    prof.list.push(p);
    $('#whoName').value = '';
    $('#whoNote').textContent = '';
    chooseProfile(p.id);
  }

  $('#whoCreate').addEventListener('click', createProfile);
  $('#whoName').addEventListener('keydown', (e) => { if (e.key === 'Enter') createProfile(); });
  $('#whoAdd').addEventListener('click', () => {
    whoState.adding = true;
    whoState.av = AVATARS.find((a) => !prof.list.some((p) => p.av === a)) || AVATARS[0];
    renderWho();
    $('#whoName').focus();
  });
  $('#whoCancel').addEventListener('click', () => { whoState.adding = false; renderWho(); });
  $('#whoBtn').addEventListener('click', openWho);

  /* ---------- zapis wyników ---------- */

  function stat() {
    let s = store.getJ('stats', null);
    if (!s || typeof s !== 'object') s = {};
    s.c = s.c || {};
    s.s = s.s || {};
    s.say = s.say || {};
    s.d = s.d || {};
    s.gym = s.gym || 0;
    return s;
  }

  /** Zlicza zadanie w dzisiejszym dniu i usuwa dni starsze niż 40. */
  function bump(s) {
    const k = dayKey(new Date());
    s.d[k] = (s.d[k] || 0) + 1;
    const cut = new Date();
    cut.setDate(cut.getDate() - 40);
    const ck = dayKey(cut);
    Object.keys(s.d).forEach((x) => { if (x < ck) delete s.d[x]; });
  }

  /** Zapisuje odpowiedź w kategorii cat (dobra lub zła), opcjonalnie z głoską snd. */
  function rec(cat, ok, snd) {
    const s = stat();
    const a = s.c[cat] || (s.c[cat] = [0, 0]);
    a[ok ? 0 : 1]++;
    if (snd) {
      const b = s.s[snd] || (s.s[snd] = [0, 0]);
      b[ok ? 0 : 1]++;
    }
    bump(s);
    store.setJ('stats', s);
  }

  function statSay(k) {
    const s = stat();
    s.say[k] = (s.say[k] || 0) + 1;
    bump(s);
    store.setJ('stats', s);
  }

  function statGym() {
    const s = stat();
    s.gym += 1;
    bump(s);
    store.setJ('stats', s);
  }

  /* ---------- ekran postępów ---------- */

  const statTile = (v, label) => `<div class="stat"><b>${esc(v)}</b><span>${esc(label)}</span></div>`;

  function renderStats() {
    const p = curProfile();
    const s = stat();
    $('#stName').textContent = p ? p.name : '';

    let h = '<div class="statgrid">'
      + statTile(store.get('bestFall', 0), 'Łap cyfry, rekord')
      + statTile(store.get('bestSyl', 0), 'Łap sylabę, rekord')
      + statTile(store.get('bestFrog', 1), 'Żaba, poziom')
      + statTile(store.get('blocksDone', 0) + ' z 60', 'Klocki sylab')
      + statTile(store.get('buildDone', 0) + ' z 30', 'Ułóż wyraz')
      + statTile(store.get('logoStars', 0), 'Gwiazdki z logopedii')
      + statTile(s.gym, 'Gimnastyka buzi, razy')
      + '</div>';

    const days = [];
    let max = 1;
    for (let i = 6; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const c = s.d[dayKey(dt)] || 0;
      if (c > max) max = c;
      days.push({ n: DAYN[dt.getDay()], c });
    }
    h += '<div class="h3">Ostatnie 7 dni</div><div class="week">';
    days.forEach((x) => {
      h += `<div class="wd"><em>${x.c || ''}</em><i style="height:${x.c ? Math.max(6, Math.round(x.c / max * 64)) : 0}px"></i><small>${x.n}</small></div>`;
    });
    h += '</div><p class="note" style="text-align:left; min-height:0">Liczba rozwiązanych zadań każdego dnia.</p>';

    let rows = '';
    CATS.forEach(([key, name]) => {
      const a = s.c[key];
      if (!a || a[0] + a[1] === 0) return;
      const t = a[0] + a[1];
      const pc = Math.round(a[0] * 100 / t);
      rows += `<div class="srow"><span class="sn">${esc(name)}</span><div class="sbar"><i class="${barClass(pc)}" style="width:${pc}%"></i></div><span class="sv">${a[0]} z ${t} (${pc}%)</span></div>`;
    });
    h += '<div class="h3">Skuteczność</div>'
      + (rows || '<p class="note" style="text-align:left">Zagraj w kilka gier, a tu pojawią się wyniki.</p>');

    let srows = '';
    let weak = null;
    SOUNDS.forEach((so) => {
      const a = s.s[so.k] || [0, 0];
      const t = a[0] + a[1];
      const said = s.say[so.k] || 0;
      if (!t && !said) return;
      const pc = t ? Math.round(a[0] * 100 / t) : -1;
      if (t >= 4 && pc < 80 && (!weak || pc < weak.pc)) weak = { k: so.k, pc };
      srows += `<div class="srow"><span class="sn">${esc(so.k)}${said ? `<small>powtórzone: ${said}</small>` : ''}</span>`
        + `<div class="sbar">${t ? `<i class="${barClass(pc)}" style="width:${pc}%"></i>` : ''}</div>`
        + `<span class="sv">${t ? `${a[0]} z ${t}` : '–'}</span></div>`;
    });
    if (srows) {
      h += '<div class="h3">Głoski</div>';
      if (weak) {
        h += `<p class="parent" style="margin-bottom:10px">Warto poćwiczyć głoskę <b>${esc(weak.k)}</b>: ${weak.pc}% poprawnych odpowiedzi w grze „Znajdź głoskę”.</p>`;
      }
      h += srows;
    }

    h += '<div class="danger">';
    if (statsConfirm === 'reset') {
      h += '<span>Wyczyścić wszystkie wyniki tego dziecka?</span><button type="button" class="sm red" data-act="reset-yes">Tak, wyczyść</button><button type="button" class="sm" data-act="no">Nie</button>';
    } else if (statsConfirm === 'delete') {
      h += '<span>Usunąć to dziecko razem z wynikami?</span><button type="button" class="sm red" data-act="delete-yes">Tak, usuń</button><button type="button" class="sm" data-act="no">Nie</button>';
    } else {
      h += '<button type="button" class="sm" data-act="reset">Wyczyść wyniki</button><button type="button" class="sm" data-act="delete">Usuń to dziecko</button>';
    }
    h += '</div>';
    $('#stBody').innerHTML = h;
  }

  const wipe = (id) => DATA_KEYS.forEach((k) => ls.del(`p${id}:${k}`));

  $('#stBody').addEventListener('click', (e) => {
    const b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    const act = b.getAttribute('data-act');
    if (act === 'reset' || act === 'delete') { statsConfirm = act; renderStats(); }
    else if (act === 'no') { statsConfirm = ''; renderStats(); }
    else if (act === 'reset-yes') {
      wipe(prof.cur);
      statsConfirm = '';
      ctx.refreshBest();
      renderStats();
    } else if (act === 'delete-yes') {
      const id = prof.cur;
      wipe(id);
      prof.list = prof.list.filter((p) => p.id !== id);
      prof.cur = null;
      saveProfiles();
      updateWhoBar();
      statsConfirm = '';
      openWho();
    }
  });

  $('#goStats').addEventListener('click', () => {
    statsConfirm = '';
    ctx.show('stats');
    renderStats();
  });

  /** Start aplikacji: menu dla ostatniego dziecka albo wybór dziecka. */
  function start() {
    loadProfiles();
    updateWhoBar();
    if (prof.cur) { ctx.refreshBest(); ctx.show('menu'); } else { openWho(); }
  }

  return { rec, statSay, statGym, start };
}

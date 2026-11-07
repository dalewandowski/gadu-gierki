import { WORDS } from '../data/words.js';

/** Pierwsze litery wszystkich słów z gry, z których losujemy błędne odpowiedzi. */
export const FIRST_LETTERS = [...new Set(WORDS.map((w) => w[0][0]))];
const QUESTIONS = 10;

/** Gra „Jaka to litera?": obrazek i trzy litery do wyboru. */
export function initLetters(ctx) {
  const { $, doc, shuffle, pick, animate, audio, ui } = ctx;
  const { sfx, speak } = audio;
  const abc = { i: 0, stars: 0, list: [], cur: null, locked: false, miss: false, timer: 0 };

  ui.onLeave(() => clearTimeout(abc.timer));

  function startAbc() {
    ctx.show('abc');
    clearTimeout(abc.timer);
    abc.list = shuffle(WORDS.slice()).slice(0, QUESTIONS);
    abc.i = 0;
    abc.stars = 0;
    $('#abcOverlay').hidden = true;
    $('#abcOverlay').innerHTML = '';
    nextAbc();
  }

  function nextAbc() {
    if (abc.i >= QUESTIONS) { abcDone(); return; }
    const w = abc.list[abc.i];
    abc.cur = w;
    abc.locked = false;
    abc.miss = false;
    $('#abcNo').textContent = abc.i + 1;
    $('#abcStars').textContent = abc.stars;
    $('#abcPic').textContent = w[1];
    $('#abcWord').textContent = w[0];
    $('#abcNote').textContent = '';
    const letter = w[0][0];
    const box = $('#abcChoices');
    box.innerHTML = '';
    shuffle([letter, ...pick(FIRST_LETTERS, letter, 2)]).forEach((L) => {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'ans';
      b.innerHTML = `${L}<span class="lc">${L.toLowerCase()}</span>`;
      b.addEventListener('click', () => abcAnswer(L, b));
      box.appendChild(b);
    });
    speak(w[0].toLowerCase());
  }

  function abcAnswer(L, btn) {
    if (abc.locked) return;
    const w = abc.cur;
    const ok = L === w[0][0];
    ctx.rec('abc', ok);
    if (ok) {
      abc.locked = true;
      btn.classList.add('ok');
      sfx.good();
      if (!abc.miss) { abc.stars++; $('#abcStars').textContent = abc.stars; }
      $('#abcWord').innerHTML = `<b>${w[0][0]}</b>${w[0].slice(1)}`;
      $('#abcNote').textContent = `Brawo! ${w[0][0]} jak ${w[0].toLowerCase()}.`;
      abc.i++;
      abc.timer = setTimeout(nextAbc, 1500);
    } else {
      abc.miss = true;
      sfx.bad();
      animate(btn, 'no');
      $('#abcNote').textContent = 'To nie ta litera. Spróbuj jeszcze raz.';
    }
  }

  function abcDone() {
    sfx.win();
    ctx.overlay($('#abcOverlay'), 'Brawo!', `Gwiazdki: ${abc.stars} z ${QUESTIONS}. Gwiazdka jest za odpowiedź bez pomyłki.`, 'Jeszcze raz', startAbc, true);
  }

  $('#abcListen').addEventListener('click', () => { if (abc.cur) speak(abc.cur[0].toLowerCase()); });
  $('#goAbc').addEventListener('click', startAbc);
}

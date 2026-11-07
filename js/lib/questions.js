import { ri, shuffle, pick } from './util.js';
import { SYL_C, SYL_V, SYL_WORDS } from '../data/words.js';

/**
 * Zadanie z dodawania lub odejmowania w zakresie 1-10.
 * op: 'add', 'sub' albo 'mix' (losowo jedno z dwóch).
 */
export function makeQ(op, max = 10) {
  const o = op === 'mix' ? (Math.random() < 0.5 ? 'add' : 'sub') : op;
  if (o === 'add') {
    const a = ri(1, max - 1);
    const b = ri(1, max - a);
    return { text: `${a} + ${b}`, ans: a + b };
  }
  const a = ri(2, max);
  const b = ri(1, a - 1);
  return { text: `${a} − ${b}`, ans: a - b };
}

/** Największa liczba w zadaniach na danym poziomie: zaczyna od 5, od poziomu 11 jest 10. */
export function numMax(level) {
  return Math.min(10, 4 + Math.floor((Math.max(level, 1) + 1) / 2));
}

/** n różnych liczb z 1-max, bez poprawnej odpowiedzi. */
export function others(ans, n, max = 10) {
  const pool = [];
  for (let i = 1; i <= max; i++) if (i !== ans) pool.push(i);
  return shuffle(pool).slice(0, n);
}

/** Runda gry ze spadającymi cyframi: polecenie, poprawna odpowiedź i 4 spadające opcje. */
export function mathRound(op, max = 10) {
  const q = makeQ(op, max);
  return {
    prompt: `${q.text} = ?`,
    ans: q.ans,
    opts: shuffle([q.ans, ...others(q.ans, 3, max)]),
    reveal: `${q.text} = ${q.ans}`,
    say: ''
  };
}

/** Wszystkie sylaby dostępne na danym poziomie (1-4): spółgłoska + samogłoska. */
export function sylPool(level) {
  const vs = SYL_V[Math.min(level, 4)];
  const out = [];
  SYL_C.forEach((c) => vs.forEach((v) => out.push(c + v)));
  return out;
}

/** Runda gry ze spadającymi sylabami. Od poziomu 3 bywa uzupełnianie brakującej sylaby. */
export function sylRound(level) {
  if (level >= 3 && Math.random() < 0.5) {
    const w = SYL_WORDS[ri(0, SYL_WORDS.length - 1)];
    return {
      prompt: `${w[2]}  ___-${w[1]}`,
      ans: w[0],
      opts: shuffle([w[0], ...pick(sylPool(4), w[0], 3)]),
      reveal: `${w[0]}-${w[1]}`,
      say: (w[0] + w[1]).toLowerCase()
    };
  }
  const pool = sylPool(level);
  const ans = pool[ri(0, pool.length - 1)];
  return {
    prompt: `Złap: ${ans}`,
    ans,
    opts: shuffle([ans, ...pick(pool, ans, 3)]),
    reveal: ans,
    say: ans.toLowerCase()
  };
}

/** Losowa liczba całkowita z przedziału [a, b]. */
export const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/** Miesza tablicę w miejscu i zwraca ją. */
export function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Losuje n elementów z puli, pomijając element `exclude`. */
export function pick(pool, exclude, n) {
  return shuffle(pool.filter((x) => x !== exclude)).slice(0, n);
}

/** Zamienia znaki specjalne HTML, gdy tekst od użytkownika trafia do innerHTML. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Uruchamia animację CSS od początku, także gdy klasa już jest na elemencie. */
export function animate(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

/** Podświetla w słowie fragmenty pasujące do wzoru (zwraca HTML). */
export function hl(word, re) {
  return word.replace(new RegExp('(' + re + ')', 'g'), '<b>$1</b>');
}

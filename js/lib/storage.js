/**
 * Zapis w przeglądarce (localStorage) z pamięcią tymczasową na wypadek, gdy przeglądarka
 * blokuje zapis (np. okno prywatne). Wyniki są zapisywane osobno dla każdego dziecka:
 * klucz dziecka ma postać `p<id>:<nazwa>`.
 */
export function createStorage(win) {
  const mem = {};

  const ls = {
    get(k) {
      try {
        const v = win.localStorage.getItem(k);
        if (v !== null) return v;
      } catch { /* zapis zablokowany */ }
      return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    },
    set(k, v) {
      mem[k] = String(v);
      try { win.localStorage.setItem(k, String(v)); } catch { /* zapis zablokowany */ }
    },
    del(k) {
      delete mem[k];
      try { win.localStorage.removeItem(k); } catch { /* zapis zablokowany */ }
    }
  };

  /** Lista dzieci i aktualnie wybrane dziecko. */
  const prof = { list: [], cur: null };

  const pkey = (k) => (prof.cur ? `p${prof.cur}:${k}` : k);

  const store = {
    get(k, d) { const v = ls.get(pkey(k)); return v === null ? d : Number(v); },
    set(k, v) { ls.set(pkey(k), v); },
    getJ(k, d) {
      try { const v = ls.get(pkey(k)); return v === null ? d : JSON.parse(v); } catch { return d; }
    },
    setJ(k, v) { ls.set(pkey(k), JSON.stringify(v)); }
  };

  return { ls, prof, store, pkey };
}

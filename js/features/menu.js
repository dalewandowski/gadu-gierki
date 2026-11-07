/** Menu główne: wybór rodzaju działań, przełącznik dźwięku i rekordy na kartach gier. */
export function initMenu(ctx) {
  const { $, $$, store, audio, state } = ctx;

  $$('#opSeg button').forEach((b) => {
    b.addEventListener('click', () => {
      state.op = b.getAttribute('data-op');
      $$('#opSeg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
  });

  $('#soundToggle').addEventListener('change', (e) => { audio.enabled = e.target.checked; });

  /** Odświeża rekordy pokazywane na kartach (dla aktualnie wybranego dziecka). */
  function refreshBest() {
    $('#bestFall').textContent = store.get('bestFall', 0);
    $('#bestSyl').textContent = store.get('bestSyl', 0);
    $('#bestFrog').textContent = store.get('bestFrog', 1);
  }

  /** Każdy przycisk „← Menu" wraca do menu (zegary gier zatrzymuje `show`). */
  $$('[data-back]').forEach((b) => {
    b.addEventListener('click', () => { ctx.show('menu'); refreshBest(); });
  });

  return { refreshBest };
}

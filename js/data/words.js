/**
 * Dane do gier z literkami i do ćwiczeń logopedycznych.
 * Żeby dodać słowo, dopisz je do odpowiedniej listy. Testy w tests/data.test.js
 * sprawdzą, czy dane mają poprawny kształt.
 */

/** Gra „Jaka to litera?": słowo i obrazek. */
export const WORDS = [
  ['ARBUZ', '🍉'], ['BALON', '🎈'], ['CYTRYNA', '🍋'], ['DOM', '🏠'], ['GRUSZKA', '🍐'], ['JABŁKO', '🍎'],
  ['KOT', '🐱'], ['LEW', '🦁'], ['MOTYL', '🦋'], ['OWCA', '🐑'], ['PIES', '🐶'], ['RYBA', '🐟'],
  ['SŁOŃ', '🐘'], ['TYGRYS', '🐯'], ['WĄŻ', '🐍'], ['ZEBRA', '🦓'], ['ŻABA', '🐸'], ['ŁÓDKA', '⛵']
];

/**
 * Gra „Ułóż wyraz": słowa pogrupowane według liczby liter. Poziomy 1-12 to wyrazy 3-literowe,
 * potem 4-, 5-, 6- i 7-literowe (zobacz buildLength w js/features/build.js).
 */
export const BUILD_WORDS = {
  3: [['KOT', '🐱'], ['DOM', '🏠'], ['LAS', '🌲'], ['SER', '🧀'], ['NOS', '👃'], ['LEW', '🦁'], ['OKO', '👁️'], ['RAK', '🦀'],
    ['BUT', '👟'], ['SÓL', '🧂'], ['LIS', '🦊'], ['SOK', '🧃'], ['KOŃ', '🐴'], ['WÓŁ', '🐂'], ['ŻUK', '🪲'], ['DĄB', '🌳'],
    ['ZĄB', '🦷'], ['NÓŻ', '🔪'], ['SEN', '😴'], ['LÓD', '🧊'], ['MIŚ', '🧸'], ['TIR', '🚛'], ['MUR', '🧱'], ['ZOO', '🦒']],
  4: [['MAMA', '👩'], ['TATA', '👨'], ['RYBA', '🐟'], ['ŻABA', '🐸'], ['SOWA', '🦉'], ['KAWA', '☕'], ['KURA', '🐔'], ['LODY', '🍦'],
    ['RĘKA', '✋'], ['NOGA', '🦵'], ['UCHO', '👂'], ['ŻÓŁW', '🐢'], ['SŁOŃ', '🐘'], ['PIES', '🐶'], ['ŁÓDŹ', '⛵'], ['MYSZ', '🐭'],
    ['AUTO', '🚗'], ['BUTY', '👟'], ['ZUPA', '🍲'], ['TORT', '🎂'], ['MIÓD', '🍯'], ['PTAK', '🐦']],
  5: [['ZEBRA', '🦓'], ['MOTYL', '🦋'], ['ARBUZ', '🍉'], ['BALON', '🎈'], ['KWIAT', '🌸'], ['BANAN', '🍌'], ['ROWER', '🚲'], ['JAJKO', '🥚'],
    ['MLEKO', '🥛'], ['LAMPA', '💡'], ['KLUCZ', '🔑'], ['ZEGAR', '⏰'], ['ŁYŻKA', '🥄'], ['KROWA', '🐄'], ['MUCHA', '🪰'], ['PIŁKA', '⚽'],
    ['TRAWA', '🌿'], ['CHLEB', '🍞']],
  6: [['TYGRYS', '🐯'], ['KACZKA', '🦆'], ['DRZEWO', '🌳'], ['CHMURA', '☁️'], ['ŻYRAFA', '🦒'], ['PAPUGA', '🦜'], ['JABŁKO', '🍎']],
  7: [['SAMOLOT', '✈️'], ['KSIĄŻKA', '📖'], ['GRUSZKA', '🍐'], ['CYTRYNA', '🍋'], ['TELEFON', '📱'], ['RAKIETA', '🚀'], ['TRAMWAJ', '🚋']]
};

/** Sylaby do gry „Złap sylabę": spółgłoski, a samogłoski zależnie od poziomu. */
export const SYL_C = ['M', 'T', 'L', 'K', 'P', 'S', 'B', 'D', 'N', 'R', 'W', 'Z'];
export const SYL_V = { 1: ['A'], 2: ['A', 'O'], 3: ['A', 'O', 'E', 'U'], 4: ['A', 'O', 'E', 'U', 'I', 'Y'] };

/** Słowa dwusylabowe do uzupełniania brakującej sylaby: [sylaba 1, sylaba 2, obrazek]. */
export const SYL_WORDS = [
  ['SO', 'WA', '🦉'], ['RY', 'BA', '🐟'], ['ŻA', 'BA', '🐸'], ['KA', 'WA', '☕'], ['LO', 'DY', '🍦'],
  ['LA', 'MA', '🦙'], ['RO', 'WER', '🚲'], ['MA', 'MA', '👩'], ['TA', 'TA', '👨'], ['KU', 'RA', '🐔']
];

/**
 * Gra „Klocki sylab": 3 serie (słowa z 2, 3 i 4 sylab). Sylaby oddziela myślnik.
 * Każda seria ma 20 poziomów, a słowo na poziomie jest losowane z całej serii, więc im więcej
 * słów na liście, tym większa różnorodność. Dopisz własne słowa do odpowiedniej serii.
 */
export const BLOCK_WORDS = [
  [['MA-MA', '👩'], ['SO-WA', '🦉'], ['RY-BA', '🐟'], ['KA-WA', '☕'], ['LO-DY', '🍦'], ['KO-TEK', '🐱'], ['PIE-SEK', '🐶'], ['ŻA-BA', '🐸'], ['ZE-BRA', '🦓'], ['KWIA-TEK', '🌸'],
    ['NO-GA', '🦵'], ['RĘ-KA', '✋'], ['KU-RA', '🐔'], ['KRO-WA', '🐄'], ['KACZ-KA', '🦆'], ['MU-CHA', '🪰'], ['JAJ-KO', '🥚'], ['ZU-PA', '🍲'], ['AU-TO', '🚗'], ['RO-WER', '🚲'],
    ['BU-TY', '👟'], ['SZA-LIK', '🧣'], ['GRUSZ-KA', '🍐'], ['BA-NAN', '🍌'], ['CIA-STO', '🍰'], ['SŁO-IK', '🫙'], ['PSZCZO-ŁA', '🐝'], ['DRZE-WO', '🌳'], ['KSIĄŻ-KA', '📖'], ['ŁYŻ-KA', '🥄'],
    ['LAM-PA', '💡'], ['DZWO-NEK', '🔔']],
  [['PA-PU-GA', '🦜'], ['RA-KIE-TA', '🚀'], ['MA-KA-RON', '🍝'], ['PO-MI-DOR', '🍅'], ['PA-RA-SOL', '☂️'], ['TE-LE-FON', '📱'], ['ŻY-RA-FA', '🦒'], ['CY-TRY-NA', '🍋'], ['KRO-KO-DYL', '🐊'], ['DI-NO-ZAUR', '🦖'],
    ['BA-NA-NY', '🍌'], ['KA-NA-PA', '🛋️'], ['PA-PRY-KA', '🫑'], ['CE-BU-LA', '🧅'], ['SA-ŁA-TA', '🥗'], ['KA-PU-STA', '🥬'], ['TRUS-KAW-KA', '🍓'], ['ZE-GA-REK', '⏰'], ['KA-LEN-DARZ', '📅'], ['LO-DÓW-KA', '🧊'],
    ['MO-TY-LEK', '🦋'], ['BIE-DRON-KA', '🐞'], ['BU-TEL-KA', '🍼'], ['WA-LIZ-KA', '🧳'], ['GI-TA-RA', '🎸'], ['PO-DUSZ-KA', '🛏️'], ['A-NA-NAS', '🍍'], ['ZA-BAW-KA', '🧸'], ['MI-KRO-FON', '🎤'], ['E-LE-FANT', '🐘']],
  [['O-KU-LA-RY', '👓'], ['PO-MI-DO-RY', '🍅'], ['KA-RU-ZE-LA', '🎠'], ['TE-LE-WI-ZOR', '📺'], ['CZE-KO-LA-DA', '🍫'], ['PO-MA-RAŃ-CZA', '🍊'], ['NO-SO-RO-ŻEC', '🦏'], ['HI-PO-PO-TAM', '🦛'], ['HE-LI-KOP-TER', '🚁'], ['SA-MO-LO-TY', '✈️'],
    ['BA-LE-RI-NA', '💃'], ['BI-BLIO-TE-KA', '📚'], ['SA-MO-CHO-DY', '🚙'], ['A-KRO-BA-TA', '🤸'], ['MA-RY-NAR-KA', '🧥'], ['MA-KA-RO-NY', '🍝'], ['TE-LE-FO-NY', '📱'], ['KRO-KO-DY-LE', '🐊'], ['PA-RA-SO-LE', '☂️'], ['DI-NO-ZAU-RY', '🦖'],
    ['TRAM-PO-LI-NA', '🤸']]
];

/** Gimnastyka buzi i języka: nazwa, obrazek, liczba powtórzeń, instrukcja. */
export const GYM = [
  { t: 'Szeroki uśmiech', e: '😁', n: 5, d: 'Uśmiechnij się szeroko, zęby są razem. Policz do pięciu.' },
  { t: 'Dzióbek', e: '😗', n: 5, d: 'Wysuń usta do przodu jak rurka. Policz do pięciu.' },
  { t: 'Uśmiech i dzióbek', e: '😁', n: 6, d: 'Raz szeroki uśmiech, raz dzióbek. Zmieniaj powoli.' },
  { t: 'Balon w buzi', e: '🎈', n: 5, d: 'Nadmuchaj policzki jak balon. Zatrzymaj powietrze i policz do trzech.' },
  { t: 'Język do nosa', e: '👅', n: 5, d: 'Otwórz buzię i wyciągnij język do góry, w stronę nosa.' },
  { t: 'Język do brody', e: '👅', n: 5, d: 'Otwórz buzię i wyciągnij język w dół, w stronę brody.' },
  { t: 'Zegar', e: '🕐', n: 6, d: 'Język wędruje od jednego kącika ust do drugiego, jak wahadło zegara.' },
  { t: 'Konik', e: '🐴', n: 6, d: 'Kląskaj językiem jak konik: kląsk, kląsk, kląsk.' },
  { t: 'Parskanie', e: '🐴', n: 5, d: 'Parskaj wargami jak koń: prrr.' },
  { t: 'Malowanie', e: '🖌️', n: 5, d: 'Czubkiem języka maluj podniebienie, od zębów w głąb buzi.' }
];

/**
 * Głoski do ćwiczeń: k - nazwa, re - wzór wyrazów z tą głoską (S nie liczy się w „SZ"),
 * fam - głoska brzmiąca podobnie (nie pojawia się jako błędna odpowiedź),
 * syl - sylaby do powtarzania, w - 6 słów z obrazkami.
 */
export const SOUNDS = [
  { k: 'S', re: 'S(?!Z)', fam: 'SZ', syl: ['SA', 'SO', 'SU', 'SE', 'SY'],
    w: [['SOWA', '🦉'], ['SŁOŃ', '🐘'], ['SER', '🧀'], ['SOK', '🧃'], ['SAMOCHÓD', '🚗'], ['SKARPETA', '🧦']] },
  { k: 'Z', re: '(?<![SCD])Z', fam: 'Ż', syl: ['ZA', 'ZO', 'ZU', 'ZE', 'ZY'],
    w: [['ZEBRA', '🦓'], ['ZEGAR', '⏰'], ['ZAMEK', '🏰'], ['ZUPA', '🍲'], ['ZĄB', '🦷'], ['ZAJĄC', '🐰']] },
  { k: 'C', re: 'C(?!Z)', fam: 'CZ', syl: ['CA', 'CO', 'CU', 'CE', 'CY'],
    w: [['CYTRYNA', '🍋'], ['CEBULA', '🧅'], ['CUKIEREK', '🍬'], ['CYRK', '🎪'], ['CEGŁA', '🧱'], ['OWCA', '🐑']] },
  { k: 'SZ', re: 'SZ', fam: 'S', syl: ['SZA', 'SZO', 'SZU', 'SZE', 'SZY'],
    w: [['SZALIK', '🧣'], ['SZKOŁA', '🏫'], ['SZACHY', '♟️'], ['MYSZ', '🐭'], ['GRUSZKA', '🍐'], ['KOSZ', '🧺']] },
  { k: 'Ż', re: 'Ż', fam: 'Z', syl: ['ŻA', 'ŻO', 'ŻU', 'ŻE', 'ŻY'],
    w: [['ŻABA', '🐸'], ['ŻYRAFA', '🦒'], ['ŻAGIEL', '⛵'], ['ŻÓŁW', '🐢'], ['ŻARÓWKA', '💡'], ['WĄŻ', '🐍']] },
  { k: 'CZ', re: 'CZ', fam: 'C', syl: ['CZA', 'CZO', 'CZU', 'CZE', 'CZY'],
    w: [['CZAPKA', '🧢'], ['CZEKOLADA', '🍫'], ['CZAJNIK', '🫖'], ['CZEREŚNIE', '🍒'], ['KLUCZ', '🔑'], ['MECZ', '⚽']] },
  { k: 'R', re: 'R', fam: 'L', syl: ['RA', 'RO', 'RU', 'RE', 'RY'],
    w: [['RYBA', '🐟'], ['RAKIETA', '🚀'], ['ROWER', '🚲'], ['ROBOT', '🤖'], ['KURA', '🐔'], ['PARASOL', '☂️']] },
  { k: 'L', re: 'L', fam: 'R', syl: ['LA', 'LO', 'LU', 'LE', 'LY'],
    w: [['LEW', '🦁'], ['LODY', '🍦'], ['LAS', '🌲'], ['LIS', '🦊'], ['BALON', '🎈'], ['LUPA', '🔍']] }
];

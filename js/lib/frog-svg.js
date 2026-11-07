/** Rysunek żaby jako SVG. Kolory: body - ciało, dark - łapy. */
export function frogSVG(body, dark, cls = 'frogsvg', style = '') {
  return `<svg class="${cls}" viewBox="0 0 64 56" style="${style}">`
    + `<ellipse cx="12" cy="50" rx="10" ry="5" fill="${dark}"/>`
    + `<ellipse cx="52" cy="50" rx="10" ry="5" fill="${dark}"/>`
    + `<ellipse cx="32" cy="36" rx="24" ry="16" fill="${body}"/>`
    + '<ellipse cx="32" cy="42" rx="14" ry="8" fill="#DDF7CF"/>'
    + `<circle cx="20" cy="20" r="10" fill="${body}"/>`
    + `<circle cx="44" cy="20" r="10" fill="${body}"/>`
    + '<circle cx="20" cy="19" r="6.5" fill="#FFFFFF"/>'
    + '<circle cx="44" cy="19" r="6.5" fill="#FFFFFF"/>'
    + '<circle cx="21.5" cy="19.5" r="3.2" fill="#1B3A4B"/>'
    + '<circle cx="42.5" cy="19.5" r="3.2" fill="#1B3A4B"/>'
    + '<path d="M23 34 Q32 42 41 34" stroke="#1B3A4B" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    + '</svg>';
}

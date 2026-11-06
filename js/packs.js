// Ілюстрації упаковок і прапорців. Усе малюється SVG-кодом, без фото,
// тож новий товар отримує «упаковку» автоматично з полів k, c1, c2, l.

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const inkOn = (hex) => (luminance(hex) > 0.4 ? "#1b1f33" : "#ffffff");

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}

// Підбирає розмір шрифту, щоб напис уміщувався в ширину упаковки.
function label(text, x, y, maxW, base, fill, extra = "") {
  if (!text) return "";
  const size = Math.min(base, (maxW / (text.length * 0.62)));
  return `<text x="${x}" y="${y}" font-size="${size.toFixed(1)}" fill="${fill}" text-anchor="middle" dominant-baseline="middle" font-family="Unbounded, sans-serif" font-weight="700" ${extra}>${esc(text)}</text>`;
}

const shine = (x, y, w, h, rx = 2) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#fff" opacity=".22"/>`;

const SHAPES = {
  bar: ({ c1, c2, l }) => `
    <rect x="6" y="62" width="88" height="34" rx="3" fill="${c1}"/>
    <path d="M6 62h36l-12 34H6z" fill="${c2}"/>
    <path d="M6 62v34M94 62v34" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
    ${shine(10, 65, 80, 4)}
    ${label(l, 63, 80, 54, 11, inkOn(c1))}`,

  box: ({ c1, c2, l }) => `
    <rect x="12" y="32" width="76" height="64" rx="4" fill="${c1}"/>
    <rect x="12" y="32" width="76" height="7" rx="3" fill="#000" opacity=".12"/>
    <rect x="12" y="50" width="76" height="12" fill="${c2}"/>
    <rect x="44" y="32" width="12" height="64" fill="${c2}" opacity=".85"/>
    <circle cx="50" cy="56" r="9" fill="${c2}" stroke="${c1}" stroke-width="2"/>
    ${label(l, 50, 80, 64, 11, inkOn(c1))}`,

  bag: ({ c1, c2, l }) => `
    <path d="M22 18H78L83 30V86L78 96H22L17 86V30Z" fill="${c1}"/>
    <path d="M22 14h56v6H22zM22 93h56v5H22z" fill="${c2}"/>
    <path d="M24 14v6M30 14v6M36 14v6M42 14v6M48 14v6M54 14v6M60 14v6M66 14v6M72 14v6" stroke="#000" stroke-opacity=".18"/>
    ${shine(22, 24, 6, 60, 3)}
    <ellipse cx="50" cy="58" rx="27" ry="16" fill="${c2}"/>
    ${label(l, 50, 59, 46, 11, inkOn(c2))}`,

  can: ({ c1, c2, l }) => `
    <rect x="30" y="16" width="40" height="82" rx="5" fill="${c1}"/>
    <rect x="32" y="11" width="36" height="7" rx="3" fill="#C9CED8"/>
    <rect x="30" y="34" width="40" height="5" fill="${c2}"/>
    <rect x="30" y="84" width="40" height="5" fill="${c2}"/>
    ${shine(34, 18, 5, 76, 2)}
    ${label(l, 52, 61, 40, 10, c2 === c1 ? inkOn(c1) : c2, 'transform="rotate(-90 52 61)"')}`,

  bottle: ({ c1, c2, l }) => `
    <rect x="44" y="4" width="12" height="7" rx="2" fill="${c2}"/>
    <path d="M45 10h10v16c0 8 11 10 11 20v48q0 4-4 4H38q-4 0-4-4V46c0-10 11-12 11-20z" fill="${c1}"/>
    <rect x="45" y="16" width="10" height="6" fill="${c2}"/>
    <rect x="34" y="56" width="32" height="26" rx="2" fill="${c2}"/>
    ${shine(37, 44, 4, 48, 2)}
    ${label(l, 50, 69, 28, 9, inkOn(c2))}`,

  pet: ({ c1, c2, l }) => `
    <rect x="43" y="6" width="14" height="8" rx="2" fill="${c2}"/>
    <path d="M44 14h12v6c0 6 14 8 14 20v52q0 6-6 6H36q-6 0-6-6V40c0-12 14-14 14-20z" fill="${c1}" opacity=".92"/>
    <path d="M30 46h40M30 90h40" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <rect x="30" y="54" width="40" height="28" fill="${c2}"/>
    ${shine(34, 30, 4, 58, 2)}
    ${label(l, 50, 68, 34, 10, inkOn(c2))}`,

  carton: ({ c1, c2, l }) => `
    <rect x="40" y="14" width="18" height="8" fill="${c1}"/>
    <path d="M28 36L49 20L64 36Z" fill="${c1}"/>
    <path d="M28 36L49 20L64 36Z" fill="#000" opacity=".08"/>
    <path d="M64 36L74 30V92L64 98Z" fill="${c1}"/>
    <path d="M64 36L74 30V92L64 98Z" fill="#000" opacity=".18"/>
    <rect x="28" y="36" width="36" height="62" fill="${c1}"/>
    <rect x="28" y="58" width="36" height="22" fill="${c2}"/>
    <circle cx="46" cy="47" r="5" fill="${c2}"/>
    ${label(l, 46, 69, 32, 9, inkOn(c2))}`,

  jar: ({ c1, c2, l }) => `
    <rect x="30" y="24" width="40" height="11" rx="2" fill="${c2 === c1 ? "#C9A04B" : c2}"/>
    <rect x="26" y="34" width="48" height="64" rx="10" fill="${c1}"/>
    <rect x="26" y="52" width="48" height="26" fill="#FBF7EC"/>
    ${shine(30, 38, 5, 54, 2)}
    ${label(l, 50, 65, 42, 10, luminance(c2) > 0.4 ? "#1b1f33" : c2)}`,

  sausage: ({ c1, c2, l }) => `
    <path d="M5 77l-3-6M5 77l-3 6" stroke="#8a6b4a" stroke-width="2"/>
    <rect x="5" y="62" width="90" height="30" rx="15" fill="${c1}"/>
    ${shine(14, 66, 70, 4)}
    ${l ? `<rect x="32" y="62" width="36" height="30" fill="${c2}"/>${label(l, 50, 77, 32, 8, inkOn(c2))}` : `<path d="M20 70q10 6 0 14M40 68q10 8 0 16M60 68q10 8 0 16M80 70q8 6 0 14" stroke="${c2}" stroke-width="3" fill="none" opacity=".7"/>`}`,

  fish: ({ c1, c2 }) => `
    <path d="M6 76C20 56 58 52 78 70L95 58L92 76L95 94L78 82C58 100 20 96 6 76Z" fill="${c1}"/>
    <path d="M38 60q8-12 22-6l-4 6z" fill="${c2}"/>
    <path d="M30 70q4 6 0 12M42 68q4 8 0 16M54 68q4 8 0 16M66 70q4 6 0 12" stroke="${c2}" stroke-width="1.5" fill="none" opacity=".6"/>
    <circle cx="18" cy="73" r="3" fill="#1b1f33"/>
    <circle cx="19" cy="72" r="1" fill="#fff"/>`,

  tub: ({ c1, c2, l }) => `
    <path d="M20 46H80L74 98H26Z" fill="${c1}"/>
    <path d="M20 46H80L79 54H21Z" fill="#000" opacity=".08"/>
    <rect x="17" y="39" width="66" height="9" rx="3" fill="${c2}"/>
    <path d="M23 82H77L76 90H24Z" fill="${c2}"/>
    ${label(l, 50, 67, 48, 10, inkOn(c1))}`,

  tin: ({ c1, c2, l }) => `
    <rect x="16" y="64" width="68" height="32" rx="3" fill="${c1}"/>
    <ellipse cx="50" cy="64" rx="34" ry="6" fill="#D3D8E2" stroke="#9AA3B5"/>
    <rect x="16" y="71" width="68" height="17" fill="${c2}"/>
    ${label(l, 50, 80, 58, 9, inkOn(c2))}`,

  cone: ({ c1, c2 }) => `
    <path d="M32 46L50 98L68 46Z" fill="#D9A35B"/>
    <path d="M38 52l20 20M44 50l18 18M36 60l14 14M62 52l-20 20M56 50l-18 18M64 60l-14 14" stroke="#A8743A" stroke-width="1.5"/>
    <circle cx="50" cy="38" r="20" fill="${c1}"/>
    <circle cx="42" cy="32" r="5" fill="#fff" opacity=".5"/>
    <path d="M30 46H70L66 60H34Z" fill="${c2}"/>`,

  stick: ({ c1, c2 }) => `
    <rect x="46" y="72" width="8" height="26" rx="3" fill="#E3C08D"/>
    <rect x="32" y="12" width="36" height="66" rx="17" fill="${c1}"/>
    <path d="M34 34q8 6 16 0t16 0M34 46q8 6 16 0t16 0" stroke="${c2}" stroke-width="3" fill="none"/>
    ${shine(37, 20, 5, 46, 2)}`,

  pack: ({ c1, c2, l }) => `
    <rect x="16" y="22" width="68" height="76" rx="6" fill="${c1}"/>
    <rect x="16" y="22" width="68" height="8" rx="4" fill="#000" opacity=".1"/>
    <rect x="22" y="46" width="56" height="28" rx="14" fill="${c2}"/>
    <path d="M22 86h56" stroke="${c2}" stroke-width="4"/>
    ${label(l, 50, 60, 48, 10, inkOn(c2))}`,

  slab: ({ c1, c2, l }) => `
    <path d="M12 66L26 56H92L78 66Z" fill="${c1}"/>
    <path d="M12 66L26 56H92L78 66Z" fill="#fff" opacity=".3"/>
    <path d="M78 66L92 56V88L78 98Z" fill="${c1}"/>
    <path d="M78 66L92 56V88L78 98Z" fill="#000" opacity=".15"/>
    <rect x="12" y="66" width="66" height="32" fill="${c1}"/>
    <rect x="20" y="73" width="50" height="16" fill="${c2}"/>
    ${label(l, 45, 81, 44, 9, inkOn(c2))}`,

  loaf: ({ c1, c2 }) => `
    <path d="M6 92C6 62 28 50 50 50C72 50 94 62 94 92Q94 98 88 98H12Q6 98 6 92Z" fill="${c1}"/>
    <path d="M28 64q6 10 2 22M46 58q6 12 2 26M64 60q6 12 2 24M80 68q4 8 2 16" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M16 74q20-20 60-14" stroke="#fff" stroke-opacity=".18" stroke-width="4" fill="none"/>`,
};

function packSVG(p, cls = "pack") {
  const draw = SHAPES[p.k] || SHAPES.pack;
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${draw(p)}</svg>`;
}

// Фото товару без фону (js/photos.js), а якщо фото немає — намальована упаковка.
function productVisual(p, lazy = true) {
  const slug = photoSlug(p);
  if (typeof PHOTOS === "undefined" || !PHOTOS[slug]) return packSVG(p);
  return `<img class="pack photo" src="img/products/${slug}.webp" alt="" ${lazy ? 'loading="lazy"' : ""} decoding="async">`;
}

const FLAGS = {
  UA: [["#0057B7", 1], ["#FFD700", 1]],
  PL: [["#FFFFFF", 1], ["#DC143C", 1]],
  LT: [["#FDB913", 1], ["#006A44", 1], ["#C1272D", 1]],
  LV: [["#9E3039", 2], ["#FFFFFF", 1], ["#9E3039", 2]],
  AM: [["#D90012", 1], ["#0033A0", 1], ["#F2A800", 1]],
  RS: [["#C6363C", 1], ["#0C4076", 1], ["#FFFFFF", 1]],
  HR: [["#FF0000", 1], ["#FFFFFF", 1], ["#171796", 1]],
};

function flagSVG(code) {
  let body;
  if (code === "GE") {
    body = `<rect width="30" height="20" fill="#fff"/><path d="M13 0h4v20h-4zM0 8h30v4H0z" fill="#FF0000"/>`;
  } else {
    const bands = FLAGS[code] || [["#ccc", 1]];
    const total = bands.reduce((s, [, w]) => s + w, 0);
    let y = 0;
    body = bands.map(([c, w]) => {
      const h = (20 * w) / total;
      const r = `<rect y="${y.toFixed(2)}" width="30" height="${(h + 0.1).toFixed(2)}" fill="${c}"/>`;
      y += h;
      return r;
    }).join("");
  }
  return `<svg class="flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false">${body}</svg>`;
}

// Головна сторінка: полиця в героїчному блоці, відділи, хіти, країни.

const byEn = (en) => PRODUCTS.find((p) => p.en === en);

const HERO_SHELF = [
  ["Lvivske 1715 lager", "Non Stop Original energy drink", "Taras bread kvass", "Morshynska mineral water"],
  ["“Korivka” milk fudge candies", "Doktorska sausage", "Ryazhanka baked milk 4%", "Salted sunflower seeds"],
];

pageRenderers.home = function renderHome() {
  document.getElementById("hero-text").textContent = t("hero_text", { n: countItems(PRODUCTS.length) });

  document.getElementById("store").innerHTML = HERO_SHELF.map((row) => `
    <div class="store__row">
      ${row.map((en) => {
        const p = byEn(en);
        return `<div class="store__item" title="${esc(pname(p))}">${productVisual(p, false)}${priceTag(p.p)}</div>`;
      }).join("")}
    </div>`).join("");

  document.getElementById("cats").innerHTML = CATEGORIES.map((c) => {
    const items = PRODUCTS.filter((p) => p.c === c.id);
    const icon = items.find((p) => p.f.includes("h")) || items[0];
    return `<li><a class="cat" href="catalog.html?cat=${c.id}">
      ${productVisual(icon)}
      <span class="cat__name">${c[lang]}</span>
      <span class="cat__count">${countItems(items.length)}</span>
    </a></li>`;
  }).join("");

  // По одному хіту з кожного відділу, щоб полиця була різноманітною.
  const hits = CATEGORIES.flatMap((c) => PRODUCTS.filter((p) => p.c === c.id && p.f.includes("h")).slice(0, 1));
  document.getElementById("hits").innerHTML = hits.slice(0, 12).map(itemHTML).join("");

  const counts = PRODUCTS.reduce((acc, p) => ({ ...acc, [p.o]: (acc[p.o] || 0) + 1 }), {});
  document.getElementById("origins").innerHTML = Object.keys(COUNTRIES)
    .filter((code) => counts[code])
    .map((code) => `<li><a class="origin" href="catalog.html?country=${code}">
      ${flagSVG(code)} ${countryName(code)} <span>${counts[code]}</span>
    </a></li>`).join("");

  const n = 41;
  document.getElementById("reviews-count").textContent =
    t("reviews_count", { n: `${n} ${plural(n, t("reviews_forms"))}` });
};

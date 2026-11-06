// Сторінка каталогу: пошук, відділи, країна, сортування. Фільтри живуть в адресі сторінки,
// тож посиланням «catalog.html?cat=beer» можна поділитися.

const params = new URLSearchParams(location.search);
const filters = {
  q: params.get("q") || "",
  cat: CATEGORIES.some((c) => c.id === params.get("cat")) ? params.get("cat") : "",
  country: COUNTRIES[params.get("country")] ? params.get("country") : "",
  sort: params.get("sort") || "pop",
  hits: params.get("hits") === "1",
};

function syncUrl() {
  const next = new URLSearchParams();
  if (filters.q) next.set("q", filters.q);
  if (filters.cat) next.set("cat", filters.cat);
  if (filters.country) next.set("country", filters.country);
  if (filters.sort !== "pop") next.set("sort", filters.sort);
  if (filters.hits) next.set("hits", "1");
  const qs = next.toString();
  try { history.replaceState(null, "", qs ? `?${qs}` : location.pathname); } catch (e) { /* file:// */ }
}

const norm = (s) => s.toLowerCase().replace(/[«»“”"'’ʼ]/g, "").replace(/ґ/g, "г");

function matches(p) {
  if (filters.cat && p.c !== filters.cat) return false;
  if (filters.country && p.o !== filters.country) return false;
  if (filters.hits && !p.f.includes("h")) return false;
  if (filters.q) {
    const hay = norm(`${p.ua} ${p.en} ${p.b} ${catName(p.c)}`);
    return norm(filters.q).split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
  }
  return true;
}

const SORTS = {
  pop: (a, b) => (b.f.includes("h") - a.f.includes("h")) || a.id - b.id,
  asc: (a, b) => a.p - b.p,
  desc: (a, b) => b.p - a.p,
  name: (a, b) => pname(a).localeCompare(pname(b), LOCALE[lang]),
};

function renderResults() {
  const found = PRODUCTS.filter(matches).sort(SORTS[filters.sort] || SORTS.pop);
  document.getElementById("found").textContent = t("found", { n: countItems(found.length) });
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  grid.innerHTML = found.map(itemHTML).join("");
  grid.hidden = !found.length;
  empty.hidden = !!found.length;
  document.querySelectorAll("[data-cat]").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.cat === filters.cat));
  });
  syncUrl();
}

pageRenderers.catalog = function renderCatalog() {
  document.getElementById("catalog-lead").textContent = t("catalog_lead", { n: countItems(PRODUCTS.length) });

  const search = document.getElementById("q");
  search.value = filters.q;

  document.getElementById("country").innerHTML =
    `<option value="">${t("any_country")}</option>` +
    Object.keys(COUNTRIES).map((code) =>
      `<option value="${code}"${code === filters.country ? " selected" : ""}>${countryName(code)}</option>`).join("");

  document.getElementById("sort").innerHTML = ["pop", "asc", "desc", "name"].map((s) =>
    `<option value="${s}"${s === filters.sort ? " selected" : ""}>${t(`sort_${s}`)}</option>`).join("");

  document.getElementById("hits-only").checked = filters.hits;

  document.getElementById("chips").innerHTML =
    `<button class="chip" type="button" data-cat="">${t("all")}</button>` +
    CATEGORIES.map((c) => `<button class="chip" type="button" data-cat="${c.id}">${c[lang]}</button>`).join("");

  renderResults();

  // Якщо відкрили з відділом в адресі, прокручуємо стрічку до активного чипа.
  const active = document.querySelector('.chip[aria-pressed="true"]');
  const chips = document.getElementById("chips");
  if (active) chips.scrollLeft = active.offsetLeft - chips.offsetLeft - 16;
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("q").addEventListener("input", (e) => { filters.q = e.target.value.trim(); renderResults(); });
  document.getElementById("country").addEventListener("change", (e) => { filters.country = e.target.value; renderResults(); });
  document.getElementById("sort").addEventListener("change", (e) => { filters.sort = e.target.value; renderResults(); });
  document.getElementById("hits-only").addEventListener("change", (e) => { filters.hits = e.target.checked; renderResults(); });
  document.getElementById("chips").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat]");
    if (!chip) return;
    filters.cat = chip.dataset.cat;
    renderResults();
  });
  document.getElementById("reset").addEventListener("click", () => {
    Object.assign(filters, { q: "", cat: "", country: "", sort: "pop", hits: false });
    pageRenderers.catalog();
  });
});

// Спільна логіка: мова, шапка й підвал, години роботи, картки товарів, список покупок.

const SHOP = {
  address: "Steentilstraat 40B, 9711 GP Groningen",
  route: "https://www.google.com/maps/dir/?api=1&destination=Dobry+Market,+Steentilstraat+40B,+9711+GP+Groningen",
  reviews: "https://www.google.com/maps/search/?api=1&query=Dobry+Market+Steentilstraat+40B+Groningen",
  map: "https://www.google.com/maps?q=Dobry+Market,+Steentilstraat+40B,+9711+GP+Groningen&output=embed",
  // Понеділок…неділя, [відкриття, закриття] у годинах за часом Амстердама.
  hours: [[12, 19], [11, 19], [11, 19], [11, 20], [11, 20], [10, 20], [12, 18]],
};

const LANGS = ["uk", "nl", "en"];
const HTML_LANG = { uk: "uk", nl: "nl", en: "en" };
const LOCALE = { uk: "uk-UA", nl: "nl-NL", en: "en-IE" };

const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* приватний режим */ } },
};

let lang = LANGS.includes(store.get("dm-lang")) ? store.get("dm-lang") : "uk";
let list = (() => {
  try { return JSON.parse(store.get("dm-list")) || {}; } catch (e) { return {}; }
})();

/* ---------- Текст і формати ---------- */

function t(key, vars = {}) {
  const s = I18N[lang][key] ?? I18N.uk[key] ?? key;
  return typeof s === "string" ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "") : s;
}

function plural(n, forms) {
  if (lang !== "uk") return forms[n === 1 ? 0 : 1];
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
}

const countItems = (n) => `${n} ${plural(n, t("items"))}`;

function money(value) {
  return new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "EUR", currencyDisplay: "narrowSymbol" }).format(value);
}

function priceTag(p) {
  const [int, cents] = p.toFixed(2).split(".");
  return `<span class="tag" aria-label="${esc(money(p))}"><b>${int}</b><sup>${cents}</sup><i>€</i></span>`;
}

function weight(w) {
  if (w === "pc") return `1 ${t("units").pc}`;
  const m = /^([\d.]+)(kg|g|l)$/.exec(w);
  if (!m) return w;
  const num = lang === "en" ? m[1] : m[1].replace(".", ",");
  return `${num} ${t("units")[m[2]]}`;
}

const pname = (p) => (lang === "uk" ? p.ua : p.en);
const catName = (id) => CATEGORIES.find((c) => c.id === id)[lang];
const countryName = (code) => COUNTRIES[code][lang];

/* ---------- Шапка, підвал, кошик ---------- */

const ICON_LIST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.2"/><circle cx="17" cy="20.5" r="1.2"/></svg>`;
const ICON_CLOSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

function renderChrome() {
  const page = document.body.dataset.page;
  const home = page === "home" ? "" : "index.html";

  document.getElementById("site-header").innerHTML = `
    <a class="skip" href="#main">${t("skip")}</a>
    <div class="strip">
      <div class="wrap">
        <span class="status" id="status"></span>
        <a class="strip__addr" href="${home}#visit">${SHOP.address}</a>
      </div>
    </div>
    <header class="header">
      <div class="wrap">
        <a class="logo" href="index.html">
          <span class="logo__mark" aria-hidden="true">Д</span>
          <span class="logo__name">Dobry Market<small>${t("foot_text").replace(/\.$/, "")}</small></span>
        </a>
        <nav class="nav" id="nav" aria-label="${t("menu")}">
          <a href="catalog.html"${page === "catalog" ? ' aria-current="page"' : ""}>${t("nav_catalog")}</a>
          <a href="${home}#about">${t("nav_about")}</a>
          <a href="${home}#visit">${t("nav_visit")}</a>
        </nav>
        <div class="langs" role="group" aria-label="Мова / Taal / Language">
          ${LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${l === "uk" ? "UA" : l.toUpperCase()}</button>`).join("")}
        </div>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="${t("menu")}" data-menu>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
        <button class="list-btn" type="button" data-open-list aria-haspopup="dialog">
          ${ICON_LIST}<span class="list-btn__label">${t("nav_list")}</span><span class="list-btn__count" id="list-count"></span>
        </button>
      </div>
    </header>`;

  document.getElementById("site-footer").innerHTML = `
    <footer class="footer">
      <div class="wrap">
        <div>
          <a class="logo" href="index.html">
            <span class="logo__mark" aria-hidden="true">Д</span>
            <span class="logo__name">Dobry Market<small>Groningen</small></span>
          </a>
          <p>${t("foot_text")} ${SHOP.address}.</p>
        </div>
        <div class="footer__links">
          <a href="catalog.html">${t("nav_catalog")}</a>
          <a href="${home}#about">${t("nav_about")}</a>
          <a href="${home}#visit">${t("nav_visit")}</a>
          <a href="${SHOP.reviews}" target="_blank" rel="noopener">Google Maps</a>
        </div>
        <p class="footer__note">${t("foot_prices")} ${t("foot_photos", { link: `<a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a>` })}</p>
      </div>
    </footer>
    <div class="overlay" data-close-list></div>
    <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true" inert>
      <div class="drawer__head">
        <h2 id="drawer-title">${t("list_title")}</h2>
        <button class="icon-btn" type="button" data-close-list aria-label="${t("list_close")}">${ICON_CLOSE}</button>
      </div>
      <div class="drawer__body" id="drawer-body"></div>
      <div class="drawer__foot" id="drawer-foot"></div>
    </aside>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

  document.documentElement.lang = HTML_LANG[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });

  renderStatus();
  renderListCount();
  renderDrawer();
}

/* ---------- Години роботи ---------- */

function amsterdamNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Amsterdam", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((x) => x.type === type).value;
  const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const hhmm = (h) => `${String(h).padStart(2, "0")}:00`;

function renderStatus() {
  const el = document.getElementById("status");
  if (!el) return;
  const { day, minutes } = amsterdamNow();
  const [open, close] = SHOP.hours[day];
  const isOpen = minutes >= open * 60 && minutes < close * 60;
  el.classList.toggle("is-open", isOpen);
  if (isOpen) {
    el.textContent = t("status_open", { t: hhmm(close) });
  } else if (minutes < open * 60) {
    el.textContent = t("status_closed", { d: t("today"), t: hhmm(open) });
  } else {
    el.textContent = t("status_closed", { d: t("tomorrow"), t: hhmm(SHOP.hours[(day + 1) % 7][0]) });
  }
}

function renderHours() {
  const table = document.getElementById("hours");
  if (!table) return;
  const { day } = amsterdamNow();
  table.innerHTML = `<caption class="visually-hidden">${t("visit_hours")}</caption><tbody>${SHOP.hours.map(([o, c], i) => `
    <tr${i === day ? ` aria-current="date"` : ""}>
      <th scope="row" data-today="${t("today")}">${t("days")[i]}</th>
      <td>${hhmm(o)}–${hhmm(c)}</td>
    </tr>`).join("")}</tbody>`;
}

/* ---------- Картка товару ---------- */

function controlHTML(p) {
  const qty = list[p.id] || 0;
  if (!qty) {
    return `<button class="add" type="button" data-add="${p.id}" aria-label="${esc(t("add_aria", { name: pname(p) }))}">+ ${t("add")}</button>`;
  }
  return `<div class="step">
      <button type="button" data-dec="${p.id}" aria-label="${t("less")}">−</button>
      <output aria-live="polite">${qty}</output>
      <button type="button" data-inc="${p.id}" aria-label="${t("more")}">+</button>
    </div>`;
}

function badgesHTML(p) {
  const b = [];
  if (p.f.includes("h")) b.push(`<span class="badge badge--hit">${t("badge_hit")}</span>`);
  if (p.f.includes("n")) b.push(`<span class="badge badge--new">${t("badge_new")}</span>`);
  if (p.f.includes("a")) b.push(`<span class="badge badge--adult">${t("badge_adult")}</span>`);
  return b.length ? `<div class="item__badges">${b.join("")}</div>` : "";
}

function itemHTML(p) {
  const meta = [p.b, weight(p.w)].filter(Boolean).join(", ");
  return `<li class="item">
    <div class="item__stage">
      ${badgesHTML(p)}
      <span class="item__flag" title="${esc(countryName(p.o))}">${flagSVG(p.o)}</span>
      ${productVisual(p)}
    </div>
    ${priceTag(p.p)}
    <h3 class="item__name">${esc(pname(p))}</h3>
    ${lang === "uk" ? "" : `<p class="item__orig" lang="uk">${esc(p.ua)}</p>`}
    <p class="item__meta">${esc(meta)}</p>
    <div class="item__ctl" data-ctl="${p.id}">${controlHTML(p)}</div>
  </li>`;
}

function refreshControls(id) {
  const p = PRODUCTS[id];
  document.querySelectorAll(`[data-ctl="${id}"]`).forEach((el) => {
    const hadFocus = el.contains(document.activeElement);
    el.innerHTML = controlHTML(p);
    if (hadFocus) el.querySelector("button:last-of-type, button")?.focus();
  });
}

/* ---------- Список покупок ---------- */

function saveList() {
  store.set("dm-list", JSON.stringify(list));
}

function setQty(id, qty) {
  if (qty > 0) list[id] = Math.min(qty, 99);
  else delete list[id];
  saveList();
  refreshControls(id);
  renderListCount();
  renderDrawer();
}

function renderListCount() {
  const el = document.getElementById("list-count");
  if (!el) return;
  const n = Object.values(list).reduce((s, q) => s + q, 0);
  el.textContent = n ? String(n) : "";
}

function listEntries() {
  return Object.entries(list)
    .map(([id, qty]) => ({ p: PRODUCTS[id], qty }))
    .filter((e) => e.p);
}

function renderDrawer() {
  const body = document.getElementById("drawer-body");
  const foot = document.getElementById("drawer-foot");
  if (!body) return;
  const entries = listEntries();

  if (!entries.length) {
    body.innerHTML = `<div class="drawer__empty"><p>${t("list_empty")}</p>
      ${document.body.dataset.page === "catalog" ? "" : `<a class="btn btn--ink" href="catalog.html">${t("list_go")}</a>`}</div>`;
    foot.hidden = true;
    return;
  }

  body.innerHTML = entries.map(({ p, qty }) => `
    <div class="line">
      ${productVisual(p)}
      <div>
        <div class="line__name">${esc(pname(p))}</div>
        <div class="line__price">${weight(p.w)}, ${money(p.p)}</div>
      </div>
      <div class="step" data-ctl-line="${p.id}">
        <button type="button" data-dec="${p.id}" aria-label="${t("less")}">−</button>
        <output>${qty}</output>
        <button type="button" data-inc="${p.id}" aria-label="${t("more")}">+</button>
      </div>
    </div>`).join("");

  const total = entries.reduce((s, { p, qty }) => s + p.p * qty, 0);
  foot.hidden = false;
  foot.innerHTML = `
    <div class="total"><span>${t("list_total")}</span><strong>${money(total)}</strong></div>
    <div class="drawer__actions">
      <button class="btn btn--ink" type="button" data-copy-list>${t("list_copy")}</button>
      <button class="btn btn--line" type="button" data-clear-list>${t("list_clear")}</button>
    </div>
    <p class="drawer__hint">${t("list_hint")}</p>`;
}

function listAsText() {
  const entries = listEntries();
  const total = entries.reduce((s, { p, qty }) => s + p.p * qty, 0);
  const lines = entries.map(({ p, qty }) => `• ${pname(p)} (${weight(p.w)}) × ${qty}`);
  return `Dobry Market, ${t("list_title").toLowerCase()}\n${lines.join("\n")}\n${t("list_total")}: ${money(total)}`;
}

let lastFocus = null;

function openList() {
  const drawer = document.getElementById("drawer");
  lastFocus = document.activeElement;
  drawer.classList.add("is-open");
  drawer.removeAttribute("inert");
  drawer.setAttribute("aria-hidden", "false");
  document.querySelector(".overlay").classList.add("is-open");
  drawer.querySelector(".icon-btn").focus();
}

function closeList() {
  const drawer = document.getElementById("drawer");
  if (!drawer.classList.contains("is-open")) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("inert", "");
  drawer.setAttribute("aria-hidden", "true");
  document.querySelector(".overlay").classList.remove("is-open");
  lastFocus?.focus();
}

let toastTimer;
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
}

function bumpListButton() {
  const btn = document.querySelector(".list-btn");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
}

/* ---------- Події ---------- */

document.addEventListener("click", async (e) => {
  const el = e.target.closest("button, [data-close-list]");
  if (!el) return;
  const d = el.dataset;

  if (d.add !== undefined) { setQty(+d.add, 1); bumpListButton(); }
  else if (d.inc !== undefined) setQty(+d.inc, (list[d.inc] || 0) + 1);
  else if (d.dec !== undefined) setQty(+d.dec, (list[d.dec] || 0) - 1);
  else if (d.openList !== undefined) openList();
  else if (d.closeList !== undefined) closeList();
  else if (d.clearList !== undefined) {
    const ids = Object.keys(list);
    list = {};
    saveList();
    ids.forEach(refreshControls);
    renderListCount();
    renderDrawer();
  } else if (d.copyList !== undefined) {
    try {
      await navigator.clipboard.writeText(listAsText());
      toast(t("list_copied"));
    } catch (err) {
      toast(t("list_copy_fail"));
    }
  } else if (d.lang) {
    lang = d.lang;
    store.set("dm-lang", lang);
    render();
  } else if (d.menu !== undefined) {
    const nav = document.getElementById("nav");
    const open = nav.classList.toggle("is-open");
    el.setAttribute("aria-expanded", String(open));
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeList();
});

// Закриваємо мобільне меню після переходу за якорем.
document.addEventListener("click", (e) => {
  if (e.target.closest(".nav a")) {
    document.getElementById("nav")?.classList.remove("is-open");
    document.querySelector("[data-menu]")?.setAttribute("aria-expanded", "false");
  }
});

// Зміни списку в іншій вкладці.
window.addEventListener("storage", (e) => {
  if (e.key !== "dm-list") return;
  try { list = JSON.parse(e.newValue) || {}; } catch (err) { list = {}; }
  render();
});

/* ---------- Сторінки ---------- */

const pageRenderers = {};

function render() {
  const drawerWasOpen = document.getElementById("drawer")?.classList.contains("is-open");
  renderChrome();
  renderHours();
  pageRenderers[document.body.dataset.page]?.();
  if (drawerWasOpen) openList();
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  setInterval(renderStatus, 60 * 1000);
});

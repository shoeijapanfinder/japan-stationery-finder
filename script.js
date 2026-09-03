const state = {
  products: [],
  filter: "All",
  query: ""
};

const filterDefs = [
  ["All", () => true],
  ["Ink", p => p.category === "Ink"],
  ["Fountain Pen", p => p.category === "Fountain Pen"],
  ["Notebook", p => p.category === "Notebook"],
  ["Tokyo", p => /Tokyo/i.test(p.location || "")],
  ["Kyoto", p => /Kyoto/i.test(p.location || "")],
  ["Kobe", p => /Kobe/i.test(p.location || "")],
  ["Store Exclusive", p => /Store Exclusive|Store Original/i.test(p.exclusiveType || "")],
  ["Event", p => /Event/i.test(p.exclusiveType || "")],
  ["Limited", p => /Limited/i.test(p.exclusiveType || "")]
];

const filtersEl = document.getElementById("filters");
const listEl = document.getElementById("productList");
const countEl = document.getElementById("resultCount");
const searchEl = document.getElementById("search");
const clearEl = document.getElementById("clearSearch");

function yen(value) {
  if (value === null || value === undefined || value === "") return "See store";
  return "¥" + Number(value).toLocaleString("ja-JP");
}

function buildFilters() {
  filtersEl.innerHTML = "";
  filterDefs.forEach(([label]) => {
    const button = document.createElement("button");
    button.className = "filter" + (state.filter === label ? " active" : "");
    button.textContent = label;
    button.type = "button";
    button.addEventListener("click", () => {
      state.filter = label;
      buildFilters();
      render();
      if (typeof gtag === "function") {
        gtag("event", "filter_select", { filter_name: label });
      }
    });
    filtersEl.appendChild(button);
  });
}

function matchesQuery(p) {
  if (!state.query) return true;
  const haystack = [
    p.nameJa, p.nameEn, p.brand, p.category, p.exclusiveType,
    p.location, p.seller, p.purchaseChannel
  ].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(state.query.toLowerCase());
}

function matchesFilter(p) {
  const def = filterDefs.find(([label]) => label === state.filter);
  return def ? def[1](p) : true;
}

function detail(label, value) {
  if (!value && value !== 0) return "";
  return `<div><div class="detail-label">${label}</div><div class="detail-value">${escapeHtml(String(value))}</div></div>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function card(p) {
  const article = document.createElement("article");
  article.className = "product";
  const title = p.nameEn || p.nameJa || "Untitled";
  const tags = [p.category, p.exclusiveType].filter(Boolean);

  article.innerHTML = `
    <button class="product-summary" type="button" aria-expanded="false">
      <div>
        <div class="brand">${escapeHtml(p.brand || "")}</div>
        <div class="product-name">${escapeHtml(title)}</div>
        <div class="meta">${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      </div>
      <div>
        <div class="price-label">Price</div><div class="price">${yen(p.priceJpy)}</div>
        <span class="chevron">⌄</span>
      </div>
    </button>
    <div class="details">
      <div class="detail-grid">
        ${detail("Japanese name", p.nameJa)}
        ${detail("Location", p.location)}
        ${detail("Exclusivity", p.exclusiveType)}
        ${detail("Availability", p.availability)}
        ${detail("Purchase channel", p.purchaseChannel)}
        ${detail("Seller", p.seller)}
        ${detail("International shipping", p.internationalShipping)}
        ${detail("Physical store only", p.physicalStoreOnly)}
        ${detail("Evidence", p.evidence)}
        ${detail("Last checked", p.checkedAt)}
      </div>
      ${p.proxyNote ? `<div class="note">🧳 ${escapeHtml(p.proxyNote)}</div>` : ""}
      ${p.officialUrl ? `<div class="actions"><a class="official" href="${escapeHtml(p.officialUrl)}" target="_blank" rel="noopener noreferrer">Official store ↗</a></div>` : ""}
    </div>
  `;

  const summary = article.querySelector(".product-summary");
  summary.addEventListener("click", () => {
    const open = article.classList.toggle("open");
    summary.setAttribute("aria-expanded", String(open));
    if (open && typeof gtag === "function") {
      gtag("event", "product_open", {
        product_id: p.id,
        product_name: p.nameEn || p.nameJa || "Untitled",
        brand: p.brand || ""
      });
    }
  });

  const officialLink = article.querySelector(".official");
  if (officialLink) {
    officialLink.addEventListener("click", () => {
      if (typeof gtag === "function") {
        gtag("event", "official_store_click", {
          product_id: p.id,
          product_name: p.nameEn || p.nameJa || "Untitled",
          brand: p.brand || ""
        });
      }
    });
  }
  return article;
}

function render() {
  const filtered = state.products.filter(p => matchesFilter(p) && matchesQuery(p));
  countEl.textContent = `${filtered.length} of ${state.products.length} items`;

  listEl.innerHTML = "";
  if (!filtered.length) {
    listEl.innerHTML = `<div class="empty">No stationery found. Try another filter or search term.</div>`;
    return;
  }
  filtered.forEach(p => listEl.appendChild(card(p)));
}

async function init() {
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error("products.json could not be loaded");
    state.products = await res.json();
    buildFilters();
    render();
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div class="empty">Could not load the product data.</div>`;
  }
}

let searchTimer;
searchEl.addEventListener("input", e => {
  state.query = e.target.value.trim();
  render();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (state.query && typeof gtag === "function") {
      gtag("event", "site_search", { search_term: state.query });
    }
  }, 800);
});
clearEl.addEventListener("click", () => {
  searchEl.value = "";
  state.query = "";
  render();
  searchEl.focus();
});

init();

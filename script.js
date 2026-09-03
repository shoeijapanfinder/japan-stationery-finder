let products = [];
let active = "All";
const filters = ["All","Ink","Fountain Pen","Notebook","Kobe","Tokyo","Kyoto","Store Exclusive","Event","Limited"];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const yen = n => n == null || n === "" ? "Price varies" : `¥${Number(n).toLocaleString("en-US")}`;
const norm = s => String(s ?? "").toLowerCase();

function matchesFilter(p){
  if(active === "All") return true;
  const hay = [p.category,p.exclusiveType,p.location,p.brand,p.availability,p.purchaseChannel,p.nameEn,p.nameJa].map(norm).join(" ");
  if(active === "Ink") return norm(p.category).includes("ink");
  if(active === "Fountain Pen") return norm(p.category).includes("fountain");
  if(active === "Notebook") return norm(p.category).includes("notebook") || norm(p.category).includes("refill");
  if(active === "Kobe" || active === "Tokyo" || active === "Kyoto") return norm(p.location).includes(active.toLowerCase());
  if(active === "Store Exclusive") return hay.includes("store exclusive") || hay.includes("store original") || hay.includes("bespoke");
  if(active === "Event") return hay.includes("event") || hay.includes("caravan");
  if(active === "Limited") return hay.includes("limited") || hay.includes("special") || norm(p.availability).includes("limited");
  return true;
}

function renderFilters(){
  document.getElementById("filters").innerHTML = filters.map(f =>
    `<button class="filter ${f===active?'active':''}" data-filter="${esc(f)}">${esc(f)}</button>`
  ).join("");
  document.querySelectorAll(".filter").forEach(b => b.onclick = () => { active=b.dataset.filter; renderFilters(); render(); });
}

function searchTerm(){
  return norm(document.getElementById("search").value.trim());
}

function sortProducts(list){
  const mode = document.getElementById("sort").value;
  return [...list].sort((a,b)=>{
    if(mode==="brand") return norm(a.brand).localeCompare(norm(b.brand));
    if(mode==="price-low") return (a.priceJpy??999999)-(b.priceJpy??999999);
    if(mode==="price-high") return (b.priceJpy??0)-(a.priceJpy??0);
    return String(a.priority).localeCompare(String(b.priority)) || norm(a.brand).localeCompare(norm(b.brand));
  });
}

function productMatches(p){
  if(!matchesFilter(p)) return false;
  const q = searchTerm();
  if(!q) return true;
  const hay = [p.nameJa,p.nameEn,p.brand,p.category,p.exclusiveType,p.location,p.seller,p.purchaseChannel,p.proxyNote].map(norm).join(" ");
  return hay.includes(q);
}

function detail(label,value){ return `<div class="detail"><label>${esc(label)}</label><div>${esc(value || "Not specified")}</div></div>`; }

function card(p){
  const tags = [p.category,p.exclusiveType,p.location].filter(Boolean).slice(0,3);
  const evidence = norm(p.evidence).includes("confirm") ? "Confirmed" : (p.evidence || "Check source");
  return `<article class="product" data-id="${esc(p.id)}">
    <div class="product-summary">
      <div>
        <div class="name-ja">${esc(p.nameJa)}</div>
        <div class="name-en">${esc(p.nameEn)}</div>
        <div class="tags">${tags.map((t,i)=>`<span class="tag ${i===1?'red':''}">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="price">${yen(p.priceJpy)}</div>
    </div>
    <div class="product-detail">
      <div class="detail-grid">
        ${detail("Location",p.location)}
        ${detail("Exclusivity",p.exclusiveType)}
        ${detail("Availability",p.availability)}
        ${detail("Purchase",p.purchaseChannel)}
        ${detail("International",p.internationalShipping)}
        ${detail("Seller",p.seller)}
        ${detail("Evidence",evidence)}
        ${detail("Proxy",p.proxyNote)}
        ${detail("Last checked",p.checkedAt)}
      </div>
      <div class="actions">
        <a class="official" href="${esc(p.officialUrl)}" target="_blank" rel="noopener">Official source ↗</a>
        <span class="checked">Verify availability before visiting or ordering.</span>
      </div>
    </div>
  </article>`;
}

function render(){
  const filtered = sortProducts(products.filter(productMatches));
  document.getElementById("count").textContent = `${filtered.length} find${filtered.length===1?'':'s'}`;
  document.getElementById("resultTitle").textContent = active === "All" ? "All finds" : active;
  const groups = {};
  filtered.forEach(p => (groups[p.brand] ||= []).push(p));
  const container = document.getElementById("brandGroups");
  container.innerHTML = Object.entries(groups).map(([brand,items]) => `
    <section class="brand-group">
      <button class="brand-head">
        <div><span class="brand-name">${esc(brand)}</span><span class="brand-meta">${items.length} item${items.length===1?'':'s'}</span></div>
        <span class="chevron">⌄</span>
      </button>
      <div class="brand-items">${items.map(card).join("")}</div>
    </section>`).join("");
  document.getElementById("empty").hidden = filtered.length !== 0;

  document.querySelectorAll(".brand-head").forEach(b => b.onclick = () => b.parentElement.classList.toggle("open"));
  document.querySelectorAll(".product-summary").forEach(s => s.onclick = () => s.parentElement.classList.toggle("open"));
  // First brand opens automatically, keeping the page compact while still immediately useful.
  const first = document.querySelector(".brand-group"); if(first) first.classList.add("open");
}

document.getElementById("search").addEventListener("input", render);
document.getElementById("sort").addEventListener("change", render);
fetch("products.json").then(r=>r.json()).then(d=>{ products=d; renderFilters(); render(); })
  .catch(()=>{ document.getElementById("brandGroups").innerHTML="<div class='empty'>Could not load products.json.</div>"; });

const STORAGE_KEY = "waste2power.entries.v1";
const categoryInfo = {
  "Organic": { emoji: "🍃", energy: 0.25, value: 3, route: "Compost / biogas", advice: "Keep organic waste separate. Check whether your campus or local area has composting or an authorised biogas programme." },
  "Plastic": { emoji: "🧴", energy: 0.8, value: 18, route: "Plastic recycling", advice: "Empty the container and follow local recycling rules. Only accepted plastic types should enter the recycling stream." },
  "Paper": { emoji: "📄", energy: 0.45, value: 8, route: "Paper recycling", advice: "Keep paper and cardboard dry and separate from food residue before sending them to an accepted recycling collection." },
  "Metal": { emoji: "🥫", energy: 1.2, value: 30, route: "Metal recycler", advice: "Keep metal separate and use an appropriate scrap dealer or recycling collection point." },
  "E-waste": { emoji: "🔋", energy: 0, value: 10, route: "Authorised e-waste handler", advice: "Do not put batteries or electronics in mixed waste or dismantle batteries. Use an authorised e-waste collection point." },
  "Other": { emoji: "🧺", energy: 0.1, value: 1, route: "Check local guidance", advice: "Keep uncertain materials separate until you can check the local disposal rules." }
};
const initialEntries = [
  { id: "seed-1", name: "Food scraps", category: "Organic", weight: 3.2, date: "Today" },
  { id: "seed-2", name: "Plastic bottles", category: "Plastic", weight: 2.5, date: "Today" },
  { id: "seed-3", name: "Paper & cardboard", category: "Paper", weight: 4.8, date: "Yesterday" },
  { id: "seed-4", name: "Aluminium cans", category: "Metal", weight: 2.0, date: "Yesterday" }
];
let entries = loadEntries();
let selectedImageUrl = null;
let toastTimer;

function loadEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.warn("Could not read local demo data", e); }
  return initialEntries.map(item => ({...item}));
}
function saveEntries() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
  catch (e) { showToast("Browser storage is unavailable. Changes may not persist."); }
}
function totalWeight() { return entries.reduce((sum, e) => sum + Number(e.weight || 0), 0); }
function energyFor(entry) { return Number(entry.weight || 0) * (categoryInfo[entry.category]?.energy ?? 0); }
function totalEnergy() { return entries.reduce((sum, e) => sum + energyFor(e), 0); }
function totalValue() { return entries.reduce((sum, e) => sum + Number(e.weight || 0) * (categoryInfo[e.category]?.value ?? 0), 0); }
function fmt(value, decimals=1) { return Number(value).toLocaleString("en-IN", {maximumFractionDigits:decimals, minimumFractionDigits:decimals}); }
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
const pageCopy = {
  dashboard: ["Hello, Vivek 👋", "Let's turn waste into a better tomorrow."],
  scan: ["Scan waste", "Add an item and get a responsible disposal suggestion."],
  waste: ["My waste", "Your recorded items, all in one place."],
  impact: ["Energy & impact", "Understand the potential value of better waste sorting."],
  route: ["Collection route", "A concept for smarter campus collection."],
  ewaste: ["E-waste & recycling guide", "Small disposal choices can make a difference."]
};
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active-page", p.id === `page-${name}`));
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.page === name));
  const copy = pageCopy[name] || pageCopy.dashboard;
  document.getElementById("pageTitle").textContent = copy[0];
  document.getElementById("pageSubtitle").textContent = copy[1];
  document.getElementById("sidebar").classList.remove("open");
  if (name === "dashboard" || name === "waste" || name === "impact") renderAll();
  window.scrollTo({top:0, behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", event => {
  event.preventDefault();
  showPage(el.dataset.page);
}));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => showPage(el.dataset.go)));
document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));

function renderAll() {
  const weight = totalWeight(), energy = totalEnergy(), value = totalValue();
  document.getElementById("statWaste").textContent = `${fmt(weight)} kg`;
  document.getElementById("statEnergy").textContent = `${fmt(energy)} kWh`;
  document.getElementById("statValue").textContent = `₹ ${Math.round(value).toLocaleString("en-IN")}`;
  document.getElementById("statEntries").textContent = entries.length;
  document.getElementById("donutTotal").textContent = fmt(weight);
  document.getElementById("impactEnergy").textContent = `${fmt(energy)} kWh`;
  document.getElementById("impactWaste").textContent = `${fmt(weight)} kg`;
  document.getElementById("impactValue").textContent = `₹ ${Math.round(value).toLocaleString("en-IN")}`;
  renderComposition();
  renderActivity();
  renderTable();
  renderBars();
  renderRecommendation();
}
function renderComposition() {
  const colors = {Organic:"#0fb77b",Plastic:"#4489ef",Paper:"#ffbf43",Metal:"#9561e8","E-waste":"#fa5961",Other:"#9caea8"};
  const order = Object.keys(categoryInfo);
  const total = totalWeight();
  let running = 0;
  const segments = [];
  const legend = [];
  order.forEach(cat => {
    const amount = entries.filter(e => e.category === cat).reduce((s,e)=>s+Number(e.weight||0),0);
    const pct = total ? amount / total * 100 : 0;
    segments.push(`${colors[cat]} ${running}% ${running + pct}%`);
    running += pct;
    if (amount > 0) legend.push(`<div class="legend-row"><i class="legend-dot" style="background:${colors[cat]}"></i><span>${cat}</span><b>${Math.round(pct)}%</b></div>`);
  });
  document.getElementById("donut").style.background = total ? `conic-gradient(${segments.join(",")})` : "#e7efea";
  document.getElementById("legend").innerHTML = legend.length ? legend.join("") : '<p class="form-hint">Add a waste entry to see your composition.</p>';
}
function renderActivity() {
  const target = document.getElementById("recentActivity");
  const latest = [...entries].slice(-4).reverse();
  target.innerHTML = latest.length ? latest.map(e => {
    const info = categoryInfo[e.category] || categoryInfo.Other;
    return `<div class="activity-item"><span class="activity-emoji">${info.emoji}</span><div class="activity-copy"><b>${safeText(e.name)}</b><small>${safeText(e.category)} · ${fmt(e.weight,2)} kg</small></div><span class="activity-time">${safeText(e.date || "Saved")}</span></div>`;
  }).join("") : '<p class="form-hint">No activity yet. Scan your first item.</p>';
}
function renderTable() {
  const target = document.getElementById("wasteTable");
  document.getElementById("tableCount").textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  target.innerHTML = entries.length ? [...entries].reverse().map(e => {
    const info = categoryInfo[e.category] || categoryInfo.Other;
    return `<tr><td><b>${safeText(info.emoji)} ${safeText(e.name)}</b><br><small>${safeText(e.date || "Saved")}</small></td><td><span class="category-pill">${safeText(e.category)}</span></td><td>${fmt(e.weight,2)} kg</td><td>${fmt(energyFor(e),2)} kWh</td><td>${safeText(info.route)}</td><td><button class="delete-btn" data-delete="${safeText(e.id)}" aria-label="Delete ${safeText(e.name)}">Delete</button></td></tr>`;
  }).join("") : '<tr><td colspan="6">No entries yet. Use Scan Waste to add your first item.</td></tr>';
  target.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
    entries = entries.filter(e => e.id !== button.dataset.delete);
    saveEntries(); renderAll(); showToast("Waste entry deleted.");
  }));
}
function renderBars() {
  const target = document.getElementById("barChart");
  const order = Object.keys(categoryInfo);
  const amounts = order.map(cat => ({cat, amount:entries.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.weight||0),0)}));
  const max = Math.max(1, ...amounts.map(x=>x.amount));
  target.innerHTML = amounts.map(x => `<div class="bar-row"><span>${safeText(x.cat)}</span><div class="bar-track"><div class="bar-fill" style="width:${x.amount/max*100}%"></div></div><span class="bar-value">${fmt(x.amount,2)} kg</span></div>`).join("");
}
function renderRecommendation() {
  const mostCommon = Object.keys(categoryInfo).map(cat => ({cat, amount:entries.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.weight||0),0)})).sort((a,b)=>b.amount-a.amount)[0];
  const cat = mostCommon && mostCommon.amount > 0 ? mostCommon.cat : "Organic";
  document.getElementById("recommendationTitle").textContent = cat === "E-waste" ? "Keep e-waste out of mixed bins" : `Prioritise ${cat.toLowerCase()} waste separation`;
  document.getElementById("recommendationText").textContent = categoryInfo[cat].advice;
}
function previewSelectedFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("Please choose a valid image file."); return; }
  if (file.size > 8 * 1024 * 1024) { showToast("Please choose an image smaller than 8 MB."); return; }
  if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
  selectedImageUrl = URL.createObjectURL(file);
  document.getElementById("imagePreview").src = selectedImageUrl;
  document.getElementById("previewWrap").classList.remove("hidden");
  document.getElementById("dropZone").classList.add("has-preview");
}
document.getElementById("imageInput").addEventListener("change", e => previewSelectedFile(e.target.files[0]));
document.getElementById("downloadImage").addEventListener("click", () => {
  const file = document.getElementById("imageInput").files[0];
  if (!selectedImageUrl || !file) {
    showToast("Please upload a photo first.");
    return;
  }
  const link = document.createElement("a");
  link.href = selectedImageUrl;
  link.download = file.name || "waste-photo";
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast("Your photo download has started.");
});
document.getElementById("removeImage").addEventListener("click", () => {
  if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
  selectedImageUrl = null;
  document.getElementById("imageInput").value = "";
  document.getElementById("previewWrap").classList.add("hidden");
});
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const category = document.getElementById("wasteCategory").value;
  const weight = Number(document.getElementById("wasteWeight").value);
  const description = document.getElementById("wasteDescription").value.trim();
  if (!Number.isFinite(weight) || weight <= 0 || weight > 10000) {
    showToast("Enter a weight greater than 0 and no more than 10,000 kg.");
    document.getElementById("wasteWeight").focus();
    return;
  }
  const info = categoryInfo[category];
  if (!info) { showToast("Please choose a valid waste category."); return; }
  const name = description || ({"Organic":"Food waste","Plastic":"Plastic item","Paper":"Paper/cardboard","Metal":"Metal item","E-waste":"Electronic waste","Other":"Mixed waste"}[category]);
  const entry = {id: (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`), name, category, weight:Math.round(weight*100)/100, date:"Just now"};
  entries.push(entry);
  saveEntries();
  document.getElementById("emptyResult").classList.add("hidden");
  document.getElementById("resultContent").classList.remove("hidden");
  document.getElementById("resultEmoji").textContent = info.emoji;
  document.getElementById("resultCategory").textContent = category;
  document.getElementById("resultDescription").textContent = name;
  document.getElementById("resultWeight").textContent = `${fmt(weight,2)} kg`;
  document.getElementById("resultEnergy").textContent = `${fmt(energyFor(entry),2)} kWh`;
  document.getElementById("resultAdvice").textContent = info.advice;
  renderAll();
  showToast("Entry saved. Dashboard totals updated.");
});
document.getElementById("resetDemo").addEventListener("click", () => {
  entries = initialEntries.map(item => ({...item}));
  saveEntries(); renderAll(); showToast("Sample data restored.");
});
renderAll();


// Interactive scenario simulator. Uses the same clearly illustrative demo coefficients as the dashboard.
function updateSimulator() {
  const category = document.getElementById("simCategory").value;
  const weight = Number(document.getElementById("simWeight").value);
  const info = categoryInfo[category];
  if (!Number.isFinite(weight) || weight <= 0 || weight > 10000) {
    showToast("Enter a quantity greater than 0 and no more than 10,000 kg.");
    document.getElementById("simWeight").focus();
    return;
  }
  document.getElementById("simEnergy").textContent = `${fmt(weight * info.energy, 2)} kWh`;
  document.getElementById("simValue").textContent = `₹ ${Math.round(weight * info.value).toLocaleString("en-IN")}`;
  document.getElementById("simRoute").textContent = info.route;
  document.getElementById("simNote").textContent = category === "E-waste"
    ? "E-waste should not be treated as a household energy-yield input here. This estimate shows zero energy and directs the item to authorised e-waste handling; the value is illustrative only."
    : "Demo estimate only: energy and value coefficients are illustrative, not validated energy-yield or market-price data. Actual results depend on material condition and local processing facilities.";
}
document.getElementById("simCalculate").addEventListener("click", updateSimulator);
document.getElementById("simCategory").addEventListener("change", updateSimulator);
document.getElementById("simWeight").addEventListener("input", updateSimulator);
updateSimulator();

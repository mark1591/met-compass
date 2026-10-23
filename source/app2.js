const APP_VERSION = "/*VERSION*/";
const $ = s => document.querySelector(s);
const svgNS = "http://www.w3.org/2000/svg";
const byId = id => Z.find(z => z.id === id);
const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const inFrame = (() => { try { return window.top !== window; } catch(e) { return true; } })();
const N100 = W.map((w,i) => i+1);
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }

/* ================= saved state ================= */
let store = {seen:{}, fav:{}, notes:{}};
try { const s0 = JSON.parse(localStorage.getItem("met-store") || "null"); if(s0) store = Object.assign(store, s0); } catch(e) {}
try { const old = JSON.parse(localStorage.getItem("met-seen") || "null");
  if(old && old.length && !Object.keys(store.seen).length) old.forEach(n => store.seen[n] = {v:true, t:Date.now(), by:""}); } catch(e) {}
let cfg = {name:"", url:"", code:""};
try { cfg = Object.assign(cfg, JSON.parse(localStorage.getItem("met-cfg") || "{}")); } catch(e) {}
const saveCfg = () => { try { localStorage.setItem("met-cfg", JSON.stringify(cfg)); } catch(e) {} };
let seen = new Set();
const rebuild = () => { seen = new Set(Object.keys(store.seen).filter(k => store.seen[k] && store.seen[k].v).map(Number)); };
rebuild();
const saveStore = () => { try { localStorage.setItem("met-store", JSON.stringify(store)); } catch(e) {} };
const isFav = n => !!(store.fav[n] && store.fav[n].v);
const noteOf = n => (store.notes[n] && store.notes[n].v) || "";
function setItem(kind, n, v){ store[kind][n] = {v, t:Date.now(), by:cfg.name || ""}; saveStore(); rebuild(); queueSync(); }
let plan = [];
try { plan = JSON.parse(localStorage.getItem("met-plan") || "[]").filter(n => n >= 1 && n <= 100); } catch(e) {}
const savePlan = () => { try { localStorage.setItem("met-plan", JSON.stringify(plan)); } catch(e) {} };
let here = null; // gallery number the viewer says they're in
try { const h = JSON.parse(localStorage.getItem("met-here") || "null"); if(h && Date.now() - h.t < 6 * 3600e3) here = h.g; } catch(e) {}
const saveHere = () => { try { localStorage.setItem("met-here", JSON.stringify(here === null ? null : {g: here, t: Date.now()})); } catch(e) {} };

/* ================= appearance ================= */
let theme = "light";
try { theme = localStorage.getItem("met-theme") || "light"; } catch(e) {}
const darkMQ = matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
  const root = document.documentElement;
  if(theme === "light" || theme === "dark") root.setAttribute("data-theme", theme); else root.removeAttribute("data-theme");
  const isDark = theme === "dark" || (theme === "system" && darkMQ.matches);
  const m = document.getElementById("theme-color"); if(m) m.setAttribute("content", isDark ? "#111214" : "#EDECE7");
}
function setTheme(t){ theme = t; try { localStorage.setItem("met-theme", t); } catch(e) {} applyTheme(); }
if(darkMQ.addEventListener) darkMQ.addEventListener("change", () => { if(theme === "system") applyTheme(); });
applyTheme();

/* ================= work helpers ================= */
const workZone = n => W[n-1][3] ? byId(W[n-1][3]) : null;
const onView = n => !!W[n-1][3];
const eraName = n => ERAS.find(e => e[0] === W[n-1][4])[1];
function metLink(n){
  if(MET_ID[n]) return "https://www.metmuseum.org/art/collection/search/" + MET_ID[n];
  return "https://www.metmuseum.org/art/collection/search?q=" + encodeURIComponent(W[n-1][0].replace(/"/g,"") + " " + W[n-1][1].split(",")[0]);
}
const short = s => s.split(",")[0];
const plate = (g, cls) => g ? `<span class="plate ${cls || "s"}">${esc(g)}</span>` : "";
const matImg = (n, extra) => IMG.has(n) ? `<div class="mat ${extra || ""}"><img src="img/${n}.jpg" alt="" loading="lazy"></div>` : `<div class="mat ${extra || ""}"><span class="none">No image</span></div>`;
const fmtViews = v => v >= 1e6 ? (v/1e6).toFixed(1).replace(/\.0$/,"") + "M" : v >= 1e3 ? Math.round(v/1e3) + "K" : String(v);
const RANKED = Object.keys(VIEWS).map(Number).sort((a,b) => VIEWS[b][0] - VIEWS[a][0]);
const rankAll = n => RANKED.indexOf(n) + 1;
const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.3-8.8-8.5C1.9 8.4 3.9 5 7.2 5c1.9 0 3.4 1 4.1 2.4h1.4C13.4 6 14.9 5 16.8 5c3.3 0 5.3 3.4 4 6.5C19 15.7 12 20 12 20z"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const MAPDIR = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M12 3l9 9-9 9-9-9z"/><path d="M9.5 13.5v-2h5M12.5 9.5l2 2-2 2"/></svg>';
const CUP = '<svg viewBox="0 0 24 24"><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M12 3v3"/></svg>';
function workRow(n, sub){ const w = W[n-1];
  return `<button class="li" data-w="${n}"><span style="width:52px;height:52px;display:block">${matImg(n, "flat").replace('class="mat', 'style="width:52px;height:52px;border-radius:9px" class="mat')}</span>
    <span class="t"><b>${esc(w[0])}</b><span class="s">${esc(sub || (short(w[1]) + " · " + w[2]))}</span></span>${GAL[n] ? plate(GAL[n]) : ""}</button>`; }

/* ================= toast ================= */
let toastT = null;
function toast(msg, label, fn){
  $("#toast-msg").textContent = msg;
  const b = $("#toast-btn"); b.hidden = !label; b.textContent = label || ""; b.onclick = () => { $("#toast").hidden = true; if(fn) fn(); };
  $("#toast").hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { $("#toast").hidden = true; }, label ? 6000 : 2600);
}

/* ================= exhibitions ================= */
const dParse = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const dFmt = (s, withYear) => dParse(s).toLocaleDateString("en-US", {month:"short", day:"numeric", year: withYear ? "numeric" : undefined});
function showList(){
  const today = new Date(); today.setHours(0,0,0,0);
  const yr = today.getFullYear(), now = [], soon = [];
  EXHIBS.forEach((e, i) => {
    if(e.end && dParse(e.end) < today) return;
    const opens = e.start ? dParse(e.start) : null;
    (opens && opens > today ? soon : now).push(Object.assign({i}, e));
  });
  now.sort((a,b) => (a.end ? dParse(a.end) : 9e15) - (b.end ? dParse(b.end) : 9e15));
  soon.sort((a,b) => dParse(a.start) - dParse(b.start));
  const out = [];
  now.forEach(e => { const left = e.end ? Math.round((dParse(e.end) - today) / 864e5) : null;
    out.push({e, soon:false, later:false, closing: left !== null && left <= 14, endShort: e.end ? dFmt(e.end, false) : "",
      when: e.end ? (left === 0 ? "Last day today" : `Through ${dFmt(e.end, dParse(e.end).getFullYear() !== yr)}`) : "Ongoing"}); });
  const horizon = new Date(today); horizon.setDate(horizon.getDate() + 120);
  soon.forEach(e => { const o = dParse(e.start);
    out.push({e, soon:true, later: o > horizon, when: (e.startText || `Opens ${dFmt(e.start, o.getFullYear() !== yr)}`) + (e.end ? `, through ${dFmt(e.end, true)}` : "")}); });
  let k = 0; out.forEach(x => { x.k = ++k; });
  return out;
}
const floorName = f => f === 0 ? "Ground floor" : f === 1.5 ? "Floor 1 mezzanine" : `Floor ${f}`;
const showPlate = e => e.gals && e.gals.length ? String(e.gals[0]).padStart(3, "0") : "";

/* ================= the plan: traced floor plans (Floors 1 and 2) ================= */
// Plan units: 390 x 260 frame. Source tracing was in screenshot pixels; PX converts.
const PX = (x, y) => ({x: Math.round((x - 40) / 3.3 * 10) / 10, y: Math.round((y - 140) / 3.3 * 10) / 10});
const ZL = { // department labels: [px x, px y, lines]
  1: {great:[680,836,["GREAT HALL"]], egypt:[1175,842,["EGYPTIAN ART"]], dendur:[1228,600,["TEMPLE","OF DENDUR"]],
      greek:[205,832,["GREEK & ROMAN"]], rock:[190,632,["AFRICA, OCEANIA","& AMERICAS"]], esda:[455,566,["EUROPEAN","SCULPTURE"]],
      medieval:[684,535,["MEDIEVAL"]], lehman:[684,282,["LEHMAN"]], arms:[990,594,["ARMS & ARMOR"]],
      american:[1080,440,["AMERICAN WING"]], tang:[214,372,["MODERN","CLOSED"]]},
  2: {balcony:[678,836,["BALCONY"]], europe:[677,494,["EUROPEAN","PAINTINGS"]], c19:[192,636,["19TH-C.","EUROPE"]],
      american2:[1150,320,["AMERICAN WING"]], music:[990,586,["MUSIC"]], asian:[1180,852,["ASIAN ART"]],
      islamic:[175,842,["ISLAMIC"]], neareast:[440,830,["NEAR EAST"]], tang2:[212,300,["MODERN","CLOSED"]]},
  0: {eatery:[686,470,["THE EATERY"],"The Eatery"], e81:[235,905,["81ST STREET","ENTRANCE"],"81st Street entrance"], textile:[550,525,["TEXTILE","CENTER"],"Antonio Ratti Textile Center"]},
  1.5: {am1m:[1150,345,["AMERICAN WING","MEZZANINE"],"American Wing mezzanine"], gr1m:[205,900,["GREEK & ROMAN"],"Greek and Roman mezzanine"]},
  4: {f4:[275,400,["FLOOR 4"],"Floor 4"]}
};
// stairs and elevators between floors (screenshot pixels, aligned to the Floor 1 frame)
const FLOORS = [1, 2, 0, 1.5, 4];
const fshort = f => f === 0 ? "G" : f === 1.5 ? "1M" : String(f);
const floorTo = f => f === 0 ? "the Ground floor" : f === 1.5 ? "the mezzanine (1M)" : `Floor ${f}`;
const LINKS = [
  {k:"stairs", name:"Grand Staircase", at:{1:[682,738], 2:[678,722]}},
  {k:"stairs", name:"stairs by Gallery 537", at:{1:[633,600], 2:[636,612]}},
  {k:"stairs", name:"stairs by Gallery 500", at:{1:[735,612], 2:[720,612]}},
  {k:"stairs", name:"stairs by Gallery 520", at:{1:[634,368], 2:[624,370], 0:[635,372]}},
  {k:"stairs", name:"stairs by Gallery 511", at:{1:[727,368], 2:[735,368], 0:[740,372]}},
  {k:"stairs", name:"American Wing stairs by Gallery 701", at:{1:[909,400], 2:[907,401], 1.5:[912,397]}},
  {k:"stairs", name:"American Wing stairs by Gallery 724", at:{1:[1078,398], 2:[1069,401]}},
  {k:"stairs", name:"stairs by Gallery 731", at:{1:[1151,481], 2:[1159,472], 1.5:[1150,482]}},
  {k:"stairs", name:"stairs by Gallery 772", at:{2:[1054,358], 1.5:[1055,357]}},
  {k:"stairs", name:"stairs by Gallery 380", at:{1:[1088,648], 2:[1062,648]}},
  {k:"stairs", name:"stairs by Gallery 132", at:{1:[1070,830], 2:[1066,815]}},
  {k:"stairs", name:"stairs by Gallery 160", at:{1:[297,898], 2:[292,904], 1.5:[295,892], 0:[315,897]}},
  {k:"stairs", name:"stairs by Gallery 169", at:{1:[80,773], 1.5:[80,772]}},
  {k:"stairs", name:"stairs by Gallery 534", at:{1:[568,741], 2:[561,748]}},
  {k:"elev", name:"elevator by Galleries 399 and 555", at:{1:[300,480], 2:[285,490], 0:[300,480], 4:[290,478]}}
].map(l => { l.p = {}; Object.keys(l.at).forEach(f => { l.p[f] = PX(...l.at[f]); }); return l; });
const ENTRANCE = Object.assign(PX(682, 884), {f: 1, label: "the 82nd Street entrance"});

const FL = {};
FLOORS.forEach(f => {
  const P = PLAN[f];
  const rooms = P.rooms.map(([k, g, n, z, d, c]) => {
    const polys = d.split("Z").filter(Boolean).map(s => s.replace(/^M/, "").split("L").map(p => p.split(" ").map(Number)));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    polys.forEach(pl => pl.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
    return {k, g, n, z, d, c, polys, bb: [x0, y0, x1, y1]};
  });
  FL[f] = {rooms, labels: P.labels};
});
const inPoly = (pl, x, y) => { let c = false; for(let i = 0, j = pl.length - 1; i < pl.length; j = i++){ const [xi, yi] = pl[i], [xj, yj] = pl[j]; if((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
function roomAt(f, x, y){ return FL[f].rooms.find(r => x >= r.bb[0] && x <= r.bb[2] && y >= r.bb[1] && y <= r.bb[3] && r.polys.some(pl => inPoly(pl, x, y))) || null; }
const zc = (f, id) => { const r = ZL[f] && ZL[f][id]; return r ? PX(r[0], r[1]) : null; };
function galPos(v){
  for(const f of FLOORS){ const p = FL[f].labels[String(v)]; if(p) return {f, x: p[0], y: p[1]}; }
  return null;
}
function zoneOfGallery(v){
  let r = RANGES.find(r => v >= r[0] && v <= r[1]);
  if(!r && v >= 340 && v <= 399) r = [340,399,"Arts of Africa, Oceania and the Americas","Floor 1, south","rock"];
  if(r && r[4] === "egypt" && v === 131) r = [131,131,"The Temple of Dendur","Floor 1, north","dendur"];
  if(r && r[4] === "american" && galPos(v) && galPos(v).f === 2) r = r.slice(0, 4).concat(["american2"]);
  return r;
}
function workPos(n){
  const z = workZone(n); if(!z) return null;
  const g = GAL[n] && galPos(+GAL[n]);
  if(g) return g;
  const c = PLAN[z.f] && zc(z.f, z.id);
  return c ? {f: z.f, x: c.x, y: c.y} : null;
}
// positions for restrooms, food and shows
const BATH_PX = {0:[910,812], 1:[557,440], 2:[293,458], 3:[1202,460], 4:[1196,462], 5:[1018,742], 6:[290,460], 7:[669,350], 8:[339,779], 9:[287,459]};
const FOOD_PX = {0:[380,368], 1:[975,366], 2:[680,850], 3:[740,725], 4:[685,499]};
BATH.forEach(b => { if(b.lvl === "1M") b.f = 1.5; });
const EX_PX = {1:[860,708], 4:[682,915], 9:[525,700], 11:[520,420], 12:[610,395], 13:[1150,331], 15:[900,850], 16:[1040,830], 27:[682,915], 28:[680,835]};
BATH.forEach((b, i) => { const p = b.px || BATH_PX[i]; b.nx = p && PLAN[b.f] ? PX(...p) : null; });
FOOD.forEach((b, i) => { const p = FOOD_PX[i]; b.nx = p && PLAN[b.f] ? PX(...p) : null; });
EXHIBS.forEach((e, i) => { if(!PLAN[e.f]){ e.nx = null; return; }
  const p = EX_PX[i]; if(p){ e.nx = PX(...p); return; }
  const g = e.gals.map(galPos).find(Boolean); e.nx = g && g.f === e.f ? {x: g.x, y: g.y} : null; });
const HINTS = [];

function herePos(){
  if(here === null) return null;
  const g = galPos(here); if(g) return g;
  const ex = EXHIBS.find(e => e.nx && e.gals.includes(here));
  if(ex) return {f: ex.f, x: ex.nx.x, y: ex.nx.y};
  const r = zoneOfGallery(here), z = r && byId(r[4]);
  const c = z && zc(z.f, z.id); return c ? {f: z.f, x: c.x, y: c.y} : null;
}

/* ---------- walking grid and path finding ---------- */
const GRIDS = {}, CPX = 4;
function grid(f){
  if(GRIDS[f]) return GRIDS[f];
  const g = PLAN[f].grid, a = new Uint8Array(g.w * g.h); let i = 0;
  g.rle.replace(/([abcd])(\d+)/g, (m, c, n) => { n = +n; a.fill(c.charCodeAt(0) - 97, i, i + n); i += n; return ""; });
  return GRIDS[f] = {w: g.w, h: g.h, a};
}
const u2c = (x, y) => [Math.floor((x * 3.3 + 40) / CPX), Math.floor((y * 3.3 + 140) / CPX)];
const c2u = (i, j) => [Math.round(((i + .5) * CPX - 40) / 3.3 * 10) / 10, Math.round(((j + .5) * CPX - 140) / 3.3 * 10) / 10];
function snap(f, x, y){
  const G = grid(f), [ci, cj] = u2c(x, y); let best = -1, bd = 1e9;
  for(let r = 0; r <= 30 && best < 0; r += 3)
    for(let j = Math.max(0, cj - r - 3); j <= Math.min(G.h - 1, cj + r + 3); j++)
      for(let i = Math.max(0, ci - r - 3); i <= Math.min(G.w - 1, ci + r + 3); i++){
        if(!G.a[j * G.w + i]) continue; const d = (i - ci) ** 2 + (j - cj) ** 2; if(d < bd){ bd = d; best = j * G.w + i; } }
  return best;
}
const NB = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
function astar(f, s, t){
  const G = grid(f), W_ = G.w, a = G.a, n = W_ * G.h;
  if(s < 0 || t < 0) return null;
  const dist = new Float32Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
  const tx = t % W_, ty = (t / W_) | 0;
  const hf = i => { const dx = Math.abs(i % W_ - tx), dy = Math.abs(((i / W_) | 0) - ty); return 0.7 * (Math.max(dx, dy) + 0.414 * Math.min(dx, dy)); };
  const hk = [], hv = [];
  const push = (k, v) => { let i = hk.length; hk.push(k); hv.push(v); while(i > 0){ const p = (i - 1) >> 1; if(hk[p] <= k) break; hk[i] = hk[p]; hv[i] = hv[p]; i = p; } hk[i] = k; hv[i] = v; };
  const pop = () => { const top = hv[0], lk = hk.pop(), lv = hv.pop(); if(hk.length){ let i = 0; for(;;){ let c = 2 * i + 1; if(c >= hk.length) break; if(c + 1 < hk.length && hk[c + 1] < hk[c]) c++; if(hk[c] >= lk) break; hk[i] = hk[c]; hv[i] = hv[c]; i = c; } hk[i] = lk; hv[i] = lv; } return top; };
  dist[s] = 0; push(hf(s), s);
  while(hk.length){
    const i = pop(); if(done[i]) continue; done[i] = 1; if(i === t) break;
    const x = i % W_, y = (i / W_) | 0;
    for(const [dx, dy, c] of NB){
      const nx = x + dx, ny = y + dy; if(nx < 0 || ny < 0 || nx >= W_ || ny >= G.h) continue;
      const j = ny * W_ + nx, v = a[j]; if(!v || done[j]) continue;
      if(dx && dy && (!a[y * W_ + nx] || !a[ny * W_ + x])) continue;
      const nd = dist[i] + c * (v === 2 ? 0.7 : v === 3 ? 7 : 1);
      if(nd < dist[j]){ dist[j] = nd; prev[j] = i; push(nd + hf(j), j); }
    }
  }
  if(s !== t && prev[t] < 0) return null;
  const cells = []; for(let i = t; i >= 0; i = i === s ? -1 : prev[i]) cells.push(i);
  cells.reverse();
  return {cost: dist[t], cells};
}
function los(G, i0, i1){
  const x0 = i0 % G.w, y0 = (i0 / G.w) | 0, x1 = i1 % G.w, y1 = (i1 / G.w) | 0, n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for(let k = 1; k < n; k++){ const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n), v = G.a[y * G.w + x]; if(v !== 1 && v !== 2) return false; }
  return true;
}
function smooth(f, cells){
  const G = grid(f), out = [cells[0]]; let i = 0;
  while(i < cells.length - 1){ let j = Math.min(cells.length - 1, i + 60); while(j > i + 1 && !los(G, cells[i], cells[j])) j--; out.push(cells[j]); i = j; }
  return out.map(c => c2u(c % G.w, (c / G.w) | 0));
}
const plen = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i-1][0], p[1] - pts[i-1][1]) : 0, 0);
function leg(f, a, b){
  const r = astar(f, snap(f, a.x, a.y), snap(f, b.x, b.y)); if(!r) return null;
  return {f, cells: r.cells, cost: r.cost, pts: smooth(f, r.cells)};
}
// from/to: {f, x, y}. Returns {legs, links, cost} or null.
const linkCost = l => l.k === "elev" ? 40 : l.name === "Grand Staircase" ? 10 : 40;
function routeBetween(from, to, acc){
  if(from.f === to.f){ const l = leg(from.f, from, to); if(l) return {legs: [l], links: [], cost: l.cost}; }
  const ok = l => !acc || l.k === "elev", has = (l, f) => l.p[f] !== undefined;
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const chains = [];
  LINKS.filter(l => ok(l) && has(l, from.f) && has(l, to.f) && from.f !== to.f).forEach(l => chains.push([l]));
  FLOORS.filter(m => m !== from.f && m !== to.f).forEach(m => LINKS.filter(a => ok(a) && has(a, from.f) && has(a, m)).forEach(a =>
    LINKS.filter(b => b !== a && ok(b) && has(b, m) && has(b, to.f)).forEach(b => chains.push([a, b]))));
  const est = ch => { let p = from, f = from.f, e = 0; ch.forEach((l, i) => { e += d(p, l.p[f]) + linkCost(l); const nf = i + 1 < ch.length ? FLOORS.find(m => m !== f && has(l, m) && has(ch[i+1], m)) : to.f; p = l.p[nf]; f = nf; }); return e + d(p, to) + (ch.length - 1) * 30; };
  let best = null;
  chains.map(ch => [ch, est(ch)]).sort((a, b) => a[1] - b[1]).slice(0, acc ? 6 : 5).forEach(([ch]) => {
    const legs = []; let p = from, f = from.f, cost = 0;
    for(let i = 0; i < ch.length; i++){ const l = ch[i];
      const nf = i + 1 < ch.length ? FLOORS.find(m => m !== f && has(l, m) && has(ch[i+1], m)) : to.f;
      if(nf === undefined) return;
      const L = leg(f, p, l.p[f]); if(!L) return; legs.push(L); cost += L.cost + linkCost(l); p = l.p[nf]; f = nf; }
    const L = leg(f, p, to); if(!L) return; legs.push(L); cost += L.cost;
    if(!best || cost < best.cost) best = {legs, links: ch, cost}; });
  return best;
}
// galleries passed along a leg, in order
function passed(l){
  const G = grid(l.f), seq = [];
  l.cells.forEach((c, k) => { if(k % 2) return; const [x, y] = c2u(c % G.w, (c / G.w) | 0), r = roomAt(l.f, x, y);
    const g = r && r.k !== "c" ? r.g : null, z = r && (r.g !== null || r.z === "great" || r.z === "balcony") ? r.z : null;
    const last = seq[seq.length - 1];
    if(last && last.g === g && last.z === z){ last.n++; last.x1 = x; last.y1 = y; }
    else seq.push({g, z, n: 1, x0: x, y0: y, x1: x, y1: y}); });
  return seq.filter(s => s.n >= 2 || s.g === null);
}
function heading(dx, dy){
  if(Math.hypot(dx, dy) < 14) return "";
  const ax = Math.abs(dx), ay = Math.abs(dy);
  const ns = dx > 0 ? "north" : "south", ew = dy > 0 ? "toward Fifth Avenue" : "toward the park";
  return ax > ay * 1.6 ? ns : ay > ax * 1.6 ? ew : `${ns}, ${ew}`;
}
const zoneLabel = z => z === "great" ? "the Great Hall" : z === "balcony" ? "the Great Hall Balcony" : z ? short(byId(z) ? byId(z).name : z) : "";
function dirSteps(res, from, to){
  const steps = [];
  res.legs.forEach((l, li) => {
    const seq = passed(l), runs = [];
    seq.forEach(s => { const z = s.z || (runs.length ? runs[runs.length - 1].z : null);
      const r = runs[runs.length - 1];
      if(r && r.z === z){ if(s.g !== null && !r.gs.includes(s.g)) r.gs.push(s.g); r.x1 = s.x1; r.y1 = s.y1; }
      else runs.push({z, gs: s.g !== null ? [s.g] : [], x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1}); });
    runs.forEach(r => {
      if(!r.z && !r.gs.length) return;
      const h = heading(r.x1 - r.x0, r.y1 - r.y0), first = !steps.length;
      const verb = first ? "Head" : "Continue";
      const name = zoneLabel(r.z);
      steps.push({f: l.f, t: r.z === "great" ? `${first ? "Cross" : "Walk into"} the Great Hall${h ? ", heading " + h : ""}` : `${verb}${h ? " " + h : ""} through ${name || (r.gs.length ? "the galleries" : "the hallway")}`, gs: r.gs.slice(0, 8), x: r.x1, y: r.y1});
    });
    if(li < res.links.length){ const l2 = res.links[li], nf = res.legs[li + 1].f, up = nf > l.f;
      steps.push({f: l.f, link: true, elev: l2.k === "elev", to: nf, t: `Take the ${l2.name} ${up ? "up" : "down"} to ${floorTo(nf)}`, gs: [], x: l2.p[l.f].x, y: l2.p[l.f].y}); }
  });
  steps.push({f: to.f, t: `Arrive at ${to.label}`, gs: to.g ? [to.g] : [], end: true, x: to.x, y: to.y});
  return steps;
}
const minutesFor = res => Math.max(1, Math.round(res.legs.reduce((s, l) => s + plen(l.pts), 0) * 3.3 * 0.32 / 55 + res.links.reduce((s, l) => s + (l.k === "elev" ? 2 : 1), 0)));

/* ---------- drawing ---------- */
function drawPlan(svg, f, o){
  o = o || {};
  const el = (tag, attrs, txt) => { const e = document.createElementNS(svgNS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(txt !== undefined) e.textContent = txt; return e; };
  const P = PLAN[f], F = FL[f];
  svg.innerHTML = "";
  const defs = el("defs"); defs.innerHTML = `<pattern id="h-${svg.id}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="var(--mat)"></rect><line x1="0" y1="0" x2="0" y2="4" stroke="var(--line)" stroke-width="1.4"></line></pattern>`;
  svg.appendChild(defs);
  svg.appendChild(el("text", {x:195, y:7, "text-anchor":"middle", class:"compass"}, "CENTRAL PARK"));
  svg.appendChild(el("text", {x:195, y:257, "text-anchor":"middle", class:"compass"}, "FIFTH AVENUE"));
  svg.appendChild(el("path", {d: P.shell, class: "pshell"}));
  svg.appendChild(el("path", {d: P.floor, class: "pfloor"}));
  if(P.pool) svg.appendChild(el("path", {d: P.pool, class: "ppool"}));
  const gr = el("g", {class: "rooms"});
  F.rooms.forEach(r => {
    const cls = ["rm"]; if(r.k === "x") cls.push("ex"); if(r.k === "c") cls.push("cafe");
    const zc_ = r.z && byId(r.z);
    if(zc_ && zc_.closed) cls.push("closed");
    if(o.sel && r.z === o.sel) cls.push("sel");
    if(o.hi && r.z && o.hi.has(r.z)) cls.push("hi");
    if(o.selG !== undefined && o.selG !== null && r.g === o.selG) cls.push("selg");
    if(o.marks && r.z && o.marks[r.z]) cls.push(o.marks[r.z]);
    const p = el("path", {d: r.d, class: cls.join(" ")});
    if(r.z) p.setAttribute("data-z", r.z); if(r.g !== null) p.setAttribute("data-g", r.g);
    if(zc_ && zc_.closed && !(o.marks && o.marks[r.z])) p.style.fill = `url(#h-${svg.id})`;
    gr.appendChild(p);
  });
  svg.appendChild(gr);
  if(!o.marks){
    const gn = el("g", {class: "gnums", "aria-hidden": "true"});
    Object.keys(F.labels).forEach(k => { const [x, y] = F.labels[k];
      gn.appendChild(el("text", {x, y: y + 1.1, "text-anchor": "middle", class: "gn" + (o.selG === +k ? " on" : "")}, k.padStart(3, "0"))); });
    svg.appendChild(gn);
  }
  // department labels, which are also the keyboard targets
  Object.keys(ZL[f] || {}).forEach(id => {
    const [px, py, lines, nm] = ZL[f][id], c = PX(px, py), z = byId(id);
    const g = el("g", {class: "zlab" + (o.marks && o.marks[id] === "right" ? " on" : ""), tabindex: "0", role: z ? "button" : "note", "aria-label": z ? z.name : nm || id});
    if(z) g.setAttribute("data-z", id);
    const fs = 6.2, lh = fs * 1.2, y0 = c.y - (lines.length - 1) * lh / 2 + fs * 0.35;
    lines.forEach((s, i) => g.appendChild(el("text", {x: c.x, y: y0 + i * lh, "text-anchor": "middle", class: "zl"}, s)));
    svg.appendChild(g);
  });
  const mk = (cls, x, y) => { const g = el("g", {class: "mk " + cls}); g.style.transformOrigin = `${x}px ${y}px`; return g; };
  if(o.route) o.route.lines.forEach(pts => { if(pts.length > 1) svg.appendChild(el("polyline", {points: pts.map(p => p.join(",")).join(" "), class: "route"})); });
  if(o.dir){
    if(o.dir.pts.length > 1){ const pp = o.dir.pts.map(p => p.join(",")).join(" ");
      svg.appendChild(el("polyline", {points: pp, class: "dircase"})); svg.appendChild(el("polyline", {points: pp, class: "dirline"})); }
    (o.dir.links || []).forEach(lk => { const g = mk("mk-link", lk.x, lk.y);
      g.appendChild(el("rect", {x: lk.x - 7.5, y: lk.y - 7.5, width: 15, height: 15, rx: 4}));
      g.appendChild(el("text", {x: lk.x, y: lk.y + 2.6, "text-anchor": "middle"}, lk.t)); svg.appendChild(g); });
    if(o.dir.start){ const g = mk("mk-start", o.dir.start.x, o.dir.start.y); g.appendChild(el("circle", {cx: o.dir.start.x, cy: o.dir.start.y, r: 4.2})); svg.appendChild(g); }
  }
  if(o.route) o.route.stops.forEach(st => { const g = mk("stop" + (st.state ? " " + st.state : ""), st.x, st.y);
    g.appendChild(el("circle", {cx: st.x, cy: st.y, r: 7.5})); g.appendChild(el("text", {x: st.x, y: st.y + 2.7, "text-anchor":"middle"}, st.label)); svg.appendChild(g); });
  if(o.wc){
    BATH.filter(b => b.f === f && b.nx).forEach(b => { const g = mk("mk-wc" + (b.lvl === "1M" ? " m" : ""), b.nx.x, b.nx.y);
      g.appendChild(el("rect", {x: b.nx.x - 7.5, y: b.nx.y - 7.5, width: 15, height: 15, rx: 4})); g.appendChild(el("text", {x: b.nx.x, y: b.nx.y + 2.4, "text-anchor":"middle"}, b.lvl === "1M" ? "M" : "WC")); svg.appendChild(g); });
  }
  if(o.wc || o.food) HINTS.filter(h => h.f === f).forEach(h => { const g = mk("mk-wc m", h.x, h.y);
    g.appendChild(el("rect", {x: h.x - 7.5, y: h.y - 7.5, width: 15, height: 15, rx: 4})); g.appendChild(el("text", {x: h.x, y: h.y + 2.4, "text-anchor":"middle"}, "G↓")); svg.appendChild(g); });
  if(o.food){
    FOOD.filter(b => b.f === f && b.nx).forEach(b => { const g = mk("mk-food", b.nx.x, b.nx.y);
      g.appendChild(el("circle", {cx: b.nx.x, cy: b.nx.y, r: 7.5}));
      if(b.k === "info") g.appendChild(el("text", {x: b.nx.x, y: b.nx.y + 3, "text-anchor":"middle"}, "i"));
      else g.appendChild(el("path", {transform:`translate(${b.nx.x} ${b.nx.y})`, d:"M-4 -2.5h5.6v2.8a2.8 2.8 0 0 1-2.8 2.8h0a2.8 2.8 0 0 1-2.8-2.8zM1.6 -1.8h.9a1.3 1.3 0 0 1 0 2.6h-.9"}));
      svg.appendChild(g); });
  }
  if(o.shows){
    o.shows.filter(x => x.e.nx && x.e.f === f).forEach(x => { const g = mk("mk-show" + (x.soon ? " soon" : ""), x.e.nx.x, x.e.nx.y);
      g.appendChild(el("circle", {cx: x.e.nx.x, cy: x.e.nx.y, r: 7})); g.appendChild(el("text", {x: x.e.nx.x, y: x.e.nx.y + 2.5, "text-anchor":"middle"}, x.k)); svg.appendChild(g); });
  }
  if(o.pin && o.pin.f === f){ const p = o.pin, g = mk("pinwrap", p.x, p.y);
    g.appendChild(el("path", {class:"pin", d:`M${p.x} ${p.y} C${p.x-1.5} ${p.y-5} ${p.x-6} ${p.y-7} ${p.x-6} ${p.y-11} A6 6 0 1 1 ${p.x+6} ${p.y-11} C${p.x+6} ${p.y-7} ${p.x+1.5} ${p.y-5} ${p.x} ${p.y}Z`}));
    g.appendChild(el("circle", {cx: p.x, cy: p.y - 11, r: 2.2, class: "pindot"})); svg.appendChild(g); }
  if(o.you && o.you.f === f){ const g = mk("you", o.you.x, o.you.y);
    g.appendChild(el("circle", {cx: o.you.x, cy: o.you.y, r: 13, class:"ring"})); g.appendChild(el("circle", {cx: o.you.x, cy: o.you.y, r: 6, class:"core"})); svg.appendChild(g); }
}

/* ================= route planning ================= */
const ZORDER = {1:["great","egypt","dendur","american","arms","medieval","lehman","esda","rock","greek"],
                2:["balcony","asian","music","american2","europe","c19","neareast","islamic"]};
const zrank = id => { for(const f of [1,2]){ const i = ZORDER[f].indexOf(id); if(i >= 0) return f*100 + i; } return 999; };
function orderedPlan(){ return plan.filter(onView).sort((a,b) => zrank(W[a-1][3]) - zrank(W[b-1][3]) || (+GAL[a] || 9999) - (+GAL[b] || 9999) || a - b); }
function planMinutes(ord){
  let m = ord.length * 4, prev = null;
  ord.forEach(n => { const z = W[n-1][3]; if(z !== prev){ m += prev ? (byId(z).f !== byId(prev).f ? 6 : 3) : 2; prev = z; } });
  return Math.max(5, Math.round(m / 5) * 5);
}
const fmtMin = m => m < 60 ? `${m} min` : `${Math.floor(m/60)} h${m % 60 ? " " + (m % 60) + " min" : ""}`;
const TOP10 = RANKED.filter(onView).slice(0, 10);
const PRESETS = [
  {name:"Must-sees", desc:"All 20 must-see works, in walking order.", works: MUST},
  {name:"The 10 most famous", desc:"The ten most-viewed works on Wikipedia that you can see now.", works: TOP10},
  {name:"Women artists", desc:"Artemisia Gentileschi, Adélaïde Labille-Guiard, Rosa Bonheur, Mary Cassatt and Tiffany designer Agnes Northrop.", works:[57,69,72,91,96]},
  {name:"Animals in art", desc:"A blue hippo, a five-legged guardian, armored horses, hungry cats and a sailor circled by sharks.", works:[5,8,10,21,30,51,68,72,94]},
  {name:"New York stories", desc:"A temple given to the city, a garden built by craftsmen from Suzhou, and rooms rebuilt from across the world.", works:[19,26,31,46,47,60,88,89,93,95]},
  {name:"A date at the Met", desc:"Couples, music, gardens and the most romantic rooms in the building.", works:[35,54,76,75,85,63,92,26,19]},
  {name:"Kings, queens and emperors", desc:"Five thousand years of rulers and the art they used to show their power.", works:[3,6,7,9,34,39,21,30,49]}
];
const routeCache = new Map();
function routeFor(ord, f){
  const key = f + ":" + ord.join(",") + ":" + [...seen].join(",");
  if(routeCache.has(key)) return routeCache.get(key);
  const stops = [], hi = new Set(), byPos = new Map();
  const nextN = ord.find(n => !seen.has(n));
  ord.forEach((n, i) => {
    const p = workPos(n); if(!p || p.f !== f) return;
    hi.add(W[n-1][3]);
    const k = Math.round(p.x) + "," + Math.round(p.y);
    if(!byPos.has(k)){ const st = {x: p.x, y: p.y, label: i + 1, works: []}; byPos.set(k, st); stops.push(st); }
    byPos.get(k).works.push(n);
  });
  stops.forEach(st => { st.state = st.works.every(m => seen.has(m)) ? "done" : st.works.includes(nextN) ? "next" : ""; });
  const lines = [];
  let prev = f === 1 ? ENTRANCE : f === 2 ? PX(678, 722) : stops[0];
  stops.forEach(st => { const l = leg(f, prev, st); if(l) lines.push(l.pts); prev = st; });
  const out = {lines: stops.length ? lines : [], stops, hi};
  routeCache.set(key, out); return out;
}
function loadPreset(i){
  const p = PRESETS[i], prev = plan.slice();
  plan = p.works.slice(); savePlan(); layers.route = true;
  toast(`Loaded “${p.name}”`, prev.length ? "Undo" : "", () => { plan = prev; savePlan(); refreshAll(); });
  refreshAll();
}

/* ================= read aloud ================= */
const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
let speakingN = null;
function stopSpeak(){ if(canSpeak && speakingN !== null){ try { speechSynthesis.cancel(); } catch(e) {} speakingN = null; const b = $("#w-say"); if(b) b.setAttribute("aria-pressed", "false"); } }
function speakWork(n){
  if(!canSpeak) return;
  if(speakingN === n){ stopSpeak(); return; }
  stopSpeak();
  const w = W[n-1];
  const date = w[2].replace(/\bc\.\s*/g, "circa ").replace(/–/g, " to ").replace(/BCE/g, "B C E");
  const c = CLASS[n-1];
  const text = [w[0] + ".", w[1] + ", " + date + ".", w[5], "Why it's on the list. " + WHY[n-1], "Look for. " + L[n-1][0], "The story. " + L[n-1][1],
    c ? "Key term. " + c[0] + ". " + c[1] : "", c ? "Think about this. " + c[6] : ""].join(" ").replace(/["“”]/g, "");
  const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = 0.97;
  u.onend = u.onerror = () => { if(speakingN === n){ speakingN = null; const b = $("#w-say"); if(b) b.setAttribute("aria-pressed", "false"); } };
  try { speechSynthesis.cancel(); speechSynthesis.speak(u); speakingN = n; const b = $("#w-say"); if(b) b.setAttribute("aria-pressed", "true"); } catch(e) {}
}

/* ================= pages (full screen) + back gesture ================= */
const pageStack = [];
function openPage(id){
  const el = $("#" + id); const was = !el.hidden;
  el.hidden = false; document.body.style.overflow = "hidden";
  if(!was){ pageStack.push(id); if(!inFrame){ try { history.pushState({pg: id}, ""); } catch(e) {} } }
}
function closePage(id, fromPop){
  const el = $("#" + id); if(el.hidden) return;
  if(id === "work") stopSpeak();
  el.hidden = true; const i = pageStack.lastIndexOf(id); if(i >= 0) pageStack.splice(i, 1);
  if(!pageStack.length) document.body.style.overflow = "";
  if(!fromPop && !inFrame){ try { if(history.state && history.state.pg) history.back(); } catch(e) {} }
}
window.addEventListener("popstate", () => { if(!$("#lightbox").hidden){ $("#lightbox").hidden = true; return; } const top = pageStack[pageStack.length - 1]; if(top) closePage(top, true); });
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){ if(!$("#lightbox").hidden){ $("#lightbox").hidden = true; return; } const top = pageStack[pageStack.length - 1]; if(top) closePage(top); }
  if(!$("#work").hidden && pageStack[pageStack.length - 1] === "work" && document.activeElement && document.activeElement.tagName !== "TEXTAREA"){
    if(e.key === "ArrowRight") stepWork(1); if(e.key === "ArrowLeft") stepWork(-1); }
});
$("#lightbox").addEventListener("click", () => { $("#lightbox").hidden = true; });

/* ================= work page ================= */
let wList = [], wIdx = -1;
function openWork(n, from){ wList = from && from.includes(n) ? from : [n]; showWork(n); openPage("work"); $("#work").scrollTop = 0; }
function stepWork(d){ const i = wIdx + d; if(i >= 0 && i < wList.length){ stopSpeak(); showWork(wList[i]); $("#work").scrollTop = 0; } }
function seenBy(n){
  const e = store.seen[n]; if(!e || !e.v || !e.by) return "";
  const me = (cfg.name || "").trim().toLowerCase(); if(me && e.by.trim().toLowerCase() === me) return "";
  return `<p class="byline" style="margin:0">Seen by ${esc(e.by)}</p>`;
}
function classNotes(n){
  const c = CLASS[n-1]; if(!c) return "";
  const [term, def, made, ctx, cmp, why, think] = c, cw = W[cmp-1];
  return `<section class="classcard" aria-labelledby="cn-${n}">
    <div class="cn-head"><span class="eyebrow" id="cn-${n}">Class notes</span><span class="small">Intro to art history</span></div>
    <div class="cn-row"><span class="eyebrow">Key term</span><p><b class="serif">${esc(term)}</b> ${esc(def)}</p></div>
    <div class="cn-row"><span class="eyebrow">How it was made</span><p>${esc(made)}</p></div>
    <div class="cn-row"><span class="eyebrow">The bigger picture</span><p>${esc(ctx)}</p></div>
    <div class="cn-row"><span class="eyebrow">Compare with</span>
      <button class="cmp" data-cmp="${cmp}"><span class="cmp-img">${matImg(cmp, "flat")}</span><span class="stack" style="gap:2px;min-width:0"><b>${esc(cw[0])}</b><span class="small">${esc(why)}</span></span></button></div>
    <div class="cn-row"><span class="eyebrow">Think about</span><p class="serif think">${esc(think)}</p></div>
  </section>`;
}
function showWork(n){
  wIdx = wList.indexOf(n);
  const w = W[n-1], z = workZone(n), [look, story] = L[n-1], tier = tierOf(n);
  const hero = IMG.has(n)
    ? `<div class="hero"><button id="w-zoom" aria-label="View larger"><img src="img/${n}.jpg" alt="${esc(w[0])}, ${esc(w[1])}"></button></div>`
    : `<div class="hero"><div class="none"><b>${esc(w[0])}</b><span>${MET_ID[n] ? "Still under copyright, so there's no free image to show." : "No open-access image."}</span><a href="${metLink(n)}" target="_blank" rel="noopener">See it on metmuseum.org</a></div></div>`;
  const credit = IMG.has(n) ? (WIKI_IMG[n] ? `Image: <a href="${WIKI_IMG[n].page}" target="_blank" rel="noopener">Wikimedia Commons</a> · ${esc(WIKI_IMG[n].artist)} · ${esc(WIKI_IMG[n].license)}${WIKI_IMG[n].note ? " · " + esc(WIKI_IMG[n].note) : ""}` : `Image: The Met, Open Access (public domain)`) : "";
  const g = GAL[n], wpos = workPos(n);
  $("#work").innerHTML = `
    <div class="bar clear"><button class="round" id="w-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div style="display:flex;gap:8px;align-items:center">${wList.length > 1 ? `<span class="small tnum" style="background:var(--surface);border-radius:12px;padding:4px 10px">${wIdx + 1} of ${wList.length}</span>
      <button class="round" id="w-prev" aria-label="Previous work" ${wIdx <= 0 ? "disabled" : ""}><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="round" id="w-next" aria-label="Next work" ${wIdx >= wList.length - 1 ? "disabled" : ""}><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>` : ""}</div></div>
    ${hero}
    <div class="label-card"><div class="in">
      <div class="stack" style="gap:4px">
        <span class="eyebrow ${tier === "must" ? "accent" : ""}">${TIER_NAME[tier]} · ${esc(eraName(n))}</span>
        <h1 id="w-title">${esc(w[0])}</h1>
        <span class="muted" style="font-size:15px">${esc(w[1])} · ${esc(w[2])}</span>
        ${w[6] ? `<span class="must" style="color:var(--signal);margin-top:4px">${esc(w[6])}</span>` : ""}
      </div>
      <button class="where" id="w-where" ${z ? "" : "disabled"}>
        ${g ? `<span class="plate m">${g}</span>` : z ? `<span class="plate m">${z.f}F</span>` : `<span class="plate out m">—</span>`}
        <span class="stack" style="gap:1px;flex:1;min-width:0"><b style="font-size:15px">${z ? `Floor ${z.f} · ${esc(short(z.name))}` : "Not on view right now"}</b>
          <span class="small">${z ? (plan.includes(n) ? `Stop ${orderedPlan().indexOf(n) + 1} on your route` : "Tap to see it on the map") : "The modern galleries are closed for the Tang Wing."}</span></span>
        ${z ? `<span style="font-size:14px;font-weight:700;color:var(--accent)">Map</span>` : ""}
      </button>
      ${wpos ? `<button class="btn ink" id="w-dir">${MAPDIR}Directions</button>` : ""}
      <div class="acts">
        <button class="act" id="w-seen" aria-pressed="${seen.has(n)}">${CHECK}Seen</button>
        <button class="act fav" id="w-fav" aria-pressed="${isFav(n)}">${HEART}Favorite</button>
        <button class="act" id="w-say" aria-pressed="${speakingN === n}" ${canSpeak ? "" : "disabled"}><svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/></svg>Listen</button>
        <button class="act" id="w-route" aria-pressed="${plan.includes(n)}" ${z ? "" : "disabled"}><svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>${plan.includes(n) ? "On route" : "Route"}</button>
      </div>
      ${seenBy(n)}
      <p class="serif" style="margin:0;font-size:17px;line-height:1.55">${esc(w[5])}</p>
      <div class="lesson"><span class="eyebrow">Why it's on the list</span><p>${esc(WHY[n-1])}</p></div>
      <div class="lesson"><span class="eyebrow">Look for</span><p>${esc(look)}</p></div>
      <div class="lesson"><span class="eyebrow">The story</span><p>${esc(story)}</p></div>
      ${classNotes(n)}
      <div class="lesson"><label class="eyebrow" for="w-note">Your notes</label><textarea class="note-in" id="w-note" rows="3" placeholder="What struck you, what to tell a friend…">${esc(noteOf(n))}</textarea></div>
      <div class="stack" style="gap:6px">
        ${VIEWS[n] ? `<span class="small">${fmtViews(VIEWS[n][0])} Wikipedia views in 60 days · #${rankAll(n)} of ${RANKED.length} · <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(VIEWS[n][1].replace(/ /g,"_"))}" target="_blank" rel="noopener">Article</a></span>` : ""}
        ${credit ? `<span class="credit">${credit}</span>` : ""}
        <span class="small">Works move between rooms. <a href="${metLink(n)}" target="_blank" rel="noopener">Check the Met's record</a> before a visit.</span>
      </div>
      ${wList.length > 1 ? `<div class="navrow"><button class="btn q" id="w-prev2" ${wIdx <= 0 ? "disabled" : ""}>Previous</button><button class="btn q" id="w-next2" ${wIdx >= wList.length - 1 ? "disabled" : ""}>Next</button></div>` : ""}
    </div></div>`;
  $("#w-back").onclick = () => closePage("work");
  [["#w-prev",-1],["#w-next",1],["#w-prev2",-1],["#w-next2",1]].forEach(([s,d]) => { const b = $(s); if(b) b.onclick = () => stepWork(d); });
  const zb = $("#w-zoom"); if(zb) zb.onclick = () => { $("#lb-img").src = `img/${n}.jpg`; $("#lb-img").alt = w[0]; $("#lightbox").hidden = false; };
  $("#w-seen").onclick = () => { setItem("seen", n, !seen.has(n)); showWork(n); refreshAll(); };
  $("#w-fav").onclick = () => { setItem("fav", n, !isFav(n)); showWork(n); refreshAll(); };
  $("#w-say").onclick = () => speakWork(n);
  const cb = $("#work .cmp"); if(cb) cb.onclick = () => { const m = +cb.dataset.cmp; if(!wList.includes(m)) wList = wList.slice(0, wIdx + 1).concat([m], wList.slice(wIdx + 1)); stopSpeak(); showWork(m); $("#work").scrollTop = 0; };
  $("#w-route").onclick = () => { plan.includes(n) ? plan = plan.filter(x => x !== n) : plan.push(n); savePlan(); showWork(n); refreshAll();
    toast(plan.includes(n) ? `Added to your route (${plan.length})` : "Removed from your route"); };
  const wd = $("#w-dir"); if(wd) wd.onclick = () => startDir(toWork(n));
  $("#w-where").onclick = () => { if(!z) return; while(pageStack.length) closePage(pageStack[pageStack.length - 1]); goMap({floor: fshort((workPos(n) || z).f), pin: n}); };
  let nt = null;
  $("#w-note").addEventListener("input", e => { clearTimeout(nt); const v = e.target.value; nt = setTimeout(() => setItem("notes", n, v), 600); });
  $("#w-note").addEventListener("blur", e => { clearTimeout(nt); if(e.target.value !== noteOf(n)) setItem("notes", n, e.target.value); });
}
(() => { let x0 = null, y0 = null; const el = $("#work");
  el.addEventListener("touchstart", e => { if(e.touches.length === 1 && e.target.tagName !== "TEXTAREA"){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, {passive:true});
  el.addEventListener("touchend", e => { if(x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if(Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) stepWork(dx < 0 ? 1 : -1); }, {passive:true});
})();

/* ================= Today ================= */
function dailyPick(){ const pool = N100.filter(n => IMG.has(n)); const d = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5); return pool[(d * 37) % pool.length]; }
function renderToday(){
  const ord = orderedPlan(), nx = ord.find(n => !seen.has(n)), all = showList(), now = all.filter(x => !x.soon), closing = now.filter(x => x.closing), soon = all.filter(x => x.soon);
  const day = new Date().toLocaleDateString("en-US", {weekday:"long"});
  let route;
  if(ord.length && nx){
    const w = W[nx-1], z = workZone(nx), k = ord.indexOf(nx) + 1, done = ord.filter(n => seen.has(n)).length;
    route = `<div class="card">
      <div class="sec-h"><span class="eyebrow accent">Next on your route</span><span class="small tnum">Stop ${k} of ${ord.length}</span></div>
      <button class="next" data-w="${nx}" data-list="route">${matImg(nx)}<span class="stack" style="gap:6px;min-width:0">
        <b>${esc(w[0])}</b><span class="muted" style="font-size:14px">${esc(short(w[1]))} · ${esc(w[2])}</span>
        <span style="display:flex;gap:8px;align-items:center">${GAL[nx] ? plate(GAL[nx], "m") : ""}<span style="font-size:14px;font-weight:600">Floor ${z.f}</span></span></span></button>
      <div class="progress"><i style="width:${Math.round(done / ord.length * 100)}%"></i></div>
      <div class="row2"><button class="btn" id="t-route">Show route</button><button class="btn q" id="t-edit">Edit route</button></div></div>`;
  } else if(ord.length){
    route = `<div class="card"><span class="eyebrow accent">Route complete</span><h2>You saw all ${ord.length} stops.</h2>
      <div class="row2"><button class="btn q" id="t-edit">Edit route</button><button class="btn q" id="t-clear">Start a new one</button></div></div>`;
  } else {
    route = `<div class="card"><span class="eyebrow accent">Plan your visit</span><h2>Pick a route to follow</h2>
      <p class="small" style="margin:0">Load a ready-made route, or add works from the Collection. The map draws your walking order.</p>
      ${PRESETS.slice(0, 3).map((p, i) => `<button class="preset" data-p="${i}" style="background:var(--ground)"><b>${esc(p.name)}</b><p>${p.works.filter(onView).length} works · about ${fmtMin(planMinutes(p.works.filter(onView)))}</p><span class="go">Load</span></button>`).join("")}
      <button class="link" id="t-more" style="align-self:flex-start">More routes</button></div>`;
  }
  const dn = dailyPick(), favs = Object.keys(store.fav).filter(k => store.fav[k].v).length;
  $("#v-today").innerHTML = `
    <div class="hdr"><div class="stack" style="gap:4px"><span class="eyebrow">${day} · The Met Fifth Avenue</span><h1>Your visit</h1></div>
      <button class="round" id="t-set" aria-label="Settings and sharing"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5"/></svg></button></div>
    ${route}
    ${closing.length ? `<div class="sec"><div class="sec-h"><h2>Closing soon</h2><button class="link" data-allshows>All ${now.length} shows</button></div>
      <div class="list">${closing.map(x => `<button class="li" data-show="${x.e.i}"><span class="dot"></span><span class="t"><b>${esc(x.e.t.split(":")[0])}</b><span class="s">${esc(x.e.where)}</span></span><span class="end">Ends ${x.endShort}</span></button>`).join("")}</div></div>` : ""}
    <div class="sec"><div class="sec-h"><h2>On now</h2>${closing.length ? "" : `<button class="link" data-allshows>All ${now.length} shows</button>`}</div>
      <div class="shows-row">${now.filter(x => !x.closing).slice(0, 10).map((x, i) => `<button class="showcard ${i === 0 ? "dark" : ""}" data-show="${x.e.i}"><span class="n">${showPlate(x.e) || (x.e.f === 0 ? "G" : "—")}</span><span class="stack" style="gap:3px"><b>${esc(x.e.t.split(":")[0])}</b><span class="s">${esc(floorName(x.e.f))}${x.e.end ? " · to " + x.endShort : ""}</span></span></button>`).join("")}</div></div>
    ${soon.length ? `<div class="sec"><div class="sec-h"><h2>Coming up</h2></div><div class="list">${soon.slice(0, 3).map(x => `<button class="li" data-show="${x.e.i}"><span class="wc show soon">${x.k}</span><span class="t"><b>${esc(x.e.t.split(":")[0])}</b><span class="s">${esc(x.when.split(",")[0])} · ${esc(x.e.where)}</span></span><span></span></button>`).join("")}</div></div>` : ""}
    <div class="sec"><div class="card" style="flex-direction:row;align-items:center;padding:12px">
      <span style="width:64px;height:64px;flex:none">${matImg(dn, "flat").replace('class="mat', 'style="width:64px;height:64px" class="mat')}</span>
      <span class="stack" style="gap:2px;flex:1;min-width:0"><span class="eyebrow">Daily picture</span><b style="font-size:15px">Who made it?</b></span>
      <button class="btn q" id="t-daily">Play</button></div></div>
    <div class="sec"><button class="li" id="t-coll" style="background:var(--surface);border-radius:16px">
      <span class="wc" style="background:var(--accent);color:var(--accent-ink)">${seen.size}</span>
      <span class="t"><b>${seen.size} of 100 works seen</b><span class="s">${favs} ${favs === 1 ? "favorite" : "favorites"}${cfg.url && cfg.code ? " · shared list on" : ""}</span></span><span class="link">Collection</span></button></div>`;
  const on = (s, f) => { const e = $(s); if(e) e.onclick = f; };
  on("#t-set", openSettings); on("#t-route", () => { layers.route = true; goMap({floor: String(workZone(nx).f)}); });
  on("#t-edit", openRoute); on("#t-more", openRoute); on("#t-clear", () => { plan = []; savePlan(); renderToday(); });
  on("#t-daily", () => { setView("learn"); learnMode = "pics"; pmode = "artist"; startPics(false, dn); renderLearn(); });
  on("#t-coll", () => setView("coll"));
  $("#v-today").querySelectorAll("[data-p]").forEach(b => b.onclick = () => loadPreset(+b.dataset.p));
  $("#v-today").querySelectorAll("[data-allshows]").forEach(b => b.onclick = openShows);
  $("#v-today").querySelectorAll("[data-show]").forEach(b => b.onclick = () => focusShow(+b.dataset.show));
  $("#v-today").querySelectorAll(".next[data-w]").forEach(b => b.onclick = () => openWork(+b.dataset.w, orderedPlan()));
}

/* ================= route page ================= */
function openRoute(){ renderRoutePage(); openPage("routepg"); }
function renderRoutePage(){
  const ord = orderedPlan(), off = plan.filter(n => !onView(n)), done = ord.filter(n => seen.has(n)).length;
  let stops = "";
  [1, 2].forEach(f => { const items = ord.filter(n => workZone(n).f === f); if(!items.length) return;
    stops += `<div class="sec-h" style="margin-top:6px"><h2>Floor ${f}</h2><span class="small">${items.length} ${items.length === 1 ? "stop" : "stops"}</span></div>
      <div class="list">${items.map(n => `<div class="li" style="grid-template-columns:auto 1fr auto auto;cursor:default">
        <span class="wc" style="${seen.has(n) ? "" : "background:var(--surface);color:var(--accent);box-shadow:inset 0 0 0 1.5px var(--accent)"}">${ord.indexOf(n) + 1}</span>
        <button class="t" data-w="${n}" style="all:unset;cursor:pointer;min-width:0;display:flex;flex-direction:column;gap:2px"><b style="font-size:15px">${esc(W[n-1][0])}</b><span class="s">${esc(short(W[n-1][1]))}${seen.has(n) ? " · seen" : ""}</span></button>
        ${GAL[n] ? plate(GAL[n]) : "<span></span>"}
        <button class="round" data-rm="${n}" aria-label="Remove ${esc(W[n-1][0])}" style="width:34px;height:34px;box-shadow:none;background:var(--ground)"><svg viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`).join("")}</div>`; });
  if(off.length) stops += `<div class="sec-h" style="margin-top:6px"><h2>Not on view now</h2></div><div class="list">${off.map(n => workRow(n)).join("")}</div>`;
  $("#routepg").innerHTML = `<div class="bar"><button class="round" id="r-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>Your route</b><span style="width:42px"></span></div>
    <div class="body">
      ${plan.length ? `<div class="card"><h2>${ord.length} ${ord.length === 1 ? "work" : "works"} · about ${fmtMin(planMinutes(ord))}</h2>
        <p class="small" style="margin:0">${done} of ${ord.length} seen. Stops are in walking order; times allow about four minutes a work plus walking.</p>
        <div class="row2"><button class="btn" id="r-map">Show on map</button><button class="btn q" id="r-clear">Clear route</button></div></div>${stops}`
      : `<div class="card"><h2>No route yet</h2><p class="small" style="margin:0">Load one below, or tap Route on any work.</p></div>`}
      <div class="era-h"><h3>Ready-made routes</h3><p>Loading one replaces your current route.</p></div>
      ${PRESETS.map((p, i) => { const ws = p.works.filter(onView); return `<button class="preset" data-p="${i}"><b>${esc(p.name)}</b><p>${esc(p.desc)}</p><p class="tnum">${ws.length} works · about ${fmtMin(planMinutes(ws.slice().sort((a,b) => zrank(W[a-1][3]) - zrank(W[b-1][3]))))}</p><span class="go">Load</span></button>`; }).join("")}
    </div>`;
  const pg = $("#routepg");
  $("#r-back").onclick = () => closePage("routepg");
  const m = $("#r-map"); if(m) m.onclick = () => { closePage("routepg"); layers.route = true; goMap({floor: ord.length ? String(workZone(ord.find(n => !seen.has(n)) || ord[0]).f) : "1"}); };
  const c = $("#r-clear"); if(c) c.onclick = () => { const prev = plan.slice(); plan = []; savePlan(); renderRoutePage(); refreshAll(); toast("Route cleared", "Undo", () => { plan = prev; savePlan(); renderRoutePage(); refreshAll(); }); };
  pg.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { const n = +b.dataset.rm; plan = plan.filter(x => x !== n); savePlan(); renderRoutePage(); refreshAll(); });
  pg.querySelectorAll("[data-w]").forEach(b => b.onclick = () => openWork(+b.dataset.w, ord.concat(off)));
  pg.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { loadPreset(+b.dataset.p); renderRoutePage(); pg.scrollTop = 0; });
}

/* ================= shows page ================= */
function openShows(){ renderShowsPage(); openPage("showspg"); $("#showspg").scrollTop = 0; }
function showCard(x){
  const e = x.e, onPlan = !!e.nx;
  return `<div class="card"><div style="display:flex;gap:12px;align-items:flex-start">
      ${showPlate(e) ? `<span class="plate m">${showPlate(e)}</span>` : `<span class="plate out m">${e.f === 0 ? "G" : e.f === 1.5 ? "1M" : e.f + "F"}</span>`}
      <div class="stack" style="gap:2px;min-width:0"><h2 style="font-size:17px;line-height:1.25">${esc(e.t)}</h2>
        <span style="font-size:13px;font-weight:700;color:${x.closing ? "var(--signal)" : "var(--accent)"}">${esc(x.when)}${x.closing ? " · closing soon" : ""}</span>
        <span class="small">${esc(e.where)}</span></div></div>
    <p style="margin:0" class="serif">${esc(e.d)}</p>
    <p class="small" style="margin:0"><b style="color:var(--ink)">Getting there.</b> ${esc(e.how)}</p>
    <div class="row2">${onPlan ? `<button class="btn q" data-show="${e.i}">Show on map</button>` : `<span></span>`}<a class="btn q" href="https://www.metmuseum.org/exhibitions/${e.url}" target="_blank" rel="noopener">Met page</a></div></div>`;
}
function renderShowsPage(){
  const all = showList(), now = all.filter(x => !x.soon), soon = all.filter(x => x.soon);
  $("#showspg").innerHTML = `<div class="bar"><button class="round" id="s-back" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>Exhibitions</b><span style="width:42px"></span></div>
    <div class="body">
      <div class="era-h"><h3>On now<span>${now.length}</span></h3><p>Ending soonest first. Included with admission unless the Met's page says otherwise.</p></div>
      ${now.map(showCard).join("")}
      ${soon.length ? `<div class="era-h"><h3>Coming up<span>${soon.length}</span></h3></div>${soon.map(showCard).join("")}` : ""}
      <p class="small">From the Met's exhibitions page, checked ${EXHIBS_CHECKED}. Shows drop off after they close; new ones arrive with app updates.</p>
    </div>`;
  $("#s-back").onclick = () => closePage("showspg");
  $("#showspg").querySelectorAll("[data-show]").forEach(b => b.onclick = () => { closePage("showspg"); focusShow(+b.dataset.show); });
}
function focusShow(i){
  const e = EXHIBS[i];
  if(!e.nx){ openShows(); return; }
  layers.shows = true; goMap({floor: fshort(e.f), focus: {kind: "show", i}});
}

/* ================= Map tab ================= */
let mapFloor = "1", selZone = null, focus = null, mquery = "", pinWork = null, dir = null, dirAcc = false;
try { dirAcc = localStorage.getItem("met-stepfree") === "1"; } catch(e) {}
let layers = {route: plan.length > 0, wc: false, food: false, shows: false};
let vb = {x:0, y:0, w:390, h:260};
const planFloorNum = () => ({"G": 0, "1": 1, "1M": 1.5, "2": 2, "4": 4})[mapFloor] ?? null;
function goMap(o){
  o = o || {};
  if(o.floor) { if(o.floor !== mapFloor) resetVB(); mapFloor = o.floor; }
  selZone = o.zone || null; focus = o.focus || null; pinWork = o.pin || null; if(!o.keepDir) dir = null;
  if(o.query !== undefined){ mquery = o.query; $("#msearch").value = o.query; }
  else { mquery = ""; $("#msearch").value = ""; }
  setView("map"); setSheet(!!o.open);
}
function resetVB(){ vb = {x:0, y:0, w:390, h:260}; applyVB(); }
function applyVB(){ const s = $("#mapsvg"); s.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  s.style.setProperty("--k", Math.max(0.42, Math.min(1, vb.w / 300)).toFixed(3));
  s.classList.toggle("near", vb.w <= 165); s.classList.toggle("close", vb.w <= 95); }
function fitVB(pts, minW){
  if(!pts.length) return;
  let x0 = Math.min(...pts.map(p => p[0])), x1 = Math.max(...pts.map(p => p[0])), y0 = Math.min(...pts.map(p => p[1])), y1 = Math.max(...pts.map(p => p[1]));
  let w = Math.max(minW || 110, (x1 - x0) * 1.3 + 24, ((y1 - y0) * 1.3 + 24) * 1.5); w = Math.min(390, w);
  vb = {w, h: w / 1.5, x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - w / 3}; applyVB();
}
/* Bottom sheet with three resting points: open (details), peek (default) and full (map takes the screen).
   It moves with a GPU transform so dragging follows the finger; the map is resized only once it settles. */
let sheetSt = "peek", sheetPeek = 0, stageT = null;
const FULL_STRIP = 56;
function sheetY(st){ const s = $("#msheet"), H = s.offsetHeight; return st === "open" ? 0 : Math.max(0, H - (st === "peek" ? sheetPeek : FULL_STRIP)); }
function placeSheet(st, animate){
  const s = $("#msheet"); if(!s.offsetHeight) return;
  if(!animate) s.classList.add("drag");
  s.style.setProperty("--sy", sheetY(st) + "px");
  $("#msbody").style.height = Math.max(0, s.offsetHeight - sheetY(st) - $("#mhandle").offsetHeight) + "px";
  if(!animate){ void s.offsetHeight; s.classList.remove("drag"); }
}
function setSheet(open, instant){
  sheetSt = open === true ? "open" : open === "full" ? "full" : "peek";
  const v = $("#v-map"); v.classList.toggle("full", sheetSt === "full"); $("#msheet").classList.toggle("open", sheetSt === "open");
  clearTimeout(stageT);
  if(sheetSt === "full") stageT = setTimeout(() => v.classList.add("fullstage"), instant ? 0 : 300);
  else v.classList.remove("fullstage");
  $("#mhandle").setAttribute("aria-expanded", String(sheetSt === "open"));
  placeSheet(sheetSt, !instant);
}
const sheetState = () => sheetSt;
function sizeSheet(){
  const pk = Math.round(Math.min(300, Math.max(220, innerHeight * 0.36)));
  document.documentElement.style.setProperty("--peek", pk + "px");
  if(pk !== sheetPeek || !$("#msheet").style.getPropertyValue("--sy")){ sheetPeek = pk; placeSheet(sheetSt, false); }
}
function renderChips(){
  const c = [
    plan.length ? ["route", `<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/></svg>My route`] : null,
    ["wc", "Restrooms"], ["food", "Food"], ["shows", "Shows"]].filter(Boolean);
  $("#mchips").innerHTML = c.map(([k, l]) => `<button class="chip ${k === "route" ? "route" : ""}" data-l="${k}" aria-pressed="${!!layers[k]}">${l}</button>`).join("");
}
function renderFloors(){
  $("#floors").innerHTML = ["4","3","2","1M","1","G"].map(f => `<button data-f="${f}" aria-pressed="${f === mapFloor}" aria-label="Floor ${f}">${f}</button>`).join("");
}
function renderMapView(){
  renderChips(); renderFloors();
  const f = planFloorNum();
  sizeSheet();
  $("#stage").hidden = f === null; $("#offplan").hidden = f !== null;
  if(f !== null){
    const ord = orderedPlan(), r = layers.route && ord.length ? routeFor(ord, f) : null;
    let pin = null;
    if(focus){ const it = focus.kind === "show" ? EXHIBS[focus.i] : focus.kind === "wc" ? BATH[focus.i] : FOOD[focus.i]; if(it.nx && it.f === f) pin = {f, x: it.nx.x, y: it.nx.y}; }
    if(pinWork){ const p = workPos(pinWork); if(p && p.f === f) pin = p; }
    let d = null;
    if(dir && dir.res){ const l = dir.res.legs.find(x => x.f === f);
      pin = dir.to.f === f ? {f, x: dir.to.x, y: dir.to.y} : null;
      if(l){ const li = dir.res.legs.indexOf(l), links = [];
        if(li < dir.res.links.length){ const lk = dir.res.links[li], nf = dir.res.legs[li + 1].f; links.push({x: lk.p[f].x, y: lk.p[f].y, t: lk.k === "elev" ? "EL" : (nf > f ? "↑" : "↓") + fshort(nf)}); }
        if(li > 0){ const lk = dir.res.links[li - 1]; links.push({x: lk.p[f].x, y: lk.p[f].y, t: lk.k === "elev" ? "EL" : "↕"}); }
        d = {pts: l.pts, links,
             start: dir.from.f === f && !(here !== null && herePos() && herePos().f === f && Math.hypot(herePos().x - dir.from.x, herePos().y - dir.from.y) < 1) ? dir.from : null}; } }
    const sg = /^\d{1,3}$/.test(mquery.trim()) ? +mquery.trim() : null;
    drawPlan($("#mapsvg"), f, {sel: selZone, selG: sg, hi: r && !d ? r.hi : null, route: d ? null : r, dir: d, wc: layers.wc, food: layers.food, shows: layers.shows ? showList().filter(x => !x.later) : null, pin, you: herePos()});
    applyVB();
  } else {
    $("#offplan").innerHTML = `<div><b>3</b><span class="muted">Floor 3 is a few small rooms and isn't drawn on the plan. Everything that's there is listed below.</span></div>`;
  }
  renderSheet();
}
/* ---------- directions ---------- */
function dirFrom(){
  if(dir && dir.fromG !== null && dir.fromG !== undefined){ const p = galPos(dir.fromG); if(p) return Object.assign({}, p, {label: `Gallery ${dir.fromG}`, g: dir.fromG}); }
  const hp = here !== null ? galPos(here) : null;
  if(hp) return Object.assign({}, hp, {label: `Gallery ${here}`, g: here, you: true});
  return Object.assign({}, ENTRANCE, {label: "82nd Street entrance", g: null});
}
function computeDir(){
  const from = dirFrom(); dir.from = from;
  dir.res = routeBetween(from, dir.to, dirAcc);
  dir.steps = dir.res ? dirSteps(dir.res, from, dir.to) : [];
  const gs = new Set(); dir.steps.forEach(s => s.gs.forEach(g => gs.add(g)));
  dir.along = N100.filter(n => onView(n) && GAL[n] && gs.has(+GAL[n]) && +GAL[n] !== dir.to.g && +GAL[n] !== from.g).slice(0, 8);
}
function dirFit(){
  if(!dir || !dir.res) return;
  const l = dir.res.legs.find(x => fshort(x.f) === mapFloor);
  if(l) fitVB(l.pts.concat(fshort(dir.to.f) === mapFloor ? [[dir.to.x, dir.to.y]] : []), 120);
}
function startDir(to){
  if(!to){ toast("That spot isn't on the plans yet"); return; }
  dir = {to, fromG: null}; computeDir();
  while(pageStack.length) closePage(pageStack[pageStack.length - 1]);
  mapFloor = fshort(dir.from.f); selZone = null; focus = null; pinWork = null; mquery = ""; $("#msearch").value = ""; $("#mclear").hidden = true;
  setView("map"); setSheet(false); renderMapView(); dirFit();
}
const toGallery = v => { const p = galPos(v); return p ? Object.assign({}, p, {g: v, label: `Gallery ${v}`, sub: (zoneOfGallery(v) || [])[2] || ""}) : null; };
const toWork = n => { const p = workPos(n); return p ? Object.assign({}, p, {g: GAL[n] && galPos(+GAL[n]) ? +GAL[n] : null, label: W[n-1][0], sub: GAL[n] ? `Gallery ${GAL[n]}` : short(workZone(n).name)}) : null; };
const toItem = (kind, i) => { const it = kind === "show" ? EXHIBS[i] : kind === "wc" ? BATH[i] : FOOD[i]; if(!it.nx) return null;
  return {f: it.f, x: it.nx.x, y: it.nx.y, g: null, label: kind === "show" ? it.t.split(":")[0] : kind === "wc" ? "Restroom" : it.name, sub: kind === "wc" ? it.name : (it.where.split(" · ").slice(1).join(" · ") || it.where)}; };
const pad3 = g => String(g).padStart(3, "0");
function dirPanel(){
  const t = dir.to, fr = dir.from, res = dir.res;
  const arrived = t.g !== null && t.g !== undefined && fr.g === t.g;
  let h = `<div class="sec-h"><span class="eyebrow accent">Directions</span><button class="link" data-dirend>End</button></div>
    <div class="dirhd"><span class="plate m">${t.g ? pad3(t.g) : fshort(t.f)}</span><div class="stack" style="gap:2px;min-width:0"><b style="font-size:17px;line-height:1.2">${esc(t.label)}</b><span class="small">${esc(floorName(t.f))}${t.sub ? " · " + esc(t.sub) : ""}</span></div></div>
    <div class="dirfrom"><span class="small">From</span><b>${fr.you ? "You, " : ""}${esc(fr.label)}</b><button class="link" data-dirfrom>Change</button></div>
    <div class="numin" id="d-fromrow" hidden><input id="d-from" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="Gallery" aria-label="Starting gallery number"><button class="btn" id="d-fromset">Start here</button></div>
    <div class="seg" role="group" aria-label="Route type"><button data-acc="0" aria-pressed="${!dirAcc}">Fastest</button><button data-acc="1" aria-pressed="${dirAcc}">Step-free</button></div>`;
  if(arrived) return h + `<div class="dirsum"><b>You're there</b><span class="small">Look for the number ${pad3(t.g)} on the doorway.</span></div>`;
  if(!res) return h + `<p class="small" style="margin:0">${dirAcc ? "We can't confirm a step-free way there yet. Elevators we haven't mapped may serve it, so ask any guard." : "No route found on the plan. Any guard can point the way."}</p>`;
  h += `<div class="dirsum"><b>About ${minutesFor(res)} min</b><span class="small">${res.links.length ? `Via the ${res.links.map(l => esc(l.name)).join(", then the ")}` : `All on ${esc(floorName(t.f))}`}</span></div>
    <ol class="steps">${dir.steps.map((s, i) => `<li class="${s.link ? "lk" : ""}${s.end ? " fin" : ""}"><span class="sn">${s.link ? (s.elev ? "EL" : "↕") : s.end ? "●" : i + 1 - dir.steps.slice(0, i).filter(x => x.link).length}</span>
      <div class="stack" style="gap:7px;min-width:0"><span>${esc(s.t)}</span>
      ${s.gs.length && !s.end ? `<div class="cps">${s.gs.map(g => `<button class="cp${here === g ? " on" : ""}" data-cp="${g}" aria-label="I'm in Gallery ${g}">${pad3(g)}</button>`).join("")}</div>` : ""}
      ${s.link ? `<button class="link" style="align-self:flex-start" data-dirfloor="${fshort(s.to)}">Show ${esc(floorName(s.to))}</button>` : ""}</div></li>`).join("")}</ol>
    <p class="small" style="margin:0">Tap a gallery number as you pass it. The route redraws from there.</p>`;
  if(dirAcc && fr.g === null) h += `<p class="small" style="margin:0"><b style="color:var(--ink)">Coming in?</b> The 82nd Street entrance has outdoor steps. The 81st Street entrance, just south, is at street level.</p>`;
  if(dirAcc) h += `<p class="small" style="margin:0">Step-free routes use the elevator by Galleries 399 and 555, the one we could confirm. It serves Floors G, 1, 2 and 4. There are others; a guard can point you to the nearest.</p>`;
  if(dir.along.length) h += `<div class="sec-h"><h2>Along the way</h2><span class="small">${dir.along.length}</span></div><div class="list" data-wl="${dir.along.join(",")}">${dir.along.map(n => workRow(n, `Gallery ${GAL[n]}`)).join("")}</div>`;
  return h + `<p class="small" style="margin:0">Approximate, traced from the Met's floor plan. Rooms close and doors change; if your way is blocked, ask a guard.</p>`;
}
function nearestBath(f, x, y){ return BATH.map((b, i) => [b, i]).filter(([b]) => b.f === f && b.nx && b.lvl !== "1M").map(([b, i]) => [b, i, Math.hypot(b.nx.x - x, b.nx.y - y)]).sort((a, b) => a[2] - b[2])[0]; }
function bathRow(b, i){ return `<button class="li" data-bath="${i}"><span class="wc">${b.lvl === "1M" ? "M" : b.lvl === "G" ? "G" : "WC"}</span><span class="t"><b>${esc(b.name)}</b><span class="s">${esc(b.where)}</span></span><span></span></button>`; }
function foodRow(b, i){ return `<button class="li" data-food="${i}"><span class="wc food">${b.k === "info" ? "<b style='font-family:Georgia,serif;font-style:italic'>i</b>" : CUP}</span><span class="t"><b>${esc(b.name)}</b><span class="s">${esc(b.where)}</span></span><span></span></button>`; }
function showRow(x){ return `<button class="li" data-show="${x.e.i}"><span class="wc show ${x.soon ? "soon" : ""}">${x.k}</span><span class="t"><b>${esc(x.e.t.split(":")[0])}</b><span class="s">${esc(x.when)} · ${esc(x.e.where)}</span></span>${x.closing ? `<span class="end">Soon</span>` : "<span></span>"}</button>`; }
function galleryCard(v){
  const r = zoneOfGallery(v), shows = showList().filter(x => !x.later && x.e.gals.includes(v));
  if(!r && !shows.length) return `<div class="card" style="padding:0;background:none"><b>No gallery ${v} on the list.</b><span class="small">Check the number on the doorway, or the nearest wall map.</span></div>`;
  const z = r ? byId(r[4]) : null, f = z ? z.f : shows[0].e.f;
  const items = z ? N100.filter(n => W[n-1][3] === z.id).sort((a, b) => (GAL[a] ? Math.abs(+GAL[a] - v) : 999) - (GAL[b] ? Math.abs(+GAL[b] - v) : 999)).slice(0, 6) : [];
  const inRoom = items.filter(n => +GAL[n] === v);
  let wc = "";
  if(z && PLAN[f]){ const c = zc(f, z.id), nb = c && nearestBath(f, c.x, c.y); if(nb) wc = `<div class="rowline"><span class="wc">WC</span><span style="font-size:14px;flex:1">Nearest restroom: ${esc(nb[0].name)}</span><button class="link" data-bath="${nb[1]}">Go</button></div>`; }
  return `<div class="here"><span class="plate l"><small>Gallery</small><span>${String(v).padStart(3, "0")}</span></span>
      <div class="stack" style="gap:2px;min-width:0"><span class="eyebrow ${here === v ? "accent" : ""}">${here === v ? "You're here" : esc(floorName(f))}</span><b style="font-size:17px;line-height:1.2">${esc(r ? r[2] : shows[0].e.where)}</b></div></div>
    ${shows.map(x => `<button class="li" data-show="${x.e.i}" style="background:var(--ground);border-radius:12px;border:0"><span class="wc show">${x.k}</span><span class="t"><b>${esc(x.e.t)}</b><span class="s">Exhibition · ${esc(x.when)}</span></span><span></span></button>`).join("")}
    ${items.length ? `<div class="thumbs">${items.slice(0, 3).map(n => `<button class="thumb" data-w="${n}" data-wl="${items.join(",")}">${matImg(n)}<b>${esc(W[n-1][0])}</b><span class="s ${+GAL[n] === v ? "on" : ""}">${+GAL[n] === v ? "In this room" : GAL[n] ? "Gallery " + GAL[n] : "Nearby"}</span></button>`).join("")}</div>` : ""}
    ${wc}
    ${galPos(v) && here !== v ? `<button class="btn ink" data-dirg="${v}">Directions</button>` : ""}
    <div class="row2">${here === v ? `<button class="btn q" data-clearhere>Clear location</button>` : `<button class="btn q" data-here="${v}">I'm here</button>`}${z ? `<button class="btn q" data-zone="${z.id}">Show area</button>` : "<span></span>"}</div>`;
}
function floorList(){
  const fk = planFloorNum() ?? 3, all = showList();
  const bs = BATH.map((x, i) => [x, i]).filter(([x]) => x.f === fk);
  const fs = FOOD.map((x, i) => [x, i]).filter(([x]) => x.f === fk);
  const ss = all.filter(x => x.e.f === fk);
  let h = `<div class="sec-h"><h2>${{G:"Ground floor", "1M":"American Wing mezzanine", "3":"Floor 3", "4":"Floor 4"}[mapFloor]}</h2></div>`;
  if(ss.length) h += `<div class="list">${ss.map(showRow).join("")}</div>`;
  if(bs.length) h += `<div class="list">${bs.map(([x, i]) => bathRow(x, i)).join("")}</div>`;
  if(fs.length) h += `<div class="list">${fs.map(([x, i]) => foodRow(x, i)).join("")}</div>`;
  return h + `<p class="small" style="margin:0">${{G: "Reach it by the stairs down from the Robert Lehman Wing, or come in at the 81st Street entrance.", "1M": "Up the stairs from the American Wing, or from the Greek and Roman galleries at the south end.", "4": "Take the elevator by Galleries 399 and 555 on Floor 1.", "3": "A small set of Asian Art galleries above the Chinese galleries on Floor 2."}[mapFloor]}</p>`;
}
function renderSheet(){
  const b = $("#msbody"), f = planFloorNum(), all = showList();
  let h = "";
  const q = mquery.trim().toLowerCase();
  if(dir && !q){
    h = dirPanel();
  } else if(q){
    if(/^\d{1,3}$/.test(q)) h = galleryCard(+q);
    else {
      const isWC = /rest ?room|bath|toilet|\bwc\b|loo|lav/.test(q), isFood = /food|coffee|caf|eat|drink|lunch|snack|bar|lounge/.test(q), isInfo = /info|desk|help/.test(q);
      const works = N100.filter(n => (W[n-1][0] + " " + W[n-1][1]).toLowerCase().includes(q)).slice(0, 12);
      const shows = all.filter(x => x.e.t.toLowerCase().includes(q)).slice(0, 6);
      const zones = Z.filter(z => !z.fixed && (z.name + " " + z.gal).toLowerCase().includes(q)).slice(0, 4);
      if(isWC) h += `<div class="sec-h"><h2>Restrooms</h2></div><div class="list">${BATH.map((x, i) => [x, i]).sort((a, c) => (a[0].f === f ? 0 : 1) - (c[0].f === f ? 0 : 1)).map(([x, i]) => bathRow(x, i)).join("")}</div>`;
      if(isFood || isInfo) h += `<div class="sec-h"><h2>Food and information</h2></div><div class="list">${FOOD.map((x, i) => foodRow(x, i)).join("")}</div>`;
      if(zones.length) h += `<div class="sec-h"><h2>Areas</h2></div><div class="list">${zones.map(z => `<button class="li" data-zone="${z.id}"><span class="plate s">${z.f}F</span><span class="t"><b>${esc(z.name)}</b><span class="s">${esc(z.gal)}</span></span><span></span></button>`).join("")}</div>`;
      if(works.length) h += `<div class="sec-h"><h2>Works</h2><span class="small">${works.length}</span></div><div class="list" data-wl="${works.join(",")}">${works.map(n => workRow(n, (workZone(n) ? "Floor " + workZone(n).f + " · " : "") + short(W[n-1][1]))).join("")}</div>`;
      if(shows.length) h += `<div class="sec-h"><h2>Exhibitions</h2></div><div class="list">${shows.map(showRow).join("")}</div>`;
      if(!h) h = `<p class="empty">Nothing matches “${esc(mquery)}”. Try a gallery number, an artist, or “restroom”.</p>`;
    }
  } else if(f === null){
    h = floorList();
  } else {
    if(focus){
      const it = focus.kind === "show" ? EXHIBS[focus.i] : focus.kind === "wc" ? BATH[focus.i] : FOOD[focus.i];
      if(focus.kind === "show"){ const x = all.find(y => y.e.i === focus.i); h += `<div class="sec-h"><span class="eyebrow accent">Exhibition</span><button class="link" data-unfocus>Close</button></div>${it.nx ? `<button class="btn ink" data-dirfocus>Directions</button>` : ""}${x ? showCard(x).replace('class="card"', 'class="stack" style="gap:12px"') : ""}`; }
      else h += `<div class="sec-h"><span class="eyebrow accent">${focus.kind === "wc" ? "Restroom" : "Food and information"}</span><button class="link" data-unfocus>Close</button></div>
        <div class="stack" style="gap:6px"><h2 style="margin:0;font-size:19px">${esc(it.name)}</h2><span class="small">${esc(it.where)}</span><p style="margin:0">${esc(it.how)}</p><p class="small" style="margin:0">${esc(it.tip)}</p></div>${it.nx ? `<button class="btn ink" data-dirfocus>Directions</button>` : ""}`;
    } else if(selZone){
      const z = byId(selZone), items = N100.filter(n => W[n-1][3] === z.id);
      h += `<div class="sec-h"><span class="eyebrow">Floor ${z.f} · ${esc(z.gal)}</span><button class="link" data-unzone>Close</button></div>
        <div class="stack" style="gap:6px"><h2 style="margin:0;font-size:20px">${esc(z.name)}</h2><p style="margin:0">${esc(z.d)}</p><p class="small" style="margin:0"><b style="color:var(--ink)">Next door.</b> ${esc(z.n)}</p></div>
        ${items.length ? `<div class="list" data-wl="${items.join(",")}">${items.map(n => workRow(n)).join("")}</div>` : ""}`;
    } else if(here !== null && herePos() && herePos().f === f){
      h += galleryCard(here);
    } else if(f === 0 || f === 1.5 || f === 4){
      h += floorList();
    } else {
      h += `<div class="stack" style="gap:8px"><span class="eyebrow">Where are you?</span><b style="font-size:17px">Type the number by the nearest doorway</b>
        <div class="numin"><input id="m-here" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="822" aria-label="Gallery number"><button class="btn" id="m-heref">Set</button></div>
        <span class="small">Or tap any area on the plan. Pinch to zoom.</span></div>`;
    }
    if(!focus && !selZone){
      const ord = orderedPlan();
      if(layers.route && ord.length){ const items = ord.filter(n => workZone(n).f === f);
        h += `<div class="sec-h"><h2>Your route on ${esc(floorName(f))}</h2><button class="link" data-editroute>Edit</button></div>${items.length ? `<div class="list" data-wl="${ord.join(",")}">${items.map(n => workRow(n, `Stop ${ord.indexOf(n) + 1}${seen.has(n) ? " · seen" : ""}`)).join("")}</div>` : `<p class="small" style="margin:0">No stops on this floor. Switch floors on the right.</p>`}`; }
      if(layers.wc) h += `<div class="sec-h"><h2>Restrooms</h2><span class="small">All accessible</span></div><div class="list">${BATH.map((x, i) => [x, i]).sort((a, c) => (a[0].f === f ? 0 : 1) - (c[0].f === f ? 0 : 1)).map(([x, i]) => bathRow(x, i)).join("")}</div>`;
      if(layers.food) h += `<div class="sec-h"><h2>Food and information</h2></div><div class="list">${FOOD.map((x, i) => [x, i]).sort((a, c) => (a[0].f === f ? 0 : 1) - (c[0].f === f ? 0 : 1)).map(([x, i]) => foodRow(x, i)).join("")}</div>`;
      if(layers.shows){ const ss = all.filter(x => !x.later); h += `<div class="sec-h"><h2>Exhibitions</h2><button class="link" data-allshows>All</button></div><div class="list">${ss.filter(x => x.e.f === f).concat(ss.filter(x => x.e.f !== f)).map(showRow).join("")}</div>`; }
    }
  }
  b.innerHTML = h;
  const ds = $("#d-fromset"); if(ds){ const go = () => { const v = parseInt($("#d-from").value, 10); if(isNaN(v)) return;
    if(!galPos(v)){ toast(`Gallery ${v} isn't on the plans`); return; }
    dir.fromG = v; computeDir(); mapFloor = fshort(dir.from.f); renderMapView(); dirFit(); };
    ds.onclick = go; $("#d-from").addEventListener("keydown", e => { if(e.key === "Enter") go(); }); }
  const hf = $("#m-heref"); if(hf){ const go = () => { const v = parseInt($("#m-here").value, 10); if(!isNaN(v)) setHere(v); }; hf.onclick = go; $("#m-here").addEventListener("keydown", e => { if(e.key === "Enter") go(); }); }
}
function setHere(v){
  here = v; saveHere(); mquery = ""; $("#msearch").value = ""; $("#mclear").hidden = true; selZone = null; focus = null;
  if(dir && galPos(v)){ dir.fromG = null; computeDir(); mapFloor = fshort(dir.from.f); renderMapView(); dirFit();
    toast(dir.to.g === v ? "You've arrived" : `Location set: Gallery ${v}. Route updated.`); return; }
  const p = herePos(); if(p && fshort(p.f) !== mapFloor){ mapFloor = fshort(p.f); resetVB(); }
  renderMapView(); toast(p ? `Location set: Gallery ${v}` : `Gallery ${v} isn't on the plan`);
}
$("#msbody").addEventListener("click", e => {
  const t = e.target.closest("[data-w],[data-zone],[data-here],[data-clearhere],[data-bath],[data-food],[data-show],[data-unfocus],[data-unzone],[data-allshows],[data-editroute],[data-dirend],[data-dirfrom],[data-acc],[data-cp],[data-dirfloor],[data-dirg],[data-dirfocus]"); if(!t) return;
  if(t.hasAttribute("data-dirend")){ dir = null; renderMapView(); return; }
  if(t.hasAttribute("data-dirfrom")){ const r = $("#d-fromrow"); r.hidden = !r.hidden; if(!r.hidden) $("#d-from").focus(); return; }
  if(t.dataset.acc !== undefined){ dirAcc = t.dataset.acc === "1"; try { localStorage.setItem("met-stepfree", dirAcc ? "1" : "0"); } catch(e2) {} computeDir(); mapFloor = fshort(dir.from.f); renderMapView(); dirFit(); return; }
  if(t.dataset.cp){ setHere(+t.dataset.cp); return; }
  if(t.dataset.dirfloor){ mapFloor = t.dataset.dirfloor; renderMapView(); dirFit(); return; }
  if(t.dataset.dirg){ startDir(toGallery(+t.dataset.dirg)); return; }
  if(t.hasAttribute("data-dirfocus")){ startDir(toItem(focus.kind, focus.i)); return; }
  if(t.dataset.w){ const wl = t.dataset.wl || (t.closest("[data-wl]") && t.closest("[data-wl]").dataset.wl); openWork(+t.dataset.w, wl ? wl.split(",").map(Number) : null); return; }
  if(t.dataset.zone){ const z = byId(t.dataset.zone); mapFloor = String(z.f); selZone = z.id; focus = null; mquery = ""; $("#msearch").value = ""; $("#mclear").hidden = true; setSheet(false); renderMapView(); return; }
  if(t.dataset.here){ setHere(+t.dataset.here); setSheet(false); return; }
  if(t.hasAttribute("data-clearhere")){ here = null; saveHere(); renderMapView(); return; }
  if(t.dataset.bath !== undefined){ const b = BATH[+t.dataset.bath]; layers.wc = true; focusOn({kind: "wc", i: +t.dataset.bath}, b.f); return; }
  if(t.dataset.food !== undefined){ const b = FOOD[+t.dataset.food]; layers.food = true; focusOn({kind: "food", i: +t.dataset.food}, b.f); return; }
  if(t.dataset.show !== undefined){ const e2 = EXHIBS[+t.dataset.show]; if(!e2.nx){ openShows(); return; } layers.shows = true; focusOn({kind: "show", i: +t.dataset.show}, e2.f); return; }
  if(t.hasAttribute("data-unfocus")){ focus = null; renderMapView(); return; }
  if(t.hasAttribute("data-unzone")){ selZone = null; renderMapView(); return; }
  if(t.hasAttribute("data-allshows")){ openShows(); return; }
  if(t.hasAttribute("data-editroute")){ openRoute(); return; }
});
function focusOn(fc, f){
  mquery = ""; $("#msearch").value = ""; $("#mclear").hidden = true; selZone = null;
  if(PLAN[f]){ focus = fc; if(fshort(f) !== mapFloor) resetVB(); mapFloor = fshort(f); }
  else { focus = null; mapFloor = f === 0 ? "G" : f === 1.5 ? "1M" : "3"; }
  setSheet(false); renderMapView();
}
$("#mchips").addEventListener("click", e => { const b = e.target.closest("[data-l]"); if(!b) return; layers[b.dataset.l] = !layers[b.dataset.l]; focus = null; renderMapView(); });
$("#floors").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if(!b) return; mapFloor = b.dataset.f; selZone = null; focus = null; pinWork = null; resetVB(); renderMapView(); if(dir) dirFit(); });
let sq = null;
$("#msearch").addEventListener("input", e => { clearTimeout(sq); $("#mclear").hidden = !e.target.value; sq = setTimeout(() => { mquery = e.target.value; selZone = null; focus = null; if(mquery) setSheet(true); renderSheet(); }, 120); });
$("#msearch").addEventListener("keydown", e => { if(e.key === "Enter"){ e.target.blur(); const v = e.target.value.trim(); if(/^\d{1,3}$/.test(v)) setSheet(false); } });
$("#msearch").addEventListener("focus", () => setSheet(true));
$("#mclear").addEventListener("click", e => { e.preventDefault(); $("#msearch").value = ""; mquery = ""; $("#mclear").hidden = true; $("#msearch").blur(); setSheet(!!dir); renderMapView(); });
$("#mclear").addEventListener("pointerdown", e => e.preventDefault());
// Sheet dragging: follows the finger 1:1, snaps to the nearest resting point, and a quick flick
// moves one step in that direction. Drag from the handle, or from the content when it's scrolled to the top.
(() => {
  const s = $("#msheet"), h = $("#mhandle"), body = $("#msbody");
  const ORDER = ["open", "peek", "full"], asArg = st => st === "open" ? true : st === "full" ? "full" : false;
  let d = null;
  const curY = () => parseFloat(s.style.getPropertyValue("--sy")) || 0;
  const begin = y => { d = {y0: y, sy0: curY(), last: y, lt: performance.now(), v: 0, moved: false}; };
  const follow = y => {
    const max = sheetY("full"); let ny = d.sy0 + (y - d.y0);
    if(ny < 0) ny = ny / 3; if(ny > max) ny = max + (ny - max) / 3;   // rubber band past the ends
    s.classList.add("drag"); s.style.setProperty("--sy", ny + "px");
    const vis = s.offsetHeight - Math.min(ny, sheetY("peek")), bh = Math.max(0, vis - h.offsetHeight);
    if(bh > parseFloat(body.style.height || 0)) body.style.height = bh + "px";   // reveal content while pulling up
    const now = performance.now(), dt = Math.max(1, now - d.lt); d.v = d.v * 0.4 + ((y - d.last) / dt) * 0.6; d.last = y; d.lt = now;
  };
  const finish = () => {
    const g = d; d = null; s.classList.remove("drag"); if(!g || !g.moved) return false;
    const y = curY(), ys = ORDER.map(sheetY);
    let target = ORDER[ys.map(v => Math.abs(v - y)).indexOf(Math.min(...ys.map(v => Math.abs(v - y))))];
    if(Math.abs(g.v) > 0.4){
      const below = ORDER.filter((st, i) => ys[i] > y + 2), above = ORDER.filter((st, i) => ys[i] < y - 2);
      target = g.v > 0 ? (below[0] || "full") : (above[above.length - 1] || "open");
    }
    setSheet(asArg(target)); return true;
  };
  // handle: pointer events (works for touch and mouse)
  h.addEventListener("pointerdown", e => { begin(e.clientY); h.setPointerCapture(e.pointerId); });
  h.addEventListener("pointermove", e => { if(!d) return; if(!d.moved && Math.abs(e.clientY - d.y0) > 3) d.moved = true; if(d.moved) follow(e.clientY); });
  const hup = () => { if(!d) return; const moved = d.moved; finish(); if(!moved) setSheet(sheetSt === "peek" ? true : false); };
  h.addEventListener("pointerup", hup); h.addEventListener("pointercancel", () => { d = null; setSheet(asArg(sheetSt)); });
  h.addEventListener("click", e => e.preventDefault());
  h.addEventListener("keydown", e => { const i = ORDER.indexOf(sheetSt);
    if(e.key === "ArrowDown"){ e.preventDefault(); setSheet(asArg(ORDER[Math.min(2, i + 1)])); }
    if(e.key === "ArrowUp"){ e.preventDefault(); setSheet(asArg(ORDER[Math.max(0, i - 1)])); }
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); setSheet(sheetSt === "peek" ? true : false); } });
  // content: pull down when scrolled to the top, or pull up while the sheet isn't fully open
  let tY = null, mode = null;
  body.addEventListener("touchstart", e => { if(e.touches.length !== 1){ tY = null; return; } tY = e.touches[0].clientY; mode = null; }, {passive: true});
  body.addEventListener("touchmove", e => {
    if(tY === null) return; const y = e.touches[0].clientY, dy = y - tY;
    if(mode === null && Math.abs(dy) > 6){
      mode = (dy > 0 && body.scrollTop <= 0) || (dy < 0 && sheetSt !== "open") ? "sheet" : "scroll";
      if(mode === "sheet"){ begin(tY); d.moved = true; }
    }
    if(mode === "sheet" && d){ e.preventDefault(); follow(y); }
  }, {passive: false});
  const tend = () => { if(mode === "sheet") finish(); tY = null; mode = null; };
  body.addEventListener("touchend", tend); body.addEventListener("touchcancel", tend);
})();
// pan, pinch and tap on the plan
(() => {
  const svg = $("#mapsvg"), pts = new Map(); let start = null, moved = 0, lastTap = 0;
  const scale = () => { const r = svg.getBoundingClientRect(); return Math.max(vb.w / r.width, vb.h / r.height); };
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(), s = scale(); const ox = (r.width * s - vb.w) / 2, oy = (r.height * s - vb.h) / 2;
    return {x: vb.x - ox + (cx - r.left) * s, y: vb.y - oy + (cy - r.top) * s}; };
  const clamp = () => { vb.w = Math.min(390, Math.max(56, vb.w)); vb.h = vb.w * 260 / 390;
    vb.x = Math.min(390 - vb.w * 0.4, Math.max(-vb.w * 0.6 + 0, vb.x)); vb.y = Math.min(260 - vb.h * 0.4, Math.max(-vb.h * 0.6, vb.y));
    if(vb.w >= 389){ vb.x = 0; vb.y = 0; } };
  const zoomAt = (cx, cy, k) => { const p = toSvg(cx, cy); const nw = Math.min(390, Math.max(56, vb.w * k)), kk = nw / vb.w;
    vb.x = p.x - (p.x - vb.x) * kk; vb.y = p.y - (p.y - vb.y) * kk; vb.w = nw; vb.h = nw * 260 / 390; clamp(); applyVB(); };
  svg.addEventListener("pointerdown", e => { pts.set(e.pointerId, {x: e.clientX, y: e.clientY}); svg.setPointerCapture(e.pointerId); if(pts.size === 1){ start = {x: e.clientX, y: e.clientY}; moved = 0; } });
  svg.addEventListener("pointermove", e => {
    if(!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, {x: e.clientX, y: e.clientY});
    if(pts.size === 1){ const s = scale(); vb.x -= (e.clientX - prev.x) * s; vb.y -= (e.clientY - prev.y) * s; moved += Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y); clamp(); applyVB(); }
    else if(pts.size === 2){ const [a, b] = [...pts.values()], other = [...pts.entries()].find(([id]) => id !== e.pointerId)[1];
      const d1 = Math.hypot(prev.x - other.x, prev.y - other.y), d2 = Math.hypot(a.x - b.x, a.y - b.y); moved += 99;
      if(d1 > 0 && d2 > 0) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d1 / d2); }
  });
  const up = e => {
    if(!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
    if(pts.size === 0 && moved < 8 && start){
      const now = Date.now();
      if(now - lastTap < 300){ zoomAt(e.clientX, e.clientY, vb.w < 90 ? 390 / vb.w : 0.45); lastTap = 0; return; }
      lastTap = now;
      const el = document.elementFromPoint(e.clientX, e.clientY), z = el && el.closest && el.closest("[data-z],[data-g]");
      if(z){ const g = z.getAttribute("data-g");
        if(g !== null && vb.w <= 165){ mquery = String(g); $("#msearch").value = mquery; $("#mclear").hidden = false; selZone = null; focus = null; pinWork = null; setSheet(false); renderMapView(); }
        else if(z.getAttribute("data-z")){ selZone = z.getAttribute("data-z"); focus = null; pinWork = null; mquery = ""; $("#msearch").value = ""; $("#mclear").hidden = true; setSheet(false); renderMapView(); } }
    }
  };
  svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", e => { pts.delete(e.pointerId); });
  svg.addEventListener("wheel", e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.15 : 0.87); }, {passive:false});
  svg.addEventListener("keydown", e => { const z = e.target.closest && e.target.closest("[data-z]"); if(z && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); selZone = z.getAttribute("data-z"); renderMapView(); } });
})();

/* ================= Collection ================= */
let cFilter = "all", cEra = "all", cSort = "time", cQuery = "";
function collList(){
  const ql = cQuery.trim().toLowerCase();
  let items = N100.filter(n => (cFilter === "all" || (cFilter === "must" && tierOf(n) === "must") || (cFilter === "fav" && isFav(n)) || (cFilter === "unseen" && !seen.has(n)))
    && (cEra === "all" || W[n-1][4] === cEra) && (!ql || (W[n-1][0] + " " + W[n-1][1]).toLowerCase().includes(ql)));
  if(cSort === "famous") items.sort((a, b) => (VIEWS[b] ? VIEWS[b][0] : -1) - (VIEWS[a] ? VIEWS[a][0] : -1) || a - b);
  return items;
}
function renderColl(keepFocus){
  const items = collList();
  const tile = n => { const w = W[n-1], z = workZone(n);
    return `<button class="tile" data-w="${n}">${IMG.has(n) ? `<div class="mat"><img src="img/${n}.jpg" alt="" loading="lazy">` : `<div class="mat"><span class="none">${esc(w[0])}</span>`}
      ${seen.has(n) ? `<span class="badge" aria-label="Seen">${CHECK}</span>` : ""}${isFav(n) ? `<span class="favmark" aria-label="Favorite">${HEART}</span>` : ""}${cSort === "famous" && VIEWS[n] ? `<span class="rank">#${rankAll(n)}</span>` : ""}</div>
      ${tierOf(n) === "must" && cFilter !== "must" ? `<span class="must">Must-see</span>` : ""}
      <b>${esc(w[0])}</b><span class="s">${GAL[n] ? plate(GAL[n]) : z ? plate(z.f + "F") : `<span class="plate out s">—</span>`}<span>${esc(short(w[1]))}</span></span></button>`; };
  const favCount = N100.filter(isFav).length;
  $("#v-coll").innerHTML = `
    <div class="hdr"><h1>Collection</h1><span class="small tnum">${seen.size} of 100 seen</span></div>
    <div class="stack" style="gap:12px">
      <div class="seg" id="c-filter">${[["all","All"],["must","Must-see"],["fav","Favorites"],["unseen","Not seen"]].map(([k,l]) => `<button data-c="${k}" aria-pressed="${cFilter === k}">${l}</button>`).join("")}</div>
      <div class="chips" id="c-eras"><button class="chip" data-e="all" aria-pressed="${cEra === "all"}">All periods</button>${ERAS.map(e => `<button class="chip" data-e="${e[0]}" aria-pressed="${cEra === e[0]}">${esc(e[1])}</button>`).join("")}</div>
      <div style="display:flex;gap:8px"><input class="colsearch" id="c-q" type="search" placeholder="Search artist or title" value="${esc(cQuery)}" autocomplete="off" style="flex:1;min-width:0">
        <button class="chip" id="c-sort" style="background:var(--surface)">${cSort === "time" ? "Time order" : "Most famous"}</button></div>
      ${cEra !== "all" && !cQuery ? `<p class="small" style="margin:0">${esc(ERA_INTRO[cEra])}</p>` : ""}
      ${cSort === "famous" ? `<p class="small" style="margin:0">Ranked by Wikipedia views, ${esc(VIEWS_RANGE)}. Works without an article come last.</p>` : ""}
    </div>
    <div class="grid" style="margin-top:18px">${items.map(tile).join("")}</div>
    ${items.length ? "" : `<p class="empty">${cFilter === "fav" && !favCount ? "No favorites yet. Tap the heart on any work." : "Nothing matches. Clear the search or change the filters."}</p>`}`;
  $("#c-filter").onclick = e => { const b = e.target.closest("[data-c]"); if(b){ cFilter = b.dataset.c; renderColl(); } };
  $("#c-eras").onclick = e => { const b = e.target.closest("[data-e]"); if(b){ cEra = b.dataset.e; renderColl(); } };
  $("#c-sort").onclick = () => { cSort = cSort === "time" ? "famous" : "time"; renderColl(); };
  const qi = $("#c-q"); let t = null;
  qi.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { cQuery = qi.value; renderColl(true); }, 150); });
  if(keepFocus){ qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length); }
  $("#v-coll").querySelector(".grid").onclick = e => { const b = e.target.closest("[data-w]"); if(b) openWork(+b.dataset.w, items); };
}

/* ================= quiz memory (this phone only) ================= */
const qload = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e) { return null; } };
const qsave = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} };
function drawFromDeck(key, all, count){
  let deck = (qload(key) || []).filter(x => all.includes(x)); const out = [];
  while(out.length < count){ if(!deck.length){ deck = shuffle(all.filter(x => !out.includes(x))); if(!deck.length) break; } out.push(deck.shift()); }
  qsave(key, deck); return out;
}
const deckLeft = (key, all) => { const d = qload(key); return d === null ? all.length : d.filter(x => all.includes(x)).length || all.length; };
const missList = key => qload(key) || [];
function markMiss(key, item, missed){ let m = missList(key).filter(x => x !== item); if(missed) m.push(item); qsave(key, m); }

/* ================= Learn ================= */
let learnMode = "layout";
function renderLearn(){
  const v = $("#v-learn");
  if(!v.dataset.built){
    v.innerHTML = `<div class="hdr"><h1>Learn</h1></div>
      <div class="seg" id="lmode"><button data-m="layout">Layout</button><button data-m="pics">Pictures</button><button data-m="terms">Terms</button><button data-m="time">Timeline</button></div>
      <div class="stack" style="gap:14px;margin-top:16px" id="l-layout">
        <div class="qcard"><span class="eyebrow" id="qlabel">Layout drill</span><p class="q" id="q">Ten landmarks and famous works. Tap where each one is.</p><p class="fb" id="qfb"></p></div>
        <div class="seg" id="dfloor"><button data-f="1">Floor 1</button><button data-f="2">Floor 2</button></div>
        <div class="drillmap"><svg id="drillsvg" viewBox="0 0 390 260" role="img" aria-label="Plan for the drill"></svg></div>
        <div class="row2"><button class="btn" id="qstart">Start drill</button><button class="btn w" id="qskip" disabled>Show answer</button></div>
        <button class="btn w" id="qmiss" hidden></button><p class="small" id="qinfo" style="margin:0"></p></div>
      <div class="stack" style="gap:14px;margin-top:16px" id="l-pics" hidden><div class="chips" id="pmode"></div><div class="qcard" id="pcard"></div></div>
      <div class="stack" style="gap:14px;margin-top:16px" id="l-terms" hidden><div class="qcard" id="tcard"></div><div id="tlist"></div></div>
      <div class="stack" style="gap:14px;margin-top:16px" id="l-time" hidden><p class="small" style="margin:0">All 100 works, oldest first. Blue dots are must-sees; dashed breaks mark long gaps.</p><ol class="tl" id="tl"></ol></div>`;
    v.dataset.built = "1";
    $("#lmode").onclick = e => { const b = e.target.closest("[data-m]"); if(b){ learnMode = b.dataset.m; renderLearn(); } };
    $("#dfloor").onclick = e => { const b = e.target.closest("[data-f]"); if(b){ drillFloor = +b.dataset.f; renderDrill(); } };
    $("#drillsvg").addEventListener("click", e => { const z = e.target.closest("[data-z]"); if(z) pick(z.getAttribute("data-z")); });
    $("#drillsvg").addEventListener("keydown", e => { const z = e.target.closest("[data-z]"); if(z && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); pick(z.getAttribute("data-z")); } });
    $("#qstart").onclick = () => startQuiz(false); $("#qmiss").onclick = () => startQuiz(true); $("#qskip").onclick = skipQ;
    $("#pmode").onclick = e => { const b = e.target.closest("[data-pm]"); if(b){ pmode = b.dataset.pm; pq = null; renderPics(); } };
    $("#tl").onclick = e => { const b = e.target.closest("[data-w]"); if(b) openWork(+b.dataset.w, TL_ORDER); };
    $("#tlist").onclick = e => { const b = e.target.closest("[data-w]"); if(b) openWork(+b.dataset.w, TERM_ORDER); };
  }
  $("#lmode").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === learnMode)));
  $("#l-layout").hidden = learnMode !== "layout"; $("#l-pics").hidden = learnMode !== "pics"; $("#l-time").hidden = learnMode !== "time"; $("#l-terms").hidden = learnMode !== "terms";
  if(learnMode === "terms") renderTerms();
  if(learnMode === "layout"){ renderDrill(); drillInfo(); }
  if(learnMode === "pics") renderPics();
  if(learnMode === "time") renderTimeline();
}
// layout drill
let quiz = null, drillFloor = 1;
function renderDrill(marks){
  $("#dfloor").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.f === drillFloor)));
  drawPlan($("#drillsvg"), drillFloor, {marks: marks || (quiz && quiz.marks)});
}
function drillItem(key){
  if(key[0] === "q"){ const it = QS[+key.slice(1)]; return it ? Object.assign({key}, it) : null; }
  const n = +key.slice(1), w = W[n-1]; if(!w || !w[3]) return null; const z = byId(w[3]);
  return {key, q: w[0], sub: short(w[1]), a: w[3], why: `Floor ${z.f}, ${short(z.name)}.`};
}
const drillKeysQ = () => QS.map((q, i) => "q" + i), drillKeysW = () => N100.filter(n => W[n-1][3]).map(n => "w" + n);
function startQuiz(practice){
  const keys = practice ? shuffle(missList("met-miss-drill")).slice(0, 10) : drawFromDeck("met-deck-drill-q", drillKeysQ(), 4).concat(drawFromDeck("met-deck-drill-w", drillKeysW(), 6));
  const items = shuffle(keys.map(drillItem).filter(Boolean)); if(!items.length) return;
  quiz = {items, i: -1, score: 0, miss: 0, marks: {}, practice: !!practice};
  $("#qstart").textContent = "Restart"; $("#qmiss").hidden = true; nextQ();
}
function drillInfo(){
  const m = missList("met-miss-drill").length;
  $("#qmiss").hidden = !m || !!quiz; $("#qmiss").textContent = `Practice my misses (${m})`;
  const lq = deckLeft("met-deck-drill-q", drillKeysQ()), lw = deckLeft("met-deck-drill-w", drillKeysW());
  $("#qinfo").textContent = `${lq + lw} of ${drillKeysQ().length + drillKeysW().length} questions left before any repeat. Quiz progress stays on this phone.`;
}
function nextQ(){
  quiz.i++; quiz.done = false; quiz.marks = {}; $("#qfb").textContent = ""; $("#qfb").className = "fb";
  if(quiz.i >= quiz.items.length){
    $("#qlabel").textContent = quiz.practice ? "Practice done" : "Done";
    $("#q").textContent = `${quiz.score} of ${quiz.items.length} found first try.`;
    $("#qfb").textContent = quiz.miss ? "Misses go on your practice list." : "No misses. Nice.";
    $("#qskip").disabled = true; $("#qstart").textContent = "Next round"; quiz = null; renderDrill({}); drillInfo(); return;
  }
  const it = quiz.items[quiz.i];
  $("#qlabel").textContent = `${quiz.practice ? "Practice · " : ""}Question ${quiz.i + 1} of ${quiz.items.length} · ${quiz.score} right`;
  $("#q").textContent = "Where is it? " + it.q + (it.sub ? ` (${it.sub})` : "");
  $("#qskip").disabled = false; renderDrill();
}
function pick(id){
  if(!quiz || quiz.done) return;
  const it = quiz.items[quiz.i];
  if(id === it.a){ quiz.marks[id] = "right"; if(!quiz.marks._missed) quiz.score++; quiz.done = true; markMiss("met-miss-drill", it.key, !!quiz.marks._missed);
    $("#qfb").className = "fb ok"; $("#qfb").textContent = "Right. " + it.why; renderDrill(); setTimeout(nextQ, 1500); }
  else { quiz.marks[id] = "wrong"; quiz.marks._missed = true; quiz.miss++;
    $("#qfb").className = "fb no"; $("#qfb").textContent = byId(it.a).f !== drillFloor ? "Not there. Try the other floor." : "Not there. Try again."; renderDrill(); }
}
function skipQ(){
  if(!quiz || quiz.done) return;
  const it = quiz.items[quiz.i]; quiz.miss++; quiz.done = true; quiz.marks._missed = true; quiz.marks[it.a] = "right"; markMiss("met-miss-drill", it.key, true);
  drillFloor = byId(it.a).f; $("#qfb").className = "fb no"; $("#qfb").textContent = "Here: " + it.why; renderDrill(); setTimeout(nextQ, 2200);
}
// picture quiz
const PMODES = [["artist","Who made it?"],["work","Name the work"],["period","Which period?"]];
let pmode = "artist", pq = null;
const artistOf = n => W[n-1][1].split(/,| and /)[0].replace(/^Attributed to /, "").trim();
const answerOf = n => pmode === "artist" ? artistOf(n) : pmode === "work" ? W[n-1][0] : eraName(n);
const picPool = () => N100.filter(n => IMG.has(n));
const picDeckKey = () => "met-deck-pics-" + pmode, picMissKey = () => "met-miss-pics-" + pmode;
function startPics(practice, firstN){
  let qs = practice ? shuffle(missList(picMissKey()).filter(n => IMG.has(n))).slice(0, 10) : drawFromDeck(picDeckKey(), picPool(), 10);
  if(firstN){ qs = [firstN].concat(qs.filter(n => n !== firstN)).slice(0, 10); }
  if(!qs.length){ pq = null; renderPics(); return; }
  pq = {qs, i: -1, score: 0, answered: false, practice: !!practice}; nextPic();
}
function nextPic(){
  pq.i++; pq.answered = false;
  if(pq.i >= pq.qs.length){ renderPics(); return; }
  const n = pq.qs[pq.i], right = answerOf(n);
  let pool;
  if(pmode === "period") pool = ERAS.map(e => e[1]);
  else { const same = N100.filter(m => m !== n && W[m-1][4] === W[n-1][4]).map(answerOf), rest = N100.filter(m => m !== n).map(answerOf);
    pool = shuffle([...new Set(same)]).concat(shuffle([...new Set(rest)])); }
  pq.opts = shuffle([right, ...[...new Set(pool.filter(x => x !== right))].slice(0, 3)]); pq.right = right;
  if(!$("#v-learn").hidden) renderPics();
}
function renderPics(){
  $("#pmode").innerHTML = PMODES.map(([k, l]) => `<button class="chip" data-pm="${k}" aria-pressed="${pmode === k}">${l}</button>`).join("");
  const c = $("#pcard");
  const misses = missList(picMissKey()).length, left = deckLeft(picDeckKey(), picPool()), total = picPool().length;
  const progressLine = `<p class="small" style="margin:0">${left === total ? `All ${total} pictures are in the deck.` : `${left} of ${total} pictures left before any repeat.`}${misses ? ` ${misses} to practice.` : ""} Quiz progress stays on this phone.</p>`;
  const buttons = label => `<div class="${misses ? "row2" : "stack"}"><button class="btn" id="p-start">${label}</button>${misses ? `<button class="btn q" id="p-miss">Practice misses (${misses})</button>` : ""}</div>`;
  const wire = () => { $("#p-start").onclick = () => startPics(false); const m = $("#p-miss"); if(m) m.onclick = () => startPics(true); };
  if(!pq){ c.innerHTML = `<span class="eyebrow">Picture quiz</span><p class="q">Ten pictures a round. ${PMODES.find(p => p[0] === pmode)[1]}</p>${progressLine}${buttons("Start")}`; wire(); return; }
  if(pq.i >= pq.qs.length){ const s = pq.score;
    c.innerHTML = `<span class="eyebrow">${pq.practice ? "Practice done" : "Done"}</span><p class="q">${s} of ${pq.qs.length} right.</p>
      <p style="margin:0">${pq.practice ? (misses ? "Right answers come off the practice list." : "Practice list cleared.") : s >= 9 ? "Excellent. Try another quiz type." : s >= 6 ? "Good going. Another round will lock it in." : "Read a few lessons in the Collection, then try again."}</p>${progressLine}${buttons("Next round")}`; wire(); return; }
  const n = pq.qs[pq.i], w = W[n-1];
  const prompt = pmode === "artist" ? "Who made this, or which culture is it from?" : pmode === "work" ? "What is this?" : "Which period is this from?";
  c.innerHTML = `<span class="eyebrow">${pq.practice ? "Practice · " : ""}Question ${pq.i + 1} of ${pq.qs.length} · ${pq.score} right</span>
    <figure class="qimg"><img src="img/${n}.jpg" alt="Mystery work"></figure><p class="q">${prompt}</p>
    <div class="opts">${pq.opts.map((o, i) => `<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div>
    <p class="fb" id="pfb"></p><div class="row2" id="p-after" hidden><button class="btn q" id="p-lesson">Open lesson</button><button class="btn" id="p-next">${pq.i + 1 < pq.qs.length ? "Next" : "See score"}</button></div>`;
  c.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    if(pq.answered) return; pq.answered = true;
    const ok = pq.opts[+b.dataset.o] === pq.right; if(ok) pq.score++; markMiss(picMissKey(), n, !ok);
    c.querySelectorAll(".opt").forEach(x => { x.disabled = true; if(pq.opts[+x.dataset.o] === pq.right) x.classList.add("right"); });
    if(!ok) b.classList.add("wrong");
    const fb = $("#pfb"); fb.className = "fb " + (ok ? "ok" : "no"); fb.textContent = (ok ? "Right. " : "Not quite. ") + `${w[0]}, ${w[1]}, ${w[2]}.`;
    c.querySelector("img").alt = `${w[0]}, ${w[1]}`; $("#p-after").hidden = false;
    $("#p-next").onclick = nextPic; $("#p-lesson").onclick = () => openWork(n);
  });
}
// timeline
const TL_ORDER = N100.slice().sort((a, b) => YEAR[a-1] - YEAR[b-1] || a - b);
const fmtYear = y => y < 0 ? `${-y} BCE` : y < 1000 ? `${y} CE` : String(y);
const fmtGap = g => `${(g >= 1000 ? Math.round(g / 100) * 100 : Math.round(g / 50) * 50).toLocaleString("en-US")} years`;
let tlDone = false;
function renderTimeline(){
  if(tlDone) return; let html = "", prev = null;
  TL_ORDER.forEach(n => { const y = YEAR[n-1], w = W[n-1];
    if(prev !== null && y - prev >= 150) html += `<li class="gap" aria-hidden="true"><span>${fmtGap(y - prev)} later</span></li>`; prev = y;
    html += `<li class="tl-i ${tierOf(n) === "must" ? "tm" : ""}"><span class="yr">${fmtYear(y)}</span><span class="tdot"></span>
      <button class="tl-b" data-w="${n}">${matImg(n, "flat")}<span class="t" style="min-width:0"><b>${esc(w[0])}</b><span class="s">${esc(short(w[1]))} · ${esc(w[2])}</span></span></button></li>`; });
  $("#tl").innerHTML = html; tlDone = true;
}

/* ================= key terms ================= */
const TERM_ORDER = N100.slice().sort((a, b) => CLASS[a-1][0].localeCompare(CLASS[b-1][0]));
let tq = null;
function startTerms(practice){
  const all = N100, qs = practice ? shuffle(missList("met-miss-terms")).slice(0, 10) : drawFromDeck("met-deck-terms", all, 10);
  if(!qs.length){ tq = null; renderTerms(); return; }
  tq = {qs, i: -1, score: 0, practice: !!practice}; nextTerm();
}
function nextTerm(){
  tq.i++; tq.answered = false;
  if(tq.i < tq.qs.length){ const n = tq.qs[tq.i], right = CLASS[n-1][0];
    const pool = shuffle([...new Set(N100.map(m => CLASS[m-1][0]).filter(t => t !== right))]);
    tq.opts = shuffle([right, ...pool.slice(0, 3)]); tq.right = right; }
  renderTerms();
}
function renderTerms(){
  const c = $("#tcard"), misses = missList("met-miss-terms").length, left = deckLeft("met-deck-terms", N100);
  const info = `<p class="small" style="margin:0">${left === 100 ? "All 100 terms are in the deck." : `${left} of 100 terms left before any repeat.`}${misses ? ` ${misses} to practice.` : ""}</p>`;
  const buttons = label => `<div class="${misses ? "row2" : "stack"}"><button class="btn" id="t-start">${label}</button>${misses ? `<button class="btn q" id="t-miss">Practice misses (${misses})</button>` : ""}</div>`;
  const wire = () => { $("#t-start").onclick = () => startTerms(false); const m = $("#t-miss"); if(m) m.onclick = () => startTerms(true); };
  if(!tq){ c.innerHTML = `<span class="eyebrow">Vocabulary</span><p class="q">One key term for every work: 100 words that open up the whole museum.</p>${info}${buttons("Quiz me")}`; wire(); }
  else if(tq.i >= tq.qs.length){ c.innerHTML = `<span class="eyebrow">${tq.practice ? "Practice done" : "Done"}</span><p class="q">${tq.score} of ${tq.qs.length} right.</p>${info}${buttons("Next round")}`; wire(); }
  else {
    const n = tq.qs[tq.i];
    c.innerHTML = `<span class="eyebrow">${tq.practice ? "Practice · " : ""}Term ${tq.i + 1} of ${tq.qs.length} · ${tq.score} right</span>
      <p class="serif" style="margin:0;font-size:19px;line-height:1.45">${esc(CLASS[n-1][1])}</p><p class="small" style="margin:0">Which term is this?</p>
      <div class="opts">${tq.opts.map((o, i) => `<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div>
      <p class="fb" id="tfb"></p><div class="row2" id="t-after" hidden><button class="btn q" id="t-lesson">See the work</button><button class="btn" id="t-next">${tq.i + 1 < tq.qs.length ? "Next" : "See score"}</button></div>`;
    c.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      if(tq.answered) return; tq.answered = true;
      const ok = tq.opts[+b.dataset.o] === tq.right; if(ok) tq.score++; markMiss("met-miss-terms", n, !ok);
      c.querySelectorAll(".opt").forEach(x => { x.disabled = true; if(tq.opts[+x.dataset.o] === tq.right) x.classList.add("right"); });
      if(!ok) b.classList.add("wrong");
      const fb = $("#tfb"); fb.className = "fb " + (ok ? "ok" : "no"); fb.textContent = (ok ? "Right. " : `It's “${tq.right}”. `) + `Example: ${W[n-1][0]}.`;
      $("#t-after").hidden = false; $("#t-next").onclick = nextTerm; $("#t-lesson").onclick = () => openWork(n);
    });
  }
  if(!$("#tlist").dataset.built){
    let html = "", letter = "";
    TERM_ORDER.forEach(n => { const t = CLASS[n-1][0], L0 = t[0].toUpperCase();
      if(L0 !== letter){ if(letter) html += `</div>`; letter = L0; html += `<div class="sec-h" style="margin:14px 2px 6px"><h2>${L0}</h2></div><div class="list">`; }
      html += `<button class="li" data-w="${n}" style="grid-template-columns:1fr auto"><span class="t"><b class="serif" style="font-size:16px">${esc(t)}</b><span class="s" style="white-space:normal">${esc(CLASS[n-1][1])}</span><span class="s" style="color:var(--accent)">${esc(W[n-1][0])}</span></span><span></span></button>`; });
    $("#tlist").innerHTML = html + `</div>`; $("#tlist").dataset.built = "1";
  }
}

/* ================= shared list sync ================= */
let syncState = "off", syncErr = "", lastSync = 0, syncT = null, syncing = false;
const syncOn = () => !!(cfg.url && cfg.code);
function queueSync(){ if(!syncOn()) return; clearTimeout(syncT); syncT = setTimeout(doSync, 1200); }
const KINDS = ["seen","fav","notes"];
function toRemote(st){ const o = {}; KINDS.forEach(k => { o[k] = {}; Object.keys(st[k] || {}).forEach(n => { o[k]["w" + n] = st[k][n]; }); }); return o; }
function fromRemote(r){ const o = {seen:{}, fav:{}, notes:{}}; if(!r) return o;
  KINDS.forEach(k => { const src = r[k] || {}; Object.keys(src).forEach(key => { const n = +key.replace(/^w/, ""); if(n >= 1 && n <= 100 && src[key]) o[k][n] = src[key]; }); }); return o; }
function mergeStores(a, b){ const o = {seen:{}, fav:{}, notes:{}};
  KINDS.forEach(k => { const A = a[k] || {}, B = b[k] || {};
    new Set([...Object.keys(A), ...Object.keys(B)]).forEach(n => { const x = A[n], y = B[n]; o[k][n] = !x ? y : !y ? x : ((y.t || 0) > (x.t || 0) ? y : x); }); });
  return o; }
const sig = st => KINDS.map(k => Object.keys(st[k] || {}).map(Number).sort((a, b) => a - b).map(n => `${n}:${st[k][n].t}:${JSON.stringify(st[k][n].v)}`).join(",")).join("|");
const dbBase = () => cfg.url.trim().replace(/\/+$/, "").replace(/\.json$/, "");
async function doSync(){
  if(!syncOn()){ syncState = "off"; updSync(); return; }
  if(syncing) return;
  if(navigator.onLine === false){ syncState = "offline"; updSync(); return; }
  syncing = true; syncState = "syncing"; updSync();
  const url = `${dbBase()}/households/${encodeURIComponent(cfg.code)}.json`;
  try {
    const r = await fetch(url, {cache: "no-store"});
    if(!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "The database refused access. Check its rules (step 4 of the setup)." : `The database answered ${r.status}.`);
    const remote = fromRemote(await r.json()), merged = mergeStores(store, remote);
    if(sig(merged) !== sig(remote)){
      const w = await fetch(url, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(toRemote(merged))});
      if(!w.ok) throw new Error(w.status === 401 || w.status === 403 ? "The database refused to save. Check its rules (step 4 of the setup)." : `Saving failed (${w.status}).`);
    }
    const changed = sig(merged) !== sig(store);
    store = merged; saveStore(); rebuild();
    if(changed){ refreshAll(); if(!$("#work").hidden && document.activeElement !== $("#w-note") && wList[wIdx]) showWork(wList[wIdx]); }
    syncState = "ok"; lastSync = Date.now(); syncErr = "";
  } catch(e){
    syncState = "error";
    syncErr = inFrame ? "Sharing works in the version on your website, not inside this preview." : (e && e.message && !/fetch/i.test(e.message) ? e.message : "Couldn't reach the database. Check the address and your connection.");
  }
  syncing = false; updSync();
}
setInterval(() => { if(!document.hidden) doSync(); }, 45000);
document.addEventListener("visibilitychange", () => { if(!document.hidden) doSync(); });
window.addEventListener("online", doSync);
function statusText(){
  if(syncState === "off") return ["", "Not set up. Your list stays on this phone."];
  if(syncState === "syncing") return ["syncing", "Syncing…"];
  if(syncState === "offline") return ["", "Offline. Changes will sync when you're back online."];
  if(syncState === "error") return ["error", syncErr];
  const mins = Math.round((Date.now() - lastSync) / 60000); return ["ok", `Synced ${mins < 1 ? "just now" : mins + " min ago"}`];
}
function updSync(){ const el = $("#set-status"); if(!el) return; const [c, t] = statusText(); el.className = "status " + c; el.innerHTML = `<i></i>${esc(t)}`; }
function newCode(){ const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; const r = new Uint32Array(12); crypto.getRandomValues(r); r.forEach((v, i) => { s += a[v % a.length]; if(i === 3 || i === 7) s += "-"; }); return s; }
const setupCode = () => `${dbBase()}#${cfg.code}`;
async function copyText(txt, el){
  try { await navigator.clipboard.writeText(txt); toast("Copied"); }
  catch(e){ if(el){ const rg = document.createRange(); rg.selectNodeContents(el); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(rg); } toast("Select the text and copy it"); }
}
function openSettings(){ renderSettings(); openPage("settings"); $("#settings").scrollTop = 0; }
function renderSettings(){
  const favs = Object.keys(store.fav).filter(k => store.fav[k].v).length, notes = Object.keys(store.notes).filter(k => store.notes[k].v).length;
  $("#settings").innerHTML = `<div class="bar"><button class="round" id="set-close" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>Settings and sharing</b><span style="width:42px"></span></div>
    <div class="body">
    <div class="card"><span class="eyebrow" id="set-app-l">Appearance</span>
      <div class="seg" id="set-theme" role="group" aria-labelledby="set-app-l">
        <button data-t="light" aria-pressed="${theme === "light"}">Gallery</button><button data-t="dark" aria-pressed="${theme === "dark"}">Dark</button><button data-t="system" aria-pressed="${theme === "system"}">Match phone</button></div>
      <p class="small" style="margin:0">Gallery is the light look the app was designed in. Dark is easier on the eyes in dim rooms like the Asian and prints galleries. Saved on this phone.</p></div>
    <div class="card"><label class="eyebrow" for="set-name">Your name</label>
      <input class="field" id="set-name" value="${esc(cfg.name)}" placeholder="Your first name" autocomplete="given-name">
      <p class="small" style="margin:0">Shown on works you mark as seen, so the other person knows who saw what.</p></div>
    <div class="card"><span class="eyebrow">Shared list</span><span class="status" id="set-status"></span>
      <p style="margin:0">Share seen works, favorites and notes between your phones. Routes and quiz progress stay on each phone.</p>
      <label class="eyebrow" for="set-url">Database address</label>
      <input class="field" id="set-url" value="${esc(cfg.url)}" placeholder="https://your-project-default-rtdb.firebaseio.com" inputmode="url" autocapitalize="off" spellcheck="false">
      <label class="eyebrow" for="set-code">Household code</label>
      <div class="fieldrow"><input class="field" id="set-code" value="${esc(cfg.code)}" placeholder="Tap New" autocapitalize="characters" spellcheck="false"><button class="btn q" id="set-new">New</button></div>
      <div class="row2"><button class="btn" id="set-save">Save and sync</button><button class="btn q" id="set-sync">Sync now</button></div>
      ${syncOn() ? `<span class="eyebrow" style="margin-top:6px">Set up the other phone</span>
        <p class="small" style="margin:0">On the other phone, open Settings and paste this into "Paste a setup code".</p>
        <div class="code" id="set-codeout">${esc(setupCode())}</div><button class="btn q" id="set-copy">Copy setup code</button>` : ""}
      <label class="eyebrow" for="set-paste" style="margin-top:6px">Paste a setup code</label>
      <div class="fieldrow"><input class="field" id="set-paste" placeholder="https://…#XXXX-XXXX-XXXX" autocapitalize="off" spellcheck="false"><button class="btn q" id="set-apply">Use</button></div></div>
    <details class="more"><summary>How to set up sharing (once, about 10 minutes)</summary>
      <ol class="steps">
        <li>On a computer, go to console.firebase.google.com and sign in with a Google account. Click <b>Create a project</b>, name it (for example met-compass) and finish the steps. Analytics can stay off.</li>
        <li>In the left menu open <b>Build</b>, then <b>Realtime Database</b>, then <b>Create database</b>. Pick the United States location and start in <b>locked mode</b>.</li>
        <li>Copy the database address shown at the top of the Data tab. It looks like https://met-compass-default-rtdb.firebaseio.com.</li>
        <li>Open the <b>Rules</b> tab, replace everything with the rules below, and click <b>Publish</b>.</li></ol>
      <div class="code" id="set-rules">{ "rules": { ".read": false, ".write": false, "households": { "$code": { ".read": "$code.length >= 12", ".write": "$code.length >= 12" } } } }</div>
      <button class="btn q" id="set-copyrules" style="margin-top:8px;width:100%">Copy the rules</button>
      <ol class="steps" start="5"><li>Back here, paste the address, tap <b>New</b> for a household code, then <b>Save and sync</b>.</li>
        <li>Copy the setup code and send it to the other phone. They paste it under "Paste a setup code".</li></ol>
      <p class="small">Anyone with both the address and the code can see and change the list, so share the setup code only with each other.</p></details>
    <div class="card"><span class="eyebrow">On this phone</span>
      <p style="margin:0">${seen.size} seen · ${favs} ${favs === 1 ? "favorite" : "favorites"} · ${notes} ${notes === 1 ? "note" : "notes"} · ${plan.length} on your route</p>
      <p class="small" style="margin:0">Everything is saved on the phone too, so the app works offline.</p></div>
    <p class="small">App version ${APP_VERSION}. An unofficial study guide, not made by the Met. Images: The Met Open Access, plus seven from Wikipedia and Wikimedia Commons, credited on each work. The plan is a simplified drawing; works move between rooms.</p>
    </div>`;
  updSync();
  $("#set-close").onclick = () => closePage("settings");
  $("#set-theme").onclick = e => { const b = e.target.closest("[data-t]"); if(!b) return; setTheme(b.dataset.t);
    $("#set-theme").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.t === theme))); };
  $("#set-name").addEventListener("change", e => { cfg.name = e.target.value.trim(); saveCfg(); });
  $("#set-new").onclick = () => { $("#set-code").value = newCode(); };
  $("#set-save").onclick = () => {
    cfg.name = $("#set-name").value.trim(); cfg.url = $("#set-url").value.trim(); cfg.code = $("#set-code").value.trim().toUpperCase();
    if(cfg.url && !/^https:\/\/[^\s]+$/.test(cfg.url)){ toast("The address should start with https://"); return; }
    if(cfg.code && cfg.code.replace(/-/g, "").length < 10){ toast("Use a longer code. Tap New for one."); return; }
    saveCfg(); renderSettings(); doSync(); };
  $("#set-sync").onclick = doSync;
  $("#set-apply").onclick = () => { const v = $("#set-paste").value.trim(), i = v.lastIndexOf("#");
    if(i < 8){ toast("That doesn't look like a setup code"); return; }
    cfg.url = v.slice(0, i); cfg.code = v.slice(i + 1).toUpperCase(); cfg.name = $("#set-name").value.trim() || cfg.name; saveCfg(); renderSettings(); doSync(); };
  const cp = $("#set-copy"); if(cp) cp.onclick = () => copyText(setupCode(), $("#set-codeout"));
  $("#set-copyrules").onclick = () => copyText($("#set-rules").textContent, $("#set-rules"));
}

/* ================= tabs ================= */
let view = "today";
function setView(v){
  view = v;
  $("#v-today").hidden = v !== "today"; $("#v-coll").hidden = v !== "coll"; $("#v-learn").hidden = v !== "learn";
  $("#views").hidden = v === "map"; $("#v-map").hidden = v !== "map";
  document.querySelectorAll(".tabbar [data-v]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.v === v)));
  if(v === "today") renderToday(); if(v === "map"){ renderMapView(); placeSheet(sheetSt, false); } if(v === "coll") renderColl(); if(v === "learn") renderLearn();
  window.scrollTo({top: 0});
}
function refreshAll(){ if(view === "today") renderToday(); if(view === "map") renderMapView(); if(view === "coll") renderColl(); if(!$("#routepg").hidden) renderRoutePage(); }
document.querySelector(".tabbar").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if(!b) return; while(pageStack.length) closePage(pageStack[pageStack.length - 1]); if(b.dataset.v === "map" && view !== "map"){ selZone = null; focus = null; pinWork = null; } setView(b.dataset.v); });
window.addEventListener("resize", () => { if(view === "map"){ sizeSheet(); placeSheet(sheetSt, false); } });

if(here !== null){ const p = herePos(); if(p) mapFloor = fshort(p.f); }
setView("today"); doSync();

if("serviceWorker" in navigator && !inFrame && location.protocol === "https:"){
  const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if(!hadController || reloaded) return; reloaded = true;
    const busy = pageStack.length || (quiz && !quiz.done) || (pq && pq.i < pq.qs.length);
    if(busy) toast("A new version is ready", "Update", () => location.reload()); else location.reload();
  });
  navigator.serviceWorker.register("sw.js", {updateViaCache: "none"}).then(reg => {
    const check = () => { if(!document.hidden) reg.update().catch(() => {}); };
    document.addEventListener("visibilitychange", check); setInterval(check, 30 * 60 * 1000);
  }).catch(() => {});
}

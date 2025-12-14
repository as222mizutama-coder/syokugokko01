// ======================
//  サンプル栄養データ
//  kcal / P / F / C / 食物繊維 / 食塩相当量
// ======================
const DATA = [
  // 主食
  { id:"rice_150", name:"ごはん（150g）", cat:"主食", kcal:252, p:3.8, f:0.5, c:55.7, fib:0.5, salt:0.0 },
  { id:"rice_200", name:"ごはん（200g）", cat:"主食", kcal:336, p:5.1, f:0.7, c:74.3, fib:0.7, salt:0.0 },
  { id:"bread_2", name:"食パン（2枚）", cat:"主食", kcal:310, p:9.5, f:4.8, c:56.8, fib:2.6, salt:1.3 },
  { id:"udon", name:"かけうどん（小）", cat:"主食", kcal:290, p:9.0, f:2.0, c:58.0, fib:2.5, salt:2.3 },
  { id:"onigiri", name:"おにぎり（鮭）", cat:"主食", kcal:190, p:4.2, f:1.2, c:40.0, fib:0.7, salt:1.1 },

  // 主菜
  { id:"chicken", name:"鶏の照り焼き", cat:"主菜", kcal:260, p:22.0, f:14.0, c:10.0, fib:0.3, salt:2.0 },
  { id:"salmon", name:"焼き鮭", cat:"主菜", kcal:220, p:22.5, f:13.0, c:0.0, fib:0.0, salt:1.2 },
  { id:"hamburg", name:"ハンバーグ", cat:"主菜", kcal:320, p:18.0, f:22.0, c:12.0, fib:0.8, salt:1.6 },
  { id:"tofu", name:"冷奴（しょうゆ少）", cat:"主菜", kcal:120, p:10.0, f:7.0, c:3.0, fib:1.0, salt:0.7 },
  { id:"egg", name:"卵焼き（2切）", cat:"主菜", kcal:140, p:8.0, f:10.0, c:4.0, fib:0.0, salt:0.7 },

  // 副菜
  { id:"salad", name:"サラダ（ドレ少）", cat:"副菜", kcal:80, p:2.0, f:4.0, c:9.0, fib:3.0, salt:0.5 },
  { id:"miso", name:"味噌汁", cat:"副菜", kcal:60, p:3.0, f:2.0, c:6.0, fib:1.2, salt:1.3 },
  { id:"kinpira", name:"きんぴらごぼう", cat:"副菜", kcal:110, p:2.0, f:6.0, c:12.0, fib:3.2, salt:0.9 },
  { id:"spinach", name:"ほうれん草のおひたし", cat:"副菜", kcal:45, p:3.0, f:0.6, c:6.0, fib:2.5, salt:0.6 },
  { id:"nimono", name:"ひじき煮", cat:"副菜", kcal:90, p:3.5, f:3.0, c:12.0, fib:4.0, salt:1.0 },

  // その他（おやつ等）
  { id:"yogurt", name:"ヨーグルト（無糖）", cat:"その他", kcal:90, p:7.0, f:3.0, c:9.0, fib:0.0, salt:0.1 },
  { id:"banana", name:"バナナ（1本）", cat:"その他", kcal:95, p:1.1, f:0.3, c:22.0, fib:1.1, salt:0.0 },
  { id:"coffee", name:"カフェラテ（無糖）", cat:"その他", kcal:70, p:4.0, f:3.0, c:7.0, fib:0.0, salt:0.1 },
  { id:"pudding", name:"プリン", cat:"その他", kcal:160, p:4.0, f:6.0, c:22.0, fib:0.0, salt:0.2 },
  { id:"orange", name:"みかん（1個）", cat:"その他", kcal:45, p:0.7, f:0.1, c:11.0, fib:1.0, salt:0.0 }
];

// 目標（1食あたりの目安：好きに変更OK）
const GOAL = {
  kcal: 650,
  p: 20,
  f: 20,
  c: 90,
  fib: 7,
  salt: 2.5
};

const state = {
  selectedTray: "staple", // クリック配置の行き先
  trays: {
    staple: null,
    main: null,
    side: null
  },
  activeCat: "すべて",
  listView: false,
  keyword: ""
};

const els = {
  totalKcal: document.getElementById("totalKcal"),
  totalP: document.getElementById("totalP"),
  totalF: document.getElementById("totalF"),
  totalC: document.getElementById("totalC"),
  totalFib: document.getElementById("totalFib"),
  totalSalt: document.getElementById("totalSalt"),
  bars: document.getElementById("bars"),
  menu: document.getElementById("menu"),
  menuList: document.getElementById("menuList"),
  tabs: document.getElementById("tabs"),
  toggleView: document.getElementById("toggleView"),
  search: document.getElementById("search"),
  resetAll: document.getElementById("resetAll"),
  goalKcal: document.getElementById("goalKcal"),
};

els.goalKcal.textContent = GOAL.kcal.toString();

// ----------- UI 部品 -----------
function fmt1(n){ return (Math.round(n * 10) / 10).toFixed(1); }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function makeBar({key,label,unit,goal,getValue}){
  const wrap = document.createElement("div");
  wrap.className = "bar";

  const top = document.createElement("div");
  top.className = "barTop";

  const name = document.createElement("div");
  name.className = "barName";
  name.textContent = label;

  const val = document.createElement("div");
  val.className = "barVal";
  val.innerHTML = `<b id="bar_${key}">0</b> ${unit} / 目標 ${goal}${unit}`;

  const track = document.createElement("div");
  track.className = "track";
  const fill = document.createElement("div");
  fill.className = "fill";
  fill.id = `fill_${key}`;
  track.appendChild(fill);

  top.appendChild(name);
  top.appendChild(val);
  wrap.appendChild(top);
  wrap.appendChild(track);

  wrap._getValue = getValue;
  wrap._goal = goal;
  wrap._key = key;

  return wrap;
}

// ----------- 初期描画 -----------
function init(){
  // バー生成
  const barDefs = [
    { key:"kcal", label:"熱量", unit:"kcal", goal:GOAL.kcal, getValue: t => t.kcal },
    { key:"p", label:"たんぱく質", unit:"g", goal:GOAL.p, getValue: t => t.p },
    { key:"f", label:"脂質", unit:"g", goal:GOAL.f, getValue: t => t.f },
    { key:"c", label:"炭水化物", unit:"g", goal:GOAL.c, getValue: t => t.c },
    { key:"fib", label:"食物繊維", unit:"g", goal:GOAL.fib, getValue: t => t.fib },
    { key:"salt", label:"食塩相当量", unit:"g", goal:GOAL.salt, getValue: t => t.salt },
  ];
  els.bars.innerHTML = "";
  barDefs.forEach(d => els.bars.appendChild(makeBar(d)));

  // タブ生成
  const cats = ["すべて", "主食", "主菜", "副菜", "その他"];
  els.tabs.innerHTML = "";
  cats.forEach(cat=>{
    const b = document.createElement("button");
    b.className = "tab" + (cat===state.activeCat ? " is-active":"");
    b.textContent = cat;
    b.addEventListener("click", ()=>{
      state.activeCat = cat;
      [...els.tabs.querySelectorAll(".tab")].forEach(x=>x.classList.remove("is-active"));
      b.classList.add("is-active");
      renderMenu();
    });
    els.tabs.appendChild(b);
  });

  // トレイのDnD
  document.querySelectorAll(".tray").forEach(tray=>{
    tray.addEventListener("dragover", (e)=>{ e.preventDefault(); });
    tray.addEventListener("drop", (e)=>{
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      placeItem(tray.dataset.tray, id);
    });
  });

  // トレイ選択
  document.querySelectorAll("[data-select]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.selectedTray = btn.dataset.select;
      flashSelectedTray();
    });
  });

  // トレイリセット
  document.querySelectorAll("[data-reset]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.trays[btn.dataset.reset] = null;
      renderTrays();
      updateTotals();
    });
  });

  // 全部リセット
  els.resetAll.addEventListener("click", ()=>{
    state.trays.staple = null;
    state.trays.main = null;
    state.trays.side = null;
    renderTrays();
    updateTotals();
  });

  // 表示切替
  els.toggleView.addEventListener("click", ()=>{
    state.listView = !state.listView;
    els.toggleView.textContent = state.listView ? "グリッド表示" : "リスト表示";
    renderMenu();
  });

  // 検索
  els.search.addEventListener("input", ()=>{
    state.keyword = els.search.value.trim();
    renderMenu();
  });

  renderTrays();
  renderMenu();
  updateTotals();
  flashSelectedTray();
}

function flashSelectedTray(){
  document.querySelectorAll(".tray").forEach(t=>{
    t.style.outline = "none";
    t.style.boxShadow = "inset 0 0 0 3px rgba(255,255,255,.25)";
  });
  const t = document.querySelector(`.tray[data-tray="${state.selectedTray}"]`);
  if(t){
    t.style.outline = "3px solid rgba(43,108,255,.55)";
    t.style.boxShadow = "inset 0 0 0 3px rgba(255,255,255,.25), 0 0 0 6px rgba(43,108,255,.10)";
  }
}

// ----------- メニュー描画 -----------
function filteredData(){
  const kw = state.keyword.toLowerCase();
  return DATA.filter(d=>{
    const okCat = state.activeCat === "すべて" ? true : d.cat === state.activeCat;
    const okKw = !kw ? true : d.name.toLowerCase().includes(kw);
    return okCat && okKw;
  });
}

function renderMenu(){
  const items = filteredData();

  if(!state.listView){
    els.menu.classList.remove("hidden");
    els.menuList.classList.add("hidden");
    els.menu.innerHTML = "";
    items.forEach(item=>{
      const card = document.createElement("div");
      card.className = "card";
      card.draggable = true;
      card.addEventListener("dragstart", (e)=>{
        e.dataTransfer.setData("text/plain", item.id);
      });
      card.addEventListener("click", ()=>{
        // クリック配置：選択中のトレイへ
        placeItem(state.selectedTray, item.id);
      });

      card.innerHTML = `
        <div class="cardTop">
          <div class="cardName">${item.name}</div>
          <div class="cardKcal">${Math.round(item.kcal)}kcal</div>
        </div>
        <div class="cardMeta">
          <span class="pill">${item.cat}</span>
          <span>P ${fmt1(item.p)}g</span>
          <span>F ${fmt1(item.f)}g</span>
          <span>C ${fmt1(item.c)}g</span>
        </div>
      `;
      els.menu.appendChild(card);
    });
  }else{
    els.menu.classList.add("hidden");
    els.menuList.classList.remove("hidden");
    els.menuList.innerHTML = "";
    items.forEach(item=>{
      const row = document.createElement("div");
      row.className = "row";
      row.addEventListener("click", ()=> placeItem(state.selectedTray, item.id));
      row.innerHTML = `
        <div>
          <b>${item.name}</b>
          <div><span>${item.cat} / P${fmt1(item.p)}g F${fmt1(item.f)}g C${fmt1(item.c)}g</span></div>
        </div>
        <div><b style="color:#ff7a00">${Math.round(item.kcal)}kcal</b></div>
      `;
      els.menuList.appendChild(row);
    });
  }
}

// ----------- トレイ描画 -----------
function renderTrays(){
  document.querySelectorAll(".tray").forEach(tray=>{
    const slot = tray.dataset.tray;
    const itemId = state.trays[slot];
    tray.innerHTML = ""; // clear
    if(!itemId){
      const empty = document.createElement("div");
      empty.className = "tray__empty";
      empty.textContent = "ここに置く";
      tray.appendChild(empty);
      return;
    }

    const item = DATA.find(d=>d.id===itemId);
    const placed = document.createElement("div");
    placed.className = "placed";
    placed.innerHTML = `
      <div class="placedHead">
        <div>
          <div class="placedName">${item.name}</div>
          <div class="placedMeta">${item.cat} / ${Math.round(item.kcal)}kcal</div>
        </div>
        <button class="xbtn" title="取り除く">×</button>
      </div>
      <div class="placedMeta">
        P ${fmt1(item.p)}g / F ${fmt1(item.f)}g / C ${fmt1(item.c)}g<br/>
        食物繊維 ${fmt1(item.fib)}g / 食塩 ${fmt1(item.salt)}g
      </div>
    `;
    placed.querySelector(".xbtn").addEventListener("click", ()=>{
      state.trays[slot] = null;
      renderTrays();
      updateTotals();
    });

    tray.appendChild(placed);
  });
}

// ----------- 配置処理 -----------
function placeItem(trayKey, itemId){
  if(!state.trays.hasOwnProperty(trayKey)) return;
  state.trays[trayKey] = itemId;
  renderTrays();
  updateTotals();
}

// ----------- 合計計算 & 表示 -----------
function totals(){
  const ids = Object.values(state.trays).filter(Boolean);
  const t = {kcal:0,p:0,f:0,c:0,fib:0,salt:0};
  ids.forEach(id=>{
    const d = DATA.find(x=>x.id===id);
    if(!d) return;
    t.kcal += d.kcal;
    t.p += d.p;
    t.f += d.f;
    t.c += d.c;
    t.fib += d.fib;
    t.salt += d.salt;
  });
  return t;
}

function updateTotals(){
  const t = totals();

  els.totalKcal.textContent = Math.round(t.kcal).toString();
  els.totalP.textContent = fmt1(t.p);
  els.totalF.textContent = fmt1(t.f);
  els.totalC.textContent = fmt1(t.c);
  els.totalFib.textContent = fmt1(t.fib);
  els.totalSalt.textContent = fmt1(t.salt);

  // バー更新
  [...els.bars.querySelectorAll(".bar")].forEach(bar=>{
    const key = bar._key;
    const val = bar._getValue(t);
    const goal = bar._goal;

    const label = bar.querySelector(`#bar_${key}`);
    if(label){
      label.textContent = (key==="kcal") ? Math.round(val).toString() : fmt1(val);
    }
    const pct = goal === 0 ? 0 : clamp((val/goal)*100, 0, 180); // 180%まで表示
    const fill = bar.querySelector(`#fill_${key}`);
    if(fill){
      fill.style.width = pct + "%";
      // 目標超えたら見た目ちょい変更（色はCSSのまま、明度だけ）
      fill.style.filter = (val > goal) ? "brightness(.9) saturate(1.2)" : "none";
    }
  });
}

init();


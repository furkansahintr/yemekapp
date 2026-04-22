/* ═══════════════════════════════════════════════════════════
   KEŞFET / ARAMA EKRANI + MALZEME İLE ARA
   - Boş durumda: geçmiş, trendler, hızlı filtreler, malzeme tile
   - Query yazıldığında: tarif + restoran sonuç listesi
   - Malzeme sheet'i: temel malzemeler + akıllı öneri + sonuçlar
   ═══════════════════════════════════════════════════════════ */

var _srch = {
  query: '',
  activeFilter: null,      // id of quick filter or null
  activeCategory: 'Tümü',  // not shown in UI shortcut list anymore, reserved
  ingredients: [],         // seçili malzeme isimleri (normalize edilmiş)
  results: null,           // { items: [{idx, source, matchPct?, missing?}...], mode: 'query'|'filter'|'ing' }
  historyMax: 10
};

/* ── Trend aramalar (demo popüler kelimeler) ── */
var _SRCH_TRENDS = [
  { label: 'Truffle Burger',  icon: 'solar:cup-hot-bold',     color: '#EF4444' },
  { label: 'Margherita Pizza',icon: 'solar:dish-bold',        color: '#F97316' },
  { label: 'Adana Kebap',     icon: 'solar:fire-bold',        color: '#EAB308' },
  { label: 'Cheesecake',      icon: 'solar:cake-bold',        color: '#EC4899' },
  { label: 'Karnıyarık',      icon: 'solar:chef-hat-bold',    color: '#8B5CF6' },
  { label: 'Çiğ Köfte',       icon: 'solar:leaf-bold',        color: '#22C55E' }
];

/* ── Hızlı filtreler (match kuralı fn ile) ── */
var _SRCH_QUICK_FILTERS = [
  { id: 'u30',    label: '< 30 dk',    icon: 'solar:clock-circle-bold', color: '#3B82F6', match: function(item){ return _srchMinutes(item.prepTime) + _srchMinutes(item.cookTime) < 30; } },
  { id: 'pratik', label: 'Pratik',     icon: 'solar:bolt-bold',         color: '#F59E0B', match: function(item){ return (item.difficulty || '').toLowerCase() === 'kolay'; } },
  { id: 'vegan',  label: 'Vegan',      icon: 'solar:leaf-bold',         color: '#22C55E', match: function(item){ return _srchIsVegan(item); } },
  { id: 'glutenfree', label: 'Glutensiz', icon: 'solar:wheat-bold',     color: '#A855F7', match: function(item){ return !(item.allergens || []).map(String).map(function(a){return a.toLowerCase();}).some(function(a){ return a === 'gluten'; }); } },
  { id: 'tatlı',  label: 'Tatlı',      icon: 'solar:cake-bold',         color: '#EC4899', match: function(item){ return /tatl|dessert|cheesecake|sütlaç|baklava/i.test(item.category + ' ' + item.name); } },
  { id: 'high-protein', label: 'Protein+', icon: 'solar:dumbbells-bold', color: '#06B6D4', match: function(item){ return (item.nutrition && item.nutrition.protein >= 25); } }
];

/* ── Temel malzemeler (Her evde bulunan) ── */
var _SRCH_BASE_INGREDIENTS = [
  { key: 'yumurta', label: 'Yumurta',   icon: 'solar:egg-bold',          color: '#F59E0B' },
  { key: 'un',      label: 'Un',        icon: 'solar:wheat-bold',        color: '#A3A3A3' },
  { key: 'sogan',   label: 'Soğan',     icon: 'solar:leaf-bold',         color: '#B45309' },
  { key: 'patates', label: 'Patates',   icon: 'solar:carrot-bold',       color: '#CA8A04' },
  { key: 'domates', label: 'Domates',   icon: 'solar:dish-bold',         color: '#DC2626' },
  { key: 'sut',     label: 'Süt',       icon: 'solar:glass-water-bold',  color: '#E5E7EB' },
  { key: 'tereyagi',label: 'Tereyağı',  icon: 'solar:cup-hot-bold',      color: '#FACC15' },
  { key: 'peynir',  label: 'Peynir',    icon: 'solar:dish-bold',         color: '#FDE68A' },
  { key: 'pirinc',  label: 'Pirinç',    icon: 'solar:dish-bold',         color: '#FAFAF9' },
  { key: 'tavuk',   label: 'Tavuk',     icon: 'solar:fire-bold',         color: '#EF4444' },
  { key: 'kiyma',   label: 'Kıyma',     icon: 'solar:chef-hat-bold',     color: '#7F1D1D' },
  { key: 'biber',   label: 'Biber',     icon: 'solar:leaf-bold',         color: '#16A34A' },
  { key: 'sarimsak',label: 'Sarımsak',  icon: 'solar:leaf-bold',         color: '#D1D5DB' },
  { key: 'zeytinyag', label: 'Zeytinyağı', icon: 'solar:glass-water-bold', color: '#84CC16' },
  { key: 'limon',   label: 'Limon',     icon: 'solar:leaf-bold',         color: '#FACC15' },
  { key: 'maya',    label: 'Maya',      icon: 'solar:cup-hot-bold',      color: '#F97316' }
];

/* Co-ingredient öneri kuralları — temel malzeme → genelde birlikte kullanılan */
var _SRCH_COOCCUR = {
  un: ['maya','sut','yumurta','tereyagi'],
  yumurta: ['un','sut','peynir'],
  sogan: ['domates','biber','kiyma','sarimsak'],
  domates: ['sogan','biber','zeytinyag','sarimsak'],
  patates: ['sogan','biber','tereyagi'],
  sut: ['un','yumurta','tereyagi'],
  tereyagi: ['un','sut','sarimsak'],
  peynir: ['yumurta','un','tereyagi'],
  pirinc: ['sogan','tereyagi','domates'],
  tavuk: ['sogan','biber','sarimsak','limon'],
  kiyma: ['sogan','biber','sarimsak','domates'],
  biber: ['sogan','domates','sarimsak'],
  sarimsak: ['sogan','domates','zeytinyag'],
  zeytinyag: ['sarimsak','limon','biber'],
  limon: ['zeytinyag','sarimsak','tavuk'],
  maya: ['un','sut','tereyagi']
};

/* ═══════════════════ RENDER — Boş Durum ═══════════════════ */

function srchInitSearchScreen() {
  var input = document.getElementById('srchInput');
  if (!input) return;
  if (!input._srchBound) {
    input.addEventListener('input', function(){ srchOnQuery(input.value); });
    input._srchBound = true;
  }
  srchRenderHistory();
  srchRenderTrends();
  srchRenderQuickFilters();
}

function srchRenderHistory() {
  var sec = document.getElementById('srchHistorySec');
  if (!sec) return;
  var list = _srchLoadHistory();
  if (!list.length) { sec.innerHTML = ''; return; }
  var html = '<div style="padding:14px var(--app-px) 6px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    +   '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Önceki Aramalar</div>'
    +   '<div onclick="srchClearHistory()" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-secondary);cursor:pointer">'
    +     '<iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:12px"></iconify-icon>'
    +     '<span style="font:var(--fw-medium) 11px/1 var(--font)">Geçmişi Temizle</span>'
    +   '</div>'
    + '</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  list.forEach(function(q){
    html += '<div onclick="srchApplyHistory(\'' + _srchAttr(q) + '\')" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-primary);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer">'
      + '<iconify-icon icon="solar:history-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>' + _srchEsc(q)
      + '</div>';
  });
  html += '</div></div>';
  sec.innerHTML = html;
}

function srchRenderTrends() {
  var el = document.getElementById('srchTrendList');
  if (!el) return;
  el.innerHTML = _SRCH_TRENDS.map(function(t, i){
    return '<div onclick="srchApplyQuery(\'' + _srchAttr(t.label) + '\')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:var(--r-full);background:' + t.color + '14;border:1px solid ' + t.color + '33;color:' + t.color + ';font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer">'
      + '<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:' + t.color + ';color:#fff;font:var(--fw-bold) 10px/1 var(--font)">' + (i + 1) + '</span>'
      + '<iconify-icon icon="' + t.icon + '" style="font-size:13px"></iconify-icon>'
      + _srchEsc(t.label)
      + '</div>';
  }).join('');
}

function srchRenderQuickFilters() {
  var el = document.getElementById('srchQuickFilters');
  if (!el) return;
  el.innerHTML = _SRCH_QUICK_FILTERS.map(function(f){
    var active = _srch.activeFilter === f.id;
    var bg = active ? f.color : 'var(--bg-page)';
    var border = active ? f.color : 'var(--border-subtle)';
    var color = active ? '#fff' : 'var(--text-primary)';
    return '<div onclick="srchToggleFilter(\'' + f.id + '\')" style="flex-shrink:0;display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border:1px solid ' + border + ';background:' + bg + ';color:' + color + ';border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;white-space:nowrap;box-shadow:var(--shadow-sm)">'
      + '<iconify-icon icon="' + f.icon + '" style="font-size:14px"></iconify-icon>' + f.label
      + '</div>';
  }).join('');
}

/* ═══════════════════ QUERY HANDLING ═══════════════════ */

function srchOnQuery(v) {
  _srch.query = (v || '').trim();
  var clearIco = document.getElementById('srchClearIco');
  if (clearIco) clearIco.style.display = _srch.query ? 'block' : 'none';
  if (_srch.query.length) {
    srchRunQuery();
  } else if (_srch.activeFilter) {
    srchRunFilter();
  } else {
    _srchShowIdle();
  }
}

function srchClearQuery() {
  var input = document.getElementById('srchInput');
  if (input) input.value = '';
  srchOnQuery('');
}

function srchApplyQuery(q) {
  var input = document.getElementById('srchInput');
  if (input) input.value = q;
  _srchSaveHistory(q);
  srchOnQuery(q);
}

function srchApplyHistory(q) { srchApplyQuery(q); }

function srchToggleFilter(id) {
  _srch.activeFilter = (_srch.activeFilter === id) ? null : id;
  srchRenderQuickFilters();
  if (_srch.activeFilter) srchRunFilter();
  else if (_srch.query) srchRunQuery();
  else _srchShowIdle();
}

function srchRunQuery() {
  var q = _srchNorm(_srch.query);
  if (!q) return _srchShowIdle();
  var items = [];
  if (typeof menuItems !== 'undefined') menuItems.forEach(function(it, i){ if (_srchMatchText(it, q)) items.push({ idx: i, source: 'menu', item: it }); });
  if (typeof restaurantItems !== 'undefined') restaurantItems.forEach(function(it, i){ if (_srchMatchText(it, q)) items.push({ idx: i, source: 'restoran', item: it }); });
  _srch.results = { items: items, mode: 'query', title: 'Arama: “' + _srch.query + '”' };
  _srchRenderResults();
  _srchSaveHistory(_srch.query);
}

function srchRunFilter() {
  var f = _SRCH_QUICK_FILTERS.find(function(x){ return x.id === _srch.activeFilter; });
  if (!f) return _srchShowIdle();
  var items = [];
  (typeof menuItems !== 'undefined' ? menuItems : []).forEach(function(it, i){ if (f.match(it)) items.push({ idx: i, source: 'menu', item: it }); });
  _srch.results = { items: items, mode: 'filter', title: f.label + ' filtresi' };
  _srchRenderResults();
}

function _srchShowIdle() {
  var wrap = document.getElementById('srchIdleWrap');
  var res = document.getElementById('srchResults');
  if (wrap) wrap.style.display = '';
  if (res) { res.style.display = 'none'; res.innerHTML = ''; }
}

function _srchRenderResults() {
  var wrap = document.getElementById('srchIdleWrap');
  var res = document.getElementById('srchResults');
  if (wrap) wrap.style.display = 'none';
  if (!res) return;
  res.style.display = '';
  var items = (_srch.results && _srch.results.items) || [];
  var title = (_srch.results && _srch.results.title) || 'Sonuçlar';
  var html = '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 12px">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + _srchEsc(title) + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + items.length + ' sonuç</div>'
    + '</div>';
  if (!items.length) {
    html += '<div style="padding:48px 16px;text-align:center;color:var(--text-muted)">'
      + '<iconify-icon icon="solar:magnifer-linear" style="font-size:40px;display:block;margin:0 auto 10px;opacity:.4"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1.4 var(--font)">Eşleşen tarif bulunamadı</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);margin-top:4px">Farklı bir kelime veya filtre deneyebilirsiniz</div>'
      + '</div>';
    res.innerHTML = html;
    return;
  }
  html += '<div style="display:flex;flex-direction:column;gap:10px">';
  items.forEach(function(r){
    html += _srchResultRowHtml(r);
  });
  html += '</div>';
  res.innerHTML = html;
}

function _srchResultRowHtml(r) {
  var it = r.item;
  var badgeHtml = '';
  if (r.matchPct != null) {
    var color = r.matchPct >= 80 ? '#22C55E' : r.matchPct >= 50 ? '#F59E0B' : '#94A3B8';
    var text = r.missing === 0
      ? 'Tüm malzemeler var'
      : r.missing === 1
        ? 'Sadece 1 eksik malzeme'
        : 'Malzemelerinin %' + r.matchPct + '’i mevcut';
    badgeHtml = '<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);background:' + color + '18;color:' + color + ';font:var(--fw-bold) 10px/1.2 var(--font);margin-top:6px">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:11px"></iconify-icon>' + text + '</div>';
  }
  return '<div onclick="showDetail(' + r.idx + ',\'' + r.source + '\')" '
    +    'style="display:flex;gap:12px;padding:10px;background:var(--bg-page);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);cursor:pointer">'
    + '<div style="width:72px;height:72px;border-radius:var(--r-lg);overflow:hidden;flex-shrink:0;background:var(--bg-btn)">'
    +   (it.img ? '<img src="' + it.img + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '')
    + '</div>'
    + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">'
    +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _srchEsc(it.name) + '</div>'
    +   '<div style="display:flex;align-items:center;gap:6px;margin-top:4px;font:var(--fw-regular) 11.5px/1 var(--font);color:var(--text-muted);flex-wrap:wrap">'
    +     (it.category ? '<span>' + _srchEsc(it.category) + '</span>' : '')
    +     (it.rating ? '<span>· <iconify-icon icon="solar:star-bold" style="font-size:11px;color:#F59E0B;vertical-align:-1px"></iconify-icon> ' + it.rating + '</span>' : '')
    +     (it.prepTime ? '<span>· <iconify-icon icon="solar:clock-circle-linear" style="font-size:11px;vertical-align:-1px"></iconify-icon> ' + it.prepTime + '</span>' : '')
    +   '</div>'
    +   badgeHtml
    + '</div>'
    + '</div>';
}

/* ═══════════════════ HISTORY ═══════════════════ */

function _srchHistoryKey() { return 'yemekapp_srch_history_v1'; }
function _srchLoadHistory() {
  try { return JSON.parse(localStorage.getItem(_srchHistoryKey()) || '[]'); } catch (e) { return []; }
}
function _srchSaveHistory(q) {
  if (!q) return;
  var list = _srchLoadHistory();
  var norm = q.trim();
  if (!norm) return;
  list = list.filter(function(x){ return x.toLowerCase() !== norm.toLowerCase(); });
  list.unshift(norm);
  if (list.length > _srch.historyMax) list = list.slice(0, _srch.historyMax);
  try { localStorage.setItem(_srchHistoryKey(), JSON.stringify(list)); } catch (e) {}
  srchRenderHistory();
}
function srchClearHistory() {
  try { localStorage.removeItem(_srchHistoryKey()); } catch (e) {}
  srchRenderHistory();
}

/* ═══════════════════ MALZEME İLE ARA — BOTTOM SHEET ═══════════════════ */

function srchOpenIngredientSheet() {
  _srchInjectStyles();
  var ex = document.getElementById('srchIngSheet');
  if (ex) ex.remove();
  var sheet = document.createElement('div');
  sheet.id = 'srchIngSheet';
  sheet.className = 'srch-sheet-backdrop';
  sheet.onclick = function(e){ if (e.target === sheet) srchCloseIngredientSheet(); };
  sheet.innerHTML = '<div class="srch-sheet">' + _srchIngSheetBody() + '</div>';
  document.body.appendChild(sheet);
  requestAnimationFrame(function(){ sheet.classList.add('open'); });
}

function srchCloseIngredientSheet() {
  var sh = document.getElementById('srchIngSheet');
  if (!sh) return;
  sh.classList.remove('open');
  setTimeout(function(){ if (sh.parentNode) sh.remove(); }, 240);
}

function _srchIngSheetBody() {
  var basket = _srch.ingredients;
  var suggestions = _srchSuggestions(basket);
  /* "Diğerleri" — temel listede olup da sepet veya öneri dışındakiler */
  var others = _SRCH_BASE_INGREDIENTS.filter(function(b){
    return basket.indexOf(b.key) === -1 && suggestions.indexOf(b.key) === -1;
  });

  var sheet = '<div class="srch-sheet-handle"></div>'
    + '<div class="srch-sheet-head">'
    +   '<div style="flex:1">'
    +     '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Malzeme ile Ara</div>'
    +     '<div style="font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:3px">Evdekileri seç, sana yemek önerelim</div>'
    +   '</div>'
    +   '<div class="srch-close" onclick="srchCloseIngredientSheet()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px"></iconify-icon></div>'
    + '</div>'
    + '<div class="srch-sheet-body">'
    /* Sepet */
    +   '<div style="margin-bottom:4px">'
    +     '<div style="font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-bottom:8px">Sepetim <span style="color:var(--primary);margin-left:4px">' + basket.length + '</span></div>'
    +     _srchBasketHtml(basket)
    +   '</div>'
    /* Arama ile ekle */
    +   '<div class="srch-ing-search">'
    +     '<iconify-icon icon="solar:magnifer-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    +     '<input id="srchIngCustom" placeholder="Özel bir malzeme ara (Avokado, Zerdeçal...)" autocomplete="off" '
    +           'oninput="_srchIngCustomInput(this.value)" onkeydown="_srchIngCustomKey(event)" '
    +           'style="flex:1;border:none;outline:none;background:transparent;font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary);min-width:0">'
    +     '<button onclick="_srchIngAddCustomFromInput()" style="padding:6px 12px;border:none;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-bold) 11px/1 var(--font);cursor:pointer">Ekle</button>'
    +   '</div>'
    /* Akıllı öneri */
    +   (suggestions.length
        ? '<div style="margin-top:16px">'
          + '<div style="font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-bottom:8px">Bunlar da Yakışabilir</div>'
          + '<div class="srch-ing-grid">' + suggestions.map(function(k){ return _srchIngCardHtml(_SRCH_BASE_INGREDIENTS.find(function(b){ return b.key === k; }), false, true); }).join('') + '</div>'
          + '</div>'
        : '')
    /* Temel malzemeler */
    +   '<div style="margin-top:16px">'
    +     '<div style="font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-bottom:8px">Temel Malzemeler</div>'
    +     '<div class="srch-ing-grid">' + others.map(function(b){ return _srchIngCardHtml(b, false, false); }).join('') + '</div>'
    +   '</div>'
    + '</div>'
    /* Alt aksiyon */
    + '<div class="srch-sheet-foot">'
    +   '<button onclick="srchClearIngredients()" class="srch-foot-btn srch-foot-btn--ghost">Temizle</button>'
    +   '<button onclick="srchFindByIngredients()" class="srch-foot-btn srch-foot-btn--primary" ' + (basket.length ? '' : 'disabled') + '>'
    +     '<iconify-icon icon="solar:chef-hat-bold" style="font-size:15px"></iconify-icon> Yemek Bul'
    +   '</button>'
    + '</div>';
  return sheet;
}

function _srchIngCardHtml(b, inBasket, isSuggestion) {
  if (!b) return '';
  return '<div onclick="srchToggleIngredient(\'' + b.key + '\')" class="srch-ing-card' + (inBasket ? ' in-basket' : '') + (isSuggestion ? ' is-sugg' : '') + '">'
    + '<div class="srch-ing-ico" style="background:' + b.color + '22;color:' + b.color + '"><iconify-icon icon="' + b.icon + '" style="font-size:22px"></iconify-icon></div>'
    + '<span class="srch-ing-label">' + _srchEsc(b.label) + '</span>'
    + (isSuggestion ? '<span class="srch-ing-plus"><iconify-icon icon="solar:add-circle-bold" style="font-size:14px"></iconify-icon></span>' : '')
    + '</div>';
}

function _srchBasketHtml(basket) {
  if (!basket.length) {
    return '<div style="padding:16px;border:1.5px dashed var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-btn);text-align:center;color:var(--text-muted);font:var(--fw-medium) 12px/1.3 var(--font)">Henüz malzeme seçmedin — aşağıdan seç veya ara</div>';
  }
  return '<div style="display:flex;flex-wrap:wrap;gap:6px">' + basket.map(function(k){
    var b = _SRCH_BASE_INGREDIENTS.find(function(x){ return x.key === k; });
    var label = b ? b.label : k;
    var color = b ? b.color : '#94A3B8';
    var icon = b ? b.icon : 'solar:dish-bold';
    return '<div style="display:inline-flex;align-items:center;gap:6px;padding:7px 10px 7px 8px;border-radius:var(--r-full);background:' + color + '1E;border:1px solid ' + color + '55;color:var(--text-primary);font:var(--fw-semibold) 12px/1 var(--font)">'
      + '<iconify-icon icon="' + icon + '" style="font-size:13px;color:' + color + '"></iconify-icon>'
      + _srchEsc(label)
      + '<iconify-icon onclick="event.stopPropagation();srchToggleIngredient(\'' + k + '\')" icon="solar:close-circle-bold" style="font-size:13px;color:var(--text-muted);cursor:pointer"></iconify-icon>'
      + '</div>';
  }).join('') + '</div>';
}

function srchToggleIngredient(key) {
  if (!key) return;
  var idx = _srch.ingredients.indexOf(key);
  if (idx > -1) _srch.ingredients.splice(idx, 1);
  else _srch.ingredients.push(key);
  _srchRefreshSheet();
}

function srchClearIngredients() {
  _srch.ingredients = [];
  _srchRefreshSheet();
}

function _srchIngCustomInput(_v) { /* placeholder for future autocomplete */ }
function _srchIngCustomKey(e) {
  if (e && e.key === 'Enter') _srchIngAddCustomFromInput();
}
function _srchIngAddCustomFromInput() {
  var input = document.getElementById('srchIngCustom');
  if (!input) return;
  var v = (input.value || '').trim();
  if (!v) return;
  var key = _srchNorm(v);
  if (!key) return;
  /* Temel listede yoksa dinamik ekle (basket'te tutulur) */
  if (!_SRCH_BASE_INGREDIENTS.find(function(b){ return b.key === key; })) {
    _SRCH_BASE_INGREDIENTS.push({ key: key, label: _srchCap(v), icon: 'solar:dish-bold', color: '#64748B' });
  }
  if (_srch.ingredients.indexOf(key) === -1) _srch.ingredients.push(key);
  input.value = '';
  _srchRefreshSheet();
}

function _srchRefreshSheet() {
  var sh = document.getElementById('srchIngSheet');
  if (!sh) return;
  var inner = sh.firstElementChild;
  if (!inner) return;
  inner.innerHTML = _srchIngSheetBody();
}

function _srchSuggestions(basket) {
  if (!basket || !basket.length) return [];
  var score = {};
  basket.forEach(function(k){
    (_SRCH_COOCCUR[k] || []).forEach(function(other){
      if (basket.indexOf(other) > -1) return;
      score[other] = (score[other] || 0) + 1;
    });
  });
  var ranked = Object.keys(score).sort(function(a, b){ return score[b] - score[a]; });
  return ranked.slice(0, 6);
}

/* ═══════════════════ INGREDIENT SEARCH RESULTS ═══════════════════ */

function srchFindByIngredients() {
  if (!_srch.ingredients.length) return;
  var basket = _srch.ingredients.map(function(k){
    var b = _SRCH_BASE_INGREDIENTS.find(function(x){ return x.key === k; });
    return b ? _srchNorm(b.label) : k;
  });

  var items = [];
  (typeof menuItems !== 'undefined' ? menuItems : []).forEach(function(it, i){
    var recipeIngs = _srchRecipeIngNames(it);
    if (!recipeIngs.length) return;
    var matched = 0;
    recipeIngs.forEach(function(ri){
      if (basket.some(function(bq){ return ri.indexOf(bq) > -1 || bq.indexOf(ri) > -1; })) matched++;
    });
    if (matched === 0) return;
    var pct = Math.round(matched / recipeIngs.length * 100);
    var missing = recipeIngs.length - matched;
    items.push({ idx: i, source: 'menu', item: it, matchPct: pct, missing: missing });
  });

  items.sort(function(a, b){ return b.matchPct - a.matchPct; });
  _srch.results = { items: items.slice(0, 40), mode: 'ing', title: 'Sende olanlardan yapılabilecekler' };
  srchCloseIngredientSheet();
  _srchRenderResults();
}

/* ═══════════════════ HELPERS ═══════════════════ */

function _srchRecipeIngNames(it) {
  if (!it || !Array.isArray(it.ing)) return [];
  return it.ing.map(function(x){ return _srchNorm(typeof x === 'string' ? x : x.name); }).filter(Boolean);
}

function _srchMatchText(it, q) {
  var bag = (it.name || '') + ' ' + (it.category || '') + ' ' + (it.desc || '') + ' ';
  if (Array.isArray(it.ing)) bag += it.ing.map(function(x){ return typeof x === 'string' ? x : x.name; }).join(' ');
  return _srchNorm(bag).indexOf(q) > -1;
}

function _srchIsVegan(it) {
  var lower = ((it.ing || []).map(function(x){ return typeof x === 'string' ? x : x.name; }).join(' ') + ' ' + (it.name || '') + ' ' + (it.desc || '')).toLowerCase();
  var meat = /et|kıyma|köfte|tavuk|balık|somon|karides|hindi|peynir|süt|yumurta|tereyağı|kebap|pastırma|sucuk|kuzu|dana|pirzola|döner/;
  return !meat.test(lower);
}

function _srchMinutes(s) {
  if (!s) return 0;
  var m = String(s).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function _srchNorm(s) {
  if (!s) return '';
  return String(s).toLowerCase()
    .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ç/g,'c')
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

function _srchCap(s) { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); }

function _srchEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function _srchAttr(s) {
  return _srchEsc(s).replace(/'/g,'\\&#39;');
}

/* ═══════════════════ STYLES ═══════════════════ */

function _srchInjectStyles() {
  if (document.getElementById('srchStyles')) return;
  var s = document.createElement('style');
  s.id = 'srchStyles';
  s.textContent = [
    '.srch-sheet-backdrop{position:fixed;inset:0;z-index:110;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .22s}',
    '.srch-sheet-backdrop.open{opacity:1}',
    '.srch-sheet{width:100%;max-width:480px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;overflow:hidden;max-height:88vh;display:flex;flex-direction:column;transform:translateY(24px);transition:transform .28s ease}',
    '.srch-sheet-backdrop.open .srch-sheet{transform:translateY(0)}',
    '.srch-sheet-handle{width:44px;height:4px;border-radius:2px;background:var(--border-subtle);margin:10px auto 0;flex-shrink:0}',
    '.srch-sheet-head{padding:14px 18px 12px;display:flex;align-items:flex-start;gap:10px;border-bottom:1px solid var(--border-subtle)}',
    '.srch-close{width:34px;height:34px;border-radius:50%;background:var(--bg-btn);display:flex;align-items:center;justify-content:center;color:var(--text-muted);cursor:pointer;flex-shrink:0}',
    '.srch-sheet-body{flex:1;overflow-y:auto;padding:14px 18px 18px}',
    '.srch-sheet-foot{display:flex;gap:10px;padding:14px 18px max(env(safe-area-inset-bottom),14px);border-top:1px solid var(--border-subtle);background:var(--bg-page)}',
    '.srch-foot-btn{flex:1;padding:13px;border:none;border-radius:var(--r-full);font:var(--fw-bold) 13.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.srch-foot-btn:disabled{opacity:.5;cursor:not-allowed}',
    '.srch-foot-btn--ghost{background:var(--bg-btn);color:var(--text-primary)}',
    '.srch-foot-btn--primary{background:var(--primary);color:#fff}',
    '.srch-ing-search{display:flex;align-items:center;gap:8px;padding:8px 10px 8px 14px;margin-top:14px;background:var(--bg-btn);border:1px solid var(--border-subtle);border-radius:var(--r-full)}',
    '.srch-ing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
    '.srch-ing-card{position:relative;padding:10px 8px;border-radius:var(--r-lg);border:1.5px solid var(--border-subtle);background:var(--bg-page);display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:all .15s}',
    '.srch-ing-card:active{transform:scale(.97)}',
    '.srch-ing-card.is-sugg{border-color:var(--primary);background:var(--primary-soft)}',
    '.srch-ing-card.in-basket{border-color:var(--primary);background:var(--primary)}',
    '.srch-ing-card.in-basket .srch-ing-label{color:#fff}',
    '.srch-ing-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}',
    '.srch-ing-label{font:var(--fw-semibold) 11.5px/1.2 var(--font);color:var(--text-primary);text-align:center}',
    '.srch-ing-plus{position:absolute;top:4px;right:4px;color:var(--primary)}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ═══════════════════ HOME → SEARCH YÖNLENDİRME ═══════════════════ */

function srchGoFromHome() {
  if (typeof switchTab === 'function') switchTab('search');
  srchInitSearchScreen();
  setTimeout(function(){
    var input = document.getElementById('srchInput');
    if (input) input.focus();
  }, 80);
}

/* .btn-search'lere click handler bağla — hem şimdi (scripts dinamik yükleniyor)
   hem de DOMContentLoaded (ihtiyaten). */
function _srchBindHomeButtons() {
  document.querySelectorAll('.btn-search').forEach(function(el){
    if (el._srchBound) return;
    el._srchBound = true;
    el.addEventListener('click', srchGoFromHome);
    el.style.cursor = 'pointer';
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _srchBindHomeButtons);
} else {
  _srchBindHomeButtons();
}

/* switchTab('search') her tetiklendiğinde initialize olmak için renderKesfet sonrası hook */
(function(){
  if (typeof window === 'undefined') return;
  var prev = window.renderKesfet;
  window.renderKesfet = function() {
    if (typeof prev === 'function') prev.apply(this, arguments);
    srchInitSearchScreen();
  };
})();

/* ═══════════════════════════════════════════════════════════
   ADMIN RECIPES V2 — 4 durum (Onaylı/Bekleyen/CevapBekleyen/Reddedilen)
   Drawer · AI allergen · Benzer tarif · Toplu işlem
   ═══════════════════════════════════════════════════════════ */

var _arv = {
  tab: 'pending',              // 'approved' | 'pending' | 'awaiting' | 'rejected'
  search: '',
  categoryFilter: '',
  selectedIds: {},             // { 'rc3': true } — bulk
  bulkMode: false,
  // Drawer state
  detailId: null,
  editingAllergens: [],
  showSimilar: false,
  // Action dialogs
  actionOpen: null,            // 'edit' | 'reject'
  actionNote: ''
};

/* ═══ Override mevcut admin sayfa render ═══ */
function renderAdminRecipes() {
  _arvInjectStyles();
  var c = document.getElementById('adminRecipesContainer');
  if (!c) return;
  _arvRender(c);
}

function _arvRender(c) {
  var counts = _arvCounts();

  var h = '<div class="arv-wrap adm-fadeIn">';

  // Header
  h += '<div class="arv-head">'
    + '<div class="arv-title"><iconify-icon icon="solar:chef-hat-heart-bold" style="font-size:20px;color:#F65013"></iconify-icon>Tarif Yönetimi</div>'
    + '<div class="arv-sub">' + ADMIN_RECIPES.length + ' tarif · ' + counts.pending + ' onay bekliyor</div>'
    + '</div>';

  // Tabs
  var tabs = [
    { id:'pending',   label:'Bekleyen',        icon:'solar:clock-circle-bold', color:'#F59E0B', count: counts.pending },
    { id:'awaiting',  label:'Cevap Bekleyen',  icon:'solar:chat-square-call-bold', color:'#8B5CF6', count: counts.awaiting },
    { id:'approved',  label:'Onaylı',          icon:'solar:check-circle-bold', color:'#22C55E', count: counts.approved },
    { id:'rejected',  label:'Reddedilen',      icon:'solar:close-circle-bold', color:'#EF4444', count: counts.rejected }
  ];

  h += '<div class="arv-tabs">';
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    h += '<button class="arv-tab' + (_arv.tab === t.id ? ' active' : '') + '" style="--tc:' + t.color + '" onclick="_arvSetTab(\'' + t.id + '\')">'
      + '<iconify-icon icon="' + t.icon + '" style="font-size:14px"></iconify-icon>'
      + '<span>' + t.label + '</span>'
      + '<span class="arv-tab-count">' + t.count + '</span>'
      + '</button>';
  }
  h += '</div>';

  // Search
  h += '<div class="arv-search">'
    + '<iconify-icon icon="solar:magnifer-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input type="text" placeholder="Tarif, kullanıcı veya kategori ara..." value="' + _arvEsc(_arv.search) + '" '
    + 'oninput="_arv.search=this.value;_arvRefreshList()">'
    + '</div>';

  // Body
  h += '<div id="arvListWrap" class="arv-list-wrap"></div>';

  h += '</div>';
  c.innerHTML = h;

  _arvRefreshList();
}

function _arvRefreshList() {
  var box = document.getElementById('arvListWrap');
  if (!box) return;

  if (_arv.tab === 'approved') { box.innerHTML = _arvRenderApproved(); return; }
  if (_arv.tab === 'pending') { box.innerHTML = _arvRenderPending(); return; }
  box.innerHTML = '<div class="arv-placeholder">Liste (P8-P9) yakında...</div>';
}

/* ═══ P3 — Bekleyen Tab ═══ */
function _arvRenderPending() {
  var list = _arvFilterList('pending');
  // Kronolojik en eskiden yeniye (ilk gelen ilk işlenir)
  list.sort(function(a,b){ return new Date(a.date) - new Date(b.date); });

  if (list.length === 0) {
    return '<div class="arv-empty">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:42px;opacity:.3;color:#22C55E"></iconify-icon>'
      + '<div>Tüm tarifler denetlendi</div>'
      + '<div class="arv-empty-sub">Onay bekleyen tarif kalmadı 🎉</div>'
      + '</div>';
  }

  var selectedCount = Object.keys(_arv.selectedIds).filter(function(k){ return _arv.selectedIds[k]; }).length;

  var h = '<div class="arv-pending-bar">'
    + '<label class="arv-bulk-toggle">'
    + '<input type="checkbox"' + (_arv.bulkMode ? ' checked' : '') + ' onchange="_arv.bulkMode=this.checked;_arv.selectedIds={};_arvRefreshList()">'
    + '<span>Toplu Mod</span></label>'
    + '<span class="arv-pending-count"><iconify-icon icon="solar:clock-circle-bold" style="font-size:13px;color:#F59E0B"></iconify-icon>' + list.length + ' tarif bekliyor</span>'
    + '</div>';

  // Bulk action bar (toplu mod + seçim var ise)
  if (_arv.bulkMode && selectedCount > 0) {
    h += '<div class="arv-bulk-actions">'
      + '<span class="arv-bulk-selcnt"><b>' + selectedCount + '</b> tarif seçildi</span>'
      + '<button class="arv-btn-mini arv-btn-mini--sel" onclick="_arvSelectAllPending()">Tümünü Seç</button>'
      + '<button class="arv-btn-mini arv-btn-mini--clr" onclick="_arv.selectedIds={};_arvRefreshList()">Temizle</button>'
      + '<button class="arv-btn-bulk" onclick="_arvBulkApprove()">'
      + '<iconify-icon icon="solar:check-read-bold" style="font-size:14px"></iconify-icon>Toplu Onayla (' + selectedCount + ')</button>'
      + '</div>';
  }

  h += '<div class="arv-pending-list">';
  for (var i = 0; i < list.length; i++) {
    h += _arvPendingCard(list[i], i + 1);
  }
  h += '</div>';
  return h;
}

function _arvPendingCard(r, rank) {
  var sel = !!_arv.selectedIds[r.id];
  return '<div class="arv-p-card' + (sel ? ' selected' : '') + '">'
    + (_arv.bulkMode
        ? '<div class="arv-p-check" onclick="_arvToggleSelect(\'' + r.id + '\')">'
          + (sel
              ? '<iconify-icon icon="solar:check-square-bold" style="font-size:24px;color:#F65013"></iconify-icon>'
              : '<iconify-icon icon="solar:square-linear" style="font-size:24px;color:var(--text-muted)"></iconify-icon>')
          + '</div>'
        : '<div class="arv-p-rank">#' + rank + '</div>')
    + '<div class="arv-p-img" style="background-image:url(' + (r.cover || '') + ')"></div>'
    + '<div class="arv-p-main" onclick="_arvOpenDetail(\'' + r.id + '\')">'
    + '<div class="arv-p-title">' + _arvEsc(r.title || '') + '</div>'
    + '<div class="arv-p-meta">'
    + '<span><iconify-icon icon="solar:user-linear" style="font-size:11px"></iconify-icon>' + _arvEsc(r.userName || '—') + '</span>'
    + '<span class="arv-dot">·</span>'
    + '<span class="arv-cat-pill">' + _arvEsc(r.category || '—') + '</span>'
    + '</div>'
    + '<div class="arv-p-date">'
    + '<iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>'
    + _arvFmtDate(r.date)
    + '<span class="arv-status-pill arv-status-pill--pending">Bekliyor</span>'
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);align-self:center"></iconify-icon>'
    + '</div>';
}

function _arvToggleSelect(id) {
  _arv.selectedIds[id] = !_arv.selectedIds[id];
  _arvRefreshList();
}

function _arvSelectAllPending() {
  var list = _arvFilterList('pending');
  for (var i = 0; i < list.length; i++) _arv.selectedIds[list[i].id] = true;
  _arvRefreshList();
}

function _arvBulkApprove() {
  if (typeof _admToast === 'function') _admToast('Toplu onay P10 yakında...', 'ok');
}

/* ═══ P2 — Onaylanmış Tab ═══ */
function _arvFilterList(status) {
  var q = (_arv.search || '').toLowerCase().trim();
  return ADMIN_RECIPES.filter(function(r) {
    if (r.status !== status) return false;
    if (!q) return true;
    return (r.title || '').toLowerCase().indexOf(q) > -1
      || (r.userName || '').toLowerCase().indexOf(q) > -1
      || (r.category || '').toLowerCase().indexOf(q) > -1;
  });
}

function _arvFmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  var months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' · ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

function _arvFmtNum(n) {
  if (!n) return '0';
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'K';
  return String(n);
}

function _arvRenderApproved() {
  var list = _arvFilterList('approved');
  list.sort(function(a,b){ return (b.favoriteCount||0) - (a.favoriteCount||0); });

  if (list.length === 0) {
    return '<div class="arv-empty">'
      + '<iconify-icon icon="solar:chef-hat-linear" style="font-size:42px;opacity:.3"></iconify-icon>'
      + '<div>Onaylanmış tarif bulunamadı</div>'
      + '</div>';
  }

  var h = '<div class="arv-info-bar">'
    + '<iconify-icon icon="solar:chart-2-bold" style="font-size:14px;color:#22C55E"></iconify-icon>'
    + '<span>Etkileşim verilerine göre sıralı · ' + list.length + ' tarif</span>'
    + '</div>';

  h += '<div class="arv-approved-grid">';
  for (var i = 0; i < list.length; i++) {
    h += _arvApprovedCard(list[i]);
  }
  h += '</div>';
  return h;
}

function _arvApprovedCard(r) {
  return '<div class="arv-a-card" onclick="_arvOpenDetail(\'' + r.id + '\')">'
    + '<div class="arv-a-img" style="background-image:url(' + (r.cover || '') + ')"></div>'
    + '<div class="arv-a-body">'
    + '<div class="arv-a-title">' + _arvEsc(r.title || '') + '</div>'
    + '<div class="arv-a-meta">'
    + '<span><iconify-icon icon="solar:user-linear" style="font-size:11px"></iconify-icon>' + _arvEsc(r.userName || '—') + '</span>'
    + '<span class="arv-dot">·</span>'
    + '<span class="arv-cat-pill">' + _arvEsc(r.category || '—') + '</span>'
    + '</div>'
    + '<div class="arv-a-date"><iconify-icon icon="solar:calendar-linear" style="font-size:11px"></iconify-icon>' + _arvFmtDate(r.date) + '</div>'
    + '<div class="arv-a-stats">'
    + _arvStatCell('solar:heart-bold', '#EF4444', r.favoriteCount || 0)
    + _arvStatCell('solar:bookmark-bold', '#3B82F6', r.saves || 0)
    + _arvStatCell('solar:chat-round-dots-bold', '#F59E0B', r.comments || 0)
    + _arvStatCell('solar:tag-linear', '#8B5CF6', r.tagCount || 0)
    + '</div>'
    + '<div class="arv-a-time">'
    + '<iconify-icon icon="solar:clock-circle-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
    + '<span>Hazırlık <b>' + (r.prepTime || 0) + '</b> dk · Pişirme <b>' + (r.cookTime || 0) + '</b> dk</span>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function _arvStatCell(icon, color, val) {
  return '<div class="arv-stat-cell" title="' + val + '">'
    + '<iconify-icon icon="' + icon + '" style="font-size:12px;color:' + color + '"></iconify-icon>'
    + '<span>' + _arvFmtNum(val) + '</span>'
    + '</div>';
}

/* ═══ P4 — Detay Drawer (sağdan açılır) ═══ */
function _arvOpenDetail(id) {
  _arvCloseDetail();
  var r = _arvRecipe(id);
  if (!r) return;
  _arv.detailId = id;
  _arv.editingAllergens = (r.aiAllergens || []).slice();
  _arv.showSimilar = false;

  var host = document.getElementById('adminPhone');
  if (!host) return;
  var bd = document.createElement('div');
  bd.id = 'arvDrawerBd';
  bd.className = 'arv-drawer-bd';
  bd.onclick = _arvCloseDetail;

  var dr = document.createElement('div');
  dr.id = 'arvDrawer';
  dr.className = 'arv-drawer';
  dr.innerHTML = '<div id="arvDrawerBody"></div>';

  host.appendChild(bd);
  host.appendChild(dr);
  requestAnimationFrame(function(){
    bd.classList.add('open');
    dr.classList.add('open');
  });
  _arvRenderDetail();
}

function _arvCloseDetail() {
  var bd = document.getElementById('arvDrawerBd');
  var dr = document.getElementById('arvDrawer');
  if (bd) { bd.classList.remove('open'); setTimeout(function(){ if (bd.parentNode) bd.remove(); }, 260); }
  if (dr) { dr.classList.remove('open'); setTimeout(function(){ if (dr.parentNode) dr.remove(); }, 260); }
  _arv.detailId = null;
  _arv.actionOpen = null;
}

function _arvRecipe(id) {
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    if (ADMIN_RECIPES[i].id === id) return ADMIN_RECIPES[i];
  }
  return null;
}

function _arvRenderDetail() {
  var body = document.getElementById('arvDrawerBody');
  if (!body) return;
  var r = _arvRecipe(_arv.detailId);
  if (!r) return;

  var statusMeta = _arvStatusMeta(r.status);
  var h = '<div class="arv-dr-hero" style="background-image:url(' + (r.cover || '') + ')">'
    + '<div class="arv-dr-close" onclick="_arvCloseDetail()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div class="arv-dr-hero-grad">'
    + '<span class="arv-dr-status" style="background:' + statusMeta.color + ';color:#fff">'
    + '<iconify-icon icon="' + statusMeta.icon + '" style="font-size:12px"></iconify-icon>' + statusMeta.label + '</span>'
    + '<div class="arv-dr-title">' + _arvEsc(r.title || '') + '</div>'
    + '<div class="arv-dr-user">'
    + '<iconify-icon icon="solar:user-linear" style="font-size:12px"></iconify-icon> ' + _arvEsc(r.userName || '—')
    + ' · ' + _arvEsc(r.category || '') + ' · ' + _arvFmtDate(r.date)
    + '</div>'
    + '</div>'
    + '</div>';

  h += '<div class="arv-dr-body">';

  // Açıklama
  if (r.description) {
    h += '<div class="arv-dr-section">'
      + '<div class="arv-dr-sec-title"><iconify-icon icon="solar:document-text-linear" style="font-size:14px"></iconify-icon>Açıklama</div>'
      + '<div class="arv-dr-desc">' + _arvEsc(r.description) + '</div>'
      + '</div>';
  }

  // Malzemeler
  if (r.ingredients && r.ingredients.length) {
    h += '<div class="arv-dr-section">'
      + '<div class="arv-dr-sec-title"><iconify-icon icon="solar:checklist-minimalistic-linear" style="font-size:14px"></iconify-icon>Malzemeler (' + r.ingredients.length + ')</div>'
      + '<div class="arv-dr-ing-list">';
    for (var i = 0; i < r.ingredients.length; i++) {
      var ing = r.ingredients[i];
      h += '<div class="arv-dr-ing-row"><span>' + _arvEsc(ing.name) + '</span><b>' + _arvEsc(ing.amount) + '</b></div>';
    }
    h += '</div></div>';
  }

  // Adımlar
  if (r.steps && r.steps.length) {
    h += '<div class="arv-dr-section">'
      + '<div class="arv-dr-sec-title"><iconify-icon icon="solar:list-bold" style="font-size:14px"></iconify-icon>Yapılış (' + r.steps.length + ' adım)</div>'
      + '<div class="arv-dr-steps">';
    for (var s = 0; s < r.steps.length; s++) {
      h += '<div class="arv-dr-step">'
        + '<div class="arv-dr-step-num">' + (s + 1) + '</div>'
        + '<div class="arv-dr-step-txt">' + _arvEsc(r.steps[s]) + '</div>'
        + '</div>';
    }
    h += '</div></div>';
  }

  // Fotoğraflar
  if (r.media && r.media.length) {
    h += '<div class="arv-dr-section">'
      + '<div class="arv-dr-sec-title"><iconify-icon icon="solar:gallery-linear" style="font-size:14px"></iconify-icon>Fotoğraflar (' + r.media.length + ')</div>'
      + '<div class="arv-dr-media">';
    for (var m = 0; m < r.media.length; m++) {
      var md = r.media[m];
      h += '<div class="arv-dr-media-item' + (md.flagged ? ' flagged' : '') + '" style="background-image:url(' + md.url + ')">'
        + (md.flagged ? '<div class="arv-dr-flag"><iconify-icon icon="solar:flag-bold" style="font-size:11px"></iconify-icon>İşaretli</div>' : '')
        + '</div>';
    }
    h += '</div></div>';
  }

  // Red gerekçesi (rejected için)
  if (r.status === 'rejected' && r.rejectReason) {
    h += '<div class="arv-dr-reject-box">'
      + '<iconify-icon icon="solar:close-circle-bold" style="font-size:16px;color:#EF4444"></iconify-icon>'
      + '<div><div class="arv-dr-box-lbl">Red Gerekçesi</div>'
      + '<div class="arv-dr-box-txt">' + _arvEsc(r.rejectReason) + '</div></div>'
      + '</div>';
  }

  // Düzenleme isteği (awaiting için)
  if (r.status === 'awaiting_response' && r.editRequestNote) {
    h += '<div class="arv-dr-edit-box">'
      + '<iconify-icon icon="solar:pen-new-square-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>'
      + '<div><div class="arv-dr-box-lbl">Admin Notu (Düzenleme İsteği)</div>'
      + '<div class="arv-dr-box-txt">' + _arvEsc(r.editRequestNote) + '</div>'
      + '<div class="arv-dr-box-sub">Gönderim: ' + _arvFmtDate(r.editRequestedAt) + '</div></div>'
      + '</div>';
  }

  // AI Alerjen Analizi (pending ve awaiting için editable)
  h += _arvRenderAIAllergens(r);

  // Benzer tarifler (pending ve awaiting için — admin duplicate kontrolü)
  if (r.status === 'pending' || r.status === 'awaiting_response') {
    h += _arvRenderSimilar(r);
  }

  h += '</div>';
  body.innerHTML = h;
}

/* ═══ P6 — Benzer Tarif Algoritması ═══ */
// Simple Jaccard benzerliği: title tokens + ingredient names
function _arvSimilarity(a, b) {
  function tokens(rec) {
    var words = [];
    (String(rec.title || '').toLowerCase().split(/[\s,]+/)).forEach(function(w){ if (w.length > 2) words.push(w); });
    (rec.ingredients || []).forEach(function(ing){
      String(ing.name || '').toLowerCase().split(/[\s,()]+/).forEach(function(w){ if (w.length > 2) words.push(w); });
    });
    return words;
  }
  var ta = tokens(a);
  var tb = tokens(b);
  if (!ta.length || !tb.length) return 0;
  var setA = {};
  var setB = {};
  ta.forEach(function(w){ setA[w] = true; });
  tb.forEach(function(w){ setB[w] = true; });
  var keysA = Object.keys(setA);
  var keysB = Object.keys(setB);
  var inter = 0;
  for (var i = 0; i < keysA.length; i++) if (setB[keysA[i]]) inter++;
  var unionSize = keysA.length + keysB.length - inter;
  return unionSize === 0 ? 0 : Math.round((inter / unionSize) * 100);
}

function _arvFindSimilar(r) {
  var hits = [];
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    var other = ADMIN_RECIPES[i];
    if (other.id === r.id) continue;
    if (other.status !== 'approved') continue;
    var score = _arvSimilarity(r, other);
    if (score >= 40) hits.push({ recipe: other, score: score });
  }
  hits.sort(function(a,b){ return b.score - a.score; });
  return hits.slice(0, 5);
}

function _arvRenderSimilar(r) {
  var hits = _arvFindSimilar(r);
  var highest = hits[0] ? hits[0].score : 0;
  var danger = highest >= 80;

  var h = '<div class="arv-dr-similar' + (danger ? ' arv-dr-similar--danger' : '') + '">'
    + '<div class="arv-sim-head">'
    + '<div class="arv-sim-badge' + (danger ? ' arv-sim-badge--danger' : '') + '">'
    + '<iconify-icon icon="' + (danger ? 'solar:danger-triangle-bold' : 'solar:copy-linear') + '" style="font-size:13px"></iconify-icon>'
    + (danger ? '%' + highest + ' KRİTİK EŞLEŞME' : 'BENZERLİK TARAMASI')
    + '</div>'
    + '<div class="arv-sim-title">' + (hits.length > 0 ? hits.length + ' benzeyen tarif bulundu' : 'Benzeyen tarif bulunamadı') + '</div>'
    + '</div>';

  if (danger) {
    h += '<div class="arv-sim-danger-msg">'
      + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:15px"></iconify-icon>'
      + '<span>Bu tarif <b>%' + highest + '</b> oranında zaten onaylı bir tarife benziyor. Mükerrer içerik olabilir — reddetmeyi değerlendirin.</span>'
      + '</div>';
  }

  if (hits.length > 0) {
    h += '<div class="arv-sim-list">';
    for (var i = 0; i < hits.length; i++) {
      var hit = hits[i];
      var barColor = hit.score >= 80 ? '#EF4444' : hit.score >= 60 ? '#F59E0B' : '#10B981';
      h += '<div class="arv-sim-row">'
        + '<div class="arv-sim-img" style="background-image:url(' + (hit.recipe.cover || '') + ')"></div>'
        + '<div style="flex:1;min-width:0">'
        + '<div class="arv-sim-name">' + _arvEsc(hit.recipe.title) + '</div>'
        + '<div class="arv-sim-user">' + _arvEsc(hit.recipe.userName || '—') + '</div>'
        + '<div class="arv-sim-bar-wrap">'
        + '<div class="arv-sim-bar"><div class="arv-sim-bar-fill" style="width:' + hit.score + '%;background:' + barColor + '"></div></div>'
        + '<span class="arv-sim-pct" style="color:' + barColor + '">%' + hit.score + '</span>'
        + '</div>'
        + '</div>'
        + '</div>';
    }
    h += '</div>';
  }

  h += '</div>';
  return h;
}

/* ═══ P5 — AI Alerjen Paneli ═══ */
function _arvRenderAIAllergens(r) {
  var editable = (r.status === 'pending' || r.status === 'awaiting_response');
  var currentList = editable ? _arv.editingAllergens : (r.aiAllergens || []);

  var h = '<div class="arv-dr-ai">'
    + '<div class="arv-dr-ai-head">'
    + '<div class="arv-dr-ai-badge">'
    + '<iconify-icon icon="solar:magic-stick-3-bold" style="font-size:13px"></iconify-icon>'
    + '<span>AI ANALİZ</span>'
    + '</div>'
    + '<div class="arv-dr-ai-title">Alerjen & İntolerans Önizlemesi</div>'
    + '</div>';

  if (currentList.length === 0) {
    h += '<div class="arv-ai-empty">'
      + '<iconify-icon icon="solar:check-circle-linear" style="font-size:18px;color:#22C55E"></iconify-icon>'
      + '<span>AI, bu tarifte bilinen bir alerjen tespit etmedi.</span>'
      + '</div>';
  } else {
    h += '<div class="arv-ai-chips">';
    for (var i = 0; i < currentList.length; i++) {
      var a = currentList[i];
      h += '<div class="arv-ai-chip' + (a.indexOf('Risk') > -1 ? ' arv-ai-chip--risk' : '') + '">'
        + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:11px"></iconify-icon>'
        + '<span>' + _arvEsc(a) + '</span>'
        + (editable
            ? '<button class="arv-ai-chip-x" onclick="_arvRemoveAllergen(' + i + ')" title="Kaldır">'
              + '<iconify-icon icon="solar:close-circle-bold" style="font-size:12px"></iconify-icon></button>'
            : '')
        + '</div>';
    }
    h += '</div>';
  }

  if (editable) {
    h += '<div class="arv-ai-add">'
      + '<input type="text" id="arvAllergenInput" placeholder="Alerjen ekle (Örn: Kabuklu Deniz Ürünleri)" '
      + 'onkeydown="if(event.key===\'Enter\')_arvAddAllergen()">'
      + '<button class="arv-btn-mini arv-btn-mini--add" onclick="_arvAddAllergen()">'
      + '<iconify-icon icon="solar:add-circle-bold" style="font-size:13px"></iconify-icon>Ekle</button>'
      + '</div>'
      + '<div class="arv-ai-hint">'
      + '<iconify-icon icon="solar:info-circle-linear" style="font-size:11px;color:#8B5CF6"></iconify-icon>'
      + '<span>Önerileri inceleyin, ekleyebilir veya kaldırabilirsiniz. Onay aşamasında bu liste son hâli alacaktır.</span>'
      + '</div>';
  }

  h += '</div>';
  return h;
}

function _arvAddAllergen() {
  var inp = document.getElementById('arvAllergenInput');
  if (!inp) return;
  var v = (inp.value || '').trim();
  if (!v) return;
  if (_arv.editingAllergens.indexOf(v) === -1) _arv.editingAllergens.push(v);
  inp.value = '';
  _arvRenderDetail();
}

function _arvRemoveAllergen(idx) {
  _arv.editingAllergens.splice(idx, 1);
  _arvRenderDetail();
}

function _arvStatusMeta(status) {
  if (status === 'approved') return { label:'Onaylı', color:'#22C55E', icon:'solar:check-circle-bold' };
  if (status === 'pending') return { label:'Bekliyor', color:'#F59E0B', icon:'solar:clock-circle-bold' };
  if (status === 'awaiting_response') return { label:'Cevap Bekliyor', color:'#8B5CF6', icon:'solar:chat-square-call-bold' };
  if (status === 'rejected') return { label:'Reddedildi', color:'#EF4444', icon:'solar:close-circle-bold' };
  return { label:status, color:'#6B7280', icon:'solar:question-circle-linear' };
}

function _arvSetTab(tab) {
  _arv.tab = tab;
  _arv.selectedIds = {};
  _arv.bulkMode = false;
  _arvRender(document.getElementById('adminRecipesContainer'));
}

function _arvCounts() {
  var c = { approved:0, pending:0, awaiting:0, rejected:0 };
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    var s = ADMIN_RECIPES[i].status;
    if (s === 'approved') c.approved++;
    else if (s === 'pending') c.pending++;
    else if (s === 'awaiting_response') c.awaiting++;
    else if (s === 'rejected') c.rejected++;
  }
  return c;
}

function _arvEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

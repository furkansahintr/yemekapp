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

function _arvOpenDetail(id) {
  if (typeof _admToast === 'function') _admToast('Detay drawer P4 yakında... (' + id + ')', 'ok');
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

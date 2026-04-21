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
  if (_arv.tab === 'awaiting') { box.innerHTML = _arvRenderAwaiting(); return; }
  if (_arv.tab === 'rejected') { box.innerHTML = _arvRenderRejected(); return; }
  box.innerHTML = '<div class="arv-placeholder">Liste bulunamadı</div>';
}

/* ═══ P9 — Reddedilen Tab ═══ */
function _arvRenderRejected() {
  var list = _arvFilterList('rejected');
  // En yeni red önce
  list.sort(function(a,b){ return new Date(b.rejectedAt || b.date) - new Date(a.rejectedAt || a.date); });

  if (list.length === 0) {
    return '<div class="arv-empty">'
      + '<iconify-icon icon="solar:shield-check-linear" style="font-size:42px;opacity:.3;color:#22C55E"></iconify-icon>'
      + '<div>Reddedilmiş tarif yok</div>'
      + '<div class="arv-empty-sub">Henüz hiçbir tarif reddedilmemiş.</div>'
      + '</div>';
  }

  var h = '<div class="arv-info-bar arv-info-bar--red">'
    + '<iconify-icon icon="solar:archive-bold" style="font-size:14px;color:#EF4444"></iconify-icon>'
    + '<span>Reddedilmiş tarif arşivi · ' + list.length + ' kayıt</span>'
    + '</div>';

  h += '<div class="arv-rejected-list">';
  for (var i = 0; i < list.length; i++) {
    h += _arvRejectedCard(list[i]);
  }
  h += '</div>';
  return h;
}

function _arvRejectedCard(r) {
  return '<div class="arv-r-card" onclick="_arvOpenDetail(\'' + r.id + '\')">'
    + '<div class="arv-r-head">'
    + '<div class="arv-r-img" style="background-image:url(' + (r.cover || '') + ')"></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="arv-r-title">' + _arvEsc(r.title || '') + '</div>'
    + '<div class="arv-r-meta">'
    + '<span>' + _arvEsc(r.userName || '—') + '</span>'
    + '<span class="arv-dot">·</span>'
    + '<span class="arv-cat-pill">' + _arvEsc(r.category || '—') + '</span>'
    + '<span class="arv-dot">·</span>'
    + '<span>' + _arvFmtDate(r.rejectedAt || r.date) + '</span>'
    + '</div>'
    + '</div>'
    + '<span class="arv-status-pill arv-status-pill--rejected">Reddedildi</span>'
    + '</div>'
    + (r.rejectReason
        ? '<div class="arv-r-reason">'
          + '<iconify-icon icon="solar:close-circle-bold" style="font-size:13px;color:#EF4444"></iconify-icon>'
          + '<span>' + _arvEsc(r.rejectReason) + '</span>'
          + '</div>'
        : '')
    + '</div>';
}

/* ═══ P8 — Cevap Bekleyen Tab ═══ */
function _arvRenderAwaiting() {
  var list = _arvFilterList('awaiting_response');
  // Kronolojik en eskiden yeniye (editRequestedAt'a göre)
  list.sort(function(a,b){ return new Date(a.editRequestedAt || a.date) - new Date(b.editRequestedAt || b.date); });

  if (list.length === 0) {
    return '<div class="arv-empty">'
      + '<iconify-icon icon="solar:inbox-linear" style="font-size:42px;opacity:.3"></iconify-icon>'
      + '<div>Cevap bekleyen tarif yok</div>'
      + '<div class="arv-empty-sub">Düzenleme istediğin tarifler burada listelenir</div>'
      + '</div>';
  }

  var h = '<div class="arv-info-bar">'
    + '<iconify-icon icon="solar:chat-square-call-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>'
    + '<span>Kullanıcı güncellemesi bekleniyor · ' + list.length + ' tarif</span>'
    + '</div>';

  h += '<div class="arv-pending-list">';
  for (var i = 0; i < list.length; i++) {
    h += _arvAwaitingCard(list[i]);
  }
  h += '</div>';
  return h;
}

function _arvAwaitingCard(r) {
  var waitDays = r.editRequestedAt ? Math.floor((Date.now() - new Date(r.editRequestedAt)) / 86400000) : 0;
  var waitLbl = waitDays === 0 ? 'Bugün gönderildi' : waitDays + ' gün önce gönderildi';
  var stale = waitDays >= 5;

  return '<div class="arv-p-card arv-p-card--awaiting">'
    + '<div class="arv-p-img" style="background-image:url(' + (r.cover || '') + ')"></div>'
    + '<div class="arv-p-main" onclick="_arvOpenDetail(\'' + r.id + '\')">'
    + '<div class="arv-p-title">' + _arvEsc(r.title || '') + '</div>'
    + '<div class="arv-p-meta">'
    + '<span><iconify-icon icon="solar:user-linear" style="font-size:11px"></iconify-icon>' + _arvEsc(r.userName || '—') + '</span>'
    + '<span class="arv-dot">·</span>'
    + '<span class="arv-cat-pill">' + _arvEsc(r.category || '—') + '</span>'
    + '</div>'
    + (r.editRequestNote
        ? '<div class="arv-p-note">'
          + '<iconify-icon icon="solar:pen-new-square-linear" style="font-size:11px;color:#8B5CF6"></iconify-icon>'
          + '<span>' + _arvEsc(r.editRequestNote.length > 80 ? r.editRequestNote.slice(0, 80) + '...' : r.editRequestNote) + '</span>'
          + '</div>'
        : '')
    + '<div class="arv-p-date">'
    + '<iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>'
    + waitLbl
    + (stale ? '<span class="arv-status-pill arv-status-pill--stale">Uzun sürdü</span>' : '<span class="arv-status-pill arv-status-pill--awaiting">Cevap Bekliyor</span>')
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);align-self:center"></iconify-icon>'
    + '</div>';
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

/* ═══ P10 — Toplu Onay Akışı ═══ */
function _arvBulkApprove() {
  var ids = Object.keys(_arv.selectedIds).filter(function(k){ return _arv.selectedIds[k]; });
  if (ids.length === 0) return;

  // Onay modalı
  var host = document.getElementById('adminPhone');
  var existing = document.getElementById('arvBulkDialog');
  if (existing) existing.remove();

  var list = ids.map(_arvRecipe).filter(Boolean);
  // Yüksek benzerlik içeren kayıt var mı?
  var warnings = [];
  for (var i = 0; i < list.length; i++) {
    var hits = _arvFindSimilar(list[i]);
    if (hits[0] && hits[0].score >= 80) warnings.push({ recipe: list[i], score: hits[0].score });
  }

  var m = document.createElement('div');
  m.id = 'arvBulkDialog';
  m.className = 'arv-bulk-dialog';
  m.onclick = function(e){ if (e.target === m) { m.remove(); } };

  var h = '<div class="arv-bulk-card">'
    + '<div class="arv-bulk-head">'
    + '<iconify-icon icon="solar:check-read-bold" style="font-size:28px;color:#22C55E"></iconify-icon>'
    + '<div><div class="arv-bulk-title">Toplu Onayla</div>'
    + '<div class="arv-bulk-sub">' + list.length + ' tarif tek seferde onaylanacak</div></div>'
    + '</div>';

  // Tarif mini listesi
  h += '<div class="arv-bulk-list">';
  for (var j = 0; j < Math.min(6, list.length); j++) {
    h += '<div class="arv-bulk-row">'
      + '<div class="arv-bulk-img" style="background-image:url(' + (list[j].cover || '') + ')"></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="arv-bulk-name">' + _arvEsc(list[j].title) + '</div>'
      + '<div class="arv-bulk-user">' + _arvEsc(list[j].userName || '—') + '</div>'
      + '</div>'
      + '</div>';
  }
  if (list.length > 6) h += '<div class="arv-bulk-more">+' + (list.length - 6) + ' diğer tarif</div>';
  h += '</div>';

  // Uyarı (kritik benzerlik)
  if (warnings.length > 0) {
    h += '<div class="arv-bulk-warn">'
      + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:15px;color:#EF4444"></iconify-icon>'
      + '<span><b>' + warnings.length + ' tarifte kritik benzerlik</b> tespit edildi (>%80). Onaylamadan önce teker teker incelemeni öneririm.</span>'
      + '</div>';
  }

  h += '<div class="arv-bulk-btns">'
    + '<button class="arv-btn-ghost" onclick="document.getElementById(\'arvBulkDialog\').remove()">Vazgeç</button>'
    + '<button class="arv-btn-green" onclick="_arvConfirmBulk()">'
    + '<iconify-icon icon="solar:check-read-bold" style="font-size:14px"></iconify-icon>Hepsini Onayla</button>'
    + '</div>'
    + '</div>';

  m.innerHTML = h;
  host.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _arvConfirmBulk() {
  var ids = Object.keys(_arv.selectedIds).filter(function(k){ return _arv.selectedIds[k]; });
  var approvedCount = 0;
  for (var i = 0; i < ids.length; i++) {
    var r = _arvRecipe(ids[i]);
    if (!r) continue;
    r.status = 'approved';
    (r.responseHistory = r.responseHistory || []).push({ action:'approved_bulk', at: new Date().toISOString(), by:'admin' });
    _arvLogNotification(ids[i], 'approved', 'Tarifiniz toplu inceleme ile doğrulandı ve yayına alındı.');
    approvedCount++;
  }

  _arv.selectedIds = {};
  _arv.bulkMode = false;
  var dlg = document.getElementById('arvBulkDialog');
  if (dlg) dlg.remove();

  if (typeof _admToast === 'function') _admToast('✓ ' + approvedCount + ' tarif toplu onaylandı · Bildirimler gönderildi', 'ok');
  _arvRender(document.getElementById('adminRecipesContainer'));
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

  // Footer aksiyonları (pending ve awaiting için)
  if (r.status === 'pending' || r.status === 'awaiting_response') {
    h += _arvRenderFooter(r);
  }

  // Aksiyon dialogu
  if (_arv.actionOpen) {
    h += _arvRenderActionDialog(r);
  }

  body.innerHTML = h;
}

/* ═══ P7 — Drawer Footer + Aksiyonlar ═══ */
function _arvRenderFooter(r) {
  return '<div class="arv-dr-footer">'
    + '<button class="arv-btn-danger" onclick="_arv.actionOpen=\'reject\';_arv.actionNote=\'\';_arvRenderDetail()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:14px"></iconify-icon>Reddet</button>'
    + '<button class="arv-btn-violet" onclick="_arv.actionOpen=\'edit\';_arv.actionNote=\'\';_arvRenderDetail()">'
    + '<iconify-icon icon="solar:pen-new-square-bold" style="font-size:14px"></iconify-icon>Düzenle İste</button>'
    + '<button class="arv-btn-green" onclick="_arvApproveRecipe(\'' + r.id + '\')">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px"></iconify-icon>Onayla & Yayınla</button>'
    + '</div>';
}

function _arvRenderActionDialog(r) {
  var isReject = _arv.actionOpen === 'reject';
  var title = isReject ? 'Tarifi Reddet' : 'Düzenleme İste';
  var hint = isReject
    ? 'Red gerekçesi kullanıcıya iletilecektir. Net ve yapıcı olun.'
    : 'Kullanıcı tarifi düzenleyip tekrar gönderecek. Hangi değişikliklerin gerektiğini yazın.';
  var placeholder = isReject
    ? 'Örn: Tarif zaten kayıtlı / Görsel uygun değil / Gıda güvenliği sakıncalı...'
    : 'Örn: Pişirme sıcaklığı eklenmeli, fotoğraf netleştirilmeli...';
  var color = isReject ? '#EF4444' : '#8B5CF6';
  var icon = isReject ? 'solar:close-circle-bold' : 'solar:pen-new-square-bold';

  return '<div class="arv-action-dialog">'
    + '<div class="arv-ad-card">'
    + '<div class="arv-ad-head" style="color:' + color + '">'
    + '<iconify-icon icon="' + icon + '" style="font-size:18px"></iconify-icon>'
    + '<span>' + title + '</span>'
    + '</div>'
    + '<textarea class="arv-ad-textarea" placeholder="' + placeholder + '" maxlength="300" '
    + 'oninput="_arv.actionNote=this.value" autofocus>' + _arvEsc(_arv.actionNote) + '</textarea>'
    + '<div class="arv-ad-hint">' + hint + '</div>'
    + '<div class="arv-ad-btns">'
    + '<button class="arv-btn-ghost" onclick="_arv.actionOpen=null;_arvRenderDetail()">Vazgeç</button>'
    + (isReject
        ? '<button class="arv-btn-danger" onclick="_arvRejectRecipe(\'' + r.id + '\')">'
          + '<iconify-icon icon="solar:close-circle-bold" style="font-size:13px"></iconify-icon>Reddet ve Gönder</button>'
        : '<button class="arv-btn-violet" onclick="_arvEditRequest(\'' + r.id + '\')">'
          + '<iconify-icon icon="solar:send-square-bold" style="font-size:13px"></iconify-icon>İsteği Gönder</button>')
    + '</div>'
    + '</div>'
    + '</div>';
}

/* ═══ Aksiyon İşleyicileri ═══ */
function _arvLogNotification(recipeId, type, note) {
  if (typeof ADMIN_RECIPE_NOTIFICATIONS === 'undefined') return;
  ADMIN_RECIPE_NOTIFICATIONS.unshift({
    id: 'ntf_' + Date.now().toString(36),
    recipeId: recipeId,
    type: type,           // 'approved' | 'edit_requested' | 'rejected'
    note: note || '',
    sentAt: new Date().toISOString()
  });
}

function _arvApproveRecipe(id) {
  var r = _arvRecipe(id);
  if (!r) return;
  r.status = 'approved';
  r.aiAllergens = _arv.editingAllergens.slice();
  r.allergens = _arv.editingAllergens.slice();
  (r.responseHistory = r.responseHistory || []).push({ action:'approved', at: new Date().toISOString(), by:'admin' });

  _arvLogNotification(id, 'approved',
    'Tarifiniz sistem tarafından doğrulandı ve yayına alındı. Topluluk artık tarifinizi keşfedebilir!');

  if (typeof _admToast === 'function') _admToast('✓ ' + (r.title || 'Tarif') + ' onaylandı · Kullanıcıya bildirim gitti', 'ok');
  _arvCloseDetail();
  _arvRender(document.getElementById('adminRecipesContainer'));
}

function _arvEditRequest(id) {
  var note = (_arv.actionNote || '').trim();
  if (note.length < 10) {
    if (typeof _admToast === 'function') _admToast('Not en az 10 karakter olmalı', 'err');
    return;
  }
  var r = _arvRecipe(id);
  if (!r) return;
  r.status = 'awaiting_response';
  r.editRequestNote = note;
  r.editRequestedAt = new Date().toISOString();
  (r.responseHistory = r.responseHistory || []).push({ action:'edit_requested', at: r.editRequestedAt, by:'admin', note: note });

  _arvLogNotification(id, 'edit_requested', note);

  if (typeof _admToast === 'function') _admToast('Düzenleme isteği kullanıcıya iletildi', 'ok');
  _arvCloseDetail();
  _arvRender(document.getElementById('adminRecipesContainer'));
}

function _arvRejectRecipe(id) {
  var note = (_arv.actionNote || '').trim();
  if (note.length < 10) {
    if (typeof _admToast === 'function') _admToast('Red gerekçesi en az 10 karakter olmalı', 'err');
    return;
  }
  var r = _arvRecipe(id);
  if (!r) return;
  r.status = 'rejected';
  r.rejectReason = note;
  r.rejectedAt = new Date().toISOString();
  (r.responseHistory = r.responseHistory || []).push({ action:'rejected', at: r.rejectedAt, by:'admin', note: note });

  _arvLogNotification(id, 'rejected', note);

  if (typeof _admToast === 'function') _admToast('Tarif reddedildi · Gerekçe kullanıcıya iletildi', 'err');
  _arvCloseDetail();
  _arvRender(document.getElementById('adminRecipesContainer'));
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

/* ═══════════════════════════════════════════════════════════
   Styles — P11.* parçalı
   ═══════════════════════════════════════════════════════════ */
function _arvInjectStyles() {
  if (document.getElementById('arvStyles')) return;
  var s = document.createElement('style');
  s.id = 'arvStyles';
  var parts = [];

  // P11.1 Header + tabs + search + layout
  parts.push(
    '.arv-wrap{display:flex;flex-direction:column;gap:12px;padding:0 0 20px}',
    '.arv-head{padding:10px 14px 4px}',
    '.arv-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:800;color:var(--text-primary)}',
    '.arv-sub{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '.arv-tabs{display:flex;gap:6px;padding:0 14px;overflow-x:auto;scrollbar-width:none}',
    '.arv-tabs::-webkit-scrollbar{display:none}',
    '.arv-tab{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:8px 12px;border:1.5px solid var(--border-soft);background:var(--bg-phone);color:var(--text-muted);border-radius:999px;font-size:11.5px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap}',
    '.arv-tab:active{transform:scale(.96)}',
    '.arv-tab.active{border-color:var(--tc,#F65013);background:color-mix(in srgb,var(--tc,#F65013) 12%,transparent);color:var(--tc,#F65013)}',
    '.arv-tab-count{padding:1px 7px;background:var(--bg-phone-secondary);color:var(--text-muted);border-radius:999px;font-size:10px;font-weight:800}',
    '.arv-tab.active .arv-tab-count{background:var(--tc,#F65013);color:#fff}',
    '.arv-search{display:flex;align-items:center;gap:8px;margin:0 14px;padding:9px 12px;background:var(--bg-phone-secondary);border-radius:10px}',
    '.arv-search input{flex:1;border:none;background:transparent;outline:none;color:var(--text-primary);font-size:13px;font-family:inherit}',
    '.arv-list-wrap{padding:0 14px}',
    '.arv-info-bar{display:flex;align-items:center;gap:7px;padding:9px 12px;background:var(--bg-phone-secondary);border-radius:10px;font-size:11.5px;color:var(--text-primary);font-weight:600;margin-bottom:10px}',
    '.arv-info-bar--red{background:rgba(239,68,68,.08);color:#B91C1C}',
    '.arv-empty{text-align:center;padding:42px 16px;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.arv-empty-sub{font-size:11.5px;opacity:.8;max-width:260px;line-height:1.4}',
    '.arv-placeholder{padding:40px;text-align:center;color:var(--text-muted);font-size:12px}',
    '.arv-cat-pill{font-size:10px;font-weight:700;color:#F65013;background:rgba(246,80,19,.1);padding:2px 7px;border-radius:999px;text-transform:capitalize}',
    '.arv-dot{color:var(--text-muted);opacity:.5}',
    '.arv-status-pill{font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:5px;letter-spacing:.3px;text-transform:uppercase;margin-left:auto}',
    '.arv-status-pill--pending{background:rgba(245,158,11,.14);color:#D97706}',
    '.arv-status-pill--awaiting{background:rgba(139,92,246,.14);color:#7C3AED}',
    '.arv-status-pill--rejected{background:rgba(239,68,68,.14);color:#DC2626}',
    '.arv-status-pill--stale{background:rgba(245,158,11,.14);color:#C2410C}'
  );

  // P11.2 List cards (approved / pending / awaiting / rejected + bulk bar)
  parts.push(
    '/* Approved grid */',
    '.arv-approved-grid{display:grid;grid-template-columns:1fr;gap:10px}',
    '.arv-a-card{display:grid;grid-template-columns:96px 1fr;gap:10px;background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .18s}',
    '.arv-a-card:active{transform:scale(.98)}',
    '.arv-a-img{min-height:96px;background-size:cover;background-position:center;background-color:var(--bg-phone-secondary)}',
    '.arv-a-body{padding:9px 10px 9px 0;display:flex;flex-direction:column;gap:4px;min-width:0}',
    '.arv-a-title{font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.arv-a-meta{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--text-muted)}',
    '.arv-a-meta span{display:inline-flex;align-items:center;gap:3px}',
    '.arv-a-date{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-muted)}',
    '.arv-a-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-top:3px}',
    '.arv-stat-cell{display:flex;align-items:center;justify-content:center;gap:3px;padding:3px 0;background:var(--bg-phone-secondary);border-radius:5px;font-size:10px;font-weight:700;color:var(--text-primary)}',
    '.arv-a-time{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-muted);margin-top:2px}',
    '.arv-a-time b{color:var(--text-primary);font-weight:700}',
    '/* Pending / Awaiting cards */',
    '.arv-pending-list{display:flex;flex-direction:column;gap:7px}',
    '.arv-pending-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;background:var(--bg-phone-secondary);border-radius:10px;margin-bottom:10px}',
    '.arv-bulk-toggle{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:var(--text-primary);cursor:pointer}',
    '.arv-bulk-toggle input{accent-color:#F65013}',
    '.arv-pending-count{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:var(--text-muted);font-weight:600}',
    '.arv-bulk-actions{display:flex;align-items:center;gap:6px;padding:9px 10px;background:rgba(246,80,19,.08);border:1px solid rgba(246,80,19,.22);border-radius:10px;margin-bottom:10px;flex-wrap:wrap}',
    '.arv-bulk-selcnt{font-size:11.5px;color:var(--text-primary);flex:1}',
    '.arv-bulk-selcnt b{font-weight:800;color:#F65013}',
    '.arv-btn-mini{padding:5px 9px;border:1px solid var(--border-soft);background:var(--bg-phone);color:var(--text-primary);border-radius:7px;font-size:10.5px;font-weight:700;cursor:pointer;font-family:inherit}',
    '.arv-btn-mini:active{transform:scale(.96)}',
    '.arv-btn-mini--sel{border-color:#F65013;color:#F65013}',
    '.arv-btn-mini--clr{color:var(--text-muted)}',
    '.arv-btn-mini--add{background:#8B5CF6;color:#fff;border-color:#8B5CF6}',
    '.arv-btn-bulk{padding:7px 12px;border:none;background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;border-radius:8px;font-size:11.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(34,197,94,.25);font-family:inherit}',
    '.arv-btn-bulk:active{transform:scale(.97)}',
    '.arv-p-card{display:flex;align-items:flex-start;gap:10px;padding:9px;background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;cursor:default}',
    '.arv-p-card:hover{border-color:var(--border-solid,#E5E7EB)}',
    '.arv-p-card.selected{border-color:#F65013;background:rgba(246,80,19,.04)}',
    '.arv-p-card--awaiting{border-left:3px solid #8B5CF6}',
    '.arv-p-check{flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.arv-p-rank{flex-shrink:0;width:28px;height:28px;background:var(--bg-phone-secondary);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800;color:var(--text-muted)}',
    '.arv-p-img{flex-shrink:0;width:56px;height:56px;background-size:cover;background-position:center;border-radius:10px;background-color:var(--bg-phone-secondary)}',
    '.arv-p-main{flex:1;min-width:0;cursor:pointer;padding:2px 0}',
    '.arv-p-title{font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.arv-p-meta{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--text-muted);margin-top:3px}',
    '.arv-p-meta span{display:inline-flex;align-items:center;gap:3px}',
    '.arv-p-note{display:flex;align-items:flex-start;gap:5px;margin-top:4px;padding:5px 7px;background:rgba(139,92,246,.06);border-left:2px solid #8B5CF6;border-radius:4px;font-size:10.5px;color:var(--text-primary);line-height:1.4}',
    '.arv-p-note span{flex:1}',
    '.arv-p-date{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-muted);margin-top:4px}',
    '/* Rejected list */',
    '.arv-rejected-list{display:flex;flex-direction:column;gap:8px}',
    '.arv-r-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .15s}',
    '.arv-r-card:active{transform:scale(.98)}',
    '.arv-r-head{display:flex;align-items:center;gap:10px;padding:10px}',
    '.arv-r-img{flex-shrink:0;width:48px;height:48px;background-size:cover;background-position:center;border-radius:8px;background-color:var(--bg-phone-secondary);filter:grayscale(.35)}',
    '.arv-r-title{font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.arv-r-meta{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--text-muted);margin-top:3px;flex-wrap:wrap}',
    '.arv-r-reason{display:flex;align-items:flex-start;gap:6px;padding:9px 11px;background:rgba(239,68,68,.06);border-top:1px dashed rgba(239,68,68,.25);font-size:11.5px;color:#991B1B;line-height:1.5}',
    '.arv-r-reason span{flex:1;font-weight:500}'
  );

  // P11.3 Drawer + AI + Similar + Actions + Bulk modal
  parts.push(
    '/* Drawer */',
    '.arv-drawer-bd{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);opacity:0;transition:opacity .24s;z-index:95}',
    '.arv-drawer-bd.open{opacity:1}',
    '.arv-drawer{position:fixed;top:0;right:0;bottom:0;width:100%;max-width:440px;background:var(--bg-phone);transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1);z-index:96;display:flex;flex-direction:column;overflow:hidden}',
    '.arv-drawer.open{transform:translateX(0)}',
    '.arv-drawer > div{flex:1;overflow-y:auto}',
    '.arv-dr-hero{position:relative;height:160px;background-size:cover;background-position:center;background-color:#1F2937}',
    '.arv-dr-close{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2}',
    '.arv-dr-close:active{transform:scale(.92)}',
    '.arv-dr-hero-grad{position:absolute;left:0;right:0;bottom:0;padding:14px 14px 12px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.75));color:#fff;display:flex;flex-direction:column;gap:5px}',
    '.arv-dr-status{align-self:flex-start;display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;box-shadow:0 2px 6px rgba(0,0,0,.22)}',
    '.arv-dr-title{font-size:18px;font-weight:800;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,.4)}',
    '.arv-dr-user{font-size:11px;opacity:.92;text-shadow:0 1px 2px rgba(0,0,0,.4);display:flex;align-items:center;gap:3px;flex-wrap:wrap}',
    '.arv-dr-body{padding:14px;display:flex;flex-direction:column;gap:12px}',
    '.arv-dr-section{display:flex;flex-direction:column;gap:7px}',
    '.arv-dr-sec-title{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;color:var(--text-muted)}',
    '.arv-dr-desc{font-size:12.5px;color:var(--text-primary);line-height:1.55}',
    '.arv-dr-ing-list{background:var(--bg-phone-secondary);border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:4px}',
    '.arv-dr-ing-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px dashed var(--border-soft)}',
    '.arv-dr-ing-row:last-child{border-bottom:none}',
    '.arv-dr-ing-row b{font-weight:700;color:var(--text-primary)}',
    '.arv-dr-steps{display:flex;flex-direction:column;gap:7px}',
    '.arv-dr-step{display:flex;gap:10px;padding:8px 10px;background:var(--bg-phone-secondary);border-radius:10px}',
    '.arv-dr-step-num{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#F65013;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}',
    '.arv-dr-step-txt{font-size:12px;color:var(--text-primary);line-height:1.5;flex:1}',
    '.arv-dr-media{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}',
    '.arv-dr-media-item{position:relative;aspect-ratio:1/1;background-size:cover;background-position:center;border-radius:8px;background-color:var(--bg-phone-secondary)}',
    '.arv-dr-media-item.flagged{outline:2px solid #EF4444;outline-offset:-2px}',
    '.arv-dr-flag{position:absolute;top:4px;left:4px;display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:#EF4444;color:#fff;border-radius:5px;font-size:9px;font-weight:800}',
    '/* Reject & Edit boxes */',
    '.arv-dr-reject-box,.arv-dr-edit-box{display:flex;align-items:flex-start;gap:8px;padding:11px;border-radius:10px;line-height:1.5}',
    '.arv-dr-reject-box{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22)}',
    '.arv-dr-edit-box{background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.22)}',
    '.arv-dr-box-lbl{font-size:10px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;color:var(--text-muted)}',
    '.arv-dr-box-txt{font-size:12px;color:var(--text-primary);margin-top:3px;line-height:1.5}',
    '.arv-dr-box-sub{font-size:10.5px;color:var(--text-muted);margin-top:3px}',
    '/* AI panel */',
    '.arv-dr-ai{background:linear-gradient(135deg,rgba(139,92,246,.05),rgba(59,130,246,.05));border:1px solid rgba(139,92,246,.22);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:9px}',
    '.arv-dr-ai-head{display:flex;align-items:center;gap:8px}',
    '.arv-dr-ai-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;border-radius:999px;font-size:9.5px;font-weight:800;letter-spacing:.5px}',
    '.arv-dr-ai-title{font-size:12.5px;font-weight:700;color:var(--text-primary)}',
    '.arv-ai-empty{display:flex;align-items:center;gap:6px;padding:8px;background:rgba(34,197,94,.08);border-radius:8px;font-size:11.5px;color:#166534}',
    '.arv-ai-chips{display:flex;flex-wrap:wrap;gap:5px}',
    '.arv-ai-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;background:rgba(139,92,246,.12);color:#7C3AED;border-radius:999px;font-size:11px;font-weight:700}',
    '.arv-ai-chip--risk{background:rgba(239,68,68,.14);color:#DC2626}',
    '.arv-ai-chip-x{background:none;border:none;color:inherit;cursor:pointer;padding:0;display:inline-flex;align-items:center;opacity:.65}',
    '.arv-ai-chip-x:hover{opacity:1}',
    '.arv-ai-add{display:flex;gap:5px}',
    '.arv-ai-add input{flex:1;padding:7px 10px;border:1.5px solid var(--border-soft);background:var(--bg-phone);border-radius:8px;font-size:11.5px;color:var(--text-primary);outline:none;font-family:inherit}',
    '.arv-ai-add input:focus{border-color:#8B5CF6}',
    '.arv-ai-hint{display:flex;align-items:flex-start;gap:5px;font-size:10px;color:var(--text-muted);line-height:1.45}',
    '/* Similar */',
    '.arv-dr-similar{background:var(--bg-phone-secondary);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:9px}',
    '.arv-dr-similar--danger{background:rgba(239,68,68,.06);border:1.5px solid rgba(239,68,68,.3);animation:arvSimPulse 2.4s ease-in-out infinite}',
    '@keyframes arvSimPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.22)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}',
    '.arv-sim-head{display:flex;flex-direction:column;gap:3px}',
    '.arv-sim-badge{align-self:flex-start;display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(59,130,246,.14);color:#2563EB;border-radius:999px;font-size:9.5px;font-weight:800;letter-spacing:.4px}',
    '.arv-sim-badge--danger{background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff}',
    '.arv-sim-title{font-size:12px;font-weight:700;color:var(--text-primary)}',
    '.arv-sim-danger-msg{display:flex;align-items:flex-start;gap:6px;padding:8px 10px;background:rgba(239,68,68,.08);border-radius:8px;font-size:11px;color:#991B1B;line-height:1.45}',
    '.arv-sim-list{display:flex;flex-direction:column;gap:6px}',
    '.arv-sim-row{display:flex;align-items:center;gap:9px;padding:7px;background:var(--bg-phone);border-radius:8px}',
    '.arv-sim-img{flex-shrink:0;width:38px;height:38px;background-size:cover;background-position:center;border-radius:7px;background-color:var(--bg-phone-secondary)}',
    '.arv-sim-name{font-size:11.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.arv-sim-user{font-size:10px;color:var(--text-muted)}',
    '.arv-sim-bar-wrap{display:flex;align-items:center;gap:6px;margin-top:3px}',
    '.arv-sim-bar{flex:1;height:4px;background:var(--bg-phone-secondary);border-radius:999px;overflow:hidden}',
    '.arv-sim-bar-fill{height:100%;border-radius:999px;transition:width .3s}',
    '.arv-sim-pct{font-size:10.5px;font-weight:800;min-width:34px;text-align:right;font-variant-numeric:tabular-nums}',
    '/* Drawer footer */',
    '.arv-dr-footer{position:sticky;bottom:0;display:flex;gap:6px;padding:10px 12px;background:var(--bg-phone);border-top:1px solid var(--border-soft);z-index:2}',
    '.arv-dr-footer button{flex:1;padding:10px;border:none;border-radius:10px;font-size:11.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;transition:transform .15s}',
    '.arv-dr-footer button:active{transform:scale(.97)}',
    '.arv-btn-danger{background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;box-shadow:0 2px 6px rgba(239,68,68,.25)}',
    '.arv-btn-violet{background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;box-shadow:0 2px 6px rgba(139,92,246,.25)}',
    '.arv-btn-green{background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;box-shadow:0 2px 6px rgba(34,197,94,.25)}',
    '.arv-btn-ghost{padding:10px;border:1px solid var(--border-soft);background:var(--bg-phone);color:var(--text-muted);border-radius:10px;font-size:11.5px;font-weight:600;cursor:pointer;font-family:inherit}',
    '.arv-btn-ghost:active{transform:scale(.97)}',
    '/* Action dialog (inside drawer body) */',
    '.arv-action-dialog{position:absolute;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:flex-end;z-index:3;padding:14px}',
    '.arv-ad-card{width:100%;background:var(--bg-phone);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:9px;box-shadow:0 6px 24px rgba(0,0,0,.2);animation:arvSlide .22s ease}',
    '@keyframes arvSlide{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.arv-ad-head{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:800}',
    '.arv-ad-textarea{width:100%;min-height:84px;padding:10px 11px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);border-radius:10px;color:var(--text-primary);font-size:12.5px;outline:none;font-family:inherit;resize:vertical;line-height:1.5}',
    '.arv-ad-textarea:focus{border-color:#8B5CF6}',
    '.arv-ad-hint{font-size:10.5px;color:var(--text-muted);line-height:1.4}',
    '.arv-ad-btns{display:flex;gap:7px;margin-top:3px}',
    '.arv-ad-btns button{flex:1}',
    '.arv-ad-btns .arv-btn-ghost{flex:0.6}',
    '/* Bulk dialog */',
    '.arv-bulk-dialog{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:97;padding:16px;opacity:0;transition:opacity .22s}',
    '.arv-bulk-dialog.open{opacity:1}',
    '.arv-bulk-card{width:100%;max-width:420px;background:var(--bg-phone);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:11px;max-height:82vh;overflow-y:auto;transform:scale(.95);transition:transform .24s cubic-bezier(.2,.9,.25,1)}',
    '.arv-bulk-dialog.open .arv-bulk-card{transform:scale(1)}',
    '.arv-bulk-head{display:flex;align-items:center;gap:10px}',
    '.arv-bulk-title{font-size:15px;font-weight:800;color:var(--text-primary)}',
    '.arv-bulk-sub{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '.arv-bulk-list{display:flex;flex-direction:column;gap:6px;background:var(--bg-phone-secondary);border-radius:10px;padding:8px}',
    '.arv-bulk-row{display:flex;align-items:center;gap:8px;padding:4px}',
    '.arv-bulk-img{flex-shrink:0;width:34px;height:34px;background-size:cover;background-position:center;border-radius:6px;background-color:var(--bg-phone)}',
    '.arv-bulk-name{font-size:12px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.arv-bulk-user{font-size:10.5px;color:var(--text-muted)}',
    '.arv-bulk-more{font-size:10.5px;color:var(--text-muted);padding:4px 4px 2px;text-align:center;font-style:italic}',
    '.arv-bulk-warn{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.22);border-radius:10px;font-size:11px;color:#991B1B;line-height:1.45}',
    '.arv-bulk-warn b{font-weight:700}',
    '.arv-bulk-btns{display:flex;gap:7px;margin-top:2px}',
    '.arv-bulk-btns .arv-btn-ghost{flex:1}',
    '.arv-bulk-btns .arv-btn-green{flex:1.6}'
  );

  s.textContent = parts.join('\n');
  document.head.appendChild(s);
}

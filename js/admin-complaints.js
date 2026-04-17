/* ═══════════════════════════════════════════════════════════
   ADMIN COMPLAINTS — Şikayet Paneli
   (Liste • Dinamik kanıt paneli • Karar alanı • Kara Liste
    kısayolu • Beyaz/gri fon + mor aksan)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _arp = {
  search: '',
  statusFilter: '',            // '' | 'pending' | 'resolved'
  categoryFilter: '',          // '' | 'order' | 'content' | 'user'

  detailId: null,
  formDirty: false,
  formAdminNote: '',
  formUserNote: ''
};

/* ═══ Overlay Aç ═══ */
function _admOpenComplaints() {
  _admInjectStyles();
  _arpInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_arpCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Şikayet Paneli</div>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">İhlal raporları ve karar merkezi</div>'
    + '</div>'
    + '</div>'
    + '<div id="adminComplaintsContainer" style="flex:1"></div>';
  adminPhone.appendChild(overlay);

  _arp.search = '';
  _arp.statusFilter = '';
  _arp.categoryFilter = '';

  renderAdminComplaints();
}

function _arpCloseOverlay() {
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var o = adminPhone.querySelector('.prof-overlay');
  if (o) o.remove();
  _arpCloseDetail();
}

/* ═══ Ana Render ═══ */
function renderAdminComplaints() {
  var c = document.getElementById('adminComplaintsContainer');
  if (!c) return;
  var h = '<div class="adm-fadeIn" style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px">';
  h += _arpRenderSummary();
  h += _arpRenderFilters();
  h += _arpRenderList();
  h += '</div>';
  c.innerHTML = h;
}

/* ═══ Helpers ═══ */
function _arpEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _arpCategory(id) {
  for (var i = 0; i < ADMIN_COMPLAINT_CATEGORIES.length; i++) {
    if (ADMIN_COMPLAINT_CATEGORIES[i].id === id) return ADMIN_COMPLAINT_CATEGORIES[i];
  }
  return { id: id, label: id, icon: 'solar:document-bold', color: '#6B7280' };
}

function _arpDate(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' }) + ' · ' + d.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' });
  } catch (e) { return iso; }
}

function _arpSetSearch(v) { _arp.search = v; renderAdminComplaints(); }
function _arpSetStatus(v) { _arp.statusFilter = _arp.statusFilter === v ? '' : v; renderAdminComplaints(); }
function _arpSetCategory(v) { _arp.categoryFilter = _arp.categoryFilter === v ? '' : v; renderAdminComplaints(); }

/* ═══════════════════════════════════════
   P2 — Özet + Filtreler
   ═══════════════════════════════════════ */
function _arpRenderSummary() {
  var total = ADMIN_REPORTS.length;
  var pending = ADMIN_REPORTS.filter(function(r) { return r.status === 'pending'; }).length;
  var resolved = ADMIN_REPORTS.filter(function(r) { return r.status === 'resolved'; }).length;

  return '<div class="arp-summary">'
    + '<div class="arp-sum-item arp-sum-item--pending">'
    + '<iconify-icon icon="solar:clock-circle-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="arp-sum-val">' + pending + '</div><div class="arp-sum-lbl">Bekleyen</div></div>'
    + (pending > 0 ? '<div class="arp-pulse"></div>' : '')
    + '</div>'
    + '<div class="arp-sum-item arp-sum-item--resolved">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="arp-sum-val">' + resolved + '</div><div class="arp-sum-lbl">Çözüldü</div></div>'
    + '</div>'
    + '<div class="arp-sum-item arp-sum-item--total">'
    + '<iconify-icon icon="solar:document-text-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="arp-sum-val">' + total + '</div><div class="arp-sum-lbl">Toplam</div></div>'
    + '</div>'
    + '</div>';
}

function _arpRenderFilters() {
  var h = '<div style="display:flex;flex-direction:column;gap:8px">';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="arp-search" placeholder="Şikayet ID veya kullanıcı adı..." value="' + _arpEsc(_arp.search) + '" oninput="_arpSetSearch(this.value)" />'
    + '</div>';

  // Status chip row
  h += '<div class="arp-chip-row">'
    + '<span class="arp-chip-label">Durum:</span>'
    + '<button class="arp-chip' + (!_arp.statusFilter ? ' active' : '') + '" onclick="_arpSetStatus(\'\')">Tümü</button>'
    + '<button class="arp-chip arp-chip--pending' + (_arp.statusFilter === 'pending' ? ' active' : '') + '" onclick="_arpSetStatus(\'pending\')">'
    + '<iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>Bekliyor</button>'
    + '<button class="arp-chip arp-chip--resolved' + (_arp.statusFilter === 'resolved' ? ' active' : '') + '" onclick="_arpSetStatus(\'resolved\')">'
    + '<iconify-icon icon="solar:check-circle-linear" style="font-size:11px"></iconify-icon>Çözüldü</button>'
    + '</div>';

  // Category chip row
  h += '<div class="arp-chip-row">'
    + '<span class="arp-chip-label">Kategori:</span>'
    + '<button class="arp-chip' + (!_arp.categoryFilter ? ' active' : '') + '" onclick="_arpSetCategory(\'\')">Tümü</button>';
  for (var i = 0; i < ADMIN_COMPLAINT_CATEGORIES.length; i++) {
    var c = ADMIN_COMPLAINT_CATEGORIES[i];
    var sel = _arp.categoryFilter === c.id;
    h += '<button class="arp-chip' + (sel ? ' active' : '') + '" '
      + 'style="' + (sel ? 'border-color:' + c.color + ';background:' + c.color + '18;color:' + c.color : '') + '" '
      + 'onclick="_arpSetCategory(\'' + c.id + '\')">'
      + '<iconify-icon icon="' + c.icon + '" style="font-size:11px"></iconify-icon>'
      + c.label.replace(' Şikayeti', '').replace(' Davranışı', '') + '</button>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   P3 — Liste & Kartlar
   ═══════════════════════════════════════ */
function _arpRenderList() {
  var list = ADMIN_REPORTS.slice();

  if (_arp.statusFilter) list = list.filter(function(r) { return r.status === _arp.statusFilter; });
  if (_arp.categoryFilter) list = list.filter(function(r) { return r.category === _arp.categoryFilter; });
  if (_arp.search.trim()) {
    var q = _arp.search.toLowerCase().trim();
    list = list.filter(function(r) {
      return r.id.toLowerCase().indexOf(q) > -1
        || (r.reportedBy && r.reportedBy.toLowerCase().indexOf(q) > -1)
        || (r.subject && r.subject.toLowerCase().indexOf(q) > -1)
        || (r.target && r.target.toLowerCase().indexOf(q) > -1);
    });
  }
  // Kronolojik: en yeni üstte
  list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + list.length + ' şikayet</div>'
    + '</div>';

  if (list.length === 0) {
    h += '<div class="arp-empty">'
      + '<iconify-icon icon="solar:shield-check-bold" style="font-size:44px;color:#22C55E;opacity:0.5"></iconify-icon>'
      + '<div>Eşleşen şikayet yok</div>'
      + '</div>';
    return h;
  }

  h += '<div style="display:flex;flex-direction:column;gap:8px">';
  for (var i = 0; i < list.length; i++) {
    h += _arpListCard(list[i]);
  }
  h += '</div>';
  return h;
}

function _arpListCard(r) {
  var cat = _arpCategory(r.category);
  var isPending = r.status === 'pending';
  var statusColor = isPending ? '#EF4444' : '#22C55E';
  var statusLabel = isPending ? 'Çözüm Bekliyor' : 'Çözüldü';

  return '<div class="arp-card' + (isPending ? ' arp-card--pending' : '') + '" onclick="_arpOpenDetail(\'' + r.id + '\')">'
    + '<div class="arp-card-cat" style="background:' + cat.color + '18;color:' + cat.color + '">'
    + '<iconify-icon icon="' + cat.icon + '" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div class="arp-card-body">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="arp-card-id">' + _arpEsc(r.id.toUpperCase()) + '</span>'
    + '<span class="arp-card-sep">·</span>'
    + '<span class="arp-card-cat-lbl" style="color:' + cat.color + '">' + _arpEsc(cat.label) + '</span>'
    + '</div>'
    + '<div class="arp-card-subject">' + _arpEsc(r.subject || r.target || '—') + '</div>'
    + '<div class="arp-card-meta">'
    + '<span><iconify-icon icon="solar:user-linear" style="font-size:11px"></iconify-icon>' + _arpEsc(r.reportedBy) + '</span>'
    + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:11px"></iconify-icon>' + _arpDate(r.date).split(' ·')[0] + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="arp-card-side">'
    + '<span class="arp-status-badge' + (isPending ? ' arp-status-badge--pending' : ' arp-status-badge--resolved') + '" style="background:' + statusColor + '18;color:' + statusColor + '">'
    + (isPending ? '<span class="arp-pulse-dot" style="background:' + statusColor + '"></span>' : '<iconify-icon icon="solar:check-circle-bold" style="font-size:10px"></iconify-icon>')
    + statusLabel + '</span>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted);margin-top:auto"></iconify-icon>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P4 — Detay Overlay + Dinamik Kanıt Paneli
   ═══════════════════════════════════════ */
function _arpOpenDetail(id) {
  _arpCloseDetail();
  var r = ADMIN_REPORTS.find(function(x) { return x.id === id; });
  if (!r) { _admToast('Şikayet bulunamadı', 'err'); return; }
  _arp.detailId = id;
  _arp.formAdminNote = r.adminNote || '';
  _arp.formUserNote = r.userNote || '';
  _arp.formDirty = false;

  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var d = document.createElement('div');
  d.id = 'arpDetail';
  d.className = 'prof-overlay open';
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:82;animation:admFadeIn .3s ease;overflow-y:auto';
  adminPhone.appendChild(d);
  _arpRenderDetail();
}

function _arpCloseDetail() {
  var d = document.getElementById('arpDetail');
  if (!d) return;
  d.style.opacity = '0';
  setTimeout(function() { if (d.parentNode) d.remove(); }, 180);
  _arp.detailId = null;
  _arp.formDirty = false;
}

function _arpRenderDetail() {
  var d = document.getElementById('arpDetail');
  if (!d) return;
  var r = ADMIN_REPORTS.find(function(x) { return x.id === _arp.detailId; });
  if (!r) return;
  var cat = _arpCategory(r.category);
  var isPending = r.status === 'pending';

  var h = '';

  // Sticky header
  h += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:5">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_arpCloseDetail()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + _arpEsc(r.id.toUpperCase()) + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + _arpDate(r.date) + '</div>'
    + '</div>'
    + '<span class="arp-status-badge" style="background:' + (isPending ? '#EF444418;color:#EF4444' : '#22C55E18;color:#22C55E') + '">'
    + (isPending ? '<span class="arp-pulse-dot" style="background:#EF4444"></span>Bekliyor' : '<iconify-icon icon="solar:check-circle-bold" style="font-size:10px"></iconify-icon>Çözüldü')
    + '</span>'
    + '</div>';

  // Content
  h += '<div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px">';

  // Başlık Kartı
  h += '<div class="arp-head-card">'
    + '<div class="arp-head-cat" style="background:' + cat.color + '18;color:' + cat.color + '">'
    + '<iconify-icon icon="' + cat.icon + '" style="font-size:22px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="arp-head-cat-lbl" style="color:' + cat.color + '">' + _arpEsc(cat.label) + '</div>'
    + '<div class="arp-head-subject">' + _arpEsc(r.subject || r.target || '—') + '</div>'
    + (r.description ? '<div class="arp-head-desc">' + _arpEsc(r.description) + '</div>' : '')
    + '</div>'
    + '</div>';

  // Reporter kartı
  h += '<div class="arp-sect">'
    + '<div class="arp-sect-head"><iconify-icon icon="solar:user-check-bold" style="font-size:15px;color:#22C55E"></iconify-icon><span>Şikayet Eden</span></div>'
    + '<div class="arp-reporter">'
    + '<div class="arp-reporter-avatar">' + _arpEsc((r.reportedBy || '?').charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="arp-reporter-name">' + _arpEsc(r.reportedBy || '—') + '</div>'
    + '<div class="arp-reporter-meta">' + (r.reporterId ? _arpEsc(r.reporterId) + ' · ' : '') + _arpDate(r.date) + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';

  // ── Dinamik Kanıt Paneli
  h += '<div class="arp-sect arp-sect--evidence">'
    + '<div class="arp-sect-head"><iconify-icon icon="solar:documents-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Kanıt Paneli</span>'
    + '<span class="arp-evidence-tag">' + _arpEsc(cat.label) + '</span></div>';

  h += _arpRenderEvidence(r);

  h += '</div>';

  // Zaten çözülmüş — notlar readonly göster
  if (!isPending) {
    h += '<div class="arp-sect arp-sect--resolved">'
      + '<div class="arp-sect-head"><iconify-icon icon="solar:check-circle-bold" style="font-size:15px;color:#22C55E"></iconify-icon>'
      + '<span>Karar & Notlar</span>'
      + (r.resolvedAt ? '<span class="arp-evidence-tag" style="background:#22C55E18;color:#22C55E">' + _arpDate(r.resolvedAt) + '</span>' : '') + '</div>'
      + '<div class="arp-note-box">'
      + '<div class="arp-note-lbl"><iconify-icon icon="solar:shield-user-linear" style="font-size:11px"></iconify-icon>Admin Özel Notu</div>'
      + '<div class="arp-note-text">' + (r.adminNote ? _arpEsc(r.adminNote) : '<i>Not yok</i>') + '</div>'
      + '</div>'
      + '<div class="arp-note-box arp-note-box--user">'
      + '<div class="arp-note-lbl"><iconify-icon icon="solar:letter-linear" style="font-size:11px"></iconify-icon>Kullanıcıya İletilen</div>'
      + '<div class="arp-note-text">' + (r.userNote ? _arpEsc(r.userNote) : '<i>Not yok</i>') + '</div>'
      + '</div>'
      + '<button class="arp-reopen" onclick="_arpReopen(\'' + r.id + '\')">'
      + '<iconify-icon icon="solar:refresh-circle-linear" style="font-size:14px"></iconify-icon>Yeniden Aç</button>'
      + '</div>';
  } else {
    h += _arpRenderDecisionPanel(r);
  }

  h += '</div>';
  d.innerHTML = h;
  d.scrollTop = 0;
}

function _arpRenderEvidence(r) {
  var e = r.evidence;
  if (!e) {
    return '<div class="arp-empty-mini">Kanıt eklenmemiş</div>';
  }

  if (e.kind === 'order') return _arpEvOrder(e);
  if (e.kind === 'post') return _arpEvPost(e);
  if (e.kind === 'story') return _arpEvStory(e);
  if (e.kind === 'review') return _arpEvReview(e, r);
  if (e.kind === 'recipe') return _arpEvRecipe(e);
  if (e.kind === 'user') return _arpEvUser(e);
  return '<div class="arp-empty-mini">Tanımsız kanıt türü: ' + _arpEsc(e.kind) + '</div>';
}

function _arpEvOrder(e) {
  var h = '<div class="arp-ev-order">'
    + '<div class="arp-ev-order-head">'
    + '<iconify-icon icon="solar:bag-check-bold" style="font-size:16px;color:#3B82F6"></iconify-icon>'
    + '<span class="arp-ev-order-id">' + _arpEsc(e.orderId) + '</span>'
    + '<span class="arp-ev-order-total">₺' + e.total + '</span>'
    + '</div>'
    + '<div class="arp-ev-biz">'
    + '<iconify-icon icon="solar:shop-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
    + _arpEsc(e.business) + (e.branch ? ' · ' + _arpEsc(e.branch) : '') + '</div>'
    + '<div class="arp-ev-items">';
  for (var i = 0; i < (e.items || []).length; i++) {
    h += '<div class="arp-ev-item"><iconify-icon icon="solar:checklist-minimalistic-linear" style="font-size:11px;color:var(--text-muted)"></iconify-icon>' + _arpEsc(e.items[i]) + '</div>';
  }
  h += '</div>'
    + '<div class="arp-ev-meta">';
  if (e.courier) h += '<span><iconify-icon icon="solar:scooter-linear" style="font-size:11px"></iconify-icon>' + _arpEsc(e.courier) + '</span>';
  if (e.deliveredAt) h += '<span><iconify-icon icon="solar:check-circle-linear" style="font-size:11px"></iconify-icon>' + _arpDate(e.deliveredAt) + '</span>';
  if (e.cancelReason) h += '<span style="color:#EF4444"><iconify-icon icon="solar:close-circle-linear" style="font-size:11px"></iconify-icon>İptal: ' + _arpEsc(e.cancelReason) + '</span>';
  if (e.paymentMethod) h += '<span><iconify-icon icon="solar:card-linear" style="font-size:11px"></iconify-icon>' + _arpEsc(e.paymentMethod) + '</span>';
  if (e.menuPrice && e.chargedPrice) h += '<span style="color:#EF4444"><iconify-icon icon="solar:danger-linear" style="font-size:11px"></iconify-icon>Menü: ₺' + e.menuPrice + ' vs Kesilen: ₺' + e.chargedPrice + '</span>';
  h += '</div></div>';
  return h;
}

function _arpEvPost(e) {
  return '<div class="arp-ev-post">'
    + '<div class="arp-ev-author">'
    + '<div class="arp-ev-author-avatar">' + _arpEsc(e.authorName.charAt(0)) + '</div>'
    + '<div><div class="arp-ev-author-name">' + _arpEsc(e.authorName) + '</div>'
    + '<div class="arp-ev-author-handle">' + _arpEsc(e.authorHandle || '') + ' · ' + _arpDate(e.postedAt) + '</div></div>'
    + '</div>'
    + (e.image ? '<div class="arp-ev-image"><iconify-icon icon="solar:gallery-bold" style="font-size:24px;color:var(--text-muted)"></iconify-icon><span>' + _arpEsc(e.image) + '</span></div>' : '')
    + '<div class="arp-ev-text">' + _arpEsc(e.text) + '</div>'
    + '<div class="arp-ev-stats">'
    + '<span><iconify-icon icon="solar:heart-linear" style="font-size:11px"></iconify-icon>' + (e.likes || 0) + '</span>'
    + '<span><iconify-icon icon="solar:chat-round-linear" style="font-size:11px"></iconify-icon>' + (e.comments || 0) + '</span>'
    + '</div>'
    + '</div>';
}

function _arpEvStory(e) {
  return '<div class="arp-ev-story">'
    + '<div class="arp-ev-author">'
    + '<div class="arp-ev-author-avatar" style="background:linear-gradient(135deg,#F59E0B,#EF4444)">' + _arpEsc(e.authorName.charAt(0)) + '</div>'
    + '<div><div class="arp-ev-author-name">' + _arpEsc(e.authorName) + '</div>'
    + '<div class="arp-ev-author-handle">' + _arpEsc(e.authorHandle || '') + ' · ' + _arpDate(e.postedAt) + (e.expired ? ' · <span style="color:#EF4444">süresi dolmuş</span>' : '') + '</div></div>'
    + '</div>'
    + '<div class="arp-ev-story-frame">'
    + '<iconify-icon icon="solar:gallery-wide-bold" style="font-size:32px;color:#F59E0B;opacity:0.5"></iconify-icon>'
    + '<div class="arp-ev-story-text">' + _arpEsc(e.text) + '</div>'
    + (e.image ? '<div class="arp-ev-story-img">' + _arpEsc(e.image) + '</div>' : '')
    + '</div></div>';
}

function _arpEvReview(e, report) {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<iconify-icon icon="' + (i <= e.rating ? 'solar:star-bold' : 'solar:star-linear') + '" style="font-size:12px;color:' + (i <= e.rating ? '#F59E0B' : 'var(--border-subtle)') + '"></iconify-icon>';
  }
  return '<div class="arp-ev-post">'
    + '<div class="arp-ev-author">'
    + '<div class="arp-ev-author-avatar">' + _arpEsc(e.reviewerName.charAt(0)) + '</div>'
    + '<div><div class="arp-ev-author-name">' + _arpEsc(e.reviewerName) + '</div>'
    + '<div class="arp-ev-author-handle">' + _arpEsc(e.business || report.business || '') + ' · ' + _arpDate(e.postedAt) + '</div></div>'
    + '<div style="display:flex;gap:1px">' + stars + '</div>'
    + '</div>'
    + '<div class="arp-ev-text" style="font-style:italic;border-left:3px solid #EF4444;padding-left:10px">"' + _arpEsc(e.text) + '"</div>'
    + '</div>';
}

function _arpEvRecipe(e) {
  return '<div class="arp-ev-recipe">'
    + '<div class="arp-ev-recipe-img"><iconify-icon icon="solar:chef-hat-bold" style="font-size:32px;color:#F65013"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="arp-ev-recipe-title">' + _arpEsc(e.title) + '</div>'
    + '<div class="arp-ev-author-handle">' + _arpEsc(e.authorName) + ' ' + _arpEsc(e.authorHandle || '') + ' · ' + _arpDate(e.postedAt) + '</div>'
    + '<div class="arp-ev-recipe-meta">'
    + '<span><iconify-icon icon="solar:bag-4-linear" style="font-size:11px"></iconify-icon>' + e.ingredients + ' malzeme</span>'
    + '<span><iconify-icon icon="solar:list-linear" style="font-size:11px"></iconify-icon>' + e.steps + ' adım</span>'
    + '</div>'
    + '</div></div>';
}

function _arpEvUser(e) {
  var h = '<div class="arp-ev-user">'
    + '<div class="arp-ev-user-head">'
    + '<div class="arp-ev-author-avatar" style="background:linear-gradient(135deg,#EF4444,#F97316);width:44px;height:44px;font-size:18px">' + _arpEsc(e.userName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="arp-ev-author-name">' + _arpEsc(e.userName) + '</div>'
    + '<div class="arp-ev-author-handle">' + _arpEsc(e.userHandle || '') + (e.joinDate ? ' · üye: ' + _arpEsc(e.joinDate) : '') + '</div>'
    + '</div>'
    + '<button class="arp-quick-link" onclick="_arpJumpProfile(\'' + _arpEsc(e.userId) + '\')"><iconify-icon icon="solar:arrow-right-up-bold" style="font-size:12px"></iconify-icon>Profile Git</button>'
    + '</div>';

  if (e.messages && e.messages.length) {
    h += '<div class="arp-ev-user-sub"><iconify-icon icon="solar:chat-square-linear" style="font-size:11px"></iconify-icon>Son Mesaj Dökümü</div>';
    for (var i = 0; i < e.messages.length; i++) {
      var m = e.messages[i];
      h += '<div class="arp-ev-msg"><div class="arp-ev-msg-text">"' + _arpEsc(m.text) + '"</div>'
        + '<div class="arp-ev-msg-meta">' + _arpDate(m.date) + '</div></div>';
    }
  }
  if (e.comments && e.comments.length) {
    h += '<div class="arp-ev-user-sub"><iconify-icon icon="solar:chat-round-dots-linear" style="font-size:11px"></iconify-icon>Yorum Dökümü</div>';
    for (var j = 0; j < e.comments.length; j++) {
      var cm = e.comments[j];
      h += '<div class="arp-ev-msg"><div class="arp-ev-msg-on">' + _arpEsc(cm.on) + '</div><div class="arp-ev-msg-text">"' + _arpEsc(cm.text) + '"</div>'
        + '<div class="arp-ev-msg-meta">' + _arpDate(cm.date) + '</div></div>';
    }
  }
  if (e.notes) {
    h += '<div class="arp-ev-user-note">'
      + '<iconify-icon icon="solar:info-circle-linear" style="font-size:11px;color:var(--text-muted)"></iconify-icon>'
      + _arpEsc(e.notes) + '</div>';
  }

  h += '</div>';
  return h;
}

function _arpJumpProfile(userId) {
  _admToast('Kullanıcı profiline yönlendirme: ' + userId);
}

/* ═══════════════════════════════════════
   P5 — Karar Alanı + Kara Liste Kısayolu
   ═══════════════════════════════════════ */
function _arpRenderDecisionPanel(r) {
  var h = '<div class="arp-sect arp-sect--decision">'
    + '<div class="arp-sect-head"><iconify-icon icon="solar:gavel-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Karar & Notlandırma</span></div>'

    // Admin not
    + '<div class="arp-field">'
    + '<label><iconify-icon icon="solar:shield-user-linear" style="font-size:11px;color:#8B5CF6"></iconify-icon>Admin Özel Notu <span class="arp-lbl-hint">(sadece admin)</span></label>'
    + '<textarea class="arp-textarea arp-textarea--admin" placeholder="İç not, gözlem veya teknik referans..." oninput="_arp.formAdminNote=this.value;_arp.formDirty=true">' + _arpEsc(_arp.formAdminNote) + '</textarea>'
    + '</div>'

    // User not
    + '<div class="arp-field">'
    + '<label><iconify-icon icon="solar:letter-linear" style="font-size:11px;color:#22C55E"></iconify-icon>Kullanıcı Bilgilendirme Notu <span class="arp-lbl-hint">(şikayet edene iletilecek)</span></label>'
    + '<textarea class="arp-textarea" placeholder="Çözüm açıklaması — net, kibar..." oninput="_arp.formUserNote=this.value;_arp.formDirty=true">' + _arpEsc(_arp.formUserNote) + '</textarea>'
    + '</div>'

    // Kara Liste kısayolu
    + _arpBlacklistShortcut(r)

    // CTA
    + '<button class="arp-resolve" onclick="_arpResolve(\'' + r.id + '\')">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px"></iconify-icon>'
    + 'Çözüldü Olarak İşaretle ve Gönder</button>'

    + '</div>';

  return h;
}

function _arpBlacklistShortcut(r) {
  // Kara Liste'ye yönlendirmek için target belirle
  // user şikayeti → reported user'ı; order şikayeti → işletme; content şikayeti → yazar
  var target = null;
  if (r.category === 'user' && r.evidence && r.evidence.userId) {
    target = { type: 'user', id: r.evidence.userId, name: r.evidence.userName };
  } else if (r.category === 'order' && r.evidence && r.evidence.business) {
    target = { type: 'biz', id: null, name: r.evidence.business };
  } else if (r.category === 'content' && r.evidence && r.evidence.authorName) {
    // post/story/review/recipe — biz/user olabilir. Varsayılan: biz (işletme gönderisi baskın)
    target = { type: 'biz', id: null, name: r.evidence.authorName };
  }

  if (!target) return '';

  return '<div class="arp-bl-shortcut" onclick="_arpJumpBlacklist(\'' + _arpEsc(r.id) + '\')">'
    + '<iconify-icon icon="solar:user-block-rounded-bold" style="font-size:16px;color:#EF4444"></iconify-icon>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="arp-bl-title">Kara Liste\'de Ceza Tanımla</div>'
    + '<div class="arp-bl-sub">' + _arpEsc(target.name) + ' için ban / kısıtlama uygula</div>'
    + '</div>'
    + '<iconify-icon icon="solar:arrow-right-linear" style="font-size:14px;color:#EF4444"></iconify-icon>'
    + '</div>';
}

function _arpJumpBlacklist(reportId) {
  var r = ADMIN_REPORTS.find(function(x) { return x.id === reportId; });
  if (!r || typeof _admOpenBlacklist !== 'function') {
    _admToast('Kara Liste modülü yüklenmemiş', 'err');
    return;
  }

  var e = r.evidence || {};
  var target = null;
  if (r.category === 'user' && e.userId) {
    target = { type: 'user', id: e.userId, name: e.userName };
  } else if (r.category === 'order' && e.business) {
    var biz = (typeof ADMIN_BUSINESSES !== 'undefined') ? ADMIN_BUSINESSES.find(function(b) { return b.name === e.business; }) : null;
    target = { type: 'biz', id: biz ? biz.id : 'unknown', name: e.business };
  } else if (r.category === 'content' && e.authorName) {
    var biz2 = (typeof ADMIN_BUSINESSES !== 'undefined') ? ADMIN_BUSINESSES.find(function(b) { return b.name === e.authorName; }) : null;
    target = { type: 'biz', id: biz2 ? biz2.id : 'unknown', name: e.authorName };
  }

  _arpCloseDetail();
  _arpCloseOverlay();
  _admOpenBlacklist();

  // Wizard'ı hedef önceden seçili olarak başlat
  if (target && target.id) {
    setTimeout(function() {
      if (typeof _abl !== 'undefined' && typeof _ablMountWizard === 'function') {
        _abl.wizardStep = 2;
        _abl.wizardSubjectType = target.type;
        _abl.wizardSubject = { type: target.type, id: target.id, name: target.name };
        _abl.wizardEditingId = null;
        _abl.form = {
          type: 'restriction',
          reason: 'Kullanıcı şikayeti (çoklu)',
          customReason: '',
          expiresAt: '',
          userNote: '',
          adminNote: 'Şikayet referansı: ' + reportId.toUpperCase(),
          restrictions: []
        };
        _ablMountWizard();
      }
    }, 350);
  } else {
    _admToast('Kara Liste\'de subject manuel seçilmeli');
  }
}

function _arpResolve(id) {
  var r = ADMIN_REPORTS.find(function(x) { return x.id === id; });
  if (!r) return;

  if (!_arp.formUserNote.trim()) {
    if (!confirm('Kullanıcı bilgilendirme notu boş — yine de çözüldü olarak işaretlensin mi?')) return;
  }

  r.status = 'resolved';
  r.adminNote = _arp.formAdminNote;
  r.userNote = _arp.formUserNote;
  r.resolvedAt = new Date().toISOString();
  r.resolvedBy = 'Admin';

  _admToast('Şikayet çözüldü ve kullanıcıya iletildi', 'ok');
  _arpCloseDetail();
  renderAdminComplaints();
}

function _arpReopen(id) {
  var r = ADMIN_REPORTS.find(function(x) { return x.id === id; });
  if (!r) return;
  if (!confirm('Bu şikayeti yeniden açmak istiyor musun?')) return;
  r.status = 'pending';
  r.resolvedAt = null;
  r.resolvedBy = null;
  _admToast('Şikayet yeniden açıldı', 'ok');
  _arpCloseDetail();
  renderAdminComplaints();
}

/* ═══════════════════════════════════════
   P6 — Stiller (.arp-*)
   ═══════════════════════════════════════ */
function _arpInjectStyles() {
  if (document.getElementById('arpStyles')) return;
  var css = ''
    /* Summary */
    + '.arp-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}'
    + '.arp-sum-item{position:relative;display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);overflow:hidden}'
    + '.arp-sum-item--pending{border-color:rgba(239,68,68,0.3);background:linear-gradient(135deg,rgba(239,68,68,0.06),transparent)}'
    + '.arp-sum-item--pending iconify-icon{color:#EF4444}'
    + '.arp-sum-item--resolved{border-color:rgba(34,197,94,0.3);background:linear-gradient(135deg,rgba(34,197,94,0.06),transparent)}'
    + '.arp-sum-item--resolved iconify-icon{color:#22C55E}'
    + '.arp-sum-item--total iconify-icon{color:#8B5CF6}'
    + '.arp-sum-val{font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)}'
    + '.arp-sum-lbl{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px;text-transform:uppercase;letter-spacing:.3px}'
    + '.arp-pulse{position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:#EF4444;animation:arpPulse 1.5s ease-in-out infinite}'
    + '@keyframes arpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.25)}}'
    + '.arp-pulse-dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:3px;animation:arpPulse 1.5s ease-in-out infinite}'
    /* Search */
    + '.arp-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.arp-search:focus{border-color:#8B5CF6}'
    /* Chips */
    + '.arp-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.arp-chip-label{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px}'
    + '.arp-chip{padding:6px 11px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}'
    + '.arp-chip:hover{background:var(--bg-phone-secondary)}'
    + '.arp-chip.active{border-color:#8B5CF6;background:rgba(139,92,246,0.1);color:#8B5CF6}'
    + '.arp-chip--pending.active{border-color:#EF4444;background:rgba(239,68,68,0.1);color:#EF4444}'
    + '.arp-chip--resolved.active{border-color:#22C55E;background:rgba(34,197,94,0.1);color:#22C55E}'
    /* Empty */
    + '.arp-empty{padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--text-muted);font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font)}'
    + '.arp-empty-mini{padding:16px;text-align:center;font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted)}'
    /* List card */
    + '.arp-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;gap:10px;cursor:pointer;transition:all .15s}'
    + '.arp-card:hover{border-color:#8B5CF6;transform:translateY(-1px);box-shadow:0 4px 12px rgba(139,92,246,0.08)}'
    + '.arp-card--pending{border-left:3px solid #EF4444}'
    + '.arp-card-cat{width:40px;height:40px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.arp-card-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}'
    + '.arp-card-id{font:var(--fw-bold) 10px/1 var(--font);color:var(--text-muted);letter-spacing:.5px}'
    + '.arp-card-sep{color:var(--border-subtle)}'
    + '.arp-card-cat-lbl{font:var(--fw-semibold) 10px/1 var(--font);text-transform:uppercase;letter-spacing:.3px}'
    + '.arp-card-subject{font:var(--fw-semibold) var(--fs-xs)/1.3 var(--font);color:var(--text-primary);margin-top:2px}'
    + '.arp-card-meta{display:flex;gap:12px;flex-wrap:wrap;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.arp-card-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.arp-card-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}'
    /* Status badge */
    + '.arp-status-badge{font:var(--fw-semibold) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px;white-space:nowrap}';
  var s = document.createElement('style');
  s.id = 'arpStyles';
  s.textContent = css;
  document.head.appendChild(s);

  _arpInjectStylesPart2();
}

function _arpInjectStylesPart2() {
  if (document.getElementById('arpStyles2')) return;
  var css = ''
    /* Head card */
    + '.arp-head-card{display:flex;gap:12px;padding:14px;border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(139,92,246,0.05),transparent 70%);border:1px solid rgba(139,92,246,0.15)}'
    + '.arp-head-cat{width:48px;height:48px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.arp-head-cat-lbl{font:var(--fw-semibold) 10px/1 var(--font);text-transform:uppercase;letter-spacing:.4px}'
    + '.arp-head-subject{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);margin-top:6px}'
    + '.arp-head-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);margin-top:6px;padding:8px;background:var(--bg-phone-secondary);border-radius:var(--r-md);border-left:3px solid #8B5CF6}'
    /* Sect */
    + '.arp-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:10px}'
    + '.arp-sect--evidence{border-color:rgba(139,92,246,0.25);background:linear-gradient(135deg,rgba(139,92,246,0.02),transparent)}'
    + '.arp-sect--resolved{border-color:rgba(34,197,94,0.25);background:linear-gradient(135deg,rgba(34,197,94,0.03),transparent)}'
    + '.arp-sect--decision{border-color:rgba(139,92,246,0.3)}'
    + '.arp-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.arp-sect-head span:first-of-type{flex:1}'
    + '.arp-evidence-tag{font:var(--fw-medium) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);background:rgba(139,92,246,0.12);color:#8B5CF6}'
    /* Reporter */
    + '.arp-reporter{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.arp-reporter-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 13px/1 var(--font);flex-shrink:0}'
    + '.arp-reporter-name{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.arp-reporter-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Evidence — Order */
    + '.arp-ev-order{display:flex;flex-direction:column;gap:8px}'
    + '.arp-ev-order-head{display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle)}'
    + '.arp-ev-order-id{flex:1;font:var(--fw-bold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.arp-ev-order-total{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#3B82F6}'
    + '.arp-ev-biz{display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)}'
    + '.arp-ev-items{display:flex;flex-direction:column;gap:3px;padding:6px 8px;background:var(--bg-phone-secondary);border-radius:var(--r-md)}'
    + '.arp-ev-item{display:inline-flex;align-items:center;gap:5px;font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary)}'
    + '.arp-ev-meta{display:flex;flex-wrap:wrap;gap:10px;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    + '.arp-ev-meta span{display:inline-flex;align-items:center;gap:3px}'
    /* Evidence — Post/Story/Review */
    + '.arp-ev-post,.arp-ev-story{display:flex;flex-direction:column;gap:8px}'
    + '.arp-ev-author{display:flex;align-items:center;gap:8px}'
    + '.arp-ev-author-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#06B6D4);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 12px/1 var(--font);flex-shrink:0}'
    + '.arp-ev-author-name{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)}'
    + '.arp-ev-author-handle{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.arp-ev-image{padding:24px;border-radius:var(--r-md);background:var(--bg-phone-secondary);text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}'
    + '.arp-ev-text{padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-primary)}'
    + '.arp-ev-stats{display:flex;gap:12px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}'
    + '.arp-ev-stats span{display:inline-flex;align-items:center;gap:3px}'
    /* Story frame */
    + '.arp-ev-story-frame{padding:16px;border-radius:var(--r-md);background:linear-gradient(135deg,#FEF3C7,#FED7AA);display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}'
    + '.arp-ev-story-text{font:var(--fw-semibold) 12px/1.3 var(--font);color:#78350F}'
    + '.arp-ev-story-img{font:var(--fw-regular) 10px/1 var(--font);color:#92400E;font-style:italic}'
    /* Recipe */
    + '.arp-ev-recipe{display:flex;gap:10px}'
    + '.arp-ev-recipe-img{width:60px;height:60px;border-radius:var(--r-md);background:linear-gradient(135deg,#FEF3C7,#FCD34D);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.arp-ev-recipe-title{font:var(--fw-bold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}'
    + '.arp-ev-recipe-meta{display:flex;gap:10px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:6px}'
    + '.arp-ev-recipe-meta span{display:inline-flex;align-items:center;gap:3px}'
    /* User evidence */
    + '.arp-ev-user{display:flex;flex-direction:column;gap:10px}'
    + '.arp-ev-user-head{display:flex;align-items:center;gap:10px}'
    + '.arp-quick-link{padding:5px 10px;border-radius:var(--r-full);border:1px solid #3B82F6;background:rgba(59,130,246,0.08);color:#3B82F6;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:3px}'
    + '.arp-quick-link:hover{background:#3B82F6;color:#fff}'
    + '.arp-ev-user-sub{display:flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-top:4px}'
    + '.arp-ev-msg{padding:8px 10px;border-left:3px solid #EF4444;background:rgba(239,68,68,0.04);border-radius:0 var(--r-md) var(--r-md) 0}'
    + '.arp-ev-msg-on{font:var(--fw-semibold) 10px/1 var(--font);color:#8B5CF6;margin-bottom:4px}'
    + '.arp-ev-msg-text{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-primary);font-style:italic}'
    + '.arp-ev-msg-meta{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.arp-ev-user-note{display:flex;align-items:flex-start;gap:6px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    /* Notes (readonly) */
    + '.arp-note-box{padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:3px solid #8B5CF6}'
    + '.arp-note-box--user{border-left-color:#22C55E}'
    + '.arp-note-lbl{display:flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px}'
    + '.arp-note-text{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    + '.arp-reopen{align-self:flex-start;padding:6px 12px;border-radius:var(--r-full);border:1px solid #F59E0B;background:rgba(245,158,11,0.08);color:#F59E0B;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.arp-reopen:hover{background:#F59E0B;color:#fff}'
    /* Form fields */
    + '.arp-field{display:flex;flex-direction:column;gap:5px}'
    + '.arp-field label{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.arp-lbl-hint{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:none;letter-spacing:0;opacity:0.85}'
    + '.arp-textarea{width:100%;box-sizing:border-box;min-height:72px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical;transition:border-color .15s}'
    + '.arp-textarea:focus{border-color:#22C55E}'
    + '.arp-textarea--admin{background:linear-gradient(135deg,rgba(139,92,246,0.04),transparent);border-color:rgba(139,92,246,0.25)}'
    + '.arp-textarea--admin:focus{border-color:#8B5CF6}'
    /* Blacklist shortcut */
    + '.arp-bl-shortcut{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(239,68,68,0.05),transparent);border:1px dashed rgba(239,68,68,0.35);cursor:pointer;transition:all .15s}'
    + '.arp-bl-shortcut:hover{background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(249,115,22,0.05));border-style:solid}'
    + '.arp-bl-title{font:var(--fw-semibold) 11px/1.2 var(--font);color:#EF4444}'
    + '.arp-bl-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Resolve CTA */
    + '.arp-resolve{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(34,197,94,0.35);transition:opacity .15s,transform .1s;margin-top:4px}'
    + '.arp-resolve:hover{opacity:0.92}'
    + '.arp-resolve:active{transform:scale(0.99)}';
  var s = document.createElement('style');
  s.id = 'arpStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

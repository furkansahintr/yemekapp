/* ═══════════════════════════════════════════════════════════
   ADMIN BIZ APPLICATIONS — İşletme Başvuru Merkezi
   (3-tab havuz • Belge denetim checklist • Eksik Bildir / Onayla)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _abz = {
  tab: 'pending',            // 'pending' | 'awaiting_response' | 'completed'
  search: '',
  detailId: null,
  docPreviewId: null,
  formAdminNote: '',
  formBusinessNote: ''
};

/* ═══ Overlay ═══ */
function _admOpenBizApps() {
  _admInjectStyles();
  _abzInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'abzOverlay';
  adminPhone.appendChild(overlay);

  _abz.tab = 'pending';
  _abz.search = '';
  _abzRender();
}

function _abzCloseOverlay() {
  var o = document.getElementById('abzOverlay');
  if (o) o.remove();
  _abzCloseDetail();
  _abzCloseDocPreview();
}

/* ═══ Ana Render ═══ */
function _abzRender() {
  var o = document.getElementById('abzOverlay');
  if (!o) return;

  var h = '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_abzCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:inbox-in-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İşletme Başvuruları</div>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Belge denetim ve onay süreci</div>'
    + '</div>'
    + '</div>';

  h += '<div id="abzBody" style="flex:1"></div>';
  o.innerHTML = h;

  _abzRenderBody();
}

function _abzRenderBody() {
  var body = document.getElementById('abzBody');
  if (!body) return;

  var h = '<div class="adm-fadeIn abz-wrap">';
  h += _abzRenderTabs();
  h += _abzRenderFilters();
  h += _abzRenderList();
  h += '</div>';
  body.innerHTML = h;
}

/* ═══ Helpers ═══ */
function _abzEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _abzDocType(id) {
  for (var i = 0; i < ADMIN_BIZ_APP_DOC_TYPES.length; i++) {
    if (ADMIN_BIZ_APP_DOC_TYPES[i].id === id) return ADMIN_BIZ_APP_DOC_TYPES[i];
  }
  return { id: id, label: id, icon: 'solar:document-bold', required: false };
}

function _abzStatusColor(s) {
  return s === 'pending' ? '#3B82F6'
    : s === 'awaiting_response' ? '#F97316'
    : '#22C55E';
}

function _abzStatusLabel(s) {
  return s === 'pending' ? 'Bekliyor'
    : s === 'awaiting_response' ? 'Cevap Bekliyor'
    : 'Tamamlandı';
}

function _abzDate(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' });
  } catch (e) { return iso; }
}

function _abzDaysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function _abzCountDocs(app) {
  var total = ADMIN_BIZ_APP_DOC_TYPES.length;
  var uploaded = 0;
  for (var i = 0; i < app.documents.length; i++) {
    if (app.documents[i].uploadedAt) uploaded++;
  }
  return { uploaded: uploaded, total: total };
}

function _abzSetTab(t) { _abz.tab = t; _abz.search = ''; _abzRenderBody(); }
function _abzSetSearch(v) { _abz.search = v; _abzRenderBody(); }

/* ═══════════════════════════════════════
   P2 — 3'lü Tab (Bekleyen/Cevap Bekleyen/Tamamlanan)
   ═══════════════════════════════════════ */
function _abzRenderTabs() {
  var pendingCount = ADMIN_BIZ_APPLICATIONS.filter(function(a) { return a.status === 'pending'; }).length;
  var awaitingCount = ADMIN_BIZ_APPLICATIONS.filter(function(a) { return a.status === 'awaiting_response'; }).length;
  var completedCount = ADMIN_BIZ_APPLICATIONS.filter(function(a) { return a.status === 'completed'; }).length;

  return '<div class="abz-tabs">'
    + _abzTabBtn('pending',           'Bekleyen',       'solar:clock-circle-bold', pendingCount, '#3B82F6')
    + _abzTabBtn('awaiting_response', 'Cevap Bekleyen', 'solar:letter-bold',       awaitingCount, '#F97316')
    + _abzTabBtn('completed',         'Tamamlanan',     'solar:check-circle-bold', completedCount, '#22C55E')
    + '</div>';
}

function _abzTabBtn(id, label, icon, count, color) {
  var sel = _abz.tab === id;
  return '<button class="abz-tab-btn' + (sel ? ' active' : '') + '" '
    + 'style="' + (sel ? '--abz-c:' + color : '') + '" '
    + 'onclick="_abzSetTab(\'' + id + '\')">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px' + (sel ? ';color:' + color : '') + '"></iconify-icon>'
    + '<span>' + label + '</span>'
    + '<span class="abz-tab-count"' + (sel ? ' style="background:' + color + ';color:#fff"' : '') + '>' + count + '</span>'
    + '</button>';
}

function _abzRenderFilters() {
  return '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="abz-search" placeholder="İşletme adı, sahip veya şehir..." value="' + _abzEsc(_abz.search) + '" oninput="_abzSetSearch(this.value)" />'
    + '</div>';
}

/* ═══════════════════════════════════════
   P3 — Liste Kartları
   ═══════════════════════════════════════ */
function _abzRenderList() {
  var list = ADMIN_BIZ_APPLICATIONS.filter(function(a) { return a.status === _abz.tab; });
  if (_abz.search.trim()) {
    var q = _abz.search.toLowerCase().trim();
    list = list.filter(function(a) {
      return a.bizName.toLowerCase().indexOf(q) > -1
        || (a.owner && a.owner.toLowerCase().indexOf(q) > -1)
        || (a.city && a.city.toLowerCase().indexOf(q) > -1);
    });
  }
  // En yeni üstte
  list.sort(function(a, b) { return new Date(b.appliedAt) - new Date(a.appliedAt); });

  var h = '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + list.length + ' başvuru</div>';

  if (list.length === 0) {
    h += '<div class="abz-empty">'
      + '<iconify-icon icon="solar:inbox-linear" style="font-size:48px;opacity:0.3"></iconify-icon>'
      + '<div>Bu kategoride başvuru yok</div></div>';
    return h;
  }

  h += '<div style="display:flex;flex-direction:column;gap:8px">';
  for (var i = 0; i < list.length; i++) h += _abzAppCard(list[i]);
  h += '</div>';
  return h;
}

function _abzAppCard(a) {
  var color = _abzStatusColor(a.status);
  var docCount = _abzCountDocs(a);
  var daysSince = _abzDaysSince(a.appliedAt);
  var issues = 0;
  for (var i = 0; i < a.documents.length; i++) {
    if (a.documents[i].flaggedIssue) issues++;
  }

  // Ağırlık: tüm belgeler yüklendi mi progress
  var pct = Math.round((docCount.uploaded / docCount.total) * 100);

  return '<div class="abz-card abz-card--' + a.status + '" onclick="_abzOpenDetail(\'' + a.id + '\')">'
    + '<div class="abz-card-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'aa)">' + _abzEsc(a.bizName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="abz-card-name">' + _abzEsc(a.bizName) + '</span>'
    + '<span class="abz-card-type">' + _abzEsc(a.bizType) + '</span>'
    + '</div>'
    + '<div class="abz-card-meta">'
    + '<span><iconify-icon icon="solar:user-linear" style="font-size:11px"></iconify-icon>' + _abzEsc(a.owner) + '</span>'
    + '<span><iconify-icon icon="solar:map-point-linear" style="font-size:11px"></iconify-icon>' + _abzEsc(a.city) + (a.district ? ' · ' + _abzEsc(a.district) : '') + '</span>'
    + (a.branchCount > 1 ? '<span><iconify-icon icon="solar:buildings-linear" style="font-size:11px"></iconify-icon>' + a.branchCount + ' şube</span>' : '')
    + '</div>'
    + '<div class="abz-card-foot">'
    + '<div class="abz-card-docs" title="' + docCount.uploaded + '/' + docCount.total + ' belge">'
    + '<iconify-icon icon="solar:documents-bold" style="font-size:11px;color:' + (pct === 100 ? '#22C55E' : '#F97316') + '"></iconify-icon>'
    + '<span>' + docCount.uploaded + '/' + docCount.total + '</span>'
    + (issues > 0 ? '<span class="abz-issues-badge"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:9px"></iconify-icon>' + issues + '</span>' : '')
    + '</div>'
    + '<div class="abz-card-date">' + _abzDate(a.appliedAt) + (daysSince !== null ? ' · ' + daysSince + ' gün önce' : '') + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="abz-card-side">'
    + '<span class="abz-status-pill" style="background:' + color + '18;color:' + color + '"><span class="abz-status-dot" style="background:' + color + '"></span>' + _abzStatusLabel(a.status) + '</span>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted);margin-top:auto"></iconify-icon>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P4 — Detay Overlay + Belge Kontrol Listesi
   ═══════════════════════════════════════ */
function _abzOpenDetail(id) {
  _abzCloseDetail();
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === id; });
  if (!a) { _admToast('Başvuru bulunamadı', 'err'); return; }
  _abz.detailId = id;
  _abz.formAdminNote = a.adminNote || '';
  _abz.formBusinessNote = a.businessNote || '';

  var adminPhone = document.getElementById('adminPhone');
  var d = document.createElement('div');
  d.id = 'abzDetail';
  d.className = 'prof-overlay open';
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:82;animation:admFadeIn .3s ease;overflow-y:auto';
  adminPhone.appendChild(d);
  _abzRenderDetail();
}

function _abzCloseDetail() {
  var d = document.getElementById('abzDetail');
  if (!d) return;
  d.style.opacity = '0';
  setTimeout(function() { if (d.parentNode) d.remove(); }, 180);
  _abz.detailId = null;
}

function _abzRenderDetail() {
  var d = document.getElementById('abzDetail');
  if (!d) return;
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === _abz.detailId; });
  if (!a) return;

  var color = _abzStatusColor(a.status);
  var docCount = _abzCountDocs(a);
  var issues = 0;
  for (var i = 0; i < a.documents.length; i++) if (a.documents[i].flaggedIssue) issues++;

  var h = '';

  // Sticky header
  h += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:5">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_abzCloseDetail()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + _abzEsc(a.bizName) + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + _abzEsc(a.id.toUpperCase()) + ' · ' + _abzEsc(a.bizType) + '</div>'
    + '</div>'
    + '<span class="abz-status-pill" style="background:' + color + '18;color:' + color + '"><span class="abz-status-dot" style="background:' + color + '"></span>' + _abzStatusLabel(a.status) + '</span>'
    + '</div>';

  h += '<div class="adm-fadeIn abz-wrap">';

  // İşletme kimlik kartı (duruma göre renk)
  h += '<div class="abz-hero" style="background:linear-gradient(135deg,' + color + ',' + color + 'aa)">'
    + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">'
    + '<div class="abz-hero-avatar">' + _abzEsc(a.bizName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1.1 var(--font);color:#fff">' + _abzEsc(a.bizName) + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);color:#fff;opacity:0.85;margin-top:5px">' + _abzEsc(a.bizType) + ' · ' + a.branchCount + ' şube</div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.2)">'
    + '<div style="flex:1"><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:0.75;color:#fff">Başvuru</div><div style="font:var(--fw-bold) 13px/1 var(--font);color:#fff;margin-top:4px">' + _abzDate(a.appliedAt) + '</div></div>'
    + '<div style="width:1px;background:rgba(255,255,255,0.25)"></div>'
    + '<div style="flex:1"><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:0.75;color:#fff">Belge</div><div style="font:var(--fw-bold) 13px/1 var(--font);color:#fff;margin-top:4px">' + docCount.uploaded + '/' + docCount.total + '</div></div>'
    + '<div style="width:1px;background:rgba(255,255,255,0.25)"></div>'
    + '<div style="flex:1"><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:0.75;color:#fff">Sorunlu</div><div style="font:var(--fw-bold) 13px/1 var(--font);color:#fff;margin-top:4px">' + issues + '</div></div>'
    + '</div>'
    + '</div>';

  // Yetkili Bilgileri
  h += '<div class="abz-sect">'
    + '<div class="abz-sect-head"><iconify-icon icon="solar:user-id-bold" style="font-size:15px;color:#3B82F6"></iconify-icon><span>Yetkili Bilgileri</span></div>'
    + '<div class="abz-info-grid">'
    + '<div class="abz-info-row"><div class="abz-info-lbl">Ad Soyad</div><div class="abz-info-val">' + _abzEsc(a.owner) + '</div></div>'
    + '<a class="abz-info-row abz-info-row--link" href="tel:' + a.ownerPhone + '"><div class="abz-info-lbl">Telefon</div><div class="abz-info-val">' + _abzEsc(a.ownerPhone) + '</div></a>'
    + '<a class="abz-info-row abz-info-row--link" href="mailto:' + a.ownerEmail + '"><div class="abz-info-lbl">E-posta</div><div class="abz-info-val">' + _abzEsc(a.ownerEmail) + '</div></a>'
    + '<div class="abz-info-row"><div class="abz-info-lbl">Vergi No</div><div class="abz-info-val">' + _abzEsc(a.taxNo) + '</div></div>'
    + '<div class="abz-info-row"><div class="abz-info-lbl">Vergi Dairesi</div><div class="abz-info-val">' + _abzEsc(a.taxOffice) + '</div></div>'
    + '<div class="abz-info-row"><div class="abz-info-lbl">Açılış Hedefi</div><div class="abz-info-val">' + _abzDate(a.expectedOpenDate) + '</div></div>'
    + '</div>'
    + '<div class="abz-address"><iconify-icon icon="solar:map-point-bold" style="font-size:13px;color:#F97316"></iconify-icon>' + _abzEsc(a.address) + '</div>'
    + '</div>';

  // Belge Kontrol Listesi
  h += '<div class="abz-sect">'
    + '<div class="abz-sect-head"><iconify-icon icon="solar:checklist-minimalistic-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Belge Kontrol Listesi</span>'
    + '<span class="abz-sect-badge" style="background:' + color + '18;color:' + color + '">' + docCount.uploaded + '/' + docCount.total + '</span></div>'
    + '<div class="abz-doc-list">';

  var readonly = a.status === 'completed';
  for (var d2 = 0; d2 < ADMIN_BIZ_APP_DOC_TYPES.length; d2++) {
    var dt = ADMIN_BIZ_APP_DOC_TYPES[d2];
    var doc = a.documents.find(function(dd) { return dd.typeId === dt.id; });
    h += _abzDocRow(a, dt, doc, readonly);
  }
  h += '</div></div>';

  // Notlar + Aksiyonlar (P6'da)
  h += _abzRenderNotesAndActions(a);

  // History
  if (a.history && a.history.length > 0) {
    h += '<div class="abz-sect">'
      + '<div class="abz-sect-head"><iconify-icon icon="solar:history-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
      + '<span style="font-size:10px;text-transform:uppercase;letter-spacing:.3px;color:var(--text-muted)">Süreç Geçmişi</span></div>'
      + '<div class="abz-history">';
    for (var hi = 0; hi < a.history.length; hi++) {
      var ev = a.history[hi];
      h += '<div class="abz-history-item">'
        + '<div class="abz-history-dot" style="background:' + (ev.by === 'Admin' ? '#8B5CF6' : '#22C55E') + '"></div>'
        + '<div style="flex:1"><div class="abz-history-text"><b>' + _abzEsc(ev.by) + ':</b> ' + _abzEsc(ev.text) + '</div>'
        + '<div class="abz-history-date">' + _abzDate(ev.date) + '</div></div>'
        + '</div>';
    }
    h += '</div></div>';
  }

  h += '</div>';
  d.innerHTML = h;
  d.scrollTop = 0;
}

function _abzDocRow(app, docType, doc, readonly) {
  var isUploaded = doc && doc.uploadedAt;
  var hasIssue = doc && doc.flaggedIssue;

  var statusIcon, statusColor;
  if (!isUploaded) { statusIcon = 'solar:close-circle-bold'; statusColor = '#EF4444'; }
  else if (hasIssue) { statusIcon = 'solar:danger-triangle-bold'; statusColor = '#F97316'; }
  else { statusIcon = 'solar:check-circle-bold'; statusColor = '#22C55E'; }

  var h = '<div class="abz-doc-item' + (hasIssue ? ' abz-doc-item--issue' : '') + (!isUploaded ? ' abz-doc-item--missing' : '') + '">'
    + '<div class="abz-doc-ico"><iconify-icon icon="' + docType.icon + '" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="abz-doc-label">'
    + _abzEsc(docType.label)
    + (docType.required ? '<span class="abz-doc-required">ZORUNLU</span>' : '<span class="abz-doc-optional">Opsiyonel</span>')
    + '</div>'
    + '<div class="abz-doc-preview">'
    + (isUploaded
        ? '<a onclick="_abzOpenDocPreview(\'' + app.id + '\', \'' + docType.id + '\')" style="cursor:pointer">' + _abzEsc(doc.preview) + '</a> · ' + _abzDate(doc.uploadedAt)
        : '<span style="color:#EF4444">Yüklenmemiş</span>')
    + '</div>'
    + (hasIssue && doc.issueNote
        ? '<div class="abz-doc-issue-note"><iconify-icon icon="solar:danger-linear" style="font-size:10px"></iconify-icon>' + _abzEsc(doc.issueNote) + '</div>'
        : '')
    + '</div>'
    + '<div class="abz-doc-actions">';

  // Hatalı/Eksik checkbox (readonly değilse)
  if (!readonly && isUploaded) {
    h += '<label class="abz-flag-check" title="Hatalı / Eksik olarak işaretle">'
      + '<input type="checkbox" ' + (hasIssue ? 'checked' : '') + ' onclick="event.stopPropagation();_abzToggleDocFlag(\'' + app.id + '\', \'' + docType.id + '\', this.checked)" />'
      + '<span class="abz-flag-check-custom"><iconify-icon icon="solar:flag-bold" style="font-size:11px"></iconify-icon></span>'
      + '</label>';
  }

  h += '<iconify-icon icon="' + statusIcon + '" style="font-size:18px;color:' + statusColor + '"></iconify-icon>'
    + '</div></div>';
  return h;
}

function _abzToggleDocFlag(appId, docTypeId, checked) {
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === appId; });
  if (!a) return;
  var doc = a.documents.find(function(d) { return d.typeId === docTypeId; });
  if (!doc) return;
  doc.flaggedIssue = !!checked;
  if (!checked) doc.issueNote = '';
  else if (!doc.issueNote) {
    // Hızlı prompt
    var note = prompt('Hata/eksiklik açıklaması:');
    if (note === null) { doc.flaggedIssue = false; }
    else doc.issueNote = note.trim();
  }
  _abzRenderDetail();
}

/* ═══════════════════════════════════════
   P5 — Belge Önizleme Modal (Lightbox)
   ═══════════════════════════════════════ */
function _abzOpenDocPreview(appId, docTypeId) {
  _abzCloseDocPreview();
  _abz.docPreviewId = appId + '|' + docTypeId;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'abzDocPreview';
  m.className = 'abz-lightbox';
  m.onclick = function(e) { if (e.target === m) _abzCloseDocPreview(); };
  m.innerHTML = '<div class="abz-lightbox-panel"><div id="abzDocPreviewBody"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _abzRenderDocPreview();
}

function _abzCloseDocPreview() {
  var m = document.getElementById('abzDocPreview');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 200);
  _abz.docPreviewId = null;
}

function _abzRenderDocPreview() {
  var body = document.getElementById('abzDocPreviewBody');
  if (!body) return;
  var parts = _abz.docPreviewId.split('|');
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === parts[0]; });
  if (!a) return;
  var dt = _abzDocType(parts[1]);
  var doc = a.documents.find(function(d) { return d.typeId === parts[1]; });
  if (!doc || !doc.uploadedAt) {
    body.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Belge yüklenmemiş</div>';
    return;
  }

  var readonly = a.status === 'completed';

  var h = '<div class="abz-lb-head">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div class="abz-lb-head-ico"><iconify-icon icon="' + dt.icon + '" style="font-size:18px;color:#fff"></iconify-icon></div>'
    + '<div><div class="abz-lb-title">' + _abzEsc(dt.label) + '</div>'
    + '<div class="abz-lb-sub">' + _abzEsc(a.bizName) + ' · Yüklendi: ' + _abzDate(doc.uploadedAt) + '</div></div>'
    + '</div>'
    + '<div class="abz-close" onclick="_abzCloseDocPreview()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Preview alanı — gerçek belge olmadığı için placeholder
  h += '<div class="abz-lb-view">'
    + '<iconify-icon icon="' + dt.icon + '" style="font-size:72px;color:rgba(139,92,246,0.3)"></iconify-icon>'
    + '<div class="abz-lb-filename">' + _abzEsc(doc.preview) + '</div>'
    + '<div class="abz-lb-hint"><iconify-icon icon="solar:info-circle-linear" style="font-size:12px"></iconify-icon>Prototip ortamında belge önizleme simülasyonu</div>'
    + '</div>';

  // Flag toggle + issue note
  if (!readonly) {
    h += '<div class="abz-lb-flag">'
      + '<label class="abz-lb-flag-check">'
      + '<input type="checkbox" ' + (doc.flaggedIssue ? 'checked' : '') + ' onchange="_abzToggleDocFlag(\'' + a.id + '\', \'' + dt.id + '\', this.checked);_abzRenderDocPreview()" />'
      + '<span class="abz-lb-flag-box"><iconify-icon icon="solar:flag-bold" style="font-size:13px"></iconify-icon></span>'
      + '<span class="abz-lb-flag-label">Hatalı / Eksik olarak işaretle</span>'
      + '</label>'
      + (doc.flaggedIssue
          ? '<textarea class="abz-lb-issue-input" placeholder="Açıklama (örn: 2026 tarihli olanı yükleyin)" oninput="_abzSetDocIssueNote(\'' + a.id + '\', \'' + dt.id + '\', this.value)">' + _abzEsc(doc.issueNote) + '</textarea>'
          : '')
      + '</div>';
  } else if (doc.flaggedIssue) {
    h += '<div class="abz-lb-flag abz-lb-flag--readonly">'
      + '<div class="abz-lb-issue-display"><iconify-icon icon="solar:flag-bold" style="font-size:12px;color:#F97316"></iconify-icon>Hatalı işaretlenmiş</div>'
      + '<div class="abz-lb-issue-note-ro">' + _abzEsc(doc.issueNote) + '</div>'
      + '</div>';
  }

  body.innerHTML = h;
}

function _abzSetDocIssueNote(appId, docTypeId, value) {
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === appId; });
  if (!a) return;
  var doc = a.documents.find(function(d) { return d.typeId === docTypeId; });
  if (doc) doc.issueNote = value;
}

/* ═══════════════════════════════════════
   P6 — Notlar + Aksiyon Butonları
   ═══════════════════════════════════════ */
function _abzRenderNotesAndActions(a) {
  var isCompleted = a.status === 'completed';
  var issues = 0;
  for (var i = 0; i < a.documents.length; i++) if (a.documents[i].flaggedIssue) issues++;

  var h = '<div class="abz-sect">'
    + '<div class="abz-sect-head"><iconify-icon icon="solar:letter-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon><span>Notlar</span></div>'

    + '<div class="abz-field">'
    + '<label><iconify-icon icon="solar:shield-user-linear" style="font-size:11px;color:#8B5CF6"></iconify-icon>Admin Özel Notu <span class="abz-lbl-hint">(sadece admin ekibi görür)</span></label>'
    + (isCompleted
        ? '<div class="abz-note-readonly">' + (a.adminNote ? _abzEsc(a.adminNote) : '<i>Not yok</i>') + '</div>'
        : '<textarea class="abz-textarea abz-textarea--admin" placeholder="Dahili not, gözlem, şüphe..." oninput="_abz.formAdminNote=this.value">' + _abzEsc(_abz.formAdminNote) + '</textarea>')
    + '</div>'

    + '<div class="abz-field">'
    + '<label><iconify-icon icon="solar:building-linear" style="font-size:11px;color:#F97316"></iconify-icon>İşletmeye İletilecek Not <span class="abz-lbl-hint">(bildirim ile gönderilir)</span></label>'
    + (isCompleted
        ? '<div class="abz-note-readonly">' + (a.businessNote ? _abzEsc(a.businessNote) : '<i>Not yok</i>') + '</div>'
        : '<textarea class="abz-textarea" placeholder="Örn: Vergi levhanız güncel değil, 2026 tarihli olanı yükleyin..." oninput="_abz.formBusinessNote=this.value">' + _abzEsc(_abz.formBusinessNote) + '</textarea>')
    + '</div>'

    + '</div>';

  // Aksiyonlar — sadece aktif durumlarda
  if (!isCompleted) {
    h += '<div class="abz-actions">';

    // Eksik Bildir
    var missingHint = issues > 0 ? issues + ' belge hatalı işaretli' : 'Hiç işaretlenmemiş';
    h += '<button class="abz-act-btn abz-act-btn--reject" onclick="_abzSubmitReject(\'' + a.id + '\')">'
      + '<div class="abz-act-btn-ico"><iconify-icon icon="solar:letter-opened-bold" style="font-size:16px"></iconify-icon></div>'
      + '<div class="abz-act-btn-body">'
      + '<div class="abz-act-btn-title">Eksik Bildir ve Gönder</div>'
      + '<div class="abz-act-btn-sub">' + missingHint + '</div>'
      + '</div>'
      + '</button>';

    // Onayla
    var docCount = _abzCountDocs(a);
    var requiredUploaded = 0, requiredTotal = 0;
    for (var d2 = 0; d2 < ADMIN_BIZ_APP_DOC_TYPES.length; d2++) {
      if (ADMIN_BIZ_APP_DOC_TYPES[d2].required) {
        requiredTotal++;
        var doc = a.documents.find(function(dd) { return dd.typeId === ADMIN_BIZ_APP_DOC_TYPES[d2].id; });
        if (doc && doc.uploadedAt && !doc.flaggedIssue) requiredUploaded++;
      }
    }
    var canApprove = requiredUploaded === requiredTotal;
    var approveHint = canApprove ? 'Tüm zorunlu belgeler tamam' : 'Zorunlu ' + requiredUploaded + '/' + requiredTotal + ' belge hazır';

    h += '<button class="abz-act-btn abz-act-btn--approve' + (canApprove ? '' : ' disabled') + '" '
      + (canApprove ? '' : 'disabled ') + 'onclick="_abzSubmitApprove(\'' + a.id + '\')">'
      + '<div class="abz-act-btn-ico"><iconify-icon icon="solar:verified-check-bold" style="font-size:16px"></iconify-icon></div>'
      + '<div class="abz-act-btn-body">'
      + '<div class="abz-act-btn-title">Onayla ve Tamamla</div>'
      + '<div class="abz-act-btn-sub">' + approveHint + '</div>'
      + '</div>'
      + '</button>';

    h += '</div>';
  }

  return h;
}

function _abzSubmitReject(appId) {
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === appId; });
  if (!a) return;
  var issues = 0;
  for (var i = 0; i < a.documents.length; i++) if (a.documents[i].flaggedIssue) issues++;

  if (issues === 0 && !_abz.formBusinessNote.trim()) {
    _admToast('En az bir belge hatalı işaretle ya da işletmeye not yaz', 'err');
    return;
  }
  if (!_abz.formBusinessNote.trim()) {
    if (!confirm('İşletmeye iletilecek not boş. Yine de gönderilsin mi?')) return;
  }

  a.adminNote = _abz.formAdminNote;
  a.businessNote = _abz.formBusinessNote;
  a.status = 'awaiting_response';
  a.respondedAt = new Date().toISOString();
  a.history = a.history || [];
  a.history.push({ date: a.respondedAt, by: 'Admin', text: 'Eksik bildirim gönderildi (' + issues + ' belge)' });

  _admToast(a.bizName + ': eksik bildirim gönderildi', 'ok');
  _abzCloseDetail();
  _abz.tab = 'awaiting_response';
  _abzRender();
}

function _abzSubmitApprove(appId) {
  var a = ADMIN_BIZ_APPLICATIONS.find(function(x) { return x.id === appId; });
  if (!a) return;
  if (!confirm(a.bizName + ' onaylanacak ve aktif edilecek. Devam?')) return;

  a.adminNote = _abz.formAdminNote;
  a.businessNote = _abz.formBusinessNote || 'Başvurunuz onaylandı! Platforma hoş geldiniz. Giriş bilgileriniz e-posta ile iletilecek.';
  a.status = 'completed';
  a.approvedAt = new Date().toISOString();
  a.history = a.history || [];
  a.history.push({ date: a.approvedAt, by: 'Admin', text: 'Onaylandı ve aktifleştirildi' });

  _admToast(a.bizName + ': onaylandı ve aktifleştirildi', 'ok');
  _abzCloseDetail();
  _abz.tab = 'completed';
  _abzRender();
}

/* ═══════════════════════════════════════
   P7 — Stiller (.abz-*)
   ═══════════════════════════════════════ */
function _abzInjectStyles() {
  if (document.getElementById('abzStyles')) return;
  var css = ''
    + '.abz-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    /* Tabs */
    + '.abz-tabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:4px;background:var(--bg-phone-secondary);border-radius:var(--r-lg)}'
    + '.abz-tab-btn{border:none;border-radius:var(--r-md);background:transparent;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;color:var(--text-muted);font:var(--fw-semibold) 10px/1.2 var(--font);transition:all .2s}'
    + '.abz-tab-btn.active{background:var(--bg-phone);color:var(--abz-c,#3B82F6);box-shadow:var(--shadow-sm)}'
    + '.abz-tab-btn iconify-icon{font-size:16px}'
    + '.abz-tab-count{font:var(--fw-bold) 10px/1 var(--font);background:var(--border-subtle);color:var(--text-muted);padding:2px 8px;border-radius:var(--r-full);margin-top:2px}'
    /* Search */
    + '.abz-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.abz-search:focus{border-color:#F59E0B}'
    /* Empty */
    + '.abz-empty{padding:48px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--text-muted)}'
    + '.abz-empty>div{font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font)}'
    /* List card */
    + '.abz-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;gap:10px;cursor:pointer;transition:all .15s}'
    + '.abz-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06)}'
    + '.abz-card--pending{border-left:3px solid #3B82F6}'
    + '.abz-card--awaiting_response{border-left:3px solid #F97316}'
    + '.abz-card--completed{border-left:3px solid #22C55E}'
    + '.abz-card-avatar{width:44px;height:44px;border-radius:var(--r-md);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 16px/1 var(--font);flex-shrink:0}'
    + '.abz-card-name{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.abz-card-type{font:var(--fw-medium) 10px/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:var(--bg-phone-secondary);color:var(--text-muted);white-space:nowrap}'
    + '.abz-card-meta{display:flex;gap:12px;flex-wrap:wrap;font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:5px}'
    + '.abz-card-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.abz-card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px}'
    + '.abz-card-docs{display:inline-flex;align-items:center;gap:4px;font:var(--fw-bold) 10px/1 var(--font);color:var(--text-secondary)}'
    + '.abz-card-date{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}'
    + '.abz-issues-badge{display:inline-flex;align-items:center;gap:2px;font:var(--fw-bold) 9px/1 var(--font);color:#F97316;background:rgba(249,115,22,0.12);padding:2px 6px;border-radius:var(--r-full)}'
    /* Status pill */
    + '.abz-card-side{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;flex-shrink:0}'
    + '.abz-status-pill{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);padding:4px 10px;border-radius:var(--r-full);white-space:nowrap}'
    + '.abz-status-dot{width:6px;height:6px;border-radius:50%;animation:abzDotPulse 1.6s ease-in-out infinite}'
    + '@keyframes abzDotPulse{0%,100%{opacity:1}50%{opacity:0.4}}';
  var s = document.createElement('style');
  s.id = 'abzStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _abzInjectStylesPart2();
}

function _abzInjectStylesPart2() {
  if (document.getElementById('abzStyles2')) return;
  var css = ''
    /* Hero */
    + '.abz-hero{border-radius:var(--r-xl);padding:16px;color:#fff;position:relative;overflow:hidden}'
    + '.abz-hero-avatar{width:52px;height:52px;border-radius:var(--r-md);background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.4);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 22px/1 var(--font)}'
    /* Section */
    + '.abz-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.abz-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.abz-sect-head span:first-of-type{flex:1}'
    + '.abz-sect-badge{font:var(--fw-bold) 10px/1 var(--font);padding:4px 9px;border-radius:var(--r-full)}'
    /* Info grid */
    + '.abz-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}'
    + '.abz-info-row{padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);text-decoration:none;color:inherit}'
    + '.abz-info-row--link{cursor:pointer;transition:background .15s}'
    + '.abz-info-row--link:hover{background:rgba(59,130,246,0.1)}'
    + '.abz-info-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.abz-info-val{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.abz-info-row--link .abz-info-val{color:#3B82F6}'
    + '.abz-address{display:flex;align-items:flex-start;gap:6px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);margin-top:2px}'
    /* Doc list */
    + '.abz-doc-list{display:flex;flex-direction:column;gap:6px}'
    + '.abz-doc-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);transition:all .15s}'
    + '.abz-doc-item:hover{border-color:#8B5CF6}'
    + '.abz-doc-item--issue{border-color:#F97316;background:linear-gradient(to right,rgba(249,115,22,0.04),transparent 70%)}'
    + '.abz-doc-item--missing{border-style:dashed;background:rgba(239,68,68,0.02)}'
    + '.abz-doc-ico{width:32px;height:32px;border-radius:var(--r-md);background:rgba(139,92,246,0.1);color:#8B5CF6;display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.abz-doc-item--missing .abz-doc-ico{background:rgba(239,68,68,0.08);color:#EF4444}'
    + '.abz-doc-item--issue .abz-doc-ico{background:rgba(249,115,22,0.12);color:#F97316}'
    + '.abz-doc-label{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary);flex-wrap:wrap}'
    + '.abz-doc-required{font:var(--fw-bold) 9px/1 var(--font);color:#EF4444;background:rgba(239,68,68,0.1);padding:2px 6px;border-radius:var(--r-full);letter-spacing:.3px}'
    + '.abz-doc-optional{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);background:var(--bg-phone-secondary);padding:2px 6px;border-radius:var(--r-full)}'
    + '.abz-doc-preview{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.abz-doc-preview a{color:#3B82F6;text-decoration:underline;text-underline-offset:2px}'
    + '.abz-doc-preview a:hover{color:#8B5CF6}'
    + '.abz-doc-issue-note{display:flex;align-items:center;gap:5px;margin-top:6px;padding:5px 8px;border-radius:var(--r-md);background:rgba(249,115,22,0.08);color:#C2410C;font:var(--fw-medium) 10px/1.3 var(--font)}'
    + '.abz-doc-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}'
    + '.abz-flag-check{position:relative;display:inline-flex;align-items:center;cursor:pointer}'
    + '.abz-flag-check input{position:absolute;opacity:0;pointer-events:none}'
    + '.abz-flag-check-custom{width:26px;height:26px;border-radius:var(--r-md);border:1px solid var(--border-subtle);background:var(--bg-phone);display:flex;align-items:center;justify-content:center;color:var(--text-muted);transition:all .15s}'
    + '.abz-flag-check input:checked + .abz-flag-check-custom{background:#F97316;border-color:#F97316;color:#fff}'
    + '.abz-flag-check:hover .abz-flag-check-custom{border-color:#F97316;color:#F97316}'
    + '.abz-flag-check input:checked:hover + .abz-flag-check-custom{color:#fff}'
    /* Notes */
    + '.abz-field{display:flex;flex-direction:column;gap:5px}'
    + '.abz-field label{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.abz-lbl-hint{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:none;letter-spacing:0;opacity:0.85}'
    + '.abz-textarea{width:100%;box-sizing:border-box;min-height:72px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical;transition:border-color .15s}'
    + '.abz-textarea:focus{border-color:#F97316}'
    + '.abz-textarea--admin{background:linear-gradient(135deg,rgba(139,92,246,0.04),transparent);border-color:rgba(139,92,246,0.25)}'
    + '.abz-textarea--admin:focus{border-color:#8B5CF6}'
    + '.abz-note-readonly{padding:10px 12px;border:1px dashed var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    /* Actions */
    + '.abz-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px}'
    + '.abz-act-btn{display:flex;align-items:center;gap:10px;padding:14px;border:none;border-radius:var(--r-lg);cursor:pointer;color:#fff;text-align:left;transition:transform .1s,opacity .15s;box-shadow:0 3px 10px rgba(0,0,0,0.08)}'
    + '.abz-act-btn:hover{opacity:0.92;transform:translateY(-1px)}'
    + '.abz-act-btn:active{transform:translateY(0)}'
    + '.abz-act-btn--reject{background:linear-gradient(135deg,#F97316,#C2410C)}'
    + '.abz-act-btn--approve{background:linear-gradient(135deg,#22C55E,#16A34A)}'
    + '.abz-act-btn.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.7}'
    + '.abz-act-btn-ico{width:34px;height:34px;border-radius:var(--r-md);background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.abz-act-btn-body{flex:1;min-width:0}'
    + '.abz-act-btn-title{font:var(--fw-bold) var(--fs-xs)/1 var(--font)}'
    + '.abz-act-btn-sub{font:var(--fw-regular) 10px/1.3 var(--font);opacity:0.85;margin-top:3px}'
    /* History */
    + '.abz-history{display:flex;flex-direction:column;gap:6px;padding-left:4px;position:relative}'
    + '.abz-history:before{content:"";position:absolute;left:9px;top:8px;bottom:8px;width:2px;background:var(--border-subtle);border-radius:1px}'
    + '.abz-history-item{display:flex;align-items:flex-start;gap:10px;position:relative;z-index:1}'
    + '.abz-history-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:3px;border:2px solid var(--bg-phone)}'
    + '.abz-history-text{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-primary)}'
    + '.abz-history-date{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Lightbox */
    + '.abz-lightbox{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:95;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.abz-lightbox.open{background:rgba(15,23,42,0.85)}'
    + '.abz-lightbox-panel{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;padding:16px;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;gap:12px}'
    + '.abz-lightbox.open .abz-lightbox-panel{transform:translateY(0)}'
    + '.abz-lb-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle)}'
    + '.abz-lb-head-ico{width:36px;height:36px;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#A78BFA);display:flex;align-items:center;justify-content:center}'
    + '.abz-lb-title{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.abz-lb-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.abz-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary);flex-shrink:0}'
    + '.abz-lb-view{padding:48px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;background:linear-gradient(135deg,rgba(139,92,246,0.04),transparent);border-radius:var(--r-lg);border:1px dashed var(--border-subtle)}'
    + '.abz-lb-filename{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.abz-lb-hint{display:flex;align-items:center;gap:5px;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    + '.abz-lb-flag{padding:12px;border-radius:var(--r-md);background:rgba(249,115,22,0.05);border:1px solid rgba(249,115,22,0.2);display:flex;flex-direction:column;gap:8px}'
    + '.abz-lb-flag--readonly{background:var(--bg-phone-secondary);border-color:var(--border-subtle)}'
    + '.abz-lb-flag-check{display:flex;align-items:center;gap:8px;cursor:pointer;position:relative}'
    + '.abz-lb-flag-check input{position:absolute;opacity:0;pointer-events:none}'
    + '.abz-lb-flag-box{width:24px;height:24px;border-radius:var(--r-sm);border:1px solid var(--border-subtle);background:var(--bg-phone);display:flex;align-items:center;justify-content:center;color:var(--text-muted);transition:all .15s}'
    + '.abz-lb-flag-check input:checked + .abz-lb-flag-box{background:#F97316;border-color:#F97316;color:#fff}'
    + '.abz-lb-flag-label{font:var(--fw-semibold) 12px/1 var(--font);color:var(--text-primary)}'
    + '.abz-lb-issue-input{width:100%;box-sizing:border-box;min-height:60px;padding:8px 10px;border:1px solid rgba(249,115,22,0.3);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical;transition:border-color .15s}'
    + '.abz-lb-issue-input:focus{border-color:#F97316}'
    + '.abz-lb-issue-display{display:inline-flex;align-items:center;gap:5px;font:var(--fw-semibold) 11px/1 var(--font);color:#F97316}'
    + '.abz-lb-issue-note-ro{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);margin-top:6px}';
  var s = document.createElement('style');
  s.id = 'abzStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

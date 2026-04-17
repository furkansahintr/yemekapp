/* ═══════════════════════════════════════════════════════════
   ADMIN PAYMENTS — Ödemeler
   (3 tab: Tamamlanan / Tamamlanmayan / Bekleyen • Detay + İade)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _pay = {
  tab: 'success',               // 'success' | 'failed' | 'pending'
  search: '',
  typeFilter: '',               // '' | 'premium_biz' | 'premium_user' | 'token' | 'ad'
  dateRange: '7d',              // '1d' | '7d' | '30d' | 'all'
  detailId: null,
  exportOpen: false,
  refundConfirmOpen: false
};

/* ═══ Overlay Aç ═══ */
function _admOpenPayments() {
  _admInjectStyles();
  _payInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'payOverlay';
  adminPhone.appendChild(overlay);

  _pay.tab = 'success';
  _pay.search = '';
  _pay.typeFilter = '';
  _pay.dateRange = '7d';
  _payRender();
}

function _payCloseOverlay() {
  var o = document.getElementById('payOverlay');
  if (o) o.remove();
  _payCloseDetail();
  _payCloseExport();
  _payCloseRefundConfirm();
}

/* ═══ Ana Render ═══ */
function _payRender() {
  var o = document.getElementById('payOverlay');
  if (!o) return;

  var h = '<div class="pay-header">'
    + '<div class="pay-back" onclick="_payCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:card-bold" style="font-size:18px;color:#10B981"></iconify-icon>'
    + '<div class="pay-title">Ödemeler</div>'
    + '</div>'
    + '<div class="pay-sub">İşlem takibi + iade yönetimi</div>'
    + '</div>'
    + '<div class="pay-export-btn" onclick="_payToggleExport()" title="Dışa Aktar">'
    + '<iconify-icon icon="solar:download-bold" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '</div>'
    + '<div id="payBody" style="flex:1"></div>';

  o.innerHTML = h;
  _payRenderBody();
}

function _payRenderBody() {
  var body = document.getElementById('payBody');
  if (!body) return;
  body.innerHTML = _payRenderMain();
}

/* ═══ Helpers ═══ */
function _payEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _payPayment(id) {
  return ADMIN_PAYMENTS.find(function(p) { return p.id === id; });
}

function _payFmt(n) {
  if (n === null || n === undefined) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function _payDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' }) + ' · ' + d.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' });
}

function _payRelative(iso) {
  if (typeof _admRelative === 'function') return _admRelative(iso);
  return iso;
}

function _payStatusColor(s) {
  return s === 'success' ? '#22C55E' : s === 'failed' ? '#EF4444' : '#F97316';
}

function _payStatusLabel(s) {
  return s === 'success' ? 'Tamamlandı' : s === 'failed' ? 'Başarısız' : 'Bekliyor';
}

/* ═══════════════════════════════════════
   P2+P3 — Ana Görünüm (KPI + Tab + Filtre + Liste)
   ═══════════════════════════════════════ */
function _payRenderMain() {
  var successCount = ADMIN_PAYMENTS.filter(function(p) { return p.status === 'success'; }).length;
  var failedCount  = ADMIN_PAYMENTS.filter(function(p) { return p.status === 'failed'; }).length;
  var pendingCount = ADMIN_PAYMENTS.filter(function(p) { return p.status === 'pending'; }).length;
  var total = successCount + failedCount + pendingCount;
  var successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

  var todayRevenue = 0;
  var today = new Date().toISOString().slice(0, 10);
  for (var i = 0; i < ADMIN_PAYMENTS.length; i++) {
    var p = ADMIN_PAYMENTS[i];
    if (p.status === 'success' && !p.refunded && p.date.slice(0, 10) === today) todayRevenue += p.amount;
  }

  var h = '<div class="adm-fadeIn pay-wrap">';

  // KPI Özet
  h += '<div class="pay-kpis">'
    + '<div class="pay-kpi pay-kpi--revenue">'
    + '<div class="pay-kpi-lbl"><iconify-icon icon="solar:wallet-money-bold" style="font-size:11px"></iconify-icon>Bugünkü Ciro</div>'
    + '<div class="pay-kpi-val">₺' + _payFmt(todayRevenue) + '</div>'
    + '</div>'
    + '<div class="pay-kpi pay-kpi--rate">'
    + '<div class="pay-kpi-lbl"><iconify-icon icon="solar:check-circle-bold" style="font-size:11px"></iconify-icon>Başarı Oranı</div>'
    + '<div class="pay-kpi-val" style="color:' + (successRate >= 80 ? '#22C55E' : successRate >= 60 ? '#F59E0B' : '#EF4444') + '">%' + successRate + '</div>'
    + '</div>'
    + '<div class="pay-kpi pay-kpi--total">'
    + '<div class="pay-kpi-lbl"><iconify-icon icon="solar:document-text-bold" style="font-size:11px"></iconify-icon>Toplam İşlem</div>'
    + '<div class="pay-kpi-val">' + total + '</div>'
    + '</div>'
    + '</div>';

  // 3 Tab
  h += '<div class="pay-tabs">'
    + _payTabBtn('success', 'Tamamlanan',    'solar:check-circle-bold',  successCount, '#22C55E')
    + _payTabBtn('failed',  'Tamamlanmayan', 'solar:close-circle-bold',  failedCount,  '#EF4444')
    + _payTabBtn('pending', 'Bekleyen',      'solar:clock-circle-bold',  pendingCount, '#F97316')
    + '</div>';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="pay-search" placeholder="İşlem ID, ödeme yapan veya ref..." value="' + _payEsc(_pay.search) + '" oninput="_pay.search=this.value;_payRenderBody()" />'
    + '</div>';

  // Tür filtresi
  h += '<div class="pay-chip-row">'
    + '<span class="pay-chip-label">Tür:</span>'
    + _payTypeChip('', 'Tümü', null, null);
  var types = Object.keys(ADMIN_PAYMENT_TYPES);
  for (var ti = 0; ti < types.length; ti++) {
    var tdef = ADMIN_PAYMENT_TYPES[types[ti]];
    h += _payTypeChip(types[ti], tdef.label, tdef.icon, tdef.color);
  }
  h += '</div>';

  // Tarih aralığı
  h += '<div class="pay-chip-row">'
    + '<span class="pay-chip-label">Tarih:</span>'
    + _payDateChip('1d', 'Bugün')
    + _payDateChip('7d', 'Son 7 gün')
    + _payDateChip('30d', 'Son 30 gün')
    + _payDateChip('all', 'Tümü')
    + '</div>';

  // Liste
  var list = _payFilterPayments();
  h += '<div class="pay-list-head"><span>' + list.length + ' işlem</span></div>';

  if (list.length === 0) {
    h += '<div class="pay-empty">'
      + '<iconify-icon icon="solar:inbox-linear" style="font-size:40px;opacity:0.3"></iconify-icon>'
      + '<div>Bu kriterlere uyan işlem yok</div></div>';
  } else {
    h += '<div class="pay-list">';
    for (var i2 = 0; i2 < list.length; i2++) h += _payRow(list[i2]);
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _payTabBtn(id, label, icon, count, color) {
  var sel = _pay.tab === id;
  return '<button class="pay-tab-btn' + (sel ? ' active' : '') + '" '
    + 'style="' + (sel ? '--pay-c:' + color : '') + '" '
    + 'onclick="_pay.tab=\'' + id + '\';_payRenderBody()">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px' + (sel ? ';color:' + color : '') + '"></iconify-icon>'
    + '<span>' + label + '</span>'
    + '<span class="pay-tab-count"' + (sel ? ' style="background:' + color + ';color:#fff"' : '') + '>' + count + '</span>'
    + '</button>';
}

function _payTypeChip(id, label, icon, color) {
  var sel = _pay.typeFilter === id;
  return '<button class="pay-chip' + (sel ? ' active' : '') + '" '
    + 'style="' + (sel && color ? 'border-color:' + color + ';background:' + color + '18;color:' + color : '') + '" '
    + 'onclick="_pay.typeFilter=\'' + id + '\';_payRenderBody()">'
    + (icon ? '<iconify-icon icon="' + icon + '" style="font-size:11px"></iconify-icon>' : '')
    + label + '</button>';
}

function _payDateChip(id, label) {
  var sel = _pay.dateRange === id;
  return '<button class="pay-chip' + (sel ? ' active' : '') + '" onclick="_pay.dateRange=\'' + id + '\';_payRenderBody()">' + label + '</button>';
}

function _payFilterPayments() {
  var list = ADMIN_PAYMENTS.slice();
  list = list.filter(function(p) { return p.status === _pay.tab; });
  if (_pay.typeFilter) list = list.filter(function(p) { return p.type === _pay.typeFilter; });

  if (_pay.dateRange !== 'all') {
    var days = _pay.dateRange === '1d' ? 1 : _pay.dateRange === '7d' ? 7 : 30;
    var cutoff = Date.now() - days * 86400000;
    list = list.filter(function(p) { return new Date(p.date).getTime() >= cutoff; });
  }

  if (_pay.search.trim()) {
    var q = _pay.search.toLowerCase().trim();
    list = list.filter(function(p) {
      return (p.id && p.id.toLowerCase().indexOf(q) > -1)
        || (p.payerName && p.payerName.toLowerCase().indexOf(q) > -1)
        || (p.providerRef && p.providerRef.toLowerCase().indexOf(q) > -1);
    });
  }
  list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  return list;
}

function _payRow(p) {
  var tdef = ADMIN_PAYMENT_TYPES[p.type] || { label:p.type, color:'#6B7280', icon:'solar:document-bold' };
  var statusColor = _payStatusColor(p.status);

  return '<div class="pay-row pay-row--' + p.status + '" onclick="_payOpenDetail(\'' + p.id + '\')">'
    + '<div class="pay-row-ico" style="background:' + tdef.color + '18;color:' + tdef.color + '">'
    + '<iconify-icon icon="' + tdef.icon + '" style="font-size:16px"></iconify-icon>'
    + '</div>'
    + '<div class="pay-row-main">'
    + '<div class="pay-row-head">'
    + '<span class="pay-row-type">' + _payEsc(tdef.label) + '</span>'
    + (p.refunded ? '<span class="pay-refund-badge"><iconify-icon icon="solar:refresh-circle-bold" style="font-size:9px"></iconify-icon>İADE EDİLDİ</span>' : '')
    + '</div>'
    + '<div class="pay-row-payer">' + _payEsc(p.payerName) + '</div>'
    + '<div class="pay-row-meta">'
    + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:10px"></iconify-icon>' + _payRelative(p.date) + '</span>'
    + '<span><iconify-icon icon="solar:hashtag-linear" style="font-size:10px"></iconify-icon>' + _payEsc(p.id.toUpperCase()) + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="pay-row-side">'
    + '<div class="pay-row-amount">₺' + _payFmt(p.amount) + '</div>'
    + '<span class="pay-row-status" style="background:' + statusColor + '18;color:' + statusColor + '">'
    + '<span class="pay-row-dot" style="background:' + statusColor + '"></span>' + _payStatusLabel(p.status)
    + '</span>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P4+P5 — Detay Drawer + İade Aksiyonu
   ═══════════════════════════════════════ */
function _payOpenDetail(id) {
  _payCloseDetail();
  var p = _payPayment(id);
  if (!p) { _admToast('İşlem bulunamadı', 'err'); return; }
  _pay.detailId = id;

  var adminPhone = document.getElementById('adminPhone');
  var d = document.createElement('div');
  d.id = 'payDetail';
  d.className = 'mbr-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _payCloseDetail(); };
  d.innerHTML = '<div class="mbr-drawer"><div id="payDetailScroll" class="mbr-drawer-scroll"></div></div>';
  adminPhone.appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
  _payRenderDetail();
}

function _payCloseDetail() {
  var d = document.getElementById('payDetail');
  if (!d) return;
  d.classList.remove('open');
  setTimeout(function() { if (d.parentNode) d.remove(); }, 280);
  _pay.detailId = null;
}

function _payRenderDetail() {
  var scroll = document.getElementById('payDetailScroll');
  if (!scroll) return;
  var p = _payPayment(_pay.detailId);
  if (!p) return;
  var tdef = ADMIN_PAYMENT_TYPES[p.type] || { label:p.type, color:'#6B7280', icon:'solar:document-bold' };
  var mdef = ADMIN_PAYMENT_METHODS[p.method] || { label:p.method, icon:'solar:card-bold' };
  var statusColor = _payStatusColor(p.status);

  var h = '';

  // Top bar
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">İşlem Detayı</span>'
    + '<div class="mbr-icon-btn" onclick="_payCloseDetail()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  // Hero
  var heroGrad = 'linear-gradient(135deg,' + statusColor + ',' + statusColor + 'aa)';
  h += '<div class="pay-detail-hero" style="background:' + heroGrad + '">'
    + '<div class="pay-detail-type-row">'
    + '<div class="pay-detail-type-ico" style="background:rgba(255,255,255,0.22)"><iconify-icon icon="' + tdef.icon + '" style="font-size:20px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1"><div class="pay-detail-type-lbl">' + _payEsc(tdef.label) + '</div>'
    + '<div class="pay-detail-id">' + _payEsc(p.id.toUpperCase()) + '</div></div>'
    + '</div>'
    + '<div class="pay-detail-amount">₺' + _payFmt(p.amount) + '</div>'
    + '<div class="pay-detail-status-row">'
    + '<span class="pay-detail-status"><span class="pay-row-dot"></span>' + _payStatusLabel(p.status) + '</span>'
    + (p.refunded ? '<span class="pay-detail-refunded">İADE EDİLDİ</span>' : '')
    + '<span class="pay-detail-date">' + _payDate(p.date) + '</span>'
    + '</div>'
    + '</div>';

  // Ürün/Hizmet
  h += '<div class="pay-sect">'
    + '<div class="pay-sect-head"><iconify-icon icon="solar:box-bold" style="font-size:15px;color:' + tdef.color + '"></iconify-icon><span>Ürün / Hizmet</span></div>'
    + '<div class="pay-product-box" style="border-left-color:' + tdef.color + '">'
    + '<div class="pay-product-desc">' + _payEsc(p.productDesc) + '</div>'
    + (p.tokenGranted ? '<div class="pay-product-extra">🪙 ' + _payFmt(p.tokenGranted) + ' Token cüzdana yatırıldı</div>' : '')
    + (p.billingPeriod ? '<div class="pay-product-extra">📅 ' + (p.billingPeriod === 'yearly' ? 'Yıllık abonelik' : 'Aylık abonelik') + '</div>' : '')
    + (p.invoiceNo ? '<div class="pay-product-extra">🧾 Fatura No: <b>' + _payEsc(p.invoiceNo) + '</b></div>' : '')
    + '</div></div>';

  // Müşteri
  h += '<div class="pay-sect">'
    + '<div class="pay-sect-head"><iconify-icon icon="solar:user-id-bold" style="font-size:15px;color:#3B82F6"></iconify-icon><span>Müşteri Bilgileri</span></div>'
    + '<div class="pay-customer-row">'
    + '<div class="pay-customer-avatar">' + _payEsc(p.payerName.charAt(0)) + '</div>'
    + '<div style="flex:1"><div class="pay-customer-name">' + _payEsc(p.payerName) + '</div>'
    + '<div class="pay-customer-meta">' + (p.payerKind === 'biz' ? '🏪 İşletme' : '👤 Kullanıcı') + ' · ' + _payEsc(p.payerId) + '</div></div>'
    + '<button class="pay-link-btn" onclick="_admToast(\'Profile yönlendirme: ' + _payEsc(p.payerId) + '\')">'
    + '<iconify-icon icon="solar:arrow-right-up-bold" style="font-size:12px"></iconify-icon>Profil</button>'
    + '</div>'
    + '</div>';

  // Ödeme Metodu
  h += '<div class="pay-sect">'
    + '<div class="pay-sect-head"><iconify-icon icon="solar:card-bold" style="font-size:15px;color:#10B981"></iconify-icon><span>Ödeme Metodu</span></div>'
    + '<div class="pay-info-grid">'
    + '<div class="pay-info-cell"><div class="pay-info-lbl">Metod</div><div class="pay-info-val"><iconify-icon icon="' + mdef.icon + '" style="font-size:12px;color:var(--text-muted);margin-right:4px"></iconify-icon>' + _payEsc(mdef.label) + '</div></div>'
    + '<div class="pay-info-cell"><div class="pay-info-lbl">Aracı Kurum</div><div class="pay-info-val">' + _payEsc(p.provider) + '</div></div>'
    + (p.cardMask ? '<div class="pay-info-cell"><div class="pay-info-lbl">Kart</div><div class="pay-info-val pay-mono">' + _payEsc(p.cardMask) + '</div></div>' : '')
    + '<div class="pay-info-cell"><div class="pay-info-lbl">Referans</div><div class="pay-info-val pay-mono">' + _payEsc(p.providerRef) + '</div></div>'
    + '</div>'
    + '</div>';

  // Hata Detayı (failed için)
  if (p.status === 'failed' && p.errorCode) {
    var err = ADMIN_PAYMENT_ERROR_CODES[p.errorCode] || { label:p.errorCode, desc:'', severity:'warning' };
    var sevColor = err.severity === 'critical' ? '#EF4444' : err.severity === 'warning' ? '#F59E0B' : '#64748B';
    h += '<div class="pay-error-box" style="border-color:' + sevColor + '40;background:' + sevColor + '0D">'
      + '<div class="pay-error-head">'
      + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:16px;color:' + sevColor + '"></iconify-icon>'
      + '<div><div class="pay-error-title" style="color:' + sevColor + '">' + _payEsc(err.label) + '</div>'
      + '<div class="pay-error-code pay-mono">Kod: ' + _payEsc(p.errorCode) + '</div></div>'
      + '</div>'
      + '<div class="pay-error-desc">' + _payEsc(err.desc) + '</div>'
      + '<button class="pay-retry-btn" onclick="_admToast(\'Kullanıcıya yeniden deneme linki gönderildi\',\'ok\')">'
      + '<iconify-icon icon="solar:refresh-circle-linear" style="font-size:13px"></iconify-icon>Yeniden Dene Linki Gönder</button>'
      + '</div>';
  }

  // Pending reason
  if (p.status === 'pending' && p.pendingReason) {
    h += '<div class="pay-pending-box">'
      + '<iconify-icon icon="solar:clock-circle-bold" style="font-size:14px;color:#F97316"></iconify-icon>'
      + '<span>' + _payEsc(p.pendingReason) + '</span>'
      + '</div>';
  }

  // İade Edilmiş Uyarısı
  if (p.refunded) {
    h += '<div class="pay-refunded-box">'
      + '<iconify-icon icon="solar:refresh-circle-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>'
      + '<div><div><b>İade tamamlandı</b> · ' + _payDate(p.refundedAt) + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + _payEsc(p.refundReason || '—') + '</div></div>'
      + '</div>';
  }

  // Aksiyonlar
  h += '<div class="pay-actions">';
  if (p.status === 'success' && !p.refunded) {
    h += '<button class="pay-action-btn pay-action-btn--refund" onclick="_payOpenRefundConfirm(\'' + p.id + '\')">'
      + '<iconify-icon icon="solar:refresh-circle-bold" style="font-size:15px"></iconify-icon>'
      + 'İade Başlat</button>';
  }
  if (p.status === 'pending') {
    h += '<button class="pay-action-btn pay-action-btn--approve" onclick="_payApprovePending(\'' + p.id + '\')">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Manuel Onayla</button>'
      + '<button class="pay-action-btn pay-action-btn--reject" onclick="_payRejectPending(\'' + p.id + '\')">'
      + '<iconify-icon icon="solar:close-circle-bold" style="font-size:15px"></iconify-icon>Reddet</button>';
  }
  h += '<button class="pay-action-btn pay-action-btn--download" onclick="_admToast(\'Fatura özeti hazırlandı (prototip)\',\'ok\')">'
    + '<iconify-icon icon="solar:download-bold" style="font-size:15px"></iconify-icon>Fatura İndir</button>';
  h += '</div>';

  scroll.innerHTML = h;
}

/* ── İade Confirm Modal ── */
function _payOpenRefundConfirm(paymentId) {
  _payCloseRefundConfirm();
  var p = _payPayment(paymentId);
  if (!p) return;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'payRefundConfirm';
  m.className = 'pay-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _payCloseRefundConfirm(); };
  m.innerHTML = '<div class="pay-modal pay-modal--conf">'
    + '<div class="pay-conf-head" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED)">'
    + '<div class="pay-conf-ico"><iconify-icon icon="solar:refresh-circle-bold" style="font-size:28px;color:#fff"></iconify-icon></div>'
    + '<div class="pay-conf-title">İade Onayı</div>'
    + '<div class="pay-conf-sub">Bu işlemin tutarı müşteriye geri gönderilecek</div>'
    + '</div>'
    + '<div class="pay-conf-body">'
    + '<div class="pay-conf-target">'
    + '<div class="pay-conf-avatar">' + _payEsc(p.payerName.charAt(0)) + '</div>'
    + '<div><div class="pay-conf-name">' + _payEsc(p.payerName) + '</div>'
    + '<div class="pay-conf-prod">' + _payEsc(p.productDesc) + '</div></div>'
    + '</div>'
    + '<div class="pay-conf-amt">'
    + '<span class="pay-conf-minus">−</span>'
    + '<span class="pay-conf-amt-val">₺' + _payFmt(p.amount) + '</span>'
    + '</div>'
    + '<div class="pay-conf-field">'
    + '<label>İade Sebebi (zorunlu)</label>'
    + '<textarea id="payRefundReason" class="pay-conf-textarea" placeholder="Örn: Müşteri talebiyle iade — hizmet verilmedi"></textarea>'
    + '</div>'
    + '<div class="pay-conf-warn">'
    + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:13px;color:#F59E0B"></iconify-icon>'
    + '<span>Bu işlem geri alınamaz. Aracı kuruma iade talebi gönderilecek.</span>'
    + '</div>'
    + '</div>'
    + '<div class="pay-conf-btns">'
    + '<button class="pay-conf-cancel" onclick="_payCloseRefundConfirm()">Vazgeç</button>'
    + '<button class="pay-conf-apply" onclick="_payApplyRefund(\'' + paymentId + '\')">'
    + '<iconify-icon icon="solar:refresh-circle-bold" style="font-size:14px"></iconify-icon>Evet, İade Et</button>'
    + '</div>'
    + '</div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _payCloseRefundConfirm() {
  var m = document.getElementById('payRefundConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
}

function _payApplyRefund(paymentId) {
  var p = _payPayment(paymentId);
  if (!p) return;
  var reasonEl = document.getElementById('payRefundReason');
  var reason = reasonEl ? reasonEl.value.trim() : '';
  if (!reason) { _admToast('İade sebebi zorunlu', 'err'); return; }

  p.refunded = true;
  p.refundedAt = new Date().toISOString();
  p.refundReason = reason;
  _admToast('₺' + _payFmt(p.amount) + ' iadesi başlatıldı', 'ok');
  _payCloseRefundConfirm();
  _payRenderDetail();
  _payRenderBody();
}

/* ── Pending işlem onay/red ── */
function _payApprovePending(id) {
  var p = _payPayment(id);
  if (!p) return;
  if (!confirm(p.payerName + ' · ₺' + _payFmt(p.amount) + ' ödemesi manuel onaylanacak. Devam?')) return;
  p.status = 'success';
  _admToast('Ödeme onaylandı', 'ok');
  _payCloseDetail();
  _pay.tab = 'success';
  _payRenderBody();
}

function _payRejectPending(id) {
  var p = _payPayment(id);
  if (!p) return;
  if (!confirm(p.payerName + ' · ₺' + _payFmt(p.amount) + ' ödemesi reddedilecek. Devam?')) return;
  p.status = 'failed';
  p.errorCode = 'BANK_MAINTENANCE';
  _admToast('Ödeme reddedildi', 'ok');
  _payCloseDetail();
  _pay.tab = 'failed';
  _payRenderBody();
}

/* ═══════════════════════════════════════
   P6 — Export Sheet
   ═══════════════════════════════════════ */
function _payToggleExport() {
  if (_pay.exportOpen) _payCloseExport();
  else _payOpenExport();
}

function _payOpenExport() {
  _payCloseExport();
  _pay.exportOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'payExport';
  m.className = 'pay-exp-backdrop';
  m.onclick = function(e) { if (e.target === m) _payCloseExport(); };
  m.innerHTML = '<div class="pay-exp-panel">'
    + '<div class="pay-exp-head">'
    + '<div><div class="pay-exp-title"><iconify-icon icon="solar:download-bold" style="font-size:16px;color:#10B981"></iconify-icon>Fatura/Rapor İndir</div>'
    + '<div class="pay-exp-sub">Muhasebe için dışa aktarma</div></div>'
    + '<div class="pay-close" onclick="_payCloseExport()"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon></div>'
    + '</div>'
    + '<button class="pay-exp-btn" onclick="_payExport(\'pdf\')"><div class="pay-exp-ico" style="background:linear-gradient(135deg,#EF4444,#DC2626)"><iconify-icon icon="solar:file-text-bold" style="font-size:18px;color:#fff"></iconify-icon></div><div><div class="pay-exp-lbl">PDF Fatura Özeti</div><div class="pay-exp-hint">Resmi fatura formatı</div></div></button>'
    + '<button class="pay-exp-btn" onclick="_payExport(\'xlsx\')"><div class="pay-exp-ico" style="background:linear-gradient(135deg,#22C55E,#16A34A)"><iconify-icon icon="solar:document-bold" style="font-size:18px;color:#fff"></iconify-icon></div><div><div class="pay-exp-lbl">Excel Raporu</div><div class="pay-exp-hint">Muhasebe için detaylı tablo</div></div></button>'
    + '<button class="pay-exp-btn" onclick="_payExport(\'csv\')"><div class="pay-exp-ico" style="background:linear-gradient(135deg,#3B82F6,#06B6D4)"><iconify-icon icon="solar:document-text-bold" style="font-size:18px;color:#fff"></iconify-icon></div><div><div class="pay-exp-lbl">CSV</div><div class="pay-exp-hint">Ham veri</div></div></button>'
    + '</div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _payCloseExport() {
  var m = document.getElementById('payExport');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _pay.exportOpen = false;
}

function _payExport(fmt) {
  var list = _payFilterPayments();
  _admToast(list.length + ' işlem · ' + fmt.toUpperCase() + ' olarak hazırlandı', 'ok');
  _payCloseExport();
}

/* ═══════════════════════════════════════
   P7 — Stiller (.pay-*)
   ═══════════════════════════════════════ */
function _payInjectStyles() {
  if (document.getElementById('payStyles')) return;
  var css = ''
    + '.pay-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    /* Header */
    + '.pay-header{position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10}'
    + '.pay-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.pay-title{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.pay-sub{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.pay-export-btn{width:38px;height:38px;border-radius:var(--r-md);background:linear-gradient(135deg,#10B981,#22C55E);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(16,185,129,0.3);flex-shrink:0}'
    /* KPIs */
    + '.pay-kpis{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}'
    + '.pay-kpi{padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone)}'
    + '.pay-kpi--revenue{border-top:3px solid #22C55E}'
    + '.pay-kpi--rate{border-top:3px solid #3B82F6}'
    + '.pay-kpi--total{border-top:3px solid #8B5CF6}'
    + '.pay-kpi-lbl{display:flex;align-items:center;gap:4px;font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.pay-kpi-val{font:var(--fw-bold) 18px/1 var(--font);color:var(--text-primary);margin-top:5px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    /* Tabs */
    + '.pay-tabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:4px;background:var(--bg-phone-secondary);border-radius:var(--r-lg)}'
    + '.pay-tab-btn{padding:10px 6px;border:none;border-radius:var(--r-md);background:transparent;color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;transition:all .2s;flex-wrap:nowrap}'
    + '.pay-tab-btn.active{background:var(--bg-phone);color:var(--pay-c);box-shadow:var(--shadow-sm)}'
    + '.pay-tab-count{font:var(--fw-bold) 10px/1 var(--font);background:var(--border-subtle);color:var(--text-muted);padding:2px 6px;border-radius:var(--r-full)}'
    /* Search */
    + '.pay-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.pay-search:focus{border-color:#10B981}'
    + '.pay-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.pay-chip-label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px}'
    + '.pay-chip{padding:6px 11px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}'
    + '.pay-chip:hover{background:var(--bg-phone-secondary)}'
    + '.pay-chip.active{border-color:#10B981;background:rgba(16,185,129,0.1);color:#10B981}'
    /* List */
    + '.pay-list-head{display:flex;align-items:center;justify-content:space-between;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px}'
    + '.pay-empty{padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--text-muted);font:var(--fw-regular) 11px/1.3 var(--font)}'
    + '.pay-list{display:flex;flex-direction:column;gap:6px}'
    + '.pay-row{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;transition:all .15s}'
    + '.pay-row:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06)}'
    + '.pay-row--success{border-left:3px solid #22C55E}'
    + '.pay-row--failed{border-left:3px solid #EF4444}'
    + '.pay-row--pending{border-left:3px solid #F97316}'
    + '.pay-row-ico{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.pay-row-main{flex:1;min-width:0}'
    + '.pay-row-head{display:flex;align-items:center;gap:6px}'
    + '.pay-row-type{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.pay-refund-badge{display:inline-flex;align-items:center;gap:3px;font:var(--fw-bold) 9px/1 var(--font);color:#8B5CF6;background:rgba(139,92,246,0.12);padding:2px 6px;border-radius:var(--r-full);letter-spacing:.3px}'
    + '.pay-row-payer{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.pay-row-meta{display:flex;gap:10px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:5px;flex-wrap:wrap}'
    + '.pay-row-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.pay-row-side{text-align:right;flex-shrink:0;display:flex;flex-direction:column;gap:5px;align-items:flex-end}'
    + '.pay-row-amount{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.pay-row-status{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);padding:3px 8px;border-radius:var(--r-full)}'
    + '.pay-row-dot{width:5px;height:5px;border-radius:50%}';
  var s = document.createElement('style');
  s.id = 'payStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _payInjectStylesPart2();
}

function _payInjectStylesPart2() {
  if (document.getElementById('payStyles2')) return;
  var css = ''
    /* Detail hero */
    + '.pay-detail-hero{padding:16px;border-radius:var(--r-xl);color:#fff;display:flex;flex-direction:column;gap:10px}'
    + '.pay-detail-type-row{display:flex;align-items:center;gap:10px}'
    + '.pay-detail-type-ico{width:40px;height:40px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.pay-detail-type-lbl{font:var(--fw-semibold) 10px/1 var(--font);opacity:0.85;text-transform:uppercase;letter-spacing:.3px}'
    + '.pay-detail-id{font:var(--fw-bold) 12px/1 var(--font);margin-top:5px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.pay-detail-amount{font:var(--fw-bold) 32px/1 var(--font);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.pay-detail-status-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.pay-detail-status{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 11px/1 var(--font);padding:4px 10px;border-radius:var(--r-full);background:rgba(255,255,255,0.22)}'
    + '.pay-detail-status .pay-row-dot{background:#fff}'
    + '.pay-detail-refunded{font:var(--fw-bold) 9px/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:rgba(139,92,246,0.8);color:#fff;letter-spacing:.3px}'
    + '.pay-detail-date{font:var(--fw-regular) 10px/1 var(--font);opacity:0.85;margin-left:auto}'
    /* Sect */
    + '.pay-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:10px;margin-top:12px}'
    + '.pay-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    /* Product */
    + '.pay-product-box{padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:3px solid;display:flex;flex-direction:column;gap:5px}'
    + '.pay-product-desc{font:var(--fw-semibold) var(--fs-xs)/1.4 var(--font);color:var(--text-primary)}'
    + '.pay-product-extra{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary)}'
    /* Customer */
    + '.pay-customer-row{display:flex;align-items:center;gap:10px}'
    + '.pay-customer-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#06B6D4);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 14px/1 var(--font);flex-shrink:0}'
    + '.pay-customer-name{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.pay-customer-meta{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.pay-link-btn{padding:6px 12px;border-radius:var(--r-full);border:1px solid #3B82F6;background:rgba(59,130,246,0.08);color:#3B82F6;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:3px}'
    + '.pay-link-btn:hover{background:#3B82F6;color:#fff}'
    /* Info grid */
    + '.pay-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}'
    + '.pay-info-cell{padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.pay-info-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.pay-info-val{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.pay-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    /* Error */
    + '.pay-error-box{padding:12px;border-radius:var(--r-lg);border:1px solid;display:flex;flex-direction:column;gap:10px;margin-top:12px}'
    + '.pay-error-head{display:flex;align-items:flex-start;gap:10px}'
    + '.pay-error-title{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font)}'
    + '.pay-error-code{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.pay-error-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    + '.pay-retry-btn{align-self:flex-start;padding:6px 12px;border-radius:var(--r-full);border:1px solid #3B82F6;background:rgba(59,130,246,0.08);color:#3B82F6;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.pay-retry-btn:hover{background:#3B82F6;color:#fff}'
    /* Pending / Refunded box */
    + '.pay-pending-box{display:flex;align-items:center;gap:8px;padding:10px;border-radius:var(--r-md);background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);color:#9A3412;font:var(--fw-medium) 11px/1.4 var(--font);margin-top:10px}'
    + '.pay-refunded-box{display:flex;align-items:flex-start;gap:8px;padding:10px;border-radius:var(--r-md);background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.25);color:var(--text-secondary);font:var(--fw-regular) 11px/1.4 var(--font);margin-top:10px}'
    /* Actions */
    + '.pay-actions{display:flex;flex-direction:column;gap:6px;margin-top:14px}'
    + '.pay-action-btn{padding:12px;border:none;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:opacity .15s}'
    + '.pay-action-btn:hover{opacity:0.9}'
    + '.pay-action-btn--refund{background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;box-shadow:0 3px 10px rgba(139,92,246,0.3)}'
    + '.pay-action-btn--approve{background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff}'
    + '.pay-action-btn--reject{background:#FEE2E2;color:#EF4444}'
    + '.pay-action-btn--download{background:var(--bg-phone-secondary);color:var(--text-secondary);border:1px solid var(--border-subtle)}'
    /* Refund confirm modal */
    + '.pay-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:92;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.pay-modal-backdrop.open{background:rgba(15,23,42,0.7)}'
    + '.pay-modal{width:100%;max-width:420px;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.pay-modal--conf{border-radius:var(--r-xl);margin-bottom:16px;max-height:88vh;overflow-y:auto}'
    + '.pay-modal-backdrop.open .pay-modal{transform:translateY(0)}'
    + '.pay-conf-head{padding:22px 16px;color:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.pay-conf-ico{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center}'
    + '.pay-conf-title{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.pay-conf-sub{font:var(--fw-regular) 11px/1.3 var(--font);opacity:0.9}'
    + '.pay-conf-body{padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.pay-conf-target{display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.pay-conf-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 14px/1 var(--font)}'
    + '.pay-conf-name{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.pay-conf-prod{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.pay-conf-amt{display:flex;align-items:baseline;justify-content:center;gap:6px;padding:14px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(139,92,246,0.06),transparent);border:2px dashed rgba(139,92,246,0.35);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.pay-conf-minus{font:var(--fw-bold) 24px/1 var(--font);color:#EF4444}'
    + '.pay-conf-amt-val{font:var(--fw-bold) 32px/1 var(--font);color:var(--text-primary)}'
    + '.pay-conf-field{display:flex;flex-direction:column;gap:5px}'
    + '.pay-conf-field label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.pay-conf-textarea{width:100%;box-sizing:border-box;min-height:60px;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical}'
    + '.pay-conf-textarea:focus{border-color:#8B5CF6}'
    + '.pay-conf-warn{display:flex;align-items:flex-start;gap:6px;padding:10px;border-radius:var(--r-md);background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);font:var(--fw-medium) 11px/1.4 var(--font);color:#92400E}'
    + '.pay-conf-btns{display:grid;grid-template-columns:1fr 1.5fr;gap:8px;padding:10px 16px 16px}'
    + '.pay-conf-cancel{padding:13px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer}'
    + '.pay-conf-apply{padding:13px;border:none;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 4px 14px rgba(139,92,246,0.35)}'
    /* Export sheet */
    + '.pay-exp-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:88;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.pay-exp-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.pay-exp-panel{width:100%;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:14px 16px;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;gap:8px}'
    + '.pay-exp-backdrop.open .pay-exp-panel{transform:translateY(0)}'
    + '.pay-exp-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.pay-exp-title{display:inline-flex;align-items:center;gap:6px;font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.pay-exp-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.pay-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.pay-exp-btn{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);cursor:pointer;text-align:left;width:100%;transition:all .15s}'
    + '.pay-exp-btn:hover{background:var(--bg-phone-secondary);transform:translateY(-1px)}'
    + '.pay-exp-ico{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.pay-exp-lbl{font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.pay-exp-hint{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}';
  var s = document.createElement('style');
  s.id = 'payStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

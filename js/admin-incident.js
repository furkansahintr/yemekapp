/* ═══════════════════════════════════════════════════════════
   ADMIN INCIDENT — Hızlı Müdahale (Kayıp Önleme)
   (User/Biz tab • Premium iptal + hesap silme • Geri kazanım)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _imc = {
  tab: 'user',                    // 'user' | 'biz'
  search: '',
  typeFilter: '',                 // '' | 'premium_cancel' | 'account_delete'
  timeRange: '7d',                // '1d' | '24h' | '7d' | 'all'
  detailId: null,
  winbackOpen: false,
  winbackTarget: null,
  winbackTemplate: null,
  winbackCustomMessage: ''
};

/* ═══ Overlay Aç ═══ */
function _admOpenIncident() {
  _admInjectStyles();
  _imcInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'imcOverlay';
  adminPhone.appendChild(overlay);

  _imc.tab = 'user';
  _imc.search = '';
  _imc.typeFilter = '';
  _imc.timeRange = '7d';
  _imcRender();
}

function _imcCloseOverlay() {
  var o = document.getElementById('imcOverlay');
  if (o) o.remove();
  _imcCloseDetail();
  _imcCloseWinback();
}

/* ═══ Ana Render ═══ */
function _imcRender() {
  var o = document.getElementById('imcOverlay');
  if (!o) return;

  var h = '<div class="imc-header">'
    + '<div class="imc-back" onclick="_imcCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:siren-bold" style="font-size:18px;color:#EF4444"></iconify-icon>'
    + '<div class="imc-title">Hızlı Müdahale</div>'
    + '</div>'
    + '<div class="imc-sub">Kayıp önleme ve geri kazanım merkezi</div>'
    + '</div>'
    + '</div>'
    + '<div id="imcBody" style="flex:1"></div>';

  o.innerHTML = h;
  _imcRenderBody();
}

function _imcRenderBody() {
  var body = document.getElementById('imcBody');
  if (!body) return;
  body.innerHTML = _imcRenderMain();
}

/* ═══ Helpers ═══ */
function _imcEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _imcEvent(id) {
  return ADMIN_RETENTION_EVENTS.find(function(e) { return e.id === id; });
}

function _imcReason(id) {
  return ADMIN_CANCEL_REASONS.find(function(r) { return r.id === id; });
}

function _imcFmt(n) {
  if (n === null || n === undefined) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function _imcRelative(iso) {
  if (typeof _admRelative === 'function') return _admRelative(iso);
  return iso;
}

function _imcDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' });
}

/* ═══════════════════════════════════════
   P2+P3 — Ana Görünüm
   ═══════════════════════════════════════ */
function _imcRenderMain() {
  var userEvents = ADMIN_RETENTION_EVENTS.filter(function(e) { return e.kind === 'user'; });
  var bizEvents  = ADMIN_RETENTION_EVENTS.filter(function(e) { return e.kind === 'biz';  });

  // Toplam kayıp değer (premium iptal toplam)
  var totalLoss = 0, openCount = 0;
  for (var i = 0; i < ADMIN_RETENTION_EVENTS.length; i++) {
    var e = ADMIN_RETENTION_EVENTS[i];
    if (e.eventType === 'premium_cancel' && e.totalSpent) totalLoss += e.totalSpent;
    if (e.status === 'open' || e.status === 'pending_contact') openCount++;
  }

  var h = '<div class="adm-fadeIn imc-wrap">';

  // Uyarı KPI bar
  h += '<div class="imc-alert-bar">'
    + '<div class="imc-alert-ico"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="imc-alert-title">Dikkat Edilmesi Gereken Hareket</div>'
    + '<div class="imc-alert-stats">'
    + '<span><b>' + openCount + '</b> açık müdahale</span>'
    + '<span>·</span>'
    + '<span>Tahmini kayıp: <b>₺' + _imcFmt(totalLoss) + '</b></span>'
    + '</div>'
    + '</div>'
    + '<div class="imc-pulse-dot"></div>'
    + '</div>';

  // 2 tab
  h += '<div class="imc-tabs">'
    + _imcTabBtn('user', 'Kullanıcı Hareketleri', 'solar:user-cross-rounded-bold', userEvents.length)
    + _imcTabBtn('biz',  'İşletme Hareketleri',   'solar:shop-minus-bold',          bizEvents.length)
    + '</div>';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="imc-search" placeholder="İsim veya e-posta ile ara..." value="' + _imcEsc(_imc.search) + '" oninput="_imc.search=this.value;_imcRenderBody()" />'
    + '</div>';

  // Tür filtresi
  h += '<div class="imc-chip-row">'
    + '<span class="imc-chip-label">Tür:</span>'
    + _imcTypeChip('',                 'Tümü')
    + _imcTypeChip('premium_cancel',   'Premium İptal')
    + _imcTypeChip('account_delete',   'Hesap Silme')
    + '</div>';

  // Zaman filtresi
  h += '<div class="imc-chip-row">'
    + '<span class="imc-chip-label">Zaman:</span>'
    + _imcTimeChip('1d',  'Bugün')
    + _imcTimeChip('24h', 'Son 24 saat')
    + _imcTimeChip('7d',  'Son 7 gün')
    + _imcTimeChip('all', 'Tümü')
    + '</div>';

  var list = _imcFilterEvents();
  h += '<div class="imc-list-head"><span>' + list.length + ' hareket</span></div>';

  if (list.length === 0) {
    h += '<div class="imc-empty">'
      + '<iconify-icon icon="solar:shield-check-bold" style="font-size:44px;color:#22C55E;opacity:0.5"></iconify-icon>'
      + '<div>Bu kriterlere uyan kayıp hareketi yok</div>'
      + '<div class="imc-empty-sub">Tüm sistem sağlıklı</div>'
      + '</div>';
  } else {
    h += '<div class="imc-list">';
    for (var li = 0; li < list.length; li++) h += _imcEventCard(list[li]);
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _imcTabBtn(id, label, icon, count) {
  var sel = _imc.tab === id;
  return '<button class="imc-tab-btn' + (sel ? ' active' : '') + '" onclick="_imc.tab=\'' + id + '\';_imc.typeFilter=\'\';_imcRenderBody()">'
    + '<iconify-icon icon="' + icon + '" style="font-size:15px"></iconify-icon>'
    + '<span>' + label + '</span>'
    + '<span class="imc-tab-count">' + count + '</span>'
    + '</button>';
}

function _imcTypeChip(id, label) {
  var sel = _imc.typeFilter === id;
  return '<button class="imc-chip' + (sel ? ' active' : '') + '" onclick="_imc.typeFilter=\'' + id + '\';_imcRenderBody()">' + label + '</button>';
}

function _imcTimeChip(id, label) {
  var sel = _imc.timeRange === id;
  return '<button class="imc-chip' + (sel ? ' active' : '') + '" onclick="_imc.timeRange=\'' + id + '\';_imcRenderBody()">' + label + '</button>';
}

function _imcFilterEvents() {
  var list = ADMIN_RETENTION_EVENTS.filter(function(e) { return e.kind === _imc.tab; });
  if (_imc.typeFilter) list = list.filter(function(e) { return e.eventType === _imc.typeFilter; });

  if (_imc.timeRange !== 'all') {
    var hours = _imc.timeRange === '1d' ? 24 : _imc.timeRange === '24h' ? 24 : 7 * 24;
    var cutoff = Date.now() - hours * 3600000;
    list = list.filter(function(e) {
      var t = new Date(e.cancelledAt || e.requestedAt || 0).getTime();
      return t >= cutoff;
    });
  }

  if (_imc.search.trim()) {
    var q = _imc.search.toLowerCase().trim();
    list = list.filter(function(e) {
      return (e.subjectName && e.subjectName.toLowerCase().indexOf(q) > -1)
        || (e.email && e.email.toLowerCase().indexOf(q) > -1);
    });
  }

  list.sort(function(a, b) {
    var at = new Date(a.cancelledAt || a.requestedAt || 0).getTime();
    var bt = new Date(b.cancelledAt || b.requestedAt || 0).getTime();
    return bt - at;
  });
  return list;
}

function _imcEventCard(e) {
  var isCancel = e.eventType === 'premium_cancel';
  var isDelete = e.eventType === 'account_delete';
  var eventColor = isCancel ? '#F97316' : '#EF4444';
  var eventIcon = isCancel ? 'solar:crown-minus-bold' : 'solar:trash-bin-trash-bold';
  var eventLabel = isCancel ? 'Premium İptali' : 'Hesap Silme Talebi';

  var reason = _imcReason(e.reasonId) || { label: '—', color: '#6B7280' };
  var statusMeta = {
    open:             { label:'Müdahale Bekliyor', color:'#EF4444' },
    pending_contact:  { label:'İletişim Bekliyor',  color:'#F59E0B' },
    contacted:        { label:'İletişim Kuruldu',    color:'#3B82F6' },
    resolved:         { label:'Çözüldü',             color:'#22C55E' }
  };
  var st = statusMeta[e.status] || { label:e.status, color:'#6B7280' };

  var infoHTML;
  if (isCancel) {
    infoHTML = '<span><iconify-icon icon="solar:clock-circle-linear" style="font-size:10px"></iconify-icon>' + e.membershipDays + ' gün üye</span>'
      + '<span><iconify-icon icon="solar:wallet-money-linear" style="font-size:10px"></iconify-icon>₺' + _imcFmt(e.totalSpent) + ' harcadı</span>'
      + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:10px"></iconify-icon>' + _imcRelative(e.cancelledAt) + '</span>';
  } else {
    infoHTML = '<span><iconify-icon icon="solar:clock-circle-linear" style="font-size:10px"></iconify-icon>' + e.activeDays + ' gün aktif</span>'
      + '<span><iconify-icon icon="solar:hourglass-linear" style="font-size:10px"></iconify-icon>son: ' + _imcRelative(e.lastActivity) + '</span>'
      + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:10px"></iconify-icon>' + _imcRelative(e.requestedAt) + '</span>';
  }

  return '<div class="imc-event imc-event--' + (isCancel ? 'cancel' : 'delete') + '" onclick="_imcOpenDetail(\'' + e.id + '\')">'
    + '<div class="imc-event-ico" style="background:' + eventColor + '18;color:' + eventColor + '">'
    + '<iconify-icon icon="' + eventIcon + '" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="imc-event-head">'
    + '<span class="imc-event-type" style="color:' + eventColor + '">' + eventLabel + '</span>'
    + '<span class="imc-event-status" style="background:' + st.color + '15;color:' + st.color + '">' + st.label + '</span>'
    + '</div>'
    + '<div class="imc-event-name">' + _imcEsc(e.subjectName) + '</div>'
    + '<div class="imc-event-meta">' + infoHTML + '</div>'
    + '<div class="imc-event-reason" style="border-left-color:' + reason.color + '">'
    + '<iconify-icon icon="solar:quote-down-linear" style="font-size:11px;color:' + reason.color + '"></iconify-icon>'
    + '<span>"' + _imcEsc(e.reasonText) + '"</span>'
    + '</div>'
    + '</div>'
    + '<div class="imc-quick-actions" onclick="event.stopPropagation()">'
    + '<button class="imc-quick-btn imc-quick-btn--mail" onclick="_imcQuickMail(\'' + e.id + '\')" title="Mail Gönder"><iconify-icon icon="solar:letter-bold" style="font-size:13px"></iconify-icon></button>'
    + '<button class="imc-quick-btn imc-quick-btn--notif" onclick="_imcQuickNotif(\'' + e.id + '\')" title="Bildirim Gönder"><iconify-icon icon="solar:bell-bing-bold" style="font-size:13px"></iconify-icon></button>'
    + (isCancel
        ? '<button class="imc-winback-btn" onclick="_imcOpenWinback(\'' + e.id + '\')"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:12px"></iconify-icon>Geri Kazan</button>'
        : '<button class="imc-winback-btn" style="background:#EF4444" onclick="_imcOpenWinback(\'' + e.id + '\')"><iconify-icon icon="solar:phone-calling-bold" style="font-size:12px"></iconify-icon>İletişim</button>')
    + '</div>'
    + '</div>';
}

function _imcQuickMail(id) {
  var e = _imcEvent(id);
  if (!e) return;
  _admToast('Mail taslağı açıldı: ' + e.email, 'ok');
}

function _imcQuickNotif(id) {
  var e = _imcEvent(id);
  if (!e) return;
  _admToast(e.subjectName + ' için özel bildirim kuyruğa alındı', 'ok');
}

/* ═══════════════════════════════════════
   P4 — Detay Drawer
   ═══════════════════════════════════════ */
function _imcOpenDetail(id) {
  _imcCloseDetail();
  var e = _imcEvent(id);
  if (!e) { _admToast('Kayıt bulunamadı', 'err'); return; }
  _imc.detailId = id;

  var adminPhone = document.getElementById('adminPhone');
  var d = document.createElement('div');
  d.id = 'imcDetail';
  d.className = 'mbr-drawer-backdrop';
  d.onclick = function(ev) { if (ev.target === d) _imcCloseDetail(); };
  d.innerHTML = '<div class="mbr-drawer"><div id="imcDetailScroll" class="mbr-drawer-scroll"></div></div>';
  adminPhone.appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
  _imcRenderDetail();
}

function _imcCloseDetail() {
  var d = document.getElementById('imcDetail');
  if (!d) return;
  d.classList.remove('open');
  setTimeout(function() { if (d.parentNode) d.remove(); }, 280);
  _imc.detailId = null;
}

function _imcRenderDetail() {
  var scroll = document.getElementById('imcDetailScroll');
  if (!scroll) return;
  var e = _imcEvent(_imc.detailId);
  if (!e) return;

  var isCancel = e.eventType === 'premium_cancel';
  var eventColor = isCancel ? '#F97316' : '#EF4444';
  var reason = _imcReason(e.reasonId) || { label:'—', color:'#6B7280' };

  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Kayıp Detayı</span>'
    + '<div class="mbr-icon-btn" onclick="_imcCloseDetail()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  // Hero
  h += '<div class="imc-detail-hero" style="background:linear-gradient(135deg,' + eventColor + ',' + eventColor + 'aa)">'
    + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">'
    + '<div class="imc-detail-avatar">' + _imcEsc(e.subjectName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="imc-detail-name">' + _imcEsc(e.subjectName) + '</div>'
    + '<div class="imc-detail-type">' + (isCancel ? 'Premium İptali' : 'Hesap Silme Talebi') + ' · ' + (e.kind === 'user' ? 'Kullanıcı' : 'İşletme') + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="imc-detail-stats">';
  if (isCancel) {
    h += '<div class="imc-ds-cell"><span>Üyelik</span><b>' + e.membershipDays + ' gün</b></div>'
      + '<div class="imc-ds-cell"><span>Toplam Harcama</span><b>₺' + _imcFmt(e.totalSpent) + '</b></div>'
      + '<div class="imc-ds-cell"><span>İptal</span><b>' + _imcRelative(e.cancelledAt) + '</b></div>';
  } else {
    h += '<div class="imc-ds-cell"><span>Aktif</span><b>' + e.activeDays + ' gün</b></div>'
      + '<div class="imc-ds-cell"><span>Son Aktivite</span><b>' + _imcRelative(e.lastActivity) + '</b></div>'
      + '<div class="imc-ds-cell"><span>Talep</span><b>' + _imcRelative(e.requestedAt) + '</b></div>';
  }
  h += '</div></div>';

  // İletişim
  h += '<div class="imc-sect">'
    + '<div class="imc-sect-head"><iconify-icon icon="solar:user-id-bold" style="font-size:15px;color:#3B82F6"></iconify-icon><span>İletişim Bilgileri</span></div>'
    + '<a class="imc-contact-row" href="mailto:' + _imcEsc(e.email) + '">'
    + '<iconify-icon icon="solar:letter-bold" style="font-size:14px;color:#3B82F6"></iconify-icon>'
    + '<span>' + _imcEsc(e.email) + '</span>'
    + '<iconify-icon icon="solar:arrow-right-up-linear" style="font-size:12px;color:var(--text-muted);margin-left:auto"></iconify-icon>'
    + '</a>'
    + '<a class="imc-contact-row" href="tel:' + _imcEsc(e.phone) + '">'
    + '<iconify-icon icon="solar:phone-bold" style="font-size:14px;color:#22C55E"></iconify-icon>'
    + '<span>' + _imcEsc(e.phone) + '</span>'
    + '<iconify-icon icon="solar:arrow-right-up-linear" style="font-size:12px;color:var(--text-muted);margin-left:auto"></iconify-icon>'
    + '</a>'
    + '</div>';

  // Neden
  h += '<div class="imc-sect">'
    + '<div class="imc-sect-head"><iconify-icon icon="solar:chat-square-linear" style="font-size:15px;color:' + reason.color + '"></iconify-icon>'
    + '<span>İptal/Silme Sebebi</span>'
    + '<span class="imc-reason-chip" style="background:' + reason.color + '18;color:' + reason.color + '">' + _imcEsc(reason.label) + '</span>'
    + '</div>'
    + '<div class="imc-reason-box" style="border-left-color:' + reason.color + '">'
    + '"' + _imcEsc(e.reasonText) + '"'
    + '</div>'
    + '</div>';

  // Aksiyonlar
  h += '<div class="imc-actions">';
  if (isCancel) {
    h += '<button class="imc-action-btn imc-action-btn--winback" onclick="_imcOpenWinback(\'' + e.id + '\')">'
      + '<iconify-icon icon="solar:magic-stick-3-bold" style="font-size:16px"></iconify-icon>'
      + 'Geri Kazanım Teklifi Gönder</button>';
  } else {
    h += '<button class="imc-action-btn imc-action-btn--contact" onclick="_imcOpenWinback(\'' + e.id + '\')">'
      + '<iconify-icon icon="solar:phone-calling-bold" style="font-size:16px"></iconify-icon>'
      + 'İletişime Geç</button>';
  }
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
    + '<button class="imc-action-btn-sec" onclick="_imcQuickMail(\'' + e.id + '\')"><iconify-icon icon="solar:letter-bold" style="font-size:14px"></iconify-icon>Mail Gönder</button>'
    + '<button class="imc-action-btn-sec" onclick="_imcQuickNotif(\'' + e.id + '\')"><iconify-icon icon="solar:bell-bing-bold" style="font-size:14px"></iconify-icon>Özel Bildirim</button>'
    + '</div>'
    + '<button class="imc-action-btn-ghost" onclick="_imcMarkResolved(\'' + e.id + '\')">'
    + '<iconify-icon icon="solar:check-circle-linear" style="font-size:14px"></iconify-icon>Çözüldü olarak işaretle</button>';
  h += '</div>';

  scroll.innerHTML = h;
}

function _imcMarkResolved(id) {
  var e = _imcEvent(id);
  if (!e) return;
  if (!confirm(e.subjectName + ' için kayıt çözüldü olarak işaretlensin mi?')) return;
  e.status = 'resolved';
  _admToast('Kayıt çözüldü olarak işaretlendi', 'ok');
  _imcCloseDetail();
  _imcRenderBody();
}

/* ═══════════════════════════════════════
   P5 — Geri Kazanım Teklifi Modal (Otomatik)
   ═══════════════════════════════════════ */
function _imcOpenWinback(eventId) {
  _imcCloseWinback();
  var e = _imcEvent(eventId);
  if (!e) return;
  _imc.winbackTarget = eventId;
  // Auto-select best template based on event
  _imc.winbackTemplate = e.eventType === 'premium_cancel' ? 'wb_discount_50' : 'wb_custom';
  _imc.winbackCustomMessage = '';
  _imc.winbackOpen = true;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'imcWinback';
  m.className = 'imc-modal-backdrop';
  m.onclick = function(ev) { if (ev.target === m) _imcCloseWinback(); };
  m.innerHTML = '<div class="imc-modal"><div id="imcWinbackBody" class="imc-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _imcRenderWinback();
}

function _imcCloseWinback() {
  var m = document.getElementById('imcWinback');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _imc.winbackOpen = false;
}

function _imcRenderWinback() {
  var body = document.getElementById('imcWinbackBody');
  if (!body) return;
  var e = _imcEvent(_imc.winbackTarget);
  if (!e) return;
  var isCancel = e.eventType === 'premium_cancel';
  var isDeleteReq = e.eventType === 'account_delete';
  var selectedTpl = ADMIN_WINBACK_TEMPLATES.find(function(t) { return t.id === _imc.winbackTemplate; }) || ADMIN_WINBACK_TEMPLATES[0];

  var h = '<div class="imc-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div class="imc-mhead-ico" style="background:linear-gradient(135deg,#8B5CF6,#EC4899)">'
    + '<iconify-icon icon="solar:magic-stick-3-bold" style="font-size:20px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div><div class="imc-mtitle">' + (isCancel ? 'Geri Kazanım Teklifi' : 'İletişim Taslağı') + '</div>'
    + '<div class="imc-msub">' + _imcEsc(e.subjectName) + ' için otomatik öneri</div></div>'
    + '</div>'
    + '<div class="imc-close" onclick="_imcCloseWinback()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Otomatik AI önerisi
  var aiSuggest = isCancel
    ? 'Sistem sana özel %50 indirimli yeni bir paket tanımlayalım mı?'
    : 'Kullanıcı ile iletişime geçip sorununu çözmeye çalışalım mı?';
  h += '<div class="imc-ai-sugg">'
    + '<iconify-icon icon="solar:stars-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>'
    + '<div><div class="imc-ai-lbl">AI Öneri</div>'
    + '<div class="imc-ai-text">' + aiSuggest + '</div></div>'
    + '</div>';

  // Şablon seçimi (sadece premium cancel için gerçek templates)
  if (isCancel) {
    h += '<div class="imc-sect-in">'
      + '<div class="imc-sect-head-in"><iconify-icon icon="solar:checklist-bold" style="font-size:13px"></iconify-icon><span>Şablon Seç</span></div>'
      + '<div class="imc-tpl-list">';
    for (var i = 0; i < ADMIN_WINBACK_TEMPLATES.length; i++) {
      var t = ADMIN_WINBACK_TEMPLATES[i];
      var sel = _imc.winbackTemplate === t.id;
      h += '<div class="imc-tpl' + (sel ? ' selected' : '') + '" '
        + 'style="' + (sel ? 'border-color:' + t.color + ';background:' + t.color + '0D' : '') + '" '
        + 'onclick="_imc.winbackTemplate=\'' + t.id + '\';_imcRenderWinback()">'
        + '<div class="imc-tpl-dot" style="background:' + t.color + '"></div>'
        + '<span>' + _imcEsc(t.label) + '</span>'
        + (sel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:13px;color:' + t.color + ';margin-left:auto"></iconify-icon>' : '')
        + '</div>';
    }
    h += '</div></div>';
  }

  // Mesaj önizleme + özelleştirme
  var defaultMsg;
  if (isCancel) {
    if (selectedTpl.id === 'wb_discount_50') {
      defaultMsg = 'Merhaba ' + e.subjectName + ',\n\nYemekApp\'teki premium üyeliğinizi sonlandırdığınız için üzgünüz. Sizi geri kazanmak adına özel bir teklifimiz var: önümüzdeki 3 ay boyunca %50 indirimli devam edebilirsiniz.\n\nBu fırsat sadece size özel ve 7 gün içinde kullanılmalıdır.\n\nDilediğiniz an bize ulaşabilirsiniz.';
    } else if (selectedTpl.id === 'wb_free_month') {
      defaultMsg = 'Merhaba ' + e.subjectName + ',\n\nSizi tekrar aramızda görmek isteriz. 1 ay boyunca ücretsiz premium kullanımı size hediye ediyoruz.\n\nTek yapmanız gereken aşağıdaki butona tıklamak.';
    } else if (selectedTpl.id === 'wb_downgrade') {
      defaultMsg = 'Merhaba ' + e.subjectName + ',\n\nMevcut paketinizin size göre olmadığını düşünüyorsanız, daha uygun bir plana geçebilirsiniz. Standart paketimiz ihtiyaçlarınızı karşılayabilir.\n\nSize özel daha fazla seçenek için destek ekibimizle iletişime geçin.';
    } else {
      defaultMsg = 'Merhaba ' + e.subjectName + ',\n\n';
    }
  } else {
    defaultMsg = 'Merhaba ' + e.subjectName + ',\n\nHesap silme talebinizi aldık. Karar vermeden önce sizi dinlemek ve yaşadığınız sorunu çözmek isteriz.\n\nSorununuz: "' + e.reasonText + '"\n\nLütfen bize 48 saat içinde geri dönün, hesabınızı aktif tutmanıza yardımcı olmaya çalışalım.';
  }

  var msgValue = _imc.winbackCustomMessage || defaultMsg;

  h += '<div class="imc-sect-in">'
    + '<div class="imc-sect-head-in"><iconify-icon icon="solar:letter-bold" style="font-size:13px"></iconify-icon><span>Mesaj İçeriği</span></div>'
    + '<textarea class="imc-msg-area" oninput="_imc.winbackCustomMessage=this.value">' + _imcEsc(msgValue) + '</textarea>'
    + '</div>';

  // Kanal seçimi (Mail + Push)
  h += '<div class="imc-channel-row">'
    + '<span>Gönderim Kanalı:</span>'
    + '<label class="imc-check-chip"><input type="checkbox" checked /> <iconify-icon icon="solar:letter-bold" style="font-size:11px"></iconify-icon>Mail</label>'
    + '<label class="imc-check-chip"><input type="checkbox" checked /> <iconify-icon icon="solar:bell-bing-bold" style="font-size:11px"></iconify-icon>Uygulama Bildirimi</label>'
    + '<label class="imc-check-chip"><input type="checkbox" /> <iconify-icon icon="solar:chat-round-dots-bold" style="font-size:11px"></iconify-icon>SMS</label>'
    + '</div>';

  // Gönder CTA
  h += '<button class="imc-send-cta" onclick="_imcSendWinback(\'' + e.id + '\')">'
    + '<iconify-icon icon="solar:plain-bold" style="font-size:16px"></iconify-icon>'
    + 'Teklifi Gönder ve Takibe Al</button>';

  body.innerHTML = h;
}

function _imcSendWinback(eventId) {
  var e = _imcEvent(eventId);
  if (!e) return;
  e.status = 'contacted';
  _admToast(e.subjectName + ' için teklif gönderildi · takibe alındı', 'ok');
  _imcCloseWinback();
  _imcCloseDetail();
  _imcRenderBody();
}

/* ═══════════════════════════════════════
   P6 — Stiller (.imc-*)
   ═══════════════════════════════════════ */
function _imcInjectStyles() {
  if (document.getElementById('imcStyles')) return;
  var css = ''
    + '.imc-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    + '.imc-header{position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10}'
    + '.imc-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.imc-title{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.imc-sub{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px}'
    /* Alert bar */
    + '.imc-alert-bar{display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--r-xl);background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;box-shadow:0 4px 16px rgba(239,68,68,0.3);position:relative;overflow:hidden}'
    + '.imc-alert-ico{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.imc-alert-title{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font)}'
    + '.imc-alert-stats{display:flex;gap:6px;font:var(--fw-regular) 11px/1 var(--font);opacity:0.9;margin-top:5px;flex-wrap:wrap}'
    + '.imc-alert-stats b{font:var(--fw-bold) 13px/1 var(--font);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.imc-pulse-dot{width:10px;height:10px;border-radius:50%;background:#fff;animation:imcPulse 1.5s ease-in-out infinite;flex-shrink:0}'
    + '@keyframes imcPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.3)}}'
    /* Tabs */
    + '.imc-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;background:var(--bg-phone-secondary);border-radius:var(--r-lg)}'
    + '.imc-tab-btn{padding:10px 8px;border:none;border-radius:var(--r-md);background:transparent;color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .2s}'
    + '.imc-tab-btn.active{background:var(--bg-phone);color:#EF4444;box-shadow:var(--shadow-sm)}'
    + '.imc-tab-count{font:var(--fw-bold) 10px/1 var(--font);background:var(--border-subtle);color:var(--text-muted);padding:2px 6px;border-radius:var(--r-full)}'
    + '.imc-tab-btn.active .imc-tab-count{background:#EF4444;color:#fff}'
    /* Search */
    + '.imc-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none}'
    + '.imc-search:focus{border-color:#EF4444}'
    + '.imc-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.imc-chip-label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px}'
    + '.imc-chip{padding:6px 11px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap}'
    + '.imc-chip:hover{background:var(--bg-phone-secondary)}'
    + '.imc-chip.active{border-color:#EF4444;background:rgba(239,68,68,0.1);color:#EF4444}'
    + '.imc-list-head{display:flex;align-items:center;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px}'
    /* Empty */
    + '.imc-empty{padding:48px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.imc-empty>div{font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary)}'
    + '.imc-empty-sub{font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted) !important;font-weight:400 !important}'
    + '.imc-list{display:flex;flex-direction:column;gap:8px}'
    /* Event card */
    + '.imc-event{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;transition:all .15s}'
    + '.imc-event:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06)}'
    + '.imc-event--cancel{border-left:3px solid #F97316;background:linear-gradient(to right,rgba(249,115,22,0.03),transparent 60%)}'
    + '.imc-event--delete{border-left:3px solid #EF4444;background:linear-gradient(to right,rgba(239,68,68,0.03),transparent 60%)}'
    + '.imc-event-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.imc-event-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.imc-event-type{font:var(--fw-semibold) 10px/1 var(--font);text-transform:uppercase;letter-spacing:.3px}'
    + '.imc-event-status{font:var(--fw-semibold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full)}'
    + '.imc-event-name{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary);margin-top:5px}'
    + '.imc-event-meta{display:flex;gap:10px;flex-wrap:wrap;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:5px}'
    + '.imc-event-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.imc-event-reason{display:flex;align-items:flex-start;gap:5px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:3px solid;font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);font-style:italic;margin-top:8px}'
    + '.imc-quick-actions{display:flex;flex-direction:column;gap:4px;flex-shrink:0;align-items:flex-end}'
    + '.imc-quick-btn{width:28px;height:28px;border:1px solid var(--border-subtle);border-radius:var(--r-sm);background:var(--bg-phone);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}'
    + '.imc-quick-btn--mail{color:#3B82F6}'
    + '.imc-quick-btn--mail:hover{background:#3B82F6;color:#fff;border-color:#3B82F6}'
    + '.imc-quick-btn--notif{color:#8B5CF6}'
    + '.imc-quick-btn--notif:hover{background:#8B5CF6;color:#fff;border-color:#8B5CF6}'
    + '.imc-winback-btn{padding:6px 10px;border:none;border-radius:var(--r-full);background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:3px;box-shadow:0 2px 6px rgba(139,92,246,0.3);white-space:nowrap}'
    + '.imc-winback-btn:hover{opacity:0.92}'
    /* Detail */
    + '.imc-detail-hero{padding:16px;border-radius:var(--r-xl);color:#fff}'
    + '.imc-detail-avatar{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 20px/1 var(--font);flex-shrink:0}'
    + '.imc-detail-name{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.imc-detail-type{font:var(--fw-regular) 11px/1 var(--font);opacity:0.85;margin-top:5px}'
    + '.imc-detail-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.25)}'
    + '.imc-ds-cell{text-align:center}'
    + '.imc-ds-cell span{font:var(--fw-regular) 9px/1 var(--font);opacity:0.85;text-transform:uppercase;letter-spacing:.3px;display:block}'
    + '.imc-ds-cell b{font:var(--fw-bold) 13px/1 var(--font);display:block;margin-top:4px}'
    + '.imc-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:8px;margin-top:12px}'
    + '.imc-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary);flex-wrap:wrap}'
    + '.imc-sect-head span:first-of-type{flex:1}'
    + '.imc-reason-chip{font:var(--fw-bold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);letter-spacing:.3px}'
    + '.imc-contact-row{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);text-decoration:none;color:var(--text-primary);font:var(--fw-medium) var(--fs-xs)/1.2 var(--font);transition:background .15s}'
    + '.imc-contact-row:hover{background:rgba(59,130,246,0.08)}'
    + '.imc-reason-box{padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:3px solid;font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-secondary);font-style:italic}'
    + '.imc-actions{display:flex;flex-direction:column;gap:6px;margin-top:12px}'
    + '.imc-action-btn{padding:13px;border:none;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:opacity .15s}'
    + '.imc-action-btn:hover{opacity:0.92}'
    + '.imc-action-btn--winback{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;box-shadow:0 4px 14px rgba(139,92,246,0.35)}'
    + '.imc-action-btn--contact{background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;box-shadow:0 4px 14px rgba(239,68,68,0.35)}'
    + '.imc-action-btn-sec{padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px}'
    + '.imc-action-btn-sec:hover{border-color:#3B82F6;color:#3B82F6}'
    + '.imc-action-btn-ghost{padding:8px;border:none;background:transparent;color:var(--text-muted);font:var(--fw-medium) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;margin-top:4px}'
    + '.imc-action-btn-ghost:hover{color:#22C55E}'
    /* Winback modal */
    + '.imc-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:92;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.imc-modal-backdrop.open{background:rgba(15,23,42,0.7)}'
    + '.imc-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.imc-modal-backdrop.open .imc-modal{transform:translateY(0)}'
    + '.imc-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.imc-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle)}'
    + '.imc-mhead-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}'
    + '.imc-mtitle{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.imc-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.imc-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    /* AI suggest */
    + '.imc-ai-sugg{display:flex;align-items:flex-start;gap:8px;padding:12px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(236,72,153,0.04));border:1px solid rgba(139,92,246,0.25)}'
    + '.imc-ai-lbl{font:var(--fw-bold) 9px/1 var(--font);color:#8B5CF6;text-transform:uppercase;letter-spacing:.3px}'
    + '.imc-ai-text{font:var(--fw-medium) 11px/1.4 var(--font);color:var(--text-primary);margin-top:4px}'
    /* Sect in */
    + '.imc-sect-in{display:flex;flex-direction:column;gap:6px}'
    + '.imc-sect-head-in{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    /* Template list */
    + '.imc-tpl-list{display:flex;flex-direction:column;gap:4px}'
    + '.imc-tpl{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);cursor:pointer;transition:all .15s;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-primary)}'
    + '.imc-tpl:hover{background:var(--bg-phone-secondary)}'
    + '.imc-tpl-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}'
    /* Message area */
    + '.imc-msg-area{width:100%;box-sizing:border-box;min-height:140px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) 11px/1.5 var(--font);color:var(--text-primary);outline:none;resize:vertical;white-space:pre-wrap}'
    + '.imc-msg-area:focus{border-color:#8B5CF6}'
    /* Channel row */
    + '.imc-channel-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.imc-check-chip{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-full);cursor:pointer;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);text-transform:none;letter-spacing:0}'
    + '.imc-check-chip input{margin:0}'
    + '.imc-check-chip:has(input:checked){border-color:#8B5CF6;color:#8B5CF6;background:rgba(139,92,246,0.06)}'
    /* CTA */
    + '.imc-send-cta{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;font:var(--fw-bold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(139,92,246,0.35);transition:opacity .15s}'
    + '.imc-send-cta:hover{opacity:0.92}';
  var s = document.createElement('style');
  s.id = 'imcStyles';
  s.textContent = css;
  document.head.appendChild(s);
}

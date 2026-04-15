/* ═══ PAYMENT METHODS — CARDS + HISTORY + DETAIL (UI-only) ═══
 *
 * Entry: Hesabım → "Ödeme Yöntemlerim" tile → openPayments()
 *
 * Screens
 *  1. Management center: saved cards carousel + add card CTA + history list
 *  2. Add / Edit card (Luhn-validated)
 *  3. Payment detail (full breakdown, digital receipt, email option)
 *
 * Tüm state memory üzerinde. USER_PROFILE entegrasyonu yok — modül kendi
 * seed'ini kullanıyor.
 */

/* ── Seed Data ──────────────────────────────────────────────────────────── */
var _PAY_CARDS = [
  { id: 'c1', nick: 'Günlük Kartım', brand: 'visa',       holder: 'Furkan Şahin', last4: '4561', expMonth: 11, expYear: 27, color: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%)' },
  { id: 'c2', nick: 'Maaş Kartı',    brand: 'mastercard', holder: 'Furkan Şahin', last4: '8823', expMonth: 8,  expYear: 26, color: 'linear-gradient(135deg,#111827 0%,#374151 100%)' },
  { id: 'c3', nick: 'Troy World',    brand: 'troy',       holder: 'Furkan Şahin', last4: '0912', expMonth: 3,  expYear: 28, color: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 100%)' }
];

var _PAY_HISTORY = [
  { id: 'T-2104561', merchant: 'Burger House',       merchantIcon: 'solar:hamburger-linear', date: '2026-04-14T19:24', amount: 370,   vatRate: 10, cardLast4: '4561', orderRef: '#1042', channel: 'online' },
  { id: 'T-2104559', merchant: 'Piccola Pizza',      merchantIcon: 'solar:pizza-bold',       date: '2026-04-12T20:02', amount: 265,   vatRate: 10, cardLast4: '4561', orderRef: '#1055', channel: 'online' },
  { id: 'T-2104552', merchant: 'Kebapçı Mehmet',     merchantIcon: 'solar:chef-hat-bold',    date: '2026-04-10T13:05', amount: 880,   vatRate: 10, cardLast4: '8823', orderRef: '#1038', channel: 'dine-in', tableNo: 7 },
  { id: 'T-2104547', merchant: 'Green Bowl',         merchantIcon: 'solar:leaf-bold',        date: '2026-04-08T12:40', amount: 220,   vatRate: 10, cardLast4: '4561', orderRef: '#1031', channel: 'online', refunded: true },
  { id: 'T-2104540', merchant: 'Premium Abonelik',   merchantIcon: 'solar:crown-bold',       date: '2026-04-01T09:00', amount: 79,    vatRate: 20, cardLast4: '8823', orderRef: 'SUB-APR', channel: 'subscription' },
  { id: 'T-2104521', merchant: 'Mahalle Kahvecisi',  merchantIcon: 'solar:coffee-cup-bold',  date: '2026-03-27T10:15', amount: 95,    vatRate: 10, cardLast4: '0912', orderRef: '#1019', channel: 'dine-in', tableNo: 3 },
  { id: 'T-2104502', merchant: 'Sushi Bar',          merchantIcon: 'solar:gift-bold',        date: '2026-03-20T21:10', amount: 540,   vatRate: 10, cardLast4: '4561', orderRef: '#1014', channel: 'online' }
];

var _PAY_BRAND_LABELS = { visa: 'VISA', mastercard: 'Mastercard', troy: 'Troy', amex: 'AmEx', unknown: 'Card' };

/* ── Tiny helpers ───────────────────────────────────────────────────────── */
function _payEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function _payFmtTL(v) {
  return Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}
function _payFmtDate(iso) {
  var d = new Date(iso);
  var dd = String(d.getDate()).padStart(2, '0');
  var mm = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()];
  var hh = String(d.getHours()).padStart(2, '0');
  var mn = String(d.getMinutes()).padStart(2, '0');
  return dd + ' ' + mm + ' ' + d.getFullYear() + ' · ' + hh + ':' + mn;
}
function _payFmtExp(m, y) {
  return String(m).padStart(2, '0') + '/' + String(y).padStart(2, '0');
}

/* Brand detection from BIN */
function _payDetectBrand(num) {
  var s = String(num || '').replace(/\s/g, '');
  if (/^4/.test(s)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(s)) return 'mastercard';
  if (/^(9792|65|364)/.test(s)) return 'troy';
  if (/^3[47]/.test(s)) return 'amex';
  return 'unknown';
}

/* Luhn check */
function _payLuhnValid(num) {
  var s = String(num || '').replace(/\D/g, '');
  if (s.length < 13 || s.length > 19) return false;
  var sum = 0, alt = false;
  for (var i = s.length - 1; i >= 0; i--) {
    var n = parseInt(s.charAt(i), 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function _payBrandIcon(brand, size) {
  size = size || 24;
  var map = {
    visa:       { icon: 'logos:visa',       fallback: 'solar:card-bold' },
    mastercard: { icon: 'logos:mastercard', fallback: 'solar:card-bold' },
    troy:       { icon: 'solar:card-bold',  fallback: 'solar:card-bold' },
    amex:       { icon: 'logos:amex',       fallback: 'solar:card-bold' },
    unknown:    { icon: 'solar:card-bold',  fallback: 'solar:card-bold' }
  };
  var m = map[brand] || map.unknown;
  return '<iconify-icon icon="' + m.icon + '" style="font-size:' + size + 'px"></iconify-icon>';
}

function _payBrandBadge(brand) {
  var bg = { visa: '#fff', mastercard: '#fff', troy: '#fff', amex: '#fff', unknown: '#fff' }[brand] || '#fff';
  return '<span style="display:inline-flex;align-items:center;gap:6px;background:' + bg + ';color:#111;padding:4px 8px;border-radius:6px;font:var(--fw-bold) 11px/1 var(--font);letter-spacing:.5px">'
    + _payBrandIcon(brand, 16)
    + '<span>' + _PAY_BRAND_LABELS[brand] + '</span>'
    + '</span>';
}

function _payInjectStyle() {
  if (document.getElementById('payStyles')) return;
  var s = document.createElement('style');
  s.id = 'payStyles';
  s.textContent = [
    '@keyframes paySlideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.pay-card-vis{flex:0 0 260px;height:160px;border-radius:var(--r-xl);padding:14px;color:#fff;position:relative;box-shadow:0 6px 18px rgba(0,0,0,.15);overflow:hidden;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer}',
    '.pay-card-vis::before{content:"";position:absolute;right:-60px;top:-60px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.08)}',
    '.pay-card-vis::after{content:"";position:absolute;right:-30px;bottom:-90px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.05)}',
    '.pay-add-card{flex:0 0 260px;height:160px;border-radius:var(--r-xl);border:2px dashed var(--border-subtle);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--text-secondary);cursor:pointer;background:var(--bg-phone);transition:border-color .15s,background .15s;scroll-snap-align:start}',
    '.pay-add-card:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-soft)}',
    '.pay-scroller{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 2px 14px;scrollbar-width:none}',
    '.pay-scroller::-webkit-scrollbar{display:none}',
    '.pay-input{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1.2 var(--font);color:var(--text-primary);outline:none;width:100%;font-family:inherit}',
    '.pay-input.err{border-color:#EF4444;background:rgba(239,68,68,.04)}',
    '.pay-input:focus{border-color:var(--primary)}',
    '.pay-chip{padding:8px 12px;border-radius:999px;background:var(--bg-btn);border:1px solid var(--border-subtle);font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);cursor:pointer;display:inline-flex;align-items:center;gap:5px}',
    '.pay-hist-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);cursor:pointer;transition:transform .12s}',
    '.pay-hist-row:active{transform:scale(.98)}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════════════════
 * SCREEN 1: MANAGEMENT CENTER
 * ══════════════════════════════════════════════════════════════════════════ */
function openPayments() {
  _payInjectStyle();
  var existing = document.getElementById('payOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'payOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'display:flex;z-index:60';

  overlay.innerHTML = ''
    + '<div class="prof-container" style="background:var(--bg-page)">'
    +   '<div class="prof-topbar" style="background:var(--bg-page);border-bottom:1px solid var(--border-subtle)">'
    +     '<div class="btn-icon" onclick="closePayments()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +     '<span class="prof-topbar-name" style="flex:1;text-align:center">Ödeme Yöntemlerim</span>'
    +     '<div style="width:36px"></div>'
    +   '</div>'
    +   '<div id="payBody" style="padding:14px 0 24px;display:flex;flex-direction:column;gap:16px"></div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  _payRenderBody();
}

function closePayments() {
  var el = document.getElementById('payOverlay');
  if (el) el.remove();
}

function _payRenderBody() {
  var body = document.getElementById('payBody');
  if (!body) return;

  // ── Cards section ──
  var cardsLabel = '<div style="padding:0 16px;display:flex;align-items:center;justify-content:space-between">'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Kayıtlı Kartlarım (' + _PAY_CARDS.length + ')</div>'
    + '<span style="display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 10px/1 var(--font);color:var(--text-tertiary)"><iconify-icon icon="solar:shield-check-bold" style="font-size:13px;color:#22C55E"></iconify-icon>256-bit şifreli</span>'
    + '</div>';

  var carousel = '<div class="pay-scroller" style="padding-left:16px;padding-right:16px">'
    + _PAY_CARDS.map(_payVisCardHtml).join('')
    + '<div class="pay-add-card" onclick="openAddCard()">'
    +   '<div style="width:44px;height:44px;border-radius:50%;background:var(--primary-soft);display:flex;align-items:center;justify-content:center">'
    +     '<iconify-icon icon="solar:add-circle-bold" style="font-size:24px;color:var(--primary)"></iconify-icon>'
    +   '</div>'
    +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--primary)">Kart Ekle</div>'
    +   '<div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);text-align:center;max-width:180px">Luhn doğrulamalı, güvenli giriş</div>'
    + '</div>'
    + '</div>';

  // Add card footer button (prominent secondary)
  var addBtn = '<div style="padding:0 16px">'
    + '<button onclick="openAddCard()" style="width:100%;padding:14px;border-radius:var(--r-xl);background:var(--primary-soft);border:1px solid var(--primary);color:var(--primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px">'
    +   '<iconify-icon icon="solar:card-linear" style="font-size:18px"></iconify-icon>Yeni Kart Ekle'
    + '</button>'
    + '</div>';

  // ── History section ──
  var histLabel = '<div style="padding:0 16px;display:flex;align-items:center;justify-content:space-between">'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Geçmiş Ödemelerim</div>'
    + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">' + _PAY_HISTORY.length + ' işlem</span>'
    + '</div>';

  var histList = '<div style="padding:0 16px;display:flex;flex-direction:column;gap:8px">'
    + _PAY_HISTORY.map(_payHistoryRowHtml).join('')
    + '</div>';

  body.innerHTML = cardsLabel + carousel + addBtn + histLabel + histList;
}

function _payVisCardHtml(c) {
  return ''
    + '<div class="pay-card-vis" style="background:' + c.color + '" onclick="openEditCard(\'' + c.id + '\')">'
    +   '<div style="display:flex;align-items:flex-start;justify-content:space-between;position:relative;z-index:1">'
    +     '<div>'
    +       '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7;letter-spacing:.5px;text-transform:uppercase">Takma Ad</div>'
    +       '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);margin-top:4px">' + _payEsc(c.nick) + '</div>'
    +     '</div>'
    +     '<div onclick="event.stopPropagation();openEditCard(\'' + c.id + '\')" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;cursor:pointer" title="Düzenle">'
    +       '<iconify-icon icon="solar:pen-2-linear" style="font-size:14px"></iconify-icon>'
    +     '</div>'
    +   '</div>'
    +   '<div style="position:relative;z-index:1">'
    +     '<div style="font:var(--fw-semibold) 17px/1 var(--font);letter-spacing:3px;font-family:\'SF Mono\',\'Menlo\',monospace">•••• •••• •••• ' + c.last4 + '</div>'
    +     '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:10px">'
    +       '<div>'
    +         '<div style="font:var(--fw-regular) 9px/1 var(--font);opacity:.7;letter-spacing:.5px;text-transform:uppercase">Kart Sahibi</div>'
    +         '<div style="font:var(--fw-semibold) 12px/1.2 var(--font);margin-top:3px">' + _payEsc(c.holder.toUpperCase()) + '</div>'
    +       '</div>'
    +       '<div style="text-align:right">'
    +         '<div style="font:var(--fw-regular) 9px/1 var(--font);opacity:.7;letter-spacing:.5px;text-transform:uppercase">Exp</div>'
    +         '<div style="font:var(--fw-semibold) 12px/1.2 var(--font);margin-top:3px">' + _payFmtExp(c.expMonth, c.expYear) + '</div>'
    +       '</div>'
    +       '<div style="display:flex;align-items:center">' + _payBrandBadge(c.brand) + '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function _payHistoryRowHtml(t) {
  var refundPill = t.refunded
    ? '<span style="display:inline-flex;padding:2px 7px;border-radius:999px;background:rgba(239,68,68,.1);color:#EF4444;font:var(--fw-semibold) 10px/1 var(--font);margin-top:4px">İade Edildi</span>'
    : '';
  var channelPill = '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:999px;background:var(--bg-btn);color:var(--text-secondary);font:var(--fw-medium) 10px/1 var(--font);margin-top:4px">'
    + '<iconify-icon icon="' + (t.channel === 'dine-in' ? 'solar:sofa-2-linear' : (t.channel === 'subscription' ? 'solar:crown-linear' : 'solar:bag-check-linear')) + '" style="font-size:11px"></iconify-icon>'
    + (t.channel === 'dine-in' ? 'Masa #' + t.tableNo : (t.channel === 'subscription' ? 'Abonelik' : 'Online'))
    + '</span>';

  return ''
    + '<div class="pay-hist-row" onclick="openPaymentDetail(\'' + t.id + '\')">'
    +   '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +     '<iconify-icon icon="' + t.merchantIcon + '" style="font-size:22px;color:var(--primary)"></iconify-icon>'
    +   '</div>'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _payEsc(t.merchant) + '</div>'
    +     '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _payFmtDate(t.date) + ' · •••• ' + t.cardLast4 + '</div>'
    +     '<div style="display:flex;gap:6px;flex-wrap:wrap">' + channelPill + refundPill + '</div>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">'
    +     '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + (t.refunded ? 'var(--text-muted)' : 'var(--text-primary)') + ';' + (t.refunded ? 'text-decoration:line-through' : '') + '">' + _payFmtTL(t.amount) + '</div>'
    +     '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-tertiary)"></iconify-icon>'
    +   '</div>'
    + '</div>';
}

/* ══════════════════════════════════════════════════════════════════════════
 * ADD / EDIT CARD
 * ══════════════════════════════════════════════════════════════════════════ */
var _payForm = { id: null, nick: '', number: '', holder: '', expMonth: '', expYear: '', cvv: '' };
var _payFormErrors = {};

function openAddCard() {
  _payForm = { id: null, nick: '', number: '', holder: '', expMonth: '', expYear: '', cvv: '' };
  _payFormErrors = {};
  _payOpenCardForm('add');
}

function openEditCard(id) {
  var c = _PAY_CARDS.find(function (x) { return x.id === id; });
  if (!c) return;
  _payForm = { id: c.id, nick: c.nick, number: '•••• •••• •••• ' + c.last4, holder: c.holder, expMonth: c.expMonth, expYear: c.expYear, cvv: '' };
  _payFormErrors = {};
  _payOpenCardForm('edit');
}

function _payOpenCardForm(mode) {
  _payInjectStyle();
  var existing = document.getElementById('payFormModal');
  if (existing) existing.remove();

  var isEdit = mode === 'edit';
  var modal = document.createElement('div');
  modal.id = 'payFormModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:95;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };

  modal.innerHTML = ''
    + '<div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;max-height:94vh;overflow:auto;animation:paySlideUp .22s ease;display:flex;flex-direction:column">'
    +   '<div style="padding:18px 18px 12px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px">'
    +     '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +       '<iconify-icon icon="solar:card-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>'
    +     '</div>'
    +     '<div style="flex:1;min-width:0">'
    +       '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">' + (isEdit ? 'Kartı Düzenle' : 'Yeni Kart Ekle') + '</div>'
    +       '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + (isEdit ? 'Takma ad & son kullanma bilgilerini güncelle' : 'Güvenli, Luhn doğrulamalı giriş') + '</div>'
    +     '</div>'
    +     '<div class="btn-icon" onclick="document.getElementById(\'payFormModal\').remove()" style="width:32px;height:32px;flex-shrink:0"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>'
    +   '</div>'
    +   '<div id="payFormBody" style="padding:16px 18px;display:flex;flex-direction:column;gap:12px"></div>'
    +   '<div style="padding:12px 18px max(env(safe-area-inset-bottom),16px);border-top:1px solid var(--border-subtle);display:flex;gap:8px">'
    +     (isEdit ? '<button onclick="_payDeleteConfirm(\'' + _payForm.id + '\')" style="flex:0 0 auto;padding:14px;border-radius:var(--r-xl);background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#EF4444;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px"><iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:16px"></iconify-icon>Sil</button>' : '')
    +     '<button id="payFormSubmit" onclick="_paySubmitForm(\'' + mode + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--primary);border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:check-circle-linear" style="font-size:16px"></iconify-icon>' + (isEdit ? 'Değişiklikleri Kaydet' : 'Kartı Kaydet') + '</button>'
    +   '</div>'
    + '</div>';

  document.body.appendChild(modal);
  _payRenderFormBody(mode);
}

function _payRenderFormBody(mode) {
  var body = document.getElementById('payFormBody');
  if (!body) return;
  var isEdit = mode === 'edit';
  var numLocked = isEdit;

  var brand = _payDetectBrand(_payForm.number);
  var preview = '<div class="pay-card-vis" style="flex:1 1 auto;height:170px;background:' + (_PAY_CARDS[0] ? _PAY_CARDS[0].color : 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%)') + '">'
    + '<div style="display:flex;justify-content:space-between;position:relative;z-index:1">'
    +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);opacity:.9">' + _payEsc(_payForm.nick || 'Takma Ad') + '</div>'
    +   '<div>' + _payBrandBadge(brand) + '</div>'
    + '</div>'
    + '<div style="position:relative;z-index:1">'
    +   '<div style="font:var(--fw-semibold) 17px/1 var(--font);letter-spacing:3px;font-family:monospace">' + _payEsc(_payForm.number || '•••• •••• •••• ••••') + '</div>'
    +   '<div style="display:flex;justify-content:space-between;margin-top:10px">'
    +     '<div><div style="font:var(--fw-regular) 9px/1 var(--font);opacity:.7;text-transform:uppercase">Kart Sahibi</div><div style="font:var(--fw-semibold) 12px/1.2 var(--font);margin-top:3px">' + _payEsc((_payForm.holder || 'AD SOYAD').toUpperCase()) + '</div></div>'
    +     '<div style="text-align:right"><div style="font:var(--fw-regular) 9px/1 var(--font);opacity:.7;text-transform:uppercase">Exp</div><div style="font:var(--fw-semibold) 12px/1.2 var(--font);margin-top:3px">' + (_payForm.expMonth ? _payFmtExp(_payForm.expMonth, _payForm.expYear || 'YY') : 'MM/YY') + '</div></div>'
    +   '</div>'
    + '</div>'
    + '</div>';

  function field(label, inputHtml, errKey) {
    var err = _payFormErrors[errKey];
    return '<label style="display:flex;flex-direction:column;gap:5px">'
      + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + label + '</span>'
      + inputHtml
      + (err ? '<span style="font:var(--fw-regular) 11px/1.3 var(--font);color:#EF4444;display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="solar:danger-circle-linear" style="font-size:12px"></iconify-icon>' + err + '</span>' : '')
      + '</label>';
  }

  var nickIn  = '<input class="pay-input' + (_payFormErrors.nick ? ' err' : '') + '" placeholder="Örn: Günlük Kartım" maxlength="24" value="' + _payEsc(_payForm.nick) + '" oninput="_payOnField(\'nick\',this.value)">';
  var numIn   = '<input class="pay-input' + (_payFormErrors.number ? ' err' : '') + '" placeholder="1234 5678 9012 3456" inputmode="numeric" maxlength="23" value="' + _payEsc(_payForm.number) + '" ' + (numLocked ? 'disabled' : '') + ' oninput="_payOnCardNumber(this)" style="font-family:monospace;letter-spacing:1px' + (numLocked ? ';opacity:.7' : '') + '">';
  var holderIn= '<input class="pay-input' + (_payFormErrors.holder ? ' err' : '') + '" placeholder="Ad Soyad" value="' + _payEsc(_payForm.holder) + '" oninput="_payOnField(\'holder\',this.value)" style="text-transform:uppercase">';
  var expIn   = '<div style="display:flex;gap:8px">'
    + '<input class="pay-input' + (_payFormErrors.exp ? ' err' : '') + '" placeholder="AA" inputmode="numeric" maxlength="2" value="' + _payEsc(_payForm.expMonth) + '" oninput="_payOnExp(\'m\',this.value)" style="text-align:center;font-family:monospace">'
    + '<input class="pay-input' + (_payFormErrors.exp ? ' err' : '') + '" placeholder="YY" inputmode="numeric" maxlength="2" value="' + _payEsc(_payForm.expYear) + '" oninput="_payOnExp(\'y\',this.value)" style="text-align:center;font-family:monospace">'
    + '</div>';
  var cvvIn   = '<input class="pay-input' + (_payFormErrors.cvv ? ' err' : '') + '" placeholder="•••" inputmode="numeric" maxlength="4" value="' + _payEsc(_payForm.cvv) + '" oninput="_payOnField(\'cvv\',this.value.replace(/\\D/g,\'\'))" style="text-align:center;font-family:monospace;letter-spacing:2px" ' + (numLocked ? 'disabled' : '') + '>';

  body.innerHTML = preview
    + field('Takma Ad', nickIn, 'nick')
    + field('Kart Numarası' + (numLocked ? ' (değiştirilemez)' : ''), numIn, 'number')
    + field('Kart Üzerindeki İsim', holderIn, 'holder')
    + '<div style="display:grid;grid-template-columns:2fr 1fr;gap:10px">'
    +   field('Son Kullanma', expIn, 'exp')
    +   field('CVV' + (numLocked ? ' (değiştirilemez)' : ''), cvvIn, 'cvv')
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--primary-soft);border:1px solid var(--primary);border-radius:var(--r-lg);color:var(--primary)">'
    +   '<iconify-icon icon="solar:shield-check-bold" style="font-size:18px;flex-shrink:0"></iconify-icon>'
    +   '<span style="font:var(--fw-medium) 11px/1.4 var(--font)">Bilgilerin 256-bit TLS ile şifrelenir ve yalnızca maskeli halde saklanır.</span>'
    + '</div>';
}

function _payOnField(k, v) {
  _payForm[k] = v;
  if (_payFormErrors[k]) { delete _payFormErrors[k]; }
}

function _payOnCardNumber(inp) {
  // format: groups of 4
  var digits = (inp.value || '').replace(/\D/g, '').slice(0, 19);
  var groups = digits.match(/.{1,4}/g) || [];
  var formatted = groups.join(' ');
  inp.value = formatted;
  _payForm.number = formatted;
  if (_payFormErrors.number) { delete _payFormErrors.number; }

  // update brand badge in preview without full rerender (quick path)
  var brand = _payDetectBrand(digits);
  // re-render since badge area needs refresh
  var body = document.getElementById('payFormBody');
  if (body) {
    var preview = body.querySelector('.pay-card-vis');
    if (preview) {
      var numLine = preview.querySelector('div[style*="letter-spacing:3px"]');
      if (numLine) numLine.textContent = formatted || '•••• •••• •••• ••••';
      var badge = preview.querySelector('span[style*="background:#fff"]');
      if (badge) badge.outerHTML = _payBrandBadge(brand);
    }
  }
}

function _payOnExp(which, v) {
  v = (v || '').replace(/\D/g, '').slice(0, 2);
  if (which === 'm') _payForm.expMonth = v;
  else _payForm.expYear = v;
  if (_payFormErrors.exp) { delete _payFormErrors.exp; }
  // update preview exp quickly
  var body = document.getElementById('payFormBody');
  if (body) {
    var expEl = body.querySelector('.pay-card-vis div[style*="text-align:right"] div[style*="margin-top:3px"]');
    if (expEl) expEl.textContent = _payForm.expMonth ? _payFmtExp(_payForm.expMonth || 'MM', _payForm.expYear || 'YY') : 'MM/YY';
  }
}

function _payValidateForm(mode) {
  var e = {};
  var isEdit = mode === 'edit';
  if (!_payForm.nick || _payForm.nick.trim().length < 2) e.nick = 'Takma ad en az 2 karakter olmalı.';

  if (!isEdit) {
    var digits = (_payForm.number || '').replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) e.number = 'Kart numarası 13–19 hane olmalı.';
    else if (!_payLuhnValid(digits)) e.number = 'Kart numarası geçersiz (Luhn kontrolü başarısız).';

    var cvv = (_payForm.cvv || '').replace(/\D/g, '');
    if (cvv.length < 3) e.cvv = 'CVV 3–4 hane olmalı.';
  }

  if (!_payForm.holder || _payForm.holder.trim().length < 3) e.holder = 'Ad soyad en az 3 karakter olmalı.';

  var m = parseInt(_payForm.expMonth, 10);
  var y = parseInt(_payForm.expYear, 10);
  if (!m || m < 1 || m > 12 || isNaN(y)) e.exp = 'Geçerli bir tarih gir.';
  else {
    var now = new Date();
    var thisYY = now.getFullYear() % 100;
    var thisMM = now.getMonth() + 1;
    if (y < thisYY || (y === thisYY && m < thisMM)) e.exp = 'Son kullanma tarihi geçmiş.';
  }
  return e;
}

function _paySubmitForm(mode) {
  var errs = _payValidateForm(mode);
  _payFormErrors = errs;
  if (Object.keys(errs).length) { _payRenderFormBody(mode); return; }

  if (mode === 'edit') {
    var c = _PAY_CARDS.find(function (x) { return x.id === _payForm.id; });
    if (c) {
      c.nick = _payForm.nick.trim();
      c.holder = _payForm.holder.trim();
      c.expMonth = parseInt(_payForm.expMonth, 10);
      c.expYear = parseInt(_payForm.expYear, 10);
    }
  } else {
    var digits = (_payForm.number || '').replace(/\D/g, '');
    var newCard = {
      id: 'c' + (Date.now().toString(36)),
      nick: _payForm.nick.trim(),
      brand: _payDetectBrand(digits),
      holder: _payForm.holder.trim(),
      last4: digits.slice(-4),
      expMonth: parseInt(_payForm.expMonth, 10),
      expYear: parseInt(_payForm.expYear, 10),
      color: ['linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%)', 'linear-gradient(135deg,#111827 0%,#374151 100%)', 'linear-gradient(135deg,#7C3AED 0%,#A855F7 100%)', 'linear-gradient(135deg,#0F766E 0%,#14B8A6 100%)'][_PAY_CARDS.length % 4]
    };
    _PAY_CARDS.push(newCard);
  }

  document.getElementById('payFormModal')?.remove();
  _payRenderBody();
  _payToast(mode === 'edit' ? 'Kart güncellendi' : 'Yeni kart eklendi');
}

function _payDeleteConfirm(id) {
  var c = _PAY_CARDS.find(function (x) { return x.id === id; });
  if (!c) return;
  var existing = document.getElementById('payDeleteModal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'payDeleteModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:96;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = ''
    + '<div style="width:100%;max-width:340px;background:var(--bg-page);border-radius:var(--r-2xl);padding:22px 20px;display:flex;flex-direction:column;gap:12px;animation:paySlideUp .2s ease">'
    +   '<div style="display:flex;align-items:center;gap:12px">'
    +     '<div style="width:44px;height:44px;border-radius:50%;background:rgba(239,68,68,.12);display:flex;align-items:center;justify-content:center">'
    +       '<iconify-icon icon="solar:shield-warning-bold" style="font-size:24px;color:#EF4444"></iconify-icon>'
    +     '</div>'
    +     '<div style="flex:1"><div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Kartı Sil</div>'
    +     '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _payEsc(c.nick) + ' · •••• ' + c.last4 + '</div></div>'
    +   '</div>'
    +   '<div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary)">Bu kartı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve bu kartla otomatik ödemeleriniz etkilenebilir.</div>'
    +   '<div style="display:flex;gap:8px;margin-top:4px">'
    +     '<button onclick="document.getElementById(\'payDeleteModal\').remove()" style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>'
    +     '<button onclick="_payDoDelete(\'' + id + '\')" style="flex:1;padding:12px;border-radius:var(--r-lg);background:#EF4444;border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Evet, Sil</button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(modal);
}

function _payDoDelete(id) {
  var idx = _PAY_CARDS.findIndex(function (x) { return x.id === id; });
  if (idx >= 0) _PAY_CARDS.splice(idx, 1);
  document.getElementById('payDeleteModal')?.remove();
  document.getElementById('payFormModal')?.remove();
  _payRenderBody();
  _payToast('Kart silindi');
}

/* ══════════════════════════════════════════════════════════════════════════
 * PAYMENT DETAIL
 * ══════════════════════════════════════════════════════════════════════════ */
function openPaymentDetail(id) {
  _payInjectStyle();
  var t = _PAY_HISTORY.find(function (x) { return x.id === id; });
  if (!t) return;

  var existing = document.getElementById('payDetailOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'payDetailOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'display:flex;z-index:65';

  var subtotal = +(t.amount / (1 + t.vatRate / 100)).toFixed(2);
  var vat = +(t.amount - subtotal).toFixed(2);

  var channelLabel = t.channel === 'dine-in' ? 'Masa Siparişi · Masa #' + t.tableNo
    : t.channel === 'subscription' ? 'Abonelik Ödemesi'
    : 'Online Sipariş';
  var channelIcon = t.channel === 'dine-in' ? 'solar:sofa-2-bold'
    : t.channel === 'subscription' ? 'solar:crown-bold'
    : 'solar:bag-check-bold';

  var card = _PAY_CARDS.find(function (c) { return c.last4 === t.cardLast4; });

  overlay.innerHTML = ''
    + '<div class="prof-container" style="background:var(--bg-page)">'
    +   '<div class="prof-topbar" style="background:var(--bg-page);border-bottom:1px solid var(--border-subtle)">'
    +     '<div class="btn-icon" onclick="closePaymentDetail()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +     '<span class="prof-topbar-name" style="flex:1;text-align:center">İşlem Detayı</span>'
    +     '<div class="btn-icon" onclick="_payShareReceipt(\'' + t.id + '\')"><iconify-icon icon="solar:share-linear" style="font-size:20px"></iconify-icon></div>'
    +   '</div>'
    +   '<div style="padding:16px;display:flex;flex-direction:column;gap:14px;padding-bottom:120px">'

    // Hero
    +     '<div style="background:' + (t.refunded ? 'rgba(239,68,68,.08)' : 'rgba(34,197,94,.08)') + ';border:1px solid ' + (t.refunded ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)') + ';border-radius:var(--r-xl);padding:18px;text-align:center;display:flex;flex-direction:column;gap:6px">'
    +       '<iconify-icon icon="' + (t.refunded ? 'solar:close-circle-bold' : 'solar:check-circle-bold') + '" style="font-size:42px;color:' + (t.refunded ? '#EF4444' : '#22C55E') + ';margin:0 auto"></iconify-icon>'
    +       '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:' + (t.refunded ? '#EF4444' : '#22C55E') + ';margin-top:4px">' + (t.refunded ? 'İade Edildi' : 'Başarılı Ödeme') + '</div>'
    +       '<div style="font:var(--fw-bold) 28px/1 var(--font);color:var(--text-primary);margin-top:6px' + (t.refunded ? ';text-decoration:line-through' : '') + '">' + _payFmtTL(t.amount) + '</div>'
    +       '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _payFmtDate(t.date) + '</div>'
    +     '</div>'

    // Summary
    +     '<div>'
    +       '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">İşlem Özeti</div>'
    +       '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +         _payRow('İşlem Numarası', t.id, true)
    +         _payRow('Ara Toplam',     _payFmtTL(subtotal))
    +         _payRow('KDV (%' + t.vatRate + ')', _payFmtTL(vat))
    +         _payRow('Toplam Tutar',   _payFmtTL(t.amount), false, true)
    +       '</div>'
    +     '</div>'

    // Service detail
    +     '<div>'
    +       '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Hizmet Detayı</div>'
    +       '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;display:flex;flex-direction:column;gap:10px">'
    +         '<div style="display:flex;align-items:center;gap:12px">'
    +           '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +             '<iconify-icon icon="' + t.merchantIcon + '" style="font-size:22px;color:var(--primary)"></iconify-icon>'
    +           '</div>'
    +           '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _payEsc(t.merchant) + '</div>'
    +           '<div style="display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-top:4px"><iconify-icon icon="' + channelIcon + '" style="font-size:13px"></iconify-icon>' + channelLabel + '</div></div>'
    +         '</div>'
    +         '<div onclick="_payGoToOrder(\'' + t.orderRef + '\')" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--primary-soft);border-radius:var(--r-lg);cursor:pointer">'
    +           '<iconify-icon icon="solar:arrow-right-up-linear" style="font-size:18px;color:var(--primary)"></iconify-icon>'
    +           '<div style="flex:1;font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--primary)">Sipariş Özetine Git (' + _payEsc(t.orderRef) + ')</div>'
    +           '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--primary)"></iconify-icon>'
    +         '</div>'
    +       '</div>'
    +     '</div>'

    // Paid with card
    +     '<div>'
    +       '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Ödeme Yöntemi</div>'
    +       '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px">'
    +         '<div style="width:42px;height:28px;border-radius:4px;background:' + (card ? card.color : 'linear-gradient(135deg,#1E3A8A,#2563EB)') + ';flex-shrink:0"></div>'
    +         '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _payEsc(card ? card.nick : 'Kart') + '</div>'
    +         '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);font-family:monospace;margin-top:2px">**** **** **** ' + t.cardLast4 + '</div></div>'
    +         (card ? _payBrandBadge(card.brand) : '')
    +       '</div>'
    +     '</div>'
    +   '</div>'

    // Footer actions
    +   '<div style="position:absolute;left:0;right:0;bottom:0;padding:12px 16px max(env(safe-area-inset-bottom),12px);background:var(--bg-page);border-top:1px solid var(--border-subtle);display:flex;gap:8px">'
    +     '<button onclick="_payOpenReceipt(\'' + t.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:document-text-linear" style="font-size:16px"></iconify-icon>Dijital Makbuz</button>'
    +     '<button onclick="_payEmailReceipt(\'' + t.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--primary);border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:letter-linear" style="font-size:16px"></iconify-icon>E-posta Gönder</button>'
    +   '</div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
}

function closePaymentDetail() {
  var el = document.getElementById('payDetailOverlay');
  if (el) el.remove();
}

function _payRow(label, value, mono, emphasize) {
  return '<div style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);' + (emphasize ? 'background:var(--primary-soft)' : '') + '">'
    + '<span style="font:' + (emphasize ? 'var(--fw-bold) var(--fs-md)' : 'var(--fw-regular) var(--fs-sm)') + '/1 var(--font);color:' + (emphasize ? 'var(--primary)' : 'var(--text-muted)') + '">' + label + '</span>'
    + '<span style="font:' + (emphasize ? 'var(--fw-bold) var(--fs-md)' : 'var(--fw-medium) var(--fs-sm)') + '/1 var(--font);color:' + (emphasize ? 'var(--primary)' : 'var(--text-primary)') + ';' + (mono ? 'font-family:monospace' : '') + '">' + value + '</span>'
    + '</div>';
}

function _payShareReceipt(id) {
  var t = _PAY_HISTORY.find(function (x) { return x.id === id; });
  if (!t) return;
  var txt = 'YemekApp Makbuz · ' + t.merchant + ' · ' + _payFmtTL(t.amount) + ' · ' + t.id;
  if (navigator.share) navigator.share({ title: 'Makbuz ' + t.id, text: txt }).catch(function(){});
  else if (navigator.clipboard) { navigator.clipboard.writeText(txt).catch(function(){}); _payToast('Makbuz bilgisi kopyalandı'); }
}

function _payOpenReceipt(id) {
  var t = _PAY_HISTORY.find(function (x) { return x.id === id; });
  if (!t) return;
  var subtotal = +(t.amount / (1 + t.vatRate / 100)).toFixed(2);
  var vat = +(t.amount - subtotal).toFixed(2);

  var existing = document.getElementById('payReceiptModal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'payReceiptModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:97;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = ''
    + '<div style="width:100%;max-width:340px;background:#fff;color:#111;border-radius:var(--r-xl);padding:22px 20px;display:flex;flex-direction:column;gap:14px;animation:paySlideUp .25s ease;box-shadow:0 20px 60px rgba(0,0,0,.4);font-family:monospace">'
    +   '<div style="text-align:center">'
    +     '<div style="font:var(--fw-bold) 16px/1.2 var(--font);color:#111">YemekApp Dijital Makbuz</div>'
    +     '<div style="font:var(--fw-regular) 10px/1 var(--font);color:#666;margin-top:4px">Bu elektronik bir makbuzdur · e-Fatura değildir</div>'
    +   '</div>'
    +   '<div style="border-top:1px dashed #ccc;border-bottom:1px dashed #ccc;padding:10px 0;display:flex;flex-direction:column;gap:4px">'
    +     '<div style="display:flex;justify-content:space-between;font-size:12px"><span>İşlem No</span><span>' + _payEsc(t.id) + '</span></div>'
    +     '<div style="display:flex;justify-content:space-between;font-size:12px"><span>Tarih</span><span>' + _payFmtDate(t.date) + '</span></div>'
    +     '<div style="display:flex;justify-content:space-between;font-size:12px"><span>İşletme</span><span>' + _payEsc(t.merchant) + '</span></div>'
    +     '<div style="display:flex;justify-content:space-between;font-size:12px"><span>Kart</span><span>•••• ' + t.cardLast4 + '</span></div>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:4px">'
    +     '<div style="display:flex;justify-content:space-between;font-size:12px"><span>Ara Toplam</span><span>' + _payFmtTL(subtotal) + '</span></div>'
    +     '<div style="display:flex;justify-content:space-between;font-size:12px"><span>KDV (%' + t.vatRate + ')</span><span>' + _payFmtTL(vat) + '</span></div>'
    +     '<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:15px;padding-top:6px;border-top:1px solid #111"><span>TOPLAM</span><span>' + _payFmtTL(t.amount) + '</span></div>'
    +   '</div>'
    +   '<div style="text-align:center;font:var(--fw-regular) 10px/1.4 var(--font);color:#888">Teşekkür ederiz — yemekapp.com</div>'
    +   '<button onclick="document.getElementById(\'payReceiptModal\').remove()" style="padding:12px;border-radius:var(--r-lg);background:#111;color:#fff;border:none;font:var(--fw-semibold) 13px/1 var(--font);cursor:pointer">Kapat</button>'
    + '</div>';
  document.body.appendChild(modal);
}

function _payEmailReceipt(id) {
  _payToast('Makbuz e-posta adresine gönderildi');
}

function _payGoToOrder(ref) {
  // Hook to existing orders flow if available
  if (typeof openOrderDetail === 'function' && ref && ref.startsWith('#')) {
    closePaymentDetail();
    openOrderDetail(ref);
  } else {
    _payToast('Sipariş: ' + ref);
  }
}

/* ── Toast ──────────────────────────────────────────────────────────────── */
function _payToast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);color:#fff;padding:10px 16px;border-radius:999px;font:var(--fw-medium) 13px/1 var(--font);z-index:200;animation:paySlideUp .2s ease';
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 1800);
}

/* ── Window exports ─────────────────────────────────────────────────────── */
window.openPayments = openPayments;
window.closePayments = closePayments;
window.openAddCard = openAddCard;
window.openEditCard = openEditCard;
window.openPaymentDetail = openPaymentDetail;
window.closePaymentDetail = closePaymentDetail;
window._paySubmitForm = _paySubmitForm;
window._payDeleteConfirm = _payDeleteConfirm;
window._payDoDelete = _payDoDelete;
window._payOnField = _payOnField;
window._payOnCardNumber = _payOnCardNumber;
window._payOnExp = _payOnExp;
window._payShareReceipt = _payShareReceipt;
window._payOpenReceipt = _payOpenReceipt;
window._payEmailReceipt = _payEmailReceipt;
window._payGoToOrder = _payGoToOrder;

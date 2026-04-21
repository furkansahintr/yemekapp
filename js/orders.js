/* ═══ MY ORDERS — LIST + DETAIL + CANCEL FLOW (UI-only) ═══
 *
 * Entry: Hesabım → "Siparişlerim" tile → openMyOrders()
 *
 * Screens:
 *  1. Order List (tabs: Aktif / Tamamlanan / Geçmiş–İptal)
 *  2. Order Detail (item list, status timeline, ETA, actions)
 *  3. Cancel Modal (reason picker + conditional required textarea)
 *
 * State / data is in-memory only. We ship with a seed list that covers all
 * states; the existing USER_PROFILE.orders is *also* merged in if present so
 * we don't lose the demo rows.
 */

/* ── Seed Data (state demo) ─────────────────────────────────────────────── */
var _ORD_SEED = (function () {
  var today = new Date();
  function rel(h) {
    var d = new Date(today.getTime() - h * 3600 * 1000);
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][d.getMonth()];
    var hh = String(d.getHours()).padStart(2, '0');
    var mn = String(d.getMinutes()).padStart(2, '0');
    return dd + ' ' + mm + ' · ' + hh + ':' + mn;
  }
  return [
    {
      id: '#1056',
      restaurant: 'Burger House',
      restaurantIcon: 'solar:hamburger-linear',
      date: rel(0.2),
      state: 'courier',         // preparing | courier | delivered | cancelled
      etaMinutes: 18,
      total: 310,
      address: 'Evim · Atatürk Mh. Cumhuriyet Cd. No:42',
      payment: 'Kredi Kartı •••• 4561',
      items: [
        { name: 'Truffle Burger', qty: 2, price: 125 },
        { name: 'Patates Kızartması', qty: 1, price: 35 },
        { name: 'Limonata', qty: 1, price: 25 }
      ]
    },
    {
      id: '#1055',
      restaurant: 'Piccola Pizza',
      restaurantIcon: 'solar:pizza-bold',
      date: rel(0.5),
      state: 'preparing',
      etaMinutes: 34,
      total: 265,
      address: 'İş Yerim · Büyükdere Cd. No:185',
      payment: 'Apple Pay',
      items: [
        { name: 'Margherita Pizza (Orta)', qty: 1, price: 165 },
        { name: 'Tiramisu', qty: 1, price: 75 },
        { name: 'Ayran', qty: 1, price: 25 }
      ]
    },
    {
      id: '#1054',
      restaurant: 'Kebapçı Mehmet',
      restaurantIcon: 'solar:chef-hat-bold',
      date: rel(3),
      state: 'courier',
      etaMinutes: 6,
      total: 440,
      address: 'Evim · Atatürk Mh. Cumhuriyet Cd. No:42',
      payment: 'Kapıda Nakit',
      items: [
        { name: 'Adana Kebap', qty: 2, price: 185 },
        { name: 'Mercimek Çorbası', qty: 2, price: 35 }
      ]
    },
    {
      id: '#1042',
      restaurant: 'Burger House',
      restaurantIcon: 'solar:hamburger-linear',
      date: '5 Nisan · 19:24',
      state: 'delivered',
      etaMinutes: 0,
      total: 370,
      address: 'Evim · Atatürk Mh. Cumhuriyet Cd. No:42',
      payment: 'Kredi Kartı •••• 4561',
      items: [
        { name: 'Truffle Burger', qty: 2, price: 125 },
        { name: 'Soğan Halkası', qty: 1, price: 45 },
        { name: 'Cola', qty: 2, price: 37.5 }
      ]
    },
    {
      id: '#1038',
      restaurant: 'Kebapçı Mehmet',
      restaurantIcon: 'solar:chef-hat-bold',
      date: '2 Nisan · 20:10',
      state: 'delivered',
      etaMinutes: 0,
      total: 880,
      address: 'İş Yerim · Büyükdere Cd. No:185',
      payment: 'Kredi Kartı •••• 4561',
      items: [
        { name: 'Adana Kebap', qty: 4, price: 185 },
        { name: 'Lavaş', qty: 2, price: 15 },
        { name: 'Ayran', qty: 4, price: 27.5 }
      ]
    },
    {
      id: '#1035',
      restaurant: 'Piccola Pizza',
      restaurantIcon: 'solar:pizza-bold',
      date: '28 Mart · 13:45',
      state: 'delivered',
      etaMinutes: 0,
      total: 165,
      address: 'Evim · Atatürk Mh. Cumhuriyet Cd. No:42',
      payment: 'Apple Pay',
      items: [{ name: 'Margherita Pizza', qty: 1, price: 165 }]
    },
    {
      id: '#1031',
      restaurant: 'Green Bowl',
      restaurantIcon: 'solar:leaf-bold',
      date: '25 Mart · 12:30',
      state: 'cancelled',
      etaMinutes: 0,
      total: 220,
      address: 'Evim · Atatürk Mh. Cumhuriyet Cd. No:42',
      payment: 'Kredi Kartı •••• 4561',
      cancelReason: 'Bekleme süresi çok uzun',
      cancelNote: '',
      items: [{ name: 'Caesar Salata', qty: 2, price: 110 }]
    }
  ];
})();

var _ORD_STATES = {
  preparing: { label: 'Hazırlanıyor', color: '#F59E0B', bg: 'rgba(245,158,11,.12)', icon: 'solar:chef-hat-bold' },
  courier:   { label: 'Yolda',        color: '#3B82F6', bg: 'rgba(59,130,246,.12)', icon: 'solar:scooter-bold' },
  delivered: { label: 'Teslim Edildi', color: '#22C55E', bg: 'rgba(34,197,94,.12)',  icon: 'solar:check-circle-bold' },
  cancelled: { label: 'İptal Edildi',  color: '#EF4444', bg: 'rgba(239,68,68,.10)',  icon: 'solar:close-circle-bold' }
};

var _ORD_CANCEL_REASONS = [
  { key: 'wrong',   label: 'Yanlış ürün seçtim',         icon: 'solar:question-square-linear' },
  { key: 'wait',    label: 'Bekleme süresi çok uzun',    icon: 'solar:alarm-linear' },
  { key: 'biz',     label: 'İşletme ile ilgili bir sorun var', icon: 'solar:shop-2-linear' },
  { key: 'payment', label: 'Ödeme ile ilgili bir sorun', icon: 'solar:card-linear' },
  { key: 'other',   label: 'Farklı bir neden',           icon: 'solar:pen-linear' }
];

var _ordTab = 'active';                  // active | done | history
var _ordSelectedId = null;
var _ordCancelSelected = null;
var _ordCancelNote = '';

/* ── HTML helpers ───────────────────────────────────────────────────────── */
function _ordEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _ordFmtTL(v) {
  return Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₺';
}

function _ordInjectStyle() {
  if (document.getElementById('ordStyles')) return;
  var s = document.createElement('style');
  s.id = 'ordStyles';
  s.textContent = [
    '@keyframes ordPulse{0%,100%{opacity:.55}50%{opacity:1}}',
    '@keyframes ordSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.ord-tab{flex:1;padding:10px 8px;text-align:center;font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted);cursor:pointer;border-radius:999px;transition:all .15s}',
    '.ord-tab.active{background:var(--primary);color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.08)}',
    '.ord-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-md);cursor:pointer;display:flex;flex-direction:column;gap:10px;transition:transform .15s}',
    '.ord-card:active{transform:scale(.98)}',
    '.ord-reason{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);cursor:pointer;transition:all .15s}',
    '.ord-reason.selected{border-color:#EF4444;background:rgba(239,68,68,.06)}',
    '.ord-reason-dot{width:18px;height:18px;border-radius:50%;border:2px solid var(--border-subtle);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}',
    '.ord-reason.selected .ord-reason-dot{border-color:#EF4444;background:#EF4444}',
    '.ord-reason.selected .ord-reason-dot::after{content:"";width:6px;height:6px;border-radius:50%;background:#fff}',
    '.ord-timeline-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;position:relative;z-index:1}',
    '.ord-timeline-line{position:absolute;left:5px;top:0;bottom:0;width:2px;background:var(--border-subtle);z-index:0}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ── Data access ────────────────────────────────────────────────────────── */
function _ordGetAll() {
  return _ORD_SEED.slice();
}

function _ordFilterByTab(list, tab) {
  if (tab === 'active') return list.filter(function (o) { return o.state === 'preparing' || o.state === 'courier'; });
  if (tab === 'done')   return list.filter(function (o) { return o.state === 'delivered'; });
  return list.filter(function (o) { return o.state === 'cancelled'; });
}

function _ordCountByTab() {
  var all = _ordGetAll();
  return {
    active: _ordFilterByTab(all, 'active').length,
    done:   _ordFilterByTab(all, 'done').length,
    history:_ordFilterByTab(all, 'history').length
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * SCREEN 1: ORDER LIST
 * ══════════════════════════════════════════════════════════════════════════ */
function openMyOrders() {
  _ordInjectStyle();
  var existing = document.getElementById('ordListOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'ordListOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'display:flex;z-index:60';

  overlay.innerHTML = ''
    + '<div class="prof-container" style="background:var(--bg-page)">'
    +   '<div class="prof-topbar" style="background:var(--bg-page);border-bottom:1px solid var(--border-subtle)">'
    +     '<div class="btn-icon" onclick="closeMyOrders()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +     '<span class="prof-topbar-name" style="flex:1;text-align:center">Siparişlerim</span>'
    +     '<div style="width:36px"></div>'
    +   '</div>'
    +   '<div id="ordTabsWrap" style="padding:12px 16px 8px;background:var(--bg-page);position:sticky;top:56px;z-index:2"></div>'
    +   '<div id="ordListBody" style="padding:4px 16px 24px;display:flex;flex-direction:column;gap:12px"></div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  _ordRenderTabs();
  _ordRenderList();
}

function closeMyOrders() {
  var el = document.getElementById('ordListOverlay');
  if (el) el.remove();
}

function _ordRenderTabs() {
  var wrap = document.getElementById('ordTabsWrap');
  if (!wrap) return;
  var c = _ordCountByTab();
  wrap.innerHTML = ''
    + '<div style="display:flex;gap:6px;background:var(--bg-btn);border:1px solid var(--border-subtle);border-radius:999px;padding:4px">'
    +   _ordTabBtn('active',  'Aktif',       c.active)
    +   _ordTabBtn('done',    'Tamamlanan',  c.done)
    +   _ordTabBtn('history', 'Geçmiş',      c.history)
    + '</div>';
}

function _ordTabBtn(key, label, count) {
  var active = _ordTab === key;
  var badge = count > 0
    ? '<span style="display:inline-block;margin-left:6px;min-width:18px;height:18px;padding:0 6px;border-radius:999px;font:var(--fw-semibold) 10px/18px var(--font);background:' + (active ? 'rgba(255,255,255,.25)' : 'var(--primary-soft)') + ';color:' + (active ? '#fff' : 'var(--primary)') + '">' + count + '</span>'
    : '';
  return '<div class="ord-tab' + (active ? ' active' : '') + '" onclick="_ordSetTab(\'' + key + '\')">' + label + badge + '</div>';
}

function _ordSetTab(key) {
  _ordTab = key;
  _ordRenderTabs();
  _ordRenderList();
}

function _ordRenderList() {
  var body = document.getElementById('ordListBody');
  if (!body) return;
  var list = _ordFilterByTab(_ordGetAll(), _ordTab);
  if (!list.length) {
    body.innerHTML = _ordEmptyState();
    return;
  }
  body.innerHTML = list.map(_ordCardHtml).join('');
}

function _ordCardHtml(o) {
  var st = _ORD_STATES[o.state];
  var itemsPreview = o.items.slice(0, 2).map(function (i) { return i.qty + 'x ' + i.name; }).join(', ')
    + (o.items.length > 2 ? ' +' + (o.items.length - 2) + ' daha' : '');

  var livePill = (o.state === 'preparing' || o.state === 'courier')
    ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:' + st.bg + ';color:' + st.color + ';font:var(--fw-semibold) 11px/1 var(--font);animation:ordPulse 1.6s ease-in-out infinite">'
        + '<iconify-icon icon="' + st.icon + '" style="font-size:12px"></iconify-icon>' + st.label + '</span>'
    : '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:' + st.bg + ';color:' + st.color + ';font:var(--fw-semibold) 11px/1 var(--font)">'
        + '<iconify-icon icon="' + st.icon + '" style="font-size:12px"></iconify-icon>' + st.label + '</span>';

  var etaLine = (o.state === 'preparing' || o.state === 'courier')
    ? '<div style="display:flex;align-items:center;gap:5px;font:var(--fw-medium) 11px/1 var(--font);color:' + st.color + '"><iconify-icon icon="solar:clock-circle-linear" style="font-size:13px"></iconify-icon>~' + o.etaMinutes + ' dk</div>'
    : '';

  return ''
    + '<div class="ord-card" onclick="openOrderDetail(\'' + o.id + '\')">'
    +   '<div style="display:flex;align-items:center;gap:12px">'
    +     '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +       '<iconify-icon icon="' + o.restaurantIcon + '" style="font-size:22px;color:var(--primary)"></iconify-icon>'
    +     '</div>'
    +     '<div style="flex:1;min-width:0">'
    +       '<div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _ordEsc(o.restaurant) + '</div>'
    +       '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _ordEsc(o.id) + ' · ' + _ordEsc(o.date) + '</div>'
    +     '</div>'
    +     livePill
    +   '</div>'
    +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + _ordEsc(itemsPreview) + '</div>'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px dashed var(--border-subtle)">'
    +     etaLine
    +     '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-left:auto">' + _ordFmtTL(o.total) + '</div>'
    +   '</div>'
    + '</div>';
}

function _ordEmptyState() {
  var cfg = {
    active:  { icon: 'solar:bag-smile-linear',   title: 'Aktif siparişin yok',    desc: 'Hazırlanan veya yoldaki siparişlerin burada görünür.' },
    done:    { icon: 'solar:bag-check-linear',   title: 'Tamamlanan sipariş yok', desc: 'Teslim edilen siparişlerin burada birikir.' },
    history: { icon: 'solar:history-linear',     title: 'İptal sipariş yok',      desc: 'İptal veya geçmiş siparişlerin burada listelenir.' }
  }[_ordTab];
  return ''
    + '<div style="padding:56px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px">'
    +   '<iconify-icon icon="' + cfg.icon + '" style="font-size:56px;color:var(--text-tertiary)"></iconify-icon>'
    +   '<div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">' + cfg.title + '</div>'
    +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-muted);max-width:260px">' + cfg.desc + '</div>'
    + '</div>';
}

/* ══════════════════════════════════════════════════════════════════════════
 * SCREEN 2: ORDER DETAIL
 * ══════════════════════════════════════════════════════════════════════════ */
function openOrderDetail(id) {
  _ordInjectStyle();
  var o = _ordGetAll().find(function (x) { return x.id === id; });
  if (!o) return;
  _ordSelectedId = id;

  var existing = document.getElementById('ordDetailOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'ordDetailOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'display:flex;z-index:65';

  overlay.innerHTML = ''
    + '<div class="prof-container" style="background:var(--bg-page)">'
    +   '<div class="prof-topbar" style="background:var(--bg-page);border-bottom:1px solid var(--border-subtle)">'
    +     '<div class="btn-icon" onclick="closeOrderDetail()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +     '<span class="prof-topbar-name" style="flex:1;text-align:center">' + _ordEsc(o.id) + '</span>'
    +     '<div class="btn-icon" onclick="_ordShare(\'' + o.id + '\')"><iconify-icon icon="solar:share-linear" style="font-size:20px"></iconify-icon></div>'
    +   '</div>'
    +   '<div id="ordDetailBody" style="padding:16px;display:flex;flex-direction:column;gap:14px;padding-bottom:120px"></div>'
    +   _ordDetailFooter(o)
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  _ordRenderDetailBody(o);
}

function closeOrderDetail() {
  var el = document.getElementById('ordDetailOverlay');
  if (el) el.remove();
  _ordSelectedId = null;
}

function _ordRenderDetailBody(o) {
  var body = document.getElementById('ordDetailBody');
  if (!body) return;
  var st = _ORD_STATES[o.state];

  // Status hero
  var isLive = (o.state === 'preparing' || o.state === 'courier');
  var eta = isLive
    ? '<div style="display:flex;align-items:baseline;gap:6px;margin-top:6px"><span style="font:var(--fw-bold) 28px/1 var(--font);color:' + st.color + '">~' + o.etaMinutes + ' dk</span><span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">tahmini teslimat</span></div>'
    : (o.state === 'delivered' ? '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Sipariş başarıyla teslim edildi.</div>' : '');

  var hero = ''
    + '<div style="background:' + st.bg + ';border:1px solid ' + st.color + '33;border-radius:var(--r-xl);padding:16px;display:flex;flex-direction:column;gap:4px">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:44px;height:44px;border-radius:50%;background:' + st.color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0' + (isLive ? ';animation:ordPulse 1.6s ease-in-out infinite' : '') + '">'
    +       '<iconify-icon icon="' + st.icon + '" style="font-size:22px;color:#fff"></iconify-icon>'
    +     '</div>'
    +     '<div style="flex:1">'
    +       '<div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:' + st.color + '">' + st.label + '</div>'
    +       '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _ordEsc(o.date) + '</div>'
    +     '</div>'
    +   '</div>'
    +   eta
    + '</div>';

  // Timeline
  var stages = [
    { key: 'placed',    label: 'Sipariş Alındı',  icon: 'solar:bag-check-bold' },
    { key: 'preparing', label: 'Hazırlanıyor',    icon: 'solar:chef-hat-bold' },
    { key: 'courier',   label: 'Kuryede',         icon: 'solar:scooter-bold' },
    { key: 'delivered', label: 'Teslim Edildi',   icon: 'solar:check-circle-bold' }
  ];
  var currentIdx = o.state === 'cancelled' ? -1
    : stages.findIndex(function (s) { return s.key === o.state; });
  if (o.state === 'preparing') currentIdx = 1;
  if (o.state === 'delivered') currentIdx = 3;

  var timelineHtml = '';
  if (o.state !== 'cancelled') {
    timelineHtml = '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;position:relative">'
      + '<div class="ord-timeline-line"></div>'
      + stages.map(function (s, i) {
          var done = i <= currentIdx;
          var active = i === currentIdx;
          return '<div style="display:flex;align-items:center;gap:14px;padding:6px 0;position:relative">'
            + '<div class="ord-timeline-dot" style="background:' + (done ? 'var(--primary)' : 'var(--border-subtle)') + (active ? ';box-shadow:0 0 0 4px var(--primary-soft);animation:ordPulse 1.6s ease-in-out infinite' : '') + '"></div>'
            + '<iconify-icon icon="' + s.icon + '" style="font-size:18px;color:' + (done ? 'var(--primary)' : 'var(--text-tertiary)') + '"></iconify-icon>'
            + '<span style="font:' + (active ? 'var(--fw-semibold)' : 'var(--fw-regular)') + ' var(--fs-sm)/1 var(--font);color:' + (done ? 'var(--text-primary)' : 'var(--text-muted)') + '">' + s.label + '</span>'
            + '</div>';
        }).join('')
      + '</div>';
  }

  // Restaurant
  var restaurant = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;display:flex;align-items:center;gap:12px">'
    +   '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary-soft);display:flex;align-items:center;justify-content:center">'
    +     '<iconify-icon icon="' + o.restaurantIcon + '" style="font-size:22px;color:var(--primary)"></iconify-icon>'
    +   '</div>'
    +   '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">' + _ordEsc(o.restaurant) + '</div>'
    +   '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _ordEsc(o.id) + '</div></div>'
    +   '<div class="btn-icon" style="width:32px;height:32px" title="Restoranı ara"><iconify-icon icon="solar:phone-linear" style="font-size:18px"></iconify-icon></div>'
    + '</div>';

  // Items
  var subtotal = o.items.reduce(function (a, i) { return a + i.qty * i.price; }, 0);
  var delivery = o.state === 'cancelled' ? 0 : 15;
  var total = o.total;

  var itemsHtml = '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    + '<div style="padding:12px 14px;border-bottom:1px solid var(--border-subtle);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Ürünler (' + o.items.length + ')</div>'
    + o.items.map(function (i) {
        return '<div style="padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle)">'
          + '<span style="min-width:28px;padding:3px 8px;border-radius:999px;background:var(--primary-soft);color:var(--primary);font:var(--fw-semibold) 11px/1 var(--font);text-align:center">' + i.qty + 'x</span>'
          + '<span style="flex:1;font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">' + _ordEsc(i.name) + '</span>'
          + '<span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">' + _ordFmtTL(i.qty * i.price) + '</span>'
          + '</div>';
      }).join('')
    + '<div style="padding:12px 14px;display:flex;justify-content:space-between;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);border-bottom:1px solid var(--border-subtle)"><span>Ara Toplam</span><span>' + _ordFmtTL(subtotal) + '</span></div>'
    + (o.state !== 'cancelled' ? '<div style="padding:12px 14px;display:flex;justify-content:space-between;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);border-bottom:1px solid var(--border-subtle)"><span>Teslimat</span><span>' + _ordFmtTL(delivery) + '</span></div>' : '')
    + '<div style="padding:14px;display:flex;justify-content:space-between;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)"><span>Toplam</span><span>' + _ordFmtTL(total) + '</span></div>'
    + '</div>';

  // Meta
  var meta = '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    + '<div style="padding:12px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle)">'
    +   '<iconify-icon icon="solar:map-point-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    +   '<div style="flex:1;min-width:0"><div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">Teslimat Adresi</div>'
    +   '<div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);margin-top:2px">' + _ordEsc(o.address) + '</div></div>'
    + '</div>'
    + '<div style="padding:12px 14px;display:flex;align-items:center;gap:10px">'
    +   '<iconify-icon icon="solar:card-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    +   '<div style="flex:1"><div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">Ödeme</div>'
    +   '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:2px">' + _ordEsc(o.payment) + '</div></div>'
    + '</div>'
    + '</div>';

  // Cancel reason info (if applicable)
  var cancelInfo = '';
  if (o.state === 'cancelled' && o.cancelReason) {
    cancelInfo = '<div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.3);border-radius:var(--r-xl);padding:14px;display:flex;gap:12px">'
      + '<iconify-icon icon="solar:info-circle-bold" style="font-size:20px;color:#EF4444;flex-shrink:0;margin-top:1px"></iconify-icon>'
      + '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:#EF4444">İptal Nedeni</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);margin-top:4px">' + _ordEsc(o.cancelReason) + '</div>'
      + (o.cancelNote ? '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px;font-style:italic">"' + _ordEsc(o.cancelNote) + '"</div>' : '')
      + '</div></div>';
  }

  body.innerHTML = hero + timelineHtml + restaurant + itemsHtml + meta + cancelInfo;
}

function _ordDetailFooter(o) {
  var canCancel = (o.state === 'preparing');

  // Teslim edildi: Paylaş ve Tekrar Sipariş yerine "Değerlendir" — daha önce yapıldıysa pasif
  if (o.state === 'delivered') {
    var alreadyReviewed = (typeof USER_ORDER_REVIEWS !== 'undefined') && !!USER_ORDER_REVIEWS[o.id];
    var btn = alreadyReviewed
      ? '<button disabled style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--bg-btn);border:1px solid var(--border-subtle);color:var(--text-tertiary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:not-allowed;display:inline-flex;align-items:center;justify-content:center;gap:6px" title="Bu sipariş değerlendirildi"><iconify-icon icon="solar:star-linear" style="font-size:16px"></iconify-icon>Değerlendirildi</button>'
      : '<button onclick="openOrderReview(\'' + o.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:linear-gradient(135deg,#F59E0B,#EA580C);border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(245,158,11,.3)"><iconify-icon icon="solar:star-bold" style="font-size:16px"></iconify-icon>Değerlendir</button>';

    return '<div style="position:absolute;left:0;right:0;bottom:0;padding:12px 16px max(env(safe-area-inset-bottom),12px);background:var(--bg-page);border-top:1px solid var(--border-subtle);display:flex;gap:8px">'
      + btn
      + '</div>';
  }

  var shareBtn = '<button onclick="_ordShare(\'' + o.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:share-linear" style="font-size:16px"></iconify-icon>Paylaş</button>';

  var cancelBtn = canCancel
    ? '<button onclick="openOrderCancel(\'' + o.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:#EF4444;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:close-circle-linear" style="font-size:16px"></iconify-icon>Siparişi İptal Et</button>'
    : (o.state === 'courier'
        ? '<button disabled style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--bg-btn);border:1px solid var(--border-subtle);color:var(--text-tertiary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:not-allowed;display:inline-flex;align-items:center;justify-content:center;gap:6px" title="Kurye yola çıktı, iptal edilemez"><iconify-icon icon="solar:lock-keyhole-minimalistic-linear" style="font-size:16px"></iconify-icon>İptal Edilemez</button>'
        : '<button onclick="_ordReorder(\'' + o.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--primary);border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:refresh-linear" style="font-size:16px"></iconify-icon>Tekrar Sipariş</button>');

  return '<div style="position:absolute;left:0;right:0;bottom:0;padding:12px 16px max(env(safe-area-inset-bottom),12px);background:var(--bg-page);border-top:1px solid var(--border-subtle);display:flex;gap:8px">'
    + shareBtn + cancelBtn
    + '</div>';
}

function _ordShare(id) {
  var o = _ordGetAll().find(function (x) { return x.id === id; });
  if (!o) return;
  var txt = 'Siparişim (' + o.id + ') — ' + o.restaurant + ' · ' + _ordFmtTL(o.total);
  if (navigator.share) {
    navigator.share({ title: 'Sipariş ' + o.id, text: txt }).catch(function () {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(function () {});
    _ordToast('Sipariş özeti kopyalandı');
  } else {
    _ordToast('Paylaşım desteklenmiyor');
  }
}

function _ordReorder(id) {
  _ordToast('Ürünler sepetine eklendi (demo)');
}

/* ══════════════════════════════════════════════════════════════════════════
 * SCREEN 3: CANCEL MODAL
 * ══════════════════════════════════════════════════════════════════════════ */
function openOrderCancel(id) {
  _ordInjectStyle();
  _ordCancelSelected = null;
  _ordCancelNote = '';

  var existing = document.getElementById('ordCancelModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'ordCancelModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:95;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function (e) { if (e.target === modal) closeOrderCancel(); };

  modal.innerHTML = ''
    + '<div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;max-height:92vh;overflow:auto;animation:ordSlideUp .22s ease;display:flex;flex-direction:column">'
    +   '<div style="padding:18px 18px 12px;border-bottom:1px solid var(--border-subtle)">'
    +     '<div style="display:flex;align-items:center;gap:12px">'
    +       '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:rgba(239,68,68,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +         '<iconify-icon icon="solar:shield-warning-bold" style="font-size:22px;color:#EF4444"></iconify-icon>'
    +       '</div>'
    +       '<div style="flex:1;min-width:0">'
    +         '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Siparişi İptal Et</div>'
    +         '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Sipariş ' + _ordEsc(id) + ' için iptal talebi oluştur.</div>'
    +       '</div>'
    +       '<div class="btn-icon" onclick="closeOrderCancel()" style="width:32px;height:32px;flex-shrink:0"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>'
    +     '</div>'
    +   '</div>'
    +   '<div id="ordCancelBody" style="padding:16px 18px;display:flex;flex-direction:column;gap:10px"></div>'
    +   '<div id="ordCancelFooter" style="padding:12px 18px max(env(safe-area-inset-bottom),16px);border-top:1px solid var(--border-subtle);background:var(--bg-page)"></div>'
    + '</div>';

  document.body.appendChild(modal);
  modal.dataset.orderId = id;
  _ordRenderCancelBody();
  _ordRenderCancelFooter();
}

function closeOrderCancel() {
  var el = document.getElementById('ordCancelModal');
  if (el) el.remove();
}

function _ordRenderCancelBody() {
  var body = document.getElementById('ordCancelBody');
  if (!body) return;

  var requiresNote = _ordCancelSelected === 'other';
  var remaining = 200 - (_ordCancelNote || '').length;

  var reasonsHtml = '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">İptal Nedeni</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px">'
    + _ORD_CANCEL_REASONS.map(function (r) {
        var selected = _ordCancelSelected === r.key;
        return '<div class="ord-reason' + (selected ? ' selected' : '') + '" onclick="_ordPickReason(\'' + r.key + '\')">'
          + '<div class="ord-reason-dot"></div>'
          + '<iconify-icon icon="' + r.icon + '" style="font-size:18px;color:' + (selected ? '#EF4444' : 'var(--text-secondary)') + '"></iconify-icon>'
          + '<span style="flex:1;font:' + (selected ? 'var(--fw-semibold)' : 'var(--fw-medium)') + ' var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + r.label + '</span>'
          + '</div>';
      }).join('')
    + '</div>';

  var noteLabel = requiresNote
    ? '<span style="display:inline-flex;align-items:center;gap:4px">Açıklama <span style="color:#EF4444">*</span> <span style="font:var(--fw-regular) 10px/1 var(--font);color:#EF4444">zorunlu</span></span>'
    : '<span style="display:inline-flex;align-items:center;gap:4px">Açıklama <span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">opsiyonel</span></span>';

  var noteHtml = '<div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">'
    + '<label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">' + noteLabel + '</label>'
    + '<textarea id="ordCancelNote" placeholder="' + (requiresNote ? 'Lütfen nedeninizi detaylandırın…' : 'İsteğe bağlı not…') + '" maxlength="200" oninput="_ordOnNote(this.value)" style="background:var(--bg-phone);border:1px solid ' + (requiresNote ? 'rgba(239,68,68,.4)' : 'var(--border-subtle)') + ';border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-primary);outline:none;min-height:92px;resize:none">' + _ordEsc(_ordCancelNote) + '</textarea>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);text-align:right">' + remaining + ' karakter kaldı</div>'
    + '</div>';

  body.innerHTML = reasonsHtml + noteHtml;
}

function _ordRenderCancelFooter() {
  var footer = document.getElementById('ordCancelFooter');
  if (!footer) return;
  var canSend = !!_ordCancelSelected && (_ordCancelSelected !== 'other' || (_ordCancelNote && _ordCancelNote.trim().length >= 5));

  footer.innerHTML = ''
    + '<div style="display:flex;gap:8px">'
    +   '<button onclick="closeOrderCancel()" style="flex:1;padding:14px;border-radius:var(--r-xl);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>'
    +   '<button ' + (canSend ? '' : 'disabled') + ' onclick="_ordSubmitCancel()" style="flex:2;padding:14px;border-radius:var(--r-xl);background:' + (canSend ? '#EF4444' : 'var(--bg-btn)') + ';border:' + (canSend ? 'none' : '1px solid var(--border-subtle)') + ';color:' + (canSend ? '#fff' : 'var(--text-tertiary)') + ';font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:' + (canSend ? 'pointer' : 'not-allowed') + ';display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:letter-linear" style="font-size:16px"></iconify-icon>İptal Talebi Gönder</button>'
    + '</div>';
}

function _ordPickReason(key) {
  _ordCancelSelected = key;
  _ordRenderCancelBody();
  _ordRenderCancelFooter();
}

function _ordOnNote(v) {
  _ordCancelNote = v;
  _ordRenderCancelFooter();
  // counter update without full rerender
  var body = document.getElementById('ordCancelBody');
  if (!body) return;
  var counter = body.querySelector('div[style*="text-align:right"]');
  if (counter) counter.textContent = (200 - v.length) + ' karakter kaldı';
}

function _ordSubmitCancel() {
  var modal = document.getElementById('ordCancelModal');
  var id = modal ? modal.dataset.orderId : null;
  if (!id || !_ordCancelSelected) return;
  if (_ordCancelSelected === 'other' && (!_ordCancelNote || _ordCancelNote.trim().length < 5)) return;

  // UI-only: mark order as cancelled in seed
  var o = _ORD_SEED.find(function (x) { return x.id === id; });
  if (o) {
    o.state = 'cancelled';
    var r = _ORD_CANCEL_REASONS.find(function (x) { return x.key === _ordCancelSelected; });
    o.cancelReason = r ? r.label : '';
    o.cancelNote = _ordCancelNote || '';
  }

  closeOrderCancel();
  _ordShowCancelSuccess(id);
}

function _ordShowCancelSuccess(id) {
  var existing = document.getElementById('ordCancelSuccess');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'ordCancelSuccess';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:96;display:flex;align-items:center;justify-content:center;padding:24px';
  el.onclick = function () { el.remove(); };
  el.innerHTML = ''
    + '<div style="width:100%;max-width:340px;background:var(--bg-page);border-radius:var(--r-2xl);padding:24px 20px;text-align:center;display:flex;flex-direction:column;gap:12px;animation:ordSlideUp .25s ease">'
    +   '<div style="width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.12);display:flex;align-items:center;justify-content:center;margin:0 auto">'
    +     '<iconify-icon icon="solar:check-circle-bold" style="font-size:36px;color:#22C55E"></iconify-icon>'
    +   '</div>'
    +   '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">İptal Talebin Alındı</div>'
    +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-muted)">' + _ordEsc(id) + ' numaralı siparişin iptali için talebin işletmeye iletildi. Onay durumunu bildirimlerden takip edebilirsin.</div>'
    +   '<button onclick="document.getElementById(\'ordCancelSuccess\').remove();_ordRefreshAfterCancel()" style="margin-top:6px;padding:12px;border-radius:var(--r-xl);background:var(--primary);border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Tamam</button>'
    + '</div>';
  document.body.appendChild(el);
}

function _ordRefreshAfterCancel() {
  // Detail ekranı açıksa yenile, geri dönülebilsin; liste varsa tab güncelle
  if (_ordSelectedId) {
    var o = _ordGetAll().find(function (x) { return x.id === _ordSelectedId; });
    if (o) _ordRenderDetailBody(o);
    // Replace footer buttons
    var overlay = document.getElementById('ordDetailOverlay');
    if (overlay) {
      var c = overlay.querySelector('.prof-container');
      var oldFooter = c.querySelector('div[style*="position:absolute"][style*="bottom:0"]');
      if (oldFooter) oldFooter.outerHTML = _ordDetailFooter(o);
    }
  }
  if (document.getElementById('ordListOverlay')) {
    _ordRenderTabs();
    _ordRenderList();
  }
}

function _ordToast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);color:#fff;padding:10px 16px;border-radius:999px;font:var(--fw-medium) 13px/1 var(--font);z-index:200;animation:ordSlideUp .2s ease';
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 1800);
}

/* ── Window exports ─────────────────────────────────────────────────────── */
window.openMyOrders = openMyOrders;
window.closeMyOrders = closeMyOrders;
window.openOrderDetail = openOrderDetail;
window.closeOrderDetail = closeOrderDetail;
window.openOrderCancel = openOrderCancel;
window.closeOrderCancel = closeOrderCancel;
window._ordSetTab = _ordSetTab;
window._ordPickReason = _ordPickReason;
window._ordOnNote = _ordOnNote;
window._ordSubmitCancel = _ordSubmitCancel;
window._ordShare = _ordShare;
window._ordReorder = _ordReorder;
window._ordRefreshAfterCancel = _ordRefreshAfterCancel;

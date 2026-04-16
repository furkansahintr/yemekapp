/* ═══════════════════════════════════════════════════════════
   BIZ LIVE ORDERS — Canlı Siparişler (Operasyonel Merkez)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _blvo = {
  tab: 'dine-in',      /* dine-in | online */
  search: '',
  statusFilter: 'all', /* all | pending | preparing | ready | cancelled */
  filtersOpen: false
};

/* ── Status definitions ── */
var _BLVO_ST = {
  pending:    { label: 'Yeni',          color: '#EF4444', icon: 'solar:bell-bing-bold',      bg: '#FEE2E2', action: 'Hazırlamaya Başla' },
  preparing:  { label: 'Hazırlanıyor',  color: '#F59E0B', icon: 'solar:chef-hat-bold',       bg: '#FEF3C7', action: 'Hazırlandı' },
  ready:      { label: 'Hazır',         color: '#22C55E', icon: 'solar:check-circle-bold',   bg: '#DCFCE7', action: 'Kuryeye Ver' },
  delivered:  { label: 'Teslim Edildi', color: '#3B82F6', icon: 'solar:verified-check-bold', bg: '#DBEAFE', action: null },
  cancelled:  { label: 'İptal',        color: '#6B7280', icon: 'solar:close-circle-bold',   bg: '#F3F4F6', action: null }
};

/* ═══════════════════════════════════════
   TILE — Genel sekmesinde gösterilir
   ═══════════════════════════════════════ */
function _blvoTileHtml() {
  var orders = _blvoGetBranchOrders();
  var active = orders.filter(function(o) { return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'; });
  var pending = orders.filter(function(o) { return o.status === 'pending'; });

  return '<div style="grid-column:1/-1;background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);cursor:pointer;display:flex;flex-direction:column;gap:10px;box-shadow:var(--shadow-md);position:relative" onclick="openBizLiveOrders()">'
    + '<div style="display:flex;align-items:center;justify-content:space-between">'
    + '<div style="width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:bag-music-bold" style="font-size:22px;color:#22C55E"></iconify-icon>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:4px">'
    + '<span class="blvo-live-dot"></span>'
    + '<span style="font:var(--fw-bold) 10px/1 var(--font);color:#22C55E;letter-spacing:0.5px">CANLI</span>'
    + '</div>'
    + '</div>'
    + '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Canlı Siparişler</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + active.length + ' Aktif Sipariş</div>'
    + (pending.length > 0
      ? '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#EF4444">' + pending.length + ' yeni sipariş bekliyor!</div>'
      : '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">Tüm siparişler kontrol altında</div>')
    + '</div>';
}

/* ═══════════════════════════════════════
   DETAIL PAGE — Full overlay
   ═══════════════════════════════════════ */
function openBizLiveOrders() {
  _blvoInjectStyles();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'blvoOverlay';
  overlay.innerHTML = _blvoRenderPage();
  document.getElementById('bizPhone').appendChild(overlay);
}

function _blvoRefresh() {
  var overlay = document.getElementById('blvoOverlay');
  if (!overlay) return;
  overlay.innerHTML = _blvoRenderPage();
}

function _blvoClose() {
  var el = document.getElementById('blvoOverlay');
  if (el) el.remove();
}

function _blvoRenderPage() {
  var orders = _blvoGetBranchOrders();
  var filtered = _blvoGetFiltered(orders);
  var active = orders.filter(function(o) { return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'; });

  var h = '<div style="display:flex;flex-direction:column;height:100%;background:var(--bg-phone)">';

  /* ── Header ── */
  h += '<div style="padding:16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle);flex-shrink:0">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div style="width:34px;height:34px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_blvoClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-primary)"></iconify-icon>'
    + '</div>'
    + '<div>'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Canlı Siparişler</span>'
    + '<span class="blvo-live-dot"></span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:2px">' + active.length + ' aktif sipariş</div>'
    + '</div>'
    + '</div>'
    + '<div class="blvo-icon-btn" onclick="_blvoToggleFilters()" style="position:relative"><iconify-icon icon="solar:filter-bold" style="font-size:16px;color:var(--text-secondary)"></iconify-icon>' + _blvoFilterBadge() + '</div>'
    + '</div>';

  /* ── Segmented Control (Tabs) ── */
  h += '<div style="padding:12px 16px 0;flex-shrink:0">'
    + '<div style="display:flex;background:var(--bg-phone-secondary);border-radius:var(--r-lg);padding:3px;gap:2px">'
    + '<button class="blvo-seg' + (_blvo.tab === 'dine-in' ? ' active' : '') + '" onclick="_blvoSetTab(\'dine-in\')">'
    + '<iconify-icon icon="solar:sofa-2-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Masa Siparişleri</span>'
    + '<span class="blvo-seg-count' + (_blvo.tab === 'dine-in' ? ' active' : '') + '">' + orders.filter(function(o) { return (o.type === 'dine-in') && o.status !== 'delivered' && o.status !== 'cancelled'; }).length + '</span>'
    + '</button>'
    + '<button class="blvo-seg' + (_blvo.tab === 'online' ? ' active' : '') + '" onclick="_blvoSetTab(\'online\')">'
    + '<iconify-icon icon="solar:smartphone-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Online Siparişler</span>'
    + '<span class="blvo-seg-count' + (_blvo.tab === 'online' ? ' active' : '') + '">' + orders.filter(function(o) { return (o.type === 'online' || o.type === 'takeaway') && o.status !== 'delivered' && o.status !== 'cancelled'; }).length + '</span>'
    + '</button>'
    + '</div>'
    + '</div>';

  /* ── Search Bar ── */
  h += '<div style="padding:10px 16px 0;flex-shrink:0">'
    + '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="blvo-search" placeholder="Sipariş no veya müşteri adı..." value="' + _blvoEsc(_blvo.search) + '" oninput="_blvoSearchChange(this.value)" />'
    + '</div>'
    + '</div>';

  /* ── Filter Panel ── */
  if (_blvo.filtersOpen) {
    h += '<div style="padding:8px 16px 0;flex-shrink:0">' + _blvoRenderFilters() + '</div>';
  }

  /* ── Status Quick Tabs ── */
  h += '<div style="padding:10px 16px 0;display:flex;gap:6px;overflow-x:auto;flex-shrink:0">'
    + _blvoStatusTab('Tümü', 'all')
    + _blvoStatusTab('Yeni', 'pending')
    + _blvoStatusTab('Hazırlanıyor', 'preparing')
    + _blvoStatusTab('Hazır', 'ready')
    + _blvoStatusTab('İptal', 'cancelled')
    + '</div>';

  /* ── Order count ── */
  h += '<div style="padding:8px 16px 4px;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);flex-shrink:0">' + filtered.length + ' sipariş</div>';

  /* ── Order List (scrollable) ── */
  h += '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 16px 16px">';

  if (filtered.length === 0) {
    h += '<div style="text-align:center;padding:48px 16px">'
      + '<iconify-icon icon="solar:bag-check-bold" style="font-size:48px;color:var(--text-muted);opacity:0.25"></iconify-icon>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:12px">Sipariş bulunamadı</div>'
      + '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">';
    for (var i = 0; i < filtered.length; i++) {
      h += _blvoRenderOrderRow(filtered[i]);
    }
    h += '</div>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

/* ═══ ORDER ROW ═══ */
function _blvoRenderOrderRow(o) {
  var st = _BLVO_ST[o.status] || _BLVO_ST.pending;
  var isDineIn = o.type === 'dine-in';
  var typeBg = isDineIn ? '#3B82F6' : '#F59E0B';
  var typeIcon = isDineIn ? 'solar:sofa-2-bold' : 'solar:smartphone-bold';
  var typeLabel = isDineIn ? 'Masa ' + (o.tableNumber || '?') : (o.customerName || 'Müşteri');

  /* Elapsed time */
  var elapsed = _blvoElapsed(o.createdAt);

  return '<div class="blvo-row" onclick="_blvoOpenDrawer(\'' + o.id + '\')">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    /* Status indicator */
    + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:' + st.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="' + st.icon + '" style="font-size:18px;color:' + st.color + '"></iconify-icon>'
    + '</div>'
    /* Info */
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + o.id + '</span>'
    + '<span class="blvo-badge" style="background:' + st.bg + ';color:' + st.color + '">' + st.label + '</span>'
    + '<span class="blvo-badge" style="background:' + typeBg + '15;color:' + typeBg + '"><iconify-icon icon="' + typeIcon + '" style="font-size:9px;margin-right:2px"></iconify-icon>' + (isDineIn ? 'Masa' : 'Online') + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + typeLabel + '</div>'
    + '</div>'
    /* Right */
    + '<div style="text-align:right;flex-shrink:0">'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + _blvoFmtTL(o.total) + '</div>'
    + '<div style="font:var(--fw-medium) 10px/1 var(--font);color:' + (o.status === 'pending' ? '#EF4444' : 'var(--text-tertiary)') + ';margin-top:3px">' + elapsed + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';
}

/* ═══ FILTER PANEL ═══ */
function _blvoRenderFilters() {
  return '<div class="blvo-filter-panel">'
    + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);margin-bottom:8px">Durum Filtresi</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + _blvoChip('Tümü', 'all') + _blvoChip('Yeni', 'pending') + _blvoChip('Hazırlanıyor', 'preparing') + _blvoChip('Hazır', 'ready') + _blvoChip('İptal', 'cancelled')
    + '</div>'
    + '<div style="text-align:right;padding-top:8px;margin-top:8px;border-top:1px solid var(--border-subtle)">'
    + '<button style="padding:5px 12px;border-radius:var(--r-full);border:1px solid #EF4444;background:rgba(239,68,68,0.08);color:#EF4444;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer" onclick="_blvoResetFilters()">Temizle</button>'
    + '</div>'
    + '</div>';
}

/* ═══ SIDE DRAWER DETAIL ═══ */
function _blvoOpenDrawer(orderId) {
  var order = _blvoGetBranchOrders().find(function(o) { return o.id === orderId; });
  if (!order) return;

  var old = document.getElementById('blvoDrawer');
  if (old) old.remove();

  var st = _BLVO_ST[order.status] || _BLVO_ST.pending;
  var isDineIn = order.type === 'dine-in';
  var elapsed = _blvoElapsed(order.createdAt);

  var d = document.createElement('div');
  d.id = 'blvoDrawer';
  d.className = 'blvo-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _blvoCloseDrawer(); };

  var h = '<div class="blvo-drawer"><div class="blvo-drawer-scroll">';

  /* ── Header ── */
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + order.id + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:3px">' + elapsed + ' önce sipariş verildi</div>'
    + '</div>'
    + '<div class="blvo-icon-btn" onclick="_blvoCloseDrawer()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  /* ── Status + Type Badges ── */
  h += '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">'
    + '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:#fff;background:' + st.color + ';padding:5px 10px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="' + st.icon + '" style="font-size:12px"></iconify-icon>' + st.label + '</span>'
    + '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:' + (isDineIn ? '#3B82F6' : '#F59E0B') + ';background:' + (isDineIn ? '#DBEAFE' : '#FEF3C7') + ';padding:5px 10px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="' + (isDineIn ? 'solar:sofa-2-bold' : 'solar:smartphone-bold') + '" style="font-size:12px"></iconify-icon>' + (isDineIn ? 'Masa ' + (order.tableNumber || '—') : (order.type === 'takeaway' ? 'Gel-Al' : 'Online Teslimat')) + '</span>'
    + '</div>';

  /* ── Customer Info (online only) ── */
  if (!isDineIn && order.customerName) {
    h += '<div class="blvo-section">'
      + '<div class="blvo-section-title"><iconify-icon icon="solar:user-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>Müşteri</div>'
      + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px">'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + order.customerName + '</div>'
      + (order.customerPhone ? '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:3px">' + order.customerPhone + '</div>' : '')
      + (order.customerAddress ? '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary);margin-top:4px;display:flex;align-items:flex-start;gap:4px"><iconify-icon icon="solar:map-point-bold" style="font-size:12px;color:var(--primary);margin-top:1px;flex-shrink:0"></iconify-icon>' + order.customerAddress + '</div>' : '')
      + (order.customerPhone ? '<div style="margin-top:8px"><a href="tel:' + order.customerPhone + '" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-md);background:#DCFCE7;color:#22C55E;font:var(--fw-semibold) 11px/1 var(--font);text-decoration:none"><iconify-icon icon="solar:phone-bold" style="font-size:12px"></iconify-icon>Ara</a></div>' : '')
      + '</div></div>';
  }

  /* ── Ürün Listesi ── */
  h += '<div class="blvo-section">'
    + '<div class="blvo-section-title"><iconify-icon icon="solar:bag-4-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>Sipariş İçeriği</div>'
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);overflow:hidden">';
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i];
    h += '<div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;' + (i < order.items.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
      + '<div style="display:flex;align-items:center;gap:8px">'
      + '<span style="width:22px;height:22px;border-radius:var(--r-sm);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 10px/1 var(--font);color:var(--primary)">' + item.qty + 'x</span>'
      + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + item.name + '</span>'
      + '</div>'
      + '<span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + _blvoFmtTL(item.qty * item.price) + '</span>'
      + '</div>';
  }
  /* Total */
  h += '<div style="padding:10px 12px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:space-between">'
    + '<span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">Toplam</span>'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + _blvoFmtTL(order.total) + '</span>'
    + '</div>';
  h += '</div></div>';

  /* ── Müşteri Notu ── */
  if (order.customerNote) {
    h += '<div class="blvo-section">'
      + '<div class="blvo-section-title"><iconify-icon icon="solar:chat-round-dots-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>Müşteri Notu</div>'
      + '<div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:var(--r-lg);padding:12px;display:flex;align-items:flex-start;gap:8px">'
      + '<iconify-icon icon="solar:info-circle-bold" style="font-size:16px;color:#F59E0B;flex-shrink:0;margin-top:1px"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-xs)/1.4 var(--font);color:#92400E">"' + order.customerNote + '"</div>'
      + '</div></div>';
  }

  /* ── İptal Nedeni ── */
  if (order.status === 'cancelled' && order.cancellationReason) {
    h += '<div class="blvo-section">'
      + '<div class="blvo-section-title"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>İptal Nedeni</div>'
      + '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:var(--r-lg);padding:12px;display:flex;align-items:flex-start;gap:8px">'
      + '<iconify-icon icon="solar:close-circle-bold" style="font-size:16px;color:#EF4444;flex-shrink:0;margin-top:1px"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-xs)/1.4 var(--font);color:#991B1B">"' + order.cancellationReason + '"</div>'
      + '</div></div>';
  }

  /* ── Zaman Akışı (Timeline) ── */
  h += '<div class="blvo-section">'
    + '<div class="blvo-section-title"><iconify-icon icon="solar:clock-circle-bold" style="font-size:14px;color:var(--text-secondary)"></iconify-icon>Zaman Akışı</div>'
    + '<div style="display:flex;flex-direction:column">';

  var timeline = [];
  timeline.push({ label: 'Sipariş Verildi', time: order.createdAt, done: true });
  if (order.status === 'cancelled') {
    timeline.push({ label: 'İptal Edildi', time: null, done: true, cancelled: true });
  } else {
    if (order.prepStartedAt) {
      timeline.push({ label: 'Hazırlanmaya Başlandı', time: order.prepStartedAt, done: true });
    }
    if (order.status === 'ready' || order.status === 'delivered') {
      timeline.push({ label: order.completedAt ? 'Hazırlandı' : 'Hazır', time: order.completedAt, done: true });
    }
    if (order.status === 'delivered') {
      timeline.push({ label: 'Teslim Edildi', time: null, done: true });
    }
    /* Current state marker */
    if (order.status === 'pending') {
      timeline.push({ label: 'Onay Bekleniyor', time: null, done: false, active: true });
    } else if (order.status === 'preparing') {
      timeline.push({ label: 'Hazırlanıyor...', time: null, done: false, active: true });
    } else if (order.status === 'ready') {
      timeline.push({ label: isDineIn ? 'Servise Hazır' : 'Kuryeye Verilecek', time: null, done: false, active: true });
    }
  }

  for (var ti = 0; ti < timeline.length; ti++) {
    var step = timeline[ti];
    var col = step.cancelled ? '#EF4444' : step.done ? '#22C55E' : step.active ? '#3B82F6' : '#D1D5DB';
    var icn = step.cancelled ? 'solar:close-circle-bold' : step.done ? 'solar:check-circle-bold' : step.active ? 'solar:hourglass-bold' : 'solar:circle-bold';
    var isLast = ti === timeline.length - 1;
    h += '<div style="display:flex;gap:10px">'
      + '<div style="display:flex;flex-direction:column;align-items:center">'
      + '<div style="width:22px;height:22px;border-radius:50%;background:' + col + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">'
      + '<iconify-icon icon="' + icn + '" style="font-size:11px;color:' + col + '"></iconify-icon>'
      + '</div>'
      + (!isLast ? '<div style="width:2px;flex:1;background:' + (step.done ? '#22C55E40' : 'var(--border-subtle)') + ';min-height:14px"></div>' : '')
      + '</div>'
      + '<div style="padding-bottom:' + (isLast ? '0' : '10') + 'px">'
      + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)">' + step.label + '</div>'
      + (step.time ? '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _blvoTimeStr(step.time) + '</div>' : '')
      + '</div>'
      + '</div>';
  }

  h += '</div></div>';

  /* ── Payment Info ── */
  h += '<div class="blvo-section">'
    + '<div class="blvo-section-title"><iconify-icon icon="solar:card-bold" style="font-size:14px;color:#22C55E"></iconify-icon>Ödeme</div>'
    + '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-lg);padding:10px 12px;display:flex;align-items:center;gap:8px">'
    + '<iconify-icon icon="' + (order.paymentMethod === 'online' ? 'solar:card-bold' : order.paymentMethod === 'card' ? 'solar:card-bold' : 'solar:banknote-bold') + '" style="font-size:16px;color:var(--text-secondary)"></iconify-icon>'
    + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + (order.paymentMethod === 'online' ? 'Online Ödeme' : order.paymentMethod === 'card' ? 'Kredi Kartı' : 'Nakit') + '</span>'
    + '</div></div>';

  /* ── Action Buttons ── */
  if (order.status !== 'delivered' && order.status !== 'cancelled') {
    h += '<div style="margin-top:8px;display:flex;flex-direction:column;gap:8px">';

    if (st.action) {
      var actionColor = order.status === 'pending' ? '#F59E0B' : order.status === 'preparing' ? '#22C55E' : '#3B82F6';
      var actionIcon = order.status === 'pending' ? 'solar:chef-hat-bold' : order.status === 'preparing' ? 'solar:check-circle-bold' : 'solar:delivery-bold';
      h += '<button class="blvo-action-btn" style="background:' + actionColor + ';color:#fff" onclick="_blvoAction(\'' + order.id + '\',\'next\')">'
        + '<iconify-icon icon="' + actionIcon + '" style="font-size:18px"></iconify-icon>' + st.action
        + '</button>';
    }

    h += '<button class="blvo-action-btn" style="background:#FEE2E2;color:#EF4444" onclick="_blvoAction(\'' + order.id + '\',\'cancel\')">'
      + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon>İptal Et'
      + '</button>';

    h += '</div>';
  }

  h += '</div></div>';

  d.innerHTML = h;
  document.getElementById('bizPhone').appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
}

function _blvoCloseDrawer() {
  var d = document.getElementById('blvoDrawer');
  if (!d) return;
  d.classList.remove('open');
  setTimeout(function() { d.remove(); }, 300);
}

/* ═══ ACTIONS ═══ */
function _blvoAction(orderId, action) {
  var order = BIZ_ORDERS.find(function(o) { return o.id === orderId; });
  if (!order) return;

  if (action === 'next') {
    if (order.status === 'pending') {
      order.status = 'preparing';
      order.prepStartedAt = new Date().toISOString();
      _blvoToast('Sipariş hazırlanmaya başlandı', 'ok');
    } else if (order.status === 'preparing') {
      order.status = 'ready';
      order.completedAt = new Date().toISOString();
      _blvoToast('Sipariş hazır!', 'ok');
    } else if (order.status === 'ready') {
      order.status = 'delivered';
      _blvoToast('Sipariş teslim edildi', 'ok');
    }
  } else if (action === 'cancel') {
    order.status = 'cancelled';
    order.cancellationReason = 'İşletme tarafından iptal edildi';
    _blvoToast('Sipariş iptal edildi', 'err');
  }

  _blvoCloseDrawer();
  _blvoRefresh();
  /* Also refresh home tile if visible */
  if (typeof renderBizHome === 'function') {
    var grid = document.getElementById('bizTileGrid');
    if (grid) renderBizHome();
  }
}

/* ═══ FILTER LOGIC ═══ */
function _blvoGetBranchOrders() {
  if (typeof getBranchOrders === 'function') {
    return getBranchOrders();
  }
  return BIZ_ORDERS || [];
}

function _blvoGetFiltered(orders) {
  var list = orders.slice();

  /* Tab filter */
  if (_blvo.tab === 'dine-in') {
    list = list.filter(function(o) { return o.type === 'dine-in'; });
  } else {
    list = list.filter(function(o) { return o.type === 'online' || o.type === 'takeaway'; });
  }

  /* Status filter */
  if (_blvo.statusFilter !== 'all') {
    list = list.filter(function(o) { return o.status === _blvo.statusFilter; });
  }

  /* Search */
  if (_blvo.search.trim()) {
    var q = _blvo.search.toLowerCase().trim();
    list = list.filter(function(o) {
      return o.id.toLowerCase().indexOf(q) > -1
        || (o.customerName && o.customerName.toLowerCase().indexOf(q) > -1)
        || (o.waiterName && o.waiterName.toLowerCase().indexOf(q) > -1);
    });
  }

  /* Sort newest first */
  list.sort(function(a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });

  return list;
}

/* ═══ STATE SETTERS ═══ */
function _blvoSetTab(t) { _blvo.tab = t; _blvoRefresh(); }
function _blvoSearchChange(v) { _blvo.search = v; _blvoRefresh(); }
function _blvoSetStatusFilter(v) { _blvo.statusFilter = v; _blvoRefresh(); }
function _blvoToggleFilters() { _blvo.filtersOpen = !_blvo.filtersOpen; _blvoRefresh(); }
function _blvoResetFilters() { _blvo.statusFilter = 'all'; _blvo.search = ''; _blvo.filtersOpen = false; _blvoRefresh(); }

/* ═══ HELPERS ═══ */
function _blvoEsc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _blvoFmtTL(n) {
  return '₺' + (typeof n === 'number' ? n.toFixed(2) : n);
}

function _blvoElapsed(iso) {
  if (!iso) return '—';
  var diff = Date.now() - new Date(iso).getTime();
  var m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return m + ' dk';
  var hr = Math.floor(m / 60);
  if (hr < 24) return hr + ' saat ' + (m % 60) + ' dk';
  return Math.floor(hr / 24) + ' gün';
}

function _blvoTimeStr(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function _blvoStatusTab(label, value) {
  var active = _blvo.statusFilter === value;
  return '<button class="blvo-status-tab' + (active ? ' active' : '') + '" onclick="_blvoSetStatusFilter(\'' + value + '\')">' + label + '</button>';
}

function _blvoChip(label, value) {
  return '<button class="blvo-chip' + (_blvo.statusFilter === value ? ' active' : '') + '" onclick="_blvoSetStatusFilter(\'' + value + '\')">' + label + '</button>';
}

function _blvoFilterBadge() {
  var c = 0;
  if (_blvo.statusFilter !== 'all') c++;
  if (c === 0) return '';
  return '<span style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:#EF4444;color:#fff;font:var(--fw-bold) 9px/14px var(--font);text-align:center">' + c + '</span>';
}

function _blvoToast(msg, type) {
  var bg = type === 'ok' ? '#22C55E' : type === 'err' ? '#EF4444' : '#6366F1';
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:' + bg + ';color:#fff;padding:10px 20px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:999;white-space:nowrap;box-shadow:var(--shadow-lg)';
  t.textContent = msg;
  document.getElementById('bizPhone').appendChild(t);
  setTimeout(function() { t.remove(); }, 2500);
}

/* ═══ STYLES ═══ */
function _blvoInjectStyles() {
  if (document.getElementById('blvoStyles')) return;
  var s = document.createElement('style');
  s.id = 'blvoStyles';
  s.textContent = '\
    .blvo-live-dot {\
      width:8px;height:8px;border-radius:50%;background:#22C55E;\
      display:inline-block;\
      animation:blvoPulse 1.5s ease-in-out infinite;\
    }\
    @keyframes blvoPulse {\
      0%,100% { opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.4); }\
      50% { opacity:0.7;box-shadow:0 0 0 6px rgba(34,197,94,0); }\
    }\
    .blvo-search {\
      width:100%;box-sizing:border-box;\
      padding:9px 12px 9px 34px;\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      background:var(--bg-phone);\
      font:var(--fw-regular) var(--fs-xs)/1 var(--font);\
      color:var(--text-primary);\
      outline:none;transition:border-color .2s;\
    }\
    .blvo-search:focus { border-color:var(--primary); }\
    .blvo-search::placeholder { color:var(--text-muted); }\
    .blvo-icon-btn {\
      width:36px;height:36px;border-radius:var(--r-md);\
      background:var(--bg-phone);border:1px solid var(--border-subtle);\
      display:flex;align-items:center;justify-content:center;\
      cursor:pointer;position:relative;transition:all .2s;\
    }\
    .blvo-icon-btn:active { transform:scale(0.95); }\
    .blvo-seg {\
      flex:1;padding:8px 10px;\
      border-radius:var(--r-md);\
      border:none;background:transparent;\
      color:var(--text-muted);\
      font:var(--fw-semibold) 11px/1 var(--font);\
      cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;\
      transition:all .2s;\
    }\
    .blvo-seg.active { background:var(--bg-phone);color:var(--primary);box-shadow:var(--shadow-sm); }\
    .blvo-seg-count {\
      font:var(--fw-bold) 9px/1 var(--font);\
      background:var(--border-subtle);color:var(--text-muted);\
      padding:2px 5px;border-radius:var(--r-full);\
    }\
    .blvo-seg-count.active { background:var(--primary);color:#fff; }\
    .blvo-status-tab {\
      padding:6px 12px;border-radius:var(--r-full);\
      border:1px solid var(--border-subtle);\
      background:transparent;\
      color:var(--text-secondary);\
      font:var(--fw-semibold) 11px/1 var(--font);\
      cursor:pointer;white-space:nowrap;\
      transition:all .2s;\
    }\
    .blvo-status-tab.active { border-color:var(--primary);background:var(--primary-soft);color:var(--primary); }\
    .blvo-badge {\
      font:var(--fw-semibold) 9px/1 var(--font);\
      padding:3px 7px;border-radius:var(--r-full);\
      display:inline-flex;align-items:center;gap:2px;\
      white-space:nowrap;\
    }\
    .blvo-row {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      padding:12px;\
      cursor:pointer;transition:all .15s;\
    }\
    .blvo-row:active { transform:scale(0.99);opacity:0.9; }\
    .blvo-filter-panel {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-xl);\
      padding:12px;\
      box-shadow:var(--shadow-md);\
    }\
    .blvo-chip {\
      padding:6px 12px;border-radius:var(--r-full);\
      border:1px solid var(--border-subtle);\
      background:transparent;\
      color:var(--text-secondary);\
      font:var(--fw-medium) 11px/1 var(--font);\
      cursor:pointer;transition:all .2s;\
    }\
    .blvo-chip.active { border-color:var(--primary);background:var(--primary-soft);color:var(--primary); }\
    .blvo-drawer-backdrop {\
      position:fixed;top:0;left:0;right:0;bottom:0;\
      background:rgba(0,0,0,0);z-index:80;\
      transition:background .3s;\
    }\
    .blvo-drawer-backdrop.open { background:rgba(0,0,0,0.45); }\
    .blvo-drawer {\
      position:fixed;top:0;right:-100%;bottom:0;\
      width:88%;max-width:380px;\
      background:var(--bg-phone);\
      box-shadow:-4px 0 24px rgba(0,0,0,0.12);\
      transition:right .3s cubic-bezier(0.4,0,0.2,1);\
      z-index:81;\
      border-radius:var(--r-xl) 0 0 var(--r-xl);\
    }\
    .blvo-drawer-backdrop.open .blvo-drawer { right:0; }\
    .blvo-drawer-scroll {\
      height:100%;overflow-y:auto;\
      -webkit-overflow-scrolling:touch;\
      padding:20px 16px;\
    }\
    .blvo-section { margin-bottom:16px; }\
    .blvo-section-title {\
      font:var(--fw-semibold) 12px/1 var(--font);\
      color:var(--text-secondary);\
      margin-bottom:10px;\
      display:flex;align-items:center;gap:6px;\
    }\
    .blvo-action-btn {\
      padding:12px;border-radius:var(--r-md);border:none;\
      font:var(--fw-semibold) var(--fs-sm)/1 var(--font);\
      cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;\
      transition:opacity .2s;width:100%;\
    }\
    .blvo-action-btn:active { opacity:0.8; }\
  ';
  document.head.appendChild(s);
}

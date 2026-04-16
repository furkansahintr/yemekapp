/* ═══════════════════════════════════════════════════════════
   ADMIN ORDERS — Bugünkü Siparişler (Redesign)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _aord = {
  filter: 'all',
  search: '',
  typeFilter: 'all',       /* all | online | masa */
  minAmount: '',
  maxAmount: '',
  dateRange: 'today',      /* today | week | month */
  filtersOpen: false,
  analyticsOpen: false
};

/* ── Status map ── */
var _AORD_ST = {
  preparing:       { label: 'Hazırlanıyor',    color: '#F59E0B', icon: 'solar:chef-hat-bold',       bg: '#FEF3C7' },
  on_way:          { label: 'Yolda',            color: '#3B82F6', icon: 'solar:delivery-bold',       bg: '#DBEAFE' },
  delivered:       { label: 'Teslim Edildi',    color: '#22C55E', icon: 'solar:check-circle-bold',   bg: '#DCFCE7' },
  cancelled_user:  { label: 'Kullanıcı İptali', color: '#EF4444', icon: 'solar:close-circle-bold',  bg: '#FEE2E2' },
  cancelled_biz:   { label: 'İşletme İptali',  color: '#F97316', icon: 'solar:close-circle-bold',   bg: '#FFEDD5' },
  cancelled_admin: { label: 'Admin İptali',     color: '#8B5CF6', icon: 'solar:shield-warning-bold', bg: '#EDE9FE' }
};

/* ═══ MAIN RENDER ═══ */
function renderAdminOrders() {
  _admInjectStyles();
  _aordInjectStyles();
  var c = document.getElementById('adminOrdersContainer');
  if (!c) return;

  var filtered = _aordGetFiltered();
  var todayStr = new Date().toISOString().split('T')[0];
  var todayAll = ADMIN_ORDERS.filter(function(o) { return o.date.startsWith(todayStr); });

  var h = '<div class="adm-fadeIn" style="padding:16px;display:flex;flex-direction:column;gap:16px">';

  /* ── Big Header ── */
  h += '<div style="display:flex;align-items:flex-start;justify-content:space-between">'
    + '<div>'
    + '<div style="font:var(--fw-bold) 22px/1.1 var(--font);color:var(--text-primary)">Bugünkü Siparişler</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:4px">'
    + new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px">'
    + '<div class="aord-icon-btn" onclick="_aordToggleAnalytics()"><iconify-icon icon="solar:chart-2-bold" style="font-size:18px;color:var(--primary)"></iconify-icon></div>'
    + '<div class="aord-icon-btn" onclick="_aordToggleFilters()"><iconify-icon icon="solar:filter-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>' + _aordActiveFilterBadge() + '</div>'
    + '</div>'
    + '</div>';

  /* ── Search Bar ── */
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="aord-search" placeholder="Sipariş ID, işletme veya müşteri ara..." value="' + _aordEsc(_aord.search) + '" oninput="_aordSearchChange(this.value)" />'
    + '</div>';

  /* ── Quick Status Tabs ── */
  h += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">'
    + _aordTab('Tümü', 'all', todayAll.length)
    + _aordTab('Aktif', 'active', todayAll.filter(function(o){return o.status==='preparing'||o.status==='on_way';}).length)
    + _aordTab('Tamamlanan', 'delivered', todayAll.filter(function(o){return o.status==='delivered';}).length)
    + _aordTab('İptal', 'cancelled', todayAll.filter(function(o){return o.status.startsWith('cancelled');}).length)
    + '</div>';

  /* ── Filter Panel (collapsible) ── */
  if (_aord.filtersOpen) {
    h += _aordRenderFilterPanel();
  }

  /* ── Analytics Popup ── */
  if (_aord.analyticsOpen) {
    h += _aordRenderAnalyticsPopup(todayAll);
  }

  /* ── Order Count ── */
  h += '<div style="display:flex;align-items:center;justify-content:space-between">'
    + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + filtered.length + ' sipariş listeleniyor</span>'
    + '</div>';

  /* ── Order List ── */
  if (filtered.length === 0) {
    h += '<div style="text-align:center;padding:48px 20px">'
      + '<iconify-icon icon="solar:bag-check-bold" style="font-size:52px;color:var(--text-muted);opacity:0.3"></iconify-icon>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:14px">Sonuç bulunamadı</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-tertiary);margin-top:4px">Filtreleri değiştirmeyi deneyin</div>'
      + '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    for (var i = 0; i < filtered.length; i++) {
      h += _aordRenderRow(filtered[i]);
    }
    h += '</div>';
  }

  h += '<div style="height:24px"></div></div>';
  c.innerHTML = h;
}

/* ═══ ORDER ROW ═══ */
function _aordRenderRow(o) {
  var st = _AORD_ST[o.status] || _AORD_ST.delivered;
  var isCancel = o.status.startsWith('cancelled');
  var typeBg = o.type === 'masa' ? '#F59E0B' : '#3B82F6';
  var typeLabel = o.type === 'masa' ? 'Masa' : 'Online';
  var typeIcon = o.type === 'masa' ? 'solar:chair-bold' : 'solar:smartphone-bold';

  return '<div class="aord-row" onclick="_aordOpenDrawer(\'' + o.id + '\')">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    /* status dot */
    + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:' + st.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="' + st.icon + '" style="font-size:18px;color:' + st.color + '"></iconify-icon>'
    + '</div>'
    /* info */
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + o.orderId + '</span>'
    + '<span class="aord-badge" style="background:' + st.bg + ';color:' + st.color + '">' + st.label + '</span>'
    + '<span class="aord-badge" style="background:' + typeBg + '18;color:' + typeBg + '"><iconify-icon icon="' + typeIcon + '" style="font-size:10px;margin-right:2px"></iconify-icon>' + typeLabel + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:4px">' + o.business + ' · ' + o.branch + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-tertiary);margin-top:2px">' + o.user + ' · ' + _admRelative(o.date) + '</div>'
    + '</div>'
    /* right */
    + '<div style="text-align:right;flex-shrink:0">'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + _admFmtTL(o.total) + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:#22C55E;margin-top:3px">+' + _admFmtTL(o.commission) + '</div>'
    + (o.deliveryTime ? '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:2px">' + o.deliveryTime + ' dk</div>' : '')
    + '</div>'
    + '</div>'
    + '</div>';
}

/* ═══ TAB ═══ */
function _aordTab(label, value, count) {
  var active = _aord.filter === value;
  return '<button class="aord-tab' + (active ? ' active' : '') + '" onclick="_aordSetFilter(\'' + value + '\')">'
    + label
    + '<span class="aord-tab-count' + (active ? ' active' : '') + '">' + count + '</span>'
    + '</button>';
}

/* ═══ FILTER PANEL ═══ */
function _aordRenderFilterPanel() {
  var h = '<div class="aord-filter-panel">';

  /* Sipariş Tipi */
  h += '<div style="margin-bottom:12px">'
    + '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Sipariş Tipi</div>'
    + '<div style="display:flex;gap:6px">'
    + _aordFilterChip('Tümü', 'all', _aord.typeFilter === 'all', '_aordSetType')
    + _aordFilterChip('Online', 'online', _aord.typeFilter === 'online', '_aordSetType')
    + _aordFilterChip('Masa', 'masa', _aord.typeFilter === 'masa', '_aordSetType')
    + '</div></div>';

  /* Tutar Aralığı */
  h += '<div style="margin-bottom:12px">'
    + '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Tutar Aralığı</div>'
    + '<div style="display:flex;gap:8px;align-items:center">'
    + '<input class="aord-amount-input" placeholder="Min ₺" value="' + _aordEsc(_aord.minAmount) + '" oninput="_aord.minAmount=this.value;renderAdminOrders()" />'
    + '<span style="color:var(--text-muted);font-size:12px">—</span>'
    + '<input class="aord-amount-input" placeholder="Max ₺" value="' + _aordEsc(_aord.maxAmount) + '" oninput="_aord.maxAmount=this.value;renderAdminOrders()" />'
    + '</div></div>';

  /* Tarih */
  h += '<div style="margin-bottom:8px">'
    + '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Tarih Aralığı</div>'
    + '<div style="display:flex;gap:6px">'
    + _aordFilterChip('Bugün', 'today', _aord.dateRange === 'today', '_aordSetDate')
    + _aordFilterChip('Haftalık', 'week', _aord.dateRange === 'week', '_aordSetDate')
    + _aordFilterChip('Aylık', 'month', _aord.dateRange === 'month', '_aordSetDate')
    + '</div></div>';

  /* Reset */
  h += '<div style="text-align:right;padding-top:8px;border-top:1px solid var(--border-subtle)">'
    + '<button class="aord-reset-btn" onclick="_aordResetFilters()">Filtreleri Temizle</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _aordFilterChip(label, value, active, fn) {
  return '<button class="aord-chip' + (active ? ' active' : '') + '" onclick="' + fn + '(\'' + value + '\')">' + label + '</button>';
}

/* ═══ ANALYTICS POPUP ═══ */
function _aordRenderAnalyticsPopup(todayAll) {
  var active = todayAll.filter(function(o) { return o.status === 'preparing' || o.status === 'on_way'; }).length;
  var delivered = todayAll.filter(function(o) { return o.status === 'delivered'; }).length;
  var cancelledU = todayAll.filter(function(o) { return o.status === 'cancelled_user'; }).length;
  var cancelledB = todayAll.filter(function(o) { return o.status === 'cancelled_biz'; }).length;
  var cancelledA = todayAll.filter(function(o) { return o.status === 'cancelled_admin'; }).length;
  var totalRev = todayAll.reduce(function(s, o) { return s + o.total; }, 0);
  var totalComm = todayAll.reduce(function(s, o) { return s + o.commission; }, 0);
  var onlineC = todayAll.filter(function(o) { return o.type === 'online'; }).length;
  var masaC = todayAll.filter(function(o) { return o.type === 'masa'; }).length;
  var deliveredOrders = todayAll.filter(function(o) { return o.status === 'delivered' && o.deliveryTime; });
  var avgDel = deliveredOrders.length > 0 ? Math.round(deliveredOrders.reduce(function(s, o) { return s + o.deliveryTime; }, 0) / deliveredOrders.length) : 0;

  var h = '<div class="aord-analytics-popup">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Günlük Analiz</div>'
    + '<div class="aord-icon-btn" onclick="_aordToggleAnalytics()" style="width:28px;height:28px"><iconify-icon icon="solar:close-circle-bold" style="font-size:16px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  /* Quick Stats Grid */
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">'
    + _aordAnalyticCard('Aktif', active, '#3B82F6', 'solar:bag-check-bold')
    + _aordAnalyticCard('Tamamlanan', delivered, '#22C55E', 'solar:check-circle-bold')
    + _aordAnalyticCard('İptal', cancelledU + cancelledB + cancelledA, '#EF4444', 'solar:close-circle-bold')
    + '</div>';

  /* Financial Row */
  h += '<div style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%);border-radius:var(--r-lg);padding:14px;color:#fff;margin-bottom:14px">'
    + '<div style="display:flex;justify-content:space-between">'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7">Ciro</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + _admFmtTL(totalRev) + '</div></div>'
    + '<div style="text-align:center"><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7">Komisyon</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + _admFmtTL(totalComm) + '</div></div>'
    + '<div style="text-align:right"><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7">Ort. Teslimat</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + avgDel + ' dk</div></div>'
    + '</div></div>';

  /* Type Split */
  var totalCount = onlineC + masaC || 1;
  h += '<div style="margin-bottom:6px">'
    + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);margin-bottom:8px">Sipariş Dağılımı</div>'
    + '<div style="display:flex;gap:8px">'
    + '<div style="flex:1;background:#3B82F618;border-radius:var(--r-md);padding:10px;text-align:center">'
    + '<iconify-icon icon="solar:smartphone-bold" style="font-size:16px;color:#3B82F6"></iconify-icon>'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#3B82F6;margin-top:4px">' + onlineC + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">Online (%' + Math.round(onlineC / totalCount * 100) + ')</div>'
    + '</div>'
    + '<div style="flex:1;background:#F59E0B18;border-radius:var(--r-md);padding:10px;text-align:center">'
    + '<iconify-icon icon="solar:chair-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#F59E0B;margin-top:4px">' + masaC + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">Masa (%' + Math.round(masaC / totalCount * 100) + ')</div>'
    + '</div>'
    + '</div></div>';

  /* Cancel breakdown */
  if (cancelledU + cancelledB + cancelledA > 0) {
    h += '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);margin-bottom:6px;margin-top:8px">İptal Detayı</div>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    if (cancelledU > 0) h += '<span class="aord-badge" style="background:#FEE2E2;color:#EF4444">Kullanıcı: ' + cancelledU + '</span>';
    if (cancelledB > 0) h += '<span class="aord-badge" style="background:#FFEDD5;color:#F97316">İşletme: ' + cancelledB + '</span>';
    if (cancelledA > 0) h += '<span class="aord-badge" style="background:#EDE9FE;color:#8B5CF6">Admin: ' + cancelledA + '</span>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _aordAnalyticCard(label, val, color, icon) {
  return '<div style="background:' + color + '10;border-radius:var(--r-md);padding:10px;text-align:center">'
    + '<iconify-icon icon="' + icon + '" style="font-size:18px;color:' + color + '"></iconify-icon>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + ';margin-top:4px">' + val + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + label + '</div>'
    + '</div>';
}

/* ═══ SIDE DRAWER DETAIL ═══ */
function _aordOpenDrawer(orderId) {
  var order = ADMIN_ORDERS.find(function(o) { return o.id === orderId; });
  if (!order) return;

  var user = ADMIN_USERS.find(function(u) { return u.name === order.user; });
  var biz = ADMIN_BUSINESSES.find(function(b) { return b.name === order.business; });
  var st = _AORD_ST[order.status] || _AORD_ST.delivered;
  var isCancel = order.status.startsWith('cancelled');

  /* Remove existing drawer */
  var old = document.getElementById('aordDrawer');
  if (old) old.remove();

  var d = document.createElement('div');
  d.id = 'aordDrawer';
  d.className = 'aord-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _aordCloseDrawer(); };

  var h = '<div class="aord-drawer">'
    + '<div class="aord-drawer-scroll">';

  /* ── Drawer Header ── */
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + order.orderId + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px">' + _admDate(order.date) + '</div>'
    + '</div>'
    + '<div class="aord-icon-btn" onclick="_aordCloseDrawer()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  /* ── Status + Type Badges ── */
  h += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:#fff;background:' + st.color + ';padding:5px 10px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="' + st.icon + '" style="font-size:12px"></iconify-icon>' + st.label + '</span>'
    + '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:' + (order.type === 'masa' ? '#F59E0B' : '#3B82F6') + ';background:' + (order.type === 'masa' ? '#FEF3C7' : '#DBEAFE') + ';padding:5px 10px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="' + (order.type === 'masa' ? 'solar:chair-bold' : 'solar:smartphone-bold') + '" style="font-size:12px"></iconify-icon>' + (order.type === 'masa' ? 'Masa Siparişi' : 'Online Sipariş') + '</span>'
    + '</div>';

  /* ── Items List ── */
  if (order.items && order.items.length > 0) {
    h += '<div class="aord-section">'
      + '<div class="aord-section-title"><iconify-icon icon="solar:bag-4-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>Sipariş Kalemleri</div>'
      + '<div style="display:flex;flex-direction:column;gap:4px">';
    for (var i = 0; i < order.items.length; i++) {
      h += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);padding:4px 0;' + (i < order.items.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
        + '<iconify-icon icon="solar:plate-bold" style="font-size:11px;color:var(--text-muted);margin-right:4px"></iconify-icon>'
        + order.items[i] + '</div>';
    }
    h += '</div></div>';
  }

  /* ── Financial Summary ── */
  h += '<div class="aord-section">'
    + '<div class="aord-section-title"><iconify-icon icon="solar:wallet-money-bold" style="font-size:14px;color:#22C55E"></iconify-icon>Mali Özet</div>'
    + '<div style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%);border-radius:var(--r-lg);padding:14px;color:#fff">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:.8">Sipariş Tutarı</span>'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font)">' + _admFmtTL(order.total) + '</span>'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:.8">Platform Komisyon</span>'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font)">+' + _admFmtTL(order.commission) + '</span>'
    + '</div>'
    + '<div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:8px;display:flex;justify-content:space-between">'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:.8">İşletmeye Ödenen</span>'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font)">' + _admFmtTL(order.total - order.commission) + '</span>'
    + '</div>'
    + '</div></div>';

  /* ── Token Flow ── */
  if (order.tokenBefore != null) {
    var tBefore = order.tokenBefore;
    var tAfter = order.tokenAfter != null ? order.tokenAfter : tBefore;
    var tDiff = tBefore - tAfter;
    var refundPct = isCancel ? (order.status === 'cancelled_user' ? '50%' : order.status === 'cancelled_biz' ? '25%' : '0%') : '100%';

    h += '<div class="aord-section">'
      + '<div class="aord-section-title"><iconify-icon icon="solar:coin-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>Token Akışı</div>'
      + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);overflow:hidden">';

    /* Visual flow */
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px">'
      + '<div style="text-align:center;flex:1">'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">İşlem Öncesi</div>'
      + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:4px">' + _admFmt(tBefore) + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:2px">Token</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;align-items:center;padding:0 8px">'
      + '<iconify-icon icon="solar:arrow-right-bold" style="font-size:18px;color:' + (tDiff >= 0 ? '#EF4444' : '#22C55E') + '"></iconify-icon>'
      + '<div style="font:var(--fw-bold) 11px/1 var(--font);color:' + (tDiff >= 0 ? '#EF4444' : '#22C55E') + ';margin-top:2px">' + (tDiff >= 0 ? '-' : '+') + _admFmt(Math.abs(tDiff)) + '</div>'
      + '</div>'
      + '<div style="text-align:center;flex:1">'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">İşlem Sonrası</div>'
      + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + (order.tokenAfter != null ? 'var(--text-primary)' : 'var(--text-muted)') + ';margin-top:4px">' + (order.tokenAfter != null ? _admFmt(tAfter) : '—') + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:2px">Token</div>'
      + '</div>'
      + '</div>';

    /* Commission rule */
    if (isCancel) {
      var cancelType = order.status === 'cancelled_user' ? 'Kullanıcı İptali' : order.status === 'cancelled_biz' ? 'İşletme İptali' : 'Admin İptali';
      h += '<div style="padding:10px 14px;background:' + st.bg + ';border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">'
        + '<iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:' + st.color + '"></iconify-icon>'
        + '<span style="font:var(--fw-medium) 11px/1.3 var(--font);color:' + st.color + '">' + cancelType + ': Komisyonun ' + refundPct + '\'i iade edildi</span>'
        + '</div>';
    } else if (order.status === 'delivered') {
      h += '<div style="padding:10px 14px;background:#DCFCE7;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">'
        + '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon>'
        + '<span style="font:var(--fw-medium) 11px/1.3 var(--font);color:#22C55E">Tamamlanan Sipariş: Komisyonun %100\'ü kesildi</span>'
        + '</div>';
    }

    h += '</div></div>';
  }

  /* ── Cancel Reason ── */
  if (isCancel && order.cancelReason) {
    h += '<div class="aord-section">'
      + '<div class="aord-section-title"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>İptal Nedeni</div>'
      + '<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:var(--r-lg);padding:12px;display:flex;align-items:flex-start;gap:8px">'
      + '<iconify-icon icon="solar:chat-round-dots-bold" style="font-size:16px;color:#EF4444;margin-top:1px;flex-shrink:0"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-xs)/1.4 var(--font);color:#991B1B">"' + order.cancelReason + '"</div>'
      + '</div></div>';
  }

  /* ── Delivery Info ── */
  if (order.deliveryTime) {
    h += '<div class="aord-section">'
      + '<div class="aord-section-title"><iconify-icon icon="solar:clock-circle-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>Teslimat</div>'
      + '<div style="background:#EDE9FE;border-radius:var(--r-lg);padding:12px;display:flex;align-items:center;gap:10px">'
      + '<div style="font:var(--fw-bold) 22px/1 var(--font);color:#8B5CF6">' + order.deliveryTime + '</div>'
      + '<div><div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#6D28D9">dakika</div><div style="font:var(--fw-regular) 10px/1 var(--font);color:#7C3AED;margin-top:2px">Teslimat süresi</div></div>'
      + '</div></div>';
  }

  /* ── Business Card ── */
  if (biz) {
    h += '<div class="aord-section">'
      + '<div class="aord-section-title"><iconify-icon icon="solar:shop-bold" style="font-size:14px;color:#3B82F6"></iconify-icon>İşletme</div>'
      + '<div class="aord-contact-card">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
      + '<div style="width:38px;height:38px;border-radius:var(--r-md);background:#DBEAFE;display:flex;align-items:center;justify-content:center">'
      + '<iconify-icon icon="solar:shop-bold" style="font-size:18px;color:#3B82F6"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + biz.name + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + order.branch + ' Şubesi · ' + biz.city + '</div>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<div style="flex:1;background:#F0FDF4;border-radius:var(--r-md);padding:6px 8px;text-align:center"><div style="font:var(--fw-bold) 11px/1 var(--font);color:#22C55E">' + biz.rating.toFixed(1) + '</div><div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Puan</div></div>'
      + '<div style="flex:1;background:#EFF6FF;border-radius:var(--r-md);padding:6px 8px;text-align:center"><div style="font:var(--fw-bold) 11px/1 var(--font);color:#3B82F6">%' + biz.commission + '</div><div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Komisyon</div></div>'
      + '<div style="flex:1;background:#FDF4FF;border-radius:var(--r-md);padding:6px 8px;text-align:center"><div style="font:var(--fw-bold) 11px/1 var(--font);color:#A855F7">' + _admFmt(biz.monthlyOrders) + '</div><div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Aylık</div></div>'
      + '</div>'
      + '</div></div>';
  }

  /* ── User Card ── */
  if (user) {
    h += '<div class="aord-section">'
      + '<div class="aord-section-title"><iconify-icon icon="solar:user-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>Müşteri</div>'
      + '<div class="aord-contact-card">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:#EDE9FE;display:flex;align-items:center;justify-content:center">'
      + '<iconify-icon icon="solar:user-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + user.name + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + user.city + ' · ' + _admRelative(user.lastActive) + ' aktif</div>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:6px">'
      + '<div style="flex:1;background:#EFF6FF;border-radius:var(--r-md);padding:6px 8px;text-align:center"><div style="font:var(--fw-bold) 11px/1 var(--font);color:#3B82F6">' + user.orders + '</div><div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Sipariş</div></div>'
      + '<div style="flex:1;background:#F0FDF4;border-radius:var(--r-md);padding:6px 8px;text-align:center"><div style="font:var(--fw-bold) 11px/1 var(--font);color:#22C55E">' + _admFmtTL(user.spent) + '</div><div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">Harcama</div></div>'
      + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      + '<a href="tel:' + user.phone + '" class="aord-contact-btn" style="background:#DCFCE7;color:#22C55E"><iconify-icon icon="solar:phone-bold" style="font-size:14px"></iconify-icon>Ara</a>'
      + '<a href="mailto:' + user.email + '" class="aord-contact-btn" style="background:#DBEAFE;color:#3B82F6"><iconify-icon icon="solar:letter-bold" style="font-size:14px"></iconify-icon>E-posta</a>'
      + '</div>'
      + '</div></div>';
  }

  /* ── Status Timeline ── */
  h += '<div class="aord-section">'
    + '<div class="aord-section-title"><iconify-icon icon="solar:history-bold" style="font-size:14px;color:var(--text-secondary)"></iconify-icon>Durum Geçmişi</div>'
    + _aordTimeline(order)
    + '</div>';

  h += '</div></div>';

  d.innerHTML = h;
  document.getElementById('adminPhone').appendChild(d);

  /* Animate in */
  requestAnimationFrame(function() {
    d.classList.add('open');
  });
}

function _aordCloseDrawer() {
  var d = document.getElementById('aordDrawer');
  if (!d) return;
  d.classList.remove('open');
  setTimeout(function() { d.remove(); }, 300);
}

/* ── Timeline ── */
function _aordTimeline(order) {
  var steps = [];
  if (order.status === 'delivered') {
    steps = [
      { label: 'Sipariş Alındı', st: 'done' },
      { label: 'Hazırlanıyor', st: 'done' },
      { label: 'Yolda', st: 'done' },
      { label: 'Teslim Edildi', st: 'done' }
    ];
  } else if (order.status === 'on_way') {
    steps = [
      { label: 'Sipariş Alındı', st: 'done' },
      { label: 'Hazırlanıyor', st: 'done' },
      { label: 'Yolda', st: 'active' },
      { label: 'Teslim Bekliyor', st: 'pending' }
    ];
  } else if (order.status === 'preparing') {
    steps = [
      { label: 'Sipariş Alındı', st: 'done' },
      { label: 'Hazırlanıyor', st: 'active' },
      { label: 'Yolda', st: 'pending' },
      { label: 'Teslim Bekliyor', st: 'pending' }
    ];
  } else {
    steps = [
      { label: 'Sipariş Alındı', st: 'done' },
      { label: 'İptal Edildi', st: 'cancelled' }
    ];
  }

  var h = '<div style="display:flex;flex-direction:column;gap:0">';
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    var col = s.st === 'done' ? '#22C55E' : s.st === 'active' ? '#3B82F6' : s.st === 'cancelled' ? '#EF4444' : '#D1D5DB';
    var icn = s.st === 'done' ? 'solar:check-circle-bold' : s.st === 'active' ? 'solar:hourglass-bold' : s.st === 'cancelled' ? 'solar:close-circle-bold' : 'solar:circle-bold';
    var isLast = i === steps.length - 1;
    h += '<div style="display:flex;gap:10px;position:relative">'
      + '<div style="display:flex;flex-direction:column;align-items:center">'
      + '<div style="width:24px;height:24px;border-radius:50%;background:' + col + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">'
      + '<iconify-icon icon="' + icn + '" style="font-size:12px;color:' + col + '"></iconify-icon>'
      + '</div>'
      + (!isLast ? '<div style="width:2px;flex:1;background:' + (s.st === 'done' ? '#22C55E' : 'var(--border-subtle)') + ';min-height:16px"></div>' : '')
      + '</div>'
      + '<div style="padding-bottom:' + (isLast ? '0' : '12') + 'px">'
      + '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + s.label + '</div>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══ FILTER LOGIC ═══ */
function _aordGetFiltered() {
  var list = ADMIN_ORDERS.slice();

  /* Date Range */
  var now = new Date();
  var todayStr = now.toISOString().split('T')[0];
  if (_aord.dateRange === 'today') {
    list = list.filter(function(o) { return o.date.startsWith(todayStr); });
  } else if (_aord.dateRange === 'week') {
    var weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    list = list.filter(function(o) { return o.date >= weekAgo; });
  }
  /* month = show all (our seed is within a month) */

  /* Status filter */
  if (_aord.filter === 'active') {
    list = list.filter(function(o) { return o.status === 'preparing' || o.status === 'on_way'; });
  } else if (_aord.filter === 'delivered') {
    list = list.filter(function(o) { return o.status === 'delivered'; });
  } else if (_aord.filter === 'cancelled') {
    list = list.filter(function(o) { return o.status.startsWith('cancelled'); });
  }

  /* Type filter */
  if (_aord.typeFilter !== 'all') {
    list = list.filter(function(o) { return o.type === _aord.typeFilter; });
  }

  /* Amount filter */
  var min = parseFloat(_aord.minAmount);
  var max = parseFloat(_aord.maxAmount);
  if (!isNaN(min)) list = list.filter(function(o) { return o.total >= min; });
  if (!isNaN(max)) list = list.filter(function(o) { return o.total <= max; });

  /* Search */
  if (_aord.search.trim()) {
    var q = _aord.search.toLowerCase().trim();
    list = list.filter(function(o) {
      return o.orderId.toLowerCase().indexOf(q) > -1
        || o.business.toLowerCase().indexOf(q) > -1
        || o.user.toLowerCase().indexOf(q) > -1
        || o.branch.toLowerCase().indexOf(q) > -1;
    });
  }

  /* Sort newest first */
  list.sort(function(a, b) { return b.date.localeCompare(a.date); });

  return list;
}

/* ═══ STATE SETTERS ═══ */
function _aordSetFilter(v) { _aord.filter = v; renderAdminOrders(); }
function _aordSetType(v) { _aord.typeFilter = v; renderAdminOrders(); }
function _aordSetDate(v) { _aord.dateRange = v; renderAdminOrders(); }
function _aordSearchChange(v) { _aord.search = v; renderAdminOrders(); }

function _aordToggleFilters() {
  _aord.filtersOpen = !_aord.filtersOpen;
  if (_aord.filtersOpen) _aord.analyticsOpen = false;
  renderAdminOrders();
}
function _aordToggleAnalytics() {
  _aord.analyticsOpen = !_aord.analyticsOpen;
  if (_aord.analyticsOpen) _aord.filtersOpen = false;
  renderAdminOrders();
}

function _aordResetFilters() {
  _aord.filter = 'all';
  _aord.search = '';
  _aord.typeFilter = 'all';
  _aord.minAmount = '';
  _aord.maxAmount = '';
  _aord.dateRange = 'today';
  _aord.filtersOpen = false;
  renderAdminOrders();
}

function _aordActiveFilterBadge() {
  var count = 0;
  if (_aord.typeFilter !== 'all') count++;
  if (_aord.minAmount || _aord.maxAmount) count++;
  if (_aord.dateRange !== 'today') count++;
  if (count === 0) return '';
  return '<span style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:#EF4444;color:#fff;font:var(--fw-bold) 9px/14px var(--font);text-align:center">' + count + '</span>';
}

/* ═══ HELPERS ═══ */
function _aordEsc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══ STYLES ═══ */
function _aordInjectStyles() {
  if (document.getElementById('aordStyles')) return;
  var s = document.createElement('style');
  s.id = 'aordStyles';
  s.textContent = '\
    .aord-search {\
      width:100%;box-sizing:border-box;\
      padding:10px 12px 10px 36px;\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      background:var(--bg-phone);\
      font:var(--fw-regular) var(--fs-xs)/1 var(--font);\
      color:var(--text-primary);\
      outline:none;\
      transition:border-color .2s;\
    }\
    .aord-search:focus { border-color:var(--primary); }\
    .aord-search::placeholder { color:var(--text-muted); }\
    .aord-icon-btn {\
      width:36px;height:36px;border-radius:var(--r-md);\
      background:var(--bg-phone);border:1px solid var(--border-subtle);\
      display:flex;align-items:center;justify-content:center;\
      cursor:pointer;position:relative;transition:all .2s;\
    }\
    .aord-icon-btn:active { transform:scale(0.95); }\
    .aord-tab {\
      padding:7px 14px;border-radius:var(--r-full);\
      border:1px solid var(--border-subtle);\
      background:transparent;\
      color:var(--text-secondary);\
      font:var(--fw-semibold) var(--fs-xs)/1 var(--font);\
      cursor:pointer;white-space:nowrap;\
      display:inline-flex;align-items:center;gap:6px;\
      transition:all .2s;\
    }\
    .aord-tab.active { border-color:var(--primary);background:var(--primary-soft);color:var(--primary); }\
    .aord-tab-count {\
      font:var(--fw-bold) 10px/1 var(--font);\
      background:var(--border-subtle);color:var(--text-muted);\
      padding:2px 6px;border-radius:var(--r-full);\
    }\
    .aord-tab-count.active { background:var(--primary);color:#fff; }\
    .aord-badge {\
      font:var(--fw-semibold) 9px/1 var(--font);\
      padding:3px 7px;border-radius:var(--r-full);\
      display:inline-flex;align-items:center;gap:2px;\
      white-space:nowrap;\
    }\
    .aord-row {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      padding:12px;\
      cursor:pointer;\
      transition:all .15s;\
    }\
    .aord-row:active { transform:scale(0.99);opacity:0.9; }\
    .aord-filter-panel {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-xl);\
      padding:16px;\
      box-shadow:var(--shadow-md);\
      animation:admFadeIn .2s ease;\
    }\
    .aord-chip {\
      padding:6px 12px;border-radius:var(--r-full);\
      border:1px solid var(--border-subtle);\
      background:transparent;\
      color:var(--text-secondary);\
      font:var(--fw-medium) 11px/1 var(--font);\
      cursor:pointer;transition:all .2s;\
    }\
    .aord-chip.active { border-color:var(--primary);background:var(--primary-soft);color:var(--primary); }\
    .aord-amount-input {\
      flex:1;padding:8px 10px;\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-md);\
      background:var(--bg-phone);\
      font:var(--fw-regular) 11px/1 var(--font);\
      color:var(--text-primary);\
      outline:none;width:60px;\
    }\
    .aord-amount-input:focus { border-color:var(--primary); }\
    .aord-amount-input::placeholder { color:var(--text-muted); }\
    .aord-reset-btn {\
      padding:6px 14px;border-radius:var(--r-full);\
      border:1px solid #EF4444;\
      background:rgba(239,68,68,0.08);\
      color:#EF4444;\
      font:var(--fw-semibold) 11px/1 var(--font);\
      cursor:pointer;\
    }\
    .aord-analytics-popup {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-xl);\
      padding:16px;\
      box-shadow:var(--shadow-lg);\
      animation:admFadeIn .2s ease;\
    }\
    .aord-drawer-backdrop {\
      position:fixed;top:0;left:0;right:0;bottom:0;\
      background:rgba(0,0,0,0);z-index:80;\
      transition:background .3s;\
    }\
    .aord-drawer-backdrop.open { background:rgba(0,0,0,0.45); }\
    .aord-drawer {\
      position:fixed;top:0;right:-100%;bottom:0;\
      width:88%;max-width:380px;\
      background:var(--bg-phone);\
      box-shadow:-4px 0 24px rgba(0,0,0,0.12);\
      transition:right .3s cubic-bezier(0.4,0,0.2,1);\
      z-index:81;\
      border-radius:var(--r-xl) 0 0 var(--r-xl);\
    }\
    .aord-drawer-backdrop.open .aord-drawer { right:0; }\
    .aord-drawer-scroll {\
      height:100%;overflow-y:auto;\
      -webkit-overflow-scrolling:touch;\
      padding:20px 16px;\
    }\
    .aord-section { margin-bottom:16px; }\
    .aord-section-title {\
      font:var(--fw-semibold) 12px/1 var(--font);\
      color:var(--text-secondary);\
      margin-bottom:10px;\
      display:flex;align-items:center;gap:6px;\
    }\
    .aord-contact-card {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      padding:12px;\
    }\
    .aord-contact-btn {\
      flex:1;padding:8px;border-radius:var(--r-md);\
      font:var(--fw-semibold) 11px/1 var(--font);\
      text-align:center;text-decoration:none;\
      display:inline-flex;align-items:center;justify-content:center;gap:4px;\
      transition:opacity .2s;\
    }\
    .aord-contact-btn:active { opacity:0.7; }\
  ';
  document.head.appendChild(s);
}

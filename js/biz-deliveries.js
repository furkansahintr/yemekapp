/* ═══════════════════════════════════════════════════════════
   BIZ DELIVERIES — Teslimat Yönetimi (yalnızca online siparişler)
   Aktif / Geçmiş sekmeli liste + detay drawer + Yola Çık / Teslim Edildi aksiyonları
   ═══════════════════════════════════════════════════════════ */

var _bd = {
  tab: 'active'   // 'active' | 'history'
};

function openBizDelivery() {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('delivery')) return;
  _bdInjectStyles();
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === bizActiveBranch; });
  var title = 'Teslimatlar' + (branch ? ' · ' + branch.name : '');
  var overlay = createBizOverlay('bizDeliveriesOverlay', title, _bdRenderBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

/* ── Data helpers ── */
function _bdAllOnline() {
  return BIZ_ORDERS.filter(function(o){ return o.type === 'online' && o.branchId === bizActiveBranch; });
}
function _bdActiveOrders() {
  return _bdAllOnline().filter(function(o){ return o.status !== 'delivered' && o.status !== 'cancelled'; });
}
function _bdHistoryOrders() {
  return _bdAllOnline().filter(function(o){ return o.status === 'delivered' || o.status === 'cancelled'; });
}

function _bdFmt(n) { return '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function _bdMaskName(full) {
  if (!full) return '—';
  var parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  var last = parts[parts.length - 1];
  var masked = last.charAt(0) + '****';
  return parts.slice(0, -1).concat(masked).join(' ');
}

function _bdMaskPhone(p) {
  if (!p) return '—';
  var digits = String(p).replace(/\D/g, '');
  if (digits.length < 6) return p;
  // +90 5xx *** ** 88
  var last2 = digits.slice(-2);
  var cc = digits.length > 10 ? '+' + digits.slice(0, digits.length - 10) + ' ' : '';
  return cc + digits.charAt(digits.length - 10) + 'xx xxx xx ' + last2;
}

function _bdRelative(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var mins = Math.floor((now - d) / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return mins + ' dk önce';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' sa önce';
  var days = Math.floor(hrs / 24);
  return days + ' gün önce';
}

/* ── Render: Body (tabs + list) ── */
function _bdRenderBody() {
  var active = _bdActiveOrders();
  var history = _bdHistoryOrders();
  var tabs = '<div class="bd-tabs">'
    + '<button class="bd-tab' + (_bd.tab === 'active' ? ' active' : '') + '" onclick="_bdSetTab(\'active\')">'
    +   '<iconify-icon icon="solar:delivery-bold" style="font-size:15px"></iconify-icon>'
    +   'Aktif <span class="bd-tab-count">' + active.length + '</span>'
    + '</button>'
    + '<button class="bd-tab' + (_bd.tab === 'history' ? ' active' : '') + '" onclick="_bdSetTab(\'history\')">'
    +   '<iconify-icon icon="solar:history-bold" style="font-size:15px"></iconify-icon>'
    +   'Geçmiş <span class="bd-tab-count">' + history.length + '</span>'
    + '</button>'
    + '</div>';

  var list = _bd.tab === 'active' ? _bdRenderActiveList(active) : _bdRenderHistoryList(history);
  return tabs + '<div id="bdList">' + list + '</div>';
}

function _bdSetTab(t) {
  _bd.tab = t;
  var overlay = document.getElementById('bizDeliveriesOverlay');
  if (!overlay) return;
  var content = overlay.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _bdRenderBody();
}

function _bdRenderActiveList(orders) {
  if (!orders.length) {
    return '<div class="bd-empty">'
      + '<iconify-icon icon="solar:delivery-linear" style="font-size:52px;color:var(--text-muted)"></iconify-icon>'
      + '<div class="bd-empty-title">Aktif teslimat yok</div>'
      + '<div class="bd-empty-sub">Şu an yola çıkmaya hazır paket bulunmuyor.</div>'
      + '</div>';
  }
  return orders.map(function(o){ return _bdRenderCard(o, true); }).join('');
}

function _bdRenderHistoryList(orders) {
  if (!orders.length) {
    return '<div class="bd-empty">'
      + '<iconify-icon icon="solar:history-linear" style="font-size:52px;color:var(--text-muted)"></iconify-icon>'
      + '<div class="bd-empty-title">Geçmiş boş</div>'
      + '<div class="bd-empty-sub">Tamamlanan teslimatlar burada listelenecek.</div>'
      + '</div>';
  }
  return orders.map(function(o){ return _bdRenderCard(o, false); }).join('');
}

/* ── Render: Card ── */
function _bdRenderCard(o, isActive) {
  var onTheWay = o.status === 'on_the_way';
  var cancelled = o.status === 'cancelled';
  var delivered = o.status === 'delivered';
  var cardClass = 'bd-card' + (onTheWay ? ' bd-card--on-way' : '') + (cancelled ? ' bd-card--cancelled' : '') + (delivered ? ' bd-card--delivered' : '');

  var statusBadge;
  if (onTheWay) statusBadge = '<span class="bd-badge bd-badge--on-way"><span class="bd-pulse"></span>Paket Yolda</span>';
  else if (delivered) statusBadge = '<span class="bd-badge bd-badge--delivered"><iconify-icon icon="solar:check-circle-bold" style="font-size:11px"></iconify-icon>Teslim Edildi</span>';
  else if (cancelled) statusBadge = '<span class="bd-badge bd-badge--cancelled">İptal</span>';
  else statusBadge = '<span class="bd-badge bd-badge--ready"><iconify-icon icon="solar:box-bold" style="font-size:11px"></iconify-icon>Hazır</span>';

  var itemsCount = (o.items || []).reduce(function(s, it){ return s + (it.qty || 0); }, 0);
  var time = _bdRelative(o.createdAt);

  var actions = '';
  if (isActive) {
    if (onTheWay) {
      actions = '<button class="bd-btn bd-btn--success" onclick="event.stopPropagation();_bdDeliver(\'' + o.id + '\')">'
        +   '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon>Teslim Edildi'
        + '</button>';
    } else {
      actions = '<button class="bd-btn bd-btn--primary" onclick="event.stopPropagation();_bdDispatch(\'' + o.id + '\')">'
        +   '<iconify-icon icon="solar:map-arrow-up-bold" style="font-size:18px"></iconify-icon>Yola Çık'
        + '</button>';
    }
  }

  return '<div class="' + cardClass + '" onclick="_bdOpenDetail(\'' + o.id + '\')">'
    + '<div class="bd-card-head">'
    +   '<div class="bd-card-id">' + o.id + '</div>'
    +   '<div class="bd-card-time">' + time + '</div>'
    +   statusBadge
    + '</div>'
    + '<div class="bd-card-main">'
    +   '<iconify-icon icon="solar:user-bold" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    +   '<span class="bd-card-name">' + _bdMaskName(o.customerName) + '</span>'
    + '</div>'
    + '<div class="bd-card-addr"><iconify-icon icon="solar:map-point-bold" style="font-size:14px;color:var(--text-muted)"></iconify-icon>' + (o.customerAddress || '—') + '</div>'
    + '<div class="bd-card-foot">'
    +   '<div class="bd-card-meta">' + itemsCount + ' ürün · ' + _bdFmt(o.total || 0) + '</div>'
    +   (actions ? '<div class="bd-card-actions">' + actions + '</div>' : '')
    + '</div>'
    + '</div>';
}

/* ── Actions ── */
function _bdDispatch(orderId) {
  var o = BIZ_ORDERS.find(function(x){ return x.id === orderId; });
  if (!o) return;
  o.status = 'on_the_way';
  o.dispatchedAt = new Date().toISOString();
  if (typeof _admToast === 'function') _admToast('Paket yola çıktı · ' + orderId + ' müşteriye bildirim gitti', 'ok');
  _bdRefresh();
}

function _bdDeliver(orderId) {
  var o = BIZ_ORDERS.find(function(x){ return x.id === orderId; });
  if (!o) return;
  o.status = 'delivered';
  o.completedAt = new Date().toISOString();
  if (typeof _admToast === 'function') _admToast('Sipariş teslim edildi · ' + orderId, 'ok');
  _bdRefresh();
  var d = document.getElementById('bdDetailOverlay');
  if (d) d.remove();
}

function _bdRefresh() {
  var overlay = document.getElementById('bizDeliveriesOverlay');
  if (!overlay) return;
  var content = overlay.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _bdRenderBody();
}

/* ── Detail overlay ── */
function _bdOpenDetail(orderId) {
  var o = BIZ_ORDERS.find(function(x){ return x.id === orderId; });
  if (!o) return;

  var onTheWay = o.status === 'on_the_way';
  var delivered = o.status === 'delivered';
  var cancelled = o.status === 'cancelled';

  var itemsHtml = (o.items || []).map(function(it){
    return '<div class="bd-det-item">'
      + '<div style="flex:1;font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">' + it.name + '</div>'
      + '<div style="min-width:28px;text-align:center;font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">×' + it.qty + '</div>'
      + '<div style="min-width:72px;text-align:right;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + _bdFmt(it.price * it.qty) + '</div>'
      + '</div>';
  }).join('');

  var noteHtml = o.customerNote
    ? '<div class="bd-det-note"><iconify-icon icon="solar:notes-bold" style="font-size:14px;color:#F59E0B;flex-shrink:0;margin-top:2px"></iconify-icon><span>' + o.customerNote + '</span></div>'
    : '';

  var actionRow = '';
  if (!delivered && !cancelled) {
    if (onTheWay) {
      actionRow = '<button class="bd-btn bd-btn--success bd-btn--wide" onclick="_bdDeliver(\'' + o.id + '\')">'
        + '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px"></iconify-icon>Teslim Edildi'
        + '</button>';
    } else {
      actionRow = '<button class="bd-btn bd-btn--primary bd-btn--wide" onclick="_bdDispatch(\'' + o.id + '\');_bdOpenDetail(\'' + o.id + '\')">'
        + '<iconify-icon icon="solar:map-arrow-up-bold" style="font-size:20px"></iconify-icon>Yola Çık'
        + '</button>';
    }
  }

  var statusChip;
  if (onTheWay) statusChip = '<span class="bd-badge bd-badge--on-way"><span class="bd-pulse"></span>Paket Yolda</span>';
  else if (delivered) statusChip = '<span class="bd-badge bd-badge--delivered"><iconify-icon icon="solar:check-circle-bold" style="font-size:11px"></iconify-icon>Teslim Edildi</span>';
  else if (cancelled) statusChip = '<span class="bd-badge bd-badge--cancelled">İptal</span>';
  else statusChip = '<span class="bd-badge bd-badge--ready"><iconify-icon icon="solar:box-bold" style="font-size:11px"></iconify-icon>Hazır</span>';

  var content = '<div class="bd-det-wrap">'
    + '<div class="bd-det-top">'
    +   '<div><div class="bd-det-id">' + o.id + '</div><div class="bd-det-when">' + _bdRelative(o.createdAt) + '</div></div>'
    +   statusChip
    + '</div>'
    + '<div class="bd-det-section-lbl">Müşteri</div>'
    + '<div class="bd-det-customer">'
    +   '<iconify-icon icon="solar:user-circle-bold" style="font-size:34px;color:var(--text-muted)"></iconify-icon>'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">' + _bdMaskName(o.customerName) + '</div>'
    +     '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">Gizlilik için soyad maskelenmiştir</div>'
    +   '</div>'
    + '</div>'
    + '<div class="bd-det-section-lbl">Teslimat Adresi</div>'
    + '<div class="bd-det-addr">'
    +   '<div class="bd-det-addr-main"><iconify-icon icon="solar:map-point-bold" style="font-size:18px;color:var(--primary);flex-shrink:0;margin-top:2px"></iconify-icon><span>' + (o.customerAddress || '—') + '</span></div>'
    +   '<div class="bd-det-addr-actions">'
    +     '<button class="bd-btn bd-btn--outline" onclick="_bdOpenMap(\'' + o.id + '\')"><iconify-icon icon="solar:map-bold" style="font-size:17px"></iconify-icon>Haritada Görüntüle</button>'
    +     '<button class="bd-btn bd-btn--outline" onclick="_bdCall(\'' + o.id + '\')"><iconify-icon icon="solar:phone-bold" style="font-size:17px"></iconify-icon>Uygulama Üzerinden Ara</button>'
    +   '</div>'
    +   '<div class="bd-det-phone"><iconify-icon icon="solar:shield-user-linear" style="font-size:13px"></iconify-icon>Numara: ' + _bdMaskPhone(o.customerPhone) + '</div>'
    + '</div>'
    + noteHtml
    + '<div class="bd-det-section-lbl">Sipariş İçeriği</div>'
    + '<div class="bd-det-items">' + itemsHtml + '</div>'
    + '<div class="bd-det-total"><span>TOPLAM</span><span>' + _bdFmt(o.total || 0) + '</span></div>'
    + (actionRow ? '<div class="bd-det-action-bar">' + actionRow + '</div>' : '')
    + '</div>';

  var ov = createBizOverlay('bdDetailOverlay', 'Teslimat Detayı', content);
  document.getElementById('bizPhone').appendChild(ov);
}

function _bdOpenMap(orderId) {
  var o = BIZ_ORDERS.find(function(x){ return x.id === orderId; });
  if (!o || !o.customerAddress) return;
  var url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(o.customerAddress);
  window.open(url, '_blank');
  if (typeof _admToast === 'function') _admToast('Harita açıldı', 'ok');
}

function _bdCall(orderId) {
  var o = BIZ_ORDERS.find(function(x){ return x.id === orderId; });
  if (!o || !o.customerPhone) return;
  // Uygulama üzerinden arama — demoda sistem araması başlatır
  var safe = String(o.customerPhone).replace(/\s/g, '');
  if (confirm('Bu müşteriyi aramak üzeresin: ' + _bdMaskPhone(o.customerPhone) + '\n\nGörüşme uygulama üzerinden yapılır, numaran paylaşılmaz.')) {
    window.location.href = 'tel:' + safe;
    if (typeof _admToast === 'function') _admToast('Görüşme başlatılıyor', 'ok');
  }
}

/* ── Styles ── */
function _bdInjectStyles() {
  if (document.getElementById('bdStyles')) return;
  var s = document.createElement('style');
  s.id = 'bdStyles';
  s.textContent = [
    '.bd-tabs{display:flex;gap:8px;padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid var(--border-subtle)}',
    '.bd-tab{flex:1;padding:10px 12px;border:none;background:transparent;color:var(--text-muted);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;border-bottom:2px solid transparent;transition:all .2s}',
    '.bd-tab.active{color:var(--primary);border-bottom-color:var(--primary)}',
    '.bd-tab-count{padding:1px 7px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-secondary);font:var(--fw-bold) 10px/1.4 var(--font)}',
    '.bd-tab.active .bd-tab-count{background:var(--primary);color:#fff}',
    '/* Card */',
    '.bd-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px;margin-bottom:12px;cursor:pointer;transition:transform .15s, box-shadow .15s}',
    '.bd-card:active{transform:scale(.99)}',
    '.bd-card:hover{box-shadow:var(--shadow-md)}',
    '.bd-card--on-way{border-color:#3B82F6;background:linear-gradient(135deg,rgba(59,130,246,0.05),var(--bg-phone))}',
    '.bd-card--delivered{opacity:.72}',
    '.bd-card--cancelled{opacity:.6}',
    '.bd-card-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
    '.bd-card-id{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)}',
    '.bd-card-time{font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-left:6px}',
    '.bd-badge{margin-left:auto;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:var(--r-full);font:var(--fw-bold) 10.5px/1.2 var(--font);letter-spacing:.3px}',
    '.bd-badge--ready{background:rgba(34,197,94,0.14);color:#16A34A}',
    '.bd-badge--on-way{background:rgba(59,130,246,0.14);color:#2563EB}',
    '.bd-badge--delivered{background:rgba(34,197,94,0.14);color:#16A34A}',
    '.bd-badge--cancelled{background:rgba(239,68,68,0.14);color:#DC2626}',
    '.bd-pulse{width:7px;height:7px;border-radius:50%;background:#3B82F6;box-shadow:0 0 0 0 rgba(59,130,246,0.55);animation:bdPulse 1.4s infinite}',
    '@keyframes bdPulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,0.55)}70%{box-shadow:0 0 0 8px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}',
    '.bd-card-main{display:flex;align-items:center;gap:6px;margin-bottom:6px}',
    '.bd-card-name{font:var(--fw-semibold) var(--fs-md)/1.3 var(--font);color:var(--text-primary)}',
    '.bd-card-addr{display:flex;align-items:flex-start;gap:6px;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary);margin-bottom:12px}',
    '.bd-card-foot{display:flex;align-items:center;gap:10px}',
    '.bd-card-meta{font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)}',
    '.bd-card-actions{margin-left:auto}',
    '/* Buttons — büyük, lojistik odaklı */',
    '.bd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:var(--r-lg);border:none;font:var(--fw-bold) var(--fs-sm)/1 var(--font);cursor:pointer;transition:transform .15s, box-shadow .15s;min-height:44px}',
    '.bd-btn:active{transform:scale(.97)}',
    '.bd-btn--primary{background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;box-shadow:0 3px 10px rgba(249,115,22,.3)}',
    '.bd-btn--success{background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;box-shadow:0 3px 10px rgba(34,197,94,.3)}',
    '.bd-btn--outline{flex:1;background:var(--bg-phone);color:var(--text-primary);border:1.5px solid var(--border-subtle)}',
    '.bd-btn--outline:hover{background:var(--bg-btn)}',
    '.bd-btn--wide{width:100%;padding:16px;font-size:var(--fs-md);min-height:54px}',
    '/* Empty */',
    '.bd-empty{padding:48px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.bd-empty-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);margin-top:6px}',
    '.bd-empty-sub{font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-muted);max-width:280px}',
    '/* Detail */',
    '.bd-det-wrap{display:flex;flex-direction:column;gap:8px;padding-bottom:80px}',
    '.bd-det-top{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);margin-bottom:6px}',
    '.bd-det-id{font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)}',
    '.bd-det-when{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px}',
    '.bd-det-section-lbl{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-top:12px;padding-left:4px}',
    '.bd-det-customer{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm)}',
    '.bd-det-addr{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px;display:flex;flex-direction:column;gap:12px}',
    '.bd-det-addr-main{display:flex;align-items:flex-start;gap:8px;font:var(--fw-medium) var(--fs-sm)/1.5 var(--font);color:var(--text-primary)}',
    '.bd-det-addr-actions{display:flex;gap:8px}',
    '.bd-det-phone{display:flex;align-items:center;gap:6px;font:var(--fw-medium) 11px/1.3 var(--font);color:var(--text-muted);padding:8px 10px;background:var(--bg-btn);border-radius:var(--r-md)}',
    '.bd-det-note{display:flex;gap:8px;padding:10px 12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.22);border-radius:var(--r-lg);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-primary)}',
    '.bd-det-items{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);overflow:hidden}',
    '.bd-det-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid var(--border-subtle)}',
    '.bd-det-item:last-child{border-bottom:none}',
    '.bd-det-total{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:linear-gradient(135deg,#1E3A8A,#312E81);color:#fff;border-radius:var(--r-lg);box-shadow:var(--shadow-md);font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:8px}',
    '.bd-det-total > span:first-child{font-size:11px;letter-spacing:.6px;opacity:.85}',
    '.bd-det-total > span:last-child{font-size:22px}',
    '.bd-det-action-bar{position:sticky;bottom:-16px;margin:20px -16px -16px;padding:14px 16px max(env(safe-area-inset-bottom),16px);background:var(--bg-phone);border-top:1px solid var(--border-subtle);box-shadow:0 -4px 12px var(--wrapper-shadow, rgba(0,0,0,0.08));z-index:2}'
  ].join('\n');
  document.head.appendChild(s);
}

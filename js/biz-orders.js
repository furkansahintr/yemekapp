/* ═══ BIZ ORDERS COMPONENT ═══ */
/* Role-based order filtering:
   - owner/manager/cashier: Tüm siparişler (full detail, all tabs)
   - chef: Sadece kendi mutfak kategorisindeki ürünleri içeren siparişler
   - waiter: Sadece masa siparişleri (dine-in/takeaway), kendi atanmış masaları
   - courier: Sadece kendi adına atanmış online siparişler
*/

let bizOrdersTab = 'all';

function openBizOrders() {
  if (!bizRoleGuard('orders')) return;
  bizOrdersTab = 'all';

  // Set default tab based on role
  if (bizCurrentRole === 'waiter') bizOrdersTab = 'dine-in';
  if (bizCurrentRole === 'courier') bizOrdersTab = 'online';

  const overlay = createBizOverlay('bizOrdersOverlay', getOrdersTitle(), renderBizOrdersContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function getOrdersTitle() {
  const titles = {
    owner: 'Sipariş Yönetimi',
    manager: 'Sipariş Yönetimi',
    chef: 'Mutfak Siparişleri',
    waiter: 'Masa Siparişlerim',
    cashier: 'Sipariş Yönetimi',
    courier: 'Teslimatlarım'
  };
  return titles[bizCurrentRole] || 'Siparişler';
}

/* ═══ ROLE-BASED ORDER FILTERING ═══ */
function getRoleFilteredOrders() {
  const allOrders = getBranchOrders();

  switch (bizCurrentRole) {
    case 'chef':
      return filterOrdersForChef(allOrders);
    case 'waiter':
      return filterOrdersForWaiter(allOrders);
    case 'courier':
      return filterOrdersForCourier(allOrders);
    default:
      // owner, manager, cashier see everything
      return allOrders;
  }
}

function filterOrdersForChef(orders) {
  // Chef sees only orders that contain items from their assigned kitchen categories
  const myCategories = getChefKitchenCategories();
  return orders.filter(o =>
    o.items.some(item => {
      const cat = getKitchenCategoryForItem(item.name);
      return cat && myCategories.includes(cat);
    })
  );
}

function getChefKitchenCategories() {
  // If employment has kitchenCategories, use those
  if (bizCurrentEmployment && bizCurrentEmployment.kitchenCategories) {
    return bizCurrentEmployment.kitchenCategories;
  }
  // Fallback: find staff record
  const staff = BIZ_STAFF.find(s =>
    s.branchId === bizActiveBranch && s.role === 'chef' && s.kitchenCategories
  );
  return staff ? staff.kitchenCategories : BIZ_KITCHEN_CATEGORIES.map(c => c.id);
}

function filterOrdersForWaiter(orders) {
  // Waiter sees only dine-in/takeaway orders assigned to them
  const myName = bizCurrentEmployment ? bizCurrentEmployment.staffName : null;
  return orders.filter(o => {
    if (o.type === 'online') return false; // never show online orders to waiter
    if (!myName) return true; // fallback: show all dine-in if no name match
    return o.waiterName === myName;
  });
}

function filterOrdersForCourier(orders) {
  // Courier sees only online orders assigned to them
  const myName = bizCurrentEmployment ? bizCurrentEmployment.staffName : null;
  return orders.filter(o => {
    if (o.type !== 'online') return false;
    if (!myName) return true; // fallback: show all online if no name match
    return o.courierName === myName;
  });
}

/* ═══ TAB FILTERING (within role-filtered set) ═══ */
function filterBizOrders(orders, tab) {
  if (tab === 'dine-in') return orders.filter(o => o.type === 'dine-in' || o.type === 'takeaway');
  if (tab === 'online') return orders.filter(o => o.type === 'online');
  return orders;
}

function getVisibleTabs() {
  switch (bizCurrentRole) {
    case 'waiter':
      // Waiter only sees dine-in, no tabs needed
      return null;
    case 'courier':
      // Courier only sees online, no tabs needed
      return null;
    case 'chef':
      // Chef sees all their items, but can filter by station via kitchen screen
      return null;
    default:
      // owner, manager, cashier see all tabs
      return true;
  }
}

function switchBizOrdersTab(tab) {
  bizOrdersTab = tab;
  const container = document.getElementById('bizOrdersListContainer');
  if (!container) return;
  const orders = getRoleFilteredOrders();
  const filtered = filterBizOrders(orders, tab);
  container.innerHTML = renderBizOrdersList(filtered);

  // Update tab styles
  document.querySelectorAll('.biz-orders-tab').forEach(el => {
    const isActive = el.dataset.tab === tab;
    el.style.background = isActive ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    el.style.border = isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)';
  });

  // Update summary
  updateBizOrdersSummary(filtered);
}

function updateBizOrdersSummary(filtered) {
  const summaryEl = document.getElementById('bizOrdersSummary');
  if (!summaryEl) return;
  const total = filtered.reduce((s, o) => s + o.total, 0);
  const active = filtered.filter(o => ['pending','preparing','ready'].includes(o.status)).length;
  summaryEl.innerHTML = `
    <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${filtered.length} sipariş</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span>
    <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:#22c55e">₺${total.toLocaleString('tr-TR')}</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${active} aktif</span>`;
}

/* ═══ RENDER ═══ */
function renderBizOrdersContent() {
  const orders = getRoleFilteredOrders();
  const showTabs = getVisibleTabs();
  const filtered = filterBizOrders(orders, bizOrdersTab);
  const total = filtered.reduce((s, o) => s + o.total, 0);
  const active = filtered.filter(o => ['pending','preparing','ready'].includes(o.status)).length;

  // Role info banner
  const roleBanner = renderRoleBanner();

  // Tabs (only for owner/manager/cashier)
  let tabsHTML = '';
  if (showTabs) {
    const allCount = orders.length;
    const dineInCount = orders.filter(o => o.type === 'dine-in' || o.type === 'takeaway').length;
    const onlineCount = orders.filter(o => o.type === 'online').length;
    const tabs = [
      { id: 'all', label: 'Tümü', count: allCount },
      { id: 'dine-in', label: 'Siparişler', count: dineInCount },
      { id: 'online', label: 'Online', count: onlineCount }
    ];
    tabsHTML = `<div style="display:flex;gap:8px;margin-bottom:12px">
      ${tabs.map(t => {
        const isActive = bizOrdersTab === t.id;
        return `<div class="biz-orders-tab" data-tab="${t.id}" onclick="switchBizOrdersTab('${t.id}')" style="padding:8px 16px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);white-space:nowrap;cursor:pointer;transition:all .2s;background:${isActive ? 'var(--primary)' : 'var(--bg-phone)'};color:${isActive ? '#fff' : 'var(--text-secondary)'};border:${isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)'}">${t.label} (${t.count})</div>`;
      }).join('')}
    </div>`;
  }

  return `
    ${roleBanner}
    ${tabsHTML}
    <div id="bizOrdersSummary" style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:10px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);box-shadow:var(--shadow-sm)">
      <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${filtered.length} sipariş</span><span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:#22c55e">₺${total.toLocaleString('tr-TR')}</span><span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span><span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${active} aktif</span>
    </div>
    <div id="bizOrdersListContainer" style="display:flex;flex-direction:column;gap:10px">
      ${renderBizOrdersList(filtered)}
    </div>
  `;
}

function renderRoleBanner() {
  const banners = {
    chef: { icon: 'solar:chef-hat-bold', color: '#F59E0B', text: 'Sadece mutfak kategorinize ait siparişler gösteriliyor' },
    waiter: { icon: 'solar:user-rounded-bold', color: '#22C55E', text: 'Sadece size atanan masa siparişleri gösteriliyor' },
    courier: { icon: 'solar:delivery-bold', color: '#EF4444', text: 'Sadece size atanan teslimatlar gösteriliyor' }
  };
  const b = banners[bizCurrentRole];
  if (!b) return '';

  const staffName = bizCurrentEmployment && bizCurrentEmployment.staffName ? bizCurrentEmployment.staffName : '';
  return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(${b.color === '#F59E0B' ? '245,158,11' : b.color === '#22C55E' ? '34,197,94' : '239,68,68'},0.08);border:1px solid rgba(${b.color === '#F59E0B' ? '245,158,11' : b.color === '#22C55E' ? '34,197,94' : '239,68,68'},0.2);border-radius:var(--r-lg);margin-bottom:12px">
    <iconify-icon icon="${b.icon}" style="font-size:18px;color:${b.color};flex-shrink:0"></iconify-icon>
    <div>
      <div style="font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:var(--text-primary)">${b.text}</div>
      ${staffName ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${staffName}</div>` : ''}
    </div>
  </div>`;
}

function renderBizOrdersList(orders) {
  const statusMap = {
    pending: { label: 'Bekliyor', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    preparing: { label: 'Hazırlanıyor', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    ready: { label: 'Hazır', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    delivered: { label: 'Teslim', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
    cancelled: { label: 'İptal', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' }
  };
  const typeMap = { 'dine-in': 'Masa', online: 'Online', takeaway: 'Paket' };
  const typeIcons = { 'dine-in': 'solar:chair-bold', online: 'solar:smartphone-2-bold', takeaway: 'solar:bag-4-bold' };

  if (orders.length === 0) {
    return `<div style="padding:32px 16px;text-align:center">
      <iconify-icon icon="solar:bag-check-bold" style="font-size:40px;color:var(--text-tertiary);margin-bottom:10px;display:block"></iconify-icon>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Bu kategoride sipariş bulunamadı</div>
    </div>`;
  }

  return orders.filter(o => o.status !== 'cancelled').sort((a, b) => {
    const order = ['pending', 'preparing', 'ready', 'delivered'];
    return order.indexOf(a.status) - order.indexOf(b.status);
  }).map(o => {
    const s = statusMap[o.status];

    // For chef role, highlight items from their stations
    const itemsHTML = renderOrderItems(o);

    return `<div onclick="openBizOrderDetail('${o.id.replace(/'/g,'\\\'')}')" style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);border-left:3px solid ${s.color};cursor:pointer">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${o.id}</span>
          <span style="display:flex;align-items:center;gap:4px;font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-secondary)"><iconify-icon icon="${typeIcons[o.type]}" style="font-size:12px"></iconify-icon>${typeMap[o.type]}</span>
        </div>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:${s.bg};color:${s.color}">${s.label}</span>
      </div>
      ${itemsHTML}
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;margin-bottom:${o.waiterName || o.courierName ? '8px' : '0'}">
        <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${o.type === 'dine-in' ? 'Masa ' + (o.tableId || '') : o.customerName || ''} · ${o.createdAt}</span>
        <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">₺${o.total}</span>
      </div>
      ${o.type === 'dine-in' && o.waiterName ? `<div style="display:flex;align-items:center;gap:6px;padding-top:8px;border-top:1px solid var(--border-subtle)"><iconify-icon icon="solar:user-rounded-bold" style="font-size:14px;color:#22C55E"></iconify-icon><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Garson:</span><span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">${o.waiterName}</span></div>` : ''}
      ${o.type === 'online' && o.courierName ? `<div style="display:flex;align-items:center;gap:6px;padding-top:8px;border-top:1px solid var(--border-subtle)"><iconify-icon icon="solar:delivery-bold" style="font-size:14px;color:#EF4444"></iconify-icon><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Kurye:</span><span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">${o.courierName}</span></div>` : ''}
    </div>`;
  }).join('');
}

function renderOrderItems(order) {
  if (bizCurrentRole === 'chef') {
    // Chef view: show items grouped by kitchen station, highlight own items
    const myCategories = getChefKitchenCategories();
    return `<div style="display:flex;flex-direction:column;gap:2px">
      ${order.items.map(item => {
        const cat = getKitchenCategoryForItem(item.name);
        const catDef = cat ? BIZ_KITCHEN_CATEGORIES.find(c => c.id === cat) : null;
        const isMine = cat && myCategories.includes(cat);
        return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;${isMine ? '' : 'opacity:0.4'}">
          <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);min-width:24px">${item.qty}x</span>
          <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary);flex:1">${item.name}</span>
          ${catDef ? `<span style="display:flex;align-items:center;gap:3px;font:var(--fw-medium) 10px/1 var(--font);color:${catDef.color};padding:2px 6px;border-radius:var(--r-full);background:rgba(0,0,0,0.04)"><iconify-icon icon="${catDef.icon}" style="font-size:10px"></iconify-icon>${catDef.name}</span>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }

  // Default view: simple item list
  return `<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary)">${order.items.map(i => i.qty + 'x ' + i.name).join(', ')}</div>`;
}

/* ═══ ORDER DETAIL ═══
 * Opens a detailed view for any order. Handles two layouts:
 *   - Online (online / takeaway): order #, masked customer name, item list,
 *     işletme notu, kurye, tarih/saat, durum, iptal + durum güncelle butonları.
 *   - Masa (dine-in): order #, masa adı, item list, tarih/saat, garson, durum,
 *     iptal + durum güncelle butonları.
 * Customer surname masking: "Ali Yılmaz" → "Ali Y***".
 * Status update / cancel only available to roles with order management.
 */
function _maskCustomerName(name) {
  if (!name) return '—';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}***`;
}

function _formatOrderDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso; }
}

function _bizCanManageOrders() {
  const r = bizCurrentRole;
  return r === 'owner' || r === 'manager' || r === 'cashier' || r === 'coordinator' || r === 'waiter';
}

function _getTableName(order) {
  if (typeof BIZ_TABLES !== 'undefined' && order.tableId) {
    const t = BIZ_TABLES.find(tt => tt.id === order.tableId);
    if (t) {
      const z = (typeof BIZ_TABLE_ZONES !== 'undefined') ? BIZ_TABLE_ZONES.find(zz => zz.id === t.zoneId) : null;
      const zoneLabel = z ? z.name + ' · ' : '';
      return `${zoneLabel}Masa ${t.number}`;
    }
  }
  if (order.tableNumber) return `Masa ${order.tableNumber}`;
  return '—';
}

const _BIZ_ORDER_STATUS = {
  pending:   { label: 'Bekliyor',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'solar:hourglass-line-bold' },
  preparing: { label: 'Hazırlanıyor', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: 'solar:chef-hat-bold' },
  ready:     { label: 'Hazır',        color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  icon: 'solar:check-circle-bold' },
  delivered: { label: 'Teslim Edildi',color: '#6B7280', bg: 'rgba(107,114,128,0.12)',icon: 'solar:bag-check-bold' },
  cancelled: { label: 'İptal',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: 'solar:close-circle-bold' }
};

function _nextOrderStatus(current) {
  const flow = ['pending','preparing','ready','delivered'];
  const i = flow.indexOf(current);
  if (i === -1 || i === flow.length - 1) return null;
  return flow[i + 1];
}

function openBizOrderDetail(orderId) {
  const order = (typeof BIZ_ORDERS !== 'undefined') ? BIZ_ORDERS.find(o => o.id === orderId) : null;
  if (!order) return;

  const existing = document.getElementById('bizOrderDetailModal');
  if (existing) existing.remove();

  const isOnline = (order.type === 'online' || order.type === 'takeaway');
  const s = _BIZ_ORDER_STATUS[order.status] || _BIZ_ORDER_STATUS.pending;
  const next = _nextOrderStatus(order.status);
  const canManage = _bizCanManageOrders();
  const isFinal = (order.status === 'delivered' || order.status === 'cancelled');

  const itemsHTML = (order.items || []).map(it => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
      <span style="min-width:32px;height:32px;border-radius:var(--r-md);background:var(--primary)15;display:inline-flex;align-items:center;justify-content:center;font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary)">${it.qty}x</span>
      <div style="flex:1;min-width:0">
        <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(it.name)}</div>
        ${typeof it.price === 'number' ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px">Birim: ₺${it.price.toFixed(2)}</div>` : ''}
      </div>
      ${typeof it.price === 'number' ? `<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">₺${(it.qty * it.price).toFixed(2)}</div>` : ''}
    </div>
  `).join('');

  const headerSubtitle = isOnline
    ? `<iconify-icon icon="solar:smartphone-2-bold" style="font-size:12px;vertical-align:-1px"></iconify-icon> Online Sipariş`
    : `<iconify-icon icon="solar:chair-bold" style="font-size:12px;vertical-align:-1px"></iconify-icon> Masa Siparişi`;

  // Online-specific block: masked customer + courier + note
  const onlineBlock = isOnline ? `
    <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <iconify-icon icon="solar:user-rounded-bold" style="font-size:16px;color:#3B82F6"></iconify-icon>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Sipariş Veren</span>
      </div>
      <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(_maskCustomerName(order.customerName))}</div>
      <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:4px">Gizlilik için soyadı maskelenmiştir</div>
    </div>

    <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <iconify-icon icon="solar:notebook-bookmark-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">İşletmeye Not</span>
      </div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:${order.customerNote ? 'var(--text-primary)' : 'var(--text-muted)'};font-style:${order.customerNote ? 'normal' : 'italic'}">
        ${order.customerNote ? escHtml(order.customerNote) : 'Müşteri not eklemedi.'}
      </div>
    </div>

    <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
      <div style="width:36px;height:36px;border-radius:50%;background:#EF444415;display:flex;align-items:center;justify-content:center">
        <iconify-icon icon="solar:delivery-bold" style="font-size:18px;color:#EF4444"></iconify-icon>
      </div>
      <div style="flex:1">
        <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:3px">Kurye</div>
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${order.courierName ? escHtml(order.courierName) : 'Henüz atanmadı'}</div>
      </div>
    </div>
  ` : '';

  // Masa-specific block: table name + waiter
  const masaBlock = !isOnline ? `
    <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
      <div style="width:36px;height:36px;border-radius:var(--r-lg);background:var(--primary)15;display:flex;align-items:center;justify-content:center">
        <iconify-icon icon="solar:chair-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
      </div>
      <div style="flex:1">
        <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:3px">Masa</div>
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${escHtml(_getTableName(order))}</div>
      </div>
    </div>

    <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
      <div style="width:36px;height:36px;border-radius:50%;background:#22C55E15;display:flex;align-items:center;justify-content:center">
        <iconify-icon icon="solar:user-rounded-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
      </div>
      <div style="flex:1">
        <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:3px">Garson</div>
        <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${order.waiterName ? escHtml(order.waiterName) : 'Henüz atanmadı'}</div>
      </div>
    </div>
  ` : '';

  // Action buttons
  let actionsHTML = '';
  if (canManage && !isFinal) {
    actionsHTML = `
      <div style="display:flex;gap:10px;margin-top:6px">
        <button onclick="bizCancelOrder('${order.id.replace(/'/g,"\\'")}')" style="flex:1;padding:13px;border-radius:var(--r-xl);border:1px solid #EF444440;background:#EF444412;color:#EF4444;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
          <iconify-icon icon="solar:close-circle-bold" style="font-size:16px"></iconify-icon> İptal Et
        </button>
        ${next ? `
          <button onclick="bizAdvanceOrderStatus('${order.id.replace(/'/g,"\\'")}')" style="flex:1;padding:13px;border-radius:var(--r-xl);border:none;background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="${_BIZ_ORDER_STATUS[next].icon}" style="font-size:16px"></iconify-icon> ${_BIZ_ORDER_STATUS[next].label}'a Geç
          </button>
        ` : ''}
      </div>
    `;
  } else if (isFinal) {
    actionsHTML = `<div style="margin-top:6px;padding:12px;text-align:center;background:var(--bg-phone);border:1px dashed var(--border-subtle);border-radius:var(--r-xl);font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Bu sipariş ${s.label.toLocaleLowerCase('tr-TR')} durumda — değişiklik yapılamaz.</div>`;
  }

  const modal = document.createElement('div');
  modal.id = 'bizOrderDetailModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="width:100%;max-width:440px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;padding:18px 18px max(env(safe-area-inset-bottom),18px);max-height:92vh;overflow:auto;box-shadow:0 -8px 30px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
        <div style="flex:1;min-width:0">
          <div style="font:var(--fw-bold) var(--fs-xl)/1.1 var(--font);color:var(--text-primary)">Sipariş ${escHtml(order.id)}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:4px;display:flex;align-items:center;gap:4px">${headerSubtitle}</div>
        </div>
        <div class="btn-icon" onclick="document.getElementById('bizOrderDetailModal').remove()" style="width:32px;height:32px;flex-shrink:0">
          <iconify-icon icon="solar:close-circle-linear" style="font-size:18px"></iconify-icon>
        </div>
      </div>

      <!-- Status pill -->
      <div style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--r-full);background:${s.bg};color:${s.color};margin-bottom:14px">
        <iconify-icon icon="${s.icon}" style="font-size:14px"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font)">${s.label}</span>
      </div>

      ${onlineBlock}
      ${masaBlock}

      <!-- Items -->
      <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:bag-4-bold" style="font-size:16px;color:var(--primary)"></iconify-icon>
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Ürünler (${(order.items||[]).length})</span>
          </div>
          <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">₺${Number(order.total||0).toFixed(2)}</span>
        </div>
        ${itemsHTML || '<div style="padding:14px 0;text-align:center;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Ürün yok</div>'}
      </div>

      <!-- Date / time -->
      <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:var(--r-lg);background:var(--bg-btn);display:flex;align-items:center;justify-content:center">
          <iconify-icon icon="solar:clock-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
        </div>
        <div style="flex:1">
          <div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:3px">Oluşturulma</div>
          <div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${escHtml(_formatOrderDateTime(order.createdAt))}</div>
        </div>
      </div>

      ${actionsHTML}
    </div>
  `;
  document.body.appendChild(modal);
}

function bizAdvanceOrderStatus(orderId) {
  const order = BIZ_ORDERS.find(o => o.id === orderId);
  if (!order) return;
  const next = _nextOrderStatus(order.status);
  if (!next) return;
  if (!_bizCanManageOrders()) return;
  order.status = next;
  if (next === 'preparing' && !order.prepStartedAt) order.prepStartedAt = new Date().toISOString();
  if (next === 'delivered' && !order.completedAt) order.completedAt = new Date().toISOString();
  // Refresh detail modal + list
  document.getElementById('bizOrderDetailModal')?.remove();
  openBizOrderDetail(orderId);
  const container = document.getElementById('bizOrdersListContainer');
  if (container) {
    const orders = getRoleFilteredOrders();
    const filtered = filterBizOrders(orders, bizOrdersTab);
    container.innerHTML = renderBizOrdersList(filtered);
    updateBizOrdersSummary(filtered);
  }
}

function bizCancelOrder(orderId) {
  const order = BIZ_ORDERS.find(o => o.id === orderId);
  if (!order) return;
  if (!_bizCanManageOrders()) return;
  if (!confirm(`${order.id} numaralı siparişi iptal etmek istediğinize emin misiniz?`)) return;
  order.status = 'cancelled';
  order.completedAt = new Date().toISOString();
  document.getElementById('bizOrderDetailModal')?.remove();
  const container = document.getElementById('bizOrdersListContainer');
  if (container) {
    const orders = getRoleFilteredOrders();
    const filtered = filterBizOrders(orders, bizOrdersTab);
    container.innerHTML = renderBizOrdersList(filtered);
    updateBizOrdersSummary(filtered);
  }
}

function openBizOnlineOrders() {
  if (!bizRoleGuard('orders')) return;
  bizOrdersTab = 'online';
  const overlay = createBizOverlay('bizOrdersOverlay', getOrdersTitle(), renderBizOrdersContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

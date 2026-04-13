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

    return `<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);border-left:3px solid ${s.color}">
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

function openBizOnlineOrders() {
  if (!bizRoleGuard('orders')) return;
  bizOrdersTab = 'online';
  const overlay = createBizOverlay('bizOrdersOverlay', getOrdersTitle(), renderBizOrdersContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

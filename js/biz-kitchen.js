/* ═══ BIZ KITCHEN COMPONENT ═══ */
/* Mutfak ekranı — siparişleri mutfak istasyonuna göre filtreler */
/* Mutfak Sorumlusu (chef) rolü kendi atanmış kategorilerini görür */
/* Owner/Manager tüm istasyonları görür */

let bizKitchenActiveStation = 'all';

function openBizKitchen() {
  if (!bizRoleGuard('kitchen')) return;
  bizKitchenActiveStation = 'all';
  const overlay = createBizOverlay('bizKitchenOverlay', 'Mutfak', renderBizKitchenContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function getStaffKitchenCategories() {
  // Owner/Manager see all stations
  if (bizCurrentRole === 'owner' || bizCurrentRole === 'manager') {
    return BIZ_KITCHEN_CATEGORIES.map(c => c.id);
  }
  // Chef sees only their assigned categories
  const me = BIZ_STAFF.find(s =>
    s.branchId === bizActiveBranch && s.role === 'chef' &&
    s.kitchenCategories && s.kitchenCategories.length > 0
  );
  // If we find the current chef's assignment, use it; else show all
  if (bizCurrentEmployment && bizCurrentEmployment.role === 'chef') {
    const staffRecord = BIZ_STAFF.find(s =>
      s.branchId === bizActiveBranch && s.role === 'chef' && s.kitchenCategories
    );
    return staffRecord ? staffRecord.kitchenCategories : BIZ_KITCHEN_CATEGORIES.map(c => c.id);
  }
  return BIZ_KITCHEN_CATEGORIES.map(c => c.id);
}

function getKitchenCategoryForItem(itemName) {
  const menuItem = BIZ_MENU_ITEMS.find(m => m.name === itemName);
  return menuItem ? menuItem.kitchenCategory : null;
}

function getKitchenOrders() {
  const orders = getBranchOrders();
  // Only active orders for kitchen
  return orders.filter(o => ['pending', 'preparing'].includes(o.status));
}

function switchBizKitchenStation(stationId) {
  bizKitchenActiveStation = stationId;
  const container = document.getElementById('bizKitchenOrdersList');
  if (container) container.innerHTML = renderBizKitchenOrders();

  // Update station tabs
  document.querySelectorAll('.biz-kitchen-tab').forEach(el => {
    const isActive = el.dataset.station === stationId;
    el.style.background = isActive ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    el.style.border = isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)';
  });

  // Update summary
  const summaryEl = document.getElementById('bizKitchenSummary');
  if (summaryEl) summaryEl.innerHTML = renderBizKitchenSummary();
}

function renderBizKitchenContent() {
  const myCategories = getStaffKitchenCategories();
  const visibleStations = BIZ_KITCHEN_CATEGORIES.filter(c => myCategories.includes(c.id));
  const isFullAccess = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';

  // Count orders per station
  const activeOrders = getKitchenOrders();
  function stationCount(stationId) {
    return activeOrders.filter(o =>
      o.items.some(item => getKitchenCategoryForItem(item.name) === stationId)
    ).length;
  }

  const allCount = activeOrders.length;

  return `
    <!-- Station Tabs -->
    <div style="display:flex;gap:8px;margin-bottom:12px;overflow-x:auto;scrollbar-width:none">
      ${isFullAccess || visibleStations.length > 1 ? `
      <div class="biz-kitchen-tab" data-station="all" onclick="switchBizKitchenStation('all')" style="padding:8px 16px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);white-space:nowrap;cursor:pointer;transition:all .2s;background:var(--primary);color:#fff;border:1px solid var(--primary);display:flex;align-items:center;gap:6px">
        <iconify-icon icon="solar:chef-hat-bold" style="font-size:14px"></iconify-icon>Tümü (${allCount})
      </div>` : ''}
      ${visibleStations.map(s => `
      <div class="biz-kitchen-tab" data-station="${s.id}" onclick="switchBizKitchenStation('${s.id}')" style="padding:8px 16px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);white-space:nowrap;cursor:pointer;transition:all .2s;background:var(--bg-phone);color:var(--text-secondary);border:1px solid var(--border-subtle);display:flex;align-items:center;gap:6px">
        <iconify-icon icon="${s.icon}" style="font-size:14px;color:${s.color}"></iconify-icon>${s.name} (${stationCount(s.id)})
      </div>`).join('')}
    </div>

    <!-- Summary Bar -->
    <div id="bizKitchenSummary" style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:10px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);box-shadow:var(--shadow-sm)">
      ${renderBizKitchenSummary()}
    </div>

    <!-- Station Staff Info -->
    ${bizKitchenActiveStation !== 'all' ? '' : `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
      ${visibleStations.map(s => {
        const stationStaff = BIZ_STAFF.filter(st =>
          st.branchId === bizActiveBranch && st.role === 'chef' &&
          st.kitchenCategories && st.kitchenCategories.includes(s.id)
        );
        return `
        <div style="background:var(--bg-phone);border-radius:var(--r-lg);padding:12px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm)">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <iconify-icon icon="${s.icon}" style="font-size:16px;color:${s.color}"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">${s.name}</span>
          </div>
          <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);margin-bottom:4px">${stationCount(s.id)}</div>
          <div style="font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)">${stationStaff.length > 0 ? stationStaff.map(st => st.name.split(' ')[0]).join(', ') : 'Atanmamış'}</div>
        </div>`;
      }).join('')}
    </div>`}

    <!-- Orders List -->
    <div id="bizKitchenOrdersList" style="display:flex;flex-direction:column;gap:10px">
      ${renderBizKitchenOrders()}
    </div>
  `;
}

function renderBizKitchenSummary() {
  const activeOrders = getKitchenOrders();
  const filtered = filterKitchenOrders(activeOrders);
  const pending = filtered.filter(o => o.status === 'pending').length;
  const preparing = filtered.filter(o => o.status === 'preparing').length;
  const totalItems = filtered.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);

  return `
    <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${filtered.length} sipariş</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span>
    <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#F59E0B">${pending} bekliyor</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span>
    <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#3B82F6">${preparing} hazırlanıyor</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">·</span>
    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${totalItems} ürün</span>
  `;
}

function filterKitchenOrders(orders) {
  if (bizKitchenActiveStation === 'all') return orders;
  return orders.filter(o =>
    o.items.some(item => getKitchenCategoryForItem(item.name) === bizKitchenActiveStation)
  );
}

function renderBizKitchenOrders() {
  const orders = getKitchenOrders();
  const filtered = filterKitchenOrders(orders);
  const statusMap = {
    pending:   { label: 'Bekliyor',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    preparing: { label: 'Hazırlanıyor', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' }
  };

  if (filtered.length === 0) {
    return `<div style="padding:32px 16px;text-align:center">
      <iconify-icon icon="solar:chef-hat-bold" style="font-size:40px;color:var(--text-tertiary);margin-bottom:10px"></iconify-icon>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Bu istasyonda bekleyen sipariş yok</div>
    </div>`;
  }

  return filtered.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  }).map(o => {
    const s = statusMap[o.status] || statusMap.pending;

    // Filter items to only show relevant ones for selected station
    const relevantItems = bizKitchenActiveStation === 'all'
      ? o.items
      : o.items.filter(item => getKitchenCategoryForItem(item.name) === bizKitchenActiveStation);

    // Group items by kitchen category for "all" view
    const itemsByStation = {};
    relevantItems.forEach(item => {
      const cat = getKitchenCategoryForItem(item.name) || 'other';
      if (!itemsByStation[cat]) itemsByStation[cat] = [];
      itemsByStation[cat].push(item);
    });

    return `<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);border-left:3px solid ${s.color}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${o.id}</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-secondary)">${o.type === 'dine-in' ? 'Masa ' + (o.tableId || '') : o.type === 'online' ? 'Online' : 'Paket'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${o.createdAt ? new Date(o.createdAt).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}) : ''}</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:${s.bg};color:${s.color}">${s.label}</span>
        </div>
      </div>

      <!-- Items grouped by station -->
      ${bizKitchenActiveStation === 'all' ? Object.entries(itemsByStation).map(([catId, items]) => {
        const catDef = BIZ_KITCHEN_CATEGORIES.find(c => c.id === catId);
        return `
        <div style="margin-bottom:8px">
          ${catDef ? `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><iconify-icon icon="${catDef.icon}" style="font-size:12px;color:${catDef.color}"></iconify-icon><span style="font:var(--fw-medium) 10px/1 var(--font);color:${catDef.color}">${catDef.name}</span></div>` : ''}
          ${items.map(item => `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
              <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);min-width:24px">${item.qty}x</span>
              <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${item.name}</span>
            </div>
          `).join('')}
        </div>`;
      }).join('') : relevantItems.map(item => `
        <div style="display:flex;align-items:center;gap:8px;padding:4px 0">
          <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--primary);min-width:24px">${item.qty}x</span>
          <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${item.name}</span>
        </div>
      `).join('')}

      <!-- Action buttons -->
      <div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-subtle)">
        ${o.status === 'pending' ? `
          <div onclick="bizKitchenStartOrder('${o.id}')" style="flex:1;padding:8px;border-radius:var(--r-lg);background:var(--primary);text-align:center;cursor:pointer">
            <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#fff">Hazırlamaya Başla</span>
          </div>` : `
          <div onclick="bizKitchenReadyOrder('${o.id}')" style="flex:1;padding:8px;border-radius:var(--r-lg);background:#22C55E;text-align:center;cursor:pointer">
            <span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#fff">Hazır</span>
          </div>`}
      </div>
    </div>`;
  }).join('');
}

function bizKitchenStartOrder(orderId) {
  const order = BIZ_ORDERS.find(o => o.id === orderId);
  if (order) {
    order.status = 'preparing';
    order.prepStartedAt = new Date().toISOString();
    bizRefreshKitchen();
  }
}

function bizKitchenReadyOrder(orderId) {
  const order = BIZ_ORDERS.find(o => o.id === orderId);
  if (order) {
    order.status = 'ready';
    order.completedAt = new Date().toISOString();
    bizRefreshKitchen();
  }
}

function bizRefreshKitchen() {
  const container = document.getElementById('bizKitchenOrdersList');
  if (container) container.innerHTML = renderBizKitchenOrders();
  const summary = document.getElementById('bizKitchenSummary');
  if (summary) summary.innerHTML = renderBizKitchenSummary();
  // Update tab counts
  const activeOrders = getKitchenOrders();
  document.querySelectorAll('.biz-kitchen-tab').forEach(el => {
    const stationId = el.dataset.station;
    let count;
    if (stationId === 'all') {
      count = activeOrders.length;
    } else {
      count = activeOrders.filter(o =>
        o.items.some(item => getKitchenCategoryForItem(item.name) === stationId)
      ).length;
    }
    const label = el.textContent.replace(/\(\d+\)/, `(${count})`);
    // Keep icon, update text
    const icon = el.querySelector('iconify-icon');
    if (icon) {
      el.innerHTML = icon.outerHTML + label;
    }
  });
}

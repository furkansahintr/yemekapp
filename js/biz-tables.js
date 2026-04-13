/* ═══ BIZ TABLES COMPONENT ═══ */

function openBizTables() {
  if (!bizRoleGuard('tables')) return;
  const overlay = createBizOverlay('bizTablesOverlay', 'Masa Yönetimi', renderBizTablesContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function renderBizTablesContent() {
  const tables = getBranchTables();
  const zones = BIZ_TABLE_ZONES.filter(z => z.branchId === bizActiveBranch).sort((a, b) => a.order - b.order);
  const isOwnerOrManager = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';

  const statusColors = {
    empty:      { bg: 'rgba(34,197,94,0.1)',  border: '#22C55E', icon: 'solar:check-circle-linear',                label: 'Boş' },
    occupied:   { bg: 'rgba(59,130,246,0.1)',  border: '#3B82F6', icon: 'solar:users-group-two-rounded-linear',     label: 'Dolu' },
    reserved:   { bg: 'rgba(107,114,128,0.1)', border: '#6B7280', icon: 'solar:clock-circle-linear',                label: 'Rezerve' },
    waiterCall: { bg: 'rgba(239,68,68,0.15)',  border: '#EF4444', icon: 'solar:bell-bing-bold',                     label: 'Çağrı' }
  };

  const totalOccupied = tables.filter(t => t.status === 'occupied' || t.status === 'waiterCall').length;

  // Legend
  const legend = Object.entries(statusColors).map(([, val]) => `
    <div style="display:flex;align-items:center;gap:4px">
      <div style="width:8px;height:8px;border-radius:50%;background:${val.border}"></div>
      <span style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">${val.label}</span>
    </div>
  `).join('');

  // Summary bar
  const summaryHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="display:flex;gap:10px">${legend}</div>
      <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${totalOccupied}/${tables.length} dolu</span>
    </div>
  `;

  // Render each zone
  const zonesHtml = zones.map(zone => {
    const zoneTables = tables.filter(t => t.zoneId === zone.id);
    const zoneOccupied = zoneTables.filter(t => t.status === 'occupied' || t.status === 'waiterCall').length;

    return `
      <div style="margin-bottom:20px">
        <!-- Zone Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:30px;height:30px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
              <iconify-icon icon="${zone.icon}" style="font-size:18px;color:${zone.color}"></iconify-icon>
            </div>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(zone.name)}</span>
            <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${zoneOccupied}/${zoneTables.length}</span>
          </div>
          ${isOwnerOrManager ? `
          <div style="display:flex;align-items:center;gap:6px">
            <div onclick="bizAddTableToZone('${zone.id}')" style="width:28px;height:28px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;cursor:pointer" title="Masa Ekle">
              <iconify-icon icon="solar:add-circle-linear" style="font-size:14px;color:var(--primary)"></iconify-icon>
            </div>
            <div onclick="bizEditZone('${zone.id}')" style="width:28px;height:28px;border-radius:var(--r-md);background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer" title="Bölge Düzenle">
              <iconify-icon icon="solar:pen-2-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>
            </div>
          </div>` : ''}
        </div>
        <!-- Zone Tables Grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${zoneTables.map(t => {
            const s = statusColors[t.status];
            return `<div style="background:var(--bg-phone);border:2px solid ${s.border};border-radius:var(--r-xl);padding:12px 8px;text-align:center;cursor:pointer;position:relative;box-shadow:var(--shadow-sm)" onclick="openBizTableDetail(${t.number})">
              ${t.status === 'waiterCall' ? '<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#EF4444;animation:micPulse 2s infinite"></div>' : ''}
              <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">M${t.number}</div>
              <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">${t.capacity} kişilik</div>
              ${t.status === 'occupied' || t.status === 'waiterCall' ? `<div style="font:var(--fw-medium) 10px/1 var(--font);color:${s.border};margin-top:4px">${t.guestCount || '-'} misafir</div>` : ''}
              <iconify-icon icon="${s.icon}" style="font-size:14px;color:${s.border};margin-top:3px"></iconify-icon>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Unzoned tables (tables without a zoneId)
  const unzonedTables = tables.filter(t => !t.zoneId);
  const unzonedHtml = unzonedTables.length > 0 ? `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="width:30px;height:30px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
          <iconify-icon icon="solar:sofa-2-bold" style="font-size:18px;color:#6B7280"></iconify-icon>
        </div>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Diğer</span>
        <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${unzonedTables.length} masa</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${unzonedTables.map(t => {
          const s = statusColors[t.status];
          return `<div style="background:var(--bg-phone);border:2px solid ${s.border};border-radius:var(--r-xl);padding:12px 8px;text-align:center;cursor:pointer;box-shadow:var(--shadow-sm)" onclick="openBizTableDetail(${t.number})">
            <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">M${t.number}</div>
            <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">${t.capacity} kişilik</div>
            <iconify-icon icon="${s.icon}" style="font-size:14px;color:${s.border};margin-top:3px"></iconify-icon>
          </div>`;
        }).join('')}
      </div>
    </div>
  ` : '';

  // Add Zone button
  const addZoneHtml = isOwnerOrManager ? `
    <div onclick="bizAddZone()" style="background:var(--bg-phone);border:2px dashed var(--border-subtle);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;margin-top:4px">
      <iconify-icon icon="solar:add-circle-linear" style="font-size:20px;color:var(--primary)"></iconify-icon>
      <span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--primary)">Yeni Bölge Ekle</span>
    </div>
  ` : '';

  return summaryHtml + zonesHtml + unzonedHtml + addZoneHtml;
}

function bizAddZone() {
  const existing = document.getElementById('bizZoneModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bizZoneModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const icons = [
    { icon: 'solar:home-angle-bold', label: 'İç Salon' },
    { icon: 'solar:sun-2-bold', label: 'Teras' },
    { icon: 'solar:leaf-bold', label: 'Bahçe' },
    { icon: 'solar:crown-bold', label: 'VIP' },
    { icon: 'solar:cup-hot-bold', label: 'Bar' },
    { icon: 'solar:sofa-2-bold', label: 'Lounge' }
  ];

  const colors = ['#3B82F6','#F59E0B','#22C55E','#8B5CF6','#EC4899','#EF4444','#06B6D4','#F97316'];

  modal.innerHTML = `
    <div style="background:var(--bg-surface);border-radius:var(--r-xl);padding:24px;width:100%;max-width:320px;box-shadow:var(--shadow-lg)">
      <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);margin-bottom:16px">Yeni Bölge Ekle</div>

      <div style="margin-bottom:14px">
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Bölge Adı</label>
        <input id="bizZoneNameInput" type="text" placeholder="Ör: Teras 2, Üst Kat..." style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <div style="margin-bottom:14px">
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">İkon</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="bizZoneIconPicker">
          ${icons.map((ic, i) => `
            <div onclick="document.querySelectorAll('#bizZoneIconPicker .zicon').forEach(e=>e.style.outline='none');this.style.outline='2px solid var(--primary)';this.dataset.selected='${ic.icon}'" class="zicon" style="width:40px;height:40px;border-radius:var(--r-md);background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer;${i === 0 ? 'outline:2px solid var(--primary)' : ''}" data-selected="${i === 0 ? ic.icon : ''}">
              <iconify-icon icon="${ic.icon}" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:20px">
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Renk</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="bizZoneColorPicker">
          ${colors.map((c, i) => `
            <div onclick="document.querySelectorAll('#bizZoneColorPicker .zcol').forEach(e=>e.style.outline='none');this.style.outline='2px solid var(--text-primary)';this.dataset.selected='${c}'" class="zcol" style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;${i === 0 ? 'outline:2px solid var(--text-primary)' : ''}" data-selected="${i === 0 ? c : ''}"></div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('bizZoneModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-secondary);background:var(--bg-phone);cursor:pointer">İptal</button>
        <button onclick="bizSaveNewZone()" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:var(--primary);cursor:pointer">Ekle</button>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
  setTimeout(() => document.getElementById('bizZoneNameInput')?.focus(), 100);
}

function bizSaveNewZone() {
  const name = document.getElementById('bizZoneNameInput')?.value.trim();
  if (!name) { alert('Lütfen bir bölge adı girin'); return; }

  const selectedIcon = document.querySelector('#bizZoneIconPicker .zicon[data-selected]:not([data-selected=""])');
  const selectedColor = document.querySelector('#bizZoneColorPicker .zcol[data-selected]:not([data-selected=""])');

  const icon = selectedIcon ? selectedIcon.dataset.selected : 'solar:home-angle-bold';
  const color = selectedColor ? selectedColor.dataset.selected : '#3B82F6';

  const maxOrder = BIZ_TABLE_ZONES.filter(z => z.branchId === bizActiveBranch).reduce((max, z) => Math.max(max, z.order), 0);

  BIZ_TABLE_ZONES.push({
    id: 'zone_' + Date.now(),
    branchId: bizActiveBranch,
    name: name,
    icon: icon,
    color: color,
    order: maxOrder + 1
  });

  document.getElementById('bizZoneModal')?.remove();
  // Re-render tables overlay
  bizRefreshTablesOverlay();
}

function bizEditZone(zoneId) {
  const zone = BIZ_TABLE_ZONES.find(z => z.id === zoneId);
  if (!zone) return;

  const existing = document.getElementById('bizZoneModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bizZoneModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--bg-surface);border-radius:var(--r-xl);padding:24px;width:100%;max-width:320px;box-shadow:var(--shadow-lg)">
      <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);margin-bottom:16px">Bölge Düzenle</div>
      <div style="margin-bottom:14px">
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Bölge Adı</label>
        <input id="bizZoneEditInput" type="text" value="${escHtml(zone.name)}" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="bizDeleteZone('${zoneId}')" style="padding:12px;border:1px solid #EF4444;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#EF4444;background:transparent;cursor:pointer">
          <iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:16px"></iconify-icon>
        </button>
        <button onclick="document.getElementById('bizZoneModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-secondary);background:var(--bg-phone);cursor:pointer">İptal</button>
        <button onclick="bizSaveEditZone('${zoneId}')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:var(--primary);cursor:pointer">Kaydet</button>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
  setTimeout(() => document.getElementById('bizZoneEditInput')?.focus(), 100);
}

function bizSaveEditZone(zoneId) {
  const name = document.getElementById('bizZoneEditInput')?.value.trim();
  if (!name) { alert('Lütfen bir bölge adı girin'); return; }
  const zone = BIZ_TABLE_ZONES.find(z => z.id === zoneId);
  if (zone) zone.name = name;
  document.getElementById('bizZoneModal')?.remove();
  bizRefreshTablesOverlay();
}

function bizDeleteZone(zoneId) {
  if (!confirm('Bu bölgeyi silmek istediğinize emin misiniz? İçindeki masalar "Diğer" grubuna taşınacak.')) return;
  // Move tables to unzoned
  BIZ_TABLES.filter(t => t.zoneId === zoneId).forEach(t => t.zoneId = null);
  // Remove zone
  const idx = BIZ_TABLE_ZONES.findIndex(z => z.id === zoneId);
  if (idx >= 0) BIZ_TABLE_ZONES.splice(idx, 1);
  document.getElementById('bizZoneModal')?.remove();
  bizRefreshTablesOverlay();
}

function bizAddTableToZone(zoneId) {
  const existing = document.getElementById('bizTableAddModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bizTableAddModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const zone = BIZ_TABLE_ZONES.find(z => z.id === zoneId);
  const zoneName = zone ? zone.name : '';

  // Next table number
  const branchTables = BIZ_TABLES.filter(t => t.branchId === bizActiveBranch);
  const nextNum = branchTables.length > 0 ? Math.max(...branchTables.map(t => t.number)) + 1 : 1;

  modal.innerHTML = `
    <div style="background:var(--bg-surface);border-radius:var(--r-xl);padding:24px;width:100%;max-width:320px;box-shadow:var(--shadow-lg)">
      <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);margin-bottom:4px">Yeni Masa Ekle</div>
      <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:16px">${escHtml(zoneName)} bölgesine</div>

      <div style="margin-bottom:14px">
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Masa Numarası</label>
        <input id="bizNewTableNum" type="number" value="${nextNum}" min="1" style="width:100%;padding:12px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box" />
      </div>

      <div style="margin-bottom:20px">
        <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);display:block;margin-bottom:6px">Kapasite (kişi)</label>
        <div style="display:flex;gap:8px" id="bizTableCapPicker">
          ${[2,4,6,8].map((c, i) => `
            <div onclick="document.querySelectorAll('#bizTableCapPicker .tcap').forEach(e=>{e.style.background='var(--bg-btn)';e.style.color='var(--text-secondary)'});this.style.background='var(--primary)';this.style.color='#fff';this.dataset.selected='${c}'" class="tcap" style="flex:1;padding:10px;border-radius:var(--r-lg);text-align:center;cursor:pointer;font:var(--fw-semibold) var(--fs-md)/1 var(--font);${i === 0 ? 'background:var(--primary);color:#fff' : 'background:var(--bg-btn);color:var(--text-secondary)'}" data-selected="${i === 0 ? c : ''}">${c}</div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('bizTableAddModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-secondary);background:var(--bg-phone);cursor:pointer">İptal</button>
        <button onclick="bizSaveNewTable('${zoneId}')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:var(--primary);cursor:pointer">Ekle</button>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

function bizSaveNewTable(zoneId) {
  const numInput = document.getElementById('bizNewTableNum');
  const num = parseInt(numInput?.value);
  if (!num || num < 1) { alert('Geçerli bir masa numarası girin'); return; }

  // Check duplicate number
  if (BIZ_TABLES.find(t => t.branchId === bizActiveBranch && t.number === num)) {
    alert('Bu masa numarası zaten mevcut');
    return;
  }

  const selectedCap = document.querySelector('#bizTableCapPicker .tcap[data-selected]:not([data-selected=""])');
  const capacity = selectedCap ? parseInt(selectedCap.dataset.selected) : 2;

  BIZ_TABLES.push({
    id: 't_' + Date.now(),
    branchId: bizActiveBranch,
    zoneId: zoneId,
    number: num,
    capacity: capacity,
    status: 'empty',
    currentOrder: null,
    assignedWaiter: null,
    occupiedSince: null,
    guestCount: 0
  });

  document.getElementById('bizTableAddModal')?.remove();
  bizRefreshTablesOverlay();
}

function bizRefreshTablesOverlay() {
  const overlay = document.getElementById('bizTablesOverlay');
  if (!overlay) return;
  const contentDiv = overlay.querySelector('div:last-child');
  if (contentDiv) contentDiv.innerHTML = renderBizTablesContent();
}

function _calcElapsed(isoStr) {
  if (!isoStr) return null;
  const diff = Date.now() - new Date(isoStr).getTime();
  if (diff < 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' dk';
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return hrs + ' saat' + (rem > 0 ? ' ' + rem + ' dk' : '');
}

function _renderTableOrders(tableId) {
  const orders = BIZ_ORDERS.filter(o => o.tableId === tableId);
  if (!orders.length) return '';

  const statusMap = {
    pending: { label: 'Bekliyor', color: '#F59E0B' },
    preparing: { label: 'Hazırlanıyor', color: '#3B82F6' },
    ready: { label: 'Hazır', color: '#22C55E' },
    completed: { label: 'Tamamlandı', color: '#6B7280' },
    delivered: { label: 'Teslim Edildi', color: '#6B7280' },
    cancelled: { label: 'İptal', color: '#EF4444' }
  };

  let html = '';
  orders.forEach(order => {
    const st = statusMap[order.status] || { label: order.status, color: 'var(--text-muted)' };
    const itemsHtml = order.items.map(it =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-subtle)">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);background:var(--glass-card-strong);width:22px;height:22px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0">${it.qty}</span>
          <span style="font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(it.name)}</span>
        </div>
        <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-secondary);flex-shrink:0;margin-left:8px">${(it.qty * it.price).toFixed(2)} ₺</span>
      </div>`
    ).join('');

    html += `
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:bag-check-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${order.id}</span>
          </div>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:${st.color};background:${st.color}15;padding:4px 10px;border-radius:var(--r-full)">${st.label}</span>
        </div>
        <div style="padding:4px 16px">${itemsHtml}</div>
        <div style="padding:10px 16px;display:flex;justify-content:space-between;align-items:center">
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${new Date(order.createdAt).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</span>
          <span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${order.total.toFixed(2)} ₺</span>
        </div>
      </div>`;
  });
  return html;
}

function openBizTableDetail(tableNum) {
  const table = BIZ_TABLES.find(t => t.branchId === bizActiveBranch && t.number === tableNum);
  if (!table) { alert('Masa bulunamadı'); return; }

  const statusColors = {
    empty: { color: '#22C55E', label: 'Boş', bg: 'rgba(34,197,94,0.1)' },
    occupied: { color: '#3B82F6', label: 'Dolu', bg: 'rgba(59,130,246,0.1)' },
    reserved: { color: '#6B7280', label: 'Rezerve', bg: 'rgba(107,114,128,0.1)' },
    waiterCall: { color: '#EF4444', label: 'Çağrı Var', bg: 'rgba(239,68,68,0.1)' }
  };
  const s = statusColors[table.status];
  const zone = BIZ_TABLE_ZONES.find(z => z.id === table.zoneId);
  const elapsed = _calcElapsed(table.occupiedSince);
  const isActive = table.status === 'occupied' || table.status === 'waiterCall';
  const tableOrdersHtml = isActive ? _renderTableOrders(table.id) : '';

  const overlay = createBizOverlay('bizTableDetailOverlay', 'Masa ' + tableNum, `
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Table Status Card -->
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg);text-align:center">
        <div style="width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
          <span style="font:var(--fw-bold) 24px/1 var(--font);color:${s.color}">M${table.number}</span>
        </div>
        <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--text-primary);margin-bottom:4px">${table.capacity} Kişilik</div>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:${s.color};background:${s.bg};padding:4px 12px;border-radius:var(--r-full);display:inline-block">${s.label}</span>
        ${zone ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:8px"><iconify-icon icon="${zone.icon}" style="font-size:12px;color:${zone.color}"></iconify-icon> ${escHtml(zone.name)}</div>` : ''}
        ${isActive && elapsed ? `
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px">
          <iconify-icon icon="solar:clock-circle-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">${elapsed}</span>
        </div>` : ''}
      </div>

      ${isActive ? `
      <!-- Current Session -->
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle)">
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-bottom:8px">Aktif Oturum</div>
          <div style="display:flex;justify-content:space-between;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">
            <span>Misafir: ${table.guestCount} kişi</span>
            <span>Sipariş: ${table.currentOrder || '-'}</span>
          </div>
        </div>
        ${table.assignedWaiter ? `
        <div style="padding:14px 16px;display:flex;align-items:center;gap:10px">
          <iconify-icon icon="solar:user-circle-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(table.assignedWaiter)}</span>
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);margin-left:auto">Garson</span>
        </div>` : ''}
      </div>
      ` : ''}

      ${isActive && tableOrdersHtml ? `
      <!-- Table Orders -->
      <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Siparişler</div>
      ${tableOrdersHtml}
      ` : ''}

      ${table.status === 'reserved' && table.reservationName ? `
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);padding:14px 16px">
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-bottom:6px">Rezervasyon</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">${escHtml(table.reservationName)} — ${new Date(table.reservationTime).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      ` : ''}

      <!-- Actions -->
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${table.status === 'empty' ? `
          <button onclick="alert('Masa açma — yakında!')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:#22C55E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:login-3-linear" style="font-size:16px"></iconify-icon> Masa Aç
          </button>
        ` : ''}
        ${table.status === 'occupied' ? `
          <button onclick="alert('Hesap işlemi — yakında!')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:#3B82F6;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:bill-list-linear" style="font-size:16px"></iconify-icon> Hesap
          </button>
          <button onclick="alert('Masa kapatma — yakında!')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:#EF4444;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:logout-3-linear" style="font-size:16px"></iconify-icon> Kapat
          </button>
        ` : ''}
      </div>
    </div>
  `);

  document.getElementById('bizPhone').appendChild(overlay);
}


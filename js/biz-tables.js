/* ═══ BIZ TABLES COMPONENT ═══ */

function openBizTables() {
  if (!bizRoleGuard('tables')) return;
  const overlay = createBizOverlay('bizTablesOverlay', 'Masa Yönetimi', renderBizTablesContent());
  document.getElementById('bizPhone').appendChild(overlay);
  _bizStartResCountdownTick();
}

function renderBizTablesContent() {
  const tables = getBranchTables();
  let zones = BIZ_TABLE_ZONES.filter(z => z.branchId === bizActiveBranch).sort((a, b) => a.order - b.order);
  const isOwnerOrManager = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';
  const canAssignWaiters = isOwnerOrManager || bizCurrentRole === 'coordinator';
  // Waiters only see zones they are assigned to
  if (bizCurrentRole === 'waiter') {
    const zoneIds = getWaiterAssignedZoneIds();
    zones = zones.filter(z => zoneIds.includes(z.id));
  }

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

    // Assigned waiters chips
    const assignedIds = Array.isArray(zone.assignedWaiters) ? zone.assignedWaiters : [];
    const assignedStaff = assignedIds
      .map(id => BIZ_STAFF.find(s => s.id === id))
      .filter(Boolean);
    const waiterChipsHtml = assignedStaff.length > 0
      ? assignedStaff.map(st => `
          <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--r-full);background:${zone.color}15;color:${zone.color};font:var(--fw-medium) 10px/1 var(--font)">
            <iconify-icon icon="solar:user-rounded-bold" style="font-size:10px"></iconify-icon>${escHtml(st.name)}
          </span>`).join('')
      : `<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);font-style:italic">Garson atanmamış</span>`;

    return `
      <div style="margin-bottom:20px">
        <!-- Zone Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:30px;height:30px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
              <iconify-icon icon="${zone.icon}" style="font-size:18px;color:${zone.color}"></iconify-icon>
            </div>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(zone.name)}</span>
            <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${zoneOccupied}/${zoneTables.length}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${canAssignWaiters ? `
            <div onclick="bizAssignZoneWaiter('${zone.id}')" style="width:28px;height:28px;border-radius:var(--r-md);background:${zone.color}22;display:flex;align-items:center;justify-content:center;cursor:pointer" title="Garson Ata">
              <iconify-icon icon="solar:user-plus-linear" style="font-size:14px;color:${zone.color}"></iconify-icon>
            </div>` : ''}
            ${isOwnerOrManager ? `
            <div onclick="bizAddTableToZone('${zone.id}')" style="width:28px;height:28px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;cursor:pointer" title="Masa Ekle">
              <iconify-icon icon="solar:add-circle-linear" style="font-size:14px;color:var(--primary)"></iconify-icon>
            </div>
            <div onclick="bizEditZone('${zone.id}')" style="width:28px;height:28px;border-radius:var(--r-md);background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer" title="Bölge Düzenle">
              <iconify-icon icon="solar:pen-2-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>
            </div>` : ''}
          </div>
        </div>
        <!-- Assigned Waiters Row -->
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;padding-left:38px">${waiterChipsHtml}</div>
        <!-- Zone Tables Grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${zoneTables.map(t => _bizRenderTableCell(t, statusColors)).join('')}
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
        ${unzonedTables.map(t => _bizRenderTableCell(t, statusColors)).join('')}
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

function _bizUpcomingReservationForTable(t) {
  if (typeof _bizTableReservations !== 'function') return null;
  const list = _bizTableReservations(t.id) || [];
  // Prefer a reservation starting within the next 12h (or already within grace window)
  const now = Date.now();
  const within = list.find(r => {
    const ts = new Date(r.reservedAt).getTime();
    return ts - now <= 12 * 60 * 60 * 1000; // 12h horizon
  });
  return within || null;
}

function _bizFormatCountdown(target) {
  const diffMs = new Date(target).getTime() - Date.now();
  if (diffMs <= 0) return 'Şimdi';
  const total = Math.floor(diffMs / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return d + 'g ' + (h % 24) + 's';
  }
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function _bizRenderTableCell(t, statusColors) {
  const s = statusColors[t.status];
  const res = _bizUpcomingReservationForTable(t);
  const resTime = res ? new Date(res.reservedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
  const countdown = res ? _bizFormatCountdown(res.reservedAt) : '';
  const resIso = res ? res.reservedAt : '';

  return `<div style="background:var(--bg-phone);border:2px solid ${s.border};border-radius:var(--r-xl);padding:12px 8px;text-align:center;cursor:pointer;position:relative;box-shadow:var(--shadow-sm)" onclick="openBizTableDetail(${t.number})">
    ${t.status === 'waiterCall' ? '<div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#EF4444;animation:micPulse 2s infinite"></div>' : ''}
    <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">M${t.number}</div>
    <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px">${t.capacity} kişilik</div>
    ${(t.status === 'occupied' || t.status === 'waiterCall') ? `<div style="font:var(--fw-medium) 10px/1 var(--font);color:${s.border};margin-top:4px">${t.guestCount || '-'} misafir</div>` : ''}
    <iconify-icon icon="${s.icon}" style="font-size:14px;color:${s.border};margin-top:3px"></iconify-icon>
    ${res ? `
      <div style="margin-top:6px;padding-top:5px;border-top:1px dashed var(--border-subtle);display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="font:var(--fw-semibold) 10px/1 var(--font);color:#14B8A6;display:inline-flex;align-items:center;gap:3px">
          <iconify-icon icon="solar:calendar-mark-bold" style="font-size:10px"></iconify-icon>${resTime} - Rezerve
        </div>
        <div class="biz-res-countdown" data-at="${resIso}" style="font:var(--fw-medium) 9px/1 var(--font);color:var(--text-muted);letter-spacing:0.3px">${countdown}</div>
      </div>` : ''}
  </div>`;
}

/* Live countdown tick — updates reservation timers every 30s while the
   tables overlay is open. */
let _bizResCountdownTimer = null;
function _bizStartResCountdownTick() {
  if (_bizResCountdownTimer) return;
  _bizResCountdownTimer = setInterval(() => {
    const overlay = document.getElementById('bizTablesOverlay');
    if (!overlay) { clearInterval(_bizResCountdownTimer); _bizResCountdownTimer = null; return; }
    overlay.querySelectorAll('.biz-res-countdown[data-at]').forEach(el => {
      el.textContent = _bizFormatCountdown(el.getAttribute('data-at'));
    });
  }, 30000);
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
        <div style="display:flex;align-items:center;gap:10px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:6px 8px">
          <div onclick="bizAdjustNewTableCap(-1)" style="width:34px;height:34px;border-radius:var(--r-md);background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
            <iconify-icon icon="solar:minus-circle-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
          </div>
          <input id="bizNewTableCap" type="number" value="4" min="1" max="30" style="flex:1;text-align:center;border:none;background:transparent;font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);outline:none;width:100%;-moz-appearance:textfield" />
          <div onclick="bizAdjustNewTableCap(1)" style="width:34px;height:34px;border-radius:var(--r-md);background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
            <iconify-icon icon="solar:add-circle-linear" style="font-size:18px;color:#fff"></iconify-icon>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          ${[2,4,6,8,10,12].map(c => `
            <div onclick="document.getElementById('bizNewTableCap').value=${c}" style="padding:5px 11px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);background:var(--bg-btn);color:var(--text-secondary);cursor:pointer;border:1px solid var(--border-subtle)">${c} kişilik</div>
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

function bizAdjustNewTableCap(delta) {
  const input = document.getElementById('bizNewTableCap');
  if (!input) return;
  let v = parseInt(input.value) || 0;
  v += delta;
  if (v < 1) v = 1;
  if (v > 30) v = 30;
  input.value = v;
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

  const capInput = document.getElementById('bizNewTableCap');
  let capacity = parseInt(capInput?.value);
  if (!capacity || capacity < 1) { alert('Geçerli bir kapasite girin (1-30)'); return; }
  if (capacity > 30) capacity = 30;

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

/* ═══ ASSIGN WAITERS TO ZONE ═══ */
function bizAssignZoneWaiter(zoneId) {
  // Permission check: owner, manager, or coordinator only
  if (!(bizCurrentRole === 'owner' || bizCurrentRole === 'manager' || bizCurrentRole === 'coordinator')) return;
  const zone = BIZ_TABLE_ZONES.find(z => z.id === zoneId);
  if (!zone) return;

  // Available waiters at this branch
  const waiters = BIZ_STAFF.filter(s => s.branchId === bizActiveBranch && s.role === 'waiter' && s.status === 'active');
  const assigned = Array.isArray(zone.assignedWaiters) ? zone.assignedWaiters.slice() : [];

  const existing = document.getElementById('bizZoneWaiterModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bizZoneWaiterModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const waiterListHtml = waiters.length === 0
    ? `<div style="padding:16px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted)">Bu şubede aktif garson bulunmuyor.</div>`
    : waiters.map(w => {
        const isSel = assigned.includes(w.id);
        return `
          <div onclick="_bizToggleZoneWaiter(this,'${w.id}')" data-staff-id="${w.id}" data-selected="${isSel ? '1' : '0'}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-lg);cursor:pointer;background:${isSel ? zone.color + '15' : 'var(--bg-phone)'};border:1px solid ${isSel ? zone.color : 'var(--border-subtle)'};margin-bottom:6px">
            <img src="${w.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" alt="">
            <div style="flex:1;min-width:0">
              <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(w.name)}</div>
              <div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted)">Garson</div>
            </div>
            <iconify-icon icon="${isSel ? 'solar:check-circle-bold' : 'solar:add-circle-linear'}" style="font-size:20px;color:${isSel ? zone.color : 'var(--text-muted)'}"></iconify-icon>
          </div>`;
      }).join('');

  modal.innerHTML = `
    <div style="background:var(--bg-surface);border-radius:var(--r-xl);padding:20px;width:100%;max-width:340px;max-height:80vh;display:flex;flex-direction:column;box-shadow:var(--shadow-lg)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <iconify-icon icon="${zone.icon}" style="font-size:20px;color:${zone.color}"></iconify-icon>
        <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${escHtml(zone.name)}</div>
      </div>
      <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-bottom:14px">
        Bu bölgeye atanan garsonlar yalnız bu bölgedeki masaları görür ve bildirimlerini alır.
      </div>
      <div id="bizZoneWaiterList" style="overflow-y:auto;flex:1;max-height:50vh;margin:-4px -4px 14px;padding:4px">${waiterListHtml}</div>
      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('bizZoneWaiterModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-secondary);background:var(--bg-phone);cursor:pointer">İptal</button>
        <button onclick="_bizSaveZoneWaiters('${zoneId}')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:var(--primary);cursor:pointer">Kaydet</button>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

function _bizToggleZoneWaiter(el, staffId) {
  const cur = el.dataset.selected === '1';
  el.dataset.selected = cur ? '0' : '1';
  // Re-style
  const zoneColorMatch = el.style.background.match(/#[0-9a-fA-F]{6}/);
  el.style.background = cur ? 'var(--bg-phone)' : (zoneColorMatch ? zoneColorMatch[0] + '15' : 'var(--primary-soft)');
  const icon = el.querySelector('iconify-icon');
  if (icon) icon.setAttribute('icon', cur ? 'solar:add-circle-linear' : 'solar:check-circle-bold');
}

function _bizSaveZoneWaiters(zoneId) {
  const zone = BIZ_TABLE_ZONES.find(z => z.id === zoneId);
  if (!zone) return;
  const rows = document.querySelectorAll('#bizZoneWaiterList [data-staff-id]');
  const selected = [];
  rows.forEach(r => { if (r.dataset.selected === '1') selected.push(r.dataset.staffId); });
  zone.assignedWaiters = selected;
  document.getElementById('bizZoneWaiterModal')?.remove();
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

/* Format ISO timestamp as "13 Nis 2026 · 14:30" */
function _formatFullDateTime(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  const datePart = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return datePart + ' · ' + timePart;
}

/* Find the earliest order time for a table (first order placed this session) */
function _getFirstOrderTime(tableId) {
  const orders = BIZ_ORDERS.filter(o => o.tableId === tableId && o.createdAt);
  if (!orders.length) return null;
  const earliest = orders.reduce((a, b) =>
    new Date(a.createdAt).getTime() <= new Date(b.createdAt).getTime() ? a : b
  );
  return earliest.createdAt;
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

/* Allowed roles that may generate a table-specific QR code */
function _bizCanCreateTableQr() {
  return ['owner', 'manager', 'coordinator', 'waiter'].includes(bizCurrentRole);
}

/* Any role whose permissions include the 'tables' screen can manage merges */
function _bizCanManageTables() {
  return bizCanSeeScreen && bizCanSeeScreen('tables');
}

/* Return the list of table IDs merged together with the given table (inclusive).
   Uses table.mergedWith (Array<string>) as the source of truth. */
function bizGetMergeGroup(table) {
  if (!table) return [];
  const mergedIds = Array.isArray(table.mergedWith) ? table.mergedWith : [];
  if (mergedIds.length === 0) return [table.id];
  const set = new Set([table.id, ...mergedIds]);
  return Array.from(set);
}

/* Clear merge links for an entire group — used when a session ends. */
function _bizClearMergeForGroup(tableIds) {
  if (!Array.isArray(tableIds)) return;
  tableIds.forEach(id => {
    const t = BIZ_TABLES.find(x => x.id === id);
    if (t) t.mergedWith = [];
  });
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
          <div style="display:flex;justify-content:space-between;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted);margin-bottom:10px">
            <span>Misafir: ${table.guestCount} kişi</span>
            <span>Sipariş: ${table.currentOrder || '-'}</span>
          </div>
          ${(() => {
            const qrTime = _formatFullDateTime(table.occupiedSince);
            const firstOrderIso = _getFirstOrderTime(table.id);
            const orderTime = _formatFullDateTime(firstOrderIso);
            if (!qrTime && !orderTime) return '';
            return `
            <div style="display:flex;flex-direction:column;gap:8px;padding-top:10px;border-top:1px dashed var(--border-subtle)">
              ${qrTime ? `
              <div style="display:flex;align-items:center;gap:8px">
                <iconify-icon icon="solar:qr-code-linear" style="font-size:16px;color:var(--primary)"></iconify-icon>
                <div style="flex:1">
                  <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-bottom:2px">QR Okutma (Oturma)</div>
                  <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${qrTime}</div>
                </div>
              </div>` : ''}
              ${orderTime ? `
              <div style="display:flex;align-items:center;gap:8px">
                <iconify-icon icon="solar:bag-check-linear" style="font-size:16px;color:#22C55E"></iconify-icon>
                <div style="flex:1">
                  <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-bottom:2px">İlk Sipariş Verilme Saati</div>
                  <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">${orderTime}</div>
                </div>
              </div>` : ''}
            </div>`;
          })()}
        </div>
        ${table.assignedWaiter ? `
        <div style="padding:14px 16px;display:flex;align-items:center;gap:10px">
          <iconify-icon icon="solar:user-circle-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(table.assignedWaiter)}</span>
          <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);margin-left:auto">Garson</span>
        </div>` : ''}
      </div>
      ` : ''}

      ${isActive ? `
      <!-- Table Orders -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Siparişler</div>
        <button onclick="openBizAddOrderToTable('${table.id}')" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:none;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;box-shadow:var(--shadow-sm)">
          <iconify-icon icon="solar:add-circle-bold" style="font-size:15px"></iconify-icon> Sipariş Ekle
        </button>
      </div>
      ${tableOrdersHtml || `<div style="text-align:center;padding:16px;background:var(--bg-phone);border:1px dashed var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted)">Henüz sipariş yok. "Sipariş Ekle" ile menüden seçim yapabilirsiniz.</div>`}
      ` : ''}

      ${table.status === 'reserved' && table.reservationName ? `
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);padding:14px 16px">
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-bottom:6px">Rezervasyon</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">${escHtml(table.reservationName)} — ${new Date(table.reservationTime).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      ` : ''}

      ${(() => {
        if (!_bizCanManageTables()) return '';
        const group = bizGetMergeGroup(table);
        const isMerged = group.length > 1;
        if (isMerged) {
          const others = group.filter(id => id !== table.id)
            .map(id => BIZ_TABLES.find(t => t.id === id))
            .filter(Boolean);
          const chips = others.map(o => `
            <span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:var(--r-full);background:var(--primary-soft);color:var(--primary);font:var(--fw-medium) var(--fs-xs)/1 var(--font)">
              <iconify-icon icon="solar:link-linear" style="font-size:12px"></iconify-icon>Masa ${o.number}
            </span>`).join('');
          return `
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);padding:14px 16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <iconify-icon icon="solar:link-round-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>
              <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Birleştirilmiş Masalar</span>
            </div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:10px">
              Bu birleştirme tek seferlik — hesap ödenip masa kapatıldığında otomatik çözülür.
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${chips}</div>
            <button onclick="bizUnmergeTables('${table.id}')" style="width:100%;padding:10px;border:1px solid #EF4444;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:#EF4444;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px">
              <iconify-icon icon="solar:link-broken-linear" style="font-size:16px"></iconify-icon> Birleştirmeyi Sonlandır
            </button>
          </div>`;
        }
        return `
          <button onclick="bizOpenMergeTables('${table.id}')" style="width:100%;padding:12px;border:1px dashed var(--primary);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--primary);background:var(--primary-soft);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:link-round-bold" style="font-size:18px"></iconify-icon> Diğer Masalar ile Birleştir
          </button>`;
      })()}

      ${(typeof _bizCanManageReservations === 'function' && _bizCanManageReservations() && typeof openBizReserveTable === 'function') ? (() => {
        const resList = (typeof _bizTableReservations === 'function') ? _bizTableReservations(table.id).filter(r => r.status !== 'cancelled') : [];
        const upcoming = resList.length;
        return `
          <button onclick="openBizReserveTable('${table.id}')" style="width:100%;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);cursor:pointer;display:inline-flex;align-items:center;justify-content:space-between;gap:6px">
            <span style="display:inline-flex;align-items:center;gap:8px">
              <iconify-icon icon="solar:calendar-mark-bold" style="font-size:18px;color:#14B8A6"></iconify-icon> Rezervasyonlar
            </span>
            <span style="display:inline-flex;align-items:center;gap:6px">
              ${upcoming ? `<span style="padding:2px 8px;border-radius:var(--r-full);background:#14B8A622;color:#14B8A6;font:var(--fw-semibold) 11px/1 var(--font)">${upcoming}</span>` : ''}
              <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
            </span>
          </button>`;
      })() : ''}

      <!-- Actions -->
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${table.status === 'empty' ? `
          <button onclick="openBizAddOrderToTable('${table.id}')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:#22C55E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:login-3-linear" style="font-size:16px"></iconify-icon> Masa Aç
          </button>
        ` : ''}
        ${table.status === 'occupied' ? `
          <button onclick="alert('Hesap işlemi — yakında!')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:#3B82F6;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:bill-list-linear" style="font-size:16px"></iconify-icon> Hesap
          </button>
          <button onclick="bizCloseTable('${table.id}')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:#EF4444;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
            <iconify-icon icon="solar:logout-3-linear" style="font-size:16px"></iconify-icon> Kapat
          </button>
        ` : ''}
      </div>
    </div>
  `);

  document.getElementById('bizPhone').appendChild(overlay);

  // Inject QR-generate button to the right of the table title in the overlay header
  if (_bizCanCreateTableQr()) {
    const titleSpan = overlay.querySelector('span');
    if (titleSpan) {
      const qrBtn = document.createElement('div');
      qrBtn.className = 'btn-icon';
      qrBtn.title = 'Masa QR Kodu Oluştur';
      qrBtn.style.cssText = 'cursor:pointer;background:var(--primary-soft)';
      qrBtn.onclick = () => bizShowTableQr(table.id);
      qrBtn.innerHTML = `<iconify-icon icon="solar:qr-code-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>`;
      titleSpan.insertAdjacentElement('afterend', qrBtn);
    }
  }
}

/* ═══ TABLE MERGE / UNMERGE ═══ */
function bizOpenMergeTables(tableId) {
  if (!_bizCanManageTables()) return;
  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (!table) return;

  // Candidate tables: same branch, not itself, not already part of another
  // merge group (we only allow one active group per session).
  const branchTables = BIZ_TABLES.filter(t => t.branchId === table.branchId && t.id !== table.id);
  const candidates = branchTables.filter(t => {
    const mergedWith = Array.isArray(t.mergedWith) ? t.mergedWith : [];
    return mergedWith.length === 0;
  });

  // Group candidates by zone for a clearer UI
  const zones = BIZ_TABLE_ZONES.filter(z => z.branchId === table.branchId).sort((a, b) => a.order - b.order);

  const existing = document.getElementById('bizMergeTablesModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bizMergeTablesModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:85;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const zoneBlocks = zones.map(zone => {
    const zoneCands = candidates.filter(t => t.zoneId === zone.id);
    if (zoneCands.length === 0) return '';
    const rows = zoneCands.map(t => {
      const statusMap = {
        empty: { label: 'Boş', color: '#22C55E' },
        occupied: { label: 'Dolu', color: '#3B82F6' },
        reserved: { label: 'Rezerve', color: '#6B7280' },
        waiterCall: { label: 'Çağrı', color: '#EF4444' }
      };
      const st = statusMap[t.status] || { label: t.status, color: 'var(--text-muted)' };
      return `
        <div data-table-id="${t.id}" data-selected="0" onclick="_bizToggleMergeCandidate(this)" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-lg);cursor:pointer;background:var(--bg-phone);border:1px solid var(--border-subtle);margin-bottom:6px">
          <div style="width:34px;height:34px;border-radius:var(--r-md);background:${zone.color}15;display:flex;align-items:center;justify-content:center">
            <span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:${zone.color}">M${t.number}</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Masa ${t.number}</div>
            <div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted)">${t.capacity} kişilik · ${st.label}</div>
          </div>
          <iconify-icon icon="solar:add-circle-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>
        </div>`;
    }).join('');
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <iconify-icon icon="${zone.icon}" style="font-size:14px;color:${zone.color}"></iconify-icon>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px">${escHtml(zone.name)}</span>
        </div>
        ${rows}
      </div>`;
  }).join('');

  const bodyHtml = candidates.length === 0
    ? `<div style="padding:20px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Birleştirilebilecek uygun masa bulunamadı.</div>`
    : zoneBlocks;

  modal.innerHTML = `
    <div style="background:var(--bg-surface);border-radius:var(--r-xl);padding:20px;width:100%;max-width:360px;max-height:82vh;display:flex;flex-direction:column;box-shadow:var(--shadow-lg)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <iconify-icon icon="solar:link-round-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
        <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Masa ${table.number} ile Birleştir</div>
      </div>
      <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:14px">
        Seçtiğiniz masalar bu oturum boyunca tek bir masa gibi yönetilir. Hesap ödenip masa kapatıldığında birleştirme otomatik sona erer.
      </div>
      <div id="bizMergeCandList" style="overflow-y:auto;flex:1;max-height:55vh;margin:-4px -4px 14px;padding:4px">${bodyHtml}</div>
      <div style="display:flex;gap:10px">
        <button onclick="document.getElementById('bizMergeTablesModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-secondary);background:var(--bg-phone);cursor:pointer">İptal</button>
        <button onclick="_bizConfirmMergeTables('${tableId}')" style="flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#fff;background:var(--primary);cursor:pointer">Birleştir</button>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

function _bizToggleMergeCandidate(el) {
  const cur = el.dataset.selected === '1';
  el.dataset.selected = cur ? '0' : '1';
  el.style.background = cur ? 'var(--bg-phone)' : 'var(--primary-soft)';
  el.style.borderColor = cur ? 'var(--border-subtle)' : 'var(--primary)';
  const icon = el.querySelector('iconify-icon');
  if (icon) {
    icon.setAttribute('icon', cur ? 'solar:add-circle-linear' : 'solar:check-circle-bold');
    icon.style.color = cur ? 'var(--text-muted)' : 'var(--primary)';
  }
}

function _bizConfirmMergeTables(primaryId) {
  const primary = BIZ_TABLES.find(t => t.id === primaryId);
  if (!primary) return;
  const selectedEls = document.querySelectorAll('#bizMergeCandList [data-table-id][data-selected="1"]');
  if (selectedEls.length === 0) {
    alert('Birleştirilecek en az bir masa seçin.');
    return;
  }
  const otherIds = Array.from(selectedEls).map(el => el.dataset.tableId);
  const groupIds = Array.from(new Set([primary.id, ...otherIds]));
  // Every table in the group points to the others
  groupIds.forEach(id => {
    const t = BIZ_TABLES.find(x => x.id === id);
    if (t) t.mergedWith = groupIds.filter(other => other !== id);
  });
  document.getElementById('bizMergeTablesModal')?.remove();
  document.getElementById('bizTableDetailOverlay')?.remove();
  bizRefreshTablesOverlay();
  // Reopen detail for feedback
  openBizTableDetail(primary.number);
}

function bizUnmergeTables(tableId) {
  if (!_bizCanManageTables()) return;
  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (!table) return;
  if (!confirm('Birleştirmeyi sonlandırmak istediğinize emin misiniz? Masalar eski haline döner.')) return;
  const group = bizGetMergeGroup(table);
  _bizClearMergeForGroup(group);
  document.getElementById('bizTableDetailOverlay')?.remove();
  bizRefreshTablesOverlay();
  openBizTableDetail(table.number);
}

/* Close a table: ends the session and auto-clears any merge links
   for the entire group so tables return to their original layout. */
function bizCloseTable(tableId) {
  if (!_bizCanManageTables()) return;
  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (!table) return;
  if (!confirm('Masayı kapatmak istediğinize emin misiniz? Oturum sona erer ve varsa birleştirme çözülür.')) return;
  // Collect all tables in the same merge group (including this one)
  const group = bizGetMergeGroup(table);
  group.forEach(id => {
    const t = BIZ_TABLES.find(x => x.id === id);
    if (!t) return;
    t.status = 'empty';
    t.currentOrder = null;
    t.assignedWaiter = null;
    t.occupiedSince = null;
    t.guestCount = 0;
    t.mergedWith = [];
  });
  document.getElementById('bizTableDetailOverlay')?.remove();
  bizRefreshTablesOverlay();
}

/* ═══ TABLE QR CODE MODAL ═══ */
function bizShowTableQr(tableId) {
  const table = BIZ_TABLES.find(t => t.id === tableId);
  if (!table) return;
  const branch = BIZ_BRANCHES.find(b => b.id === table.branchId);
  const zone = BIZ_TABLE_ZONES.find(z => z.id === table.zoneId);

  // QR payload: deep link to order flow for this specific table
  const payload = `yemekapp://order?branch=${encodeURIComponent(table.branchId)}&table=${encodeURIComponent(table.id)}&n=${table.number}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(payload)}`;

  const existing = document.getElementById('bizTableQrModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bizTableQrModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:90;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--bg-surface);border-radius:var(--r-xl);padding:22px;width:100%;max-width:320px;box-shadow:var(--shadow-lg);text-align:center">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Masa ${table.number} QR Kodu</div>
        <div class="btn-icon" style="cursor:pointer" onclick="document.getElementById('bizTableQrModal').remove()">
          <iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon>
        </div>
      </div>
      ${zone ? `<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-bottom:4px;text-align:left"><iconify-icon icon="${zone.icon}" style="font-size:12px;color:${zone.color};vertical-align:-2px"></iconify-icon> ${escHtml(zone.name)}${branch ? ' · ' + escHtml(branch.name) : ''}</div>` : ''}
      <div style="background:#fff;border-radius:var(--r-xl);padding:14px;margin:14px auto 12px;display:inline-block;box-shadow:var(--shadow-md)">
        <img src="${qrSrc}" alt="Masa ${table.number} QR" style="width:220px;height:220px;display:block" />
      </div>
      <div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:14px">
        Müşteriler bu QR kodu okutarak masaya özel sipariş akışını başlatabilir.
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="_bizDownloadTableQr('${qrSrc}','masa-${table.number}-qr.png')" style="flex:1;padding:11px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px">
          <iconify-icon icon="solar:download-minimalistic-linear" style="font-size:16px"></iconify-icon>
          <span>İndir</span>
        </button>
        <button onclick="_bizPrintTableQr('${qrSrc}', ${table.number})" style="flex:1;padding:11px;border:none;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:#fff;background:var(--primary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px">
          <iconify-icon icon="solar:printer-linear" style="font-size:16px"></iconify-icon>
          <span>Yazdır</span>
        </button>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

function _bizDownloadTableQr(src, filename) {
  const a = document.createElement('a');
  a.href = src;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function _bizPrintTableQr(src, num) {
  const w = window.open('', '_blank', 'width=420,height=560');
  if (!w) return;
  w.document.write('<html><head><title>Masa ' + num + ' QR</title><style>body{font-family:system-ui,sans-serif;text-align:center;padding:24px}h1{font-size:20px;margin:0 0 12px}img{width:320px;height:320px}</style></head><body><h1>Masa ' + num + '</h1><img src="' + src + '" alt="QR"/><scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print()},300)}</scr' + 'ipt></body></html>');
  w.document.close();
}


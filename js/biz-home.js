/* ═══ BIZ HOME COMPONENT ═══ */

function getBizTileData() {
  const orders = getBranchOrders();
  const tables = getBranchTables();
  const calls = getBranchCalls();
  const staff = getBranchStaff();
  const stats = BIZ_DASHBOARD_STATS;
  const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'waiterCall');
  const callTables = tables.filter(t => t.status === 'waiterCall');
  const pendingCalls = calls.filter(c => c.status === 'pending');
  const onlineOrders = orders.filter(o => o.type === 'online' && o.status !== 'delivered' && o.status !== 'cancelled');
  const activeStaff = staff.filter(s => s.status === 'active' && s.role !== 'owner');
  const reviews = BIZ_REVIEWS;

  return {
    liveOrders:   { value: activeOrders.length + ' Aktif', subtitle: pendingOrders.length + ' yeni bekliyor', custom: true },
    orders:       { value: orders.length + ' Toplam', subtitle: activeOrders.length + ' aktif · ' + onlineOrders.length + ' online' },
    tables:       { value: occupiedTables.length + '/' + tables.length + ' Dolu', subtitle: callTables.length + ' garson çağrısı' },
    menu:         { value: '24 Ürün', subtitle: '2 pasif' },
    waiterCalls:  { value: pendingCalls.length + ' Bekliyor', subtitle: 'Ort. 2dk yanıt' },
    staff:        { value: activeStaff.length + ' Vardiyada', subtitle: '' },
    reviews:      { value: stats.thisMonth.avgRating + ' ★', subtitle: reviews.length + ' yeni yorum' },
    kitchen:      { value: pendingOrders.length + ' Hazırlanacak', subtitle: 'Mutfak siparişleri' },
    bar:          { value: '3 Hazırlanıyor', subtitle: 'İçecek siparişleri' },
    reservations: { value: '4 Bugün', subtitle: '2 onay bekliyor' },
    delivery:     { value: onlineOrders.length + ' Teslimat', subtitle: 'Aktif siparişler' },
    branches:     { value: BIZ_BRANCHES.length + ' Şube', subtitle: BIZ_BRANCHES.filter(b=>b.status==='open').length + ' açık' },
    shifts:       { value: activeStaff.length + ' Vardiyada', subtitle: 'Bu gün' }
  };
}

function renderBizHome() {
  const grid = document.getElementById('bizTileGrid');
  if (!grid) return;

  // ── Aggregate "Tüm İşletmeler" dashboard ──
  if (bizActiveBranch === 'all') {

    const totalStaff = BIZ_STAFF.length;
    const activeStaff = BIZ_STAFF.filter(s => s.status === 'active' && s.role !== 'owner').length;
    const totalTables = BIZ_TABLES.length;
    const occupiedTables = BIZ_TABLES.filter(t => t.status === 'occupied').length;
    const totalOrders = BIZ_ORDERS.length;
    const activeOrders = BIZ_ORDERS.filter(o => ['pending','preparing','ready'].includes(o.status)).length;
    const stats = BIZ_DASHBOARD_STATS;
    const openBranches = BIZ_BRANCHES.filter(b => b.status === 'open').length;
    // Staff role distribution
    const roleDistribution = {};
    BIZ_STAFF.filter(s => s.role !== 'owner').forEach(s => {
      roleDistribution[s.roleLabel] = (roleDistribution[s.roleLabel] || 0) + 1;
    });

    grid.style.display = 'block';
    grid.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Genel Bakış Header -->
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:42px;height:42px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <iconify-icon icon="solar:chart-2-bold" style="font-size:22px;color:#8B5CF6"></iconify-icon>
          </div>
          <div>
            <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Genel Bakış</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${BIZ_BRANCHES.length} şube · ${openBranches} açık</div>
          </div>
        </div>

        <!-- Key Metrics Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
                <iconify-icon icon="solar:users-group-two-rounded-bold" style="font-size:18px;color:#EC4899"></iconify-icon>
              </div>
              <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Personel</span>
            </div>
            <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--text-primary)">${totalStaff}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:#22c55e;margin-top:4px">${activeStaff} aktif</div>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
                <iconify-icon icon="solar:sofa-2-bold" style="font-size:18px;color:#3B82F6"></iconify-icon>
              </div>
              <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Masalar</span>
            </div>
            <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--text-primary)">${totalTables}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--primary);margin-top:4px">${occupiedTables} dolu</div>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
                <iconify-icon icon="solar:bag-check-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>
              </div>
              <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Siparişler</span>
            </div>
            <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--text-primary)">${totalOrders}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:#F59E0B;margin-top:4px">${activeOrders} aktif</div>
          </div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div style="width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center">
                <iconify-icon icon="solar:star-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>
              </div>
              <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Değerlendirme</span>
            </div>
            <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--text-primary)">${stats.thisMonth.avgRating}</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">${stats.thisMonth.totalReviews} yorum</div>
          </div>
        </div>

        <!-- Şube Performans -->
        <div>
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Şube Performansı</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${BIZ_BRANCHES.map(b => {
              const bStaff = BIZ_STAFF.filter(s => s.branchId === b.id).length;
              const bTables = BIZ_TABLES.filter(t => t.branchId === b.id).length;
              const bOccupied = BIZ_TABLES.filter(t => t.branchId === b.id && t.status === 'occupied').length;
              return `
              <div onclick="selectBizBranch('${b.id}')" style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px 16px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);cursor:pointer;display:flex;align-items:center;gap:12px">
                <div style="width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <iconify-icon icon="solar:shop-2-bold" style="font-size:20px;color:${b.status === 'open' ? '#22c55e' : '#ef4444'}"></iconify-icon>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(b.name)}</div>
                  <div style="display:flex;align-items:center;gap:10px;margin-top:4px;flex-wrap:wrap">
                    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${bStaff} personel</span>
                    <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${bOccupied}/${bTables} masa</span>
                  </div>
                </div>
                <span style="font:var(--fw-medium) 10px/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:${b.status === 'open' ? '#22c55e' : '#ef4444'};background:${b.status === 'open' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}">${b.status === 'open' ? 'Açık' : 'Kapalı'}</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Personel Dağılımı -->
        <div>
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Personel Dağılımı</div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
            ${Object.entries(roleDistribution).map(([role, count], i, arr) => `
              <div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between${i < arr.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}">
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:8px;height:8px;border-radius:50%;background:${BIZ_ROLE_PERMISSIONS[Object.keys(BIZ_ROLE_PERMISSIONS).find(k => BIZ_ROLE_PERMISSIONS[k].label === role)]?.color || '#666'}"></div>
                  <span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${role}</span>
                </div>
                <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-secondary)">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- En Çok Satan Ürünler -->
        <div>
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-bottom:10px">En Çok Satan Ürünler</div>
          <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
            ${stats.thisWeek.topItems.map((item, i) => `
              <div style="padding:12px 16px;display:flex;align-items:center;gap:12px${i < stats.thisWeek.topItems.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}">
                <div style="width:28px;height:28px;border-radius:50%;background:${i < 3 ? 'var(--primary)' : 'var(--bg-btn)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <span style="font:var(--fw-bold) 11px/1 var(--font);color:${i < 3 ? '#fff' : 'var(--text-muted)'}">${i + 1}</span>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(item.name)}</div>
                  <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${item.qty} adet satıldı</div>
                </div>
                <span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#22c55e">₺${item.revenue.toLocaleString('tr-TR')}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="height:16px"></div>
      </div>
    `;
    return;
  }

  // ── Normal branch-specific tile view ──
  grid.style.display = 'grid';

  const tileData = getBizTileData();
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  const allowedTiles = perms ? perms.tiles : [];

  let html = '';
  allowedTiles.forEach(tileId => {
    const def = BIZ_TILE_DEFS[tileId];
    const data = tileData[tileId];
    if (!def || !data) return;
    /* Custom tile for Canlı Siparişler */
    if (def.custom && typeof _blvoTileHtml === 'function') {
      html += _blvoTileHtml();
      return;
    }
    html += bizTile(def.icon, def.color, def.title, data.value, data.subtitle, def.fn + '()');
  });

  grid.innerHTML = html;
}

function bizTile(icon, color, title, value, subtitle, onclick) {
  return `<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:16px;border:1px solid var(--border-subtle);cursor:pointer;display:flex;flex-direction:column;gap:10px;box-shadow:var(--shadow-md)" onclick="${onclick}">
    <div style="width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center">
      <iconify-icon icon="${icon}" style="font-size:22px;color:${color}"></iconify-icon>
    </div>
    <div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted)">${title}</div>
    <div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${value}</div>
    ${subtitle ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${subtitle}</div>` : ''}
  </div>`;
}


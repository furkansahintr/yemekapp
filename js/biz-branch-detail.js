/* ═══ BIZ BRANCH DETAIL COMPONENT ═══ */

function openBizBranchDetail(branchId) {
  const branch = BIZ_BRANCHES.find(b => b.id === branchId);
  if (!branch) return;

  const branchStaff = BIZ_STAFF.filter(s => s.branchId === branchId);
  const branchTables = BIZ_TABLES.filter(t => t.branchId === branchId);
  const branchOrders = BIZ_ORDERS.filter(o => o.branchId === branchId);
  const branchShifts = BIZ_SHIFTS.filter(s => s.branchId === branchId);

  const occupiedTables = branchTables.filter(t => t.status === 'occupied').length;
  const activeOrders = branchOrders.filter(o => o.status === 'preparing' || o.status === 'pending' || o.status === 'ready').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayShifts = branchShifts.filter(s => s.date === todayStr);

  // Get today's day name in Turkish
  const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const todayDay = dayNames[new Date().getDay()];
  const todayHours = branch.workingHours[todayDay];
  const hoursText = todayHours && todayHours.open !== 'Kapalı' ? `${todayHours.open} - ${todayHours.close}` : 'Kapalı';

  // Role-based section visibility
  const canSeeStaff = bizCanSeeScreen('staff');
  const canSeeMenu = bizCanSeeScreen('menu');
  const canSeeFinance = bizCanSeeScreen('revenue') || bizCanSeeScreen('payments');
  const canSeeTables = bizCanSeeScreen('tables');
  const canSeeShifts = bizCanSeeScreen('staff');
  const isOwnerOrManager = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';

  // Group staff by role
  const staffByRole = {};
  branchStaff.forEach(s => {
    if (!staffByRole[s.roleLabel]) staffByRole[s.roleLabel] = [];
    staffByRole[s.roleLabel].push(s);
  });

  const content = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- Branch Header Card -->
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg)">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
          <div style="width:52px;height:52px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <iconify-icon icon="solar:shop-2-bold" style="font-size:26px;color:${branch.status === 'open' ? '#22c55e' : '#ef4444'}"></iconify-icon>
          </div>
          <div style="flex:1">
            <div style="font:var(--fw-bold) var(--fs-xl)/1.2 var(--font);color:var(--text-primary)">${escHtml(branch.name)}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
              <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:${branch.status === 'open' ? '#22c55e' : '#ef4444'};background:${branch.status === 'open' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'};padding:3px 10px;border-radius:var(--r-full)">${branch.status === 'open' ? 'Açık' : 'Kapalı'}</span>
              ${branch.isMainBranch ? '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#8B5CF6;background:rgba(139,92,246,0.08);padding:3px 10px;border-radius:var(--r-full)">Ana Şube</span>' : ''}
            </div>
          </div>
          ${isOwnerOrManager ? '<div class="btn-icon" onclick="alert(\'Şube düzenleme — yakında!\')"><iconify-icon icon="solar:pen-2-linear" style="font-size:18px"></iconify-icon></div>' : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:map-point-linear" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></iconify-icon>
            <span style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary)">${escHtml(branch.address)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:phone-linear" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></iconify-icon>
            <span style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary)">${branch.phone}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:clock-circle-linear" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></iconify-icon>
            <span style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary)">Bugün: ${hoursText}</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
          <div style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${branchStaff.length}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Personel</div>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
          <div style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${occupiedTables}/${branchTables.length}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Masa Dolu</div>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
          <div style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">${activeOrders}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Aktif Sipariş</div>
        </div>
      </div>

      ${canSeeStaff ? `
      <!-- Ekip & Personel -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:users-group-two-rounded-bold" style="font-size:18px;color:#EC4899"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Ekip & Personel</span>
            <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${branchStaff.length} kişi</span>
          </div>
          ${isOwnerOrManager ? '<div onclick="alert(\'Personel ekleme — yakında!\')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:3px"><iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon> Ekle</div>' : ''}
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          ${branchStaff.map((s, i) => `
            <div style="padding:12px 16px;display:flex;align-items:center;gap:12px${i < branchStaff.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}">
              <img src="${s.avatar}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0" onerror="this.style.display='none'" alt="">
              <div style="flex:1;min-width:0">
                <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(s.name)}</div>
                <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${s.phone}</div>
              </div>
              <span style="font:var(--fw-medium) 10px/1 var(--font);color:${BIZ_ROLE_PERMISSIONS[s.role]?.color || '#666'};background:${BIZ_ROLE_PERMISSIONS[s.role]?.color || '#666'}12;padding:4px 10px;border-radius:var(--r-full)">${escHtml(s.roleLabel)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${canSeeShifts && todayShifts.length > 0 ? `
      <!-- Bugünkü Vardiyalar -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <iconify-icon icon="solar:clock-circle-bold" style="font-size:18px;color:#0EA5E9"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Bugünkü Vardiyalar</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${todayShifts.length} vardiya</span>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          ${todayShifts.map((sh, i) => {
            const staffMember = BIZ_STAFF.find(st => st.id === sh.staffId);
            const statusColor = sh.status === 'active' ? '#22c55e' : sh.status === 'completed' ? 'var(--text-muted)' : '#F59E0B';
            const statusLabel = sh.status === 'active' ? 'Aktif' : sh.status === 'completed' ? 'Tamamlandı' : 'Bekliyor';
            return `
            <div style="padding:12px 16px;display:flex;align-items:center;gap:12px${i < todayShifts.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}">
              <div style="flex:1;min-width:0">
                <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${staffMember ? escHtml(staffMember.name) : 'Bilinmeyen'}</div>
                <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${sh.startTime} - ${sh.endTime}</div>
              </div>
              <span style="font:var(--fw-medium) 10px/1 var(--font);color:${statusColor};background:${statusColor}12;padding:3px 8px;border-radius:var(--r-full)">${statusLabel}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      ${canSeeMenu ? `
      <!-- Menü & Ürünler -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:notebook-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>
            <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Menü & Ürünler</span>
          </div>
          ${isOwnerOrManager ? '<div onclick="alert(\'Ürün ekleme — yakında!\')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:3px"><iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon> Ürün Ekle</div>' : ''}
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          ${BIZ_MENU_CATEGORIES.map((cat, i) => `
            <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer${i < BIZ_MENU_CATEGORIES.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}" onclick="alert('${escHtml(cat)} yönetimi — yakında!')">
              <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <iconify-icon icon="solar:chef-hat-linear" style="font-size:18px;color:#F59E0B"></iconify-icon>
              </div>
              <div style="flex:1">
                <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">${escHtml(cat)}</div>
              </div>
              <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${canSeeFinance ? `
      <!-- Finans & Ödemeler -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <iconify-icon icon="solar:wallet-money-bold" style="font-size:18px;color:#22C55E"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Finans & Ödemeler</span>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="alert('Günlük ciro detayı — yakında!')">
            <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <iconify-icon icon="solar:chart-2-linear" style="font-size:18px;color:#22C55E"></iconify-icon>
            </div>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Günlük Ciro</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Bugünkü gelir & gider özeti</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="alert('Ödeme geçmişi — yakında!')">
            <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <iconify-icon icon="solar:card-linear" style="font-size:18px;color:#3B82F6"></iconify-icon>
            </div>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Ödeme Geçmişi</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Nakit, kredi kartı, online ödemeler</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle);position:relative" onclick="openBizInvoiceList('${branch.id}')">
            <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative">
              <iconify-icon icon="solar:document-text-linear" style="font-size:18px;color:#F59E0B"></iconify-icon>
              ${(typeof bizUnpaidInvoiceCount === 'function' && bizUnpaidInvoiceCount(branch.id) > 0) ? `<span style="position:absolute;top:-3px;right:-3px;min-width:14px;height:14px;padding:0 4px;border-radius:var(--r-full);background:#EF4444;color:#fff;font:var(--fw-bold) 9px/14px var(--font);text-align:center">${bizUnpaidInvoiceCount(branch.id)}</span>` : ''}
            </div>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Faturalar</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(typeof bizUnpaidInvoiceCount === 'function' && bizUnpaidInvoiceCount(branch.id) > 0) ? bizUnpaidInvoiceCount(branch.id) + ' ödenmemiş · hizmet & komisyon' : 'Hizmet & komisyon faturaları'}</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer" onclick="alert('Komisyon detayları — yakında!')">
            <div style="width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <iconify-icon icon="solar:hand-money-linear" style="font-size:18px;color:#8B5CF6"></iconify-icon>
            </div>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Komisyonlar</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Platform & hizmet komisyonları</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
        </div>
      </div>
      ` : ''}

      ${canSeeTables ? `
      <!-- Masa Durumu -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <iconify-icon icon="solar:sofa-2-bold" style="font-size:18px;color:#3B82F6"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Masa Durumu</span>
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-tertiary)">${occupiedTables}/${branchTables.length} dolu</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${branchTables.map(t => {
            const bgColor = t.status === 'occupied' ? 'rgba(239,68,68,0.08)' : t.status === 'reserved' ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)';
            const iconColor = t.status === 'occupied' ? '#EF4444' : t.status === 'reserved' ? '#F59E0B' : '#22C55E';
            return `
            <div style="background:var(--bg-phone);border-radius:var(--r-lg);padding:12px 8px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-sm);text-align:center">
              <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 6px">
                <iconify-icon icon="solar:sofa-2-bold" style="font-size:16px;color:${iconColor}"></iconify-icon>
              </div>
              <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">M${t.number}</div>
              <div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">${t.capacity} kişilik</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Çalışma Saatleri -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <iconify-icon icon="solar:clock-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Çalışma Saatleri</span>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          ${Object.entries(branch.workingHours).map(([day, hrs], i, arr) => `
            <div style="padding:11px 16px;display:flex;align-items:center;justify-content:space-between${i < arr.length - 1 ? ';border-bottom:1px solid var(--border-subtle)' : ''}">
              <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:${day === todayDay ? 'var(--primary)' : 'var(--text-primary)'}">${day}</span>
              <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:${hrs.open === 'Kapalı' ? '#EF4444' : 'var(--text-secondary)'}">${hrs.open === 'Kapalı' ? 'Kapalı' : hrs.open + ' - ' + hrs.close}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${isOwnerOrManager ? `
      <!-- Şube Ayarları -->
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <iconify-icon icon="solar:settings-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Şube Ayarları</span>
        </div>
        <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizBranchAchievements('${branch.id}')">
            <iconify-icon icon="solar:cup-star-bold" style="font-size:20px;color:#F59E0B"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">İşletme Başarılar ve Koleksiyonları</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(function(){ if (typeof bizBranchBadgeState !== 'function') return 'Rozetlerini keşfet'; const st = bizBranchBadgeState(branch.id); const total = (typeof BIZ_BRANCH_BADGES_CATALOG !== 'undefined') ? BIZ_BRANCH_BADGES_CATALOG.length : 12; return st.earnedIds.length + '/' + total + ' rozet aktif'; })()}</div>
            </div>
            ${(typeof bizBranchBadgeState === 'function' && bizBranchBadgeState(branch.id).earnedIds.length > 0) ? `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);background:linear-gradient(135deg,#F59E0B,#EC4899);color:#fff;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.3px">${bizBranchBadgeState(branch.id).earnedIds.length}</span>` : ''}
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizDeliverySettings('${branch.id}')">
            <iconify-icon icon="solar:delivery-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Teslimat Ayarları</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(function(){ const zc = typeof BIZ_DELIVERY_ZONES !== 'undefined' ? BIZ_DELIVERY_ZONES.filter(z => z.branchId === branch.id).length : 0; return zc > 0 ? zc + ' bölge tanımlı' : branch.deliveryArea.distance + ' · Min ₺' + branch.minOrder; })()}</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizReservationSettings('${branch.id}')">
            <iconify-icon icon="solar:calendar-mark-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Rezervasyon Ayarları</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(function(){ if (typeof bizReservationSettings !== 'function') return 'Rezervasyon kurallarını yönet'; const r = bizReservationSettings(branch.id); if (!r.enabled) return 'Kapalı · rezervasyon kabul edilmiyor'; const blk = r.blockType === 'perPerson' ? r.blockAmount + ' token/kişi bloke' : r.blockAmount + ' token bloke'; return 'Aktif · ' + r.maxDaysAhead + ' gün · ' + blk; })()}</div>
            </div>
            ${(typeof bizReservationSettings === 'function' && bizReservationSettings(branch.id).enabled) ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);background:rgba(34,197,94,0.14);color:#16A34A;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.3px">AKTİF</span>' : ''}
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizWorkingHours('${branch.id}')">
            <iconify-icon icon="solar:clock-circle-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Çalışma Saatleri</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(function(){ if (branch.temporarilyClosedUntil && new Date(branch.temporarilyClosedUntil) > new Date()) return 'Geçici kapalı · ' + new Date(branch.temporarilyClosedUntil).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit'}) + '\'e kadar'; const openDays = Object.values(branch.workingHours || {}).filter(h => h.open !== 'Kapalı' && !h.closed).length; const sd = (branch.specialDays || []).length; return openDays + '/7 gün açık' + (sd ? ' · ' + sd + ' özel gün' : ''); })()}</div>
            </div>
            ${(branch.temporarilyClosedUntil && new Date(branch.temporarilyClosedUntil) > new Date()) ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);background:rgba(239,68,68,0.14);color:#DC2626;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.3px">KAPALI</span>' : ''}
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="bizActiveBranch='${branch.id}';openBizTables()">
            <iconify-icon icon="solar:sofa-2-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Masa Düzeni</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${branchTables.length} masa · ${(function(){ const zc = (typeof BIZ_TABLE_ZONES !== 'undefined') ? BIZ_TABLE_ZONES.filter(z => z.branchId === branch.id).length : 0; return zc + ' bölge'; })()}</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizQRMenu('${branch.id}')">
            <iconify-icon icon="solar:qr-code-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">QR Menü</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${branch.tableQRMode ? 'Masaya özel QR açık · tam interaktif' : 'Sadece genel menü · sipariş kapalı'}</div>
            </div>
            ${branch.tableQRMode ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);background:rgba(249,115,22,.14);color:#EA580C;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.3px">AKTİF</span>' : ''}
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="bizActiveBranch='${branch.id}';openBizMenuMgmt()">
            <iconify-icon icon="solar:notebook-bold" style="font-size:20px;color:#F59E0B"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Menü Yönetimi</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(function(){ const mc = (typeof BIZ_MENU_ITEMS !== 'undefined') ? BIZ_MENU_ITEMS.filter(m => m.branchId === branch.id && m.status === 'active').length : 0; const cats = (typeof BIZ_MENU_CATEGORIES !== 'undefined') ? BIZ_MENU_CATEGORIES.length : 0; return mc + ' ürün · ' + cats + ' kategori'; })()}</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizCommissionSettings('${branch.id}')">
            <iconify-icon icon="solar:wallet-money-bold" style="font-size:20px;color:#A855F7"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary);display:flex;align-items:center;gap:6px">
                Komisyon Oranlarım
                ${(function(){ const r = Number(branch.rating || 0); const tier = _commTier(r); return `<span style="font:var(--fw-semibold) 9px/1 var(--font);color:${tier.color};background:${tier.color}22;padding:3px 7px;border-radius:var(--r-full)">%${_commRate(r)}</span>`; })()}
              </div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">${Number(branch.rating || 0).toFixed(1)} puan · Performansa dayalı oran</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizPremiumPlan()">
            <iconify-icon icon="solar:crown-bold" style="font-size:20px;color:#A855F7"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Abonelik Bilgisi</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${BIZ_BUSINESS.subscription === 'premium' ? 'Premium Plan · Sınırsız özellik' : 'Ücretsiz plan — yükseltmek için dokun'}</div>
            </div>
            ${BIZ_BUSINESS.subscription === 'premium' ? '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:var(--r-full);background:#A855F7;color:#fff;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.3px">AKTİF</span>' : ''}
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizWallet()">
            <iconify-icon icon="solar:card-bold" style="font-size:20px;color:#10B981"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Cüzdanım</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Kazançlar, finansal hareketler & ödemeler</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)" onclick="openBizLegalDocs('${branch.id}')">
            <iconify-icon icon="solar:shield-keyhole-bold" style="font-size:20px;color:#F59E0B"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Yasal Evraklar</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">${(function(){ if (typeof bizBranchLegal !== 'function') return 'Ünvan · adres · vergi · IBAN'; const ld = bizBranchLegal(branch.id); const isPending = ld.pending && new Date(ld.pending.reviewDeadline) > new Date(); return isPending ? 'İnceleme altında · doğrulama bekliyor' : 'Ünvan · adres · vergi · IBAN'; })()}</div>
            </div>
            ${(typeof bizBranchLegal === 'function' && bizBranchLegal(branch.id).pending && new Date(bizBranchLegal(branch.id).pending.reviewDeadline) > new Date()) ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);background:rgba(245,158,11,.14);color:#D97706;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.3px">İNCELEMEDE</span>' : ''}
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>
          </div>
          <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;background:linear-gradient(90deg,rgba(239,68,68,.06),transparent)" onclick="openBizBranchDeletePage('${branch.id}')">
            <iconify-icon icon="solar:shop-minus-bold" style="font-size:20px;color:#EF4444"></iconify-icon>
            <div style="flex:1">
              <div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:#DC2626">Bu Şubeyi Kalıcı Olarak Sil</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">2 aşamalı güvenlik · 30 gün geri alma</div>
            </div>
            <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:#EF4444"></iconify-icon>
          </div>
        </div>
      </div>
      ` : ''}

      <div style="height:20px"></div>
    </div>
  `;

  const overlay = createBizOverlay('bizBranchDetailOverlay', branch.name, content);
  document.getElementById('bizPhone').appendChild(overlay);
}

/* ═══ BIZ PLACEHOLDER FUNCTIONS ═══ */

function openBizRevenue() { if (!bizRoleGuard('revenue')) return; bizSwitchTab('bizDashboard'); }

function openBizBranches() {
  if (!bizRoleGuard('branches')) return;
  const branches = (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.filter(b => b.businessId === (BIZ_BUSINESS && BIZ_BUSINESS.id)) : [];
  const activeId = (typeof bizActiveBranch !== 'undefined' && bizActiveBranch) ? bizActiveBranch.id : null;

  const branchCard = (b) => {
    const isActive = b.id === activeId;
    const dayNames = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
    const today = dayNames[new Date().getDay()];
    const hours = (b.workingHours && b.workingHours[today]) ? `${b.workingHours[today].open} – ${b.workingHours[today].close}` : '';
    const rating = (typeof b.rating === 'number') ? b.rating.toFixed(1) : '-';
    return `
      <div onclick="bizSelectBranchFromList('${b.id}')" style="background:var(--bg-phone);border-radius:var(--r-xl);border:1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-subtle)'};box-shadow:var(--shadow-md);padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <iconify-icon icon="solar:buildings-2-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${escHtml(b.name)}</span>
              ${isActive ? `<span style="padding:2px 8px;border-radius:var(--r-full);background:var(--primary);color:#fff;font:var(--fw-medium) 10px/1 var(--font)">Aktif</span>` : ''}
              <span style="padding:2px 8px;border-radius:var(--r-full);background:${b.status === 'open' ? '#22c55e22' : '#ef444422'};color:${b.status === 'open' ? '#22c55e' : '#ef4444'};font:var(--fw-medium) 10px/1 var(--font)">${b.status === 'open' ? 'Açık' : 'Kapalı'}</span>
            </div>
            <div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical">${escHtml(b.address || '')}</div>
          </div>
          <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary);flex-shrink:0"></iconify-icon>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font:var(--fw-regular) 11px/1 var(--font);color:var(--text-secondary)">
          ${hours ? `<span style="display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="solar:clock-circle-linear" style="font-size:12px;color:var(--primary)"></iconify-icon>${hours}</span>` : ''}
          ${b.phone ? `<span style="display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="solar:phone-linear" style="font-size:12px;color:#22C55E"></iconify-icon>${escHtml(b.phone)}</span>` : ''}
          ${typeof b.tableCount === 'number' ? `<span style="display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="solar:sofa-2-linear" style="font-size:12px;color:#3B82F6"></iconify-icon>${b.tableCount} masa</span>` : ''}
          <span style="display:inline-flex;align-items:center;gap:4px"><iconify-icon icon="solar:star-bold" style="font-size:12px;color:#F59E0B"></iconify-icon>${rating} (${b.reviews || 0})</span>
        </div>
      </div>`;
  };

  const listHtml = branches.length
    ? branches.map(branchCard).join('')
    : `<div style="text-align:center;padding:40px 20px;background:var(--bg-phone);border:1px dashed var(--border-subtle);border-radius:var(--r-xl);color:var(--text-muted);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Henüz şube yok. Aşağıdan yeni bir şube ekleyebilirsiniz.</div>`;

  const content = `
    <div style="display:flex;flex-direction:column;gap:12px;padding-bottom:80px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Tüm Şubeler</div>
        <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--primary-soft);color:var(--primary);font:var(--fw-medium) 11px/1 var(--font)">${branches.length} şube</span>
      </div>
      ${listHtml}
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;padding:12px var(--app-px) max(env(safe-area-inset-bottom),14px);background:linear-gradient(180deg,transparent,var(--bg-page) 30%)">
      <button onclick="openBizAddBranch()" style="width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:var(--shadow-md)">
        <iconify-icon icon="solar:add-circle-bold" style="font-size:20px"></iconify-icon> Şube Ekle
      </button>
    </div>
  `;
  const overlay = createBizOverlay('bizBranchesOverlay', 'Şubeler', content);
  document.getElementById('bizPhone').appendChild(overlay);
}

function bizSelectBranchFromList(branchId) {
  const branch = (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.find(b => b.id === branchId) : null;
  if (!branch) return;
  if (typeof selectBizBranch === 'function') selectBizBranch(branch);
  else if (typeof setBizActiveBranch === 'function') setBizActiveBranch(branch);
  else { bizActiveBranch = branch; if (typeof renderBizHome === 'function') renderBizHome(); }
  document.getElementById('bizBranchesOverlay')?.remove();
}

function openBizAddBranch() {
  const existing = document.getElementById('bizAddBranchModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'bizAddBranchModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:90;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div style="width:100%;max-width:480px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:18px var(--app-px) max(env(safe-area-inset-bottom),18px);display:flex;flex-direction:column;gap:12px;max-height:88vh;overflow-y:auto">
      <div style="display:flex;align-items:center;gap:10px">
        <iconify-icon icon="solar:buildings-2-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);flex:1">Yeni Şube Ekle</span>
        <div class="btn-icon" onclick="document.getElementById('bizAddBranchModal').remove()"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>
      </div>
      <label style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);margin-top:4px">Şube Adı</label>
      <input id="bizNewBranchName" placeholder="örn: Ataşehir Şubesi" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">
      <label style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);margin-top:4px">Adres</label>
      <textarea id="bizNewBranchAddress" rows="2" placeholder="Mahalle, cadde, no, ilçe/il" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);resize:vertical;outline:none"></textarea>
      <label style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);margin-top:4px">Telefon</label>
      <input id="bizNewBranchPhone" placeholder="+90 5XX XXX XX XX" style="padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div>
          <label style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)">Açılış</label>
          <input id="bizNewBranchOpen" type="time" value="10:00" style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">
        </div>
        <div>
          <label style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)">Kapanış</label>
          <input id="bizNewBranchClose" type="time" value="23:00" style="width:100%;margin-top:4px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">
        </div>
      </div>
      <button onclick="bizSubmitNewBranch()" style="margin-top:8px;padding:12px;border:none;border-radius:var(--r-lg);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px">
        <iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon> Şubeyi Oluştur
      </button>
    </div>`;
  document.body.appendChild(modal);
}

function bizSubmitNewBranch() {
  const name = (document.getElementById('bizNewBranchName') || {}).value || '';
  const address = (document.getElementById('bizNewBranchAddress') || {}).value || '';
  const phone = (document.getElementById('bizNewBranchPhone') || {}).value || '';
  const openT = (document.getElementById('bizNewBranchOpen') || {}).value || '10:00';
  const closeT = (document.getElementById('bizNewBranchClose') || {}).value || '23:00';
  if (!name.trim()) { alert('Şube adı gerekli.'); return; }
  if (!address.trim()) { alert('Adres gerekli.'); return; }

  const days = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
  const workingHours = {};
  days.forEach(d => { workingHours[d] = { open: openT, close: closeT }; });

  const newId = 'b' + (BIZ_BRANCHES.length + 1) + '_' + Date.now().toString(36);
  const newBranch = {
    id: newId,
    businessId: (BIZ_BUSINESS && BIZ_BUSINESS.id) || 'bus_001',
    name: name.trim(),
    address: address.trim(),
    phone: phone.trim(),
    workingHours: workingHours,
    minOrder: 0,
    deliveryFee: 0,
    deliveryArea: { distance: '-', estimatedTime: '-' },
    status: 'open',
    tableCount: 0,
    rating: 0,
    reviews: 0
  };
  BIZ_BRANCHES.push(newBranch);
  document.getElementById('bizAddBranchModal')?.remove();
  document.getElementById('bizBranchesOverlay')?.remove();
  openBizBranches();
  alert('Yeni şube eklendi: ' + newBranch.name);
}

function openBizRoles() { alert('Rol yönetimi — yakında!'); }

function openBizProfileEdit() { alert('Profil düzenleme — yakında!'); }

function openBizCategories() { alert('Kategori yönetimi — yakında!'); }

function openBizRecipeShare() { alert('Tarif paylaşımı — yakında!'); }

function openBizPayments() { if (!bizRoleGuard('payments')) return; alert('Ödeme geçmişi — yakında!'); }

function openBizInvoice() { alert('Fatura bilgileri — yakında!'); }

// openBizKitchen → js/biz-kitchen.js
// openBizBar → js/biz-kitchen.js (bar is a kitchen station)
function openBizBar() { if (!bizRoleGuard('bar')) return; bizKitchenActiveStation = 'bar'; openBizKitchen(); }

// openBizReservations → js/biz-reservations.js

// openBizDelivery → js/biz-deliveries.js

function closeBizMyBusiness() { /* handled by screen system */ }


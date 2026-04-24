/* ═══ BIZ STAFF COMPONENT ═══ */

function openBizStaff() { if (!bizRoleGuard('staff')) return; openBizStaffList(); }

/* ═══ SHIFT HELPERS ═══ */
function _getStaffShifts(staffId) {
  return BIZ_SHIFTS.filter(sh => sh.staffId === staffId && sh.branchId === bizActiveBranch);
}

function _getStaffTodayShift(staffId) {
  const today = new Date().toISOString().slice(0, 10);
  return BIZ_SHIFTS.find(sh => sh.staffId === staffId && sh.branchId === bizActiveBranch && sh.date === today);
}

function _getActiveShiftCount() {
  const today = new Date().toISOString().slice(0, 10);
  return BIZ_SHIFTS.filter(sh => sh.branchId === bizActiveBranch && sh.date === today && sh.status === 'active').length;
}

function _shiftStatusBadge(sh) {
  if (sh.status === 'active') return `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:#22C55E;background:rgba(34,197,94,0.1)">Aktif</span>`;
  if (sh.status === 'completed') return `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:#6B7280;background:rgba(107,114,128,0.1)">Tamamlandı</span>`;
  return `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);color:#F59E0B;background:rgba(245,158,11,0.1)">Planlandı</span>`;
}

/* ═══ STAFF LIST ═══ */
let _staffListTab = 'list'; // 'list' | 'shifts'

function openBizStaffList() {
  _staffListTab = 'list';
  const overlay = createBizOverlay('bizStaffOverlay', 'Personel', _renderStaffMainContent());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _switchStaffTab(tab) {
  _staffListTab = tab;
  const container = document.getElementById('bizStaffMainContent');
  if (container) container.innerHTML = _renderStaffTabContent();

  document.querySelectorAll('.biz-staff-tab').forEach(el => {
    const isActive = el.dataset.tab === tab;
    el.style.background = isActive ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    el.style.border = isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)';
  });
}

function _renderStaffMainContent() {
  const staff = getBranchStaff();
  const activeShifts = _getActiveShiftCount();
  const isOwnerOrManager = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';

  return `
    <!-- Tabs: Personel / Vardiyalar -->
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <div class="biz-staff-tab" data-tab="list" onclick="_switchStaffTab('list')" style="flex:1;padding:10px;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-sm)/1 var(--font);text-align:center;cursor:pointer;background:var(--primary);color:#fff;border:1px solid var(--primary)">
        <iconify-icon icon="solar:users-group-two-rounded-linear" style="font-size:14px;vertical-align:-2px"></iconify-icon> Personel (${staff.length})
      </div>
      <div class="biz-staff-tab" data-tab="shifts" onclick="_switchStaffTab('shifts')" style="flex:1;padding:10px;border-radius:var(--r-lg);font:var(--fw-medium) var(--fs-sm)/1 var(--font);text-align:center;cursor:pointer;background:var(--bg-phone);color:var(--text-secondary);border:1px solid var(--border-subtle)">
        <iconify-icon icon="solar:clock-circle-linear" style="font-size:14px;vertical-align:-2px"></iconify-icon> Vardiyalar ${activeShifts > 0 ? `<span style="font:var(--fw-bold) 10px/1 var(--font);background:#22C55E;color:#fff;padding:2px 6px;border-radius:var(--r-full);margin-left:4px">${activeShifts}</span>` : ''}
      </div>
    </div>

    <div id="bizStaffMainContent">
      ${_renderStaffTabContent()}
    </div>
  `;
}

function _renderStaffTabContent() {
  if (_staffListTab === 'shifts') return _renderShiftsTab();
  return _renderStaffListTab();
}

/* ═══ STAFF LIST TAB ═══ */
function _renderStaffListTab() {
  const staff = getBranchStaff();
  const roleColors = {
    owner: '#8B5CF6', manager: '#3B82F6', chef: '#F59E0B', waiter: '#22C55E', cashier: '#06B6D4', courier: '#EF4444'
  };
  const isOwnerOrManager = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';

  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${staff.map(s => {
        const color = roleColors[s.role] || '#6B7280';
        const todayShift = _getStaffTodayShift(s.id);
        const stationBadges = (s.role === 'chef' && s.kitchenCategories) ?
          s.kitchenCategories.map(kcId => {
            const kc = BIZ_KITCHEN_CATEGORIES.find(c => c.id === kcId);
            return kc ? `<span style="font:var(--fw-medium) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full);color:${kc.color};background:${kc.color}12;display:inline-flex;align-items:center;gap:3px"><iconify-icon icon="${kc.icon}" style="font-size:9px"></iconify-icon>${kc.name}</span>` : '';
          }).join('') : '';
        return `<div onclick="${isOwnerOrManager ? `openBizStaffDetail('${s.id}')` : ''}" style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);display:flex;align-items:center;gap:12px;${isOwnerOrManager ? 'cursor:pointer' : ''}">
          <img src="${s.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${color}" alt="">
          <div style="flex:1;min-width:0">
            <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">${s.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap">
              <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);background:${color}15;color:${color}">${BIZ_ROLE_LABELS[s.role]}</span>
              ${stationBadges}
            </div>
            ${todayShift ? `<div style="display:flex;align-items:center;gap:4px;margin-top:4px">
              <iconify-icon icon="solar:clock-circle-linear" style="font-size:11px;color:${todayShift.status === 'active' ? '#22C55E' : 'var(--text-muted)'}"></iconify-icon>
              <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:${todayShift.status === 'active' ? '#22C55E' : 'var(--text-muted)'}">${todayShift.startTime} - ${todayShift.endTime}</span>
            </div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:10px;height:10px;border-radius:50%;background:${s.status === 'active' ? '#22C55E' : '#EF4444'}"></div>
            ${isOwnerOrManager ? `<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted)"></iconify-icon>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    ${isOwnerOrManager ? `
    <div onclick="openBizAddStaff()" style="margin-top:16px;background:var(--primary);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
      <iconify-icon icon="solar:user-plus-bold" style="font-size:18px;color:#fff"></iconify-icon>
      <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Personel Ekle</span>
    </div>` : ''}
  `;
}

/* ═══ SHIFTS TAB ═══ */
let _shiftsDateFilter = 'today'; // 'today' | 'week' | 'all'

function _switchShiftsDate(filter) {
  _shiftsDateFilter = filter;
  const container = document.getElementById('bizStaffMainContent');
  if (container) container.innerHTML = _renderShiftsTab();

  document.querySelectorAll('.biz-shift-date-tab').forEach(el => {
    const isActive = el.dataset.filter === filter;
    el.style.background = isActive ? 'var(--primary)' : 'var(--bg-phone)';
    el.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    el.style.border = isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)';
  });
}

function _renderShiftsTab() {
  const isOwnerOrManager = bizCurrentRole === 'owner' || bizCurrentRole === 'manager';
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  let shifts = BIZ_SHIFTS.filter(sh => sh.branchId === bizActiveBranch);

  if (_shiftsDateFilter === 'today') {
    shifts = shifts.filter(sh => sh.date === today);
  } else if (_shiftsDateFilter === 'week') {
    shifts = shifts.filter(sh => sh.date >= weekAgo && sh.date <= today);
  }

  // Sort: active first, then by date desc, then by start time
  shifts.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (b.status === 'active' && a.status !== 'active') return 1;
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return `
    <!-- Date Filter -->
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <div class="biz-shift-date-tab" data-filter="today" onclick="_switchShiftsDate('today')" style="padding:6px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;background:${_shiftsDateFilter === 'today' ? 'var(--primary)' : 'var(--bg-phone)'};color:${_shiftsDateFilter === 'today' ? '#fff' : 'var(--text-secondary)'};border:1px solid ${_shiftsDateFilter === 'today' ? 'var(--primary)' : 'var(--border-subtle)'}">Bugün</div>
      <div class="biz-shift-date-tab" data-filter="week" onclick="_switchShiftsDate('week')" style="padding:6px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;background:${_shiftsDateFilter === 'week' ? 'var(--primary)' : 'var(--bg-phone)'};color:${_shiftsDateFilter === 'week' ? '#fff' : 'var(--text-secondary)'};border:1px solid ${_shiftsDateFilter === 'week' ? 'var(--primary)' : 'var(--border-subtle)'}">Bu Hafta</div>
      <div class="biz-shift-date-tab" data-filter="all" onclick="_switchShiftsDate('all')" style="padding:6px 14px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;background:${_shiftsDateFilter === 'all' ? 'var(--primary)' : 'var(--bg-phone)'};color:${_shiftsDateFilter === 'all' ? '#fff' : 'var(--text-secondary)'};border:1px solid ${_shiftsDateFilter === 'all' ? 'var(--primary)' : 'var(--border-subtle)'}">Tümü</div>
    </div>

    ${shifts.length === 0 ? `
      <div style="padding:32px 16px;text-align:center;font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted)">Bu dönemde vardiya kaydı yok</div>
    ` : `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${shifts.map(sh => {
        const staff = BIZ_STAFF.find(st => st.id === sh.staffId);
        if (!staff) return '';
        const roleColors = { owner: '#8B5CF6', manager: '#3B82F6', chef: '#F59E0B', waiter: '#22C55E', cashier: '#06B6D4', courier: '#EF4444' };
        const color = roleColors[staff.role] || '#6B7280';
        const isActive = sh.status === 'active';
        const dateLabel = sh.date === today ? 'Bugün' : new Date(sh.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
        const overtime = sh.overtimeMinutes > 0 ? `<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#EF4444">+${sh.overtimeMinutes} dk mesai</span>` : '';

        return `<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid ${isActive ? '#22C55E40' : 'var(--border-subtle)'};box-shadow:var(--shadow-md)${isActive ? ';border-left:3px solid #22C55E' : ''}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <img src="${staff.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${color}" alt="">
            <div style="flex:1;min-width:0">
              <div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${staff.name}</div>
              <span style="font:var(--fw-medium) 10px/1 var(--font);color:${color}">${BIZ_ROLE_LABELS[staff.role]}</span>
            </div>
            ${_shiftStatusBadge(sh)}
          </div>
          <div style="display:flex;align-items:center;gap:12px;padding-top:8px;border-top:1px solid var(--border-subtle)">
            <div style="display:flex;align-items:center;gap:4px">
              <iconify-icon icon="solar:calendar-minimalistic-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>
              <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">${dateLabel}</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px">
              <iconify-icon icon="solar:clock-circle-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>
              <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">${sh.startTime} - ${sh.endTime}</span>
            </div>
            ${sh.actualStart ? `<div style="display:flex;align-items:center;gap:4px">
              <iconify-icon icon="solar:login-3-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>
              <span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${sh.actualStart}${sh.actualEnd ? ' → ' + sh.actualEnd : ''}</span>
            </div>` : ''}
          </div>
          ${overtime ? `<div style="margin-top:6px">${overtime}</div>` : ''}
          ${sh.notes ? `<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">${escHtml(sh.notes)}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`}

    ${isOwnerOrManager ? `
    <div onclick="bizOpenAddShift()" style="margin-top:16px;background:var(--primary);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
      <iconify-icon icon="solar:clock-circle-bold" style="font-size:18px;color:#fff"></iconify-icon>
      <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Vardiya Ekle</span>
    </div>` : ''}
  `;
}

/* ═══ ADD SHIFT MODAL ═══ */
function bizOpenAddShift() {
  const staff = getBranchStaff().filter(s => s.role !== 'owner');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const modal = document.createElement('div');
  modal.id = 'bizAddShiftModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;width:100%;max-width:360px;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-lg)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Vardiya Ekle</span>
        <div onclick="document.getElementById('bizAddShiftModal').remove()" style="cursor:pointer"><iconify-icon icon="solar:close-circle-linear" style="font-size:24px;color:var(--text-muted)"></iconify-icon></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Personel</label>
          <select id="shiftStaffSelect" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box;-webkit-appearance:none">
            <option value="">Seçin...</option>
            ${staff.map(s => `<option value="${s.id}">${s.name} — ${BIZ_ROLE_LABELS[s.role]}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Tarih</label>
          <input id="shiftDate" type="date" value="${tomorrow}" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
        <div style="display:flex;gap:10px">
          <div style="flex:1">
            <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Başlangıç</label>
            <input id="shiftStart" type="time" value="08:00" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
          </div>
          <div style="flex:1">
            <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Bitiş</label>
            <input id="shiftEnd" type="time" value="16:00" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
          </div>
        </div>
        <div>
          <label style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);display:block;margin-bottom:6px">Not</label>
          <input id="shiftNotes" type="text" placeholder="İsteğe bağlı" style="width:100%;padding:10px 14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);background:var(--bg-phone);outline:none;box-sizing:border-box">
        </div>
      </div>
      <div onclick="bizSaveNewShift()" style="margin-top:20px;background:var(--primary);border-radius:var(--r-lg);padding:12px;text-align:center;cursor:pointer">
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Kaydet</span>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

function bizSaveNewShift() {
  const staffId = document.getElementById('shiftStaffSelect').value;
  const date = document.getElementById('shiftDate').value;
  const startTime = document.getElementById('shiftStart').value;
  const endTime = document.getElementById('shiftEnd').value;
  const notes = document.getElementById('shiftNotes').value.trim();

  if (!staffId || !date || !startTime || !endTime) {
    alert('Lütfen tüm alanları doldurun.');
    return;
  }

  const newId = 'shift_' + String(BIZ_SHIFTS.length + 1).padStart(3, '0');
  BIZ_SHIFTS.push({
    id: newId,
    staffId: staffId,
    branchId: bizActiveBranch,
    date: date,
    startTime: startTime,
    endTime: endTime,
    actualStart: null,
    actualEnd: null,
    status: 'planned',
    overtimeMinutes: 0,
    notes: notes || 'Yeni vardiya'
  });

  const modal = document.getElementById('bizAddShiftModal');
  if (modal) modal.remove();

  // Refresh shifts tab
  const container = document.getElementById('bizStaffMainContent');
  if (container && _staffListTab === 'shifts') {
    container.innerHTML = _renderShiftsTab();
  }
}

/* ═══ STAFF DETAIL ═══ */
function openBizStaffDetail(staffId) {
  const s = BIZ_STAFF.find(st => st.id === staffId);
  if (!s) return;

  const roleColors = {
    owner: '#8B5CF6', manager: '#3B82F6', chef: '#F59E0B', waiter: '#22C55E', cashier: '#06B6D4', courier: '#EF4444'
  };
  const color = roleColors[s.role] || '#6B7280';

  const overlay = createBizOverlay('bizStaffDetailOverlay', s.name, _renderStaffDetail(s, color));
  document.getElementById('bizPhone').appendChild(overlay);
}

function _renderStaffDetail(s, color) {
  const isChef = s.role === 'chef';

  // Kitchen station badges for chef
  let stationsHtml = '';
  if (isChef) {
    const assigned = s.kitchenCategories || [];
    stationsHtml = `
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
          <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Mutfak İstasyonları</div>
          <div onclick="bizEditStaffStations('${s.id}')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:4px">
            <iconify-icon icon="solar:pen-linear" style="font-size:14px"></iconify-icon> Düzenle
          </div>
        </div>
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:8px">
          ${assigned.length > 0 ? assigned.map(kcId => {
            const kc = BIZ_KITCHEN_CATEGORIES.find(c => c.id === kcId);
            if (!kc) return '';
            return `<div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:var(--r-lg);background:${kc.color}10;border:1px solid ${kc.color}30">
              <iconify-icon icon="${kc.icon}" style="font-size:16px;color:${kc.color}"></iconify-icon>
              <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:${kc.color}">${kc.name}</span>
            </div>`;
          }).join('') : `<div style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Henüz istasyon atanmadı</div>`}
        </div>
      </div>`;
  }

  // Shifts for this staff member (last 5)
  const shifts = _getStaffShifts(s.id).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)).slice(0, 5);
  const today = new Date().toISOString().slice(0, 10);

  const shiftsHtml = `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle)">
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Vardiyalar</div>
      </div>
      ${shifts.length > 0 ? shifts.map(sh => {
        const dateLabel = sh.date === today ? 'Bugün' : new Date(sh.date + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        return `<div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px">
            <iconify-icon icon="solar:clock-circle-linear" style="font-size:16px;color:${sh.status === 'active' ? '#22C55E' : 'var(--text-muted)'}"></iconify-icon>
            <div>
              <div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${sh.startTime} - ${sh.endTime}</div>
              <div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">${dateLabel}${sh.overtimeMinutes > 0 ? ` · +${sh.overtimeMinutes} dk mesai` : ''}</div>
            </div>
          </div>
          ${_shiftStatusBadge(sh)}
        </div>`;
      }).join('') : `<div style="padding:14px 16px;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Vardiya kaydı yok</div>`}
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <!-- Profile Card -->
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;border:1px solid var(--border-subtle);box-shadow:var(--shadow-lg);text-align:center">
        <img src="${s.avatar}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid ${color};margin-bottom:12px" alt="">
        <div style="font:var(--fw-bold) var(--fs-xl)/1 var(--font);color:var(--text-primary);margin-bottom:6px">${s.name}</div>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:4px 12px;border-radius:var(--r-full);background:${color}15;color:${color};display:inline-block">${BIZ_ROLE_LABELS[s.role]}</span>
      </div>

      <!-- Contact Info -->
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px">
          <iconify-icon icon="solar:phone-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${s.phone}</span>
        </div>
        <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px">
          <iconify-icon icon="solar:letter-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${s.email}</span>
        </div>
        <div style="padding:14px 16px;display:flex;align-items:center;gap:10px">
          <iconify-icon icon="solar:calendar-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>
          <span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary)">İşe Giriş: ${new Date(s.hireDate).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      ${stationsHtml}
      ${shiftsHtml}

      ${(bizCurrentRole === 'owner' || bizCurrentRole === 'manager') ? `
      <!-- Vardiya ve İzin Yönet -->
      <div onclick="openBizStaffShiftsEditor('${s.id}')" style="background:linear-gradient(135deg, var(--primary-soft), var(--bg-phone));border-radius:var(--r-xl);border:1px solid var(--primary-soft);box-shadow:var(--shadow-md);padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:transform 0.15s ease">
        <div style="width:42px;height:42px;border-radius:var(--r-lg);background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <iconify-icon icon="solar:calendar-mark-linear" style="font-size:22px;color:#fff"></iconify-icon>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:3px">
          <span style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">Vardiyalar ve İzinler</span>
          <span style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">Rutin program, ek vardiya ve izin yönetimi</span>
        </div>
        <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>
      </div>
      ` : ''}

      <!-- Status -->
      <div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);padding:14px 16px;display:flex;justify-content:space-between;align-items:center">
        <span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Durum</span>
        <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);padding:4px 12px;border-radius:var(--r-full);color:${s.status === 'active' ? '#22C55E' : '#EF4444'};background:${s.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}">${s.status === 'active' ? 'Aktif' : 'Pasif'}</span>
      </div>
    </div>
  `;
}

/* ═══ EDIT KITCHEN STATIONS ═══ */
function bizEditStaffStations(staffId) {
  const s = BIZ_STAFF.find(st => st.id === staffId);
  if (!s) return;

  const assigned = s.kitchenCategories || [];

  const modal = document.createElement('div');
  modal.id = 'bizStationEditModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:20px;width:100%;max-width:360px;box-shadow:var(--shadow-lg)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">İstasyon Ata</span>
        <div onclick="document.getElementById('bizStationEditModal').remove()" style="cursor:pointer"><iconify-icon icon="solar:close-circle-linear" style="font-size:24px;color:var(--text-muted)"></iconify-icon></div>
      </div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-bottom:14px">${s.name} için mutfak istasyonlarını seçin:</div>
      <div style="display:flex;flex-direction:column;gap:8px" id="bizStationCheckboxes">
        ${BIZ_KITCHEN_CATEGORIES.map(kc => {
          const checked = assigned.includes(kc.id);
          return `<div onclick="bizToggleStationCheck(this,'${kc.id}')" data-station="${kc.id}" data-checked="${checked}" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-lg);border:1px solid ${checked ? kc.color : 'var(--border-subtle)'};background:${checked ? kc.color + '10' : 'var(--bg-phone)'};cursor:pointer">
            <div style="width:22px;height:22px;border-radius:var(--r-md);border:2px solid ${checked ? kc.color : 'var(--text-muted)'};background:${checked ? kc.color : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
              ${checked ? `<iconify-icon icon="solar:check-read-linear" style="font-size:14px;color:#fff"></iconify-icon>` : ''}
            </div>
            <iconify-icon icon="${kc.icon}" style="font-size:18px;color:${kc.color}"></iconify-icon>
            <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${kc.name}</span>
          </div>`;
        }).join('')}
      </div>
      <div onclick="bizSaveStaffStations('${staffId}')" style="margin-top:20px;background:var(--primary);border-radius:var(--r-lg);padding:12px;text-align:center;cursor:pointer">
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Kaydet</span>
      </div>
    </div>
  `;

  document.getElementById('bizPhone').appendChild(modal);
}

function bizToggleStationCheck(el, stationId) {
  const isChecked = el.dataset.checked === 'true';
  const kc = BIZ_KITCHEN_CATEGORIES.find(c => c.id === stationId);
  if (!kc) return;

  el.dataset.checked = !isChecked;
  el.style.border = !isChecked ? `1px solid ${kc.color}` : '1px solid var(--border-subtle)';
  el.style.background = !isChecked ? kc.color + '10' : 'var(--bg-phone)';

  const checkbox = el.querySelector('div:first-child');
  checkbox.style.border = `2px solid ${!isChecked ? kc.color : 'var(--text-muted)'}`;
  checkbox.style.background = !isChecked ? kc.color : 'transparent';
  checkbox.innerHTML = !isChecked ? `<iconify-icon icon="solar:check-read-linear" style="font-size:14px;color:#fff"></iconify-icon>` : '';
}

function bizSaveStaffStations(staffId) {
  const s = BIZ_STAFF.find(st => st.id === staffId);
  if (!s) return;

  const checkboxes = document.querySelectorAll('#bizStationCheckboxes > div');
  const selected = [];
  checkboxes.forEach(el => {
    if (el.dataset.checked === 'true') selected.push(el.dataset.station);
  });

  s.kitchenCategories = selected;

  // Close modal
  const modal = document.getElementById('bizStationEditModal');
  if (modal) modal.remove();

  // Refresh detail overlay
  const detailOverlay = document.getElementById('bizStaffDetailOverlay');
  if (detailOverlay) {
    detailOverlay.remove();
    openBizStaffDetail(staffId);
  }
}

/* ═══ ADD STAFF (INVITE) FLOW ═══
 * Owner or Şube Müdürü clicks "Personel Ekle" → modal asks for ad/soyad,
 * rol, telefon, e-posta. On submit, system generates a username & password,
 * "sends" them via SMS/E-posta, and the new credential is saved into
 * BIZ_INVITES so the new employee can log in via Settings →
 * "Bir İşletmede Çalışıyorum".
 *
 * Permission rules:
 *   - owner: can assign any role across any branch (defaults to current branch).
 *   - manager (Şube Müdürü): can only assign staff to OWN branch and CANNOT
 *     create owners or other managers.
 */
function _bizCanInviteStaff() {
  return bizCurrentRole === 'owner' || bizCurrentRole === 'manager';
}

function _bizAssignableRoles() {
  // Task spec roles: Garson, Kurye, Şube Müdürü, Koordinatör, Mutfak Sorumlusu
  if (bizCurrentRole === 'owner') {
    return ['waiter','courier','manager','coordinator','chef'];
  }
  if (bizCurrentRole === 'manager') {
    // Managers cannot create owner OR other managers
    return ['waiter','courier','coordinator','chef'];
  }
  return [];
}

function _bizGenerateCredentials(name) {
  const slug = (name || 'kullanici')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g')
    .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,'').slice(0,20) || 'kullanici';
  const suffix = Math.floor(100 + Math.random() * 900);
  const username = `${slug}.${suffix}`;
  // Password: capitalised 3-letter prefix + 4 digits, e.g. Lez4821
  const prefix = (slug.replace(/[^a-z]/g,'').slice(0,3) || 'usr');
  const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  const digits = Math.floor(1000 + Math.random() * 9000);
  return { username, password: `${cap}${digits}` };
}

function openBizAddStaff() {
  if (!_bizCanInviteStaff()) return;

  const roles = _bizAssignableRoles();
  // Owner can pick branch; manager is locked to own branch
  const branches = (typeof BIZ_BRANCHES !== 'undefined')
    ? BIZ_BRANCHES.filter(b => b.businessId === (bizCurrentEmployment ? bizCurrentEmployment.businessId : 'bus_001'))
    : [];
  const lockedBranchId = bizCurrentRole === 'manager' ? bizActiveBranch : null;

  const modal = document.createElement('div');
  modal.id = 'bizAddStaffModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;padding:18px 18px max(env(safe-area-inset-bottom),18px);max-height:92vh;overflow:auto;box-shadow:0 -8px 30px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:var(--r-lg);background:var(--primary)15;display:flex;align-items:center;justify-content:center">
            <iconify-icon icon="solar:user-plus-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>
          </div>
          <div>
            <div style="font:var(--fw-semibold) var(--fs-lg)/1.1 var(--font);color:var(--text-primary)">Personel Ekle</div>
            <div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:2px">Bilgiler doğrultusunda kişiye SMS ve e-posta ile giriş bilgileri gönderilir</div>
          </div>
        </div>
        <div class="btn-icon" onclick="document.getElementById('bizAddStaffModal').remove()" style="width:32px;height:32px;flex-shrink:0">
          <iconify-icon icon="solar:close-circle-linear" style="font-size:18px"></iconify-icon>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">İsim Soyisim</span>
          <input id="invName" type="text" placeholder="Örn. Mehmet Yıldız" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none">
        </label>

        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Telefon Numarası</span>
          <input id="invPhone" type="tel" inputmode="numeric" placeholder="+90 555 000 00 00" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none">
        </label>

        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Mail Adresi</span>
          <input id="invEmail" type="email" placeholder="ornek@firma.com" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none">
        </label>

        <label style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Rolü</span>
          <select id="invRole" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none;-webkit-appearance:none;appearance:none;background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236B7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>');background-repeat:no-repeat;background-position:right 12px center;padding-right:38px">
            <option value="" disabled selected>Seçiniz</option>
            ${roles.map(r => `<option value="${r}">${BIZ_ROLE_LABELS[r] || r}</option>`).join('')}
          </select>
        </label>

        <div style="display:flex;flex-direction:column;gap:6px">
          <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">Şube</span>
          ${lockedBranchId ? `
            <div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;display:flex;align-items:center;gap:8px">
              <iconify-icon icon="solar:lock-keyhole-bold" style="font-size:14px;color:var(--text-muted)"></iconify-icon>
              <span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">${escHtml(branches.find(b=>b.id===lockedBranchId)?.name || 'Şube')}</span>
              <span style="margin-left:auto;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Sadece kendi şubeniz</span>
            </div>
            <input type="hidden" id="invBranch" value="${lockedBranchId}">
          ` : `
            <select id="invBranch" style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px 14px;font:var(--fw-regular) var(--fs-md)/1 var(--font);color:var(--text-primary);outline:none">
              ${branches.map(b => `<option value="${b.id}" ${b.id === bizActiveBranch ? 'selected' : ''}>${escHtml(b.name)}</option>`).join('')}
            </select>
          `}
        </div>

        <div onclick="_bizSubmitInvite()" style="margin-top:6px;background:var(--primary);border-radius:var(--r-xl);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
          <iconify-icon icon="solar:plain-bold" style="font-size:18px;color:#fff"></iconify-icon>
          <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Gönder</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function _bizSubmitInvite() {
  const name  = (document.getElementById('invName').value || '').trim();
  const phone = (document.getElementById('invPhone').value || '').trim();
  const email = (document.getElementById('invEmail').value || '').trim();
  const role  = document.getElementById('invRole').value;
  const branchId = document.getElementById('invBranch').value;

  if (!name || !phone || !email || !role || !branchId) {
    alert('Lütfen tüm alanları doldurun.');
    return;
  }
  if (!_bizAssignableRoles().includes(role)) {
    alert('Bu rolü atama yetkiniz bulunmuyor.');
    return;
  }
  if (bizCurrentRole === 'manager' && branchId !== bizActiveBranch) {
    alert('Şube müdürü olarak yalnızca kendi şubenize personel ekleyebilirsiniz.');
    return;
  }

  const businessId = bizCurrentEmployment ? bizCurrentEmployment.businessId : 'bus_001';
  const businessName = bizCurrentEmployment ? bizCurrentEmployment.businessName : 'Lezzet Mutfak';
  const branch = (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.find(b => b.id === branchId) : null;
  const creds = _bizGenerateCredentials(name);
  const inviterId = (typeof getCurrentBizStaff === 'function' && getCurrentBizStaff()) ? getCurrentBizStaff().id : (bizCurrentRole === 'owner' ? 'staff_001' : null);

  const invite = {
    id: 'inv_' + Date.now(),
    username: creds.username,
    password: creds.password,
    name, phone, email, role,
    businessId, businessName,
    branchId, branchName: branch ? branch.name : '',
    invitedBy: inviterId,
    invitedAt: new Date().toISOString(),
    status: 'pending'
  };
  if (typeof BIZ_INVITES !== 'undefined') BIZ_INVITES.push(invite);

  // Also create a BIZ_STAFF entry so the new person appears in the personnel list immediately
  const newStaffId = 'staff_' + Date.now();
  const avatarSeed = Math.floor(Math.random() * 70) + 1;
  if (typeof BIZ_STAFF !== 'undefined') {
    BIZ_STAFF.push({
      id: newStaffId,
      businessId, branchId,
      name, phone, email,
      avatar: `https://api.pravatar.cc/img?img=${avatarSeed}`,
      role,
      roleLabel: BIZ_ROLE_LABELS[role] || role,
      permissions: [],
      status: 'pending', // becomes 'active' after first login
      hireDate: new Date().toISOString().slice(0,10)
    });
  }
  invite.staffId = newStaffId;

  // Close form and show success card with credentials
  const form = document.getElementById('bizAddStaffModal');
  if (form) form.remove();
  _bizShowInviteSent(invite);

  // Refresh staff list if open
  const container = document.getElementById('bizStaffMainContent');
  if (container) container.innerHTML = _renderStaffTabContent();
}

function _bizShowInviteSent(invite) {
  const modal = document.createElement('div');
  modal.id = 'bizInviteSentModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div style="width:100%;max-width:380px;background:var(--bg-page);border-radius:var(--r-2xl);padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.3)">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:16px">
        <div style="width:60px;height:60px;border-radius:50%;background:#22C55E15;display:flex;align-items:center;justify-content:center">
          <iconify-icon icon="solar:check-circle-bold" style="font-size:36px;color:#22C55E"></iconify-icon>
        </div>
        <div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);text-align:center">Davet Gönderildi</div>
        <div style="font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary);text-align:center">
          Kullanıcıya davet formu gönderildi. Kullanıcının mail adresine kullanıcı adı ve şifresi gönderilmiştir. Kullanıcı hesabım sayfasında işletmede çalışıyorum kısmından giriş yapabilir.
        </div>
      </div>

      <div onclick="document.getElementById('bizInviteSentModal').remove()" style="background:var(--primary);border-radius:var(--r-xl);padding:13px;text-align:center;cursor:pointer">
        <span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Tamam</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

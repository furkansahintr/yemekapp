/* ═══ BIZ-APP.JS — Core Orchestrator ═══ */

/* ═══════════════════════════════════════════════════════════
   BIZ-APP.JS — Business Panel Core Orchestrator
   YemekApp Business Management Module
   ═══════════════════════════════════════════════════════════ */

/* ═══ APP MODE & STATE VARIABLES ═══ */
let APP_MODE = 'user'; // 'user' | 'business'
let bizCurrentView = 'bizHome';
let bizActiveBranch = 'b1';
let bizCurrentRole = 'owner'; // active role in business panel
let bizCurrentEmployment = null; // active employment record

/* ═══ BUSINESS ONBOARDING ═══ */
function obBizLogin() {
  AUTH.login({
    name: BIZ_BUSINESS.owner.name,
    username: 'lezzetmutfak',
    phone: BIZ_BUSINESS.owner.phone,
    email: BIZ_BUSINESS.owner.email,
    allergens: [],
    guest: false,
    isBusiness: true,
    businessId: BIZ_BUSINESS.id
  });
  APP_MODE = 'business';
  bizCurrentRole = 'owner';
  bizCurrentEmployment = null;
  obEnterBizApp();
}

function obBizFinish() {
  AUTH.login({
    name: BIZ_BUSINESS.owner.name,
    username: 'lezzetmutfak',
    phone: BIZ_BUSINESS.owner.phone,
    email: BIZ_BUSINESS.owner.email,
    allergens: [],
    guest: false,
    isBusiness: true,
    businessId: BIZ_BUSINESS.id
  });
  APP_MODE = 'business';
  bizCurrentRole = 'owner';
  bizCurrentEmployment = null;
  obEnterBizApp();
}

function obEnterBizApp() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('phone').style.display = 'none';
  document.getElementById('bizPhone').style.display = '';
  initBizApp();
}

/* ═══ BIZ APP INIT ═══ */
function initBizApp() {
  applyRoleToUI();
  renderBizHome();
}

/* ═══ ROLE-BASED ENTRY FROM PROFILE ═══ */
function switchToBizAccount(employmentId) {
  const emp = USER_EMPLOYMENTS.find(e => e.id === employmentId);
  if (!emp) return;

  bizCurrentEmployment = emp;
  bizCurrentRole = emp.role;
  bizActiveBranch = emp.branchId;
  APP_MODE = 'business';

  // Update header with business name
  const headerName = document.getElementById('bizHeaderName');
  if (headerName) headerName.textContent = emp.businessName;

  // Update branch label
  const branchLabel = document.getElementById('bizBranchLabel');
  if (branchLabel) branchLabel.textContent = emp.branchName;

  // Show business phone, hide user phone
  document.getElementById('phone').style.display = 'none';
  document.getElementById('bizPhone').style.display = '';

  // Update role indicator in header
  updateBizRoleIndicator();

  // Show return-to-user button for employee entry (not for onboarding owner entry)
  const returnBtn = document.getElementById('bizReturnBtn');
  if (returnBtn) returnBtn.style.display = '';

  initBizApp();
  bizSwitchTab('bizHome');
}

/* ═══ RETURN TO PERSONAL ACCOUNT ═══ */
function returnToUserAccount() {
  APP_MODE = 'user';
  bizCurrentRole = 'owner';
  bizCurrentEmployment = null;
  document.getElementById('bizPhone').style.display = 'none';
  document.getElementById('phone').style.display = '';
  const returnBtn = document.getElementById('bizReturnBtn');
  if (returnBtn) returnBtn.style.display = 'none';
  switchTab('profile');
}

/* ═══ ROLE INDICATOR IN HEADER ═══ */
function updateBizRoleIndicator() {
  let badge = document.getElementById('bizRoleBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'bizRoleBadge';
    const selector = document.getElementById('bizHeaderBranchSelector');
    if (selector) selector.parentElement.appendChild(badge);
  }
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  if (perms && bizCurrentRole !== 'owner') {
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:3px;margin-top:2px;padding:2px 8px;border-radius:var(--r-full);font:var(--fw-medium) 9px/1 var(--font);color:' + perms.color + ';background:' + perms.color + '12';
    badge.innerHTML = '<iconify-icon icon="solar:shield-user-bold" style="font-size:10px"></iconify-icon> ' + perms.label;
  } else {
    badge.style.display = 'none';
  }
}

/* ═══ ROLE PERMISSION HELPERS ═══ */
function bizHasPermission(action) {
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  if (!perms) return false;
  if (perms.actions.includes('manage_settings')) return true; // owner-level
  return perms.actions.includes(action);
}

function bizCanSeeTile(tileId) {
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  return perms ? perms.tiles.includes(tileId) : false;
}

function bizCanSeeScreen(screenId) {
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  return perms ? perms.screens.includes(screenId) : false;
}

function bizCanSeeNavTab(tabId) {
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  return perms ? perms.navTabs.includes(tabId) : false;
}

/* ═══ APPLY ROLE TO UI ═══ */
function applyRoleToUI() {
  // Filter nav tabs
  const navTabs = document.querySelectorAll('#bizAppNav .ni');
  const tabKeys = ['bizHome','bizDashboard','bizAI','bizCommunity','bizMyBusiness'];
  navTabs.forEach((tab, i) => {
    if (tabKeys[i]) {
      tab.style.display = bizCanSeeNavTab(tabKeys[i]) ? '' : 'none';
    }
  });

  // Update role badge
  updateBizRoleIndicator();

  // Show/hide branch picker for non-owner roles (they're locked to their branch)
  const branchSelector = document.getElementById('bizHeaderBranchSelector');
  if (branchSelector) {
    if (bizCurrentRole === 'owner' || bizCurrentRole === 'manager') {
      branchSelector.style.cursor = 'pointer';
      branchSelector.onclick = toggleBizBranchPicker;
    } else {
      branchSelector.style.cursor = 'default';
      branchSelector.onclick = null;
      // Remove the dropdown arrow for locked roles
    }
  }
}

/* ═══ BUSINESS TAB SWITCHING ═══ */
const bizNavMap = {
  bizHome: 'bizNavHome',
  bizDashboard: 'bizNavDashboard',
  bizAI: 'bizNavAI',
  bizCommunity: 'bizNavCommunity',
  bizMyBusiness: 'bizNavMyBusiness'
};
const bizScreenMap = {
  bizHome: 'screenBizHome',
  bizDashboard: 'screenBizDashboard',
  bizAI: 'screenBizAI',
  bizCommunity: 'screenBizCommunity',
  bizMyBusiness: 'screenBizMyBusiness'
};
const bizTitleMap = {
  bizHome: '',
  bizDashboard: 'Dashboard',
  bizAI: 'AI Asistan',
  bizCommunity: 'Topluluk',
  bizMyBusiness: 'İşletmem'
};

function bizSwitchTab(tab) {
  bizCurrentView = tab;

  // Hide all biz screens
  Object.values(bizScreenMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  // Show target screen
  const activeScreen = document.getElementById(bizScreenMap[tab]);
  if (activeScreen) activeScreen.classList.add('active');

  // Update header — hide only for myBusiness (own scroll page)
  const hideHeader = tab === 'bizMyBusiness';
  const bizAppHeader = document.getElementById('bizAppHeader');
  if (bizAppHeader) bizAppHeader.style.display = hideHeader ? 'none' : '';

  // Scroll to top
  const bizAppBody = document.getElementById('bizAppBody');
  if (bizAppBody) bizAppBody.scrollTop = 0;
  window.scrollTo(0, 0);

  // Update nav
  document.querySelectorAll('#bizAppNav .ni').forEach(n => {
    n.classList.remove('active');
    const ic = n.querySelector('iconify-icon');
    if (ic && n.dataset.icon) ic.setAttribute('icon', n.dataset.icon);
  });
  const activeNav = document.getElementById(bizNavMap[tab]);
  if (activeNav) {
    activeNav.classList.add('active');
    const ic = activeNav.querySelector('iconify-icon');
    if (ic && activeNav.dataset.iconActive) ic.setAttribute('icon', activeNav.dataset.iconActive);
  }

  // Trigger renders
  if (tab === 'bizHome') renderBizHome();
  else if (tab === 'bizDashboard') renderBizDashboard();
  else if (tab === 'bizCommunity') renderBizCommunity();
  else if (tab === 'bizMyBusiness') renderBizMyBusiness();
}

/* ═══ LOGOUT OVERRIDE ═══ */
const originalLogout = AUTH.logout.bind(AUTH);
AUTH.logout = function() {
  APP_MODE = 'user';
  bizCurrentView = 'bizHome';
  this.isLoggedIn = false;
  this.user = null;
  document.getElementById('phone').style.display = 'none';
  document.getElementById('bizPhone').style.display = 'none';
  document.getElementById('onboarding').style.display = 'flex';
  obGoTo('obWelcome');
};

/* ═══ HELPERS: Get Current Branch ═══ */
function getBizBranch() {
  return BIZ_BRANCHES.find(b => b.id === bizActiveBranch) || BIZ_BRANCHES[0];
}

function getBranchTables() {
  return BIZ_TABLES.filter(t => t.branchId === bizActiveBranch);
}

function getBranchOrders() {
  return BIZ_ORDERS.filter(o => o.branchId === bizActiveBranch);
}

function getBranchStaff() {
  return BIZ_STAFF.filter(s => s.branchId === bizActiveBranch || s.role === 'owner');
}

function getBranchCalls() {
  return BIZ_WAITER_CALLS.filter(c => c.branchId === bizActiveBranch);
}

/* ═══ BRANCH PICKER ═══ */
let bizBranchPickerOpen = false;

function toggleBizBranchPicker() {
  if (bizBranchPickerOpen) {
    closeBizBranchPicker();
    return;
  }

  bizBranchPickerOpen = true;
  let existing = document.getElementById('bizBranchDropdown');
  if (existing) existing.remove();

  let dd = document.createElement('div');
  dd.id = 'bizBranchDropdown';
  dd.style.cssText = 'position:absolute;top:100%;left:var(--app-px);right:var(--app-px);background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-lg);z-index:50;overflow:hidden;margin-top:4px';

  // "Tüm İşletmeler" — aggregate view (only for owner)
  if (bizCurrentRole === 'owner') {
    const isAllActive = bizActiveBranch === 'all';
    const openCount = BIZ_BRANCHES.filter(b => b.status === 'open').length;
    dd.innerHTML += `
      <div onclick="selectBizBranch('all')" style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;background:${isAllActive ? 'var(--primary-soft)' : 'transparent'};border-bottom:1px solid var(--border-subtle)">
        <iconify-icon icon="solar:buildings-2-${isAllActive ? 'bold' : 'linear'}" style="font-size:20px;color:${isAllActive ? 'var(--primary)' : '#8B5CF6'}"></iconify-icon>
        <div style="flex:1">
          <div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Tüm İşletmeler</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">${BIZ_BRANCHES.length} şube · ${openCount} açık</div>
        </div>
        <iconify-icon icon="solar:chart-2-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>
      </div>`;
  }

  BIZ_BRANCHES.forEach(b => {
    const isActive = b.id === bizActiveBranch;
    dd.innerHTML += `
      <div onclick="selectBizBranch('${b.id}')" style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;background:${isActive ? 'var(--primary-soft)' : 'transparent'}">
        <iconify-icon icon="solar:shop-2-${isActive ? 'bold' : 'linear'}" style="font-size:20px;color:${isActive ? 'var(--primary)' : 'var(--text-secondary)'}"></iconify-icon>
        <div style="flex:1">
          <div style="font:var(--fw-medium) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">${b.name}</div>
          <div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">${b.address}</div>
        </div>
        <span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);padding:3px 8px;border-radius:var(--r-full);${b.status === 'open' ? 'color:#22c55e;background:rgba(34,197,94,0.1)' : 'color:#ef4444;background:rgba(239,68,68,0.1)'}">${b.status === 'open' ? 'Açık' : 'Kapalı'}</span>
      </div>`;
  });

  const header = document.getElementById('bizAppHeader');
  if (header) {
    header.style.position = 'relative';
    header.appendChild(dd);
  }

  setTimeout(() => document.addEventListener('click', closeBizBranchPickerOutside, { once: true }), 10);
}

function closeBizBranchPickerOutside(e) {
  if (!e.target.closest('#bizBranchDropdown') && !e.target.closest('#bizHeaderBranchSelector')) closeBizBranchPicker();
}

function closeBizBranchPicker() {
  bizBranchPickerOpen = false;
  const dd = document.getElementById('bizBranchDropdown');
  if (dd) dd.remove();
}

function selectBizBranch(branchId) {
  bizActiveBranch = branchId;
  closeBizBranchPicker();

  if (branchId === 'all') {
    document.getElementById('bizBranchLabel').textContent = 'Tüm İşletmeler';
    const statusEl = document.getElementById('bizBranchStatus');
    if (statusEl) {
      const openCount = BIZ_BRANCHES.filter(b => b.status === 'open').length;
      statusEl.textContent = openCount + '/' + BIZ_BRANCHES.length + ' Açık';
      statusEl.style.color = '#8B5CF6';
      statusEl.style.background = 'rgba(139,92,246,0.1)';
    }
    // Switch to aggregate dashboard
    renderBizHome();
    return;
  }

  const branch = getBizBranch();
  document.getElementById('bizBranchLabel').textContent = branch.name;
  const statusEl = document.getElementById('bizBranchStatus');
  if (statusEl) {
    statusEl.textContent = branch.status === 'open' ? 'Açık' : 'Kapalı';
    statusEl.style.color = branch.status === 'open' ? '#22c55e' : '#ef4444';
    statusEl.style.background = branch.status === 'open' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
  }
  renderBizHome();
}

/* ═══ ROLE GUARD (SHARED UTILITY) ═══ */
function bizRoleGuard(screenId) {
  if (bizCanSeeScreen(screenId)) return true;
  const perms = BIZ_ROLE_PERMISSIONS[bizCurrentRole];
  const roleName = perms ? perms.label : bizCurrentRole;
  const overlay = createBizOverlay('bizAccessDenied', 'Erişim Kısıtlı', `
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px 20px;text-align:center">
      <div style="width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center">
        <iconify-icon icon="solar:shield-warning-bold" style="font-size:32px;color:#EF4444"></iconify-icon>
      </div>
      <div style="font:var(--fw-semibold) var(--fs-lg)/1.3 var(--font);color:var(--text-primary)">Bu Ekrana Erişiminiz Yok</div>
      <div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted);max-width:280px">
        <strong>${escHtml(roleName)}</strong> rolü ile bu bölüme erişim yetkiniz bulunmamaktadır. Daha fazla yetki için işletme sahibine başvurun.
      </div>
    </div>
  `);
  document.getElementById('bizPhone').appendChild(overlay);
  return false;
}

/* ═══ CREATE BIZ OVERLAY (SHARED UTILITY) ═══ */
function createBizOverlay(id, title, content) {
  // Remove existing
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-page);z-index:60;display:flex;flex-direction:column;overflow:hidden';
  overlay.innerHTML = `
    <div style="padding:max(env(safe-area-inset-top),16px) var(--app-px) 14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);flex-shrink:0">
      <div class="btn-icon" onclick="document.getElementById('${id}').remove()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>
      <span style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary);flex:1">${title}</span>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px var(--app-px)">${content}</div>
  `;
  return overlay;
}

/* ═══════════════════════════════════════════════════════════
   ADMIN-APP.JS — Admin Panel Core Orchestrator
   ═══════════════════════════════════════════════════════════ */

/* ═══ ADMIN LOGIN ═══ */
function obAdminLogin() {
  AUTH.login({
    name: 'Admin',
    username: 'admin',
    phone: '+905550000000',
    email: 'admin@superresto.com',
    allergens: [],
    guest: false,
    isAdmin: true
  });
  APP_MODE = 'admin';
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('phone').style.display = 'none';
  document.getElementById('bizPhone').style.display = 'none';
  document.getElementById('adminPhone').style.display = '';
  initAdminApp();
}

/* ═══ ADMIN LOGOUT ═══ */
function adminLogout() {
  APP_MODE = 'user';
  document.getElementById('adminPhone').style.display = 'none';
  document.getElementById('onboarding').style.display = 'flex';
  obGoTo('obWelcome');
}

/* ═══ ADMIN INIT ═══ */
function initAdminApp() {
  adminSwitchTab('adminDashboard');
}

/* ═══ TAB SWITCHING ═══ */
var adminCurrentView = 'adminDashboard';

var _adminScreenMap = {
  adminDashboard: 'screenAdminDashboard',
  adminRecipes: 'screenAdminRecipes',
  adminUsers: 'screenAdminUsers',
  adminOrders: 'screenAdminOrders',
  adminSettings: 'screenAdminSettings'
};

var _adminNavMap = {
  adminDashboard: 'adminNavDashboard',
  adminRecipes: 'adminNavRecipes',
  adminUsers: 'adminNavUsers',
  adminOrders: 'adminNavOrders',
  adminSettings: 'adminNavSettings'
};

function adminSwitchTab(tab) {
  adminCurrentView = tab;

  Object.values(_adminScreenMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  var active = document.getElementById(_adminScreenMap[tab]);
  if (active) active.classList.add('active');

  document.querySelectorAll('#adminAppNav .ni').forEach(function(n) {
    n.classList.remove('active');
    var ic = n.querySelector('iconify-icon');
    if (ic && n.dataset.icon) ic.setAttribute('icon', n.dataset.icon);
  });
  var navEl = document.getElementById(_adminNavMap[tab]);
  if (navEl) {
    navEl.classList.add('active');
    var ic = navEl.querySelector('iconify-icon');
    if (ic && navEl.dataset.iconActive) ic.setAttribute('icon', navEl.dataset.iconActive);
  }

  var body = document.getElementById('adminAppBody');
  if (body) body.scrollTop = 0;

  if (tab === 'adminDashboard' && typeof renderAdminDashboard === 'function') renderAdminDashboard();
  else if (tab === 'adminRecipes' && typeof renderAdminRecipes === 'function') renderAdminRecipes();
  else if (tab === 'adminUsers' && typeof renderAdminUsers === 'function') renderAdminUsers();
  else if (tab === 'adminOrders' && typeof renderAdminOrders === 'function') renderAdminOrders();
  else if (tab === 'adminSettings' && typeof renderAdminSettings === 'function') renderAdminSettings();
}

/* ═══ NOTIFICATIONS (placeholder) ═══ */
function adminOpenNotifications() {
  _admToast('5 yeni bildirim');
}

/* ═══ TOAST ═══ */
function _admToast(msg, type) {
  var bg = type === 'ok' ? '#22C55E' : type === 'err' ? '#EF4444' : '#6366F1';
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:' + bg + ';color:#fff;padding:10px 20px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:999;white-space:nowrap;box-shadow:var(--shadow-lg)';
  t.textContent = msg;
  document.getElementById('adminPhone').appendChild(t);
  setTimeout(function() { t.remove(); }, 2500);
}

/* ═══ HELPERS ═══ */
function _admFmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function _admFmtTL(n) {
  return '₺' + _admFmt(n);
}

function _admDate(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function _admRelative(iso) {
  var diff = Date.now() - new Date(iso).getTime();
  var m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return m + ' dk önce';
  var h = Math.floor(m / 60);
  if (h < 24) return h + ' saat önce';
  var d = Math.floor(h / 24);
  return d + ' gün önce';
}

function _admInjectStyles() {
  if (document.getElementById('admStyles')) return;
  var s = document.createElement('style');
  s.id = 'admStyles';
  s.textContent = '\
    .adm-fadeIn { animation: admFadeIn .3s ease; }\
    @keyframes admFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }\
    .adm-sheet { animation: admSheetUp .3s ease; }\
    @keyframes admSheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }\
    #adminPhone .prof-overlay { z-index: 78; }\
  ';
  document.head.appendChild(s);
}

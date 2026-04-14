/* ═══ APP.JS — Core Orchestrator ═══ */

/* ═══ AUTH STATE ═══ */
const AUTH = {
  isLoggedIn: false,
  user: null,
  login(userData) {
    this.isLoggedIn = true;
    this.user = userData || { name: 'Furkan', username: 'furkan', phone: '+905551234548', email: 'furkan@email.com', allergens: [] };
  },
  logout() {
    this.isLoggedIn = false;
    this.user = null;
    document.getElementById('phone').style.display = 'none';
    document.getElementById('onboarding').style.display = 'flex';
    obGoTo('obWelcome');
    // Reset nav to home for next login
    switchTab('menu');
  },
  isGuest() { return this.isLoggedIn && this.user && this.user.guest === true; }
};

/* ═══ ONBOARDING ═══ */
function obGoTo(screenId) {
  document.querySelectorAll('.ob-screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

function obOtpNext(el) {
  if (el.value.length === 1 && el.nextElementSibling) el.nextElementSibling.focus();
}

function obSkip() {
  AUTH.login({ name: 'Misafir', username: 'misafir', phone: '', email: '', allergens: [], guest: true });
  obEnterApp();
}

function obFinish() {
  const allergens = [...document.querySelectorAll('.ob-allergen-chip.selected')].map(c => c.textContent.trim());
  const name = document.getElementById('regName')?.value || 'Furkan';
  const username = document.getElementById('regUsername')?.value || 'furkan';
  const phone = document.getElementById('regPhone')?.value || '+905551234548';
  const email = document.getElementById('regEmail')?.value || 'furkan@email.com';
  AUTH.login({ name, username, phone, email, allergens, guest: false });
  obEnterApp();
}

function obEnterApp() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('phone').style.display = '';
  if (!AUTH.isLoggedIn) AUTH.login();
  initApp();
}

/* ═══ INIT APP ═══ */
function initApp() {
  try {
    if (typeof renderMenu === 'function') renderMenu();
    else console.warn('[initApp] renderMenu not loaded yet');
  } catch (e) { console.error('[initApp] renderMenu failed:', e); }
  try {
    if (typeof renderKesfet === 'function') renderKesfet();
    else console.warn('[initApp] renderKesfet not loaded yet');
  } catch (e) { console.error('[initApp] renderKesfet failed:', e); }
  // Ensure the correct home-tab pane is visible
  try {
    const tT = document.getElementById('tabTarifler');
    const tR = document.getElementById('tabRestoranlar');
    if (tT) tT.style.display = activeHomeTab === 'tarifler' ? '' : 'none';
    if (tR) tR.style.display = activeHomeTab === 'restoranlar' ? '' : 'none';
  } catch (e) { console.error('[initApp] tab toggle failed:', e); }
}

/* ═══ CORE STATE ═══ */
let currentView = 'menu';
let isDark = false;
let activeHomeTab = 'tarifler';

try { if (typeof injectTokens === 'function') injectTokens(); } catch (e) { console.error('[app.js] injectTokens failed:', e); }

// Home Tabs
(function attachHomeTabs() {
  const el = document.getElementById('homeTabs');
  if (!el) { console.warn('[app.js] #homeTabs not in DOM yet'); return; }
  el.addEventListener('click', e => {
    const tab = e.target.closest('.home-tab');
    if (!tab) return;
    document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tabName = tab.dataset.tab;
    activeHomeTab = tabName;
    document.getElementById('tabTarifler').style.display = tabName === 'tarifler' ? '' : 'none';
    document.getElementById('tabRestoranlar').style.display = tabName === 'restoranlar' ? '' : 'none';
    if (tabName === 'tarifler') renderMenu();
    else renderRestoranlar();
  });
})();

/* ═══ THEME ═══ */
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  injectTokens();
  const icon = document.getElementById('themeIcon');
  if (icon) icon.setAttribute('icon', isDark ? 'solar:sun-bold' : 'solar:moon-linear');
  const label = document.getElementById('themeLabel');
  if (label) label.textContent = isDark ? 'Aydınlık Mod' : 'Karanlık Mod';
  const sw = document.getElementById('themeSwitch');
  const dot = document.getElementById('themeSwitchDot');
  if (sw && dot) {
    sw.style.background = isDark ? 'var(--primary)' : 'var(--glass-card-strong)';
    dot.style.left = isDark ? '18px' : '2px';
    dot.style.background = isDark ? '#fff' : 'var(--text-muted)';
  }
  // Also update settings panel toggle
  const sl = document.getElementById('settingsThemeLabel');
  if (sl) sl.textContent = isDark ? 'Aydınlık Mod' : 'Karanlık Mod';
  const ssw = document.getElementById('settingsThemeSwitch');
  const sdot = document.getElementById('settingsThemeSwitchDot');
  if (ssw && sdot) {
    ssw.style.background = isDark ? 'var(--primary)' : 'var(--glass-card-strong)';
    sdot.style.left = isDark ? '18px' : '2px';
    sdot.style.background = isDark ? '#fff' : 'var(--text-muted)';
  }
}

/* ═══ FULLSCREEN ═══ */
function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    document.getElementById('fullscreenIcon').setAttribute('icon', 'solar:quit-full-screen-linear');
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    document.getElementById('fullscreenIcon').setAttribute('icon', 'solar:full-screen-linear');
  }
}

document.addEventListener('fullscreenchange', () => {
  document.getElementById('fullscreenIcon').setAttribute('icon', document.fullscreenElement ? 'solar:quit-full-screen-linear' : 'solar:full-screen-linear');
});

/* ═══ NAVIGATION ═══ */
const navMap = { menu: 'navHome', search: 'navSearch', ai: 'navAI', community: 'navCommunity', profile: 'navProfile' };
const screenMap = { menu: 'screenMenu', search: 'screenSearch', ai: 'screenAI', community: 'screenCommunity', profile: 'screenProfile' };
const titleMap = { menu: '', search: 'Keşfet', ai: 'AI Asistan', community: 'Topluluk', profile: 'Profil' };

function switchTab(tab) {
  currentView = tab;
  Object.values(screenMap).forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('active') });
  const activeScreen = document.getElementById(screenMap[tab]);
  if (activeScreen) activeScreen.classList.add('active');
  if (tab === 'menu') {
    if (activeHomeTab === 'restoranlar') renderRestoranlar();
    else renderMenu();
  } else if (tab === 'search') renderKesfet();
  else if (tab === 'community') renderCommunity();
  else if (tab === 'profile') renderProfileEmployments();
  const isMenu = tab === 'menu';
  const isCommunity = tab === 'community';
  const appHeader = document.getElementById('appHeader');
  if (appHeader) appHeader.style.display = isCommunity ? 'none' : '';
  document.getElementById('headerLocation').style.display = isMenu ? 'flex' : 'none';
  document.getElementById('headerTitle').style.display = isMenu ? 'block' : 'none';
  document.getElementById('headerIcons').style.display = isMenu ? 'flex' : 'none';
  const hc = document.getElementById('headerTitleCenter');
  hc.style.display = isMenu || isCommunity ? 'none' : 'block';
  hc.textContent = titleMap[tab] || '';
  window.scrollTo(0, 0);
  stickyActive = false;
  document.getElementById('stickyHeader').classList.remove('visible');
  syncStickyHeader();
  document.querySelectorAll('.ni').forEach(n => {
    n.classList.remove('active');
    const ic = n.querySelector('iconify-icon');
    if (ic && n.dataset.icon) ic.setAttribute('icon', n.dataset.icon);
  });
  const activeNav = document.getElementById(navMap[tab]);
  if (activeNav) {
    activeNav.classList.add('active');
    const ic = activeNav.querySelector('iconify-icon');
    if (ic && activeNav.dataset.iconActive) ic.setAttribute('icon', activeNav.dataset.iconActive);
  }
}

/* ═══ SCROLL & STICKY HEADER ═══ */
let lastScrollY = 0, lastScrollTime = 0, stickyActive = false;

function syncStickyHeader() {
  const sticky = document.getElementById('stickyHeader');
  const isMenu = currentView === 'menu';
  sticky.querySelector('#stickyLocation').style.display = isMenu ? 'flex' : 'none';
  sticky.querySelector('#stickyTitle').style.display = isMenu ? 'block' : 'none';
  sticky.querySelector('#stickyIcons').style.display = isMenu ? 'flex' : 'none';
  const sc = sticky.querySelector('#stickyTitleCenter');
  sc.style.display = isMenu ? 'none' : 'block';
  sc.textContent = titleMap[currentView] || '';
}

function handleHeaderScroll() {
  const sticky = document.getElementById('stickyHeader');
  const staticHeader = document.getElementById('appHeader');
  if (!sticky || !staticHeader) return;
  const headerH = staticHeader.offsetHeight;
  const scrollY = window.scrollY || window.pageYOffset;
  const now = Date.now();
  const dt = now - lastScrollTime || 16;
  const dy = scrollY - lastScrollY;
  const speed = Math.abs(dy) / dt;
  const pastHeader = scrollY > headerH;
  if (stickyActive) {
    if (!pastHeader) {
      if (scrollY <= 2) {
        sticky.classList.add('kill');
        sticky.classList.remove('visible');
        stickyActive = false;
        requestAnimationFrame(() => { requestAnimationFrame(() => { sticky.classList.remove('kill'); }); });
      }
    } else {
      sticky.style.opacity = '';
      if (dy > 0) { sticky.classList.remove('visible'); stickyActive = false; }
    }
  } else {
    if (pastHeader && dy < 0 && speed > 1.2) {
      stickyActive = true;
      syncStickyHeader();
      sticky.style.opacity = '';
      sticky.classList.add('visible');
    }
  }
  lastScrollY = scrollY;
  lastScrollTime = now;
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ═══ LOCATION PICKER ═══ */
function toggleLocationPicker() {
  var overlay = document.getElementById('locOverlay');
  var picker = document.getElementById('locPicker');
  if (!overlay || !picker) return;
  var isOpen = overlay.classList.contains('open');
  if (isOpen) { closeLocationPicker(); return; }
  overlay.classList.add('open');
  picker.classList.add('open');
  renderSavedAddresses();
}

function closeLocationPicker() {
  var overlay = document.getElementById('locOverlay');
  var picker = document.getElementById('locPicker');
  if (overlay) overlay.classList.remove('open');
  if (picker) picker.classList.remove('open');
}

function renderSavedAddresses() {
  var list = document.getElementById('locSavedList');
  if (!list || typeof USER_ADDRESSES === 'undefined') return;
  var html = '';
  USER_ADDRESSES.forEach(function(addr) {
    var isActive = addr.id === SELECTED_ADDRESS_ID;
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--r-lg);cursor:pointer;background:' + (isActive ? 'var(--glass-card-strong)' : 'transparent') + ';border:1.5px solid ' + (isActive ? 'var(--primary)' : 'transparent') + '" onclick="selectAddress(\'' + addr.id + '\')">';
    html += '<iconify-icon icon="' + addr.icon + '" style="font-size:20px;color:' + (isActive ? 'var(--primary)' : 'var(--text-muted)') + '"></iconify-icon>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + addr.label + '</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-tertiary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + addr.address + '</div>';
    html += '</div>';
    if (isActive) html += '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>';
    html += '</div>';
  });
  list.innerHTML = html;
}

function selectAddress(id) {
  SELECTED_ADDRESS_ID = id;
  var addr = USER_ADDRESSES.find(function(a) { return a.id === id; });
  if (!addr) return;
  // Update main header
  var label = document.getElementById('locationLabel');
  if (label) label.textContent = addr.label;
  var addrEl = document.getElementById('locationAddress');
  if (addrEl) addrEl.textContent = addr.address;
  closeLocationPicker();
}

/* ═══ UTILITY ═══ */
function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ═══ APP STARTUP ═══ */
// App starts directly on home page; onboarding shows only after logout
// NOTE: Actual init is triggered from index.html after ALL scripts load,
// so that renderMenu/renderKesfet (defined in js/menu.js) are available.

/* ═══════════════════════════════════════════════════════════
   ADMIN PREMIUM — Premium Plan Yönetimi
   (Tab: İşletme/Kullanıcı üyeleri • Ayarlar: Kullanıcı/İşletme
    plan konfigürasyonu • Mor ana, Gold/Silver prestij vurgusu)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _apr = {
  tab: 'biz',              // 'biz' | 'user'
  search: '',
  planFilter: '',          // tier_standard | tier_plus | tier_pro | (user) ''
  dateSort: 'newest',      // 'newest' | 'oldest' | 'ending'
  settingsOpen: false,
  settingsView: null,      // null (root) | 'user' | 'biz'
  settingsBizTier: 'tier_plus'
};

/* ═══ Overlay Aç ═══ */
function _admOpenPremium() {
  _admInjectStyles();
  _aprInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_aprCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:crown-star-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Premium Plan</div>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Üyelikler & plan konfigürasyonu</div>'
    + '</div>'
    + '<div class="apr-cog" onclick="_aprOpenSettings()" title="Ayarlar">'
    + '<iconify-icon icon="solar:settings-bold" style="font-size:19px"></iconify-icon>'
    + '</div>'
    + '</div>'
    + '<div id="adminPremiumContainer" style="flex:1"></div>';
  adminPhone.appendChild(overlay);

  // Reset
  _apr.search = '';
  _apr.planFilter = '';
  _apr.dateSort = 'newest';

  renderAdminPremium();
}

function _aprCloseOverlay() {
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var o = adminPhone.querySelector('.prof-overlay');
  if (o) o.remove();
  _aprCloseSettings();
}

/* ═══ Ana Render ═══ */
function renderAdminPremium() {
  var c = document.getElementById('adminPremiumContainer');
  if (!c) return;

  var h = '<div class="adm-fadeIn" style="padding:14px 16px 24px;display:flex;flex-direction:column;gap:12px">';
  h += _aprRenderHero();
  h += _aprRenderTabs();
  h += _aprRenderFilters();
  h += _aprRenderMemberList();
  h += '</div>';
  c.innerHTML = h;
}

/* ═══ Helpers ═══ */
function _aprEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _aprBizPlan(id) {
  for (var i = 0; i < ADMIN_PREMIUM_BIZ_PLANS.length; i++) {
    if (ADMIN_PREMIUM_BIZ_PLANS[i].id === id) return ADMIN_PREMIUM_BIZ_PLANS[i];
  }
  return null;
}

function _aprFmtTL(n) {
  if (typeof _admFmtTL === 'function') return _admFmtTL(n);
  return '₺' + n;
}

function _aprDateShort(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) { return String(iso); }
}

function _aprSetTab(t) { _apr.tab = t; _apr.planFilter = ''; renderAdminPremium(); }
function _aprSetSearch(v) { _apr.search = v; renderAdminPremium(); }
function _aprSetPlanFilter(v) { _apr.planFilter = _apr.planFilter === v ? '' : v; renderAdminPremium(); }
function _aprSetDateSort(v) { _apr.dateSort = v; renderAdminPremium(); }

/* ═══════════════════════════════════════
   P2 — Hero + Segment Tab (İşletme / Kullanıcı)
   ═══════════════════════════════════════ */
function _aprRenderHero() {
  var bizCount = ADMIN_PREMIUM_MEMBERS.biz.length;
  var userCount = ADMIN_PREMIUM_MEMBERS.user.length;

  // Aylık tahmini gelir
  var bizMRR = 0;
  for (var i = 0; i < ADMIN_PREMIUM_MEMBERS.biz.length; i++) {
    var m = ADMIN_PREMIUM_MEMBERS.biz[i];
    var pl = _aprBizPlan(m.tier);
    if (!pl) continue;
    bizMRR += (m.billingCycle === 'yearly' ? pl.pricing.yearly / 12 : pl.pricing.monthly);
  }
  var userMRR = userCount * ADMIN_PREMIUM_USER_PLAN.pricing.monthly;
  var totalMRR = Math.round(bizMRR + userMRR);

  return '<div class="apr-hero">'
    + '<div class="apr-hero-shine"></div>'
    + '<div style="position:relative;z-index:2">'
    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
    + '<iconify-icon icon="solar:crown-star-bold" style="font-size:14px;color:#FCD34D"></iconify-icon>'
    + '<span style="font:var(--fw-medium) 10px/1 var(--font);opacity:.85;letter-spacing:.5px;text-transform:uppercase">Premium Program</span>'
    + '</div>'
    + '<div style="font:var(--fw-bold) 22px/1.1 var(--font)">' + (bizCount + userCount) + ' Üye</div>'
    + '<div style="display:flex;gap:14px;margin-top:12px">'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75">İşletme</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + bizCount + '</div></div>'
    + '<div style="width:1px;background:rgba(255,255,255,0.25)"></div>'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75">Kullanıcı</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + userCount + '</div></div>'
    + '<div style="width:1px;background:rgba(255,255,255,0.25)"></div>'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75">Aylık Gelir</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + _aprFmtTL(totalMRR) + '</div></div>'
    + '</div>'
    + '</div></div>';
}

function _aprRenderTabs() {
  var bizCount = ADMIN_PREMIUM_MEMBERS.biz.length;
  var userCount = ADMIN_PREMIUM_MEMBERS.user.length;

  return '<div class="apr-segment">'
    + '<button class="apr-seg-btn' + (_apr.tab === 'biz' ? ' active' : '') + '" onclick="_aprSetTab(\'biz\')">'
    + '<iconify-icon icon="solar:shop-bold" style="font-size:14px"></iconify-icon>'
    + '<span>İşletme Premium</span>'
    + '<span class="apr-seg-count">' + bizCount + '</span>'
    + '</button>'
    + '<button class="apr-seg-btn' + (_apr.tab === 'user' ? ' active' : '') + '" onclick="_aprSetTab(\'user\')">'
    + '<iconify-icon icon="solar:user-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Kullanıcı Premium</span>'
    + '<span class="apr-seg-count">' + userCount + '</span>'
    + '</button>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P3 — Filtreler + Üye Listesi
   ═══════════════════════════════════════ */
function _aprRenderFilters() {
  var h = '<div style="display:flex;flex-direction:column;gap:8px">';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="apr-search" placeholder="' + (_apr.tab === 'biz' ? 'İşletme adı...' : 'Kullanıcı adı veya e-posta...') + '" value="' + _aprEsc(_apr.search) + '" oninput="_aprSetSearch(this.value)" />'
    + '</div>';

  // Plan filter (yalnızca biz tab)
  if (_apr.tab === 'biz') {
    h += '<div class="apr-chip-row">';
    h += '<button class="apr-chip' + (!_apr.planFilter ? ' active' : '') + '" onclick="_aprSetPlanFilter(\'\')">Tüm Planlar</button>';
    for (var i = 0; i < ADMIN_PREMIUM_BIZ_PLANS.length; i++) {
      var p = ADMIN_PREMIUM_BIZ_PLANS[i];
      var sel = _apr.planFilter === p.id;
      h += '<button class="apr-chip' + (sel ? ' active' : '') + '" '
        + 'style="' + (sel ? 'border-color:' + p.accent + ';background:' + p.accent + '18;color:' + p.accent : '') + '" '
        + 'onclick="_aprSetPlanFilter(\'' + p.id + '\')">' + _aprEsc(p.label) + '</button>';
    }
    h += '</div>';
  }

  // Date sort
  h += '<div class="apr-chip-row apr-chip-row--sort">'
    + '<span class="apr-chip-label">Tarih:</span>'
    + '<button class="apr-chip' + (_apr.dateSort === 'newest' ? ' active' : '') + '" onclick="_aprSetDateSort(\'newest\')">En Yeni</button>'
    + '<button class="apr-chip' + (_apr.dateSort === 'oldest' ? ' active' : '') + '" onclick="_aprSetDateSort(\'oldest\')">En Eski</button>'
    + '<button class="apr-chip' + (_apr.dateSort === 'ending' ? ' active' : '') + '" onclick="_aprSetDateSort(\'ending\')">Bitişi Yakın</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _aprRenderMemberList() {
  var raw = _apr.tab === 'biz' ? ADMIN_PREMIUM_MEMBERS.biz : ADMIN_PREMIUM_MEMBERS.user;
  var list = raw.slice();

  // Plan filtresi (biz)
  if (_apr.tab === 'biz' && _apr.planFilter) {
    list = list.filter(function(m) { return m.tier === _apr.planFilter; });
  }

  // Search
  if (_apr.search.trim()) {
    var q = _apr.search.toLowerCase().trim();
    list = list.filter(function(m) {
      if (_apr.tab === 'biz') {
        return m.name.toLowerCase().indexOf(q) > -1
          || (m.owner && m.owner.toLowerCase().indexOf(q) > -1);
      }
      return m.name.toLowerCase().indexOf(q) > -1
        || (m.email && m.email.toLowerCase().indexOf(q) > -1);
    });
  }

  // Sort
  list.sort(function(a, b) {
    if (_apr.dateSort === 'newest') return new Date(b.startDate) - new Date(a.startDate);
    if (_apr.dateSort === 'oldest') return new Date(a.startDate) - new Date(b.startDate);
    // ending — bitişi yakın en üste (null'lar sona)
    if (!a.endDate) return 1;
    if (!b.endDate) return -1;
    return new Date(a.endDate) - new Date(b.endDate);
  });

  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + list.length + ' üye listeleniyor</div>'
    + '</div>';

  if (list.length === 0) {
    h += '<div class="apr-empty"><iconify-icon icon="solar:crown-minimalistic-bold" style="font-size:40px;opacity:0.3"></iconify-icon>'
      + '<div>Eşleşen üye bulunamadı</div></div>';
    return h;
  }

  h += '<div style="display:flex;flex-direction:column;gap:8px">';
  for (var i = 0; i < list.length; i++) {
    h += _apr.tab === 'biz' ? _aprBizMemberCard(list[i]) : _aprUserMemberCard(list[i]);
  }
  h += '</div>';
  return h;
}

function _aprBizMemberCard(m) {
  var pl = _aprBizPlan(m.tier);
  if (!pl) return '';
  var tierLabel = pl.label;
  var bill = m.billingCycle === 'yearly' ? 'Yıllık' : 'Aylık';
  var price = m.billingCycle === 'yearly' ? pl.pricing.yearly : pl.pricing.monthly;

  // Tier badge — Pro=gold shine, Plus=mor, Standart=silver
  var tierClass = pl.tier === 'gold' ? 'apr-tier-gold'
    : pl.tier === 'plus' ? 'apr-tier-plus'
    : 'apr-tier-silver';

  // Bitiş yakınlığı
  var daysLeft = null;
  if (m.endDate) {
    daysLeft = Math.floor((new Date(m.endDate) - Date.now()) / 86400000);
  }
  var endClass = (daysLeft !== null && daysLeft < 30) ? 'apr-end-warn' : '';

  return '<div class="apr-member-card">'
    + '<div class="apr-mc-lead" style="background:linear-gradient(135deg,' + pl.accent + ',' + pl.accentSoft + ')">' + _aprEsc(m.name.charAt(0)) + '</div>'
    + '<div class="apr-mc-body">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="apr-mc-name">' + _aprEsc(m.name) + '</span>'
    + '<span class="apr-tier-badge ' + tierClass + '">'
    + (pl.tier === 'gold' ? '<iconify-icon icon="solar:crown-star-bold" style="font-size:10px"></iconify-icon>' : '')
    + tierLabel + '</span>'
    + '</div>'
    + '<div class="apr-mc-meta">' + _aprEsc(m.owner) + ' · ' + bill + ' ' + _aprFmtTL(price) + '</div>'
    + '<div class="apr-mc-dates">'
    + '<span>Başlangıç: ' + _aprDateShort(m.startDate) + '</span>'
    + '<span class="' + endClass + '">Bitiş: ' + _aprDateShort(m.endDate) + (daysLeft !== null && daysLeft < 30 ? ' (' + daysLeft + ' gün)' : '') + '</span>'
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);align-self:center"></iconify-icon>'
    + '</div>';
}

function _aprUserMemberCard(m) {
  var bill = m.billingCycle === 'yearly' ? 'Yıllık' : 'Aylık';
  var price = m.billingCycle === 'yearly' ? ADMIN_PREMIUM_USER_PLAN.pricing.yearly : ADMIN_PREMIUM_USER_PLAN.pricing.monthly;

  var daysLeft = null;
  if (m.endDate) {
    daysLeft = Math.floor((new Date(m.endDate) - Date.now()) / 86400000);
  }
  var endClass = (daysLeft !== null && daysLeft < 30) ? 'apr-end-warn' : '';

  return '<div class="apr-member-card">'
    + '<div class="apr-mc-lead apr-mc-lead--round" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA)">' + _aprEsc(m.name.charAt(0)) + '</div>'
    + '<div class="apr-mc-body">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="apr-mc-name">' + _aprEsc(m.name) + '</span>'
    + '<span class="apr-tier-badge apr-tier-plus"><iconify-icon icon="solar:crown-star-bold" style="font-size:10px"></iconify-icon>Premium</span>'
    + '</div>'
    + '<div class="apr-mc-meta">' + _aprEsc(m.email || '—') + ' · ' + bill + ' ' + _aprFmtTL(price) + '</div>'
    + '<div class="apr-mc-dates">'
    + '<span>Başlangıç: ' + _aprDateShort(m.startDate) + '</span>'
    + '<span class="' + endClass + '">Bitiş: ' + _aprDateShort(m.endDate) + (daysLeft !== null && daysLeft < 30 ? ' (' + daysLeft + ' gün)' : '') + '</span>'
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);align-self:center"></iconify-icon>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P4 — Ayarlar Modal Kabuğu
   ═══════════════════════════════════════ */
function _aprOpenSettings() {
  _apr.settingsView = null;
  _aprMountSettings();
}

function _aprMountSettings() {
  _aprCloseSettings();
  _apr.settingsOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var m = document.createElement('div');
  m.id = 'aprSettings';
  m.className = 'apr-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _aprCloseSettings(); };
  m.innerHTML = '<div class="apr-modal"><div id="aprSettingsBody" class="apr-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _aprRenderSettings();
}

function _aprCloseSettings() {
  var m = document.getElementById('aprSettings');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _apr.settingsOpen = false;
  _apr.settingsView = null;
}

function _aprGotoSettings(view) {
  _apr.settingsView = view;
  _aprRenderSettings();
}

function _aprRenderSettings() {
  var body = document.getElementById('aprSettingsBody');
  if (!body) return;
  var view = _apr.settingsView;
  var h = '';

  // Header
  var title = view === 'user' ? 'Kullanıcı Premium Ayarları'
    : view === 'biz' ? 'İşletme Premium Ayarları'
    : 'Premium Ayarları';
  var sub = view === 'user' ? 'Aktif özellikler ve aylık/yıllık fiyat'
    : view === 'biz' ? 'Standart • Plus • Pro — 3 katmanlı paket'
    : 'Hangi tarafı yapılandırmak istersiniz?';

  h += '<div class="apr-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + (view ? '<div class="apr-back" onclick="_aprGotoSettings(null)"><iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon></div>' : '')
    + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#F59E0B);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:settings-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div><div class="apr-mtitle">' + title + '</div>'
    + '<div class="apr-msub">' + sub + '</div></div>'
    + '</div>'
    + '<div class="apr-close" onclick="_aprCloseSettings()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  if (!view) {
    h += _aprRenderSettingsRoot();
  } else if (view === 'user') {
    h += _aprRenderUserSettings();
  } else if (view === 'biz') {
    h += _aprRenderBizSettings();
  }

  body.innerHTML = h;
}

function _aprRenderSettingsRoot() {
  var userCount = ADMIN_PREMIUM_MEMBERS.user.length;
  var bizCount = ADMIN_PREMIUM_MEMBERS.biz.length;
  var userActive = ADMIN_PREMIUM_USER_PLAN.activeFeatures.length;
  var userTotal = ADMIN_PREMIUM_USER_FEATURES.length;

  return '<div class="apr-rootgrid">'
    + '<button class="apr-rootcard apr-rootcard--user" onclick="_aprGotoSettings(\'user\')">'
    + '<div class="apr-rootcard-icon" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA)"><iconify-icon icon="solar:user-hand-up-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div class="apr-rootcard-title">Kullanıcı Ayarları</div>'
    + '<div class="apr-rootcard-sub">Tek plan • özellik checklist</div>'
    + '<div class="apr-rootcard-stat">'
    + '<span><b>' + userActive + '/' + userTotal + '</b> aktif özellik</span>'
    + '<span><b>' + userCount + '</b> üye</span>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" class="apr-rootcard-chev"></iconify-icon>'
    + '</button>'

    + '<button class="apr-rootcard apr-rootcard--biz" onclick="_aprGotoSettings(\'biz\')">'
    + '<div class="apr-rootcard-icon" style="background:linear-gradient(135deg,#F59E0B,#FCD34D)"><iconify-icon icon="solar:shop-2-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div class="apr-rootcard-title">İşletme Ayarları</div>'
    + '<div class="apr-rootcard-sub">3 katmanlı plan • Standart / Plus / Pro</div>'
    + '<div class="apr-rootcard-stat">'
    + '<span><b>3</b> plan katmanı</span>'
    + '<span><b>' + bizCount + '</b> üye</span>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" class="apr-rootcard-chev"></iconify-icon>'
    + '</button>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P5 — Kullanıcı Premium Ayarları
   ═══════════════════════════════════════ */
function _aprRenderUserSettings() {
  var P = ADMIN_PREMIUM_USER_PLAN;
  var activeCount = P.activeFeatures.length;
  var total = ADMIN_PREMIUM_USER_FEATURES.length;
  var yearlySave = Math.round((1 - (P.pricing.yearly / (P.pricing.monthly * 12))) * 100);

  var h = '';

  // Özet mini kart
  h += '<div class="apr-pill-hero apr-pill-hero--user">'
    + '<div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.8">Tek Plan — Aylık</div>'
    + '<div class="apr-hero-price"><span class="apr-hero-cur">₺</span>' + P.pricing.monthly + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75;margin-top:6px">Yıllık ₺' + P.pricing.yearly + ' • %' + yearlySave + ' tasarruf</div>'
    + '</div>'
    + '<iconify-icon icon="solar:crown-star-bold" style="font-size:38px;opacity:0.6"></iconify-icon>'
    + '</div>';

  // Özellik listesi
  h += '<div class="apr-sect">'
    + '<div class="apr-sect-head"><iconify-icon icon="solar:checklist-minimalistic-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon><span>Aktif Özellikler</span><span class="apr-sect-badge">' + activeCount + '/' + total + '</span></div>'
    + '<div class="apr-sect-desc">Seçilen özellikler kullanıcıya sunulan premium paketi oluşturur.</div>'
    + '<div class="apr-feat-grid">';

  for (var i = 0; i < ADMIN_PREMIUM_USER_FEATURES.length; i++) {
    var f = ADMIN_PREMIUM_USER_FEATURES[i];
    var isOn = P.activeFeatures.indexOf(f.id) > -1;
    h += '<div class="apr-feat-item' + (isOn ? ' on' : '') + '" onclick="_aprToggleUserFeature(\'' + f.id + '\')">'
      + '<div class="apr-feat-ico"><iconify-icon icon="' + f.icon + '" style="font-size:16px"></iconify-icon></div>'
      + '<div class="apr-feat-body">'
      + '<div class="apr-feat-lbl">' + _aprEsc(f.label) + '</div>'
      + '<div class="apr-feat-desc">' + _aprEsc(f.description || '') + '</div>'
      + '</div>'
      + '<div class="apr-toggle' + (isOn ? ' on' : '') + '"><div class="apr-toggle-dot"></div></div>'
      + '</div>';
  }
  h += '</div></div>';

  // Fiyatlandırma
  h += '<div class="apr-sect">'
    + '<div class="apr-sect-head"><iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:16px;color:#F59E0B"></iconify-icon><span>Fiyatlandırma</span></div>'
    + '<div class="apr-sect-desc">Kullanıcıya gösterilecek aylık ve yıllık abonelik bedelleri.</div>'
    + '<div class="apr-price-row">'
    + _aprPriceField('aprUserMonthly', 'Aylık', P.pricing.monthly, '_aprSetUserPrice(\'monthly\', this.value)')
    + _aprPriceField('aprUserYearly', 'Yıllık', P.pricing.yearly, '_aprSetUserPrice(\'yearly\', this.value)')
    + '</div>'
    + '<div class="apr-hint"><iconify-icon icon="solar:info-circle-linear" style="font-size:11px"></iconify-icon>Yıllık paket genelde aylık × 12\'den düşük olmalıdır (örn. 2 ay hediye).</div>'
    + '</div>';

  // Kaydet
  h += '<button class="apr-cta" onclick="_aprSaveUserSettings()">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:16px"></iconify-icon>'
    + 'Kullanıcı Planını Kaydet</button>';

  return h;
}

function _aprPriceField(id, label, value, handler) {
  return '<div class="apr-price-field">'
    + '<label>' + label + '</label>'
    + '<div class="apr-price-input-wrap">'
    + '<span class="apr-price-cur">₺</span>'
    + '<input type="number" id="' + id + '" min="0" step="1" value="' + value + '" oninput="' + handler + '" class="apr-price-input" />'
    + '</div></div>';
}

function _aprToggleUserFeature(fid) {
  var arr = ADMIN_PREMIUM_USER_PLAN.activeFeatures;
  var idx = arr.indexOf(fid);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(fid);
  _aprRenderSettings();
}

function _aprSetUserPrice(period, val) {
  var n = parseFloat(val);
  if (isNaN(n) || n < 0) return;
  if (period === 'monthly') ADMIN_PREMIUM_USER_PLAN.pricing.monthly = n;
  else ADMIN_PREMIUM_USER_PLAN.pricing.yearly = n;
  // hero'daki tasarruf oranı için yumuşak güncelleme — kaydet butonuna basılmadan da anlık değer geçerli
}

function _aprSaveUserSettings() {
  ADMIN_PREMIUM_USER_PLAN.updatedAt = new Date().toISOString();
  _admToast('Kullanıcı planı kaydedildi', 'ok');
  _aprRenderSettings();
  renderAdminPremium();
}

/* ═══════════════════════════════════════
   P6 — İşletme Premium Ayarları (3 Katman)
   ═══════════════════════════════════════ */
function _aprRenderBizSettings() {
  var activeTierId = _apr.settingsBizTier;
  var active = _aprBizPlan(activeTierId) || ADMIN_PREMIUM_BIZ_PLANS[1];

  var h = '';

  // Tier switcher (3 plan kartı — seçilebilir)
  h += '<div class="apr-tier-switcher">';
  for (var i = 0; i < ADMIN_PREMIUM_BIZ_PLANS.length; i++) {
    var p = ADMIN_PREMIUM_BIZ_PLANS[i];
    var isActive = p.id === activeTierId;
    var cls = 'apr-tier-btn apr-tier-btn--' + p.tier + (isActive ? ' active' : '');
    h += '<button class="' + cls + '" onclick="_aprSelectBizTier(\'' + p.id + '\')">'
      + (p.tier === 'gold' ? '<div class="apr-tier-shine"></div>' : '')
      + '<div class="apr-tier-label">' + _aprEsc(p.label) + '</div>'
      + '<div class="apr-tier-price"><span class="apr-tier-cur">₺</span>' + p.pricing.monthly + '<span class="apr-tier-period">/ay</span></div>'
      + '<div class="apr-tier-subnote">' + p.features.length + ' özellik</div>'
      + '</button>';
  }
  h += '</div>';

  // Seçili katmanın detayları
  h += '<div class="apr-sect">'
    + '<div class="apr-sect-head"><iconify-icon icon="solar:tag-price-bold" style="font-size:16px;color:' + active.accent + '"></iconify-icon>'
    + '<span>' + _aprEsc(active.label) + ' Paketi</span>'
    + '<span class="apr-sect-badge" style="background:' + active.accent + '18;color:' + active.accent + '">' + _aprEsc(active.tagline) + '</span></div>';

  // Özellik checklist
  h += '<div class="apr-sect-desc">Bu paket içine dahil edilecek özellikleri seçin.</div>'
    + '<div class="apr-feat-grid">';
  for (var j = 0; j < ADMIN_PREMIUM_BIZ_FEATURES.length; j++) {
    var f = ADMIN_PREMIUM_BIZ_FEATURES[j];
    var isOn = active.features.indexOf(f.id) > -1;
    h += '<div class="apr-feat-item' + (isOn ? ' on' : '') + '" onclick="_aprToggleBizFeature(\'' + active.id + '\', \'' + f.id + '\')">'
      + '<div class="apr-feat-ico" style="' + (isOn ? 'color:' + active.accent + ';background:' + active.accent + '18' : '') + '"><iconify-icon icon="' + f.icon + '" style="font-size:14px"></iconify-icon></div>'
      + '<div class="apr-feat-body" style="padding-right:6px">'
      + '<div class="apr-feat-lbl">' + _aprEsc(f.label) + '</div>'
      + '</div>'
      + '<div class="apr-toggle' + (isOn ? ' on' : '') + '" style="' + (isOn ? '--toggle-c:' + active.accent : '') + '"><div class="apr-toggle-dot"></div></div>'
      + '</div>';
  }
  h += '</div>';
  h += '</div>';

  // Fiyatlandırma
  h += '<div class="apr-sect">'
    + '<div class="apr-sect-head"><iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:16px;color:' + active.accent + '"></iconify-icon><span>' + _aprEsc(active.label) + ' Fiyatlandırma</span></div>'
    + '<div class="apr-sect-desc">Her katmanın fiyatı bağımsız belirlenir.</div>'
    + '<div class="apr-price-row">'
    + _aprPriceField('aprBiz_' + active.id + '_m', 'Aylık', active.pricing.monthly, '_aprSetBizPrice(\'' + active.id + '\', \'monthly\', this.value)')
    + _aprPriceField('aprBiz_' + active.id + '_y', 'Yıllık', active.pricing.yearly, '_aprSetBizPrice(\'' + active.id + '\', \'yearly\', this.value)')
    + '</div>'
    + '<div class="apr-hint"><iconify-icon icon="solar:info-circle-linear" style="font-size:11px"></iconify-icon>Yıllık fiyat genelde aylık × 10–11 aralığındadır (2 ay indirim önerilir).</div>'
    + '</div>';

  // Üç-planı özetleyen compact strip
  h += '<div class="apr-compare">';
  for (var k = 0; k < ADMIN_PREMIUM_BIZ_PLANS.length; k++) {
    var pp = ADMIN_PREMIUM_BIZ_PLANS[k];
    var isA = pp.id === activeTierId;
    h += '<div class="apr-compare-pill apr-compare-pill--' + pp.tier + (isA ? ' active' : '') + '">'
      + '<b>' + _aprEsc(pp.label) + '</b>'
      + '<span>' + pp.features.length + ' özl</span>'
      + '<span>₺' + pp.pricing.monthly + '</span>'
      + '</div>';
  }
  h += '</div>';

  // Kaydet
  h += '<button class="apr-cta apr-cta--' + active.tier + '" onclick="_aprSaveBizTier(\'' + active.id + '\')">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:16px"></iconify-icon>'
    + _aprEsc(active.label) + ' Paketini Kaydet</button>';

  return h;
}

function _aprSelectBizTier(tierId) {
  _apr.settingsBizTier = tierId;
  _aprRenderSettings();
}

function _aprToggleBizFeature(tierId, featureId) {
  var p = _aprBizPlan(tierId);
  if (!p) return;
  var idx = p.features.indexOf(featureId);
  if (idx > -1) p.features.splice(idx, 1);
  else p.features.push(featureId);
  _aprRenderSettings();
}

function _aprSetBizPrice(tierId, period, val) {
  var p = _aprBizPlan(tierId);
  if (!p) return;
  var n = parseFloat(val);
  if (isNaN(n) || n < 0) return;
  if (period === 'monthly') p.pricing.monthly = n;
  else p.pricing.yearly = n;
}

function _aprSaveBizTier(tierId) {
  var p = _aprBizPlan(tierId);
  if (!p) return;
  p.updatedAt = new Date().toISOString();
  _admToast(p.label + ' paketi kaydedildi', 'ok');
  _aprRenderSettings();
  renderAdminPremium();
}

/* ═══════════════════════════════════════
   P7 — Stiller (.apr-*)
   ═══════════════════════════════════════ */
function _aprInjectStyles() {
  if (document.getElementById('aprStyles')) return;
  var css = ''
    /* Cog */
    + '.apr-cog{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6 0%,#F59E0B 100%);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(139,92,246,0.35);transition:transform .2s}'
    + '.apr-cog:hover{transform:rotate(25deg)}'
    /* Hero */
    + '.apr-hero{position:relative;background:linear-gradient(135deg,#4C1D95 0%,#7C3AED 50%,#B45309 100%);border-radius:var(--r-xl);padding:18px;color:#fff;overflow:hidden}'
    + '.apr-hero-shine{position:absolute;right:-40px;top:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(252,211,77,0.35) 0%,transparent 65%);z-index:1}'
    /* Segment */
    + '.apr-segment{display:flex;gap:2px;padding:3px;background:var(--bg-phone-secondary);border-radius:var(--r-lg)}'
    + '.apr-seg-btn{flex:1;padding:10px 8px;border:none;border-radius:var(--r-md);background:transparent;color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .2s}'
    + '.apr-seg-btn.active{background:var(--bg-phone);color:#8B5CF6;box-shadow:var(--shadow-sm)}'
    + '.apr-seg-count{font:var(--fw-bold) 10px/1 var(--font);background:var(--border-subtle);color:var(--text-muted);padding:2px 6px;border-radius:var(--r-full)}'
    + '.apr-seg-btn.active .apr-seg-count{background:linear-gradient(135deg,#8B5CF6,#F59E0B);color:#fff}'
    /* Search + chips */
    + '.apr-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.apr-search:focus{border-color:#8B5CF6}'
    + '.apr-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.apr-chip-row--sort{background:var(--bg-phone-secondary);padding:8px 10px;border-radius:var(--r-md)}'
    + '.apr-chip-label{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.apr-chip{padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap}'
    + '.apr-chip:hover{background:var(--bg-phone-secondary)}'
    + '.apr-chip.active{border-color:#8B5CF6;background:rgba(139,92,246,0.1);color:#8B5CF6}'
    /* Member card */
    + '.apr-empty{padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--text-muted)}'
    + '.apr-empty>div{font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font)}'
    + '.apr-member-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;gap:10px;transition:all .15s}'
    + '.apr-member-card:hover{border-color:#8B5CF6}'
    + '.apr-mc-lead{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;color:#fff;font:var(--fw-bold) 16px/1 var(--font);flex-shrink:0}'
    + '.apr-mc-lead--round{border-radius:50%}'
    + '.apr-mc-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}'
    + '.apr-mc-name{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.apr-mc-meta{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)}'
    + '.apr-mc-dates{display:flex;gap:10px;flex-wrap:wrap;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:2px}'
    + '.apr-mc-dates .apr-end-warn{color:#EF4444;font:var(--fw-semibold) 10px/1.3 var(--font)}'
    /* Tier badges */
    + '.apr-tier-badge{font:var(--fw-semibold) 10px/1 var(--font);padding:3px 9px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:3px;white-space:nowrap}'
    + '.apr-tier-silver{background:linear-gradient(135deg,#CBD5E1,#94A3B8);color:#1E293B}'
    + '.apr-tier-plus{background:linear-gradient(135deg,#A78BFA,#8B5CF6);color:#fff}'
    + '.apr-tier-gold{background:linear-gradient(135deg,#FCD34D,#F59E0B);color:#78350F;box-shadow:0 0 8px rgba(245,158,11,0.35)}';
  var s = document.createElement('style');
  s.id = 'aprStyles';
  s.textContent = css;
  document.head.appendChild(s);

  // İkinci parça — modal/ayarlar CSS
  _aprInjectStylesPart2();
}

function _aprInjectStylesPart2() {
  if (document.getElementById('aprStyles2')) return;
  var css = ''
    /* Modal */
    + '.apr-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.apr-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.apr-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.apr-modal-backdrop.open .apr-modal{transform:translateY(0)}'
    + '.apr-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.apr-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.apr-mtitle{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.apr-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.apr-close,.apr-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary);flex-shrink:0}'
    /* Root kartları */
    + '.apr-rootgrid{display:flex;flex-direction:column;gap:10px}'
    + '.apr-rootcard{position:relative;display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding:16px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;text-align:left;transition:all .2s;overflow:hidden}'
    + '.apr-rootcard:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,0.06)}'
    + '.apr-rootcard--user{border-color:rgba(139,92,246,0.35);background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(167,139,250,0.02))}'
    + '.apr-rootcard--biz{border-color:rgba(245,158,11,0.35);background:linear-gradient(135deg,rgba(245,158,11,0.05),rgba(252,211,77,0.02))}'
    + '.apr-rootcard-icon{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.1)}'
    + '.apr-rootcard-title{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.apr-rootcard-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)}'
    + '.apr-rootcard-stat{display:flex;gap:12px;font:var(--fw-regular) 11px/1 var(--font);color:var(--text-secondary);margin-top:4px}'
    + '.apr-rootcard-stat b{color:var(--text-primary);font:var(--fw-bold) var(--fs-sm)/1 var(--font)}'
    + '.apr-rootcard-chev{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-muted)}'
    /* Section */
    + '.apr-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.apr-sect-head{display:flex;align-items:center;gap:8px;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.apr-sect-head span:first-of-type{flex:1}'
    + '.apr-sect-badge{font:var(--fw-bold) 10px/1 var(--font);padding:4px 9px;border-radius:var(--r-full);background:rgba(139,92,246,0.12);color:#8B5CF6}'
    + '.apr-sect-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);margin-top:-4px}'
    /* User hero pill */
    + '.apr-pill-hero{display:flex;align-items:center;justify-content:space-between;padding:16px;border-radius:var(--r-xl);color:#fff}'
    + '.apr-pill-hero--user{background:linear-gradient(135deg,#6D28D9,#8B5CF6,#C4B5FD)}'
    + '.apr-hero-price{font:var(--fw-bold) 28px/1 var(--font);margin-top:6px;display:inline-flex;align-items:baseline}'
    + '.apr-hero-cur{font:var(--fw-semibold) 16px/1 var(--font);margin-right:3px;opacity:0.85}'
    /* Feature list */
    + '.apr-feat-grid{display:flex;flex-direction:column;gap:6px}'
    + '.apr-feat-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);cursor:pointer;transition:all .15s}'
    + '.apr-feat-item:hover{border-color:#8B5CF6}'
    + '.apr-feat-item.on{background:linear-gradient(to right,rgba(139,92,246,0.04),transparent 70%)}'
    + '.apr-feat-ico{width:30px;height:30px;border-radius:var(--r-md);background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-shrink:0}'
    + '.apr-feat-item.on .apr-feat-ico{background:rgba(139,92,246,0.15);color:#8B5CF6}'
    + '.apr-feat-body{flex:1;min-width:0}'
    + '.apr-feat-lbl{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.apr-feat-desc{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Toggle */
    + '.apr-toggle{width:36px;height:20px;border-radius:var(--r-full);background:var(--border-subtle);position:relative;transition:background .2s;flex-shrink:0;--toggle-c:#8B5CF6}'
    + '.apr-toggle.on{background:var(--toggle-c)}'
    + '.apr-toggle-dot{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}'
    + '.apr-toggle.on .apr-toggle-dot{transform:translateX(16px)}'
    /* Price field */
    + '.apr-price-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
    + '.apr-price-field{display:flex;flex-direction:column;gap:5px}'
    + '.apr-price-field label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.apr-price-input-wrap{position:relative;display:flex;align-items:center;background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:4px 4px 4px 12px;transition:border-color .15s}'
    + '.apr-price-input-wrap:focus-within{border-color:#F59E0B}'
    + '.apr-price-cur{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#F59E0B;margin-right:4px}'
    + '.apr-price-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);padding:8px 6px;text-align:right}'
    + '.apr-hint{display:flex;align-items:center;gap:4px;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    /* CTA */
    + '.apr-cta{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#8B5CF6,#6D28D9);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(139,92,246,0.35);transition:transform .1s,opacity .15s}'
    + '.apr-cta:hover{opacity:0.92}'
    + '.apr-cta:active{transform:scale(0.99)}'
    + '.apr-cta--silver{background:linear-gradient(135deg,#64748B,#94A3B8);box-shadow:0 4px 12px rgba(100,116,139,0.35)}'
    + '.apr-cta--plus{background:linear-gradient(135deg,#7C3AED,#A78BFA);box-shadow:0 4px 12px rgba(124,58,237,0.35)}'
    + '.apr-cta--gold{background:linear-gradient(135deg,#F59E0B,#FCD34D);color:#78350F;box-shadow:0 4px 12px rgba(245,158,11,0.45)}'
    /* Tier switcher */
    + '.apr-tier-switcher{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}'
    + '.apr-tier-btn{position:relative;padding:14px 8px;border-radius:var(--r-lg);border:2px solid var(--border-subtle);background:var(--bg-phone);cursor:pointer;text-align:center;transition:all .2s;overflow:hidden}'
    + '.apr-tier-btn.active{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.08)}'
    + '.apr-tier-btn--silver.active{border-color:#94A3B8;background:linear-gradient(135deg,rgba(148,163,184,0.1),transparent)}'
    + '.apr-tier-btn--plus.active{border-color:#8B5CF6;background:linear-gradient(135deg,rgba(139,92,246,0.1),transparent)}'
    + '.apr-tier-btn--gold.active{border-color:#F59E0B;background:linear-gradient(135deg,rgba(252,211,77,0.18),transparent);box-shadow:0 6px 20px rgba(245,158,11,0.25)}'
    + '.apr-tier-shine{position:absolute;top:-12px;right:-12px;width:50px;height:50px;border-radius:50%;background:radial-gradient(circle,rgba(252,211,77,0.4),transparent 65%);pointer-events:none}'
    + '.apr-tier-label{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.apr-tier-price{font:var(--fw-bold) 20px/1 var(--font);color:var(--text-primary);margin-top:8px;display:inline-flex;align-items:baseline;justify-content:center}'
    + '.apr-tier-cur{font:var(--fw-semibold) 13px/1 var(--font);margin-right:2px;color:var(--text-muted)}'
    + '.apr-tier-period{font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-left:3px}'
    + '.apr-tier-subnote{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:6px}'
    /* Compare strip */
    + '.apr-compare{display:flex;gap:6px;padding:10px;background:var(--bg-phone-secondary);border-radius:var(--r-md);justify-content:space-between}'
    + '.apr-compare-pill{flex:1;display:flex;flex-direction:column;gap:3px;align-items:center;padding:8px 4px;border-radius:var(--r-md);background:var(--bg-phone);opacity:0.65;transition:opacity .2s}'
    + '.apr-compare-pill.active{opacity:1;box-shadow:0 2px 6px rgba(0,0,0,0.06)}'
    + '.apr-compare-pill b{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-primary)}'
    + '.apr-compare-pill span{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}'
    + '.apr-compare-pill--silver.active b{color:#64748B}'
    + '.apr-compare-pill--plus.active b{color:#7C3AED}'
    + '.apr-compare-pill--gold.active b{color:#B45309}';
  var s = document.createElement('style');
  s.id = 'aprStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

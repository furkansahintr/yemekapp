/* ═══════════════════════════════════════════════════════════
   ADMIN ADS — Reklam Alanı (Placement Katalog + Advertiser CRM)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _ads = {
  view: 'catalog',               // 'catalog' | 'advertisers' | 'archive'
  advertisersSearch: '',
  advertisersPlacementFilter: '',
  advertisersBudgetFilter: '',   // '' | 'lt10k' | '10k_30k' | 'gt30k'
  hamburgerOpen: false,
  editingPlacementId: null,
  detailCampaignId: null
};

/* ═══ Overlay Aç ═══ */
function _admOpenAds() {
  _admInjectStyles();
  _adsInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'adsOverlay';
  adminPhone.appendChild(overlay);

  _ads.view = 'catalog';
  _adsRender();
}

function _adsCloseOverlay() {
  var o = document.getElementById('adsOverlay');
  if (o) o.remove();
  _adsCloseHamburger();
  _adsCloseModal();
  _adsCloseDetail();
}

/* ═══ Ana Render ═══ */
function _adsRender() {
  var o = document.getElementById('adsOverlay');
  if (!o) return;

  var title, sub, icon;
  if (_ads.view === 'catalog') {
    title = 'Reklam Alanı'; sub = 'Yerleşim kataloğu ve ayar merkezi'; icon = 'solar:gallery-wide-bold';
  } else if (_ads.view === 'advertisers') {
    title = 'Aktif Reklam Verenler'; sub = 'Yayındaki kampanyalar ve bütçe kontrolü'; icon = 'solar:users-group-two-rounded-bold';
  } else {
    title = 'Geçmiş Reklamlar'; sub = 'Süresi dolmuş / iptal edilmiş kampanya arşivi'; icon = 'solar:archive-bold';
  }

  var showBack = _ads.view !== 'catalog';

  var h = '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">';
  h += '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="' + (showBack ? '_adsGoBack()' : '_adsCloseOverlay()') + '">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="' + icon + '" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + title + '</div>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + sub + '</div>'
    + '</div>'
    + '<div class="ads-hamburger" onclick="_adsToggleHamburger()"><iconify-icon icon="solar:hamburger-menu-linear" style="font-size:19px"></iconify-icon></div>'
    + '</div>';

  h += '<div id="adsBody" style="flex:1"></div>';
  o.innerHTML = h;

  _adsRenderBody();
}

function _adsRenderBody() {
  var body = document.getElementById('adsBody');
  if (!body) return;
  if (_ads.view === 'catalog') body.innerHTML = _adsRenderCatalog();
  else if (_ads.view === 'advertisers') body.innerHTML = _adsRenderAdvertisers('active');
  else if (_ads.view === 'archive') body.innerHTML = _adsRenderAdvertisers('archive');
}

function _adsGoBack() {
  _ads.view = 'catalog';
  _adsRender();
}

/* ═══ Helpers ═══ */
function _adsEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _adsPlacement(id) {
  for (var i = 0; i < ADMIN_AD_PLACEMENTS.length; i++) {
    if (ADMIN_AD_PLACEMENTS[i].id === id) return ADMIN_AD_PLACEMENTS[i];
  }
  return null;
}

function _adsFmt(n) {
  if (typeof _admFmt === 'function') return _admFmt(n);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function _adsDaysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

function _adsDateShort(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short' });
  } catch (e) { return iso; }
}

/* ═══════════════════════════════════════
   P2 — Placement Katalog (3 grup × kartlar)
   ═══════════════════════════════════════ */
function _adsRenderCatalog() {
  var active = ADMIN_AD_CAMPAIGNS.filter(function(c) { return c.status === 'active'; });
  var archived = ADMIN_AD_CAMPAIGNS.filter(function(c) { return c.status !== 'active'; });

  // Özet
  var totalSpent = 0, totalBudget = 0, totalImpressions = 0;
  for (var i = 0; i < active.length; i++) {
    totalSpent += active[i].spentToken;
    totalBudget += active[i].budgetToken;
    totalImpressions += active[i].impressions;
  }

  var h = '<div class="adm-fadeIn ads-wrap">';

  // Hero özet
  h += '<div class="ads-hero">'
    + '<div class="ads-hero-shine"></div>'
    + '<div style="position:relative;z-index:2">'
    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
    + '<iconify-icon icon="solar:megaphone-bold" style="font-size:14px;color:#FCD34D"></iconify-icon>'
    + '<span style="font:var(--fw-medium) 10px/1 var(--font);opacity:.85;letter-spacing:.5px;text-transform:uppercase">Reklam Merkezi</span>'
    + '</div>'
    + '<div style="font:var(--fw-bold) 22px/1.1 var(--font)">' + active.length + ' Aktif Kampanya</div>'
    + '<div style="display:flex;gap:14px;margin-top:12px">'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75">Harcanan</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + _adsFmt(totalSpent) + ' Tkn</div></div>'
    + '<div style="width:1px;background:rgba(255,255,255,0.25)"></div>'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75">Bütçe</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + _adsFmt(totalBudget) + ' Tkn</div></div>'
    + '<div style="width:1px;background:rgba(255,255,255,0.25)"></div>'
    + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75">Gösterim</div><div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:4px">' + _adsFmt(totalImpressions) + '</div></div>'
    + '</div>'
    + '</div></div>';

  // Gruplar
  var groups = [
    { id:'location', label:'Konum Odaklı',        sub:'Coğrafi eşleşmeli yerleşimler',        icon:'solar:map-point-bold',        tone:'#3B82F6' },
    { id:'content',  label:'İçerik & AI Odaklı',  sub:'Bağlamsal ve akıllı öneriler',         icon:'solar:magic-stick-3-bold',    tone:'#8B5CF6' },
    { id:'general',  label:'Genel & Keşfet',      sub:'Geniş kitle ve öne çıkarma',           icon:'solar:compass-bold',          tone:'#22C55E' }
  ];

  for (var g = 0; g < groups.length; g++) {
    var grp = groups[g];
    var placements = ADMIN_AD_PLACEMENTS.filter(function(p) { return p.group === grp.id; });
    h += '<div class="ads-group">'
      + '<div class="ads-group-head">'
      + '<div class="ads-group-badge" style="background:' + grp.tone + '15;color:' + grp.tone + '"><iconify-icon icon="' + grp.icon + '" style="font-size:15px"></iconify-icon></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="ads-group-title">' + grp.label + '</div>'
      + '<div class="ads-group-sub">' + grp.sub + ' · ' + placements.length + ' yerleşim</div>'
      + '</div>'
      + '</div>'
      + '<div class="ads-plc-grid">';
    for (var pi = 0; pi < placements.length; pi++) {
      h += _adsPlacementCard(placements[pi]);
    }
    h += '</div></div>';
  }

  h += '</div>';
  return h;
}

function _adsPlacementCard(p) {
  // Bu placement'i alan kaç aktif reklam var?
  var using = 0;
  for (var i = 0; i < ADMIN_AD_CAMPAIGNS.length; i++) {
    if (ADMIN_AD_CAMPAIGNS[i].status === 'active' && ADMIN_AD_CAMPAIGNS[i].placements.indexOf(p.id) > -1) using++;
  }

  return '<div class="ads-plc-card" onclick="_adsOpenPlacementModal(\'' + p.id + '\')">'
    + '<div class="ads-plc-icon" style="background:' + p.color + '18;color:' + p.color + '">'
    + '<iconify-icon icon="' + p.icon + '" style="font-size:22px"></iconify-icon>'
    + '</div>'
    + '<div class="ads-plc-body">'
    + '<div class="ads-plc-label">' + _adsEsc(p.label) + '</div>'
    + '<div class="ads-plc-desc">' + _adsEsc(p.description) + '</div>'
    + '<div class="ads-plc-meta">'
    + '<span><iconify-icon icon="solar:dollar-minimalistic-linear" style="font-size:11px"></iconify-icon>' + p.pricePerImpression.toFixed(1) + ' Tkn/gös</span>'
    + '<span><iconify-icon icon="solar:repeat-linear" style="font-size:11px"></iconify-icon>' + p.dailyFreqCap + '×/gün</span>'
    + '<span><iconify-icon icon="solar:map-point-linear" style="font-size:11px"></iconify-icon>' + _adsEsc(p.region) + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="ads-plc-using">'
    + (using > 0 ? '<span class="ads-using-badge"><span class="ads-live-dot"></span>' + using + ' yayında</span>' : '<span class="ads-using-badge ads-using-badge--idle">—</span>')
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted);margin-top:6px"></iconify-icon>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P3 — Placement Ayarlar Modal
   ═══════════════════════════════════════ */
function _adsOpenPlacementModal(placementId) {
  _adsCloseModal();
  _ads.editingPlacementId = placementId;
  var p = _adsPlacement(placementId);
  if (!p) return;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'adsModal';
  m.className = 'ads-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _adsCloseModal(); };
  m.innerHTML = '<div class="ads-modal"><div id="adsModalBody" class="ads-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _adsRenderPlacementModal();
}

function _adsCloseModal() {
  var m = document.getElementById('adsModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _ads.editingPlacementId = null;
}

function _adsRenderPlacementModal() {
  var body = document.getElementById('adsModalBody');
  if (!body) return;
  var p = _adsPlacement(_ads.editingPlacementId);
  if (!p) return;

  // Bu placement'i kullanan aktif kampanyalar
  var using = ADMIN_AD_CAMPAIGNS.filter(function(c) {
    return c.status === 'active' && c.placements.indexOf(p.id) > -1;
  });

  var h = '<div class="ads-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div class="ads-plc-icon" style="background:' + p.color + '18;color:' + p.color + ';width:40px;height:40px">'
    + '<iconify-icon icon="' + p.icon + '" style="font-size:20px"></iconify-icon>'
    + '</div>'
    + '<div><div class="ads-mtitle">' + _adsEsc(p.label) + '</div>'
    + '<div class="ads-msub">' + _adsEsc(p.groupLabel) + ' • ' + using.length + ' aktif kampanya</div></div>'
    + '</div>'
    + '<div class="ads-close" onclick="_adsCloseModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Açıklama
  h += '<div class="ads-hint">'
    + '<iconify-icon icon="solar:info-circle-linear" style="font-size:12px;color:#8B5CF6"></iconify-icon>'
    + _adsEsc(p.description) + '</div>';

  // Fiyatlandırma
  h += '<div class="ads-sect">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:15px;color:#F59E0B"></iconify-icon><span>Fiyatlandırma</span></div>'
    + '<div class="ads-field">'
    + '<label>Gösterim Başına Token</label>'
    + '<div class="ads-token-wrap">'
    + '<iconify-icon icon="solar:coin-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<input type="number" class="ads-token-input" min="0" step="0.1" value="' + p.pricePerImpression + '" oninput="_adsSetPrice(\'' + p.id + '\', this.value)" />'
    + '<span class="ads-token-suffix">Tkn/gös</span>'
    + '</div>'
    + '</div>'
    + '</div>';

  // Gösterim Sıklığı
  h += '<div class="ads-sect">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:repeat-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Gösterim Sıklığı</span>'
    + '<span class="ads-sect-badge">' + p.dailyFreqCap + '×/gün</span></div>'
    + '<input type="range" class="ads-slider" min="1" max="20" step="1" value="' + p.dailyFreqCap + '" oninput="_adsSetFreq(\'' + p.id + '\', this.value);this.nextElementSibling.textContent=this.value+\' kez\';" />'
    + '<div class="ads-slider-val">' + p.dailyFreqCap + ' kez</div>'
    + '<div class="ads-hint" style="margin-top:6px"><iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>Aynı kullanıcıya günlük maksimum gösterim sayısı.</div>'
    + '</div>';

  // Bölge
  h += '<div class="ads-sect">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:map-point-bold" style="font-size:15px;color:#3B82F6"></iconify-icon><span>Bölge Sınırı</span></div>'
    + '<div class="ads-chip-row">';
  var regions = ['Mahalle','İlçe bazlı','5 km çap','10 km çap','İl bazlı','Bölge bazlı','Ülke geneli','Opsiyonel konum'];
  for (var r = 0; r < regions.length; r++) {
    var sel = regions[r] === p.region;
    h += '<button class="ads-chip' + (sel ? ' active' : '') + '" onclick="_adsSetRegion(\'' + p.id + '\', \'' + regions[r] + '\')">' + regions[r] + '</button>';
  }
  h += '</div></div>';

  // Aktif kampanyalar özeti
  if (using.length > 0) {
    h += '<div class="ads-sect">'
      + '<div class="ads-sect-head"><iconify-icon icon="solar:shop-bold" style="font-size:15px;color:#22C55E"></iconify-icon>'
      + '<span>Bu Yerleşimi Kullanan İşletmeler</span>'
      + '<span class="ads-sect-badge" style="background:#22C55E18;color:#22C55E">' + using.length + '</span></div>'
      + '<div class="ads-using-list">';
    for (var u = 0; u < using.length; u++) {
      var c = using[u];
      h += '<div class="ads-using-item" onclick="_adsCloseModal();_adsOpenAdvertiserDetail(\'' + c.id + '\')">'
        + '<div class="ads-using-avatar">' + _adsEsc(c.bizName.charAt(0)) + '</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div class="ads-using-name">' + _adsEsc(c.bizName) + '</div>'
        + '<div class="ads-using-meta">' + _adsFmt(c.spentToken) + ' / ' + _adsFmt(c.budgetToken) + ' Tkn</div>'
        + '</div>'
        + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
        + '</div>';
    }
    h += '</div></div>';
  }

  // Kaydet
  h += '<button class="ads-cta" onclick="_adsSavePlacement(\'' + p.id + '\')">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:16px"></iconify-icon>'
    + 'Yerleşimi Kaydet</button>';

  body.innerHTML = h;
}

function _adsSetPrice(id, val) {
  var p = _adsPlacement(id);
  if (!p) return;
  var n = parseFloat(val);
  if (!isNaN(n) && n >= 0) p.pricePerImpression = n;
}

function _adsSetFreq(id, val) {
  var p = _adsPlacement(id);
  if (!p) return;
  var n = parseInt(val, 10);
  if (!isNaN(n) && n > 0) p.dailyFreqCap = n;
}

function _adsSetRegion(id, region) {
  var p = _adsPlacement(id);
  if (!p) return;
  p.region = region;
  _adsRenderPlacementModal();
}

function _adsSavePlacement(id) {
  var p = _adsPlacement(id);
  if (!p) return;
  p.updatedAt = new Date().toISOString();
  _admToast(p.label + ' güncellendi', 'ok');
  _adsCloseModal();
  _adsRender();
}

/* ═══════════════════════════════════════
   P4 — Hamburger Sheet (2 Tile)
   ═══════════════════════════════════════ */
function _adsToggleHamburger() {
  if (_ads.hamburgerOpen) _adsCloseHamburger();
  else _adsOpenHamburger();
}

function _adsOpenHamburger() {
  _adsCloseHamburger();
  _ads.hamburgerOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  var active = ADMIN_AD_CAMPAIGNS.filter(function(c) { return c.status === 'active'; });
  var archived = ADMIN_AD_CAMPAIGNS.filter(function(c) { return c.status !== 'active'; });
  var activeSpent = 0, activeBudget = 0;
  for (var i = 0; i < active.length; i++) { activeSpent += active[i].spentToken; activeBudget += active[i].budgetToken; }
  var archSpent = 0;
  for (var j = 0; j < archived.length; j++) archSpent += archived[j].spentToken;

  var sheet = document.createElement('div');
  sheet.id = 'adsHamburger';
  sheet.className = 'ads-hburg-backdrop';
  sheet.onclick = function(e) { if (e.target === sheet) _adsCloseHamburger(); };

  var h = '<div class="ads-hburg-panel">'
    + '<div class="ads-hburg-head">'
    + '<div><div class="ads-mtitle">Reklam Operasyonları</div>'
    + '<div class="ads-msub">Reklam veren & arşiv görünümü</div></div>'
    + '<div class="ads-close" onclick="_adsCloseHamburger()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>'
    + '<div class="ads-hburg-tiles">'

    // Tile 1: Aktif Reklam Verenler
    + '<button class="ads-hburg-tile ads-hburg-tile--active" onclick="_adsGoView(\'advertisers\')">'
    + '<div class="ads-hburg-tile-head">'
    + '<div class="ads-hburg-tile-icon" style="background:linear-gradient(135deg,#22C55E,#16A34A)"><iconify-icon icon="solar:users-group-two-rounded-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div class="ads-hburg-live"><span class="ads-live-dot"></span>YAYINDA</div>'
    + '</div>'
    + '<div class="ads-hburg-tile-title">Reklam Veren İşletmeler</div>'
    + '<div class="ads-hburg-tile-sub">Aktif bütçe harcayan kampanyalar</div>'
    + '<div class="ads-hburg-stats">'
    + '<span><b>' + active.length + '</b> kampanya</span>'
    + '<span><b>' + _adsFmt(activeSpent) + '</b> Tkn harcandı</span>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" class="ads-hburg-chev"></iconify-icon>'
    + '</button>'

    // Tile 2: Geçmiş
    + '<button class="ads-hburg-tile ads-hburg-tile--archive" onclick="_adsGoView(\'archive\')">'
    + '<div class="ads-hburg-tile-head">'
    + '<div class="ads-hburg-tile-icon" style="background:linear-gradient(135deg,#64748B,#94A3B8)"><iconify-icon icon="solar:archive-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div class="ads-hburg-archived">ARŞİV</div>'
    + '</div>'
    + '<div class="ads-hburg-tile-title">Geçmiş Reklamlar</div>'
    + '<div class="ads-hburg-tile-sub">Biten / iptal edilen kampanya arşivi</div>'
    + '<div class="ads-hburg-stats">'
    + '<span><b>' + archived.length + '</b> kayıt</span>'
    + '<span><b>' + _adsFmt(archSpent) + '</b> Tkn toplam</span>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" class="ads-hburg-chev"></iconify-icon>'
    + '</button>'

    + '</div></div>';

  sheet.innerHTML = h;
  adminPhone.appendChild(sheet);
  requestAnimationFrame(function() { sheet.classList.add('open'); });
}

function _adsCloseHamburger() {
  var s = document.getElementById('adsHamburger');
  if (!s) return;
  s.classList.remove('open');
  setTimeout(function() { if (s.parentNode) s.remove(); }, 240);
  _ads.hamburgerOpen = false;
}

function _adsGoView(view) {
  _ads.view = view;
  _ads.advertisersSearch = '';
  _ads.advertisersPlacementFilter = '';
  _ads.advertisersBudgetFilter = '';
  _adsCloseHamburger();
  _adsRender();
}

/* ═══════════════════════════════════════
   P5 — Reklam Veren Listesi + Filtreler
   ═══════════════════════════════════════ */
function _adsRenderAdvertisers(mode) {
  // mode: 'active' | 'archive'
  var pool = ADMIN_AD_CAMPAIGNS.filter(function(c) {
    return mode === 'active' ? c.status === 'active' : c.status !== 'active';
  });

  // Filtreler
  if (_ads.advertisersPlacementFilter) {
    pool = pool.filter(function(c) { return c.placements.indexOf(_ads.advertisersPlacementFilter) > -1; });
  }
  if (_ads.advertisersBudgetFilter) {
    pool = pool.filter(function(c) {
      if (_ads.advertisersBudgetFilter === 'lt10k') return c.budgetToken < 10000;
      if (_ads.advertisersBudgetFilter === '10k_30k') return c.budgetToken >= 10000 && c.budgetToken <= 30000;
      if (_ads.advertisersBudgetFilter === 'gt30k') return c.budgetToken > 30000;
      return true;
    });
  }
  if (_ads.advertisersSearch.trim()) {
    var q = _ads.advertisersSearch.toLowerCase().trim();
    pool = pool.filter(function(c) {
      return c.bizName.toLowerCase().indexOf(q) > -1
        || (c.bizOwner && c.bizOwner.toLowerCase().indexOf(q) > -1);
    });
  }

  // Sıralama: aktifler kalan günlere göre, arşiv bitiş tarihine göre
  pool.sort(function(a, b) { return new Date(b.endDate) - new Date(a.endDate); });

  var h = '<div class="adm-fadeIn ads-wrap">';

  // Filtre bar
  h += '<div style="display:flex;flex-direction:column;gap:8px">';
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="ads-search" placeholder="İşletme adı veya sahip..." value="' + _adsEsc(_ads.advertisersSearch) + '" oninput="_ads.advertisersSearch=this.value;_adsRenderBody()" />'
    + '</div>';

  // Placement filter
  h += '<div class="ads-chip-row">'
    + '<span class="ads-chip-label">Tür:</span>'
    + '<button class="ads-chip' + (!_ads.advertisersPlacementFilter ? ' active' : '') + '" onclick="_ads.advertisersPlacementFilter=\'\';_adsRenderBody()">Tümü</button>';
  for (var pi = 0; pi < ADMIN_AD_PLACEMENTS.length; pi++) {
    var p = ADMIN_AD_PLACEMENTS[pi];
    var sel = _ads.advertisersPlacementFilter === p.id;
    h += '<button class="ads-chip' + (sel ? ' active' : '') + '" '
      + 'style="' + (sel ? 'border-color:' + p.color + ';background:' + p.color + '15;color:' + p.color : '') + '" '
      + 'onclick="_ads.advertisersPlacementFilter=\'' + p.id + '\';_adsRenderBody()">'
      + '<iconify-icon icon="' + p.icon + '" style="font-size:11px"></iconify-icon>' + _adsEsc(p.label) + '</button>';
  }
  h += '</div>';

  // Budget filter
  h += '<div class="ads-chip-row">'
    + '<span class="ads-chip-label">Bütçe:</span>'
    + '<button class="ads-chip' + (!_ads.advertisersBudgetFilter ? ' active' : '') + '" onclick="_ads.advertisersBudgetFilter=\'\';_adsRenderBody()">Tümü</button>'
    + '<button class="ads-chip' + (_ads.advertisersBudgetFilter === 'lt10k' ? ' active' : '') + '" onclick="_ads.advertisersBudgetFilter=\'lt10k\';_adsRenderBody()">&lt; 10K</button>'
    + '<button class="ads-chip' + (_ads.advertisersBudgetFilter === '10k_30k' ? ' active' : '') + '" onclick="_ads.advertisersBudgetFilter=\'10k_30k\';_adsRenderBody()">10K – 30K</button>'
    + '<button class="ads-chip' + (_ads.advertisersBudgetFilter === 'gt30k' ? ' active' : '') + '" onclick="_ads.advertisersBudgetFilter=\'gt30k\';_adsRenderBody()">&gt; 30K</button>'
    + '</div>';

  h += '</div>';

  // Count
  h += '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + pool.length + ' kampanya</div>';

  if (pool.length === 0) {
    h += '<div class="ads-empty"><iconify-icon icon="solar:shop-minus-bold" style="font-size:44px;opacity:0.3"></iconify-icon>'
      + '<div>Filtreyle eşleşen kampanya yok</div></div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:8px">';
    for (var i = 0; i < pool.length; i++) h += _adsAdvertiserCard(pool[i]);
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _adsAdvertiserCard(c) {
  var pct = c.budgetToken > 0 ? Math.min(100, Math.round((c.spentToken / c.budgetToken) * 100)) : 0;
  var daysLeft = _adsDaysLeft(c.endDate);
  var isActive = c.status === 'active';

  // Progress renk — harcama durumuna göre
  var pctColor = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#22C55E';

  // Kalan gün
  var daysText;
  if (!isActive) {
    daysText = c.status === 'cancelled' ? 'İptal edildi' : 'Tamamlandı';
  } else if (daysLeft === null) {
    daysText = 'Süresiz';
  } else if (daysLeft < 0) {
    daysText = 'Süresi doldu';
  } else if (daysLeft === 0) {
    daysText = 'Bugün bitiyor';
  } else {
    daysText = daysLeft + ' gün kaldı';
  }

  // Portföy önizleme (ilk 3 placement ikonu)
  var portfolio = '';
  for (var i = 0; i < Math.min(c.placements.length, 4); i++) {
    var pl = _adsPlacement(c.placements[i]);
    if (pl) portfolio += '<div class="ads-adv-ico" style="background:' + pl.color + '18;color:' + pl.color + '" title="' + _adsEsc(pl.label) + '"><iconify-icon icon="' + pl.icon + '" style="font-size:13px"></iconify-icon></div>';
  }
  if (c.placements.length > 4) {
    portfolio += '<div class="ads-adv-ico ads-adv-ico--more">+' + (c.placements.length - 4) + '</div>';
  }

  return '<div class="ads-adv-card' + (isActive ? '' : ' ads-adv-card--archived') + '" onclick="_adsOpenAdvertiserDetail(\'' + c.id + '\')">'
    + '<div class="ads-adv-avatar" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA)">' + _adsEsc(c.bizName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="ads-adv-name">' + _adsEsc(c.bizName) + '</span>'
    + (isActive ? '<span class="ads-live-badge"><span class="ads-live-dot"></span>canlı</span>' : '<span class="ads-arch-badge">' + (c.status === 'cancelled' ? 'iptal' : 'bitti') + '</span>')
    + '</div>'
    + '<div class="ads-adv-meta">' + _adsEsc(c.bizOwner) + ' · ' + c.placements.length + ' yerleşim · ' + daysText + '</div>'
    + '<div class="ads-adv-portfolio">' + portfolio + '</div>'
    + '<div class="ads-progress-row">'
    + '<div class="ads-progress-bar"><div class="ads-progress-fill" style="width:' + pct + '%;background:linear-gradient(to right,' + pctColor + ',' + pctColor + 'cc)"></div></div>'
    + '<span class="ads-progress-val">' + _adsFmt(c.spentToken) + ' / ' + _adsFmt(c.budgetToken) + ' Tkn (%' + pct + ')</span>'
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted);align-self:center"></iconify-icon>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P6 — Reklam Veren Detay (CRM)
   ═══════════════════════════════════════ */
function _adsOpenAdvertiserDetail(campaignId) {
  _adsCloseDetail();
  var c = ADMIN_AD_CAMPAIGNS.find(function(x) { return x.id === campaignId; });
  if (!c) return;
  _ads.detailCampaignId = campaignId;

  var adminPhone = document.getElementById('adminPhone');
  var d = document.createElement('div');
  d.id = 'adsDetail';
  d.className = 'prof-overlay open';
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:82;animation:admFadeIn .3s ease;overflow-y:auto';
  adminPhone.appendChild(d);
  _adsRenderAdvertiserDetail();
}

function _adsCloseDetail() {
  var d = document.getElementById('adsDetail');
  if (!d) return;
  d.style.opacity = '0';
  setTimeout(function() { if (d.parentNode) d.remove(); }, 180);
  _ads.detailCampaignId = null;
}

function _adsRenderAdvertiserDetail() {
  var d = document.getElementById('adsDetail');
  if (!d) return;
  var c = ADMIN_AD_CAMPAIGNS.find(function(x) { return x.id === _ads.detailCampaignId; });
  if (!c) return;

  var pct = c.budgetToken > 0 ? Math.min(100, Math.round((c.spentToken / c.budgetToken) * 100)) : 0;
  var remaining = c.budgetToken - c.spentToken;
  var daysLeft = _adsDaysLeft(c.endDate);
  var totalDays = Math.max(1, Math.ceil((new Date(c.endDate) - new Date(c.startDate)) / 86400000));
  var elapsed = Math.max(0, Math.min(totalDays, Math.ceil((Date.now() - new Date(c.startDate)) / 86400000)));
  var timePct = Math.min(100, Math.round((elapsed / totalDays) * 100));

  var pctColor = pct > 85 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#22C55E';
  var isActive = c.status === 'active';

  // CTR
  var ctr = c.impressions > 0 ? (c.clicks / c.impressions * 100).toFixed(2) : '0.00';

  var h = '';

  // Sticky header
  h += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:5">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_adsCloseDetail()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + _adsEsc(c.bizName) + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + _adsEsc(c.id.toUpperCase()) + ' · ' + _adsEsc(c.bizOwner) + '</div>'
    + '</div>'
    + (isActive
        ? '<span class="ads-live-badge"><span class="ads-live-dot"></span>yayında</span>'
        : '<span class="ads-arch-badge">' + (c.status === 'cancelled' ? 'iptal' : 'bitti') + '</span>')
    + '</div>';

  h += '<div class="adm-fadeIn ads-wrap">';

  // Kimlik kartı + hızlı link
  h += '<div class="ads-id-card">'
    + '<div class="ads-id-avatar" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA)">' + _adsEsc(c.bizName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="ads-id-name">' + _adsEsc(c.bizName) + '</div>'
    + '<div class="ads-id-owner">Sahip: ' + _adsEsc(c.bizOwner) + ' · ID: ' + _adsEsc(c.bizId) + '</div>'
    + '</div>'
    + '<button class="ads-quick-link" onclick="_adsJumpToBiz(\'' + c.bizId + '\')"><iconify-icon icon="solar:arrow-right-up-bold" style="font-size:12px"></iconify-icon>Profil</button>'
    + '</div>';

  // Reklam Portföyü
  h += '<div class="ads-sect">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:gallery-wide-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Reklam Portföyü</span>'
    + '<span class="ads-sect-badge">' + c.placements.length + ' yerleşim</span></div>'
    + '<div class="ads-portfolio-list">';
  for (var i = 0; i < c.placements.length; i++) {
    var pl = _adsPlacement(c.placements[i]);
    if (!pl) continue;
    h += '<div class="ads-portfolio-item" onclick="_adsCloseDetail();_adsOpenPlacementModal(\'' + pl.id + '\')">'
      + '<div class="ads-portfolio-icon" style="background:' + pl.color + '18;color:' + pl.color + '"><iconify-icon icon="' + pl.icon + '" style="font-size:16px"></iconify-icon></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="ads-portfolio-label">' + _adsEsc(pl.label) + '</div>'
      + '<div class="ads-portfolio-meta">' + _adsEsc(pl.groupLabel) + ' · ' + pl.pricePerImpression.toFixed(1) + ' Tkn/gös</div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px;color:var(--text-muted)"></iconify-icon>'
      + '</div>';
  }
  h += '</div></div>';

  // Bütçe Kontrolü
  h += '<div class="ads-sect ads-sect--budget">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:wallet-money-bold" style="font-size:15px;color:#22C55E"></iconify-icon>'
    + '<span>Bütçe Kontrolü</span>'
    + '<span class="ads-sect-badge" style="background:' + pctColor + '18;color:' + pctColor + '">%' + pct + '</span></div>'

    // Progress
    + '<div class="ads-big-progress">'
    + '<div class="ads-big-progress-fill" style="width:' + pct + '%;background:linear-gradient(to right,' + pctColor + ',' + pctColor + 'cc)"></div>'
    + '</div>'

    + '<div class="ads-budget-grid">'
    + '<div class="ads-budget-cell"><div class="ads-budget-lbl">Toplam Bütçe</div><div class="ads-budget-val">' + _adsFmt(c.budgetToken) + ' <span>Tkn</span></div></div>'
    + '<div class="ads-budget-cell"><div class="ads-budget-lbl">Harcanan</div><div class="ads-budget-val" style="color:' + pctColor + '">' + _adsFmt(c.spentToken) + ' <span>Tkn</span></div></div>'
    + '<div class="ads-budget-cell"><div class="ads-budget-lbl">Kalan</div><div class="ads-budget-val" style="color:#22C55E">' + _adsFmt(remaining) + ' <span>Tkn</span></div></div>'
    + '</div>'
    + '</div>';

  // Zaman Çizelgesi
  var daysText;
  if (!isActive) {
    daysText = c.status === 'cancelled' ? 'İptal edildi' : 'Tamamlandı';
  } else if (daysLeft === null || daysLeft < 0) {
    daysText = 'Süresi doldu';
  } else if (daysLeft === 0) {
    daysText = 'Bugün bitiyor';
  } else {
    daysText = daysLeft + ' gün kaldı';
  }

  h += '<div class="ads-sect">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:calendar-bold" style="font-size:15px;color:#3B82F6"></iconify-icon>'
    + '<span>Zaman Çizelgesi</span>'
    + '<span class="ads-sect-badge" style="background:' + (isActive ? '#3B82F618;color:#3B82F6' : '#6B728018;color:#6B7280') + '">' + daysText + '</span></div>'

    + '<div class="ads-timeline-grid">'
    + '<div class="ads-tl-cell"><div class="ads-tl-lbl">Başlangıç</div><div class="ads-tl-val">' + _adsDateShort(c.startDate) + '</div></div>'
    + '<div class="ads-tl-arrow"><iconify-icon icon="solar:arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div class="ads-tl-cell"><div class="ads-tl-lbl">Bitiş</div><div class="ads-tl-val">' + _adsDateShort(c.endDate) + '</div></div>'
    + '</div>'

    + '<div class="ads-big-progress"><div class="ads-big-progress-fill" style="width:' + timePct + '%;background:linear-gradient(to right,#3B82F6,#06B6D4)"></div></div>'
    + '<div class="ads-time-meta">' + elapsed + ' / ' + totalDays + ' gün tamamlandı</div>'
    + '</div>';

  // Performans
  h += '<div class="ads-sect">'
    + '<div class="ads-sect-head"><iconify-icon icon="solar:graph-up-bold" style="font-size:15px;color:#F59E0B"></iconify-icon>'
    + '<span>Performans</span></div>'
    + '<div class="ads-perf-grid">'
    + '<div class="ads-perf-cell"><div class="ads-perf-lbl">Gösterim</div><div class="ads-perf-val">' + _adsFmt(c.impressions) + '</div></div>'
    + '<div class="ads-perf-cell"><div class="ads-perf-lbl">Tıklama</div><div class="ads-perf-val">' + _adsFmt(c.clicks) + '</div></div>'
    + '<div class="ads-perf-cell"><div class="ads-perf-lbl">CTR</div><div class="ads-perf-val">%' + ctr + '</div></div>'
    + '</div>';

  // Günlük harcama mini grafik
  if (c.dailySpend && c.dailySpend.length > 0) {
    var maxSpend = 0;
    for (var d2 = 0; d2 < c.dailySpend.length; d2++) if (c.dailySpend[d2] > maxSpend) maxSpend = c.dailySpend[d2];
    h += '<div class="ads-bars">';
    for (var b = 0; b < c.dailySpend.length; b++) {
      var barH = maxSpend > 0 ? Math.max(4, Math.round((c.dailySpend[b] / maxSpend) * 60)) : 4;
      h += '<div class="ads-bar-wrap" title="' + c.dailySpend[b] + ' Tkn"><div class="ads-bar" style="height:' + barH + 'px"></div></div>';
    }
    h += '</div><div class="ads-time-meta">Günlük token harcaması (son ' + c.dailySpend.length + ' gün)</div>';
  }
  h += '</div>';

  // Aksiyonlar
  if (isActive) {
    h += '<div class="ads-actions">'
      + '<button class="ads-act-btn" style="background:#DBEAFE;color:#3B82F6" onclick="_admToast(\'Bütçe artırma paneli yakında\')">'
      + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:15px"></iconify-icon>Bütçe Artır</button>'
      + '<button class="ads-act-btn" style="background:#FEE2E2;color:#EF4444" onclick="_adsCancelCampaign(\'' + c.id + '\')">'
      + '<iconify-icon icon="solar:close-circle-bold" style="font-size:15px"></iconify-icon>Reklamı Durdur</button>'
      + '</div>';
  }

  h += '</div>';
  d.innerHTML = h;
  d.scrollTop = 0;
}

function _adsJumpToBiz(bizId) {
  _admToast('İşletme profiline yönlendirme: ' + bizId);
}

function _adsCancelCampaign(campaignId) {
  var c = ADMIN_AD_CAMPAIGNS.find(function(x) { return x.id === campaignId; });
  if (!c) return;
  if (!confirm(c.bizName + ' reklamı durdurulacak. Devam?')) return;
  c.status = 'cancelled';
  _admToast('Reklam durduruldu', 'ok');
  _adsCloseDetail();
  _adsRender();
}

/* ═══════════════════════════════════════
   P7 — Stiller (.ads-*)
   ═══════════════════════════════════════ */
function _adsInjectStyles() {
  if (document.getElementById('adsStyles')) return;
  var css = ''
    /* Layout */
    + '.ads-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px}'
    + '.ads-hamburger{width:38px;height:38px;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(139,92,246,0.3);transition:transform .15s}'
    + '.ads-hamburger:active{transform:scale(0.93)}'
    /* Hero */
    + '.ads-hero{position:relative;background:linear-gradient(135deg,#4C1D95,#7C3AED 50%,#22C55E);border-radius:var(--r-xl);padding:18px;color:#fff;overflow:hidden}'
    + '.ads-hero-shine{position:absolute;right:-30px;top:-30px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,0.35),transparent 65%);z-index:1}'
    /* Groups */
    + '.ads-group{display:flex;flex-direction:column;gap:10px}'
    + '.ads-group-head{display:flex;align-items:center;gap:10px;padding:2px 2px}'
    + '.ads-group-badge{width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.ads-group-title{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.ads-group-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.ads-plc-grid{display:flex;flex-direction:column;gap:8px}'
    /* Placement card */
    + '.ads-plc-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;gap:12px;cursor:pointer;transition:all .15s}'
    + '.ads-plc-card:hover{border-color:#8B5CF6;transform:translateY(-1px);box-shadow:0 4px 12px rgba(139,92,246,0.08)}'
    + '.ads-plc-icon{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.ads-plc-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}'
    + '.ads-plc-label{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}'
    + '.ads-plc-desc{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)}'
    + '.ads-plc-meta{display:flex;gap:12px;flex-wrap:wrap;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-secondary);margin-top:4px}'
    + '.ads-plc-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.ads-plc-using{display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;gap:4px}'
    + '.ads-using-badge{font:var(--fw-semibold) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);background:rgba(34,197,94,0.12);color:#22C55E;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}'
    + '.ads-using-badge--idle{background:var(--bg-phone-secondary);color:var(--text-muted)}'
    + '.ads-live-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#22C55E;animation:adsLivePulse 1.4s ease-in-out infinite}'
    + '@keyframes adsLivePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.3)}}'
    /* Search & chips */
    + '.ads-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.ads-search:focus{border-color:#8B5CF6}'
    + '.ads-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.ads-chip-label{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px}'
    + '.ads-chip{padding:6px 11px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}'
    + '.ads-chip:hover{background:var(--bg-phone-secondary)}'
    + '.ads-chip.active{border-color:#8B5CF6;background:rgba(139,92,246,0.1);color:#8B5CF6}'
    /* Empty */
    + '.ads-empty{padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--text-muted);font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font)}'
    /* Advertiser card */
    + '.ads-adv-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;gap:10px;cursor:pointer;transition:all .15s}'
    + '.ads-adv-card:hover{border-color:#22C55E;transform:translateY(-1px);box-shadow:0 4px 12px rgba(34,197,94,0.08)}'
    + '.ads-adv-card--archived{opacity:0.75}'
    + '.ads-adv-card--archived:hover{border-color:#8B5CF6;box-shadow:0 4px 12px rgba(139,92,246,0.08)}'
    + '.ads-adv-avatar{width:44px;height:44px;border-radius:var(--r-md);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 16px/1 var(--font);flex-shrink:0}'
    + '.ads-adv-name{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.ads-adv-meta{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.ads-adv-portfolio{display:flex;gap:3px;margin-top:6px}'
    + '.ads-adv-ico{width:22px;height:22px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center}'
    + '.ads-adv-ico--more{background:var(--bg-phone-secondary);color:var(--text-muted);font:var(--fw-bold) 9px/1 var(--font)}'
    /* Badges */
    + '.ads-live-badge{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:#22C55E;background:rgba(34,197,94,0.12);padding:3px 8px;border-radius:var(--r-full)}'
    + '.ads-arch-badge{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:#6B7280;background:rgba(107,114,128,0.12);padding:3px 8px;border-radius:var(--r-full)}'
    /* Progress */
    + '.ads-progress-row{display:flex;flex-direction:column;gap:4px;margin-top:8px}'
    + '.ads-progress-bar{height:6px;border-radius:var(--r-full);background:var(--bg-phone-secondary);overflow:hidden}'
    + '.ads-progress-fill{height:100%;border-radius:var(--r-full);transition:width .3s}'
    + '.ads-progress-val{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted)}';
  var s = document.createElement('style');
  s.id = 'adsStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _adsInjectStylesPart2();
}

function _adsInjectStylesPart2() {
  if (document.getElementById('adsStyles2')) return;
  var css = ''
    /* Modal */
    + '.ads-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.ads-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.ads-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.ads-modal-backdrop.open .ads-modal{transform:translateY(0)}'
    + '.ads-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.ads-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.ads-mtitle{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.ads-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.ads-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary);flex-shrink:0}'
    /* Sections */
    + '.ads-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.ads-sect--budget{border-color:rgba(34,197,94,0.3);background:linear-gradient(135deg,rgba(34,197,94,0.03),transparent 70%)}'
    + '.ads-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.ads-sect-head span:first-of-type{flex:1}'
    + '.ads-sect-badge{font:var(--fw-bold) 9px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);background:rgba(139,92,246,0.12);color:#8B5CF6}'
    + '.ads-hint{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:var(--r-md);background:rgba(139,92,246,0.06);color:var(--text-secondary);font:var(--fw-regular) 11px/1.4 var(--font)}'
    + '.ads-field{display:flex;flex-direction:column;gap:5px}'
    + '.ads-field label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    /* Token input */
    + '.ads-token-wrap{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);transition:border-color .15s}'
    + '.ads-token-wrap:focus-within{border-color:#F59E0B}'
    + '.ads-token-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);padding:2px 0}'
    + '.ads-token-suffix{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)}'
    /* Slider */
    + '.ads-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:var(--r-full);background:var(--border-subtle);outline:none;cursor:pointer}'
    + '.ads-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#8B5CF6;cursor:pointer;border:3px solid #fff;box-shadow:0 2px 6px rgba(139,92,246,0.4)}'
    + '.ads-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#8B5CF6;cursor:pointer;border:3px solid #fff;box-shadow:0 2px 6px rgba(139,92,246,0.4)}'
    + '.ads-slider-val{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#8B5CF6;text-align:center}'
    /* Using list (placement modal) */
    + '.ads-using-list{display:flex;flex-direction:column;gap:4px}'
    + '.ads-using-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);cursor:pointer;transition:background .15s}'
    + '.ads-using-item:hover{background:rgba(34,197,94,0.1)}'
    + '.ads-using-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 12px/1 var(--font);flex-shrink:0}'
    + '.ads-using-name{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary)}'
    + '.ads-using-meta{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px}'
    /* CTA */
    + '.ads-cta{width:100%;padding:13px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(139,92,246,0.3);transition:opacity .15s,transform .1s}'
    + '.ads-cta:hover{opacity:0.92}'
    + '.ads-cta:active{transform:scale(0.99)}'
    /* Hamburger panel */
    + '.ads-hburg-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:85;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.ads-hburg-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.ads-hburg-panel{width:100%;max-height:80vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;padding:16px;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;gap:12px}'
    + '.ads-hburg-backdrop.open .ads-hburg-panel{transform:translateY(0)}'
    + '.ads-hburg-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle)}'
    + '.ads-hburg-tiles{display:flex;flex-direction:column;gap:10px}'
    + '.ads-hburg-tile{position:relative;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;cursor:pointer;text-align:left;transition:all .2s;overflow:hidden;display:flex;flex-direction:column;gap:6px}'
    + '.ads-hburg-tile:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,0.06)}'
    + '.ads-hburg-tile--active{border-color:rgba(34,197,94,0.35);background:linear-gradient(135deg,rgba(34,197,94,0.05),transparent 60%)}'
    + '.ads-hburg-tile--archive{border-color:rgba(148,163,184,0.35);background:linear-gradient(135deg,rgba(148,163,184,0.05),transparent 60%)}'
    + '.ads-hburg-tile-head{display:flex;align-items:center;justify-content:space-between}'
    + '.ads-hburg-tile-icon{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.1)}'
    + '.ads-hburg-live{display:inline-flex;align-items:center;gap:4px;font:var(--fw-bold) 9px/1 var(--font);color:#22C55E;background:rgba(34,197,94,0.12);padding:4px 8px;border-radius:var(--r-full);letter-spacing:.5px}'
    + '.ads-hburg-archived{font:var(--fw-bold) 9px/1 var(--font);color:#6B7280;background:rgba(107,114,128,0.12);padding:4px 8px;border-radius:var(--r-full);letter-spacing:.5px}'
    + '.ads-hburg-tile-title{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.ads-hburg-tile-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)}'
    + '.ads-hburg-stats{display:flex;gap:12px;font:var(--fw-regular) 11px/1 var(--font);color:var(--text-secondary);margin-top:4px}'
    + '.ads-hburg-stats b{color:var(--text-primary);font:var(--fw-bold) var(--fs-sm)/1 var(--font)}'
    + '.ads-hburg-chev{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-muted)}'
    /* Advertiser detail */
    + '.ads-id-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(139,92,246,0.05),transparent);border:1px solid rgba(139,92,246,0.2)}'
    + '.ads-id-avatar{width:48px;height:48px;border-radius:var(--r-md);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 18px/1 var(--font)}'
    + '.ads-id-name{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.ads-id-owner{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.ads-quick-link{padding:6px 12px;border-radius:var(--r-full);border:1px solid #8B5CF6;background:rgba(139,92,246,0.08);color:#8B5CF6;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:3px}'
    + '.ads-quick-link:hover{background:#8B5CF6;color:#fff}'
    + '.ads-portfolio-list{display:flex;flex-direction:column;gap:5px}'
    + '.ads-portfolio-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);cursor:pointer;transition:background .15s}'
    + '.ads-portfolio-item:hover{background:rgba(139,92,246,0.08)}'
    + '.ads-portfolio-icon{width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.ads-portfolio-label{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary)}'
    + '.ads-portfolio-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Big progress */
    + '.ads-big-progress{height:10px;border-radius:var(--r-full);background:var(--bg-phone-secondary);overflow:hidden}'
    + '.ads-big-progress-fill{height:100%;border-radius:var(--r-full);transition:width .3s}'
    + '.ads-budget-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}'
    + '.ads-budget-cell{padding:10px 8px;border-radius:var(--r-md);background:var(--bg-phone-secondary);text-align:center}'
    + '.ads-budget-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.ads-budget-val{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:5px}'
    + '.ads-budget-val span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-left:2px}'
    /* Timeline */
    + '.ads-timeline-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}'
    + '.ads-tl-cell{padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);text-align:center}'
    + '.ads-tl-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.ads-tl-val{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:5px}'
    + '.ads-tl-arrow{display:flex;align-items:center;justify-content:center}'
    + '.ads-time-meta{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);text-align:right}'
    /* Performance */
    + '.ads-perf-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}'
    + '.ads-perf-cell{padding:10px 8px;border-radius:var(--r-md);background:var(--bg-phone-secondary);text-align:center}'
    + '.ads-perf-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.ads-perf-val{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#F59E0B;margin-top:5px}'
    /* Daily bars */
    + '.ads-bars{display:flex;align-items:flex-end;gap:3px;height:70px;padding:6px;background:var(--bg-phone-secondary);border-radius:var(--r-md)}'
    + '.ads-bar-wrap{flex:1;display:flex;align-items:flex-end;justify-content:center}'
    + '.ads-bar{width:100%;max-width:16px;background:linear-gradient(to top,#8B5CF6,#A78BFA);border-radius:var(--r-sm) var(--r-sm) 0 0;transition:height .3s}'
    /* Actions */
    + '.ads-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}'
    + '.ads-act-btn{padding:11px;border:none;border-radius:var(--r-md);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:opacity .15s}'
    + '.ads-act-btn:hover{opacity:0.88}';
  var s = document.createElement('style');
  s.id = 'adsStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

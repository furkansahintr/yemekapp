/* ═══════════════════════════════════════════════════════════
   ADMIN MEMBERS — Üye Yönetimi (Kullanıcılar + İşletmeler 360°)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _mbr = {
  tab: 'users',        /* users | businesses */
  search: '',
  filter: 'all',       /* all | active | banned/suspended | pending | premium */
  cityFilter: '',
  filtersOpen: false
};

/* ═══ MAIN RENDER ═══ */
function renderAdminUsers() {
  _admInjectStyles();
  _mbrInjectStyles();
  var c = document.getElementById('adminUsersContainer');
  if (!c) return;

  var h = '<div class="adm-fadeIn" style="padding:16px;display:flex;flex-direction:column;gap:14px">';

  /* ── Big Header ── */
  h += '<div style="font:var(--fw-bold) 22px/1.1 var(--font);color:var(--text-primary)">Üyeler</div>';

  /* ── Main Tabs: Kullanıcılar / İşletmeler ── */
  h += '<div style="display:flex;background:var(--bg-phone-secondary);border-radius:var(--r-lg);padding:3px;gap:2px">'
    + '<button class="mbr-main-tab' + (_mbr.tab === 'users' ? ' active' : '') + '" onclick="_mbrSwitchTab(\'users\')">'
    + '<iconify-icon icon="solar:user-bold" style="font-size:14px"></iconify-icon>Kullanıcılar <span class="mbr-main-tab-count">' + ADMIN_USERS.length + '</span></button>'
    + '<button class="mbr-main-tab' + (_mbr.tab === 'businesses' ? ' active' : '') + '" onclick="_mbrSwitchTab(\'businesses\')">'
    + '<iconify-icon icon="solar:shop-bold" style="font-size:14px"></iconify-icon>İşletmeler <span class="mbr-main-tab-count">' + ADMIN_BUSINESSES.length + '</span></button>'
    + '</div>';

  /* ── Search Bar + Filter Toggle ── */
  h += '<div style="display:flex;gap:8px">'
    + '<div style="flex:1;position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="mbr-search" placeholder="' + (_mbr.tab === 'users' ? 'Ad, kullanıcı adı veya telefon...' : 'İşletme adı, sahip veya şehir...') + '" value="' + _mbrEsc(_mbr.search) + '" oninput="_mbrSearchChange(this.value)" />'
    + '</div>'
    + '<div class="mbr-icon-btn" onclick="_mbrToggleFilters()"><iconify-icon icon="solar:filter-bold" style="font-size:16px;color:var(--text-secondary)"></iconify-icon>' + _mbrFilterBadge() + '</div>'
    + '</div>';

  /* ── Filter Panel ── */
  if (_mbr.filtersOpen) {
    h += _mbrRenderFilters();
  }

  /* ── List ── */
  if (_mbr.tab === 'users') {
    h += _mbrRenderUserList();
  } else {
    h += _mbrRenderBizList();
  }

  h += '<div style="height:24px"></div></div>';
  c.innerHTML = h;
}

/* ═══════════════════════════════════════
   USER LIST
   ═══════════════════════════════════════ */
function _mbrRenderUserList() {
  var list = _mbrFilteredUsers();
  var h = '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:2px">' + list.length + ' kullanıcı listeleniyor</div>';

  if (list.length === 0) return h + _mbrEmpty('solar:user-bold', 'Kullanıcı bulunamadı');

  h += '<div style="display:flex;flex-direction:column;gap:6px">';
  for (var i = 0; i < list.length; i++) {
    var u = list[i];
    var stColor = u.status === 'active' ? '#22C55E' : '#EF4444';
    var stLabel = u.status === 'active' ? 'Aktif' : 'Yasaklı';
    h += '<div class="mbr-row" onclick="_mbrOpenUserDetail(\'' + u.id + '\')">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font:var(--fw-bold) 14px/1 var(--font)">' + u.name.charAt(0) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;align-items:center;gap:6px">'
      + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + u.name + '</span>'
      + '<span class="mbr-badge" style="background:' + stColor + '18;color:' + stColor + '">' + stLabel + '</span>'
      + (u.isPremium ? '<span class="mbr-badge" style="background:#FEF3C7;color:#F59E0B">Premium</span>' : '')
      + '</div>'
      + '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + u.city + (u.district ? ', ' + u.district : '') + ' · ' + _admDate(u.joinDate).split(' ')[0] + ' ' + _admDate(u.joinDate).split(' ')[1] + '</div>'
      + '</div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)">' + u.orders + ' sipariş</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admRelative(u.lastActive) + '</div>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   BUSINESS LIST
   ═══════════════════════════════════════ */
function _mbrRenderBizList() {
  var list = _mbrFilteredBiz();
  var h = '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:2px">' + list.length + ' işletme listeleniyor</div>';

  if (list.length === 0) return h + _mbrEmpty('solar:shop-bold', 'İşletme bulunamadı');

  h += '<div style="display:flex;flex-direction:column;gap:6px">';
  for (var i = 0; i < list.length; i++) {
    var b = list[i];
    var stColor = b.status === 'active' ? '#22C55E' : b.status === 'suspended' ? '#EF4444' : '#F59E0B';
    var stLabel = b.status === 'active' ? 'Aktif' : b.status === 'suspended' ? 'Askıda' : 'Bekleyen';
    h += '<div class="mbr-row" onclick="_mbrOpenBizDetail(\'' + b.id + '\')">'
      + '<div style="width:38px;height:38px;border-radius:var(--r-md);background:linear-gradient(135deg,#3B82F6,#06B6D4);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font:var(--fw-bold) 14px/1 var(--font)">' + b.name.charAt(0) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;align-items:center;gap:6px">'
      + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + b.name + '</span>'
      + '<span class="mbr-badge" style="background:' + stColor + '18;color:' + stColor + '">' + stLabel + '</span>'
      + (b.plan === 'premium' ? '<span class="mbr-badge" style="background:#FEF3C7;color:#F59E0B">Premium</span>' : '')
      + '</div>'
      + '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + b.owner + ' · ' + b.city + ' · ' + b.branches + ' şube</div>'
      + '</div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)">' + b.rating.toFixed(1) + ' ★</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admFmt(b.monthlyOrders) + '/ay</div>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   FILTER PANEL
   ═══════════════════════════════════════ */
function _mbrRenderFilters() {
  var h = '<div class="mbr-filter-panel">';

  /* Status */
  h += '<div style="margin-bottom:12px">'
    + '<div class="mbr-filter-label">Durum</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  if (_mbr.tab === 'users') {
    h += _mbrChip('Tümü','all') + _mbrChip('Aktif','active') + _mbrChip('Yasaklı','banned') + _mbrChip('Premium','premium');
  } else {
    h += _mbrChip('Tümü','all') + _mbrChip('Aktif','active') + _mbrChip('Askıda','suspended') + _mbrChip('Bekleyen','pending');
  }
  h += '</div></div>';

  /* City */
  var cities = [];
  var src = _mbr.tab === 'users' ? ADMIN_USERS : ADMIN_BUSINESSES;
  for (var i = 0; i < src.length; i++) {
    if (cities.indexOf(src[i].city) === -1) cities.push(src[i].city);
  }
  cities.sort();
  h += '<div style="margin-bottom:8px">'
    + '<div class="mbr-filter-label">Şehir</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<button class="mbr-chip' + (!_mbr.cityFilter ? ' active' : '') + '" onclick="_mbrSetCity(\'\')">Tümü</button>';
  for (var j = 0; j < cities.length; j++) {
    h += '<button class="mbr-chip' + (_mbr.cityFilter === cities[j] ? ' active' : '') + '" onclick="_mbrSetCity(\'' + cities[j] + '\')">' + cities[j] + '</button>';
  }
  h += '</div></div>';

  /* Reset */
  h += '<div style="text-align:right;padding-top:8px;border-top:1px solid var(--border-subtle)">'
    + '<button class="mbr-reset-btn" onclick="_mbrResetFilters()">Temizle</button>'
    + '</div></div>';
  return h;
}

/* ═══════════════════════════════════════
   USER 360° DETAIL — Side Drawer
   ═══════════════════════════════════════ */
function _mbrOpenUserDetail(uid) {
  var u = ADMIN_USERS.find(function(x) { return x.id === uid; });
  if (!u) return;
  _mbrRemoveDrawer();

  var stColor = u.status === 'active' ? '#22C55E' : '#EF4444';
  var stLabel = u.status === 'active' ? 'Aktif' : 'Yasaklı';
  var userOrders = ADMIN_ORDERS.filter(function(o) { return o.user === u.name; });

  var d = document.createElement('div');
  d.id = 'mbrDrawer';
  d.className = 'mbr-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _mbrCloseDrawer(); };

  var h = '<div class="mbr-drawer"><div class="mbr-drawer-scroll">';

  /* Close */
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Kullanıcı 360°</span>'
    + '<div class="mbr-icon-btn" onclick="_mbrCloseDrawer()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  /* ── Hero ── */
  h += '<div style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%);border-radius:var(--r-xl);padding:16px;color:#fff;margin-bottom:16px">'
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">'
    + '<div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 20px/1 var(--font)">' + u.name.charAt(0) + '</div>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">' + u.name + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);opacity:.8;margin-top:3px">' + u.email + ' · ' + u.phone + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">' + stLabel + '</span>'
    + (u.isPremium ? '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">Premium</span>' : '')
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">' + u.city + ', ' + (u.district || '') + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7;margin-top:8px">Kayıt: ' + u.joinDate + ' · Son aktif: ' + _admRelative(u.lastActive) + '</div>'
    + '</div>';

  /* ── Section 1: Profil & Sağlık ── */
  h += _mbrAccordion('profile_' + uid, 'solar:user-heart-bold', '#EF4444', 'Profil & Sağlık Bilgileri', true,
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
    + _mbrInfoCell('Boy', u.height ? u.height + ' cm' : '—')
    + _mbrInfoCell('Kilo', u.weight ? u.weight + ' kg' : '—')
    + '</div>'
    + '<div style="margin-bottom:8px">'
    + '<div class="mbr-info-label">Alerjenler</div>'
    + (u.allergens && u.allergens.length > 0
      ? '<div style="display:flex;gap:4px;flex-wrap:wrap">' + u.allergens.map(function(a) { return '<span class="mbr-badge" style="background:#FEE2E2;color:#EF4444">' + a + '</span>'; }).join('') + '</div>'
      : '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Bilinen alerjen yok</div>')
    + '</div>'
    + '<div>'
    + '<div class="mbr-info-label">Sağlık Notları</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">' + (u.healthNotes || 'Not girilmemiş') + '</div>'
    + '</div>'
  );

  /* ── Section 2: Sosyal Arşiv ── */
  var socialContent = '';
  /* Stories */
  socialContent += '<div class="mbr-info-label">Hikayeler (' + (u.stories ? u.stories.length : 0) + ')</div>';
  if (u.stories && u.stories.length > 0) {
    socialContent += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:8px">';
    for (var si = 0; si < u.stories.length; si++) {
      var st = u.stories[si];
      socialContent += '<div style="min-width:110px;background:' + (st.expired ? 'var(--bg-phone-secondary)' : 'linear-gradient(135deg,#F59E0B,#EF4444)') + ';border-radius:var(--r-md);padding:8px;' + (st.expired ? 'opacity:0.6;' : 'color:#fff;') + '">'
        + '<div style="font:var(--fw-semibold) 10px/1.2 var(--font)">' + st.text + '</div>'
        + '<div style="font:var(--fw-regular) 9px/1 var(--font);' + (st.expired ? 'color:var(--text-muted)' : 'opacity:.7') + ';margin-top:4px">' + _admRelative(st.date) + (st.expired ? ' · Süresi doldu' : '') + '</div>'
        + '</div>';
    }
    socialContent += '</div>';
  } else {
    socialContent += '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-bottom:8px">Hikaye yok</div>';
  }
  /* Posts */
  socialContent += '<div class="mbr-info-label">Paylaşımlar (' + (u.posts ? u.posts.length : 0) + ')</div>';
  if (u.posts && u.posts.length > 0) {
    for (var pi = 0; pi < u.posts.length; pi++) {
      var p = u.posts[pi];
      socialContent += '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:8px;margin-bottom:4px">'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-primary)">' + p.text + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px;margin-top:4px">'
        + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">' + _admRelative(p.date) + '</span>'
        + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#EF4444"><iconify-icon icon="solar:heart-bold" style="font-size:10px"></iconify-icon> ' + p.likes + '</span>'
        + '</div></div>';
    }
  }
  /* Comments */
  socialContent += '<div class="mbr-info-label" style="margin-top:6px">Yorumlar (' + (u.comments ? u.comments.length : 0) + ')</div>';
  if (u.comments && u.comments.length > 0) {
    for (var ci = 0; ci < u.comments.length; ci++) {
      var cm = u.comments[ci];
      socialContent += '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:8px;margin-bottom:4px;border-left:3px solid var(--primary)">'
        + '<div style="font:var(--fw-semibold) 10px/1 var(--font);color:var(--primary);margin-bottom:2px">' + cm.on + '</div>'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">"' + cm.text + '"</div>'
        + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admRelative(cm.date) + '</div>'
        + '</div>';
    }
  }

  h += _mbrAccordion('social_' + uid, 'solar:gallery-bold', '#3B82F6', 'Sosyal Arşiv', false, socialContent);

  /* ── Section 3: Finans & Ticaret ── */
  var finContent = '';
  /* Order summary */
  var avgOrd = u.orders > 0 ? Math.round(u.spent / u.orders) : 0;
  finContent += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">'
    + _mbrStatMini('Sipariş', u.orders, '#3B82F6')
    + _mbrStatMini('Harcama', _admFmtTL(u.spent), '#22C55E')
    + _mbrStatMini('Ortalama', _admFmtTL(avgOrd), '#8B5CF6')
    + '</div>';
  /* Wallet */
  finContent += '<div class="mbr-info-label">Cüzdan Bakiyesi</div>'
    + '<div style="background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:var(--r-md);padding:10px;color:#fff;margin-bottom:10px;display:flex;align-items:center;gap:8px">'
    + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:20px"></iconify-icon>'
    + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">' + _admFmt(u.walletBalance || 0) + ' Token</span>'
    + '</div>';
  /* Addresses */
  finContent += '<div class="mbr-info-label">Kayıtlı Adresler (' + (u.savedAddresses ? u.savedAddresses.length : 0) + ')</div>';
  if (u.savedAddresses) {
    for (var ai = 0; ai < u.savedAddresses.length; ai++) {
      finContent += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary);padding:4px 0;' + (ai < u.savedAddresses.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
        + '<iconify-icon icon="solar:map-point-bold" style="font-size:11px;color:var(--primary);margin-right:3px"></iconify-icon>' + u.savedAddresses[ai] + '</div>';
    }
  }
  /* Social counts */
  finContent += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">'
    + _mbrStatMini('Takipçi', u.followers || 0, '#8B5CF6')
    + _mbrStatMini('Takip', u.following || 0, '#3B82F6')
    + _mbrStatMini('Engelli', u.blocked || 0, '#EF4444')
    + '</div>';

  h += _mbrAccordion('finance_' + uid, 'solar:wallet-bold', '#22C55E', 'Finans & Ticaret', false, finContent);

  /* ── Section 4: Recent Orders ── */
  if (userOrders.length > 0) {
    var ordContent = '';
    for (var oi = 0; oi < Math.min(userOrders.length, 6); oi++) {
      var o = userOrders[oi];
      var ost = o.status === 'delivered' ? '#22C55E' : o.status === 'preparing' ? '#F59E0B' : o.status === 'on_way' ? '#3B82F6' : '#EF4444';
      var osl = o.status === 'delivered' ? 'Teslim' : o.status === 'preparing' ? 'Hazırlama' : o.status === 'on_way' ? 'Yolda' : 'İptal';
      ordContent += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;' + (oi < Math.min(userOrders.length, 6) - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + o.business + ' · ' + o.orderId + '</div>'
        + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admRelative(o.date) + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
        + '<span class="mbr-badge" style="background:' + ost + '18;color:' + ost + '">' + osl + '</span>'
        + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);margin-top:3px">' + _admFmtTL(o.total) + '</div>'
        + '</div></div>';
    }
    h += _mbrAccordion('orders_' + uid, 'solar:bag-check-bold', '#F59E0B', 'Sipariş Geçmişi (' + userOrders.length + ')', false, ordContent);
  }

  /* ── Actions ── */
  h += '<div style="margin-top:8px;display:flex;gap:8px">'
    + '<a href="tel:' + u.phone + '" class="mbr-action-btn" style="background:#DCFCE7;color:#22C55E"><iconify-icon icon="solar:phone-bold" style="font-size:16px"></iconify-icon>Ara</a>'
    + '<a href="mailto:' + u.email + '" class="mbr-action-btn" style="background:#DBEAFE;color:#3B82F6"><iconify-icon icon="solar:letter-bold" style="font-size:16px"></iconify-icon>E-posta</a>'
    + '</div>'
    + '<button class="mbr-action-btn" style="background:' + (u.status === 'active' ? '#FEE2E2;color:#EF4444' : '#DCFCE7;color:#22C55E') + ';margin-top:4px;width:100%" onclick="_admToast(\'' + (u.status === 'active' ? 'Kullanıcı yasaklandı' : 'Yasak kaldırıldı') + '\',\'ok\')">'
    + '<iconify-icon icon="' + (u.status === 'active' ? 'solar:forbidden-bold' : 'solar:check-circle-bold') + '" style="font-size:16px"></iconify-icon>'
    + (u.status === 'active' ? 'Yasakla' : 'Yasağı Kaldır')
    + '</button>';

  h += '</div></div>';
  d.innerHTML = h;
  document.getElementById('adminPhone').appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
}

/* ═══════════════════════════════════════
   BUSINESS 360° DETAIL — Side Drawer
   ═══════════════════════════════════════ */
function _mbrOpenBizDetail(bid) {
  var b = ADMIN_BUSINESSES.find(function(x) { return x.id === bid; });
  if (!b) return;
  _mbrRemoveDrawer();

  var stColor = b.status === 'active' ? '#22C55E' : b.status === 'suspended' ? '#EF4444' : '#F59E0B';
  var stLabel = b.status === 'active' ? 'Aktif' : b.status === 'suspended' ? 'Askıda' : 'Bekleyen';
  var bizOrders = ADMIN_ORDERS.filter(function(o) { return o.business === b.name; });

  var d = document.createElement('div');
  d.id = 'mbrDrawer';
  d.className = 'mbr-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _mbrCloseDrawer(); };

  var h = '<div class="mbr-drawer"><div class="mbr-drawer-scroll">';

  /* Close */
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">İşletme 360°</span>'
    + '<div class="mbr-icon-btn" onclick="_mbrCloseDrawer()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  /* ── Hero ── */
  h += '<div style="background:linear-gradient(135deg,#3B82F6 0%,#06B6D4 100%);border-radius:var(--r-xl);padding:16px;color:#fff;margin-bottom:16px">'
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">'
    + '<div style="width:48px;height:48px;border-radius:var(--r-md);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 20px/1 var(--font)">' + b.name.charAt(0) + '</div>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">' + b.name + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);opacity:.8;margin-top:3px">' + b.owner + ' · ' + (b.ownerPhone || '') + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">' + stLabel + '</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">' + b.plan.charAt(0).toUpperCase() + b.plan.slice(1) + '</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">' + b.city + ' · ' + b.branches + ' Şube</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.2);color:#fff">★ ' + b.rating.toFixed(1) + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7;margin-top:8px">Kayıt: ' + b.joinDate + (b.planExpiry ? ' · Plan bitiş: ' + b.planExpiry : '') + '</div>'
    + '</div>';

  /* ── Section 1: Operasyon (Menü, Masalar, Aktif Siparişler) ── */
  var opContent = '';
  /* Menu */
  opContent += '<div class="mbr-info-label">Menü Yapısı</div>';
  if (b.menu) {
    for (var mi = 0; mi < b.menu.length; mi++) {
      var cat = b.menu[mi];
      opContent += '<div style="margin-bottom:6px">'
        + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--primary);margin-bottom:3px">' + cat.cat + '</div>'
        + '<div style="display:flex;gap:4px;flex-wrap:wrap">';
      for (var mj = 0; mj < cat.items.length; mj++) {
        opContent += '<span class="mbr-badge" style="background:var(--bg-phone-secondary);color:var(--text-secondary)">' + cat.items[mj] + '</span>';
      }
      opContent += '</div></div>';
    }
  }
  /* Tables & Orders */
  opContent += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">'
    + _mbrStatMini('Masa', b.tables || 0, '#F59E0B')
    + _mbrStatMini('Aktif Sipariş', b.activeOrders || 0, '#3B82F6')
    + _mbrStatMini('Toplam Sipariş', _admFmt(b.totalOrders || 0), '#22C55E')
    + '</div>';
  /* Branch hierarchy */
  if (b.branchList && b.branchList.length > 0) {
    opContent += '<div class="mbr-info-label" style="margin-top:10px">Şube Hiyerarşisi (' + (b.branches > 1 ? 'Çoklu İşletme' : 'Tekil İşletme') + ')</div>';
    opContent += '<div style="display:flex;flex-direction:column;gap:3px">';
    for (var bi = 0; bi < b.branchList.length; bi++) {
      opContent += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0">'
        + '<iconify-icon icon="solar:shop-linear" style="font-size:12px;color:var(--primary)"></iconify-icon>'
        + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">' + b.branchList[bi] + ' Şubesi</span>'
        + '</div>';
    }
    opContent += '</div>';
  }

  h += _mbrAccordion('ops_' + bid, 'solar:chef-hat-bold', '#F59E0B', 'Operasyon', true, opContent);

  /* ── Section 2: İK & Finans ── */
  var hrContent = '';
  /* Staff */
  hrContent += '<div class="mbr-info-label">Personel (' + (b.staff ? b.staff.length : 0) + ')</div>';
  if (b.staff && b.staff.length > 0) {
    var roleColors = { owner:'#8B5CF6', manager:'#3B82F6', coordinator:'#06B6D4', chef:'#F59E0B', waiter:'#22C55E', cashier:'#EC4899', courier:'#EF4444' };
    var roleLabels = { owner:'Sahip', manager:'Yönetici', coordinator:'Koordinatör', chef:'Aşçı', waiter:'Garson', cashier:'Kasiyer', courier:'Kurye' };
    hrContent += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px">';
    for (var si2 = 0; si2 < b.staff.length; si2++) {
      var s = b.staff[si2];
      var rc = roleColors[s.role] || '#6B7280';
      hrContent += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;' + (si2 < b.staff.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
        + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + s.name + '</span>'
        + '<span class="mbr-badge" style="background:' + rc + '18;color:' + rc + '">' + (roleLabels[s.role] || s.role) + '</span>'
        + '</div>';
    }
    hrContent += '</div>';
  }
  /* Shift logs */
  if (b.shiftLogs && b.shiftLogs.length > 0) {
    hrContent += '<div class="mbr-info-label">Vardiya Değişim Logları</div>';
    for (var sli = 0; sli < b.shiftLogs.length; sli++) {
      var sl = b.shiftLogs[sli];
      hrContent += '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:6px 8px;margin-bottom:4px;border-left:3px solid #8B5CF6">'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">' + sl.desc + '</div>'
        + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + sl.date + '</div>'
        + '</div>';
    }
  }
  /* Token / Wallet */
  hrContent += '<div class="mbr-info-label" style="margin-top:8px">Token Bakiyesi</div>'
    + '<div style="background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:var(--r-md);padding:10px;color:#fff;margin-bottom:10px;display:flex;align-items:center;gap:8px">'
    + '<iconify-icon icon="solar:coin-bold" style="font-size:20px"></iconify-icon>'
    + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">' + _admFmt(b.tokenBalance) + ' Token</span>'
    + '<span style="font:var(--fw-regular) 10px/1 var(--font);opacity:.7;margin-left:auto">= ' + _admFmtTL(b.tokenBalance) + '</span>'
    + '</div>';
  /* Wallet history */
  if (b.walletHistory && b.walletHistory.length > 0) {
    hrContent += '<div class="mbr-info-label">Son Cüzdan Hareketleri</div>';
    for (var wi = 0; wi < b.walletHistory.length; wi++) {
      var w = b.walletHistory[wi];
      var wc = w.amount >= 0 ? '#22C55E' : '#EF4444';
      hrContent += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;' + (wi < b.walletHistory.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + w.desc + '</div>'
        + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:1px">' + _admRelative(w.date) + '</div>'
        + '</div>'
        + '<span style="font:var(--fw-bold) var(--fs-xs)/1 var(--font);color:' + wc + '">' + (w.amount >= 0 ? '+' : '') + w.amount + '</span>'
        + '</div>';
    }
  }

  h += _mbrAccordion('hr_' + bid, 'solar:users-group-two-rounded-bold', '#3B82F6', 'İK & Finans', false, hrContent);

  /* ── Section 3: Sistem ── */
  var sysContent = '';
  sysContent += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
    + '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:8px;text-align:center">'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Komisyon Oranı</div>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#EF4444;margin-top:4px">%' + b.commission + '</div>'
    + '</div>'
    + '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:8px;text-align:center">'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">Aylık Sipariş</div>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#3B82F6;margin-top:4px">' + _admFmt(b.monthlyOrders) + '</div>'
    + '</div>'
    + '</div>';
  /* Plan info */
  sysContent += '<div style="background:' + (b.plan === 'premium' ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : 'var(--bg-phone-secondary)') + ';border-radius:var(--r-md);padding:10px;' + (b.plan === 'premium' ? 'color:#fff;' : '') + 'margin-bottom:8px">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="' + (b.plan === 'premium' ? 'solar:crown-bold' : 'solar:tag-bold') + '" style="font-size:16px"></iconify-icon>'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font)">' + (b.plan === 'premium' ? 'Premium Plan' : 'Ücretsiz Plan') + '</span>'
    + '</div>'
    + (b.planExpiry ? '<div style="font:var(--fw-regular) 10px/1 var(--font);' + (b.plan === 'premium' ? 'opacity:.8;' : 'color:var(--text-muted);') + 'margin-top:4px">Bitiş: ' + b.planExpiry + '</div>' : '')
    + '</div>';
  /* Branch type */
  sysContent += '<div style="display:flex;align-items:center;gap:6px;padding:6px 0">'
    + '<iconify-icon icon="solar:buildings-bold" style="font-size:14px;color:var(--primary)"></iconify-icon>'
    + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + (b.branches > 1 ? 'Çoklu İşletme (' + b.branches + ' Şube)' : 'Tekil İşletme') + '</span>'
    + '</div>';

  h += _mbrAccordion('sys_' + bid, 'solar:settings-bold', '#8B5CF6', 'Sistem', false, sysContent);

  /* ── Recent Orders ── */
  if (bizOrders.length > 0) {
    var boContent = '';
    for (var boi = 0; boi < Math.min(bizOrders.length, 6); boi++) {
      var bo = bizOrders[boi];
      var bost = bo.status === 'delivered' ? '#22C55E' : bo.status === 'preparing' ? '#F59E0B' : bo.status === 'on_way' ? '#3B82F6' : '#EF4444';
      var bosl = bo.status === 'delivered' ? 'Teslim' : bo.status === 'preparing' ? 'Hazırlama' : bo.status === 'on_way' ? 'Yolda' : 'İptal';
      boContent += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;' + (boi < Math.min(bizOrders.length, 6) - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + bo.user + ' · ' + bo.orderId + '</div>'
        + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admRelative(bo.date) + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
        + '<span class="mbr-badge" style="background:' + bost + '18;color:' + bost + '">' + bosl + '</span>'
        + '<div style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);margin-top:3px">' + _admFmtTL(bo.total) + '</div>'
        + '</div></div>';
    }
    h += _mbrAccordion('bizorders_' + bid, 'solar:bag-check-bold', '#F59E0B', 'Sipariş Geçmişi (' + bizOrders.length + ')', false, boContent);
  }

  /* ── Actions ── */
  h += '<div style="margin-top:8px;display:flex;gap:8px">'
    + '<a href="tel:' + (b.ownerPhone || '') + '" class="mbr-action-btn" style="background:#DCFCE7;color:#22C55E"><iconify-icon icon="solar:phone-bold" style="font-size:16px"></iconify-icon>Sahibi Ara</a>'
    + '</div>';
  if (b.status === 'pending') {
    h += '<div style="display:flex;gap:8px;margin-top:4px">'
      + '<button class="mbr-action-btn" style="background:#DCFCE7;color:#22C55E;flex:1" onclick="_admToast(\'İşletme onaylandı\',\'ok\')"><iconify-icon icon="solar:check-circle-bold" style="font-size:16px"></iconify-icon>Onayla</button>'
      + '<button class="mbr-action-btn" style="background:#FEE2E2;color:#EF4444;flex:1" onclick="_admToast(\'İşletme reddedildi\',\'err\')"><iconify-icon icon="solar:close-circle-bold" style="font-size:16px"></iconify-icon>Reddet</button>'
      + '</div>';
  } else if (b.status === 'active') {
    h += '<button class="mbr-action-btn" style="background:#FEE2E2;color:#EF4444;margin-top:4px;width:100%" onclick="_admToast(\'İşletme askıya alındı\',\'ok\')">'
      + '<iconify-icon icon="solar:forbidden-bold" style="font-size:16px"></iconify-icon>Askıya Al</button>';
  } else {
    h += '<button class="mbr-action-btn" style="background:#DCFCE7;color:#22C55E;margin-top:4px;width:100%" onclick="_admToast(\'İşletme aktifleştirildi\',\'ok\')">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px"></iconify-icon>Aktifleştir</button>';
  }

  h += '</div></div>';
  d.innerHTML = h;
  document.getElementById('adminPhone').appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
}

/* ═══════════════════════════════════════
   ACCORDION HELPER
   ═══════════════════════════════════════ */
function _mbrAccordion(id, icon, color, title, defaultOpen, content) {
  var openClass = defaultOpen ? ' open' : '';
  return '<div class="mbr-accordion' + openClass + '" id="mbrAcc_' + id + '">'
    + '<div class="mbr-accordion-header" onclick="_mbrToggleAcc(\'mbrAcc_' + id + '\')">'
    + '<div style="display:flex;align-items:center;gap:8px">'
    + '<div style="width:28px;height:28px;border-radius:var(--r-md);background:' + color + '18;display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px;color:' + color + '"></iconify-icon>'
    + '</div>'
    + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + title + '</span>'
    + '</div>'
    + '<iconify-icon class="mbr-accordion-arrow" icon="solar:alt-arrow-down-linear" style="font-size:16px;color:var(--text-muted);transition:transform .2s"></iconify-icon>'
    + '</div>'
    + '<div class="mbr-accordion-body">' + content + '</div>'
    + '</div>';
}

function _mbrToggleAcc(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

/* ═══════════════════════════════════════
   FILTER LOGIC
   ═══════════════════════════════════════ */
function _mbrFilteredUsers() {
  var list = ADMIN_USERS.slice();
  if (_mbr.filter === 'active') list = list.filter(function(u) { return u.status === 'active'; });
  else if (_mbr.filter === 'banned') list = list.filter(function(u) { return u.status === 'banned'; });
  else if (_mbr.filter === 'premium') list = list.filter(function(u) { return u.isPremium; });

  if (_mbr.cityFilter) list = list.filter(function(u) { return u.city === _mbr.cityFilter; });

  if (_mbr.search.trim()) {
    var q = _mbr.search.toLowerCase().trim();
    list = list.filter(function(u) {
      return u.name.toLowerCase().indexOf(q) > -1
        || u.phone.indexOf(q) > -1
        || u.email.toLowerCase().indexOf(q) > -1;
    });
  }
  return list;
}

function _mbrFilteredBiz() {
  var list = ADMIN_BUSINESSES.slice();
  if (_mbr.filter === 'active') list = list.filter(function(b) { return b.status === 'active'; });
  else if (_mbr.filter === 'suspended') list = list.filter(function(b) { return b.status === 'suspended'; });
  else if (_mbr.filter === 'pending') list = list.filter(function(b) { return b.status === 'pending'; });

  if (_mbr.cityFilter) list = list.filter(function(b) { return b.city === _mbr.cityFilter; });

  if (_mbr.search.trim()) {
    var q = _mbr.search.toLowerCase().trim();
    list = list.filter(function(b) {
      return b.name.toLowerCase().indexOf(q) > -1
        || b.owner.toLowerCase().indexOf(q) > -1
        || b.city.toLowerCase().indexOf(q) > -1;
    });
  }
  return list;
}

/* ═══════════════════════════════════════
   STATE SETTERS
   ═══════════════════════════════════════ */
function _mbrSwitchTab(t) { _mbr.tab = t; _mbr.filter = 'all'; _mbr.search = ''; _mbr.cityFilter = ''; _mbr.filtersOpen = false; renderAdminUsers(); }
function _mbrSearchChange(v) { _mbr.search = v; renderAdminUsers(); }
function _mbrSetFilter(v) { _mbr.filter = v; renderAdminUsers(); }
function _mbrSetCity(v) { _mbr.cityFilter = v; renderAdminUsers(); }
function _mbrToggleFilters() { _mbr.filtersOpen = !_mbr.filtersOpen; renderAdminUsers(); }
function _mbrResetFilters() { _mbr.filter = 'all'; _mbr.cityFilter = ''; _mbr.filtersOpen = false; renderAdminUsers(); }
function _mbrRemoveDrawer() { var old = document.getElementById('mbrDrawer'); if (old) old.remove(); }
function _mbrCloseDrawer() { var d = document.getElementById('mbrDrawer'); if (!d) return; d.classList.remove('open'); setTimeout(function(){ d.remove(); }, 300); }

function _mbrFilterBadge() {
  var c = 0;
  if (_mbr.filter !== 'all') c++;
  if (_mbr.cityFilter) c++;
  if (c === 0) return '';
  return '<span style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:#EF4444;color:#fff;font:var(--fw-bold) 9px/14px var(--font);text-align:center">' + c + '</span>';
}

/* ═══════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════ */
function _mbrEsc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _mbrEmpty(icon, text) {
  return '<div style="text-align:center;padding:48px 20px">'
    + '<iconify-icon icon="' + icon + '" style="font-size:48px;color:var(--text-muted);opacity:0.3"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:12px">' + text + '</div>'
    + '</div>';
}

function _mbrInfoCell(label, value) {
  return '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:8px;text-align:center">'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)">' + label + '</div>'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:3px">' + value + '</div>'
    + '</div>';
}

function _mbrStatMini(label, val, color) {
  return '<div style="background:' + color + '10;border-radius:var(--r-md);padding:8px;text-align:center">'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:' + color + '">' + val + '</div>'
    + '<div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">' + label + '</div>'
    + '</div>';
}

function _mbrChip(label, value) {
  return '<button class="mbr-chip' + (_mbr.filter === value ? ' active' : '') + '" onclick="_mbrSetFilter(\'' + value + '\')">' + label + '</button>';
}

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */
function _mbrInjectStyles() {
  if (document.getElementById('mbrStyles')) return;
  var s = document.createElement('style');
  s.id = 'mbrStyles';
  s.textContent = '\
    .mbr-main-tab {\
      flex:1;padding:8px 12px;\
      border-radius:var(--r-md);\
      border:none;background:transparent;\
      color:var(--text-muted);\
      font:var(--fw-semibold) var(--fs-xs)/1 var(--font);\
      cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;\
      transition:all .2s;\
    }\
    .mbr-main-tab.active { background:var(--bg-phone);color:var(--primary);box-shadow:var(--shadow-sm); }\
    .mbr-main-tab-count {\
      font:var(--fw-bold) 10px/1 var(--font);\
      background:var(--border-subtle);color:var(--text-muted);\
      padding:2px 6px;border-radius:var(--r-full);\
    }\
    .mbr-main-tab.active .mbr-main-tab-count { background:var(--primary);color:#fff; }\
    .mbr-search {\
      width:100%;box-sizing:border-box;\
      padding:10px 12px 10px 34px;\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      background:var(--bg-phone);\
      font:var(--fw-regular) var(--fs-xs)/1 var(--font);\
      color:var(--text-primary);\
      outline:none;transition:border-color .2s;\
    }\
    .mbr-search:focus { border-color:var(--primary); }\
    .mbr-search::placeholder { color:var(--text-muted); }\
    .mbr-icon-btn {\
      width:38px;height:38px;border-radius:var(--r-md);\
      background:var(--bg-phone);border:1px solid var(--border-subtle);\
      display:flex;align-items:center;justify-content:center;\
      cursor:pointer;position:relative;transition:all .2s;flex-shrink:0;\
    }\
    .mbr-icon-btn:active { transform:scale(0.95); }\
    .mbr-badge {\
      font:var(--fw-semibold) 9px/1 var(--font);\
      padding:3px 7px;border-radius:var(--r-full);\
      display:inline-flex;align-items:center;gap:2px;\
      white-space:nowrap;\
    }\
    .mbr-row {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      padding:10px 12px;\
      cursor:pointer;\
      display:flex;align-items:center;gap:10px;\
      transition:all .15s;\
    }\
    .mbr-row:active { transform:scale(0.99);opacity:0.9; }\
    .mbr-filter-panel {\
      background:var(--bg-phone);\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-xl);\
      padding:14px;\
      box-shadow:var(--shadow-md);\
      animation:admFadeIn .2s ease;\
    }\
    .mbr-filter-label {\
      font:var(--fw-semibold) 11px/1 var(--font);\
      color:var(--text-primary);margin-bottom:6px;\
    }\
    .mbr-chip {\
      padding:6px 12px;border-radius:var(--r-full);\
      border:1px solid var(--border-subtle);\
      background:transparent;\
      color:var(--text-secondary);\
      font:var(--fw-medium) 11px/1 var(--font);\
      cursor:pointer;transition:all .2s;\
    }\
    .mbr-chip.active { border-color:var(--primary);background:var(--primary-soft);color:var(--primary); }\
    .mbr-reset-btn {\
      padding:6px 14px;border-radius:var(--r-full);\
      border:1px solid #EF4444;\
      background:rgba(239,68,68,0.08);color:#EF4444;\
      font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;\
    }\
    .mbr-info-label {\
      font:var(--fw-semibold) 11px/1 var(--font);\
      color:var(--text-secondary);\
      margin-bottom:6px;margin-top:2px;\
    }\
    .mbr-drawer-backdrop {\
      position:fixed;top:0;left:0;right:0;bottom:0;\
      background:rgba(0,0,0,0);z-index:80;\
      transition:background .3s;\
    }\
    .mbr-drawer-backdrop.open { background:rgba(0,0,0,0.45); }\
    .mbr-drawer {\
      position:fixed;top:0;right:-100%;bottom:0;\
      width:90%;max-width:400px;\
      background:var(--bg-phone);\
      box-shadow:-4px 0 24px rgba(0,0,0,0.12);\
      transition:right .3s cubic-bezier(0.4,0,0.2,1);\
      z-index:81;\
      border-radius:var(--r-xl) 0 0 var(--r-xl);\
    }\
    .mbr-drawer-backdrop.open .mbr-drawer { right:0; }\
    .mbr-drawer-scroll {\
      height:100%;overflow-y:auto;\
      -webkit-overflow-scrolling:touch;\
      padding:20px 16px;\
    }\
    .mbr-accordion {\
      border:1px solid var(--border-subtle);\
      border-radius:var(--r-lg);\
      overflow:hidden;\
      margin-bottom:10px;\
    }\
    .mbr-accordion-header {\
      display:flex;align-items:center;justify-content:space-between;\
      padding:12px;cursor:pointer;background:var(--bg-phone);\
      transition:background .2s;\
    }\
    .mbr-accordion-header:active { background:var(--bg-phone-secondary); }\
    .mbr-accordion-body {\
      max-height:0;overflow:hidden;\
      padding:0 12px;\
      transition:max-height .3s ease, padding .3s ease;\
    }\
    .mbr-accordion.open .mbr-accordion-body {\
      max-height:2000px;\
      padding:0 12px 12px;\
    }\
    .mbr-accordion.open .mbr-accordion-arrow {\
      transform:rotate(180deg);\
    }\
    .mbr-action-btn {\
      padding:10px;border-radius:var(--r-md);border:none;\
      font:var(--fw-semibold) var(--fs-xs)/1 var(--font);\
      cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;\
      transition:opacity .2s;text-decoration:none;flex:1;text-align:center;\
    }\
    .mbr-action-btn:active { opacity:0.7; }\
  ';
  document.head.appendChild(s);
}

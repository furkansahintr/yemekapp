/* ═══════════════════════════════════════════════════════════
   ADMIN BIZ DETAIL — Full-screen business overview + branch picker + hamburger 19-tile sheet
   ═══════════════════════════════════════════════════════════ */

var _abdState = { bid: null, branch: null };

/* ═══ Aç ═══ */
function _admOpenBizFullDetail(bid) {
  var b = ADMIN_BUSINESSES.find(function(x) { return x.id === bid; });
  if (!b) return;

  _abdState.bid = bid;
  _abdState.branch = null;

  if (typeof _mbrRemoveDrawer === 'function') _mbrRemoveDrawer();
  var prev = document.getElementById('abdOverlay');
  if (prev) prev.remove();

  var ov = document.createElement('div');
  ov.id = 'abdOverlay';
  ov.className = 'abd-overlay';
  ov.innerHTML = '<div class="abd-container" id="abdContainer"></div>';

  document.getElementById('adminPhone').appendChild(ov);
  requestAnimationFrame(function() { ov.classList.add('open'); });

  var multiple = (b.branchList && b.branchList.length > 1) || b.branches > 1;
  if (multiple) _abdRenderBranchPicker(b);
  else {
    _abdState.branch = (b.branchList && b.branchList[0]) || 'Ana Şube';
    _abdRenderMain(b, _abdState.branch);
  }
}

function _admCloseBizFullDetail() {
  var ov = document.getElementById('abdOverlay');
  if (!ov) return;
  ov.classList.remove('open');
  setTimeout(function() { ov.remove(); }, 250);
}

/* ═══ Şube Picker ═══ */
function _abdRenderBranchPicker(b) {
  var c = document.getElementById('abdContainer');
  if (!c) return;

  var branches = b.branchList || [];
  var h = '<div class="abd-topbar">'
        + '<div class="btn-icon" onclick="_admCloseBizFullDetail()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
        + '<span class="abd-topbar-name">' + _abdEsc(b.name) + '</span>'
        + '<div style="width:32px"></div>'
        + '</div>';

  h += '<div class="abd-picker">'
     + '<div class="abd-picker-head">'
     + '<div class="abd-picker-icon"><iconify-icon icon="solar:shop-2-bold" style="font-size:28px;color:#3B82F6"></iconify-icon></div>'
     + '<div class="abd-picker-title">Hangi şubeyi görüntülemek istersin?</div>'
     + '<div class="abd-picker-sub">' + _abdEsc(b.name) + ' · ' + branches.length + ' şube</div>'
     + '</div>'
     + '<div class="abd-branch-list">';

  for (var i = 0; i < branches.length; i++) {
    var br = branches[i];
    /* Mock branch stats */
    var mockOrders = Math.floor((b.monthlyOrders || 600) / branches.length);
    var mockTables = (b.tables || 8);
    h += '<div class="abd-branch-card" onclick="_abdSelectBranch(\'' + _abdEscAttr(br) + '\')">'
       + '<div class="abd-branch-icon" style="background:linear-gradient(135deg,#3B82F6,#06B6D4)"><iconify-icon icon="solar:shop-2-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
       + '<div class="abd-branch-info">'
       + '<div class="abd-branch-name">' + _abdEsc(br) + ' Şubesi</div>'
       + '<div class="abd-branch-meta">' + mockOrders + ' sipariş/ay · ' + mockTables + ' masa</div>'
       + '</div>'
       + '<span class="abd-branch-badge" style="background:rgba(34,197,94,.12);color:#22C55E">Açık</span>'
       + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary);margin-left:6px"></iconify-icon>'
       + '</div>';
  }

  h += '</div></div>';
  c.innerHTML = h;
}

function _abdSelectBranch(branch) {
  _abdState.branch = branch;
  var b = ADMIN_BUSINESSES.find(function(x) { return x.id === _abdState.bid; });
  if (!b) return;
  _abdRenderMain(b, branch);
  var c = document.getElementById('abdContainer');
  if (c) { c.classList.remove('abd-anim-in'); void c.offsetWidth; c.classList.add('abd-anim-in'); }
}

/* ═══ Ana Detay ═══ */
function _abdRenderMain(b, branch) {
  var c = document.getElementById('abdContainer');
  if (!c) return;

  var stColor = b.status === 'active' ? '#22C55E' : b.status === 'suspended' ? '#EF4444' : '#F59E0B';
  var stLabel = b.status === 'active' ? 'Aktif' : b.status === 'suspended' ? 'Askıda' : 'Bekleyen';
  var bizOrders = (typeof ADMIN_ORDERS !== 'undefined') ? ADMIN_ORDERS.filter(function(o) { return o.business === b.name; }) : [];
  var todayOrders = bizOrders.filter(function(o) {
    var d = new Date(o.date);
    var now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  var onWay = bizOrders.filter(function(o) { return o.status === 'on_way'; }).length;
  var preparing = bizOrders.filter(function(o) { return o.status === 'preparing'; }).length;
  var multi = (b.branchList && b.branchList.length > 1) || b.branches > 1;

  var h = '<div class="abd-topbar">'
        + '<div class="btn-icon" onclick="' + (multi ? '_abdBackToPicker()' : '_admCloseBizFullDetail()') + '"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
        + '<div class="abd-topbar-title-wrap"><span class="abd-topbar-name">' + _abdEsc(b.name) + '</span>'
        + '<span class="abd-topbar-sub">' + _abdEsc(branch) + ' Şubesi</span></div>'
        + '<div class="btn-icon" onclick="_admOpenBizMenu(\'' + b.id + '\',\'' + _abdEscAttr(branch) + '\')"><iconify-icon icon="solar:hamburger-menu-linear" style="font-size:22px"></iconify-icon></div>'
        + '</div>';

  /* Hero */
  h += '<div class="abd-hero">'
     + '<div class="abd-hero-row">'
     + '<div class="abd-hero-logo">' + _abdEsc(b.name.charAt(0)) + '</div>'
     + '<div class="abd-hero-body">'
     + '<div class="abd-hero-name">' + _abdEsc(b.name) + '</div>'
     + '<div class="abd-hero-branch"><iconify-icon icon="solar:map-point-bold" style="font-size:11px"></iconify-icon> ' + _abdEsc(branch) + ' Şubesi</div>'
     + '</div>'
     + '</div>'
     + '<div class="abd-hero-chips">'
     + '<span class="abd-chip">' + stLabel + '</span>'
     + '<span class="abd-chip">' + b.plan.charAt(0).toUpperCase() + b.plan.slice(1) + '</span>'
     + '<span class="abd-chip">★ ' + b.rating.toFixed(1) + '</span>'
     + '<span class="abd-chip">%' + b.commission + ' komisyon</span>'
     + '</div>'
     + '<div class="abd-hero-owner"><iconify-icon icon="solar:user-bold" style="font-size:11px"></iconify-icon> ' + _abdEsc(b.owner) + ' · ' + _abdEsc(b.ownerPhone || '') + '</div>'
     + '</div>';

  /* Quick Stats (bugün) */
  h += '<div class="abd-section-head">Bugünkü Operasyon</div>'
     + '<div class="abd-qstat-grid">'
     + _abdQStat('solar:bag-check-bold', '#3B82F6', 'Bugün', todayOrders, 'sipariş')
     + _abdQStat('solar:chef-hat-bold', '#F59E0B', 'Hazırlanan', preparing, 'sipariş')
     + _abdQStat('solar:delivery-bold', '#22C55E', 'Yolda', onWay, 'teslimat')
     + _abdQStat('solar:star-bold', '#EC4899', 'Rating', b.rating.toFixed(1), '/ 5.0')
     + '</div>';

  /* Info Card */
  h += '<div class="abd-section-head">İşletme Özeti</div>'
     + '<div class="abd-info-card">'
     + _abdInfoRow('solar:city-bold',           'Şehir',        b.city)
     + _abdInfoRow('solar:buildings-bold',      'Toplam Şube',  b.branches + ' şube')
     + _abdInfoRow('solar:calendar-linear',     'Kayıt Tarihi', b.joinDate)
     + _abdInfoRow('solar:wallet-money-bold',   'Cüzdan',       _admFmt(b.tokenBalance || 0) + ' Token')
     + _abdInfoRow('solar:chart-2-bold',        'Aylık Sipariş', _admFmt(b.monthlyOrders || 0))
     + _abdInfoRow('solar:graph-bold',          'Toplam Sipariş', _admFmt(b.totalOrders || 0))
     + '</div>';

  /* Son Siparişler */
  if (bizOrders.length > 0) {
    h += '<div class="abd-section-head">Son Siparişler</div>'
       + '<div class="abd-list">';
    for (var i = 0; i < Math.min(bizOrders.length, 5); i++) {
      var o = bizOrders[i];
      var ost = o.status === 'delivered' ? '#22C55E' : o.status === 'preparing' ? '#F59E0B' : o.status === 'on_way' ? '#3B82F6' : '#EF4444';
      var osl = o.status === 'delivered' ? 'Teslim' : o.status === 'preparing' ? 'Hazırlama' : o.status === 'on_way' ? 'Yolda' : 'İptal';
      h += '<div class="abd-list-row">'
         + '<div style="flex:1;min-width:0"><div class="abd-list-title">' + _abdEsc(o.orderId + ' · ' + o.user) + '</div>'
         + '<div class="abd-list-meta">' + _admRelative(o.date) + ' · ' + _admFmtTL(o.total) + '</div></div>'
         + '<span class="abd-tag" style="background:' + ost + '18;color:' + ost + '">' + osl + '</span>'
         + '</div>';
    }
    h += '</div>';
  }

  /* Bottom spacing */
  h += '<div style="height:60px"></div>';
  c.innerHTML = h;
}

function _abdBackToPicker() {
  var b = ADMIN_BUSINESSES.find(function(x) { return x.id === _abdState.bid; });
  if (!b) return;
  _abdState.branch = null;
  _abdRenderBranchPicker(b);
}

/* ═══ Hamburger Menu — 19 tile ═══ */
function _admOpenBizMenu(bid, branch) {
  var b = ADMIN_BUSINESSES.find(function(x) { return x.id === bid; });
  if (!b) return;

  var prev = document.getElementById('abdMenuSheet');
  if (prev) prev.remove();

  var bizOrders = (typeof ADMIN_ORDERS !== 'undefined') ? ADMIN_ORDERS.filter(function(o) { return o.business === b.name; }) : [];
  var reports = (typeof ADMIN_REPORTS !== 'undefined') ? ADMIN_REPORTS.filter(function(r) { return r.business === b.name || r.target === b.name; }) : [];
  var campaigns = (typeof ADMIN_CAMPAIGNS !== 'undefined') ? ADMIN_CAMPAIGNS.filter(function(c) { return (c.businesses || []).indexOf(b.name) !== -1; }) : [];
  var deliveries = bizOrders.filter(function(o) { return o.status === 'on_way' || o.status === 'delivered'; }).length;
  var menuItemCount = 0;
  if (b.menu) b.menu.forEach(function(cat) { menuItemCount += (cat.items || []).length; });

  var tiles = [
    { id:'menu',        label:'Menü Yönetimi',    icon:'solar:clipboard-list-bold',        tone:'#F97316', sum:menuItemCount + ' ürün' },
    { id:'recipes',     label:'İşletme Tarifler', icon:'solar:chef-hat-bold',              tone:'#F65013', sum:((b.menu && b.menu.length) || 0) + ' kategori' },
    { id:'community',   label:'İşletme Topluluğu',icon:'solar:users-group-rounded-bold',   tone:'#8B5CF6', sum:'Paylaşım & yorum' },
    { id:'report',      label:'İşletme Raporu',   icon:'solar:document-text-bold',         tone:'#EF4444', sum:reports.length + ' rapor' },
    { id:'generalReport',label:'Genel Raporlar',  icon:'solar:chart-square-bold',          tone:'#0EA5E9', sum:'Performans & trend' },
    { id:'commission',  label:'Komisyon Oranları',icon:'solar:pie-chart-2-bold',           tone:'#EC4899', sum:'%' + b.commission },
    { id:'wallet',      label:'Cüzdan',           icon:'solar:wallet-money-bold',          tone:'#22C55E', sum:_admFmt(b.tokenBalance || 0) + ' token' },
    { id:'tables',      label:'Masalar',          icon:'solar:armchair-2-bold',            tone:'#14B8A6', sum:(b.tables || 0) + ' masa' },
    { id:'staff',       label:'Personel',         icon:'solar:users-group-two-rounded-bold',tone:'#3B82F6', sum:((b.staff && b.staff.length) || 0) + ' çalışan' },
    { id:'shifts',      label:'Vardiyalar',       icon:'solar:calendar-mark-bold',         tone:'#6366F1', sum:((b.shiftLogs && b.shiftLogs.length) || 0) + ' kayıt' },
    { id:'waiterCalls', label:'Garson Çağrıları', icon:'solar:bell-bing-bold',             tone:'#F59E0B', sum:'Canlı çağrı' },
    { id:'reviews',     label:'Değerlendirmeler', icon:'solar:star-bold',                  tone:'#EAB308', sum:b.rating.toFixed(1) + ' ★' },
    { id:'delivery',    label:'Teslimatlar',      icon:'solar:delivery-bold',              tone:'#06B6D4', sum:deliveries + ' teslimat' },
    { id:'orders',      label:'Siparişler',       icon:'solar:bag-check-bold',             tone:'#22C55E', sum:bizOrders.length + ' sipariş' },
    { id:'info',        label:'İşletme Bilgileri',icon:'solar:info-circle-bold',           tone:'#6B7280', sum:b.owner },
    { id:'finance',     label:'Finans & Ödemeler',icon:'solar:card-bold',                  tone:'#10B981', sum:((b.walletHistory && b.walletHistory.length) || 0) + ' işlem' },
    { id:'branchSet',   label:'Şube Ayarları',    icon:'solar:settings-bold',              tone:'#64748B', sum:_abdEsc(branch) },
    { id:'ads',         label:'Reklam Alanı',     icon:'solar:gallery-wide-bold',          tone:'#F43F5E', sum:campaigns.length + ' kampanya' },
    { id:'premium',     label:'Premium Plan',     icon:'solar:crown-bold',                 tone:'#A855F7', sum:b.plan === 'premium' ? 'Aktif' : 'Ücretsiz' }
  ];

  var sh = document.createElement('div');
  sh.id = 'abdMenuSheet';
  sh.className = 'aud-menu-backdrop';
  sh.onclick = function(e) { if (e.target === sh) _admCloseBizMenu(); };

  var h = '<div class="aud-menu-sheet">'
        + '<div class="aud-menu-head">'
        + '<div class="aud-menu-title">Yönetim İşlemleri</div>'
        + '<div class="btn-icon" onclick="_admCloseBizMenu()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
        + '</div>'
        + '<div class="aud-menu-sub">' + _abdEsc(b.name) + ' · ' + _abdEsc(branch) + ' Şubesi</div>'
        + '<div class="aud-menu-grid">';

  for (var i = 0; i < tiles.length; i++) {
    var t = tiles[i];
    h += '<div class="aud-menu-tile" onclick="_admBizMenuAction(\'' + t.id + '\',\'' + bid + '\',\'' + _abdEscAttr(branch) + '\')">'
       + '<div class="aud-menu-ticon" style="background:' + t.tone + '18;color:' + t.tone + '"><iconify-icon icon="' + t.icon + '" style="font-size:20px"></iconify-icon></div>'
       + '<div class="aud-menu-tbody">'
       + '<div class="aud-menu-tlabel">' + t.label + '</div>'
       + '<div class="aud-menu-tsum" style="color:' + t.tone + '">' + t.sum + '</div>'
       + '</div>'
       + '<iconify-icon icon="solar:alt-arrow-right-linear" class="aud-menu-tchev"></iconify-icon>'
       + '</div>';
  }

  h += '</div></div>';
  sh.innerHTML = h;
  document.getElementById('adminPhone').appendChild(sh);
  requestAnimationFrame(function() { sh.classList.add('open'); });
}

function _admCloseBizMenu() {
  var sh = document.getElementById('abdMenuSheet');
  if (!sh) return;
  sh.classList.remove('open');
  setTimeout(function() { sh.remove(); }, 250);
}

/* ═══ Sub-sheet per tile ═══ */
function _admBizMenuAction(kind, bid, branch) {
  var b = ADMIN_BUSINESSES.find(function(x) { return x.id === bid; });
  if (!b) return;

  var title = '', icon = '', tone = '#6366F1', body = '';

  if (kind === 'menu') {
    title = 'Menü Yönetimi'; icon = 'solar:clipboard-list-bold'; tone = '#F97316';
    if (!b.menu || !b.menu.length) {
      body = _abdEmpty('solar:clipboard-list-linear', 'Menü boş.');
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:10px">';
      for (var mi = 0; mi < b.menu.length; mi++) {
        var cat = b.menu[mi];
        body += '<div class="aud-sub-row">'
             + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#F97316;margin-bottom:6px">' + _abdEsc(cat.cat) + '</div>'
             + '<div style="display:flex;gap:4px;flex-wrap:wrap">';
        for (var mj = 0; mj < cat.items.length; mj++) {
          body += '<span style="padding:4px 8px;background:var(--glass-card-strong);border-radius:var(--r-full);font:var(--fw-medium) 11px/1 var(--font);color:var(--text-primary)">' + _abdEsc(cat.items[mj]) + '</span>';
        }
        body += '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'recipes') {
    title = 'İşletme Tarifler'; icon = 'solar:chef-hat-bold'; tone = '#F65013';
    body = '<div class="aud-sub-empty"><iconify-icon icon="solar:chef-hat-linear" style="font-size:28px"></iconify-icon><span>İşletmeye ait paylaşılan tarifler menü kategorilerinden türetilir.<br>Detaylı tarif yönetimi yakında.</span></div>';
  }
  else if (kind === 'community') {
    title = 'İşletme Topluluğu'; icon = 'solar:users-group-rounded-bold'; tone = '#8B5CF6';
    var mockPosts = _abdMockPostsFor(b);
    body = '<div style="display:flex;flex-direction:column;gap:8px">';
    for (var pi = 0; pi < mockPosts.length; pi++) {
      var p = mockPosts[pi];
      body += '<div class="aud-sub-row">'
           + '<div class="aud-sub-row-title">' + _abdEsc(p.text) + '</div>'
           + '<div class="aud-sub-row-meta">' + p.when + ' · ' + p.likes + ' beğeni · ' + p.comments + ' yorum</div>'
           + '</div>';
    }
    body += '</div>';
  }
  else if (kind === 'report') {
    title = 'İşletme Raporu'; icon = 'solar:document-text-bold'; tone = '#EF4444';
    var reps = (typeof ADMIN_REPORTS !== 'undefined') ? ADMIN_REPORTS.filter(function(r) { return r.business === b.name || r.target === b.name; }) : [];
    if (!reps.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:shield-check-bold" style="font-size:28px;color:#22C55E"></iconify-icon><span>Bu işletmeye dair rapor yok.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var ri = 0; ri < reps.length; ri++) {
        var r = reps[ri];
        body += '<div class="aud-sub-row"><div class="aud-sub-row-title">' + _abdEsc(r.type + ' · ' + (r.target || '—')) + '</div>'
             + '<div class="aud-sub-row-meta">' + _abdEsc(r.reportedBy) + ' · ' + _admRelative(r.date) + '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'generalReport') {
    title = 'Genel Raporlar'; icon = 'solar:chart-square-bold'; tone = '#0EA5E9';
    body = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px">'
         + _abdMini('Aylık Sipariş', _admFmt(b.monthlyOrders || 0), '#3B82F6')
         + _abdMini('Top. Sipariş',  _admFmt(b.totalOrders || 0),  '#8B5CF6')
         + _abdMini('Komisyon Geliri', _admFmtTL(Math.round((b.monthlyOrders || 0) * (b.commission || 0) * 1.5)), '#22C55E')
         + _abdMini('Rating', b.rating.toFixed(1) + ' ★', '#EAB308')
         + '</div>'
         + '<div class="aud-sub-empty"><iconify-icon icon="solar:chart-linear" style="font-size:24px"></iconify-icon><span>Detaylı grafikler ve trend analizi yakında.</span></div>';
  }
  else if (kind === 'commission') {
    title = 'Komisyon Oranları'; icon = 'solar:pie-chart-2-bold'; tone = '#EC4899';
    body = '<div style="background:linear-gradient(135deg,#EC4899,#F65013);border-radius:var(--r-xl);padding:16px;color:#fff;margin-bottom:10px">'
         + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.85">Mevcut Komisyon</div>'
         + '<div style="font:var(--fw-bold) 28px/1 var(--font);margin-top:6px">%' + b.commission + '</div>'
         + '<div style="font:var(--fw-regular) 11px/1.3 var(--font);opacity:.8;margin-top:4px">' + b.rating.toFixed(1) + ' yıldız kademesine göre atandı.</div>'
         + '</div>'
         + _abdKV([
            ['Rating', b.rating.toFixed(1) + ' ★'],
            ['Kademe', _abdTierLabel(b.rating)],
            ['Plan',   b.plan.charAt(0).toUpperCase() + b.plan.slice(1)],
            ['Aylık Komisyon (tahmini)', _admFmtTL(Math.round((b.monthlyOrders || 0) * (b.commission || 0) * 1.5))]
          ]);
  }
  else if (kind === 'wallet') {
    title = 'Cüzdan'; icon = 'solar:wallet-money-bold'; tone = '#22C55E';
    body = '<div style="background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:var(--r-xl);padding:16px;color:#fff;margin-bottom:10px">'
         + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.85">Güncel Bakiye</div>'
         + '<div style="font:var(--fw-bold) 24px/1 var(--font);margin-top:6px">' + _admFmt(b.tokenBalance || 0) + ' Token</div>'
         + '</div>';
    if (b.walletHistory && b.walletHistory.length) {
      body += '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin:4px 0 8px">Son İşlemler</div>'
           + '<div style="display:flex;flex-direction:column;gap:6px">';
      for (var wi = 0; wi < b.walletHistory.length; wi++) {
        var tx = b.walletHistory[wi];
        var col = tx.amount > 0 ? '#22C55E' : '#EF4444';
        var tIcon = tx.type === 'topup' ? 'solar:add-circle-bold' : tx.type === 'refund' ? 'solar:refresh-bold' : 'solar:pie-chart-2-bold';
        body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
             + '<iconify-icon icon="' + tIcon + '" style="font-size:16px;color:' + col + '"></iconify-icon>'
             + '<div style="flex:1"><div class="aud-sub-row-title">' + _abdEsc(tx.desc) + '</div>'
             + '<div class="aud-sub-row-meta">' + _admRelative(tx.date) + '</div></div>'
             + '<div style="font:var(--fw-bold) 11px/1 var(--font);color:' + col + '">' + (tx.amount > 0 ? '+' : '') + tx.amount + '</div>'
             + '</div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'tables') {
    title = 'Masalar'; icon = 'solar:armchair-2-bold'; tone = '#14B8A6';
    var tablesN = b.tables || 0;
    if (!tablesN) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:armchair-linear" style="font-size:28px"></iconify-icon><span>Masa tanımlı değil.</span></div>';
    } else {
      body = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
      var activeOrds = b.activeOrders || 0;
      for (var ti = 1; ti <= tablesN; ti++) {
        var busy = ti <= activeOrds;
        body += '<div style="aspect-ratio:1;border-radius:var(--r-md);border:1.5px solid ' + (busy ? '#F59E0B' : '#22C55E') + ';background:' + (busy ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.08)') + ';display:flex;flex-direction:column;align-items:center;justify-content:center">'
             + '<iconify-icon icon="solar:armchair-2-bold" style="font-size:18px;color:' + (busy ? '#F59E0B' : '#22C55E') + '"></iconify-icon>'
             + '<span style="font:var(--fw-bold) 11px/1 var(--font);color:' + (busy ? '#F59E0B' : '#22C55E') + ';margin-top:2px">M' + ti + '</span>'
             + '<span style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:2px">' + (busy ? 'Dolu' : 'Boş') + '</span>'
             + '</div>';
      }
      body += '</div><div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);margin-top:10px;text-align:center">' + activeOrds + ' aktif sipariş</div>';
    }
  }
  else if (kind === 'staff') {
    title = 'Personel'; icon = 'solar:users-group-two-rounded-bold'; tone = '#3B82F6';
    if (!b.staff || !b.staff.length) {
      body = _abdEmpty('solar:users-group-linear', 'Personel yok.');
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:6px">';
      for (var st = 0; st < b.staff.length; st++) {
        var p = b.staff[st];
        var rc = _abdRoleColor(p.role);
        body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
             + '<div style="width:36px;height:36px;border-radius:50%;background:' + rc + ';display:flex;align-items:center;justify-content:center;color:#fff;font:var(--fw-bold) 13px/1 var(--font)">' + _abdEsc(p.name.charAt(0)) + '</div>'
             + '<div style="flex:1"><div class="aud-sub-row-title">' + _abdEsc(p.name) + '</div>'
             + '<div class="aud-sub-row-meta">' + _abdRoleLabel(p.role) + '</div></div>'
             + '<span class="mbr-badge" style="background:' + rc + '18;color:' + rc + '">' + _abdRoleLabel(p.role) + '</span>'
             + '</div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'shifts') {
    title = 'Vardiyalar'; icon = 'solar:calendar-mark-bold'; tone = '#6366F1';
    if (!b.shiftLogs || !b.shiftLogs.length) {
      body = _abdEmpty('solar:calendar-linear', 'Vardiya kaydı yok.');
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var sh = 0; sh < b.shiftLogs.length; sh++) {
        var sv = b.shiftLogs[sh];
        body += '<div class="aud-sub-row"><div class="aud-sub-row-title">' + _abdEsc(sv.desc) + '</div>'
             + '<div class="aud-sub-row-meta">' + _abdEsc(sv.date) + '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'waiterCalls') {
    title = 'Garson Çağrıları'; icon = 'solar:bell-bing-bold'; tone = '#F59E0B';
    var calls = _abdMockCallsFor(b);
    if (!calls.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:bell-linear" style="font-size:28px"></iconify-icon><span>Şu an bekleyen çağrı yok.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:6px">';
      for (var cc = 0; cc < calls.length; cc++) {
        var cl = calls[cc];
        body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
             + '<iconify-icon icon="solar:bell-bing-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
             + '<div style="flex:1"><div class="aud-sub-row-title">Masa ' + cl.table + ' · ' + cl.reason + '</div>'
             + '<div class="aud-sub-row-meta">' + cl.when + '</div></div>'
             + '<span class="mbr-badge" style="background:#F59E0B18;color:#F59E0B">Bekliyor</span>'
             + '</div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'reviews') {
    title = 'Değerlendirmeler'; icon = 'solar:star-bold'; tone = '#EAB308';
    body = '<div style="background:linear-gradient(135deg,#EAB308,#F59E0B);border-radius:var(--r-xl);padding:14px;color:#fff;margin-bottom:10px;text-align:center">'
         + '<div style="font:var(--fw-bold) 36px/1 var(--font)">' + b.rating.toFixed(1) + '</div>'
         + '<div style="font:var(--fw-medium) 11px/1 var(--font);opacity:.85;margin-top:4px">' + _abdStarStr(b.rating) + '</div>'
         + '<div style="font:var(--fw-regular) 10px/1.3 var(--font);opacity:.75;margin-top:6px">' + _admFmt(b.totalOrders || 0) + ' siparişten değerlendirme</div>'
         + '</div>'
         + '<div class="aud-sub-empty" style="margin-top:4px"><iconify-icon icon="solar:chat-square-linear" style="font-size:24px"></iconify-icon><span>Yorumlar yakında eklenecek.</span></div>';
  }
  else if (kind === 'delivery') {
    title = 'Teslimatlar'; icon = 'solar:delivery-bold'; tone = '#06B6D4';
    var deliveries = (typeof ADMIN_ORDERS !== 'undefined') ? ADMIN_ORDERS.filter(function(o) { return o.business === b.name && (o.status === 'on_way' || o.status === 'delivered'); }) : [];
    if (!deliveries.length) {
      body = _abdEmpty('solar:delivery-linear', 'Teslimat kaydı yok.');
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var di = 0; di < deliveries.length; di++) {
        var dl = deliveries[di];
        var dCol = dl.status === 'delivered' ? '#22C55E' : '#3B82F6';
        var dLbl = dl.status === 'delivered' ? 'Teslim Edildi' : 'Yolda';
        body += '<div class="aud-sub-row"><div style="display:flex;align-items:center;justify-content:space-between">'
             + '<div class="aud-sub-row-title">' + _abdEsc(dl.orderId + ' · ' + dl.user) + '</div>'
             + '<span class="mbr-badge" style="background:' + dCol + '18;color:' + dCol + '">' + dLbl + '</span></div>'
             + '<div class="aud-sub-row-meta">' + _admRelative(dl.date) + ' · ' + _admFmtTL(dl.total) + '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'orders') {
    title = 'Siparişler'; icon = 'solar:bag-check-bold'; tone = '#22C55E';
    var allOrders = (typeof ADMIN_ORDERS !== 'undefined') ? ADMIN_ORDERS.filter(function(o) { return o.business === b.name; }) : [];
    if (!allOrders.length) {
      body = _abdEmpty('solar:bag-linear', 'Sipariş yok.');
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var oi = 0; oi < allOrders.length; oi++) {
        var oo = allOrders[oi];
        var oCol = oo.status === 'delivered' ? '#22C55E' : oo.status === 'preparing' ? '#F59E0B' : oo.status === 'on_way' ? '#3B82F6' : '#EF4444';
        var oLbl = oo.status === 'delivered' ? 'Teslim' : oo.status === 'preparing' ? 'Hazırlama' : oo.status === 'on_way' ? 'Yolda' : 'İptal';
        body += '<div class="aud-sub-row"><div style="display:flex;align-items:center;justify-content:space-between">'
             + '<div class="aud-sub-row-title">' + _abdEsc(oo.orderId + ' · ' + oo.user) + '</div>'
             + '<span class="mbr-badge" style="background:' + oCol + '18;color:' + oCol + '">' + oLbl + '</span></div>'
             + '<div class="aud-sub-row-meta">' + _admRelative(oo.date) + ' · ' + _admFmtTL(oo.total) + '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'info') {
    title = 'İşletme Bilgileri'; icon = 'solar:info-circle-bold'; tone = '#6B7280';
    body = _abdKV([
      ['İşletme Adı',   b.name],
      ['Sahip',         b.owner],
      ['Yetkili Tel.',  b.ownerPhone || '—'],
      ['Şehir',         b.city],
      ['Şube Sayısı',   b.branches + ' şube'],
      ['Plan',          b.plan.charAt(0).toUpperCase() + b.plan.slice(1) + (b.planExpiry ? ' (' + b.planExpiry + ')' : '')],
      ['Kayıt Tarihi',  b.joinDate],
      ['Aylık Sipariş', _admFmt(b.monthlyOrders || 0)],
      ['Toplam Sipariş',_admFmt(b.totalOrders || 0)]
    ]);
  }
  else if (kind === 'finance') {
    title = 'Finans & Ödemeler'; icon = 'solar:card-bold'; tone = '#10B981';
    if (!b.walletHistory || !b.walletHistory.length) {
      body = _abdEmpty('solar:card-linear', 'Ödeme kaydı yok.');
    } else {
      var topups = b.walletHistory.filter(function(t) { return t.type === 'topup'; }).length;
      var comms  = b.walletHistory.filter(function(t) { return t.type === 'commission'; }).length;
      var refunds= b.walletHistory.filter(function(t) { return t.type === 'refund'; }).length;
      body = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'
           + _abdMini('Yükleme',   topups, '#22C55E')
           + _abdMini('Komisyon',  comms,  '#F59E0B')
           + _abdMini('İade',      refunds,'#8B5CF6')
           + '</div>'
           + '<div style="display:flex;flex-direction:column;gap:6px">';
      for (var fi = 0; fi < b.walletHistory.length; fi++) {
        var ft = b.walletHistory[fi];
        var fc = ft.amount > 0 ? '#22C55E' : '#EF4444';
        body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
             + '<div style="flex:1"><div class="aud-sub-row-title">' + _abdEsc(ft.desc) + '</div>'
             + '<div class="aud-sub-row-meta">' + _admRelative(ft.date) + '</div></div>'
             + '<div style="font:var(--fw-bold) 11px/1 var(--font);color:' + fc + '">' + (ft.amount > 0 ? '+' : '') + _admFmtTL(Math.abs(ft.amount)) + '</div>'
             + '</div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'branchSet') {
    title = 'Şube Ayarları · ' + branch; icon = 'solar:settings-bold'; tone = '#64748B';
    body = _abdKV([
      ['Şube Adı',      branch + ' Şubesi'],
      ['Durum',         'Açık'],
      ['Masa Sayısı',   (b.tables || 0) + ' masa'],
      ['Personel',      ((b.staff && b.staff.length) || 0) + ' çalışan'],
      ['Çalışma Saati', '09:00 – 23:00'],
      ['Telefon',       b.ownerPhone || '—']
    ]) + '<div class="aud-sub-empty" style="margin-top:10px"><iconify-icon icon="solar:settings-linear" style="font-size:24px"></iconify-icon><span>Detaylı şube ayarları yakında.</span></div>';
  }
  else if (kind === 'ads') {
    title = 'Reklam Alanı'; icon = 'solar:gallery-wide-bold'; tone = '#F43F5E';
    var camps = (typeof ADMIN_CAMPAIGNS !== 'undefined') ? ADMIN_CAMPAIGNS.filter(function(c) { return (c.businesses || []).indexOf(b.name) !== -1; }) : [];
    if (!camps.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:gallery-linear" style="font-size:28px"></iconify-icon><span>Aktif kampanya yok.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var ci = 0; ci < camps.length; ci++) {
        var cm = camps[ci];
        var cCol = cm.status === 'active' ? '#22C55E' : '#9CA3AF';
        body += '<div class="aud-sub-row"><div style="display:flex;align-items:center;justify-content:space-between">'
             + '<div class="aud-sub-row-title">' + _abdEsc(cm.name) + '</div>'
             + '<span class="mbr-badge" style="background:' + cCol + '18;color:' + cCol + '">' + (cm.status === 'active' ? 'Aktif' : 'Bitti') + '</span></div>'
             + '<div class="aud-sub-row-meta">' + _admFmt(cm.usageCount || 0) + ' kullanım</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'premium') {
    title = 'Premium Plan'; icon = 'solar:crown-bold'; tone = '#A855F7';
    var isPr = b.plan === 'premium';
    body = '<div style="background:' + (isPr ? 'linear-gradient(135deg,#A855F7,#6366F1)' : 'linear-gradient(135deg,#6B7280,#9CA3AF)') + ';border-radius:var(--r-xl);padding:16px;color:#fff;margin-bottom:10px">'
         + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><iconify-icon icon="solar:crown-bold" style="font-size:22px"></iconify-icon><span style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">' + (isPr ? 'Premium Plan Aktif' : 'Ücretsiz Plan') + '</span></div>'
         + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);opacity:.85">' + (isPr ? 'Gelişmiş raporlar, düşük komisyon, öncelikli destek' : 'Temel işletme özelliklerine erişim') + '</div>'
         + '</div>'
         + _abdKV([
            ['Plan',         b.plan.charAt(0).toUpperCase() + b.plan.slice(1)],
            ['Bitiş',        b.planExpiry || 'Süresiz'],
            ['Komisyon',     '%' + b.commission],
            ['Premium Avantajı', isPr ? 'Var' : 'Yok']
          ]);
  }

  _admOpenSubSheet(title, icon, tone, body);
}

/* ═══ Helpers ═══ */
function _abdInfoRow(icon, label, value) {
  return '<div class="abd-info-row"><iconify-icon icon="' + icon + '" style="font-size:16px;color:var(--text-secondary)"></iconify-icon>'
       + '<span class="abd-info-label">' + label + '</span>'
       + '<span class="abd-info-value">' + _abdEsc(value) + '</span>'
       + '</div>';
}

function _abdQStat(icon, color, label, value, sub) {
  return '<div class="abd-qstat">'
       + '<div class="abd-qstat-icon" style="background:' + color + '18;color:' + color + '"><iconify-icon icon="' + icon + '" style="font-size:18px"></iconify-icon></div>'
       + '<div class="abd-qstat-val">' + value + '</div>'
       + '<div class="abd-qstat-lbl">' + label + (sub ? ' · <span style="color:var(--text-tertiary)">' + sub + '</span>' : '') + '</div>'
       + '</div>';
}

function _abdMini(label, value, color) {
  return '<div style="background:' + color + '12;border:1px solid ' + color + '30;border-radius:var(--r-md);padding:10px;text-align:center">'
       + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + '">' + value + '</div>'
       + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px">' + label + '</div>'
       + '</div>';
}

function _abdKV(pairs) {
  var h = '<div class="aud-kv">';
  for (var i = 0; i < pairs.length; i++) {
    h += '<div class="aud-kv-row"><span class="aud-kv-k">' + _abdEsc(pairs[i][0]) + '</span><span class="aud-kv-v">' + _abdEsc(pairs[i][1] || '—') + '</span></div>';
  }
  return h + '</div>';
}

function _abdEmpty(icon, label) {
  return '<div class="aud-sub-empty"><iconify-icon icon="' + icon + '" style="font-size:28px"></iconify-icon><span>' + label + '</span></div>';
}

function _abdRoleColor(role) {
  var m = { owner:'#A855F7', manager:'#3B82F6', chef:'#F59E0B', waiter:'#10B981', cashier:'#6366F1', courier:'#06B6D4', coordinator:'#EC4899' };
  return m[role] || '#6B7280';
}

function _abdRoleLabel(role) {
  var m = { owner:'Sahip', manager:'Müdür', chef:'Şef', waiter:'Garson', cashier:'Kasiyer', courier:'Kurye', coordinator:'Koordinatör' };
  return m[role] || role;
}

function _abdTierLabel(rating) {
  if (rating >= 4.8) return 'Mükemmel';
  if (rating >= 4.5) return 'Çok İyi';
  if (rating >= 4.0) return 'İyi';
  if (rating >= 3.5) return 'Orta';
  return 'Gelişmeli';
}

function _abdStarStr(rating) {
  var full = Math.floor(rating);
  var half = (rating - full) >= 0.5 ? 1 : 0;
  var empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function _abdMockPostsFor(b) {
  return [
    { text:'Yeni menümüzü keşfet — bu hafta tatlı bölümü yenilendi!',  when:'2 gün önce', likes:48, comments:12 },
    { text:b.name + ' olarak sizlere en taze malzemelerle hizmet vermeye devam ediyoruz.', when:'5 gün önce', likes:32, comments:6 },
    { text:'Pazartesi özel indirimlerimiz için sepetinizi hazırlayın.', when:'1 hafta önce', likes:21, comments:3 }
  ];
}

function _abdMockCallsFor(b) {
  if (!b.activeOrders) return [];
  var out = [];
  var reasons = ['Hesap isteği', 'Su isteği', 'Ek sipariş', 'Kağıt havlu'];
  for (var i = 0; i < Math.min(b.activeOrders, 3); i++) {
    out.push({ table: (i + 1), reason: reasons[i % reasons.length], when: (i + 1) * 2 + ' dk önce' });
  }
  return out;
}

function _abdEsc(s) {
  if (s == null) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function _abdEscAttr(s) {
  if (s == null) return '';
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

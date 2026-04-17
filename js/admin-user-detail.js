/* ═══════════════════════════════════════════════════════════
   ADMIN USER DETAIL — Full-screen profile + hamburger 13-tile sheet
   ═══════════════════════════════════════════════════════════ */

var _audState = { tab: 'posts', uid: null };

/* ═══ Aç ═══ */
function _admOpenUserFullDetail(uid) {
  var u = ADMIN_USERS.find(function(x) { return x.id === uid; });
  if (!u) return;
  _audState.uid = uid;
  _audState.tab = 'posts';

  /* Drawer'ı kapatıp full overlay aç */
  if (typeof _mbrRemoveDrawer === 'function') _mbrRemoveDrawer();

  /* Önceki overlay varsa kaldır */
  var prev = document.getElementById('audOverlay');
  if (prev) prev.remove();

  var postsN = (u.posts && u.posts.length) || 0;
  var followersN = u.followers || 0;
  var followingN = u.following || 0;
  var storiesN = (u.stories && u.stories.length) || 0;

  var ov = document.createElement('div');
  ov.id = 'audOverlay';
  ov.className = 'aud-overlay';

  var storyRing = '';
  if (storiesN > 0) {
    storyRing = '<div class="aud-avatar-ring" title="Aktif hikayeler"></div>';
  }

  var h = '<div class="aud-container">';

  /* Topbar */
  h += '<div class="aud-topbar">'
    + '<div class="btn-icon" onclick="_admCloseUserFullDetail()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    + '<span class="aud-topbar-name">' + _audEsc(u.name) + '</span>'
    + '<div class="btn-icon" onclick="_admOpenUserMenu(\'' + u.id + '\')"><iconify-icon icon="solar:hamburger-menu-linear" style="font-size:22px"></iconify-icon></div>'
    + '</div>';

  /* Header */
  h += '<div class="aud-header">'
    + '<div class="aud-avatar-area">'
    + storyRing
    + '<div class="aud-avatar">' + _audEsc(u.name.charAt(0)) + '</div>'
    + '</div>'
    + '<div class="aud-stats">'
    + '<div class="aud-stat"><span class="aud-stat-num">' + postsN + '</span><span class="aud-stat-label">Paylaşım</span></div>'
    + '<div class="aud-stat"><span class="aud-stat-num">' + _admFmt(followersN) + '</span><span class="aud-stat-label">Takipçi</span></div>'
    + '<div class="aud-stat"><span class="aud-stat-num">' + _admFmt(followingN) + '</span><span class="aud-stat-label">Takip</span></div>'
    + '</div>'
    + '</div>';

  /* Bio */
  h += '<div class="aud-info">'
    + '<div class="aud-name">' + _audEsc(u.name) + (u.isPremium ? ' <span class="aud-premium-badge"><iconify-icon icon="solar:crown-bold" style="font-size:10px"></iconify-icon> Premium</span>' : '') + '</div>'
    + '<div class="aud-bio">' + _audEsc(u.healthNotes || 'Açıklama eklenmemiş.') + '</div>'
    + '<div class="aud-meta">'
    + '<span><iconify-icon icon="solar:map-point-linear" style="font-size:11px"></iconify-icon> ' + _audEsc(u.city + (u.district ? ', ' + u.district : '')) + '</span>'
    + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:11px"></iconify-icon> Kayıt: ' + _audEsc(u.joinDate) + '</span>'
    + '</div>'
    + '</div>';

  /* Stories strip */
  if (u.stories && u.stories.length) {
    h += '<div class="aud-stories">';
    for (var si = 0; si < u.stories.length; si++) {
      var st = u.stories[si];
      var expCls = st.expired ? ' aud-story--expired' : '';
      h += '<div class="aud-story' + expCls + '" title="' + _audEsc(st.text) + '">'
        + '<div class="aud-story-inner">' + _audEsc((st.text || '').charAt(0)) + '</div>'
        + '<div class="aud-story-cap">' + _admRelative(st.date) + '</div>'
        + '</div>';
    }
    h += '</div>';
  }

  /* Tabs */
  h += '<div class="aud-tabs">'
    + '<div class="aud-tab active" data-aud-tab="posts" onclick="_admSetUserDetailTab(\'posts\')"><iconify-icon icon="solar:posts-carousel-horizontal-bold" style="font-size:22px"></iconify-icon></div>'
    + '<div class="aud-tab" data-aud-tab="recipes" onclick="_admSetUserDetailTab(\'recipes\')"><iconify-icon icon="solar:book-bookmark-bold" style="font-size:22px"></iconify-icon></div>'
    + '<div class="aud-tab" data-aud-tab="liked" onclick="_admSetUserDetailTab(\'liked\')"><iconify-icon icon="solar:heart-bold" style="font-size:22px"></iconify-icon></div>'
    + '</div>';

  /* Tab content */
  h += '<div class="aud-tab-content" id="audTabContent"></div>';

  h += '</div>';

  ov.innerHTML = h;
  document.getElementById('adminPhone').appendChild(ov);
  requestAnimationFrame(function() { ov.classList.add('open'); });

  _admSetUserDetailTab('posts');
}

function _admCloseUserFullDetail() {
  var ov = document.getElementById('audOverlay');
  if (!ov) return;
  ov.classList.remove('open');
  setTimeout(function() { ov.remove(); }, 250);
}

/* ═══ Tabs ═══ */
function _admSetUserDetailTab(tab) {
  _audState.tab = tab;
  var tabs = document.querySelectorAll('#audOverlay .aud-tab');
  tabs.forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-aud-tab') === tab);
  });
  var c = document.getElementById('audTabContent');
  if (!c) return;
  var u = ADMIN_USERS.find(function(x) { return x.id === _audState.uid; });
  if (!u) return;

  if (tab === 'posts')       c.innerHTML = _audRenderPosts(u);
  else if (tab === 'recipes')c.innerHTML = _audRenderRecipes(u);
  else if (tab === 'liked')  c.innerHTML = _audRenderLiked(u);
}

function _audRenderPosts(u) {
  if (!u.posts || !u.posts.length) return _audEmpty('solar:gallery-linear', 'Henüz paylaşım yok');
  var h = '<div class="aud-grid">';
  for (var i = 0; i < u.posts.length; i++) {
    var p = u.posts[i];
    var hue = (i * 47) % 360;
    h += '<div class="aud-grid-item" style="background:linear-gradient(135deg,hsl(' + hue + ',65%,55%),hsl(' + ((hue + 40) % 360) + ',70%,45%))">'
      + '<div class="aud-grid-item-text">' + _audEsc(p.text) + '</div>'
      + '<div class="aud-grid-item-overlay"><span class="aud-grid-item-stat"><iconify-icon icon="solar:heart-bold" style="font-size:12px"></iconify-icon> ' + p.likes + '</span></div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

function _audRenderRecipes(u) {
  /* Mock saved recipes — admin view (u.orders bazlı tahmini kategoriler) */
  var mockRecipes = _audMockRecipesFor(u);
  if (!mockRecipes.length) return _audEmpty('solar:book-bookmark-linear', 'Kayıtlı tarif yok');
  var h = '<div class="aud-recipe-list">';
  for (var i = 0; i < mockRecipes.length; i++) {
    var r = mockRecipes[i];
    h += '<div class="aud-recipe-card">'
      + '<div class="aud-recipe-thumb" style="background:' + r.color + '"><iconify-icon icon="' + r.icon + '" style="font-size:22px;color:#fff"></iconify-icon></div>'
      + '<div class="aud-recipe-info">'
      + '<div class="aud-recipe-name">' + _audEsc(r.name) + '</div>'
      + '<div class="aud-recipe-meta">' + r.time + ' · ' + r.cal + ' kcal</div>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

function _audRenderLiked(u) {
  /* Beğeniler: posts'un likes'a göre sıralı aynası olarak mock */
  var liked = (u.posts || []).slice().reverse();
  if (!liked.length) return _audEmpty('solar:heart-linear', 'Beğenilen gönderi yok');
  var h = '<div class="aud-liked-list">';
  for (var i = 0; i < liked.length; i++) {
    var p = liked[i];
    h += '<div class="aud-liked-card">'
      + '<div class="aud-liked-icon"><iconify-icon icon="solar:heart-bold" style="font-size:18px;color:#EF4444"></iconify-icon></div>'
      + '<div class="aud-liked-body">'
      + '<div class="aud-liked-text">' + _audEsc(p.text) + '</div>'
      + '<div class="aud-liked-meta">' + _admRelative(p.date) + ' · ' + p.likes + ' beğeni</div>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

function _audEmpty(icon, label) {
  return '<div class="aud-empty"><iconify-icon icon="' + icon + '" style="font-size:40px"></iconify-icon><span>' + label + '</span></div>';
}

function _audMockRecipesFor(u) {
  /* Her kullanıcı için deterministik mock tarif seti */
  var seeds = [
    { name:'Fırında Tavuk',   time:'45 dk', cal:420, icon:'solar:chef-hat-bold',        color:'#F97316' },
    { name:'Karides Salatası',time:'15 dk', cal:280, icon:'solar:leaf-bold',            color:'#10B981' },
    { name:'Mercimek Çorbası',time:'30 dk', cal:180, icon:'solar:cup-hot-bold',         color:'#F59E0B' },
    { name:'Brownie',         time:'40 dk', cal:320, icon:'solar:cake-bold',            color:'#EC4899' },
    { name:'Izgara Köfte',    time:'25 dk', cal:380, icon:'solar:fire-bold',            color:'#EF4444' },
    { name:'Yeşil Smoothie',  time:'5 dk',  cal:150, icon:'solar:bottle-bold',          color:'#22C55E' }
  ];
  var n = Math.min(seeds.length, Math.max(2, Math.floor((u.orders || 0) / 20)));
  return seeds.slice(0, n);
}

/* ═══ Hamburger Sheet — 13 Tile ═══ */
function _admOpenUserMenu(uid) {
  var u = ADMIN_USERS.find(function(x) { return x.id === uid; });
  if (!u) return;

  var prev = document.getElementById('audMenuSheet');
  if (prev) prev.remove();

  var orders = (typeof ADMIN_ORDERS !== 'undefined') ? ADMIN_ORDERS.filter(function(o) { return o.user === u.name; }) : [];
  var reports = (typeof ADMIN_REPORTS !== 'undefined') ? ADMIN_REPORTS.filter(function(r) { return (r.reportedBy === u.name) || (r.target === u.name); }) : [];

  var tiles = [
    { id:'report',    label:'Kullanıcı Raporu',       icon:'solar:document-text-bold',     tone:'#EF4444', sum:reports.length + ' rapor' },
    { id:'account',   label:'Hesap Bilgileri',        icon:'solar:user-id-bold',           tone:'#3B82F6', sum:u.email || '—' },
    { id:'community', label:'Kullanıcı Topluluğu',    icon:'solar:users-group-rounded-bold', tone:'#8B5CF6', sum:_admFmt(u.followers || 0) + ' takipçi' },
    { id:'orders',    label:'Sipariş Geçmişi',        icon:'solar:bag-check-bold',         tone:'#F59E0B', sum:orders.length + ' sipariş' },
    { id:'favorites', label:'Favoriler',              icon:'solar:heart-bold',             tone:'#EC4899', sum:_audMockRecipesFor(u).length + ' favori' },
    { id:'addresses', label:'Kayıtlı Adresler',       icon:'solar:map-point-bold',         tone:'#14B8A6', sum:((u.savedAddresses && u.savedAddresses.length) || 0) + ' adres' },
    { id:'premium',   label:'Premium Bilgisi',        icon:'solar:crown-bold',             tone:'#A855F7', sum:u.isPremium ? 'Aktif' : 'Yok' },
    { id:'wallet',    label:'İşlem Geçmişi',          icon:'solar:wallet-money-bold',      tone:'#22C55E', sum:_admFmt(u.walletBalance || 0) + ' token' },
    { id:'social',    label:'Topluluk Geçmişi',       icon:'solar:chat-round-dots-bold',   tone:'#06B6D4', sum:((u.posts && u.posts.length) || 0) + ' post • ' + ((u.comments && u.comments.length) || 0) + ' yorum' },
    { id:'plans',     label:'Planlarım',              icon:'solar:calendar-mark-bold',     tone:'#6366F1', sum:'Haftalık plan' },
    { id:'cart',      label:'Sepet',                  icon:'solar:cart-large-2-bold',      tone:'#F65013', sum:'Anlık sepet' },
    { id:'history',   label:'Oturum Geçmişi',         icon:'solar:history-bold',           tone:'#6B7280', sum:'Son aktif: ' + _admRelative(u.lastActive) },
    { id:'ban',       label:'Engel & Yasak',          icon:'solar:forbidden-circle-bold',  tone:u.status === 'active' ? '#6B7280' : '#EF4444', sum:u.status === 'active' ? 'Aktif' : 'Yasaklı' }
  ];

  var sh = document.createElement('div');
  sh.id = 'audMenuSheet';
  sh.className = 'aud-menu-backdrop';
  sh.onclick = function(e) { if (e.target === sh) _admCloseUserMenu(); };

  var h = '<div class="aud-menu-sheet">'
    + '<div class="aud-menu-head">'
    + '<div class="aud-menu-title">Yönetim İşlemleri</div>'
    + '<div class="btn-icon" onclick="_admCloseUserMenu()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>'
    + '<div class="aud-menu-sub">' + _audEsc(u.name) + ' · ' + _audEsc(u.email || '') + '</div>'
    + '<div class="aud-menu-grid">';

  for (var i = 0; i < tiles.length; i++) {
    var t = tiles[i];
    h += '<div class="aud-menu-tile" onclick="_admUserMenuAction(\'' + t.id + '\',\'' + uid + '\')">'
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

function _admCloseUserMenu() {
  var sh = document.getElementById('audMenuSheet');
  if (!sh) return;
  sh.classList.remove('open');
  setTimeout(function() { sh.remove(); }, 250);
}

/* ═══ Tile Actions — her tile için bottom-sheet ile içerik ═══ */
function _admUserMenuAction(kind, uid) {
  var u = ADMIN_USERS.find(function(x) { return x.id === uid; });
  if (!u) return;

  var body = '';
  var title = '';
  var icon = '';
  var tone = '#6366F1';

  if (kind === 'report') {
    title = 'Kullanıcı Raporu'; icon = 'solar:document-text-bold'; tone = '#EF4444';
    var reps = (typeof ADMIN_REPORTS !== 'undefined') ? ADMIN_REPORTS.filter(function(r) { return r.reportedBy === u.name || r.target === u.name; }) : [];
    if (!reps.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:shield-check-bold" style="font-size:28px;color:#22C55E"></iconify-icon><span>Bu kullanıcıya dair rapor bulunmuyor.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var i = 0; i < reps.length; i++) {
        var r = reps[i];
        body += '<div class="aud-sub-row"><div class="aud-sub-row-title">' + _audEsc(r.type + ' · ' + (r.target || '—')) + '</div>'
             + '<div class="aud-sub-row-meta">' + _audEsc(r.reportedBy) + ' · ' + _admRelative(r.date) + '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'account') {
    title = 'Hesap Bilgileri'; icon = 'solar:user-id-bold'; tone = '#3B82F6';
    body = _audKV([
      ['Ad Soyad',    u.name],
      ['E-posta',     u.email || '—'],
      ['Telefon',     u.phone || '—'],
      ['Şehir',       u.city + (u.district ? ', ' + u.district : '')],
      ['Boy / Kilo',  (u.height ? u.height + ' cm' : '—') + ' / ' + (u.weight ? u.weight + ' kg' : '—')],
      ['Alerjenler',  (u.allergens && u.allergens.length) ? u.allergens.join(', ') : 'Yok'],
      ['Sağlık Notu', u.healthNotes || 'Girilmemiş'],
      ['Kayıt Tarihi', u.joinDate || '—'],
      ['Son Aktif',   _admRelative(u.lastActive)]
    ]);
  }
  else if (kind === 'community') {
    title = 'Kullanıcı Topluluğu'; icon = 'solar:users-group-rounded-bold'; tone = '#8B5CF6';
    body = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'
         + _audStat('Takipçi', _admFmt(u.followers || 0), '#8B5CF6')
         + _audStat('Takip',   _admFmt(u.following || 0), '#3B82F6')
         + _audStat('Engelli', _admFmt(u.blocked || 0),   '#EF4444')
         + '</div>'
         + '<div class="aud-sub-empty" style="margin-top:4px"><iconify-icon icon="solar:users-group-rounded-linear" style="font-size:24px"></iconify-icon><span>Detaylı takipçi/takip listesi yakında.</span></div>';
  }
  else if (kind === 'orders') {
    title = 'Sipariş Geçmişi'; icon = 'solar:bag-check-bold'; tone = '#F59E0B';
    var orders = (typeof ADMIN_ORDERS !== 'undefined') ? ADMIN_ORDERS.filter(function(o) { return o.user === u.name; }) : [];
    if (!orders.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:bag-linear" style="font-size:28px"></iconify-icon><span>Sipariş kaydı bulunamadı.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var j = 0; j < orders.length; j++) {
        var o = orders[j];
        var st = o.status === 'delivered' ? '#22C55E' : o.status === 'preparing' ? '#F59E0B' : o.status === 'on_way' ? '#3B82F6' : '#EF4444';
        var sl = o.status === 'delivered' ? 'Teslim' : o.status === 'preparing' ? 'Hazırlama' : o.status === 'on_way' ? 'Yolda' : 'İptal';
        body += '<div class="aud-sub-row"><div style="display:flex;align-items:center;justify-content:space-between"><div class="aud-sub-row-title">' + _audEsc(o.business + ' · ' + o.orderId) + '</div>'
             + '<span class="mbr-badge" style="background:' + st + '18;color:' + st + '">' + sl + '</span></div>'
             + '<div class="aud-sub-row-meta">' + _admRelative(o.date) + ' · ' + _admFmtTL(o.total) + '</div></div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'favorites') {
    title = 'Favoriler'; icon = 'solar:heart-bold'; tone = '#EC4899';
    var favs = _audMockRecipesFor(u);
    body = '<div style="display:flex;flex-direction:column;gap:8px">';
    for (var k = 0; k < favs.length; k++) {
      body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
           + '<div class="aud-recipe-thumb" style="background:' + favs[k].color + ';width:36px;height:36px;border-radius:10px"><iconify-icon icon="' + favs[k].icon + '" style="font-size:18px;color:#fff"></iconify-icon></div>'
           + '<div style="flex:1"><div class="aud-sub-row-title">' + favs[k].name + '</div>'
           + '<div class="aud-sub-row-meta">' + favs[k].time + ' · ' + favs[k].cal + ' kcal</div></div>'
           + '</div>';
    }
    body += '</div>';
  }
  else if (kind === 'addresses') {
    title = 'Kayıtlı Adresler'; icon = 'solar:map-point-bold'; tone = '#14B8A6';
    var addrs = u.savedAddresses || [];
    if (!addrs.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:map-point-linear" style="font-size:28px"></iconify-icon><span>Kayıtlı adres yok.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      for (var a = 0; a < addrs.length; a++) {
        body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
             + '<iconify-icon icon="solar:home-2-bold" style="font-size:18px;color:#14B8A6"></iconify-icon>'
             + '<div style="flex:1"><div class="aud-sub-row-title">Adres ' + (a + 1) + '</div>'
             + '<div class="aud-sub-row-meta">' + _audEsc(addrs[a]) + '</div></div>'
             + '</div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'premium') {
    title = 'Premium Bilgisi'; icon = 'solar:crown-bold'; tone = '#A855F7';
    if (u.isPremium) {
      body = '<div style="background:linear-gradient(135deg,#A855F7,#6366F1);border-radius:var(--r-xl);padding:16px;color:#fff;margin-bottom:10px">'
           + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><iconify-icon icon="solar:crown-bold" style="font-size:22px"></iconify-icon><span style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">Premium Üye</span></div>'
           + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);opacity:.85">Tüm premium özelliklere sınırsız erişim</div>'
           + '</div>'
           + _audKV([['Plan','Premium'], ['Durum','Aktif'], ['Yenileme','Otomatik']]);
    } else {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:crown-linear" style="font-size:28px;color:var(--text-muted)"></iconify-icon><span>Kullanıcı premium değil.</span></div>';
    }
  }
  else if (kind === 'wallet') {
    title = 'İşlem Geçmişi'; icon = 'solar:wallet-money-bold'; tone = '#22C55E';
    var txns = _audMockTxnsFor(u);
    body = '<div style="background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:var(--r-xl);padding:12px;color:#fff;margin-bottom:10px;display:flex;align-items:center;gap:10px">'
         + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:22px"></iconify-icon>'
         + '<div><div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.8">Cüzdan Bakiyesi</div>'
         + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);margin-top:3px">' + _admFmt(u.walletBalance || 0) + ' Token</div></div>'
         + '</div>'
         + '<div style="display:flex;flex-direction:column;gap:6px">';
    for (var tx = 0; tx < txns.length; tx++) {
      var t = txns[tx];
      var amtColor = t.amount > 0 ? '#22C55E' : '#EF4444';
      body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
           + '<iconify-icon icon="' + t.icon + '" style="font-size:16px;color:' + amtColor + '"></iconify-icon>'
           + '<div style="flex:1"><div class="aud-sub-row-title">' + t.label + '</div>'
           + '<div class="aud-sub-row-meta">' + t.date + '</div></div>'
           + '<div style="font:var(--fw-bold) 11px/1 var(--font);color:' + amtColor + '">' + (t.amount > 0 ? '+' : '') + t.amount + ' Token</div>'
           + '</div>';
    }
    body += '</div>';
  }
  else if (kind === 'social') {
    title = 'Topluluk Geçmişi'; icon = 'solar:chat-round-dots-bold'; tone = '#06B6D4';
    var items = [];
    (u.posts || []).forEach(function(p) { items.push({ t:'post', d:p.date, text:p.text, meta:p.likes + ' beğeni' }); });
    (u.comments || []).forEach(function(cm) { items.push({ t:'comment', d:cm.date, text:'"' + cm.text + '"', meta:cm.on + ' üzerine' }); });
    (u.stories || []).forEach(function(s) { items.push({ t:'story', d:s.date, text:s.text, meta:s.expired ? 'Süresi doldu' : 'Aktif' }); });
    items.sort(function(a, b) { return new Date(b.d) - new Date(a.d); });
    if (!items.length) {
      body = '<div class="aud-sub-empty"><iconify-icon icon="solar:chat-round-linear" style="font-size:28px"></iconify-icon><span>Topluluk aktivitesi yok.</span></div>';
    } else {
      body = '<div style="display:flex;flex-direction:column;gap:8px">';
      var iconMap = { post:'solar:posts-carousel-horizontal-bold', comment:'solar:chat-round-bold', story:'solar:camera-bold' };
      var toneMap = { post:'#3B82F6', comment:'#8B5CF6', story:'#F59E0B' };
      for (var ii = 0; ii < items.length; ii++) {
        var it = items[ii];
        body += '<div class="aud-sub-row" style="display:flex;align-items:flex-start;gap:10px">'
             + '<iconify-icon icon="' + iconMap[it.t] + '" style="font-size:16px;color:' + toneMap[it.t] + ';margin-top:1px"></iconify-icon>'
             + '<div style="flex:1"><div class="aud-sub-row-title">' + _audEsc(it.text) + '</div>'
             + '<div class="aud-sub-row-meta">' + _admRelative(it.d) + ' · ' + it.meta + '</div></div>'
             + '</div>';
      }
      body += '</div>';
    }
  }
  else if (kind === 'plans') {
    title = 'Planlarım'; icon = 'solar:calendar-mark-bold'; tone = '#6366F1';
    var days = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
    body = '<div style="display:flex;flex-direction:column;gap:6px">';
    for (var dd = 0; dd < days.length; dd++) {
      var seeds = _audMockRecipesFor(u);
      var meal = seeds[dd % Math.max(1, seeds.length)];
      body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
           + '<div style="width:32px;height:32px;border-radius:8px;background:var(--glass-card-strong);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 11px/1 var(--font);color:var(--text-secondary)">' + days[dd] + '</div>'
           + '<div style="flex:1"><div class="aud-sub-row-title">' + (meal ? meal.name : 'Plan yok') + '</div>'
           + '<div class="aud-sub-row-meta">Öğle · ' + (meal ? meal.cal + ' kcal' : '—') + '</div></div>'
           + '</div>';
    }
    body += '</div>';
  }
  else if (kind === 'cart') {
    title = 'Anlık Sepet'; icon = 'solar:cart-large-2-bold'; tone = '#F65013';
    body = '<div class="aud-sub-empty"><iconify-icon icon="solar:cart-large-2-linear" style="font-size:28px"></iconify-icon><span>Sepet şu anda boş.</span></div>';
  }
  else if (kind === 'history') {
    title = 'Oturum Geçmişi'; icon = 'solar:history-bold'; tone = '#6B7280';
    var sess = _audMockSessionsFor(u);
    body = '<div style="display:flex;flex-direction:column;gap:6px">';
    for (var s = 0; s < sess.length; s++) {
      var sv = sess[s];
      body += '<div class="aud-sub-row" style="display:flex;align-items:center;gap:10px">'
           + '<iconify-icon icon="' + sv.icon + '" style="font-size:16px;color:' + sv.color + '"></iconify-icon>'
           + '<div style="flex:1"><div class="aud-sub-row-title">' + sv.device + '</div>'
           + '<div class="aud-sub-row-meta">' + sv.when + ' · ' + sv.loc + '</div></div>'
           + '</div>';
    }
    body += '</div>';
  }
  else if (kind === 'ban') {
    title = 'Engel & Yasak'; icon = 'solar:forbidden-circle-bold'; tone = u.status === 'active' ? '#6B7280' : '#EF4444';
    var isActive = u.status === 'active';
    body = '<div style="background:' + (isActive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)') + ';border:1px solid ' + (isActive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)') + ';border-radius:var(--r-xl);padding:12px;margin-bottom:12px;display:flex;align-items:center;gap:10px">'
         + '<iconify-icon icon="' + (isActive ? 'solar:shield-check-bold' : 'solar:forbidden-bold') + '" style="font-size:22px;color:' + (isActive ? '#22C55E' : '#EF4444') + '"></iconify-icon>'
         + '<div><div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + (isActive ? 'Aktif Kullanıcı' : 'Yasaklı') + '</div>'
         + '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary);margin-top:3px">' + (isActive ? 'Hesap her türlü platform işlemine açık.' : 'Kullanıcının platforma erişimi engellenmiş durumda.') + '</div></div>'
         + '</div>'
         + _audKV([
            ['Engelli kişi sayısı', String(u.blocked || 0)],
            ['Durum', isActive ? 'Aktif' : 'Yasaklı'],
            ['Son Aktif', _admRelative(u.lastActive)]
          ])
         + '<button class="aud-danger-btn" onclick="_admToast(\'' + (isActive ? 'Kullanıcı yasaklandı' : 'Yasak kaldırıldı') + '\',\'ok\');_admCloseSubSheet()">'
         + '<iconify-icon icon="' + (isActive ? 'solar:forbidden-bold' : 'solar:check-circle-bold') + '" style="font-size:16px"></iconify-icon>'
         + (isActive ? 'Kullanıcıyı Yasakla' : 'Yasağı Kaldır')
         + '</button>';
  }

  _admOpenSubSheet(title, icon, tone, body);
}

function _audMockTxnsFor(u) {
  var out = [];
  var add = function(amount, label, daysAgo, icon) {
    var d = new Date(Date.now() - daysAgo * 86400000);
    out.push({ amount:amount, label:label, icon:icon, date:d.toLocaleDateString('tr-TR', { day:'numeric', month:'short' }) });
  };
  add(500,  'Token yükleme',   10, 'solar:add-circle-bold');
  add(-120, 'Sipariş ödemesi',  7, 'solar:bag-check-bold');
  add(-80,  'Sipariş ödemesi',  4, 'solar:bag-check-bold');
  add(250,  'Kampanya bonusu',  3, 'solar:gift-bold');
  add(-45,  'Sipariş ödemesi',  1, 'solar:bag-check-bold');
  return out;
}

function _audMockSessionsFor(u) {
  var city = u.city || 'İstanbul';
  return [
    { device:'iPhone 15 · iOS',  when:_admRelative(u.lastActive), loc:city,       icon:'solar:iphone-bold',   color:'#3B82F6' },
    { device:'Chrome · macOS',   when:'2 gün önce',              loc:city,       icon:'solar:monitor-bold',  color:'#6366F1' },
    { device:'Safari · iPadOS',  when:'5 gün önce',              loc:city,       icon:'solar:tablet-bold',   color:'#8B5CF6' }
  ];
}

/* ═══ Sub-sheet (bottom) ═══ */
function _admOpenSubSheet(title, icon, tone, body) {
  var prev = document.getElementById('audSubSheet');
  if (prev) prev.remove();

  var sh = document.createElement('div');
  sh.id = 'audSubSheet';
  sh.className = 'aud-sub-backdrop';
  sh.onclick = function(e) { if (e.target === sh) _admCloseSubSheet(); };

  var h = '<div class="aud-sub-sheet">'
        + '<div class="aud-sub-head">'
        + '<div style="display:flex;align-items:center;gap:10px">'
        + '<div style="width:36px;height:36px;border-radius:10px;background:' + tone + '18;color:' + tone + ';display:flex;align-items:center;justify-content:center"><iconify-icon icon="' + icon + '" style="font-size:20px"></iconify-icon></div>'
        + '<div class="aud-sub-title">' + title + '</div>'
        + '</div>'
        + '<div class="btn-icon" onclick="_admCloseSubSheet()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
        + '</div>'
        + '<div class="aud-sub-body">' + body + '</div>'
        + '</div>';

  sh.innerHTML = h;
  document.getElementById('adminPhone').appendChild(sh);
  requestAnimationFrame(function() { sh.classList.add('open'); });
}

function _admCloseSubSheet() {
  var sh = document.getElementById('audSubSheet');
  if (!sh) return;
  sh.classList.remove('open');
  setTimeout(function() { sh.remove(); }, 250);
}

/* ═══ Helpers ═══ */
function _audKV(pairs) {
  var h = '<div class="aud-kv">';
  for (var i = 0; i < pairs.length; i++) {
    h += '<div class="aud-kv-row"><span class="aud-kv-k">' + _audEsc(pairs[i][0]) + '</span><span class="aud-kv-v">' + _audEsc(pairs[i][1] || '—') + '</span></div>';
  }
  h += '</div>';
  return h;
}

function _audStat(label, value, color) {
  return '<div style="background:' + color + '14;border:1px solid ' + color + '33;border-radius:var(--r-md);padding:10px;text-align:center">'
       + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + '">' + value + '</div>'
       + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px">' + label + '</div>'
       + '</div>';
}

function _audEsc(s) {
  if (s == null) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ═══ COMMUNITY COMPONENT ═══ */

let commActiveFilter = 'all';

/* ── Topluluk Menü — Tile layout (Beğendiklerim / Kaydedilenler / Yorumlar / Engellediklerim) ── */
let _commBlockedSubTab = 'users';  // 'users' | 'content'

function openCommMenu() {
  var existing = document.getElementById('commMenuOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'commMenuOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.display = 'flex';

  overlay.innerHTML = '<div class="prof-container" id="commMenuContainer">'
    + '<div class="prof-topbar">'
    + '<div class="btn-icon" onclick="closeCommMenu()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    + '<span class="prof-topbar-name">Menü</span>'
    + '<div style="width:32px"></div>'
    + '</div>'
    + '<div id="commMenuContent" style="flex:1;overflow-y:auto"></div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  _renderCommMenuHome();
}

function closeCommMenu() {
  var el = document.getElementById('commMenuOverlay');
  if (el) el.remove();
}

/* ═══ HOME — Tile layout ═══ */
function _renderCommMenuHome() {
  var container = document.getElementById('commMenuContent');
  if (!container) return;

  var likedCount    = (USER_PROFILE.likedPosts   || []).length;
  var savedCount    = (USER_PROFILE.savedPosts   || []).length;
  var commentsCount = (USER_PROFILE.userComments || []).length;
  var blockedUsersCount = (typeof _commBlockedHandles !== 'undefined' ? _commBlockedHandles.length : 0);
  var blurredCount      = (typeof _commBlurredPosts    !== 'undefined' ? _commBlurredPosts.length    : 0);
  var blockedTotal = blockedUsersCount + blurredCount;

  var html = '';

  /* Greeting */
  html += '<div style="padding:16px 16px 8px">';
  html += '<div style="font:var(--fw-bold) 22px/1.2 var(--font);color:var(--text-primary)">Topluluk Merkezi</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px">Beğendiğin, kaydettiğin ve yorum yaptığın tüm içerikleri tek yerde yönet.</div>';
  html += '</div>';

  /* Ana Tile'lar 2x2 grid */
  html += '<div style="padding:10px 16px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px">';

  html += _commMenuTile({
    key: 'liked',
    title: 'Beğendiklerim',
    desc: 'Kalp bıraktığın gönderiler',
    icon: 'solar:heart-bold',
    color: '#EF4444',
    count: likedCount
  });

  html += _commMenuTile({
    key: 'saved',
    title: 'Kaydedilenler',
    desc: 'Daha sonra bakmak için',
    icon: 'solar:bookmark-bold',
    color: '#F59E0B',
    count: savedCount
  });

  html += _commMenuTile({
    key: 'comments',
    title: 'Yorumlarım',
    desc: 'Tüm yorumların kronolojik',
    icon: 'solar:chat-round-dots-bold',
    color: '#8B5CF6',
    count: commentsCount
  });

  html += _commMenuTile({
    key: 'activity',
    title: 'Aktivitem',
    desc: 'Son etkileşim özeti',
    icon: 'solar:pulse-bold',
    color: '#22C55E',
    count: null,
    soon: true
  });

  html += '</div>';

  /* Engellediklerim — ayrı, farklı görsel vurgu */
  html += '<div style="padding:18px 16px 8px">';
  html += '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:0 4px 10px">Güvenlik ve Denetim</div>';
  html += '<div onclick="_openCommMenuItem(\'blocked\')" style="padding:16px;border-radius:var(--r-xl);border:1.5px dashed #EF444450;background:#EF444408;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .2s" onmouseover="this.style.background=\'#EF444412\'" onmouseout="this.style.background=\'#EF444408\'">';
  html += '<div style="width:44px;height:44px;border-radius:12px;background:#EF444420;display:flex;align-items:center;justify-content:center;flex-shrink:0">';
  html += '<iconify-icon icon="solar:shield-cross-bold" style="font-size:22px;color:#EF4444"></iconify-icon>';
  html += '</div>';
  html += '<div style="flex:1;min-width:0">';
  html += '<div style="display:flex;align-items:center;gap:6px"><span style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Engellediklerim</span>';
  if (blockedTotal > 0) {
    html += '<span style="font:var(--fw-bold) 10px/1 var(--font);color:#fff;background:#EF4444;padding:3px 8px;border-radius:var(--r-full)">' + blockedTotal + '</span>';
  }
  html += '</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + (blockedTotal > 0 ? (blockedUsersCount + ' kişi · ' + blurredCount + ' içerik') : 'Henüz engellediğin kimse yok') + '</div>';
  html += '</div>';
  html += '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-muted);flex-shrink:0"></iconify-icon>';
  html += '</div>';
  html += '</div>';

  html += '<div style="height:24px"></div>';

  container.innerHTML = html;
}

function _commMenuTile(o) {
  var countHtml = '';
  if (typeof o.count === 'number') {
    countHtml = '<span style="font:var(--fw-bold) 10px/1 var(--font);color:' + o.color + ';background:' + o.color + '18;padding:3px 8px;border-radius:var(--r-full);margin-left:auto">' + o.count + '</span>';
  } else if (o.soon) {
    countHtml = '<span style="font:var(--fw-semibold) 9px/1 var(--font);color:var(--text-muted);background:var(--bg-btn);padding:3px 7px;border-radius:var(--r-full);margin-left:auto;letter-spacing:.3px">YAKINDA</span>';
  }
  var disabled = o.soon ? 'opacity:.65;cursor:default' : 'cursor:pointer';
  var onclick = o.soon ? '' : 'onclick="_openCommMenuItem(\'' + o.key + '\')"';
  return '' +
    '<div class="g-card" ' + onclick + ' style="padding:14px;border-radius:var(--r-xl);display:flex;flex-direction:column;gap:10px;border:1px solid var(--border-subtle);min-height:118px;' + disabled + '">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<div style="width:38px;height:38px;border-radius:10px;background:' + o.color + '15;display:flex;align-items:center;justify-content:center">' +
          '<iconify-icon icon="' + o.icon + '" style="font-size:20px;color:' + o.color + '"></iconify-icon>' +
        '</div>' +
        countHtml +
      '</div>' +
      '<div style="margin-top:auto">' +
        '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + o.title + '</div>' +
        '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + o.desc + '</div>' +
      '</div>' +
    '</div>';
}

/* ═══ SUB-PAGE OPENER ═══ */
function _openCommMenuItem(key) {
  var container = document.getElementById('commMenuContent');
  var topbarName = document.querySelector('#commMenuContainer .prof-topbar-name');
  if (!container) return;

  /* Replace topbar back button to go back to home */
  var topbar = document.querySelector('#commMenuContainer .prof-topbar');
  if (topbar) {
    topbar.innerHTML =
      '<div class="btn-icon" onclick="_renderCommMenuHomeWithTopbar()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
      + '<span class="prof-topbar-name">' + _commMenuTitleFor(key) + '</span>'
      + '<div style="width:32px"></div>';
  }

  if (key === 'liked')         _renderCommMenuLiked(container);
  else if (key === 'saved')    _renderCommMenuSaved(container);
  else if (key === 'comments') _renderCommMenuComments(container);
  else if (key === 'blocked')  _renderCommMenuBlocked(container);
}

function _renderCommMenuHomeWithTopbar() {
  var topbar = document.querySelector('#commMenuContainer .prof-topbar');
  if (topbar) {
    topbar.innerHTML =
      '<div class="btn-icon" onclick="closeCommMenu()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
      + '<span class="prof-topbar-name">Menü</span>'
      + '<div style="width:32px"></div>';
  }
  _renderCommMenuHome();
}

function _commMenuTitleFor(key) {
  return ({
    liked: 'Beğendiklerim',
    saved: 'Kaydedilenler',
    comments: 'Yorumlarım',
    blocked: 'Engellediklerim'
  })[key] || 'Menü';
}

/* ═══ ENGELLEDİKLERİM — Kişiler / İçerikler sekmeli sayfa ═══ */
function _renderCommMenuBlocked(container) {
  var html = '';

  /* Sub tabs */
  var blockedUsers = (typeof _commBlockedHandles !== 'undefined') ? _commBlockedHandles : [];
  var blurredIds   = (typeof _commBlurredPosts    !== 'undefined') ? _commBlurredPosts    : [];

  html += '<div style="padding:12px 16px 0">';
  html += '<div style="display:flex;background:var(--bg-btn);border-radius:var(--r-full);padding:4px;gap:4px">';
  var tabs = [
    { id: 'users',   label: 'Kişiler',    icon: 'solar:users-group-two-rounded-bold', count: blockedUsers.length },
    { id: 'content', label: 'İçerikler',  icon: 'solar:eye-closed-bold',              count: blurredIds.length }
  ];
  tabs.forEach(function(t) {
    var active = _commBlockedSubTab === t.id;
    html += '<div onclick="_setCommBlockedSubTab(\'' + t.id + '\')" style="flex:1;padding:11px 10px;border-radius:var(--r-full);background:' + (active ? '#fff' : 'transparent') + ';box-shadow:' + (active ? '0 2px 8px rgba(0,0,0,.08)' : 'none') + ';cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s">';
    html += '<iconify-icon icon="' + t.icon + '" style="font-size:15px;color:' + (active ? 'var(--text-primary)' : 'var(--text-muted)') + '"></iconify-icon>';
    html += '<span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:' + (active ? 'var(--text-primary)' : 'var(--text-muted)') + '">' + t.label + '</span>';
    if (t.count > 0) {
      html += '<span style="font:var(--fw-bold) 9px/1 var(--font);color:#fff;background:' + (active ? '#EF4444' : 'var(--text-muted)') + ';padding:2px 6px;border-radius:var(--r-full)">' + t.count + '</span>';
    }
    html += '</div>';
  });
  html += '</div>';
  html += '</div>';

  /* Info banner */
  html += '<div style="padding:12px 16px 0">';
  html += '<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 12px;background:#3B82F608;border:1px solid #3B82F620;border-radius:var(--r-lg)">';
  html += '<iconify-icon icon="solar:info-circle-bold" style="font-size:16px;color:#3B82F6;flex-shrink:0;margin-top:1px"></iconify-icon>';
  if (_commBlockedSubTab === 'users') {
    html += '<div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)">Engeli kaldırdığınızda bu kişinin gönderileri topluluk akışında tekrar görünür hale gelir.</div>';
  } else {
    html += '<div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)">Gizlemekten vazgeçtiğinizde bu içerik bulanıklaştırılmadan tekrar görüntülenir.</div>';
  }
  html += '</div>';
  html += '</div>';

  /* List */
  html += '<div id="commBlockedList">';
  if (_commBlockedSubTab === 'users') html += _renderBlockedUsersList(blockedUsers);
  else html += _renderBlurredContentList(blurredIds);
  html += '</div>';

  container.innerHTML = html;
}

function _setCommBlockedSubTab(tab) {
  _commBlockedSubTab = tab;
  var container = document.getElementById('commMenuContent');
  if (container) _renderCommMenuBlocked(container);
}

function _renderBlockedUsersList(handles) {
  if (!handles.length) {
    return _commEmptyState('solar:users-group-rounded-linear', 'Henüz engellediğiniz kimse yok', 'Bir gönderiyi şikayet ettiğinizde kullanıcıyı engelleme seçeneği sunulur.');
  }
  var html = '<div style="padding:14px 16px 24px;display:flex;flex-direction:column;gap:8px">';
  handles.forEach(function(handle) {
    var sample = (typeof COMMUNITY_FEED !== 'undefined') ? COMMUNITY_FEED.find(function(p) { return p.user && p.user.handle === handle; }) : null;
    var name = sample && sample.user ? sample.user.name : handle.replace(/^@/, '');
    var avatar = sample && sample.user ? sample.user.avatar : null;
    html += '<div class="g-card" style="padding:12px 14px;border-radius:var(--r-lg);display:flex;align-items:center;gap:12px;border:1px solid var(--border-subtle)">';
    if (avatar) {
      html += '<img src="' + avatar + '" alt="" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;filter:grayscale(.4)">';
    } else {
      html += '<div style="width:42px;height:42px;border-radius:50%;background:var(--bg-btn);display:flex;align-items:center;justify-content:center;flex-shrink:0;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-muted)">' + _cmEsc(name.charAt(0).toUpperCase()) + '</div>';
    }
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _cmEsc(name) + '</div>';
    html += '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:3px">' + _cmEsc(handle) + '</div>';
    html += '</div>';
    html += '<button onclick="_unblockUser(\'' + _cmEsc(handle) + '\')" style="padding:7px 14px;border:1px solid var(--primary);background:transparent;color:var(--primary);font:var(--fw-semibold) 11px/1 var(--font);border-radius:var(--r-full);cursor:pointer;flex-shrink:0;transition:all .15s" onmouseover="this.style.background=\'var(--primary)\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--primary)\'">Engeli Kaldır</button>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _renderBlurredContentList(ids) {
  if (!ids.length) {
    return _commEmptyState('solar:eye-closed-linear', 'Henüz gizlediğiniz içerik yok', 'Bir gönderiyi şikayet ederek blurladığınızda burada görünür.');
  }
  var html = '<div style="padding:14px 16px 24px;display:flex;flex-direction:column;gap:10px">';
  ids.forEach(function(pid) {
    var post = (typeof COMMUNITY_FEED !== 'undefined') ? COMMUNITY_FEED.find(function(x) { return x.id === pid; }) : null;
    if (!post) return;
    html += '<div class="g-card" style="padding:12px;border-radius:var(--r-lg);border:1px solid var(--border-subtle);display:flex;gap:12px">';
    if (post.img) {
      html += '<img src="' + post.img + '" alt="" style="width:56px;height:56px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0;filter:blur(6px);opacity:.7">';
    } else {
      html += '<div style="width:56px;height:56px;border-radius:var(--r-lg);background:var(--bg-btn);display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:eye-closed-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>';
    }
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)">' + _cmEsc(post.user.name) + '</div>';
    html += '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + _cmEsc((post.text || '').slice(0, 120)) + '</div>';
    html += '<div style="display:flex;gap:8px;margin-top:8px">';
    html += '<button onclick="_unblurPost(' + pid + ')" style="padding:6px 12px;border:1px solid var(--primary);background:transparent;color:var(--primary);font:var(--fw-semibold) 11px/1 var(--font);border-radius:var(--r-full);cursor:pointer">Gizlemeyi Kaldır</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function _commEmptyState(icon, title, desc) {
  return '<div style="text-align:center;padding:48px 24px">'
    + '<iconify-icon icon="' + icon + '" style="font-size:48px;color:var(--text-muted);opacity:.5;display:block;margin-bottom:12px"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">' + title + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-muted);margin-top:6px;max-width:260px;margin-left:auto;margin-right:auto">' + desc + '</div>'
    + '</div>';
}

function _unblockUser(handle) {
  if (typeof _commBlockedHandles === 'undefined') return;
  var idx = _commBlockedHandles.indexOf(handle);
  if (idx !== -1) _commBlockedHandles.splice(idx, 1);
  /* Refresh menu */
  var container = document.getElementById('commMenuContent');
  if (container) _renderCommMenuBlocked(container);
  /* Refresh community feed so posts become visible again */
  if (typeof renderCommFeed === 'function') renderCommFeed();
  _commMenuToast(handle + ' engellemesi kaldırıldı');
}

function _unblurPost(pid) {
  if (typeof _commBlurredPosts === 'undefined') return;
  var idx = _commBlurredPosts.indexOf(pid);
  if (idx !== -1) _commBlurredPosts.splice(idx, 1);
  var container = document.getElementById('commMenuContent');
  if (container) _renderCommMenuBlocked(container);
  if (typeof renderCommFeed === 'function') renderCommFeed();
  _commMenuToast('İçerik gizlemesi kaldırıldı');
}

function _cmEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _commMenuToast(msg) {
  if (typeof showToast === 'function') { showToast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;padding:10px 20px;border-radius:20px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:9999';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

/* Window exports for new features */
window.openCommMenu = openCommMenu;
window.closeCommMenu = closeCommMenu;
window._openCommMenuItem = _openCommMenuItem;
window._renderCommMenuHomeWithTopbar = _renderCommMenuHomeWithTopbar;
window._setCommBlockedSubTab = _setCommBlockedSubTab;
window._unblockUser = _unblockUser;
window._unblurPost = _unblurPost;

/* ── helper: find any liked/saved item from both feeds + academy ── */
function _findAnyPost(id) {
  var p = COMMUNITY_FEED.find(function(x) { return x.id === id; });
  if (p) return p;
  if (typeof ACADEMY_VIDEOS !== 'undefined') {
    var av = ACADEMY_VIDEOS.find(function(x) { return x.id === id; });
    if (av) return { id: av.id, user: av.user, text: av.title, img: av.thumbnail, likes: av.likes, liked: av.liked, saved: av.saved, _isAcademy: true };
  }
  return null;
}

function _renderCommMenuLiked(container) {
  var ids = USER_PROFILE.likedPosts || [];
  if (!ids.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)"><iconify-icon icon="solar:like-linear" style="font-size:40px;display:block;margin-bottom:10px;opacity:.4"></iconify-icon><div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Henüz beğendiğiniz gönderi yok</div></div>';
    return;
  }
  var html = '';
  for (var k = ids.length - 1; k >= 0; k--) {
    var post = _findAnyPost(ids[k]);
    if (!post) continue;
    var badge = post._isAcademy ? '<span style="display:inline-flex;align-items:center;gap:2px;background:var(--primary-soft);color:var(--primary);padding:2px 6px;border-radius:var(--r-full);font:var(--fw-medium) 9px/1 var(--font);margin-left:6px"><iconify-icon icon="solar:square-academic-cap-bold" style="font-size:10px"></iconify-icon>Akademi</span>' : '';
    html += '<div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border-subtle)">';
    if (post.img) html += '<img src="' + post.img + '" alt="" style="width:56px;height:56px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + post.user.name + badge + '</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + post.text + '</div>';
    html += '<div style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-top:4px;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:like-bold" style="font-size:12px;color:var(--primary)"></iconify-icon>' + formatCount(post.likes) + ' beğeni</div>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

function _renderCommMenuSaved(container) {
  var ids = USER_PROFILE.savedPosts || [];
  if (!ids.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)"><iconify-icon icon="solar:bookmark-linear" style="font-size:40px;display:block;margin-bottom:10px;opacity:.4"></iconify-icon><div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Henüz kaydettiğiniz gönderi yok</div></div>';
    return;
  }
  var html = '';
  for (var k = ids.length - 1; k >= 0; k--) {
    var post = _findAnyPost(ids[k]);
    if (!post) continue;
    var badge = post._isAcademy ? '<span style="display:inline-flex;align-items:center;gap:2px;background:var(--primary-soft);color:var(--primary);padding:2px 6px;border-radius:var(--r-full);font:var(--fw-medium) 9px/1 var(--font);margin-left:6px"><iconify-icon icon="solar:square-academic-cap-bold" style="font-size:10px"></iconify-icon>Akademi</span>' : '';
    var toggleFn = post._isAcademy ? 'toggleAcademySave(\'' + post.id + '\')' : 'toggleSave(' + post.id + ')';
    html += '<div style="display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border-subtle)">';
    if (post.img) html += '<img src="' + post.img + '" alt="" style="width:56px;height:56px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + post.user.name + badge + '</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + post.text + '</div>';
    html += '</div>';
    html += '<div onclick="' + toggleFn + ';_renderCommMenuContent();" style="align-self:center;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:bookmark-bold" style="font-size:18px;color:var(--primary)"></iconify-icon></div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function _renderCommMenuComments(container) {
  var comments = USER_PROFILE.userComments || [];
  if (!comments.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)"><iconify-icon icon="solar:chat-round-dots-linear" style="font-size:40px;display:block;margin-bottom:10px;opacity:.4"></iconify-icon><div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Henüz yorum yapmadınız</div></div>';
    return;
  }
  var html = '';
  for (var k = comments.length - 1; k >= 0; k--) {
    var c = comments[k];
    var post = _findAnyPost(c.postId);
    html += '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle)">';
    if (post) {
      html += '<div style="font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-bottom:6px;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:arrow-right-up-linear" style="font-size:12px"></iconify-icon>' + post.user.name + '\'in gönderisine</div>';
    }
    html += '<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary)">' + c.text + '</div>';
    html += '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:6px">' + c.date + '</div>';
    html += '</div>';
  }
  container.innerHTML = html;
}

function formatCount(n){
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(n%1000===0?0:1)+'K';
  return String(n);
}

function renderCommunity(){
  renderCommStories();
  renderCommFeed();
}

function renderCommStories(){
  const container=document.getElementById('commStoriesContainer');
  if(!container||typeof STORIES==='undefined')return;
  container.innerHTML=`<div class="stories-scroll" style="padding:12px var(--app-px) 0">${STORIES.map((s,i)=>`
    <div class="story-item" onclick="viewStory(${i})">
      <div class="story-ring${s.hasNew?' story-ring-new':''}${s.isOwn?' story-ring-own':''}">
        <img src="${s.avatar}" alt="${s.name}">
        ${s.isOwn?'<div class="story-add-btn"><iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon></div>':''}
      </div>
      <span class="story-name">${s.name}</span>
    </div>
  `).join('')}</div>`;
}

function renderCommFeed(){
  const feed=document.getElementById('communityFeed');
  if(!feed)return;

  /* ── Akademi: ayrı render ── */
  if(commActiveFilter === 'academy'){
    _renderAcademyFeed(feed);
    return;
  }

  if(typeof COMMUNITY_FEED==='undefined')return;

  let posts = COMMUNITY_FEED;
  if(commActiveFilter!=='all'){
    posts = posts.filter(p=>p.filter===commActiveFilter);
  }
  /* Senaryo A: şikayet edilen kullanıcıların içerikleri tamamen gizlenir */
  if (typeof _commBlockedHandles !== 'undefined' && _commBlockedHandles.length) {
    posts = posts.filter(function(p) { return _commBlockedHandles.indexOf(p.user.handle) === -1; });
  }

  if(!posts.length){
    feed.innerHTML='<div style="text-align:center;padding:40px var(--app-px)"><iconify-icon icon="solar:ghost-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon><div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:12px">Bu filtrede henüz gönderi yok</div></div>';
    return;
  }

  feed.innerHTML=posts.map(post=>{
    const verified = post.user.verified ? '<iconify-icon icon="solar:verified-check-bold" class="feed-verified"></iconify-icon>' : '';
    const chefBadge = post.user.isChef ? '<span class="feed-chef-badge"><iconify-icon icon="solar:chef-hat-bold" style="font-size:10px"></iconify-icon> Şef</span>' : '';

    let typeBadge = '';
    if(post.postType==='ask'){
      const statusCls = post.askStatus==='solved'?'solved':'open';
      const statusIcon = post.askStatus==='solved'?'solar:check-circle-bold':'solar:question-circle-bold';
      const statusText = post.askStatus==='solved'?'Çözüldü':'Yardım Bekleniyor';
      typeBadge = '<div class="feed-ask-badge '+statusCls+'"><iconify-icon icon="'+statusIcon+'"></iconify-icon> '+statusText+'</div>';
    } else if(post.postType==='chef_tip'){
      typeBadge = '<div class="feed-chef-tip-badge"><iconify-icon icon="solar:lightbulb-bolt-bold" style="font-size:12px"></iconify-icon> Şef İpucu</div>';
    }

    let recipeLink = '';
    if(post.postType==='recipe' && post.recipe){
      const r = post.recipe;
      const img = menuItems[r.menuIdx] ? menuItems[r.menuIdx].img : '';
      recipeLink = `<div class="feed-recipe-link" onclick="event.stopPropagation();showDetail(${r.menuIdx})">
        <img src="${img}" alt="${r.name}">
        <div class="feed-recipe-link-info">
          <div class="feed-recipe-link-name">${r.name}</div>
          <div class="feed-recipe-link-meta">
            <span class="feed-recipe-link-tag"><iconify-icon icon="solar:clock-circle-linear"></iconify-icon>${r.cookTime}</span>
            <span class="feed-recipe-link-tag"><iconify-icon icon="solar:fire-linear"></iconify-icon>${r.kalori} kcal</span>
            <span class="feed-recipe-link-tag"><iconify-icon icon="solar:chef-hat-linear"></iconify-icon>${r.difficulty}</span>
          </div>
        </div>
        <iconify-icon icon="solar:arrow-right-linear" class="feed-recipe-link-arrow" style="font-size:16px"></iconify-icon>
      </div>`;
    }

    let askReply = '';
    if(post.postType==='ask'){
      askReply = `<div class="feed-ask-reply-bar">
        <iconify-icon icon="solar:chat-round-dots-bold"></iconify-icon>
        <span>Yardım Et</span>
        <span class="feed-ask-reply-count">${post.askReplies||0} yanıt</span>
      </div>`;
    }

    return `<div class="feed-post">
      <div class="feed-header">
        <img class="feed-avatar" src="${post.user.avatar}" alt="${post.user.name}">
        <div class="feed-user-info">
          <span class="feed-username">${post.user.name}${verified}${chefBadge}</span>
          <span class="feed-handle">${post.user.handle} · ${post.time}</span>
        </div>
        <div class="btn-icon feed-more" onclick="openPostMenu(event, ${post.id})"><iconify-icon icon="solar:menu-dots-bold" style="font-size:18px"></iconify-icon></div>
      </div>
      ${typeBadge}
      <div class="feed-text">${post.text.replace(/\n/g,'<br>')}</div>
      ${post.img?`<div class="feed-img"><img src="${post.img}" alt=""></div>`:''}
      ${recipeLink}
      ${askReply}
      <div class="feed-tags">${post.tags.map(t=>`<span class="feed-tag">#${t}</span>`).join('')}</div>
      <div class="feed-actions">
        <div class="feed-action${post.liked?' feed-action-liked':''}" onclick="toggleLike(${post.id})">
          <iconify-icon icon="${post.liked?'solar:like-bold':'solar:like-linear'}" class="feed-action-icon"></iconify-icon>
          <span>${formatCount(post.likes)}</span>
        </div>
        <div class="feed-action">
          <iconify-icon icon="solar:chat-round-dots-linear" class="feed-action-icon"></iconify-icon>
          <span>${formatCount(post.comments)}</span>
        </div>
        <div class="feed-action">
          <iconify-icon icon="solar:share-linear" class="feed-action-icon"></iconify-icon>
          <span>${formatCount(post.shares)}</span>
        </div>
        <div class="feed-action${post.saved?' feed-action-saved':''}" onclick="toggleSave(${post.id})">
          <iconify-icon icon="${post.saved?'solar:bookmark-bold':'solar:bookmark-linear'}" class="feed-action-icon"></iconify-icon>
        </div>
      </div>
      ${(typeof _commBlurredPosts !== 'undefined' && _commBlurredPosts.indexOf(post.id) !== -1) ? `
      <div class="post-blur-overlay" data-post-id="${post.id}">
        <div class="post-blur-card">
          <iconify-icon icon="solar:eye-closed-bold" style="font-size:32px;color:#fff"></iconify-icon>
          <div class="post-blur-title">Bu gönderi şikayet edildi</div>
          <div class="post-blur-desc">İçerik sizin isteğinizle gizlendi. Görüntülemek için butona basın.</div>
          <div class="post-blur-btn" onclick="_commUnblurPost(${post.id})">
            <iconify-icon icon="solar:eye-bold" style="font-size:16px"></iconify-icon>
            <span>Görüntüle</span>
          </div>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
}

function toggleLike(postId){
  const post=COMMUNITY_FEED.find(p=>p.id===postId);
  if(!post)return;
  post.liked=!post.liked;
  post.likes+=post.liked?1:-1;
  var lp=USER_PROFILE.likedPosts;
  var idx=lp.indexOf(postId);
  if(post.liked && idx===-1) lp.push(postId);
  else if(!post.liked && idx!==-1) lp.splice(idx,1);
  renderCommFeed();
}

function toggleSave(postId){
  const post=COMMUNITY_FEED.find(p=>p.id===postId);
  if(!post)return;
  post.saved=!post.saved;
  if(!USER_PROFILE.savedPosts) USER_PROFILE.savedPosts=[];
  var sp=USER_PROFILE.savedPosts;
  var idx=sp.indexOf(postId);
  if(post.saved && idx===-1) sp.push(postId);
  else if(!post.saved && idx!==-1) sp.splice(idx,1);
  renderCommFeed();
}

function setCommFilter(filter){
  commActiveFilter = filter;
  document.querySelectorAll('.comm-filter-tab').forEach(t=>{
    t.classList.toggle('active', t.dataset.filter===filter);
  });
  /* Stories & FAB: gizle academy modunda */
  var stories = document.getElementById('commStoriesContainer');
  var fab = document.querySelector('.comm-fab');
  if (stories) stories.style.display = filter === 'academy' ? 'none' : '';
  if (fab) fab.style.display = filter === 'academy' ? 'none' : '';
  renderCommFeed();
}


/* ═══ Topluluk Arama ═══ */

let _commSearchQuery = '';

function openCommSearch() {
  var existing = document.getElementById('commSearchOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'commSearchOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.display = 'flex';

  overlay.innerHTML = '<div class="prof-container">'
    + '<div class="prof-topbar">'
    + '<div class="btn-icon" onclick="closeCommSearch()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    + '<span class="prof-topbar-name">Ara</span>'
    + '<div style="width:32px"></div>'
    + '</div>'
    + '<div style="padding:12px 16px">'
    + '<div style="display:flex;align-items:center;gap:8px;background:var(--glass-card);border-radius:var(--r-full);padding:0 14px;border:1px solid var(--border-subtle)">'
    + '<iconify-icon icon="solar:magnifer-linear" style="font-size:18px;color:var(--text-muted);flex-shrink:0"></iconify-icon>'
    + '<input id="commSearchInput" type="text" placeholder="Gönderi, kişi veya etiket ara..." oninput="_commSearchLive(this.value)" style="flex:1;border:none;background:transparent;padding:10px 0;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">'
    + '<div id="commSearchClear" onclick="_commClearSearch()" style="display:none;cursor:pointer;padding:4px"><iconify-icon icon="solar:close-circle-bold" style="font-size:16px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>'
    + '</div>'
    + '<div id="commSearchResults" style="flex:1;overflow-y:auto;padding:0 16px"></div>'
    + '</div>';

  document.getElementById('phone').appendChild(overlay);
  setTimeout(function() {
    var inp = document.getElementById('commSearchInput');
    if (inp) inp.focus();
  }, 100);
  _commRenderSearchDefault();
}

function closeCommSearch() {
  var el = document.getElementById('commSearchOverlay');
  if (el) el.remove();
  _commSearchQuery = '';
}

function _commClearSearch() {
  var inp = document.getElementById('commSearchInput');
  if (inp) { inp.value = ''; inp.focus(); }
  _commSearchQuery = '';
  _commRenderSearchDefault();
  var cl = document.getElementById('commSearchClear');
  if (cl) cl.style.display = 'none';
}

function _commRenderSearchDefault() {
  var container = document.getElementById('commSearchResults');
  if (!container) return;

  /* Popüler etiketler */
  var popularTags = ['burger', 'pizza', 'kebap', 'tatlı', 'kahvaltı', 'sağlıklı', 'teknik', 'tarif'];
  var h = '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin:8px 0 10px">Popüler Etiketler</div>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px">';
  popularTags.forEach(function(t) {
    h += '<div onclick="_commSearchByTag(\'' + t + '\')" style="display:flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-full);background:var(--primary-soft);color:var(--primary);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer">'
      + '<iconify-icon icon="solar:hashtag-linear" style="font-size:12px"></iconify-icon>#' + t + '</div>';
  });
  h += '</div>';

  /* Popüler şefler */
  if (typeof TOP_CHEFS !== 'undefined') {
    h += '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Popüler Şefler</div>';
    TOP_CHEFS.forEach(function(c) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle)">';
      h += '<img src="' + c.avatar + '" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover">';
      h += '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);display:flex;align-items:center;gap:4px">' + c.name + ' <iconify-icon icon="solar:verified-check-bold" style="font-size:12px;color:var(--primary)"></iconify-icon></div>';
      h += '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:2px">' + c.specialty + ' · ' + c.followers + ' takipçi</div></div></div>';
    });
  }

  container.innerHTML = h;
}

function _commSearchByTag(tag) {
  var inp = document.getElementById('commSearchInput');
  if (inp) inp.value = '#' + tag;
  _commSearchLive('#' + tag);
}

function _commSearchLive(query) {
  _commSearchQuery = query.toLowerCase().trim();
  var cl = document.getElementById('commSearchClear');
  if (cl) cl.style.display = _commSearchQuery ? 'block' : 'none';

  if (!_commSearchQuery) {
    _commRenderSearchDefault();
    return;
  }

  var container = document.getElementById('commSearchResults');
  if (!container) return;

  var q = _commSearchQuery.replace(/^#/, '');
  var results = [];

  /* Search community feed */
  if (typeof COMMUNITY_FEED !== 'undefined') {
    COMMUNITY_FEED.forEach(function(p) {
      var match = p.text.toLowerCase().indexOf(q) !== -1
        || p.user.name.toLowerCase().indexOf(q) !== -1
        || p.user.handle.toLowerCase().indexOf(q) !== -1
        || p.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
      if (match) results.push({ type: 'post', data: p });
    });
  }

  /* Search academy */
  if (typeof ACADEMY_VIDEOS !== 'undefined') {
    ACADEMY_VIDEOS.forEach(function(v) {
      var match = v.title.toLowerCase().indexOf(q) !== -1
        || v.description.toLowerCase().indexOf(q) !== -1
        || v.user.name.toLowerCase().indexOf(q) !== -1
        || v.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
      if (match) results.push({ type: 'academy', data: v });
    });
  }

  if (!results.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-muted)">'
      + '<iconify-icon icon="solar:magnifer-linear" style="font-size:36px;display:block;margin-bottom:8px;opacity:.4"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font)">"' + _commSearchQuery + '" için sonuç bulunamadı</div></div>';
    return;
  }

  var h = '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin:8px 0 10px">' + results.length + ' sonuç</div>';

  results.forEach(function(r) {
    if (r.type === 'post') {
      var p = r.data;
      h += '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">';
      if (p.img) h += '<img src="' + p.img + '" alt="" style="width:48px;height:48px;border-radius:var(--r-md);object-fit:cover;flex-shrink:0">';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)">' + p.user.name + '</div>';
      h += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + p.text + '</div>';
      h += '</div></div>';
    } else {
      var v = r.data;
      h += '<div onclick="closeCommSearch();setCommFilter(\'academy\');openAcademyPlayer(\'' + v.id + '\')" style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle);cursor:pointer">';
      h += '<div style="position:relative;width:72px;height:42px;border-radius:var(--r-sm);overflow:hidden;flex-shrink:0;background:#000"><img src="' + v.thumbnail + '" alt="" style="width:100%;height:100%;object-fit:cover">';
      h += '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:play-bold" style="font-size:14px;color:#fff;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))"></iconify-icon></div></div>';
      h += '<div style="flex:1;min-width:0">';
      h += '<div style="display:flex;align-items:center;gap:4px"><span style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)">' + v.user.name + '</span><span style="display:inline-flex;align-items:center;gap:2px;background:var(--primary-soft);color:var(--primary);padding:1px 5px;border-radius:var(--r-full);font:var(--fw-medium) 9px/1 var(--font)"><iconify-icon icon="solar:square-academic-cap-bold" style="font-size:9px"></iconify-icon>Akademi</span></div>';
      h += '<div style="font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary);margin-top:2px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">' + v.title + '</div>';
      h += '</div></div>';
    }
  });

  container.innerHTML = h;
}


/* ═══════════════════════════════════════════════════════
   AKADEMİ — Profesyonel Şef Video Eğitim Alanı
   ═══════════════════════════════════════════════════════ */

let _acadCategoryFilter = 'all'; // all | tarif | teknik | püf

function _renderAcademyFeed(feed) {
  if (typeof ACADEMY_VIDEOS === 'undefined' || !ACADEMY_VIDEOS.length) {
    feed.innerHTML = '<div style="text-align:center;padding:40px var(--app-px)"><iconify-icon icon="solar:square-academic-cap-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon><div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:12px">Akademi içerikleri yakında</div></div>';
    return;
  }

  var vids = ACADEMY_VIDEOS;
  if (_acadCategoryFilter !== 'all') {
    vids = vids.filter(function(v) { return v.category === _acadCategoryFilter; });
  }

  /* ── header banner ── */
  var html = '<div class="acad-header">'
    + '<div class="acad-header-icon"><iconify-icon icon="solar:square-academic-cap-bold" style="font-size:28px;color:var(--primary)"></iconify-icon></div>'
    + '<div class="acad-header-text">'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">Akademi</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary);margin-top:2px">Onaylı şeflerden profesyonel video eğitimler</div>'
    + '</div></div>';

  /* ── category pills ── */
  var cats = [
    { id: 'all', label: 'Tümü' },
    { id: 'tarif', label: 'Tarifler', icon: 'solar:chef-hat-linear' },
    { id: 'teknik', label: 'Teknikler', icon: 'solar:settings-linear' },
    { id: 'püf', label: 'Püf Noktaları', icon: 'solar:lightbulb-bolt-linear' },
  ];
  html += '<div class="acad-cats">';
  cats.forEach(function(c) {
    var active = _acadCategoryFilter === c.id;
    var iconH = c.icon ? '<iconify-icon icon="' + c.icon + '" style="font-size:13px"></iconify-icon>' : '';
    html += '<div class="acad-cat-pill' + (active ? ' active' : '') + '" onclick="_setAcadCategory(\'' + c.id + '\')">' + iconH + c.label + '</div>';
  });
  html += '</div>';

  /* ── video cards ── */
  if (!vids.length) {
    html += '<div style="text-align:center;padding:40px 16px;color:var(--text-muted)"><div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font)">Bu kategoride henüz video yok</div></div>';
  } else {
    html += '<div class="acad-grid">';
    vids.forEach(function(v) {
      html += _renderAcademyCard(v);
    });
    html += '</div>';
  }

  feed.innerHTML = html;
}

function _renderAcademyCard(v) {
  var catLabel = v.category === 'tarif' ? 'Tarif' : v.category === 'teknik' ? 'Teknik' : 'Püf Noktası';
  var catIcon = v.category === 'tarif' ? 'solar:chef-hat-bold' : v.category === 'teknik' ? 'solar:settings-bold' : 'solar:lightbulb-bolt-bold';

  return '<div class="acad-card" onclick="openAcademyPlayer(\'' + v.id + '\')">'
    /* thumbnail container */
    + '<div class="acad-thumb">'
    + '<img src="' + v.thumbnail + '" alt="' + v.title + '">'
    + '<div class="acad-thumb-overlay">'
    + '<div class="acad-play-btn"><iconify-icon icon="solar:play-bold" style="font-size:24px;color:#fff"></iconify-icon></div>'
    + '</div>'
    + '<div class="acad-duration"><iconify-icon icon="solar:videocamera-record-bold" style="font-size:11px"></iconify-icon>' + v.duration + '</div>'
    + '<div class="acad-cat-badge"><iconify-icon icon="' + catIcon + '" style="font-size:10px"></iconify-icon>' + catLabel + '</div>'
    + '<div class="acad-aspect-badge">' + v.aspect + '</div>'
    + '</div>'
    /* info */
    + '<div class="acad-card-body">'
    + '<div class="acad-card-top">'
    + '<img src="' + v.user.avatar + '" alt="" class="acad-card-avatar">'
    + '<div class="acad-card-user">'
    + '<div class="acad-card-name">' + v.user.name + ' <iconify-icon icon="solar:verified-check-bold" style="font-size:12px;color:var(--primary)"></iconify-icon></div>'
    + '<div class="acad-card-handle">' + v.user.handle + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="acad-card-title">' + v.title + '</div>'
    + '<div class="acad-card-meta">'
    + '<span><iconify-icon icon="solar:eye-linear" style="font-size:13px"></iconify-icon>' + formatCount(v.views) + ' izlenme</span>'
    + '<span><iconify-icon icon="solar:like-linear" style="font-size:13px"></iconify-icon>' + formatCount(v.likes) + '</span>'
    + '<span>' + v.time + '</span>'
    + '</div>'
    + '<div class="acad-card-tags">' + v.tags.map(function(t) { return '<span>#' + t + '</span>'; }).join('') + '</div>'
    + '</div>'
    + '</div>';
}

function _setAcadCategory(cat) {
  _acadCategoryFilter = cat;
  renderCommFeed();
}


/* ═══ Akademi Fullscreen Video Player ═══ */

let _acadCurrentVideo = null;
let _acadPlaying = false;

function openAcademyPlayer(videoId) {
  var v = ACADEMY_VIDEOS.find(function(x) { return x.id === videoId; });
  if (!v) return;
  _acadCurrentVideo = v;
  _acadPlaying = false;

  var existing = document.getElementById('acadPlayerOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'acadPlayerOverlay';
  overlay.className = 'acad-player-overlay';
  overlay.innerHTML = _buildPlayerHTML(v);

  document.getElementById('phone').appendChild(overlay);

  /* animate in */
  requestAnimationFrame(function() {
    overlay.classList.add('open');
  });
}

function closeAcademyPlayer() {
  var overlay = document.getElementById('acadPlayerOverlay');
  if (!overlay) return;
  /* pause any playing video */
  var vid = overlay.querySelector('video');
  if (vid) { vid.pause(); }
  overlay.classList.remove('open');
  setTimeout(function() { overlay.remove(); }, 300);
  _acadCurrentVideo = null;
  _acadPlaying = false;
}

function _buildPlayerHTML(v) {
  var isVertical = v.aspect === '9:16';

  return '<div class="acad-player-container' + (isVertical ? ' vertical' : '') + '">'
    /* top bar */
    + '<div class="acad-player-topbar">'
    + '<div class="btn-icon" onclick="closeAcademyPlayer()" style="color:#fff"><iconify-icon icon="solar:arrow-left-outline" style="font-size:22px"></iconify-icon></div>'
    + '<div style="flex:1;text-align:center"><span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#fff">Akademi</span></div>'
    + '<div class="btn-icon" style="color:#fff"><iconify-icon icon="solar:menu-dots-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>'

    /* video area */
    + '<div class="acad-player-video" onclick="_acadTogglePlay()">'
    + '<video id="acadVideo" preload="metadata" poster="' + v.thumbnail + '" playsinline>'
    + '<source src="' + v.videoUrl + '" type="video/mp4">'
    + '</video>'
    + '<div class="acad-player-play-icon" id="acadPlayIcon">'
    + '<iconify-icon icon="solar:play-bold" style="font-size:40px;color:#fff"></iconify-icon>'
    + '</div>'
    /* progress bar */
    + '<div class="acad-player-progress">'
    + '<div class="acad-player-progress-bar" id="acadProgressBar"></div>'
    + '</div>'
    + '<div class="acad-player-time" id="acadTimeLabel">0:00 / ' + v.duration + '</div>'
    + '</div>'

    /* info section (scrollable) */
    + '<div class="acad-player-info">'
    /* user row */
    + '<div class="acad-player-user">'
    + '<img src="' + v.user.avatar + '" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0">'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);display:flex;align-items:center;gap:4px">' + v.user.name + ' <iconify-icon icon="solar:verified-check-bold" style="font-size:14px;color:var(--primary)"></iconify-icon></div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + v.user.followers + ' takipçi</div>'
    + '</div>'
    + '<button class="acad-follow-btn">Takip Et</button>'
    + '</div>'

    /* title + description */
    + '<div class="acad-player-title">' + v.title + '</div>'
    + '<div class="acad-player-desc">' + v.description + '</div>'
    + '<div class="acad-player-stats">'
    + '<span><iconify-icon icon="solar:eye-linear"></iconify-icon>' + formatCount(v.views) + ' izlenme</span>'
    + '<span>' + v.time + '</span>'
    + '</div>'

    /* actions bar */
    + '<div class="acad-player-actions">'
    + '<div class="acad-player-action' + (v.liked ? ' active' : '') + '" id="acadLikeBtn" onclick="toggleAcademyLike(\'' + v.id + '\')">'
    + '<iconify-icon icon="' + (v.liked ? 'solar:like-bold' : 'solar:like-linear') + '" style="font-size:22px"></iconify-icon>'
    + '<span id="acadLikeCount">' + formatCount(v.likes) + '</span>'
    + '</div>'
    + '<div class="acad-player-action" onclick="_acadOpenComments(\'' + v.id + '\')">'
    + '<iconify-icon icon="solar:chat-round-dots-linear" style="font-size:22px"></iconify-icon>'
    + '<span>' + formatCount(v.comments) + '</span>'
    + '</div>'
    + '<div class="acad-player-action">'
    + '<iconify-icon icon="solar:share-linear" style="font-size:22px"></iconify-icon>'
    + '<span>' + formatCount(v.shares) + '</span>'
    + '</div>'
    + '<div class="acad-player-action' + (v.saved ? ' active' : '') + '" id="acadSaveBtn" onclick="toggleAcademySave(\'' + v.id + '\')">'
    + '<iconify-icon icon="' + (v.saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear') + '" style="font-size:22px"></iconify-icon>'
    + '<span>Kaydet</span>'
    + '</div>'
    + '</div>'

    /* tags */
    + '<div class="acad-player-tags">' + v.tags.map(function(t) { return '<span class="feed-tag">#' + t + '</span>'; }).join('') + '</div>'
    + '</div>'
    + '</div>';
}


/* ── Video Play/Pause ── */
function _acadTogglePlay() {
  var vid = document.getElementById('acadVideo');
  var icon = document.getElementById('acadPlayIcon');
  if (!vid) return;

  if (vid.paused) {
    vid.play();
    _acadPlaying = true;
    if (icon) icon.style.opacity = '0';
    /* progress updater */
    vid._interval = setInterval(function() { _acadUpdateProgress(); }, 250);
  } else {
    vid.pause();
    _acadPlaying = false;
    if (icon) {
      icon.style.opacity = '1';
      icon.innerHTML = '<iconify-icon icon="solar:play-bold" style="font-size:40px;color:#fff"></iconify-icon>';
    }
    clearInterval(vid._interval);
  }

  vid.onended = function() {
    _acadPlaying = false;
    if (icon) {
      icon.style.opacity = '1';
      icon.innerHTML = '<iconify-icon icon="solar:restart-bold" style="font-size:40px;color:#fff"></iconify-icon>';
    }
    clearInterval(vid._interval);
  };
}

function _acadUpdateProgress() {
  var vid = document.getElementById('acadVideo');
  var bar = document.getElementById('acadProgressBar');
  var label = document.getElementById('acadTimeLabel');
  if (!vid || !vid.duration) return;
  var pct = (vid.currentTime / vid.duration) * 100;
  if (bar) bar.style.width = pct + '%';
  if (label) {
    var cur = _formatTime(vid.currentTime);
    var dur = _formatTime(vid.duration);
    label.textContent = cur + ' / ' + dur;
  }
}

function _formatTime(sec) {
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}


/* ── Akademi Like (entegre: Hamburger > Beğendiklerim) ── */
function toggleAcademyLike(videoId) {
  var v = ACADEMY_VIDEOS.find(function(x) { return x.id === videoId; });
  if (!v) return;
  v.liked = !v.liked;
  v.likes += v.liked ? 1 : -1;

  /* Sync to USER_PROFILE.likedPosts */
  if (!USER_PROFILE.likedPosts) USER_PROFILE.likedPosts = [];
  var lp = USER_PROFILE.likedPosts;
  var idx = lp.indexOf(videoId);
  if (v.liked && idx === -1) lp.push(videoId);
  else if (!v.liked && idx !== -1) lp.splice(idx, 1);

  /* Update player UI */
  var btn = document.getElementById('acadLikeBtn');
  var cnt = document.getElementById('acadLikeCount');
  if (btn) {
    btn.classList.toggle('active', v.liked);
    btn.querySelector('iconify-icon').setAttribute('icon', v.liked ? 'solar:like-bold' : 'solar:like-linear');
  }
  if (cnt) cnt.textContent = formatCount(v.likes);
}

/* ── Akademi Save (entegre: Hamburger > Kaydedilenler) ── */
function toggleAcademySave(videoId) {
  var v = ACADEMY_VIDEOS.find(function(x) { return x.id === videoId; });
  if (!v) return;
  v.saved = !v.saved;

  if (!USER_PROFILE.savedPosts) USER_PROFILE.savedPosts = [];
  var sp = USER_PROFILE.savedPosts;
  var idx = sp.indexOf(videoId);
  if (v.saved && idx === -1) sp.push(videoId);
  else if (!v.saved && idx !== -1) sp.splice(idx, 1);

  /* Update player UI */
  var btn = document.getElementById('acadSaveBtn');
  if (btn) {
    btn.classList.toggle('active', v.saved);
    btn.querySelector('iconify-icon').setAttribute('icon', v.saved ? 'solar:bookmark-bold' : 'solar:bookmark-linear');
  }

  /* also refresh feed cards if visible */
  if (commActiveFilter === 'academy') renderCommFeed();
}

/* ── Akademi Comments (Bottom Sheet) ── */
function _acadOpenComments(videoId) {
  var v = ACADEMY_VIDEOS.find(function(x) { return x.id === videoId; });
  if (!v) return;

  var existing = document.getElementById('acadCommentsSheet');
  if (existing) existing.remove();
  var existingBd = document.getElementById('acadCommentsBd');
  if (existingBd) existingBd.remove();

  /* Demo comments */
  var demoComments = [
    { user: 'Zeynep', avatar: 'https://i.pravatar.cc/80?img=9', text: 'Harika bir teknik, çok teşekkürler!', time: '2s önce', likes: 12 },
    { user: 'Deniz', avatar: 'https://i.pravatar.cc/80?img=15', text: 'Bunu denedim ve gerçekten fark yarattı.', time: '5s önce', likes: 8 },
    { user: 'Furkan', avatar: 'https://i.pravatar.cc/80?img=11', text: 'Daha fazla bu tarz içerik lütfen!', time: '1g önce', likes: 23 },
  ];

  var bd = document.createElement('div');
  bd.id = 'acadCommentsBd';
  bd.className = 'np-backdrop';
  bd.style.zIndex = '70';
  bd.onclick = function() { _acadCloseComments(); };

  var sheet = document.createElement('div');
  sheet.id = 'acadCommentsSheet';
  sheet.className = 'np-sheet';
  sheet.style.zIndex = '71';
  sheet.style.maxHeight = '60%';

  var h = '<div class="np-handle"><div class="np-handle-bar"></div></div>';
  h += '<div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">';
  h += '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Yorumlar (' + v.comments + ')</span>';
  h += '<div class="btn-icon" onclick="_acadCloseComments()"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>';
  h += '</div>';
  h += '<div style="flex:1;overflow-y:auto;padding:8px 0">';
  demoComments.forEach(function(c) {
    h += '<div style="display:flex;gap:10px;padding:12px 16px">';
    h += '<img src="' + c.avatar + '" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0">';
    h += '<div style="flex:1">';
    h += '<div style="font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)">' + c.user + ' <span style="font-weight:400;color:var(--text-muted);margin-left:6px">' + c.time + '</span></div>';
    h += '<div style="font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-secondary);margin-top:4px">' + c.text + '</div>';
    h += '<div style="display:flex;align-items:center;gap:4px;margin-top:6px;cursor:pointer;color:var(--text-muted)"><iconify-icon icon="solar:like-linear" style="font-size:14px"></iconify-icon><span style="font:var(--fw-medium) 11px/1 var(--font)">' + c.likes + '</span></div>';
    h += '</div></div>';
  });
  h += '</div>';
  /* input bar */
  h += '<div style="display:flex;align-items:center;gap:8px;padding:10px 16px;border-top:1px solid var(--border-subtle)">';
  h += '<input type="text" placeholder="Yorum yaz..." style="flex:1;border:1px solid var(--border-subtle);border-radius:var(--r-full);padding:8px 14px;font:var(--fw-regular) var(--fs-sm)/1 var(--font);background:var(--glass-card);color:var(--text-primary);outline:none">';
  h += '<div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><iconify-icon icon="solar:arrow-up-bold" style="font-size:18px;color:#fff"></iconify-icon></div>';
  h += '</div>';

  sheet.innerHTML = h;
  var playerOverlay = document.getElementById('acadPlayerOverlay');
  if (playerOverlay) {
    playerOverlay.appendChild(bd);
    playerOverlay.appendChild(sheet);
  }

  requestAnimationFrame(function() {
    bd.classList.add('open');
    sheet.classList.add('open');
  });
}

function _acadCloseComments() {
  var bd = document.getElementById('acadCommentsBd');
  var sheet = document.getElementById('acadCommentsSheet');
  if (bd) { bd.classList.remove('open'); }
  if (sheet) { sheet.classList.remove('open'); }
  setTimeout(function() {
    if (bd) bd.remove();
    if (sheet) sheet.remove();
  }, 300);
}

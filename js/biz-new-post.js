/* ═══════════════════════════════════════════════
 *  BIZ NEW POST — Bottom Sheet Gönderi Oluşturma
 *  İşletme tarafı için, kullanıcı tarafı new-post.js
 *  ile BİREBİR aynı akış — yalnızca DOM #bizPhone'a
 *  iliştirilir ve kimlik bilgileri işletmeden gelir.
 * ═══════════════════════════════════════════════ */

/* ── State ── */
var _bnpMode = 'post';                // 'post' | 'ask' | 'recipe-link'
var _bnpMedia = [];                   // [{type:'photo'|'video', url, name}]
var _bnpText = '';
var _bnpLinkedRecipeIdx = null;       // menuItems index or null
var _bnpAskActive = false;            // Topluluğa Sor mode
var _bnpPollOptions = ['', ''];
var _bnpPollActive = false;
var _bnpRecipeSearchQuery = '';

/* ═══ HELPER — Ensure sheet DOM exists inside #bizPhone ═══ */
function _bnpEnsureDom() {
  if (document.getElementById('bnpSheet')) return;
  var bizPhone = document.getElementById('bizPhone');
  if (!bizPhone) return;

  var backdrop = document.createElement('div');
  backdrop.className = 'np-backdrop';
  backdrop.id = 'bnpBackdrop';
  backdrop.setAttribute('onclick', 'closeBizNewPost()');

  var sheet = document.createElement('div');
  sheet.className = 'np-sheet';
  sheet.id = 'bnpSheet';
  sheet.innerHTML =
    '<div class="np-handle"><div class="np-handle-bar"></div></div>' +
    '<div id="bnpBody"></div>';

  bizPhone.appendChild(backdrop);
  bizPhone.appendChild(sheet);
}

/* ═══ BIZ IDENTITY HELPER ═══ */
function _bnpGetIdentity() {
  var name = 'İşletme';
  var handle = '@isletme';
  var avatar = null;
  var isChef = false;
  var verified = false;

  if (typeof bizCurrentEmployment !== 'undefined' && bizCurrentEmployment) {
    name = bizCurrentEmployment.businessName || name;
    handle = '@' + String(name).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    isChef = bizCurrentEmployment.role === 'chef' || bizCurrentEmployment.role === 'owner';
    verified = true;
  }
  // Try to read header text as fallback
  var headerName = document.getElementById('bizHeaderName');
  if (headerName && headerName.textContent) name = headerName.textContent.trim();

  return { name: name, handle: handle, avatar: avatar, isChef: isChef, verified: verified };
}

/* ═══ OPEN / CLOSE ═══ */
function openBizNewPost() {
  _bnpEnsureDom();

  _bnpMode = 'post';
  _bnpMedia = [];
  _bnpText = '';
  _bnpLinkedRecipeIdx = null;
  _bnpAskActive = false;
  _bnpPollOptions = ['', ''];
  _bnpPollActive = false;
  _bnpRecipeSearchQuery = '';

  var backdrop = document.getElementById('bnpBackdrop');
  var sheet = document.getElementById('bnpSheet');
  if (backdrop) backdrop.classList.add('open');
  if (sheet) sheet.classList.add('open');
  _bnpRender();
  setTimeout(function() {
    var ta = document.getElementById('bnpTextarea');
    if (ta) ta.focus();
  }, 350);
}

function closeBizNewPost() {
  var backdrop = document.getElementById('bnpBackdrop');
  var sheet = document.getElementById('bnpSheet');
  if (sheet) sheet.classList.remove('open');
  setTimeout(function() {
    if (backdrop) backdrop.classList.remove('open');
  }, 300);
}

/* ═══ HELPERS ═══ */
function _bnpEsc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _bnpToast(msg) {
  if (typeof showToast === 'function') { showToast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;padding:10px 20px;border-radius:20px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:999;transition:opacity .3s';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; }, 2000);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

/* ═══ MAIN RENDER ═══ */
function _bnpRender() {
  var body = document.getElementById('bnpBody');
  if (!body) return;

  if (_bnpMode === 'recipe-link') {
    _bnpRenderRecipeLink(body);
    return;
  }

  var identity = _bnpGetIdentity();
  var html = '';

  /* ── Header ── */
  html += '<div class="np-header">';
  html += '<div class="np-header-left">';
  html += '<div class="np-avatar">' + _bnpEsc((identity.name || 'İ').charAt(0)) + '</div>';
  html += '<div class="np-user-info">';
  html += '<span class="np-username">' + _bnpEsc(identity.name) + '</span>';
  if (_bnpAskActive) {
    html += '<span class="np-badge-ask"><iconify-icon icon="solar:question-circle-bold" style="font-size:12px"></iconify-icon> Topluluğa Sor</span>';
  }
  html += '</div></div>';
  html += '<button class="np-btn-share" onclick="_bnpPublish()" id="bnpShareBtn">Paylaş</button>';
  html += '</div>';

  /* ── Metin Alanı ── */
  html += '<textarea class="np-textarea" id="bnpTextarea" placeholder="' + (_bnpAskActive ? 'Topluluğa bir şey sor...' : 'Ne düşünüyorsun? #hashtag @etiket') + '" oninput="_bnpOnTextInput(this)">' + _bnpEsc(_bnpText) + '</textarea>';

  /* ── Bağlı Tarif Kartı ── */
  if (_bnpLinkedRecipeIdx !== null && typeof menuItems !== 'undefined') {
    var recipe = menuItems[_bnpLinkedRecipeIdx];
    if (recipe) {
      html += '<div class="np-linked-recipe">';
      html += '<img src="' + recipe.img + '" class="np-linked-recipe-img" alt="">';
      html += '<div class="np-linked-recipe-info">';
      html += '<div class="np-linked-recipe-name">' + _bnpEsc(recipe.name) + '</div>';
      html += '<div class="np-linked-recipe-meta">' + _bnpEsc(recipe.prepTime || '') + ' · ' + _bnpEsc(recipe.difficulty || '') + '</div>';
      html += '</div>';
      html += '<div class="np-linked-recipe-remove" onclick="_bnpRemoveLinkedRecipe()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>';
      html += '</div>';
    }
  }

  /* ── Medya Önizleme ── */
  if (_bnpMedia.length > 0) {
    html += '<div class="np-media-preview">';
    _bnpMedia.forEach(function(m, i) {
      html += '<div class="np-media-thumb">';
      html += '<img src="' + m.url + '" alt="">';
      html += '<div class="np-media-remove" onclick="_bnpRemoveMedia(' + i + ')"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon></div>';
      if (m.type === 'video') {
        html += '<div class="np-media-video-badge"><iconify-icon icon="solar:play-bold" style="font-size:12px"></iconify-icon></div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  /* ── Topluluğa Sor: Anket Bölümü ── */
  if (_bnpAskActive) {
    if (_bnpMedia.length === 0) {
      html += '<div class="np-visual-warning">';
      html += '<iconify-icon icon="solar:gallery-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>';
      html += '<span>Görsel eklemek etkileşimi artırır</span>';
      html += '</div>';
    }
    html += '<div class="np-poll-toggle" onclick="_bnpTogglePoll()">';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<iconify-icon icon="solar:chart-square-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>';
    html += '<span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Anket Ekle</span>';
    html += '</div>';
    html += '<div class="np-toggle ' + (_bnpPollActive ? 'active' : '') + '"><div class="np-toggle-dot"></div></div>';
    html += '</div>';

    if (_bnpPollActive) {
      html += '<div class="np-poll-options">';
      _bnpPollOptions.forEach(function(opt, i) {
        html += '<div class="np-poll-option-row">';
        html += '<input type="text" class="np-poll-input" placeholder="Seçenek ' + (i + 1) + '" value="' + _bnpEsc(opt) + '" oninput="_bnpPollOptionInput(' + i + ',this.value)">';
        if (_bnpPollOptions.length > 2) {
          html += '<div class="np-poll-remove" onclick="_bnpRemovePollOption(' + i + ')"><iconify-icon icon="solar:minus-circle-linear" style="font-size:18px"></iconify-icon></div>';
        }
        html += '</div>';
      });
      if (_bnpPollOptions.length < 4) {
        html += '<div class="np-poll-add" onclick="_bnpAddPollOption()">';
        html += '<iconify-icon icon="solar:add-circle-linear" style="font-size:18px"></iconify-icon>';
        html += '<span>Seçenek Ekle</span>';
        html += '</div>';
      }
      html += '</div>';
    }
  }

  /* ── Alt Araç Çubuğu ── */
  html += '<div class="np-toolbar">';
  html += '<div class="np-toolbar-left">';
  html += '<div class="np-tool" onclick="_bnpAddPhoto()" title="Fotoğraf"><iconify-icon icon="solar:gallery-bold" style="font-size:20px;color:var(--primary)"></iconify-icon></div>';
  html += '<div class="np-tool" onclick="_bnpAddVideo()" title="Video (maks 2dk)"><iconify-icon icon="solar:videocamera-bold" style="font-size:20px;color:#EF4444"></iconify-icon></div>';
  html += '<div class="np-tool" onclick="_bnpOpenRecipeLink()" title="Tarif Bağla"><iconify-icon icon="solar:link-round-bold" style="font-size:20px;color:#F59E0B"></iconify-icon></div>';
  html += '<div class="np-tool ' + (_bnpAskActive ? 'np-tool-active' : '') + '" onclick="_bnpToggleAsk()" title="Topluluğa Sor"><iconify-icon icon="solar:question-circle-bold" style="font-size:20px;color:#8B5CF6"></iconify-icon></div>';
  html += '</div>';
  html += '<span class="np-char-count" id="bnpCharCount">' + (_bnpText.length) + '/500</span>';
  html += '</div>';

  body.innerHTML = html;
}

/* ═══ RECIPE LINK PAGE ═══ */
function _bnpRenderRecipeLink(body) {
  var html = '';

  html += '<div class="np-header" style="border-bottom:1px solid var(--border-subtle);padding-bottom:12px">';
  html += '<div style="display:flex;align-items:center;gap:10px">';
  html += '<div class="np-tool" onclick="_bnpBackFromRecipeLink()" style="margin:0"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px;color:var(--text-primary)"></iconify-icon></div>';
  html += '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Tarif Bağla</span>';
  html += '</div></div>';

  html += '<div class="np-recipe-search">';
  html += '<iconify-icon icon="solar:magnifer-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>';
  html += '<input type="text" class="np-recipe-search-input" placeholder="Tarif ara..." value="' + _bnpEsc(_bnpRecipeSearchQuery) + '" oninput="_bnpRecipeSearch(this.value)" id="bnpRecipeSearchInput">';
  html += '</div>';

  /* Saved recipes (if available) */
  var savedIdxs = (typeof USER_PROFILE !== 'undefined' && USER_PROFILE.savedRecipes) ? USER_PROFILE.savedRecipes : [];
  if (savedIdxs.length > 0 && !_bnpRecipeSearchQuery && typeof menuItems !== 'undefined') {
    html += '<div class="np-recipe-section-title">Tarif Defterim</div>';
    html += '<div class="np-recipe-list">';
    savedIdxs.forEach(function(idx) {
      var item = menuItems[idx];
      if (!item) return;
      html += _bnpRecipeCard(item, idx, _bnpLinkedRecipeIdx === idx);
    });
    html += '</div>';
  }

  var allRecipes = [];
  var q = _bnpRecipeSearchQuery.toLowerCase().trim();
  if (typeof menuItems !== 'undefined') {
    menuItems.forEach(function(item, idx) {
      if (q && item.name.toLowerCase().indexOf(q) === -1) return;
      allRecipes.push({ item: item, idx: idx });
    });
  }

  html += '<div class="np-recipe-section-title">' + (q ? 'Arama Sonuçları' : 'Tüm Tarifler') + '</div>';
  if (allRecipes.length === 0) {
    html += '<div style="text-align:center;padding:24px 0;color:var(--text-muted);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Tarif bulunamadı</div>';
  } else {
    html += '<div class="np-recipe-list">';
    allRecipes.forEach(function(r) {
      html += _bnpRecipeCard(r.item, r.idx, _bnpLinkedRecipeIdx === r.idx);
    });
    html += '</div>';
  }

  body.innerHTML = html;
}

function _bnpRecipeCard(item, idx, isSelected) {
  var h = '';
  h += '<div class="np-recipe-card ' + (isSelected ? 'np-recipe-selected' : '') + '" onclick="_bnpSelectRecipe(' + idx + ')">';
  h += '<img src="' + item.img + '" class="np-recipe-card-img" alt="">';
  h += '<div class="np-recipe-card-info">';
  h += '<div class="np-recipe-card-name">' + _bnpEsc(item.name) + '</div>';
  h += '<div class="np-recipe-card-meta">' + _bnpEsc(item.prepTime || '') + (item.difficulty ? ' · ' + _bnpEsc(item.difficulty) : '') + '</div>';
  h += '</div>';
  if (isSelected) {
    h += '<iconify-icon icon="solar:check-circle-bold" style="font-size:22px;color:var(--primary);flex-shrink:0"></iconify-icon>';
  }
  h += '</div>';
  return h;
}

/* ═══ ACTIONS ═══ */
function _bnpOnTextInput(el) {
  _bnpText = el.value;
  if (_bnpText.length > 500) {
    _bnpText = _bnpText.substring(0, 500);
    el.value = _bnpText;
  }
  var counter = document.getElementById('bnpCharCount');
  if (counter) counter.textContent = _bnpText.length + '/500';
}

function _bnpAddPhoto() {
  var dummyPhotos = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop'
  ];
  if (_bnpMedia.length >= 5) { _bnpToast('En fazla 5 medya ekleyebilirsiniz'); return; }
  _bnpMedia.push({ type: 'photo', url: dummyPhotos[_bnpMedia.length % dummyPhotos.length], name: 'foto_' + (_bnpMedia.length + 1) + '.jpg' });
  _bnpRender();
}

function _bnpAddVideo() {
  if (_bnpMedia.some(function(m) { return m.type === 'video'; })) { _bnpToast('Yalnızca 1 video ekleyebilirsiniz'); return; }
  if (_bnpMedia.length >= 5) { _bnpToast('En fazla 5 medya ekleyebilirsiniz'); return; }
  _bnpMedia.push({ type: 'video', url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop', name: 'video.mp4' });
  _bnpToast('Video eklendi (maks 2 dakika)');
  _bnpRender();
}

function _bnpRemoveMedia(i) {
  _bnpMedia.splice(i, 1);
  _bnpRender();
}

function _bnpOpenRecipeLink() {
  _bnpMode = 'recipe-link';
  _bnpRecipeSearchQuery = '';
  _bnpRender();
}

function _bnpBackFromRecipeLink() {
  _bnpMode = 'post';
  _bnpRender();
}

function _bnpRecipeSearch(val) {
  _bnpRecipeSearchQuery = val;
  _bnpRender();
  setTimeout(function() {
    var inp = document.getElementById('bnpRecipeSearchInput');
    if (inp) { inp.focus(); inp.setSelectionRange(val.length, val.length); }
  }, 10);
}

function _bnpSelectRecipe(idx) {
  _bnpLinkedRecipeIdx = (_bnpLinkedRecipeIdx === idx) ? null : idx;
  _bnpMode = 'post';
  _bnpRender();
}

function _bnpRemoveLinkedRecipe() {
  _bnpLinkedRecipeIdx = null;
  _bnpRender();
}

function _bnpToggleAsk() {
  _bnpAskActive = !_bnpAskActive;
  if (!_bnpAskActive) {
    _bnpPollActive = false;
    _bnpPollOptions = ['', ''];
  }
  _bnpRender();
}

function _bnpTogglePoll() {
  _bnpPollActive = !_bnpPollActive;
  _bnpRender();
}

function _bnpPollOptionInput(i, val) {
  _bnpPollOptions[i] = val;
}

function _bnpAddPollOption() {
  if (_bnpPollOptions.length < 4) {
    _bnpPollOptions.push('');
    _bnpRender();
  }
}

function _bnpRemovePollOption(i) {
  if (_bnpPollOptions.length > 2) {
    _bnpPollOptions.splice(i, 1);
    _bnpRender();
  }
}

/* ═══ PUBLISH ═══ */
function _bnpPublish() {
  if (!_bnpText.trim() && _bnpMedia.length === 0 && _bnpLinkedRecipeIdx === null) {
    _bnpToast('Lütfen bir şeyler yazın veya medya ekleyin');
    return;
  }

  var identity = _bnpGetIdentity();

  // Build post compatible with BOTH user-side community.js (post.user as object)
  // and user-side new-post.js flat fields.
  var photos = _bnpMedia.filter(function(m) { return m.type === 'photo'; }).map(function(m) { return m.url; });

  var newPost = {
    id: Date.now(),
    user: {
      name: identity.name,
      handle: identity.handle,
      avatar: identity.avatar || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop',
      verified: identity.verified,
      isChef: identity.isChef
    },
    // Flat aliases for compatibility with user-side new-post.js style readers
    handle: identity.handle,
    avatar: identity.avatar,
    isChef: identity.isChef,
    text: _bnpText,
    img: photos[0] || null,
    images: photos,
    time: 'Az önce',
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    saved: false,
    tags: [],
    filter: 'all',
    postType: _bnpAskActive ? 'ask' : (_bnpLinkedRecipeIdx !== null ? 'recipe' : 'post')
  };

  if (_bnpLinkedRecipeIdx !== null && typeof menuItems !== 'undefined') {
    var r = menuItems[_bnpLinkedRecipeIdx];
    if (r) {
      newPost.linkedRecipe = {
        idx: _bnpLinkedRecipeIdx,
        name: r.name,
        img: r.img,
        prepTime: r.prepTime || '',
        difficulty: r.difficulty || ''
      };
      newPost.recipe = {
        menuIdx: _bnpLinkedRecipeIdx,
        name: r.name,
        cookTime: r.prepTime || r.cookTime || '',
        kalori: r.kalori || r.calories || ''
      };
    }
  }

  if (_bnpAskActive) {
    newPost.isQuestion = true;
    newPost.helpButton = true;
    newPost.askStatus = 'open';
    newPost.askReplies = 0;
    if (_bnpPollActive) {
      var validOptions = _bnpPollOptions.filter(function(o) { return o.trim() !== ''; });
      if (validOptions.length >= 2) {
        newPost.poll = {
          options: validOptions.map(function(o) { return { text: o, votes: 0 }; }),
          totalVotes: 0,
          voted: false
        };
      }
    }
  }

  if (typeof COMMUNITY_FEED !== 'undefined') {
    COMMUNITY_FEED.unshift(newPost);
  }

  closeBizNewPost();
  _bnpToast('Gönderi paylaşıldı!');

  // Refresh biz feed
  if (typeof renderBizCommFeed === 'function') {
    setTimeout(function() { renderBizCommFeed(bizCommFilter || 'all'); }, 350);
  }
  // Also refresh user feed if present (shared data)
  if (typeof renderCommunityFeed === 'function') {
    setTimeout(function() { renderCommunityFeed(); }, 350);
  }
}

/* ═══ EXPORTS ═══ */
window.openBizNewPost = openBizNewPost;
window.closeBizNewPost = closeBizNewPost;
window._bnpRender = _bnpRender;
window._bnpOnTextInput = _bnpOnTextInput;
window._bnpAddPhoto = _bnpAddPhoto;
window._bnpAddVideo = _bnpAddVideo;
window._bnpRemoveMedia = _bnpRemoveMedia;
window._bnpOpenRecipeLink = _bnpOpenRecipeLink;
window._bnpBackFromRecipeLink = _bnpBackFromRecipeLink;
window._bnpRecipeSearch = _bnpRecipeSearch;
window._bnpSelectRecipe = _bnpSelectRecipe;
window._bnpRemoveLinkedRecipe = _bnpRemoveLinkedRecipe;
window._bnpToggleAsk = _bnpToggleAsk;
window._bnpTogglePoll = _bnpTogglePoll;
window._bnpPollOptionInput = _bnpPollOptionInput;
window._bnpAddPollOption = _bnpAddPollOption;
window._bnpRemovePollOption = _bnpRemovePollOption;
window._bnpPublish = _bnpPublish;

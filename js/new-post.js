/* ═══════════════════════════════════════════════
 *  NEW POST — Bottom Sheet Gönderi Oluşturma
 *  Doğrudan metin + medya girişi, kategori yok
 * ═══════════════════════════════════════════════ */

/* ── State ── */
let _npMode = 'post';                // 'post' | 'ask' | 'recipe-link'
let _npMedia = [];                   // [{type:'photo'|'video', url:'...', name:'...'}]
let _npText = '';
let _npLinkedRecipeIdx = null;       // menuItems index or null
let _npAskActive = false;            // Topluluğa Sor mode on?
let _npPollOptions = ['', ''];       // poll şıkları
let _npPollActive = false;           // anket modu açık mı
let _npRecipeSearchQuery = '';

/* ═══ OPEN / CLOSE ═══ */
function openNewPost() {
  _npMode = 'post';
  _npMedia = [];
  _npText = '';
  _npLinkedRecipeIdx = null;
  _npAskActive = false;
  _npPollOptions = ['', ''];
  _npPollActive = false;
  _npRecipeSearchQuery = '';

  var backdrop = document.getElementById('npBackdrop');
  var sheet = document.getElementById('npSheet');
  if (backdrop) backdrop.classList.add('open');
  if (sheet) sheet.classList.add('open');
  _npRender();
  // auto-focus textarea after render
  setTimeout(function() {
    var ta = document.getElementById('npTextarea');
    if (ta) ta.focus();
  }, 350);
}

function closeNewPost() {
  var backdrop = document.getElementById('npBackdrop');
  var sheet = document.getElementById('npSheet');
  if (sheet) sheet.classList.remove('open');
  setTimeout(function() {
    if (backdrop) backdrop.classList.remove('open');
  }, 300);
}

/* ═══ MAIN RENDER ═══ */
function _npRender() {
  var body = document.getElementById('npBody');
  if (!body) return;

  if (_npMode === 'recipe-link') {
    _npRenderRecipeLink(body);
    return;
  }

  var html = '';

  /* ── Header: avatar + paylaş butonu ── */
  html += '<div class="np-header">';
  html += '<div class="np-header-left">';
  html += '<div class="np-avatar">' + (USER_PROFILE.name || 'F').charAt(0) + '</div>';
  html += '<div class="np-user-info">';
  html += '<span class="np-username">' + (USER_PROFILE.name || 'Kullanıcı') + '</span>';
  if (_npAskActive) {
    html += '<span class="np-badge-ask"><iconify-icon icon="solar:question-circle-bold" style="font-size:12px"></iconify-icon> Topluluğa Sor</span>';
  }
  html += '</div></div>';
  html += '<button class="np-btn-share" onclick="_npPublish()" id="npShareBtn">Paylaş</button>';
  html += '</div>';

  /* ── Metin Alanı ── */
  html += '<textarea class="np-textarea" id="npTextarea" placeholder="' + (_npAskActive ? 'Topluluğa bir şey sor...' : 'Ne düşünüyorsun? #hashtag @etiket') + '" oninput="_npOnTextInput(this)">' + _escHtml(_npText) + '</textarea>';

  /* ── Bağlı Tarif Kartı (varsa) ── */
  if (_npLinkedRecipeIdx !== null) {
    var recipe = menuItems[_npLinkedRecipeIdx];
    if (recipe) {
      html += '<div class="np-linked-recipe">';
      html += '<img src="' + recipe.img + '" class="np-linked-recipe-img" alt="">';
      html += '<div class="np-linked-recipe-info">';
      html += '<div class="np-linked-recipe-name">' + _escHtml(recipe.name) + '</div>';
      html += '<div class="np-linked-recipe-meta">' + (recipe.prepTime || '') + ' · ' + (recipe.difficulty || '') + '</div>';
      html += '</div>';
      html += '<div class="np-linked-recipe-remove" onclick="_npRemoveLinkedRecipe()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>';
      html += '</div>';
    }
  }

  /* ── Medya Önizleme ── */
  if (_npMedia.length > 0) {
    html += '<div class="np-media-preview">';
    _npMedia.forEach(function(m, i) {
      html += '<div class="np-media-thumb">';
      html += '<img src="' + m.url + '" alt="">';
      html += '<div class="np-media-remove" onclick="_npRemoveMedia(' + i + ')"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon></div>';
      if (m.type === 'video') {
        html += '<div class="np-media-video-badge"><iconify-icon icon="solar:play-bold" style="font-size:12px"></iconify-icon></div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  /* ── Topluluğa Sor: Anket Bölümü ── */
  if (_npAskActive) {
    // Görsel uyarı (medya yoksa)
    if (_npMedia.length === 0) {
      html += '<div class="np-visual-warning">';
      html += '<iconify-icon icon="solar:gallery-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>';
      html += '<span>Görsel eklemek etkileşimi artırır</span>';
      html += '</div>';
    }
    // Anket toggle
    html += '<div class="np-poll-toggle" onclick="_npTogglePoll()">';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<iconify-icon icon="solar:chart-square-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>';
    html += '<span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Anket Ekle</span>';
    html += '</div>';
    html += '<div class="np-toggle ' + (_npPollActive ? 'active' : '') + '"><div class="np-toggle-dot"></div></div>';
    html += '</div>';

    if (_npPollActive) {
      html += '<div class="np-poll-options">';
      _npPollOptions.forEach(function(opt, i) {
        html += '<div class="np-poll-option-row">';
        html += '<input type="text" class="np-poll-input" placeholder="Seçenek ' + (i + 1) + '" value="' + _escHtml(opt) + '" oninput="_npPollOptionInput(' + i + ',this.value)">';
        if (_npPollOptions.length > 2) {
          html += '<div class="np-poll-remove" onclick="_npRemovePollOption(' + i + ')"><iconify-icon icon="solar:minus-circle-linear" style="font-size:18px"></iconify-icon></div>';
        }
        html += '</div>';
      });
      if (_npPollOptions.length < 4) {
        html += '<div class="np-poll-add" onclick="_npAddPollOption()">';
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
  html += '<div class="np-tool" onclick="_npAddPhoto()" title="Fotoğraf"><iconify-icon icon="solar:gallery-bold" style="font-size:20px;color:var(--primary)"></iconify-icon></div>';
  html += '<div class="np-tool" onclick="_npAddVideo()" title="Video (maks 2dk)"><iconify-icon icon="solar:videocamera-bold" style="font-size:20px;color:#EF4444"></iconify-icon></div>';
  html += '<div class="np-tool" onclick="_npOpenRecipeLink()" title="Tarif Bağla"><iconify-icon icon="solar:link-round-bold" style="font-size:20px;color:#F59E0B"></iconify-icon></div>';
  html += '<div class="np-tool ' + (_npAskActive ? 'np-tool-active' : '') + '" onclick="_npToggleAsk()" title="Topluluğa Sor"><iconify-icon icon="solar:question-circle-bold" style="font-size:20px;color:#8B5CF6"></iconify-icon></div>';
  html += '</div>';
  html += '<span class="np-char-count" id="npCharCount">' + (_npText.length) + '/500</span>';
  html += '</div>';

  body.innerHTML = html;
}

/* ═══ RECIPE LINK — Tarif Bağla Sayfası ═══ */
function _npRenderRecipeLink(body) {
  var html = '';

  /* Header */
  html += '<div class="np-header" style="border-bottom:1px solid var(--border-subtle);padding-bottom:12px">';
  html += '<div style="display:flex;align-items:center;gap:10px">';
  html += '<div class="np-tool" onclick="_npBackFromRecipeLink()" style="margin:0"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px;color:var(--text-primary)"></iconify-icon></div>';
  html += '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Tarif Bağla</span>';
  html += '</div></div>';

  /* Arama */
  html += '<div class="np-recipe-search">';
  html += '<iconify-icon icon="solar:magnifer-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>';
  html += '<input type="text" class="np-recipe-search-input" placeholder="Tarif ara..." value="' + _escHtml(_npRecipeSearchQuery) + '" oninput="_npRecipeSearch(this.value)" id="npRecipeSearchInput">';
  html += '</div>';

  /* Tarif Defterim (savedRecipes) */
  var savedIdxs = USER_PROFILE.savedRecipes || [];
  if (savedIdxs.length > 0 && !_npRecipeSearchQuery) {
    html += '<div class="np-recipe-section-title">Tarif Defterim</div>';
    html += '<div class="np-recipe-list">';
    savedIdxs.forEach(function(idx) {
      var item = menuItems[idx];
      if (!item) return;
      var isSelected = _npLinkedRecipeIdx === idx;
      html += _npRecipeCard(item, idx, isSelected);
    });
    html += '</div>';
  }

  /* Tüm Tarifler veya Arama Sonuçları */
  var allRecipes = [];
  var q = _npRecipeSearchQuery.toLowerCase().trim();
  menuItems.forEach(function(item, idx) {
    if (q && item.name.toLowerCase().indexOf(q) === -1) return;
    allRecipes.push({ item: item, idx: idx });
  });

  html += '<div class="np-recipe-section-title">' + (q ? 'Arama Sonuçları' : 'Tüm Tarifler') + '</div>';
  if (allRecipes.length === 0) {
    html += '<div style="text-align:center;padding:24px 0;color:var(--text-muted);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font)">Tarif bulunamadı</div>';
  } else {
    html += '<div class="np-recipe-list">';
    allRecipes.forEach(function(r) {
      var isSelected = _npLinkedRecipeIdx === r.idx;
      html += _npRecipeCard(r.item, r.idx, isSelected);
    });
    html += '</div>';
  }

  body.innerHTML = html;
}

function _npRecipeCard(item, idx, isSelected) {
  var h = '';
  h += '<div class="np-recipe-card ' + (isSelected ? 'np-recipe-selected' : '') + '" onclick="_npSelectRecipe(' + idx + ')">';
  h += '<img src="' + item.img + '" class="np-recipe-card-img" alt="">';
  h += '<div class="np-recipe-card-info">';
  h += '<div class="np-recipe-card-name">' + _escHtml(item.name) + '</div>';
  h += '<div class="np-recipe-card-meta">' + (item.prepTime || '') + (item.difficulty ? ' · ' + item.difficulty : '') + '</div>';
  h += '</div>';
  if (isSelected) {
    h += '<iconify-icon icon="solar:check-circle-bold" style="font-size:22px;color:var(--primary);flex-shrink:0"></iconify-icon>';
  }
  h += '</div>';
  return h;
}

/* ═══ ACTIONS ═══ */
function _npOnTextInput(el) {
  _npText = el.value;
  if (_npText.length > 500) {
    _npText = _npText.substring(0, 500);
    el.value = _npText;
  }
  var counter = document.getElementById('npCharCount');
  if (counter) counter.textContent = _npText.length + '/500';
}

function _npAddPhoto() {
  // Simulate photo picker
  var dummyPhotos = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop'
  ];
  if (_npMedia.length >= 5) { _npToast('En fazla 5 medya ekleyebilirsiniz'); return; }
  _npMedia.push({ type: 'photo', url: dummyPhotos[_npMedia.length % dummyPhotos.length], name: 'foto_' + (_npMedia.length + 1) + '.jpg' });
  _npRender();
}

function _npAddVideo() {
  if (_npMedia.some(function(m) { return m.type === 'video'; })) { _npToast('Yalnızca 1 video ekleyebilirsiniz'); return; }
  if (_npMedia.length >= 5) { _npToast('En fazla 5 medya ekleyebilirsiniz'); return; }
  _npMedia.push({ type: 'video', url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop', name: 'video.mp4' });
  _npToast('Video eklendi (maks 2 dakika)');
  _npRender();
}

function _npRemoveMedia(i) {
  _npMedia.splice(i, 1);
  _npRender();
}

/* Tarif Bağla */
function _npOpenRecipeLink() {
  _npMode = 'recipe-link';
  _npRecipeSearchQuery = '';
  _npRender();
}

function _npBackFromRecipeLink() {
  _npMode = 'post';
  _npRender();
}

function _npRecipeSearch(val) {
  _npRecipeSearchQuery = val;
  _npRender();
  // re-focus input after re-render
  setTimeout(function() {
    var inp = document.getElementById('npRecipeSearchInput');
    if (inp) { inp.focus(); inp.setSelectionRange(val.length, val.length); }
  }, 10);
}

function _npSelectRecipe(idx) {
  if (_npLinkedRecipeIdx === idx) {
    _npLinkedRecipeIdx = null;
  } else {
    _npLinkedRecipeIdx = idx;
  }
  // Go back to main post view
  _npMode = 'post';
  _npRender();
}

function _npRemoveLinkedRecipe() {
  _npLinkedRecipeIdx = null;
  _npRender();
}

/* Topluluğa Sor toggle */
function _npToggleAsk() {
  _npAskActive = !_npAskActive;
  if (!_npAskActive) {
    _npPollActive = false;
    _npPollOptions = ['', ''];
  }
  _npRender();
}

/* Anket toggle & options */
function _npTogglePoll() {
  _npPollActive = !_npPollActive;
  _npRender();
}

function _npPollOptionInput(i, val) {
  _npPollOptions[i] = val;
}

function _npAddPollOption() {
  if (_npPollOptions.length < 4) {
    _npPollOptions.push('');
    _npRender();
  }
}

function _npRemovePollOption(i) {
  if (_npPollOptions.length > 2) {
    _npPollOptions.splice(i, 1);
    _npRender();
  }
}

/* ═══ PUBLISH ═══ */
function _npPublish() {
  if (!_npText.trim() && _npMedia.length === 0 && _npLinkedRecipeIdx === null) {
    _npToast('Lütfen bir şeyler yazın veya medya ekleyin');
    return;
  }

  // Build new community post
  var newPost = {
    id: Date.now(),
    user: USER_PROFILE.name || 'Furkan',
    handle: USER_PROFILE.username || '@furkan',
    avatar: null,
    text: _npText,
    images: _npMedia.filter(function(m) { return m.type === 'photo'; }).map(function(m) { return m.url; }),
    time: 'Az önce',
    likes: 0,
    comments: 0,
    liked: false,
    saved: false,
    isChef: false
  };

  // Link recipe
  if (_npLinkedRecipeIdx !== null) {
    var r = menuItems[_npLinkedRecipeIdx];
    if (r) {
      newPost.linkedRecipe = {
        idx: _npLinkedRecipeIdx,
        name: r.name,
        img: r.img,
        prepTime: r.prepTime || '',
        difficulty: r.difficulty || ''
      };
    }
  }

  // Topluluğa Sor
  if (_npAskActive) {
    newPost.isQuestion = true;
    newPost.helpButton = true;
    if (_npPollActive) {
      var validOptions = _npPollOptions.filter(function(o) { return o.trim() !== ''; });
      if (validOptions.length >= 2) {
        newPost.poll = {
          options: validOptions.map(function(o) { return { text: o, votes: 0 }; }),
          totalVotes: 0,
          voted: false
        };
      }
    }
  }

  // Add to community feed at top
  if (typeof COMMUNITY_FEED !== 'undefined') {
    COMMUNITY_FEED.unshift(newPost);
  }

  closeNewPost();
  _npToast('Gönderi paylaşıldı!');

  // Refresh community feed if function exists
  if (typeof renderCommunityFeed === 'function') {
    setTimeout(function() { renderCommunityFeed(); }, 350);
  }
}

/* ═══ HELPERS ═══ */
function _escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _npToast(msg) {
  // Reuse app toast if available, else simple alert
  if (typeof showToast === 'function') { showToast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;padding:10px 20px;border-radius:20px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:999;transition:opacity .3s';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '0'; }, 2000);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

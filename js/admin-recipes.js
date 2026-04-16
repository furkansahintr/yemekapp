/* ═══════════════════════════════════════════════════════════
   ADMIN RECIPES — Tarif Yönetimi & İçerik Denetleme
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _arcp = {
  search: '',
  statusFilter: 'all',     /* all | approved | pending | rejected */
  categoryFilter: 'all',   /* all | breakfast | main | soup | dessert | vegan | salad | snack */
  sortBy: 'newest',        /* newest | oldest | mostSaved | mostCommented */
  filtersOpen: false
};

/* ── Status defs ── */
var _ARCP_ST = {
  approved: { label: 'Onaylı',    color: '#22C55E', icon: 'solar:check-circle-bold',   bg: '#DCFCE7' },
  pending:  { label: 'Bekliyor',  color: '#F59E0B', icon: 'solar:hourglass-bold',      bg: '#FEF3C7' },
  rejected: { label: 'Reddedildi',color: '#EF4444', icon: 'solar:close-circle-bold',   bg: '#FEE2E2' }
};

/* ═══ MAIN RENDER ═══ */
function renderAdminRecipes() {
  _admInjectStyles();
  _arcpInjectStyles();
  var c = document.getElementById('adminRecipesContainer');
  if (!c) return;

  /* Filter & sort */
  var list = ADMIN_RECIPES.slice();

  if (_arcp.statusFilter !== 'all') {
    list = list.filter(function(r) { return r.status === _arcp.statusFilter; });
  }
  if (_arcp.categoryFilter !== 'all') {
    list = list.filter(function(r) { return r.category === _arcp.categoryFilter; });
  }
  if (_arcp.search) {
    var q = _arcp.search.toLowerCase();
    list = list.filter(function(r) {
      return r.title.toLowerCase().indexOf(q) !== -1
        || r.userName.toLowerCase().indexOf(q) !== -1;
    });
  }

  list.sort(function(a, b) {
    if (_arcp.sortBy === 'oldest')        return new Date(a.date) - new Date(b.date);
    if (_arcp.sortBy === 'mostSaved')     return b.saves - a.saves;
    if (_arcp.sortBy === 'mostCommented') return b.comments - a.comments;
    return new Date(b.date) - new Date(a.date);
  });

  /* Stats */
  var appC  = ADMIN_RECIPES.filter(function(r) { return r.status === 'approved'; }).length;
  var penC  = ADMIN_RECIPES.filter(function(r) { return r.status === 'pending'; }).length;
  var rejC  = ADMIN_RECIPES.filter(function(r) { return r.status === 'rejected'; }).length;

  var h = '<div class="adm-fadeIn" style="padding:16px;display:flex;flex-direction:column;gap:14px">';

  /* ── Header ── */
  h += '<div style="display:flex;align-items:center;justify-content:space-between">'
    + '<div style="font:var(--fw-bold) 22px/1.1 var(--font);color:var(--text-primary)">Tarifler</div>'
    + '<div style="display:flex;gap:6px">'
    + '<span class="arcp-badge" style="color:#22C55E;background:#DCFCE7">' + appC + ' onaylı</span>'
    + '<span class="arcp-badge" style="color:#F59E0B;background:#FEF3C7">' + penC + ' bekliyor</span>'
    + '</div></div>';

  /* ── Search + Filter toggle ── */
  h += '<div style="display:flex;gap:8px">'
    + '<div style="flex:1;position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="arcp-search" placeholder="Tarif adı veya kullanıcı ara..." value="' + _arcpEsc(_arcp.search) + '" oninput="_arcpSearchChange(this.value)" />'
    + '</div>'
    + '<div class="arcp-icon-btn' + (_arcp.filtersOpen ? ' active' : '') + '" onclick="_arcpToggleFilters()">'
    + '<iconify-icon icon="solar:filter-bold" style="font-size:16px"></iconify-icon>'
    + (_arcpHasFilters() ? '<span class="arcp-filter-dot"></span>' : '')
    + '</div>'
    + '</div>';

  /* ── Filter panel ── */
  if (_arcp.filtersOpen) {
    h += _arcpRenderFilters();
  }

  /* ── Status tabs ── */
  h += '<div style="display:flex;gap:4px;overflow-x:auto">';
  var stabs = [
    { key:'all',      label:'Tümü',       count: ADMIN_RECIPES.length },
    { key:'pending',  label:'Bekliyor',   count: penC },
    { key:'approved', label:'Onaylı',     count: appC },
    { key:'rejected', label:'Reddedildi', count: rejC }
  ];
  for (var si = 0; si < stabs.length; si++) {
    var st = stabs[si];
    var isAct = _arcp.statusFilter === st.key;
    h += '<button class="arcp-tab' + (isAct ? ' active' : '') + '" onclick="_arcpSetStatus(\'' + st.key + '\')">'
      + st.label + ' <span class="arcp-tab-count">' + st.count + '</span></button>';
  }
  h += '</div>';

  /* ── Recipe list ── */
  if (list.length === 0) {
    h += '<div style="text-align:center;padding:40px 20px">'
      + '<iconify-icon icon="solar:chef-hat-heart-bold" style="font-size:48px;color:var(--text-tertiary)"></iconify-icon>'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:10px">Filtrelerle eşleşen tarif bulunamadı</div>'
      + '</div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:10px">';
    for (var i = 0; i < list.length; i++) {
      h += _arcpRecipeCard(list[i]);
    }
    h += '</div>';
  }

  h += '<div style="height:20px"></div></div>';
  c.innerHTML = h;
}

/* ── Recipe card ── */
function _arcpRecipeCard(r) {
  var st = _ARCP_ST[r.status] || _ARCP_ST.pending;
  var cat = _arcpCatInfo(r.category);

  var h = '<div class="arcp-card" onclick="_arcpOpenDetail(\'' + r.id + '\')">';

  /* Top: cover + info */
  h += '<div style="display:flex;gap:12px">';

  /* Cover image */
  h += '<div style="width:72px;height:72px;border-radius:var(--r-lg);overflow:hidden;flex-shrink:0;background:var(--bg-phone-secondary)">'
    + '<img src="' + r.cover + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'" />'
    + '</div>';

  /* Info */
  h += '<div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">';

  /* Title */
  h += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + r.title + '</div>';

  /* User + Category */
  h += '<div style="display:flex;align-items:center;gap:6px;margin-top:4px">'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + r.userName + '</span>'
    + '<span style="width:3px;height:3px;border-radius:50%;background:var(--text-tertiary)"></span>'
    + '<span style="font:var(--fw-medium) 10px/1 var(--font);color:' + cat.color + '">' + cat.label + '</span>'
    + '</div>';

  /* Date + Status */
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">'
    + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">' + _arcpRelTime(r.date) + '</span>'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + st.color + ';background:' + st.bg + ';padding:2px 7px;border-radius:var(--r-full)">' + st.label + '</span>'
    + '</div>';

  h += '</div></div>';

  /* Bottom: stats */
  h += '<div style="display:flex;gap:10px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle)">'
    + _arcpMiniStat('solar:heart-bold', '#EF4444', r.likes)
    + _arcpMiniStat('solar:bookmark-bold', '#F59E0B', r.saves)
    + _arcpMiniStat('solar:chat-round-dots-bold', '#3B82F6', r.comments)
    + '<div style="flex:1"></div>'
    + '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);display:flex;align-items:center;gap:3px">'
    + '<iconify-icon icon="solar:clock-circle-bold" style="font-size:12px"></iconify-icon>' + r.cookTime + ' dk</span>'
    + '</div>';

  h += '</div>';
  return h;
}

function _arcpMiniStat(icon, color, val) {
  return '<span style="display:flex;align-items:center;gap:3px;font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted)">'
    + '<iconify-icon icon="' + icon + '" style="font-size:12px;color:' + color + '"></iconify-icon>' + val + '</span>';
}

/* ═══════════════════════════════════════
   DETAIL / EDITOR — Full overlay
   ═══════════════════════════════════════ */
function _arcpOpenDetail(recipeId) {
  var r = null;
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    if (ADMIN_RECIPES[i].id === recipeId) { r = ADMIN_RECIPES[i]; break; }
  }
  if (!r) return;

  _arcpInjectStyles();
  var ov = document.getElementById('arcpDetailOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'arcpDetailOverlay';
    ov.className = 'prof-overlay';
    document.getElementById('adminPhone').appendChild(ov);
  }
  ov.classList.add('open');
  _arcpRenderDetail(r);
}

function _arcpCloseDetail() {
  var ov = document.getElementById('arcpDetailOverlay');
  if (ov) ov.classList.remove('open');
}

function _arcpRenderDetail(r) {
  var ov = document.getElementById('arcpDetailOverlay');
  if (!ov) return;

  var st = _ARCP_ST[r.status] || _ARCP_ST.pending;
  var cat = _arcpCatInfo(r.category);

  var h = '<div style="display:flex;flex-direction:column;height:100%;background:var(--bg-phone)">';

  /* ── Sticky top bar ── */
  h += '<div style="padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-subtle);flex-shrink:0">'
    + '<div class="arcp-back-btn" onclick="_arcpCloseDetail()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-primary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Tarif Düzenleme</div>'
    + '</div>'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + st.color + ';background:' + st.bg + ';padding:4px 10px;border-radius:var(--r-full)">' + st.label + '</span>'
    + '</div>';

  /* ── Scrollable body ── */
  h += '<div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px" id="arcpDetailBody">';

  /* Cover image */
  h += '<div style="position:relative;border-radius:var(--r-xl);overflow:hidden;height:180px;background:var(--bg-phone-secondary)">'
    + '<img src="' + r.cover + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'" />'
    + '<div style="position:absolute;bottom:0;left:0;right:0;padding:12px 14px;background:linear-gradient(transparent,rgba(0,0,0,0.7))">'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1.1 var(--font);color:#fff">' + r.title + '</div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-top:4px">'
    + '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:rgba(255,255,255,0.8)">' + r.userName + '</span>'
    + '<span style="font:var(--fw-medium) 10px/1 var(--font);color:' + cat.color + ';background:rgba(0,0,0,0.4);padding:2px 6px;border-radius:var(--r-full)">' + cat.label + '</span>'
    + '</div>'
    + '</div></div>';

  /* Stats bar */
  h += '<div style="display:flex;justify-content:space-around;padding:10px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg)">'
    + _arcpStatCell('solar:heart-bold', '#EF4444', r.likes, 'Beğeni')
    + _arcpStatCell('solar:bookmark-bold', '#F59E0B', r.saves, 'Kayıt')
    + _arcpStatCell('solar:chat-round-dots-bold', '#3B82F6', r.comments, 'Yorum')
    + _arcpStatCell('solar:clock-circle-bold', '#8B5CF6', r.cookTime + '\'', 'Süre')
    + _arcpStatCell('solar:users-group-rounded-bold', '#22C55E', r.servings, 'Kişi')
    + '</div>';

  /* ═── Section: Başlık & Açıklama ═── */
  h += _arcpEditorSection('solar:pen-new-round-bold', '#6366F1', 'Başlık & Açıklama',
    '<div class="arcp-field-group">'
    + '<label class="arcp-label">Tarif Başlığı</label>'
    + '<input class="arcp-input" id="arcpTitle_' + r.id + '" value="' + _arcpEsc(r.title) + '" />'
    + '</div>'
    + '<div class="arcp-field-group">'
    + '<label class="arcp-label">Açıklama</label>'
    + '<textarea class="arcp-textarea" id="arcpDesc_' + r.id + '" rows="3">' + _arcpEsc(r.description) + '</textarea>'
    + '</div>'
    + '<div class="arcp-field-group">'
    + '<label class="arcp-label">Hikaye</label>'
    + '<textarea class="arcp-textarea" id="arcpStory_' + r.id + '" rows="3">' + _arcpEsc(r.story) + '</textarea>'
    + '</div>'
  );

  /* ═── Section: Malzemeler ═── */
  var ingHtml = '';
  for (var mi = 0; mi < r.ingredients.length; mi++) {
    var ing = r.ingredients[mi];
    ingHtml += '<div class="arcp-ing-row">'
      + '<input class="arcp-input arcp-ing-name" value="' + _arcpEsc(ing.name) + '" data-recipe="' + r.id + '" data-idx="' + mi + '" data-field="name" onchange="_arcpEditIng(this)" />'
      + '<input class="arcp-input arcp-ing-amount" value="' + _arcpEsc(ing.amount) + '" data-recipe="' + r.id + '" data-idx="' + mi + '" data-field="amount" onchange="_arcpEditIng(this)" />'
      + '<button class="arcp-del-btn" onclick="_arcpDeleteIng(\'' + r.id + '\',' + mi + ')" title="Sil">'
      + '<iconify-icon icon="solar:trash-bin-minimalistic-bold" style="font-size:14px"></iconify-icon>'
      + '</button>'
      + '</div>';
  }
  ingHtml += '<button class="arcp-add-btn" onclick="_arcpAddIng(\'' + r.id + '\')">'
    + '<iconify-icon icon="solar:add-circle-bold" style="font-size:14px"></iconify-icon>Malzeme Ekle</button>';

  h += _arcpEditorSection('solar:cart-large-2-bold', '#F59E0B', 'Malzemeler (' + r.ingredients.length + ')', ingHtml);

  /* ═── Section: Yapılış Adımları ═── */
  var stepsHtml = '';
  for (var si2 = 0; si2 < r.steps.length; si2++) {
    stepsHtml += '<div class="arcp-step-row">'
      + '<span class="arcp-step-num">' + (si2 + 1) + '</span>'
      + '<textarea class="arcp-textarea arcp-step-input" rows="2" data-recipe="' + r.id + '" data-idx="' + si2 + '" onchange="_arcpEditStep(this)">' + _arcpEsc(r.steps[si2]) + '</textarea>'
      + '<button class="arcp-del-btn" onclick="_arcpDeleteStep(\'' + r.id + '\',' + si2 + ')" title="Sil">'
      + '<iconify-icon icon="solar:trash-bin-minimalistic-bold" style="font-size:14px"></iconify-icon>'
      + '</button>'
      + '</div>';
  }
  stepsHtml += '<button class="arcp-add-btn" onclick="_arcpAddStep(\'' + r.id + '\')">'
    + '<iconify-icon icon="solar:add-circle-bold" style="font-size:14px"></iconify-icon>Adım Ekle</button>';

  h += _arcpEditorSection('solar:list-check-bold', '#3B82F6', 'Yapılış Adımları (' + r.steps.length + ')', stepsHtml);

  /* ═── Section: Medya Yönetimi ═── */
  var mediaHtml = '<div style="display:flex;gap:8px;flex-wrap:wrap">';
  for (var mdi = 0; mdi < r.media.length; mdi++) {
    var md = r.media[mdi];
    mediaHtml += '<div class="arcp-media-item' + (md.flagged ? ' flagged' : '') + '">';
    if (md.type === 'photo') {
      mediaHtml += '<img src="' + md.url + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'" />';
    } else {
      mediaHtml += '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--bg-phone-secondary)">'
        + '<iconify-icon icon="solar:video-frame-play-vertical-bold" style="font-size:28px;color:var(--text-muted)"></iconify-icon>'
        + '</div>';
    }
    if (md.flagged) {
      mediaHtml += '<div class="arcp-media-flag"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:11px"></iconify-icon>İşaretli</div>';
    }
    mediaHtml += '<button class="arcp-media-remove" onclick="_arcpRemoveMedia(\'' + r.id + '\',' + mdi + ')" title="Kaldır">'
      + '<iconify-icon icon="solar:close-circle-bold" style="font-size:16px"></iconify-icon></button>'
      + '</div>';
  }
  mediaHtml += '</div>';

  h += _arcpEditorSection('solar:gallery-bold', '#EC4899', 'Medya (' + r.media.length + ')', mediaHtml);

  /* ═── Section: Besin Değerleri & Etiketler ═── */
  var nutrHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    + _arcpNutrInput(r.id, 'calories', 'Kalori (kcal)', r.nutrition.calories)
    + _arcpNutrInput(r.id, 'protein', 'Protein (g)', r.nutrition.protein)
    + _arcpNutrInput(r.id, 'carbs', 'Karbonhidrat (g)', r.nutrition.carbs)
    + _arcpNutrInput(r.id, 'fat', 'Yağ (g)', r.nutrition.fat)
    + _arcpNutrInput(r.id, 'fiber', 'Lif (g)', r.nutrition.fiber)
    + '</div>';

  /* Allergens */
  nutrHtml += '<div class="arcp-field-group" style="margin-top:10px">'
    + '<label class="arcp-label">Alerjen Etiketleri</label>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">';
  var allAllergens = ['Glüten','Süt Ürünleri','Yumurta','Fıstık','Susam','Soya','Kabuklu Deniz Ürünleri','Jelatin'];
  for (var ai = 0; ai < allAllergens.length; ai++) {
    var alr = allAllergens[ai];
    var isActive = r.allergens.indexOf(alr) !== -1;
    nutrHtml += '<button class="arcp-chip' + (isActive ? ' active' : '') + '" onclick="_arcpToggleAllergen(\'' + r.id + '\',\'' + alr + '\')">' + alr + '</button>';
  }
  nutrHtml += '</div></div>';

  /* Tags */
  nutrHtml += '<div class="arcp-field-group" style="margin-top:8px">'
    + '<label class="arcp-label">Etiketler</label>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">';
  for (var ti = 0; ti < r.tags.length; ti++) {
    nutrHtml += '<span class="arcp-tag">' + r.tags[ti]
      + '<span style="cursor:pointer;margin-left:4px;opacity:.6" onclick="_arcpRemoveTag(\'' + r.id + '\',' + ti + ')">×</span></span>';
  }
  nutrHtml += '<button class="arcp-add-btn" style="padding:4px 8px;font-size:11px" onclick="_arcpAddTag(\'' + r.id + '\')">'
    + '<iconify-icon icon="solar:add-circle-bold" style="font-size:12px"></iconify-icon>Etiket</button>'
    + '</div></div>';

  h += _arcpEditorSection('solar:heart-pulse-bold', '#22C55E', 'Besin Değerleri & Etiketler', nutrHtml);

  /* Reject reason (if rejected) */
  if (r.status === 'rejected' && r.rejectReason) {
    h += '<div style="padding:12px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:var(--r-lg)">'
      + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
      + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>'
      + '<span style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:#EF4444">Red Gerekçesi</span>'
      + '</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">' + r.rejectReason + '</div>'
      + '</div>';
  }

  h += '</div>'; /* end scroll body */

  /* ═── Action buttons (sticky bottom) ═── */
  h += '<div class="arcp-action-bar">';
  if (r.status !== 'approved') {
    h += '<button class="arcp-action-approve" onclick="_arcpAction(\'' + r.id + '\',\'approved\')">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px"></iconify-icon>Onayla ve Yayınla</button>';
  }
  if (r.status !== 'pending') {
    h += '<button class="arcp-action-draft" onclick="_arcpAction(\'' + r.id + '\',\'pending\')">'
      + '<iconify-icon icon="solar:pen-new-round-bold" style="font-size:16px"></iconify-icon>Taslağa Al</button>';
  }
  if (r.status === 'pending') {
    h += '<button class="arcp-action-draft" onclick="_arcpAction(\'' + r.id + '\',\'pending\')">'
      + '<iconify-icon icon="solar:letter-bold" style="font-size:16px"></iconify-icon>Düzenleme İste</button>';
  }
  h += '<button class="arcp-action-reject" onclick="_arcpAction(\'' + r.id + '\',\'rejected\')">'
    + '<iconify-icon icon="solar:trash-bin-minimalistic-bold" style="font-size:16px"></iconify-icon>Reddet / Sil</button>';
  h += '</div>';

  h += '</div>'; /* end root flex */

  ov.innerHTML = h;
}

/* ── Editor section wrapper ── */
function _arcpEditorSection(icon, color, title, content) {
  return '<div class="arcp-editor-section">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    + '<div style="width:28px;height:28px;border-radius:var(--r-md);background:' + color + '12;display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px;color:' + color + '"></iconify-icon></div>'
    + '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + title + '</span>'
    + '</div>'
    + content
    + '</div>';
}

function _arcpStatCell(icon, color, val, label) {
  return '<div style="text-align:center">'
    + '<div style="display:flex;align-items:center;justify-content:center;gap:3px">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px;color:' + color + '"></iconify-icon>'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + val + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-tertiary);margin-top:2px">' + label + '</div>'
    + '</div>';
}

function _arcpNutrInput(rid, key, label, val) {
  return '<div class="arcp-field-group">'
    + '<label class="arcp-label">' + label + '</label>'
    + '<input class="arcp-input" type="number" value="' + val + '" data-recipe="' + rid + '" data-key="' + key + '" onchange="_arcpEditNutr(this)" />'
    + '</div>';
}

/* ═══════════════════════════════════════
   DATA MUTATIONS
   ═══════════════════════════════════════ */
function _arcpGetRecipe(id) {
  for (var i = 0; i < ADMIN_RECIPES.length; i++) {
    if (ADMIN_RECIPES[i].id === id) return ADMIN_RECIPES[i];
  }
  return null;
}

function _arcpEditIng(el) {
  var r = _arcpGetRecipe(el.dataset.recipe);
  if (!r) return;
  var idx = parseInt(el.dataset.idx);
  r.ingredients[idx][el.dataset.field] = el.value;
}

function _arcpDeleteIng(rid, idx) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.ingredients.splice(idx, 1);
  _arcpRenderDetail(r);
}

function _arcpAddIng(rid) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.ingredients.push({ name: '', amount: '' });
  _arcpRenderDetail(r);
  /* Focus last ingredient */
  setTimeout(function() {
    var inputs = document.querySelectorAll('.arcp-ing-name');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  }, 50);
}

function _arcpEditStep(el) {
  var r = _arcpGetRecipe(el.dataset.recipe);
  if (!r) return;
  r.steps[parseInt(el.dataset.idx)] = el.value;
}

function _arcpDeleteStep(rid, idx) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.steps.splice(idx, 1);
  _arcpRenderDetail(r);
}

function _arcpAddStep(rid) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.steps.push('');
  _arcpRenderDetail(r);
  setTimeout(function() {
    var inputs = document.querySelectorAll('.arcp-step-input');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  }, 50);
}

function _arcpRemoveMedia(rid, idx) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.media.splice(idx, 1);
  _arcpRenderDetail(r);
}

function _arcpEditNutr(el) {
  var r = _arcpGetRecipe(el.dataset.recipe);
  if (!r) return;
  r.nutrition[el.dataset.key] = parseFloat(el.value) || 0;
}

function _arcpToggleAllergen(rid, alr) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  var idx = r.allergens.indexOf(alr);
  if (idx === -1) r.allergens.push(alr);
  else r.allergens.splice(idx, 1);
  _arcpRenderDetail(r);
}

function _arcpRemoveTag(rid, idx) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.tags.splice(idx, 1);
  _arcpRenderDetail(r);
}

function _arcpAddTag(rid) {
  var tag = prompt('Yeni etiket:');
  if (!tag || !tag.trim()) return;
  var r = _arcpGetRecipe(rid);
  if (!r) return;
  r.tags.push(tag.trim());
  _arcpRenderDetail(r);
}

/* ── Actions ── */
function _arcpAction(rid, newStatus) {
  var r = _arcpGetRecipe(rid);
  if (!r) return;

  if (newStatus === 'rejected') {
    var reason = prompt('Red gerekçesi (opsiyonel):');
    r.rejectReason = reason || '';
  }

  /* Save edited title/description/story from inputs */
  var titleEl = document.getElementById('arcpTitle_' + rid);
  var descEl  = document.getElementById('arcpDesc_' + rid);
  var storyEl = document.getElementById('arcpStory_' + rid);
  if (titleEl) r.title = titleEl.value;
  if (descEl) r.description = descEl.value;
  if (storyEl) r.story = storyEl.value;

  r.status = newStatus;

  var labels = { approved: 'onaylandı ve yayınlandı', pending: 'taslağa alındı', rejected: 'reddedildi' };
  _admToast('Tarif ' + (labels[newStatus] || 'güncellendi'), newStatus === 'approved' ? 'ok' : newStatus === 'rejected' ? 'err' : undefined);

  _arcpCloseDetail();
  renderAdminRecipes();
}

/* ═══════════════════════════════════════
   FILTER HELPERS
   ═══════════════════════════════════════ */
function _arcpRenderFilters() {
  var h = '<div class="arcp-filter-panel">';

  /* Sort */
  h += '<div class="arcp-filter-group">'
    + '<div class="arcp-filter-label">Sıralama</div>'
    + '<div style="display:flex;gap:4px;flex-wrap:wrap">'
    + _arcpSortChip('newest', 'En Yeni')
    + _arcpSortChip('oldest', 'En Eski')
    + _arcpSortChip('mostSaved', 'En Çok Kaydedilen')
    + _arcpSortChip('mostCommented', 'En Çok Yorum')
    + '</div></div>';

  /* Category */
  h += '<div class="arcp-filter-group">'
    + '<div class="arcp-filter-label">Kategori</div>'
    + '<div style="display:flex;gap:4px;flex-wrap:wrap">'
    + '<button class="arcp-chip' + (_arcp.categoryFilter === 'all' ? ' active' : '') + '" onclick="_arcpSetCategory(\'all\')">Tümü</button>';
  for (var i = 0; i < ADMIN_RECIPE_CATEGORIES.length; i++) {
    var ct = ADMIN_RECIPE_CATEGORIES[i];
    h += '<button class="arcp-chip' + (_arcp.categoryFilter === ct.key ? ' active' : '') + '" onclick="_arcpSetCategory(\'' + ct.key + '\')">' + ct.label + '</button>';
  }
  h += '</div></div>';

  if (_arcpHasFilters()) {
    h += '<button class="arcp-reset-btn" onclick="_arcpResetFilters()">'
      + '<iconify-icon icon="solar:restart-bold" style="font-size:13px"></iconify-icon>Filtreleri Temizle</button>';
  }

  h += '</div>';
  return h;
}

function _arcpSortChip(key, label) {
  return '<button class="arcp-chip' + (_arcp.sortBy === key ? ' active' : '') + '" onclick="_arcpSetSort(\'' + key + '\')">' + label + '</button>';
}

function _arcpHasFilters() {
  return _arcp.categoryFilter !== 'all' || _arcp.sortBy !== 'newest';
}

/* ═══════════════════════════════════════
   INTERACTIONS
   ═══════════════════════════════════════ */
function _arcpSearchChange(v) { _arcp.search = v; renderAdminRecipes(); }
function _arcpToggleFilters() { _arcp.filtersOpen = !_arcp.filtersOpen; renderAdminRecipes(); }
function _arcpSetStatus(s) { _arcp.statusFilter = s; renderAdminRecipes(); }
function _arcpSetSort(s) { _arcp.sortBy = s; renderAdminRecipes(); }
function _arcpSetCategory(c) { _arcp.categoryFilter = c; renderAdminRecipes(); }
function _arcpResetFilters() {
  _arcp.categoryFilter = 'all';
  _arcp.sortBy = 'newest';
  renderAdminRecipes();
}

/* ═══════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════ */
function _arcpEsc(s) { return (s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function _arcpRelTime(dateStr) {
  var d = new Date(dateStr);
  var now = new Date();
  var diff = Math.floor((now - d) / 60000);
  if (diff < 1) return 'Az önce';
  if (diff < 60) return diff + ' dk önce';
  var hrs = Math.floor(diff / 60);
  if (hrs < 24) return hrs + ' sa önce';
  var days = Math.floor(hrs / 24);
  if (days < 7) return days + ' gün önce';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function _arcpCatInfo(key) {
  for (var i = 0; i < ADMIN_RECIPE_CATEGORIES.length; i++) {
    if (ADMIN_RECIPE_CATEGORIES[i].key === key) return ADMIN_RECIPE_CATEGORIES[i];
  }
  return { key: key, label: key, icon: 'solar:chef-hat-bold', color: '#6B7280' };
}

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */
function _arcpInjectStyles() {
  if (document.getElementById('arcpStyles')) return;
  var s = document.createElement('style');
  s.id = 'arcpStyles';
  s.textContent = ''
    /* Search */
    + '.arcp-search{width:100%;padding:9px 10px 9px 34px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1 var(--font);background:var(--bg-phone);color:var(--text-primary);outline:none;transition:border .2s}'
    + '.arcp-search:focus{border-color:var(--primary)}'

    /* Icon btn */
    + '.arcp-icon-btn{width:38px;height:38px;border-radius:var(--r-lg);border:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--bg-phone);position:relative;transition:all .15s;color:var(--text-secondary)}'
    + '.arcp-icon-btn.active{background:var(--primary-soft);border-color:var(--primary);color:var(--primary)}'
    + '.arcp-filter-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--primary)}'

    /* Badge */
    + '.arcp-badge{font:var(--fw-semibold) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full)}'

    /* Tabs */
    + '.arcp-tab{padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;transition:all .15s}'
    + '.arcp-tab.active{background:var(--primary);color:#fff;border-color:var(--primary)}'
    + '.arcp-tab-count{font:var(--fw-bold) 10px/1 var(--font);opacity:.7}'

    /* Card */
    + '.arcp-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:12px;cursor:pointer;transition:all .15s;box-shadow:var(--shadow-sm)}'
    + '.arcp-card:active{transform:scale(0.98);opacity:.9}'

    /* Filter panel */
    + '.arcp-filter-panel{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:12px;display:flex;flex-direction:column;gap:10px}'
    + '.arcp-filter-group{display:flex;flex-direction:column;gap:5px}'
    + '.arcp-filter-label{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}'
    + '.arcp-chip{padding:5px 10px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;transition:all .15s}'
    + '.arcp-chip.active{background:var(--primary);color:#fff;border-color:var(--primary)}'
    + '.arcp-reset-btn{display:flex;align-items:center;justify-content:center;gap:4px;padding:7px;border-radius:var(--r-lg);border:none;background:rgba(239,68,68,0.08);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#EF4444;cursor:pointer}'

    /* Back btn */
    + '.arcp-back-btn{width:34px;height:34px;border-radius:var(--r-lg);background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer}'

    /* Editor section */
    + '.arcp-editor-section{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-sm)}'
    + '.arcp-field-group{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}'
    + '.arcp-field-group:last-child{margin-bottom:0}'
    + '.arcp-label{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.arcp-input{padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);background:var(--bg-phone);color:var(--text-primary);outline:none;transition:border .2s;width:100%;box-sizing:border-box}'
    + '.arcp-input:focus{border-color:var(--primary)}'
    + '.arcp-textarea{padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);background:var(--bg-phone);color:var(--text-primary);outline:none;resize:vertical;transition:border .2s;width:100%;box-sizing:border-box}'
    + '.arcp-textarea:focus{border-color:var(--primary)}'

    /* Ingredient row */
    + '.arcp-ing-row{display:flex;gap:6px;align-items:center;margin-bottom:6px}'
    + '.arcp-ing-name{flex:2}'
    + '.arcp-ing-amount{flex:1}'
    + '.arcp-del-btn{width:28px;height:28px;border-radius:var(--r-md);border:none;background:rgba(239,68,68,0.08);color:#EF4444;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s}'
    + '.arcp-del-btn:active{transform:scale(0.9)}'
    + '.arcp-add-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--r-full);border:1.5px dashed var(--border-subtle);background:transparent;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;transition:all .15s}'
    + '.arcp-add-btn:active{background:var(--primary-soft)}'

    /* Step row */
    + '.arcp-step-row{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}'
    + '.arcp-step-num{width:24px;height:24px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 11px/1 var(--font);flex-shrink:0;margin-top:6px}'
    + '.arcp-step-input{flex:1}'

    /* Media */
    + '.arcp-media-item{width:80px;height:80px;border-radius:var(--r-lg);overflow:hidden;position:relative;border:2px solid var(--border-subtle)}'
    + '.arcp-media-item.flagged{border-color:#EF4444}'
    + '.arcp-media-flag{position:absolute;bottom:0;left:0;right:0;background:rgba(239,68,68,0.9);color:#fff;font:var(--fw-semibold) 9px/1 var(--font);padding:3px;text-align:center;display:flex;align-items:center;justify-content:center;gap:2px}'
    + '.arcp-media-remove{position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s}'
    + '.arcp-media-item:hover .arcp-media-remove{opacity:1}'

    /* Tag */
    + '.arcp-tag{display:inline-flex;align-items:center;gap:2px;padding:4px 8px;border-radius:var(--r-full);background:var(--primary-soft);font:var(--fw-medium) 11px/1 var(--font);color:var(--primary)}'

    /* Action bar */
    + '.arcp-action-bar{display:flex;flex-direction:column;gap:6px;padding:12px 16px;border-top:1px solid var(--border-subtle);flex-shrink:0;background:var(--bg-phone)}'
    + '.arcp-action-approve{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:var(--r-lg);border:none;background:#22C55E;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;transition:all .15s}'
    + '.arcp-action-approve:active{transform:scale(0.97)}'
    + '.arcp-action-draft{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:var(--r-lg);border:1.5px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-primary);font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;transition:all .15s}'
    + '.arcp-action-draft:active{transform:scale(0.97)}'
    + '.arcp-action-reject{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:var(--r-lg);border:1.5px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:#EF4444;font:var(--fw-medium) var(--fs-xs)/1 var(--font);cursor:pointer;transition:all .15s}'
    + '.arcp-action-reject:active{transform:scale(0.97)}';

  document.head.appendChild(s);
}

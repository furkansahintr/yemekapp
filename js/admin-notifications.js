/* ═══════════════════════════════════════════════════════════
   ADMIN NOTIFICATIONS — Bildirim Merkezi
   (Automation Center • 3 Kanal Wizard: Kanal→Kitle→İçerik→Onay)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _not = {
  view: 'home',                // 'home' | 'audience' | 'content'
  channel: null,               // 'mail' | 'sms' | 'push'
  // Automation
  expandedGroups: {},          // { grp_order: true }
  editingScenarioId: null,
  editingText: '',
  // Wizard
  audience: {
    all: false,
    selectedIds: [],
    search: '',
    cityFilter: '',
    statusFilters: [],
    activityFilter: ''
  },
  content: {
    subject: '',
    body: '',
    imageUrl: ''
  },
  confirmOpen: false
};

/* ═══ Overlay Aç ═══ */
function _admOpenNotifications() {
  _admInjectStyles();
  _notInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'notOverlay';
  adminPhone.appendChild(overlay);

  _notResetWizard();
  _not.view = 'home';
  _notRender();
}

function _notCloseOverlay() {
  var o = document.getElementById('notOverlay');
  if (o) o.remove();
  _notCloseEditModal();
  _notCloseConfirm();
}

function _notResetWizard() {
  _not.channel = null;
  _not.audience = {
    all: false, selectedIds: [], search: '',
    cityFilter: '', statusFilters: [], activityFilter: ''
  };
  _not.content = { subject: '', body: '', imageUrl: '' };
}

/* ═══ Ana Render ═══ */
function _notRender() {
  var o = document.getElementById('notOverlay');
  if (!o) return;

  var title, sub, showBack;
  if (_not.view === 'home') { title = 'Bildirim Merkezi'; sub = 'Otomasyon + toplu gönderim'; showBack = false; }
  else if (_not.view === 'audience') { title = 'Kime Gönderilecek?'; sub = 'Adım 1/3 · Hedef kitle'; showBack = true; }
  else if (_not.view === 'content') { title = 'İçerik Oluştur'; sub = 'Adım 2/3 · Metin ve görsel'; showBack = true; }

  var h = '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="' + (showBack ? '_notGoBack()' : '_notCloseOverlay()') + '">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:bell-bing-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + title + '</div>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + sub + '</div>'
    + '</div>'
    + '</div>'
    + '<div id="notBody" style="flex:1"></div>';
  o.innerHTML = h;
  _notRenderBody();
}

function _notRenderBody() {
  var body = document.getElementById('notBody');
  if (!body) return;

  if (_not.view === 'home') body.innerHTML = _notRenderHome();
  else if (_not.view === 'audience') body.innerHTML = _notRenderAudience();
  else if (_not.view === 'content') body.innerHTML = _notRenderContent();
}

function _notGoBack() {
  if (_not.view === 'content') { _not.view = 'audience'; _notRender(); return; }
  if (_not.view === 'audience') { _not.view = 'home'; _notResetWizard(); _notRender(); return; }
  _notCloseOverlay();
}

/* ═══ Helpers ═══ */
function _notEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _notChannel(id) {
  for (var i = 0; i < ADMIN_NOTIF_CHANNELS.length; i++) {
    if (ADMIN_NOTIF_CHANNELS[i].id === id) return ADMIN_NOTIF_CHANNELS[i];
  }
  return null;
}

function _notFindScenario(id) {
  for (var i = 0; i < ADMIN_NOTIF_AUTOMATION.length; i++) {
    var g = ADMIN_NOTIF_AUTOMATION[i];
    for (var j = 0; j < g.scenarios.length; j++) {
      if (g.scenarios[j].id === id) return g.scenarios[j];
    }
  }
  return null;
}

function _notExpandText(text) {
  // {degisken} -> highlighted span
  return _notEsc(text).replace(/\{([a-z_]+)\}/g, function(_m, p) {
    return '<span class="not-var-chip">{' + p + '}</span>';
  });
}

function _notFillTemplate(text, data) {
  // demo: replace with examples
  for (var i = 0; i < ADMIN_NOTIF_VARIABLES.length; i++) {
    var v = ADMIN_NOTIF_VARIABLES[i];
    text = text.split(v.token).join((data && data[v.token]) || v.example);
  }
  return text;
}

function _notChannelSelect(ch) {
  _not.channel = ch;
  _not.view = 'audience';
  _notRender();
}

/* ═══════════════════════════════════════
   P2 — Ana Ekran (Automation + Kanallar)
   ═══════════════════════════════════════ */
function _notRenderHome() {
  var h = '<div class="adm-fadeIn not-wrap">';

  // Automation Center Box (üstte)
  h += _notRenderAutomationBox();

  // Manuel Gönderim başlık
  h += '<div class="not-section-heading">'
    + '<iconify-icon icon="solar:confetti-minimalistic-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>'
    + '<span>Manuel Gönderim</span>'
    + '<span class="not-section-sub">Anlık kampanya ve duyuru</span>'
    + '</div>';

  // 3 Kanal Tile
  h += '<div class="not-channels">';
  for (var i = 0; i < ADMIN_NOTIF_CHANNELS.length; i++) {
    var c = ADMIN_NOTIF_CHANNELS[i];
    h += '<button class="not-channel-tile" style="--not-c:' + c.color + '" onclick="_notChannelSelect(\'' + c.id + '\')">'
      + '<div class="not-ch-bg" style="background:' + c.gradient + '"></div>'
      + '<div class="not-ch-ico" style="background:' + c.gradient + '">'
      + '<iconify-icon icon="' + c.icon + '" style="font-size:24px;color:#fff"></iconify-icon>'
      + '</div>'
      + '<div class="not-ch-body">'
      + '<div class="not-ch-label">' + _notEsc(c.label) + '</div>'
      + '<div class="not-ch-desc">' + _notEsc(c.description) + '</div>'
      + '</div>'
      + '<iconify-icon icon="solar:arrow-right-linear" class="not-ch-arrow"></iconify-icon>'
      + '</button>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   P3 — Automation Center (Accordion)
   ═══════════════════════════════════════ */
function _notRenderAutomationBox() {
  // Özet sayılar
  var totalScenarios = 0, activeScenarios = 0;
  for (var i = 0; i < ADMIN_NOTIF_AUTOMATION.length; i++) {
    var g = ADMIN_NOTIF_AUTOMATION[i];
    for (var j = 0; j < g.scenarios.length; j++) {
      totalScenarios++;
      if (g.scenarios[j].active) activeScenarios++;
    }
  }

  var h = '<div class="not-auto-box">'
    + '<div class="not-auto-head">'
    + '<div class="not-auto-ico"><iconify-icon icon="solar:settings-minimalistic-bold" style="font-size:20px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="not-auto-title">Dinamik Bildirim Yönetimi</div>'
    + '<div class="not-auto-sub">Sistem tetikleyicilere göre otomatik gönderilir</div>'
    + '</div>'
    + '<div class="not-auto-stats">'
    + '<span class="not-auto-stat-val">' + activeScenarios + '<span class="not-auto-stat-tot">/' + totalScenarios + '</span></span>'
    + '<span class="not-auto-stat-lbl">aktif</span>'
    + '</div>'
    + '</div>';

  // Accordion groups
  h += '<div class="not-auto-groups">';
  for (var g2 = 0; g2 < ADMIN_NOTIF_AUTOMATION.length; g2++) {
    var grp = ADMIN_NOTIF_AUTOMATION[g2];
    var expanded = !!_not.expandedGroups[grp.id];
    var grpActive = grp.scenarios.filter(function(s) { return s.active; }).length;

    h += '<div class="not-auto-grp' + (expanded ? ' open' : '') + '">'
      + '<div class="not-auto-grp-head" onclick="_notToggleGroup(\'' + grp.id + '\')">'
      + '<div class="not-auto-grp-ico" style="background:' + grp.color + '18;color:' + grp.color + '">'
      + '<iconify-icon icon="' + grp.icon + '" style="font-size:15px"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="not-auto-grp-title">' + _notEsc(grp.label) + '</div>'
      + '<div class="not-auto-grp-sub">' + grpActive + '/' + grp.scenarios.length + ' aktif senaryo</div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-down-linear" class="not-auto-chev"></iconify-icon>'
      + '</div>';

    if (expanded) {
      h += '<div class="not-auto-scenarios">';
      for (var s = 0; s < grp.scenarios.length; s++) {
        h += _notScenarioRow(grp, grp.scenarios[s]);
      }
      h += '</div>';
    }
    h += '</div>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

function _notScenarioRow(grp, sc) {
  var ch = _notChannel(sc.channel) || { label: sc.channel, icon:'solar:bell-bold', color:'#6B7280' };
  return '<div class="not-scn-row' + (sc.active ? '' : ' not-scn-row--off') + '">'
    + '<div style="flex:1;min-width:0">'
    + '<div class="not-scn-head">'
    + '<span class="not-scn-label">' + _notEsc(sc.label) + '</span>'
    + '<span class="not-scn-ch" style="color:' + ch.color + ';background:' + ch.color + '15">'
    + '<iconify-icon icon="' + ch.icon + '" style="font-size:10px"></iconify-icon>'
    + ch.label.split(' ')[0]
    + '</span>'
    + '</div>'
    + '<div class="not-scn-text">' + _notExpandText(sc.text) + '</div>'
    + '</div>'
    + '<div class="not-scn-actions">'
    + '<button class="not-scn-edit" onclick="_notOpenEditScenario(\'' + sc.id + '\')" title="Düzenle"><iconify-icon icon="solar:pen-linear" style="font-size:13px"></iconify-icon></button>'
    + '<div class="not-toggle' + (sc.active ? ' on' : '') + '" onclick="_notToggleScenario(\'' + sc.id + '\')"><div class="not-toggle-dot"></div></div>'
    + '</div>'
    + '</div>';
}

function _notToggleGroup(id) {
  _not.expandedGroups[id] = !_not.expandedGroups[id];
  _notRenderBody();
}

function _notToggleScenario(id) {
  var sc = _notFindScenario(id);
  if (!sc) return;
  sc.active = !sc.active;
  _admToast(sc.label + (sc.active ? ' aktif' : ' pasif'), 'ok');
  _notRenderBody();
}

/* ═══════════════════════════════════════
   P4 — Senaryo Düzenleme Modal
   ═══════════════════════════════════════ */
function _notOpenEditScenario(id) {
  _notCloseEditModal();
  var sc = _notFindScenario(id);
  if (!sc) return;
  _not.editingScenarioId = id;
  _not.editingText = sc.text;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'notEditModal';
  m.className = 'not-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _notCloseEditModal(); };
  m.innerHTML = '<div class="not-modal"><div id="notEditBody" class="not-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _notRenderEditModal();
}

function _notCloseEditModal() {
  var m = document.getElementById('notEditModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _not.editingScenarioId = null;
  _not.editingText = '';
}

function _notRenderEditModal() {
  var body = document.getElementById('notEditBody');
  if (!body) return;
  var sc = _notFindScenario(_not.editingScenarioId);
  if (!sc) return;
  var ch = _notChannel(sc.channel) || {};

  var h = '<div class="not-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div class="not-mhead-ico" style="background:' + (ch.gradient || 'linear-gradient(135deg,#8B5CF6,#A78BFA)') + '">'
    + '<iconify-icon icon="solar:pen-new-square-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div><div class="not-mtitle">' + _notEsc(sc.label) + '</div>'
    + '<div class="not-msub">' + (ch.label || '') + ' · ' + ADMIN_NOTIF_VARIABLES.length + ' değişken kullanılabilir</div></div>'
    + '</div>'
    + '<div class="not-close" onclick="_notCloseEditModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Metin editor
  h += '<div class="not-field">'
    + '<label><iconify-icon icon="solar:text-bold" style="font-size:11px"></iconify-icon>Bildirim Metni</label>'
    + '<textarea class="not-textarea" id="notEditTextarea" placeholder="Metni buraya yazın..." oninput="_not.editingText=this.value;_notRenderEditPreview()">' + _notEsc(_not.editingText) + '</textarea>'
    + '</div>';

  // Değişken chip'leri
  h += '<div class="not-field">'
    + '<label><iconify-icon icon="solar:hashtag-bold" style="font-size:11px"></iconify-icon>Dinamik Değişkenler <span class="not-lbl-hint">(tıklayarak ekle)</span></label>'
    + '<div class="not-var-list">';
  for (var i = 0; i < ADMIN_NOTIF_VARIABLES.length; i++) {
    var v = ADMIN_NOTIF_VARIABLES[i];
    h += '<button class="not-var-btn" onclick="_notInsertVariable(\'' + v.token + '\')">'
      + '<span class="not-var-token">' + v.token + '</span>'
      + '<span class="not-var-ex">' + _notEsc(v.example) + '</span>'
      + '</button>';
  }
  h += '</div></div>';

  // Önizleme
  h += '<div class="not-field">'
    + '<label><iconify-icon icon="solar:eye-bold" style="font-size:11px;color:#22C55E"></iconify-icon>Canlı Önizleme</label>'
    + '<div class="not-preview-box" id="notEditPreview">'
    + _notFillTemplate(_notEsc(_not.editingText), null)
    + '</div>'
    + '</div>';

  // Kaydet + Sıfırla
  h += '<div class="not-mactions">'
    + '<button class="not-secondary-btn" onclick="_notResetScenarioText()">'
    + '<iconify-icon icon="solar:refresh-linear" style="font-size:13px"></iconify-icon>Varsayılana Dön</button>'
    + '<button class="not-cta" onclick="_notSaveScenarioText()">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:15px"></iconify-icon>Kaydet</button>'
    + '</div>';

  body.innerHTML = h;
}

function _notInsertVariable(token) {
  var ta = document.getElementById('notEditTextarea');
  if (!ta) return;
  var start = ta.selectionStart;
  var end = ta.selectionEnd;
  var txt = _not.editingText;
  _not.editingText = txt.slice(0, start) + token + txt.slice(end);
  ta.value = _not.editingText;
  var newPos = start + token.length;
  ta.setSelectionRange(newPos, newPos);
  ta.focus();
  _notRenderEditPreview();
}

function _notRenderEditPreview() {
  var p = document.getElementById('notEditPreview');
  if (!p) return;
  p.innerHTML = _notFillTemplate(_notEsc(_not.editingText), null);
}

function _notResetScenarioText() {
  // "Varsayılan" kavramı prototip için: sadece toast
  _admToast('Varsayılan metinleri sunucudan yükleme yakında', 'err');
}

function _notSaveScenarioText() {
  var sc = _notFindScenario(_not.editingScenarioId);
  if (!sc) return;
  if (!_not.editingText.trim()) { _admToast('Metin boş olamaz', 'err'); return; }
  sc.text = _not.editingText.trim();
  _admToast(sc.label + ' güncellendi', 'ok');
  _notCloseEditModal();
  _notRenderBody();
}

/* ═══════════════════════════════════════
   P5 — Wizard Adım 1: Kitle Seçimi
   ═══════════════════════════════════════ */
function _notRenderAudience() {
  var ch = _notChannel(_not.channel);
  var filtered = _notFilterUsers();
  var selectedCount = _not.audience.all ? _notAllAudience().length : _not.audience.selectedIds.length;

  var h = '<div class="adm-fadeIn not-wrap">';

  // Kanal özeti pill
  h += '<div class="not-ch-pill" style="background:' + (ch.gradient || '#8B5CF6') + '">'
    + '<iconify-icon icon="' + ch.icon + '" style="font-size:14px"></iconify-icon>'
    + '<span>' + _notEsc(ch.label) + '</span>'
    + '</div>';

  // Seçilen özet (sticky)
  h += '<div class="not-sel-summary">'
    + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>'
    + '<span class="not-sel-count">' + selectedCount + ' kişi seçili</span>'
    + (selectedCount > 0 ? '<button class="not-sel-clear" onclick="_notClearAudience()">Temizle</button>' : '')
    + '</div>';

  // Tümünü seç
  h += '<button class="not-all-btn' + (_not.audience.all ? ' active' : '') + '" onclick="_notToggleAll()">'
    + '<div class="not-all-ico"><iconify-icon icon="' + (_not.audience.all ? 'solar:check-circle-bold' : 'solar:users-group-two-rounded-linear') + '" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0;text-align:left">'
    + '<div class="not-all-title">Tümünü Seç</div>'
    + '<div class="not-all-sub">Platformdaki tüm kullanıcılar (' + _notAllAudience().length + ' kişi)</div>'
    + '</div>'
    + '</button>';

  // Arama
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="not-search" placeholder="Kullanıcı adı veya ID ile ara..." value="' + _notEsc(_not.audience.search) + '" oninput="_not.audience.search=this.value;_notRenderBody()" />'
    + '</div>';

  // Filtreler
  h += '<div class="not-filters">';

  // Konum
  h += '<div class="not-filter-group">'
    + '<div class="not-filter-lbl"><iconify-icon icon="solar:map-point-linear" style="font-size:11px"></iconify-icon>Konum</div>'
    + '<div class="not-chip-row">'
    + '<button class="not-chip' + (!_not.audience.cityFilter ? ' active' : '') + '" onclick="_not.audience.cityFilter=\'\';_notRenderBody()">Tümü</button>';
  for (var c = 0; c < ADMIN_NOTIF_FILTERS.cities.length; c++) {
    var city = ADMIN_NOTIF_FILTERS.cities[c];
    var sel = _not.audience.cityFilter === city;
    h += '<button class="not-chip' + (sel ? ' active' : '') + '" onclick="_not.audience.cityFilter=\'' + city + '\';_notRenderBody()">' + city + '</button>';
  }
  h += '</div></div>';

  // Durum (multi)
  h += '<div class="not-filter-group">'
    + '<div class="not-filter-lbl"><iconify-icon icon="solar:user-check-linear" style="font-size:11px"></iconify-icon>Durum <span class="not-lbl-hint">(çoklu seçim)</span></div>'
    + '<div class="not-chip-row">';
  for (var s = 0; s < ADMIN_NOTIF_FILTERS.statuses.length; s++) {
    var st = ADMIN_NOTIF_FILTERS.statuses[s];
    var selS = _not.audience.statusFilters.indexOf(st.id) > -1;
    h += '<button class="not-chip' + (selS ? ' active' : '') + '" '
      + 'style="' + (selS ? 'border-color:' + st.color + ';background:' + st.color + '18;color:' + st.color : '') + '" '
      + 'onclick="_notToggleStatus(\'' + st.id + '\')">'
      + '<iconify-icon icon="' + st.icon + '" style="font-size:11px"></iconify-icon>' + _notEsc(st.label) + '</button>';
  }
  h += '</div></div>';

  // Aktivite
  h += '<div class="not-filter-group">'
    + '<div class="not-filter-lbl"><iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>Aktivite</div>'
    + '<div class="not-chip-row">'
    + '<button class="not-chip' + (!_not.audience.activityFilter ? ' active' : '') + '" onclick="_not.audience.activityFilter=\'\';_notRenderBody()">Tümü</button>';
  for (var ap = 0; ap < ADMIN_NOTIF_FILTERS.activityPresets.length; ap++) {
    var ps = ADMIN_NOTIF_FILTERS.activityPresets[ap];
    var selA = _not.audience.activityFilter === ps.id;
    h += '<button class="not-chip' + (selA ? ' active' : '') + '" onclick="_not.audience.activityFilter=\'' + ps.id + '\';_notRenderBody()">' + _notEsc(ps.label) + '</button>';
  }
  h += '</div></div>';
  h += '</div>';

  // Filtre sonucu
  var hasFilter = _not.audience.search || _not.audience.cityFilter || _not.audience.statusFilters.length > 0 || _not.audience.activityFilter;
  if (hasFilter) {
    h += '<div class="not-filter-result">'
      + '<div>'
      + '<iconify-icon icon="solar:filter-bold" style="font-size:13px;color:#8B5CF6"></iconify-icon>'
      + '<span><b>' + filtered.length + '</b> kullanıcı filtreyle eşleşiyor</span>'
      + '</div>'
      + (filtered.length > 0 ? '<button class="not-add-all" onclick="_notAddFilteredToSelection()"><iconify-icon icon="solar:add-circle-bold" style="font-size:13px"></iconify-icon>Listenin Tamamını Ekle</button>' : '')
      + '</div>';

    // Liste (ilk 8)
    h += '<div class="not-user-list">';
    if (filtered.length === 0) {
      h += '<div class="not-empty-mini">Eşleşme yok</div>';
    }
    var shown = Math.min(filtered.length, 8);
    for (var u = 0; u < shown; u++) {
      var usr = filtered[u];
      var selU = _not.audience.selectedIds.indexOf(usr.id) > -1 || _not.audience.all;
      h += '<div class="not-user-item' + (selU ? ' selected' : '') + '" onclick="_notToggleUser(\'' + usr.id + '\')">'
        + '<div class="not-user-avatar">' + _notEsc(usr.name.charAt(0)) + '</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div class="not-user-name">' + _notEsc(usr.name) + '</div>'
        + '<div class="not-user-meta">' + _notEsc(usr.city || '') + (usr.isPremium ? ' · Premium' : '') + '</div>'
        + '</div>'
        + '<div class="not-check' + (selU ? ' checked' : '') + '"><iconify-icon icon="solar:check-bold" style="font-size:11px"></iconify-icon></div>'
        + '</div>';
    }
    if (filtered.length > shown) h += '<div class="not-empty-mini">…ve ' + (filtered.length - shown) + ' kullanıcı daha</div>';
    h += '</div>';
  }

  // CTA
  var ready = selectedCount > 0;
  h += '<button class="not-cta not-cta--wizard' + (ready ? '' : ' disabled') + '" ' + (ready ? '' : 'disabled ') + 'onclick="_notGoToContent()">'
    + '<iconify-icon icon="solar:arrow-right-bold" style="font-size:15px"></iconify-icon>'
    + 'Devam Et ' + (selectedCount > 0 ? '(' + selectedCount + ' kişi)' : '') + '</button>';

  h += '</div>';
  return h;
}

function _notAllAudience() {
  return (typeof ADMIN_USERS !== 'undefined' ? ADMIN_USERS : []);
}

function _notFilterUsers() {
  var list = _notAllAudience().slice();
  var a = _not.audience;

  if (a.search.trim()) {
    var q = a.search.toLowerCase().trim();
    list = list.filter(function(u) {
      return (u.name && u.name.toLowerCase().indexOf(q) > -1)
        || (u.id && u.id.toLowerCase().indexOf(q) > -1);
    });
  }
  if (a.cityFilter) list = list.filter(function(u) { return u.city === a.cityFilter; });

  if (a.statusFilters.length > 0) {
    list = list.filter(function(u) {
      return a.statusFilters.some(function(sf) {
        if (sf === 'premium') return u.isPremium;
        if (sf === 'chef')    return u.posts && u.posts.length > 0;
        if (sf === 'biz')     return u.name && u.name.indexOf('Usta') > -1; // demo heuristic
        if (sf === 'active')  return u.lastActive && (Date.now() - new Date(u.lastActive).getTime() < 7 * 86400000);
        return false;
      });
    });
  }

  if (a.activityFilter) {
    var preset = ADMIN_NOTIF_FILTERS.activityPresets.find(function(p) { return p.id === a.activityFilter; });
    if (preset) {
      list = list.filter(function(u) {
        if (!u.lastActive) return false;
        var diffDays = (Date.now() - new Date(u.lastActive).getTime()) / 86400000;
        if (preset.days < 0) return diffDays >= Math.abs(preset.days);
        return diffDays <= preset.days;
      });
    }
  }
  return list;
}

function _notToggleAll() {
  _not.audience.all = !_not.audience.all;
  if (_not.audience.all) _not.audience.selectedIds = [];
  _notRenderBody();
}

function _notToggleUser(id) {
  if (_not.audience.all) _not.audience.all = false;
  var idx = _not.audience.selectedIds.indexOf(id);
  if (idx > -1) _not.audience.selectedIds.splice(idx, 1);
  else _not.audience.selectedIds.push(id);
  _notRenderBody();
}

function _notToggleStatus(id) {
  var idx = _not.audience.statusFilters.indexOf(id);
  if (idx > -1) _not.audience.statusFilters.splice(idx, 1);
  else _not.audience.statusFilters.push(id);
  _notRenderBody();
}

function _notAddFilteredToSelection() {
  var filtered = _notFilterUsers();
  _not.audience.all = false;
  for (var i = 0; i < filtered.length; i++) {
    if (_not.audience.selectedIds.indexOf(filtered[i].id) === -1) {
      _not.audience.selectedIds.push(filtered[i].id);
    }
  }
  _admToast(filtered.length + ' kullanıcı eklendi', 'ok');
  _notRenderBody();
}

function _notClearAudience() {
  _not.audience.all = false;
  _not.audience.selectedIds = [];
  _notRenderBody();
}

function _notGoToContent() {
  _not.view = 'content';
  _notRender();
}

/* ═══════════════════════════════════════
   P6 — Wizard Adım 2: İçerik
   ═══════════════════════════════════════ */
function _notRenderContent() {
  var ch = _notChannel(_not.channel);
  var isMail = _not.channel === 'mail';
  var charLimit = ch.charLimit || null;
  var body = _not.content.body || '';
  var remaining = charLimit ? (charLimit - body.length) : null;
  var charColor = remaining === null ? ''
    : remaining < 0 ? '#EF4444'
    : remaining < 20 ? '#F97316'
    : '#22C55E';

  var h = '<div class="adm-fadeIn not-wrap">';

  // Kanal özeti
  h += '<div class="not-ch-pill" style="background:' + (ch.gradient || '#8B5CF6') + '">'
    + '<iconify-icon icon="' + ch.icon + '" style="font-size:14px"></iconify-icon>'
    + '<span>' + _notEsc(ch.label) + '</span>'
    + '</div>';

  // İçerik form
  if (isMail) {
    // Konu
    h += '<div class="not-field">'
      + '<label><iconify-icon icon="solar:text-square-linear" style="font-size:11px"></iconify-icon>Konu</label>'
      + '<input class="not-input" placeholder="Mail konusu" value="' + _notEsc(_not.content.subject) + '" oninput="_not.content.subject=this.value;_notRenderContentPreview()" />'
      + '</div>';

    // Görsel yükleme alanı (placeholder)
    h += '<div class="not-field">'
      + '<label><iconify-icon icon="solar:gallery-linear" style="font-size:11px"></iconify-icon>Görsel <span class="not-lbl-hint">(opsiyonel)</span></label>'
      + '<div class="not-upload" onclick="_notPickImage()">'
      + (_not.content.imageUrl
          ? '<div class="not-upload-preview"><iconify-icon icon="solar:gallery-bold" style="font-size:28px;color:#3B82F6"></iconify-icon><span>' + _notEsc(_not.content.imageUrl) + '</span><button class="not-upload-clear" onclick="event.stopPropagation();_not.content.imageUrl=\'\';_notRenderBody()">✕</button></div>'
          : '<iconify-icon icon="solar:upload-bold" style="font-size:28px;color:var(--text-muted)"></iconify-icon><span>Görsel seçmek için tıkla</span>')
      + '</div>'
      + '</div>';

    // Body
    h += '<div class="not-field">'
      + '<label><iconify-icon icon="solar:document-text-linear" style="font-size:11px"></iconify-icon>Metin İçeriği</label>'
      + '<textarea class="not-textarea not-textarea--lg" placeholder="Mailinizin gövde metnini yazın..." oninput="_not.content.body=this.value;_notRenderContentPreview()">' + _notEsc(_not.content.body) + '</textarea>'
      + '</div>';
  } else {
    // SMS/Push — tek textarea + char counter
    h += '<div class="not-field">'
      + '<div style="display:flex;align-items:center;justify-content:space-between">'
      + '<label style="margin-bottom:0"><iconify-icon icon="solar:text-bold" style="font-size:11px"></iconify-icon>' + (_not.channel === 'sms' ? 'SMS Metni' : 'Bildirim Metni') + '</label>'
      + (charLimit ? '<span class="not-char-counter" style="color:' + charColor + '">' + body.length + '/' + charLimit + '</span>' : '')
      + '</div>'
      + '<textarea class="not-textarea not-textarea--lg" maxlength="' + ((charLimit || 0) + 20) + '" placeholder="' + (_not.channel === 'sms' ? 'SMS metninizi yazın (160 karakter ideal)...' : 'Push bildirim metniniz...') + '" oninput="_not.content.body=this.value;_notRenderBody()">' + _notEsc(_not.content.body) + '</textarea>'
      + '</div>';
  }

  // Değişken chip'leri
  h += '<div class="not-field">'
    + '<label><iconify-icon icon="solar:hashtag-bold" style="font-size:11px"></iconify-icon>Değişkenler <span class="not-lbl-hint">(tıklayarak ekle)</span></label>'
    + '<div class="not-var-list">';
  for (var i = 0; i < ADMIN_NOTIF_VARIABLES.length; i++) {
    var v = ADMIN_NOTIF_VARIABLES[i];
    h += '<button class="not-var-btn" onclick="_notInsertContentVar(\'' + v.token + '\')">'
      + '<span class="not-var-token">' + v.token + '</span>'
      + '</button>';
  }
  h += '</div></div>';

  // Canlı Önizleme
  h += '<div class="not-field">'
    + '<label><iconify-icon icon="solar:eye-bold" style="font-size:11px;color:#22C55E"></iconify-icon>Canlı Önizleme</label>'
    + '<div id="notContentPreview">' + _notRenderLivePreview() + '</div>'
    + '</div>';

  // CTA — Yayınla
  var ready = body.trim().length > 0 && (!isMail || _not.content.subject.trim().length > 0);
  h += '<button class="not-cta not-cta--publish' + (ready ? '' : ' disabled') + '" ' + (ready ? '' : 'disabled ') + 'onclick="_notOpenConfirm()">'
    + '<iconify-icon icon="solar:rocket-bold" style="font-size:16px"></iconify-icon>'
    + 'Yayınla</button>';

  h += '</div>';
  return h;
}

function _notRenderLivePreview() {
  var ch = _notChannel(_not.channel);
  var body = _notFillTemplate(_notEsc(_not.content.body || '(boş)'), null);

  if (_not.channel === 'mail') {
    var subj = _notFillTemplate(_notEsc(_not.content.subject || '(konu)'), null);
    return '<div class="not-mock-mail">'
      + '<div class="not-mock-mail-head">'
      + '<div class="not-mock-mail-logo"><iconify-icon icon="solar:chef-hat-heart-bold" style="font-size:16px;color:#fff"></iconify-icon></div>'
      + '<div><div class="not-mock-mail-from">YemekApp &lt;no-reply@yemekapp.com&gt;</div>'
      + '<div class="not-mock-mail-subject">' + subj + '</div></div>'
      + '</div>'
      + (_not.content.imageUrl ? '<div class="not-mock-mail-img"><iconify-icon icon="solar:gallery-bold" style="font-size:32px;color:#8B5CF6"></iconify-icon></div>' : '')
      + '<div class="not-mock-mail-body">' + body + '</div>'
      + '</div>';
  }

  if (_not.channel === 'sms') {
    return '<div class="not-mock-sms">'
      + '<div class="not-mock-sms-sender">YEMEKAPP</div>'
      + '<div class="not-mock-sms-bubble">' + body + '</div>'
      + '<div class="not-mock-sms-meta">şimdi · ücretsiz sms</div>'
      + '</div>';
  }

  // Push
  return '<div class="not-mock-push">'
    + '<div class="not-mock-push-head">'
    + '<div class="not-mock-push-ico"><iconify-icon icon="solar:chef-hat-heart-bold" style="font-size:14px;color:#fff"></iconify-icon></div>'
    + '<span class="not-mock-push-app">YemekApp</span>'
    + '<span class="not-mock-push-time">şimdi</span>'
    + '</div>'
    + '<div class="not-mock-push-body">' + body + '</div>'
    + '</div>';
}

function _notRenderContentPreview() {
  var p = document.getElementById('notContentPreview');
  if (!p) return;
  p.innerHTML = _notRenderLivePreview();
  // Char counter de güncellensin
  var cc = document.querySelector('.not-char-counter');
  if (cc) {
    var ch = _notChannel(_not.channel);
    var limit = ch.charLimit;
    var len = (_not.content.body || '').length;
    cc.textContent = len + '/' + limit;
    cc.style.color = len > limit ? '#EF4444' : len > limit - 20 ? '#F97316' : '#22C55E';
  }
}

function _notInsertContentVar(token) {
  _not.content.body = (_not.content.body || '') + ' ' + token;
  _notRenderBody();
}

function _notPickImage() {
  // Prototip — seçim simülasyonu
  var choices = ['promo-banner-1.jpg', 'campaign-hero.png', 'newsletter-cover.jpg'];
  var img = choices[Math.floor(Math.random() * choices.length)];
  _not.content.imageUrl = img;
  _admToast('Görsel seçildi: ' + img, 'ok');
  _notRenderBody();
}

/* ═══════════════════════════════════════
   P7 — Onay Modal (Güvenlik Balonu)
   ═══════════════════════════════════════ */
function _notOpenConfirm() {
  _notCloseConfirm();
  _not.confirmOpen = true;
  var ch = _notChannel(_not.channel);
  var count = _not.audience.all ? _notAllAudience().length : _not.audience.selectedIds.length;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'notConfirm';
  m.className = 'not-modal-backdrop not-modal-backdrop--confirm';
  m.onclick = function(e) { if (e.target === m) _notCloseConfirm(); };

  var preview = _notRenderLivePreview();

  var h = '<div class="not-modal not-modal--confirm">'

    // Header
    + '<div class="not-confirm-head" style="background:' + (ch.gradient || '#8B5CF6') + '">'
    + '<div class="not-confirm-head-ico"><iconify-icon icon="solar:rocket-bold" style="font-size:26px;color:#fff"></iconify-icon></div>'
    + '<div class="not-confirm-title">Gönderim Onayı</div>'
    + '<div class="not-confirm-sub">Bildirim <b>' + count + ' kişiye</b> iletilecek</div>'
    + '</div>'

    // Önizleme (aynı mockup)
    + '<div class="not-confirm-preview">'
    + '<div class="not-preview-label"><iconify-icon icon="solar:eye-bold" style="font-size:11px"></iconify-icon>Kullanıcının göreceği</div>'
    + preview
    + '</div>'

    // Özet
    + '<div class="not-confirm-summary">'
    + '<div class="not-confirm-row"><span>Kanal</span><b>' + _notEsc(ch.label) + '</b></div>'
    + '<div class="not-confirm-row"><span>Alıcı</span><b>' + count + ' kişi</b></div>'
    + '<div class="not-confirm-row"><span>Zaman</span><b>Şimdi</b></div>'
    + (ch.charLimit ? '<div class="not-confirm-row"><span>Karakter</span><b>' + (_not.content.body || '').length + ' / ' + ch.charLimit + '</b></div>' : '')
    + '</div>'

    // Uyarı
    + '<div class="not-confirm-warning">'
    + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<span>Gönderim başlatıldıktan sonra geri alınamaz.</span>'
    + '</div>'

    // Soru + Butonlar
    + '<div class="not-confirm-q">Bildirimi <b>' + count + ' kişiye</b> göndermek istediğinize emin misiniz?</div>'
    + '<div class="not-confirm-btns">'
    + '<button class="not-confirm-cancel" onclick="_notCloseConfirm()">İptal</button>'
    + '<button class="not-confirm-send" style="background:' + (ch.gradient || '#8B5CF6') + '" onclick="_notSend()">'
    + '<iconify-icon icon="solar:plain-bold" style="font-size:15px"></iconify-icon>Evet, Gönder</button>'
    + '</div>'

    + '</div>';

  m.innerHTML = h;
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _notCloseConfirm() {
  var m = document.getElementById('notConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _not.confirmOpen = false;
}

function _notSend() {
  var ch = _notChannel(_not.channel);
  var count = _not.audience.all ? _notAllAudience().length : _not.audience.selectedIds.length;
  _admToast('Bildirim ' + count + ' kişiye gönderildi!', 'ok');
  _notCloseConfirm();
  _notCloseOverlay();
}

/* ═══════════════════════════════════════
   P8 — Stiller (.not-*)
   ═══════════════════════════════════════ */
function _notInjectStyles() {
  if (document.getElementById('notStyles')) return;
  var css = ''
    + '.not-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    /* Automation Box */
    + '.not-auto-box{background:linear-gradient(135deg,rgba(139,92,246,0.05),rgba(236,72,153,0.02));border:1px solid rgba(139,92,246,0.25);border-radius:var(--r-xl);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.not-auto-head{display:flex;align-items:center;gap:10px}'
    + '.not-auto-ico{width:38px;height:38px;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#A78BFA);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(139,92,246,0.35)}'
    + '.not-auto-title{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.not-auto-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.not-auto-stats{flex-shrink:0;text-align:right}'
    + '.not-auto-stat-val{font:var(--fw-bold) 20px/1 var(--font);color:#22C55E}'
    + '.not-auto-stat-tot{font:var(--fw-medium) 12px/1 var(--font);color:var(--text-muted)}'
    + '.not-auto-stat-lbl{display:block;font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-top:3px}'
    /* Accordion */
    + '.not-auto-groups{display:flex;flex-direction:column;gap:6px}'
    + '.not-auto-grp{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-md);overflow:hidden;transition:all .2s}'
    + '.not-auto-grp.open{border-color:#8B5CF6}'
    + '.not-auto-grp-head{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;transition:background .15s}'
    + '.not-auto-grp-head:hover{background:var(--bg-phone-secondary)}'
    + '.not-auto-grp-ico{width:28px;height:28px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.not-auto-grp-title{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.not-auto-grp-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.not-auto-chev{font-size:15px;color:var(--text-muted);transition:transform .2s}'
    + '.not-auto-grp.open .not-auto-chev{transform:rotate(180deg);color:#8B5CF6}'
    + '.not-auto-scenarios{padding:4px 12px 10px;display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--border-subtle);background:var(--bg-phone-secondary)}'
    /* Scenario row */
    + '.not-scn-row{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone);transition:opacity .2s}'
    + '.not-scn-row--off{opacity:0.55}'
    + '.not-scn-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.not-scn-label{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary)}'
    + '.not-scn-ch{display:inline-flex;align-items:center;gap:3px;font:var(--fw-semibold) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full)}'
    + '.not-scn-text{font:var(--fw-regular) 10px/1.4 var(--font);color:var(--text-secondary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'
    + '.not-var-chip{display:inline;padding:1px 5px;border-radius:var(--r-sm);background:rgba(139,92,246,0.12);color:#8B5CF6;font:var(--fw-semibold) 9px/1.4 var(--font)}'
    + '.not-scn-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}'
    + '.not-scn-edit{width:26px;height:26px;border:1px solid var(--border-subtle);border-radius:var(--r-sm);background:var(--bg-phone);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}'
    + '.not-scn-edit:hover{border-color:#8B5CF6;color:#8B5CF6}'
    + '.not-toggle{width:34px;height:18px;border-radius:var(--r-full);background:var(--border-subtle);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}'
    + '.not-toggle.on{background:#22C55E}'
    + '.not-toggle-dot{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}'
    + '.not-toggle.on .not-toggle-dot{transform:translateX(16px)}'
    /* Section */
    + '.not-section-heading{display:flex;align-items:center;gap:6px;padding:6px 2px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary);margin-top:4px}'
    + '.not-section-heading span:first-of-type{flex-shrink:0}'
    + '.not-section-sub{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);font-weight:normal;margin-left:auto}'
    /* Channel tiles */
    + '.not-channels{display:flex;flex-direction:column;gap:10px}'
    + '.not-channel-tile{position:relative;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;text-align:left;transition:all .2s;overflow:hidden}'
    + '.not-channel-tile:hover{transform:translateY(-2px);box-shadow:0 6px 18px var(--not-c)22;border-color:var(--not-c)}'
    + '.not-ch-bg{position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;opacity:0.12;z-index:0}'
    + '.not-ch-ico{width:48px;height:48px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,0.1);position:relative;z-index:1}'
    + '.not-ch-body{flex:1;min-width:0;position:relative;z-index:1}'
    + '.not-ch-label{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.not-ch-desc{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.not-ch-arrow{font-size:18px;color:var(--text-muted);position:relative;z-index:1}';
  var s = document.createElement('style');
  s.id = 'notStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _notInjectStylesPart2();
}

function _notInjectStylesPart2() {
  if (document.getElementById('notStyles2')) return;
  var css = ''
    /* Audience */
    + '.not-ch-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--r-full);color:#fff;font:var(--fw-semibold) 11px/1 var(--font);align-self:flex-start}'
    + '.not-sel-summary{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid rgba(139,92,246,0.3);background:rgba(139,92,246,0.05);border-radius:var(--r-md)}'
    + '.not-sel-count{flex:1;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.not-sel-clear{padding:4px 10px;border-radius:var(--r-full);border:1px solid #EF4444;background:rgba(239,68,68,0.08);color:#EF4444;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer}'
    + '.not-all-btn{display:flex;align-items:center;gap:12px;padding:12px;border:1px dashed var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;transition:all .15s;width:100%}'
    + '.not-all-btn:hover{border-color:#8B5CF6;background:rgba(139,92,246,0.03)}'
    + '.not-all-btn.active{border-color:#22C55E;background:rgba(34,197,94,0.05);border-style:solid}'
    + '.not-all-ico{width:36px;height:36px;border-radius:var(--r-md);background:rgba(139,92,246,0.12);color:#8B5CF6;display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.not-all-btn.active .not-all-ico{background:#22C55E;color:#fff}'
    + '.not-all-title{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.not-all-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.not-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.not-search:focus{border-color:#8B5CF6}'
    + '.not-filters{display:flex;flex-direction:column;gap:10px}'
    + '.not-filter-group{display:flex;flex-direction:column;gap:5px}'
    + '.not-filter-lbl{display:flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.not-lbl-hint{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:none;letter-spacing:0;opacity:0.85}'
    + '.not-chip-row{display:flex;flex-wrap:wrap;gap:6px}'
    + '.not-chip{padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}'
    + '.not-chip:hover{background:var(--bg-phone-secondary)}'
    + '.not-chip.active{border-color:#8B5CF6;background:rgba(139,92,246,0.1);color:#8B5CF6}'
    + '.not-filter-result{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(139,92,246,0.05),transparent);border:1px solid rgba(139,92,246,0.2)}'
    + '.not-filter-result>div{display:flex;align-items:center;gap:6px;font:var(--fw-regular) 11px/1 var(--font);color:var(--text-secondary)}'
    + '.not-filter-result b{color:#8B5CF6;font:var(--fw-bold) var(--fs-sm)/1 var(--font)}'
    + '.not-add-all{padding:6px 12px;border-radius:var(--r-full);border:none;background:#8B5CF6;color:#fff;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.not-add-all:hover{opacity:0.9}'
    + '.not-user-list{display:flex;flex-direction:column;gap:4px}'
    + '.not-user-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-md);background:var(--bg-phone);border:1px solid var(--border-subtle);cursor:pointer;transition:all .15s}'
    + '.not-user-item:hover{border-color:#8B5CF6}'
    + '.not-user-item.selected{background:rgba(139,92,246,0.06);border-color:#8B5CF6}'
    + '.not-user-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 12px/1 var(--font);flex-shrink:0}'
    + '.not-user-name{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary)}'
    + '.not-user-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.not-check{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border-subtle);background:var(--bg-phone);color:transparent;display:flex;align-items:center;justify-content:center;transition:all .15s}'
    + '.not-check.checked{background:#8B5CF6;border-color:#8B5CF6;color:#fff}'
    + '.not-empty-mini{padding:14px;text-align:center;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}'
    /* Content */
    + '.not-field{display:flex;flex-direction:column;gap:5px}'
    + '.not-field label{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.not-input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.not-input:focus{border-color:#8B5CF6}'
    + '.not-textarea{width:100%;box-sizing:border-box;min-height:80px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical;transition:border-color .15s}'
    + '.not-textarea--lg{min-height:110px}'
    + '.not-textarea:focus{border-color:#8B5CF6}'
    + '.not-char-counter{font:var(--fw-bold) 11px/1 var(--font)}'
    + '.not-upload{display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 16px;border:1px dashed var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone-secondary);cursor:pointer;color:var(--text-muted);transition:all .15s}'
    + '.not-upload:hover{border-color:#8B5CF6;background:rgba(139,92,246,0.04)}'
    + '.not-upload-preview{display:flex;align-items:center;gap:8px;font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary)}'
    + '.not-upload-clear{border:none;background:transparent;color:#EF4444;cursor:pointer;font:var(--fw-bold) 14px/1 var(--font);padding:4px 8px}'
    /* Variables */
    + '.not-var-list{display:flex;flex-wrap:wrap;gap:5px}'
    + '.not-var-btn{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid rgba(139,92,246,0.3);background:rgba(139,92,246,0.05);border-radius:var(--r-full);cursor:pointer;transition:all .15s}'
    + '.not-var-btn:hover{background:#8B5CF6;color:#fff}'
    + '.not-var-btn:hover .not-var-token,.not-var-btn:hover .not-var-ex{color:#fff}'
    + '.not-var-token{font:var(--fw-bold) 10px/1 var(--font);color:#8B5CF6;font-family:monospace}'
    + '.not-var-ex{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);opacity:0.85}'
    /* Preview mockups */
    + '.not-preview-box{padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);min-height:40px}'
    + '.not-mock-mail{background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-md);overflow:hidden}'
    + '.not-mock-mail-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border-subtle);background:#F8FAFC}'
    + '.not-mock-mail-logo{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#EC4899);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.not-mock-mail-from{font:var(--fw-regular) 10px/1 var(--font);color:#64748B}'
    + '.not-mock-mail-subject{font:var(--fw-bold) var(--fs-xs)/1.2 var(--font);color:#0F172A;margin-top:4px}'
    + '.not-mock-mail-img{padding:24px;text-align:center;background:linear-gradient(135deg,#F3E8FF,#FCE7F3)}'
    + '.not-mock-mail-body{padding:12px;font:var(--fw-regular) 11px/1.5 var(--font);color:#334155;white-space:pre-wrap}'
    + '.not-mock-sms{background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:10px 12px;max-width:280px;margin:0 auto}'
    + '.not-mock-sms-sender{font:var(--fw-bold) 10px/1 var(--font);color:#64748B;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}'
    + '.not-mock-sms-bubble{background:#E0F2FE;padding:10px 12px;border-radius:var(--r-md) var(--r-md) var(--r-md) var(--r-sm);font:var(--fw-regular) 11px/1.4 var(--font);color:#0F172A}'
    + '.not-mock-sms-meta{font:var(--fw-regular) 9px/1 var(--font);color:#94A3B8;margin-top:5px}'
    + '.not-mock-push{background:rgba(15,23,42,0.88);color:#fff;border-radius:var(--r-md);padding:10px 12px;backdrop-filter:blur(10px);max-width:320px;margin:0 auto}'
    + '.not-mock-push-head{display:flex;align-items:center;gap:6px;margin-bottom:4px}'
    + '.not-mock-push-ico{width:20px;height:20px;border-radius:var(--r-sm);background:linear-gradient(135deg,#8B5CF6,#EC4899);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.not-mock-push-app{flex:1;font:var(--fw-semibold) 10px/1 var(--font)}'
    + '.not-mock-push-time{font:var(--fw-regular) 9px/1 var(--font);opacity:0.7}'
    + '.not-mock-push-body{font:var(--fw-medium) 12px/1.4 var(--font)}'
    + '.not-preview-label{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px}'
    /* Modal */
    + '.not-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.not-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.not-modal-backdrop--confirm.open{background:rgba(15,23,42,0.75)}'
    + '.not-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.not-modal--confirm{max-width:420px;border-radius:var(--r-xl);margin-bottom:16px;max-height:88vh}'
    + '.not-modal-backdrop.open .not-modal{transform:translateY(0)}'
    + '.not-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.not-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle)}'
    + '.not-mhead-ico{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}'
    + '.not-mtitle{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.not-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.not-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.not-mactions{display:grid;grid-template-columns:auto 1fr;gap:8px}'
    + '.not-secondary-btn{padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px}'
    + '.not-secondary-btn:hover{border-color:#8B5CF6;color:#8B5CF6}'
    /* CTA */
    + '.not-cta{width:100%;padding:13px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(139,92,246,0.3);transition:opacity .15s,transform .1s}'
    + '.not-cta:hover{opacity:0.92}'
    + '.not-cta.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.75}'
    + '.not-cta--wizard{margin-top:6px}'
    + '.not-cta--publish{background:linear-gradient(135deg,#22C55E,#16A34A);box-shadow:0 4px 14px rgba(34,197,94,0.35)}'
    /* Confirm modal */
    + '.not-confirm-head{padding:20px 16px;color:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.not-confirm-head-ico{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center}'
    + '.not-confirm-title{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.not-confirm-sub{font:var(--fw-regular) 11px/1.3 var(--font);opacity:0.9}'
    + '.not-confirm-preview{padding:14px 16px;background:var(--bg-phone-secondary);border-bottom:1px solid var(--border-subtle)}'
    + '.not-confirm-summary{padding:12px 16px;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid var(--border-subtle)}'
    + '.not-confirm-row{display:flex;align-items:center;justify-content:space-between;font:var(--fw-regular) 11px/1 var(--font);color:var(--text-secondary)}'
    + '.not-confirm-row b{color:var(--text-primary);font:var(--fw-bold) var(--fs-xs)/1 var(--font)}'
    + '.not-confirm-warning{display:flex;align-items:center;gap:6px;padding:10px 16px;background:rgba(245,158,11,0.08);border-top:1px solid rgba(245,158,11,0.25);border-bottom:1px solid rgba(245,158,11,0.25);color:#92400E;font:var(--fw-medium) 11px/1.3 var(--font)}'
    + '.not-confirm-q{padding:14px 16px 6px;font:var(--fw-semibold) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);text-align:center}'
    + '.not-confirm-q b{color:#8B5CF6}'
    + '.not-confirm-btns{display:grid;grid-template-columns:1fr 1.5fr;gap:8px;padding:10px 16px 16px}'
    + '.not-confirm-cancel{padding:13px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer}'
    + '.not-confirm-cancel:hover{border-color:#EF4444;color:#EF4444}'
    + '.not-confirm-send{padding:13px;border:none;border-radius:var(--r-md);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.15);transition:opacity .15s}'
    + '.not-confirm-send:hover{opacity:0.92}';
  var s = document.createElement('style');
  s.id = 'notStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   ADMIN BLACKLIST — Kara Liste (Yasak / Engelleme Yönetimi)
   (Tab: Kullanıcı/İşletme • Wizard: Subject → Mod (Ban/Restrict)
    • Detay drawer: durum, timeline, kısıtlamalar, sabıka)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _abl = {
  tab: 'user',                 // 'user' | 'biz'
  search: '',
  typeFilter: '',              // '' | 'ban' | 'restriction'

  detailId: null,

  wizardOpen: false,
  wizardStep: 1,               // 1 = subject picker, 2 = mode+form
  wizardSubjectSearch: '',
  wizardSubjectType: 'user',   // user/biz
  wizardSubject: null,         // {type, id, name, meta}
  wizardEditingId: null,

  form: {
    type: 'ban',               // 'ban' | 'restriction'
    reason: '',
    customReason: '',
    expiresAt: '',             // '' = süresiz
    userNote: '',
    adminNote: '',
    restrictions: []           // active ids
  }
};

/* ═══ Overlay ═══ */
function _admOpenBlacklist() {
  _admInjectStyles();
  _ablInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_ablCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:user-block-rounded-bold" style="font-size:18px;color:#EF4444"></iconify-icon>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Kara Liste</div>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">Yasak, engelleme ve sabıka kaydı merkezi</div>'
    + '</div>'
    + '<div class="abl-fab" onclick="_ablStartWizard()" title="Ceza Tanımla"><iconify-icon icon="solar:add-circle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '</div>'
    + '<div id="adminBlacklistContainer" style="flex:1"></div>';
  adminPhone.appendChild(overlay);

  _abl.search = '';
  _abl.typeFilter = '';
  renderAdminBlacklist();
}

function _ablCloseOverlay() {
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var o = adminPhone.querySelector('.prof-overlay');
  if (o) o.remove();
  _ablCloseWizard();
  _ablCloseDetail();
}

/* ═══ Ana Render ═══ */
function renderAdminBlacklist() {
  var c = document.getElementById('adminBlacklistContainer');
  if (!c) return;
  var h = '<div class="adm-fadeIn" style="padding:14px 16px 24px;display:flex;flex-direction:column;gap:12px">';
  h += _ablRenderSummary();
  h += _ablRenderTabs();
  h += _ablRenderFilters();
  h += _ablRenderList();
  h += '</div>';
  c.innerHTML = h;
}

/* ═══ Helpers ═══ */
function _ablEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _ablPenaltiesFor(type) {
  return ADMIN_PENALTIES.filter(function(p) { return p.subjectType === type; });
}

function _ablDaysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

function _ablDaysLabel(iso) {
  if (!iso) return 'Süresiz';
  var d = _ablDaysLeft(iso);
  if (d === null) return 'Süresiz';
  if (d < 0) return Math.abs(d) + ' gün önce bitti';
  if (d === 0) return 'Bugün bitiyor';
  return d + ' gün kaldı';
}

function _ablRestriction(id) {
  for (var i = 0; i < ADMIN_PENALTY_RESTRICTIONS.length; i++) {
    if (ADMIN_PENALTY_RESTRICTIONS[i].id === id) return ADMIN_PENALTY_RESTRICTIONS[i];
  }
  return null;
}

function _ablDate(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' });
  } catch (e) { return iso; }
}

function _ablSetTab(t) { _abl.tab = t; _abl.typeFilter = ''; renderAdminBlacklist(); }
function _ablSetSearch(v) { _abl.search = v; renderAdminBlacklist(); }
function _ablSetTypeFilter(v) { _abl.typeFilter = _abl.typeFilter === v ? '' : v; renderAdminBlacklist(); }

/* ═══════════════════════════════════════
   P2 — Özet Hero + Segment Tab
   ═══════════════════════════════════════ */
function _ablRenderSummary() {
  var all = ADMIN_PENALTIES;
  var totalBans = all.filter(function(p) { return p.type === 'ban'; }).length;
  var totalRest = all.filter(function(p) { return p.type === 'restriction'; }).length;

  // 30 gün içinde yeni ceza
  var recent = all.filter(function(p) {
    return (Date.now() - new Date(p.createdAt).getTime()) < 30 * 86400000;
  }).length;

  return '<div class="abl-summary">'
    + '<div class="abl-sum-item abl-sum-item--ban">'
    + '<iconify-icon icon="solar:shield-cross-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="abl-sum-val">' + totalBans + '</div><div class="abl-sum-lbl">Yasaklı</div></div>'
    + '</div>'
    + '<div class="abl-sum-item abl-sum-item--rest">'
    + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="abl-sum-val">' + totalRest + '</div><div class="abl-sum-lbl">Engelli</div></div>'
    + '</div>'
    + '<div class="abl-sum-item abl-sum-item--recent">'
    + '<iconify-icon icon="solar:clock-circle-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="abl-sum-val">' + recent + '</div><div class="abl-sum-lbl">Son 30 gün</div></div>'
    + '</div>'
    + '</div>';
}

function _ablRenderTabs() {
  var userCount = _ablPenaltiesFor('user').length;
  var bizCount = _ablPenaltiesFor('biz').length;

  return '<div class="abl-segment">'
    + '<button class="abl-seg-btn' + (_abl.tab === 'user' ? ' active' : '') + '" onclick="_ablSetTab(\'user\')">'
    + '<iconify-icon icon="solar:user-block-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Yasaklı Kullanıcılar</span>'
    + '<span class="abl-seg-count">' + userCount + '</span>'
    + '</button>'
    + '<button class="abl-seg-btn' + (_abl.tab === 'biz' ? ' active' : '') + '" onclick="_ablSetTab(\'biz\')">'
    + '<iconify-icon icon="solar:shop-minus-bold" style="font-size:14px"></iconify-icon>'
    + '<span>Yasaklı İşletmeler</span>'
    + '<span class="abl-seg-count">' + bizCount + '</span>'
    + '</button>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P3 — Filtreler + Liste
   ═══════════════════════════════════════ */
function _ablRenderFilters() {
  var h = '<div style="display:flex;flex-direction:column;gap:8px">';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="abl-search" placeholder="' + (_abl.tab === 'user' ? 'Kullanıcı adı veya ID...' : 'İşletme adı veya ID...') + '" value="' + _ablEsc(_abl.search) + '" oninput="_ablSetSearch(this.value)" />'
    + '</div>';

  // Ceza türü filter
  h += '<div class="abl-chip-row">'
    + '<button class="abl-chip' + (!_abl.typeFilter ? ' active' : '') + '" onclick="_ablSetTypeFilter(\'\')">Tümü</button>'
    + '<button class="abl-chip abl-chip--ban' + (_abl.typeFilter === 'ban' ? ' active' : '') + '" onclick="_ablSetTypeFilter(\'ban\')">'
    + '<iconify-icon icon="solar:shield-cross-linear" style="font-size:11px"></iconify-icon>Yasaklı</button>'
    + '<button class="abl-chip abl-chip--rest' + (_abl.typeFilter === 'restriction' ? ' active' : '') + '" onclick="_ablSetTypeFilter(\'restriction\')">'
    + '<iconify-icon icon="solar:shield-warning-linear" style="font-size:11px"></iconify-icon>Engelli</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _ablRenderList() {
  var list = _ablPenaltiesFor(_abl.tab).slice();

  if (_abl.typeFilter) {
    list = list.filter(function(p) { return p.type === _abl.typeFilter; });
  }
  if (_abl.search.trim()) {
    var q = _abl.search.toLowerCase().trim();
    list = list.filter(function(p) {
      return p.subjectName.toLowerCase().indexOf(q) > -1
        || p.subjectId.toLowerCase().indexOf(q) > -1;
    });
  }
  // En yeni üstte
  list.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + list.length + ' kayıt</div>'
    + '</div>';

  if (list.length === 0) {
    h += '<div class="abl-empty"><iconify-icon icon="solar:shield-check-bold" style="font-size:44px;opacity:0.3;color:#22C55E"></iconify-icon>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:10px">Bu kategoride ceza kaydı yok</div>'
      + '<button class="abl-empty-cta" onclick="_ablStartWizard()"><iconify-icon icon="solar:add-circle-bold" style="font-size:14px"></iconify-icon>Yeni Ceza Tanımla</button>'
      + '</div>';
    return h;
  }

  h += '<div style="display:flex;flex-direction:column;gap:8px">';
  for (var i = 0; i < list.length; i++) {
    h += _ablPenaltyCard(list[i]);
  }
  h += '</div>';
  return h;
}

function _ablPenaltyCard(p) {
  var isBan = p.type === 'ban';
  var color = isBan ? '#EF4444' : '#F97316';
  var icon = isBan ? 'solar:shield-cross-bold' : 'solar:shield-warning-bold';
  var label = isBan ? 'YASAKLI' : 'ENGELLİ';

  var daysLbl = _ablDaysLabel(p.expiresAt);
  var ended = p.expiresAt && _ablDaysLeft(p.expiresAt) < 0;

  var history = ADMIN_PENALTY_HISTORY.filter(function(h) {
    return h.subjectType === p.subjectType && h.subjectId === p.subjectId;
  }).length;

  return '<div class="abl-card abl-card--' + (isBan ? 'ban' : 'rest') + '" onclick="_ablOpenDetail(\'' + p.id + '\')">'
    + '<div class="abl-card-lead" style="background:' + color + '15;color:' + color + '">'
    + '<iconify-icon icon="' + icon + '" style="font-size:20px"></iconify-icon>'
    + '</div>'
    + '<div class="abl-card-body">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="abl-card-name">' + _ablEsc(p.subjectName) + '</span>'
    + '<span class="abl-type-badge" style="background:' + color + ';color:#fff">' + label + '</span>'
    + (history > 1 ? '<span class="abl-hist-badge"><iconify-icon icon="solar:document-text-linear" style="font-size:10px"></iconify-icon>' + history + ' sabıka</span>' : '')
    + '</div>'
    + '<div class="abl-card-reason">' + _ablEsc(p.reason) + '</div>'
    + '<div class="abl-card-meta">'
    + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:10px"></iconify-icon>' + _ablDate(p.createdAt).split(' ')[0] + ' ' + _ablDate(p.createdAt).split(' ')[1] + '</span>'
    + '<span style="color:' + (ended ? 'var(--text-muted)' : (p.expiresAt ? color : 'var(--text-secondary)')) + '">'
    + '<iconify-icon icon="' + (p.expiresAt ? 'solar:clock-circle-linear' : 'solar:infinity-linear') + '" style="font-size:10px"></iconify-icon>' + daysLbl
    + '</span>'
    + (p.type === 'restriction' ? '<span><iconify-icon icon="solar:key-minimalistic-linear" style="font-size:10px"></iconify-icon>' + p.restrictions.length + ' kısıtlama</span>' : '')
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);align-self:center"></iconify-icon>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P4 — Wizard Adım 1: Subject Picker
   ═══════════════════════════════════════ */
function _ablStartWizard() {
  _abl.wizardStep = 1;
  _abl.wizardSubjectType = _abl.tab;
  _abl.wizardSubject = null;
  _abl.wizardSubjectSearch = '';
  _abl.wizardEditingId = null;
  _abl.form = {
    type: 'ban', reason: '', customReason: '',
    expiresAt: '', userNote: '', adminNote: '',
    restrictions: []
  };
  _ablMountWizard();
}

function _ablMountWizard() {
  _ablCloseWizard();
  _abl.wizardOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var m = document.createElement('div');
  m.id = 'ablWizard';
  m.className = 'abl-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _ablCloseWizard(); };
  m.innerHTML = '<div class="abl-modal"><div id="ablWizardBody" class="abl-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _ablRenderWizard();
}

function _ablCloseWizard() {
  var m = document.getElementById('ablWizard');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _abl.wizardOpen = false;
}

function _ablRenderWizard() {
  var body = document.getElementById('ablWizardBody');
  if (!body) return;
  var h = '';

  // Header
  h += '<div class="abl-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + (_abl.wizardStep === 2
        ? '<div class="abl-back" onclick="_abl.wizardStep=1;_ablRenderWizard()"><iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon></div>'
        : '')
    + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:linear-gradient(135deg,#EF4444,#F97316);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:user-block-rounded-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div>'
    + '<div class="abl-mtitle">' + (_abl.wizardStep === 1 ? 'Kimi Cezalandırmak İstiyorsun?' : 'Ceza Detayları') + '</div>'
    + '<div class="abl-msub">Adım ' + _abl.wizardStep + '/2 · ' + (_abl.wizardSubject ? _ablEsc(_abl.wizardSubject.name) : 'Kişi veya işletme seç') + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="abl-close" onclick="_ablCloseWizard()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Progress
  h += '<div class="abl-steps">'
    + '<div class="abl-step' + (_abl.wizardStep >= 1 ? ' active' : '') + '">1</div>'
    + '<div class="abl-step-bar' + (_abl.wizardStep >= 2 ? ' active' : '') + '"></div>'
    + '<div class="abl-step' + (_abl.wizardStep >= 2 ? ' active' : '') + '">2</div>'
    + '</div>';

  if (_abl.wizardStep === 1) {
    h += _ablRenderSubjectPicker();
  } else {
    h += _ablRenderPenaltyForm();
  }

  body.innerHTML = h;
}

function _ablRenderSubjectPicker() {
  // Kaynaklar
  var sources;
  if (_abl.wizardSubjectType === 'user') {
    sources = (typeof ADMIN_USERS !== 'undefined' ? ADMIN_USERS : []).map(function(u) {
      return { id: u.id, name: u.name, meta: (u.email || '') + ' · ' + (u.phone || ''), city: u.city };
    });
  } else {
    sources = (typeof ADMIN_BUSINESSES !== 'undefined' ? ADMIN_BUSINESSES : []).map(function(b) {
      return { id: b.id, name: b.name, meta: b.owner + ' · ' + (b.city || '') };
    });
  }

  var q = _abl.wizardSubjectSearch.toLowerCase().trim();
  var filtered = q
    ? sources.filter(function(s) { return s.name.toLowerCase().indexOf(q) > -1 || s.id.toLowerCase().indexOf(q) > -1; })
    : sources.slice(0, 20);

  var h = '';

  // Tip toggle
  h += '<div class="abl-type-switch">'
    + '<button class="abl-type-sbtn' + (_abl.wizardSubjectType === 'user' ? ' active' : '') + '" onclick="_abl.wizardSubjectType=\'user\';_ablRenderWizard()">'
    + '<iconify-icon icon="solar:user-bold" style="font-size:14px"></iconify-icon>Kullanıcı</button>'
    + '<button class="abl-type-sbtn' + (_abl.wizardSubjectType === 'biz' ? ' active' : '') + '" onclick="_abl.wizardSubjectType=\'biz\';_ablRenderWizard()">'
    + '<iconify-icon icon="solar:shop-bold" style="font-size:14px"></iconify-icon>İşletme</button>'
    + '</div>';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="abl-search" placeholder="Ad veya ID ile ara..." value="' + _ablEsc(_abl.wizardSubjectSearch) + '" oninput="_abl.wizardSubjectSearch=this.value;_ablRenderWizard();this.focus();" />'
    + '</div>';

  // Sonuç listesi
  h += '<div class="abl-subject-list">';
  if (filtered.length === 0) {
    h += '<div class="abl-empty-mini">Eşleşme bulunamadı</div>';
  }
  for (var i = 0; i < filtered.length; i++) {
    var s = filtered[i];
    // Mevcut ceza varsa işaretle
    var existing = ADMIN_PENALTIES.find(function(p) {
      return p.subjectType === _abl.wizardSubjectType && p.subjectId === s.id;
    });
    h += '<div class="abl-subject-item' + (existing ? ' has-penalty' : '') + '" onclick="_ablSelectSubject(\'' + s.id + '\', \'' + _ablEsc(s.name).replace(/'/g, '\\\'') + '\')">'
      + '<div class="abl-subject-avatar">' + _ablEsc(s.name.charAt(0)) + '</div>'
      + '<div class="abl-subject-body">'
      + '<div class="abl-subject-name">' + _ablEsc(s.name) + '</div>'
      + '<div class="abl-subject-meta">' + _ablEsc(s.meta) + ' · ' + _ablEsc(s.id) + '</div>'
      + '</div>'
      + (existing
          ? '<span class="abl-type-badge" style="background:' + (existing.type === 'ban' ? '#EF4444' : '#F97316') + ';color:#fff">' + (existing.type === 'ban' ? 'CEZALI' : 'ENGELLİ') + '</span>'
          : '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>')
      + '</div>';
  }
  h += '</div>';

  return h;
}

function _ablSelectSubject(id, name) {
  _abl.wizardSubject = { type: _abl.wizardSubjectType, id: id, name: name };
  // Zaten ceza varsa düzenleme moduna al
  var existing = ADMIN_PENALTIES.find(function(p) {
    return p.subjectType === _abl.wizardSubjectType && p.subjectId === id;
  });
  if (existing) {
    _abl.wizardEditingId = existing.id;
    _abl.form = {
      type: existing.type,
      reason: ADMIN_PENALTY_REASONS.indexOf(existing.reason) > -1 ? existing.reason : 'Diğer',
      customReason: ADMIN_PENALTY_REASONS.indexOf(existing.reason) > -1 ? '' : existing.reason,
      expiresAt: existing.expiresAt || '',
      userNote: existing.userNote || '',
      adminNote: existing.adminNote || '',
      restrictions: (existing.restrictions || []).slice()
    };
  }
  _abl.wizardStep = 2;
  _ablRenderWizard();
}

/* ═══════════════════════════════════════
   P5 — Wizard Adım 2: Ban/Restriction Formu
   ═══════════════════════════════════════ */
function _ablRenderPenaltyForm() {
  var f = _abl.form;
  var isBan = f.type === 'ban';
  var modeColor = isBan ? '#EF4444' : '#F97316';

  var h = '';

  // Subject Banner
  h += '<div class="abl-subject-banner">'
    + '<div class="abl-subject-avatar" style="background:linear-gradient(135deg,' + modeColor + ',' + modeColor + 'aa)">' + _ablEsc(_abl.wizardSubject.name.charAt(0)) + '</div>'
    + '<div style="flex:1">'
    + '<div class="abl-subject-name">' + _ablEsc(_abl.wizardSubject.name) + '</div>'
    + '<div class="abl-subject-meta">' + _ablEsc(_abl.wizardSubject.id) + ' · ' + (_abl.wizardSubjectType === 'user' ? 'Kullanıcı' : 'İşletme') + (_abl.wizardEditingId ? ' · Mevcut ceza düzenleniyor' : '') + '</div>'
    + '</div>'
    + '</div>';

  // Mode picker
  h += '<div class="abl-mode-grid">'
    + _ablModeCard('ban',         'solar:shield-cross-bold',  '#EF4444', 'Yasakla (Ban)',  'Sisteme tüm erişimi keser')
    + _ablModeCard('restriction', 'solar:shield-warning-bold','#F97316', 'Engelle (Kısıt)','Sisteme girer, belirli özellikleri kullanamaz')
    + '</div>';

  // Ban bilgilendirme balonu
  if (isBan) {
    h += '<div class="abl-warning">'
      + '<iconify-icon icon="solar:danger-bold" style="font-size:18px;color:#EF4444;flex-shrink:0"></iconify-icon>'
      + '<div><div style="font:var(--fw-bold) var(--fs-xs)/1.2 var(--font);color:#EF4444">Dikkat — Kalıcı Erişim Kesilmesi</div>'
      + '<div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);margin-top:4px">Bu işlem sonrası süje sisteme hiçbir şekilde erişemeyecektir. Dilerseniz "Engelle" modunu seçerek kısmi kısıtlama uygulayabilirsiniz.</div></div>'
      + '</div>';
  }

  // Sebep
  h += '<div class="abl-sect">'
    + '<div class="abl-sect-head"><iconify-icon icon="solar:notebook-minimalistic-bold" style="font-size:16px;color:' + modeColor + '"></iconify-icon><span>Ceza Sebebi</span></div>'
    + '<div class="abl-chip-grid">';
  for (var i = 0; i < ADMIN_PENALTY_REASONS.length; i++) {
    var rs = ADMIN_PENALTY_REASONS[i];
    var sel = f.reason === rs;
    h += '<button class="abl-chip' + (sel ? ' active' : '') + '" '
      + 'style="' + (sel ? 'border-color:' + modeColor + ';background:' + modeColor + '18;color:' + modeColor : '') + '" '
      + 'onclick="_abl.form.reason=\'' + rs.replace(/'/g, '\\\'') + '\';_ablRenderWizard()">' + _ablEsc(rs) + '</button>';
  }
  h += '</div>';
  if (f.reason === 'Diğer') {
    h += '<input class="abl-input" placeholder="Sebebi açıklayın..." value="' + _ablEsc(f.customReason) + '" oninput="_abl.form.customReason=this.value" />';
  }
  h += '</div>';

  // Restriction toggles
  if (!isBan) {
    h += '<div class="abl-sect">'
      + '<div class="abl-sect-head"><iconify-icon icon="solar:key-minimalistic-square-3-bold" style="font-size:16px;color:#F97316"></iconify-icon>'
      + '<span>Kısıtlamalar</span><span class="abl-sect-badge" style="background:#F9731618;color:#F97316">' + f.restrictions.length + '/' + ADMIN_PENALTY_RESTRICTIONS.length + '</span></div>'
      + '<div class="abl-sect-desc">Açık olan özellikler kullanıcıya kısıtlanacaktır.</div>'
      + '<div class="abl-toggle-list">';
    for (var r = 0; r < ADMIN_PENALTY_RESTRICTIONS.length; r++) {
      var rst = ADMIN_PENALTY_RESTRICTIONS[r];
      var isOn = f.restrictions.indexOf(rst.id) > -1;
      h += '<div class="abl-tog-item' + (isOn ? ' on' : '') + '" onclick="_ablToggleRestriction(\'' + rst.id + '\')">'
        + '<div class="abl-tog-ico"><iconify-icon icon="' + rst.icon + '" style="font-size:15px"></iconify-icon></div>'
        + '<div class="abl-tog-body">'
        + '<div class="abl-tog-lbl">' + _ablEsc(rst.label) + '</div>'
        + '<div class="abl-tog-desc">' + _ablEsc(rst.description) + '</div>'
        + '</div>'
        + '<div class="abl-tog' + (isOn ? ' on' : '') + '"><div class="abl-tog-dot"></div></div>'
        + '</div>';
    }
    h += '</div></div>';
  }

  // Süre (tarih & saat)
  h += '<div class="abl-sect">'
    + '<div class="abl-sect-head"><iconify-icon icon="solar:calendar-bold" style="font-size:16px;color:#3B82F6"></iconify-icon><span>Süre</span>'
    + '<span class="abl-sect-badge" style="background:' + (f.expiresAt ? '#3B82F618;color:#3B82F6' : '#EF444418;color:#EF4444') + '">'
    + (f.expiresAt ? _ablDaysLabel(f.expiresAt) : 'Süresiz') + '</span>'
    + '</div>'
    + '<div class="abl-sect-desc">Boş bırakılırsa ceza <b style="color:#EF4444">süresiz</b> olarak işaretlenir.</div>'
    + '<input type="datetime-local" class="abl-input" value="' + _ablEsc(_ablToLocal(f.expiresAt)) + '" '
    + 'onchange="_abl.form.expiresAt=this.value?new Date(this.value).toISOString():\'\';_ablRenderWizard()" />'
    + (f.expiresAt ? '<button class="abl-clear-date" onclick="_abl.form.expiresAt=\'\';_ablRenderWizard()">'
      + '<iconify-icon icon="solar:close-circle-linear" style="font-size:13px"></iconify-icon>Süreyi temizle (Süresiz yap)</button>' : '')
    + '</div>';

  // Notlar
  h += '<div class="abl-sect">'
    + '<div class="abl-sect-head"><iconify-icon icon="solar:letter-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon><span>Notlar</span></div>'
    + '<div class="abl-field">'
    + '<label>Kullanıcıya İletilecek Not</label>'
    + '<textarea class="abl-textarea" placeholder="Kullanıcı görecek — net ve kibar yazın" oninput="_abl.form.userNote=this.value">' + _ablEsc(f.userNote) + '</textarea>'
    + '</div>'
    + '<div class="abl-field">'
    + '<label>Admin Paneli Özel Notu</label>'
    + '<textarea class="abl-textarea abl-textarea--admin" placeholder="İç not — sadece admin görür" oninput="_abl.form.adminNote=this.value">' + _ablEsc(f.adminNote) + '</textarea>'
    + '</div>'
    + '</div>';

  // CTA
  var reasonOk = f.reason && (f.reason !== 'Diğer' || f.customReason.trim());
  var restOk = isBan || f.restrictions.length > 0;
  var ready = reasonOk && restOk;

  h += '<button class="abl-cta' + (ready ? '' : ' disabled') + '" '
    + 'style="' + (ready ? 'background:' + (isBan
        ? 'linear-gradient(135deg,#EF4444,#B91C1C)'
        : 'linear-gradient(135deg,#F97316,#C2410C)') + ';box-shadow:0 4px 12px ' + modeColor + '55' : '') + '" '
    + (ready ? '' : 'disabled') + ' onclick="_ablSubmitPenalty()">'
    + '<iconify-icon icon="' + (isBan ? 'solar:shield-cross-bold' : 'solar:shield-warning-bold') + '" style="font-size:16px"></iconify-icon>'
    + (_abl.wizardEditingId ? 'Cezayı Güncelle' : (isBan ? 'Kalıcı Olarak Yasakla' : 'Kısıtlamaları Uygula')) + '</button>';

  return h;
}

function _ablModeCard(mode, icon, color, title, desc) {
  var sel = _abl.form.type === mode;
  return '<button class="abl-mode-card' + (sel ? ' active' : '') + '" '
    + 'style="' + (sel ? 'border-color:' + color + ';background:' + color + '0D' : '') + '" '
    + 'onclick="_abl.form.type=\'' + mode + '\';_ablRenderWizard()">'
    + '<div class="abl-mode-ico" style="background:' + color + '18;color:' + color + '"><iconify-icon icon="' + icon + '" style="font-size:20px"></iconify-icon></div>'
    + '<div class="abl-mode-title" style="' + (sel ? 'color:' + color : '') + '">' + title + '</div>'
    + '<div class="abl-mode-desc">' + desc + '</div>'
    + (sel ? '<div class="abl-mode-check" style="background:' + color + '"><iconify-icon icon="solar:check-circle-bold" style="font-size:12px;color:#fff"></iconify-icon></div>' : '')
    + '</button>';
}

function _ablToggleRestriction(rid) {
  var arr = _abl.form.restrictions;
  var idx = arr.indexOf(rid);
  if (idx > -1) arr.splice(idx, 1);
  else arr.push(rid);
  _ablRenderWizard();
}

function _ablToLocal(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch (e) { return ''; }
}

function _ablSubmitPenalty() {
  var f = _abl.form;
  var finalReason = f.reason === 'Diğer' ? f.customReason.trim() : f.reason;
  if (!finalReason) { _admToast('Sebep seçin', 'err'); return; }
  if (f.type === 'restriction' && f.restrictions.length === 0) {
    _admToast('En az bir kısıtlama seçin', 'err'); return;
  }

  var nowIso = new Date().toISOString();

  if (_abl.wizardEditingId) {
    var p = ADMIN_PENALTIES.find(function(x) { return x.id === _abl.wizardEditingId; });
    if (p) {
      p.type = f.type; p.reason = finalReason;
      p.expiresAt = f.expiresAt || null;
      p.userNote = f.userNote; p.adminNote = f.adminNote;
      p.restrictions = f.type === 'ban' ? [] : f.restrictions.slice();
      _admToast('Ceza güncellendi', 'ok');
    }
  } else {
    var newId = 'pen_' + Date.now().toString(36);
    ADMIN_PENALTIES.unshift({
      id: newId,
      subjectType: _abl.wizardSubject.type,
      subjectId: _abl.wizardSubject.id,
      subjectName: _abl.wizardSubject.name,
      type: f.type, reason: finalReason,
      createdAt: nowIso, expiresAt: f.expiresAt || null,
      userNote: f.userNote, adminNote: f.adminNote,
      restrictions: f.type === 'ban' ? [] : f.restrictions.slice(),
      appliedBy: 'Admin'
    });
    // Sabıka kaydına da ekle
    ADMIN_PENALTY_HISTORY.push({
      id: 'hist_' + Date.now().toString(36),
      subjectType: _abl.wizardSubject.type,
      subjectId: _abl.wizardSubject.id,
      date: nowIso, action: f.type, reason: finalReason,
      note: f.type === 'ban' ? 'Kalıcı/süreli ban' : f.restrictions.length + ' kısıtlama'
    });
    _admToast(f.type === 'ban' ? _abl.wizardSubject.name + ' yasaklandı' : _abl.wizardSubject.name + ' engellendi', 'ok');
  }

  _ablCloseWizard();
  renderAdminBlacklist();
}

/* ═══════════════════════════════════════
   P6 — Detay Drawer (Durum, Timeline, Aksiyonlar, Sabıka)
   ═══════════════════════════════════════ */
function _ablOpenDetail(penId) {
  _ablCloseDetail();
  var p = ADMIN_PENALTIES.find(function(x) { return x.id === penId; });
  if (!p) { _admToast('Ceza bulunamadı', 'err'); return; }
  _abl.detailId = penId;

  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var d = document.createElement('div');
  d.id = 'ablDrawer';
  d.className = 'mbr-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _ablCloseDetail(); };
  d.innerHTML = '<div class="mbr-drawer"><div id="ablDetailScroll" class="mbr-drawer-scroll"></div></div>';
  adminPhone.appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
  _ablRenderDetail();
}

function _ablCloseDetail() {
  var d = document.getElementById('ablDrawer');
  if (!d) return;
  d.classList.remove('open');
  setTimeout(function() { if (d.parentNode) d.remove(); }, 280);
  _abl.detailId = null;
}

function _ablRenderDetail() {
  var scroll = document.getElementById('ablDetailScroll');
  if (!scroll) return;
  var p = ADMIN_PENALTIES.find(function(x) { return x.id === _abl.detailId; });
  if (!p) return;

  var isBan = p.type === 'ban';
  var color = isBan ? '#EF4444' : '#F97316';
  var modeLabel = isBan ? 'YASAKLI' : 'ENGELLİ';
  var daysLbl = _ablDaysLabel(p.expiresAt);

  var history = ADMIN_PENALTY_HISTORY.filter(function(h) {
    return h.subjectType === p.subjectType && h.subjectId === p.subjectId;
  }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  var h = '';

  // Top bar
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Ceza Detayı</span>'
    + '<div class="mbr-icon-btn" onclick="_ablCloseDetail()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  // Hero
  h += '<div class="abl-detail-hero" style="background:linear-gradient(135deg,' + color + ',' + color + 'aa)">'
    + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">'
    + '<div class="abl-detail-avatar">' + _ablEsc(p.subjectName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:#fff">' + _ablEsc(p.subjectName) + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);color:#fff;opacity:.8;margin-top:4px">' + _ablEsc(p.subjectId) + ' · ' + (p.subjectType === 'user' ? 'Kullanıcı' : 'İşletme') + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.25);color:#fff;font-weight:700">' + modeLabel + '</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.25);color:#fff">' + _ablEsc(p.reason) + '</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.25);color:#fff"><iconify-icon icon="' + (p.expiresAt ? 'solar:clock-circle-bold' : 'solar:infinity-bold') + '" style="font-size:11px"></iconify-icon>' + daysLbl + '</span>'
    + '</div>'
    + '</div>';

  // Zaman Çizelgesi
  h += '<div class="abl-sect" style="margin-top:14px">'
    + '<div class="abl-sect-head"><iconify-icon icon="solar:calendar-date-bold" style="font-size:16px;color:#3B82F6"></iconify-icon><span>Zaman Çizelgesi</span></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    + '<div class="abl-tl-cell"><div class="abl-tl-lbl">Başlangıç</div><div class="abl-tl-val">' + _ablDate(p.createdAt) + '</div></div>'
    + '<div class="abl-tl-cell"><div class="abl-tl-lbl">Bitiş</div><div class="abl-tl-val" style="color:' + (p.expiresAt ? color : 'var(--text-muted)') + '">' + (p.expiresAt ? _ablDate(p.expiresAt) : 'Süresiz') + '</div></div>'
    + '</div></div>';

  // Aktif Kısıtlamalar (sadece restriction)
  if (!isBan) {
    h += '<div class="abl-sect">'
      + '<div class="abl-sect-head"><iconify-icon icon="solar:key-minimalistic-square-3-bold" style="font-size:16px;color:#F97316"></iconify-icon><span>Aktif Kısıtlamalar</span>'
      + '<span class="abl-sect-badge" style="background:#F9731618;color:#F97316">' + p.restrictions.length + '/' + ADMIN_PENALTY_RESTRICTIONS.length + '</span></div>'
      + '<div class="abl-detail-rest-list">';
    for (var ri = 0; ri < ADMIN_PENALTY_RESTRICTIONS.length; ri++) {
      var rst = ADMIN_PENALTY_RESTRICTIONS[ri];
      var on = p.restrictions.indexOf(rst.id) > -1;
      h += '<div class="abl-detail-rest' + (on ? ' on' : '') + '">'
        + '<iconify-icon icon="' + rst.icon + '" style="font-size:14px;color:' + (on ? '#F97316' : 'var(--text-muted)') + '"></iconify-icon>'
        + '<span style="flex:1;color:' + (on ? 'var(--text-primary)' : 'var(--text-muted)') + '">' + _ablEsc(rst.label) + '</span>'
        + '<iconify-icon icon="' + (on ? 'solar:check-circle-bold' : 'solar:minus-circle-linear') + '" style="font-size:14px;color:' + (on ? '#F97316' : 'var(--border-subtle)') + '"></iconify-icon>'
        + '</div>';
    }
    h += '</div></div>';
  }

  // Notlar
  h += '<div class="abl-sect">'
    + '<div class="abl-sect-head"><iconify-icon icon="solar:letter-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon><span>Notlar</span></div>'
    + '<div class="abl-note-box">'
    + '<div class="abl-note-lbl"><iconify-icon icon="solar:user-linear" style="font-size:11px"></iconify-icon>Kullanıcıya İletilen</div>'
    + '<div class="abl-note-text">' + (p.userNote ? _ablEsc(p.userNote) : '<i>Not yok</i>') + '</div>'
    + '</div>'
    + '<div class="abl-note-box abl-note-box--admin">'
    + '<div class="abl-note-lbl"><iconify-icon icon="solar:shield-user-linear" style="font-size:11px"></iconify-icon>Admin Özel Notu</div>'
    + '<div class="abl-note-text">' + (p.adminNote ? _ablEsc(p.adminNote) : '<i>Not yok</i>') + '</div>'
    + '</div>'
    + '</div>';

  // Aksiyonlar
  h += '<div class="abl-actions">'
    + '<button class="abl-act-btn" style="background:#DBEAFE;color:#3B82F6" onclick="_ablEditPenalty(\'' + p.id + '\')">'
    + '<iconify-icon icon="solar:pen-bold" style="font-size:15px"></iconify-icon>Düzenle</button>'
    + '<button class="abl-act-btn" style="background:#DCFCE7;color:#22C55E" onclick="_ablRemovePenalty(\'' + p.id + '\')">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Cezayı Kaldır</button>'
    + '</div>';

  // Sabıka Kaydı
  h += '<div class="abl-sect" style="margin-top:14px">'
    + '<div class="abl-sect-head"><iconify-icon icon="solar:document-text-bold" style="font-size:16px;color:#6B7280"></iconify-icon>'
    + '<span>Sabıka Kaydı</span><span class="abl-sect-badge" style="background:#6B728018;color:#6B7280">' + history.length + ' kayıt</span></div>'
    + '<div class="abl-sect-desc">Bu kişinin/işletmenin geçmiş uyarı ve ceza kayıtları.</div>';

  if (history.length === 0) {
    h += '<div style="text-align:center;padding:16px;font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)"><iconify-icon icon="solar:shield-check-linear" style="font-size:24px;color:#22C55E;opacity:0.6"></iconify-icon><br>İlk ihlal kaydı.</div>';
  } else {
    h += '<div class="abl-hist">';
    for (var hi = 0; hi < history.length; hi++) {
      var ht = history[hi];
      var hc = ht.action === 'ban' ? '#EF4444'
        : ht.action === 'restriction' ? '#F97316'
        : '#F59E0B';
      var hLbl = ht.action === 'ban' ? 'Ban'
        : ht.action === 'restriction' ? 'Engel'
        : 'Uyarı';
      h += '<div class="abl-hist-item">'
        + '<div class="abl-hist-dot" style="background:' + hc + '"></div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
        + '<span class="abl-hist-action" style="color:' + hc + '">' + hLbl + '</span>'
        + '<span class="abl-hist-reason">' + _ablEsc(ht.reason) + '</span>'
        + '</div>'
        + '<div class="abl-hist-meta">' + _ablDate(ht.date) + (ht.note ? ' · ' + _ablEsc(ht.note) : '') + '</div>'
        + '</div>'
        + '</div>';
    }
    h += '</div>';
  }
  h += '</div>';

  scroll.innerHTML = h;
}

function _ablEditPenalty(penId) {
  var p = ADMIN_PENALTIES.find(function(x) { return x.id === penId; });
  if (!p) return;
  _abl.wizardSubjectType = p.subjectType;
  _abl.wizardSubject = { type: p.subjectType, id: p.subjectId, name: p.subjectName };
  _abl.wizardEditingId = p.id;
  _abl.wizardStep = 2;
  _abl.form = {
    type: p.type,
    reason: ADMIN_PENALTY_REASONS.indexOf(p.reason) > -1 ? p.reason : 'Diğer',
    customReason: ADMIN_PENALTY_REASONS.indexOf(p.reason) > -1 ? '' : p.reason,
    expiresAt: p.expiresAt || '',
    userNote: p.userNote || '',
    adminNote: p.adminNote || '',
    restrictions: (p.restrictions || []).slice()
  };
  _ablCloseDetail();
  _ablMountWizard();
}

function _ablRemovePenalty(penId) {
  var idx = ADMIN_PENALTIES.findIndex(function(x) { return x.id === penId; });
  if (idx === -1) return;
  var p = ADMIN_PENALTIES[idx];
  if (!confirm(p.subjectName + ' için ceza kaldırılacak. Emin misiniz?')) return;
  ADMIN_PENALTIES.splice(idx, 1);
  // Sabıka kaydına "kaldırıldı" satırı ekle
  ADMIN_PENALTY_HISTORY.push({
    id: 'hist_' + Date.now().toString(36),
    subjectType: p.subjectType, subjectId: p.subjectId,
    date: new Date().toISOString(),
    action: 'warning', reason: 'Ceza kaldırıldı', note: 'Admin tarafından manuel kaldırma'
  });
  _admToast('Ceza kaldırıldı', 'ok');
  _ablCloseDetail();
  renderAdminBlacklist();
}

/* ═══════════════════════════════════════
   P7 — Stiller (.abl-*)
   ═══════════════════════════════════════ */
function _ablInjectStyles() {
  if (document.getElementById('ablStyles')) return;
  var css = ''
    /* FAB */
    + '.abl-fab{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#EF4444,#F97316);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(239,68,68,0.4);transition:transform .15s}'
    + '.abl-fab:active{transform:scale(0.92)}'
    /* Summary */
    + '.abl-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}'
    + '.abl-sum-item{display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle)}'
    + '.abl-sum-item--ban{border-color:rgba(239,68,68,0.3);background:linear-gradient(135deg,rgba(239,68,68,0.06),transparent)}'
    + '.abl-sum-item--ban iconify-icon{color:#EF4444}'
    + '.abl-sum-item--rest{border-color:rgba(249,115,22,0.3);background:linear-gradient(135deg,rgba(249,115,22,0.06),transparent)}'
    + '.abl-sum-item--rest iconify-icon{color:#F97316}'
    + '.abl-sum-item--recent iconify-icon{color:#3B82F6}'
    + '.abl-sum-val{font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)}'
    + '.abl-sum-lbl{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px;text-transform:uppercase;letter-spacing:.3px}'
    /* Segment */
    + '.abl-segment{display:flex;gap:2px;padding:3px;background:var(--bg-phone-secondary);border-radius:var(--r-lg)}'
    + '.abl-seg-btn{flex:1;padding:10px 8px;border:none;border-radius:var(--r-md);background:transparent;color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .2s}'
    + '.abl-seg-btn.active{background:var(--bg-phone);color:#EF4444;box-shadow:var(--shadow-sm)}'
    + '.abl-seg-count{font:var(--fw-bold) 10px/1 var(--font);background:var(--border-subtle);color:var(--text-muted);padding:2px 6px;border-radius:var(--r-full)}'
    + '.abl-seg-btn.active .abl-seg-count{background:#EF4444;color:#fff}'
    /* Search */
    + '.abl-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.abl-search:focus{border-color:#EF4444}'
    /* Chip */
    + '.abl-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.abl-chip-grid{display:flex;flex-wrap:wrap;gap:6px}'
    + '.abl-chip{padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}'
    + '.abl-chip:hover{background:var(--bg-phone-secondary)}'
    + '.abl-chip.active{border-color:var(--primary);background:var(--primary-soft);color:var(--primary)}'
    + '.abl-chip--ban.active{border-color:#EF4444;background:rgba(239,68,68,0.12);color:#EF4444}'
    + '.abl-chip--rest.active{border-color:#F97316;background:rgba(249,115,22,0.12);color:#F97316}'
    /* Empty */
    + '.abl-empty{padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}'
    + '.abl-empty-cta{padding:8px 16px;border-radius:var(--r-full);border:none;background:linear-gradient(135deg,#EF4444,#F97316);color:#fff;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:6px}'
    + '.abl-empty-mini{padding:20px;text-align:center;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)}'
    /* Card */
    + '.abl-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;gap:10px;cursor:pointer;transition:all .15s}'
    + '.abl-card:hover{border-color:currentColor}'
    + '.abl-card--ban{border-left:3px solid #EF4444}'
    + '.abl-card--rest{border-left:3px solid #F97316}'
    + '.abl-card-lead{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.abl-card-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}'
    + '.abl-card-name{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.abl-card-reason{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-secondary)}'
    + '.abl-card-meta{display:flex;gap:10px;flex-wrap:wrap;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px}'
    + '.abl-card-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.abl-type-badge{font:var(--fw-bold) 9px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);letter-spacing:.5px}'
    + '.abl-hist-badge{font:var(--fw-semibold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);background:#F59E0B18;color:#F59E0B;display:inline-flex;align-items:center;gap:3px}';
  var s = document.createElement('style');
  s.id = 'ablStyles';
  s.textContent = css;
  document.head.appendChild(s);

  _ablInjectStylesPart2();
}

function _ablInjectStylesPart2() {
  if (document.getElementById('ablStyles2')) return;
  var css = ''
    /* Modal */
    + '.abl-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.abl-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.abl-modal{width:100%;max-height:94vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.abl-modal-backdrop.open .abl-modal{transform:translateY(0)}'
    + '.abl-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.abl-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.abl-mtitle{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.abl-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.abl-close,.abl-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary);flex-shrink:0}'
    /* Steps */
    + '.abl-steps{display:flex;align-items:center;gap:6px;padding:4px 0 6px}'
    + '.abl-step{width:26px;height:26px;border-radius:50%;background:var(--border-subtle);color:var(--text-muted);font:var(--fw-bold) 11px/26px var(--font);text-align:center;transition:all .2s}'
    + '.abl-step.active{background:linear-gradient(135deg,#EF4444,#F97316);color:#fff}'
    + '.abl-step-bar{flex:1;height:2px;background:var(--border-subtle);transition:background .3s}'
    + '.abl-step-bar.active{background:linear-gradient(to right,#EF4444,#F97316)}'
    /* Subject type switch */
    + '.abl-type-switch{display:flex;gap:2px;padding:3px;background:var(--bg-phone-secondary);border-radius:var(--r-md)}'
    + '.abl-type-sbtn{flex:1;padding:8px;border:none;border-radius:var(--r-md);background:transparent;color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px}'
    + '.abl-type-sbtn.active{background:var(--bg-phone);color:var(--primary);box-shadow:var(--shadow-sm)}'
    /* Subject list */
    + '.abl-subject-list{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto}'
    + '.abl-subject-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);cursor:pointer;transition:all .15s}'
    + '.abl-subject-item:hover{border-color:#EF4444;background:rgba(239,68,68,0.04)}'
    + '.abl-subject-item.has-penalty{background:rgba(239,68,68,0.05);border-color:rgba(239,68,68,0.2)}'
    + '.abl-subject-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 14px/1 var(--font);flex-shrink:0}'
    + '.abl-subject-body{flex:1;min-width:0}'
    + '.abl-subject-name{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.abl-subject-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    /* Subject banner */
    + '.abl-subject-banner{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-phone-secondary);border-radius:var(--r-md)}'
    + '.abl-subject-banner .abl-subject-avatar{width:42px;height:42px;font-size:16px}'
    /* Mode grid */
    + '.abl-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.abl-mode-card{position:relative;padding:14px;border:2px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;text-align:left;transition:all .2s;display:flex;flex-direction:column;gap:8px}'
    + '.abl-mode-card.active{transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,0.07)}'
    + '.abl-mode-ico{width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}'
    + '.abl-mode-title{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.abl-mode-desc{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    + '.abl-mode-check{position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center}'
    /* Warning balloon */
    + '.abl-warning{display:flex;gap:10px;padding:12px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.02));border:1px solid rgba(239,68,68,0.3)}'
    /* Sect */
    + '.abl-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:8px}'
    + '.abl-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.abl-sect-head span:first-of-type{flex:1}'
    + '.abl-sect-badge{font:var(--fw-bold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full)}'
    + '.abl-sect-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-muted);margin-top:-3px}'
    /* Toggle list */
    + '.abl-toggle-list{display:flex;flex-direction:column;gap:6px}'
    + '.abl-tog-item{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);cursor:pointer;transition:all .15s}'
    + '.abl-tog-item:hover{border-color:#F97316}'
    + '.abl-tog-item.on{background:linear-gradient(to right,rgba(249,115,22,0.06),transparent 70%);border-color:rgba(249,115,22,0.3)}'
    + '.abl-tog-ico{width:28px;height:28px;border-radius:var(--r-md);background:var(--bg-phone-secondary);color:var(--text-muted);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.abl-tog-item.on .abl-tog-ico{background:rgba(249,115,22,0.15);color:#F97316}'
    + '.abl-tog-body{flex:1;min-width:0}'
    + '.abl-tog-lbl{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary)}'
    + '.abl-tog-desc{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:2px}'
    + '.abl-tog{width:34px;height:18px;border-radius:var(--r-full);background:var(--border-subtle);position:relative;transition:background .2s;flex-shrink:0}'
    + '.abl-tog.on{background:#F97316}'
    + '.abl-tog-dot{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}'
    + '.abl-tog.on .abl-tog-dot{transform:translateX(16px)}'
    /* Form fields */
    + '.abl-field{display:flex;flex-direction:column;gap:4px}'
    + '.abl-field label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.abl-input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.abl-input:focus{border-color:#EF4444}'
    + '.abl-textarea{width:100%;box-sizing:border-box;min-height:64px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical}'
    + '.abl-textarea:focus{border-color:#8B5CF6}'
    + '.abl-textarea--admin{background:linear-gradient(135deg,rgba(139,92,246,0.04),transparent);border-color:rgba(139,92,246,0.2)}'
    + '.abl-clear-date{align-self:flex-start;padding:5px 10px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-muted);font:var(--fw-medium) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.abl-clear-date:hover{border-color:#EF4444;color:#EF4444}'
    /* CTA */
    + '.abl-cta{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#EF4444,#B91C1C);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:transform .1s,opacity .15s}'
    + '.abl-cta:hover{opacity:0.92}'
    + '.abl-cta:active{transform:scale(0.99)}'
    + '.abl-cta.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.75}'
    /* Detail drawer */
    + '.abl-detail-hero{border-radius:var(--r-xl);padding:18px;color:#fff;position:relative;overflow:hidden}'
    + '.abl-detail-avatar{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 22px/1 var(--font);color:#fff}'
    + '.abl-tl-cell{padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.abl-tl-lbl{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.abl-tl-val{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary);margin-top:5px}'
    + '.abl-detail-rest-list{display:flex;flex-direction:column;gap:4px}'
    + '.abl-detail-rest{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-medium) 11px/1 var(--font)}'
    + '.abl-detail-rest.on{background:rgba(249,115,22,0.08)}'
    + '.abl-note-box{padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.abl-note-box--admin{background:rgba(139,92,246,0.04);border:1px dashed rgba(139,92,246,0.25)}'
    + '.abl-note-lbl{display:flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:5px}'
    + '.abl-note-text{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    + '.abl-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}'
    + '.abl-act-btn{padding:11px;border:none;border-radius:var(--r-md);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:opacity .15s}'
    + '.abl-act-btn:hover{opacity:0.88}'
    /* Sabıka */
    + '.abl-hist{display:flex;flex-direction:column;gap:8px;padding-left:4px;position:relative}'
    + '.abl-hist:before{content:"";position:absolute;left:9px;top:8px;bottom:8px;width:2px;background:var(--border-subtle);border-radius:1px}'
    + '.abl-hist-item{display:flex;align-items:flex-start;gap:10px;position:relative;z-index:1}'
    + '.abl-hist-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:3px;border:2px solid var(--bg-phone)}'
    + '.abl-hist-action{font:var(--fw-bold) 10px/1 var(--font);text-transform:uppercase;letter-spacing:.3px}'
    + '.abl-hist-reason{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary)}'
    + '.abl-hist-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}';
  var s = document.createElement('style');
  s.id = 'ablStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

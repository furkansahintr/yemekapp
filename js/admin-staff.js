/* ═══════════════════════════════════════════════════════════
   ADMIN STAFF — Personel Yönetimi (Liste / Ekle / Detay)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _ast = {
  search: '',
  branchFilter: '',
  roleFilter: '',
  detailId: null,
  modalOpen: false,
  modalBranchSearch: '',
  modalBranchOpen: false,
  modalSelectedBranchId: '',
  modalSelectedRole: '',
  modalEmail: '',
  modalPhone: '',
  modalRandom: null
};

/* ═══ Overlay Aç ═══ */
function _admOpenStaff() {
  _admInjectStyles();
  _astInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="_astCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Personel</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:3px">Tüm şubelerdeki personel yönetimi</div></div>'
    + '<div class="ast-fab" onclick="_astOpenAdd()" title="Personel Ekle"><iconify-icon icon="solar:add-circle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '</div>'
    + '<div id="adminStaffContainer" style="flex:1"></div>';
  adminPhone.appendChild(overlay);

  // State reset
  _ast.search = '';
  _ast.branchFilter = '';
  _ast.roleFilter = '';
  renderAdminStaff();
}

function _astCloseOverlay() {
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var o = adminPhone.querySelector('.prof-overlay');
  if (o) o.remove();
  _astCloseAdd();
  _astCloseDetail();
}

/* ═══ Ana Render (doldurulacak P2-P3'te) ═══ */
function renderAdminStaff() {
  var c = document.getElementById('adminStaffContainer');
  if (!c) return;
  var list = _astFilteredStaff();

  var h = '<div class="adm-fadeIn" style="padding:14px 16px 24px;display:flex;flex-direction:column;gap:12px">';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="ast-search" placeholder="İsim, telefon veya personel ID..." value="' + _astEsc(_ast.search) + '" oninput="_astSetSearch(this.value)" />'
    + '</div>';

  // Filters — P3'te dolacak
  h += _astRenderFilters();

  // Liste başlığı
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + list.length + ' personel listeleniyor</div>'
    + ((_ast.search || _ast.branchFilter || _ast.roleFilter) ? '<button class="ast-reset" onclick="_astResetFilters()">Temizle</button>' : '')
    + '</div>';

  // Liste
  h += _astRenderList(list);

  h += '</div>';
  c.innerHTML = h;
}

/* ═══ Helpers ═══ */
function _astEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _astRoleDef(roleId) {
  for (var i = 0; i < ADMIN_STAFF_ROLES.length; i++) {
    if (ADMIN_STAFF_ROLES[i].id === roleId) return ADMIN_STAFF_ROLES[i];
  }
  return { id: roleId, label: roleId, color: '#6B7280' };
}

function _astSetSearch(v) { _ast.search = v; renderAdminStaff(); }
function _astSetBranch(v) { _ast.branchFilter = v; renderAdminStaff(); }
function _astSetRole(v) { _ast.roleFilter = _ast.roleFilter === v ? '' : v; renderAdminStaff(); }
function _astResetFilters() {
  _ast.search = ''; _ast.branchFilter = ''; _ast.roleFilter = '';
  renderAdminStaff();
}

/* ═══════════════════════════════════════
   P3 — Filtre UI (Şube dropdown + Rol chip'leri)
   ═══════════════════════════════════════ */
function _astRenderFilters() {
  var h = '<div style="display:flex;flex-direction:column;gap:8px">';

  // Şube dropdown — native select (searchable dropdown'ı modal için saklıyoruz)
  var selected = _ast.branchFilter;
  var selectedLabel = 'Tüm şubeler';
  if (selected) {
    var br = ADMIN_BRANCHES.find(function(b) { return b.id === selected; });
    if (br) selectedLabel = br.businessName + ' · ' + br.name;
  }

  h += '<div style="position:relative">'
    + '<select class="ast-select" onchange="_astSetBranch(this.value)">'
    + '<option value="">Tüm şubeler</option>';
  // İşletmeye göre grupla
  var grouped = {};
  for (var i = 0; i < ADMIN_BRANCHES.length; i++) {
    var b = ADMIN_BRANCHES[i];
    if (!grouped[b.businessName]) grouped[b.businessName] = [];
    grouped[b.businessName].push(b);
  }
  var bizNames = Object.keys(grouped).sort();
  for (var gi = 0; gi < bizNames.length; gi++) {
    h += '<optgroup label="' + _astEsc(bizNames[gi]) + '">';
    var arr = grouped[bizNames[gi]];
    for (var j = 0; j < arr.length; j++) {
      var br2 = arr[j];
      var sel = (br2.id === selected) ? ' selected' : '';
      h += '<option value="' + br2.id + '"' + sel + '>' + _astEsc(br2.name) + ' · ' + _astEsc(br2.city) + '</option>';
    }
    h += '</optgroup>';
  }
  h += '</select>'
    + '<iconify-icon icon="solar:alt-arrow-down-linear" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-muted);pointer-events:none"></iconify-icon>'
    + '</div>';

  // Rol chip satırı
  h += '<div class="ast-chip-row">';
  h += '<button class="ast-chip' + (!_ast.roleFilter ? ' active' : '') + '" onclick="_astSetRole(\'\')">Tümü</button>';
  for (var ri = 0; ri < ADMIN_STAFF_ROLES.length; ri++) {
    var r = ADMIN_STAFF_ROLES[ri];
    var active = _ast.roleFilter === r.id;
    h += '<button class="ast-chip' + (active ? ' active' : '') + '" '
      + 'style="' + (active ? 'border-color:' + r.color + ';background:' + r.color + '18;color:' + r.color : '') + '" '
      + 'onclick="_astSetRole(\'' + r.id + '\')">' + r.label + '</button>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   P2 — Filtre Logic + Liste Kartları
   ═══════════════════════════════════════ */
function _astFilteredStaff() {
  var list = ADMIN_STAFF.slice();

  if (_ast.branchFilter) {
    list = list.filter(function(s) { return s.branchId === _ast.branchFilter; });
  }
  if (_ast.roleFilter) {
    list = list.filter(function(s) { return s.role === _ast.roleFilter; });
  }
  if (_ast.search.trim()) {
    var q = _ast.search.toLowerCase().trim();
    list = list.filter(function(s) {
      return s.name.toLowerCase().indexOf(q) > -1
        || s.phone.toLowerCase().indexOf(q) > -1
        || s.id.toLowerCase().indexOf(q) > -1
        || (s.email && s.email.toLowerCase().indexOf(q) > -1);
    });
  }
  // Kronolojik: en yeni üstte
  list.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  return list;
}

function _astRenderList(list) {
  if (list.length === 0) {
    return '<div style="text-align:center;padding:48px 20px">'
      + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:48px;color:var(--text-muted);opacity:0.3"></iconify-icon>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);margin-top:12px">Personel bulunamadı</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-top:4px">Filtreleri temizleyip tekrar dene</div>'
      + '</div>';
  }

  var h = '<div style="display:flex;flex-direction:column;gap:6px">';
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    var r = _astRoleDef(s.role);
    var stColor = s.status === 'active' ? '#22C55E' : '#F97316';
    var stLabel = s.status === 'active' ? 'Aktif' : 'Engelli';
    h += '<div class="ast-row" onclick="_astOpenDetail(\'' + s.id + '\')">'
      + '<div class="ast-avatar" style="background:linear-gradient(135deg,' + r.color + ',' + r.color + 'cc)">' + _astEsc(s.name.charAt(0)) + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
      + '<span class="ast-name">' + _astEsc(s.name) + '</span>'
      + '<span class="ast-badge" style="background:' + r.color + '18;color:' + r.color + '">' + r.label + '</span>'
      + (s.status !== 'active' ? '<span class="ast-badge" style="background:' + stColor + '18;color:' + stColor + '">' + stLabel + '</span>' : '')
      + '</div>'
      + '<div class="ast-meta">' + _astEsc(s.businessName) + ' · ' + _astEsc(s.branchName) + ' · ' + _astEsc(s.id) + '</div>'
      + '</div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<div class="ast-meta" style="margin:0">' + _admRelative(s.createdAt) + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);margin-top:4px"></iconify-icon>'
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   P4A — Ekleme Modal (aç/kapat + random creds)
   ═══════════════════════════════════════ */
function _astGenRandomCreds() {
  var adj = ['swift','calm','bright','silent','sharp','bold','quiet','brisk','witty','lucky'];
  var noun = ['falcon','tiger','river','canyon','comet','ember','willow','breeze','harbor','summit'];
  var a = adj[Math.floor(Math.random() * adj.length)];
  var n = noun[Math.floor(Math.random() * noun.length)];
  var num = 100 + Math.floor(Math.random() * 900);
  var username = a + '.' + n + num;
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  var pw = '';
  for (var i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return { username: username, password: pw };
}

function _astOpenAdd() {
  _astCloseAdd();
  _ast.modalOpen = true;
  _ast.modalRandom = _astGenRandomCreds();
  _ast.modalSelectedBranchId = '';
  _ast.modalSelectedRole = '';
  _ast.modalEmail = '';
  _ast.modalPhone = '';
  _ast.modalBranchSearch = '';
  _ast.modalBranchOpen = false;

  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var m = document.createElement('div');
  m.id = 'astAddModal';
  m.className = 'ast-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _astCloseAdd(); };
  m.innerHTML = '<div class="ast-modal"><div id="astAddBody" class="ast-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _astRenderAddBody();
}

function _astCloseAdd() {
  var m = document.getElementById('astAddModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 280);
  _ast.modalOpen = false;
}

function _astRegenCreds() {
  _ast.modalRandom = _astGenRandomCreds();
  _astRenderAddBody();
}

function _astCopy(val, label) {
  try {
    if (navigator.clipboard) navigator.clipboard.writeText(val);
  } catch (e) {}
  _admToast(label + ' kopyalandı', 'ok');
}

/* ═══════════════════════════════════════
   P4B — Modal Body (form + searchable branch dropdown)
   ═══════════════════════════════════════ */
function _astRenderAddBody() {
  var body = document.getElementById('astAddBody');
  if (!body) return;
  var creds = _ast.modalRandom || { username: '', password: '' };
  var selBranch = _ast.modalSelectedBranchId
    ? ADMIN_BRANCHES.find(function(b) { return b.id === _ast.modalSelectedBranchId; })
    : null;
  var ready = _ast.modalSelectedBranchId && _ast.modalSelectedRole && _ast.modalEmail && _ast.modalPhone;

  var h = '';

  // Header
  h += '<div class="ast-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center">'
    + '<iconify-icon icon="solar:user-plus-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div><div class="ast-mtitle">Yeni Personel Ekle</div>'
    + '<div class="ast-msub">Otomatik kimlik bilgisi ve şube atama</div></div>'
    + '</div>'
    + '<div class="ast-close" onclick="_astCloseAdd()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Otomatik atama kartı
  h += '<div class="ast-sect">'
    + '<div class="ast-sect-head"><iconify-icon icon="solar:key-minimalistic-square-3-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon><span>Otomatik Atama</span>'
    + '<button class="ast-regen" onclick="_astRegenCreds()"><iconify-icon icon="solar:refresh-linear" style="font-size:12px"></iconify-icon>Yenile</button>'
    + '</div>'
    + '<div class="ast-field-row">'
    + '<div class="ast-field"><label>Kullanıcı Adı</label>'
    + '<div class="ast-readonly"><span>' + _astEsc(creds.username) + '</span>'
    + '<button onclick="_astCopy(\'' + _astEsc(creds.username) + '\', \'Kullanıcı adı\')"><iconify-icon icon="solar:copy-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div></div>'
    + '<div class="ast-field"><label>Şifre</label>'
    + '<div class="ast-readonly"><span style="font-family:monospace">' + _astEsc(creds.password) + '</span>'
    + '<button onclick="_astCopy(\'' + _astEsc(creds.password) + '\', \'Şifre\')"><iconify-icon icon="solar:copy-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div></div>'
    + '</div>'
    + '<div class="ast-hint"><iconify-icon icon="solar:info-circle-linear" style="font-size:12px"></iconify-icon>Sistem tarafından otomatik üretildi. Personel ilk girişte değiştirmelidir.</div>'
    + '</div>';

  // İletişim
  h += '<div class="ast-sect">'
    + '<div class="ast-sect-head"><iconify-icon icon="solar:phone-bold" style="font-size:16px;color:#22C55E"></iconify-icon><span>İletişim Bilgileri</span></div>'
    + '<div class="ast-field"><label>E-posta</label>'
    + '<input class="ast-input" type="email" placeholder="personel@isletme.com" value="' + _astEsc(_ast.modalEmail) + '" oninput="_ast.modalEmail=this.value;_astUpdateCTA()" />'
    + '</div>'
    + '<div class="ast-field"><label>Telefon</label>'
    + '<input class="ast-input" type="tel" placeholder="+90 555 000 0000" value="' + _astEsc(_ast.modalPhone) + '" oninput="_ast.modalPhone=this.value;_astUpdateCTA()" />'
    + '</div>'
    + '</div>';

  // Şube — Searchable Dropdown
  h += '<div class="ast-sect">'
    + '<div class="ast-sect-head"><iconify-icon icon="solar:shop-bold" style="font-size:16px;color:#F97316"></iconify-icon><span>Şube Seçimi</span></div>'
    + '<div class="ast-dd" id="astBranchDD">'
    + '<div class="ast-dd-trigger" onclick="_astToggleBranchDD()">'
    + (selBranch
        ? '<div><div class="ast-dd-main">' + _astEsc(selBranch.businessName) + '</div><div class="ast-dd-sub">' + _astEsc(selBranch.name) + ' · ' + _astEsc(selBranch.city) + '</div></div>'
        : '<div class="ast-dd-placeholder">Şube ara ve seç...</div>')
    + '<iconify-icon icon="solar:alt-arrow-down-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
    + '</div>';

  if (_ast.modalBranchOpen) {
    h += '<div class="ast-dd-panel">'
      + '<div class="ast-dd-search">'
      + '<iconify-icon icon="solar:magnifer-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
      + '<input placeholder="Şube veya işletme ara..." value="' + _astEsc(_ast.modalBranchSearch) + '" oninput="_ast.modalBranchSearch=this.value;_astRenderAddBody();this.focus();" autofocus />'
      + '</div>'
      + '<div class="ast-dd-list">';
    var q = _ast.modalBranchSearch.toLowerCase().trim();
    var matches = ADMIN_BRANCHES.filter(function(b) {
      if (!q) return true;
      return b.name.toLowerCase().indexOf(q) > -1
        || b.businessName.toLowerCase().indexOf(q) > -1
        || b.city.toLowerCase().indexOf(q) > -1;
    });
    if (matches.length === 0) {
      h += '<div class="ast-dd-empty">Eşleşen şube bulunamadı</div>';
    } else {
      for (var di = 0; di < matches.length; di++) {
        var mb = matches[di];
        var isSel = mb.id === _ast.modalSelectedBranchId;
        h += '<div class="ast-dd-item' + (isSel ? ' selected' : '') + '" onclick="_astSelectBranch(\'' + mb.id + '\')">'
          + '<div><div class="ast-dd-main">' + _astEsc(mb.businessName) + '</div>'
          + '<div class="ast-dd-sub">' + _astEsc(mb.name) + ' · ' + _astEsc(mb.city) + '</div></div>'
          + (isSel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px;color:#22C55E"></iconify-icon>' : '')
          + '</div>';
      }
    }
    h += '</div></div>';
  }
  h += '</div></div>';

  // Rol
  h += '<div class="ast-sect">'
    + '<div class="ast-sect-head"><iconify-icon icon="solar:shield-user-bold" style="font-size:16px;color:#3B82F6"></iconify-icon><span>Rol Tanımlama</span></div>'
    + '<div class="ast-chip-row">';
  for (var rri = 0; rri < ADMIN_STAFF_ROLES.length; rri++) {
    var rr = ADMIN_STAFF_ROLES[rri];
    var isSel2 = _ast.modalSelectedRole === rr.id;
    h += '<button class="ast-chip' + (isSel2 ? ' active' : '') + '" '
      + 'style="' + (isSel2 ? 'border-color:' + rr.color + ';background:' + rr.color + '18;color:' + rr.color : '') + '" '
      + 'onclick="_ast.modalSelectedRole=\'' + rr.id + '\';_astRenderAddBody()">' + rr.label + '</button>';
  }
  h += '</div></div>';

  // CTA
  h += '<button id="astSubmitBtn" class="ast-cta' + (ready ? '' : ' disabled') + '" onclick="_astSubmitAdd()"' + (ready ? '' : ' disabled') + '>'
    + '<iconify-icon icon="solar:user-check-bold" style="font-size:16px"></iconify-icon>'
    + 'Personeli Tanımla</button>';

  body.innerHTML = h;
}

function _astToggleBranchDD() {
  _ast.modalBranchOpen = !_ast.modalBranchOpen;
  _astRenderAddBody();
}

function _astSelectBranch(id) {
  _ast.modalSelectedBranchId = id;
  _ast.modalBranchOpen = false;
  _ast.modalBranchSearch = '';
  _astRenderAddBody();
}

function _astUpdateCTA() {
  var btn = document.getElementById('astSubmitBtn');
  if (!btn) return;
  var ready = _ast.modalSelectedBranchId && _ast.modalSelectedRole && _ast.modalEmail && _ast.modalPhone;
  if (ready) { btn.classList.remove('disabled'); btn.removeAttribute('disabled'); }
  else { btn.classList.add('disabled'); btn.setAttribute('disabled', 'disabled'); }
}

function _astSubmitAdd() {
  if (!_ast.modalSelectedBranchId || !_ast.modalSelectedRole || !_ast.modalEmail || !_ast.modalPhone) {
    _admToast('Lütfen tüm alanları doldurun', 'err');
    return;
  }
  var branch = ADMIN_BRANCHES.find(function(b) { return b.id === _ast.modalSelectedBranchId; });
  if (!branch) { _admToast('Şube bulunamadı', 'err'); return; }

  var nextIdNum = 1000 + ADMIN_STAFF.length;
  // Benzersiz ID
  while (ADMIN_STAFF.find(function(s) { return s.id === 'ast_' + String(nextIdNum).padStart(4, '0'); })) {
    nextIdNum++;
  }

  // Ad = username'den üret (son numarayı at, noktaları boşluğa çevir)
  var rawName = _ast.modalRandom.username.replace(/\d+$/, '').replace(/\./g, ' ');
  var prettyName = rawName.split(' ').filter(Boolean).map(function(w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');

  var newStaff = {
    id: 'ast_' + String(nextIdNum).padStart(4, '0'),
    name: prettyName,
    phone: _ast.modalPhone,
    email: _ast.modalEmail,
    username: _ast.modalRandom.username,
    password: _ast.modalRandom.password,
    avatar: null,
    businessId: branch.businessId,
    businessName: branch.businessName,
    branchId: branch.id,
    branchName: branch.name,
    role: _ast.modalSelectedRole,
    status: 'active',
    createdAt: new Date().toISOString(),
    shifts: (typeof _admGenShifts === 'function' ? _admGenShifts(new Date().toISOString(), 0.6) : [])
  };

  ADMIN_STAFF.unshift(newStaff);
  _astCloseAdd();
  _admToast('Personel tanımlandı: ' + prettyName, 'ok');
  renderAdminStaff();
}

/* ═══════════════════════════════════════
   P5 — Detay Drawer (Hero + Genel Bilgi + Görev)
   ═══════════════════════════════════════ */
function _astOpenDetail(id) {
  _astCloseDetail();
  var s = ADMIN_STAFF.find(function(x) { return x.id === id; });
  if (!s) { _admToast('Personel bulunamadı', 'err'); return; }
  _ast.detailId = id;
  _astRenderDetail();
}

function _astCloseDetail() {
  var d = document.getElementById('astDrawer');
  if (!d) return;
  d.classList.remove('open');
  setTimeout(function() { if (d.parentNode) d.remove(); }, 280);
  _ast.detailId = null;
}

function _astRenderDetail() {
  var s = ADMIN_STAFF.find(function(x) { return x.id === _ast.detailId; });
  if (!s) return;
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  var r = _astRoleDef(s.role);
  var isBlocked = s.status === 'blocked';

  var existing = document.getElementById('astDrawer');
  if (existing) existing.remove();

  var d = document.createElement('div');
  d.id = 'astDrawer';
  d.className = 'mbr-drawer-backdrop';
  d.onclick = function(e) { if (e.target === d) _astCloseDetail(); };

  var h = '<div class="mbr-drawer"><div class="mbr-drawer-scroll">';

  // Top bar
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Personel 360°</span>'
    + '<div class="mbr-icon-btn" onclick="_astCloseDetail()" style="width:30px;height:30px"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-muted)"></iconify-icon></div>'
    + '</div>';

  // ── Hero
  var grad = 'linear-gradient(135deg,' + r.color + ',' + r.color + 'aa)';
  h += '<div style="background:' + grad + ';border-radius:var(--r-xl);padding:18px;color:#fff;margin-bottom:14px;position:relative;overflow:hidden">'
    + '<div style="position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.1)"></div>'
    + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">'
    + '<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 26px/1 var(--font)">' + _astEsc(s.name.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)">' + _astEsc(s.name) + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);opacity:.8;margin-top:5px">' + _astEsc(s.id) + ' · ' + _astEsc(r.label) + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.22);color:#fff">' + (isBlocked ? 'Engelli' : 'Aktif') + '</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.22);color:#fff">' + _astEsc(s.businessName) + '</span>'
    + '<span class="mbr-badge" style="background:rgba(255,255,255,0.22);color:#fff">' + _astEsc(s.branchName) + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:.75;margin-top:10px">Kayıt: ' + _admDate(s.createdAt) + '</div>'
    + '</div>';

  // ── Genel Bilgiler
  h += '<div class="ast-sect"><div class="ast-sect-head"><iconify-icon icon="solar:user-id-bold" style="font-size:16px;color:#3B82F6"></iconify-icon><span>Genel Bilgiler</span></div>';
  h += _astInfoRow('solar:user-bold', 'Ad-Soyad', s.name);
  h += _astInfoRowLink('solar:letter-bold', 'E-posta', s.email, 'mailto:' + s.email);
  h += _astInfoRowLink('solar:phone-bold', 'Telefon', s.phone, 'tel:' + s.phone);
  h += _astInfoRow('solar:key-minimalistic-square-3-bold', 'Kullanıcı Adı', s.username);
  h += '</div>';

  // ── Görev Detayları
  h += '<div class="ast-sect"><div class="ast-sect-head"><iconify-icon icon="solar:buildings-3-bold" style="font-size:16px;color:#F97316"></iconify-icon><span>Görev Detayları</span></div>'
    + '<div class="ast-task-card" style="border-left:4px solid ' + r.color + '">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    + '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + _astEsc(s.businessName) + '</span>'
    + '<span class="mbr-badge" style="background:' + r.color + '18;color:' + r.color + '">' + _astEsc(r.label) + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">'
    + '<iconify-icon icon="solar:map-point-bold" style="font-size:11px;color:var(--text-muted);margin-right:3px"></iconify-icon>'
    + _astEsc(s.branchName) + ' şubesi'
    + '</div></div></div>';

  // ── Placeholder: Vardiya + Aksiyonlar (P6'da eklenecek)
  h += _astRenderShifts(s);
  h += _astRenderActions(s);

  h += '</div></div>';
  d.innerHTML = h;
  adminPhone.appendChild(d);
  requestAnimationFrame(function() { d.classList.add('open'); });
}

function _astInfoRow(icon, label, value) {
  return '<div class="ast-info-row">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px;color:var(--text-muted);flex-shrink:0"></iconify-icon>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="ast-info-lbl">' + label + '</div>'
    + '<div class="ast-info-val">' + _astEsc(value || '—') + '</div>'
    + '</div></div>';
}

function _astInfoRowLink(icon, label, value, href) {
  return '<a class="ast-info-row" href="' + _astEsc(href) + '" style="text-decoration:none">'
    + '<iconify-icon icon="' + icon + '" style="font-size:14px;color:var(--text-muted);flex-shrink:0"></iconify-icon>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="ast-info-lbl">' + label + '</div>'
    + '<div class="ast-info-val" style="color:#3B82F6">' + _astEsc(value || '—') + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:arrow-right-up-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
    + '</a>';
}

/* ═══════════════════════════════════════
   P6 — Vardiya Listesi + Aksiyonlar
   ═══════════════════════════════════════ */
function _astRenderShifts(s) {
  var shifts = (s.shifts || []).slice();
  // Tarihe göre sırala
  shifts.sort(function(a, b) { return a.date.localeCompare(b.date); });

  var now = new Date().toISOString().slice(0, 10);
  var upcoming = shifts.filter(function(sh) { return sh.date >= now; }).length;
  var completed = shifts.filter(function(sh) { return sh.status === 'completed'; }).length;

  var h = '<div class="ast-sect"><div class="ast-sect-head"><iconify-icon icon="solar:calendar-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon><span>Vardiya Yönetimi</span></div>';

  // Özet mini kartlar
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">'
    + '<div class="ast-mini" style="background:#8B5CF610"><div style="color:#8B5CF6">' + shifts.length + '</div><span>Toplam</span></div>'
    + '<div class="ast-mini" style="background:#22C55E10"><div style="color:#22C55E">' + completed + '</div><span>Tamamlanan</span></div>'
    + '<div class="ast-mini" style="background:#3B82F610"><div style="color:#3B82F6">' + upcoming + '</div><span>Planlı</span></div>'
    + '</div>';

  if (shifts.length === 0) {
    h += '<div style="text-align:center;padding:20px;color:var(--text-muted);font:var(--fw-regular) var(--fs-xs)/1.3 var(--font)">Vardiya kaydı bulunmuyor</div>';
  } else {
    h += '<div class="ast-shifts">';
    for (var i = 0; i < shifts.length; i++) {
      var sh = shifts[i];
      var stColor, stLabel, stIcon;
      if (sh.status === 'completed') { stColor = '#22C55E'; stLabel = 'Tamamlandı'; stIcon = 'solar:check-circle-bold'; }
      else if (sh.status === 'missed') { stColor = '#EF4444'; stLabel = 'Kaçırıldı'; stIcon = 'solar:close-circle-bold'; }
      else { stColor = '#3B82F6'; stLabel = 'Planlı'; stIcon = 'solar:clock-circle-bold'; }

      var isToday = sh.date === now;
      var dateObj = new Date(sh.date + 'T00:00:00');
      var dayLbl = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
      var weekLbl = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });

      h += '<div class="ast-shift' + (isToday ? ' today' : '') + '">'
        + '<div class="ast-shift-date">'
        + '<div class="ast-shift-day">' + dayLbl + '</div>'
        + '<div class="ast-shift-week">' + weekLbl + (isToday ? ' · Bugün' : '') + '</div>'
        + '</div>'
        + '<div class="ast-shift-core">'
        + '<div class="ast-shift-label">' + _astEsc(sh.label) + ' Vardiya</div>'
        + '<div class="ast-shift-time"><iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon>' + _astEsc(sh.start) + ' – ' + _astEsc(sh.end) + '</div>'
        + '</div>'
        + '<div class="ast-shift-status" style="color:' + stColor + ';background:' + stColor + '15">'
        + '<iconify-icon icon="' + stIcon + '" style="font-size:11px"></iconify-icon>' + stLabel
        + '</div>'
        + '</div>';
    }
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _astRenderActions(s) {
  var isBlocked = s.status === 'blocked';
  var h = '<div class="ast-actions">';
  // Engelle / Engeli Kaldır (Turuncu)
  if (isBlocked) {
    h += '<button class="ast-act-btn" style="background:#DCFCE7;color:#16A34A" onclick="_astToggleBlock(\'' + s.id + '\')">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:16px"></iconify-icon>Engeli Kaldır</button>';
  } else {
    h += '<button class="ast-act-btn" style="background:#FED7AA;color:#F97316" onclick="_astToggleBlock(\'' + s.id + '\')">'
      + '<iconify-icon icon="solar:forbidden-circle-bold" style="font-size:16px"></iconify-icon>Personeli Engelle</button>';
  }
  // Sil (Kırmızı)
  h += '<button class="ast-act-btn" style="background:#FEE2E2;color:#EF4444" onclick="_astDeleteStaff(\'' + s.id + '\')">'
    + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:16px"></iconify-icon>Personeli Sil</button>';
  h += '</div>';
  return h;
}

function _astToggleBlock(id) {
  var s = ADMIN_STAFF.find(function(x) { return x.id === id; });
  if (!s) return;
  if (s.status === 'blocked') {
    s.status = 'active';
    _admToast(s.name + ': engel kaldırıldı', 'ok');
  } else {
    s.status = 'blocked';
    _admToast(s.name + ': engellendi', 'ok');
  }
  _astRenderDetail();
  renderAdminStaff();
}

function _astDeleteStaff(id) {
  var idx = ADMIN_STAFF.findIndex(function(x) { return x.id === id; });
  if (idx === -1) return;
  var name = ADMIN_STAFF[idx].name;
  // Basit confirm — prototip
  if (!confirm(name + ' kalıcı olarak silinecek. Emin misiniz?')) return;
  ADMIN_STAFF.splice(idx, 1);
  _astCloseDetail();
  _admToast(name + ' silindi', 'ok');
  renderAdminStaff();
}

/* ═══════════════════════════════════════
   P7 — Stiller
   ═══════════════════════════════════════ */
function _astInjectStyles() {
  if (document.getElementById('astStyles')) return;
  var css = ''
    + '.ast-fab{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,0.35);transition:transform .15s}'
    + '.ast-fab:active{transform:scale(0.92)}'
    + '.ast-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.ast-search:focus{border-color:var(--primary)}'
    + '.ast-select{width:100%;box-sizing:border-box;padding:10px 32px 10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;appearance:none;-webkit-appearance:none;cursor:pointer}'
    + '.ast-select:focus{border-color:var(--primary)}'
    + '.ast-chip-row{display:flex;gap:6px;flex-wrap:wrap}'
    + '.ast-chip{padding:6px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap}'
    + '.ast-chip:hover{background:var(--bg-phone-secondary)}'
    + '.ast-chip.active{border-color:var(--primary);background:var(--primary-soft);color:var(--primary)}'
    + '.ast-reset{padding:4px 10px;border-radius:var(--r-full);border:1px solid #EF4444;background:rgba(239,68,68,0.08);color:#EF4444;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer}'
    + '.ast-row{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:10px 12px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .15s}'
    + '.ast-row:hover{background:var(--bg-phone-secondary);border-color:var(--primary)}'
    + '.ast-row:active{transform:scale(0.99);opacity:0.92}'
    + '.ast-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font:var(--fw-bold) 14px/1 var(--font)}'
    + '.ast-name{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.ast-badge{font:var(--fw-semibold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);white-space:nowrap}'
    + '.ast-meta{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    /* Modal */
    + '.ast-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.ast-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.ast-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.ast-modal-backdrop.open .ast-modal{transform:translateY(0)}'
    + '.ast-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px}'
    + '.ast-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:6px}'
    + '.ast-mtitle{font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.ast-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.ast-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    /* Sections */
    + '.ast-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:10px}'
    + '.ast-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.ast-sect-head span{flex:1}'
    + '.ast-regen{margin-left:auto;padding:4px 8px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:var(--bg-phone-secondary);color:var(--text-secondary);font:var(--fw-medium) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.ast-regen:hover{border-color:var(--primary);color:var(--primary)}'
    + '.ast-field-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.ast-field{display:flex;flex-direction:column;gap:4px}'
    + '.ast-field label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.ast-input{box-sizing:border-box;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.ast-input:focus{border-color:var(--primary)}'
    + '.ast-readonly{display:flex;align-items:center;gap:6px;padding:10px 10px 10px 12px;border:1px dashed var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone-secondary);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.ast-readonly span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.ast-readonly button{width:24px;height:24px;border:none;background:var(--bg-phone);border-radius:var(--r-sm);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center}'
    + '.ast-readonly button:hover{color:var(--primary)}'
    + '.ast-hint{display:flex;align-items:center;gap:5px;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    /* Searchable dropdown */
    + '.ast-dd{position:relative}'
    + '.ast-dd-trigger{border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:10px 12px;background:var(--bg-phone);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}'
    + '.ast-dd-trigger:hover{border-color:var(--primary)}'
    + '.ast-dd-main{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.ast-dd-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:2px}'
    + '.ast-dd-placeholder{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)}'
    + '.ast-dd-panel{margin-top:6px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);max-height:260px;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow-md)}'
    + '.ast-dd-search{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--border-subtle)}'
    + '.ast-dd-search input{flex:1;border:none;outline:none;background:transparent;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.ast-dd-list{overflow-y:auto;flex:1}'
    + '.ast-dd-item{padding:10px 12px;border-bottom:1px solid var(--border-subtle);cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;transition:background .15s}'
    + '.ast-dd-item:last-child{border-bottom:none}'
    + '.ast-dd-item:hover{background:var(--bg-phone-secondary)}'
    + '.ast-dd-item.selected{background:var(--primary-soft)}'
    + '.ast-dd-empty{padding:20px;text-align:center;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)}'
    /* CTA */
    + '.ast-cta{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:opacity .15s,transform .1s;box-shadow:0 4px 12px rgba(99,102,241,0.3)}'
    + '.ast-cta:hover{opacity:0.92}'
    + '.ast-cta:active{transform:scale(0.99)}'
    + '.ast-cta.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.7}'
    /* Detail */
    + '.ast-info-row{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--border-subtle);text-decoration:none;color:inherit}'
    + '.ast-info-row:last-child{border-bottom:none}'
    + '.ast-info-lbl{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.ast-info-val{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.ast-task-card{background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:12px}'
    + '.ast-mini{border-radius:var(--r-md);padding:10px 6px;text-align:center}'
    + '.ast-mini>div{font:var(--fw-bold) var(--fs-md)/1 var(--font)}'
    + '.ast-mini>span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);display:block;margin-top:4px}'
    /* Shifts */
    + '.ast-shifts{display:flex;flex-direction:column;gap:4px}'
    + '.ast-shift{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone)}'
    + '.ast-shift.today{border-color:#8B5CF6;background:linear-gradient(to right,#8B5CF608,transparent 60%)}'
    + '.ast-shift-date{width:54px;flex-shrink:0;text-align:center;padding-right:10px;border-right:1px solid var(--border-subtle)}'
    + '.ast-shift-day{font:var(--fw-bold) 12px/1 var(--font);color:var(--text-primary)}'
    + '.ast-shift-week{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.ast-shift-core{flex:1;min-width:0}'
    + '.ast-shift-label{font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.ast-shift-time{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px;display:flex;align-items:center;gap:3px}'
    + '.ast-shift-status{font:var(--fw-semibold) 9px/1 var(--font);padding:4px 7px;border-radius:var(--r-full);display:inline-flex;align-items:center;gap:3px;white-space:nowrap}'
    /* Actions */
    + '.ast-actions{display:flex;flex-direction:column;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle)}'
    + '.ast-act-btn{padding:12px;border:none;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:opacity .15s,transform .1s}'
    + '.ast-act-btn:hover{opacity:0.88}'
    + '.ast-act-btn:active{transform:scale(0.99)}';
  var s = document.createElement('style');
  s.id = 'astStyles';
  s.textContent = css;
  document.head.appendChild(s);
}

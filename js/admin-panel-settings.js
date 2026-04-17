/* ═══════════════════════════════════════════════════════════
   ADMIN PANEL SETTINGS — Süper Admin Yetki Kulesi
   (Gating • Admin listesi • 360 detay • Aktivite logu •
    Hassas ayarlar: Görev/Yetki matrisi)
   ═══════════════════════════════════════════════════════════ */

/* ── Mock oturum: Gerçek projede auth'dan gelir. Demo: adm_001 = Süper Admin ── */
var ADMIN_PANEL_CURRENT = 'adm_001';

/* ── State ── */
var _aps = {
  view: 'list',                  // 'list' | 'detail' | 'tasks' | 'permissions'
  search: '',
  detailId: null,
  sensitiveMenuOpen: false,
  editingTaskId: null,
  editingTaskLabel: '',
  selectedRoleForMatrix: 'admin'
};

/* ═══ Süper Admin Gate ═══ */
function _admOpenPanelSettings() {
  var me = ADMIN_PANEL_ADMINS.find(function(a) { return a.id === ADMIN_PANEL_CURRENT; });
  if (!me || me.roleId !== 'super_admin') {
    _apsShowAccessDenied(me);
    return;
  }
  _apsMount();
}

function _apsShowAccessDenied(me) {
  _admInjectStyles();
  _apsInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.innerHTML = '<div style="position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10">'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Erişim Reddedildi</div></div>'
    + '</div>'
    + '<div class="aps-denied">'
    + '<div class="aps-denied-ico"><iconify-icon icon="solar:lock-keyhole-minimalistic-bold" style="font-size:40px;color:#EF4444"></iconify-icon></div>'
    + '<div class="aps-denied-title">Hassas Erişim Katmanı</div>'
    + '<div class="aps-denied-body">Admin Ayarları modülüne sadece <b>Süper Admin</b> rolüne sahip yetkililer erişebilir.</div>'
    + '<div class="aps-denied-role">Mevcut rol: <b style="color:' + (_apsRole(me && me.roleId) || {color:'#6B7280'}).color + '">' + ((_apsRole(me && me.roleId) || {}).label || 'Tanımsız') + '</b></div>'
    + '</div>';
  adminPhone.appendChild(overlay);
}

function _apsMount() {
  _admInjectStyles();
  _apsInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'apsOverlay';
  adminPhone.appendChild(overlay);

  _aps.view = 'list';
  _aps.search = '';
  _aps.sensitiveMenuOpen = false;
  _apsRender();
}

function _apsCloseOverlay() {
  var o = document.getElementById('apsOverlay');
  if (o) o.remove();
  _apsCloseDetail();
  _apsCloseSensitive();
  _apsCloseConfirm();
}

/* ═══ Ana Render ═══ */
function _apsRender() {
  var o = document.getElementById('apsOverlay');
  if (!o) return;

  var title, sub;
  if (_aps.view === 'tasks') { title = 'Görevler & Ayarları'; sub = 'Pozisyon tanımları'; }
  else if (_aps.view === 'permissions') { title = 'Yetki Sınırı & Ayarları'; sub = 'Rol-modül yetki matrisi'; }
  else { title = 'Admin Ayarları'; sub = 'Süper Admin denetim kulesi · ' + ADMIN_PANEL_ADMINS.length + ' admin'; }

  var showBack = _aps.view !== 'list';

  var h = '<div class="aps-header">'
    + '<div class="aps-back-btn" onclick="' + (showBack ? '_apsGoBack()' : '_apsCloseOverlay()') + '">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:shield-user-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
    + '<div class="aps-title">' + title + '</div>'
    + '</div>'
    + '<div class="aps-sub">' + sub + '</div>'
    + '</div>'
    + '<div class="aps-cog" onclick="_apsToggleSensitive()" title="Hassas Ayarlar">'
    + '<iconify-icon icon="solar:settings-bold" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '</div>'
    + '<div id="apsBody" style="flex:1"></div>';
  o.innerHTML = h;
  _apsRenderBody();
}

function _apsRenderBody() {
  var body = document.getElementById('apsBody');
  if (!body) return;

  if (_aps.view === 'list') body.innerHTML = _apsRenderList();
  else if (_aps.view === 'tasks') body.innerHTML = _apsRenderTasks();
  else if (_aps.view === 'permissions') body.innerHTML = _apsRenderPermissions();
}

function _apsGoBack() {
  _aps.view = 'list';
  _apsRender();
}

/* ═══ Helpers ═══ */
function _apsEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _apsRole(id) {
  for (var i = 0; i < ADMIN_PANEL_ROLES.length; i++) {
    if (ADMIN_PANEL_ROLES[i].id === id) return ADMIN_PANEL_ROLES[i];
  }
  return null;
}

function _apsTask(id) {
  for (var i = 0; i < ADMIN_PANEL_TASKS.length; i++) {
    if (ADMIN_PANEL_TASKS[i].id === id) return ADMIN_PANEL_TASKS[i];
  }
  return null;
}

function _apsAdmin(id) {
  return ADMIN_PANEL_ADMINS.find(function(a) { return a.id === id; });
}

function _apsDate(iso) {
  if (!iso) return '—';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' }) + ' · ' + d.toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' });
  } catch (e) { return iso; }
}

function _apsLog(action, targetId, detail) {
  ADMIN_PANEL_ACTIVITY_LOG.unshift({
    id: 'log_' + Date.now().toString(36),
    adminId: ADMIN_PANEL_CURRENT,
    date: new Date().toISOString(),
    action: action,
    target: targetId,
    detail: detail
  });
}

/* ═══════════════════════════════════════
   P2 — Admin Listesi
   ═══════════════════════════════════════ */
function _apsRenderList() {
  var list = ADMIN_PANEL_ADMINS.slice();

  if (_aps.search.trim()) {
    var q = _aps.search.toLowerCase().trim();
    list = list.filter(function(a) {
      var full = (a.firstName + ' ' + a.lastName).toLowerCase();
      return full.indexOf(q) > -1
        || (a.email && a.email.toLowerCase().indexOf(q) > -1)
        || (a.id && a.id.toLowerCase().indexOf(q) > -1);
    });
  }
  // Kronolojik: en yeni üstte
  list.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

  var h = '<div class="adm-fadeIn aps-wrap">';

  // Guard banner
  h += '<div class="aps-guard-banner">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>'
    + '<div><div class="aps-guard-title">Yönetim Kulesi</div>'
    + '<div class="aps-guard-sub">Tüm değişiklikler kalıcı olarak loglanır ve silinemez.</div></div>'
    + '</div>';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="aps-search" placeholder="İsim veya e-posta ile ara..." value="' + _apsEsc(_aps.search) + '" oninput="_aps.search=this.value;_apsRenderBody()" />'
    + '</div>';

  // Liste başlık
  h += '<div class="aps-list-head">'
    + '<span>' + list.length + ' admin</span>'
    + '</div>';

  // Kartlar
  h += '<div class="aps-list">';
  for (var i = 0; i < list.length; i++) {
    h += _apsAdminCard(list[i]);
  }
  h += '</div>';

  h += '</div>';
  return h;
}

function _apsAdminCard(a) {
  var role = _apsRole(a.roleId) || { label: a.roleId, color: '#6B7280' };
  var task = _apsTask(a.taskId) || { label: a.taskId };
  var isActive = a.status === 'active';
  var isMe = a.id === ADMIN_PANEL_CURRENT;

  return '<div class="aps-admin-card' + (isActive ? '' : ' aps-admin-card--off') + '" onclick="_apsOpenDetail(\'' + a.id + '\')">'
    + '<div class="aps-admin-avatar" style="background:linear-gradient(135deg,' + role.color + ',' + role.color + 'aa)">' + _apsEsc(a.firstName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="aps-admin-name">' + _apsEsc(a.firstName + ' ' + a.lastName) + '</span>'
    + (isMe ? '<span class="aps-me-badge">Ben</span>' : '')
    + (role.critical ? '<span class="aps-crit-badge" style="background:' + role.color + ';color:#fff"><iconify-icon icon="solar:crown-bold" style="font-size:9px"></iconify-icon>Süper</span>' : '')
    + '</div>'
    + '<div class="aps-admin-meta">'
    + '<span><iconify-icon icon="solar:letter-linear" style="font-size:10px"></iconify-icon>' + _apsEsc(a.email) + '</span>'
    + '</div>'
    + '<div class="aps-admin-row2">'
    + '<span class="aps-chip-soft"><iconify-icon icon="solar:case-minimalistic-linear" style="font-size:10px"></iconify-icon>' + _apsEsc(task.label) + '</span>'
    + '<span class="aps-chip-role" style="border-color:' + role.color + '40;color:' + role.color + '">'
    + '<iconify-icon icon="solar:shield-user-linear" style="font-size:10px"></iconify-icon>' + _apsEsc(role.label) + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="aps-admin-status">'
    + '<span class="aps-status-pill ' + (isActive ? 'aps-status-pill--on' : 'aps-status-pill--off') + '">'
    + '<span class="aps-status-dot"></span>' + (isActive ? 'Aktif' : 'Pasif')
    + '</span>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted);margin-top:auto"></iconify-icon>'
    + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P3 — Admin Detay: Genel Bilgiler + Hero
   ═══════════════════════════════════════ */
function _apsOpenDetail(id) {
  _apsCloseDetail();
  var a = _apsAdmin(id);
  if (!a) { _admToast('Admin bulunamadı', 'err'); return; }
  _aps.detailId = id;

  var adminPhone = document.getElementById('adminPhone');
  var d = document.createElement('div');
  d.id = 'apsDetail';
  d.className = 'prof-overlay open';
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:82;animation:admFadeIn .3s ease;overflow-y:auto';
  adminPhone.appendChild(d);
  _apsRenderDetail();
}

function _apsCloseDetail() {
  var d = document.getElementById('apsDetail');
  if (!d) return;
  d.style.opacity = '0';
  setTimeout(function() { if (d.parentNode) d.remove(); }, 180);
  _aps.detailId = null;
}

function _apsRenderDetail() {
  var d = document.getElementById('apsDetail');
  if (!d) return;
  var a = _apsAdmin(_aps.detailId);
  if (!a) return;
  var role = _apsRole(a.roleId) || { label: a.roleId, color: '#6B7280' };
  var task = _apsTask(a.taskId) || { label: a.taskId };
  var isActive = a.status === 'active';
  var isMe = a.id === ADMIN_PANEL_CURRENT;

  var h = '';

  // Sticky header
  h += '<div class="aps-header">'
    + '<div class="aps-back-btn" onclick="_apsCloseDetail()"><iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1">'
    + '<div class="aps-title">' + _apsEsc(a.firstName + ' ' + a.lastName) + '</div>'
    + '<div class="aps-sub">' + _apsEsc(a.id.toUpperCase()) + ' · ' + _apsEsc(role.label) + '</div>'
    + '</div>'
    + '<div class="aps-status-pill ' + (isActive ? 'aps-status-pill--on' : 'aps-status-pill--off') + '">'
    + '<span class="aps-status-dot"></span>' + (isActive ? 'Aktif' : 'Pasif')
    + '</div>'
    + '</div>';

  h += '<div class="adm-fadeIn aps-wrap">';

  // Hero
  h += '<div class="aps-detail-hero" style="background:linear-gradient(135deg,' + role.color + ',' + role.color + 'aa)">'
    + '<div class="aps-detail-avatar">' + _apsEsc(a.firstName.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="aps-detail-name">' + _apsEsc(a.firstName + ' ' + a.lastName) + '</div>'
    + '<div class="aps-detail-role">'
    + (role.critical ? '<iconify-icon icon="solar:crown-bold" style="font-size:11px"></iconify-icon>' : '')
    + '<span>' + _apsEsc(role.label) + '</span>'
    + (isMe ? '<span class="aps-me-badge" style="background:rgba(255,255,255,0.25);color:#fff">Ben</span>' : '')
    + '</div>'
    + '<div class="aps-detail-task">' + _apsEsc(task.label) + (task.description ? ' · ' + _apsEsc(task.description) : '') + '</div>'
    + '</div>'
    + '</div>';

  // Genel Bilgiler — edit form
  h += '<div class="aps-sect">'
    + '<div class="aps-sect-head"><iconify-icon icon="solar:user-id-bold" style="font-size:15px;color:#3B82F6"></iconify-icon><span>Genel Bilgiler</span></div>'
    + '<div class="aps-grid-2">'
    + _apsEditField('firstName', 'İsim',      a.firstName,  'text',      'solar:user-linear')
    + _apsEditField('lastName',  'Soyisim',   a.lastName,   'text',      'solar:user-linear')
    + _apsEditField('phone',     'Telefon',   a.phone,      'tel',       'solar:phone-linear')
    + _apsEditField('email',     'E-posta',   a.email,      'email',     'solar:letter-linear')
    + _apsEditField('birthDate', 'Doğum Tarihi', a.birthDate, 'date',    'solar:calendar-linear')
    + '</div>'
    + '<button class="aps-save-btn" onclick="_apsSaveGeneralInfo(\'' + a.id + '\')">'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:14px"></iconify-icon>Bilgileri Kaydet</button>'
    + '</div>';

  // Görev + Yetki bölümü (P4'te inject)
  h += _apsRenderTaskRole(a);

  // Aktif/Pasif toggle
  h += '<div class="aps-sect">'
    + '<div class="aps-sect-head"><iconify-icon icon="solar:' + (isActive ? 'shield-check' : 'shield-cross') + '-bold" style="font-size:15px;color:' + (isActive ? '#22C55E' : '#EF4444') + '"></iconify-icon><span>Hesap Durumu</span></div>'
    + '<div class="aps-status-row">'
    + '<div style="flex:1"><div class="aps-status-lbl">' + (isActive ? 'Aktif' : 'Pasif') + '</div>'
    + '<div class="aps-status-hint">' + (isActive ? 'Admin sisteme giriş yapabilir' : 'Admin sisteme erişemez') + '</div></div>'
    + '<div class="aps-big-toggle' + (isActive ? ' on' : '') + '" onclick="_apsToggleStatus(\'' + a.id + '\')"><div class="aps-big-toggle-dot"></div></div>'
    + '</div>'
    + '</div>';

  // Aktivite Logu (P5)
  h += _apsRenderActivityLog(a);

  h += '</div>';
  d.innerHTML = h;
  d.scrollTop = 0;
}

function _apsEditField(name, label, value, type, icon) {
  return '<div class="aps-field">'
    + '<label><iconify-icon icon="' + icon + '" style="font-size:11px"></iconify-icon>' + label + '</label>'
    + '<input type="' + type + '" class="aps-input" id="aps_' + name + '" value="' + _apsEsc(value || '') + '" />'
    + '</div>';
}

function _apsSaveGeneralInfo(id) {
  var a = _apsAdmin(id);
  if (!a) return;

  var fields = ['firstName','lastName','phone','email','birthDate'];
  var changed = [];
  for (var i = 0; i < fields.length; i++) {
    var el = document.getElementById('aps_' + fields[i]);
    if (el && a[fields[i]] !== el.value) {
      changed.push(fields[i]);
      a[fields[i]] = el.value;
    }
  }

  if (changed.length === 0) {
    _admToast('Değişiklik yok', 'err');
    return;
  }
  _apsLog('admin_info_updated', id, a.firstName + ' ' + a.lastName + ': ' + changed.length + ' alan güncellendi');
  _admToast('Değişiklikler başarıyla kaydedildi', 'ok');
  _apsRenderDetail();
}

function _apsToggleStatus(id) {
  var a = _apsAdmin(id);
  if (!a) return;
  if (a.id === ADMIN_PANEL_CURRENT) {
    _admToast('Kendi hesabınızı pasifleştiremezsiniz', 'err');
    return;
  }
  var willBe = a.status === 'active' ? 'inactive' : 'active';
  if (!confirm(a.firstName + ' ' + a.lastName + ' ' + (willBe === 'active' ? 'aktifleştirilecek' : 'pasifleştirilecek') + '. Devam?')) return;
  a.status = willBe;
  _apsLog('admin_status_changed', id, a.firstName + ' ' + a.lastName + ': durum ' + (willBe === 'active' ? 'Aktif' : 'Pasif') + ' yapıldı');
  _admToast('Durum güncellendi', 'ok');
  _apsRenderDetail();
}

/* ═══════════════════════════════════════
   P4 — Görev & Yetki Ataması (+ kritik değişim confirm)
   ═══════════════════════════════════════ */
function _apsRenderTaskRole(a) {
  var role = _apsRole(a.roleId) || { label: a.roleId, color: '#6B7280' };

  var h = '<div class="aps-sect">'
    + '<div class="aps-sect-head"><iconify-icon icon="solar:case-minimalistic-bold" style="font-size:15px;color:#F59E0B"></iconify-icon><span>Görev & Yetki</span></div>'

    // Görev dropdown
    + '<div class="aps-field">'
    + '<label><iconify-icon icon="solar:case-minimalistic-linear" style="font-size:11px"></iconify-icon>Aktif Görev</label>'
    + '<div class="aps-select-wrap">'
    + '<select class="aps-select" onchange="_apsChangeTask(\'' + a.id + '\', this.value)">';
  for (var i = 0; i < ADMIN_PANEL_TASKS.length; i++) {
    var t = ADMIN_PANEL_TASKS[i];
    var sel = a.taskId === t.id;
    h += '<option value="' + t.id + '"' + (sel ? ' selected' : '') + '>' + _apsEsc(t.label) + '</option>';
  }
  h += '</select>'
    + '<iconify-icon icon="solar:alt-arrow-down-linear" class="aps-select-chev"></iconify-icon>'
    + '</div></div>'

    // Rol dropdown
    + '<div class="aps-field">'
    + '<label><iconify-icon icon="solar:shield-user-linear" style="font-size:11px"></iconify-icon>Yetki Sınırı'
    + (role.critical ? '<span class="aps-crit-hint"><iconify-icon icon="solar:crown-bold" style="font-size:10px"></iconify-icon>Süper Yetki</span>' : '')
    + '</label>'
    + '<div class="aps-select-wrap">'
    + '<select class="aps-select aps-select--role" style="border-color:' + role.color + '40" onchange="_apsRoleChangeRequest(\'' + a.id + '\', this.value)">';
  for (var j = 0; j < ADMIN_PANEL_ROLES.length; j++) {
    var r = ADMIN_PANEL_ROLES[j];
    var sel2 = a.roleId === r.id;
    h += '<option value="' + r.id + '"' + (sel2 ? ' selected' : '') + '>' + _apsEsc(r.label) + (r.critical ? ' ⚠' : '') + '</option>';
  }
  h += '</select>'
    + '<iconify-icon icon="solar:alt-arrow-down-linear" class="aps-select-chev"></iconify-icon>'
    + '</div>'
    + '<div class="aps-role-desc" style="color:' + role.color + '">' + _apsEsc(role.description) + '</div>'
    + '</div>'

    + '</div>';

  return h;
}

function _apsChangeTask(adminId, taskId) {
  var a = _apsAdmin(adminId);
  var t = _apsTask(taskId);
  if (!a || !t) return;
  if (a.taskId === taskId) return;
  var oldTask = _apsTask(a.taskId);
  a.taskId = taskId;
  _apsLog('admin_task_changed', adminId, a.firstName + ' ' + a.lastName + ' görevi: ' + (oldTask && oldTask.label || '—') + ' → ' + t.label);
  _admToast('Görev güncellendi', 'ok');
  _apsRenderDetail();
}

function _apsRoleChangeRequest(adminId, newRoleId) {
  var a = _apsAdmin(adminId);
  var oldRole = _apsRole(a.roleId);
  var newRole = _apsRole(newRoleId);
  if (!a || !newRole) return;
  if (a.roleId === newRoleId) return;

  // Kendi rolünü değiştirmeye çalışıyor mu?
  if (a.id === ADMIN_PANEL_CURRENT && newRoleId !== 'super_admin') {
    alert('Kendi süper admin rolünüzü düşüremezsiniz. Önce başka birini süper admin yapıp onun üzerinden işlem yapın.');
    _apsRenderDetail();
    return;
  }

  // Kritik değişim — onay modalı
  if (newRole.critical || oldRole && oldRole.critical) {
    _apsOpenConfirm(a, oldRole, newRole);
    return;
  }

  // Normal değişim — direkt uygula
  _apsApplyRoleChange(a, oldRole, newRole);
}

function _apsApplyRoleChange(a, oldRole, newRole) {
  a.roleId = newRole.id;
  _apsLog('admin_role_changed', a.id, a.firstName + ' ' + a.lastName + ' rolü: ' + (oldRole && oldRole.label || '—') + ' → ' + newRole.label);
  _admToast('Değişiklikler başarıyla kaydedildi', 'ok');
  _apsRenderDetail();
}

/* ── Kritik Değişim Confirm Modal ── */
function _apsOpenConfirm(admin, oldRole, newRole) {
  _apsCloseConfirm();
  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'apsConfirm';
  m.className = 'aps-modal-backdrop aps-modal-backdrop--critical';
  m.onclick = function(e) {
    if (e.target === m) {
      _apsCloseConfirm();
      _apsRenderDetail(); // revert select
    }
  };

  var isGrant = newRole.critical;
  var accent = isGrant ? '#EF4444' : '#F59E0B';
  var title = isGrant ? 'Kritik Yetki Yükseltme' : 'Yetki Düşürme Onayı';

  var h = '<div class="aps-modal aps-modal--critical">'
    + '<div class="aps-confirm-head" style="background:linear-gradient(135deg,' + accent + ',' + accent + 'cc)">'
    + '<div class="aps-confirm-ico"><iconify-icon icon="solar:shield-warning-bold" style="font-size:26px;color:#fff"></iconify-icon></div>'
    + '<div class="aps-confirm-title">' + title + '</div>'
    + '<div class="aps-confirm-sub">Bu değişiklik sistem hiyerarşisini doğrudan etkiler</div>'
    + '</div>'

    + '<div class="aps-confirm-body">'
    + '<div class="aps-confirm-q"><b>' + _apsEsc(admin.firstName + ' ' + admin.lastName) + '</b> için</div>'
    + '<div class="aps-confirm-change">'
    + '<div class="aps-confirm-side"><span class="aps-confirm-lbl">Şu anki</span><span class="aps-confirm-val" style="color:' + (oldRole && oldRole.color) + '">' + _apsEsc((oldRole && oldRole.label) || '—') + '</span></div>'
    + '<div class="aps-confirm-arrow"><iconify-icon icon="solar:arrow-right-bold" style="font-size:18px"></iconify-icon></div>'
    + '<div class="aps-confirm-side"><span class="aps-confirm-lbl">Yeni</span><span class="aps-confirm-val" style="color:' + newRole.color + '">' + _apsEsc(newRole.label) + (newRole.critical ? ' 👑' : '') + '</span></div>'
    + '</div>'

    + (isGrant
        ? '<div class="aps-confirm-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px"></iconify-icon>Süper Admin tam yetki kazanır — tüm modüllere erişir ve başka adminleri yönetebilir.</div>'
        : '<div class="aps-confirm-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px"></iconify-icon>Süper Admin rolü düşürülüyor. Bu kişi artık hassas ayarlara erişemeyecek.</div>')

    + '<div class="aps-confirm-q" style="text-align:center;margin-top:4px">Bu işlemi yapmak istediğinize emin misiniz?</div>'
    + '</div>'

    + '<div class="aps-confirm-btns">'
    + '<button class="aps-confirm-cancel" onclick="_apsCancelConfirm()">Vazgeç</button>'
    + '<button class="aps-confirm-apply" style="background:linear-gradient(135deg,' + accent + ',' + accent + 'cc)" onclick="_apsApplyConfirmedRole(\'' + admin.id + '\', \'' + newRole.id + '\')">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:15px"></iconify-icon>Evet, Uygula</button>'
    + '</div>'

    + '</div>';

  m.innerHTML = h;
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _apsCloseConfirm() {
  var m = document.getElementById('apsConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
}

function _apsCancelConfirm() {
  _apsCloseConfirm();
  _apsRenderDetail();
}

function _apsApplyConfirmedRole(adminId, newRoleId) {
  var a = _apsAdmin(adminId);
  var newRole = _apsRole(newRoleId);
  var oldRole = _apsRole(a && a.roleId);
  if (!a || !newRole) return;
  _apsApplyRoleChange(a, oldRole, newRole);
  _apsCloseConfirm();
}

/* ═══════════════════════════════════════
   P5 — Aktivite Logu (Read-Only)
   ═══════════════════════════════════════ */
function _apsRenderActivityLog(a) {
  var logs = ADMIN_PANEL_ACTIVITY_LOG.filter(function(l) { return l.adminId === a.id; });
  logs.sort(function(x, y) { return new Date(y.date) - new Date(x.date); });

  var h = '<div class="aps-sect aps-sect--log">'
    + '<div class="aps-sect-head"><iconify-icon icon="solar:history-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Son Hareketler</span>'
    + '<span class="aps-sect-badge">' + logs.length + ' kayıt</span>'
    + '</div>'
    + '<div class="aps-readonly-bar">'
    + '<iconify-icon icon="solar:lock-keyhole-bold" style="font-size:12px"></iconify-icon>'
    + 'READ-ONLY · Bu loglar hiçbir admin tarafından silinemez'
    + '</div>';

  if (logs.length === 0) {
    h += '<div class="aps-log-empty">'
      + '<iconify-icon icon="solar:history-linear" style="font-size:32px;opacity:0.3"></iconify-icon>'
      + '<div>Henüz hareket kaydı yok</div>'
      + '</div>';
  } else {
    h += '<div class="aps-log-list">';
    for (var i = 0; i < logs.length; i++) {
      h += _apsLogRow(logs[i]);
    }
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _apsLogRow(log) {
  var actionMeta = _apsActionMeta(log.action);
  return '<div class="aps-log-row">'
    + '<div class="aps-log-dot" style="background:' + actionMeta.color + '"></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="aps-log-head">'
    + '<span class="aps-log-action" style="background:' + actionMeta.color + '18;color:' + actionMeta.color + '">'
    + '<iconify-icon icon="' + actionMeta.icon + '" style="font-size:10px"></iconify-icon>' + actionMeta.label
    + '</span>'
    + (log.target ? '<span class="aps-log-target">' + _apsEsc(log.target) + '</span>' : '')
    + '</div>'
    + '<div class="aps-log-detail">' + _apsEsc(log.detail) + '</div>'
    + '<div class="aps-log-date">' + _apsDate(log.date) + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:lock-keyhole-minimalistic-linear" style="font-size:12px;color:var(--text-muted);opacity:0.5" title="Silinemez"></iconify-icon>'
    + '</div>';
}

function _apsActionMeta(action) {
  var meta = {
    role_change:            { label:'Rol Değişimi',       color:'#EF4444', icon:'solar:shield-user-bold' },
    admin_role_changed:     { label:'Rol Değişimi',       color:'#EF4444', icon:'solar:shield-user-bold' },
    user_ban:               { label:'Yasak',              color:'#EF4444', icon:'solar:user-block-bold' },
    user_restricted:        { label:'Kısıtlama',          color:'#F97316', icon:'solar:shield-warning-bold' },
    complaint_resolved:     { label:'Şikayet Çözüldü',    color:'#22C55E', icon:'solar:check-circle-bold' },
    biz_approved:           { label:'İşletme Onayı',      color:'#22C55E', icon:'solar:verified-check-bold' },
    biz_rejected_partial:   { label:'Eksik Bildirim',     color:'#F97316', icon:'solar:letter-opened-bold' },
    biz_suspended:          { label:'İşletme Askı',       color:'#EF4444', icon:'solar:shop-minus-bold' },
    recipe_approved:        { label:'Tarif Onayı',        color:'#22C55E', icon:'solar:chef-hat-bold' },
    commission_updated:     { label:'Komisyon',           color:'#EC4899', icon:'solar:pie-chart-2-bold' },
    admin_created:          { label:'Admin Ekleme',       color:'#8B5CF6', icon:'solar:user-plus-bold' },
    admin_info_updated:     { label:'Bilgi Güncelleme',   color:'#3B82F6', icon:'solar:pen-bold' },
    admin_status_changed:   { label:'Durum Değişimi',     color:'#F97316', icon:'solar:shield-cross-bold' },
    admin_task_changed:     { label:'Görev Değişimi',     color:'#F59E0B', icon:'solar:case-minimalistic-bold' },
    notification_sent:      { label:'Bildirim Gönderimi', color:'#8B5CF6', icon:'solar:bell-bing-bold' },
    permission_updated:     { label:'Yetki Güncelleme',   color:'#A855F7', icon:'solar:shield-user-bold' },
    ad_campaign_cancelled:  { label:'Reklam İptali',      color:'#EF4444', icon:'solar:close-circle-bold' },
    login:                  { label:'Giriş',              color:'#64748B', icon:'solar:login-2-bold' },
    task_created:           { label:'Görev Eklendi',      color:'#F59E0B', icon:'solar:add-square-bold' },
    task_updated:           { label:'Görev Güncellendi',  color:'#F59E0B', icon:'solar:pen-bold' },
    task_deleted:           { label:'Görev Silindi',      color:'#EF4444', icon:'solar:trash-bin-minimalistic-bold' },
    premium_plan_updated:   { label:'Premium',            color:'#A855F7', icon:'solar:crown-bold' },
    super_admin_granted:    { label:'Süper Admin Veriliş', color:'#DC2626', icon:'solar:crown-star-bold' }
  };
  return meta[action] || { label: action, color:'#6B7280', icon:'solar:document-bold' };
}

/* ═══════════════════════════════════════
   P6 — Hassas Ayarlar: Görev Yönetimi
   ═══════════════════════════════════════ */
function _apsToggleSensitive() {
  if (_aps.sensitiveMenuOpen) _apsCloseSensitive();
  else _apsOpenSensitive();
}

function _apsOpenSensitive() {
  _apsCloseSensitive();
  _aps.sensitiveMenuOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'apsSensitive';
  m.className = 'aps-sens-backdrop';
  m.onclick = function(e) { if (e.target === m) _apsCloseSensitive(); };

  var h = '<div class="aps-sens-panel">'
    + '<div class="aps-sens-head">'
    + '<div><div class="aps-sens-title"><iconify-icon icon="solar:settings-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>Hassas Ayarlar</div>'
    + '<div class="aps-sens-sub">Sistem hiyerarşi iskeleti</div></div>'
    + '<div class="aps-close" onclick="_apsCloseSensitive()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>'

    + '<button class="aps-sens-tile" onclick="_apsGoSensitive(\'tasks\')">'
    + '<div class="aps-sens-tile-ico" style="background:linear-gradient(135deg,#F59E0B,#FCD34D)"><iconify-icon icon="solar:case-minimalistic-bold" style="font-size:20px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0;text-align:left">'
    + '<div class="aps-sens-tile-title">Görevler & Ayarları</div>'
    + '<div class="aps-sens-tile-sub">Pozisyon tanımlarını ekle/düzenle · ' + ADMIN_PANEL_TASKS.length + ' görev</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '</button>'

    + '<button class="aps-sens-tile" onclick="_apsGoSensitive(\'permissions\')">'
    + '<div class="aps-sens-tile-ico" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA)"><iconify-icon icon="solar:shield-user-bold" style="font-size:20px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0;text-align:left">'
    + '<div class="aps-sens-tile-title">Yetki Sınırı & Ayarları</div>'
    + '<div class="aps-sens-tile-sub">Rol × modül yetki matrisi · ' + ADMIN_PANEL_ROLES.length + ' rol × ' + ADMIN_PANEL_MODULES.length + ' modül</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '</button>'

    + '<div class="aps-sens-warn">'
    + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:13px;color:#F59E0B"></iconify-icon>'
    + 'Bu alanda yapılan değişiklikler <b>tüm sistemdeki rolleri</b> etkiler. Dikkatli olun.'
    + '</div>'

    + '</div>';

  m.innerHTML = h;
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _apsCloseSensitive() {
  var m = document.getElementById('apsSensitive');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _aps.sensitiveMenuOpen = false;
}

function _apsGoSensitive(view) {
  _aps.view = view;
  _apsCloseSensitive();
  _apsRender();
}

/* ── Görev Yönetimi Ekranı ── */
function _apsRenderTasks() {
  var h = '<div class="adm-fadeIn aps-wrap">';

  h += '<div class="aps-hint-box">'
    + '<iconify-icon icon="solar:info-circle-linear" style="font-size:13px;color:#F59E0B"></iconify-icon>'
    + 'Burada tanımlanan görevler admin detayında <b>Aktif Görev</b> dropdown\'unda seçilebilir.'
    + '</div>';

  // Yeni görev ekle
  h += '<button class="aps-add-btn" onclick="_apsAddTask()">'
    + '<iconify-icon icon="solar:add-circle-bold" style="font-size:15px"></iconify-icon>Yeni Görev Ekle</button>';

  // Liste
  h += '<div class="aps-task-list">';
  for (var i = 0; i < ADMIN_PANEL_TASKS.length; i++) {
    var t = ADMIN_PANEL_TASKS[i];
    // Bu görevi kullanan admin sayısı
    var usingCount = ADMIN_PANEL_ADMINS.filter(function(a) { return a.taskId === t.id; }).length;
    var editing = _aps.editingTaskId === t.id;

    h += '<div class="aps-task-item' + (editing ? ' editing' : '') + '">'
      + '<div class="aps-task-ico"><iconify-icon icon="solar:case-minimalistic-bold" style="font-size:15px"></iconify-icon></div>'
      + '<div style="flex:1;min-width:0">';

    if (editing) {
      h += '<input class="aps-input" type="text" value="' + _apsEsc(_aps.editingTaskLabel) + '" oninput="_aps.editingTaskLabel=this.value" />';
    } else {
      h += '<div class="aps-task-title">' + _apsEsc(t.label) + '</div>'
        + '<div class="aps-task-sub">' + _apsEsc(t.description || '—') + ' · ' + usingCount + ' admin</div>';
    }

    h += '</div>'
      + '<div class="aps-task-actions">';
    if (editing) {
      h += '<button class="aps-act-mini aps-act-mini--ok" onclick="_apsSaveTask(\'' + t.id + '\')"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px"></iconify-icon></button>'
        + '<button class="aps-act-mini" onclick="_apsCancelEditTask()"><iconify-icon icon="solar:close-circle-linear" style="font-size:14px"></iconify-icon></button>';
    } else {
      h += '<button class="aps-act-mini" onclick="_apsEditTask(\'' + t.id + '\')" title="Düzenle"><iconify-icon icon="solar:pen-linear" style="font-size:13px"></iconify-icon></button>';
      if (usingCount === 0) {
        h += '<button class="aps-act-mini aps-act-mini--danger" onclick="_apsDeleteTask(\'' + t.id + '\')" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon></button>';
      } else {
        h += '<span class="aps-task-locked" title="Kullanımda — silinemez"><iconify-icon icon="solar:lock-keyhole-minimalistic-linear" style="font-size:12px"></iconify-icon></span>';
      }
    }
    h += '</div></div>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

function _apsAddTask() {
  var label = prompt('Yeni görev adı:');
  if (!label || !label.trim()) return;
  var newTask = {
    id: 'tsk_' + Date.now().toString(36),
    label: label.trim(),
    description: ''
  };
  ADMIN_PANEL_TASKS.push(newTask);
  _apsLog('task_created', newTask.id, '"' + newTask.label + '" görevi eklendi');
  _admToast('Görev eklendi', 'ok');
  _apsRenderBody();
}

function _apsEditTask(id) {
  var t = _apsTask(id);
  if (!t) return;
  _aps.editingTaskId = id;
  _aps.editingTaskLabel = t.label;
  _apsRenderBody();
}

function _apsCancelEditTask() {
  _aps.editingTaskId = null;
  _aps.editingTaskLabel = '';
  _apsRenderBody();
}

function _apsSaveTask(id) {
  var t = _apsTask(id);
  if (!t) return;
  var newLabel = (_aps.editingTaskLabel || '').trim();
  if (!newLabel) { _admToast('Görev adı boş olamaz', 'err'); return; }
  var oldLabel = t.label;
  t.label = newLabel;
  _apsLog('task_updated', id, '"' + oldLabel + '" → "' + newLabel + '"');
  _admToast('Görev güncellendi', 'ok');
  _apsCancelEditTask();
}

function _apsDeleteTask(id) {
  var t = _apsTask(id);
  if (!t) return;
  if (!confirm('"' + t.label + '" görevi silinecek. Emin misiniz?')) return;
  var idx = ADMIN_PANEL_TASKS.indexOf(t);
  ADMIN_PANEL_TASKS.splice(idx, 1);
  _apsLog('task_deleted', id, '"' + t.label + '" görevi silindi');
  _admToast('Görev silindi', 'ok');
  _apsRenderBody();
}

/* ═══════════════════════════════════════
   P7 — Yetki Matrisi (Permission Grid)
   ═══════════════════════════════════════ */
function _apsRenderPermissions() {
  var role = _apsRole(_aps.selectedRoleForMatrix) || ADMIN_PANEL_ROLES[1];
  var perms = ADMIN_PANEL_PERMISSIONS[role.id] || {};
  var isLocked = role.id === 'super_admin';

  var h = '<div class="adm-fadeIn aps-wrap">';

  // Hint
  h += '<div class="aps-hint-box">'
    + '<iconify-icon icon="solar:info-circle-linear" style="font-size:13px;color:#8B5CF6"></iconify-icon>'
    + 'Her rol için hangi modüllerde <b>görüntüleme / düzenleme / silme</b> yetkisi olduğunu belirleyin.'
    + '</div>';

  // Rol seçici
  h += '<div class="aps-role-pills">';
  for (var i = 0; i < ADMIN_PANEL_ROLES.length; i++) {
    var r = ADMIN_PANEL_ROLES[i];
    var sel = r.id === role.id;
    h += '<button class="aps-role-pill' + (sel ? ' active' : '') + '" '
      + 'style="' + (sel ? 'border-color:' + r.color + ';background:' + r.color + '18;color:' + r.color : '') + '" '
      + 'onclick="_aps.selectedRoleForMatrix=\'' + r.id + '\';_apsRenderBody()">'
      + (r.critical ? '<iconify-icon icon="solar:crown-bold" style="font-size:11px"></iconify-icon>' : '')
      + _apsEsc(r.label) + '</button>';
  }
  h += '</div>';

  // Seçili rol bilgi
  h += '<div class="aps-matrix-role-info" style="border-left-color:' + role.color + '">'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:' + role.color + '">' + _apsEsc(role.label) + '</div>'
    + '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:4px">' + _apsEsc(role.description) + '</div>'
    + '</div>';

  if (isLocked) {
    h += '<div class="aps-matrix-lock">'
      + '<iconify-icon icon="solar:lock-keyhole-bold" style="font-size:16px;color:#EF4444"></iconify-icon>'
      + '<div><b>Süper Admin yetkileri kilitlidir.</b><br>Bu rol tanım gereği tüm modüllere tam erişime sahiptir.</div>'
      + '</div>';
  }

  // Matrix tablosu
  h += '<div class="aps-matrix">';
  h += '<div class="aps-matrix-head">'
    + '<span class="aps-matrix-mod-h">Modül</span>'
    + '<span>Görüntüle</span>'
    + '<span>Düzenle</span>'
    + '<span>Sil</span>'
    + '</div>';

  for (var m = 0; m < ADMIN_PANEL_MODULES.length; m++) {
    var mod = ADMIN_PANEL_MODULES[m];
    var p = perms[mod.id] || { view:false, edit:false, delete:false };
    h += '<div class="aps-matrix-row' + (mod.sensitive ? ' aps-matrix-row--sensitive' : '') + '">'
      + '<div class="aps-matrix-mod">'
      + '<iconify-icon icon="' + mod.icon + '" style="font-size:14px;color:var(--text-secondary)"></iconify-icon>'
      + '<span>' + _apsEsc(mod.label) + '</span>'
      + (mod.sensitive ? '<span class="aps-matrix-sen" title="Hassas modül"><iconify-icon icon="solar:shield-keyhole-bold" style="font-size:9px"></iconify-icon></span>' : '')
      + '</div>'
      + _apsMatrixCheck(role.id, mod.id, 'view',   p.view,   isLocked)
      + _apsMatrixCheck(role.id, mod.id, 'edit',   p.edit,   isLocked)
      + _apsMatrixCheck(role.id, mod.id, 'delete', p.delete, isLocked)
      + '</div>';
  }

  h += '</div>';

  // Kaydet butonu
  if (!isLocked) {
    h += '<button class="aps-save-btn" onclick="_apsSaveMatrix()">'
      + '<iconify-icon icon="solar:diskette-bold" style="font-size:14px"></iconify-icon>Matrisi Kaydet ve Uygula</button>';
  }

  h += '</div>';
  return h;
}

function _apsMatrixCheck(roleId, modId, action, checked, locked) {
  return '<div class="aps-matrix-cell">'
    + '<label class="aps-matrix-check' + (locked ? ' locked' : '') + '">'
    + '<input type="checkbox" ' + (checked ? 'checked' : '') + (locked ? ' disabled' : '') + ' onchange="_apsTogglePermission(\'' + roleId + '\', \'' + modId + '\', \'' + action + '\', this.checked)" />'
    + '<span class="aps-matrix-check-box aps-matrix-check-box--' + action + '"><iconify-icon icon="solar:check-bold" style="font-size:11px"></iconify-icon></span>'
    + '</label>'
    + '</div>';
}

function _apsTogglePermission(roleId, modId, action, value) {
  if (!ADMIN_PANEL_PERMISSIONS[roleId]) ADMIN_PANEL_PERMISSIONS[roleId] = {};
  if (!ADMIN_PANEL_PERMISSIONS[roleId][modId]) ADMIN_PANEL_PERMISSIONS[roleId][modId] = { view:false, edit:false, delete:false };

  ADMIN_PANEL_PERMISSIONS[roleId][modId][action] = !!value;

  // Mantık: silme varsa edit, edit varsa view otomatik aktif
  if (action === 'delete' && value) {
    ADMIN_PANEL_PERMISSIONS[roleId][modId].edit = true;
    ADMIN_PANEL_PERMISSIONS[roleId][modId].view = true;
  } else if (action === 'edit' && value) {
    ADMIN_PANEL_PERMISSIONS[roleId][modId].view = true;
  } else if (action === 'view' && !value) {
    // view kapanırsa edit/delete de kapanmalı
    ADMIN_PANEL_PERMISSIONS[roleId][modId].edit = false;
    ADMIN_PANEL_PERMISSIONS[roleId][modId].delete = false;
  } else if (action === 'edit' && !value) {
    ADMIN_PANEL_PERMISSIONS[roleId][modId].delete = false;
  }

  _apsRenderBody();
}

function _apsSaveMatrix() {
  var role = _apsRole(_aps.selectedRoleForMatrix);
  if (!role) return;
  _apsLog('permission_updated', role.id, role.label + ' rolü için yetki matrisi güncellendi');
  _admToast('Değişiklikler başarıyla kaydedildi · ' + role.label + ' matrisi uygulandı', 'ok');
}

/* ═══════════════════════════════════════
   P8 — Stiller (.aps-*)
   ═══════════════════════════════════════ */
function _apsInjectStyles() {
  if (document.getElementById('apsStyles')) return;
  var css = ''
    + '.aps-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    /* Header */
    + '.aps-header{position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10}'
    + '.aps-back-btn{width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.aps-title{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.aps-sub{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.aps-cog{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(139,92,246,0.35);transition:transform .2s}'
    + '.aps-cog:hover{transform:rotate(35deg)}'
    /* Denied */
    + '.aps-denied{padding:60px 32px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}'
    + '.aps-denied-ico{width:80px;height:80px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center}'
    + '.aps-denied-title{font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)}'
    + '.aps-denied-body{font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-secondary);max-width:280px}'
    + '.aps-denied-role{padding:10px 16px;border-radius:var(--r-full);background:var(--bg-phone-secondary);font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)}'
    /* Guard banner */
    + '.aps-guard-banner{display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-lg);background:linear-gradient(135deg,rgba(139,92,246,0.06),transparent 70%);border:1px solid rgba(139,92,246,0.2)}'
    + '.aps-guard-title{font:var(--fw-bold) var(--fs-xs)/1.2 var(--font);color:#8B5CF6}'
    + '.aps-guard-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Search */
    + '.aps-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.aps-search:focus{border-color:#8B5CF6}'
    + '.aps-list-head{display:flex;align-items:center;justify-content:space-between;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)}'
    + '.aps-list{display:flex;flex-direction:column;gap:8px}'
    /* Admin card */
    + '.aps-admin-card{display:flex;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;transition:all .15s}'
    + '.aps-admin-card:hover{border-color:#8B5CF6;transform:translateY(-1px);box-shadow:0 4px 12px rgba(139,92,246,0.08)}'
    + '.aps-admin-card--off{opacity:0.65}'
    + '.aps-admin-avatar{width:44px;height:44px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 16px/1 var(--font);flex-shrink:0}'
    + '.aps-admin-name{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.aps-me-badge{font:var(--fw-bold) 9px/1 var(--font);background:#22C55E;color:#fff;padding:3px 7px;border-radius:var(--r-full)}'
    + '.aps-crit-badge{display:inline-flex;align-items:center;gap:3px;font:var(--fw-bold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);letter-spacing:.3px}'
    + '.aps-admin-meta{display:flex;gap:12px;flex-wrap:wrap;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.aps-admin-meta span{display:inline-flex;align-items:center;gap:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}'
    + '.aps-admin-row2{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}'
    + '.aps-chip-soft{display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);background:var(--bg-phone-secondary);color:var(--text-secondary)}'
    + '.aps-chip-role{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);border:1px solid;background:transparent}'
    + '.aps-admin-status{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}'
    /* Status pill */
    + '.aps-status-pill{display:inline-flex;align-items:center;gap:4px;font:var(--fw-semibold) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);white-space:nowrap}'
    + '.aps-status-pill--on{background:rgba(34,197,94,0.12);color:#22C55E}'
    + '.aps-status-pill--off{background:rgba(107,114,128,0.12);color:#6B7280}'
    + '.aps-status-pill--on .aps-status-dot{background:#22C55E;animation:apsPulse 1.6s ease-in-out infinite}'
    + '.aps-status-pill--off .aps-status-dot{background:#6B7280}'
    + '.aps-status-dot{width:6px;height:6px;border-radius:50%}'
    + '@keyframes apsPulse{0%,100%{opacity:1}50%{opacity:0.4}}'
    /* Sect */
    + '.aps-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.aps-sect--log{border-color:rgba(139,92,246,0.25)}'
    + '.aps-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.aps-sect-head span:first-of-type{flex:1}'
    + '.aps-sect-badge{font:var(--fw-bold) 10px/1 var(--font);padding:4px 8px;border-radius:var(--r-full);background:rgba(139,92,246,0.12);color:#8B5CF6}'
    /* Detail hero */
    + '.aps-detail-hero{border-radius:var(--r-xl);padding:18px;color:#fff;display:flex;align-items:center;gap:14px}'
    + '.aps-detail-avatar{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 24px/1 var(--font);flex-shrink:0}'
    + '.aps-detail-name{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.aps-detail-role{display:inline-flex;align-items:center;gap:5px;margin-top:5px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:rgba(255,255,255,0.95)}'
    + '.aps-detail-task{font:var(--fw-regular) 11px/1.3 var(--font);color:rgba(255,255,255,0.8);margin-top:6px}';
  var s = document.createElement('style');
  s.id = 'apsStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _apsInjectStylesPart2();
}

function _apsInjectStylesPart2() {
  if (document.getElementById('apsStyles2')) return;
  var css = ''
    /* Grid + field */
    + '.aps-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.aps-field{display:flex;flex-direction:column;gap:4px}'
    + '.aps-field label{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.aps-input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.aps-input:focus{border-color:#8B5CF6}'
    + '.aps-select-wrap{position:relative}'
    + '.aps-select{width:100%;box-sizing:border-box;padding:10px 32px 10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;appearance:none;-webkit-appearance:none;cursor:pointer;transition:border-color .15s}'
    + '.aps-select:focus{border-color:#8B5CF6}'
    + '.aps-select--role{font-weight:600}'
    + '.aps-select-chev{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-muted);pointer-events:none}'
    + '.aps-crit-hint{display:inline-flex;align-items:center;gap:3px;font:var(--fw-bold) 9px/1 var(--font);color:#EF4444;background:rgba(239,68,68,0.1);padding:2px 6px;border-radius:var(--r-full);margin-left:4px;letter-spacing:.3px}'
    + '.aps-role-desc{font:var(--fw-regular) 10px/1.4 var(--font);margin-top:4px;padding:6px 10px;border-radius:var(--r-sm);background:var(--bg-phone-secondary)}'
    + '.aps-save-btn{padding:11px;border:none;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;transition:opacity .15s}'
    + '.aps-save-btn:hover{opacity:0.92}'
    /* Status row */
    + '.aps-status-row{display:flex;align-items:center;gap:12px}'
    + '.aps-status-lbl{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.aps-status-hint{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.aps-big-toggle{width:50px;height:28px;border-radius:var(--r-full);background:var(--border-subtle);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}'
    + '.aps-big-toggle.on{background:#22C55E}'
    + '.aps-big-toggle-dot{width:22px;height:22px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,0.2)}'
    + '.aps-big-toggle.on .aps-big-toggle-dot{transform:translateX(22px)}'
    /* Log */
    + '.aps-readonly-bar{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:var(--r-md);background:rgba(139,92,246,0.06);border:1px dashed rgba(139,92,246,0.3);font:var(--fw-semibold) 9px/1 var(--font);color:#8B5CF6;text-transform:uppercase;letter-spacing:.4px}'
    + '.aps-log-empty{padding:24px;text-align:center;color:var(--text-muted);font:var(--fw-regular) 11px/1.4 var(--font);display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.aps-log-list{display:flex;flex-direction:column;gap:4px;padding-left:4px;position:relative}'
    + '.aps-log-list:before{content:"";position:absolute;left:9px;top:10px;bottom:10px;width:2px;background:var(--border-subtle);border-radius:1px}'
    + '.aps-log-row{display:flex;gap:10px;padding:8px 4px;position:relative;z-index:1;align-items:flex-start}'
    + '.aps-log-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:3px;border:2px solid var(--bg-phone)}'
    + '.aps-log-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.aps-log-action{display:inline-flex;align-items:center;gap:3px;font:var(--fw-semibold) 9px/1 var(--font);padding:3px 7px;border-radius:var(--r-full);text-transform:uppercase;letter-spacing:.3px}'
    + '.aps-log-target{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);font-family:monospace}'
    + '.aps-log-detail{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-primary);margin-top:4px}'
    + '.aps-log-date{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:3px}'
    /* Sensitive sheet */
    + '.aps-sens-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:85;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.aps-sens-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.aps-sens-panel{width:100%;max-height:70vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;padding:14px 16px;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;gap:10px}'
    + '.aps-sens-backdrop.open .aps-sens-panel{transform:translateY(0)}'
    + '.aps-sens-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border-subtle)}'
    + '.aps-sens-title{display:flex;align-items:center;gap:6px;font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.aps-sens-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.aps-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.aps-sens-tile{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;text-align:left;transition:all .15s}'
    + '.aps-sens-tile:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06);border-color:#8B5CF6}'
    + '.aps-sens-tile-ico{width:42px;height:42px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 8px rgba(0,0,0,0.1)}'
    + '.aps-sens-tile-title{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.aps-sens-tile-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.aps-sens-warn{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:var(--r-md);background:rgba(245,158,11,0.08);color:#92400E;font:var(--fw-regular) 10px/1.4 var(--font);margin-top:4px}'
    /* Task manager */
    + '.aps-hint-box{display:flex;align-items:center;gap:6px;padding:10px 12px;border-radius:var(--r-md);background:rgba(139,92,246,0.05);border:1px solid rgba(139,92,246,0.2);font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    + '.aps-add-btn{padding:11px;border:1px dashed #8B5CF6;border-radius:var(--r-md);background:rgba(139,92,246,0.05);color:#8B5CF6;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:all .15s}'
    + '.aps-add-btn:hover{background:#8B5CF6;color:#fff;border-style:solid}'
    + '.aps-task-list{display:flex;flex-direction:column;gap:6px}'
    + '.aps-task-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);transition:all .15s}'
    + '.aps-task-item.editing{border-color:#8B5CF6;background:rgba(139,92,246,0.03)}'
    + '.aps-task-ico{width:28px;height:28px;border-radius:var(--r-sm);background:rgba(245,158,11,0.12);color:#F59E0B;display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.aps-task-title{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.aps-task-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.aps-task-actions{display:flex;align-items:center;gap:4px;flex-shrink:0}'
    + '.aps-act-mini{width:28px;height:28px;border:1px solid var(--border-subtle);border-radius:var(--r-sm);background:var(--bg-phone);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}'
    + '.aps-act-mini:hover{border-color:#8B5CF6;color:#8B5CF6}'
    + '.aps-act-mini--ok:hover{border-color:#22C55E;color:#22C55E}'
    + '.aps-act-mini--danger:hover{border-color:#EF4444;color:#EF4444}'
    + '.aps-task-locked{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:var(--text-muted);opacity:0.6}'
    /* Matrix */
    + '.aps-role-pills{display:flex;flex-wrap:wrap;gap:6px}'
    + '.aps-role-pill{display:inline-flex;align-items:center;gap:4px;padding:7px 12px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap}'
    + '.aps-role-pill:hover{background:var(--bg-phone-secondary)}'
    + '.aps-role-pill.active{font-weight:600}'
    + '.aps-matrix-role-info{padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:4px solid}'
    + '.aps-matrix-lock{display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--r-md);background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.25);font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    + '.aps-matrix-lock b{color:#EF4444}'
    + '.aps-matrix{border:1px solid var(--border-subtle);border-radius:var(--r-md);overflow:hidden;background:var(--bg-phone)}'
    + '.aps-matrix-head{display:grid;grid-template-columns:1.4fr 0.6fr 0.6fr 0.6fr;gap:2px;padding:10px 8px;background:var(--bg-phone-secondary);font:var(--fw-bold) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px;text-align:center}'
    + '.aps-matrix-head .aps-matrix-mod-h{text-align:left;padding-left:4px}'
    + '.aps-matrix-row{display:grid;grid-template-columns:1.4fr 0.6fr 0.6fr 0.6fr;gap:2px;padding:9px 8px;align-items:center;border-top:1px solid var(--border-subtle)}'
    + '.aps-matrix-row--sensitive{background:rgba(239,68,68,0.03)}'
    + '.aps-matrix-mod{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary);padding-left:4px;overflow:hidden}'
    + '.aps-matrix-mod span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.aps-matrix-sen{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#EF4444;color:#fff;flex-shrink:0}'
    + '.aps-matrix-cell{display:flex;align-items:center;justify-content:center}'
    + '.aps-matrix-check{position:relative;cursor:pointer;display:inline-flex}'
    + '.aps-matrix-check.locked{cursor:not-allowed;opacity:0.6}'
    + '.aps-matrix-check input{position:absolute;opacity:0;pointer-events:none}'
    + '.aps-matrix-check-box{width:22px;height:22px;border-radius:var(--r-sm);border:1.5px solid var(--border-subtle);background:var(--bg-phone);display:flex;align-items:center;justify-content:center;color:transparent;transition:all .15s}'
    + '.aps-matrix-check-box--view input:checked ~ & {}'
    + '.aps-matrix-check input:checked + .aps-matrix-check-box--view{background:#3B82F6;border-color:#3B82F6;color:#fff}'
    + '.aps-matrix-check input:checked + .aps-matrix-check-box--edit{background:#F59E0B;border-color:#F59E0B;color:#fff}'
    + '.aps-matrix-check input:checked + .aps-matrix-check-box--delete{background:#EF4444;border-color:#EF4444;color:#fff}'
    /* Modal (critical confirm) */
    + '.aps-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:92;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.aps-modal-backdrop.open{background:rgba(0,0,0,0.65)}'
    + '.aps-modal-backdrop--critical.open{background:rgba(15,23,42,0.8)}'
    + '.aps-modal{width:100%;max-width:420px;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.aps-modal--critical{border-radius:var(--r-xl);margin-bottom:16px;max-height:88vh;overflow-y:auto}'
    + '.aps-modal-backdrop.open .aps-modal{transform:translateY(0)}'
    + '.aps-confirm-head{padding:22px 16px;color:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.aps-confirm-ico{width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center}'
    + '.aps-confirm-title{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.aps-confirm-sub{font:var(--fw-regular) 11px/1.3 var(--font);opacity:0.9}'
    + '.aps-confirm-body{padding:16px;display:flex;flex-direction:column;gap:10px}'
    + '.aps-confirm-q{font:var(--fw-semibold) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);text-align:center}'
    + '.aps-confirm-q b{color:#8B5CF6}'
    + '.aps-confirm-change{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.aps-confirm-side{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}'
    + '.aps-confirm-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.aps-confirm-val{font:var(--fw-bold) var(--fs-sm)/1.2 var(--font)}'
    + '.aps-confirm-arrow{color:var(--text-muted);flex-shrink:0}'
    + '.aps-confirm-warn{display:flex;align-items:flex-start;gap:6px;padding:10px;border-radius:var(--r-md);background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);font:var(--fw-medium) 11px/1.4 var(--font);color:#92400E}'
    + '.aps-confirm-warn iconify-icon{color:#F59E0B;flex-shrink:0;margin-top:1px}'
    + '.aps-confirm-btns{display:grid;grid-template-columns:1fr 1.5fr;gap:8px;padding:10px 16px 16px}'
    + '.aps-confirm-cancel{padding:13px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer}'
    + '.aps-confirm-cancel:hover{border-color:var(--text-secondary)}'
    + '.aps-confirm-apply{padding:13px;border:none;border-radius:var(--r-md);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.15)}'
    + '.aps-confirm-apply:hover{opacity:0.93}';
  var s = document.createElement('style');
  s.id = 'apsStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

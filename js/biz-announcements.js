/* ═══════════════════════════════════════════════════════════
   BIZ ANNOUNCEMENTS — Duyurular
   Admin panel → şube bazlı gönderim · okunmuş/okunmamış
   Tekli/toplu silme + tümünü sil + detay modal
   ═══════════════════════════════════════════════════════════ */

var _ba = {
  branchId: null,
  selectMode: false,
  selectedIds: []
};

function openBizAnnouncements(branchId) {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('branches')) return;
  _ba.branchId = branchId;
  _ba.selectMode = false;
  _ba.selectedIds = [];
  _baInjectStyles();
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === branchId; });
  var title = 'Duyurular · ' + (branch ? branch.name : 'Şube');
  var existing = document.getElementById('bizAnnouncementsOverlay');
  if (existing) existing.remove();
  var overlay = createBizOverlay('bizAnnouncementsOverlay', title, _baBody());
  // Üst sağa Seç/İptal butonu ekle
  var headerBar = overlay.querySelector('[style*="var(--glass-bg)"]');
  if (headerBar) {
    var btn = document.createElement('button');
    btn.id = 'baSelectToggle';
    btn.className = 'ba-select-btn';
    btn.textContent = _ba.selectMode ? 'İptal' : 'Seç';
    btn.onclick = _baToggleSelectMode;
    headerBar.appendChild(btn);
  }
  document.getElementById('bizPhone').appendChild(overlay);
}

function _baBody() {
  var list = bizAnnouncementsForBranch(_ba.branchId);
  var unread = list.filter(function(a){ return !a.read; }).length;
  var total = list.length;
  var hasSelection = _ba.selectedIds.length > 0;

  var summary = '<div class="ba-summary">'
    + '<div class="ba-summary-left">'
    +   '<iconify-icon icon="solar:megaphone-bold" style="font-size:22px;color:#EC4899"></iconify-icon>'
    +   '<div><div class="ba-summary-title">' + total + ' Duyuru</div>'
    +   '<div class="ba-summary-sub">' + (unread > 0 ? unread + ' okunmamış · yeni duyurular var' : 'Hepsi okundu') + '</div></div>'
    + '</div>'
    + (total > 0 ? '<button class="ba-linkbtn" onclick="_baDeleteAll()"><iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:13px"></iconify-icon>Tümünü Sil</button>' : '')
    + '</div>';

  // Toplu işlem barı (seçim modundaysa görünür)
  var selectBar = _ba.selectMode
    ? '<div class="ba-selectbar">'
      + '<span class="ba-select-count">' + _ba.selectedIds.length + ' seçildi</span>'
      + '<button class="ba-linkbtn" onclick="_baSelectAll()" style="margin-left:auto">Tümünü Seç</button>'
      + '<button class="ba-delete-btn"' + (hasSelection ? '' : ' disabled') + ' onclick="_baDeleteSelected()"><iconify-icon icon="solar:trash-bin-minimalistic-bold" style="font-size:14px"></iconify-icon>Seçilenleri Sil</button>'
      + '</div>'
    : '';

  if (!list.length) {
    return '<div class="ba-wrap">'
      + summary
      + '<div class="ba-empty"><iconify-icon icon="solar:megaphone-linear" style="font-size:52px;opacity:.3"></iconify-icon>'
      + '<div class="ba-empty-title">Henüz duyuru yok</div>'
      + '<div class="ba-empty-sub">Admin panelinden gönderilen duyurular burada görünecek</div></div>'
      + '</div>';
  }

  var cards = list.map(_baCard).join('');
  return '<div class="ba-wrap">' + summary + selectBar + '<div class="ba-list">' + cards + '</div></div>';
}

function _baCard(a) {
  var selected = _ba.selectedIds.indexOf(a.id) > -1;
  var cls = 'ba-card' + (a.read ? '' : ' unread') + (_ba.selectMode && selected ? ' selected' : '');
  var tagColor = a.priority === 'high' ? '#EF4444' : a.priority === 'low' ? '#6B7280' : '#3B82F6';
  var checkbox = _ba.selectMode
    ? '<div class="ba-check' + (selected ? ' on' : '') + '" onclick="event.stopPropagation();_baToggleSelect(\'' + a.id + '\')">' + (selected ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>' : '<iconify-icon icon="solar:stop-circle-linear" style="font-size:20px;color:var(--text-tertiary)"></iconify-icon>') + '</div>'
    : '';
  var unreadDot = !a.read ? '<div class="ba-unread-dot"></div>' : '';
  return '<div class="' + cls + '" onclick="' + (_ba.selectMode ? '_baToggleSelect(\'' + a.id + '\')' : '_baOpenDetail(\'' + a.id + '\')') + '">'
    + checkbox
    + unreadDot
    + '<div class="ba-card-body">'
    +   '<div class="ba-card-head">'
    +     (a.tag ? '<span class="ba-tag" style="color:' + tagColor + ';background:' + tagColor + '14">' + a.tag + '</span>' : '')
    +     '<span class="ba-date">' + _baRelativeTime(a.sentAt) + '</span>'
    +   '</div>'
    +   '<div class="ba-title">' + _baEsc(a.title) + '</div>'
    +   '<div class="ba-preview">' + _baEsc(a.preview) + '</div>'
    + '</div>'
    + (!_ba.selectMode ? '<button class="ba-del-single" onclick="event.stopPropagation();_baDeleteOne(\'' + a.id + '\')" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:16px"></iconify-icon></button>' : '')
    + '</div>';
}

/* ─ Actions ─ */
function _baToggleSelectMode() {
  _ba.selectMode = !_ba.selectMode;
  if (!_ba.selectMode) _ba.selectedIds = [];
  var btn = document.getElementById('baSelectToggle');
  if (btn) btn.textContent = _ba.selectMode ? 'İptal' : 'Seç';
  _baRerender();
}

function _baToggleSelect(id) {
  var idx = _ba.selectedIds.indexOf(id);
  if (idx > -1) _ba.selectedIds.splice(idx, 1);
  else _ba.selectedIds.push(id);
  _baRerender();
}

function _baSelectAll() {
  var all = bizAnnouncementsForBranch(_ba.branchId);
  _ba.selectedIds = all.map(function(a){ return a.id; });
  _baRerender();
}

function _baDeleteOne(id) {
  if (!confirm('Bu duyuru silinecek. Onaylıyor musun?')) return;
  var idx = BIZ_ANNOUNCEMENTS.findIndex(function(a){ return a.id === id; });
  if (idx > -1) BIZ_ANNOUNCEMENTS.splice(idx, 1);
  if (typeof _admToast === 'function') _admToast('Duyuru silindi', 'ok');
  _baRerender();
}

function _baDeleteSelected() {
  if (!_ba.selectedIds.length) return;
  if (!confirm(_ba.selectedIds.length + ' duyuru silinecek. Onaylıyor musun?')) return;
  var ids = _ba.selectedIds.slice();
  BIZ_ANNOUNCEMENTS = BIZ_ANNOUNCEMENTS.filter(function(a){ return ids.indexOf(a.id) === -1; });
  window.BIZ_ANNOUNCEMENTS = BIZ_ANNOUNCEMENTS;
  _ba.selectedIds = [];
  _ba.selectMode = false;
  var btn = document.getElementById('baSelectToggle');
  if (btn) btn.textContent = 'Seç';
  if (typeof _admToast === 'function') _admToast(ids.length + ' duyuru silindi', 'ok');
  _baRerender();
}

function _baDeleteAll() {
  var count = bizAnnouncementsForBranch(_ba.branchId).length;
  if (!count) return;
  if (!confirm('Bu şubedeki ' + count + ' duyurunun tümü silinecek. Onaylıyor musun? (Geri alınamaz)')) return;
  var branchId = _ba.branchId;
  BIZ_ANNOUNCEMENTS = BIZ_ANNOUNCEMENTS.filter(function(a){ return a.branchId !== branchId; });
  window.BIZ_ANNOUNCEMENTS = BIZ_ANNOUNCEMENTS;
  if (typeof _admToast === 'function') _admToast('Tüm duyurular silindi', 'ok');
  _baRerender();
}

/* ─ Detail modal ─ */
function _baOpenDetail(id) {
  var a = BIZ_ANNOUNCEMENTS.find(function(x){ return x.id === id; });
  if (!a) return;
  // Okundu olarak işaretle
  if (!a.read) { a.read = true; _baRerender(); }
  var phone = document.getElementById('bizPhone');
  var existing = document.getElementById('baDetailModal');
  if (existing) existing.remove();
  var m = document.createElement('div');
  m.id = 'baDetailModal';
  m.className = 'ba-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _baCloseDetail(); };
  var tagColor = a.priority === 'high' ? '#EF4444' : a.priority === 'low' ? '#6B7280' : '#3B82F6';
  m.innerHTML = '<div class="ba-modal">'
    + '<div class="ba-modal-head">'
    +   '<div class="ba-modal-close" onclick="_baCloseDetail()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    +   (a.tag ? '<span class="ba-tag" style="color:' + tagColor + ';background:' + tagColor + '14">' + a.tag + '</span>' : '')
    +   '<div class="ba-modal-title">' + _baEsc(a.title) + '</div>'
    +   '<div class="ba-modal-date"><iconify-icon icon="solar:clock-circle-linear" style="font-size:12px"></iconify-icon>' + _baFullDate(a.sentAt) + '</div>'
    + '</div>'
    + '<div class="ba-modal-body">'
    +   (a.image ? '<img class="ba-modal-img" src="' + a.image + '" alt="">' : '')
    +   '<div class="ba-modal-text">' + _baEsc(a.body).replace(/\n/g, '<br>') + '</div>'
    +   (a.link ? '<button class="ba-modal-cta" onclick="alert(\'Link açılıyor: ' + a.link + '\')"><iconify-icon icon="solar:link-bold" style="font-size:14px"></iconify-icon>İlgili Sayfaya Git</button>' : '')
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}
function _baCloseDetail() {
  var m = document.getElementById('baDetailModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
}

/* ─ Helpers ─ */
function _baRerender() {
  var o = document.getElementById('bizAnnouncementsOverlay');
  if (!o) return;
  var content = o.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _baBody();
  // Seç/İptal buton metnini sync'le
  var btn = document.getElementById('baSelectToggle');
  if (btn) btn.textContent = _ba.selectMode ? 'İptal' : 'Seç';
}

function _baEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _baRelativeTime(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  var now = new Date();
  var diff = now - d;
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return mins + ' dk önce';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' sa önce';
  var days = Math.floor(hrs / 24);
  if (days < 7) return days + ' gün önce';
  return d.toLocaleDateString('tr-TR', { day:'numeric', month:'short' });
}
function _baFullDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }) + ' · ' + d.toTimeString().slice(0,5);
}

function _baInjectStyles() {
  if (document.getElementById('baStyles')) return;
  var s = document.createElement('style');
  s.id = 'baStyles';
  s.textContent = [
    '.ba-wrap{display:flex;flex-direction:column;gap:12px;padding-bottom:20px}',
    '.ba-select-btn{margin-left:auto;padding:6px 12px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--primary);border-radius:var(--r-full);font:var(--fw-bold) 12px/1 var(--font);cursor:pointer}',
    '.ba-summary{display:flex;align-items:center;gap:12px;padding:14px;background:linear-gradient(135deg,rgba(236,72,153,0.08),var(--bg-phone));border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm)}',
    '.ba-summary-left{display:flex;align-items:center;gap:10px;flex:1}',
    '.ba-summary-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.ba-summary-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.ba-linkbtn{padding:6px 10px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);border-radius:var(--r-full);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.ba-linkbtn:hover{color:#EF4444;border-color:rgba(239,68,68,.3)}',
    '.ba-selectbar{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--r-lg);position:sticky;top:0;z-index:2}',
    '.ba-select-count{font:var(--fw-bold) 12px/1 var(--font);color:var(--primary)}',
    '.ba-delete-btn{padding:8px 12px;border:none;background:#EF4444;color:#fff;border-radius:var(--r-md);font:var(--fw-bold) 11.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px}',
    '.ba-delete-btn:disabled{opacity:.5;cursor:not-allowed}',
    '.ba-list{display:flex;flex-direction:column;gap:8px}',
    '.ba-card{position:relative;display:flex;align-items:flex-start;gap:10px;padding:14px 12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);box-shadow:var(--shadow-sm);cursor:pointer;transition:all .15s}',
    '.ba-card:hover{box-shadow:var(--shadow-md)}',
    '.ba-card.unread{border-left:3px solid var(--primary);background:linear-gradient(90deg,rgba(246,80,19,0.04),var(--bg-phone))}',
    '.ba-card.selected{border-color:var(--primary);background:var(--primary-light)}',
    '.ba-unread-dot{position:absolute;top:14px;right:38px;width:8px;height:8px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 0 rgba(246,80,19,.4);animation:baPulse 1.6s infinite}',
    '@keyframes baPulse{0%,100%{box-shadow:0 0 0 0 rgba(246,80,19,.4)}50%{box-shadow:0 0 0 6px rgba(246,80,19,0)}}',
    '.ba-check{flex-shrink:0;display:flex;align-items:center;cursor:pointer;padding-top:2px}',
    '.ba-card-body{flex:1;min-width:0}',
    '.ba-card-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}',
    '.ba-tag{font:var(--fw-bold) 9.5px/1.3 var(--font);padding:2px 7px;border-radius:var(--r-full);letter-spacing:.3px;flex-shrink:0}',
    '.ba-date{font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted);margin-left:auto}',
    '.ba-title{font:var(--fw-semibold) 13px/1.3 var(--font);color:var(--text-primary);margin-bottom:4px}',
    '.ba-card.unread .ba-title{font-weight:700}',
    '.ba-preview{font:var(--fw-regular) 11.5px/1.4 var(--font);color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.ba-del-single{position:absolute;top:10px;right:8px;width:28px;height:28px;border:none;background:transparent;color:var(--text-tertiary);border-radius:var(--r-md);cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.ba-del-single:hover{background:rgba(239,68,68,.08);color:#EF4444}',
    '.ba-empty{padding:60px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}',
    '.ba-empty-title{font:var(--fw-bold) 13.5px/1.3 var(--font);color:var(--text-primary);margin-top:6px}',
    '.ba-empty-sub{font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-muted)}',
    /* Detail modal */
    '.ba-modal-backdrop{position:fixed;inset:0;z-index:96;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}',
    '.ba-modal-backdrop.open{opacity:1}',
    '.ba-modal{width:100%;max-width:440px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;max-height:90vh;display:flex;flex-direction:column;transform:translateY(22px);transition:transform .28s ease}',
    '.ba-modal-backdrop.open .ba-modal{transform:translateY(0)}',
    '.ba-modal-head{padding:18px 18px 14px;border-bottom:1px solid var(--border-subtle);position:relative}',
    '.ba-modal-close{position:absolute;top:14px;right:14px;cursor:pointer}',
    '.ba-modal-title{font:var(--fw-bold) var(--fs-lg)/1.3 var(--font);color:var(--text-primary);margin-top:10px}',
    '.ba-modal-date{display:inline-flex;align-items:center;gap:4px;margin-top:8px;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)}',
    '.ba-modal-body{padding:16px 18px 24px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}',
    '.ba-modal-img{width:100%;max-height:200px;object-fit:cover;border-radius:var(--r-lg);background:var(--bg-btn)}',
    '.ba-modal-text{font:var(--fw-regular) 13px/1.6 var(--font);color:var(--text-primary);white-space:pre-wrap}',
    '.ba-modal-cta{padding:12px;border:1px solid var(--primary);background:var(--primary-light);color:var(--primary);border-radius:var(--r-lg);font:var(--fw-bold) 12.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}'
  ].join('\n');
  document.head.appendChild(s);
}

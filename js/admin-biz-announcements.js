/* ═══════════════════════════════════════════════════════════
   ADMIN · İŞLETME DUYURU YÖNETİMİ
   Liste · oluştur · hedefle · arşiv (7gün) · urgency seviyeleri
   ═══════════════════════════════════════════════════════════ */

var _aba = { tab: 'live', draft: null };

function openAdmBizAnnouncements() {
  _aba.tab = 'live';
  _abaInjectStyles();
  var existing = document.getElementById('abaOverlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'abaOverlay';
  overlay.className = 'aba-overlay';
  overlay.innerHTML = _abaBody();
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('open'); });
}

function closeAdmBizAnnouncements() {
  var el = document.getElementById('abaOverlay');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(function(){ if (el.parentNode) el.remove(); }, 240);
}

function _abaBody() {
  var live = ADMIN_BIZ_ANNOUNCEMENTS.filter(function(a){ return !a.deleted; });
  var archived = ADMIN_BIZ_ANNOUNCEMENTS.filter(function(a){ return a.deleted; });
  var showArchived = _aba.tab === 'archive';

  return '<div class="aba-head">'
    + '<div class="aba-close" onclick="closeAdmBizAnnouncements()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div class="aba-title"><iconify-icon icon="solar:megaphone-bold" style="font-size:20px"></iconify-icon>İşletme Duyuru Yönetimi</div>'
    + '<button class="aba-new" onclick="_abaOpenCreate()"><iconify-icon icon="solar:add-circle-bold" style="font-size:15px"></iconify-icon>Yeni Duyuru</button>'
    + '</div>'
    + '<div class="aba-tabs">'
    +   '<button class="aba-tab' + (!showArchived ? ' active' : '') + '" onclick="_abaSetTab(\'live\')">Yayında <span class="aba-tab-count">' + live.length + '</span></button>'
    +   '<button class="aba-tab' + (showArchived ? ' active' : '') + '" onclick="_abaSetTab(\'archive\')">Silinen <span class="aba-tab-count">' + archived.length + '</span></button>'
    + '</div>'
    + '<div class="aba-body">'
    +   (showArchived ? _abaRenderArchive(archived) : _abaRenderLive(live))
    + '</div>';
}

function _abaSetTab(t) { _aba.tab = t; _abaRerender(); }

function _abaRerender() {
  var o = document.getElementById('abaOverlay');
  if (!o) return;
  o.innerHTML = _abaBody();
}

function _abaRenderLive(list) {
  if (!list.length) return _abaEmpty('Henüz yayında duyuru yok', 'solar:megaphone-linear', 'Yeni duyuru oluşturmak için üst sağdaki butonu kullan');
  list = list.slice().sort(function(a,b){ return new Date(b.sentAt) - new Date(a.sentAt); });
  return '<div class="aba-list">' + list.map(_abaLiveCard).join('') + '</div>';
}

function _abaRenderArchive(list) {
  if (!list.length) return _abaEmpty('Arşiv boş', 'solar:archive-linear', 'Silinen duyurular 7 gün burada kalır, sonra kalıcı olarak silinir');
  list = list.slice().sort(function(a,b){ return new Date(b.deletedAt) - new Date(a.deletedAt); });
  return '<div class="aba-info-bar"><iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#3B82F6"></iconify-icon><span>Silinen duyurular <b>7 gün</b> arşivde tutulur, ardından kalıcı olarak silinir</span></div>'
    + '<div class="aba-list">' + list.map(_abaArchiveCard).join('') + '</div>';
}

function _abaEmpty(title, icon, sub) {
  return '<div class="aba-empty"><iconify-icon icon="' + icon + '" style="font-size:52px;opacity:.3"></iconify-icon>'
    + '<div class="aba-empty-title">' + title + '</div>'
    + '<div class="aba-empty-sub">' + sub + '</div></div>';
}

function _abaUrgencyChip(u) {
  var map = {
    normal:    { label:'Normal',  color:'#3B82F6' },
    important: { label:'Önemli',  color:'#F97316' },
    critical:  { label:'Kritik',  color:'#EF4444' }
  };
  var m = map[u] || map.normal;
  return '<span class="aba-urg" style="color:' + m.color + ';background:' + m.color + '14">' + m.label + '</span>';
}

function _abaStatusChip(a) {
  if (a.deleted) return '<span class="aba-status aba-status--deleted">Silindi (Arşivde)</span>';
  if (a.status === 'scheduled') return '<span class="aba-status aba-status--scheduled">Planlandı</span>';
  return '<span class="aba-status aba-status--live">Yayında</span>';
}

function _abaLiveCard(a) {
  return '<div class="aba-card" onclick="_abaOpenDetail(\'' + a.id + '\')">'
    + '<div class="aba-card-head">'
    +   _abaUrgencyChip(a.urgency)
    +   (a.tag ? '<span class="aba-tag">' + a.tag + '</span>' : '')
    +   _abaStatusChip(a)
    +   '<span class="aba-date">' + _abaFmtDate(a.sentAt) + '</span>'
    + '</div>'
    + '<div class="aba-title-row">'
    +   '<div class="aba-card-title">' + _abaEsc(a.title) + '</div>'
    +   '<button class="aba-card-del" onclick="event.stopPropagation();_abaDelete(\'' + a.id + '\')" title="Sil"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:16px"></iconify-icon></button>'
    + '</div>'
    + '<div class="aba-card-body">' + _abaEsc((a.body || '').slice(0, 140)) + ((a.body || '').length > 140 ? '…' : '') + '</div>'
    + '<div class="aba-card-foot">'
    +   '<div class="aba-target"><iconify-icon icon="' + _abaTargetIcon(a.targeting.type) + '" style="font-size:13px;color:var(--text-muted)"></iconify-icon><span>' + a.targeting.label + '</span><b>· ' + a.targeting.count + ' işletme</b></div>'
    +   '<div class="aba-admin"><iconify-icon icon="solar:user-bold" style="font-size:11px"></iconify-icon>' + a.publishedBy + '</div>'
    + '</div>'
    + '</div>';
}

function _abaArchiveCard(a) {
  var daysLeft = admBizAnnDaysLeft(a);
  return '<div class="aba-card aba-card--archived" onclick="_abaOpenDetail(\'' + a.id + '\')">'
    + '<div class="aba-card-head">'
    +   _abaUrgencyChip(a.urgency)
    +   (a.tag ? '<span class="aba-tag">' + a.tag + '</span>' : '')
    +   _abaStatusChip(a)
    +   '<span class="aba-countdown' + (daysLeft <= 1 ? ' urgent' : '') + '"><iconify-icon icon="solar:hourglass-line-bold" style="font-size:11px"></iconify-icon>Kalıcı silinmeye <b>' + daysLeft + '</b> gün kaldı</span>'
    + '</div>'
    + '<div class="aba-card-title">' + _abaEsc(a.title) + '</div>'
    + '<div class="aba-card-body">' + _abaEsc((a.body || '').slice(0, 120)) + ((a.body || '').length > 120 ? '…' : '') + '</div>'
    + '<div class="aba-del-log">'
    +   '<iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:12px;color:#DC2626"></iconify-icon>'
    +   '<span><b>' + _abaEsc(a.deletedBy) + '</b> tarafından ' + _abaFmtDate(a.deletedAt) + ' tarihinde silindi</span>'
    +   '<button class="aba-restore" onclick="event.stopPropagation();_abaRestore(\'' + a.id + '\')"><iconify-icon icon="solar:undo-left-round-bold" style="font-size:12px"></iconify-icon>Geri Al</button>'
    + '</div>'
    + '</div>';
}

function _abaTargetIcon(type) {
  return type === 'all' ? 'solar:users-group-two-rounded-linear'
    : type === 'location' ? 'solar:map-point-linear'
    : type === 'category' ? 'solar:tag-linear'
    : 'solar:checklist-minimalistic-linear';
}

/* ─ Actions ─ */
function _abaDelete(id) {
  var a = ADMIN_BIZ_ANNOUNCEMENTS.find(function(x){ return x.id === id; });
  if (!a) return;
  if (!confirm('"' + a.title + '" silinecek. 7 gün arşivde tutulup sonra kalıcı olarak silinecek. Onaylıyor musun?')) return;
  a.deleted = true;
  a.deletedAt = new Date().toISOString();
  a.deletedBy = (typeof ADMIN_USER !== 'undefined' && ADMIN_USER.name) ? ADMIN_USER.name + ' · Admin' : 'Ayşe Kaya · Operasyon Admin';
  if (typeof _admToast === 'function') _admToast('Duyuru arşive taşındı · 7 gün sonra kalıcı silinecek', 'ok');
  _abaRerender();
}

function _abaRestore(id) {
  var a = ADMIN_BIZ_ANNOUNCEMENTS.find(function(x){ return x.id === id; });
  if (!a) return;
  a.deleted = false;
  a.deletedAt = null;
  a.deletedBy = null;
  if (typeof _admToast === 'function') _admToast('Duyuru yeniden yayınlandı', 'ok');
  _abaRerender();
}

/* ─ Detail modal ─ */
function _abaOpenDetail(id) {
  var a = ADMIN_BIZ_ANNOUNCEMENTS.find(function(x){ return x.id === id; });
  if (!a) return;
  var ex = document.getElementById('abaDetailModal');
  if (ex) ex.remove();
  var m = document.createElement('div');
  m.id = 'abaDetailModal';
  m.className = 'aba-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _abaCloseDetail(); };
  m.innerHTML = '<div class="aba-modal">'
    + '<div class="aba-modal-head">'
    +   '<div class="aba-modal-close" onclick="_abaCloseDetail()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    +   '<div style="display:flex;gap:6px;margin-bottom:10px">' + _abaUrgencyChip(a.urgency) + (a.tag ? '<span class="aba-tag">' + a.tag + '</span>' : '') + '</div>'
    +   '<div class="aba-modal-title">' + _abaEsc(a.title) + '</div>'
    +   '<div class="aba-modal-meta"><iconify-icon icon="solar:user-bold" style="font-size:12px"></iconify-icon>' + a.publishedBy + '<span class="aba-sep">·</span>' + _abaFmtDate(a.sentAt) + '</div>'
    + '</div>'
    + '<div class="aba-modal-body">'
    +   '<div class="aba-target-box"><iconify-icon icon="' + _abaTargetIcon(a.targeting.type) + '" style="font-size:16px;color:var(--primary)"></iconify-icon><div><div style="font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted)">HEDEF</div><div style="font:var(--fw-semibold) 12.5px/1.3 var(--font);color:var(--text-primary);margin-top:3px">' + a.targeting.label + ' · ' + a.targeting.count + ' işletme</div></div></div>'
    +   (a.image ? '<img class="aba-modal-img" src="' + a.image + '" alt="">' : '')
    +   '<div class="aba-modal-text">' + _abaEsc(a.body).replace(/\n/g, '<br>') + '</div>'
    +   (a.deleted ? '<div class="aba-del-box"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:16px;color:#DC2626"></iconify-icon><div><div style="font:var(--fw-bold) 11.5px/1.2 var(--font);color:#991B1B">Arşivde</div><div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);margin-top:3px">' + a.deletedBy + ' tarafından ' + _abaFmtDate(a.deletedAt) + ' tarihinde silindi. ' + admBizAnnDaysLeft(a) + ' gün sonra kalıcı silinecek.</div></div></div>' : '')
    + '</div>'
    + '</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}
function _abaCloseDetail() {
  var m = document.getElementById('abaDetailModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
}

/* ─ Create modal ─ */
function _abaOpenCreate() {
  _aba.draft = {
    title:'', body:'', image:'', link:'',
    tag:'Sistem', urgency:'normal',
    targeting:{ type:'all' },
    cities:[], categories:[], branchIds:[]
  };
  _abaRenderCreate();
}

function _abaRenderCreate() {
  var ex = document.getElementById('abaCreateModal');
  if (ex) ex.remove();
  var d = _aba.draft;
  var m = document.createElement('div');
  m.id = 'abaCreateModal';
  m.className = 'aba-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _abaCloseCreate(); };
  m.innerHTML = '<div class="aba-modal aba-modal--large">'
    + '<div class="aba-modal-head">'
    +   '<div class="aba-modal-close" onclick="_abaCloseCreate()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    +   '<div class="aba-modal-title">Yeni Duyuru Oluştur</div>'
    +   '<div class="aba-modal-meta">Admin panelinden işletmelere toplu gönderim</div>'
    + '</div>'
    + '<div class="aba-modal-body">'
    +   '<label class="aba-f-label">Başlık *</label>'
    +   '<input type="text" class="aba-input" value="' + _abaEsc(d.title) + '" oninput="_aba.draft.title=this.value" placeholder="Duyuru başlığı">'
    +   '<label class="aba-f-label">Metin *</label>'
    +   '<textarea class="aba-input" rows="5" oninput="_aba.draft.body=this.value" placeholder="Duyuru içeriği...">' + _abaEsc(d.body) + '</textarea>'
    +   '<label class="aba-f-label">Görsel URL (opsiyonel)</label>'
    +   '<input type="text" class="aba-input" value="' + _abaEsc(d.image) + '" oninput="_aba.draft.image=this.value" placeholder="https://...">'
    +   '<label class="aba-f-label">Link (opsiyonel)</label>'
    +   '<input type="text" class="aba-input" value="' + _abaEsc(d.link) + '" oninput="_aba.draft.link=this.value" placeholder="/url-path">'

    +   '<div class="aba-section-lbl">Aciliyet Seviyesi</div>'
    +   '<div class="aba-urg-grid">'
    +     _abaUrgencyOpt('normal',    'Normal',  '#3B82F6', 'Genel bilgilendirme')
    +     + _abaUrgencyOpt('important', 'Önemli',  '#F97316', 'Sistem/ürün güncellemeleri')
    +     + _abaUrgencyOpt('critical',  'Kritik',  '#EF4444', 'Ödeme/yasal zorunluluklar')
    +   '</div>'

    +   '<div class="aba-section-lbl">Hedefleme</div>'
    +   '<div class="aba-target-grid">'
    +     _abaTargetOpt('all',      'Tüm İşletmeler',   'solar:users-group-two-rounded-bold')
    +     + _abaTargetOpt('location', 'Konum Bazlı',     'solar:map-point-bold')
    +     + _abaTargetOpt('category', 'Kategori/Tip',    'solar:tag-bold')
    +     + _abaTargetOpt('manual',   'Özel Seçim',      'solar:checklist-minimalistic-bold')
    +   '</div>'
    +   _abaTargetFields(d)

    +   '<div class="aba-foot">'
    +     '<button class="aba-btn aba-btn--ghost" onclick="_abaCloseCreate()">Vazgeç</button>'
    +     '<button class="aba-btn aba-btn--primary" onclick="_abaPublish()"><iconify-icon icon="solar:paper-plane-bold" style="font-size:14px"></iconify-icon>Yayınla</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _abaUrgencyOpt(key, label, color, sub) {
  var active = _aba.draft.urgency === key;
  return '<div class="aba-urg-opt' + (active ? ' active' : '') + '" style="' + (active ? '--active-color:' + color + ';border-color:' + color + ';background:' + color + '10' : '') + '" onclick="_abaSetUrgency(\'' + key + '\')">'
    + '<div style="width:12px;height:12px;border-radius:50%;background:' + color + '"></div>'
    + '<div style="flex:1"><div class="aba-urg-label" style="color:' + (active ? color : 'var(--text-primary)') + '">' + label + '</div><div class="aba-urg-sub">' + sub + '</div></div>'
    + '</div>';
}

function _abaTargetOpt(type, label, icon) {
  var active = _aba.draft.targeting.type === type;
  return '<div class="aba-target-opt' + (active ? ' active' : '') + '" onclick="_abaSetTargetType(\'' + type + '\')">'
    + '<iconify-icon icon="' + icon + '" style="font-size:18px"></iconify-icon>'
    + '<span>' + label + '</span>'
    + '</div>';
}

function _abaTargetFields(d) {
  if (d.targeting.type === 'all') {
    return '<div class="aba-target-info"><iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#3B82F6"></iconify-icon>Tüm 185 işletmeye gönderilecek</div>';
  }
  if (d.targeting.type === 'location') {
    var cities = ['İstanbul','Ankara','İzmir','Antalya','Bursa','Muğla','Adana','Eskişehir'];
    return '<div class="aba-section-sub">İl seç (birden fazla)</div><div class="aba-chips">'
      + cities.map(function(c){ var on = (d.cities || []).indexOf(c) > -1; return '<button class="aba-chip' + (on ? ' active' : '') + '" onclick="_abaToggleCity(\'' + c + '\')">' + c + '</button>'; }).join('')
      + '</div>';
  }
  if (d.targeting.type === 'category') {
    var cats = [
      { id:'restaurant', label:'Restoranlar' },
      { id:'cafe',       label:'Kafeler' },
      { id:'bakery',     label:'Fırın & Pastane' },
      { id:'takeaway',   label:'Sadece Paket Servis' },
      { id:'fastfood',   label:'Fast Food' },
      { id:'fine_dining',label:'Fine Dining' }
    ];
    return '<div class="aba-section-sub">İşletme tipi seç</div><div class="aba-chips">'
      + cats.map(function(c){ var on = (d.categories || []).indexOf(c.id) > -1; return '<button class="aba-chip' + (on ? ' active' : '') + '" onclick="_abaToggleCategory(\'' + c.id + '\')">' + c.label + '</button>'; }).join('')
      + '</div>';
  }
  if (d.targeting.type === 'manual') {
    var sample = [
      { id:'b1', label:'Burger Lab · Kadıköy' },
      { id:'b2', label:'Burger Lab · Beşiktaş' },
      { id:'b3', label:'Burger Lab · Ataşehir' },
      { id:'b_caf_1', label:'Mahalle Kahvecisi · Cihangir' },
      { id:'b_pz_2',  label:'Piccola Pizza · Nişantaşı' },
      { id:'b_dn_3',  label:'Deniz Cafe · Bebek' }
    ];
    return '<div class="aba-section-sub">Şube ara ve seç</div><div class="aba-chips">'
      + sample.map(function(b){ var on = (d.branchIds || []).indexOf(b.id) > -1; return '<button class="aba-chip' + (on ? ' active' : '') + '" onclick="_abaToggleBranch(\'' + b.id + '\')">' + b.label + '</button>'; }).join('')
      + '</div>';
  }
  return '';
}

function _abaSetUrgency(u) { _aba.draft.urgency = u; _abaRenderCreate(); }
function _abaSetTargetType(t) { _aba.draft.targeting.type = t; _abaRenderCreate(); }
function _abaToggleCity(c) {
  var arr = _aba.draft.cities;
  var idx = arr.indexOf(c);
  if (idx > -1) arr.splice(idx, 1); else arr.push(c);
  _abaRenderCreate();
}
function _abaToggleCategory(c) {
  var arr = _aba.draft.categories;
  var idx = arr.indexOf(c);
  if (idx > -1) arr.splice(idx, 1); else arr.push(c);
  _abaRenderCreate();
}
function _abaToggleBranch(b) {
  var arr = _aba.draft.branchIds;
  var idx = arr.indexOf(b);
  if (idx > -1) arr.splice(idx, 1); else arr.push(b);
  _abaRenderCreate();
}

function _abaPublish() {
  var d = _aba.draft;
  if (!d.title.trim() || !d.body.trim()) {
    if (typeof _admToast === 'function') _admToast('Başlık ve metin zorunlu', 'err');
    else alert('Başlık ve metin zorunlu');
    return;
  }
  var targeting = { type: d.targeting.type };
  if (d.targeting.type === 'all') { targeting.label = 'Tüm İşletmeler'; targeting.count = 185; }
  else if (d.targeting.type === 'location') { targeting.label = d.cities.join(', ') || 'Konum seçilmedi'; targeting.count = d.cities.length * 15; targeting.cities = d.cities.slice(); }
  else if (d.targeting.type === 'category') { targeting.label = d.categories.length + ' kategori'; targeting.count = d.categories.length * 28; targeting.categories = d.categories.slice(); }
  else { targeting.label = 'Özel Seçim (' + d.branchIds.length + ' şube)'; targeting.count = d.branchIds.length; targeting.branchIds = d.branchIds.slice(); }
  if (!targeting.count) {
    if (typeof _admToast === 'function') _admToast('En az bir hedef seçmelisin', 'err');
    else alert('En az bir hedef seçmelisin');
    return;
  }
  var urg = d.urgency;
  var tagMap = { normal:'Sistem', important:'Güncelleme', critical:'Kritik' };
  ADMIN_BIZ_ANNOUNCEMENTS.unshift({
    id: 'ann_' + Date.now(),
    title: d.title.trim(),
    body: d.body.trim(),
    image: d.image.trim() || null,
    link: d.link.trim() || null,
    tag: tagMap[urg] || 'Sistem',
    urgency: urg,
    sentAt: new Date().toISOString(),
    publishedBy: (typeof ADMIN_USER !== 'undefined' && ADMIN_USER.name) ? ADMIN_USER.name + ' · Admin' : 'Ayşe Kaya · Operasyon Admin',
    targeting: targeting,
    status: 'published',
    deleted: false
  });
  if (typeof _admToast === 'function') _admToast('Duyuru yayınlandı · ' + targeting.count + ' işletmeye gönderildi', 'ok');
  _abaCloseCreate();
  _abaRerender();
}

function _abaCloseCreate() {
  var m = document.getElementById('abaCreateModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
  _aba.draft = null;
}

/* ─ Helpers ─ */
function _abaEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _abaFmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' }) + ' · ' + d.toTimeString().slice(0,5);
}

function _abaInjectStyles() {
  if (document.getElementById('abaStyles')) return;
  var s = document.createElement('style');
  s.id = 'abaStyles';
  s.textContent = [
    '.aba-overlay{position:fixed;inset:0;z-index:130;background:var(--bg-page);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(20px);transition:opacity .3s ease, transform .3s ease}',
    '.aba-overlay.open{opacity:1;transform:translateY(0)}',
    '.aba-head{padding:max(env(safe-area-inset-top),18px) 16px 14px;background:linear-gradient(135deg,#EC4899 0%,#DB2777 100%);color:#fff;display:flex;align-items:center;gap:10px;flex-shrink:0}',
    '.aba-close{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px)}',
    '.aba-title{flex:1;font:var(--fw-bold) 16px/1 var(--font);display:flex;align-items:center;gap:8px}',
    '.aba-new{padding:8px 14px;border:none;border-radius:var(--r-full);background:#fff;color:#DB2777;font:var(--fw-bold) 12px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px}',
    '.aba-tabs{display:flex;gap:4px;padding:10px 16px 0;background:var(--bg-page);flex-shrink:0;border-bottom:1px solid var(--border-subtle)}',
    '.aba-tab{padding:10px 14px;border:none;background:transparent;color:var(--text-muted);font:var(--fw-semibold) 12.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:6px;border-bottom:2px solid transparent;margin-bottom:-1px}',
    '.aba-tab.active{color:#EC4899;border-bottom-color:#EC4899}',
    '.aba-tab-count{padding:1px 7px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-secondary);font:var(--fw-bold) 10px/1.4 var(--font)}',
    '.aba-tab.active .aba-tab-count{background:#EC4899;color:#fff}',
    '.aba-body{flex:1;overflow-y:auto;padding:14px 16px 24px;display:flex;flex-direction:column;gap:12px}',
    '.aba-info-bar{display:flex;align-items:center;gap:6px;padding:10px 12px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.22);border-radius:var(--r-md);font:var(--fw-regular) 11.5px/1.4 var(--font);color:var(--text-secondary)}',
    '.aba-info-bar b{color:var(--text-primary);font-weight:700}',
    '.aba-list{display:flex;flex-direction:column;gap:10px}',
    '.aba-card{padding:14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);cursor:pointer;display:flex;flex-direction:column;gap:8px;transition:box-shadow .15s}',
    '.aba-card:hover{box-shadow:var(--shadow-md)}',
    '.aba-card--archived{opacity:.85;background:linear-gradient(90deg,rgba(239,68,68,.04),var(--bg-phone))}',
    '.aba-card-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.aba-urg{padding:3px 9px;border-radius:var(--r-full);font:var(--fw-bold) 10px/1.4 var(--font);letter-spacing:.3px}',
    '.aba-tag{padding:3px 9px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-secondary);font:var(--fw-bold) 9.5px/1.4 var(--font)}',
    '.aba-status{padding:3px 9px;border-radius:var(--r-full);font:var(--fw-bold) 9.5px/1.4 var(--font);letter-spacing:.3px}',
    '.aba-status--live{background:rgba(34,197,94,.12);color:#16A34A}',
    '.aba-status--scheduled{background:rgba(59,130,246,.12);color:#2563EB}',
    '.aba-status--deleted{background:rgba(239,68,68,.12);color:#DC2626}',
    '.aba-date{margin-left:auto;font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted)}',
    '.aba-title-row{display:flex;align-items:flex-start;gap:8px}',
    '.aba-card-title{flex:1;font:var(--fw-bold) 13.5px/1.3 var(--font);color:var(--text-primary)}',
    '.aba-card-del{width:28px;height:28px;border:none;background:transparent;color:var(--text-tertiary);border-radius:var(--r-md);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.aba-card-del:hover{background:rgba(239,68,68,.08);color:#EF4444}',
    '.aba-card-body{font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary)}',
    '.aba-card-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding-top:8px;border-top:1px dashed var(--border-subtle);flex-wrap:wrap}',
    '.aba-target{display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-secondary)}',
    '.aba-target b{color:var(--text-primary)}',
    '.aba-admin{display:inline-flex;align-items:center;gap:4px;font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted)}',
    '.aba-countdown{margin-left:auto;display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:var(--r-full);background:rgba(245,158,11,.12);color:#D97706;font:var(--fw-bold) 10px/1.4 var(--font)}',
    '.aba-countdown.urgent{background:rgba(239,68,68,.14);color:#DC2626;animation:abaBlink 1.5s infinite}',
    '@keyframes abaBlink{0%,100%{opacity:1}50%{opacity:.6}}',
    '.aba-del-log{display:flex;align-items:center;gap:6px;padding:8px 10px;background:rgba(239,68,68,.06);border-radius:var(--r-md);font:var(--fw-regular) 10.5px/1.4 var(--font);color:var(--text-muted)}',
    '.aba-del-log b{color:var(--text-primary);font-weight:700}',
    '.aba-restore{margin-left:auto;padding:5px 10px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--primary);border-radius:var(--r-full);font:var(--fw-bold) 10.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.aba-empty{padding:60px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.aba-empty-title{font:var(--fw-bold) 13.5px/1.3 var(--font);color:var(--text-primary);margin-top:6px}',
    '.aba-empty-sub{font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-muted)}',
    /* Modals */
    '.aba-modal-backdrop{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .22s}',
    '.aba-modal-backdrop.open{opacity:1}',
    '.aba-modal{width:100%;max-width:460px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;transform:translateY(24px);transition:transform .28s ease}',
    '.aba-modal--large{max-width:500px}',
    '.aba-modal-backdrop.open .aba-modal{transform:translateY(0)}',
    '.aba-modal-head{padding:18px 18px 12px;border-bottom:1px solid var(--border-subtle);position:relative}',
    '.aba-modal-close{position:absolute;top:14px;right:14px;cursor:pointer}',
    '.aba-modal-title{font:var(--fw-bold) 16px/1.3 var(--font);color:var(--text-primary)}',
    '.aba-modal-meta{display:flex;align-items:center;gap:5px;margin-top:6px;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);flex-wrap:wrap}',
    '.aba-sep{color:var(--text-tertiary)}',
    '.aba-modal-body{padding:14px 18px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}',
    '.aba-target-box{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--primary-light);border:1px solid var(--primary-soft);border-radius:var(--r-md)}',
    '.aba-modal-img{width:100%;max-height:200px;object-fit:cover;border-radius:var(--r-md)}',
    '.aba-modal-text{font:var(--fw-regular) 13px/1.6 var(--font);color:var(--text-primary);white-space:pre-wrap}',
    '.aba-del-box{display:flex;gap:10px;padding:12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.24);border-radius:var(--r-md)}',
    /* Create form */
    '.aba-f-label{font:var(--fw-bold) 10.5px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-top:4px}',
    '.aba-input{width:100%;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) 13px/1.4 var(--font);color:var(--text-primary);outline:none;box-sizing:border-box;resize:vertical;font-family:inherit}',
    '.aba-input:focus{border-color:var(--primary)}',
    '.aba-section-lbl{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-primary);margin-top:10px;padding-bottom:4px;border-bottom:1px solid var(--border-subtle)}',
    '.aba-section-sub{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-top:2px}',
    '.aba-urg-grid{display:flex;flex-direction:column;gap:6px}',
    '.aba-urg-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--border-subtle);background:var(--bg-phone);border-radius:var(--r-md);cursor:pointer}',
    '.aba-urg-opt.active{}',
    '.aba-urg-label{font:var(--fw-bold) 12.5px/1.2 var(--font);color:var(--text-primary)}',
    '.aba-urg-sub{font:var(--fw-regular) 10.5px/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.aba-target-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
    '.aba-target-opt{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px;border:1.5px solid var(--border-subtle);background:var(--bg-phone);border-radius:var(--r-md);cursor:pointer;color:var(--text-secondary);font:var(--fw-semibold) 11px/1.2 var(--font);text-align:center}',
    '.aba-target-opt.active{border-color:var(--primary);background:var(--primary-light);color:var(--primary)}',
    '.aba-target-info{padding:10px 12px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.22);border-radius:var(--r-md);font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-secondary);display:flex;align-items:center;gap:6px}',
    '.aba-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.aba-chip{padding:7px 12px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-medium) 11.5px/1 var(--font);border-radius:var(--r-full);cursor:pointer}',
    '.aba-chip.active{background:var(--primary);color:#fff;border-color:var(--primary)}',
    '.aba-foot{display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border-subtle)}',
    '.aba-btn{flex:1;padding:12px;border:none;border-radius:var(--r-md);font:var(--fw-bold) 13px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.aba-btn:active{transform:scale(.97)}',
    '.aba-btn--ghost{background:var(--bg-btn);color:var(--text-primary)}',
    '.aba-btn--primary{background:linear-gradient(135deg,#EC4899,#DB2777);color:#fff}'
  ].join('\n');
  document.head.appendChild(s);
}

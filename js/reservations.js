/* ═══════════════════════════════════════════════════════════
   RESERVATIONS — Rezervasyon Yönetimi (Kullanıcı)
   (Liste · oluşturma akışı · güncelleme · iptal 24h kuralı)
   ═══════════════════════════════════════════════════════════ */

var _rsv = {
  tab: 'active',          // 'active' | 'past'
  detailId: null,
  // Oluşturma akışı
  createOpen: false,
  step: 1,                // 1=biz, 2=date/time, 3=table, 4=confirm
  venueSearch: '',
  selectedVenue: null,
  selectedDate: '',
  selectedTime: '',
  selectedGuests: 2,
  selectedTable: null,
  // Edit
  editDate: '', editTime: ''
};

function openReservationsPage() {
  _rsvInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.rsv-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open rsv-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'rsvOverlay';
  phone.appendChild(overlay);

  _rsv.tab = 'active';
  _rsvRender();
}

function _rsvCloseOverlay() {
  var o = document.getElementById('rsvOverlay');
  if (o) o.remove();
  _rsvCloseDetail();
  _rsvCloseCreate();
}

/* ═══ Helpers ═══ */
function _rsvEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _rsvVenue(id) {
  for (var i = 0; i < RESERVATION_VENUES.length; i++) {
    if (RESERVATION_VENUES[i].id === id) return RESERVATION_VENUES[i];
  }
  return null;
}

function _rsvRes(id) {
  for (var i = 0; i < USER_RESERVATIONS.length; i++) {
    if (USER_RESERVATIONS[i].id === id) return USER_RESERVATIONS[i];
  }
  return null;
}

function _rsvFmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso + 'T00:00:00');
  var days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  var months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + days[d.getDay()];
}

function _rsvHoursUntil(dateStr, timeStr) {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM'
  var target = new Date(dateStr + 'T' + (timeStr || '12:00') + ':00');
  var now = new Date();
  return (target - now) / 3600000;
}

function _rsvIsSameDay(dateStr) {
  var today = new Date();
  var y = today.getFullYear();
  var m = String(today.getMonth()+1).padStart(2,'0');
  var d = String(today.getDate()).padStart(2,'0');
  return dateStr === (y+'-'+m+'-'+d);
}

function _rsvStatusMeta(status) {
  if (status === 'confirmed') return { label:'Onaylı',     color:'#22C55E', bg:'rgba(34,197,94,.12)',  icon:'solar:check-circle-bold' };
  if (status === 'pending')   return { label:'Bekliyor',   color:'#F59E0B', bg:'rgba(245,158,11,.12)', icon:'solar:clock-circle-bold' };
  if (status === 'completed') return { label:'Tamamlandı', color:'#6B7280', bg:'rgba(107,114,128,.12)',icon:'solar:verified-check-bold' };
  if (status === 'cancelled') return { label:'İptal',      color:'#EF4444', bg:'rgba(239,68,68,.12)',  icon:'solar:close-circle-bold' };
  return { label: status, color:'#6B7280', bg:'rgba(107,114,128,.12)', icon:'solar:question-circle-linear' };
}

/* ═══ Main Render ═══ */
function _rsvRender() {
  var o = document.getElementById('rsvOverlay');
  if (!o) return;

  var h = '<div class="rsv-header">'
    + '<div class="rsv-back" onclick="_rsvCloseOverlay()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="rsv-title"><iconify-icon icon="solar:calendar-mark-bold" style="font-size:17px;color:#8B5CF6"></iconify-icon>Rezervasyonlarım</div>'
    + '<div class="rsv-sub">Aktif ve geçmiş randevular</div>'
    + '</div>'
    + '<button class="rsv-create-btn" onclick="_rsvOpenCreate()">'
    + '<iconify-icon icon="solar:add-circle-bold" style="font-size:16px"></iconify-icon>Oluştur</button>'
    + '</div>'
    + '<div id="rsvBody" style="flex:1;padding:14px"></div>';

  o.innerHTML = h;
  _rsvRenderBody();
}

function _rsvRenderBody() {
  var body = document.getElementById('rsvBody');
  if (!body) return;

  var activeList = USER_RESERVATIONS.filter(function(r){ return r.status === 'confirmed' || r.status === 'pending'; });
  var pastList = USER_RESERVATIONS.filter(function(r){ return r.status === 'completed' || r.status === 'cancelled'; });

  var h = '<div class="rsv-tabs">'
    + '<button class="rsv-tab' + (_rsv.tab==='active'?' active':'') + '" onclick="_rsv.tab=\'active\';_rsvRenderBody()">'
    + '<iconify-icon icon="solar:calendar-bold" style="font-size:14px"></iconify-icon>'
    + 'Aktif <span class="rsv-tab-count">' + activeList.length + '</span></button>'
    + '<button class="rsv-tab' + (_rsv.tab==='past'?' active':'') + '" onclick="_rsv.tab=\'past\';_rsvRenderBody()">'
    + '<iconify-icon icon="solar:history-bold" style="font-size:14px"></iconify-icon>'
    + 'Geçmiş <span class="rsv-tab-count">' + pastList.length + '</span></button>'
    + '</div>';

  var list = _rsv.tab === 'active' ? activeList : pastList;

  if (list.length === 0) {
    h += '<div class="rsv-empty">'
      + '<iconify-icon icon="solar:calendar-linear" style="font-size:48px;opacity:0.3"></iconify-icon>'
      + '<div>' + (_rsv.tab==='active' ? 'Aktif rezervasyonunuz yok' : 'Geçmiş kayıt yok') + '</div>'
      + (_rsv.tab==='active' ? '<div class="rsv-empty-sub">Yeni bir rezervasyon oluşturarak başlayın</div>' : '')
      + (_rsv.tab==='active' ? '<button class="rsv-empty-cta" onclick="_rsvOpenCreate()"><iconify-icon icon="solar:add-circle-bold" style="font-size:15px"></iconify-icon>Rezervasyon Oluştur</button>' : '')
      + '</div>';
  } else {
    // Tarihe göre sırala — aktif: yaklaşan önce, geçmiş: yeni önce
    list = list.slice().sort(function(a,b){
      var da = a.date + ' ' + a.time;
      var db = b.date + ' ' + b.time;
      return _rsv.tab === 'active' ? (da > db ? 1 : -1) : (da > db ? -1 : 1);
    });
    h += '<div class="rsv-list">';
    for (var i = 0; i < list.length; i++) h += _rsvCard(list[i]);
    h += '</div>';
  }

  body.innerHTML = h;
}

function _rsvCard(r) {
  var st = _rsvStatusMeta(r.status);
  var hoursLeft = _rsvHoursUntil(r.date, r.time);
  var urgent = (r.status === 'confirmed' || r.status === 'pending') && hoursLeft > 0 && hoursLeft < 24;

  return '<div class="rsv-card" onclick="_rsvOpenDetail(\'' + r.id + '\')">'
    + '<div class="rsv-card-left" style="background:' + st.bg + ';color:' + st.color + '">'
    + '<iconify-icon icon="' + st.icon + '" style="font-size:20px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="rsv-card-head">'
    + '<div class="rsv-card-venue">' + _rsvEsc(r.venueName) + '</div>'
    + '<span class="rsv-pill" style="background:' + st.bg + ';color:' + st.color + '">' + st.label + '</span>'
    + '</div>'
    + '<div class="rsv-card-meta">'
    + '<span><iconify-icon icon="solar:calendar-minimalistic-linear" style="font-size:12px"></iconify-icon> ' + _rsvFmtDate(r.date) + '</span>'
    + '<span>·</span>'
    + '<span><iconify-icon icon="solar:clock-circle-linear" style="font-size:12px"></iconify-icon> ' + _rsvEsc(r.time) + '</span>'
    + '<span>·</span>'
    + '<span><iconify-icon icon="solar:chair-2-linear" style="font-size:12px"></iconify-icon> ' + _rsvEsc(r.tableLabel) + '</span>'
    + '</div>'
    + '<div class="rsv-card-sub">'
    + '<span>' + _rsvEsc(r.district) + ' · ' + r.guests + ' kişi</span>'
    + (urgent ? '<span class="rsv-urgent"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:11px"></iconify-icon> &lt;24sa</span>' : '')
    + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted);flex-shrink:0"></iconify-icon>'
    + '</div>';
}

/* ═══════════════════════════════════════════════════════════
   P3 — Rezervasyon Oluşturma Akışı (4 Adım)
   ═══════════════════════════════════════════════════════════ */

function _rsvOpenCreate() {
  _rsvCloseCreate();
  _rsv.createOpen = true;
  _rsv.step = 1;
  _rsv.venueSearch = '';
  _rsv.selectedVenue = null;
  _rsv.selectedDate = '';
  _rsv.selectedTime = '';
  _rsv.selectedGuests = 2;
  _rsv.selectedTable = null;

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'rsvCreate';
  m.className = 'rsv-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _rsvCloseCreate(); };
  m.innerHTML = '<div class="rsv-modal"><div id="rsvCreateBody"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _rsvRenderCreate();
}

function _rsvCloseCreate() {
  _rsv.createOpen = false;
  var m = document.getElementById('rsvCreate');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
}

function _rsvRenderCreate() {
  var body = document.getElementById('rsvCreateBody');
  if (!body) return;
  var h = _rsvStepHeader();
  if (_rsv.step === 1) h += _rsvStep1();
  else if (_rsv.step === 2) h += _rsvStep2();
  else if (_rsv.step === 3) h += _rsvStep3();
  else if (_rsv.step === 4) h += _rsvStep4();
  body.innerHTML = h;
}

function _rsvStepHeader() {
  var titles = ['İşletme Seç', 'Tarih & Saat', 'Masa Seç', 'Onay & Token'];
  return '<div class="rsv-step-head">'
    + '<div class="rsv-step-close" onclick="_rsvCloseCreate()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="rsv-step-title">' + titles[_rsv.step - 1] + '</div>'
    + '<div class="rsv-step-sub">Adım ' + _rsv.step + '/4</div>'
    + '</div>'
    + '</div>'
    + '<div class="rsv-step-dots">'
    + [1,2,3,4].map(function(i){
        return '<div class="rsv-step-dot' + (i < _rsv.step ? ' done' : i === _rsv.step ? ' active' : '') + '"></div>';
      }).join('')
    + '</div>';
}

function _rsvStep1() {
  var q = (_rsv.venueSearch || '').toLowerCase().trim();
  var list = RESERVATION_VENUES.filter(function(v) {
    if (!q) return true;
    return v.name.toLowerCase().indexOf(q) > -1 || v.district.toLowerCase().indexOf(q) > -1;
  });

  var h = '<div class="rsv-step-body">'
    + '<div class="rsv-search">'
    + '<iconify-icon icon="solar:magnifer-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input type="text" placeholder="İşletme veya semt ara..." value="' + _rsvEsc(_rsv.venueSearch) + '" oninput="_rsv.venueSearch=this.value;_rsvRenderStep1List()">'
    + '</div>'
    + '<div id="rsvVenueList" class="rsv-venue-list">'
    + _rsvStep1List(list)
    + '</div>'
    + '</div>';
  return h;
}

function _rsvRenderStep1List() {
  var q = (_rsv.venueSearch || '').toLowerCase().trim();
  var list = RESERVATION_VENUES.filter(function(v) {
    if (!q) return true;
    return v.name.toLowerCase().indexOf(q) > -1 || v.district.toLowerCase().indexOf(q) > -1;
  });
  var el = document.getElementById('rsvVenueList');
  if (el) el.innerHTML = _rsvStep1List(list);
}

function _rsvStep1List(list) {
  if (list.length === 0) {
    return '<div class="rsv-empty-small">İşletme bulunamadı</div>';
  }
  var h = '';
  for (var i = 0; i < list.length; i++) {
    var v = list[i];
    h += '<div class="rsv-venue-row" onclick="_rsvPickVenue(\'' + v.id + '\')">'
      + '<div class="rsv-venue-img" style="background-image:url(' + v.img + ')"></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="rsv-venue-name">' + _rsvEsc(v.name) + '</div>'
      + '<div class="rsv-venue-district">' + _rsvEsc(v.district) + '</div>'
      + '<div class="rsv-venue-chips">'
      + '<span class="rsv-chip-mini"><iconify-icon icon="solar:star-bold" style="font-size:10px;color:#F59E0B"></iconify-icon> ' + v.rating + '</span>'
      + '<span class="rsv-chip-mini"><iconify-icon icon="solar:tag-price-linear" style="font-size:10px"></iconify-icon> ' + v.tokenCost + ' token</span>'
      + '<span class="rsv-chip-mini">' + v.tables.length + ' masa</span>'
      + '</div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted)"></iconify-icon>'
      + '</div>';
  }
  return h;
}

function _rsvPickVenue(id) {
  _rsv.selectedVenue = _rsvVenue(id);
  _rsv.step = 2;
  _rsvRenderCreate();
}

/* ═══ Adım 2: Tarih & Saat ═══ */
function _rsvStep2() {
  var v = _rsv.selectedVenue;
  var months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  // Bugünden itibaren 14 gün
  var today = new Date();
  today.setHours(0,0,0,0);
  var cells = [];
  for (var i = 0; i < 14; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    var iso = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    var closed = v.closedDays.indexOf(d.getDay()) > -1;
    var full = v.fullDates.indexOf(iso) > -1;
    cells.push({ iso: iso, date: d, closed: closed, full: full, dow: days[d.getDay()] });
  }

  var times = ['12:00','13:00','14:00','18:00','19:00','19:30','20:00','20:30','21:00','21:30','22:00'];

  var h = '<div class="rsv-step-body">'
    + '<div class="rsv-sel-venue">'
    + '<div class="rsv-venue-img rsv-venue-img--sm" style="background-image:url(' + v.img + ')"></div>'
    + '<div><div class="rsv-sel-name">' + _rsvEsc(v.name) + '</div>'
    + '<div class="rsv-sel-dist">' + _rsvEsc(v.district) + '</div></div>'
    + '</div>'
    + '<div class="rsv-field-lbl">Tarih</div>'
    + '<div class="rsv-date-grid">';
  for (var j = 0; j < cells.length; j++) {
    var c = cells[j];
    var disabled = c.closed || c.full;
    var active = _rsv.selectedDate === c.iso;
    h += '<div class="rsv-date-cell' + (disabled ? ' disabled' : '') + (active ? ' active' : '') + '"'
      + (disabled ? '' : ' onclick="_rsv.selectedDate=\'' + c.iso + '\';_rsvRenderCreate()"') + '>'
      + '<div class="rsv-date-dow">' + c.dow + '</div>'
      + '<div class="rsv-date-num">' + c.date.getDate() + '</div>'
      + '<div class="rsv-date-mon">' + months[c.date.getMonth()].slice(0,3) + '</div>'
      + (c.closed ? '<div class="rsv-date-tag">Kapalı</div>' : c.full ? '<div class="rsv-date-tag rsv-date-tag--full">Dolu</div>' : '')
      + '</div>';
  }
  h += '</div>';

  h += '<div class="rsv-field-lbl">Saat</div>'
    + '<div class="rsv-time-grid">';
  for (var k = 0; k < times.length; k++) {
    var t = times[k];
    var activeT = _rsv.selectedTime === t;
    h += '<div class="rsv-time-cell' + (activeT ? ' active' : '') + '" onclick="_rsv.selectedTime=\'' + t + '\';_rsvRenderCreate()">' + t + '</div>';
  }
  h += '</div>';

  // Kişi sayısı
  h += '<div class="rsv-field-lbl">Kişi Sayısı</div>'
    + '<div class="rsv-guests">'
    + '<button class="rsv-g-btn" onclick="_rsv.selectedGuests=Math.max(1,_rsv.selectedGuests-1);_rsvRenderCreate()">−</button>'
    + '<div class="rsv-g-val">' + _rsv.selectedGuests + ' kişi</div>'
    + '<button class="rsv-g-btn" onclick="_rsv.selectedGuests=Math.min(12,_rsv.selectedGuests+1);_rsvRenderCreate()">+</button>'
    + '</div>';

  var canNext = _rsv.selectedDate && _rsv.selectedTime;
  h += '<div class="rsv-step-footer">'
    + '<button class="rsv-btn-ghost" onclick="_rsv.step=1;_rsvRenderCreate()">Geri</button>'
    + '<button class="rsv-btn-primary' + (canNext ? '' : ' disabled') + '"' + (canNext ? ' onclick="_rsv.step=3;_rsvRenderCreate()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon></button>'
    + '</div>'
    + '</div>';
  return h;
}

/* ═══ Adım 3: Masa Seç ═══ */
function _rsvStep3() {
  var v = _rsv.selectedVenue;
  // Alan bazında grupla
  var byArea = {};
  for (var i = 0; i < v.tables.length; i++) {
    var t = v.tables[i];
    if (!byArea[t.area]) byArea[t.area] = [];
    byArea[t.area].push(t);
  }

  var h = '<div class="rsv-step-body">'
    + '<div class="rsv-map-legend">'
    + '<span><i style="background:#22C55E"></i>Boş</span>'
    + '<span><i style="background:#EF4444"></i>Dolu</span>'
    + '<span><i style="background:#8B5CF6"></i>Seçili</span>'
    + '</div>';

  var areaKeys = Object.keys(byArea);
  for (var a = 0; a < areaKeys.length; a++) {
    var area = areaKeys[a];
    var areaTables = byArea[area];
    h += '<div class="rsv-map-area">'
      + '<div class="rsv-map-area-lbl">' + _rsvEsc(area) + '</div>'
      + '<div class="rsv-map-grid">';
    for (var t2 = 0; t2 < areaTables.length; t2++) {
      var tbl = areaTables[t2];
      var isSel = _rsv.selectedTable && _rsv.selectedTable.id === tbl.id;
      var cls = tbl.status === 'occupied' ? 'occupied' : (isSel ? 'selected' : 'available');
      // Kapasite yetersiz
      var smallCap = tbl.capacity < _rsv.selectedGuests;
      if (smallCap && tbl.status !== 'occupied') cls += ' too-small';
      var clickable = tbl.status !== 'occupied';
      h += '<div class="rsv-table rsv-table--' + cls + '"'
        + (clickable ? ' onclick="_rsvPickTable(\'' + tbl.id + '\')"' : '') + '>'
        + '<div class="rsv-table-num">' + _rsvEsc(tbl.label) + '</div>'
        + '<div class="rsv-table-cap"><iconify-icon icon="solar:users-group-rounded-linear" style="font-size:11px"></iconify-icon>' + tbl.capacity + '</div>'
        + (smallCap && tbl.status !== 'occupied' ? '<div class="rsv-table-warn">küçük</div>' : '')
        + '</div>';
    }
    h += '</div></div>';
  }

  var canNext = !!_rsv.selectedTable;
  h += '<div class="rsv-step-footer">'
    + '<button class="rsv-btn-ghost" onclick="_rsv.step=2;_rsvRenderCreate()">Geri</button>'
    + '<button class="rsv-btn-primary' + (canNext ? '' : ' disabled') + '"' + (canNext ? ' onclick="_rsv.step=4;_rsvRenderCreate()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon></button>'
    + '</div>'
    + '</div>';
  return h;
}

function _rsvPickTable(tid) {
  var v = _rsv.selectedVenue;
  for (var i = 0; i < v.tables.length; i++) {
    if (v.tables[i].id === tid) { _rsv.selectedTable = v.tables[i]; break; }
  }
  _rsvRenderCreate();
}

/* ═══ Adım 4: Onay + Token Bloke ═══ */
function _rsvStep4() {
  var v = _rsv.selectedVenue;
  var t = _rsv.selectedTable;

  var h = '<div class="rsv-step-body">'
    + '<div class="rsv-review-card">'
    + '<div class="rsv-review-row"><span>İşletme</span><b>' + _rsvEsc(v.name) + '</b></div>'
    + '<div class="rsv-review-row"><span>Semt</span><b>' + _rsvEsc(v.district) + '</b></div>'
    + '<div class="rsv-review-row"><span>Tarih</span><b>' + _rsvFmtDate(_rsv.selectedDate) + '</b></div>'
    + '<div class="rsv-review-row"><span>Saat</span><b>' + _rsvEsc(_rsv.selectedTime) + '</b></div>'
    + '<div class="rsv-review-row"><span>Masa</span><b>' + _rsvEsc(t.label) + ' · ' + _rsvEsc(t.area) + '</b></div>'
    + '<div class="rsv-review-row"><span>Kişi</span><b>' + _rsv.selectedGuests + '</b></div>'
    + '</div>';

  h += '<div class="rsv-token-box">'
    + '<div class="rsv-token-head">'
    + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:20px;color:#F59E0B"></iconify-icon>'
    + '<div><div class="rsv-token-lbl">TOKEN BLOKE</div>'
    + '<div class="rsv-token-val">' + v.tokenCost + ' Token</div></div>'
    + '</div>'
    + '<div class="rsv-token-desc">'
    + 'Bu rezervasyon için hesabınızdaki <b>' + v.tokenCost + ' token</b> bloke edilecektir. '
    + 'Rezervasyon tamamlandığında serbest bırakılır. '
    + '<b>24 saat içinde</b> iptal ederseniz token işletmeye aktarılır.'
    + '</div>'
    + '</div>';

  h += '<div class="rsv-step-footer">'
    + '<button class="rsv-btn-ghost" onclick="_rsv.step=3;_rsvRenderCreate()">Geri</button>'
    + '<button class="rsv-btn-primary" onclick="_rsvSubmitCreate()">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Onayla & Bloke Et</button>'
    + '</div>'
    + '</div>';
  return h;
}

function _rsvSubmitCreate() {
  var v = _rsv.selectedVenue;
  var t = _rsv.selectedTable;
  var id = 'res_' + Date.now().toString(36);
  var now = new Date().toISOString();

  var rec = {
    id: id,
    venueId: v.id, venueName: v.name, district: v.district,
    date: _rsv.selectedDate, time: _rsv.selectedTime, guests: _rsv.selectedGuests,
    tableId: t.id, tableLabel: t.label, area: t.area,
    tokenBlocked: v.tokenCost,
    status: 'pending',
    createdAt: now
  };
  USER_RESERVATIONS.unshift(rec);

  _rsvCloseCreate();
  if (typeof _admToast === 'function') _admToast(v.tokenCost + ' token bloke edildi · Rezervasyon oluşturuldu', 'ok');
  _rsv.tab = 'active';
  _rsvRenderBody();

  // Makbuz göster
  setTimeout(function(){ _rsvOpenReceipt(rec); }, 320);
}

function _rsvOpenReceipt(rec) {
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.className = 'rsv-modal-backdrop';
  m.id = 'rsvReceipt';
  m.onclick = function(e){ if (e.target === m) m.remove(); };
  m.innerHTML = '<div class="rsv-modal rsv-modal--compact">'
    + '<div class="rsv-receipt">'
    + '<div class="rsv-receipt-icon"><iconify-icon icon="solar:check-circle-bold" style="font-size:48px;color:#22C55E"></iconify-icon></div>'
    + '<div class="rsv-receipt-title">Rezervasyon Oluşturuldu</div>'
    + '<div class="rsv-receipt-sub">Onay bekleniyor</div>'
    + '<div class="rsv-receipt-box">'
    + '<div class="rsv-review-row"><span>İşletme</span><b>' + _rsvEsc(rec.venueName) + '</b></div>'
    + '<div class="rsv-review-row"><span>Tarih · Saat</span><b>' + _rsvFmtDate(rec.date) + ' · ' + _rsvEsc(rec.time) + '</b></div>'
    + '<div class="rsv-review-row"><span>Masa</span><b>' + _rsvEsc(rec.tableLabel) + '</b></div>'
    + '<div class="rsv-review-row"><span>Token Bloke</span><b style="color:#F59E0B">' + rec.tokenBlocked + '</b></div>'
    + '</div>'
    + '<button class="rsv-btn-primary" style="width:100%" onclick="document.getElementById(\'rsvReceipt\').remove()">Tamam</button>'
    + '</div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

/* ═══════════════════════════════════════════════════════════
   P4 — Detay Drawer + Güncelleme + İptal (24h Kuralı)
   ═══════════════════════════════════════════════════════════ */

function _rsvOpenDetail(id) {
  _rsvCloseDetail();
  var r = _rsvRes(id);
  if (!r) return;
  _rsv.detailId = id;
  _rsv.editDate = r.date;
  _rsv.editTime = r.time;

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'rsvDetail';
  m.className = 'rsv-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _rsvCloseDetail(); };
  m.innerHTML = '<div class="rsv-modal"><div id="rsvDetailBody"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _rsvRenderDetail();
}

function _rsvCloseDetail() {
  var m = document.getElementById('rsvDetail');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 260);
  _rsv.detailId = null;
}

function _rsvRenderDetail() {
  var body = document.getElementById('rsvDetailBody');
  if (!body) return;
  var r = _rsvRes(_rsv.detailId);
  if (!r) return;

  var st = _rsvStatusMeta(r.status);
  var hoursLeft = _rsvHoursUntil(r.date, r.time);
  var isActive = r.status === 'confirmed' || r.status === 'pending';
  var sameDay = _rsvIsSameDay(r.date);
  var canEdit = isActive && !sameDay && hoursLeft > 0;
  var v = _rsvVenue(r.venueId);

  // Hero
  var h = '<div class="rsv-detail-head" style="background:linear-gradient(135deg,#8B5CF6,#EC4899)">'
    + '<div class="rsv-close" onclick="_rsvCloseDetail()"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:#fff"></iconify-icon></div>'
    + '<div class="rsv-hero-status" style="background:rgba(255,255,255,.22)"><iconify-icon icon="' + st.icon + '" style="font-size:13px"></iconify-icon>' + st.label + '</div>'
    + '<div class="rsv-hero-venue">' + _rsvEsc(r.venueName) + '</div>'
    + '<div class="rsv-hero-sub">' + _rsvEsc(r.district) + '</div>'
    + '<div class="rsv-hero-grid">'
    + '<div><div class="rsv-hero-lbl">Tarih</div><div class="rsv-hero-val">' + _rsvFmtDate(r.date) + '</div></div>'
    + '<div><div class="rsv-hero-lbl">Saat</div><div class="rsv-hero-val">' + _rsvEsc(r.time) + '</div></div>'
    + '<div><div class="rsv-hero-lbl">Masa</div><div class="rsv-hero-val">' + _rsvEsc(r.tableLabel) + '</div></div>'
    + '<div><div class="rsv-hero-lbl">Kişi</div><div class="rsv-hero-val">' + r.guests + '</div></div>'
    + '</div>'
    + '</div>';

  h += '<div class="rsv-detail-body">';

  // Token Bilgisi
  h += '<div class="rsv-token-box rsv-token-box--detail">'
    + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:20px;color:#F59E0B"></iconify-icon>'
    + '<div style="flex:1">'
    + '<div class="rsv-token-lbl">BLOKE TOKEN</div>'
    + '<div class="rsv-token-val">' + r.tokenBlocked + ' Token</div>'
    + '</div>'
    + (isActive ? '<div class="rsv-token-hint">' + (hoursLeft < 24 && hoursLeft > 0 ? '⚠ &lt;24sa' : '✓ İade kuralı aktif') + '</div>' : '')
    + '</div>';

  // İptal bilgisi (geçmiş kayıt)
  if (r.cancelReason) {
    h += '<div class="rsv-status-note rsv-status-note--cancel">'
      + '<iconify-icon icon="solar:info-circle-bold" style="font-size:15px;color:#EF4444"></iconify-icon>'
      + '<span>' + _rsvEsc(r.cancelReason) + '</span>'
      + '</div>';
  }

  // Güncelleme (sadece aktif ve aynı gün değilse)
  if (isActive) {
    h += '<div class="rsv-section">'
      + '<div class="rsv-section-lbl">Güncelleme</div>';

    if (sameDay) {
      h += '<div class="rsv-warn-box">'
        + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
        + '<span>Rezervasyonunuz <b>bugün</b>. Tarih/saat değişikliği yapılamaz.</span>'
        + '</div>';
    } else {
      h += _rsvEditControls(r, v);
    }
    h += '</div>';
  }

  // Aksiyonlar
  if (isActive) {
    h += '<div class="rsv-actions">'
      + '<button class="rsv-action-btn rsv-action-btn--danger" onclick="_rsvAskCancel(\'' + r.id + '\')">'
      + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:16px"></iconify-icon>İptal Et</button>'
      + '</div>';
  }

  h += '<div class="rsv-info-note">'
    + '<iconify-icon icon="solar:info-circle-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
    + '<span>Rezervasyon ID: ' + _rsvEsc(r.id) + ' · Oluşturma: ' + _rsvFmtDate(r.createdAt.slice(0,10)) + '</span>'
    + '</div>';

  h += '</div>';
  body.innerHTML = h;
}

function _rsvEditControls(r, v) {
  var months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  var today = new Date();
  today.setHours(0,0,0,0);
  var h = '<div class="rsv-edit-lbl">Tarih</div><div class="rsv-date-grid rsv-date-grid--compact">';
  for (var i = 0; i < 10; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() + i);
    var iso = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    var closed = v && v.closedDays.indexOf(d.getDay()) > -1;
    var full = v && v.fullDates.indexOf(iso) > -1;
    var disabled = closed || full;
    var active = _rsv.editDate === iso;
    h += '<div class="rsv-date-cell' + (disabled ? ' disabled' : '') + (active ? ' active' : '') + '"'
      + (disabled ? '' : ' onclick="_rsv.editDate=\'' + iso + '\';_rsvRenderDetail()"') + '>'
      + '<div class="rsv-date-dow">' + days[d.getDay()] + '</div>'
      + '<div class="rsv-date-num">' + d.getDate() + '</div>'
      + '<div class="rsv-date-mon">' + months[d.getMonth()] + '</div>'
      + (closed ? '<div class="rsv-date-tag">Kapalı</div>' : full ? '<div class="rsv-date-tag rsv-date-tag--full">Dolu</div>' : '')
      + '</div>';
  }
  h += '</div>';

  var times = ['12:00','13:00','14:00','18:00','19:00','19:30','20:00','20:30','21:00','21:30','22:00'];
  h += '<div class="rsv-edit-lbl">Saat</div><div class="rsv-time-grid">';
  for (var k = 0; k < times.length; k++) {
    var t = times[k];
    h += '<div class="rsv-time-cell' + (_rsv.editTime === t ? ' active' : '') + '" onclick="_rsv.editTime=\'' + t + '\';_rsvRenderDetail()">' + t + '</div>';
  }
  h += '</div>';

  var dirty = (_rsv.editDate !== r.date) || (_rsv.editTime !== r.time);
  h += '<button class="rsv-btn-primary rsv-btn-wide' + (dirty ? '' : ' disabled') + '"'
    + (dirty ? ' onclick="_rsvSaveEdit(\'' + r.id + '\')"' : '') + '>'
    + '<iconify-icon icon="solar:refresh-circle-bold" style="font-size:15px"></iconify-icon>Değişikliği Kaydet</button>';
  return h;
}

function _rsvSaveEdit(id) {
  var r = _rsvRes(id);
  if (!r) return;
  r.date = _rsv.editDate;
  r.time = _rsv.editTime;
  if (typeof _admToast === 'function') _admToast('Rezervasyon güncellendi', 'ok');
  _rsvRenderDetail();
  _rsvRenderBody();
}

/* ═══ İptal — 24h Kuralı Pop-up ═══ */
function _rsvAskCancel(id) {
  var r = _rsvRes(id);
  if (!r) return;
  var hoursLeft = _rsvHoursUntil(r.date, r.time);
  var within24 = hoursLeft < 24;

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'rsvConfirm';
  m.className = 'rsv-confirm-backdrop';
  m.onclick = function(e){ if (e.target === m) _rsvCloseConfirm(); };

  var msg, actionLbl, tone;
  if (within24) {
    msg = 'Rezervasyonunuza <b>24 saatten az süre</b> kaldığı için iptal işleminde bloke edilen <b style="color:#F59E0B">' + r.tokenBlocked + ' token</b> işletmeye aktarılacaktır. Onaylıyor musunuz?';
    actionLbl = 'Onayla & İptal Et';
    tone = 'danger';
  } else {
    msg = '24 saatten fazla süre var. Bloke edilen <b style="color:#22C55E">' + r.tokenBlocked + ' token</b> hesabınıza iade edilecektir. Onaylıyor musunuz?';
    actionLbl = 'İptal Et & İade Al';
    tone = 'safe';
  }

  m.innerHTML = '<div class="rsv-confirm">'
    + '<div class="rsv-confirm-icon rsv-confirm-icon--' + tone + '">'
    + '<iconify-icon icon="' + (tone === 'danger' ? 'solar:danger-triangle-bold' : 'solar:shield-check-bold') + '" style="font-size:28px"></iconify-icon>'
    + '</div>'
    + '<div class="rsv-confirm-title">Rezervasyonu İptal Et</div>'
    + '<div class="rsv-confirm-msg">' + msg + '</div>'
    + '<div class="rsv-confirm-meta">'
    + _rsvEsc(r.venueName) + ' · ' + _rsvFmtDate(r.date) + ' · ' + _rsvEsc(r.time)
    + '</div>'
    + '<div class="rsv-confirm-btns">'
    + '<button class="rsv-btn-ghost" onclick="_rsvCloseConfirm()">Vazgeç</button>'
    + '<button class="rsv-btn-danger" onclick="_rsvDoCancel(\'' + r.id + '\')">' + actionLbl + '</button>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _rsvCloseConfirm() {
  var m = document.getElementById('rsvConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

function _rsvDoCancel(id) {
  var r = _rsvRes(id);
  if (!r) return;
  var within24 = _rsvHoursUntil(r.date, r.time) < 24;
  r.status = 'cancelled';
  r.cancelReason = within24
    ? 'Kullanıcı iptali · <24sa · ' + r.tokenBlocked + ' token işletmeye aktarıldı'
    : 'Kullanıcı iptali · >24sa · ' + r.tokenBlocked + ' token iade edildi';

  _rsvCloseConfirm();
  if (typeof _admToast === 'function') {
    _admToast(within24 ? 'İptal edildi · Token işletmeye aktarıldı' : 'İptal edildi · ' + r.tokenBlocked + ' token iade edildi', within24 ? 'err' : 'ok');
  }
  _rsvCloseDetail();
  _rsvRenderBody();
}

/* ═══ Styles ═══ */
function _rsvInjectStyles() {
  if (document.getElementById('rsvStyles')) return;
  var s = document.createElement('style');
  s.id = 'rsvStyles';
  s.textContent = [
    '.rsv-overlay{color:var(--text-primary)}',
    '.rsv-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);z-index:5}',
    '.rsv-back{width:34px;height:34px;border-radius:10px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);transition:transform .15s}',
    '.rsv-back:active{transform:scale(.94)}',
    '.rsv-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.rsv-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.rsv-create-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 11px;border:none;background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(139,92,246,.3)}',
    '.rsv-create-btn:active{transform:scale(.95)}',
    '/* Tabs */',
    '.rsv-tabs{display:flex;gap:8px;background:var(--bg-phone-secondary);padding:4px;border-radius:12px;margin-bottom:14px}',
    '.rsv-tab{flex:1;padding:9px 10px;border:none;background:transparent;color:var(--text-muted);border-radius:9px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .18s}',
    '.rsv-tab.active{background:var(--bg-phone);color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.08)}',
    '.rsv-tab-count{font-size:10px;background:var(--bg-phone-secondary);padding:1px 6px;border-radius:999px;color:var(--text-muted);font-weight:700}',
    '.rsv-tab.active .rsv-tab-count{background:#8B5CF615;color:#8B5CF6}',
    '/* List */',
    '.rsv-list{display:flex;flex-direction:column;gap:10px}',
    '.rsv-card{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;cursor:pointer;transition:transform .15s,box-shadow .18s}',
    '.rsv-card:active{transform:scale(.985)}',
    '.rsv-card-left{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.rsv-card-head{display:flex;align-items:center;gap:8px;justify-content:space-between}',
    '.rsv-card-venue{font-size:13.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.rsv-pill{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;flex-shrink:0}',
    '.rsv-card-meta{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-muted);margin-top:4px;flex-wrap:wrap}',
    '.rsv-card-meta iconify-icon{vertical-align:-1px}',
    '.rsv-card-sub{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:10.5px;color:var(--text-muted);margin-top:3px}',
    '.rsv-urgent{display:inline-flex;align-items:center;gap:3px;color:#EF4444;font-weight:700;background:rgba(239,68,68,.1);padding:1px 6px;border-radius:6px}',
    '/* Empty */',
    '.rsv-empty{padding:40px 20px;text-align:center;color:var(--text-muted);display:flex;flex-direction:column;align-items:center;gap:10px}',
    '.rsv-empty-sub{font-size:11px;opacity:.75}',
    '.rsv-empty-cta{margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border:none;background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer}',
    '.rsv-empty-small{padding:28px 12px;text-align:center;color:var(--text-muted);font-size:12px}',
    '/* Modal backdrop */',
    '.rsv-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:94;opacity:0;transition:opacity .24s ease}',
    '.rsv-modal-backdrop.open{opacity:1}',
    '.rsv-modal{width:100%;max-width:100%;background:var(--bg-phone);border-radius:20px 20px 0 0;overflow:hidden;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1);max-height:94vh;display:flex;flex-direction:column}',
    '.rsv-modal-backdrop.open .rsv-modal{transform:translateY(0)}',
    '.rsv-modal--compact{max-height:80vh}',
    '.rsv-modal > div{overflow-y:auto;flex:1}',
    '/* Create flow — step head */',
    '.rsv-step-head{position:sticky;top:0;display:flex;align-items:center;gap:10px;padding:14px 16px 10px;background:var(--bg-phone);z-index:3}',
    '.rsv-step-close{width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}',
    '.rsv-step-title{font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.rsv-step-sub{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '.rsv-step-dots{display:flex;gap:5px;padding:0 16px 10px;align-items:center}',
    '.rsv-step-dot{flex:1;height:4px;border-radius:999px;background:var(--bg-phone-secondary);transition:background .25s}',
    '.rsv-step-dot.done{background:#8B5CF6}',
    '.rsv-step-dot.active{background:linear-gradient(90deg,#8B5CF6,#EC4899)}',
    '.rsv-step-body{padding:4px 16px 18px;display:flex;flex-direction:column;gap:12px}',
    '.rsv-step-footer{display:flex;gap:8px;padding:10px 0 4px;position:sticky;bottom:0;background:var(--bg-phone);margin-top:8px}',
    '.rsv-btn-primary{flex:1;padding:12px;border:none;background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s}',
    '.rsv-btn-primary:active{transform:scale(.97)}',
    '.rsv-btn-primary.disabled{opacity:.4;cursor:not-allowed;transform:none}',
    '.rsv-btn-wide{width:100%;margin-top:10px}',
    '.rsv-btn-ghost{padding:12px 18px;border:1px solid var(--border-soft);background:transparent;color:var(--text-primary);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer}',
    '.rsv-btn-danger{flex:1;padding:12px;border:none;background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer}',
    '/* Search */',
    '.rsv-search{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-phone-secondary);border-radius:12px;margin-bottom:6px}',
    '.rsv-search input{flex:1;border:none;background:transparent;color:var(--text-primary);font-size:13px;outline:none}',
    '/* Venue list */',
    '.rsv-venue-list{display:flex;flex-direction:column;gap:8px;max-height:440px;overflow-y:auto}',
    '.rsv-venue-row{display:flex;align-items:center;gap:11px;padding:10px;background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:13px;cursor:pointer;transition:transform .15s}',
    '.rsv-venue-row:active{transform:scale(.98)}',
    '.rsv-venue-img{width:48px;height:48px;border-radius:12px;background-size:cover;background-position:center;flex-shrink:0;background-color:var(--bg-phone-secondary)}',
    '.rsv-venue-img--sm{width:40px;height:40px;border-radius:10px}',
    '.rsv-venue-name{font-size:13.5px;font-weight:700;color:var(--text-primary)}',
    '.rsv-venue-district{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '.rsv-venue-chips{display:flex;gap:5px;margin-top:5px;flex-wrap:wrap}',
    '.rsv-chip-mini{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:var(--text-muted);background:var(--bg-phone-secondary);padding:2px 7px;border-radius:6px;font-weight:600}',
    '.rsv-sel-venue{display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-phone-secondary);border-radius:12px;margin-bottom:6px}',
    '.rsv-sel-name{font-size:13px;font-weight:700;color:var(--text-primary)}',
    '.rsv-sel-dist{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '/* Date grid */',
    '.rsv-field-lbl,.rsv-edit-lbl{font-size:12px;font-weight:700;color:var(--text-primary);margin-top:6px;margin-bottom:2px;display:flex;align-items:center;gap:6px}',
    '.rsv-date-grid{display:flex;gap:7px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}',
    '.rsv-date-grid::-webkit-scrollbar{display:none}',
    '.rsv-date-grid--compact{gap:5px}',
    '.rsv-date-cell{min-width:58px;padding:8px 6px;background:var(--bg-phone-secondary);border:1.5px solid transparent;border-radius:11px;text-align:center;cursor:pointer;flex-shrink:0;position:relative;transition:border-color .18s,transform .15s}',
    '.rsv-date-cell:active{transform:scale(.94)}',
    '.rsv-date-cell.active{border-color:#8B5CF6;background:#8B5CF610}',
    '.rsv-date-cell.disabled{opacity:.45;cursor:not-allowed}',
    '.rsv-date-dow{font-size:10px;color:var(--text-muted);font-weight:600;margin-bottom:2px}',
    '.rsv-date-num{font-size:17px;font-weight:700;color:var(--text-primary);line-height:1}',
    '.rsv-date-mon{font-size:10px;color:var(--text-muted);margin-top:2px}',
    '.rsv-date-tag{font-size:8.5px;font-weight:700;color:#EF4444;background:rgba(239,68,68,.12);padding:1px 4px;border-radius:4px;margin-top:3px}',
    '.rsv-date-tag--full{color:#F59E0B;background:rgba(245,158,11,.12)}',
    '/* Time grid */',
    '.rsv-time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}',
    '.rsv-time-cell{padding:9px 6px;background:var(--bg-phone-secondary);border:1.5px solid transparent;border-radius:10px;text-align:center;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--text-primary);transition:all .18s}',
    '.rsv-time-cell:active{transform:scale(.94)}',
    '.rsv-time-cell.active{border-color:#8B5CF6;background:#8B5CF615;color:#8B5CF6}',
    '/* Guests */',
    '.rsv-guests{display:flex;align-items:center;gap:14px;background:var(--bg-phone-secondary);border-radius:12px;padding:6px;justify-content:center}',
    '.rsv-g-btn{width:36px;height:36px;border:none;background:var(--bg-phone);border-radius:10px;font-size:20px;font-weight:700;color:#8B5CF6;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.06)}',
    '.rsv-g-val{flex:1;text-align:center;font-size:14px;font-weight:700;color:var(--text-primary)}',
    '/* Map */',
    '.rsv-map-legend{display:flex;gap:10px;padding:9px 12px;background:var(--bg-phone-secondary);border-radius:10px;font-size:11px;color:var(--text-muted);align-items:center;justify-content:center;flex-wrap:wrap}',
    '.rsv-map-legend span{display:inline-flex;align-items:center;gap:5px}',
    '.rsv-map-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}',
    '.rsv-map-area{margin-top:10px}',
    '.rsv-map-area-lbl{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;padding:6px 0 8px 2px;display:flex;align-items:center;gap:6px}',
    '.rsv-map-area-lbl::after{content:"";flex:1;height:1px;background:var(--border-soft);margin-left:6px}',
    '.rsv-map-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
    '.rsv-table{padding:14px 6px;border-radius:12px;text-align:center;cursor:pointer;transition:transform .15s,box-shadow .2s;position:relative;min-height:74px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:2px solid transparent}',
    '.rsv-table:active{transform:scale(.95)}',
    '.rsv-table--available{background:rgba(34,197,94,.12);color:#15803D;border-color:rgba(34,197,94,.3)}',
    '.rsv-table--occupied{background:rgba(239,68,68,.1);color:#991B1B;cursor:not-allowed;opacity:.7;border-color:rgba(239,68,68,.25)}',
    '.rsv-table--selected{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border-color:#fff;box-shadow:0 4px 14px rgba(139,92,246,.4)}',
    '.rsv-table--too-small{opacity:.55}',
    '.rsv-table-num{font-size:13px;font-weight:800}',
    '.rsv-table-cap{font-size:10.5px;display:inline-flex;align-items:center;gap:3px;font-weight:700}',
    '.rsv-table-warn{font-size:8.5px;font-weight:700;color:#F59E0B;background:rgba(245,158,11,.15);padding:1px 5px;border-radius:4px}',
    '/* Review */',
    '.rsv-review-card{background:var(--bg-phone-secondary);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}',
    '.rsv-review-row{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;gap:12px}',
    '.rsv-review-row span{color:var(--text-muted);font-weight:600}',
    '.rsv-review-row b{color:var(--text-primary);font-weight:700}',
    '/* Token box */',
    '.rsv-token-box{background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(236,72,153,.08));border:1px solid rgba(245,158,11,.25);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:6px}',
    '.rsv-token-box--detail{flex-direction:row;align-items:center;gap:10px;padding:12px 13px}',
    '.rsv-token-head{display:flex;align-items:center;gap:10px}',
    '.rsv-token-lbl{font-size:9.5px;font-weight:700;letter-spacing:1px;color:var(--text-muted)}',
    '.rsv-token-val{font-size:18px;font-weight:800;color:#F59E0B;margin-top:2px}',
    '.rsv-token-desc{font-size:11.5px;color:var(--text-primary);line-height:1.55;margin-top:4px}',
    '.rsv-token-hint{font-size:10px;font-weight:700;color:var(--text-muted);background:var(--bg-phone);padding:4px 8px;border-radius:8px}',
    '/* Receipt */',
    '.rsv-receipt{padding:24px 18px;text-align:center}',
    '.rsv-receipt-icon{margin-bottom:6px;animation:rsvPop .4s ease}',
    '@keyframes rsvPop{0%{transform:scale(0)}70%{transform:scale(1.18)}100%{transform:scale(1)}}',
    '.rsv-receipt-title{font-size:18px;font-weight:800;color:var(--text-primary);margin-bottom:3px}',
    '.rsv-receipt-sub{font-size:12px;color:var(--text-muted);margin-bottom:16px}',
    '.rsv-receipt-box{background:var(--bg-phone-secondary);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px;text-align:left;margin-bottom:16px}',
    '/* Detail */',
    '.rsv-detail-head{position:relative;padding:24px 18px 18px;color:#fff}',
    '.rsv-close{position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.25);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.rsv-hero-status{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;margin-bottom:6px}',
    '.rsv-hero-venue{font-size:20px;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.18)}',
    '.rsv-hero-sub{font-size:12px;opacity:.85;margin-top:2px}',
    '.rsv-hero-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}',
    '.rsv-hero-lbl{font-size:9.5px;font-weight:700;letter-spacing:.5px;opacity:.82}',
    '.rsv-hero-val{font-size:13.5px;font-weight:800;margin-top:2px}',
    '.rsv-detail-body{padding:14px 16px 24px;display:flex;flex-direction:column;gap:12px}',
    '.rsv-section{display:flex;flex-direction:column;gap:8px}',
    '.rsv-section-lbl{font-size:12px;font-weight:700;color:var(--text-primary);padding-left:2px}',
    '.rsv-warn-box{display:flex;align-items:flex-start;gap:8px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);border-radius:12px;padding:11px 13px;color:#92400E;font-size:12px;line-height:1.5}',
    '.rsv-warn-box b{color:#92400E}',
    '.rsv-status-note{display:flex;align-items:flex-start;gap:8px;padding:11px 13px;border-radius:12px;font-size:12px;line-height:1.45}',
    '.rsv-status-note--cancel{background:rgba(239,68,68,.08);color:#991B1B;border:1px solid rgba(239,68,68,.2)}',
    '.rsv-actions{display:flex;gap:8px}',
    '.rsv-action-btn{flex:1;padding:12px;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s}',
    '.rsv-action-btn:active{transform:scale(.97)}',
    '.rsv-action-btn--danger{background:rgba(239,68,68,.12);color:#DC2626}',
    '.rsv-info-note{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--text-muted);padding:6px 2px;line-height:1.4}',
    '/* Confirm popup */',
    '.rsv-confirm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:96;opacity:0;transition:opacity .22s}',
    '.rsv-confirm-backdrop.open{opacity:1}',
    '.rsv-confirm{width:88%;max-width:360px;background:var(--bg-phone);border-radius:18px;padding:22px 20px 18px;text-align:center;transform:scale(.9);transition:transform .25s cubic-bezier(.2,.9,.25,1)}',
    '.rsv-confirm-backdrop.open .rsv-confirm{transform:scale(1)}',
    '.rsv-confirm-icon{width:64px;height:64px;border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center}',
    '.rsv-confirm-icon--danger{background:rgba(239,68,68,.12);color:#EF4444}',
    '.rsv-confirm-icon--safe{background:rgba(34,197,94,.12);color:#22C55E}',
    '.rsv-confirm-title{font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:6px}',
    '.rsv-confirm-msg{font-size:12.5px;color:var(--text-primary);line-height:1.5;margin-bottom:10px;padding:0 4px}',
    '.rsv-confirm-meta{font-size:11px;color:var(--text-muted);background:var(--bg-phone-secondary);padding:8px 10px;border-radius:10px;margin-bottom:14px}',
    '.rsv-confirm-btns{display:flex;gap:8px}',
    '.rsv-confirm-btns .rsv-btn-ghost{flex:1;padding:11px;text-align:center}'
  ].join('\n');
  document.head.appendChild(s);
}

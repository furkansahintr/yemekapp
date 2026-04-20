/* ═══════════════════════════════════════════════════════════
   BIZ WORKING HOURS — Şube Çalışma Saatleri Editörü
   Haftalık grid + mola + günlük kapalı toggle + acil kapat
   + hızlı kopyalama + özel günler + kaydet ile rezervasyon etki uyarısı
   ═══════════════════════════════════════════════════════════ */

var _wh = {
  branchId: null,
  draft: null,          // { days: {day: {open,close,closed,breaks}}, specialDays: [], temporarilyClosedUntil }
  DAY_NAMES: ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar']
};

function openBizWorkingHours(branchId) {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('branches')) return;
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === branchId; });
  if (!branch) return;
  _wh.branchId = branchId;

  // Draft oluştur — ilk açılışta branch.workingHours'u normalize et
  var days = {};
  _wh.DAY_NAMES.forEach(function(dn){
    var src = branch.workingHours && branch.workingHours[dn];
    if (!src) {
      days[dn] = { open: '09:00', close: '22:00', closed: false, breaks: [] };
      return;
    }
    if (src.open === 'Kapalı' || src.closed) {
      days[dn] = { open: src.open === 'Kapalı' ? '09:00' : (src.open || '09:00'), close: src.close === 'Kapalı' ? '22:00' : (src.close || '22:00'), closed: true, breaks: src.breaks ? src.breaks.slice() : [] };
    } else {
      days[dn] = { open: src.open, close: src.close, closed: false, breaks: src.breaks ? src.breaks.slice() : [] };
    }
  });

  _wh.draft = {
    days: days,
    specialDays: branch.specialDays ? JSON.parse(JSON.stringify(branch.specialDays)) : [],
    temporarilyClosedUntil: branch.temporarilyClosedUntil || null
  };

  _whInjectStyles();
  _whRender();
}

function _whBranchName() {
  var b = BIZ_BRANCHES.find(function(x){ return x.id === _wh.branchId; });
  return b ? b.name : 'Şube';
}

function _whRender() {
  var overlay = createBizOverlay('bizWorkingHoursOverlay', 'Çalışma Saatleri · ' + _whBranchName(), _whBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _whRerender() {
  var o = document.getElementById('bizWorkingHoursOverlay');
  if (!o) return;
  var content = o.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _whBody();
}

function _whBody() {
  var tempClosed = _wh.draft.temporarilyClosedUntil && new Date(_wh.draft.temporarilyClosedUntil) > new Date();

  var emergency = '<div class="wh-emergency' + (tempClosed ? ' on' : '') + '">'
    + '<div class="wh-emergency-ico"><iconify-icon icon="solar:bolt-circle-bold" style="font-size:26px"></iconify-icon></div>'
    + '<div class="wh-emergency-text">'
    +   '<div class="wh-emergency-title">' + (tempClosed ? 'Şube şu an kapalı' : 'Şubeyi Şu An Geçici Olarak Kapat') + '</div>'
    +   '<div class="wh-emergency-sub">' + (tempClosed ? 'Yeniden açılış: ' + _whFormatDateTime(_wh.draft.temporarilyClosedUntil) : 'Acil durumlarda sipariş ve rezervasyonu geçici durdur') + '</div>'
    + '</div>'
    + '<button class="wh-emergency-btn" onclick="_whToggleEmergency()">' + (tempClosed ? 'Açık\'a Al' : 'Kapat') + '</button>'
    + '</div>';

  // Hızlı eylemler
  var quick = '<div class="wh-quick">'
    + '<button class="wh-quick-btn" onclick="_whCopyWeekdays()"><iconify-icon icon="solar:copy-bold" style="font-size:14px"></iconify-icon>Hafta içini aynı yap</button>'
    + '<button class="wh-quick-btn" onclick="_whCopyAll()"><iconify-icon icon="solar:copy-bold" style="font-size:14px"></iconify-icon>Tüm haftayı aynı yap</button>'
    + '</div>';

  // Günler
  var grid = '<div class="wh-grid">';
  _wh.DAY_NAMES.forEach(function(dn){
    grid += _whDayRow(dn, _wh.draft.days[dn]);
  });
  grid += '</div>';

  // Özel günler
  var specials = '<div class="wh-card">'
    + '<div class="wh-section-lbl">Özel Günler / Resmi Tatiller</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-muted);margin-bottom:10px">Belirli tarihlerde kapalı ya da özel saatlerle çalışacağın günleri şimdiden işaretle.</div>';

  if (_wh.draft.specialDays.length) {
    _wh.draft.specialDays.forEach(function(sd, idx){
      specials += '<div class="wh-special-row">'
        + '<iconify-icon icon="solar:calendar-date-bold" style="font-size:18px;color:' + (sd.closed ? '#EF4444' : '#F59E0B') + ';flex-shrink:0"></iconify-icon>'
        + '<div style="flex:1;min-width:0">'
        +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + (sd.label || '—') + '</div>'
        +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _whFormatDate(sd.date) + (sd.closed ? ' · Kapalı' : ' · Açık (özel saat)') + '</div>'
        + '</div>'
        + '<button class="wh-special-del" onclick="_whRemoveSpecial(' + idx + ')"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:15px"></iconify-icon></button>'
        + '</div>';
    });
  } else {
    specials += '<div style="padding:14px;text-align:center;color:var(--text-muted);font:var(--fw-regular) 12px/1.4 var(--font);background:var(--bg-btn);border-radius:var(--r-md)">Henüz özel gün eklenmedi</div>';
  }

  specials += '<button class="wh-add-special" onclick="_whOpenSpecialDialog()"><iconify-icon icon="solar:add-circle-linear" style="font-size:16px"></iconify-icon>Özel gün ekle</button>'
    + '</div>';

  // Yasal bilgi
  var legal = '<div class="wh-legal">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:15px;color:#3B82F6;flex-shrink:0;margin-top:1px"></iconify-icon>'
    + '<span>Rezervasyon ve sipariş saatleri burada belirlenen saatlerle senkronizedir. Kapalı olarak işaretlediğin günlerde kullanıcı tarafındaki sipariş & rezervasyon butonları otomatik devre dışı kalır.</span>'
    + '</div>';

  // Save
  var hasUnsaved = !_whIsSameAsSaved();
  var saveBtn = '<button class="wh-save" onclick="_whSave()"' + (hasUnsaved ? '' : ' disabled') + '>'
    + '<iconify-icon icon="solar:diskette-bold" style="font-size:18px"></iconify-icon>Çalışma Saatlerini Kaydet'
    + '</button>';

  return '<div class="wh-wrap">' + emergency + quick + grid + specials + legal + saveBtn + '</div>';
}

function _whDayRow(dn, d) {
  var closed = d.closed;
  var rowClass = 'wh-day' + (closed ? ' wh-day--closed' : '');
  return '<div class="' + rowClass + '">'
    + '<div class="wh-day-head">'
    +   '<span class="wh-day-name">' + dn + '</span>'
    +   '<label class="wh-day-toggle">'
    +     '<span class="wh-day-toggle-lbl">' + (closed ? 'Kapalı' : 'Açık') + '</span>'
    +     '<span class="wh-switch' + (closed ? '' : ' on') + '" onclick="_whToggleClosed(\'' + dn + '\')"><span class="wh-switch-dot"></span></span>'
    +   '</label>'
    + '</div>'
    + (closed ? '' : _whDayBody(dn, d))
    + '</div>';
}

function _whDayBody(dn, d) {
  var body = '<div class="wh-day-body">';
  body += '<div class="wh-time-row">'
    +    '<span class="wh-time-lbl">Açılış</span>'
    +    '<input type="time" class="wh-time-input" value="' + d.open + '" onchange="_whSetTime(\'' + dn + '\', \'open\', this.value)">'
    +    '<span class="wh-time-sep">—</span>'
    +    '<span class="wh-time-lbl">Kapanış</span>'
    +    '<input type="time" class="wh-time-input" value="' + d.close + '" onchange="_whSetTime(\'' + dn + '\', \'close\', this.value)">'
    + '</div>';

  // Breaks
  if (d.breaks && d.breaks.length) {
    body += '<div class="wh-breaks">';
    d.breaks.forEach(function(b, idx){
      body += '<div class="wh-break-row">'
        +  '<iconify-icon icon="solar:cup-paper-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
        +  '<span class="wh-break-lbl">Mola</span>'
        +  '<input type="time" class="wh-time-input wh-time-input--sm" value="' + b.start + '" onchange="_whSetBreak(\'' + dn + '\', ' + idx + ', \'start\', this.value)">'
        +  '<span class="wh-time-sep">—</span>'
        +  '<input type="time" class="wh-time-input wh-time-input--sm" value="' + b.end + '" onchange="_whSetBreak(\'' + dn + '\', ' + idx + ', \'end\', this.value)">'
        +  '<button class="wh-break-del" onclick="_whRemoveBreak(\'' + dn + '\', ' + idx + ')"><iconify-icon icon="solar:close-circle-bold" style="font-size:14px"></iconify-icon></button>'
        +  '</div>';
    });
    body += '</div>';
  }

  body += '<button class="wh-add-break" onclick="_whAddBreak(\'' + dn + '\')"><iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon>Mola / ara saati ekle</button>';
  body += '</div>';
  return body;
}

/* ─ Mutators ─ */
function _whToggleClosed(dn) {
  _wh.draft.days[dn].closed = !_wh.draft.days[dn].closed;
  _whRerender();
}
function _whSetTime(dn, which, val) {
  _wh.draft.days[dn][which] = val;
}
function _whAddBreak(dn) {
  var d = _wh.draft.days[dn];
  d.breaks = d.breaks || [];
  if (d.breaks.length >= 2) { if (typeof _admToast === 'function') _admToast('En fazla 2 mola ekleyebilirsin', 'err'); return; }
  d.breaks.push({ start: '12:00', end: '13:00' });
  _whRerender();
}
function _whSetBreak(dn, idx, which, val) {
  _wh.draft.days[dn].breaks[idx][which] = val;
}
function _whRemoveBreak(dn, idx) {
  _wh.draft.days[dn].breaks.splice(idx, 1);
  _whRerender();
}

function _whCopyWeekdays() {
  var source = _wh.draft.days['Pazartesi'];
  ['Salı','Çarşamba','Perşembe','Cuma'].forEach(function(dn){
    _wh.draft.days[dn] = JSON.parse(JSON.stringify(source));
  });
  if (typeof _admToast === 'function') _admToast('Hafta içi günler Pazartesi ile eşleştirildi', 'ok');
  _whRerender();
}
function _whCopyAll() {
  var source = _wh.draft.days['Pazartesi'];
  _wh.DAY_NAMES.forEach(function(dn){
    if (dn !== 'Pazartesi') _wh.draft.days[dn] = JSON.parse(JSON.stringify(source));
  });
  if (typeof _admToast === 'function') _admToast('Tüm hafta Pazartesi ile eşleştirildi', 'ok');
  _whRerender();
}

/* ─ Emergency close ─ */
function _whToggleEmergency() {
  var cur = _wh.draft.temporarilyClosedUntil;
  var isClosed = cur && new Date(cur) > new Date();
  if (isClosed) {
    _wh.draft.temporarilyClosedUntil = null;
    if (typeof _admToast === 'function') _admToast('Şube tekrar açık — müşteriye bildirim gönderildi', 'ok');
    _whRerender();
    return;
  }
  // Süre seçimi sheet
  _whOpenEmergencyDialog();
}

function _whOpenEmergencyDialog() {
  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'whEmergencyDialog';
  m.className = 'wh-dialog';
  m.onclick = function(e){ if (e.target === m) _whCloseDialog('whEmergencyDialog'); };
  var options = [
    { m: 30, lbl: '30 dakika' },
    { m: 60, lbl: '1 saat' },
    { m: 120, lbl: '2 saat' },
    { m: 240, lbl: '4 saat' },
    { m: 480, lbl: 'Vardiya sonuna kadar (8 saat)' }
  ];
  m.innerHTML = '<div class="wh-dialog-box">'
    + '<div class="wh-dialog-head"><iconify-icon icon="solar:bolt-circle-bold" style="font-size:24px;color:#EF4444"></iconify-icon><div class="wh-dialog-title">Ne kadar süre kapalı kalacak?</div></div>'
    + '<div class="wh-dialog-list">'
    +   options.map(function(o){
          return '<button class="wh-dialog-opt" onclick="_whSetEmergency(' + o.m + ')">' + o.lbl + '</button>';
        }).join('')
    + '</div>'
    + '<button class="wh-dialog-cancel" onclick="_whCloseDialog(\'whEmergencyDialog\')">Vazgeç</button>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _whSetEmergency(minutes) {
  var until = new Date(Date.now() + minutes * 60000).toISOString();
  _wh.draft.temporarilyClosedUntil = until;
  _whCloseDialog('whEmergencyDialog');
  if (typeof _admToast === 'function') _admToast('Şube ' + minutes + ' dk boyunca kapatıldı', 'ok');
  _whRerender();
}

/* ─ Special days ─ */
function _whOpenSpecialDialog() {
  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'whSpecialDialog';
  m.className = 'wh-dialog';
  m.onclick = function(e){ if (e.target === m) _whCloseDialog('whSpecialDialog'); };
  var today = new Date().toISOString().slice(0, 10);
  m.innerHTML = '<div class="wh-dialog-box">'
    + '<div class="wh-dialog-head"><iconify-icon icon="solar:calendar-date-bold" style="font-size:24px;color:#F59E0B"></iconify-icon><div class="wh-dialog-title">Özel gün ekle</div></div>'
    + '<div style="display:flex;flex-direction:column;gap:10px">'
    +   '<input id="whSpDate" type="date" min="' + today + '" value="' + today + '" class="wh-time-input" style="width:100%">'
    +   '<input id="whSpLabel" type="text" placeholder="Örn: Bayramın 1. Günü" class="wh-time-input" style="width:100%;padding:10px 12px">'
    +   '<label style="display:flex;align-items:center;gap:8px;font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary);padding:8px 0"><input id="whSpClosed" type="checkbox" checked style="width:18px;height:18px">Bu gün kapalı</label>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:10px">'
    +   '<button class="wh-dialog-cancel" style="flex:1" onclick="_whCloseDialog(\'whSpecialDialog\')">Vazgeç</button>'
    +   '<button class="wh-save" style="flex:1;box-shadow:none" onclick="_whAddSpecial()">Ekle</button>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _whAddSpecial() {
  var date = document.getElementById('whSpDate').value;
  var label = document.getElementById('whSpLabel').value.trim() || 'Özel Gün';
  var closed = document.getElementById('whSpClosed').checked;
  if (!date) return;
  _wh.draft.specialDays.push({ date: date, label: label, closed: closed });
  _wh.draft.specialDays.sort(function(a,b){ return a.date.localeCompare(b.date); });
  _whCloseDialog('whSpecialDialog');
  _whRerender();
}
function _whRemoveSpecial(idx) {
  _wh.draft.specialDays.splice(idx, 1);
  _whRerender();
}
function _whCloseDialog(id) {
  var m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
}

/* ─ Same-as-saved check ─ */
function _whIsSameAsSaved() {
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === _wh.branchId; });
  if (!branch) return true;
  var d = _wh.draft;
  var stored = { days: {}, specialDays: branch.specialDays || [], temporarilyClosedUntil: branch.temporarilyClosedUntil || null };
  _wh.DAY_NAMES.forEach(function(dn){
    var src = branch.workingHours && branch.workingHours[dn];
    if (!src) { stored.days[dn] = { open:'09:00', close:'22:00', closed:false, breaks:[] }; return; }
    stored.days[dn] = {
      open: src.open === 'Kapalı' ? '09:00' : src.open,
      close: src.close === 'Kapalı' ? '22:00' : src.close,
      closed: !!src.closed || src.open === 'Kapalı',
      breaks: src.breaks || []
    };
  });
  return JSON.stringify(stored) === JSON.stringify({ days: d.days, specialDays: d.specialDays, temporarilyClosedUntil: d.temporarilyClosedUntil });
}

/* ─ Affected reservations scan ─ */
function _whAffectedReservations() {
  if (typeof BIZ_RESERVATIONS === 'undefined') return [];
  var now = new Date();
  return BIZ_RESERVATIONS.filter(function(r){
    if (r.branchId !== _wh.branchId) return false;
    if (r.status === 'cancelled') return false;
    var d = new Date(r.reservedAt);
    if (d < now) return false;
    // Map gün: 0=Pazar ... Türkçe isim
    var dayIdx = (d.getDay() + 6) % 7;  // 0=Pazartesi
    var dn = _wh.DAY_NAMES[dayIdx];
    var day = _wh.draft.days[dn];
    var hh = d.getHours(), mm = d.getMinutes();
    var minsOfDay = hh * 60 + mm;
    if (day.closed) return true;
    var openM = _whHmToMin(day.open);
    var closeM = _whHmToMin(day.close);
    if (minsOfDay < openM || minsOfDay >= closeM) return true;
    // Mola içinde mi?
    for (var i = 0; i < (day.breaks || []).length; i++) {
      var b = day.breaks[i];
      var bs = _whHmToMin(b.start), be = _whHmToMin(b.end);
      if (minsOfDay >= bs && minsOfDay < be) return true;
    }
    // Özel günler?
    var iso = d.toISOString().slice(0, 10);
    for (var j = 0; j < _wh.draft.specialDays.length; j++) {
      if (_wh.draft.specialDays[j].date === iso && _wh.draft.specialDays[j].closed) return true;
    }
    return false;
  });
}
function _whHmToMin(hm) { if (!hm) return 0; var p = hm.split(':'); return parseInt(p[0],10)*60 + parseInt(p[1],10); }

/* ─ Save ─ */
function _whSave() {
  // Validasyon: kapalı olmayan her gün için open < close
  var err = null;
  _wh.DAY_NAMES.forEach(function(dn){
    var d = _wh.draft.days[dn];
    if (d.closed) return;
    if (_whHmToMin(d.open) >= _whHmToMin(d.close)) {
      err = dn + ': Açılış saati kapanıştan önce olmalı';
    }
  });
  if (err) {
    if (typeof _admToast === 'function') _admToast(err, 'err');
    else alert(err);
    return;
  }

  // Etkilenen rezervasyon kontrolü
  var affected = _whAffectedReservations();
  if (affected.length > 0) {
    _whOpenImpactDialog(affected);
    return;
  }
  _whPersist();
}

function _whOpenImpactDialog(affected) {
  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'whImpactDialog';
  m.className = 'wh-dialog';
  m.onclick = function(e){ if (e.target === m) _whCloseDialog('whImpactDialog'); };
  var list = affected.slice(0, 6).map(function(r){
    var d = new Date(r.reservedAt);
    return '<div class="wh-impact-row">'
      + '<iconify-icon icon="solar:user-bold" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
      + '<span style="flex:1">' + (r.customerName || 'Müşteri') + ' · ' + r.guestCount + ' kişi</span>'
      + '<span style="font:var(--fw-semibold) 11px/1 var(--font);color:var(--primary)">' + d.toLocaleDateString('tr-TR') + ' ' + d.toTimeString().slice(0,5) + '</span>'
      + '</div>';
  }).join('');
  var more = affected.length > 6 ? '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);text-align:center;margin-top:6px">ve ' + (affected.length - 6) + ' daha...</div>' : '';

  m.innerHTML = '<div class="wh-dialog-box">'
    + '<div class="wh-dialog-head"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:24px;color:#EF4444"></iconify-icon><div class="wh-dialog-title">Dikkat! ' + affected.length + ' rezervasyon etkileniyor</div></div>'
    + '<div style="font:var(--fw-regular) 12.5px/1.5 var(--font);color:var(--text-secondary);margin-bottom:10px">Çalışma saati değişikliği nedeniyle bu rezervasyonlar yeni saatlerin dışında kalıyor. Kaydetmeden önce müşterilerle iletişime geçmeyi unutma.</div>'
    + '<div class="wh-impact-list">' + list + more + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:12px">'
    +   '<button class="wh-dialog-cancel" style="flex:1" onclick="_whCloseDialog(\'whImpactDialog\')">Vazgeç</button>'
    +   '<button class="wh-save" style="flex:1;box-shadow:none" onclick="_whCloseDialog(\'whImpactDialog\');_whPersist()">Yine de Kaydet</button>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _whPersist() {
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === _wh.branchId; });
  if (!branch) return;
  // workingHours formatını eski demoya uyumlu yaz (open/close, closed flag eklendi)
  var wh = {};
  _wh.DAY_NAMES.forEach(function(dn){
    var d = _wh.draft.days[dn];
    wh[dn] = d.closed
      ? { open: 'Kapalı', close: 'Kapalı', closed: true, breaks: d.breaks || [] }
      : { open: d.open, close: d.close, closed: false, breaks: d.breaks || [] };
  });
  branch.workingHours = wh;
  branch.specialDays = _wh.draft.specialDays.slice();
  branch.temporarilyClosedUntil = _wh.draft.temporarilyClosedUntil;

  if (typeof _admToast === 'function') _admToast('Çalışma saatleri güncellendi · müşterilere bilgi bildirimi gönderildi', 'ok');

  var o = document.getElementById('bizWorkingHoursOverlay');
  if (o) o.remove();
  if (typeof openBizBranchDetail === 'function' && document.getElementById('bizBranchDetailOverlay')) {
    openBizBranchDetail(_wh.branchId);
  }
}

function _whFormatDate(iso) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' });
}
function _whFormatDateTime(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleString('tr-TR', { hour:'2-digit', minute:'2-digit' });
}

function _whInjectStyles() {
  if (document.getElementById('whStyles')) return;
  var s = document.createElement('style');
  s.id = 'whStyles';
  s.textContent = [
    '.wh-wrap{display:flex;flex-direction:column;gap:12px;padding-bottom:24px}',
    '.wh-emergency{display:flex;align-items:center;gap:12px;padding:14px;background:rgba(239,68,68,0.06);border:1.5px dashed rgba(239,68,68,0.35);border-radius:var(--r-xl)}',
    '.wh-emergency.on{background:rgba(239,68,68,0.15);border-style:solid;border-color:#EF4444}',
    '.wh-emergency-ico{width:44px;height:44px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;background:#EF4444;color:#fff;flex-shrink:0}',
    '.wh-emergency-text{flex:1;min-width:0}',
    '.wh-emergency-title{font:var(--fw-bold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}',
    '.wh-emergency-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.wh-emergency-btn{padding:8px 14px;border-radius:var(--r-full);border:none;background:#EF4444;color:#fff;font:var(--fw-bold) var(--fs-xs)/1 var(--font);cursor:pointer;flex-shrink:0}',
    '.wh-emergency-btn:active{transform:scale(.96)}',
    '.wh-quick{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.wh-quick-btn{padding:10px;border-radius:var(--r-lg);border:1.5px dashed var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-medium) 11.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.wh-quick-btn:hover{color:var(--primary);border-color:var(--primary)}',
    '.wh-grid{display:flex;flex-direction:column;gap:8px}',
    '.wh-day{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:12px 14px}',
    '.wh-day--closed{opacity:.55;filter:grayscale(.2)}',
    '.wh-day-head{display:flex;align-items:center;gap:12px}',
    '.wh-day-name{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);flex:1}',
    '.wh-day-toggle{display:flex;align-items:center;gap:8px;margin-left:auto}',
    '.wh-day-toggle-lbl{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)}',
    '.wh-switch{width:40px;height:22px;border-radius:var(--r-full);background:var(--glass-card-strong);position:relative;cursor:pointer;flex-shrink:0;transition:background .2s}',
    '.wh-switch.on{background:#22C55E}',
    '.wh-switch-dot{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:left .2s}',
    '.wh-switch.on .wh-switch-dot{left:20px}',
    '.wh-day-body{margin-top:10px;display:flex;flex-direction:column;gap:8px}',
    '.wh-time-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.wh-time-lbl{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)}',
    '.wh-time-input{padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;font-family:inherit}',
    '.wh-time-input--sm{padding:6px 8px;font-size:12px}',
    '.wh-time-sep{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-tertiary)}',
    '.wh-breaks{display:flex;flex-direction:column;gap:6px}',
    '.wh-break-row{display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--bg-btn);border-radius:var(--r-md);flex-wrap:wrap}',
    '.wh-break-lbl{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)}',
    '.wh-break-del{width:22px;height:22px;border:none;background:transparent;color:#EF4444;cursor:pointer;padding:0;margin-left:auto;display:flex;align-items:center;justify-content:center}',
    '.wh-add-break{align-self:flex-start;padding:6px 10px;border:1px dashed var(--border-subtle);border-radius:var(--r-full);background:var(--bg-phone);color:var(--primary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.wh-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px}',
    '.wh-section-lbl{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px}',
    '.wh-special-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle)}',
    '.wh-special-row:last-of-type{border-bottom:none}',
    '.wh-special-del{width:28px;height:28px;border:none;background:transparent;color:#EF4444;cursor:pointer;padding:0;border-radius:6px}',
    '.wh-special-del:hover{background:rgba(239,68,68,0.08)}',
    '.wh-add-special{margin-top:10px;padding:10px;border:1px dashed var(--border-subtle);border-radius:var(--r-md);background:transparent;color:var(--primary);font:var(--fw-medium) var(--fs-sm)/1 var(--font);cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:6px}',
    '.wh-add-special:hover{background:var(--primary-light)}',
    '.wh-legal{display:flex;align-items:flex-start;gap:8px;padding:12px 14px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.22);border-radius:var(--r-xl);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.wh-save{width:100%;padding:14px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,var(--primary),var(--primary-deep));color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(246,80,19,.3)}',
    '.wh-save:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}',
    '/* Dialog */',
    '.wh-dialog{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,0.55);display:flex;align-items:flex-end;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}',
    '.wh-dialog.open{opacity:1}',
    '.wh-dialog-box{width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl);padding:18px;max-height:80vh;overflow-y:auto;transform:translateY(20px);transition:transform .25s ease}',
    '.wh-dialog.open .wh-dialog-box{transform:translateY(0)}',
    '.wh-dialog-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}',
    '.wh-dialog-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);flex:1}',
    '.wh-dialog-list{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}',
    '.wh-dialog-opt{padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;text-align:left}',
    '.wh-dialog-opt:hover{background:var(--primary-light);border-color:var(--primary);color:var(--primary)}',
    '.wh-dialog-cancel{padding:12px;border-radius:var(--r-md);border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;width:100%}',
    '.wh-impact-list{display:flex;flex-direction:column;gap:4px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-md);padding:8px}',
    '.wh-impact-row{display:flex;align-items:center;gap:8px;padding:6px 4px;font:var(--fw-medium) 12px/1 var(--font);color:var(--text-primary)}'
  ].join('\n');
  document.head.appendChild(s);
}

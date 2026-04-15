/* ═══ SHIFTS & LEAVES — MANAGER + EMPLOYEE VIEWS (UI-only) ═══
 *
 * Two surfaces:
 *  1. Manager Panel  — openBizStaffShiftsEditor(staffId)
 *     Entry: "Personel" → kişi kartı → detayda "Vardiya ve İzin Yönet" butonu
 *  2. Employee Panel — openMyShifts()
 *     Entry: İşletmem sayfası → "Vardiyam" kartı (sadece non-owner roller)
 *
 * Veri akılda (in-memory). Her değişiklik push-notification toast'u ile
 * personele bildirildiğini simüle eder ve change log'una kayıt atar.
 */

/* ── Seed per-staff shift & leave state ─────────────────────────────────── */
var _BSH_DATA = {}; // { staffId: { routine, extras[], leaves[], log[] } }

function _bshEnsure(staffId) {
  if (_BSH_DATA[staffId]) return _BSH_DATA[staffId];
  // Varsayılan haftalık program: Pzt–Cum 09:00–18:00
  _BSH_DATA[staffId] = {
    routine: {
      days: [1, 2, 3, 4, 5],  // 0=Paz, 1=Pzt, ... 6=Cmt
      start: '09:00',
      end:   '18:00'
    },
    extras: [
      // örnek bir ekstra vardiya
      { id: 'x1', date: _bshRelDate(3), start: '20:00', end: '23:00', note: 'Hafta sonu kalabalığına takviye' }
    ],
    leaves: [
      // örnek izin
      { id: 'l1', date: _bshRelDate(7),  type: 'annual',  note: 'Yıllık izin' },
      { id: 'l2', date: _bshRelDate(8),  type: 'annual',  note: 'Yıllık izin' },
      { id: 'l3', date: _bshRelDate(-2), type: 'sick',    note: 'Rapor' }
    ],
    log: [
      { ts: _bshRelDateTime(-2), action: 'routine_updated', before: 'Pzt–Cum 09:00–18:00', after: 'Pzt–Cum 09:00–18:00', by: 'İşletme Sahibi' }
    ],
    // izin hakları
    annualQuota: 14,
    annualUsed:  3
  };
  return _BSH_DATA[staffId];
}

function _bshRelDate(offset) {
  var d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
function _bshRelDateTime(dayOffset) {
  var d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(10, 32, 0, 0);
  return d.toISOString();
}

/* ── Constants ──────────────────────────────────────────────────────────── */
var _BSH_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
var _BSH_DAYS_LONG = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
var _BSH_LEAVE_TYPES = {
  annual:  { label: 'Yıllık İzin',   color: '#3B82F6', icon: 'solar:suitcase-lines-linear' },
  sick:    { label: 'Rapor',         color: '#EF4444', icon: 'solar:stethoscope-linear' },
  weekly:  { label: 'Haftalık İzin', color: '#22C55E', icon: 'solar:calendar-minimalistic-linear' },
  unpaid:  { label: 'Ücretsiz İzin', color: '#F59E0B', icon: 'solar:hand-stars-linear' }
};

/* ── HTML helpers ───────────────────────────────────────────────────────── */
function _bshEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function _bshFmtDate(iso) {
  var d = new Date(iso + 'T00:00:00');
  var mon = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()];
  return d.getDate() + ' ' + mon + ' ' + d.getFullYear();
}
function _bshFmtDateTime(iso) {
  var d = new Date(iso);
  var dd = String(d.getDate()).padStart(2, '0');
  var mm = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()];
  var hh = String(d.getHours()).padStart(2, '0');
  var mn = String(d.getMinutes()).padStart(2, '0');
  return dd + ' ' + mm + ' · ' + hh + ':' + mn;
}

function _bshInjectStyle() {
  if (document.getElementById('bshStyles')) return;
  var s = document.createElement('style');
  s.id = 'bshStyles';
  s.textContent = [
    '@keyframes bshSlideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}',
    '@keyframes bshFade{from{opacity:0}to{opacity:1}}',
    '.bsh-day-chip{flex:1;min-width:38px;padding:10px 6px;text-align:center;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-semibold) 12px/1 var(--font);color:var(--text-secondary);cursor:pointer;transition:all .15s}',
    '.bsh-day-chip.active{background:var(--primary);border-color:var(--primary);color:#fff}',
    '.bsh-cal-cell{aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:var(--r-md);font:var(--fw-medium) 11px/1 var(--font);position:relative;background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary)}',
    '.bsh-cal-cell.empty{background:transparent;border:none}',
    '.bsh-cal-cell.today{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}',
    '.bsh-cal-cell .dots{display:flex;gap:2px;height:5px;justify-content:center;align-items:center}',
    '.bsh-cal-cell .d{width:5px;height:5px;border-radius:50%}',
    '.bsh-input{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:10px 12px;font:var(--fw-regular) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);outline:none;width:100%}',
    '.bsh-input:focus{border-color:var(--primary)}',
    '.bsh-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg)}',
    '.bsh-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:999px;font:var(--fw-semibold) 10px/1 var(--font)}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════════════════
 * MANAGER PANEL — openBizStaffShiftsEditor(staffId)
 * ══════════════════════════════════════════════════════════════════════════ */
function openBizStaffShiftsEditor(staffId) {
  _bshInjectStyle();
  if (typeof bizCurrentRole !== 'undefined' && bizCurrentRole !== 'owner' && bizCurrentRole !== 'manager') {
    _bshToast('Bu işlem için yetkiniz yok', 'err');
    return;
  }

  var s = (typeof BIZ_STAFF !== 'undefined') ? BIZ_STAFF.find(function (x) { return x.id === staffId; }) : null;
  if (!s) return;
  _bshEnsure(staffId);

  var existing = document.getElementById('bshMgrOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'bshMgrOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'display:flex;z-index:70';
  overlay.dataset.staffId = staffId;

  overlay.innerHTML = ''
    + '<div class="prof-container" style="background:var(--bg-page)">'
    +   '<div class="prof-topbar" style="background:var(--bg-page);border-bottom:1px solid var(--border-subtle)">'
    +     '<div class="btn-icon" onclick="closeBizStaffShiftsEditor()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +     '<span class="prof-topbar-name" style="flex:1;text-align:center">Vardiyalar ve İzinler</span>'
    +     '<div style="width:36px"></div>'
    +   '</div>'
    +   '<div id="bshMgrBody" style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:16px"></div>'
    + '</div>';

  document.getElementById('bizPhone').appendChild(overlay);
  _bshRenderMgrBody(s);
}

function closeBizStaffShiftsEditor() {
  var el = document.getElementById('bshMgrOverlay');
  if (el) el.remove();
}

function _bshRenderMgrBody(s) {
  var body = document.getElementById('bshMgrBody');
  if (!body) return;
  var d = _bshEnsure(s.id);

  // Header: staff summary
  var header = ''
    + '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl)">'
    +   '<img src="' + _bshEsc(s.avatar) + '" style="width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0" alt="">'
    +   '<div style="flex:1;min-width:0"><div style="font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">' + _bshEsc(s.name) + '</div>'
    +   '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _bshEsc((typeof BIZ_ROLE_LABELS !== 'undefined' ? BIZ_ROLE_LABELS[s.role] : s.role)) + ' · İşe Giriş: ' + new Date(s.hireDate).toLocaleDateString('tr-TR') + '</div></div>'
    + '</div>';

  // 1. Routine weekly
  var daysHtml = _BSH_DAYS.map(function (dn, i) {
    var active = d.routine.days.indexOf(i) >= 0;
    return '<div class="bsh-day-chip' + (active ? ' active' : '') + '">' + dn + '</div>';
  }).join('');

  var routine = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">'
    +     '<div style="display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:calendar-minimalistic-bold" style="font-size:18px;color:var(--primary)"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Rutin (Normal) Vardiya</div></div>'
    +     '<div onclick="_bshEditRoutine(\'' + s.id + '\')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:pen-linear" style="font-size:14px"></iconify-icon>Düzenle</div>'
    +   '</div>'
    +   '<div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    +     '<div style="display:flex;gap:4px">' + daysHtml + '</div>'
    +     '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--primary-soft);border-radius:var(--r-lg)">'
    +       '<iconify-icon icon="solar:clock-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    +       '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--primary)">' + _bshEsc(d.routine.start) + ' – ' + _bshEsc(d.routine.end) + '</div>'
    +       '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:3px">' + _bshSelectedDaysLabel(d.routine.days) + '</div></div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  // 2. Extras
  var extrasList = d.extras.length
    ? d.extras.map(function (x) {
        return '<div class="bsh-row" style="display:flex;gap:10px">'
          + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:rgba(249,115,22,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:alarm-add-bold" style="font-size:18px;color:#F97316"></iconify-icon></div>'
          + '<div style="flex:1;min-width:0"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _bshFmtDate(x.date) + ' · ' + x.start + ' – ' + x.end + '</div>'
          + (x.note ? '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _bshEsc(x.note) + '</div>' : '') + '</div>'
          + '<div onclick="_bshDeleteExtra(\'' + s.id + '\',\'' + x.id + '\')" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#EF4444"><iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:18px"></iconify-icon></div>'
          + '</div>';
      }).join('')
    : '<div style="padding:14px;font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);text-align:center">Ekstra vardiya tanımlanmamış.</div>';

  var extras = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">'
    +     '<div style="display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:alarm-add-bold" style="font-size:18px;color:#F97316"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Ekstra Vardiyalar</div></div>'
    +     '<div onclick="_bshAddExtra(\'' + s.id + '\')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#F97316;cursor:pointer;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon>Ekle</div>'
    +   '</div>'
    +   '<div style="padding:10px 14px;display:flex;flex-direction:column;gap:8px">' + extrasList + '</div>'
    + '</div>';

  // 3. Leaves
  var leavesList = d.leaves.length
    ? d.leaves.sort(function (a, b) { return a.date.localeCompare(b.date); }).map(function (l) {
        var t = _BSH_LEAVE_TYPES[l.type] || _BSH_LEAVE_TYPES.annual;
        return '<div class="bsh-row">'
          + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:' + t.color + '22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="' + t.icon + '" style="font-size:18px;color:' + t.color + '"></iconify-icon></div>'
          + '<div style="flex:1;min-width:0"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _bshFmtDate(l.date) + '</div>'
          + '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + t.label + (l.note ? ' · ' + _bshEsc(l.note) : '') + '</div></div>'
          + '<div onclick="_bshDeleteLeave(\'' + s.id + '\',\'' + l.id + '\')" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#EF4444"><iconify-icon icon="solar:trash-bin-trash-linear" style="font-size:18px"></iconify-icon></div>'
          + '</div>';
      }).join('')
    : '<div style="padding:14px;font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);text-align:center">Tanımlı izin yok.</div>';

  var leaves = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between">'
    +     '<div style="display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:calendar-date-bold" style="font-size:18px;color:#3B82F6"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İzin Günleri</div></div>'
    +     '<div onclick="_bshAddLeave(\'' + s.id + '\')" style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:#3B82F6;cursor:pointer;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:add-circle-linear" style="font-size:14px"></iconify-icon>İzin Ekle</div>'
    +   '</div>'
    +   '<div style="padding:10px 14px;display:flex;flex-direction:column;gap:8px">' + leavesList + '</div>'
    +   '<div style="padding:10px 14px;border-top:1px dashed var(--border-subtle);display:flex;justify-content:space-between;align-items:center;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary)">'
    +     '<span>Yıllık İzin: <b style="color:var(--text-primary)">' + d.annualUsed + '/' + d.annualQuota + '</b> kullanıldı</span>'
    +     '<span style="color:var(--text-tertiary)">' + (d.annualQuota - d.annualUsed) + ' gün kaldı</span>'
    +   '</div>'
    + '</div>';

  // 4. Weekly Calendar Visualization (next 14 days)
  var calHtml = _bshMonthCalendar(s.id, d);

  // 5. Change log preview (last 3)
  var logPreview = (d.log || []).slice().reverse().slice(0, 3).map(function (l) {
    return '<div style="display:flex;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border-subtle)">'
      + '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);margin-top:6px;flex-shrink:0"></div>'
      + '<div style="flex:1"><div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">' + _bshLogText(l) + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:2px">' + _bshFmtDateTime(l.ts) + ' · ' + _bshEsc(l.by) + '</div></div>'
      + '</div>';
  }).join('');
  var logs = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:history-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Son Değişiklikler</div></div>'
    +   (logPreview || '<div style="padding:14px;font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);text-align:center">Henüz kayıt yok.</div>')
    + '</div>';

  body.innerHTML = header + routine + extras + leaves + calHtml + logs;
}

function _bshSelectedDaysLabel(days) {
  if (!days.length) return 'Gün seçilmemiş';
  if (days.length === 7) return 'Her gün';
  return days.slice().sort().map(function (i) { return _BSH_DAYS[i]; }).join(', ');
}

function _bshMonthCalendar(staffId, d) {
  // Önümüzdeki 14 güne bakan 2-haftalık mini takvim
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var cells = [];
  for (var i = 0; i < 14; i++) {
    var date = new Date(today); date.setDate(today.getDate() + i);
    var iso = date.toISOString().slice(0, 10);
    var dow = date.getDay();
    var isRoutine = d.routine.days.indexOf(dow) >= 0;
    var extra = d.extras.find(function (x) { return x.date === iso; });
    var leave = d.leaves.find(function (l) { return l.date === iso; });
    cells.push({ iso: iso, day: date.getDate(), dowLabel: _BSH_DAYS[dow], isToday: i === 0, isRoutine: isRoutine, extra: extra, leave: leave });
  }

  var dowHeader = _BSH_DAYS.map(function (dn) {
    return '<div style="text-align:center;font:var(--fw-medium) 10px/1 var(--font);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.5px;padding:4px 0">' + dn + '</div>';
  }).join('');

  // Pad first row to align with first day's weekday
  var firstDow = new Date(cells[0].iso + 'T00:00:00').getDay();
  var padCells = '';
  for (var p = 0; p < firstDow; p++) padCells += '<div class="bsh-cal-cell empty"></div>';

  var cellsHtml = padCells + cells.map(function (c) {
    var dots = '';
    if (c.isRoutine) dots += '<div class="d" style="background:var(--primary)" title="Rutin"></div>';
    if (c.extra)     dots += '<div class="d" style="background:#F97316" title="Ekstra"></div>';
    if (c.leave) {
      var t = _BSH_LEAVE_TYPES[c.leave.type] || _BSH_LEAVE_TYPES.annual;
      dots += '<div class="d" style="background:' + t.color + '" title="' + t.label + '"></div>';
    }
    return '<div class="bsh-cal-cell' + (c.isToday ? ' today' : '') + '" style="' + (c.leave ? 'background:' + (_BSH_LEAVE_TYPES[c.leave.type] || _BSH_LEAVE_TYPES.annual).color + '12' : '') + '">'
      + '<div>' + c.day + '</div>'
      + '<div class="dots">' + dots + '</div>'
      + '</div>';
  }).join('');

  var legend = ''
    + '<div style="display:flex;flex-wrap:wrap;gap:10px;padding:10px 14px;border-top:1px dashed var(--border-subtle);font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted)">'
    +   '<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:var(--primary)"></span>Rutin</span>'
    +   '<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:#F97316"></span>Ekstra</span>'
    +   '<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:#3B82F6"></span>Yıllık</span>'
    +   '<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:#EF4444"></span>Rapor</span>'
    + '</div>';

  return '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    + '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:calendar-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Haftalık Çizelge (Önümüzdeki 2 Hafta)</div></div>'
    + '<div style="padding:10px 12px">'
    +   '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">' + dowHeader + cellsHtml + '</div>'
    + '</div>'
    + legend
    + '</div>';
}

/* ── Routine editor ─────────────────────────────────────────────────────── */
var _bshDraftDays = [];
function _bshEditRoutine(staffId) {
  var d = _bshEnsure(staffId);
  _bshDraftDays = d.routine.days.slice();

  var existing = document.getElementById('bshRoutineModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'bshRoutineModal';
  modal.dataset.staffId = staffId;
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:95;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };

  modal.innerHTML = ''
    + '<div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;padding:18px;animation:bshSlideUp .22s ease;display:flex;flex-direction:column;gap:14px">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:36px;height:36px;border-radius:var(--r-md);background:var(--primary-soft);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:calendar-minimalistic-bold" style="font-size:20px;color:var(--primary)"></iconify-icon></div>'
    +     '<div style="flex:1"><div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Rutin Vardiyayı Düzenle</div>'
    +     '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Haftalık günler ve saat aralığı</div></div>'
    +     '<div class="btn-icon" onclick="document.getElementById(\'bshRoutineModal\').remove()" style="width:32px;height:32px"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>'
    +   '</div>'
    +   '<div>'
    +     '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Çalışma Günleri</div>'
    +     '<div id="bshDaysWrap" style="display:flex;gap:4px">' + _BSH_DAYS.map(function (dn, i) {
              var active = _bshDraftDays.indexOf(i) >= 0;
              return '<div class="bsh-day-chip' + (active ? ' active' : '') + '" onclick="_bshToggleDay(' + i + ')">' + dn + '</div>';
            }).join('') + '</div>'
    +   '</div>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +     '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Başlangıç</span><input id="bshStart" type="time" class="bsh-input" value="' + d.routine.start + '" style="font-family:monospace"></label>'
    +     '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Bitiş</span><input id="bshEnd" type="time" class="bsh-input" value="' + d.routine.end + '" style="font-family:monospace"></label>'
    +   '</div>'
    +   '<div style="display:flex;gap:8px;padding-top:6px">'
    +     '<button onclick="document.getElementById(\'bshRoutineModal\').remove()" style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>'
    +     '<button onclick="_bshSaveRoutine()" style="flex:2;padding:12px;border-radius:var(--r-lg);background:var(--primary);border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:check-circle-linear" style="font-size:16px"></iconify-icon>Kaydet</button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(modal);
}

function _bshToggleDay(i) {
  var idx = _bshDraftDays.indexOf(i);
  if (idx >= 0) _bshDraftDays.splice(idx, 1);
  else _bshDraftDays.push(i);
  var wrap = document.getElementById('bshDaysWrap');
  if (wrap) {
    wrap.innerHTML = _BSH_DAYS.map(function (dn, k) {
      var active = _bshDraftDays.indexOf(k) >= 0;
      return '<div class="bsh-day-chip' + (active ? ' active' : '') + '" onclick="_bshToggleDay(' + k + ')">' + dn + '</div>';
    }).join('');
  }
}

function _bshSaveRoutine() {
  var modal = document.getElementById('bshRoutineModal');
  if (!modal) return;
  var staffId = modal.dataset.staffId;
  var d = _bshEnsure(staffId);
  var start = document.getElementById('bshStart').value || d.routine.start;
  var end   = document.getElementById('bshEnd').value   || d.routine.end;
  if (!_bshDraftDays.length) { _bshToast('En az bir gün seçmelisin', 'err'); return; }

  var before = _bshSelectedDaysLabel(d.routine.days) + ' / ' + d.routine.start + '–' + d.routine.end;
  var after  = _bshSelectedDaysLabel(_bshDraftDays)   + ' / ' + start + '–' + end;

  d.routine = { days: _bshDraftDays.slice(), start: start, end: end };
  d.log.push({ ts: new Date().toISOString(), action: 'routine_updated', before: before, after: after, by: _bshCurrentActor() });

  modal.remove();
  var mgr = document.getElementById('bshMgrOverlay');
  if (mgr) {
    var s = BIZ_STAFF.find(function (x) { return x.id === staffId; });
    _bshRenderMgrBody(s);
  }
  _bshToast('Rutin vardiya güncellendi · Bildirim gönderildi', 'ok');
}

/* ── Extra shift add/remove ─────────────────────────────────────────────── */
function _bshAddExtra(staffId) {
  var existing = document.getElementById('bshExtraModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'bshExtraModal';
  modal.dataset.staffId = staffId;
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:95;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };

  var tomorrow = _bshRelDate(1);

  modal.innerHTML = ''
    + '<div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;padding:18px;animation:bshSlideUp .22s ease;display:flex;flex-direction:column;gap:14px">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:36px;height:36px;border-radius:var(--r-md);background:rgba(249,115,22,.15);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:alarm-add-bold" style="font-size:20px;color:#F97316"></iconify-icon></div>'
    +     '<div style="flex:1"><div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">Ekstra Vardiya Ekle</div>'
    +     '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Tek seferlik atama</div></div>'
    +     '<div class="btn-icon" onclick="document.getElementById(\'bshExtraModal\').remove()" style="width:32px;height:32px"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>'
    +   '</div>'
    +   '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Tarih</span><input id="bshExDate" type="date" class="bsh-input" value="' + tomorrow + '"></label>'
    +   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +     '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Başlangıç</span><input id="bshExStart" type="time" class="bsh-input" value="18:00" style="font-family:monospace"></label>'
    +     '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Bitiş</span><input id="bshExEnd" type="time" class="bsh-input" value="23:00" style="font-family:monospace"></label>'
    +   '</div>'
    +   '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Not (ops.)</span><input id="bshExNote" class="bsh-input" placeholder="Örn: Hafta sonu yoğunluğu" maxlength="80"></label>'
    +   '<div style="display:flex;gap:8px;padding-top:6px">'
    +     '<button onclick="document.getElementById(\'bshExtraModal\').remove()" style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>'
    +     '<button onclick="_bshSaveExtra()" style="flex:2;padding:12px;border-radius:var(--r-lg);background:#F97316;border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:check-circle-linear" style="font-size:16px"></iconify-icon>Ata ve Bildir</button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(modal);
}

function _bshSaveExtra() {
  var modal = document.getElementById('bshExtraModal');
  if (!modal) return;
  var staffId = modal.dataset.staffId;
  var d = _bshEnsure(staffId);
  var date = document.getElementById('bshExDate').value;
  var start = document.getElementById('bshExStart').value;
  var end = document.getElementById('bshExEnd').value;
  var note = document.getElementById('bshExNote').value.trim();
  if (!date || !start || !end) { _bshToast('Tarih ve saatleri gir', 'err'); return; }

  var extra = { id: 'x_' + Date.now().toString(36), date: date, start: start, end: end, note: note };
  d.extras.push(extra);
  d.log.push({ ts: new Date().toISOString(), action: 'extra_added', before: '—', after: _bshFmtDate(date) + ' · ' + start + '–' + end, by: _bshCurrentActor() });

  modal.remove();
  var s = BIZ_STAFF.find(function (x) { return x.id === staffId; });
  _bshRenderMgrBody(s);
  _bshToast('Ekstra vardiya eklendi · Bildirim gönderildi', 'ok');
}

function _bshDeleteExtra(staffId, xid) {
  var d = _bshEnsure(staffId);
  var idx = d.extras.findIndex(function (x) { return x.id === xid; });
  if (idx < 0) return;
  var removed = d.extras[idx];
  d.extras.splice(idx, 1);
  d.log.push({ ts: new Date().toISOString(), action: 'extra_removed', before: _bshFmtDate(removed.date) + ' · ' + removed.start + '–' + removed.end, after: '—', by: _bshCurrentActor() });
  var s = BIZ_STAFF.find(function (x) { return x.id === staffId; });
  _bshRenderMgrBody(s);
  _bshToast('Ekstra vardiya kaldırıldı · Bildirim gönderildi', 'ok');
}

/* ── Leave add/remove ───────────────────────────────────────────────────── */
function _bshAddLeave(staffId) {
  var existing = document.getElementById('bshLeaveModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'bshLeaveModal';
  modal.dataset.staffId = staffId;
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:95;display:flex;align-items:flex-end;justify-content:center';
  modal.onclick = function (e) { if (e.target === modal) modal.remove(); };

  var optsHtml = Object.keys(_BSH_LEAVE_TYPES).map(function (k) {
    var t = _BSH_LEAVE_TYPES[k];
    return '<div class="bsh-leave-type" onclick="_bshPickLeaveType(\'' + k + '\',this)" data-key="' + k + '" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);cursor:pointer"><iconify-icon icon="' + t.icon + '" style="font-size:18px;color:' + t.color + '"></iconify-icon><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + t.label + '</span></div>';
  }).join('');

  modal.innerHTML = ''
    + '<div style="width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-2xl) var(--r-2xl) 0 0;padding:18px;animation:bshSlideUp .22s ease;display:flex;flex-direction:column;gap:14px">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:36px;height:36px;border-radius:var(--r-md);background:rgba(59,130,246,.15);display:flex;align-items:center;justify-content:center"><iconify-icon icon="solar:calendar-date-bold" style="font-size:20px;color:#3B82F6"></iconify-icon></div>'
    +     '<div style="flex:1"><div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">İzin Ekle</div>'
    +     '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px">Tek gün ataması</div></div>'
    +     '<div class="btn-icon" onclick="document.getElementById(\'bshLeaveModal\').remove()" style="width:32px;height:32px"><iconify-icon icon="solar:close-circle-linear" style="font-size:20px"></iconify-icon></div>'
    +   '</div>'
    +   '<div><div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">İzin Türü</div>'
    +     '<div id="bshLeaveTypes" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + optsHtml + '</div></div>'
    +   '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Tarih</span><input id="bshLvDate" type="date" class="bsh-input" value="' + _bshRelDate(1) + '"></label>'
    +   '<label style="display:flex;flex-direction:column;gap:5px"><span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Açıklama (ops.)</span><input id="bshLvNote" class="bsh-input" placeholder="Örn: Aile ziyareti" maxlength="80"></label>'
    +   '<div style="display:flex;gap:8px;padding-top:6px">'
    +     '<button onclick="document.getElementById(\'bshLeaveModal\').remove()" style="flex:1;padding:12px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle);color:var(--text-primary);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer">Vazgeç</button>'
    +     '<button onclick="_bshSaveLeave()" style="flex:2;padding:12px;border-radius:var(--r-lg);background:#3B82F6;border:none;color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px"><iconify-icon icon="solar:check-circle-linear" style="font-size:16px"></iconify-icon>Ata ve Bildir</button>'
    +   '</div>'
    + '</div>';
  modal.dataset.pickedType = 'annual';
  document.body.appendChild(modal);
  // mark first type selected
  var first = modal.querySelector('.bsh-leave-type[data-key="annual"]');
  if (first) { first.style.borderColor = _BSH_LEAVE_TYPES.annual.color; first.style.background = _BSH_LEAVE_TYPES.annual.color + '14'; }
}

function _bshPickLeaveType(key, el) {
  var modal = document.getElementById('bshLeaveModal');
  if (!modal) return;
  modal.dataset.pickedType = key;
  modal.querySelectorAll('.bsh-leave-type').forEach(function (n) {
    var k = n.dataset.key;
    if (k === key) { n.style.borderColor = _BSH_LEAVE_TYPES[k].color; n.style.background = _BSH_LEAVE_TYPES[k].color + '14'; }
    else { n.style.borderColor = 'var(--border-subtle)'; n.style.background = 'var(--bg-phone)'; }
  });
}

function _bshSaveLeave() {
  var modal = document.getElementById('bshLeaveModal');
  if (!modal) return;
  var staffId = modal.dataset.staffId;
  var type = modal.dataset.pickedType || 'annual';
  var date = document.getElementById('bshLvDate').value;
  var note = document.getElementById('bshLvNote').value.trim();
  if (!date) { _bshToast('Tarih seçmelisin', 'err'); return; }
  var d = _bshEnsure(staffId);
  var l = { id: 'l_' + Date.now().toString(36), date: date, type: type, note: note };
  d.leaves.push(l);
  if (type === 'annual') d.annualUsed = Math.min(d.annualQuota, d.annualUsed + 1);
  d.log.push({ ts: new Date().toISOString(), action: 'leave_added', before: '—', after: _BSH_LEAVE_TYPES[type].label + ' · ' + _bshFmtDate(date), by: _bshCurrentActor() });

  modal.remove();
  var s = BIZ_STAFF.find(function (x) { return x.id === staffId; });
  _bshRenderMgrBody(s);
  _bshToast('İzin eklendi · Bildirim gönderildi', 'ok');
}

function _bshDeleteLeave(staffId, lid) {
  var d = _bshEnsure(staffId);
  var idx = d.leaves.findIndex(function (l) { return l.id === lid; });
  if (idx < 0) return;
  var removed = d.leaves[idx];
  d.leaves.splice(idx, 1);
  if (removed.type === 'annual') d.annualUsed = Math.max(0, d.annualUsed - 1);
  d.log.push({ ts: new Date().toISOString(), action: 'leave_removed', before: (_BSH_LEAVE_TYPES[removed.type].label + ' · ' + _bshFmtDate(removed.date)), after: '—', by: _bshCurrentActor() });
  var s = BIZ_STAFF.find(function (x) { return x.id === staffId; });
  _bshRenderMgrBody(s);
  _bshToast('İzin kaldırıldı · Bildirim gönderildi', 'ok');
}

function _bshLogText(l) {
  switch (l.action) {
    case 'routine_updated': return 'Rutin vardiya güncellendi: ' + _bshEsc(l.before) + ' → ' + _bshEsc(l.after);
    case 'extra_added':     return 'Ekstra vardiya atandı: ' + _bshEsc(l.after);
    case 'extra_removed':   return 'Ekstra vardiya kaldırıldı: ' + _bshEsc(l.before);
    case 'leave_added':     return 'İzin atandı: ' + _bshEsc(l.after);
    case 'leave_removed':   return 'İzin kaldırıldı: ' + _bshEsc(l.before);
    default: return _bshEsc(l.after || l.action);
  }
}

function _bshCurrentActor() {
  try {
    if (typeof bizCurrentRole !== 'undefined') {
      if (bizCurrentRole === 'owner') return 'İşletme Sahibi';
      if (bizCurrentRole === 'manager') return 'Şube Müdürü';
    }
  } catch (e) {}
  return 'Yönetici';
}

/* ══════════════════════════════════════════════════════════════════════════
 * EMPLOYEE PANEL — openMyShifts()  (read-only)
 * ══════════════════════════════════════════════════════════════════════════ */
function openMyShifts() {
  _bshInjectStyle();
  var s = (typeof getCurrentBizStaff === 'function') ? getCurrentBizStaff() : null;
  if (!s) {
    // Fallback for demo: use the first non-owner staff member
    s = (typeof BIZ_STAFF !== 'undefined') ? BIZ_STAFF.find(function (x) { return x.role !== 'owner'; }) : null;
  }
  if (!s) { _bshToast('Personel bilgisi bulunamadı', 'err'); return; }
  _bshEnsure(s.id);

  var existing = document.getElementById('bshEmpOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'bshEmpOverlay';
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'display:flex;z-index:70';
  overlay.dataset.staffId = s.id;

  overlay.innerHTML = ''
    + '<div class="prof-container" style="background:var(--bg-page)">'
    +   '<div class="prof-topbar" style="background:var(--bg-page);border-bottom:1px solid var(--border-subtle)">'
    +     '<div class="btn-icon" onclick="closeMyShifts()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +     '<span class="prof-topbar-name" style="flex:1;text-align:center">Vardiyam</span>'
    +     '<div style="width:36px"></div>'
    +   '</div>'
    +   '<div id="bshEmpBody" style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:16px"></div>'
    + '</div>';

  document.getElementById('bizPhone').appendChild(overlay);
  _bshRenderEmpBody(s);
}

function closeMyShifts() {
  var el = document.getElementById('bshEmpOverlay');
  if (el) el.remove();
}

function _bshRenderEmpBody(s) {
  var body = document.getElementById('bshEmpBody');
  if (!body) return;
  var d = _bshEnsure(s.id);
  var roleLabel = (typeof BIZ_ROLE_LABELS !== 'undefined') ? BIZ_ROLE_LABELS[s.role] : s.role;

  // Read-only banner
  var banner = '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--primary-soft);border:1px solid var(--primary);border-radius:var(--r-lg);color:var(--primary)">'
    + '<iconify-icon icon="solar:eye-bold" style="font-size:18px"></iconify-icon>'
    + '<span style="font:var(--fw-medium) 11px/1.3 var(--font)">Bu sayfa yalnızca bilgilendirme amaçlıdır. Değişiklikler yöneticin tarafından yapılır.</span>'
    + '</div>';

  // General info
  var hire = new Date(s.hireDate);
  var months = Math.max(0, (new Date().getFullYear() - hire.getFullYear()) * 12 + (new Date().getMonth() - hire.getMonth()));
  var tenure = months >= 12 ? (Math.floor(months / 12) + ' yıl ' + (months % 12 ? (months % 12) + ' ay' : '')) : (months + ' ay');
  var info = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:16px;display:flex;align-items:center;gap:12px">'
    +   '<img src="' + _bshEsc(s.avatar) + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover" alt="">'
    +   '<div style="flex:1;min-width:0">'
    +     '<div style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)">' + _bshEsc(s.name) + '</div>'
    +     '<div style="display:inline-block;padding:3px 8px;border-radius:999px;background:var(--primary-soft);color:var(--primary);font:var(--fw-semibold) 11px/1 var(--font);margin-top:6px">' + _bshEsc(roleLabel) + '</div>'
    +     '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:6px">İşe Giriş: ' + hire.toLocaleDateString('tr-TR') + ' · ' + tenure + '</div>'
    +   '</div>'
    + '</div>';

  // Working schedule (routine + extras)
  var daysHtml = _BSH_DAYS.map(function (dn, i) {
    var active = d.routine.days.indexOf(i) >= 0;
    return '<div class="bsh-day-chip' + (active ? ' active' : '') + '" style="cursor:default">' + dn + '</div>';
  }).join('');

  var extrasList = d.extras.length
    ? d.extras.sort(function (a, b) { return a.date.localeCompare(b.date); }).map(function (x) {
        return '<div class="bsh-row">'
          + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:rgba(249,115,22,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:alarm-add-bold" style="font-size:16px;color:#F97316"></iconify-icon></div>'
          + '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _bshFmtDate(x.date) + ' · ' + x.start + '–' + x.end + '</div>'
          + (x.note ? '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + _bshEsc(x.note) + '</div>' : '') + '</div>'
          + '<span class="bsh-tag" style="background:rgba(249,115,22,.15);color:#F97316">EKSTRA</span>'
          + '</div>';
      }).join('')
    : '';

  var schedule = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:calendar-minimalistic-bold" style="font-size:18px;color:var(--primary)"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Çalışma Programın</div></div>'
    +   '<div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px">'
    +     '<div style="display:flex;gap:4px">' + daysHtml + '</div>'
    +     '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--primary-soft);border-radius:var(--r-lg)"><iconify-icon icon="solar:clock-circle-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    +     '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--primary)">' + _bshEsc(d.routine.start) + ' – ' + _bshEsc(d.routine.end) + '</div>'
    +     '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:3px">' + _bshSelectedDaysLabel(d.routine.days) + '</div></div></div>'
    +   '</div>'
    +   (extrasList
        ? '<div style="padding:4px 14px 14px"><div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:8px 2px 8px">Ekstra Vardiyalar</div><div style="display:flex;flex-direction:column;gap:8px">' + extrasList + '</div></div>'
        : '')
    + '</div>';

  // Calendar
  var cal = _bshMonthCalendar(s.id, d);

  // Upcoming leaves + remaining
  var upcoming = d.leaves
    .filter(function (l) { return new Date(l.date + 'T00:00:00') >= new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00'); })
    .sort(function (a, b) { return a.date.localeCompare(b.date); })
    .slice(0, 4);

  var upcomingHtml = upcoming.length
    ? upcoming.map(function (l) {
        var t = _BSH_LEAVE_TYPES[l.type] || _BSH_LEAVE_TYPES.annual;
        return '<div class="bsh-row">'
          + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:' + t.color + '22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="' + t.icon + '" style="font-size:16px;color:' + t.color + '"></iconify-icon></div>'
          + '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _bshFmtDate(l.date) + '</div>'
          + '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">' + t.label + '</div></div>'
          + '<span class="bsh-tag" style="background:' + t.color + '18;color:' + t.color + '">YAKLAŞIYOR</span>'
          + '</div>';
      }).join('')
    : '<div style="padding:14px;font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);text-align:center">Yaklaşan izin yok.</div>';

  var leaveBalance = ''
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px">'
    +   '<div style="background:var(--primary-soft);border-radius:var(--r-lg);padding:12px;text-align:center">'
    +     '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">Kalan İzin</div>'
    +     '<div style="font:var(--fw-bold) 22px/1 var(--font);color:var(--primary);margin-top:6px">' + (d.annualQuota - d.annualUsed) + '</div>'
    +     '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:4px">gün</div>'
    +   '</div>'
    +   '<div style="background:var(--bg-btn);border-radius:var(--r-lg);padding:12px;text-align:center">'
    +     '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">Kullanılan</div>'
    +     '<div style="font:var(--fw-bold) 22px/1 var(--font);color:var(--text-primary);margin-top:6px">' + d.annualUsed + '</div>'
    +     '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:4px">' + d.annualQuota + ' gün yıllık hak</div>'
    +   '</div>'
    + '</div>';

  var leavesBlock = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:calendar-date-bold" style="font-size:18px;color:#3B82F6"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İzin Durumu</div></div>'
    +   leaveBalance
    +   '<div style="padding:4px 14px 14px;display:flex;flex-direction:column;gap:8px">' + upcomingHtml + '</div>'
    + '</div>';

  // Change log
  var logRows = (d.log || []).slice().reverse().map(function (l) {
    var icon = 'solar:document-text-linear';
    var color = 'var(--text-secondary)';
    if (l.action.indexOf('extra') >= 0) { icon = 'solar:alarm-add-bold'; color = '#F97316'; }
    else if (l.action.indexOf('leave') >= 0) { icon = 'solar:calendar-date-bold'; color = '#3B82F6'; }
    else if (l.action.indexOf('routine') >= 0) { icon = 'solar:calendar-minimalistic-bold'; color = 'var(--primary)'; }

    var before = l.before && l.before !== '—'
      ? '<div style="font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-tertiary);text-decoration:line-through">Önceki: ' + _bshEsc(l.before) + '</div>'
      : '';
    var after = l.after && l.after !== '—'
      ? '<div style="font:var(--fw-medium) 11px/1.4 var(--font);color:var(--text-primary);margin-top:2px">Yeni: ' + _bshEsc(l.after) + '</div>'
      : '';

    return '<div style="padding:12px 14px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px">'
      + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:' + color + '22;display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="' + icon + '" style="font-size:16px;color:' + color + '"></iconify-icon></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">' + _bshActionLabel(l.action) + '</div>'
      + before + after
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:4px">' + _bshFmtDateTime(l.ts) + ' · ' + _bshEsc(l.by) + '</div>'
      + '</div></div>';
  }).join('');

  var logs = ''
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);overflow:hidden">'
    +   '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:history-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon><div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Vardiya Değişim Geçmişi</div></div>'
    +   (logRows || '<div style="padding:14px;font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted);text-align:center">Henüz değişiklik kaydı yok.</div>')
    + '</div>';

  body.innerHTML = banner + info + schedule + cal + leavesBlock + logs;
}

function _bshActionLabel(a) {
  return {
    routine_updated: 'Rutin Vardiya Güncellendi',
    extra_added:     'Ekstra Vardiya Atandı',
    extra_removed:   'Ekstra Vardiya Kaldırıldı',
    leave_added:     'İzin Atandı',
    leave_removed:   'İzin Kaldırıldı'
  }[a] || a;
}

/* ── Toast ──────────────────────────────────────────────────────────────── */
function _bshToast(msg, type) {
  var t = document.createElement('div');
  t.textContent = msg;
  var bg = type === 'err' ? '#EF4444' : (type === 'ok' ? '#22C55E' : 'rgba(0,0,0,.85)');
  t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:' + bg + ';color:#fff;padding:10px 16px;border-radius:999px;font:var(--fw-medium) 13px/1 var(--font);z-index:200;animation:bshSlideUp .2s ease;box-shadow:0 6px 20px rgba(0,0,0,.15);max-width:88vw';
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 2200);
}

/* ── Window exports ─────────────────────────────────────────────────────── */
window.openBizStaffShiftsEditor = openBizStaffShiftsEditor;
window.closeBizStaffShiftsEditor = closeBizStaffShiftsEditor;
window.openMyShifts = openMyShifts;
window.closeMyShifts = closeMyShifts;
window._bshEditRoutine = _bshEditRoutine;
window._bshToggleDay = _bshToggleDay;
window._bshSaveRoutine = _bshSaveRoutine;
window._bshAddExtra = _bshAddExtra;
window._bshSaveExtra = _bshSaveExtra;
window._bshDeleteExtra = _bshDeleteExtra;
window._bshAddLeave = _bshAddLeave;
window._bshPickLeaveType = _bshPickLeaveType;
window._bshSaveLeave = _bshSaveLeave;
window._bshDeleteLeave = _bshDeleteLeave;

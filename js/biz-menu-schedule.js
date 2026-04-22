/* ═══════════════════════════════════════════════════════════
   BIZ MENU SCHEDULE — Ürün Satış Zamanlaması + Combo Stok
   Hem tekil hem combo için aktif saat/gün/tarih kısıtı
   ═══════════════════════════════════════════════════════════ */

var _bms = { targetId: null, targetType: null, draft: null };

/* ─ Helpers ─ */
function _bmsDefaultSchedule() {
  return {
    enabled: false,
    type: 'daily',       // 'daily' | 'weekly' | 'monthDays' | 'dateRange'
    dailyHours: { start: '09:00', end: '22:00' },
    weekdays: [],        // 1..7 (1=Pzt, 7=Paz)
    monthDays: [],       // 1..31
    dateRange: { start: '', end: '' }
  };
}

function _bmsGet(item) {
  if (!item.schedule) item.schedule = _bmsDefaultSchedule();
  // Eksik alanları tamamla (backward-compat)
  var def = _bmsDefaultSchedule();
  ['dailyHours','weekdays','monthDays','dateRange'].forEach(function(k){
    if (item.schedule[k] == null) item.schedule[k] = def[k];
  });
  return item.schedule;
}

/* Şu an ürün zaman kısıtına göre aktif mi? */
function bmsIsActiveNow(item) {
  var s = item.schedule;
  if (!s || !s.enabled) return true;
  var now = new Date();
  if (s.type === 'daily') {
    var h = now.getHours() * 60 + now.getMinutes();
    var a = _bmsHm(s.dailyHours && s.dailyHours.start);
    var b = _bmsHm(s.dailyHours && s.dailyHours.end);
    return h >= a && h < b;
  }
  if (s.type === 'weekly') {
    var day = (now.getDay() + 6) % 7 + 1;  // 1=Pzt
    return (s.weekdays || []).indexOf(day) > -1;
  }
  if (s.type === 'monthDays') {
    return (s.monthDays || []).indexOf(now.getDate()) > -1;
  }
  if (s.type === 'dateRange') {
    if (!s.dateRange.start || !s.dateRange.end) return true;
    var today = now.toISOString().slice(0, 10);
    return today >= s.dateRange.start && today <= s.dateRange.end;
  }
  return true;
}

function _bmsHm(str) {
  if (!str) return 0;
  var p = str.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function _bmsSummary(item) {
  var s = item.schedule;
  if (!s || !s.enabled) return '';
  if (s.type === 'daily') return 'Her gün ' + (s.dailyHours.start || '—') + ' - ' + (s.dailyHours.end || '—');
  if (s.type === 'weekly') {
    var names = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
    var picked = (s.weekdays || []).slice().sort().map(function(i){ return names[i - 1]; });
    return picked.length ? picked.join(', ') : 'Gün seçilmedi';
  }
  if (s.type === 'monthDays') {
    var days = (s.monthDays || []).slice().sort(function(a,b){return a-b;});
    return days.length ? 'Ayın ' + days.join(', ') + ' günü' : 'Gün seçilmedi';
  }
  if (s.type === 'dateRange') {
    if (!s.dateRange.start || !s.dateRange.end) return 'Aralık seçilmedi';
    return _bmsFmtDate(s.dateRange.start) + ' - ' + _bmsFmtDate(s.dateRange.end);
  }
  return '';
}

function _bmsFmtDate(iso) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day:'numeric', month:'short' });
}

/* Wizard içinde gösterilen özet kart — "Satış Zamanlaması" */
function bmsSummaryCardHtml(schedule, openHandler) {
  var s = schedule || _bmsDefaultSchedule();
  var enabled = !!s.enabled;
  var summary = enabled ? _bmsSummary({ schedule: s }) : 'Her zaman satışta';
  var icon = !enabled ? 'solar:clock-circle-linear'
    : s.type === 'daily' ? 'solar:clock-circle-bold'
    : s.type === 'weekly' ? 'solar:calendar-mark-bold'
    : s.type === 'monthDays' ? 'solar:calendar-bold'
    : 'solar:calendar-date-bold';
  var color = enabled ? 'var(--primary)' : 'var(--text-muted)';
  return '<div style="padding:14px;border:1.5px dashed ' + (enabled ? 'var(--primary)' : 'var(--border-subtle)') + ';border-radius:var(--r-xl);background:' + (enabled ? 'var(--primary-soft)' : 'var(--bg-phone)') + ';display:flex;align-items:center;gap:12px;cursor:pointer" onclick="' + openHandler + '">'
    + '<div style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + (enabled ? 'var(--primary)' : 'var(--glass-card)') + '">'
    +   '<iconify-icon icon="' + icon + '" style="font-size:18px;color:' + (enabled ? '#fff' : 'var(--text-muted)') + '"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Satış Zamanlaması</div>'
    +   '<div style="font:var(--fw-regular) 11.5px/1.3 var(--font);color:' + color + ';margin-top:3px">' + summary + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-muted)"></iconify-icon>'
    + '</div>';
}

/* Küçük saat/takvim badge — liste kartında */
function bmsBadgeHtml(item) {
  var s = item.schedule;
  if (!s || !s.enabled) return '';
  var active = bmsIsActiveNow(item);
  var color = active ? '#10B981' : '#F59E0B';
  var icon = s.type === 'daily' ? 'solar:clock-circle-bold'
    : s.type === 'weekly' ? 'solar:calendar-mark-bold'
    : s.type === 'monthDays' ? 'solar:calendar-bold'
    : 'solar:calendar-date-bold';
  var label = _bmsSummary(item);
  return '<span class="bms-badge" title="' + label + '" onclick="event.stopPropagation();openBmSchedule(\'' + item.id + '\',\'' + (item._kind || 'item') + '\')">'
    + '<iconify-icon icon="' + icon + '" style="font-size:11px;color:' + color + '"></iconify-icon>'
    + '<span style="color:' + color + '">' + (active ? 'Aktif' : 'Servis dışı') + '</span>'
    + '</span>';
}

/* ─ Modal: Hızlı zamanlama düzenleme ─ */
function openBmSchedule(itemId, kind) {
  _bms.targetId = itemId;
  _bms.targetType = kind || 'item';  // 'item' (BIZ_MENU_ITEMS) veya 'combo' (BIZ_COMBO_PRODUCTS)
  var target = _bmsFindTarget();
  if (!target) return;
  _bms.draft = JSON.parse(JSON.stringify(_bmsGet(target)));
  _bmsInjectStyles();
  _bmsRender();
}

function _bmsFindTarget() {
  if (_bms.targetType === 'draft') {
    var label = (_bms.draftMeta && _bms.draftMeta.label) || 'Yeni Ürün';
    return { name: label, schedule: _bms.draft };
  }
  if (_bms.targetType === 'combo') return BIZ_COMBO_PRODUCTS.find(function(c){ return c.id === _bms.targetId; });
  return BIZ_MENU_ITEMS.find(function(m){ return m.id === _bms.targetId; });
}

/* Wizard / draft mode — henüz kaydedilmemiş ürünler için */
function openBmScheduleDraft(getSchedule, setSchedule, label) {
  _bms.targetId = null;
  _bms.targetType = 'draft';
  _bms.draftMeta = { getSchedule: getSchedule, setSchedule: setSchedule, label: label };
  _bms.draft = JSON.parse(JSON.stringify((getSchedule && getSchedule()) || _bmsDefaultSchedule()));
  _bmsInjectStyles();
  _bmsRender();
}

function _bmsRender() {
  var existing = document.getElementById('bmsModal');
  if (existing) existing.remove();
  var target = _bmsFindTarget();
  if (!target) return;
  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'bmsModal';
  m.className = 'bms-backdrop';
  m.onclick = function(e){ if (e.target === m) closeBmSchedule(); };
  m.innerHTML = '<div class="bms-modal">' + _bmsBody(target) + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _bmsBody(target) {
  var d = _bms.draft;
  var title = target.name || 'Ürün';
  var typeButtons = [
    { key:'daily',     icon:'solar:clock-circle-bold',   label:'Günlük Saat' },
    { key:'weekly',    icon:'solar:calendar-mark-bold',  label:'Haftanın Günleri' },
    { key:'monthDays', icon:'solar:calendar-bold',       label:'Ayın Günleri' },
    { key:'dateRange', icon:'solar:calendar-date-bold',  label:'Tarih Aralığı' }
  ];

  return '<div class="bms-head">'
    + '<div class="bms-head-title">'
    +   '<iconify-icon icon="solar:clock-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>'
    +   '<span>Satış Zamanlaması</span>'
    + '</div>'
    + '<div class="bms-head-sub">' + title + '</div>'
    + '<div class="bms-close" onclick="closeBmSchedule()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px"></iconify-icon></div>'
    + '</div>'
    + '<div class="bms-body">'
    +   '<div class="bms-enable-row">'
    +     '<div style="flex:1">'
    +       '<div class="bms-enable-title">Zamanlamayı Aktifleştir</div>'
    +       '<div class="bms-enable-sub">Kapalıyken ürün her zaman satışa açık görünür</div>'
    +     '</div>'
    +     _bmsSwitch(d.enabled, '_bmsToggleEnabled()')
    +   '</div>'
    +   (d.enabled ? '<div class="bms-type-grid">' + typeButtons.map(function(t){
          return '<div class="bms-type' + (d.type === t.key ? ' active' : '') + '" onclick="_bmsSetType(\'' + t.key + '\')">'
            + '<iconify-icon icon="' + t.icon + '" style="font-size:20px"></iconify-icon>'
            + '<span>' + t.label + '</span>'
            + '</div>';
        }).join('') + '</div>' : '')
    +   (d.enabled ? _bmsTypeFields(d) : '')
    +   (d.enabled ? '<div class="bms-preview"><iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#3B82F6"></iconify-icon><span><b>Özet:</b> ' + _bmsSummary({ schedule: d }) + '</span></div>' : '')
    + '</div>'
    + '<div class="bms-foot">'
    +   '<button class="bms-btn bms-btn--ghost" onclick="closeBmSchedule()">Vazgeç</button>'
    +   '<button class="bms-btn bms-btn--primary" onclick="_bmsSave()">Kaydet</button>'
    + '</div>';
}

function _bmsTypeFields(d) {
  if (d.type === 'daily') {
    return '<div class="bms-field"><label>Açılış</label><input type="time" class="bms-input" value="' + (d.dailyHours.start || '09:00') + '" onchange="_bms.draft.dailyHours.start=this.value"></div>'
      + '<div class="bms-field"><label>Kapanış</label><input type="time" class="bms-input" value="' + (d.dailyHours.end || '22:00') + '" onchange="_bms.draft.dailyHours.end=this.value"></div>';
  }
  if (d.type === 'weekly') {
    var names = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
    return '<div class="bms-days-grid">' + names.map(function(n, i){
      var day = i + 1;
      var on = (d.weekdays || []).indexOf(day) > -1;
      return '<div class="bms-day' + (on ? ' active' : '') + '" onclick="_bmsToggleDay(' + day + ')">' + n + '</div>';
    }).join('') + '</div>';
  }
  if (d.type === 'monthDays') {
    var cells = '';
    for (var i = 1; i <= 31; i++) {
      var on = (d.monthDays || []).indexOf(i) > -1;
      cells += '<div class="bms-mday' + (on ? ' active' : '') + '" onclick="_bmsToggleMonthDay(' + i + ')">' + i + '</div>';
    }
    return '<div class="bms-mdays-head">Ayın günlerini seç</div><div class="bms-mdays-grid">' + cells + '</div>';
  }
  if (d.type === 'dateRange') {
    var today = new Date().toISOString().slice(0, 10);
    return '<div class="bms-field"><label>Başlangıç</label><input type="date" class="bms-input" min="' + today + '" value="' + (d.dateRange.start || '') + '" onchange="_bms.draft.dateRange.start=this.value"></div>'
      + '<div class="bms-field"><label>Bitiş</label><input type="date" class="bms-input" min="' + today + '" value="' + (d.dateRange.end || '') + '" onchange="_bms.draft.dateRange.end=this.value"></div>';
  }
  return '';
}

function _bmsSwitch(on, handler) {
  return '<div class="bms-switch' + (on ? ' on' : '') + '" onclick="' + handler + '"><div class="bms-switch-dot"></div></div>';
}

function _bmsToggleEnabled() { _bms.draft.enabled = !_bms.draft.enabled; _bmsRender(); }
function _bmsSetType(t) { _bms.draft.type = t; _bmsRender(); }
function _bmsToggleDay(day) {
  var arr = _bms.draft.weekdays || (_bms.draft.weekdays = []);
  var idx = arr.indexOf(day);
  if (idx > -1) arr.splice(idx, 1); else arr.push(day);
  _bmsRender();
}
function _bmsToggleMonthDay(day) {
  var arr = _bms.draft.monthDays || (_bms.draft.monthDays = []);
  var idx = arr.indexOf(day);
  if (idx > -1) arr.splice(idx, 1); else arr.push(day);
  _bmsRender();
}

function _bmsSave() {
  if (_bms.targetType === 'draft') {
    if (_bms.draftMeta && typeof _bms.draftMeta.setSchedule === 'function') {
      _bms.draftMeta.setSchedule(JSON.parse(JSON.stringify(_bms.draft)));
    }
    if (typeof _admToast === 'function') _admToast('Zamanlama hazır · kaydedildiğinde uygulanır', 'ok');
    closeBmSchedule();
    return;
  }
  var target = _bmsFindTarget();
  if (!target) return;
  target.schedule = JSON.parse(JSON.stringify(_bms.draft));
  if (typeof _admToast === 'function') _admToast('Zamanlama kaydedildi', 'ok');
  closeBmSchedule();
  // Liste güncellensin
  if (typeof renderBizMenuInnerContent === 'function') {
    var list = document.getElementById('bizMenuContentArea');
    if (list) list.innerHTML = renderBizMenuInnerContent();
  }
}

function closeBmSchedule() {
  var m = document.getElementById('bmsModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 220);
}

/* ═══ COMBO STOK TOGGLE + DEPENDENCY KONTROL ═══ */
function bizToggleComboStock(comboId) {
  var combo = BIZ_COMBO_PRODUCTS.find(function(c){ return c.id === comboId; });
  if (!combo) return;
  var willActivate = combo.status !== 'active';
  if (willActivate) {
    // Bağımlılık: içerdiği tekil ürünlerden stoku olmayan var mı?
    var missing = _bmsComboMissingItems(combo);
    if (missing.length) {
      if (typeof _admToast === 'function') _admToast(missing[0].name + ' stokta değil — önce onu aktifleştir', 'err');
      else alert(missing[0].name + ' stokta değil. Önce onu aktifleştirmelisin.');
      return;
    }
  }
  combo.status = willActivate ? 'active' : 'inactive';
  if (typeof _admToast === 'function') _admToast('Grup ürün ' + (willActivate ? 'satışa açıldı' : 'satışa kapatıldı'), 'ok');
  var list = document.getElementById('bizMenuContentArea');
  if (list && typeof renderBizMenuInnerContent === 'function') list.innerHTML = renderBizMenuInnerContent();
}

function _bmsComboMissingItems(combo) {
  var missing = [];
  (combo.includedMenuItemIds || []).forEach(function(mid){
    var mi = BIZ_MENU_ITEMS.find(function(m){ return m.id === mid; });
    if (mi && mi.status !== 'active') missing.push(mi);
  });
  (combo.includedProductIds || []).forEach(function(pid){
    var p = BIZ_PRODUCTS.find(function(x){ return x.id === pid; });
    if (!p) return;
    var mi = BIZ_MENU_ITEMS.find(function(m){ return m.id === p.menuItemId; });
    if (mi && mi.status !== 'active') missing.push(mi);
  });
  return missing;
}

/* bizToggleMenuItem çağrıldığında combo bağımlılıklarını kontrol et */
function bmsCheckComboDependencies(menuItemId) {
  var mi = BIZ_MENU_ITEMS.find(function(m){ return m.id === menuItemId; });
  if (!mi || mi.status === 'active') return;  // sadece pasife alındığında
  // Bu menu item'ı içeren combo'ları bul
  var affected = BIZ_COMBO_PRODUCTS.filter(function(c){
    if (c.branchId !== bizActiveBranch) return false;
    if (c.status !== 'active') return false;
    if ((c.includedMenuItemIds || []).indexOf(menuItemId) > -1) return true;
    var prodInCombo = (c.includedProductIds || []).some(function(pid){
      var p = BIZ_PRODUCTS.find(function(x){ return x.id === pid; });
      return p && p.menuItemId === menuItemId;
    });
    return prodInCombo;
  });
  if (!affected.length) return;
  // Etki uyarısı
  var names = affected.map(function(c){ return c.name; }).join(', ');
  if (confirm('Bu menüdeki ' + mi.name + ' ürünü stokta olmadığı için ' + affected.length + ' grup ürün (' + names + ') de satışa kapatılacaktır. Onaylıyor musunuz?')) {
    affected.forEach(function(c){ c.status = 'inactive'; });
    if (typeof _admToast === 'function') _admToast(affected.length + ' grup ürün bağımlılık nedeniyle kapatıldı', 'err');
  } else {
    // İptal edildi — menu item'ı geri aç
    mi.status = 'active';
    if (typeof _admToast === 'function') _admToast('İşlem iptal edildi · ürün yeniden aktif', 'ok');
  }
}

function _bmsInjectStyles() {
  if (document.getElementById('bmsStyles')) return;
  var s = document.createElement('style');
  s.id = 'bmsStyles';
  s.textContent = [
    '.bms-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:var(--r-full);background:var(--bg-btn);font:var(--fw-bold) 9.5px/1.3 var(--font);cursor:pointer}',
    '.bms-badge:hover{filter:brightness(.95)}',
    /* Modal */
    '.bms-backdrop{position:fixed;inset:0;z-index:96;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding:0;opacity:0;transition:opacity .2s}',
    '.bms-backdrop.open{opacity:1}',
    '.bms-modal{width:100%;max-width:440px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;max-height:88vh;display:flex;flex-direction:column;transform:translateY(24px);transition:transform .28s ease}',
    '.bms-backdrop.open .bms-modal{transform:translateY(0)}',
    '.bms-head{padding:16px 18px 10px;border-bottom:1px solid var(--border-subtle);position:relative}',
    '.bms-head-title{display:flex;align-items:center;gap:8px;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)}',
    '.bms-head-sub{font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:4px}',
    '.bms-close{position:absolute;top:14px;right:14px;cursor:pointer;color:var(--text-muted)}',
    '.bms-body{padding:14px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}',
    '.bms-enable-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg)}',
    '.bms-enable-title{font:var(--fw-bold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}',
    '.bms-enable-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.bms-switch{width:44px;height:24px;border-radius:var(--r-full);background:var(--glass-card-strong);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}',
    '.bms-switch.on{background:#22C55E}',
    '.bms-switch-dot{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s}',
    '.bms-switch.on .bms-switch-dot{left:23px}',
    '.bms-type-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.bms-type{padding:12px 10px;border:1.5px solid var(--border-subtle);background:var(--bg-phone);border-radius:var(--r-lg);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;color:var(--text-secondary);transition:all .15s}',
    '.bms-type.active{border-color:var(--primary);background:var(--primary-light);color:var(--primary)}',
    '.bms-type span{font:var(--fw-semibold) 11px/1.2 var(--font)}',
    '.bms-field{display:flex;align-items:center;gap:10px}',
    '.bms-field label{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-muted);width:84px;flex-shrink:0}',
    '.bms-input{flex:1;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none;font-family:inherit}',
    '.bms-days-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}',
    '.bms-day{padding:10px 0;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);border-radius:var(--r-md);font:var(--fw-bold) 11.5px/1 var(--font);text-align:center;cursor:pointer;transition:all .15s}',
    '.bms-day.active{background:var(--primary);color:#fff;border-color:var(--primary)}',
    '.bms-mdays-head{font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted)}',
    '.bms-mdays-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}',
    '.bms-mday{aspect-ratio:1;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);border-radius:var(--r-sm);font:var(--fw-bold) 11px/1 var(--font);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}',
    '.bms-mday.active{background:var(--primary);color:#fff;border-color:var(--primary)}',
    '.bms-preview{display:flex;gap:6px;padding:10px 12px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.25);border-radius:var(--r-md);font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary)}',
    '.bms-preview b{color:var(--text-primary);font-weight:700}',
    '.bms-foot{display:flex;gap:8px;padding:14px 18px;border-top:1px solid var(--border-subtle)}',
    '.bms-btn{flex:1;padding:12px;border:none;border-radius:var(--r-lg);font:var(--fw-bold) 13px/1 var(--font);cursor:pointer}',
    '.bms-btn:active{transform:scale(.97)}',
    '.bms-btn--ghost{background:var(--bg-btn);color:var(--text-primary)}',
    '.bms-btn--primary{background:var(--primary);color:#fff}'
  ].join('\n');
  document.head.appendChild(s);
}

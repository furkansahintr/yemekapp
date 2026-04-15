/* ═══════════════════════════════════════════════════
 *  PLANLARIM — Haftalık Beslenme Planlayıcı
 *  Sepetsiz: tamamen bilgi & organizasyon amaçlı
 * ═══════════════════════════════════════════════════ */

/* ── State ── */
var _plSelectedDate = null;   // 'YYYY-MM-DD'
var _plWeekStart = null;      // Date object (Monday)
var _plView = 'week';         // week | day | add | shopping | analysis
var _plAddMeal = '';          // hangi öğüne ekleme: sabah|ogle|aksam|ara
var _plAddTab = 'tarif';     // tarif | restoran | not
var _plSearchQ = '';

var PL_MEALS = [
  { key:'sabah', label:'Kahvaltı',  icon:'solar:sunrise-bold',      color:'#F59E0B' },
  { key:'ogle',  label:'Öğle',      icon:'solar:sun-2-bold',        color:'#3B82F6' },
  { key:'aksam', label:'Akşam',     icon:'solar:moon-bold',         color:'#8B5CF6' },
  { key:'ara',   label:'Ara Öğün',  icon:'solar:cup-hot-bold',      color:'#10B981' }
];

var PL_DAYS_TR = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
var PL_DAYS_FULL = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
var PL_MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

/* ── Helpers ── */
function _plFmt(d) {
  var y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+dd;
}
function _plParse(s) { var p=s.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
function _plGetMonday(d) {
  var dt=new Date(d); var day=dt.getDay(); var diff=dt.getDate()-day+(day===0?-6:1);
  dt.setDate(diff); dt.setHours(0,0,0,0); return dt;
}
function _plToday() { var d=new Date(); d.setHours(0,0,0,0); return d; }
function _plDayData(dateStr) {
  if (!USER_PROFILE.weeklyPlan) USER_PROFILE.weeklyPlan = {};
  if (!USER_PROFILE.weeklyPlan[dateStr]) {
    USER_PROFILE.weeklyPlan[dateStr] = { meals:{ sabah:[], ogle:[], aksam:[], ara:[] }, notes:[] };
  }
  return USER_PROFILE.weeklyPlan[dateStr];
}
function _plItemInfo(item) {
  if (item.type === 'note') return { name: item.text, img: null, meta: 'Not', isNote: true };
  if (item.type === 'restoran' && item.sourceType === 'restoran') {
    var r = restaurantItems[item.idx];
    return r ? { name: r.name, img: r.img, meta: (r.restaurant?r.restaurant.name:'Restoran') + (item.note?' · '+item.note:''), isNote:false } : { name:'?', img:null, meta:'', isNote:false };
  }
  if (item.sourceType === 'myRecipe') {
    var mr = (USER_PROFILE.myRecipes||[]).find(function(x){return x.id===item.id;});
    return mr ? { name:mr.name, img:mr.img, meta:mr.prepTime+' · '+mr.difficulty, isNote:false } : { name:'?', img:null, meta:'', isNote:false };
  }
  var mi = menuItems[item.idx];
  return mi ? { name:mi.name, img:mi.img, meta:(mi.prepTime||'')+' · '+(mi.difficulty||''), isNote:false } : { name:'?', img:null, meta:'', isNote:false };
}

/* ═══ OPEN / CLOSE ═══ */
function openPlansPage() {
  _plSelectedDate = _plFmt(_plToday());
  _plWeekStart = _plGetMonday(_plToday());
  _plView = 'week';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.id = 'plansOverlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = '<div class="prof-container" style="background:var(--bg-page)"><div class="prof-topbar" id="plTopbar"></div><div id="plContent" style="flex:1;overflow-y:auto;padding:0 16px 24px;scrollbar-width:none"></div></div>';
  document.getElementById('phone').appendChild(overlay);
  _plRender();
}

function closePlansPage() {
  var o = document.getElementById('plansOverlay'); if (o) o.remove();
}

/* ═══ MAIN RENDER ═══ */
function _plRender() {
  _plRenderTopbar();
  if (_plView === 'shopping') { _plRenderShopping(); return; }
  if (_plView === 'analysis') { _plRenderAnalysis(); return; }
  if (_plView === 'add') { _plRenderAdd(); return; }
  _plRenderMain();
}

function _plRenderTopbar() {
  var tb = document.getElementById('plTopbar');
  if (!tb) return;
  var title = 'Planlarım';
  var backFn = 'closePlansPage()';
  if (_plView === 'add') { title = 'Öğüne Ekle'; backFn = '_plView="week";_plRender()'; }
  else if (_plView === 'shopping') { title = 'Alışveriş Listesi'; backFn = '_plView="week";_plRender()'; }
  else if (_plView === 'analysis') { title = 'Besin Analizi'; backFn = '_plView="week";_plRender()'; }
  tb.innerHTML = '<div class="btn-icon" onclick="'+backFn+'"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div><span class="prof-topbar-name">'+title+'</span><div style="width:36px"></div>';
}

/* ═══ WEEK + DAY VIEW ═══ */
function _plRenderMain() {
  var c = document.getElementById('plContent'); if(!c) return;
  var html = '';
  var today = _plFmt(_plToday());
  var selDate = _plParse(_plSelectedDate);

  /* ── Hafta Navigasyonu ── */
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">';
  html += '<div onclick="_plPrevWeek()" style="cursor:pointer;padding:4px"><iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon></div>';
  var wEnd = new Date(_plWeekStart); wEnd.setDate(wEnd.getDate()+6);
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">';
  html += _plWeekStart.getDate()+' '+ PL_MONTHS_TR[_plWeekStart.getMonth()] +' – '+ wEnd.getDate()+' '+ PL_MONTHS_TR[wEnd.getMonth()];
  html += '</span>';
  html += '<div onclick="_plNextWeek()" style="cursor:pointer;padding:4px"><iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:20px;color:var(--text-secondary)"></iconify-icon></div>';
  html += '</div>';

  /* ── 7 Gün Satırı ── */
  html += '<div style="display:flex;gap:4px;margin-bottom:18px">';
  for (var i=0; i<7; i++) {
    var d = new Date(_plWeekStart); d.setDate(d.getDate()+i);
    var ds = _plFmt(d);
    var isToday = ds === today;
    var isSel = ds === _plSelectedDate;
    var dayData = (USER_PROFILE.weeklyPlan||{})[ds];
    var hasMeals = dayData && Object.keys(dayData.meals||{}).some(function(k){ return (dayData.meals[k]||[]).length>0; });

    html += '<div onclick="_plSelectDay(\''+ds+'\')" style="flex:1;text-align:center;padding:10px 0;border-radius:var(--r-xl);cursor:pointer;position:relative;';
    if (isSel) html += 'background:var(--primary);';
    else if (isToday) html += 'background:var(--glass-card-strong);';
    else html += 'background:var(--glass-card);';
    html += '">';
    html += '<div style="font:var(--fw-medium) 9px/1 var(--font);color:'+(isSel?'rgba(255,255,255,.7)':'var(--text-muted)')+';margin-bottom:4px">'+PL_DAYS_TR[d.getDay()]+'</div>';
    html += '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:'+(isSel?'#fff':'var(--text-primary)')+'">'+d.getDate()+'</div>';
    if (hasMeals) html += '<div style="width:5px;height:5px;border-radius:50%;background:'+(isSel?'#fff':'var(--primary)')+';margin:4px auto 0"></div>';
    html += '</div>';
  }
  html += '</div>';

  /* ── Gün Başlığı ── */
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)">'+PL_DAYS_FULL[selDate.getDay()]+', '+selDate.getDate()+' '+PL_MONTHS_TR[selDate.getMonth()]+'</div>';
  html += '<div style="display:flex;gap:6px">';
  html += '<div onclick="_plOpenAnalysis()" style="width:32px;height:32px;border-radius:50%;background:#10B98115;display:flex;align-items:center;justify-content:center;cursor:pointer" title="Besin Analizi"><iconify-icon icon="solar:chart-2-bold" style="font-size:16px;color:#10B981"></iconify-icon></div>';
  html += '<div onclick="_plOpenShopping()" style="width:32px;height:32px;border-radius:50%;background:#3B82F615;display:flex;align-items:center;justify-content:center;cursor:pointer" title="Alışveriş Listesi"><iconify-icon icon="solar:cart-large-2-bold" style="font-size:16px;color:#3B82F6"></iconify-icon></div>';
  html += '</div></div>';

  /* ── Hazırlık Hatırlatıcısı ── */
  var reminder = _plGetPrepReminder();
  if (reminder) {
    html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:12px;background:#F59E0B10;border:1px solid #F59E0B25;border-radius:var(--r-xl);margin-bottom:14px">';
    html += '<iconify-icon icon="solar:alarm-bold" style="font-size:18px;color:#F59E0B;flex-shrink:0;margin-top:1px"></iconify-icon>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:#D97706">'+reminder+'</div>';
    html += '</div>';
  }

  /* ── Günün Notları ── */
  var dayD = _plDayData(_plSelectedDate);
  if (dayD.notes && dayD.notes.length > 0) {
    dayD.notes.forEach(function(n, ni) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--glass-card);border-radius:var(--r-lg);margin-bottom:8px;border-left:3px solid #8B5CF6">';
      html += '<iconify-icon icon="solar:notes-bold" style="font-size:16px;color:#8B5CF6;flex-shrink:0"></iconify-icon>';
      html += '<span style="flex:1;font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary)">'+n+'</span>';
      html += '<div onclick="_plRemoveNote('+ni+')" style="cursor:pointer;color:var(--text-muted)"><iconify-icon icon="solar:close-circle-linear" style="font-size:16px"></iconify-icon></div>';
      html += '</div>';
    });
  }

  /* ── Öğün Kartları ── */
  PL_MEALS.forEach(function(meal) {
    var items = (dayD.meals && dayD.meals[meal.key]) || [];
    html += '<div style="margin-bottom:14px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<iconify-icon icon="'+meal.icon+'" style="font-size:18px;color:'+meal.color+'"></iconify-icon>';
    html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">'+meal.label+'</span>';
    if (items.length > 0) html += '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-left:2px">('+items.length+')</span>';
    html += '</div>';
    html += '<div onclick="_plStartAdd(\''+meal.key+'\')" style="width:28px;height:28px;border-radius:50%;background:'+meal.color+'15;display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:add-circle-bold" style="font-size:16px;color:'+meal.color+'"></iconify-icon></div>';
    html += '</div>';

    if (items.length === 0) {
      html += '<div style="padding:16px;border:1.5px dashed var(--border-subtle);border-radius:var(--r-xl);text-align:center;cursor:pointer" onclick="_plStartAdd(\''+meal.key+'\')">';
      html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">Öğün planlanmadı</div>';
      html += '</div>';
    } else {
      items.forEach(function(item, ii) {
        var info = _plItemInfo(item);
        var isRestPlan = item.type === 'restoran' && item.sourceType === 'restoran';
        var today = _plFmt(_plToday());
        var isDueOrPast = _plSelectedDate <= today; /* string compare works for ISO YYYY-MM-DD */

        html += '<div style="padding:10px;background:var(--glass-card);border-radius:var(--r-xl);margin-bottom:6px' + (isRestPlan ? ';border-left:3px solid #F59E0B' : '') + '">';
        html += '<div style="display:flex;align-items:center;gap:10px">';
        if (info.img) {
          html += '<img src="'+info.img+'" style="width:48px;height:48px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
        } else {
          html += '<div style="width:48px;height:48px;border-radius:var(--r-lg);background:'+meal.color+'10;display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:notes-bold" style="font-size:20px;color:'+meal.color+'"></iconify-icon></div>';
        }
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+info.name+'</div>';
        html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:2px">'+info.meta+'</div>';
        if (isRestPlan) {
          html += '<div style="display:inline-flex;align-items:center;gap:3px;margin-top:4px;padding:2px 7px;border-radius:999px;background:#F59E0B15;color:#F59E0B;font:600 9px/1 var(--font)"><iconify-icon icon="solar:fork-spoon-bold" style="font-size:10px"></iconify-icon>Dışarıda Yemek Planı</div>';
        }
        html += '</div>';
        html += '<div onclick="_plRemoveMealItem(\''+meal.key+'\','+ii+')" style="cursor:pointer;color:var(--text-muted);flex-shrink:0;padding:4px"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:16px"></iconify-icon></div>';
        html += '</div>';

        /* Restoran planı + bugün/geçmiş → aksiyon butonları */
        if (isRestPlan && isDueOrPast) {
          html += '<div style="display:flex;gap:6px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--border-subtle)">';
          html += '<div onclick="_plOpenRestaurantMenu('+item.idx+')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:999px;background:var(--primary-soft);color:var(--primary);font:600 11px/1 var(--font);cursor:pointer"><iconify-icon icon="solar:menu-dots-bold" style="font-size:13px"></iconify-icon>Menüyü Görüntüle</div>';
          html += '<div onclick="_plGoToRestaurant('+item.idx+')" style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:999px;background:#F59E0B;color:#fff;font:600 11px/1 var(--font);cursor:pointer"><iconify-icon icon="solar:shop-bold" style="font-size:13px"></iconify-icon>İşletmeye Git</div>';
          html += '</div>';
        }
        html += '</div>';
      });
    }
    html += '</div>';
  });

  /* ── Not Ekle ── */
  html += '<div style="display:flex;gap:8px;margin-top:4px">';
  html += '<input type="text" id="plNoteInput" placeholder="Günün notu..." style="flex:1;padding:10px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">';
  html += '<div onclick="_plAddNote()" style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:#fff"></iconify-icon></div>';
  html += '</div>';

  c.innerHTML = html;
}

/* ── Hafta Navigasyonu ── */
function _plPrevWeek() { _plWeekStart.setDate(_plWeekStart.getDate()-7); var d=new Date(_plWeekStart); _plSelectedDate=_plFmt(d); _plRender(); }
function _plNextWeek() { _plWeekStart.setDate(_plWeekStart.getDate()+7); var d=new Date(_plWeekStart); _plSelectedDate=_plFmt(d); _plRender(); }
function _plSelectDay(ds) { _plSelectedDate = ds; _plRender(); }

/* ── Not Ekle/Sil ── */
function _plAddNote() {
  var inp = document.getElementById('plNoteInput');
  if (!inp || !inp.value.trim()) return;
  var day = _plDayData(_plSelectedDate);
  if (!day.notes) day.notes = [];
  day.notes.push(inp.value.trim());
  _plRender();
}
function _plRemoveNote(i) {
  var day = _plDayData(_plSelectedDate);
  if (day.notes) day.notes.splice(i, 1);
  _plRender();
}

/* ── Öğün Öğe Sil ── */
function _plRemoveMealItem(mealKey, idx) {
  var day = _plDayData(_plSelectedDate);
  if (day.meals && day.meals[mealKey]) day.meals[mealKey].splice(idx, 1);
  _plRender();
}

/* ── Hazırlık Hatırlatıcısı ── */
function _plGetPrepReminder() {
  var tomorrow = new Date(_plParse(_plSelectedDate));
  tomorrow.setDate(tomorrow.getDate()+1);
  var tmrStr = _plFmt(tomorrow);
  var tmrData = (USER_PROFILE.weeklyPlan||{})[tmrStr];
  if (!tmrData || !tmrData.meals) return null;
  var longRecipes = [];
  Object.keys(tmrData.meals).forEach(function(k) {
    (tmrData.meals[k]||[]).forEach(function(item) {
      if (item.type === 'recipe') {
        var info = _plItemInfo(item);
        var mi = item.sourceType === 'myRecipe' ? null : menuItems[item.idx];
        if (mi && mi.cookTime) {
          var mins = parseInt(mi.cookTime);
          if (mins >= 30 || mi.cookTime.indexOf('s') !== -1) longRecipes.push(info.name);
        }
      }
    });
  });
  if (longRecipes.length === 0) return null;
  return 'Yarın için "' + longRecipes[0] + '" planlandı. Hazırlıklara bugünden başlamayı düşünebilirsin!';
}

/* ═══ ÖĞÜNE EKLEME (Add View) ═══ */
function _plStartAdd(mealKey) {
  _plAddMeal = mealKey;
  _plAddTab = 'tarif';
  _plSearchQ = '';
  _plView = 'add';
  _plRender();
}

function _plRenderAdd() {
  var c = document.getElementById('plContent'); if(!c) return;
  var mealInfo = PL_MEALS.find(function(m){return m.key===_plAddMeal;});
  var html = '';

  /* Öğün badge */
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">';
  html += '<iconify-icon icon="'+(mealInfo?mealInfo.icon:'solar:bowl-bold')+'" style="font-size:18px;color:'+(mealInfo?mealInfo.color:'var(--primary)')+'"></iconify-icon>';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">'+(mealInfo?mealInfo.label:'')+' için ekleme yapılıyor</span>';
  html += '</div>';

  /* Tab bar: Tarif | Restoran | Not */
  html += '<div style="display:flex;gap:6px;margin-bottom:14px">';
  ['tarif','restoran','not'].forEach(function(t) {
    var lbl = t==='tarif'?'Tarif':t==='restoran'?'Restoran':'Not';
    var icon = t==='tarif'?'solar:chef-hat-bold':t==='restoran'?'solar:shop-bold':'solar:notes-bold';
    var active = _plAddTab === t;
    html += '<div onclick="_plAddTab=\''+t+'\';_plSearchQ=\'\';_plRender()" style="flex:1;padding:10px;text-align:center;border-radius:var(--r-lg);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
    html += 'background:'+(active?'var(--primary)':'var(--glass-card)')+';color:'+(active?'#fff':'var(--text-secondary)')+';font:var(--fw-medium) var(--fs-xs)/1 var(--font)">';
    html += '<iconify-icon icon="'+icon+'" style="font-size:14px"></iconify-icon>'+lbl+'</div>';
  });
  html += '</div>';

  if (_plAddTab === 'not') {
    /* Serbest not girişi */
    html += '<textarea id="plAddNoteText" placeholder="Ör: Meyve tabağı hazırla, protein bar ye..." style="width:100%;min-height:80px;padding:12px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-primary);outline:none;resize:none;box-sizing:border-box;margin-bottom:12px"></textarea>';
    html += '<button onclick="_plAddNoteToMeal()" style="width:100%;padding:14px;border:none;border-radius:var(--r-xl);background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer">Ekle</button>';
  } else {
    /* Arama */
    html += '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--glass-card);border-radius:var(--r-xl);margin-bottom:12px">';
    html += '<iconify-icon icon="solar:magnifer-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>';
    html += '<input type="text" id="plAddSearch" value="'+(_plSearchQ||'')+'" placeholder="'+(_plAddTab==='tarif'?'Tarif ara...':'Restoran ara...')+'" oninput="_plSearchQ=this.value;_plRenderAddList()" style="flex:1;border:none;outline:none;background:transparent;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary)">';
    html += '</div>';

    /* Tarif defterim (sadece tarif tabında) */
    if (_plAddTab === 'tarif') {
      var myR = USER_PROFILE.myRecipes || [];
      if (myR.length > 0 && !_plSearchQ) {
        html += '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Tariflerim</div>';
        myR.forEach(function(r) {
          html += _plAddItemCard('myRecipe', r.id, r.name, r.img, r.prepTime+' · '+r.difficulty);
        });
        html += '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px">Tüm Tarifler</div>';
      }
    }

    html += '<div id="plAddListContainer"></div>';
  }

  c.innerHTML = html;
  if (_plAddTab !== 'not') _plRenderAddList();
}

function _plRenderAddList() {
  var container = document.getElementById('plAddListContainer');
  if (!container) return;
  var q = (_plSearchQ||'').toLowerCase().trim();
  var html = '';

  if (_plAddTab === 'tarif') {
    menuItems.forEach(function(item, idx) {
      if (q && item.name.toLowerCase().indexOf(q) === -1) return;
      html += _plAddItemCard('menu', idx, item.name, item.img, (item.prepTime||'')+' · '+(item.difficulty||''));
    });
  } else {
    restaurantItems.forEach(function(item, idx) {
      if (q && item.name.toLowerCase().indexOf(q) === -1 && (!item.restaurant || item.restaurant.name.toLowerCase().indexOf(q) === -1)) return;
      html += _plAddItemCard('restoran', idx, item.name, item.img, (item.restaurant?item.restaurant.name:'') + ' · ₺' + item.price);
    });
  }

  if (!html) html = '<div style="text-align:center;padding:20px;color:var(--text-muted);font:var(--fw-regular) var(--fs-sm)/1.3 var(--font)">Sonuç bulunamadı</div>';
  container.innerHTML = html;
}

function _plAddItemCard(sourceType, idOrIdx, name, img, meta) {
  var onclick = '_plAddToMeal(\''+sourceType+'\','+(typeof idOrIdx==='number'?idOrIdx:'\''+idOrIdx+'\'')+')';
  var h = '<div onclick="'+onclick+'" style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--glass-card);border-radius:var(--r-xl);margin-bottom:6px;cursor:pointer;transition:transform .1s" onmousedown="this.style.transform=\'scale(.98)\'" onmouseup="this.style.transform=\'\'">';
  if (img) h += '<img src="'+img+'" style="width:44px;height:44px;border-radius:var(--r-lg);object-fit:cover;flex-shrink:0">';
  h += '<div style="flex:1;min-width:0"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+name+'</div>';
  h += '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:2px">'+meta+'</div></div>';
  h += '<iconify-icon icon="solar:add-circle-bold" style="font-size:20px;color:var(--primary);flex-shrink:0"></iconify-icon>';
  h += '</div>';
  return h;
}

function _plAddToMeal(sourceType, idOrIdx) {
  var day = _plDayData(_plSelectedDate);
  if (!day.meals[_plAddMeal]) day.meals[_plAddMeal] = [];
  var newItem;
  if (sourceType === 'restoran') {
    newItem = { type:'restoran', sourceType:'restoran', idx:idOrIdx, note:'' };
  } else if (sourceType === 'myRecipe') {
    newItem = { type:'recipe', sourceType:'myRecipe', id:idOrIdx, note:'' };
  } else {
    newItem = { type:'recipe', sourceType:'menu', idx:idOrIdx, note:'' };
  }
  day.meals[_plAddMeal].push(newItem);
  _plView = 'week';
  _plRender();
  if (typeof showToast === 'function') showToast('Öğüne eklendi!');
}

function _plAddNoteToMeal() {
  var ta = document.getElementById('plAddNoteText');
  if (!ta || !ta.value.trim()) return;
  var day = _plDayData(_plSelectedDate);
  if (!day.meals[_plAddMeal]) day.meals[_plAddMeal] = [];
  day.meals[_plAddMeal].push({ type:'note', text:ta.value.trim() });
  _plView = 'week';
  _plRender();
  if (typeof showToast === 'function') showToast('Not eklendi!');
}

/* ═══ AI BESİN ANALİZİ ═══ */
function _plOpenAnalysis() { _plView = 'analysis'; _plRender(); }

function _plRenderAnalysis() {
  var c = document.getElementById('plContent'); if(!c) return;
  var day = _plDayData(_plSelectedDate);
  var selDate = _plParse(_plSelectedDate);
  var html = '';

  html += '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);margin-bottom:4px">'+PL_DAYS_FULL[selDate.getDay()]+', '+selDate.getDate()+' '+PL_MONTHS_TR[selDate.getMonth()]+'</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-bottom:16px">AI tahmini besin değerleri</div>';

  /* Toplam hesapla (simülasyon) */
  var totals = { kalori:0, protein:0, yag:0, karbonhidrat:0, lif:0 };
  var mealCount = 0;
  Object.keys(day.meals||{}).forEach(function(k) {
    (day.meals[k]||[]).forEach(function(item) {
      mealCount++;
      var nut = null;
      if (item.type === 'recipe' && item.sourceType === 'menu') {
        var mi = menuItems[item.idx]; if (mi && mi.nutrition) nut = mi.nutrition;
      } else if (item.type === 'restoran') {
        var ri = restaurantItems[item.idx]; if (ri && ri.nutrition) nut = ri.nutrition;
      }
      if (nut) {
        totals.kalori += nut.kalori || 0;
        totals.protein += nut.protein || 0;
        totals.yag += nut.yag || 0;
        totals.karbonhidrat += nut.karbonhidrat || 0;
        totals.lif += nut.lif || 0;
      } else {
        totals.kalori += 350; totals.protein += 15; totals.yag += 12; totals.karbonhidrat += 40; totals.lif += 3;
      }
    });
  });

  if (mealCount === 0) {
    html += '<div style="text-align:center;padding:40px 0"><iconify-icon icon="solar:chart-2-linear" style="font-size:48px;color:var(--text-muted)"></iconify-icon>';
    html += '<div style="font:var(--fw-medium) var(--fs-md)/1.3 var(--font);color:var(--text-secondary);margin-top:12px">Henüz öğün planlanmadı</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:4px">Analiz için önce öğün ekleyin</div></div>';
    c.innerHTML = html; return;
  }

  /* Kalori ring */
  var maxKal = 2200;
  var kalPct = Math.min(Math.round(totals.kalori/maxKal*100), 100);
  html += '<div style="display:flex;align-items:center;gap:20px;padding:20px;background:var(--glass-card);border-radius:var(--r-2xl);margin-bottom:16px">';
  html += '<div style="position:relative;width:80px;height:80px;flex-shrink:0">';
  html += '<svg viewBox="0 0 36 36" style="width:80px;height:80px;transform:rotate(-90deg)"><circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-subtle)" stroke-width="3"/>';
  html += '<circle cx="18" cy="18" r="15.5" fill="none" stroke="#10B981" stroke-width="3" stroke-dasharray="'+kalPct+' 100" stroke-linecap="round"/></svg>';
  html += '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">';
  html += '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">'+totals.kalori+'</div>';
  html += '<div style="font:var(--fw-regular) 8px/1 var(--font);color:var(--text-muted)">kcal</div>';
  html += '</div></div>';
  html += '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);margin-bottom:6px">Günlük Kalori</div>';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted)">Hedef: '+maxKal+' kcal</div>';
  html += '<div style="height:4px;border-radius:2px;background:var(--border-subtle);margin-top:8px"><div style="height:100%;width:'+kalPct+'%;border-radius:2px;background:#10B981"></div></div>';
  html += '</div></div>';

  /* Makro kartları */
  var macros = [
    { label:'Protein', val:totals.protein, unit:'g', color:'#3B82F6', max:120 },
    { label:'Karbonhidrat', val:totals.karbonhidrat, unit:'g', color:'#F59E0B', max:300 },
    { label:'Yağ', val:totals.yag, unit:'g', color:'#EF4444', max:80 },
    { label:'Lif', val:totals.lif, unit:'g', color:'#10B981', max:30 }
  ];
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
  macros.forEach(function(m) {
    var pct = Math.min(Math.round(m.val/m.max*100), 100);
    html += '<div style="padding:14px;background:var(--glass-card);border-radius:var(--r-xl)">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
    html += '<span style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-secondary)">'+m.label+'</span>';
    html += '<span style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:'+m.color+'">'+m.val+m.unit+'</span>';
    html += '</div>';
    html += '<div style="height:4px;border-radius:2px;background:var(--border-subtle)"><div style="height:100%;width:'+pct+'%;border-radius:2px;background:'+m.color+'"></div></div>';
    html += '</div>';
  });
  html += '</div>';

  /* AI Yorum */
  html += '<div style="padding:14px;background:#10B98110;border:1px solid #10B98120;border-radius:var(--r-xl)">';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">';
  html += '<iconify-icon icon="solar:star-circle-bold" style="font-size:18px;color:#10B981"></iconify-icon>';
  html += '<span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#10B981">AI Değerlendirmesi</span></div>';
  var comment = '';
  if (totals.kalori < 1200) comment = 'Günlük kalori alımınız düşük görünüyor. Daha dengeli bir beslenme için öğün eklemeyi düşünebilirsiniz.';
  else if (totals.kalori > 2500) comment = 'Kalori alımı yüksek. Porsiyon kontrolü veya daha hafif alternatifler değerlendirilebilir.';
  else if (totals.protein < 40) comment = 'Protein alımınız düşük. Yumurta, tavuk veya baklagil ekleyerek dengeleyin.';
  else comment = 'Günlük beslenme planınız dengeli görünüyor. Protein ve karbonhidrat oranları iyi seviyede.';
  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-secondary)">'+comment+'</div>';
  html += '</div>';

  c.innerHTML = html;
}

/* ═══ ALIŞVERİŞ LİSTESİ ═══ */
function _plOpenShopping() { _plView = 'shopping'; _plRender(); }

function _plRenderShopping() {
  var c = document.getElementById('plContent'); if(!c) return;
  var html = '';

  /* Haftalık malzemeleri topla */
  var allIngredients = [];
  var plan = USER_PROFILE.weeklyPlan || {};
  for (var i=0; i<7; i++) {
    var d = new Date(_plWeekStart); d.setDate(d.getDate()+i);
    var ds = _plFmt(d);
    var dayData = plan[ds];
    if (!dayData || !dayData.meals) continue;
    Object.keys(dayData.meals).forEach(function(k) {
      (dayData.meals[k]||[]).forEach(function(item) {
        var ings = null;
        if (item.type === 'recipe' && item.sourceType === 'menu') {
          var mi = menuItems[item.idx];
          if (mi && mi.ing) ings = mi.ing.map(function(x){ return x.name + ' ' + (x.amount||''); });
        } else if (item.type === 'recipe' && item.sourceType === 'myRecipe') {
          var mr = (USER_PROFILE.myRecipes||[]).find(function(x){return x.id===item.id;});
          if (mr && mr.ingredients) ings = mr.ingredients;
        } else if (item.type === 'restoran') {
          var ri = restaurantItems[item.idx];
          if (ri && ri.ing) ings = ri.ing.map(function(x){ return x.name + ' ' + (x.amount||''); });
        }
        if (ings) ings.forEach(function(ing) {
          if (allIngredients.indexOf(ing) === -1) allIngredients.push(ing);
        });
      });
    });
  }

  /* Mevcut alışveriş listesi */
  if (!USER_PROFILE.shoppingList) USER_PROFILE.shoppingList = [];
  var shopList = USER_PROFILE.shoppingList;

  html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-bottom:14px">Bu haftaki tariflerinizin malzemeleri</div>';

  /* Otomatik aktar butonu */
  if (allIngredients.length > 0) {
    html += '<div onclick="_plImportIngredients()" style="display:flex;align-items:center;gap:10px;padding:12px;background:#3B82F610;border:1px solid #3B82F620;border-radius:var(--r-xl);margin-bottom:14px;cursor:pointer">';
    html += '<iconify-icon icon="solar:download-minimalistic-bold" style="font-size:18px;color:#3B82F6"></iconify-icon>';
    html += '<div style="flex:1"><div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:#3B82F6">Malzemeleri Listeye Aktar</div>';
    html += '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:2px">'+allIngredients.length+' malzeme tespit edildi</div></div>';
    html += '</div>';
  }

  /* Manuel ekleme */
  html += '<div style="display:flex;gap:8px;margin-bottom:14px">';
  html += '<input type="text" id="plShopInput" placeholder="Malzeme ekle..." style="flex:1;padding:10px 14px;border:1.5px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--glass-card);font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-primary);outline:none">';
  html += '<div onclick="_plAddShopItem()" style="width:40px;height:40px;border-radius:var(--r-lg);background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"><iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:#fff"></iconify-icon></div>';
  html += '</div>';

  /* Liste */
  if (shopList.length === 0) {
    html += '<div style="text-align:center;padding:30px 0"><iconify-icon icon="solar:cart-large-2-linear" style="font-size:40px;color:var(--text-muted)"></iconify-icon>';
    html += '<div style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-secondary);margin-top:10px">Alışveriş listeniz boş</div></div>';
  } else {
    shopList.forEach(function(item, idx) {
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--glass-card);border-radius:var(--r-lg);margin-bottom:4px">';
      html += '<div onclick="_plToggleShopItem('+idx+')" style="width:22px;height:22px;border-radius:6px;border:2px solid '+(item.done?'var(--primary)':'var(--border-subtle)')+';background:'+(item.done?'var(--primary)':'transparent')+';display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">';
      if (item.done) html += '<iconify-icon icon="solar:check-read-bold" style="font-size:14px;color:#fff"></iconify-icon>';
      html += '</div>';
      html += '<span style="flex:1;font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:'+(item.done?'var(--text-muted)':'var(--text-primary)')+';'+(item.done?'text-decoration:line-through':'')+'">'+item.name+'</span>';
      html += '<div onclick="_plRemoveShopItem('+idx+')" style="cursor:pointer;color:var(--text-muted)"><iconify-icon icon="solar:close-circle-linear" style="font-size:16px"></iconify-icon></div>';
      html += '</div>';
    });

    /* Tamamlanan sayısı */
    var doneCount = shopList.filter(function(x){return x.done;}).length;
    html += '<div style="text-align:center;padding:12px 0;font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">'+doneCount+'/'+shopList.length+' tamamlandı</div>';
  }

  c.innerHTML = html;
}

function _plAddShopItem() {
  var inp = document.getElementById('plShopInput');
  if (!inp || !inp.value.trim()) return;
  USER_PROFILE.shoppingList.push({ name:inp.value.trim(), done:false });
  _plRenderShopping();
}
function _plToggleShopItem(idx) {
  USER_PROFILE.shoppingList[idx].done = !USER_PROFILE.shoppingList[idx].done;
  _plRenderShopping();
}
function _plRemoveShopItem(idx) {
  USER_PROFILE.shoppingList.splice(idx, 1);
  _plRenderShopping();
}
function _plImportIngredients() {
  var plan = USER_PROFILE.weeklyPlan || {};
  var existing = USER_PROFILE.shoppingList.map(function(x){return x.name;});
  var added = 0;
  for (var i=0; i<7; i++) {
    var d = new Date(_plWeekStart); d.setDate(d.getDate()+i);
    var ds = _plFmt(d);
    var dayData = plan[ds];
    if (!dayData || !dayData.meals) continue;
    Object.keys(dayData.meals).forEach(function(k) {
      (dayData.meals[k]||[]).forEach(function(item) {
        var ings = null;
        if (item.type === 'recipe' && item.sourceType === 'menu') {
          var mi = menuItems[item.idx]; if (mi && mi.ing) ings = mi.ing.map(function(x){ return x.name+' '+( x.amount||''); });
        } else if (item.type === 'recipe' && item.sourceType === 'myRecipe') {
          var mr = (USER_PROFILE.myRecipes||[]).find(function(x){return x.id===item.id;});
          if (mr && mr.ingredients) ings = mr.ingredients;
        }
        if (ings) ings.forEach(function(ing) {
          if (existing.indexOf(ing) === -1) {
            USER_PROFILE.shoppingList.push({ name:ing, done:false });
            existing.push(ing);
            added++;
          }
        });
      });
    });
  }
  if (typeof showToast === 'function') showToast(added+' malzeme eklendi!');
  _plRenderShopping();
}

/* ═══════════════════════════════════════════════════════
   PLAN PICKER — Detay sayfasındaki "Plana Ekle" butonu
   Hem tarif hem restoran menü öğesi için kullanılır
   ═══════════════════════════════════════════════════════ */

var _plPicker = {
  source: null,    // 'menu' | 'restoran' | 'myRecipe'
  idx: null,       // integer index
  id: null,        // myRecipe id
  date: null,      // 'YYYY-MM-DD'
  meal: null       // sabah|ogle|aksam|ara
};

function openPlanPicker() {
  /* currentItem + currentSource detail.js'den geliyor */
  if (typeof currentItem === 'undefined' || currentItem == null) return;

  var list = (typeof getListBySource === 'function') ? getListBySource(currentSource) : null;
  var item = list ? list[currentItem] : null;
  if (!item) return;

  _plPicker = {
    source: currentSource || 'menu',
    idx: currentItem,
    id: null,
    date: _plFmt(_plToday()),
    meal: null,
    item: item
  };

  _plRenderPickerModal();
}

function closePlanPicker() {
  var el = document.getElementById('planPickerOverlay');
  if (el) el.remove();
}

function _plRenderPickerModal() {
  var existing = document.getElementById('planPickerOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'planPickerOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:250;display:flex;align-items:flex-end;justify-content:center;animation:pickerFadeIn .2s ease';

  var backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.55)';
  backdrop.onclick = closePlanPicker;
  overlay.appendChild(backdrop);

  var sheet = document.createElement('div');
  sheet.id = 'planPickerSheet';
  sheet.style.cssText = 'position:relative;z-index:1;background:var(--bg-page,#fff);border-radius:22px 22px 0 0;width:100%;max-width:430px;max-height:88vh;overflow-y:auto;box-shadow:0 -8px 32px rgba(0,0,0,.25);animation:pickerSlideUp .25s cubic-bezier(.4,0,.2,1)';
  sheet.innerHTML = '<div id="planPickerInner"></div>';
  overlay.appendChild(sheet);

  var host = document.getElementById('phone') || document.body;
  host.appendChild(overlay);
  _plPickerInject();
  _plRenderPickerInner();
}

function _plPickerInject() {
  if (document.getElementById('planPickerStyles')) return;
  var s = document.createElement('style');
  s.id = 'planPickerStyles';
  s.textContent =
    '@keyframes pickerFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes pickerSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '.pp-day{flex:1;min-width:44px;text-align:center;padding:10px 0;border-radius:14px;cursor:pointer;transition:all .15s;border:1.5px solid transparent}' +
    '.pp-day:active{transform:scale(.96)}' +
    '.pp-day.sel{background:var(--primary);color:#fff;border-color:var(--primary)}' +
    '.pp-day.today:not(.sel){background:var(--glass-card-strong);border-color:var(--primary)}' +
    '.pp-meal{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:16px;cursor:pointer;border:1.5px solid var(--border-subtle);background:var(--glass-card);transition:all .15s}' +
    '.pp-meal:active{transform:scale(.97)}' +
    '.pp-meal.sel{border-color:var(--primary);background:var(--primary-soft)}';
  document.head.appendChild(s);
}

function _plRenderPickerInner() {
  var c = document.getElementById('planPickerInner');
  if (!c) return;

  var item = _plPicker.item;
  var isRestoran = item && (item.type === 'restoran' || _plPicker.source === 'restoran');
  var itemImg = item ? item.img : '';
  var itemName = item ? item.name : '';
  var restName = (item && item.restaurant) ? item.restaurant.name : '';

  var h = '';

  /* drag handle */
  h += '<div style="display:flex;justify-content:center;padding:10px 0 4px"><div style="width:40px;height:4px;border-radius:3px;background:var(--border-subtle)"></div></div>';

  /* başlık */
  h += '<div style="padding:8px 20px 14px">' +
    '<div style="font:700 19px/1.3 var(--font);color:var(--text-primary);margin-bottom:4px">Plana Ekle</div>' +
    '<div style="font:400 12px/1.4 var(--font);color:var(--text-muted)">' +
      (isRestoran ? 'Bu yemeği hangi gün ve öğünde yemeyi planlıyorsun?' : 'Bu tarifi hangi gün ve öğünde hazırlamayı planlıyorsun?') +
    '</div>' +
    '</div>';

  /* seçilen ürün kartı */
  h += '<div style="margin:0 16px 16px;display:flex;gap:10px;padding:10px;background:var(--glass-card);border:1px solid var(--border-subtle);border-radius:14px">';
  if (itemImg) {
    h += '<img src="' + itemImg + '" style="width:54px;height:54px;border-radius:12px;object-fit:cover;flex-shrink:0">';
  } else {
    h += '<div style="width:54px;height:54px;border-radius:12px;background:var(--primary-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="solar:chef-hat-bold" style="font-size:24px;color:var(--primary)"></iconify-icon></div>';
  }
  h += '<div style="flex:1;min-width:0">' +
    '<div style="font:600 14px/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + itemName + '</div>';
  if (isRestoran && restName) {
    h += '<div style="font:500 11px/1.2 var(--font);color:var(--primary);margin-top:3px;display:flex;align-items:center;gap:4px"><iconify-icon icon="solar:shop-bold" style="font-size:12px"></iconify-icon>' + restName + '</div>';
  }
  if (isRestoran) {
    h += '<span style="display:inline-flex;align-items:center;gap:3px;margin-top:4px;padding:2px 8px;background:#F59E0B15;color:#F59E0B;border-radius:999px;font:600 10px/1 var(--font)"><iconify-icon icon="solar:fork-spoon-bold" style="font-size:10px"></iconify-icon>Dışarıda Yemek</span>';
  } else {
    h += '<span style="display:inline-flex;align-items:center;gap:3px;margin-top:4px;padding:2px 8px;background:#10B98115;color:#10B981;border-radius:999px;font:600 10px/1 var(--font)"><iconify-icon icon="solar:chef-hat-bold" style="font-size:10px"></iconify-icon>Tarif</span>';
  }
  h += '</div></div>';

  /* Haftalık takvim çizelgesi */
  h += '<div style="padding:0 16px 14px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div style="font:600 12px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Gün Seç</div>' +
      '<div style="display:flex;align-items:center;gap:6px">' +
        '<div onclick="_plPickerPrevWeek()" style="width:28px;height:28px;border-radius:50%;background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:14px"></iconify-icon></div>' +
        '<div onclick="_plPickerNextWeek()" style="width:28px;height:28px;border-radius:50%;background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon></div>' +
      '</div>' +
    '</div>' +
    '<div id="planPickerDays"></div>' +
  '</div>';

  /* Öğün seçimi (2x2 grid) */
  h += '<div style="padding:0 16px 14px">' +
    '<div style="font:600 12px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Öğün Seç</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:8px" id="planPickerMealsRow1"></div>' +
    '<div style="display:flex;gap:8px" id="planPickerMealsRow2"></div>' +
  '</div>';

  /* Aksiyon butonları */
  h += '<div style="padding:14px 16px 24px;display:flex;gap:10px;border-top:1px solid var(--border-subtle);background:var(--bg-page);position:sticky;bottom:0">' +
    '<button onclick="closePlanPicker()" style="flex:1;padding:13px;border:1.5px solid var(--border-subtle);border-radius:999px;background:transparent;color:var(--text-secondary);font:600 14px/1 var(--font);cursor:pointer">Vazgeç</button>' +
    '<button id="planPickerSubmit" onclick="_plPickerSubmit()" style="flex:2;padding:13px;border:none;border-radius:999px;background:var(--border-subtle);color:var(--text-muted);font:600 14px/1 var(--font);cursor:not-allowed;display:flex;align-items:center;justify-content:center;gap:6px;pointer-events:none">' +
      '<iconify-icon icon="solar:calendar-add-bold" style="font-size:16px"></iconify-icon><span>Plana Ekle</span>' +
    '</button>' +
  '</div>';

  c.innerHTML = h;
  _plRenderPickerDays();
  _plRenderPickerMeals();
}

/* Picker haftası state */
var _plPickerWeekStart = null;
function _plRenderPickerDays() {
  var el = document.getElementById('planPickerDays');
  if (!el) return;
  if (!_plPickerWeekStart) _plPickerWeekStart = _plGetMonday(_plToday());

  var today = _plFmt(_plToday());
  var h = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
    '<span style="font:600 12px/1 var(--font);color:var(--text-primary)">';
  var wEnd = new Date(_plPickerWeekStart); wEnd.setDate(wEnd.getDate() + 6);
  h += _plPickerWeekStart.getDate() + ' ' + PL_MONTHS_TR[_plPickerWeekStart.getMonth()] + ' – ' + wEnd.getDate() + ' ' + PL_MONTHS_TR[wEnd.getMonth()];
  h += '</span></div>';

  h += '<div style="display:flex;gap:4px">';
  for (var i = 0; i < 7; i++) {
    var d = new Date(_plPickerWeekStart); d.setDate(d.getDate() + i);
    var ds = _plFmt(d);
    var cls = 'pp-day';
    if (ds === _plPicker.date) cls += ' sel';
    else if (ds === today) cls += ' today';

    var isSel = ds === _plPicker.date;
    var isToday = ds === today;
    h += '<div class="' + cls + '" onclick="_plPickerSelectDay(\'' + ds + '\')">' +
      '<div style="font:500 9px/1 var(--font);color:' + (isSel ? 'rgba(255,255,255,.75)' : 'var(--text-muted)') + ';margin-bottom:4px">' + PL_DAYS_TR[d.getDay()] + '</div>' +
      '<div style="font:700 15px/1 var(--font);color:' + (isSel ? '#fff' : 'var(--text-primary)') + '">' + d.getDate() + '</div>' +
      (isToday && !isSel ? '<div style="font:600 8px/1 var(--font);color:var(--primary);margin-top:3px">Bugün</div>' : '') +
      '</div>';
  }
  h += '</div>';
  el.innerHTML = h;
}

function _plPickerPrevWeek() {
  if (!_plPickerWeekStart) _plPickerWeekStart = _plGetMonday(_plToday());
  _plPickerWeekStart.setDate(_plPickerWeekStart.getDate() - 7);
  _plRenderPickerDays();
}
function _plPickerNextWeek() {
  if (!_plPickerWeekStart) _plPickerWeekStart = _plGetMonday(_plToday());
  _plPickerWeekStart.setDate(_plPickerWeekStart.getDate() + 7);
  _plRenderPickerDays();
}
function _plPickerSelectDay(ds) {
  _plPicker.date = ds;
  _plRenderPickerDays();
  _plPickerUpdateSubmit();
}

function _plRenderPickerMeals() {
  var row1 = document.getElementById('planPickerMealsRow1');
  var row2 = document.getElementById('planPickerMealsRow2');
  if (!row1 || !row2) return;

  var render = function(m) {
    var isSel = _plPicker.meal === m.key;
    return '<div class="pp-meal' + (isSel ? ' sel' : '') + '" onclick="_plPickerSelectMeal(\'' + m.key + '\')">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:' + m.color + (isSel ? '2a' : '18') + ';display:flex;align-items:center;justify-content:center">' +
        '<iconify-icon icon="' + m.icon + '" style="font-size:20px;color:' + m.color + '"></iconify-icon>' +
      '</div>' +
      '<span style="font:' + (isSel ? '600' : '500') + ' 12px/1.2 var(--font);color:' + (isSel ? 'var(--text-primary)' : 'var(--text-secondary)') + '">' + m.label + '</span>' +
      (isSel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:var(--primary);position:absolute;top:-6px;right:-6px;background:var(--bg-page);border-radius:50%"></iconify-icon>' : '') +
    '</div>';
  };
  /* positioning relative */
  row1.innerHTML = PL_MEALS.slice(0, 2).map(function(m) {
    return '<div style="flex:1;position:relative">' + render(m) + '</div>';
  }).join('');
  row2.innerHTML = PL_MEALS.slice(2, 4).map(function(m) {
    return '<div style="flex:1;position:relative">' + render(m) + '</div>';
  }).join('');
}

function _plPickerSelectMeal(key) {
  _plPicker.meal = key;
  _plRenderPickerMeals();
  _plPickerUpdateSubmit();
}

function _plPickerUpdateSubmit() {
  var btn = document.getElementById('planPickerSubmit');
  if (!btn) return;
  var ready = _plPicker.date && _plPicker.meal;
  if (ready) {
    btn.style.background = 'var(--primary)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.pointerEvents = 'auto';
  } else {
    btn.style.background = 'var(--border-subtle)';
    btn.style.color = 'var(--text-muted)';
    btn.style.cursor = 'not-allowed';
    btn.style.pointerEvents = 'none';
  }
}

function _plPickerSubmit() {
  if (!_plPicker.date || !_plPicker.meal) return;

  var day = _plDayData(_plPicker.date);
  if (!day.meals[_plPicker.meal]) day.meals[_plPicker.meal] = [];

  var newItem;
  if (_plPicker.source === 'restoran') {
    /* Dışarıdan Yemek Planı — sepete eklemez, sadece dijital not */
    newItem = { type: 'restoran', sourceType: 'restoran', idx: _plPicker.idx, note: '', addedAt: Date.now() };
  } else if (_plPicker.source === 'kesfet') {
    /* Keşfet de tarif olarak davranır */
    newItem = { type: 'recipe', sourceType: 'menu', idx: _plPicker.idx, note: '', addedAt: Date.now() };
  } else {
    newItem = { type: 'recipe', sourceType: 'menu', idx: _plPicker.idx, note: '', addedAt: Date.now() };
  }
  day.meals[_plPicker.meal].push(newItem);

  /* Başarı animasyonu */
  var meal = PL_MEALS.find(function(m) { return m.key === _plPicker.meal; });
  var date = _plParse(_plPicker.date);
  var today = _plFmt(_plToday());
  var dayLabel;
  if (_plPicker.date === today) dayLabel = 'Bugün';
  else {
    var tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
    if (_plPicker.date === _plFmt(tmr)) dayLabel = 'Yarın';
    else dayLabel = date.getDate() + ' ' + PL_MONTHS_TR[date.getMonth()] + ' ' + PL_DAYS_FULL[date.getDay()];
  }

  _plRenderPickerSuccess(dayLabel, meal ? meal.label : '', meal ? meal.color : 'var(--primary)');
}

function _plRenderPickerSuccess(dayLabel, mealLabel, mealColor) {
  var c = document.getElementById('planPickerInner');
  if (!c) return;
  var item = _plPicker.item;

  var h = '<div style="display:flex;justify-content:center;padding:10px 0 4px"><div style="width:40px;height:4px;border-radius:3px;background:var(--border-subtle)"></div></div>';

  h += '<div style="padding:28px 24px 16px;text-align:center">' +
    '<div style="width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#10B981 0%,#059669 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(16,185,129,.3);animation:pickerSuccessPop .4s cubic-bezier(.2,1.2,.5,1)">' +
      '<iconify-icon icon="solar:check-read-bold" style="font-size:42px;color:#fff"></iconify-icon>' +
    '</div>' +
    '<div style="font:700 19px/1.3 var(--font);color:var(--text-primary);margin-bottom:6px">Planına eklendi!</div>' +
    '<div style="font:400 13px/1.5 var(--font);color:var(--text-secondary)">' +
      '<b>' + (item ? item.name : '') + '</b> · <span style="color:' + mealColor + ';font-weight:600">' + mealLabel + '</span> · <b>' + dayLabel + '</b>' +
    '</div>' +
    '</div>';

  /* Bilgi notu */
  h += '<div style="margin:4px 16px 16px;padding:12px 14px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.18);border-radius:12px;display:flex;gap:10px;align-items:flex-start">' +
    '<iconify-icon icon="solar:info-circle-bold" style="font-size:18px;color:#3B82F6;flex-shrink:0;margin-top:1px"></iconify-icon>' +
    '<div style="font:400 11px/1.45 var(--font);color:var(--text-secondary)">Bu bir sipariş değil, sadece dijital asistanına bir not. Sepete ürün eklenmedi.</div>' +
  '</div>';

  h += '<div style="padding:10px 16px 24px;display:flex;gap:10px">' +
    '<button onclick="closePlanPicker()" style="flex:1;padding:13px;border:1.5px solid var(--border-subtle);border-radius:999px;background:transparent;color:var(--text-secondary);font:600 14px/1 var(--font);cursor:pointer">Kapat</button>' +
    '<button onclick="closePlanPicker();closeDetail();openPlansPage()" style="flex:2;padding:13px;border:none;border-radius:999px;background:var(--primary);color:#fff;font:600 14px/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">' +
      '<iconify-icon icon="solar:calendar-bold" style="font-size:16px"></iconify-icon><span>Planlarım\'a Git</span>' +
    '</button>' +
  '</div>';

  c.innerHTML = h;

  /* success animasyon style (tek sefer) */
  if (!document.getElementById('pickerSuccessStyles')) {
    var s = document.createElement('style');
    s.id = 'pickerSuccessStyles';
    s.textContent = '@keyframes pickerSuccessPop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.1);opacity:1}100%{transform:scale(1);opacity:1}}';
    document.head.appendChild(s);
  }
}

/* ═══════════════════════════════════════════════════════
   PLANLAR DETAY — Restoran planı için aksiyon butonları
   Planlanan gün geldiğinde "Menüyü Görüntüle" / "İşletmeye Git"
   ═══════════════════════════════════════════════════════ */
function _plOpenRestaurantMenu(idx) {
  closePlansPage();
  if (typeof showDetail === 'function') {
    showDetail(idx, 'restoran');
  }
}

function _plGoToRestaurant(idx) {
  var item = restaurantItems[idx];
  if (!item) return;
  var name = item.restaurant ? item.restaurant.name : item.name;
  if (typeof showToast === 'function') showToast(name + ' sayfasına yönlendiriliyor...');
  closePlansPage();
  /* Restoranlar sekmesine geç */
  if (typeof setHomeTab === 'function') setHomeTab('restoranlar');
}

/* Window exports */
window.openPlanPicker       = openPlanPicker;
window.closePlanPicker      = closePlanPicker;
window._plPickerPrevWeek    = _plPickerPrevWeek;
window._plPickerNextWeek    = _plPickerNextWeek;
window._plPickerSelectDay   = _plPickerSelectDay;
window._plPickerSelectMeal  = _plPickerSelectMeal;
window._plPickerSubmit      = _plPickerSubmit;
window._plOpenRestaurantMenu = _plOpenRestaurantMenu;
window._plGoToRestaurant     = _plGoToRestaurant;

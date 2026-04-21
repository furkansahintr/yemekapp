/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD — Platform Genel Bakış
   ═══════════════════════════════════════════════════════════ */

function renderAdminDashboard() {
  _admInjectStyles();
  var c = document.getElementById('adminDashboardContainer');
  if (!c) return;
  var S = ADMIN_STATS;

  var html = '<div class="adm-fadeIn" style="padding:16px;display:flex;flex-direction:column;gap:14px">';

  /* Hoş geldin */
  html += '<div style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%);border-radius:var(--r-xl);padding:20px;color:#fff;position:relative;overflow:hidden">'
    + '<div style="position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.08)"></div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:.7">Hoş geldin, Admin</div>'
    + '<div style="font:var(--fw-bold) var(--fs-xl)/1.1 var(--font);margin-top:6px">Platform Özeti</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);opacity:.7;margin-top:4px">' + new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '</div>'
    + '</div>';

  /* 4 büyük KPI */
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
    + _admKpiCard('solar:bag-check-bold', '#3B82F6', 'Bugünkü Siparişler', _admFmt(S.dailyOrders), '+%12 dün')
    + _admKpiCard('solar:wallet-money-bold', '#22C55E', 'Bugünkü Gelir', _admFmtTL(S.dailyRevenue), 'Ort. ₺' + S.avgOrderValue.toFixed(0))
    + _admKpiCard('solar:shop-bold', '#A855F7', 'Aktif İşletme', _admFmt(S.activeBusinesses), S.totalBranches + ' şube')
    + _admKpiCard('solar:users-group-rounded-bold', '#F97316', 'Aktif Kullanıcı', _admFmt(S.activeUsers), _admFmt(S.totalUsers) + ' toplam')
    + '</div>';

  /* Destek Talepleri — Tile */
  if (typeof _asupTileHtml === 'function') {
    html += '<div style="display:flex;align-items:center;gap:8px">'
      + '<iconify-icon icon="solar:chat-round-dots-bold" style="font-size:18px;color:#EF4444"></iconify-icon>'
      + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Destek Talepleri</span>'
      + '</div>';
    html += _asupTileHtml();
  }

  /* Personel — Mirror Tile (Yönetim > Personel ile aynı veriyi paylaşır) */
  html += '<div style="display:flex;align-items:center;gap:8px">'
    + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Personel</span>'
    + '<span style="margin-left:auto;font:var(--fw-semibold) 9px/1 var(--font);color:#8B5CF6;background:rgba(139,92,246,.1);padding:3px 7px;border-radius:var(--r-full);letter-spacing:.3px">KISAYOL</span>'
    + '</div>';
  html += _admStaffTileHtml();

  /* Hızlı — Mirror Tile (Yönetim > Hızlı Erişim ile aynı veri ve aksiyonlar) */
  html += '<div style="display:flex;align-items:center;gap:8px">'
    + '<iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:#F97316"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Hızlı</span>'
    + '<span style="margin-left:auto;font:var(--fw-semibold) 9px/1 var(--font);color:#F97316;background:rgba(249,115,22,.1);padding:3px 7px;border-radius:var(--r-full);letter-spacing:.3px">KISAYOL</span>'
    + '</div>';
  html += _admQuickTileHtml();

  /* Yapay Zeka Asistanı — Tile */
  html += '<div onclick="_admOpenAI()" style="position:relative;border-radius:var(--r-xl);padding:16px 18px;display:flex;align-items:center;gap:14px;cursor:pointer;overflow:hidden;background:linear-gradient(135deg,#8B5CF6 0%,#3B82F6 50%,#06B6D4 100%);box-shadow:0 6px 18px rgba(139,92,246,.25)">'
    + '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 70%)"></div>'
    + '<div style="position:absolute;bottom:-25px;left:-15px;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.12) 0%,rgba(255,255,255,0) 70%)"></div>'
    + '<div style="position:relative;width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(8px)">'
    + '<iconify-icon icon="solar:magic-stick-3-bold" style="font-size:22px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;position:relative">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<span style="font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:#fff">Yapay Zeka Asistanı</span>'
    + '<span style="font:var(--fw-semibold) 9px/1 var(--font);color:#8B5CF6;background:#fff;padding:3px 6px;border-radius:var(--r-full);letter-spacing:.4px">YENİ</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:rgba(255,255,255,.85);margin-top:4px">Doğal dille analiz ve onaylı aksiyon</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:rgba(255,255,255,.7);flex-shrink:0;position:relative"></iconify-icon>'
    + '</div>';

  html += '<div style="height:20px"></div></div>';

  /* Pulse animasyonu inject */
  if (!document.getElementById('admPulseStyle')) {
    var ps = document.createElement('style');
    ps.id = 'admPulseStyle';
    ps.textContent = '@keyframes admPulse{0%,100%{opacity:1}50%{opacity:.4}}';
    document.head.appendChild(ps);
  }

  c.innerHTML = html;
}

/* ── KPI Card ── */
function _admKpiCard(icon, color, label, value, sub) {
  return '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-sm)">'
    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
    + '<iconify-icon icon="' + icon + '" style="font-size:16px;color:' + color + '"></iconify-icon>'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + label + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-bold) 22px/1 var(--font);color:var(--text-primary)">' + value + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:4px">' + sub + '</div>'
    + '</div>';
}

function _admMiniStat(label, value, color) {
  return '<div style="background:var(--bg-phone);border:1px solid ' + color + '22;border-radius:var(--r-lg);padding:12px;text-align:center">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + '">' + value + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:4px">' + label + '</div>'
    + '</div>';
}

/* ── Hızlı Tile (Genel sayfası — Yönetim > Hızlı Erişim ile aynı veri ve aksiyonlar) ── */
function _admQuickTileHtml() {
  var tiles = (typeof _admGetPriorityTiles === 'function') ? _admGetPriorityTiles() : [];
  if (!tiles.length) return '';

  var h = '<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow-sm)">';

  /* Header (tile içi mini-head) */
  h += '<div style="display:flex;align-items:center;justify-content:space-between">'
    +   '<div style="display:flex;align-items:center;gap:10px">'
    +     '<div style="width:36px;height:36px;border-radius:var(--r-lg);background:rgba(249,115,22,0.1);display:flex;align-items:center;justify-content:center">'
    +       '<iconify-icon icon="solar:rocket-bold" style="font-size:18px;color:#F97316"></iconify-icon>'
    +     '</div>'
    +     '<div>'
    +       '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Hızlı Erişim</div>'
    +       '<div style="font:var(--fw-regular) 11px/1.2 var(--font);color:var(--text-muted);margin-top:3px">En çok kullanılan ' + tiles.length + ' aksiyon</div>'
    +     '</div>'
    +   '</div>'
    +   '<span style="font:var(--fw-bold) 10px/1 var(--font);color:#F97316;background:rgba(249,115,22,.1);min-width:18px;height:18px;border-radius:var(--r-full);display:inline-flex;align-items:center;justify-content:center;padding:0 6px">' + tiles.length + '</span>'
    + '</div>';

  /* Mini tile grid — 2×2 */
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  tiles.forEach(function(t){
    h += '<div onclick="' + t.action + '" style="background:var(--bg-surface);border:1px solid ' + t.tone + '22;border-radius:var(--r-lg);padding:11px;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:all .18s;position:relative;overflow:hidden">'
      +   '<div style="display:flex;align-items:center;justify-content:space-between">'
      +     '<div style="width:30px;height:30px;border-radius:var(--r-md);background:' + t.tone + '18;display:flex;align-items:center;justify-content:center">'
      +       '<iconify-icon icon="' + t.icon + '" style="font-size:16px;color:' + t.tone + '"></iconify-icon>'
      +     '</div>'
      +     '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-tertiary)"></iconify-icon>'
      +   '</div>'
      +   '<div>'
      +     '<div style="font:var(--fw-semibold) 12px/1.15 var(--font);color:var(--text-primary)">' + t.label + '</div>'
      +     '<div style="font:var(--fw-regular) 10px/1.3 var(--font);color:' + t.tone + ';margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + t.summary + '</div>'
      +   '</div>'
      + '</div>';
  });
  h += '</div>';

  h += '</div>';
  return h;
}

/* ── Personel Tile (Genel sayfası — Yönetim > Personel ile aynı veri) ── */
function _admStaffTileHtml() {
  var total = (typeof ADMIN_STAFF !== 'undefined') ? ADMIN_STAFF.length : ((ADMIN_STATS.staff && ADMIN_STATS.staff.total) || 0);
  var activeShifts = (ADMIN_STATS.staff && ADMIN_STATS.staff.activeShifts) || 0;
  var roles = {};
  if (typeof ADMIN_STAFF !== 'undefined') {
    ADMIN_STAFF.forEach(function(s){ roles[s.r] = (roles[s.r] || 0) + 1; });
  }
  var managerN = roles.manager || 0;
  var chefN = roles.chef || 0;

  return '<div style="background:var(--bg-phone);border-radius:var(--r-xl);padding:14px;border:1px solid var(--border-subtle);cursor:pointer;display:flex;flex-direction:column;gap:10px;box-shadow:var(--shadow-sm)" onclick="_admOpenStaff()">'
    + '<div style="display:flex;align-items:center;justify-content:space-between">'
    +   '<div style="width:36px;height:36px;border-radius:var(--r-lg);background:rgba(139,92,246,0.1);display:flex;align-items:center;justify-content:center">'
    +     '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
    +   '</div>'
    +   (activeShifts > 0
        ? '<span style="display:inline-flex;align-items:center;gap:4px;font:var(--fw-bold) 10px/1 var(--font);color:#22C55E;background:rgba(34,197,94,.1);padding:4px 8px;border-radius:var(--r-full)"><span style="width:6px;height:6px;border-radius:50%;background:#22C55E;animation:admPulse 1.6s ease-in-out infinite"></span>' + activeShifts + ' vardiya</span>'
        : '')
    + '</div>'
    + '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted)">Personel Yönetimi</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + _admFmt(total) + ' Personel</div>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
    +   '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#8B5CF6">' + managerN + ' yönetici</span>'
    +   '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#F97316">' + chefN + ' şef</span>'
    +   '<span style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary)">· ekle · sil · yetki düzenle</span>'
    + '</div>'
    + '</div>';
}

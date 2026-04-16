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

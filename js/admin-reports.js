/* ═══════════════════════════════════════════════════════════
   ADMIN REPORTS — Raporlama Merkezi
   (KPI dashboard • 14 rapor • Grafik render • Stratejik metrikler)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _rpt = {
  view: 'list',                  // 'list' | 'detail'
  detailId: null,
  timeRange: '7d',               // '1d' | '7d' | '30d' | '90d' | '1y' | 'custom'
  customStart: '',
  customEnd: '',
  exportOpen: false
};

/* ═══ Overlay Aç ═══ */
function _admOpenReportCenter() {
  _admInjectStyles();
  _rptInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'rptOverlay';
  adminPhone.appendChild(overlay);

  _rpt.view = 'list';
  _rpt.detailId = null;
  _rpt.timeRange = '7d';
  _rptRender();
}

function _rptCloseOverlay() {
  var o = document.getElementById('rptOverlay');
  if (o) o.remove();
  _rptCloseExport();
}

/* ═══ Ana Render ═══ */
function _rptRender() {
  var o = document.getElementById('rptOverlay');
  if (!o) return;

  var r = _rpt.detailId ? _rptReport(_rpt.detailId) : null;
  var isDetail = _rpt.view === 'detail' && r;

  var title = isDetail ? r.name : 'Raporlama Merkezi';
  var sub = isDetail ? (r.scope || 'Rapor Detayı') : 'KPI + 14 rapor + stratejik metrikler';

  var h = '<div class="rpt-header">'
    + '<div class="rpt-back" onclick="' + (isDetail ? '_rptGoBack()' : '_rptCloseOverlay()') + '">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:chart-2-bold" style="font-size:18px;color:#0EA5E9"></iconify-icon>'
    + '<div class="rpt-title">' + _rptEsc(title) + '</div>'
    + '</div>'
    + '<div class="rpt-sub">' + _rptEsc(sub) + '</div>'
    + '</div>'
    + (isDetail
        ? '<div class="rpt-export-btn" onclick="_rptToggleExport()"><iconify-icon icon="solar:download-bold" style="font-size:18px"></iconify-icon></div>'
        : '')
    + '</div>'
    + '<div id="rptBody" style="flex:1"></div>';

  o.innerHTML = h;
  _rptRenderBody();
}

function _rptRenderBody() {
  var body = document.getElementById('rptBody');
  if (!body) return;
  if (_rpt.view === 'list') body.innerHTML = _rptRenderList();
  else body.innerHTML = _rptRenderDetail();
}

function _rptGoBack() {
  _rpt.view = 'list';
  _rpt.detailId = null;
  _rptRender();
}

/* ═══ Helpers ═══ */
function _rptEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _rptCat(id) {
  for (var i = 0; i < ADMIN_REPORT_CATEGORIES.length; i++) {
    if (ADMIN_REPORT_CATEGORIES[i].id === id) return ADMIN_REPORT_CATEGORIES[i];
  }
  return null;
}

function _rptReport(id) {
  for (var i = 0; i < ADMIN_REPORTS_CATALOG.length; i++) {
    if (ADMIN_REPORTS_CATALOG[i].id === id) return ADMIN_REPORTS_CATALOG[i];
  }
  return null;
}

function _rptFmt(n) {
  if (typeof _admFmt === 'function') return _admFmt(n);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function _rptFmtTL(n) {
  return '₺' + _rptFmt(n);
}

function _rptRelative(iso) {
  if (typeof _admRelative === 'function') return _admRelative(iso);
  return iso;
}

function _rptSliceByRange(arr) {
  if (!arr) return [];
  var rangeMap = { '1d':1, '7d':7, '30d':30, '90d':30 /* clip to 30 stored */, '1y':30 };
  var n = rangeMap[_rpt.timeRange] || arr.length;
  return arr.slice(-Math.min(n, arr.length));
}

/* ═══════════════════════════════════════
   P2 — KPI Dashboard (Hero)
   ═══════════════════════════════════════ */
function _rptRenderKPIs() {
  var k = ADMIN_REPORT_KPI;
  var kpis = [
    { label:'Bugünkü Sipariş',   val:_rptFmt(k.todayOrders.value),   delta:k.todayOrders.delta,   trend:k.todayOrders.trend,   icon:'solar:bag-check-bold',  color:'#3B82F6' },
    { label:'Aktif Kullanıcı',   val:_rptFmt(k.activeUsers.value),   delta:k.activeUsers.delta,   trend:k.activeUsers.trend,   icon:'solar:users-group-rounded-bold', color:'#8B5CF6' },
    { label:'Bugünkü Gelir',     val:_rptFmtTL(k.todayRevenue.value), delta:k.todayRevenue.delta,  trend:k.todayRevenue.trend,  icon:'solar:wallet-money-bold', color:'#22C55E' },
    { label:'Açık Şikayet',      val:_rptFmt(k.openComplaints.value), delta:k.openComplaints.delta, trend:k.openComplaints.trend, icon:'solar:shield-warning-bold', color:'#EF4444' }
  ];

  var h = '<div class="rpt-kpis">';
  for (var i = 0; i < kpis.length; i++) {
    var x = kpis[i];
    var trendColor = x.trend === 'up' ? (x.label === 'Açık Şikayet' ? '#EF4444' : '#22C55E')
                    : (x.label === 'Açık Şikayet' ? '#22C55E' : '#EF4444');
    h += '<div class="rpt-kpi" style="border-top:3px solid ' + x.color + '">'
      + '<div class="rpt-kpi-head">'
      + '<div class="rpt-kpi-ico" style="background:' + x.color + '18;color:' + x.color + '">'
      + '<iconify-icon icon="' + x.icon + '" style="font-size:14px"></iconify-icon>'
      + '</div>'
      + '<div class="rpt-kpi-lbl">' + x.label + '</div>'
      + '</div>'
      + '<div class="rpt-kpi-val">' + x.val + '</div>'
      + '<div class="rpt-kpi-delta" style="color:' + trendColor + '">'
      + '<iconify-icon icon="solar:arrow-' + (x.trend === 'up' ? 'up' : 'down') + '-bold" style="font-size:11px"></iconify-icon>'
      + Math.abs(x.delta).toFixed(1) + '% '
      + (x.trend === 'up' ? 'yukarı' : 'aşağı')
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══════════════════════════════════════
   P3 — Rapor Listesi (kategori bazlı)
   ═══════════════════════════════════════ */
function _rptRenderList() {
  var h = '<div class="adm-fadeIn rpt-wrap">';

  // KPI dashboard
  h += _rptRenderKPIs();

  // Kategori bazlı listeler
  for (var c = 0; c < ADMIN_REPORT_CATEGORIES.length; c++) {
    var cat = ADMIN_REPORT_CATEGORIES[c];
    var reports = ADMIN_REPORTS_CATALOG.filter(function(r) { return r.category === cat.id; });

    h += '<div class="rpt-cat-sect">'
      + '<div class="rpt-cat-head">'
      + '<div class="rpt-cat-ico" style="background:' + cat.color + '18;color:' + cat.color + '">'
      + '<iconify-icon icon="' + cat.icon + '" style="font-size:15px"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="rpt-cat-lbl">' + _rptEsc(cat.label) + '</div>'
      + '<div class="rpt-cat-sub">' + reports.length + ' rapor</div>'
      + '</div>'
      + '</div>'
      + '<div class="rpt-cat-list">';

    for (var i = 0; i < reports.length; i++) {
      h += _rptReportRow(reports[i], cat);
    }
    h += '</div></div>';
  }

  h += '</div>';
  return h;
}

function _rptReportRow(r, cat) {
  var chartIcon = r.chart === 'line' ? 'solar:graph-new-linear'
    : r.chart === 'bar' ? 'solar:chart-linear'
    : r.chart === 'pie' ? 'solar:pie-chart-linear'
    : r.chart === 'heatmap' ? 'solar:sun-bold'
    : r.chart === 'league' ? 'solar:cup-first-bold'
    : r.chart === 'retention' ? 'solar:users-group-two-rounded-linear'
    : 'solar:document-linear';

  return '<div class="rpt-row" onclick="_rptOpenDetail(\'' + r.id + '\')">'
    + '<div class="rpt-row-ico" style="background:' + cat.color + '10;color:' + cat.color + '">'
    + '<iconify-icon icon="' + chartIcon + '" style="font-size:15px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="rpt-row-name">' + _rptEsc(r.name) + '</div>'
    + '<div class="rpt-row-meta">'
    + '<span><iconify-icon icon="solar:calendar-linear" style="font-size:10px"></iconify-icon>' + _rptEsc(r.scope) + '</span>'
    + '<span class="rpt-row-upd"><iconify-icon icon="solar:clock-circle-linear" style="font-size:10px"></iconify-icon>Güncel: ' + _rptRelative(r.lastUpdated) + '</span>'
    + '</div>'
    + '</div>'
    + '<button class="rpt-row-cta">Detay<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:12px"></iconify-icon></button>'
    + '</div>';
}

function _rptOpenDetail(id) {
  _rpt.detailId = id;
  _rpt.view = 'detail';
  _rptRender();
  // Grafik çizimi next-tick
  setTimeout(_rptDrawCurrentChart, 30);
}

/* ═══════════════════════════════════════
   P4 — Detay Görünümü + Zaman Filtresi + Export
   ═══════════════════════════════════════ */
function _rptRenderDetail() {
  var r = _rptReport(_rpt.detailId);
  if (!r) return '';
  var cat = _rptCat(r.category) || { color:'#6B7280', label:r.category };

  var h = '<div class="adm-fadeIn rpt-wrap">';

  // Açıklama
  h += '<div class="rpt-desc" style="border-left-color:' + cat.color + '">'
    + '<iconify-icon icon="solar:info-circle-linear" style="font-size:13px;color:' + cat.color + '"></iconify-icon>'
    + '<span>' + _rptEsc(r.description || '') + '</span>'
    + '</div>';

  // Zaman filtresi chip'leri
  h += '<div class="rpt-time-filter">'
    + _rptTimeChip('1d',  'Günlük')
    + _rptTimeChip('7d',  'Haftalık')
    + _rptTimeChip('30d', 'Aylık')
    + _rptTimeChip('90d', '3 Ay')
    + _rptTimeChip('1y',  'Yıllık')
    + _rptTimeChip('custom', 'Özel')
    + '</div>';

  if (_rpt.timeRange === 'custom') {
    h += '<div class="rpt-custom-range">'
      + '<div class="rpt-field"><label>Başlangıç</label><input type="date" class="rpt-date" value="' + _rptEsc(_rpt.customStart) + '" oninput="_rpt.customStart=this.value" /></div>'
      + '<div class="rpt-field"><label>Bitiş</label><input type="date" class="rpt-date" value="' + _rptEsc(_rpt.customEnd) + '" oninput="_rpt.customEnd=this.value" /></div>'
      + '<button class="rpt-apply" onclick="_rptApplyCustom()">Uygula</button>'
      + '</div>';
  }

  // Chart kutusu
  h += '<div class="rpt-chart-box" id="rptChartBox">';

  if (r.chart === 'heatmap') {
    h += _rptRenderHeatmap();
  } else if (r.chart === 'league') {
    h += _rptRenderLeague();
  } else if (r.chart === 'retention') {
    h += _rptRenderRetention();
  } else {
    // Canvas chart (line/bar/pie)
    h += '<canvas id="rptCanvas" width="340" height="220" class="rpt-canvas"></canvas>'
      + _rptRenderLegend(r);
  }
  h += '</div>';

  // İstatistik tablosu (zaman serili raporlar için)
  if (r.series && r.series.length > 0) {
    h += _rptRenderStats(r);
  }

  // Threshold uyarısı (örn. response time)
  if (r.threshold && r.series && r.series.length > 0) {
    var arr = _rptSliceByRange(ADMIN_REPORT_TIMESERIES[r.series[0]]);
    var avg = arr.reduce(function(s,v){return s+v;}, 0) / arr.length;
    if (avg > r.threshold) {
      h += '<div class="rpt-threshold-warn">'
        + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:14px;color:#EF4444"></iconify-icon>'
        + '<span>Eşik aşımı: Ortalama <b>' + avg.toFixed(1) + ' dk</b> — limit ' + r.threshold + ' dk. Süper Admin bildirimi gönderildi.</span>'
        + '</div>';
    }
  }

  h += '</div>';
  return h;
}

function _rptTimeChip(id, label) {
  var sel = _rpt.timeRange === id;
  return '<button class="rpt-tchip' + (sel ? ' active' : '') + '" onclick="_rptSetRange(\'' + id + '\')">' + label + '</button>';
}

function _rptSetRange(r) {
  _rpt.timeRange = r;
  _rptRenderBody();
  setTimeout(_rptDrawCurrentChart, 30);
}

function _rptApplyCustom() {
  if (!_rpt.customStart || !_rpt.customEnd) { _admToast('Tarih seçin', 'err'); return; }
  _admToast('Özel aralık uygulandı: ' + _rpt.customStart + ' → ' + _rpt.customEnd, 'ok');
  _rptRenderBody();
  setTimeout(_rptDrawCurrentChart, 30);
}

function _rptRenderLegend(r) {
  if (!r.labels || r.labels.length === 0) return '';
  var h = '<div class="rpt-legend">';
  for (var i = 0; i < r.labels.length; i++) {
    h += '<div class="rpt-legend-item">'
      + '<span class="rpt-legend-dot" style="background:' + (r.colors && r.colors[i] || '#6B7280') + '"></span>'
      + _rptEsc(r.labels[i])
      + '</div>';
  }
  h += '</div>';
  return h;
}

function _rptRenderStats(r) {
  var h = '<div class="rpt-stats">';
  h += '<div class="rpt-stats-head"><iconify-icon icon="solar:calculator-bold" style="font-size:13px;color:#0EA5E9"></iconify-icon><span>Özet İstatistik</span></div>';
  h += '<div class="rpt-stats-grid">';

  for (var i = 0; i < r.series.length; i++) {
    var arr = _rptSliceByRange(ADMIN_REPORT_TIMESERIES[r.series[i]]);
    if (!arr || arr.length === 0) continue;
    var sum = arr.reduce(function(s,v){return s+v;}, 0);
    var avg = sum / arr.length;
    var max = Math.max.apply(null, arr);
    var min = Math.min.apply(null, arr);
    var color = r.colors && r.colors[i] || '#6B7280';

    h += '<div class="rpt-stat-card" style="border-left:3px solid ' + color + '">'
      + '<div class="rpt-stat-lbl">' + _rptEsc((r.labels && r.labels[i]) || r.series[i]) + '</div>'
      + '<div class="rpt-stat-grid">'
      + '<div><span>Top</span><b>' + _rptFmt(sum) + '</b></div>'
      + '<div><span>Ort</span><b>' + _rptFmt(Math.round(avg)) + '</b></div>'
      + '<div><span>Max</span><b>' + _rptFmt(max) + '</b></div>'
      + '<div><span>Min</span><b>' + _rptFmt(min) + '</b></div>'
      + '</div>'
      + '</div>';
  }
  h += '</div></div>';
  return h;
}

/* ── Export ── */
function _rptToggleExport() {
  if (_rpt.exportOpen) _rptCloseExport();
  else _rptOpenExport();
}

function _rptOpenExport() {
  _rptCloseExport();
  _rpt.exportOpen = true;
  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'rptExport';
  m.className = 'rpt-exp-backdrop';
  m.onclick = function(e) { if (e.target === m) _rptCloseExport(); };
  m.innerHTML = '<div class="rpt-exp-panel">'
    + '<div class="rpt-exp-head">'
    + '<div><div class="rpt-exp-title"><iconify-icon icon="solar:download-bold" style="font-size:16px;color:#0EA5E9"></iconify-icon>Rapor İndir</div>'
    + '<div class="rpt-exp-sub">Formatı seçin</div></div>'
    + '<div class="rpt-close" onclick="_rptCloseExport()"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon></div>'
    + '</div>'
    + '<button class="rpt-exp-btn" onclick="_rptExport(\'pdf\')"><div class="rpt-exp-ico" style="background:linear-gradient(135deg,#EF4444,#DC2626)"><iconify-icon icon="solar:file-text-bold" style="font-size:18px;color:#fff"></iconify-icon></div><div><div class="rpt-exp-lbl">PDF olarak indir</div><div class="rpt-exp-hint">Yazdırmaya hazır, formatlı belge</div></div><iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon></button>'
    + '<button class="rpt-exp-btn" onclick="_rptExport(\'xlsx\')"><div class="rpt-exp-ico" style="background:linear-gradient(135deg,#22C55E,#16A34A)"><iconify-icon icon="solar:document-bold" style="font-size:18px;color:#fff"></iconify-icon></div><div><div class="rpt-exp-lbl">Excel olarak indir</div><div class="rpt-exp-hint">Analiz için tablolu veri</div></div><iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon></button>'
    + '<button class="rpt-exp-btn" onclick="_rptExport(\'csv\')"><div class="rpt-exp-ico" style="background:linear-gradient(135deg,#3B82F6,#06B6D4)"><iconify-icon icon="solar:document-text-bold" style="font-size:18px;color:#fff"></iconify-icon></div><div><div class="rpt-exp-lbl">CSV olarak indir</div><div class="rpt-exp-hint">Ham veri, başka araçlar için</div></div><iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon></button>'
    + '</div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _rptCloseExport() {
  var m = document.getElementById('rptExport');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _rpt.exportOpen = false;
}

function _rptExport(fmt) {
  var r = _rptReport(_rpt.detailId);
  _admToast(r.name + ' · ' + fmt.toUpperCase() + ' hazırlandı (prototip)', 'ok');
  _rptCloseExport();
}

/* ═══════════════════════════════════════
   P5 — Canvas Grafikleri (Line / Bar / Pie)
   ═══════════════════════════════════════ */
function _rptDrawCurrentChart() {
  var r = _rptReport(_rpt.detailId);
  if (!r) return;
  var canvas = document.getElementById('rptCanvas');
  if (!canvas || !canvas.getContext) return;

  // HiDPI
  var dpr = window.devicePixelRatio || 1;
  var cw = canvas.clientWidth || 340;
  var ch = canvas.clientHeight || 220;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);

  if (r.chart === 'line') _rptDrawLine(ctx, cw, ch, r);
  else if (r.chart === 'bar') _rptDrawBar(ctx, cw, ch, r);
  else if (r.chart === 'pie') _rptDrawPie(ctx, cw, ch, r);
}

function _rptDrawLine(ctx, cw, ch, r) {
  var pad = { l:36, r:16, t:14, b:24 };
  var W = cw - pad.l - pad.r;
  var H = ch - pad.t - pad.b;

  // Maks değer (tüm seriler birleştirilmiş)
  var allMax = 0;
  var seriesArr = [];
  for (var i = 0; i < r.series.length; i++) {
    var a = _rptSliceByRange(ADMIN_REPORT_TIMESERIES[r.series[i]]);
    seriesArr.push(a);
    for (var j = 0; j < a.length; j++) if (a[j] > allMax) allMax = a[j];
  }
  if (allMax === 0) allMax = 1;
  // Üst yuvarlama
  allMax = Math.ceil(allMax * 1.1);

  var n = seriesArr[0].length;

  // Eksenler + grid
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.font = '9px -apple-system, system-ui, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  // Y ekseni — 4 çizgi
  for (var g = 0; g <= 4; g++) {
    var yv = pad.t + (H / 4) * g;
    ctx.beginPath();
    ctx.moveTo(pad.l, yv);
    ctx.lineTo(pad.l + W, yv);
    ctx.strokeStyle = g === 4 ? '#CBD5E1' : '#F1F5F9';
    ctx.stroke();
    var val = allMax - (allMax / 4) * g;
    ctx.fillText(_rptFmt(Math.round(val)), pad.l - 4, yv);
  }

  // Her seri için çizgi
  for (var s = 0; s < seriesArr.length; s++) {
    var arr = seriesArr[s];
    var color = (r.colors && r.colors[s]) || '#3B82F6';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var k = 0; k < arr.length; k++) {
      var x = pad.l + (W / Math.max(1, n - 1)) * k;
      var y = pad.t + H - (arr[k] / allMax) * H;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Alan doldurma
    ctx.lineTo(pad.l + W, pad.t + H);
    ctx.lineTo(pad.l, pad.t + H);
    ctx.closePath();
    ctx.fillStyle = color + '14';
    ctx.fill();

    // Noktalar
    ctx.fillStyle = color;
    for (var d = 0; d < arr.length; d++) {
      var dx = pad.l + (W / Math.max(1, n - 1)) * d;
      var dy = pad.t + H - (arr[d] / allMax) * H;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // X ekseni etiketleri (başlangıç/orta/son)
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  var labels = [n + ' gün önce', Math.ceil(n/2) + ' gün önce', 'bugün'];
  var positions = [0, Math.floor((n-1)/2), n-1];
  for (var p = 0; p < 3; p++) {
    var px = pad.l + (W / Math.max(1, n - 1)) * positions[p];
    ctx.fillText(labels[p], px, pad.t + H + 6);
  }
}

function _rptDrawBar(ctx, cw, ch, r) {
  var pad = { l:36, r:16, t:14, b:24 };
  var W = cw - pad.l - pad.r;
  var H = ch - pad.t - pad.b;

  var seriesArr = [];
  var allMax = 0;
  for (var i = 0; i < r.series.length; i++) {
    var a = _rptSliceByRange(ADMIN_REPORT_TIMESERIES[r.series[i]]);
    seriesArr.push(a);
    for (var j = 0; j < a.length; j++) if (a[j] > allMax) allMax = a[j];
  }
  if (allMax === 0) allMax = 1;
  allMax = Math.ceil(allMax * 1.1);

  var n = seriesArr[0].length;
  var groupW = W / n;
  var barW = Math.max(2, (groupW * 0.75) / seriesArr.length);
  var groupGap = groupW * 0.25;

  // Grid
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.font = '9px -apple-system, system-ui, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (var g = 0; g <= 4; g++) {
    var yv = pad.t + (H / 4) * g;
    ctx.beginPath();
    ctx.moveTo(pad.l, yv);
    ctx.lineTo(pad.l + W, yv);
    ctx.strokeStyle = g === 4 ? '#CBD5E1' : '#F1F5F9';
    ctx.stroke();
    ctx.fillText(_rptFmt(Math.round(allMax - (allMax/4) * g)), pad.l - 4, yv);
  }

  // Bars
  for (var k = 0; k < n; k++) {
    var baseX = pad.l + k * groupW + groupGap / 2;
    for (var s = 0; s < seriesArr.length; s++) {
      var val = seriesArr[s][k];
      var bh = (val / allMax) * H;
      var color = (r.colors && r.colors[s]) || '#3B82F6';
      var bx = baseX + s * barW;
      var by = pad.t + H - bh;
      // Gradient
      var grd = ctx.createLinearGradient(bx, by, bx, pad.t + H);
      grd.addColorStop(0, color);
      grd.addColorStop(1, color + 'aa');
      ctx.fillStyle = grd;
      _rptRoundRect(ctx, bx, by, barW - 1, bh, 2);
      ctx.fill();
    }
  }

  // Labels
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  var labels = [n + ' gün önce', 'bugün'];
  ctx.fillText(labels[0], pad.l + 20, pad.t + H + 6);
  ctx.fillText(labels[1], pad.l + W - 20, pad.t + H + 6);
}

function _rptDrawPie(ctx, cw, ch, r) {
  var data = r.pie || [];
  if (data.length === 0) return;
  var cx = cw / 2;
  var cy = ch / 2;
  var outerR = Math.min(cw, ch) / 2 - 16;
  var innerR = outerR * 0.55;

  var total = data.reduce(function(s, d) { return s + d.value; }, 0);
  var start = -Math.PI / 2;

  for (var i = 0; i < data.length; i++) {
    var slice = (data[i].value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, start, start + slice, false);
    ctx.arc(cx, cy, innerR, start + slice, start, true);
    ctx.closePath();
    ctx.fillStyle = data[i].color || '#6B7280';
    ctx.fill();

    // Etiket
    var midA = start + slice / 2;
    var labelR = (outerR + innerR) / 2;
    var lx = cx + Math.cos(midA) * labelR;
    var ly = cy + Math.sin(midA) * labelR;
    var pct = ((data[i].value / total) * 100).toFixed(0);
    if (pct >= 5) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px -apple-system, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pct + '%', lx, ly);
    }

    start += slice;
  }

  // Merkez toplam
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px -apple-system, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(_rptFmt(total), cx, cy - 6);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px -apple-system, system-ui, sans-serif';
  ctx.fillText('Toplam', cx, cy + 12);

  // Pie legend override — data.label bazlı
  var legendHost = document.querySelector('.rpt-legend');
  if (legendHost) {
    var h = '';
    for (var li = 0; li < data.length; li++) {
      h += '<div class="rpt-legend-item"><span class="rpt-legend-dot" style="background:' + data[li].color + '"></span>' + _rptEsc(data[li].label) + ' <b>(' + data[li].value + ')</b></div>';
    }
    legendHost.innerHTML = h;
  }
}

function _rptRoundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ═══════════════════════════════════════
   P6 — Stratejik Metrikler (Heatmap, Liga, Retention)
   ═══════════════════════════════════════ */

/* ── Isı Haritası (24h × kategori) ── */
function _rptRenderHeatmap() {
  var rows = ADMIN_REPORT_HEATMAP;

  var h = '<div class="rpt-heatmap-wrap">'
    // Saat eksenleri (her 6 saatte bir)
    + '<div class="rpt-heat-hours">'
    + '<span></span>'; // empty for label column
  for (var hh = 0; hh < 24; hh++) {
    h += '<span class="rpt-heat-hour">' + (hh % 6 === 0 ? (hh < 10 ? '0' + hh : hh) : '') + '</span>';
  }
  h += '</div>';

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    h += '<div class="rpt-heat-row">'
      + '<span class="rpt-heat-label">' + _rptEsc(row.label) + '</span>';
    for (var i = 0; i < row.hours.length; i++) {
      var v = row.hours[i];
      // Renk: açık gri → koyu mor
      var alpha = 0.05 + (v / 100) * 0.95;
      var fontColor = v > 55 ? '#fff' : '#475569';
      h += '<div class="rpt-heat-cell" style="background:rgba(139,92,246,' + alpha.toFixed(2) + ');color:' + fontColor + '" title="' + row.label + ' · ' + (i < 10 ? '0' + i : i) + ':00 · ' + v + '">'
        + (v >= 50 ? v : '')
        + '</div>';
    }
    h += '</div>';
  }

  // Legend
  h += '<div class="rpt-heat-legend">'
    + '<span>Düşük</span>'
    + '<div class="rpt-heat-scale">'
    + '<div style="background:rgba(139,92,246,0.1)"></div>'
    + '<div style="background:rgba(139,92,246,0.3)"></div>'
    + '<div style="background:rgba(139,92,246,0.5)"></div>'
    + '<div style="background:rgba(139,92,246,0.75)"></div>'
    + '<div style="background:rgba(139,92,246,1)"></div>'
    + '</div>'
    + '<span>Yüksek</span>'
    + '</div>';

  h += '</div>';
  return h;
}

/* ── İşletme Ligi (Top-10) ── */
function _rptRenderLeague() {
  var list = ADMIN_REPORT_LEAGUE;
  var h = '<div class="rpt-league">';
  for (var i = 0; i < list.length; i++) {
    var b = list[i];
    var medal = b.rank === 1 ? '🥇' : b.rank === 2 ? '🥈' : b.rank === 3 ? '🥉' : '';
    var deltaColor = b.delta > 0 ? '#22C55E' : b.delta < 0 ? '#EF4444' : '#6B7280';
    var deltaIcon = b.delta > 0 ? 'solar:arrow-up-linear' : b.delta < 0 ? 'solar:arrow-down-linear' : 'solar:minus-linear';

    h += '<div class="rpt-league-row' + (b.rank <= 3 ? ' rpt-league-row--top' : '') + '">'
      + '<div class="rpt-league-rank">' + (medal || b.rank) + '</div>'
      + '<div class="rpt-league-name">' + _rptEsc(b.name) + '</div>'
      + '<div class="rpt-league-rating"><iconify-icon icon="solar:star-bold" style="font-size:11px;color:#F59E0B"></iconify-icon>' + b.rating.toFixed(1) + '</div>'
      + '<div class="rpt-league-meta">'
      + '<span><iconify-icon icon="solar:shield-check-linear" style="font-size:10px;color:#22C55E"></iconify-icon>' + b.complaints + ' şik</span>'
      + '<span><iconify-icon icon="solar:bag-check-linear" style="font-size:10px;color:#3B82F6"></iconify-icon>' + _rptFmt(b.orders) + '</span>'
      + '</div>'
      + '<div class="rpt-league-delta" style="color:' + deltaColor + '">'
      + '<iconify-icon icon="' + deltaIcon + '" style="font-size:11px"></iconify-icon>' + Math.abs(b.delta)
      + '</div>'
      + '</div>';
  }
  h += '</div>';
  return h;
}

/* ── Retention Cohort ── */
function _rptRenderRetention() {
  var R = ADMIN_REPORT_RETENTION;
  var h = '<div class="rpt-retention">'
    + '<div class="rpt-ret-headline">'
    + '<div class="rpt-ret-big">%' + R.averageD30 + '</div>'
    + '<div class="rpt-ret-lbl">30 gün sonra hâlâ aktif</div>'
    + '</div>'
    + '<div class="rpt-ret-table">'
    + '<div class="rpt-ret-row rpt-ret-row--head">'
    + '<span>Cohort</span>'
    + '<span>D1</span>'
    + '<span>D7</span>'
    + '<span>D30</span>'
    + '<span>D90</span>'
    + '</div>';

  for (var i = 0; i < R.cohorts.length; i++) {
    var c = R.cohorts[i];
    h += '<div class="rpt-ret-row">'
      + '<span class="rpt-ret-name">' + _rptEsc(c.label) + '</span>'
      + _rptRetCell(c.D1)
      + _rptRetCell(c.D7)
      + _rptRetCell(c.D30)
      + _rptRetCell(c.D90)
      + '</div>';
  }
  h += '</div></div>';
  return h;
}

function _rptRetCell(v) {
  if (v === null || v === undefined) return '<span class="rpt-ret-cell rpt-ret-cell--na">—</span>';
  var alpha = 0.1 + (v / 100) * 0.85;
  var fc = v > 55 ? '#fff' : '#0F172A';
  return '<span class="rpt-ret-cell" style="background:rgba(34,197,94,' + alpha.toFixed(2) + ');color:' + fc + '">' + v + '%</span>';
}

/* ═══════════════════════════════════════
   P7 — Stiller (.rpt-*)
   ═══════════════════════════════════════ */
function _rptInjectStyles() {
  if (document.getElementById('rptStyles')) return;
  var css = ''
    + '.rpt-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px}'
    /* Header */
    + '.rpt-header{position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10}'
    + '.rpt-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.rpt-title{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.rpt-sub{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.rpt-export-btn{width:38px;height:38px;border-radius:var(--r-md);background:linear-gradient(135deg,#0EA5E9,#06B6D4);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(14,165,233,0.3);flex-shrink:0;transition:transform .15s}'
    + '.rpt-export-btn:active{transform:scale(0.95)}'
    /* KPIs */
    + '.rpt-kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.rpt-kpi{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}'
    + '.rpt-kpi-head{display:flex;align-items:center;gap:6px}'
    + '.rpt-kpi-ico{width:24px;height:24px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.rpt-kpi-lbl{font:var(--fw-semibold) 10px/1.2 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.rpt-kpi-val{font:var(--fw-bold) 22px/1 var(--font);color:var(--text-primary)}'
    + '.rpt-kpi-delta{font:var(--fw-semibold) 10px/1 var(--font);display:inline-flex;align-items:center;gap:3px}'
    /* Cat sect */
    + '.rpt-cat-sect{display:flex;flex-direction:column;gap:8px}'
    + '.rpt-cat-head{display:flex;align-items:center;gap:10px;padding:2px}'
    + '.rpt-cat-ico{width:30px;height:30px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.rpt-cat-lbl{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.rpt-cat-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.rpt-cat-list{display:flex;flex-direction:column;gap:4px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:4px;overflow:hidden}'
    /* Row */
    + '.rpt-row{display:flex;align-items:center;gap:10px;padding:10px 10px;border-radius:var(--r-md);cursor:pointer;transition:background .15s}'
    + '.rpt-row:hover{background:var(--bg-phone-secondary)}'
    + '.rpt-row-ico{width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.rpt-row-name{font:var(--fw-semibold) var(--fs-xs)/1.2 var(--font);color:var(--text-primary)}'
    + '.rpt-row-meta{display:flex;gap:10px;flex-wrap:wrap;font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.rpt-row-meta span{display:inline-flex;align-items:center;gap:3px}'
    + '.rpt-row-upd{color:var(--text-muted)}'
    + '.rpt-row-cta{padding:6px 10px;border:1px solid #0EA5E9;background:rgba(14,165,233,0.06);color:#0EA5E9;border-radius:var(--r-full);font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:3px;flex-shrink:0;transition:all .15s}'
    + '.rpt-row-cta:hover{background:#0EA5E9;color:#fff}'
    /* Desc */
    + '.rpt-desc{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;border-radius:var(--r-md);background:var(--bg-phone-secondary);border-left:3px solid;font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    /* Time filter */
    + '.rpt-time-filter{display:flex;gap:4px;padding:4px;background:var(--bg-phone-secondary);border-radius:var(--r-lg);overflow-x:auto}'
    + '.rpt-tchip{padding:8px 10px;border-radius:var(--r-md);border:none;background:transparent;color:var(--text-muted);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0}'
    + '.rpt-tchip.active{background:var(--bg-phone);color:#0EA5E9;box-shadow:var(--shadow-sm)}'
    + '.rpt-custom-range{display:flex;align-items:flex-end;gap:6px}'
    + '.rpt-field{display:flex;flex-direction:column;gap:3px;flex:1}'
    + '.rpt-field label{font:var(--fw-semibold) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.rpt-date{padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) 11px/1 var(--font);color:var(--text-primary);outline:none;width:100%;box-sizing:border-box}'
    + '.rpt-apply{padding:10px 14px;border:none;border-radius:var(--r-md);background:#0EA5E9;color:#fff;font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer}'
    /* Chart box */
    + '.rpt-chart-box{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:10px}'
    + '.rpt-canvas{width:100%;height:220px;display:block}'
    + '.rpt-legend{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding-top:6px;border-top:1px solid var(--border-subtle)}'
    + '.rpt-legend-item{display:inline-flex;align-items:center;gap:5px;font:var(--fw-medium) 10px/1 var(--font);color:var(--text-secondary)}'
    + '.rpt-legend-dot{width:10px;height:10px;border-radius:50%}'
    /* Stats */
    + '.rpt-stats{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;display:flex;flex-direction:column;gap:10px}'
    + '.rpt-stats-head{display:flex;align-items:center;gap:5px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.rpt-stats-grid{display:flex;flex-direction:column;gap:6px}'
    + '.rpt-stat-card{padding:10px 12px;background:var(--bg-phone-secondary);border-radius:var(--r-md)}'
    + '.rpt-stat-lbl{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary);margin-bottom:6px}'
    + '.rpt-stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}'
    + '.rpt-stat-grid>div{text-align:center;padding:5px;background:var(--bg-phone);border-radius:var(--r-sm)}'
    + '.rpt-stat-grid span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);display:block;text-transform:uppercase;letter-spacing:.3px}'
    + '.rpt-stat-grid b{font:var(--fw-bold) 12px/1 var(--font);color:var(--text-primary);display:block;margin-top:3px}'
    /* Threshold warn */
    + '.rpt-threshold-warn{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:var(--r-md);background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);font:var(--fw-medium) 11px/1.4 var(--font);color:#B91C1C}'
    + '.rpt-threshold-warn b{color:#EF4444}';
  var s = document.createElement('style');
  s.id = 'rptStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _rptInjectStylesPart2();
}

function _rptInjectStylesPart2() {
  if (document.getElementById('rptStyles2')) return;
  var css = ''
    /* Heatmap */
    + '.rpt-heatmap-wrap{overflow-x:auto;display:flex;flex-direction:column;gap:3px}'
    + '.rpt-heat-hours{display:grid;grid-template-columns:90px repeat(24,1fr);gap:2px;padding-left:2px;min-width:520px}'
    + '.rpt-heat-hour{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-align:center}'
    + '.rpt-heat-row{display:grid;grid-template-columns:90px repeat(24,1fr);gap:2px;min-width:520px}'
    + '.rpt-heat-label{font:var(--fw-semibold) 10px/1.2 var(--font);color:var(--text-primary);align-self:center;padding-right:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.rpt-heat-cell{height:20px;border-radius:2px;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 8px/1 var(--font);transition:transform .15s;cursor:default}'
    + '.rpt-heat-cell:hover{transform:scale(1.2);z-index:2}'
    + '.rpt-heat-legend{display:flex;align-items:center;gap:6px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:6px}'
    + '.rpt-heat-scale{display:flex;gap:2px}'
    + '.rpt-heat-scale>div{width:20px;height:10px;border-radius:2px}'
    /* League */
    + '.rpt-league{display:flex;flex-direction:column;gap:4px}'
    + '.rpt-league-row{display:grid;grid-template-columns:34px 1.2fr 50px 1fr 30px;gap:8px;align-items:center;padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);transition:background .15s}'
    + '.rpt-league-row:hover{background:rgba(139,92,246,0.06)}'
    + '.rpt-league-row--top{background:linear-gradient(to right,rgba(245,158,11,0.08),transparent 60%);border:1px solid rgba(245,158,11,0.2)}'
    + '.rpt-league-rank{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);text-align:center}'
    + '.rpt-league-name{font:var(--fw-semibold) 11px/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.rpt-league-rating{display:inline-flex;align-items:center;gap:3px;font:var(--fw-bold) 11px/1 var(--font);color:var(--text-primary)}'
    + '.rpt-league-meta{display:flex;gap:8px;font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);justify-content:flex-end}'
    + '.rpt-league-meta span{display:inline-flex;align-items:center;gap:2px}'
    + '.rpt-league-delta{font:var(--fw-bold) 10px/1 var(--font);display:inline-flex;align-items:center;gap:2px;justify-content:center}'
    /* Retention */
    + '.rpt-retention{display:flex;flex-direction:column;gap:10px}'
    + '.rpt-ret-headline{display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(34,197,94,0.08),transparent 70%);border:1px solid rgba(34,197,94,0.25)}'
    + '.rpt-ret-big{font:var(--fw-bold) 28px/1 var(--font);color:#22C55E}'
    + '.rpt-ret-lbl{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary)}'
    + '.rpt-ret-table{display:flex;flex-direction:column;gap:3px}'
    + '.rpt-ret-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:3px;align-items:center}'
    + '.rpt-ret-row--head{padding:6px 0;font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.rpt-ret-row--head span{text-align:center;padding:4px}'
    + '.rpt-ret-row--head span:first-child{text-align:left}'
    + '.rpt-ret-name{font:var(--fw-semibold) 11px/1 var(--font);color:var(--text-primary);padding:8px 0}'
    + '.rpt-ret-cell{font:var(--fw-bold) 11px/1 var(--font);padding:10px;text-align:center;border-radius:var(--r-sm)}'
    + '.rpt-ret-cell--na{background:var(--bg-phone-secondary);color:var(--text-muted)}'
    /* Export */
    + '.rpt-exp-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:88;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.rpt-exp-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.rpt-exp-panel{width:100%;max-height:65vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;padding:14px 16px;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;gap:8px}'
    + '.rpt-exp-backdrop.open .rpt-exp-panel{transform:translateY(0)}'
    + '.rpt-exp-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:8px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.rpt-exp-title{display:inline-flex;align-items:center;gap:6px;font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.rpt-exp-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.rpt-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.rpt-exp-btn{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);cursor:pointer;text-align:left;transition:all .15s;width:100%}'
    + '.rpt-exp-btn:hover{background:var(--bg-phone-secondary);transform:translateY(-1px)}'
    + '.rpt-exp-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.rpt-exp-lbl{font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.rpt-exp-hint{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}';
  var s = document.createElement('style');
  s.id = 'rptStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

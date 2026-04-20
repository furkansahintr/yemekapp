/* ═══════════════════════════════════════════════════════════
   BIZ DASHBOARD — 4 Ana Bölüm:
   1) Finansal Özet  2) Operasyonel Yoğunluk
   3) Menü & Ürün   4) İK & AI
   Zaman filtresi: daily / weekly / monthly
   ═══════════════════════════════════════════════════════════ */

var _bdash = { period: 'daily' };

/* ─ Entry — app.js switchTab('dashboard') için hem eski renderBizDashboard'u hem
   yeni _bdashRender'ı çağırır. ─ */
function renderBizDashboard() {
  _bdashInjectStyles();
  _bdashRender();
}

function _bdashRender() {
  var root = document.getElementById('bizDashboardRoot');
  if (!root) return;
  root.innerHTML = _bdashPeriodBar()
    + _bdashSection1_Finance()
    + _bdashSection2_Operations()
    + _bdashSection3_Menu()
    + _bdashSection4_HrAi();
}

function _bdashSetPeriod(p) { _bdash.period = p; _bdashRender(); }

/* ─ Helpers ─ */
function _bdashFmt(n) { return '₺' + Math.round(n).toLocaleString('tr-TR'); }
function _bdashPct(cur, prev) {
  if (!prev) return 0;
  return Math.round(((cur - prev) / prev) * 100);
}
function _bdashP() { return BIZ_DASHBOARD_EXT.periods[_bdash.period]; }

/* ═══ PERIOD BAR ═══ */
function _bdashPeriodBar() {
  var opts = [
    { k: 'daily',   lbl: 'Günlük' },
    { k: 'weekly',  lbl: 'Haftalık' },
    { k: 'monthly', lbl: 'Aylık' }
  ];
  return '<div class="bdash-period-bar">'
    + opts.map(function(o){
        var active = _bdash.period === o.k;
        return '<div class="bdash-period-opt' + (active ? ' active' : '') + '" onclick="_bdashSetPeriod(\'' + o.k + '\')">' + o.lbl + '</div>';
      }).join('')
    + '</div>';
}

/* ═══ 1) FİNANSAL ÖZET ═══ */
function _bdashSection1_Finance() {
  var p = _bdashP();
  var pctRev = _bdashPct(p.revenue, p.prevRevenue);
  var pctOrd = _bdashPct(p.orders, p.prevOrders);
  var total = p.channelRevenue.online + p.channelRevenue.table;
  var onlinePct = total ? Math.round((p.channelRevenue.online / total) * 100) : 0;
  var tablePct = 100 - onlinePct;

  // Line chart SVG
  var chart = _bdashLineChart(p.series);

  return '<div class="bdash-section">'
    + _bdashSectionHeader('solar:chart-square-bold', '#22C55E', 'Finansal Özet', p.label + ' · ' + p.prevLabel + ' kıyası')

    + '<div class="bdash-card bdash-finance-hero">'
    +   '<div>'
    +     '<div class="bdash-lbl">TOPLAM KAZANÇ</div>'
    +     '<div class="bdash-big">' + _bdashFmt(p.revenue) + '</div>'
    +     '<div class="bdash-delta ' + (pctRev >= 0 ? 'up' : 'down') + '">'
    +       '<iconify-icon icon="' + (pctRev >= 0 ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold') + '" style="font-size:13px"></iconify-icon>'
    +       '%' + Math.abs(pctRev) + ' ' + (pctRev >= 0 ? 'artış' : 'azalış') + ' · ' + p.prevLabel
    +     '</div>'
    +   '</div>'
    +   '<div class="bdash-order-delta">'
    +     '<div class="bdash-sub-lbl">Sipariş</div>'
    +     '<div class="bdash-sub-big">' + p.orders + '</div>'
    +     '<div class="bdash-delta ' + (pctOrd >= 0 ? 'up' : 'down') + '">' + (pctOrd >= 0 ? '+' : '') + pctOrd + '%</div>'
    +   '</div>'
    + '</div>'

    // Kanal dağılımı — Online vs Masa
    + '<div class="bdash-grid-2">'
    +   '<div class="bdash-card bdash-channel">'
    +     '<div class="bdash-channel-row"><iconify-icon icon="solar:scooter-bold" style="font-size:18px;color:#3B82F6"></iconify-icon><span>Online</span></div>'
    +     '<div class="bdash-channel-val">' + _bdashFmt(p.channelRevenue.online) + '</div>'
    +     '<div class="bdash-channel-bar"><div class="bdash-channel-fill" style="width:' + onlinePct + '%;background:#3B82F6"></div></div>'
    +     '<div class="bdash-channel-pct">%' + onlinePct + '</div>'
    +   '</div>'
    +   '<div class="bdash-card bdash-channel">'
    +     '<div class="bdash-channel-row"><iconify-icon icon="solar:sofa-2-bold" style="font-size:18px;color:#F97316"></iconify-icon><span>Masa (QR)</span></div>'
    +     '<div class="bdash-channel-val">' + _bdashFmt(p.channelRevenue.table) + '</div>'
    +     '<div class="bdash-channel-bar"><div class="bdash-channel-fill" style="width:' + tablePct + '%;background:#F97316"></div></div>'
    +     '<div class="bdash-channel-pct">%' + tablePct + '</div>'
    +   '</div>'
    + '</div>'

    + '<div class="bdash-card">'
    +   '<div class="bdash-card-title">Kıyaslama Çizgisi</div>'
    +   '<div class="bdash-card-sub">' + (_bdash.period === 'monthly' ? 'Son 4 hafta' : 'Son 7 gün') + '</div>'
    +   chart
    + '</div>'

    + '</div>';
}

/* ─ Basit SVG line chart ─ */
function _bdashLineChart(series) {
  if (!series || !series.length) return '';
  var w = 320, h = 100, pad = 10;
  var max = Math.max.apply(null, series);
  var min = Math.min.apply(null, series);
  var span = max - min || 1;
  var step = (w - pad * 2) / (series.length - 1);
  var pts = series.map(function(v, i){
    var x = pad + i * step;
    var y = pad + (h - pad * 2) * (1 - (v - min) / span);
    return x + ',' + y;
  });
  var areaPts = pts.concat([(pad + (series.length - 1) * step) + ',' + (h - pad), pad + ',' + (h - pad)]);
  return '<svg class="bdash-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">'
    + '<defs><linearGradient id="bdgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22C55E" stop-opacity=".35"/><stop offset="100%" stop-color="#22C55E" stop-opacity="0"/></linearGradient></defs>'
    + '<polygon points="' + areaPts.join(' ') + '" fill="url(#bdgrad)"/>'
    + '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#22C55E" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
    + pts.map(function(p){ var xy = p.split(','); return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="2.5" fill="#fff" stroke="#22C55E" stroke-width="1.5"/>'; }).join('')
    + '</svg>';
}

/* ═══ 2) OPERASYONEL YOĞUNLUK ═══ */
function _bdashSection2_Operations() {
  return '<div class="bdash-section">'
    + _bdashSectionHeader('solar:fire-bold', '#EF4444', 'Operasyonel Yoğunluk', 'Yoğun saatler, bölgeler ve masalar')

    // Heatmap
    + '<div class="bdash-card">'
    +   '<div class="bdash-card-title">Saat × Gün Yoğunluk Haritası</div>'
    +   '<div class="bdash-card-sub">Kırmızı = yoğun · Yeşil = boş</div>'
    +   _bdashHeatmap()
    + '</div>'

    // Top districts + Top tables (grid)
    + '<div class="bdash-grid-2">'
    +   '<div class="bdash-card">'
    +     '<div class="bdash-card-title" style="display:flex;align-items:center;gap:6px"><iconify-icon icon="solar:map-point-bold" style="font-size:16px;color:#3B82F6"></iconify-icon>Yoğun Bölgeler</div>'
    +     '<div class="bdash-bar-list">'
    +     BIZ_DASHBOARD_EXT.topDistricts.slice(0,4).map(function(d, i){
            var max = BIZ_DASHBOARD_EXT.topDistricts[0].count;
            return '<div class="bdash-bar-row"><span class="bdash-bar-lbl">' + d.name + '</span><div class="bdash-bar-track"><div class="bdash-bar-fill" style="width:' + (d.count / max * 100) + '%;background:#3B82F6"></div></div><span class="bdash-bar-val">' + d.count + '</span></div>';
          }).join('')
    +     '</div>'
    +   '</div>'
    +   '<div class="bdash-card">'
    +     '<div class="bdash-card-title" style="display:flex;align-items:center;gap:6px"><iconify-icon icon="solar:sofa-2-bold" style="font-size:16px;color:#F97316"></iconify-icon>Popüler Masalar</div>'
    +     '<div class="bdash-bar-list">'
    +     BIZ_DASHBOARD_EXT.topTables.map(function(t, i){
            var max = BIZ_DASHBOARD_EXT.topTables[0].revenue;
            return '<div class="bdash-bar-row"><span class="bdash-bar-lbl">Masa ' + t.tableNo + '</span><div class="bdash-bar-track"><div class="bdash-bar-fill" style="width:' + (t.revenue / max * 100) + '%;background:#F97316"></div></div><span class="bdash-bar-val">' + _bdashFmt(t.revenue) + '</span></div>';
          }).join('')
    +     '</div>'
    +   '</div>'
    + '</div>'

    // Retention donut + Visitors
    + '<div class="bdash-grid-2">'
    +   '<div class="bdash-card">'
    +     '<div class="bdash-card-title">Geri Dönüş Oranı</div>'
    +     _bdashDonut(BIZ_DASHBOARD_EXT.retention)
    +   '</div>'
    +   '<div class="bdash-card">'
    +     '<div class="bdash-card-title">Ziyaretçi Karşılaştırma</div>'
    +     _bdashVisitorsChart()
    +   '</div>'
    + '</div>'

    + '</div>';
}

function _bdashHeatmap() {
  var hm = BIZ_DASHBOARD_EXT.heatmap;
  var rows = '';
  // Hours row
  rows += '<div class="bdash-hm-row bdash-hm-head"><div class="bdash-hm-day"></div>';
  hm.hours.forEach(function(h){ rows += '<div class="bdash-hm-hr">' + h + '</div>'; });
  rows += '</div>';
  // Data rows
  hm.days.forEach(function(day, di){
    rows += '<div class="bdash-hm-row"><div class="bdash-hm-day">' + day + '</div>';
    hm.matrix[di].forEach(function(v){
      var color = _bdashHeatColor(v);
      rows += '<div class="bdash-hm-cell" style="background:' + color + '" title="' + day + ' ' + hm.hours[0] + ':00 · ' + v + '/10"></div>';
    });
    rows += '</div>';
  });
  return '<div class="bdash-heatmap">' + rows + '</div>';
}

function _bdashHeatColor(v) {
  // v 0..10 — yeşilden kırmızıya
  var pct = Math.min(Math.max(v / 10, 0), 1);
  // 0 = yeşil (#22C55E) · 0.5 = sarı (#F59E0B) · 1 = kırmızı (#EF4444)
  var r, g, b;
  if (pct < 0.5) {
    var t = pct / 0.5;
    r = Math.round(0x22 + (0xF5 - 0x22) * t);
    g = Math.round(0xC5 + (0x9E - 0xC5) * t);
    b = Math.round(0x5E + (0x0B - 0x5E) * t);
  } else {
    var t2 = (pct - 0.5) / 0.5;
    r = Math.round(0xF5 + (0xEF - 0xF5) * t2);
    g = Math.round(0x9E + (0x44 - 0x9E) * t2);
    b = Math.round(0x0B + (0x44 - 0x0B) * t2);
  }
  return 'rgba(' + r + ',' + g + ',' + b + ',' + (0.25 + pct * 0.65) + ')';
}

function _bdashDonut(ret) {
  var radius = 38;
  var circ = 2 * Math.PI * radius;
  var first = (ret.firstTime / 100) * circ;
  var second = (ret.secondTime / 100) * circ;
  var third = (ret.returning / 100) * circ;
  var cx = 56, cy = 56;
  return '<div style="display:flex;align-items:center;gap:14px">'
    + '<svg width="112" height="112" viewBox="0 0 112 112">'
    +   '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="var(--bg-btn)" stroke-width="14"/>'
    +   '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="#94A3B8" stroke-width="14" stroke-dasharray="' + first + ' ' + circ + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
    +   '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="#3B82F6" stroke-width="14" stroke-dasharray="' + second + ' ' + circ + '" stroke-dashoffset="' + (-first) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
    +   '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="#22C55E" stroke-width="14" stroke-dasharray="' + third + ' ' + circ + '" stroke-dashoffset="' + (-(first + second)) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
    +   '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-family="Inter var, system-ui" font-weight="700" font-size="16" fill="var(--text-primary)">' + ret.returning + '%</text>'
    + '</svg>'
    + '<div style="flex:1;font:var(--fw-medium) 11px/1.5 var(--font)">'
    +   '<div class="bdash-legend"><span class="bdash-legend-dot" style="background:#94A3B8"></span>İlk kez <b>%' + ret.firstTime + '</b></div>'
    +   '<div class="bdash-legend"><span class="bdash-legend-dot" style="background:#3B82F6"></span>2. kez <b>%' + ret.secondTime + '</b></div>'
    +   '<div class="bdash-legend"><span class="bdash-legend-dot" style="background:#22C55E"></span>3+ kez <b>%' + ret.returning + '</b></div>'
    + '</div>'
    + '</div>';
}

function _bdashVisitorsChart() {
  var v = BIZ_DASHBOARD_EXT.visitors;
  var max = Math.max(v.community, v.table, v.online);
  var bars = [
    { lbl: 'Topluluk', n: v.community, color: '#8B5CF6' },
    { lbl: 'Masada',   n: v.table,     color: '#F97316' },
    { lbl: 'Online',   n: v.online,    color: '#3B82F6' }
  ];
  return '<div class="bdash-vbars">'
    + bars.map(function(b){
        var h = Math.round((b.n / max) * 80);
        return '<div class="bdash-vbar"><div class="bdash-vbar-col"><div class="bdash-vbar-fill" style="height:' + h + '%;background:' + b.color + '"></div></div><div class="bdash-vbar-val">' + b.n.toLocaleString('tr-TR') + '</div><div class="bdash-vbar-lbl">' + b.lbl + '</div></div>';
      }).join('')
    + '</div>';
}

/* ═══ 3) MENÜ & ÜRÜN ANALİTİĞİ ═══ */
function _bdashSection3_Menu() {
  var s = BIZ_DASHBOARD_STATS;
  var topItems = (s.thisWeek && s.thisWeek.topItems) || [];

  // Funnel
  var f = BIZ_DASHBOARD_EXT.funnel;
  var cartPct = Math.round(f.addedToCart / f.views * 100);
  var buyPct = Math.round(f.purchased / f.views * 100);

  return '<div class="bdash-section">'
    + _bdashSectionHeader('solar:cup-star-bold', '#F59E0B', 'Menü & Ürün Analitiği', 'Yıldız ürünler ve dönüşüm')

    + '<div class="bdash-card">'
    +   '<div class="bdash-card-title">Yıldız Ürünler</div>'
    +   '<div class="bdash-top-list">'
    +   topItems.slice(0, 5).map(function(it, i){
          return '<div class="bdash-top-row">'
            + '<div class="bdash-top-rank' + (i === 0 ? ' first' : '') + '">' + (i + 1) + '</div>'
            + '<div class="bdash-top-main"><div class="bdash-top-name">' + it.name + '</div><div class="bdash-top-qty">' + it.qty + ' adet</div></div>'
            + '<div class="bdash-top-rev">' + _bdashFmt(it.revenue) + '</div>'
            + '</div>';
        }).join('')
    +   '</div>'
    + '</div>'

    + '<div class="bdash-grid-2">'
    +   _bdashChannelList('Online\'da', BIZ_DASHBOARD_EXT.topItemsByChannel.online, '#3B82F6', 'solar:scooter-bold')
    +   _bdashChannelList('Masada', BIZ_DASHBOARD_EXT.topItemsByChannel.table, '#F97316', 'solar:sofa-2-bold')
    + '</div>'

    + '<div class="bdash-card">'
    +   '<div class="bdash-card-title">Görüntüleme → Sepet → Satış Hunisi</div>'
    +   '<div class="bdash-funnel">'
    +     '<div class="bdash-funnel-step" style="background:linear-gradient(90deg,#8B5CF6,#7C3AED);width:100%"><span>Görüntüleme</span><b>' + f.views.toLocaleString('tr-TR') + '</b></div>'
    +     '<div class="bdash-funnel-step" style="background:linear-gradient(90deg,#3B82F6,#2563EB);width:' + Math.max(cartPct, 35) + '%"><span>Sepete eklendi</span><b>' + f.addedToCart.toLocaleString('tr-TR') + ' · %' + cartPct + '</b></div>'
    +     '<div class="bdash-funnel-step" style="background:linear-gradient(90deg,#22C55E,#16A34A);width:' + Math.max(buyPct, 20) + '%"><span>Satın alındı</span><b>' + f.purchased.toLocaleString('tr-TR') + ' · %' + buyPct + '</b></div>'
    +   '</div>'
    + '</div>'

    + '<div class="bdash-grid-2">'
    +   '<div class="bdash-card">'
    +     '<div class="bdash-card-title" style="display:flex;align-items:center;gap:6px"><iconify-icon icon="solar:medal-star-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>Keşfedilmeyi Bekliyor</div>'
    +     '<div class="bdash-card-sub">Az bakılıyor, çok satıyor</div>'
    +     '<div class="bdash-mini-list">'
    +     BIZ_DASHBOARD_EXT.hiddenGems.map(function(g){
            return '<div class="bdash-mini-row"><div style="flex:1"><div class="bdash-mini-name">' + g.name + '</div><div class="bdash-mini-meta">' + g.views + ' görüntülenme · ' + _bdashFmt(g.price) + '</div></div><span class="bdash-mini-badge bdash-mini-badge--gold">%' + Math.round(g.conversion * 100) + '</span></div>';
          }).join('')
    +     '</div>'
    +   '</div>'

    +   '<div class="bdash-card">'
    +     '<div class="bdash-card-title" style="display:flex;align-items:center;gap:6px"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:16px;color:#EF4444"></iconify-icon>Geliştirilmesi Gerekenler</div>'
    +     '<div class="bdash-card-sub">Puan 3.9 ve altında</div>'
    +     '<div class="bdash-mini-list">'
    +     BIZ_DASHBOARD_EXT.needsImprovement.map(function(n){
            return '<div class="bdash-mini-row"><div style="flex:1"><div class="bdash-mini-name">' + n.name + '</div><div class="bdash-mini-meta">' + n.issue + '</div></div><span class="bdash-mini-badge bdash-mini-badge--danger"><iconify-icon icon="solar:star-bold" style="font-size:10px"></iconify-icon>' + n.rating + '</span></div>';
          }).join('')
    +     '</div>'
    +   '</div>'
    + '</div>'

    + '</div>';
}

function _bdashChannelList(title, items, color, icon) {
  return '<div class="bdash-card">'
    + '<div class="bdash-card-title" style="display:flex;align-items:center;gap:6px"><iconify-icon icon="' + icon + '" style="font-size:16px;color:' + color + '"></iconify-icon>' + title + '</div>'
    + '<div class="bdash-chan-list">'
    + items.slice(0, 4).map(function(it, i){
        return '<div class="bdash-chan-row"><span class="bdash-chan-rank">' + (i + 1) + '</span><span class="bdash-chan-name">' + it.name + '</span><span class="bdash-chan-qty">' + it.qty + '</span></div>';
      }).join('')
    + '</div>'
    + '</div>';
}

/* ═══ 4) İK & AI ═══ */
function _bdashSection4_HrAi() {
  var emp = BIZ_DASHBOARD_EXT.employeeOfPeriod[_bdash.period];
  var periodLbl = _bdash.period === 'daily' ? 'Günün' : _bdash.period === 'weekly' ? 'Haftanın' : 'Ayın';
  return '<div class="bdash-section">'
    + _bdashSectionHeader('solar:medal-ribbons-star-bold', '#8B5CF6', 'İK & Yapay Zeka', periodLbl + ' çalışanı + AI önerileri')

    // Employee of period
    + '<div class="bdash-card bdash-emp">'
    +   '<div class="bdash-emp-ribbon">★ ' + periodLbl.toUpperCase() + ' ÇALIŞANI</div>'
    +   '<img class="bdash-emp-avatar" src="' + emp.avatar + '" alt="">'
    +   '<div style="flex:1;min-width:0">'
    +     '<div class="bdash-emp-name">' + emp.name + '</div>'
    +     '<div class="bdash-emp-role">' + emp.role + '</div>'
    +     '<div class="bdash-emp-stats">'
    +       '<div><b>' + emp.orders + '</b><span>sipariş</span></div>'
    +       '<div><b>' + emp.rating + '★</b><span>puan</span></div>'
    +       '<div><b>' + emp.avgTime + '\'</b><span>ort. süre</span></div>'
    +     '</div>'
    +   '</div>'
    + '</div>'

    // AI Suggestions
    + '<div class="bdash-card-title" style="margin-top:8px;display:flex;align-items:center;gap:6px"><iconify-icon icon="solar:magic-stick-3-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon>AI Önerileri</div>'
    + BIZ_DASHBOARD_EXT.aiSuggestions.map(function(s){
        return '<div class="bdash-card bdash-ai">'
          + '<div class="bdash-ai-ico" style="background:' + s.color + '18;color:' + s.color + '"><iconify-icon icon="' + s.icon + '" style="font-size:20px"></iconify-icon></div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div class="bdash-ai-title">' + s.title + '</div>'
          +   '<div class="bdash-ai-body">' + s.body + '</div>'
          +   '<button class="bdash-ai-btn" style="color:' + s.color + ';border-color:' + s.color + '33" onclick="alert(\'' + s.action + ' — yakında!\')">' + s.action + ' <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:12px"></iconify-icon></button>'
          + '</div>'
          + '</div>';
      }).join('')

    + '</div>';
}

function _bdashSectionHeader(icon, color, title, sub) {
  return '<div class="bdash-sec-head">'
    + '<div class="bdash-sec-ico" style="background:' + color + '18;color:' + color + '"><iconify-icon icon="' + icon + '" style="font-size:20px"></iconify-icon></div>'
    + '<div><div class="bdash-sec-title">' + title + '</div><div class="bdash-sec-sub">' + sub + '</div></div>'
    + '</div>';
}

/* ═══ STYLES ═══ */
function _bdashInjectStyles() {
  if (document.getElementById('bdashStyles')) return;
  var s = document.createElement('style');
  s.id = 'bdashStyles';
  s.textContent = [
    '#bizDashboardRoot{display:flex;flex-direction:column;gap:14px}',
    '.bdash-period-bar{display:flex;gap:4px;padding:4px;background:var(--bg-btn);border-radius:var(--r-full);width:fit-content}',
    '.bdash-period-opt{padding:8px 16px;border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-muted);cursor:pointer;transition:all .2s}',
    '.bdash-period-opt.active{background:var(--primary);color:#fff;box-shadow:0 2px 8px rgba(246,80,19,.3)}',
    '.bdash-section{display:flex;flex-direction:column;gap:10px;margin-top:8px}',
    '.bdash-sec-head{display:flex;align-items:center;gap:10px;padding:2px 0 4px}',
    '.bdash-sec-ico{width:36px;height:36px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.bdash-sec-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.bdash-sec-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.bdash-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px}',
    '.bdash-card-title{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:4px}',
    '.bdash-card-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-bottom:10px}',
    '.bdash-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '/* Finance hero */',
    '.bdash-finance-hero{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,rgba(34,197,94,0.08),var(--bg-phone))}',
    '.bdash-lbl{font:var(--fw-bold) 10px/1 var(--font);color:var(--text-muted);letter-spacing:.6px;text-transform:uppercase}',
    '.bdash-big{font:var(--fw-bold) 28px/1 var(--font);color:var(--text-primary);margin-top:6px;letter-spacing:-.5px}',
    '.bdash-delta{display:inline-flex;align-items:center;gap:3px;margin-top:6px;font:var(--fw-semibold) 11.5px/1 var(--font);padding:3px 8px;border-radius:var(--r-full)}',
    '.bdash-delta.up{background:rgba(34,197,94,0.14);color:#16A34A}',
    '.bdash-delta.down{background:rgba(239,68,68,0.14);color:#DC2626}',
    '.bdash-order-delta{margin-left:auto;text-align:right;flex-shrink:0}',
    '.bdash-sub-lbl{font:var(--fw-bold) 9px/1 var(--font);color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase}',
    '.bdash-sub-big{font:var(--fw-bold) 20px/1 var(--font);color:var(--text-primary);margin-top:4px}',
    '/* Channel */',
    '.bdash-channel{padding:12px}',
    '.bdash-channel-row{display:flex;align-items:center;gap:6px;font:var(--fw-bold) 12px/1 var(--font);color:var(--text-primary)}',
    '.bdash-channel-val{font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);margin-top:6px}',
    '.bdash-channel-bar{margin-top:8px;height:6px;background:var(--bg-btn);border-radius:var(--r-full);overflow:hidden}',
    '.bdash-channel-fill{height:100%;border-radius:var(--r-full);transition:width .3s}',
    '.bdash-channel-pct{font:var(--fw-bold) 10px/1 var(--font);color:var(--text-muted);margin-top:6px;text-align:right}',
    '.bdash-svg{width:100%;height:100px;display:block;margin-top:6px}',
    '/* Heatmap */',
    '.bdash-heatmap{display:flex;flex-direction:column;gap:2px;overflow-x:auto;margin-top:8px;scrollbar-width:none}',
    '.bdash-heatmap::-webkit-scrollbar{display:none}',
    '.bdash-hm-row{display:grid;grid-template-columns:32px repeat(12, 1fr);gap:2px;min-width:100%}',
    '.bdash-hm-head .bdash-hm-hr{font:var(--fw-bold) 9px/1 var(--font);color:var(--text-muted);text-align:center}',
    '.bdash-hm-day{font:var(--fw-bold) 10px/22px var(--font);color:var(--text-muted);text-align:left}',
    '.bdash-hm-cell{height:22px;border-radius:3px;cursor:pointer;transition:transform .15s}',
    '.bdash-hm-cell:hover{transform:scale(1.15);outline:1px solid var(--text-primary)}',
    '/* Bar list */',
    '.bdash-bar-list{display:flex;flex-direction:column;gap:8px;margin-top:6px}',
    '.bdash-bar-row{display:flex;align-items:center;gap:8px}',
    '.bdash-bar-lbl{width:78px;font:var(--fw-medium) 11px/1.2 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}',
    '.bdash-bar-track{flex:1;height:10px;background:var(--bg-btn);border-radius:var(--r-full);overflow:hidden}',
    '.bdash-bar-fill{height:100%;border-radius:var(--r-full)}',
    '.bdash-bar-val{font:var(--fw-bold) 10px/1 var(--font);color:var(--text-muted);min-width:50px;text-align:right}',
    '/* Legend + donut */',
    '.bdash-legend{display:flex;align-items:center;gap:6px;color:var(--text-secondary);margin-bottom:6px}',
    '.bdash-legend b{color:var(--text-primary);font-weight:700;margin-left:auto}',
    '.bdash-legend-dot{width:10px;height:10px;border-radius:50%}',
    '/* Visitors bars */',
    '.bdash-vbars{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:end;margin-top:10px;height:150px}',
    '.bdash-vbar{display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}',
    '.bdash-vbar-col{width:100%;height:100%;display:flex;align-items:flex-end;padding:0 10%}',
    '.bdash-vbar-fill{width:100%;border-radius:var(--r-md) var(--r-md) 0 0;transition:height .3s}',
    '.bdash-vbar-val{font:var(--fw-bold) 11px/1 var(--font);color:var(--text-primary)}',
    '.bdash-vbar-lbl{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted)}',
    '/* Menu */',
    '.bdash-top-list{display:flex;flex-direction:column;gap:8px;margin-top:6px}',
    '.bdash-top-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle)}',
    '.bdash-top-row:last-child{border-bottom:none}',
    '.bdash-top-rank{width:24px;height:24px;border-radius:50%;background:var(--bg-btn);color:var(--text-secondary);display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 11px/1 var(--font)}',
    '.bdash-top-rank.first{background:linear-gradient(135deg,#F59E0B,#D97706);color:#fff}',
    '.bdash-top-main{flex:1;min-width:0}',
    '.bdash-top-name{font:var(--fw-semibold) 12.5px/1.2 var(--font);color:var(--text-primary)}',
    '.bdash-top-qty{font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted);margin-top:3px}',
    '.bdash-top-rev{font:var(--fw-bold) 12.5px/1 var(--font);color:var(--text-primary)}',
    '.bdash-chan-list{display:flex;flex-direction:column;gap:6px;margin-top:6px}',
    '.bdash-chan-row{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px dashed var(--border-subtle);font:var(--fw-medium) 11.5px/1 var(--font)}',
    '.bdash-chan-row:last-child{border-bottom:none}',
    '.bdash-chan-rank{width:18px;height:18px;border-radius:4px;background:var(--bg-btn);color:var(--text-secondary);font-weight:700;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}',
    '.bdash-chan-name{flex:1;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.bdash-chan-qty{font-weight:700;color:var(--text-primary)}',
    '/* Funnel */',
    '.bdash-funnel{display:flex;flex-direction:column;gap:6px;margin-top:8px}',
    '.bdash-funnel-step{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:var(--r-lg);color:#fff;font:var(--fw-semibold) 11.5px/1 var(--font);margin:0 auto;transition:width .3s}',
    '.bdash-funnel-step b{font-size:12px;font-weight:800}',
    '/* Mini list */',
    '.bdash-mini-list{display:flex;flex-direction:column;gap:8px;margin-top:6px}',
    '.bdash-mini-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle)}',
    '.bdash-mini-row:last-child{border-bottom:none}',
    '.bdash-mini-name{font:var(--fw-semibold) 11.5px/1.2 var(--font);color:var(--text-primary)}',
    '.bdash-mini-meta{font:var(--fw-regular) 10.5px/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.bdash-mini-badge{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);font:var(--fw-bold) 10px/1 var(--font)}',
    '.bdash-mini-badge--gold{background:rgba(245,158,11,0.14);color:#D97706}',
    '.bdash-mini-badge--danger{background:rgba(239,68,68,0.14);color:#DC2626}',
    '/* Employee */',
    '.bdash-emp{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,rgba(139,92,246,0.1),var(--bg-phone));border:1.5px solid rgba(139,92,246,0.25);position:relative;padding-top:22px}',
    '.bdash-emp-ribbon{position:absolute;top:-1px;left:12px;padding:3px 10px;background:linear-gradient(135deg,#F59E0B,#D97706);color:#fff;font:var(--fw-bold) 9px/1.4 var(--font);letter-spacing:.5px;border-radius:0 0 var(--r-md) var(--r-md)}',
    '.bdash-emp-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.1);flex-shrink:0}',
    '.bdash-emp-name{font:var(--fw-bold) 15px/1.2 var(--font);color:var(--text-primary)}',
    '.bdash-emp-role{font:var(--fw-medium) 11px/1 var(--font);color:#8B5CF6;margin-top:3px}',
    '.bdash-emp-stats{display:flex;gap:14px;margin-top:8px}',
    '.bdash-emp-stats > div{display:flex;flex-direction:column;gap:2px}',
    '.bdash-emp-stats b{font:var(--fw-bold) 14px/1 var(--font);color:var(--text-primary)}',
    '.bdash-emp-stats span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted)}',
    '/* AI */',
    '.bdash-ai{display:flex;gap:12px;align-items:flex-start}',
    '.bdash-ai-ico{width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.bdash-ai-title{font:var(--fw-bold) 13px/1.2 var(--font);color:var(--text-primary);margin-bottom:4px}',
    '.bdash-ai-body{font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.bdash-ai-btn{margin-top:10px;padding:6px 12px;border:1px solid;background:var(--bg-phone);border-radius:var(--r-full);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
  ].join('\n');
  document.head.appendChild(s);
}

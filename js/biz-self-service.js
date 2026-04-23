/* ═══════════════════════════════════════════════════════════
   BIZ SELF-SERVICE — Şube Statik QR + Performans Dashboard
   - Statik QR önizleme + PDF çıktı + PNG indir
   - Okunma / Ödeme / Toplam Ödenen metrikler
   - Filtre: Günlük / Haftalık / Aylık · özel tarih · dinamik karşılaştırma
   ═══════════════════════════════════════════════════════════ */

var _bss = {
  branchId: null,
  range: 'day',               // 'day' | 'week' | 'month' | 'custom' | 'dyn'
  from: null,                 // ISO (YYYY-MM-DD) custom için
  to:   null,
  dynKey: 'last3m',           // 'last3m' | 'last6m' | 'lastYearSameMonth' | 'yearToDate'
  compareMode: false
};

/* ── Deterministik pseudo-veri: şube + tarih → sayılar ── */
function _bssSeed(s) {
  var h = 2166136261;
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h >>> 0;
}
function _bssRandAt(branchId, dayStr) {
  var n = _bssSeed(branchId + '|' + dayStr);
  var scans  = 18 + (n % 55);
  n = Math.imul(n, 1664525) + 1013904223 >>> 0;
  var orders = Math.round(scans * (0.18 + ((n % 23) / 100)));
  n = Math.imul(n, 1664525) + 1013904223 >>> 0;
  var aov    = 85 + ((n % 110));
  var total  = orders * aov;
  return { scans: scans, orders: orders, total: total };
}

function _bssDateRange() {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var from = new Date(today), to = new Date(today);
  if (_bss.range === 'day') {
    /* aynı gün */
  } else if (_bss.range === 'week') {
    from = new Date(today); from.setDate(today.getDate() - 6);
  } else if (_bss.range === 'month') {
    from = new Date(today); from.setDate(today.getDate() - 29);
  } else if (_bss.range === 'custom') {
    if (_bss.from) from = new Date(_bss.from + 'T00:00:00');
    if (_bss.to)   to   = new Date(_bss.to   + 'T00:00:00');
  } else if (_bss.range === 'dyn') {
    var k = _bss.dynKey;
    if (k === 'last3m')  { from = new Date(today); from.setMonth(today.getMonth() - 3); }
    else if (k === 'last6m') { from = new Date(today); from.setMonth(today.getMonth() - 6); }
    else if (k === 'lastYearSameMonth') {
      from = new Date(today.getFullYear() - 1, today.getMonth(), 1);
      to   = new Date(today.getFullYear() - 1, today.getMonth() + 1, 0);
    } else if (k === 'yearToDate') {
      from = new Date(today.getFullYear(), 0, 1);
    }
  }
  if (to < from) { var tmp = from; from = to; to = tmp; }
  return { from: from, to: to };
}

function _bssSumRange(branchId, from, to) {
  var agg = { scans: 0, orders: 0, total: 0, days: 0 };
  var d = new Date(from);
  while (d <= to) {
    var iso = d.toISOString().slice(0, 10);
    var r = _bssRandAt(branchId, iso);
    agg.scans  += r.scans;
    agg.orders += r.orders;
    agg.total  += r.total;
    agg.days++;
    d.setDate(d.getDate() + 1);
    if (agg.days > 400) break;
  }
  return agg;
}

/* Dış dünyaya özet (tile'da kullanılır) */
function bizSelfServiceSummary(branchId, range) {
  var prevRange = _bss.range;
  _bss.range = range || 'day';
  var r = _bssDateRange();
  var agg = _bssSumRange(branchId, r.from, r.to);
  _bss.range = prevRange;
  return { scans: agg.scans, orders: agg.orders, total: agg.total };
}

/* ── QR payload & görseli ── */
function _bssQrPayload(branch) {
  /* Kullanıcının QR'ı okutunca self-servis menüye düşmesi için deep-link stili */
  return 'https://lufga.app/s/' + (branch && branch.id ? branch.id : 'demo') + '?mode=selfservice';
}
function _bssQrImageSrc(branch, size) {
  var sz = size || 560;
  var url = _bssQrPayload(branch);
  return 'https://api.qrserver.com/v1/create-qr-code/?size=' + sz + 'x' + sz + '&margin=8&qzone=2&data=' + encodeURIComponent(url);
}

/* ═══════════════════ ENTRY ═══════════════════ */

function openBizSelfService(branchId) {
  _bss.branchId = branchId;
  _bss.range = 'day';
  _bss.from = null; _bss.to = null;
  _bss.compareMode = false;
  _bssRender();
}

function _bssRender() {
  var branch = (typeof BIZ_BRANCHES !== 'undefined') ? BIZ_BRANCHES.find(function(b){ return b.id === _bss.branchId; }) : null;
  if (!branch) return;
  var content = _bssContent(branch);
  var overlay = (typeof createBizOverlay === 'function')
    ? createBizOverlay('bizSelfServiceOverlay', 'Self-Servis', content)
    : null;
  if (!overlay) return;
  var phone = document.getElementById('bizPhone') || document.body;
  phone.appendChild(overlay);
}

function _bssContent(branch) {
  var qrSrc = _bssQrImageSrc(branch, 560);
  var rng = _bssDateRange();
  var agg = _bssSumRange(branch.id, rng.from, rng.to);

  /* Karşılaştırma (önceki aynı uzunluktaki dönem) */
  var prev = null;
  if (_bss.compareMode) {
    var days = Math.round((rng.to - rng.from) / 86400000) + 1;
    var pFrom = new Date(rng.from); pFrom.setDate(pFrom.getDate() - days);
    var pTo   = new Date(rng.from); pTo.setDate(pTo.getDate() - 1);
    prev = _bssSumRange(branch.id, pFrom, pTo);
  }

  return ''
    /* Şube başlığı */
    + '<div style="background:linear-gradient(135deg,#0EA5E9 0%,#0369A1 100%);border-radius:var(--r-xl);padding:18px;color:#fff;position:relative;overflow:hidden;margin-bottom:14px">'
    +   '<div style="position:absolute;right:-16px;top:-20px;opacity:.12"><iconify-icon icon="solar:qr-code-bold" style="font-size:120px"></iconify-icon></div>'
    +   '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
    +     '<iconify-icon icon="solar:qr-code-bold" style="font-size:22px"></iconify-icon>'
    +     '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font)">' + _bssEsc(branch.name) + '</span>'
    +   '</div>'
    +   '<div style="font:var(--fw-regular) 12px/1.5 var(--font);opacity:.92">Şubeye özel statik QR kodu üzerinden self-servis sipariş &amp; ödeme. Okundukça Lufga dijital menüsüne yönlendirir.</div>'
    + '</div>'

    /* ═══ A. STATİK QR YÖNETİMİ ═══ */
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-md);padding:18px 16px;margin-bottom:16px">'
    +   '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    +     '<iconify-icon icon="solar:qr-code-bold" style="font-size:18px;color:#0EA5E9"></iconify-icon>'
    +     '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Statik QR</span>'
    +     '<span style="margin-left:auto;font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted)">Şube kodu · ' + _bssEsc(branch.id) + '</span>'
    +   '</div>'
    +   '<div style="display:flex;justify-content:center;margin-bottom:14px">'
    +     '<div style="padding:16px;background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:0 6px 18px rgba(14,165,233,.12);display:flex;flex-direction:column;align-items:center;gap:10px;max-width:280px">'
    +       '<img id="bssQrImg" src="' + qrSrc + '" alt="Şube QR" style="width:220px;height:220px;image-rendering:pixelated;display:block" crossorigin="anonymous">'
    +       '<div style="font:var(--fw-bold) 12.5px/1.2 var(--font);color:#0369A1;text-align:center">' + _bssEsc(branch.name) + '</div>'
    +       '<div style="font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);letter-spacing:.3px;text-transform:uppercase">Lufga ile Kolay Sipariş</div>'
    +     '</div>'
    +   '</div>'
    +   '<div style="display:flex;gap:8px">'
    +     '<button onclick="bssDownloadPng()" class="bss-btn bss-btn--ghost"><iconify-icon icon="solar:download-linear" style="font-size:15px"></iconify-icon> PNG İndir</button>'
    +     '<button onclick="bssExportPdf()" class="bss-btn bss-btn--primary"><iconify-icon icon="solar:printer-bold" style="font-size:15px"></iconify-icon> PDF Olarak Çıktı Al</button>'
    +   '</div>'
    + '</div>'

    /* ═══ B. PERFORMANS & FİNANSAL RAPOR ═══ */
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    +   '<iconify-icon icon="solar:chart-2-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    +   '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Performans &amp; Finansal Rapor</span>'
    + '</div>'

    /* Filtre pills */
    + '<div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;margin-bottom:10px">'
    +   _bssFilterPill('day',   'Günlük', _bss.range === 'day')
    +   _bssFilterPill('week',  'Haftalık', _bss.range === 'week')
    +   _bssFilterPill('month', 'Aylık', _bss.range === 'month')
    +   _bssFilterPill('custom','Özel Tarih', _bss.range === 'custom')
    +   _bssFilterPill('dyn',   'Dinamik', _bss.range === 'dyn')
    + '</div>'

    /* Filtre detayları */
    + (_bss.range === 'custom' ? _bssCustomRangeHtml() : '')
    + (_bss.range === 'dyn' ? _bssDynHtml() : '')

    /* Compare toggle */
    + '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-btn);border-radius:var(--r-lg);margin-bottom:12px">'
    +   '<iconify-icon icon="solar:compare-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
    +   '<span style="flex:1;font:var(--fw-medium) 12px/1 var(--font);color:var(--text-secondary)">Önceki dönemle karşılaştır</span>'
    +   _bssSwitch(_bss.compareMode, '_bssToggleCompare()')
    + '</div>'

    /* Dönem özeti */
    + '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-bottom:10px">'
    +   _bssFmtDate(rng.from) + ' — ' + _bssFmtDate(rng.to)
    + '</div>'

    /* Metric cards */
    + '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">'
    +   _bssMetricCard('Okunma Sayısı',        agg.scans,  prev && prev.scans,  'solar:eye-scan-bold',     '#0EA5E9', '')
    +   _bssMetricCard('Ödeme Sayısı',         agg.orders, prev && prev.orders, 'solar:card-send-bold',    '#22C55E', 'adet')
    +   _bssMetricCard('Toplam Ödenen Miktar', agg.total,  prev && prev.total,  'solar:wallet-money-bold', '#EA580C', '₺', true)
    + '</div>'

    /* Bilgi notu */
    + '<div style="background:rgba(14,165,233,.06);border:1px solid rgba(14,165,233,.22);border-radius:var(--r-lg);padding:12px;display:flex;gap:10px;align-items:flex-start;margin-bottom:18px">'
    +   '<iconify-icon icon="solar:info-circle-bold" style="font-size:16px;color:#0EA5E9;flex-shrink:0;margin-top:1px"></iconify-icon>'
    +   '<span style="font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary)">Bu rapor <b>sadece self-servis QR</b> üzerinden başlayan siparişleri içerir. Masa QR ve online siparişler ayrı raporlara düşer.</span>'
    + '</div>'

    /* Styles */
    + '<style>'
    +   '.bss-btn{flex:1;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-full);font:var(--fw-bold) 13px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}'
    +   '.bss-btn:active{transform:scale(.97)}'
    +   '.bss-btn--ghost{background:var(--bg-page);color:var(--text-primary)}'
    +   '.bss-btn--primary{background:#0EA5E9;border-color:#0EA5E9;color:#fff}'
    +   '.bss-sw{width:42px;height:22px;border-radius:var(--r-full);background:var(--glass-card-strong);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}'
    +   '.bss-sw.on{background:#0EA5E9}'
    +   '.bss-sw-dot{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s}'
    +   '.bss-sw.on .bss-sw-dot{left:23px}'
    + '</style>';
}

function _bssSwitch(on, handler) {
  return '<div class="bss-sw' + (on ? ' on' : '') + '" onclick="' + handler + '"><div class="bss-sw-dot"></div></div>';
}

function _bssFilterPill(id, label, active) {
  return '<div onclick="_bssSetRange(\'' + id + '\')" '
    + 'style="flex-shrink:0;padding:9px 14px;border-radius:var(--r-full);cursor:pointer;white-space:nowrap;font:var(--fw-semibold) 12px/1 var(--font);'
    + (active
        ? 'background:#0EA5E9;color:#fff;border:1px solid #0EA5E9'
        : 'background:var(--bg-page);color:var(--text-primary);border:1px solid var(--border-subtle)')
    + '">' + label + '</div>';
}

function _bssCustomRangeHtml() {
  return '<div style="display:flex;gap:10px;margin-bottom:12px">'
    + '<div style="flex:1"><label style="font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted);display:block;margin-bottom:5px">Başlangıç</label>'
    +   '<input type="date" value="' + (_bss.from || '') + '" onchange="_bss.from=this.value;_bssRender()" style="width:100%;padding:9px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-semibold) 12px/1 var(--font);color:var(--text-primary);background:var(--bg-page);outline:none;box-sizing:border-box"></div>'
    + '<div style="flex:1"><label style="font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted);display:block;margin-bottom:5px">Bitiş</label>'
    +   '<input type="date" value="' + (_bss.to || '') + '" onchange="_bss.to=this.value;_bssRender()" style="width:100%;padding:9px 10px;border:1px solid var(--border-subtle);border-radius:var(--r-md);font:var(--fw-semibold) 12px/1 var(--font);color:var(--text-primary);background:var(--bg-page);outline:none;box-sizing:border-box"></div>'
    + '</div>';
}

function _bssDynHtml() {
  var opts = [
    { k: 'last3m',              label: 'Son 3 ay' },
    { k: 'last6m',              label: 'Son 6 ay' },
    { k: 'lastYearSameMonth',   label: 'Geçen yılın aynı ayı' },
    { k: 'yearToDate',          label: 'Yıl başından bugüne' }
  ];
  return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">'
    + opts.map(function(o){
        var active = _bss.dynKey === o.k;
        return '<div onclick="_bssSetDyn(\'' + o.k + '\')" style="padding:8px 12px;border-radius:var(--r-full);cursor:pointer;font:var(--fw-semibold) 11.5px/1 var(--font);'
          + (active ? 'background:#0369A1;color:#fff;border:1px solid #0369A1' : 'background:var(--bg-btn);color:var(--text-primary);border:1px solid var(--border-subtle)')
          + '">' + o.label + '</div>';
      }).join('')
    + '</div>';
}

function _bssMetricCard(label, value, prevValue, icon, color, unit, isMoney) {
  var display = isMoney ? _bssMoney(value) : value.toLocaleString('tr-TR') + (unit ? ' ' + unit : '');
  var delta = '';
  if (prevValue != null && prevValue > 0) {
    var pct = Math.round((value - prevValue) / prevValue * 100);
    var up = pct >= 0;
    delta = '<div style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:var(--r-full);background:' + (up ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)') + ';color:' + (up ? '#16A34A' : '#DC2626') + ';font:var(--fw-bold) 10.5px/1.2 var(--font);margin-top:6px">'
      + '<iconify-icon icon="' + (up ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold') + '" style="font-size:11px"></iconify-icon>'
      + (up ? '+' : '') + pct + '% geçen dönem'
      + '</div>';
  }
  return '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:14px 16px;display:flex;align-items:center;gap:12px">'
    + '<div style="width:44px;height:44px;border-radius:var(--r-lg);background:' + color + '18;color:' + color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><iconify-icon icon="' + icon + '" style="font-size:22px"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    +   '<div style="font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted)">' + label + '</div>'
    +   '<div style="font:var(--fw-bold) 20px/1 var(--font);color:var(--text-primary);margin-top:4px">' + display + '</div>'
    +   delta
    + '</div>'
    + '</div>';
}

function _bssSetRange(r) { _bss.range = r; _bssRender(); }
function _bssSetDyn(k)   { _bss.dynKey = k; _bssRender(); }
function _bssToggleCompare() { _bss.compareMode = !_bss.compareMode; _bssRender(); }

function _bssMoney(n) {
  return '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function _bssFmtDate(d) {
  try { return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' }); } catch (e) { return ''; }
}
function _bssEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ═══════════════════ PNG İNDİR ═══════════════════ */

function bssDownloadPng() {
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === _bss.branchId; });
  if (!branch) return;
  var src = _bssQrImageSrc(branch, 720);
  /* Cross-origin olabilir — öncelikle anchor + download; başarısız olursa window.open */
  var a = document.createElement('a');
  a.href = src;
  a.download = 'lufga-qr-' + (branch.id || 'sube') + '.png';
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ if (a.parentNode) a.parentNode.removeChild(a); }, 100);
  if (typeof _admToast === 'function') _admToast('QR görseli indiriliyor', 'ok');
}

/* ═══════════════════ PDF ÇIKTISI (printable window) ═══════════════════ */

function bssExportPdf() {
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === _bss.branchId; });
  if (!branch) return;
  var biz = (typeof BIZ_BUSINESS !== 'undefined') ? BIZ_BUSINESS : { name: '' };
  var qr = _bssQrImageSrc(branch, 900);
  var payload = _bssQrPayload(branch);

  var html = '<!doctype html><html lang="tr"><head><meta charset="utf-8">'
    + '<title>' + _bssEsc(branch.name) + ' — Lufga QR</title>'
    + '<style>'
    + '  *{box-sizing:border-box;margin:0;padding:0}'
    + '  html,body{font-family:"Lufga",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#0f172a;background:#fff}'
    + '  @page{size:A4;margin:18mm}'
    + '  .page{max-width:170mm;margin:0 auto;padding:24px 0;text-align:center}'
    + '  .brand{display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border-radius:999px;background:#0EA5E910;color:#0369A1;font-weight:700;letter-spacing:.3px;text-transform:uppercase;font-size:11px}'
    + '  .dot{width:8px;height:8px;border-radius:50%;background:#0EA5E9}'
    + '  h1{font-size:28px;margin:18px 0 4px;color:#0f172a}'
    + '  .branch{font-size:14px;color:#64748b;margin-bottom:28px}'
    + '  .qr-frame{display:inline-block;padding:24px;background:#fff;border:2px solid #E2E8F0;border-radius:24px;box-shadow:0 18px 36px rgba(15,23,42,.10)}'
    + '  .qr-frame img{width:380px;height:380px;display:block;image-rendering:pixelated}'
    + '  .slogan{margin-top:20px;font-weight:800;font-size:16px;color:#0369A1;letter-spacing:.5px}'
    + '  .sub{margin-top:6px;font-size:12px;color:#64748b}'
    + '  .steps{display:flex;justify-content:center;gap:16px;margin-top:28px;flex-wrap:wrap}'
    + '  .step{width:150px;padding:14px 12px;border:1px solid #E2E8F0;border-radius:16px;text-align:center;background:#F8FAFC}'
    + '  .step-num{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#0EA5E9;color:#fff;font-weight:800;font-size:13px}'
    + '  .step-title{margin-top:8px;font-weight:700;font-size:13px;color:#0f172a}'
    + '  .step-desc{margin-top:4px;font-size:11px;color:#64748b;line-height:1.4}'
    + '  .foot{margin-top:32px;padding-top:14px;border-top:1px dashed #CBD5E1;font-size:11px;color:#94A3B8}'
    + '  .foot b{color:#0369A1}'
    + '  .btn-bar{margin:18px 0 0;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    + '  .btn{display:inline-block;padding:11px 18px;border-radius:10px;border:none;background:#0EA5E9;color:#fff;font-weight:700;cursor:pointer;font-size:13px;text-decoration:none}'
    + '  @media print{.btn-bar{display:none}}'
    + '</style></head><body>'
    + '<div class="page">'
    + '  <div class="brand"><span class="dot"></span> Lufga ile Kolay Sipariş</div>'
    + '  <h1>' + _bssEsc(biz.name) + '</h1>'
    + '  <div class="branch">' + _bssEsc(branch.name) + ((branch.address) ? ' · ' + _bssEsc(branch.address) : '') + '</div>'
    + '  <div class="qr-frame">'
    + '    <img src="' + qr + '" alt="QR" crossorigin="anonymous">'
    + '  </div>'
    + '  <div class="slogan">QR\'ı okut, menüyü gör, tek tıkla sipariş ver</div>'
    + '  <div class="sub">' + _bssEsc(payload) + '</div>'
    + '  <div class="steps">'
    + '    <div class="step"><div class="step-num">1</div><div class="step-title">QR\'ı okut</div><div class="step-desc">Telefonunun kamerasını QR\'a tut</div></div>'
    + '    <div class="step"><div class="step-num">2</div><div class="step-title">Menüyü seç</div><div class="step-desc">Şubenin dijital menüsünde ürün bul</div></div>'
    + '    <div class="step"><div class="step-num">3</div><div class="step-title">Ödemeyi tamamla</div><div class="step-desc">Self-servis ödemeyle işlem bitsin</div></div>'
    + '  </div>'
    + '  <div class="foot">Bu sayfa <b>Lufga</b> Self-Servis sistemi tarafından oluşturulmuştur. Şube kodu: <b>' + _bssEsc(branch.id) + '</b></div>'
    + '  <div class="btn-bar"><button class="btn" onclick="window.print()">Yazdır / PDF Olarak Kaydet</button></div>'
    + '</div>'
    + '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},350);});<\/script>'
    + '</body></html>';

  var w = window.open('', '_blank', 'width=820,height=1000');
  if (!w) {
    if (typeof _admToast === 'function') _admToast('Pop-up engellendi — tarayıcı ayarlarından izin verin', 'err');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  if (typeof _admToast === 'function') _admToast('PDF önizlemesi açıldı', 'ok');
}

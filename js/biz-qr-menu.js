/* ═══════════════════════════════════════════════════════════
   BIZ QR MENU — Genel QR (sabit) + Masaya Özel QR (toggle)
   ═══════════════════════════════════════════════════════════ */

var _qrm = { branchId: null };

function openBizQRMenu(branchId) {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('branches')) return;
  _qrm.branchId = branchId;
  _qrmInjectStyles();
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === branchId; });
  var title = 'QR Menü · ' + (branch ? branch.name : 'Şube');
  var overlay = createBizOverlay('bizQRMenuOverlay', title, _qrmBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _qrmBranch() {
  return BIZ_BRANCHES.find(function(b){ return b.id === _qrm.branchId; });
}

/* QR görseli — qrserver.com public API */
function _qrmImg(data, size) {
  size = size || 220;
  var url = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(data) + '&margin=8&format=png';
  return '<img src="' + url + '" width="' + size + '" height="' + size + '" alt="QR" style="border-radius:8px;background:#fff;display:block">';
}

function _qrmGeneralUrl() {
  return 'yemekapp.com/menu/' + _qrm.branchId;
}
function _qrmTableUrl(tableId) {
  return 'yemekapp.com/menu/' + _qrm.branchId + '/masa/' + tableId;
}

/* ─ Body ─ */
function _qrmBody() {
  var branch = _qrmBranch();
  if (!branch) return '';
  var tableMode = !!branch.tableQRMode;
  var tables = (typeof BIZ_TABLES !== 'undefined') ? BIZ_TABLES.filter(function(t){ return t.branchId === _qrm.branchId; }) : [];
  var zones = (typeof BIZ_TABLE_ZONES !== 'undefined') ? BIZ_TABLE_ZONES.filter(function(z){ return z.branchId === _qrm.branchId; }).sort(function(a,b){ return (a.order||0) - (b.order||0); }) : [];

  var generalCard = _qrmGeneralCard();
  var toggle = _qrmToggleCard(tableMode, tables.length);
  var tablesSection = tableMode ? _qrmTablesSection(zones, tables) : '';

  return '<div class="qrm-wrap">' + generalCard + toggle + tablesSection + '</div>';
}

/* ─ Genel QR (sabit, en üstte) ─ */
function _qrmGeneralCard() {
  var url = _qrmGeneralUrl();
  return '<div class="qrm-card qrm-card--general">'
    + '<div class="qrm-head">'
    +   '<div class="qrm-head-ico" style="background:rgba(59,130,246,.12);color:#3B82F6"><iconify-icon icon="solar:qr-code-bold" style="font-size:22px"></iconify-icon></div>'
    +   '<div style="flex:1">'
    +     '<div class="qrm-head-title">Genel İşletme QR\'ı (Standart Menü)</div>'
    +     '<div class="qrm-head-sub">Müşteriler bu QR\'ı okuttuğunda yalnızca menüyü ve fiyatları görür</div>'
    +   '</div>'
    + '</div>'
    + '<div class="qrm-main">'
    +   '<div class="qrm-qr">' + _qrmImg(url, 220) + '</div>'
    +   '<div class="qrm-meta">'
    +     '<div class="qrm-url"><iconify-icon icon="solar:link-bold" style="font-size:13px;color:var(--text-muted)"></iconify-icon><span>' + url + '</span></div>'
    +     '<div class="qrm-restrictions">'
    +       '<div class="qrm-restr-row"><iconify-icon icon="solar:close-circle-bold" style="font-size:14px;color:#EF4444"></iconify-icon><span>Garson Çağır yok</span></div>'
    +       '<div class="qrm-restr-row"><iconify-icon icon="solar:close-circle-bold" style="font-size:14px;color:#EF4444"></iconify-icon><span>Sipariş Ver yok</span></div>'
    +       '<div class="qrm-restr-row"><iconify-icon icon="solar:close-circle-bold" style="font-size:14px;color:#EF4444"></iconify-icon><span>Ödeme Yap yok</span></div>'
    +       '<div class="qrm-restr-row"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon><span>Dijital katalog görünümü</span></div>'
    +     '</div>'
    +     '<div class="qrm-actions">'
    +       '<button class="qrm-btn qrm-btn--primary" onclick="_qrmPrint(\'general\')"><iconify-icon icon="solar:printer-bold" style="font-size:15px"></iconify-icon>Yazdır</button>'
    +       '<button class="qrm-btn qrm-btn--outline" onclick="_qrmDownload(\'general\')"><iconify-icon icon="solar:download-bold" style="font-size:15px"></iconify-icon>İndir</button>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '</div>';
}

/* ─ Toggle kartı ─ */
function _qrmToggleCard(on, tableCount) {
  return '<div class="qrm-toggle-card' + (on ? ' on' : '') + '">'
    + '<div class="qrm-toggle-head">'
    +   '<div class="qrm-head-ico" style="background:rgba(249,115,22,.12);color:#F97316"><iconify-icon icon="solar:sofa-2-bold" style="font-size:22px"></iconify-icon></div>'
    +   '<div style="flex:1">'
    +     '<div class="qrm-head-title">Masalara Özel QR Oluştur ve Sipariş Al</div>'
    +     '<div class="qrm-head-sub">' + tableCount + ' masa tanımlı</div>'
    +   '</div>'
    +   '<div class="qrm-switch' + (on ? ' on' : '') + '" onclick="_qrmToggle()"><div class="qrm-switch-dot"></div></div>'
    + '</div>'
    + '<div class="qrm-toggle-info">'
    +   '<iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#F97316;flex-shrink:0"></iconify-icon>'
    +   '<span>Masaya özel QR kodlar müşterilerin doğrudan masadan <b>sipariş vermesini ve ödeme yapmasını</b> sağlar. Kapalıyken müşteriler menüyü sadece inceleyebilir.</span>'
    + '</div>'
    + '</div>';
}

function _qrmToggle() {
  var branch = _qrmBranch();
  if (!branch) return;
  branch.tableQRMode = !branch.tableQRMode;
  if (typeof _admToast === 'function') _admToast(branch.tableQRMode ? 'Masaya özel QR modu açıldı' : 'Masaya özel QR modu kapatıldı', 'ok');
  _qrmRerender();
}

function _qrmRerender() {
  var o = document.getElementById('bizQRMenuOverlay');
  if (!o) return;
  var content = o.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _qrmBody();
}

/* ─ Masa listesi (toggle AÇIK ise) ─ */
function _qrmTablesSection(zones, tables) {
  var header = '<div class="qrm-section-head">'
    + '<div style="flex:1">'
    +   '<div class="qrm-section-title">Masa QR Kodları</div>'
    +   '<div class="qrm-section-sub">Bir masaya dokun, QR\'ını büyüt ve indir</div>'
    + '</div>'
    + '<button class="qrm-bulk-btn" onclick="_qrmDownloadAll()"><iconify-icon icon="solar:download-bold" style="font-size:15px"></iconify-icon>Tüm QR\'ları İndir (PDF)</button>'
    + '</div>';

  if (!tables.length) {
    return header + '<div class="qrm-empty"><iconify-icon icon="solar:sofa-2-linear" style="font-size:48px;opacity:.3"></iconify-icon><div>Bu şubede masa tanımlı değil</div></div>';
  }

  var zoneHtml = '';
  if (zones.length) {
    zones.forEach(function(z){
      var zTables = tables.filter(function(t){ return t.zoneId === z.id; });
      if (!zTables.length) return;
      zoneHtml += '<div class="qrm-zone">'
        + '<div class="qrm-zone-head"><iconify-icon icon="' + z.icon + '" style="font-size:15px;color:' + z.color + '"></iconify-icon><span style="color:' + z.color + '">' + z.name + '</span><span class="qrm-zone-count">' + zTables.length + '</span></div>'
        + '<div class="qrm-table-grid">';
      zTables.forEach(function(t){
        zoneHtml += _qrmTableCard(t);
      });
      zoneHtml += '</div></div>';
    });
  } else {
    zoneHtml += '<div class="qrm-table-grid">';
    tables.forEach(function(t){ zoneHtml += _qrmTableCard(t); });
    zoneHtml += '</div>';
  }
  return header + zoneHtml;
}

function _qrmTableCard(t) {
  var label = t.zoneId && (t.zoneId.indexOf('zone_4') > -1) ? 'VIP ' + t.number : 'Masa ' + t.number;
  return '<div class="qrm-table-card" onclick="_qrmOpenTable(\'' + t.id + '\')">'
    + '<div class="qrm-mini-qr">' + _qrmImg(_qrmTableUrl(t.id), 90) + '</div>'
    + '<div style="flex:1;min-width:0">'
    +   '<div class="qrm-table-name">' + label + '</div>'
    +   '<div class="qrm-table-cap">' + t.capacity + ' kişi</div>'
    +   '<div class="qrm-active-badge"><iconify-icon icon="solar:bolt-circle-bold" style="font-size:11px"></iconify-icon>Sipariş + Garson + Hesap aktif</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>'
    + '</div>';
}

/* ─ Masa detay (büyük QR) ─ */
function _qrmOpenTable(tableId) {
  var t = BIZ_TABLES.find(function(x){ return x.id === tableId; });
  if (!t) return;
  var label = (t.zoneId && t.zoneId.indexOf('zone_4') > -1) ? 'VIP ' + t.number : 'Masa ' + t.number;
  var url = _qrmTableUrl(t.id);

  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'qrmTableModal';
  m.className = 'qrm-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) m.remove(); };
  m.innerHTML = '<div class="qrm-modal">'
    + '<div class="qrm-modal-head">'
    +   '<div class="qrm-modal-close" onclick="document.getElementById(\'qrmTableModal\').remove()"><iconify-icon icon="solar:close-circle-bold" style="font-size:24px;color:var(--text-muted)"></iconify-icon></div>'
    +   '<div class="qrm-modal-title">' + label + '</div>'
    +   '<div class="qrm-modal-sub">' + t.capacity + ' kişi · Tam interaktif mod</div>'
    + '</div>'
    + '<div class="qrm-modal-body">'
    +   '<div class="qrm-big-qr">' + _qrmImg(url, 280) + '</div>'
    +   '<div class="qrm-url-chip"><iconify-icon icon="solar:link-bold" style="font-size:14px"></iconify-icon><span>' + url + '</span></div>'
    +   '<div class="qrm-feature-list">'
    +     '<div class="qrm-feat"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon>Sipariş ver — masadan doğrudan</div>'
    +     '<div class="qrm-feat"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon>Garson çağır — tek tıkla</div>'
    +     '<div class="qrm-feat"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon>Hesap iste / öde</div>'
    +     '<div class="qrm-feat"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#22C55E"></iconify-icon>Otomatik masa atama</div>'
    +   '</div>'
    +   '<div class="qrm-actions">'
    +     '<button class="qrm-btn qrm-btn--primary" onclick="_qrmPrint(\'table\',\'' + t.id + '\')"><iconify-icon icon="solar:printer-bold" style="font-size:15px"></iconify-icon>Yazdır</button>'
    +     '<button class="qrm-btn qrm-btn--outline" onclick="_qrmDownload(\'table\',\'' + t.id + '\')"><iconify-icon icon="solar:download-bold" style="font-size:15px"></iconify-icon>PNG İndir</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

/* ─ Aksiyonlar ─ */
function _qrmPrint(kind, tableId) {
  var url = kind === 'table' ? _qrmTableUrl(tableId) : _qrmGeneralUrl();
  var branch = _qrmBranch();
  var title = branch ? branch.name : 'Şube';
  var sub = kind === 'table'
    ? (function(){ var t = BIZ_TABLES.find(function(x){ return x.id === tableId; }); return 'Masa ' + (t ? t.number : '?'); })()
    : 'Genel Menü';
  var imgUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent(url) + '&margin=12&format=png';
  var win = window.open('', '_blank');
  if (!win) { alert('Tarayıcınız yeni pencere engellemiş olabilir. Yazdırma için lütfen izin verin.'); return; }
  win.document.write('<html><head><title>QR · ' + title + '</title><style>body{font-family:system-ui;text-align:center;padding:40px;margin:0}h1{margin:0 0 6px;font-size:28px}h2{margin:0 0 24px;font-weight:500;color:#555;font-size:18px}img{border:1px solid #e5e7eb;border-radius:12px}.u{margin-top:20px;font-family:monospace;color:#666;font-size:14px}</style></head><body><h1>' + title + '</h1><h2>' + sub + '</h2><img src="' + imgUrl + '"><div class="u">' + url + '</div><script>window.onload=function(){setTimeout(function(){window.print();},500)};<\/script></body></html>');
  win.document.close();
}

function _qrmDownload(kind, tableId) {
  var url = kind === 'table' ? _qrmTableUrl(tableId) : _qrmGeneralUrl();
  var imgUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=' + encodeURIComponent(url) + '&margin=12&format=png&download=1';
  var a = document.createElement('a');
  a.href = imgUrl;
  a.download = 'qr-' + (kind === 'table' ? 'masa-' + tableId : 'genel-' + _qrm.branchId) + '.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof _admToast === 'function') _admToast('QR indiriliyor', 'ok');
}

function _qrmDownloadAll() {
  var branch = _qrmBranch();
  if (!branch) return;
  var tables = BIZ_TABLES.filter(function(t){ return t.branchId === _qrm.branchId; });
  if (!tables.length) { alert('Masa yok'); return; }
  // Demoda tek sayfalı yazdırma ekranı açalım — gerçek PDF'yi server-side üretirdi
  var win = window.open('', '_blank');
  if (!win) { alert('Yeni pencere engellendi'); return; }
  var html = '<html><head><title>' + branch.name + ' · Tüm Masa QR Kodları</title><style>body{font-family:system-ui;margin:0;padding:32px;background:#fff}h1{font-size:22px;margin:0 0 4px}h2{font-size:13px;color:#666;font-weight:500;margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.card{border:1px solid #e5e7eb;border-radius:16px;padding:18px;text-align:center;page-break-inside:avoid}.card h3{margin:0 0 6px;font-size:16px}.card p{margin:0 0 14px;font-size:11px;color:#666}.card img{width:220px;height:220px;border-radius:8px}.u{margin-top:10px;font-family:monospace;font-size:10px;color:#999}@media print{body{padding:0}.grid{gap:12px}}</style></head><body>';
  html += '<h1>' + branch.name + ' — Masa QR Kodları</h1><h2>' + tables.length + ' masa · ' + new Date().toLocaleDateString('tr-TR') + '</h2>';
  html += '<div class="grid">';
  tables.forEach(function(t){
    var lbl = (t.zoneId && t.zoneId.indexOf('zone_4') > -1) ? 'VIP ' + t.number : 'Masa ' + t.number;
    var url = _qrmTableUrl(t.id);
    var imgUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(url) + '&margin=10&format=png';
    html += '<div class="card"><h3>' + lbl + '</h3><p>' + t.capacity + ' kişi</p><img src="' + imgUrl + '"><div class="u">' + url + '</div></div>';
  });
  html += '</div><script>window.onload=function(){setTimeout(function(){window.print();},800)};<\/script></body></html>';
  win.document.write(html);
  win.document.close();
  if (typeof _admToast === 'function') _admToast(tables.length + ' masa QR\'ı hazırlanıyor', 'ok');
}

/* ─ Styles ─ */
function _qrmInjectStyles() {
  if (document.getElementById('qrmStyles')) return;
  var s = document.createElement('style');
  s.id = 'qrmStyles';
  s.textContent = [
    '.qrm-wrap{display:flex;flex-direction:column;gap:14px;padding-bottom:24px}',
    '.qrm-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:16px;overflow:hidden}',
    '.qrm-card--general{background:linear-gradient(135deg,rgba(59,130,246,.05),var(--bg-phone))}',
    '.qrm-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}',
    '.qrm-head-ico{width:40px;height:40px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.qrm-head-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.qrm-head-sub{font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.qrm-main{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}',
    '.qrm-qr{flex-shrink:0;padding:6px;background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-lg)}',
    '.qrm-meta{flex:1;min-width:180px;display:flex;flex-direction:column;gap:10px}',
    '.qrm-url{display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--bg-btn);border-radius:var(--r-md);font:var(--fw-medium) 11.5px/1 var(--font);color:var(--text-secondary);font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-all}',
    '.qrm-restrictions{display:flex;flex-direction:column;gap:4px}',
    '.qrm-restr-row{display:flex;align-items:center;gap:6px;font:var(--fw-medium) 11.5px/1.2 var(--font);color:var(--text-secondary)}',
    '.qrm-actions{display:flex;gap:8px;margin-top:auto}',
    '.qrm-btn{flex:1;padding:10px 12px;border-radius:var(--r-md);border:none;font:var(--fw-semibold) 12px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s}',
    '.qrm-btn:active{transform:scale(.97)}',
    '.qrm-btn--primary{background:var(--primary);color:#fff}',
    '.qrm-btn--outline{background:var(--bg-phone);color:var(--text-primary);border:1px solid var(--border-subtle)}',
    '/* Toggle card */',
    '.qrm-toggle-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-sm)}',
    '.qrm-toggle-card.on{border-color:#F97316;background:linear-gradient(135deg,rgba(249,115,22,.05),var(--bg-phone))}',
    '.qrm-toggle-head{display:flex;align-items:center;gap:12px;margin-bottom:10px}',
    '.qrm-switch{width:46px;height:26px;border-radius:var(--r-full);background:var(--glass-card-strong);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}',
    '.qrm-switch.on{background:#F97316}',
    '.qrm-switch-dot{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s}',
    '.qrm-switch.on .qrm-switch-dot{left:23px}',
    '.qrm-toggle-info{display:flex;align-items:flex-start;gap:6px;padding:10px 12px;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.22);border-radius:var(--r-md);font:var(--fw-regular) 11.5px/1.5 var(--font);color:var(--text-secondary)}',
    '.qrm-toggle-info b{font-weight:700;color:var(--text-primary)}',
    '/* Table section */',
    '.qrm-section-head{display:flex;align-items:flex-end;gap:10px;margin-top:4px}',
    '.qrm-section-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.qrm-section-sub{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.qrm-bulk-btn{padding:8px 12px;border-radius:var(--r-md);border:1px solid var(--primary);background:var(--primary-light);color:var(--primary);font:var(--fw-bold) 11.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px;flex-shrink:0}',
    '.qrm-bulk-btn:active{transform:scale(.97)}',
    '.qrm-zone{margin-top:10px}',
    '.qrm-zone-head{display:flex;align-items:center;gap:6px;padding:6px 2px 8px;font:var(--fw-bold) 11px/1 var(--font);letter-spacing:.4px;text-transform:uppercase}',
    '.qrm-zone-count{margin-left:auto;padding:2px 8px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-muted);font:var(--fw-bold) 9.5px/1.4 var(--font)}',
    '.qrm-table-grid{display:flex;flex-direction:column;gap:8px}',
    '.qrm-table-card{display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);cursor:pointer;transition:all .15s;box-shadow:var(--shadow-sm)}',
    '.qrm-table-card:hover{transform:translateY(-1px);box-shadow:var(--shadow-md)}',
    '.qrm-mini-qr{width:74px;height:74px;padding:3px;background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-md);flex-shrink:0;overflow:hidden}',
    '.qrm-mini-qr img{width:100%;height:100%;display:block}',
    '.qrm-table-name{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.qrm-table-cap{font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);margin-top:3px}',
    '.qrm-active-badge{display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:3px 8px;border-radius:var(--r-full);background:rgba(34,197,94,.12);color:#16A34A;font:var(--fw-bold) 9.5px/1.4 var(--font);letter-spacing:.2px}',
    '.qrm-empty{padding:48px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--text-muted);font:var(--fw-medium) 12px/1 var(--font)}',
    '/* Modal */',
    '.qrm-modal-backdrop{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}',
    '.qrm-modal-backdrop.open{opacity:1}',
    '.qrm-modal{width:100%;max-width:420px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(20px);transition:transform .28s ease;max-height:92vh;display:flex;flex-direction:column}',
    '.qrm-modal-backdrop.open .qrm-modal{transform:translateY(0)}',
    '.qrm-modal-head{padding:16px 16px 14px;border-bottom:1px solid var(--border-subtle);text-align:center;position:relative}',
    '.qrm-modal-close{position:absolute;top:12px;right:12px;cursor:pointer}',
    '.qrm-modal-title{font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary)}',
    '.qrm-modal-sub{font:var(--fw-regular) 11.5px/1.3 var(--font);color:var(--text-muted);margin-top:4px}',
    '.qrm-modal-body{padding:18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;align-items:stretch}',
    '.qrm-big-qr{align-self:center;padding:10px;background:#fff;border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-md)}',
    '.qrm-url-chip{align-self:center;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;background:var(--bg-btn);border-radius:var(--r-full);font:var(--fw-medium) 11px/1 var(--font);color:var(--text-secondary);font-family:ui-monospace,Menlo,Consolas,monospace}',
    '.qrm-feature-list{display:flex;flex-direction:column;gap:6px;padding:12px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.22);border-radius:var(--r-lg)}',
    '.qrm-feat{display:flex;align-items:center;gap:6px;font:var(--fw-medium) 11.5px/1.3 var(--font);color:var(--text-primary)}'
  ].join('\n');
  document.head.appendChild(s);
}

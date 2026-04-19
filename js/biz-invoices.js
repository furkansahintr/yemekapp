/* ═══ BIZ INVOICES — Faturalar ═══
   Şube detayından açılan fatura listesi + detay ekranı.
   - openBizInvoiceList(branchId): iki kategorili liste (service + commission)
   - openBizInvoiceDetail(invoiceId): özet + indir/e-posta + komisyon özet tablosu
*/

function _bizFmtTL(n) {
  return '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function _bizFmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  var months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function _bizInvoiceStatusChip(status) {
  var map = {
    paid:    { label: 'Ödendi',        bg: 'rgba(34,197,94,0.12)',  fg: '#16A34A' },
    pending: { label: 'Bekliyor',      bg: 'rgba(245,158,11,0.14)', fg: '#D97706' },
    overdue: { label: 'Vadesi Geçti',  bg: 'rgba(239,68,68,0.14)',  fg: '#DC2626' }
  };
  var s = map[status] || map.pending;
  return '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:' + s.fg + ';background:' + s.bg + ';padding:4px 8px;border-radius:var(--r-full);letter-spacing:0.2px">' + s.label + '</span>';
}

function _bizInvoiceTypeIcon(type) {
  if (type === 'commission') {
    return { icon: 'solar:hand-money-bold', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' };
  }
  return { icon: 'solar:star-bold', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' };
}

function _bizRenderInvoiceRow(inv) {
  var ic = _bizInvoiceTypeIcon(inv.type);
  var metaDate = inv.status === 'paid' ? _bizFmtDate(inv.paidAt || inv.issuedAt) : 'Son ödeme: ' + _bizFmtDate(inv.dueAt || inv.issuedAt);
  return '<div onclick="openBizInvoiceDetail(\'' + inv.id + '\')" style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border-bottom:1px solid var(--border-subtle)">'
    + '<div style="width:40px;height:40px;border-radius:var(--r-lg);background:' + ic.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="' + ic.icon + '" style="font-size:20px;color:' + ic.color + '"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1.3 var(--font);color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + inv.title + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + metaDate + ' · ' + inv.number + '</div>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">'
    + '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + _bizFmtTL(inv.amount) + '</span>'
    + _bizInvoiceStatusChip(inv.status)
    + '</div>'
    + '</div>';
}

function _bizRenderInvoiceGroup(title, subtitle, rows) {
  if (!rows.length) return '';
  var inner = '';
  for (var i = 0; i < rows.length; i++) inner += _bizRenderInvoiceRow(rows[i]);
  return '<div style="margin-bottom:20px">'
    + '<div style="padding:0 4px 10px">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">' + title + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px">' + subtitle + '</div>'
    + '</div>'
    + '<div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">'
    + inner
    + '</div>'
    + '</div>';
}

function openBizInvoiceList(branchId) {
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === branchId; });
  var branchName = branch ? branch.name : 'Şube';
  var all = bizInvoicesForBranch(branchId);
  var service    = all.filter(function(i){ return i.type === 'service'; });
  var commission = all.filter(function(i){ return i.type === 'commission'; });
  var unpaidTotal = all.filter(function(i){ return i.status !== 'paid'; }).reduce(function(s,i){ return s + i.amount; }, 0);
  var notifyEnabled = (localStorage.getItem('biz_invoice_notify_' + branchId) || '1') === '1';

  var summary = unpaidTotal > 0
    ? '<div style="background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(245,158,11,0.08));border:1px solid rgba(239,68,68,0.25);border-radius:var(--r-xl);padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:20px">'
      + '<iconify-icon icon="solar:bell-bing-bold" style="font-size:22px;color:#DC2626;flex-shrink:0"></iconify-icon>'
      + '<div style="flex:1">'
      +   '<div style="font:var(--fw-semibold) var(--fs-sm)/1.3 var(--font);color:var(--text-primary)">Ödenmemiş bakiye</div>'
      +   '<div style="font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:#DC2626;margin-top:3px">' + _bizFmtTL(unpaidTotal) + '</div>'
      + '</div>'
      + '</div>'
    : '';

  var notifyRow = '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);padding:12px 14px;display:flex;align-items:center;gap:12px;margin-top:8px">'
    + '<iconify-icon icon="solar:bell-bold" style="font-size:20px;color:#3B82F6;flex-shrink:0"></iconify-icon>'
    + '<div style="flex:1">'
    +   '<div style="font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)">Fatura Kesildiğinde Haber Ver</div>'
    +   '<div style="font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:2px">E-posta ve push bildirimi</div>'
    + '</div>'
    + '<div onclick="_bizToggleInvoiceNotify(\'' + branchId + '\')" id="bizInvNotifySwitch" style="width:40px;height:22px;border-radius:var(--r-full);background:' + (notifyEnabled ? 'var(--primary)' : 'var(--glass-card-strong)') + ';position:relative;cursor:pointer;transition:background .2s;flex-shrink:0">'
    +   '<div style="position:absolute;top:2px;left:' + (notifyEnabled ? '20px' : '2px') + ';width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:left .2s"></div>'
    + '</div>'
    + '</div>';

  var content = summary
    + _bizRenderInvoiceGroup('Anlık Hizmet Faturaları', 'Premium üyelik & reklam ödemeleri', service)
    + _bizRenderInvoiceGroup('Dönemsel Komisyon Faturaları', 'Ay sonu sipariş aracılık bedelleri', commission)
    + (all.length === 0
        ? '<div style="padding:40px 16px;text-align:center;color:var(--text-muted);font:var(--fw-medium) var(--fs-sm)/1.5 var(--font)">Bu şubeye ait fatura bulunmuyor.</div>'
        : '')
    + notifyRow;

  var overlay = createBizOverlay('bizInvoiceListOverlay', 'Faturalar · ' + branchName, content);
  document.getElementById('bizPhone').appendChild(overlay);
}

function _bizToggleInvoiceNotify(branchId) {
  var cur = (localStorage.getItem('biz_invoice_notify_' + branchId) || '1') === '1';
  localStorage.setItem('biz_invoice_notify_' + branchId, cur ? '0' : '1');
  openBizInvoiceList(branchId);
}

function openBizInvoiceDetail(invoiceId) {
  var inv = BIZ_INVOICES.find(function(i){ return i.id === invoiceId; });
  if (!inv) return;
  var branch = BIZ_BRANCHES.find(function(b){ return b.id === inv.branchId; });
  var ic = _bizInvoiceTypeIcon(inv.type);

  var header = '<div style="background:' + ic.bg + ';border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:18px 16px;display:flex;align-items:center;gap:14px;margin-bottom:16px">'
    + '<div style="width:48px;height:48px;border-radius:var(--r-lg);background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-sm)">'
    +   '<iconify-icon icon="' + ic.icon + '" style="font-size:26px;color:' + ic.color + '"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    +   '<div style="font:var(--fw-bold) var(--fs-lg)/1.3 var(--font);color:var(--text-primary)">' + inv.title + '</div>'
    +   '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:4px">' + inv.subtitle + '</div>'
    + '</div>'
    + '</div>';

  var summary = '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);overflow:hidden;margin-bottom:16px">'
    + _bizDetailRow('Fatura No', inv.number)
    + _bizDetailRow('Düzenleme Tarihi', _bizFmtDate(inv.issuedAt))
    + (inv.paidAt ? _bizDetailRow('Ödeme Tarihi', _bizFmtDate(inv.paidAt)) : _bizDetailRow('Son Ödeme Tarihi', _bizFmtDate(inv.dueAt || inv.issuedAt)))
    + _bizDetailRow('Durum', _bizInvoiceStatusChip(inv.status), true)
    + _bizDetailRow('Şube', branch ? branch.name : '—')
    + _bizDetailRow('Tutar (KDV Dahil)', '<span style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + _bizFmtTL(inv.amount) + '</span>', true)
    + '</div>';

  var commissionBlock = '';
  if (inv.type === 'commission' && inv.orderCount) {
    var netRev = (inv.grossRevenue || 0);
    commissionBlock = '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm);overflow:hidden;margin-bottom:16px">'
      + '<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px">'
      +   '<iconify-icon icon="solar:pie-chart-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon>'
      +   '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Harcama Detayı</span>'
      + '</div>'
      + _bizDetailRow('Sipariş Adedi', inv.orderCount + ' sipariş')
      + _bizDetailRow('Brüt Ciro', _bizFmtTL(netRev))
      + _bizDetailRow('Komisyon Oranı', '%' + (inv.commissionRate * 100).toFixed(0))
      + _bizDetailRow('Kesilen Komisyon', '<span style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:#8B5CF6">' + _bizFmtTL(inv.amount) + '</span>', true)
      + '<div onclick="alert(\'Detaylı rapor — yakında!\')" style="padding:12px 16px;display:flex;align-items:center;gap:8px;cursor:pointer;border-top:1px solid var(--border-subtle);color:#8B5CF6">'
      +   '<iconify-icon icon="solar:document-text-linear" style="font-size:16px"></iconify-icon>'
      +   '<span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);flex:1">Detaylı rapora git</span>'
      +   '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon>'
      + '</div>'
      + '</div>';
  }

  var actions = '<div style="display:flex;gap:10px;margin-bottom:16px">'
    + '<button onclick="_bizInvoiceDownload(\'' + inv.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-lg);border:none;background:var(--primary);color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">'
    +   '<iconify-icon icon="solar:download-linear" style="font-size:18px"></iconify-icon>PDF Olarak İndir'
    + '</button>'
    + '<button onclick="_bizInvoiceEmail(\'' + inv.id + '\')" style="flex:1;padding:14px;border-radius:var(--r-lg);border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-primary);font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">'
    +   '<iconify-icon icon="solar:letter-linear" style="font-size:18px"></iconify-icon>E-Posta Gönder'
    + '</button>'
    + '</div>';

  var payBtn = '';
  if (inv.status !== 'paid') {
    payBtn = '<button onclick="_bizInvoicePay(\'' + inv.id + '\')" style="width:100%;padding:14px;border-radius:var(--r-lg);border:none;background:#DC2626;color:#fff;font:var(--fw-semibold) var(--fs-md)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px">'
      + '<iconify-icon icon="solar:card-bold" style="font-size:18px"></iconify-icon>Şimdi Öde · ' + _bizFmtTL(inv.amount)
      + '</button>';
  }

  var overlay = createBizOverlay('bizInvoiceDetailOverlay', 'Fatura Detayı', header + summary + commissionBlock + payBtn + actions);
  document.getElementById('bizPhone').appendChild(overlay);
}

function _bizDetailRow(label, value, last) {
  var border = last ? '' : 'border-bottom:1px solid var(--border-subtle);';
  return '<div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;' + border + '">'
    + '<span style="font:var(--fw-regular) var(--fs-sm)/1.3 var(--font);color:var(--text-muted)">' + label + '</span>'
    + '<span style="font:var(--fw-medium) var(--fs-sm)/1.3 var(--font);color:var(--text-primary);text-align:right">' + value + '</span>'
    + '</div>';
}

function _bizInvoiceDownload(id) {
  alert('PDF indiriliyor: ' + id + ' — (demo)');
}

function _bizInvoiceEmail(id) {
  alert('E-posta gönderildi — (demo)');
}

function _bizInvoicePay(id) {
  var inv = BIZ_INVOICES.find(function(i){ return i.id === id; });
  if (!inv) return;
  if (!confirm(inv.title + '\n\n' + _bizFmtTL(inv.amount) + ' tutarında ödeme yapılacak. Onaylıyor musun?')) return;
  inv.status = 'paid';
  inv.paidAt = new Date().toISOString().slice(0, 10);
  document.getElementById('bizInvoiceDetailOverlay')?.remove();
  openBizInvoiceList(inv.branchId);
}

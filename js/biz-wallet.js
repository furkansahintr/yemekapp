/* ═══════════════════════════════════════════════════════════════
   CÜZDAN & TOKEN SİSTEMİ — UI-only dummy
   Token bakiye, yükleme, işlem geçmişi, kesinti detay pop-up
   ═══════════════════════════════════════════════════════════════ */

/* ── Seed Data ── */
var _WLT_BALANCE = 5640;
var _WLT_CRITICAL = 500;

var _WLT_PACKAGES = [
  { amount: 2500, bonus: 0,    label: '2.500 Token',  sub: '2.500 TL' },
  { amount: 5000, bonus: 1000, label: '5.000 Token',  sub: '5.000 TL · +1.000 Bonus' },
  { amount: 10000, bonus: 3000, label: '10.000 Token', sub: '10.000 TL · +3.000 Bonus' }
];

var _WLT_TRANSACTIONS = [
  { id: 'txn1', type: 'order',       date: '2026-04-16T13:22:00', amount: -40,   orderId: '#1042', orderTotal: 200,  commRate: 20, cancelType: null,       branch: 'Kadıköy Şube' },
  { id: 'txn2', type: 'user_cancel',  date: '2026-04-16T11:05:00', amount: -20,   orderId: '#1041', orderTotal: 200,  commRate: 20, cancelType: 'user',     branch: 'Kadıköy Şube' },
  { id: 'txn3', type: 'biz_cancel',   date: '2026-04-15T19:30:00', amount: -10,   orderId: '#1039', orderTotal: 200,  commRate: 20, cancelType: 'business', branch: 'Beşiktaş Şube' },
  { id: 'txn4', type: 'topup',        date: '2026-04-15T09:00:00', amount: 5000,  orderId: null,    orderTotal: null,  commRate: null, cancelType: null,     branch: null },
  { id: 'txn5', type: 'bonus',        date: '2026-04-15T09:00:00', amount: 1000,  orderId: null,    orderTotal: null,  commRate: null, cancelType: null,     branch: null },
  { id: 'txn6', type: 'order',        date: '2026-04-14T20:45:00', amount: -63,   orderId: '#1035', orderTotal: 450,  commRate: 14, cancelType: null,       branch: 'Kadıköy Şube' },
  { id: 'txn7', type: 'order',        date: '2026-04-14T18:10:00', amount: -27,   orderId: '#1033', orderTotal: 270,  commRate: 10, cancelType: null,       branch: 'Beşiktaş Şube' },
  { id: 'txn8', type: 'order',        date: '2026-04-13T14:30:00', amount: -18,   orderId: '#1029', orderTotal: 180,  commRate: 10, cancelType: null,       branch: 'Kadıköy Şube' },
  { id: 'txn9', type: 'user_cancel',  date: '2026-04-13T12:00:00', amount: -15,   orderId: '#1028', orderTotal: 300,  commRate: 10, cancelType: 'user',     branch: 'Beşiktaş Şube' },
  { id: 'txn10', type: 'topup',       date: '2026-04-10T10:00:00', amount: 2500,  orderId: null,    orderTotal: null,  commRate: null, cancelType: null,     branch: null },
  { id: 'txn11', type: 'order',       date: '2026-04-09T21:15:00', amount: -36,   orderId: '#1020', orderTotal: 360,  commRate: 10, cancelType: null,       branch: 'Kadıköy Şube' },
  { id: 'txn12', type: 'biz_cancel',  date: '2026-04-08T16:45:00', amount: -8,    orderId: '#1018', orderTotal: 320,  commRate: 10, cancelType: 'business', branch: 'Kadıköy Şube' }
];

/* ── Type Metadata ── */
var _WLT_TYPES = {
  order:       { label: 'Sipariş Komisyonu',  icon: 'solar:bag-check-bold',       color: '#EF4444' },
  user_cancel: { label: 'Kullanıcı İptali',   icon: 'solar:close-circle-bold',    color: '#F97316' },
  biz_cancel:  { label: 'İşletme İptali',     icon: 'solar:forbidden-circle-bold', color: '#F59E0B' },
  topup:       { label: 'Token Yükleme',       icon: 'solar:wallet-bold',          color: '#22C55E' },
  bonus:       { label: 'Bonus Token',         icon: 'solar:gift-bold',            color: '#A855F7' }
};

/* ── Styles ── */
function _wltInjectStyles() {
  if (document.getElementById('wltStyles')) return;
  var s = document.createElement('style');
  s.id = 'wltStyles';
  s.textContent = '\
    .wlt-fadeIn { animation: wltFadeIn .3s ease; }\
    @keyframes wltFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }\
    .wlt-pulse { animation: wltPulse 2s ease-in-out infinite; }\
    @keyframes wltPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.03); } }\
    .wlt-sheet { animation: wltSheetUp .3s ease; }\
    @keyframes wltSheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }\
  ';
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════
   A. CÜZDAN GİRİŞ TİLE (Preview Card)
   renderBizMyBusiness içine enjekte edilir
   ══════════════════════════════════════════ */
function _wltPreviewTileHtml() {
  if (typeof bizCurrentRole !== 'undefined' && bizCurrentRole !== 'owner' && bizCurrentRole !== 'manager') return '';
  var isLow = _WLT_BALANCE <= _WLT_CRITICAL;
  var borderColor = isLow ? '#F59E0B' : 'var(--border-subtle)';
  var bgGrad = isLow ? 'linear-gradient(135deg, rgba(245,158,11,0.12), var(--bg-phone))' : 'linear-gradient(135deg, rgba(34,197,94,0.08), var(--bg-phone))';
  var last = _WLT_TRANSACTIONS[0];
  var lastText = last ? ('Son İşlem: ' + (last.amount > 0 ? '+' : '') + _wltFmt(last.amount) + ' Token ' + (last.orderId || '')) : '';

  return '<div onclick="openBizWallet()" style="background:' + bgGrad + ';border-radius:var(--r-xl);border:1px solid ' + borderColor + ';box-shadow:var(--shadow-md);padding:16px;display:flex;align-items:center;gap:12px;cursor:pointer;margin-top:2px">'
    + '<div style="width:44px;height:44px;border-radius:var(--r-lg);background:' + (isLow ? '#F59E0B' : '#22C55E') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="solar:wallet-2-bold" style="font-size:22px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">Cüzdanım</span>'
    + (isLow ? '<span style="font:var(--fw-semibold) 10px/1 var(--font);color:#F59E0B;background:rgba(245,158,11,0.15);padding:3px 7px;border-radius:var(--r-full)">Düşük Bakiye</span>' : '')
    + '</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary);margin-top:4px">' + _wltFmt(_WLT_BALANCE) + ' Token</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + lastText + '</div>'
    + '</div>'
    + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:18px;color:var(--text-muted)"></iconify-icon>'
    + '</div>';
}

/* ══════════════════════════════════════════
   B. CÜZDAN DETAY SAYFASI (Dashboard)
   ══════════════════════════════════════════ */
function openBizWallet() {
  if (typeof bizCurrentRole !== 'undefined' && bizCurrentRole !== 'owner' && bizCurrentRole !== 'manager') return;
  _wltInjectStyles();

  var isLow = _WLT_BALANCE <= _WLT_CRITICAL;
  var balColor = isLow ? '#F59E0B' : '#22C55E';

  var overlay = document.createElement('div');
  overlay.id = 'bizWalletOverlay';
  overlay.className = 'prof-overlay open';
  overlay.innerHTML = '\
    <div class="prof-container" style="background:var(--bg-phone-secondary)">\
      <div class="prof-topbar" style="background:var(--bg-phone);border-bottom:1px solid var(--border-subtle)">\
        <div onclick="document.getElementById(\'bizWalletOverlay\').remove()" style="cursor:pointer;display:flex;align-items:center;gap:6px">\
          <iconify-icon icon="solar:alt-arrow-left-linear" style="font-size:22px;color:var(--text-primary)"></iconify-icon>\
        </div>\
        <div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Cüzdanım</div>\
        <div style="width:22px"></div>\
      </div>\
      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px" id="wltDashBody"></div>\
    </div>';
  document.getElementById('bizPhone').appendChild(overlay);

  var body = document.getElementById('wltDashBody');
  if (!body) return;

  /* Bakiye Kartı */
  var balCard = '<div class="wlt-fadeIn" style="background:linear-gradient(135deg, ' + balColor + '22, var(--bg-phone));border:1px solid ' + balColor + '55;border-radius:var(--r-xl);padding:20px;text-align:center;box-shadow:var(--shadow-md);position:relative;overflow:hidden">'
    + (isLow ? '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:#F59E0B"></div>' : '')
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Mevcut Bakiye</div>'
    + '<div style="font:var(--fw-bold) 48px/1 var(--font);color:var(--text-primary);margin-top:10px">' + _wltFmt(_WLT_BALANCE) + '</div>'
    + '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-muted);margin-top:6px">Token</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-tertiary);margin-top:4px">= ' + _wltFmt(_WLT_BALANCE) + ' TL</div>'
    + (isLow ? '<div style="margin-top:12px;background:rgba(245,158,11,0.12);border:1px dashed #F59E0B;border-radius:var(--r-lg);padding:10px 12px;display:flex;align-items:center;gap:8px"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:18px;color:#F59E0B;flex-shrink:0"></iconify-icon><span style="font:var(--fw-medium) var(--fs-xs)/1.3 var(--font);color:#F59E0B;text-align:left">Bakiyeniz kritik eşiğin altında. Hizmet kesintisini önlemek için token yükleyin.</span></div>' : '')
    + '<div onclick="_wltOpenTopup()" style="margin-top:14px;background:' + balColor + ';border-radius:var(--r-lg);padding:12px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;justify-content:center;width:100%">'
    + '<iconify-icon icon="solar:add-circle-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Token Yükle</span>'
    + '</div>'
    + '</div>';

  /* Bilgilendirme */
  var infoBar = '<div style="background:var(--primary-soft);border-radius:var(--r-lg);padding:12px 14px;display:flex;gap:10px;align-items:flex-start">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:20px;color:var(--primary);flex-shrink:0;margin-top:1px"></iconify-icon>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.45 var(--font);color:var(--text-secondary)">1 Token = 1 TL. Siparişlerden komisyon oranınız kadar, iptallerde ise azaltılmış oranlarda token kesilir. Detay için işleme dokunun.</div>'
    + '</div>';

  /* Kesinti Kuralları Özeti */
  var rulesCard = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'
    + '<div style="background:var(--bg-phone);border:1px solid #EF444433;border-radius:var(--r-lg);padding:10px;text-align:center">'
    + '<iconify-icon icon="solar:bag-check-bold" style="font-size:18px;color:#EF4444"></iconify-icon>'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#EF4444;margin-top:4px">%100</div>'
    + '<div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:3px">Tamamlanan Sipariş</div>'
    + '</div>'
    + '<div style="background:var(--bg-phone);border:1px solid #F9731633;border-radius:var(--r-lg);padding:10px;text-align:center">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:#F97316"></iconify-icon>'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#F97316;margin-top:4px">%50</div>'
    + '<div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:3px">Kullanıcı İptali</div>'
    + '</div>'
    + '<div style="background:var(--bg-phone);border:1px solid #F59E0B33;border-radius:var(--r-lg);padding:10px;text-align:center">'
    + '<iconify-icon icon="solar:forbidden-circle-bold" style="font-size:18px;color:#F59E0B"></iconify-icon>'
    + '<div style="font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:#F59E0B;margin-top:4px">%25</div>'
    + '<div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:3px">İşletme İptali</div>'
    + '</div>'
    + '</div>';

  /* İşlem Geçmişi */
  var txnHeader = '<div style="display:flex;align-items:center;justify-content:space-between">'
    + '<div style="display:flex;align-items:center;gap:8px">'
    + '<iconify-icon icon="solar:history-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İşlem Geçmişi</span>'
    + '</div>'
    + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + _WLT_TRANSACTIONS.length + ' işlem</span>'
    + '</div>';

  var txnList = '<div style="background:var(--bg-phone);border-radius:var(--r-xl);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md);overflow:hidden">';
  for (var i = 0; i < _WLT_TRANSACTIONS.length; i++) {
    var tx = _WLT_TRANSACTIONS[i];
    var meta = _WLT_TYPES[tx.type] || _WLT_TYPES.order;
    var isPositive = tx.amount > 0;
    var dateStr = _wltDate(tx.date);
    var clickable = (tx.type === 'order' || tx.type === 'user_cancel' || tx.type === 'biz_cancel');
    var onclick = clickable ? ' onclick="_wltOpenDetail(\'' + tx.id + '\')"' : '';
    var cursor = clickable ? 'cursor:pointer;' : '';

    txnList += '<div' + onclick + ' style="padding:12px 14px;display:flex;align-items:center;gap:12px;' + cursor + (i < _WLT_TRANSACTIONS.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
      + '<div style="width:36px;height:36px;border-radius:var(--r-md);background:' + meta.color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      + '<iconify-icon icon="' + meta.icon + '" style="font-size:18px;color:' + meta.color + '"></iconify-icon>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)">' + meta.label + '</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + dateStr + (tx.branch ? ' · ' + tx.branch : '') + (tx.orderId ? ' · ' + tx.orderId : '') + '</div>'
      + '</div>'
      + '<div style="text-align:right;flex-shrink:0">'
      + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + (isPositive ? '#22C55E' : '#EF4444') + '">' + (isPositive ? '+' : '') + _wltFmt(tx.amount) + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-tertiary);margin-top:2px">Token</div>'
      + '</div>'
      + (clickable ? '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:16px;color:var(--text-tertiary)"></iconify-icon>' : '')
      + '</div>';
  }
  txnList += '</div>';

  body.innerHTML = balCard + infoBar + rulesCard + txnHeader + txnList + '<div style="height:20px"></div>';
}


/* ══════════════════════════════════════════
   C. İŞLEM DETAY POP-UP (Transparency Tool)
   ══════════════════════════════════════════ */
function _wltOpenDetail(txnId) {
  var tx = _WLT_TRANSACTIONS.find(function(t) { return t.id === txnId; });
  if (!tx) return;
  _wltInjectStyles();

  var meta = _WLT_TYPES[tx.type] || _WLT_TYPES.order;
  var dateStr = _wltDate(tx.date);

  /* Hesaplama mantığı */
  var commAmount = 0;
  var formulaHtml = '';
  var cancelLabel = '';
  var cancelMultiplier = '';

  if (tx.type === 'order') {
    commAmount = Math.abs(tx.amount);
    formulaHtml = ''
      + _wltFormulaRow('Sipariş Tutarı', _wltFmt(tx.orderTotal) + ' TL')
      + _wltFormulaRow('Komisyon Oranı', '%' + tx.commRate)
      + '<div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>'
      + _wltFormulaRow('Hesaplama', tx.orderTotal + ' × ' + tx.commRate + '% = ' + commAmount + ' Token', true)
      + '<div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>'
      + _wltFormulaRow('Kesinti Miktarı', '-' + _wltFmt(commAmount) + ' Token', false, '#EF4444');
  } else if (tx.type === 'user_cancel') {
    cancelLabel = 'Kullanıcı İptali';
    cancelMultiplier = '%50';
    var fullComm = tx.orderTotal * tx.commRate / 100;
    commAmount = Math.abs(tx.amount);
    formulaHtml = ''
      + _wltFormulaRow('Sipariş Tutarı', _wltFmt(tx.orderTotal) + ' TL')
      + _wltFormulaRow('Komisyon Oranı', '%' + tx.commRate)
      + _wltFormulaRow('Tam Komisyon', _wltFmt(fullComm) + ' Token')
      + '<div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>'
      + _wltFormulaRow('İptal Tipi', cancelLabel + ' (' + cancelMultiplier + ' uygulanır)', false, '#F97316')
      + _wltFormulaRow('Hesaplama', _wltFmt(fullComm) + ' × 50% = ' + _wltFmt(commAmount) + ' Token', true)
      + '<div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>'
      + _wltFormulaRow('Kesinti Miktarı', '-' + _wltFmt(commAmount) + ' Token', false, '#F97316');
  } else if (tx.type === 'biz_cancel') {
    cancelLabel = 'İşletme İptali';
    cancelMultiplier = '%25';
    var fullComm2 = tx.orderTotal * tx.commRate / 100;
    commAmount = Math.abs(tx.amount);
    formulaHtml = ''
      + _wltFormulaRow('Sipariş Tutarı', _wltFmt(tx.orderTotal) + ' TL')
      + _wltFormulaRow('Komisyon Oranı', '%' + tx.commRate)
      + _wltFormulaRow('Tam Komisyon', _wltFmt(fullComm2) + ' Token')
      + '<div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>'
      + _wltFormulaRow('İptal Tipi', cancelLabel + ' (' + cancelMultiplier + ' uygulanır)', false, '#F59E0B')
      + _wltFormulaRow('Hesaplama', _wltFmt(fullComm2) + ' × 25% = ' + _wltFmt(commAmount) + ' Token', true)
      + '<div style="height:1px;background:var(--border-subtle);margin:6px 0"></div>'
      + _wltFormulaRow('Kesinti Miktarı', '-' + _wltFmt(commAmount) + ' Token', false, '#F59E0B');
  }

  var popup = document.createElement('div');
  popup.id = 'wltDetailPopup';
  popup.style.cssText = 'position:fixed;inset:0;z-index:85;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center;padding:0';
  popup.onclick = function(e) { if (e.target === popup) popup.remove(); };

  popup.innerHTML = '<div class="wlt-sheet" style="background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;width:100%;max-width:420px;max-height:85vh;overflow-y:auto;padding:20px;box-shadow:var(--shadow-lg)">'
    /* Handle */
    + '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-subtle);margin:0 auto 16px"></div>'
    /* Header */
    + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
    + '<div style="width:44px;height:44px;border-radius:var(--r-lg);background:' + meta.color + '18;display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    + '<iconify-icon icon="' + meta.icon + '" style="font-size:22px;color:' + meta.color + '"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)">' + meta.label + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-top:3px">' + dateStr + (tx.branch ? ' · ' + tx.branch : '') + '</div>'
    + '</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:#EF4444">-' + _wltFmt(Math.abs(tx.amount)) + '</div>'
    + '</div>'
    /* Sipariş referansı */
    + (tx.orderId ? '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-lg);padding:10px 14px;display:flex;align-items:center;gap:8px;margin-bottom:14px"><iconify-icon icon="solar:document-text-linear" style="font-size:16px;color:var(--text-muted)"></iconify-icon><span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-secondary)">Sipariş ' + tx.orderId + '</span></div>' : '')
    /* Matematiksel Döküm */
    + '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;margin-bottom:14px">'
    + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px"><iconify-icon icon="solar:calculator-bold" style="font-size:16px;color:var(--primary)"></iconify-icon><span style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">Kesinti Hesaplaması</span></div>'
    + formulaHtml
    + '</div>'
    /* Açıklama */
    + '<div style="background:var(--primary-soft);border-radius:var(--r-lg);padding:12px 14px;display:flex;gap:10px;align-items:flex-start;margin-bottom:14px">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:18px;color:var(--primary);flex-shrink:0;margin-top:1px"></iconify-icon>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.45 var(--font);color:var(--text-secondary)">'
    + (tx.type === 'order' ? 'Tamamlanan siparişlerde güncel komisyon oranınızın tamamı kadar token kesilir.' : tx.type === 'user_cancel' ? 'Kullanıcı tarafından iptal edilen siparişlerde, komisyon oranının yarısı (%50) uygulanır.' : 'İşletme tarafından iptal edilen siparişlerde, komisyon oranının dörtte biri (%25) uygulanır.')
    + '</div></div>'
    /* Kapat */
    + '<div onclick="document.getElementById(\'wltDetailPopup\').remove()" style="background:var(--bg-btn);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;text-align:center;cursor:pointer">'
    + '<span style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-primary)">Kapat</span>'
    + '</div>'
    + '</div>';

  document.getElementById('bizPhone').appendChild(popup);
}


/* ══════════════════════════════════════════
   D. TOKEN YÜKLEME EKRANI (Bottom Sheet)
   ══════════════════════════════════════════ */
function _wltOpenTopup() {
  _wltInjectStyles();

  /* Kayıtlı kartlar (payments.js'ten) */
  var cards = (typeof _PAY_CARDS !== 'undefined') ? _PAY_CARDS : [];

  var sheet = document.createElement('div');
  sheet.id = 'wltTopupSheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:86;background:rgba(0,0,0,0.5);display:flex;align-items:flex-end;justify-content:center;padding:0';
  sheet.onclick = function(e) { if (e.target === sheet) sheet.remove(); };

  var packagesHtml = '';
  for (var i = 0; i < _WLT_PACKAGES.length; i++) {
    var pkg = _WLT_PACKAGES[i];
    var isBest = pkg.bonus > 0;
    packagesHtml += '<div onclick="_wltSelectPackage(' + i + ')" data-pkg-idx="' + i + '" style="background:var(--bg-phone);border:2px solid ' + (isBest && i === 1 ? 'var(--primary)' : 'var(--border-subtle)') + ';border-radius:var(--r-xl);padding:16px;cursor:pointer;position:relative;transition:border-color .2s">'
      + (pkg.bonus > 0 ? '<div style="position:absolute;top:-8px;right:12px;background:' + (i === 2 ? '#A855F7' : 'var(--primary)') + ';padding:3px 10px;border-radius:var(--r-full);font:var(--fw-semibold) 10px/1 var(--font);color:#fff">+' + _wltFmt(pkg.bonus) + ' Bonus</div>' : '')
      + '<div style="display:flex;align-items:center;justify-content:space-between">'
      + '<div>'
      + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">' + _wltFmt(pkg.amount) + '</div>'
      + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px">' + pkg.sub + '</div>'
      + '</div>'
      + '<div style="font:var(--fw-medium) var(--fs-md)/1 var(--font);color:var(--text-secondary)">' + _wltFmt(pkg.amount) + ' TL</div>'
      + '</div>'
      + '</div>';
  }

  var cardsHtml = '';
  if (cards.length > 0) {
    cardsHtml = '<div style="margin-top:14px">'
      + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Ödeme Yöntemi</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px">';
    for (var j = 0; j < cards.length; j++) {
      var c = cards[j];
      var brandIcon = c.brand === 'visa' ? 'logos:visa' : c.brand === 'mastercard' ? 'logos:mastercard' : 'solar:card-bold';
      cardsHtml += '<div onclick="_wltSelectCard(' + j + ')" data-card-idx="' + j + '" style="background:var(--bg-phone);border:2px solid ' + (j === 0 ? 'var(--primary)' : 'var(--border-subtle)') + ';border-radius:var(--r-lg);padding:12px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:border-color .15s">'
        + '<iconify-icon icon="' + brandIcon + '" style="font-size:24px"></iconify-icon>'
        + '<div style="flex:1">'
        + '<span style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + (c.nick || c.brand) + '</span>'
        + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-left:8px">**** ' + c.last4 + '</span>'
        + '</div>'
        + (j === 0 ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px;color:var(--primary)"></iconify-icon>' : '<div style="width:18px;height:18px;border-radius:50%;border:2px solid var(--border-subtle)"></div>')
        + '</div>';
    }
    cardsHtml += '</div></div>';
  }

  sheet.innerHTML = '<div class="wlt-sheet" style="background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;width:100%;max-width:420px;max-height:85vh;overflow-y:auto;padding:20px;box-shadow:var(--shadow-lg)">'
    + '<div style="width:36px;height:4px;border-radius:2px;background:var(--border-subtle);margin:0 auto 16px"></div>'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'
    + '<iconify-icon icon="solar:wallet-bold" style="font-size:22px;color:var(--primary)"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Token Yükle</span>'
    + '</div>'
    + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Paket Seçin</div>'
    + '<div style="display:flex;flex-direction:column;gap:10px">'
    + packagesHtml
    + '</div>'
    + cardsHtml
    + '<div onclick="_wltConfirmTopup()" style="margin-top:16px;background:var(--primary);border-radius:var(--r-lg);padding:14px;text-align:center;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">'
    + '<iconify-icon icon="solar:card-send-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#fff">Ödemeyi Onayla</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-tertiary);text-align:center;margin-top:10px">1 Token = 1 TL · Bonus tokenler anında hesabınıza yüklenir.</div>'
    + '</div>';

  document.getElementById('bizPhone').appendChild(sheet);
}

var _wltSelectedPkg = 1;
var _wltSelectedCard = 0;

function _wltSelectPackage(idx) {
  _wltSelectedPkg = idx;
  var items = document.querySelectorAll('[data-pkg-idx]');
  items.forEach(function(el) {
    var isSelected = Number(el.dataset.pkgIdx) === idx;
    el.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border-subtle)';
  });
}

function _wltSelectCard(idx) {
  _wltSelectedCard = idx;
  var items = document.querySelectorAll('[data-card-idx]');
  items.forEach(function(el) {
    var isSelected = Number(el.dataset.cardIdx) === idx;
    el.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border-subtle)';
    var check = el.querySelector('iconify-icon[icon*="check"], div:last-child');
    if (check && check.tagName === 'ICONIFY-ICON') {
      check.style.display = isSelected ? 'block' : 'none';
    }
  });
}

function _wltConfirmTopup() {
  var pkg = _WLT_PACKAGES[_wltSelectedPkg];
  if (!pkg) return;

  /* Dummy: bakiye güncelle + işlem ekle */
  _WLT_BALANCE += pkg.amount + pkg.bonus;

  var now = new Date().toISOString();
  _WLT_TRANSACTIONS.unshift({
    id: 'txn_' + Date.now(),
    type: 'topup', date: now, amount: pkg.amount,
    orderId: null, orderTotal: null, commRate: null, cancelType: null, branch: null
  });
  if (pkg.bonus > 0) {
    _WLT_TRANSACTIONS.splice(1, 0, {
      id: 'txn_' + (Date.now() + 1),
      type: 'bonus', date: now, amount: pkg.bonus,
      orderId: null, orderTotal: null, commRate: null, cancelType: null, branch: null
    });
  }

  /* Sheet kapat, dashboard yenile */
  var sheet = document.getElementById('wltTopupSheet');
  if (sheet) sheet.remove();
  var overlay = document.getElementById('bizWalletOverlay');
  if (overlay) overlay.remove();
  openBizWallet();

  /* Toast */
  _wltToast('+' + _wltFmt(pkg.amount + pkg.bonus) + ' Token yüklendi!', 'ok');
}


/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function _wltFmt(n) {
  return Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function _wltDate(iso) {
  var d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function _wltFormulaRow(label, value, bold, color) {
  var fw = bold ? 'var(--fw-semibold)' : 'var(--fw-regular)';
  var c = color || 'var(--text-primary)';
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0">'
    + '<span style="font:var(--fw-regular) var(--fs-sm)/1 var(--font);color:var(--text-muted)">' + label + '</span>'
    + '<span style="font:' + fw + ' var(--fs-sm)/1 var(--font);color:' + c + '">' + value + '</span>'
    + '</div>';
}

function _wltToast(msg, type) {
  var bg = type === 'ok' ? '#22C55E' : type === 'err' ? '#EF4444' : '#333';
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:' + bg + ';color:#fff;padding:10px 20px;border-radius:var(--r-full);font:var(--fw-medium) var(--fs-sm)/1 var(--font);z-index:999;white-space:nowrap;box-shadow:var(--shadow-lg);animation:wltFadeIn .3s ease';
  t.textContent = msg;
  document.getElementById('bizPhone').appendChild(t);
  setTimeout(function() { t.remove(); }, 2500);
}

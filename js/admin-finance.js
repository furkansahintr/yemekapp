/* ═══════════════════════════════════════════════════════════
   ADMIN-FINANCE.JS — Komisyon & Finans Yönetimi
   ═══════════════════════════════════════════════════════════ */

function renderAdminFinance() {
  _admInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;

  /* Remove any existing overlay */
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var F = ADMIN_FINANCE;
  var B = ADMIN_BUSINESSES;

  /* Calculate top 5 commission-generating businesses */
  var bizWithCommission = B.map(function(biz) {
    return {
      id: biz.id,
      name: biz.name,
      monthlyOrders: biz.monthlyOrders,
      commission: biz.commission,
      totalCommission: (biz.monthlyOrders * biz.commission) / 100
    };
  }).sort(function(a, b) { return b.totalCommission - a.totalCommission; }).slice(0, 5);

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">';

  /* Bottom Sheet */
  html += '<div class="adm-sheet" style="width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;display:flex;flex-direction:column">';

  /* Header */
  html += '<div style="position:sticky;top:0;background:var(--bg-phone);padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;z-index:10">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:20px;color:var(--primary)"></iconify-icon>'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">Komisyon & Gelir</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Rapor ve analiz</div>'
    + '</div>'
    + '</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:18px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>';

  /* Content */
  html += '<div style="padding:16px;display:flex;flex-direction:column;gap:16px">';

  /* Big Revenue Card */
  html += '<div style="background:linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%);border-radius:var(--r-xl);padding:20px;color:#fff;position:relative;overflow:hidden">'
    + '<div style="position:absolute;right:-40px;top:-40px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,0.1)"></div>'
    + '<div style="position:relative;z-index:1">'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:0.8">Toplam Kazanılan Komisyon</div>'
    + '<div style="font:var(--fw-bold) var(--fs-xl)/1.1 var(--font);margin-top:8px">' + _admFmtTL(F.totalCommissionEarned) + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.2)">'
    + '<div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:0.7">Bu Ay</div>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);margin-top:4px">' + _admFmtTL(F.monthlyCommissionEarned) + '</div>'
    + '</div>'
    + '<div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);opacity:0.7">Bugün</div>'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1.1 var(--font);margin-top:4px">' + _admFmtTL(F.dailyCommissionEarned) + '</div>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '</div>';

  /* Commission Tier Table */
  html += '<div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<iconify-icon icon="solar:layers-bold" style="font-size:16px;color:var(--text-secondary)"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Komisyon Kademeleri</span>'
    + '</div>'
    + '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-lg);border:1px solid var(--border-subtle);overflow:hidden">';

  var tiers = [
    { rating: '5.0', commission: '5.5%', color: '#22C55E' },
    { rating: '4.8-4.9', commission: '7%', color: '#3B82F6' },
    { rating: '4.5-4.7', commission: '9%', color: '#8B5CF6' },
    { rating: '4.0-4.4', commission: '11%', color: '#F59E0B' },
    { rating: '3.5-3.9', commission: '13%', color: '#F97316' },
    { rating: '<3.5', commission: '15%', color: '#EF4444' }
  ];

  for (var t = 0; t < tiers.length; t++) {
    var tier = tiers[t];
    html += '<div style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;' + (t < tiers.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
      + '<div style="display:flex;align-items:center;gap:10px">'
      + '<div style="width:6px;height:6px;border-radius:50%;background:' + tier.color + ';flex-shrink:0"></div>'
      + '<div>'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary)">⭐ ' + tier.rating + '</div>'
      + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px">Yıldız Ortalaması</div>'
      + '</div>'
      + '</div>'
      + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + tier.color + '">' + tier.commission + '</div>'
      + '</div>';
  }

  html += '</div>'
    + '</div>';

  /* Token Economy Section */
  html += '<div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<iconify-icon icon="solar:coin-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Token Ekonomisi</span>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + _admTokenStat('Toplam Satılan Token', _admFmt(F.totalTokensSold), '#3B82F6')
    + _admTokenStat('Aktif Bakiye', _admFmt(F.activeTokenBalance), '#22C55E')
    + _admTokenStat('Aylık Token Satışı', _admFmtTL(F.monthlyTokensSold), '#8B5CF6')
    + _admTokenStat('Ort. Komisyon Oranı', F.avgCommissionRate.toFixed(1) + '%', '#F59E0B')
    + '</div>'
    + '</div>';

  /* Top 5 Commission-Generating Businesses */
  html += '<div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<iconify-icon icon="solar:shop-bold" style="font-size:16px;color:var(--primary)"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">En Yüksek Komisyon Sağlayanlar</span>'
    + '</div>'
    + '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-lg);border:1px solid var(--border-subtle);overflow:hidden">';

  for (var b = 0; b < bizWithCommission.length; b++) {
    var biz = bizWithCommission[b];
    var barWidth = Math.round((biz.totalCommission / bizWithCommission[0].totalCommission) * 100);
    html += '<div style="padding:12px 14px;' + (b < bizWithCommission.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : '') + '">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
      + '<div style="font:var(--fw-medium) var(--fs-sm)/1 var(--font);color:var(--text-primary);">' + (b + 1) + '. ' + biz.name + '</div>'
      + '<div style="font:var(--fw-bold) 11px/1 var(--font);color:var(--primary)">' + _admFmtTL(biz.totalCommission) + '</div>'
      + '</div>'
      + '<div style="height:6px;background:var(--border-subtle);border-radius:var(--r-full);overflow:hidden">'
      + '<div style="height:100%;width:' + barWidth + '%;background:linear-gradient(90deg,var(--primary),#8B5CF6);border-radius:var(--r-full)"></div>'
      + '</div>'
      + '<div style="font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:4px">' + biz.monthlyOrders + ' sipariş · %' + biz.commission + ' oran</div>'
      + '</div>';
  }

  html += '</div>'
    + '</div>';

  /* Pending Payouts */
  html += '<div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<iconify-icon icon="solar:cash-out-bold" style="font-size:16px;color:#F59E0B"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">Bekleyen Ödemeler</span>'
    + '</div>'
    + '<div style="background:linear-gradient(135deg,rgba(245,158,11,0.1) 0%,rgba(249,115,22,0.1) 100%);border:1px solid rgba(245,158,11,0.3);border-radius:var(--r-lg);padding:16px;text-align:center">'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:#F59E0B">' + _admFmtTL(F.pendingPayouts) + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:6px">Ödemeyi bekleyen miktar</div>'
    + '<button style="width:100%;margin-top:10px;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:var(--r-md);font:var(--fw-semibold) 12px/1 var(--font);cursor:pointer;transition:opacity .2s" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">Ödemeleri Gönder</button>'
    + '</div>'
    + '</div>';

  /* Refund Summary */
  html += '<div>'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
    + '<iconify-icon icon="solar:undo-left-bold" style="font-size:16px;color:#EF4444"></iconify-icon>'
    + '<span style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İade Özeti</span>'
    + '</div>'
    + '<div style="background:linear-gradient(135deg,rgba(239,68,68,0.1) 0%,rgba(249,115,22,0.1) 100%);border:1px solid rgba(239,68,68,0.3);border-radius:var(--r-lg);padding:16px">'
    + '<div style="display:flex;justify-content:space-between;align-items:center">'
    + '<div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Bu Ayın İadeleri</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:#EF4444;margin-top:6px">' + _admFmtTL(F.refundsThisMonth) + '</div>'
    + '</div>'
    + '<div style="text-align:right">'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Toplam İadelerin</div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:#EF4444;margin-top:6px">' + ((F.refundsThisMonth / (F.monthlyCommissionEarned + F.refundsThisMonth)) * 100).toFixed(1) + '%</div>'
    + '</div>'
    + '</div>'
    + '</div>';

  html += '<div style="height:20px"></div>';
  html += '</div></div></div>';

  adminPhone.appendChild(document.createRange().createContextualFragment(html));
}

/* ─── Token Stat Mini Card ─── */
function _admTokenStat(label, value, color) {
  return '<div style="background:var(--bg-phone-secondary);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;text-align:center">'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + '">' + value + '</div>'
    + '<div style="font:var(--fw-regular) 10px/1.2 var(--font);color:var(--text-muted);margin-top:4px">' + label + '</div>'
    + '</div>';
}

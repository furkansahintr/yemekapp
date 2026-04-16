/* ═══════════════════════════════════════════════════════════
   ADMIN BUSINESSES — İşletme Yönetimi
   ═══════════════════════════════════════════════════════════ */

var _admBizFilter = 'all';

function renderAdminBusinesses() {
  _admInjectStyles();
  var c = document.getElementById('adminBusinessesContainer');
  if (!c) return;

  var html = '<div class="adm-fadeIn" style="padding:16px;display:flex;flex-direction:column;gap:14px">';

  /* Header */
  html += '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-lg)/1 var(--font);color:var(--text-primary)">İşletme Yönetimi</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">Toplam ' + ADMIN_BUSINESSES.length + ' işletme</div>'
    + '</div>';

  /* Filter Tabs */
  html += '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px">'
    + _admBizFilterTab('Tümü', 'all')
    + _admBizFilterTab('Aktif', 'active')
    + _admBizFilterTab('Askıda', 'suspended')
    + _admBizFilterTab('Bekleyen', 'pending')
    + '</div>';

  /* Business Cards */
  var filtered = ADMIN_BUSINESSES.filter(function(b) {
    return _admBizFilter === 'all' || b.status === _admBizFilter;
  });

  if (filtered.length === 0) {
    html += '<div style="text-align:center;padding:40px 20px">'
      + '<iconify-icon icon="solar:folder-open-bold" style="font-size:48px;color:var(--text-muted);opacity:0.5"></iconify-icon>'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-muted);margin-top:12px">İşletme bulunamadı</div>'
      + '</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:10px">';
    for (var i = 0; i < filtered.length; i++) {
      var b = filtered[i];
      var stColor = b.status === 'active' ? '#22C55E' : b.status === 'suspended' ? '#EF4444' : '#F59E0B';
      var stLabel = b.status === 'active' ? 'Aktif' : b.status === 'suspended' ? 'Askıda' : 'Bekleyen';
      var stars = '';
      for (var s = 0; s < 5; s++) {
        stars += s < Math.floor(b.rating) ? '★' : '☆';
      }
      html += '<div style="background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;cursor:pointer;transition:all .2s;box-shadow:var(--shadow-sm)" onclick="_admOpenBizDetail(\'' + b.id + '\')" style="border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:12px;cursor:pointer;transition:all .2s">'
        + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">'
        + '<div style="flex:1">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
        + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)">' + b.name + '</div>'
        + '<span style="font:var(--fw-semibold) 9px/1 var(--font);color:#fff;background:' + stColor + ';padding:2px 6px;border-radius:var(--r-full)">' + stLabel + '</span>'
        + '</div>'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + b.owner + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-top:6px">'
        + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + b.city + '</span>'
        + '<span style="color:var(--text-tertiary)">·</span>'
        + '<span style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + b.branches + ' şube</span>'
        + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
        + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#F59E0B;letter-spacing:-1px">' + stars + '</div>'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + b.rating.toFixed(1) + '</div>'
        + '</div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-subtle)">'
        + '<div>'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Komisyon</div>'
        + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-top:2px">%' + b.commission + '</div>'
        + '</div>'
        + '<div>'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">Token Bakiyesi</div>'
        + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:' + (b.tokenBalance < 1000 ? '#EF4444' : 'var(--text-primary)') + ';margin-top:2px">' + _admFmt(b.tokenBalance) + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
    }
    html += '</div>';
  }

  html += '<div style="height:20px"></div></div>';
  c.innerHTML = html;
}

function _admBizFilterTab(label, value) {
  var isActive = _admBizFilter === value;
  return '<button style="padding:6px 14px;border-radius:var(--r-full);border:1px solid ' + (isActive ? 'var(--primary)' : 'var(--border-subtle)') + ';background:' + (isActive ? 'var(--primary-soft)' : 'transparent') + ';color:' + (isActive ? 'var(--primary)' : 'var(--text-secondary)') + ';font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;white-space:nowrap;transition:all .2s" onclick="_admBizFilterSet(\'' + value + '\')">' + label + '</button>';
}

function _admBizFilterSet(value) {
  _admBizFilter = value;
  renderAdminBusinesses();
}

function _admOpenBizDetail(bizId) {
  var biz = ADMIN_BUSINESSES.find(function(b) { return b.id === bizId; });
  if (!biz) return;

  var html = '<div class="prof-overlay open" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;z-index:78;animation:admFadeIn .3s ease">'
    + '<div style="position:absolute;top:0;left:0;right:0;bottom:0" onclick="this.parentElement.remove()"></div>'
    + '<div style="background:var(--bg-phone);width:100%;max-height:80vh;border-radius:var(--r-xl) var(--r-xl) 0 0;overflow-y:auto;position:relative;z-index:1;animation:admSheetUp .3s ease">'
    + '<div style="padding:16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg-phone);z-index:10">'
    + '<div style="font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)">İşletme Detayı</div>'
    + '<div style="width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="this.closest(\'.prof-overlay\').remove()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:20px;color:var(--text-secondary)"></iconify-icon>'
    + '</div>'
    + '</div>'
    + '<div style="padding:16px;display:flex;flex-direction:column;gap:16px">';

  /* Hero Card */
  var stColor = biz.status === 'active' ? '#22C55E' : biz.status === 'suspended' ? '#EF4444' : '#F59E0B';
  html += '<div style="background:linear-gradient(135deg,' + stColor + ' 0%,' + stColor + 'CC 100%);border-radius:var(--r-lg);padding:16px;color:#fff">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">'
    + '<div>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font)">' + biz.name + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:0.85;margin-top:4px">Sahibi: ' + biz.owner + '</div>'
    + '</div>'
    + '<span style="font:var(--fw-semibold) 10px/1 var(--font);background:rgba(255,255,255,0.25);padding:4px 8px;border-radius:var(--r-full);white-space:nowrap">' + (biz.plan === 'premium' ? 'Premium Plan' : 'Ücretsiz Plan') + '</span>'
    + '</div>'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);opacity:0.85;margin-top:8px">' + _admDate(biz.joinDate) + ' tarihinde katıldı</div>'
    + '</div>';

  /* Stats Grid */
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    + _admStatBox('Şubeler', biz.branches, '#3B82F6')
    + _admStatBox('Aylık Siparişler', _admFmt(biz.monthlyOrders), '#8B5CF6')
    + _admStatBox('Komisyon Oranı', '%' + biz.commission, '#F59E0B')
    + _admStatBox('Token Bakiyesi', _admFmtTL(biz.tokenBalance), '#22C55E')
    + '</div>';

  /* Action Buttons */
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  if (biz.status === 'pending') {
    html += '<button style="padding:12px;background:var(--primary);color:#fff;border:none;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s" onclick="_admToast(\'İşletme onaylandı\', \'ok\')">'
      + '<iconify-icon icon="solar:check-circle-bold" style="font-size:18px"></iconify-icon>'
      + 'Onayla'
      + '</button>';
  }
  html += '<button style="padding:12px;background:' + (biz.status === 'active' ? '#EF4444' : '#22C55E') + ';color:#fff;border:none;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s" onclick="_admToast(\'' + (biz.status === 'active' ? 'İşletme askıya alındı' : 'İşletme aktifleştirildi') + '\', \'ok\')">'
    + '<iconify-icon icon="' + (biz.status === 'active' ? 'solar:stop-circle-bold' : 'solar:play-circle-bold') + '" style="font-size:18px"></iconify-icon>'
    + (biz.status === 'active' ? 'Askıya Al' : 'Aktifleştir')
    + '</button>'
    + '<button style="padding:12px;background:var(--border-subtle);color:var(--text-primary);border:none;border-radius:var(--r-md);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s" onclick="_admToast(\'İşletme sayfası açılacak\', \'ok\')">'
    + '<iconify-icon icon="solar:arrow-right-bold" style="font-size:18px"></iconify-icon>'
    + 'İşletme Detayı'
    + '</button>'
    + '</div>';

  /* Recent Orders */
  var bizOrders = ADMIN_ORDERS.filter(function(o) { return o.business === biz.name; });
  if (bizOrders.length > 0) {
    html += '<div style="border-top:1px solid var(--border-subtle);padding-top:12px">'
      + '<div style="font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary);margin-bottom:10px">Son Siparişler</div>'
      + '<div style="display:flex;flex-direction:column;gap:8px">';
    for (var i = 0; i < Math.min(bizOrders.length, 3); i++) {
      var o = bizOrders[i];
      html += '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:8px;display:flex;align-items:center;justify-content:space-between">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + o.orderId + ' · ' + o.user + '</div>'
        + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:2px">' + _admRelative(o.date) + '</div>'
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
        + '<div style="font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)">' + _admFmtTL(o.total) + '</div>'
        + '</div>'
        + '</div>';
    }
    html += '</div></div>';
  }

  html += '</div>'
    + '</div>'
    + '</div>';

  document.getElementById('adminPhone').appendChild(document.createElement('div')).innerHTML = html;
}

function _admStatBox(label, value, color) {
  return '<div style="background:var(--bg-phone-secondary);border-radius:var(--r-md);padding:12px;text-align:center;border-left:3px solid ' + color + '">'
    + '<div style="font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted)">' + label + '</div>'
    + '<div style="font:var(--fw-bold) var(--fs-md)/1 var(--font);color:' + color + ';margin-top:6px">' + value + '</div>'
    + '</div>';
}

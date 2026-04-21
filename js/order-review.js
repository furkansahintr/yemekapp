/* ═══════════════════════════════════════════════════════════
   ORDER REVIEW — Sipariş Değerlendirme Sheet'i
   İşletme + Ürün bazlı 5-yıldız + yorum · Onayla → toast
   ═══════════════════════════════════════════════════════════ */

var _orv = {
  orderId: null,
  tab: 'biz',                // 'biz' | 'items'
  biz: { rating: 0, comment: '' },
  items: {},                 // { itemKey: { rating, comment } }
  submitting: false
};

function openOrderReview(orderId) {
  _orvInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.orv-sheet-bd');
  if (existing) existing.remove();

  var order = _orvFindOrder(orderId);
  if (!order) return;

  _orv.orderId = orderId;
  _orv.tab = 'biz';
  _orv.biz = { rating: 0, comment: '' };
  _orv.items = {};
  (order.items || []).forEach(function(it) {
    var key = it.name || String(Math.random());
    _orv.items[key] = { rating: 0, comment: '' };
  });
  _orv.submitting = false;

  var bd = document.createElement('div');
  bd.id = 'orvSheetBd';
  bd.className = 'orv-sheet-bd';
  bd.onclick = function(e) { if (e.target === bd) closeOrderReview(); };

  var sh = document.createElement('div');
  sh.id = 'orvSheet';
  sh.className = 'orv-sheet';
  sh.innerHTML = '<div id="orvSheetBody"></div>';

  bd.appendChild(sh);
  phone.appendChild(bd);
  requestAnimationFrame(function() {
    bd.classList.add('open');
    sh.classList.add('open');
  });

  _orvRender();
}

function closeOrderReview() {
  var bd = document.getElementById('orvSheetBd');
  if (!bd) return;
  bd.classList.remove('open');
  var sh = document.getElementById('orvSheet');
  if (sh) sh.classList.remove('open');
  setTimeout(function() { if (bd.parentNode) bd.remove(); }, 260);
}

function _orvFindOrder(id) {
  if (typeof _ordGetAll === 'function') {
    var all = _ordGetAll();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  }
  return null;
}

function _orvEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _orvRender() {
  var body = document.getElementById('orvSheetBody');
  if (!body) return;
  var order = _orvFindOrder(_orv.orderId);
  if (!order) return;

  // Header
  var h = '<div class="orv-head">'
    + '<div class="orv-close" onclick="closeOrderReview()">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="orv-title"><iconify-icon icon="solar:star-bold" style="font-size:17px;color:#F59E0B"></iconify-icon>Değerlendir</div>'
    + '<div class="orv-sub">' + _orvEsc(order.restaurant || '') + ' · ' + (order.items || []).length + ' ürün</div>'
    + '</div>'
    + '</div>';

  // Tabs
  h += '<div class="orv-tabs">'
    + '<button class="orv-tab' + (_orv.tab === 'biz' ? ' active' : '') + '" onclick="_orv.tab=\'biz\';_orvRender()">'
    + '<iconify-icon icon="solar:shop-bold" style="font-size:14px"></iconify-icon>İşletme</button>'
    + '<button class="orv-tab' + (_orv.tab === 'items' ? ' active' : '') + '" onclick="_orv.tab=\'items\';_orvRender()">'
    + '<iconify-icon icon="solar:dish-bold" style="font-size:14px"></iconify-icon>Ürünler (' + (order.items || []).length + ')</button>'
    + '</div>';

  // Content
  h += '<div class="orv-body" id="orvBody">';
  if (_orv.tab === 'biz') h += _orvRenderBizTab(order);
  else h += _orvRenderItemsTab(order);
  h += '</div>';

  // Footer (onayla)
  h += _orvRenderFooter(order);

  body.innerHTML = h;
}

/* ═══ P6 — Onayla Footer + Submit ═══ */
function _orvRenderFooter(order) {
  var bizOk = _orv.biz.rating > 0;
  var anyItemRated = Object.keys(_orv.items).some(function(k){ return (_orv.items[k].rating || 0) > 0; });
  var valid = bizOk || anyItemRated;

  var hint = !valid
    ? 'Onay için işletme veya en az bir ürün puanlanmalı'
    : (bizOk && anyItemRated ? 'Hazır — onayla ve tamamla' : (bizOk ? 'İstersen ürünleri de puanla' : 'İstersen işletmeyi de puanla'));

  return '<div class="orv-footer">'
    + '<div class="orv-footer-hint"><iconify-icon icon="solar:info-circle-linear" style="font-size:12px"></iconify-icon><span>' + _orvEsc(hint) + '</span></div>'
    + '<button class="orv-btn-submit' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_orvSubmit()"' : '') + '>'
    + (_orv.submitting
        ? '<iconify-icon icon="solar:refresh-linear" style="font-size:14px;animation:orvSpin 1s linear infinite"></iconify-icon>Gönderiliyor...'
        : '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Onayla')
    + '</button>'
    + '</div>';
}

function _orvSubmit() {
  if (_orv.submitting) return;
  _orv.submitting = true;
  _orvRender();

  setTimeout(function() {
    // Kayıt
    if (typeof USER_ORDER_REVIEWS === 'undefined') window.USER_ORDER_REVIEWS = {};
    var itemsOut = {};
    Object.keys(_orv.items).forEach(function(k) {
      if ((_orv.items[k].rating || 0) > 0 || (_orv.items[k].comment || '').length > 0) {
        itemsOut[k] = { rating: _orv.items[k].rating, comment: _orv.items[k].comment || '' };
      }
    });
    USER_ORDER_REVIEWS[_orv.orderId] = {
      biz: {
        rating: _orv.biz.rating,
        comment: _orv.biz.comment || '',
        createdAt: new Date().toISOString()
      },
      items: itemsOut
    };

    // Kapat ve teşekkür
    closeOrderReview();
    setTimeout(function() {
      _orvShowThanks();
    }, 280);

    // Sipariş detayını güncelle (Değerlendirildi pasif olacak)
    setTimeout(function() {
      var detailBody = document.getElementById('ordDetailBody');
      if (detailBody && typeof openOrderDetail === 'function') {
        openOrderDetail(_orv.orderId);
      }
    }, 420);
  }, 600);
}

function _orvShowThanks() {
  var phone = document.getElementById('phone');
  var existing = document.getElementById('orvThanks');
  if (existing) existing.remove();

  var m = document.createElement('div');
  m.id = 'orvThanks';
  m.className = 'orv-thanks-bd';
  m.onclick = function(e){ if (e.target === m) _orvCloseThanks(); };
  m.innerHTML = '<div class="orv-thanks">'
    + '<div class="orv-thanks-ico"><iconify-icon icon="solar:heart-angle-bold" style="font-size:52px;color:#F59E0B"></iconify-icon></div>'
    + '<div class="orv-thanks-title">Teşekkürler!</div>'
    + '<div class="orv-thanks-body">Değerlendirmeler topluluğa büyük katkı sunar, yapmış olduğun değerlendirmeler için teşekkür ederiz.</div>'
    + '<button class="orv-btn-submit" onclick="_orvCloseThanks()"><iconify-icon icon="solar:check-circle-bold" style="font-size:14px"></iconify-icon>Harika</button>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  // Oto kapat
  setTimeout(_orvCloseThanks, 4500);
}

function _orvCloseThanks() {
  var m = document.getElementById('orvThanks');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 260);
}

/* ═══ P4 — İşletme Tab ═══ */
function _orvRenderBizTab(order) {
  var rating = _orv.biz.rating || 0;
  var labels = ['', 'Çok kötü', 'Kötü', 'Fena değil', 'İyi', 'Harika!'];
  var labelColors = ['','#DC2626','#EA580C','#EAB308','#16A34A','#15803D'];

  var h = '<div class="orv-card">'
    + '<div class="orv-card-head">'
    + '<div class="orv-restaurant-ico"><iconify-icon icon="solar:shop-bold" style="font-size:22px;color:#F65013"></iconify-icon></div>'
    + '<div><div class="orv-card-title">' + _orvEsc(order.restaurant || '') + '</div>'
    + '<div class="orv-card-sub">Genel hizmet puanla</div></div>'
    + '</div>';

  // 5 star
  h += '<div class="orv-stars">';
  for (var i = 1; i <= 5; i++) {
    var filled = i <= rating;
    h += '<button class="orv-star' + (filled ? ' on' : '') + '" onclick="_orvSetBizRating(' + i + ')" aria-label="' + i + ' yıldız">'
      + '<iconify-icon icon="' + (filled ? 'solar:star-bold' : 'solar:star-linear') + '" style="font-size:38px"></iconify-icon>'
      + '</button>';
  }
  h += '</div>';

  // Label
  if (rating > 0) {
    h += '<div class="orv-rating-lbl" style="color:' + labelColors[rating] + '">' + labels[rating] + '</div>';
  } else {
    h += '<div class="orv-rating-hint">Puan vermek için yıldızlara dokun</div>';
  }

  // Comment
  h += '<textarea class="orv-note" placeholder="Deneyimini paylaş (opsiyonel)..." maxlength="240" oninput="_orv.biz.comment=this.value">' + _orvEsc(_orv.biz.comment) + '</textarea>'
    + '<div class="orv-note-counter">' + (_orv.biz.comment || '').length + '/240</div>'
    + '</div>';

  // Continue to items CTA
  h += '<button class="orv-btn-next" onclick="_orv.tab=\'items\';_orvRender()">'
    + 'Ürünleri Değerlendir <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon>'
    + '</button>';

  return h;
}

function _orvSetBizRating(n) {
  _orv.biz.rating = n;
  _orvRender();
}

/* ═══ P5 — Ürün Tab ═══ */
function _orvRenderItemsTab(order) {
  var items = order.items || [];
  if (items.length === 0) {
    return '<div class="orv-placeholder">Bu siparişte ürün bulunamadı</div>';
  }

  var h = '<div class="orv-items-intro">'
    + '<iconify-icon icon="solar:dish-linear" style="font-size:14px;color:#F65013"></iconify-icon>'
    + '<span>Her ürüne ayrı puan ve yorum verebilirsin</span>'
    + '</div>';

  h += '<div class="orv-items-list">';
  for (var i = 0; i < items.length; i++) {
    h += _orvItemCard(items[i], i);
  }
  h += '</div>';

  return h;
}

function _orvItemCard(item, idx) {
  var key = item.name || ('item_' + idx);
  var rec = _orv.items[key] || { rating: 0, comment: '' };
  if (!_orv.items[key]) _orv.items[key] = rec;

  var h = '<div class="orv-item-card">'
    + '<div class="orv-item-head">'
    + '<div class="orv-item-ico"><iconify-icon icon="solar:dish-bold" style="font-size:20px;color:#F59E0B"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="orv-item-name">' + _orvEsc(item.name || '—') + '</div>'
    + '<div class="orv-item-meta">'
    + (item.qty ? item.qty + ' adet' : '')
    + (item.price ? ' · ₺' + item.price : '')
    + '</div>'
    + '</div>'
    + '</div>';

  // Yıldızlar
  h += '<div class="orv-stars orv-stars--sm">';
  for (var s = 1; s <= 5; s++) {
    var filled = s <= rec.rating;
    h += '<button class="orv-star' + (filled ? ' on' : '') + '" onclick="_orvSetItemRating(\'' + _orvEscAttr(key) + '\',' + s + ')" aria-label="' + s + ' yıldız">'
      + '<iconify-icon icon="' + (filled ? 'solar:star-bold' : 'solar:star-linear') + '" style="font-size:26px"></iconify-icon>'
      + '</button>';
  }
  h += '</div>';

  // Yorum
  h += '<input type="text" class="orv-item-note" placeholder="Opsiyonel yorum..." maxlength="120" value="' + _orvEsc(rec.comment) + '" oninput="_orvSetItemComment(\'' + _orvEscAttr(key) + '\',this.value)">';

  h += '</div>';
  return h;
}

function _orvEscAttr(s) {
  return String(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function _orvSetItemRating(key, n) {
  if (!_orv.items[key]) _orv.items[key] = { rating: 0, comment: '' };
  _orv.items[key].rating = n;
  _orvRender();
}

function _orvSetItemComment(key, v) {
  if (!_orv.items[key]) _orv.items[key] = { rating: 0, comment: '' };
  _orv.items[key].comment = v;
  // Input olduğu için re-render yok — değer state'te zaten
}

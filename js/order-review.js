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
  else h += '<div class="orv-placeholder">Ürün tab (P5) yakında...</div>';
  h += '</div>';

  body.innerHTML = h;
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

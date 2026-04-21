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

/* ═══ Styles ═══ */
function _orvInjectStyles() {
  if (document.getElementById('orvStyles')) return;
  var s = document.createElement('style');
  s.id = 'orvStyles';
  s.textContent = [
    '/* Backdrop + sheet */',
    '.orv-sheet-bd{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:96;opacity:0;transition:opacity .24s ease}',
    '.orv-sheet-bd.open{opacity:1}',
    '.orv-sheet{width:100%;max-width:100%;background:var(--bg-phone);border-radius:22px 22px 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(.2,.9,.25,1);max-height:94vh;display:flex;flex-direction:column}',
    '.orv-sheet.open{transform:translateY(0)}',
    '.orv-sheet > div{display:flex;flex-direction:column;flex:1;min-height:0}',
    '/* Head */',
    '.orv-head{display:flex;align-items:center;gap:10px;padding:14px 16px 10px;background:var(--bg-phone);z-index:3;flex-shrink:0}',
    '.orv-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;border-radius:50%;background:var(--bg-phone-secondary)}',
    '.orv-close:active{transform:scale(.92)}',
    '.orv-title{display:flex;align-items:center;gap:7px;font-size:16px;font-weight:800;color:var(--text-primary)}',
    '.orv-sub{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '/* Tabs */',
    '.orv-tabs{display:flex;gap:6px;padding:0 14px 12px;flex-shrink:0}',
    '.orv-tab{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:9px 10px;border:1.5px solid var(--border-soft);background:var(--bg-phone);color:var(--text-muted);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit}',
    '.orv-tab:active{transform:scale(.97)}',
    '.orv-tab.active{border-color:#F59E0B;background:rgba(245,158,11,.08);color:#D97706}',
    '/* Body */',
    '.orv-body{flex:1;overflow-y:auto;padding:4px 14px 14px;display:flex;flex-direction:column;gap:12px}',
    '.orv-placeholder{padding:40px 16px;text-align:center;color:var(--text-muted);font-size:12px}',
    '/* Biz card */',
    '.orv-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px;align-items:stretch}',
    '.orv-card-head{display:flex;align-items:center;gap:10px}',
    '.orv-restaurant-ico{width:44px;height:44px;border-radius:12px;background:rgba(246,80,19,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.orv-card-title{font-size:15px;font-weight:800;color:var(--text-primary)}',
    '.orv-card-sub{font-size:11.5px;color:var(--text-muted);margin-top:2px}',
    '/* Stars */',
    '.orv-stars{display:flex;justify-content:center;align-items:center;gap:4px;padding:4px 0}',
    '.orv-stars--sm{gap:2px;padding:2px 0}',
    '.orv-star{background:none;border:none;padding:4px;cursor:pointer;color:var(--text-muted);transition:transform .12s,color .2s;font-family:inherit}',
    '.orv-star:active{transform:scale(1.18)}',
    '.orv-star.on{color:#F59E0B;filter:drop-shadow(0 2px 4px rgba(245,158,11,.35))}',
    '.orv-rating-lbl{text-align:center;font-size:14px;font-weight:800;animation:orvFadeIn .25s ease}',
    '@keyframes orvFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}',
    '.orv-rating-hint{text-align:center;font-size:11.5px;color:var(--text-muted);padding:2px 0}',
    '/* Textareas / inputs */',
    '.orv-note{width:100%;min-height:76px;padding:10px 12px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);border-radius:10px;color:var(--text-primary);font-size:12.5px;outline:none;font-family:inherit;resize:vertical;line-height:1.5}',
    '.orv-note:focus{border-color:#F59E0B}',
    '.orv-note-counter{text-align:right;font-size:10px;color:var(--text-muted);margin-top:-2px}',
    '.orv-btn-next{align-self:flex-end;padding:8px 12px;border:1px solid rgba(245,158,11,.3);background:rgba(245,158,11,.06);color:#B45309;border-radius:9px;font-size:11.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:inherit;margin-top:-4px}',
    '.orv-btn-next:active{transform:scale(.96)}',
    '/* Items list */',
    '.orv-items-intro{display:flex;align-items:center;gap:7px;padding:9px 11px;background:rgba(246,80,19,.06);border:1px solid rgba(246,80,19,.16);border-radius:10px;font-size:11.5px;color:var(--text-primary);font-weight:600}',
    '.orv-items-list{display:flex;flex-direction:column;gap:10px}',
    '.orv-item-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}',
    '.orv-item-head{display:flex;align-items:center;gap:10px}',
    '.orv-item-ico{width:34px;height:34px;border-radius:10px;background:rgba(245,158,11,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.orv-item-name{font-size:13px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.orv-item-meta{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.orv-item-note{width:100%;padding:8px 10px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);border-radius:8px;color:var(--text-primary);font-size:11.5px;outline:none;font-family:inherit}',
    '.orv-item-note:focus{border-color:#F59E0B}',
    '/* Footer */',
    '.orv-footer{display:flex;align-items:center;gap:10px;padding:10px 14px max(env(safe-area-inset-bottom),12px);background:var(--bg-phone);border-top:1px solid var(--border-soft);flex-shrink:0}',
    '.orv-footer-hint{flex:1;display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--text-muted);line-height:1.4;min-width:0}',
    '.orv-footer-hint span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.orv-btn-submit{flex-shrink:0;padding:11px 16px;border:none;background:linear-gradient(135deg,#F59E0B,#EA580C);color:#fff;border-radius:11px;font-size:12.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(245,158,11,.3);font-family:inherit;transition:transform .15s}',
    '.orv-btn-submit:active{transform:scale(.97)}',
    '.orv-btn-submit.disabled{opacity:.42;cursor:not-allowed;transform:none;box-shadow:none}',
    '@keyframes orvSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
    '/* Thanks popup */',
    '.orv-thanks-bd{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:98;opacity:0;transition:opacity .24s;padding:20px}',
    '.orv-thanks-bd.open{opacity:1}',
    '.orv-thanks{width:100%;max-width:360px;background:linear-gradient(180deg,#FFFBEB,#FFFFFF 60%);border-radius:20px;padding:24px 20px 18px;text-align:center;transform:scale(.92);transition:transform .28s cubic-bezier(.2,.9,.25,1);border:1px solid rgba(245,158,11,.22)}',
    '.orv-thanks-bd.open .orv-thanks{transform:scale(1)}',
    '.orv-thanks-ico{animation:orvPop .5s ease;margin-bottom:6px}',
    '@keyframes orvPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}',
    '.orv-thanks-title{font-size:19px;font-weight:800;color:#B45309;margin-bottom:6px}',
    '.orv-thanks-body{font-size:12.5px;color:var(--text-primary);line-height:1.6;max-width:300px;margin:0 auto 14px}',
    '.orv-thanks .orv-btn-submit{width:100%;justify-content:center}'
  ].join('\n');
  document.head.appendChild(s);
}

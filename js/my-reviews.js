/* ═══════════════════════════════════════════════════════════
   MY REVIEWS — Değerlendirmelerim (Hesabım > Değerlendirmelerim)
   4 sekme: Bekleyenler · Tarifler · Menüler · İşletmeler
   Mükerrer uyarı · düzenle/sil · kronolojik
   ═══════════════════════════════════════════════════════════ */

/* Kullanıcının denediği tarifler — Değerlendirme Bekleyenler için seed */
var USER_TRIED_RECIPES = (function() {
  return [
    { id: 'rec_1', recipeName: 'Truffle Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop', triedAt: '2026-04-19T19:30:00', chef: 'Chef Ahmet' },
    { id: 'rec_2', recipeName: 'Adana Kebap', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop', triedAt: '2026-04-15T20:05:00', chef: 'Kebapçı Mehmet' },
    { id: 'rec_3', recipeName: 'Margherita Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', triedAt: '2026-04-11T18:40:00', chef: 'Şef Isabella' }
  ];
})();

/* Tarif değerlendirmeleri — id → { rating, comment, photo, createdAt } */
var USER_RECIPE_REVIEWS = {
  'rec_seed_pasta': {
    recipeName: 'Penne Arrabbiata',
    chef: 'Şef Isabella',
    rating: 5,
    comment: 'Acı dengesi muhteşem, evde mutlaka denenmeli. Sarımsağı biraz daha az koydum.',
    photo: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=400&fit=crop',
    createdAt: '2026-04-09T21:15:00'
  },
  'rec_seed_cheesecake': {
    recipeName: 'New York Cheesecake',
    chef: 'Ayşe Mutfak',
    rating: 4,
    comment: 'Kıvam çok iyi, bir dahaki sefere üstüne biraz daha ahududu sosu ekleyeceğim.',
    photo: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=400&fit=crop',
    createdAt: '2026-04-02T15:30:00'
  }
};

/* Ek örnek: USER_ORDER_REVIEWS'a 2 tamamlanmış değerlendirme ekle (demo için) */
(function _mrSeedOrderReviews() {
  if (typeof USER_ORDER_REVIEWS === 'undefined') return;
  if (!USER_ORDER_REVIEWS['#1042']) {
    USER_ORDER_REVIEWS['#1042'] = {
      biz: { rating: 5, comment: 'Burger House her zamanki gibi hızlı ve taze. Truffle sos harika.', createdAt: '2026-04-05T20:40:00' },
      items: {
        'Truffle Burger': { rating: 5, comment: 'Et pişirilmesi mükemmel, bir daha mutlaka alırım.' },
        'Soğan Halkası': { rating: 4, comment: 'Çıtır ama biraz yağlı kalmış.' },
        'Cola': { rating: 5, comment: '' }
      }
    };
  }
  if (!USER_ORDER_REVIEWS['#1035']) {
    USER_ORDER_REVIEWS['#1035'] = {
      biz: { rating: 4, comment: 'Pizza güzeldi ama kurye geç geldi.', createdAt: '2026-03-28T14:20:00' },
      items: {
        'Margherita Pizza': { rating: 4, comment: 'Klasik lezzet, hamur dengesi iyi.' }
      }
    };
  }
})();

/* State */
var _mr = {
  tab: 'pending',             // pending | recipes | menus | businesses
  recipeSheet: null           // id düzenleniyorsa
};

/* ══════════════════════════════════════════════════════════
   ENTRY / OVERLAY
   ══════════════════════════════════════════════════════════ */

function openMyReviewsPage() {
  _mrInjectStyles();
  var phone = document.getElementById('phone') || document.body;
  var existing = document.getElementById('myReviewsOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'myReviewsOverlay';
  overlay.className = 'mr-overlay open';

  overlay.innerHTML = ''
    + '<div class="mr-topbar">'
    +   '<div class="btn-icon" onclick="closeMyReviewsPage()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    +   '<div class="mr-topbar-title">Değerlendirmelerim</div>'
    +   '<div style="width:32px"></div>'
    + '</div>'
    + '<div class="mr-tabs" id="mrTabs"></div>'
    + '<div class="mr-body" id="mrBody"></div>';

  phone.appendChild(overlay);
  _mrRenderTabs();
  _mrRenderBody();
}

function closeMyReviewsPage() {
  var el = document.getElementById('myReviewsOverlay');
  if (el) el.remove();
  _mrSyncTileBadge();
}

function _mrSetTab(tab) {
  _mr.tab = tab;
  _mrRenderTabs();
  _mrRenderBody();
}

function _mrRenderTabs() {
  var host = document.getElementById('mrTabs');
  if (!host) return;
  var counts = _mrCounts();
  var tabs = [
    { id: 'pending',    label: 'Değerlendirme Bekleyenler', icon: 'solar:hourglass-bold',   badge: counts.pending, tone: '#EF4444' },
    { id: 'recipes',    label: 'Değerlendirilmiş Tarifler',  icon: 'solar:chef-hat-bold',    badge: counts.recipes, tone: '#F59E0B' },
    { id: 'menus',      label: 'Değerlendirilmiş Menüler',   icon: 'solar:dish-bold',        badge: counts.menus,   tone: '#8B5CF6' },
    { id: 'businesses', label: 'Değerlendirilmiş İşletmeler',icon: 'solar:shop-bold',        badge: counts.biz,     tone: '#10B981' }
  ];
  var html = '';
  tabs.forEach(function(t){
    var on = _mr.tab === t.id;
    html += '<button class="mr-tab' + (on ? ' is-on' : '') + '" style="--tt:' + t.tone + '" onclick="_mrSetTab(\''+t.id+'\')">'
         +    '<iconify-icon icon="'+t.icon+'" style="font-size:14px"></iconify-icon>'
         +    '<span>'+t.label+'</span>'
         +    (t.badge > 0 ? '<span class="mr-tab-badge">'+t.badge+'</span>' : '')
         + '</button>';
  });
  host.innerHTML = html;
  // Aktif sekmeyi görünür yap
  requestAnimationFrame(function(){
    var active = host.querySelector('.mr-tab.is-on');
    if (active && active.scrollIntoView) active.scrollIntoView({ behavior:'smooth', inline:'nearest', block:'nearest' });
  });
}

function _mrRenderBody() {
  var host = document.getElementById('mrBody');
  if (!host) return;
  if (_mr.tab === 'pending')         host.innerHTML = _mrRenderPending();
  else if (_mr.tab === 'recipes')    host.innerHTML = _mrRenderRecipes();
  else if (_mr.tab === 'menus')      host.innerHTML = _mrRenderMenus();
  else if (_mr.tab === 'businesses') host.innerHTML = _mrRenderBusinesses();
}

/* ══════════════════════════════════════════════════════════
   SAYIMLAR
   ══════════════════════════════════════════════════════════ */

function _mrCounts() {
  return {
    pending: _mrPendingList().length,
    recipes: Object.keys(USER_RECIPE_REVIEWS || {}).length,
    menus:   _mrMenuReviews().length,
    biz:     _mrBizReviews().length
  };
}

function _mrSyncTileBadge() {
  var badge = document.getElementById('myReviewsPendingBadge');
  var summary = document.getElementById('profMyReviewsSummary');
  if (!badge || !summary) return;
  var c = _mrCounts();
  if (c.pending > 0) {
    badge.style.display = 'inline-flex';
    badge.textContent = c.pending;
  } else {
    badge.style.display = 'none';
  }
  var doneTotal = c.recipes + c.menus + c.biz;
  summary.textContent = c.pending + ' bekleyen · ' + doneTotal + ' değerlendirildi';
}

/* ══════════════════════════════════════════════════════════
   BEKLEYENLER
   ══════════════════════════════════════════════════════════ */

function _mrPendingList() {
  var out = [];
  // Tarifler (değerlendirilmemiş)
  (USER_TRIED_RECIPES || []).forEach(function(r){
    if (USER_RECIPE_REVIEWS[r.id]) return;
    out.push({
      kind: 'recipe',
      id: r.id,
      title: r.recipeName,
      image: r.image,
      sub: 'Tarif · ' + (r.chef || ''),
      date: r.triedAt
    });
  });
  // Siparişler (state=delivered, review yok)
  if (typeof _ordGetAll === 'function') {
    var orders = _ordGetAll();
    orders.forEach(function(o){
      if (o.state !== 'delivered') return;
      if ((USER_ORDER_REVIEWS || {})[o.id]) return;
      out.push({
        kind: 'order',
        id: o.id,
        title: o.restaurant + ' · ' + o.id,
        sub: (o.items || []).map(function(i){ return i.name; }).slice(0,2).join(', ') + ((o.items||[]).length > 2 ? ' +' + ((o.items||[]).length-2) : ''),
        image: null,
        icon: o.restaurantIcon || 'solar:bag-smile-bold',
        date: _mrOrderDate(o)
      });
    });
  }
  out.sort(function(a,b){ return (b.date > a.date ? 1 : b.date < a.date ? -1 : 0); });
  return out;
}

function _mrOrderDate(o) {
  // Order'ın date string'i "5 Nisan · 19:24" veya ISO; sort için ters varsayım
  if (!o.date) return '';
  // Prefer numeric hours fallback
  return o.date;
}

function _mrRenderPending() {
  var list = _mrPendingList();
  if (!list.length) return _mrEmpty('solar:hourglass-line-linear', 'Değerlendirme bekleyen içerik yok', 'Siparişlerin ve denediğin tarifler buraya gelir.');

  var h = '<div class="mr-intro"><iconify-icon icon="solar:stars-bold" style="font-size:15px;color:#F59E0B"></iconify-icon><span>Değerlendirmelerin topluluğa yön verir, diğer kullanıcılara ilham olur.</span></div>';
  h += '<div class="mr-list">';
  list.forEach(function(it){
    h += '<div class="mr-card mr-card--pending">';
    h += '<div class="mr-card-media">';
    if (it.image) h += '<img src="'+_mrEsc(it.image)+'" loading="lazy" alt="">';
    else          h += '<div class="mr-card-media-ph"><iconify-icon icon="'+(it.icon||'solar:bag-smile-bold')+'" style="font-size:24px;color:var(--primary)"></iconify-icon></div>';
    h += '<div class="mr-kind-tag mr-kind-tag--'+it.kind+'">'+(it.kind==='recipe'?'Tarif':'Sipariş')+'</div>';
    h += '</div>';
    h += '<div class="mr-card-body">';
    h +=   '<div class="mr-card-title">'+_mrEsc(it.title)+'</div>';
    h +=   '<div class="mr-card-sub">'+_mrEsc(it.sub || '')+'</div>';
    h +=   '<div class="mr-card-meta"><iconify-icon icon="solar:clock-circle-linear" style="font-size:11px"></iconify-icon><span>'+_mrEsc(it.date || '')+'</span></div>';
    h += '</div>';
    h += '<button class="mr-evaluate-btn" onclick="_mrStartEvaluate(\''+it.kind+'\',\''+_mrEscAttr(it.id)+'\')">'
      +    '<iconify-icon icon="solar:star-bold" style="font-size:14px"></iconify-icon>Değerlendir'
      + '</button>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ══════════════════════════════════════════════════════════
   DEĞERLENDİRİLMİŞ TARİFLER
   ══════════════════════════════════════════════════════════ */

function _mrRenderRecipes() {
  var ids = Object.keys(USER_RECIPE_REVIEWS || {});
  if (!ids.length) return _mrEmpty('solar:chef-hat-linear', 'Değerlendirilmiş tarif yok', 'Denediğin tarifleri yorumlayınca burada görünür.');

  var list = ids.map(function(id){
    var r = USER_RECIPE_REVIEWS[id];
    return { id: id, rating: r.rating, comment: r.comment, photo: r.photo, createdAt: r.createdAt, recipeName: r.recipeName, chef: r.chef };
  }).sort(function(a,b){ return (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0); });

  var h = '<div class="mr-list">';
  list.forEach(function(r){
    h += '<div class="mr-card">';
    if (r.photo) h += '<div class="mr-photo-strip"><img src="'+_mrEsc(r.photo)+'" loading="lazy" alt=""></div>';
    h += '<div class="mr-review-head">';
    h +=   '<div class="mr-review-title-row">';
    h +=     '<iconify-icon icon="solar:chef-hat-bold" style="font-size:18px;color:#F59E0B;flex-shrink:0"></iconify-icon>';
    h +=     '<div style="flex:1;min-width:0">';
    h +=       '<div class="mr-review-title">'+_mrEsc(r.recipeName)+'</div>';
    h +=       '<div class="mr-review-sub">'+_mrEsc(r.chef||'')+' · '+_mrFormatDate(r.createdAt)+'</div>';
    h +=     '</div>';
    h +=     _mrStars(r.rating);
    h +=   '</div>';
    if (r.comment) h += '<div class="mr-review-comment">'+_mrEsc(r.comment)+'</div>';
    h +=   '<div class="mr-review-actions">';
    h +=     '<button class="mr-act mr-act--edit" onclick="_mrEditRecipeReview(\''+_mrEscAttr(r.id)+'\')"><iconify-icon icon="solar:pen-linear" style="font-size:13px"></iconify-icon>Düzenle</button>';
    h +=     '<button class="mr-act mr-act--del" onclick="_mrDeleteRecipeReview(\''+_mrEscAttr(r.id)+'\')"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon>Sil</button>';
    h +=   '</div>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ══════════════════════════════════════════════════════════
   DEĞERLENDİRİLMİŞ MENÜLER (fotosuz)
   ══════════════════════════════════════════════════════════ */

function _mrMenuReviews() {
  var out = [];
  if (typeof USER_ORDER_REVIEWS === 'undefined') return out;
  var orderMap = {};
  if (typeof _ordGetAll === 'function') {
    _ordGetAll().forEach(function(o){ orderMap[o.id] = o; });
  }
  Object.keys(USER_ORDER_REVIEWS).forEach(function(orderId){
    var rev = USER_ORDER_REVIEWS[orderId];
    if (!rev || !rev.items) return;
    var order = orderMap[orderId];
    Object.keys(rev.items).forEach(function(itemKey){
      var it = rev.items[itemKey];
      if (!it || !it.rating) return;
      out.push({
        orderId: orderId,
        itemKey: itemKey,
        restaurant: order ? order.restaurant : '',
        rating: it.rating,
        comment: it.comment || '',
        createdAt: (rev.biz && rev.biz.createdAt) || ''
      });
    });
  });
  return out.sort(function(a,b){ return (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0); });
}

function _mrRenderMenus() {
  var list = _mrMenuReviews();
  if (!list.length) return _mrEmpty('solar:dish-linear', 'Değerlendirilmiş menü yok', 'Sipariş ettiğin ürünlere puan verdiğinde burada listelenir.');

  var h = '<div class="mr-list">';
  list.forEach(function(m){
    h += '<div class="mr-card">';
    h += '<div class="mr-review-head">';
    h +=   '<div class="mr-review-title-row">';
    h +=     '<div class="mr-ico-pill" style="background:rgba(139,92,246,.12);color:#8B5CF6"><iconify-icon icon="solar:dish-bold" style="font-size:18px"></iconify-icon></div>';
    h +=     '<div style="flex:1;min-width:0">';
    h +=       '<div class="mr-review-title">'+_mrEsc(m.itemKey)+'</div>';
    h +=       '<div class="mr-review-sub">'+_mrEsc(m.restaurant||'')+' · '+_mrFormatDate(m.createdAt)+'</div>';
    h +=     '</div>';
    h +=     _mrStars(m.rating);
    h +=   '</div>';
    if (m.comment) h += '<div class="mr-review-comment">'+_mrEsc(m.comment)+'</div>';
    h +=   '<div class="mr-review-actions">';
    h +=     '<button class="mr-act mr-act--edit" onclick="_mrEditOrderReview(\''+_mrEscAttr(m.orderId)+'\')"><iconify-icon icon="solar:pen-linear" style="font-size:13px"></iconify-icon>Düzenle</button>';
    h +=     '<button class="mr-act mr-act--del" onclick="_mrDeleteMenuItemReview(\''+_mrEscAttr(m.orderId)+'\',\''+_mrEscAttr(m.itemKey)+'\')"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon>Sil</button>';
    h +=   '</div>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ══════════════════════════════════════════════════════════
   DEĞERLENDİRİLMİŞ İŞLETMELER
   ══════════════════════════════════════════════════════════ */

function _mrBizReviews() {
  var out = [];
  if (typeof USER_ORDER_REVIEWS === 'undefined') return out;
  var orderMap = {};
  if (typeof _ordGetAll === 'function') {
    _ordGetAll().forEach(function(o){ orderMap[o.id] = o; });
  }
  Object.keys(USER_ORDER_REVIEWS).forEach(function(orderId){
    var rev = USER_ORDER_REVIEWS[orderId];
    if (!rev || !rev.biz || !rev.biz.rating) return;
    var order = orderMap[orderId];
    out.push({
      orderId: orderId,
      restaurant: order ? order.restaurant : (rev.restaurant || '—'),
      icon: order ? (order.restaurantIcon || 'solar:shop-bold') : 'solar:shop-bold',
      rating: rev.biz.rating,
      comment: rev.biz.comment || '',
      createdAt: rev.biz.createdAt || ''
    });
  });
  return out.sort(function(a,b){ return (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0); });
}

function _mrRenderBusinesses() {
  var list = _mrBizReviews();
  if (!list.length) return _mrEmpty('solar:shop-linear', 'Değerlendirilmiş işletme yok', 'Restoranlara puan verdiğinde burada listelenir.');

  var h = '<div class="mr-list">';
  list.forEach(function(b){
    h += '<div class="mr-card">';
    h += '<div class="mr-review-head">';
    h +=   '<div class="mr-review-title-row">';
    h +=     '<div class="mr-ico-pill" style="background:rgba(16,185,129,.12);color:#10B981"><iconify-icon icon="'+b.icon+'" style="font-size:18px"></iconify-icon></div>';
    h +=     '<div style="flex:1;min-width:0">';
    h +=       '<div class="mr-review-title">'+_mrEsc(b.restaurant)+'</div>';
    h +=       '<div class="mr-review-sub">Sipariş '+_mrEsc(b.orderId)+' · '+_mrFormatDate(b.createdAt)+'</div>';
    h +=     '</div>';
    h +=     _mrStars(b.rating);
    h +=   '</div>';
    if (b.comment) h += '<div class="mr-review-comment">'+_mrEsc(b.comment)+'</div>';
    h +=   '<div class="mr-review-actions">';
    h +=     '<button class="mr-act mr-act--edit" onclick="_mrEditOrderReview(\''+_mrEscAttr(b.orderId)+'\')"><iconify-icon icon="solar:pen-linear" style="font-size:13px"></iconify-icon>Düzenle</button>';
    h +=     '<button class="mr-act mr-act--del" onclick="_mrDeleteBizReview(\''+_mrEscAttr(b.orderId)+'\')"><iconify-icon icon="solar:trash-bin-minimalistic-linear" style="font-size:13px"></iconify-icon>Sil</button>';
    h +=   '</div>';
    h += '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

/* ══════════════════════════════════════════════════════════
   AKSİYONLAR — Değerlendir + Mükerrer Uyarı
   ══════════════════════════════════════════════════════════ */

function _mrStartEvaluate(kind, id) {
  var dupe = _mrFindDuplicate(kind, id);
  if (dupe) {
    _mrShowDupeWarning(kind, id, dupe);
    return;
  }
  _mrProceedEvaluate(kind, id);
}

function _mrFindDuplicate(kind, id) {
  if (kind === 'recipe') {
    if (USER_RECIPE_REVIEWS[id]) return { type: 'recipe', label: USER_RECIPE_REVIEWS[id].recipeName };
    // Aynı isimdeki başka kayıt?
    var tried = (USER_TRIED_RECIPES || []).filter(function(t){ return t.id === id; })[0];
    if (tried) {
      var hit = Object.keys(USER_RECIPE_REVIEWS || {}).filter(function(k){
        return USER_RECIPE_REVIEWS[k].recipeName === tried.recipeName;
      })[0];
      if (hit) return { type: 'recipe', label: tried.recipeName, key: hit };
    }
    return null;
  }
  if (kind === 'order') {
    // Sipariş kendisi review'lu değildir (pending list garantisi), ama içindeki item'lar başka bir siparişte rate edilmiş olabilir
    if (typeof _ordGetAll !== 'function' || typeof USER_ORDER_REVIEWS === 'undefined') return null;
    var order = _ordGetAll().filter(function(o){ return o.id === id; })[0];
    if (!order) return null;
    var dupItems = [];
    (order.items || []).forEach(function(it){
      var name = it.name;
      Object.keys(USER_ORDER_REVIEWS).forEach(function(oid){
        if (oid === id) return;
        var rev = USER_ORDER_REVIEWS[oid];
        if (rev && rev.items && rev.items[name] && rev.items[name].rating) {
          dupItems.push({ name: name, prevOrder: oid });
        }
      });
    });
    if (dupItems.length) return { type: 'orderItems', items: dupItems };
    return null;
  }
  return null;
}

function _mrShowDupeWarning(kind, id, dupe) {
  var phone = document.getElementById('phone') || document.body;
  var existing = document.getElementById('mrDupeModal');
  if (existing) existing.remove();
  var m = document.createElement('div');
  m.id = 'mrDupeModal';
  m.className = 'mr-modal-bd';
  m.onclick = function(e){ if (e.target === m) m.remove(); };

  var bodyText = 'Daha önceden bu içerik için bir yorum yaptınız. Eğer yeni bir değerlendirmede bulunursanız, önceki değerlendirmeniz silinecektir. Devam etmek istiyor musunuz?';
  var list = '';
  if (dupe.type === 'orderItems') {
    list = '<ul class="mr-dupe-list">';
    dupe.items.forEach(function(it){
      list += '<li><b>'+_mrEsc(it.name)+'</b> <span>('+_mrEsc(it.prevOrder)+' siparişinde yorumladın)</span></li>';
    });
    list += '</ul>';
  } else if (dupe.type === 'recipe') {
    list = '<ul class="mr-dupe-list"><li><b>'+_mrEsc(dupe.label)+'</b></li></ul>';
  }

  m.innerHTML = '<div class="mr-modal">'
    +   '<div class="mr-modal-icon"><iconify-icon icon="solar:shield-warning-bold" style="font-size:34px;color:#F59E0B"></iconify-icon></div>'
    +   '<div class="mr-modal-title">Mükerrer Değerlendirme</div>'
    +   '<div class="mr-modal-body">'+bodyText+'</div>'
    +   list
    +   '<div class="mr-modal-actions">'
    +     '<button class="mr-modal-btn mr-modal-btn--ghost" onclick="document.getElementById(\'mrDupeModal\').remove()">Vazgeç</button>'
    +     '<button class="mr-modal-btn mr-modal-btn--warn" onclick="_mrProceedEvaluate(\''+kind+'\',\''+_mrEscAttr(id)+'\',true)">Eskiyi Sil &amp; Devam Et</button>'
    +   '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _mrProceedEvaluate(kind, id, wipe) {
  var modal = document.getElementById('mrDupeModal');
  if (modal) modal.remove();

  if (wipe) _mrWipeDuplicates(kind, id);

  if (kind === 'recipe') {
    _mrOpenRecipeSheet(id);
  } else if (kind === 'order') {
    if (typeof openOrderReview === 'function') openOrderReview(id);
  }
}

function _mrWipeDuplicates(kind, id) {
  if (kind === 'recipe') {
    var tried = (USER_TRIED_RECIPES || []).filter(function(t){ return t.id === id; })[0];
    if (!tried) return;
    Object.keys(USER_RECIPE_REVIEWS || {}).forEach(function(k){
      if (USER_RECIPE_REVIEWS[k].recipeName === tried.recipeName) delete USER_RECIPE_REVIEWS[k];
    });
  } else if (kind === 'order') {
    if (typeof _ordGetAll !== 'function' || typeof USER_ORDER_REVIEWS === 'undefined') return;
    var order = _ordGetAll().filter(function(o){ return o.id === id; })[0];
    if (!order) return;
    (order.items || []).forEach(function(it){
      Object.keys(USER_ORDER_REVIEWS).forEach(function(oid){
        if (oid === id) return;
        var rev = USER_ORDER_REVIEWS[oid];
        if (rev && rev.items && rev.items[it.name]) {
          delete rev.items[it.name];
        }
      });
    });
  }
}

/* ══════════════════════════════════════════════════════════
   TARİF DEĞERLENDİRME SHEET (inline)
   ══════════════════════════════════════════════════════════ */

function _mrOpenRecipeSheet(recipeId) {
  var tried = (USER_TRIED_RECIPES || []).filter(function(t){ return t.id === recipeId; })[0];
  var existing = USER_RECIPE_REVIEWS[recipeId];
  var recipeName = existing ? existing.recipeName : (tried ? tried.recipeName : '—');
  var chef = existing ? existing.chef : (tried ? tried.chef : '');
  var image = tried ? tried.image : (existing ? existing.photo : null);
  _mr.recipeSheet = {
    id: recipeId,
    recipeName: recipeName,
    chef: chef,
    image: image,
    rating: existing ? existing.rating : 0,
    comment: existing ? existing.comment : '',
    photo: existing ? existing.photo : null,
    editing: !!existing
  };
  var phone = document.getElementById('phone') || document.body;
  var bd = document.createElement('div');
  bd.id = 'mrRecSheetBd';
  bd.className = 'mr-sheet-bd';
  bd.onclick = function(e){ if (e.target === bd) _mrCloseRecipeSheet(); };
  bd.innerHTML = '<div class="mr-sheet" id="mrRecSheet"><div id="mrRecBody"></div></div>';
  phone.appendChild(bd);
  requestAnimationFrame(function(){ bd.classList.add('open'); var s = document.getElementById('mrRecSheet'); if (s) s.classList.add('open'); });
  _mrRenderRecipeSheet();
}

function _mrCloseRecipeSheet() {
  var bd = document.getElementById('mrRecSheetBd');
  if (!bd) return;
  bd.classList.remove('open');
  setTimeout(function(){ if (bd.parentNode) bd.remove(); }, 260);
}

function _mrRenderRecipeSheet() {
  var body = document.getElementById('mrRecBody');
  if (!body || !_mr.recipeSheet) return;
  var s = _mr.recipeSheet;
  var labels = ['', 'Çok kötü', 'Kötü', 'Fena değil', 'İyi', 'Harika!'];
  var labelColors = ['', '#DC2626', '#EA580C', '#EAB308', '#16A34A', '#15803D'];

  var h = '<div class="mr-sheet-head">'
    + '<div class="mr-sheet-close" onclick="_mrCloseRecipeSheet()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div style="flex:1">'
    +   '<div class="mr-sheet-title"><iconify-icon icon="solar:chef-hat-bold" style="font-size:17px;color:#F59E0B"></iconify-icon>'+(s.editing?'Tarifi Yeniden Değerlendir':'Tarifi Değerlendir')+'</div>'
    +   '<div class="mr-sheet-sub">'+_mrEsc(s.recipeName)+' · '+_mrEsc(s.chef||'')+'</div>'
    + '</div>'
    + '</div>';

  // Stars
  h += '<div class="mr-stars">';
  for (var i = 1; i <= 5; i++) {
    var filled = i <= (s.rating || 0);
    h += '<button class="mr-star'+(filled?' on':'')+'" onclick="_mrSetRecipeRating('+i+')">'
      +    '<iconify-icon icon="'+(filled?'solar:star-bold':'solar:star-linear')+'" style="font-size:36px"></iconify-icon>'
      + '</button>';
  }
  h += '</div>';

  if (s.rating > 0) h += '<div class="mr-rating-lbl" style="color:'+labelColors[s.rating]+'">'+labels[s.rating]+'</div>';
  else h += '<div class="mr-rating-hint">Puan vermek için yıldızlara dokun</div>';

  h += '<textarea class="mr-note" placeholder="Tarif deneyimini paylaş (opsiyonel)..." maxlength="400" oninput="_mr.recipeSheet.comment=this.value">'+_mrEsc(s.comment||'')+'</textarea>';

  // Foto alanı
  h += '<div class="mr-photo-slot">';
  if (s.photo) {
    h += '<div class="mr-photo-preview"><img src="'+_mrEsc(s.photo)+'" alt=""><button class="mr-photo-remove" onclick="_mrRemoveRecipePhoto()"><iconify-icon icon="solar:close-circle-bold" style="font-size:18px"></iconify-icon></button></div>';
  }
  h += '<label class="mr-photo-pick"><iconify-icon icon="solar:camera-add-bold" style="font-size:16px;color:#8B5CF6"></iconify-icon><span>'+(s.photo?'Fotoğrafı Değiştir':'Fotoğraf Ekle')+'</span><input type="file" accept="image/*" onchange="_mrPickRecipePhoto(event)" style="display:none"></label>';
  h += '</div>';

  h += '<div class="mr-sheet-footer">';
  h +=   '<button class="mr-btn-submit'+(s.rating>0?'':' is-disabled')+'"'+(s.rating>0?' onclick="_mrSubmitRecipeReview()"':'')+'>'
    +      '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>'
    +      (s.editing?'Güncelle':'Onayla')
    +    '</button>';
  h += '</div>';

  body.innerHTML = h;
}

function _mrSetRecipeRating(n) {
  if (!_mr.recipeSheet) return;
  _mr.recipeSheet.rating = n;
  _mrRenderRecipeSheet();
}

function _mrPickRecipePhoto(e) {
  var f = e.target && e.target.files && e.target.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    if (!_mr.recipeSheet) return;
    _mr.recipeSheet.photo = ev.target.result;
    _mrRenderRecipeSheet();
  };
  reader.readAsDataURL(f);
}

function _mrRemoveRecipePhoto() {
  if (!_mr.recipeSheet) return;
  _mr.recipeSheet.photo = null;
  _mrRenderRecipeSheet();
}

function _mrSubmitRecipeReview() {
  var s = _mr.recipeSheet;
  if (!s || !s.rating) return;
  USER_RECIPE_REVIEWS[s.id] = {
    recipeName: s.recipeName,
    chef: s.chef || '',
    rating: s.rating,
    comment: s.comment || '',
    photo: s.photo || null,
    createdAt: new Date().toISOString()
  };
  _mrCloseRecipeSheet();
  _mr.tab = 'recipes';
  setTimeout(function(){
    _mrRenderTabs();
    _mrRenderBody();
    if (typeof showToast === 'function') showToast('Değerlendirmen kaydedildi');
  }, 260);
}

function _mrEditRecipeReview(id) {
  _mrOpenRecipeSheet(id);
}

function _mrDeleteRecipeReview(id) {
  if (!confirm('Bu tarif değerlendirmeni silmek istediğine emin misin?')) return;
  delete USER_RECIPE_REVIEWS[id];
  _mrRenderTabs();
  _mrRenderBody();
  if (typeof showToast === 'function') showToast('Değerlendirme silindi');
}

/* ══════════════════════════════════════════════════════════
   SİPARİŞ DEĞERLENDİRME — edit/delete
   ══════════════════════════════════════════════════════════ */

function _mrEditOrderReview(orderId) {
  if (typeof openOrderReview !== 'function') return;
  openOrderReview(orderId);
  // mevcut veriyle state'i doldur
  setTimeout(function(){
    if (typeof _orv === 'undefined') return;
    var rev = (USER_ORDER_REVIEWS || {})[orderId];
    if (!rev) return;
    _orv.biz.rating = (rev.biz && rev.biz.rating) || 0;
    _orv.biz.comment = (rev.biz && rev.biz.comment) || '';
    Object.keys(rev.items || {}).forEach(function(k){
      if (!_orv.items[k]) _orv.items[k] = { rating: 0, comment: '' };
      _orv.items[k].rating = rev.items[k].rating || 0;
      _orv.items[k].comment = rev.items[k].comment || '';
    });
    if (typeof _orvRender === 'function') _orvRender();
  }, 60);
}

function _mrDeleteMenuItemReview(orderId, itemKey) {
  if (!confirm('Bu menü değerlendirmesini silmek istediğine emin misin?')) return;
  var rev = (USER_ORDER_REVIEWS || {})[orderId];
  if (!rev || !rev.items) return;
  delete rev.items[itemKey];
  if (!(rev.biz && rev.biz.rating) && !Object.keys(rev.items).length) {
    delete USER_ORDER_REVIEWS[orderId];
  }
  _mrRenderTabs();
  _mrRenderBody();
  if (typeof showToast === 'function') showToast('Menü değerlendirmesi silindi');
}

function _mrDeleteBizReview(orderId) {
  if (!confirm('Bu işletme değerlendirmesini silmek istediğine emin misin?')) return;
  var rev = (USER_ORDER_REVIEWS || {})[orderId];
  if (!rev) return;
  if (rev.biz) rev.biz = { rating: 0, comment: '', createdAt: '' };
  if (!Object.keys(rev.items || {}).length) {
    delete USER_ORDER_REVIEWS[orderId];
  }
  _mrRenderTabs();
  _mrRenderBody();
  if (typeof showToast === 'function') showToast('İşletme değerlendirmesi silindi');
}

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */

function _mrStars(rating) {
  var n = Math.max(0, Math.min(5, rating || 0));
  var h = '<div class="mr-stars-inline">';
  for (var i = 1; i <= 5; i++) {
    h += '<iconify-icon icon="'+(i<=n?'solar:star-bold':'solar:star-linear')+'" style="font-size:13px;color:'+(i<=n?'#F59E0B':'var(--text-tertiary)')+'"></iconify-icon>';
  }
  h += '<span class="mr-stars-num">'+n.toFixed(1)+'</span></div>';
  return h;
}

function _mrFormatDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  if (isNaN(d)) return iso;
  var mm = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var now = new Date();
  var diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return diffDays + ' gün önce';
  return d.getDate() + ' ' + mm[d.getMonth()] + ' ' + d.getFullYear();
}

function _mrEmpty(icon, title, desc) {
  return '<div class="mr-empty">'
    + '<iconify-icon icon="'+icon+'" style="font-size:48px;color:var(--text-tertiary)"></iconify-icon>'
    + '<div class="mr-empty-title">'+title+'</div>'
    + '<div class="mr-empty-desc">'+desc+'</div>'
    + '</div>';
}

function _mrEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _mrEscAttr(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

function _mrInjectStyles() {
  if (document.getElementById('mrStyles')) return;
  var s = document.createElement('style');
  s.id = 'mrStyles';
  s.textContent = [
    '.mr-overlay{position:fixed;inset:0;z-index:84;display:none;background:var(--bg-page);flex-direction:column}',
    '.mr-overlay.open{display:flex}',
    '.mr-topbar{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-subtle);background:var(--bg-phone);flex-shrink:0}',
    '.mr-topbar-title{flex:1;font:var(--fw-semibold) var(--fs-lg)/1 var(--font);color:var(--text-primary)}',
    '.mr-tabs{display:flex;gap:6px;padding:10px 12px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border-subtle);background:var(--bg-phone);flex-shrink:0;scroll-snap-type:x proximity}',
    '.mr-tabs::-webkit-scrollbar{display:none}',
    '.mr-tab{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border:1.5px solid var(--border-subtle);background:var(--bg-surface);border-radius:var(--r-full);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-secondary);cursor:pointer;transition:all .18s;flex-shrink:0;white-space:nowrap;scroll-snap-align:start;--tt:#F59E0B}',
    '.mr-tab:active{transform:scale(.96)}',
    '.mr-tab.is-on{border-color:var(--tt);background:color-mix(in srgb,var(--tt) 10%,transparent);color:var(--tt)}',
    '.mr-tab-badge{min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#EF4444;color:#fff;display:inline-flex;align-items:center;justify-content:center;font:var(--fw-bold) 10px/1 var(--font)}',
    '.mr-tab.is-on .mr-tab-badge{background:var(--tt)}',
    '.mr-body{flex:1;overflow-y:auto;padding:12px 14px 80px;scrollbar-width:none}',
    '.mr-body::-webkit-scrollbar{display:none}',
    '.mr-intro{display:flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:12px;background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(236,72,153,.06));border:1px solid rgba(245,158,11,.22);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary)}',
    '.mr-list{display:flex;flex-direction:column;gap:10px}',
    '.mr-card{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:var(--r-xl);background:var(--glass-card);border:1px solid var(--border-subtle);box-shadow:var(--shadow-md)}',
    '.mr-card--pending{flex-direction:row;align-items:center;gap:12px;padding:10px}',
    '.mr-card-media{position:relative;width:60px;height:60px;border-radius:var(--r-lg);overflow:hidden;flex-shrink:0;background:var(--bg-phone)}',
    '.mr-card-media img{width:100%;height:100%;object-fit:cover;display:block}',
    '.mr-card-media-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(245,80,19,.08),rgba(245,158,11,.10))}',
    '.mr-kind-tag{position:absolute;bottom:3px;left:3px;padding:1px 6px;border-radius:var(--r-full);font:var(--fw-bold) 8px/1.2 var(--font);letter-spacing:.3px;color:#fff;background:rgba(0,0,0,.55);backdrop-filter:blur(4px)}',
    '.mr-kind-tag--recipe{background:rgba(245,158,11,.85)}',
    '.mr-kind-tag--order{background:rgba(139,92,246,.85)}',
    '.mr-card-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}',
    '.mr-card-title{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mr-card-sub{font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mr-card-meta{display:inline-flex;align-items:center;gap:4px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:2px}',
    '.mr-evaluate-btn{display:inline-flex;align-items:center;gap:5px;padding:9px 12px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#F59E0B,#F97316);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;box-shadow:0 3px 8px rgba(245,158,11,.28);white-space:nowrap;flex-shrink:0}',
    '.mr-evaluate-btn:active{transform:scale(.96)}',
    '.mr-photo-strip{width:100%;height:140px;border-radius:var(--r-lg);overflow:hidden;background:var(--bg-phone)}',
    '.mr-photo-strip img{width:100%;height:100%;object-fit:cover;display:block}',
    '.mr-review-head{display:flex;flex-direction:column;gap:8px}',
    '.mr-review-title-row{display:flex;align-items:center;gap:10px}',
    '.mr-ico-pill{width:34px;height:34px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.mr-review-title{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mr-review-sub{font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:2px}',
    '.mr-stars-inline{display:inline-flex;align-items:center;gap:2px;padding:3px 7px;border-radius:var(--r-full);background:rgba(245,158,11,.08);flex-shrink:0}',
    '.mr-stars-num{font:var(--fw-bold) 11px/1 var(--font);color:#B45309;margin-left:3px}',
    '.mr-review-comment{font:var(--fw-regular) var(--fs-sm)/1.45 var(--font);color:var(--text-primary);padding:8px 10px;background:var(--bg-phone);border-radius:var(--r-lg);border-left:3px solid #F59E0B}',
    '.mr-review-actions{display:flex;gap:7px;margin-top:2px}',
    '.mr-act{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:8px 10px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);border-radius:var(--r-lg);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;transition:all .15s}',
    '.mr-act:active{transform:scale(.97)}',
    '.mr-act--edit:hover{border-color:#8B5CF6;background:rgba(139,92,246,.06);color:#7C3AED}',
    '.mr-act--del:hover{border-color:#EF4444;background:rgba(239,68,68,.06);color:#DC2626}',
    '.mr-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 20px;text-align:center;gap:10px}',
    '.mr-empty-title{font:var(--fw-semibold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.mr-empty-desc{font:var(--fw-regular) var(--fs-sm)/1.4 var(--font);color:var(--text-muted);max-width:240px}',
    /* Modal */
    '.mr-modal-bd{position:fixed;inset:0;z-index:98;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .22s}',
    '.mr-modal-bd.open{opacity:1}',
    '.mr-modal{width:100%;max-width:360px;background:var(--bg-page);border-radius:var(--r-2xl);padding:20px;display:flex;flex-direction:column;align-items:center;gap:10px;transform:translateY(12px) scale(.96);transition:transform .22s;box-shadow:var(--shadow-lg)}',
    '.mr-modal-bd.open .mr-modal{transform:translateY(0) scale(1)}',
    '.mr-modal-icon{width:60px;height:60px;border-radius:50%;background:rgba(245,158,11,.12);display:flex;align-items:center;justify-content:center}',
    '.mr-modal-title{font:var(--fw-bold) var(--fs-lg)/1.2 var(--font);color:var(--text-primary);text-align:center}',
    '.mr-modal-body{font:var(--fw-regular) var(--fs-sm)/1.5 var(--font);color:var(--text-secondary);text-align:center}',
    '.mr-dupe-list{list-style:none;margin:0;padding:10px 12px;width:100%;background:var(--bg-phone);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-xs)/1.5 var(--font);color:var(--text-primary)}',
    '.mr-dupe-list li{padding:3px 0}',
    '.mr-dupe-list li span{color:var(--text-muted)}',
    '.mr-modal-actions{display:flex;gap:8px;width:100%;margin-top:4px}',
    '.mr-modal-btn{flex:1;padding:11px;border:none;border-radius:var(--r-lg);font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;transition:all .15s}',
    '.mr-modal-btn:active{transform:scale(.97)}',
    '.mr-modal-btn--ghost{background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border-subtle)}',
    '.mr-modal-btn--warn{background:linear-gradient(135deg,#F59E0B,#F97316);color:#fff}',
    /* Sheet */
    '.mr-sheet-bd{position:fixed;inset:0;z-index:97;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;opacity:0;transition:opacity .22s}',
    '.mr-sheet-bd.open{opacity:1}',
    '.mr-sheet{width:100%;max-height:88vh;overflow-y:auto;background:var(--bg-page);border-radius:22px 22px 0 0;transform:translateY(100%);transition:transform .28s cubic-bezier(.22,.61,.36,1);padding:14px 14px 20px;scrollbar-width:none}',
    '.mr-sheet.open{transform:translateY(0)}',
    '.mr-sheet::-webkit-scrollbar{display:none}',
    '.mr-sheet-head{display:flex;gap:10px;align-items:flex-start;padding:4px 0 10px}',
    '.mr-sheet-close{width:30px;height:30px;border-radius:50%;background:var(--bg-phone);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}',
    '.mr-sheet-title{display:flex;align-items:center;gap:7px;font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.mr-sheet-sub{font:var(--fw-regular) var(--fs-xs)/1.3 var(--font);color:var(--text-muted);margin-top:3px}',
    '.mr-stars{display:flex;justify-content:center;gap:6px;padding:14px 0 6px}',
    '.mr-star{background:none;border:none;padding:2px;cursor:pointer;color:#CBD5E1}',
    '.mr-star.on{color:#F59E0B}',
    '.mr-rating-lbl{text-align:center;font:var(--fw-bold) var(--fs-sm)/1 var(--font);margin-bottom:10px}',
    '.mr-rating-hint{text-align:center;font:var(--fw-regular) var(--fs-xs)/1.2 var(--font);color:var(--text-muted);margin-bottom:10px}',
    '.mr-note{width:100%;min-height:80px;padding:11px;border:1.5px solid var(--border-subtle);background:var(--bg-phone);border-radius:var(--r-lg);font:var(--fw-regular) var(--fs-sm)/1.45 var(--font);color:var(--text-primary);outline:none;resize:vertical;margin-bottom:10px}',
    '.mr-note:focus{border-color:#F59E0B}',
    '.mr-photo-slot{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}',
    '.mr-photo-preview{position:relative;width:100%;max-height:180px;border-radius:var(--r-lg);overflow:hidden;background:var(--bg-phone)}',
    '.mr-photo-preview img{width:100%;max-height:180px;object-fit:cover;display:block}',
    '.mr-photo-remove{position:absolute;top:8px;right:8px;border:none;background:rgba(0,0,0,.55);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.mr-photo-pick{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px;border:1.5px dashed rgba(139,92,246,.35);border-radius:var(--r-lg);background:rgba(139,92,246,.04);cursor:pointer;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:#7C3AED}',
    '.mr-photo-pick:hover{background:rgba(139,92,246,.08)}',
    '.mr-sheet-footer{display:flex;gap:8px}',
    '.mr-btn-submit{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:13px;border:none;border-radius:var(--r-xl);background:linear-gradient(135deg,#F59E0B,#F97316);color:#fff;font:var(--fw-bold) var(--fs-md)/1 var(--font);cursor:pointer;box-shadow:0 6px 16px rgba(245,158,11,.28)}',
    '.mr-btn-submit.is-disabled{opacity:.42;pointer-events:none;box-shadow:none}',
    '.mr-btn-submit:active{transform:scale(.97)}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   RECIPE REVIEWS — Tüm Değerlendirmeler Sayfası
   Tarif detay sayfasındaki rating bölümünden açılır
   ═══════════════════════════════════════════════════════════ */

var _rr = {
  sort: 'newest',    // 'newest' | 'oldest' | 'highest' | 'lowest' | 'withPhoto'
  withPhotoOnly: false,
  withCommentOnly: false,
  search: '',
  pageSize: 8,
  loaded: 8
};

/* Demo review seed — recipeIdx yerine tüm tariflere genel mockup */
var _RR_SEED = [
  { name:'Muhammed Solak', avatar:'https://i.pravatar.cc/80?img=20', rating:5, daysAgo:1,
    text:'Çok güzel oldu! Tariften farklı olarak biraz daha az tuz koydum, tam kıvamında çıktı. Püf noktası sabırla karıştırmak.',
    photo:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&fit=crop', helpful:42,
    reply:{ text:'Sağ olun, denemeniz çok güzel görünüyor! Tuz miktarı gerçekten kişisel tercih.', daysAgo:1 }
  },
  { name:'Zeynep Arslan', avatar:'https://i.pravatar.cc/80?img=21', rating:4, daysAgo:2,
    text:'Güzel bir tarif ama benim için biraz tuzlu oldu. Bir dahakinde yarısı kadar tuz kullanacağım.', photo:null, helpful:18 },
  { name:'Ece Kaya', avatar:'https://i.pravatar.cc/80?img=22', rating:5, daysAgo:3,
    text:'Muhteşem! Ailece bayıldık. Çocuklar bile yedi.',
    photo:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&fit=crop', helpful:31 },
  { name:'Kemal Yılmaz', avatar:'https://i.pravatar.cc/80?img=23', rating:5, daysAgo:4,
    text:'Püf noktası hamurun dinlendirme süresi. 45 dakika dinlendirince doku çok güzel oldu.', photo:null, helpful:27 },
  { name:'Selin Demir', avatar:'https://i.pravatar.cc/80?img=24', rating:2, daysAgo:5,
    text:'Benim elimde olmadı sanırım. Kıvam tutmadı ve biraz su bıraktı.', photo:null, helpful:3,
    reply:{ text:'Merhaba, kıvam tutmaması genelde unun nem oranından olur. Un miktarını 1 kaşık artırmayı deneyin.', daysAgo:5 }
  },
  { name:'Barış Öztürk', avatar:'https://i.pravatar.cc/80?img=25', rating:5, daysAgo:6,
    text:'Mükemmel!',
    photo:'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&fit=crop', helpful:14 },
  { name:'Ayşe Kara',   avatar:'https://i.pravatar.cc/80?img=26', rating:4, daysAgo:7,
    text:'Beğendim. Sunum için üzerine biraz maydanoz ekledim, çok güzel oldu.',
    photo:'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&fit=crop', helpful:21 },
  { name:'Fatih Demir',  avatar:'https://i.pravatar.cc/80?img=27', rating:5, daysAgo:8,
    text:'', photo:null, helpful:8 },
  { name:'Gizem Aksoy', avatar:'https://i.pravatar.cc/80?img=28', rating:3, daysAgo:10,
    text:'Orta karar. İlk kez yaptığım için belki ben eksik bir şey yaptım.', photo:null, helpful:5 },
  { name:'Okan Çelik',  avatar:'https://i.pravatar.cc/80?img=29', rating:5, daysAgo:12,
    text:'Bu tarifi öğrenmek hayatımı değiştirdi. Restoranlara gitmeye gerek kalmadı artık :)',
    photo:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop', helpful:56 },
  { name:'Dilara Yıldız', avatar:'https://i.pravatar.cc/80?img=30', rating:4, daysAgo:15,
    text:'Güzel tarif ama pişirme süresi biraz uzun. Sabırlı olmak gerek.', photo:null, helpful:12 },
  { name:'Emir Tan',    avatar:'https://i.pravatar.cc/80?img=31', rating:5, daysAgo:18,
    text:'Misafirlere yaptım, herkes adresimi istedi tarifi yazdırdı. Teşekkürler!',
    photo:'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&fit=crop', helpful:48 },
  { name:'Nilay Köse',  avatar:'https://i.pravatar.cc/80?img=32', rating:1, daysAgo:20,
    text:'Benim damak tadıma uymadı. Tuzlu çıktı, biraz da fazla baharatlıydı.', photo:null, helpful:2 },
  { name:'Cenk Bal',    avatar:'https://i.pravatar.cc/80?img=33', rating:5, daysAgo:22,
    text:'Harika. İkinci kez deniyorum ve her seferinde aynı başarı.', photo:null, helpful:19 },
  { name:'Pınar Sezer', avatar:'https://i.pravatar.cc/80?img=34', rating:4, daysAgo:25,
    text:'İyi tarif ama sunum önerisi daha ayrıntılı olabilirdi.',
    photo:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&fit=crop', helpful:9 },
  { name:'Tolga Kaya',  avatar:'https://i.pravatar.cc/80?img=35', rating:5, daysAgo:28,
    text:'Şahaneee!', photo:null, helpful:11 }
];

function openRecipeReviews() {
  _rrInjectStyles();
  _rr.loaded = _rr.pageSize;
  _rr.search = ''; _rr.sort = 'newest';
  _rr.withPhotoOnly = false; _rr.withCommentOnly = false;

  var existing = document.getElementById('rrOverlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = 'rrOverlay';
  overlay.className = 'rr-overlay';
  overlay.innerHTML = _rrBody();
  document.getElementById('phone').appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('open'); });
  _rrAttachScroll();
}

function closeRecipeReviews() {
  var el = document.getElementById('rrOverlay');
  if (!el) return;
  el.classList.remove('open');
  setTimeout(function(){ if (el.parentNode) el.remove(); }, 240);
}

function _rrFiltered() {
  var list = _RR_SEED.slice();
  if (_rr.search) {
    var q = _rr.search.toLowerCase();
    list = list.filter(function(r){ return (r.text || '').toLowerCase().indexOf(q) > -1; });
  }
  if (_rr.withPhotoOnly) list = list.filter(function(r){ return r.photo; });
  if (_rr.withCommentOnly) list = list.filter(function(r){ return (r.text || '').trim(); });
  list.sort(function(a,b){
    if (_rr.sort === 'oldest') return b.daysAgo - a.daysAgo;
    if (_rr.sort === 'highest') return b.rating - a.rating || a.daysAgo - b.daysAgo;
    if (_rr.sort === 'lowest') return a.rating - b.rating || a.daysAgo - b.daysAgo;
    if (_rr.sort === 'withPhoto') return (b.photo ? 1 : 0) - (a.photo ? 1 : 0) || a.daysAgo - b.daysAgo;
    return a.daysAgo - b.daysAgo; // newest (smaller daysAgo first)
  });
  return list;
}

function _rrBody() {
  var all = _RR_SEED;
  var total = all.length;
  var avg = (all.reduce(function(s,r){ return s + r.rating; }, 0) / (total || 1)).toFixed(1);
  var dist = [0,0,0,0,0]; // index 0 = 1★, index 4 = 5★
  all.forEach(function(r){ if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
  var maxDist = Math.max.apply(null, dist) || 1;

  var photos = all.filter(function(r){ return r.photo; }).slice(0, 10);

  var filtered = _rrFiltered();
  var visible = filtered.slice(0, _rr.loaded);

  return '<div class="rr-head">'
    + '<div class="rr-close" onclick="closeRecipeReviews()"><iconify-icon icon="solar:arrow-left-outline" style="font-size:20px"></iconify-icon></div>'
    + '<div class="rr-title">Tüm Değerlendirmeler</div>'
    + '<div style="width:36px"></div>'
    + '</div>'
    + '<div class="rr-body" id="rrBody">'
    +   _rrSummary(avg, total, dist, maxDist)
    +   (photos.length ? _rrPhotoGallery(photos) : '')
    +   _rrSearchSort()
    +   _rrList(filtered, visible)
    + '</div>';
}

function _rrSummary(avg, total, dist, maxDist) {
  var bars = [5,4,3,2,1].map(function(star){
    var count = dist[star - 1];
    var pct = Math.round((count / maxDist) * 100);
    return '<div class="rr-bar-row">'
      + '<span class="rr-bar-star">' + star + '★</span>'
      + '<div class="rr-bar-track"><div class="rr-bar-fill" style="width:' + pct + '%"></div></div>'
      + '<span class="rr-bar-count">' + count + '</span>'
      + '</div>';
  }).join('');

  return '<div class="rr-summary">'
    + '<div class="rr-summary-left">'
    +   '<div class="rr-summary-num">' + avg + '</div>'
    +   _rrStars(Math.round(parseFloat(avg)), 14)
    +   '<div class="rr-summary-total">' + total + ' değerlendirme</div>'
    + '</div>'
    + '<div class="rr-summary-right">' + bars + '</div>'
    + '</div>';
}

function _rrPhotoGallery(photos) {
  var items = photos.map(function(r, i){
    return '<div class="rr-gal-item" onclick="_rrOpenPhoto(\'' + r.photo + '\',\'' + _rrMaskName(r.name) + '\')" style="background-image:url(\'' + r.photo + '\')"></div>';
  }).join('');
  return '<div class="rr-gallery">'
    + '<div class="rr-gallery-head">'
    +   '<iconify-icon icon="solar:gallery-bold" style="font-size:16px;color:#F97316"></iconify-icon>'
    +   '<div><div class="rr-gallery-title">Yapanların Fotoğrafları</div>'
    +   '<div class="rr-gallery-sub">' + photos.length + ' kullanıcının sonucu</div></div>'
    + '</div>'
    + '<div class="rr-gallery-grid">' + items + '</div>'
    + '</div>';
}

function _rrOpenPhoto(src, name) {
  var m = document.createElement('div');
  m.id = 'rrPhotoViewer';
  m.style.cssText = 'position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s';
  m.onclick = function(){ m.style.opacity = '0'; setTimeout(function(){ if (m.parentNode) m.remove(); }, 200); };
  m.innerHTML = '<div style="position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;cursor:pointer"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div style="position:absolute;top:24px;left:16px;padding:6px 12px;border-radius:var(--r-full);background:rgba(255,255,255,.16);font:var(--fw-semibold) 12px/1 var(--font);color:#fff">' + name + '</div>'
    + '<img src="' + src + '" style="max-width:100%;max-height:90%;object-fit:contain;border-radius:var(--r-lg)">';
  document.body.appendChild(m);
  requestAnimationFrame(function(){ m.style.opacity = '1'; });
}

function _rrSearchSort() {
  return '<div class="rr-filters">'
    + '<div class="rr-search">'
    +   '<iconify-icon icon="solar:magnifer-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    +   '<input type="text" placeholder="Yorumlarda ara (tuzlu, kıvam, püf...)" oninput="_rrSetSearch(this.value)" value="' + _rrEsc(_rr.search) + '">'
    +   (_rr.search ? '<iconify-icon icon="solar:close-circle-bold" style="font-size:15px;color:var(--text-muted);cursor:pointer" onclick="_rrSetSearch(\'\')"></iconify-icon>' : '')
    + '</div>'
    + '<div class="rr-chip-row">'
    +   _rrSortChip('newest', 'En Yeni')
    +   _rrSortChip('oldest', 'En Eski')
    +   _rrSortChip('highest', 'Yüksek Puan')
    +   _rrSortChip('lowest', 'Düşük Puan')
    +   _rrSortChip('withPhoto', 'Fotoğraflı Öncelikli')
    + '</div>'
    + '<div class="rr-check-row">'
    +   '<label class="rr-check"><input type="checkbox"' + (_rr.withCommentOnly ? ' checked' : '') + ' onchange="_rrToggleFilter(\'withCommentOnly\')"><span>Sadece yorumlu</span></label>'
    +   '<label class="rr-check"><input type="checkbox"' + (_rr.withPhotoOnly ? ' checked' : '') + ' onchange="_rrToggleFilter(\'withPhotoOnly\')"><span>Sadece fotoğraflı</span></label>'
    + '</div>'
    + '</div>';
}

function _rrSortChip(val, label) {
  var active = _rr.sort === val;
  return '<button class="rr-chip' + (active ? ' active' : '') + '" onclick="_rrSetSort(\'' + val + '\')">' + label + '</button>';
}

function _rrSetSort(v) { _rr.sort = v; _rr.loaded = _rr.pageSize; _rrRerender(); }
function _rrSetSearch(v) { _rr.search = v; _rr.loaded = _rr.pageSize; _rrRerenderBody(); }
function _rrToggleFilter(key) { _rr[key] = !_rr[key]; _rr.loaded = _rr.pageSize; _rrRerender(); }

function _rrList(filtered, visible) {
  if (!visible.length) {
    return '<div class="rr-empty">'
      + '<iconify-icon icon="solar:chat-square-linear" style="font-size:52px;opacity:.3"></iconify-icon>'
      + '<div class="rr-empty-title">Aradığın kriterlerde bir yorum bulunamadı</div>'
      + '<div class="rr-empty-sub">Filtreleri temizleyip tekrar dene</div>'
      + '</div>';
  }
  var cards = visible.map(_rrCard).join('');
  var loadMore = filtered.length > visible.length
    ? '<div class="rr-loadmore" onclick="_rrLoadMore()"><iconify-icon icon="solar:alt-arrow-down-linear" style="font-size:15px"></iconify-icon>Daha fazla yükle <span>(' + (filtered.length - visible.length) + ')</span></div>'
    : '<div class="rr-end">Tüm yorumları gördün · toplam ' + filtered.length + '</div>';
  return '<div class="rr-list" id="rrList">' + cards + '</div>' + loadMore;
}

function _rrLoadMore() {
  _rr.loaded = Math.min(_rrFiltered().length, _rr.loaded + _rr.pageSize);
  _rrRerenderBody();
}

function _rrCard(r, idx) {
  var ind = _rrRelative(r.daysAgo);
  var helpfulState = r.userFoundHelpful; // undefined | 'yes'
  return '<div class="rr-card" data-idx="' + idx + '">'
    + '<div class="rr-card-head">'
    +   '<img class="rr-avatar" src="' + r.avatar + '" alt="">'
    +   '<div style="flex:1;min-width:0">'
    +     '<div class="rr-name">' + _rrMaskName(r.name) + '</div>'
    +     '<div class="rr-meta">' + _rrStars(r.rating, 12) + '<span class="rr-dot">·</span><span class="rr-time">' + ind + '</span></div>'
    +   '</div>'
    + '</div>'
    + (r.text ? '<div class="rr-text">' + _rrEsc(r.text) + '</div>' : '')
    + (r.photo ? '<div class="rr-photo" onclick="_rrOpenPhoto(\'' + r.photo + '\',\'' + _rrMaskName(r.name) + '\')" style="background-image:url(\'' + r.photo + '\')"></div>' : '')
    + (r.reply ? _rrReplyBlock(r.reply) : '')
    + '<div class="rr-foot">'
    +   '<span class="rr-foot-lbl">Bu yorumu faydalı buldun mu?</span>'
    +   '<button class="rr-helpful' + (helpfulState === 'yes' ? ' on' : '') + '" onclick="_rrMarkHelpful(' + idx + ',\'yes\')"><iconify-icon icon="solar:like-' + (helpfulState === 'yes' ? 'bold' : 'linear') + '" style="font-size:13px"></iconify-icon>Evet' + (r.helpful ? ' (' + r.helpful + ')' : '') + '</button>'
    +   '<button class="rr-helpful' + (helpfulState === 'no' ? ' on' : '') + '" onclick="_rrMarkHelpful(' + idx + ',\'no\')"><iconify-icon icon="solar:dislike-' + (helpfulState === 'no' ? 'bold' : 'linear') + '" style="font-size:13px"></iconify-icon>Hayır</button>'
    + '</div>'
    + '</div>';
}

function _rrReplyBlock(reply) {
  return '<div class="rr-reply">'
    + '<div class="rr-reply-head"><iconify-icon icon="solar:chef-hat-bold" style="font-size:13px;color:#F97316"></iconify-icon><span class="rr-reply-lbl">Yazarın Yanıtı</span><span class="rr-reply-time">' + _rrRelative(reply.daysAgo) + '</span></div>'
    + '<div class="rr-reply-text">' + _rrEsc(reply.text) + '</div>'
    + '</div>';
}

function _rrMarkHelpful(idx, val) {
  var list = _rrFiltered();
  var r = list[idx];
  if (!r) return;
  var prev = r.userFoundHelpful;
  if (prev === val) {
    r.userFoundHelpful = null;
    if (val === 'yes' && r.helpful) r.helpful--;
  } else {
    if (prev === 'yes' && r.helpful) r.helpful--;
    r.userFoundHelpful = val;
    if (val === 'yes') r.helpful = (r.helpful || 0) + 1;
  }
  _rrRerenderBody();
}

/* Scroll-based infinite load */
function _rrAttachScroll() {
  var body = document.getElementById('rrBody');
  if (!body) return;
  body.addEventListener('scroll', function(){
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 80) {
      var filtered = _rrFiltered();
      if (_rr.loaded < filtered.length) {
        _rr.loaded = Math.min(filtered.length, _rr.loaded + _rr.pageSize);
        _rrRerenderBody();
      }
    }
  });
}

function _rrRerender() {
  var o = document.getElementById('rrOverlay');
  if (!o) return;
  o.innerHTML = _rrBody();
  _rrAttachScroll();
}
function _rrRerenderBody() {
  var body = document.getElementById('rrBody');
  if (!body) return;
  body.innerHTML = '';
  var all = _RR_SEED;
  var total = all.length;
  var avg = (all.reduce(function(s,r){ return s + r.rating; }, 0) / (total || 1)).toFixed(1);
  var dist = [0,0,0,0,0];
  all.forEach(function(r){ if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
  var maxDist = Math.max.apply(null, dist) || 1;
  var photos = all.filter(function(r){ return r.photo; }).slice(0, 10);
  var filtered = _rrFiltered();
  var visible = filtered.slice(0, _rr.loaded);
  body.innerHTML = _rrSummary(avg, total, dist, maxDist)
    + (photos.length ? _rrPhotoGallery(photos) : '')
    + _rrSearchSort()
    + _rrList(filtered, visible);
}

/* Helpers */
function _rrMaskName(name) {
  if (!name) return '—';
  var parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  var last = parts[parts.length - 1];
  return parts.slice(0, -1).concat(last.charAt(0) + '*****').join(' ');
}
function _rrStars(n, size) {
  var s = '';
  for (var i = 0; i < 5; i++) {
    s += '<iconify-icon icon="solar:star-' + (i < n ? 'bold' : 'linear') + '" style="font-size:' + (size || 13) + 'px;color:' + (i < n ? '#F59E0B' : 'var(--text-tertiary)') + '"></iconify-icon>';
  }
  return '<span class="rr-stars">' + s + '</span>';
}
function _rrRelative(days) {
  if (days === 0) return 'bugün';
  if (days === 1) return 'dün';
  if (days < 7) return days + ' gün önce';
  if (days < 30) return Math.floor(days / 7) + ' hafta önce';
  return Math.floor(days / 30) + ' ay önce';
}
function _rrEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _rrInjectStyles() {
  if (document.getElementById('rrStyles')) return;
  var s = document.createElement('style');
  s.id = 'rrStyles';
  s.textContent = [
    '.rr-overlay{position:fixed;inset:0;z-index:118;background:var(--bg-page);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateX(20px);transition:opacity .25s ease, transform .25s ease}',
    '.rr-overlay.open{opacity:1;transform:translateX(0)}',
    '.rr-head{padding:max(env(safe-area-inset-top),16px) 16px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);flex-shrink:0;background:var(--bg-page)}',
    '.rr-close{width:36px;height:36px;border-radius:50%;background:var(--bg-btn);display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.rr-title{flex:1;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);text-align:center}',
    '.rr-body{flex:1;overflow-y:auto;padding:14px var(--app-px) 28px;display:flex;flex-direction:column;gap:14px}',
    /* Summary */
    '.rr-summary{display:flex;gap:16px;padding:16px;background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-sm)}',
    '.rr-summary-left{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;min-width:92px}',
    '.rr-summary-num{font:var(--fw-bold) 38px/1 var(--font);color:var(--text-primary);letter-spacing:-1px}',
    '.rr-summary-total{font:var(--fw-medium) 10.5px/1 var(--font);color:var(--text-muted);margin-top:3px}',
    '.rr-summary-right{flex:1;display:flex;flex-direction:column;gap:6px}',
    '.rr-bar-row{display:flex;align-items:center;gap:8px}',
    '.rr-bar-star{font:var(--fw-bold) 10.5px/1 var(--font);color:var(--text-muted);min-width:22px}',
    '.rr-bar-track{flex:1;height:6px;background:var(--bg-btn);border-radius:var(--r-full);overflow:hidden}',
    '.rr-bar-fill{height:100%;background:linear-gradient(90deg,#F59E0B,#F97316);border-radius:var(--r-full);transition:width .4s ease}',
    '.rr-bar-count{font:var(--fw-medium) 10px/1 var(--font);color:var(--text-muted);min-width:22px;text-align:right}',
    /* Gallery */
    '.rr-gallery{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-sm)}',
    '.rr-gallery-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
    '.rr-gallery-title{font:var(--fw-bold) 13px/1.2 var(--font);color:var(--text-primary)}',
    '.rr-gallery-sub{font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted);margin-top:2px}',
    '.rr-gallery-grid{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}',
    '.rr-gallery-grid::-webkit-scrollbar{display:none}',
    '.rr-gal-item{flex-shrink:0;width:86px;height:86px;border-radius:var(--r-md);background-size:cover;background-position:center;cursor:pointer;border:1px solid var(--border-subtle);transition:transform .15s}',
    '.rr-gal-item:hover{transform:scale(1.03)}',
    /* Filters */
    '.rr-filters{display:flex;flex-direction:column;gap:8px}',
    '.rr-search{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-btn);border-radius:var(--r-full)}',
    '.rr-search input{flex:1;border:none;background:transparent;outline:none;font:var(--fw-medium) 13px/1 var(--font);color:var(--text-primary)}',
    '.rr-chip-row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}',
    '.rr-chip-row::-webkit-scrollbar{display:none}',
    '.rr-chip{padding:7px 12px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-medium) 11.5px/1 var(--font);border-radius:var(--r-full);cursor:pointer;white-space:nowrap;flex-shrink:0}',
    '.rr-chip.active{background:var(--primary);color:#fff;border-color:var(--primary)}',
    '.rr-check-row{display:flex;gap:14px;flex-wrap:wrap}',
    '.rr-check{display:flex;align-items:center;gap:6px;font:var(--fw-medium) 11.5px/1 var(--font);color:var(--text-secondary);cursor:pointer}',
    '.rr-check input{accent-color:var(--primary)}',
    /* List */
    '.rr-list{display:flex;flex-direction:column;gap:10px}',
    '.rr-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:12px 14px;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:8px}',
    '.rr-card-head{display:flex;align-items:center;gap:10px}',
    '.rr-avatar{width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0}',
    '.rr-name{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}',
    '.rr-meta{display:flex;align-items:center;gap:5px;margin-top:3px}',
    '.rr-stars{display:inline-flex;gap:1px}',
    '.rr-dot{color:var(--text-tertiary);font:var(--fw-medium) 11px/1 var(--font)}',
    '.rr-time{font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted)}',
    '.rr-text{font:var(--fw-regular) 12.5px/1.5 var(--font);color:var(--text-secondary)}',
    '.rr-photo{width:100%;aspect-ratio:16/10;border-radius:var(--r-md);background-size:cover;background-position:center;cursor:pointer;border:1px solid var(--border-subtle);transition:transform .15s}',
    '.rr-photo:hover{transform:scale(1.01)}',
    '.rr-reply{background:linear-gradient(135deg,rgba(249,115,22,0.06),rgba(236,72,153,0.04));border:1px solid rgba(249,115,22,0.22);border-radius:var(--r-lg);padding:10px 12px;border-left:3px solid #F97316}',
    '.rr-reply-head{display:flex;align-items:center;gap:6px;margin-bottom:4px}',
    '.rr-reply-lbl{font:var(--fw-bold) 10.5px/1 var(--font);color:#F97316;letter-spacing:.2px;flex:1}',
    '.rr-reply-time{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}',
    '.rr-reply-text{font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-primary)}',
    '.rr-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:6px;border-top:1px dashed var(--border-subtle)}',
    '.rr-foot-lbl{font:var(--fw-medium) 10.5px/1.3 var(--font);color:var(--text-muted);flex:1;min-width:100%}',
    '.rr-helpful{padding:5px 10px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);border-radius:var(--r-full);font:var(--fw-semibold) 10.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}',
    '.rr-helpful.on{background:var(--primary-light);border-color:var(--primary);color:var(--primary)}',
    '.rr-loadmore{padding:12px;text-align:center;font:var(--fw-bold) 12px/1 var(--font);color:var(--primary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--primary-light);border-radius:var(--r-lg);margin-top:4px}',
    '.rr-loadmore span{color:var(--text-muted);font-weight:500}',
    '.rr-end{padding:14px;text-align:center;font:var(--fw-medium) 11px/1.4 var(--font);color:var(--text-muted)}',
    '.rr-empty{padding:60px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px}',
    '.rr-empty-title{font:var(--fw-bold) 13.5px/1.3 var(--font);color:var(--text-primary);margin-top:6px}',
    '.rr-empty-sub{font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-muted)}'
  ].join('\n');
  document.head.appendChild(s);
}

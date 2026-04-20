/* ═══════════════════════════════════════════════════════════
   BIZ REVIEWS — Değerlendirmeler (İşletme + Menü ayrımı)
   Sekmeler · filtreler · maskelenmiş ad · tek-seferlik yanıt
   + düzenleme · hızlı yanıt taslakları · boş durum
   ═══════════════════════════════════════════════════════════ */

var _rvw = {
  tab: 'business',      // 'business' | 'menu'
  sort: 'newest',       // 'newest' | 'oldest'
  rating: 'all',        // 'all' | 'pos' | 'neg'
  status: 'all',        // 'all' | 'pending' | 'replied'
  replyFor: null,       // id of review being replied
  editFor: null         // id of reply being edited
};

var _RVW_TEMPLATES = {
  positive: [
    { icon: '🌟', text: 'Değerli yorumunuz için çok teşekkür ederiz, sizi tekrar bekleriz!' },
    { icon: '🤝', text: 'Güzel yorumunuz ekibimize enerji verdi — her zaman misafir olmanızdan onur duyarız.' },
    { icon: '💙', text: 'Beğeniniz bizim için en büyük motivasyon. Tekrar görüşmek dileğiyle!' }
  ],
  neutral: [
    { icon: '📝', text: 'Geri bildiriminiz için teşekkür ederiz, notlarınızı ekip içi değerlendirmeye aldık.' },
    { icon: '🔎', text: 'Söylediklerinizi dikkatle inceleyip hizmetimizi iyileştireceğiz.' }
  ],
  negative: [
    { icon: '🙏', text: 'Yaşadığınız deneyim için özür dileriz; detayları incelemek için sizinle iletişime geçmek isteriz.' },
    { icon: '💬', text: 'Yorumunuzu ciddiye alıyoruz. Ekibimiz gerekli iyileştirmeleri bugün içinde başlatıyor.' },
    { icon: '🎁', text: 'Deneyiminizi telafi etmek için bir sonraki siparişinizde size özel bir sürprizimiz olacak.' }
  ]
};

function openBizReviews() {
  if (typeof bizRoleGuard === 'function' && !bizRoleGuard('reviews')) return;
  _rvwInjectStyles();
  var overlay = createBizOverlay('bizReviewsOverlay', 'Değerlendirmeler', _rvwBody());
  document.getElementById('bizPhone').appendChild(overlay);
}

function _rvwAllReviews() {
  // Mevcut type alanı olmayanları 'business' say
  return BIZ_REVIEWS.map(function(r){
    return Object.assign({}, r, { type: r.type || 'business' });
  }).filter(function(r){ return r.branchId === bizActiveBranch; });
}

function _rvwBody() {
  var all = _rvwAllReviews();
  var business = all.filter(function(r){ return r.type === 'business'; });
  var menu = all.filter(function(r){ return r.type === 'menu'; });
  var avg = all.length ? (all.reduce(function(s,r){ return s + r.rating; }, 0) / all.length) : 0;
  var pendingCount = all.filter(function(r){ return !r.reply; }).length;

  var list = (_rvw.tab === 'business' ? business : menu);
  list = _rvwApplyFilters(list);

  return '<div class="rvw-wrap">'
    + _rvwHeaderCard(avg, all.length, pendingCount)
    + _rvwTabs(business.length, menu.length)
    + _rvwFilterBar()
    + _rvwList(list)
    + '</div>';
}

/* ─ Header ─ */
function _rvwHeaderCard(avg, total, pending) {
  return '<div class="rvw-hero">'
    + '<div class="rvw-hero-num">' + avg.toFixed(1) + '</div>'
    + _rvwStars(Math.round(avg), 16)
    + '<div class="rvw-hero-total">' + total + ' değerlendirme</div>'
    + (pending > 0 ? '<div class="rvw-hero-pending"><iconify-icon icon="solar:bell-bing-bold" style="font-size:14px"></iconify-icon>' + pending + ' yanıtlanmamış</div>' : '')
    + '</div>';
}

/* ─ Tabs ─ */
function _rvwTabs(biz, menu) {
  return '<div class="rvw-tabs">'
    + '<button class="rvw-tab' + (_rvw.tab === 'business' ? ' active' : '') + '" onclick="_rvwSetTab(\'business\')">'
    +   '<iconify-icon icon="solar:shop-bold" style="font-size:14px"></iconify-icon>İşletme <span class="rvw-tab-count">' + biz + '</span>'
    + '</button>'
    + '<button class="rvw-tab' + (_rvw.tab === 'menu' ? ' active' : '') + '" onclick="_rvwSetTab(\'menu\')">'
    +   '<iconify-icon icon="solar:notebook-bold" style="font-size:14px"></iconify-icon>Menü <span class="rvw-tab-count">' + menu + '</span>'
    + '</button>'
    + '</div>';
}

function _rvwSetTab(t) { _rvw.tab = t; _rvwRerender(); }

/* ─ Filter bar ─ */
function _rvwFilterBar() {
  return '<div class="rvw-filters">'
    + _rvwFilter('sort', 'En Yeni', 'newest')
    + _rvwFilter('sort', 'En Eski', 'oldest')
    + '<span class="rvw-divider"></span>'
    + _rvwFilter('rating', 'Olumlu', 'pos')
    + _rvwFilter('rating', 'Olumsuz', 'neg')
    + '<span class="rvw-divider"></span>'
    + _rvwFilter('status', 'Yanıtlanmamış', 'pending')
    + _rvwFilter('status', 'Yanıtlanmış', 'replied')
    + '</div>';
}

function _rvwFilter(key, label, value) {
  var active = _rvw[key] === value;
  return '<button class="rvw-chip' + (active ? ' active' : '') + '" onclick="_rvwToggleFilter(\'' + key + '\',\'' + value + '\')">' + label + '</button>';
}

function _rvwToggleFilter(key, value) {
  // Toggle: aynı değere tıklanınca 'all'a geri dön
  if (key === 'sort') _rvw.sort = value;
  else _rvw[key] = (_rvw[key] === value) ? 'all' : value;
  _rvwRerender();
}

function _rvwApplyFilters(list) {
  var out = list.slice();
  if (_rvw.rating === 'pos') out = out.filter(function(r){ return r.rating >= 4; });
  else if (_rvw.rating === 'neg') out = out.filter(function(r){ return r.rating <= 2; });
  if (_rvw.status === 'pending') out = out.filter(function(r){ return !r.reply; });
  else if (_rvw.status === 'replied') out = out.filter(function(r){ return !!r.reply; });
  out.sort(function(a,b){
    var da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
    return _rvw.sort === 'oldest' ? da - db : db - da;
  });
  return out;
}

/* ─ List ─ */
function _rvwList(list) {
  if (!list.length) {
    return '<div class="rvw-empty">'
      + '<iconify-icon icon="solar:chat-square-like-linear" style="font-size:56px;opacity:.3"></iconify-icon>'
      + '<div class="rvw-empty-title">Henüz bir değerlendirme almadınız</div>'
      + '<div class="rvw-empty-sub">Müşterilerinizin yorumları burada listelenecek</div>'
      + '</div>';
  }
  return '<div class="rvw-list">' + list.map(_rvwCard).join('') + '</div>';
}

function _rvwCard(r) {
  var maskedName = _rvwMaskName(r.customerName);
  var dateStr = _rvwFmtDate(r.date);
  var isPending = !r.reply;
  return '<div class="rvw-card">'
    + '<div class="rvw-card-head">'
    +   '<img class="rvw-avatar" src="' + r.customerAvatar + '" alt="">'
    +   '<div style="flex:1;min-width:0">'
    +     '<div class="rvw-name">' + maskedName + '</div>'
    +     '<div class="rvw-date">' + dateStr + '</div>'
    +   '</div>'
    +   '<div class="rvw-stars-inline">' + _rvwStars(r.rating, 14) + '</div>'
    + '</div>'
    + (r.type === 'menu' && r.menuItemName ? '<div class="rvw-menu-chip"><iconify-icon icon="solar:dish-bold" style="font-size:12px"></iconify-icon>' + r.menuItemName + '</div>' : '')
    + (r.text ? '<div class="rvw-text">' + _rvwEsc(r.text) + '</div>' : '<div class="rvw-text rvw-text-empty">Yorum yazılmamış, sadece puan verilmiş.</div>')
    + (r.reply ? _rvwReplyBlock(r) : _rvwReplyBtn(r))
    + '</div>';
}

function _rvwReplyBlock(r) {
  return '<div class="rvw-reply">'
    + '<div class="rvw-reply-head">'
    +   '<iconify-icon icon="solar:shop-2-bold" style="font-size:13px;color:var(--primary)"></iconify-icon>'
    +   '<span class="rvw-reply-lbl">İşletme Yanıtı</span>'
    +   '<span class="rvw-reply-time">' + _rvwFmtDate(r.reply.date) + '</span>'
    +   '<button class="rvw-reply-edit" onclick="_rvwOpenReply(\'' + r.id + '\',true)">Düzenle</button>'
    + '</div>'
    + '<div class="rvw-reply-text">' + _rvwEsc(r.reply.text) + '</div>'
    + '</div>';
}

function _rvwReplyBtn(r) {
  return '<button class="rvw-reply-btn" onclick="_rvwOpenReply(\'' + r.id + '\',false)">'
    + '<iconify-icon icon="solar:reply-2-linear" style="font-size:14px"></iconify-icon>Yanıtla'
    + '</button>';
}

/* ─ Reply modal ─ */
function _rvwOpenReply(id, isEdit) {
  _rvw.replyFor = id;
  _rvw.editFor = isEdit ? id : null;
  var r = BIZ_REVIEWS.find(function(x){ return x.id === id; });
  if (!r) return;
  var currentText = isEdit && r.reply ? r.reply.text : '';
  var templatesKey = r.rating >= 4 ? 'positive' : r.rating <= 2 ? 'negative' : 'neutral';
  var templates = _RVW_TEMPLATES[templatesKey];

  var phone = document.getElementById('bizPhone');
  var m = document.createElement('div');
  m.id = 'rvwReplyModal';
  m.className = 'rvw-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) m.remove(); };
  m.innerHTML = '<div class="rvw-modal">'
    + '<div class="rvw-modal-head">'
    +   '<div class="rvw-modal-close" onclick="document.getElementById(\'rvwReplyModal\').remove()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    +   '<div class="rvw-modal-title">' + (isEdit ? 'Yanıtı Düzenle' : 'Yoruma Yanıt Ver') + '</div>'
    +   '<div class="rvw-modal-sub">' + _rvwMaskName(r.customerName) + ' · ' + r.rating + '★</div>'
    + '</div>'
    + '<div class="rvw-modal-body">'
    +   '<div class="rvw-quote"><iconify-icon icon="solar:quote-up-linear" style="font-size:14px;color:var(--text-tertiary);flex-shrink:0"></iconify-icon><span>' + _rvwEsc(r.text || 'Yorum yazılmamış.') + '</span></div>'
    +   '<div class="rvw-tpl-head">Hızlı Yanıt Taslakları</div>'
    +   '<div class="rvw-tpl-list">'
    +     templates.map(function(t, i){
          return '<button class="rvw-tpl" onclick="_rvwFillTpl(' + i + ',\'' + templatesKey + '\')"><span class="rvw-tpl-emoji">' + t.icon + '</span><span>' + t.text + '</span></button>';
        }).join('')
    +   '</div>'
    +   '<label class="rvw-label">Yanıtın</label>'
    +   '<textarea id="rvwReplyText" rows="4" class="rvw-input" placeholder="Nazik ve samimi bir yanıt yaz...">' + _rvwEsc(currentText) + '</textarea>'
    +   (!isEdit ? '<div class="rvw-note"><iconify-icon icon="solar:info-circle-bold" style="font-size:12px;color:var(--text-muted)"></iconify-icon>Her yoruma yalnızca bir kez yanıt verebilirsin. Sonrasında düzenleyebilirsin.</div>' : '')
    +   '<div class="rvw-actions">'
    +     '<button class="rvw-btn rvw-btn--ghost" onclick="document.getElementById(\'rvwReplyModal\').remove()">Vazgeç</button>'
    +     '<button class="rvw-btn rvw-btn--primary" onclick="_rvwSubmitReply(\'' + id + '\',' + (isEdit ? 'true' : 'false') + ')">' + (isEdit ? 'Güncelle' : 'Yanıtı Gönder') + '</button>'
    +   '</div>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _rvwFillTpl(i, key) {
  var t = _RVW_TEMPLATES[key][i];
  var ta = document.getElementById('rvwReplyText');
  if (ta && t) { ta.value = t.text; ta.focus(); }
}

function _rvwSubmitReply(id, isEdit) {
  var ta = document.getElementById('rvwReplyText');
  if (!ta) return;
  var text = ta.value.trim();
  if (!text) { if (typeof _admToast === 'function') _admToast('Yanıt boş olamaz', 'err'); else alert('Yanıt boş olamaz'); return; }
  var r = BIZ_REVIEWS.find(function(x){ return x.id === id; });
  if (!r) return;
  if (isEdit && r.reply) {
    r.reply.text = text;
    r.reply.date = new Date().toISOString();
  } else {
    r.reply = { author: (AUTH && AUTH.user && AUTH.user.name) || 'İşletme', text: text, date: new Date().toISOString() };
  }
  var m = document.getElementById('rvwReplyModal');
  if (m) m.remove();
  if (typeof _admToast === 'function') _admToast(isEdit ? 'Yanıt güncellendi' : 'Yanıt gönderildi', 'ok');
  _rvwRerender();
}

/* ─ Helpers ─ */
function _rvwRerender() {
  var o = document.getElementById('bizReviewsOverlay');
  if (!o) return;
  var content = o.querySelector('[style*="overflow-y:auto"]');
  if (content) content.innerHTML = _rvwBody();
}

function _rvwMaskName(full) {
  if (!full) return '—';
  var parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  var last = parts[parts.length - 1];
  return parts.slice(0, -1).concat(last.charAt(0) + '***').join(' ');
}

function _rvwStars(n, size) {
  var s = '';
  for (var i = 0; i < 5; i++) {
    s += '<iconify-icon icon="solar:star-' + (i < n ? 'bold' : 'linear') + '" style="font-size:' + (size || 14) + 'px;color:' + (i < n ? '#F59E0B' : 'var(--text-tertiary)') + '"></iconify-icon>';
  }
  return '<div class="rvw-stars">' + s + '</div>';
}

function _rvwFmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  var now = new Date();
  var diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Bugün ' + d.toTimeString().slice(0,5);
  if (diffDays === 1) return 'Dün ' + d.toTimeString().slice(0,5);
  if (diffDays < 7) return diffDays + ' gün önce';
  return d.toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' });
}

function _rvwEsc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ─ Legacy: eski biz-reviews.js'in renderBizReviewsContent'i için shim ─ */
function renderBizReviewsContent() { return _rvwBody(); }

function _rvwInjectStyles() {
  if (document.getElementById('rvwStyles')) return;
  var s = document.createElement('style');
  s.id = 'rvwStyles';
  s.textContent = [
    '.rvw-wrap{display:flex;flex-direction:column;gap:12px;padding-bottom:20px}',
    '/* Hero */',
    '.rvw-hero{background:linear-gradient(135deg,rgba(245,158,11,0.08),var(--bg-phone));border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:18px 16px;text-align:center;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;align-items:center;gap:6px}',
    '.rvw-hero-num{font:var(--fw-bold) 36px/1 var(--font);color:var(--text-primary)}',
    '.rvw-hero-total{font:var(--fw-medium) 11.5px/1 var(--font);color:var(--text-muted);margin-top:2px}',
    '.rvw-hero-pending{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:var(--r-full);background:rgba(239,68,68,0.12);color:#DC2626;font:var(--fw-bold) 11px/1 var(--font);margin-top:4px;letter-spacing:.2px}',
    '/* Tabs */',
    '.rvw-tabs{display:flex;gap:4px;background:var(--bg-btn);padding:4px;border-radius:var(--r-full);align-self:stretch}',
    '.rvw-tab{flex:1;padding:9px 12px;border:none;background:transparent;color:var(--text-muted);font:var(--fw-semibold) 12px/1 var(--font);border-radius:var(--r-full);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:all .18s}',
    '.rvw-tab.active{background:var(--bg-phone);color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.06)}',
    '.rvw-tab-count{padding:1px 7px;border-radius:var(--r-full);background:var(--bg-btn);color:var(--text-muted);font:var(--fw-bold) 10px/1.4 var(--font)}',
    '.rvw-tab.active .rvw-tab-count{background:var(--primary);color:#fff}',
    '/* Filters */',
    '.rvw-filters{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0;align-items:center}',
    '.rvw-filters::-webkit-scrollbar{display:none}',
    '.rvw-chip{padding:6px 12px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-medium) 11.5px/1 var(--font);border-radius:var(--r-full);cursor:pointer;white-space:nowrap;flex-shrink:0}',
    '.rvw-chip.active{background:var(--primary);color:#fff;border-color:var(--primary)}',
    '.rvw-divider{width:1px;height:18px;background:var(--border-subtle);flex-shrink:0}',
    '/* List */',
    '.rvw-list{display:flex;flex-direction:column;gap:10px}',
    '.rvw-card{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:14px;box-shadow:var(--shadow-sm)}',
    '.rvw-card-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}',
    '.rvw-avatar{width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0}',
    '.rvw-name{font:var(--fw-semibold) var(--fs-sm)/1.2 var(--font);color:var(--text-primary)}',
    '.rvw-date{font:var(--fw-regular) 10.5px/1 var(--font);color:var(--text-muted);margin-top:3px}',
    '.rvw-stars-inline{flex-shrink:0}',
    '.rvw-stars{display:inline-flex;align-items:center;gap:1px}',
    '.rvw-menu-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:var(--r-full);background:rgba(139,92,246,0.1);color:#8B5CF6;font:var(--fw-bold) 10.5px/1.3 var(--font);margin-bottom:8px}',
    '.rvw-text{font:var(--fw-regular) 12.5px/1.55 var(--font);color:var(--text-secondary)}',
    '.rvw-text-empty{font-style:italic;color:var(--text-muted)}',
    '.rvw-reply{margin-top:10px;padding:10px 12px;background:var(--bg-btn);border-radius:var(--r-lg);border-left:3px solid var(--primary)}',
    '.rvw-reply-head{display:flex;align-items:center;gap:6px;margin-bottom:6px}',
    '.rvw-reply-lbl{font:var(--fw-bold) 10.5px/1 var(--font);color:var(--primary);letter-spacing:.2px;flex:1}',
    '.rvw-reply-time{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted)}',
    '.rvw-reply-edit{border:none;background:transparent;color:var(--primary);font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;padding:2px 6px;margin-left:8px}',
    '.rvw-reply-text{font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-primary)}',
    '.rvw-reply-btn{margin-top:10px;padding:8px 12px;border:1px solid var(--primary);background:var(--primary-light);color:var(--primary);border-radius:var(--r-md);font:var(--fw-bold) 11.5px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px}',
    '.rvw-reply-btn:active{transform:scale(.97)}',
    '/* Empty */',
    '.rvw-empty{padding:60px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.rvw-empty-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary);margin-top:8px}',
    '.rvw-empty-sub{font:var(--fw-regular) 12px/1.4 var(--font);color:var(--text-muted);max-width:260px}',
    '/* Modal */',
    '.rvw-modal-backdrop{position:fixed;inset:0;z-index:95;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s}',
    '.rvw-modal-backdrop.open{opacity:1}',
    '.rvw-modal{width:100%;max-width:440px;background:var(--bg-page);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;transform:translateY(20px);transition:transform .28s ease}',
    '.rvw-modal-backdrop.open .rvw-modal{transform:translateY(0)}',
    '.rvw-modal-head{padding:16px 18px 14px;border-bottom:1px solid var(--border-subtle);text-align:center;position:relative}',
    '.rvw-modal-close{position:absolute;top:12px;right:12px;cursor:pointer}',
    '.rvw-modal-title{font:var(--fw-bold) var(--fs-md)/1.2 var(--font);color:var(--text-primary)}',
    '.rvw-modal-sub{font:var(--fw-regular) 11.5px/1.4 var(--font);color:var(--text-muted);margin-top:4px}',
    '.rvw-modal-body{padding:14px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}',
    '.rvw-quote{display:flex;gap:6px;padding:10px 12px;background:var(--bg-btn);border-radius:var(--r-md);font:var(--fw-regular) 12px/1.5 var(--font);color:var(--text-secondary)}',
    '.rvw-tpl-head{font:var(--fw-bold) 10.5px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-top:4px}',
    '.rvw-tpl-list{display:flex;flex-direction:column;gap:6px}',
    '.rvw-tpl{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-primary);font:var(--fw-medium) 12px/1.4 var(--font);border-radius:var(--r-md);cursor:pointer;text-align:left;transition:all .15s}',
    '.rvw-tpl:hover{background:var(--primary-light);border-color:var(--primary)}',
    '.rvw-tpl-emoji{font-size:16px;flex-shrink:0}',
    '.rvw-label{font:var(--fw-bold) 10.5px/1 var(--font);color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-top:8px}',
    '.rvw-input{width:100%;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) 12.5px/1.5 var(--font);color:var(--text-primary);outline:none;resize:vertical;box-sizing:border-box;min-height:84px}',
    '.rvw-input:focus{border-color:var(--primary)}',
    '.rvw-note{display:flex;align-items:flex-start;gap:5px;font:var(--fw-regular) 10.5px/1.4 var(--font);color:var(--text-muted)}',
    '.rvw-actions{display:flex;gap:8px;margin-top:6px}',
    '.rvw-btn{flex:1;padding:12px;border:none;border-radius:var(--r-md);font:var(--fw-bold) 12.5px/1 var(--font);cursor:pointer}',
    '.rvw-btn:active{transform:scale(.97)}',
    '.rvw-btn--ghost{background:var(--bg-btn);color:var(--text-primary)}',
    '.rvw-btn--primary{background:var(--primary);color:#fff}'
  ].join('\n');
  document.head.appendChild(s);
}

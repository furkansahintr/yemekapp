/* ═══════════════════════════════════════════════════════════
   SOCIAL FINANCE — Grup İşlemleri & Hesap Bölme
   Grup siparişi · canlı sepet · hesap bölme · hibrit ödeme
   ═══════════════════════════════════════════════════════════ */

var _sfn = {
  tab: 'group',              // 'group' | 'split' | 'history'
  // Split state
  splitMethod: 'equal',      // 'equal' | 'item' | 'amount'
  splitSelectedItems: {},    // { 'bi_01': true }
  splitManual: '',
  // Hybrid payment
  useToken: true,
  tokenAmount: 0,
  cardId: null
};

function openSocialFinance() {
  _sfnInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.sfn-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open sfn-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'sfnOverlay';
  phone.appendChild(overlay);

  // Default kart bilgileri
  _sfn.cardId = USER_WALLET.cards.find(function(c){ return c.primary; }).id;
  _sfnRender();
}

function _sfnClose() {
  var o = document.getElementById('sfnOverlay');
  if (o) o.remove();
  _sfnCloseModal();
}

/* ── Helpers ── */
function _sfnEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _sfnFmtTL(n) {
  return '₺' + Math.round(n).toLocaleString('tr-TR');
}

function _sfnFriend(id) {
  for (var i = 0; i < USER_FRIENDS.length; i++) {
    if (USER_FRIENDS[i].id === id) return USER_FRIENDS[i];
  }
  return { id:id, name:'?', avatar:'https://i.pravatar.cc/80?img=1' };
}

function _sfnGroupTotal(g) {
  return g.items.reduce(function(s, it){ return s + it.price * it.qty; }, 0);
}

function _sfnBillTotal(b) {
  return b.items.reduce(function(s, it){ return s + it.price * it.qty; }, 0);
}

function _sfnRelative(iso) {
  var d = new Date(iso);
  var now = new Date();
  var diff = (now - d) / 86400000;
  if (diff < 1) return 'Bugün';
  if (diff < 2) return 'Dün';
  if (diff < 7) return Math.floor(diff) + ' gün önce';
  if (diff < 30) return Math.floor(diff/7) + ' hafta önce';
  return Math.floor(diff/30) + ' ay önce';
}

/* ── Main Render ── */
function _sfnRender() {
  var o = document.getElementById('sfnOverlay');
  if (!o) return;

  var h = '<div class="sfn-header">'
    + '<div class="sfn-back" onclick="_sfnClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="sfn-title"><iconify-icon icon="solar:users-group-two-rounded-bold" style="font-size:17px;color:#8B5CF6"></iconify-icon>Grup İşlemleri & Hesap Bölme</div>'
    + '<div class="sfn-sub">Arkadaşlarınla ortak sepet & hesap bölüşümü</div>'
    + '</div>'
    + '</div>';

  // Tabs
  h += '<div class="sfn-tabs">'
    + '<button class="sfn-tab' + (_sfn.tab==='group'?' active':'') + '" onclick="_sfn.tab=\'group\';_sfnRenderBody()">'
    + '<iconify-icon icon="solar:basket-bold" style="font-size:14px"></iconify-icon>Grup Siparişi</button>'
    + '<button class="sfn-tab' + (_sfn.tab==='split'?' active':'') + '" onclick="_sfn.tab=\'split\';_sfnRenderBody()">'
    + '<iconify-icon icon="solar:scissors-linear" style="font-size:14px"></iconify-icon>Hesap Böl</button>'
    + '<button class="sfn-tab' + (_sfn.tab==='history'?' active':'') + '" onclick="_sfn.tab=\'history\';_sfnRenderBody()">'
    + '<iconify-icon icon="solar:history-bold" style="font-size:14px"></iconify-icon>Geçmiş</button>'
    + '</div>';

  h += '<div id="sfnBody" style="flex:1"></div>';
  o.innerHTML = h;
  _sfnRenderBody();
}

function _sfnRenderBody() {
  var body = document.getElementById('sfnBody');
  if (!body) return;
  // Update active tab highlight
  var o = document.getElementById('sfnOverlay');
  if (o) {
    var tabs = o.querySelectorAll('.sfn-tab');
    tabs.forEach(function(t, i) {
      var names = ['group','split','history'];
      t.classList.toggle('active', _sfn.tab === names[i]);
    });
  }

  if (_sfn.tab === 'group') body.innerHTML = _sfnRenderGroup();
  else if (_sfn.tab === 'split') body.innerHTML = _sfnRenderSplit();
  else body.innerHTML = _sfnRenderHistory();
}

/* ═══ Grup Siparişi ═══ */
function _sfnRenderGroup() {
  var g = ACTIVE_GROUP_ORDER;
  var total = _sfnGroupTotal(g);

  var h = '<div class="sfn-wrap">';

  // Hero — aktif grup bilgisi
  h += '<div class="sfn-group-hero">'
    + '<div class="sfn-hero-shine"></div>'
    + '<div class="sfn-hero-top">'
    + '<div class="sfn-hero-venue"><iconify-icon icon="solar:shop-bold" style="font-size:14px"></iconify-icon>' + _sfnEsc(g.venue) + ' · ' + _sfnEsc(g.venueDistrict) + '</div>'
    + '<div class="sfn-hero-live"><span class="sfn-dot"></span>CANLI</div>'
    + '</div>'
    + '<div class="sfn-hero-name">' + _sfnEsc(g.name) + '</div>'
    + '<div class="sfn-hero-code">'
    + '<span class="sfn-code-lbl">Grup Kodu</span>'
    + '<span class="sfn-code-val">' + _sfnEsc(g.code) + '</span>'
    + '<button class="sfn-code-copy" onclick="_sfnCopyCode(\'' + g.code + '\')"><iconify-icon icon="solar:copy-bold" style="font-size:13px"></iconify-icon></button>'
    + '</div>'
    + '<div class="sfn-hero-members">';

  // Member avatars
  for (var i = 0; i < g.members.length; i++) {
    var m = _sfnFriend(g.members[i]);
    h += '<div class="sfn-avatar-wrap" style="z-index:' + (10-i) + ';margin-left:' + (i === 0 ? '0' : '-8px') + '">'
      + '<img class="sfn-avatar" src="' + m.avatar + '" alt="">'
      + (m.isMe ? '<div class="sfn-avatar-me">Sen</div>' : '')
      + '</div>';
  }
  h += '<div class="sfn-member-count">+' + g.members.length + ' kişi</div>';
  h += '</div></div>';

  // Paylaş butonları
  h += '<div class="sfn-share-row">'
    + '<button class="sfn-share-btn" onclick="_sfnShareWA(\'' + g.code + '\')" style="background:#25D366">'
    + '<iconify-icon icon="solar:phone-bold" style="font-size:15px;color:#fff"></iconify-icon>'
    + '<span style="color:#fff">WhatsApp</span></button>'
    + '<button class="sfn-share-btn sfn-share-btn--ghost" onclick="_sfnCopyLink(\'' + g.code + '\')">'
    + '<iconify-icon icon="solar:link-bold" style="font-size:15px"></iconify-icon>Linki Kopyala</button>'
    + '</div>';

  // Ödeme ayrımı toggle
  h += '<div class="sfn-section-lbl"><iconify-icon icon="solar:card-bold" style="font-size:13px"></iconify-icon>Ödeme Ayrımı</div>'
    + '<div class="sfn-pay-toggle">'
    + '<div class="sfn-pay-opt' + (g.paymentMode==='split'?' active':'') + '" onclick="_sfnSetPayMode(\'split\')">'
    + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="sfn-pay-lbl">Herkes Kendini</div><div class="sfn-pay-sub">Her üye ekledi₤i ürünü öder</div></div>'
    + '</div>'
    + '<div class="sfn-pay-opt' + (g.paymentMode==='leader'?' active':'') + '" onclick="_sfnSetPayMode(\'leader\')">'
    + '<iconify-icon icon="solar:crown-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="sfn-pay-lbl">Lider Öder</div><div class="sfn-pay-sub">Tek ödeme, herkes yer</div></div>'
    + '</div>'
    + '</div>';

  // Canlı sepet
  h += '<div class="sfn-section-lbl"><iconify-icon icon="solar:basket-bold" style="font-size:13px"></iconify-icon>Canlı Sepet <span class="sfn-lbl-badge">' + g.items.length + ' ürün</span></div>'
    + '<div class="sfn-cart">';

  for (var j = 0; j < g.items.length; j++) {
    var it = g.items[j];
    var adder = _sfnFriend(it.addedBy);
    h += '<div class="sfn-cart-item">'
      + '<img class="sfn-cart-avatar" src="' + adder.avatar + '" alt="">'
      + '<div class="sfn-cart-main">'
      + '<div class="sfn-cart-name">' + _sfnEsc(it.name) + '<span class="sfn-cart-qty">x' + it.qty + '</span></div>'
      + '<div class="sfn-cart-meta">'
      + '<b>' + _sfnEsc(adder.name) + '</b> ekledi · ' + _sfnEsc(it.addedAt)
      + '</div>'
      + '</div>'
      + '<div class="sfn-cart-price">' + _sfnFmtTL(it.price * it.qty) + '</div>'
      + '</div>';
  }
  h += '</div>';

  // Toplam ve aksiyon
  h += '<div class="sfn-total-box">'
    + '<div><span class="sfn-total-lbl">TOPLAM</span><span class="sfn-total-val">' + _sfnFmtTL(total) + '</span></div>'
    + '<button class="sfn-btn-primary" onclick="_sfnOpenPayment(\'group\')">'
    + '<iconify-icon icon="solar:card-bold" style="font-size:15px"></iconify-icon>Ödeme Yap</button>'
    + '</div>';

  h += '<div class="sfn-tip">'
    + '<iconify-icon icon="solar:lightbulb-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<span><b>İpucu:</b> Gruptaki herkes kendi telefonundan ürün ekleyebilir. Kod ile giriş yapan üyeler canlı olarak sepete yansır.</span>'
    + '</div>';

  h += '</div>';
  return h;
}

function _sfnCopyCode(code) {
  if (navigator.clipboard) navigator.clipboard.writeText(code);
  if (typeof _admToast === 'function') _admToast('Grup kodu kopyalandı: ' + code, 'ok');
}

function _sfnCopyLink(code) {
  var link = 'yemekapp.com/grup/' + code;
  if (navigator.clipboard) navigator.clipboard.writeText(link);
  if (typeof _admToast === 'function') _admToast('Link kopyalandı', 'ok');
}

function _sfnShareWA(code) {
  var msg = 'Grup siparişine katıl! Kod: ' + code;
  if (typeof _admToast === 'function') _admToast('WhatsApp davet gönderildi', 'ok');
}

function _sfnSetPayMode(mode) {
  ACTIVE_GROUP_ORDER.paymentMode = mode;
  _sfnRenderBody();
  if (typeof _admToast === 'function') {
    _admToast(mode === 'leader' ? 'Lider tek ödeme modu aktif' : 'Herkes kendi modu aktif', 'ok');
  }
}

/* ═══ Hesap Bölme ═══ */
function _sfnRenderSplit() {
  var b = ACTIVE_TABLE_BILL;
  var total = _sfnBillTotal(b);
  var remaining = total - b.paid;
  var paidPct = total > 0 ? Math.round((b.paid / total) * 100) : 0;

  var h = '<div class="sfn-wrap">';

  // Masa bilgisi + progress
  h += '<div class="sfn-bill-hero">'
    + '<div class="sfn-bill-top">'
    + '<div class="sfn-bill-table"><iconify-icon icon="solar:chair-2-bold" style="font-size:14px"></iconify-icon>Masa ' + b.tableNo + '</div>'
    + '<div class="sfn-bill-venue">' + _sfnEsc(b.venue) + ' · ' + _sfnEsc(b.district) + '</div>'
    + '</div>'
    + '<div class="sfn-bill-amount">'
    + '<div class="sfn-bill-total">' + _sfnFmtTL(total) + '</div>'
    + '<div class="sfn-bill-total-lbl">Masa Toplamı</div>'
    + '</div>'
    + '<div class="sfn-progress-wrap">'
    + '<div class="sfn-progress-bar"><div class="sfn-progress-fill" style="width:' + paidPct + '%"></div></div>'
    + '<div class="sfn-progress-meta">'
    + '<span><b style="color:#22C55E">' + _sfnFmtTL(b.paid) + '</b> ödendi</span>'
    + '<span><b style="color:#F59E0B">' + _sfnFmtTL(remaining) + '</b> kaldı</span>'
    + '</div>'
    + '</div>'
    + '</div>';

  // Method seçici
  h += '<div class="sfn-section-lbl"><iconify-icon icon="solar:scissors-linear" style="font-size:13px"></iconify-icon>Bölüştürme Yöntemi</div>'
    + '<div class="sfn-method-grid">'
    + '<div class="sfn-method' + (_sfn.splitMethod==='equal'?' active':'') + '" onclick="_sfn.splitMethod=\'equal\';_sfnRenderBody()">'
    + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:20px"></iconify-icon>'
    + '<div class="sfn-method-lbl">Eşit Böl</div>'
    + '<div class="sfn-method-sub">Kişi sayısına</div>'
    + '</div>'
    + '<div class="sfn-method' + (_sfn.splitMethod==='item'?' active':'') + '" onclick="_sfn.splitMethod=\'item\';_sfnRenderBody()">'
    + '<iconify-icon icon="solar:checklist-minimalistic-bold" style="font-size:20px"></iconify-icon>'
    + '<div class="sfn-method-lbl">Ürüne Göre</div>'
    + '<div class="sfn-method-sub">Seçerek</div>'
    + '</div>'
    + '<div class="sfn-method' + (_sfn.splitMethod==='amount'?' active':'') + '" onclick="_sfn.splitMethod=\'amount\';_sfnRenderBody()">'
    + '<iconify-icon icon="solar:wallet-money-bold" style="font-size:20px"></iconify-icon>'
    + '<div class="sfn-method-lbl">Miktara Göre</div>'
    + '<div class="sfn-method-sub">Manuel</div>'
    + '</div>'
    + '</div>';

  // Method detay
  var myShare = 0;
  if (_sfn.splitMethod === 'equal') {
    myShare = Math.round(remaining / b.people.length);
    h += '<div class="sfn-method-detail">'
      + '<div class="sfn-detail-row">'
      + '<span>Masadaki kişi</span><b>' + b.people.length + '</b>'
      + '</div>'
      + '<div class="sfn-detail-row">'
      + '<span>Kalan tutar</span><b>' + _sfnFmtTL(remaining) + '</b>'
      + '</div>'
      + '<div class="sfn-detail-row sfn-detail-row--hl">'
      + '<span>Senin payın</span><b>' + _sfnFmtTL(myShare) + '</b>'
      + '</div>'
      + '</div>';
  } else if (_sfn.splitMethod === 'item') {
    h += '<div class="sfn-item-list">';
    for (var i = 0; i < b.items.length; i++) {
      var it = b.items[i];
      var selected = !!_sfn.splitSelectedItems[it.id];
      if (selected) myShare += it.price * it.qty;
      var consumers = it.consumers.map(function(cid){ return _sfnFriend(cid); });
      h += '<div class="sfn-split-item' + (selected?' selected':'') + '" onclick="_sfnToggleSplitItem(\'' + it.id + '\')">'
        + '<div class="sfn-split-check">' + (selected ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:#8B5CF6"></iconify-icon>' : '<iconify-icon icon="solar:stop-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>') + '</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div class="sfn-split-name">' + _sfnEsc(it.name) + (it.qty>1?' <span class="sfn-cart-qty">x'+it.qty+'</span>':'') + '</div>'
        + '<div class="sfn-split-consumers">';
      for (var ci = 0; ci < consumers.length; ci++) {
        h += '<img class="sfn-consumer-avatar" src="' + consumers[ci].avatar + '" title="' + _sfnEsc(consumers[ci].name) + '">';
      }
      h += '<span class="sfn-consumer-lbl">' + consumers.length + ' kişi yedi</span>';
      h += '</div></div>'
        + '<div class="sfn-split-price">' + _sfnFmtTL(it.price * it.qty) + '</div>'
        + '</div>';
    }
    h += '</div>';
    h += '<div class="sfn-method-detail">'
      + '<div class="sfn-detail-row sfn-detail-row--hl">'
      + '<span>Seçtiğin toplam</span><b>' + _sfnFmtTL(myShare) + '</b>'
      + '</div>'
      + '</div>';
  } else {
    // amount
    h += '<div class="sfn-amount-input-wrap">'
      + '<div class="sfn-amount-lbl">Ödemek istediğin tutar</div>'
      + '<div class="sfn-amount-input">'
      + '<span class="sfn-amount-tl">₺</span>'
      + '<input type="number" placeholder="0" value="' + _sfnEsc(_sfn.splitManual) + '" '
      + 'oninput="_sfn.splitManual=this.value;_sfnRefreshAmount()" id="sfnAmountInput">'
      + '</div>'
      + '<div class="sfn-amount-quick">'
      + '<button onclick="_sfnQuickAmount(' + Math.round(remaining/4) + ')">₺' + Math.round(remaining/4) + '</button>'
      + '<button onclick="_sfnQuickAmount(' + Math.round(remaining/2) + ')">₺' + Math.round(remaining/2) + '</button>'
      + '<button onclick="_sfnQuickAmount(' + remaining + ')">Tümü · ₺' + remaining + '</button>'
      + '</div>'
      + '</div>';
    myShare = Math.min(remaining, parseInt(_sfn.splitManual, 10) || 0);
  }

  // Ödeme butonu
  h += '<div class="sfn-total-box">'
    + '<div><span class="sfn-total-lbl">ÖDEMEN</span><span class="sfn-total-val">' + _sfnFmtTL(myShare) + '</span></div>'
    + '<button class="sfn-btn-primary' + (myShare <= 0?' disabled':'') + '"' + (myShare > 0 ? ' onclick="_sfnOpenPayment(\'split\',' + myShare + ')"' : '') + '>'
    + '<iconify-icon icon="solar:card-bold" style="font-size:15px"></iconify-icon>Öde</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _sfnToggleSplitItem(id) {
  _sfn.splitSelectedItems[id] = !_sfn.splitSelectedItems[id];
  _sfnRenderBody();
}

function _sfnQuickAmount(amt) {
  _sfn.splitManual = String(amt);
  _sfnRenderBody();
}

function _sfnRefreshAmount() {
  // Anlık hesaplama — re-render yerine sadece total
  var b = ACTIVE_TABLE_BILL;
  var remaining = _sfnBillTotal(b) - b.paid;
  var myShare = Math.min(remaining, parseInt(_sfn.splitManual, 10) || 0);
  var totalBox = document.querySelector('.sfn-total-val');
  if (totalBox) totalBox.textContent = _sfnFmtTL(myShare);
  var btn = document.querySelector('.sfn-btn-primary');
  if (btn) {
    btn.classList.toggle('disabled', myShare <= 0);
    btn.onclick = myShare > 0 ? function(){ _sfnOpenPayment('split', myShare); } : null;
  }
}

/* ═══ Geçmiş ═══ */
function _sfnRenderHistory() {
  var h = '<div class="sfn-wrap">';

  h += '<div class="sfn-hist-head">'
    + '<iconify-icon icon="solar:history-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>'
    + '<span>Önceki gruplarını tek tıkla yeniden aktif et</span>'
    + '</div>';

  // Sık kullanılanlar
  var freq = PAST_GROUP_ORDERS.filter(function(g){ return g.frequent; });
  if (freq.length > 0) {
    h += '<div class="sfn-section-lbl"><iconify-icon icon="solar:star-bold" style="font-size:13px;color:#F59E0B"></iconify-icon>Sık Kullanılanlar</div>'
      + '<div class="sfn-hist-grid">';
    for (var i = 0; i < freq.length; i++) h += _sfnHistCard(freq[i], true);
    h += '</div>';
  }

  // Diğer
  var others = PAST_GROUP_ORDERS.filter(function(g){ return !g.frequent; });
  if (others.length > 0) {
    h += '<div class="sfn-section-lbl" style="margin-top:14px"><iconify-icon icon="solar:archive-bold" style="font-size:13px"></iconify-icon>Tüm Geçmiş</div>'
      + '<div class="sfn-hist-list">';
    for (var j = 0; j < others.length; j++) h += _sfnHistCard(others[j], false);
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _sfnHistCard(g, featured) {
  if (featured) {
    return '<div class="sfn-hist-card" onclick="_sfnReactivate(\'' + g.id + '\')">'
      + '<div class="sfn-hist-ico"><iconify-icon icon="solar:users-group-two-rounded-bold" style="font-size:18px;color:#8B5CF6"></iconify-icon></div>'
      + '<div class="sfn-hist-name">' + _sfnEsc(g.name) + '</div>'
      + '<div class="sfn-hist-venue">' + _sfnEsc(g.venue) + '</div>'
      + '<div class="sfn-hist-meta">' + g.memberCount + ' kişi · ' + _sfnFmtTL(g.total) + '</div>'
      + '<div class="sfn-hist-when">' + _sfnRelative(g.lastUsed) + '</div>'
      + '<button class="sfn-hist-reuse" onclick="event.stopPropagation();_sfnReactivate(\'' + g.id + '\')">'
      + '<iconify-icon icon="solar:restart-bold" style="font-size:13px"></iconify-icon>Yeniden Aç</button>'
      + '</div>';
  } else {
    return '<div class="sfn-hist-row" onclick="_sfnReactivate(\'' + g.id + '\')">'
      + '<div class="sfn-hist-ico sfn-hist-ico--sm"><iconify-icon icon="solar:users-group-rounded-linear" style="font-size:16px;color:var(--text-muted)"></iconify-icon></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div class="sfn-hist-name-sm">' + _sfnEsc(g.name) + ' · <span style="color:var(--text-muted);font-weight:500">' + _sfnEsc(g.venue) + '</span></div>'
      + '<div class="sfn-hist-meta-sm">' + g.memberCount + ' kişi · ' + _sfnFmtTL(g.total) + ' · ' + _sfnRelative(g.lastUsed) + '</div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
      + '</div>';
  }
}

function _sfnReactivate(id) {
  var g = PAST_GROUP_ORDERS.find(function(x){ return x.id === id; });
  if (!g) return;
  if (typeof _admToast === 'function') _admToast('"' + g.name + '" yeniden aktif edildi', 'ok');
  _sfn.tab = 'group';
  _sfnRenderBody();
}

/* ═══ Hibrit Ödeme Modal ═══ */
function _sfnOpenPayment(mode, amount) {
  _sfnCloseModal();
  var total = 0;
  if (mode === 'group') total = _sfnGroupTotal(ACTIVE_GROUP_ORDER);
  else if (mode === 'split') total = amount || 0;

  var tokenMax = Math.min(USER_WALLET.tokens, total);
  _sfn.tokenAmount = _sfn.useToken ? tokenMax : 0;

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'sfnPayModal';
  m.className = 'sfn-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _sfnCloseModal(); };
  m.innerHTML = '<div class="sfn-modal"><div id="sfnPayBody" data-total="' + total + '" data-mode="' + mode + '"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _sfnRenderPayment(total, mode);
}

function _sfnCloseModal() {
  var m = document.getElementById('sfnPayModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

function _sfnRenderPayment(total, mode) {
  var body = document.getElementById('sfnPayBody');
  if (!body) return;

  var tokenMax = Math.min(USER_WALLET.tokens, total);
  var tokenUse = _sfn.useToken ? Math.min(_sfn.tokenAmount || tokenMax, tokenMax) : 0;
  var cardUse = total - tokenUse;
  var card = USER_WALLET.cards.find(function(c){ return c.id === _sfn.cardId; }) || USER_WALLET.cards[0];

  var h = '<div class="sfn-pay-head">'
    + '<div class="sfn-pay-close" onclick="_sfnCloseModal()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div style="flex:1"><div class="sfn-pay-title">Hibrit Ödeme</div>'
    + '<div class="sfn-pay-subt">Token + Kart birlikte kullan</div></div>'
    + '</div>';

  h += '<div class="sfn-pay-body">';
  h += '<div class="sfn-pay-total-card">'
    + '<div class="sfn-pay-total-lbl">Toplam Tutar</div>'
    + '<div class="sfn-pay-total-val">' + _sfnFmtTL(total) + '</div>'
    + '</div>';

  // Token bloğu
  h += '<div class="sfn-pay-row">'
    + '<div class="sfn-pay-row-head">'
    + '<div class="sfn-pay-row-ico" style="background:#F59E0B18;color:#F59E0B"><iconify-icon icon="solar:wallet-money-bold" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1"><div class="sfn-pay-row-lbl">Token Bakiyen</div>'
    + '<div class="sfn-pay-row-sub">' + USER_WALLET.tokens + ' token mevcut</div></div>'
    + '<label class="sfn-switch">'
    + '<input type="checkbox"' + (_sfn.useToken?' checked':'') + ' onchange="_sfn.useToken=this.checked;_sfn.tokenAmount=this.checked?' + tokenMax + ':0;_sfnRenderPayment(' + total + ',\'' + mode + '\')">'
    + '<span class="sfn-slider"></span></label>'
    + '</div>';

  if (_sfn.useToken && tokenMax > 0) {
    h += '<div class="sfn-pay-slider">'
      + '<input type="range" min="0" max="' + tokenMax + '" value="' + tokenUse + '" '
      + 'oninput="_sfn.tokenAmount=parseInt(this.value);_sfnUpdatePaySplit(' + total + ',\'' + mode + '\')">'
      + '<div class="sfn-pay-slider-val"><span>Kullanılan: <b id="sfnTokenUse">' + tokenUse + '</b> token</span></div>'
      + '</div>';
  }
  h += '</div>';

  // Kart
  h += '<div class="sfn-pay-row">'
    + '<div class="sfn-pay-row-head">'
    + '<div class="sfn-pay-row-ico" style="background:#3B82F618;color:#3B82F6"><iconify-icon icon="solar:card-bold" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1"><div class="sfn-pay-row-lbl">Kredi Kartı</div>'
    + '<div class="sfn-pay-row-sub">' + _sfnEsc(card.brand) + ' •••• ' + _sfnEsc(card.last4) + '</div></div>'
    + '<span class="sfn-pay-card-use" id="sfnCardUse">' + _sfnFmtTL(cardUse) + '</span>'
    + '</div>';
  h += '</div>';

  // Özet
  h += '<div class="sfn-pay-summary" id="sfnPaySummary">'
    + '<div class="sfn-pay-sum-row"><span>Token</span><b>-' + tokenUse + ' 🪙 (' + _sfnFmtTL(tokenUse) + ')</b></div>'
    + '<div class="sfn-pay-sum-row"><span>Karttan</span><b>' + _sfnFmtTL(cardUse) + '</b></div>'
    + '<div class="sfn-pay-sum-row sfn-pay-sum-row--hl"><span>Toplam</span><b>' + _sfnFmtTL(total) + '</b></div>'
    + '</div>';

  h += '<button class="sfn-btn-primary sfn-btn-wide" onclick="_sfnSubmitPayment(' + total + ',\'' + mode + '\')">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:16px"></iconify-icon>Ödemeyi Tamamla</button>';
  h += '</div>';

  body.innerHTML = h;
}

function _sfnUpdatePaySplit(total, mode) {
  var tokenUse = _sfn.tokenAmount;
  var cardUse = total - tokenUse;
  var tEl = document.getElementById('sfnTokenUse');
  var cEl = document.getElementById('sfnCardUse');
  if (tEl) tEl.textContent = tokenUse;
  if (cEl) cEl.textContent = _sfnFmtTL(cardUse);
  var sum = document.getElementById('sfnPaySummary');
  if (sum) {
    sum.innerHTML = '<div class="sfn-pay-sum-row"><span>Token</span><b>-' + tokenUse + ' 🪙 (' + _sfnFmtTL(tokenUse) + ')</b></div>'
      + '<div class="sfn-pay-sum-row"><span>Karttan</span><b>' + _sfnFmtTL(cardUse) + '</b></div>'
      + '<div class="sfn-pay-sum-row sfn-pay-sum-row--hl"><span>Toplam</span><b>' + _sfnFmtTL(total) + '</b></div>';
  }
}

function _sfnSubmitPayment(total, mode) {
  var tokenUse = _sfn.useToken ? (_sfn.tokenAmount || 0) : 0;
  var cardUse = total - tokenUse;

  USER_WALLET.tokens = Math.max(0, USER_WALLET.tokens - tokenUse);

  if (mode === 'split') {
    ACTIVE_TABLE_BILL.paid = Math.min(_sfnBillTotal(ACTIVE_TABLE_BILL), ACTIVE_TABLE_BILL.paid + total);
  }

  _sfnCloseModal();

  // Başarı modal
  var b = ACTIVE_TABLE_BILL;
  var remaining = _sfnBillTotal(b) - b.paid;
  var tableClosed = mode === 'split' && remaining <= 0;

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'sfnSuccessModal';
  m.className = 'sfn-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) { m.remove(); _sfnRenderBody(); } };
  m.innerHTML = '<div class="sfn-modal sfn-modal--compact">'
    + '<div class="sfn-success">'
    + '<div class="sfn-success-ico"><iconify-icon icon="solar:check-circle-bold" style="font-size:52px;color:#22C55E"></iconify-icon></div>'
    + '<div class="sfn-success-title">Ödeme Başarılı</div>'
    + '<div class="sfn-success-sub">' + (tableClosed ? 'Hesap kapandı 🎉' : mode === 'split' ? 'Masadaki diğer kişilerin ödemesi bekleniyor' : 'Grup siparişi ödendi') + '</div>'
    + '<div class="sfn-success-box">'
    + '<div class="sfn-pay-sum-row"><span>Token</span><b>-' + tokenUse + ' 🪙</b></div>'
    + '<div class="sfn-pay-sum-row"><span>Karttan</span><b>' + _sfnFmtTL(cardUse) + '</b></div>'
    + '<div class="sfn-pay-sum-row sfn-pay-sum-row--hl"><span>Toplam</span><b>' + _sfnFmtTL(total) + '</b></div>'
    + '</div>'
    + (mode === 'split' && !tableClosed ? '<div class="sfn-remain-bar"><div class="sfn-progress-bar"><div class="sfn-progress-fill" style="width:' + Math.round((b.paid/_sfnBillTotal(b))*100) + '%"></div></div><div class="sfn-remain-txt">Masa: <b style="color:#22C55E">' + _sfnFmtTL(b.paid) + '</b> / ' + _sfnFmtTL(_sfnBillTotal(b)) + '</div></div>' : '')
    + '<button class="sfn-btn-primary sfn-btn-wide" onclick="document.getElementById(\'sfnSuccessModal\').remove();_sfnRenderBody()">Tamam</button>'
    + '</div>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

/* ═══ Styles ═══ */
function _sfnInjectStyles() {
  if (document.getElementById('sfnStyles')) return;
  var s = document.createElement('style');
  s.id = 'sfnStyles';
  s.textContent = [
    '.sfn-overlay{color:var(--text-primary)}',
    '.sfn-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);z-index:5}',
    '.sfn-back{width:34px;height:34px;border-radius:10px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);transition:transform .15s}',
    '.sfn-back:active{transform:scale(.94)}',
    '.sfn-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.sfn-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '/* Tabs */',
    '.sfn-tabs{display:flex;gap:8px;padding:8px 14px 0;background:var(--bg-phone)}',
    '.sfn-tab{flex:1;padding:9px 6px;border:none;background:var(--bg-phone-secondary);color:var(--text-muted);border-radius:10px 10px 0 0;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;transition:all .18s}',
    '.sfn-tab.active{background:linear-gradient(180deg,#8B5CF615,var(--bg-phone));color:#8B5CF6;font-weight:700}',
    '.sfn-wrap{padding:12px 14px 28px;display:flex;flex-direction:column;gap:12px}',
    '.sfn-section-lbl{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--text-primary);padding-left:2px;margin-top:6px}',
    '.sfn-lbl-badge{margin-left:auto;font-size:10px;font-weight:600;color:var(--text-muted);background:var(--bg-phone-secondary);padding:2px 7px;border-radius:6px}',
    '/* Group Hero */',
    '.sfn-group-hero{position:relative;border-radius:18px;padding:16px;background:linear-gradient(135deg,#1E3A8A 0%,#8B5CF6 55%,#F97316 100%);color:#fff;overflow:hidden;box-shadow:0 6px 20px rgba(139,92,246,.25)}',
    '.sfn-hero-shine{position:absolute;top:-40%;right:-10%;width:60%;height:180%;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);transform:rotate(22deg);pointer-events:none;animation:sfnShine 5s ease-in-out infinite}',
    '@keyframes sfnShine{0%,100%{opacity:.15}50%{opacity:.5}}',
    '.sfn-hero-top{display:flex;align-items:center;gap:10px;position:relative;z-index:1;margin-bottom:6px}',
    '.sfn-hero-venue{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.22);padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600;backdrop-filter:blur(4px)}',
    '.sfn-hero-live{margin-left:auto;display:inline-flex;align-items:center;gap:5px;background:#EF4444;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.6px}',
    '.sfn-dot{width:6px;height:6px;border-radius:50%;background:#fff;animation:sfnPulse 1.4s ease-in-out infinite}',
    '@keyframes sfnPulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '.sfn-hero-name{font-size:20px;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.22);position:relative;z-index:1;margin-bottom:10px}',
    '.sfn-hero-code{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(0,0,0,.25);border-radius:10px;margin-bottom:12px;position:relative;z-index:1}',
    '.sfn-code-lbl{font-size:10px;font-weight:700;opacity:.85;letter-spacing:.5px}',
    '.sfn-code-val{font-size:14px;font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:1px}',
    '.sfn-code-copy{width:24px;height:24px;border:none;background:rgba(255,255,255,.2);color:#fff;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.sfn-code-copy:active{transform:scale(.9)}',
    '.sfn-hero-members{display:flex;align-items:center;position:relative;z-index:1}',
    '.sfn-avatar-wrap{position:relative}',
    '.sfn-avatar{width:32px;height:32px;border-radius:50%;border:2px solid #fff;object-fit:cover}',
    '.sfn-avatar-me{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);background:#22C55E;color:#fff;font-size:8px;font-weight:800;padding:1px 4px;border-radius:4px;white-space:nowrap}',
    '.sfn-member-count{margin-left:10px;font-size:11.5px;font-weight:700;background:rgba(0,0,0,.22);padding:4px 10px;border-radius:999px}',
    '/* Share */',
    '.sfn-share-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.sfn-share-btn{padding:10px 12px;border:none;border-radius:12px;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s}',
    '.sfn-share-btn:active{transform:scale(.96)}',
    '.sfn-share-btn--ghost{background:var(--bg-phone-secondary);color:var(--text-primary);border:1px solid var(--border-soft)}',
    '/* Payment mode toggle */',
    '.sfn-pay-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.sfn-pay-opt{padding:11px 12px;border:1.5px solid var(--border-soft);background:var(--bg-phone);border-radius:12px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .18s}',
    '.sfn-pay-opt:active{transform:scale(.97)}',
    '.sfn-pay-opt.active{border-color:#8B5CF6;background:#8B5CF610;color:#8B5CF6}',
    '.sfn-pay-opt.active .sfn-pay-sub{color:#8B5CF6cc}',
    '.sfn-pay-lbl{font-size:12px;font-weight:700}',
    '.sfn-pay-sub{font-size:10px;color:var(--text-muted);margin-top:2px;line-height:1.3}',
    '/* Cart */',
    '.sfn-cart{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;overflow:hidden}',
    '.sfn-cart-item{display:flex;align-items:center;gap:10px;padding:11px;border-bottom:1px solid var(--border-soft)}',
    '.sfn-cart-item:last-child{border-bottom:none}',
    '.sfn-cart-avatar{width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid var(--bg-phone-secondary);flex-shrink:0}',
    '.sfn-cart-main{flex:1;min-width:0}',
    '.sfn-cart-name{font-size:12.5px;font-weight:700;color:var(--text-primary);display:inline-flex;align-items:center;gap:6px}',
    '.sfn-cart-qty{font-size:10px;font-weight:700;color:#8B5CF6;background:#8B5CF615;padding:1px 5px;border-radius:5px}',
    '.sfn-cart-meta{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.sfn-cart-meta b{font-weight:700;color:var(--text-primary)}',
    '.sfn-cart-price{font-size:13px;font-weight:800;color:var(--text-primary);font-variant-numeric:tabular-nums}',
    '/* Total box */',
    '.sfn-total-box{display:flex;align-items:center;gap:12px;padding:13px 14px;background:linear-gradient(135deg,#1E3A8A,#312E81);color:#fff;border-radius:14px;box-shadow:0 4px 14px rgba(30,58,138,.3)}',
    '.sfn-total-lbl{font-size:10px;font-weight:700;letter-spacing:.6px;opacity:.85;display:block}',
    '.sfn-total-val{font-size:22px;font-weight:800;display:block;margin-top:1px}',
    '.sfn-total-box > div:first-child{flex:1}',
    '.sfn-btn-primary{padding:11px 16px;border:none;background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(249,115,22,.3);transition:transform .15s}',
    '.sfn-btn-primary:active{transform:scale(.97)}',
    '.sfn-btn-primary.disabled{opacity:.4;cursor:not-allowed;transform:none}',
    '.sfn-btn-wide{width:100%;justify-content:center;padding:12px;margin-top:8px}',
    '/* Tip */',
    '.sfn-tip{display:flex;align-items:flex-start;gap:7px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);padding:10px 12px;border-radius:10px;font-size:11px;color:var(--text-primary);line-height:1.5}',
    '.sfn-tip b{font-weight:700}',
    '/* Bill Hero (Split) */',
    '.sfn-bill-hero{background:linear-gradient(135deg,#065F46 0%,#047857 100%);color:#fff;border-radius:18px;padding:16px;box-shadow:0 6px 20px rgba(6,95,70,.25)}',
    '.sfn-bill-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}',
    '.sfn-bill-table{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.2);padding:4px 10px;border-radius:999px;font-size:11.5px;font-weight:700}',
    '.sfn-bill-venue{font-size:11.5px;opacity:.9}',
    '.sfn-bill-amount{text-align:center;margin-bottom:12px}',
    '.sfn-bill-total{font-size:32px;font-weight:800;line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.2)}',
    '.sfn-bill-total-lbl{font-size:11px;opacity:.88;margin-top:4px;letter-spacing:.3px}',
    '.sfn-progress-wrap{background:rgba(0,0,0,.22);padding:10px 12px;border-radius:10px}',
    '.sfn-progress-bar{height:8px;background:rgba(255,255,255,.18);border-radius:999px;overflow:hidden;margin-bottom:7px}',
    '.sfn-progress-fill{height:100%;background:linear-gradient(90deg,#22C55E,#10B981);border-radius:999px;transition:width .4s ease}',
    '.sfn-progress-meta{display:flex;justify-content:space-between;font-size:11px}',
    '.sfn-progress-meta b{font-weight:800}',
    '/* Split methods */',
    '.sfn-method-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}',
    '.sfn-method{padding:12px 8px;border:1.5px solid var(--border-soft);background:var(--bg-phone);border-radius:12px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--text-muted);transition:all .18s}',
    '.sfn-method:active{transform:scale(.96)}',
    '.sfn-method.active{border-color:#8B5CF6;background:#8B5CF610;color:#8B5CF6}',
    '.sfn-method-lbl{font-size:11.5px;font-weight:700;color:var(--text-primary)}',
    '.sfn-method.active .sfn-method-lbl{color:#8B5CF6}',
    '.sfn-method-sub{font-size:9.5px;color:var(--text-muted)}',
    '.sfn-method-detail{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;padding:11px 13px;display:flex;flex-direction:column;gap:5px}',
    '.sfn-detail-row{display:flex;justify-content:space-between;align-items:center;font-size:12px}',
    '.sfn-detail-row span{color:var(--text-muted);font-weight:600}',
    '.sfn-detail-row b{font-weight:800;color:var(--text-primary);font-variant-numeric:tabular-nums}',
    '.sfn-detail-row--hl{padding-top:8px;margin-top:4px;border-top:1px dashed var(--border-soft)}',
    '.sfn-detail-row--hl b{color:#8B5CF6;font-size:15px}',
    '/* Item split list */',
    '.sfn-item-list{display:flex;flex-direction:column;gap:6px}',
    '.sfn-split-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-phone);border:1.5px solid var(--border-soft);border-radius:12px;cursor:pointer;transition:all .15s}',
    '.sfn-split-item:active{transform:scale(.98)}',
    '.sfn-split-item.selected{border-color:#8B5CF6;background:#8B5CF608}',
    '.sfn-split-check{flex-shrink:0;width:24px;display:flex;align-items:center;justify-content:center}',
    '.sfn-split-name{font-size:12.5px;font-weight:700;color:var(--text-primary)}',
    '.sfn-split-consumers{display:flex;align-items:center;gap:3px;margin-top:4px}',
    '.sfn-consumer-avatar{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--bg-phone);margin-left:-4px;object-fit:cover}',
    '.sfn-consumer-avatar:first-child{margin-left:0}',
    '.sfn-consumer-lbl{font-size:9.5px;color:var(--text-muted);margin-left:6px;font-weight:600}',
    '.sfn-split-price{font-size:13px;font-weight:800;color:var(--text-primary);font-variant-numeric:tabular-nums}',
    '/* Amount input */',
    '.sfn-amount-input-wrap{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;padding:14px 12px;display:flex;flex-direction:column;gap:10px}',
    '.sfn-amount-lbl{font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:.4px}',
    '.sfn-amount-input{display:flex;align-items:center;gap:6px;padding:9px 12px;background:var(--bg-phone-secondary);border-radius:10px;border:2px solid transparent;transition:border-color .18s}',
    '.sfn-amount-input:focus-within{border-color:#8B5CF6}',
    '.sfn-amount-tl{font-size:22px;font-weight:700;color:var(--text-muted)}',
    '.sfn-amount-input input{flex:1;border:none;background:transparent;color:var(--text-primary);font-size:24px;font-weight:800;outline:none;font-variant-numeric:tabular-nums}',
    '.sfn-amount-quick{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}',
    '.sfn-amount-quick::-webkit-scrollbar{display:none}',
    '.sfn-amount-quick button{flex-shrink:0;padding:7px 12px;border:1px solid var(--border-soft);background:var(--bg-phone-secondary);color:var(--text-primary);border-radius:999px;font-size:11.5px;font-weight:600;cursor:pointer}',
    '.sfn-amount-quick button:active{transform:scale(.95)}',
    '/* History */',
    '.sfn-hist-head{display:flex;align-items:center;gap:7px;padding:9px 11px;background:var(--bg-phone-secondary);border-radius:10px;font-size:11.5px;color:var(--text-primary);margin-bottom:4px}',
    '.sfn-hist-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.sfn-hist-card{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:4px;transition:transform .15s,box-shadow .18s;box-shadow:0 1px 4px rgba(0,0,0,.04)}',
    '.sfn-hist-card:active{transform:scale(.98)}',
    '.sfn-hist-ico{width:32px;height:32px;border-radius:10px;background:#8B5CF615;display:flex;align-items:center;justify-content:center;margin-bottom:4px}',
    '.sfn-hist-ico--sm{width:28px;height:28px;border-radius:8px;background:var(--bg-phone-secondary)}',
    '.sfn-hist-name{font-size:13px;font-weight:700;color:var(--text-primary);line-height:1.3}',
    '.sfn-hist-name-sm{font-size:12.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.sfn-hist-venue{font-size:11px;color:var(--text-muted);font-weight:500}',
    '.sfn-hist-meta{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.sfn-hist-meta-sm{font-size:10.5px;color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.sfn-hist-when{font-size:10px;color:var(--text-muted);background:var(--bg-phone-secondary);padding:2px 7px;border-radius:6px;width:fit-content;margin-top:4px}',
    '.sfn-hist-reuse{margin-top:7px;padding:6px 10px;border:none;background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px}',
    '.sfn-hist-reuse:active{transform:scale(.95)}',
    '.sfn-hist-list{display:flex;flex-direction:column;gap:6px}',
    '.sfn-hist-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;cursor:pointer;transition:background .15s}',
    '.sfn-hist-row:active{background:var(--bg-phone-secondary)}',
    '/* Payment modal */',
    '.sfn-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:95;opacity:0;transition:opacity .24s ease}',
    '.sfn-modal-backdrop.open{opacity:1}',
    '.sfn-modal{width:100%;max-width:100%;background:var(--bg-phone);border-radius:20px 20px 0 0;overflow:hidden;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1);max-height:92vh;display:flex;flex-direction:column;overflow-y:auto}',
    '.sfn-modal-backdrop.open .sfn-modal{transform:translateY(0)}',
    '.sfn-modal--compact{max-height:80vh}',
    '.sfn-pay-head{position:sticky;top:0;display:flex;align-items:center;gap:10px;padding:14px 14px 10px;background:var(--bg-phone);z-index:2}',
    '.sfn-pay-close{width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.sfn-pay-title{font-size:15px;font-weight:800;color:var(--text-primary)}',
    '.sfn-pay-subt{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.sfn-pay-body{padding:4px 14px 20px;display:flex;flex-direction:column;gap:10px}',
    '.sfn-pay-total-card{background:linear-gradient(135deg,#1E3A8A,#312E81);color:#fff;padding:18px;border-radius:14px;text-align:center}',
    '.sfn-pay-total-lbl{font-size:11px;opacity:.85;letter-spacing:.4px}',
    '.sfn-pay-total-val{font-size:28px;font-weight:800;margin-top:4px;text-shadow:0 1px 2px rgba(0,0,0,.2)}',
    '.sfn-pay-row{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;padding:12px 13px;display:flex;flex-direction:column;gap:10px}',
    '.sfn-pay-row-head{display:flex;align-items:center;gap:11px}',
    '.sfn-pay-row-ico{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.sfn-pay-row-lbl{font-size:12.5px;font-weight:700;color:var(--text-primary)}',
    '.sfn-pay-row-sub{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.sfn-pay-card-use{font-size:15px;font-weight:800;color:#3B82F6;font-variant-numeric:tabular-nums}',
    '/* Switch */',
    '.sfn-switch{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0}',
    '.sfn-switch input{opacity:0;width:0;height:0}',
    '.sfn-slider{position:absolute;inset:0;background:var(--border-soft);border-radius:999px;transition:background .2s;cursor:pointer}',
    '.sfn-slider:before{content:"";position:absolute;height:16px;width:16px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}',
    '.sfn-switch input:checked + .sfn-slider{background:#F59E0B}',
    '.sfn-switch input:checked + .sfn-slider:before{transform:translateX(18px)}',
    '/* Slider */',
    '.sfn-pay-slider{padding:4px 0 0}',
    '.sfn-pay-slider input[type=range]{width:100%;accent-color:#F59E0B}',
    '.sfn-pay-slider-val{font-size:11px;color:var(--text-muted);margin-top:4px;text-align:right}',
    '.sfn-pay-slider-val b{font-weight:800;color:#F59E0B}',
    '/* Summary */',
    '.sfn-pay-summary{background:var(--bg-phone-secondary);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:5px}',
    '.sfn-pay-sum-row{display:flex;justify-content:space-between;font-size:12px}',
    '.sfn-pay-sum-row span{color:var(--text-muted);font-weight:600}',
    '.sfn-pay-sum-row b{font-weight:700;color:var(--text-primary);font-variant-numeric:tabular-nums}',
    '.sfn-pay-sum-row--hl{padding-top:7px;border-top:1px dashed var(--border-soft);margin-top:3px}',
    '.sfn-pay-sum-row--hl b{color:#8B5CF6;font-size:14px}',
    '/* Success */',
    '.sfn-success{padding:24px 18px;text-align:center}',
    '.sfn-success-ico{margin-bottom:8px;animation:sfnPop .4s ease}',
    '@keyframes sfnPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}',
    '.sfn-success-title{font-size:19px;font-weight:800;color:var(--text-primary);margin-bottom:4px}',
    '.sfn-success-sub{font-size:12.5px;color:var(--text-muted);margin-bottom:18px;line-height:1.4}',
    '.sfn-success-box{background:var(--bg-phone-secondary);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;margin-bottom:14px;text-align:left}',
    '.sfn-remain-bar{margin-bottom:14px}',
    '.sfn-remain-txt{font-size:11px;color:var(--text-muted);margin-top:6px;text-align:center}',
    '.sfn-remain-txt b{font-weight:800}'
  ].join('\n');
  document.head.appendChild(s);
}

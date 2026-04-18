/* ═══════════════════════════════════════════════════════════
   WALLET — Cüzdan (Token)
   Dashboard · Yükle · Share · Geçmiş · Detay
   ═══════════════════════════════════════════════════════════ */

var _wlt = {
  view: 'dashboard',         // 'dashboard'
  detailId: null,
  // Load flow
  loadOpen: false,
  loadAmount: 0,
  loadCardId: null,
  loadStep: 1,               // 1=amount, 2=card, 3=3D, 4=success
  loadNewCard: { num:'', exp:'', cvv:'', name:'', save:true },
  loadUseNew: false,
  // Share flow
  shareOpen: false,
  shareStep: 1,              // 1=friend, 2=amount+note, 3=confirm, 4=success
  shareSearch: '',
  shareTarget: null,
  shareAmount: 0,
  shareNote: '',
  // Info popup
  infoOpen: false
};

function openWalletPage() {
  _wltInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.wlt-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open wlt-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'wltOverlay';
  phone.appendChild(overlay);

  _wlt.loadCardId = (USER_WALLET.cards.find(function(c){ return c.primary; }) || USER_WALLET.cards[0]).id;
  _wltRender();
}

function _wltClose() {
  var o = document.getElementById('wltOverlay');
  if (o) o.remove();
  _wltCloseAll();
}

function _wltCloseAll() {
  ['wltLoadModal','wltShareModal','wltDetailModal','wltInfoModal'].forEach(function(id) {
    var m = document.getElementById(id);
    if (m) m.remove();
  });
  _wlt.loadOpen = false;
  _wlt.shareOpen = false;
  _wlt.detailId = null;
  _wlt.infoOpen = false;
}

/* ── Helpers ── */
function _wltEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _wltFmt(n) { return Math.round(n).toLocaleString('tr-TR'); }
function _wltFmtTL(n) { return '₺' + _wltFmt(n); }

function _wltTx(id) {
  for (var i = 0; i < WALLET_TRANSACTIONS.length; i++) {
    if (WALLET_TRANSACTIONS[i].id === id) return WALLET_TRANSACTIONS[i];
  }
  return null;
}

function _wltFmtDate(iso) {
  var d = new Date(iso);
  var now = new Date();
  var diffMin = (now - d) / 60000;
  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return Math.floor(diffMin) + ' dk önce';
  if (diffMin < 1440) return Math.floor(diffMin/60) + ' saat önce';
  var months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' · ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

function _wltSourceMeta(source) {
  var map = {
    load:        { icon:'solar:wallet-money-bold',        color:'#10B981', label:'Yükleme' },
    share:       { icon:'solar:users-group-rounded-bold', color:'#8B5CF6', label:'Token Share' },
    order:       { icon:'solar:bag-check-bold',           color:'#F97316', label:'Sipariş' },
    reservation: { icon:'solar:calendar-mark-bold',       color:'#3B82F6', label:'Rezervasyon' },
    premium:     { icon:'solar:crown-bold',               color:'#A855F7', label:'Premium' },
    refund:      { icon:'solar:refund-bold',              color:'#22C55E', label:'İade' },
    system:      { icon:'solar:settings-bold',            color:'#6B7280', label:'Sistem' },
    achievement: { icon:'solar:cup-star-bold',            color:'#F59E0B', label:'Başarı' }
  };
  return map[source] || { icon:'solar:dollar-minimalistic-bold', color:'#6B7280', label:source };
}

/* ── Dashboard ── */
function _wltRender() {
  var o = document.getElementById('wltOverlay');
  if (!o) return;

  var h = '<div class="wlt-header">'
    + '<div class="wlt-back" onclick="_wltClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="wlt-title"><iconify-icon icon="solar:wallet-bold" style="font-size:17px;color:#10B981"></iconify-icon>Cüzdan</div>'
    + '<div class="wlt-sub">Token bakiyen ve tüm işlemler</div>'
    + '</div>'
    + '</div>'
    + '<div id="wltBody" style="flex:1"></div>';

  o.innerHTML = h;
  _wltRenderBody();
}

function _wltRenderBody() {
  var body = document.getElementById('wltBody');
  if (!body) return;
  var bal = USER_WALLET.tokens;

  var h = '<div class="wlt-wrap">';

  // Balance card
  h += '<div class="wlt-bal-card">'
    + '<div class="wlt-bal-shine"></div>'
    + '<div class="wlt-bal-top">'
    + '<div class="wlt-bal-lbl">Toplam Bakiye</div>'
    + '<button class="wlt-bal-info" onclick="_wltOpenInfo()" title="Bilgi"><iconify-icon icon="solar:info-circle-bold" style="font-size:15px"></iconify-icon></button>'
    + '</div>'
    + '<div class="wlt-bal-val">'
    + '<span class="wlt-coin">🪙</span>'
    + '<span class="wlt-bal-num">' + _wltFmt(bal) + '</span>'
    + '<span class="wlt-bal-unit">Token</span>'
    + '</div>'
    + '<div class="wlt-bal-tl">≈ ' + _wltFmtTL(bal * WALLET_CONFIG.exchangeRate) + '</div>'
    + '<div class="wlt-bal-bottom">'
    + '<div><div class="wlt-stat-lbl">Bu ay giren</div><div class="wlt-stat-val" style="color:#A7F3D0">+' + _wltFmt(_wltMonthlyIn()) + '</div></div>'
    + '<div><div class="wlt-stat-lbl">Bu ay çıkan</div><div class="wlt-stat-val" style="color:#FCA5A5">-' + _wltFmt(_wltMonthlyOut()) + '</div></div>'
    + '</div>'
    + '</div>';

  // Quick actions
  h += '<div class="wlt-actions">'
    + '<button class="wlt-action wlt-action--primary" onclick="_wltOpenLoad()">'
    + '<iconify-icon icon="solar:download-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="wlt-act-lbl">Token Yükle</div><div class="wlt-act-sub">Kart ile anında</div></div>'
    + '</button>'
    + '<button class="wlt-action wlt-action--secondary" onclick="_wltOpenShare()">'
    + '<iconify-icon icon="solar:users-group-two-rounded-bold" style="font-size:18px"></iconify-icon>'
    + '<div><div class="wlt-act-lbl">Token Gönder</div><div class="wlt-act-sub">Arkadaşına</div></div>'
    + '</button>'
    + '</div>';

  // Daily share limit
  var pct = Math.min(100, Math.round((WALLET_DAILY_SHARED / WALLET_CONFIG.dailyShareLimit) * 100));
  h += '<div class="wlt-limit">'
    + '<div class="wlt-limit-head">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:13px;color:#8B5CF6"></iconify-icon>'
    + '<span>Günlük Gönderim Limiti</span>'
    + '<b class="wlt-limit-val">' + WALLET_DAILY_SHARED + '/' + WALLET_CONFIG.dailyShareLimit + '</b>'
    + '</div>'
    + '<div class="wlt-limit-bar"><div class="wlt-limit-fill" style="width:' + pct + '%"></div></div>'
    + '</div>';

  // Transactions
  h += '<div class="wlt-tx-head">'
    + '<iconify-icon icon="solar:history-bold" style="font-size:14px"></iconify-icon>'
    + '<span>İşlem Geçmişi</span>'
    + '<span class="wlt-tx-count">' + WALLET_TRANSACTIONS.length + '</span>'
    + '</div>'
    + '<div class="wlt-tx-list">';

  for (var i = 0; i < WALLET_TRANSACTIONS.length; i++) {
    h += _wltTxRow(WALLET_TRANSACTIONS[i]);
  }
  h += '</div>';

  h += '</div>';
  body.innerHTML = h;
}

function _wltMonthlyIn() {
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth();
  return WALLET_TRANSACTIONS.filter(function(t) {
    var d = new Date(t.date);
    return t.direction === 'in' && d.getFullYear() === y && d.getMonth() === m;
  }).reduce(function(s, t){ return s + t.amount; }, 0);
}
function _wltMonthlyOut() {
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth();
  return WALLET_TRANSACTIONS.filter(function(t) {
    var d = new Date(t.date);
    return t.direction === 'out' && d.getFullYear() === y && d.getMonth() === m;
  }).reduce(function(s, t){ return s + t.amount; }, 0);
}

function _wltTxRow(t) {
  var meta = _wltSourceMeta(t.source);
  var isIn = t.direction === 'in';
  var sign = isIn ? '+' : '-';
  var amountColor = isIn ? '#059669' : '#B91C1C';

  return '<div class="wlt-tx" onclick="_wltOpenDetail(\'' + t.id + '\')">'
    + '<div class="wlt-tx-ico" style="background:' + meta.color + '18;color:' + meta.color + '">'
    + '<iconify-icon icon="' + meta.icon + '" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="wlt-tx-cp">' + _wltEsc(t.counterparty) + '</div>'
    + '<div class="wlt-tx-meta">'
    + '<span class="wlt-tx-channel">' + _wltEsc(t.channel) + '</span>'
    + '<span class="wlt-tx-sep">·</span>'
    + '<span>' + _wltFmtDate(t.date) + '</span>'
    + '</div>'
    + '</div>'
    + '<div class="wlt-tx-amount" style="color:' + amountColor + '">'
    + sign + _wltFmt(t.amount) + ' <span class="wlt-tx-unit">🪙</span>'
    + '</div>'
    + '</div>';
}

/* ═══ P2 — Token Yükleme Akışı ═══ */
function _wltOpenLoad() {
  _wltCloseAll();
  _wlt.loadOpen = true;
  _wlt.loadStep = 1;
  _wlt.loadAmount = 0;
  _wlt.loadUseNew = false;
  _wlt.loadNewCard = { num:'', exp:'', cvv:'', name:'', save:true };

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'wltLoadModal';
  m.className = 'wlt-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _wltCloseLoad(); };
  m.innerHTML = '<div class="wlt-modal"><div id="wltLoadBody"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _wltRenderLoad();
}

function _wltCloseLoad() {
  var m = document.getElementById('wltLoadModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
  _wlt.loadOpen = false;
}

function _wltRenderLoad() {
  var body = document.getElementById('wltLoadBody');
  if (!body) return;

  var titles = ['Token Yükle', 'Ödeme Yöntemi', '3D Secure', 'Yükleme Başarılı'];
  var h = '<div class="wlt-step-head">'
    + '<div class="wlt-step-close" onclick="_wltCloseLoad()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div style="flex:1"><div class="wlt-step-title">' + titles[_wlt.loadStep - 1] + '</div>'
    + '<div class="wlt-step-sub">Adım ' + _wlt.loadStep + '/4</div></div>'
    + '</div>'
    + '<div class="wlt-step-dots">'
    + [1,2,3,4].map(function(i){
        return '<div class="wlt-step-dot' + (i < _wlt.loadStep ? ' done' : i === _wlt.loadStep ? ' active' : '') + '"></div>';
      }).join('')
    + '</div>';

  if (_wlt.loadStep === 1) h += _wltLoadStep1();
  else if (_wlt.loadStep === 2) h += _wltLoadStep2();
  else if (_wlt.loadStep === 3) h += _wltLoadStep3();
  else h += _wltLoadStep4();

  body.innerHTML = h;
}

function _wltLoadStep1() {
  var amt = _wlt.loadAmount || 0;
  var tl = amt * WALLET_CONFIG.exchangeRate;

  var h = '<div class="wlt-step-body">';

  // Input card
  h += '<div class="wlt-amount-card">'
    + '<div class="wlt-amount-lbl">Yüklemek istediğin miktar</div>'
    + '<div class="wlt-amount-input">'
    + '<input type="number" min="0" placeholder="0" value="' + (amt || '') + '" '
    + 'oninput="_wlt.loadAmount=parseInt(this.value)||0;_wltUpdateLoadStep1()" id="wltLoadAmt">'
    + '<span class="wlt-amount-coin">🪙</span>'
    + '</div>'
    + '<div class="wlt-amount-tl" id="wltLoadTl">≈ ' + _wltFmtTL(tl) + '</div>'
    + '</div>';

  // Presets
  h += '<div class="wlt-preset-lbl">Hızlı Seçim</div>'
    + '<div class="wlt-preset-grid">';
  for (var i = 0; i < WALLET_CONFIG.loadPresets.length; i++) {
    var p = WALLET_CONFIG.loadPresets[i];
    h += '<button class="wlt-preset-chip' + (amt === p ? ' active' : '') + '" onclick="_wlt.loadAmount=' + p + ';_wltRenderLoad()">'
      + _wltFmt(p) + '<span>🪙</span></button>';
  }
  h += '</div>';

  // Bilgi
  h += '<div class="wlt-info-note">'
    + '<iconify-icon icon="solar:info-circle-linear" style="font-size:12px;color:var(--text-muted)"></iconify-icon>'
    + '<span>1 Token = ₺' + WALLET_CONFIG.exchangeRate.toFixed(2) + ' · Minimum ' + WALLET_CONFIG.loadMin + ' token</span>'
    + '</div>';

  var valid = amt >= WALLET_CONFIG.loadMin;
  h += '<div class="wlt-step-footer">'
    + '<button class="wlt-btn-primary' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_wlt.loadStep=2;_wltRenderLoad()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon></button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _wltUpdateLoadStep1() {
  var el = document.getElementById('wltLoadTl');
  if (el) el.textContent = '≈ ' + _wltFmtTL((_wlt.loadAmount || 0) * WALLET_CONFIG.exchangeRate);
  // Devam et butonunu canlı güncelle
  var btn = document.querySelector('#wltLoadModal .wlt-btn-primary');
  if (btn) {
    var valid = (_wlt.loadAmount || 0) >= WALLET_CONFIG.loadMin;
    btn.classList.toggle('disabled', !valid);
    btn.onclick = valid ? function(){ _wlt.loadStep = 2; _wltRenderLoad(); } : null;
  }
}

function _wltLoadStep2() {
  var h = '<div class="wlt-step-body">';

  // Summary
  h += '<div class="wlt-sum-card">'
    + '<div class="wlt-sum-row"><span>Yüklenecek</span><b>' + _wltFmt(_wlt.loadAmount) + ' 🪙</b></div>'
    + '<div class="wlt-sum-row sfh-sum-row--hl"><span>Ödenecek</span><b style="color:#10B981">' + _wltFmtTL(_wlt.loadAmount * WALLET_CONFIG.exchangeRate) + '</b></div>'
    + '</div>';

  h += '<div class="wlt-sec-lbl">Kayıtlı Kartlar</div>'
    + '<div class="wlt-cards-list">';
  for (var i = 0; i < USER_WALLET.cards.length; i++) {
    var c = USER_WALLET.cards[i];
    var active = !_wlt.loadUseNew && _wlt.loadCardId === c.id;
    var brandColor = c.brand === 'Visa' ? '#1A1F71' : '#EB001B';
    h += '<div class="wlt-card-row' + (active ? ' active' : '') + '" onclick="_wlt.loadUseNew=false;_wlt.loadCardId=\'' + c.id + '\';_wltRenderLoad()">'
      + '<div class="wlt-card-brand" style="background:' + brandColor + '">'
      + _wltEsc(c.brand === 'Visa' ? 'VISA' : 'MC') + '</div>'
      + '<div style="flex:1">'
      + '<div class="wlt-card-num">•••• •••• •••• ' + _wltEsc(c.last4) + '</div>'
      + '<div class="wlt-card-meta">' + _wltEsc(c.brand) + (c.primary ? ' · Birincil kart' : '') + '</div>'
      + '</div>'
      + '<div class="wlt-card-check">' + (active ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:#10B981"></iconify-icon>' : '<iconify-icon icon="solar:stop-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>') + '</div>'
      + '</div>';
  }
  h += '</div>';

  // Yeni kart seçeneği
  h += '<div class="wlt-card-row wlt-card-new' + (_wlt.loadUseNew ? ' active' : '') + '" onclick="_wlt.loadUseNew=true;_wltRenderLoad()">'
    + '<div class="wlt-card-brand wlt-card-brand--new"><iconify-icon icon="solar:add-circle-bold" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1"><div class="wlt-card-num">Yeni Kart</div>'
    + '<div class="wlt-card-meta">Kart bilgilerini gir</div></div>'
    + '<div class="wlt-card-check">' + (_wlt.loadUseNew ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:#10B981"></iconify-icon>' : '<iconify-icon icon="solar:stop-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>') + '</div>'
    + '</div>';

  if (_wlt.loadUseNew) {
    h += '<div class="wlt-new-card-form">'
      + '<input class="wlt-inp" placeholder="Kart üzerindeki isim" value="' + _wltEsc(_wlt.loadNewCard.name) + '" oninput="_wlt.loadNewCard.name=this.value">'
      + '<input class="wlt-inp" placeholder="Kart Numarası (16 hane)" maxlength="19" value="' + _wltEsc(_wlt.loadNewCard.num) + '" oninput="_wlt.loadNewCard.num=this.value">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
      + '<input class="wlt-inp" placeholder="AA/YY" maxlength="5" value="' + _wltEsc(_wlt.loadNewCard.exp) + '" oninput="_wlt.loadNewCard.exp=this.value">'
      + '<input class="wlt-inp" placeholder="CVV" maxlength="4" value="' + _wltEsc(_wlt.loadNewCard.cvv) + '" oninput="_wlt.loadNewCard.cvv=this.value">'
      + '</div>'
      + '<label class="wlt-save-lbl">'
      + '<input type="checkbox"' + (_wlt.loadNewCard.save ? ' checked' : '') + ' onchange="_wlt.loadNewCard.save=this.checked">'
      + '<span>Kartı kaydet</span></label>'
      + '</div>';
  }

  // Secure note
  h += '<div class="wlt-secure-note">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:14px;color:#10B981"></iconify-icon>'
    + '<span>3D Secure ile güvenli ödeme · Kart bilgileri saklanmaz</span>'
    + '</div>';

  h += '<div class="wlt-step-footer">'
    + '<button class="wlt-btn-ghost" onclick="_wlt.loadStep=1;_wltRenderLoad()">Geri</button>'
    + '<button class="wlt-btn-primary" onclick="_wlt.loadStep=3;_wltRenderLoad()">'
    + 'Ödemeyi Başlat <iconify-icon icon="solar:shield-check-bold" style="font-size:14px"></iconify-icon></button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _wltLoadStep3() {
  var h = '<div class="wlt-step-body wlt-3d-body">'
    + '<div class="wlt-3d-box">'
    + '<div class="wlt-3d-logo">3D Secure</div>'
    + '<div class="wlt-3d-title">Bankaya Yönlendiriliyorsun</div>'
    + '<div class="wlt-3d-sub">Cep telefonuna SMS ile gönderilen onay kodunu gir.</div>'
    + '<div class="wlt-3d-code-wrap">'
    + '<input class="wlt-3d-code" maxlength="6" placeholder="• • • • • •" id="wlt3dCode">'
    + '</div>'
    + '<div class="wlt-3d-timer"><iconify-icon icon="solar:clock-circle-linear" style="font-size:12px"></iconify-icon>Kod süresi: 02:45</div>'
    + '<button class="wlt-btn-primary wlt-btn-wide" onclick="_wltComplete3D()">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Doğrula & Öde</button>'
    + '<button class="wlt-btn-ghost wlt-btn-wide" onclick="_wlt.loadStep=2;_wltRenderLoad()">Geri</button>'
    + '</div>'
    + '</div>';
  return h;
}

function _wltComplete3D() {
  // Bakiyeye ekle + transaction kaydet
  var card = USER_WALLET.cards.find(function(c){ return c.id === _wlt.loadCardId; });
  var cardLabel = _wlt.loadUseNew
    ? 'Yeni Kart •••• ' + (_wlt.loadNewCard.num.replace(/\s/g,'').slice(-4) || '****')
    : (card ? card.brand + ' •••• ' + card.last4 : 'Kart');

  var bb = USER_WALLET.tokens;
  USER_WALLET.tokens += _wlt.loadAmount;
  WALLET_TRANSACTIONS.unshift({
    id: 'tx_' + Date.now().toString(36),
    direction: 'in',
    source: 'load',
    amount: _wlt.loadAmount,
    counterparty: 'Yükleme',
    counterpartyAvatar: null,
    note: 'Kredi kartı · ' + cardLabel,
    balanceBefore: bb,
    balanceAfter: USER_WALLET.tokens,
    date: new Date().toISOString(),
    channel: 'Kart Yükleme'
  });

  _wlt.loadStep = 4;
  _wltRenderLoad();
}

function _wltLoadStep4() {
  var h = '<div class="wlt-step-body wlt-success-body">'
    + '<div class="wlt-success-ico"><iconify-icon icon="solar:check-circle-bold" style="font-size:54px;color:#22C55E"></iconify-icon></div>'
    + '<div class="wlt-success-title">Yükleme Başarılı</div>'
    + '<div class="wlt-success-sub">Bakiyene ' + _wltFmt(_wlt.loadAmount) + ' token eklendi</div>'
    + '<div class="wlt-success-box">'
    + '<div class="wlt-sum-row"><span>Yüklenen</span><b style="color:#10B981">+' + _wltFmt(_wlt.loadAmount) + ' 🪙</b></div>'
    + '<div class="wlt-sum-row"><span>Ödenen</span><b>' + _wltFmtTL(_wlt.loadAmount * WALLET_CONFIG.exchangeRate) + '</b></div>'
    + '<div class="wlt-sum-row wlt-sum-row--hl"><span>Yeni Bakiye</span><b>' + _wltFmt(USER_WALLET.tokens) + ' 🪙</b></div>'
    + '</div>'
    + '<button class="wlt-btn-primary wlt-btn-wide" onclick="_wltCloseLoad();_wltRenderBody()">Harika!</button>'
    + '</div>';
  return h;
}

/* ═══ P3 — Token Share Akışı ═══ */
function _wltOpenShare() {
  _wltCloseAll();
  _wlt.shareOpen = true;
  _wlt.shareStep = 1;
  _wlt.shareSearch = '';
  _wlt.shareTarget = null;
  _wlt.shareAmount = 0;
  _wlt.shareNote = '';

  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'wltShareModal';
  m.className = 'wlt-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _wltCloseShare(); };
  m.innerHTML = '<div class="wlt-modal"><div id="wltShareBody"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _wltRenderShare();
}

function _wltCloseShare() {
  var m = document.getElementById('wltShareModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
  _wlt.shareOpen = false;
}

function _wltRenderShare() {
  var body = document.getElementById('wltShareBody');
  if (!body) return;

  var titles = ['Arkadaş Seç', 'Miktar & Not', 'Onay', 'Gönderildi'];
  var h = '<div class="wlt-step-head">'
    + '<div class="wlt-step-close" onclick="_wltCloseShare()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div style="flex:1"><div class="wlt-step-title">' + titles[_wlt.shareStep - 1] + '</div>'
    + '<div class="wlt-step-sub">Adım ' + _wlt.shareStep + '/4</div></div>'
    + '</div>'
    + '<div class="wlt-step-dots">'
    + [1,2,3,4].map(function(i){
        return '<div class="wlt-step-dot' + (i < _wlt.shareStep ? ' done' : i === _wlt.shareStep ? ' active' : '') + '"></div>';
      }).join('')
    + '</div>';

  if (_wlt.shareStep === 1) h += _wltShareStep1();
  else if (_wlt.shareStep === 2) h += _wltShareStep2();
  else if (_wlt.shareStep === 3) h += _wltShareStep3();
  else h += _wltShareStep4();

  body.innerHTML = h;
}

function _wltShareStep1() {
  var q = (_wlt.shareSearch || '').toLowerCase().trim();
  // Sadece karşılıklı takipleşenler (mutual)
  var friends = USER_MUTUAL_FRIENDS.filter(function(f) {
    if (!f.mutual) return false;
    if (!q) return true;
    return f.name.toLowerCase().indexOf(q) > -1 || f.handle.toLowerCase().indexOf(q) > -1;
  });

  var h = '<div class="wlt-step-body">';

  // Güvenlik uyarısı
  h += '<div class="wlt-secure-note">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:14px;color:#8B5CF6"></iconify-icon>'
    + '<span>Sadece <b>karşılıklı takipleştiğin</b> arkadaşlara token gönderebilirsin</span>'
    + '</div>';

  // Search
  h += '<div class="wlt-search">'
    + '<iconify-icon icon="solar:magnifer-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input type="text" placeholder="İsim veya kullanıcı adı ara..." value="' + _wltEsc(_wlt.shareSearch) + '" '
    + 'oninput="_wlt.shareSearch=this.value;_wltRenderShareList()">'
    + '</div>';

  h += '<div id="wltFriendList" class="wlt-friend-list">' + _wltFriendListHtml(friends) + '</div>';

  h += '</div>';
  return h;
}

function _wltRenderShareList() {
  var q = (_wlt.shareSearch || '').toLowerCase().trim();
  var friends = USER_MUTUAL_FRIENDS.filter(function(f) {
    if (!f.mutual) return false;
    if (!q) return true;
    return f.name.toLowerCase().indexOf(q) > -1 || f.handle.toLowerCase().indexOf(q) > -1;
  });
  var el = document.getElementById('wltFriendList');
  if (el) el.innerHTML = _wltFriendListHtml(friends);
}

function _wltFriendListHtml(friends) {
  if (friends.length === 0) {
    return '<div class="wlt-empty-small">'
      + '<iconify-icon icon="solar:users-group-rounded-linear" style="font-size:32px;opacity:.3"></iconify-icon>'
      + '<div>Arkadaş bulunamadı</div>'
      + '</div>';
  }
  var h = '';
  for (var i = 0; i < friends.length; i++) {
    var f = friends[i];
    h += '<div class="wlt-friend-row" onclick="_wltPickFriend(\'' + f.id + '\')">'
      + '<img class="wlt-friend-avatar" src="' + f.avatar + '" alt="">'
      + '<div style="flex:1;min-width:0">'
      + '<div class="wlt-friend-name">' + _wltEsc(f.name) + (f.badge ? ' <span class="wlt-friend-badge">' + f.badge + '</span>' : '') + '</div>'
      + '<div class="wlt-friend-handle">' + _wltEsc(f.handle) + ' · <span class="wlt-mutual-pill">Karşılıklı takip</span></div>'
      + '</div>'
      + '<iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:15px;color:var(--text-muted)"></iconify-icon>'
      + '</div>';
  }
  return h;
}

function _wltPickFriend(id) {
  for (var i = 0; i < USER_MUTUAL_FRIENDS.length; i++) {
    if (USER_MUTUAL_FRIENDS[i].id === id) { _wlt.shareTarget = USER_MUTUAL_FRIENDS[i]; break; }
  }
  _wlt.shareStep = 2;
  _wltRenderShare();
}

function _wltShareStep2() {
  var f = _wlt.shareTarget;
  var bal = USER_WALLET.tokens;
  var dailyRemain = WALLET_CONFIG.dailyShareLimit - WALLET_DAILY_SHARED;
  var amt = _wlt.shareAmount || 0;

  var h = '<div class="wlt-step-body">';

  // Alıcı
  h += '<div class="wlt-recipient">'
    + '<img class="wlt-friend-avatar" src="' + f.avatar + '" alt="">'
    + '<div style="flex:1"><div class="wlt-friend-name">' + _wltEsc(f.name) + '</div>'
    + '<div class="wlt-friend-handle">' + _wltEsc(f.handle) + '</div></div>'
    + '<button class="wlt-btn-link" onclick="_wlt.shareStep=1;_wltRenderShare()">Değiştir</button>'
    + '</div>';

  // Amount input
  h += '<div class="wlt-amount-card">'
    + '<div class="wlt-amount-lbl">Gönderilecek miktar</div>'
    + '<div class="wlt-amount-input">'
    + '<input type="number" min="0" placeholder="0" value="' + (amt || '') + '" '
    + 'oninput="_wlt.shareAmount=parseInt(this.value)||0;_wltUpdateShareStep2()" id="wltShareAmt">'
    + '<span class="wlt-amount-coin">🪙</span>'
    + '</div>'
    + '<div class="wlt-amount-tl" id="wltShareTl">≈ ' + _wltFmtTL(amt * WALLET_CONFIG.exchangeRate) + '</div>'
    + '</div>';

  // Quick amounts
  var quicks = [25, 50, 100, 250].filter(function(v){ return v <= Math.min(bal, dailyRemain, WALLET_CONFIG.maxSingleShare); });
  h += '<div class="wlt-preset-grid">';
  for (var i = 0; i < quicks.length; i++) {
    h += '<button class="wlt-preset-chip' + (amt === quicks[i] ? ' active' : '') + '" onclick="_wlt.shareAmount=' + quicks[i] + ';_wltRenderShare()">'
      + _wltFmt(quicks[i]) + '<span>🪙</span></button>';
  }
  h += '</div>';

  // Limit info
  h += '<div class="wlt-limit-info">'
    + '<div><span>Bakiyen</span><b>' + _wltFmt(bal) + ' 🪙</b></div>'
    + '<div><span>Günlük kalan</span><b>' + _wltFmt(dailyRemain) + ' 🪙</b></div>'
    + '<div><span>Tek seferlik max</span><b>' + _wltFmt(WALLET_CONFIG.maxSingleShare) + ' 🪙</b></div>'
    + '</div>';

  // Note
  h += '<div class="wlt-note-wrap">'
    + '<div class="wlt-note-lbl">Not (opsiyonel)</div>'
    + '<input class="wlt-inp" maxlength="80" placeholder="Kısa bir not bırak..." value="' + _wltEsc(_wlt.shareNote) + '" '
    + 'oninput="_wlt.shareNote=this.value" id="wltShareNote">'
    + '<div class="wlt-note-counter"><span id="wltNoteCount">' + (_wlt.shareNote || '').length + '</span>/80</div>'
    + '</div>';

  // Validation
  var err = '';
  if (amt < WALLET_CONFIG.minShare) err = 'Min. ' + WALLET_CONFIG.minShare + ' token gönderebilirsin';
  else if (amt > bal) err = 'Yetersiz bakiye';
  else if (amt > dailyRemain) err = 'Günlük limit aşıldı (kalan: ' + dailyRemain + ')';
  else if (amt > WALLET_CONFIG.maxSingleShare) err = 'Tek seferlik max: ' + WALLET_CONFIG.maxSingleShare;

  if (err) {
    h += '<div class="wlt-err-note">'
      + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:13px;color:#EF4444"></iconify-icon>'
      + '<span>' + err + '</span></div>';
  }

  var valid = amt >= WALLET_CONFIG.minShare && amt <= bal && amt <= dailyRemain && amt <= WALLET_CONFIG.maxSingleShare;
  h += '<div class="wlt-step-footer">'
    + '<button class="wlt-btn-ghost" onclick="_wlt.shareStep=1;_wltRenderShare()">Geri</button>'
    + '<button class="wlt-btn-primary' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_wlt.shareStep=3;_wltRenderShare()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:14px"></iconify-icon></button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _wltUpdateShareStep2() {
  var el = document.getElementById('wltShareTl');
  if (el) el.textContent = '≈ ' + _wltFmtTL((_wlt.shareAmount || 0) * WALLET_CONFIG.exchangeRate);
  // Re-render footer + err
  _wltRenderShare();
}

function _wltShareStep3() {
  var f = _wlt.shareTarget;
  var amt = _wlt.shareAmount;

  var h = '<div class="wlt-step-body">';
  h += '<div class="wlt-confirm-hero">'
    + '<iconify-icon icon="solar:send-square-bold" style="font-size:42px;color:#8B5CF6"></iconify-icon>'
    + '<div class="wlt-confirm-amt">' + _wltFmt(amt) + ' <span>🪙</span></div>'
    + '<div class="wlt-confirm-sub">' + _wltFmtTL(amt * WALLET_CONFIG.exchangeRate) + ' değerinde token</div>'
    + '</div>';

  h += '<div class="wlt-sum-card">'
    + '<div class="wlt-sum-row"><span>Alıcı</span><b>' + _wltEsc(f.name) + '</b></div>'
    + '<div class="wlt-sum-row"><span>Kullanıcı adı</span><b>' + _wltEsc(f.handle) + '</b></div>'
    + '<div class="wlt-sum-row"><span>Miktar</span><b style="color:#8B5CF6">-' + _wltFmt(amt) + ' 🪙</b></div>'
    + (_wlt.shareNote ? '<div class="wlt-sum-row"><span>Not</span><b>"' + _wltEsc(_wlt.shareNote) + '"</b></div>' : '')
    + '<div class="wlt-sum-row wlt-sum-row--hl"><span>Yeni bakiyen</span><b>' + _wltFmt(USER_WALLET.tokens - amt) + ' 🪙</b></div>'
    + '</div>';

  h += '<div class="wlt-warn-note">'
    + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:14px;color:#F59E0B"></iconify-icon>'
    + '<span>Gönderilen token <b>geri alınamaz</b>. Tokenlar gerçek paraya çevrilemez; sadece uygulama içi işlemlerde kullanılır.</span>'
    + '</div>';

  h += '<div class="wlt-step-footer">'
    + '<button class="wlt-btn-ghost" onclick="_wlt.shareStep=2;_wltRenderShare()">Geri</button>'
    + '<button class="wlt-btn-primary wlt-btn--violet" onclick="_wltSubmitShare()">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Onayla & Gönder</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _wltSubmitShare() {
  var f = _wlt.shareTarget;
  var amt = _wlt.shareAmount;
  var bb = USER_WALLET.tokens;

  USER_WALLET.tokens -= amt;
  WALLET_DAILY_SHARED += amt;

  WALLET_TRANSACTIONS.unshift({
    id: 'tx_' + Date.now().toString(36),
    direction: 'out',
    source: 'share',
    amount: amt,
    counterparty: f.name,
    counterpartyAvatar: f.avatar,
    note: _wlt.shareNote || 'Token Share',
    balanceBefore: bb,
    balanceAfter: USER_WALLET.tokens,
    date: new Date().toISOString(),
    channel: 'Token Share'
  });

  _wlt.shareStep = 4;
  _wltRenderShare();
}

function _wltShareStep4() {
  var f = _wlt.shareTarget;
  var amt = _wlt.shareAmount;

  var h = '<div class="wlt-step-body wlt-success-body">'
    + '<div class="wlt-success-ico"><iconify-icon icon="solar:check-circle-bold" style="font-size:54px;color:#22C55E"></iconify-icon></div>'
    + '<div class="wlt-success-title">Token Gönderildi</div>'
    + '<div class="wlt-success-sub"><b>' + _wltEsc(f.name) + '</b> hesabına başarıyla iletildi</div>'
    + '<div class="wlt-success-box">'
    + '<div class="wlt-sum-row"><span>Alıcı</span><b>' + _wltEsc(f.name) + '</b></div>'
    + '<div class="wlt-sum-row"><span>Gönderilen</span><b style="color:#8B5CF6">-' + _wltFmt(amt) + ' 🪙</b></div>'
    + '<div class="wlt-sum-row wlt-sum-row--hl"><span>Yeni Bakiyen</span><b>' + _wltFmt(USER_WALLET.tokens) + ' 🪙</b></div>'
    + '</div>'
    + '<button class="wlt-btn-primary wlt-btn-wide" onclick="_wltCloseShare();_wltRenderBody()">Tamam</button>'
    + '</div>';
  return h;
}

/* ═══ P4 — İşlem Detay + Şikayet ═══ */
function _wltOpenDetail(id) {
  _wltCloseAll();
  _wlt.detailId = id;
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'wltDetailModal';
  m.className = 'wlt-modal-backdrop';
  m.onclick = function(e){ if (e.target === m) _wltCloseDetail(); };
  m.innerHTML = '<div class="wlt-modal wlt-modal--compact"><div id="wltDetailBody"></div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
  _wltRenderDetail();
}

function _wltCloseDetail() {
  var m = document.getElementById('wltDetailModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
  _wlt.detailId = null;
}

function _wltRenderDetail() {
  var body = document.getElementById('wltDetailBody');
  if (!body) return;
  var t = _wltTx(_wlt.detailId);
  if (!t) return;

  var meta = _wltSourceMeta(t.source);
  var isIn = t.direction === 'in';
  var sign = isIn ? '+' : '-';
  var amountColor = isIn ? '#10B981' : '#8B5CF6';
  var gradient = isIn
    ? 'linear-gradient(135deg,#059669,#10B981)'
    : 'linear-gradient(135deg,#7C3AED,#A855F7)';

  var h = '<div class="wlt-det-hero" style="background:' + gradient + '">'
    + '<div class="wlt-close" onclick="_wltCloseDetail()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px;color:#fff"></iconify-icon></div>'
    + '<div class="wlt-det-source"><iconify-icon icon="' + meta.icon + '" style="font-size:14px"></iconify-icon>' + _wltEsc(meta.label) + '</div>'
    + '<div class="wlt-det-amount">' + sign + _wltFmt(t.amount) + ' <span>🪙</span></div>'
    + '<div class="wlt-det-amount-tl">' + (isIn ? 'Gelen' : 'Giden') + ' · ' + _wltFmtTL(t.amount) + '</div>'
    + '<div class="wlt-det-cp">' + _wltEsc(t.counterparty) + '</div>'
    + '<div class="wlt-det-date">' + _wltFmtDate(t.date) + '</div>'
    + '</div>';

  h += '<div class="wlt-det-body">';

  // Bakiye karşılaştırma
  h += '<div class="wlt-bal-compare">'
    + '<div class="wlt-bc-row">'
    + '<div class="wlt-bc-lbl">Önceki Bakiye</div>'
    + '<div class="wlt-bc-val">' + _wltFmt(t.balanceBefore) + ' 🪙</div>'
    + '</div>'
    + '<div class="wlt-bc-arrow">'
    + '<iconify-icon icon="solar:arrow-down-linear" style="font-size:14px;color:' + amountColor + '"></iconify-icon>'
    + '<span style="color:' + amountColor + ';font-weight:700">' + sign + _wltFmt(t.amount) + '</span>'
    + '</div>'
    + '<div class="wlt-bc-row wlt-bc-row--hl">'
    + '<div class="wlt-bc-lbl">Sonraki Bakiye</div>'
    + '<div class="wlt-bc-val">' + _wltFmt(t.balanceAfter) + ' 🪙</div>'
    + '</div>'
    + '</div>';

  // Detay bilgileri
  h += '<div class="wlt-sum-card" style="margin-top:10px">'
    + '<div class="wlt-sum-row"><span>İşlem ID</span><b class="wlt-mono">' + _wltEsc(t.id.toUpperCase()) + '</b></div>'
    + '<div class="wlt-sum-row"><span>Kanal</span><b>' + _wltEsc(t.channel) + '</b></div>'
    + '<div class="wlt-sum-row"><span>Tarih</span><b>' + new Date(t.date).toLocaleString('tr-TR') + '</b></div>'
    + (t.note ? '<div class="wlt-sum-row"><span>Açıklama</span><b style="text-align:right;max-width:60%">' + _wltEsc(t.note) + '</b></div>' : '')
    + '</div>';

  // Aksiyonlar
  h += '<div class="wlt-det-actions">'
    + '<button class="wlt-btn-ghost wlt-btn-wide" onclick="_wltCopyTxId(\'' + t.id + '\')">'
    + '<iconify-icon icon="solar:copy-bold" style="font-size:14px"></iconify-icon>ID Kopyala</button>'
    + '<button class="wlt-btn-danger-ghost wlt-btn-wide" onclick="_wltOpenComplaint(\'' + t.id + '\')">'
    + '<iconify-icon icon="solar:flag-bold" style="font-size:14px"></iconify-icon>İşlemi Şikayet Et</button>'
    + '</div>';

  h += '</div>';
  body.innerHTML = h;
}

function _wltCopyTxId(id) {
  if (navigator.clipboard) navigator.clipboard.writeText(id.toUpperCase());
  if (typeof _admToast === 'function') _admToast('İşlem ID kopyalandı', 'ok');
}

function _wltOpenComplaint(id) {
  var phone = document.getElementById('phone');
  var existing = document.getElementById('wltCompModal');
  if (existing) existing.remove();

  var m = document.createElement('div');
  m.id = 'wltCompModal';
  m.className = 'wlt-confirm-backdrop';
  m.onclick = function(e){ if (e.target === m) { m.classList.remove('open'); setTimeout(function(){m.remove();}, 240); } };
  m.innerHTML = '<div class="wlt-confirm">'
    + '<div class="wlt-confirm-icon" style="background:rgba(239,68,68,.12);color:#EF4444">'
    + '<iconify-icon icon="solar:flag-bold" style="font-size:28px"></iconify-icon>'
    + '</div>'
    + '<div class="wlt-confirm-title">İşlemi Şikayet Et</div>'
    + '<div class="wlt-confirm-msg">Bu işlemle ilgili şüpheli bir durum varsa Destek ekibimize iletilecektir. Şikayetin inceleme altına alınır ve gerekirse tutar iade edilir.</div>'
    + '<div class="wlt-confirm-meta">İşlem ID: <b>' + _wltEsc(id.toUpperCase()) + '</b></div>'
    + '<textarea class="wlt-inp wlt-textarea" placeholder="Kısaca ne olduğunu anlat..." id="wltCompReason"></textarea>'
    + '<div class="wlt-confirm-btns">'
    + '<button class="wlt-btn-ghost" onclick="document.getElementById(\'wltCompModal\').classList.remove(\'open\');setTimeout(function(){document.getElementById(\'wltCompModal\').remove();},240)">Vazgeç</button>'
    + '<button class="wlt-btn-danger" onclick="_wltSubmitComplaint(\'' + id + '\')">Şikayeti Gönder</button>'
    + '</div></div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _wltSubmitComplaint(id) {
  var reason = (document.getElementById('wltCompReason') || {}).value || '';
  var m = document.getElementById('wltCompModal');
  if (m) { m.classList.remove('open'); setTimeout(function(){ m.remove(); }, 240); }
  if (typeof _admToast === 'function') _admToast('Şikayet kaydedildi · Destek ekibi inceleyecek', 'ok');
}

/* ═══ P4.5 — Info Popup (Yasal Uyarı) ═══ */
function _wltOpenInfo() {
  _wltCloseAll();
  var phone = document.getElementById('phone');
  var m = document.createElement('div');
  m.id = 'wltInfoModal';
  m.className = 'wlt-confirm-backdrop';
  m.onclick = function(e){ if (e.target === m) _wltCloseInfo(); };
  m.innerHTML = '<div class="wlt-confirm wlt-info-modal">'
    + '<div class="wlt-confirm-icon" style="background:rgba(16,185,129,.12);color:#10B981">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:30px"></iconify-icon>'
    + '</div>'
    + '<div class="wlt-confirm-title">Token Hakkında</div>'
    + '<div class="wlt-info-body">'
    + '<div class="wlt-info-row">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px;color:#22C55E;flex-shrink:0;margin-top:2px"></iconify-icon>'
    + '<span><b>Yapabildiklerin:</b> Token satın alabilir, arkadaşlarına hediye edebilirsin. Premium üyelik, sipariş veya rezervasyon oluşturmak için kullanabilirsin.</span>'
    + '</div>'
    + '<div class="wlt-info-row">'
    + '<iconify-icon icon="solar:close-circle-bold" style="font-size:15px;color:#EF4444;flex-shrink:0;margin-top:2px"></iconify-icon>'
    + '<span><b>Yapamayacakların:</b> Tokenlar <b>gerçek paraya çevrilemez</b> ve satılamaz. Satışı kesinlikle yasaktır.</span>'
    + '</div>'
    + '<div class="wlt-info-row">'
    + '<iconify-icon icon="solar:shield-check-bold" style="font-size:15px;color:#8B5CF6;flex-shrink:0;margin-top:2px"></iconify-icon>'
    + '<span><b>Güvenlik:</b> Token transferi sadece karşılıklı takipleştiğin arkadaşlar arasında yapılabilir. Günlük gönderim limiti bulunur.</span>'
    + '</div>'
    + '</div>'
    + '<button class="wlt-btn-primary wlt-btn-wide" onclick="_wltCloseInfo()">Anladım</button>'
    + '</div>';
  phone.appendChild(m);
  requestAnimationFrame(function(){ m.classList.add('open'); });
}

function _wltCloseInfo() {
  var m = document.getElementById('wltInfoModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function(){ if (m.parentNode) m.remove(); }, 240);
}

/* ═══════════════════════════════════════════════════════════
   Styles — P5.* parça parça build ediliyor
   ═══════════════════════════════════════════════════════════ */
function _wltInjectStyles() {
  if (document.getElementById('wltStyles')) return;
  var s = document.createElement('style');
  s.id = 'wltStyles';
  var parts = [];

  // ── P5.1 Header + layout + section label ──
  parts.push(
    '.wlt-overlay{color:var(--text-primary)}',
    '.wlt-header{position:sticky;top:0;display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-phone);border-bottom:1px solid var(--border-soft);z-index:5}',
    '.wlt-back{width:34px;height:34px;border-radius:10px;background:var(--bg-phone-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-primary);transition:transform .15s}',
    '.wlt-back:active{transform:scale(.94)}',
    '.wlt-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text-primary)}',
    '.wlt-sub{font-size:11px;color:var(--text-muted);margin-top:1px}',
    '.wlt-wrap{padding:12px 14px 28px;display:flex;flex-direction:column;gap:12px}',
    '.wlt-sec-lbl{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--text-primary);padding-left:2px;margin-top:4px}'
  );

  // ── P5.2 Balance kartı + quick actions + daily limit ──
  parts.push(
    '/* Balance card */',
    '.wlt-bal-card{position:relative;border-radius:20px;padding:18px;background:linear-gradient(135deg,#064E3B 0%,#059669 45%,#10B981 100%);color:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(5,150,105,.3)}',
    '.wlt-bal-shine{position:absolute;top:-50%;right:-15%;width:60%;height:200%;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%);transform:rotate(22deg);pointer-events:none;animation:wltShine 4.5s ease-in-out infinite}',
    '@keyframes wltShine{0%,100%{opacity:.2}50%{opacity:.55}}',
    '.wlt-bal-top{position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;z-index:1}',
    '.wlt-bal-lbl{font-size:11.5px;font-weight:600;opacity:.9;letter-spacing:.4px;text-transform:uppercase}',
    '.wlt-bal-info{width:28px;height:28px;border:none;background:rgba(255,255,255,.18);color:#fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);transition:transform .15s}',
    '.wlt-bal-info:active{transform:scale(.92)}',
    '.wlt-bal-val{position:relative;display:flex;align-items:baseline;gap:6px;z-index:1;text-shadow:0 1px 3px rgba(0,0,0,.2)}',
    '.wlt-coin{font-size:26px;line-height:1}',
    '.wlt-bal-num{font-size:42px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}',
    '.wlt-bal-unit{font-size:13px;font-weight:700;opacity:.85;letter-spacing:.3px;margin-left:2px}',
    '.wlt-bal-tl{position:relative;font-size:11.5px;opacity:.85;margin-top:4px;z-index:1}',
    '.wlt-bal-bottom{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.22);z-index:1}',
    '.wlt-stat-lbl{font-size:10px;opacity:.85;font-weight:600;letter-spacing:.3px}',
    '.wlt-stat-val{font-size:14.5px;font-weight:800;margin-top:2px;font-variant-numeric:tabular-nums}',
    '/* Quick actions */',
    '.wlt-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.wlt-action{padding:13px 14px;border:none;border-radius:14px;cursor:pointer;display:flex;align-items:center;gap:10px;font-family:inherit;text-align:left;transition:transform .15s,box-shadow .2s}',
    '.wlt-action:active{transform:scale(.97)}',
    '.wlt-action--primary{background:linear-gradient(135deg,#10B981,#059669);color:#fff;box-shadow:0 3px 10px rgba(16,185,129,.3)}',
    '.wlt-action--secondary{background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;box-shadow:0 3px 10px rgba(139,92,246,.3)}',
    '.wlt-act-lbl{font-size:13px;font-weight:700;line-height:1.2}',
    '.wlt-act-sub{font-size:10.5px;opacity:.85;margin-top:2px}',
    '/* Daily limit */',
    '.wlt-limit{padding:10px 12px;background:var(--bg-phone-secondary);border-radius:12px;display:flex;flex-direction:column;gap:7px}',
    '.wlt-limit-head{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text-primary);font-weight:600}',
    '.wlt-limit-head span{flex:1}',
    '.wlt-limit-val{font-weight:800;color:#8B5CF6;font-variant-numeric:tabular-nums}',
    '.wlt-limit-bar{height:5px;background:var(--bg-phone);border-radius:999px;overflow:hidden}',
    '.wlt-limit-fill{height:100%;background:linear-gradient(90deg,#8B5CF6,#A855F7);border-radius:999px;transition:width .4s ease}'
  );

  // ── P5.3 İşlem geçmişi listesi ──
  parts.push(
    '/* Transaction list */',
    '.wlt-tx-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--text-primary);padding:6px 2px 0}',
    '.wlt-tx-head span:first-of-type{flex:1}',
    '.wlt-tx-count{font-size:10px;font-weight:700;background:var(--bg-phone-secondary);color:var(--text-muted);padding:2px 8px;border-radius:6px}',
    '.wlt-tx-list{background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:14px;overflow:hidden}',
    '.wlt-tx{display:flex;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid var(--border-soft);cursor:pointer;transition:background .15s}',
    '.wlt-tx:last-child{border-bottom:none}',
    '.wlt-tx:hover,.wlt-tx:active{background:var(--bg-phone-secondary)}',
    '.wlt-tx-ico{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.wlt-tx-cp{font-size:12.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.wlt-tx-meta{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.wlt-tx-channel{font-weight:600}',
    '.wlt-tx-sep{opacity:.7}',
    '.wlt-tx-amount{font-size:13.5px;font-weight:800;flex-shrink:0;font-variant-numeric:tabular-nums;text-align:right}',
    '.wlt-tx-unit{font-size:11px;margin-left:1px}'
  );

  // ── P5.4 Modal + step wizard + buttons ──
  parts.push(
    '/* Modal shell */',
    '.wlt-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:95;opacity:0;transition:opacity .24s ease}',
    '.wlt-modal-backdrop.open{opacity:1}',
    '.wlt-modal{width:100%;max-width:100%;background:var(--bg-phone);border-radius:20px 20px 0 0;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1);max-height:94vh;overflow-y:auto}',
    '.wlt-modal-backdrop.open .wlt-modal{transform:translateY(0)}',
    '.wlt-modal--compact{max-height:85vh}',
    '/* Step head */',
    '.wlt-step-head{position:sticky;top:0;display:flex;align-items:center;gap:10px;padding:14px 16px 10px;background:var(--bg-phone);z-index:3}',
    '.wlt-step-close{width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}',
    '.wlt-step-close:active{transform:scale(.92)}',
    '.wlt-step-title{font-size:15px;font-weight:800;color:var(--text-primary)}',
    '.wlt-step-sub{font-size:11px;color:var(--text-muted);margin-top:2px}',
    '.wlt-step-dots{display:flex;gap:5px;padding:0 16px 10px;align-items:center}',
    '.wlt-step-dot{flex:1;height:4px;border-radius:999px;background:var(--bg-phone-secondary);transition:background .25s}',
    '.wlt-step-dot.done{background:#10B981}',
    '.wlt-step-dot.active{background:linear-gradient(90deg,#10B981,#34D399)}',
    '.wlt-step-body{padding:4px 16px 18px;display:flex;flex-direction:column;gap:11px}',
    '.wlt-step-footer{display:flex;gap:8px;padding:12px 0 4px;position:sticky;bottom:0;background:var(--bg-phone);margin-top:6px}',
    '/* Buttons */',
    '.wlt-btn-primary{flex:1;padding:12px;border:none;background:linear-gradient(135deg,#10B981,#059669);color:#fff;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s;box-shadow:0 2px 8px rgba(16,185,129,.25)}',
    '.wlt-btn-primary:active{transform:scale(.97)}',
    '.wlt-btn-primary.disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}',
    '.wlt-btn-primary.wlt-btn--violet{background:linear-gradient(135deg,#8B5CF6,#7C3AED);box-shadow:0 2px 8px rgba(139,92,246,.28)}',
    '.wlt-btn-wide{width:100%;margin-top:6px}',
    '.wlt-btn-ghost{padding:12px 18px;border:1px solid var(--border-soft);background:transparent;color:var(--text-primary);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer}',
    '.wlt-btn-ghost:active{transform:scale(.97)}',
    '.wlt-btn-danger{flex:1;padding:12px;border:none;background:linear-gradient(135deg,#EF4444,#DC2626);color:#fff;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer}',
    '.wlt-btn-danger:active{transform:scale(.97)}',
    '.wlt-btn-danger-ghost{flex:1;padding:11px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.08);color:#EF4444;border-radius:12px;font-size:12.5px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}',
    '.wlt-btn-danger-ghost:active{transform:scale(.97)}',
    '.wlt-btn-link{padding:6px 10px;border:none;background:transparent;color:#10B981;font-size:12px;font-weight:700;cursor:pointer}',
    '/* Generic inputs */',
    '.wlt-inp{padding:11px 13px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);color:var(--text-primary);border-radius:10px;font-size:13px;outline:none;font-family:inherit;transition:border-color .18s}',
    '.wlt-inp:focus{border-color:#10B981}',
    '.wlt-textarea{width:100%;min-height:70px;resize:vertical;padding:11px 13px;border-radius:10px;margin:8px 0}',
    '/* Secure & info notes (shared) */',
    '.wlt-secure-note{display:flex;align-items:center;gap:7px;padding:9px 12px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:10px;font-size:11.5px;color:var(--text-primary);line-height:1.5}',
    '.wlt-secure-note b{font-weight:700}',
    '.wlt-info-note{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--text-muted);padding:4px 2px;line-height:1.4}',
    '/* Summary card (shared) */',
    '.wlt-sum-card{background:var(--bg-phone-secondary);border-radius:12px;padding:11px 13px;display:flex;flex-direction:column;gap:7px}',
    '.wlt-sum-row{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;gap:12px}',
    '.wlt-sum-row span{color:var(--text-muted);font-weight:600}',
    '.wlt-sum-row b{color:var(--text-primary);font-weight:700;font-variant-numeric:tabular-nums}',
    '.wlt-sum-row--hl{padding-top:7px;border-top:1px dashed var(--border-soft);margin-top:4px}',
    '.wlt-sum-row--hl b{color:#10B981;font-size:15px}'
  );

  // ── P5.5 Yükleme akışı ──
  parts.push(
    '/* Amount card (shared load + share) */',
    '.wlt-amount-card{background:linear-gradient(135deg,rgba(16,185,129,.08),rgba(139,92,246,.06));border:1px solid var(--border-soft);border-radius:14px;padding:14px 13px;display:flex;flex-direction:column;gap:8px}',
    '.wlt-amount-lbl{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase}',
    '.wlt-amount-input{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-phone);border-radius:12px;border:2px solid transparent;transition:border-color .18s}',
    '.wlt-amount-input:focus-within{border-color:#10B981}',
    '.wlt-amount-input input{flex:1;border:none;background:transparent;color:var(--text-primary);font-size:28px;font-weight:800;outline:none;font-variant-numeric:tabular-nums}',
    '.wlt-amount-coin{font-size:22px}',
    '.wlt-amount-tl{font-size:12px;color:var(--text-muted);font-weight:600;text-align:right}',
    '/* Preset chips */',
    '.wlt-preset-lbl{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;margin-top:4px}',
    '.wlt-preset-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}',
    '.wlt-preset-chip{padding:9px 4px;border:1.5px solid var(--border-soft);background:var(--bg-phone);color:var(--text-primary);border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;transition:all .18s;font-family:inherit}',
    '.wlt-preset-chip:active{transform:scale(.94)}',
    '.wlt-preset-chip.active{border-color:#10B981;background:#10B98115;color:#10B981}',
    '.wlt-preset-chip span{font-size:11px}',
    '/* Saved cards list */',
    '.wlt-cards-list{display:flex;flex-direction:column;gap:7px}',
    '.wlt-card-row{display:flex;align-items:center;gap:11px;padding:11px 12px;background:var(--bg-phone);border:1.5px solid var(--border-soft);border-radius:12px;cursor:pointer;transition:all .15s}',
    '.wlt-card-row:active{transform:scale(.98)}',
    '.wlt-card-row.active{border-color:#10B981;background:#10B98108}',
    '.wlt-card-brand{width:42px;height:28px;border-radius:5px;color:#fff;font-size:10px;font-weight:800;letter-spacing:.6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '.wlt-card-brand--new{background:var(--bg-phone-secondary);color:var(--text-muted);border:1.5px dashed var(--border-soft)}',
    '.wlt-card-new{border-style:dashed}',
    '.wlt-card-num{font-size:12.5px;font-weight:700;color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:1px}',
    '.wlt-card-meta{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.wlt-card-check{flex-shrink:0}',
    '/* New card form */',
    '.wlt-new-card-form{background:var(--bg-phone-secondary);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;margin-top:-4px}',
    '.wlt-new-card-form .wlt-inp{background:var(--bg-phone)}',
    '.wlt-save-lbl{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-primary);cursor:pointer;padding:2px 0}',
    '.wlt-save-lbl input{accent-color:#10B981}',
    '/* 3D Secure */',
    '.wlt-3d-body{align-items:center;padding:18px 18px 22px}',
    '.wlt-3d-box{width:100%;padding:22px 18px;background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border:1.5px solid rgba(16,185,129,.25);border-radius:16px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center}',
    '.wlt-3d-logo{display:inline-block;padding:4px 10px;background:#fff;border:1.5px solid #10B981;color:#059669;border-radius:8px;font-size:11px;font-weight:800;letter-spacing:.6px}',
    '.wlt-3d-title{font-size:16px;font-weight:800;color:#064E3B;margin-top:4px}',
    '.wlt-3d-sub{font-size:12px;color:#047857;line-height:1.5;max-width:280px}',
    '.wlt-3d-code-wrap{width:100%;display:flex;justify-content:center;padding:6px 0}',
    '.wlt-3d-code{width:100%;max-width:260px;padding:14px;border:1.5px solid rgba(16,185,129,.3);background:#fff;color:#064E3B;border-radius:12px;font-size:24px;font-weight:800;text-align:center;letter-spacing:10px;outline:none;font-variant-numeric:tabular-nums;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '.wlt-3d-code:focus{border-color:#10B981}',
    '.wlt-3d-timer{font-size:11px;color:#047857;display:inline-flex;align-items:center;gap:4px;font-weight:600}',
    '/* Success */',
    '.wlt-success-body{align-items:center;text-align:center;padding:24px 18px}',
    '.wlt-success-ico{margin-bottom:4px;animation:wltPop .42s ease}',
    '@keyframes wltPop{0%{transform:scale(0)}70%{transform:scale(1.18)}100%{transform:scale(1)}}',
    '.wlt-success-title{font-size:19px;font-weight:800;color:var(--text-primary);margin-bottom:4px}',
    '.wlt-success-sub{font-size:12.5px;color:var(--text-muted);margin-bottom:14px;line-height:1.4}',
    '.wlt-success-box{width:100%;background:var(--bg-phone-secondary);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;text-align:left;margin-bottom:12px}'
  );

  // ── P5.6 Share akışı ──
  parts.push(
    '/* Search */',
    '.wlt-search{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-phone-secondary);border-radius:12px}',
    '.wlt-search input{flex:1;border:none;background:transparent;color:var(--text-primary);font-size:13px;outline:none}',
    '/* Friend list */',
    '.wlt-friend-list{display:flex;flex-direction:column;gap:7px;max-height:440px;overflow-y:auto}',
    '.wlt-friend-row{display:flex;align-items:center;gap:11px;padding:10px 12px;background:var(--bg-phone);border:1px solid var(--border-soft);border-radius:12px;cursor:pointer;transition:transform .15s}',
    '.wlt-friend-row:active{transform:scale(.98)}',
    '.wlt-friend-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--bg-phone-secondary);flex-shrink:0}',
    '.wlt-friend-name{font-size:13px;font-weight:700;color:var(--text-primary);display:inline-flex;align-items:center;gap:5px}',
    '.wlt-friend-badge{font-size:11px}',
    '.wlt-friend-handle{font-size:10.5px;color:var(--text-muted);margin-top:2px;display:inline-flex;align-items:center;gap:4px}',
    '.wlt-mutual-pill{display:inline-flex;align-items:center;font-size:9.5px;font-weight:700;color:#8B5CF6;background:#8B5CF615;padding:1px 6px;border-radius:5px;letter-spacing:.3px}',
    '.wlt-empty-small{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 14px;color:var(--text-muted);font-size:12px;text-align:center}',
    '/* Recipient summary (step 2) */',
    '.wlt-recipient{display:flex;align-items:center;gap:10px;padding:11px 12px;background:#8B5CF608;border:1px solid #8B5CF630;border-radius:12px}',
    '/* Limit info 3-col */',
    '.wlt-limit-info{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:var(--bg-phone-secondary);border-radius:12px;padding:11px 10px}',
    '.wlt-limit-info > div{text-align:center}',
    '.wlt-limit-info span{display:block;font-size:9.5px;color:var(--text-muted);font-weight:600;letter-spacing:.3px;text-transform:uppercase;margin-bottom:3px}',
    '.wlt-limit-info b{display:block;font-size:13px;font-weight:800;color:var(--text-primary);font-variant-numeric:tabular-nums}',
    '/* Note */',
    '.wlt-note-wrap{display:flex;flex-direction:column;gap:4px}',
    '.wlt-note-lbl{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.4px;text-transform:uppercase;padding-left:2px}',
    '.wlt-note-wrap .wlt-inp{background:var(--bg-phone)}',
    '.wlt-note-counter{font-size:10px;color:var(--text-muted);text-align:right;font-variant-numeric:tabular-nums}',
    '/* Error note */',
    '.wlt-err-note{display:flex;align-items:center;gap:6px;padding:9px 11px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px;color:#991B1B;font-size:11.5px;font-weight:600}',
    '/* Confirm hero (step 3) */',
    '.wlt-confirm-hero{padding:18px 14px 14px;border-radius:16px;background:linear-gradient(135deg,#8B5CF610,#A855F710);border:1px solid #8B5CF625;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}',
    '.wlt-confirm-amt{font-size:34px;font-weight:800;color:#7C3AED;font-variant-numeric:tabular-nums;line-height:1;text-shadow:0 1px 2px rgba(124,58,237,.15)}',
    '.wlt-confirm-amt span{font-size:24px;margin-left:2px}',
    '.wlt-confirm-sub{font-size:12px;color:var(--text-muted);font-weight:600;margin-top:2px}',
    '/* Warn note */',
    '.wlt-warn-note{display:flex;align-items:center;gap:7px;padding:10px 12px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.22);border-radius:10px;font-size:11.5px;color:#92400E;line-height:1.5}',
    '.wlt-warn-note b{font-weight:700}'
  );

  // ── P5.7 Detay modal ──
  parts.push(
    '/* Detail hero (dynamic gradient on element) */',
    '.wlt-det-hero{position:relative;padding:22px 16px 18px;color:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}',
    '.wlt-close{position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.22);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;cursor:pointer}',
    '.wlt-det-source{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;background:rgba(0,0,0,.22);border-radius:999px;font-size:10.5px;font-weight:700;letter-spacing:.3px;backdrop-filter:blur(4px)}',
    '.wlt-det-amount{font-size:40px;font-weight:800;line-height:1;text-shadow:0 1px 3px rgba(0,0,0,.22);font-variant-numeric:tabular-nums;margin-top:6px}',
    '.wlt-det-amount span{font-size:26px;margin-left:2px}',
    '.wlt-det-amount-tl{font-size:11.5px;opacity:.9}',
    '.wlt-det-cp{font-size:15px;font-weight:700;margin-top:8px;text-shadow:0 1px 2px rgba(0,0,0,.15)}',
    '.wlt-det-date{font-size:10.5px;opacity:.82;margin-top:1px}',
    '/* Detail body */',
    '.wlt-det-body{padding:14px 16px 18px;display:flex;flex-direction:column;gap:10px}',
    '/* Balance compare */',
    '.wlt-bal-compare{background:var(--bg-phone-secondary);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:4px}',
    '.wlt-bc-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0}',
    '.wlt-bc-lbl{font-size:11.5px;color:var(--text-muted);font-weight:600}',
    '.wlt-bc-val{font-size:13.5px;font-weight:700;color:var(--text-primary);font-variant-numeric:tabular-nums}',
    '.wlt-bc-row--hl .wlt-bc-val{color:#10B981;font-size:16px;font-weight:800}',
    '.wlt-bc-arrow{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums}',
    '/* Detail actions */',
    '.wlt-det-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}',
    '/* Mono ID */',
    '.wlt-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.5px;font-size:11.5px}'
  );

  // ── P5.8 Confirm popup + info + şikayet ──
  parts.push(
    '/* Confirm popup backdrop */',
    '.wlt-confirm-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:97;opacity:0;transition:opacity .22s;padding:16px}',
    '.wlt-confirm-backdrop.open{opacity:1}',
    '.wlt-confirm{width:100%;max-width:380px;background:var(--bg-phone);border-radius:18px;padding:22px 20px 18px;text-align:center;transform:scale(.9);transition:transform .25s cubic-bezier(.2,.9,.25,1);max-height:90vh;overflow-y:auto}',
    '.wlt-confirm-backdrop.open .wlt-confirm{transform:scale(1)}',
    '.wlt-confirm-icon{width:64px;height:64px;border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center}',
    '.wlt-confirm-title{font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:6px}',
    '.wlt-confirm-msg{font-size:12.5px;color:var(--text-primary);line-height:1.55;margin-bottom:10px;padding:0 4px}',
    '.wlt-confirm-msg b{font-weight:700}',
    '.wlt-confirm-meta{font-size:11px;color:var(--text-muted);background:var(--bg-phone-secondary);padding:8px 10px;border-radius:10px;margin-bottom:12px;font-variant-numeric:tabular-nums}',
    '.wlt-confirm-btns{display:flex;gap:8px}',
    '.wlt-confirm-btns .wlt-btn-ghost{flex:1;padding:11px;text-align:center}',
    '/* Info popup rows */',
    '.wlt-info-modal{max-width:400px}',
    '.wlt-info-body{display:flex;flex-direction:column;gap:10px;text-align:left;margin:4px 0 14px}',
    '.wlt-info-row{display:flex;gap:8px;padding:10px 12px;background:var(--bg-phone-secondary);border-radius:10px;font-size:12px;color:var(--text-primary);line-height:1.55}',
    '.wlt-info-row b{font-weight:700}'
  );

  s.textContent = parts.join('\n');
  document.head.appendChild(s);
}

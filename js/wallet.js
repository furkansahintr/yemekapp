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

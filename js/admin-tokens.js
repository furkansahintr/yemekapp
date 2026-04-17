/* ═══════════════════════════════════════════════════════════
   ADMIN TOKENS — Token Yönetimi
   (1 Token = 1 TL • İşletme listesi • Ledger • Hediye Etme)
   ═══════════════════════════════════════════════════════════ */

/* ── State ── */
var _tkn = {
  view: 'list',                  // 'list' | 'detail'
  search: '',
  balanceFilter: '',             // '' | 'low' | 'medium' | 'high'
  cityFilter: '',
  detailId: null,
  // Gift modal
  giftOpen: false,
  giftAmount: '',
  giftBizNote: '',
  giftAdminNote: '',
  confirmOpen: false
};

/* ═══ Overlay Aç ═══ */
function _admOpenTokens() {
  _admInjectStyles();
  _tknInjectStyles();
  var adminPhone = document.getElementById('adminPhone');
  if (!adminPhone) return;
  var existing = adminPhone.querySelector('.prof-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg-phone);display:flex;flex-direction:column;z-index:78;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'tknOverlay';
  adminPhone.appendChild(overlay);

  _tkn.view = 'list';
  _tkn.search = '';
  _tkn.balanceFilter = '';
  _tkn.cityFilter = '';
  _tknRender();
}

function _tknCloseOverlay() {
  var o = document.getElementById('tknOverlay');
  if (o) o.remove();
  _tknCloseGift();
  _tknCloseConfirm();
}

/* ═══ Ana Render ═══ */
function _tknRender() {
  var o = document.getElementById('tknOverlay');
  if (!o) return;

  var biz = _tkn.detailId ? _tknBiz(_tkn.detailId) : null;
  var isDetail = _tkn.view === 'detail' && biz;

  var title = isDetail ? biz.name : 'Token Yönetimi';
  var sub = isDetail ? (biz.owner + ' · ' + biz.city) : 'İşletme token bakiyeleri ve hediye işlemleri';

  var h = '<div class="tkn-header">'
    + '<div class="tkn-back" onclick="' + (isDetail ? '_tknGoBack()' : '_tknCloseOverlay()') + '">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:18px;color:#EAB308"></iconify-icon>'
    + '<div class="tkn-title">' + _tknEsc(title) + '</div>'
    + '</div>'
    + '<div class="tkn-sub">' + _tknEsc(sub) + '</div>'
    + '</div>'
    + (isDetail
        ? '<button class="tkn-gift-btn" onclick="_tknOpenGift(\'' + biz.id + '\')">'
          + '<iconify-icon icon="solar:gift-bold" style="font-size:15px"></iconify-icon>Hediye Et</button>'
        : '')
    + '</div>'
    + '<div id="tknBody" style="flex:1"></div>';

  o.innerHTML = h;
  _tknRenderBody();
}

function _tknRenderBody() {
  var body = document.getElementById('tknBody');
  if (!body) return;
  if (_tkn.view === 'list') body.innerHTML = _tknRenderList();
  else body.innerHTML = _tknRenderDetail();
}

function _tknGoBack() {
  _tkn.view = 'list';
  _tkn.detailId = null;
  _tknRender();
}

/* ═══ Helpers ═══ */
function _tknEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _tknBiz(id) {
  return ADMIN_BUSINESSES.find(function(b) { return b.id === id; });
}

function _tknFmt(n) {
  if (n === null || n === undefined) return '0';
  var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n < 0 ? '-' + s : s;
}

function _tknDate(iso) {
  if (typeof _admDate === 'function') return _admDate(iso);
  return new Date(iso).toLocaleString('tr-TR');
}

function _tknRelative(iso) {
  if (typeof _admRelative === 'function') return _admRelative(iso);
  return iso;
}

function _tknBalanceStatus(balance) {
  if (balance < ADMIN_TOKEN_CONFIG.lowBalanceThreshold) return 'low';
  if (balance < ADMIN_TOKEN_CONFIG.warningThreshold) return 'medium';
  return 'high';
}

/* ═══════════════════════════════════════
   P2 — Ana Liste + Info Box + Filtreler
   ═══════════════════════════════════════ */
function _tknRenderList() {
  var C = ADMIN_TOKEN_CONFIG;

  // Toplam istatistikler
  var totalBalance = 0;
  var lowCount = 0;
  for (var i = 0; i < ADMIN_BUSINESSES.length; i++) {
    totalBalance += ADMIN_BUSINESSES[i].tokenBalance || 0;
    if ((ADMIN_BUSINESSES[i].tokenBalance || 0) < C.lowBalanceThreshold) lowCount++;
  }

  var h = '<div class="adm-fadeIn tkn-wrap">';

  // Info Box — Döviz sabitliği
  h += '<div class="tkn-info-box">'
    + '<div class="tkn-info-ico"><iconify-icon icon="solar:coin-bold" style="font-size:22px;color:#fff"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="tkn-info-label">Sistem Parametresi</div>'
    + '<div class="tkn-info-formula"><b>1 Token</b> = <b>' + C.exchangeRate.toFixed(2) + ' ' + C.currency + '</b></div>'
    + '<div class="tkn-info-sub">Platform genelinde geçerli sabit kur · Değiştirilemez</div>'
    + '</div>'
    + '</div>';

  // Özet 2 kart
  h += '<div class="tkn-summary">'
    + '<div class="tkn-sum-card">'
    + '<div class="tkn-sum-lbl">Toplam Dolaşım</div>'
    + '<div class="tkn-sum-val">' + _tknFmt(totalBalance) + ' <span>Tkn</span></div>'
    + '<div class="tkn-sum-sub">≈ ' + C.currency + _tknFmt(totalBalance) + ' · ' + ADMIN_BUSINESSES.length + ' işletme</div>'
    + '</div>'
    + '<div class="tkn-sum-card tkn-sum-card--warn">'
    + '<div class="tkn-sum-lbl"><iconify-icon icon="solar:danger-triangle-linear" style="font-size:11px"></iconify-icon>Düşük Bakiye</div>'
    + '<div class="tkn-sum-val" style="color:' + (lowCount > 0 ? '#EF4444' : '#22C55E') + '">' + lowCount + '</div>'
    + '<div class="tkn-sum-sub">&lt; ' + C.lowBalanceThreshold + ' Tkn olan işletme</div>'
    + '</div>'
    + '</div>';

  // Search
  h += '<div style="position:relative">'
    + '<iconify-icon icon="solar:magnifer-linear" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--text-muted)"></iconify-icon>'
    + '<input class="tkn-search" placeholder="İşletme adı, sahip veya şehir..." value="' + _tknEsc(_tkn.search) + '" oninput="_tkn.search=this.value;_tknRenderBody()" />'
    + '</div>';

  // Bakiye filtre chip'leri
  h += '<div class="tkn-chip-row">'
    + '<span class="tkn-chip-label">Bakiye:</span>'
    + _tknBalChip('', 'Tümü')
    + _tknBalChip('low', 'Düşük (<' + C.lowBalanceThreshold + ')')
    + _tknBalChip('medium', 'Orta')
    + _tknBalChip('high', 'Yüksek')
    + '</div>';

  // Şehir filtresi
  var cities = [];
  for (var ci = 0; ci < ADMIN_BUSINESSES.length; ci++) {
    if (cities.indexOf(ADMIN_BUSINESSES[ci].city) === -1) cities.push(ADMIN_BUSINESSES[ci].city);
  }
  cities.sort();
  h += '<div class="tkn-chip-row">'
    + '<span class="tkn-chip-label">Şehir:</span>'
    + '<button class="tkn-chip' + (!_tkn.cityFilter ? ' active' : '') + '" onclick="_tkn.cityFilter=\'\';_tknRenderBody()">Tümü</button>';
  for (var cj = 0; cj < cities.length; cj++) {
    var sel = _tkn.cityFilter === cities[cj];
    h += '<button class="tkn-chip' + (sel ? ' active' : '') + '" onclick="_tkn.cityFilter=\'' + cities[cj] + '\';_tknRenderBody()">' + _tknEsc(cities[cj]) + '</button>';
  }
  h += '</div>';

  // Liste
  var list = _tknFilterBusinesses();
  h += '<div class="tkn-list-head">'
    + '<span>' + list.length + ' işletme</span>'
    + (_tkn.balanceFilter === 'low' && list.length > 0
        ? '<button class="tkn-reminder-btn" onclick="_tknSendReminders()"><iconify-icon icon="solar:letter-opened-bold" style="font-size:12px"></iconify-icon>Hatırlatma Gönder (' + list.length + ')</button>'
        : '')
    + '</div>';

  if (list.length === 0) {
    h += '<div class="tkn-empty"><iconify-icon icon="solar:inbox-linear" style="font-size:40px;opacity:0.3"></iconify-icon><div>Eşleşen işletme yok</div></div>';
  } else {
    h += '<div class="tkn-list">';
    for (var l = 0; l < list.length; l++) h += _tknBizRow(list[l]);
    h += '</div>';
  }

  h += '</div>';
  return h;
}

function _tknBalChip(id, label) {
  var sel = _tkn.balanceFilter === id;
  var accent = id === 'low' ? '#EF4444' : id === 'high' ? '#22C55E' : id === 'medium' ? '#F59E0B' : '';
  return '<button class="tkn-chip' + (sel ? ' active' : '') + '" '
    + 'style="' + (sel && accent ? 'border-color:' + accent + ';background:' + accent + '18;color:' + accent : '') + '" '
    + 'onclick="_tkn.balanceFilter=\'' + id + '\';_tknRenderBody()">' + label + '</button>';
}

function _tknFilterBusinesses() {
  var list = ADMIN_BUSINESSES.slice();
  var C = ADMIN_TOKEN_CONFIG;

  if (_tkn.balanceFilter === 'low') {
    list = list.filter(function(b) { return (b.tokenBalance || 0) < C.lowBalanceThreshold; });
  } else if (_tkn.balanceFilter === 'medium') {
    list = list.filter(function(b) {
      var bb = b.tokenBalance || 0;
      return bb >= C.lowBalanceThreshold && bb < C.warningThreshold;
    });
  } else if (_tkn.balanceFilter === 'high') {
    list = list.filter(function(b) { return (b.tokenBalance || 0) >= C.warningThreshold; });
  }
  if (_tkn.cityFilter) list = list.filter(function(b) { return b.city === _tkn.cityFilter; });
  if (_tkn.search.trim()) {
    var q = _tkn.search.toLowerCase().trim();
    list = list.filter(function(b) {
      return b.name.toLowerCase().indexOf(q) > -1
        || (b.owner && b.owner.toLowerCase().indexOf(q) > -1)
        || (b.city && b.city.toLowerCase().indexOf(q) > -1);
    });
  }
  // Bakiyeye göre sırala — yüksekten düşüğe
  list.sort(function(a, b) { return (b.tokenBalance || 0) - (a.tokenBalance || 0); });
  return list;
}

function _tknBizRow(b) {
  var bal = b.tokenBalance || 0;
  var status = _tknBalanceStatus(bal);
  var statusColor = status === 'low' ? '#EF4444' : status === 'medium' ? '#F59E0B' : '#22C55E';

  return '<div class="tkn-biz-row tkn-biz-row--' + status + '" onclick="_tknOpenDetail(\'' + b.id + '\')">'
    + '<div class="tkn-biz-avatar">' + _tknEsc(b.name.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="tkn-biz-name">' + _tknEsc(b.name) + '</span>'
    + (status === 'low' ? '<span class="tkn-low-badge"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:9px"></iconify-icon>DÜŞÜK</span>' : '')
    + '</div>'
    + '<div class="tkn-biz-meta">' + _tknEsc(b.owner) + ' · ' + _tknEsc(b.city) + ' · ' + b.branches + ' şube</div>'
    + '</div>'
    + '<div class="tkn-biz-bal" style="color:' + statusColor + '">'
    + '<div class="tkn-biz-bal-val">' + _tknFmt(bal) + '</div>'
    + '<div class="tkn-biz-bal-lbl">Token</div>'
    + '</div>'
    + '</div>';
}

function _tknSendReminders() {
  var list = _tknFilterBusinesses();
  if (list.length === 0) return;
  if (!confirm(list.length + ' işletmeye token yükleme hatırlatması gönderilsin mi?')) return;
  _admToast(list.length + ' hatırlatma gönderildi', 'ok');
}

/* ═══════════════════════════════════════
   P3 — Detay + Ledger Timeline
   ═══════════════════════════════════════ */
function _tknOpenDetail(id) {
  _tkn.detailId = id;
  _tkn.view = 'detail';
  _tknRender();
}

function _tknRenderDetail() {
  var b = _tknBiz(_tkn.detailId);
  if (!b) return '';
  var bal = b.tokenBalance || 0;
  var status = _tknBalanceStatus(bal);
  var statusColor = status === 'low' ? '#EF4444' : status === 'medium' ? '#F59E0B' : '#22C55E';

  // Hareketler
  var ledger = (b.walletHistory || []).slice();
  ledger.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  // Net akış (son 30 gün)
  var netIn = 0, netOut = 0;
  for (var i = 0; i < ledger.length; i++) {
    var a = ledger[i].amount || 0;
    if (a > 0) netIn += a; else netOut += Math.abs(a);
  }

  var h = '<div class="adm-fadeIn tkn-wrap">';

  // İşletme kimlik kartı
  h += '<div class="tkn-biz-card">'
    + '<div class="tkn-biz-card-avatar" style="background:linear-gradient(135deg,#8B5CF6,#A78BFA)">' + _tknEsc(b.name.charAt(0)) + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="tkn-biz-card-name">' + _tknEsc(b.name) + '</div>'
    + '<div class="tkn-biz-card-meta">' + _tknEsc(b.owner) + ' · ' + _tknEsc(b.city) + ' · ' + b.branches + ' şube'
    + (b.ownerPhone ? ' · <a href="tel:' + b.ownerPhone + '" style="color:#8B5CF6">' + _tknEsc(b.ownerPhone) + '</a>' : '')
    + '</div>'
    + '</div>'
    + '</div>';

  // Büyük bakiye kartı
  h += '<div class="tkn-balance-hero tkn-balance-hero--' + status + '">'
    + '<div class="tkn-bh-top">'
    + '<iconify-icon icon="solar:coin-bold" style="font-size:18px"></iconify-icon>'
    + '<span>GÜNCEL BAKİYE</span>'
    + (status === 'low' ? '<span class="tkn-bh-warn"><iconify-icon icon="solar:danger-triangle-bold" style="font-size:11px"></iconify-icon>Düşük</span>' : '')
    + '</div>'
    + '<div class="tkn-bh-value">'
    + '<span class="tkn-bh-num">' + _tknFmt(bal) + '</span>'
    + '<span class="tkn-bh-unit">Token</span>'
    + '</div>'
    + '<div class="tkn-bh-eq">≈ ₺' + _tknFmt(bal * ADMIN_TOKEN_CONFIG.exchangeRate) + '</div>'
    + '<div class="tkn-bh-flow">'
    + '<div class="tkn-bh-flow-item"><iconify-icon icon="solar:arrow-down-linear" style="font-size:11px;color:#22C55E"></iconify-icon><span>Giriş</span><b style="color:#22C55E">+' + _tknFmt(netIn) + '</b></div>'
    + '<div class="tkn-bh-flow-sep"></div>'
    + '<div class="tkn-bh-flow-item"><iconify-icon icon="solar:arrow-up-linear" style="font-size:11px;color:#EF4444"></iconify-icon><span>Çıkış</span><b style="color:#EF4444">-' + _tknFmt(netOut) + '</b></div>'
    + '</div>'
    + '</div>';

  // Ledger
  h += '<div class="tkn-sect">'
    + '<div class="tkn-sect-head">'
    + '<iconify-icon icon="solar:round-transfer-horizontal-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
    + '<span>Token Geçmişi (Ledger)</span>'
    + '<span class="tkn-sect-badge">' + ledger.length + ' hareket</span>'
    + '</div>';

  if (ledger.length === 0) {
    h += '<div class="tkn-empty"><iconify-icon icon="solar:inbox-linear" style="font-size:40px;opacity:0.3"></iconify-icon><div>Henüz hareket yok</div></div>';
  } else {
    h += '<div class="tkn-ledger">';
    for (var j = 0; j < ledger.length; j++) {
      h += _tknLedgerRow(ledger[j]);
    }
    h += '</div>';
  }
  h += '</div>';

  h += '</div>';
  return h;
}

function _tknLedgerRow(entry) {
  var typeMeta = {
    topup:      { label:'Token Yükleme', color:'#22C55E', icon:'solar:wallet-money-bold' },
    gift:       { label:'Admin Hediyesi', color:'#8B5CF6', icon:'solar:gift-bold' },
    earn:       { label:'Kazanım',        color:'#06B6D4', icon:'solar:star-bold' },
    refund:     { label:'İade',           color:'#22C55E', icon:'solar:refresh-circle-bold' },
    commission: { label:'Komisyon',       color:'#F97316', icon:'solar:pie-chart-2-bold' },
    penalty:    { label:'Ceza',           color:'#EF4444', icon:'solar:shield-warning-bold' }
  };
  var meta = typeMeta[entry.type] || { label:entry.type, color:'#6B7280', icon:'solar:document-bold' };
  var isPositive = (entry.amount || 0) > 0;
  var amountColor = isPositive ? '#22C55E' : '#EF4444';
  var sign = isPositive ? '+' : '';

  return '<div class="tkn-ledger-row">'
    + '<div class="tkn-ledger-ico" style="background:' + meta.color + '18;color:' + meta.color + '">'
    + '<iconify-icon icon="' + meta.icon + '" style="font-size:14px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="tkn-ledger-head">'
    + '<span class="tkn-ledger-type" style="color:' + meta.color + '">' + meta.label + '</span>'
    + (entry.byAdmin ? '<span class="tkn-ledger-admin"><iconify-icon icon="solar:shield-user-bold" style="font-size:9px"></iconify-icon>ADMIN</span>' : '')
    + '</div>'
    + '<div class="tkn-ledger-desc">' + _tknEsc(entry.desc || '') + '</div>'
    + '<div class="tkn-ledger-date">' + _tknRelative(entry.date) + '</div>'
    + '</div>'
    + '<div class="tkn-ledger-amount" style="color:' + amountColor + '">' + sign + _tknFmt(entry.amount) + '</div>'
    + '</div>';
}

/* ═══════════════════════════════════════
   P4 — Token Hediye Modal + Confirm
   ═══════════════════════════════════════ */
function _tknOpenGift(bizId) {
  _tknCloseGift();
  var b = _tknBiz(bizId);
  if (!b) return;
  _tkn.detailId = bizId;
  _tkn.giftAmount = '';
  _tkn.giftBizNote = '';
  _tkn.giftAdminNote = '';
  _tkn.giftOpen = true;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'tknGift';
  m.className = 'tkn-modal-backdrop';
  m.onclick = function(e) { if (e.target === m) _tknCloseGift(); };
  m.innerHTML = '<div class="tkn-modal"><div id="tknGiftBody" class="tkn-modal-body"></div></div>';
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
  _tknRenderGift();
}

function _tknCloseGift() {
  var m = document.getElementById('tknGift');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _tkn.giftOpen = false;
}

function _tknRenderGift() {
  var body = document.getElementById('tknGiftBody');
  if (!body) return;
  var b = _tknBiz(_tkn.detailId);
  if (!b) return;

  var amt = parseFloat(_tkn.giftAmount);
  var isValid = !isNaN(amt) && amt > 0;
  var newBal = (b.tokenBalance || 0) + (isValid ? amt : 0);

  // Hızlı miktar preset'leri
  var presets = [100, 250, 500, 1000, 2500, 5000];

  var h = '<div class="tkn-mhead">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<div class="tkn-mhead-ico" style="background:linear-gradient(135deg,#8B5CF6,#EC4899)">'
    + '<iconify-icon icon="solar:gift-bold" style="font-size:18px;color:#fff"></iconify-icon>'
    + '</div>'
    + '<div><div class="tkn-mtitle">Token Hediye Et</div>'
    + '<div class="tkn-msub">' + _tknEsc(b.name) + ' · Şu anki bakiye: <b>' + _tknFmt(b.tokenBalance) + '</b></div></div>'
    + '</div>'
    + '<div class="tkn-close" onclick="_tknCloseGift()"><iconify-icon icon="solar:close-circle-bold" style="font-size:20px"></iconify-icon></div>'
    + '</div>';

  // Miktar girişi
  h += '<div class="tkn-sect">'
    + '<div class="tkn-sect-head"><iconify-icon icon="solar:coin-bold" style="font-size:14px;color:#EAB308"></iconify-icon><span>Hediye Miktarı</span></div>'
    + '<div class="tkn-amt-wrap">'
    + '<input type="number" class="tkn-amt-input" placeholder="0" min="1" step="1" value="' + _tknEsc(_tkn.giftAmount) + '" oninput="_tkn.giftAmount=this.value;_tknRenderGift();this.focus();this.setSelectionRange(this.value.length, this.value.length)" />'
    + '<span class="tkn-amt-unit">Token</span>'
    + '</div>';

  // Preset butonlar
  h += '<div class="tkn-preset-row">';
  for (var p = 0; p < presets.length; p++) {
    var sel = amt === presets[p];
    h += '<button class="tkn-preset-btn' + (sel ? ' active' : '') + '" onclick="_tkn.giftAmount=\'' + presets[p] + '\';_tknRenderGift()">+' + _tknFmt(presets[p]) + '</button>';
  }
  h += '</div>';

  if (isValid) {
    h += '<div class="tkn-new-bal">'
      + '<span>Yeni bakiye:</span>'
      + '<b>' + _tknFmt(newBal) + ' Tkn</b>'
      + '<span style="color:#22C55E">+' + _tknFmt(amt) + '</span>'
      + '</div>';
  }
  h += '</div>';

  // İşletme notu
  h += '<div class="tkn-sect">'
    + '<div class="tkn-sect-head"><iconify-icon icon="solar:shop-linear" style="font-size:14px;color:#3B82F6"></iconify-icon><span>İşletme Notu</span>'
    + '<span class="tkn-lbl-hint">(işletme sahibi görür)</span></div>'
    + '<textarea class="tkn-textarea" placeholder="Örn: Kampanya başarınız için ödül token" oninput="_tkn.giftBizNote=this.value">' + _tknEsc(_tkn.giftBizNote) + '</textarea>'
    + '</div>';

  // Admin notu
  h += '<div class="tkn-sect">'
    + '<div class="tkn-sect-head"><iconify-icon icon="solar:shield-user-linear" style="font-size:14px;color:#8B5CF6"></iconify-icon><span>Admin Özel Notu</span>'
    + '<span class="tkn-lbl-hint">(sadece admin paneli)</span></div>'
    + '<textarea class="tkn-textarea tkn-textarea--admin" placeholder="Teknik not veya referans" oninput="_tkn.giftAdminNote=this.value">' + _tknEsc(_tkn.giftAdminNote) + '</textarea>'
    + '</div>';

  // CTA
  var ready = isValid && _tkn.giftBizNote.trim().length > 0;
  h += '<button class="tkn-gift-cta' + (ready ? '' : ' disabled') + '" ' + (ready ? '' : 'disabled ') + 'onclick="_tknOpenConfirm()">'
    + '<iconify-icon icon="solar:gift-bold" style="font-size:16px"></iconify-icon>'
    + 'Onayla ve Gönder</button>';

  body.innerHTML = h;
}

/* Confirm modal */
function _tknOpenConfirm() {
  _tknCloseConfirm();
  _tkn.confirmOpen = true;
  var b = _tknBiz(_tkn.detailId);
  var amt = parseFloat(_tkn.giftAmount);
  if (!b || !amt) return;

  var adminPhone = document.getElementById('adminPhone');
  var m = document.createElement('div');
  m.id = 'tknConfirm';
  m.className = 'tkn-modal-backdrop tkn-modal-backdrop--conf';
  m.onclick = function(e) { if (e.target === m) _tknCloseConfirm(); };

  var h = '<div class="tkn-modal tkn-modal--conf">'
    + '<div class="tkn-conf-head">'
    + '<div class="tkn-conf-ico"><iconify-icon icon="solar:gift-bold" style="font-size:28px;color:#fff"></iconify-icon></div>'
    + '<div class="tkn-conf-title">Hediye Onayı</div>'
    + '<div class="tkn-conf-sub">İşlem anlık olarak bakiyeye yansıtılacak</div>'
    + '</div>'
    + '<div class="tkn-conf-body">'
    + '<div class="tkn-conf-target">'
    + '<div class="tkn-conf-avatar">' + _tknEsc(b.name.charAt(0)) + '</div>'
    + '<div><div class="tkn-conf-name">' + _tknEsc(b.name) + '</div>'
    + '<div class="tkn-conf-owner">' + _tknEsc(b.owner) + '</div></div>'
    + '</div>'
    + '<div class="tkn-conf-amt">'
    + '<span class="tkn-conf-plus">+</span>'
    + '<span class="tkn-conf-amt-val">' + _tknFmt(amt) + '</span>'
    + '<span class="tkn-conf-amt-unit">Token</span>'
    + '</div>'
    + '<div class="tkn-conf-eq">≈ ₺' + _tknFmt(amt * ADMIN_TOKEN_CONFIG.exchangeRate) + '</div>'
    + '<div class="tkn-conf-bal">'
    + '<div><span>Mevcut</span><b>' + _tknFmt(b.tokenBalance) + '</b></div>'
    + '<iconify-icon icon="solar:arrow-right-bold" style="font-size:14px;color:var(--text-muted)"></iconify-icon>'
    + '<div><span>Yeni</span><b style="color:#22C55E">' + _tknFmt((b.tokenBalance || 0) + amt) + '</b></div>'
    + '</div>'
    + '<div class="tkn-conf-note">'
    + '<iconify-icon icon="solar:letter-linear" style="font-size:12px;color:#8B5CF6"></iconify-icon>'
    + '<span>"' + _tknEsc(_tkn.giftBizNote) + '"</span>'
    + '</div>'
    + '</div>'
    + '<div class="tkn-conf-btns">'
    + '<button class="tkn-conf-cancel" onclick="_tknCloseConfirm()">Vazgeç</button>'
    + '<button class="tkn-conf-apply" onclick="_tknApplyGift()">'
    + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px"></iconify-icon>Evet, Gönder</button>'
    + '</div>'
    + '</div>';

  m.innerHTML = h;
  adminPhone.appendChild(m);
  requestAnimationFrame(function() { m.classList.add('open'); });
}

function _tknCloseConfirm() {
  var m = document.getElementById('tknConfirm');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(function() { if (m.parentNode) m.remove(); }, 240);
  _tkn.confirmOpen = false;
}

function _tknApplyGift() {
  var b = _tknBiz(_tkn.detailId);
  var amt = parseFloat(_tkn.giftAmount);
  if (!b || !amt) return;

  b.tokenBalance = (b.tokenBalance || 0) + amt;
  if (!b.walletHistory) b.walletHistory = [];
  b.walletHistory.push({
    date: new Date().toISOString(),
    type: 'gift',
    amount: amt,
    desc: _tkn.giftBizNote,
    adminNote: _tkn.giftAdminNote,
    byAdmin: true
  });

  _admToast(_tknFmt(amt) + ' token ' + b.name + '\'e hediye edildi', 'ok');
  _tknCloseConfirm();
  _tknCloseGift();
  _tknRender();
}

/* ═══════════════════════════════════════
   P6 — Stiller (.tkn-*)
   ═══════════════════════════════════════ */
function _tknInjectStyles() {
  if (document.getElementById('tknStyles')) return;
  var css = ''
    + '.tkn-wrap{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}'
    /* Header */
    + '.tkn-header{position:sticky;top:0;background:var(--bg-phone);padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;z-index:10}'
    + '.tkn-back{width:32px;height:32px;border-radius:var(--r-md);background:var(--glass-card);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    + '.tkn-title{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:var(--text-primary)}'
    + '.tkn-sub{font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.tkn-gift-btn{padding:8px 12px;border:none;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 3px 10px rgba(139,92,246,0.35);flex-shrink:0;transition:transform .15s}'
    + '.tkn-gift-btn:active{transform:scale(0.97)}'
    /* Info box */
    + '.tkn-info-box{display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--r-xl);background:linear-gradient(135deg,#F59E0B,#FCD34D);color:#fff;box-shadow:0 4px 16px rgba(245,158,11,0.25)}'
    + '.tkn-info-ico{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.tkn-info-label{font:var(--fw-regular) 9px/1 var(--font);opacity:0.85;text-transform:uppercase;letter-spacing:.4px}'
    + '.tkn-info-formula{font:var(--fw-bold) 20px/1.1 var(--font);margin-top:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-info-sub{font:var(--fw-regular) 10px/1.3 var(--font);opacity:0.85;margin-top:4px}'
    /* Summary cards */
    + '.tkn-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.tkn-sum-card{padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);display:flex;flex-direction:column;gap:4px}'
    + '.tkn-sum-card--warn{background:linear-gradient(135deg,rgba(239,68,68,0.03),transparent)}'
    + '.tkn-sum-lbl{display:flex;align-items:center;gap:4px;font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px}'
    + '.tkn-sum-val{font:var(--fw-bold) 20px/1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-sum-val span{font:var(--fw-regular) 11px/1 var(--font);color:var(--text-muted);font-family:inherit;margin-left:2px}'
    + '.tkn-sum-sub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted)}'
    /* Search */
    + '.tkn-search{width:100%;box-sizing:border-box;padding:11px 12px 11px 36px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1 var(--font);color:var(--text-primary);outline:none;transition:border-color .15s}'
    + '.tkn-search:focus{border-color:#8B5CF6}'
    + '.tkn-chip-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.tkn-chip-label{font:var(--fw-semibold) 10px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;margin-right:2px}'
    + '.tkn-chip{padding:6px 11px;border-radius:var(--r-full);border:1px solid var(--border-subtle);background:transparent;color:var(--text-secondary);font:var(--fw-medium) 11px/1 var(--font);cursor:pointer;transition:all .15s;white-space:nowrap}'
    + '.tkn-chip:hover{background:var(--bg-phone-secondary)}'
    + '.tkn-chip.active{border-color:#8B5CF6;background:rgba(139,92,246,0.1);color:#8B5CF6}'
    /* List */
    + '.tkn-list-head{display:flex;align-items:center;justify-content:space-between;font:var(--fw-medium) var(--fs-xs)/1 var(--font);color:var(--text-muted)}'
    + '.tkn-reminder-btn{padding:6px 10px;border-radius:var(--r-full);border:1px solid #EF4444;background:rgba(239,68,68,0.08);color:#EF4444;font:var(--fw-semibold) 10px/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;gap:4px}'
    + '.tkn-reminder-btn:hover{background:#EF4444;color:#fff}'
    + '.tkn-empty{padding:48px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--text-muted);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font)}'
    + '.tkn-list{display:flex;flex-direction:column;gap:6px}'
    + '.tkn-biz-row{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--r-lg);background:var(--bg-phone);cursor:pointer;transition:all .15s}'
    + '.tkn-biz-row:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.06)}'
    + '.tkn-biz-row--low{border-left:3px solid #EF4444}'
    + '.tkn-biz-row--medium{border-left:3px solid #F59E0B}'
    + '.tkn-biz-row--high{border-left:3px solid #22C55E}'
    + '.tkn-biz-avatar{width:42px;height:42px;border-radius:var(--r-md);background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 16px/1 var(--font);flex-shrink:0}'
    + '.tkn-biz-name{font:var(--fw-semibold) var(--fs-sm)/1 var(--font);color:var(--text-primary)}'
    + '.tkn-low-badge{display:inline-flex;align-items:center;gap:3px;font:var(--fw-bold) 9px/1 var(--font);color:#EF4444;background:rgba(239,68,68,0.12);padding:3px 7px;border-radius:var(--r-full);letter-spacing:.3px}'
    + '.tkn-biz-meta{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.tkn-biz-bal{text-align:right;flex-shrink:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-biz-bal-val{font:var(--fw-bold) var(--fs-md)/1 var(--font)}'
    + '.tkn-biz-bal-lbl{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:.3px;font-family:inherit}';
  var s = document.createElement('style');
  s.id = 'tknStyles';
  s.textContent = css;
  document.head.appendChild(s);
  _tknInjectStylesPart2();
}

function _tknInjectStylesPart2() {
  if (document.getElementById('tknStyles2')) return;
  var css = ''
    /* Detail */
    + '.tkn-biz-card{display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--r-lg);background:var(--bg-phone);border:1px solid var(--border-subtle)}'
    + '.tkn-biz-card-avatar{width:52px;height:52px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 22px/1 var(--font);flex-shrink:0}'
    + '.tkn-biz-card-name{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.tkn-biz-card-meta{font:var(--fw-regular) 11px/1.3 var(--font);color:var(--text-muted);margin-top:5px}'
    /* Balance hero */
    + '.tkn-balance-hero{padding:20px;border-radius:var(--r-xl);color:#fff;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden}'
    + '.tkn-balance-hero--low{background:linear-gradient(135deg,#EF4444,#DC2626)}'
    + '.tkn-balance-hero--medium{background:linear-gradient(135deg,#F59E0B,#D97706)}'
    + '.tkn-balance-hero--high{background:linear-gradient(135deg,#22C55E,#16A34A)}'
    + '.tkn-bh-top{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) 10px/1 var(--font);opacity:0.9;text-transform:uppercase;letter-spacing:.4px}'
    + '.tkn-bh-top span{flex:1}'
    + '.tkn-bh-warn{display:inline-flex;align-items:center;gap:3px;font:var(--fw-bold) 9px/1 var(--font);background:rgba(255,255,255,0.25);padding:3px 7px;border-radius:var(--r-full)}'
    + '.tkn-bh-value{display:flex;align-items:baseline;gap:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-bh-num{font:var(--fw-bold) 42px/1 var(--font);font-family:inherit}'
    + '.tkn-bh-unit{font:var(--fw-semibold) 14px/1 var(--font);opacity:0.85;font-family:inherit}'
    + '.tkn-bh-eq{font:var(--fw-regular) 12px/1 var(--font);opacity:0.85;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-bh-flow{display:flex;align-items:center;gap:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.2);font:var(--fw-regular) 11px/1 var(--font)}'
    + '.tkn-bh-flow-item{display:flex;align-items:center;gap:5px}'
    + '.tkn-bh-flow-item span{opacity:0.8}'
    + '.tkn-bh-flow-item b{font:var(--fw-bold) 13px/1 var(--font);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-bh-flow-sep{width:1px;height:12px;background:rgba(255,255,255,0.25)}'
    /* Sect */
    + '.tkn-sect{background:var(--bg-phone);border:1px solid var(--border-subtle);border-radius:var(--r-lg);padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.tkn-sect-head{display:flex;align-items:center;gap:6px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);color:var(--text-primary)}'
    + '.tkn-sect-head span:first-of-type{flex:1}'
    + '.tkn-sect-badge{font:var(--fw-bold) 10px/1 var(--font);padding:4px 9px;border-radius:var(--r-full);background:rgba(139,92,246,0.12);color:#8B5CF6}'
    + '.tkn-lbl-hint{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);font-weight:400}'
    /* Ledger */
    + '.tkn-ledger{display:flex;flex-direction:column;gap:4px}'
    + '.tkn-ledger-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary);transition:background .15s}'
    + '.tkn-ledger-row:hover{background:rgba(139,92,246,0.05)}'
    + '.tkn-ledger-ico{width:34px;height:34px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
    + '.tkn-ledger-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}'
    + '.tkn-ledger-type{font:var(--fw-semibold) 10px/1 var(--font);text-transform:uppercase;letter-spacing:.3px}'
    + '.tkn-ledger-admin{font:var(--fw-bold) 9px/1 var(--font);padding:2px 6px;border-radius:var(--r-full);background:rgba(139,92,246,0.15);color:#8B5CF6;display:inline-flex;align-items:center;gap:3px;letter-spacing:.3px}'
    + '.tkn-ledger-desc{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-primary);margin-top:4px}'
    + '.tkn-ledger-date{font:var(--fw-regular) 10px/1 var(--font);color:var(--text-muted);margin-top:4px}'
    + '.tkn-ledger-amount{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font:var(--fw-bold) 14px/1 var(--font);flex-shrink:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    /* Modals */
    + '.tkn-modal-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0);z-index:90;transition:background .25s;display:flex;align-items:flex-end;justify-content:center}'
    + '.tkn-modal-backdrop.open{background:rgba(0,0,0,0.5)}'
    + '.tkn-modal-backdrop--conf.open{background:rgba(15,23,42,0.75)}'
    + '.tkn-modal{width:100%;max-height:92vh;background:var(--bg-phone);border-radius:var(--r-xl) var(--r-xl) 0 0;overflow:hidden;transform:translateY(100%);transition:transform .3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column}'
    + '.tkn-modal--conf{max-width:420px;border-radius:var(--r-xl);margin-bottom:16px}'
    + '.tkn-modal-backdrop.open .tkn-modal{transform:translateY(0)}'
    + '.tkn-modal-body{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.tkn-mhead{display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid var(--border-subtle);margin-bottom:4px}'
    + '.tkn-mhead-ico{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}'
    + '.tkn-mtitle{font:var(--fw-bold) var(--fs-md)/1.1 var(--font);color:var(--text-primary)}'
    + '.tkn-msub{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.tkn-close{width:32px;height:32px;border-radius:var(--r-md);background:var(--border-subtle);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)}'
    /* Amount input */
    + '.tkn-amt-wrap{display:flex;align-items:center;gap:8px;padding:14px;border:2px solid #EAB308;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(234,179,8,0.05),transparent)}'
    + '.tkn-amt-input{flex:1;min-width:0;border:none;outline:none;background:transparent;font:var(--fw-bold) 28px/1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:0}'
    + '.tkn-amt-unit{font:var(--fw-semibold) var(--fs-md)/1 var(--font);color:#EAB308}'
    + '.tkn-preset-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'
    + '.tkn-preset-btn{padding:8px;border-radius:var(--r-md);border:1px solid var(--border-subtle);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) 11px/1 var(--font);cursor:pointer;transition:all .15s;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-preset-btn:hover{border-color:#EAB308;color:#EAB308}'
    + '.tkn-preset-btn.active{border-color:#EAB308;background:#EAB308;color:#fff}'
    + '.tkn-new-bal{display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:var(--r-md);background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);font:var(--fw-regular) 11px/1 var(--font);color:var(--text-secondary)}'
    + '.tkn-new-bal b{font:var(--fw-bold) var(--fs-sm)/1 var(--font);color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    /* Textarea */
    + '.tkn-textarea{width:100%;box-sizing:border-box;min-height:60px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);font:var(--fw-regular) var(--fs-xs)/1.4 var(--font);color:var(--text-primary);outline:none;resize:vertical;transition:border-color .15s}'
    + '.tkn-textarea:focus{border-color:#3B82F6}'
    + '.tkn-textarea--admin{background:linear-gradient(135deg,rgba(139,92,246,0.04),transparent);border-color:rgba(139,92,246,0.25)}'
    + '.tkn-textarea--admin:focus{border-color:#8B5CF6}'
    /* Gift CTA */
    + '.tkn-gift-cta{width:100%;padding:14px;border:none;border-radius:var(--r-lg);background:linear-gradient(135deg,#8B5CF6,#7C3AED);color:#fff;font:var(--fw-semibold) var(--fs-sm)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(139,92,246,0.35);transition:opacity .15s}'
    + '.tkn-gift-cta:hover{opacity:0.92}'
    + '.tkn-gift-cta.disabled{background:var(--border-subtle);color:var(--text-muted);cursor:not-allowed;box-shadow:none;opacity:0.75}'
    /* Confirm modal */
    + '.tkn-conf-head{padding:22px 16px;background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}'
    + '.tkn-conf-ico{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.22);border:2px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center}'
    + '.tkn-conf-title{font:var(--fw-bold) var(--fs-lg)/1.1 var(--font)}'
    + '.tkn-conf-sub{font:var(--fw-regular) 11px/1.3 var(--font);opacity:0.9}'
    + '.tkn-conf-body{padding:16px;display:flex;flex-direction:column;gap:12px}'
    + '.tkn-conf-target{display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.tkn-conf-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;font:var(--fw-bold) 14px/1 var(--font);flex-shrink:0}'
    + '.tkn-conf-name{font:var(--fw-bold) var(--fs-sm)/1.1 var(--font);color:var(--text-primary)}'
    + '.tkn-conf-owner{font:var(--fw-regular) 10px/1.3 var(--font);color:var(--text-muted);margin-top:3px}'
    + '.tkn-conf-amt{display:flex;align-items:center;justify-content:center;gap:6px;padding:14px;border-radius:var(--r-md);background:linear-gradient(135deg,rgba(234,179,8,0.08),transparent);border:2px dashed rgba(234,179,8,0.4);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-conf-plus{font:var(--fw-bold) 24px/1 var(--font);color:#22C55E}'
    + '.tkn-conf-amt-val{font:var(--fw-bold) 32px/1 var(--font);color:var(--text-primary)}'
    + '.tkn-conf-amt-unit{font:var(--fw-semibold) 13px/1 var(--font);color:var(--text-muted);align-self:flex-end;margin-bottom:3px}'
    + '.tkn-conf-eq{text-align:center;font:var(--fw-medium) 11px/1 var(--font);color:var(--text-muted);margin-top:-4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-conf-bal{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;padding:10px;border-radius:var(--r-md);background:var(--bg-phone-secondary)}'
    + '.tkn-conf-bal>div{text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}'
    + '.tkn-conf-bal span{font:var(--fw-regular) 9px/1 var(--font);color:var(--text-muted);text-transform:uppercase;letter-spacing:.3px;font-family:inherit}'
    + '.tkn-conf-bal b{display:block;font:var(--fw-bold) var(--fs-md)/1 var(--font);color:var(--text-primary);margin-top:4px;font-family:inherit}'
    + '.tkn-conf-note{display:flex;align-items:flex-start;gap:6px;padding:8px 10px;border-radius:var(--r-md);background:rgba(139,92,246,0.06);border-left:3px solid #8B5CF6}'
    + '.tkn-conf-note span{font:var(--fw-regular) 11px/1.4 var(--font);color:var(--text-secondary);font-style:italic}'
    + '.tkn-conf-btns{display:grid;grid-template-columns:1fr 1.5fr;gap:8px;padding:10px 16px 16px}'
    + '.tkn-conf-cancel{padding:13px;border:1px solid var(--border-subtle);border-radius:var(--r-md);background:var(--bg-phone);color:var(--text-secondary);font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer}'
    + '.tkn-conf-apply{padding:13px;border:none;border-radius:var(--r-md);background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 4px 14px rgba(34,197,94,0.35)}'
    + '.tkn-conf-apply:hover{opacity:0.93}';
  var s = document.createElement('style');
  s.id = 'tknStyles2';
  s.textContent = css;
  document.head.appendChild(s);
}

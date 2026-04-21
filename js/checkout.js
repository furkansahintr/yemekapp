/* ═══════════════════════════════════════════════════════════
   CHECKOUT — Sepete Ekle Toast + Ödeme Popup (Hibrit)
   ═══════════════════════════════════════════════════════════ */

/* ═══ P1 — Toast + Badge Bump ═══ */

/* Global showToast (yoksa tanımla) — başka modüller de kullanıyor */
if (typeof window.showToast !== 'function' || !window.showToast.__chkEnhanced) {
  window.showToast = function(message, opts) {
    _chkInjectStyles();
    var existing = document.getElementById('chkToast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'chkToast';
    t.className = 'chk-toast';
    var icon = (opts && opts.icon) || 'solar:check-circle-bold';
    var color = (opts && opts.color) || '#10B981';
    var actionLabel = (opts && opts.actionLabel) || null;
    var actionId = 'chkToastAction_' + Date.now().toString(36);

    var safe = String(message).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var html = '<iconify-icon icon="' + icon + '" style="font-size:18px;color:' + color + '"></iconify-icon>'
      + '<span class="chk-toast-msg">' + safe + '</span>';
    if (actionLabel) {
      html += '<button id="' + actionId + '" class="chk-toast-action">'
        + String(actionLabel).replace(/</g,'&lt;')
        + ' <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:12px"></iconify-icon></button>';
    }
    t.innerHTML = html;
    document.body.appendChild(t);

    if (actionLabel && opts && typeof opts.onAction === 'function') {
      var btn = document.getElementById(actionId);
      if (btn) btn.onclick = function(e) {
        e.stopPropagation();
        try { opts.onAction(); } catch(_) {}
        t.classList.remove('show');
        setTimeout(function(){ if (t.parentNode) t.remove(); }, 280);
      };
    }

    requestAnimationFrame(function(){ t.classList.add('show'); });
    var ms = (opts && opts.duration) || 2500;
    setTimeout(function(){
      t.classList.remove('show');
      setTimeout(function(){ if (t.parentNode) t.remove(); }, 320);
    }, ms);
  };
  window.showToast.__chkEnhanced = true;
}

/* Buton üzerinde kısa tick animasyonu — Sepete Ekle feedback'i
   btn: HTMLElement veya id string. done callback opsiyonel. */
function buttonTick(btn, opts) {
  var el = (typeof btn === 'string') ? document.getElementById(btn) : btn;
  if (!el) { if (opts && opts.done) opts.done(); return; }
  if (el.__tickBusy) return;
  el.__tickBusy = true;

  var originalHTML = el.innerHTML;
  var originalWidth = el.offsetWidth + 'px';
  var holdMs = (opts && opts.hold) || 650;

  el.style.minWidth = originalWidth;
  el.classList.add('chk-btn-tick');
  el.innerHTML = '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:#fff;animation:chkTickPop .32s cubic-bezier(.2,.9,.25,1)"></iconify-icon>';

  setTimeout(function() {
    el.innerHTML = originalHTML;
    el.classList.remove('chk-btn-tick');
    el.style.minWidth = '';
    el.__tickBusy = false;
    if (opts && typeof opts.done === 'function') opts.done();
  }, holdMs);
}

/* Sepet ikonu boşken gri, doluyken marka rengi
   Cart count'a göre #headerCartBtn'e .chk-cart-active sınıfı ekler/çıkarır */
function refreshCartIconState() {
  var btn = document.getElementById('headerCartBtn');
  if (!btn) return;
  var count = 0;
  if (typeof cart !== 'undefined' && Array.isArray(cart)) {
    for (var i = 0; i < cart.length; i++) count += (cart[i].qty || 0);
  }
  btn.classList.toggle('chk-cart-active', count > 0);
}

/* İlk yüklemede durumu ayarla */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(refreshCartIconState, 600);
  });
}

/* Sepet badge bump — addToCart sonrası ikon hafif zıplasın */
function bumpCartBadge() {
  ['headerCartBadge', 'stickyCartBadge'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('chk-badge-bump');
    // reflow
    void el.offsetWidth;
    el.classList.add('chk-badge-bump');
  });
  // Sepet ikonu wrapper'a da pulse
  var btn = document.getElementById('headerCartBtn');
  if (btn) {
    btn.classList.remove('chk-icon-pulse');
    void btn.offsetWidth;
    btn.classList.add('chk-icon-pulse');
  }
}

/* ═══ Styles ═══ */
function _chkInjectStyles() {
  if (document.getElementById('chkStyles')) return;
  var s = document.createElement('style');
  s.id = 'chkStyles';
  s.textContent = [
    /* Toast */
    '.chk-toast{position:fixed;left:50%;transform:translateX(-50%) translateY(-20px);bottom:calc(env(safe-area-inset-bottom,0) + 96px);z-index:9999;display:inline-flex;align-items:center;gap:10px;padding:11px 14px 11px 16px;background:rgba(17,24,39,.92);color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:999px;box-shadow:0 10px 32px rgba(0,0,0,.35);font:var(--fw-medium) var(--fs-sm)/1.2 var(--font);opacity:0;pointer-events:none;transition:opacity .28s ease, transform .32s cubic-bezier(.2,.9,.25,1);max-width:92%;backdrop-filter:blur(8px)}',
    '.chk-toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}',
    '.chk-toast-msg{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}',
    '.chk-toast-action{margin-left:4px;padding:6px 11px;border:none;background:rgba(255,255,255,.18);color:#fff;border-radius:999px;font:var(--fw-semibold) var(--fs-xs)/1 var(--font);font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:3px;transition:background .18s}',
    '.chk-toast-action:hover,.chk-toast-action:active{background:rgba(255,255,255,.3)}',
    /* Badge bump */
    '@keyframes chkBadgeBump{0%{transform:scale(1)}30%{transform:scale(1.35)}60%{transform:scale(.92)}100%{transform:scale(1)}}',
    '.chk-badge-bump{animation:chkBadgeBump .45s cubic-bezier(.2,.9,.25,1)}',
    /* Icon pulse */
    '@keyframes chkIconPulse{0%{box-shadow:0 0 0 0 rgba(246,80,19,.45)}100%{box-shadow:0 0 0 14px rgba(246,80,19,0)}}',
    '.chk-icon-pulse{animation:chkIconPulse .55s ease-out;border-radius:50%}',
    /* Button tick feedback */
    '@keyframes chkTickPop{0%{transform:scale(0) rotate(-180deg);opacity:0}60%{transform:scale(1.18) rotate(0deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}',
    '.chk-btn-tick{pointer-events:none;background:#10B981 !important;color:#fff !important;transition:background .2s ease}',
    /* Cart icon empty/active state */
    '#headerCartBtn.chk-cart-active iconify-icon{color:var(--primary) !important}',
    '#headerCartBtn iconify-icon{transition:color .25s ease}'
  ].join('\n');
  document.head.appendChild(s);
}

/* Script yüklenince stil hemen hazırlansın */
_chkInjectStyles();

/* ═══════════════════════════════════════════════════════════
   P3 — Checkout Popup (kayıtlı kart + yeni kart)
   ═══════════════════════════════════════════════════════════ */

var _chk = {
  total: 0,          // TL
  useWallet: false,  // hibrit toggle
  walletUse: 0,      // kullanılacak token
  cardId: null,      // seçili kart
  addingCard: false, // "Yeni Kart Ekle" formu açık mı
  newCard: { num:'', exp:'', cvv:'', name:'', save:true },
  submitting: false
};

function openCheckoutPopup(total) {
  _chkInjectStyles();
  _chkInjectCheckoutStyles();

  _chk.total = total || 0;
  _chk.useWallet = false;
  _chk.walletUse = 0;
  _chk.addingCard = false;
  _chk.newCard = { num:'', exp:'', cvv:'', name:'', save:true };
  _chk.submitting = false;

  // Default kart: birincil veya ilk
  if (typeof USER_WALLET !== 'undefined' && USER_WALLET && Array.isArray(USER_WALLET.cards) && USER_WALLET.cards.length > 0) {
    var primary = USER_WALLET.cards.find(function(c){ return c.primary; }) || USER_WALLET.cards[0];
    _chk.cardId = primary.id;
  } else {
    _chk.cardId = null;
    _chk.addingCard = true; // kayıtlı kart yok → direkt ekle
  }

  var existing = document.getElementById('chkModalBd');
  if (existing) existing.remove();

  var bd = document.createElement('div');
  bd.id = 'chkModalBd';
  bd.className = 'chk-modal-bd';
  bd.onclick = function(e){ if (e.target === bd) closeCheckoutPopup(); };
  bd.innerHTML = '<div class="chk-modal" id="chkModal"><div id="chkModalBody"></div></div>';

  var host = document.getElementById('phone') || document.body;
  host.appendChild(bd);
  requestAnimationFrame(function(){
    bd.classList.add('open');
    var m = document.getElementById('chkModal');
    if (m) m.classList.add('open');
  });

  _chkRender();
}

function closeCheckoutPopup() {
  var bd = document.getElementById('chkModalBd');
  if (!bd) return;
  bd.classList.remove('open');
  var m = document.getElementById('chkModal');
  if (m) m.classList.remove('open');
  setTimeout(function(){ if (bd.parentNode) bd.remove(); }, 260);
}

function _chkRender() {
  var body = document.getElementById('chkModalBody');
  if (!body) return;

  var cards = (typeof USER_WALLET !== 'undefined' && USER_WALLET && USER_WALLET.cards) ? USER_WALLET.cards : [];

  var h = '<div class="chk-head">'
    + '<div class="chk-close" onclick="closeCheckoutPopup()"><iconify-icon icon="solar:close-circle-bold" style="font-size:22px;color:var(--text-muted)"></iconify-icon></div>'
    + '<div style="flex:1"><div class="chk-title"><iconify-icon icon="solar:bag-check-bold" style="font-size:17px;color:#F65013"></iconify-icon>Ödemeyi Onayla</div>'
    + '<div class="chk-sub">Toplam <b>₺' + _chkFmtTL(_chk.total) + '</b></div></div>'
    + '</div>';

  // Kayıtlı kartlar
  h += '<div class="chk-section">'
    + '<div class="chk-sec-lbl"><iconify-icon icon="solar:card-bold" style="font-size:13px;color:#3B82F6"></iconify-icon>Kayıtlı Kartlar</div>'
    + '<div class="chk-card-list">';
  if (cards.length === 0) {
    h += '<div class="chk-empty"><iconify-icon icon="solar:card-linear" style="font-size:26px;opacity:.3"></iconify-icon><span>Henüz kayıtlı kart yok</span></div>';
  }
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var sel = !_chk.addingCard && _chk.cardId === c.id;
    var brandBg = c.brand === 'Visa' ? '#1A1F71' : (c.brand === 'Mastercard' ? '#EB001B' : '#6B7280');
    h += '<div class="chk-card-row' + (sel ? ' selected' : '') + '" onclick="_chkSelectCard(\'' + c.id + '\')">'
      + '<div class="chk-card-brand" style="background:' + brandBg + '">' + _chkEsc(c.brand === 'Visa' ? 'VISA' : (c.brand === 'Mastercard' ? 'MC' : c.brand)) + '</div>'
      + '<div style="flex:1">'
      + '<div class="chk-card-num">•••• •••• •••• ' + _chkEsc(c.last4) + '</div>'
      + '<div class="chk-card-meta">' + _chkEsc(c.brand) + (c.primary ? ' · Birincil' : '') + '</div>'
      + '</div>'
      + (sel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:#10B981"></iconify-icon>' : '<iconify-icon icon="solar:stop-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>')
      + '</div>';
  }
  // Her zaman "Yeni Kart Ekle"
  h += '<div class="chk-card-row chk-card-row--new' + (_chk.addingCard ? ' selected' : '') + '" onclick="_chkSelectNewCard()">'
    + '<div class="chk-card-brand chk-card-brand--new"><iconify-icon icon="solar:add-circle-bold" style="font-size:18px"></iconify-icon></div>'
    + '<div style="flex:1"><div class="chk-card-num">Yeni Kart Ekle</div>'
    + '<div class="chk-card-meta">Kart bilgilerini gir</div></div>'
    + (_chk.addingCard ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:20px;color:#10B981"></iconify-icon>' : '<iconify-icon icon="solar:stop-linear" style="font-size:20px;color:var(--text-muted)"></iconify-icon>')
    + '</div>';
  h += '</div></div>';

  // Yeni kart formu (addingCard ise)
  if (_chk.addingCard) {
    h += '<div class="chk-new-card-form">'
      + '<input class="chk-inp" placeholder="Kart üzerindeki isim" value="' + _chkEsc(_chk.newCard.name) + '" oninput="_chk.newCard.name=this.value">'
      + '<input class="chk-inp" placeholder="Kart Numarası (16 hane)" maxlength="19" value="' + _chkEsc(_chk.newCard.num) + '" oninput="_chk.newCard.num=this.value">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
      + '<input class="chk-inp" placeholder="AA/YY" maxlength="5" value="' + _chkEsc(_chk.newCard.exp) + '" oninput="_chk.newCard.exp=this.value">'
      + '<input class="chk-inp" placeholder="CVV" maxlength="4" value="' + _chkEsc(_chk.newCard.cvv) + '" oninput="_chk.newCard.cvv=this.value">'
      + '</div>'
      + '<label class="chk-save-lbl"><input type="checkbox"' + (_chk.newCard.save ? ' checked' : '') + ' onchange="_chk.newCard.save=this.checked"><span>Kartı kaydet</span></label>'
      + '</div>';
  }

  /* Cüzdan bloğu */
  h += _chkRenderWalletBlock();

  /* Özet + Onayla */
  h += _chkRenderSummaryFooter();

  body.innerHTML = h;
}

/* ═══ P5 — Özet Footer + Onayla ═══ */
function _chkRenderSummaryFooter() {
  var calc = _chkWalletCalc();
  var total = _chk.total || 0;

  var h = '<div class="chk-summary">'
    + '<div class="chk-sum-row"><span>Toplam</span><b>₺' + _chkFmtTL(total) + '</b></div>'
    + '<div class="chk-sum-row" style="color:' + (calc.walletUse > 0 ? '#B45309' : 'var(--text-muted)') + '">'
    + '<span><iconify-icon icon="solar:wallet-money-linear" style="font-size:12px"></iconify-icon> Cüzdan</span>'
    + '<b>' + (calc.walletUse > 0 ? '-' + calc.walletUse + ' Token' : '—') + '</b></div>'
    + '<div class="chk-sum-row" style="color:' + (calc.cardUse > 0 ? 'var(--text-primary)' : 'var(--text-muted)') + '">'
    + '<span><iconify-icon icon="solar:card-linear" style="font-size:12px"></iconify-icon> Karttan Çekilecek</span>'
    + '<b>' + (calc.cardUse > 0 ? '₺' + _chkFmtTL(calc.cardUse) : '—') + '</b></div>'
    + '</div>';

  var valid = _chkValid(calc);
  h += '<div class="chk-footer">'
    + '<button class="chk-btn-pay' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_chkSubmit()"' : '') + '>'
    + (_chk.submitting
        ? '<iconify-icon icon="solar:refresh-linear" style="font-size:15px;animation:chkBadgeBump 1s linear infinite"></iconify-icon>İşleniyor...'
        : '<iconify-icon icon="solar:shield-check-bold" style="font-size:15px"></iconify-icon>Ödemeyi Tamamla')
    + '</button>'
    + '</div>';
  return h;
}

function _chkValid(calc) {
  if (!calc) calc = _chkWalletCalc();
  if (_chk.submitting) return false;
  if (_chk.total <= 0) return false;

  // Cüzdan tek başına yeterli ise kart opsiyonel
  if (_chk.useWallet && calc.walletUse >= _chk.total) return true;

  // Kart gerekiyor → ya kayıtlı seçili ya da yeni kart formu doldurulmuş
  if (_chk.addingCard) {
    var c = _chk.newCard;
    var cleanNum = (c.num || '').replace(/\s+/g, '');
    return cleanNum.length >= 13 && (c.exp || '').length >= 4 && (c.cvv || '').length >= 3;
  }
  return !!_chk.cardId;
}

function _chkSubmit() {
  _chk.submitting = true;
  _chkRender();
  setTimeout(function() {
    var calc = _chkWalletCalc();
    // Cüzdan düş
    if (_chk.useWallet && typeof USER_WALLET !== 'undefined' && USER_WALLET) {
      USER_WALLET.tokens = Math.max(0, (USER_WALLET.tokens || 0) - calc.walletUse);
      if (typeof _updateWalletPill === 'function') _updateWalletPill();
    }
    // Yeni kart kaydet
    if (_chk.addingCard && _chk.newCard.save && typeof USER_WALLET !== 'undefined' && USER_WALLET) {
      var last4 = (_chk.newCard.num || '').replace(/\s+/g,'').slice(-4);
      USER_WALLET.cards = USER_WALLET.cards || [];
      USER_WALLET.cards.push({
        id: 'c_' + Date.now().toString(36),
        brand: 'Visa', last4: last4, primary: false
      });
    }
    closeCheckoutPopup();
    if (typeof showToast === 'function') showToast('Siparişiniz oluşturuldu · Ödeme başarılı', { icon:'solar:check-circle-bold' });
    // Sepeti temizle
    if (typeof cart !== 'undefined' && Array.isArray(cart)) cart.length = 0;
    if (typeof updateCartBadge === 'function') updateCartBadge();
    if (typeof renderCartBadge === 'function') renderCartBadge();
    var cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) cartOverlay.classList.remove('open');
    // Success ekranı
    var ok = document.getElementById('orderSuccessOverlay');
    if (ok && ok.classList) ok.classList.add('open');
  }, 700);
}

/* ═══ P4 — Cüzdan toggle + hibrit hesaplama ═══ */
function _chkGetTokens() {
  return (typeof USER_WALLET !== 'undefined' && USER_WALLET && typeof USER_WALLET.tokens === 'number')
    ? USER_WALLET.tokens : 0;
}

/* 1 Token = 1 TL varsayımı — proje genelinde bu oran kullanılıyor */
function _chkWalletCalc() {
  var tokens = _chkGetTokens();
  var total = _chk.total || 0;
  var walletUse = _chk.useWallet ? Math.min(tokens, total) : 0;
  var cardUse = Math.max(0, total - walletUse);
  var insufficient = _chk.useWallet && walletUse < total;  // cüzdan yetmiyor → kart şart
  return { tokens: tokens, walletUse: walletUse, cardUse: cardUse, insufficient: insufficient };
}

function _chkRenderWalletBlock() {
  var calc = _chkWalletCalc();

  var h = '<div class="chk-section">'
    + '<div class="chk-sec-lbl"><iconify-icon icon="solar:wallet-money-bold" style="font-size:13px;color:#F59E0B"></iconify-icon>Cüzdan ile Öde</div>';

  // Toggle row
  h += '<div class="chk-wallet-row">'
    + '<div class="chk-wallet-ico"><iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:22px;color:#F59E0B"></iconify-icon></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="chk-wallet-title">Cüzdan Bakiyen</div>'
    + '<div class="chk-wallet-sub">'
    + '<span class="chk-token"><iconify-icon icon="solar:dollar-minimalistic-bold" style="font-size:11px;color:#F59E0B;vertical-align:-1px"></iconify-icon> ' + calc.tokens.toLocaleString('tr-TR') + ' Token</span>'
    + '<span style="margin:0 5px;opacity:.4">·</span>'
    + '<span>1 Token = 1 TL</span>'
    + '</div></div>'
    + '<label class="chk-switch">'
    + '<input type="checkbox"' + (_chk.useWallet ? ' checked' : '') + ' onchange="_chkToggleWallet(this.checked)">'
    + '<span class="chk-slider"></span></label>'
    + '</div>';

  // Aktifse hesaplama
  if (_chk.useWallet) {
    if (calc.walletUse >= _chk.total && calc.walletUse > 0) {
      // Tamamı token
      h += '<div class="chk-wallet-msg chk-wallet-msg--ok">'
        + '<iconify-icon icon="solar:check-circle-bold" style="font-size:15px;color:#10B981"></iconify-icon>'
        + '<span>Tüm tutar cüzdanından karşılanacak. Kart seçimi gerekli değil.</span>'
        + '</div>';
    } else {
      // Hibrit
      h += '<div class="chk-wallet-msg chk-wallet-msg--hybrid">'
        + '<iconify-icon icon="solar:shield-warning-bold" style="font-size:15px;color:#F59E0B"></iconify-icon>'
        + '<span><b>' + calc.walletUse + ' Token</b> kullanılacak, kalan <b>₺' + _chkFmtTL(calc.cardUse) + '</b> seçili kartından tahsil edilecektir.</span>'
        + '</div>';
      if (calc.insufficient && !_chk.cardId && !_chk.addingCard) {
        h += '<div class="chk-wallet-msg chk-wallet-msg--err">'
          + '<iconify-icon icon="solar:danger-triangle-bold" style="font-size:15px;color:#EF4444"></iconify-icon>'
          + '<span>Cüzdan bakiyesi yetersiz — kalan tutar için <b>bir kart seçmelisin</b>.</span>'
          + '</div>';
      }
    }
  }

  h += '</div>';
  return h;
}

function _chkToggleWallet(on) {
  _chk.useWallet = !!on;
  _chkRender();
}

function _chkSelectCard(id) {
  _chk.cardId = id;
  _chk.addingCard = false;
  _chkRender();
}

function _chkSelectNewCard() {
  _chk.addingCard = true;
  _chkRender();
}

function _chkEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _chkFmtTL(n) {
  return (Math.round(n * 100) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ═══ P3 — Ek stiller ═══ */
function _chkInjectCheckoutStyles() {
  if (document.getElementById('chkCheckoutStyles')) return;
  var s = document.createElement('style');
  s.id = 'chkCheckoutStyles';
  s.textContent = [
    '.chk-modal-bd{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;z-index:100;opacity:0;transition:opacity .24s ease}',
    '.chk-modal-bd.open{opacity:1}',
    '.chk-modal{width:100%;max-width:100%;background:var(--bg-phone);border-radius:22px 22px 0 0;max-height:92vh;overflow-y:auto;transform:translateY(100%);transition:transform .28s cubic-bezier(.2,.9,.25,1)}',
    '.chk-modal.open{transform:translateY(0)}',
    '.chk-head{position:sticky;top:0;display:flex;align-items:center;gap:10px;padding:14px 16px 10px;background:var(--bg-phone);z-index:3;border-bottom:1px solid var(--border-soft)}',
    '.chk-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:50%;background:var(--bg-phone-secondary)}',
    '.chk-close:active{transform:scale(.92)}',
    '.chk-title{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:800;color:var(--text-primary)}',
    '.chk-sub{font-size:11.5px;color:var(--text-muted);margin-top:2px}',
    '.chk-sub b{color:var(--text-primary);font-weight:800}',
    '.chk-section{padding:12px 14px;display:flex;flex-direction:column;gap:8px}',
    '.chk-sec-lbl{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:var(--text-muted)}',
    '.chk-card-list{display:flex;flex-direction:column;gap:7px}',
    '.chk-card-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-phone);border:1.5px solid var(--border-soft);border-radius:12px;cursor:pointer;transition:all .15s}',
    '.chk-card-row:active{transform:scale(.98)}',
    '.chk-card-row.selected{border-color:#10B981;background:rgba(16,185,129,.06)}',
    '.chk-card-row--new{border-style:dashed}',
    '.chk-card-brand{width:44px;height:28px;border-radius:5px;color:#fff;font-size:10px;font-weight:800;letter-spacing:.5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
    '.chk-card-brand--new{background:var(--bg-phone-secondary);color:var(--text-muted);border:1.5px dashed var(--border-soft)}',
    '.chk-card-num{font-size:12.5px;font-weight:700;color:var(--text-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:1px}',
    '.chk-card-meta{font-size:10.5px;color:var(--text-muted);margin-top:2px}',
    '.chk-empty{padding:18px;background:var(--bg-phone-secondary);border-radius:10px;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--text-muted);font-size:11.5px}',
    '.chk-new-card-form{padding:0 14px 12px;display:flex;flex-direction:column;gap:8px}',
    '.chk-inp{padding:11px 13px;border:1.5px solid var(--border-soft);background:var(--bg-phone-secondary);border-radius:10px;color:var(--text-primary);font-size:13px;outline:none;font-family:inherit;width:100%}',
    '.chk-inp:focus{border-color:#10B981}',
    '.chk-save-lbl{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--text-primary);cursor:pointer;padding:4px 0}',
    '.chk-save-lbl input{accent-color:#10B981}',
    /* Wallet block */
    '.chk-wallet-row{display:flex;align-items:center;gap:10px;padding:12px 13px;background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(234,88,12,.05));border:1px solid rgba(245,158,11,.25);border-radius:12px}',
    '.chk-wallet-ico{width:40px;height:40px;border-radius:12px;background:rgba(245,158,11,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.chk-wallet-title{font-size:13px;font-weight:800;color:var(--text-primary)}',
    '.chk-wallet-sub{font-size:10.5px;color:var(--text-muted);margin-top:3px;display:inline-flex;align-items:center;flex-wrap:wrap}',
    '.chk-token{display:inline-flex;align-items:center;gap:3px;font-weight:800;color:#B45309;background:rgba(245,158,11,.12);padding:2px 7px;border-radius:999px;letter-spacing:.2px}',
    '.chk-wallet-msg{display:flex;align-items:flex-start;gap:7px;padding:10px 12px;border-radius:10px;font-size:11.5px;line-height:1.5;margin-top:8px}',
    '.chk-wallet-msg--ok{background:rgba(16,185,129,.08);color:#065F46;border:1px solid rgba(16,185,129,.22)}',
    '.chk-wallet-msg--hybrid{background:rgba(245,158,11,.08);color:#92400E;border:1px dashed rgba(245,158,11,.3)}',
    '.chk-wallet-msg--err{background:rgba(239,68,68,.08);color:#991B1B;border:1px solid rgba(239,68,68,.25)}',
    '.chk-wallet-msg b{font-weight:800}',
    /* Switch */
    '.chk-switch{position:relative;display:inline-block;width:42px;height:24px;flex-shrink:0}',
    '.chk-switch input{opacity:0;width:0;height:0}',
    '.chk-slider{position:absolute;inset:0;cursor:pointer;background:var(--bg-phone-secondary);border-radius:999px;transition:background .22s}',
    '.chk-slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:transform .22s;box-shadow:0 1px 3px rgba(0,0,0,.18)}',
    '.chk-switch input:checked + .chk-slider{background:#F59E0B}',
    '.chk-switch input:checked + .chk-slider:before{transform:translateX(18px)}',
    /* Summary + Footer */
    '.chk-summary{margin:4px 14px 8px;padding:12px 14px;background:var(--bg-phone-secondary);border-radius:12px;display:flex;flex-direction:column;gap:6px}',
    '.chk-sum-row{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:var(--text-primary)}',
    '.chk-sum-row span{display:inline-flex;align-items:center;gap:5px;color:var(--text-muted)}',
    '.chk-sum-row b{font-weight:800;font-variant-numeric:tabular-nums}',
    '.chk-sum-row:first-child{padding-bottom:6px;border-bottom:1px dashed var(--border-soft)}',
    '.chk-sum-row:first-child b{color:#F65013;font-size:15px}',
    '.chk-footer{position:sticky;bottom:0;padding:12px 14px max(env(safe-area-inset-bottom),12px);background:var(--bg-phone);border-top:1px solid var(--border-soft);z-index:2}',
    '.chk-btn-pay{width:100%;padding:14px;border:none;background:linear-gradient(135deg,#F65013,#EA580C);color:#fff;border-radius:14px;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 4px 14px rgba(246,80,19,.3);font-family:inherit;transition:transform .15s}',
    '.chk-btn-pay:active{transform:scale(.98)}',
    '.chk-btn-pay.disabled{opacity:.42;cursor:not-allowed;transform:none;box-shadow:none}'
  ].join('\n');
  document.head.appendChild(s);
}

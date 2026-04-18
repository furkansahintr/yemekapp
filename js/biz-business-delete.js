/* ═══════════════════════════════════════════════════════════
   BIZ ACCOUNT DELETE — Genel İşletme Silme
   Yasal bilgilendirme · token tasfiye · ikna · 3-step · 30g askı
   ═══════════════════════════════════════════════════════════ */

var _bad = {
  view: 'main',                // 'main' | 'suspended'
  step: 1,                     // 1=reason, 2=password, 3=otp, 4=success
  selectedReasons: {},
  note: '',
  password: '',
  otp: ''
};

function openBizBusinessDeletePage() {
  _badInjectStyles();
  var host = document.getElementById('bizPhone') || document.getElementById('phone');
  if (!host) return;
  var existing = host.querySelector('.bad-overlay');
  if (existing) existing.remove();

  _bad.view = (typeof BIZ_ACCOUNT_DELETION_STATE !== 'undefined' && BIZ_ACCOUNT_DELETION_STATE) ? 'suspended' : 'main';
  _bad.step = 1;
  _bad.selectedReasons = {};
  _bad.note = '';
  _bad.password = '';
  _bad.otp = '';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open bad-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;z-index:80;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'badOverlay';
  host.appendChild(overlay);

  _badRender();
}

function _badClose() {
  var o = document.getElementById('badOverlay');
  if (o) o.remove();
}

function _badEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _badFmtTL(n) {
  return '₺' + Math.round(n).toLocaleString('tr-TR');
}

function _badRender() {
  var o = document.getElementById('badOverlay');
  if (!o) return;

  var h = '<div class="bad-header">'
    + '<div class="bad-back" onclick="_badClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="bad-title"><iconify-icon icon="solar:shield-cross-bold" style="font-size:17px;color:#EF4444"></iconify-icon>İşletme Hesabını Sil</div>'
    + '<div class="bad-sub">Tüm şubeler ve veriler dahil</div>'
    + '</div>'
    + '</div>'
    + '<div id="badBody" style="flex:1"></div>';

  o.innerHTML = h;
  var body = document.getElementById('badBody');
  if (body) body.innerHTML = '<div class="bad-wrap"><div class="bad-empty">Akış yakında...</div></div>';
}

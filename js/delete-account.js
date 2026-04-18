/* ═══════════════════════════════════════════════════════════
   DELETE ACCOUNT — Hesap Silme / Veda Akışı
   Kayıp önleme + anket + 30 gün askıya alma
   ═══════════════════════════════════════════════════════════ */

var _dac = {
  selectedReasons: {},       // { 'slow': true }
  surveyNote: '',
  otp: '',
  view: 'main'               // 'main' | 'suspended'
};

function openDeleteAccountPage() {
  _dacInjectStyles();
  var phone = document.getElementById('phone');
  if (!phone) return;
  var existing = phone.querySelector('.dac-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open dac-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;z-index:79;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'dacOverlay';
  phone.appendChild(overlay);

  _dac.view = (typeof ACCOUNT_DELETION_STATE !== 'undefined' && ACCOUNT_DELETION_STATE) ? 'suspended' : 'main';
  _dac.selectedReasons = {};
  _dac.surveyNote = '';
  _dacRender();
}

function _dacClose() {
  var o = document.getElementById('dacOverlay');
  if (o) o.remove();
  _dacCloseAllModals();
}

function _dacCloseAllModals() {
  ['dacConfirmModal','dacOtpModal','dacSuccessModal','dacSupportModal'].forEach(function(id) {
    var m = document.getElementById(id);
    if (m) m.remove();
  });
}

/* ── Helpers ── */
function _dacEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Render ── */
function _dacRender() {
  var o = document.getElementById('dacOverlay');
  if (!o) return;

  var h = '<div class="dac-header">'
    + '<div class="dac-back" onclick="_dacClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="dac-title"><iconify-icon icon="solar:heart-angle-bold" style="font-size:17px;color:#EC4899"></iconify-icon>Hesabımı Sil</div>'
    + '<div class="dac-sub">Gitmeden önce son bir söz...</div>'
    + '</div>'
    + '</div>'
    + '<div id="dacBody" style="flex:1"></div>';

  o.innerHTML = h;
  _dacRenderBody();
}

function _dacRenderBody() {
  var body = document.getElementById('dacBody');
  if (!body) return;
  if (_dac.view === 'suspended') body.innerHTML = _dacRenderSuspended();
  else body.innerHTML = '<div class="dac-wrap"><div class="dac-empty-placeholder">Veda sayfası hazırlanıyor...</div></div>';
}

function _dacRenderSuspended() {
  var s = ACCOUNT_DELETION_STATE;
  var daysLeft = Math.max(0, Math.ceil((new Date(s.deleteAt) - new Date()) / 86400000));
  return '<div class="dac-wrap">'
    + '<div class="dac-susp-card">'
    + '<iconify-icon icon="solar:moon-sleep-bold" style="font-size:48px;color:#8B5CF6"></iconify-icon>'
    + '<div class="dac-susp-title">Hesabın askıya alındı</div>'
    + '<div class="dac-susp-sub">Kalıcı silinmeye <b>' + daysLeft + ' gün</b> kaldı</div>'
    + '<button class="dac-btn-primary" onclick="_dacCancelDeletion()">Vazgeç & Geri Dön</button>'
    + '</div>'
    + '</div>';
}

function _dacCancelDeletion() {
  ACCOUNT_DELETION_STATE = null;
  if (typeof _admToast === 'function') _admToast('Tekrar hoş geldin! Hesabın tamamen aktif.', 'ok');
  _dac.view = 'main';
  _dacRenderBody();
}

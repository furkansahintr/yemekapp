/* ═══════════════════════════════════════════════════════════
   BIZ BRANCH DELETE — Şube Kapatma Akışı
   Ön denetim · 3-step (sebep/şifre/OTP) · 30g askıya alma
   ═══════════════════════════════════════════════════════════ */

var _bbd = {
  branchId: null,
  step: 1,                     // 1=reason, 2=password, 3=otp, 4=success
  selectedReasons: {},
  note: '',
  password: '',
  otp: ''
};

function openBizBranchDeletePage(branchId) {
  _bbdInjectStyles();
  var host = document.getElementById('bizPhone') || document.getElementById('phone');
  if (!host) return;
  var existing = host.querySelector('.bbd-overlay');
  if (existing) existing.remove();

  _bbd.branchId = branchId;
  _bbd.step = 1;
  _bbd.selectedReasons = {};
  _bbd.note = '';
  _bbd.password = '';
  _bbd.otp = '';

  var overlay = document.createElement('div');
  overlay.className = 'prof-overlay open bbd-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;z-index:80;animation:admFadeIn .3s ease;overflow-y:auto';
  overlay.id = 'bbdOverlay';
  host.appendChild(overlay);

  _bbdRender();
}

function _bbdClose() {
  var o = document.getElementById('bbdOverlay');
  if (o) o.remove();
}

/* ── Helpers ── */
function _bbdEsc(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _bbdBranch(id) {
  if (typeof BIZ_BRANCHES === 'undefined') return null;
  for (var i = 0; i < BIZ_BRANCHES.length; i++) {
    if (BIZ_BRANCHES[i].id === id) return BIZ_BRANCHES[i];
  }
  return null;
}

function _bbdGate(id) {
  return (BIZ_BRANCH_DELETION_GATE && BIZ_BRANCH_DELETION_GATE[id]) || { activeOrders:0, pendingReservations:0, undelivered:0, staff:0 };
}

/* ── Render ── */
function _bbdRender() {
  var o = document.getElementById('bbdOverlay');
  if (!o) return;
  var br = _bbdBranch(_bbd.branchId);

  var h = '<div class="bbd-header">'
    + '<div class="bbd-back" onclick="_bbdClose()">'
    + '<iconify-icon icon="solar:arrow-left-linear" style="font-size:18px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div class="bbd-title"><iconify-icon icon="solar:shop-minus-bold" style="font-size:17px;color:#EF4444"></iconify-icon>Şubeyi Kapat</div>'
    + '<div class="bbd-sub">' + (br ? _bbdEsc(br.name) : 'Şube') + '</div>'
    + '</div>'
    + '</div>'
    + '<div id="bbdBody" style="flex:1"></div>';

  o.innerHTML = h;

  var body = document.getElementById('bbdBody');
  if (body) body.innerHTML = '<div class="bbd-wrap"><div class="bbd-empty">Akış yakında...</div></div>';
}

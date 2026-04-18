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

  _bbdRenderBody();
}

function _bbdRenderBody() {
  var body = document.getElementById('bbdBody');
  if (!body) return;
  var br = _bbdBranch(_bbd.branchId);
  var g = _bbdGate(_bbd.branchId);

  // Aktif operasyon varsa blocker ekran
  var blocked = g.activeOrders > 0 || g.pendingReservations > 0 || g.undelivered > 0;

  if (blocked) {
    body.innerHTML = _bbdRenderBlocker(br, g);
    return;
  }

  body.innerHTML = '<div class="bbd-wrap"><div class="bbd-empty">Akış (P3) yakında...</div></div>';
}

function _bbdRenderBlocker(br, g) {
  var h = '<div class="bbd-wrap">';

  h += '<div class="bbd-blocker-hero">'
    + '<div class="bbd-blocker-ico"><iconify-icon icon="solar:shield-cross-bold" style="font-size:44px;color:#EF4444"></iconify-icon></div>'
    + '<div class="bbd-blocker-title">Kapatma Engellendi</div>'
    + '<div class="bbd-blocker-sub">Bu şubede devam eden operasyonlar var. Önce bunları tamamla veya iptal et.</div>'
    + '</div>';

  h += '<div class="bbd-gate-list">';
  if (g.activeOrders > 0) {
    h += _bbdGateRow('solar:bag-check-bold', '#F97316', g.activeOrders + ' aktif sipariş', 'Hazırlanıyor veya yola çıktı', 'Siparişlere Git', "if(typeof openBizLiveOrders==='function')openBizLiveOrders()");
  }
  if (g.pendingReservations > 0) {
    h += _bbdGateRow('solar:calendar-mark-bold', '#3B82F6', g.pendingReservations + ' bekleyen rezervasyon', 'Onaylanmamış masa randevusu', 'Rezervasyonlara Git', "if(typeof openBizReservations==='function')openBizReservations()");
  }
  if (g.undelivered > 0) {
    h += _bbdGateRow('solar:delivery-bold', '#8B5CF6', g.undelivered + ' teslim edilmemiş paket', 'Kuryede bekliyor', 'Kuryelere Git', "if(typeof _admToast==='function')_admToast('Kurye yönetimine yönlendiriliyor','ok')");
  }
  h += '</div>';

  // Personel bilgi kartı
  if (g.staff > 0) {
    h += '<div class="bbd-staff-info">'
      + '<iconify-icon icon="solar:users-group-rounded-bold" style="font-size:15px;color:#8B5CF6"></iconify-icon>'
      + '<span>Bu şubede <b>' + g.staff + ' personel</b> çalışıyor. Silme işlemi sonrası otomatik bilgilendirme gönderilecektir.</span>'
      + '</div>';
  }

  // Retry + vazgeç
  h += '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbdClose()">Vazgeç</button>'
    + '<button class="bbd-btn-secondary" onclick="_bbdRender()">'
    + '<iconify-icon icon="solar:refresh-linear" style="font-size:13px"></iconify-icon>Tekrar Dene</button>'
    + '</div>';

  h += '</div>';
  return h;
}

function _bbdGateRow(icon, color, title, sub, btnLbl, btnAction) {
  return '<div class="bbd-gate-row">'
    + '<div class="bbd-gate-ico" style="background:' + color + '15;color:' + color + '">'
    + '<iconify-icon icon="' + icon + '" style="font-size:20px"></iconify-icon>'
    + '</div>'
    + '<div style="flex:1;min-width:0">'
    + '<div class="bbd-gate-title">' + _bbdEsc(title) + '</div>'
    + '<div class="bbd-gate-sub">' + _bbdEsc(sub) + '</div>'
    + '</div>'
    + '<button class="bbd-gate-btn" style="color:' + color + '" onclick="_bbdClose();' + btnAction + '">'
    + _bbdEsc(btnLbl) + ' <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div>';
}

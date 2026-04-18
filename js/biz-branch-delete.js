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

  body.innerHTML = _bbdRenderFlow();
}

/* ═══ P3 — 3-Step Flow ═══ */
function _bbdRenderFlow() {
  var br = _bbdBranch(_bbd.branchId);
  var titles = ['Kapatma Sebebi', 'Şifre Doğrulama', 'SMS Doğrulama', 'Tamamlandı'];

  var h = '<div class="bbd-wrap">';

  // Şube özet kartı
  if (br) {
    h += '<div class="bbd-br-summary">'
      + '<iconify-icon icon="solar:shop-bold" style="font-size:18px;color:#F97316"></iconify-icon>'
      + '<div style="flex:1"><div class="bbd-br-name">' + _bbdEsc(br.name) + '</div>'
      + '<div class="bbd-br-addr">' + _bbdEsc(br.address || '') + '</div></div>'
      + '</div>';
  }

  // Step dots
  h += '<div class="bbd-steps">';
  for (var i = 1; i <= 3; i++) {
    h += '<div class="bbd-step' + (i < _bbd.step ? ' done' : i === _bbd.step ? ' active' : '') + '">'
      + '<div class="bbd-step-num">' + (i < _bbd.step ? '<iconify-icon icon="solar:check-bold" style="font-size:12px"></iconify-icon>' : i) + '</div>'
      + '<div class="bbd-step-lbl">' + titles[i-1] + '</div>'
      + '</div>';
  }
  h += '</div>';

  if (_bbd.step === 1) h += _bbdStep1();
  else if (_bbd.step === 2) h += _bbdStep2();
  else if (_bbd.step === 3) h += _bbdStep3();

  h += '</div>';
  return h;
}

function _bbdStep1() {
  var h = '<div class="bbd-step-body">';
  h += '<div class="bbd-step-intro"><b>Neden kapatıyorsun?</b> Cevabın gelişim için bize ışık tutar.</div>';
  h += '<div class="bbd-reason-grid">';
  for (var i = 0; i < BIZ_DELETE_REASONS.length; i++) {
    var r = BIZ_DELETE_REASONS[i];
    var sel = !!_bbd.selectedReasons[r.id];
    h += '<div class="bbd-chip' + (sel ? ' selected' : '') + '" onclick="_bbdToggleReason(\'' + r.id + '\')">'
      + '<iconify-icon icon="' + r.icon + '" style="font-size:14px"></iconify-icon>'
      + '<span>' + _bbdEsc(r.label) + '</span>'
      + (sel ? '<iconify-icon icon="solar:check-circle-bold" style="font-size:14px;color:#10B981"></iconify-icon>' : '')
      + '</div>';
  }
  h += '</div>';

  h += '<textarea class="bbd-note" maxlength="200" placeholder="(Opsiyonel) Daha fazla detay..." '
    + 'oninput="_bbd.note=this.value">' + _bbdEsc(_bbd.note) + '</textarea>';

  // Onay modal metni
  h += '<div class="bbd-info-box">'
    + '<iconify-icon icon="solar:info-circle-bold" style="font-size:14px;color:#3B82F6"></iconify-icon>'
    + '<span>Bu şube kapatıldığında <b>şubeye bağlı menüler, garsonlar ve çalışma saatleri</b> yayından kaldırılacaktır. <b>30 gün</b> içinde geri alabilirsiniz.</span>'
    + '</div>';

  var valid = Object.keys(_bbd.selectedReasons).filter(function(k){ return _bbd.selectedReasons[k]; }).length > 0;
  h += '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbdClose()">Vazgeç</button>'
    + '<button class="bbd-btn-danger' + (valid ? '' : ' disabled') + '"' + (valid ? ' onclick="_bbd.step=2;_bbdRenderBody()"' : '') + '>'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div>';
  h += '</div>';
  return h;
}

function _bbdToggleReason(id) {
  _bbd.selectedReasons[id] = !_bbd.selectedReasons[id];
  _bbdRenderBody();
}

function _bbdStep2() {
  var h = '<div class="bbd-step-body bbd-step-body--center">'
    + '<div class="bbd-verify-ico"><iconify-icon icon="solar:lock-keyhole-bold" style="font-size:38px;color:#8B5CF6"></iconify-icon></div>'
    + '<div class="bbd-verify-title">Şifre Doğrulama</div>'
    + '<div class="bbd-verify-sub">Hesap sahibi olduğunu doğrulamak için işletme şifreni gir.</div>'
    + '<input type="password" class="bbd-input" placeholder="İşletme şifresi" value="' + _bbdEsc(_bbd.password) + '" '
    + 'oninput="_bbd.password=this.value" id="bbdPwd">'
    + '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbd.step=1;_bbdRenderBody()">Geri</button>'
    + '<button class="bbd-btn-danger" onclick="if(_bbd.password.length>=4){_bbd.step=3;_bbdRenderBody()}else if(typeof _admToast===\'function\')_admToast(\'Şifre en az 4 karakter\',\'err\')">'
    + 'Devam Et <iconify-icon icon="solar:alt-arrow-right-linear" style="font-size:13px"></iconify-icon></button>'
    + '</div></div>';
  return h;
}

function _bbdStep3() {
  var h = '<div class="bbd-step-body bbd-step-body--center">'
    + '<div class="bbd-verify-ico"><iconify-icon icon="solar:shield-keyhole-bold" style="font-size:38px;color:#EF4444"></iconify-icon></div>'
    + '<div class="bbd-verify-title">SMS Doğrulama</div>'
    + '<div class="bbd-verify-sub">+90 *** *** ** 42 numaralı telefona gönderilen 6 haneli kodu gir.</div>'
    + '<input type="text" class="bbd-input bbd-otp-input" maxlength="6" placeholder="• • • • • •" value="' + _bbdEsc(_bbd.otp) + '" '
    + 'oninput="_bbd.otp=this.value.replace(/\\D/g,\'\');this.value=_bbd.otp" id="bbdOtp">'
    + '<button class="bbd-btn-link" onclick="if(typeof _admToast===\'function\')_admToast(\'Kod yeniden gönderildi\',\'ok\')">Kodu Yeniden Gönder</button>'
    + '<div class="bbd-footer">'
    + '<button class="bbd-btn-ghost" onclick="_bbd.step=2;_bbdRenderBody()">Geri</button>'
    + '<button class="bbd-btn-danger" onclick="if(_bbd.otp.length===6){_bbdCompleteBranchDeletion()}else if(typeof _admToast===\'function\')_admToast(\'6 haneli kodu tam gir\',\'err\')">'
    + '<iconify-icon icon="solar:trash-bin-trash-bold" style="font-size:13px"></iconify-icon>Şubeyi Kapat</button>'
    + '</div></div>';
  return h;
}

function _bbdCompleteBranchDeletion() {
  if (typeof _admToast === 'function') _admToast('Başarı akışı (P4) yakında...', 'ok');
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
